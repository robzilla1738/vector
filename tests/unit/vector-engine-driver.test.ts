/**
 * `vector-engine` driver over a fake native module: the JSON boundary,
 * one-step programs for DriverPage methods, the zero-IPC executeProgram
 * path, ref registration, events derived from results, and error mapping.
 */
import { describe, it, expect, vi } from "vitest";
import {
  VectorEngineDriver,
  parseEngineTargetId,
  probeEngineNative,
  unwrapNative,
  type NativeEngine,
  type NativeModule,
} from "@vector/browser-driver";
import { VectorError, type ObservationContent } from "@vector/contracts";

const content = (over: Partial<ObservationContent> = {}): ObservationContent => ({
  url: "https://x.test/",
  title: "X",
  viewport: { width: 1280, height: 720, scale: 1 },
  scroll: { x: 0, y: 0, maxY: 0 },
  frames: [{ frame: "main", url: "https://x.test/", sameOrigin: true }],
  text: "- document",
  headings: [],
  elements: [{ ref: "r4", frame: "main", tag: "button", role: "button", name: "Go", selector: { role: { role: "button", name: "Go" } } }],
  formFields: [],
  tables: [],
  links: [],
  dialogs: [],
  truncated: false,
  stats: { elementsTotal: 1, elementsShown: 1, textChars: 10, approxTokens: 3 },
  ...over,
});

/** Fake engine: records calls and answers with scripted JSON. */
function fakeNative(script: { routing?: { requiresScript: boolean; reason?: string }; execute?: (steps: unknown[], opts: unknown) => unknown } = {}) {
  const calls: { method: string; args: unknown[] }[] = [];
  let nextPage = 0;
  const engine: NativeEngine = {
    newContext: () => 2,
    open: async (ctx, url) => {
      calls.push({ method: "open", args: [ctx, url] });
      nextPage++;
      return JSON.stringify({ ok: true, page: nextPage, context: ctx, url, title: "X", generation: 0, revision: 1, settled: true, routing: script.routing ?? { requiresScript: false }, responses: [] });
    },
    observe: async (page, optionsJson) => {
      calls.push({ method: "observe", args: [page, JSON.parse(optionsJson ?? "{}")] });
      const opts = JSON.parse(optionsJson ?? "{}") as { scope?: string; subtreeRef?: string };
      if (opts.subtreeRef === "r404") return JSON.stringify({ ok: false, error: { code: "not_found", message: "ref r404 is unknown" } });
      return JSON.stringify({ ok: true, content: content(), revision: 5, generation: 0, settled: true, blockers: [], changed: null });
    },
    execute: async (page, stepsJson, optionsJson) => {
      const steps = JSON.parse(stepsJson) as { id: string; op: string; url?: string; target?: string }[];
      const opts = JSON.parse(optionsJson ?? "{}");
      calls.push({ method: "execute", args: [page, steps, opts] });
      if (script.execute) return JSON.stringify(script.execute(steps, opts));
      type Outcome = { stepId: string; op: string; startedAt: number; durationMs: number; status: string; error?: { code: string; message: string }; extracted?: unknown; detail?: string };
      const outcomes: Outcome[] = steps.map((s) => {
        const base = { stepId: s.id, op: s.op, startedAt: 1, durationMs: 1 };
        if (s.op === "hover" || s.op === "evaluate") return { ...base, status: "failed", error: { code: "capability_unsupported", message: `unsupported: ${s.op}` } };
        if (s.target === "css:#missing") return { ...base, status: "failed", error: { code: "not_found", message: "no element matches" } };
        if (s.op === "extract") return { ...base, status: "ok", extracted: { t: "Title" } };
        if (s.op === "waitFor") return { ...base, status: "ok", detail: "settled=true" };
        return { ...base, status: "ok" };
      });
      const failed = outcomes.find((o) => o.status === "failed");
      const navigated = steps.some((s) => s.op === "navigate");
      return JSON.stringify({
        ok: true,
        status: failed ? "failed" : "completed",
        steps: outcomes,
        extracted: steps.some((s) => s.op === "extract") ? { fields: { t: "Title" } } : null,
        error: failed ? failed.error?.message : null,
        url: navigated ? steps.find((s) => s.op === "navigate")?.url : "https://x.test/",
        title: navigated ? "Second" : "X",
        titleChanged: navigated,
        generation: navigated ? 1 : 0,
        navigated,
        revision: 9,
        responses: [],
        observation: opts.returnObservation ? { ok: true, content: content({ title: "after" }), revision: 10, generation: navigated ? 1 : 0, settled: true } : undefined,
      });
    },
    screenshot: async () => JSON.stringify({ ok: false, error: { code: "capability_unsupported", message: "no gfx" } }),
    close: async (page) => {
      calls.push({ method: "close", args: [page] });
      return JSON.stringify({ ok: true, closed: true });
    },
    getCookies: async (ctx) => {
      calls.push({ method: "getCookies", args: [ctx] });
      return JSON.stringify({ ok: true, cookies: [{ name: "a", value: "1", domain: "x.test", path: "/", secure: false, httpOnly: false }] });
    },
    setCookies: async (ctx, json) => {
      calls.push({ method: "setCookies", args: [ctx, JSON.parse(json)] });
      return JSON.stringify({ ok: true, count: (JSON.parse(json) as unknown[]).length });
    },
    pages: () => [],
    shutdown: () => calls.push({ method: "shutdown", args: [] }),
  };
  const mod: NativeModule = {
    Engine: class {
      constructor(public config?: string | null) {
        calls.push({ method: "new", args: [JSON.parse(config ?? "{}")] });
        return engine as unknown as this;
      }
    } as unknown as NativeModule["Engine"],
    describe: () => JSON.stringify({ abiVersion: 2, engine: "0.0.1", enabled: true, http: true, capabilities: { screenshot: false } }),
    version: () => "0.0.1",
    binaryPath: "/fake/vector-engine.node",
  };
  return { mod, calls, engine };
}

