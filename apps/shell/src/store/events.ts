import type { AuxEvent, BrowserSession, BrowserSpace, CompactObservation, Download, ModelCall, PageSet, PageTarget, ResultRecord, Run, SetMember, StepRecord } from "@aux/contracts";
import { bridge } from "../bridge";
import { setDictationDraft } from "../dictation-drafts";
import { clearResultDrafts, revokeResultDrafts } from "../result-drafts";
import { writeRunAnswerDraft } from "../run-answer-drafts";
import { assignFolder, assignSpace, rememberActiveTab, setActiveSpace, splitForPage, syncLayout, tabsInSpace, withSyncedOrder, type Layout } from "../workspace";
import { HOME_DRAFT_CHAT_KEY, PENDING_CHAT_KEY, draftKey } from "../conversation-drafts";
import { persistLayout, storage } from "./persistence";
import { emptyStats, modelAuxValue } from "./runs-slice";
import { answerSeq, applyRemoval, closingOptimistic, forgetPreview, pageRevisions, patchPage, previewCache, sendTabCommand } from "./shared";
import { isLive, type Workspace } from "./types";
import { errToast, toast } from "../store";

/** A pure state transition for one event domain; null when the event is not this domain's. */
type Reducer = (state: Workspace, e: AuxEvent) => Partial<Workspace> | null;
type Set = (partial: Partial<Workspace> | ((state: Workspace) => Partial<Workspace>)) => void;

const upsertBy = <T, K extends keyof T>(items: T[], item: T, key: K) =>
  items.some(x => x[key] === item[key]) ? items.map(x => (x[key] === item[key] ? item : x)) : [...items, item];

export const reduceRunEvent: Reducer = (state, e) => {
  switch (e.type) {
    case "safety.confirmation": {
      const { approvalId, turnId, instruction, action, origin } = e.payload;
      if (typeof approvalId !== "string" || typeof turnId !== "string" || typeof instruction !== "string") return {};
      return {
        confirmation: {
          approvalId,
          turnId,
          instruction,
          action: typeof action === "string" ? action : "action",
          origin: typeof origin === "string" ? origin : "",
        },
      };
    }
    case "run.updated":
    case "run.status": {
      const run = e.payload.run as Run | undefined;
      if (!run) return {};
      const settled = !isLive(run) && run.runId in state.answerStreams;
      return {
        runs: state.runs.some((r) => r.runId === run.runId) ? state.runs.map((r) => (r.runId === run.runId ? run : r)) : [run, ...state.runs],
        ...(settled ? { answerStreams: Object.fromEntries(Object.entries(state.answerStreams).filter(([id]) => id !== run.runId)) } : {}),
        ...(run.status === "needs_input" && run.statusMessage
          ? { prompt: { runId: run.runId, question: run.statusMessage }, railOpen: true, railView: { kind: "run" as const, runId: run.runId } }
          : state.prompt?.runId === run.runId ? { prompt: null } : {}),
      };
    }
    case "step.finished": {
      const step = e.payload.step as StepRecord | undefined;
      if (!step) return {};
      const existing = state.steps[step.runId] ?? [];
      const merged = existing.some((x) => x.stepId === step.stepId) ? existing.map((x) => (x.stepId === step.stepId ? step : x)) : [...existing, step];
      return { steps: { ...state.steps, [step.runId]: merged } };
    }
    case "observation.new": {
      // keep the live run's observation fresh without a round trip when the payload carries it
      const { runId, observation } = e.payload as { runId?: string; observation?: CompactObservation };
      return runId && observation && typeof observation.text === "string" ? { observations: { ...state.observations, [runId]: observation } } : {};
    }
    case "model.call": {
      const mc = e.payload as Partial<ModelCall> | undefined;
      const runId = mc?.runId ?? e.runId;
      if (!runId) return {};
      const cur = state.modelStats[runId] ?? emptyStats();
      return {
        modelStats: {
          ...state.modelStats,
          [runId]: {
            calls: cur.calls + 1,
            costUsd: cur.costUsd + (mc?.costUsd ?? 0),
            costEstimated: cur.costEstimated || !!mc?.costEstimated,
            inputTokens: cur.inputTokens + (mc?.inputTokens ?? 0),
            outputTokens: cur.outputTokens + (mc?.outputTokens ?? 0),
            modelIds: [...new Set([...cur.modelIds, ...(mc?.modelId ? [mc.modelId] : [])])],
            providers: [...new Set([...cur.providers, modelAuxValue(mc, "provider")].filter((value): value is string => !!value))],
            destinations: [...new Set([...cur.destinations, modelAuxValue(mc, "destination")].filter((value): value is string => !!value))],
            costComplete: cur.costComplete && mc?.costUsd !== undefined && !mc.costEstimated,
          },
        },
      };
    }
  }
  return null;
};

