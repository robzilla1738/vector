import { type CSSProperties } from "react";
import { bridge } from "../bridge";
import { ChatSessions } from "./ChatSessions";
import { useStore } from "../store";
import { ResizeHandle } from "./ResizeHandle";
import { I } from "./icons";

/** The horizontal layout keeps tabs in the title bar and uses this panel for work. */
export function ChatSidebar() {
  const open = useStore(state => state.sidebar === "expanded");
  const width = useStore(state => state.sidebarWidth);
  const setWidth = useStore(state => state.setSidebarWidth);
  const conversationId = useStore(state => state.conversationId);
  const mode = useStore(state => state.mode);
  const setOverlay = useStore(state => state.setOverlay);

  return <aside className={`chat-sidebar${open ? " open" : ""}`} style={{ "--sb-w": `${width}px` } as CSSProperties} aria-label="Sidebar" aria-hidden={!open} inert={!open}>
    <div className="chat-sidebar-content">
    <nav aria-label="Work">
      {!bridge.privateMode && <button className={`chat-sidebar-link primary${mode === "conversation" && !conversationId ? " current" : ""}`} aria-current={mode === "conversation" && !conversationId ? "page" : undefined} onClick={() => useStore.getState().openConversation(null)}>{I.pencil}<span>New chat</span></button>}
      <button className="chat-sidebar-link" onClick={() => setOverlay("tasks")}>{I.folder}<span>Tasks</span></button>
      <button className="chat-sidebar-link" onClick={() => setOverlay("settings")}>{I.gear}<span>Settings</span></button>
    </nav>
    {!bridge.privateMode && <section className="chat-sidebar-history" aria-label="Chats">
      <ChatSessions />
    </section>}
    </div>
    {open && <ResizeHandle side="left" value={width} min={220} max={380} reset={280} onResize={setWidth} />}
  </aside>;
}
