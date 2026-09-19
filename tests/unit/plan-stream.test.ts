import { describe, it, expect, vi } from "vitest";
import { EventBus, openDb, Repo, RunCoordinator } from "@vector/runtime";
import { EarlyDispatcher, PlanStreamParser } from "@vector/runtime";
import type { ModelClient } from "@vector/runtime";
import type { Observation, PlanStep, ProgramResult } from "@vector/contracts";

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
      for (const s of program.steps) ctx.onStep?.({ stepId: s.id, op: s.op, status: "ok", startedAt: Date.now(), durationMs: 1 }, s);
      return { status: "completed", steps: program.steps.map((s) => ({ stepId: s.id, op: s.op, status: "ok", startedAt: 0, durationMs: 1 })) };
    });
    const coordinator = new RunCoordinator({
      repo, events,
      pages: { observe: vi.fn(async () => obs()), execute, capture: vi.fn(), livePageIds: () => ["p1"], get: () => ({ viewStatus: "visible" }) } as never,
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
});
