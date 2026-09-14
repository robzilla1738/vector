import { create } from "zustand";
import type {
  BrowserSession,
  Download,
  PageSet,
  PageTarget,
  ResultRecord,
  Run,
  SetMember,
  StepRecord,
  VectorEvent,
} from "@vector/contracts";
import { bridge } from "./bridge";

export type Mode = "focus" | "overview" | "table";
export type Overlay = null | "palette" | "settings" | "find" | "downloads" | "history" | "observe";

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

interface Workspace {
  pages: PageTarget[];
  sets: PageSet[];
  members: SetMember[];
  runs: Run[];
  sessions: BrowserSession[];
  activePageId: string | null;
  lastSeq: number;

  mode: Mode;
  overlay: Overlay;
  railOpen: boolean;
  sidebarOpen: boolean;
  findText: string;
  findMatches: { matches: number; activeMatch?: number } | null;
  activeSetId: string | null;
  results: ResultRecord[];
  steps: Record<string, StepRecord[]>;
  /** runId → model-call count (live model.call events + runs.get totals) */
  modelCalls: Record<string, number>;
  timeline: TimelineItem[];
  previews: Record<string, string>;
  prompt: { runId: string; question: string } | null;
  settings: Record<string, unknown>;
  bookmarks: { url: string; title: string }[];
  closedTabs: { url: string; title: string }[];
  downloads: Download[];
  toasts: { id: number; text: string; kind: "info" | "error" }[];
  /** second page shown beside the active one in split view */
  splitPageId: string | null;
  /** historical observation shown in the inspector (from a run step's saved artifact) */
  inspectorObs: unknown | null;
  connected: boolean;

