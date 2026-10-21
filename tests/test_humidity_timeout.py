"""Humidity timeout behavior against Home Assistant's clock and fan services."""

from copy import deepcopy
from datetime import timedelta
from unittest.mock import patch

import pytest
from homeassistant.components.fan import FanEntityFeature as Feature
from homeassistant.exceptions import HomeAssistantError
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import async_fire_time_changed

from custom_components.havo.models import validate_config


async def configure(manager, **settings):
    candidate = deepcopy(manager.config)
    candidate["rooms"]["bathroom"]["ventilations"]["extractor"].update(settings)
    await manager.save(candidate, manager.revision)
    await manager.hass.async_block_till_done()
    return manager.engines["extractor"]


async def reading(hass, entity, value, **attributes):
    previous = hass.states.get(entity)
    attrs = dict(previous.attributes) if previous else {}
    hass.states.async_set(entity, str(value), attrs | attributes)
    await hass.async_block_till_done()


async def advance(hass, freezer, seconds):
    """Let scheduled HA callbacks run without issuing a new sensor reading."""
    freezer.tick(timedelta(seconds=seconds))
    async_fire_time_changed(hass, dt_util.utcnow())
    await hass.async_block_till_done()


async def extracting(hass, manager, **settings):
    await reading(hass, "sensor.indoor_humidity", 80)
    return await configure(
        manager,
        **(
            {
                "enabled": True,
                "mode": "humidity",
                "humidity_on": 70,
                "humidity_hysteresis": 5,
                "humidity_timeout_enabled": True,
                "humidity_timeout": 180,
                "min_on": 0,
                "min_off": 0,
            }
            | settings
        ),
    )


def test_existing_config_gets_disabled_three_hour_timeout(config):
    vent = config["rooms"]["bathroom"]["ventilations"]["extractor"]
    vent.pop("humidity_timeout_enabled", None)
    vent.pop("humidity_timeout", None)
    vent["humidity_on"] = 63
    normalized = validate_config(config)["rooms"]["bathroom"]["ventilations"][
        "extractor"
    ]
    assert normalized["humidity_timeout_enabled"] is False
    assert normalized["humidity_timeout"] == 10800
    assert normalized["humidity_on"] == 63


@pytest.mark.parametrize("value", [1, 0, None, "false"])
def test_timeout_enable_requires_boolean(config, value):
    config["rooms"]["bathroom"]["ventilations"]["extractor"][
        "humidity_timeout_enabled"
    ] = value
    with pytest.raises(ValueError):
        validate_config(config)


@pytest.mark.parametrize(
    "value", [True, 0, 59, 86401, float("nan"), float("inf"), "10800", None]
)
def test_timeout_duration_rejects_invalid_values_even_when_disabled(config, value):
    vent = config["rooms"]["bathroom"]["ventilations"]["extractor"]
    vent.update(humidity_timeout_enabled=False, humidity_timeout=value)
    with pytest.raises(ValueError):
        validate_config(config)


@pytest.mark.parametrize("seconds", [60, 10800, 86400])
def test_timeout_duration_accepts_supported_range(config, seconds):
    config["rooms"]["bathroom"]["ventilations"]["extractor"]["humidity_timeout"] = (
        seconds
    )
    normalized = validate_config(config)
    assert (
        normalized["rooms"]["bathroom"]["ventilations"]["extractor"]["humidity_timeout"]
        == seconds
    )


async def test_timeout_stops_without_new_reading_and_keeps_reason(hass, freezer, house):
    manager, calls = house
    engine = await extracting(hass, manager, humidity_timeout=10800)
    assert engine.status.get("humidity_timeout_at") is None
    await reading(hass, "sensor.indoor_humidity", 67)
    deadline = dt_util.utcnow().timestamp() + 10800
    assert engine.status["humidity_timeout_at"] == deadline

    await advance(hass, freezer, 10799)
    assert hass.states.get("fan.extractor").state == "on"
    await advance(hass, freezer, 1)
    assert hass.states.get("fan.extractor").state == "off"
    assert calls == [
        ("turn_on", {"entity_id": "fan.extractor"}),
        ("turn_off", {"entity_id": "fan.extractor"}),
    ]
    assert engine.runtime["active"] is False
    assert not engine.runtime.get("pause_until")
    assert engine.status["reason"] == "humidity_timeout"
    assert engine.status.get("humidity_timeout_at") is None
    await advance(hass, freezer, 3600)
    assert engine.status["reason"] == "humidity_timeout"
    assert len(calls) == 2


