"""Native Activity attribution with Home Assistant's real Recorder and Logbook."""

from copy import deepcopy
from datetime import timedelta
from unittest.mock import patch

import pytest
from homeassistant.components.fan import FanEntityFeature as Feature
from homeassistant.components.logbook.helpers import (
    async_determine_event_types,
    async_subscribe_events,
)
from homeassistant.components.logbook.models import async_event_to_row
from homeassistant.components.logbook.processor import EventProcessor
from homeassistant.components.recorder import get_instance
from homeassistant.core import Context, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.setup import async_setup_component
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.components.recorder.common import (
    async_wait_recording_done,
)

from custom_components.havo.activity import async_record_command
from custom_components.havo.const import EVENT_FAN_COMMAND


@pytest.fixture
def mock_recorder_before_hass(recorder_db_url):
    """Prepare the test database before the HA fixture creates its instance."""


@pytest.fixture
async def activity(hass, recorder_mock, house):
    """Load the integration's logbook platform through HA discovery."""
    assert await async_setup_component(hass, "logbook", {"logbook": {}})
    await hass.async_block_till_done()
    assert EVENT_FAN_COMMAND in hass.data["logbook"].external_events
    return house


@pytest.fixture
def requests(hass):
    events = []

    @callback
    def capture(event):
        events.append(event)

    remove = hass.bus.async_listen(EVENT_FAN_COMMAND, capture)
    yield events
    remove()


async def configure(manager, **settings):
    config = deepcopy(manager.config)
    config["rooms"]["bathroom"]["ventilations"]["extractor"].update(settings)
    await manager.save(config, manager.revision)
    await manager.hass.async_block_till_done()
    return manager.engines["extractor"]


def set_state(hass, entity_id, value, **attributes):
    current = hass.states.get(entity_id)
    hass.states.async_set(entity_id, value, dict(current.attributes) | attributes)


async def recorded_entries(hass, entity_id="fan.extractor"):
    """Run the same per-entity database query used by native Activity."""
    await async_wait_recording_done(hass)
    entities = [entity_id]
    event_types = async_determine_event_types(hass, entities, None)
    # The fan is not owned by Havo: the standard entry is needed for this feed.
    assert EVENT_FAN_COMMAND not in event_types
    processor = EventProcessor(hass, event_types, entity_ids=entities)
    now = dt_util.utcnow()
    return await get_instance(hass).async_add_executor_job(
        processor.get_events, now - timedelta(days=1), now + timedelta(seconds=1)
    )


@pytest.mark.parametrize(
    "mode,sensor,value,reason,detail",
    [
        ("temperature", "sensor.indoor_temperature", "30", "temperature", "cooling"),
        ("humidity", "sensor.indoor_humidity", "84", "humidity", "humidity extraction"),
    ],
)
async def test_recorded_on_off_and_cause(
    hass, activity, requests, mode, sensor, value, reason, detail
):
    manager, calls = activity
    await configure(manager, enabled=True, mode=mode, min_on=0, min_off=0)
    set_state(hass, sensor, value)
    await hass.async_block_till_done()
    assert calls == [("turn_on", {"entity_id": "fan.extractor"})]
    assert requests[-1].data["reason"] == reason
    assert "percentage" not in requests[-1].data
    on_context = hass.states.get("fan.extractor").context
    assert on_context is requests[-1].context
    assert on_context.origin_event.event_type == EVENT_FAN_COMMAND

    set_state(hass, sensor, "20")
    await hass.async_block_till_done()
    assert calls[-1] == ("turn_off", {"entity_id": "fan.extractor"})
    assert requests[-1].data["reason"] == "idle"
    assert requests[-1].context.id != on_context.id

    entries = await recorded_entries(hass)
    on = next(row for row in entries if row.get("state") == "on")
    off = next(
        row
        for row in entries
        if row.get("state") == "off" and row.get("context_domain") == "havo"
    )
    assert on["context_domain"] == off["context_domain"] == "havo"
    assert on["context_event_type"] == EVENT_FAN_COMMAND
    assert on["context_name"] == f"Havo — {detail}"
    assert on["context_message"] == f"Havo: turn-on requested — {detail}"
    assert off["context_name"] == "Havo — return to rest"
    assert off["context_message"] == "Havo: turn-off requested — return to rest"
    messages = [row for row in entries if row.get("message")]
    assert [row["name"] for row in messages] == ["Havo", "Havo"]
    assert all(row["entity_id"] == "fan.extractor" for row in messages)
    assert len(requests) == 2
    assert not manager.runtime["extractor"].get("pause_until")


