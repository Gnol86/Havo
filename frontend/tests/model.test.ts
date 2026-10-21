import assert from "node:assert/strict";
import { test } from "node:test";
import {
  Draft,
  emptyConfig,
  emptyRoom,
  newVentilation,
  validVent,
  createId,
} from "../src/model";
import { en, es, fr, resolveLanguage, translate } from "../src/translations";

test("translation catalogs are complete and have no empty labels", () => {
  for (const catalog of [fr, es]) {
    assert.deepEqual(Object.keys(en).sort(), Object.keys(catalog).sort());
    assert.ok(Object.values(catalog).every((value) => value.trim().length > 0));
  }
});
test("French and Spanish locale variants resolve consistently with English fallback", () => {
  for (const locale of ["fr", "fr-BE", "fr_CA", "FR-FR"]) {
    assert.equal(resolveLanguage(locale), "fr");
    assert.equal(translate("rooms", locale), "Pièces");
  }
  for (const locale of ["es", "es-ES", "es_MX", "ES-AR"]) {
    assert.equal(resolveLanguage(locale), "es");
    assert.equal(translate("rooms", locale), "Habitaciones");
  }
  for (const locale of [undefined, "", "de", "en-GB", "pt-BR"]) {
    assert.equal(resolveLanguage(locale), "en");
    assert.equal(translate("rooms", locale), "Rooms");
  }
});
test("defaults are opt-in and independent", () => {
  const a = newVentilation("fan.a", "A"),
    b = newVentilation("fan.b", "B");
  a.enabled = true;
  a.humidity_timeout_enabled = true;
  a.humidity_timeout = 7200;
  assert.equal(b.enabled, false);
  assert.equal(b.humidity_timeout_enabled, false);
  assert.equal(b.humidity_timeout, 10800);
  assert.ok(validVent(b));
  assert.notEqual(createId(), createId());
});
test("drafts survive remote changes and report conflicts", () => {
  const draft = new Draft();
  draft.reset(emptyConfig(), 1);
  draft.config.rooms.a = emptyRoom();
  draft.receive(emptyConfig(), 2);
  assert.ok(draft.dirty);
  assert.ok(draft.conflict);
  assert.ok(draft.config.rooms.a);
});
test("saving acknowledges only sent data", () => {
  const draft = new Draft();
  draft.reset(emptyConfig(), 1);
  draft.config.rooms.a = emptyRoom();
  const sent = structuredClone(draft.config);
  draft.config.rooms.b = emptyRoom();
  draft.acknowledge(sent, sent, 2);
  assert.ok(draft.dirty);
  assert.ok(draft.config.rooms.b);
  assert.equal(draft.revision, 2);
});
test("invalid raw input remains dirty after acknowledgement", () => {
  const draft = new Draft();
  draft.reset(emptyConfig(), 1);
  const sent = structuredClone(draft.config);
  draft.editing = true;
  draft.acknowledge(sent, sent, 2);
  assert.ok(draft.dirty);
});
test("threshold relationships", () => {
  const vent = newVentilation("fan.a", "A");
  vent.temperature_off = 26;
  assert.equal(validVent(vent), false);
});
test("humidity timeout duration remains valid even while the option is disabled", () => {
  const vent = newVentilation("fan.a", "A");
  for (const seconds of [59, 86401, NaN, Infinity]) {
    vent.humidity_timeout = seconds;
    assert.equal(validVent(vent), false);
  }
  for (const seconds of [60, 10800, 86400]) {
    vent.humidity_timeout = seconds;
    assert.ok(validVent(vent));
  }
});
