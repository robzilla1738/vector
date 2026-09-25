import { memo, useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { ResizeHandle } from "./ResizeHandle";
import { Conversation } from "./surfaces";
import { deferSurface } from "./DeferredSurface";
import { I } from "./icons";
import { useShortcutLabels, withShortcut } from "../use-shortcut-label";

const SetPanel = deferSurface(async () => {
  const module = await import("./SetPanel");
  return { default: module.SetPanel };
}, "Set", true, false, () => useStore.setState({ railOpen: false }));

const RailHistory = deferSurface(async () => {
  const module = await import("./RailHistory");
  return { default: module.RailHistory };
}, "Recent conversations", true, false, () => useStore.setState({ railOpen: false }));

export const AgentRail = memo(function AgentRail() {
  const key = useShortcutLabels();
  const railOpen = useStore(s => s.railOpen);
  const view = useStore(s => s.railView);
  const setRailView = useStore(s => s.setRailView);
  const toggleRail = useStore(s => s.toggleRail);
  const railWidth = useStore(s => s.railWidth);
  const setRailWidth = useStore(s => s.setRailWidth);
  const connected = useStore(s => s.connected);
  const runs = useStore(s => s.runs);
  const [recentOpen, setRecentOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const selectedRun = view.kind === "run" ? runs.find(run => run.runId === view.runId) : undefined;
  const chatId = view.kind === "draft" ? view.chatId : selectedRun ? selectedRun.config?.chatId ?? selectedRun.runId : view.kind === "run" ? view.runId : null;
  useEffect(() => { setRecentOpen(false); }, [view]);
  useEffect(() => {
    if (!railOpen || recentOpen || view.kind === "set") return;
    const frame = requestAnimationFrame(() => root.current?.querySelector<HTMLTextAreaElement>('.conversation-input textarea')?.focus({preventScroll:true}));
    return () => cancelAnimationFrame(frame);
  }, [railOpen, recentOpen, view.kind]);
  const expand = () => {
    if (selectedRun) useStore.getState().openConversation(selectedRun.runId);
    else useStore.getState().openConversationDraft(chatId);
  };
  return (
    <aside ref={root} className={`rail ${railOpen ? "open" : ""}`} style={{ "--rail-w": `${railWidth}px` } as React.CSSProperties} aria-label="Aux assistant" aria-hidden={!railOpen} inert={!railOpen}>
      <div className="rail-inner">
        <div className="rail-head">
          <span className="rail-title">{recentOpen ? "Recent work" : view.kind === "set" ? "Set" : "Ask Aux"}</span>
          {!connected && <output className="rail-sub offline">Connecting…</output>}
          <span className="sp" />
          <button className="icon-btn" title={recentOpen ? "Return to conversation" : "Recent conversations"} aria-label={recentOpen ? "Return to conversation" : "Recent conversations"} aria-pressed={recentOpen} onClick={() => setRecentOpen(value => !value)}>{recentOpen ? I.left : I.chats}</button>
          {!recentOpen && view.kind !== "set" && <button className="icon-btn" title="Open full conversation" aria-label="Open full conversation" onClick={expand}>{I.open}</button>}
          <button className="icon-btn" title="New conversation" aria-label="New conversation" onClick={() => { setRecentOpen(false); setRailView({kind:"home"}); }}>{I.plus}</button>
          <button className="icon-btn" title={withShortcut("Hide", key("agent-rail"))} aria-label="Hide assistant" onClick={toggleRail}>{I.rail}</button>
        </div>
        <div className={`rail-body${recentOpen ? " rail-recents" : ""}`}>
          {railOpen && recentOpen && <RailHistory />}
          {railOpen && !recentOpen && view.kind !== "set" && <Conversation chatId={chatId} embedded onChatCreated={chatId => setRailView({kind:"draft",chatId})} />}
          {railOpen && !recentOpen && view.kind === "set" && <SetPanel setId={view.setId} />}
        </div>
      </div>
      <ResizeHandle side="right" value={railWidth} min={300} max={620} reset={360} onResize={setRailWidth} />
    </aside>
  );
});
