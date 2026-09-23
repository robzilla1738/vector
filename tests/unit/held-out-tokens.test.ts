/**
 * AUX-021 held-out stretch: skill reuse must cut measured model tokens
 * (not prompt-bytes/4) and p95 vs a planner-every-turn baseline.
 */
import { describe, it, expect } from "vitest";
import { openDb, Repo, RunCoordinator, MockModelClient, compileSkill, evaluateHeldOutAdvantage } from "@aux/runtime";
import { EventBus } from "@aux/runtime";
import type { Observation, StepOutcome } from "@aux/contracts";

const obs: Observation = {
  observationId: "o1",
  pageId: "p1",
  documentEpoch: 1,
  revision: 1,
  observedAt: Date.now(),
  scope: "full",
  content: {
    url: "https://app.test/counter",
    title: "counter",
    viewport: { width: 1000, height: 800, scale: 1 },
    scroll: { x: 0, y: 0, maxY: 0 },
    frames: [],
    text: "Increment the counter",
    headings: [],
    elements: [{ ref: "r1", tag: "button", role: "button", name: "Increment", frame: "main" }] as Observation["content"]["elements"],
    formFields: [],
    tables: [],
    links: [],
    dialogs: [],
    truncated: false,
    stats: { elementsTotal: 1, elementsShown: 1, textChars: 20, approxTokens: 5 },
  },
};

const done = (stepId: string, op: string): StepOutcome => ({
  stepId, op, status: "ok", startedAt: Date.now(), durationMs: 1,
});

function harness(model: MockModelClient) {
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const tokens: { input: number; output: number; ms: number }[] = [];
  let currentObservation = obs;
  const pages = {
    observe: async () => currentObservation,
    execute: async (program: { steps: { id: string; op: string }[] }, ctx: { onStep?: (o: StepOutcome, s: unknown) => void }) => {
      for (const s of program.steps) ctx.onStep?.(done(s.id, s.op), s);
      currentObservation = {
        ...currentObservation,
        revision: currentObservation.revision + 1,
        content: { ...currentObservation.content, text: "Counter: 1" },
      };
      return { status: "completed" as const, steps: program.steps.map((s) => done(s.id, s.op)) };
    },
    capture: async () => ({ dataUrl: "data:image/png;base64,AA", width: 1, height: 1, scale: 1 }),
  };
  const coordinator = new RunCoordinator({
    repo,
    events,
    pages: pages as never,
    model: () => model,
    defaultModel: () => "test/planner",
    recoveryModel: () => undefined,
    recordModelCall: (c) => {
      tokens.push({ input: c.inputTokens ?? 0, output: c.outputTokens ?? 0, ms: c.durationMs });
    },
    grants: ["effect:read", "effect:write", "effect:destructive", "effect:egress"],
  });
  return { repo, coordinator, tokens };
}

async function waitForRun(repo: Repo, runId: string, ms = 5000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const r = repo.getRun(runId);
    if (r && ["completed", "partially_completed", "failed", "cancelled", "interrupted"].includes(r.status)) return r;
    await new Promise((r) => setTimeout(r, 15));
  }
  throw new Error("run did not finish");
}

function tokensPerSuccess(tokens: { input: number; output: number }[], passed: boolean): number | null {
  if (!passed) return null;
  return tokens.reduce((n, t) => n + t.input + t.output, 0);
}

function modelMs(tokens: { ms: number }[]): number {
  return tokens.reduce((n, t) => n + t.ms, 0);
}

describe("AUX-021 token-measured stretch", () => {
  it("skill reuse meets 2x p95 and 50% fewer declared model tokens", async () => {
    const baselineModel = new MockModelClient();
    baselineModel.latencyMs = 80;
    baselineModel.scripted([
      () => ({
        object: { status: "continue", message: "click", steps: [{ id: "c", op: "click", target: "r1" }] },
        inputTokens: 8000,
        outputTokens: 2000,
      }),
      () => ({
        object: { status: "done", message: "done", result: { n: 1 } },
        inputTokens: 4000,
        outputTokens: 200,
      }),
    ]);
    const baseline = harness(baselineModel);
    const runA = await baseline.coordinator.start({ goal: "increment the counter", pageIds: ["p1"] });
    const finalA = await waitForRun(baseline.repo, runA.runId);
    expect(finalA.status).toBe("completed");
    expect(baseline.tokens.some((t) => t.input === 8000)).toBe(true);

    const skilledModel = new MockModelClient();
    skilledModel.latencyMs = 80;
    skilledModel.scripted([
      () => ({
        object: { status: "done", message: "done", result: { n: 1 } },
        inputTokens: 1500,
        outputTokens: 200,
      }),
    ]);
    const skilled = harness(skilledModel);
    skilled.coordinator.seedSkills([
      compileSkill({
        id: "inc",
        goalPattern: "increment",
        pageId: "p1",
        steps: [{ id: "c", op: "click", target: "r1" }],
        preconditions: [{ role: "button", nameIncludes: "Increment", urlIncludes: "app.test" }],
        postconditions: [],
        evidence: "held-out counter still exposes Increment",
      }),
    ]);
    const runB = await skilled.coordinator.start({ goal: "increment the counter", pageIds: ["p1"] });
    const finalB = await waitForRun(skilled.repo, runB.runId);
    expect(finalB.status).toBe("completed");
    expect(skilledModel.calls.length).toBeLessThan(baselineModel.calls.length);
    expect(skilled.tokens.reduce((n, t) => n + t.input + t.output, 0)).toBeLessThan(
      baseline.tokens.reduce((n, t) => n + t.input + t.output, 0) / 2,
    );

    const gate = evaluateHeldOutAdvantage(
      {
        success: 1,
        p95Ms: Math.max(modelMs(baseline.tokens), 1),
        tokensPerSuccess: tokensPerSuccess(baseline.tokens, true),
      },
      {
        success: 1,
        p95Ms: Math.max(modelMs(skilled.tokens), 1),
        tokensPerSuccess: tokensPerSuccess(skilled.tokens, true),
      },
    );
    expect(gate.tokensMeasured).toBe(true);
    expect(gate.tokenRatio).toBeGreaterThanOrEqual(2);
    expect(gate.p95Ratio).toBeGreaterThanOrEqual(2);
    expect(gate.meetsStretch).toBe(true);

    // Mock usage validates reuse logic; it must never overwrite live evaluation evidence.

  });
});
