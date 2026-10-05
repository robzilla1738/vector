import {
  staticFieldErrorProps as auxReserveStaticFieldErrorProps,
} from "../ui/class-props";
import { staticHintProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { readResultDraft, revokeResultDrafts, writeResultDraft } from "../result-drafts";
import { StructuredResult } from "./StructuredResult";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { bridge, inNativeHost } from "../bridge";
import { call, toast, useStore } from "../store";
import { AnswerMarkdown } from "./AnswerMarkdown";
import { guardCommandCompletion } from "../command-completion";
import { useConversationOwner } from "./ConversationControls";
import { useConversationAttachmentOwner } from "./ConversationAttachmentControls";
import { ResultPreviewControl, useResultPreviewCommand } from "./ResultPreviewControls";
import { shellIconClose } from "./icons";
import { ViewerFrame } from "./ViewerFrame";
import { ActionMenu } from "../ui";
import { isolatedHtmlDocument } from "../isolated-html";
import { staticExtraSmallIconButtonProps as auxClassExtraSmallIconButtonProps } from "../ui/deferred-class-props";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

type Result = { artifactId: string; chatId: string; filename: string; mediaType: string; content: string; createdAt: number; revision?:number;parentArtifactId?:string };
function IsolatedHtmlResult({html,current}:{html:string;current():boolean}) {
  const [url,setUrl]=useState<string|null>(null),[error,setError]=useState("");
  useEffect(()=>{
    if(!inNativeHost||!current())return;
    let live=true,registered:string|undefined;
    setUrl(null);setError("");
    void bridge.createResultPreview(html).then(value=>{
      registered=value;
      if(live&&current())setUrl(value);
      else void bridge.releaseResultPreview(value);
    }).catch(reason=>{if(live&&current())setError(errorMessage(reason));});
    return()=>{live=false;if(registered)void bridge.releaseResultPreview(registered);};
  },[html,current]);
  if(error)return <p {...nativeAlertRoleProps} {...auxReserveStaticFieldErrorProps}>{error}</p>;
  if(!inNativeHost)return <iframe title="Inert HTML result" sandbox="" referrerPolicy="no-referrer" srcDoc={isolatedHtmlDocument(html)}/>;
  return url?<iframe title="Isolated HTML result" sandbox="allow-scripts" referrerPolicy="no-referrer" src={url}/>:<output data-block {...staticHintProps}>Preparing isolated preview…</output>;
}
export function SavedResultPreview({artifactId, chatId, onClose, onVersionSaved, contextDisabled=false, onCitationOpen}: {artifactId:string;chatId:string;onClose():void;onVersionSaved?:(artifactId:string)=>void;contextDisabled?:boolean;onCitationOpen?:(url:string,background:boolean)=>boolean}) {
  const [result,setResult]=useState<Result|null>(null), [error,setError]=useState(""), [retry,setRetry]=useState(0), [saving,setSaving]=useState(false);
  const [draft,setDraft]=useState(()=>readResultDraft(artifactId));
  const [editing,setEditing]=useState(!!draft);
  const [draftError,setDraftError]=useState("");
  const [attaching,setAttaching]=useState(false);
  const [attached,setAttached]=useState<string|null>(null);
  const connected=useStore(state=>state.connected);
  const conversationCurrent=useConversationOwner(chatId,connected);
  const reference=useMemo(()=>({artifactId}),[artifactId]);
  const referenceCurrent=useConversationAttachmentOwner(conversationCurrent,[reference]);
  const current=useCallback(()=>referenceCurrent(reference),[reference,referenceCurrent]);
  const published=useRef<{result:Result;current:()=>boolean}|null>(null);
  const loadedOwner=useConversationAttachmentOwner(current,result?[result]:[]);
  const loadedCurrent=useCallback(()=>!!result&&result.chatId===chatId&&result.artifactId===artifactId&&published.current?.result===result&&published.current.current===current&&loadedOwner(result),[result,chatId,artifactId,current,loadedOwner]);
  const draftOwner=useRef(draft);
  useLayoutEffect(()=>{draftOwner.current=draft;},[draft]);
  const pending=useRef<object|null>(null),latestOperation=useRef<object|null>(null),latestCopy=useRef<object|null>(null);
  useLayoutEffect(()=>{pending.current=null;latestOperation.current=null;latestCopy.current=null;setSaving(false);setAttaching(false);return()=>{pending.current=null;latestOperation.current=null;latestCopy.current=null;};},[current]);
  useEffect(()=>{const original=readResultDraft(artifactId);setDraft(original?.chatId===chatId?original:null);setEditing(!!original&&original.chatId===chatId);setAttached(null);setDraftError("");},[artifactId,chatId]);
  const edit=(content:string)=>{
    if(!result||!loadedCurrent()||pending.current)return;
    const next={chatId,content,source:draft?.source??result.content};
    setDraft(next);setAttached(null);
    setDraftError(writeResultDraft(artifactId,next)?"":"Your edits are kept in this window but could not be saved for restart.");
  };
  const sourceChanged=!!draft&&!!result&&draft.source!==result.content;
  const editedName=result ? `edited-${result.filename}` : "edited-result.txt";
  const content=draft?.content??result?.content??"";
  const valid=!!result && new TextEncoder().encode(content).length<=262144 && !content.includes("\0");
  function mutate(version:boolean){
    if(!result||!draft||contextDisabled||pending.current||!valid||sourceChanged||!loadedCurrent())return;
    const originalDraft=draft,token={};pending.current=token;latestOperation.current=token;setAttaching(true);setDraftError("");
    const delivering=()=>loadedCurrent()&&latestOperation.current===token&&draftOwner.current===originalDraft;
    let errorHandled=false;
    const completion=(async()=>{
      try{
        if(version){
          const saved=await call("results.saveVersion",{chatId,sourceArtifactId:artifactId,content});
          if(delivering()){
            if(!writeResultDraft(artifactId,null))toast("Version saved, but the old local draft could not be removed.","error");
            setDraft(null);setAttached(null);onVersionSaved?.(saved.artifactId);toast(`Saved ${saved.filename} · v${saved.revision}`);
          }
          return saved;
        }
        const ack=await call("conversations.attachments.add",{chatId,filename:editedName.slice(0,255),content,sourceArtifactId:artifactId});
        if(delivering()){setAttached(content);toast("Edited copy attached to this conversation");}
        return ack;
      }catch(reason){if(delivering()){setDraftError(errorMessage(reason));errorHandled=true;}throw reason;}
      finally{if(pending.current===token){pending.current=null;if(current())setAttaching(false);}}
    })();
    return guardCommandCompletion(completion,()=>delivering()&&!errorHandled);
  }
  useEffect(()=>{
    let active=true; setResult(null);setError("");
    if(!current())return;
    void call("results.read",{artifactId}).then(value=>{if(!active||!current())return;if(value.chatId!==chatId)throw new Error("This result belongs to another conversation.");published.current={result:value,current};setResult(value);}).catch(reason=>{if(active&&current()){
      if((reason as {code?:string})?.code==="not_found"){
        if(!revokeResultDrafts([artifactId]))setDraftError("A saved draft could not be removed from this browser.");
        setDraft(null);
      }
      setError(String(reason));
    }});
    return()=>{active=false;};
  },[artifactId,chatId,retry,current]);
  function save(excel=false){
    if(!result||pending.current||!valid||!loadedCurrent())return;
    const token={},originalDraft=draft;pending.current=token;latestOperation.current=token;setSaving(true);
    const delivering=()=>loadedCurrent()&&latestOperation.current===token&&draftOwner.current===originalDraft;
    const completion=(async()=>{
      try{const ack=await (excel?bridge.saveWorkbook(content,"csv"):bridge.saveFile(draft?editedName:result.filename,content));if(delivering()&&ack)toast("Result exported");return ack;}
      finally{if(pending.current===token){pending.current=null;if(current())setSaving(false);}}
    })();
    return guardCommandCompletion(completion,delivering);
  }
  function copy(){
    if(!loadedCurrent())return;
    const token={},originalDraft=draft;latestCopy.current=token;
    const delivering=()=>loadedCurrent()&&latestCopy.current===token&&draftOwner.current===originalDraft;
    const completion=(async()=>{const ack=await navigator.clipboard.writeText(content);if(delivering())toast("Result copied");return ack;})();
    return guardCommandCompletion(completion,delivering);
  }
  function discard(){
    if(!loadedCurrent()||pending.current)return;
    if(!writeResultDraft(artifactId,null)){setDraftError("The saved draft could not be removed. Try Discard edits again.");return;}
    setDraft(null);setEditing(false);setAttached(null);setDraftError("");
  }
  const activateExport=useRef<(()=>void)|null>(null);
  const [exportTrigger,runExportTrigger]=useResultPreviewCommand("toggle-saved-result-export",loadedCurrent,()=>activateExport.current?.());
  const [exportFileRef,runExportFile]=useResultPreviewCommand("export-saved-result",loadedCurrent,()=>save());
  const [exportExcelRef,runExportExcel]=useResultPreviewCommand("export-saved-result-excel",loadedCurrent,()=>save(true));
  return <ViewerFrame label="Saved result preview" title={result?.filename ?? "Saved result"} onClose={onClose} closeLabel="Close result preview" closeControl={<ResultPreviewControl command="close-saved-result-preview" current={current} invoke={onClose} {...auxClassExtraSmallIconButtonProps} aria-label="Close result preview">{shellIconClose}</ResultPreviewControl>}
    metadata={result && <>v{result.revision ?? 1} · {result.mediaType} · {new Date(result.createdAt).toLocaleString()}</>}
    toolbar={result && <><ResultPreviewControl command="toggle-saved-result-source" current={loadedCurrent} invoke={()=>setEditing(value=>!value)} {...smallGhostButtonProps} disabled={attaching||saving} aria-pressed={editing}>{editing?"Preview":"Edit copy"}</ResultPreviewControl><ResultPreviewControl command="copy-saved-result" current={loadedCurrent} invoke={copy} {...smallGhostButtonProps}>Copy</ResultPreviewControl><ActionMenu label="Export result" triggerControl={(node,activate)=>{exportTrigger(node);activateExport.current=node?activate:null;}} onTrigger={runExportTrigger} actions={[
      {label:"Export file…",disabled:saving||attaching||!valid,controlRef:exportFileRef,onSelect:event=>{if(event)runExportFile(event);}},
      ...(result.mediaType === "text/csv" ? [{label:"Export Excel…",disabled:saving||attaching||!valid,controlRef:exportExcelRef,onSelect:(event?:React.MouseEvent<HTMLButtonElement>)=>{if(event)runExportExcel(event);}}] : []),
    ]}>{saving ? "Exporting…" : "Export…"}</ActionMenu></>}>
    {error?<p {...nativeAlertRoleProps}>{error} <ResultPreviewControl command="retry-saved-result-read" current={current} invoke={()=>setRetry(value=>value+1)} {...smallButtonProps}>Retry</ResultPreviewControl></p>:!result?<output {...staticHintProps} data-block>Loading saved result…</output>:<>
      {result.mediaType==="text/csv"&&<p {...staticHintProps}>Excel export writes cell values. Safe http(s) source URLs become hyperlinks. Formatting, formulas and images are not created.</p>}
      {result.mediaType==="text/html"&&<p {...staticHintProps}>Interactive preview runs in an isolated origin. Network, files, forms, and Aux access are blocked; generated content may contain unverified text.</p>}
      {draft && <div className="result-edit-status"><span {...staticHintProps}>Edited copy · original preserved</span><ResultPreviewControl command="discard-saved-result-edits" current={loadedCurrent} invoke={discard} {...smallGhostButtonProps} disabled={saving||attaching}>Discard edits</ResultPreviewControl><ResultPreviewControl command="save-saved-result-version" report={false} current={loadedCurrent} invoke={()=>mutate(true)} {...smallButtonProps} disabled={contextDisabled||saving||attaching||!valid||sourceChanged}>{attaching?"Saving…":"Save version"}</ResultPreviewControl><ResultPreviewControl command="attach-saved-result-copy" report={false} current={loadedCurrent} invoke={()=>mutate(false)} {...smallGhostButtonProps} disabled={contextDisabled||saving||attaching||!valid||sourceChanged||attached===content}>{attached===content?"Copy attached":"Attach as document"}</ResultPreviewControl></div>}
      {sourceChanged&&<p {...auxReserveStaticFieldErrorProps} {...nativeAlertRoleProps}>The saved source changed since this draft began. Export your edits or discard them to work from the current source.</p>}
      {draftError&&<p {...auxReserveStaticFieldErrorProps} {...nativeAlertRoleProps}>{draftError}</p>}
      {!valid&&<p {...auxReserveStaticFieldErrorProps} {...nativeAlertRoleProps}>Use text without null characters, up to 256 KB.</p>}
      {editing ? <textarea className="result-source-editor" aria-label="Edit result copy" spellCheck={result.mediaType==="text/markdown"||result.mediaType==="text/plain"} maxLength={262144} value={content} disabled={attaching||saving} onChange={event=>edit(event.target.value)}/> : <div className={`saved-result-content ${result.mediaType==="text/html"?"html-result":""}`} tabIndex={0}>{result.mediaType==="text/html"?<IsolatedHtmlResult html={content} current={loadedCurrent}/>:result.mediaType==="text/markdown"?<AnswerMarkdown text={content} onOpenLink={(url,background)=>loadedCurrent()?(onCitationOpen?.(url,background)??false):true}/>:<StructuredResult key={result.artifactId} content={content} mediaType={result.mediaType} current={loadedCurrent}/>}</div>}
    </>}
  </ViewerFrame>;
}
