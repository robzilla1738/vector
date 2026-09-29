import { useCallback, useEffect, useRef, useState } from "react";
import {
  ImportJobStatusSchema,
  type AuxEvent,
  type ImportCategory,
  type ImportJobStatus,
  type ImportSelection,
  type ImportSourcePreview,
} from "@aux/contracts";
import { call } from "../store";
import { bridge } from "../bridge";
import "./ImportDataSetting.css";

type Selection = Record<string, Record<string, Partial<Record<ImportCategory, boolean>>>>;

function categoryLabel(category: string): string {
  return category === "bookmarks" ? "Bookmarks" : category === "history" ? "History" : "Open tabs";
}

function availability(entry: {
  available: boolean;
  count?: number;
  bytes?: number;
  blocker?: string;
}): string {
  if (entry.blocker) return entry.blocker;
  if (entry.count != null) return `${entry.count.toLocaleString()} found`;
  if (entry.bytes != null) return `${Math.max(1, Math.round(entry.bytes / 1048576))} MB`;
  return entry.available ? "Available" : "Nothing found";
}

function completion(job: ImportJobStatus): string {
  if (job.interrupted)
    return "Import interrupted when Aux stopped. Confirmed items remain available. Review the sources before retrying.";
  if (!job.done)
    return job.cancelled
      ? "Stopping after the current batch…"
      : "Import in progress. You can leave this page and return to check progress.";
  if (job.cancelled) return "Import stopped — completed items remain available; the rest were not attempted.";
  if (job.error) return "Import stopped with an error; completed items remain available.";
  if (
    job.progress.some((entry) => entry.state === "error" || (entry.category === "tabs" && entry.skipped > 0))
  )
    return "Import finished — some items could not be imported; the rest are available.";
  return "Import finished.";
}

