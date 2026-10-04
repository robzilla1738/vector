import { smallGhostButtonProps } from "../ui/button-props";
import { useEffect, useMemo, useRef, useState } from "react";
import "./ViewerFrame.css";
import { csvPreview } from "../csv-preview";

export function StructuredResult({content,mediaType}: {content:string;mediaType:string}) {
  const [raw,setRaw]=useState(false);
  const [selected,setSelected]=useState<number|null>(null);
  const rows=useRef(new Map<number, HTMLTableRowElement>());
  useEffect(()=>{setSelected(null);setRaw(false);},[content,mediaType]);
  const parsed=useMemo(()=>{
    try {
      if(mediaType==="text/csv")return {csv:csvPreview(content)};
      if(mediaType==="application/json")return {json:JSON.stringify(JSON.parse(content),null,2)};
      return {};
    } catch { return {error:true}; }
  },[content,mediaType]);
  const structured=!!parsed.csv||parsed.json!==undefined;
  return <>
    {structured && <div className="structured-result-tools"><button {...smallGhostButtonProps} aria-pressed={raw} onClick={()=>setRaw(value=>!value)}>{raw?"Show formatted":"Show source"}</button>{parsed.csv&&<span className="hint">{parsed.csv.rowCount.toLocaleString()} rows · {parsed.csv.columnCount} columns{parsed.csv.rowCount>201||parsed.csv.columnCount>40?" · Preview limited to 201 rows and 40 columns":""}</span>}</div>}
    {parsed.error&&<p className="hint">This file could not be formatted. Showing the saved source.</p>}
    {!raw&&parsed.csv&&parsed.csv.rows.length?<div role="group" className="structured-result-table" aria-label="Saved CSV table"><table><thead><tr>{Array.from({length:Math.min(parsed.csv.columnCount,40)},(_,i)=><th key={i} scope="col">Column {i+1}</th>)}</tr></thead><tbody>{parsed.csv.rows.map((row,i)=><tr key={i} ref={node=>{if(node)rows.current.set(i,node);else rows.current.delete(i);}} tabIndex={selected===i || selected===null&&i===0 ? 0 : -1} aria-selected={selected===i} aria-label={`Row ${i+1}`} onClick={()=>setSelected(i)} onKeyDown={event=>{
      if(event.key==="Enter"||event.key===" "){event.preventDefault();setSelected(i);}
      if(["ArrowDown","ArrowUp","Home","End"].includes(event.key)){
        event.preventDefault(); const last=parsed.csv!.rows.length-1;
        const next=event.key==="Home"?0:event.key==="End"?last:Math.max(0,Math.min(last,i+(event.key==="ArrowDown"?1:-1)));
        setSelected(next);rows.current.get(next)?.focus();
      }
    }}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>:<pre>{!raw&&parsed.json!==undefined?parsed.json:content||"Empty result"}</pre>}
    {!raw && parsed.csv && selected!==null && parsed.csv.rows[selected] && <section className="result-row-detail" aria-label={`Row ${selected+1} details`}><header><strong>Row {selected+1}</strong><button {...smallGhostButtonProps} onClick={()=>{rows.current.get(selected)?.focus();setSelected(null);}}>Close details</button></header><div className="result-fields">{parsed.csv.rows[selected].map((cell,i)=><div key={i} style={{display:"contents"}}><span className="meta-k">Column {i+1}</span><span className="meta-v">{cell||"Empty"}</span></div>)}</div></section>}
  </>;
}
