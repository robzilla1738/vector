import { describe, it, expect, vi } from "vitest";
import { openDb, Repo, RunCoordinator } from "@vector/runtime";
import { EventBus } from "@vector/runtime";
import type { ModelClient } from "@vector/runtime";
import type { Observation, StepOutcome } from "@vector/contracts";

const obs = (over: { elements?: number; text?: string } = {}): Observation => ({
  observationId: "o1",
  pageId: "p1",
  documentEpoch: 1,
  revision: 1,
  observedAt: Date.now(),
  scope: "full",
  content: {
    url: "http://x.test/",
    title: "x",
    viewport: { width: 1000, height: 800, scale: 1 },
    scroll: { x: 0, y: 0, maxY: 0 },
    frames: [],
    text: over.text ?? "a normal page with plenty of readable text content",
    headings: [],
    elements: Array.from({ length: over.elements ?? 5 }, (_, i) => ({
      ref: `r${i + 1}`,
      tag: "button",
      frame: "main",
    })) as Observation["content"]["elements"],
    formFields: [],
    tables: [],
    links: [],
    dialogs: [],
    truncated: false,
    stats: { elementsTotal: over.elements ?? 5, elementsShown: over.elements ?? 5, textChars: 40, approxTokens: 10 },
  },
});

const WRITE_LIKE = new Set([
  "click", "dblclick", "fill", "type", "press", "select", "check", "uncheck",
  "navigate", "submit", "hover", "scroll", "dragTo", "clickPoint", "reload",
]);

const doneOutcome = (stepId: string, op: string): StepOutcome => ({
  stepId,
  op,
  status: "ok",
  startedAt: Date.now(),
  durationMs: 1,
  ...(WRITE_LIKE.has(op)
    ? { receipt: { observed: `${op} dispatched`, remoteConfirmed: false, uncertain: false, dispatchedBeforeTakeover: false } }
    : {}),
});

function harness(opts: {
  structuredPlan: unknown;
  /** planner responses after the first; falls back to repeating the last */
  thenPlans?: unknown[];
  visionText: string;
  executeFails?: number;
  observeOverride?: Observation;
}) {
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const modelCalls: { role: string; modelId: string }[] = [];
  const executeCalls: { steps: number }[] = [];
  let executeFailures = opts.executeFails ?? 0;
  const plans = [opts.structuredPlan, ...(opts.thenPlans ?? [])];

  const generateStructured = vi.fn(async (_opts: { modelId: string; prompt: string }) => ({ object: (plans.length > 1 ? plans.shift()! : plans[0]) as never, durationMs: 5 }));
  const generateText = vi.fn(async (_opts: { modelId: string; prompt: string; imageDataUrl?: string }) => ({ text: opts.visionText, durationMs: 7 }));
  const model = {
    generateStructured,
    generateText,
    listModels: vi.fn(async () => []),
  } as unknown as ModelClient;

  const pages = {
    observe: vi.fn(async () => opts.observeOverride ?? obs()),
    execute: vi.fn(async (program: { steps: { id: string; op: string }[] }, ctx: { onStep?: (o: StepOutcome, s: unknown) => void }) => {
      executeCalls.push({ steps: program.steps.length });
      if (executeFailures-- > 0) {
        return { status: "failed" as const, steps: [], error: "locator not found" };
      }
      for (const s of program.steps) ctx.onStep?.(doneOutcome(s.id, s.op), s);
      return { status: "completed" as const, steps: program.steps.map((s) => doneOutcome(s.id, s.op)) };
    }),
    capture: vi.fn(async () => ({ dataUrl: "data:image/png;base64,AAAA", width: 100, height: 100, scale: 1 })),
  };

  const coordinator = new RunCoordinator({
    repo,
    events,
    pages: pages as never,
    model: () => model,
    defaultModel: () => "test/planner",
    recoveryModel: () => undefined,
    visionModel: () => "test/vision",
    recordModelCall: (c) => modelCalls.push({ role: c.role, modelId: c.modelId }),
    grants: ["effect:read", "effect:write", "effect:destructive", "effect:egress"],
  });
  return { repo, coordinator, model, generateStructured, generateText, pages, modelCalls, executeCalls };
}

async function waitForRun(repo: Repo, runId: string, ms = 5000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const r = repo.getRun(runId);
    if (r && ["completed", "partially_completed", "failed", "cancelled", "interrupted"].includes(r.status)) return r;
    await new Promise((r) => setTimeout(r, 25));
  }
  throw new Error("run did not finish");
}

