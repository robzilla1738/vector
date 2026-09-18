import { describe, it, expect } from "vitest";
import { EventBus, openDb, Repo, RunService, SetService, WorkerPool } from "@vector/runtime";
import type { ModelClient, PageService, SettingsService, ArtifactStore } from "@vector/runtime";
import type { Observation, PageTarget, Program, Run } from "@vector/contracts";

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((res) => {
    const t = setTimeout(res, ms);
    signal?.addEventListener("abort", () => { clearTimeout(t); res(); }, { once: true });
  });

const obs = (pageId: string, url: string): Observation =>
  ({
    pageId,
    documentEpoch: 1,
    revision: 1,
    observedAt: Date.now(),
    scope: "full",
    content: {
      url, title: "t", viewport: { width: 1, height: 1, scale: 1 }, scroll: { y: 0, maxY: 0 }, frames: [],
      headings: [], formFields: [], elements: [], links: [], tables: [], text: "body", truncated: false,
      stats: { elementsTotal: 0, elementsShown: 0 },
    },
  }) as unknown as Observation;

/** Fake PageService: worker pages are plain records; execute is an abortable sleep. */
function fakePages(opts: { execMs: number }) {
  const targets = new Map<string, PageTarget>();
  let n = 0;
  const state = { active: 0, peak: 0, executed: 0 };
  const pages = {
    open: async ({ url }: { url: string }) => {
      const pageId = `p${++n}`;
      const t = { pageId, url, ownedByRuntime: true, backend: "vector", targetId: pageId } as unknown as PageTarget;
      targets.set(pageId, t);
      return t;
    },
    get: (id: string) => {
      const t = targets.get(id);
      if (!t) throw new Error(`no page ${id}`);
      return t;
    },
    isAttached: (id: string) => targets.has(id),
    livePageIds: () => [...targets.keys()],
    navigate: async (id: string, url: string) => { targets.get(id)!.url = url; return targets.get(id)!; },
    observe: async (id: string) => obs(id, targets.get(id)?.url ?? ""),
    execute: async (_p: Program, ctx: { signal?: AbortSignal }) => {
      state.active++;
      state.peak = Math.max(state.peak, state.active);
      await sleep(opts.execMs, ctx.signal);
      state.active--;
      state.executed++;
      return {
        status: ctx.signal?.aborted ? ("cancelled" as const) : ("completed" as const),
        steps: [],
        extracted: { fields: { ok: true } },
      };
    },
    close: async (id: string) => { targets.delete(id); },
  } as unknown as PageService;
  return { pages, state, targets };
}

function harness(opts: { execMs?: number; maxWorkers?: number; model?: ModelClient | null } = {}) {
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const { pages, state } = fakePages({ execMs: opts.execMs ?? 40 });
  const sets = new SetService(repo, events, pages);
  let maxWorkers = opts.maxWorkers ?? 8;
  const settings = {
    maxWorkers: () => maxWorkers,
    perOrigin: () => 8,
    maxModelCalls: () => 8,
    model: () => opts.model ?? null,
    plannerModel: () => "mock/planner",
    recoveryModel: () => undefined,
    visionModel: () => undefined,
    setMaxWorkers: (n: number) => { maxWorkers = n; },
    effectGrants: () => ["effect:read", "effect:write", "effect:destructive", "effect:egress"],
  } as unknown as SettingsService & { setMaxWorkers(n: number): void };
  const artifacts = { save: () => ({ artifactId: "a1" }) } as unknown as ArtifactStore;
  const runs = new RunService({
    repo, events, pages, sets, settings, artifacts,
    translateSteps: (_pid, steps) => steps,
    nativeAvailable: () => false,
  });
  return { repo, events, pages, sets, settings, runs, state };
}

const TERMINAL = new Set<Run["status"]>(["completed", "partially_completed", "failed", "cancelled", "interrupted"]);
async function untilTerminal(repo: Repo, runId: string, timeoutMs = 5000): Promise<Run> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const r = repo.getRun(runId)!;
    if (TERMINAL.has(r.status)) return r;
    await sleep(10);
  }
  throw new Error(`run ${runId} never settled: ${repo.getRun(runId)?.status}`);
}
/** Wait until no member is queued/running (or the timeout passes). */
async function untilMembersSettled(repo: Repo, setId: string, timeoutMs = 3000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ms = repo.listMembers(setId);
    if (!ms.some((m) => m.status === "queued" || m.status === "running")) return ms;
    await sleep(10);
  }
  return repo.listMembers(setId);
}
const urls = (k: number) => Array.from({ length: k }, (_, i) => `http://o${i % 3}.test/m${i}`);
const program = { steps: [{ id: "s1", op: "reload" as const }] };

