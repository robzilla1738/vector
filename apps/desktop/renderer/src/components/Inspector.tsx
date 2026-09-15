import { useEffect, useState } from "react";
import type { CompactObservation } from "@vector/contracts";
import { useStore, call } from "../store";
import { ObservationPanel } from "./ObservationPanel";
import { I } from "./icons";

/**
 * Observation drawer — the compact observation of the active page (live), or
 * the exact snapshot a planner step saw (historical). Shares the rail's
 * ObservationPanel so the two never drift.
 */
export function Inspector() {
  const activePageId = useStore((s) => s.activePageId);
  const pages = useStore((s) => s.pages);
  const setOverlay = useStore((s) => s.setOverlay);
  const inspectorObs = useStore((s) => s.inspectorObs) as CompactObservation | null;
  const page = pages.find((p) => p.pageId === (inspectorObs?.pageId ?? activePageId));
  const [liveObs, setLiveObs] = useState<CompactObservation | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"readable" | "raw">("readable");
  const historical = !!inspectorObs;
  const obs = inspectorObs ?? liveObs;

  useEffect(() => {
    if (inspectorObs || !activePageId) return;
    setLiveObs(null);
    setErr(null);
    call<{ observation: CompactObservation } | CompactObservation>("pages.observe", { pageId: activePageId, format: "compact" })
      .then((r) => setLiveObs("observation" in r ? r.observation : (r as CompactObservation)))
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, [activePageId, inspectorObs]);

  const close = () => {
    useStore.setState({ inspectorObs: null });
    setOverlay(null);
  };

  return (
    <div className="overlay-scrim fade-in" onMouseDown={close}>
      <div className="drawer slide-in wide" role="dialog" aria-label="Observation" onMouseDown={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h3>What the agent sees</h3>
          {historical && <span className="badge historic">snapshot</span>}
          <span className="sp" />
          <div className="seg small" role="tablist">
            {(["readable", "raw"] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <button className="icon-btn" title="Close (Esc)" aria-label="Close" onClick={close}>{I.close}</button>
        </div>
        {historical && <p className="hint">The exact state the planner saw before that step — the live page has since changed.</p>}
        {!activePageId && !historical && <p className="hint">No active page.</p>}
        {err && <p className="hint err">{err}</p>}
        {!obs && !err && (activePageId || historical) && (
          <div className="drawer-loading"><span className="spin" /> Observing {page?.title || page?.url || activePageId}…</div>
        )}
        {obs && tab === "readable" && <ObservationPanel obs={obs} />}
        {obs && tab === "raw" && <pre className="obs-raw selectable">{obs.text}</pre>}
      </div>
    </div>
  );
}
