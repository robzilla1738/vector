import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  EffectSchema,
  AuxError,
  SelectionCaptureSettingsSchema,
  readSelectionCaptureSettings,
  captureShortcutConflict,
  type SelectionCaptureSettings,
  ModelProviderSchema,
  ModelConnectionChangeSchema,
  ModelConnectionStatusSchema,
  ImageModelSchema,
  type ModelConnectionStatus,
  type ImageModel,
  OriginRuleSchema,
  SidebarMaterialSchema,
  type Effect,
  type ModelProvider,
  type OriginRule,
  type ShortcutOverrides,
} from "@aux/contracts";
import { z } from "zod";
import { DEFAULT_SEARCH_ENGINE } from "@aux/contracts/search-engine";
import {
  MODEL_REGISTRY,
  AgentModelRoutesSettingSchema,
  mergeModelCapabilities,
  agentModelRoute,
  normalizeRouteChain,
  type AgentModelCategory,
  type AgentModelRoute,
  type ModelCapability,
} from "@aux/contracts/model-registry";
import { DEFAULT_GRANTS, USER_RUN_GRANTS, sanitizeGrants, type GrantInput } from "../agent/permissions.js";
import {
  DEFAULT_MAX_MODEL_CALLS,
  DEFAULT_PLANNER_MODEL,
  LUNA_FAST_MODEL,
  modelCallBudget,
  type ModelClient,
} from "../agent/model-client.js";
import {
  DIRECT_PROVIDERS,
  PROVIDER_ENV,
  directModelClient,
  isLoopbackCompatibleEndpoint,
  normalizeCompatibleEndpoint,
  providerEndpoint,
} from "../agent/direct-providers.js";
import { GatewayModelClient } from "../agent/gateway-client.js";
import type { Repo } from "../store/repo.js";
import type { NativeBridge } from "../native.js";

export interface Settings {
  modelProvider?: ModelProvider;
  modelConnection?: { provider: ModelProvider; enabled: boolean };
  disabledModelProviders?: ModelProvider[];
  imageModel?: ImageModel | null;
  modelCredential?: { provider: ModelProvider; key: string };
  compatibleEndpoint?: string;
  providerModels?: Partial<
    Record<ModelProvider, { plannerModel?: string; recoveryModel?: string; visionModel?: string }>
  >;
  gatewayApiKey?: string;
  plannerModel?: string;
  recoveryModel?: string;
  visionModel?: string;
  agentModelRoutes?: Partial<Record<AgentModelCategory, AgentModelRoute | AgentModelRoute[]>>;
  providerAgentModelRoutes?: Partial<Record<ModelProvider, Settings["agentModelRoutes"]>>;
  /** User budgets in USD (D11): per run, per local day, per routine lifetime. Unset = unlimited. */
  budgets?: { runUsd?: number; dayUsd?: number; routineUsd?: number };
  searchEngine?: string;
  homeEntryMode?: "search" | "ask";
  searchEngines?: { keyword: string; name: string; template: string }[];
  searchSuggestions?: boolean;
  routineSuggestionScan?: "off" | "context" | "five-minutes";
  /** Personal info offered to page forms on explicit request only. */
  autofill?: {
    name?: string;
    email?: string;
    phone?: string;
    organization?: string;
    street?: string;
    city?: string;
    region?: string;
    postal?: string;
    country?: string;
  };
  maxWorkers?: number;
  perOrigin?: number;
  maxModelCalls?: number;
  theme?: "system" | "dark" | "light";
  sidebarAppearance?: "solid" | "translucent";
  sidebarMaterial?: "liquid-glass" | "titlebar" | "sidebar" | "under-window";
  sidebarTint?: number;
  contentOpacity?: number;
  sidebarBlur?: number;
  sidebarOpacity?: number;
  tabLayout?: "vertical" | "horizontal";
  memorySaverMinutes?: 0 | 1 | 15 | 30 | 60;
  tabSwitcherOrder?: "sidebar" | "recently-used";
  /** commandId → replacement bindings; null disables the command's shortcuts. */
  shortcutOverrides?: ShortcutOverrides;
  selectionCapture?: SelectionCaptureSettings;
  zoomFactor?: number;
  dataDir?: string;
  /**
   * Privilege-independent agent effect grants (Gate D / Gate F).
   * The person sets these. Model text cannot expand them.
   */
  effectGrants?: GrantInput[];
  originPolicies?: OriginRule[];
  safetyCeilings?: Partial<Record<Effect, "never" | "ask" | "always">>;
  /** Nonsecret result of the latest explicit connection test. */
  modelProbe?: ModelProbeRecord;
}

