import type { ModelCall, Run } from "@aux/contracts";
import { bridge } from "../bridge";
import { PENDING_CHAT_KEY, draftKey } from "../conversation-drafts";
import { clearSubmittedRunAnswer } from "../run-answer-drafts";
import { errToast, toast } from "../store";
import { storage } from "./persistence";
import { call } from "./shared";
import type { RailView, RunKeys, RunModelStats, Slice, Workspace } from "./types";

export const emptyStats = (): RunModelStats => ({ calls: 0, costUsd: 0, costEstimated: false, inputTokens: 0, outputTokens: 0, modelIds: [], providers: [], destinations: [], costComplete: true });
export const modelAuxValue = (call: Partial<ModelCall> | undefined, key: "provider" | "destination") => {
  const aux = call?.providerMetadata?.aux;
  if (!aux || typeof aux !== "object" || Array.isArray(aux)) return undefined;
  const value = (aux as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
};

export const createRunsSlice: Slice<RunKeys> = (set, get) => ({
  sets: [],
  members: [],
  runs: [],
  sessions: [],
  programs: [],
  conversationId: null,
  openConversation: (runId) => {
    const run = get().runs.find(r => r.runId === runId);
    void bridge.overlay(false);
    set({ resultPreview: null, mode: "conversation", conversationId: run ? run.config?.chatId ?? run.runId : null, railOpen: false, overlay: null, ...(run?{}:{railView:{kind:"home"} as RailView}) });
  },
  openConversationDraft: (chatId) => {
    try {
      if (chatId) storage?.setItem(PENDING_CHAT_KEY, chatId);
      else storage?.removeItem(PENDING_CHAT_KEY);
    } catch { /* Drafts remain available in this window. */ }
    void bridge.overlay(false);
    set({ resultPreview: null, mode: "conversation", conversationId: chatId, railOpen: false, overlay: null });
  },
  activeSetId: null,
  results: [],
  steps: {},
  modelStats: {},
  observations: {},
  prompt: null,
  runAnswerPending: {},
  retryingRuns: {},
  settings: {},
  pendingTurns: [],
  answerStreams: {},
  startRun: async (goal, opts = {}) => {
    const g = goal.trim();
    if (!g) return null;
    const before = get();
    const originPage = before.pages.find(page => page.pageId === before.activePageId);
    const stayed = () => {
      const current = get();
      const page = current.pages.find(page => page.pageId === before.activePageId);
      return current.mode === before.mode && current.conversationId === before.conversationId
        && current.activePageId === before.activePageId && current.railView === before.railView
        && current.overlay === before.overlay && current.railOpen === before.railOpen
        && current.layout.activeSpaceId === before.layout.activeSpaceId
        && page?.url === originPage?.url && page?.documentEpoch === originPage?.documentEpoch;
    };
    const existingChat = opts.chatId && before.runs.some(r => (r.config?.chatId ?? r.runId) === opts.chatId);
    const hasChatDraft = !!opts.chatId && Object.prototype.hasOwnProperty.call(before.conversationDrafts, draftKey(opts.chatId));
    const preserveDraft = () => {
      if (opts.ownsDraft) return;
      if ((existingChat || hasChatDraft) && opts.chatId) {
        const key = draftKey(opts.chatId);
        if (get().conversationDrafts[key] === before.conversationDrafts[key]) get().setConversationDraft(opts.chatId, g);
      } else if (get().agentDraft === before.agentDraft) get().setAgentDraft(g);
      else get().setConversationDraft(opts.chatId ?? crypto.randomUUID(), g);
    };
    if (before.settings.modelConfigured === false) {
      preserveDraft();
      set({ overlay: "settings", settingsCategory: "Models", railOpen: true });
      toast("Set up a model connection before starting the agent. Your prompt is kept.");
      return null;
    }
    const pending = { id: crypto.randomUUID(), chatId: opts.chatId ?? null, goal: g, createdAt: Date.now() };
    set(state => ({ pendingTurns: [...state.pendingTurns, pending] }));
    const settle = (runs?: (state: Workspace) => Run[]) => set(state => ({ pendingTurns: state.pendingTurns.filter(turn => turn !== pending), ...(runs ? { runs: runs(state) } : {}) }));
    try {
      let pageId = opts.pageId === undefined ? opts.pageIds?.[0] ?? before.activePageId : opts.pageId;
      if (opts.scope === "new" || !pageId) {
        const page = await get().openBackgroundTab("about:blank", before.layout.activeSpaceId, false);
        pageId = page.pageId;
      }
      const n = Number(before.settings.maxModelCalls);
      const budget = n === 0 ? 0 : Math.min(256, Math.max(1, Number.isFinite(n) ? n : 8));
      const pageIds = [...new Set([...(pageId ? [pageId] : []), ...(opts.pageIds ?? [])])];
      const run = await call("runs.start", { goal: g, pageIds: pageIds.length ? pageIds : undefined,
        contextPageRefs: opts.contextPageRefs,
        maxModelCalls: budget, chatId: opts.chatId,
        defaultWorkspaceId: bridge.privateMode ? undefined : before.layout.spaces.find(space => space.id === before.layout.activeSpaceId)?.workspaceId });
      const reveal = stayed();
      settle(state => state.runs.some(item => item.runId === run.runId) ? state.runs : [run, ...state.runs]);
      if (!opts.ownsDraft && !existingChat && !hasChatDraft && get().agentDraft === before.agentDraft) get().setAgentDraft("");
      if (reveal) {
        if (opts.presentation === "conversation") get().openConversation(run.runId);
        else set({ railOpen: true, railView: { kind: "run", runId: run.runId } });
      } else toast("Started in the background. Find it in Chats.");
      return run;
    } catch (error) {
      settle();
      preserveDraft();
      errToast(error);
      return null;
    }
  },

  retryRun: async (runId, pageId) => {
    if(get().retryingRuns[runId])return null;
    const before=get();
    set(state=>({retryingRuns:{...state.retryingRuns,[runId]:true}}));
    try {
      const run = await call("runs.retry", { runId, ...(pageId ? {pageId} : {}) });
      const current=get();
      const stayed=current.mode===before.mode && current.conversationId===before.conversationId
        && current.activePageId===before.activePageId && current.railView===before.railView
        && current.overlay===before.overlay && current.railOpen===before.railOpen;
      set((s) => ({ runs: s.runs.some((item) => item.runId === run.runId) ? s.runs : [run, ...s.runs] }));
      if(stayed) {
        set({railOpen:true,railView:{kind:"run",runId:run.runId}});
        get().openConversation(run.runId);
      } else toast("Retry started. It’s available in your conversation.");
      return run;
    } catch (error) {
      errToast(error);
      return null;
    } finally {
      set(state=>{const pending={...state.retryingRuns};delete pending[runId];return {retryingRuns:pending};});
    }
  },

  answerRun: async (runId, answer) => {
    if(get().runAnswerPending[runId])return;
    const prompt = get().prompt;
    const draft = get().runAnswerDrafts[runId];
    set(state=>({runAnswerPending:{...state.runAnswerPending,[runId]:true}}));
    try {
      await call("runs.answer", { runId, answer });
      try { clearSubmittedRunAnswer(bridge.privateMode ? null : storage,runId,draft); }
      catch { toast("Your answer was sent, but its saved draft could not be cleared.","error"); }
      set(state=>{
        const drafts={...state.runAnswerDrafts};
        if(drafts[runId]===draft)delete drafts[runId];
        return {runAnswerDrafts:drafts,...(state.prompt===prompt && prompt?.runId===runId ? {prompt:null} : {})};
      });
    } finally {
      set(state=>{const pending={...state.runAnswerPending};delete pending[runId];return {runAnswerPending:pending};});
    }
  },

  returnControl: async (pageId) => {
    await call("pages.resume", { pageId }).catch(errToast);
  },

  loadRun: async (runId) => {
    try {
      const d = await call("runs.get", { runId });
      set((s) => ({
        runs: s.runs.some((r) => r.runId === runId) ? s.runs.map((r) => (r.runId === runId ? d.run : r)) : [d.run, ...s.runs],
        steps: { ...s.steps, [runId]: d.steps },
        modelStats:
          d.modelCalls != null && !s.modelStats[runId]
            ? { ...s.modelStats, [runId]: d.usage ? { calls: d.usage.calls, modelIds: d.usage.modelIds, providers: d.usage.providers, destinations: d.usage.destinations, inputTokens: d.usage.inputTokens, outputTokens: d.usage.outputTokens, costUsd: d.usage.knownCostUsd, costEstimated: !d.usage.costComplete, costComplete: d.usage.costComplete } : { ...emptyStats(), calls: d.modelCalls } }
            : s.modelStats,
      }));
    } catch (e) {
      errToast(e);
    }
  },

  refreshResults: async (setId) => {
    const results = await call("sets.results", { setId });
    set({ results, activeSetId: setId });
  },
});
