import { useEffect, useState } from "react";
import { useStore, call, toast, errToast } from "../store";
import { bridge } from "../bridge";
import { I } from "./icons";

/** what settings.get returns in place of the real key */
const KEY_MASK = "••••••••";

interface ModelEntry { id: string; name?: string }
interface ProbeResult { ok: boolean; modelId: string; latencyMs?: number; vision?: boolean; error?: string }
interface CookieImportResult { ok: boolean; source: string; imported: number; skipped: number; domains: number; detail?: string }

export function Settings() {
  const settings = useStore((s) => s.settings);
  const setOverlay = useStore((s) => s.setOverlay);
  const refresh = useStore((s) => s.refresh);
  // never seed the masked value back into the field — saving it would
  // overwrite the real key with bullets
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [modelsSource, setModelsSource] = useState<string>("");
  const [probe, setProbe] = useState<ProbeResult | null>(null);
  const [probing, setProbing] = useState(false);
  const [dataDir, setDataDir] = useState("");
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

  return (
    <div className="overlay-scrim fade-in" onMouseDown={() => setOverlay(null)}>
      <div className="drawer" onMouseDown={(e) => e.stopPropagation()} style={{ top: 0, right: 0, height: "100%" }}>
        <div className="drawer-head">
          <h3>Settings</h3>
          <button className="icon-btn" title="Close (Esc)" onClick={() => setOverlay(null)}>{I.close}</button>
        </div>

        <div className="field">
          <label>Theme</label>
          <div className="seg">
            {["dark", "light"].map((t) => (
              <button key={t} className={theme === t ? "on" : ""} onClick={() => void set({ theme: t })}>{t}</button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Vercel AI Gateway key</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="password"
              style={{ flex: 1 }}
              value={key}
              placeholder={hasKey ? "Key saved — enter a new key to replace" : "vg_…  (stored locally)"}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && key.trim() && key !== KEY_MASK) {
                  void set({ gatewayApiKey: key.trim() }).then(() => setKey(""));
                }
              }}
              onBlur={() => {
                if (key.trim() && key !== KEY_MASK) void set({ gatewayApiKey: key.trim() }).then(() => setKey(""));
              }}
            />
            {hasKey && (
              <button
                className="btn sm"
                title="Remove the saved Gateway key"
                onClick={() => void set({ gatewayApiKey: "" }).then(() => toast("Gateway key removed"))}
              >
                Clear
              </button>
            )}
          </div>
          <span className="hint">
            {hasKey ? "A key is configured." : "No key configured."} Enables model planning — without it the runtime uses the mock planner.
          </span>
        </div>

        <div className="field">
          <label>Planner model</label>
          {models.length > 0 ? (
            <select value={plannerModel} onChange={(e) => void set({ plannerModel: e.target.value })}>
              {!models.some((m) => m.id === plannerModel) && <option value={plannerModel}>{plannerModel}</option>}
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.name ? `${m.name} — ${m.id}` : m.id}</option>
              ))}
            </select>
          ) : (
            <input
              defaultValue={plannerModel}
              onBlur={(e) => void set({ plannerModel: e.target.value })}
            />
          )}
          <span className="hint">
            {modelsSource === "gateway" ? `${models.length} models from the Gateway catalog.` : "Static fallback list — add a Gateway key for the live catalog."}
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn" disabled={probing} onClick={() => void runProbe()}>
              {probing ? "Probing…" : "Test connection"}
            </button>
            {probe && (
              <span className="hint" style={{ color: probe.ok ? "var(--ok)" : "var(--err)" }}>
                {probe.ok
                  ? `ok · ${probe.latencyMs}ms${probe.vision === true ? " · vision" : probe.vision === false ? " · no vision" : ""}`
                  : `failed — ${probe.error}`}
              </span>
            )}
          </div>
        </div>

        <div className="field">
          <label>Vision model</label>
          <select
            value={(settings.visionModel as string) ?? ""}
            onChange={(e) => void set({ visionModel: e.target.value })}
          >
            <option value="">Same as planner</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>{m.name ? `${m.name} — ${m.id}` : m.id}</option>
            ))}
          </select>
          <span className="hint">Used once per run to re-plan from a screenshot when the structured path fails. The probe reports whether the model accepts images.</span>
        </div>

        <div className="field">
          <label>Chrome cookies</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="btn"
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
            {cookieImport.result && (
              <span className="hint" style={{ color: "var(--ok)" }}>
                {cookieImport.result.imported} imported · {cookieImport.result.domains} domains
              </span>
            )}
            {cookieImport.error && <span className="hint" style={{ color: "var(--err)" }}>{cookieImport.error}</span>}
          </div>
          <span className="hint">
            {cookieImport.result?.detail ??
              "Brings your Chrome logins into Vector. Attaching Chrome imports everything, including newer app-bound cookies; from disk, macOS will ask for keychain access."}
          </span>
        </div>

        <div className="field">
          <label>Search engine</label>
          <input
            defaultValue={(settings.searchEngine as string) ?? "https://duckduckgo.com/?q=%s"}
            onBlur={(e) => void set({ searchEngine: e.target.value })}
          />
          <span className="hint">URL template — %s is replaced by the query.</span>
        </div>

        <div className="field">
          <label>Worker pages (parallel)</label>
          <input
            type="number" min={1} max={16}
            defaultValue={(settings.maxWorkers as number) ?? 4}
            onBlur={(e) => void set({ maxWorkers: Number(e.target.value) })}
          />
        </div>

        <div className="field">
          <label>Max model calls per run</label>
          <input
            type="number" min={1} max={8}
            defaultValue={(settings.maxModelCalls as number) ?? 3}
            onBlur={(e) => void set({ maxModelCalls: Number(e.target.value) })}
          />
        </div>

        {dataDir && (
          <div className="field">
            <label>Data directory</label>
            <span className="hint mono" style={{ wordBreak: "break-all", userSelect: "text", cursor: "text" }}>{dataDir}</span>
            <button className="btn" style={{ alignSelf: "flex-start" }} onClick={() => void bridge.revealPath(dataDir)}>Reveal in Finder</button>
          </div>
        )}

        <div style={{ marginTop: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {saved && <span style={{ fontSize: 11, color: "var(--ok)" }}>Saved</span>}
          <button className="btn danger" onClick={() => void call("history.clear")}>Clear history</button>
        </div>
      </div>
    </div>
  );
}
