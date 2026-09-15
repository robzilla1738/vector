import { useEffect, useState } from "react";
import { useStore, call, toast, errToast } from "../store";
import { bridge } from "../bridge";
import { engineModeLabel, readEngineMode, type EngineMode } from "../engine";
import { I } from "./icons";

/** what settings.get returns in place of the real key */
const KEY_MASK = "••••••••";

interface ModelEntry { id: string; name?: string }
interface ProbeResult { ok: boolean; modelId: string; latencyMs?: number; vision?: boolean; error?: string }
interface CookieImportResult { ok: boolean; source: string; imported: number; skipped: number; domains: number; detail?: string }

function Field({ label, hint, children }: { label: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

export function Settings() {
  const settings = useStore((s) => s.settings);
  const setOverlay = useStore((s) => s.setOverlay);
  const refresh = useStore((s) => s.refresh);
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [modelsSource, setModelsSource] = useState<string>("");
  const [probe, setProbe] = useState<ProbeResult | null>(null);
  const [probing, setProbing] = useState(false);
  const [dataDir, setDataDir] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [cookieImport, setCookieImport] = useState<{ busy: boolean; result?: CookieImportResult; error?: string }>({ busy: false });

  useEffect(() => {
    void bridge.dataDir().then(setDataDir);
    void call<{ models: ModelEntry[]; source: string }>("models.list")
      .then((r) => {
        setModels(r.models);
        setModelsSource(r.source);
      })
      .catch(() => {});
  }, []);

  const set = async (patch: Record<string, unknown>) => {
    try {
      await call("settings.set", patch);
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    } catch (e) {
      errToast(e);
    }
  };

  const runProbe = async () => {
    setProbing(true);
    setProbe(null);
    try {
      setProbe(await call<ProbeResult>("models.probe", { modelId: (settings.plannerModel as string) || undefined }));
    } catch (e) {
      setProbe({ ok: false, modelId: "", error: e instanceof Error ? e.message : String(e) });
    }
    setProbing(false);
  };

  const theme = (settings.theme as string) ?? "dark";
  const plannerModel = (settings.plannerModel as string) ?? "anthropic/claude-sonnet-4.5";
  const hasKey = settings.gatewayApiKey === KEY_MASK;
  const engineMode = readEngineMode(settings);

  return (
    <div className="overlay-scrim fade-in" onMouseDown={() => setOverlay(null)}>
      <div className="drawer slide-in" role="dialog" aria-label="Settings" onMouseDown={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h3>Settings</h3>
          <span className="sp" />
          {saved && <span className="saved">{I.check} Saved</span>}
          <button className="icon-btn" title="Close (Esc)" aria-label="Close settings" onClick={() => setOverlay(null)}>{I.close}</button>
        </div>

        <div className="drawer-section">Appearance</div>
        <Field label="Theme">
          <div className="seg" role="radiogroup" aria-label="Theme">
            {(["dark", "light"] as const).map((t) => (
              <button key={t} role="radio" aria-checked={theme === t} className={theme === t ? "on" : ""} onClick={() => void set({ theme: t })}>{t === "dark" ? "Dark" : "Light"}</button>
            ))}
          </div>
        </Field>

        <div className="drawer-section">Engine</div>
        <Field label="Vector Engine" hint={<>{engineModeLabel(engineMode)}. {/* TODO(contracts): engineMode lands with the vector-engine backend; until then the runtime ignores this key. */}</>}>
          <div className="seg" role="radiogroup" aria-label="Engine mode">
            {(["off", "auto", "always"] as EngineMode[]).map((m) => (
              <button key={m} role="radio" aria-checked={engineMode === m} className={engineMode === m ? "on" : ""} onClick={() => void set({ engineMode: m })}>
                {m === "off" ? "Off" : m === "auto" ? "Auto" : "Always"}
              </button>
            ))}
          </div>
        </Field>

        <div className="drawer-section">Models</div>
        <Field label="Vercel AI Gateway key" hint={<>{hasKey ? "A key is configured." : "No key configured."} Enables model planning — without it the runtime uses the mock planner.</>}>
          <div className="row">
            <input
              type="password"
              className="grow"
              value={key}
              placeholder={hasKey ? "Key saved — enter a new key to replace" : "vg_…  (stored locally)"}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && key.trim() && key !== KEY_MASK) void set({ gatewayApiKey: key.trim() }).then(() => setKey(""));
              }}
              onBlur={() => {
                if (key.trim() && key !== KEY_MASK) void set({ gatewayApiKey: key.trim() }).then(() => setKey(""));
              }}
            />
            {hasKey && <button className="btn sm" title="Remove the saved Gateway key" onClick={() => void set({ gatewayApiKey: "" }).then(() => toast("Gateway key removed"))}>Clear</button>}
          </div>
        </Field>

        <Field label="Planner model" hint={modelsSource === "gateway" ? `${models.length} models from the Gateway catalog.` : "Static fallback list — add a Gateway key for the live catalog."}>
          {models.length > 0 ? (
            <select value={plannerModel} onChange={(e) => void set({ plannerModel: e.target.value })}>
              {!models.some((m) => m.id === plannerModel) && <option value={plannerModel}>{plannerModel}</option>}
              {models.map((m) => <option key={m.id} value={m.id}>{m.name ? `${m.name} — ${m.id}` : m.id}</option>)}
            </select>
          ) : (
            <input defaultValue={plannerModel} onBlur={(e) => void set({ plannerModel: e.target.value })} />
          )}
          <div className="row">
            <button className="btn sm" disabled={probing} onClick={() => void runProbe()}>{probing ? "Probing…" : "Test connection"}</button>
            {probe && (
              <span className={`hint ${probe.ok ? "ok" : "err"}`}>
                {probe.ok ? `ok · ${probe.latencyMs} ms${probe.vision === true ? " · vision" : probe.vision === false ? " · no vision" : ""}` : `failed — ${probe.error}`}
              </span>
            )}
          </div>
        </Field>

        <Field label="Vision model" hint="Used once per run to re-plan from a screenshot when the structured path fails.">
          <select value={(settings.visionModel as string) ?? ""} onChange={(e) => void set({ visionModel: e.target.value })}>
            <option value="">Same as planner</option>
            {models.map((m) => <option key={m.id} value={m.id}>{m.name ? `${m.name} — ${m.id}` : m.id}</option>)}
          </select>
        </Field>

        <div className="row two">
          <Field label="Parallel worker pages">
            <input type="number" min={1} max={16} defaultValue={(settings.maxWorkers as number) ?? 4} onBlur={(e) => void set({ maxWorkers: Number(e.target.value) })} />
          </Field>
          <Field label="Max model calls per run">
            <input type="number" min={1} max={8} defaultValue={(settings.maxModelCalls as number) ?? 3} onBlur={(e) => void set({ maxModelCalls: Number(e.target.value) })} />
          </Field>
        </div>

        <div className="drawer-section">Browsing</div>
        <Field label="Search engine" hint="URL template — %s is replaced by the query.">
          <input defaultValue={(settings.searchEngine as string) ?? "https://duckduckgo.com/?q=%s"} onBlur={(e) => void set({ searchEngine: e.target.value })} />
        </Field>

        <Field label="Chrome cookies" hint={cookieImport.result?.detail ?? "Brings your Chrome logins into Vector. Attaching Chrome imports everything, including app-bound cookies; from disk, macOS asks for keychain access."}>
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

        {dataDir && (
          <Field label="Data directory">
            <div className="row">
              <span className="hint mono selectable grow">{dataDir}</span>
              <button className="btn sm" onClick={() => void bridge.revealPath(dataDir)}>Reveal</button>
            </div>
          </Field>
        )}

        <div className="drawer-foot">
          {confirmClear ? (
            <>
              <span className="hint">Clear all browsing history?</span>
              <button className="btn sm" onClick={() => setConfirmClear(false)}>Cancel</button>
              <button className="btn sm danger" onClick={() => void call("history.clear").then(() => { toast("History cleared"); setConfirmClear(false); }).catch(errToast)}>Clear history</button>
            </>
          ) : (
            <button className="btn sm ghost danger" onClick={() => setConfirmClear(true)}>Clear history…</button>
          )}
        </div>
      </div>
    </div>
  );
}
