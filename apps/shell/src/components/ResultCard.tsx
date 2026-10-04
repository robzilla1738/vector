import { smallGhostButtonProps } from "../ui/button-props";
import { useMemo } from "react";
import type { ConversationArtifact } from "@aux/contracts";
import { csvPreview } from "../csv-preview";
import { AnswerPreview } from "./surfaces";
import { shellIconOpen, shellIconResult } from "./icons";
import "./ResultCard.css";
import {
  nativeAriaHiddenProps as auxNativeAriaHiddenProps,
} from "../ui/native-attribute-props";

/** Render only the recorded excerpt, without loading or executing the full artifact. */
export function ResultExcerpt({result}:{result:ConversationArtifact}) {
  const rows=useMemo(()=>{
    if(result.mediaType!=="text/csv")return null;
    // Stored excerpts may end inside a quoted cell; preserve the literal preview then.
    try { const rows=csvPreview(result.excerpt).rows.slice(0,4).map(row=>row.slice(0,3));return rows.length?rows:null; }
    catch { return null; }
  },[result.mediaType,result.excerpt]);
  return <div className="result-card-preview" inert {...auxNativeAriaHiddenProps}>{rows ? <table><tbody>{rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table> : result.mediaType==="text/markdown" ? <AnswerPreview text={result.excerpt}/> : result.mediaType==="text/html" ? <div className="result-card-html">{shellIconResult}<span>Interactive document</span></div> : <pre>{result.excerpt || "No text preview"}</pre>}</div>;
}

export function ResultCard({result, revision, compact = false, onOpen}: {result:ConversationArtifact; revision?:number; compact?:boolean; onOpen():void}) {
  const kind=result.mediaType==="text/csv"?"Table":result.mediaType==="application/json"?"Data":result.mediaType==="text/html"?"HTML": "Document";
  // The caller supplies verified automatic-report provenance. Filename alone
  // cannot decide whether an artifact is a redundant answer or a deliverable.
  if (compact) return <article className="result-card result-card-compact">
    <details className="result-card-disclosure"><summary><span>Saved answer</span><span className="result-card-version">v{revision ?? result.revision ?? 1}</span></summary><ResultExcerpt result={result}/></details>
    <button className="btn sm ghost result-card-open" onClick={onOpen} title={result.filename} aria-label={`Open ${result.filename}`}>Open {shellIconOpen}</button>
  </article>;
  return <article className="result-card">
    <header><span {...auxNativeAriaHiddenProps}>{shellIconResult}</span><button onClick={onOpen} title={result.filename}>{result.filename}</button><span className="result-card-version">v{revision ?? result.revision ?? 1}</span></header>
    <ResultExcerpt result={result}/>
    <footer><span>{kind} · {Math.max(1,Math.ceil(result.byteLength/1024))} KB</span><button {...smallGhostButtonProps} onClick={onOpen} aria-label={`Open ${result.filename}`}>Open {shellIconOpen}</button></footer>
  </article>;
}
