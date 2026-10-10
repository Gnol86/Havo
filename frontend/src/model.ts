import type { Config, Room, Ventilation } from "./types";
export const emptyConfig = (): Config => ({
  weather_entity_id: null,
  outdoor_temperature_entity_id: null,
  outdoor_humidity_entity_id: null,
  rooms: {},
});
export const emptyRoom = (): Room => ({
  temperature_entity_id: null,
  humidity_entity_id: null,
  ventilations: {},
});
export const newVentilation = (
  entity_id: string,
  name: string,
): Ventilation => ({
  entity_id,
  name,
  mode: "temperature",
  enabled: false,
  temperature_on: 25,
  temperature_off: 24,
  temperature_full: 30,
  humidity_on: 60,
  humidity_hysteresis: 5,
  humidity_full: 75,
  background: 0,
  speed_min: 40,
  speed_max: 100,
  min_on: 300,
  min_off: 120,
  manual_pause: 3600,
});
export function createId(): string {
  const data = new Uint32Array(4);
  crypto.getRandomValues(data);
  return Array.from(data, (n) => n.toString(16).padStart(8, "0")).join("");
}
export const copy = <T>(value: T): T => structuredClone(value);
export const equal = (a: unknown, b: unknown): boolean =>
  JSON.stringify(a) === JSON.stringify(b);
export function validVent(vent: Ventilation): boolean {
  return (
    vent.temperature_off < vent.temperature_on &&
    vent.temperature_on < vent.temperature_full &&
    vent.humidity_on < vent.humidity_full &&
    vent.humidity_on - 5 - vent.humidity_hysteresis >= 0 &&
    vent.background < vent.speed_min &&
    vent.speed_min <= vent.speed_max
  );
}
export class Draft {
  config: Config = emptyConfig();
  base: Config = emptyConfig();
  revision = 0;
  conflict = false;
  editing = false;
  get dirty() {
    return this.editing || !equal(this.config, this.base);
  }
  receive(config: Config, revision: number) {
    if (revision < this.revision) return;
    if (!this.dirty) {
      this.reset(config, revision);
      return;
    }
    if (revision > this.revision) this.conflict = true;
  }
  reset(config: Config, revision: number) {
    this.config = copy(config);
    this.base = copy(config);
    this.revision = revision;
    this.conflict = this.editing = false;
  }
  acknowledge(sent: Config, config: Config, revision: number) {
    if (equal(this.config, sent) && !this.editing) this.config = copy(config);
    this.base = copy(config);
    this.revision = revision;
    this.conflict = false;
  }
}
