import { orderedPages } from "../store/pages";
import { staticIconButtonProps } from "../ui/class-props";
import { memo, useEffect, useRef, useState } from "react";
import { useFeatureRailView } from "../features/registry";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../store";
import { ResizeHandle } from "./ResizeHandle";
import { Conversation } from "./surfaces";
import { deferSurface } from "./DeferredSurface";
import { shellIconClose, shellIconDown, shellIconLeft, shellIconOpen, shellIconPencil } from "../ui/icons";
import { RunPresence } from "../agent/RunPresence";
import { useShortcutLabels, withShortcut } from "../use-shortcut-label";
import { staticSpacerProps as auxClassSpacerProps } from "../ui/class-props";

const SetPanel = deferSurface(
  async () => {
    const module = await import("./SetPanel");
    return { default: module.SetPanel };
  },
  "Set",
  true,
  false,
  () => useStore.setState({ railOpen: false }),
);

const RailHistory = deferSurface(
  async () => {
    const module = await import("../chat-list/RailHistory");
    return { default: module.RailHistory };
  },
  "Recent conversations",
  true,
  false,
  () => useStore.setState({ railOpen: false }),
);

export const AgentRail = memo(function AgentRail() {
  const FeatureRailView = useFeatureRailView();
  const key = useShortcutLabels();
  const railOpen = useStore((s) => s.railOpen);
  const view = useStore((s) => s.railView);
  const setRailView = useStore((s) => s.setRailView);
  const toggleRail = useStore((s) => s.toggleRail);
  const railWidth = useStore((s) => s.railWidth);
  const setRailWidth = useStore((s) => s.setRailWidth);
  const connected = useStore((s) => s.connected);
  const selectedRunId = view.kind === "run" ? view.runId : null;
  const selectedRun = useStore((s) =>
    selectedRunId ? s.runs.find((run) => run.runId === selectedRunId) : undefined,
  );
  const selectedPages = useStore(
    useShallow((s) =>
      selectedRun ? orderedPages(s.pages).filter((page) => selectedRun.pageIds.includes(page.pageId)) : [],
    ),
  );
  const [recentOpen, setRecentOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const chatId =
    view.kind === "draft"
      ? view.chatId
      : selectedRun
        ? (selectedRun.config?.chatId ?? selectedRun.runId)
        : view.kind === "run"
          ? view.runId
          : null;
  const hasDraft = useStore(
    (state) => !!(chatId ? state.conversationDrafts[`chat:${chatId}`] : state.agentDraft)?.trim(),
  );
  useEffect(() => {
    setRecentOpen(false);
  }, [view]);
  useEffect(() => {
    if (!railOpen || FeatureRailView || recentOpen || view.kind === "set") return;
    const frame = requestAnimationFrame(() => composer.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [railOpen, FeatureRailView, recentOpen, view.kind]);
  const expand = () => {
    if (selectedRun) useStore.getState().openConversation(selectedRun.runId);
    else useStore.getState().openConversationDraft(chatId);
  };
  return (
    <aside
      ref={root}
      className={`rail ${railOpen ? "open" : ""}`}
      style={{ "--rail-w": `${railWidth}px` } as React.CSSProperties}
      aria-label="Aux assistant"
      aria-hidden={!railOpen}
      inert={!railOpen}
    >
      {FeatureRailView ? (
        railOpen && <FeatureRailView />
      ) : (
        <div className="rail-inner">
          <div className="rail-head">
            <button
              type="button"
              className="rail-title"
              title={recentOpen ? "Return to conversation" : "Recent conversations"}
              aria-label={recentOpen ? "Return to conversation" : "Recent conversations"}
              aria-pressed={recentOpen}
              onClick={() => setRecentOpen((value) => !value)}
            >
              {recentOpen && shellIconLeft}
              <span>
                {recentOpen ? "Recent chats" : view.kind === "set" ? "Set" : selectedRun?.goal || "New chat"}
              </span>
              {!recentOpen && shellIconDown}
            </button>
            {!connected && <output className="rail-sub offline">Connecting…</output>}
            {selectedRun && <RunPresence run={selectedRun} pages={selectedPages} compact />}
            <span {...auxClassSpacerProps} />
            {!recentOpen && view.kind !== "set" && (selectedRun || hasDraft) && (
              <button
                {...staticIconButtonProps}
                title="Open full conversation"
                aria-label="Open full conversation"
                onClick={expand}
              >
                {shellIconOpen}
              </button>
            )}
            <button
              {...staticIconButtonProps}
              title="New conversation"
              aria-label="New conversation"
              onClick={() => {
                setRecentOpen(false);
                setRailView({ kind: "home" });
              }}
            >
              {shellIconPencil}
            </button>
            <button
              {...staticIconButtonProps}
              title={withShortcut("Hide", key("agent-rail"))}
              aria-label="Hide assistant"
              onClick={toggleRail}
            >
              {shellIconClose}
            </button>
          </div>
          <div className={`rail-body${recentOpen ? " rail-recents" : ""}`}>
            {railOpen && recentOpen && <RailHistory />}
            {railOpen && !recentOpen && view.kind !== "set" && (
              <Conversation
                chatId={chatId}
                embedded
                composerRef={composer}
                onChatCreated={(chatId) => setRailView({ kind: "draft", chatId })}
              />
            )}
            {railOpen && !recentOpen && view.kind === "set" && <SetPanel setId={view.setId} />}
          </div>
        </div>
      )}
      <ResizeHandle side="right" value={railWidth} min={280} max={620} reset={400} onResize={setRailWidth} />
    </aside>
  );
});
