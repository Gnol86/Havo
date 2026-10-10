"""Automation toggle for each ventilation."""

from homeassistant.components.switch import SwitchEntity

from .entity import HavoEntity, setup_entities


async def async_setup_entry(hass, entry, async_add_entities):
    await setup_entities(
        hass, entry, async_add_entities, AutomationSwitch, "automation"
    )


class AutomationSwitch(HavoEntity, SwitchEntity):
    _attr_translation_key = "automation"
    _attr_icon = "mdi:fan-auto"

    def __init__(self, manager, vent_id):
        super().__init__(manager, vent_id, "automation")

    @property
    def is_on(self):
        return self.manager.vent(self.vent_id)[1]["enabled"]

    async def async_turn_on(self, **kwargs):
        await self.manager.command(self.vent_id, "automation", True, self._context)

    async def async_turn_off(self, **kwargs):
        await self.manager.command(self.vent_id, "automation", False, self._context)
