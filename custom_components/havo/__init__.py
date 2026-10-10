"""Havo: capability-aware ventilation orchestration and embedded panel."""

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN, STORAGE_VERSION
from .manager import HavoManager
from .panel import async_register_panel, async_remove_panel
from .websocket import async_register

PLATFORMS = (Platform.SWITCH, Platform.BUTTON, Platform.SENSOR)
type HavoConfigEntry = ConfigEntry[HavoManager]


async def async_setup_entry(hass: HomeAssistant, entry: HavoConfigEntry) -> bool:
    data = hass.data.setdefault(DOMAIN, {})
    manager = entry.runtime_data = HavoManager(hass, entry)
    try:
        data["manager"] = manager
        await manager.load()
        if not data.get("websocket_registered"):
            async_register(hass)
            data["websocket_registered"] = True
        await async_register_panel(hass)
        await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    except Exception:
        await manager.stop()
        data.pop("manager", None)
        async_remove_panel(hass)
        raise
    manager.notify()
    return True


async def async_unload_entry(hass: HomeAssistant, entry: HavoConfigEntry) -> bool:
    if unloaded := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        await entry.runtime_data.stop()
        hass.data[DOMAIN].pop("manager", None)
        async_remove_panel(hass)
    return unloaded


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await Store(hass, STORAGE_VERSION, f"{DOMAIN}.{entry.entry_id}").async_remove()
