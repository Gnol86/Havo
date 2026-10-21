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
  command?: (message: Record<string, unknown>) => Promise<Snapshot>,
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
      if (message.type === "havo/command" && command) {
        return (await command(message)) as T;
      }
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
function twoFanFixture(): Snapshot {
  const initial = fixture(true);
  initial.config.rooms.bathroom.ventilations.second = newVentilation(
    "fan.second",
    "Deuxième ventilation",
  );
  const capabilities = {
    ...initial.status.extractor.capabilities!,
    speed: false,
    presets: true,
  };
  initial.entities.push({
    ...initial.entities[0],
    entity_id: "fan.second",
    name: "Deuxième ventilation",
    capabilities,
  });
  initial.status.second = { reason: "idle", state: "off", capabilities };
  initial.controllable.push("second");
  return initial;
}
function roomToggle(panel: InstanceType<typeof HavoPanel>) {
  const result = panel.shadowRoot!.querySelector<HTMLButtonElement>(
    ".room-item .quick-toggle",
  );
  assert.ok(result, "Missing room power shortcut");
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

test("Home Assistant menu follows host layout and sidebar preferences in every language", async () => {
  const { panel, hass } = await mount(fixture(false, false));
  const menu = () => panel.shadowRoot!.querySelector<HTMLButtonElement>(".sidebar-toggle");
  assert.equal(menu(), null);
  panel.narrow = true;
  for (const [language, label] of [
    ["en", "Open Home Assistant menu"],
    ["fr-BE", "Ouvrir le menu Home Assistant"],
    ["es-MX", "Abrir el menú de Home Assistant"],
  ]) {
    panel.hass = { ...hass, locale: { language } };
    await settle(panel);
    assert.equal(menu()!.getAttribute("aria-label"), label);
    assert.equal(menu()!.title, label);
    assert.equal(menu()!.disabled, false);
  }
  panel.narrow = false;
  for (const dockedSidebar of ["always_hidden", "docked", "auto"] as const) {
    panel.hass = { ...hass, dockedSidebar };
    await settle(panel);
    assert.equal(Boolean(menu()), dockedSidebar === "always_hidden");
  }
  panel.narrow = true;
  panel.hass = { ...hass, dockedSidebar: "always_hidden", kioskMode: true };
  await settle(panel);
  assert.equal(menu(), null);
  panel.hass = { ...hass, auth: { external: { config: { hasSidebar: true } } } };
  await settle(panel);
  assert.equal(menu(), null);
  panel.hass = { ...hass, auth: { external: { config: { hasSidebar: false } } } };
  await settle(panel);
  assert.ok(menu());
});

test("opening the Home Assistant menu crosses shadow roots and preserves the draft", async () => {
  const { panel, hass, calls } = await mount();
  const host = document.createElement("div");
  document.body.appendChild(host);
  host.attachShadow({ mode: "open" }).appendChild(panel);
  panel.narrow = true;
  await settle(panel);
  await open(panel, "Automatisation");
  const temperature = field(panel, "temperature_on");
  temperature.value = "26";
  temperature.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(panel);
  const callsBefore = structuredClone(calls);
  let received: CustomEvent | undefined;
  host.addEventListener("hass-toggle-menu", event => { received = event as CustomEvent; });
  panel.shadowRoot!.querySelector<HTMLButtonElement>(".sidebar-toggle")!.click();
  await settle(panel);
  assert.deepEqual(received?.detail, { open: true });
  assert.equal(received?.composed, true);
  assert.equal(received?.bubbles, true);
  assert.equal(field(panel, "temperature_on").value, "26");
  assert.ok(panel.shadowRoot!.querySelector(".savebar"));
  assert.deepEqual(calls, callsBefore);
  panel.hass = { ...hass };
  await settle(panel);
  assert.equal(field(panel, "temperature_on").value, "26");
});

test("panel language follows Home Assistant locale, regional variants and language fallback", async () => {
  const { panel, hass } = await mount();
  for (const [locale, language, expectedLanguage, rooms] of [
    ["es", "fr", "es", "Habitaciones"],
    ["es-ES", "en", "es", "Habitaciones"],
    ["es_MX", "fr", "es", "Habitaciones"],
    [undefined, "ES-AR", "es", "Habitaciones"],
    ["fr_CA", "es", "fr", "Pièces"],
    ["de", "es", "en", "Rooms"],
    [undefined, undefined, "en", "Rooms"],
  ]) {
    panel.hass = {
      ...hass,
      locale: locale ? { language: locale } : undefined,
      language,
    };
    await settle(panel);
    assert.equal(
      panel.shadowRoot!.querySelector(".shell")!.getAttribute("lang"),
      expectedLanguage,
    );
    assert.ok(button(panel, rooms!));
    assert.match(panel.shadowRoot!.textContent!, /Salle de bains/);
  }
});

test("Spanish labels update live while custom ventilation names and drafts remain unchanged", async () => {
  const { panel, hass, calls } = await mount();
  await open(panel, "Ventilations");
  const name = panel.shadowRoot!.querySelector<HTMLInputElement>(
    'input[maxlength="100"]',
  )!;
  name.value = "Extracteur personnalisé — baño";
  name.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(panel);
  for (const [locale, heading] of [
    ["es_MX", "Añadir una ventilación"],
    ["fr-BE", "Ajouter une ventilation"],
    ["en", "Add a ventilation"],
    ["ES-AR", "Añadir una ventilación"],
  ]) {
    panel.hass = { ...hass, locale: { language: locale } };
    await settle(panel);
    assert.ok(panel.shadowRoot!.textContent!.includes(heading));
    assert.equal(
      panel.shadowRoot!.querySelector<HTMLInputElement>(
        'input[maxlength="100"]',
      )!.value,
      "Extracteur personnalisé — baño",
    );
    assert.match(panel.shadowRoot!.textContent!, /Salle de bains/);
  }
  button(panel, "Guardar").click();
  await settle(panel);
  const saved = (calls[0].config as Snapshot["config"]).rooms.bathroom
    .ventilations.extractor;
  assert.equal(saved.name, "Extracteur personnalisé — baño");
  assert.equal(saved.entity_id, "fan.extractor");
  assert.match(panel.shadowRoot!.textContent!, /Cambios guardados\./);
});

test("Spanish entity picker localizes search and empty results without translating entity names", async () => {
  const initial = fixture();
  initial.entities.push({
    entity_id: "sensor.temperature_personnelle",
    name: "Température personnalisée",
    domain: "sensor",
    area_id: "bathroom",
    device_class: "temperature",
    unit: "°C",
    capabilities: null,
  });
  const { panel, hass } = await mount(initial);
  await open(panel, "Automatisation");
  panel.hass = { ...hass, locale: { language: "es-ES" } };
  await settle(panel);
  const picker = panel.shadowRoot!.querySelector("havo-entity-picker")!;
  const input = picker.shadowRoot!.querySelector<HTMLInputElement>("input")!;
  assert.match(picker.shadowRoot!.textContent!, /Temperatura de la habitación/);
  assert.equal(input.placeholder, "Buscar entidades");
  input.focus();
  await settle(panel);
  assert.match(picker.shadowRoot!.textContent!, /Température personnalisée/);
  assert.match(picker.shadowRoot!.textContent!, /sensor.temperature_personnelle/);
  input.value = "no existe";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(panel);
  assert.match(picker.shadowRoot!.textContent!, /Sin resultados/);
  panel.hass = { ...hass, locale: { language: "fr-BE" } };
  await settle(panel);
  assert.equal(input.placeholder, "Rechercher des entités");
  assert.match(picker.shadowRoot!.textContent!, /Aucun résultat/);
});

test("Spanish command errors follow language changes without changing custom names", async () => {
  const { panel, hass, calls } = await mount(fixture(), undefined, async () => {
    throw { code: "invalid_command" };
  });
  await open(panel);
  panel.hass = { ...hass, language: "es_MX", locale: undefined };
  await settle(panel);
  assert.match(panel.shadowRoot!.textContent!, /Extracteur personnel/);
  button(panel, "Encender").click();
  await settle(panel);
  assert.match(
    panel.shadowRoot!.querySelector('[role="alert"]')!.textContent!,
    /Este comando no es compatible\./,
  );
  panel.hass = { ...hass, locale: { language: "en" } };
  await settle(panel);
  assert.match(
    panel.shadowRoot!.querySelector('[role="alert"]')!.textContent!,
    /This command is not supported\./,
  );
  assert.match(panel.shadowRoot!.textContent!, /Extracteur personnel/);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].vent_id, "extractor");
});

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
  assert.doesNotMatch(panel.shadowRoot!.textContent!, /Réglages globaux/);
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
test("room power keeps one direction for every fan after the first live state update", async () => {
  const initial = twoFanFixture();
  const current = structuredClone(initial);
  const { panel, calls } = await mount(initial, undefined, async (message) => {
    current.status[message.vent_id as string].state = "on";
    return structuredClone(current);
  });
  roomToggle(panel).click();
  await settle(panel);
  assert.deepEqual(calls, [
    { type: "havo/command", vent_id: "extractor", command: "turn_on" },
    { type: "havo/command", vent_id: "second", command: "turn_on" },
  ]);
  assert.equal(roomToggle(panel).getAttribute("aria-pressed"), "true");
});

