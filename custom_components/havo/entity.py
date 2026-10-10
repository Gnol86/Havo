"""Stable ventilation entities with dynamic platform reconciliation."""

from homeassistant.core import callback
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity import DeviceInfo, Entity
from homeassistant.helpers.entity_platform import async_get_current_platform

from .const import DOMAIN, NAME


class HavoEntity(Entity):
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, manager, vent_id, key):
        self.manager, self.vent_id = manager, vent_id
        self._attr_unique_id = f"{vent_id}_{key}"

    @property
    def available(self):
        return self.vent_id in self.manager.vents()

    @property
    def device_info(self):
        room_id, vent = self.manager.vent(self.vent_id)
        room = ar.async_get(self.manager.hass).async_get_area(room_id)
        return DeviceInfo(
            identifiers={(DOMAIN, self.vent_id)},
            name=vent["name"] or vent["entity_id"],
            manufacturer=NAME,
            model=NAME,
            entry_type=dr.DeviceEntryType.SERVICE,
            suggested_area=room.name if room else None,
        )

    async def async_added_to_hass(self):
        self.async_on_remove(self.manager.listen(self._updated))
        self._updated()

    @callback
    def _updated(self):
        if self.available:
            room_id, vent = self.manager.vent(self.vent_id)
            registry = dr.async_get(self.hass)
            if device := registry.async_get_device_by_identifier(
                (DOMAIN, self.vent_id), self.manager.entry.entry_id
            ):
                area = ar.async_get(self.hass).async_get_area(room_id)
                name = vent["name"] or vent["entity_id"]
                if device.name != name or (area and device.area_id != room_id):
                    registry.async_update_device(
                        device.id, name=name, area_id=room_id if area else None
                    )
            self.async_write_ha_state()


async def setup_entities(hass, entry, async_add_entities, factory, key):
    manager = entry.runtime_data
    platform = async_get_current_platform()
    registry = er.async_get(hass)
    entities = {}
    task = None
    stopped = False

    async def reconcile():
        nonlocal task
        try:
            desired = set(manager.vents())
            for registered in list(
                er.async_entries_for_config_entry(registry, entry.entry_id)
            ):
                if (
                    registered.domain == platform.domain
                    and registered.unique_id not in {f"{vid}_{key}" for vid in desired}
                ):
                    if registered.entity_id in platform.entities:
                        await platform.async_remove_entity(registered.entity_id)
                    registry.async_remove(registered.entity_id)
            for vid in set(entities) - desired:
                entities.pop(vid)
            additions = []
            for vid in desired - entities.keys():
                entities[vid] = entity = factory(manager, vid)
                additions.append(entity)
            if additions and not stopped:
                await platform.async_add_entities(additions)
        finally:
            task = None
            if not stopped and set(entities) != set(manager.vents()):
                updated()

    @callback
    def updated():
        nonlocal task
        if (task is None or task.done()) and not stopped:
            task = hass.async_create_task(reconcile())

    @callback
    def stop():
        nonlocal stopped
        stopped = True
        remove()
        if task:
            task.cancel()

    remove = manager.listen(updated)
    entry.async_on_unload(stop)
    await reconcile()
