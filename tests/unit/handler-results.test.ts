import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ArtifactStore, EventBus, makeInvoker, openDb, Repo, RunService, SetService, substituteParameters } from "@vector/runtime";
import type { PageService, Services, SettingsService } from "@vector/runtime";
import { MethodSchemas, ResultSchemas, RunsStartParams, type MethodName, type PageTarget, type Program } from "@vector/contracts";

/**
 * Handler results must parse against ResultSchemas — the contracts package
 * is the single source of truth clients (CLI, MCP, renderer) type against.
 * A representative set that runs without a browser: sets, runs, programs,
 * settings, history/bookmarks, workspace, describe.
 */

let dir: string;
let invoke: ReturnType<typeof makeInvoker>;
let repo: Repo;
const executed: { program: Program; ctx: unknown }[] = [];

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "vector-handlers-"));
  repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const page = {
    pageId: "p1", backend: "vector", targetId: "t1", url: "http://x.test/", title: "x",
    documentEpoch: 0, lastRevision: 0, viewStatus: "visible", controller: "none", controllerEpoch: 0,
    ownedByRuntime: false, createdAt: Date.now(), lastActiveAt: Date.now(),
  } as PageTarget;
  const pages = {
    list: () => [page],
    get: (id: string) => {
      if (id !== "p1") throw new Error(`no page ${id}`);
      return page;
    },
    isAttached: () => true,
    livePageIds: () => ["p1"],
    activePageId: "p1",
    execute: async (program: Program, ctx: unknown) => {
      executed.push({ program, ctx });
      return { status: "completed" as const, steps: [], extracted: { fields: { done: true } } };
    },
    extract: async () => ({ pageId: "p1", documentEpoch: 0, revision: 1, fields: { title: "x" } }),
    waitFor: async () => ({ ok: true, timedOut: false, detail: "ready", status: "completed" }),
    console: async () => ({ lines: [{ level: "log", message: "hi", atMs: 1 }] }),
    dialog: async () => ({ action: "list" as const, dialogs: [], pending: null }),
    network: async () => [],
  } as unknown as PageService;
  const sets = new SetService(repo, events, pages);
  const settings = {
    maxWorkers: () => 2, perOrigin: () => 2, maxModelCalls: () => 8, model: () => null, plannerModel: () => "m",
    recoveryModel: () => undefined, visionModel: () => undefined,
    all: () => ({ plannerModel: "m", maxWorkers: 2, dataDir: dir }),
    set: () => ({ ok: true as const }),
  } as unknown as SettingsService;
  const artifacts = new ArtifactStore(dir, repo, events);
  const runs = new RunService({ repo, events, pages, sets, settings, artifacts, translateSteps: (_p, s) => s, nativeAvailable: () => false });
  const services: Services = {
    pages, sets, runs, artifacts, settings, events, repo,
    drivers: () => ({ vector: null, chrome: null }),
    chromeAttach: async () => ({}), chromeDetach: async () => ({ ok: true }), chromeTabs: async () => [],
    importCookies: async () => ({}), benchRun: async () => ({ reportPath: "" }),
  };
  invoke = makeInvoker(services);
});
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const call = async (method: MethodName, params: unknown = {}) => {
  const result = await invoke(method, params);
  const parsed = ResultSchemas[method].safeParse(result);
  expect(parsed.success, `${method}: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 3))}`).toBe(true);
  return result as never;
};

