import { VercelAuthService } from "./vercel-auth.js";
import { VercelAccounts, VercelRegistrationSchema, type VercelRegistration } from "./vercel-account.js";
import { vercelModelClient } from "../agent/vercel-model.js";
import { copilotModelClient } from "../agent/copilot-model.js";
import { ModelCapabilitySchema } from "@aux/contracts/model-registry";
import type { CopilotServices } from "./copilot-services.js";
import type { CopilotAccount } from "./copilot-account.js";
import { FoundationModelsClient, type UtilityRoute, type NetworkUtilityRoute } from "./foundation-models.js";
import { CopilotRegistrationSchema, type CopilotRegistration } from "./copilot-protocol.js";
import { randomUUID } from "node:crypto";
import {
  DownloadNamingSettingsSchema,
  DEFAULT_DOWNLOAD_NAMING,
  DEFAULT_NIGHT_SHIFT,
  NightShiftSettingsSchema,
  SettingsSetParams,
  AgentPolicySettingsSchema,
  FileAccessSettingsSchema,
  type FileAccessSettings,
  agentPolicyCategoryFor,
  type AgentPolicySettings,
  type SafetyAction,
} from "@aux/contracts";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
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
  SidebarMaterialSchema,
  type ModelProvider,
  type ShortcutOverrides,
} from "@aux/contracts";
import { z } from "zod";
import { DEFAULT_SEARCH_ENGINE } from "@aux/contracts/search-engine";
import {
  MODEL_REGISTRY,
  DEFAULT_AGENT_MODEL_FALLBACKS,
  DEFAULT_UTILITY_MODEL_ID,
  DEFAULT_IMAGE_MODEL_ID,
  AgentModelRoutesSettingSchema,
  mergeModelCapabilities,
  agentModelRoute,
  normalizeRouteChain,
  type AgentModelCategory,
  type AgentModelRoute,
  type ModelCapability,
} from "@aux/contracts/model-registry";
import {
  DEFAULT_MAX_MODEL_CALLS,
  DEFAULT_AGENT_MODEL,
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
import { ProviderAuthService } from "./provider-auth.js";
import { ChatgptAccounts, newChatgptHostId, type ChatgptAccount } from "./chatgpt-account.js";
import { ChatgptAuthService } from "./chatgpt-auth.js";
import { chatgptModelClient } from "../agent/chatgpt-model.js";
import { chatgptModels, parseChatgptModels } from "./chatgpt-catalog.js";
import { authJson, CHATGPT_RESOURCE } from "./chatgpt-account.js";
import { ModelCatalogService, discoverLocalModels, type LocalModelServer } from "./model-catalog.js";
import type { NativeBridge } from "../native.js";

export interface Settings extends Pick<
  z.infer<typeof SettingsSetParams>,
  "toolbarAutoHide" | "minimalUi" | "minimalUiAcknowledged" | "autoArchive" | "nightShift"
> {
  modelProvider?: ModelProvider;
  modelConnection?: { provider: ModelProvider; enabled: boolean };
  disabledModelProviders?: ModelProvider[];
  imageModel?: ImageModel | null;
  localModelsOnly?: boolean;
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
  budgets?: {
    runUsd?: number;
    dayUsd?: number;
    monthUsd?: number;
    routineUsd?: number;
  };
  searchEngine?: string;
  homeEntryMode?: "search" | "ask";
  commandRouting?: "automatic" | "prefer-chat" | "prefer-search";
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
  downloadNaming?: import("@aux/contracts").DownloadNamingSettings;
  memorySaverMinutes?: 0 | 1 | 15 | 30 | 60;
  tabSwitcherOrder?: "sidebar" | "recently-used";
  /** commandId → replacement bindings; null disables the command's shortcuts. */
  featureOverrides?: import("@aux/contracts").FeatureOverride;
  shortcutOverrides?: ShortcutOverrides;
  selectionCapture?: SelectionCaptureSettings;
  zoomFactor?: number;
  dataDir?: string;
  /** Permissions are written only by the trusted Settings path. */
  fileAccessMode?: FileAccessSettings["fileAccessMode"];
  fileAccessRevision?: number;
  agentMode?: AgentPolicySettings["agentMode"];
  agentPolicyRevision?: number;
  agentPolicies?: AgentPolicySettings["agentPolicies"];
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
  private foundationModels: FoundationModelsClient | undefined;
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
    if (this.repo.getSetting("vercelHostId")) {
      try { await this.vercelAccounts(); } catch { this.vercelCredentialError = true; }
    }
    if (this.repo.getSetting("chatgptHostId")) {
      try {
        await this.chatgptAccounts();
      } catch {
        this.chatgptCredentialError = true;
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
    modelAuthentication: "api-key" | "chatgpt" | "copilot" | "vercel";
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
      localModelsOnly: this.localModelsOnly(),
      modelProvider: this.modelProvider(),
      modelAuthentication: this.copilotSelection()
        ? "copilot"
        : this.modelProvider() === "openai" && this.activeChatgptAccount()
          ? "chatgpt"
          : this.modelProvider() === "gateway" && this.activeVercelAccount() ? "vercel" : "api-key",
      modelConnections: this.connectionStatuses(),
      imageModel: this.imageModel(),
      compatibleEndpoint: this.compatibleEndpoint(),
      modelApiKey: this.hasCopilotSelection() || (this.modelProvider() === "gateway" && !!this.activeVercelAccount())
        ? undefined
        : this.modelProvider() === "openai" && this.activeChatgptAccount()
          ? undefined
          : this.selectedKey()
            ? "••••••••"
            : undefined,
      modelCredentialSource: this.hasCopilotSelection() || (this.modelProvider() === "gateway" && !!this.activeVercelAccount())
        ? "saved"
        : this.modelProvider() === "openai" && this.activeChatgptAccount()
          ? "saved"
          : this.modelProvider() === "gateway"
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
      modelCredentialError: this.modelProvider() === "gateway" && this.activeVercelAccount() && this.vercelCredentialError
        ? "Sign in with Vercel again to unlock this account."
        : this.hasCopilotSelection()
        ? this.copilotSelection()
          ? undefined
          : "Choose a model after signing in to Copilot again."
        : this.modelProvider() === "openai" && this.activeChatgptAccount() && this.chatgptCredentialError
          ? "Sign in to ChatGPT again to unlock this account."
          : this.modelProvider() === "gateway"
            ? this.credentialError
            : this.directErrors[this.modelProvider()],
      modelEndpoint: this.copilotSelection()
        ? "Account-bound Copilot endpoint"
        : providerEndpoint(this.modelProvider(), this.compatibleEndpoint()),
      modelProbe:
        modelProbe?.provider === this.modelProvider() && modelProbe.modelId === this.plannerModel()
          ? modelProbe
          : undefined,
      modelConfigured: this.hasCopilotSelection()
        ? !!this.copilotSelection() && !this.localModelsOnly()
        : (!this.localModelsOnly() || localCompatible) &&
          this.connectionEnabled(this.modelProvider()) &&
          !!(
            this.modelOverride ||
            (this.plannerModel() &&
              (this.selectedKey() ||
                localCompatible ||
                (this.modelProvider() === "openai" && this.chatgptConnected()) ||
                (this.modelProvider() === "gateway" && this.vercelConnected())) &&
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
      commandRouting: (this.get("commandRouting") as Settings["commandRouting"]) ?? "automatic",
      searchEngines: (this.get("searchEngines") as Settings["searchEngines"]) ?? [],
      searchSuggestions: (this.get("searchSuggestions") as boolean | undefined) ?? false,
      routineSuggestionScan: z
        .enum(["off", "context", "five-minutes"])
        .catch("context")
        .parse(this.get("routineSuggestionScan")),
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
      tabLayout: (this.get("tabLayout") as "vertical" | "horizontal") ?? "vertical",
      toolbarAutoHide: z.boolean().parse(this.get("toolbarAutoHide") ?? true),
      minimalUi: z.boolean().parse(this.get("minimalUi") ?? false),
      minimalUiAcknowledged: z.boolean().parse(this.get("minimalUiAcknowledged") ?? false),
      autoArchive: SettingsSetParams.shape.autoArchive.parse(
        this.get("autoArchive") ?? { acknowledged: false, bySpace: {} },
      ),
      nightShift: NightShiftSettingsSchema.parse(this.get("nightShift") ?? DEFAULT_NIGHT_SHIFT),
      downloadNaming: DownloadNamingSettingsSchema.parse(
        this.get("downloadNaming") ?? DEFAULT_DOWNLOAD_NAMING,
      ),
      memorySaverMinutes: z
        .union([z.literal(0), z.literal(1), z.literal(15), z.literal(30), z.literal(60)])
        .catch(30)
        .parse(this.get("memorySaverMinutes")),
      tabSwitcherOrder: (this.get("tabSwitcherOrder") as Settings["tabSwitcherOrder"]) ?? "sidebar",
      featureOverrides: SettingsSetParams.shape.featureOverrides.parse(this.get("featureOverrides") ?? {}),
      shortcutOverrides: (this.get("shortcutOverrides") as Settings["shortcutOverrides"]) ?? {},
      selectionCapture: this.selectionCapture(),
      autofill: (this.get("autofill") as Settings["autofill"]) ?? {},
      zoomFactor: (this.get("zoomFactor") as number) ?? 1,
      ...this.agentPolicy(),
      ...this.fileAccess(),
      dataDir: this.settingsPath.replace(/\/settings\.json$/, ""),
    };
  }

  fileAccess(): FileAccessSettings {
    return FileAccessSettingsSchema.parse({
      fileAccessMode: this.get("fileAccessMode") ?? "guard",
      fileAccessRevision: this.get("fileAccessRevision") ?? 0,
    });
  }

  agentPolicy(): AgentPolicySettings {
    return AgentPolicySettingsSchema.parse({
      agentMode: this.get("agentMode") ?? "ask",
      agentPolicyRevision: this.get("agentPolicyRevision") ?? 0,
      agentPolicies: this.get("agentPolicies") ?? [],
    });
  }

  /** Trusted approval writer; called inside the same Repo transaction as consuming acceptance. */
  allowAgentSite(action: SafetyAction, scope: "site" | "global" = "site"): void {
    if (scope === "site" && (!action.origin || action.recipient))
      throw new AuxError("invalid_params", "Choose an exact site for this permission.");
    const current = this.agentPolicy();
    if ((action.policyRevision ?? 0) !== current.agentPolicyRevision)
      throw new AuxError("conflict", "Agent permissions changed. Refresh this approval.");
    const category = agentPolicyCategoryFor(action.category ?? "external_tool", action.action);
    if (category === "account_security" || category === "captcha")
      throw new AuxError("permission_denied", "This action requires a person.");
    const rule = { category, ...(scope === "site" && action.origin ? { site: new URL(action.origin).origin } : {}), access: "allow" as const };
    const next = AgentPolicySettingsSchema.parse({
      ...current,
      agentPolicyRevision: current.agentPolicyRevision + 1,
      agentPolicies: [
        ...current.agentPolicies.filter((value) => value.category !== category || value.site !== rule.site),
        rule,
      ],
    });
    this.repo.setSetting("agentPolicies", next.agentPolicies);
    this.repo.setSetting("agentPolicyRevision", next.agentPolicyRevision);
  }

  selectionCapture(): SelectionCaptureSettings {
    return readSelectionCaptureSettings(this.get("selectionCapture"));
  }

  set(patch: Settings): Promise<{ ok: true }> {
    const write = this.writes.then(() => this.save(patch));
    this.writes = write.catch(() => {});
    return write;
  }

  private async save(patch: Settings, check?: () => Promise<void>): Promise<{ ok: true }> {
    await check?.();
    const next: Settings = { ...patch };
    if (next.fileAccessMode !== undefined) {
      if (Object.keys(next).some((key) => !["fileAccessMode", "fileAccessRevision"].includes(key)))
        throw new AuxError("invalid_params", "Save file access separately from other settings.");
      const current = this.fileAccess();
      if (next.fileAccessRevision !== current.fileAccessRevision)
        throw new AuxError("conflict", "File access changed in another window. Reload the current settings.");
      const policy = FileAccessSettingsSchema.parse({
        fileAccessMode: next.fileAccessMode,
        fileAccessRevision: current.fileAccessRevision + 1,
      });
      next.fileAccessMode = policy.fileAccessMode;
      next.fileAccessRevision = policy.fileAccessRevision;
    } else if (next.fileAccessRevision !== undefined) {
      throw new AuxError("invalid_params", "Save a file access change with its current revision.");
    }
    if (next.agentMode !== undefined || next.agentPolicies !== undefined) {
      if (
        Object.keys(next).some((key) => !["agentMode", "agentPolicies", "agentPolicyRevision"].includes(key))
      )
        throw new AuxError("invalid_params", "Save agent permissions separately from other settings.");
      const current = this.agentPolicy();
      if (next.agentPolicyRevision !== current.agentPolicyRevision)
        throw new AuxError(
          "conflict",
          "Agent permissions changed in another window. Reload the current settings.",
        );
      const policy = AgentPolicySettingsSchema.parse({
        agentMode: next.agentMode ?? current.agentMode,
        agentPolicies: next.agentPolicies ?? current.agentPolicies,
        agentPolicyRevision: current.agentPolicyRevision + 1,
      });
      next.agentMode = policy.agentMode;
      next.agentPolicies = policy.agentPolicies;
      next.agentPolicyRevision = policy.agentPolicyRevision;
    } else if (next.agentPolicyRevision !== undefined) {
      throw new AuxError("invalid_params", "Save a policy change with its current revision.");
    }

    if (next.selectionCapture !== undefined) {
      const selection = SelectionCaptureSettingsSchema.parse(next.selectionCapture);
      if (selection.revision !== this.selectionCapture().revision)
        throw new AuxError(
          "conflict",
          "Selection & Capture changed in another window. Reload the saved settings before trying again.",
        );
      next.selectionCapture = { ...selection, revision: selection.revision + 1 };
    }
    if (next.selectionCapture !== undefined || next.shortcutOverrides !== undefined) {
      const conflict = captureShortcutConflict(
        next.selectionCapture ?? this.selectionCapture(),
        next.shortcutOverrides ?? (this.get("shortcutOverrides") as ShortcutOverrides | undefined),
        process.platform,
      );
      if (conflict) throw new AuxError("conflict", conflict);
    }
    if (next.modelCredential && next.gatewayApiKey !== undefined)
      throw new Error("Save one provider credential at a time.");
    const connectionChange = [
      "localModelsOnly",
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
    if (connectionChange && !check) this.providerAuthService?.invalidate();
    if (connectionChange && !check) this.chatgptAuthService?.invalidate();
    if (connectionChange && !check) this.vercelAuthService?.invalidate();
    const selectedProvider = ModelProviderSchema.parse(next.modelProvider ?? this.modelProvider());
    // Validate before touching OS credentials; a rejected setting must not partially rotate a key.
    if (next.imageModel !== undefined) next.imageModel = ImageModelSchema.nullable().parse(next.imageModel);
    if (next.modelConnection) {
      const change = ModelConnectionChangeSchema.parse(next.modelConnection);
      const disabled = new Set(ModelProviderSchema.array().parse(this.get("disabledModelProviders") ?? []));
      if (change.enabled) disabled.delete(change.provider);
      else disabled.add(change.provider);
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
        const previous = this.directKeys[provider];
        await check?.();
        await this.native.storeSecret(`modelKey-${provider}`, key);
        if (check) {
          try {
            await check();
          } catch (error) {
            // The serialized settings queue holds this write receipt until rollback.
            await this.native.storeSecret(`modelKey-${provider}`, previous ?? "");
            throw error;
          }
        }
        this.directKeys[provider] = key || undefined;
        delete this.directErrors[provider];
      }
      delete next.modelCredential;
      if (provider === "openai") this.repo.setSetting("chatgptActiveAccount", null);
      if (provider === "gateway") this.repo.setSetting("vercelActiveAccount", null);
    }
    if (next.gatewayApiKey !== undefined) this.repo.setSetting("vercelActiveAccount", null);
    if (next.agentModelRoutes !== undefined && selectedProvider !== "gateway") {
      const current = this.get("providerAgentModelRoutes") as
        Settings["providerAgentModelRoutes"] | undefined;
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
    if (next.agentModelRoutes !== undefined)
      next.agentModelRoutes = AgentModelRoutesSettingSchema.parse(next.agentModelRoutes);
    if (next.gatewayApiKey !== undefined) await this.writeGatewayKey(next.gatewayApiKey);
    if (connectionChange) {
      this.repo.deleteSetting("copilotInferenceSelection");
      this.connectionEpoch++;
      this.catalogService?.invalidate();
      this.mergedCatalog = MODEL_REGISTRY;
      this.repo.setSetting("modelCacheGeneration", randomUUID());
      this.repo.deleteSetting("modelProbe");
    }
    this.repo.transaction(() => {
      if (
        next.fileAccessRevision !== undefined &&
        this.fileAccess().fileAccessRevision !== next.fileAccessRevision - 1
      )
        throw new AuxError("conflict", "File access changed in another window. Reload the current settings.");
      if (
        next.agentPolicyRevision !== undefined &&
        this.agentPolicy().agentPolicyRevision !== next.agentPolicyRevision - 1
      )
        throw new AuxError(
          "conflict",
          "Agent permissions changed in another window. Reload the current settings.",
        );
      for (const [k, v] of Object.entries(next)) {
        if (v === undefined || k === "gatewayApiKey") continue;
        this.repo.setSetting(k, v);
      }
    });
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
    if (this.localModelsOnly()) return undefined;
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
    const copilot = this.copilotSelection();
    if (this.hasCopilotSelection()) return copilot?.modelId ?? "";
    if (this.modelProvider() !== "gateway")
      return (
        this.profiles()[this.modelProvider()]?.plannerModel ??
        (this.modelProvider() === "openrouter" ? "anthropic/claude-sonnet-5.5" : "")
      );
    return (
      (this.get("plannerModel") as string | undefined) || this.env.AUX_PLANNER_MODEL || DEFAULT_AGENT_MODEL
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
    const stored =
      provider === "gateway"
        ? this.get("agentModelRoutes")
        : (this.get("providerAgentModelRoutes") as Settings["providerAgentModelRoutes"] | undefined)?.[
            provider
          ];
    const parsed = AgentModelRoutesSettingSchema.safeParse(stored);
    return parsed.success ? parsed.data : {};
  }

  private routeBaseline(category: AgentModelCategory): AgentModelRoute {
    const baseline = agentModelRoute(category);
    if (this.hasCopilotSelection()) return { ...baseline, modelId: this.plannerModel() };
    if (this.modelProvider() !== "gateway") {
      const modelId =
        category === "visual"
          ? this.visionModel()
          : category === "deep"
            ? this.recoveryModel()
            : this.plannerModel();
      return { ...baseline, modelId: modelId || baseline.modelId };
    }
    const planner = (this.get("plannerModel") as string | undefined) || this.env.AUX_PLANNER_MODEL;
    const explicit =
      category === "visual"
        ? (this.get("visionModel") as string | undefined) || this.env.AUX_VISION_MODEL || planner
        : category === "deep"
          ? (this.get("recoveryModel") as string | undefined) || this.env.AUX_RECOVERY_MODEL || planner
          : planner;
    return explicit ? { ...baseline, modelId: explicit } : baseline;
  }
  /**
   * Ordered candidate chain per category (S5.9): stored single route or
   * array first, then built-in fallbacks deduped by model — every category
   * keeps at least one alternate so a 429/5xx has somewhere to go.
   */
  agentRouteChain(category: AgentModelCategory): AgentModelRoute[] {
    if (this.hasCopilotSelection()) return [this.routeBaseline(category)];
    const stored = normalizeRouteChain(this.routeOverrides()?.[category]);
    const chain = stored.length ? stored : [this.routeBaseline(category)];
    const seen = new Set(chain.map((r) => r.modelId));
    if (this.modelProvider() === "gateway") {
      for (const fb of [this.routeBaseline(category), DEFAULT_AGENT_MODEL_FALLBACKS[category]]) {
        if (!seen.has(fb.modelId)) {
          chain.push(fb);
          seen.add(fb.modelId);
        }
      }
    }
    return chain;
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
  private catalogService?: ModelCatalogService;
  private localModels: LocalModelServer[] = [];
  private localFetchedAt = 0;
  private localPending?: Promise<LocalModelServer[]>;
  private localController?: AbortController;
  private discoveryClosed = false;

  private catalog(): ModelCatalogService {
    return (this.catalogService ??= new ModelCatalogService(this.repo, () => this.modelCacheGeneration()));
  }

  private localServers(): Promise<LocalModelServer[]> {
    if (this.discoveryClosed) return Promise.reject(new AuxError("cancelled", "Model discovery is closed."));
    if (Date.now() - this.localFetchedAt < 30_000) return Promise.resolve(this.localModels);
    if (this.localPending) return this.localPending;
    const controller = new AbortController();
    this.localController = controller;
    return (this.localPending = discoverLocalModels(fetch, controller.signal)
      .then((models) => {
        if (this.discoveryClosed || controller.signal.aborted)
          throw new AuxError("cancelled", "Model discovery is closed.");
        this.localModels = models;
        this.localFetchedAt = Date.now();
        return models;
      })
      .finally(() => {
        this.localPending = undefined;
        if (this.localController === controller) this.localController = undefined;
      }));
  }
  private providerAuthService?: ProviderAuthService;
  private vercelAuthService?: VercelAuthService;
  private vercelAccountService?: VercelAccounts;
  private vercelAccountPending?: Promise<VercelAccounts>;
  private vercelCredentialError = false;
  private vercelRegistration(): VercelRegistration {
    const parsed = VercelRegistrationSchema.safeParse({
      clientId: this.env.AUX_VERCEL_CLIENT_ID,
      redirectUri: this.env.AUX_VERCEL_REDIRECT_URI,
      teamId: this.env.AUX_VERCEL_TEAM_ID,
    });
    if (!parsed.success) throw new AuxError("needs_input",
      "Sign in with Vercel requires Aux's registered public client, exact loopback callback, and team. The Vercel app also needs the AI Gateway Use permission, currently in private beta.");
    return parsed.data;
  }
  private activeVercelAccount(): string | undefined {
    const id = this.repo.getSetting("vercelActiveAccount");
    if (id === undefined || id === null) return undefined;
    return z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .parse(id);
  }
  private vercelConnected(): boolean {
    const id = this.activeVercelAccount();
    if (!id || !this.vercelAccountService || this.discoveryClosed) return false;
    return this.vercelAccountService
      .summaries()
      .some((account) => account.accountId === id && account.selected && account.connected);
  }
  private vercelAccounts(): Promise<VercelAccounts> {
    if (this.vercelAccountService) return Promise.resolve(this.vercelAccountService);
    if (this.vercelAccountPending) return this.vercelAccountPending;
    if (this.discoveryClosed || !this.native?.available())
      return Promise.reject(
        new AuxError("permission_denied", "Vercel requires protected desktop credential storage."),
      );
    const saved = this.repo.getSetting("vercelHostId"),
      hostId = saved === undefined ? randomUUID() : z.string().uuid().parse(saved);
    if (saved === undefined) this.repo.setSetting("vercelHostId", hostId);
    const accounts = new VercelAccounts(this.native, hostId);
    this.vercelAccountPending = accounts.initialize().then(async () => {
      if (this.discoveryClosed) {
        await accounts.close();
        throw new AuxError("cancelled", "Settings are closed.");
      }
      this.vercelAccountService = accounts;
      this.vercelCredentialError = false;
      return accounts;
    });
    return this.vercelAccountPending;
  }
  private async vercelAuth() {
    if (this.vercelAuthService) return this.vercelAuthService;
    const accounts = await this.vercelAccounts();
    if (this.discoveryClosed) throw new AuxError("cancelled", "Vercel sign-in is closed.");
    return (this.vercelAuthService ??= new VercelAuthService({
      accounts,
      registration: () => this.vercelRegistration(),
      generation: () => this.modelCacheGeneration(),
      checkOwner: async (token, requester) => {
        const original = this.authOwners.get(token);
        if (this.discoveryClosed || !original || !this.native?.turnSourceContext)
          throw new AuxError("cancelled", "The original sign-in window is unavailable.");
        const current = await this.native.turnSourceContext(token);
        if (
          this.discoveryClosed ||
          current.windowId !== original.windowId ||
          current.activePageId !== original.activePageId
        )
          throw new AuxError("cancelled", "The original sign-in document changed.");
        if (requester) {
          const asking = await this.native.turnSourceContext(requester);
          if (this.discoveryClosed || asking.windowId !== original.windowId)
            throw new AuxError("permission_denied", "Return to the original sign-in window.");
        }
      },
      activate: async (account, check) => {
        await check();
        const task = this.writes.then(async () => {
          await check();
          if (this.discoveryClosed || this.localModelsOnly())
            throw new AuxError("cancelled", "Vercel account acceptance retired.");
          if (
            this.repo.db
              .prepare(
                "SELECT 1 FROM runs WHERE status IN ('queued','planning','running','paused','needs_input') LIMIT 1",
              )
              .get()
          )
            throw new Error("Stop active runs before changing model connections.");
          const generation = randomUUID();
          const next = {
            modelProvider: "gateway" as const,
            disabledModelProviders: ModelProviderSchema.array()
              .parse(this.get("disabledModelProviders") ?? [])
              .filter((provider) => provider !== "gateway"),
            copilotInferenceSelection: null,
            vercelActiveAccount: account.accountId,
            modelCacheGeneration: generation,
          };
          const keys = [...Object.keys(next), "modelProbe"];
          const previous = new Map(keys.map((key) => [key, this.repo.getSetting<unknown>(key)]));
          const previousFileSettings = this.fileSettings;
          const updateFile = () => {
            try {
              if (this.fileSettings.gatewayApiKey === undefined)
                writeFileSync(this.settingsPath, JSON.stringify(this.fileSettings, null, 2));
            } catch {
              // The transactional Profile settings remain authoritative.
            }
          };
          // No await separates the final original-owner check from this acceptance commit.
          this.repo.transaction(() => {
            for (const [key, value] of Object.entries(next)) this.repo.setSetting(key, value);
            this.repo.deleteSetting("modelProbe");
          });
          this.connectionEpoch++;
          this.catalogService?.invalidate();
          this.mergedCatalog = MODEL_REGISTRY;
          this.gatewayClient = null;
          this.fileSettings = {
            ...this.fileSettings,
            modelProvider: next.modelProvider,
            disabledModelProviders: next.disabledModelProviders,
          };
          updateFile();
          return {
            generation,
            rollback: async () => {
              const reduction = this.writes.then(() => {
                if (
                  this.modelCacheGeneration() !== generation ||
                  this.repo.getSetting("vercelActiveAccount") !== account.accountId
                )
                  throw new AuxError(
                    "conflict",
                    "A later model selection prevents original Vercel rollback.",
                  );
                this.repo.transaction(() => {
                  for (const [key, value] of previous) {
                    if (value === undefined) this.repo.deleteSetting(key);
                    else this.repo.setSetting(key, value);
                  }
                });
                this.connectionEpoch++;
                this.catalogService?.invalidate();
                this.mergedCatalog = MODEL_REGISTRY;
                this.gatewayClient = null;
                // Preserve unrelated preferences accepted while the owner check was pending.
                for (const key of ["modelProvider", "disabledModelProviders"] as const) {
                  if (previousFileSettings[key] === undefined) delete this.fileSettings[key];
                  else
                    Object.assign(this.fileSettings, {
                      [key]: previousFileSettings[key],
                    });
                }
                updateFile();
              });
              this.writes = reduction.catch(() => {});
              await reduction;
            },
          };
        });
        this.writes = task.catch(() => {});
        return task;
      },
    }));
  }
  private async closeVercelAccounts(): Promise<void> {
    const failures: unknown[] = [];
    try {
      await this.vercelAuthService?.close();
    } catch (error) {
      failures.push(error);
    }
    try {
      await this.vercelAccountPending;
    } catch (error) {
      if (!(error instanceof AuxError && error.code === "cancelled")) failures.push(error);
    }
    try {
      await this.vercelAccountService?.close();
    } catch (error) {
      failures.push(error);
    }
    if (failures.length) throw new AggregateError(failures, "Vercel account cleanup remains unresolved.");
  }
  private chatgptAuthService?: ChatgptAuthService;
  private chatgptAccountService?: ChatgptAccounts;
  private chatgptAccountPending?: Promise<ChatgptAccounts>;
  private chatgptCredentialError = false;
  private chatgptCatalog: ModelCapability[] = [];
  private chatgptCatalogAt = 0;
  private chatgptCatalogPending?: Promise<void>;
  private chatgptCatalogController = new AbortController();
  private refreshChatgptModels(accountId: string, generation: string, signal?: AbortSignal): Promise<void> {
    if (this.chatgptCatalog.length && Date.now() - this.chatgptCatalogAt < 24 * 60 * 60_000)
      return Promise.resolve();
    if (this.chatgptCatalogPending) return this.chatgptCatalogPending;
    const pending = (async () => {
      const accounts = await this.chatgptAccounts();
      const models = await chatgptModels(
        accounts,
        accountId,
        fetch,
        AbortSignal.any([
          this.chatgptCatalogController.signal,
          AbortSignal.timeout(15_000),
          ...(signal ? [signal] : []),
        ]),
      );
      this.assertModelGeneration(generation);
      this.chatgptCatalog = models;
      this.chatgptCatalogAt = Date.now();
    })().finally(() => {
      if (this.chatgptCatalogPending === pending) this.chatgptCatalogPending = undefined;
    });
    this.chatgptCatalogPending = pending;
    return pending;
  }
  private activeChatgptAccount(): string | undefined {
    const id = this.repo.getSetting("chatgptActiveAccount");
    if (id === undefined || id === null) return undefined;
    return z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .parse(id);
  }
  private chatgptConnected(): boolean {
    const id = this.activeChatgptAccount();
    if (!id || !this.chatgptAccountService || this.discoveryClosed) return false;
    return this.chatgptAccountService
      .summaries()
      .some((account) => account.accountId === id && account.selected && account.connected);
  }
  private chatgptAccounts(): Promise<ChatgptAccounts> {
    if (this.chatgptAccountService) return Promise.resolve(this.chatgptAccountService);
    if (this.chatgptAccountPending) return this.chatgptAccountPending;
    if (this.discoveryClosed || !this.native?.available())
      return Promise.reject(
        new AuxError("permission_denied", "ChatGPT requires protected desktop credential storage."),
      );
    const saved = this.repo.getSetting("chatgptHostId"),
      hostId = saved === undefined ? newChatgptHostId() : z.string().uuid().parse(saved);
    if (saved === undefined) this.repo.setSetting("chatgptHostId", hostId);
    const accounts = new ChatgptAccounts(this.native, hostId);
    this.chatgptAccountPending = accounts.initialize().then(async () => {
      if (this.discoveryClosed) {
        await accounts.close();
        throw new AuxError("cancelled", "Settings are closed.");
      }
      this.chatgptAccountService = accounts;
      this.chatgptCredentialError = false;
      return accounts;
    });
    return this.chatgptAccountPending;
  }
  async savedProviderAccounts(token: string) {
    await this.checkAuthRequester(token);
    const chatgpt = this.repo.getSetting("chatgptHostId") ? (await this.chatgptAccounts()).summaries() : [];
    const vercel = this.repo.getSetting("vercelHostId") ? (await this.vercelAccounts()).summaries() : [];
    return [...chatgpt.map(account => ({...account, selected: !this.hasCopilotSelection() && this.modelProvider() === "openai" && this.activeChatgptAccount() === account.accountId, provider: "chatgpt" as const})),
      ...vercel.map(account => ({...account, selected: !this.hasCopilotSelection() && this.modelProvider() === "gateway" && this.activeVercelAccount() === account.accountId, provider: "vercel" as const}))];
  }
  async disconnectProviderAccount(id: string, token: string) {
    await this.checkAuthRequester(token);
    if (this.repo.getSetting("vercelHostId")) {
      const vault = await this.vercelAccounts();
      if (vault.summaries().some(account => account.accountId === id)) {
        const reduction = this.writes.then(async () => {
          await this.checkAuthRequester(token);
          if (this.activeVercelAccount() === id) {
            this.repo.transaction(() => {
              this.repo.setSetting("vercelActiveAccount", null);
              const disabled = ModelProviderSchema.array().parse(this.get("disabledModelProviders") ?? []);
              this.repo.setSetting("disabledModelProviders", [...new Set([...disabled, "gateway"])]);
              this.repo.setSetting("modelCacheGeneration", randomUUID());
            });
            this.gatewayClient = null;
            this.connectionEpoch++;
          }
        });
        this.writes = reduction.catch(() => {});
        await reduction;
        const revocationConfirmed = await vault.disconnect(id, () => this.checkAuthRequester(token));
        return {disconnected: true as const, revocationConfirmed};
      }
    }
    const accounts = await this.chatgptAccounts();
    if (this.activeChatgptAccount() === id) {
      const disable = this.writes.then(async () => {
        await this.checkAuthRequester(token);
        if (this.activeChatgptAccount() !== id) return;
        await this.save({ modelConnection: { provider: "openai", enabled: false } }, () =>
          this.checkAuthRequester(token),
        );
      });
      this.writes = disable.catch(() => {});
      await disable;
    }
    const revocationConfirmed = await accounts.disconnect(id, () => this.checkAuthRequester(token));
    const reduction = this.writes.then(() => {
      if (this.activeChatgptAccount() !== id) return;
      this.repo.transaction(() => {
        this.repo.setSetting("chatgptActiveAccount", null);
        this.repo.setSetting("modelCacheGeneration", randomUUID());
      });
      this.gatewayClient = null;
      this.chatgptCatalog = [];
      this.connectionEpoch++;
    });
    this.writes = reduction.catch(() => {});
    await reduction;
    return { disconnected: true as const, revocationConfirmed };
  }
  private async checkAuthRequester(token: string) {
    if (this.discoveryClosed || !this.native?.turnSourceContext)
      throw new AuxError("cancelled", "The original sign-in window is unavailable.");
    const context = await this.native.turnSourceContext(token);
    if (this.discoveryClosed || !context.windowId)
      throw new AuxError("permission_denied", "Use the original regular Aux window for account settings.");
    const saved = this.authOwners.get(token);
    if (saved && (context.windowId !== saved.windowId || context.activePageId !== saved.activePageId))
      throw new AuxError("cancelled", "The original ChatGPT account window changed.");
    if (!saved) {
      while (this.authOwners.size >= 32) this.authOwners.delete(this.authOwners.keys().next().value!);
      this.authOwners.set(token, { windowId: context.windowId, activePageId: context.activePageId });
    }
  }
  private async chatgptAuth() {
    if (this.chatgptAuthService) return this.chatgptAuthService;
    const accounts = await this.chatgptAccounts();
    if (this.discoveryClosed) throw new AuxError("cancelled", "ChatGPT sign-in is closed.");
    return (this.chatgptAuthService ??= new ChatgptAuthService({
      accounts,
      hostId: z.string().uuid().parse(this.repo.getSetting("chatgptHostId")),
      generation: () => this.modelCacheGeneration(),
      checkOwner: async (token, requester) => {
        const original = this.authOwners.get(token);
        if (this.discoveryClosed || !original || !this.native?.turnSourceContext)
          throw new AuxError("cancelled", "The original sign-in window is unavailable.");
        const current = await this.native.turnSourceContext(token);
        if (
          this.discoveryClosed ||
          current.windowId !== original.windowId ||
          current.activePageId !== original.activePageId
        )
          throw new AuxError("cancelled", "The original sign-in document changed.");
        if (requester) {
          const asking = await this.native.turnSourceContext(requester);
          if (this.discoveryClosed || asking.windowId !== original.windowId)
            throw new AuxError("permission_denied", "Return to the original sign-in window.");
        }
      },
      activate: async (account: ChatgptAccount, check, signal) => {
        const models = parseChatgptModels(
          await authJson(
            await fetch(`${CHATGPT_RESOURCE}/models`, {
              redirect: "error",
              signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
              headers: { Authorization: `Bearer ${account.accessToken}` },
            }),
          ),
        );
        await check();
        if (!models.length)
          throw new AuxError("capability_unsupported", "This ChatGPT account has no available plan models.");
        const task = this.writes.then(async () => {
          await check();
          if (this.discoveryClosed || this.localModelsOnly())
            throw new AuxError("cancelled", "ChatGPT account acceptance retired.");
          if (
            this.repo.db
              .prepare(
                "SELECT 1 FROM runs WHERE status IN ('queued','planning','running','paused','needs_input') LIMIT 1",
              )
              .get()
          )
            throw new Error("Stop active runs before changing model connections.");
          const existing = this.profiles().openai?.plannerModel;
          const chosen = models.some((model) => model.id === existing) ? existing : models[0]!.id;
          const generation = randomUUID();
          const next = {
            modelProvider: "openai" as const,
            disabledModelProviders: ModelProviderSchema.array()
              .parse(this.get("disabledModelProviders") ?? [])
              .filter((provider) => provider !== "openai"),
            providerModels: {
              ...this.profiles(),
              openai: { ...this.profiles().openai, plannerModel: chosen },
            },
            chatgptActiveAccount: account.accountId,
            modelCacheGeneration: generation,
          };
          const keys = [...Object.keys(next), "modelProbe"];
          const previous = new Map(keys.map((key) => [key, this.repo.getSetting<unknown>(key)]));
          const previousCatalog = this.chatgptCatalog;
          const previousCatalogAt = this.chatgptCatalogAt;
          const previousFileSettings = this.fileSettings;
          const updateFile = () => {
            try {
              if (this.fileSettings.gatewayApiKey === undefined)
                writeFileSync(this.settingsPath, JSON.stringify(this.fileSettings, null, 2));
            } catch {
              // The transactional Profile settings remain authoritative.
            }
          };
          // No await separates the final original-owner check from this acceptance commit.
          this.repo.transaction(() => {
            for (const [key, value] of Object.entries(next)) this.repo.setSetting(key, value);
            this.repo.deleteSetting("modelProbe");
          });
          this.connectionEpoch++;
          this.catalogService?.invalidate();
          this.mergedCatalog = MODEL_REGISTRY;
          this.gatewayClient = null;
          this.chatgptCatalog = models;
          this.chatgptCatalogAt = Date.now();
          this.fileSettings = {
            ...this.fileSettings,
            modelProvider: next.modelProvider,
            disabledModelProviders: next.disabledModelProviders,
            providerModels: next.providerModels,
          };
          updateFile();
          return {
            generation,
            rollback: async () => {
              const reduction = this.writes.then(() => {
                if (
                  this.modelCacheGeneration() !== generation ||
                  this.repo.getSetting("chatgptActiveAccount") !== account.accountId
                )
                  throw new AuxError(
                    "conflict",
                    "A later model selection prevents original ChatGPT rollback.",
                  );
                this.repo.transaction(() => {
                  for (const [key, value] of previous) {
                    if (value === undefined) this.repo.deleteSetting(key);
                    else this.repo.setSetting(key, value);
                  }
                });
                this.connectionEpoch++;
                this.catalogService?.invalidate();
                this.mergedCatalog = MODEL_REGISTRY;
                this.gatewayClient = null;
                this.chatgptCatalog = previousCatalog;
                this.chatgptCatalogAt = previousCatalogAt;
                // Preserve unrelated preferences accepted while the owner check was pending.
                for (const key of ["modelProvider", "disabledModelProviders", "providerModels"] as const) {
                  if (previousFileSettings[key] === undefined) delete this.fileSettings[key];
                  else
                    Object.assign(this.fileSettings, {
                      [key]: previousFileSettings[key],
                    });
                }
                updateFile();
              });
              this.writes = reduction.catch(() => {});
              await reduction;
            },
          };
        });
        this.writes = task.catch(() => {});
        return task;
      },
    }));
  }
  private async closeChatgptAccounts(): Promise<void> {
    const failures: unknown[] = [];
    try {
      await this.chatgptAuthService?.close();
    } catch (error) {
      failures.push(error);
    }
    try {
      await this.chatgptAccountPending;
    } catch (error) {
      if (!(error instanceof AuxError && error.code === "cancelled")) failures.push(error);
    }
    try {
      await this.chatgptAccountService?.close();
    } catch (error) {
      failures.push(error);
    }
    if (failures.length) throw new AggregateError(failures, "ChatGPT account cleanup remains unresolved.");
  }
  private copilotFactory?: () => Promise<CopilotServices>;
  /** Main owns the lazy facade lifetime; this binding never constructs an unused provider. */
  attachCopilotServices(factory: () => Promise<CopilotServices>): void {
    if (this.copilotFactory) throw new AuxError("conflict", "Copilot services are already bound.");
    this.copilotFactory = factory;
  }
  copilotHostId(): string {
    const saved = this.repo.getSetting("copilotHostId");
    if (saved !== undefined) return z.string().uuid().parse(saved);
    const id = randomUUID();
    this.repo.setSetting("copilotHostId", id);
    return id;
  }
  /** Reviewed app configuration only; no renderer/model client ID or secret. */
  async copilotRegistration(): Promise<CopilotRegistration | undefined> {
    const clientId = this.env.AUX_COPILOT_CLIENT_ID;
    if (!clientId) return undefined;
    if (!CopilotRegistrationSchema.shape.clientId.safeParse(clientId).success)
      throw new AuxError("needs_input", "The Aux GitHub application registration requires configuration.");
    const raw = this.repo.getSetting("copilotRegistration");
    const saved = raw === undefined ? undefined : CopilotRegistrationSchema.parse(raw);
    if (saved?.clientId === clientId) return saved;
    const next = { clientId, revision: randomUUID() };
    this.repo.setSetting("copilotRegistration", next);
    return next;
  }
  copilotGeneration(): string {
    const saved = this.repo.getSetting("copilotRevision");
    if (saved !== undefined) return z.string().uuid().parse(saved);
    const revision = randomUUID();
    this.repo.setSetting("copilotRevision", revision);
    return revision;
  }
  async checkCopilotOwner(original: string, requester?: string): Promise<void> {
    if (this.discoveryClosed || !this.native?.turnSourceContext)
      throw new AuxError("cancelled", "The original Copilot window retired.");
    const saved = this.authOwners.get(original);
    if (!saved) throw new AuxError("cancelled", "The original Copilot window is unavailable.");
    const current = await this.native.turnSourceContext(original);
    if (
      this.discoveryClosed ||
      current.windowId !== saved.windowId ||
      current.activePageId !== saved.activePageId
    )
      throw new AuxError("cancelled", "The original Copilot window changed.");
    if (requester) {
      const next = await this.native.turnSourceContext(requester);
      if (this.discoveryClosed || next.windowId !== saved.windowId)
        throw new AuxError("permission_denied", "Return to the original Copilot window.");
    }
  }
  async activateCopilotAccount(account: CopilotAccount, check: () => Promise<void>) {
    const work = this.writes.then(async () => {
      await check();
      if (this.discoveryClosed || this.localModelsOnly())
        throw new AuxError("cancelled", "Copilot account acceptance retired.");
      const previousAccount = this.repo.getSetting<string>("copilotActiveAccount");
      const previousRevision = this.copilotGeneration();
      const generation = randomUUID();
      this.repo.transaction(() => {
        this.repo.setSetting("copilotActiveAccount", account.accountId);
        this.repo.setSetting("copilotRevision", generation);
      });
      // Auth adopts this generation before its existing post-acceptance check.
      return {
        generation,
        rollback: async () => {
          const reduction = this.writes.then(() => {
            if (
              this.copilotGeneration() !== generation ||
              this.repo.getSetting("copilotActiveAccount") !== account.accountId
            )
              throw new AuxError("conflict", "A later Copilot selection prevents original rollback.");
            this.repo.transaction(() => {
              if (previousAccount === undefined) this.repo.deleteSetting("copilotActiveAccount");
              else this.repo.setSetting("copilotActiveAccount", previousAccount);
              this.repo.setSetting("copilotRevision", previousRevision);
            });
          });
          this.writes = reduction.catch(() => {});
          await reduction;
        },
      };
    });
    this.writes = work.catch(() => {});
    return work;
  }
  async deactivateCopilotAccount(accountId: string, check: () => Promise<void>): Promise<void> {
    const work = this.writes.then(async () => {
      await check();
      if (this.discoveryClosed) throw new AuxError("cancelled", "Copilot settings are closed.");
      if (this.repo.getSetting("copilotActiveAccount") !== accountId) return;
      this.repo.transaction(() => {
        this.repo.deleteSetting("copilotActiveAccount");
        this.repo.setSetting("copilotRevision", randomUUID());
      });
    });
    this.writes = work.catch(() => {});
    await work;
  }
  private async copilotForOwner(owner: string, positive = false): Promise<CopilotServices> {
    if (this.discoveryClosed || !this.native?.turnSourceContext || !this.copilotFactory)
      throw new AuxError("capability_unsupported", "Copilot requires the original desktop window.");
    if (positive && this.localModelsOnly())
      throw new AuxError("permission_denied", "Enable cloud models before connecting Copilot.");
    const context = await this.native.turnSourceContext(owner);
    if (this.discoveryClosed) throw new AuxError("cancelled", "Copilot settings are closed.");
    const saved = this.authOwners.get(owner);
    if (saved) await this.checkCopilotOwner(owner);
    else {
      while (this.authOwners.size >= 32) this.authOwners.delete(this.authOwners.keys().next().value!);
      this.authOwners.set(owner, {
        windowId: context.windowId,
        activePageId: context.activePageId,
      });
    }
    const services = await this.copilotFactory();
    await this.checkCopilotOwner(owner);
    return services;
  }
  async copilotSetup(owner: string) {
    return {
      ...(await (await this.copilotForOwner(owner)).setup(owner)),
      catalogOnly: true as const,
    };
  }
  async copilotInstall(owner: string) {
    return (await this.copilotForOwner(owner)).install(owner);
  }
  async copilotStart(owner: string) {
    return (await this.copilotForOwner(owner, true)).start(owner);
  }
  async copilotStatus(id: string, owner: string) {
    return (await this.copilotForOwner(owner)).status(id, owner);
  }
  async copilotCancel(id: string, owner: string) {
    return (await this.copilotForOwner(owner)).cancel(id, owner);
  }
  async copilotAccounts(owner: string) {
    return (await this.copilotForOwner(owner)).accounts(owner);
  }
  async copilotDisconnect(id: string, owner: string) {
    return (await this.copilotForOwner(owner)).disconnect(id, owner);
  }
  async copilotCatalog(id: string, owner: string) {
    const models = await (await this.copilotForOwner(owner, true)).catalog(id, owner);
    return {
      catalogOnly: true as const,
      models: models.map((model) => ({
        id: model.id,
        name: model.name,
        ...(model.policy ? { policy: model.policy.state } : {}),
      })),
    };
  }
  private hasCopilotSelection(): boolean {
    return this.repo.getSetting("copilotInferenceSelection") !== undefined;
  }
  private copilotSelection() {
    const parsed = z
      .object({
        accountId: z.string().regex(/^[a-f0-9]{64}$/),
        revision: z.string().uuid(),
        modelId: z.string().min(1).max(300),
        models: z.array(ModelCapabilitySchema).max(500),
      })
      .strict()
      .safeParse(this.repo.getSetting("copilotInferenceSelection"));
    if (
      !parsed.success ||
      parsed.data.accountId !== this.repo.getSetting("copilotActiveAccount") ||
      parsed.data.revision !== this.copilotGeneration()
    )
      return undefined;
    return parsed.data;
  }
  async selectCopilotModel(modelId: string | null, owner: string): Promise<void> {
    const work = this.writes.then(async () => {
      const service = await this.copilotForOwner(owner, true);
      const accountId = this.repo.getSetting<string>("copilotActiveAccount");
      const revision = this.copilotGeneration();
      const modelGeneration = this.modelCacheGeneration();
      const check = async () => {
        await this.checkCopilotOwner(owner);
        if (
          this.localModelsOnly() ||
          this.copilotGeneration() !== revision ||
          this.modelCacheGeneration() !== modelGeneration ||
          this.repo.getSetting("copilotActiveAccount") !== accountId
        )
          throw new AuxError("cancelled", "The original Copilot selection changed.");
      };
      await check();
      let models: ModelCapability[] = [];
      if (modelId !== null) {
        if (!accountId)
          throw new AuxError("needs_input", "Sign in to your registered Copilot application first.");
        const catalog = await service.catalog(accountId, owner);
        await check();
        if (!catalog.some((model) => model.id === modelId && model.policy?.state !== "disabled"))
          throw new AuxError("permission_denied", "Choose a model advertised for this account.");
        models = catalog
          .filter((model) => model.policy?.state !== "disabled")
          .map((model): ModelCapability => ({
            id: model.id,
            name: model.name,
            provider: "copilot",
            source: "catalog",
            billingKind: "subscription",
            // A published model limit is not proof of an enforceable request envelope.
            outputLimitSupported: false,
            contextTokens: model.capabilities.limits.max_context_window_tokens,
            maxOutputTokens: model.capabilities.limits.max_output_tokens,
            modalities: model.capabilities.supports.vision ? ["text", "image"] : ["text"],
            reasoning: model.capabilities.supports.reasoningEffort ? "supported" : "none",
          }));
        models = z.array(ModelCapabilitySchema).parse(models);
      }
      await check();
      this.repo.transaction(() => {
        if (modelId === null) this.repo.deleteSetting("copilotInferenceSelection");
        else
          this.repo.setSetting("copilotInferenceSelection", {
            accountId,
            revision,
            modelId,
            models,
          });
        this.repo.setSetting("modelCacheGeneration", randomUUID());
      });
      this.gatewayClient = null;
    });
    this.writes = work.catch(() => {});
    await work;
  }
  private authOwners = new Map<string, { windowId: string; activePageId: string | null }>();
  private auth(): ProviderAuthService {
    return (this.providerAuthService ??= new ProviderAuthService({
      generation: () => this.modelCacheGeneration(),
      checkOwner: async (token, requester) => {
        const original = this.authOwners.get(token);
        if (this.discoveryClosed || !original || !this.native?.turnSourceContext)
          throw new AuxError("cancelled", "The original sign-in window is unavailable.");
        const current = await this.native.turnSourceContext(token);
        if (
          this.discoveryClosed ||
          current.windowId !== original.windowId ||
          current.activePageId !== original.activePageId
        )
          throw new AuxError("cancelled", "The original sign-in window changed.");
        if (requester) {
          const requesting = await this.native.turnSourceContext(requester);
          if (this.discoveryClosed || requesting.windowId !== original.windowId)
            throw new AuxError("permission_denied", "Return to the original sign-in window.");
        }
      },
      commit: (key, check) => {
        const write = this.writes
          .then(() =>
            this.save(
              {
                modelProvider: "openrouter",
                modelCredential: { provider: "openrouter", key },
                modelConnection: { provider: "openrouter", enabled: true },
              },
              check,
            ),
          )
          .then(() => {});
        this.writes = write.catch(() => {});
        return write;
      },
    }));
  }
  async startProviderAuth(
    token: string,
    provider: "openrouter" | "chatgpt" | "vercel" = "openrouter",
    accountId?: string,
  ) {
    if (this.discoveryClosed || this.localModelsOnly() || !this.native?.turnSourceContext)
      throw new AuxError(
        "permission_denied",
        "Provider sign-in requires the original desktop window and cloud models enabled.",
      );
    const original = await this.native.turnSourceContext(token);
    if (this.discoveryClosed) throw new AuxError("cancelled", "Provider sign-in is closed.");
    const saved = this.authOwners.get(token);
    if (saved && (saved.windowId !== original.windowId || saved.activePageId !== original.activePageId))
      throw new AuxError("cancelled", "The original sign-in source changed.");
    if (!saved) {
      while (this.authOwners.size >= 32) this.authOwners.delete(this.authOwners.keys().next().value!);
      this.authOwners.set(token, { windowId: original.windowId, activePageId: original.activePageId });
    }
    if (provider === "vercel") {
      this.vercelRegistration();
      this.providerAuthService?.invalidate();
      this.chatgptAuthService?.invalidate();
      return (await this.vercelAuth()).start(token, accountId);
    }
    this.vercelAuthService?.invalidate();
    if (provider === "chatgpt") {
      this.providerAuthService?.invalidate();
      return (await this.chatgptAuth()).start(token, accountId);
    }
    this.chatgptAuthService?.invalidate();
    return this.auth().start(token);
  }
  providerAuthStatus(id: string, token: string) {
    if (this.vercelAuthService?.has(id)) return this.vercelAuthService.status(id, token);
    return this.chatgptAuthService?.has(id)
      ? this.chatgptAuthService.status(id, token)
      : this.auth().status(id, token);
  }
  cancelProviderAuth(id: string, token: string) {
    if (this.vercelAuthService?.has(id)) return this.vercelAuthService.cancel(id, token);
    return this.chatgptAuthService?.has(id)
      ? this.chatgptAuthService.cancel(id, token)
      : this.auth().cancel(id, token);
  }
  async close(): Promise<void> {
    this.discoveryClosed = true;
    this.chatgptCatalogController.abort();
    const failures: unknown[] = [];
    try {
      await this.foundationModels?.close();
    } catch (error) {
      failures.push(error);
    }
    try {
      await this.providerAuthService?.close();
    } catch (error) {
      failures.push(error);
    }
    try {
      await this.closeChatgptAccounts();
    } catch (error) {
      failures.push(error);
    }
    try { await this.closeVercelAccounts(); } catch (error) { failures.push(error); }
    await this.chatgptCatalogPending?.catch(() => {});
    try {
      await this.writes;
    } catch (error) {
      failures.push(error);
    }
    this.localController?.abort();
    await Promise.allSettled([this.catalogService?.close(), this.localPending]);
    if (failures.length)
      throw new AggregateError(failures, "Original model account cleanup remains unresolved.");
  }
  registryModels(): readonly ModelCapability[] {
    const copilot = this.copilotSelection();
    if (this.hasCopilotSelection()) return copilot?.models ?? [];
    if (this.modelProvider() === "openai" && this.activeChatgptAccount())
      return this.chatgptCatalog.length
        ? this.chatgptCatalog
        : [
            {
              id: this.plannerModel(),
              source: "configured",
              billingKind: "subscription",
              outputLimitSupported: false,
            },
          ];
    if (this.modelProvider() === "gateway") {
      const cached = this.catalog().cached({
        provider: "gateway",
        endpoint: "https://ai-gateway.vercel.sh/v1",
        generation: this.modelCacheGeneration(),
      });
      if (cached) this.mergedCatalog = mergeModelCapabilities(MODEL_REGISTRY, cached);
    }
    return this.mergedCatalog;
  }
  budgetLimits(): {
    runUsd?: number;
    dayUsd?: number;
    monthUsd?: number;
    routineUsd?: number;
  } {
    const b = this.get("budgets") as Settings["budgets"] | undefined;
    const pos = (v: unknown) => {
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? n : undefined;
    };
    return {
      runUsd: pos(b?.runUsd),
      dayUsd: pos(b?.dayUsd),
      monthUsd: pos(b?.monthUsd),
      routineUsd: pos(b?.routineUsd),
    };
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

  localModelsOnly(): boolean {
    return this.get("localModelsOnly") === true;
  }

  model(): ModelClient | null {
    const copilot = this.copilotSelection();
    if (this.hasCopilotSelection() && !copilot) return null;
    if (copilot) {
      if (this.localModelsOnly() || this.discoveryClosed || !this.copilotFactory) return null;
      const generation = this.modelCacheGeneration();
      const check = () => {
        this.assertModelGeneration(generation);
        const next = this.copilotSelection();
        if (
          !next ||
          next.accountId !== copilot.accountId ||
          next.revision !== copilot.revision ||
          next.modelId !== copilot.modelId
        )
          throw new AuxError("cancelled", "The original Copilot account or model changed.");
      };
      return copilotModelClient(
        {
          inference: async (accountId, source, modelId, signal, use) => {
            check();
            await source.checkOriginal();
            const service = await this.copilotForOwner(source.nativeTurnContext, true);
            check();
            await source.checkOriginal();
            return service.inference(
              accountId,
              {
                ...source,
                checkOriginal: async () => {
                  check();
                  await source.checkOriginal();
                  await this.checkCopilotOwner(source.nativeTurnContext);
                  check();
                },
              },
              modelId,
              signal,
              use,
            );
          },
        },
        copilot.accountId,
        () => copilot.models,
        async (source, destination) => {
          check();
          await source.checkOriginal();
          await this.checkCopilotOwner(source.nativeTurnContext);
          await source.authorizeDestination(destination);
          if (new URL(destination).protocol !== "https:")
            throw new AuxError(
              "permission_denied",
              "Copilot inference requires its original HTTPS endpoint.",
            );
          check();
        },
      );
    }

    if (
      this.localModelsOnly() &&
      !(
        this.modelProvider() === "openai-compatible" &&
        isLoopbackCompatibleEndpoint(this.compatibleEndpoint())
      )
    )
      return null;
    if (!this.connectionEnabled(this.modelProvider())) return null;
    if (this.modelOverride) return this.modelOverride;
    const provider = this.modelProvider();
    const vercelId = provider === "gateway" ? this.activeVercelAccount() : undefined;
    if (vercelId) {
      if (this.vercelCredentialError || !this.vercelConnected()) return null;
      const generation = this.modelCacheGeneration();
      return vercelModelClient(() => this.vercelAccounts(), vercelId, () => this.registryModels(), () => {
        this.assertModelGeneration(generation);
        if (this.activeVercelAccount() !== vercelId) throw new AuxError("cancelled", "The Vercel account changed.");
      }, async source => {
        // Capture the calling run's actual native document, never the sign-in window.
        await this.checkAuthRequester(source.nativeTurnContext);
      });
    }
    const chatgptId = provider === "openai" ? this.activeChatgptAccount() : undefined;
    if (chatgptId) {
      if (
        this.chatgptCredentialError ||
        !this.chatgptAccountService ||
        !this.chatgptConnected() ||
        !this.plannerModel()
      )
        return null;
      if (!this.gatewayClient) {
        const generation = this.modelCacheGeneration();
        this.gatewayClient = chatgptModelClient(
          this.chatgptAccountService,
          chatgptId,
          () => this.chatgptCatalog,
          (signal) => this.refreshChatgptModels(chatgptId, generation, signal),
          () => this.assertModelGeneration(generation),
        );
      }
      return this.gatewayClient;
    }
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
      const t = Number(this.env.AUX_MODEL_STREAM_IDLE_TIMEOUT_MS);
      const only = this.env.AUX_GATEWAY_ONLY?.split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      this.gatewayClient = new GatewayModelClient(key, {
        streamIdleTimeoutMs: Number.isFinite(t) && t > 0 ? t : undefined,
        only: only?.length ? only : undefined,
        models: () => this.mergedCatalog,
        candidatesFor: (id) => this.candidatesForModel(id),
        allowedModelId: this.env.AUX_BENCH_MODEL_PIN || undefined,
      });
    }
    return this.gatewayClient;
  }

  async listModels(): Promise<{
    models: ModelCapability[];
    source: "gateway" | "static" | "configured";
    localServers: LocalModelServer[];
  }> {
    if (this.discoveryClosed) throw new AuxError("cancelled", "Model discovery is closed.");
    const generation = this.modelCacheGeneration();
    const result = await this.loadModels(generation);
    this.assertModelGeneration(generation);
    return result;
  }
  private assertModelGeneration(generation: string): void {
    if (this.discoveryClosed) throw new AuxError("cancelled", "Model discovery is closed.");
    if (this.modelCacheGeneration() !== generation)
      throw new AuxError("cancelled", "The model account changed during discovery.");
  }
  private async loadModels(generation: string): Promise<{
    models: ModelCapability[];
    source: "gateway" | "static" | "configured";
    localServers: LocalModelServer[];
  }> {
    const copilot = this.copilotSelection();
    if (this.hasCopilotSelection())
      return {
        models: !this.localModelsOnly() && copilot ? copilot.models : [],
        source: "configured",
        localServers: await this.localServers(),
      };
    const provider = this.modelProvider();
    const chatgptId = provider === "openai" ? this.activeChatgptAccount() : undefined;
    if (chatgptId && !this.localModelsOnly() && this.connectionEnabled(provider)) {
      await this.refreshChatgptModels(chatgptId, generation);
      return {
        models: [...this.chatgptCatalog],
        source: "configured",
        localServers: await this.localServers(),
      };
    }
    const local =
      this.modelOverride || !this.connectionEnabled(provider)
        ? Promise.resolve(this.localModels)
        : this.localServers();
    // Explicit test injection remains the same provider boundary as model calls.
    if (this.modelOverride) {
      const catalog = (await this.modelOverride.listModels()).map((model) => ({
        ...model,
        source: "catalog" as const,
      }));
      this.assertModelGeneration(generation);
      this.mergedCatalog = mergeModelCapabilities(MODEL_REGISTRY, catalog);
      return { models: [...this.mergedCatalog], source: "gateway", localServers: await local };
    }
    const configured: ModelCapability[] = [
      ...new Set([this.plannerModel(), this.visionModel()].filter((id): id is string => !!id)),
    ].map((id) => ({ id, source: "configured" }));
    const key = provider === "gateway" ? undefined : this.selectedKey();
    const endpoint =
      provider === "gateway"
        ? "https://ai-gateway.vercel.sh/v1"
        : providerEndpoint(provider, this.compatibleEndpoint());
    if (
      (this.localModelsOnly() &&
        !(provider === "openai-compatible" && isLoopbackCompatibleEndpoint(endpoint))) ||
      !this.connectionEnabled(provider) ||
      (provider !== "gateway" &&
        !key &&
        !(provider === "openai-compatible" && isLoopbackCompatibleEndpoint(endpoint)))
    )
      return {
        models: this.localModelsOnly() ? [] : provider === "gateway" ? [...MODEL_REGISTRY] : configured,
        source: provider === "gateway" ? "static" : "configured",
        localServers: await local,
      };
    try {
      const models = await this.catalog().list({
        provider,
        endpoint,
        generation,
        key,
      });
      this.assertModelGeneration(generation);
      this.mergedCatalog =
        provider === "gateway"
          ? mergeModelCapabilities(MODEL_REGISTRY, models)
          : mergeModelCapabilities(configured, models);
      return {
        models: [...this.mergedCatalog],
        source: provider === "gateway" ? "gateway" : "configured",
        localServers: await local,
      };
    } catch (error) {
      if (provider !== "gateway" || (error instanceof AuxError && error.code === "cancelled")) throw error;
      return { models: [...this.registryModels()], source: "static", localServers: await local };
    }
  }

  /** Utility requests prefer discovered local models without changing the user's agent route. */
  utilityModel(): Promise<NetworkUtilityRoute | null>;
  utilityModel(nativeTurnContext: string, checkOwner: () => Promise<void>): Promise<UtilityRoute | null>;
  async utilityModel(
    nativeTurnContext?: string,
    checkOwner?: () => Promise<void>,
  ): Promise<UtilityRoute | null> {
    if (this.discoveryClosed) throw new AuxError("cancelled", "Model discovery is closed.");
    if (this.modelOverride)
      return {
        kind: "network",
        model: this.modelOverride,
        modelId: this.agentRoute("fast").modelId,
        provider: this.modelProvider(),
        destination: new URL(providerEndpoint(this.modelProvider(), this.compatibleEndpoint())).origin,
      };
    const generation = this.modelCacheGeneration();
    if (nativeTurnContext && checkOwner && this.native) {
      this.foundationModels ??= new FoundationModelsClient(this.native);
      if (await this.foundationModels.available(nativeTurnContext)) {
        this.assertModelGeneration(generation);
        return this.foundationModels.route(nativeTurnContext, checkOwner);
      }
      this.assertModelGeneration(generation);
    }
    const local = await this.localServers();
    this.assertModelGeneration(generation);
    const server = this.connectionEnabled("openai-compatible")
      ? local.find((entry) => entry.models.length)
      : undefined;
    if (server)
      return {
        kind: "network",
        model: directModelClient("openai-compatible", "aux-local", undefined, server.endpoint),
        modelId: server.models[0]!.id,
        provider: "openai-compatible",
        destination: new URL(server.endpoint).origin,
      };
    if (this.localModelsOnly()) return null;
    const key = this.gatewayKey();
    if (key)
      return {
        kind: "network",
        model: new GatewayModelClient(key, {
          models: () => this.registryModels(),
        }),
        modelId: DEFAULT_UTILITY_MODEL_ID,
        provider: "gateway",
        destination: "https://ai-gateway.vercel.sh",
      };
    // A saved direct provider remains usable without a separate Gateway account.
    if (this.hasCopilotSelection()) return null;
    const selected = this.model();
    return selected
      ? {
          kind: "network",
          model: selected,
          modelId: this.plannerModel(),
          provider: this.modelProvider(),
          destination: new URL(providerEndpoint(this.modelProvider(), this.compatibleEndpoint())).origin,
        }
      : null;
  }

  /** Nonsecret generation changes whenever provider connection configuration changes. */
  modelCacheGeneration(): string {
    let generation = this.repo.getSetting<string>("modelCacheGeneration");
    if (!generation) {
      generation = randomUUID();
      this.repo.setSetting("modelCacheGeneration", generation);
    }
    return generation;
  }

  /** Tiny structured-output + optional screenshot-understanding probe. */
  async probe(modelId?: string): Promise<{
    ok: boolean;
    modelId: string;
    latencyMs?: number;
    vision?: boolean;
    error?: string;
  }> {
    const epoch = this.connectionEpoch,
      provider = this.modelProvider();
    const stale = () => epoch !== this.connectionEpoch || !this.connectionEnabled(provider);
    const interrupted = () => ({
      ok: false,
      modelId: modelId ?? this.plannerModel(),
      error: "Connection changed during the test. Review it and test again.",
    });
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
    return !ModelProviderSchema.array()
      .parse(this.get("disabledModelProviders") ?? [])
      .includes(provider);
  }
  imageModel(): ImageModel | null {
    if (this.localModelsOnly()) return null;
    const saved = this.get("imageModel");
    return ImageModelSchema.nullable().parse(saved === undefined ? DEFAULT_IMAGE_MODEL_ID : saved);
  }
  private connectionStatuses(): ModelConnectionStatus[] {
    return ModelProviderSchema.options.map((provider) => {
      const vercel = provider === "gateway" && this.activeVercelAccount();
      const subscription = provider === "openai" && this.activeChatgptAccount();
      const saved = vercel || subscription || (provider === "gateway" ? this.savedKey : this.directKeys[provider]);
      const environment =
        provider === "gateway" ? this.env.AI_GATEWAY_API_KEY : this.env[PROVIDER_ENV[provider]];
      return ModelConnectionStatusSchema.parse({
        provider,
        selected: provider === this.modelProvider(),
        enabled: this.connectionEnabled(provider),
        credentialSource: saved ? "saved" : environment ? "environment" : "none",
        credentialUnavailable: !!(vercel ? this.vercelCredentialError : subscription
          ? this.chatgptCredentialError
          : provider === "gateway"
            ? this.credentialError
            : this.directErrors[provider]),
        localEndpoint:
          provider === "openai-compatible" && isLoopbackCompatibleEndpoint(this.compatibleEndpoint()),
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
