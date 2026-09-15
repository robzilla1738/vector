import { useStore } from "../store";
import { bridge } from "../bridge";
import { I } from "./icons";

function fmtSize(bytes: number | undefined): string {
  if (bytes === undefined || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STATE: Record<string, string> = { started: "Starting", progressing: "Downloading", completed: "Done", interrupted: "Interrupted", cancelled: "Cancelled" };

/** ⌘⇧J — in-flow shelf under the page with live progress. */
export function Downloads() {
  const items = useStore((s) => s.downloads);
  const setOverlay = useStore((s) => s.setOverlay);

  return (
    <div className="shelf slide-up" role="region" aria-label="Downloads">
      <div className="shelf-head">
        <span>Downloads</span>
        <span className="count nums">{items.length}</span>
        <span className="sp" />
        <button className="icon-btn sm" title="Close (Esc)" aria-label="Close downloads" onClick={() => setOverlay(null)}>{I.close}</button>
      </div>
      {items.length === 0 && <div className="shelf-empty">No files yet. Downloads from this window appear here.</div>}
      {items.map((d) => {
        const active = d.state === "started" || d.state === "progressing";
        const pct = active && d.totalBytes ? Math.min(100, Math.round((d.size / d.totalBytes) * 100)) : null;
        return (
          <div className={`dl-row ${d.state}`} key={d.id}>
            <span className="dl-ico">{I.downloadSm}</span>
            <span className="dl-main">
              <span className="dl-name" title={d.path}>{d.filename}</span>
              <span className="dl-sub nums">
                {active ? (pct !== null ? `${fmtSize(d.size)} of ${fmtSize(d.totalBytes)}` : `${fmtSize(d.size)}…`) : fmtSize(d.size)}
                {" · "}
                <span className={`dl-state ${d.state}`}>{STATE[d.state] ?? d.state}</span>
              </span>
              {active && <span className="dl-bar" aria-hidden><span style={{ width: pct !== null ? `${pct}%` : "40%" }} className={pct === null ? "indeterminate" : ""} /></span>}
            </span>
            {d.state === "completed" && (
              <>
                <button className="btn sm ghost" onClick={() => void bridge.openPath(d.path)}>Open</button>
                <button className="btn sm ghost" onClick={() => void bridge.revealPath(d.path)}>Reveal</button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
