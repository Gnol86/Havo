"""Exercise real HA events and the controller against fan service doubles."""

from copy import deepcopy

from homeassistant.components.fan import FanEntityFeature as Feature
from homeassistant.core import Context
from homeassistant.exceptions import HomeAssistantError
from homeassistant.util import dt as dt_util


async def configure(manager, **settings):
    config = deepcopy(manager.config)
    config["rooms"]["bathroom"]["ventilations"]["extractor"].update(settings)
    await manager.save(config, manager.revision)
    await manager.hass.async_block_till_done()
    return manager.engines["extractor"]


def state(hass, entity, value, **attrs):
    previous = hass.states.get(entity)
    hass.states.async_set(entity, value, dict(previous.attributes) | attrs)


async def test_on_off_never_receives_percentage(hass, house):
    manager, calls = house
    engine = await configure(manager, enabled=True, min_on=0, min_off=0)
    state(hass, "sensor.indoor_temperature", "27")
    await hass.async_block_till_done()
    assert calls == [("turn_on", {"entity_id": "fan.extractor"})]
    assert not engine.runtime.get("pause_until")
    await engine.evaluate()
    assert len(calls) == 1
    state(hass, "sensor.indoor_temperature", "24")
    await hass.async_block_till_done()
    assert calls[-1] == ("turn_off", {"entity_id": "fan.extractor"})


async def test_modulating_fan_and_background(hass, house):
    manager, calls = house
    state(
        hass,
        "fan.extractor",
        "off",
        supported_features=int(Feature.SET_SPEED | Feature.TURN_ON | Feature.TURN_OFF),
        percentage=0,
        percentage_step=100 / 3,
    )
    await hass.async_block_till_done()
    engine = await configure(manager, enabled=True, background=20, min_on=0, min_off=0)
    assert calls[-1][1]["percentage"] == 33
    state(hass, "sensor.indoor_temperature", "30")
    await hass.async_block_till_done()
    assert calls[-1][1]["percentage"] == 100
    assert engine.status["reason"] == "temperature"
    state(hass, "sensor.indoor_temperature", "22")
    await hass.async_block_till_done()
    assert calls[-1][1]["percentage"] == 33


async def test_manual_change_holds_and_resume_recomputes(hass, house):
    manager, calls = house
    engine = await configure(manager, enabled=True, min_on=0, min_off=0)
    state(hass, "sensor.indoor_temperature", "30")
    await hass.async_block_till_done()
    current = hass.states.get("fan.extractor")
    hass.states.async_set(
        "fan.extractor",
        "off",
        dict(current.attributes),
        context=Context(user_id="external-person"),
    )
    await hass.async_block_till_done()
    assert engine.status["reason"] == "manual_pause"
    assert hass.states.get("fan.extractor").state == "off"
    assert len(calls) == 1
    await engine.resume()
    await hass.async_block_till_done()
    assert hass.states.get("fan.extractor").state == "on"


async def test_minimum_runtime_then_stop(hass, house):
    manager, calls = house
    state(hass, "sensor.indoor_temperature", "30")
    engine = await configure(manager, enabled=True, min_on=300, min_off=120)
    state(hass, "sensor.indoor_temperature", "20")
    await hass.async_block_till_done()
    assert engine.status["reason"] == "minimum_run"
    assert engine.status["deadline"] is not None
    assert len(calls) == 1
    engine.runtime["changed_at"] = dt_util.utcnow().timestamp() - 301
    await engine.evaluate()
    await hass.async_block_till_done()
    assert calls[-1][0] == "turn_off"
    state(hass, "sensor.indoor_temperature", "30")
    await hass.async_block_till_done()
    assert engine.status["reason"] == "minimum_rest"


async def test_sensor_missing_preserves_hardware(hass, house):
    manager, calls = house
    state(hass, "sensor.indoor_temperature", "30")
    engine = await configure(manager, enabled=True, min_on=0)
    state(hass, "sensor.indoor_temperature", "unavailable")
    await hass.async_block_till_done()
    assert engine.status["reason"] == "sensor_unavailable"
    assert hass.states.get("fan.extractor").state == "on"
    assert len(calls) == 1


