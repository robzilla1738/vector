import { smallGhostButtonProps } from "../ui/button-props";
import { useEffect, useRef } from "react";
import { Conversation } from "./Conversation";
import { Toasts } from "./Toasts";
import { bridge } from "../bridge";
import { useStore, errToast } from "../store";
import { shellIconOpen } from "../ui/icons";
import "./QuickAsk.css";
import { staticSpacerProps as auxClassSpacerProps } from "../ui/class-props";

export function QuickAsk({ onExpand }: { onExpand(): void }) {
  const composer = useRef<HTMLTextAreaElement>(null);
  const chatId = useStore((state) => state.conversationId);
  useEffect(() => {
    const frame = requestAnimationFrame(() => composer.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [chatId]);
  const connected = useStore((state) => state.connected);
  return (
    <main
      className="quick-ask"
      onKeyDown={(event) => {
        if (event.key === "Escape" && !event.defaultPrevented) {
          event.preventDefault();
          event.stopPropagation();
          void bridge.quickAsk("dismiss").catch(errToast);
        }
      }}
    >
      <div className="quick-ask-panel">
        <header className="quick-ask-header">
          <strong>Ask Aux</strong>
          <div {...auxClassSpacerProps} />
          <button
            {...smallGhostButtonProps}
            onClick={() => {
              useStore.getState().openConversationDraft(crypto.randomUUID());
            }}
          >
            New chat
          </button>
          <button {...smallGhostButtonProps} onClick={onExpand} title="Continue in a full browser window">
            Expand {shellIconOpen}
          </button>
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
