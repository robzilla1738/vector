/**
 * Scripted VectorBridge for `vite --mode mock`. Runs the whole shell in a
 * plain browser with no Electron and no runtime — for visual review, screenshot
 * baselines, and poking at states that are hard to reproduce live.
 *
 * Scenario is chosen by URL query:
 *   ?scenario=start         no tabs — start page
 *   ?scenario=browsing      6 tabs, Google unfiled and active (default)
 *   ?scenario=run           6 tabs + a live run with steps and an observation, rail open
 *   ?scenario=takeover      run scenario with the human holding the page
 *   ?scenario=needs-input   run scenario waiting on a question
 *   ?scenario=set           a set mapping over 12 members
 *   ?scenario=many          45 tabs
 *   ?scenario=disconnected  runtime unreachable → degraded banner
 *   &theme=dark|light  &sidebar=expanded|rail  &live=1 (stream new steps)
 */
import type { PageTarget, Run, StepRecord, VectorEvent } from "@vector/contracts";
import type { VectorBridge } from "../bridge";
import { DEFAULT_SPACE } from "../workspace";
import { BOOKMARKS, HISTORY, MEMBERS, OBSERVATION, PAST_RUNS, PROGRAMS, RUN_ID, SET, SIDEBAR_TABS, makePage, makeRun, makeSteps } from "./fixtures";

type Listener<T> = (v: T) => void;