async def test_humidity_without_outdoor_data(hass, house):
    manager, calls = house
    state(hass, "sensor.indoor_humidity", "65")
    engine = await configure(manager, enabled=True, mode="humidity", min_on=0)
    assert engine.status["decision"]["fallback"]
    assert calls[-1][0] == "turn_on"


async def test_capability_loss_freezes_background(hass, house):
    manager, calls = house
    state(
        hass,
        "fan.extractor",
        "off",
        supported_features=int(Feature.SET_SPEED | Feature.TURN_ON | Feature.TURN_OFF),
        percentage=0,
    )
    engine = await configure(manager, enabled=True, background=20)
    count = len(calls)
    state(
        hass,
        "fan.extractor",
        "on",
        supported_features=int(Feature.TURN_ON | Feature.TURN_OFF),
    )
    await hass.async_block_till_done()
    assert engine.status["reason"] == "speed_unsupported"
    assert manager.vent("extractor")[1]["background"] == 20
    assert len(calls) == count


async def test_unavailable_fan_has_no_commands(hass, house):
    manager, calls = house
    state(hass, "fan.extractor", "unavailable")
    state(hass, "sensor.indoor_temperature", "30")
    engine = await configure(manager, enabled=True)
    assert engine.status["reason"] == "fan_unavailable"
    assert calls == []


async def test_unsupported_turn_on(hass, house):
    manager, calls = house
    state(hass, "fan.extractor", "off", supported_features=int(Feature.PRESET_MODE))
    state(hass, "sensor.indoor_temperature", "30")
    engine = await configure(manager, enabled=True)
    assert engine.status["reason"] == "on_unsupported"
    assert calls == []


async def test_command_failure_is_bounded(hass, house):
    manager, calls = house
    attempts = []

    async def fail(call):
        attempts.append(call)
        raise HomeAssistantError("offline")

    hass.services.async_register("fan", "turn_on", fail)
    state(hass, "sensor.indoor_temperature", "30")
    engine = await configure(manager, enabled=True)
    assert engine.status["reason"] == "command_failed"
    await engine.evaluate()
    assert len(attempts) == 1


async def test_manual_pause_survives_reload(hass, house):
    manager, _calls = house
    await configure(manager, enabled=True)
    await manager.command("extractor", "turn_on")
    deadline = manager.runtime["extractor"]["pause_until"]
    assert await hass.config_entries.async_reload(manager.entry.entry_id)
    await hass.async_block_till_done()
    current = manager.entry.runtime_data
    assert current.runtime["extractor"]["pause_until"] == deadline
    assert current.engines["extractor"].status["reason"] == "manual_pause"


async def test_preset_change_is_manual(hass, house):
    manager, _calls = house
    state(
        hass,
        "fan.extractor",
        "off",
        supported_features=int(
            Feature.TURN_ON | Feature.TURN_OFF | Feature.PRESET_MODE
        ),
    )
    await hass.async_block_till_done()
    engine = await configure(manager, enabled=True)
    current = hass.states.get("fan.extractor")
    hass.states.async_set(
        "fan.extractor",
        current.state,
        dict(current.attributes) | {"preset_mode": "night"},
    )
    await hass.async_block_till_done()
    assert engine.status["reason"] == "manual_pause"


async def test_no_hardware_commands_before_home_assistant_is_running(hass, house):
    from homeassistant.core import CoreState

    manager, calls = house
    state(hass, "sensor.indoor_temperature", "30")
    hass.set_state(CoreState.starting)
    engine = await configure(manager, enabled=True)
    assert engine.status["reason"] == "initializing"
    assert calls == []
    hass.set_state(CoreState.running)
    await engine.evaluate()
    await hass.async_block_till_done()
    assert calls[-1][0] == "turn_on"
