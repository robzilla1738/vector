import { bridge } from "../bridge";
import { browserSourcesKey, readBrowserSources, writeBrowserSources } from "../browser-context-sources";
import {
  NEW_DRAFT_KEY,
  draftKey,
  readConversationContexts,
  readConversationDrafts,
  writeConversationEntry,
} from "../conversation-drafts";
import { readRunAnswerDrafts, writeRunAnswerDraft } from "../run-answer-drafts";
import { draftWriter, storage, warnDraftStorage } from "./persistence";
import type { DraftKeys, Slice, Workspace } from "./types";

const temporaryDraft = (state: Workspace, key: string) =>
  bridge.privateMode || state.composerPreferences[key]?.privateTask === true;
const draftStorage = bridge.privateMode ? null : storage;

export const createDraftsSlice: Slice<DraftKeys> = (set, get) => ({
  conversationContexts: readConversationContexts(draftStorage),
  conversationBrowserSources: readBrowserSources(bridge.privateMode ? null : storage),
  setConversationContext: (id, pageId) => {
    const contexts = { ...get().conversationContexts };
    const key = id ? draftKey(id) : "new";
    if (pageId) contexts[key] = pageId;
    else delete contexts[key];
    set({ conversationContexts: contexts });
    try {
      writeConversationEntry(draftStorage, "context", key, temporaryDraft(get(), key) ? "" : (pageId ?? ""));
    } catch {
      warnDraftStorage("Your composer context is kept in this window, but could not be saved for restart.");
    }
  },
  setConversationBrowserSources: (id, sources) => {
    const key = browserSourcesKey(id);
    set((state) => {
      const selected = { ...state.conversationBrowserSources };
      if (sources.length) selected[key] = sources;
      else delete selected[key];
      return { conversationBrowserSources: selected };
    });
    try {
      writeBrowserSources(draftStorage, key, temporaryDraft(get(), key) ? [] : sources);
    } catch {
      warnDraftStorage("Your selected tabs are kept in this window, but could not be saved for restart.");
    }
  },
  runAnswerDrafts: readRunAnswerDrafts(bridge.privateMode ? null : storage),
  setRunAnswerDraft: (runId, question, text) => {
    const run = get().runs.find((item) => item.runId === runId);
    const draft = { question, text: text.slice(0, 20000), chatId: run?.config?.chatId ?? runId };
    set((state) => {
      const drafts = { ...state.runAnswerDrafts };
      if (draft.text) drafts[runId] = draft;
      else delete drafts[runId];
      return { runAnswerDrafts: drafts };
    });
    try {
      writeRunAnswerDraft(
        draftStorage,
        runId,
        temporaryDraft(get(), draftKey(draft.chatId)) || run?.config?.privateTask ? null : draft,
      );
    } catch {
      warnDraftStorage("Your answer is kept in this window, but could not be saved for restart.");
    }
  },
  agentDraft: readConversationDrafts(draftStorage)[NEW_DRAFT_KEY] ?? "",
  setAgentDraft: (text) => {
    const drafts = { ...get().conversationDrafts };
    if (text) drafts[NEW_DRAFT_KEY] = text;
    else delete drafts[NEW_DRAFT_KEY];
    set({ agentDraft: text, conversationDrafts: drafts });
    draftWriter.write("draft", NEW_DRAFT_KEY, temporaryDraft(get(), NEW_DRAFT_KEY) ? "" : text);
  },
  composerPreferences: {},
  setComposerPreferences: (key, value) => {
    set((state) => ({ composerPreferences: { ...state.composerPreferences, [key]: value } }));
    if (temporaryDraft(get(), key)) {
      // Retire any normal draft before this composer becomes temporary.
      draftWriter.write("draft", key, "");
      draftWriter.flush();
      try {
        writeConversationEntry(draftStorage, "context", key, "");
        writeBrowserSources(draftStorage, key, []);
      } catch {
        warnDraftStorage(
          "The saved copy of this draft could not be removed. Your temporary reply stays in this window.",
        );
      }
    }
  },
  conversationDrafts: readConversationDrafts(draftStorage),
  setConversationDraft: (id, text) => {
    const drafts = { ...get().conversationDrafts };
    if (text) drafts[draftKey(id)] = text;
    else delete drafts[draftKey(id)];
    set({ conversationDrafts: drafts });
    draftWriter.write("draft", draftKey(id), temporaryDraft(get(), draftKey(id)) ? "" : text);
  },
});
