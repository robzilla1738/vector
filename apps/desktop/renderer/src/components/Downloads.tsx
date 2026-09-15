import { useStore } from "../store";
import { bridge } from "../bridge";
import { I } from "./icons";

function fmtSize(bytes: number | undefined): string {
  if (bytes === undefined || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Downloads() {
  const items = useStore((s) => s.downloads);
  const setOverlay = useStore((s) => s.setOverlay);

  return (
    <div className="shelf fade-in">
      <div className="shelf-head">
        <span>Downloads</span>
        <button className="icon-btn sm" title="Close (Esc)" onClick={() => setOverlay(null)}>{I.close}</button>
      </div>
      {items.length === 0 && <div className="shelf-empty">No files yet. Downloads from this window appear here.</div>}
      {items.map((d) => {
        const active = d.state === "started" || d.state === "progressing";
        const pct = active && d.totalBytes ? Math.min(100, Math.round((d.size / d.totalBytes) * 100)) : null;
        return (
          <div className="dl-row" key={d.id}>
            <span className="tl-ico download">{I.downloadSm}</span>
            <span className="f" title={d.path}>{d.filename}</span>
            <span className="sz">
              {active
                ? pct !== null
                  ? `${pct}% · ${fmtSize(d.size)} of ${fmtSize(d.totalBytes)}`
                  : `${fmtSize(d.size)}…`
                : fmtSize(d.size)}
            </span>
            <span className={`st ${d.state === "completed" ? "ok" : d.state === "interrupted" || d.state === "cancelled" ? "error" : "partial"}`}>
              {d.state}
            </span>
            {d.state === "completed" && (
              <>
                <button className="dl-act" onClick={() => void bridge.openPath(d.path)}>Open</button>
                <button className="dl-act" onClick={() => void bridge.revealPath(d.path)}>Reveal</button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
