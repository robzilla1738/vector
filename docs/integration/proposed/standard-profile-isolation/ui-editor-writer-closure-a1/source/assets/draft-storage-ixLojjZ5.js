!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e._posthogReleaseId=e._posthogReleaseId||"01a14421-bd0a-0000-3c62-ba3fbe2b6700";var n=(new e.Error).stack;n&&(e._posthogChunkIds=e._posthogChunkIds||{},e._posthogChunkIds[n]="dc29686c-6219-5808-a0c8-7bc52066a228")}catch(e){}}();import{t as p}from"./debounce-DNQ8gWSd.js";import{O as v,S as E,r as h,u as _}from"./schemas-Z5KNLPhp.js";import{t as P}from"./thinking-levels-DLuCdpvc.js";var l="aux.chat-draft.v3",I="aux.chat-draft-text.v1",D="new",m="aux.chat-pending-new-session-message.v2",R=15e3,C="aux.sidepanel-new-session-settings.v2";function b(e,n){let t=e,auxWriteResult;const r=p(o=>{auxWriteResult=n(o)},250);return{getDraft:()=>t,write:(o,s=!1)=>{t=o,r(t);r.flush();return auxWriteResult},flush:r.flush}}var a=null,auxPendingMessageDirty=!1;function O(e,n){return e??n??D}function f(){return typeof window>"u"?null:window.sessionStorage}function N(){return typeof window>"u"?null:window.localStorage}function y(e){return`${C}:${e}`}function c(e,n=l,t){return`${n}:${O(e,t)}`}function F(e,n){const auxKey=c(e,l,n);if(auxUnsavedDrafts.has(auxKey))return auxUnsavedDrafts.get(auxKey);const t=f(),r=N();if(!t&&!r)return null;try{const o=c(e,l,n),s=c(e,I,n),i=t?.getItem(o)??r?.getItem(o);if(i){const u=JSON.parse(i);if(u.version===2&&typeof u.plainText=="string")return u}const w=t?.getItem(s)??r?.getItem(s);return w?{version:2,plainText:w}:null}catch{return null}}var auxUnsavedDrafts=new Map,auxUnsavedDraftScopes=new Map,auxUnsavedDraftSettings=new Map,auxDraftUnload=e=>{e.preventDefault(),e.returnValue=""};function J(e,n,t){const s=c(e,l,t);let auxWriteScope=null;try{const r=f(),o=N(),auxDurable=(typeof e==="string"&&e.length>0||typeof t==="string"&&/^mini-popup-account:(?:0|[1-9][0-9]{0,15}):new$/.test(t)||typeof t==="string"&&/^(?:sidepanel-page|newtab-page):(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|p_[a-z0-9_]{6,126})$/.test(t));auxWriteScope=auxDurable;if(auxDraftMigrationBlocked())throw new Error("Aux draft capture is holding this document");if(auxDurable?!o:!r)throw new Error("Draft storage unavailable");const i=c(e,I,t);if(!n||n.plainText.length===0&&!n.attachments?.length){r?.removeItem(s),r?.removeItem(i),o?.removeItem(s),o?.removeItem(i)}else{const a=JSON.stringify(n);r?.setItem(s,a),r?.removeItem(i),auxDurable?o.setItem(s,a):o?.removeItem(s),o?.removeItem(i)}auxUnsavedDrafts.delete(s);auxUnsavedDraftScopes.delete(s);if(auxUnsavedDrafts.size===0&&typeof window!=="undefined")window.removeEventListener("beforeunload",auxDraftUnload);return true}catch{auxUnsavedDrafts.set(s,n);auxUnsavedDraftScopes.set(s,auxWriteScope);if(typeof window!=="undefined")window.addEventListener("beforeunload",auxDraftUnload);return false}}function $(e){const n=f();if(n)try{const t=n.getItem(y(e));if(!t)return;const r=JSON.parse(t);if(r.version!==1)return;const o=r.draftRuntimeConfig,s=o?.memoryExtractionDisabled===void 0&&o?.proactiveMode===void 0&&o?.finalConfirm===void 0&&o?.workingDirs===void 0?void 0:{memoryExtractionDisabled:o?.memoryExtractionDisabled??!1,proactiveMode:o?.proactiveMode??!1,finalConfirm:o?.finalConfirm??!1,workingDirs:o?.workingDirs??[]};return{version:1,draftModelOverride:E({provider:v(),modelId:v(),thinkingLevel:h(P),fastMode:_().catch(!1)}).nullable().catch(null).parse(r.draftModelOverride),draftPermissionMode:r.draftPermissionMode,draftRuntimeConfig:s,draftMode:r.draftMode,draftProjectId:r.draftProjectId??null}}catch{return}}function j(e,n){const t=f();if(t){const auxKey=y(e);let auxRaw;try{auxRaw=JSON.stringify({version:1,draftModelOverride:n.draftModelOverride,draftPermissionMode:n.draftPermissionMode,draftRuntimeConfig:n.draftRuntimeConfig,draftMode:n.draftMode,draftProjectId:n.draftProjectId});if(auxDraftMigrationBlocked())throw new Error("Aux draft capture is holding this document");t.setItem(auxKey,auxRaw);auxUnsavedDraftSettings.delete(auxKey)}catch{auxUnsavedDraftSettings.set(auxKey,auxRaw??null)}}}function W(e,n,t){return typeof window>"u"?!1:(S({sessionId:e,message:n,mode:t?.mode??"client-send"}),!0)}function k(e){if(typeof window>"u")return null;try{return M(e)?.message??null}catch{return d(),null}}function H(e){if(typeof window>"u"||auxDraftMigrationBlocked())return null;try{const n=M(e);if(!n||n.claimId&&!T(n))return null;const t=!!n.claimId,r=G();return S({sessionId:e,message:n.message,claimId:r,claimedAt:Date.now(),mode:n.mode??"client-send"}),{claimId:r,message:n.message,mode:n.mode??"client-send",wasReclaimed:t}}catch{return d(),null}}function U(e,n){if(!(typeof window>"u"))try{const t=g(e);if(!t?.message||t.sessionId!==e||t.claimId!==n)return;auxRememberDraftClaimAcknowledgement(t);d()}catch{d()}}function X(e,n){if(!(typeof window>"u"))try{const t=g(e);if(!t?.message||t.sessionId!==e||t.claimId!==n)return;S({sessionId:e,message:t.message,mode:t.mode})}catch{d()}}function g(e){if(a&&(!e||a.sessionId===e))return a;const n=window.sessionStorage.getItem(m);return n?JSON.parse(n):null}function M(e){const n=g();return!A(n)||n.sessionId!==e?null:n}function A(e){return!!e?.message}function T(e){return e.claimId?!e.claimedAt||Date.now()-e.claimedAt>R:!1}function S(e){a=e;try{if(auxDraftMigrationBlocked())throw new Error("Aux draft capture is holding this document");window.sessionStorage.setItem(m,JSON.stringify(e));auxPendingMessageDirty=!1}catch{auxPendingMessageDirty=!0}}function d(){a=null;try{if(auxDraftMigrationBlocked())throw new Error("Aux draft capture is holding this document");window.sessionStorage.removeItem(m);auxPendingMessageDirty=!1}catch{auxPendingMessageDirty=!0}}function G(){return typeof crypto.randomUUID=="function"?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`}function auxCaptureDraftMigration(){
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
  return !(a===null&&auxPendingMessageDirty&&auxDraftMigrationAckedClaim&&
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
function auxPrepareDraftMigrationCapture(requestId){
  if(typeof requestId!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(requestId))
    return{format:auxDraftMigrationFormat,ok:false,error:"A canonical capture request ID is required"};
  if(auxDraftMigrationLease)return{format:auxDraftMigrationFormat,ok:false,error:"This document already has a capture lease"};
  const lease={id:null,requestId,phase:"preparing",tainted:false,restores:[],signatures:[],captureJson:null,memoryJson:null,sealed:false,revision:0};
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
    auxDraftMigrationFlushing=true;
    try{for(const {owner} of owners){
      const result=owner.flush();
      if(result&&typeof result.then==="function"){auxDraftMigrationUnknownWork.add("async-flush");throw Error("Asynchronous editor flush is unsupported")}
    }}finally{auxDraftMigrationFlushing=false}
    if(auxDraftMigrationLease!==lease||lease.tainted||auxDraftMigrationWork.size||auxDraftMigrationUnknownWork.size||auxDraftMigrationOwnerOverflow||auxDraftMigrationOwners.size!==owners.length||auxDraftMigrationHasClaim())
      throw Error("Aux draft owners changed during capture");
    auxDraftMigrationCheckInputs();
    lease.signatures=owners.map(({owner})=>auxDraftMigrationSignature(owner));
    if(lease.signatures.reduce((size,value)=>size+value.length,0)>33554432)
      throw Error("Aux editor capture exceeds its aggregate bound");
    lease.memoryJson=auxDraftMigrationMemorySignature();
    lease.captureJson=auxDraftMigrationCaptureJson();
    if(auxDraftMigrationLease!==lease||lease.tainted)throw Error("Aux draft lease changed during capture");
    lease.revision=auxDraftMigrationRevision;lease.phase="held";
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
function auxObserveDraftMigrationTarget(leaseId,revision){
  const lease=auxDraftMigrationLease;
  try{
    auxAssertDraftMigrationOwners(leaseId,revision);
    if(!lease.sealed)throw Error("Aux target observation requires a sealed source lease");
    // Native alone compares these current bytes with its exact planned target.
    // Never reset the sealed source baseline or infer new mutation intentions.
    const {origin,sessionEntries,localEntries}=JSON.parse(auxDraftMigrationCaptureJson());
    auxAssertDraftMigrationOwners(leaseId,revision);
    return{format:auxDraftMigrationFormat,ok:true,requestId:lease.requestId,leaseId,revision,
      ownerCount:lease.signatures.length,sealed:true,stores:{origin,sessionEntries,localEntries}};
  }catch(error){return{format:auxDraftMigrationFormat,ok:false,requestId:lease?.requestId,
    leaseId:lease?.id,revision:lease?.revision,sealed:lease?.sealed??false,error:String(error?.message??error)}}
}
function auxReadDraftMigrationCapture(){
  const lease=auxDraftMigrationLease;
  if(!lease)return auxDraftMigrationLastRelease?{...auxDraftMigrationLastRelease}:
    {format:auxDraftMigrationFormat,ok:false,retained:false,error:"No retained Aux draft capture"};
  if(lease.phase!=="held")return{format:auxDraftMigrationFormat,ok:false,retained:true,requestId:lease.requestId,leaseId:lease.id,revision:lease.revision,sealed:lease.sealed,error:"Aux draft capture owner is changing"};
  const current=auxValidateDraftMigrationCapture(lease.id,lease.revision);
  if(!current.ok)return{...current,retained:true,requestId:lease.requestId,leaseId:lease.id,revision:lease.revision};
  return{format:auxDraftMigrationFormat,ok:true,retained:true,requestId:lease.requestId,leaseId:lease.id,revision:lease.revision,
    ownerCount:lease.signatures.length,sealed:lease.sealed,capture:JSON.parse(lease.captureJson)};
}
function auxSealDraftMigrationCapture(leaseId,revision){
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
    return auxReadDraftMigrationCapture();
  }catch(error){return{format:auxDraftMigrationFormat,ok:false,retained:true,requestId:lease.requestId,
    leaseId:lease.id,revision:lease.revision,sealed:lease.sealed,error:String(error?.message??error)}}
}
function auxReleaseDraftMigrationCapture(leaseId){
  const lease=auxDraftMigrationLease;
  if(!lease||lease.id!==leaseId)return{format:auxDraftMigrationFormat,ok:false,released:false,error:"Aux draft capture lease changed"};
  const restored=auxDraftMigrationRelease(lease);
  return{format:auxDraftMigrationFormat,ok:restored,requestId:lease.requestId,leaseId:lease.id,
    revision:lease.revision,released:restored,retained:!restored,restored};
}
// Freeze productive user input only for the finite native-owned capture lease.
// Backend writes still require the independent native DOM/extension barriers.
if(typeof window!=="undefined")for(const type of ["beforeinput","paste","drop","keydown","click","submit","compositionstart"])
  window.addEventListener(type,event=>{if(auxDraftMigrationLease&&auxDraftMigrationLease.phase!=="releasing"&&!auxDraftMigrationFlushing){event.preventDefault();event.stopImmediatePropagation()}},true);

export{k as a,W as c,F as i,J as l,U as n,$ as o,b as r,X as s,H as t,j as u,auxCaptureDraftMigration,auxPrepareDraftMigrationCapture,auxValidateDraftMigrationCapture,auxSealDraftMigrationCapture,auxObserveDraftMigrationTarget,auxReadDraftMigrationCapture,auxReleaseDraftMigrationCapture,auxRegisterDraftMigrationOwner,auxBeginDraftMigrationWork,auxDraftMigrationBlocked,auxDraftMigrationChanged,auxGetNewtabDraftSettingsOwner};

//# chunkId=dc29686c-6219-5808-a0c8-7bc52066a228