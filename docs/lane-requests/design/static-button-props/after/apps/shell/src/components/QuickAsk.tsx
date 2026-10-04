import { smallGhostButtonProps } from "../ui/button-props";
import { memo, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { Conversation } from "./Conversation";
import { bridge } from "../bridge";
import { useStore, errToast } from "../store";
import { shellIconOpen } from "./icons";
import "./QuickAsk.css";

const QuickAskToast = memo(function QuickAskToast({ id }: { id: number }) {
  const toast = useStore(state => state.toasts.find(item => item.id === id));
  return toast ? <div className={`toast ${toast.kind}`}>{toast.text}</div> : null;
});

export function QuickAsk({onExpand}:{onExpand():void}) {
  const composer = useRef<HTMLTextAreaElement>(null);
  const chatId=useStore(state=>state.conversationId);
  useEffect(()=>{const frame=requestAnimationFrame(()=>composer.current?.focus());return()=>cancelAnimationFrame(frame);},[chatId]);
  const connected=useStore(state=>state.connected);
  const toastIds=useStore(useShallow(state=>state.toasts.map(item=>item.id)));
  return <main className="quick-ask" onKeyDown={event=>{if(event.key==="Escape"&&!event.defaultPrevented){event.preventDefault();event.stopPropagation();void bridge.quickAsk("dismiss").catch(errToast);}}}>
    <div className="quick-ask-panel">
      <header className="quick-ask-header"><strong>Ask Aux</strong><div className="sp"/><button {...smallGhostButtonProps} onClick={()=>{useStore.getState().openConversationDraft(crypto.randomUUID());}}>New chat</button><button {...smallGhostButtonProps} onClick={onExpand} title="Continue in a full browser window">Expand {shellIconOpen}</button></header>
      {!connected&&<output className="quick-ask-connection" data-block>Connecting to Aux… Your draft stays here.</output>}
      <Conversation embedded composerRef={composer}/>
      <div className="toasts" aria-live="polite">{toastIds.map(id=><QuickAskToast key={id} id={id}/>)}</div>
    </div>
  </main>;
}
