import { readFileSync, writeFileSync, existsSync } from "node:fs";
import type { EngineMode } from "@vector/contracts";
import type { ModelClient } from "../agent/model-client.js";
import { FALLBACK_MODELS } from "../agent/model-client.js";
import { GatewayModelClient } from "../agent/gateway-client.js";
import type { Repo } from "../store/repo.js";

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
   * Vector Engine routing (architecture §11): "off" — Chromium only, the
   * default so nothing changes for existing users; "auto" — the router
   * tries the engine first and falls back; "always" — engine only
   * (benchmarks/tests). Env override: VECTOR_ENGINE_MODE.
   */
  engineMode?: EngineMode;
}

const ENGINE_MODES: readonly EngineMode[] = ["off", "auto", "always"];

export class SettingsService {
  /** Test hook — inject a mock model instead of the real Gateway client. */
  modelOverride: ModelClient | null = null;
  private gatewayClient: ModelClient | null = null;
  private fileSettings: Settings = {};

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
      dataDir: this.settingsPath.replace(/\/settings\.json$/, ""),
    };
  }

  /** Setting wins over the env override; anything unrecognised is "off". */
  engineMode(): EngineMode {
    const v = (this.get("engineMode") as string | undefined) ?? this.env.VECTOR_ENGINE_MODE;
    return ENGINE_MODES.includes(v as EngineMode) ? (v as EngineMode) : "off";
  }

  set(patch: Settings): { ok: true } {
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined) continue;
      this.repo.setSetting(k, v);
    }
    // persist non-secret prefs to settings.json for transparency
    const { gatewayApiKey, ...rest } = patch;
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
    return (this.get("gatewayApiKey") as string) ?? this.env.AI_GATEWAY_API_KEY;
  }

  plannerModel(): string {
    return (this.get("plannerModel") as string) ?? this.env.VECTOR_PLANNER_MODEL ?? "anthropic/claude-sonnet-4.5";
  }
  recoveryModel(): string | undefined {
    return (this.get("recoveryModel") as string) ?? this.env.VECTOR_RECOVERY_MODEL;
  }
  visionModel(): string | undefined {
    return (this.get("visionModel") as string) || this.env.VECTOR_VISION_MODEL || undefined;
  }
  searchEngine(): string {
    return (this.get("searchEngine") as string) ?? "https://www.google.com/search?q=";
  }
  maxWorkers(): number {
    return (this.get("maxWorkers") as number) ?? 4;
  }
  perOrigin(): number {
    return (this.get("perOrigin") as number) ?? 2;
  }
  maxModelCalls(): number {
    return (this.get("maxModelCalls") as number) ?? 2;
  }

  model(): ModelClient | null {
    if (this.modelOverride) return this.modelOverride;
    const key = this.gatewayKey();
    if (!key) return null;
    if (!this.gatewayClient) {
      const t = Number(this.env.VECTOR_MODEL_CALL_TIMEOUT_MS);
      this.gatewayClient = new GatewayModelClient(key, { callTimeoutMs: Number.isFinite(t) && t > 0 ? t : undefined });
    }
    return this.gatewayClient;
  }

  async listModels(): Promise<{ models: { id: string; name?: string }[]; source: "gateway" | "static" }> {
    const m = this.model();
    if (!m) return { models: FALLBACK_MODELS, source: "static" };
    try {
      return { models: await m.listModels(), source: "gateway" };
    } catch {
      return { models: FALLBACK_MODELS, source: "static" };
    }
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
}
