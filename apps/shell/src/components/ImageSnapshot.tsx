import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { ConversationImage } from "@aux/contracts";
import { call, useStore } from "../store";
import { useConversationOwner } from "./ConversationControls";
import { ConversationImageAction } from "./ConversationImageControl";
import { usePreferenceCommand } from "../settings/sections/preference-command";
import { ViewerFrame } from "./ViewerFrame";
import { ImageViewer } from "./ImageViewer";

export type SavedImageSnapshot = {image:ConversationImage;dataUrl:string};
export function ImagePreview({snapshot,onClose,closeControl,current}:{snapshot:SavedImageSnapshot;onClose():void;closeControl?:ReactNode;current?():boolean}) {
  const owner=useConversationOwner(JSON.stringify(snapshot.image),useStore(state=>state.connected));
  const scope=useId();
  const [summaryRef,disclose]=usePreferenceCommand<HTMLElement>("toggle-conversation-image-details",scope,(summary,event)=>{
    const details=summary.parentElement;
    if(!owner() || (current && !current()) || !(details instanceof HTMLDetailsElement) || details.firstElementChild!==summary)throw new Error("Choose the current image details.");
    event?.preventDefault();details.open=!details.open;
  });
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[snapshot.dataUrl]);
  return <ViewerFrame label="Image snapshot" title={snapshot.image.filename} onClose={onClose} closeControl={closeControl} closeLabel="Close image preview" metadata={`${snapshot.image.width} × ${snapshot.image.height} · ${snapshot.image.included ? "Included in new replies" : "Excluded from new replies"}`}>
    {failed ? <p role="alert">This saved image could not be displayed.</p> : <ImageViewer current={current} src={snapshot.dataUrl} alt={snapshot.image.filename} onError={()=>setFailed(true)}/>}
    <details className="image-viewer-metadata"><summary ref={summaryRef} data-command-id="toggle-conversation-image-details" onClick={disclose}>Image details</summary><p>Saved {new Date(snapshot.image.createdAt).toLocaleString()}</p>
    {snapshot.image.sourcePage && <p>Captured from {snapshot.image.sourcePage.url} at {new Date(snapshot.image.sourcePage.selectedAt ?? snapshot.image.createdAt).toLocaleString()}. This image remains a snapshot if the tab changes.</p>}</details>
  </ViewerFrame>;
}

/** Read only the selected conversation-owned image; previews never send a model request. */
export function ImageSnapshot({chatId,imageId,onClose,closeControl,current}:{chatId:string;imageId:string;onClose():void;closeControl?:ReactNode;current?():boolean}) {
  const owner=useConversationOwner(JSON.stringify([chatId,imageId]),useStore(state=>state.connected));
  const readCurrent=useCallback(()=>owner() && (!current || current()),[owner,current]);
  const pending=useRef(false);
  useLayoutEffect(()=>{pending.current=false;},[readCurrent]);
  const [snapshot,setSnapshot]=useState<SavedImageSnapshot|null>(null);
  const [error,setError]=useState("");
  const [retry,setRetry]=useState(0);
  useEffect(()=>{
    let live=true;setSnapshot(null);setError("");
    if(!readCurrent())return;
    void call("conversations.images.read",{chatId,imageId})
      .then(value=>{if(live && readCurrent())setSnapshot(value);})
      .catch(reason=>{if(live && readCurrent())setError(reason instanceof Error?reason.message:String(reason));})
      .finally(()=>{if(live && readCurrent())pending.current=false;});
    return()=>{live=false;};
  },[chatId,imageId,retry,readCurrent]);
  if(snapshot)return <ImagePreview snapshot={snapshot} onClose={onClose} closeControl={closeControl} current={readCurrent}/>;
  return <ViewerFrame label="Image snapshot" title="Image reference" onClose={onClose} closeControl={closeControl} closeLabel="Close image preview">
    {error?<p role="alert">{error} <ConversationImageAction command="retry-conversation-image-preview" current={()=>readCurrent() && !!error && !pending.current} className="btn sm" invoke={()=>{pending.current=true;setRetry(value=>value+1);}}>Retry</ConversationImageAction></p>:<output className="hint" data-block>Loading image…</output>}
  </ViewerFrame>;
}
