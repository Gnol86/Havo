"""Configuration, readings, authenticated snapshots and controller lifecycle."""

import asyncio
from copy import deepcopy

from homeassistant.auth.permissions.const import POLICY_CONTROL, POLICY_READ
from homeassistant.core import Context, callback
from homeassistant.exceptions import HomeAssistantError, Unauthorized
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.storage import Store

from .climate import finite, temperature
from .const import DOMAIN, STORAGE_VERSION
from .engine import VentilationEngine
from .fans import capabilities
from .models import default_config, number, validate_config


class HavoError(HomeAssistantError):
    def __init__(self, code, message=None):
        super().__init__(message or code)
        self.code = code


class HavoManager:
    def __init__(self, hass, entry):
        self.hass, self.entry = hass, entry
        self.config, self.runtime, self.engines = default_config(), {}, {}
        self.revision = 0
        self._store = Store(
            hass, STORAGE_VERSION, f"{DOMAIN}.{entry.entry_id}", atomic_writes=True
        )
        self._save_lock, self._store_lock = asyncio.Lock(), asyncio.Lock()
        self._listeners, self._removers = set(), []

    def vents(self):
        return {
            vid: (rid, config)
            for rid, room in self.config["rooms"].items()
            for vid, config in room["ventilations"].items()
        }

    def vent(self, vent_id):
        try:
            return self.vents()[vent_id]
        except KeyError as err:
            raise HavoError("not_found") from err

    async def load(self):
        if stored := await self._store.async_load():
            self.config = validate_config(stored["config"])
            self.runtime, self.revision = (
                stored.get("runtime", {}),
                stored.get("revision", 0),
            )
        else:
            await self.persist()
        await self._start_engines()
        for event in (
            ar.EVENT_AREA_REGISTRY_UPDATED,
            er.EVENT_ENTITY_REGISTRY_UPDATED,
            dr.EVENT_DEVICE_REGISTRY_UPDATED,
        ):
            self._removers.append(
                self.hass.bus.async_listen(event, self._registry_changed)
            )

    @callback
    def _registry_changed(self, event):
        self.notify()

    async def _start_engines(self):
        for vent_id in self.vents():
            engine = self.engines[vent_id] = VentilationEngine(self, vent_id)
            await engine.start()

    async def stop(self):
        for remove in self._removers:
            remove()
        self._removers.clear()
        for engine in self.engines.values():
            await engine.stop()
        self.engines.clear()

    async def persist(self):
        async with self._store_lock:
            await self._store.async_save(
                {
                    "config": deepcopy(self.config),
                    "revision": self.revision,
                    "runtime": deepcopy(self.runtime),
                }
            )

    async def save(self, config, revision):
        candidate = validate_config(config)
        async with self._save_lock:
            if type(revision) is not int or revision != self.revision:
                raise HavoError("conflict")
            # Reject newly enabled background flow on known non-modulating devices.
            old = self.vents()
            for room in candidate["rooms"].values():
                for vid, vent in room["ventilations"].items():
                    caps = capabilities(self.hass.states.get(vent["entity_id"]))
                    previous = old.get(vid, (None, {}))[1]
                    if (
                        vent["background"]
                        and not caps.speed
                        and (
                            previous.get("background") != vent["background"]
                            or previous.get("entity_id") != vent["entity_id"]
                        )
                    ):
                        raise HavoError("speed_unsupported")
            # Stop old subscriptions first so only one engine can own each fan.
            for engine in self.engines.values():
                await engine.stop()
            self.engines.clear()
            previous_config, previous_runtime = self.config, deepcopy(self.runtime)
            self.config = candidate
            self.runtime = {
                vid: data
                for vid, data in self.runtime.items()
                if vid in self.vents()
                and old.get(vid, (None, {}))[1].get("entity_id")
                == self.vent(vid)[1]["entity_id"]
            }
            # Unrelated edits keep elapsed time; a new rule/source starts afresh.
            for vid, runtime in self.runtime.items():
                old_room_id, old_vent = old[vid]
                room_id, vent = self.vent(vid)
                if (
                    any(
                        old_vent[key] != vent[key]
                        for key in (
                            "enabled",
                            "mode",
                            "humidity_on",
                            "humidity_hysteresis",
                            "humidity_timeout_enabled",
                            "humidity_timeout",
                        )
                    )
                    or any(
                        previous_config["rooms"][old_room_id][key]
                        != candidate["rooms"][room_id][key]
                        for key in ("temperature_entity_id", "humidity_entity_id")
                    )
                    or any(
                        previous_config[key] != candidate[key]
                        for key in (
                            "weather_entity_id",
                            "outdoor_temperature_entity_id",
                            "outdoor_humidity_entity_id",
                        )
                    )
                ):
                    runtime.pop("humidity_below_start_since", None)
                    runtime.pop("humidity_timeout_reached", None)
            self.revision += 1
            try:
                await self.persist()
            except Exception:
                self.config, self.runtime = previous_config, previous_runtime
                self.revision -= 1
                await self._start_engines()
                raise
            await self._start_engines()
            self.notify()

    def dependencies(self, vent_id):
        room_id, vent = self.vent(vent_id)
        room = self.config["rooms"][room_id]
        return list(
            {
                value
                for value in (
                    vent["entity_id"],
                    room["temperature_entity_id"],
                    room["humidity_entity_id"],
                    self.config["weather_entity_id"],
                    self.config["outdoor_temperature_entity_id"],
                    self.config["outdoor_humidity_entity_id"],
                )
                if value
            }
        )

    def _read(self, entity_id, kind, weather=False):
        state = self.hass.states.get(entity_id) if entity_id else None
        if state is None or state.state in ("unknown", "unavailable"):
            return None
        value = state.attributes.get(kind) if weather else state.state
        if kind == "temperature":
            unit = state.attributes.get(
                "temperature_unit" if weather else "unit_of_measurement"
            )
            return temperature(value, unit)
        if not weather and state.attributes.get("unit_of_measurement") != "%":
            return None
        return finite(value, 0, 100)

    def readings(self, vent_id):
        room_id, _vent = self.vent(vent_id)
        room = self.config["rooms"][room_id]
        result, sources = {}, {}
        for kind in ("temperature", "humidity"):
            sensor = room[f"{kind}_entity_id"]
            result[kind], sources[kind] = self._read(sensor, kind), sensor
            dedicated = self.config[f"outdoor_{kind}_entity_id"]
            value = self._read(dedicated, kind)
            source = dedicated
            if value is None:
                source = self.config["weather_entity_id"]
                value = self._read(source, kind, weather=True)
            result[f"outdoor_{kind}"], sources[f"outdoor_{kind}"] = (
                value,
                source if value is not None else None,
            )
        return result | {"sources": sources}

    @callback
    def listen(self, listener):
        self._listeners.add(listener)
        return lambda: self._listeners.discard(listener)

    @callback
    def notify(self):
        self.hass.bus.async_fire("havo_updated")
        for listener in tuple(self._listeners):
            listener()

    def allowed(self, user, entity_id, permission=POLICY_READ):
        return (
            user is None
            or user.is_admin
            or user.permissions.check_entity(entity_id, permission)
        )

    def check_control(self, user, vent_id):
        entity_id = self.vent(vent_id)[1]["entity_id"]
        if not self.allowed(user, entity_id, POLICY_CONTROL):
            raise Unauthorized()

    async def command(self, vent_id, command, value=None, context=None):
        context = context or Context()
        if context.user_id:
            user = await self.hass.auth.async_get_user(context.user_id)
            if user is None:
                raise Unauthorized()
            self.check_control(user, vent_id)
        self.vent(vent_id)
        engine = self.engines[vent_id]
        if command == "resume":
            await engine.resume()
        elif command == "automation":
            if type(value) is not bool:
                raise ValueError("Expected boolean")
            # Acquire the configuration lock through save; concurrent edits conflict.
            config = deepcopy(self.config)
            room_id, _vent = self.vent(vent_id)
            config["rooms"][room_id]["ventilations"][vent_id]["enabled"] = value
            await self.save(config, self.revision)
        elif command in ("turn_on", "turn_off", "set_percentage"):
            if command == "set_percentage":
                number(value, 1, 100)
            await engine.manual(command, value, context)
        else:
            raise HavoError("invalid_command")

    def snapshot(self, user):
        areas = ar.async_get(self.hass)
        registry, devices = er.async_get(self.hass), dr.async_get(self.hass)
        visible = {
            vid
            for vid in self.vents()
            if all(self.allowed(user, entity) for entity in self.dependencies(vid))
        }
        config = deepcopy(self.config)
        for room in config["rooms"].values():
            room["ventilations"] = {
                vid: vent
                for vid, vent in room["ventilations"].items()
                if vid in visible
            }
        if user and not user.is_admin:
            config["rooms"] = {
                rid: room
                for rid, room in config["rooms"].items()
                if room["ventilations"]
            }
            for key in (
                "weather_entity_id",
                "outdoor_temperature_entity_id",
                "outdoor_humidity_entity_id",
            ):
                if config[key] and not self.allowed(user, config[key]):
                    config[key] = None
        catalog = []
        for state in self.hass.states.async_all():
            domain = state.domain
            if domain not in ("fan", "sensor", "weather") or not self.allowed(
                user, state.entity_id
            ):
                continue
            if (
                entry := registry.async_get(state.entity_id)
            ) and entry.platform == DOMAIN:
                continue
            device = (
                devices.async_get(entry.device_id)
                if entry and entry.device_id
                else None
            )
            catalog.append(
                {
                    "entity_id": state.entity_id,
                    "name": state.name,
                    "domain": domain,
                    "area_id": (entry.area_id if entry else None)
                    or (device.area_id if device else None),
                    "unit": state.attributes.get("unit_of_measurement"),
                    "device_class": state.attributes.get("device_class"),
                    "capabilities": capabilities(state).as_dict()
                    if domain == "fan"
                    else None,
                }
            )
        return {
            "revision": self.revision,
            "config": config,
            "admin": user is None or user.is_admin,
            "areas": [
                {"id": area.id, "name": area.name} for area in areas.async_list_areas()
            ],
            "entities": catalog,
            "status": {
                vid: deepcopy(engine.status)
                for vid, engine in self.engines.items()
                if vid in visible
            },
            "controllable": [
                vid
                for vid in visible
                if self.allowed(user, self.vent(vid)[1]["entity_id"], POLICY_CONTROL)
            ],
        }
