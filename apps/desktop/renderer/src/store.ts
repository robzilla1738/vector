import { create } from "zustand";
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

export type Mode = "focus" | "overview" | "table";
export type Overlay = null | "palette" | "settings" | "find" | "downloads" | "history" | "observe";
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
  overlay: Overlay;
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
  bookmarks: { url: string; title: string }[];
  closedTabs: { url: string; title: string }[];
  downloads: Download[];
  toasts: { id: number; text: string; kind: "info" | "error" }[];
  splitPageId: string | null;
  inspectorObs: unknown | null;
  connected: boolean;
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
  startRun(goal: string, opts?: { pageId?: string | null; scope?: "page" | "new" }): Promise<Run | null>;
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

const LAYOUT_KEY = "vector.layout.v1";
const storage = typeof localStorage !== "undefined" ? localStorage : null;
const persistLayout = (l: Layout) => storage?.setItem(LAYOUT_KEY, JSON.stringify(l));

const emptyStats = (): RunModelStats => ({ calls: 0, costUsd: 0, costEstimated: false, inputTokens: 0, outputTokens: 0 });

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
  overlay: null,
  railOpen: false,
  railView: { kind: "home" },
  sidebar: (storage?.getItem("vector.sidebar") as SidebarMode | null) ?? "expanded",
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
  bookmarks: [],
  closedTabs: [],
  downloads: [],
  toasts: [],
  splitPageId: null,
  inspectorObs: null,
  connected: false,
  focusRequest: 0,
  focusSlot: "sidebar" as CommandSlot,
  narrow: false,
  layout: storage ? parseLayout(storage.getItem(LAYOUT_KEY)) : emptyLayout(),

  setMode: (mode) => set({ mode }),
  setNarrow: (narrow) => set({ narrow }),
  setOverlay: (overlay) => {
    void bridge.overlay(isScrimOverlay(overlay));
    set({ overlay });
  },
  toggleRail: () => set((s) => ({ railOpen: !s.railOpen })),
  openRail: (view) => set((s) => ({ railOpen: true, railView: view ?? s.railView })),
  setRailView: (railView) => set({ railView }),
  setSidebar: (sidebar) => {
    storage?.setItem("vector.sidebar", sidebar);
    set({ sidebar, sidebarPeek: false });
  },
  toggleSidebar: () => {
    const next: SidebarMode = get().sidebar === "expanded" ? "rail" : "expanded";
    get().setSidebar(next);
  },
  setSidebarPeek: (sidebarPeek) => set({ sidebarPeek }),
  focusCommandBar: (slot) => {
    const s = get();
    const page = s.pages.find((p) => p.pageId === s.activePageId);
    const onStart = !page?.url || page.url === "about:blank";
    const resolved: CommandSlot = slot ?? (onStart ? "hero" : s.sidebar === "hidden" ? "toolbar" : "sidebar");
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
    set({ activePageId: pageId, mode: "focus" });
    await call("pages.activate", { pageId });
  },

  newTab: async (url = "about:blank") => {
    try {
      const p = await call<PageTarget>("pages.open", { url, activate: true });
      set((s) => {
        const pages = s.pages.some((x) => x.pageId === p.pageId) ? s.pages.map((x) => (x.pageId === p.pageId ? p : x)) : [...s.pages, p];
        const layout = assignSpace({ ...s.layout, order: syncOrder(s.layout.order, pages) }, p.pageId, s.layout.activeSpaceId);
        persistLayout(layout);
        return { pages, layout, activePageId: p.pageId, mode: "focus" as const, overlay: null };
      });
      if (url === "about:blank") get().focusCommandBar("hero");
      return p;
    } catch (e) {
      errToast(e);
      return null;
    }
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
    set({ findText: text });
    if (!id || !text) {
      set({ findMatches: null });
      return;
    }
    const r = await call<{ matches: number; activeMatch?: number }>("pages.find", { pageId: id, text, findNext, forward });
    set({ findMatches: r });
  },

  startRun: async (goal, opts = {}) => {
    const g = goal.trim();
    if (!g) return null;
    try {
      let pageId = opts.pageId === undefined ? get().activePageId : opts.pageId;
      if (opts.scope === "new" || !pageId) {
        const p = await get().newTab("about:blank");
        pageId = p?.pageId ?? null;
      }
      const pageIds = pageId ? [pageId] : undefined;
      // conversational memory: the last few finished runs on this page, summarised
      const context = get()
        .runs.filter((r) => pageId && r.pageIds[0] === pageId && ["completed", "partially_completed", "failed"].includes(r.status))
        .slice(0, 3)
        .map((r) => {
          const out = r.result ? JSON.stringify(r.result).slice(0, 160) : (r.statusMessage ?? r.status).slice(0, 120);
          return `"${r.goal.slice(0, 80)}" → ${out}`;
        })
        .join("; ");
      const n = Number(get().settings.maxModelCalls);
      const budget = n === 0 ? 0 : Math.min(256, Math.max(1, Number.isFinite(n) ? n : 8));
      const run = await call<Run>("runs.start", { goal: g, pageIds, maxModelCalls: budget, context: context || undefined });
      set((s) => ({
        runs: s.runs.some((r) => r.runId === run.runId) ? s.runs : [run, ...s.runs],
        railOpen: true,
        railView: { kind: "run", runId: run.runId },
      }));
      return run;
    } catch (e) {
      errToast(e);
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
      const d = await call<{ run: Run; steps: StepRecord[]; modelCalls?: number }>("runs.get", { runId });
      set((s) => ({
        runs: s.runs.some((r) => r.runId === runId) ? s.runs.map((r) => (r.runId === runId ? d.run : r)) : [d.run, ...s.runs],
        steps: { ...s.steps, [runId]: d.steps },
        modelStats:
          d.modelCalls != null && !s.modelStats[runId]
            ? { ...s.modelStats, [runId]: { ...emptyStats(), calls: d.modelCalls } }
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

  sidebarWidth: Number(storage?.getItem("vector.sb-w")) || 260,
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
        const layout = syncSpaces({ ...s.layout, order: syncOrder(s.layout.order, ws.pages) }, ws.pages);
        persistLayout(layout);
        return { ...ws, bookmarks, settings, downloads, programs, connected: true, layout };
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
            const layout = syncSpaces({ ...st.layout, order: syncOrder(st.layout.order, pages) }, pages);
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
          if (ap) set({ activePageId: ap, mode: "focus", overlay: null });
          else set({ activePageId: null });
        }
        break;
      }
      case "page.removed": {
        const id = e.payload.pageId as string;
        set((st) => {
          const gone = st.pages.find((p) => p.pageId === id);
          const closedTabs = gone && gone.url && gone.url !== "about:blank" ? [...st.closedTabs, { url: gone.url, title: gone.title }].slice(-20) : st.closedTabs;
          const previews = { ...st.previews };
          delete previews[id];
          const pages = st.pages.filter((p) => p.pageId !== id);
          // closing the active tab focuses its neighbour, like every browser
          let activePageId = st.activePageId;
          if (activePageId === id) {
            const order = st.layout.order.filter((x) => pages.some((p) => p.pageId === x));
            const idx = st.layout.order.indexOf(id);
            activePageId = order[Math.min(Math.max(idx, 0), order.length - 1)] ?? order[order.length - 1] ?? null;
            if (activePageId) void call("pages.activate", { pageId: activePageId }).catch(() => {});
          }
          const layout = { ...st.layout, order: syncOrder(st.layout.order, pages) };
          persistLayout(layout);
          return { pages, closedTabs, previews, layout, splitPageId: st.splitPageId === id ? null : st.splitPageId, activePageId };
        });
        break;
      }
      case "page.crashed": {
        const { pageId } = e.payload as { pageId: string };
        set((st) => ({ pages: st.pages.map((p) => (p.pageId === pageId ? { ...p, viewStatus: "crashed", error: "Renderer process crashed" } : p)) }));
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
