"""Lifecycle, persistence, isolation and authenticated API coverage."""

from copy import deepcopy
from types import SimpleNamespace
from unittest.mock import patch

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.config_entries import SOURCE_USER, ConfigEntryState
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockUser

from custom_components.havo.manager import HavoError


async def request(client, kind, **fields):
    await client.send_json_auto_id({"type": kind, **fields})
    return await client.receive_json()


async def test_config_flow_singleton(hass):
    first = await hass.config_entries.flow.async_init(
        "havo", context={"source": SOURCE_USER}
    )
    assert first["type"] is FlowResultType.FORM
    duplicate = await hass.config_entries.flow.async_init(
        "havo", context={"source": SOURCE_USER}
    )
    assert duplicate["type"] is FlowResultType.ABORT
    result = await hass.config_entries.flow.async_configure(first["flow_id"], {})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    entry = hass.config_entries.async_entries("havo")[0]
    assert entry.state is ConfigEntryState.LOADED
    assert entry.runtime_data.config["rooms"] == {}
    again = await hass.config_entries.flow.async_init(
        "havo", context={"source": SOURCE_USER}
    )
    assert again["type"] is FlowResultType.ABORT
    assert await hass.config_entries.async_remove(entry.entry_id)


async def test_bundle_is_self_contained(hass, house, hass_client):
    client = await hass_client()
    response = await client.get("/havo_frontend/havo-panel.js")
    assert response.status == 200
    assert "havo-panel" in await response.text()


async def test_dynamic_entities_removed_cleanly(hass, house):
    manager, _calls = house
    registry = er.async_get(hass)
    ids = [
        registry.async_get_entity_id(domain, "havo", f"extractor_{key}")
        for domain, key in [
            ("switch", "automation"),
            ("button", "resume"),
            ("sensor", "status"),
        ]
    ]
    assert all(ids), (
        len(manager._listeners),
        [
            (e.entity_id, e.unique_id)
            for e in er.async_entries_for_config_entry(registry, manager.entry.entry_id)
        ],
        [(s.entity_id, s.state) for s in hass.states.async_all()],
    )
    await manager.save(manager.config | {"rooms": {}}, manager.revision)
    await hass.async_block_till_done()
    assert all(registry.async_get(entity_id) is None for entity_id in ids)
    assert all(hass.states.get(entity_id) is None for entity_id in ids)


async def test_atomic_save_and_conflict(house):
    manager, _calls = house
    original = deepcopy(manager.config)
    with pytest.raises(HavoError, match="conflict"):
        await manager.save(original, 0)
    candidate = deepcopy(original)
    candidate["rooms"]["bathroom"]["ventilations"]["extractor"]["name"] = "Changed"
    with patch.object(
        manager._store, "async_save", side_effect=OSError("disk unavailable")
    ):
        with pytest.raises(OSError):
            await manager.save(candidate, manager.revision)
    assert manager.config == original
    assert "extractor" in manager.engines


async def test_saved_humidity_settings_survive_new_defaults_and_reload(hass, house):
    manager, _calls = house
    config = deepcopy(manager.config)
    settings = config["rooms"]["bathroom"]["ventilations"]["extractor"]
    settings.update(humidity_on=60, humidity_hysteresis=5, humidity_full=75)
    await manager.save(config, manager.revision)
    assert await hass.config_entries.async_reload(manager.entry.entry_id)
    await hass.async_block_till_done()
    assert manager.entry.runtime_data.config == config


async def test_outdoor_source_precedence_and_fallback(hass, house):
    manager, _calls = house
    hass.states.async_set(
        "weather.home",
        "rainy",
        {"temperature": 10, "temperature_unit": "°C", "humidity": 80},
    )
    hass.states.async_set("sensor.outside", "41", {"unit_of_measurement": "°F"})
    config = manager.config | {
        "weather_entity_id": "weather.home",
        "outdoor_temperature_entity_id": "sensor.outside",
    }
    await manager.save(config, manager.revision)
    assert manager.readings("extractor")["outdoor_temperature"] == 5
    assert manager.readings("extractor")["outdoor_humidity"] == 80
    hass.states.async_set("sensor.outside", "unavailable")
    await hass.async_block_till_done()
    assert manager.readings("extractor")["outdoor_temperature"] == 10


async def test_api_validation_and_commands(hass, house, hass_ws_client):
    manager, calls = house
    client = await hass_ws_client(hass)
    data = await request(client, "havo/get")
    assert data["success"] and data["result"]["admin"]
    assert data["result"]["controllable"] == ["extractor"]
    stale = await request(client, "havo/save", config=manager.config, revision=0)
    assert stale["error"]["code"] == "conflict"
    invalid = await request(
        client, "havo/save", config={"unexpected": True}, revision=manager.revision
    )
    assert invalid["error"]["code"] == "invalid_config"
    speed = await request(
        client, "havo/command", vent_id="extractor", command="set_percentage", value=70
    )
    assert not speed["success"]
    assert calls == []
    on = await request(client, "havo/command", vent_id="extractor", command="turn_on")
    assert on["success"] and calls[-1][0] == "turn_on"
    await client.close()


async def test_permissions(hass, house, hass_ws_client, hass_read_only_access_token):
    manager, calls = house
    group = await hass.auth.async_get_group(GROUP_ID_USER)
    user = MockUser(groups=[group]).add_to_hass(hass)
    refresh = await hass.auth.async_create_refresh_token(
        user, "http://havo.example.test"
    )
    client = await hass_ws_client(
        hass, access_token=hass.auth.async_create_access_token(refresh)
    )
    readonly = await hass_ws_client(hass, access_token=hass_read_only_access_token)
    data = await request(client, "havo/get")
    assert not data["result"]["admin"]
    save = await request(
        client, "havo/save", config=manager.config, revision=manager.revision
    )
    assert save["error"]["code"] == "unauthorized"
    on = await request(client, "havo/command", vent_id="extractor", command="turn_on")
    assert on["success"]
    denied = await request(
        readonly, "havo/command", vent_id="extractor", command="turn_off"
    )
    assert denied["error"]["code"] == "unauthorized"
    assert len(calls) == 1
    await client.close()
    await readonly.close()


async def test_snapshot_does_not_leak_restricted_measurements(house):
    manager, _calls = house
    restricted = SimpleNamespace(
        is_admin=False,
        permissions=SimpleNamespace(
            check_entity=lambda entity, permission: entity != "sensor.indoor_humidity"
        ),
    )
    snapshot = manager.snapshot(restricted)
    assert snapshot["status"] == {}
    assert snapshot["config"]["rooms"] == {}
    assert "sensor.indoor_humidity" not in [
        entity["entity_id"] for entity in snapshot["entities"]
    ]


async def test_subscription_survives_reload(hass, house, hass_ws_client):
    manager, _calls = house
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "havo/subscribe"})
    assert (await client.receive_json())["success"]
    assert (await client.receive_json())["type"] == "event"
    assert await hass.config_entries.async_reload(manager.entry.entry_id)
    message = await client.receive_json()
    assert message["type"] == "event"
    assert message["event"]["revision"] == manager.revision
    await client.close()
