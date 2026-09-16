/**
 * PageService + Router with fake drivers (architecture §11):
 *   - auto: engine first; a requiresScript classification reopens on
 *     Chromium, records the origin, and the next open skips the engine
 *   - always / explicit vector-engine: the page stays on the engine
 *   - off: nothing changes for existing users
 *   - mid-program capability_unsupported: page migrates to Chromium,
 *     selector-only remainders replay, ref-targeted ones request REPAIR
 *   - returnObservation on the engine path is one native call
 */
import { describe, it, expect, vi } from "vitest";
import { EventBus, MemoryRouterStore, NullNativeBridge, PageService, Repo, Router, openDb, type DriverSet, type NativeBridge } from "@vector/runtime";
import type { BrowserDriver, DriverPage, ExecuteProgramOptions, ExecuteProgramResult, PageRouting } from "@vector/browser-driver";
import type { EngineMode, ObservationContent, Step } from "@vector/contracts";

const content = (url: string, over: Partial<ObservationContent> = {}): ObservationContent => ({
  url,
  title: "T",
  viewport: { width: 1280, height: 720, scale: 1 },
  scroll: { x: 0, y: 0, maxY: 0 },
  frames: [{ frame: "main", url, sameOrigin: true }],
  text: "- document",
  headings: [],
  elements: [],
  formFields: [],
  tables: [],
  links: [],
  dialogs: [],
  truncated: false,
  stats: { elementsTotal: 0, elementsShown: 0, textChars: 10, approxTokens: 3 },
  ...over,
});

interface FakeOpts {
  backend: "vector" | "vector-engine";
  routing?: PageRouting;
  /** engine: scripted executeProgram */
  execute?: (steps: Step[], opts: ExecuteProgramOptions) => ExecuteProgramResult;
}

/** Minimal driver whose pages record every call. */
function fakeDriver(opts: FakeOpts) {
  const calls: string[] = [];
  const pages: DriverPage[] = [];
  let n = 0;
  const makePage = (targetId: string, pageId: string, url: string): DriverPage => {
    let current = url;
    let attached = true;
    const rec = (s: string): void => {
      calls.push(`${opts.backend}:${s}`);
    };
    const page: DriverPage = {
      identity: { pageId, targetId, backend: opts.backend },
      url: () => current,
      title: async () => "T",
      isAttached: () => attached,
      navigate: async (u) => { rec(`navigate:${u}`); current = u; },
      back: async () => rec("back"), forward: async () => rec("forward"), reload: async () => rec("reload"), stop: async () => rec("stop"),
      click: async (t) => rec(`click:${t}`), dblclick: async (t) => rec(`dblclick:${t}`),
      hover: async (t) => rec(`hover:${t}`), fill: async (t, v) => rec(`fill:${t}=${v}`),
      typeText: async (t, v) => rec(`type:${t}=${v}`), press: async (k) => rec(`press:${k}`),
      check: async (t) => rec(`check:${t}`), uncheck: async (t) => rec(`uncheck:${t}`),
      select: async (t, v) => rec(`select:${t}=${v}`), scroll: async (o) => rec(`scroll:${o.direction}`),
      dragTo: async (t, to) => rec(`drag:${t}->${to}`), clickPoint: async (x, y) => rec(`clickPoint:${x},${y}`),
      uploadFiles: async (t) => rec(`upload:${t}`),
      waitFor: async (c) => { rec(`waitFor:${c.kind}`); return { ok: true, timedOut: false }; },
      waitForDownload: async () => ({ suggestedFilename: "f" }),
      handleDialog: async () => rec("dialog"),
      collectScroll: async () => ({ items: [], collected: 0 }),
      screenshot: async () => ({ buffer: Buffer.alloc(0), width: 0, height: 0, scale: 1 }),
      observe: async () => { rec("observe"); return content(current); },
      expandRef: async () => [],
      extract: async (fields) => { rec(`extract:${fields.map((f) => f.name).join(",")}`); return Object.fromEntries(fields.map((f) => [f.name, `v-${f.name}`])); },
      evaluate: async () => { throw new Error("no"); },
      setEvents: () => {},
      dispose: async () => { rec("dispose"); attached = false; },
    };
    if (opts.execute) {
      page.executeProgram = async (steps, o) => { rec(`executeProgram:${steps.map((s) => s.id).join(",")}${o?.returnObservation ? "+obs" : ""}`); return opts.execute!(steps, o ?? {}); };
    }
    if (opts.backend === "vector-engine") page.routing = () => opts.routing ?? { requiresScript: false };
    pages.push(page);
    return page;
  };
  const targets = new Map<string, string>();
  const driver: BrowserDriver = {
    backend: opts.backend,
    connect: async () => {}, disconnect: async () => {}, isConnected: () => true,
    listTargets: async () => [],
    createTarget: async (url) => { const id = `${opts.backend}-t${++n}`; targets.set(id, url); calls.push(`${opts.backend}:createTarget:${url}`); return id; },
    routingOf: opts.backend === "vector-engine" ? () => opts.routing ?? { requiresScript: false } : undefined,
    attach: async (targetId, pageId) => makePage(targetId, pageId, targets.get(targetId) ?? "about:blank"),
  };
  return { driver, calls, pages };
}

