"""Read actual fan capabilities and choose supported percentages."""

from dataclasses import asdict, dataclass
from math import floor

from homeassistant.components.fan import FanEntityFeature

from .climate import finite


@dataclass(frozen=True)
class Capabilities:
    available: bool = False
    speed: bool = False
    turn_on: bool = False
    turn_off: bool = False
    step: float = 1
    presets: bool = False

    def as_dict(self):
        return asdict(self)


def capabilities(state) -> Capabilities:
    if state is None:
        return Capabilities()
    raw = state.attributes.get("supported_features", 0)
    features = FanEntityFeature(raw if isinstance(raw, int) else 0)
    step = finite(state.attributes.get("percentage_step"), 0.01, 100) or 1
    return Capabilities(
        state.state in ("on", "off"),
        bool(features & FanEntityFeature.SET_SPEED),
        bool(features & FanEntityFeature.TURN_ON),
        bool(features & FanEntityFeature.TURN_OFF),
        step,
        bool(features & FanEntityFeature.PRESET_MODE),
    )


def percentage(target: float, caps: Capabilities, low=1, high=100) -> int:
    """Snap to an actual HA percentage step, honoring quantized configuration bounds."""
    if not caps.speed:
        raise ValueError("speed_unsupported")
    count = max(1, min(100, round(100 / caps.step)))
    levels = sorted({max(1, floor(n * 100 / count)) for n in range(1, count + 1)})
    # Limits between steps are normalized to the closest supported levels.
    lower = min(levels, key=lambda value: (abs(value - low), -value))
    upper = min(levels, key=lambda value: (abs(value - high), -value))
    allowed = [value for value in levels if lower <= value <= upper]
    return min(allowed, key=lambda value: (abs(value - target), -value))


def signature(state):
    if state is None or state.state not in ("on", "off"):
        return None
    return (
        state.state,
        state.attributes.get("percentage"),
        state.attributes.get("preset_mode"),
    )