/** Reviewed sources remain opt-in; receipt recovery never replays an import. */
export function ImportDataSetting() {
  const [preview, setPreview] = useState<ImportSourcePreview[] | null>(null);
  const [selection, setSelection] = useState<Selection>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progressError, setProgressError] = useState("");
  const [job, setJob] = useState<ImportJobStatus | null>(null);
  const [stopping, setStopping] = useState(false);
  const jobRef = useRef<ImportJobStatus | null>(null);
  const alive = useRef(true);
  const busy = useRef(false);

  const apply = useCallback((next: ImportJobStatus) => {
    if (!alive.current) return;
    const previous = jobRef.current;
    if (previous?.jobId === next.jobId && (previous.revision ?? 0) > (next.revision ?? 0)) return;
    if (previous?.jobId !== next.jobId && (previous?.startedAt ?? 0) > (next.startedAt ?? 0)) return;
    jobRef.current = next;
    setJob(next);
    setProgressError("");
    if (next.done) {
      setStopping(false);
      if (!previous || previous.jobId !== next.jobId || !previous.done) {
        setPreview(null);
        setSelection({});
      }
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    // Reading a receipt does not discover or open an installed browser Profile.
    void call("import.status", {})
      .then(apply)
      .catch(() => {});
    const unsubscribe = bridge.onEvent((event: AuxEvent) => {
      if (event.type !== "import.progress") return;
      const parsed = ImportJobStatusSchema.safeParse(event.payload);
      if (parsed.success) apply(parsed.data);
    });
    return () => {
      alive.current = false;
      unsubscribe();
    };
  }, [apply]);

  const syncProgress = useCallback(
    async (id: string) => {
      try {
        apply(await call("import.status", { jobId: id }));
      } catch {
        if (alive.current && jobRef.current?.jobId === id)
          setProgressError(
            "Progress is temporarily unavailable. The import may still be running; check again before retrying.",
          );
      }
    },
    [apply],
  );

  const running = !!job && !job.done;
  const activeJobId = running ? job.jobId : "";
  useEffect(() => {
    if (!activeJobId) return;
    let checking = false;
    const timer = window.setInterval(() => {
      if (checking) return;
      checking = true;
      void syncProgress(activeJobId).finally(() => {
        checking = false;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [activeJobId, syncProgress]);

  const loadPreview = async () => {
    if (busy.current || running) return;
    busy.current = true;
    setLoading(true);
    setError("");
    setPreview(null);
    setSelection({});
    try {
      const result = await call("import.preview", {});
      if (!alive.current) return;
      const next: Selection = {};
      for (const source of result.sources) {
        const profiles = source.profileCategories.length
          ? source.profileCategories
          : [{ profileId: "", categories: source.categories }];
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
      if (result.recentJobs?.[0]) apply(result.recentJobs[0]);
    } catch (reason) {
      if (alive.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      busy.current = false;
      if (alive.current) setLoading(false);
    }
  };

  const selected: ImportSelection[] = Object.entries(selection).flatMap(([sourceId, profiles]) =>
    Object.entries(profiles).flatMap(([profileId, entries]) => {
      const categories = (Object.entries(entries) as [ImportCategory, boolean][])
        .filter(([, on]) => on)
        .map(([category]) => category);
      return categories.length ? [{ sourceId, ...(profileId ? { profileId } : {}), categories }] : [];
    }),
  );

  const run = async () => {
    if (!preview || !selected.length || busy.current || running) return;
    busy.current = true;
    setLoading(true);
    setError("");
    setProgressError("");
    setStopping(false);
    try {
      const { jobId } = await call("import.run", { selections: selected });
      if (!alive.current) return;
      // Keep cancel/reconciliation available even if the first status read fails.
      if (jobRef.current?.jobId !== jobId)
        apply({
          jobId,
          done: false,
          cancelled: false,
          progress: [],
          selections: selected,
          startedAt: Date.now(),
        });
      await syncProgress(jobId);
    } catch (reason) {
      if (alive.current) setError(reason instanceof Error ? reason.message : String(reason));
      // Another window may have started the Profile's single active import.
      void call("import.status", {})
        .then(apply)
        .catch(() => {});
    } finally {
      busy.current = false;
      if (alive.current) setLoading(false);
    }
  };

  const cancel = async () => {
    const current = jobRef.current;
    if (!current || current.done || stopping) return;
    setStopping(true);
    try {
      await call("import.cancel", { jobId: current.jobId });
      await syncProgress(current.jobId);
    } catch (reason) {
      if (alive.current) {
        setStopping(false);
        setError(reason instanceof Error ? reason.message : String(reason));
      }
    }
  };

  return (
    <div className="import-setting">
      <p className="hint">
        Choose bookmarks and history from Chrome, Arc, Safari or Firefox. Arc Spaces and pinned pages become
        bookmark folders. Live tabs are available from an attached Chrome.
      </p>
      <p className="hint">
        Existing bookmarks keep their titles and folders. Matching bookmark URLs and history visits are
        skipped on retry. Passwords, cookies, extensions and agent permissions are not imported here.
      </p>
      <details>
        <summary>Keychain and macOS access</summary>
        <p className="hint">
          This bookmarks and history import does not ask for browser Keychain passwords. Aux may separately
          ask macOS to unlock its protected local storage. Review the app and purpose shown in the system
          prompt; you can cancel it. Password transfers are reviewed separately in Passwords &amp; Autofill.
          Reading Safari data may require Full Disk Access.
        </p>
      </details>
      {!preview && (
        <div className="row">
          <button className="btn sm" disabled={loading || running} onClick={() => void loadPreview()}>
            {loading ? "Checking…" : "See what can be imported"}
          </button>
        </div>
      )}
      {preview?.map((source) => (
        <fieldset className="import-source" key={source.id} disabled={running || loading}>
          <legend className="import-source-head">
            <strong>{source.label}</strong>
          </legend>
          {(source.profileCategories.length
            ? source.profileCategories
            : [{ profileId: "", categories: source.categories }]
          ).map((profile) => (
            <fieldset key={profile.profileId || source.id}>
              {profile.profileId && <legend className="hint">Profile: {profile.profileId}</legend>}
              {profile.categories.map((entry) => {
                const usable = entry.available && !entry.blocker;
                return (
                  <label className="import-row" key={entry.category}>
                    <input
                      type="checkbox"
                      disabled={!usable || running || loading}
                      checked={usable && !!selection[source.id]?.[profile.profileId]?.[entry.category]}
                      onChange={(event) =>
                        setSelection((current) => ({
                          ...current,
                          [source.id]: {
                            ...current[source.id],
                            [profile.profileId]: {
                              ...current[source.id]?.[profile.profileId],
                              [entry.category]: event.target.checked,
                            },
                          },
                        }))
                      }
                    />
                    <span>{categoryLabel(entry.category)}</span>
                    <span className="hint">{availability(entry)}</span>
                  </label>
                );
              })}
            </fieldset>
          ))}
        </fieldset>
      ))}
      <div className="row">
        {preview && !running && (
          <button className="btn sm" disabled={!selected.length || loading} onClick={() => void run()}>
            Import selected ({selected.reduce((count, item) => count + item.categories.length, 0)})
          </button>
        )}
        {running && (
          <button className="btn sm ghost" disabled={stopping || job.cancelled} onClick={() => void cancel()}>
            {stopping || job.cancelled ? "Stopping…" : "Cancel import"}
          </button>
        )}
        {preview && (
          <button className="btn sm ghost" disabled={running || loading} onClick={() => void loadPreview()}>
            Refresh
          </button>
        )}
        {error && (
          <span role="alert" className="hint err">
            {error}
          </span>
        )}
      </div>
      {job && (
        <section aria-label="Import progress">
          <output className="hint" aria-live="polite">
            {completion(job)}
          </output>
          {job.error && <p className="hint err">{job.error}</p>}
          {job.progress.length > 0 && (
            <ul className="import-report">
              {job.progress.map((entry) => (
                <li key={`${entry.source}:${entry.profileId ?? entry.label}:${entry.category}`}>
                  <strong>
                    {entry.label} · {categoryLabel(entry.category)}
                  </strong>{" "}
                  — {entry.imported.toLocaleString()} imported
                  {entry.skipped > 0 && ` · ${entry.skipped.toLocaleString()} skipped`}
                  {entry.state === "running" && "…"}
                  {entry.detail && (
                    <span className={entry.state === "error" ? "hint err" : "hint"}> · {entry.detail}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {progressError && (
            <p role="alert" className="hint err">
              {progressError}{" "}
              <button className="btn sm ghost" onClick={() => void syncProgress(job.jobId)}>
                Check progress
              </button>
            </p>
          )}
          {job.done &&
            (job.interrupted ||
              job.cancelled ||
              job.error ||
              job.progress.some(
                (entry) => entry.state === "error" || (entry.category === "tabs" && entry.skipped > 0),
              )) && (
              <>
                <p className="hint">
                  Review the current sources and select what to retry. Bookmarks and history merge safely.
                  Retrying live tabs can open duplicates. Counts cover confirmed batches; an interrupted
                  request may have added more.
                </p>
                <button className="btn sm ghost" disabled={loading} onClick={() => void loadPreview()}>
                  Review sources to retry
                </button>
              </>
            )}
        </section>
      )}
    </div>
  );
}