test("room power turns every fan off when the room has mixed power states", async () => {
  const initial = twoFanFixture();
  initial.status.extractor.state = "on";
  const { panel, calls } = await mount(initial);
  roomToggle(panel).click();
  await settle(panel);
  assert.deepEqual(calls, [
    { type: "havo/command", vent_id: "extractor", command: "turn_off" },
    { type: "havo/command", vent_id: "second", command: "turn_off" },
  ]);
});

test("room power requires permissions, availability and the requested capability for every fan", async (t) => {
  const cases: {
    name: string;
    modify: (snapshot: Snapshot) => void;
  }[] = [
    {
      name: "one fan is not controllable",
      modify: (snapshot) => {
        snapshot.controllable = ["extractor"];
      },
    },
    {
      name: "one fan is unavailable",
      modify: (snapshot) => {
        snapshot.status.second.capabilities!.available = false;
      },
    },
    {
      name: "one fan cannot turn on",
      modify: (snapshot) => {
        snapshot.status.second.capabilities!.turn_on = false;
      },
    },
    {
      name: "one fan cannot turn off",
      modify: (snapshot) => {
        snapshot.status.extractor.state = "on";
        snapshot.status.second.capabilities!.turn_off = false;
      },
    },
    {
      name: "one fan has no known capabilities",
      modify: (snapshot) => {
        delete snapshot.status.second.capabilities;
        snapshot.entities[1].capabilities = null;
      },
    },
  ];
  for (const scenario of cases) {
    await t.test(scenario.name, async () => {
      const initial = twoFanFixture();
      scenario.modify(initial);
      const { panel, calls } = await mount(initial);
      assert.equal(roomToggle(panel).disabled, true);
      roomToggle(panel).click();
      await settle(panel);
      assert.deepEqual(calls, []);
      panel.remove();
    });
  }
});

