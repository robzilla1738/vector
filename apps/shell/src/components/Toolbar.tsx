import { staticIconButtonProps } from "../ui/class-props";
import { ReturnControlButton } from "./ReturnControlButton";
import {executeCommand, runCommand} from "../commands";
import { FeatureSlots } from "../features/registry";
import { memo, useRef, type CSSProperties } from "react";
import { NavigationButtons } from "./NavigationButtons";
import { bridge, inNativeHost } from "../bridge";
import { useStore, errToast } from "../store";
import { deferNamedSurface } from "./DeferredSurface";
const CommandBar = deferNamedSurface(() => import("./CommandBar"), "CommandBar", "Address field", true, true);
import { shellIconAgent, shellIconAgentSm, shellIconBookmark, shellIconBookmarkFill, shellIconGear, shellIconGrid, shellIconSidebarOpen } from "./icons";
import { useShortcutLabels, withShortcut } from "../use-shortcut-label";
import {
  nativeAriaHiddenProps as auxNativeAriaHiddenProps,
  nativeButtonTypeProps as auxNativeButtonTypeProps,
} from "../ui/native-attribute-props";

export const Toolbar = memo(function Toolbar({ hidden = false }: { hidden?: boolean }) {
  const key = useShortcutLabels();
  const sidebar = useStore(s => s.sidebar);
  const horizontal = useStore(s => (s.settings.tabLayout ?? "horizontal") === "horizontal");
  const page = useStore((s) => (s.activePageId ? s.pages.find((p) => p.pageId === s.activePageId) : undefined));
  const settingsRoute = useStore((s) => s.overlay === "settings");
  const mode = useStore((s) => s.mode);
  const railOpen = useStore((s) => s.railOpen);
  const takingControl = useRef(false);
  const takeControl = async (pageId: string) => {
    if (takingControl.current) return;
    takingControl.current = true;
    try { await executeCommand("take-page-control", { payload: { pageId } }); }
    catch (error) { errToast(error); }
    finally { takingControl.current = false; }
  };
  const web = !!page && page.url.startsWith("http");
  const bookmarked = useStore((s) => !!page && page.url.startsWith("http") && s.bookmarks.some((b) => b.url === page.url));

  const bookmarkPending = useStore(state => !!page && !!state.bookmarkPending[page.url]);
  const themeColor = web && !page?.navigationError && /^#[0-9a-f]{6}$/.test(page?.themeColor ?? "") ? page!.themeColor : undefined;


  return (
    <header inert={hidden} aria-hidden={hidden} className={`toolbar ${inNativeHost && !horizontal && sidebar !== "expanded" ? "traffic" : ""}`}
      style={themeColor ? { "--page-toolbar-glass": `color-mix(in srgb, ${themeColor} 14%, var(--toolbar-glass))` } as CSSProperties : undefined}>
      <div className="tb-left">
        {!horizontal && <button {...staticIconButtonProps} title={withShortcut(sidebar === "expanded" ? "Hide sidebar" : "Show sidebar", key("sidebar"))} aria-label={sidebar === "expanded" ? "Hide sidebar" : "Show sidebar"} aria-expanded={sidebar === "expanded"} data-command-id="sidebar" onClick={()=>runCommand("sidebar")}>{shellIconSidebarOpen}</button>}
        <div className="nav-btns">
          <NavigationButtons page={page} settingsRoute={settingsRoute} />
        </div>
      </div>

      <CommandBar compact />
      {!horizontal && <div className="toolbar-drag-space" title="Drag to move window" {...auxNativeAriaHiddenProps} />}

      <div className="tb-right">
        <FeatureSlots slot="toolbarItems" />
        {!horizontal && sidebar === "hidden" && !bridge.privateMode && <button {...staticIconButtonProps} title={withShortcut("Library", key("command-bookmarks"))} aria-label="Library" data-command-id="command-bookmarks" onClick={() => runCommand("command-bookmarks")}>{shellIconBookmark}</button>}
        {!horizontal && sidebar === "hidden" && !bridge.privateMode && <button {...staticIconButtonProps} title="Settings" aria-label="Settings" data-command-id="settings" onClick={() => runCommand("settings")}>{shellIconGear}</button>}
        {page?.controller === "human" && <ReturnControlButton pageId={page.pageId} />}
        {page && (page.controller === "agent" || page.controller === "external") && (
          <button {...auxNativeButtonTypeProps} className="ctl-chip agent" title={withShortcut("Take control of this page", key("take-page-control"))} aria-label="Take control of this page" data-command-id="take-page-control" onClick={() => void takeControl(page.pageId)}>
            {shellIconAgentSm}
            <span className="ctl-chip-label">Agent</span>
            <span className="ctl-take">Take over</span>
          </button>
        )}
        <button className={`icon-btn ${mode === "overview" ? "on" : ""}`} title={withShortcut("Tab overview", key("overview"))} aria-label="Tab overview" aria-pressed={mode === "overview"} data-command-id="overview" onClick={() => runCommand("overview")}>{shellIconGrid}</button>
        {!bridge.privateMode && <button className={`icon-btn ${bookmarked ? "on" : ""}`} title={withShortcut(bookmarked ? "Remove bookmark" : "Bookmark this page", key("bookmark"))} aria-label={bookmarked ? "Remove bookmark" : "Bookmark this page"} aria-pressed={bookmarked} disabled={!web || bookmarkPending} data-command-id="bookmark" onClick={() => runCommand("bookmark")}>
          {bookmarked ? shellIconBookmarkFill : shellIconBookmark}
        </button>}
        {!bridge.privateMode && <button className={`icon-btn ${railOpen ? "on" : ""}`} title={withShortcut("Agent", key("agent-rail"))} aria-label="Toggle agent rail" aria-pressed={railOpen} data-command-id="agent-rail" onClick={() => runCommand("agent-rail")}>
          {shellIconAgent}
        </button>}
      </div>
    </header>
  );
});