async def test_speed_only_changes_and_background_are_recorded(hass, activity, requests):
    manager, calls = activity
    set_state(
        hass,
        "fan.extractor",
        "off",
        supported_features=int(Feature.SET_SPEED | Feature.TURN_ON | Feature.TURN_OFF),
        percentage=0,
        percentage_step=100 / 3,
    )
    engine = await configure(manager, enabled=True, background=20, min_on=0, min_off=0)
    set_state(hass, "sensor.indoor_temperature", "30")
    await hass.async_block_till_done()
    set_state(hass, "sensor.indoor_temperature", "20")
    await hass.async_block_till_done()
    await engine.evaluate()
    assert [data["percentage"] for _, data in calls] == [33, 100, 33]
    assert [event.data["reason"] for event in requests] == [
        "background",
        "temperature",
        "background",
    ]
    entries = await recorded_entries(hass)
    messages = [row["message"] for row in entries if row.get("message")]
    assert messages == [
        "Havo: speed of 33% requested — background ventilation",
        "Havo: speed of 100% requested — cooling",
        "Havo: speed of 33% requested — background ventilation",
    ]
    assert not engine.runtime.get("pause_until")


@pytest.mark.parametrize("reason", ["minimum_run", "minimum_rest"])
async def test_actual_timing_reason_is_used(hass, activity, requests, reason):
    manager, _calls = activity
    set_state(
        hass,
        "fan.extractor",
        "off",
        supported_features=int(Feature.SET_SPEED | Feature.TURN_ON | Feature.TURN_OFF),
        percentage=0,
    )
    if reason == "minimum_run":
        set_state(hass, "sensor.indoor_temperature", "30")
    else:
        manager.runtime["extractor"].update(
            active=False, changed_at=dt_util.utcnow().timestamp()
        )
        set_state(hass, "sensor.indoor_temperature", "30")
    await configure(manager, enabled=True, background=20, min_on=300, min_off=300)
    if reason == "minimum_run":
        set_state(hass, "sensor.indoor_temperature", "20")
        await hass.async_block_till_done()
    assert requests[-1].data["reason"] == reason


async def test_manual_command_preserves_user_parent_and_pause(
    hass, activity, requests, hass_admin_user
):
    manager, _calls = activity
    caller = Context(user_id=hass_admin_user.id)
    hass.bus.async_fire("test_manual_origin", context=caller)
    await manager.command("extractor", "turn_on", context=caller)
    await hass.async_block_till_done()
    event = requests[-1]
    assert event.data["reason"] == "manual"
    assert event.context.id != caller.id
    assert event.context.parent_id == caller.id
    assert event.context.user_id == caller.user_id
    assert caller.origin_event.event_type == "test_manual_origin"
    assert manager.runtime["extractor"]["pause_until"] > dt_util.utcnow().timestamp()
    entries = await recorded_entries(hass)
    effect = next(row for row in entries if row.get("state") == "on")
    assert effect["context_domain"] == "havo"
    assert effect["context_user_id"] == caller.user_id
    assert effect["context_name"] == "Havo — manual command in Havo"


@pytest.mark.parametrize("keep_context", [True, False])
async def test_live_entity_feed_and_context_loss(hass, activity, keep_context):
    manager, _calls = activity
    events, removers = [], []

    @callback
    def capture(event):
        events.append(event)

    types = async_determine_event_types(hass, ["fan.extractor"], None)
    async_subscribe_events(
        hass, removers, capture, types, None, ["fan.extractor"], None
    )
    processor = EventProcessor(hass, types, entity_ids=["fan.extractor"])
    processor.switch_to_live()

    async def fan_service(call):
        previous = hass.states.get("fan.extractor")
        hass.states.async_set(
            "fan.extractor",
            "on",
            dict(previous.attributes),
            context=call.context if keep_context else Context(),
        )

    hass.services.async_register("fan", "turn_on", fan_service)
    try:
        await configure(manager, enabled=True)
        set_state(hass, "sensor.indoor_temperature", "30")
        await hass.async_block_till_done()
        rows = processor.humanify(async_event_to_row(event) for event in events)
        message = next(row for row in rows if row.get("message"))
        assert message["message"] == "Havo: turn-on requested — cooling"
        assert not any(event.event_type == EVENT_FAN_COMMAND for event in events)
        effect = next(row for row in rows if row.get("state") == "on")
        history = await recorded_entries(hass)
        recorded = next(row for row in history if row.get("state") == "on")
        for row in (effect, recorded):
            if keep_context:
                assert row["context_domain"] == "havo"
                assert row["context_name"] == "Havo — cooling"
            else:
                assert "context_domain" not in row
        assert not manager.runtime["extractor"].get("pause_until")
    finally:
        for remove in removers:
            remove()


