import { bridge } from "../bridge";
import { NEW_DRAFT_KEY, draftKey, readConversationContexts, readConversationDrafts, writeConversationEntry } from "../conversation-drafts";
import { readRunAnswerDrafts, writeRunAnswerDraft } from "../run-answer-drafts";
import { draftWriter, storage, warnDraftStorage } from "./persistence";
import type { DraftKeys, Slice } from "./types";

export const createDraftsSlice: Slice<DraftKeys> = (set, get) => ({
  conversationContexts: readConversationContexts(storage),
  setConversationContext: (id,pageId) => {
    const contexts={...get().conversationContexts};const key=id?draftKey(id):"new";
    if(pageId)contexts[key]=pageId;else delete contexts[key];set({conversationContexts:contexts});
    try{writeConversationEntry(storage,"context",key,pageId??"");}
    catch{warnDraftStorage("Your composer context is kept in this window, but could not be saved for restart.")}
  },
  runAnswerDrafts: readRunAnswerDrafts(bridge.privateMode ? null : storage),
  setRunAnswerDraft: (runId,question,text) => {
    const run=get().runs.find(item=>item.runId===runId);
    const draft={question,text:text.slice(0,20000),chatId:run?.config?.chatId ?? runId};
    set(state=>{const drafts={...state.runAnswerDrafts};if(draft.text)drafts[runId]=draft;else delete drafts[runId];return {runAnswerDrafts:drafts};});
    try { writeRunAnswerDraft(bridge.privateMode ? null : storage,runId,draft); }
    catch { warnDraftStorage("Your answer is kept in this window, but could not be saved for restart.") }
  },
  agentDraft: readConversationDrafts(storage)[NEW_DRAFT_KEY] ?? "",
  setAgentDraft: text => {
    const drafts={...get().conversationDrafts};if(text)drafts[NEW_DRAFT_KEY]=text;else delete drafts[NEW_DRAFT_KEY];set({agentDraft:text,conversationDrafts:drafts});
    draftWriter.write("draft",NEW_DRAFT_KEY,text);
  },
  conversationDrafts: readConversationDrafts(storage),
  setConversationDraft: (id, text) => {
    const drafts = { ...get().conversationDrafts };
    if (text) drafts[draftKey(id)] = text;
    else delete drafts[draftKey(id)];
    set({ conversationDrafts: drafts });
    draftWriter.write("draft",draftKey(id),text);
  },
});
