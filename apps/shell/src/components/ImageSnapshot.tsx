import { useEffect, useState, type ReactNode } from "react";
import type { ConversationImage } from "@aux/contracts";
import { call } from "../store";
import { ViewerFrame } from "./ViewerFrame";
import { ImageViewer } from "./ImageViewer";

export type SavedImageSnapshot = {image:ConversationImage;dataUrl:string};
export function ImagePreview({snapshot,onClose,closeControl}:{snapshot:SavedImageSnapshot;onClose():void;closeControl?:ReactNode}) {
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[snapshot.dataUrl]);
  return <ViewerFrame label="Image snapshot" title={snapshot.image.filename} onClose={onClose} closeControl={closeControl} closeLabel="Close image preview" metadata={`${snapshot.image.width} × ${snapshot.image.height} · ${snapshot.image.included ? "Included in new replies" : "Excluded from new replies"}`}>
    {failed ? <p role="alert">This saved image could not be displayed.</p> : <ImageViewer src={snapshot.dataUrl} alt={snapshot.image.filename} onError={()=>setFailed(true)}/>}
    <details className="image-viewer-metadata"><summary>Image details</summary><p>Saved {new Date(snapshot.image.createdAt).toLocaleString()}</p>
    {snapshot.image.sourcePage && <p>Captured from {snapshot.image.sourcePage.url} at {new Date(snapshot.image.sourcePage.selectedAt ?? snapshot.image.createdAt).toLocaleString()}. This image remains a snapshot if the tab changes.</p>}</details>
  </ViewerFrame>;
}

/** Read only the selected conversation-owned image; previews never send a model request. */
export function ImageSnapshot({chatId,imageId,onClose}:{chatId:string;imageId:string;onClose():void}) {
  const [snapshot,setSnapshot]=useState<SavedImageSnapshot|null>(null);
  const [error,setError]=useState("");
  const [retry,setRetry]=useState(0);
  useEffect(()=>{
    let live=true;setSnapshot(null);setError("");
    void call("conversations.images.read",{chatId,imageId})
      .then(value=>{if(live)setSnapshot(value);})
      .catch(reason=>{if(live)setError(reason instanceof Error?reason.message:String(reason));});
    return()=>{live=false;};
  },[chatId,imageId,retry]);
  if(snapshot)return <ImagePreview snapshot={snapshot} onClose={onClose}/>;
  return <ViewerFrame label="Image snapshot" title="Image reference" onClose={onClose} closeLabel="Close image preview">
    {error?<p role="alert">{error} <button className="btn sm" onClick={()=>setRetry(value=>value+1)}>Retry</button></p>:<output className="hint" data-block>Loading image…</output>}
  </ViewerFrame>;
}
