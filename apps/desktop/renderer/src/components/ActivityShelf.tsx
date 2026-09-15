import { useStore, call, errToast } from "../store";
import { activityCounts } from "../chrome";
import { I } from "./icons";

const LIVE = new Set(["queued", "planning", "running", "paused", "needs_input"]);

export function ActivityShelf() {
  const members = useStore((s) => s.members);
  const runs = useStore((s) => s.runs);
  const downloads = useStore((s) => s.downloads);
  const timeline = useStore((s) => s.timeline);
  const shelfOpen = useStore((s) => s.shelfOpen);
  const toggleShelf = useStore((s) => s.toggleShelf);
  const setMode = useStore((s) => s.setMode);
  const setOverlay = useStore((s) => s.setOverlay);
  const counts = activityCounts({ members, runs, downloads });
  const live = runs.filter((r) => LIVE.has(r.status));
  const idle = counts.complete + counts.active + counts.queued + counts.files + counts.needsAttention === 0;

  return (
    <div className={`act-shelf ${shelfOpen ? "open" : ""}`}>
      <button className="act-shelf-bar" onClick={toggleShelf} aria-expanded={shelfOpen}>
        <span className={`chev ${shelfOpen ? "open" : ""}`}>{I.up}</span>
        {idle ? (
          <span className="act-idle">No activity</span>
        ) : (
          <span className="act-counts">
            <span className="act-count">
              <b>{counts.complete}</b> complete
            </span>
            <span className="act-count">
              <b>{counts.active}</b> active
            </span>
            <span className="act-count">
              <b>{counts.queued}</b> queued
            </span>
            <span className="act-count">
              <b>{counts.files}</b> files
            </span>
            {counts.needsAttention > 0 && (
              <span className="act-count warn">
                <b>{counts.needsAttention}</b> need attention
              </span>
            )}
          </span>
        )}
        {live[0] && <span className="act-goal">{live[0].goal}</span>}
      </button>
      {shelfOpen && (
        <div className="act-shelf-body">
          {live.length > 0 && (
            <div className="act-live">
              {live.slice(0, 3).map((r) => (
                <div className="act-live-row" key={r.runId}>
                  <span className={`st ${r.status}`}>{r.status.replace("_", " ")}</span>
                  <span className="act-live-goal">{r.goal}</span>
                  {r.status === "paused" && (
                    <button className="btn sm" onClick={() => void call("runs.resume", { runId: r.runId }).catch(errToast)}>
                      Resume
                    </button>
                  )}
                  {r.status === "running" && (
                    <button className="btn sm" onClick={() => void call("runs.pause", { runId: r.runId }).catch(errToast)}>
                      Pause
                    </button>
                  )}
                  {LIVE.has(r.status) && (
                    <button className="btn sm" onClick={() => void call("runs.cancel", { runId: r.runId }).catch(errToast)}>
                      Stop
                    </button>
                  )}
                </div>
              ))}
              <div className="act-live-acts">
                <button className="btn sm" onClick={() => setMode("table")}>
                  Results
                </button>
                <button
                  className="btn sm"
                  onClick={() => {
                    useStore.setState({ inspectorObs: null });
                    setOverlay("observe");
                  }}
                >
                  Inspect
                </button>
              </div>
            </div>
          )}
          {timeline.length === 0 && live.length === 0 && (
            <div className="act-empty">Runs, set progress, and files appear here as counts — not percentages.</div>
          )}
          {timeline.slice(0, 10).map((item) => (
            <div className="tl-item" key={item.id}>
              <span className={`tl-ico ${item.kind}`}>{item.kind === "run" ? I.run : item.kind === "result" ? I.result : item.kind === "download" ? I.downloadSm : item.kind === "error" ? I.alert : I.obs}</span>
              <span className="tl-main">
                <span className="tl-title">{item.title}</span>
                {item.detail && <span className="tl-detail">{item.detail}</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