describe("vision fallback", () => {
  it("re-plans from a screenshot after a chunk fails, using the vision model", async () => {
    const h = harness({
      executeFails: 1,
      structuredPlan: { status: "continue", message: "clicking", steps: [{ id: "s1", op: "click", target: "r1" }] },
      visionText: `sure! {"status":"done","message":"done","result":{"ok":true}}`,
    });
    const run = await h.coordinator.start({ goal: "do it", pageIds: ["p1"] });
    const final = await waitForRun(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toEqual({ ok: true });
    expect(h.generateText).toHaveBeenCalledOnce();
    const call = h.generateText.mock.calls[0]?.[0];
    expect(call?.imageDataUrl).toMatch(/^data:image\/png/);
    expect(call?.modelId).toBe("test/vision");
    expect(h.modelCalls.some((c) => c.role === "vision" && c.modelId === "test/vision")).toBe(true);
    expect(h.pages.capture).toHaveBeenCalledOnce();
  });

  it("uses vision first when the structured observation is empty", async () => {
    const h = harness({
      observeOverride: obs({ elements: 0, text: "" }),
      structuredPlan: { status: "done", message: "ok", result: { note: "planner" } },
      visionText: `{"status":"continue","message":"clicking","steps":[{"id":"v1","op":"clickPoint","x":50,"y":50}]}`,
    });
    const run = await h.coordinator.start({ goal: "click the canvas thing", pageIds: ["p1"] });
    // first chunk comes from vision (clickPoint), executes, then loop continues;
    // next iteration obs still thin but vision already used → planner runs → done
    const final = await waitForRun(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(h.generateText).toHaveBeenCalledOnce();
    expect(h.executeCalls[0]?.steps).toBe(1);
  });

  it("attaches the saved observation artifact to each step record", async () => {
    const h = harness({
      structuredPlan: { status: "continue", message: "clicking", steps: [{ id: "s1", op: "click", target: "r1" }] },
      thenPlans: [{ status: "done", message: "ok", result: { note: "done" } }],
      visionText: "",
    });
    const recorded: { obsArtifactId?: string }[] = [];
    const coord = new RunCoordinator({
      repo: h.repo,
      events: new EventBus(h.repo),
      pages: h.pages as never,
      model: () => h.model,
      defaultModel: () => "test/planner",
      recoveryModel: () => undefined,
      recordModelCall: () => {},
      saveObservation: () => "art-obs-1",
      onStepRecorded: (_r, _o, _s, obsArtifactId) => recorded.push({ obsArtifactId }),
      grants: ["effect:read", "effect:write", "effect:destructive", "effect:egress"],
    });
    const run = await coord.start({ goal: "click it", pageIds: ["p1"] });
    const final = await waitForRun(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(recorded.length).toBe(1);
    expect(recorded[0]?.obsArtifactId).toBe("art-obs-1");
  });

  it("does not screenshot-replan when no vision model is configured", async () => {
    const h = harness({
      executeFails: 1,
      structuredPlan: { status: "continue", message: "clicking", steps: [{ id: "s1", op: "click", target: "r1" }] },
      thenPlans: [{ status: "done", message: "ok", result: { ok: true } }],
      visionText: `{"status":"done","message":"via vision","result":{"note":"vision"}}`,
    });
    const coord = new RunCoordinator({
      repo: h.repo,
      events: new EventBus(h.repo),
      pages: h.pages as never,
      model: () => h.model,
      defaultModel: () => "test/planner",
      recoveryModel: () => undefined,
      recordModelCall: () => {},
      grants: ["effect:read", "effect:write", "effect:destructive", "effect:egress"],
    });
    const run = await coord.start({ goal: "do it", pageIds: ["p1"] });
    const final = await waitForRun(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toEqual({ ok: true });
    expect(h.generateText).not.toHaveBeenCalled();
    expect(h.pages.capture).not.toHaveBeenCalled();
  });

  it("falls back to the text planner when the vision response is not valid JSON", async () => {
    const h = harness({
      executeFails: 1,
      structuredPlan: { status: "continue", message: "clicking", steps: [{ id: "s1", op: "click", target: "r1" }] },
      thenPlans: [{ status: "done", message: "ok", result: { ok: true } }],
      visionText: "I cannot help with that.",
    });
    const run = await h.coordinator.start({ goal: "do it again", pageIds: ["p1"] });
    const final = await waitForRun(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toEqual({ ok: true });
    expect(h.modelCalls.filter((c) => c.role === "vision")).toHaveLength(1);
    expect(h.generateStructured).toHaveBeenCalled();
  });
});

describe("no-progress guard", () => {
  const cont = (op: string, id: string) => ({ status: "continue", message: "working", steps: [{ id, op, expression: "1" }] });

  it("does not trip when observation-blind steps keep succeeding on an unchanging page", async () => {
    const h = harness({
      structuredPlan: cont("evaluate", "e1"),
      thenPlans: [cont("evaluate", "e2"), cont("evaluate", "e3"), cont("evaluate", "e4"), { status: "done", message: "count is 4", result: { count: 4 } }],
      visionText: "",
    });
    const run = await h.coordinator.start({ goal: "increment a shadow counter", pageIds: ["p1"] });
    const final = await waitForRun(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toEqual({ count: 4 });
    expect(h.executeCalls.length).toBe(4);
  });

  it("still trips when visible no-op steps repeat on an unchanging page", async () => {
    const h = harness({
      structuredPlan: cont("click", "c1"),
      thenPlans: [cont("click", "c2"), cont("click", "c3"), cont("click", "c4"), cont("click", "c5")],
      visionText: "",
    });
    const run = await h.coordinator.start({ goal: "click forever", pageIds: ["p1"] });
    const final = await waitForRun(h.repo, run.runId);
    expect(final.status).toBe("failed");
    expect(final.error).toMatch(/no progress/);
  });
});
