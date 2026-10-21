import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { Window } from "happy-dom";
import { emptyConfig, emptyRoom, newVentilation } from "../src/model";
import type { Hass, Snapshot, Ventilation } from "../src/types";

const window = new Window({ url: "http://127.0.0.1:8123" });
for (const key of [
  "window",
  "document",
  "customElements",
  "HTMLElement",
  "Element",
  "Node",
  "Document",
  "ShadowRoot",
  "CSSStyleSheet",
  "Event",
  "CustomEvent",
  "KeyboardEvent",
  "FocusEvent",
] as const)
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: key === "window" ? window : window[key],
  });
const { HavoPanel } = await import("../src/havo-panel");
function fixture(speed = false, admin = true): Snapshot {
  const caps = {
    available: true,
    speed,
    turn_on: true,
    turn_off: true,
    step: 1,
    presets: false,
  };
  const room = emptyRoom();
  room.ventilations.extractor = newVentilation(
    "fan.extractor",
    "Extracteur personnel",
  );
  return {
    revision: 1,
    admin,
    areas: [
      { id: "bathroom", name: "Salle de bains" },
      { id: "office", name: "Bureau" },
    ],
    config: { ...emptyConfig(), rooms: { bathroom: room } },
    entities: [
      {
        entity_id: "fan.extractor",
        name: "Extracteur",
        domain: "fan",
        area_id: "bathroom",
        unit: null,
        device_class: null,
        capabilities: caps,
      },
    ],
    status: { extractor: { reason: "idle", state: "off", capabilities: caps } },
    controllable: ["extractor"],
  };
}
async function settle(panel: InstanceType<typeof HavoPanel>) {
  await new Promise((resolve) => setTimeout(resolve, 5));
  await panel.updateComplete;
}
async function mount(
  initial = fixture(),
  save?: (message: Record<string, unknown>) => Promise<Snapshot>,
) {
  let snapshot = initial;
  let emit: (snapshot: Snapshot) => void = () => {};
  const calls: Record<string, unknown>[] = [];
  const hass: Hass = {
    locale: { language: "fr-BE" },
    themes: { darkMode: false },
    connection: {
      async subscribeMessage<T>(handler: (value: T) => void) {
        emit = handler as (snapshot: Snapshot) => void;
        emit(snapshot);
        return () => {};
      },
    },
    async callWS<T>(message: Record<string, unknown>) {
      calls.push(structuredClone(message));
      if (message.type === "havo/save") {
        if (save) return (await save(message)) as T;
        snapshot = {
          ...snapshot,
          revision: snapshot.revision + 1,
          config: structuredClone(message.config) as Snapshot["config"],
        };
      }
      return snapshot as T;
    },
  };
  const panel = window.document.createElement(
    "havo-panel",
  ) as unknown as InstanceType<typeof HavoPanel>;
  panel.hass = hass;
  window.document.body.appendChild(panel as never);
  await settle(panel);
  return {
    panel,
    calls,
    emit: (next: Snapshot) => {
      snapshot = next;
      emit(next);
    },
    hass,
  };
}
function button(panel: InstanceType<typeof HavoPanel>, text: string) {
  const result = [
    ...panel.shadowRoot!.querySelectorAll<HTMLButtonElement>("button"),
  ].find((item) => item.textContent?.trim() === text);
  assert.ok(result, `Missing button ${text}`);
  return result;
}
function field(panel: InstanceType<typeof HavoPanel>, key: keyof Ventilation) {
  const result = panel.shadowRoot!.querySelector<HTMLInputElement>(
    `[data-settings="extractor"] [data-field="${key}"]`,
  );
  assert.ok(result, `Missing field ${key}`);
  return result;
}
function humidityFixture(): Snapshot {
  const initial = fixture();
  initial.config.rooms.bathroom.ventilations.extractor.mode = "humidity";
  return initial;
}
async function open(panel: InstanceType<typeof HavoPanel>, tab = "Pilotage") {
  panel.shadowRoot!.querySelector<HTMLButtonElement>(".room")!.click();
  await settle(panel);
  if (tab !== "Pilotage") {
    button(panel, tab).click();
    await settle(panel);
  }
}
afterEach(() => window.document.body.replaceChildren());

