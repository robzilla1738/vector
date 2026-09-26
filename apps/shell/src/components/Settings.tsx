import { LayoutChoice } from "./LayoutChoice";
import { SettingsRow as Field, SettingsGroup, Switch } from "./ui";
import { WebsiteSizes } from "./WebsiteSizes";
import { QuickAskSetting } from "./QuickAskSetting";
import { BrowserProfiles } from "./BrowserProfiles";
import { SearchEngineSetting } from "./SearchEngineSetting";
import { SearchEnginesSetting, type EngineRow } from "./SearchEnginesSetting";
import { DefaultBrowserSetting } from "./DefaultBrowserSetting";
import { AutofillSetting } from "./AutofillSetting";
import { ImportDataSetting } from "./ImportDataSetting";
import { ShortcutsSetting } from "./ShortcutsSetting";
import type { AutofillProfile, ShortcutOverrides } from "@aux/contracts";
import { DEFAULT_SEARCH_ENGINE } from "@aux/contracts/search-engine";
import { DEFAULT_PLANNER_MODEL_ID, MODEL_REGISTRY, modelPickerEntries } from "@aux/contracts/model-registry";
import { ClearHistory } from "./ClearHistory";
import { MemorySettings } from "./MemorySettings";
import type { ModelProvider } from "@aux/contracts";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useStore, call, toast, errToast } from "../store";
import { bridge, emptyBrowserHealthSummary, type BrowserHealthSummary } from "../bridge";

import { I } from "./icons";
import { UI_FONT_SIZES, readUiFontSize, writeUiFontSize, type UiFontSize } from "../ui-font-size";
import { SitePermissions } from "./SitePermissions";
import { ExternalAgents } from "./ExternalAgents";
import { PluginsPanel } from "./PluginsPanel";
import { Extensions } from "./Extensions";
import { VaultSettings } from "./VaultSettings";
import { CalendarConnections } from "./CalendarConnections";
import { OutboundMcpSettings } from "./OutboundMcpSettings";
import { MigrationImport } from "./MigrationImport";
import { ReviewedConnectors } from "./ReviewedConnectors";
import { searchSettings, type SettingsDestination } from "../settings-search";
import { moveListFocus } from "../keyboard-list";
import { useFeature } from "../use-feature";

/** what settings.get returns in place of the real key */
const KEY_MASK = "••••••••";

interface ModelEntry {
  id: string;
  name?: string;
}

const KNOWN_PLANNER_MODELS: ModelEntry[] = modelPickerEntries(MODEL_REGISTRY);

const TURN_OPTIONS = [8, 16, 32, 64, 128, 0];

function plannerModelSelection(settings: Record<string, unknown>, provider: ModelProvider): string {
  return typeof settings.plannerModel === "string"
    ? settings.plannerModel
    : provider === "gateway"
      ? DEFAULT_PLANNER_MODEL_ID
      : "";
}

function mergeModelOptions(models: ModelEntry[], current?: string): ModelEntry[] {
  const out: ModelEntry[] = [];
  const seen = new Set<string>();
  for (const m of [...KNOWN_PLANNER_MODELS, ...models, ...(current ? [{ id: current }] : [])]) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    out.push(m);
  }
  return out;
}
interface ProbeResult {
  ok: boolean;
  modelId: string;
  latencyMs?: number;
  vision?: boolean;
  error?: string;
  checkedAt?: number;
}

function activateRadioOnArrow(event: React.KeyboardEvent<HTMLDivElement>) {
  if (event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
  const radios = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')].filter(
    (radio) => !radio.disabled,
  );
  const index = radios.indexOf(event.target as HTMLButtonElement);
  if (index < 0 || !radios.length) return;
  event.preventDefault();
  const backwards = event.key === "ArrowLeft" || event.key === "ArrowUp";
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? radios.length - 1
        : (index + (backwards ? -1 : 1) + radios.length) % radios.length;
  radios[next]?.focus();
  radios[next]?.click();
}

const categoryDescriptions: Record<string, string> = {
  General: "Search, profiles, shortcuts, and your browsing data.",
  Appearance: "Make Aux feel at home, from tabs to text size.",
  Memory: "Manage the context Aux remembers for your work.",
  Connections: "Manage your models, services, and connected tools.",
  "Site permissions": "Choose what websites can access.",
  "Agent permissions": "Control what Aux can do on your behalf.",
  Extensions: "Manage the extensions available in your browser.",
};

