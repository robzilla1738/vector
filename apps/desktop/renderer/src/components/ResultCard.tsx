import { useMemo } from "react";
import type { ConversationArtifact } from "@aux/contracts";
import { csvPreview } from "../csv-preview";
import { AnswerPreview } from "./surfaces";
import { I } from "./icons";
import "./ResultCard.css";

/** Render only the recorded excerpt. Full content loads when the user opens it. */
export function ResultCard({result, revision, onOpen}: {result:ConversationArtifact; revision?:number; onOpen():void}) {
  const rows=useMemo(()=>result.mediaType==="text/csv" ? csvPreview(result.excerpt).rows.slice(0,4).map(row=>row.slice(0,3)) : null,[result.mediaType,result.excerpt]);
  const kind=result.mediaType==="text/csv"?"Table":result.mediaType==="application/json"?"Data":result.mediaType==="text/html"?"HTML": "Document";
  return <article className="result-card">
    <header><span aria-hidden="true">{I.result}</span><button onClick={onOpen} title={result.filename}>{result.filename}</button><span className="result-card-version">v{revision ?? result.revision ?? 1}</span></header>
    <div className="result-card-preview" inert aria-hidden="true">{rows ? <table><tbody>{rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table> : result.mediaType==="text/markdown" ? <AnswerPreview text={result.excerpt}/> : result.mediaType==="text/html" ? <div className="result-card-html">{I.result}<span>Interactive document</span></div> : <pre>{result.excerpt || "No text preview"}</pre>}</div>
    <footer><span>{kind} · {Math.max(1,Math.ceil(result.byteLength/1024))} KB</span><button className="btn sm ghost" onClick={onOpen} aria-label={`Open ${result.filename}`}>Open {I.open}</button></footer>
  </article>;
}
