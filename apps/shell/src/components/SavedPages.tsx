import { Fragment, useEffect, useRef, useState } from "react";
import { bridge } from "../bridge";
import { call, useStore } from "../store";
import type { Workspace } from "../store/types";
import { orderedPages } from "../store/pages";
import { openBookmark } from "../bookmark-folders";
import { backgroundLink } from "../browser-links";
import { errorMessage } from "../error-message";
import { useFeature } from "../use-feature";
import { openPeekLink } from "../peek-link";
import { readReaderArticle } from "../reader-article";
import { hostOf } from "../workspace";
import { availableForFocus, ownsFocus } from "../ui/focus";
import { shellIconClose, shellIconSearch } from "../ui/icons";
import { ArchivedTabs } from "./ArchivedTabs";
import { RecentlyClosed } from "./RecentlyClosed";
import { SessionRecovery } from "./SessionRecovery";
import { SavedPageActions } from "./SavedPageActions";
import { FavIcon } from "./SiteTile";
import "./SavedPages.css";

type SavedPage = Workspace["bookmarks"][number];
type View = "reading" | "archived" | "closed";
const names: Record<View, string> = {
  reading: "Reading list",
  archived: "Archived tabs",
  closed: "Recently closed",
};
const keyOf = (item: SavedPage) => item.nodeId ?? item.url;

function ReadingRow({
  item,
  busy,
  action,
  open,
  current,
}: {
  item: SavedPage;
  busy: boolean;
  action(work: () => Promise<void>): void;
  open(item: SavedPage, background?: boolean, trigger?: HTMLElement): void;
  current(): boolean;
}) {
  const row = useRef<HTMLDivElement>(null);
  const peek = useFeature("peek");
  const page = useStore((state) =>
    orderedPages(state.pages).find(
      (page) => page.url === item.url && page.backend === "aux" && !page.ownedByRuntime,
    ),
  );
  const title = item.title || hostOf(item.url);
  async function refresh() {
    const items = await call("bookmarks.list", {});
    if (current()) useStore.setState({ bookmarks: items });
  }
  return (
    <div ref={row} className={`library-item${item.readAt ? " read" : ""}`}>
      <button
        className="library-open"
        disabled={busy}
        title={item.url}
        onClick={(event) => open(item, backgroundLink(event), event.currentTarget)}
        onAuxClick={(event) => {
          if (event.button === 1) {
            event.preventDefault();
            open(item, true, event.currentTarget);
          }
        }}
      >
        <span className="library-row-heading">
          <FavIcon url={item.url} src={page?.favicon} size="sm" />
          <span className="library-title">{title}</span>
        </span>
        <span className="library-url">{item.url}</span>
      </button>
      {item.offline && (
        <span className="hint" title="Offline copy saved">
          Offline
        </span>
      )}
      <SavedPageActions title={title} menu hidden={false} disabled={busy} rowRef={row}>
        <button onClick={(event) => open(item, true, event.currentTarget)}>Open in new tab</button>
        {page && (
          <button
            onClick={() =>
              action(async () => {
                const article = await readReaderArticle(page.pageId);
                if (!current()) return;
                await call("bookmarks.offline.set", { url: item.url, article: JSON.stringify(article) });
                await refresh();
              })
            }
          >
            {item.offline ? "Refresh offline copy" : "Save offline copy"}
          </button>
        )}
        <button
          onClick={() =>
            action(async () => {
              await call("bookmarks.markRead", { url: item.url, nodeId: item.nodeId, read: !item.readAt });
              await refresh();
            })
          }
        >
          {item.readAt ? "Mark unread" : "Mark read"}
        </button>
        <button
          onClick={() =>
            action(async () => {
              await call("bookmarks.readingList", { url: item.url, nodeId: item.nodeId, readingList: false });
              await refresh();
            })
          }
        >
          Remove from reading list
        </button>
        {peek && /^https?:\/\//i.test(item.url) && (
          <button
            onClick={() =>
              action(async () => {
                await openPeekLink(item.url);
                if (current()) useStore.getState().setOverlay(null);
              })
            }
          >
            Preview link
          </button>
        )}
      </SavedPageActions>
    </div>
  );
}

