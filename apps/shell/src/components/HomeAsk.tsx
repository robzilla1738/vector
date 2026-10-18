import type { FirstFrameEntry } from "../first-frame";
import {
  smallButtonProps as auxReserveSmallButtonProps,
  smallGhostButtonProps as auxReserveSmallGhostButtonProps,
} from "../ui/button-props";
import { HomeEntryAction, runHomeEntry, useHomeEntryInput, useHomeEntryOwner } from "./HomeEntryControls";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Conversation } from "./Conversation";
import type { HomePromptRequest } from "./home-prompt";
import { HOME_DRAFT_CHAT_KEY, draftKey, readPendingConversation } from "../conversation-drafts";
import { bridge } from "../bridge";
import { runCommand } from "../commands";
import { errToast, useStore } from "../store";
import "./HomeAsk.css";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";

/** Home uses the real composer and durable draft/context services. Loaded only when the home composer is needed. */
export default function HomeAsk({
  onSearch,
  current,
  firstFrame,
  promptRequest,
  onPromptConsumed,
}: {
  onSearch?(): unknown;
  current?(): boolean;
  firstFrame?: FirstFrameEntry;
  promptRequest?: HomePromptRequest;
  onPromptConsumed?(request: HomePromptRequest): void;
}) {
  const ownCurrent = useHomeEntryOwner(true);
  const searchCurrent = current ?? ownCurrent;
  const [chatId, setChatId] = useState(() =>
    bridge.privateMode || useStore.getState().agentDraft.trim()
      ? null
      : readPendingConversation(
          typeof localStorage === "undefined" ? null : localStorage,
          HOME_DRAFT_CHAT_KEY,
        ),
  );
  const composer = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    if (!firstFrame?.focused) return;
    const input = composer.current;
    input?.focus();
    input?.setSelectionRange(
      firstFrame.selectionStart,
      firstFrame.selectionEnd,
      firstFrame.selectionDirection,
    );
  }, [firstFrame]);
  const focusRequest = useStore((state) => state.focusRequest);
  const focusSlot = useStore((state) => state.focusSlot);
  const railOpen = useStore((state) => state.railOpen);
  const consumedPrompt = useRef<HomePromptRequest | null>(null);
  useLayoutEffect(() => {
    if (!promptRequest || consumedPrompt.current === promptRequest || railOpen || !searchCurrent()) return;
    consumedPrompt.current = promptRequest;
    const state = useStore.getState();
    const existing = chatId ? (state.conversationDrafts[draftKey(chatId)] ?? "") : state.agentDraft;
    const text = existing.trim() ? `${existing.trimEnd()}\n\n${promptRequest.text}` : promptRequest.text;
    if (chatId) state.setConversationDraft(chatId, text);
    else state.setAgentDraft(text);
    composer.current?.focus();
    onPromptConsumed?.(promptRequest);
  }, [promptRequest, onPromptConsumed, chatId, railOpen, searchCurrent]);
  useEffect(() => {
    if (railOpen || (focusRequest > 0 && focusSlot !== "hero")) return;
    let active = true;
    const previous = document.activeElement;
    void bridge
      .focusShell()
      .then(() => {
        if (active && (document.activeElement === previous || document.activeElement === document.body))
          composer.current?.focus();
      })
      .catch((error) => {
        if (active) errToast(error);
      });
    return () => {
      active = false;
    };
  }, [focusRequest, focusSlot, railOpen]);
  useEffect(
    () =>
      bridge.onEvent((event) => {
        if (event.type === "conversation.deleted" && event.payload.chatId === chatId) {
          setChatId(null);
          try {
            if (localStorage.getItem(HOME_DRAFT_CHAT_KEY) === chatId)
              localStorage.removeItem(HOME_DRAFT_CHAT_KEY);
          } catch {
            /* The mounted composer still forgets the deleted chat. */
          }
        }
      }),
    [chatId],
  );
  const searchScope = useHomeEntryInput(
    composer,
    !!onSearch && !railOpen,
    searchCurrent,
    () => onSearch?.(),
    "select-home-search",
  );
  const controls = onSearch ? (
    <div className="home-mode home-composer-controls">
      <span>
        <kbd>Tab</kbd> to switch
      </span>
      <div className="home-composer-mode" role="group" aria-label="Search or Ask">
        <HomeEntryAction
          type="button"
          aria-pressed={false}
          command="select-home-search"
          current={searchCurrent}
          invoke={onSearch}
        >
          Search
        </HomeEntryAction>
        <button {...auxNativeButtonTypeProps} aria-pressed={true}>
          Ask
        </button>
      </div>
    </div>
  ) : undefined;
  return (
    <div
      className="home-ask"
      onKeyDown={(event) => {
        if (
          !onSearch ||
          event.target !== composer.current ||
          event.defaultPrevented ||
          event.key !== "Tab" ||
          event.shiftKey ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.nativeEvent.isComposing ||
          event.keyCode === 229
        )
          return;
        event.preventDefault();
        runHomeEntry("select-home-search", searchScope, event.nativeEvent);
      }}
    >
      {railOpen ? (
        <div className="home-ask-handoff">
          <span>Your assistant is open in the side panel.</span>
          <button
            {...auxReserveSmallButtonProps}
            data-command-id="agent-rail"
            onClick={() => runCommand("agent-rail")}
          >
            Compose here
          </button>
          {onSearch && (
            <HomeEntryAction
              {...auxReserveSmallGhostButtonProps}
              command="select-home-search"
              current={searchCurrent}
              invoke={onSearch}
            >
              Search instead
            </HomeEntryAction>
          )}
        </div>
      ) : (
        <>
          <Conversation
            embedded
            home
            initialActivation={firstFrame?.activation?.mode === "ask" ? firstFrame.activation : undefined}
            composerRef={composer}
            chatId={chatId}
            onChatCreated={(id, temporary) => {
              setChatId(id);
              try {
                if (!temporary) localStorage.setItem(HOME_DRAFT_CHAT_KEY, id);
              } catch {
                /* The mounted composer still owns this draft. */
              }
            }}
            entryControls={controls}
          />
        </>
      )}
    </div>
  );
}