describe("VectorEngineDriver", () => {
  it("connects, opens a target with routing, attaches, observes and registers refs", async () => {
    const { mod, calls } = fakeNative();
    const driver = new VectorEngineDriver({ load: async () => mod, config: { dataDir: "/tmp/d" } });
    expect(driver.isConnected()).toBe(false);
    await driver.connect();
    expect(driver.isConnected()).toBe(true);
    expect(driver.describe()).toMatchObject({ available: true, version: "0.0.1", abiVersion: 2, binaryPath: "/fake/vector-engine.node" });
    expect(calls[0]).toEqual({ method: "new", args: [{ dataDir: "/tmp/d" }] });

    const targetId = await driver.createTarget("https://x.test/");
    expect(parseEngineTargetId(targetId)).toEqual({ contextId: 1, page: 1 });
    expect(driver.routingOf(targetId)).toEqual({ requiresScript: false });
    const page = await driver.attach(targetId, "p1");
    expect(page.identity).toEqual({ pageId: "p1", targetId, backend: "vector-engine" });
    expect(page.url()).toBe("https://x.test/");
    expect(await page.title()).toBe("X");
    expect(page.routing?.()).toEqual({ requiresScript: false });
    expect(await driver.listTargets()).toEqual([{ targetId, url: "https://x.test/", title: "", type: "page" }]);

    const obs = await page.observe({ scope: "forms", maxElements: 10 });
    expect(obs.title).toBe("X");
    expect(calls.at(-1)).toEqual({ method: "observe", args: [1, { scope: "forms", maxElements: 10 }] });
    expect((obs as { engine?: { revision: number } }).engine?.revision).toBe(5);
    expect(driver.refEntry("p1", "r4")?.name).toBe("Go");

    expect(await page.expandRef("r4")).toHaveLength(1);
    expect(calls.at(-1)).toEqual({ method: "observe", args: [1, { scope: "subtree", subtreeRef: "r4", maxElements: 60 }] });
    await expect(page.expandRef("r404")).rejects.toMatchObject({ code: "not_found" });

    await page.dispose();
    expect(calls.at(-1)).toEqual({ method: "close", args: [1] });
    expect(page.isAttached()).toBe(false);
    await expect(page.observe()).rejects.toMatchObject({ code: "target_detached" });
    expect(driver.routingOf(targetId)).toBeUndefined();
  });

  it("maps DriverPage methods onto one-step programs and throws step errors as VectorErrors", async () => {
    const { mod, calls } = fakeNative();
    const driver = new VectorEngineDriver({ load: async () => mod });
    await driver.connect();
    const page = await driver.attach(await driver.createTarget("https://x.test/"), "p1");
    const events = { onNavigated: vi.fn(), onTitleChanged: vi.fn(), onLoading: vi.fn() };
    page.setEvents(events);

    await page.click("r4");
    const exec = calls.at(-1)!;
    expect(exec.method).toBe("execute");
    expect(exec.args[1]).toEqual([{ id: expect.stringMatching(/^ve\d+$/), op: "click", target: "r4" }]);
    await page.fill("css:#q", "boots");
    expect((calls.at(-1)!.args[1] as unknown[])[0]).toMatchObject({ op: "fill", target: "css:#q", value: "boots" });
    await page.select("css:#s", "m");
    await page.check("css:#c");
    await page.scroll({ direction: "down", amount: 200 });
    expect((calls.at(-1)!.args[1] as unknown[])[0]).toMatchObject({ op: "scroll", direction: "down", amount: 200 });
    expect(await page.extract([{ name: "t", selector: "h1" }])).toEqual({ t: "Title" });
    expect(await page.waitFor({ kind: "settled" })).toEqual({ ok: true, timedOut: false, detail: "settled=true" });

    await expect(page.click("css:#missing")).rejects.toMatchObject({ code: "not_found" });
    await expect(page.hover("r4")).rejects.toMatchObject({ code: "capability_unsupported" });
    await expect(page.evaluate("1+1")).rejects.toMatchObject({ code: "capability_unsupported" });
    await expect(page.screenshot()).rejects.toMatchObject({ code: "capability_unsupported" });
    await expect(page.waitForDownload()).rejects.toMatchObject({ code: "capability_unsupported" });

    // navigation is derived from the result: epoch bump + events, refs wiped
    await page.observe();
    expect(driver.refEntry("p1", "r4")).toBeTruthy();
    await page.navigate("https://x.test/two");
    expect(events.onLoading.mock.calls).toEqual(expect.arrayContaining([[true], [false]]));
    expect(events.onNavigated).toHaveBeenCalledWith("https://x.test/two", 1);
    expect(events.onTitleChanged).toHaveBeenCalledWith("Second");
    expect(page.url()).toBe("https://x.test/two");
    expect(driver.refEntry("p1", "r4")).toBeUndefined();
  });

  it("executeProgram sends the whole step list once and returns the inline observation", async () => {
    const { mod, calls } = fakeNative();
    const driver = new VectorEngineDriver({ load: async () => mod });
    await driver.connect();
    const page = await driver.attach(await driver.createTarget("https://x.test/"), "p1");
    const before = calls.length;
    const res = await page.executeProgram!(
      [
        { id: "a", op: "fill", target: "r4", value: "x" },
        { id: "b", op: "extract", fields: [{ name: "t", selector: "h1" }] },
      ],
      { returnObservation: { scope: "full", maxElements: 5 } },
    );
    expect(calls.length - before).toBe(1);
    expect(calls.at(-1)!.args[2]).toEqual({ returnObservation: { scope: "full", maxElements: 5 } });
    expect(res.status).toBe("completed");
    expect(res.steps.map((s) => s.stepId)).toEqual(["a", "b"]);
    expect(res.extracted).toEqual({ fields: { t: "Title" } });
    expect(res.observation?.title).toBe("after");
    expect(driver.refEntry("p1", "r4")).toBeTruthy();

    const aborted = await page.executeProgram!([{ id: "a", op: "click", target: "r4" }], { signal: AbortSignal.abort() });
    expect(aborted.status).toBe("cancelled");
    expect(aborted.steps[0]?.status).toBe("skipped");
  });

  it("exposes context cookies and shuts the engine down on disconnect", async () => {
    const { mod, calls } = fakeNative();
    const driver = new VectorEngineDriver({ load: async () => mod });
    await driver.connect();
    expect(await driver.getAllCookies()).toEqual([{ name: "a", value: "1", domain: "x.test", path: "/", secure: false, httpOnly: false }]);
    expect(await driver.setCookies([{ name: "b", value: "2", domain: "x.test", path: "/", secure: false, httpOnly: false }])).toBe(1);
    const page = await driver.attach(await driver.createTarget("https://x.test/"), "p1");
    await driver.disconnect();
    expect(page.isAttached()).toBe(false);
    expect(calls.at(-1)).toEqual({ method: "shutdown", args: [] });
    expect(driver.isConnected()).toBe(false);
    await expect(driver.createTarget("https://x.test/")).rejects.toMatchObject({ code: "backend_unavailable" });
  });

  it("reports a missing native module without throwing and connect() fails with backend_unavailable", async () => {
    const load = async (): Promise<NativeModule> => {
      throw new Error("no engine binary for linux-x64");
    };
    expect(await probeEngineNative(load)).toEqual({ available: false, error: "no engine binary for linux-x64" });
    const driver = new VectorEngineDriver({ load });
    await expect(driver.connect()).rejects.toMatchObject({ code: "backend_unavailable" });
    expect(driver.describe()).toMatchObject({ available: false });
  });

  it("unwrapNative maps engine error codes and rejects malformed JSON", () => {
    expect(unwrapNative<{ a: number }>('{"ok":true,"a":1}')).toMatchObject({ a: 1 });
    expect(() => unwrapNative('{"ok":false,"error":{"code":"target_detached","message":"gone","detail":{"ref":"r1"}}}')).toThrow(
      expect.objectContaining({ code: "target_detached", detail: { ref: "r1" } }),
    );
    expect(() => unwrapNative('{"ok":false,"error":{"code":"weird","message":"?"}}')).toThrow(expect.objectContaining({ code: "internal" }));
    expect(() => unwrapNative("nope")).toThrow(VectorError);
  });
});
