import { useEffect, useRef } from "react";
import { Conversation } from "./Conversation";
import { Toasts } from "./Toasts";
import { bridge, inNativeHost } from "../bridge";
import { useStore, errToast } from "../store";
import { IconButton } from "../ui";
import { shellIconClose, shellIconOpen, shellIconPlusSm } from "../ui/icons";
import "./QuickAsk.css";

export function QuickAsk({ onExpand }: { onExpand(): void }) {
  const composer = useRef<HTMLTextAreaElement>(null);
  const chatId = useStore((state) => state.conversationId);
  const title = useStore(
    (state) => state.runs.find((run) => (run.config?.chatId ?? run.runId) === chatId)?.goal ?? "Ask Aux",
  );
  useEffect(() => {
    const frame = requestAnimationFrame(() => composer.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [chatId]);
  const connected = useStore((state) => state.connected);
  const dismiss = () => void bridge.quickAsk("dismiss").catch(errToast);
  return (
    <main
      className={`quick-ask${inNativeHost ? " native-host" : ""}`}
      aria-label="Quick Ask"
      onKeyDown={(event) => {
        if (event.key === "Escape" && !event.defaultPrevented && !event.nativeEvent.isComposing) {
          event.preventDefault();
          event.stopPropagation();
          dismiss();
        }
      }}
    >
      <div className="quick-ask-panel">
        <header className="quick-ask-header">
          <strong title={title}>{title}</strong>
          <IconButton
            label="New chat"
            title="New chat"
            size={28}
            onClick={() => {
              useStore.getState().openConversationDraft(crypto.randomUUID());
            }}
          >
            {shellIconPlusSm}
          </IconButton>
          <IconButton label="Open in Aux" title="Open in Aux" size={28} onClick={onExpand}>
            {shellIconOpen}
          </IconButton>
          <IconButton label="Close Quick Ask" title="Close Quick Ask" size={28} onClick={dismiss}>
            {shellIconClose}
          </IconButton>
        </header>
        {!connected && (
          <output className="quick-ask-connection" data-block>
            Connecting to Aux… Your draft stays here.
          </output>
        )}
        <Conversation embedded composerRef={composer} />
        <Toasts />
      </div>
    </main>
  );
}
