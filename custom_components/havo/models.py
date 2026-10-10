"""Normalize configuration before it can control any physical device."""

import math
import re
from copy import deepcopy

VENT_DEFAULTS = {
    "entity_id": "",
    "name": "",
    "mode": "temperature",
    "enabled": False,
    "temperature_on": 25,
    "temperature_off": 24,
    "temperature_full": 30,
    "humidity_on": 60,
    "humidity_hysteresis": 5,
    "humidity_full": 75,
    "background": 0,
    "speed_min": 40,
    "speed_max": 100,
    "min_on": 300,
    "min_off": 120,
    "manual_pause": 3600,
}
ROOM_DEFAULTS = {
    "temperature_entity_id": None,
    "humidity_entity_id": None,
    "ventilations": {},
}


def default_config() -> dict:
    return {
        "weather_entity_id": None,
        "outdoor_temperature_entity_id": None,
        "outdoor_humidity_entity_id": None,
        "rooms": {},
    }


def number(value, low: float, high: float) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError("Expected a number")
    if not math.isfinite(value) or not low <= value <= high:
        raise ValueError(f"Expected a finite number between {low} and {high}")
    return value


def identifier(value) -> str:
    if not isinstance(value, str) or not re.fullmatch(r"[a-zA-Z0-9_-]{1,128}", value):
        raise ValueError("Invalid identifier")
    return value


def entity_id(value, domain: str, optional=True):
    if value is None and optional:
        return None
    if not isinstance(value, str) or not re.fullmatch(rf"{domain}\.[a-z0-9_]+", value):
        raise ValueError(f"Expected a {domain} entity")
    return value


def mapping(value, defaults):
    if not isinstance(value, dict) or value.keys() - defaults.keys():
        raise ValueError("Unknown configuration field or invalid object")
    return deepcopy(defaults) | deepcopy(value)


def validate_config(value: dict) -> dict:
    config = mapping(value, default_config())
    for key, domain in (
        ("weather_entity_id", "weather"),
        ("outdoor_temperature_entity_id", "sensor"),
        ("outdoor_humidity_entity_id", "sensor"),
    ):
        config[key] = entity_id(config[key], domain)
    if not isinstance(config["rooms"], dict):
        raise ValueError("Expected rooms")
    assigned, ids = set(), set()
    for room_id, raw_room in config["rooms"].items():
        identifier(room_id)
        room = mapping(raw_room, ROOM_DEFAULTS)
        for key in ("temperature_entity_id", "humidity_entity_id"):
            room[key] = entity_id(room[key], "sensor")
        if not isinstance(room["ventilations"], dict):
            raise ValueError("Expected ventilations")
        for vent_id, raw_vent in room["ventilations"].items():
            identifier(vent_id)
            vent = mapping(raw_vent, VENT_DEFAULTS)
            entity_id(vent["entity_id"], "fan", optional=False)
            if vent_id in ids or vent["entity_id"] in assigned:
                raise ValueError("Duplicate ventilation or fan")
            ids.add(vent_id)
            assigned.add(vent["entity_id"])
            if not isinstance(vent["name"], str) or len(vent["name"]) > 100:
                raise ValueError("Invalid ventilation name")
            if (
                vent["mode"] not in ("temperature", "humidity")
                or type(vent["enabled"]) is not bool
            ):
                raise ValueError("Invalid mode")
            for key in ("temperature_on", "temperature_off", "temperature_full"):
                number(vent[key], -40, 60)
            if (
                not vent["temperature_off"]
                < vent["temperature_on"]
                < vent["temperature_full"]
            ):
                raise ValueError("Temperature thresholds must increase")
            number(vent["humidity_on"], 20, 90)
            number(vent["humidity_hysteresis"], 1, 20)
            number(vent["humidity_full"], 21, 100)
            if (
                vent["humidity_on"] >= vent["humidity_full"]
                or vent["humidity_on"] - 5 - vent["humidity_hysteresis"] < 0
            ):
                raise ValueError("Invalid humidity thresholds")
            number(vent["background"], 0, 100)
            number(vent["speed_min"], 1, 100)
            number(vent["speed_max"], 1, 100)
            if not vent["background"] < vent["speed_min"] <= vent["speed_max"]:
                raise ValueError("Expected background < minimum <= maximum")
            for key in ("min_on", "min_off", "manual_pause"):
                number(vent[key], 0, 86400)
            room["ventilations"][vent_id] = vent
        config["rooms"][room_id] = room
    return config
