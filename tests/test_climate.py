"""Numerical reference cases and behavioral boundaries."""

import pytest

from custom_components.havo.climate import (
    evaluate,
    finite,
    saturation_pressure,
    temperature,
)
from custom_components.havo.models import VENT_DEFAULTS


def readings(t=22, h=60, ot=5, oh=90):
    return dict(temperature=t, humidity=h, outdoor_temperature=ot, outdoor_humidity=oh)


@pytest.mark.parametrize(
    "value,unit,expected",
    [
        (77, "°F", 25),
        (298.15, "K", 25),
        (25, "°C", 25),
        ("unknown", "°C", None),
        ("nan", "°C", None),
        (True, "°C", None),
        (25, None, None),
        (900, "°C", None),
    ],
)
def test_temperature_conversion(value, unit, expected):
    result = temperature(value, unit)
    assert result == pytest.approx(expected) if expected is not None else result is None


def test_reference_pressure():
    assert saturation_pressure(0) == pytest.approx(6.11)
    assert saturation_pressure(20) == pytest.approx(23.39, abs=0.02)
    with pytest.raises(ValueError):
        saturation_pressure(-237.3)


@pytest.mark.parametrize(
    "value", ["unavailable", "inf", float("nan"), -1, 101, None, True]
)
def test_invalid_humidity(value):
    assert finite(value, 0, 100) is None


@pytest.mark.parametrize(
    "temp,active,needed,demand",
    [
        (24.5, False, False, 0),
        (25, False, True, 0),
        (24.5, True, True, 0),
        (24, True, False, 0),
        (27.5, False, True, 0.5),
        (40, False, True, 1),
    ],
)
def test_temperature_hysteresis(temp, active, needed, demand):
    result = evaluate(VENT_DEFAULTS, readings(t=temp), active)
    assert result.active is needed
    assert result.demand == demand


def test_cold_humid_air_is_drier_when_warmed():
    result = evaluate(VENT_DEFAULTS | {"mode": "humidity"}, readings(), False)
    assert result.outdoor_equivalent == pytest.approx(29.7, abs=0.2)
    assert result.on == pytest.approx(56.75)
    assert result.off == pytest.approx(51.75)
    assert result.active


def test_warm_wet_air_never_blocks_priority_extraction():
    result = evaluate(
        VENT_DEFAULTS | {"mode": "humidity"}, readings(24, 65, 28, 75), False
    )
    assert result.outdoor_equivalent > 90
    assert result.on == 60
    assert result.active


def test_cold_moderates_anticipation():
    config = VENT_DEFAULTS | {"mode": "humidity"}
    mild = evaluate(config, readings(22, 60, 15, 60), False)
    cold = evaluate(config, readings(22, 60, -5, 90), False)
    assert 55 <= mild.on < cold.on <= 60


@pytest.mark.parametrize(
    "missing", ["temperature", "outdoor_temperature", "outdoor_humidity"]
)
def test_humidity_fallback(missing):
    values = readings()
    values[missing] = None
    result = evaluate(VENT_DEFAULTS | {"mode": "humidity"}, values, False)
    assert result.valid and result.fallback
    assert (result.on, result.off) == (60, 55)
    assert result.active


@pytest.mark.parametrize(
    "mode,missing", [("temperature", "temperature"), ("humidity", "humidity")]
)
def test_missing_main_measurement_freezes_demand(mode, missing):
    values = readings()
    values[missing] = None
    result = evaluate(VENT_DEFAULTS | {"mode": mode}, values, True)
    assert not result.valid
    assert result.active


def test_custom_thresholds_and_full_demand():
    config = VENT_DEFAULTS | {
        "mode": "humidity",
        "humidity_on": 65,
        "humidity_hysteresis": 7,
        "humidity_full": 80,
    }
    result = evaluate(config, readings(h=80, ot=None), False)
    assert (result.on, result.off, result.demand) == (65, 58, 1)
