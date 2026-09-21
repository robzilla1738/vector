import { WebsiteSizes } from "./WebsiteSizes";
import { QuickAskSetting } from "./QuickAskSetting";
import { BrowserProfiles } from "./BrowserProfiles";
import { SearchEngineSetting } from "./SearchEngineSetting";
import { ClearHistory } from "./ClearHistory";
import { MemorySettings } from "./MemorySettings";
import type { ModelProvider } from "@vector/contracts";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useStore, call, toast, errToast } from "../store";
import { bridge, emptyBrowserHealthSummary, type BrowserHealthSummary } from "../bridge";
import { engineModeLabel, readEngineMode, type EngineMode } from "../engine";
import { I } from "./icons";
import { SitePermissions } from "./SitePermissions";
import { ExternalAgents } from "./ExternalAgents";
import { Extensions } from "./Extensions";
import { VaultSettings } from "./VaultSettings";
import { searchSettings, type SettingsDestination } from "../settings-search";
import { moveListFocus } from "../keyboard-list";

/** what settings.get returns in place of the real key */
const KEY_MASK = "••••••••";

interface ModelEntry { id: string; name?: string }

const KNOWN_PLANNER_MODELS: ModelEntry[] = [
  { id: "alibaba/qwen3.8-27b", name: "Qwen 3.8 27B" },
  { id: "openai/gpt-5.6-luna-fast", name: "GPT 5.6 Luna Fast" },
];

const TURN_OPTIONS = [8, 16, 32, 64, 128, 0];

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
interface ProbeResult { ok: boolean; modelId: string; latencyMs?: number; vision?: boolean; error?: string; checkedAt?: number }
interface GithubProbe { login:string;accountId:number;name:string|null;avatarUrl:string;scopes:string[];checkedAt:number }
interface VercelProbe {user:{id:string;name:string;email:string};teams:{id:string;name:string;slug:string}[];checkedAt:number}
interface VercelProject {id:string;name:string;framework:string|null;updatedAt:number;teamId:string|null}
interface SentryProbe {organizations:{id:string;name:string;slug:string;regionUrl:string}[];checkedAt:number}
interface SentryProject {id:string;name:string;slug:string;platform:string|null;organization:string}
interface CookieImportResult { ok: boolean; source: string; imported: number; skipped: number; domains: number; detail?: string }

function projectScope(settings:Record<string,unknown>,service:"vercel"|"sentry",scope?:string){
  return JSON.stringify([scope??String(settings[service==="vercel"?"vercelTeamId":"sentryOrganization"]??""),settings[`${service}Probe`],settings[`${service}Credential`]]);
}