@pytest.mark.parametrize("rebound", [70, 71])
async def test_reaching_start_threshold_restarts_continuous_count(
    hass, freezer, house, rebound
):
    manager, calls = house
    engine = await extracting(hass, manager)
    await reading(hass, "sensor.indoor_humidity", 67)
    original_deadline = engine.status["humidity_timeout_at"]
    await advance(hass, freezer, 90)
    await reading(hass, "sensor.indoor_humidity", rebound)
    assert engine.status.get("humidity_timeout_at") is None
    await advance(hass, freezer, 90)
    assert hass.states.get("fan.extractor").state == "on"
    await reading(hass, "sensor.indoor_humidity", 69)
    assert engine.status["humidity_timeout_at"] > original_deadline
    await advance(hass, freezer, 179)
    assert len(calls) == 1
    await advance(hass, freezer, 1)
    assert calls[-1][0] == "turn_off"


@pytest.mark.parametrize("humidity", [65, 64])
async def test_reaching_rest_threshold_stops_normally(hass, freezer, house, humidity):
    manager, calls = house
    engine = await extracting(hass, manager)
    await reading(hass, "sensor.indoor_humidity", 67)
    await advance(hass, freezer, 90)
    await reading(hass, "sensor.indoor_humidity", humidity)
    assert calls[-1][0] == "turn_off"
    assert engine.status["reason"] == "idle"
    assert engine.status.get("humidity_timeout_at") is None
    assert not engine.runtime.get("humidity_timeout_reached")
    await advance(hass, freezer, 3600)
    assert len(calls) == 2
    await reading(hass, "sensor.indoor_humidity", 70)
    assert calls[-1][0] == "turn_on"
    assert engine.status["reason"] == "humidity"


async def test_inactive_ventilation_does_not_count_time_in_band(hass, freezer, house):
    manager, calls = house
    await reading(hass, "sensor.indoor_humidity", 67)
    engine = await configure(
        manager,
        enabled=True,
        mode="humidity",
        humidity_on=70,
        humidity_timeout_enabled=True,
        humidity_timeout=60,
    )
    await advance(hass, freezer, 10800)
    assert calls == []
    assert engine.status["reason"] == "idle"
    assert engine.status.get("humidity_timeout_at") is None
    assert not engine.runtime.get("humidity_timeout_reached")


async def test_disabled_timeout_preserves_existing_hysteresis(hass, freezer, house):
    manager, calls = house
    engine = await extracting(hass, manager, humidity_timeout_enabled=False)
    await reading(hass, "sensor.indoor_humidity", 67)
    await advance(hass, freezer, 10800)
    assert len(calls) == 1
    assert engine.status["reason"] == "humidity"
    assert engine.status.get("humidity_timeout_at") is None
    assert hass.states.get("fan.extractor").state == "on"


async def test_temperature_mode_never_uses_humidity_timeout(hass, freezer, house):
    manager, calls = house
    await reading(hass, "sensor.indoor_temperature", 30)
    engine = await extracting(hass, manager, mode="temperature")
    await reading(hass, "sensor.indoor_humidity", 67)
    await advance(hass, freezer, 10800)
    assert len(calls) == 1
    assert engine.status["reason"] == "temperature"
    assert engine.status.get("humidity_timeout_at") is None


async def test_timeout_cannot_shortcut_minimum_run(hass, freezer, house):
    manager, calls = house
    engine = await extracting(hass, manager, humidity_timeout=60, min_on=300)
    await reading(hass, "sensor.indoor_humidity", 67)
    await advance(hass, freezer, 60)
    assert len(calls) == 1
    assert engine.runtime["active"] is True
    assert engine.status["humidity_timeout_at"] == (engine.runtime["changed_at"] + 300)
    await advance(hass, freezer, 239)
    assert hass.states.get("fan.extractor").state == "on"
    await advance(hass, freezer, 1)
    assert calls[-1][0] == "turn_off"
    assert engine.status["reason"] == "humidity_timeout"


async def test_rebound_after_timeout_respects_minimum_rest(hass, freezer, house):
    manager, calls = house
    engine = await extracting(hass, manager, humidity_timeout=60, min_off=120)
    await reading(hass, "sensor.indoor_humidity", 67)
    await advance(hass, freezer, 60)
    assert calls[-1][0] == "turn_off"
    await reading(hass, "sensor.indoor_humidity", 70)
    assert engine.status["reason"] == "minimum_rest"
    assert engine.status.get("humidity_timeout_at") is None
    await advance(hass, freezer, 119)
    assert len(calls) == 2
    await advance(hass, freezer, 1)
    assert calls[-1][0] == "turn_on"
    assert len(calls) == 3
    assert engine.status["reason"] == "humidity"
    assert not engine.runtime.get("humidity_timeout_reached")


