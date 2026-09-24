import { useEffect, useState } from "react";
import "./ImageViewer.css";

/** Local image inspection only; zooming never reads a page or sends model context. */
export function ImageViewer({src, alt, onError}: {src:string;alt:string;onError?():void}) {
  const [zoom,setZoom]=useState<number|null>(null);
  const [width,setWidth]=useState(0);
  useEffect(()=>{setZoom(null);setWidth(0);},[src]);
  return <div className="image-viewer">
    <div className="image-viewer-tools" role="group" aria-label="Image zoom">
      <button className="btn sm ghost" aria-pressed={zoom===null} onClick={()=>setZoom(null)}>Fit</button>
      <button className="btn sm ghost" aria-pressed={zoom===1} onClick={()=>setZoom(1)}>100%</button>
      <button className="btn sm ghost" aria-label="Zoom image out" disabled={zoom!==null && zoom<=0.25} onClick={()=>setZoom(value=>Math.max(0.25,(value??1)-0.25))}>−</button>
      <output aria-live="polite">{zoom===null?"Fit":`${Math.round(zoom*100)}%`}</output>
      <button className="btn sm ghost" aria-label="Zoom image in" disabled={zoom!==null && zoom>=4} onClick={()=>setZoom(value=>Math.min(4,(value??1)+0.25))}>+</button>
    </div>
    <div className={`image-viewer-canvas ${zoom===null?"fit":"scaled"}`} role="region" aria-label={`${alt} image preview`} tabIndex={0}>
      <img src={src} alt={alt} style={zoom!==null && width ? {width:width*zoom} : undefined} onLoad={event=>setWidth(event.currentTarget.naturalWidth)} onError={onError}/>
    </div>
  </div>;
}