type ConnectionTab = "Models" | "Services" | "Agents" | "Vault" | "Plugins";
const connectionCategories = ["Models", "Connections", "External agents", "Vault"];
export function Settings() {
  const memoryAvailable = useFeature("memory");
  const permissionsAvailable = useFeature("sitePermissions");
  const vaultAvailable = useFeature("vault");
  const extensionsAvailable = useFeature("extensions");
  const [initialCategory] = useState(() => useStore.getState().settingsCategory);
  const [category, setCategory] = useState(() =>
    (initialCategory === "Memory" && !memoryAvailable) ||
    (initialCategory === "Site permissions" && !permissionsAvailable) ||
    (initialCategory === "Extensions" && !extensionsAvailable) ||
    (initialCategory === "Vault" && !vaultAvailable)
      ? "General"
      : connectionCategories.includes(initialCategory)
        ? "Connections"
        : initialCategory,
  );
  const [connectionTab, setConnectionTab] = useState<ConnectionTab>(
    initialCategory === "External agents"
      ? "Agents"
      : initialCategory === "Connections"
        ? "Services"
        : initialCategory === "Vault" && vaultAvailable
          ? "Vault"
          : "Models",
  );
  const [subview, setSubview] = useState<string | null>(null);
  const subviewOrigin = useRef<HTMLButtonElement | null>(null);
  function openCategory(name: string) {
    setSubview(null);
    setCategory(connectionCategories.includes(name) ? "Connections" : name);
    if (connectionCategories.includes(name))
      setConnectionTab(
        name === "Models"
          ? "Models"
          : name === "External agents"
            ? "Agents"
            : name === "Vault"
              ? "Vault"
              : "Services",
      );
  }
  const [query, setQuery] = useState("");
  const searching = !!query.trim();
  const results = searchSettings(query).filter(
    (result) =>
      (memoryAvailable || result.category !== "Memory") &&
      (permissionsAvailable || result.category !== "Site permissions") &&
      (vaultAvailable || result.category !== "Vault") &&
      (extensionsAvailable || result.category !== "Extensions"),
  );
  const visible = (name: string) =>
    !searching &&
    (connectionCategories.includes(name)
      ? category === "Connections" &&
        connectionTab ===
          (name === "Models"
            ? "Models"
            : name === "External agents"
              ? "Agents"
              : name === "Vault"
                ? "Vault"
                : "Services")
      : category === name && !subview);
  const [destination, setDestination] = useState<SettingsDestination | null>(null);
  const [uiFont, setUiFont] = useState<UiFontSize>(readUiFontSize);
  const settings = useStore((s) => s.settings);
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const manageConnector = (kind: "calendar" | "mcp") => {
    const target = scrollRef.current?.querySelector<HTMLElement>(`#connection-${kind}`);
    target?.scrollIntoView?.({ block: "start", behavior: "smooth" });
    target?.focus({ preventScroll: true });
  };
  const setOverlay = useStore((s) => s.setOverlay);
  const openEditor = (name: string, origin: HTMLButtonElement) => {
    subviewOrigin.current = origin;
    setSubview(name);
    requestAnimationFrame(() =>
      scrollRef.current
        ?.querySelector<HTMLElement>(".settings-editor-view:not([hidden])")
        ?.focus({ preventScroll: true }),
    );
  };
  const [key, setKey] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const [switchingProvider, setSwitchingProvider] = useState(false);
  const provider = (settings.modelProvider as ModelProvider) ?? "gateway";
  const providerNames: Record<ModelProvider, string> = {
    gateway: "Vercel AI Gateway",
    openai: "OpenAI",
    anthropic: "Anthropic",
    google: "Google",
    "openai-compatible": "OpenAI-compatible",
  };
  const [connectionError, setConnectionError] = useState("");
  const [modelDraft, setModelDraft] = useState(() => plannerModelSelection(settings, provider));
  const [endpointDraft, setEndpointDraft] = useState(String(settings.compatibleEndpoint ?? ""));
  const probeSequence = useRef(0);
  const [saved, setSaved] = useState(false);
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [modelsBusy, setModelsBusy] = useState(false);
  const modelsSequence = useRef(0);
  const [probe, setProbe] = useState<ProbeResult | null>(() => {
    const saved = settings.modelProbe as ProbeResult | undefined;
    return saved ? { ...saved, error: saved.ok ? undefined : "Last connection test failed" } : null;
  });
  // settings often arrive after the first render — surface the saved probe
  // whenever the fetched record changes.
  useEffect(() => {
    const saved = settings.modelProbe as ProbeResult | undefined;
    if (saved) setProbe({ ...saved, error: saved.ok ? undefined : "Last connection test failed" });
  }, [settings.modelProbe]);
  const [probing, setProbing] = useState(false);
  const [dataDir, setDataDir] = useState("");
  const [diagnosticsBusy, setDiagnosticsBusy] = useState(false);
  const [diagnosticsMessage, setDiagnosticsMessage] = useState("");
  const [backupBusy, setBackupBusy] = useState(false);
  const [backupMessage, setBackupMessage] = useState("");
  const [restoreStatus, setRestoreStatus] = useState<{ pending: boolean; lastAppliedAt?: number }>({
    pending: false,
  });
  const [backups, setBackups] = useState<
    {
      path: string;
      name: string;
      sha256: string;
      createdAt: number;
      bytes: number;
      schemaVersion: number;
      artifactFiles: number;
      missingArtifacts: number;
    }[]
  >([]);
  const [deleteBackupName, setDeleteBackupName] = useState<string | null>(null);
  const [backupKeep, setBackupKeep] = useState<3 | 5 | 10 | 20>(10);
  const [health, setHealth] = useState<BrowserHealthSummary>(() => emptyBrowserHealthSummary());
  const [healthBusy, setHealthBusy] = useState(false);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => previous?.focus();
  }, []);

  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [category, query, connectionTab, subview]);

  useLayoutEffect(() => {
    if (!destination || searching) return;
    const section = scrollRef.current?.querySelector<HTMLElement>(":scope > section:not([hidden])");
    const target = destination.target
      ? [...(section?.querySelectorAll<HTMLElement>("[data-setting]") ?? [])].find(
          (node) => node.dataset.setting === destination.target,
        )
      : section;
    const details = target?.closest("details");
    if (details) details.open = true;
    if (target) {
      target.scrollIntoView({ block: "center" });
      target.focus({ preventScroll: true });
    } else section?.scrollIntoView({ block: "start" });
    setDestination(null);
  }, [destination, searching]);

  useEffect(() => {
    if (searching || category !== "General") return;
    let live = true;
    void bridge
      .dataDir()
      .then((value) => {
        if (live) setDataDir(value);
      })
      .catch((error) => {
        if (live) errToast(error);
      });
    void bridge
      .runtimeRestoreStatus()
      .then((value) => {
        if (live) setRestoreStatus(value);
      })
      .catch(() => {});
    void call("installation.listBackups", {})
      .then((value) => {
        if (live) setBackups(value);
      })
      .catch(() => {});
    void call("installation.backupRetention", {})
      .then((value) => {
        if (live) setBackupKeep(value.keep as 3 | 5 | 10 | 20);
      })
      .catch(() => {});
    void bridge
      .healthSummary()
      .then((value) => {
        if (live) setHealth(value);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [category, searching]);

  useEffect(() => {
    if (searching || category !== "Connections" || connectionTab !== "Models") return;
    const sequence = ++modelsSequence.current;
    setModels([]);
    setModelsBusy(true);
    void call("models.list")
      .then((result) => {
        if (sequence === modelsSequence.current) setModels(result.models);
      })
      .catch(() => {})
      .finally(() => {
        if (sequence === modelsSequence.current) setModelsBusy(false);
      });
    return () => {
      ++modelsSequence.current;
    };
  }, [category, connectionTab, searching, provider, settings.compatibleEndpoint, settings.modelApiKey]);

  useEffect(() => {
    setModelDraft(plannerModelSelection(settings, provider));
  }, [settings.plannerModel, provider]);
  useEffect(() => {
    setEndpointDraft(String(settings.compatibleEndpoint ?? ""));
  }, [settings.compatibleEndpoint, provider]);
  useEffect(
    () => () => {
      probeSequence.current++;
    },
    [],
  );

  const set = async (patch: Record<string, unknown>) => {
    if (
      "gatewayApiKey" in patch ||
      "plannerModel" in patch ||
      "modelProvider" in patch ||
      "modelCredential" in patch ||
      "compatibleEndpoint" in patch
    ) {
      probeSequence.current++;
      setProbe(null);
    }
    try {
      await call("settings.set", patch);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
      return true;
    } catch (e) {
      errToast(e);
      return false;
    }
  };

  const saveKey = async () => {
    if (savingKey || !key.trim() || key === KEY_MASK) return;
    setSavingKey(true);
    setConnectionError("");
    const ok = await set({ modelCredential: { provider, key: key.trim() } });
    if (ok) setKey("");
    else
      setConnectionError(
        "The key was not saved. Your entry is still here; resolve the storage error and try again.",
      );
    setSavingKey(false);
  };

  const runProbe = async () => {
    const sequence = ++probeSequence.current;
    setProbing(true);
    setProbe(null);
    try {
      const result = await call("models.probe", { modelId: (settings.plannerModel as string) || undefined });
      if (sequence === probeSequence.current) setProbe({ ...result, checkedAt: Date.now() });
    } catch (e) {
      if (sequence === probeSequence.current)
        setProbe({ ok: false, modelId: "", error: e instanceof Error ? e.message : String(e) });
    }
    setProbing(false);
  };

  const discoverModels = async () => {
    if (modelsBusy) return;
    const sequence = ++modelsSequence.current;
    setModelsBusy(true);
    setConnectionError("");
    try {
      const result = await call("models.list");
      if (sequence !== modelsSequence.current) return;
      setModels(result.models);
      if (!result.models.length) setConnectionError("The endpoint returned no models.");
    } catch (error) {
      if (sequence === modelsSequence.current)
        setConnectionError(error instanceof Error ? error.message : String(error));
    } finally {
      if (sequence === modelsSequence.current) setModelsBusy(false);
    }
  };

  const theme = (settings.theme as string) ?? "dark";
  const plannerModel = plannerModelSelection(settings, provider);
  const contributorSelected =
    plannerModel === DEFAULT_PLANNER_MODEL_ID || modelDraft.trim() === DEFAULT_PLANNER_MODEL_ID;
  const plannerOptions: ModelEntry[] =
    provider === "gateway"
      ? mergeModelOptions(models, plannerModel)
      : [
          ...models,
          ...[plannerModel, String(settings.visionModel ?? "")].filter(Boolean).map((id) => ({ id })),
        ].filter((model, index, all) => all.findIndex((item) => item.id === model.id) === index);
  const turnValue = (settings.maxModelCalls as number) ?? 8;
  const turnOptions = TURN_OPTIONS.includes(turnValue) ? TURN_OPTIONS : [turnValue, ...TURN_OPTIONS];
  const hasKey =
    settings.modelApiKey === KEY_MASK || (provider === "gateway" && settings.gatewayApiKey === KEY_MASK);
  const localCompatible =
    provider === "openai-compatible" &&
    (() => {
      try {
        return ["localhost", "127.0.0.1", "[::1]"].includes(
          new URL(String(settings.compatibleEndpoint ?? "")).hostname,
        );
      } catch {
        return false;
      }
    })();
  const connectionReady = hasKey || localCompatible;

  return (
    <section className="settings-page" aria-label="Settings" ref={dialogRef}>
      <nav
        className="settings-nav"
        aria-label="Settings categories"
        onKeyDown={(event) => moveListFocus(event, "button[data-category]")}
      >
        <div className="settings-search-box">
          {I.search}
          <input
            aria-label="Search settings"
            placeholder="Search settings…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing || !searching) return;
              if (event.key === "ArrowDown" || event.key === "Enter") {
                event.preventDefault();
                event.stopPropagation();
                dialogRef.current?.querySelector<HTMLButtonElement>(".settings-search-result")?.focus();
              }
            }}
          />
          {query && (
            <button
              className="icon-btn"
              aria-label="Clear settings search"
              onClick={() => {
                setQuery("");
                dialogRef.current?.querySelector<HTMLInputElement>('[aria-label="Search settings"]')?.focus();
              }}
            >
              {I.close}
            </button>
          )}
        </div>
        <span>Preferences</span>
        <div className="settings-category-list">
          {[
            "General",
            "Appearance",
            ...(memoryAvailable ? ["Memory"] : []),
            "Connections",
            ...(permissionsAvailable ? ["Site permissions"] : []),
            "Agent permissions",
            ...(extensionsAvailable ? ["Extensions"] : []),
          ].map((name) => (
            <button
              key={name}
              data-category={name}
              aria-current={!searching && category === name ? "page" : undefined}
              onClick={() => {
                openCategory(name);
                setQuery("");
                if (scrollRef.current) scrollRef.current.scrollTop = 0;
              }}
            >
              <span className="settings-category-icon">
                {
                  (
                    {
                      General: I.gear,
                      Appearance: I.sun,
                      Memory: I.chats,
                      Models: I.model,
                      Connections: I.globe,
                      "Site permissions": I.globe,
                      "Agent permissions": I.lock,
                      "External agents": I.chats,
                      Extensions: I.extension,
                    } as Record<string, React.ReactNode>
                  )[name]
                }
              </span>
              {name}
            </button>
          ))}
        </div>
      </nav>
      <div className="settings-content">
        <div className="drawer-head">
          {subview && !searching && (
            <button
              className="icon-btn"
              aria-label="Back to General settings"
              onClick={() => {
                setSubview(null);
                requestAnimationFrame(() => subviewOrigin.current?.focus());
              }}
            >
              {I.back}
            </button>
          )}
          <div className="settings-heading">
            <h3>{searching ? "Search settings" : (subview ?? category)}</h3>
            <p>
              {searching
                ? "Find a preference across all categories."
                : subview
                  ? "General settings"
                  : categoryDescriptions[category]}
            </p>
          </div>
          <span className="sp" />
          {saved && <output className="saved">{I.check} Saved</output>}
          <button
            className="icon-btn"
            title="Close (Esc)"
            aria-label="Close settings"
            onClick={() => setOverlay(null)}
          >
            {I.close}
          </button>
        </div>

        {!searching && category === "Connections" && (
          <div
            className="settings-connection-tabs"
            role="tablist"
            aria-label="Connection types"
            onKeyDown={(event) => moveListFocus(event, '[role="tab"]', false)}
          >
            {(
              [
                "Models",
                "Services",
                ...(vaultAvailable ? (["Vault"] as const) : []),
                "Agents",
                "Plugins",
              ] as const
            ).map((tab) => (
              <button
                key={tab}
                role="tab"
                id={`connection-tab-${tab}`}
                aria-controls={`connection-panel-${tab}`}
                aria-selected={connectionTab === tab}
                tabIndex={connectionTab === tab ? 0 : -1}
                onClick={() => setConnectionTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
        <div
          role="group"
          className="settings-scroll"
          ref={scrollRef}
          tabIndex={0}
          aria-label={searching ? "Settings search results" : `${category} settings`}
        >
          {searching && (
            <div className="settings-search-results">
              <output className="hint" data-block>
                {results.length
                  ? `${results.length} matching ${results.length === 1 ? "setting" : "settings"}`
                  : `No settings found for “${query.trim()}”. Try theme, privacy, models or backup.`}
              </output>
              <div onKeyDown={(event) => moveListFocus(event, "button")}>
                {results.map((result) => (
                  <button
                    key={`${result.category}:${result.label}`}
                    className="settings-search-result"
                    onClick={() => {
                      openCategory(result.category);
                      setQuery("");
                      setSubview(
                        result.category === "General" &&
                          [
                            "Keyword engines",
                            "Keyboard shortcuts",
                            "Browser profiles",
                            "Task data backup",
                          ].includes(result.target ?? "")
                          ? result.target!
                          : null,
                      );
                      setDestination(result);
                    }}
                  >
                    <span className="settings-search-category">
                      {connectionCategories.includes(result.category)
                        ? `Connections · ${result.category === "Connections" ? "Services" : result.category === "External agents" ? "Agents" : result.category === "Vault" ? "Vault" : "Models"}`
                        : result.category}
                    </span>
                    <strong>{result.label}</strong>
                    <span>{result.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {visible("Memory") && (
            <section tabIndex={-1}>
              <MemorySettings />
            </section>
          )}
          {permissionsAvailable && (
            <section tabIndex={-1} hidden={!visible("Site permissions")}>
              <SitePermissions query="" />
            </section>
          )}
          <section
            id="connection-panel-Models"
            role="tabpanel"
            aria-labelledby="connection-tab-Models"
            hidden={!visible("Models")}
          >
            <div className="drawer-section">AI model</div>
            <output className="field" data-block>
              {probe?.ok
                ? `${providerNames[provider]} is ready.`
                : localCompatible
                  ? "Local model endpoint configured. Save a model and test the connection before your first run."
                  : hasKey
                    ? `${providerNames[provider]} key configured. Save a model and test the connection before your first run.`
                    : "Agent setup needed. Browsing, saved tasks, and evidence review are available without a model."}
            </output>
            <Field
              label="Model provider"
              hint="Switching providers changes where task context and screenshots are sent. Each provider keeps its own key and model choices; there is no automatic fallback to another provider."
            >
              <select
                aria-label="Model provider"
                value={provider}
                disabled={savingKey || probing || switchingProvider}
                onChange={(event) => {
                  setSwitchingProvider(true);
                  void set({ modelProvider: event.target.value })
                    .then((ok) => {
                      if (ok) {
                        setKey("");
                        setModels([]);
                        setConnectionError("");
                      }
                    })
                    .finally(() => setSwitchingProvider(false));
                }}
              >
                {Object.entries(providerNames).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>
            {provider === "openai-compatible" && (
              <Field
                label="Endpoint"
                hint="Prompts and screenshots are sent here. Remote endpoints must use HTTPS; localhost may use HTTP."
              >
                <div className="row">
                  <input
                    className="grow"
                    aria-label="OpenAI-compatible endpoint"
                    inputMode="url"
                    autoComplete="url"
                    placeholder="https://example.com/v1"
                    value={endpointDraft}
                    disabled={probing || savingKey || switchingProvider}
                    onChange={(event) => {
                      setEndpointDraft(event.target.value);
                      setProbe(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && endpointDraft.trim()) {
                        event.preventDefault();
                        void set({ compatibleEndpoint: endpointDraft.trim() });
                      }
                    }}
                  />
                  <button
                    className="btn sm"
                    disabled={
                      probing ||
                      savingKey ||
                      switchingProvider ||
                      !endpointDraft.trim() ||
                      endpointDraft.trim() === String(settings.compatibleEndpoint ?? "")
                    }
                    onClick={() => void set({ compatibleEndpoint: endpointDraft.trim() })}
                  >
                    Save endpoint
                  </button>
                  <button
                    className="btn sm"
                    disabled={
                      probing ||
                      savingKey ||
                      switchingProvider ||
                      modelsBusy ||
                      !settings.compatibleEndpoint ||
                      !connectionReady ||
                      endpointDraft.trim() !== String(settings.compatibleEndpoint ?? "")
                    }
                    onClick={() => void discoverModels()}
                  >
                    {modelsBusy ? "Discovering…" : "Discover models"}
                  </button>
                </div>
              </Field>
            )}
            {provider !== "openai-compatible" && (
              <span className="hint field">
                Destination: {String(settings.modelEndpoint ?? "Vercel AI Gateway")}. Enter a model ID
                available to your account. Use the Agents tab for Codex or Claude Code.
              </span>
            )}
            <Field
              label={`${providerNames[provider]} API key`}
              hint={
                <>
                  {String(
                    settings.modelCredentialError ??
                      (provider === "gateway" ? settings.gatewayCredentialError : undefined) ??
                      (settings.modelCredentialSource === "environment"
                        ? "Using a process environment key. Change it in your launch environment."
                        : hasKey
                          ? "Key saved with OS encryption."
                          : localCompatible
                            ? "Optional for localhost. Add a key only if your local server requires one."
                            : "No key configured. Saved keys require OS encryption."),
                  )}
                </>
              }
            >
              <div className="row">
                <input
                  type="password"
                  aria-label="Provider API key"
                  autoComplete="off"
                  disabled={savingKey || probing || switchingProvider}
                  className="grow"
                  value={key}
                  placeholder={
                    hasKey
                      ? "Key saved — enter a new key to replace"
                      : localCompatible
                        ? "Optional for this local endpoint"
                        : "Enter this provider’s API key"
                  }
                  onChange={(e) => {
                    setKey(e.target.value);
                    setProbe(null);
                    setConnectionError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void saveKey();
                    }
                  }}
                />
                <button
                  className="btn sm"
                  disabled={savingKey || probing || switchingProvider || !key.trim() || key === KEY_MASK}
                  onClick={() => void saveKey()}
                >
                  {savingKey ? "Saving…" : "Save key"}
                </button>
                {settings.modelCredentialSource !== "environment" &&
                  (hasKey ||
                    !!(
                      settings.modelCredentialError ??
                      (provider === "gateway" ? settings.gatewayCredentialError : undefined)
                    )) && (
                    <button
                      className="btn sm"
                      disabled={savingKey || probing || switchingProvider}
                      title="Remove this provider’s saved key"
                      onClick={() =>
                        void set({ modelCredential: { provider, key: "" } }).then((ok) => {
                          if (ok) toast("Saved provider key removed");
                        })
                      }
                    >
                      Clear
                    </button>
                  )}
              </div>
            </Field>

            {connectionError && (
              <p className="field" role="alert">
                {connectionError}
              </p>
            )}
            <Field
              label="Planner model"
              hint="Enter the exact model ID for the selected provider. Availability depends on your account."
            >
              <div className="row">
                <input
                  className="grow"
                  aria-label="Planner model"
                  aria-describedby={contributorSelected ? "contributor-data-use" : undefined}
                  list="agent-model-options"
                  value={modelDraft}
                  disabled={probing || savingKey || switchingProvider}
                  onChange={(event) => {
                    setModelDraft(event.target.value);
                    setProbe(null);
                  }}
                />
                <datalist id="agent-model-options">
                  {plannerOptions.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name ?? model.id}
                    </option>
                  ))}
                </datalist>
                <button
                  className="btn sm"
                  disabled={
                    probing ||
                    savingKey ||
                    switchingProvider ||
                    !modelDraft.trim() ||
                    modelDraft.trim() === plannerModel
                  }
                  onClick={() => void set({ plannerModel: modelDraft.trim() })}
                >
                  Save model
                </button>
                <button
                  className="btn sm"
                  disabled={
                    probing ||
                    savingKey ||
                    switchingProvider ||
                    !modelDraft.trim() ||
                    !connectionReady ||
                    !!key.trim() ||
                    modelDraft.trim() !== plannerModel
                  }
                  onClick={() => void runProbe()}
                >
                  {probing ? "Testing…" : "Test connection"}
                </button>
              </div>
              {contributorSelected && (
                <p className="hint" id="contributor-data-use">
                  <strong>Contributor data use.</strong> This tier lets Meta use prompts and completions sent
                  to it to improve its models.
                </p>
              )}
              {probe && (
                <output className={`hint model-probe-status ${probe.ok ? "ok" : "err"}`}>
                  {probe.ok
                    ? `Connection tested${probe.latencyMs == null ? "" : ` · ${probe.latencyMs} ms`}${probe.vision === true ? " · vision" : probe.vision === false ? " · no vision" : ""}`
                    : `Failed — ${probe.error}`}
                  {probe.checkedAt ? ` · ${new Date(probe.checkedAt).toLocaleString()}` : ""}
                </output>
              )}
            </Field>

            <p className="field hint">
              Test connection sends small synthetic model requests and may incur provider charges. It does not
              send your open pages. Save key and model changes before testing.
            </p>
            <Field
              label="Vision model"
              hint="Used for screenshot-based recovery. Select a model that accepts images and confirm its capability with your provider."
            >
              <input
                aria-label="Vision model"
                key={`${provider}:${settings.visionModel}`}
                defaultValue={String(settings.visionModel ?? "")}
                placeholder="Same as planner"
                disabled={switchingProvider || probing || savingKey}
                onBlur={(event) => {
                  if (event.target.value !== String(settings.visionModel ?? ""))
                    void set({ visionModel: event.target.value.trim() });
                }}
              />
            </Field>

            <div className="row two">
              <Field label="Parallel worker pages">
                <input
                  aria-label="Parallel worker pages"
                  type="number"
                  min={1}
                  max={16}
                  defaultValue={(settings.maxWorkers as number) ?? 4}
                  onBlur={(e) => void set({ maxWorkers: Number(e.target.value) })}
                />
              </Field>
              <Field
                label="Max model turns per run"
                hint="How many planner calls a run may make. No limit keeps going until the goal finishes or you stop it."
              >
                <select
                  aria-label="Max model turns per run"
                  value={String(turnValue)}
                  onChange={(e) => void set({ maxModelCalls: Number(e.target.value) })}
                >
                  {turnOptions.map((n) => (
                    <option key={n} value={n}>
                      {n === 0 ? "No limit" : String(n)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>
          <section
            id="connection-panel-Services"
            role="tabpanel"
            aria-labelledby="connection-tab-Services"
            hidden={!visible("Connections")}
          >
            <ReviewedConnectors onManage={manageConnector} />
            <div id="connection-calendar" tabIndex={-1}>
              <CalendarConnections />
            </div>
            <div id="connection-mcp" tabIndex={-1}>
              <OutboundMcpSettings />
            </div>
          </section>
          {vaultAvailable && (
            <section
              tabIndex={-1}
              id="connection-panel-Vault"
              role="tabpanel"
              aria-labelledby="connection-tab-Vault"
              hidden={!visible("Vault")}
            >
              <VaultSettings />
            </section>
          )}
          <section
            tabIndex={-1}
            id="connection-panel-Agents"
            role="tabpanel"
            aria-labelledby="connection-tab-Agents"
            hidden={!visible("External agents")}
          >
            <ExternalAgents />
          </section>
          <section
            tabIndex={-1}
            id="connection-panel-Plugins"
            role="tabpanel"
            aria-labelledby="connection-tab-Plugins"
            hidden={!(category === "Connections" && connectionTab === "Plugins")}
          >
            <PluginsPanel />
          </section>
          {extensionsAvailable && (
            <section tabIndex={-1} hidden={!visible("Extensions")}>
              <Extensions />
            </section>
          )}

          <section className="appearance-preferences" hidden={!visible("Appearance")}>
            <div className="drawer-section">Appearance</div>
            <Field compact label="Theme">
              <div className="seg" role="radiogroup" aria-label="Theme" onKeyDown={activateRadioOnArrow}>
                {(["system", "dark", "light"] as const).map((t) => (
                  <button
                    key={t}
                    role="radio"
                    aria-checked={theme === t}
                    tabIndex={theme === t ? 0 : -1}
                    className={theme === t ? "on" : ""}
                    onClick={() => void set({ theme: t })}
                  >
                    {t === "system" ? "System" : t === "dark" ? "Dark" : "Light"}
                  </button>
                ))}
              </div>
            </Field>

            <Field
              compact
              label="Interface text"
              hint="Shell type size only. Does not change website zoom or the html root font size."
            >
              <div
                className="seg"
                role="radiogroup"
                aria-label="Interface text"
                onKeyDown={activateRadioOnArrow}
              >
                {UI_FONT_SIZES.map((size) => (
                  <button
                    key={size}
                    role="radio"
                    aria-checked={uiFont === size}
                    tabIndex={uiFont === size ? 0 : -1}
                    className={uiFont === size ? "on" : ""}
                    onClick={() => {
                      writeUiFontSize(size);
                      setUiFont(size);
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </Field>

            <Field
              compact
              label="Sidebar appearance"
              hint="Translucent lets your desktop show through the sidebar. Reduce Transparency uses solid surfaces."
            >
              <select
                aria-label="Sidebar appearance"
                value={String(settings.sidebarAppearance ?? "translucent")}
                onChange={(e) => void set({ sidebarAppearance: e.target.value })}
              >
                <option value="translucent">Translucent</option>
                <option value="solid">Solid</option>
              </select>
            </Field>
            <Field
              compact
              label="Native material"
              hint="Liquid Glass uses macOS Tahoe’s native material, with a title-bar fallback on older macOS. Browser previews cannot show native blur."
            >
              <select
                aria-label="Native material"
                disabled={settings.sidebarAppearance === "solid"}
                value={String(settings.sidebarMaterial ?? "liquid-glass")}
                onChange={(e) => void set({ sidebarMaterial: e.target.value })}
              >
                <option value="liquid-glass">Liquid Glass</option>
                <option value="titlebar">Title bar</option>
                <option value="sidebar">Sidebar</option>
                <option value="under-window">Under window</option>
              </select>
            </Field>
            <Field
              compact
              label="Sidebar tint"
              hint="Adds theme-colored opacity over the native blur without fading text or weakening the blur."
            >
              <select
                aria-label="Sidebar tint"
                disabled={settings.sidebarAppearance === "solid"}
                value={Number(settings.sidebarTint ?? 0)}
                onChange={(e) => void set({ sidebarTint: Number(e.target.value) })}
              >
                {[0, 10, 20, 30, 40, 50, 60].map((value) => (
                  <option key={value} value={value}>
                    {value}%
                  </option>
                ))}
              </select>
            </Field>
            <Field
              compact
              label="Content opacity"
              hint="Keeps chats and the new-tab surface separate from the glass sidebar. Websites remain opaque."
            >
              <select
                aria-label="Content opacity"
                disabled={settings.sidebarAppearance === "solid"}
                value={Number(settings.contentOpacity ?? 95)}
                onChange={(e) => void set({ contentOpacity: Number(e.target.value) })}
              >
                {[80, 85, 90, 95, 100].map((value) => (
                  <option key={value} value={value}>
                    {value}%
                  </option>
                ))}
              </select>
            </Field>
            <Field
              compact
              label="Glass defaults"
              hint="Restore the native glass material, clear sidebar tint and 95% content opacity."
            >
              <button
                className="btn sm"
                onClick={() =>
                  void set({
                    sidebarAppearance: "translucent",
                    sidebarMaterial: "liquid-glass",
                    sidebarTint: 0,
                    contentOpacity: 95,
                  })
                }
              >
                Reset glass appearance
              </button>
            </Field>
            <Field
              compact
              label="Tab layout"
              hint="Both layouts use the same tabs, folders, and current selection."
            >
              <LayoutChoice
                value={String(settings.tabLayout ?? "horizontal")}
                onChange={(tabLayout) => void set({ tabLayout })}
              />
            </Field>
            <Field label="Website sizes">
              <WebsiteSizes />
            </Field>
          </section>
          <section hidden={!visible("Agent permissions")}>
            <div className="drawer-section">Agent permissions</div>
            <Field
              label="What the agent may do"
              hint="These are the permissions used when you start a run. Turn Write off for read-only work. Navigation and Evaluate require separate grants. Page content and models cannot add permissions."
            >
              <div
                className="seg wrap"
                role="group"
                aria-label="Agent effect grants"
                data-testid="effect-grants"
              >
                {(
                  [
                    ["effect:read", "Read", true],
                    ["effect:write", "Write", false],
                    ["effect:egress", "Navigate", false],
                    ["effect:destructive", "Evaluate", false],
                  ] as const
                ).map(([key, label, locked]) => {
                  const grants = (settings.effectGrants as string[] | undefined) ?? ["effect:read"];
                  const on = grants.includes(key) || grants.includes("effect:*");
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={on}
                      className={on ? "on" : ""}
                      disabled={locked}
                      onClick={() => {
                        if (locked) return;
                        const next = new Set(grants.filter((g) => g !== "effect:*"));
                        next.add("effect:read");
                        if (on) next.delete(key);
                        else next.add(key);
                        void set({ effectGrants: [...next] });
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </Field>
          </section>
          <section hidden={!visible("General")}>
            <SettingsGroup title="Browsing">
              <Field label="Default browser">
                <DefaultBrowserSetting />
              </Field>

              <Field
                label="Personal info"
                hint="Fill contact and address fields on a form with the context menu or command palette. Passwords and payment details are never stored here."
              >
                <AutofillSetting
                  value={settings.autofill as AutofillProfile | undefined}
                  onSave={(autofill) => set({ autofill })}
                />
              </Field>

              <Field compact label="Search engine">
                <SearchEngineSetting
                  value={(settings.searchEngine as string) ?? DEFAULT_SEARCH_ENGINE}
                  onSave={(searchEngine) => set({ searchEngine })}
                />
              </Field>

              <Field
                compact
                label="Search suggestions"
                hint="Show suggestions from your search engine as you type. Typed text is only sent when it doesn’t look like a private or local address, and never in Private mode."
              >
                <Switch
                  aria-label="Show search suggestions in the address bar"
                  checked={Boolean(settings.searchSuggestions)}
                  onChange={(event) => void set({ searchSuggestions: event.target.checked })}
                />
              </Field>

              <Field compact label="Keyword engines" hint="Manage shortcuts for searching individual sites.">
                <button
                  className="btn sm ghost"
                  data-settings-editor="Keyword engines"
                  onClick={(event) => openEditor("Keyword engines", event.currentTarget)}
                  aria-label="Manage keyword engines"
                >
                  Manage {I.right}
                </button>
              </Field>

              <Field
                label="Import browser data"
                hint="Preview what each installed browser can share — bookmarks and folders, history, and live tabs from an attached Chrome — then import what you choose. Source profiles are only ever read, never changed."
              >
                <ImportDataSetting />
              </Field>
            </SettingsGroup>
            <SettingsGroup title="Workspace and shortcuts">
              <Field compact label="Keyboard shortcuts" hint="Search and customize browser shortcuts.">
                <button
                  className="btn sm ghost"
                  data-settings-editor="Keyboard shortcuts"
                  onClick={(event) => openEditor("Keyboard shortcuts", event.currentTarget)}
                  aria-label="Manage keyboard shortcuts"
                >
                  Manage {I.right}
                </button>
              </Field>

              <Field label="Quick Ask">
                <QuickAskSetting />
              </Field>
              <Field compact label="Browser profiles" hint="Manage separate browsing identities.">
                <button
                  className="btn sm ghost"
                  data-settings-editor="Browser profiles"
                  onClick={(event) => openEditor("Browser profiles", event.currentTarget)}
                  aria-label="Manage browser profiles"
                >
                  Manage {I.right}
                </button>
              </Field>
            </SettingsGroup>
            <SettingsGroup title="Data and recovery">
              <Field compact label="Task data backup" hint="Create, restore, and manage local backups.">
                <button
                  className="btn sm ghost"
                  data-settings-editor="Task data backup"
                  onClick={(event) => openEditor("Task data backup", event.currentTarget)}
                  aria-label="Manage task data backup"
                >
                  Manage {I.right}
                </button>
              </Field>

              <details className="settings-advanced">
                <summary>Diagnostics & storage</summary>
                {dataDir && (
                  <Field label="Data directory">
                    <div className="row">
                      <span className="hint mono selectable grow">{dataDir}</span>
                      <button className="btn sm" onClick={() => void bridge.revealPath(dataDir)}>
                        Reveal
                      </button>
                    </div>
                  </Field>
                )}

                <Field
                  label="Browser health"
                  hint={
                    health.samples
                      ? `${health.sevenDaySpan ? "Seven-day span recorded" : `${health.spanDays.toFixed(1)} of 7 days recorded`} · ${Math.round(health.observedMinutes / 60)} hours while Aux was open · ${health.sessions} sessions · memory p95 ${Math.round(health.memoryMb.p95)} MB · CPU p95 ${health.cpuPercent.p95.toFixed(1)}% · responsiveness p95 ${Math.round(health.eventLoopLagMs.p95)} ms · ${health.pageCrashes} crashes · ${health.pageUnresponsive} hangs · up to ${health.maxPages} tabs and ${health.maxSuspendedPages} suspended${health.suspensionFailures ? ` · ${health.suspensionFailures} suspension failures` : ""}. This contains only local performance totals, never URLs or page content.`
                      : "Aux records local startup, responsiveness, CPU, memory, window, tab, crash, hang, and suspension totals while it is open. It never records URLs or page content."
                  }
                >
                  <div className="row">
                    <span className="hint grow">
                      {health.samples
                        ? `${health.samples.toLocaleString()} private samples${health.startupMs != null ? ` · typical startup ${health.startupMs} ms` : ""}`
                        : "Recording begins during this session."}
                    </span>
                    <button
                      className="btn sm ghost danger"
                      disabled={healthBusy || !health.samples}
                      onClick={() => {
                        setHealthBusy(true);
                        void bridge
                          .clearHealth()
                          .then(setHealth)
                          .catch(errToast)
                          .finally(() => setHealthBusy(false));
                      }}
                    >
                      {healthBusy ? "Clearing…" : "Clear"}
                    </button>
                  </div>
                </Field>

                <Field
                  label="Support report"
                  hint="Exports build and runtime versions, feature counts, aggregate browser health, nonsecret modes, and known compatibility limits. It excludes credentials, URLs, browsing history, task text, account identity, local paths, and content."
                >
                  <div className="row">
                    <button
                      className="btn sm"
                      disabled={diagnosticsBusy}
                      onClick={() => {
                        setDiagnosticsBusy(true);
                        setDiagnosticsMessage("");
                        void bridge
                          .exportDiagnostics()
                          .then((path) =>
                            setDiagnosticsMessage(path ? "Support report saved." : "Export cancelled."),
                          )
                          .catch((error) =>
                            setDiagnosticsMessage(error instanceof Error ? error.message : String(error)),
                          )
                          .finally(() => setDiagnosticsBusy(false));
                      }}
                    >
                      {diagnosticsBusy ? "Preparing…" : "Export support report…"}
                    </button>
                    {diagnosticsMessage && <output className="hint">{diagnosticsMessage}</output>}
                  </div>
                </Field>
              </details>

              <div className="drawer-foot" data-setting="clear-history" tabIndex={-1}>
                <ClearHistory />
              </div>
            </SettingsGroup>
          </section>
          <section
            className="settings-editor-view"
            tabIndex={-1}
            aria-label="Keyword engines"
            hidden={searching || category !== "General" || subview !== "Keyword engines"}
          >
            <Field label="Keyword engines" hint="Search a site directly by typing its keyword first.">
              <SearchEnginesSetting
                value={(settings.searchEngines as EngineRow[]) ?? []}
                onSave={(searchEngines) => set({ searchEngines })}
              />
            </Field>
          </section>
          <section
            className="settings-editor-view"
            tabIndex={-1}
            aria-label="Keyboard shortcuts"
            hidden={searching || category !== "General" || subview !== "Keyboard shortcuts"}
          >
            <Field
              label="Keyboard shortcuts"
              hint="Change any browser or app shortcut. Menus, web pages and the shell share one set — a chord that collides is explained before it is assigned."
            >
              <ShortcutsSetting
                active={!searching && category === "General" && subview === "Keyboard shortcuts"}
                value={(settings.shortcutOverrides as ShortcutOverrides | undefined) ?? {}}
                onSave={(shortcutOverrides) => set({ shortcutOverrides })}
              />
            </Field>
          </section>
          <section
            className="settings-editor-view"
            tabIndex={-1}
            aria-label="Browser profiles"
            hidden={searching || category !== "General" || subview !== "Browser profiles"}
          >
            <Field label="Browser profiles">
              <BrowserProfiles />
            </Field>
          </section>
          <section
            className="settings-editor-view"
            tabIndex={-1}
            aria-label="Task data backup"
            hidden={searching || category !== "General" || subview !== "Task data backup"}
          >
            <Field
              label="Task data backup"
              hint="Backs up chats, tasks, Spaces, saved evidence, browsing records and preferences. New portable backups omit protected articles, selected-article answers, reports, and site grants; older backups are scrubbed when restored but may retain earlier copies until you delete them. Sign-ins, credentials, extensions, downloads, project files and cloud resources are not included. Chromium Cookies, Login Data, Web Data and other credential stores are never copied. Backups contain private content; keep them somewhere secure. Oldest complete backups are deleted after a new backup. Incomplete folders without a manifest are skipped. A process kill during backup leaves an incomplete folder that Aux ignores."
            >
              <div className="row">
                <button
                  className="btn sm"
                  disabled={backupBusy}
                  onClick={() => {
                    setBackupBusy(true);
                    setBackupMessage("");
                    void bridge
                      .exportRuntimeBackup()
                      .then((result) => {
                        setBackupMessage(
                          result
                            ? `Backup saved · ${result.artifactFiles} artifact files${result.missingArtifacts ? ` · ${result.missingArtifacts} unavailable` : ""} · ${result.bytes} bytes`
                            : "Backup cancelled.",
                        );
                        return call("installation.listBackups", {});
                      })
                      .then((value) => {
                        if (Array.isArray(value)) setBackups(value as typeof backups);
                      })
                      .catch((error) =>
                        setBackupMessage(error instanceof Error ? error.message : String(error)),
                      )
                      .finally(() => setBackupBusy(false));
                  }}
                >
                  {backupBusy ? "Preparing…" : "Create backup…"}
                </button>
                <button
                  className="btn sm"
                  disabled={backupBusy || restoreStatus.pending}
                  onClick={() => {
                    setBackupBusy(true);
                    setBackupMessage("");
                    void bridge
                      .stageRuntimeRestore()
                      .then((result) => {
                        if (result) {
                          setRestoreStatus((current) => ({ ...current, pending: true }));
                          setBackupMessage(
                            `Restore staged with ${result.artifactFiles} artifact files${result.missingArtifacts ? `; ${result.missingArtifacts} were unavailable when the backup was created` : ""}. Quit Aux normally and reopen it to apply.`,
                          );
                        } else setBackupMessage("Restore cancelled.");
                      })
                      .catch((error) =>
                        setBackupMessage(error instanceof Error ? error.message : String(error)),
                      )
                      .finally(() => setBackupBusy(false));
                  }}
                >
                  Restore backup…
                </button>
                {restoreStatus.pending && (
                  <button
                    className="btn sm"
                    disabled={backupBusy}
                    onClick={() => {
                      setBackupBusy(true);
                      void bridge
                        .cancelRuntimeRestore()
                        .then(() => {
                          setRestoreStatus((current) => ({ ...current, pending: false }));
                          setBackupMessage("Pending restore cancelled.");
                        })
                        .catch((error) =>
                          setBackupMessage(error instanceof Error ? error.message : String(error)),
                        )
                        .finally(() => setBackupBusy(false));
                    }}
                  >
                    Cancel pending restore
                  </button>
                )}
              </div>
              {!(
                typeof window !== "undefined" &&
                Boolean((window as Window & { auxHostProof?: unknown }).auxHostProof)
              ) && (
                <div className="row">
                  <button
                    className="btn sm ghost"
                    disabled={backupBusy}
                    onClick={() => {
                      setBackupBusy(true);
                      setBackupMessage("");
                      void bridge
                        .exportMigrationLayout(JSON.stringify(useStore.getState().layout))
                        .then((result) =>
                          setBackupMessage(
                            result ? `Migration layout saved to ${result.path}` : "Layout export cancelled.",
                          ),
                        )
                        .catch((error) =>
                          setBackupMessage(error instanceof Error ? error.message : String(error)),
                        )
                        .finally(() => setBackupBusy(false));
                    }}
                  >
                    Export layout for Chromium migration…
                  </button>
                </div>
              )}
              {typeof window !== "undefined" &&
                Boolean((window as Window & { auxHostProof?: unknown }).auxHostProof) && <MigrationImport />}
              <label>
                Keep complete backups
                <select
                  aria-label="Backup retention"
                  value={backupKeep}
                  disabled={backupBusy}
                  onChange={(event) => {
                    const keep = Number(event.target.value) as 3 | 5 | 10 | 20;
                    setBackupBusy(true);
                    void call("installation.setBackupRetention", { keep })
                      .then((value) => setBackupKeep(value.keep as 3 | 5 | 10 | 20))
                      .catch((error) =>
                        setBackupMessage(error instanceof Error ? error.message : String(error)),
                      )
                      .finally(() => setBackupBusy(false));
                  }}
                >
                  {([3, 5, 10, 20] as const).map((keep) => (
                    <option key={keep} value={keep}>
                      Keep {keep}
                    </option>
                  ))}
                </select>
              </label>
              {backups.length > 0 && (
                <details>
                  <summary>
                    {backups.length} local backup{backups.length === 1 ? "" : "s"}
                  </summary>
                  {backups.map((item) => (
                    <div className="hint" key={item.path}>
                      {new Date(item.createdAt).toLocaleString()} · schema {item.schemaVersion} ·{" "}
                      {item.artifactFiles} artifacts
                      {item.missingArtifacts ? ` · ${item.missingArtifacts} unavailable` : ""}
                      <button
                        className="btn sm"
                        disabled={backupBusy || restoreStatus.pending}
                        onClick={() => {
                          setBackupBusy(true);
                          setBackupMessage("");
                          void call("installation.stageRestore", { path: item.path })
                            .then((result) => {
                              setRestoreStatus((current) => ({ ...current, pending: true }));
                              setBackupMessage(
                                `Restore staged from ${item.name}. Quit Aux normally and reopen it to apply.`,
                              );
                              return result;
                            })
                            .catch((error) =>
                              setBackupMessage(error instanceof Error ? error.message : String(error)),
                            )
                            .finally(() => setBackupBusy(false));
                        }}
                      >
                        Restore this backup
                      </button>
                      {deleteBackupName === item.name ? (
                        <>
                          <span>Delete this local backup?</span>
                          <button
                            className="btn sm"
                            disabled={backupBusy || restoreStatus.pending}
                            onClick={() => {
                              setBackupBusy(true);
                              setBackupMessage("");
                              void call("installation.deleteBackup", {
                                name: item.name,
                                expectedSha256: item.sha256,
                              })
                                .then(() => call("installation.listBackups", {}))
                                .then((value) => {
                                  setBackups(value);
                                  setDeleteBackupName(null);
                                  setBackupMessage("Local backup deleted.");
                                })
                                .catch((error) =>
                                  setBackupMessage(error instanceof Error ? error.message : String(error)),
                                )
                                .finally(() => setBackupBusy(false));
                            }}
                          >
                            Delete backup
                          </button>
                          <button
                            className="btn sm ghost"
                            disabled={backupBusy}
                            onClick={() => setDeleteBackupName(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn sm ghost"
                          disabled={backupBusy || restoreStatus.pending}
                          onClick={() => setDeleteBackupName(item.name)}
                        >
                          Delete…
                        </button>
                      )}
                    </div>
                  ))}
                </details>
              )}
              {restoreStatus.pending && (
                <output className="hint">
                  A restore is staged for the next launch. Changes made before quitting will be replaced.
                </output>
              )}
              {restoreStatus.lastAppliedAt && (
                <span className="hint">
                  Last restored {new Date(restoreStatus.lastAppliedAt).toLocaleString()}. Aux kept a private
                  recovery snapshot of the prior runtime database.
                </span>
              )}
              {backupMessage && <output className="hint">{backupMessage}</output>}
            </Field>
          </section>
        </div>
      </div>
    </section>
  );
}