@pytest.mark.parametrize("entity", ["sensor.indoor_humidity", "fan.extractor"])
async def test_unavailable_observation_discards_elapsed_time(
    hass, freezer, house, entity
):
    manager, calls = house
    engine = await extracting(hass, manager)
    await reading(hass, "sensor.indoor_humidity", 67)
    await advance(hass, freezer, 90)
    await reading(hass, entity, "unavailable")
    assert engine.status.get("humidity_timeout_at") is None
    await advance(hass, freezer, 3600)
    assert len(calls) == 1
    await reading(hass, entity, "on" if entity == "fan.extractor" else 67)
    assert not engine.runtime.get("pause_until")
    assert engine.status["humidity_timeout_at"] == dt_util.utcnow().timestamp() + 180
    await advance(hass, freezer, 179)
    assert len(calls) == 1
    await advance(hass, freezer, 1)
    assert calls[-1][0] == "turn_off"


async def test_manual_pause_discards_elapsed_time(hass, freezer, house):
    manager, calls = house
    engine = await extracting(hass, manager)
    await reading(hass, "sensor.indoor_humidity", 67)
    await advance(hass, freezer, 90)
    await manager.command("extractor", "turn_on")
    await hass.async_block_till_done()
    assert engine.status["reason"] == "manual_pause"
    assert engine.status.get("humidity_timeout_at") is None
    await advance(hass, freezer, 180)
    assert not any(command == "turn_off" for command, _ in calls)
    await engine.resume()
    assert engine.status["humidity_timeout_at"] == dt_util.utcnow().timestamp() + 180
    await advance(hass, freezer, 179)
    assert hass.states.get("fan.extractor").state == "on"
    await advance(hass, freezer, 1)
    assert calls[-1][0] == "turn_off"


async def test_disabled_automation_discards_elapsed_time(hass, freezer, house):
    manager, calls = house
    await extracting(hass, manager)
    await reading(hass, "sensor.indoor_humidity", 67)
    await advance(hass, freezer, 90)
    engine = await configure(manager, enabled=False)
    assert engine.status.get("humidity_timeout_at") is None
    await advance(hass, freezer, 3600)
    assert len(calls) == 1
    engine = await configure(manager, enabled=True)
    assert engine.status["humidity_timeout_at"] == dt_util.utcnow().timestamp() + 180
    await advance(hass, freezer, 179)
    assert len(calls) == 1
    await advance(hass, freezer, 1)
    assert calls[-1][0] == "turn_off"


@pytest.mark.parametrize("settings", [{}, {"name": "Custom name"}])
async def test_unrelated_save_keeps_elapsed_time(hass, freezer, house, settings):
    manager, calls = house
    engine = await extracting(hass, manager)
    await reading(hass, "sensor.indoor_humidity", 67)
    deadline = engine.status["humidity_timeout_at"]
    await advance(hass, freezer, 90)
    engine = await configure(manager, **settings)
    assert engine.status["humidity_timeout_at"] == deadline
    await advance(hass, freezer, 90)
    assert calls[-1][0] == "turn_off"


@pytest.mark.parametrize(
    "settings",
    [{"humidity_on": 71}, {"humidity_hysteresis": 6}, {"humidity_timeout": 300}],
)
async def test_relevant_save_starts_new_timeout(hass, freezer, house, settings):
    manager, calls = house
    await extracting(hass, manager)
    await reading(hass, "sensor.indoor_humidity", 67)
    await advance(hass, freezer, 90)
    engine = await configure(manager, **settings)
    duration = settings.get("humidity_timeout", 180)
    assert (
        engine.status["humidity_timeout_at"] == dt_util.utcnow().timestamp() + duration
    )
    await advance(hass, freezer, duration - 1)
    assert len(calls) == 1
    await advance(hass, freezer, 1)
    assert calls[-1][0] == "turn_off"


