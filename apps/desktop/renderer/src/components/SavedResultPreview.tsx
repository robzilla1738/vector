import { readResultDraft, revokeResultDrafts, writeResultDraft } from "../result-drafts";
import { StructuredResult } from "./StructuredResult";
import { useEffect, useRef, useState } from "react";
import { bridge, inElectron } from "../bridge";
import { call, errToast, toast } from "../store";
import { AnswerMarkdown } from "./AnswerMarkdown";
import { I } from "./icons";
import { isolatedHtmlDocument } from "../isolated-html";

type Result = { artifactId: string; chatId: string; filename: string; mediaType: string; content: string; createdAt: number; revision?:number;parentArtifactId?:string };
function IsolatedHtmlResult({html}:{html:string}) {
  const [url,setUrl]=useState<string|null>(null),[error,setError]=useState("");
  useEffect(()=>{
    if(!inElectron)return;
    let live=true,registered:string|undefined;
    setUrl(null);setError("");
    void bridge.createResultPreview(html).then(value=>{
      registered=value;
      if(live)setUrl(value);
      else void bridge.releaseResultPreview(value);
    }).catch(reason=>{if(live)setError(reason instanceof Error?reason.message:String(reason));});
    return()=>{live=false;if(registered)void bridge.releaseResultPreview(registered);};
  },[html]);
  if(error)return <p role="alert" className="field-error">{error}</p>;
  if(!inElectron)return <iframe title="Inert HTML result" sandbox="" referrerPolicy="no-referrer" srcDoc={isolatedHtmlDocument(html)}/>;
  return url?<iframe title="Isolated HTML result" sandbox="allow-scripts" referrerPolicy="no-referrer" src={url}/>:<p role="status" className="hint">Preparing isolated preview…</p>;
}
export function SavedResultPreview({artifactId, chatId, onClose, onVersionSaved, contextDisabled=false, onCitationOpen}: {artifactId:string;chatId:string;onClose():void;onVersionSaved?:(artifactId:string)=>void;contextDisabled?:boolean;onCitationOpen?:(url:string,background:boolean)=>boolean}) {
  const [result,setResult]=useState<Result|null>(null), [error,setError]=useState(""), [retry,setRetry]=useState(0), [saving,setSaving]=useState(false);
  const [draft,setDraft]=useState(()=>readResultDraft(artifactId));
  const [editing,setEditing]=useState(!!draft);
  const [draftError,setDraftError]=useState("");
  const [attaching,setAttaching]=useState(false);
  const [attached,setAttached]=useState<string|null>(null);
  const pending=useRef(false);
  const edit=(content:string)=>{
    if(!result)return;
    const next={chatId,content,source:draft?.source??result.content};
    setDraft(next);setAttached(null);
    setDraftError(writeResultDraft(artifactId,next)?"":"Your edits are kept in this window but could not be saved for restart.");
  };
  const sourceChanged=!!draft&&!!result&&draft.source!==result.content;
  const editedName=result ? `edited-${result.filename}` : "edited-result.txt";
  const content=draft?.content??result?.content??"";
  const valid=!!result && new TextEncoder().encode(content).length<=262144 && !content.includes("\0");
  async function attachCopy(){
    if(!result||!draft||contextDisabled||pending.current||!valid||sourceChanged)return;
    pending.current=true;setAttaching(true);setDraftError("");
    try {
      await call("conversations.attachments.add",{chatId,filename:editedName.slice(0,255),content,sourceArtifactId:artifactId});
      setAttached(content);toast("Edited copy attached to this conversation");
    } catch(reason){setDraftError(reason instanceof Error?reason.message:String(reason));}
    finally{pending.current=false;setAttaching(false);}
  }
  async function saveVersion(){
    if(!result||!draft||contextDisabled||pending.current||!valid||sourceChanged)return;
    pending.current=true;setAttaching(true);setDraftError("");
    try{
      const saved=await call("results.saveVersion",{chatId,sourceArtifactId:artifactId,content});
      if(!writeResultDraft(artifactId,null))toast("Version saved, but the old local draft could not be removed.","error");
      setDraft(null);setAttached(null);
      onVersionSaved?.(saved.artifactId);
      toast(`Saved ${saved.filename} · v${saved.revision}`);
    }catch(reason){setDraftError(reason instanceof Error?reason.message:String(reason));}
    finally{pending.current=false;setAttaching(false);}
  }
  useEffect(()=>{
    let active=true; setResult(null);setError("");
    void call("results.read",{artifactId}).then(value=>{if(!active)return;if(value.chatId!==chatId)throw new Error("This result belongs to another conversation.");setResult(value);}).catch(reason=>{if(active){
      if((reason as {code?:string})?.code==="not_found"){
        if(!revokeResultDrafts([artifactId]))setDraftError("A saved draft could not be removed from this browser.");
        setDraft(null);
      }
      setError(String(reason));
    }});
    return()=>{active=false;};
  },[artifactId,chatId,retry]);
  async function save(excel=false) {
    if(!result||pending.current||!valid)return;pending.current=true;setSaving(true);
    try { if(await (excel?bridge.saveWorkbook(content,"csv"):bridge.saveFile(draft?editedName:result.filename,content)))toast("Result exported"); } catch(reason){errToast(reason);} finally{pending.current=false;setSaving(false);}
  }
  return <section className="document-snapshot saved-result-preview" aria-label="Saved result preview">
    <header><strong>{result?.filename??"Saved result"}</strong><button className="icon-btn xs" aria-label="Close result preview" onClick={onClose}>{I.close}</button></header>
    {error?<p role="alert">{error} <button className="btn sm" onClick={()=>setRetry(value=>value+1)}>Retry</button></p>:!result?<p className="hint" role="status">Loading saved result…</p>:<>
      <div className="saved-result-actions"><span className="hint">Saved {new Date(result.createdAt).toLocaleString()}{result.revision?` · v${result.revision}`:""}</span><button className="btn sm ghost" onClick={()=>void navigator.clipboard.writeText(content).then(()=>toast("Result copied")).catch(errToast)}>Copy</button><button className="btn sm ghost" disabled={attaching||saving} aria-pressed={editing} onClick={()=>setEditing(value=>!value)}>{editing?"Preview":"Edit copy"}</button><button className="btn sm" disabled={saving||attaching||!valid} onClick={()=>void save()}>{saving?"Exporting…":"Export…"}</button>{result.mediaType==="text/csv"&&<button className="btn sm ghost" disabled={saving||attaching||!valid} onClick={()=>void save(true)}>Export Excel…</button>}</div>
      {result.mediaType==="text/csv"&&<p className="hint">Excel export writes cell values. Safe http(s) source URLs become hyperlinks. Formatting, formulas and images are not created.</p>}
      {result.mediaType==="text/html"&&<p className="hint">Interactive preview runs in an isolated origin. Network, files, forms, and Aux access are blocked; generated content may contain unverified text.</p>}
      {draft && <div className="result-edit-status"><span className="hint">Edited copy · original preserved</span><button className="btn sm ghost" disabled={saving||attaching} onClick={()=>{if(!writeResultDraft(artifactId,null)){setDraftError("The saved draft could not be removed. Try Discard edits again.");return;}setDraft(null);setEditing(false);setAttached(null);setDraftError("");}}>Discard edits</button><button className="btn sm" disabled={contextDisabled||saving||attaching||!valid||sourceChanged} onClick={()=>void saveVersion()}>{attaching?"Saving…":"Save version"}</button><button className="btn sm ghost" disabled={contextDisabled||saving||attaching||!valid||sourceChanged||attached===content} onClick={()=>void attachCopy()}>{attached===content?"Copy attached":"Attach as document"}</button></div>}
      {sourceChanged&&<p className="field-error" role="alert">The saved source changed since this draft began. Export your edits or discard them to work from the current source.</p>}
      {draftError&&<p className="field-error" role="alert">{draftError}</p>}
      {!valid&&<p className="field-error" role="alert">Use text without null characters, up to 256 KB.</p>}
      {editing ? <textarea className="result-source-editor" aria-label="Edit result copy" spellCheck={result.mediaType==="text/markdown"||result.mediaType==="text/plain"} maxLength={262144} value={content} disabled={attaching||saving} onChange={event=>edit(event.target.value)}/> : <div className={`saved-result-content ${result.mediaType==="text/html"?"html-result":""}`} tabIndex={0}>{result.mediaType==="text/html"?<IsolatedHtmlResult html={content}/>:result.mediaType==="text/markdown"?<AnswerMarkdown text={content} onOpenLink={onCitationOpen}/>:<StructuredResult key={result.artifactId} content={content} mediaType={result.mediaType}/>}</div>}
    </>}
  </section>;
}
