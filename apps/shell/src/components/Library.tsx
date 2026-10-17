import { orderedPages } from "../store/pages";
import { staticSmallIconButtonProps, staticFieldInputProps, staticIconButtonProps } from "../ui/class-props";
import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { availableForFocus, ownsFocus } from "../ui/focus";
import { ArchivedTabs } from "./ArchivedTabs";
import "./Library.css";
import { ActionMenu } from "../ui";
import { NewBookmarkDialog } from "./NewBookmarkDialog";
import { SavedPageActions } from "./SavedPageActions";
import { FavIcon } from "./SiteTile";
import { BookmarkFolderNavigation } from "./BookmarkFolderNavigation";
import { backgroundLink } from "../browser-links";
import { readReaderArticle } from "../reader-article";
import { moveListFocus } from "../keyboard-list";
import { SessionRecovery } from "./SessionRecovery";
import { Fragment, memo, useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useShallow } from "zustand/react/shallow";
import type { HistoryEntry } from "@aux/contracts";
import type {
  BookmarkFolder,
  BookmarkFolderChange,
  BookmarkFolderSnapshot,
  BookmarkPlacement,
} from "@aux/contracts/bookmark-folder-methods";
import {
  bookmarkSource,
  bookmarkFolderLabel,
  changeBookmarkFolder,
  createBookmark,
  editBookmark,
  folderDestination,
  folderSource,
  readBookmarkFolders,
  removeBookmark,
  restoreBookmark,
  openBookmark,
  placeBookmark,
  descendantBookmarkIds,
} from "../bookmark-folders";
import { call, useStore } from "../store";
import { hostOf } from "../workspace";
import {
  shellIconArchive,
  shellIconClock,
  shellIconReopen,
  shellIconResult,
  shellIconBookmark,
  shellIconBookmarkFill,
  shellIconCheck,
  shellIconCircle,
  shellIconClose,
  shellIconDownloadSm,
  shellIconFolderClosed,
  shellIconPencil,
  shellIconRight,
  shellIconSearch,
  shellIconTrash,
} from "../ui/icons";
import { bridge, inNativeHost } from "../bridge";
import { BookmarkImportFileInput, BookmarkImportReview, useBookmarkFileImport } from "./BookmarkFileImport";
import { RecentlyClosed } from "./RecentlyClosed";
import { ClearHistory } from "./ClearHistory";
import { OpenBookmarkFolder } from "./OpenBookmarkFolder";
import { exportBookmarkFile, bookmarkWebUrl } from "../bookmark-files";
import { useShortcutLabels } from "../use-shortcut-label";
import { SkeletonRows } from "./Skeleton";
import { openPeekLink } from "../peek-link";
import { useFeature } from "../use-feature";

import { LibraryButton, useLibraryReadOwner, useLibraryCurrent, useLibraryControl } from "./LibraryControls";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";
import {
  staticSpacerProps as auxClassSpacerProps,
  staticTextProps as auxClassTextProps,
} from "../ui/class-props";
import { nativeCheckboxTypeProps, nativeAlertRoleProps } from "../ui/native-attribute-props";

type SavedPage = {
  nodeId?: string;
  parentId?: string;
  index?: number;
  url: string;
  title: string;
  folderPath?: string[];
  readingList?: boolean;
  readAt?: number;
  offline?: boolean;
};
type BookmarkEditor = SavedPage & {
  original: SavedPage;
  source: BookmarkPlacement["source"];
  destinationId: string;
};
type RemovedBookmark = { title: string; undoToken: string };
const bookmarkKey = (item: SavedPage) => item.nodeId ?? item.url;
type View = "archived" | "bookmarks" | "reading" | "history" | "closed";
const VIEWS: View[] = ["archived", "bookmarks", "reading", "history", "closed"];
const VIEW_NAMES: Record<View, string> = {
  archived: "Archived tabs",
  bookmarks: "Bookmarks",
  reading: "Reading list",
  history: "History",
  closed: "Recently closed",
};
const HISTORY_PAGE_SIZE = 100;
function historySince(range: string): number | undefined {
  if (range === "all") return undefined;
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (range === "week" ? 6 : range === "month" ? 29 : 0));
  return date.getTime();
}
const dayOf = (item: SavedPage | HistoryEntry) =>
  "visitedAt" in item
    ? new Date(item.visitedAt).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

