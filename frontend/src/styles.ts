import { css } from "lit";

/** Inherit the active Home Assistant theme, including changes made after mount. */
export const styles = css`
  :host {
    --havo-bg: var(--primary-background-color, Canvas);
    --havo-surface: var(--ha-card-background, var(--card-background-color, var(--havo-bg)));
    --havo-muted-bg: var(--secondary-background-color, var(--havo-surface));
    --havo-text: var(--primary-text-color, CanvasText);
    --havo-secondary: var(--secondary-text-color, var(--havo-text));
    --havo-line: var(--divider-color, var(--outline-color, GrayText));
    --havo-accent: var(--primary-color, Highlight);
    --havo-on-accent: var(--text-primary-color, HighlightText);
    --havo-selected: color-mix(in srgb, var(--havo-accent) 10%, var(--havo-surface));
    --havo-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
    --havo-control-radius: var(--ha-border-radius-md, 8px);
    --havo-fast: var(--ha-animation-duration-fast, 150ms);
    --havo-space: var(--ha-space-4, 16px);
    display: flex; flex-direction: column; height: 100vh; height: 100dvh; overflow: hidden;
    color: var(--havo-text); background: var(--havo-bg); color-scheme: inherit;
    font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, inherit));
    font-size: var(--ha-font-size-m, 14px); line-height: var(--ha-line-height-normal, 1.6);
    font-weight: var(--ha-font-weight-normal, 400);
  }
  * { box-sizing: border-box; scrollbar-width: thin; scrollbar-color: var(--scrollbar-thumb-color,var(--havo-line)) transparent; }
  [hidden] { display: none !important; }
  ::selection { background: var(--havo-accent); color: var(--havo-on-accent); }
  :focus-visible { outline: 2px solid var(--havo-accent); outline-offset: 3px; }
  .app-header {
    display: flex; align-items: center; gap: var(--ha-space-6, 24px); min-height: 60px;
    padding: 0 var(--ha-space-5, 20px); flex-shrink: 0; z-index: 3;
    background: var(--app-header-background-color, var(--havo-surface));
    color: var(--app-header-text-color, var(--havo-text));
    border-bottom: var(--app-header-border-bottom, 1px solid var(--havo-line));
  }
  .brand { display: flex; align-items: center; gap: var(--ha-space-3, 12px); flex-shrink: 0; }
  .brand h1 { font-size: var(--ha-font-size-xl, 20px); margin: 0; letter-spacing: -.02em; }
  .brand small { display: none; }
  ha-icon { --mdc-icon-size: 20px; width: 20px; height: 20px; display: inline-flex; flex-shrink: 0; color: currentColor; }
  .brand ha-icon { --mdc-icon-size: 24px; width: 24px; height: 24px; }
  h1,h2,h3,h4 { font-family: var(--ha-font-family-heading, var(--ha-font-family-body, inherit)); font-weight: var(--ha-font-weight-bold, 700); line-height: var(--ha-line-height-condensed, 1.2); overflow-wrap: anywhere; }
  h2 { font-size: var(--ha-font-size-xl, 20px); margin: 0; }
  h3 { font-size: var(--ha-font-size-l, 16px); margin: 0 0 var(--ha-space-3, 12px); }
  h4 { font-size: var(--ha-font-size-m, 14px); margin: 0 0 var(--ha-space-2, 8px); }
  p { margin: var(--ha-space-2, 8px) 0 var(--ha-space-4, 16px); }
  small,.help,.room-meta { color: var(--havo-secondary); }
  small { font-size: var(--ha-font-size-s, 12px); }
  .help { line-height: 1.55; max-width: 75ch; }
  .content { flex: 1; min-height: 0; display: flex; overflow: hidden; }
  main { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; }
  .row,.actions,.section-actions { display: flex; align-items: center; gap: var(--ha-space-2, 8px); flex-wrap: wrap; }
  .grow { flex: 1; min-width: 0; }
  .top-nav { display: flex; align-self: stretch; gap: var(--ha-space-2, 8px); min-width: 0; }
  .top-nav button {
    position: relative; border: 0; border-radius: 0; padding: var(--ha-space-3, 12px) var(--ha-space-4, 16px);
    background: transparent; color: inherit; font-weight: var(--ha-font-weight-medium, 500);
  }
  .top-nav button[aria-current="page"]::after {
    content: ""; position: absolute; inset-inline: var(--ha-space-4, 16px); bottom: 0; height: 3px;
    background: currentColor; border-radius: 3px 3px 0 0;
  }
  .top-nav button:hover:not(:disabled) { background: color-mix(in srgb, currentColor 8%, transparent); }
  .workspace { display: grid; grid-template-columns: 264px minmax(0,1fr); flex: 1; min-height: 0; }
  .room-rail { min-height: 0; overflow-y: auto; background: var(--havo-surface); border-inline-end: 1px solid var(--havo-line); padding: var(--ha-space-4, 16px) var(--ha-space-3, 12px); }
  .rail-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 4px 8px 12px; }
  .rail-heading h2 { font-size: var(--ha-font-size-l, 16px); }
  .rail-search { margin: 0 4px 12px; }
  .room-list { list-style: none; margin: 0; padding: 0; }
  .room-item { display: flex; align-items: center; gap: 4px; padding: 3px; margin-bottom: 4px; border-radius: var(--havo-control-radius); min-width: 0; }
  .room-item[data-active] { background: var(--havo-selected); }
  .room-link { justify-content: flex-start; display: flex; gap: 10px; align-items: center; flex: 1; min-width: 0; text-align: start; border: 0; background: transparent; padding: 10px 8px; }
  .room-link > span { min-width: 0; }
  .room-link strong { display: block; font-weight: var(--ha-font-weight-medium, 500); overflow-wrap: anywhere; }
  .room-link .room-meta { display: block; font-size: var(--ha-font-size-s, 12px); line-height: 1.45; overflow-wrap: anywhere; }
  .room-item[data-active] .room-link { color: var(--havo-accent); }
  .quick-toggle { align-self: center; margin-inline-end: 4px; }
  .quick-toggle[aria-pressed="true"],.room-item[data-state="on"] .room-link > ha-icon {
    color: var(--state-fan-on-color, var(--state-fan-active-color, var(--state-active-color, var(--havo-accent))));
  }
  .quick-toggle[aria-pressed="false"] { color: var(--state-fan-off-color, var(--state-fan-inactive-color, var(--state-inactive-color, var(--havo-secondary)))); }
  .room-detail { min-width: 0; min-height: 0; overflow: auto; padding: var(--ha-space-5, 20px) var(--ha-space-6, 24px) 32px; scroll-padding: 16px; }
  .room-heading { display: flex; align-items: center; justify-content: flex-start; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
  .room-heading .help { margin: 4px 0 0; }
  .room-heading .back-button { display: none; }
  .room-heading h2 { font-size: var(--ha-font-size-2xl, 24px); }
  .room-tabs { display: flex; gap: 4px; overflow-x: auto; padding: 4px 0; border-bottom: 1px solid var(--havo-line); margin-bottom: var(--ha-space-5, 20px); }
  .room-tabs button { flex-shrink: 0; border: 0; background: transparent; color: var(--havo-secondary); border-radius: var(--havo-control-radius); padding: 8px 12px; }
  .room-tabs button[aria-current="page"],.room-tabs button[aria-selected="true"] { color: var(--havo-accent); background: var(--havo-selected); font-weight: var(--ha-font-weight-medium, 500); }
  .room-panel { min-width: 0; }
  .room-detail .notice { margin: 12px 0; }
  section,.card { min-width: 0; }
  .room-panel > section,.room-panel > details,.room-panel > div > section { padding: 0; margin-bottom: 24px; }
  .section-heading { display: flex; align-items: center; gap: 12px; justify-content: space-between; flex-wrap: wrap; margin-bottom: 16px; }
  .section-heading .help-details { margin: 0; }
  .settings-group { padding: 20px 0; border-bottom: 1px solid var(--havo-line); }
  .settings-group:first-child { padding-top: 0; }
  .compact-help { font-size: var(--ha-font-size-s,12px); }
  .room-summary { margin-bottom: 16px; }
  .count { color: var(--havo-secondary); font-size: var(--ha-font-size-s,12px); font-variant-numeric: tabular-nums; }
  .danger-zone { margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--havo-line); }
  .section-heading h2 { font-size: var(--ha-font-size-l, 16px); }
  .room-panel > details > summary { font-size: var(--ha-font-size-l, 16px); }
  .grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(min(100%,290px),1fr)); gap: var(--ha-space-5, 20px); }
  .field-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(min(100%,200px),1fr)); gap: var(--ha-space-2, 8px) var(--ha-space-4, 16px); }
  label { display: flex; flex-direction: column; gap: 6px; font-size: var(--ha-font-size-m, 14px); margin: 8px 0; min-width: 0; }
  /* Share label/control rows, including the entity picker's shadow content. */
  .field-grid > label:not(.check),.field-grid > havo-entity-picker { display: grid; grid-row: span 2; grid-template-rows: subgrid; row-gap: 6px; align-items: start; }
  .field-grid > havo-entity-picker::part(control) { margin-top: 0; }
  .check { flex-direction: row; align-items: center; gap: 10px; min-height: 32px; cursor: pointer; }
  input,select,button { font: inherit; }
  input,select { min-width: 0; width: 100%; min-height: 38px; padding: 7px 10px; border: 1px solid var(--input-outlined-idle-border-color,var(--havo-line)); border-radius: var(--havo-control-radius); background: var(--input-fill-color,var(--havo-surface)); color: var(--input-ink-color,var(--havo-text)); caret-color: var(--havo-accent); }
  input:hover,select:hover { border-color: var(--input-outlined-hover-border-color,var(--havo-secondary)); }
  input::placeholder { color: var(--input-label-ink-color,var(--havo-secondary)); opacity: 1; }
  input[type="checkbox"] { width: 18px; height: 18px; min-height: 18px; padding: 0; flex-shrink: 0; accent-color: var(--havo-accent); }
  input[type="color"] { padding: 3px; }
  input:invalid { border-color: var(--error-color,var(--havo-text)); }
  button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 36px; max-width: 100%; padding: 7px 12px; border: 1px solid var(--outline-color,var(--havo-line)); border-radius: var(--havo-control-radius); background: var(--havo-surface); color: var(--havo-text); cursor: pointer; line-height: 1.4; transition: background-color var(--havo-fast),color var(--havo-fast),border-color var(--havo-fast); }
  button:hover:not(:disabled) { background: var(--havo-muted-bg); border-color: var(--outline-hover-color,var(--havo-secondary)); }
  button:active:not(:disabled) { background: var(--havo-selected); }
  button.primary { background: var(--havo-accent); color: var(--havo-on-accent); border-color: transparent; }
  button.primary:hover:not(:disabled) { background: var(--havo-accent); filter: brightness(.94); }
  button:disabled { color: var(--disabled-text-color,var(--havo-secondary)); cursor: default; }
  button.primary:disabled { background: var(--havo-muted-bg); border-color: var(--havo-line); filter: none; }
  .icon-button { width: 36px; min-width: 36px; height: 36px; padding: 7px; border-color: transparent; background: transparent; }
  .app-header .sidebar-toggle { width: 48px; min-width: 48px; height: 48px; padding: 12px; flex-shrink: 0; border: 0; border-radius: 50%; color: inherit; }
  .app-header .sidebar-toggle:hover { background: color-mix(in srgb, currentColor 8%, transparent); }
  .danger { color: var(--error-color,var(--havo-text)); }
  .badge { display: inline-flex; align-items: center; gap: 5px; font-size: var(--ha-font-size-s,12px); color: var(--havo-secondary); padding: 2px 0; font-variant-numeric: tabular-nums; }
  .badge + .badge::before { content: "·"; margin-inline: 8px; }
  .notice { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; margin: 12px 20px; background: var(--havo-selected); border: 1px solid var(--havo-line); border-radius: var(--havo-control-radius); line-height: 1.5; }
  .notice.error { color: var(--error-color,var(--havo-text)); background: var(--havo-surface); }
  .savebar { flex-shrink: 0; z-index: 4; display: flex; align-items: center; gap: 12px; padding: 12px 20px calc(12px + env(safe-area-inset-bottom,0px)); border-top: 1px solid var(--havo-line); background: var(--havo-surface); }
  .savebar .grow { font-size: var(--ha-font-size-m,14px); }
  details { min-width: 0; }
  summary { cursor: pointer; font-weight: var(--ha-font-weight-medium,500); min-height: 36px; padding: 6px 0; }
  details[open] > summary { margin-bottom: 12px; }
  .help-details { color: var(--havo-secondary); margin: 8px 0 16px; }
  .help-details summary ha-icon { vertical-align: middle; margin-inline-end: 4px; }
  .help-details summary { font-size: var(--ha-font-size-s,12px); min-height: 28px; }
  .help-details .help { margin: 0 0 10px; }
  .help-details[open] > summary { margin-bottom: 4px; }
  .shell { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }
  .room-panel > .card { padding: 0 0 24px; margin: 0 0 24px; border-bottom: 1px solid var(--havo-line); }
  .room-panel > .card:last-child { border-bottom: 0; }
  .card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .card-head h3 { margin-bottom: 4px; }
  .card-head .badge { margin-inline-start: auto; }
  .card-head[data-state="on"] > ha-icon { color: var(--state-fan-on-color, var(--state-fan-active-color, var(--state-active-color, var(--havo-accent)))); }
  .control-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin: 12px 0; }
  .control-actions .check { margin: 0; }
  .reason { color: var(--havo-secondary); font-size: var(--ha-font-size-s,12px); }
  .metrics { display: grid; grid-template-columns: repeat(auto-fit,minmax(min(100%,145px),1fr)); gap: 12px; margin: 18px 0; }
  .metric { border-inline-start: 2px solid var(--havo-line); padding-inline-start: 12px; }
  .metric strong { display: block; margin: 5px 0; font-size: var(--ha-font-size-xl,20px); font-weight: var(--ha-font-weight-medium,500); font-variant-numeric: tabular-nums; }
  .entity-name { overflow-wrap: anywhere; }
  .muted { color: var(--havo-secondary); }
  .speed-control { margin-top: 16px; }
  input[type="range"] { padding: 0; border: 0; accent-color: var(--havo-accent); background: transparent; }
  .global-settings { padding: 24px; overflow: auto; flex: 1; min-height: 0; }
  .global-settings > section { max-width: 980px; margin: 0 auto 28px; }
  .global-settings > h2 { max-width: 980px; margin: 0 auto 24px; }
  .empty-state { padding: 40px 24px; max-width: 520px; margin: 8vh auto 0; }
  .empty-state > ha-icon { --mdc-icon-size: 32px; width: 32px; height: 32px; color: var(--havo-secondary); margin-bottom: 16px; }
  .empty-state p { color: var(--havo-secondary); }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  @media (max-width:1100px) {
    .workspace { grid-template-columns: 224px minmax(0,1fr); }
    .room-detail { padding: 16px 18px 28px; }
    .room-tabs button { padding: 8px 10px; }
  }
  @media (max-width:760px) {
    .app-header { gap: 8px; padding: 8px 12px 0; flex-wrap: wrap; min-height: 52px; }
    .brand { padding-bottom: 8px; gap: 8px; }
    .brand h1 { font-size: var(--ha-font-size-l,16px); }
    .top-nav { margin-inline-start: auto; overflow-x: auto; }
    .top-nav button { padding: 10px 9px; font-size: var(--ha-font-size-s,12px); }
    .workspace { display: block; overflow: hidden; }
    .room-rail { height: 100%; border-inline-end: 0; padding: 16px 12px; }
    .workspace:not(.has-room) .room-detail { display: none; }
    .workspace.has-room .room-rail { display: none; }
    .workspace.has-room .room-detail { display: block; height: 100%; }
    .room-detail { padding: 16px 14px 28px; }
    .room-heading .back-button { display: inline-flex; }
    .room-link { padding: 12px 8px; }
    .room-heading h2 { font-size: var(--ha-font-size-xl,20px); }
    .room-tabs { margin-inline: -14px; padding: 4px 14px 8px; }
    .global-settings { padding: 20px 14px; }
    .savebar { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 10px 14px calc(10px + env(safe-area-inset-bottom,0px)); }
    .savebar .grow { grid-column: 1 / -1; font-size: var(--ha-font-size-s,12px); }
    .savebar button { min-width: 0; padding: 9px 6px; font-size: var(--ha-font-size-s,12px); }
    .notice { margin: 8px 12px; flex-wrap: wrap; }
    .empty-state { margin-top: 24px; padding: 16px; }
    .card-head { flex-wrap: wrap; }
    .card-head > div { flex: 1; min-width: 0; }
  }
  @media (pointer:coarse) { button,input,select,summary { min-height: 44px; } input[type="checkbox"] { min-height: 20px; width: 20px; height: 20px; } .icon-button { width: 44px; min-width: 44px; height: 44px; } }
  @media (prefers-reduced-motion:reduce) { *,*::before,*::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; } }
`;
