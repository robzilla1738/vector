import { memo, useRef } from "react";
import { NavigationButtons } from "./NavigationButtons";
import { bridge, inNativeHost } from "../bridge";
import { useStore, call, errToast } from "../store";
import { CommandBar } from "./CommandBar";
import { I } from "./icons";
import { useShortcutLabels, withShortcut } from "../use-shortcut-label";
import { ExtensionActions } from "./ExtensionActions";

export const Toolbar = memo(function Toolbar() {
  const key = useShortcutLabels();
  const sidebar = useStore(s => s.sidebar);
  const horizontal = useStore(s => (s.settings.tabLayout ?? "horizontal") === "horizontal");
  const page = useStore((s) => (s.activePageId ? s.pages.find((p) => p.pageId === s.activePageId) : undefined));
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const railOpen = useStore((s) => s.railOpen);
  const toggleRail = useStore((s) => s.toggleRail);
  const setSidebar = useStore((s) => s.setSidebar);
  const bookmarks = useStore((s) => s.bookmarks);
  const returnControl = useStore((s) => s.returnControl);
  const takingControl = useRef(false);
  const takeControl = async (pageId: string) => {
    if (takingControl.current) return;
    takingControl.current = true;
    try { await call("pages.takeover", { pageId }); }
    catch (error) { errToast(error); }
    finally { takingControl.current = false; }
  };
  const web = !!page && page.url.startsWith("http");
  const bookmarked = web && bookmarks.some((b) => b.url === page.url);

  const bookmarkPending = useStore(state => !!page && !!state.bookmarkPending[page.url]);
  const toggleBookmark = () => {
    if (page && web) void useStore.getState().toggleBookmark(page.url, page.title).catch(errToast);
  };

  return (
    <header className={`toolbar ${inNativeHost && !horizontal && sidebar !== "expanded" ? "traffic" : ""}`}>
      <div className="tb-left">
        {!horizontal && <button className="icon-btn" title={withShortcut(sidebar === "expanded" ? "Hide sidebar" : "Show sidebar", key("sidebar"))} aria-label={sidebar === "expanded" ? "Hide sidebar" : "Show sidebar"} aria-expanded={sidebar === "expanded"} onClick={() => setSidebar(sidebar === "expanded" ? "hidden" : "expanded")}>{I.sidebarOpen}</button>}
        <div className="nav-btns">
          <NavigationButtons page={page} />
        </div>
      </div>

      <CommandBar compact />
      {!horizontal && <div className="toolbar-drag-space" title="Drag to move window" aria-hidden="true" />}

      <div className="tb-right">
        <ExtensionActions />
        {!horizontal && sidebar === "hidden" && !bridge.privateMode && <button className="icon-btn" title="Library" aria-label="Library" onClick={() => useStore.getState().setOverlay("bookmarks")}>{I.bookmark}</button>}
        {!horizontal && sidebar === "hidden" && !bridge.privateMode && <button className="icon-btn" title="Settings" aria-label="Settings" onClick={() => useStore.getState().setOverlay("settings")}>{I.gear}</button>}
        {page?.controller === "human" && (
          <button className="ctl-chip human" title="The agent is waiting while you use this page — hand it back when you're done" onClick={() => void returnControl(page.pageId)}>
            {I.handSm}
            <span className="ctl-chip-label">You're in control</span>
            <span className="ctl-return">Return</span>
          </button>
        )}
        {page && (page.controller === "agent" || page.controller === "external") && (
          <button type="button" className="ctl-chip agent" title="Take control of this page" aria-label="Take control of this page" onClick={() => void takeControl(page.pageId)}>
            {I.agentSm}
            <span className="ctl-chip-label">Agent</span>
            <span className="ctl-take">Take over</span>
          </button>
        )}
        <button className={`icon-btn ${mode === "overview" ? "on" : ""}`} title={withShortcut("Tab overview", key("overview"))} aria-label="Tab overview" aria-pressed={mode === "overview"} onClick={() => setMode(mode === "overview" ? "focus" : "overview")}>{I.grid}</button>
        {!bridge.privateMode && <button className={`icon-btn ${bookmarked ? "on" : ""}`} title={withShortcut(bookmarked ? "Remove bookmark" : "Bookmark this page", key("bookmark"))} aria-label={bookmarked ? "Remove bookmark" : "Bookmark this page"} aria-pressed={bookmarked} disabled={!web || bookmarkPending} onClick={toggleBookmark}>
          {bookmarked ? I.bookmarkFill : I.bookmark}
        </button>}
        {!bridge.privateMode && <button className={`icon-btn ${railOpen ? "on" : ""}`} title={withShortcut("Agent", key("agent-rail"))} aria-label="Toggle agent rail" aria-pressed={railOpen} onClick={toggleRail}>
          {I.agent}
        </button>}
      </div>
    </header>
  );
});