describe("set-run lifecycle (P0-2 / P1-3)", () => {
  it("cancel stops queued members, marks them skipped, and the run stays cancelled", async () => {
    const h = harness({ execMs: 150, maxWorkers: 1 });
    const set = await h.sets.create({ name: "s", source: "urls", urls: urls(4) });
    const { runId } = await h.runs.mapSet({ setId: set.setId, program });
    await sleep(30); // first member is mid-execute, three are queued behind the 1-worker pool
    h.runs.cancel(runId);
    const run = await untilTerminal(h.repo, runId);
    expect(run.status).toBe("cancelled");
    const members = await untilMembersSettled(h.repo, set.setId);
    await sleep(30); // finishSetRun runs after the members drain
    expect(h.repo.getRun(runId)!.status).toBe("cancelled"); // finishSetRun did not overwrite it
    expect(members.map((m) => m.status)).toEqual(["skipped", "skipped", "skipped", "skipped"]);
    expect(members.some((m) => m.status === "running")).toBe(false);
    expect(h.state.executed).toBeLessThanOrEqual(1);
  });

  it("member agents get the real runId, the run's abort signal, and their model calls are recorded", async () => {
    let seenSignal: AbortSignal | undefined;
    let calls = 0;
    const model: ModelClient = {
      generateStructured: async (o) => {
        calls++;
        seenSignal = o.signal;
        await sleep(30, o.signal);
        return { object: { status: "done", message: "ok", result: { v: calls } } as never, durationMs: 30 };
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const h = harness({ model });
    const set = await h.sets.create({ name: "s", source: "urls", urls: urls(2) });
    const run = await h.runs.start({ goal: "collect", setId: set.setId });
    const done = await untilTerminal(h.repo, run.runId);
    expect(done.status).toBe("completed");
    expect(seenSignal).toBeDefined();
    expect(seenSignal!.aborted).toBe(false);
    const results = h.repo.listResults({ runId: run.runId });
    expect(results.length).toBe(2);
    expect(results.every((r) => r.runId === run.runId)).toBe(true);
    expect(h.repo.listModelCalls(run.runId).length).toBe(calls);
    expect(done.config?.modelCalls).toBe(calls);
    expect(calls).toBeGreaterThan(0);
  });

  it("pilot-then-fan-out: one agent member per site, siblings replay with zero model calls (A9)", async () => {
    let calls = 0;
    let concurrentAgents = 0;
    let peakAgents = 0;
    const model: ModelClient = {
      generateStructured: async (o) => {
        calls++;
        concurrentAgents++;
        peakAgents = Math.max(peakAgents, concurrentAgents);
        await sleep(40, o.signal);
        concurrentAgents--;
        // first call per member: act; second: done
        return calls % 2 === 1
          ? { object: { status: "continue", message: "act", steps: [{ id: "s1", op: "reload" }] } as never, durationMs: 40 }
          : { object: { status: "done", message: "ok", result: { v: 1 } } as never, durationMs: 40 };
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const h = harness({ model, maxWorkers: 8 });
    // 6 members on ONE site: the pilot is the only agent, five replay
    const set = await h.sets.create({ name: "s", source: "urls", urls: Array.from({ length: 6 }, (_, i) => `http://one.test/items/${String(100000 + i)}`) });
    const run = await h.runs.start({ goal: "collect", setId: set.setId });
    const done = await untilTerminal(h.repo, run.runId, 10_000);
    expect(done.status).toBe("completed");
    expect(h.repo.listResults({ runId: run.runId }).length).toBe(6);
    // exactly one member ran the model (2 calls: act, done); everyone else replayed
    expect(calls).toBe(2);
    expect(peakAgents).toBe(1);
    expect(h.repo.listPrograms().some((p) => p.name.startsWith("learned:"))).toBe(true);
  });

  it("cancel aborts the signal member agents are blocked on", async () => {
    let seenSignal: AbortSignal | undefined;
    const model: ModelClient = {
      generateStructured: async (o) => {
        seenSignal = o.signal;
        await sleep(2000, o.signal);
        if (o.signal?.aborted) throw new Error("aborted");
        return { object: { status: "done", message: "ok" } as never, durationMs: 1 };
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const h = harness({ model });
    const set = await h.sets.create({ name: "s", source: "urls", urls: urls(1) });
    const run = await h.runs.start({ goal: "g", setId: set.setId });
    await sleep(40);
    expect(seenSignal?.aborted).toBe(false);
    h.runs.cancel(run.runId);
    const done = await untilTerminal(h.repo, run.runId);
    expect(done.status).toBe("cancelled");
    expect(seenSignal?.aborted).toBe(true);
    const members = await untilMembersSettled(h.repo, set.setId);
    expect(members[0]!.status).toBe("skipped");
  });

  it("honors the per-map concurrency cap below the pool limit", async () => {
    const h = harness({ execMs: 30, maxWorkers: 8 });
    const set = await h.sets.create({ name: "s", source: "urls", urls: urls(6) });
    const { runId } = await h.runs.mapSet({ setId: set.setId, program, concurrency: 2 });
    const run = await untilTerminal(h.repo, runId);
    expect(run.status).toBe("completed");
    expect(h.state.peak).toBeLessThanOrEqual(2);
    expect(h.state.executed).toBe(6);
  });

  it("pause gates members before they start; resume releases them", async () => {
    const h = harness({ execMs: 60, maxWorkers: 1 });
    const set = await h.sets.create({ name: "s", source: "urls", urls: urls(3) });
    const { runId } = await h.runs.mapSet({ setId: set.setId, program });
    await sleep(20);
    const paused = h.runs.pause(runId);
    expect(paused.status).toBe("paused");
    expect(h.runs.isSetRunPaused(runId)).toBe(true);
    await sleep(200); // the in-flight member finishes; nothing else may start
    expect(h.state.executed).toBe(1);
    expect(h.repo.getRun(runId)!.status).toBe("paused");
    const members = h.repo.listMembers(set.setId);
    expect(members.filter((m) => m.status === "completed").length).toBe(1);
    expect(members.filter((m) => m.status === "queued").length).toBe(2);
    const resumed = h.runs.resume(runId);
    expect(resumed.status).toBe("running");
    const run = await untilTerminal(h.repo, runId);
    expect(run.status).toBe("completed");
    expect(h.state.executed).toBe(3);
  });

  it("cancel while paused releases the gate and skips the queued members", async () => {
    const h = harness({ execMs: 30, maxWorkers: 1 });
    const set = await h.sets.create({ name: "s", source: "urls", urls: urls(3) });
    const { runId } = await h.runs.mapSet({ setId: set.setId, program });
    h.runs.pause(runId);
    await sleep(80);
    h.runs.cancel(runId);
    const run = await untilTerminal(h.repo, runId);
    expect(run.status).toBe("cancelled");
    const members = await untilMembersSettled(h.repo, set.setId);
    expect(members.filter((m) => m.status === "skipped").length).toBeGreaterThanOrEqual(2);
    expect(members.some((m) => m.status === "queued" || m.status === "running")).toBe(false);
  });

  it("settings maxWorkers change resizes the pool live", () => {
    const h = harness({ maxWorkers: 2 });
    expect(h.runs.poolStats().active).toBe(0);
    h.settings.setMaxWorkers(5);
    h.runs.refreshPool();
    // WorkerPool.resize is what refreshPool drives — verify its semantics directly
    const pool = new WorkerPool({ maxWorkers: 1, perOrigin: 1 });
    return pool.acquire("http://a.test").then(async (r1) => {
      let second = false;
      const p2 = pool.acquire("http://b.test").then((r) => { second = true; return r; });
      await sleep(10);
      expect(second).toBe(false);
      pool.resize({ maxWorkers: 2 });
      const r2 = await p2;
      expect(second).toBe(true);
      expect(pool.limits().maxWorkers).toBe(2);
      r1();
      r2();
    });
  });
});
