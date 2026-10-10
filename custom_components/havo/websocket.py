"""Authenticated public interface for the embedded panel."""

import probatio
from homeassistant.components import websocket_api
from homeassistant.core import Context, callback
from homeassistant.exceptions import HomeAssistantError, Unauthorized

from .const import DOMAIN
from .manager import HavoError


def manager(hass):
    if (instance := hass.data.get(DOMAIN, {}).get("manager")) is None:
        raise HavoError("not_loaded")
    return instance


async def handle(hass, connection, msg):
    try:
        current = manager(hass)
        kind = msg["type"]
        if kind == "havo/subscribe":
            pending = None

            @callback
            def publish():
                nonlocal pending
                pending = None
                try:
                    connection.send_event(
                        msg["id"], manager(hass).snapshot(connection.user)
                    )
                except HavoError:
                    pass

            @callback
            def changed(_event=None):
                nonlocal pending
                if pending is None:
                    pending = hass.loop.call_later(0.1, publish)

            remove = hass.bus.async_listen("havo_updated", changed)

            @callback
            def cleanup():
                remove()
                if pending:
                    pending.cancel()

            connection.subscriptions[msg["id"]] = cleanup
            connection.send_result(msg["id"])
            publish()
            return
        if kind == "havo/save":
            if not connection.user.is_admin:
                raise Unauthorized()
            await current.save(msg["config"], msg["revision"])
        elif kind == "havo/command":
            current.check_control(connection.user, msg["vent_id"])
            await current.command(
                msg["vent_id"],
                msg["command"],
                msg.get("value"),
                Context(user_id=connection.user.id),
            )
        connection.send_result(msg["id"], current.snapshot(connection.user))
    except HavoError as err:
        connection.send_error(msg["id"], err.code, str(err))
    except ValueError as err:
        connection.send_error(msg["id"], "invalid_config", str(err))
    except Unauthorized:
        connection.send_error(msg["id"], "unauthorized", "Not permitted")
    except HomeAssistantError:
        connection.send_error(msg["id"], "command_failed", "Command failed")


@callback
def async_register(hass):
    for kind, schema in {
        "havo/get": {},
        "havo/subscribe": {},
        "havo/save": {
            probatio.Required("config"): dict,
            probatio.Required("revision"): int,
        },
        "havo/command": {
            probatio.Required("vent_id"): str,
            probatio.Required("command"): probatio.In(
                ["turn_on", "turn_off", "set_percentage", "automation", "resume"]
            ),
            probatio.Optional("value"): object,
        },
    }.items():
        handler = websocket_api.async_response(handle)
        handler = websocket_api.websocket_command(
            {probatio.Required("type"): kind, **schema}
        )(handler)
        websocket_api.async_register_command(hass, handler)
