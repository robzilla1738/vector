import { useEffect, useState } from "react";
import { useStore } from "../store";
import { bridge } from "../bridge";
import { I } from "./icons";

function fmtSize(bytes: number | undefined): string {
  if (bytes === undefined) return "";
  if (bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STATE: Record<string, string> = { started: "Starting", progressing: "Downloading", completed: "Done", interrupted: "Interrupted", cancelled: "Cancelled" };

/** ⌘⇧J — in-flow shelf under the page with live progress. */
export function Downloads() {
  const items = useStore((s) => s.downloads);
  const setOverlay = useStore((s) => s.setOverlay);

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [retried,setRetried]=useState<Set<string>>(()=>new Set());
  const [folder,setFolder]=useState<{path:string;custom:boolean;error?:string}|null>(null);
  useEffect(()=>{let live=true;void bridge.downloadFolder().then(value=>{if(live)setFolder(value);}).catch(reason=>{if(live)setError(String(reason));});return()=>{live=false;};},[items.length]);
  useEffect(() => {
    let live = true;
    void bridge.downloadsSnapshot().then(downloads => {
      if (!live) return;
      const active = new Set(downloads.map(download => download.id));
      useStore.setState(state => ({ downloads: [
        ...downloads,
        ...state.downloads.filter(download => !active.has(download.id)).map(download =>
          ["started", "progressing"].includes(download.state) ? { ...download, state: "interrupted" as const, canCancel: false, canResume: false, paused: false } : download),
      ] }));
    }).catch(reason => { if (live) setError(String(reason)); });
    return () => { live = false; };
  }, []);
  async function action(id: string, work: () => Promise<unknown>) {
    setBusy(id); setError("");
    try { await work(); } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(null); }
  }

  return (
    <div className="shelf slide-up" role="region" aria-label="Downloads">
      <div className="shelf-head">
        <span>Downloads</span>
        <span className="count nums">{items.length}</span>
        <span className="sp" />
        <button className="icon-btn sm" title="Close (Esc)" aria-label="Close downloads" onClick={() => setOverlay(null)}>{I.close}</button>
      </div>
      {error && <p className="download-error" role="alert">{error}</p>}
      {folder&&<div className="download-folder">
        <span className="download-folder-path" title={folder.path}>Save to <span className="selectable">{folder.path}</span></span>
        <button className="btn sm ghost" disabled={busy!==null} onClick={()=>void action('folder',async()=>setFolder(await bridge.chooseDownloadFolder()))}>Change folder</button>
        {(folder.custom||folder.error)&&<button className="btn sm ghost" disabled={busy!==null} onClick={()=>void action('folder',async()=>setFolder(await bridge.chooseDownloadFolder(true)))}>Use default</button>}
      </div>}
      {folder?.error&&<p className="download-error" role="alert">{folder.error}</p>}
      {items.length === 0 && <div className="shelf-empty">No files yet. Downloads from this window appear here.</div>}
      {items.map((d) => {
        const active = d.state === "started" || d.state === "progressing";
        const pct = active && d.totalBytes ? Math.min(100, Math.round((d.size / d.totalBytes) * 100)) : null;
        return (
          <div className={`dl-row ${d.state}${d.paused ? " paused" : ""}`} key={d.id}>
            <span className="dl-ico">{I.downloadSm}</span>
            <span className="dl-main">
              <span className="dl-name" title={d.path}>{d.filename}</span>
              <span className="dl-sub nums">
                {active ? (pct !== null ? `${fmtSize(d.size)} of ${fmtSize(d.totalBytes)}` : `${fmtSize(d.size)}…`) : fmtSize(d.size)}
                {" · "}
                <span className={`dl-state ${d.state}`}>{d.paused ? "Paused" : STATE[d.state] ?? d.state}</span>
                {d.state==='interrupted'&&!d.path&&(d.sourceUrl?' · Choose an available folder, then Retry.':' · Download folder unavailable; choose a folder and retry from the page.')}
              </span>
              {active && <span className="dl-bar" aria-hidden><span style={{ width: pct !== null ? `${pct}%` : "40%" }} className={pct === null ? "indeterminate" : ""} /></span>}
            </span>
            {d.canCancel && <>
              {d.paused || d.state === "interrupted" ? <button className="btn sm ghost" disabled={busy !== null || !d.canResume} onClick={() => void action(d.id, () => bridge.controlDownload(d.id, "resume"))}>Resume</button> : <button className="btn sm ghost" disabled={busy !== null} onClick={() => void action(d.id, () => bridge.controlDownload(d.id, "pause"))}>Pause</button>}
              <button className="btn sm ghost" disabled={busy !== null} onClick={() => void action(d.id, () => bridge.controlDownload(d.id, "cancel"))}>Cancel</button>
            </>}
            {!d.canCancel&&d.state!=='completed'&&d.sourceUrl&&<button className="btn sm ghost" title="Start a new download from the saved URL. Expired links or form-generated downloads may need the original page." disabled={busy!==null||retried.has(d.id)} onClick={()=>void action(d.id,async()=>{await bridge.retryDownload(d.id);setRetried(current=>new Set([...current,d.id]));})}>{retried.has(d.id)?'Retry requested':'Retry'}</button>}
            {d.state === "completed" && (
              <>
                <button className="btn sm ghost" disabled={busy !== null} onClick={() => void action(d.id, async () => { const error = await bridge.openPath(d.path); if (error) throw new Error(`Could not open ${d.filename}: ${error}. The file may have been moved or deleted.`); })}>Open</button>
                <button className="btn sm ghost" disabled={busy !== null} onClick={() => void action(d.id, () => bridge.revealPath(d.path))}>Reveal</button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
