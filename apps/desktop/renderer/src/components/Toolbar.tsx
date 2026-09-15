import { useEffect, useRef, useState } from "react";
import { useStore, call, errToast } from "../store";
import { addressNavigate } from "../chrome";
import { I } from "./icons";

export { addressNavigate, isUrlLike, toUrl } from "../chrome";

export function OmniBox() {
  const pages = useStore((s) => s.pages);
  const activePageId = useStore((s) => s.activePageId);
  const settings = useStore((s) => s.settings);
  const setOverlay = useStore((s) => s.setOverlay);
  const page = pages.find((p) => p.pageId === activePageId);
  const [val, setVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const display = page?.url && page.url !== "about:blank" ? page.url.replace(/^https:\/\//, "").replace(/\/$/, "") : "";

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") (e.target as HTMLElement)?.blur?.();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    setVal("");
  }, [activePageId]);

  const submit = async (newTab = false) => {
    const v = val.trim();
    if (!v) return;
    setVal("");
    const { url } = addressNavigate(v, settings.searchEngine as string | undefined);
    try {
      if (!newTab && activePageId && page) {
        await call("pages.navigate", { pageId: activePageId, url });
      } else {
        await call("pages.open", { url, backend: "vector", activate: true });
      }
    } catch (e) {
      errToast(e);
    }
  };

  return (
    <div className="omnibox">
      <span className="lock">{page?.url.startsWith("https") ? I.lock : I.search}</span>
      <input
        ref={inputRef}
        value={val || display}
        aria-label="Address and search"
        placeholder="Search or enter address"
        onFocus={(e) => e.target.select()}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void submit(e.metaKey);
        }}
      />
      <span className="kbd-hint" title="Command palette" onClick={() => setOverlay("palette")}>
        ⌘K
      </span>
    </div>
  );
}

export function Toolbar() {
  const pages = useStore((s) => s.pages);
  const activePageId = useStore((s) => s.activePageId);
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const railOpen = useStore((s) => s.railOpen);
  const toggleRail = useStore((s) => s.toggleRail);
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const bookmarks = useStore((s) => s.bookmarks);
  const page = pages.find((p) => p.pageId === activePageId);
  const bookmarked = page && bookmarks.some((b) => b.url === page.url);
  const session = page?.backend === "chrome" ? "Chrome" : "Vector";

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button
          className={`icon-btn ${sidebarOpen ? "on" : ""}`}
          title="Toggle sidebar (⌘S)"
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
        >
          {I.sidebar}
        </button>
        <div className="nav-btns">
          <button
            className="icon-btn"
            title="Back (⌘[)"
            aria-label="Back"
            disabled={!page?.canGoBack}
            onClick={() => page && void call("pages.back", { pageId: page.pageId }).catch(errToast)}
          >
            {I.back}
          </button>
          <button
            className="icon-btn"
            title="Forward (⌘])"
            aria-label="Forward"
            disabled={!page?.canGoForward}
            onClick={() => page && void call("pages.forward", { pageId: page.pageId }).catch(errToast)}
          >
            {I.fwd}
          </button>
          {page?.loading ? (
            <button
              className="icon-btn"
              title="Stop"
              aria-label="Stop loading"
              onClick={() => page && void call("pages.stop", { pageId: page.pageId }).catch(errToast)}
            >
              {I.stop}
            </button>
          ) : (
            <button
              className="icon-btn"
              title="Reload (⌘R)"
              aria-label="Reload"
              disabled={!page}
              onClick={() => page && void call("pages.reload", { pageId: page.pageId }).catch(errToast)}
            >
              {I.reload}
            </button>
          )}
        </div>
      </div>
      <OmniBox />
      <div className="toolbar-right">
        <span className={`session-label ${session === "Chrome" ? "chrome" : ""}`} title={page?.backend === "chrome" ? "Attached Chrome tab" : "Vector page"}>
          {session}
        </span>
        {page && (page.controller === "agent" || page.controller === "external") && (
          <span className="ctl-chip agent" title="An agent is driving this page — typing or clicking takes over">
            <span className="dot" /> agent
          </span>
        )}
        {page?.controller === "human" && (
          <button
            className="ctl-chip human"
            title="Dispatch to this page is paused while you control it — click to hand back"
            onClick={() => void call("pages.resume", { pageId: page.pageId })}
          >
            <span className="dot" /> you · resume
          </button>
        )}
        <div className="mode-seg" role="tablist" aria-label="Workspace">
          {(["focus", "overview", "table"] as const).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? "on" : ""} onClick={() => setMode(m)}>
              {m === "focus" ? "Focus" : m === "overview" ? "Overview" : "Table"}
            </button>
          ))}
        </div>
        <button
          className={`icon-btn ${bookmarked ? "on" : ""}`}
          title={bookmarked ? "Remove bookmark (⌘D)" : "Bookmark this page (⌘D)"}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark this page"}
          disabled={!page || !page.url.startsWith("http")}
          onClick={() => {
            if (!page) return;
            void call(bookmarked ? "bookmarks.remove" : "bookmarks.add", { url: page.url, title: page.title })
              .then(() => {
                const s = useStore.getState();
                useStore.setState({
                  bookmarks: bookmarked ? s.bookmarks.filter((b) => b.url !== page.url) : [...s.bookmarks, { url: page.url, title: page.title }],
                });
              })
              .catch(errToast);
          }}
        >
          {bookmarked ? I.bookmarkFill : I.bookmark}
        </button>
        <button className={`icon-btn ${railOpen ? "on" : ""}`} title="Agent inspector" aria-label="Agent inspector" onClick={toggleRail}>
          {I.rail}
        </button>
      </div>
    </div>
  );
}
