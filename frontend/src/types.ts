export interface Capabilities {
  available: boolean;
  speed: boolean;
  turn_on: boolean;
  turn_off: boolean;
  step: number;
  presets: boolean;
}
export interface Ventilation {
  entity_id: string;
  name: string;
  mode: "temperature" | "humidity";
  enabled: boolean;
  temperature_on: number;
  temperature_off: number;
  temperature_full: number;
  humidity_on: number;
  humidity_hysteresis: number;
  humidity_full: number;
  humidity_timeout_enabled: boolean;
  humidity_timeout: number;
  background: number;
  speed_min: number;
  speed_max: number;
  min_on: number;
  min_off: number;
  manual_pause: number;
}
export interface Room {
  temperature_entity_id: string | null;
  humidity_entity_id: string | null;
  ventilations: Record<string, Ventilation>;
}
export interface Config {
  weather_entity_id: string | null;
  outdoor_temperature_entity_id: string | null;
  outdoor_humidity_entity_id: string | null;
  rooms: Record<string, Room>;
}
export interface Entity {
  entity_id: string;
  name: string;
  domain: string;
  area_id: string | null;
  unit: string | null;
  device_class: string | null;
  capabilities: Capabilities | null;
}
export interface Readings {
  temperature: number | null;
  humidity: number | null;
  outdoor_temperature: number | null;
  outdoor_humidity: number | null;
  sources: Record<string, string | null>;
}
export interface Status {
  reason: string;
  state?: string;
  percentage?: number | null;
  target_percentage?: number | null;
  pause_until?: number | null;
  deadline?: number | null;
  humidity_timeout_at?: number | null;
  capabilities?: Capabilities;
  readings?: Readings;
  decision?: {
    valid: boolean;
    active: boolean;
    demand: number;
    on: number;
    off: number;
    fallback: boolean;
    outdoor_equivalent: number | null;
    drying_potential: number | null;
    thermal_factor: number | null;
  };
}
export interface Snapshot {
  revision: number;
  config: Config;
  admin: boolean;
  areas: { id: string; name: string }[];
  entities: Entity[];
  status: Record<string, Status>;
  controllable: string[];
}
export interface Hass {
  dockedSidebar?: "docked" | "always_hidden" | "auto";
  kioskMode?: boolean;
  auth?: { external?: { config?: { hasSidebar?: boolean } } };
  language?: string;
  locale?: { language?: string };
  themes?: { darkMode?: boolean };
  connection: {
    subscribeMessage<T>(
      callback: (value: T) => void,
      message: Record<string, unknown>,
    ): Promise<() => void>;
  };
  callWS<T>(message: Record<string, unknown>): Promise<T>;
}
