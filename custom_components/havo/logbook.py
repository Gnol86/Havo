"""Expose Havo and its decision as the origin in native Activity details."""

from collections.abc import Callable
from typing import Any

from homeassistant.components.logbook import LazyEventPartialState
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN, EVENT_FAN_COMMAND


@callback
def async_describe_events(
    hass: HomeAssistant,
    async_describe_event: Callable[
        [str, str, Callable[[LazyEventPartialState], dict[str, Any]]], None
    ],
) -> None:
    """Register without requiring the user to enable Activity or Recorder."""

    @callback
    def describe(event: LazyEventPartialState) -> dict[str, Any]:
        return {
            "name": event.data["name"],
            "message": event.data["message"],
            "entity_id": event.data["entity_id"],
            "context_id": event.context_id,
        }

    async_describe_event(DOMAIN, EVENT_FAN_COMMAND, describe)