const SavedPageRow = memo(function SavedPageRow({
  view,
  itemKey,
  position,
  selected,
  selecting,
  busy,
  showFolderPath,
  editing,
  snapshot,
  firstResult,
  onSelect,
  onOpen,
  action,
  setEditing,
  setRemoved,
  setNotice,
  cancelEditor,
}: {
  view: "bookmarks" | "reading";
  itemKey: string;
  position: number;
  selected: boolean;
  selecting: boolean;
  busy: boolean;
  showFolderPath: boolean;
  editing: BookmarkEditor | null;
  snapshot: BookmarkFolderSnapshot | null;
  firstResult?: RefObject<HTMLButtonElement | null>;
  onSelect(item: SavedPage): void;
  onOpen(item: SavedPage, background?: boolean, trigger?: HTMLElement): void;
  action(work: () => Promise<void>): Promise<void>;
  setEditing: React.Dispatch<React.SetStateAction<BookmarkEditor | null>>;
  setRemoved: React.Dispatch<React.SetStateAction<RemovedBookmark | null>>;
  setNotice: React.Dispatch<React.SetStateAction<string>>;
  cancelEditor(): void;
}) {
  const canPeek = useFeature("peek");
  useStore((state) => {
    const item = state.bookmarks[position];
    return item && bookmarkKey(item) === itemKey
      ? JSON.stringify([
          item.nodeId,
          item.url,
          item.title,
          item.folderPath,
          item.readingList,
          item.readAt,
          item.offline,
        ])
      : "";
  });
  const item = useStore.getState().bookmarks[position];
  const favicon = useStore(
    (state) => orderedPages(state.pages).find((page) => page.url === item?.url)?.favicon,
  );
  const offlinePage = useStore((state) =>
    view === "reading"
      ? orderedPages(state.pages).find(
          (page) => page.url === item?.url && page.backend === "aux" && !page.ownedByRuntime,
        )
      : undefined,
  );
  if (!item || bookmarkKey(item) !== itemKey) return null;
  const title = item.title || hostOf(item.url);
  return (
    <div
      className={`library-item${selected ? " selected" : ""}${view === "reading" && item.readAt ? " read" : ""}`}
    >
      {view === "bookmarks" && selecting && (
        <input
          className="library-select"
          {...nativeCheckboxTypeProps}
          aria-label={`Select ${title}`}
          checked={selected}
          disabled={busy}
          onChange={() => onSelect(item)}
        />
      )}
      <button
        ref={firstResult}
        className="library-open"
        disabled={busy}
        onClick={(event) =>
          view === "bookmarks" && selecting
            ? onSelect(item)
            : onOpen(item, backgroundLink(event), event.currentTarget)
        }
        onAuxClick={(event) => {
          if (event.button === 1) {
            event.preventDefault();
            if (!selecting) onOpen(item, true, event.currentTarget);
          }
        }}
        title={`${title} — ${item.url}`}
      >
        {view === "bookmarks" && (
          <span className="library-bookmark-icon" aria-hidden="true">
            <FavIcon url={item.url} src={favicon} size="sm" />
          </span>
        )}
        <span className="library-row-heading">
          <span className="library-title">{title}</span>
        </span>
        <span className="library-url">{item.url}</span>
        {showFolderPath && item.folderPath?.length ? (
          <span {...staticHintProps}>{item.folderPath.join(" / ")}</span>
        ) : null}
      </button>
      <SavedPageActions
        title={title}
        menu={view === "bookmarks"}
        hidden={view === "bookmarks" && selecting}
        disabled={busy}
      >
        {canPeek && bookmarkWebUrl(item.url) && (
          <button
            {...staticSmallIconButtonProps}
            title="Preview link"
            disabled={busy}
            aria-label={`Preview ${title}`}
            onClick={() => {
              useStore.getState().setOverlay(null);
              void openPeekLink(item.url).catch((error) => useStore.getState().toast(errorMessage(error)));
            }}
          >
            {shellIconSearch}
            {view === "bookmarks" && <span>Preview link</span>}
          </button>
        )}
        {view === "bookmarks" ? (
          <>
            <button
              {...staticSmallIconButtonProps}
              title="Edit bookmark"
              disabled={busy || !snapshot?.editable}
              aria-label={`Edit ${title}`}
              onClick={() =>
                void action(async () => {
                  if (!snapshot) return;
                  const source = bookmarkSource(item, snapshot);
                  setEditing({ ...item, original: item, source, destinationId: source.parentId });
                })
              }
            >
              {shellIconPencil}
              <span>Edit</span>
            </button>
            <button
              {...staticSmallIconButtonProps}
              title="Remove bookmark"
              disabled={busy || !snapshot?.editable}
              aria-label={`Remove ${title}`}
              onClick={() =>
                void action(async () => {
                  if (!snapshot) throw new Error("Bookmark folders are still loading.");
                  const result = await removeBookmark(bookmarkSource(item, snapshot));
                  useStore.setState({ bookmarks: await call("bookmarks.list", {}) });
                  setRemoved({ title: item.title || hostOf(item.url), undoToken: result.undoToken });
                  setNotice("");
                  setEditing((current) =>
                    current && bookmarkKey(current.original) === bookmarkKey(item) ? null : current,
                  );
                })
              }
            >
              {shellIconTrash}
              <span>Delete</span>
            </button>
          </>
        ) : (
          <>
            {item.offline && (
              <span className="hint library-offline" title="Offline copy saved">
                offline
              </span>
            )}
            {offlinePage && (
              <button
                {...staticSmallIconButtonProps}
                title={item.offline ? "Refresh offline copy" : "Save offline copy"}
                disabled={busy}
                aria-label={`${item.offline ? "Refresh" : "Save"} offline copy of ${title}`}
                onClick={() =>
                  void action(async () => {
                    const page = orderedPages(useStore.getState().pages).find(
                      (page) => page.url === item.url && page.backend === "aux" && !page.ownedByRuntime,
                    );
                    if (!page) return;
                    const article = await readReaderArticle(page.pageId);
                    await call("bookmarks.offline.set", { url: item.url, article: JSON.stringify(article) });
                    useStore.setState({ bookmarks: await call("bookmarks.list", {}) });
                    setNotice("Offline copy saved.");
                  })
                }
              >
                {shellIconDownloadSm}
              </button>
            )}
            <button
              {...staticSmallIconButtonProps}
              title={item.readAt ? "Mark unread" : "Mark read"}
              disabled={busy}
              aria-label={`Mark ${title} ${item.readAt ? "unread" : "read"}`}
              onClick={() =>
                void action(async () => {
                  await call("bookmarks.markRead", {
                    url: item.url,
                    nodeId: item.nodeId,
                    read: !item.readAt,
                  });
                  useStore.setState({ bookmarks: await call("bookmarks.list", {}) });
                })
              }
            >
              {item.readAt ? shellIconCircle : shellIconCheck}
            </button>
            <button
              {...staticSmallIconButtonProps}
              title="Remove from reading list"
              disabled={busy}
              aria-label={`Remove ${title} from reading list`}
              onClick={() =>
                void action(async () => {
                  await call("bookmarks.readingList", {
                    url: item.url,
                    nodeId: item.nodeId,
                    readingList: false,
                  });
                  useStore.setState({ bookmarks: await call("bookmarks.list", {}) });
                })
              }
            >
              {shellIconTrash}
            </button>
          </>
        )}
      </SavedPageActions>
      {view === "bookmarks" && editing && (
        <form
          className="library-edit"
          onSubmit={(event) => {
            event.preventDefault();
            void action(async () => {
              const destination = snapshot?.folders.find((folder) => folder.nodeId === editing.destinationId);
              if (!destination) throw new Error("The destination folder no longer exists.");
              await editBookmark({
                source: editing.source,
                url: editing.url.trim(),
                title: editing.title.trim(),
                ...(destination.nodeId !== editing.source.parentId
                  ? { destination: folderDestination(destination) }
                  : {}),
              });
              setEditing(null);
              setNotice("Bookmark updated.");
            });
          }}
        >
          <label className="library-edit-field">
            Name
            <input
              {...staticFieldInputProps}
              aria-label="Bookmark title"
              autoFocus
              disabled={busy}
              value={editing.title}
              maxLength={1000}
              onChange={(event) => setEditing({ ...editing, title: event.target.value })}
            />
          </label>
          <label className="library-edit-field">
            Address
            <input
              {...staticFieldInputProps}
              aria-label="Bookmark address"
              placeholder="https://example.com"
              value={editing.url}
              maxLength={8192}
              disabled={busy}
              spellCheck={false}
              autoCapitalize="none"
              onChange={(event) => setEditing({ ...editing, url: event.target.value })}
            />
          </label>
          <label className="library-edit-field library-edit-folder">
            Folder
            <select
              {...staticFieldInputProps}
              aria-label="Bookmark folder"
              disabled={busy}
              value={editing.destinationId}
              onChange={(event) => setEditing({ ...editing, destinationId: event.target.value })}
            >
              {snapshot?.folders.map((folder) => (
                <option key={folder.nodeId} value={folder.nodeId}>
                  {bookmarkFolderLabel(folder, snapshot)}
                </option>
              ))}
            </select>
          </label>
          <div className="library-edit-buttons">
            <button
              {...smallGhostButtonProps}
              {...auxNativeButtonTypeProps}
              disabled={busy}
              onClick={cancelEditor}
            >
              Cancel
            </button>
            <button
              {...smallButtonProps}
              disabled={busy || !editing.title.trim() || !editing.url.trim()}
              type="submit"
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
});

/** Browser library: saved pages and recent visits share search and navigation. */
export function Library({
  initialView = "bookmarks",
  confirmClear = false,
  onClose,
}: {
  initialView?: View;
  confirmClear?: boolean;
  onClose?: () => void;
}) {
  const key = useShortcutLabels();
  const setOverlay = useStore((s) => s.setOverlay);
  const close = (overlay: null) => (onClose ? onClose() : setOverlay(overlay));
  useStore(
    useShallow((s) =>
      s.bookmarks.map((item) =>
        JSON.stringify([
          item.nodeId,
          item.url,
          item.title,
          item.folderPath,
          item.readingList,
          item.readAt,
          item.offline,
        ]),
      ),
    ),
  );
  const bookmarks = useStore.getState().bookmarks;
  const active = useStore((s) => s.pages.byId[s.activePageId ?? ""]);
  const [view, setView] = useState<View>(initialView);
  const [query, setQuery] = useState("");
  const [snapshot, setSnapshot] = useState<BookmarkFolderSnapshot | null>(null);
  const folders = snapshot?.folders ?? [];
  const [folderId, setFolderId] = useState("");
  const currentFolder = folders.find((item) => item.nodeId === (folderId || snapshot?.rootId));
  const folder = currentFolder?.path ?? [];
  const [folderUndo, setFolderUndo] = useState<BookmarkFolderChange | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selection, setSelection] = useState<SavedPage[]>([]);
  const [moveFolder, setMoveFolder] = useState("");
  const [newMoveFolder, setNewMoveFolder] = useState("");
  const toggleSelection = useCallback(
    (item: SavedPage) =>
      setSelection((current) =>
        current.some((selected) => bookmarkKey(selected) === bookmarkKey(item))
          ? current.filter((selected) => bookmarkKey(selected) !== bookmarkKey(item))
          : [...current, { ...item, folderPath: [...(item.folderPath ?? [])] }],
      ),
    [],
  );
  const [addingBookmark, setAddingBookmark] = useState(false);
  const [folderEditor, setFolderEditor] = useState<{
    mode: "create" | "rename";
    name: string;
    folder: BookmarkFolder;
  } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyRange, setHistoryRange] = useState("all");
  const [moreHistory, setMoreHistory] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const readQuery = view === "history" ? query : "";
  const readOwner = useLibraryReadOwner(JSON.stringify([view, readQuery, historyRange, refresh]));
  const readCurrent = useLibraryCurrent(readOwner);
  const controlOwner = useLibraryReadOwner(JSON.stringify([view, query, historyRange, refresh]));
  const current = useCallback(() => readCurrent() && controlOwner.current(), [readCurrent, controlOwner]);
  const [closeRef, runClose] = useLibraryControl<HTMLDivElement>("close-library", current, () => close(null));
  const historyRequest = useRef(0);
  const loadedFilter = useRef("");
  const actionPending = useRef(false);
  const morePending = useRef(false);
  const [failedLoad, setFailedLoad] = useState<"initial" | "more" | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionBusy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [removed, setRemoved] = useState<RemovedBookmark | null>(null);
  const [editing, setEditing] = useState<BookmarkEditor | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const results = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const firstSelection = useRef<HTMLButtonElement>(null);
  const firstResult = useRef<HTMLButtonElement>(null);
  const viewButtons = useRef(new Map<View, HTMLButtonElement>());
  const bookmarkImport = useBookmarkFileImport({
    active: view === "bookmarks",
    identity: controlOwner.identity,
    onCancel: () => search.current?.focus(),
    onRead: () => {
      setNotice("");
      setError("");
    },
    onImported: async (receipt, stillCurrent) => {
      const next = await readBookmarkFolders();
      if (!stillCurrent()) return;
      setSnapshot(next);
      setFolderId("");
      setQuery("");
      setNotice(`Imported ${receipt.added} bookmarks. ${receipt.skipped} already saved.`);
    },
  });
  const busy = actionBusy || bookmarkImport.busy;
  useEffect(() => {
    if (selecting) firstSelection.current?.focus();
  }, [selecting]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const shell = dialog.current;
    search.current?.focus();
    return () => {
      if (ownsFocus(shell) && previous && availableForFocus(previous)) previous.focus();
    };
  }, []);

  useEffect(() => {
    let live = true;
    const version = ++historyRequest.current;
    const filter = JSON.stringify([
      view,
      readQuery.trim(),
      historyRange,
      readOwner.windowId,
      readOwner.privateMode,
      readOwner.kind,
    ]);
    if (loadedFilter.current !== filter) {
      setHistory([]);
      setMoreHistory(false);
    }
    loadedFilter.current = filter;
    setLoading(true);
    setError("");
    setFailedLoad(null);
    setLoadingMore(false);
    morePending.current = false;
    if (view === "closed" || view === "archived") {
      setLoading(false);
      return;
    }
    const timer = window.setTimeout(
      () => {
        if (!live || !readCurrent() || version !== historyRequest.current) return;
        const request =
          view === "history"
            ? call("history.list", {
                query: readQuery.trim() || undefined,
                limit: HISTORY_PAGE_SIZE,
                since: historySince(historyRange),
              }).then((items) => {
                if (live && readCurrent() && version === historyRequest.current) {
                  setHistory(items);
                  setMoreHistory(items.length === HISTORY_PAGE_SIZE);
                }
              })
            : Promise.all([call("bookmarks.list", {}), readBookmarkFolders()]).then(([items, snapshot]) => {
                if (live && readCurrent() && version === historyRequest.current) {
                  useStore.setState({ bookmarks: items });
                  setSnapshot(snapshot);
                }
              });
        void request
          .catch((reason) => {
            if (live && readCurrent() && version === historyRequest.current) {
              setError(String(reason));
              setFailedLoad("initial");
            }
          })
          .finally(() => {
            if (live && readCurrent() && version === historyRequest.current) setLoading(false);
          });
      },
      view === "history" && readQuery ? 120 : 0,
    );
    return () => {
      live = false;
      ++historyRequest.current;
      window.clearTimeout(timer);
    };
  }, [view, readQuery, historyRange, refresh, readCurrent, readOwner]);

  useEffect(
    () =>
      bridge.onHistoryChanged(() => {
        if (readCurrent() && view === "history") setRefresh((value) => value + 1);
      }),
    [view, readCurrent],
  );

  async function loadMoreHistory() {
    const last = history.at(-1);
    if (!readCurrent() || !last || morePending.current || loading) return;
    morePending.current = true;
    const version = historyRequest.current;
    setLoadingMore(true);
    setError("");
    setFailedLoad(null);
    try {
      const found = await call("history.list", {
        query: query.trim() || undefined,
        limit: HISTORY_PAGE_SIZE,
        since: historySince(historyRange),
        before: { visitedAt: last.visitedAt, url: last.url },
      });
      if (!readCurrent() || version !== historyRequest.current) return;
      setHistory((current) => [...current, ...found]);
      setMoreHistory(found.length === HISTORY_PAGE_SIZE);
    } catch (reason) {
      if (readCurrent() && version === historyRequest.current) {
        setError(String(reason));
        setFailedLoad("more");
      }
    } finally {
      if (readCurrent() && version === historyRequest.current) {
        setLoadingMore(false);
        morePending.current = false;
      }
    }
  }

  useEffect(() => {
    if (view !== "bookmarks") return;
    let live = true;
    let revision = 0;
    const refreshFolders = () => {
      const requested = ++revision;
      void readBookmarkFolders()
        .then((snapshot) => {
          if (!live || !readCurrent() || requested !== revision) return;
          setSnapshot(snapshot);
          setFolderId((previous) =>
            snapshot.folders.some((folder) => folder.nodeId === previous) ? previous : snapshot.rootId,
          );
        })
        .catch((reason) => {
          if (live && readCurrent() && requested === revision) setError(String(reason));
        });
    };
    // Native folder-only changes also publish a fresh bookmark snapshot.
    const stop = useStore.subscribe((state, previous) => {
      if (state.bookmarks !== previous.bookmarks) refreshFolders();
    });
    refreshFolders();
    return () => {
      live = false;
      stop();
    };
  }, [view, readCurrent]);

  function folderItems(folder: BookmarkFolder) {
    if (!snapshot) return [];
    const ids = descendantBookmarkIds(folder, snapshot);
    return bookmarks.filter((item) => ids.has(item.nodeId ?? ""));
  }
  const q = query.trim().toLocaleLowerCase();
  const folderKey = currentFolder?.nodeId ?? "";
  const currentChildIds = new Set(currentFolder?.childIds);
  const childFolders = folders.filter(
    (item) =>
      item.nodeId !== snapshot?.rootId &&
      (q
        ? item.path.join(" / ").toLocaleLowerCase().includes(q)
        : (item.parentId ?? snapshot?.rootId) === currentFolder?.nodeId),
  );
  const breadcrumbs: BookmarkFolder[] = [];
  for (
    let node = currentFolder;
    node && node.nodeId !== snapshot?.rootId;
    node = folders.find((parent) => parent.nodeId === node?.parentId)
  )
    breadcrumbs.unshift(node);
  function openFolder(id: string) {
    setAddingBookmark(false);
    setFolderId(id);
    setQuery("");
    setEditing(null);
    setFolderEditor(null);
    search.current?.focus();
    results.current?.scrollTo({ top: 0 });
  }
  const items =
    view === "bookmarks"
      ? bookmarks.filter((item) =>
          q
            ? `${item.title} ${item.url} ${item.folderPath?.join(" ") ?? ""}`.toLocaleLowerCase().includes(q)
            : !currentFolder || currentChildIds.has(item.nodeId ?? ""),
        )
      : view === "reading"
        ? bookmarks.filter(
            (item) =>
              item.readingList &&
              !!bookmarkWebUrl(item.url) &&
              (!q || `${item.title} ${item.url}`.toLocaleLowerCase().includes(q)),
          )
        : view === "history"
          ? history
          : [];
  const unread = view === "reading" ? items.filter((item) => !(item as SavedPage).readAt) : [];
  const read = view === "reading" ? items.filter((item) => (item as SavedPage).readAt) : [];
  const displayItems = view === "reading" ? [...unread, ...read] : items;
  const bookmarkPositions = new Map(bookmarks.map((item, index) => [bookmarkKey(item), index]));
  const isSaved = (url: string) => bookmarks.some((item) => item.url === url);
  const action = useCallback(async (work: () => Promise<void>) => {
    if (actionPending.current) return;
    actionPending.current = true;
    setBusy(true);
    setError("");
    setFailedLoad(null);
    const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const restore = !!focused && !!dialog.current?.contains(focused);
    try {
      await work();
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      actionPending.current = false;
      setBusy(false);
      if (restore)
        requestAnimationFrame(() => {
          if (!dialog.current || document.activeElement !== document.body) return;
          if (focused?.isConnected) focused.focus();
          else search.current?.focus();
        });
    }
  }, []);
  const save = useCallback(
    async (item: SavedPage) => {
      if (!currentFolder) throw new Error("Bookmark folders are still loading.");
      setSnapshot(
        await createBookmark({
          title: item.title,
          url: item.url,
          destination: folderDestination(currentFolder),
        }),
      );
      useStore.setState({ bookmarks: await call("bookmarks.list", {}) });
    },
    [currentFolder],
  );
  const open = useCallback(
    (item: SavedPage, background = false, trigger?: HTMLElement) => {
      void action(async () => {
        const url = item.url;
        if (!item.nodeId && !bookmarkWebUrl(url)) throw new Error("This saved address is not a web page.");
        const state = useStore.getState();
        if (background) {
          const overlay = state.overlay;
          if (item.nodeId) {
            await openBookmark(item, true, undefined, state.layout.activeSpaceId);
          } else await state.openBackgroundTab(url, state.layout.activeSpaceId, false);
          setNotice(`Opened ${item.title || hostOf(url)} in a background tab.`);
          const returnFocus = () =>
            trigger?.isConnected &&
            useStore.getState().overlay === overlay &&
            (document.activeElement === document.body || document.activeElement === trigger);
          // Wait for the action to re-enable its controls before restoring focus.
          requestAnimationFrame(() => {
            if (returnFocus())
              void bridge
                .focusShell()
                .then(() => {
                  if (returnFocus()) trigger?.focus();
                })
                .catch(() => {});
          });
          return;
        }
        if (item.nodeId) {
          await openBookmark(item, false, state.activePageId ?? undefined, state.layout.activeSpaceId);
        } else {
          const existing = orderedPages(state.pages).find(
            (page) =>
              page.url === item.url &&
              !page.ownedByRuntime &&
              !["crashed", "detached"].includes(page.viewStatus ?? ""),
          );
          if (existing) {
            const spaceId = state.layout.tabSpace[existing.pageId];
            if (spaceId && spaceId !== state.layout.activeSpaceId) state.switchSpace(spaceId);
            await state.activate(existing.pageId);
          } else if (!(await state.newTab(item.url)))
            throw new Error("The page could not be opened. Try again.");
        }
        // A foreground open is the act of reading — background opens stay unread.
        if (item.readingList && !item.readAt)
          await call("bookmarks.markRead", { url: item.url, nodeId: item.nodeId, read: true });
        if (["bookmarks", "history", "clear-history"].includes(useStore.getState().overlay ?? ""))
          close(null);
      });
    },
    [action, close],
  );
  function choose(next: View) {
    setAddingBookmark(false);
    setFolderEditor(null);
    setSelecting(false);
    setSelection([]);
    setView(next);
    setEditing(null);
    setNotice("");
    setQuery("");
  }

  const cancelEditor = useCallback(() => {
    setEditing(null);
    setFolderEditor(null);
    search.current?.focus();
  }, []);
  function cancelSelection() {
    setSelecting(false);
    setSelection([]);
    search.current?.focus();
  }
  // Private windows never carry reading-list state, so the view stays hidden there.
  const archive = useFeature("archive");
  const views = VIEWS.filter(
    (tab) =>
      (tab !== "archived" || (archive && !bridge.privateMode)) && (tab !== "reading" || !bridge.privateMode),
  );

  return (
    <div ref={closeRef} className="library-page" data-view={view}>
      <div
        ref={dialog}
        className="library"
        role="region"
        aria-label="Library"
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            if (editing || folderEditor) cancelEditor();
            else if (bookmarkImport.selected) bookmarkImport.cancel();
            else if (selecting) cancelSelection();
            else runClose(event);
          }
        }}
      >
        <div className="library-head">
          <h1>{VIEW_NAMES[view]}</h1>
          <span {...auxClassSpacerProps} />
          <button
            {...staticIconButtonProps}
            aria-label="Close library"
            data-command-id="close-library"
            onClick={runClose}
          >
            {shellIconClose}
          </button>
        </div>
        <div className="library-nav">
          <div className="library-tabs" role="tablist" aria-label="Library views" aria-orientation="vertical">
            {views.map((tab) => (
              <LibraryButton
                command="select-library-view"
                current={current}
                key={tab}
                originalRef={(node) => {
                  if (node) viewButtons.current.set(tab, node);
                  else viewButtons.current.delete(tab);
                }}
                id={`library-${tab}`}
                role="tab"
                aria-selected={view === tab}
                aria-controls="library-results"
                tabIndex={view === tab ? 0 : -1}
                className={view === tab ? "on" : ""}
                keyboard
                invoke={(event) => {
                  if (
                    event instanceof KeyboardEvent &&
                    ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
                  ) {
                    const next =
                      views[
                        (views.indexOf(tab) +
                          (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : views.length - 1)) %
                          views.length
                      ]!;
                    choose(next);
                    viewButtons.current.get(next)?.focus();
                  } else choose(tab);
                }}
              >
                <span aria-hidden="true">
                  {tab === "history"
                    ? shellIconClock
                    : tab === "bookmarks"
                      ? shellIconBookmark
                      : tab === "archived"
                        ? shellIconArchive
                        : tab === "closed"
                          ? shellIconReopen
                          : shellIconResult}
                </span>
                {VIEW_NAMES[tab]}
              </LibraryButton>
            ))}
          </div>
          {view === "bookmarks" && snapshot && (
            <BookmarkFolderNavigation
              snapshot={snapshot}
              selectedId={currentFolder?.nodeId ?? snapshot.rootId}
              disabled={busy}
              onSelect={(id) => {
                if (current()) openFolder(id);
              }}
            />
          )}
        </div>
        <div className="library-main">
          <div className="library-search-row">
            <div className="library-field" data-input-surface>
              <span className="library-icon">{shellIconSearch}</span>
              <input
                ref={search}
                value={query}
                aria-label={`Search ${VIEW_NAMES[view].toLowerCase()}`}
                placeholder={`Search ${VIEW_NAMES[view].toLowerCase()} by title or address…`}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.nativeEvent.isComposing) return;
                  if (event.key === "Enter" && !selecting && !loading) {
                    if (view === "closed") {
                      event.preventDefault();
                      firstResult.current?.click();
                    } else if (view === "bookmarks" && childFolders[0]) {
                      event.preventDefault();
                      openFolder(childFolders[0].nodeId);
                    } else if (items[0]) {
                      event.preventDefault();
                      open(items[0]);
                    }
                  }
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    firstResult.current?.focus();
                  }
                }}
              />
            </div>
            {view === "bookmarks" && (
              <ActionMenu
                label="Organize bookmarks"
                actions={[
                  {
                    label: "Add new bookmark",
                    disabled: busy || !snapshot?.editable || !currentFolder,
                    onSelect: () => {
                      setError("");
                      setAddingBookmark(true);
                    },
                  },
                  {
                    label: "Bookmark current page",
                    disabled:
                      busy ||
                      !snapshot?.editable ||
                      !active ||
                      !/^https?:\/\//i.test(active.url) ||
                      isSaved(active.url),
                    onSelect: () =>
                      active &&
                      void action(async () => {
                        await save({ url: active.url, title: active.title || hostOf(active.url) });
                        setNotice("Current page bookmarked.");
                      }),
                  },
                  {
                    label: "Add new folder",
                    disabled: busy || !snapshot?.editable || !currentFolder,
                    onSelect: () =>
                      currentFolder && setFolderEditor({ mode: "create", name: "", folder: currentFolder }),
                  },
                  {
                    label: "Select bookmarks",
                    disabled: busy || !bookmarks.length,
                    onSelect: () => {
                      setSelecting(true);
                      setSelection([]);
                      setEditing(null);
                      setMoveFolder(JSON.stringify(folder));
                      setNewMoveFolder("");
                    },
                  },
                  {
                    label: "Import bookmarks",
                    disabled: busy || !bookmarkImport.available,
                    onSelect: bookmarkImport.choose,
                  },
                  {
                    label: "Export bookmarks",
                    disabled: busy || !snapshot || (!bookmarks.length && !folders.length) || !inNativeHost,
                    onSelect: () =>
                      void action(async () => {
                        const file = await bridge.saveFile(
                          "aux-bookmarks.html",
                          exportBookmarkFile(bookmarks, snapshot!),
                        );
                        if (file) {
                          const skipped = bookmarks.filter((item) => !bookmarkWebUrl(item.url)).length;
                          setNotice(
                            skipped
                              ? `Web bookmarks exported. ${skipped} unsupported addresses omitted.`
                              : "Bookmarks exported.",
                          );
                        }
                      }),
                  },
                ]}
              />
            )}
          </div>
          {view === "bookmarks" && <BookmarkImportFileInput flow={bookmarkImport} disabled={busy} />}
          {addingBookmark && currentFolder && (
            <NewBookmarkDialog
              folderName={currentFolder.title || "Bookmarks"}
              busy={busy}
              error={error}
              onClose={() => setAddingBookmark(false)}
              onSave={(draft) =>
                void action(async () => {
                  await save(draft);
                  setAddingBookmark(false);
                  setNotice("Bookmark added.");
                })
              }
            />
          )}
          {bridge.privateMode && (
            <p className="library-message hint">
              Bookmarks and history stay in this private window until it closes. Exported files remain on your
              Mac.
            </p>
          )}
          <SessionRecovery />
          {view === "archived" ? (
            <ArchivedTabs query={query} />
          ) : view === "closed" ? (
            <RecentlyClosed query={query} firstOpenRef={firstResult} />
          ) : (
            <>
              <div className="library-tools" hidden={view === "bookmarks"}>
                <button
                  {...smallButtonProps}
                  disabled={busy || !active || !/^https?:\/\//i.test(active.url) || isSaved(active.url)}
                  onClick={() =>
                    active &&
                    void action(async () => {
                      await save({
                        url: active.url,
                        title: active.title || hostOf(active.url),
                        folderPath: folder,
                      });
                      setNotice("Current page bookmarked.");
                    })
                  }
                >
                  {active && isSaved(active.url) ? "Current page bookmarked" : "Bookmark current page"}
                </button>
                {view === "reading" && (
                  <button
                    {...smallButtonProps}
                    disabled={
                      busy ||
                      !active ||
                      !/^https?:\/\//i.test(active.url) ||
                      bookmarks.some((b) => b.url === active.url && b.readingList)
                    }
                    onClick={() =>
                      active &&
                      void action(async () => {
                        await call("bookmarks.readingList", {
                          url: active.url,
                          readingList: true,
                          title: active.title || hostOf(active.url),
                        });
                        setNotice("Added to reading list.");
                      })
                    }
                  >
                    {active && bookmarks.some((b) => b.url === active.url && b.readingList)
                      ? "Page in reading list"
                      : "Read later"}
                  </button>
                )}
                {view === "history" && (
                  <>
                    <div className="library-ranges" role="group" aria-label="History date range">
                      {[
                        ["all", "All time"],
                        ["today", "Today"],
                        ["week", "7 days"],
                        ["month", "30 days"],
                      ].map(([value, label]) => (
                        <LibraryButton
                          key={value}
                          command="select-library-history-range"
                          current={current}
                          {...smallGhostButtonProps}
                          aria-pressed={historyRange === value}
                          invoke={() => setHistoryRange(value!)}
                        >
                          {label}
                        </LibraryButton>
                      ))}
                    </div>
                    <ClearHistory initiallyOpen={confirmClear} />
                  </>
                )}
              </div>
              {view === "bookmarks" && selecting && (
                <section className="library-selection" aria-label="Move selected bookmarks">
                  <div {...staticRowProps}>
                    <strong>{selection.length} selected</strong>
                    <span {...auxClassSpacerProps} />
                    <button
                      ref={items.length ? firstSelection : undefined}
                      {...smallGhostButtonProps}
                      disabled={busy || !items.length}
                      onClick={() =>
                        setSelection((current) => [
                          ...current,
                          ...items
                            .filter(
                              (item) =>
                                !current.some((selected) => bookmarkKey(selected) === bookmarkKey(item)),
                            )
                            .map((item) => ({
                              ...item,
                              folderPath: [...("folderPath" in item ? (item.folderPath ?? []) : [])],
                            })),
                        ])
                      }
                    >
                      Select this view
                    </button>
                    <button
                      ref={!items.length ? firstSelection : undefined}
                      {...smallGhostButtonProps}
                      disabled={busy}
                      onClick={cancelSelection}
                    >
                      Cancel
                    </button>
                  </div>
                  <div {...staticRowProps}>
                    <label htmlFor="bookmark-move-destination">Move to</label>
                    <select
                      id="bookmark-move-destination"
                      className="grow field-input"
                      value={moveFolder}
                      disabled={busy}
                      onChange={(event) => setMoveFolder(event.target.value)}
                    >
                      <option value="">Choose a folder</option>
                      {folders.map((item) => (
                        <option key={item.nodeId} value={item.nodeId}>
                          {snapshot && bookmarkFolderLabel(item, snapshot)}
                        </option>
                      ))}
                      <option value="new">
                        New folder in {folder.length ? folder.join(" / ") : "Bookmarks"}…
                      </option>
                    </select>
                    {moveFolder === "new" && (
                      <input
                        className="field-input grow"
                        aria-label="New destination folder name"
                        placeholder="Folder name"
                        maxLength={200}
                        value={newMoveFolder}
                        disabled={busy}
                        onChange={(event) => setNewMoveFolder(event.target.value)}
                      />
                    )}
                    <button
                      {...smallButtonProps}
                      disabled={
                        busy ||
                        !snapshot?.editable ||
                        !moveFolder ||
                        !selection.length ||
                        (moveFolder === "new" && !newMoveFolder.trim())
                      }
                      onClick={() =>
                        void action(async () => {
                          if (!snapshot || !currentFolder)
                            throw new Error("Bookmark folders are still loading.");
                          let next = snapshot;
                          let destinationId = moveFolder;
                          if (moveFolder === "new") {
                            const result = await changeBookmarkFolder({
                              kind: "create",
                              destination: folderDestination(currentFolder),
                              title: newMoveFolder.trim(),
                            });
                            next = result.snapshot;
                            if (result.undo?.kind !== "remove")
                              throw new Error("The new folder is unavailable.");
                            destinationId = result.undo.source.nodeId;
                          }
                          let moved = 0;
                          try {
                            for (const item of selection) {
                              const destination = next.folders.find(
                                (folder) => folder.nodeId === destinationId,
                              );
                              if (!destination) throw new Error("The destination folder no longer exists.");
                              next = (
                                await placeBookmark({
                                  source: bookmarkSource(item, next),
                                  destination: folderDestination(destination),
                                })
                              ).snapshot;
                              moved++;
                            }
                          } catch (reason) {
                            throw new Error(`${moved} bookmarks moved. ${errorMessage(reason)}`);
                          } finally {
                            setSnapshot(next);
                            useStore.setState({ bookmarks: await call("bookmarks.list") });
                          }
                          setSelection([]);
                          setSelecting(false);
                          search.current?.focus();
                          setNotice(`${moved} ${moved === 1 ? "bookmark" : "bookmarks"} moved.`);
                        })
                      }
                    >
                      {busy ? "Moving…" : "Move"}
                    </button>
                  </div>
                </section>
              )}
              {view === "bookmarks" && (
                <BookmarkImportReview flow={bookmarkImport} bookmarks={bookmarks} disabled={busy} />
              )}
              {view === "bookmarks" && (
                <nav className="library-breadcrumbs" aria-label="Bookmark folders">
                  <button className="btn ghost sm" onClick={() => openFolder(snapshot?.rootId ?? "")}>
                    Bookmarks
                  </button>
                  {breadcrumbs.map((item) => (
                    <span key={item.nodeId}>
                      {shellIconRight}
                      <button className="btn ghost sm" onClick={() => openFolder(item.nodeId)}>
                        {item.title || "Untitled folder"}
                      </button>
                    </span>
                  ))}
                  <span {...auxClassSpacerProps} />
                  {currentFolder && !currentFolder.permanent && (
                    <>
                      <button
                        {...staticIconButtonProps}
                        title="Rename folder"
                        aria-label="Rename folder"
                        onClick={() =>
                          setFolderEditor({
                            mode: "rename",
                            name: currentFolder.title,
                            folder: currentFolder,
                          })
                        }
                      >
                        {shellIconPencil}
                      </button>
                      <button
                        {...staticIconButtonProps}
                        title="Remove empty folder"
                        aria-label="Remove empty folder"
                        disabled={busy || !snapshot?.editable || !!currentFolder.childIds.length}
                        onClick={() =>
                          void action(async () => {
                            const result = await changeBookmarkFolder({
                              kind: "remove",
                              source: folderSource(currentFolder),
                            });
                            setSnapshot(result.snapshot);
                            setFolderUndo(result.undo);
                            setFolderId(currentFolder.parentId ?? result.snapshot.rootId);
                          })
                        }
                      >
                        {shellIconTrash}
                      </button>
                    </>
                  )}
                </nav>
              )}
              {view === "bookmarks" && folder.length > 0 && !q && !loading && (
                <div className="library-tools">
                  {currentFolder && snapshot && (
                    <OpenBookmarkFolder
                      key={folderKey}
                      bookmarks={folderItems(currentFolder)}
                      folder={folder}
                    />
                  )}
                </div>
              )}
              {view === "bookmarks" && folderEditor && (
                <form
                  className="library-folder-editor"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void action(async () => {
                      const name = folderEditor.name.trim();
                      if (!name) return;
                      const result = await changeBookmarkFolder(
                        folderEditor.mode === "create"
                          ? {
                              kind: "create",
                              destination: folderDestination(folderEditor.folder),
                              title: name,
                            }
                          : { kind: "rename", source: folderSource(folderEditor.folder), title: name },
                      );
                      setSnapshot(result.snapshot);
                      setFolderUndo(result.undo);
                      setFolderEditor(null);
                      search.current?.focus();
                    });
                  }}
                >
                  <input
                    autoFocus
                    aria-label="Folder name"
                    placeholder="Folder name"
                    value={folderEditor.name}
                    maxLength={200}
                    onChange={(event) => setFolderEditor({ ...folderEditor, name: event.target.value })}
                  />
                  <button {...smallButtonProps} disabled={busy || !folderEditor.name.trim()}>
                    {folderEditor.mode === "create" ? "Create folder" : "Rename"}
                  </button>
                  <button {...smallButtonProps} {...auxNativeButtonTypeProps} onClick={cancelEditor}>
                    Cancel
                  </button>
                </form>
              )}
              {error && (
                <p className="library-message" {...nativeAlertRoleProps}>
                  {error}{" "}
                  {failedLoad && (
                    <LibraryButton
                      command="retry-library-load"
                      current={current}
                      {...smallButtonProps}
                      disabled={loading || loadingMore}
                      invoke={() =>
                        failedLoad === "more" ? loadMoreHistory() : setRefresh((value) => value + 1)
                      }
                    >
                      Retry
                    </LibraryButton>
                  )}
                </p>
              )}
              {notice && (
                <output className="library-message" data-block>
                  {notice}
                </output>
              )}
              {folderUndo && (
                <div className="library-tools">
                  <button
                    {...smallButtonProps}
                    disabled={busy}
                    onClick={() =>
                      void action(async () => {
                        const result = await changeBookmarkFolder(folderUndo);
                        setSnapshot(result.snapshot);
                        setFolderUndo(null);
                        setNotice("Folder change undone.");
                      })
                    }
                  >
                    Undo folder change
                  </button>
                </div>
              )}
              {removed && (
                <div className="library-tools">
                  <span {...staticHintProps}>Removed {removed.title}</span>
                  <button
                    {...smallButtonProps}
                    disabled={busy}
                    onClick={() =>
                      void action(async () => {
                        setSnapshot(await restoreBookmark(removed.undoToken));
                        useStore.setState({ bookmarks: await call("bookmarks.list") });
                        setRemoved(null);
                        setNotice("Bookmark restored.");
                      })
                    }
                  >
                    Undo remove
                  </button>
                </div>
              )}
              <div
                ref={results}
                className="library-list"
                id="library-results"
                role="tabpanel"
                aria-labelledby={`library-${view}`}
                aria-busy={loading}
                onKeyDown={(event) => moveListFocus(event, ".library-folder, .library-open")}
              >
                {view === "bookmarks" &&
                  childFolders.map((item, index) => (
                    <button
                      key={item.nodeId}
                      ref={index === 0 ? firstResult : undefined}
                      className="library-folder"
                      onClick={() => openFolder(item.nodeId)}
                    >
                      <span className="library-folder-icon">{shellIconFolderClosed}</span>
                      <span {...auxClassTextProps}>
                        {q ? item.path.join(" / ") : item.title || "Untitled folder"}
                      </span>
                      <span {...staticHintProps}>{folderItems(item).length}</span>
                      {shellIconRight}
                    </button>
                  ))}
                {loading &&
                  (items.length ? (
                    <output className="library-message hint" data-block>
                      Updating…
                    </output>
                  ) : (
                    <SkeletonRows label="Loading…" />
                  ))}
                {!loading &&
                !error &&
                !displayItems.length &&
                (view !== "bookmarks" || !childFolders.length) ? (
                  <p className="library-empty">
                    {query
                      ? view === "bookmarks"
                        ? "No matching bookmarks or folders."
                        : "No matching pages."
                      : view === "bookmarks"
                        ? `Save a page with Bookmark current page${key("bookmark") ? ` or ${key("bookmark")}` : ""}.`
                        : view === "reading"
                          ? "Save pages to read later — Add to reading list on any tab."
                          : "Pages you visit will appear here."}
                  </p>
                ) : (
                  displayItems.map((item, index) =>
                    view === "bookmarks" ? (
                      <SavedPageRow
                        key={bookmarkKey(item)}
                        view="bookmarks"
                        itemKey={bookmarkKey(item)}
                        position={bookmarkPositions.get(bookmarkKey(item))!}
                        selected={selection.some((selected) => bookmarkKey(selected) === bookmarkKey(item))}
                        selecting={selecting}
                        busy={busy}
                        showFolderPath={!!q}
                        editing={
                          editing && bookmarkKey(editing.original) === bookmarkKey(item) ? editing : null
                        }
                        snapshot={snapshot}
                        firstResult={index === 0 && !childFolders.length ? firstResult : undefined}
                        onSelect={toggleSelection}
                        onOpen={open}
                        action={action}
                        setEditing={setEditing}
                        setRemoved={setRemoved}
                        setNotice={setNotice}
                        cancelEditor={cancelEditor}
                      />
                    ) : view === "reading" ? (
                      <Fragment key={bookmarkKey(item)}>
                        {index === 0 && unread.length > 0 && <h4 className="library-day">Unread</h4>}
                        {index === unread.length && read.length > 0 && <h4 className="library-day">Read</h4>}
                        <SavedPageRow
                          view="reading"
                          itemKey={bookmarkKey(item)}
                          position={bookmarkPositions.get(bookmarkKey(item))!}
                          selected={false}
                          selecting={false}
                          busy={busy}
                          showFolderPath={false}
                          editing={null}
                          snapshot={snapshot}
                          firstResult={index === 0 ? firstResult : undefined}
                          onSelect={toggleSelection}
                          onOpen={open}
                          action={action}
                          setEditing={setEditing}
                          setRemoved={setRemoved}
                          setNotice={setNotice}
                          cancelEditor={cancelEditor}
                        />
                      </Fragment>
                    ) : (
                      <Fragment
                        key={"visitedAt" in item ? `${item.url}:${item.visitedAt}` : bookmarkKey(item)}
                      >
                        {(index === 0 || dayOf(displayItems[index - 1]!) !== dayOf(item)) && (
                          <h4 className="library-day">{dayOf(item)}</h4>
                        )}
                        <div className="library-item">
                          <button
                            ref={index === 0 ? firstResult : undefined}
                            className="library-open"
                            disabled={busy}
                            onClick={(event) => open(item, backgroundLink(event), event.currentTarget)}
                            onAuxClick={(event) => {
                              if (event.button === 1) {
                                event.preventDefault();
                                if (!selecting) open(item, true, event.currentTarget);
                              }
                            }}
                            title={`${item.title || hostOf(item.url)} — ${item.url}`}
                          >
                            <span className="library-row-heading">
                              <span className="library-title">{item.title || hostOf(item.url)}</span>
                              {"visitedAt" in item && (
                                <time
                                  className="library-time"
                                  dateTime={new Date(Number(item.visitedAt)).toISOString()}
                                >
                                  {new Date(Number(item.visitedAt)).toLocaleTimeString(undefined, {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </time>
                              )}
                            </span>
                            <span className="library-url">{item.url}</span>
                          </button>
                          <div className="library-actions">
                            <button
                              {...staticSmallIconButtonProps}
                              title={isSaved(item.url) ? "Already bookmarked" : "Bookmark page"}
                              disabled={busy || isSaved(item.url)}
                              aria-label={`Bookmark ${item.title || hostOf(item.url)}`}
                              onClick={() =>
                                void action(async () => {
                                  await save(item);
                                  setNotice("Page bookmarked.");
                                })
                              }
                            >
                              {isSaved(item.url) ? shellIconBookmarkFill : shellIconBookmark}
                            </button>
                            {"visitedAt" in item && (
                              <button
                                {...staticSmallIconButtonProps}
                                title="Remove this visit"
                                disabled={busy}
                                aria-label={`Remove visit to ${item.title || hostOf(item.url)}`}
                                onClick={() =>
                                  void action(async () => {
                                    await call("history.remove", {
                                      url: item.url,
                                      visitedAt: item.visitedAt,
                                    });
                                    setHistory((current) =>
                                      current.filter(
                                        (entry) =>
                                          entry.url !== item.url || entry.visitedAt !== item.visitedAt,
                                      ),
                                    );
                                    setNotice(
                                      "Visit removed from browsing history. Bookmarks and saved work are unchanged.",
                                    );
                                  })
                                }
                              >
                                {shellIconTrash}
                              </button>
                            )}
                          </div>
                        </div>
                      </Fragment>
                    ),
                  )
                )}
                {view === "history" && moreHistory && !loading && (
                  <div className="library-more">
                    <LibraryButton
                      command="load-more-library-history"
                      current={current}
                      {...smallButtonProps}
                      disabled={loadingMore || busy}
                      invoke={loadMoreHistory}
                    >
                      {loadingMore ? "Loading older visits…" : "Load older visits"}
                    </LibraryButton>
                    <span {...staticHintProps}>{history.length} visits shown</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
