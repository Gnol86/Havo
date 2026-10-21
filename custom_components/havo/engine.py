"""One independent, serialized controller for each configured ventilation."""

import asyncio
from datetime import timedelta

from homeassistant.core import Context, CoreState, callback
from homeassistant.helpers.event import (
    async_track_state_change_event,
    async_track_time_interval,
)
from homeassistant.helpers.start import async_at_started
from homeassistant.util import dt as dt_util

from .activity import async_record_command
from .climate import evaluate
from .fans import capabilities, percentage, signature


class VentilationEngine:
    def __init__(self, manager, vent_id):
        self.manager, self.hass, self.id = manager, manager.hass, vent_id
        self.runtime = manager.runtime.setdefault(vent_id, {})
        self.status = {"reason": "disabled"}
        self._lock = asyncio.Lock()
        self._remove = []
        self._timer = None
        self._stopped = False
        self._generation = 0
        self._contexts = {}
        self._expected = None
        self._retry_at = 0
        self._runtime_dirty = False

    @property
    def config(self):
        return self.manager.vent(self.id)[1]

    async def start(self):
        if self.hass.state is not CoreState.running:
            self._remove.append(async_at_started(self.hass, self._tick))
        self._remove.append(
            async_track_state_change_event(
                self.hass, self.manager.dependencies(self.id), self._changed
            )
        )
        self._remove.append(
            async_track_time_interval(self.hass, self._tick, timedelta(seconds=30))
        )
        await self.evaluate()

    async def stop(self):
        self._stopped = True
        self._generation += 1
        for remove in self._remove:
            remove()
        self._remove.clear()
        if self._timer:
            self._timer.cancel()
            self._timer = None
        async with self._lock:
            pass

    async def _tick(self, _now):
        await self.evaluate()

    def _schedule(self, deadline):
        if self._timer:
            self._timer.cancel()
        self._timer = None
        if deadline and not self._stopped:
            delay = max(0.05, deadline - dt_util.utcnow().timestamp())

            @callback
            def wake():
                self._timer = None
                self.hass.async_create_task(self.evaluate())

            self._timer = self.hass.loop.call_later(delay, wake)

    async def _changed(self, event):
        if self._stopped:
            return
        old, new = event.data.get("old_state"), event.data.get("new_state")
        if event.data["entity_id"] == self.config["entity_id"]:
            now = dt_util.utcnow().timestamp()
            self._contexts = {
                key: expiry for key, expiry in self._contexts.items() if expiry > now
            }
            context = new.context if new else None
            own = context and (
                context.id in self._contexts or context.parent_id in self._contexts
            )
            # Accept bounded acknowledgements when an integration drops the context.
            if not own and context and context.user_id is None and self._expected:
                until, target = self._expected
                if until > now and new and new.state == ("on" if target else "off"):
                    actual = new.attributes.get("percentage")
                    own = target == -1 or target == 0 or actual == target
            old_caps, new_caps = capabilities(old), capabilities(new)
            meaningful_change = bool(
                old
                and new
                and (
                    old.state != new.state
                    or (
                        old_caps.speed
                        and new_caps.speed
                        and old.attributes.get("percentage")
                        != new.attributes.get("percentage")
                    )
                    or (
                        old_caps.presets
                        and new_caps.presets
                        and old.attributes.get("preset_mode")
                        != new.attributes.get("preset_mode")
                    )
                )
            )
            if (
                signature(old) is not None
                and signature(new) is not None
                and meaningful_change
                and not own
            ):
                await self.pause()
        await self.evaluate()

    async def pause(self):
        self._generation += 1
        self._clear_humidity_timeout()
        self.runtime["pause_until"] = (
            dt_util.utcnow().timestamp() + self.config["manual_pause"]
        )
        await self.manager.persist()

    def _clear_humidity_timeout(self):
        """Discard a period that no longer represents automatic extraction."""
        self.runtime.pop("humidity_below_start_since", None)
        self.runtime.pop("humidity_timeout_reached", None)

    async def resume(self):
        self._generation += 1
        self.runtime.pop("pause_until", None)
        await self.manager.persist()
        await self.evaluate()

    async def issue(self, command, target=None, context=None, *, reason):
        """Issue one capability-checked call, shared by manual and automatic paths."""
        state = self.hass.states.get(self.config["entity_id"])
        caps = capabilities(state)
        if not caps.available:
            raise ValueError("fan_unavailable")
        data = {"entity_id": self.config["entity_id"]}
        if command == "turn_off":
            if not caps.turn_off:
                raise ValueError("off_unsupported")
            expected = 0
        elif command == "turn_on":
            if not caps.turn_on:
                raise ValueError("on_unsupported")
            expected = -1
        elif command == "set_percentage":
            target = percentage(target, caps)
            data["percentage"] = target
            expected = target
        else:
            raise ValueError("invalid_command")
        # Keep the human caller and lineage while giving each Havo request its
        # own origin, even if the caller's context already has an origin event.
        call_context = Context(
            parent_id=context.id if context else None,
            user_id=context.user_id if context else None,
        )
        now = dt_util.utcnow().timestamp()
        self._contexts[call_context.id] = now + 30
        self._expected = now + 15, expected
        async_record_command(
            self.hass,
            call_context,
            data["entity_id"],
            command,
            reason,
            data.get("percentage"),
        )
        try:
            async with asyncio.timeout(10):
                await self.hass.services.async_call(
                    "fan", command, data, blocking=True, context=call_context
                )
        except Exception:
            self._expected = None
            async_record_command(
                self.hass,
                call_context,
                data["entity_id"],
                command,
                reason,
                data.get("percentage"),
                failed=True,
            )
            raise

    async def manual(self, command, target=None, context=None):
        # Publish the hold before waiting for any earlier automatic service call.
        await self.pause()
        async with self._lock:
            await self.issue(command, target, context, reason="manual")
        await self.evaluate()

    async def evaluate(self):
        async with self._lock:
            if self._stopped:
                return
            if self.hass.state is not CoreState.running:
                self.status = {"reason": "initializing"}
                return
            now = dt_util.utcnow().timestamp()
            previous_runtime = self.runtime.copy()
            vent = self.config
            readings = self.manager.readings(self.id)
            state = self.hass.states.get(vent["entity_id"])
            caps = capabilities(state)
            active = bool(self.runtime.get("active", False))
            decision = evaluate(vent, readings, active)
            self.status = {
                "reason": "idle",
                "readings": readings,
                "decision": decision.as_dict(),
                "capabilities": caps.as_dict(),
                "state": state.state if state else "unavailable",
                "percentage": state.attributes.get("percentage") if state else None,
                "pause_until": self.runtime.get("pause_until"),
                "deadline": None,
                "humidity_timeout_at": None,
                "target_percentage": None,
            }
            humidity_timeout_at = None
            timeout_allowed = (
                vent["enabled"]
                and vent["mode"] == "humidity"
                and vent["humidity_timeout_enabled"]
                and self.runtime.get("pause_until", 0) <= now
                and decision.valid
                and caps.available
                and not (vent["background"] and not caps.speed)
            )
            if (
                not timeout_allowed
                or readings["humidity"] >= decision.on
                or readings["humidity"] <= decision.off
            ):
                self._clear_humidity_timeout()
            elif active and state.state == "on":
                since = self.runtime.setdefault("humidity_below_start_since", now)
                # The limit never overrides the minimum automatic running time.
                humidity_timeout_at = max(
                    since + vent["humidity_timeout"],
                    self.runtime.get("changed_at", 0) + vent["min_on"],
                )
                self.status["humidity_timeout_at"] = humidity_timeout_at
            else:
                self.runtime.pop("humidity_below_start_since", None)
            timeout_due = humidity_timeout_at is not None and humidity_timeout_at <= now
            deadline = None
            if not vent["enabled"]:
                self.status["reason"] = "disabled"
            elif (until := self.runtime.get("pause_until", 0)) > now:
                self.status["reason"], deadline = "manual_pause", until
            elif not caps.available:
                self.status["reason"] = "fan_unavailable"
            elif vent["background"] and not caps.speed:
                self.status["reason"] = "speed_unsupported"
            elif not decision.valid:
                self.status["reason"] = "sensor_unavailable"
            elif self._retry_at > now:
                self.status["reason"], deadline = "command_failed", self._retry_at
            else:
                desired = False if timeout_due else decision.active
                changed_at = self.runtime.get("changed_at", 0)
                minimum = vent["min_on"] if active else vent["min_off"]
                if desired != active and changed_at + minimum > now:
                    desired, deadline = active, changed_at + minimum
                    self.status["reason"] = "minimum_run" if active else "minimum_rest"
                else:
                    self.status["reason"] = (
                        "humidity_timeout"
                        if not desired
                        and (
                            timeout_due or self.runtime.get("humidity_timeout_reached")
                        )
                        else "temperature"
                        if desired and vent["mode"] == "temperature"
                        else "humidity"
                        if desired
                        else "background"
                        if vent["background"]
                        else "idle"
                    )
                target = (
                    (
                        vent["speed_min"]
                        + decision.demand * (vent["speed_max"] - vent["speed_min"])
                    )
                    if desired
                    else vent["background"]
                )
                if caps.speed and target:
                    target = percentage(
                        target,
                        caps,
                        vent["speed_min"] if desired else 1,
                        vent["speed_max"],
                    )
                    self.status["target_percentage"] = target
                generation = self._generation
                reason = self.status["reason"]
                try:
                    if target == 0:
                        if state.state != "off":
                            await self.issue("turn_off", reason=reason)
                    elif caps.speed:
                        if (
                            state.state != "on"
                            or state.attributes.get("percentage") != target
                            or state.attributes.get("preset_mode")
                        ):
                            await self.issue("set_percentage", target, reason=reason)
                    elif state.state != "on":
                        await self.issue("turn_on", reason=reason)
                    if generation == self._generation and not self._stopped:
                        if desired != active:
                            self.runtime.update(active=desired, changed_at=now)
                        if timeout_due and not desired:
                            self.runtime["humidity_timeout_reached"] = True
                            self.runtime.pop("humidity_below_start_since", None)
                            self.status["humidity_timeout_at"] = None
                        self._retry_at = 0
                except ValueError as err:
                    self.status["reason"] = str(err)
                except (
                    Exception
                ):  # An offline integration must not terminate the engine.
                    self.status["reason"] = "command_failed"
                    self._retry_at = deadline = now + 30
                if generation != self._generation:
                    self.status["reason"] = "manual_pause"
                    self.status["pause_until"] = self.runtime.get("pause_until")
                    deadline = self.runtime.get("pause_until")
                    self.status["humidity_timeout_at"] = None
            self._runtime_dirty |= self.runtime != previous_runtime
            if self._runtime_dirty and self._retry_at <= now:
                try:
                    await self.manager.persist()
                    self._runtime_dirty = False
                except Exception:
                    self.status["reason"] = "command_failed"
                    self._retry_at = deadline = now + 30
            # Expose the humidity deadline separately from holds/minimum times.
            wake_at = deadline
            if (
                self.status["humidity_timeout_at"] is not None
                and self.status["humidity_timeout_at"] > now
            ):
                wake_at = min(wake_at or float("inf"), humidity_timeout_at)
            self.status["deadline"] = deadline
            self._schedule(wake_at)
            self.manager.notify()