async def test_humidity_source_change_starts_new_timeout(hass, freezer, house):
    manager, calls = house
    await extracting(hass, manager)
    await reading(hass, "sensor.indoor_humidity", 67)
    await advance(hass, freezer, 90)
    await reading(hass, "sensor.other_humidity", 67, unit_of_measurement="%")
    candidate = deepcopy(manager.config)
    candidate["rooms"]["bathroom"]["humidity_entity_id"] = "sensor.other_humidity"
    await manager.save(candidate, manager.revision)
    engine = manager.engines["extractor"]
    assert engine.status["humidity_timeout_at"] == dt_util.utcnow().timestamp() + 180
    await advance(hass, freezer, 179)
    assert len(calls) == 1
    await advance(hass, freezer, 1)
    assert calls[-1][0] == "turn_off"


async def test_reload_preserves_elapsed_time_and_timeout_reason(hass, freezer, house):
    manager, calls = house
    engine = await extracting(hass, manager)
    await reading(hass, "sensor.indoor_humidity", 67)
    deadline = engine.status["humidity_timeout_at"]
    await advance(hass, freezer, 90)
    assert await hass.config_entries.async_reload(manager.entry.entry_id)
    await hass.async_block_till_done()
    current = manager.entry.runtime_data
    assert current.engines["extractor"].status["humidity_timeout_at"] == deadline
    await advance(hass, freezer, 90)
    assert calls[-1][0] == "turn_off"
    assert await hass.config_entries.async_reload(manager.entry.entry_id)
    await hass.async_block_till_done()
    current = manager.entry.runtime_data
    assert current.engines["extractor"].status["reason"] == "humidity_timeout"
    assert len(calls) == 2


async def test_timeout_returns_modulating_fan_to_background(hass, freezer, house):
    manager, calls = house
    await reading(
        hass,
        "fan.extractor",
        "off",
        supported_features=int(Feature.SET_SPEED | Feature.TURN_ON | Feature.TURN_OFF),
        percentage=0,
    )
    engine = await extracting(hass, manager, background=20)
    await reading(hass, "sensor.indoor_humidity", 67)
    assert hass.states.get("fan.extractor").attributes["percentage"] == 40
    await advance(hass, freezer, 180)
    assert calls[-1] == (
        "set_percentage",
        {"entity_id": "fan.extractor", "percentage": 20},
    )
    assert hass.states.get("fan.extractor").state == "on"
    assert engine.runtime["active"] is False
    assert engine.status["reason"] == "humidity_timeout"
    assert not engine.runtime.get("pause_until")
    await reading(hass, "sensor.indoor_humidity", 70)
    assert calls[-1][1]["percentage"] == 40
    assert engine.status["reason"] == "humidity"


async def test_timeout_respects_calculated_not_reference_thresholds(
    hass, freezer, house
):
    manager, calls = house
    await reading(
        hass,
        "weather.home",
        "sunny",
        temperature=15,
        temperature_unit="°C",
        humidity=60,
    )
    await manager.save(
        manager.config | {"weather_entity_id": "weather.home"}, manager.revision
    )
    engine = await extracting(hass, manager, humidity_on=75)
    await reading(hass, "sensor.indoor_humidity", 67)
    assert engine.status["decision"]["on"] == 70
    assert engine.status["decision"]["off"] == 65
    assert engine.status["humidity_timeout_at"] is not None
    await advance(hass, freezer, 180)
    assert calls[-1][0] == "turn_off"
    assert engine.status["reason"] == "humidity_timeout"


async def test_timeout_is_independent_for_each_ventilation(hass, freezer, house):
    manager, calls = house
    await extracting(hass, manager)
    candidate = deepcopy(manager.config)
    vents = candidate["rooms"]["bathroom"]["ventilations"]
    vents["second"] = vents["extractor"] | {
        "entity_id": "fan.second",
        "name": "Second extractor",
        "humidity_timeout": 360,
    }
    await reading(
        hass,
        "fan.second",
        "off",
        supported_features=int(Feature.TURN_ON | Feature.TURN_OFF),
    )
    await manager.save(candidate, manager.revision)
    await hass.async_block_till_done()
    await reading(hass, "sensor.indoor_humidity", 67)
    await advance(hass, freezer, 180)
    assert hass.states.get("fan.extractor").state == "off"
    assert hass.states.get("fan.second").state == "on"
    assert manager.engines["extractor"].status["reason"] == "humidity_timeout"
    assert manager.engines["second"].status["reason"] == "humidity"
    await advance(hass, freezer, 180)
    assert hass.states.get("fan.second").state == "off"
    assert [data["entity_id"] for command, data in calls if command == "turn_off"] == [
        "fan.extractor",
        "fan.second",
    ]


