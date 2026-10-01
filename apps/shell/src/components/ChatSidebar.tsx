import { FeatureSlots } from "../features/registry";
import { useRef, type CSSProperties } from "react";
import { runCommand } from "../commands";
import { useFloatingSidebar } from "../floating-sidebar";
import { bridge } from "../bridge";
import { ChatSessions } from "./ChatSessions";
import { useStore } from "../store";
import { ResizeHandle } from "./ResizeHandle";
import { shellIconFolder, shellIconGear, shellIconPencil } from "./icons";

/** The horizontal layout keeps tabs in the title bar and uses this panel for work. */
export function ChatSidebar({ minimal = false }: { minimal?: boolean }) {
  const sidebar = useStore(state => state.sidebar);
  const peek = useStore(state => state.sidebarPeek);
  const open = peek || (!minimal && sidebar === "expanded");
  const panel = useRef<HTMLElement>(null);
  useFloatingSidebar(minimal ? "hidden" : sidebar, panel);
  const width = useStore(state => state.sidebarWidth);
  const setWidth = useStore(state => state.setSidebarWidth);
  const conversationId = useStore(state => state.conversationId);
  const mode = useStore(state => state.mode);
  const setOverlay = useStore(state => state.setOverlay);

  return <aside ref={panel} className={`chat-sidebar${open ? " open" : ""}`} style={{ "--sb-w": `${width}px` } as CSSProperties} aria-label="Sidebar" aria-hidden={!open} inert={!open}>
    <div className="chat-sidebar-content">
    <FeatureSlots slot="sidebarItems" />
    <nav aria-label="Work">
      {!bridge.privateMode && <button className={`chat-sidebar-link primary${mode === "conversation" && !conversationId ? " current" : ""}`} aria-current={mode === "conversation" && !conversationId ? "page" : undefined} onClick={() => useStore.getState().openConversation(null)}>{shellIconPencil}<span>New chat</span></button>}
      <button className="chat-sidebar-link" onClick={() => setOverlay("tasks")}>{shellIconFolder}<span>Tasks</span></button>
      <button className="chat-sidebar-link" onClick={() => setOverlay("settings")}>{shellIconGear}<span>Settings</span></button>
    </nav>
    {!bridge.privateMode && <section className="chat-sidebar-history" aria-label="Chats">
      <ChatSessions />
    </section>}
    </div>
    {open && <ResizeHandle side="left" value={width} min={126} max={400} reset={280} onResize={setWidth} onCollapse={() => runCommand("sidebar-hide")} />}
  </aside>;
}
