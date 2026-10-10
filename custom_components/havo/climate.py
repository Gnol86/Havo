"""Pure psychrometric calculations and hysteresis. No Home Assistant side effects."""

import math
from dataclasses import asdict, dataclass


def clamp(value: float, low=0.0, high=1.0) -> float:
    return max(low, min(high, value))


def finite(value, low, high):
    try:
        result = float(value)
    except ValueError, TypeError, OverflowError:
        return None
    return (
        result
        if not isinstance(value, bool)
        and math.isfinite(result)
        and low <= result <= high
        else None
    )


def temperature(value, unit):
    value = finite(value, -500, 1000)
    if value is None:
        return None
    if unit == "°F":
        value = (value - 32) * 5 / 9
    elif unit == "K":
        value -= 273.15
    elif unit != "°C":
        return None
    return finite(value, -80, 80)


def saturation_pressure(celsius: float) -> float:
    """NWS saturation pressure in hPa; bounded to the supported sensor range."""
    if finite(celsius, -80, 80) is None:
        raise ValueError("Temperature outside calculation range")
    return 6.11 * 10 ** (7.5 * celsius / (237.3 + celsius))


@dataclass(frozen=True)
class Decision:
    valid: bool
    active: bool
    demand: float
    on: float
    off: float
    fallback: bool = False
    outdoor_equivalent: float | None = None
    drying_potential: float | None = None
    thermal_factor: float | None = None

    def as_dict(self):
        return asdict(self)


def evaluate(config: dict, readings: dict, active: bool) -> Decision:
    """Evaluate a need; durations and hardware capabilities belong to the engine."""
    equivalent = potential = thermal = None
    fallback = False
    if config["mode"] == "temperature":
        value = readings["temperature"]
        start, stop, full = (
            config[key]
            for key in ("temperature_on", "temperature_off", "temperature_full")
        )
    else:
        value = readings["humidity"]
        start, full = config["humidity_on"], config["humidity_full"]
        inside, outside, humidity = (
            readings[key]
            for key in ("temperature", "outdoor_temperature", "outdoor_humidity")
        )
        fallback = None in (inside, outside, humidity)
        if not fallback and value is not None:
            equivalent = (
                humidity * saturation_pressure(outside) / saturation_pressure(inside)
            )
            potential = clamp((value - equivalent) / 20)
            thermal = clamp(1 - max(0, inside - outside - 10) / 20)
            start -= 5 * potential * thermal
        stop = start - config["humidity_hysteresis"]
    if value is None:
        return Decision(False, active, 0, start, stop, fallback)
    needed = value > stop if active else value >= start
    return Decision(
        True,
        needed,
        clamp((value - start) / (full - start)),
        start,
        stop,
        fallback,
        equivalent,
        potential,
        thermal,
    )