export const reducePageEvent: Reducer = (state, e) => {
  switch (e.type) {
    case "page.added":
    case "page.updated": {
      let next: Pick<Workspace, "pages" | "layout"> = state;
      const p = e.payload.page as PageTarget | undefined;
      if (p) {
        const index = state.pages.findIndex((x) => x.pageId === p.pageId);
        // An update to a known page never changes order or Space assignment.
        if (index >= 0) next = { ...next, pages: state.pages.with(index, p) };
        else if (!closingOptimistic.has(p.pageId)) {
          const pages = [...state.pages, p];
          next = { pages, layout: state.restoringTabs ? state.layout : syncLayout(state.layout, pages, state.pendingRestoreIds) };
        }
      } else if (typeof e.payload.pageId === "string") {
        const { pageId, ...patch } = e.payload as { pageId: string } & Partial<PageTarget>;
        const fields = Object.fromEntries(Object.entries(patch).filter(([k]) => k !== "activePageId")) as Partial<PageTarget>;
        if (Object.keys(fields).length) next = { ...next, ...patchPage(next, pageId, fields) };
      }
      if (!("activePageId" in e.payload)) return { pages: next.pages, layout: next.layout };
      const ap = e.payload.activePageId as string | null;
      const layout = rememberActiveTab(next.layout, ap);
      return { pages: next.pages, layout, activePageId: ap, splitPageId: splitForPage(layout, next.pages, ap) };
    }
    case "page.crashed": {
      const { pageId } = e.payload as { pageId: string };
      return { pages: state.pages.map((p) => (p.pageId === pageId ? { ...p, viewStatus: "crashed", loading: false, error: "The renderer process crashed." } : p)) };
    }
    case "page.loading": {
      const { pageId, loading } = e.payload as { pageId: string; loading: boolean };
      return patchPage(state, pageId, { loading });
    }
    case "page.takeover": {
      const { pageId, controller } = e.payload as { pageId: string; controller: string };
      return patchPage(state, pageId, { controller: controller as PageTarget["controller"] });
    }
  }
  return null;
};

export const reduceLibraryEvent: Reducer = (state, e) => {
  switch (e.type) {
    case "set.updated": {
      const updated = e.payload.set as PageSet | undefined;
      return updated ? { sets: upsertBy(state.sets, updated, "setId") } : {};
    }
    case "member.updated": {
      const m = e.payload.member as SetMember | undefined;
      return m ? { members: upsertBy(state.members, m, "memberId") } : {};
    }
    case "session.changed": {
      const sess = e.payload.session as BrowserSession | undefined;
      return sess ? { sessions: upsertBy(state.sessions, sess, "sessionId") } : {};
    }
    case "downloads.removed": {
      const ids = new Set(Array.isArray(e.payload.ids) ? e.payload.ids : []);
      return { downloads: state.downloads.filter(item => !ids.has(item.id)) };
    }
    case "download.started":
    case "download.finished": {
      const d = e.payload as Download;
      return d.id ? { downloads: [d, ...state.downloads.filter((x) => x.id !== d.id)].slice(0, 200) } : {};
    }
    case "settings.changed": {
      const settings = e.payload.settings as Record<string, unknown> | undefined;
      return settings ? { settings } : {};
    }
    case "bookmarks.changed": {
      const bookmarks = e.payload.bookmarks as { url: string; title: string }[] | undefined;
      return bookmarks ? { bookmarks } : {};
    }
  }
  return null;
};

/**
 * What an event does beyond its state transition: toasts, runtime commands,
 * refreshes, storage cleanup and the non-reactive caches. Runs after the
 * reducers' state is applied unless the effect owns the whole event.
 */
