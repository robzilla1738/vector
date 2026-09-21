import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { setDictationDraft, useDictationDrafts } from "../dictation-drafts";
import { bridge } from "../bridge";

/** Dictated words remain a local, editable preview until the user inserts them. */
export function Dictation({ draftKey, disabled, onInsert }: {draftKey:string; disabled:boolean; onInsert:(text:string)=>void}) {
  const [available,setAvailable]=useState(false);
  const text=useDictationDrafts(state=>state.drafts[draftKey]??"");
  const setText=(value:string)=>setDictationDraft(draftKey,value);
  const [phase,setPhase]=useState<"idle"|"saved"|"starting"|"recording"|"finishing"|"review">(text ? "review" : "idle");
  const [error,setError]=useState("");
  const panel=useRef<HTMLElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const session=useRef<string|null>(null);
  const alive=useRef(true);
  const holding=useRef(false);
  const recording=useRef(false);
  const releaseHold=useRef<()=>void>(()=>{});
  useEffect(()=>{
    alive.current=true;
    void bridge.dictationStatus().then(value=>{if(alive.current)setAvailable(value.available);}).catch(()=>{});
    const off=bridge.onDictation(event=>{
      if(event.sessionId!==session.current)return;
      if(event.text!==undefined)setText(event.text);
      if(event.type==="recording"){recording.current=true;setPhase("recording");}
      if(event.type==="finishing")setPhase("finishing");
      if(event.type==="final"||event.type==="error"){
        session.current=null;recording.current=false;holding.current=false;setPhase("review");
        if(event.type==="error")setError(event.message||"Dictation stopped. Try again.");
      }
    });
    const released=(event:KeyboardEvent)=>{if(event.code==="Space"&&holding.current){event.preventDefault();releaseHold.current();}};
    const blurred=()=>{if(holding.current)releaseHold.current();};
    window.addEventListener("keyup",released,true);
    window.addEventListener("blur",blurred);
    return()=>{window.removeEventListener("keyup",released,true);window.removeEventListener("blur",blurred);alive.current=false;off();if(session.current)void bridge.cancelDictation(session.current).catch(()=>{});session.current=null;};
  },[]);
  useEffect(()=>{
    if(document.activeElement!==document.body&&!panel.current?.contains(document.activeElement))return;
    if(phase==="idle"||phase==="saved")trigger.current?.focus();
    else panel.current?.querySelector<HTMLElement>(phase==="review"?"textarea":"button")?.focus();
  },[phase]);
  function discard(){
    if(session.current)void bridge.cancelDictation(session.current).catch(()=>{});
    session.current=null;recording.current=false;holding.current=false;setPhase("idle");setText("");setError("");
  }
  function cancelCapture(){
    if(session.current)void bridge.cancelDictation(session.current).catch(()=>{});
    session.current=null;recording.current=false;holding.current=false;
    setPhase(text.trim()?"review":"idle");setError("");
  }
  useEffect(()=>{
    if(!disabled||!session.current)return;
    void bridge.cancelDictation(session.current).catch(()=>{});
    session.current=null;recording.current=false;holding.current=false;setPhase("review");
  },[disabled]);
  async function start(){
    if(session.current||disabled)return;
    const id=crypto.randomUUID();session.current=id;recording.current=false;setPhase("starting");setText("");setError("");
    try{if(!await bridge.startDictation(id))throw new Error("Dictation could not start.");}
    catch(reason){if(alive.current&&session.current===id){session.current=null;recording.current=false;holding.current=false;setPhase("review");setError(reason instanceof Error?reason.message:String(reason));}}
  }
  async function stop(){
    const id=session.current;if(!id)return;
    setPhase("finishing");
    try{if(!await bridge.stopDictation(id))throw new Error("Dictation is no longer recording.");}
    catch{if(session.current===id){void bridge.cancelDictation(id).catch(()=>{});session.current=null;recording.current=false;holding.current=false;setPhase("review");setError("Dictation stopped before finishing. Review the text below.");}}
  }
  releaseHold.current=()=>{
    holding.current=false;
    if(recording.current)void stop();
    else discard(); // Releasing during permission/startup cannot begin capture later.
  };
  if(!available && !text)return null;
  if(phase==="idle"||phase==="saved")return <button ref={trigger} className="dictation-trigger" disabled={disabled} onClick={()=>phase==="saved"?setPhase("review"):void start()} onKeyDown={event=>{
    if(event.code!=="Space"||event.nativeEvent.isComposing)return;
    event.preventDefault();event.stopPropagation();
    if(event.repeat||holding.current)return;
    if(phase==="saved"){setPhase("review");return;}
    holding.current=true;void start();
  }} title={phase==="saved"?"Review your unsent dictation":"Click to dictate, or hold Space while focused to talk. Review before inserting."}><Mic size={15} aria-hidden/> {phase==="saved"?"Review dictation":"Dictate"}</button>;
  return <section ref={panel} className="dictation-panel" aria-label="Dictation" onKeyDown={event=>{
    if(event.key!=="Escape"||event.nativeEvent.isComposing)return;
    event.preventDefault();event.stopPropagation();
    if(phase==="review")setPhase(text.trim()?"saved":"idle");
    else cancelCapture();
  }}>
    <div className="dictation-heading"><strong aria-live="polite">{phase==="recording"?"Listening…":phase==="starting"?"Starting microphone…":phase==="finishing"?"Finishing…":"Review dictation"}</strong><span>{holding.current?"Release Space to stop · on this Mac":"On this Mac · never sent automatically"}</span></div>
    {error&&<p role="alert" className="hint err">{error}</p>}
    <textarea aria-label="Dictation transcript" value={text} readOnly={phase!=="review"} placeholder={phase==="review"?"No words captured. Try again when you’re ready.":"Your words appear here…"} onChange={event=>setText(event.target.value)} onKeyDown={event=>{if(event.key!=="Escape")event.stopPropagation();}}/>
    <div className="dictation-actions">
      {phase==="recording"&&<button className="btn sm" onClick={()=>void stop()}>Stop recording</button>}
      {phase==="review"&&<><button className="btn sm" disabled={disabled||!text.trim()} onClick={()=>{
        const input=panel.current?.closest(".conversation")?.querySelector<HTMLTextAreaElement>('textarea[aria-label="Reply to conversation"]');
        onInsert(text.trim());discard();
        requestAnimationFrame(()=>{if(input?.isConnected)input.focus();});
      }}>Insert into message</button><button className="btn sm ghost" disabled={disabled||!available} onClick={()=>void start()}>Record again</button></>}
      <button className="btn sm ghost" onClick={phase==="review"?discard:cancelCapture}>{phase==="review"?"Discard":"Cancel"}</button>
    </div>
  </section>;
}
