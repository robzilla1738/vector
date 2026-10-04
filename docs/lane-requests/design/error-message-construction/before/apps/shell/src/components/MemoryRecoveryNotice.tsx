import { memoryControlElement, useMemoryElementControl } from "./memory-control-construction";
import { useEffect, useLayoutEffect, useMemo, useState, useId, type ReactNode } from "react";
import type { ShellCommandId } from "@aux/contracts";
import { bridge } from "../bridge";
import { call, useStore } from "../store";


import { guardCommandCompletion } from "../command-completion";

class RecoveryOwner {
  #active = true;
  #request = 0;
  #pending: object | null = null;
  constructor(readonly identity: string) {}
  current() { return this.#active && !bridge.privateMode; }
  retire() { this.#active = false; }
  request() { return ++this.#request; }
  currentRequest(request: number) { return this.current() && this.#request === request; }
  begin() { if (this.#pending) return null; const operation = {}; this.#pending = operation; this.request(); return operation; }
  finish(operation: object) { if (this.#pending !== operation) return false; this.#pending = null; return true; }
}
function RecoveryControl({command,scopeId,owner,action,report,children,disabled,className}:{
  command:ShellCommandId;scopeId:string;owner:RecoveryOwner;action():unknown;report(reason:unknown):void;
  children:ReactNode;disabled?:boolean;className:string;
}) {
  const [ref, run] = useMemoryElementControl(command, scopeId, () => {
    if (!owner.current()) throw new Error("The original recovery controls changed.");
    return action();
  }, report);
  return memoryControlElement("button", { type: "button", ref, "data-command-id": command, className, disabled, onClick: run }, children);
}
/** Displayed after a user action invalidates older Aux-managed backups. */
export function MemoryRecoveryNotice({ possible = false }: { possible?: boolean }) {
  const scopeId=useId(), identity=String(JSON.stringify([scopeId,possible,bridge.privateMode]));
  const owner=useMemo(()=>new RecoveryOwner(identity),[identity]);
  const [pending,setPending]=useState<{owner:RecoveryOwner;operation:object}|null>(null);
  const [notice,setNotice]=useState<{owner:RecoveryOwner;message:string;readbackFailure?:unknown}|null>(null);
  const [status,setStatus]=useState<{owner:RecoveryOwner;issued:boolean}|null>(null);
  const busy=pending?.owner===owner, message=notice?.owner===owner?notice.message:"", issued=status?.owner===owner&&status.issued;
  useLayoutEffect(()=>()=>owner.retire(),[owner]);
  useEffect(()=>{
    if(!owner.current())return;
    const refresh=()=>{
      const request=owner.request();
      void call("installation.restoreStatus",{}).then(result=>{
        if(owner.currentRequest(request))setStatus({owner,issued:result.managedRecovery.freshBackupIssued});
      }).catch(()=>{if(owner.currentRequest(request))setStatus({owner,issued:false});});
    };
    refresh();const timer=window.setInterval(refresh,5000);return()=>window.clearInterval(timer);
  },[owner]);
  function report(error:unknown){if(owner.current())setNotice({owner,message:error instanceof Error?error.message:String(error)});}
  function backup(){
    if(!owner.current())throw new Error("Choose the original recovery notice outside Private browsing.");
    const operation=owner.begin();if(!operation)return;
    setPending({owner,operation});setNotice({owner,message:""});
    return guardCommandCompletion((async()=>{
      try{
        const result=await bridge.exportRuntimeBackup();
        if(!owner.current())return result;
        if(result){
          const request=owner.request();
          try {
            const fresh=await call("installation.restoreStatus",{});
            if(owner.currentRequest(request))setStatus({owner,issued:fresh.managedRecovery.freshBackupIssued});
          } catch(readbackFailure) {
            if(owner.currentRequest(request))setNotice({owner,readbackFailure,message:"Backup was saved, but a fresh backup has not been confirmed. Check recovery status before retrying."});
          }
        }else setNotice({owner,message:"Backup cancelled; create one when ready."});
        return result;
      }finally{if(owner.finish(operation)&&owner.current())setPending(current=>current?.operation===operation?null:current);}
    })(),()=>owner.current());
  }
  function offline(){
    if(!owner.current())throw new Error("Choose the original recovery notice outside Private browsing.");
    useStore.setState({settingsCategory:"General"});useStore.getState().setOverlay("settings");
  }
  if(bridge.privateMode)return <p>Memory recovery is unavailable in private browsing.</p>;
  const controls={scopeId,owner,report};
  if(issued)return <div className="field">
    <output className="hint">Fresh Aux-managed task-data backup issued after Forget. Protected Space and page memory need a new encrypted offline package.</output>
    <p className="hint">Previously copied offline recovery packages and their original phrases remain usable after Forget. Copies and phrases outside Aux cannot be revoked.</p>
    <RecoveryControl {...controls} command="open-memory-offline-recovery" className="btn sm ghost" action={offline}>Create a fresh encrypted offline package…</RecoveryControl>
  </div>;
  return <div className="field">
    <p>{possible?"If this change removed saved Memory, older Aux-managed backups can no longer restore.":"Older Aux-managed backups can no longer restore after this Memory removal."} A fresh backup has not been confirmed; create one for the current state.</p>
    <p className="hint">Previously copied offline recovery packages and their original phrases remain usable after Forget. Copies and phrases outside Aux cannot be revoked.</p>
    <RecoveryControl {...controls} command="create-memory-local-backup" className="btn sm" disabled={busy} action={backup}>Create fresh local backup…</RecoveryControl>
    <RecoveryControl {...controls} command="open-memory-offline-recovery" className="btn sm ghost" action={offline}>Create a fresh encrypted offline package…</RecoveryControl>
    {message&&<output className="hint">{message}</output>}
  </div>;
}
