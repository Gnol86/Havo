# Havo

[Français](docs/README.fr.md)

**Capability-aware home ventilation for Home Assistant.**

Havo manages existing `fan` entities from one embedded panel. Use room temperature for comfort fans, or adaptive humidity extraction for bathrooms and other ventilated rooms. Havo belongs to the Haxo family alongside [Halo](https://github.com/Gnol86/Halo), the lighting integration. Each integration is independent.

## What it does

- One installation, rooms from Home Assistant, independent rules for each fan.
- Automatic on/off detection and optional speed modulation using the entity's advertised capabilities. Presets alone do not imply adjustable speed.
- Optional background ventilation on modulating fans, with percentages adapted to their supported steps.
- Temperature and humidity modes, hysteresis, minimum run/rest times and manual holds.
- Outdoor sensor priority with weather fallback; explicit degraded operation when readings are missing.
- An embedded, responsive panel following the Home Assistant theme, in English or French.
- Native automation switch, resume button and status sensor for every configured ventilation.
- Native Activity entries identifying Havo, the requested command and its reason.
- Validated, versioned storage, administrator-only configuration and server-side control permissions.

## Installation

Requires **Home Assistant 2026.10.0 or newer**. Existing fans and sensors must already be available in Home Assistant. Havo does not connect directly to fan manufacturers.

1. In HACS, open **Custom repositories**, add `https://github.com/Gnol86/Havo` and choose **Integration**.
2. Download Havo and restart Home Assistant.
3. Add **Havo** under **Settings → Devices & services → Add integration**.
4. Open **Havo** in the sidebar. No YAML or separate dashboard card is needed.

Manual installation: copy `custom_components/havo` into your Home Assistant `custom_components` directory, restart, then add the integration.

The initial development version is **0.1.0**. Until a GitHub release is published, the custom HACS repository uses the default branch. Publication in the default HACS catalog and installation in a real home are separate steps.

## First configuration

1. In **General settings**, optionally select a weather entity, an outdoor temperature sensor and an outdoor humidity sensor. A valid dedicated sensor takes priority over the corresponding weather attribute.
2. Choose a room and add a fan. Fans already managed elsewhere are excluded. The selector can include fans from other rooms.
3. In **Automation**, select the room's temperature and humidity sensors, then choose a mode for each fan.
4. Adjust thresholds and timing, enable automation and save. **New ventilations start with automation disabled.**

The **Control** tab displays the actual state, reason, current measurements, adaptive thresholds, data sources and pause deadline. Its physical commands pause automation for the configured duration. Use **Resume automation** to resume immediately. The native Home Assistant dialog remains available for preset modes and other device-specific controls.

Configuration drafts survive navigation. Invalid values block navigation/saving, concurrent edits report a conflict, and later edits are preserved when a slow save finishes. Physical controls are disabled while a configuration draft exists to avoid operating an unsaved assignment.

## Hardware capabilities

| Entity capability | Havo behavior |
| --- | --- |
| `TURN_ON` / `TURN_OFF` | Supported on/off commands only, without a percentage |
| `SET_SPEED` | Percentage control, automatic modulation and optional background speed |
| Preset modes without `SET_SPEED` | On/off operation; presets are never interpreted as speed levels |
| Unavailable entity | No command; explicit unavailable status |

Capabilities are checked again at runtime. A non-modulating fan has no speed fields or speed slider. A loss of speed support preserves the saved settings and suspends configured background control. Requested speed limits and targets are normalized to supported steps; the effective automatic target is displayed. Background speed and active minimum may coincide on very coarse devices.

## Temperature mode

Defaults: start at **25 °C**, return to rest at **24 °C**, reach maximum speed at **30 °C**. Adjustable fans interpolate linearly between the configured active minimum and maximum. On/off fans use the start/stop thresholds. Outdoor temperature does not block this indoor air-circulation mode.

Input temperatures may use °C, °F or K. Settings and calculated readings in the panel use °C.

## Humidity comfort mode

Defaults: reference **60%**, hysteresis **5 percentage points**, maximum demand at **75%**. Outdoor air is compared at the indoor temperature; relative humidity percentages at different temperatures are not compared directly.

For temperatures in °C and humidity in percent:

```text
es(T) = 6.11 × 10^(7.5 × T / (237.3 + T))
Hout_equivalent = Hout × es(Tout) / es(Tin)
D = clamp((Hin - Hout_equivalent) / 20, 0, 1)
F = clamp(1 - max(0, Tin - Tout - 10) / 20, 0, 1)
start = humidity_reference - 5 × D × F
rest = start - humidity_hysteresis
```

This permits up to five points of early extraction when outdoor conditions favor drying. A large indoor/outdoor temperature difference moderates that anticipation. **Extraction remains a priority at or above the reference humidity, even when outdoor air is moist.** Minimum resting time and a manual hold still apply.

An adjustable fan ramps from its active minimum at the current start threshold to its maximum at the full-demand threshold. On/off fans use the same adaptive start/rest decisions.

The saturation-pressure conversion follows the [National Weather Service formula](https://www.weather.gov/media/epz/wxcalc/vaporPressure.pdf). The bounded anticipation and thermal moderation are Havo design heuristics, not a building condensation model. Outdoor weather describes nearby conditions and does not measure the actual replacement air reaching a room; drying performance and suitable settings need verification in each home.

## Timing, missing data and manual control

| Setting | Initial value |
| --- | --- |
| Minimum active time | 5 minutes |
| Minimum resting time | 2 minutes |
| Manual hold | 1 hour |
| Background speed | Disabled; 20% suggested when enabled |
| Active speed range | 40–100%, normalized to device steps |

The engine reacts to state changes, reevaluates every 30 seconds and schedules deadline wakeups. Closing the panel does not interrupt automation. Configuration, demand state, transition times and manual hold deadlines survive restarts.

If outdoor data or the indoor temperature is missing in humidity mode, Havo uses the fixed reference/rest thresholds. If the primary measurement is missing—indoor temperature in temperature mode or humidity in humidity mode—Havo freezes automatic decisions and preserves the fan state. Invalid values and units are rejected.

External changes to power, percentage or preset mode pause only the affected ventilation. Havo recognizes its own command contexts and uses a short matching acknowledgement window for integrations that omit them. Manual commands take priority over minimum automatic run/rest times. Disabling automation, removing a ventilation or unloading Havo leaves physical fan states intact.

## Command activity

Open a fan's native **Activity** view to see requests such as **Havo: turn-on requested — humidity extraction** or **Havo: speed of 33% requested — background ventilation**. On/off fans never receive a percentage; speed entries contain the actual target after adjustment to the fan's supported steps.

Reasons come from the engine at dispatch: cooling, humidity extraction, background ventilation, return to rest, minimum running/resting time, or a manual command in Havo. Recalculations without a command and external manual changes do not create Havo command entries. Failed or timed-out service calls add an explicit error entry; a request never proves that the device physically changed state.

Havo supplies an origin event and a standard entry associated with the fan. The native details can attribute a state change to **Havo — reason** when the device integration preserves the command context. If it drops that context, the Havo request remains in the fan's Activity but the physical change cannot reliably be linked to it. Speed-only changes are covered by the request entry even when Home Assistant does not show a separate state transition. The unfiltered Activity feed may show both the origin and request entries.

[Activity/Logbook](https://www.home-assistant.io/integrations/logbook/) and Recorder must be enabled, with the fan and Havo events included in their filters. Existing history is not backfilled. Messages are recorded in the Home Assistant server's configured language (English, or French including regional variants), independently of each viewer's language. User-defined entity names are preserved.

## Development and validation

Python 3.14 and Node.js 24:

```sh
uv sync --frozen
uv run --frozen ruff check .
uv run --frozen ruff format --check .
uv run --frozen pytest
npm ci
npm run check
npm test
npm run build
```

The integration contains its complete panel bundle and Lit license; no CDN is used. CI checks Python, TypeScript, panel tests, reproducible bundle, Hassfest and HACS. The release workflow validates matching tag, manifest/project/lock versions and release notes before publication.

Tests use simulated devices. They do not establish suitability or calibration for a home's actual ventilation equipment. See [panel development](frontend/README.md) and [initial version notes](releases/0.1.0.md).

## License

MIT. The embedded Lit runtime retains its license. Havo is an independent custom integration and is not an official Home Assistant product.
