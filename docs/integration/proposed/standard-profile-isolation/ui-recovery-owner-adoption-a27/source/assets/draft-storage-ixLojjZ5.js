!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e._posthogReleaseId=e._posthogReleaseId||"01a14421-bd0a-0000-3c62-ba3fbe2b6700";var n=(new e.Error).stack;n&&(e._posthogChunkIds=e._posthogChunkIds||{},e._posthogChunkIds[n]="dc29686c-6219-5808-a0c8-7bc52066a228")}catch(e){}}();import{t as p}from"./debounce-DNQ8gWSd.js";import{O as v,S as E,r as h,u as _}from"./schemas-Z5KNLPhp.js";import{t as P}from"./thinking-levels-DLuCdpvc.js";var l="aux.chat-draft.v3",I="aux.chat-draft-text.v1",D="new",m="aux.chat-pending-new-session-message.v2",R=15e3,C="aux.sidepanel-new-session-settings.v2";function b(e,n){let t=e,auxWriteResult;const r=p(o=>{auxWriteResult=n(o)},250);return{getDraft:()=>t,adoptMemory:o=>{if(!auxDraftMigrationRecoveryApplying())throw Error("A native recovery hold is required");t=o},write:(o,s=!1)=>{t=o,r(t);r.flush();return auxWriteResult},flush:r.flush}}var a=null,auxPendingMessageDirty=!1;function O(e,n){return e??n??D}function f(){return typeof window>"u"?null:window.sessionStorage}function N(){return typeof window>"u"?null:window.localStorage}function y(e){return`${C}:${e}`}function c(e,n=l,t){return`${n}:${O(e,t)}`}function F(e,n){const auxKey=c(e,l,n);if(auxUnsavedDrafts.has(auxKey))return auxUnsavedDrafts.get(auxKey);const t=f(),r=N();if(!t&&!r)return null;try{const o=c(e,l,n),s=c(e,I,n),i=t?.getItem(o)??r?.getItem(o);if(i){const u=JSON.parse(i);if(u.version===2&&typeof u.plainText=="string")return u}const w=t?.getItem(s)??r?.getItem(s);return w?{version:2,plainText:w}:null}catch{return null}}var auxUnsavedDrafts=new Map,auxUnsavedDraftScopes=new Map,auxUnsavedDraftSettings=new Map,auxDraftUnload=e=>{e.preventDefault(),e.returnValue=""};function J(e,n,t){const s=c(e,l,t);let auxWriteScope=null;try{const r=f(),o=N(),auxDurable=(typeof e==="string"&&e.length>0||typeof t==="string"&&/^mini-popup-account:(?:0|[1-9][0-9]{0,15}):new$/.test(t)||typeof t==="string"&&/^(?:sidepanel-page|newtab-page):(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|p_[a-z0-9_]{6,126})$/.test(t));auxWriteScope=auxDurable;if(auxDraftMigrationBlocked())throw new Error("Aux draft capture is holding this document");if(auxDurable?!o:!r)throw new Error("Draft storage unavailable");const i=c(e,I,t);if(!n||n.plainText.length===0&&!n.attachments?.length){r?.removeItem(s),r?.removeItem(i),o?.removeItem(s),o?.removeItem(i)}else{const a=JSON.stringify(n);r?.setItem(s,a),r?.removeItem(i),auxDurable?o.setItem(s,a):o?.removeItem(s),o?.removeItem(i)}auxUnsavedDrafts.delete(s);auxUnsavedDraftScopes.delete(s);if(auxUnsavedDrafts.size===0&&typeof window!=="undefined")window.removeEventListener("beforeunload",auxDraftUnload);return true}catch{auxUnsavedDrafts.set(s,n);auxUnsavedDraftScopes.set(s,auxWriteScope);if(typeof window!=="undefined")window.addEventListener("beforeunload",auxDraftUnload);return false}}function $(e){const n=f();if(n)try{const t=n.getItem(y(e));if(!t)return;const r=JSON.parse(t);if(r.version!==1)return;const o=r.draftRuntimeConfig,s=o?.memoryExtractionDisabled===void 0&&o?.proactiveMode===void 0&&o?.finalConfirm===void 0&&o?.workingDirs===void 0?void 0:{memoryExtractionDisabled:o?.memoryExtractionDisabled??!1,proactiveMode:o?.proactiveMode??!1,finalConfirm:o?.finalConfirm??!1,workingDirs:o?.workingDirs??[]};return{version:1,draftModelOverride:E({provider:v(),modelId:v(),thinkingLevel:h(P),fastMode:_().catch(!1)}).nullable().catch(null).parse(r.draftModelOverride),draftPermissionMode:r.draftPermissionMode,draftRuntimeConfig:s,draftMode:r.draftMode,draftProjectId:r.draftProjectId??null}}catch{return}}function j(e,n){const t=f();if(t){const auxKey=y(e);let auxRaw;try{auxRaw=JSON.stringify({version:1,draftModelOverride:n.draftModelOverride,draftPermissionMode:n.draftPermissionMode,draftRuntimeConfig:n.draftRuntimeConfig,draftMode:n.draftMode,draftProjectId:n.draftProjectId});if(auxDraftMigrationBlocked())throw new Error("Aux draft capture is holding this document");t.setItem(auxKey,auxRaw);auxUnsavedDraftSettings.delete(auxKey)}catch{auxUnsavedDraftSettings.set(auxKey,auxRaw??null)}}}function W(e,n,t){return typeof window>"u"?!1:(S({sessionId:e,message:n,mode:t?.mode??"client-send"}),!0)}function k(e){if(typeof window>"u")return null;try{return M(e)?.message??null}catch{return d(),null}}function H(e){if(typeof window>"u"||auxDraftMigrationBlocked()||a?.claimId&&!T(a))return null;try{const n=M(e);if(!n||n.claimId&&!T(n))return null;const t=!!n.claimId,r=G();return S({sessionId:e,message:n.message,claimId:r,claimedAt:Date.now(),mode:n.mode??"client-send"}),{claimId:r,message:n.message,mode:n.mode??"client-send",wasReclaimed:t}}catch{return d(),null}}function U(e,n){if(!(typeof window>"u"))try{const t=g(e);if(!t?.message||t.sessionId!==e||t.claimId!==n)return;auxRememberDraftClaimAcknowledgement(t);d()}catch{d()}}function X(e,n){if(!(typeof window>"u"))try{const t=g(e);if(!t?.message||t.sessionId!==e||t.claimId!==n)return;S({sessionId:e,message:t.message,mode:t.mode})}catch{d()}}function g(e){const cached=a&&(!e||a.sessionId===e)?a:null;let stored;try{const raw=window.sessionStorage.getItem(m);stored=raw?JSON.parse(raw):null}catch(error){if(cached)return cached;throw error}if(auxPendingMessageDirty&&auxDraftMigrationAckedClaim&&stored?.sessionId===auxDraftMigrationAckedClaim.sessionId&&stored?.claimId===auxDraftMigrationAckedClaim.claimId)stored=null;return stored?.claimId?stored:cached??stored}function M(e){const n=g();return!A(n)||n.sessionId!==e?null:n}function A(e){return!!e?.message}function T(e){return e.claimId?!e.claimedAt||Date.now()-e.claimedAt>R:!1}function S(e){a=e;try{if(auxDraftMigrationBlocked())throw new Error("Aux draft capture is holding this document");window.sessionStorage.setItem(m,JSON.stringify(e));auxPendingMessageDirty=!1}catch{auxPendingMessageDirty=!0}}function d(){a=null;try{if(auxDraftMigrationBlocked())throw new Error("Aux draft capture is holding this document");window.sessionStorage.removeItem(m);auxPendingMessageDirty=!1}catch{auxPendingMessageDirty=!0}}function G(){return typeof crypto.randomUUID=="function"?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`}function auxCaptureDraftMigration(){
  if(typeof window==="undefined"||typeof chrome==="undefined"||
    !chrome.runtime?.id||window.location?.protocol!=="chrome-extension:"||
    window.location.hostname!==chrome.runtime.id)
    throw new Error("Aux draft capture requires its live extension context");
  const session=f(),local=N();
  if(!session||!local)throw new Error("Aux draft capture storage unavailable");
  const prefixes=[`${l}:`,`${I}:`,`${C}:`],known=key=>key===m||prefixes.some(prefix=>key.startsWith(prefix));
  let units=0,records=0;
  const account=(key,value)=>{
    units+=key.length+(typeof value==="string"?value.length:0);
    if(++records>4096||units>33554432)throw new Error("Aux draft capture exceeds its bound");
  };
  const read=storage=>{
    const entries=Object.create(null),length=storage.length;
    if(!Number.isSafeInteger(length)||length<0||length>100000)
      throw new Error("Aux draft capture storage enumeration unavailable");
    for(let index=0;index<length;index++){
      const key=storage.key(index);
      if(typeof key!=="string"||!known(key))continue;
      if(Object.hasOwn(entries,key))throw new Error("Aux draft storage changed during capture");
      const value=storage.getItem(key);
      if(typeof value!=="string")throw new Error("Aux draft storage changed during capture");
      account(key,value);entries[key]=value;
    }
    return entries;
  };
  const sessionEntries=read(session),localEntries=read(local),mutations=[];
  const intent=(storage,key,operation,value)=>{
    if(!known(key)||operation==="set"&&typeof value!=="string")
      throw new Error("Aux draft capture contains an unsupported intent");
    account(key,value);
    mutations.push({storage,key,operation,...operation==="set"?{value}:{}});
  };
  for(const [key,draft] of auxUnsavedDrafts){
    const durable=auxUnsavedDraftScopes.get(key);
    if(typeof durable!=="boolean"||!key.startsWith(`${l}:`))
      throw new Error("Aux unsaved draft scope unavailable");
    const legacy=`${I}:${key.slice(l.length+1)}`;
    const empty=!draft||draft.plainText.length===0&&!draft.attachments?.length;
    const raw=empty?undefined:JSON.stringify(draft);
    intent("session-storage",key,empty?"remove":"set",raw);
    intent("session-storage",legacy,"remove");
    intent("local-storage",key,empty||!durable?"remove":"set",raw);
    intent("local-storage",legacy,"remove");
  }
  for(const [key,raw] of auxUnsavedDraftSettings){
    if(typeof raw!=="string")throw new Error("Aux unsaved settings cannot be serialized");
    intent("session-storage",key,"set",raw);
  }
  if(a!==null){
    const raw=JSON.stringify(a);
    if(auxPendingMessageDirty||raw!==sessionEntries[m])intent("session-storage",m,"set",raw);
  }else if(auxPendingMessageDirty){
    intent("session-storage",m,"remove");
  }
  return {format:"aux.ui-draft-capture.v1",origin:window.location.origin,
    sessionEntries,localEntries,mutations};
}

// UI-data closure only. Native profile/document/startup authority is external.
const auxDraftMigrationOwners=new Map,auxDraftMigrationWork=new Set,auxDraftMigrationUnknownWork=new Set;
let auxDraftMigrationAckedClaim=null;
let auxDraftMigrationRevision=0,auxDraftMigrationLease=null,auxDraftMigrationLastRelease=null,auxDraftMigrationFlushing=false,auxDraftMigrationOwnerOverflow=0;
const auxDraftMigrationFormat="aux.ui-draft-capture-lease.v1";
function auxDraftMigrationChanged(){
  if(auxDraftMigrationRevision===Number.MAX_SAFE_INTEGER)throw Error("Aux draft revision exhausted");
  auxDraftMigrationRevision++;
  if(auxDraftMigrationLease&&!auxDraftMigrationFlushing)auxDraftMigrationLease.tainted=true;
}
function auxDraftMigrationBlocked(){
  if(!auxDraftMigrationLease||auxDraftMigrationLease.phase==="releasing"||auxDraftMigrationFlushing)return false;
  auxDraftMigrationChanged();return true;
}
function auxBeginDraftMigrationWork(kind){
  if(!["file-read","composer-submit","session-create","chat-command"].includes(kind))throw Error("Unknown Aux draft work");
  if(auxDraftMigrationBlocked()&&kind!=="file-read")throw Error("Aux draft capture is holding this document");
  // A late file-read retains the real File and its original completion path;
  // it taints qualification instead of silently dropping the attachment.
  const ticket={kind};auxDraftMigrationWork.add(ticket);auxDraftMigrationChanged();
  let live=true;return(unknown=false)=>{if(live){live=false;if(unknown)auxDraftMigrationUnknownWork.add(kind);auxDraftMigrationWork.delete(ticket);auxDraftMigrationChanged()}};
}
function auxRegisterDraftMigrationOwner(kind,owner){
  if(!["rich-editor","composer","newtab","mini","session-owner","chat-client"].includes(kind)||!owner||
      typeof owner.inspect!=="function"||typeof owner.flush!=="function"||
      typeof owner.freeze!=="function")
    throw Error("Unknown Aux draft editor owner");
  // A large UI stays usable; unsupported owner counts refuse capture instead
  // of throwing out of an ordinary editor mount.
  if(auxDraftMigrationOwners.size>=256){
    auxDraftMigrationOwnerOverflow++;auxDraftMigrationChanged();
    let live=true;return()=>{if(live){live=false;auxDraftMigrationOwnerOverflow--;auxDraftMigrationChanged()}};
  }
  // A new mount during capture cannot silently join the already captured set.
  if(auxDraftMigrationLease)auxDraftMigrationLease.tainted=true;
  auxDraftMigrationChanged();
  const ticket={kind,owner};auxDraftMigrationOwners.set(ticket,ticket);
  let live=true;return()=>{if(live){live=false;auxDraftMigrationOwners.delete(ticket);if(auxDraftMigrationLease)auxDraftMigrationLease.tainted=true;auxDraftMigrationChanged()}};
}
function auxGetNewtabDraftSettingsOwner(){
  const owners=[...auxDraftMigrationOwners.values()].filter(entry=>entry.kind==="newtab");
  return owners.length===1?owners[0].owner.sessionSettings??null:null;
}
function auxRememberDraftClaimAcknowledgement(record){
  auxDraftMigrationAckedClaim={sessionId:record.sessionId,claimId:record.claimId};
  auxDraftMigrationChanged();
}
function auxDraftMigrationHasClaim(){
  if(a?.claimId)return true;
  const raw=f()?.getItem(m),stored=raw===null||raw===undefined?null:JSON.parse(raw);
  if(!stored?.claimId)return false;
  // A failed ACK removal is a known tombstone for that exact claim only.
  // A newer stored claim must not be hidden by this page's cached message.
  return !(auxPendingMessageDirty&&auxDraftMigrationAckedClaim&&
    stored.sessionId===auxDraftMigrationAckedClaim.sessionId&&
    stored.claimId===auxDraftMigrationAckedClaim.claimId);
}
function auxDraftMigrationMemorySignature(){
  const raw=JSON.stringify({drafts:[...auxUnsavedDrafts],scopes:[...auxUnsavedDraftScopes],
    settings:[...auxUnsavedDraftSettings],pending:a,dirty:auxPendingMessageDirty,acked:auxDraftMigrationAckedClaim});
  if(raw.length>33554432)throw Error("Aux draft memory exceeds its bound");
  return raw;
}
function auxDraftMigrationCaptureJson(){
  const raw=JSON.stringify(auxCaptureDraftMigration());
  if(raw.length>33554432||new TextEncoder().encode(raw).byteLength>33554432)
    throw Error("Aux draft capture exceeds its bound");
  return raw;
}
function auxDraftMigrationSignature(owner){
  const value=owner.inspect();
  if(value&&typeof value.then==="function")throw Error("Asynchronous editor inspection is unsupported");
  const signature=JSON.stringify(value);
  if(typeof signature!=="string"||signature.length>33554432)
    throw Error("Aux editor state is unavailable or exceeds its bound");
  return signature;
}
function auxDraftMigrationCheckInputs(){
  const route=window.location?.pathname;
  if(!["/newtab.html","/sidepanel.html","/main.html","/minipopup.html"].includes(route))
    throw Error("This Aux page has no reviewed draft owner coverage");
  const owners=[...auxDraftMigrationOwners.values()];
  const rich=owners.filter(entry=>entry.kind==="rich-editor"),composers=owners.filter(entry=>entry.kind==="composer"),newtabs=owners.filter(entry=>entry.kind==="newtab");
  if(!rich.length||route==="/newtab.html"&&newtabs.length!==1||
     route!=="/newtab.html"&&(!composers.length||!owners.some(entry=>entry.kind==="session-owner"))||
     route==="/minipopup.html"&&!owners.some(entry=>entry.kind==="mini"))
    throw Error("Aux draft owners are mounting or are not registered");
  // A core editor may have committed before its parent layout effect runs.
  // Match the actual controller, never a zero count or document.readyState.
  for(const {owner} of rich){
    const controller=owner.controller?.();
    const managed=composers.filter(entry=>entry.owner.controller?.()===controller).length+
      newtabs.filter(entry=>entry.owner.controller?.()===controller&&entry.owner.standalone?.()).length;
    if(!controller||managed!==1)throw Error("An editor's real draft manager is not registered");
  }
  if(composers.length&&!owners.some(entry=>entry.kind==="session-owner"))
    throw Error("Session option owners have not registered");
  if(typeof document==="undefined"||typeof document.querySelectorAll!=="function")
    throw Error("Aux draft document inventory is unavailable");
  const editors=[];
  for(const {kind,owner} of auxDraftMigrationOwners.values())if(kind==="rich-editor"){
    const element=owner.element?.();if(!element)throw Error("Aux editor element is unavailable");editors.push(element);
  }
  for(const element of document.querySelectorAll('[contenteditable="true"],textarea,input')){
    if(editors.some(editor=>editor===element||editor.contains(element)))continue;
    const tag=element.tagName?.toLowerCase(),type=String(element.type??"text").toLowerCase();
    if(element.getAttribute?.("contenteditable")==="true")
      throw Error("An editor has not joined Aux draft capture");
    if(tag==="input"&&type==="file"){
      if(element.files?.length)throw Error("A selected attachment has not settled");
      continue;
    }
    if((tag==="textarea"||tag==="input"&&["text","search","url","email","password","number","tel"].includes(type))&&String(element.value??"").length)
      throw Error("An unsupported input contains unsaved text");
  }
}
function auxDraftMigrationRelease(lease){
  // Keep the original lease until every actual restorer succeeds. A failed
  // restorer is retryable cleanup, never anonymous absence of source work.
  lease.phase="releasing";auxDraftMigrationFlushing=false;
  const remaining=[];
  for(const restore of lease.restores.reverse())try{restore()}catch{remaining.push(restore)}
  lease.restores=remaining.reverse();
  if(remaining.length){lease.phase="cleanup";return false}
  if(auxDraftMigrationLease===lease)auxDraftMigrationLease=null;
  auxDraftMigrationLastRelease={format:auxDraftMigrationFormat,ok:true,retained:false,
    requestId:lease.requestId,leaseId:lease.id,revision:lease.revision,released:true,restored:true};
  return true;
}
function auxPrepareDraftMigrationRecoveryCapture(requestId,wireFormat){
  return auxPrepareDraftMigrationCapture(requestId,wireFormat,"recovery-read-only");
}
function auxPrepareDraftMigrationCapture(requestId,wireFormat,captureMode){
  if(captureMode!==undefined&&captureMode!=="recovery-read-only")
    return{format:auxDraftMigrationFormat,ok:false,error:"Unsupported Aux draft capture mode"};
  if(typeof requestId!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(requestId))
    return{format:auxDraftMigrationFormat,ok:false,error:"A canonical capture request ID is required"};
  if(auxDraftMigrationLease)return{format:auxDraftMigrationFormat,ok:false,error:"This document already has a capture lease"};
  const lease={id:null,requestId,phase:"preparing",tainted:false,restores:[],signatures:[],captureJson:null,memoryJson:null,ownerStateJson:null,recoveryReadOnly:captureMode==="recovery-read-only",sealed:false,revision:0};
  try{
    // Establish the actual extension context before reading any draft data.
    if(typeof window==="undefined"||typeof chrome==="undefined"||!chrome.runtime?.id||
      window.location?.protocol!=="chrome-extension:"||window.location.hostname!==chrome.runtime.id||chrome.extension?.inIncognitoContext===true)
      throw Error("Aux draft capture requires its live extension context");
    if(typeof crypto.randomUUID!=="function")throw Error("Aux draft lease identity unavailable");
    lease.id=crypto.randomUUID();
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(lease.id))throw Error("Aux draft lease identity unavailable");
    if(auxDraftMigrationWork.size||auxDraftMigrationUnknownWork.size||auxDraftMigrationOwnerOverflow)throw Error("Attachment or message work is still active or has an unknown result");
    // A claim never becomes closed merely because its reclaim timeout elapsed.
    if(auxDraftMigrationHasClaim())throw Error("A pending message claim is still owned");
    auxDraftMigrationCheckInputs();
    const owners=[...auxDraftMigrationOwners.values()];
    for(const {owner} of owners)auxDraftMigrationSignature(owner);
    auxDraftMigrationLastRelease=null;auxDraftMigrationLease=lease;
    for(const {owner} of owners){
      const restore=owner.freeze();
      if(typeof restore!=="function")throw Error("Aux editor freeze is unsupported");
      lease.restores.push(restore);
    }
    if(!lease.recoveryReadOnly){
      auxDraftMigrationFlushing=true;
      try{for(const {owner} of owners){
        const result=owner.flush();
        if(result&&typeof result.then==="function"){auxDraftMigrationUnknownWork.add("async-flush");throw Error("Asynchronous editor flush is unsupported")}
      }}finally{auxDraftMigrationFlushing=false}
    }
    if(auxDraftMigrationLease!==lease||lease.tainted||auxDraftMigrationWork.size||auxDraftMigrationUnknownWork.size||auxDraftMigrationOwnerOverflow||auxDraftMigrationOwners.size!==owners.length||auxDraftMigrationHasClaim())
      throw Error("Aux draft owners changed during capture");
    auxDraftMigrationCheckInputs();
    lease.signatures=owners.map(({owner})=>auxDraftMigrationSignature(owner));
    if(lease.signatures.reduce((size,value)=>size+value.length,0)>33554432)
      throw Error("Aux editor capture exceeds its aggregate bound");
    lease.memoryJson=auxDraftMigrationMemorySignature();
    const ownerStates=owners.map((entry,index)=>({kind:entry.kind,scope:auxDraftMigrationOwnerScope(entry,owners),signatureJson:lease.signatures[index]}));
    ownerStates.sort((a,b)=>auxDraftRecoveryCompare(a.kind,b.kind)||auxDraftRecoveryCompare(String(a.scope),String(b.scope))||auxDraftRecoveryCompare(a.signatureJson,b.signatureJson));
    lease.ownerStateJson=JSON.stringify(ownerStates);
    if(lease.ownerStateJson.length+lease.memoryJson.length>33554432)
      throw Error("Aux recovery owner state exceeds its bound");
    lease.captureJson=auxDraftMigrationCaptureJson();
    if(auxDraftMigrationLease!==lease||lease.tainted)throw Error("Aux draft lease changed during capture");
    lease.revision=auxDraftMigrationRevision;lease.phase="held";
    if(wireFormat==="utf16-v1")return auxDraftMigrationEnvelope(lease,wireFormat);
    return{format:auxDraftMigrationFormat,ok:true,requestId:lease.requestId,leaseId:lease.id,revision:lease.revision,
      ownerCount:owners.length,sealed:false,capture:JSON.parse(lease.captureJson)};
  }catch(error){
    const owned=auxDraftMigrationLease===lease;
    const restored=owned?auxDraftMigrationRelease(lease):true;
    const failure={format:auxDraftMigrationFormat,ok:false,requestId,error:String(error?.message??error),restored,
      retained:auxDraftMigrationLease===lease,...owned?{leaseId:lease.id,revision:lease.revision}:{}};
    if(!owned&&!auxDraftMigrationLease)auxDraftMigrationLastRelease={...failure,noLeaseCreated:true,attemptState:"not-started"};
    return failure;
  }
}
function auxAssertDraftMigrationOwners(leaseId,revision){
  const lease=auxDraftMigrationLease;
  if(!lease||lease.phase!=="held"||lease.id!==leaseId||lease.revision!==revision||
     !Number.isSafeInteger(revision)||lease.tainted||auxDraftMigrationRevision!==revision||
     auxDraftMigrationWork.size||auxDraftMigrationUnknownWork.size||auxDraftMigrationOwnerOverflow||auxDraftMigrationOwners.size!==lease.signatures.length)
    throw Error("Aux draft capture lease changed");
  auxDraftMigrationCheckInputs();
  let index=0;
  for(const {owner} of auxDraftMigrationOwners.values())
    if(auxDraftMigrationSignature(owner)!==lease.signatures[index++])throw Error("An editor changed after capture");
  if(auxDraftMigrationMemorySignature()!==lease.memoryJson||auxDraftMigrationLease!==lease||
     lease.tainted||auxDraftMigrationRevision!==revision||auxDraftMigrationWork.size||
     auxDraftMigrationUnknownWork.size||auxDraftMigrationOwnerOverflow)
    throw Error("Aux draft owners or memory changed after capture");
  return lease;
}
function auxValidateDraftMigrationCapture(leaseId,revision){
  const lease=auxDraftMigrationLease;
  try{
    auxAssertDraftMigrationOwners(leaseId,revision);
    if(auxDraftMigrationHasClaim()||lease.sealed&&auxDraftMigrationCaptureJson()!==lease.captureJson)
      throw Error("Aux draft stores or claims changed after capture");
    auxAssertDraftMigrationOwners(leaseId,revision);
    return{format:auxDraftMigrationFormat,ok:true,requestId:lease.requestId,leaseId,revision,ownerCount:lease.signatures.length,sealed:lease.sealed,closed:true};
  }catch(error){return{format:auxDraftMigrationFormat,ok:false,requestId:lease?.requestId,
    leaseId:lease?.id,revision:lease?.revision,sealed:lease?.sealed??false,closed:false,error:String(error?.message??error)}}
}
function auxDraftMigrationStoreUnits(capture){
  let count=0;
  const units=value=>{
    if(typeof value!=="string"||(count+=value.length)>4194304)throw Error("Aux UTF16 store capture exceeds its bound");
    const output=new Array(value.length);
    for(let index=0;index<value.length;index++)output[index]=value.charCodeAt(index);
    return output;
  };
  const entries=value=>Object.keys(value).sort().map(key=>({key:units(key),value:units(value[key])}));
  return{format:"aux.ui-draft-store-units.v1",origin:capture.origin,
    sessionEntries:entries(capture.sessionEntries),localEntries:entries(capture.localEntries),
    mutations:(capture.mutations??[]).map(change=>({storage:change.storage,operation:change.operation,
      key:units(change.key),...change.operation==="set"?{value:units(change.value)}:{}}))};
}
function auxDraftMigrationEnvelope(lease,wireFormat){
  const base={format:auxDraftMigrationFormat,ok:true,retained:true,requestId:lease.requestId,
    leaseId:lease.id,revision:lease.revision,ownerCount:lease.signatures.length,sealed:lease.sealed,
    recoveryReadOnly:lease.recoveryReadOnly,ownerStateJson:lease.ownerStateJson,memoryStateJson:lease.memoryJson};
  const capture=JSON.parse(lease.captureJson);
  return wireFormat==="utf16-v1"?{...base,wireFormat,captureJson:lease.captureJson,
    storeUnits:auxDraftMigrationStoreUnits(capture)}:{...base,capture};
}
function auxObserveDraftMigrationTarget(leaseId,revision,wireFormat){
  const lease=auxDraftMigrationLease;
  try{
    auxAssertDraftMigrationOwners(leaseId,revision);
    if(!lease.sealed)throw Error("Aux target observation requires a sealed source lease");
    // Native alone compares these current bytes with its exact planned target.
    // Never reset the sealed source baseline or infer new mutation intentions.
    const {origin,sessionEntries,localEntries}=JSON.parse(auxDraftMigrationCaptureJson());
    auxAssertDraftMigrationOwners(leaseId,revision);
    const stores={origin,sessionEntries,localEntries};
    const base={format:auxDraftMigrationFormat,ok:true,requestId:lease.requestId,leaseId,revision,
      ownerCount:lease.signatures.length,sealed:true};
    return wireFormat==="utf16-v1"?{...base,wireFormat,storesJson:JSON.stringify(stores),
      storeUnits:auxDraftMigrationStoreUnits(stores)}:{...base,stores};
  }catch(error){return{format:auxDraftMigrationFormat,ok:false,requestId:lease?.requestId,
    leaseId:lease?.id,revision:lease?.revision,sealed:lease?.sealed??false,error:String(error?.message??error)}}
}
function auxReadDraftMigrationCapture(wireFormat){
  const lease=auxDraftMigrationLease;
  if(!lease)return auxDraftMigrationLastRelease?{...auxDraftMigrationLastRelease}:
    {format:auxDraftMigrationFormat,ok:false,retained:false,error:"No retained Aux draft capture"};
  if(lease.phase!=="held")return{format:auxDraftMigrationFormat,ok:false,retained:true,requestId:lease.requestId,leaseId:lease.id,revision:lease.revision,sealed:lease.sealed,error:"Aux draft capture owner is changing"};
  const current=auxValidateDraftMigrationCapture(lease.id,lease.revision);
  if(!current.ok)return{...current,retained:true,requestId:lease.requestId,leaseId:lease.id,revision:lease.revision};
  try{return auxDraftMigrationEnvelope(lease,wireFormat)}catch(error){
    return{format:auxDraftMigrationFormat,ok:false,retained:true,requestId:lease.requestId,
      leaseId:lease.id,revision:lease.revision,sealed:lease.sealed,error:String(error?.message??error)};
  }
}
function auxSealDraftMigrationCapture(leaseId,revision,wireFormat){
  const lease=auxDraftMigrationLease,current=auxValidateDraftMigrationCapture(leaseId,revision);
  if(!current.ok)return current;
  try{
    if(!lease.sealed){
      // Native closes ALL actual cohort/backend writers before this call.
      // This is a read-only data seal, never a renderer assertion of that gate.
      const captured=auxDraftMigrationCaptureJson();
      if(auxDraftMigrationLease!==lease||lease.tainted||auxDraftMigrationRevision!==revision||
         auxDraftMigrationMemorySignature()!==lease.memoryJson||auxDraftMigrationHasClaim())
        throw Error("Aux draft owner changed during sealing");
      lease.captureJson=captured;lease.sealed=true;
    }
    return auxReadDraftMigrationCapture(wireFormat);
  }catch(error){return{format:auxDraftMigrationFormat,ok:false,retained:true,requestId:lease.requestId,
    leaseId:lease.id,revision:lease.revision,sealed:lease.sealed,error:String(error?.message??error)}}
}
function auxReleaseDraftMigrationCapture(leaseId){
  if(auxDraftMigrationLease?.id===leaseId&&auxDraftMigrationLease.adoption&&!auxDraftMigrationLease.adoption.complete)
    return{format:auxDraftMigrationFormat,ok:false,released:false,retained:true,requestId:auxDraftMigrationLease.requestId,
      leaseId,revision:auxDraftMigrationLease.revision,error:"Actual owner adoption remains pending"};
  const lease=auxDraftMigrationLease;
  if(!lease||lease.id!==leaseId)return{format:auxDraftMigrationFormat,ok:false,released:false,error:"Aux draft capture lease changed"};
  const restored=auxDraftMigrationRelease(lease);
  return{format:auxDraftMigrationFormat,ok:restored,requestId:lease.requestId,leaseId:lease.id,
    revision:lease.revision,released:restored,retained:!restored,restored};
}
// Finite renderer data adoption. Native retains all actor/journal authority.
function auxDraftRecoveryCompare(a,b){return a<b?-1:a>b?1:0}
function auxDraftMigrationRecoveryApplying(){
  return !!auxDraftMigrationLease&&(!!auxDraftMigrationLease.adoption&&["adopting","adopted"].includes(auxDraftMigrationLease.phase)||auxDraftMigrationLease.closedHandoff===true&&auxDraftMigrationLease.phase==="held");
}
function auxDraftMigrationOwnerScope(entry,owners=[...auxDraftMigrationOwners.values()]){
  let owner=entry.owner;
  if(entry.kind==="rich-editor"){
    const controller=owner.controller?.();
    const managers=owners.filter(value=>value.kind==="composer"&&value.owner.controller?.()===controller||
      value.kind==="newtab"&&value.owner.standalone?.()&&value.owner.controller?.()===controller);
    if(managers.length!==1)return null;
    owner=managers[0].owner;
  }
  const scope=owner.recoveryScope?.();
  return typeof scope==="string"&&scope.length>0&&scope.length<=4096?scope:null;
}
function auxDraftRecoveryDraftForScope(capture,scope){
  const raw=capture.sessionEntries?.[`${l}:${scope}`]??capture.localEntries?.[`${l}:${scope}`];
  if(raw!==undefined){
    const value=JSON.parse(raw);
    if(value?.version!==2||typeof value.plainText!=="string")throw Error("Recorded draft schema is unavailable");
    return value;
  }
  const text=capture.sessionEntries?.[`${I}:${scope}`]??capture.localEntries?.[`${I}:${scope}`];
  return text===undefined?null:{version:2,plainText:text};
}
function auxDraftRecoverySettingsForScope(capture,scope){
  const raw=capture.sessionEntries?.[`${C}:${scope}`];
  if(raw===undefined)return null;
  const value=JSON.parse(raw);
  if(value?.version!==1)throw Error("Recorded draft settings schema is unavailable");
  return value;
}
function auxDraftRecoveryParseCapture(raw){
  if(typeof raw!=="string"||raw.length>33554432)throw Error("Recorded draft capture exceeds its bound");
  const value=JSON.parse(raw);
  if(value?.origin!==window.location.origin)throw Error("Recorded draft origin differs");
  const known=key=>key===m||[`${l}:`,`${I}:`,`${C}:`].some(prefix=>key.startsWith(prefix));
  for(const entries of [value.sessionEntries,value.localEntries]){
    if(!entries||typeof entries!=="object"||Array.isArray(entries)||Object.keys(entries).length>4096)
      throw Error("Recorded draft store inventory is unavailable");
    for(const [key,data] of Object.entries(entries))if(!known(key)||typeof data!=="string")
      throw Error("Recorded draft store has an unknown family");
  }
  return value;
}
function auxDraftRecoveryStoresEqual(a,b){
  const equal=(left,right)=>JSON.stringify(Object.keys(left).sort().map(key=>[key,left[key]]))===
    JSON.stringify(Object.keys(right).sort().map(key=>[key,right[key]]));
  return a.origin===b.origin&&equal(a.sessionEntries,b.sessionEntries)&&equal(a.localEntries,b.localEntries);
}
function auxDraftRecoveryParseOwners(raw){
  if(typeof raw!=="string"||raw.length>33554432)throw Error("Recorded owner state exceeds its bound");
  const values=JSON.parse(raw),result=new Map;
  if(!Array.isArray(values)||!values.length||values.length>256)throw Error("Recorded owner inventory is unavailable");
  for(const value of values){
    if(!["rich-editor","composer","newtab","mini","session-owner","chat-client"].includes(value?.kind)||
       typeof value.scope!=="string"||!value.scope||value.scope.length>4096||typeof value.signatureJson!=="string")
      throw Error("Recorded owner has no actual stable scope facts");
    const key=JSON.stringify([value.kind,value.scope]);
    if(result.has(key))throw Error("Recorded owner scope is ambiguous");
    result.set(key,{...value,state:JSON.parse(value.signatureJson)});
  }
  return result;
}
function auxDraftRecoveryParseMemory(raw){
  if(typeof raw!=="string"||raw.length>33554432)throw Error("Recorded draft memory exceeds its bound");
  const value=JSON.parse(raw);
  if(!value||typeof value.dirty!=="boolean")throw Error("Recorded memory flags are unavailable");
  for(const name of ["drafts","scopes","settings"]){
    if(!Array.isArray(value[name])||value[name].length>4096)throw Error("Recorded memory inventory is unavailable");
    const keys=new Set;
    for(const row of value[name])if(!Array.isArray(row)||row.length!==2||typeof row[0]!=="string"||keys.has(row[0]))
      throw Error("Recorded memory keys are ambiguous");else keys.add(row[0]);
  }
  const scopes=new Map(value.scopes);
  if(scopes.size!==value.drafts.length)throw Error("Recorded draft scopes are incomplete");
  for(const [key,draft] of value.drafts)if(!key.startsWith(`${l}:`)||typeof scopes.get(key)!=="boolean"||
      draft!==null&&(draft?.version!==2||typeof draft.plainText!=="string"))throw Error("Recorded draft intent is unsupported");
  for(const [key,data] of value.settings)if(!key.startsWith(`${C}:`)||typeof data!=="string")
    throw Error("Recorded settings intent is unsupported");
  if(value.pending!==null&&(!value.pending?.message||typeof value.pending.sessionId!=="string"||value.pending.claimId))
    throw Error("Active or unknown claims cannot be adopted");
  if(value.acked!==null&&(typeof value.acked?.sessionId!=="string"||typeof value.acked?.claimId!=="string"))
    throw Error("Claim acknowledgement provenance is unavailable");
  return value;
}
function auxDraftRecoveryMemoryCandidate(source,current,capture,target){
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  // A fresh or subset cache may receive captured latest data; a newer actual
  // failed write, pending message or acknowledgement is never overwritten.
  for(const name of ["drafts","scopes","settings"]){
    const expected=new Map(source[name]);
    for(const [key,value] of current[name])if(!expected.has(key)||!same(expected.get(key),value))
      throw Error("Fresh draft memory contains a newer intent");
  }
  if(current.pending!==null&&!same(current.pending,source.pending)||current.dirty&&!source.dirty||
      !same(current.acked,source.acked))throw Error("Fresh pending/claim memory differs from the recorded owner");
  const result=JSON.parse(JSON.stringify(source)),scopes=new Map(result.scopes);
  if(target){
    const matches=(store,key,operation,value)=>operation==="set"?store[key]===value:!Object.hasOwn(store,key);
    const retained=[];
    for(const [key,draft] of result.drafts){
      const legacy=`${I}:${key.slice(l.length+1)}`,durable=scopes.get(key);
      const empty=!draft||draft.plainText.length===0&&!draft.attachments?.length,raw=empty?undefined:JSON.stringify(draft);
      const done=matches(capture.sessionEntries,key,empty?"remove":"set",raw)&&
        matches(capture.sessionEntries,legacy,"remove")&&
        matches(capture.localEntries,key,empty||!durable?"remove":"set",raw)&&matches(capture.localEntries,legacy,"remove");
      if(done)scopes.delete(key);else retained.push([key,draft]);
    }
    result.drafts=retained;result.scopes=[...scopes];
    result.settings=result.settings.filter(([key,data])=>capture.sessionEntries[key]!==data);
    if(result.dirty){
      const raw=result.pending===null?undefined:JSON.stringify(result.pending);
      if(result.pending===null?!Object.hasOwn(capture.sessionEntries,m):capture.sessionEntries[m]===raw)result.dirty=false;
    }
  }
  return result;
}
function auxDraftRecoveryCurrentOwnerFacts(){
  const entries=[...auxDraftMigrationOwners.values()],facts=[];
  for(const entry of entries)facts.push({kind:entry.kind,scope:auxDraftMigrationOwnerScope(entry,entries),signatureJson:auxDraftMigrationSignature(entry.owner)});
  facts.sort((a,b)=>auxDraftRecoveryCompare(a.kind,b.kind)||auxDraftRecoveryCompare(String(a.scope),String(b.scope))||auxDraftRecoveryCompare(a.signatureJson,b.signatureJson));
  return facts;
}
function auxReadDraftMigrationRecoveryAdoption(leaseId,revision){
  const lease=auxDraftMigrationLease,adoption=lease?.adoption;
  try{
    if(!lease||lease.id!==leaseId||lease.revision!==revision||!adoption||
       !["adopting","adopted"].includes(lease.phase)||lease.tainted||auxDraftMigrationRevision!==revision||
       auxDraftMigrationWork.size||auxDraftMigrationUnknownWork.size||auxDraftMigrationOwnerOverflow||
       auxDraftMigrationOwners.size!==adoption.owners.length)throw Error("Actual adoption owner/lease changed");
    auxDraftMigrationCheckInputs();
    for(const entry of adoption.owners)if(!auxDraftMigrationOwners.has(entry.ticket)||auxDraftMigrationOwnerScope(entry.ticket)!==entry.desired.scope)throw Error("An adopted owner or actual scope changed");
    const current=JSON.parse(auxDraftMigrationCaptureJson());
    if(!auxDraftRecoveryStoresEqual(current,adoption.capture))throw Error("Actual adopted stores differ from the native desired alternative");
    const facts=auxDraftRecoveryCurrentOwnerFacts(),ownerStateJson=JSON.stringify(facts),memoryStateJson=auxDraftMigrationMemorySignature();
    const complete=adoption.owners.every(entry=>entry.ticket.owner.adoptionSettled?.()!==false&&auxDraftMigrationSignature(entry.ticket.owner)===entry.desired.signatureJson)&&
      memoryStateJson===adoption.memoryJson;
    if(complete){adoption.complete=true;lease.phase="adopted"}
    return{format:"aux.ui-draft-owner-adoption.v1",ok:true,pending:!complete,complete,retained:true,
      requestId:lease.requestId,leaseId,revision,ownerStateJson,memoryStateJson,storeUnits:auxDraftMigrationStoreUnits(current)};
  }catch(error){return{format:"aux.ui-draft-owner-adoption.v1",ok:false,pending:true,complete:false,retained:!!lease,
    requestId:lease?.requestId,leaseId:lease?.id,revision:lease?.revision,error:String(error?.message??error)}}
}
function auxAdoptDraftMigrationRecovery(leaseId,revision,plan){
  const lease=auxDraftMigrationLease;
  try{
    const raw=JSON.stringify(plan);
    if(typeof raw!=="string"||raw.length>67108864)throw Error("Owner adoption plan exceeds its bound");
    if(lease?.adoption){
      if(lease.adoption.planJson!==raw)throw Error("Original adoption plan is immutable");
      return auxReadDraftMigrationRecoveryAdoption(leaseId,revision);
    }
    auxAssertDraftMigrationOwners(leaseId,revision);
    if(!lease.recoveryReadOnly||!lease.sealed||plan?.format!=="aux.ui-draft-owner-adoption.v1"||
       !["source","target"].includes(plan.desired))throw Error("Sealed fresh recovery lease and finite alternatives required");
    if(auxDraftMigrationHasClaim())throw Error("A current claim is still owned");
    const sourceCapture=auxDraftRecoveryParseCapture(plan.sourceCaptureJson),targetCapture=auxDraftRecoveryParseCapture(plan.targetCaptureJson);
    const capture=plan.desired==="source"?sourceCapture:targetCapture,currentCapture=JSON.parse(auxDraftMigrationCaptureJson());
    if(!auxDraftRecoveryStoresEqual(currentCapture,capture))throw Error("Native desired stores are not actually observed");
    const source=auxDraftRecoveryParseOwners(plan.sourceOwnerStateJson),target=auxDraftRecoveryParseOwners(plan.targetOwnerStateJson);
    const entries=[...auxDraftMigrationOwners.values()],owners=[],seen=new Set;
    if(source.size!==entries.length||target.size!==entries.length)throw Error("Actual owner inventory differs from the recorded alternatives");
    for(const ticket of entries){
      const scope=auxDraftMigrationOwnerScope(ticket,entries),key=JSON.stringify([ticket.kind,scope]);
      const left=source.get(key),right=target.get(key),desired=plan.desired==="source"?left:right;
      if(!scope||seen.has(key)||!left||!right||!desired||typeof ticket.owner.prepareAdoption!=="function")
        throw Error("Actual owner correspondence/setter is unavailable");
      seen.add(key);
      const current=auxDraftMigrationSignature(ticket.owner),matched=current===left.signatureJson||current===right.signatureJson;
      const bases=[sourceCapture,targetCapture].map(value=>ticket.owner.recoveryBase?.(value));
      const baseMatched=bases.some(value=>value&&JSON.stringify(value)===current);
      let richBase=null;
      if(ticket.kind==="rich-editor"){
        const controller=ticket.owner.controller?.(),managers=entries.filter(value=>value.kind==="composer"&&value.owner.controller?.()===controller||value.kind==="newtab"&&value.owner.standalone?.()&&value.owner.controller?.()===controller);
        if(managers.length!==1)throw Error("Actual editor manager correspondence differs");
        for(const value of [sourceCapture,targetCapture]){
          const candidate=managers[0].owner.recoveryBase?.(value)?.snapshot;
          if(candidate&&JSON.stringify(candidate)===JSON.stringify(JSON.parse(current).snapshot))richBase=candidate;
        }
      }
      const context={scope,matched,baseMatched,richBase,sourceCapture,targetCapture,capture,goal:plan.desired};
      const apply=ticket.owner.prepareAdoption(desired.state,context);
      if(typeof apply!=="function")throw Error("An actual owner refused finite adoption");
      owners.push({ticket,desired,apply});
    }
    const memorySource=auxDraftRecoveryParseMemory(plan.sourceMemoryStateJson),memoryCurrent=auxDraftRecoveryParseMemory(lease.memoryJson);
    const memory=auxDraftRecoveryMemoryCandidate(memorySource,memoryCurrent,currentCapture,plan.desired==="target");
    const memoryJson=JSON.stringify(memory);
    if(plan.targetMemoryStateJson!==plan.sourceMemoryStateJson&&plan.targetMemoryStateJson!==JSON.stringify(auxDraftRecoveryMemoryCandidate(memorySource,memoryCurrent,targetCapture,true)))
      throw Error("Target memory must preserve captured latest data or retire only exact saved intents");
    const allowedScopes=new Set(entries.map(entry=>auxDraftMigrationOwnerScope(entry,entries)).filter(Boolean));
    for(const [key,draft] of memory.drafts){
      const scope=key.slice(l.length+1);
      if(!allowedScopes.has(scope))throw Error("A retained failed draft has no actual current scope owner");
      if(draft?.attachments?.length){
        const known=entries.some(entry=>{
          const value=entry.owner.inspect(),attachments=value.attachments??value.snapshot?.attachments??value.record?.attachments??value.draft?.attachments??[];
          return JSON.stringify(attachments)===JSON.stringify(draft.attachments);
        });
        if(!known)throw Error("Recorded attachment capability is not owned by a current editor");
      }
    }
    for(const [key] of memory.settings)if(!allowedScopes.has(key.slice(C.length+1)))
      throw Error("Retained settings have no actual current scope owner");
    lease.adoption={planJson:raw,owners,memoryJson,capture,complete:false};lease.phase="adopting";
    // Every real owner has preflighted before the first mutation. Failures
    // retain partial state/hold; no timeout or destructor reports completion.
    for(const entry of owners){if(auxDraftMigrationLease!==lease||lease.tainted||auxDraftMigrationRevision!==revision||auxDraftMigrationOwnerScope(entry.ticket)!==entry.desired.scope)throw Error("Actual owner changed during adoption");entry.apply()}
    auxUnsavedDrafts=new Map(memory.drafts);auxUnsavedDraftScopes=new Map(memory.scopes);
    auxUnsavedDraftSettings=new Map(memory.settings);a=memory.pending;auxPendingMessageDirty=memory.dirty;
    // Acknowledgements are preserved only from the actual same fresh cache.
    // No native task completion, claim ID or ACK tombstone is manufactured.
    if(JSON.stringify(auxDraftMigrationAckedClaim)!==JSON.stringify(memory.acked))throw Error("Actual acknowledgement changed");
    if(auxUnsavedDrafts.size)window.addEventListener("beforeunload",auxDraftUnload);
    else window.removeEventListener("beforeunload",auxDraftUnload);
    return auxReadDraftMigrationRecoveryAdoption(leaseId,revision);
  }catch(error){return{format:"aux.ui-draft-owner-adoption.v1",ok:false,pending:!!lease?.adoption,complete:false,retained:!!lease,
    requestId:lease?.requestId,leaseId:lease?.id,revision:lease?.revision,error:String(error?.message??error)}}
}

let auxDraftMigrationLastHandoff=null;
function auxReadDraftMigrationRecoveryHandoff(leaseId,revision,newRequestId,wireFormat="utf16-v1"){
  const receipt=auxDraftMigrationLastHandoff;
  if(!receipt||receipt.leaseId!==leaseId||receipt.revision!==revision||receipt.newRequestId!==newRequestId)
    return{format:"aux.ui-draft-recovery-handoff.v1",ok:false,pending:true,error:"Original handoff correlation is unavailable"};
  const successor=receipt.successor;
  if(auxDraftMigrationLease!==successor){
    if(auxDraftMigrationLastRelease?.leaseId===successor.id&&auxDraftMigrationLastRelease.requestId===newRequestId)
      return{format:"aux.ui-draft-recovery-handoff.v1",ok:true,pending:false,retired:true,successorReleased:true,
        originalRequestId:receipt.requestId,originalLeaseId:leaseId,originalRevision:revision,
        requestId:newRequestId,leaseId:successor.id,revision:successor.revision};
    return{format:"aux.ui-draft-recovery-handoff.v1",ok:false,pending:true,retired:true,error:"Actual successor custody changed"};
  }
  const current=auxReadDraftMigrationCapture(wireFormat);
  return{...current,handoffFormat:"aux.ui-draft-recovery-handoff.v1",pending:!current.ok,retired:true,
    originalRequestId:receipt.requestId,originalLeaseId:leaseId,originalRevision:revision,closedHandoff:true};
}
function auxHandoffDraftMigrationRecovery(leaseId,revision,newRequestId,wireFormat="utf16-v1"){
  const original=auxDraftMigrationLease;
  try{
    if(auxDraftMigrationLastHandoff?.leaseId===leaseId)
      return auxReadDraftMigrationRecoveryHandoff(leaseId,revision,newRequestId,wireFormat);
    const observed=auxReadDraftMigrationRecoveryAdoption(leaseId,revision);
    if(!observed.ok||!observed.complete||!original?.recoveryReadOnly||original.phase!=="adopted")
      throw Error("Actual owner adoption is not complete");
    if(typeof newRequestId!=="string"||newRequestId===original.requestId||
       !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(newRequestId)||
       typeof crypto.randomUUID!=="function")throw Error("Canonical successor correlation is required");
    const id=crypto.randomUUID();
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id))
      throw Error("Successor draft lease identity unavailable");
    const entries=[...auxDraftMigrationOwners.values()];
    const successor={id,requestId:newRequestId,phase:"held",tainted:false,restores:[],
      signatures:entries.map(({owner})=>auxDraftMigrationSignature(owner)),
      captureJson:auxDraftMigrationCaptureJson(),memoryJson:auxDraftMigrationMemorySignature(),
      ownerStateJson:JSON.stringify(auxDraftRecoveryCurrentOwnerFacts()),recoveryReadOnly:false,
      closedHandoff:true,sealed:false,revision:auxDraftMigrationRevision};
    if(successor.revision!==revision||auxDraftMigrationLease!==original||original.tainted||
       successor.memoryJson!==observed.memoryStateJson||successor.ownerStateJson!==observed.ownerStateJson)
      throw Error("Actual current source changed during closed handoff");
    // Build/read back everything before retiring the old lease. Neither
    // freeze restorers nor ordinary draft flush callbacks run here.
    const envelope=auxDraftMigrationEnvelope(successor,wireFormat);
    auxDraftMigrationLastHandoff={requestId:original.requestId,leaseId,revision,newRequestId,original,successor};
    successor.restores=original.restores;original.restores=[];original.phase="retired";
    auxDraftMigrationLastRelease=null;auxDraftMigrationLease=successor;
    return{...envelope,handoffFormat:"aux.ui-draft-recovery-handoff.v1",pending:false,retired:true,
      originalRequestId:original.requestId,originalLeaseId:leaseId,originalRevision:revision,closedHandoff:true};
  }catch(error){return{format:"aux.ui-draft-recovery-handoff.v1",ok:false,pending:true,retained:!!original,
    requestId:original?.requestId,leaseId:original?.id,revision:original?.revision,error:String(error?.message??error)}}
}

// Freeze productive user input only for the finite native-owned capture lease.
// Backend writes still require the independent native DOM/extension barriers.
if(typeof window!=="undefined")for(const type of ["beforeinput","paste","drop","keydown","click","submit","compositionstart"])
  window.addEventListener(type,event=>{if(auxDraftMigrationLease&&auxDraftMigrationLease.phase!=="releasing"&&!auxDraftMigrationFlushing){event.preventDefault();event.stopImmediatePropagation()}},true);

export{k as a,W as c,F as i,J as l,U as n,$ as o,b as r,X as s,H as t,j as u,auxCaptureDraftMigration,auxPrepareDraftMigrationCapture,auxPrepareDraftMigrationRecoveryCapture,auxValidateDraftMigrationCapture,auxSealDraftMigrationCapture,auxObserveDraftMigrationTarget,auxReadDraftMigrationCapture,auxReleaseDraftMigrationCapture,auxRegisterDraftMigrationOwner,auxBeginDraftMigrationWork,auxDraftMigrationBlocked,auxDraftMigrationChanged,auxGetNewtabDraftSettingsOwner,auxDraftMigrationRecoveryApplying,auxDraftRecoveryDraftForScope,auxDraftRecoverySettingsForScope,auxAdoptDraftMigrationRecovery,auxReadDraftMigrationRecoveryAdoption,auxHandoffDraftMigrationRecovery,auxReadDraftMigrationRecoveryHandoff};

//# chunkId=dc29686c-6219-5808-a0c8-7bc52066a228