  setMode(m: Mode): void;
  setOverlay(o: Overlay): void;
  toggleRail(): void;
  toggleSidebar(): void;
  activate(pageId: string): Promise<void>;
  find(text: string, findNext?: boolean, forward?: boolean): Promise<void>;
  /** chat composer → queues an agent run (serial — one agent on the tabs at a time) */
  sendChat(text: string): Promise<void>;
  /** messages waiting for the in-flight run to finish */
  chatQueue: string[];
  flushChat(): Promise<void>;
  /** conversation the rail is scoped to — null shows all activity */
  activeChatId: string | null;
  /** start a fresh conversation thread */
  newChat(): void;
  selectChat(chatId: string | null): void;
  /** sidebar/rail widths — user-resizable, persisted locally */
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

export const useStore = create<Workspace>((set, get) => ({
  pages: [],
  sets: [],
  members: [],
  runs: [],
  sessions: [],
  activePageId: null,
  lastSeq: 0,
  mode: "focus",
  overlay: null,
  railOpen: true,
  sidebarOpen: true,
  findText: "",
  findMatches: null,
  activeSetId: null,
  results: [],
  steps: {},
  modelCalls: {},
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

  setMode: (mode) => set({ mode }),
  setOverlay: (overlay) => {
    // Only full-scrim overlays hide the native page — the find bar and the
    // downloads shelf live in the layout flow so the page stays live.
    void bridge.overlay(overlay === "palette" || overlay === "settings" || overlay === "history" || overlay === "observe");
    set({ overlay });
  },
  toggleRail: () => set((s) => ({ railOpen: !s.railOpen })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

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
    await call("pages.activate", { pageId });
    set({ activePageId: pageId, mode: "focus" });
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

  chatQueue: [],
  activeChatId: null,

  newChat: () => {
    set({ activeChatId: newChatId(), railOpen: true });
  },
  selectChat: (chatId) => set({ activeChatId: chatId, railOpen: true }),

  sidebarWidth: Number(localStorage.getItem("vector.sb-w")) || 232,
  railWidth: Number(localStorage.getItem("vector.rail-w")) || 340,
  setSidebarWidth: (w) => {
    localStorage.setItem("vector.sb-w", String(w));
    set({ sidebarWidth: w });
  },
  setRailWidth: (w) => {
    localStorage.setItem("vector.rail-w", String(w));
    set({ railWidth: w });
  },

  sendChat: async (text) => {
    const goal = text.trim();
    if (!goal) return;
    // a message sent from the "all activity" view starts a fresh thread
    if (!get().activeChatId) set({ activeChatId: newChatId() });
    set({ railOpen: true });
    set((s) => ({ chatQueue: [...s.chatQueue, goal] }));
    await get().flushChat();
  },

  // one agent on the tabs at a time — a second message waits for the
  // in-flight run so parallel runs can't fight over the same page
  flushChat: async () => {
    const LIVE = ["queued", "planning", "running", "paused", "needs_input"];
    if (get().runs.some((r) => LIVE.includes(r.status)) || !get().chatQueue.length) return;
    const goal = get().chatQueue[0]!;
    set((s) => ({ chatQueue: s.chatQueue.slice(1) }));
    let pageId = get().activePageId;
    if (!pageId) {
      const p = await call<{ pageId: string }>("pages.open", { url: "about:blank", backend: "vector", activate: true });
      pageId = p.pageId;
    }
    // scope the run to every open tab — the agent can retarget across pages
    // mid-plan ("check my other tab for X"), with the active page first
    const pageIds = [pageId, ...get().pages.filter((p) => p.pageId !== pageId).map((p) => p.pageId)];
    // conversational memory: the last few finished turns in *this* thread
    // summarized, so follow-ups ("now submit it") have context but other
    // conversations don't bleed in
    const chatId = get().activeChatId ?? undefined;
    const context = get()
      .runs.filter((r) => r.config?.chatId === chatId && ["completed", "partially_completed", "failed"].includes(r.status))
      .slice(-3)
      .map((r) => {
        const out = r.result ? JSON.stringify(r.result).slice(0, 160) : (r.statusMessage ?? r.status).slice(0, 120);
        return `"${r.goal.slice(0, 80)}" → ${out}`;
      })
      .join("; ");
    const run = await call<Run>("runs.start", { goal, pageIds, maxModelCalls: 20, context: context || undefined, chatId });
    // insert immediately — the run.updated event lags a beat, and without the
    // optimistic entry a fast follow-up message would start a second run
    set((s) => ({ runs: s.runs.some((r) => r.runId === run.runId) ? s.runs : [run, ...s.runs] }));
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
      const [bookmarks, settings, downloads] = await Promise.all([
        call<{ url: string; title: string }[]>("bookmarks.list").catch(() => [] as { url: string; title: string }[]),
        call<Record<string, unknown>>("settings.get").catch(() => ({} as Record<string, unknown>)),
        call<Download[]>("downloads.list").catch(() => [] as Download[]),
      ]);
      set({ ...ws, bookmarks, settings, downloads, connected: true });
    } catch {
      set({ connected: false });
      setTimeout(() => void get().refresh(), 1000);
    }
  },

  refreshResults: async (setId) => {
    const results = await call<ResultRecord[]>("sets.results", { setId });
    set({ results, activeSetId: setId });
  },

  applyEvent: (e) => {
    const s = get();
    const push = (item: Omit<TimelineItem, "id" | "ts">) =>
      set({ timeline: [{ id: `${e.seq}-${Math.random().toString(36).slice(2, 7)}`, ts: e.ts, ...item }, ...s.timeline].slice(0, 400) });
    if (e.seq > s.lastSeq) set({ lastSeq: e.seq });

    switch (e.type) {
      case "page.added":
      case "page.updated": {
        const p = e.payload.page as PageTarget | undefined;
        if (p) {
          const pages = s.pages.some((x) => x.pageId === p.pageId)
            ? s.pages.map((x) => (x.pageId === p.pageId ? p : x))
            : [...s.pages, p];
          set({ pages });
        } else if (typeof e.payload.pageId === "string") {
          // partial update — merge the changed fields into the tracked page
          const { pageId, ...patch } = e.payload as { pageId: string } & Partial<PageTarget>;
          const fields = Object.fromEntries(
            Object.entries(patch).filter(([k]) => k !== "activePageId"),
          ) as Partial<PageTarget>;
          if (Object.keys(fields).length) {
            set({ pages: s.pages.map((x) => (x.pageId === pageId ? { ...x, ...fields } : x)) });
          }
        } else {
          void s.refresh();
        }
        // runtime-driven activation (API/CLI/agent) — surface the page
        if ("activePageId" in e.payload) {
          const ap = e.payload.activePageId as string | null;
          if (ap) set({ activePageId: ap, mode: "focus", overlay: null });
          else set({ activePageId: null });
        }
        break;
      }
      case "page.removed": {
        const gone = s.pages.find((p) => p.pageId === e.payload.pageId);
        const closedTabs =
          gone && gone.url && gone.url !== "about:blank"
            ? [...s.closedTabs, { url: gone.url, title: gone.title }].slice(-20)
            : s.closedTabs;
        const previews = { ...s.previews };
        delete previews[e.payload.pageId as string];
        set({
          pages: s.pages.filter((p) => p.pageId !== e.payload.pageId),
          closedTabs,
          previews,
          splitPageId: s.splitPageId === e.payload.pageId ? null : s.splitPageId,
          activePageId: s.activePageId === e.payload.pageId ? null : s.activePageId,
        });
        break;
      }
      case "page.crashed": {
        const { pageId } = e.payload as { pageId: string };
        set({
          pages: s.pages.map((p) =>
            p.pageId === pageId ? { ...p, viewStatus: "crashed", error: "Renderer process crashed" } : p,
          ),
        });
        s.toast("A tab crashed", "error");
        break;
      }
      case "page.loading": {
        const { pageId, loading } = e.payload as { pageId: string; loading: boolean };
        set({ pages: s.pages.map((p) => (p.pageId === pageId ? { ...p, loading } : p)) });
        break;
      }
      case "page.takeover": {
        const { pageId, controller } = e.payload as { pageId: string; controller: string };
        set({ pages: s.pages.map((p) => (p.pageId === pageId ? { ...p, controller: controller as PageTarget["controller"] } : p)) });
        push({
          kind: "event",
          title: controller === "human" ? "Human took control" : `Page released (${controller})`,
          pageId,
          status: controller === "human" ? "paused" : "ok",
        });
        break;
      }
      case "run.updated":
      case "run.status": {
        const run = e.payload.run as Run | undefined;
        if (run) {
          const runs = s.runs.some((r) => r.runId === run.runId)
            ? s.runs.map((r) => (r.runId === run.runId ? run : r))
            : [run, ...s.runs];
          set({ runs });
          if (e.type === "run.status") {
            push({ kind: "run", title: run.goal, detail: run.statusMessage, status: run.status, runId: run.runId });
          }
          if (run.status === "needs_input" && run.statusMessage) {
            // a question needs a person — surface the rail it answers in
            set({ prompt: { runId: run.runId, question: run.statusMessage }, railOpen: true });
          } else if (s.prompt?.runId === run.runId) {
            set({ prompt: null });
          }
          // a finished run frees the agent — flush any queued chat message
          if (["completed", "partially_completed", "failed", "cancelled", "interrupted"].includes(run.status)) {
            void get().flushChat();
          }
        }
        break;
      }
      case "step.finished": {
        const step = e.payload.step as StepRecord | undefined;
        if (step) {
          const existing = s.steps[step.runId] ?? [];
          const merged = existing.some((x) => x.stepId === step.stepId)
            ? existing.map((x) => (x.stepId === step.stepId ? step : x))
            : [...existing, step];
          set({ steps: { ...s.steps, [step.runId]: merged } });
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
      case "result.added": {
        const r = e.payload.result as ResultRecord | undefined;
        if (r) {
          push({ kind: "result", title: r.sourceUrl, detail: JSON.stringify(r.values).slice(0, 200), status: r.status, runId: r.runId });
          if (s.activeSetId) void s.refreshResults(s.activeSetId);
        }
        break;
      }
      case "set.updated": {
        const st = e.payload.set as PageSet | undefined;
        if (st) {
          const sets = s.sets.some((x) => x.setId === st.setId)
            ? s.sets.map((x) => (x.setId === st.setId ? st : x))
            : [...s.sets, st];
          set({ sets });
        }
        break;
      }
      case "member.updated": {
        const m = e.payload.member as SetMember | undefined;
        if (m) {
          const members = s.members.some((x) => x.memberId === m.memberId)
            ? s.members.map((x) => (x.memberId === m.memberId ? m : x))
            : [...s.members, m];
          set({ members });
        }
        break;
      }
      case "model.call": {
        // payload is the ModelCall record itself (emit(type, call, runId))
        const mc = e.payload as { runId?: string; modelId: string; role: string; durationMs: number; error?: string } | undefined;
        if (mc?.modelId) push({ kind: "model", title: `${mc.role} · ${mc.modelId}`, detail: `${mc.durationMs}ms${mc.error ? ` · ${mc.error}` : ""}`, status: mc.error ? "error" : "ok" });
        if (mc?.runId) set((st) => ({ modelCalls: { ...st.modelCalls, [mc.runId!]: (st.modelCalls[mc.runId!] ?? 0) + 1 } }));
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
        if (sess) {
          const sessions = s.sessions.some((x) => x.sessionId === sess.sessionId)
            ? s.sessions.map((x) => (x.sessionId === sess.sessionId ? sess : x))
            : [...s.sessions, sess];
          set({ sessions });
        }
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
        set({ previews: { ...s.previews, [pageId]: dataUrl } });
        break;
      }
    }
  },
}));

const newChatId = () => `chat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export { call };

/** Fire-and-forget helper for UI actions — surfaces API errors as toasts. */
export const toast = (text: string, kind: "info" | "error" = "info") => useStore.getState().toast(text, kind);
export const errToast = (e: unknown) => toast(e instanceof Error ? e.message.replace(/^\w+Error:\s*/, "") : String(e), "error");