function shellNative(): NativeBridge {
  const ok = async () => ({ ok: true as const });
  return {
    available: () => true,
    createPage: async () => ({ ok: true as const }),
    closePage: ok,
    showPage: ok,
    hidePage: ok,
    focusPage: ok,
    stopPage: ok,
    acquireStage: ok,
    releaseStage: ok,
    capturePage: async () => ({ dataUrl: "" }),
    openExternal: ok,
    findInPage: async () => ({ matches: 0 }),
    stopFind: ok,
    setZoom: async () => ({ level: 1 }),
    setCookies: async () => ({ ok: true, count: 0 }),
    storeSecret: async () => ({ ok: true }),
    readSecret: async () => ({ value: undefined }),
  };
}

function harness(mode: EngineMode, engineOpts: Partial<FakeOpts> = {}, native: NativeBridge = new NullNativeBridge()) {
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const vector = fakeDriver({ backend: "vector" });
  const engine = fakeDriver({ backend: "vector-engine", ...engineOpts });
  const drivers: DriverSet = { vector: vector.driver, chrome: null, engine: engine.driver };
  const store = new MemoryRouterStore();
  const router = new Router({ mode: () => mode, engineAvailable: () => true, store });
  const pages = new PageService({ repo, events, native, drivers: () => drivers, router });
  return { repo, events, pages, router, vector, engine, store };
}

const okResult = (steps: Step[]): ExecuteProgramResult => ({
  status: "completed",
  steps: steps.map((s) => ({ stepId: s.id, op: s.op, status: "ok", startedAt: 1, durationMs: 1 })),
});

