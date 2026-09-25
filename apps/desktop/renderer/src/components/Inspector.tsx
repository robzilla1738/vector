import { useEffect, useState } from "react";
import type { CompactObservation } from "@aux/contracts";
import { useStore, call } from "../store";
import { ObservationPanel } from "./ObservationPanel";
import { DetailPane, EmptyState } from "./ui";

/**
 * Observation drawer — the compact observation of the active page (live), or
 * the exact snapshot a planner step saw (historical). Shares the rail's
 * ObservationPanel so the two never drift.
 */
export function Inspector() {
  const setOverlay = useStore((s) => s.setOverlay);
  const inspectorObs = useStore((s) => s.inspectorObs) as CompactObservation | null;
  const page = useStore((s) => s.pages.find((p) => p.pageId === ((s.inspectorObs as CompactObservation | null)?.pageId ?? s.activePageId)));
  const activePageId = (inspectorObs?.pageId ?? page?.pageId) || null;
  const [liveObs, setLiveObs] = useState<CompactObservation | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const historical = !!inspectorObs;
  const obs = inspectorObs ?? (liveObs?.pageId === activePageId ? liveObs : null);

  useEffect(() => {
    setLiveObs(null);
    setErr(null);
    if (inspectorObs || !activePageId) return;
    let current = true;
    call("pages.observe", { pageId: activePageId, format: "compact" })
      .then((r) => { if (current) setLiveObs("observation" in r ? r.observation : (r as unknown as CompactObservation)); })
      .catch((e) => { if (current) setErr(e instanceof Error ? e.message : String(e)); });
    return () => { current = false; };
  }, [activePageId, inspectorObs, retry]);

  const close = () => {
    useStore.setState({ inspectorObs: null });
    setOverlay(null);
  };

  return (
    <div className="overlay-scrim fade-in" onMouseDown={close}>
      <div className="drawer slide-in wide" role="dialog" aria-label="Observation" onMouseDown={(e) => e.stopPropagation()}>
        <DetailPane className="observation-detail" title="What the agent sees" onClose={close}
          metadata={historical ? "Recorded snapshot · may differ from the live page" : "Current page observation"}
          actions={!historical && activePageId ? <button className="btn sm ghost" onClick={() => setRetry(value => value + 1)}>Refresh</button> : undefined}>
          {!activePageId && !historical && <EmptyState title="No active page" description="Open a page to inspect its available content." />}
          {err && <div role="alert"><p className="hint err">{err}</p><button className="btn sm" onClick={() => setRetry(value => value + 1)}>Retry observation</button></div>}
          {!obs && !err && (activePageId || historical) && <output className="drawer-loading" data-block><span className="spin" /> Observing {page?.title || page?.url || activePageId}…</output>}
          {obs && <><ObservationPanel key={`${obs.pageId}:${obs.revision}`} obs={obs} />
            <details className="observation-raw"><summary>Raw observation</summary><pre className="obs-raw selectable">{obs.text}</pre></details></>}
        </DetailPane>
      </div>
    </div>
  );
}