describe("handler results conform to ResultSchemas", () => {
  it("sets.*", async () => {
    const set = await call("sets.create", { name: "s", source: "urls", urls: ["http://a.test/1", "http://b.test/2"] });
    await call("sets.get", { setId: (set as { setId: string }).setId });
    await call("sets.list");
    const { runId } = (await call("sets.map", { setId: (set as { setId: string }).setId, program: { steps: [{ id: "s1", op: "reload" }] }, concurrency: 1 })) as { runId: string };
    for (let i = 0; i < 100 && !["completed", "failed", "partially_completed"].includes(repo.getRun(runId)!.status); i++)
      await new Promise((r) => setTimeout(r, 10));
    await call("sets.results", { setId: (set as { setId: string }).setId });
    await call("runs.get", { runId });
  });

  it("runs.* incl. modelCalls on runs.get and control results", async () => {
    repo.saveRun({ runId: "run_x", goal: "g", status: "running", pageIds: ["p1"], createdAt: Date.now() });
    const got = (await call("runs.get", { runId: "run_x" })) as { modelCalls: number };
    expect(got.modelCalls).toBe(0);
    await call("runs.list", { limit: 10 });
    await call("runs.pause", { runId: "run_x" });
    await call("runs.resume", { runId: "run_x" });
    await call("runs.cancel", { runId: "run_x" });
    await call("runs.events", { sinceSeq: 0, limit: 50 });
    await call("events.since", { sinceSeq: 0, limit: 50 });
  });

  it("programs.* and programs.run applies {{param}} substitution", async () => {
    const saved = (await call("programs.save", {
      name: "greet",
      steps: [{ id: "s1", op: "fill", target: "css:#q", value: "hello {{who}}" }, { id: "s2", op: "navigate", url: "https://x.test/{{path}}" }],
      parameters: ["who", "path"],
    })) as { programId: string };
    await call("programs.list");
    await call("programs.validate", { program: { pageId: "p1", steps: [{ id: "a", op: "reload" }] } });

    await expect(invoke("programs.run", { programId: saved.programId, pageId: "p1", parameters: { who: "x" } })).rejects.toMatchObject({
      code: "invalid_params",
      detail: { missing: ["path"] },
    });
    executed.length = 0;
    const { runId } = (await call("programs.run", { programId: saved.programId, pageId: "p1", parameters: { who: 'Ada "the" Lovelace', path: "a/b" } })) as { runId: string };
    for (let i = 0; i < 100 && !executed.length; i++) await new Promise((r) => setTimeout(r, 5));
    const steps = executed[0]!.program.steps!;
    expect((steps[0] as { value: string }).value).toBe('hello Ada "the" Lovelace');
    expect((steps[1] as { url: string }).url).toBe("https://x.test/a/b");
    for (let i = 0; i < 100 && repo.getRun(runId)!.status === "running"; i++) await new Promise((r) => setTimeout(r, 5));
    expect(repo.getRun(runId)!.status).toBe("completed");
    await call("programs.delete", { programId: saved.programId });
  });

  it("settings / history / bookmarks / downloads / sessions / workspace / describe", async () => {
    await call("settings.get");
    await call("settings.set", { maxWorkers: 3 });
    repo.addHistory("http://x.test/", "x", "p1");
    await call("history.list", { limit: 10 });
    await call("bookmarks.add", { url: "http://x.test/", title: "x" });
    await call("bookmarks.list");
    await call("bookmarks.remove", { url: "http://x.test/" });
    await call("downloads.list");
    await call("sessions.list");
    await call("workspace.get");
    await call("runtime.describe");
    await call("history.clear");
  });

  it("pages.extract / waitFor / console / dialog / network", async () => {
    await call("pages.extract", { pageId: "p1", fields: ["title"] });
    await call("pages.waitFor", { pageId: "p1", condition: { kind: "settled" } });
    await call("pages.console", { pageId: "p1" });
    await call("pages.dialog", { pageId: "p1" });
    await call("pages.network", { pageId: "p1" });
  });
});

describe("contracts drift fixes", () => {
  it("runs.start keeps context (max 20k) instead of stripping it", () => {
    const p = RunsStartParams.parse({ goal: "g", pageId: "p1", context: "earlier turns" });
    expect(p.context).toBe("earlier turns");
    expect(RunsStartParams.safeParse({ goal: "g", context: "x".repeat(20_001) }).success).toBe(false);
    expect(Object.keys(MethodSchemas)).toContain("runs.start");
  });

  it("substituteParameters escapes values and reports every missing name", () => {
    expect(substituteParameters('{"v":"{{a}}-{{ b }}"}', { a: "1", b: 'q"x' })).toBe('{"v":"1-q\\"x"}');
    expect(JSON.parse(substituteParameters('{"v":"{{a}}"}', { a: "line\nbreak" }))).toEqual({ v: "line\nbreak" });
    expect(() => substituteParameters('{"v":"{{a}} {{b}}"}', {})).toThrow(/parameters: a, b/);
    expect(substituteParameters('{"v":"plain"}', { unused: "x" })).toBe('{"v":"plain"}');
  });
});
