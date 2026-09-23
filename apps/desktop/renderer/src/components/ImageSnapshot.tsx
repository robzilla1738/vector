import { useEffect, useState } from "react";
import type { ConversationImage } from "@aux/contracts";
import { call } from "../store";
import { I } from "./icons";

export type SavedImageSnapshot = {image:ConversationImage;dataUrl:string};
export function ImagePreview({snapshot,onClose}:{snapshot:SavedImageSnapshot;onClose():void}) {
  return <section className="document-snapshot capture-preview" aria-label="Image snapshot">
    <header><strong>{snapshot.image.filename}</strong><button className="icon-btn xs" aria-label="Close image preview" onClick={onClose}>{I.close}</button></header>
    <p className="hint">{snapshot.image.width} × {snapshot.image.height} · Saved {new Date(snapshot.image.createdAt).toLocaleString()} · {snapshot.image.included ? "Included in new replies" : "Excluded from new replies"}</p>
    <img src={snapshot.dataUrl} alt={snapshot.image.filename}/>
  </section>;
}

/** Read only the selected conversation-owned image; previews never send a model request. */
export function ImageSnapshot({chatId,imageId,onClose}:{chatId:string;imageId:string;onClose():void}) {
  const [snapshot,setSnapshot]=useState<SavedImageSnapshot|null>(null);
  const [error,setError]=useState("");
  const [retry,setRetry]=useState(0);
  useEffect(()=>{
    let live=true;setSnapshot(null);setError("");
    void call<SavedImageSnapshot>("conversations.images.read",{chatId,imageId})
      .then(value=>{if(live)setSnapshot(value);})
      .catch(reason=>{if(live)setError(reason instanceof Error?reason.message:String(reason));});
    return()=>{live=false;};
  },[chatId,imageId,retry]);
  if(snapshot)return <ImagePreview snapshot={snapshot} onClose={onClose}/>;
  return <section className="document-snapshot" aria-label="Image snapshot">
    <header><strong>Image reference</strong><button className="icon-btn xs" aria-label="Close image preview" onClick={onClose}>{I.close}</button></header>
    {error?<p role="alert">{error} <button className="btn sm" onClick={()=>setRetry(value=>value+1)}>Retry</button></p>:<p className="hint" role="status">Loading image…</p>}
  </section>;
}