export function installMockBridge(q: URLSearchParams) {
  const scenario = q.get("scenario") ?? "browsing";
  const live = q.get("live") === "1";
  const theme = q.get("theme") ?? "dark";
  if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
  const sidebar = q.get("sidebar");
  if (sidebar) localStorage.setItem("vector.sidebar", sidebar);
  else localStorage.removeItem("vector.sidebar");
  localStorage.setItem(
    "vector.layout.v1",
    JSON.stringify({
      spaces: [DEFAULT_SPACE],
      activeSpaceId: DEFAULT_SPACE.id,
      tabSpace: {},
      order: ["page-1", "page-2", "page-3", "page-4", "page-6", "page-5"],
      pins: { [DEFAULT_SPACE.id]: BOOKMARKS },
      folders: [
        { id: "folder-dev", name: "Dev", spaceId: DEFAULT_SPACE.id, collapsed: false },
        { id: "folder-social", name: "Social", spaceId: DEFAULT_SPACE.id, collapsed: true },
        { id: "folder-design", name: "Design", spaceId: DEFAULT_SPACE.id, collapsed: true },
        { id: "folder-rhema", name: "Rhema", spaceId: DEFAULT_SPACE.id, collapsed: true },
        { id: "folder-ai", name: "AI", spaceId: DEFAULT_SPACE.id, collapsed: true },
      ],
      tabFolder: {
        "page-1": "folder-dev",
        "page-2": "folder-dev",
        "page-3": "folder-dev",
        "page-4": "folder-dev",
        "page-6": "folder-social",
      },
    }),
  );
  localStorage.setItem("vector.sb-w", q.get("sbw") ?? "260");
  localStorage.setItem("vector.rail-w", q.get("railw") ?? "380");
  if (q.get("rail")) localStorage.setItem("vector.mock.rail", q.get("rail")!);
  else localStorage.removeItem("vector.mock.rail");

  // ---- state ----
  let seq = 100;
  const eventListeners = new Set<Listener<VectorEvent>>();
  const loadingListeners = new Set<Listener<{ pageId: string; loading: boolean }>>();
  const emit = (type: string, payload: Record<string, unknown>, runId?: string) => {
    const ev: VectorEvent = { seq: ++seq, type, payload, ts: Date.now(), ...(runId ? { runId } : {}) };
    for (const l of eventListeners) l(ev);
  };

  const tabCount = scenario === "start" ? 0 : scenario === "many" ? 45 : 6;
  let pages: PageTarget[] = tabCount === 6
    ? SIDEBAR_TABS.map((s, i) => makePage(i, {}, s))
    : Array.from({ length: tabCount }, (_, i) => makePage(i));
  let activePageId: string | null = pages[4]?.pageId ?? pages[0]?.pageId ?? null;
  const withRun = ["run", "takeover", "needs-input"].includes(scenario);
  let runs: Run[] = [...PAST_RUNS];
  let steps: Record<string, StepRecord[]> = {};
  const settings: Record<string, unknown> = {
    theme,
    searchEngine: "https://duckduckgo.com/?q=%s",
    plannerModel: "alibaba/qwen3.8-27b",
    maxWorkers: 4,
    maxModelCalls: 8,
    engineMode: q.get("engine") ?? "off",
    gatewayApiKey: "••••••••",
    effectGrants: ["effect:read", "effect:write", "effect:destructive", "effect:egress"],
  };

  if (withRun) {
    activePageId = "page-1";
    const run = makeRun(
      scenario === "takeover"
        ? { status: "paused", statusMessage: "Paused — you're in control of this page" }
        : scenario === "needs-input"
          ? { status: "needs_input", statusMessage: "Two comment threads are marked resolved but still discuss focus rings. Include resolved threads too?" }
          : {},
    );
    runs = [run, ...runs];
    steps[RUN_ID] = makeSteps(RUN_ID, scenario === "run" ? 6 : 8);
    pages = pages.map((p) => (p.pageId === "page-1" ? { ...p, controller: scenario === "takeover" ? "human" : "agent", controllerEpoch: 2 } : p));
    if (settings.engineMode !== "off") {
      pages = pages.map((p) => (p.pageId === "page-1" ? ({ ...p, route: { backend: "vector-engine", routeReason: "engineMode=auto · github.com is in the engine allowlist", routeMs: 14, firstPaintMs: 212 } } as PageTarget) : p));
    }
  } else if (scenario !== "start" && pages.length) {
    pages = pages.map((p, i) =>
      settings.engineMode !== "off" && i === 2
        ? ({ ...p, route: { backend: "vector-engine", routeReason: "engineMode=auto · docs site, static", routeMs: 9, firstPaintMs: 141 } } as PageTarget)
        : i === 4
          ? { ...p, backend: "chrome" }
          : p,
    );
  }
  if (scenario === "many") pages = pages.map((p, i) => (i === 7 ? { ...p, loading: true } : i === 21 ? { ...p, viewStatus: "crashed" } : p));

  const sets = scenario === "set" || withRun ? [SET] : [];
  const members = sets.length ? MEMBERS : [];

  const workspace = () => ({ pages, sets, members, runs, sessions: [{ sessionId: "sess-1", backend: "vector", label: "Vector", status: "connected" }], activePageId, lastSeq: seq });

  const page = (id: string) => {
    const p = pages.find((x) => x.pageId === id);
    if (!p) throw new Error(`no page ${id}`);
    return p;
  };
  const patch = (id: string, fields: Partial<PageTarget>) => {
    pages = pages.map((p) => (p.pageId === id ? { ...p, ...fields } : p));
    emit("page.updated", { page: page(id) });
  };
  const patchRun = (id: string, fields: Partial<Run>, status = false) => {
    runs = runs.map((r) => (r.runId === id ? { ...r, ...fields } : r));
    emit(status ? "run.status" : "run.updated", { run: runs.find((r) => r.runId === id) }, id);
  };

  let nextId = pages.length + 1;
  const invoke = async (method: string, params: unknown = {}): Promise<unknown> => {
    if (scenario === "disconnected") throw new Error("runtime not connected");
    const p = params as Record<string, unknown>;
    await sleep(method.startsWith("pages.") ? 20 : 8);
    switch (method) {
      case "workspace.get":
        return workspace();
      case "settings.get":
        return settings;
      case "settings.set":
        Object.assign(settings, p);
        emit("settings.changed", { settings });
        return { ok: true };
      case "bookmarks.list":
        return BOOKMARKS;
      case "downloads.list":
        return [];
      case "programs.list":
        return PROGRAMS;
      case "history.list": {
        const query = ((p.query as string) ?? "").toLowerCase();
        return HISTORY.filter((h) => !query || h.title.toLowerCase().includes(query) || h.url.includes(query));
      }
      case "models.list":
        return {
          models: [
            { id: "alibaba/qwen3.8-27b", name: "Qwen 3.8 27B" },
            { id: "openai/gpt-5.6-luna-fast", name: "GPT 5.6 Luna Fast" },
          ],
          source: "static",
        };
      case "models.probe":
        return { ok: true, modelId: (p.modelId as string) || "alibaba/qwen3.8-27b", latencyMs: 42, vision: false };
      case "chrome.importCookies":
        return { ok: true, source: "mock", imported: 0, skipped: 0, domains: 0, detail: "Cookie import is not available in mock." };
      case "programs.run": {
        const id = `run-${Math.random().toString(36).slice(2, 6)}`;
        const run: Run = { runId: id, goal: `program ${(p.programId as string) ?? ""}`, status: "running", pageIds: p.pageId ? [p.pageId as string] : [], createdAt: Date.now(), startedAt: Date.now(), statusMessage: "Running saved program" };
        runs = [run, ...runs];
        emit("run.status", { run }, id);
        steps[id] = [];
        void scriptRun(id);
        return { runId: id };
      }
      case "sets.results":
        return MEMBERS.filter((m) => m.resultId).map((m, i) => ({
          resultId: m.resultId!,
          memberId: m.memberId,
          sourceUrl: m.url!,
          values: { plan: ["Free", "Pro", "Business"][i % 3], price_usd: [0, 8, 15, 10, 12, 20][i], seats: i % 2 ? "per seat" : "flat" },
          observedAt: Date.now() - i * 30_000,
          status: "ok",
        }));
      case "pages.open": {
        const url = (p.url as string) ?? "about:blank";
        const np: PageTarget = { ...makePage(nextId - 1), pageId: `page-${nextId}`, url, title: url === "about:blank" ? "" : hostTitle(url), favicon: undefined, canGoBack: false, loading: url !== "about:blank" };
        nextId++;
        pages = [...pages, np];
        emit("page.added", { page: np });
        if (p.activate) {
          activePageId = np.pageId;
          emit("page.updated", { pageId: np.pageId, activePageId });
        }
        if (np.loading) setTimeout(() => patch(np.pageId, { loading: false, title: hostTitle(url) }), 900);
        return np;
      }
      case "pages.close": {
        const id = p.pageId as string;
        pages = pages.filter((x) => x.pageId !== id);
        if (activePageId === id) activePageId = null;
        emit("page.removed", { pageId: id });
        return { ok: true };
      }
      case "pages.activate":
        activePageId = p.pageId as string;
        return page(activePageId);
      case "pages.navigate": {
        const id = p.pageId as string;
        const url = p.url as string;
        patch(id, { url, loading: true, title: hostTitle(url) });
        for (const l of loadingListeners) l({ pageId: id, loading: true });
        setTimeout(() => {
          patch(id, { loading: false, canGoBack: true });
          for (const l of loadingListeners) l({ pageId: id, loading: false });
        }, 1100);
        return page(id);
      }
      case "pages.reload": {
        const id = p.pageId as string;
        patch(id, { loading: true });
        setTimeout(() => patch(id, { loading: false }), 700);
        return page(id);
      }
      case "pages.back":
      case "pages.forward":
      case "pages.stop":
        return page(p.pageId as string);
      case "pages.resume":
        patch(p.pageId as string, { controller: "agent" });
        emit("page.takeover", { pageId: p.pageId, controller: "agent" });
        runs.filter((r) => r.status === "paused").forEach((r) => patchRun(r.runId, { status: "running", statusMessage: "Resuming — re-observing the page" }, true));
        return page(p.pageId as string);
      case "pages.takeover":
        patch(p.pageId as string, { controller: "human" });
        emit("page.takeover", { pageId: p.pageId, controller: "human" });
        return page(p.pageId as string);
      case "pages.observe":
        return { observation: { ...OBSERVATION, pageId: p.pageId as string } };
      case "pages.engineInput":
        return { ok: true };
      case "pages.scene":
        return {
          kind: "displayList",
          transport: "scene",
          png: false,
          width: 800,
          height: 600,
          itemCount: 2,
          items: [
            { kind: "rect", x: 0, y: 0, w: 800, h: 600, color: "rgb(255,255,255)" },
            { kind: "text", x: 16, y: 32, text: "Vector", size: 18, color: "rgb(0,0,0)" },
          ],
        };
      case "pages.find":
        return { matches: 7, activeMatch: 2 };
      case "pages.stopFind":
      case "bookmarks.add":
      case "bookmarks.remove":
      case "history.clear":
        return { ok: true };
      case "pages.zoom":
        return { level: 0 };
      case "artifacts.read":
        return { artifact: { artifactId: p.artifactId, path: "", mediaType: "application/json", size: 0, status: "complete", createdAt: Date.now() }, dataBase64: btoa(unescape(encodeURIComponent(JSON.stringify(OBSERVATION)))) };
      case "runs.get": {
        const run = runs.find((r) => r.runId === p.runId);
        if (!run) throw new Error("no such run");
        return { run, steps: steps[run.runId] ?? [], modelCalls: run.config?.modelCalls ?? 3 };
      }
      case "runs.list":
        return runs;
      case "runs.start": {
        const id = `run-${Math.random().toString(36).slice(2, 6)}`;
        const run: Run = { runId: id, goal: p.goal as string, status: "planning", pageIds: (p.pageIds as string[]) ?? [], createdAt: Date.now(), startedAt: Date.now(), statusMessage: "Observing the page" };
        runs = [run, ...runs];
        emit("run.status", { run }, id);
        steps[id] = [];
        void scriptRun(id);
        return run;
      }
      case "runs.pause":
        patchRun(p.runId as string, { status: "paused", statusMessage: "Paused" }, true);
        return runs.find((r) => r.runId === p.runId);
      case "runs.resume":
        patchRun(p.runId as string, { status: "running", statusMessage: "Resumed" }, true);
        return runs.find((r) => r.runId === p.runId);
      case "runs.cancel":
        patchRun(p.runId as string, { status: "cancelled", statusMessage: "Cancelled", endedAt: Date.now() }, true);
        return runs.find((r) => r.runId === p.runId);
      case "runs.answer":
        patchRun(p.runId as string, { status: "running", statusMessage: `Answer received — continuing` }, true);
        return runs.find((r) => r.runId === p.runId);
      case "sets.create":
        return SET;
      default:
        throw new Error(`mock: ${method} not implemented`);
    }
  };

  // a freshly started run plays out a short script so the rail can be watched live
  async function scriptRun(id: string) {
    const script = makeSteps(id, 5);
    const target = runs.find((r) => r.runId === id)?.pageIds[0] ?? "page-1";
    await sleep(700);
    patchRun(id, { status: "running", statusMessage: "Opening the files tab" }, true);
    if (pages.some((x) => x.pageId === target)) {
      patch(target, { controller: "agent" });
      emit("page.takeover", { pageId: target, controller: "agent" });
    }
    for (const st of script) {
      await sleep(900);
      emit("model.call", { runId: id, modelId: "alibaba/qwen3.8-27b", role: "planner", durationMs: 1200 + Math.round(Math.random() * 800), costUsd: 0.0031, inputTokens: 2100, outputTokens: 180 }, id);
      steps[id] = [...(steps[id] ?? []), { ...st, pageId: target, startedAt: Date.now() }];
      emit("step.finished", { step: steps[id]![steps[id]!.length - 1] }, id);
      emit("observation.new", { runId: id, observation: { ...OBSERVATION, pageId: target, revision: OBSERVATION.revision + steps[id]!.length } }, id);
      if (!runs.some((r) => r.runId === id && r.status === "running")) return;
    }
    await sleep(800);
    patchRun(id, { status: "completed", statusMessage: "Done — 2 threads still need changes", endedAt: Date.now(), result: { unresolved_accessibility_threads: 2, summary: "Focus ring on the tab strip and aria-selected on sidebar tabs are still open. Reduced-motion handling was accepted." } }, true);
    if (pages.some((x) => x.pageId === target)) {
      patch(target, { controller: "none" });
      emit("page.takeover", { pageId: target, controller: "none" });
    }
  }

  if (withRun && live && scenario === "run") {
    void (async () => {
      await sleep(2000);
      const more = makeSteps(RUN_ID, 9).slice(6);
      for (const st of more) {
        await sleep(2200);
        steps[RUN_ID] = [...(steps[RUN_ID] ?? []), st];
        emit("model.call", { runId: RUN_ID, modelId: "alibaba/qwen3.8-27b", role: "planner", durationMs: 1400, costUsd: 0.0029, inputTokens: 2400, outputTokens: 160 }, RUN_ID);
        emit("step.finished", { step: st }, RUN_ID);
      }
    })();
  }

  const bridge: VectorBridge = {
    invoke,
    onEvent: (cb) => (eventListeners.add(cb), () => eventListeners.delete(cb)),
    onShortcut: () => () => {},
    onDownload: () => () => {},
    onLoading: (cb) => (loadingListeners.add(cb), () => loadingListeners.delete(cb)),
    setStage: async () => true,
    overlay: async () => true,
    preview: async () => null,
    contextMenu: async () => true,
    openExternal: async () => true,
    revealPath: async () => true,
    openPath: async () => "",
    saveFile: async () => null,
    printPage: async () => true,
    devTools: async () => true,
    hardReload: async () => true,
    closeWindow: async () => true,
    openFile: async () => null,
    dataDir: async () => "/Users/you/Library/Application Support/Vector",
    setAppearance: async () => true,
  };
  (window as unknown as { vector: VectorBridge; __vectorMock: boolean }).vector = bridge;
  (window as unknown as { __vectorMock: boolean }).__vectorMock = true;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const hostTitle = (url: string) => {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "") + (u.pathname !== "/" ? ` — ${decodeURIComponent(u.pathname).slice(1, 40)}` : "");
  } catch {
    return url;
  }
};
