import { create } from "zustand";
import { CONTEXTS_KEY, DRAFTS_KEY, NEW_DRAFT_KEY, draftKey, readConversationContexts, readConversationDrafts } from "./conversation-drafts";
import {CLOSED_TAB_LIMIT,readClosedTabs,type ClosedTab} from "./closed-tabs";
import type {
  BrowserSession,
  CompactObservation,
  Download,
  ModelCall,
  PageSet,
  PageTarget,
  ResultRecord,
  Run,
  SavedProgram,
  SetMember,
  StepRecord,
  VectorEvent,
} from "@vector/contracts";
import { bridge } from "./bridge";
import { isScrimOverlay } from "./chrome";
import {
  isTab,
  tabsInSpace,
  assignFolder,
  assignSpace,
  createFolder,
  createSpace,
  emptyLayout,
  parseLayout,
  removeFolder,
  removeSpace,
  renameFolder,
  renameSpace,
  reorderGroup,
  reorderInSpace,
  setActiveSpace,
  syncOrder,
  syncSpaces,
  toggleFolder,
  togglePin,
  type Layout,
  type Pin,
  type SpaceColor,
} from "./workspace";

let findSequence = 0;

export type Mode = "focus" | "overview" | "table" | "conversation";
export type Overlay = null | "reader" | "palette" | "settings" | "find" | "downloads" | "history" | "observe" | "tasks" | "bookmarks" | "site";
export type SidebarMode = "expanded" | "rail" | "hidden";
export type CommandSlot = "sidebar" | "hero" | "toolbar";
export type RailView = { kind: "home" } | { kind: "run"; runId: string } | { kind: "set"; setId: string };

export const LIVE_RUN = new Set(["queued", "planning", "running", "paused", "needs_input"]);
export const isLive = (r: Pick<Run, "status">) => LIVE_RUN.has(r.status);

export interface TimelineItem {
  id: string;
  ts: number;
  kind: "run" | "step" | "result" | "model" | "event" | "download" | "error";
  title: string;
  detail?: string;
  status?: string;
  runId?: string;
  pageId?: string;
}

export interface RunModelStats {
  calls: number;
  costUsd: number;
  costEstimated: boolean;
  inputTokens: number;
  outputTokens: number;
  modelIds: string[];
  providers: string[];
  destinations: string[];
  costComplete: boolean;
}

interface Workspace {
  pages: PageTarget[];
  sets: PageSet[];
  members: SetMember[];
  runs: Run[];
  sessions: BrowserSession[];
  programs: SavedProgram[];
  activePageId: string | null;
  lastSeq: number;

  mode: Mode;
  conversationId: string | null;
  conversationContexts: Record<string, string>;
  setConversationContext(id: string | null, pageId: string): void;
  openConversation(runId: string | null): void;
  overlay: Overlay;
  settingsCategory: string;
  railOpen: boolean;
  railView: RailView;
  sidebar: SidebarMode;
  /** sidebar peeked open while collapsed to the thin rail */
  sidebarPeek: boolean;
  findText: string;
  findMatches: { matches: number; activeMatch?: number } | null;
  activeSetId: string | null;
  results: ResultRecord[];
  steps: Record<string, StepRecord[]>;
  modelStats: Record<string, RunModelStats>;
  /** latest compact observation seen per run (from step artifacts or live observe) */
  observations: Record<string, CompactObservation>;
  timeline: TimelineItem[];
  previews: Record<string, string>;
  prompt: { runId: string; question: string } | null;
  settings: Record<string, unknown>;
  agentDraft: string;
  setAgentDraft(text: string): void;
  conversationDrafts: Record<string, string>;
  setConversationDraft(id: string, text: string): void;
  bookmarks: { url: string; title: string }[];
  closedTabs: ClosedTab[];
  reopeningTab: boolean;
  downloads: Download[];
  tabAudio: Record<string,{muted:boolean;audible:boolean}>;
  toasts: { id: number; text: string; kind: "info" | "error" }[];
  splitPageId: string | null;
  inspectorObs: unknown | null;
  connected: boolean;
  restoringTabs: boolean;
  /** bumps each time something asks the command bar to take focus */
  focusRequest: number;
  focusSlot: CommandSlot;
  /** window is too narrow for sidebar + stage + agent rail side by side */
  narrow: boolean;
  layout: Layout;

