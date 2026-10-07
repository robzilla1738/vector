import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BrowserExportSourceSchema,
  BrowserExportFormatSchema,
  type BrowserExportSource,
  type BrowserExportFormat,
  ImportJobStatusSchema,
  ChromeWebStoreIdSchema,
  type ImportExtensionReview,
  type AuxEvent,
  type ImportCategory,
  type ImportJobStatus,
  type ImportSelection,
  type ImportSourcePreview,
} from "@aux/contracts";
import { call } from "../store";
import { bridge } from "../bridge";
import "./ImportDataSetting.css";
import { staticErrorHintProps as auxClassErrorHintProps } from "../ui/class-props";
import {
  nativeCheckboxTypeProps,
  nativeAlertRoleProps,
  nativePoliteLiveProps,
} from "../ui/native-attribute-props";

function counterpartId(value: string): string | undefined {
  const trimmed = value.trim();
  if (ChromeWebStoreIdSchema.safeParse(trimmed).success) return trimmed;
  try {
    const url = new URL(trimmed);
    const id = url.pathname.split("/").at(-1);
    if (
      url.protocol === "https:" &&
      url.hostname === "chromewebstore.google.com" &&
      !url.username &&
      !url.password &&
      url.pathname.startsWith("/detail/") &&
      id &&
      ChromeWebStoreIdSchema.safeParse(id).success
    )
      return id;
  } catch {
    /* Show a validation message; never infer an ID from a name. */
  }
  return undefined;
}
const reviewKey = (sourceId: string, profileId: string) => JSON.stringify([sourceId, profileId]);
type ExtensionReviewState = {
  review: ImportExtensionReview;
  choices: Record<string, { selected: boolean; counterpart: string }>;
};

type Selection = Record<string, Record<string, Partial<Record<ImportCategory, boolean>>>>;

