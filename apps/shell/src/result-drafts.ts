import { bridge } from "./bridge";

export type ResultDraft = {chatId:string;content:string;source:string};
const drafts = new Map<string,ResultDraft>();
const PREFIX="aux.result-draft.v1:";
const key = (id:string) => `${PREFIX}${bridge.windowId}:${id}`;
const idFromKey=(name:string)=>name.slice(name.lastIndexOf(":")+1);
export function readResultDraft(id:string):ResultDraft|null {
  if(drafts.has(id))return drafts.get(id)!;
  if(bridge.privateMode)return null;
  try {
    const value=JSON.parse(localStorage.getItem(key(id))??"null");
    if(value && typeof value.chatId==="string" && typeof value.content==="string" && typeof value.source==="string"
      && value.content.length<=262144 && value.source.length<=262144) {
      drafts.set(id,value);return value;
    }
  } catch { /* The original result remains available if draft storage is unreadable. */ }
  return null;
}
export function writeResultDraft(id:string,draft:ResultDraft|null):boolean {
  if(draft)drafts.set(id,draft);else drafts.delete(id);
  if(bridge.privateMode)return true;
  try { if(draft)localStorage.setItem(key(id),JSON.stringify(draft));else localStorage.removeItem(key(id));return true; }
  catch { return false; }
}

export function clearResultDrafts(chatId:string):boolean {
  for(const [id,draft] of drafts)if(draft.chatId===chatId)drafts.delete(id);
  if(bridge.privateMode)return true;
  let saved=true;
  const names:string[]=[];
  try {
    for(let index=0;index<localStorage.length;index++) {
      const name=localStorage.key(index);
      if(name?.startsWith("aux.result-draft.v1:")) {
        try { if(JSON.parse(localStorage.getItem(name)??"null")?.chatId===chatId)names.push(name); } catch { /* Ignore unrelated malformed entries. */ }
      }
    }
    for(const name of names)try {localStorage.removeItem(name);}catch{saved=false;}
  } catch { saved=false; }
  return saved;
}

/** A runtime revocation reaches every open window, including windows not showing the result. */
export function revokeResultDrafts(artifactIds:string[]):boolean {
  const revoked=new Set(artifactIds);
  for(const id of revoked)drafts.delete(id);
  if(bridge.privateMode)return true;
  let saved=true;
  try {
    const names:string[]=[];
    for(let index=0;index<localStorage.length;index++){
      const name=localStorage.key(index);
      if(name?.startsWith(PREFIX)&&revoked.has(idFromKey(name)))names.push(name);
    }
    for(const name of names)try{localStorage.removeItem(name);}catch{saved=false;}
  }catch{saved=false;}
  return saved;
}

/** Catches revocations made while this renderer was closed or disconnected. */
export async function reconcileResultDrafts(check:(drafts:{artifactId:string;chatId:string}[])=>Promise<string[]>):Promise<{checked:number;removed:number}> {
  if(bridge.privateMode)return {checked:0,removed:0};
  const entries:{artifactId:string;chatId:string}[]=[];
  try {
    for(let index=0;index<localStorage.length;index++){
      const name=localStorage.key(index);
      if(!name?.startsWith(PREFIX))continue;
      const value=JSON.parse(localStorage.getItem(name)??"null") as Partial<ResultDraft>|null;
      if(value&&typeof value.chatId==="string")entries.push({artifactId:idFromKey(name),chatId:value.chatId});
    }
  }catch{return {checked:0,removed:0};}
  let removed=0;
  for(let offset=0;offset<entries.length;offset+=100){
    const batch=entries.slice(offset,offset+100);
    // A transport failure must not erase a human's drafts.
    const available=new Set(await check(batch));
    const missing=[...new Set(batch.filter(item=>!available.has(item.artifactId)).map(item=>item.artifactId))];
    if(!revokeResultDrafts(missing))throw new Error("A saved result draft could not be removed from this browser.");
    removed+=missing.length;
  }
  return {checked:entries.length,removed};
}