  setMode(m: Mode): void;
  setNarrow(v: boolean): void;
  setOverlay(o: Overlay): void;
  toggleRail(): void;
  openRail(view?: RailView): void;
  setRailView(v: RailView): void;
  setSidebar(m: SidebarMode): void;
  toggleSidebar(): void;
  setSidebarPeek(v: boolean): void;
  focusCommandBar(slot?: CommandSlot): void;
  activate(pageId: string): Promise<void>;
  find(text: string, findNext?: boolean, forward?: boolean): Promise<void>;
  newTab(url?: string): Promise<PageTarget | null>;
  closeTab(pageId: string): Promise<void>;
  reopenClosedTab(): Promise<void>;
  startRun(goal: string, opts?: { pageId?: string | null; scope?: "page" | "new"; chatId?: string }): Promise<Run | null>;
  retryRun(runId: string): Promise<Run | null>;
  answerRun(runId: string, answer: string): Promise<void>;
  returnControl(pageId: string): Promise<void>;
  loadRun(runId: string): Promise<void>;

  // layout
  reorderTabs(spaceId: string, from: number, to: number): void;
  reorderGroup(spaceId: string, folderId: string | null, from: number, to: number): void;
  moveTabToSpace(pageId: string, spaceId: string): void;
  addSpace(name: string, color?: SpaceColor): void;
  editSpace(spaceId: string, name: string, color?: SpaceColor): void;
  deleteSpace(spaceId: string): void;
  switchSpace(spaceId: string): void;
  togglePin(pin: Pin): void;
  addFolder(name: string): string;
  renameFolder(folderId: string, name: string): void;
  deleteFolder(folderId: string): void;
  toggleFolder(folderId: string): void;
  moveTabToFolder(pageId: string, folderId: string | null): void;

  sidebarWidth: number;
  railWidth: number;
  setSidebarWidth(w: number): void;
  setRailWidth(w: number): void;
  applyEvent(e: VectorEvent): void;
  applyDownload(d: Download): void;
  toast(text: string, kind?: "info" | "error"): void;
  refresh(): Promise<void>;
  refreshResults(setId: string): Promise<void>;
}

async function call<T>(method: string, params?: unknown): Promise<T> {
  return (await bridge.invoke(method, params)) as T;
}