function activateRadioOnArrow(event: React.KeyboardEvent<HTMLDivElement>) {
  if (event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
  const radios = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')].filter(radio => !radio.disabled);
  const index = radios.indexOf(event.target as HTMLButtonElement);
  if (index < 0 || !radios.length) return;
  event.preventDefault();
  const backwards = event.key === "ArrowLeft" || event.key === "ArrowUp";
  const next = event.key === "Home" ? 0 : event.key === "End" ? radios.length - 1 : (index + (backwards ? -1 : 1) + radios.length) % radios.length;
  radios[next]?.focus();
  radios[next]?.click();
}

function Field({ label, hint, children }: { label: string; hint?: React.ReactNode; children: React.ReactNode }) {
  const id=useId();
  return (
    <div className="field" data-setting={label} tabIndex={-1} role="group" aria-labelledby={`${id}-label`} aria-describedby={hint?`${id}-hint`:undefined}>
      <span id={`${id}-label`} className="setting-label">{label}</span>
      {children}
      {hint && <span id={`${id}-hint`} className="hint">{hint}</span>}
    </div>
  );
}

type ConnectionTab = "Models" | "Services" | "Agents" | "Vault";
const connectionCategories = ["Models", "Connections", "External agents", "Vault"];
export function Settings() {
  const initialCategory = useRef(useStore.getState().settingsCategory).current;
  const [category, setCategory] = useState(connectionCategories.includes(initialCategory) ? "Connections" : initialCategory);
  const [connectionTab, setConnectionTab] = useState<ConnectionTab>(initialCategory === "External agents" ? "Agents" : initialCategory === "Connections" ? "Services" : "Models");
  function openCategory(name: string) {
    setCategory(connectionCategories.includes(name) ? "Connections" : name);
    if (connectionCategories.includes(name)) setConnectionTab(name === "Models" ? "Models" : name === "External agents" ? "Agents" : name === "Vault" ? "Vault" : "Services");
  }
  const [query, setQuery] = useState("");
  const searching = !!query.trim();
  const results = searchSettings(query);
  const visible = (name: string) => !searching && (connectionCategories.includes(name)
    ? category === "Connections" && connectionTab === (name === "Models" ? "Models" : name === "External agents" ? "Agents" : name === "Vault" ? "Vault" : "Services")
    : category === name);
  const [destination, setDestination] = useState<SettingsDestination | null>(null);
  const settings = useStore((s) => s.settings);
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const setOverlay = useStore((s) => s.setOverlay);
  const refresh = async () => {
    const previous = useStore.getState().settings;
    const latest = await call<Record<string,unknown>>("settings.get");
    if (useStore.getState().settings === previous) useStore.setState({settings:latest});
  };
  const [key, setKey] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const [switchingProvider, setSwitchingProvider] = useState(false);
  const provider = (settings.modelProvider as ModelProvider) ?? "gateway";
  const providerNames: Record<ModelProvider, string> = { gateway: "Vercel AI Gateway", openai: "OpenAI", anthropic: "Anthropic", google: "Google", "openai-compatible": "OpenAI-compatible" };
  const [connectionError, setConnectionError] = useState("");
  const [modelDraft, setModelDraft] = useState(String(settings.plannerModel ?? ""));
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
  const [probing, setProbing] = useState(false);
  const [dataDir, setDataDir] = useState("");
  const [diagnosticsBusy,setDiagnosticsBusy]=useState(false);
  const [diagnosticsMessage,setDiagnosticsMessage]=useState('');
  const [backupBusy,setBackupBusy]=useState(false);
  const [backupMessage,setBackupMessage]=useState('');
  const [restoreStatus,setRestoreStatus]=useState<{pending:boolean;lastAppliedAt?:number}>({pending:false});
  const [backups,setBackups]=useState<{path:string;name:string;createdAt:number;bytes:number;schemaVersion:number;artifactFiles:number;missingArtifacts:number}[]>([]);
  const [backupKeep,setBackupKeep]=useState<3|5|10|20>(10);
  const [health,setHealth]=useState<BrowserHealthSummary>(()=>emptyBrowserHealthSummary());
  const [healthBusy,setHealthBusy]=useState(false);
  const [cookieImport, setCookieImport] = useState<{ busy: boolean; result?: CookieImportResult; error?: string }>({ busy: false });
  const [githubToken,setGithubToken]=useState('');
  const [githubBusy,setGithubBusy]=useState(false);
  const [githubError,setGithubError]=useState('');
  const [vercelToken,setVercelToken]=useState('');
  const [vercelBusy,setVercelBusy]=useState(false);
  const [vercelError,setVercelError]=useState('');
  const [vercelProjects,setVercelProjects]=useState<VercelProject[]>([]);
  const [vercelProjectsScope,setVercelProjectsScope]=useState("");
  const vercelProjectRequest=useRef(0);
  const visibleVercelProjects=vercelProjectsScope===projectScope(settings,"vercel")?vercelProjects:[];
  const [sentryToken,setSentryToken]=useState('');
  const [sentryBusy,setSentryBusy]=useState(false);
  const [sentryError,setSentryError]=useState('');
  const [sentryProjects,setSentryProjects]=useState<SentryProject[]>([]);
  const [sentryProjectsScope,setSentryProjectsScope]=useState("");
  const sentryProjectRequest=useRef(0);
  const visibleSentryProjects=sentryProjectsScope===projectScope(settings,"sentry")?sentryProjects:[];
  useEffect(()=>()=>{++vercelProjectRequest.current;++sentryProjectRequest.current;},[]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => previous?.focus();
  }, []);

  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [category, query, connectionTab]);

  useLayoutEffect(() => {
    if (!destination || searching) return;
    const section = scrollRef.current?.querySelector<HTMLElement>(':scope > section:not([hidden])');
    const target = destination.target
      ? [...(section?.querySelectorAll<HTMLElement>('[data-setting]') ?? [])].find(node => node.dataset.setting === destination.target)
      : section;
    const details = target?.closest('details');
    if (details) details.open = true;
    if (target) {
      target.scrollIntoView({ block: 'center' });
      target.focus({ preventScroll: true });
    } else section?.scrollIntoView({ block: 'start' });
    setDestination(null);
  }, [destination, searching]);

  useEffect(() => {
    if (searching || category !== "General") return;
    let live = true;
    void bridge.dataDir().then(value=>{if(live)setDataDir(value);}).catch(error=>{if(live)errToast(error);});
    void bridge.runtimeRestoreStatus().then(value=>{if(live)setRestoreStatus(value);}).catch(()=>{});
    void call<{path:string;name:string;createdAt:number;bytes:number;schemaVersion:number;artifactFiles:number;missingArtifacts:number}[]>("installation.listBackups", {}).then(value=>{if(live)setBackups(value);}).catch(()=>{});
    void call<{keep:3|5|10|20}>("installation.backupRetention", {}).then(value=>{if(live)setBackupKeep(value.keep);}).catch(()=>{});
    void bridge.healthSummary().then(value=>{if(live)setHealth(value);}).catch(()=>{});
    return()=>{live=false;};
  }, [category, searching]);

  useEffect(() => {
    if(searching||category!=="Connections"||connectionTab!=="Models")return;
    const sequence=++modelsSequence.current;
    setModels([]);setModelsBusy(true);
    void call<{models:ModelEntry[]}>("models.list").then(result=>{
      if(sequence===modelsSequence.current)setModels(result.models);
    }).catch(()=>{}).finally(()=>{if(sequence===modelsSequence.current)setModelsBusy(false);});
    return()=>{++modelsSequence.current;};
  },[category,connectionTab,searching,provider,settings.compatibleEndpoint,settings.modelApiKey]);

  useEffect(() => { setModelDraft(String(settings.plannerModel ?? "")); }, [settings.plannerModel, provider]);
  useEffect(() => { setEndpointDraft(String(settings.compatibleEndpoint ?? "")); }, [settings.compatibleEndpoint, provider]);
  useEffect(() => () => { probeSequence.current++; }, []);

  const loadVercelProjects=async(teamId=String(useStore.getState().settings.vercelTeamId??""))=>{
    const request=++vercelProjectRequest.current;
    const scope=projectScope(useStore.getState().settings,"vercel",teamId);
    const current=()=>request===vercelProjectRequest.current&&scope===projectScope(useStore.getState().settings,"vercel");
    setVercelBusy(true);setVercelError("");
    try{
      const projects=await call<VercelProject[]>("vercel.projects",teamId?{teamId}:{});
      if(current()){setVercelProjects(projects);setVercelProjectsScope(scope);}
    }catch(error){if(current())setVercelError(error instanceof Error?error.message:String(error));}
    finally{if(request===vercelProjectRequest.current)setVercelBusy(false);}
  };
  const loadSentryProjects=async(organization=String(useStore.getState().settings.sentryOrganization??""))=>{
    const request=++sentryProjectRequest.current;
    if(!organization){setSentryProjects([]);setSentryBusy(false);return;}
    const scope=projectScope(useStore.getState().settings,"sentry",organization);
    const current=()=>request===sentryProjectRequest.current&&scope===projectScope(useStore.getState().settings,"sentry");
    setSentryBusy(true);setSentryError("");
    try{
      const projects=await call<SentryProject[]>("sentry.projects",{organization});
      if(current()){setSentryProjects(projects);setSentryProjectsScope(scope);}
    }catch(error){if(current())setSentryError(error instanceof Error?error.message:String(error));}
    finally{if(request===sentryProjectRequest.current)setSentryBusy(false);}
  };

  const set = async (patch: Record<string, unknown>) => {
    if ("gatewayApiKey" in patch || "plannerModel" in patch || "modelProvider" in patch || "modelCredential" in patch || "compatibleEndpoint" in patch) { probeSequence.current++; setProbe(null); }
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
    setSavingKey(true); setConnectionError("");
    const ok = await set({ modelCredential: { provider, key: key.trim() } });
    if (ok) setKey("");
    else setConnectionError("The key was not saved. Your entry is still here; resolve the storage error and try again.");
    setSavingKey(false);
  };

  const runProbe = async () => {
    const sequence = ++probeSequence.current;
    setProbing(true);
    setProbe(null);
    try {
      const result = await call<ProbeResult>("models.probe", { modelId: (settings.plannerModel as string) || undefined });
      if (sequence === probeSequence.current) setProbe({ ...result, checkedAt: Date.now() });
    } catch (e) {
      if (sequence === probeSequence.current) setProbe({ ok: false, modelId: "", error: e instanceof Error ? e.message : String(e) });
    }
    setProbing(false);
  };

  const discoverModels = async () => {
    if(modelsBusy)return;
    const sequence=++modelsSequence.current;
    setModelsBusy(true); setConnectionError("");
    try {
      const result = await call<{ models: ModelEntry[] }>("models.list");
      if(sequence!==modelsSequence.current)return;
      setModels(result.models);
      if (!result.models.length) setConnectionError("The endpoint returned no models.");
    } catch (error) { if(sequence===modelsSequence.current)setConnectionError(error instanceof Error ? error.message : String(error)); }
    finally { if(sequence===modelsSequence.current)setModelsBusy(false); }
  };

  const theme = (settings.theme as string) ?? "dark";
  const plannerModel = (settings.plannerModel as string) ?? "alibaba/qwen3.8-27b";
  const plannerOptions: ModelEntry[] = provider === "gateway" ? mergeModelOptions(models, plannerModel)
    : [...models, ...[plannerModel, String(settings.visionModel ?? "")].filter(Boolean).map(id => ({ id }))]
      .filter((model, index, all) => all.findIndex(item => item.id === model.id) === index);
  const turnValue = (settings.maxModelCalls as number) ?? 8;
  const turnOptions = TURN_OPTIONS.includes(turnValue) ? TURN_OPTIONS : [turnValue, ...TURN_OPTIONS];
  const hasKey = settings.modelApiKey === KEY_MASK || (provider === "gateway" && settings.gatewayApiKey === KEY_MASK);
  const localCompatible = provider === "openai-compatible" && (() => {
    try { return ["localhost", "127.0.0.1", "[::1]"].includes(new URL(String(settings.compatibleEndpoint ?? "")).hostname); }
    catch { return false; }
  })();
  const connectionReady = hasKey || localCompatible;
  const engineMode = readEngineMode(settings);

  return (
    <div className="settings-page" role="region" aria-label="Settings" ref={dialogRef}>
      <nav className="settings-nav" aria-label="Settings categories" onKeyDown={event => moveListFocus(event, "button")}>
        <input aria-label="Search settings" placeholder="Search settings…" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={event => {
          if (event.nativeEvent.isComposing || !searching) return;
          if (event.key === "ArrowDown" || event.key === "Enter") {
            event.preventDefault(); event.stopPropagation();
            dialogRef.current?.querySelector<HTMLButtonElement>(".settings-search-result")?.focus();
          }
        }}/>
        <span>Preferences</span>
        {["General", "Appearance", "Memory", "Connections", "Site permissions", "Agent permissions", "Extensions", "Engine"].map(name => <button key={name} aria-current={!searching && category === name ? "page" : undefined} onClick={() => { setCategory(name); setQuery(""); if (scrollRef.current) scrollRef.current.scrollTop = 0; }}><span className="settings-category-icon">{({ General: I.gear, Appearance: I.sun, Memory: I.chats, Models: I.model, Connections:I.globe, "Site permissions": I.globe, "Agent permissions": I.lock, "External agents": I.chats, Extensions: I.extension, Engine: I.cpu } as Record<string, React.ReactNode>)[name]}</span>{name}</button>)}
      </nav>
      <div className="settings-content">
        <div className="drawer-head">
          <h3>{searching ? "Search settings" : category}</h3>
          <span className="sp" />
          {saved && <span className="saved">{I.check} Saved</span>}
          <button className="icon-btn" title="Close (Esc)" aria-label="Close settings" onClick={() => setOverlay(null)}>{I.close}</button>
        </div>

        {!searching && category === "Connections" && <div className="settings-connection-tabs" role="tablist" aria-label="Connection types" onKeyDown={event => moveListFocus(event, '[role="tab"]', false)}>
          {(["Models", "Services", "Vault", "Agents"] as const).map(tab => <button key={tab} role="tab" id={`connection-tab-${tab}`} aria-controls={`connection-panel-${tab}`} aria-selected={connectionTab === tab} tabIndex={connectionTab === tab ? 0 : -1} onClick={() => setConnectionTab(tab)}>{tab}</button>)}
        </div>}
        <div className="settings-scroll" ref={scrollRef} tabIndex={0} aria-label={searching ? "Settings search results" : `${category} settings`}>
        {searching && <div className="settings-search-results">
          <p className="hint" role="status">{results.length ? `${results.length} matching ${results.length === 1 ? "setting" : "settings"}` : `No settings found for “${query.trim()}”. Try theme, privacy, models or backup.`}</p>
          <div onKeyDown={event => moveListFocus(event, "button")}>
            {results.map(result => <button key={`${result.category}:${result.label}`} className="settings-search-result" onClick={() => { openCategory(result.category); setQuery(""); setDestination(result); }}>
              <span className="settings-search-category">{connectionCategories.includes(result.category) ? `Connections · ${result.category === "Connections" ? "Services" : result.category === "External agents" ? "Agents" : result.category === "Vault" ? "Vault" : "Models"}` : result.category}</span><strong>{result.label}</strong><span>{result.description}</span>
            </button>)}
          </div>
        </div>}

        {visible("Memory") && <section tabIndex={-1}><MemorySettings /></section>}
        <section tabIndex={-1} hidden={!visible("Site permissions")}><SitePermissions query="" /></section>
        <section id="connection-panel-Models" role="tabpanel" aria-labelledby="connection-tab-Models" hidden={!visible("Models")}><div className="drawer-section">AI model</div>
        <p role="status" className="field">{probe?.ok ? `${providerNames[provider]} is ready.` : localCompatible ? "Local model endpoint configured. Save a model and test the connection before your first run." : hasKey ? `${providerNames[provider]} key configured. Save a model and test the connection before your first run.` : "Agent setup needed. Browsing, saved tasks, and evidence review are available without a model."}</p>
        <Field label="Model provider" hint="Switching providers changes where task context and screenshots are sent. Each provider keeps its own key and model choices; there is no automatic fallback to another provider.">
          <select aria-label="Model provider" value={provider} disabled={savingKey || probing || switchingProvider} onChange={event => {
            setSwitchingProvider(true);
            void set({ modelProvider: event.target.value }).then(ok => { if (ok) { setKey(""); setModels([]); setConnectionError(""); } }).finally(() => setSwitchingProvider(false));
          }}>{Object.entries(providerNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
        </Field>
        {provider === "openai-compatible" && <Field label="Endpoint" hint="Prompts and screenshots are sent here. Remote endpoints must use HTTPS; localhost may use HTTP.">
          <div className="row">
            <input className="grow" aria-label="OpenAI-compatible endpoint" inputMode="url" autoComplete="url" placeholder="https://example.com/v1" value={endpointDraft}
              disabled={probing || savingKey || switchingProvider} onChange={event => { setEndpointDraft(event.target.value); setProbe(null); }}
              onKeyDown={event => { if (event.key === "Enter" && endpointDraft.trim()) { event.preventDefault(); void set({ compatibleEndpoint: endpointDraft.trim() }); } }} />
            <button className="btn sm" disabled={probing || savingKey || switchingProvider || !endpointDraft.trim() || endpointDraft.trim() === String(settings.compatibleEndpoint ?? "")}
              onClick={() => void set({ compatibleEndpoint: endpointDraft.trim() })}>Save endpoint</button>
            <button className="btn sm" disabled={probing || savingKey || switchingProvider || modelsBusy || !settings.compatibleEndpoint || !connectionReady || endpointDraft.trim() !== String(settings.compatibleEndpoint ?? "")}
              onClick={() => void discoverModels()}>{modelsBusy ? "Discovering…" : "Discover models"}</button>
          </div>
        </Field>}
        {provider !== "openai-compatible" && <span className="hint field">Destination: {String(settings.modelEndpoint ?? "Vercel AI Gateway")}. Enter a model ID available to your account. Use the Agents tab for Codex or Claude Code.</span>}
        <Field label={`${providerNames[provider]} API key`} hint={<>{String((settings.modelCredentialError ?? (provider === "gateway" ? settings.gatewayCredentialError : undefined)) ?? (settings.modelCredentialSource === "environment" ? "Using a process environment key. Change it in your launch environment." : hasKey ? "Key saved with OS encryption." : localCompatible ? "Optional for localhost. Add a key only if your local server requires one." : "No key configured. Saved keys require OS encryption."))}</>}>
          <div className="row">
            <input
              type="password"
              aria-label="Provider API key"
              autoComplete="off"
              disabled={savingKey || probing || switchingProvider}
              className="grow"
              value={key}
              placeholder={hasKey ? "Key saved — enter a new key to replace" : localCompatible ? "Optional for this local endpoint" : "Enter this provider’s API key"}
              onChange={(e) => { setKey(e.target.value); setProbe(null); setConnectionError(""); }}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); void saveKey(); } }}
            />
            <button className="btn sm" disabled={savingKey || probing || switchingProvider || !key.trim() || key === KEY_MASK} onClick={() => void saveKey()}>{savingKey ? "Saving…" : "Save key"}</button>
            {settings.modelCredentialSource !== "environment" && (hasKey || !!(settings.modelCredentialError ?? (provider === "gateway" ? settings.gatewayCredentialError : undefined))) && <button className="btn sm" disabled={savingKey || probing || switchingProvider} title="Remove this provider’s saved key" onClick={() => void set({ modelCredential: { provider, key: "" } }).then(ok => { if (ok) toast("Saved provider key removed"); })}>Clear</button>}
          </div>
        </Field>

        {connectionError && <p className="field" role="alert">{connectionError}</p>}
        <Field label="Planner model" hint="Enter the exact model ID for the selected provider. Availability depends on your account.">
          <div className="row">
            <input className="grow" aria-label="Planner model" list="agent-model-options" value={modelDraft} disabled={probing || savingKey || switchingProvider}
              onChange={event => { setModelDraft(event.target.value); setProbe(null); }} />
            <datalist id="agent-model-options">{plannerOptions.map(model => <option key={model.id} value={model.id}>{model.name ?? model.id}</option>)}</datalist>
            <button className="btn sm" disabled={probing || savingKey || switchingProvider || !modelDraft.trim() || modelDraft.trim() === plannerModel} onClick={() => void set({ plannerModel: modelDraft.trim() })}>Save model</button>
            <button className="btn sm" disabled={probing || savingKey || switchingProvider || !modelDraft.trim() || !connectionReady || !!key.trim() || modelDraft.trim() !== plannerModel} onClick={() => void runProbe()}>{probing ? "Testing…" : "Test connection"}</button>
          </div>
          {probe && <span role="status" className={`hint model-probe-status ${probe.ok ? "ok" : "err"}`}>
            {probe.ok ? `Connection tested${probe.latencyMs == null ? "" : ` · ${probe.latencyMs} ms`}${probe.vision === true ? " · vision" : probe.vision === false ? " · no vision" : ""}` : `Failed — ${probe.error}`}{probe.checkedAt ? ` · ${new Date(probe.checkedAt).toLocaleString()}` : ""}
          </span>}
        </Field>

        <p className="field hint">Test connection sends small synthetic model requests and may incur provider charges. It does not send your open pages. Save key and model changes before testing.</p>
        <Field label="Vision model" hint="Used for screenshot-based recovery. Select a model that accepts images and confirm its capability with your provider.">
          <input aria-label="Vision model" key={`${provider}:${settings.visionModel}`} defaultValue={String(settings.visionModel ?? "")} placeholder="Same as planner" disabled={switchingProvider || probing || savingKey}
            onBlur={event => { if (event.target.value !== String(settings.visionModel ?? "")) void set({ visionModel: event.target.value.trim() }); }} />
        </Field>

        <div className="row two">
          <Field label="Parallel worker pages">
            <input aria-label="Parallel worker pages" type="number" min={1} max={16} defaultValue={(settings.maxWorkers as number) ?? 4} onBlur={(e) => void set({ maxWorkers: Number(e.target.value) })} />
          </Field>
          <Field label="Max model turns per run" hint="How many planner calls a run may make. No limit keeps going until the goal finishes or you stop it.">
            <select
              aria-label="Max model turns per run"
              value={String(turnValue)}
              onChange={(e) => void set({ maxModelCalls: Number(e.target.value) })}
            >
              {turnOptions.map((n) => (
                <option key={n} value={n}>{n === 0 ? "No limit" : String(n)}</option>
              ))}
            </select>
          </Field>
        </div>


        </section><section id="connection-panel-Services" role="tabpanel" aria-labelledby="connection-tab-Services" hidden={!visible("Connections")}><div className="drawer-section">GitHub</div>
        <p className="field hint">Connect an explicitly supplied token for account and repository checks. Aux does not inspect GitHub CLI, Keychain, browser cookies, or other credential stores. Remote writes remain disabled.</p>
        {!!settings.githubProbe&&<div className="field" role="status"><strong>{String((settings.githubProbe as GithubProbe).name??(settings.githubProbe as GithubProbe).login)}</strong><span className="hint">@{String((settings.githubProbe as GithubProbe).login)} · checked {new Date((settings.githubProbe as GithubProbe).checkedAt).toLocaleString()}</span><span className="hint">{(settings.githubProbe as GithubProbe).scopes.length?`Reported scopes: ${(settings.githubProbe as GithubProbe).scopes.join(', ')}`:'GitHub did not report classic OAuth scopes. Repository access still follows the token’s configured grants.'}</span></div>}
        <Field label="GitHub token" hint={String(settings.githubCredentialError??(settings.githubCredential===KEY_MASK?'Saved with OS encryption. The token is never returned to this page.':'Use a fine-grained token limited to the repositories Aux should inspect.'))}>
          <div className="row"><input className="grow" type="password" aria-label="GitHub token" autoComplete="off" value={githubToken} placeholder={settings.githubCredential===KEY_MASK?'Token saved — enter a new token to replace':'Enter a fine-grained GitHub token'} onChange={event=>{setGithubToken(event.target.value);setGithubError('');}} />
          <button className="btn sm" disabled={githubBusy||!githubToken.trim()} onClick={()=>{setGithubBusy(true);setGithubError('');void set({githubCredential:githubToken.trim()}).then(ok=>{if(ok)setGithubToken('');}).finally(()=>setGithubBusy(false));}}>Save token</button>
          {settings.githubCredential===KEY_MASK&&<button className="btn sm" disabled={githubBusy} onClick={()=>{setGithubBusy(true);setGithubError('');void set({githubCredential:''}).then(ok=>{if(ok)toast('GitHub disconnected');}).finally(()=>setGithubBusy(false));}}>Disconnect</button>}</div>
        </Field>
        <div className="field"><button className="btn sm" disabled={githubBusy||settings.githubCredential!==KEY_MASK||!!githubToken.trim()} onClick={()=>{setGithubBusy(true);setGithubError('');void call<GithubProbe>('github.probe',{}).then(()=>refresh()).catch(error=>setGithubError(error instanceof Error?error.message:String(error))).finally(()=>setGithubBusy(false));}}>{githubBusy?'Checking…':'Check connection'}</button>{githubError&&<span className="hint err" role="alert">{githubError}</span>}</div>

        <div className="drawer-section">Vercel</div>
        <p className="field hint">Read deployment health from an explicitly supplied Vercel token. Aux cannot deploy, promote, roll back, or change a project through this connection.</p>
        {!!settings.vercelProbe&&<div className="field" role="status"><strong>{String((settings.vercelProbe as VercelProbe).user.name)}</strong><span className="hint">{String((settings.vercelProbe as VercelProbe).user.email)} · checked {new Date((settings.vercelProbe as VercelProbe).checkedAt).toLocaleString()}</span></div>}
        <Field label="Vercel token" hint={String(settings.vercelCredentialError??(settings.vercelCredential===KEY_MASK?'Saved with OS encryption.':'Use a read-only token for the account Aux should inspect.'))}><div className="row"><input className="grow" type="password" aria-label="Vercel token" autoComplete="off" value={vercelToken} placeholder={settings.vercelCredential===KEY_MASK?'Token saved — enter a new token to replace':'Enter a Vercel token'} onChange={event=>{setVercelToken(event.target.value);setVercelError('');}}/><button className="btn sm" disabled={vercelBusy||!vercelToken.trim()} onClick={()=>{setVercelBusy(true);void set({vercelCredential:vercelToken.trim()}).then(ok=>{if(ok)setVercelToken('');}).finally(()=>setVercelBusy(false));}}>Save token</button>{settings.vercelCredential===KEY_MASK&&<button className="btn sm" disabled={vercelBusy} onClick={()=>{setVercelBusy(true);void set({vercelCredential:''}).then(ok=>{if(ok){setVercelProjects([]);toast('Vercel disconnected');}}).finally(()=>setVercelBusy(false));}}>Disconnect</button>}</div></Field>
        <div className="field"><button className="btn sm" disabled={vercelBusy||settings.vercelCredential!==KEY_MASK||!!vercelToken.trim()} onClick={()=>{setVercelBusy(true);setVercelError('');void call<VercelProbe>('vercel.probe',{}).then(async()=>{await refresh();await loadVercelProjects();}).catch(error=>setVercelError(error instanceof Error?error.message:String(error))).finally(()=>setVercelBusy(false));}}>{vercelBusy?'Checking…':'Check connection'}</button>{vercelError&&<span className="hint err" role="alert">{vercelError}</span>}</div>
        {settings.vercelCredential===KEY_MASK&&!!settings.vercelProbe&&<><Field label="Vercel scope" hint="Choose the personal account or team that owns the project."><select aria-label="Vercel scope" value={String(settings.vercelTeamId??'')} onChange={event=>{const value=event.target.value;void set({vercelTeamId:value,vercelProjectId:''}).then(ok=>{if(ok)void loadVercelProjects(value);});}}><option value="">Personal account</option>{(settings.vercelProbe as VercelProbe).teams.map(team=><option key={team.id} value={team.id}>{team.name}</option>)}</select></Field><Field label="Vercel project" hint="The selected project is used for task-scoped deployment health."><div className="row"><select className="grow" aria-label="Vercel project" value={String(settings.vercelProjectId??'')} onFocus={()=>{if(!visibleVercelProjects.length&&!vercelBusy)void loadVercelProjects();}} onChange={event=>void set({vercelProjectId:event.target.value})}><option value="">Select project</option>{visibleVercelProjects.map(project=><option key={project.id} value={project.id}>{project.name}{project.framework?` · ${project.framework}`:''}</option>)}</select><button className="btn sm" disabled={vercelBusy} onClick={()=>void loadVercelProjects()}>Refresh</button></div></Field></>}

        <div className="drawer-section">Sentry</div>
        <p className="field hint">Read unresolved issue health from an explicitly supplied Sentry token. Aux cannot resolve, assign, delete, or change issues through this connection.</p>
        {!!settings.sentryProbe&&<div className="field" role="status"><strong>{(settings.sentryProbe as SentryProbe).organizations.length} organization{(settings.sentryProbe as SentryProbe).organizations.length===1?'':'s'} available</strong><span className="hint">Checked {new Date((settings.sentryProbe as SentryProbe).checkedAt).toLocaleString()}</span></div>}
        <Field label="Sentry token" hint={String(settings.sentryCredentialError??(settings.sentryCredential===KEY_MASK?'Saved with OS encryption.':'Use a token with organization, project, and event read access.'))}><div className="row"><input className="grow" type="password" aria-label="Sentry token" autoComplete="off" value={sentryToken} placeholder={settings.sentryCredential===KEY_MASK?'Token saved — enter a new token to replace':'Enter a Sentry token'} onChange={event=>{setSentryToken(event.target.value);setSentryError('');}}/><button className="btn sm" disabled={sentryBusy||!sentryToken.trim()} onClick={()=>{setSentryBusy(true);void set({sentryCredential:sentryToken.trim()}).then(ok=>{if(ok)setSentryToken('');}).finally(()=>setSentryBusy(false));}}>Save token</button>{settings.sentryCredential===KEY_MASK&&<button className="btn sm" disabled={sentryBusy} onClick={()=>{setSentryBusy(true);void set({sentryCredential:''}).then(ok=>{if(ok){setSentryProjects([]);toast('Sentry disconnected');}}).finally(()=>setSentryBusy(false));}}>Disconnect</button>}</div></Field>
        <div className="field"><button className="btn sm" disabled={sentryBusy||settings.sentryCredential!==KEY_MASK||!!sentryToken.trim()} onClick={()=>{setSentryBusy(true);setSentryError('');void call<SentryProbe>('sentry.probe',{}).then(refresh).catch(error=>setSentryError(error instanceof Error?error.message:String(error))).finally(()=>setSentryBusy(false));}}>{sentryBusy?'Checking…':'Check connection'}</button>{sentryError&&<span className="hint err" role="alert">{sentryError}</span>}</div>
        {settings.sentryCredential===KEY_MASK&&!!settings.sentryProbe&&<><Field label="Sentry organization"><select aria-label="Sentry organization" value={String(settings.sentryOrganization??'')} onChange={event=>{const value=event.target.value;void set({sentryOrganization:value,sentryProject:''}).then(ok=>{if(ok)void loadSentryProjects(value);});}}><option value="">Select organization</option>{(settings.sentryProbe as SentryProbe).organizations.map(org=><option key={org.id} value={org.slug}>{org.name}</option>)}</select></Field>{settings.sentryOrganization&&<Field label="Sentry project" hint="The selected project is used for task-scoped unresolved issue health."><div className="row"><select className="grow" aria-label="Sentry project" value={String(settings.sentryProject??'')} onFocus={()=>{if(!visibleSentryProjects.length&&!sentryBusy)void loadSentryProjects();}} onChange={event=>void set({sentryProject:event.target.value})}><option value="">Select project</option>{visibleSentryProjects.map(project=><option key={project.id} value={project.slug}>{project.name}{project.platform?` · ${project.platform}`:''}</option>)}</select><button className="btn sm" disabled={sentryBusy} onClick={()=>void loadSentryProjects()}>Refresh</button></div></Field>}</>}
        </section><section tabIndex={-1} id="connection-panel-Vault" role="tabpanel" aria-labelledby="connection-tab-Vault" hidden={!visible("Vault")}><VaultSettings /></section>
        <section tabIndex={-1} id="connection-panel-Agents" role="tabpanel" aria-labelledby="connection-tab-Agents" hidden={!visible("External agents")}><ExternalAgents /></section>
        <section tabIndex={-1} hidden={!visible("Extensions")}><Extensions /></section>

        <section className="appearance-preferences" hidden={!visible("Appearance")}><div className="drawer-section">Appearance</div>
        <Field label="Theme">
          <div className="seg" role="radiogroup" aria-label="Theme" onKeyDown={activateRadioOnArrow}>
            {(["system", "dark", "light"] as const).map((t) => (
              <button key={t} role="radio" aria-checked={theme === t} tabIndex={theme === t ? 0 : -1} className={theme === t ? "on" : ""} onClick={() => void set({ theme: t })}>{t === "system" ? "System" : t === "dark" ? "Dark" : "Light"}</button>
            ))}
          </div>
        </Field>

        <Field label="Sidebar appearance" hint="Solid keeps the browser crisp. Custom lets you adjust the surrounding surface; pages and menus stay opaque."><select aria-label="Sidebar appearance" value={String(settings.sidebarAppearance ?? "solid")} onChange={e => void set({ sidebarAppearance: e.target.value })}><option value="solid">Solid</option><option value="translucent">Custom</option></select></Field>
        {settings.sidebarAppearance === "translucent" && <>
          <Field label="Surface opacity"><div className="appearance-range"><input aria-label="Surface opacity" type="range" min="40" max="100" value={Number(settings.sidebarOpacity ?? 90)} onChange={e => void set({ sidebarOpacity: Number(e.target.value) })} /><output>{Number(settings.sidebarOpacity ?? 90)}%</output></div></Field>
          <Field label="Surface blur" hint="Adds softness within the shell. macOS may also apply its native window material. Reduce Transparency uses solid surfaces."><div className="appearance-range"><input aria-label="Surface blur" type="range" min="0" max="40" value={Number(settings.sidebarBlur ?? 0)} onChange={e => void set({ sidebarBlur: Number(e.target.value) })} /><output>{Number(settings.sidebarBlur ?? 0)}px</output></div></Field>
        </>}
        <Field label="Tab layout" hint="Both layouts use the same tabs, folders, and current selection."><select aria-label="Tab layout" value={String(settings.tabLayout ?? "vertical")} onChange={e => void set({ tabLayout: e.target.value })}><option value="vertical">Vertical</option><option value="horizontal">Horizontal</option></select></Field>
        <Field label="Website sizes"><WebsiteSizes /></Field>
        </section><section hidden={!visible("Engine")}><div className="drawer-section">Engine</div>
        <Field label="Aux Engine" hint={engineModeLabel(engineMode)}>
          <div className="seg" role="radiogroup" aria-label="Engine mode" onKeyDown={activateRadioOnArrow}>
            {(["off", "auto", "always"] as EngineMode[]).map((m) => (
              <button key={m} role="radio" aria-checked={engineMode === m} tabIndex={engineMode === m ? 0 : -1} className={engineMode === m ? "on" : ""} onClick={() => void set({ engineMode: m })}>
                {m === "off" ? "Off" : m === "auto" ? "Auto" : "Always"}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Qualified engine sites" hint="Comma-separated origins, hosts, or wildcards such as docs.example.com and *.internal.example. Other sites use Chromium in Auto mode.">
          <input
            aria-label="Qualified engine sites"
            type="text"
            defaultValue={Array.isArray(settings.engineCohorts) ? settings.engineCohorts.join(", ") : ""}
            placeholder="docs.example.com, *.internal.example"
            onBlur={(event) => void set({
              engineCohorts: event.currentTarget.value.split(",").map((value) => value.trim()).filter(Boolean),
            })}
          />
        </Field>

        </section><section hidden={!visible("Agent permissions")}><div className="drawer-section">Agent permissions</div>
        <Field
          label="What the agent may do"
          hint="These are the permissions used when you start a run. Turn Write off for read-only work. Navigation and Evaluate require separate grants. Page content and models cannot add permissions."
        >
          <div className="seg wrap" role="group" aria-label="Agent effect grants" data-testid="effect-grants">
            {([
              ["effect:read", "Read", true],
              ["effect:write", "Write", false],
              ["effect:egress", "Navigate", false],
              ["effect:destructive", "Evaluate", false],
            ] as const).map(([key, label, locked]) => {
              const grants = (settings.effectGrants as string[] | undefined) ?? [
                "effect:read",
              ];
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

        </section><section hidden={!visible("General")}><div className="drawer-section">Browsing</div>
        <Field label="Search engine">
          <SearchEngineSetting value={(settings.searchEngine as string) ?? "https://duckduckgo.com/?q=%s"} onSave={searchEngine => set({ searchEngine })} />
        </Field>

        <Field label="Import Chrome sign-ins" hint={cookieImport.result?.detail ?? "Import available sign-in cookies from Chrome. macOS may ask for keychain access; some sites may require you to sign in again."}>
          <div className="row">
            <button
              className="btn sm"
              disabled={cookieImport.busy}
              onClick={() => {
                setCookieImport({ busy: true });
                void call<CookieImportResult>("chrome.importCookies", { source: "auto" })
                  .then((r) => setCookieImport({ busy: false, result: r }))
                  .catch((e) => setCookieImport({ busy: false, error: e instanceof Error ? e.message : String(e) }));
              }}
            >
              {cookieImport.busy ? "Importing…" : "Import from Chrome"}
            </button>
            {cookieImport.result && <span className="hint ok">{cookieImport.result.imported} imported · {cookieImport.result.domains} domains</span>}
            {cookieImport.error && <span className="hint err">{cookieImport.error}</span>}
          </div>
        </Field>

        <Field label="Quick Ask"><QuickAskSetting /></Field>
        <Field label="Browser profiles"><BrowserProfiles /></Field>

        <Field label="Task data backup" hint="Backs up chats, tasks, Spaces, saved evidence, browsing records and preferences. Sign-ins, credentials, extensions, downloads, project files and cloud resources are not included. Backups contain private content; keep them somewhere secure. Oldest complete backups are deleted after a new backup. Incomplete folders without a manifest are skipped.">
          <div className="row"><button className="btn sm" disabled={backupBusy} onClick={()=>{setBackupBusy(true);setBackupMessage('');void bridge.exportRuntimeBackup().then(result=>{setBackupMessage(result?`Backup saved · ${result.artifactFiles} artifact files${result.missingArtifacts?` · ${result.missingArtifacts} unavailable`:''} · ${result.bytes} bytes`:'Backup cancelled.');return call("installation.listBackups", {});}).then(value=>{if(Array.isArray(value))setBackups(value as typeof backups);}).catch(error=>setBackupMessage(error instanceof Error?error.message:String(error))).finally(()=>setBackupBusy(false));}}>{backupBusy?'Preparing…':'Create backup…'}</button><button className="btn sm" disabled={backupBusy||restoreStatus.pending} onClick={()=>{setBackupBusy(true);setBackupMessage('');void bridge.stageRuntimeRestore().then(result=>{if(result){setRestoreStatus(current=>({...current,pending:true}));setBackupMessage(`Restore staged with ${result.artifactFiles} artifact files${result.missingArtifacts?`; ${result.missingArtifacts} were unavailable when the backup was created`:''}. Quit Aux normally and reopen it to apply.`);}else setBackupMessage('Restore cancelled.');}).catch(error=>setBackupMessage(error instanceof Error?error.message:String(error))).finally(()=>setBackupBusy(false));}}>Restore backup…</button>{restoreStatus.pending&&<button className="btn sm" disabled={backupBusy} onClick={()=>{setBackupBusy(true);void bridge.cancelRuntimeRestore().then(()=>{setRestoreStatus(current=>({...current,pending:false}));setBackupMessage('Pending restore cancelled.');}).catch(error=>setBackupMessage(error instanceof Error?error.message:String(error))).finally(()=>setBackupBusy(false));}}>Cancel pending restore</button>}</div>
          <label>Keep complete backups<select aria-label="Backup retention" value={backupKeep} disabled={backupBusy} onChange={event=>{const keep=Number(event.target.value) as 3|5|10|20;setBackupBusy(true);void call<{keep:3|5|10|20}>("installation.setBackupRetention",{keep}).then(value=>setBackupKeep(value.keep)).catch(error=>setBackupMessage(error instanceof Error?error.message:String(error))).finally(()=>setBackupBusy(false));}}>{([3,5,10,20] as const).map(keep=><option key={keep} value={keep}>Keep {keep}</option>)}</select></label>
          {backups.length>0&&<details><summary>{backups.length} local backup{backups.length===1?'':'s'}</summary>{backups.map(item=><div className="hint" key={item.path}>{new Date(item.createdAt).toLocaleString()} · schema {item.schemaVersion} · {item.artifactFiles} artifacts{item.missingArtifacts?` · ${item.missingArtifacts} unavailable`:''}<button className="btn sm" disabled={backupBusy||restoreStatus.pending} onClick={()=>{setBackupBusy(true);setBackupMessage('');void call("installation.stageRestore",{path:item.path}).then(result=>{setRestoreStatus(current=>({...current,pending:true}));setBackupMessage(`Restore staged from ${item.name}. Quit Aux normally and reopen it to apply.`);return result;}).catch(error=>setBackupMessage(error instanceof Error?error.message:String(error))).finally(()=>setBackupBusy(false));}}>Restore this backup</button></div>)}</details>}
          {restoreStatus.pending&&<span className="hint" role="status">A restore is staged for the next launch. Changes made before quitting will be replaced.</span>}{restoreStatus.lastAppliedAt&&<span className="hint">Last restored {new Date(restoreStatus.lastAppliedAt).toLocaleString()}. Aux kept a private recovery snapshot of the prior runtime database.</span>}{backupMessage&&<span className="hint" role="status">{backupMessage}</span>}
        </Field>
        <LegacyMigration />

        <details className="settings-advanced">
          <summary>Diagnostics & storage</summary>
        {dataDir && (
          <Field label="Data directory">
            <div className="row">
              <span className="hint mono selectable grow">{dataDir}</span>
              <button className="btn sm" onClick={() => void bridge.revealPath(dataDir)}>Reveal</button>
            </div>
          </Field>
        )}

        <Field label="Browser health" hint={health.samples?`${health.sevenDaySpan?'Seven-day span recorded':`${health.spanDays.toFixed(1)} of 7 days recorded`} · ${Math.round(health.observedMinutes/60)} hours while Aux was open · ${health.sessions} sessions · memory p95 ${Math.round(health.memoryMb.p95)} MB · CPU p95 ${health.cpuPercent.p95.toFixed(1)}% · responsiveness p95 ${Math.round(health.eventLoopLagMs.p95)} ms · ${health.pageCrashes} crashes · ${health.pageUnresponsive} hangs · up to ${health.maxPages} tabs and ${health.maxSuspendedPages} suspended${health.suspensionFailures?` · ${health.suspensionFailures} suspension failures`:''}. This contains only local performance totals, never URLs or page content.`:"Aux records local startup, responsiveness, CPU, memory, window, tab, crash, hang, and suspension totals while it is open. It never records URLs or page content."}>
          <div className="row"><span className="hint grow">{health.samples?`${health.samples.toLocaleString()} private samples${health.startupMs!=null?` · typical startup ${health.startupMs} ms`:''}`:'Recording begins during this session.'}</span><button className="btn sm ghost danger" disabled={healthBusy||!health.samples} onClick={()=>{setHealthBusy(true);void bridge.clearHealth().then(setHealth).catch(errToast).finally(()=>setHealthBusy(false));}}>{healthBusy?'Clearing…':'Clear'}</button></div>
        </Field>

        <Field label="Support report" hint="Exports build and runtime versions, feature counts, aggregate browser health, nonsecret modes, and known compatibility limits. It excludes credentials, URLs, browsing history, task text, account identity, local paths, and content.">
          <div className="row"><button className="btn sm" disabled={diagnosticsBusy} onClick={()=>{setDiagnosticsBusy(true);setDiagnosticsMessage('');void bridge.exportDiagnostics().then(path=>setDiagnosticsMessage(path?'Support report saved.':'Export cancelled.')).catch(error=>setDiagnosticsMessage(error instanceof Error?error.message:String(error))).finally(()=>setDiagnosticsBusy(false));}}>{diagnosticsBusy?'Preparing…':'Export support report…'}</button>{diagnosticsMessage&&<span className="hint" role="status">{diagnosticsMessage}</span>}</div>
        </Field>

        </details>

        <div className="drawer-foot" data-setting="clear-history" tabIndex={-1}>
          <ClearHistory />
        </div>
      </section></div></div>
    </div>
  );
}

function LegacyMigration() {
  const [status, setStatus] = useState<{ source: string | null; destination: string; dualRoots: boolean; skippedCredentials: boolean; migrated: boolean; blockedReason?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { void call<NonNullable<typeof status>>("installation.legacyStatus", {}).then(setStatus).catch(() => undefined); }, []);
  if (!status?.source && !status?.dualRoots && !status?.migrated) return null;
  return <Field label="Vector data" hint="Explicit Vector→Aux copy. Encrypted credentials, cookies and password stores are never moved. Confirm before copying task data.">
    <p className="hint">{status.blockedReason ?? (status.migrated ? "A Vector→Aux migration already completed for this destination." : status.source ? `Legacy data found at ${status.source}.` : "No legacy Vector directory found.")}</p>
    {status.skippedCredentials && <p className="hint">Credential files will be skipped. Re-enter keys in Connections after migration.</p>}
    {status.source && !status.migrated && <button className="btn sm" disabled={busy} onClick={() => {
      setBusy(true); setMessage("");
      void call("installation.migrateLegacy", { confirm: true }).then(() => {
        setMessage("Copied task data. Credentials were not moved. Restart Aux with the Aux data directory.");
        setStatus(current => current ? { ...current, migrated: true } : current);
      }).catch(error => setMessage(error instanceof Error ? error.message : String(error))).finally(() => setBusy(false));
    }}>{busy ? "Copying…" : "Copy Vector data into Aux…"}</button>}
    {message && <span className="hint" role="status">{message}</span>}
  </Field>;
}
