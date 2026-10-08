import { orderedPages } from "../store/pages";
import { staticSmallIconButtonProps } from "../ui/class-props";
import { smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import "./Downloads.css";
import { useDownloadRenames } from "../features/download-naming/state";
import { executeCommand } from "../commands";
import { memo, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { Download } from "@aux/contracts";
import { useStore, errToast, call, toast } from "../store";
import { bridge } from "../bridge";
import { shellIconClose, shellIconDownloadSm, shellIconSearch } from "../ui/icons";
import { canDismissDownload, mergeDownloadSnapshot, visibleDownloads } from "../downloads";
import {
  staticNumericCountProps as auxClassNumericCountProps,
  staticSpacerProps as auxClassSpacerProps,
} from "../ui/class-props";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

function fmtSize(bytes: number | undefined): string {
  if (bytes === undefined) return "";
  if (bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STATE: Record<string, string> = {
  started: "Starting",
  progressing: "Downloading",
  completed: "Done",
  interrupted: "Interrupted",
  cancelled: "Cancelled",
};

type DownloadFilter = "all" | "active" | "finished" | "attention";

function downloadMatches(item: Download, query: string, filter: DownloadFilter): boolean {
  const matches = `${item.filename} ${item.sourceUrl ?? ""}`
    .toLocaleLowerCase()
    .includes(query.trim().toLocaleLowerCase());
  return (
    matches &&
    (filter === "all" ||
      (filter === "active" && ["started", "progressing"].includes(item.state)) ||
      (filter === "finished" && item.state === "completed") ||
      (filter === "attention" && ["interrupted", "cancelled"].includes(item.state)))
  );
}

const DownloadRow = memo(function DownloadRow({
  id,
  busy,
  rowError,
  retried,
  action,
  dismissDownloads,
  onRetried,
  setOverlay,
}: {
  id: string;
  busy: string | null;
  rowError?: string;
  retried: boolean;
  action(id: string, work: () => Promise<unknown>, fileAction?: boolean): Promise<void>;
  dismissDownloads(ids: string[]): Promise<void>;
  onRetried(id: string): void;
  setOverlay: ReturnType<typeof useStore.getState>["setOverlay"];
}) {
  const d = useStore((state) => state.downloads.find((item) => item.id === id));
  const rename = useDownloadRenames((state) =>
    state.receipts.find((item) => item.downloadId === id && item.expiresAt > Date.now()),
  );
  const sourcePage = useStore((state) =>
    orderedPages(state.pages).find(
      (page) =>
        page.pageId === d?.pageId &&
        !page.ownedByRuntime &&
        !["crashed", "detached"].includes(page.viewStatus ?? ""),
    ),
  );
  if (!d) return null;
  const active = d.state === "started" || d.state === "progressing";
  const pct = active && d.totalBytes ? Math.min(100, Math.round((d.size / d.totalBytes) * 100)) : null;
  return (
    <div className={`dl-row ${d.state}${d.paused ? " paused" : ""}`} role="group" aria-label={d.filename}>
      <span className="dl-ico">{shellIconDownloadSm}</span>
      <span className="dl-main">
        <span className="dl-name" title={d.path}>
          {d.filename}
        </span>
        <span className="dl-sub nums">
          {active
            ? pct !== null
              ? `${fmtSize(d.size)} of ${fmtSize(d.totalBytes)}`
              : `${fmtSize(d.size)}…`
            : fmtSize(d.size)}
          {" · "}
          <span className={`dl-state ${d.state}`}>{d.paused ? "Paused" : (STATE[d.state] ?? d.state)}</span>
          {d.warning && (
            <span className="dl-warn">
              {" · "}
              {d.warning === "executable" ? "Runs code when opened" : "Sent over an unencrypted connection"}
            </span>
          )}
          {d.state === "interrupted" &&
            !d.path &&
            (d.sourceUrl
              ? " · Choose an available folder, then Retry."
              : " · Download folder unavailable; choose a folder and retry from the page.")}
        </span>
        {active && (
          <span
            className="dl-bar"
            role="progressbar"
            aria-label={`${d.paused ? "Paused" : "Downloading"} ${d.filename}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct ?? undefined}
          >
            <span
              style={{ width: pct !== null ? `${pct}%` : "40%" }}
              className={pct === null ? "indeterminate" : ""}
            />
          </span>
        )}
      </span>
      <div className="dl-actions">
        {(d.paused || d.state === "interrupted") && d.canResume && (
          <button
            {...smallGhostButtonProps}
            disabled={busy !== null}
            onClick={() => void action(d.id, () => bridge.controlDownload(d.id, "resume"), true)}
          >
            Resume
          </button>
        )}
        {d.canCancel && (
          <>
            {!d.paused && d.state !== "interrupted" && (
              <button
                {...smallGhostButtonProps}
                disabled={busy !== null}
                onClick={() => void action(d.id, () => bridge.controlDownload(d.id, "pause"), true)}
              >
                Pause
              </button>
            )}
            <button
              {...smallGhostButtonProps}
              disabled={busy !== null}
              onClick={() => void action(d.id, () => bridge.controlDownload(d.id, "cancel"), true)}
            >
              Cancel
            </button>
          </>
        )}
        {!d.canCancel && !d.canResume && d.state !== "completed" && d.sourceUrl && (
          <button
            {...smallGhostButtonProps}
            title="Start a new download from the saved URL. Expired links or form-generated downloads may need the original page."
            disabled={busy !== null || retried}
            onClick={() =>
              void action(
                d.id,
                async () => {
                  await bridge.retryDownload(d.id);
                  onRetried(d.id);
                },
                true,
              )
            }
          >
            {retried ? "Retry requested" : "Retry"}
          </button>
        )}
        {sourcePage && (
          <button
            {...smallGhostButtonProps}
            title={`Return to ${sourcePage.title || sourcePage.url}`}
            onClick={() =>
              void useStore
                .getState()
                .activate(sourcePage.pageId)
                .then(() => {
                  if (useStore.getState().overlay === "downloads") setOverlay(null);
                })
                .catch(errToast)
            }
          >
            Source page
          </button>
        )}
        {d.state === "completed" && (
          <>
            <button
              {...smallGhostButtonProps}
              disabled={busy !== null}
              onClick={() =>
                void action(
                  d.id,
                  async () => {
                    const error = await bridge.openPath(d.path);
                    if (error)
                      throw new Error(
                        `Could not open ${d.filename}: ${error}. The file may have been moved or deleted.`,
                      );
                  },
                  true,
                )
              }
            >
              Open
            </button>
            <button
              {...smallGhostButtonProps}
              disabled={busy !== null}
              onClick={() =>
                void action(
                  d.id,
                  async () => {
                    if (!(await bridge.revealPath(d.path)))
                      throw new Error(
                        `Could not reveal ${d.filename}. The file may have been moved or deleted.`,
                      );
                  },
                  true,
                )
              }
            >
              Reveal
            </button>
          </>
        )}
        {rename && (
          <button
            {...smallGhostButtonProps}
            data-command-id="undo-download-rename"
            disabled={busy !== null}
            title={`Restore ${rename.originalName}`}
            onClick={() =>
              void action(
                d.id,
                () => executeCommand("undo-download-rename", { payload: { receiptId: rename.receiptId } }),
                true,
              )
            }
          >
            Undo rename
          </button>
        )}
        {canDismissDownload(d) && (
          <button
            {...staticSmallIconButtonProps}
            disabled={busy !== null}
            aria-label={`Remove ${d.filename} from downloads`}
            title="Remove from list; keep file"
            onClick={() => void dismissDownloads([d.id])}
          >
            {shellIconClose}
          </button>
        )}
      </div>
      {rowError && (
        <p className="dl-error" {...nativeAlertRoleProps}>
          {rowError}
        </p>
      )}
    </div>
  );
});

/** ⌘⇧J — in-flow shelf under the page with live progress. */
export function Downloads({ tabUrl, onClose }: { tabUrl?: string; onClose?: () => void } = {}) {
  const setOverlay = useStore((s) => s.setOverlay);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [showFolder, setShowFolder] = useState(false);
  const actionPending = useRef(false);
  const shelfRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<"all" | "active" | "finished" | "attention">("all");
  const itemCount = useStore(
    (state) => state.downloads.filter((item) => tabUrl === undefined || item.tabUrl === tabUrl).length,
  );
  const visibleIds = useStore(
    useShallow((state) =>
      state.downloads
        .filter(
          (item) => (tabUrl === undefined || item.tabUrl === tabUrl) && downloadMatches(item, query, filter),
        )
        .sort(
          (a, b) =>
            Number(["started", "progressing"].includes(b.state)) -
              Number(["started", "progressing"].includes(a.state)) || b.startedAt - a.startedAt,
        )
        .map((item) => item.id),
    ),
  );
  const dismissibleIds = useStore(
    useShallow((state) =>
      state.downloads
        .filter(
          (item) =>
            (tabUrl === undefined || item.tabUrl === tabUrl) &&
            downloadMatches(item, query, filter) &&
            canDismissDownload(item),
        )
        .map((item) => item.id),
    ),
  );

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [retried, setRetried] = useState<Set<string>>(() => new Set());
  const [folder, setFolder] = useState<{ path: string; custom: boolean; error?: string } | null>(null);
  const [folderLoading, setFolderLoading] = useState(false);
  const [folderError, setFolderError] = useState("");
  const [folderRefresh, setFolderRefresh] = useState(0);
  const folderRequest = useRef(0);
  useEffect(() => {
    if (!showFolder || bridge.privateMode) return;
    const version = ++folderRequest.current;
    setFolderLoading(true);
    setFolderError("");
    void bridge
      .downloadFolder()
      .then((value) => {
        if (version === folderRequest.current) setFolder(value);
      })
      .catch((reason) => {
        if (version === folderRequest.current) setFolderError(errorMessage(reason));
      })
      .finally(() => {
        if (version === folderRequest.current) setFolderLoading(false);
      });
    return () => {
      ++folderRequest.current;
    };
  }, [showFolder, folderRefresh, refresh]);
  async function changeFolder(reset = false) {
    if (actionPending.current) return;
    ++folderRequest.current;
    setFolderLoading(false);
    setFolderError("");
    await action("folder", async () => {
      try {
        const selected = await bridge.chooseDownloadFolder(reset);
        ++folderRequest.current;
        setFolderLoading(false);
        setFolder(selected);
      } catch (reason) {
        setFolderError(errorMessage(reason));
      }
    });
  }

  useEffect(() => {
    let live = true;
    setLoading(true);
    setLoadError("");
    const updated = new Set<string>();
    const removed = new Set<string>();
    const offRemoved = bridge.onDownloadsRemoved(({ ids }) => {
      for (const id of ids) removed.add(id);
    });
    const offEvents = bridge.onEvent((event) => {
      if (event.type === "downloads.removed" && Array.isArray(event.payload.ids))
        for (const id of event.payload.ids) if (typeof id === "string") removed.add(id);
    });
    const unsubscribe = bridge.onDownload((value) => {
      if (value && typeof value === "object" && "id" in value && typeof value.id === "string")
        updated.add(value.id);
      if (value && typeof value === "object" && "state" in value && value.state === "interrupted")
        setFolderRefresh((current) => current + 1);
    });
    void bridge
      .downloadsSnapshot()
      .then((downloads) => {
        if (!live) return;
        useStore.setState((state) => ({
          downloads: mergeDownloadSnapshot(state.downloads, downloads, updated, removed),
        }));
      })
      .catch((reason) => {
        if (live) setLoadError(errorMessage(reason));
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
      unsubscribe();
      offEvents();
      offRemoved();
    };
  }, [refresh]);
  async function action(id: string, work: () => Promise<unknown>, fileAction = false) {
    if (actionPending.current) return;
    actionPending.current = true;
    setBusy(id);
    if (fileAction)
      setRowErrors((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    else setError("");
    const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const restoreFocus = !!focused && !!shelfRef.current?.contains(focused);
    try {
      await work();
    } catch (reason) {
      const message = errorMessage(reason);
      if (fileAction) setRowErrors((current) => ({ ...current, [id]: message }));
      else setError(message);
    } finally {
      actionPending.current = false;
      setBusy(null);
      if (restoreFocus)
        requestAnimationFrame(() => {
          if (document.activeElement !== document.body) return;
          if (focused?.isConnected) focused.focus();
          else searchRef.current?.focus();
        });
    }
  }

  const dismissDownloads = (ids: string[]) =>
    action("clear", async () => {
      let count = 0;
      for (let offset = 0; offset < ids.length; offset += 200) {
        const result = await call("downloads.remove", { ids: ids.slice(offset, offset + 200) });
        const removed = new Set(result.removed);
        count += removed.size;
        useStore.setState((state) => ({
          downloads: visibleDownloads(state.downloads.filter((item) => !removed.has(item.id))),
        }));
      }
      toast(
        count ? "Removed from the list. Files remain on your computer." : "No inactive downloads to remove.",
      );
    });

  return (
    <section ref={shelfRef} className="shelf slide-up" aria-label="Downloads">
      <div className="shelf-head">
        <span>Downloads</span>
        <span {...auxClassNumericCountProps}>{itemCount}</span>
        <span {...auxClassSpacerProps} />
        {!!dismissibleIds.length && (
          <button
            {...smallGhostButtonProps}
            disabled={busy !== null}
            title="Remove inactive downloads matching this view. Files remain on your computer."
            onClick={() => void dismissDownloads(dismissibleIds)}
          >
            Clear list
          </button>
        )}
        {!bridge.privateMode && (
          <button
            {...smallGhostButtonProps}
            aria-expanded={showFolder}
            onClick={() => setShowFolder(!showFolder)}
          >
            Save location
          </button>
        )}
        <button
          {...smallGhostButtonProps}
          disabled={loading || busy !== null}
          onClick={() => setRefresh((value) => value + 1)}
        >
          Refresh
        </button>
        <button
          {...staticSmallIconButtonProps}
          title="Close (Esc)"
          aria-label="Close downloads"
          onClick={() => (onClose ? onClose() : setOverlay(null))}
        >
          {shellIconClose}
        </button>
      </div>
      <div className="download-tools">
        <label className="download-search">
          {shellIconSearch}
          <input
            ref={searchRef}
            autoFocus={!!onClose}
            aria-label="Search downloads"
            placeholder="Find a download…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="download-filters" role="group" aria-label="Filter downloads">
          {(
            [
              ["all", "All"],
              ["active", "In progress"],
              ["finished", "Finished"],
              ["attention", "Needs attention"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              {...smallGhostButtonProps}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {loadError && (
        <p className="download-error" {...nativeAlertRoleProps}>
          Couldn’t refresh downloads. {loadError}{" "}
          <button
            {...smallGhostButtonProps}
            disabled={loading || busy !== null}
            onClick={() => setRefresh((value) => value + 1)}
          >
            Try again
          </button>
        </p>
      )}
      {error && (
        <p className="download-error" {...nativeAlertRoleProps}>
          {error}
        </p>
      )}
      {bridge.privateMode ? (
        <p className="download-private-note">
          Choose a save location for each private download. Files remain on your computer after this window
          closes.
        </p>
      ) : (
        showFolder && (
          <section
            className="download-location"
            aria-label="Download save location"
            aria-busy={folderLoading}
          >
            {folderLoading && (
              <output className="download-private-note" data-block>
                Loading save location…
              </output>
            )}
            {folder && (
              <div className="download-folder">
                <span className="download-folder-path" title={folder.path}>
                  Save to <span className="selectable">{folder.path}</span>
                </span>
                <button
                  {...smallGhostButtonProps}
                  disabled={busy !== null}
                  onClick={() => void changeFolder()}
                >
                  Change folder
                </button>
                {(folder.custom || folder.error) && (
                  <button
                    {...smallGhostButtonProps}
                    disabled={busy !== null}
                    onClick={() => void changeFolder(true)}
                  >
                    Use default
                  </button>
                )}
              </div>
            )}
            {(folderError || folder?.error) && (
              <p className="download-error" {...nativeAlertRoleProps}>
                {folderError || folder?.error}{" "}
                <button
                  {...smallGhostButtonProps}
                  disabled={folderLoading || busy !== null}
                  onClick={() => setFolderRefresh((value) => value + 1)}
                >
                  Retry location
                </button>
              </p>
            )}
          </section>
        )
      )}
      <div className="download-list" aria-busy={loading}>
        {loading && !itemCount && (
          <output className="shelf-empty" data-block>
            Loading downloads…
          </output>
        )}
        {!loading && !loadError && !visibleIds.length && (
          <div className="shelf-empty">
            {itemCount
              ? "No downloads match. Try another name or filter."
              : "No files yet. Your downloads will appear here."}
          </div>
        )}
        {visibleIds.map((id) => (
          <DownloadRow
            key={id}
            id={id}
            busy={busy}
            rowError={rowErrors[id]}
            retried={retried.has(id)}
            action={action}
            dismissDownloads={dismissDownloads}
            onRetried={(id) => setRetried((current) => new Set([...current, id]))}
            setOverlay={setOverlay}
          />
        ))}
      </div>
    </section>
  );
}
