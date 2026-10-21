# Havo frontend — Home Assistant Ventilation Orchestrator

TypeScript/Lit sources live in `src/`; the standalone bundle is distributed in `custom_components/havo/frontend/`. From the repository root, use Node.js 24:

```sh
npm ci
npm run check
npm test
npm run build
```

The panel follows Halo’s room list/detail navigation, tab hierarchy and Home Assistant theme variables. Configuration is restricted by server permissions. English is the product reference language, with complete French and Spanish support, including regional variants. Unsupported languages fall back to English and user-defined names are preserved. Speed controls are shown only for fans with `SET_SPEED`; preset-only fans are never treated as variable-speed fans. The entity picker is adapted from Halo, without importing private Home Assistant components. The public `hass-action` event requests native entity controls.

The WebSocket API uses `havo/get`, `havo/subscribe`, `havo/save` (configuration and revision) and `havo/command` (`vent_id`, command and optional value). Commands are `turn_on`, `turn_off`, `set_percentage`, `automation` and `resume`. Server error codes are translated. Drafts persist across views, reject invalid values and detect concurrent revisions. Saving acknowledges the submitted data while preserving subsequent edits. DOM tests use a simulated connection.

A 48 px menu button opens the Home Assistant sidebar when the host supplies `narrow: true` or `hass.dockedSidebar: "always_hidden"`. Kiosk mode and external apps with their own sidebar hide it. The button emits a bubbling, composed `hass-toggle-menu` event with `{ open: true }`, preserving the current view and draft without saving or issuing device commands. Its accessible label is translated into English, French and Spanish.

## Isolated visual preview and screenshots

Build the bundle, then serve the **repository root** on loopback:

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

Open the [English](http://127.0.0.1:8766/frontend/dev.html?lang=en), [French](http://127.0.0.1:8766/frontend/dev.html?lang=fr) or [Spanish](http://127.0.0.1:8766/frontend/dev.html?lang=es) preview. The simulation banner and toolbar remain outside the panel. Its height uses the remaining viewport, including on mobile. All sample rooms, fans, sensors and toolbar labels switch language; user-edited names remain intact.

| Query | Preview |
| --- | --- |
| `lang=en` / `lang=fr` / `lang=es` | English / French / Spanish; regional variants such as `fr-BE` and `es-MX` select their base language |
| `theme=light` / `theme=dark` | Light / dark Home Assistant-style tokens |
| `theme=home` | Dark palette matching the reference Halo comparison |
| `theme=contrast` | Custom fonts, spacing and higher-contrast colours |
| `room=bathroom` | Open the bathroom; also `lounge`, `office`, `bedroom`, `kitchen`, `laundry`, `garage`, `attic` |
| `view=control` / `ventilations` / `automation` / `settings` | Open a room tab |
| `view=global` | Open global settings |
| `role=user` | Preview a user without configuration privileges |
| `outdoor=missing` | No secondary outdoor data; humidity thresholds remain 75% / 70% |
| `timeout=active` | Explicit sample with extraction timeout enabled and 90 minutes remaining |

For example, [French bathroom in the reference dark palette](http://127.0.0.1:8766/frontend/dev.html?lang=fr&theme=home&room=bathroom) and [English humidity automation](http://127.0.0.1:8766/frontend/dev.html?lang=en&room=bathroom&view=automation) provide reproducible screenshot entry points. The toolbar cycles through English → French → Spanish and also switches theme, administrator/user role and 100%/125% text size.

Six rooms have configured ventilation and two are ready to configure. Fixtures include on/off, stepped, continuous and preset-only fans, an unavailable fan, dedicated outdoor sensors and a weather fallback. Humidity defaults are 75% reference, 5-point hysteresis and 85% full demand; adaptive displayed thresholds follow the same calculation as `climate.py`. The optional extraction timeout is **disabled by default** and retains its 180-minute setting. `timeout=active` is a separate demonstration scenario.

`dev.html` does not connect to Home Assistant, contain credentials, run an automation engine or call any physical device. All changes and commands stay in memory and reset on reload. A native more-info request is recorded and explained in the toolbar instead of opening a fake native dialog. These screenshots demonstrate panel layout; they are not evidence of installation or operation in a real home. `window.havoCalls` exposes simulated calls and `window.havoPreviewSnapshot()` returns a copy of the current fixture state for inspection.

The preview mirrors Home Assistant’s `narrow` property at 870 px. Clicking the menu button records the native menu event and displays a confirmation in the preview toolbar; the standalone page has no Home Assistant sidebar.

The preview renders official [Material Design Icons SVG paths](https://github.com/Templarian/MaterialDesign/tree/master/svg) by Pictogrammers, under [Apache 2.0](https://github.com/Templarian/MaterialDesign/blob/master/LICENSE). This small SVG renderer belongs only to the preview; Home Assistant supplies the real `ha-icon` component in production. The preview loads no remote icons, fonts or scripts.
