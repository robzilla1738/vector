import {
  nativeButtonTypeProps as auxNativeButtonTypeProps,
} from "../ui/native-attribute-props";
import {
  smallButtonProps as auxReserveSmallButtonProps,
  smallGhostButtonProps as auxReserveSmallGhostButtonProps,
} from "../ui/button-props";
import { HomeEntryAction, useHomeEntryOwner } from "./HomeEntryControls";
import { useEffect, useRef, useState } from "react";
import { Conversation } from "./Conversation";
import { HOME_DRAFT_CHAT_KEY, readPendingConversation } from "../conversation-drafts";
import { bridge } from "../bridge";
import { runCommand } from "../commands";
import { errToast, useStore } from "../store";
import "./HomeAsk.css";

/** Home uses the real composer and durable draft/context services. Loaded only when the home composer is needed. */
export default function HomeAsk({ onSearch, current }: { onSearch?(): unknown; current?(): boolean }) {
  const ownCurrent = useHomeEntryOwner(!!onSearch);
  const searchCurrent = current ?? ownCurrent;
  const [chatId, setChatId] = useState(() => useStore.getState().agentDraft.trim() ? null : readPendingConversation(typeof localStorage === "undefined" ? null : localStorage, HOME_DRAFT_CHAT_KEY));
  const composer = useRef<HTMLTextAreaElement>(null);
  const focusRequest = useStore(state => state.focusRequest);
  const railOpen = useStore(state => state.railOpen);
  useEffect(() => {
    if (railOpen) return;
    let active = true;
    void bridge.focusShell().then(() => { if (active) composer.current?.focus(); }).catch(errToast);
    return () => { active = false; };
  }, [focusRequest, railOpen]);
  useEffect(()=>bridge.onEvent(event=>{if(event.type==="conversation.deleted" && event.payload.chatId===chatId){setChatId(null);try{if(localStorage.getItem(HOME_DRAFT_CHAT_KEY)===chatId)localStorage.removeItem(HOME_DRAFT_CHAT_KEY);}catch{/* The mounted composer still forgets the deleted chat. */}}}),[chatId]);
  const controls = onSearch ? <div className="home-composer-mode" role="group" aria-label="Search or Ask"><HomeEntryAction type="button" aria-pressed={false} command="select-home-search" current={searchCurrent} invoke={onSearch}>Search</HomeEntryAction><button {...auxNativeButtonTypeProps} aria-pressed={true}>Ask</button></div> : undefined;
  return <div className="home-ask">{railOpen ? <div className="home-ask-handoff"><span>Your assistant is open in the side panel.</span><button {...auxReserveSmallButtonProps} data-command-id="agent-rail" onClick={() => runCommand("agent-rail")}>Compose here</button>{onSearch && <HomeEntryAction {...auxReserveSmallGhostButtonProps} command="select-home-search" current={searchCurrent} invoke={onSearch}>Search instead</HomeEntryAction>}</div> : <Conversation embedded home composerRef={composer} chatId={chatId} onChatCreated={id=>{setChatId(id);try{localStorage.setItem(HOME_DRAFT_CHAT_KEY,id);}catch{/* The mounted composer still owns this draft. */}}} entryControls={controls}/>}</div>;
}
