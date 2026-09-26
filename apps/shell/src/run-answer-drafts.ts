export type RunAnswerDraft = { question: string; text: string; chatId?:string };
export const RUN_ANSWER_PREFIX = "aux.run-answer.v1:";
const validId = (id:string) => id.length > 0 && id.length <= 200 && !/[\s/\\]/.test(id);
export function runAnswerEntry(key:string|null,value:string|null):{runId:string;draft:RunAnswerDraft|null}|null {
  if(!key?.startsWith(RUN_ANSWER_PREFIX))return null;
  const runId=key.slice(RUN_ANSWER_PREFIX.length);
  if(!validId(runId))return null;
  if(!value)return {runId,draft:null};
  try {
    const draft:unknown=JSON.parse(value);
    if(!draft || typeof draft!=="object" || !("question" in draft) || !("text" in draft)
      || typeof draft.question!=="string" || draft.question.length>100000 || typeof draft.text!=="string" || draft.text.length>20000)return null;
    return {runId,draft:draft.text ? {question:draft.question,text:draft.text,...("chatId" in draft && typeof draft.chatId==="string" && validId(draft.chatId) ? {chatId:draft.chatId} : {})} : null};
  } catch { return null; }
}
export function readRunAnswerDrafts(storage:Storage|null):Record<string,RunAnswerDraft> {
  const drafts:Record<string,RunAnswerDraft>={};
  try {
    for(let index=0;storage && index<storage.length;index++) {
      const key=storage.key(index);
      const entry=runAnswerEntry(key,key ? storage.getItem(key) : null);
      if(entry?.draft)drafts[entry.runId]=entry.draft;
    }
  } catch { /* Available drafts remain usable if storage becomes unavailable. */ }
  return drafts;
}
export function writeRunAnswerDraft(storage:Storage|null,runId:string,draft:RunAnswerDraft|null) {
  if(!validId(runId))throw new Error("Invalid answer draft identity.");
  if(draft?.text)storage?.setItem(RUN_ANSWER_PREFIX+runId,JSON.stringify(draft));
  else storage?.removeItem(RUN_ANSWER_PREFIX+runId);
}
/** A successful send must not erase a reply edited in another window while in flight. */
export function clearSubmittedRunAnswer(storage:Storage|null,runId:string,draft:RunAnswerDraft|undefined) {
  if(!storage || !draft)return;
  const key=RUN_ANSWER_PREFIX+runId;
  const current=runAnswerEntry(key,storage.getItem(key))?.draft;
  if(current?.question===draft.question && current.text===draft.text)storage.removeItem(key);
}