function categoryLabel(category: string): string {
  return (
    (
      {
        bookmarks: "Bookmarks",
        history: "History",
        tabs: "Open tabs",
        passwords: "Passwords",
        extensions: "Extensions",
      } as Record<string, string>
    )[category] ?? category
  );
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
    return "Native import completion is unknown. Some accepted items may already be imported. Review before starting another import.";
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
  const [exportSource, setExportSource] = useState<BrowserExportSource>("safari");
  const [exportFormat, setExportFormat] = useState<BrowserExportFormat>("safari-archive");
  const [selectionId, setSelectionId] = useState<string>();
  const [selectingSource, setSelectingSource] = useState(false);
  const [preview, setPreview] = useState<ImportSourcePreview[] | null>(null);
  const [selection, setSelection] = useState<Selection>({});
  const [extensionReviews, setExtensionReviews] = useState<Record<string, ExtensionReviewState>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progressError, setProgressError] = useState("");
  const [job, setJob] = useState<ImportJobStatus | null>(null);
  const [stopping, setStopping] = useState(false);
  const [acknowledgeJobId, setAcknowledgeJobId] = useState<string>();
  const jobRef = useRef<ImportJobStatus | null>(null);
  const alive = useRef(true);
  const busy = useRef(false);
  const pendingCancels = useRef(new Set<string>());

  const apply = useCallback((next: ImportJobStatus) => {
    if (!alive.current) return;
    const previous = jobRef.current;
    if (previous?.jobId === next.jobId && (previous.revision ?? 0) > (next.revision ?? 0)) return;
    if (previous?.jobId !== next.jobId && (previous?.startedAt ?? 0) > (next.startedAt ?? 0)) return;
    jobRef.current = next;
    setJob(next);
    setProgressError("");
    if (previous?.jobId !== next.jobId) setStopping(false);
    if (next.done) {
      setStopping(false);
      if (!previous || previous.jobId !== next.jobId || !previous.done) {
        setPreview(null);
        setSelection({});
        setExtensionReviews({});
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

  const interrupted = !!job?.interrupted && !!job.nativeOperations?.some((op) => op.state === "unknown");
  const running = !!job && !job.done && !job.acknowledged && !(interrupted && acknowledgeJobId === job.jobId);
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

  useEffect(() => {
    if (!selectionId) return;
    let active = true;
    let checking = false;
    const poll = async () => {
      if (checking) return;
      checking = true;
      try {
        const receipt = await call("import.exportStatus", { selectionId });
        if (!active || !alive.current) return;
        if (receipt.unknown || receipt.done) {
          setSelectionId(undefined);
          setSelectingSource(false);
          if (receipt.sources) {
            setPreview(receipt.sources);
            setSelection({});
            setExtensionReviews({});
          }
          if (receipt.error || receipt.unknown)
            setError(
              receipt.error ?? "The native browser selection was interrupted. Review its source again.",
            );
        }
      } catch (e) {
        if (active && alive.current) setError(errorMessage(e));
      } finally {
        checking = false;
      }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 500);
    return () => {
      active = false;
      window.clearInterval(timer);
      void call("import.cancelExport", { selectionId }).catch(() => {});
    };
  }, [selectionId]);

  const chooseSource = async (kind: "file" | "safari-window") => {
    if (busy.current || running || selectingSource) return;
    busy.current = true;
    setSelectingSource(true);
    setError("");
    try {
      const receipt =
        kind === "safari-window"
          ? await call("import.selectWindow", { sourceId: "safari" })
          : await call("import.selectExport", { sourceId: exportSource, format: exportFormat });
      if (!alive.current) {
        await call("import.cancelExport", receipt);
        return;
      }
      setSelectionId(receipt.selectionId);
    } catch (e) {
      if (alive.current) {
        setError(errorMessage(e));
        setSelectingSource(false);
      }
    } finally {
      busy.current = false;
    }
  };
  const loadPreview = async () => {
    if (busy.current || selectingSource || (running && !interrupted)) return;
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
      if (alive.current) setError(errorMessage(reason));
    } finally {
      busy.current = false;
      if (alive.current) setLoading(false);
    }
  };

  const reviewExtensions = async (sourceId: string, profileId: string) => {
    if (busy.current || running || !profileId) return;
    busy.current = true;
    setLoading(true);
    setError("");
    try {
      const review = await call("import.extensions.review", { sourceId, profileId });
      if (!alive.current) return;
      setExtensionReviews((current) => ({
        ...current,
        [reviewKey(sourceId, profileId)]: {
          review,
          choices: Object.fromEntries(
            review.candidates.map((candidate) => [
              candidate.candidateId,
              {
                selected: false,
                counterpart: candidate.chromeWebStoreId ?? "",
              },
            ]),
          ),
        },
      }));
    } catch (reason) {
      if (alive.current) setError(errorMessage(reason));
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
      const reviewed = extensionReviews[reviewKey(sourceId, profileId)];
      const extensionReview =
        categories.includes("extensions") && reviewed
          ? {
              reviewId: reviewed.review.reviewId,
              choices: reviewed.review.candidates.map((candidate) => {
                const choice = reviewed.choices[candidate.candidateId];
                const id = choice?.selected ? counterpartId(choice.counterpart) : undefined;
                return id
                  ? { candidateId: candidate.candidateId, chromeWebStoreId: id }
                  : { candidateId: candidate.candidateId, skip: true as const };
              }),
            }
          : undefined;
      return categories.length
        ? [
            {
              sourceId,
              ...(profileId ? { profileId } : {}),
              categories,
              ...(extensionReview ? { extensionReview } : {}),
            },
          ]
        : [];
    }),
  );

  const extensionReviewReady = selected.every((item) => {
    if (!item.categories.includes("extensions")) return true;
    const review = extensionReviews[reviewKey(item.sourceId, item.profileId ?? "")];
    return (
      !!review &&
      Object.values(review.choices).every((choice) => !choice.selected || !!counterpartId(choice.counterpart))
    );
  });
  const run = async () => {
    if (!preview || !selected.length || !extensionReviewReady || busy.current || running) return;
    busy.current = true;
    setLoading(true);
    setError("");
    setProgressError("");
    setStopping(false);
    try {
      const { jobId } = await call("import.run", {
        selections: selected,
        ...(acknowledgeJobId ? { acknowledgeInterruptedJobId: acknowledgeJobId } : {}),
      });
      setAcknowledgeJobId(undefined);
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
      if (alive.current) setError(errorMessage(reason));
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
    if (!current || current.done || pendingCancels.current.has(current.jobId)) return;
    pendingCancels.current.add(current.jobId);
    setStopping(true);
    try {
      await call("import.cancel", { jobId: current.jobId });
      await syncProgress(current.jobId);
    } catch (reason) {
      if (alive.current && jobRef.current?.jobId === current.jobId && !jobRef.current.done) {
        setStopping(false);
        setError(errorMessage(reason));
      }
    } finally {
      pendingCancels.current.delete(current.jobId);
    }
  };

  return (
    <div className="import-setting">
      <p {...staticHintProps}>
        Choose available data from detected browser Profiles. Nothing is imported until you confirm.
      </p>
      <p {...staticHintProps}>
        Passwords transfer inside the native browser. Extensions reinstall from the Chrome Web Store with
        their own permission prompts. Cookies and agent permissions are not copied.
      </p>
      <details>
        <summary>Folders and retries</summary>
        <p {...staticHintProps}>
          Imported bookmark folders and pinned tabs retain their source structure. Existing bookmarks are not
          overwritten. A fresh import can add duplicate bookmarks or tabs.
        </p>
      </details>
      <details>
        <summary>Keychain and macOS access</summary>
        <p {...staticHintProps}>
          Password or encrypted-tab import may ask macOS to unlock the source browser’s Safe Storage key.
          Check the app and purpose in the system prompt; you can cancel it. Keys and password text stay in
          the native browser.
        </p>
      </details>
      {interrupted && !job?.acknowledged && (
        <label {...staticHintProps}>
          <input
            {...nativeCheckboxTypeProps}
            checked={acknowledgeJobId === job?.jobId}
            onChange={(event) => setAcknowledgeJobId(event.target.checked ? job?.jobId : undefined)}
          />
          I understand some accepted items may already be imported. Start a separately reviewed import.
        </label>
      )}
      {!preview && (
        <div {...staticRowProps}>
          <button {...smallButtonProps} disabled={loading || running} onClick={() => void loadPreview()}>
            {loading ? "Checking…" : "See what can be imported"}
          </button>
        </div>
      )}
      <div {...staticRowProps}>
        <button
          {...smallButtonProps}
          disabled={running || selectingSource || loading}
          onClick={() => void chooseSource("safari-window")}
        >
          Choose a Safari window
        </button>
        <span {...staticHintProps}>
          Safari cannot identify private windows. Review one window in the native sheet before copying its
          tabs.
        </span>
      </div>
      {selectingSource && (
        <div {...staticRowProps}>
          <span {...staticHintProps}>Waiting for the original native browser review…</span>
          {selectionId && (
            <button
              {...smallGhostButtonProps}
              onClick={() =>
                void call("import.cancelExport", { selectionId }).catch((e) => setError(errorMessage(e)))
              }
            >
              Cancel browser selection
            </button>
          )}
        </div>
      )}
      <details>
        <summary>Choose a browser export</summary>
        <p {...staticHintProps}>
          Safari archives offer separate exported history and extension files, plus shared bookmarks and
          passwords. File names are displayed as exported; Aux does not infer which files belong to the same
          Safari Profile. For Firefox or another browser, choose its exported bookmarks or passwords.
          Available Firefox Profiles also expose their saved non-private tabs. To import an exported selection
          of Firefox tabs, bookmark those tabs and export them as HTML. Safari tabs and cross-browser
          extension equivalents are not imported by these export formats.
        </p>
        <div {...staticRowProps}>
          <label>
            Browser{" "}
            <select
              aria-label="Export browser"
              value={exportSource}
              disabled={running || selectingSource}
              onChange={(event) => {
                const parsed = BrowserExportSourceSchema.safeParse(event.target.value);
                if (parsed.success) {
                  setExportSource(parsed.data);
                  if (parsed.data !== "safari" && exportFormat === "safari-archive")
                    setExportFormat("bookmarks-html");
                }
              }}
            >
              {BrowserExportSourceSchema.options.map((id) => (
                <option key={id} value={id}>
                  {
                    {
                      chrome: "Chrome",
                      arc: "Arc",
                      safari: "Safari",
                      firefox: "Firefox",
                      edge: "Edge",
                      brave: "Brave",
                      dia: "Dia",
                      comet: "Comet",
                      atlas: "Atlas",
                    }[id]
                  }
                </option>
              ))}
            </select>
          </label>
          <label>
            Export format{" "}
            <select
              aria-label="Browser export format"
              value={exportFormat}
              disabled={running || selectingSource}
              onChange={(event) => {
                const parsed = BrowserExportFormatSchema.safeParse(event.target.value);
                if (parsed.success) setExportFormat(parsed.data);
              }}
            >
              {exportSource === "safari" && <option value="safari-archive">Safari archive (ZIP)</option>}
              <option value="bookmarks-html">Bookmarks (HTML)</option>
              <option value="passwords-csv">Passwords (CSV)</option>
              <option value="tabs-html">Chosen tabs bookmarked as HTML</option>
            </select>
          </label>
          <button
            {...smallButtonProps}
            disabled={running || selectingSource || loading}
            onClick={() => void chooseSource("file")}
          >
            {selectingSource ? "Waiting for native browser review…" : "Choose export file"}
          </button>
        </div>
        <p {...staticHintProps}>
          Exports can contain unencrypted passwords. Aux reads the selected file inside the native browser;
          password text is never sent to the runtime. Delete exported password files when finished.
        </p>
      </details>
      {preview?.map((source) => (
        <fieldset className="import-source" key={source.id} disabled={running || loading}>
          <legend className="import-source-head">
            <strong>{source.label}</strong>
          </legend>
          {(source.profileCategories.length
            ? source.profileCategories
            : [{ profileId: "", kind: undefined, label: undefined, categories: source.categories }]
          ).map((profile) => (
            <fieldset key={profile.profileId || source.id}>
              {profile.profileId && (
                <legend {...staticHintProps}>
                  {profile.kind === "export-file"
                    ? "Exported data file"
                    : profile.kind === "shared-export"
                      ? "Shared export"
                      : "Profile"}
                  : {profile.label ?? profile.profileId}
                </legend>
              )}
              {profile.categories.map((entry) => {
                const usable = entry.available && !entry.blocker;
                return (
                  <label className="import-row" key={entry.category}>
                    <input
                      {...nativeCheckboxTypeProps}
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
                    <span {...staticHintProps}>{availability(entry)}</span>
                  </label>
                );
              })}
              {profile.categories.some(
                (entry) => entry.category === "extensions" && entry.available && !entry.blocker,
              ) && (
                <div className="import-extension-review">
                  <button
                    {...smallGhostButtonProps}
                    disabled={running || loading}
                    onClick={() => void reviewExtensions(source.id, profile.profileId)}
                  >
                    Review extensions
                  </button>
                  {extensionReviews[reviewKey(source.id, profile.profileId)]?.review.candidates.map(
                    (candidate) => {
                      const key = reviewKey(source.id, profile.profileId);
                      const current = extensionReviews[key]!;
                      const choice = current.choices[candidate.candidateId]!;
                      const update = (patch: Partial<typeof choice>) =>
                        setExtensionReviews((reviews) => ({
                          ...reviews,
                          [key]: {
                            ...reviews[key]!,
                            choices: {
                              ...reviews[key]!.choices,
                              [candidate.candidateId]: {
                                ...reviews[key]!.choices[candidate.candidateId]!,
                                ...patch,
                              },
                            },
                          },
                        }));
                      return (
                        <div key={candidate.candidateId}>
                          <label className="import-row">
                            <input
                              {...nativeCheckboxTypeProps}
                              checked={choice.selected}
                              disabled={running || loading}
                              onChange={(event) => update({ selected: event.target.checked })}
                            />
                            <span>
                              {candidate.name}
                              {candidate.enabled === false ? " (disabled in source)" : ""}
                            </span>
                            <span {...staticHintProps}>
                              {candidate.kind === "cws" ? "Chrome Web Store" : candidate.kind}
                            </span>
                          </label>
                          <p {...staticHintProps}>{candidate.detail}</p>
                          <label>
                            Chrome Web Store counterpart
                            <input
                              type="text"
                              aria-label={`Chrome Web Store counterpart for ${candidate.name}`}
                              maxLength={8192}
                              value={choice.counterpart}
                              disabled={running || loading}
                              placeholder="Chrome Web Store link or extension ID"
                              onChange={(event) => update({ counterpart: event.target.value })}
                            />
                          </label>
                          {choice.selected && !counterpartId(choice.counterpart) && (
                            <p {...auxClassErrorHintProps}>
                              Choose a valid Chrome Web Store link or ID, or leave this item unselected.
                            </p>
                          )}
                          {!choice.selected && (
                            <p {...staticHintProps}>Skipped; no counterpart will be installed.</p>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </fieldset>
          ))}
        </fieldset>
      ))}
      <div {...staticRowProps}>
        {preview && !running && (
          <button
            {...smallButtonProps}
            disabled={!selected.length || !extensionReviewReady || loading}
            onClick={() => void run()}
          >
            Import selected ({selected.reduce((count, item) => count + item.categories.length, 0)})
          </button>
        )}
        {running && (
          <button
            {...smallGhostButtonProps}
            disabled={stopping || job.cancelled}
            onClick={() => void cancel()}
          >
            {stopping || job.cancelled ? "Stopping…" : "Cancel import"}
          </button>
        )}
        {preview && (
          <button {...smallGhostButtonProps} disabled={running || loading} onClick={() => void loadPreview()}>
            Refresh
          </button>
        )}
        {error && (
          <span {...nativeAlertRoleProps} {...auxClassErrorHintProps}>
            {error}
          </span>
        )}
      </div>
      {job && (
        <section aria-label="Import progress">
          <output {...staticHintProps} {...nativePoliteLiveProps}>
            {completion(job)}
          </output>
          {job.error && <p {...auxClassErrorHintProps}>{job.error}</p>}
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
            <p {...nativeAlertRoleProps} {...auxClassErrorHintProps}>
              {progressError}{" "}
              <button {...smallGhostButtonProps} onClick={() => void syncProgress(job.jobId)}>
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
                <p {...staticHintProps}>
                  Review sources and select what to import next. A fresh import can add duplicates. Counts
                  cover confirmed native completion; an interrupted request may have accepted more.
                </p>
                <button {...smallGhostButtonProps} disabled={loading} onClick={() => void loadPreview()}>
                  Review sources to retry
                </button>
              </>
            )}
        </section>
      )}
    </div>
  );
}
