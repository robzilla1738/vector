import { fixturePage, fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { describe, it, expect, vi } from "vitest";
import { EventBus, openDb, Repo, RunCoordinator } from "@aux/runtime";
import { EarlyDispatcher, PlanStreamParser } from "@aux/runtime";
import { RunMessageQueue } from "../../apps/runtime/src/services/run-messages.js";
import type { ModelClient } from "@aux/runtime";
import type { Observation, PlanStep, ProgramResult } from "@aux/contracts";

const memRepo = () => new Repo(openDb(":memory:"));

describe("PlanStreamParser (A5)", () => {
  it("yields each step as its closing brace arrives and tracks status/pageId", () => {
    const p = new PlanStreamParser();
    const chunks = [
      '{"status":"con',
      'tinue","message":"go","steps":[{"id":"s1","op":"click","target":"r3"},',
      '{"id":"s2","op":"fill","target":"r4","va',
      'lue":"a}b]c"},{"id":"s3","op":"press","key":"Enter"}',
      "]}",
    ];
    const out: unknown[][] = [];
    for (const c of chunks.slice(0, 4)) out.push(p.push(c));
    expect(p.status).toBe("continue");
    expect(out[0]).toEqual([]);
    expect(out[1]).toEqual([{ id: "s1", op: "click", target: "r3" }]);
    expect(out[2]).toEqual([]);
    // braces and brackets inside strings do not confuse the scanner
    expect(out[3]).toEqual([
      { id: "s2", op: "fill", target: "r4", value: "a}b]c" },
      { id: "s3", op: "press", key: "Enter" },
    ]);
    expect(p.complete).toBe(false);
    expect(p.push(chunks[4]!)).toEqual([]);
    expect(p.complete).toBe(true);
    expect(p.steps).toHaveLength(3);
  });

  it("ignores everything inside <think> and only parses after it closes", () => {
    const p = new PlanStreamParser();
    expect(p.push('<think>"status":"done" "steps":[{"op":"x"}] hmm')).toEqual([]);
    expect(p.status).toBeUndefined();
    expect(p.push('</think>{"status":"continue","steps":[{"id":"s1","op":"reload"}]}')).toEqual([{ id: "s1", op: "reload" }]);
    expect(p.status).toBe("continue");
    expect(p.complete).toBe(true);
  });
});

describe("EarlyDispatcher (A5)", () => {
  const ok = (steps: PlanStep[]): ProgramResult => ({
    status: "completed",
    steps: steps.map((s) => ({ stepId: s.id, op: s.op, status: "ok", startedAt: 0, durationMs: 1 })),
  });

  it("batches queued steps while a batch is in flight and preserves order", async () => {
    const batches: PlanStep[][] = [];
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const d = new EarlyDispatcher(async (steps, first) => {
      batches.push(steps);
      if (first) await gate; // first batch is slow; the next two steps must coalesce
      return ok(steps);
    });
    d.offer({ op: "click", target: "r1" });
    d.offer({ op: "fill", target: "r2", value: "x" });
    d.offer({ op: "press", key: "Enter" });
    expect(d.dispatchedCount).toBe(1);
    release();
    await new Promise((r) => setTimeout(r, 0)); // batch 1 settles; s2+s3 go out together
    const result = await d.finish([
      { id: "s1", op: "click", target: "r1" },
      { id: "s2", op: "fill", target: "r2", value: "x" },
      { id: "s3", op: "press", key: "Enter" },
      { id: "s4", op: "reload" }, // never streamed: finish() must run it
    ] as PlanStep[]);
    expect(batches.map((b) => b.map((s) => s.id))).toEqual([["s1"], ["s2", "s3"], ["s4"]]);
    expect(result.status).toBe("completed");
    expect(result.steps.map((s) => s.stepId)).toEqual(["s1", "s2", "s3", "s4"]);
  });

  it("stops after a failed batch and never runs the remainder", async () => {
    const ran: string[] = [];
    const d = new EarlyDispatcher(async (steps) => {
      ran.push(...steps.map((s) => s.id));
      return { status: "failed", error: "boom", steps: [] };
    });
    d.offer({ id: "a", op: "click", target: "r1" });
    await new Promise((r) => setTimeout(r, 0));
    d.offer({ id: "b", op: "reload" });
    const result = await d.finish([{ id: "a", op: "click", target: "r1" }, { id: "b", op: "reload" }, { id: "c", op: "reload" }] as PlanStep[]);
    expect(result.status).toBe("failed");
    expect(result.error).toBe("boom");
    expect(ran).toEqual(["a"]);
  });

  it("halts early dispatch on a step the planner vocabulary rejects", async () => {
    const ran: string[] = [];
    const d = new EarlyDispatcher(async (steps) => {
      ran.push(...steps.map((s) => s.op));
      return ok(steps);
    });
    d.offer({ id: "a", op: "evaluate", expression: "1" }); // trusted-only op
    d.offer({ id: "b", op: "reload" });
    expect(d.dispatchedCount).toBe(0);
    await d.finish([]);
    expect(ran).toEqual([]);
  });

  it("discards pending streamed steps while the running batch settles", async () => {
    const ran: string[] = [];
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    const d = new EarlyDispatcher(async steps => {
      ran.push(...steps.map(step => step.id));
      await gate;
      return ok(steps);
    });
    d.offer({ id: "started", op: "reload" });
    d.offer({ id: "stale", op: "reload" });
    d.discardPending();
    d.offer({ id: "later", op: "reload" });
    release();
    const result = await d.finish([{ id: "started", op: "reload" }, { id: "stale", op: "reload" }, { id: "later", op: "reload" }] as PlanStep[]);
    expect(ran).toEqual(["started"]);
    expect(result.steps.map(step => step.stepId)).toEqual(["started"]);
  });
});

const obs = (): Observation =>
  ({
    pageId: "p1", documentEpoch: 1, revision: 1, observedAt: Date.now(), scope: "full",
    content: {
      url: "http://x.test/", title: "x", viewport: { width: 1, height: 1, scale: 1 }, scroll: { y: 0, maxY: 0 }, frames: [],
      text: "some page text here for the planner", headings: [], elements: [{ ref: "r1", tag: "button", frame: "main" }],
      formFields: [], tables: [], links: [], dialogs: [], truncated: false, stats: { elementsTotal: 1, elementsShown: 1 },
    },
  }) as unknown as Observation;

describe("RunCoordinator streams plans (A5)", () => {
  it("executes step 1 before the model has finished writing the plan", async () => {
    const repo = memRepo();
    const events = new EventBus(repo);
    const executeStarts: number[] = [];
    let streamEndedAt = 0;
    let plannerCalls = 0;
    const model: ModelClient = {
      generateStructured: async (o) => {
        // only the final-answer / non-planner paths land here; finish the run
        return { object: o.schema.parse({ status: "done", message: "Done", result: { ok: true } }), durationMs: 1 };
      },
      streamStructured: async (o) => {
        plannerCalls++;
        const text =
          plannerCalls === 1
            ? '{"status":"continue","message":"go","steps":[{"id":"s1","op":"click","target":"r1"},{"id":"s2","op":"reload"}]}'
            : '{"status":"done","message":"Done","result":{"ok":true}}';
        // trickle the text so a slow executor can start before the end
        for (let i = 0; i < text.length; i += 12) {
          o.onText(text.slice(i, i + 12));
          await new Promise((r) => setTimeout(r, 4));
        }
        streamEndedAt = Date.now();
        return { object: o.schema.parse(JSON.parse(text)), durationMs: 1 };
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const execute = vi.fn(async (program: { steps: PlanStep[] }, ctx: { onStep?: (o: unknown, s: unknown) => void }) => {
      executeStarts.push(Date.now());
      for (const s of program.steps) ctx.onStep?.({ stepId: s.id, op: s.op, status: "ok", startedAt: Date.now(), durationMs: 1, effect: "observed" }, s);
      return { status: "completed", steps: program.steps.map((s) => ({ stepId: s.id, op: s.op, status: "ok", startedAt: 0, durationMs: 1, effect: "observed" })) };
    });
    const coordinatorFixturePages1 = { observe: vi.fn(async () => obs()), execute, capture: vi.fn(), livePageIds: () => ["p1"], get: (fixturePageId: string): import("@aux/contracts").PageTarget => ({ ...fixturePage(fixturePageId, "http://x.test/", 1),  viewStatus: "visible"  }) };
    const coordinator = new RunCoordinator({ turnMentions: fixtureTurnMentions(pageId => coordinatorFixturePages1.get(pageId)),
      repo, events,
      pages: coordinatorFixturePages1 as never,
      model: () => model, defaultModel: () => "m", recoveryModel: () => undefined, recordModelCall: () => {},
      grants: ["effect:read", "effect:write", "effect:destructive", "effect:egress"],
    });
    const run = await coordinator.start({ goal: "g", pageIds: ["p1"] });
    for (let i = 0; i < 200 && !["completed", "failed"].includes(repo.getRun(run.runId)!.status); i++) await new Promise((r) => setTimeout(r, 10));
    expect(repo.getRun(run.runId)!.status).toBe("completed");
    expect(executeStarts.length).toBeGreaterThanOrEqual(1);
    // the first batch started while the stream of the first plan was still open
    expect(executeStarts[0]).toBeLessThan(streamEndedAt);
    const firstCall = execute.mock.calls[0]![0] as { steps: PlanStep[]; documentEpoch?: number };
    expect(firstCall.steps[0]!.id).toBe("s1");
    expect(firstCall.documentEpoch).toBe(1);
    // every step of the plan ran exactly once, in order
    const ran = execute.mock.calls.flatMap((c) => (c[0] as { steps: PlanStep[] }).steps.map((s) => s.id));
    expect(ran).toEqual(["s1", "s2"]);
  });

  it("applies a durable correction without dispatching waiting steps from the old stream", async () => {
    const repo = memRepo();
    const events = new EventBus(repo);
    const refs = [{ pageId: "p1", url: "http://x.test/", documentEpoch: 1 }];
    let plannerCalls = 0;
    let releaseFirst!: () => void;
    const firstBatch = new Promise<void>(resolve => { releaseFirst = resolve; });
    const ran: string[] = [];
    const prompts: string[] = [];
    const model: ModelClient = {
      generateStructured: async options => ({ object: options.schema.parse({ status: "done", result: { ok: true } }), durationMs: 1 }),
      streamStructured: async options => {
        plannerCalls++;
        prompts.push(options.prompt);
        if (plannerCalls === 1) {
          options.onText('{"status":"continue","steps":[{"id":"s1","op":"reload"},');
          options.onText('{"id":"s2","op":"reload"}]}');
          if (!options.signal) throw new Error("planner signal missing");
          await new Promise<never>((_resolve, reject) => options.signal!.addEventListener("abort", () => reject(new Error("steered")), { once: true }));
        }
        const done = { status: "done", message: "Done", result: { ok: true } };
        options.onText(JSON.stringify(done));
        return { object: options.schema.parse(done), durationMs: 1 };
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const execute = vi.fn(async (program: { steps: PlanStep[] }, ctx: { onStep?: (outcome: unknown, step: unknown) => void }) => {
      ran.push(...program.steps.map(step => step.id));
      if (program.steps.some(step => step.id === "s1")) await firstBatch;
      const steps = program.steps.map(step => ({ stepId: step.id, op: step.op, status: "ok" as const, startedAt: Date.now(), durationMs: 1, effect: "observed" as const }));
      steps.forEach((outcome, index) => ctx.onStep?.(outcome, program.steps[index]));
      return { status: "completed" as const, steps };
    });
    const coordinatorFixturePages2 = { observe: vi.fn(async () => obs()), execute, capture: vi.fn(), livePageIds: () => ["p1"], get: (fixturePageId: string): import("@aux/contracts").PageTarget => ({ ...fixturePage(fixturePageId, "http://x.test/", 1),  viewStatus: "visible"  }) };
    const coordinator = new RunCoordinator({ turnMentions: fixtureTurnMentions(pageId => coordinatorFixturePages2.get(pageId)), repo, events,
      pages: coordinatorFixturePages2 as never,
      model: () => model, defaultModel: () => "m", recoveryModel: () => undefined, recordModelCall: () => {},
      grants: ["effect:read", "effect:write", "effect:destructive", "effect:egress"],
    });
    const messages = new RunMessageQueue(repo, events, async () => { throw new Error("not queued"); },
      runId => coordinator.controls.has(runId), runId => coordinator.steer(runId));
    const run = await coordinator.start({ goal: "Read the page", chatId: "chat-steer", pageIds: ["p1"], contextPageRefs: refs });
    await vi.waitFor(() => expect(ran).toEqual(["s1"]));
    messages.steer({ messageId: "11111111-1111-4111-8111-111111111111", runId: run.runId, chatId: "chat-steer",
      text: "Use the latest figures", pageIds: ["p1"], contextPageRefs: refs, expectedRevision: 0 });
    releaseFirst();
    await vi.waitFor(() => expect(repo.getRun(run.runId)?.status).toBe("completed"));
    expect(ran).toEqual(["s1"]);
    expect(plannerCalls).toBe(2);
    expect(prompts[1]).toContain("Use the latest figures");
    expect(repo.getRun(run.runId)?.config?.messageRevision).toBe(1);
    await messages.stop();
    repo.db.close();
  });
});
