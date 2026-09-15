import { inElectron } from "../bridge";
import { useStore, call, errToast } from "../store";
import { CommandBar } from "./CommandBar";
import { I } from "./icons";

export function Toolbar() {
  const pages = useStore((s) => s.pages);
  const activePageId = useStore((s) => s.activePageId);
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const railOpen = useStore((s) => s.railOpen);
  const toggleRail = useStore((s) => s.toggleRail);
  const setSidebar = useStore((s) => s.setSidebar);
  const bookmarks = useStore((s) => s.bookmarks);
  const returnControl = useStore((s) => s.returnControl);
  const page = pages.find((p) => p.pageId === activePageId);
  const web = !!page && page.url.startsWith("http");
  const bookmarked = web && bookmarks.some((b) => b.url === page.url);

  const toggleBookmark = () => {
    if (!page || !web) return;
    void call(bookmarked ? "bookmarks.remove" : "bookmarks.add", { url: page.url, title: page.title })
      .then(() => {
        const s = useStore.getState();
        useStore.setState({ bookmarks: bookmarked ? s.bookmarks.filter((b) => b.url !== page.url) : [...s.bookmarks, { url: page.url, title: page.title }] });
      })
      .catch(errToast);
  };

  return (
    <header className={`toolbar ${inElectron ? "traffic" : ""}`}>
      <div className="tb-left">
        <button className="icon-btn" title="Show sidebar (⌘S)" aria-label="Show sidebar" onClick={() => setSidebar("expanded")}>{I.sidebar}</button>
        <div className="nav-btns">
          <button className="icon-btn" title="Back (⌘[)" aria-label="Back" disabled={!page?.canGoBack} onClick={() => page && void call("pages.back", { pageId: page.pageId }).catch(errToast)}>{I.back}</button>
          <button className="icon-btn" title="Forward (⌘])" aria-label="Forward" disabled={!page?.canGoForward} onClick={() => page && void call("pages.forward", { pageId: page.pageId }).catch(errToast)}>{I.fwd}</button>
          {page?.loading ? (
            <button className="icon-btn" title="Stop" aria-label="Stop loading" onClick={() => void call("pages.stop", { pageId: page.pageId }).catch(errToast)}>{I.stop}</button>
          ) : (
            <button className="icon-btn" title="Reload (⌘R)" aria-label="Reload" disabled={!web} onClick={() => page && void call("pages.reload", { pageId: page.pageId }).catch(errToast)}>{I.reload}</button>
          )}
        </div>
      </div>

      <CommandBar />

      <div className="tb-right">
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
        <button className={`icon-btn ${bookmarked ? "on" : ""}`} title={bookmarked ? "Remove bookmark (⌘D)" : "Bookmark this page (⌘D)"} aria-label={bookmarked ? "Remove bookmark" : "Bookmark this page"} aria-pressed={bookmarked} disabled={!web} onClick={toggleBookmark}>
          {bookmarked ? I.bookmarkFill : I.bookmark}
        </button>
        <button className={`icon-btn ${railOpen ? "on" : ""}`} title="Agent (⌘⇧A)" aria-label="Toggle agent rail" aria-pressed={railOpen} onClick={toggleRail}>
          {I.agent}
        </button>
      </div>
    </header>
  );
}
