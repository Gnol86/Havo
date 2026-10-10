"""Explain decisions and expose actual readings for native HA dashboards."""

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity

from .entity import HavoEntity, setup_entities

REASONS = [
    "initializing",
    "disabled",
    "idle",
    "background",
    "temperature",
    "humidity",
    "manual_pause",
    "minimum_run",
    "minimum_rest",
    "fan_unavailable",
    "sensor_unavailable",
    "speed_unsupported",
    "on_unsupported",
    "off_unsupported",
    "command_failed",
]


async def async_setup_entry(hass, entry, async_add_entities):
    await setup_entities(hass, entry, async_add_entities, VentilationStatus, "status")


class VentilationStatus(HavoEntity, SensorEntity):
    _attr_translation_key = "status"
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = REASONS
    _attr_icon = "mdi:fan"

    def __init__(self, manager, vent_id):
        super().__init__(manager, vent_id, "status")

    @property
    def native_value(self):
        engine = self.manager.engines.get(self.vent_id)
        return engine.status["reason"] if engine else None

    @property
    def extra_state_attributes(self):
        engine = self.manager.engines.get(self.vent_id)
        return engine.status.copy() if engine else {}
