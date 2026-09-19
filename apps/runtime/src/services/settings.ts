import { chmodSync, existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { EngineMode } from "@vector/contracts";
import { DEFAULT_GRANTS, USER_RUN_GRANTS, sanitizeGrants, type GrantInput } from "../agent/permissions.js";
import { FALLBACK_MODELS, DEFAULT_PLANNER_MODEL, modelCallBudget, type ModelClient } from "../agent/model-client.js";
import { GatewayModelClient } from "../agent/gateway-client.js";
import type { Repo } from "../store/repo.js";
import type { NativeBridge } from "../native.js";

export interface Settings {
  gatewayApiKey?: string;
  plannerModel?: string;
  recoveryModel?: string;
  visionModel?: string;
  searchEngine?: string;
  maxWorkers?: number;
  perOrigin?: number;
  maxModelCalls?: number;
  theme?: "dark" | "light";
  zoomFactor?: number;
  dataDir?: string;
  /**
   * Vector Engine routing (architecture §11): "off" — Chromium only;
   * "auto" — the router tries the engine first and falls back (the default
   * after A18); "always" — engine only (benchmarks/tests). Env override:
   * VECTOR_ENGINE_MODE.
   */
  engineMode?: EngineMode;
  /**
   * Privilege-independent agent effect grants (Gate D / Gate F).
   * The person sets these. Model text cannot expand them.
   */
  effectGrants?: GrantInput[];
}

const ENGINE_MODES: readonly EngineMode[] = ["off", "auto", "always"];

export class SettingsService {
  /** Test hook — inject a mock model instead of the real Gateway client. */
  modelOverride: ModelClient | null = null;
  private gatewayClient: ModelClient | null = null;
  private fileSettings: Settings = {};
  private native: NativeBridge | null = null;

  constructor(
    private repo: Repo,
    private settingsPath: string,
    private env: NodeJS.ProcessEnv = process.env,
  ) {
    if (existsSync(settingsPath)) {
      try {
        this.fileSettings = JSON.parse(readFileSync(settingsPath, "utf8")) as Settings;
      } catch {
        this.fileSettings = {};
      }
    }
  }

  attachNative(native: NativeBridge): void {
    this.native = native;
  }

  get(key: keyof Settings): unknown {
    return this.repo.getSetting(key) ?? this.fileSettings[key];
  }

  all(): Settings & { dataDir: string } {
    return {
      gatewayApiKey: this.gatewayKey() ? "••••••••" : undefined,
      plannerModel: this.plannerModel(),
      recoveryModel: this.recoveryModel(),
      visionModel: this.visionModel(),
      searchEngine: this.searchEngine(),
      maxWorkers: this.maxWorkers(),
      perOrigin: this.perOrigin(),
      maxModelCalls: this.maxModelCalls(),
      theme: (this.get("theme") as "dark" | "light") ?? "dark",
      zoomFactor: (this.get("zoomFactor") as number) ?? 1,
      engineMode: this.engineMode(),
      effectGrants: [...this.effectGrants()],
      dataDir: this.settingsPath.replace(/\/settings\.json$/, ""),
    };
  }

  /** Live grant list. settings.set is the only expander. */
  effectGrants(): readonly GrantInput[] {
    return sanitizeGrants(this.get("effectGrants") ?? this.fileSettings.effectGrants ?? DEFAULT_GRANTS);
  }

  /**
   * Grants for a user-started run. Starting the run is the write grant.
   * An explicit settings.effectGrants list still wins (permission sheet).
   */
  effectGrantsForRun(): readonly GrantInput[] {
    const explicit = this.get("effectGrants") ?? this.fileSettings.effectGrants;
    if (explicit !== undefined) return sanitizeGrants(explicit);
    return sanitizeGrants([...USER_RUN_GRANTS]);
  }

  /** Setting wins over the env override; anything unrecognised is "auto". */
  engineMode(): EngineMode {
    const v = (this.get("engineMode") as string | undefined) ?? this.env.VECTOR_ENGINE_MODE;
    return ENGINE_MODES.includes(v as EngineMode) ? (v as EngineMode) : "auto";
  }

  set(patch: Settings): { ok: true } {
    const next: Settings = { ...patch };
    if (next.effectGrants !== undefined) next.effectGrants = sanitizeGrants(next.effectGrants);
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined) continue;
      if (k === "gatewayApiKey") {
        this.writeGatewayKey(typeof v === "string" ? v : "");
        continue;
      }
      this.repo.setSetting(k, v);
    }
    // persist non-secret prefs to settings.json for transparency
    const { gatewayApiKey, ...rest } = next;
    if (Object.keys(rest).length) {
      this.fileSettings = { ...this.fileSettings, ...rest };
      try {
        writeFileSync(this.settingsPath, JSON.stringify(this.fileSettings, null, 2));
      } catch {
        /* settings.json is a convenience, not the source of truth */
      }
    }
    if (gatewayApiKey !== undefined) this.gatewayClient = null; // rebuild on next use
    return { ok: true };
  }

  gatewayKey(): string | undefined {
    const fromFile = this.readGatewayKey();
    if (fromFile) return fromFile;
    return (this.get("gatewayApiKey") as string) ?? this.env.AI_GATEWAY_API_KEY;
  }

  plannerModel(): string {
    return (
      (this.get("plannerModel") as string | undefined) ||
      this.env.VECTOR_PLANNER_MODEL ||
      DEFAULT_PLANNER_MODEL
    );
  }
  recoveryModel(): string | undefined {
    return (this.get("recoveryModel") as string) ?? this.env.VECTOR_RECOVERY_MODEL;
  }
  visionModel(): string | undefined {
    return (this.get("visionModel") as string) || this.env.VECTOR_VISION_MODEL || undefined;
  }
  searchEngine(): string {
    return (this.get("searchEngine") as string) ?? "https://duckduckgo.com/?q=%s";
  }
  maxWorkers(): number {
    return (this.get("maxWorkers") as number) ?? 4;
  }
  perOrigin(): number {
    return (this.get("perOrigin") as number) ?? 2;
  }
  maxModelCalls(): number {
    return modelCallBudget(this.get("maxModelCalls"), 8);
  }

  model(): ModelClient | null {
    if (this.modelOverride) return this.modelOverride;
    const key = this.gatewayKey();
    if (!key) return null;
    if (!this.gatewayClient) {
      const t = Number(this.env.VECTOR_MODEL_CALL_TIMEOUT_MS);
      const only = this.env.VECTOR_GATEWAY_ONLY?.split(",").map((s) => s.trim()).filter(Boolean);
      this.gatewayClient = new GatewayModelClient(key, {
        callTimeoutMs: Number.isFinite(t) && t > 0 ? t : undefined,
        only: only?.length ? only : undefined,
      });
    }
    return this.gatewayClient;
  }

  async listModels(): Promise<{ models: { id: string; name?: string }[]; source: "gateway" | "static" }> {
    const m = this.model();
    let extra: { id: string; name?: string }[] = [];
    let source: "gateway" | "static" = "static";
    if (m) {
      try {
        extra = await m.listModels();
        source = "gateway";
      } catch {
        extra = [];
      }
    }
    const seen = new Set(FALLBACK_MODELS.map((x) => x.id));
    return {
      models: [...FALLBACK_MODELS, ...extra.filter((x) => !seen.has(x.id))],
      source,
    };
  }

  /** Tiny structured-output + optional screenshot-understanding probe. */
  async probe(modelId?: string): Promise<{ ok: boolean; modelId: string; latencyMs?: number; vision?: boolean; error?: string }> {
    const m = this.model();
    const target = modelId ?? this.plannerModel();
    if (!m) return { ok: false, modelId: target, error: "no Gateway API key configured" };
    try {
      const { z } = await import("zod");
      const res = await m.generateStructured({
        modelId: target,
        system: "You answer probes with strict JSON.",
        prompt: 'Return {"ok":true}',
        schema: z.object({ ok: z.boolean() }),
        // generous budget — reasoning models spend tokens thinking before emitting
        maxOutputTokens: 1024,
      });
      const ok = res.object.ok === true;
      let vision: boolean | undefined;
      try {
        // 1x1 png
        const png =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
        await m.generateText({ modelId: target, prompt: "What color dominates this image? One word.", imageDataUrl: png, maxOutputTokens: 512 });
        vision = true;
      } catch {
        vision = false;
      }
      return { ok, modelId: target, latencyMs: res.durationMs, vision };
    } catch (e) {
      return { ok: false, modelId: target, error: e instanceof Error ? e.message : String(e) };
    }
  }

  private gatewayKeyPath(): string {
    return join(dirname(this.settingsPath), "gateway.key");
  }

  private readGatewayKey(): string | undefined {
    const path = this.gatewayKeyPath();
    if (!existsSync(path)) return undefined;
    try {
      const v = readFileSync(path, "utf8").trim();
      return v || undefined;
    } catch {
      return undefined;
    }
  }

  private writeGatewayKey(key: string): void {
    const path = this.gatewayKeyPath();
    if (!key) {
      try {
        unlinkSync(path);
      } catch {
        /* absent */
      }
      return;
    }
    writeFileSync(path, key, { mode: 0o600 });
    try {
      chmodSync(path, 0o600);
    } catch {
      /* non-POSIX fs */
    }
    if (this.native?.available()) {
      void this.native.storeSecret("gatewayApiKey", key).catch(() => {});
    }
  }
}