test("room power allows a non-admin with device control permission", async () => {
  const initial = fixture(false, false);
  const { panel, calls } = await mount(initial);
  assert.equal(roomToggle(panel).disabled, false);
  roomToggle(panel).click();
  await settle(panel);
  assert.deepEqual(calls, [
    { type: "havo/command", vent_id: "extractor", command: "turn_on" },
  ]);
});

test("room power remains disabled while a configuration draft exists", async () => {
  const { panel, calls } = await mount(twoFanFixture());
  await open(panel, "Automatisation");
  const input = field(panel, "temperature_on");
  input.value = "27";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(panel);
  assert.equal(roomToggle(panel).disabled, true);
  roomToggle(panel).click();
  await settle(panel);
  assert.deepEqual(calls, []);
  button(panel, "Abandonner").click();
  await settle(panel);
  assert.equal(roomToggle(panel).disabled, false);
});

test("room power serializes requests and keeps controls locked for the entire batch", async () => {
  const initial = twoFanFixture();
  const finish: ((snapshot: Snapshot) => void)[] = [];
  const { panel, calls } = await mount(
    initial,
    undefined,
    async () =>
      new Promise((resolve) => {
        finish.push(resolve);
      }),
  );
  roomToggle(panel).click();
  await settle(panel);
  assert.equal(calls.length, 1);
  assert.equal(roomToggle(panel).disabled, true);
  roomToggle(panel).click();
  assert.equal(calls.length, 1);
  finish[0](initial);
  await settle(panel);
  assert.equal(calls.length, 2);
  assert.equal(roomToggle(panel).disabled, true);
  roomToggle(panel).click();
  assert.equal(calls.length, 2);
  finish[1](initial);
  await settle(panel);
  assert.equal(roomToggle(panel).disabled, false);
});