test("on/off fans have no speed controls", async () => {
  const { panel } = await mount();
  await open(panel);
  assert.equal(panel.shadowRoot!.querySelector('input[type="range"]'), null);
  assert.match(panel.shadowRoot!.textContent!, /Marche \/ arrêt/);
  button(panel, "Automatisation").click();
  await settle(panel);
  assert.equal(
    panel.shadowRoot!.querySelector('[data-field="speed_min"]'),
    null,
  );
});
test("speed controls appear only for SET_SPEED", async () => {
  const { panel } = await mount(fixture(true));
  await open(panel);
  assert.ok(panel.shadowRoot!.querySelector('input[type="range"]'));
  button(panel, "Automatisation").click();
  await settle(panel);
  assert.ok(panel.shadowRoot!.querySelector('[data-field="speed_min"]'));
});
test("non-admin users only see controls", async () => {
  const { panel } = await mount(fixture(false, false));
  await open(panel);
  assert.equal(panel.shadowRoot!.querySelectorAll('[role="tab"]').length, 1);
  assert.doesNotMatch(panel.shadowRoot!.textContent!, /Réglages généraux/);
});
test("manual on/off sends no percentage", async () => {
  const { panel, calls } = await mount();
  await open(panel);
  button(panel, "Allumer").click();
  await settle(panel);
  assert.deepEqual(calls[0], {
    type: "havo/command",
    vent_id: "extractor",
    command: "turn_on",
  });
});
test("draft survives navigation, discard restores fields", async () => {
  const { panel } = await mount();
  await open(panel, "Automatisation");
  const field = panel.shadowRoot!.querySelector<HTMLInputElement>(
    '[data-field="temperature_on"]',
  )!;
  field.value = "27";
  field.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(panel);
  button(panel, "Ventilations").click();
  await settle(panel);
  button(panel, "Automatisation").click();
  await settle(panel);
  assert.equal(
    panel.shadowRoot!.querySelector<HTMLInputElement>(
      '[data-field="temperature_on"]',
    )!.value,
    "27",
  );
  button(panel, "Abandonner").click();
  await settle(panel);
  assert.equal(
    panel.shadowRoot!.querySelector<HTMLInputElement>(
      '[data-field="temperature_on"]',
    )!.value,
    "25",
  );
});
test("invalid numeric input blocks navigation", async () => {
  const { panel } = await mount();
  await open(panel, "Automatisation");
  const field = panel.shadowRoot!.querySelector<HTMLInputElement>(
    '[data-field="temperature_on"]',
  )!;
  field.value = "100";
  field.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(panel);
  button(panel, "Ventilations").click();
  await settle(panel);
  assert.ok(panel.shadowRoot!.querySelector('[data-field="temperature_on"]'));
  assert.equal(field.value, "100");
});
test("remote revision does not overwrite unsaved edits", async () => {
  const { panel, emit } = await mount();
  await open(panel, "Automatisation");
  const field = panel.shadowRoot!.querySelector<HTMLInputElement>(
    '[data-field="temperature_on"]',
  )!;
  field.value = "27";
  field.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(panel);
  emit({ ...fixture(), revision: 2 });
  await settle(panel);
  assert.equal(field.value, "27");
  assert.match(panel.shadowRoot!.textContent!, /ailleurs/);
  assert.equal(button(panel, "Enregistrer").disabled, true);
});
test("edits during a slow save remain in the draft", async () => {
  let finish!: (snapshot: Snapshot) => void;
  let sent!: Snapshot["config"];
  const { panel } = await mount(fixture(), (message) => {
    sent = structuredClone(message.config) as Snapshot["config"];
    return new Promise((resolve) => {
      finish = resolve;
    });
  });
  await open(panel, "Automatisation");
  const field = panel.shadowRoot!.querySelector<HTMLInputElement>(
    '[data-field="temperature_on"]',
  )!;
  field.value = "26";
  field.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(panel);
  button(panel, "Enregistrer").click();
  await settle(panel);
  field.value = "27";
  field.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(panel);
  finish({ ...fixture(), config: sent, revision: 2 });
  await settle(panel);
  assert.equal(field.value, "27");
  assert.ok(button(panel, "Enregistrer"));
});
test("keyboard tab navigation and dark theme", async () => {
  const { panel, hass } = await mount();
  await open(panel);
  const first = panel.shadowRoot!.querySelector('[role="tab"]')!;
  first.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
  );
  await settle(panel);
  assert.equal(
    panel.shadowRoot!.querySelector('[role="tab"][aria-selected="true"]')!
      .textContent?.trim(),
    "Ventilations",
  );
  panel.hass = { ...hass, themes: { darkMode: true } };
  await settle(panel);
  assert.equal(panel.style.colorScheme, "dark");
});