@pytest.mark.parametrize("error", [HomeAssistantError("offline"), TimeoutError()])
async def test_failure_is_a_request_and_error_never_success(
    hass, activity, requests, error
):
    manager, calls = activity

    async def fail(call):
        raise error

    hass.services.async_register("fan", "turn_on", fail)
    set_state(hass, "sensor.indoor_temperature", "30")
    engine = await configure(manager, enabled=True)
    await engine.evaluate()
    assert engine.status["reason"] == "command_failed"
    assert len(requests) == 1
    assert calls == []
    assert hass.states.get("fan.extractor").state == "off"
    entries = await recorded_entries(hass)
    messages = [row["message"] for row in entries if row.get("message")]
    assert messages == [
        "Havo: turn-on requested — cooling",
        "Havo: turn-on requested — cooling (command failed or timed out)",
    ]
    assert not any(row.get("state") == "on" for row in entries)


async def test_rejected_capability_has_no_activity(hass, activity, requests):
    manager, calls = activity
    with pytest.raises(ValueError, match="speed_unsupported"):
        await manager.command("extractor", "set_percentage", 50)
    assert requests == []
    assert calls == []
    assert not any(row.get("message") for row in await recorded_entries(hass))


@pytest.mark.parametrize("language", ["fr", "fr-BE", "fr_CA", "en", "de"])
async def test_server_language_and_variants(hass, house, requests, language):
    assert "logbook" not in hass.config.components
    hass.config.language = language
    manager, _calls = house
    await manager.command("extractor", "turn_on")
    await hass.async_block_till_done()
    expected = (
        "Havo: mise en marche demandée — commande manuelle dans Havo"
        if language.startswith("fr")
        else "Havo: turn-on requested — manual command in Havo"
    )
    assert requests[-1].data["message"] == expected
    assert manager.vent("extractor")[1]["name"] == "Extractor"


async def test_external_changes_do_not_claim_havo_activity(hass, activity, requests):
    manager, _calls = activity
    engine = await configure(manager, enabled=True)
    set_state(hass, "fan.extractor", "on")
    await hass.async_block_till_done()
    assert engine.status["reason"] == "manual_pause"
    assert not requests
    rows = await recorded_entries(hass)
    assert not any(row.get("message") for row in rows)


async def test_missing_device_feedback_does_not_claim_physical_success(
    hass, activity, requests
):
    manager, _calls = activity

    async def no_feedback(call):
        pass

    hass.services.async_register("fan", "turn_on", no_feedback)
    set_state(hass, "sensor.indoor_temperature", "30")
    await configure(manager, enabled=True)
    assert len(requests) == 1
    rows = await recorded_entries(hass)
    assert [row["message"] for row in rows if row.get("message")] == [
        "Havo: turn-on requested — cooling"
    ]
    assert not any(row.get("state") == "on" for row in rows)


async def test_origin_wins_when_clock_resolution_would_tie(hass, activity, requests):
    context = Context()
    timestamp = dt_util.utcnow().timestamp()
    with (
        patch("homeassistant.core.time.time", return_value=timestamp),
        patch("custom_components.havo.activity.time", return_value=timestamp),
    ):
        async_record_command(hass, context, "fan.extractor", "turn_on", "manual")
    await hass.services.async_call(
        "fan",
        "turn_on",
        {"entity_id": "fan.extractor"},
        blocking=True,
        context=context,
    )
    entries = await recorded_entries(hass)
    effect = next(row for row in entries if row.get("state") == "on")
    assert effect["context_domain"] == "havo"
    assert effect["context_name"] == "Havo — manual command in Havo"
    assert requests[-1].context.origin_event.event_type == EVENT_FAN_COMMAND
