import { useEffect, useRef, useState } from "react";
import { Conversation } from "./Conversation";
import { readPendingConversation } from "../conversation-drafts";
import { bridge } from "../bridge";
import { errToast, useStore } from "../store";
import "./HomeAsk.css";

/** Home uses the real composer and durable draft/context services. Loaded only in Ask mode. */
export default function HomeAsk({ onSearch }: { onSearch(): void }) {
  const [chatId, setChatId] = useState(() => useStore.getState().agentDraft.trim() ? null : readPendingConversation(typeof localStorage === "undefined" ? null : localStorage));
  const root = useRef<HTMLDivElement>(null);
  const focusRequest = useStore(state => state.focusRequest);
  const railOpen = useStore(state => state.railOpen);
  useEffect(() => {
    if (railOpen) return;
    let active = true;
    void bridge.focusShell().then(() => { if (active) root.current?.querySelector<HTMLTextAreaElement>('textarea[aria-label="Reply to conversation"]')?.focus(); }).catch(errToast);
    return () => { active = false; };
  }, [focusRequest, railOpen]);
  const controls = <div className="home-composer-mode" role="group" aria-label="Search or Ask"><button type="button" aria-pressed={false} onClick={onSearch}>Search</button><button type="button" aria-pressed={true}>Ask</button></div>;
  return <div ref={root} className="home-ask">{railOpen ? <div className="home-ask-handoff"><span>Your assistant is open in the side panel.</span><button className="btn sm" onClick={() => useStore.getState().toggleRail()}>Compose here</button><button className="btn sm ghost" onClick={onSearch}>Search instead</button></div> : <Conversation embedded home chatId={chatId} onChatCreated={setChatId} entryControls={controls}/>}</div>;
}
