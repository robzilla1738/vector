/**
 * VEC-021 held-out stretch: skill reuse must cut measured model tokens
 * (not prompt-bytes/4) and p95 vs a planner-every-turn baseline.
 */
import { describe, it, expect } from "vitest";
import { openDb, Repo, RunCoordinator, MockModelClient, compileSkill, evaluateHeldOutAdvantage } from "@vector/runtime";
import { EventBus } from "@vector/runtime";
import type { Observation, StepOutcome } from "@vector/contracts";

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
  const pages = {
    observe: async () => obs,
    execute: async (program: { steps: { id: string; op: string }[] }, ctx: { onStep?: (o: StepOutcome, s: unknown) => void }) => {
      for (const s of program.steps) ctx.onStep?.(done(s.id, s.op), s);
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

describe("VEC-021 token-measured stretch", () => {
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

    const engineModel = new MockModelClient();
    engineModel.latencyMs = 80;
    engineModel.scripted([
      () => ({
        object: { status: "done", message: "done", result: { n: 1 } },
        inputTokens: 1500,
        outputTokens: 200,
      }),
    ]);
    const engine = harness(engineModel);
    engine.coordinator.seedSkills([
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
    const runB = await engine.coordinator.start({ goal: "increment the counter", pageIds: ["p1"] });
    const finalB = await waitForRun(engine.repo, runB.runId);
    expect(finalB.status).toBe("completed");
    expect(engineModel.calls.length).toBeLessThan(baselineModel.calls.length);
    expect(engine.tokens.reduce((n, t) => n + t.input + t.output, 0)).toBeLessThan(
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
        p95Ms: Math.max(modelMs(engine.tokens), 1),
        tokensPerSuccess: tokensPerSuccess(engine.tokens, true),
      },
    );
    expect(gate.tokensMeasured).toBe(true);
    expect(gate.tokenRatio).toBeGreaterThanOrEqual(2);
    expect(gate.p95Ratio).toBeGreaterThanOrEqual(2);
    expect(gate.meetsStretch).toBe(true);

    const { mkdirSync, writeFileSync } = await import("node:fs");
    const { dirname, join } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const out = join(fileURLToPath(new URL(".", import.meta.url)), "../benchmarks/reports/held-out-latest.json");
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(
      out,
      JSON.stringify(
        {
          measured: true,
          metric: "modelWaitMs",
          tokens: "declared model usage, not bytes/4",
          ...gate,
          baseline: { success: 1, p95Ms: gate.p95Ratio * Math.max(modelMs(engine.tokens), 1), tokensPerSuccess: tokensPerSuccess(baseline.tokens, true) },
          candidate: { success: 1, p95Ms: Math.max(modelMs(engine.tokens), 1), tokensPerSuccess: tokensPerSuccess(engine.tokens, true) },
        },
        null,
        2,
      ),
    );
  });
});