test("room power stops if a configuration draft starts during the first request", async () => {
  const initial = twoFanFixture();
  let finish!: (snapshot: Snapshot) => void;
  const { panel, calls } = await mount(
    initial,
    undefined,
    async () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await open(panel, "Automatisation");
  roomToggle(panel).click();
  await settle(panel);
  assert.equal(calls.length, 1);
  const input = field(panel, "temperature_on");
  input.value = "27";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(panel);
  finish(initial);
  await settle(panel);
  assert.equal(calls.length, 1);
  assert.equal(roomToggle(panel).disabled, true);
  assert.equal(field(panel, "temperature_on").value, "27");
});

test("room power stops after a failed command and displays the error", async () => {
  const { panel, calls } = await mount(twoFanFixture(), undefined, async () => {
    throw { code: "not_allowed", message: "Control denied" };
  });
  roomToggle(panel).click();
  await settle(panel);
  assert.deepEqual(calls, [
    { type: "havo/command", vent_id: "extractor", command: "turn_on" },
  ]);
  assert.ok(panel.shadowRoot!.querySelector('[role="alert"]'));
  assert.equal(roomToggle(panel).disabled, false);
});

test("room power rechecks permissions and capabilities after each command", async (t) => {
  for (const revoked of [
    "permission",
    "availability",
    "turn_on",
    "assignment",
  ] as const) {
    await t.test(revoked, async () => {
      const initial = twoFanFixture();
      const { panel, calls } = await mount(initial, undefined, async () => {
        const next = structuredClone(initial);
        next.status.extractor.state = "on";
        if (revoked === "permission") next.controllable = ["extractor"];
        else if (revoked === "availability")
          next.status.second.capabilities!.available = false;
        else if (revoked === "turn_on")
          next.status.second.capabilities!.turn_on = false;
        else {
          next.config.rooms.bathroom.ventilations.second.entity_id =
            "fan.replacement";
          next.revision++;
        }
        return next;
      });
      roomToggle(panel).click();
      await settle(panel);
      assert.equal(
        calls.length,
        1,
        `The batch must stop after ${revoked} changes`,
      );
      panel.remove();
    });
  }
});

test("room search ignores accents and preserves the full room count", async () => {
  const initial = fixture();
  initial.areas.push({ id: "floor", name: "Étage détente" });
  const { panel } = await mount(initial);
  const search = panel.shadowRoot!.querySelector<HTMLInputElement>(
    '.rail-search input[type="search"]',
  )!;
  search.value = "etage";
  search.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(panel);
  const rooms = panel.shadowRoot!.querySelectorAll(".room");
  assert.equal(rooms.length, 1);
  assert.equal(rooms[0].getAttribute("aria-label"), "Étage détente");
  assert.equal(
    panel.shadowRoot!.querySelector(".rail-heading .count")!.textContent,
    "3",
  );
  assert.equal(panel.shadowRoot!.querySelector(".quick-toggle"), null);
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
    panel
      .shadowRoot!.querySelector('[role="tab"][aria-selected="true"]')!
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
  initial.config.rooms.bathroom.ventilations.extractor.humidity_timeout_enabled = true;
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
  initial.config.rooms.bathroom.ventilations.extractor.humidity_timeout_enabled = true;
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
    (calls[0].config as Snapshot["config"]).rooms.bathroom.ventilations
      .extractor.humidity_timeout,
    60,
  );
});

test("humidity timeout settings and explanation follow English, French and Spanish locales", async () => {
  const { panel, hass } = await mount(humidityFixture());
  await open(panel, "Automatisation");
  for (const locale of [
    "en",
    "fr-BE",
    "fr_CA",
    "es",
    "es-ES",
    "es_MX",
    "ES-AR",
  ]) {
    panel.hass = { ...hass, locale: { language: locale } };
    await settle(panel);
    const text = panel.shadowRoot!.textContent!;
    if (locale === "en") {
      assert.match(text, /Limit extraction below the start threshold/);
      assert.match(text, /Reaching the start threshold resets the timer/);
      assert.match(text, /extraction can restart/);
    } else if (locale.startsWith("fr")) {
      assert.match(text, /Limiter l’extraction sous le seuil de démarrage/);
      assert.match(text, /remet le compteur à zéro/);
      assert.match(text, /l’extraction peut redémarrer/);
    } else {
      assert.match(text, /Limitar la extracción por debajo del umbral de inicio/);
      assert.match(text, /Alcanzar el umbral de inicio reinicia el temporizador/);
      assert.match(text, /Se respeta el tiempo mínimo de funcionamiento/);
      assert.match(text, /la extracción puede reiniciarse/);
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
  assert.match(
    countdown,
    /Retour au repos temporisé : temps restant\s+180\s+min/,
  );
  panel.hass = { ...hass, locale: { language: "es_MX" } };
  await settle(panel);
  assert.match(
    panel.shadowRoot!.querySelector(".reason")!.textContent!,
    /Tiempo mínimo de funcionamiento.*Tiempo restante 2 min/,
  );
  assert.match(
    panel.shadowRoot!.querySelector('[data-status="humidity-timeout"]')!
      .textContent!,
    /Retorno al reposo temporizado: tiempo restante\s+180\s+min/,
  );
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
    /En reposo: ha transcurrido el tiempo por debajo del umbral de inicio/,
  );
  assert.equal(
    panel.shadowRoot!.querySelector('[data-status="humidity-timeout"]'),
    null,
  );
  panel.hass = { ...hass, locale: { language: "fr-BE" } };
  await settle(panel);
  assert.match(
    panel.shadowRoot!.querySelector(".reason")!.textContent!,
    /Au repos : durée sous le seuil de démarrage écoulée/,
  );
  panel.hass = { ...hass, locale: { language: "en" } };
  await settle(panel);
  assert.match(
    panel.shadowRoot!.querySelector(".reason")!.textContent!,
    /At rest: time below the start threshold elapsed/,
  );
});