/** artifacts.read returns base64 of UTF-8 bytes — atob alone would mangle anything outside Latin-1 */
export function decodeBase64Json<T>(b64: string): T {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

const LAYOUT_KEY = `vector.layout.v1:${bridge.windowId}`;
const CLOSED_TABS_KEY=`aux.closed-tabs.v1:${bridge.windowId}`;
const storage = typeof localStorage !== "undefined" ? localStorage : null;
const persistLayout = (l: Layout) => storage?.setItem(LAYOUT_KEY, JSON.stringify(l));
const persistClosedTabs=(tabs:ClosedTab[])=>{if(bridge.privateMode)return;try{storage?.setItem(CLOSED_TABS_KEY,JSON.stringify(tabs));}catch{/* Recovery remains available for this window. */}};
const initialLayout = (() => {
  if (!storage) return emptyLayout();
  const current = storage.getItem(LAYOUT_KEY);
  const legacy = bridge.windowId === "main" ? storage.getItem("vector.layout.v1") : null;
  const layout = parseLayout(current ?? legacy);
  if (!current && legacy) persistLayout(layout);
  return layout;
})();

let draftStorageWarned = false;
const emptyStats = (): RunModelStats => ({ calls: 0, costUsd: 0, costEstimated: false, inputTokens: 0, outputTokens: 0, modelIds: [], providers: [], destinations: [], costComplete: true });
const modelAuxValue = (call: Partial<ModelCall> | undefined, key: "provider" | "destination") => {
  const aux = call?.providerMetadata?.aux;
  if (!aux || typeof aux !== "object" || Array.isArray(aux)) return undefined;
  const value = (aux as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
};

export const useStore = create<Workspace>((set, get) => ({
  pages: [],
  sets: [],
  members: [],
  runs: [],
  sessions: [],
  programs: [],
  activePageId: null,
  lastSeq: 0,
  mode: "focus",
  conversationId: null,
  conversationContexts: readConversationContexts(storage),
  setConversationContext: (id,pageId) => {
    const contexts={...get().conversationContexts};const key=id?draftKey(id):"new";
    if(pageId)contexts[key]=pageId;else delete contexts[key];set({conversationContexts:contexts});
    try{storage?.setItem(CONTEXTS_KEY,JSON.stringify(contexts));}
    catch{if(!draftStorageWarned){draftStorageWarned=true;toast("Your composer context is kept in this window, but could not be saved for restart.","error");}}
  },
  openConversation: (runId) => {
    const run = get().runs.find(r => r.runId === runId);
    void bridge.overlay(false);
    set({ mode: "conversation", conversationId: run ? run.config?.chatId ?? run.runId : null, railOpen: false, overlay: null, ...(run?{}:{railView:{kind:"home"} as RailView}) });
  },
  overlay: null,
  settingsCategory: "General",
  railOpen: false,
  railView: { kind: "home" },
  sidebar: storage?.getItem("vector.sidebar") === "rail" ? "hidden" : (storage?.getItem("vector.sidebar") as SidebarMode | null) ?? "expanded",
  sidebarPeek: false,
  findText: "",
  findMatches: null,
  activeSetId: null,
  results: [],
  steps: {},
  modelStats: {},
  observations: {},
  timeline: [],
  previews: {},
  prompt: null,
  settings: {},
  agentDraft: readConversationDrafts(storage)[NEW_DRAFT_KEY] ?? "",
  setAgentDraft: text => {
    const drafts={...get().conversationDrafts};if(text)drafts[NEW_DRAFT_KEY]=text;else delete drafts[NEW_DRAFT_KEY];set({agentDraft:text,conversationDrafts:drafts});
    try{storage?.setItem(DRAFTS_KEY,JSON.stringify(drafts));}
    catch{if(!draftStorageWarned){draftStorageWarned=true;toast("Your prompt is kept in this window, but could not be saved for restart.","error");}}
  },
  conversationDrafts: readConversationDrafts(storage),
  setConversationDraft: (id, text) => {
    const drafts = { ...get().conversationDrafts };
    if (text) drafts[draftKey(id)] = text;
    else delete drafts[draftKey(id)];
    set({ conversationDrafts: drafts });
    try { storage?.setItem(DRAFTS_KEY, JSON.stringify(drafts)); }
    catch { if (!draftStorageWarned) { draftStorageWarned = true; toast("Your reply is kept in this window, but could not be saved for restart.", "error"); } }
  },
  bookmarks: [],
  closedTabs: bridge.privateMode?[]:readClosedTabs(storage,CLOSED_TABS_KEY),
  reopeningTab: false,
  downloads: [],
  tabAudio: {},
  toasts: [],
  splitPageId: null,
  inspectorObs: null,
  connected: false,
  restoringTabs: true,
  focusRequest: 0,
  focusSlot: "sidebar" as CommandSlot,
  narrow: false,
  layout: initialLayout,

  setMode: (mode) => set({ mode }),
  setNarrow: (narrow) => set({ narrow }),
  setOverlay: (overlay) => {
    if (overlay !== "find") findSequence++;
    void bridge.overlay(isScrimOverlay(overlay));
    set({ overlay });
  },
  toggleRail: () => set((s) => ({ railOpen: !s.railOpen })),
  openRail: (view) => set((s) => ({ railOpen: true, railView: view ?? s.railView })),
  setRailView: (railView) => set({ railView }),
  setSidebar: (sidebar) => {
    const focused = typeof document === 'undefined' ? null : document.activeElement;
    const moveFocus = focused && focused instanceof HTMLElement && !!focused.closest('.sidebar, .sidebar-reveal');
    storage?.setItem("vector.sidebar", sidebar);
    set({ sidebar, sidebarPeek: false });
    if (moveFocus) requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(sidebar === 'expanded' ? '.space-switch' : '.sidebar-reveal')?.focus();
    });
  },
  toggleSidebar: () => {
    const next: SidebarMode = get().sidebar === "expanded" ? "hidden" : "expanded";
    get().setSidebar(next);
  },
  setSidebarPeek: (sidebarPeek) => set({ sidebarPeek }),
  focusCommandBar: (slot) => {
    const s = get();
    const page = s.pages.find((p) => p.pageId === s.activePageId);
    const onStart = s.mode === "focus" && !s.overlay && (!page?.url || page.url === "about:blank");
    const requested = slot ?? (onStart ? "hero" : s.settings.tabLayout === "horizontal" ? "toolbar" : "sidebar");
    const resolved: CommandSlot = requested === "toolbar" && s.settings.tabLayout !== "horizontal" ? "sidebar" : requested;
    if (resolved === "sidebar" && s.sidebar !== "expanded") s.setSidebar("expanded");
    set((st) => ({ focusRequest: st.focusRequest + 1, focusSlot: resolved }));
  },

  toast: (text, kind = "info") => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { id, text, kind }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3600);
  },

  applyDownload: (d) =>
    set((s) => {
      const rest = s.downloads.filter((x) => x.id !== d.id);
      return { downloads: [d, ...rest].slice(0, 200) };
    }),

  activate: async (pageId) => {
    if (get().overlay !== "find") get().setOverlay(null);
    set({ activePageId: pageId, mode: "focus" });
    await call("pages.activate", { pageId });
  },

  newTab: async (url = "about:blank") => {
    const observed = new Set(get().pages.map(page => page.pageId));
    const unsubscribe = useStore.subscribe(state => { for (const page of state.pages) observed.add(page.pageId); });
    try {
      get().setOverlay(null);
      set({ mode: "focus" });
      const p = await call<PageTarget>("pages.open", { url, activate: true });
      set((s) => {
        const existing = s.pages.some(x => x.pageId === p.pageId);
        if (!existing && observed.has(p.pageId)) return {}; // Closed while the open response was pending.
        const pages = existing ? s.pages : [...s.pages, p];
        const layout = assignSpace({ ...s.layout, order: syncOrder(s.layout.order, pages) }, p.pageId, s.layout.activeSpaceId);
        persistLayout(layout);
        return { pages, layout, ...(!existing ? { activePageId: p.pageId, mode: "focus" as const, overlay: null } : {}) };
      });
      if (url === "about:blank" && get().activePageId === p.pageId) get().focusCommandBar("hero");
      return p;
    } catch (e) {
      errToast(e);
      return null;
    } finally { unsubscribe(); }
  },

  reopenClosedTab: async () => {
    const entry = get().closedTabs.at(-1);
    if (!entry || get().reopeningTab) return;
    set({ reopeningTab: true });
    try {
      const page = await get().newTab(entry.url);
      if (!page) return; // Keep the entry available if opening failed.
      set(state => {
        const spaceId = state.layout.spaces.some(space => space.id === entry.spaceId) ? entry.spaceId : state.layout.activeSpaceId;
        let layout = assignSpace(state.layout, page.pageId, spaceId);
        const folder = layout.folders.find(folder => folder.id === entry.folderId && folder.spaceId === spaceId);
        if (folder) {
          layout = assignFolder(layout, page.pageId, folder.id);
          layout = { ...layout, folders: layout.folders.map(item => item.id === folder.id ? { ...item, collapsed: false } : item) };
        }
        const order = layout.order.filter(id => id !== page.pageId);
        order.splice(Math.max(0, Math.min(entry.index, order.length)), 0, page.pageId);
        layout = { ...layout, activeSpaceId: spaceId, order };
        persistLayout(layout);
        const closedTabs=state.closedTabs.filter(tab => tab !== entry);persistClosedTabs(closedTabs);
        return { layout, closedTabs, activePageId: page.pageId };
      });
    } finally { set({ reopeningTab: false }); }
  },

  closeTab: async (pageId) => {
    try {
      await call("pages.close", { pageId });
    } catch (e) {
      errToast(e);
    }
  },

  find: async (text, findNext = false, forward = true) => {
    const id = get().activePageId;
    const sequence = ++findSequence;
    const epoch = get().pages.find(page => page.pageId === id)?.documentEpoch;
    set({ findText: text, findMatches: null });
    if (!id || !text) {
      if (id) await call("pages.stopFind", { pageId: id, action: "clear" });
      return;
    }
    const r = await call<{ matches: number; activeMatch?: number }>("pages.find", { pageId: id, text, findNext, forward });
    if (sequence === findSequence && get().overlay === "find" && get().activePageId === id && get().findText === text
      && get().pages.find(page => page.pageId === id)?.documentEpoch === epoch) set({ findMatches: r });
  },

  startRun: async (goal, opts = {}) => {
    const g = goal.trim();
    if (!g) return null;
    const existingChat = opts.chatId && get().runs.some(r => (r.config?.chatId ?? r.runId) === opts.chatId);
    const preserveDraft = () => {
      if (existingChat && opts.chatId) get().setConversationDraft(opts.chatId, g);
      else { get().setAgentDraft(g);set({ railView: { kind: "home" } }); }
    };
    if (get().settings.modelConfigured === false) {
      preserveDraft();
      set({ overlay: "settings", settingsCategory: "Models", railOpen: true });
      toast("Set up a model connection before starting the agent. Your prompt is kept.");
      return null;
    }
    try {
      let pageId = opts.pageId === undefined ? get().activePageId : opts.pageId;
      if (opts.scope === "new" || !pageId) {
        const p = await get().newTab("about:blank");
        pageId = p?.pageId ?? null;
      }
      const pageIds = pageId ? [pageId] : undefined;
      const n = Number(get().settings.maxModelCalls);
      const budget = n === 0 ? 0 : Math.min(256, Math.max(1, Number.isFinite(n) ? n : 8));
      const run = await call<Run>("runs.start", { goal: g, pageIds, maxModelCalls: budget, chatId: opts.chatId });
      set((s) => ({
        runs: s.runs.some((r) => r.runId === run.runId) ? s.runs : [run, ...s.runs],
        railOpen: true,
        railView: { kind: "run", runId: run.runId },
      }));
      if(!existingChat)get().setAgentDraft("");
      return run;
    } catch (e) {
      preserveDraft();
      set({ railOpen: true });
      errToast(e);
      return null;
    }
  },

  retryRun: async (runId) => {
    try {
      const run = await call<Run>("runs.retry", { runId });
      set((s) => ({
        runs: s.runs.some((item) => item.runId === run.runId) ? s.runs : [run, ...s.runs],
        railOpen: true,
        railView: { kind: "run", runId: run.runId },
      }));
      get().openConversation(run.runId);
      return run;
    } catch (error) {
      errToast(error);
      return null;
    }
  },

  answerRun: async (runId, answer) => {
    set({ prompt: null });
    await call("runs.answer", { runId, answer }).catch(errToast);
  },

  returnControl: async (pageId) => {
    await call("pages.resume", { pageId }).catch(errToast);
  },

  loadRun: async (runId) => {
    try {
      const d = await call<{ run: Run; steps: StepRecord[]; modelCalls?: number; usage?: { calls: number; modelIds: string[]; providers: string[]; destinations: string[]; inputTokens: number; outputTokens: number; knownCostUsd: number; costComplete: boolean } }>("runs.get", { runId });
      set((s) => ({
        runs: s.runs.some((r) => r.runId === runId) ? s.runs.map((r) => (r.runId === runId ? d.run : r)) : [d.run, ...s.runs],
        steps: { ...s.steps, [runId]: d.steps },
        modelStats:
          d.modelCalls != null && !s.modelStats[runId]
            ? { ...s.modelStats, [runId]: d.usage ? { calls: d.usage.calls, modelIds: d.usage.modelIds, providers: d.usage.providers, destinations: d.usage.destinations, inputTokens: d.usage.inputTokens, outputTokens: d.usage.outputTokens, costUsd: d.usage.knownCostUsd, costEstimated: !d.usage.costComplete, costComplete: d.usage.costComplete } : { ...emptyStats(), calls: d.modelCalls } }
            : s.modelStats,
      }));
      // most recent observation the planner saw — read from the step artifact
      const withObs = [...d.steps].reverse().find((st) => (st.inputs as { obsArtifactId?: string } | undefined)?.obsArtifactId);
      const artifactId = (withObs?.inputs as { obsArtifactId?: string } | undefined)?.obsArtifactId;
      if (artifactId && !get().observations[runId]) {
        const res = await call<{ dataBase64: string }>("artifacts.read", { artifactId });
        const obs = decodeBase64Json<CompactObservation>(res.dataBase64);
        if (obs && typeof obs.text === "string") set((s) => ({ observations: { ...s.observations, [runId]: obs } }));
      }
    } catch (e) {
      errToast(e);
    }
  },

  // ---- layout ----
  reorderTabs: (spaceId, from, to) =>
    set((s) => {
      const layout = reorderInSpace(s.layout, spaceId, from, to, s.pages);
      persistLayout(layout);
      return { layout };
    }),
  moveTabToSpace: (pageId, spaceId) =>
    set((s) => {
      const layout = assignSpace(s.layout, pageId, spaceId);
      persistLayout(layout);
      return { layout };
    }),
  addSpace: (name, color) =>
    set((s) => {
      const layout = createSpace(s.layout, name, color);
      persistLayout(layout);
      return { layout };
    }),
  editSpace: (spaceId, name, color) =>
    set((s) => {
      const layout = renameSpace(s.layout, spaceId, name, color);
      persistLayout(layout);
      return { layout };
    }),
  deleteSpace: (spaceId) =>
    set((s) => {
      const layout = removeSpace(s.layout, spaceId);
      persistLayout(layout);
      return { layout };
    }),
  switchSpace: (spaceId) =>
    set((s) => {
      const layout = setActiveSpace(s.layout, spaceId);
      persistLayout(layout);
      return { layout };
    }),
  togglePin: (pin) =>
    set((s) => {
      const layout = togglePin(s.layout, s.layout.activeSpaceId, pin);
      persistLayout(layout);
      return { layout };
    }),
  reorderGroup: (spaceId, folderId, from, to) =>
    set((s) => {
      const layout = reorderGroup(s.layout, spaceId, folderId, from, to, s.pages);
      persistLayout(layout);
      return { layout };
    }),
  addFolder: (name) => {
    let id = "";
    set((s) => {
      const layout = createFolder(s.layout, s.layout.activeSpaceId, name);
      id = layout.folders[layout.folders.length - 1]?.id ?? "";
      persistLayout(layout);
      return { layout };
    });
    return id;
  },
  renameFolder: (folderId, name) =>
    set((s) => {
      const layout = renameFolder(s.layout, folderId, name);
      persistLayout(layout);
      return { layout };
    }),
  deleteFolder: (folderId) =>
    set((s) => {
      const layout = removeFolder(s.layout, folderId);
      persistLayout(layout);
      return { layout };
    }),
  toggleFolder: (folderId) =>
    set((s) => {
      const layout = toggleFolder(s.layout, folderId);
      persistLayout(layout);
      return { layout };
    }),
  moveTabToFolder: (pageId, folderId) =>
    set((s) => {
      const layout = assignFolder(s.layout, pageId, folderId);
      persistLayout(layout);
      return { layout };
    }),

  sidebarWidth: Number(storage?.getItem("vector.sb-w")) || 280,
  railWidth: Number(storage?.getItem("vector.rail-w")) || 360,
  setSidebarWidth: (w) => {
    storage?.setItem("vector.sb-w", String(w));
    set({ sidebarWidth: w });
  },
  setRailWidth: (w) => {
    storage?.setItem("vector.rail-w", String(w));
    set({ railWidth: w });
  },

  refresh: async () => {
    try {
      const ws = await call<{
        pages: PageTarget[];
        restoringTabs?: boolean;
        sets: PageSet[];
        members: SetMember[];
        runs: Run[];
        sessions: BrowserSession[];
        activePageId: string | null;
        lastSeq: number;
      }>("workspace.get");
      const [bookmarks, settings, downloads, programs] = await Promise.all([
        call<{ url: string; title: string }[]>("bookmarks.list").catch(() => [] as { url: string; title: string }[]),
        call<Record<string, unknown>>("settings.get").catch(() => ({}) as Record<string, unknown>),
        call<Download[]>("downloads.list").catch(() => [] as Download[]),
        call<SavedProgram[]>("programs.list").catch(() => [] as SavedProgram[]),
      ]);
      set((s) => {
        const layout = ws.restoringTabs ? s.layout : syncSpaces({ ...s.layout, order: syncOrder(s.layout.order, ws.pages) }, ws.pages);
        persistLayout(layout);
        return { ...ws, restoringTabs: !!ws.restoringTabs, bookmarks, settings, downloads, programs, connected: true, layout };
      });
    } catch {
      set({ connected: false });
      setTimeout(() => void get().refresh(), 1500);
    }
  },

  refreshResults: async (setId) => {
    const results = await call<ResultRecord[]>("sets.results", { setId });
    set({ results, activeSetId: setId });
  },

  applyEvent: (e) => {
    const s = get();
    const push = (item: Omit<TimelineItem, "id" | "ts">) =>
      set((st) => ({ timeline: [{ id: `${e.seq}-${Math.random().toString(36).slice(2, 7)}`, ts: e.ts, ...item }, ...st.timeline].slice(0, 400) }));
    if (e.seq > s.lastSeq) set({ lastSeq: e.seq });

    switch (e.type) {
      case "page.added":
      case "page.updated": {
        const p = e.payload.page as PageTarget | undefined;
        if (p) {
          set((st) => {
            const pages = st.pages.some((x) => x.pageId === p.pageId) ? st.pages.map((x) => (x.pageId === p.pageId ? p : x)) : [...st.pages, p];
            const layout = st.restoringTabs ? st.layout : syncSpaces({ ...st.layout, order: syncOrder(st.layout.order, pages) }, pages);
            if (layout !== st.layout) persistLayout(layout);
            return { pages, layout };
          });
        } else if (typeof e.payload.pageId === "string") {
          const { pageId, ...patch } = e.payload as { pageId: string } & Partial<PageTarget>;
          const fields = Object.fromEntries(Object.entries(patch).filter(([k]) => k !== "activePageId")) as Partial<PageTarget>;
          if (Object.keys(fields).length) {
            set((st) => ({ pages: st.pages.map((x) => (x.pageId === pageId ? { ...x, ...fields } : x)) }));
          }
        } else {
          void s.refresh();
        }
        if ("activePageId" in e.payload) {
          const ap = e.payload.activePageId as string | null;
          if (ap) set({ activePageId: ap });
          else set({ activePageId: null });
        }
        break;
      }
      case "page.removed": {
        const id = e.payload.pageId as string;
        set((st) => {
          const gone = st.pages.find((p) => p.pageId === id);
          const closedTabs = gone && isTab(gone) && gone.url && gone.url !== "about:blank" ? [...st.closedTabs, {
            pageId: gone.pageId, url: gone.url, title: gone.title,
            spaceId: st.layout.tabSpace[id] ?? st.layout.activeSpaceId,
            folderId: st.layout.tabFolder[id], index: st.layout.order.indexOf(id),closedAt:Date.now(),
          }].slice(-CLOSED_TAB_LIMIT) : st.closedTabs;
          if(closedTabs!==st.closedTabs)persistClosedTabs(closedTabs);
          const previews = { ...st.previews };
          delete previews[id];
          const pages = st.pages.filter((p) => p.pageId !== id);
          // closing the active tab focuses its neighbour, like every browser
          let activePageId = st.activePageId;
          if (activePageId === id) {
            const runtimeChoice = typeof e.payload.activePageId === "string" ? e.payload.activePageId : null;
            if (runtimeChoice && pages.some(page => page.pageId === runtimeChoice)) activePageId = runtimeChoice;
            else {
              const visible = tabsInSpace(st.layout, st.pages, st.layout.activeSpaceId).map(page => page.pageId);
              const order = visible.filter(pageId => pageId !== id);
              const idx = visible.indexOf(id);
              activePageId = order[Math.min(Math.max(idx, 0), order.length - 1)] ?? order[order.length - 1] ?? null;
              if (activePageId) void call("pages.activate", { pageId: activePageId }).catch(() => {});
            }
          }
          const layout = { ...st.layout, order: syncOrder(st.layout.order, pages) };
          persistLayout(layout);
          return { pages, closedTabs, previews, layout, splitPageId: st.splitPageId === id ? null : st.splitPageId, activePageId };
        });
        break;
      }
      case "page.crashed": {
        const { pageId } = e.payload as { pageId: string };
        set((st) => ({ pages: st.pages.map((p) => (p.pageId === pageId ? { ...p, viewStatus: "crashed", loading: false, error: "The renderer process crashed." } : p)) }));
        s.toast("A tab crashed", "error");
        break;
      }
      case "page.loading": {
        const { pageId, loading } = e.payload as { pageId: string; loading: boolean };
        set((st) => ({ pages: st.pages.map((p) => (p.pageId === pageId ? { ...p, loading } : p)) }));
        break;
      }
      case "page.takeover": {
        const { pageId, controller } = e.payload as { pageId: string; controller: string };
        set((st) => ({ pages: st.pages.map((p) => (p.pageId === pageId ? { ...p, controller: controller as PageTarget["controller"] } : p)) }));
        push({ kind: "event", title: controller === "human" ? "You took control" : `Page released (${controller})`, pageId, status: controller === "human" ? "paused" : "ok" });
        break;
      }
      case "run.updated":
      case "run.status": {
        const run = e.payload.run as Run | undefined;
        if (run) {
          set((st) => ({ runs: st.runs.some((r) => r.runId === run.runId) ? st.runs.map((r) => (r.runId === run.runId ? run : r)) : [run, ...st.runs] }));
          if (e.type === "run.status") push({ kind: "run", title: run.goal, detail: run.statusMessage, status: run.status, runId: run.runId });
          if (run.status === "needs_input" && run.statusMessage) {
            set({ prompt: { runId: run.runId, question: run.statusMessage }, railOpen: true, railView: { kind: "run", runId: run.runId } });
          } else if (get().prompt?.runId === run.runId) {
            set({ prompt: null });
          }
        }
        break;
      }
      case "step.finished": {
        const step = e.payload.step as StepRecord | undefined;
        if (step) {
          set((st) => {
            const existing = st.steps[step.runId] ?? [];
            const merged = existing.some((x) => x.stepId === step.stepId) ? existing.map((x) => (x.stepId === step.stepId ? step : x)) : [...existing, step];
            return { steps: { ...st.steps, [step.runId]: merged } };
          });
          push({
            kind: "step",
            title: step.op,
            detail: step.expected ?? step.outcome?.detail ?? step.outcome?.error?.message,
            status: step.outcome?.status === "failed" ? "error" : "ok",
            runId: step.runId,
            pageId: step.pageId,
          });
        }
        break;
      }
      case "observation.new": {
        // keep the live run's observation fresh without a round trip when the payload carries it
        const { runId, observation, pageId, revision } = e.payload as {
          runId?: string;
          observation?: CompactObservation;
          pageId?: string;
          revision?: number;
        };
        set((st) => {
          const observations =
            runId && observation && typeof observation.text === "string"
              ? { ...st.observations, [runId]: observation }
              : st.observations;
          const pages =
            typeof pageId === "string" && typeof revision === "number"
              ? st.pages.map((p) => (p.pageId === pageId ? { ...p, lastRevision: revision } : p))
              : st.pages;
          return { observations, pages };
        });
        break;
      }
      case "result.added": {
        const r = e.payload.result as ResultRecord | undefined;
        if (r) {
          push({ kind: "result", title: r.sourceUrl, detail: JSON.stringify(r.values).slice(0, 200), status: r.status, runId: r.runId });
          if (s.activeSetId) void s.refreshResults(s.activeSetId);
        }
        break;
      }
      case "set.updated": {
        const st0 = e.payload.set as PageSet | undefined;
        if (st0) set((st) => ({ sets: st.sets.some((x) => x.setId === st0.setId) ? st.sets.map((x) => (x.setId === st0.setId ? st0 : x)) : [...st.sets, st0] }));
        break;
      }
      case "member.updated": {
        const m = e.payload.member as SetMember | undefined;
        if (m) set((st) => ({ members: st.members.some((x) => x.memberId === m.memberId) ? st.members.map((x) => (x.memberId === m.memberId ? m : x)) : [...st.members, m] }));
        break;
      }
      case "model.call": {
        const mc = e.payload as Partial<ModelCall> | undefined;
        if (mc?.modelId) {
          push({ kind: "model", title: `${mc.role} · ${mc.modelId}`, detail: `${mc.durationMs}ms${mc.error ? ` · ${mc.error}` : ""}`, status: mc.error ? "error" : "ok" });
        }
        const runId = mc?.runId ?? e.runId;
        if (runId) {
          set((st) => {
            const cur = st.modelStats[runId] ?? emptyStats();
            return {
              modelStats: {
                ...st.modelStats,
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
          });
        }
        break;
      }
      case "download.started":
      case "download.finished": {
        const d = e.payload as Download;
        if (d.id) s.applyDownload(d);
        push({ kind: "download", title: d.filename ?? "download", status: d.state });
        break;
      }
      case "session.changed": {
        const sess = e.payload.session as BrowserSession | undefined;
        if (sess) set((st) => ({ sessions: st.sessions.some((x) => x.sessionId === sess.sessionId) ? st.sessions.map((x) => (x.sessionId === sess.sessionId ? sess : x)) : [...st.sessions, sess] }));
        break;
      }
      case "settings.changed": {
        const settings = e.payload.settings as Record<string, unknown> | undefined;
        if (settings) set({ settings });
        break;
      }
      case "bookmarks.changed": {
        const bookmarks = e.payload.bookmarks as { url: string; title: string }[] | undefined;
        if (bookmarks) set({ bookmarks });
        break;
      }
      case "page.preview": {
        const { pageId, dataUrl } = e.payload as { pageId: string; dataUrl: string };
        set((st) => ({ previews: { ...st.previews, [pageId]: dataUrl } }));
        break;
      }
    }
  },
}));

export { call };

/** Fire-and-forget helper for UI actions — surfaces API errors as toasts. */
export const toast = (text: string, kind: "info" | "error" = "info") => useStore.getState().toast(text, kind);
export const errToast = (e: unknown) => toast(e instanceof Error ? e.message.replace(/^\w+Error:\s*/, "") : String(e), "error");
