import { useEffect, useRef, useState } from "react";
import { Conversation } from "./Conversation";
import { HOME_DRAFT_CHAT_KEY, readPendingConversation } from "../conversation-drafts";
import { bridge } from "../bridge";
import { errToast, useStore } from "../store";
import "./HomeAsk.css";

/** Home uses the real composer and durable draft/context services. Loaded only in Ask mode. */
export default function HomeAsk({ onSearch }: { onSearch(): void }) {
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
  useEffect(()=>bridge.onEvent(event=>{if(event.type==="conversation.deleted" && event.payload.chatId===chatId)setChatId(null);}),[chatId]);
  const controls = <div className="home-composer-mode" role="group" aria-label="Search or Ask"><button type="button" aria-pressed={false} onClick={onSearch}>Search</button><button type="button" aria-pressed={true}>Ask</button></div>;
  return <div className="home-ask">{railOpen ? <div className="home-ask-handoff"><span>Your assistant is open in the side panel.</span><button className="btn sm" onClick={() => useStore.getState().toggleRail()}>Compose here</button><button className="btn sm ghost" onClick={onSearch}>Search instead</button></div> : <Conversation embedded home composerRef={composer} chatId={chatId} onChatCreated={id=>{setChatId(id);try{localStorage.setItem(HOME_DRAFT_CHAT_KEY,id);}catch{/* The mounted composer still owns this draft. */}}} entryControls={controls}/>}</div>;
}
