"""Resume automation without waiting for the manual hold deadline."""

from homeassistant.components.button import ButtonEntity

from .entity import HavoEntity, setup_entities


async def async_setup_entry(hass, entry, async_add_entities):
    await setup_entities(hass, entry, async_add_entities, ResumeButton, "resume")


class ResumeButton(HavoEntity, ButtonEntity):
    _attr_translation_key = "resume"
    _attr_icon = "mdi:play-circle-outline"

    def __init__(self, manager, vent_id):
        super().__init__(manager, vent_id, "resume")

    async def async_press(self):
        await self.manager.command(self.vent_id, "resume", context=self._context)