export interface ModelProbeRecord {
  provider: ModelProvider;
  modelId: string;
  ok: boolean;
  checkedAt: number;
  latencyMs?: number;
  vision?: boolean;
}

export class SettingsService {
  private connectionEpoch = 0;
  /** Test hook — inject a mock model instead of the real Gateway client. */
  modelOverride: ModelClient | null = null;
  private gatewayClient: ModelClient | null = null;
  private fileSettings: Settings = {};
  private native: NativeBridge | null = null;
  private savedKey: string | undefined;
  private directKeys: Partial<Record<ModelProvider, string>> = {};
  private directErrors: Partial<Record<ModelProvider, string>> = {};
  private credentialError: string | undefined;
  private writes: Promise<unknown> = Promise.resolve();

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

  async initializeCredentials(): Promise<void> {
    if (!this.native?.available()) return;
    try {
      this.savedKey = (await this.native.readSecret("gatewayApiKey")).value;
      this.credentialError = undefined;
    } catch {
      this.credentialError =
        "Saved credential is unavailable. Unlock the OS credential store or re-enter the key in Settings.";
    }
    for (const provider of DIRECT_PROVIDERS) {
      try {
        this.directKeys[provider] = (await this.native.readSecret(`modelKey-${provider}`)).value;
        delete this.directErrors[provider];
      } catch {
        this.directErrors[provider] =
          "Saved credential is unavailable. Re-enter this provider's key in Settings.";
      }
    }
  }

  get(key: keyof Settings): unknown {
    if (key === "gatewayApiKey" || key === "modelCredential") return undefined;
    return this.repo.getSetting(key) ?? this.fileSettings[key];
  }

