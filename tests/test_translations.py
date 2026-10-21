"""Keep Home Assistant entity and setup translations complete in every locale."""

import json
from pathlib import Path
from string import Formatter

import pytest

from custom_components.havo.activity import _TRANSLATIONS

INTEGRATION_PATH = Path(__file__).resolve().parents[1] / "custom_components" / "havo"


def flatten(catalog, prefix=""):
    """Collect leaf text with full paths so absent sections cannot go unnoticed."""
    result = {}
    for key, value in catalog.items():
        path = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            result.update(flatten(value, path))
        else:
            result[path] = value
    return result


def placeholders(text):
    return {field for _, field, _, _ in Formatter().parse(text) if field is not None}


@pytest.mark.parametrize("language", ["en", "fr", "es"])
def test_home_assistant_translation_catalogs_are_complete(language):
    reference = flatten(json.loads((INTEGRATION_PATH / "strings.json").read_text()))
    translated = flatten(
        json.loads((INTEGRATION_PATH / "translations" / f"{language}.json").read_text())
    )
    assert translated.keys() == reference.keys()
    for key, text in translated.items():
        assert isinstance(text, str) and text.strip(), key
        assert placeholders(text) == placeholders(reference[key]), key
    if language == "en":
        assert translated == reference


@pytest.mark.parametrize("language", ["fr", "es"])
def test_activity_translations_have_all_commands_and_reasons(language):
    reference = _TRANSLATIONS["en"]
    translated = _TRANSLATIONS[language]
    assert translated.keys() == reference.keys()
    for key, text in translated.items():
        assert text.strip(), key
        assert placeholders(text) == placeholders(reference[key]), key
