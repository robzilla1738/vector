/**
 * `vector-engine` driver over a fake native module: the JSON boundary,
 * one-step programs for DriverPage methods, the zero-IPC executeProgram
 * path, ref registration, events derived from results, and error mapping.
 */
import { createServer, type AddressInfo, type Server } from "node:net";
import { describe, it, expect, vi } from "vitest";
import {
  VectorEngineDriver,
  BrowserServiceClient,
  decodeFerry,
  encodeFerry,
  parseEngineTargetId,
  probeEngineNative,
  unwrapNative,
  type NativeEngine,
  type NativeModule,
} from "@vector/browser-driver";
import { VectorError, type ObservationContent } from "@vector/contracts";

function mockBrowserService(): Promise<{ addr: string; shutdown(): void; server: Server }> {
  const state = { controller: "none", controllerEpoch: 0 };
  return new Promise((resolve, reject) => {
    const server = createServer((socket) => {
      let buf = "";
      socket.setEncoding("utf8");
      socket.on("data", (chunk: string) => {
        buf += chunk;
        for (;;) {
          const nl = buf.indexOf("\n");
          if (nl < 0) break;
          const line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (!line.trim()) continue;
          const req = JSON.parse(line) as { id: number; method: string; params?: Record<string, unknown> };
          if (req.method === "pages.execute" && state.controller === "human") {
            socket.write(
              `${JSON.stringify({
                jsonrpc: "2.0",
                id: req.id,
                error: { code: "conflict", message: "page is under human control — resume first" },
              })}\n`,
            );
            continue;
          }
          let result: Record<string, unknown> = { ok: true };
          if (req.method === "identity") {
            result = {
              engine: "vector-engine",
              service: "browser-service",
              chromium: false,
              controller: state.controller,
              controllerEpoch: state.controllerEpoch,
            };
          } else if (req.method === "pages.open") {
            result = { ok: true, page: 1, url: (req.params?.url as string | undefined) ?? "about:blank", title: "X" };
          } else if (req.method === "pages.observe") {
            result = { ok: true, content: content(), documentEpoch: 1 };
          } else if (req.method === "pages.execute") {
            result = { ok: true, status: "completed", steps: [] };
          } else if (req.method === "pages.takeover") {
            state.controller = "human";
            state.controllerEpoch += 1;
            result = { controller: "human", controllerEpoch: state.controllerEpoch, service: "browser-service" };
          } else if (req.method === "pages.resume") {
            state.controller = "none";
            state.controllerEpoch += 1;
            result = { controller: "none", controllerEpoch: state.controllerEpoch, service: "browser-service" };
          } else if (req.method === "input.event") {
            result = { ok: true, chromium: false, event: req.params };
          }
          socket.write(`${JSON.stringify({ jsonrpc: "2.0", id: req.id, result })}\n`);
        }
      });
    });
    server.listen(0, "127.0.0.1", () => {
      const port = (server.address() as AddressInfo).port;
      resolve({
        addr: `127.0.0.1:${port}`,
        shutdown: () => {
          server.close();
        },
        server,
      });
    });
    server.once("error", reject);
  });
}

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
      const steps = JSON.parse(stepsJson) as { id: string; op: string; url?: string; target?: string; condition?: { kind?: string } }[];
      const opts = JSON.parse(optionsJson ?? "{}");
      calls.push({ method: "execute", args: [page, steps, opts] });
      if (script.execute) return JSON.stringify(script.execute(steps, opts));
      type Outcome = { stepId: string; op: string; startedAt: number; durationMs: number; status: string; error?: { code: string; message: string }; extracted?: unknown; detail?: string };
      const outcomes: Outcome[] = steps.map((s) => {
        const base = { stepId: s.id, op: s.op, startedAt: 1, durationMs: 1 };
        if (s.op === "hover" || s.op === "evaluate") return { ...base, status: "failed", error: { code: "capability_unsupported", message: `unsupported: ${s.op}` } };
        if (s.target === "css:#missing") return { ...base, status: "failed", error: { code: "not_found", message: "no element matches" } };
        if (s.op === "extract") return { ...base, status: "ok", extracted: { t: "Title" } };
        if (s.op === "waitFor" && s.condition?.kind === "downloadCompleted") return { ...base, status: "ok", detail: "report.pdf" };
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
    await expect(page.waitForDownload()).resolves.toEqual({ suggestedFilename: "report.pdf" });

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

  it("prefers observeBuf/executeBuf/screenshotPng when the native module exposes them", async () => {
    const { mod, calls, engine } = fakeNative();
    engine.observeBuf = async (page, options) => {
      calls.push({ method: "observeBuf", args: [page, options] });
      return Buffer.from(JSON.stringify({ ok: true, content: content(), revision: 5, generation: 0, settled: true, blockers: [], changed: null }));
    };
    engine.executeBuf = async (page, steps, options) => {
      calls.push({ method: "executeBuf", args: [page, steps, options] });
      return Buffer.from(JSON.stringify({
        ok: true, status: "completed",
        steps: [{ stepId: "ve1", op: "click", startedAt: 1, durationMs: 1, status: "ok" }],
        extracted: null, error: null, url: "https://x.test/", title: "X", titleChanged: false,
        generation: 0, navigated: false, revision: 9, responses: [],
      }));
    };
    engine.screenshotPng = async (page, fullPage) => {
      calls.push({ method: "screenshotPng", args: [page, fullPage] });
      return { width: 2, height: 1, scale: 1, fullPage: !!fullPage, png: Buffer.from([137, 80, 78, 71]) };
    };
    const driver = new VectorEngineDriver({ load: async () => mod });
    await driver.connect();
    const page = await driver.attach(await driver.createTarget("https://x.test/"), "p1");
    await page.observe();
    expect(calls.some((c) => c.method === "observeBuf")).toBe(true);
    await page.click("r4");
    expect(calls.some((c) => c.method === "executeBuf")).toBe(true);
    const shot = await page.screenshot();
    expect(shot.width).toBe(2);
    expect(shot.buffer[0]).toBe(137);
    expect(calls.some((c) => c.method === "screenshotPng")).toBe(true);
    const observeCall = calls.find((c) => c.method === "observeBuf");
    expect(observeCall).toBeTruthy();
    const sent = observeCall?.args[1] as Buffer;
    expect(sent.subarray(0, 4).toString("ascii")).toBe("VEJ1");
    expect(decodeFerry(sent)).toBeTruthy();
  });

  it("typed ferry round-trips JSON and still reads raw UTF-8", () => {
    const json = JSON.stringify({ ok: true, n: 1 });
    expect(decodeFerry(encodeFerry(json))).toBe(json);
    expect(decodeFerry(Buffer.from(json, "utf8"))).toBe(json);
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

  it("Finding 1: Node takeover stops a second BrowserService client", async () => {
    const owned = await mockBrowserService();
    const driver = new VectorEngineDriver({
      ownService: true,
      startService: async () => ({ addr: owned.addr, shutdown: owned.shutdown }),
    });
    await driver.connect();
    await driver.createTarget("https://share.test/");
    const peer = new BrowserServiceClient(owned.addr);
    await peer.connect();
    await expect(
      peer.call("pages.execute", { program: [{ id: "a", op: "click", target: "css:#n" }] }),
    ).resolves.toMatchObject({ status: "completed" });
    const taken = await driver.takeover();
    expect(taken).toMatchObject({ controller: "human", controllerEpoch: 1 });
    await expect(
      peer.call("pages.execute", { program: [{ id: "x", op: "click", target: "css:#n" }] }),
    ).rejects.toMatchObject({ code: "conflict", message: /human control/i });
    const resumed = await driver.resume();
    expect(resumed).toMatchObject({ controller: "none", controllerEpoch: 2 });
    await expect(
      peer.call("pages.execute", { program: [{ id: "y", op: "click", target: "css:#n" }] }),
    ).resolves.toMatchObject({ status: "completed" });
    peer.close();
    await driver.disconnect();
  });

  it("Finding 1: human input.event still types after takeover", async () => {
    const owned = await mockBrowserService();
    const driver = new VectorEngineDriver({
      ownService: true,
      startService: async () => ({ addr: owned.addr, shutdown: owned.shutdown }),
    });
    await driver.connect();
    const targetId = await driver.createTarget("https://share.test/");
    const page = await driver.attach(targetId, "page-h");
    await driver.takeover();
    await expect(page.click("css:#t")).rejects.toMatchObject({ code: "conflict" });
    await page.humanEvent?.({ type: "ime", text: "typed-by-human" });
    const peer = new BrowserServiceClient(owned.addr);
    await peer.connect();
    await expect(peer.call("input.event", { type: "ime", text: "more" })).resolves.toMatchObject({ ok: true });
    peer.close();
    await driver.disconnect();
  });

  it("Finding 1: ownService starts BrowserService and Node attaches as a client", async () => {
    const owned = await mockBrowserService();
    const driver = new VectorEngineDriver({
      ownService: true,
      startService: async () => ({ addr: owned.addr, shutdown: owned.shutdown }),
    });
    await driver.connect();
    expect(driver.describe()).toMatchObject({
      available: true,
      version: "browser-service",
      isolation: "process",
      capabilities: { service: true },
    });
    const targetId = await driver.createTarget("https://x.test/");
    expect(parseEngineTargetId(targetId)).toEqual({ contextId: 1, page: 1 });
    await driver.disconnect();
    expect(driver.isConnected()).toBe(false);
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