  all(): Settings & {
    dataDir: string;
    gatewayCredentialError?: string;
    gatewayCredentialSource: string;
    modelConfigured: boolean;
    modelConnections: ModelConnectionStatus[];
    modelApiKey?: string;
    modelCredentialSource: string;
    modelCredentialError?: string;
    modelEndpoint: string;
    modelProbe?: ModelProbeRecord;
    agentModelRouteOverrides: Settings["agentModelRoutes"];
  } {
    const modelProbe = this.get("modelProbe") as ModelProbeRecord | undefined;
    const localCompatible =
      this.modelProvider() === "openai-compatible" && isLoopbackCompatibleEndpoint(this.compatibleEndpoint());
    return {
      gatewayApiKey: this.savedKey || this.env.AI_GATEWAY_API_KEY ? "••••••••" : undefined,
      gatewayCredentialSource: this.savedKey ? "saved" : this.env.AI_GATEWAY_API_KEY ? "environment" : "none",
      gatewayCredentialError:
        this.credentialError ??
        (this.hasLegacyCredential()
          ? "A legacy credential is present. Re-enter it in Settings to replace plaintext storage with encrypted storage."
          : undefined),
      modelProvider: this.modelProvider(),
      modelConnections: this.connectionStatuses(),
      imageModel: this.imageModel(),
      compatibleEndpoint: this.compatibleEndpoint(),
      modelApiKey: this.selectedKey() ? "••••••••" : undefined,
      modelCredentialSource:
        this.modelProvider() === "gateway"
          ? this.savedKey
            ? "saved"
            : this.env.AI_GATEWAY_API_KEY
              ? "environment"
              : "none"
          : this.directKeys[this.modelProvider()]
            ? "saved"
            : this.selectedKey()
              ? "environment"
              : "none",
      modelCredentialError:
        this.modelProvider() === "gateway" ? this.credentialError : this.directErrors[this.modelProvider()],
      modelEndpoint: providerEndpoint(this.modelProvider(), this.compatibleEndpoint()),
      modelProbe:
        modelProbe?.provider === this.modelProvider() && modelProbe.modelId === this.plannerModel()
          ? modelProbe
          : undefined,
      modelConfigured: this.connectionEnabled(this.modelProvider()) && !!(
        this.modelOverride ||
        (this.plannerModel() &&
          (this.selectedKey() || localCompatible) &&
          (this.modelProvider() !== "openai-compatible" || this.compatibleEndpoint()))
      ),
      plannerModel: this.plannerModel(),
      recoveryModel: this.recoveryModel(),
      visionModel: this.visionModel(),
      agentModelRoutes: {
        fast: this.agentRoute("fast"),
        standard: this.agentRoute("standard"),
        deep: this.agentRoute("deep"),
        visual: this.agentRoute("visual"),
      },
      agentModelRouteOverrides: this.routeOverrides(),
      budgets: this.budgetLimits(),
      searchEngine: this.searchEngine(),
      homeEntryMode: this.get("homeEntryMode") as Settings["homeEntryMode"],
      searchEngines: (this.get("searchEngines") as Settings["searchEngines"]) ?? [],
      searchSuggestions: (this.get("searchSuggestions") as boolean | undefined) ?? false,
      routineSuggestionScan: z.enum(["off", "context", "five-minutes"])
        .catch("context").parse(this.get("routineSuggestionScan")),
      maxWorkers: this.maxWorkers(),
      perOrigin: this.perOrigin(),
      maxModelCalls: this.maxModelCalls(),
      theme: (this.get("theme") as "system" | "dark" | "light") ?? "dark",
      sidebarAppearance: (this.get("sidebarAppearance") as "solid" | "translucent") ?? "translucent",
      sidebarMaterial: SidebarMaterialSchema.catch("liquid-glass").parse(this.get("sidebarMaterial")),
      sidebarTint: Number(this.get("sidebarTint") ?? 0),
      contentOpacity: Number(this.get("contentOpacity") ?? 95),
      sidebarBlur: Number(this.get("sidebarBlur") ?? 0),
      sidebarOpacity: Number(this.get("sidebarOpacity") ?? 90),
      tabLayout: (this.get("tabLayout") as "vertical" | "horizontal") ?? "horizontal",
      memorySaverMinutes: z.union([z.literal(0), z.literal(1), z.literal(15), z.literal(30), z.literal(60)])
        .catch(0).parse(this.get("memorySaverMinutes")),
      tabSwitcherOrder: (this.get("tabSwitcherOrder") as Settings["tabSwitcherOrder"]) ?? "sidebar",
      shortcutOverrides: (this.get("shortcutOverrides") as Settings["shortcutOverrides"]) ?? {},
      selectionCapture: this.selectionCapture(),
      autofill: (this.get("autofill") as Settings["autofill"]) ?? {},
      zoomFactor: (this.get("zoomFactor") as number) ?? 1,
      effectGrants: [...this.effectGrantsForRun()],
      originPolicies: this.originPolicies(),
      safetyCeilings: (this.get("safetyCeilings") as Settings["safetyCeilings"]) ?? {},
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

  originPolicies(): OriginRule[] {
    return OriginRuleSchema.array().parse(this.get("originPolicies") ?? []);
  }

  safetyCeiling(effect: Effect): "never" | "ask" | "always" {
    return (this.get("safetyCeilings") as Settings["safetyCeilings"] | undefined)?.[effect] ?? "ask";
  }

  selectionCapture(): SelectionCaptureSettings {
    return readSelectionCaptureSettings(this.get("selectionCapture"));
  }

  set(patch: Settings): Promise<{ ok: true }> {
    const write = this.writes.then(() => this.save(patch));
    this.writes = write.catch(() => {});
    return write;
  }

  private async save(patch: Settings): Promise<{ ok: true }> {
    const next: Settings = { ...patch };
    if (next.selectionCapture !== undefined) {
      const selection = SelectionCaptureSettingsSchema.parse(next.selectionCapture);
      if (selection.revision !== this.selectionCapture().revision)
        throw new AuxError("conflict", "Selection & Capture changed in another window. Reload the saved settings before trying again.");
      next.selectionCapture = { ...selection, revision: selection.revision + 1 };
    }
    if (next.selectionCapture !== undefined || next.shortcutOverrides !== undefined) {
      const conflict = captureShortcutConflict(next.selectionCapture ?? this.selectionCapture(),
        next.shortcutOverrides ?? this.get("shortcutOverrides") as ShortcutOverrides | undefined, process.platform);
      if (conflict) throw new AuxError("conflict", conflict);
    }
    if (next.modelCredential && next.gatewayApiKey !== undefined)
      throw new Error("Save one provider credential at a time.");
    const connectionChange = [
      "modelProvider",
      "modelCredential",
      "modelConnection",
      "imageModel",
      "gatewayApiKey",
      "compatibleEndpoint",
      "plannerModel",
      "recoveryModel",
      "visionModel",
      "agentModelRoutes",
    ].some((key) => key in next);
    if (
      connectionChange &&
      this.repo.db
        .prepare(
          "SELECT 1 FROM runs WHERE status IN ('queued','planning','running','paused','needs_input') LIMIT 1",
        )
        .get()
    ) {
      throw new Error("Stop active runs before changing model connections.");
    }
    const selectedProvider = ModelProviderSchema.parse(next.modelProvider ?? this.modelProvider());
    // Validate before touching OS credentials; a rejected setting must not partially rotate a key.
    if (next.imageModel !== undefined) next.imageModel = ImageModelSchema.nullable().parse(next.imageModel);
    if (next.modelConnection) {
      const change = ModelConnectionChangeSchema.parse(next.modelConnection);
      const disabled = new Set(ModelProviderSchema.array().parse(this.get("disabledModelProviders") ?? []));
      if (change.enabled) disabled.delete(change.provider); else disabled.add(change.provider);
      next.disabledModelProviders = [...disabled];
      delete next.modelConnection;
    }
    if (next.compatibleEndpoint !== undefined)
      next.compatibleEndpoint = normalizeCompatibleEndpoint(next.compatibleEndpoint);
    if (next.modelCredential) {
      const { provider, key } = next.modelCredential;
      if (provider === "gateway") await this.writeGatewayKey(key);
      else {
        if (!this.native?.available())
          throw new Error(
            "Secure credential storage requires the desktop; supply the provider key through the process environment for standalone use.",
          );
        if (key === "••••••••")
          throw new Error("Enter the actual key; a masked placeholder cannot be saved.");
        await this.native.storeSecret(`modelKey-${provider}`, key);
        this.directKeys[provider] = key || undefined;
        delete this.directErrors[provider];
      }
      delete next.modelCredential;
    }
    if (next.agentModelRoutes !== undefined && selectedProvider !== "gateway") {
      const current = this.get("providerAgentModelRoutes") as Settings["providerAgentModelRoutes"] | undefined;
      next.providerAgentModelRoutes = { ...current, [selectedProvider]: next.agentModelRoutes };
      delete next.agentModelRoutes;
    }
    if (selectedProvider !== "gateway") {
      const profile = { ...this.profiles()[selectedProvider] };
      for (const key of ["plannerModel", "recoveryModel", "visionModel"] as const) {
        if (next[key] !== undefined) {
          profile[key] = next[key];
          delete next[key];
        }
      }
      next.providerModels = { ...this.profiles(), [selectedProvider]: profile };
    }
    if (next.effectGrants !== undefined) next.effectGrants = sanitizeGrants(next.effectGrants);
    if (next.originPolicies !== undefined)
      next.originPolicies = OriginRuleSchema.array().max(500).parse(next.originPolicies);
    if (next.safetyCeilings !== undefined)
      next.safetyCeilings = z
        .partialRecord(EffectSchema, z.enum(["never", "ask", "always"]))
        .parse(next.safetyCeilings);
    if (next.agentModelRoutes !== undefined)
      next.agentModelRoutes = AgentModelRoutesSettingSchema.parse(next.agentModelRoutes);
    if (next.gatewayApiKey !== undefined) await this.writeGatewayKey(next.gatewayApiKey);
    if (connectionChange) { this.connectionEpoch++; this.repo.deleteSetting("modelProbe"); }
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined) continue;
      if (k === "gatewayApiKey") continue;
      this.repo.setSetting(k, v);
    }
    // persist non-secret prefs to settings.json for transparency
    const { gatewayApiKey, ...rest } = next;
    if (Object.keys(rest).length) {
      this.fileSettings = { ...this.fileSettings, ...rest };
      try {
        // Keep an existing legacy file untouched until explicit credential
        // replacement/removal; never copy its secret into a new preferences file.
        if (this.fileSettings.gatewayApiKey === undefined)
          writeFileSync(this.settingsPath, JSON.stringify(this.fileSettings, null, 2));
      } catch {
        /* settings.json is a convenience, not the source of truth */
      }
    }
    if (connectionChange) this.gatewayClient = null; // rebuild on next use
    return { ok: true };
  }