describe("pages.open routing", () => {
  it("off: Chromium as before, with routeReason", async () => {
    const h = harness("off");
    const page = await h.pages.open({ url: "https://a.test/", background: true, ownedByRuntime: true });
    expect(page.backend).toBe("vector");
    expect(page.routeReason).toBe("engine-mode-off");
    expect(h.engine.calls).toEqual([]);
    expect(h.vector.calls[0]).toBe("vector:createTarget:about:blank");
  });

  it("auto: engine first, static pages stay on the engine", async () => {
    const h = harness("auto", { execute: okResult });
    const page = await h.pages.open({ url: "https://a.test/", background: true, ownedByRuntime: true });
    expect(page.backend).toBe("vector-engine");
    expect(page.routeReason).toBe("engine-first");
    expect(page.viewStatus).toBe("hidden");
    // the engine gets the real URL (it parses on open), no about:blank detour
    expect(h.engine.calls).toEqual(["vector-engine:createTarget:https://a.test/"]);
    expect(h.vector.calls).toEqual([]);
    expect(h.repo.getPage(page.pageId)?.routeReason).toBe("engine-first");
  });

  it("auto: a visible tab in the desktop shell opens on Chromium", async () => {
    const h = harness("auto", {}, shellNative());
    const page = await h.pages.open({ url: "https://cnn.test/", background: false, ownedByRuntime: false });
    expect(page.backend).toBe("vector");
    expect(page.routeReason).toBe("engine-first:native-view");
    expect(h.engine.calls).toEqual([]);
    expect(h.vector.calls).toEqual(["vector:navigate:https://cnn.test/"]);
  });

  it("auto: a requiresScript classification reopens on Chromium and records the origin", async () => {
    const h = harness("auto", { routing: { requiresScript: true, reason: "empty-app-root(#root)", kind: "requiresScript" } });
    const added: unknown[] = [];
    h.events.subscribe((e) => { if (e.type === "page.added") added.push(e.payload); });
    const page = await h.pages.open({ url: "https://spa.test/app", background: true, ownedByRuntime: true });
    expect(page.backend).toBe("vector");
    expect(page.routeReason).toBe("fallback:empty-app-root(#root)");
    // the engine page was opened, classified, and disposed before Chromium took over
    expect(h.engine.calls).toEqual(["vector-engine:createTarget:https://spa.test/app", "vector-engine:dispose"]);
    expect(h.vector.calls).toEqual(["vector:createTarget:about:blank", "vector:navigate:https://spa.test/app"]);
    expect(added).toHaveLength(1);
    expect(h.router.entries()).toEqual([expect.objectContaining({ origin: "https://spa.test", reason: "empty-app-root(#root)" })]);
    expect(h.store.load()).toHaveLength(1);

    // second open of the same origin skips the engine entirely
    const again = await h.pages.open({ url: "https://spa.test/other", background: true, ownedByRuntime: true });
    expect(again.backend).toBe("vector");
    expect(again.routeReason).toBe("needs-chromium-table:empty-app-root(#root)");
    expect(h.engine.calls).toHaveLength(2);
  });

  it("always and explicit vector-engine keep classified pages on the engine, annotating the reason", async () => {
    const h = harness("always", { routing: { requiresScript: true, reason: "noscript-requires-js" } });
    const page = await h.pages.open({ url: "https://spa.test/", background: true, ownedByRuntime: true });
    expect(page.backend).toBe("vector-engine");
    expect(page.routeReason).toBe("engine-always(classified:noscript-requires-js)");
    expect(h.router.entries()).toEqual([]);
    const explicit = await h.pages.open({ url: "https://spa.test/", backend: "vector-engine", background: true, ownedByRuntime: true });
    expect(explicit.routeReason).toBe("explicit-backend:vector-engine(classified:noscript-requires-js)");
    // explicit Chromium is untouched by the mode
    const off = harness("always");
    const chromium = await off.pages.open({ url: "https://a.test/", backend: "chrome", background: true, ownedByRuntime: true }).catch((e) => e);
    expect(chromium).toMatchObject({ code: "backend_unavailable" }); // no chrome attached in the harness
  });

  it("the needs-chromium table persists in the repo kv", () => {
    const repo = new Repo(openDb(":memory:"));
    repo.saveRouterTable([{ origin: "https://x.test", reason: "r", recordedAt: 1, expiresAt: Date.now() + 10_000 }]);
    const router = new Router({ mode: () => "auto", engineAvailable: () => true, store: { load: () => repo.loadRouterTable(), save: (e) => repo.saveRouterTable(e) } });
    expect(router.decide("https://x.test/", undefined).reason).toBe("needs-chromium-table:r");
    router.recordNeedsChromium("https://y.test/", "s");
    expect(repo.loadRouterTable()).toHaveLength(2);
  });
});

