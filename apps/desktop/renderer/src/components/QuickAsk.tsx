import { useEffect } from "react";
import { Conversation } from "./Conversation";
import { bridge } from "../bridge";
import { useStore, errToast } from "../store";
import { I } from "./icons";

export function QuickAsk({onExpand}:{onExpand():void}) {
  const chatId=useStore(state=>state.conversationId);
  useEffect(()=>{const frame=requestAnimationFrame(()=>document.querySelector<HTMLTextAreaElement>(".quick-ask textarea")?.focus());return()=>cancelAnimationFrame(frame);},[chatId]);
  const connected=useStore(state=>state.connected);
  const toasts=useStore(state=>state.toasts);
  return <main className="quick-ask" onKeyDown={event=>{if(event.key==="Escape"&&!event.defaultPrevented){event.preventDefault();event.stopPropagation();void bridge.quickAsk("dismiss").catch(errToast);}}}>
    <header className="quick-ask-header"><strong>Ask Aux</strong><div className="sp"/><button className="btn sm ghost" onClick={()=>{useStore.getState().openConversationDraft(crypto.randomUUID());}}>New chat</button><button className="btn sm ghost" onClick={onExpand} title="Continue in a full browser window">Expand {I.open}</button></header>
    {!connected&&<p className="quick-ask-connection" role="status">Connecting to Aux… Your draft stays here.</p>}
    <Conversation embedded/>
    <div className="toasts" aria-live="polite">{toasts.map(item=><div key={item.id} className={`toast ${item.kind}`}>{item.text}</div>)}</div>
  </main>;
}
