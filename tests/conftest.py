"""Real HA lifecycle with local, deterministic fan service doubles."""

from copy import deepcopy

import pytest
from homeassistant.components.fan import FanEntityFeature
from homeassistant.helpers import area_registry as ar
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.havo.models import ROOM_DEFAULTS, VENT_DEFAULTS, default_config


@pytest.fixture(autouse=True)
def enable_havo(enable_custom_integrations):
    """Discover this custom integration in Home Assistant."""


@pytest.fixture
def config():
    value = default_config()
    value["rooms"]["bathroom"] = deepcopy(ROOM_DEFAULTS) | {
        "temperature_entity_id": "sensor.indoor_temperature",
        "humidity_entity_id": "sensor.indoor_humidity",
        "ventilations": {
            "extractor": VENT_DEFAULTS
            | {"entity_id": "fan.extractor", "name": "Extractor"}
        },
    }
    return value


@pytest.fixture
async def house(hass, config):
    entry = MockConfigEntry(domain="havo", title="Havo", unique_id="havo", data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    ar.async_get(hass).async_create("Bathroom")
    features = int(FanEntityFeature.TURN_ON | FanEntityFeature.TURN_OFF)
    hass.states.async_set("fan.extractor", "off", {"supported_features": features})
    hass.states.async_set(
        "sensor.indoor_temperature", "22", {"unit_of_measurement": "°C"}
    )
    hass.states.async_set("sensor.indoor_humidity", "50", {"unit_of_measurement": "%"})
    calls = []

    async def fan_service(call):
        data = dict(call.data)
        calls.append((call.service, data))
        state = hass.states.get(data["entity_id"])
        attrs = dict(state.attributes)
        on = call.service != "turn_off"
        if call.service == "set_percentage":
            assert attrs["supported_features"] & FanEntityFeature.SET_SPEED
            attrs["percentage"] = data["percentage"]
            attrs["preset_mode"] = None
        elif "percentage" in attrs:
            attrs["percentage"] = (attrs.get("percentage") or 50) if on else 0
        hass.states.async_set(
            data["entity_id"], "on" if on else "off", attrs, context=call.context
        )

    for service in ("turn_on", "turn_off", "set_percentage"):
        hass.services.async_register("fan", service, fan_service)
    manager = entry.runtime_data
    await manager.save(config, 0)
    await hass.async_block_till_done()
    yield manager, calls
    if hass.config_entries.async_get_entry(entry.entry_id):
        await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