/** Aux-owned saved reading and recovery, separate from Chromium's Library pages. */
export function SavedPages({
  initialView = "reading",
  onClose,
}: {
  initialView?: View;
  onClose?: () => void;
}) {
  const [view, setView] = useState<View>(initialView);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [revision, setRevision] = useState(0);
  const pending = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const firstResult = useRef<HTMLButtonElement>(null);
  const owner = useRef({
    windowId: bridge.windowId,
    privateMode: bridge.privateMode,
    kind: bridge.windowKind,
    live: true,
  });
  const current = () =>
    owner.current.live &&
    owner.current.windowId === bridge.windowId &&
    owner.current.privateMode === bridge.privateMode &&
    owner.current.kind === bridge.windowKind;
  const close = () => {
    if (!current()) return;
    if (onClose) onClose();
    else useStore.getState().setOverlay(null);
  };
  const archive = useFeature("archive");
  const bookmarks = useStore((state) => state.bookmarks);
  const active = useStore((state) => state.pages.byId[state.activePageId ?? ""]);
  const views = (["reading", "archived", "closed"] as View[]).filter(
    (item) => item === "closed" || (!bridge.privateMode && (item !== "archived" || archive)),
  );
  const effectiveView = views.includes(view) ? view : "closed";
  useEffect(() => {
    owner.current.live = true;
    const previous = document.activeElement as HTMLElement | null;
    const surface = root.current;
    search.current?.focus();
    return () => {
      owner.current.live = false;
      if (ownsFocus(surface) && previous && availableForFocus(previous)) previous.focus();
    };
  }, []);
  useEffect(() => {
    if (effectiveView !== "reading" || bridge.privateMode) return;
    let live = true;
    setLoading(true);
    setError("");
    void call("bookmarks.list", {})
      .then((items) => {
        if (live && current()) useStore.setState({ bookmarks: items });
      })
      .catch((reason) => {
        if (live && current()) setError(errorMessage(reason));
      })
      .finally(() => {
        if (live && current()) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [effectiveView, revision]);
  function action(work: () => Promise<void>) {
    if (!current() || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    void work()
      .catch((reason) => {
        if (current()) setError(errorMessage(reason));
      })
      .finally(() => {
        pending.current = false;
        if (current()) setBusy(false);
      });
  }
  function open(item: SavedPage, background = false, trigger?: HTMLElement) {
    action(async () => {
      const state = useStore.getState();
      if (!/^https?:\/\//i.test(item.url)) throw new Error("This saved address is not a web page.");
      if (item.nodeId)
        await openBookmark(
          item,
          background ? "background" : "foreground",
          background ? undefined : (state.activePageId ?? undefined),
          state.layout.activeSpaceId,
        );
      else if (background) await state.openBackgroundTab(item.url, state.layout.activeSpaceId, false);
      else {
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
      if (!current()) return;
      if (background) {
        setNotice(`Opened ${item.title || hostOf(item.url)} in a background tab.`);
        const overlay = state.overlay;
        requestAnimationFrame(() => {
          const restore = () =>
            current() &&
            trigger?.isConnected &&
            useStore.getState().overlay === overlay &&
            (document.activeElement === document.body || document.activeElement === trigger);
          if (restore())
            void bridge
              .focusShell()
              .then(() => {
                if (restore()) trigger?.focus();
              })
              .catch(() => {});
        });
        return;
      }
      if (!item.readAt) await call("bookmarks.markRead", { url: item.url, nodeId: item.nodeId, read: true });
      close();
    });
  }
  const matches = bookmarks.filter(
    (item) =>
      item.readingList &&
      `${item.title} ${item.url}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  const groups = [
    ["Unread", matches.filter((item) => !item.readAt)],
    ["Read", matches.filter((item) => !!item.readAt)],
  ] as const;
  const alreadySaved = active && bookmarks.some((item) => item.url === active.url && item.readingList);
  return (
    <div
      className="library-page saved-pages"
      data-view={effectiveView}
      ref={root}
      role="region"
      aria-label="Saved pages"
      onKeyDown={(event) => {
        if (!event.nativeEvent.isComposing && event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      }}
    >
      <header>
        <h1>{names[effectiveView]}</h1>
        <button className="icon-btn" aria-label="Close saved pages" onClick={close}>
          {shellIconClose}
        </button>
      </header>
      <nav aria-label="Saved page views">
        {views.map((item) => (
          <button
            key={item}
            className="btn ghost"
            aria-current={effectiveView === item ? "page" : undefined}
            onClick={() => {
              setView(item);
              setQuery("");
              setError("");
              setNotice("");
              search.current?.focus();
            }}
          >
            {names[item]}
          </button>
        ))}
      </nav>
      <label className="library-field" data-input-surface>
        <span className="library-icon">{shellIconSearch}</span>
        <input
          ref={search}
          aria-label={`Search ${names[effectiveView].toLowerCase()}`}
          placeholder={`Search ${names[effectiveView].toLowerCase()}`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <SessionRecovery />
      {error && (
        <div className="saved-pages-notice" role="alert">
          {error}
          <button
            className="btn ghost sm"
            disabled={busy || loading}
            onClick={() => setRevision((value) => value + 1)}
          >
            Retry
          </button>
        </div>
      )}
      {notice && <output className="saved-pages-notice">{notice}</output>}
      <div className="library-list" aria-busy={busy || loading}>
        {effectiveView === "archived" ? (
          <ArchivedTabs query={query} />
        ) : effectiveView === "closed" ? (
          <RecentlyClosed query={query} firstOpenRef={firstResult} />
        ) : (
          <>
            <div className="library-tools">
              <button
                className="btn sm"
                disabled={busy || !active || !/^https?:\/\//i.test(active.url) || !!alreadySaved}
                onClick={() =>
                  active &&
                  action(async () => {
                    await call("bookmarks.readingList", {
                      url: active.url,
                      title: active.title || hostOf(active.url),
                      readingList: true,
                    });
                    const items = await call("bookmarks.list", {});
                    if (current()) {
                      useStore.setState({ bookmarks: items });
                      setNotice("Added to reading list.");
                    }
                  })
                }
              >
                {alreadySaved ? "Page in reading list" : "Read later"}
              </button>
            </div>
            {!loading && !matches.length && (
              <p className="library-empty">
                {query ? "No saved pages match your search." : "Save pages to read later from any tab."}
              </p>
            )}
            {groups.map(
              ([label, items]) =>
                items.length > 0 && (
                  <Fragment key={label}>
                    <h2 className="library-day">{label}</h2>
                    {items.map((item) => (
                      <ReadingRow
                        key={keyOf(item)}
                        item={item}
                        busy={busy}
                        action={action}
                        open={open}
                        current={current}
                      />
                    ))}
                  </Fragment>
                ),
            )}
          </>
        )}
      </div>
    </div>
  );
}
