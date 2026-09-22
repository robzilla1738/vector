import { NavigationButtons } from "./NavigationButtons";
import { bridge, inElectron } from "../bridge";
import { useStore, errToast } from "../store";
import { CommandBar } from "./CommandBar";
import { I } from "./icons";

export function Toolbar() {
  const sidebar = useStore(s => s.sidebar);
  const page = useStore((s) => (s.activePageId ? s.pages.find((p) => p.pageId === s.activePageId) : undefined));
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const railOpen = useStore((s) => s.railOpen);
  const toggleRail = useStore((s) => s.toggleRail);
  const setSidebar = useStore((s) => s.setSidebar);
  const bookmarks = useStore((s) => s.bookmarks);
  const returnControl = useStore((s) => s.returnControl);
  const web = !!page && page.url.startsWith("http");
  const bookmarked = web && bookmarks.some((b) => b.url === page.url);

  const bookmarkPending = useStore(state => !!page && !!state.bookmarkPending[page.url]);
  const toggleBookmark = () => {
    if (page && web) void useStore.getState().toggleBookmark(page.url, page.title).catch(errToast);
  };

  return (
    <header className={`toolbar ${inElectron && sidebar !== "expanded" ? "traffic" : ""}`}>
      <div className="tb-left">
        {sidebar !== "expanded" && <button className="icon-btn" title="Show sidebar (⌘S)" aria-label="Show sidebar" onClick={() => setSidebar("expanded")}>{I.sidebarOpen}</button>}
        <div className="nav-btns">
          <NavigationButtons page={page} />
        </div>
      </div>

      <CommandBar compact />

      <div className="tb-right">
        {sidebar === "hidden" && !bridge.privateMode && <button className="icon-btn" title="Library" aria-label="Library" onClick={() => useStore.getState().setOverlay("bookmarks")}>{I.bookmark}</button>}
        {sidebar === "hidden" && !bridge.privateMode && <button className="icon-btn" title="Settings" aria-label="Settings" onClick={() => useStore.getState().setOverlay("settings")}>{I.gear}</button>}
        {page?.controller === "human" && (
          <button className="ctl-chip human" title="The agent is waiting while you use this page — hand it back when you're done" onClick={() => void returnControl(page.pageId)}>
            {I.handSm}
            <span className="ctl-chip-label">You're in control</span>
            <span className="ctl-return">Return</span>
          </button>
        )}
        {page && (page.controller === "agent" || page.controller === "external") && (
          <span className="ctl-chip agent" title="The agent is driving this page — click or type to take over">
            {I.agentSm}
            <span className="ctl-chip-label">Agent</span>
          </span>
        )}
        <button className={`icon-btn ${mode === "overview" ? "on" : ""}`} title="Tab overview (⌘⇧O)" aria-label="Tab overview" aria-pressed={mode === "overview"} onClick={() => setMode(mode === "overview" ? "focus" : "overview")}>{I.grid}</button>
        {!bridge.privateMode && <button className={`icon-btn ${bookmarked ? "on" : ""}`} title={bookmarked ? "Remove bookmark (⌘D)" : "Bookmark this page (⌘D)"} aria-label={bookmarked ? "Remove bookmark" : "Bookmark this page"} aria-pressed={bookmarked} disabled={!web || bookmarkPending} onClick={toggleBookmark}>
          {bookmarked ? I.bookmarkFill : I.bookmark}
        </button>}
        {!bridge.privateMode && <button className={`icon-btn ${railOpen ? "on" : ""}`} title="Agent (⌘⇧A)" aria-label="Toggle agent rail" aria-pressed={railOpen} onClick={toggleRail}>
          {I.agent}
        </button>}
      </div>
    </header>
  );
}
