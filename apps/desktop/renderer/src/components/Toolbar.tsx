import { useEffect, useRef, useState } from "react";
import { useStore, call, toast, errToast } from "../store";
import { I } from "./icons";

export function isUrlLike(v: string): boolean {
  if (/^(https?:\/\/|about:|chrome:\/\/|file:\/\/|view-source:)/.test(v)) return true;
  // localhost, IPs, and dotted hostnames — with optional port/path
  return /^(localhost|\d{1,3}(\.\d{1,3}){3}|[\w-]+(\.[\w-]+)+)(:\d+)?(\/\S*)?$/.test(v);
}

export function toUrl(v: string, searchEngine?: string): string {
  if (/^(https?:\/\/|about:|chrome:\/\/|file:\/\/)/.test(v)) return v;
  if (isUrlLike(v) && !v.includes(" ")) {
    // local and private-network hosts are almost always plain http —
    // https would hard-fail on dev servers and fixtures
    const local = /^(localhost|127\.|0\.0\.0\.0|::1|\[::1\]|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.|.*\.local\b)/i.test(v);
    return `${local ? "http" : "https"}://${v}`;
  }
  const tpl = searchEngine || "https://duckduckgo.com/?q=%s";
  return tpl.includes("%s") ? tpl.replace("%s", encodeURIComponent(v)) : tpl + encodeURIComponent(v);
}

export function OmniBox({ compact }: { compact?: boolean }) {
  const pages = useStore((s) => s.pages);
  const activePageId = useStore((s) => s.activePageId);
  const settings = useStore((s) => s.settings);
  const setOverlay = useStore((s) => s.setOverlay);
  const page = pages.find((p) => p.pageId === activePageId);
  const [val, setVal] = useState("");
  const [agentMode, setAgentMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // host-clean display — drop the https scheme and trailing slash for readability
  const display = page?.url && page.url !== "about:blank" ? page.url.replace(/^https:\/\//, "").replace(/\/$/, "") : "";

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") (e.target as HTMLElement)?.blur?.();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // switching tabs drops unsubmitted text so the field shows the page's URL
  useEffect(() => {
    setVal("");
    setAgentMode(false);
  }, [activePageId]);

  const submit = async (newTab = false) => {
    const v = val.trim();
    if (!v) return;
    setVal("");
    try {
      if (agentMode) {
        await useStore.getState().sendChat(v);
        setAgentMode(false);
        toast("Agent started");
        return;
      }
      const url = toUrl(v, settings.searchEngine as string | undefined);
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
      {agentMode ? <span className="agent-tag">AGENT</span> : <span className="lock">{page?.url.startsWith("https") ? I.lock : I.search}</span>}
      <input
        ref={inputRef}
        value={agentMode ? val : val || display}
        placeholder={agentMode ? "Describe the task — Vector plans, executes, verifies" : compact ? "Search or enter address" : "Search or enter address — ⌘K for commands"}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const v = e.target.value;
          if (v.startsWith("> ")) {
            setAgentMode(true);
            setVal(v.slice(2));
          } else setVal(v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") void submit(e.metaKey);
          if (e.key === "Tab" && !agentMode && !val) {
            e.preventDefault();
            setAgentMode(true);
          }
          if (e.key === "Backspace" && agentMode && val === "") setAgentMode(false);
        }}
      />
      {!val && !agentMode && <span className="kbd-hint">⇥ agent</span>}
      {!val && !agentMode && !compact && <span className="kbd-hint" onClick={() => setOverlay("palette")}>⌘K</span>}
    </div>
  );
}

export function Toolbar() {
  const pages = useStore((s) => s.pages);
  const activePageId = useStore((s) => s.activePageId);
  const mode = useStore((s) => s.mode);
  const railOpen = useStore((s) => s.railOpen);
  const toggleRail = useStore((s) => s.toggleRail);
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const setOverlay = useStore((s) => s.setOverlay);
  const bookmarks = useStore((s) => s.bookmarks);
  const page = pages.find((p) => p.pageId === activePageId);
  const bookmarked = page && bookmarks.some((b) => b.url === page.url);

  return (
    <div className="toolbar">
      <button
        className={`icon-btn ${sidebarOpen ? "on" : ""}`}
        title="Toggle sidebar (⌘S)"
        onClick={toggleSidebar}
      >
        {I.sidebar}
      </button>
      <div className="nav-btns">
        <button className="icon-btn" title="Back (⌘[)" disabled={!page?.canGoBack}
          onClick={() => page && void call("pages.back", { pageId: page.pageId }).catch(errToast)}>
          {I.back}
        </button>
        <button className="icon-btn" title="Forward (⌘])" disabled={!page?.canGoForward}
          onClick={() => page && void call("pages.forward", { pageId: page.pageId }).catch(errToast)}>
          {I.fwd}
        </button>
        {page?.loading ? (
          <button className="icon-btn" title="Stop" onClick={() => page && void call("pages.stop", { pageId: page.pageId }).catch(errToast)}>{I.stop}</button>
        ) : (
          <button className="icon-btn" title="Reload (⌘R)" disabled={!page} onClick={() => page && void call("pages.reload", { pageId: page.pageId }).catch(errToast)}>{I.reload}</button>
        )}
      </div>
      <span className="sp" />
      {page && (page.controller === "agent" || page.controller === "external") && (
        <span className="ctl-chip agent" title="An agent is driving this page — typing or clicking takes over">
          <span className="dot" /> agent
        </span>
      )}
      {page?.controller === "human" && (
        <button className="ctl-chip human" title="Dispatch to this page is paused while you control it — click to hand back"
          onClick={() => void call("pages.resume", { pageId: page.pageId })}>
          <span className="dot" /> you · resume
        </button>
      )}
      <button
        className={`icon-btn ${bookmarked ? "on" : ""}`}
        title={bookmarked ? "Remove bookmark (⌘D)" : "Bookmark this page (⌘D)"}
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
      <button className={`icon-btn ${mode === "table" ? "on" : ""}`} title="Results table" onClick={() => useStore.getState().setMode(mode === "table" ? "focus" : "table")}>
        {I.table}
      </button>
      <button className={`icon-btn ${railOpen ? "on" : ""}`} title="Agent panel" onClick={toggleRail}>
        {I.rail}
      </button>
    </div>
  );
}
