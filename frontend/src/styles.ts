import { css } from "lit";
export const styles = css`
  :host {
    display: block;
    height: 100%;
    color: var(--primary-text-color, CanvasText);
    background: var(--primary-background-color, Canvas);
    font-family: var(--ha-font-family-body, Roboto, Arial, sans-serif);
    font-size: var(--ha-font-size-m, 14px);
    --line: var(--divider-color, GrayText);
    --surface: var(--ha-card-background, var(--card-background-color, Canvas));
    --radius: var(--ha-border-radius-lg, 12px);
    --accent: var(--primary-color, Highlight);
  }
  * {
    box-sizing: border-box;
  }
  .shell {
    height: 100%;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }
  header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 28px 12px;
  }
  header h1 {
    font-size: 24px;
    margin: 0;
    font-weight: 600;
  }
  header ha-icon {
    color: var(--accent);
  }
  header p {
    margin: 3px 0 0;
    color: var(--secondary-text-color);
  }
  .connection {
    margin-left: auto;
    font-size: 12px;
    color: var(--secondary-text-color);
  }
  nav {
    display: flex;
    gap: 4px;
    padding: 0 24px 12px;
    border-bottom: 1px solid var(--line);
  }
  button,
  input,
  select {
    font: inherit;
    color: inherit;
  }
  button {
    cursor: pointer;
    border: 1px solid var(--line);
    border-radius: var(--ha-border-radius-md, 8px);
    background: var(--surface);
    padding: 9px 13px;
    min-height: 40px;
  }
  button:hover {
    background: var(--secondary-background-color);
  }
  button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  button.primary {
    color: var(--text-primary-color, HighlightText);
    background: var(--accent);
    border-color: var(--accent);
  }
  button[aria-selected="true"],
  button.selected {
    color: var(--accent);
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 8%, var(--surface));
  }
  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }
  input,
  select {
    width: 100%;
    min-height: 40px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--input-fill-color, var(--surface));
    padding: 9px 10px;
    margin-top: 6px;
  }
  input:invalid {
    border-color: var(--error-color);
  }
  input[type="checkbox"] {
    width: 18px;
    min-height: 18px;
    margin: 0;
    accent-color: var(--accent);
  }
  input[type="range"] {
    padding: 0;
    accent-color: var(--accent);
  }
  label {
    display: block;
    font-size: 14px;
  }
  label.check {
    display: flex;
    align-items: center;
    gap: 9px;
    margin: 16px 0;
  }
  .layout {
    display: grid;
    grid-template-columns: 250px minmax(0, 1fr);
    flex: 1;
    min-height: 0;
  }
  aside {
    border-right: 1px solid var(--line);
    padding: 20px 14px;
  }
  aside input {
    margin: 0 0 15px;
  }
  .room {
    display: block;
    width: 100%;
    text-align: left;
    margin-bottom: 7px;
  }
  .room small {
    display: block;
    margin-top: 5px;
    color: var(--secondary-text-color);
  }
  main {
    padding: 24px 28px 40px;
    max-width: 1080px;
    width: 100%;
    margin: 0 auto;
    min-width: 0;
  }
  h2 {
    font-size: 22px;
    margin: 0 0 20px;
  }
  h3 {
    font-size: 17px;
    margin: 0;
  }
  p {
    line-height: 1.55;
  }
  .muted,
  small {
    color: var(--secondary-text-color);
  }
  .empty {
    padding: 70px 20px;
    text-align: center;
    color: var(--secondary-text-color);
  }
  .empty ha-icon {
    --mdc-icon-size: 44px;
    margin-bottom: 16px;
  }
  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 22px;
  }
  .card {
    border: 1px solid var(--line);
    background: var(--surface);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 16px;
  }
  .card-head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  .card-head ha-icon {
    color: var(--accent);
  }
  .card-head .badge {
    margin-left: auto;
  }
  .badge {
    border-radius: 20px;
    padding: 5px 10px;
    background: var(--secondary-background-color);
    font-size: 12px;
  }
  .row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
  .metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
    gap: 12px;
    margin: 18px 0;
  }
  .metric {
    border-left: 2px solid var(--line);
    padding-left: 12px;
  }
  .metric strong {
    display: block;
    margin: 5px 0;
    font-size: 20px;
    font-weight: 500;
  }
  .reason {
    color: var(--accent);
  }
  details {
    margin-top: 16px;
  }
  summary {
    cursor: pointer;
    padding: 8px 0;
  }
  .help {
    font-size: 13px;
    line-height: 1.55;
    color: var(--secondary-text-color);
  }
  .notice {
    margin: 12px 24px 0;
    padding: 12px 16px;
    border: 1px solid var(--line);
    border-radius: 8px;
  }
  .notice.error {
    color: var(--error-color);
    border-color: var(--error-color);
  }
  footer {
    position: sticky;
    bottom: 0;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-top: 1px solid var(--line);
    background: var(--surface);
    z-index: 2;
  }
  footer span {
    flex: 1;
  }
  .back {
    display: none;
    margin-bottom: 16px;
  }
  .danger {
    color: var(--error-color);
  }
  .entity-name {
    overflow-wrap: anywhere;
  }
  .settings-list {
    max-width: 700px;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  @media (max-width: 760px) {
    header {
      padding: 18px 16px 12px;
    }
    header p {
      font-size: 12px;
    }
    nav {
      padding: 0 12px 12px;
    }
    .layout {
      display: block;
    }
    aside {
      border-right: 0;
    }
    .layout.has-room aside {
      display: none;
    }
    .layout:not(.has-room) main {
      display: none;
    }
    main {
      padding: 20px 16px 32px;
    }
    .back {
      display: inline-flex;
    }
    .grid {
      grid-template-columns: 1fr;
    }
    .tabs {
      gap: 4px;
    }
    .tabs button {
      padding: 8px 10px;
    }
    footer {
      padding: 12px;
      flex-wrap: wrap;
    }
    footer span {
      flex-basis: 100%;
    }
    .connection {
      max-width: 90px;
      text-align: right;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
    }
  }
`;