async def test_presets_are_not_treated_as_speed_control(hass, freezer, house):
    manager, calls = house
    await reading(
        hass,
        "fan.extractor",
        "off",
        supported_features=int(
            Feature.PRESET_MODE | Feature.TURN_ON | Feature.TURN_OFF
        ),
        preset_modes=["normal", "boost"],
        preset_mode="normal",
        percentage=0,
    )
    await extracting(hass, manager)
    await reading(hass, "sensor.indoor_humidity", 67)
    await advance(hass, freezer, 180)
    assert calls == [
        ("turn_on", {"entity_id": "fan.extractor"}),
        ("turn_off", {"entity_id": "fan.extractor"}),
    ]


async def test_failed_timeout_stop_preserves_active_state_until_retry(
    hass, freezer, house
):
    manager, calls = house
    engine = await extracting(hass, manager)
    attempts = []

    async def flaky_stop(call):
        attempts.append(call)
        if len(attempts) == 1:
            raise HomeAssistantError("temporarily offline")
        current = hass.states.get("fan.extractor")
        hass.states.async_set(
            "fan.extractor", "off", dict(current.attributes), context=call.context
        )

    hass.services.async_register("fan", "turn_off", flaky_stop)
    await reading(hass, "sensor.indoor_humidity", 67)
    await advance(hass, freezer, 180)
    assert len(attempts) == 1
    assert len(calls) == 1
    assert engine.status["reason"] == "command_failed"
    assert engine.runtime["active"] is True
    assert not engine.runtime.get("humidity_timeout_reached")
    assert hass.states.get("fan.extractor").state == "on"
    await advance(hass, freezer, 29)
    assert len(attempts) == 1
    await advance(hass, freezer, 1)
    assert len(attempts) == 2
    assert engine.runtime["active"] is False
    assert engine.status["reason"] == "humidity_timeout"
    assert hass.states.get("fan.extractor").state == "off"


async def test_disabling_timeout_cancels_pending_stop(hass, freezer, house):
    manager, calls = house
    await extracting(hass, manager)
    await reading(hass, "sensor.indoor_humidity", 67)
    await advance(hass, freezer, 90)
    engine = await configure(manager, humidity_timeout_enabled=False)
    assert engine.status.get("humidity_timeout_at") is None
    await advance(hass, freezer, 3600)
    assert len(calls) == 1
    engine = await configure(manager, humidity_timeout_enabled=True)
    assert engine.status["humidity_timeout_at"] == dt_util.utcnow().timestamp() + 180
    await advance(hass, freezer, 179)
    assert len(calls) == 1
    await advance(hass, freezer, 1)
    assert calls[-1][0] == "turn_off"


async def test_failed_timeout_persistence_retries_without_new_reading(
    hass, freezer, house
):
    manager, calls = house
    engine = await extracting(hass, manager)
    original_persist = manager.persist
    attempts = 0
    published = []
    remove_listener = manager.listen(lambda: published.append(deepcopy(engine.status)))

    async def flaky_persist():
        nonlocal attempts
        attempts += 1
        if attempts == 1:
            raise OSError("temporarily unavailable storage")
        await original_persist()

    try:
        with patch.object(manager, "persist", side_effect=flaky_persist) as persist:
            await reading(hass, "sensor.indoor_humidity", 67)
            deadline = dt_util.utcnow().timestamp() + 180
            assert persist.await_count == 1
            assert published[-1]["reason"] == "command_failed"
            assert published[-1]["humidity_timeout_at"] == deadline
            assert hass.states.get("fan.extractor").state == "on"
            assert len(calls) == 1

            # Re-evaluation and clock ticks before the retry must not hit storage.
            await engine.evaluate()
            await advance(hass, freezer, 29)
            assert persist.await_count == 1
            await advance(hass, freezer, 1)
            assert persist.await_count == 2
            assert published[-1]["reason"] == "humidity"
            assert published[-1]["humidity_timeout_at"] == deadline
    finally:
        remove_listener()

    assert await hass.config_entries.async_reload(manager.entry.entry_id)
    await hass.async_block_till_done()
    current = manager.entry.runtime_data
    assert current.engines["extractor"].status["humidity_timeout_at"] == deadline
    await advance(hass, freezer, 150)
    assert calls[-1][0] == "turn_off"
    assert current.engines["extractor"].status["reason"] == "humidity_timeout"
