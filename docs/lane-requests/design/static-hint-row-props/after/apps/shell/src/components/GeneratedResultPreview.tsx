import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useEffect, useState } from "react";
import { GenerateResultParamsSchema, type GeneratedResult, type GeneratedResultSummary } from "@aux/contracts";
import { bridge } from "../bridge";
import { call, errToast, toast } from "../store";
import { ViewerFrame } from "./ViewerFrame";

/** Office files render a bounded, inert summary. Only verified PNG bytes are embedded as an image. */
export function GeneratedResultPreview({artifactId,chatId,onClose,onVersionSaved,contextDisabled=false}:{artifactId:string;chatId:string;onClose():void;onVersionSaved?:(artifactId:string)=>void;contextDisabled?:boolean}) {
  const [result,setResult]=useState<GeneratedResult|null>(null);
  const [versions,setVersions]=useState<GeneratedResultSummary[]>([]);
  const [image,setImage]=useState<string|null>(null);
  const [draft,setDraft]=useState("");
  const [editing,setEditing]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  useEffect(()=>{
    let live=true;
    void Promise.all([call("results.generated.get",{artifactId}),call("results.generated.versions",{artifactId})]).then(([file,history])=>{
      if(!live)return;
      if(file.chatId!==chatId)throw new Error("This result belongs to another conversation.");
      setResult(file);setVersions(history);setDraft(JSON.stringify(file.spec,null,2));
      if(file.kind==="chart")void call("artifacts.read",{artifactId}).then(data=>{
        if(live&&data.artifact.mediaType==="image/png"&&data.artifact.size<=5*1024*1024)setImage(`data:image/png;base64,${data.dataBase64}`);
      }).catch(reason=>{if(live)setError(String(reason));});
    }).catch(reason=>{if(live)setError(String(reason));});
    return()=>{live=false;};
  },[artifactId,chatId]);
  async function revise(){
    if(!result||busy)return;
    setBusy(true);setError("");
    try{
      const parsed=GenerateResultParamsSchema.parse({chatId,sourceArtifactId:result.artifactId,filename:result.filename,spec:JSON.parse(draft)});
      const next=await call("results.generate",parsed);
      toast(`${next.filename} · v${next.revision} saved`);
      onVersionSaved?.(next.artifactId);
    }catch(reason){setError(errorMessage(reason));}
    finally{setBusy(false);}
  }
  async function exportFile(){
    if(!result||busy)return;
    setBusy(true);
    try{if(await bridge.saveStoredArtifact(result.artifactId,result.filename))toast("Result exported");}
    catch(reason){errToast(reason);}
    finally{setBusy(false);}
  }
  return <ViewerFrame label="Generated result preview" title={result?.filename??"Generated result"} onClose={onClose} closeLabel="Close result preview"
    metadata={result&&<>v{result.revision} · {result.kind.toUpperCase()} · {Math.max(1,Math.ceil(result.byteLength/1024))} KB · {new Date(result.createdAt).toLocaleString()}</>}
    toolbar={result&&<><button {...smallGhostButtonProps} disabled={busy||contextDisabled||result.revision>=20} aria-pressed={editing} onClick={()=>setEditing(value=>!value)}>{editing?"Preview":"Revise"}</button><button {...smallGhostButtonProps} disabled={busy} onClick={()=>void exportFile()}>Export file…</button></>}>
    {error&&<p role="alert" className="field-error">{error}</p>}
    {!result?<output data-block {...staticHintProps}>Loading generated result…</output>:<>
      <p {...staticHintProps}>Generated from conversation turn {result.sourceRunId}. SHA-256 {result.sha256.slice(0,16)}…</p>
      {versions.length>1&&<nav {...staticRowProps} aria-label="Result versions">{versions.map(version=><button className="btn sm ghost" key={version.artifactId} disabled={version.artifactId===artifactId} onClick={()=>onVersionSaved?.(version.artifactId)}>v{version.revision}</button>)}</nav>}
      {editing?<><label className="field">Revise structured source<textarea aria-label="Structured result source" className="result-source-editor" value={draft} maxLength={500_000} disabled={busy} onChange={event=>setDraft(event.target.value)}/></label><button {...smallButtonProps} disabled={busy||contextDisabled} onClick={()=>void revise()}>{busy?"Saving…":"Save new version"}</button></>:<div className="saved-result-content">
        <h3>{result.preview.title}</h3>
        {image?<img src={image} alt={result.preview.title} style={{maxWidth:"100%",height:"auto"}}/>:result.kind==="chart"?<output {...staticHintProps}>Loading chart image…</output>:null}
        <ul>{result.preview.lines.map((line,index)=><li key={index}>{line}</li>)}</ul>
      </div>}
    </>}
  </ViewerFrame>;
}
