import { useCallback, useEffect, useRef, useState } from "react";
import { bridge } from "../bridge";
import { useStore } from "../store";


export function PageZoom({ pageId, documentEpoch }: { pageId: string; documentEpoch?: number }) {
  const level = useStore(state => state.zoomLevels[pageId]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const percentage = level === undefined ? null : Math.round(100 * 1.2 ** level);
  const pending=useRef(false);
  const request=useRef(0);
  const key=`${pageId}:${documentEpoch}`;
  const currentKey=useRef(key);currentKey.current=key;
  const read=useCallback(async()=>{
    if(pending.current||!currentKey.current)return;
    const version=++request.current;
    setError("");
    try{await useStore.getState().zoomPage(pageId);}
    catch(reason){if(version===request.current)setError(reason instanceof Error?reason.message:String(reason));}
  },[pageId,documentEpoch]);
  useEffect(()=>{
    currentKey.current=key;
    void read();
    const off=bridge.onSiteZoomChanged(()=>void read());
    return()=>{++request.current;currentKey.current="";off();};
  },[read,key]);
  async function change(direction: "in" | "out" | "reset") {
    if(pending.current)return;
    pending.current=true;++request.current;
    const origin=key;
    setBusy(true);setError("");
    try{await useStore.getState().zoomPage(pageId,direction==="reset"?{reset:true}:{direction});}
    catch(reason){if(currentKey.current===origin)setError(reason instanceof Error?reason.message:String(reason));}
    finally{pending.current=false;setBusy(false);if(currentKey.current&&currentKey.current!==origin)void read();}
  }
  return <section className="site-controls-group" aria-label="Page zoom">
    <div><div><strong>Page zoom</strong><span>{bridge.privateMode ? "Remembered for this private session" : "Remembered for this website"}</span></div>
      <button className="btn sm" aria-label="Zoom out" disabled={busy || percentage === null || percentage <= 25} onClick={() => void change("out")}>−</button>
      <output className="page-zoom-value" aria-live="polite">{percentage === null ? "…" : `${percentage}%`}</output>
      <button className="btn sm" aria-label="Zoom in" disabled={busy || percentage === null || percentage >= 500} onClick={() => void change("in")}>+</button>
      <button className="btn sm" disabled={busy || percentage === 100} onClick={() => void change("reset")}>Reset</button>
    </div>
    {error && <p className="site-controls-error" role="alert">{error} <button className="btn sm" disabled={busy} onClick={()=>void read()}>Refresh zoom</button></p>}
  </section>;
}
