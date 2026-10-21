"""Installed bundle identity, serving and integration reload coverage."""

import asyncio
import os
from copy import deepcopy
from hashlib import sha256
from unittest.mock import patch

import pytest
from homeassistant.components import frontend
from homeassistant.config_entries import ConfigEntryState

from custom_components.havo import panel


@pytest.fixture(autouse=True)
def installed_bundle(tmp_path, monkeypatch):
    """Isolate static assets so update tests never edit the distributed bundle."""
    content = (panel.FRONTEND_PATH / "havo-panel.js").read_bytes()
    bundle = tmp_path / "havo-panel.js"
    bundle.write_bytes(content)
    monkeypatch.setattr(panel, "FRONTEND_PATH", tmp_path)
    return bundle


def module_url(hass):
    """Return the module URL supplied to Home Assistant clients."""
    return hass.data[frontend.DATA_PANELS]["havo"].config["_panel_custom"]["module_url"]


async def test_registered_url_identifies_and_serves_installed_bundle(
    hass, house, hass_client, installed_bundle
):
    content = installed_bundle.read_bytes()
    digest = sha256(content).hexdigest()
    url = module_url(hass)
    assert url == f"/havo_frontend/havo-panel.js?v={digest}"
    client = await hass_client()
    response = await client.get(url)
    assert response.status == 200
    assert await response.read() == content


async def test_unchanged_reload_keeps_url_without_reregistering_static_paths(
    hass, house, hass_client
):
    manager, _calls = house
    url = module_url(hass)
    with patch.object(hass.http, "async_register_static_paths") as register_static:
        assert await hass.config_entries.async_reload(manager.entry.entry_id)
    register_static.assert_not_called()
    assert module_url(hass) == url
    client = await hass_client()
    assert (await client.get(url)).status == 200


async def test_changed_bundle_gets_new_url_on_reload_even_with_same_file_metadata(
    hass, house, hass_client, installed_bundle
):
    manager, _calls = house
    old_url = module_url(hass)
    old_stat = installed_bundle.stat()
    old_content = installed_bundle.read_bytes()
    content = old_content.replace(b"havo-panel", b"havx-panel", 1)
    assert content != old_content
    installed_bundle.write_bytes(content)
    os.utime(installed_bundle, ns=(old_stat.st_atime_ns, old_stat.st_mtime_ns))
    assert installed_bundle.stat().st_size == old_stat.st_size
    assert installed_bundle.stat().st_mtime_ns == old_stat.st_mtime_ns

    assert await hass.config_entries.async_reload(manager.entry.entry_id)
    url = module_url(hass)
    assert url != old_url
    assert url == f"/havo_frontend/havo-panel.js?v={sha256(content).hexdigest()}"
    client = await hass_client()
    response = await client.get(url)
    assert response.status == 200
    assert await response.read() == content


async def test_bundle_hash_is_calculated_outside_event_loop(hass, house, monkeypatch):
    manager, _calls = house
    original_digest = panel._bundle_digest
    calls = []

    def checked_digest():
        with pytest.raises(RuntimeError, match="no running event loop"):
            asyncio.get_running_loop()
        calls.append(True)
        return original_digest()

    monkeypatch.setattr(panel, "_bundle_digest", checked_digest)
    assert await hass.config_entries.async_reload(manager.entry.entry_id)
    assert calls == [True]


@pytest.mark.parametrize("unreadable", [False, True], ids=["missing", "permission"])
async def test_bundle_read_failure_keeps_ventilation_loaded(
    hass, house, installed_bundle, monkeypatch, caplog, unreadable
):
    manager, calls = house
    config = deepcopy(manager.config)
    engine_ids = set(manager.engines)
    if unreadable:

        def permission_error():
            raise PermissionError("Panel bundle is not readable")

        monkeypatch.setattr(panel, "_bundle_digest", permission_error)
    else:
        installed_bundle.unlink()

    assert await hass.config_entries.async_reload(manager.entry.entry_id)
    assert manager.entry.state is ConfigEntryState.LOADED
    reloaded_manager = manager.entry.runtime_data
    assert reloaded_manager is not manager
    assert reloaded_manager.config == config
    assert set(reloaded_manager.engines) == engine_ids
    assert calls == []
    assert module_url(hass) == "/havo_frontend/havo-panel.js"
    assert "Unable to read the panel bundle for cache invalidation" in caplog.text