test("entity selection updates the saved room sensor", async () => {
  const initial = fixture();
  initial.entities.push({
    entity_id: "sensor.temp",
    name: "Temperature",
    domain: "sensor",
    area_id: null,
    unit: "°C",
    device_class: "temperature",
    capabilities: null,
  });
  const { panel, calls } = await mount(initial);
  await open(panel, "Automatisation");
  const picker = panel.shadowRoot!.querySelector("havo-entity-picker")!;
  picker.dispatchEvent(
    new CustomEvent("entity-changed", {
      detail: { value: "sensor.temp" },
      bubbles: true,
      composed: true,
    }),
  );
  await settle(panel);
  button(panel, "Enregistrer").click();
  await settle(panel);
  assert.equal(
    (calls[0].config as Snapshot["config"]).rooms.bathroom
      .temperature_entity_id,
    "sensor.temp",
  );
});

test("humidity timeout is opt-in per ventilation and its duration survives edits and navigation", async () => {
  const initial = humidityFixture();
  initial.config.rooms.bathroom.ventilations.other = newVentilation(
    "fan.other",
    "Autre ventilation",
  );
  initial.config.rooms.bathroom.ventilations.other.mode = "humidity";
  const { panel, calls } = await mount(initial);
  await open(panel, "Automatisation");
  assert.equal(field(panel, "humidity_timeout_enabled").checked, false);
  assert.equal(
    panel.shadowRoot!.querySelector('[data-field="humidity_timeout"]'),
    null,
  );
  field(panel, "humidity_timeout_enabled").click();
  await settle(panel);
  assert.equal(field(panel, "humidity_timeout").value, "180");
  const duration = field(panel, "humidity_timeout");
  assert.equal(duration.min, "1");
  assert.equal(duration.max, "1440");
  duration.value = "120";
  duration.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(panel);
  field(panel, "humidity_timeout_enabled").click();
  await settle(panel);
  field(panel, "humidity_timeout_enabled").click();
  await settle(panel);
  assert.equal(field(panel, "humidity_timeout").value, "120");
  button(panel, "Ventilations").click();
  await settle(panel);
  button(panel, "Automatisation").click();
  await settle(panel);
  assert.equal(field(panel, "humidity_timeout").value, "120");
  button(panel, "Enregistrer").click();
  await settle(panel);
  const saved = (calls[0].config as Snapshot["config"]).rooms.bathroom
    .ventilations;
  assert.equal(saved.extractor.humidity_timeout_enabled, true);
  assert.equal(saved.extractor.humidity_timeout, 7200);
  assert.equal(saved.other.humidity_timeout_enabled, false);
  assert.equal(saved.other.humidity_timeout, 10800);
});