describe("engine execution path", () => {
  it("returnObservation rides the single native call and becomes a stamped Observation", async () => {
    const h = harness("always", {
      execute: (steps, o) => ({ ...okResult(steps), observation: o.returnObservation ? content("https://a.test/", { title: "after", text: "- heading" }) : undefined }),
    });
    const page = await h.pages.open({ url: "https://a.test/", background: true, ownedByRuntime: true });
    const res = await h.pages.execute(
      { pageId: page.pageId, steps: [{ id: "a", op: "click", target: "r1" }] },
      {},
      { returnObservation: { scope: "full" } },
    );
    expect(res.status).toBe("completed");
    expect(res.observation).toMatchObject({ pageId: page.pageId, revision: 1, scope: "full", content: { title: "after" } });
    // one native call carried both the program and the observation — no separate observe
    expect(h.engine.calls.filter((c) => /observe|obs/.test(c))).toEqual(["vector-engine:executeProgram:a+obs"]);
    expect(h.repo.latestObservation(page.pageId)?.revision).toBe(1);
    // second observation diffs against the first
    const res2 = await h.pages.execute({ pageId: page.pageId, steps: [{ id: "b", op: "click", target: "r1" }] }, {}, { returnObservation: {} });
    expect(res2.observation?.revision).toBe(2);
  });

  it("mid-program capability_unsupported (auto): migrates to Chromium, observes, replays selector steps", async () => {
    const h = harness("auto", {
      execute: (steps) => ({
        status: "failed",
        error: "unsupported: hover",
        steps: steps.map((s, i) => ({
          stepId: s.id,
          op: s.op,
          status: i === 0 ? "ok" : i === 1 ? "failed" : "skipped",
          startedAt: 1,
          durationMs: 1,
          error: i === 1 ? { code: "capability_unsupported", message: "unsupported: hover" } : undefined,
        })),
      }),
    });
    const page = await h.pages.open({ url: "https://a.test/list", background: true, ownedByRuntime: true });
    const updated: unknown[] = [];
    h.events.subscribe((e) => { if (e.type === "page.updated") updated.push(e.payload); });
    const res = await h.pages.execute({
      pageId: page.pageId,
      steps: [
        { id: "a", op: "fill", target: "css:#q", value: "x" },
        { id: "b", op: "hover", target: "css:#menu" },
        { id: "c", op: "click", target: "css:#item" },
        { id: "d", op: "extract", fields: [{ name: "t", selector: "h1" }], as: "out" },
      ],
    });
    expect(res.status).toBe("completed");
    expect(res.steps.map((s) => `${s.stepId}:${s.status}`)).toEqual(["a:ok", "b:ok", "c:ok", "d:ok"]);
    expect(res.extracted).toEqual({ out: { t: "v-t" } });
    expect(res.fallback).toEqual({ from: "vector-engine", to: "vector", reason: "mid-program:hover:unsupported: hover", replayedFrom: 1, repair: false });
    // page now lives on Chromium at the same URL, same pageId, new epoch
    const after = h.pages.get(page.pageId);
    expect(after.backend).toBe("vector");
    expect(after.routeReason).toBe("fallback:mid-program:hover:unsupported: hover");
    expect(after.documentEpoch).toBe(1);
    expect(h.vector.calls).toEqual([
      "vector:createTarget:about:blank",
      "vector:navigate:https://a.test/list",
      "vector:observe",
      "vector:hover:css:#menu",
      "vector:click:css:#item",
      "vector:extract:t",
    ]);
    expect(h.engine.calls).toContain("vector-engine:dispose");
    expect(h.router.entries()[0]).toMatchObject({ origin: "https://a.test" });
    expect(updated.some((p) => (p as { backend?: string }).backend === "vector")).toBe(true);
    // the page keeps working on the new driver
    const more = await h.pages.execute({ pageId: page.pageId, steps: [{ id: "e", op: "click", target: "css:#next" }] });
    expect(more.status).toBe("completed");
    expect(h.vector.calls.at(-1)).toBe("vector:click:css:#next");
  });

  it("mid-program fallback with ref-targeted remainders requests REPAIR instead of replaying", async () => {
    const h = harness("auto", {
      execute: (steps) => ({
        status: "failed",
        error: "unsupported: dblclick",
        steps: steps.map((s, i) => ({
          stepId: s.id, op: s.op, status: i === 0 ? "failed" : "skipped", startedAt: 1, durationMs: 1,
          error: i === 0 ? { code: "capability_unsupported", message: "unsupported: dblclick" } : undefined,
        })),
      }),
    });
    const page = await h.pages.open({ url: "https://b.test/", background: true, ownedByRuntime: true });
    const res = await h.pages.execute({
      pageId: page.pageId,
      steps: [
        { id: "a", op: "dblclick", target: "r12" },
        { id: "b", op: "click", target: "css:#ok" },
      ],
    });
    expect(res.status).toBe("failed");
    expect(res.error).toMatch(/^REPAIR: 1 ref-targeted step\(s\) \(a\)/);
    expect(res.fallback).toMatchObject({ repair: true, refSteps: ["a"], replayedFrom: 0 });
    expect(res.steps.map((s) => s.status)).toEqual(["failed", "skipped"]);
    expect(h.pages.get(page.pageId).backend).toBe("vector");
    // a fresh observation was taken on Chromium so the planner can REPAIR against it
    expect(h.vector.calls).toContain("vector:observe");
    expect(h.vector.calls.some((c) => c.startsWith("vector:click"))).toBe(false);
  });

  it("always mode never falls back mid-program", async () => {
    const h = harness("always", {
      execute: (steps) => ({
        status: "failed", error: "unsupported: hover",
        steps: steps.map((s) => ({ stepId: s.id, op: s.op, status: "failed", startedAt: 1, durationMs: 1, error: { code: "capability_unsupported", message: "unsupported: hover" } })),
      }),
    });
    const page = await h.pages.open({ url: "https://c.test/", background: true, ownedByRuntime: true });
    const res = await h.pages.execute({ pageId: page.pageId, steps: [{ id: "a", op: "hover", target: "css:#m" }] });
    expect(res.status).toBe("failed");
    expect(res.fallback).toBeUndefined();
    expect(h.pages.get(page.pageId).backend).toBe("vector-engine");
    expect(h.vector.calls).toEqual([]);
  });

  it("the executor still records per-step outcomes on the zero-IPC path", async () => {
    const onStep = vi.fn();
    const h = harness("always", { execute: okResult });
    const page = await h.pages.open({ url: "https://d.test/", background: true, ownedByRuntime: true });
    await h.pages.execute({ pageId: page.pageId, steps: [{ id: "a", op: "click", target: "r1" }, { id: "b", op: "press", key: "Enter" }] }, { onStep });
    expect(onStep).toHaveBeenCalledTimes(2);
    expect(onStep.mock.calls.map((c) => (c[1] as Step).id)).toEqual(["a", "b"]);
    // model-authored programs still cannot reach page JS on the engine path
    await expect(
      h.pages.execute({ pageId: page.pageId, steps: [{ id: "e", op: "evaluate", expression: "1" }] }, { allowEval: false }),
    ).rejects.toMatchObject({ code: "invalid_params" });
  });
});

