import { bridge } from "./bridge";

export type ResultDraft = {chatId:string;content:string;source:string};
const drafts = new Map<string,ResultDraft>();
const key = (id:string) => `aux.result-draft.v1:${bridge.windowId}:${id}`;
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
