import { smallGhostButtonProps } from "../ui/button-props";
import { useEffect, useState } from "react";
import { ConversationImageAction } from "./ConversationImageControl";
import { useConversationOwner } from "./ConversationControls";
import { useStore } from "../store";
import "./ImageViewer.css";
import { nativePoliteLiveProps } from "../ui/native-attribute-props";

/** Local image inspection only; zooming never reads a page or sends model context. */
export function ImageViewer({src, alt, onError,current}: {src:string;alt:string;onError?():void;current?():boolean}) {
  const owner=useConversationOwner(src,useStore(state=>state.connected));
  const live=()=>owner() && (!current || current());
  const [zoom,setZoom]=useState<number|null>(null);
  const [width,setWidth]=useState(0);
  useEffect(()=>{setZoom(null);setWidth(0);},[src]);
  return <div className="image-viewer">
    <div className="image-viewer-tools" role="group" aria-label="Image zoom">
      <ConversationImageAction {...smallGhostButtonProps} aria-pressed={zoom===null} command="fit-conversation-image" current={live} invoke={()=>setZoom(null)}>Fit</ConversationImageAction>
      <ConversationImageAction {...smallGhostButtonProps} aria-pressed={zoom===1} command="show-conversation-image-actual-size" current={live} invoke={()=>setZoom(1)}>100%</ConversationImageAction>
      <ConversationImageAction {...smallGhostButtonProps} aria-label="Zoom image out" disabled={zoom!==null && zoom<=0.25} command="zoom-conversation-image-out" current={live} invoke={()=>setZoom(value=>Math.max(0.25,(value??1)-0.25))}>−</ConversationImageAction>
      <output {...nativePoliteLiveProps}>{zoom===null?"Fit":`${Math.round(zoom*100)}%`}</output>
      <ConversationImageAction {...smallGhostButtonProps} aria-label="Zoom image in" disabled={zoom!==null && zoom>=4} command="zoom-conversation-image-in" current={live} invoke={()=>setZoom(value=>Math.min(4,(value??1)+0.25))}>+</ConversationImageAction>
    </div>
    <section className={`image-viewer-canvas ${zoom===null?"fit":"scaled"}`} aria-label={`${alt} image preview`} tabIndex={0}>
      <img src={src} alt={alt} style={zoom!==null && width ? {width:width*zoom} : undefined} onLoad={event=>setWidth(event.currentTarget.naturalWidth)} onError={onError}/>
    </section>
  </div>;
}
