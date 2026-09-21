import type { PreparedConversation, Run } from "@vector/contracts";
/** Drafts belong to durable chat IDs, including the run ID of legacy chats. */
export const DRAFTS_KEY = "aux.conversation-drafts.v1";
export const CONTEXTS_KEY = "aux.conversation-contexts.v1";
export const NEW_DRAFT_KEY = "new";
export const PENDING_CHAT_KEY = "aux.pending-conversation.v1";
export const draftKey = (id: string) => `chat:${id}`;
export function readPendingConversation(storage: Pick<Storage, "getItem"> | null): string | null {
  const value = storage?.getItem(PENDING_CHAT_KEY) ?? "";
  return value.length > 0 && value.length <= 200 && !/[\s/\\]/.test(value) ? value : null;
}
export function readConversationDrafts(storage: EntryStorage | null): Record<string, string> {
  try {
    const value: unknown = readLegacyMap(storage,DRAFTS_KEY);
    const legacy = value && typeof value === "object" && !Array.isArray(value) ? Object.fromEntries(Object.entries(value).filter(([key, draft]) => validKey(key) && typeof draft === "string")) : {};
    return overlayEntries(storage,DRAFT_ENTRY_PREFIX,legacy,()=>true);
  } catch { return {}; }
}
export function readConversationContexts(storage: EntryStorage | null): Record<string, string> {
  try {
    const value: unknown = readLegacyMap(storage,CONTEXTS_KEY);
    const legacy = value && typeof value === "object" && !Array.isArray(value) ? Object.fromEntries(Object.entries(value).filter(([key, pageId]) => validKey(key) && typeof pageId === "string" && pageId.length <= 200)) : {};
    return overlayEntries(storage,CONTEXT_ENTRY_PREFIX,legacy,value=>value.length<=200);
  } catch { return {}; }
}

export const DRAFT_ENTRY_PREFIX = "aux.conversation-draft.v2:";
export const CONTEXT_ENTRY_PREFIX = "aux.conversation-context.v2:";
type EntryStorage = Pick<Storage,"getItem"> & Partial<Pick<Storage,"length"|"key">>;
const validKey = (key:string) => key === NEW_DRAFT_KEY || key.startsWith("chat:");

/** Per-conversation entries prevent unrelated windows from replacing a cached map. */
function overlayEntries(storage:EntryStorage|null, prefix:string, legacy:Record<string,string>, validate:(value:string)=>boolean) {
  if(!storage?.key || typeof storage.length!=="number")return legacy;
  const values={...legacy};
  for(let index=0;index<storage.length;index++) {
    const name:string|null=storage.key(index);
    if(!name?.startsWith(prefix))continue;
    const key=name.slice(prefix.length),value=storage.getItem(name);
    if(!validKey(key)||value===null||!validate(value))continue;
    if(value)values[key]=value;else delete values[key];
  }
  return values;
}
export function writeConversationEntry(storage:Pick<Storage,"setItem">|null, kind:"draft"|"context", key:string, value:string) {
  if(!validKey(key))throw new Error("Invalid conversation draft key.");
  // Empty entries are tombstones: old map data must not reappear after deletion.
  storage?.setItem(`${kind==="draft"?DRAFT_ENTRY_PREFIX:CONTEXT_ENTRY_PREFIX}${key}`,value);
}
export function conversationEntryChange(name:string|null,value:string|null) {
  const kind=name?.startsWith(DRAFT_ENTRY_PREFIX)?"draft":name?.startsWith(CONTEXT_ENTRY_PREFIX)?"context":null;
  if(!kind||!name)return null;
  const key=name.slice((kind==="draft"?DRAFT_ENTRY_PREFIX:CONTEXT_ENTRY_PREFIX).length);
  if(!validKey(key)||(kind==="context"&&(value?.length??0)>200))return null;
  return {kind,key,value:value??""};
}

function readLegacyMap(storage:Pick<Storage,"getItem">|null,key:string):unknown {
  try{return JSON.parse(storage?.getItem(key)??"{}");}catch{return {};}
}

/** One identity for a text draft and any snapshots prepared for the same chat. */
export function conversationDraftEntries(drafts: Record<string,string>, runs: Run[], prepared: PreparedConversation[]) {
  const snapshots = new Map(prepared.map(item => [item.chatId, item]));
  const keys = [...new Set([...Object.keys(drafts).reverse(), ...prepared.map(item => draftKey(item.chatId))])];
  return keys.filter(key => key === NEW_DRAFT_KEY || key.startsWith("chat:")).map(key => {
    const id = key === NEW_DRAFT_KEY ? null : key.slice(5);
    const text = drafts[key] ?? "";
    const run = runs.find(run => (run.config?.chatId ?? run.runId) === id);
    const saved = id ? snapshots.get(id) : undefined;
    return {key, id, text, count:saved?.attachmentCount ?? 0,
      title:run?.goal || text.split("\n").find(line => line.trim()) || saved?.title || "New conversation"};
  }).filter(item => item.text.trim() || item.count);
}
