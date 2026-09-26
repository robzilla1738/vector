import { useEffect, useRef, useState } from "react";
import type { AuxEvent, ImportCategoryResult, ImportSourcePreview } from "@aux/contracts";
import { call } from "../store";
import { bridge } from "../bridge";

interface PreviewSource extends ImportSourcePreview { }
type Selection = Record<string, boolean>;

function categoryLabel(category: string): string {
  return category === "bookmarks" ? "Bookmarks" : category === "history" ? "History" : "Open tabs";
}

function availability(entry: { available: boolean; count?: number; bytes?: number; blocker?: string }): string {
  if (entry.blocker && !entry.available) return entry.blocker;
  if (entry.count != null) return `${entry.count.toLocaleString()} found`;
  if (entry.bytes != null) return `${Math.max(1, Math.round(entry.bytes / 1048576))} MB`;
  return entry.available ? "Available" : "Nothing found";
}

/**
 * Preview-first browser import: what each installed browser can offer, chosen
 * per category, then run with progress and a per-source partial-result report.
 * A failed or locked source never blocks the rest.
 */
export function ImportDataSetting() {
  const [preview, setPreview] = useState<PreviewSource[] | null>(null);
  const [selection, setSelection] = useState<Selection>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jobId, setJobId] = useState("");
  const [progress, setProgress] = useState<ImportCategoryResult[]>([]);
  const [done, setDone] = useState(false);
  const jobRef = useRef("");

  useEffect(() => bridge.onEvent((event: AuxEvent) => {
    if (event.type !== "import.progress" || event.payload.jobId !== jobRef.current) return;
    if (event.payload.done === true) { setDone(true); setLoading(false); return; }
    if (typeof event.payload.source === "string" && typeof event.payload.category === "string") {
      const entry = event.payload as unknown as ImportCategoryResult;
      if (entry.state === "running") {
        setProgress(current => [...current.filter(item => !(item.source === entry.source && item.category === entry.category)), entry]);
        return;
      }
      setProgress(current => [...current.filter(item => !(item.source === entry.source && item.category === entry.category)), entry]);
    }
  }), []);

  const loadPreview = async () => {
    setLoading(true); setError(""); setDone(false); setProgress([]);
    try {
      const result = await call("import.preview", {});
      const next: Selection = {};
      for (const source of result.sources) {
        for (const entry of source.categories) {
          if (entry.available && !entry.blocker) next[`${source.id}:${entry.category}`] = true;
        }
      }
      setPreview(result.sources);
      setSelection(next);
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setLoading(false); }
  };

  const selected = Object.entries(selection).filter(([, on]) => on).map(([key]) => key);
  const run = async () => {
    if (!preview || !selected.length) return;
    const sources = [...new Set(selected.map(key => key.split(":")[0]!))];
    const categories = [...new Set(selected.map(key => key.split(":")[1]!))];
    setLoading(true); setError(""); setDone(false); setProgress([]);
    try {
      const { jobId: id } = await call("import.run", { sources, categories: categories as ("tabs" | "bookmarks" | "history")[] });
      jobRef.current = id;
      setJobId(id);
      // Catch up on progress emitted before the subscription learned the id.
      const status = await call("import.status", { jobId: id });
      if (status.progress.length) setProgress(status.progress);
      if (status.done) { setDone(true); setLoading(false); }
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); setLoading(false); }
  };

  const cancel = async () => {
    if (!jobRef.current) return;
    try { await call("import.cancel", { jobId: jobRef.current }); } catch { /* job may already be done */ }
  };

  const running = !!jobId && !done;

  if (!preview) {
    return <div className="row">
      <button className="btn sm" disabled={loading} onClick={() => void loadPreview()}>{loading ? "Checking…" : "See what can be imported"}</button>
      {error && <span className="hint err">{error}</span>}
    </div>;
  }

  return <div className="import-setting">
    {preview.map(source => <div className="import-source" key={source.id}>
      <div className="import-source-head"><strong>{source.label}</strong>{source.profiles.length ? <span className="hint">{source.profiles.join(", ")}</span> : null}</div>
      {source.categories.map(entry => {
        const key = `${source.id}:${entry.category}`;
        const usable = entry.available && !entry.blocker;
        return <label className="import-row" key={entry.category}>
          <input type="checkbox" disabled={!usable || running} checked={usable && !!selection[key]} onChange={event => setSelection(current => ({ ...current, [key]: event.target.checked }))} />
          <span>{categoryLabel(entry.category)}</span>
          <span className="hint">{entry.blocker ?? availability(entry)}</span>
        </label>;
      })}
    </div>)}
    <div className="row">
      {!running && <button className="btn sm" disabled={!selected.length || loading} onClick={() => void run()}>Import selected ({selected.length})</button>}
      {running && <button className="btn sm ghost" onClick={() => void cancel()}>Cancel import</button>}
      <button className="btn sm ghost" disabled={running} onClick={() => void loadPreview()}>Refresh</button>
      {error && <span className="hint err">{error}</span>}
    </div>
    {progress.length > 0 && <ul className="import-report">
      {progress.map((entry, index) => <li key={`${entry.source}:${entry.category}:${index}`}>
        <strong>{entry.label} · {categoryLabel(entry.category)}</strong> — {entry.state === "running"
          ? `${entry.imported.toLocaleString()} imported…`
          : entry.state === "error"
            ? <span className="hint err">{entry.detail ?? "Failed"}</span>
            : `${entry.imported.toLocaleString()} imported${entry.skipped ? ` · ${entry.skipped.toLocaleString()} skipped` : ""}${entry.detail ? ` · ${entry.detail}` : ""}`}
      </li>)}
      {done && <li className="hint">Import finished{progress.some(e => e.state === "error") ? " — some sources could not be read; the rest were imported." : "."}</li>}
    </ul>}
  </div>;
}
