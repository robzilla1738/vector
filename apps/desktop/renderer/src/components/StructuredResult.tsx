import { useMemo, useState } from "react";
import { csvPreview } from "../csv-preview";

export function StructuredResult({content,mediaType}: {content:string;mediaType:string}) {
  const [raw,setRaw]=useState(false);
  const parsed=useMemo(()=>{
    try {
      if(mediaType==="text/csv")return {csv:csvPreview(content)};
      if(mediaType==="application/json")return {json:JSON.stringify(JSON.parse(content),null,2)};
      return {};
    } catch { return {error:true}; }
  },[content,mediaType]);
  const structured=!!parsed.csv||parsed.json!==undefined;
  return <>
    {structured && <div className="structured-result-tools"><button className="btn sm ghost" aria-pressed={raw} onClick={()=>setRaw(value=>!value)}>{raw?"Show formatted":"Show source"}</button>{parsed.csv&&<span className="hint">{parsed.csv.rowCount.toLocaleString()} rows · {parsed.csv.columnCount} columns{parsed.csv.rowCount>201||parsed.csv.columnCount>40?" · Preview limited to 201 rows and 40 columns":""}</span>}</div>}
    {parsed.error&&<p className="hint">This file could not be formatted. Showing the saved source.</p>}
    {!raw&&parsed.csv&&parsed.csv.rows.length?<div className="structured-result-table" tabIndex={0} aria-label="Saved CSV table"><table><tbody>{parsed.csv.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>:<pre>{!raw&&parsed.json!==undefined?parsed.json:content||"Empty result"}</pre>}
  </>;
}
