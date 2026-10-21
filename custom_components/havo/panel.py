"""Register the locally bundled panel in the Home Assistant sidebar."""

import logging
from hashlib import sha256
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import DOMAIN, NAME

FRONTEND_PATH = Path(__file__).parent / "frontend"
_LOGGER = logging.getLogger(__name__)


def _bundle_digest() -> str:
    """Identify the installed bundle, including builds within the same version."""
    return sha256((FRONTEND_PATH / "havo-panel.js").read_bytes()).hexdigest()


async def async_register_panel(hass: HomeAssistant) -> None:
    """Serve static assets once and refresh the bundle URL on entry reload."""
    module_url = "/havo_frontend/havo-panel.js"
    try:
        bundle_digest = await hass.async_add_executor_job(_bundle_digest)
    except OSError as err:
        _LOGGER.warning(
            "Unable to read the panel bundle for cache invalidation: %s", err
        )
    else:
        module_url = f"{module_url}?v={bundle_digest}"
    data = hass.data.setdefault(DOMAIN, {})
    if not data.get("static_registered"):
        await hass.http.async_register_static_paths(
            [StaticPathConfig("/havo_frontend", str(FRONTEND_PATH), False)]
        )
        data["static_registered"] = True
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=DOMAIN,
        webcomponent_name="havo-panel",
        sidebar_title=NAME,
        sidebar_icon="mdi:fan",
        module_url=module_url,
        require_admin=False,
        config_panel_domain=DOMAIN,
    )


def async_remove_panel(hass: HomeAssistant) -> None:
    """Remove the sidebar entry without disturbing other integrations."""
    frontend.async_remove_panel(hass, DOMAIN)
