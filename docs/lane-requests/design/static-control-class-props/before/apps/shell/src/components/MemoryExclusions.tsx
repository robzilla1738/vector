import { staticHintProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { WorkspaceMemory } from "@aux/contracts";
import { memoryOrigin } from "@aux/contracts/memory-context";
import { bridge } from "../bridge";
import { call, useStore } from "../store";
import { guardCommandCompletion } from "../command-completion";
import { MemoryExclusionButton, useMemoryExclusionControl } from "./MemoryExclusionControls";
type Owner={active:boolean;identity:object;pending:boolean};
function ownerKey(layout:ReturnType<typeof useStore.getState>["layout"],workspaceId:string){const matches=[...layout.spaces,...(layout.archivedSpaces??[])].filter(space=>space.workspaceId===workspaceId);return matches.length===1&&typeof matches[0]?.id==="string"&&matches[0].id?matches[0].id:null;}
export function MemoryExclusions({ memory, disabled, onSaved }: { memory: WorkspaceMemory; disabled: boolean; onSaved(memory: WorkspaceMemory): void }) {
  const snapshot=JSON.stringify(memory),privateMode=bridge.privateMode;
  const space=useStore(state=>ownerKey(state.layout,memory.workspaceId));
  const identity=useMemo(()=>({snapshot,disabled,privateMode,space}),[snapshot,disabled,privateMode,space]);
  const lifetime=useRef<Owner>({active:false,identity,pending:false});
  useLayoutEffect(()=>{const owner={active:true,identity,pending:false};lifetime.current=owner;return()=>{owner.active=false;};},[identity]);
  const [address,setAddress]=useState("");
  const [busyOwner,setBusyOwner]=useState<Owner|null>(null);
  const busy=!!busyOwner&&busyOwner.active&&busyOwner.identity===identity;
  const [failure,setFailure]=useState<{identity:object;message:string;stale:boolean}|null>(null);
  const error=failure?.identity===identity?failure.message:"",stale=failure?.identity===identity&&failure.stale;
  const origins=memory.excludedOrigins??[],scopeId=`${bridge.windowId}:${memory.workspaceId}:${space??"unowned"}`;
  const blocked=disabled||privateMode||!space;
  const delivering=(owner:Owner)=>owner.active&&owner===lifetime.current&&owner.identity===identity&&!bridge.privateMode&&!disabled&&!!space&&ownerKey(useStore.getState().layout,memory.workspaceId)===space&&JSON.stringify(memory)===snapshot;
  function current(){const owner=lifetime.current;if(!delivering(owner))throw new Error("The exclusion Space changed. Choose its current control.");return owner;}
  function update(next?:string[]){
    const owner=current();if(owner.pending)throw new Error("Exclusions are still updating.");
    const originalAddress=address;
    owner.pending=true;setBusyOwner(owner);setFailure(null);
    const completion=(async()=>{try{
      const saved=next?await call("workspaces.memory.set",{workspaceId:memory.workspaceId,expectedRevision:memory.revision,content:memory.content,excludedOrigins:next}):await call("workspaces.memory.get",{workspaceId:memory.workspaceId});
      if(saved.workspaceId!==memory.workspaceId||saved.revision<memory.revision||(next&&saved.revision<=memory.revision))throw new Error("The exclusion reply changed Space or revision.");
      if(!delivering(owner))return saved;
      if(next)setAddress(value=>value===originalAddress?"":value);
      onSaved(saved);return saved;
    }catch(reason){if(delivering(owner))setFailure({identity,message:errorMessage(reason),stale:true});throw reason;}
    finally{owner.pending=false;setBusyOwner(value=>value===owner?null:value);}})();
    return guardCommandCompletion(completion,()=>delivering(owner));
  }
  function save(next:string[]){current();if(next.length>100)throw new Error("A Space can exclude at most 100 sites.");return update(next);}
  const [summaryRef,toggle]=useMemoryExclusionControl("toggle-memory-exclusions",scopeId,element=>{current();const details=element.parentElement;if(!(details instanceof HTMLDetailsElement))throw new Error("Choose the original exclusions disclosure.");details.open=!details.open;});
  const [formRef,exclude]=useMemoryExclusionControl("exclude-memory-site",scopeId,()=>{
    current();if(lifetime.current.pending)throw new Error("Exclusions are still updating.");
    try{const origin=memoryOrigin(address);if(origins.includes(origin)){setFailure({identity,message:"This site is already excluded.",stale:false});return;}if(origins.length>=100)throw new Error("A Space can exclude at most 100 sites.");return save([...origins,origin]);}
    catch(reason){setFailure({identity,message:reason instanceof Error&&reason.message.includes("100 sites")?reason.message:"Enter a full web address, such as https://example.com.",stale:false});}
  });
  return <details className="memory-exclusions"><summary ref={summaryRef} onClick={event=>{event.preventDefault();toggle(event);}}>Excluded sites{origins.length > 0 ? ` · ${origins.length}` : ""}</summary>
    <p {...staticHintProps}>Notes sourced from these addresses stay saved and searchable, but are excluded from new replies in this Space. This does not restrict browsing or explicitly attached pages.</p>
    <p {...staticHintProps}>Each entry covers the exact site address shown, including its protocol and port. Subdomains are separate. Notes without a source and your Space overview are unaffected.</p>
    <form className="memory-exclusion-form" ref={formRef} onSubmit={event=>{event.preventDefault();exclude(event);}}><input type="url" aria-label="Site to exclude from memory" placeholder="https://example.com" value={address} maxLength={2048} disabled={blocked || busy} onChange={event => setAddress(event.target.value)}/><button {...smallButtonProps} disabled={blocked || busy || !address.trim() || origins.length >= 100}>Exclude site</button></form>
    {origins.map(origin => <div className="memory-excluded-site" key={origin}><span>{origin}</span><MemoryExclusionButton command="allow-memory-site" scopeId={scopeId} invoke={()=>save(origins.filter(value => value !== origin))} {...smallGhostButtonProps} disabled={blocked || busy} aria-label={`Allow memory from ${origin}`}>Allow</MemoryExclusionButton></div>)}
    {busy && <output {...staticHintProps} data-block>Updating exclusions…</output>}
    {error && <p className="field-error" role="alert">{error}{stale && <MemoryExclusionButton command="reload-memory-exclusions" scopeId={scopeId} invoke={()=>update()} {...smallGhostButtonProps} disabled={blocked || busy}>Reload saved memory</MemoryExclusionButton>}</p>}
  </details>;
}