  gatewayKey(): string | undefined {
    if (!this.connectionEnabled("gateway")) return undefined;
    if (this.savedKey) return this.savedKey;
    if (this.env.AI_GATEWAY_API_KEY) return this.env.AI_GATEWAY_API_KEY;
    if (this.credentialError) throw new Error(this.credentialError);
    if (this.hasLegacyCredential())
      throw new Error(
        "Legacy plaintext credentials are disabled. Re-enter the key in Settings to save it securely.",
      );
    return undefined;
  }

  plannerModel(): string {
    if (this.modelProvider() !== "gateway") return this.profiles()[this.modelProvider()]?.plannerModel ?? "";
    return (
      (this.get("plannerModel") as string | undefined) || this.env.AUX_PLANNER_MODEL || DEFAULT_PLANNER_MODEL
    );
  }
  recoveryModel(): string | undefined {
    if (this.modelProvider() !== "gateway")
      return this.profiles()[this.modelProvider()]?.recoveryModel || undefined;
    return (this.get("recoveryModel") as string) ?? this.env.AUX_RECOVERY_MODEL ?? this.plannerModel();
  }
  visionModel(): string | undefined {
    if (this.modelProvider() !== "gateway")
      return this.profiles()[this.modelProvider()]?.visionModel || undefined;
    return (this.get("visionModel") as string) || this.env.AUX_VISION_MODEL || this.plannerModel();
  }
  /** Existing model choices remain the category defaults; explicit routes can tune model and effort. */
  private routeOverrides(): Settings["agentModelRoutes"] {
    const provider = this.modelProvider();
    const stored = provider === "gateway"
      ? this.get("agentModelRoutes")
      : (this.get("providerAgentModelRoutes") as Settings["providerAgentModelRoutes"] | undefined)?.[provider];
    const parsed = AgentModelRoutesSettingSchema.safeParse(stored);
    return parsed.success ? parsed.data : {};
  }

