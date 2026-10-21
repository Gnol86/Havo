"""Attribute command requests to Havo without claiming a physical outcome."""

from math import inf, nextafter
from time import time

from homeassistant.const import EVENT_LOGBOOK_ENTRY
from homeassistant.core import Context, HomeAssistant, callback

from .const import DOMAIN, EVENT_FAN_COMMAND, NAME

# Activity is recorded in the server language, not each viewer's language.
_EN = {
    "turn_on": "turn-on requested",
    "turn_off": "turn-off requested",
    "set_percentage": "speed of {percentage}% requested",
    "temperature": "cooling",
    "humidity": "humidity extraction",
    "humidity_timeout": "time below the humidity start threshold elapsed",
    "background": "background ventilation",
    "idle": "return to rest",
    "minimum_run": "minimum running time",
    "minimum_rest": "minimum resting time",
    "manual": "manual command in Havo",
    "failed": "command failed or timed out",
}
_FR = {
    "turn_on": "mise en marche demandée",
    "turn_off": "arrêt demandé",
    "set_percentage": "vitesse de {percentage} % demandée",
    "temperature": "refroidissement",
    "humidity": "extraction d’humidité",
    "humidity_timeout": "durée sous le seuil de démarrage en humidité écoulée",
    "background": "ventilation de fond",
    "idle": "retour au repos",
    "minimum_run": "durée minimale de marche",
    "minimum_rest": "durée minimale de repos",
    "manual": "commande manuelle dans Havo",
    "failed": "commande en échec ou délai dépassé",
}
_ES = {
    "turn_on": "encendido solicitado",
    "turn_off": "apagado solicitado",
    "set_percentage": "velocidad del {percentage} % solicitada",
    "temperature": "refrigeración",
    "humidity": "extracción de humedad",
    "humidity_timeout": (
        "ha transcurrido el tiempo por debajo del umbral de inicio por humedad"
    ),
    "background": "ventilación de fondo",
    "idle": "vuelta al reposo",
    "minimum_run": "tiempo mínimo de funcionamiento",
    "minimum_rest": "tiempo mínimo de reposo",
    "manual": "orden manual en Havo",
    "failed": "la orden ha fallado o ha agotado el tiempo de espera",
}
_TRANSLATIONS = {"en": _EN, "fr": _FR, "es": _ES}


@callback
def async_record_command(
    hass: HomeAssistant,
    context: Context,
    entity_id: str,
    command: str,
    reason: str,
    percentage: int | None = None,
    *,
    failed: bool = False,
) -> None:
    """Record intent before dispatch, or failure after the service raises."""
    language = hass.config.language.lower().replace("_", "-").split("-", 1)[0]
    texts = _TRANSLATIONS.get(language, _EN)
    # A new engine reason should remain visible rather than block fan control.
    detail = texts.get(reason, reason)
    action = texts[command].format(percentage=percentage)
    message = f"{NAME}: {action} — {detail}"
    if failed:
        message = f"{message} ({texts['failed']})"
    data = {
        "name": f"{NAME} — {detail}",
        "entity_id": entity_id,
        "command": command,
        "reason": reason,
        "message": message,
    }
    if percentage is not None:
        data["percentage"] = percentage
    timestamp = time()
    if not failed:
        # The first event on a fresh context becomes the command's origin.
        hass.bus.async_fire(
            EVENT_FAN_COMMAND, data, context=context, time_fired=timestamp
        )
    # A fan belongs to its hardware integration. Entity-filtered Activity does
    # not subscribe to Havo's custom events, so also use a standard entry. This
    # covers speed-only changes and feedback that loses the command context.
    # Recorder orders by timestamp. Break a possible clock-resolution tie so
    # the generic entry cannot become the persisted origin instead of Havo.
    hass.bus.async_fire(
        EVENT_LOGBOOK_ENTRY,
        {**data, "name": NAME, "domain": DOMAIN},
        context=context,
        time_fired=nextafter(timestamp, inf),
    )
