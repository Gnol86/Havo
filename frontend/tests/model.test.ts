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
import { en, fr, translate } from "../src/translations";

test("localization parity and French variants", () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(fr).sort());
  assert.equal(translate("rooms", "fr-BE"), "Pièces");
  assert.equal(translate("rooms", "de"), "Rooms");
});
test("defaults are opt-in and independent", () => {
  const a = newVentilation("fan.a", "A"),
    b = newVentilation("fan.b", "B");
  a.enabled = true;
  assert.equal(b.enabled, false);
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
