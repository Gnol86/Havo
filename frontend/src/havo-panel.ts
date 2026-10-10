import { LitElement, html, nothing, type PropertyValues } from "lit";
import { keyed } from "lit/directives/keyed.js";
import "./entity-picker";
import {
  copy,
  createId,
  Draft,
  emptyRoom,
  newVentilation,
  validVent,
} from "./model";
import { translate, en, type TranslationKey } from "./translations";
import { styles } from "./styles";
import type {
  Config,
  Entity,
  Hass,
  Room,
  Snapshot,
  Status,
  Ventilation,
} from "./types";

type Tab = "control" | "ventilations" | "automation" | "settings";

export class HavoPanel extends LitElement {
  static properties = {
    hass: { attribute: false },
    snapshot: { state: true },
    roomId: { state: true },
    tab: { state: true },
    general: { state: true },
    query: { state: true },
    otherRooms: { state: true },
    error: { state: true },
    saving: { state: true },
    message: { state: true },
    busy: { state: true },
    now: { state: true },
    removeId: { state: true },
    resetKey: { state: true },
  };
  static styles = styles;
  hass?: Hass;
  private snapshot?: Snapshot;
  private draft = new Draft();
  private roomId = "";
  private tab: Tab = "control";
  private general = false;
  private query = "";
  private otherRooms = false;
  private error = "";
  private message = "";
  private saving = false;
  private busy = false;
  private now = Date.now() / 1000;
  private removeId = "";
  private resetKey = 0;
  private unsubscribe?: () => void;
  private connection?: Hass["connection"];
  private epoch = 0;
  private editEpoch = 0;
  private timer?: ReturnType<typeof setInterval>;
  private toastTimer?: ReturnType<typeof setTimeout>;
  private beforeUnload = (event: BeforeUnloadEvent) => {
    if (this.draft.dirty) {
      event.preventDefault();
      event.returnValue = "";
    }
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("beforeunload", this.beforeUnload);
    this.timer = setInterval(() => {
      this.now = Date.now() / 1000;
    }, 1000);
    if (this.hass) void this.connect();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.epoch++;
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.connection = undefined;
    clearInterval(this.timer);
    clearTimeout(this.toastTimer);
    window.removeEventListener("beforeunload", this.beforeUnload);
  }
  protected updated(changes: PropertyValues) {
    if (changes.has("hass")) {
      this.style.colorScheme = this.hass?.themes?.darkMode ? "dark" : "light";
      if (this.hass?.connection !== this.connection) void this.connect();
    }
  }
  private get locale() {
    return this.hass?.locale?.language ?? this.hass?.language;
  }
  private t(key: TranslationKey) {
    return translate(key, this.locale);
  }
  private reason(value?: string) {
    const key =
      (
        {
          background: "backgroundState",
          temperature: "temperatureState",
          humidity: "humidityState",
          manual_pause: "manual_pauseState",
        } as Record<string, string>
      )[value ?? ""] ??
      value ??
      "unknown";
    return this.t((key in en ? key : "unknown") as TranslationKey);
  }
  private async connect() {
    if (!this.hass || !this.isConnected) return;
    const epoch = ++this.epoch;
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.connection = this.hass.connection;
    try {
      const unsubscribe = await this.connection.subscribeMessage<Snapshot>(
        (snapshot) => {
          if (epoch === this.epoch) this.receive(snapshot);
        },
        { type: "havo/subscribe" },
      );
      if (epoch !== this.epoch) unsubscribe();
      else this.unsubscribe = unsubscribe;
    } catch (error) {
      if (epoch === this.epoch) this.fail(error);
    }
  }
  private receive(snapshot: Snapshot) {
    if (this.snapshot && snapshot.revision < this.snapshot.revision) return;
    const wasAdmin = this.snapshot?.admin;
    this.snapshot = snapshot;
    if (!snapshot.admin && wasAdmin) {
      this.draft.reset(snapshot.config, snapshot.revision);
      this.resetKey++;
      this.general = false;
      this.tab = "control";
      this.epoch++;
      // Keep the current subscription valid after revoking editing privileges.
      this.connection = undefined;
      void this.connect();
    } else if (!this.saving)
      this.draft.receive(snapshot.config, snapshot.revision);
    this.requestUpdate();
  }
  private fail(error: unknown) {
    const code = (error as { code?: string })?.code;
    this.error = code && code in en ? code : "error";
  }
  private touch() {
    this.editEpoch++;
    this.message = "";
    this.draft.editing = [
      ...this.renderRoot.querySelectorAll<HTMLInputElement>("input"),
    ].some((input) => !input.validity.valid);
    this.requestUpdate();
  }
  private validate() {
    const invalid = [
      ...this.renderRoot.querySelectorAll<HTMLInputElement>("input"),
    ].find((input) => !input.validity.valid);
    if (invalid) {
      invalid.focus();
      invalid.reportValidity();
      return false;
    }
    for (const [roomId, room] of Object.entries(this.draft.config.rooms)) {
      if (Object.values(room.ventilations).some((vent) => !validVent(vent))) {
        this.roomId = roomId;
        this.general = false;
        this.tab = "automation";
        this.error = "invalid_config";
        return false;
      }
    }
    return true;
  }
  private navigate(action: () => void) {
    if (!this.validate()) return;
    this.error = "";
    this.removeId = "";
    action();
    this.requestUpdate();
  }
  private discard() {
    if (!this.snapshot) return;
    this.draft.reset(this.snapshot.config, this.snapshot.revision);
    this.error = "";
    this.resetKey++;
    this.requestUpdate();
  }
  private async save() {
    if (
      !this.hass ||
      !this.snapshot?.admin ||
      this.saving ||
      this.draft.conflict ||
      !this.validate()
    )
      return;
    const sent = copy(this.draft.config),
      epoch = this.epoch,
      editEpoch = this.editEpoch;
    this.saving = true;
    this.error = "";
    try {
      const result = await this.hass.callWS<Snapshot>({
        type: "havo/save",
        config: sent,
        revision: this.draft.revision,
      });
      if (epoch !== this.epoch || !this.snapshot?.admin) return;
      if (this.snapshot && this.snapshot.revision > result.revision) {
        this.draft.conflict = true;
        this.error = "conflict";
        return;
      }
      if (editEpoch === this.editEpoch) this.draft.editing = false;
      this.draft.acknowledge(sent, result.config, result.revision);
      this.snapshot = result;
      this.message = "saved";
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.message = "";
      }, 4000);
    } catch (error) {
      if (epoch === this.epoch) this.fail(error);
    } finally {
      this.saving = false;
      this.requestUpdate();
    }
  }
  private async command(id: string, command: string, value?: number | boolean) {
    if (!this.hass || this.busy || this.draft.dirty) return;
    this.busy = true;
    this.error = "";
    const epoch = this.epoch;
    try {
      const result = await this.hass.callWS<Snapshot>({
        type: "havo/command",
        vent_id: id,
        command,
        ...(value !== undefined ? { value } : {}),
      });
      if (epoch === this.epoch) this.receive(result);
    } catch (error) {
      if (epoch === this.epoch) this.fail(error);
    } finally {
      this.busy = false;
    }
  }
  private picker(
    label: TranslationKey,
    value: string | null,
    entities: Entity[],
    change: (value: string | null) => void,
  ) {
    return html`<havo-entity-picker
      .label=${this.t(label)}
      .locale=${this.locale}
      .value=${value}
      .entities=${entities}
      @entity-changed=${(event: CustomEvent) => {
        change(event.detail.value);
        this.touch();
      }}
    ></havo-entity-picker>`;
  }
  private sensorEntities(kind: "temperature" | "humidity") {
    return (this.snapshot?.entities ?? []).filter(
      (e) =>
        e.domain === "sensor" &&
        (e.device_class === kind ||
          (kind === "temperature"
            ? ["°C", "°F", "K"].includes(e.unit ?? "")
            : e.unit === "%")),
    );
  }
  private number(
    vent: Ventilation,
    key: keyof Ventilation & TranslationKey,
    low: number,
    high: number,
  ) {
    return html`<label
      >${this.t(key)}<input
        type="number"
        required
        step="any"
        min=${low}
        max=${high}
        data-field=${key}
        .value=${String(vent[key])}
        @input=${(event: Event) => {
          const input = event.target as HTMLInputElement;
          if (input.validity.valid)
            (vent as unknown as Record<string, unknown>)[key] =
              input.valueAsNumber;
          this.touch();
        }}
    /></label>`;
  }
  private native(entityId: string) {
    this.dispatchEvent(
      new CustomEvent("hass-action", {
        bubbles: true,
        composed: true,
        detail: {
          action: "more-info",
          config: { entity: entityId, tap_action: { action: "more-info" } },
        },
      }),
    );
  }
  private metric(
    label: TranslationKey,
    value: number | null | undefined,
    unit: string,
  ) {
    return html`<div class="metric">
      <small>${this.t(label)}</small
      ><strong>${value == null ? "—" : `${value.toFixed(1)}${unit}`}</strong>
    </div>`;
  }
  private controller(id: string, vent: Ventilation) {
    const state: Status = this.snapshot?.status[id] ?? { reason: "disabled" };
    const entity = this.snapshot?.entities.find(
      (e) => e.entity_id === vent.entity_id,
    );
    const caps = state.capabilities ?? entity?.capabilities;
    const disabled =
      this.busy ||
      this.draft.dirty ||
      !this.snapshot?.controllable.includes(id);
    const readings = state.readings,
      decision = state.decision;
    const remaining = Math.max(
      0,
      Math.ceil(((state.pause_until ?? state.deadline ?? 0) - this.now) / 60),
    );
    return html`<article class="card" data-vent=${id}>
      <div class="card-head">
        <ha-icon icon="mdi:fan"></ha-icon>
        <div>
          <h3>${vent.name || entity?.name || vent.entity_id}</h3>
          <small
            >${caps?.speed
              ? this.t("variableSpeed")
              : this.t("onOffOnly")}</small
          >
        </div>
        <span class="badge"
          >${this.t(
            state.state === "on"
              ? "on"
              : state.state === "off"
                ? "off"
                : "unavailable",
          )}${caps?.speed && state.state === "on" && state.percentage != null
            ? ` · ${state.percentage}%`
            : ""}</span
        >
      </div>
      <p class="reason" role="status">
        ${this.reason(state.reason)}${remaining
          ? ` · ${this.t("remaining")} ${remaining} ${this.t("minutes")}`
          : ""}
      </p>
      <div class="row">
        <button
          ?disabled=${disabled || !caps?.available || !caps.turn_on}
          @click=${() => this.command(id, "turn_on")}
        >
          ${this.t("turnOn")}</button
        ><button
          ?disabled=${disabled || !caps?.available || !caps.turn_off}
          @click=${() => this.command(id, "turn_off")}
        >
          ${this.t("turnOff")}</button
        ><button
          ?disabled=${disabled || !vent.enabled}
          @click=${() => this.command(id, "resume")}
        >
          ${this.t("resume")}</button
        ><button
          aria-label=${this.t("native")}
          title=${this.t("native")}
          @click=${() => this.native(vent.entity_id)}
        >
          <ha-icon icon="mdi:open-in-new"></ha-icon>
        </button>
      </div>
      ${caps?.speed
        ? html`<label style="margin-top:16px"
            >${this.t("speed")}<input
              aria-label=${this.t("speed")}
              type="range"
              min=${Math.max(1, Math.floor(caps.step))}
              max="100"
              step=${Math.max(1, Math.floor(caps.step))}
              .value=${String(state.percentage || vent.speed_min)}
              ?disabled=${disabled || !caps.available}
              @change=${(event: Event) =>
                this.command(
                  id,
                  "set_percentage",
                  Number((event.target as HTMLInputElement).value),
                )}
          /></label>`
        : nothing}
      <label class="check"
        ><input
          type="checkbox"
          .checked=${vent.enabled}
          ?disabled=${disabled}
          @change=${(event: Event) =>
            this.command(
              id,
              "automation",
              (event.target as HTMLInputElement).checked,
            )}
        />${this.t("enabled")}</label
      >
      <div class="metrics">
        ${this.metric(
          "indoorTemperature",
          readings?.temperature,
          " °C",
        )}${this.metric("indoorHumidity", readings?.humidity, " %")}${decision
          ? this.metric(
              "start",
              decision.on,
              vent.mode === "temperature" ? " °C" : " %",
            )
          : nothing}${decision
          ? this.metric(
              "rest",
              decision.off,
              vent.mode === "temperature" ? " °C" : " %",
            )
          : nothing}
      </div>
      ${decision?.fallback
        ? html`<p class="help">${this.t("fallback")}</p>`
        : nothing}
      ${vent.mode === "humidity"
        ? html`<details>
            <summary>${this.t("sources")}</summary>
            <p class="help">${this.t("algorithmHelp")}</p>
            <div class="metrics">
              ${this.metric(
                "outdoorTemperature",
                readings?.outdoor_temperature,
                " °C",
              )}${this.metric(
                "outdoorHumidity",
                readings?.outdoor_humidity,
                " %",
              )}${this.metric(
                "outdoorEquivalent",
                decision?.outdoor_equivalent,
                " %",
              )}
            </div>
            ${Object.entries(readings?.sources ?? {})
              .filter(([key]) => key.startsWith("outdoor"))
              .map(
                ([key, source]) =>
                  html`<p class="help entity-name">
                    ${this.t(
                      key === "outdoor_temperature"
                        ? "outdoorTemperature"
                        : "outdoorHumidity",
                    )}:
                    ${source ?? "—"}
                  </p>`,
              )}
          </details>`
        : nothing}
      ${caps?.speed && state.target_percentage != null
        ? html`<p class="help">
            ${this.t("target")}: ${state.target_percentage}% ·
            ${this.t("step")}: ${caps.step.toFixed(1)}%
          </p>`
        : nothing}
    </article>`;
  }
  private fans(room: Room) {
    const assigned = new Set(
      Object.values(this.draft.config.rooms).flatMap((r) =>
        Object.values(r.ventilations).map((v) => v.entity_id),
      ),
    );
    const available = (this.snapshot?.entities ?? []).filter(
      (e) =>
        e.domain === "fan" &&
        !assigned.has(e.entity_id) &&
        (this.otherRooms || !e.area_id || e.area_id === this.roomId),
    );
    return html`<section class="card">
        <h3>${this.t("addVentilation")}</h3>
        ${this.picker("fan", null, available, (value) => {
          if (value) {
            const entity = this.snapshot?.entities.find(
              (e) => e.entity_id === value,
            );
            room.ventilations[createId()] = newVentilation(
              value,
              entity?.name ?? value,
            );
            this.resetKey++;
          }
        })}<label class="check"
          ><input
            type="checkbox"
            .checked=${this.otherRooms}
            @change=${(event: Event) => {
              this.otherRooms = (event.target as HTMLInputElement).checked;
            }}
          />${this.t("otherRooms")}</label
        >
      </section>
      ${Object.entries(room.ventilations).map(([id, vent]) => {
        const caps = this.snapshot?.entities.find(
          (e) => e.entity_id === vent.entity_id,
        )?.capabilities;
        return html`<section class="card">
          <div class="grid">
            <label
              >${this.t("name")}<input
                maxlength="100"
                .value=${vent.name}
                @input=${(event: Event) => {
                  vent.name = (event.target as HTMLInputElement).value;
                  this.touch();
                }}
            /></label>
            <div>
              <small>${this.t("capabilities")}</small>
              <p>
                ${caps?.speed ? this.t("variableSpeed") : this.t("onOffOnly")}
              </p>
            </div>
          </div>
          <p class="help entity-name">${vent.entity_id}</p>
          ${caps?.presets
            ? html`<p class="help">${this.t("presetsHelp")}</p>`
            : nothing}
          ${this.removeId === id
            ? html`<p>${this.t("removeHelp")}</p>
                <div class="row">
                  <button
                    class="danger"
                    @click=${() => {
                      delete room.ventilations[id];
                      this.removeId = "";
                      this.touch();
                    }}
                  >
                    ${this.t("confirm")}</button
                  ><button
                    @click=${() => {
                      this.removeId = "";
                    }}
                  >
                    ${this.t("cancel")}
                  </button>
                </div>`
            : html`<button
                class="danger"
                @click=${() => {
                  this.removeId = id;
                }}
              >
                ${this.t("remove")}
              </button>`}
        </section>`;
      })}`;
  }
  private automation(room: Room) {
    return html`<section class="card">
        <h3>${this.t("sensors")}</h3>
        <div class="grid">
          ${this.picker(
            "indoorTemperature",
            room.temperature_entity_id,
            this.sensorEntities("temperature"),
            (value) => {
              room.temperature_entity_id = value;
            },
          )}${this.picker(
            "indoorHumidity",
            room.humidity_entity_id,
            this.sensorEntities("humidity"),
            (value) => {
              room.humidity_entity_id = value;
            },
          )}
        </div>
      </section>
      ${Object.entries(room.ventilations).map(([id, vent]) => {
        const caps = this.snapshot?.entities.find(
          (e) => e.entity_id === vent.entity_id,
        )?.capabilities;
        return html`<section class="card" data-settings=${id}>
          <h3>${vent.name || vent.entity_id}</h3>
          <label class="check"
            ><input
              type="checkbox"
              .checked=${vent.enabled}
              @change=${(event: Event) => {
                vent.enabled = (event.target as HTMLInputElement).checked;
                this.touch();
              }}
            />${this.t("enabled")}</label
          >
          <label
            >${this.t("mode")}<select
              .value=${vent.mode}
              @change=${(event: Event) =>
                this.navigate(() => {
                  vent.mode = (event.target as HTMLSelectElement)
                    .value as Ventilation["mode"];
                  this.touch();
                })}
            >
              <option value="temperature">${this.t("temperature")}</option>
              <option value="humidity">${this.t("humidity")}</option>
            </select></label
          >
          <h4>${this.t("thresholds")}</h4>
          <div class="grid">
            ${vent.mode === "temperature"
              ? html`${this.number(
                  vent,
                  "temperature_on",
                  -40,
                  60,
                )}${this.number(vent, "temperature_off", -40, 60)}${caps?.speed
                  ? this.number(vent, "temperature_full", -40, 60)
                  : nothing}`
              : html`${this.number(vent, "humidity_on", 20, 90)}${this.number(
                  vent,
                  "humidity_hysteresis",
                  1,
                  20,
                )}${caps?.speed
                  ? this.number(vent, "humidity_full", 21, 100)
                  : nothing}`}
          </div>
          ${vent.mode === "humidity"
            ? html`<p class="help">${this.t("algorithmHelp")}</p>`
            : nothing}
          ${caps?.speed
            ? html`<details>
                <summary>${this.t("speeds")}</summary>
                <p class="help">${this.t("backgroundHelp")}</p>
                <label class="check"
                  ><input
                    type="checkbox"
                    .checked=${vent.background > 0}
                    @change=${(event: Event) => {
                      vent.background = (event.target as HTMLInputElement)
                        .checked
                        ? Math.min(20, vent.speed_min - 1)
                        : 0;
                      this.touch();
                    }}
                  />${this.t("backgroundEnabled")}</label
                >
                <div class="grid">
                  ${vent.background > 0
                    ? this.number(vent, "background", 1, 99)
                    : nothing}${this.number(
                    vent,
                    "speed_min",
                    1,
                    100,
                  )}${this.number(vent, "speed_max", 1, 100)}
                </div>
              </details>`
            : html`<p class="help">
                ${this.t("onOffOnly")}${vent.background
                  ? ` · ${this.t("speed_unsupported")}`
                  : ""}
              </p>`}
          <details>
            <summary>${this.t("timings")}</summary>
            <div class="grid">
              ${this.number(vent, "min_on", 0, 86400)}${this.number(
                vent,
                "min_off",
                0,
                86400,
              )}${this.number(vent, "manual_pause", 0, 86400)}
            </div>
          </details>
        </section>`;
      })}`;
  }
  private roomView() {
    const room = this.draft.config.rooms[this.roomId];
    const name =
      this.snapshot?.areas.find((area) => area.id === this.roomId)?.name ??
      this.roomId;
    if (!this.roomId)
      return html`<div class="empty">
        <ha-icon icon="mdi:fan"></ha-icon>
        <p>${this.t("chooseRoom")}</p>
      </div>`;
    const tabs: Tab[] = this.snapshot?.admin
      ? ["control", "ventilations", "automation", "settings"]
      : ["control"];
    return html`<button
        class="back"
        @click=${() =>
          this.navigate(() => {
            this.roomId = "";
          })}
      >
        ${this.t("back")}
      </button>
      <h2>${name}</h2>
      ${room
        ? html`<div class="tabs" role="tablist" aria-label=${name}>
              ${tabs.map(
                (tab) =>
                  html`<button
                    role="tab"
                    id=${`tab-${tab}`}
                    aria-selected=${String(this.tab === tab)}
                    aria-controls="room-panel"
                    tabindex=${this.tab === tab ? 0 : -1}
                    @click=${() =>
                      this.navigate(() => {
                        this.tab = tab;
                      })}
                    @keydown=${(event: KeyboardEvent) => {
                      const index = tabs.indexOf(this.tab);
                      const next =
                        event.key === "ArrowRight"
                          ? (index + 1) % tabs.length
                          : event.key === "ArrowLeft"
                            ? (index + tabs.length - 1) % tabs.length
                            : event.key === "Home"
                              ? 0
                              : event.key === "End"
                                ? tabs.length - 1
                                : -1;
                      if (next >= 0) {
                        event.preventDefault();
                        this.navigate(() => {
                          this.tab = tabs[next];
                        });
                        void this.updateComplete.then(() =>
                          this.renderRoot
                            .querySelector<HTMLButtonElement>(
                              `#tab-${this.tab}`,
                            )
                            ?.focus(),
                        );
                      }
                    }}
                  >
                    ${this.t(tab)}
                  </button>`,
              )}
            </div>
            <div
              id="room-panel"
              role="tabpanel"
              aria-labelledby=${`tab-${this.tab}`}
            >
              ${this.tab === "control"
                ? html`${Object.entries(room.ventilations).map(([id, vent]) =>
                    this.controller(id, vent),
                  )}${!Object.keys(room.ventilations).length
                    ? html`<p class="muted">${this.t("noVentilations")}</p>
                        ${this.snapshot?.admin
                          ? html`<button
                              @click=${() => {
                                this.tab = "ventilations";
                              }}
                            >
                              ${this.t("addVentilation")}
                            </button>`
                          : nothing}`
                    : nothing}`
                : this.tab === "ventilations"
                  ? this.fans(room)
                  : this.tab === "automation"
                    ? this.automation(room)
                    : html`<section class="card">
                        <h3>${this.t("removeRoom")}</h3>
                        <p class="help">${this.t("removeHelp")}</p>
                        ${this.removeId === "room"
                          ? html`<div class="row">
                              <button
                                class="danger"
                                @click=${() => {
                                  delete this.draft.config.rooms[this.roomId];
                                  this.removeId = "";
                                  this.tab = "control";
                                  this.touch();
                                }}
                              >
                                ${this.t("confirm")}</button
                              ><button
                                @click=${() => {
                                  this.removeId = "";
                                }}
                              >
                                ${this.t("cancel")}
                              </button>
                            </div>`
                          : html`<button
                              class="danger"
                              @click=${() => {
                                this.removeId = "room";
                              }}
                            >
                              ${this.t("removeRoom")}
                            </button>`}
                      </section>`}
            </div>`
        : html`<p class="muted">${this.t("noVentilations")}</p>
            ${this.snapshot?.admin
              ? html`<button
                  class="primary"
                  @click=${() => {
                    this.draft.config.rooms[this.roomId] = emptyRoom();
                    this.tab = "ventilations";
                    this.touch();
                  }}
                >
                  ${this.t("configureRoom")}
                </button>`
              : nothing}`}`;
  }
  private generalView() {
    const config = this.draft.config;
    return html`<main class="settings-list">
      <h2>${this.t("general")}</h2>
      <section class="card">
        <h3>${this.t("sources")}</h3>
        <p class="help">${this.t("sourceHelp")}</p>
        ${this.picker(
          "weather",
          config.weather_entity_id,
          (this.snapshot?.entities ?? []).filter((e) => e.domain === "weather"),
          (value) => {
            config.weather_entity_id = value;
          },
        )}${this.picker(
          "outdoorTemperature",
          config.outdoor_temperature_entity_id,
          this.sensorEntities("temperature"),
          (value) => {
            config.outdoor_temperature_entity_id = value;
          },
        )}${this.picker(
          "outdoorHumidity",
          config.outdoor_humidity_entity_id,
          this.sensorEntities("humidity"),
          (value) => {
            config.outdoor_humidity_entity_id = value;
          },
        )}
      </section>
    </main>`;
  }
  render() {
    const areas = this.snapshot?.areas ?? [];
    const allAreas = [
      ...areas,
      ...Object.keys(this.draft.config.rooms)
        .filter((id) => !areas.some((area) => area.id === id))
        .map((id) => ({ id, name: id })),
    ];
    const filtered = allAreas.filter((area) =>
      area.name.toLocaleLowerCase().includes(this.query.toLocaleLowerCase()),
    );
    return html`<div class="shell">
      <header>
        <ha-icon icon="mdi:fan"></ha-icon>
        <div>
          <h1>Havo</h1>
          <p>${this.t("intro")}</p>
        </div>
        <span class="connection"
          >${this.t(this.snapshot ? "connected" : "disconnected")}</span
        >
      </header>
      <nav aria-label="Havo">
        <button
          class=${!this.general ? "selected" : ""}
          @click=${() =>
            this.navigate(() => {
              this.general = false;
            })}
        >
          ${this.t("rooms")}</button
        >${this.snapshot?.admin
          ? html`<button
              class=${this.general ? "selected" : ""}
              @click=${() =>
                this.navigate(() => {
                  this.general = true;
                })}
            >
              ${this.t("general")}
            </button>`
          : nothing}
      </nav>
      ${this.error || this.draft.conflict
        ? html`<div role="alert" class="notice error">
            ${this.t(
              (this.draft.conflict ? "conflict" : this.error) as TranslationKey,
            )}
          </div>`
        : nothing}${this.message
        ? html`<div class="notice" role="status">
            ${this.t(this.message as TranslationKey)}
          </div>`
        : nothing}
      ${keyed(
        this.resetKey,
        this.general && this.snapshot?.admin
          ? this.generalView()
          : html`<div class="layout ${this.roomId ? "has-room" : ""}">
              <aside>
                <input
                  type="search"
                  aria-label=${this.t("search")}
                  placeholder=${this.t("search")}
                  .value=${this.query}
                  @input=${(event: Event) => {
                    this.query = (event.target as HTMLInputElement).value;
                  }}
                />${filtered.map(
                  (area) =>
                    html`<button
                      class="room ${this.roomId === area.id ? "selected" : ""}"
                      @click=${() =>
                        this.navigate(() => {
                          this.roomId = area.id;
                          this.otherRooms = false;
                          this.tab = "control";
                        })}
                    >
                      ${area.name}<small
                        >${Object.keys(
                          this.draft.config.rooms[area.id]?.ventilations ?? {},
                        ).length}
                        ${this.t("configured")}</small
                      >
                    </button>`,
                )}${!allAreas.length
                  ? html`<p class="help">${this.t("noRooms")}</p>`
                  : nothing}
              </aside>
              <main>${this.roomView()}</main>
            </div>`,
      )}
      ${this.draft.dirty && this.snapshot?.admin
        ? html`<footer>
            <span>${this.t("unsaved")}</span
            ><button ?disabled=${this.saving} @click=${this.discard}>
              ${this.t("discard")}</button
            ><button
              class="primary"
              ?disabled=${this.saving || this.draft.conflict}
              @click=${this.save}
            >
              ${this.t(this.saving ? "saving" : "save")}
            </button>
          </footer>`
        : nothing}
    </div>`;
  }
}
customElements.define("havo-panel", HavoPanel);
