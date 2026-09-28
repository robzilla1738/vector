import { useEffect, useRef, useState } from "react";
import type { AuxEvent, ImportCategory, ImportCategoryResult, ImportSelection, ImportSourcePreview } from "@aux/contracts";
import { call } from "../store";
import { bridge } from "../bridge";

interface PreviewSource extends ImportSourcePreview { }
type Selection = Record<string, Record<string, Partial<Record<ImportCategory, boolean>>>>;

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
  const [cancelled, setCancelled] = useState(false);
  const [stopping, setStopping] = useState(false);
  const jobRef = useRef("");

  useEffect(() => bridge.onEvent((event: AuxEvent) => {
    if (event.type !== "import.progress" || event.payload.jobId !== jobRef.current) return;
    if (event.payload.done === true) {
      setDone(true); setLoading(false); setStopping(false);
      setCancelled(event.payload.cancelled === true);
      if (typeof event.payload.error === "string") setError(event.payload.error);
      return;
    }
    if (typeof event.payload.source === "string" && typeof event.payload.category === "string") {
      const entry = event.payload as unknown as ImportCategoryResult;
      if (entry.state === "running") {
        setProgress(current => [...current.filter(item => !(item.label === entry.label && item.category === entry.category)), entry]);
        return;
      }
      setProgress(current => [...current.filter(item => !(item.label === entry.label && item.category === entry.category)), entry]);
    }
  }), []);

  const loadPreview = async () => {
    setLoading(true); setError(""); setDone(false); setCancelled(false); setStopping(false); setProgress([]);
    try {
      const result = await call("import.preview", {});
      const next: Selection = {};
      for (const source of result.sources) {
        const profiles = source.profileCategories.length ? source.profileCategories : [{ profileId: "", categories: source.categories }];
        next[source.id] = {};
        for (const profile of profiles) {
          const categories: Partial<Record<ImportCategory, boolean>> = {};
          for (const entry of profile.categories) {
            if (entry.available && !entry.blocker) categories[entry.category] = false;
          }
          next[source.id]![profile.profileId] = categories;
        }
      }
      setPreview(result.sources);
      setSelection(next);
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setLoading(false); }
  };

  const selected: ImportSelection[] = Object.entries(selection).flatMap(([sourceId, profiles]) =>
    Object.entries(profiles).flatMap(([profileId, entries]) => {
      const categories = (Object.entries(entries) as [ImportCategory, boolean][])
        .filter(([, on]) => on).map(([category]) => category);
      return categories.length ? [{ sourceId, ...(profileId ? { profileId } : {}), categories }] : [];
    }));
  const run = async () => {
    if (!preview || !selected.length) return;
    setLoading(true); setError(""); setDone(false); setCancelled(false); setStopping(false); setProgress([]);
    try {
      const { jobId: id } = await call("import.run", { selections: selected });
      jobRef.current = id;
      setJobId(id);
      // Catch up on progress emitted before the subscription learned the id.
      const status = await call("import.status", { jobId: id });
      if (status.progress.length) setProgress(status.progress);
      if (status.done) {
        setDone(true); setLoading(false);
        setCancelled(status.cancelled);
        if (status.error) setError(status.error);
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); setLoading(false); }
  };

  const cancel = async () => {
    if (!jobRef.current) return;
    try { await call("import.cancel", { jobId: jobRef.current }); setStopping(true); } catch { /* job may already be done */ }
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
      <div className="import-source-head"><strong>{source.label}</strong></div>
      {(source.profileCategories.length ? source.profileCategories : [{ profileId: "", categories: source.categories }]).map(profile =>
        <div key={profile.profileId || source.id}>
          {profile.profileId && <p className="hint">Profile: {profile.profileId}</p>}
          {profile.categories.map(entry => {
            const usable = entry.available && !entry.blocker;
            return <label className="import-row" key={entry.category}>
              <input type="checkbox" disabled={!usable || running}
                checked={usable && !!selection[source.id]?.[profile.profileId]?.[entry.category]}
                onChange={event => setSelection(current => ({ ...current, [source.id]: {
                  ...current[source.id], [profile.profileId]: {
                    ...current[source.id]?.[profile.profileId], [entry.category]: event.target.checked,
                  },
                } }))} />
              <span>{categoryLabel(entry.category)}</span>
              <span className="hint">{entry.blocker ?? availability(entry)}</span>
            </label>;
          })}
        </div>)}
    </div>)}
    <div className="row">
      {!running && <button className="btn sm" disabled={!selected.length || loading} onClick={() => void run()}>Import selected ({selected.reduce((count, item) => count + item.categories.length, 0)})</button>}
      {running && <button className="btn sm ghost" disabled={stopping} onClick={() => void cancel()}>{stopping ? "Stopping…" : "Cancel import"}</button>}
      <button className="btn sm ghost" disabled={running} onClick={() => void loadPreview()}>Refresh</button>
      {error && <span className="hint err">{error}</span>}
    </div>
    {progress.length > 0 && <ul className="import-report">
      {progress.map((entry, index) => <li key={`${entry.label}:${entry.category}:${index}`}>
        <strong>{entry.label} · {categoryLabel(entry.category)}</strong> — {entry.state === "running"
          ? `${entry.imported.toLocaleString()} imported…`
          : entry.state === "error"
            ? <span className="hint err">{entry.detail ?? "Failed"}</span>
            : `${entry.imported.toLocaleString()} imported${entry.skipped ? ` · ${entry.skipped.toLocaleString()} skipped` : ""}${entry.detail ? ` · ${entry.detail}` : ""}`}
      </li>)}
      {done && <li className="hint">{cancelled ? "Import stopped — completed items remain available; the rest were not attempted."
        : error ? "Import stopped with an error; completed items remain available."
          : progress.some(e => e.state === "error" || (e.category === "tabs" && e.skipped > 0))
            ? "Import finished — some items could not be imported; the rest are available."
            : "Import finished."}</li>}
    </ul>}
    {done && progress.length === 0 && <p className="hint">{cancelled ? "Import stopped before any items were added." : error ? "Import stopped before any items were added." : "Import finished."}</p>}
  </div>;
}
