import { useEffect, useState } from "react";
import { useStore, call } from "../store";
import { I } from "./icons";

interface ObsEl {
  ref: string;
  role: string;
  name?: string;
  value?: unknown;
  states?: string[];
}

interface Observation {
  pageId: string;
  revision: number;
  documentEpoch?: number;
  content?: { url?: string; title?: string; text?: string; elements?: ObsEl[] };
  truncated?: boolean;
}

export function Inspector() {
  const activePageId = useStore((s) => s.activePageId);
  const pages = useStore((s) => s.pages);
  const setOverlay = useStore((s) => s.setOverlay);
  const inspectorObs = useStore((s) => s.inspectorObs);
  const page = pages.find((p) => p.pageId === ((inspectorObs as Observation | null)?.pageId ?? activePageId));
  const [liveObs, setLiveObs] = useState<Observation | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"elements" | "json">("elements");
  const historical = !!inspectorObs;
  const obs = (inspectorObs as Observation | null) ?? liveObs;

  useEffect(() => {
    if (inspectorObs) return;
    if (!activePageId) return;
    setLiveObs(null);
    setErr(null);
    call<Observation>("pages.observe", { pageId: activePageId })
      .then(setLiveObs)
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, [activePageId, inspectorObs]);

  const elements = obs?.content?.elements ?? [];
  const close = () => { useStore.setState({ inspectorObs: null }); setOverlay(null); };

  return (
    <div className="overlay-scrim fade-in" onMouseDown={close}>
      <div className="drawer" onMouseDown={(e) => e.stopPropagation()} style={{ top: 0, right: 0, height: "100%", width: 460 }}>
        <div className="drawer-head">
          <h3>Observation</h3>
          {obs && <span className="hint mono">rev {obs.revision} · {elements.length} elements</span>}
          {historical && <span className="badge historic">historical</span>}
          <span style={{ flex: 1 }} />
          <button className="icon-btn" title="Close (Esc)" onClick={close}>{I.close}</button>
        </div>
        {historical && <span className="hint" style={{ marginTop: -8 }}>The exact state the planner saw — the live page has since changed.</span>}
        {!obs && !activePageId && <span className="hint">No active page.</span>}
        {err && <span className="hint" style={{ color: "var(--err)" }}>{err}</span>}
        {!obs && !err && (activePageId || historical) && <span className="hint">Observing {page?.url ?? activePageId}…</span>}
        {obs && (
          <>
            <div className="field">
              <label>URL</label>
              <span className="hint mono" style={{ wordBreak: "break-all" }}>{obs.content?.url}</span>
            </div>
            <div className="seg" style={{ flex: "none" }}>
              {(["elements", "json"] as const).map((t) => (
                <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>
            {tab === "elements" ? (
              <div className="insp-list">
                {elements.map((el) => (
                  <div className="insp-el" key={el.ref}>
                    <span className="ref mono">{el.ref}</span>
                    <span className="role">{el.role}</span>
                    <span className="nm">{el.name ?? (el.value !== undefined ? String(el.value) : "")}</span>
                  </div>
                ))}
                {elements.length === 0 && <span className="hint">No elements.</span>}
              </div>
            ) : (
              <pre className="insp-json">{JSON.stringify(obs, null, 2)}</pre>
            )}
          </>
        )}
      </div>
    </div>
  );
}