describe("native takeover vs agent input", () => {
  it("Playwright clicks during execute do not claim the page", async () => {
    const h = harness("off");
    const page = await h.pages.open({ url: "https://a.test/", background: true, ownedByRuntime: true });
    let during = "";
    const dp = h.vector.pages[0];
    const click = dp.click.bind(dp);
    dp.click = async (t) => {
      h.pages.onNativeTakeover(page.pageId);
      during = h.pages.get(page.pageId).controller;
      return click(t);
    };
    const res = await h.pages.execute(
      { pageId: page.pageId, steps: [{ id: "a", op: "click", target: "css:#x" }] },
      { runId: "run-1" },
    );
    expect(res.status).toBe("completed");
    expect(during).toBe("agent");
    expect(h.pages.get(page.pageId).controller).toBe("agent");
    h.pages.releaseAgent(page.pageId);
    expect(h.pages.get(page.pageId).controller).toBe("none");
  });

  it("a click after the program still takeovers", async () => {
    const h = harness("off");
    const page = await h.pages.open({ url: "https://a.test/", background: true, ownedByRuntime: true });
    await h.pages.execute(
      { pageId: page.pageId, steps: [{ id: "a", op: "click", target: "css:#x" }] },
      { runId: "run-1" },
    );
    expect(h.pages.get(page.pageId).controller).toBe("agent");
    h.pages.onNativeTakeover(page.pageId);
    expect(h.pages.get(page.pageId).controller).toBe("human");
  });
});