test("humidity timeout is hidden in temperature mode without losing its configuration", async () => {
  const initial = humidityFixture();
  initial.config.rooms.bathroom.ventilations.extractor.humidity_timeout_enabled =
    true;
  initial.config.rooms.bathroom.ventilations.extractor.humidity_timeout = 9000;
  const { panel, calls } = await mount(initial);
  await open(panel, "Automatisation");
  const mode = panel.shadowRoot!.querySelector<HTMLSelectElement>("select")!;
  mode.value = "temperature";
  mode.dispatchEvent(new Event("change", { bubbles: true }));
  await settle(panel);
  assert.equal(
    panel.shadowRoot!.querySelector('[data-field="humidity_timeout_enabled"]'),
    null,
  );
  assert.equal(
    panel.shadowRoot!.querySelector('[data-field="humidity_timeout"]'),
    null,
  );
  button(panel, "Enregistrer").click();
  await settle(panel);
  const saved = (calls[0].config as Snapshot["config"]).rooms.bathroom
    .ventilations.extractor;
  assert.equal(saved.mode, "temperature");
  assert.equal(saved.humidity_timeout_enabled, true);
  assert.equal(saved.humidity_timeout, 9000);
});

test("humidity timeout rejects durations outside one minute to one day", async () => {
  const initial = humidityFixture();
  initial.config.rooms.bathroom.ventilations.extractor.humidity_timeout_enabled =
    true;
  const { panel, calls } = await mount(initial);
  await open(panel, "Automatisation");
  const duration = field(panel, "humidity_timeout");
  for (const invalid of ["0", "1441"]) {
    duration.value = invalid;
    duration.dispatchEvent(new Event("input", { bubbles: true }));
    await settle(panel);
    button(panel, "Enregistrer").click();
    await settle(panel);
    assert.equal(calls.length, 0);
  }
  duration.value = "1";
  duration.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(panel);
  button(panel, "Enregistrer").click();
  await settle(panel);
  assert.equal(
    (calls[0].config as Snapshot["config"]).rooms.bathroom.ventilations.extractor
      .humidity_timeout,
    60,
  );
});

test("humidity timeout settings and explanation follow English and French locales", async () => {
  const { panel, hass } = await mount(humidityFixture());
  await open(panel, "Automatisation");
  for (const locale of ["en", "fr-BE", "fr_CA"]) {
    panel.hass = { ...hass, locale: { language: locale } };
    await settle(panel);
    const text = panel.shadowRoot!.textContent!;
    if (locale === "en") {
      assert.match(text, /Limit extraction below the start threshold/);
      assert.match(text, /Reaching the start threshold resets the timer/);
      assert.match(text, /extraction can restart/);
    } else {
      assert.match(text, /Limiter l’extraction sous le seuil de démarrage/);
      assert.match(text, /remet le compteur à zéro/);
      assert.match(text, /l’extraction peut redémarrer/);
    }
    assert.match(text, /Extracteur personnel/);
  }
});

test("humidity timeout countdown is separate from minimum running time and its rest reason stays visible", async () => {
  const initial = humidityFixture();
  const now = Date.now() / 1000;
  initial.status.extractor = {
    ...initial.status.extractor,
    state: "on",
    reason: "minimum_run",
    deadline: now + 120,
    humidity_timeout_at: now + 10800,
  };
  const { panel, emit, hass } = await mount(initial);
  await open(panel);
  const reason = panel.shadowRoot!.querySelector(".reason")!.textContent!;
  assert.match(reason, /Durée minimale de marche/);
  assert.match(reason, /Temps restant 2 min/);
  assert.doesNotMatch(reason, /180/);
  const countdown = panel.shadowRoot!.querySelector(
    '[data-status="humidity-timeout"]',
  )!.textContent!;
  assert.match(countdown, /Retour au repos temporisé : temps restant\s+180\s+min/);
  emit({
    ...initial,
    status: {
      extractor: {
        ...initial.status.extractor,
        state: "off",
        reason: "humidity_timeout",
        deadline: null,
        humidity_timeout_at: null,
      },
    },
  });
  await settle(panel);
  assert.match(
    panel.shadowRoot!.querySelector(".reason")!.textContent!,
    /Au repos : durée sous le seuil de démarrage écoulée/,
  );
  assert.equal(
    panel.shadowRoot!.querySelector('[data-status="humidity-timeout"]'),
    null,
  );
  panel.hass = { ...hass, locale: { language: "en" } };
  await settle(panel);
  assert.match(
    panel.shadowRoot!.querySelector(".reason")!.textContent!,
    /At rest: time below the start threshold elapsed/,
  );
});