export function eventEffects(e: AuxEvent, s: Workspace, set: Set, get: () => Workspace) {
  switch (e.type) {
    case "results.revoked": {
      const ids=Array.isArray(e.payload.artifactIds)?e.payload.artifactIds.filter((id):id is string=>typeof id==="string"):[];
      if(!revokeResultDrafts(ids))toast("A saved result draft could not be removed from this browser.","error");
      if(s.resultPreview&&ids.includes(s.resultPreview))set({resultPreview:null});
      break;
    }
    case "conversation.deleted": {
      const chatId=e.payload.chatId;
      if(typeof chatId!=="string")break;
      const removed=new Set(s.runs.filter(run=>(run.config?.chatId??run.runId)===chatId).map(run=>run.runId));
      for(const [runId,draft] of Object.entries(s.runAnswerDrafts))if(draft.chatId===chatId)removed.add(runId);
      get().setConversationDraft(chatId,"");get().setConversationContext(chatId,"");get().setConversationBrowserSources(chatId,[]);
      if(!clearResultDrafts(chatId))toast("An edited result draft could not be removed from this browser.","error");
      setDictationDraft(draftKey(chatId), "");
      for(const runId of removed)try { writeRunAnswerDraft(bridge.privateMode ? null : storage,runId,null); } catch { toast("A saved answer draft could not be removed from this browser.","error"); }
      try { if(storage?.getItem(HOME_DRAFT_CHAT_KEY)===chatId)storage.removeItem(HOME_DRAFT_CHAT_KEY);if(storage?.getItem(PENDING_CHAT_KEY)===chatId)storage.removeItem(PENDING_CHAT_KEY);if(storage?.getItem("aux.quick-ask.chat")===chatId)storage.removeItem("aux.quick-ask.chat"); } catch { /* The open view still discards the deleted identity. */ }
      const active=s.conversationId===chatId;
      set(state=>({runs:state.runs.filter(run=>!removed.has(run.runId)),
        runAnswerDrafts:Object.fromEntries(Object.entries(state.runAnswerDrafts).filter(([id])=>!removed.has(id))),
        steps:Object.fromEntries(Object.entries(state.steps).filter(([id])=>!removed.has(id))),
        observations:Object.fromEntries(Object.entries(state.observations).filter(([id])=>!removed.has(id))),
        ...(((state.railView.kind==="run"&&removed.has(state.railView.runId))||(state.railView.kind==="draft"&&state.railView.chatId===chatId))?{railView:{kind:"home" as const}}:{}),
        ...(active?{conversationId:crypto.randomUUID(),resultPreview:null,prompt:null}:{})}));
      if(active)toast("This conversation was deleted. You can start a new chat here.");
      break;
    }
    case "browser.recovery.changed":
      void get().refresh();
      break;
    case "spaces.updated":
      get().syncBrowserSpaces(e.payload.spaces as BrowserSpace[]);
      break;
    case "workspace.created":
      void get().refreshSpaces().catch(errToast);
      break;
    case "page.moved": {
      const moved = e.payload as { page: PageTarget; fromWindowId: string; toWindowId: string; sourceActivePageId: string | null; activePageId?: string | null; activate?: boolean; spaceId: string; space: BrowserSpace; folder?: Layout["folders"][number] };
      if (moved.toWindowId === bridge.windowId) {
        const pages = [...s.pages.filter(page => page.pageId !== moved.page.pageId), moved.page];
        const destinationLayout = s.layout.spaces.some(space => space.id === moved.spaceId) ? s.layout
          : { ...s.layout, spaces: [...s.layout.spaces, moved.space], archivedSpaces: s.layout.archivedSpaces?.filter(space => space.id !== moved.spaceId) };
        let layout = assignSpace(withSyncedOrder(destinationLayout, pages, get().pendingRestoreIds), moved.page.pageId, moved.spaceId);
        if (moved.folder) {
          if (!layout.folders.some(folder => folder.id === moved.folder!.id)) layout = { ...layout, folders: [...layout.folders, moved.folder] };
          layout = assignFolder(layout, moved.page.pageId, moved.folder.id);
        }
        const activePageId = moved.activePageId ?? moved.page.pageId;
        layout = setActiveSpace(layout, layout.tabSpace[activePageId] ?? moved.spaceId);
        persistLayout(layout);
        set({ pages, layout, activePageId, ...(moved.activate !== false ? {splitPageId: null, mode: "focus" as const, overlay: null} : {}) });
        if (moved.activate !== false) void bridge.overlay(false);
      } else if (moved.fromWindowId === bridge.windowId) {
        const pages = s.pages.filter(page => page.pageId !== moved.page.pageId);
        const layout = withSyncedOrder(s.layout, pages, s.pendingRestoreIds);
        persistLayout(layout);
        const activePageId = s.activePageId === moved.page.pageId
          ? tabsInSpace(layout, pages, layout.activeSpaceId).find(page => page.pageId === moved.sourceActivePageId)?.pageId
            ?? tabsInSpace(layout, pages, layout.activeSpaceId)[0]?.pageId ?? null : s.activePageId;
        set({ pages, layout, activePageId, splitPageId: splitForPage(layout, pages, activePageId) });
        if (activePageId && activePageId !== moved.sourceActivePageId) void sendTabCommand(get, { kind: "activate", pageId: activePageId }).catch(errToast);
      }
      break;
    }
    case "page.updated":
      if (!e.payload.page && typeof e.payload.pageId !== "string") void s.refresh();
      break;
    case "page.removed": {
      const id = e.payload.pageId as string;
      const hint = typeof e.payload.activePageId === "string" ? e.payload.activePageId : null;
      let activateNext: string | undefined;
      set((st) => {
        const applied = applyRemoval(st, id, hint);
        activateNext = applied.activateNext;
        return applied.next;
      });
      if (activateNext) void sendTabCommand(get, { kind: "activate", pageId: activateNext }).catch(() => {});
      break;
    }
    case "page.crashed":
      s.toast("A tab crashed", "error");
      break;
    case "routine.updated": {
      const run = e.payload.run as { status?: string; reason?: string } | undefined;
      const routine = e.payload.routine as { title?: string } | undefined;
      const title = routine?.title?.trim() || "Routine";
      if (run?.reason?.startsWith("Coalesced ")) s.toast(`${title}: ${run.reason}`);
      else if (run?.status === "needs_review") s.toast(`${title} is waiting for review before it writes.`);
      else if (run?.status === "missed") s.toast(run.reason ? `${title}: ${run.reason}` : `${title} missed a scheduled run.`);
      else if (run?.status === "uncertain") s.toast(`${title} recorded an uncertain write. Reconcile it before running again.`);
      else if (run?.status === "failed") s.toast(run.reason ? `${title}: ${run.reason}` : `${title} failed.`);
      break;
    }
    case "run.updated":
    case "run.status": {
      const run = e.payload.run as Run | undefined;
      if (run && !isLive(run) && run.runId in s.answerStreams) answerSeq.delete(run.runId);
      break;
    }
    case "run.answer.delta": {
      const { runId, text, delta, seq } = e.payload as { runId?: unknown; text?: unknown; delta?: unknown; seq?: unknown };
      const id = typeof runId === "string" ? runId : e.runId;
      if (!id || (typeof text !== "string" && typeof delta !== "string")) break;
      const run = s.runs.find(item => item.runId === id);
      if (run && !isLive(run)) break;
      if (typeof seq === "number") { if (seq <= (answerSeq.get(id) ?? -Infinity)) break; answerSeq.set(id, seq); }
      set((st) => {
        const current = st.answerStreams[id] ?? "";
        const next = typeof text === "string" ? text : current + String(delta);
        return next === current ? st : { answerStreams: { ...st.answerStreams, [id]: next } };
      });
      break;
    }
    case "observation.new": {
      const { pageId, revision } = e.payload as { pageId?: string; revision?: number };
      // Revisions are bookkeeping, not UI — they never re-render the shell.
      if (typeof pageId === "string" && typeof revision === "number") pageRevisions.set(pageId, revision);
      break;
    }
    case "result.added":
      if ((e.payload.result as ResultRecord | undefined) && s.activeSetId) void s.refreshResults(s.activeSetId);
      break;
    case "settings.changed": {
      const settings = e.payload.settings as Record<string, unknown> | undefined;
      if (settings) void bridge.setShortcutOverrides(settings.shortcutOverrides ?? {}).catch(() => {});
      break;
    }
    case "page.preview": {
      const { pageId, dataUrl } = e.payload as { pageId: string; dataUrl: string };
      if (typeof pageId !== "string" || typeof dataUrl !== "string") break;
      forgetPreview(pageId);
      previewCache.set(pageId, dataUrl);
      set((st) => ({ previewVersion: st.previewVersion + 1 }));
      break;
    }
  }
}
