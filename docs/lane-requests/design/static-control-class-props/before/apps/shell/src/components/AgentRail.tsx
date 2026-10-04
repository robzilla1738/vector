import { memo, useEffect, useRef, useState } from "react";
import { useFeatureRailView } from "../features/registry";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../store";
import { ResizeHandle } from "./ResizeHandle";
import { Conversation } from "./surfaces";
import { deferSurface } from "./DeferredSurface";
import { shellIconChats, shellIconLeft, shellIconOpen, shellIconPlus, shellIconRail } from "./icons";
import { RunPresence } from "../agent/RunPresence";
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
  const FeatureRailView = useFeatureRailView();
  const key = useShortcutLabels();
  const railOpen = useStore(s => s.railOpen);
  const view = useStore(s => s.railView);
  const setRailView = useStore(s => s.setRailView);
  const toggleRail = useStore(s => s.toggleRail);
  const railWidth = useStore(s => s.railWidth);
  const setRailWidth = useStore(s => s.setRailWidth);
  const connected = useStore(s => s.connected);
  const selectedRunId = view.kind === "run" ? view.runId : null;
  const selectedRun = useStore(s => selectedRunId ? s.runs.find(run => run.runId === selectedRunId) : undefined);
  const selectedPages = useStore(useShallow(s => selectedRun ? s.pages.filter(page => selectedRun.pageIds.includes(page.pageId)) : []));
  const [recentOpen, setRecentOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const chatId = view.kind === "draft" ? view.chatId : selectedRun ? selectedRun.config?.chatId ?? selectedRun.runId : view.kind === "run" ? view.runId : null;
  useEffect(() => { setRecentOpen(false); }, [view]);
  useEffect(() => {
    if (!railOpen || FeatureRailView || recentOpen || view.kind === "set") return;
    const frame = requestAnimationFrame(() => composer.current?.focus({preventScroll:true}));
    return () => cancelAnimationFrame(frame);
  }, [railOpen, FeatureRailView, recentOpen, view.kind]);
  const expand = () => {
    if (selectedRun) useStore.getState().openConversation(selectedRun.runId);
    else useStore.getState().openConversationDraft(chatId);
  };
  return (
    <aside ref={root} className={`rail ${railOpen ? "open" : ""}`} style={{ "--rail-w": `${railWidth}px` } as React.CSSProperties} aria-label="Aux assistant" aria-hidden={!railOpen} inert={!railOpen}>
      {FeatureRailView ? (railOpen && <FeatureRailView />) : <div className="rail-inner">
        <div className="rail-head">
          <span className="rail-title">{recentOpen ? "Recent work" : view.kind === "set" ? "Set" : "Ask Aux"}</span>
          {!connected && <output className="rail-sub offline">Connecting…</output>}
          {selectedRun && <RunPresence run={selectedRun} pages={selectedPages} compact />}
          <span className="sp" />
          <button className="icon-btn" title={recentOpen ? "Return to conversation" : "Recent conversations"} aria-label={recentOpen ? "Return to conversation" : "Recent conversations"} aria-pressed={recentOpen} onClick={() => setRecentOpen(value => !value)}>{recentOpen ? shellIconLeft : shellIconChats}</button>
          {!recentOpen && view.kind !== "set" && <button className="icon-btn" title="Open full conversation" aria-label="Open full conversation" onClick={expand}>{shellIconOpen}</button>}
          <button className="icon-btn" title="New conversation" aria-label="New conversation" onClick={() => { setRecentOpen(false); setRailView({kind:"home"}); }}>{shellIconPlus}</button>
          <button className="icon-btn" title={withShortcut("Hide", key("agent-rail"))} aria-label="Hide assistant" onClick={toggleRail}>{shellIconRail}</button>
        </div>
        <div className={`rail-body${recentOpen ? " rail-recents" : ""}`}>
          {railOpen && recentOpen && <RailHistory />}
          {railOpen && !recentOpen && view.kind !== "set" && <Conversation chatId={chatId} embedded composerRef={composer} onChatCreated={chatId => setRailView({kind:"draft",chatId})} />}
          {railOpen && !recentOpen && view.kind === "set" && <SetPanel setId={view.setId} />}
        </div>
      </div>}
      <ResizeHandle side="right" value={railWidth} min={300} max={620} reset={360} onResize={setRailWidth} />
    </aside>
  );
});
