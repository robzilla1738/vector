import { FeatureSlots } from "../features/registry";
import { useRef, useState, type CSSProperties } from "react";
import { runCommand } from "../commands";
import { useFloatingSidebar } from "../floating-sidebar";
import { bridge } from "../bridge";
import { SidebarChats } from "../chat-list/SidebarChats";
import { useStore } from "../store";
import { ResizeHandle } from "./ResizeHandle";
import { shellIconFolder, shellIconGear, shellIconPencil, shellIconSearch } from "../ui/icons";

import "./ChatSidebar.css";

/** The horizontal layout keeps tabs in the title bar and uses this panel for work. */
export function ChatSidebar({ minimal = false }: { minimal?: boolean }) {
  const [query, setQuery] = useState("");
  const sidebar = useStore((state) => state.sidebar);
  const peek = useStore((state) => state.sidebarPeek);
  const open = peek || (!minimal && sidebar === "expanded");
  const panel = useRef<HTMLElement>(null);
  useFloatingSidebar(minimal ? "hidden" : sidebar, panel);
  const width = useStore((state) => state.sidebarWidth);
  const setWidth = useStore((state) => state.setSidebarWidth);
  const conversationId = useStore((state) => state.conversationId);
  const mode = useStore((state) => state.mode);
  const setOverlay = useStore((state) => state.setOverlay);

  return (
    <aside
      ref={panel}
      className={`chat-sidebar${open ? " open" : ""}`}
      style={{ "--sb-w": `${width}px` } as CSSProperties}
      aria-label="Sidebar"
      aria-hidden={!open}
      inert={!open}
    >
      <div className="chat-sidebar-content">
        <label className="chat-sidebar-search" data-input-surface>
          {shellIconSearch}
          <input
            type="search"
            aria-label="Search chats"
            placeholder="Search…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && !event.nativeEvent.isComposing) {
                event.preventDefault();
                event.stopPropagation();
                setQuery("");
              }
            }}
          />
        </label>
        <FeatureSlots slot="sidebarItems" />
        <nav aria-label="Work">
          <button
            className={`chat-sidebar-link primary${mode === "conversation" && !conversationId ? " current" : ""}`}
            aria-current={mode === "conversation" && !conversationId ? "page" : undefined}
            data-command-id="new-chat"
            onClick={() => runCommand("new-chat")}
          >
            {shellIconPencil}
            <span>New chat</span>
          </button>
          <button className="chat-sidebar-link" onClick={() => setOverlay("tasks")}>
            {shellIconFolder}
            <span>Tasks</span>
          </button>
          <button className="chat-sidebar-link" onClick={() => setOverlay("settings")}>
            {shellIconGear}
            <span>Settings</span>
          </button>
        </nav>
        <section className="chat-sidebar-history" aria-label={bridge.privateMode ? "Private chats" : "Chats"}>
          <SidebarChats query={query} />
        </section>
      </div>
      {open && (
        <ResizeHandle
          side="left"
          value={width}
          min={126}
          max={400}
          reset={280}
          onResize={setWidth}
          onCollapse={() => runCommand("sidebar-hide")}
        />
      )}
    </aside>
  );
}
