"""Configuration rejection and capability contracts."""

from copy import deepcopy

import pytest
from homeassistant.components.fan import FanEntityFeature as Feature
from homeassistant.core import State

from custom_components.havo.fans import capabilities, percentage
from custom_components.havo.models import VENT_DEFAULTS, validate_config


@pytest.mark.parametrize(
    "key,value",
    [
        ("temperature_on", 24),
        ("humidity_full", 59),
        ("enabled", 1),
        ("manual_pause", -1),
        ("speed_min", 0),
        ("background", 40),
        ("mode", "auto"),
        ("entity_id", "switch.fan"),
        ("humidity_on", float("nan")),
        ("extra", 1),
    ],
)
def test_reject_invalid_config(config, key, value):
    config["rooms"]["bathroom"]["ventilations"]["extractor"][key] = value
    with pytest.raises(ValueError):
        validate_config(config)


def test_unique_fan_assignment(config):
    config["rooms"]["bathroom"]["ventilations"]["second"] = deepcopy(
        config["rooms"]["bathroom"]["ventilations"]["extractor"]
    )
    with pytest.raises(ValueError):
        validate_config(config)


def test_defaults_are_independent(config):
    normalized = validate_config(config)
    normalized["rooms"]["bathroom"]["ventilations"]["extractor"]["speed_min"] = 55
    assert config["rooms"]["bathroom"]["ventilations"]["extractor"]["speed_min"] == 40
    assert VENT_DEFAULTS["enabled"] is False


@pytest.mark.parametrize(
    "features,speed",
    [
        (Feature.TURN_ON | Feature.TURN_OFF, False),
        (Feature.PRESET_MODE | Feature.TURN_ON, False),
        (Feature.SET_SPEED, True),
    ],
)
def test_speed_requires_feature_not_attribute(features, speed):
    caps = capabilities(
        State("fan.test", "on", {"supported_features": features, "percentage": 50})
    )
    assert caps.speed is speed
    if not speed:
        with pytest.raises(ValueError):
            percentage(50, caps)


def test_quantization():
    caps = capabilities(
        State(
            "fan.test",
            "on",
            {"supported_features": Feature.SET_SPEED, "percentage_step": 100 / 3},
        )
    )
    assert percentage(40, caps) == 33
    assert percentage(80, caps) == 66
    assert percentage(100, caps) == 100
    assert percentage(10, caps, 40, 100) == 33


def test_unavailable_retains_capabilities():
    caps = capabilities(
        State("fan.test", "unavailable", {"supported_features": Feature.SET_SPEED})
    )
    assert caps.speed and not caps.available