  private routeBaseline(category: AgentModelCategory): AgentModelRoute {
    const baseline = agentModelRoute(category);
    const modelId =
      category === "visual"
        ? this.visionModel()
        : category === "deep"
          ? this.recoveryModel()
          : this.plannerModel();
    return { ...baseline, modelId: modelId || baseline.modelId };
  }
  /**
   * Ordered candidate chain per category (S5.9): stored single route or
   * array first, then built-in fallbacks deduped by model — every category
   * keeps at least one alternate so a 429/5xx has somewhere to go.
   */
  agentRouteChain(category: AgentModelCategory): AgentModelRoute[] {
    const stored = normalizeRouteChain(
      this.routeOverrides()?.[category],
    );
    const chain = stored.length ? stored : [this.routeBaseline(category)];
    const seen = new Set(chain.map((r) => r.modelId));
    for (const fb of [this.routeBaseline(category), { modelId: LUNA_FAST_MODEL, reasoning: "low" as const }, agentModelRoute(category)]) {
      if (!seen.has(fb.modelId)) { chain.push(fb); seen.add(fb.modelId); }
    }
    return chain.slice(0, 4);
  }
  agentRoute(category: AgentModelCategory): AgentModelRoute {
    return this.agentRouteChain(category)[0]!;
  }
  /** Chain for the failover wrapper: the category whose head this model routes. */
  candidatesForModel(modelId: string): AgentModelRoute[] {
    for (const category of ["fast", "standard", "deep", "visual"] as const) {
      const chain = this.agentRouteChain(category);
      if (chain[0]?.modelId === modelId) return chain;
    }
    return [];
  }
  /** Snapshot + live-catalog merged capability list, refreshed by listModels(). */
  private mergedCatalog: readonly ModelCapability[] = MODEL_REGISTRY;
  registryModels(): readonly ModelCapability[] { return this.mergedCatalog; }
  /** S5 A/B gate: AUX_RUN_ENGINE selects the run engine — explicit opts still win. */
  runEngine(): "agent" | "agent-loop" | undefined {
    const v = this.env.AUX_RUN_ENGINE;
    return v === "agent-loop" || v === "agent" ? v : undefined;
  }
  budgetLimits(): { runUsd?: number; dayUsd?: number; routineUsd?: number } {
    const b = this.get("budgets") as Settings["budgets"] | undefined;
    const pos = (v: unknown) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : undefined; };
    return { runUsd: pos(b?.runUsd), dayUsd: pos(b?.dayUsd), routineUsd: pos(b?.routineUsd) };
  }
  searchEngine(): string {
    return (this.get("searchEngine") as string) ?? DEFAULT_SEARCH_ENGINE;
  }
  maxWorkers(): number {
    return (this.get("maxWorkers") as number) ?? 4;
  }
  perOrigin(): number {
    return (this.get("perOrigin") as number) ?? 2;
  }
  maxModelCalls(): number {
    return modelCallBudget(this.get("maxModelCalls"), DEFAULT_MAX_MODEL_CALLS);
  }

  model(): ModelClient | null {
    if (!this.connectionEnabled(this.modelProvider())) return null;
    if (this.modelOverride) return this.modelOverride;
    const provider = this.modelProvider();
    const endpoint = this.compatibleEndpoint();
    const key =
      provider === "gateway"
        ? this.gatewayKey()
        : (this.selectedKey() ??
          (provider === "openai-compatible" && isLoopbackCompatibleEndpoint(endpoint)
            ? "aux-local"
            : undefined));
    if (!key || !this.plannerModel() || (provider === "openai-compatible" && !endpoint)) return null;
    if (provider !== "gateway") {
      if (!this.gatewayClient) this.gatewayClient = directModelClient(provider, key, undefined, endpoint);
      return this.gatewayClient;
    }
    if (!this.gatewayClient) {
      const t = Number(this.env.AUX_MODEL_CALL_TIMEOUT_MS);
      const only = this.env.AUX_GATEWAY_ONLY?.split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      this.gatewayClient = new GatewayModelClient(key, {
        callTimeoutMs: Number.isFinite(t) && t > 0 ? t : undefined,
        only: only?.length ? only : undefined,
        models: () => this.mergedCatalog,
        candidatesFor: (id) => this.candidatesForModel(id),
        allowedModelId: this.env.AUX_BENCH_MODEL_PIN || undefined,
      });
    }
    return this.gatewayClient;
  }

  async listModels(): Promise<{ models: ModelCapability[]; source: "gateway" | "static" | "configured" }> {
    const provider = this.modelProvider();
    if (provider !== "gateway") {
      const configured = [
        ...new Set([this.plannerModel(), this.visionModel()].filter((value): value is string => !!value)),
      ].map((id) => ({ id, source: "configured" as const }));
      if (provider !== "openai-compatible" || !this.connectionEnabled(provider)) return { models: configured, source: "configured" };
      const endpoint = this.compatibleEndpoint();
      const key = this.selectedKey();
      if (!endpoint || (!key && !isLoopbackCompatibleEndpoint(endpoint)))
        return { models: configured, source: "configured" };
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      try {
        const response = await fetch(`${endpoint}/models`, {
          headers: { Accept: "application/json", ...(key ? { Authorization: `Bearer ${key}` } : {}) },
          signal: controller.signal,
          redirect: "error",
        });
        if (!response.ok) throw new Error(`Model discovery failed with HTTP ${response.status}.`);
        const declared = Number(response.headers.get("content-length") ?? 0);
        if (declared > 2_000_000)
          throw new Error("The model endpoint returned more data than Aux will accept.");
        const body = await response.text();
        if (Buffer.byteLength(body, "utf8") > 2_000_000)
          throw new Error("The model endpoint returned more data than Aux will accept.");
        let value: unknown;
        try {
          value = JSON.parse(body);
        } catch {
          throw new Error("The model endpoint returned an invalid response.");
        }
        const data =
          value && typeof value === "object" && Array.isArray((value as { data?: unknown }).data)
            ? (value as { data: unknown[] }).data
            : null;
        if (!data) throw new Error("The model endpoint did not return an OpenAI-compatible model list.");
        const discovered = data.flatMap((item) => {
          if (!item || typeof item !== "object" || typeof (item as { id?: unknown }).id !== "string")
            return [];
          const id = (item as { id: string }).id.trim();
          return id && id.length <= 500 ? [{ id, source: "configured" as const }] : [];
        });
        const seen = new Set<string>();
        const unique = discovered.filter((item) => !seen.has(item.id) && !!seen.add(item.id)).slice(0, 500);
        return {
          models: [...unique, ...configured.filter((item) => !seen.has(item.id))],
          source: "configured",
        };
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError")
          throw new Error("Model discovery timed out after 10 seconds.");
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    }
    const m = this.model();
    let extra: { id: string; name?: string; inputUsdPerMTok?: number; outputUsdPerMTok?: number }[] = [];
    let source: "gateway" | "static" = "static";
    if (m) {
      try {
        extra = await m.listModels();
        source = "gateway";
      } catch {
        extra = [];
      }
    }
    const catalog = extra.map((x) => ({ ...x, source: "catalog" as const }));
    this.mergedCatalog = mergeModelCapabilities(MODEL_REGISTRY, catalog);
    return {
      models: this.mergedCatalog as ModelCapability[],
      source,
    };
  }

  /** Tiny structured-output + optional screenshot-understanding probe. */
  async probe(
    modelId?: string,
  ): Promise<{ ok: boolean; modelId: string; latencyMs?: number; vision?: boolean; error?: string }> {
    const epoch = this.connectionEpoch, provider = this.modelProvider();
    const stale = () => epoch !== this.connectionEpoch || !this.connectionEnabled(provider);
    const interrupted = () => ({ ok: false, modelId: modelId ?? this.plannerModel(), error: "Connection changed during the test. Review it and test again." });
    const m = this.model();
    const target = modelId ?? this.plannerModel();
    if (!m)
      return {
        ok: false,
        modelId: target,
        error: "Configure a provider connection and planner model in Settings first",
      };
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
      if (stale()) return interrupted();
      const ok = res.object.ok === true;
      let vision: boolean | undefined;
      try {
        // 1x1 png
        const png =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
        await m.generateText({
          modelId: target,
          prompt: "What color dominates this image? One word.",
          imageDataUrl: png,
          maxOutputTokens: 512,
        });
        vision = true;
      } catch {
        vision = false;
      }
      if (stale()) return interrupted();
      const result = { ok, modelId: target, latencyMs: res.durationMs, vision };
      this.repo.setSetting("modelProbe", {
        provider: this.modelProvider(),
        modelId: target,
        ok,
        checkedAt: Date.now(),
        latencyMs: res.durationMs,
        vision,
      } satisfies ModelProbeRecord);
      return result;
    } catch (e) {
      if (stale()) return interrupted();
      this.repo.setSetting("modelProbe", {
        provider: this.modelProvider(),
        modelId: target,
        ok: false,
        checkedAt: Date.now(),
      } satisfies ModelProbeRecord);
      return { ok: false, modelId: target, error: e instanceof Error ? e.message : String(e) };
    }
  }

  modelProvider(): ModelProvider {
    return ModelProviderSchema.parse(this.get("modelProvider") ?? "gateway");
  }
  compatibleEndpoint(): string | undefined {
    const value = this.get("compatibleEndpoint");
    if (typeof value !== "string" || !value) return undefined;
    try {
      return normalizeCompatibleEndpoint(value);
    } catch {
      return undefined;
    }
  }
  private profiles(): NonNullable<Settings["providerModels"]> {
    return (this.get("providerModels") as Settings["providerModels"]) ?? {};
  }
  private selectedKey(): string | undefined {
    const provider = this.modelProvider();
    if (!this.connectionEnabled(provider)) return undefined;
    return provider === "gateway"
      ? this.savedKey || this.env.AI_GATEWAY_API_KEY
      : this.directKeys[provider] || this.env[PROVIDER_ENV[provider]];
  }

  connectionEnabled(provider: ModelProvider): boolean {
    return !ModelProviderSchema.array().parse(this.get("disabledModelProviders") ?? []).includes(provider);
  }
  imageModel(): ImageModel | null {
    return ImageModelSchema.nullable().parse(this.get("imageModel") ?? null);
  }
  private connectionStatuses(): ModelConnectionStatus[] {
    return ModelProviderSchema.options.map(provider => {
      const saved = provider === "gateway" ? this.savedKey : this.directKeys[provider];
      const environment = provider === "gateway" ? this.env.AI_GATEWAY_API_KEY : this.env[PROVIDER_ENV[provider]];
      return ModelConnectionStatusSchema.parse({ provider, selected: provider === this.modelProvider(),
        enabled: this.connectionEnabled(provider), credentialSource: saved ? "saved" : environment ? "environment" : "none",
        credentialUnavailable: !!(provider === "gateway" ? this.credentialError : this.directErrors[provider]),
        localEndpoint: provider === "openai-compatible" && isLoopbackCompatibleEndpoint(this.compatibleEndpoint()),
      });
    });
  }

  private gatewayKeyPath(): string {
    return join(dirname(this.settingsPath), "gateway.key");
  }

  private hasLegacyCredential(): boolean {
    return (
      existsSync(this.gatewayKeyPath()) ||
      this.repo.hasSetting("gatewayApiKey") ||
      this.fileSettings.gatewayApiKey !== undefined
    );
  }

  private async writeGatewayKey(key: string): Promise<void> {
    if (!this.native?.available())
      throw new Error(
        "Secure credential storage requires the desktop. Supply AI_GATEWAY_API_KEY in the process environment for standalone use.",
      );
    if (key === "••••••••") throw new Error("Enter the actual key; a masked placeholder cannot be saved.");
    await this.native.storeSecret("gatewayApiKey", key);
    this.savedKey = key || undefined;
    this.credentialError = undefined;
    this.gatewayClient = null;
    // Only an explicit save/remove retires legacy plaintext storage. Never read
    // gateway.key or silently use a legacy value as the encryption input.
    try {
      unlinkSync(this.gatewayKeyPath());
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    this.repo.deleteSetting("gatewayApiKey");
    const { gatewayApiKey: legacyKey, ...preferences } = this.fileSettings;
    this.fileSettings = preferences;
    writeFileSync(this.settingsPath, JSON.stringify(preferences, null, 2), { mode: 0o600 });
  }
}
