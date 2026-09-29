import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { EventTypes, PlanChunkSchema, type Observation, type PlanStep, type StepOutcome } from "@aux/contracts";
import { clampOutputTokens, modelAcceptsImages, modelCapabilities, registryCostUsd } from "@aux/contracts/model-registry";
import {
  applyTokenBudget,
  buildFinalAnswerPrompt,
  buildPlannerPrompt,
  classifyStep,
  EventBus,
  isConsequential,
  looksLikeSecret,
  modelCallCost,
  openDb,
  portableSkillSteps,
  rebindSteps,
  redactForModel,
  Repo,
  RunCoordinator,
  verifyDoneAgainstObservation,
  type ModelClient,
} from "@aux/runtime";
import { AnswerDeltaEmitter, ANSWER_DELTA_PREVIEW_CHARS } from "../../apps/runtime/src/agent/answer-delta.js";
import { fillResultTemplates, planSignature } from "../../apps/runtime/src/agent/coordinator-turn.js";
import { normalizePlannerObject } from "../../apps/runtime/src/agent/gateway-client.js";
import { attemptsOf, usageFields, withAttempts } from "../../apps/runtime/src/agent/model-client.js";
import { PlanStreamParser } from "../../apps/runtime/src/agent/plan-stream.js";
import { downloadExtract } from "../../apps/runtime/src/execution/executor.js";
import { budgetSections } from "../../apps/runtime/src/services/runs.js";

const obs = (text = "Order page", extra: Partial<Observation["content"]> = {}): Observation =>
  ({
    pageId: "p1",
    documentEpoch: 1,
    revision: 1,
    observedAt: Date.now(),
    scope: "full",
    content: {
      url: "http://x.test/order",
      title: "Order",
      viewport: { width: 1, height: 1, scale: 1 },
      scroll: { y: 0, maxY: 0 },
      frames: [],
      text,
      headings: [],
      elements: [{ ref: "r1", tag: "button", role: "button", name: "Save", frame: "main" }],
      formFields: [],
      tables: [],
      links: [],
      dialogs: [],
      truncated: false,
      stats: { elementsTotal: 1, elementsShown: 1 },
      ...extra,
    },
  }) as unknown as Observation;

const ok = (op: string, extra: Partial<StepOutcome> = {}): StepOutcome => ({ stepId: op, op, status: "ok", startedAt: 1, durationMs: 1, ...extra });

describe("redaction by value shape", () => {
  it("keeps prose that mentions credentials and redacts credential-shaped values", () => {
    expect(redactForModel("Forgot password?")).toBe("Forgot password?");
    expect(redactForModel({ link: "Reset your password or secret question" })).toEqual({ link: "Reset your password or secret question" });
    for (const secret of [
      "sk-proj-abcdefghijklmnopqrstuvwxyz012345",
      "ghp_abcdefghijklmnopqrstuvwxyz0123456789",
      "xoxb-1234567890-abcdefghij",
      "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
      "Bearer abcdefghijklmnop",
      "Q2hhbmdlTWVQbGVhc2UxMjM0NTY3ODkwQWJjRGVmR2hp",
    ]) expect({ secret, redacted: looksLikeSecret(secret) }).toEqual({ secret, redacted: true });
    expect(looksLikeSecret("3f786850e387550fdab836ed7e6dc881de23001b")).toBe(false);
    expect(looksLikeSecret("123e4567-e89b-12d3-a456-426614174000")).toBe(false);
  });

  it("redacts exact sensitive key names only", () => {
    const out = redactForModel({ password: "hunter2", api_key: "k", forgotPasswordLink: "/reset", tokens: 12 }) as Record<string, unknown>;
    expect(out.password).toMatch(/^\{handle:/);
    expect(out.api_key).toMatch(/^\{handle:/);
    expect(out.forgotPasswordLink).toBe("/reset");
    expect(out.tokens).toBe(12);
  });
});

describe("single step classification", () => {
  it("executor, durable writes and verification agree", () => {
    expect(["click", "dblclick", "clickPoint", "dragTo", "upload", "dialog", "navigate", "reload", "fill"].filter((op) => !isConsequential(op))).toEqual([]);
    expect(["hover", "scroll", "stop", "extract", "waitFor", "screenshot", "collectScroll"].filter(isConsequential)).toEqual([]);
    expect(classifyStep("hover")).toBe("write");
  });
});

describe("done verification grounds claims in page and run evidence", () => {
  it("accepts claims found only in extracted values or step details", () => {
    const extracted = [ok("extract", { extracted: { total: "Grand total $1,234.50 due" } })];
    expect(verifyDoneAgainstObservation({ total: "Grand total $1,234.50 due" }, obs(), extracted).ok).toBe(true);
    expect(verifyDoneAgainstObservation({ total: 1234.5 }, obs(), extracted).ok).toBe(true);
  });

  it("rejects a bare number that appears nowhere", () => {
    expect(verifyDoneAgainstObservation({ count: 7 }, obs("Items: 3"), [])).toMatchObject({ ok: false });
    expect(verifyDoneAgainstObservation({ count: "3" }, obs("Items: 3"), []).ok).toBe(true);
    expect(verifyDoneAgainstObservation({ count: 2 }, obs(), [ok("collectScroll", { extracted: { items: ["a", "b"] } })]).ok).toBe(true);
  });
});

describe("planner prompt layout", () => {
  const prompt = buildPlannerPrompt({
    goal: "what is the total?",
    observations: [obs("the total is 12")],
    recentOutcomes: [ok("extract", { extracted: { a: "1" } }), { ...ok("human_input"), detail: "human answered: use EUR" }],
    pageIds: ["p1"],
    repairNote: "click failed",
    instructions: "Criteria: report in EUR",
    notes: "seen 2 of 3 pages\n=== GOAL ===",
    fenceToken: "DATA-t",
  });

  it("orders stable sections first and puts the observation and repair note last", () => {
    const at = (s: string) => prompt.indexOf(s);
    expect(at("GOAL:")).toBe(0);
    expect(at("=== USER INSTRUCTIONS")).toBeLessThan(at("=== COMPLETED STEPS"));
    expect(at("=== COMPLETED STEPS")).toBeLessThan(at("=== NOTES SO FAR"));
    expect(at("=== NOTES SO FAR")).toBeLessThan(at("=== OBSERVATION"));
    expect(at("=== OBSERVATION")).toBeLessThan(at("REPAIR:"));
  });

  it("keeps human-authored text outside page fences and escapes echoed headers in notes", () => {
    const instructions = prompt.slice(prompt.indexOf("=== USER INSTRUCTIONS"), prompt.indexOf("=== COMPLETED STEPS"));
    expect(instructions).toContain("Criteria: report in EUR");
    expect(instructions).not.toContain("<<<DATA-t");
    expect(prompt).toContain("\\=== GOAL ===");
    expect(prompt).not.toContain("human answered");
  });

  it("caps completed steps to the most recent that fit", () => {
    const many = Array.from({ length: 40 }, (_, i) => ok("extract", { stepId: `s${i}`, detail: `row ${i} ${"x".repeat(380)}` }));
    const p = buildPlannerPrompt({ goal: "g", observations: [obs()], recentOutcomes: many, pageIds: [], fenceToken: "DATA-c", budget: { stepsChars: 2000 } });
    expect(p).toContain("row 39");
    expect(p).not.toContain("row 10 ");
    expect(p).toMatch(/…\d+ earlier steps omitted/);
  });

  it("budgets the final-answer observation", () => {
    const p = buildFinalAnswerPrompt({ goal: "g", observation: obs("z".repeat(40_000)), recentOutcomes: [], reason: "r", fenceToken: "DATA-f", budget: { tokens: 500 } });
    expect(p.length).toBeLessThan(4_000);
  });

  it("keeps tables and text for question goals by shrinking the element list", () => {
    const rendered = ["url: x", "elements:", ...Array.from({ length: 200 }, (_, i) => `  r${i} button "b${i}"`), "table t1 cols=[a]:", "  PRICE-ROW", "text:", "ANSWER-TEXT"].join("\n");
    const kept = applyTokenBudget(rendered, 300, { keepContent: true });
    expect(kept).toContain("PRICE-ROW");
    expect(kept).toContain("ANSWER-TEXT");
    expect(kept.length).toBeLessThanOrEqual(1200);
    expect(applyTokenBudget(rendered, 300)).not.toContain("ANSWER-TEXT");
  });
});

describe("plan notes", () => {
  it("accepts notes and trims oversized ones before validation", () => {
    const parsed = PlanChunkSchema.parse(normalizePlannerObject({ status: "continue", message: "m", notes: "n".repeat(900), steps: [] }));
    expect(parsed.notes).toHaveLength(600);
  });
});

describe("plan repeat signature", () => {
  it("distinguishes targets and values, not just ops", () => {
    const a: PlanStep[] = [{ id: "1", op: "click", target: "r1" }];
    const b: PlanStep[] = [{ id: "2", op: "click", target: "r2" }];
    expect(planSignature("http://x/", a)).not.toBe(planSignature("http://x/", b));
    expect(planSignature("http://x/", a)).toBe(planSignature("http://x/", [{ id: "9", op: "click", target: "r1" }]));
    expect(planSignature("http://x/", a)).not.toBe(planSignature("http://y/", a));
  });
});

describe("result templates", () => {
  it("fills whole-value and inline references from extracted fields", () => {
    expect(fillResultTemplates({ total: "{{total}}", note: "is {{total}}", rows: "{{rows}}" }, { total: "$5", rows: [1, 2] }))
      .toEqual({ total: "$5", note: "is $5", rows: [1, 2] });
    expect(fillResultTemplates({ x: "{{missing}}" }, {})).toEqual({ x: "{{missing}}" });
  });
});

describe("session context budgets", () => {
  it("truncates lowest-priority sections first and keeps display order", () => {
    const out = budgetSections([
      { text: "B".repeat(50), priority: 5 },
      { text: "T".repeat(50), priority: 2 },
      { text: "C".repeat(50), priority: 0 },
    ], 120)!;
    expect(out.indexOf("T")).toBeLessThan(out.indexOf("C"));
    expect(out).toContain("C".repeat(50));
    expect(out).toContain("T".repeat(50));
    expect(out).not.toContain("B".repeat(20));
  });
});

describe("model registry capabilities", () => {
  it("drives vision gating, output clamps and pricing", () => {
    expect(modelAcceptsImages("alibaba/qwen3.8-27b")).toBe(false);
    expect(modelAcceptsImages("openai/gpt-5.6-luna-fast")).toBe(true);
    expect(modelAcceptsImages("vendor/unknown")).toBe(true);
    expect(modelCapabilities("openai/gpt-5.6-luna-fast")?.reasoning).toBe("none");
    const custom = [{ id: "m", maxOutputTokens: 1000, inputUsdPerMTok: 1, outputUsdPerMTok: 2, source: "configured" as const }];
    expect(clampOutputTokens("m", 8192, custom)).toBe(1000);
    expect(clampOutputTokens("other", 8192, custom)).toBe(8192);
    expect(registryCostUsd("m", { inputTokens: 1_000_000, outputTokens: 500_000 }, custom)).toBe(2);
  });

  it("prefers the gateway-reported cost", () => {
    expect(modelCallCost("alibaba/qwen3.8-27b", { inputTokens: 10, providerMetadata: { gateway: { cost: "0.0012" } } })).toEqual({ costUsd: 0.0012, costEstimated: false });
    expect(modelCallCost("alibaba/qwen3.8-27b", { inputTokens: 10 })).toEqual({});
  });

  it("normalizes cached-token usage and carries attempts on errors", () => {
    expect(usageFields({ inputTokens: 100, outputTokens: 5, inputTokenDetails: { cacheReadTokens: 80 } })).toEqual({ inputTokens: 100, outputTokens: 5, cachedInputTokens: 80 });
    const e = withAttempts(new Error("x"), [{ durationMs: 1, inputTokens: 3 }]);
    expect(attemptsOf(e)).toEqual([{ durationMs: 1, inputTokens: 3 }]);
  });
});

describe("streamed answer deltas", () => {
  it("reads the partial message and throttles events", async () => {
    const parser = new PlanStreamParser();
    parser.push('{"status":"done","message":"Found th');
    expect(parser.message).toBe("Found th");
    parser.push('e total\\n"');
    expect(parser.message).toBe("Found the total\n");
    const emitted: Record<string, unknown>[] = [];
    const d = new AnswerDeltaEmitter({ emit: (type: string, payload: Record<string, unknown>) => { expect(type).toBe(EventTypes.RunAnswerDelta); emitted.push(payload); } } as never, "run1", 50);
    d.push("A");
    d.push("AB");
    d.push("ABC");
    expect(emitted).toHaveLength(1);
    await new Promise((r) => setTimeout(r, 80));
    expect(emitted).toHaveLength(2);
    d.push("ABCD");
    d.flush();
    expect(emitted.at(-1)).toMatchObject({ runId: "run1", text: "ABCD", delta: "D", seq: 3 });
    d.push("x".repeat(ANSWER_DELTA_PREVIEW_CHARS + 100));
    d.flush();
    expect(String(emitted.at(-1)?.text)).toContain("Live preview limited to 32,000 characters");
    expect(String(emitted.at(-1)?.text).length).toBeLessThan(ANSWER_DELTA_PREVIEW_CHARS + 100);
  });
});

describe("skill replay binds by role/name", () => {
  it("compiles refs to role locators and refuses refs without role+name", () => {
    const content = obs().content;
    expect(portableSkillSteps([{ id: "c", op: "click", target: "r1" }], content)).toEqual([{ id: "c", op: "click", target: "role=button[name=Save]" }]);
    const bare = { ...content, elements: [{ ref: "r1", tag: "div", frame: "main" }] } as unknown as Observation["content"];
    expect(portableSkillSteps([{ id: "c", op: "click", target: "r1" }], bare)).toBeUndefined();
  });

  it("does not retarget a missing ref to the first element via an origin-only guard", () => {
    const content = obs().content;
    const steps = rebindSteps([{ id: "c", op: "click", target: "r7" }], content, [{ exactOrigin: "http://x.test" }]);
    expect(steps[0]).toMatchObject({ target: "r7" });
  });
});

describe("download preview", () => {
  it("inlines small text downloads only", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-dl-"));
    try {
      writeFileSync(join(dir, "a.csv"), "a,b\n1,2\n");
      writeFileSync(join(dir, "b.bin"), "zz");
      writeFileSync(join(dir, "big.txt"), "x".repeat(70 * 1024));
      expect(await downloadExtract("a.csv", join(dir, "a.csv"))).toEqual({ downloaded: "a.csv", path: join(dir, "a.csv"), text: "a,b\n1,2\n" });
      expect(await downloadExtract("b.bin", join(dir, "b.bin"))).not.toHaveProperty("text");
      expect(await downloadExtract("big.txt", join(dir, "big.txt"))).not.toHaveProperty("text");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

type Recorded = { role: string; error?: string; inputTokens?: number };

function harness(model: ModelClient, opts: { text?: string; extracted?: Record<string, unknown> } = {}) {
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const recorded: Recorded[] = [];
  const executed: PlanStep[][] = [];
  const pages = {
    observe: vi.fn(async () => obs(opts.text)),
    execute: vi.fn(async (program: { steps: PlanStep[] }, ctx?: { onStep?: (o: StepOutcome, s: PlanStep) => void }) => {
      executed.push(program.steps);
      const steps = program.steps.map((s) => ok(s.op, { stepId: s.id, ...(s.op === "extract" ? { extracted: opts.extracted ?? {} } : {}),
        ...(isConsequential(s.op) ? { effect: "observed", receipt: { observed: "Fixture action verified", remoteConfirmed: false, uncertain: false, unconfirmed: false, dispatchedBeforeTakeover: false } } : {}) }));
      steps.forEach((o, i) => ctx?.onStep?.(o, program.steps[i]!));
      return { status: "completed" as const, steps };
    }),
    capture: vi.fn(async () => ({ dataUrl: undefined, width: 0, height: 0, scale: 1 })),
    livePageIds: () => ["p1"],
    get: () => ({ viewStatus: "visible", documentEpoch: 1, url: "http://x.test/order" }),
  };
  const coordinator = new RunCoordinator({
    repo, events, pages: pages as never,
    model: () => model,
    defaultModel: () => "test/planner",
    recoveryModel: () => undefined,
    recordModelCall: (c) => recorded.push({ role: c.role, error: c.error, inputTokens: c.inputTokens }),
    grants: ["effect:read", "effect:write", "effect:egress"],
  });
  return { repo, coordinator, recorded, executed, events };
}

async function settle(repo: Repo, runId: string) {
  for (let i = 0; i < 400; i++) {
    const r = repo.getRun(runId)!;
    if (["completed", "partially_completed", "failed", "cancelled", "interrupted"].includes(r.status)) return r;
    await new Promise((res) => setTimeout(res, 10));
  }
  throw new Error("run did not settle");
}

const scripted = (objects: unknown[], extra: (i: number) => Record<string, unknown> = () => ({})): ModelClient & { calls: number } => {
  const m = {
    calls: 0,
    generateStructured: async (o: { schema: { parse: (v: unknown) => unknown } }) => {
      const i = m.calls++;
      return { object: o.schema.parse(objects[Math.min(i, objects.length - 1)]), durationMs: 1, ...extra(i) };
    },
    generateText: async () => ({ text: "", durationMs: 0 }),
    listModels: async () => [],
  };
  return m as never;
};

describe("coordinator phase 2 behaviour", () => {
  it("finishes a read-only done chunk locally in one model call", async () => {
    const model = scripted([{ status: "done", message: "Total read", steps: [{ id: "x", op: "extract", fields: [{ name: "total", selector: "#t" }] }], result: { total: "{{total}}" } }]);
    const h = harness(model, { extracted: { total: "$41.99" } });
    const run = await h.coordinator.start({ goal: "what is the total", pageIds: ["p1"] });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toEqual({ total: "$41.99" });
    expect(model.calls).toBe(1);
  });

  it("carries planner notes into the next prompt", async () => {
    const prompts: string[] = [];
    const model = scripted([
      { status: "continue", message: "m", notes: "tally=2", steps: [{ id: "a", op: "click", target: "r1" }] },
      { status: "done", message: "done", result: { ok: "Order page" } },
    ]);
    const gen = model.generateStructured;
    model.generateStructured = (async (o: { prompt: string; schema: { parse: (v: unknown) => unknown } }) => { prompts.push(o.prompt); return gen(o as never); }) as never;
    const h = harness(model);
    const run = await h.coordinator.start({ goal: "count things", pageIds: ["p1"] });
    await settle(h.repo, run.runId);
    expect(prompts[1]).toContain("=== NOTES SO FAR");
    expect(prompts[1]).toContain("tally=2");
  });

  it("counts and records hidden client retries as model calls", async () => {
    const model = scripted(
      [{ status: "done", message: "done", result: { ok: "Order page" } }],
      () => ({ inputTokens: 50, retries: [{ durationMs: 1, inputTokens: 40, error: "unparseable output" }] }),
    );
    const h = harness(model);
    const run = await h.coordinator.start({ goal: "g", pageIds: ["p1"] });
    await settle(h.repo, run.runId);
    expect(h.recorded.filter((c) => c.role === "planner")).toEqual([
      { role: "planner", error: "unparseable output", inputTokens: 40 },
      { role: "planner", error: undefined, inputTokens: 50 },
    ]);
  });

  it("asks for one final answer when the model-call budget runs out and stores harvested data under partial", async () => {
    const model = scripted([
      { status: "continue", message: "m", steps: [{ id: "e", op: "extract", fields: [{ name: "a", selector: "h1" }] }] },
      { status: "continue", message: "m", steps: [{ id: "c", op: "click", target: "r1" }] },
      { status: "done", message: "partial answer", result: {} },
    ]);
    const h = harness(model, { extracted: { a: "Heading A" } });
    const run = await h.coordinator.start({ goal: "g", pageIds: ["p1"], maxModelCalls: 2 });
    const final = await settle(h.repo, run.runId);
    expect(h.recorded.map((c) => c.role)).toEqual(["planner", "planner", "final"]);
    expect(final.status).toBe("partially_completed");
    expect(final.result).toEqual({ partial: { a: "Heading A" } });
  });

  it("surfaces authentication failures from the final decision instead of giving up quietly", async () => {
    let n = 0;
    const model = {
      generateStructured: async (o: { schema: { parse: (v: unknown) => unknown } }) => {
        if (n++ === 0) return { object: o.schema.parse({ status: "continue", message: "m", steps: [{ id: "c", op: "click", target: "r1" }] }), durationMs: 1 };
        throw Object.assign(new Error("401 unauthorized: invalid api key"), {});
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    } as unknown as ModelClient;
    const h = harness(model);
    const run = await h.coordinator.start({ goal: "g", pageIds: ["p1"], maxModelCalls: 1 });
    const final = await settle(h.repo, run.runId);
    expect(final.failure?.category).toBe("authentication");
  });

  it("does not splice a retried stream plan onto steps already dispatched", async () => {
    let call = 0;
    const model = {
      generateStructured: async (o: { schema: { parse: (v: unknown) => unknown } }) => ({ object: o.schema.parse({ status: "done", message: "done", result: { ok: "Order page" } }), durationMs: 1 }),
      streamStructured: async (o: { onText: (d: string) => void; schema: { parse: (v: unknown) => unknown } }) => {
        if (call++ > 0) return { object: o.schema.parse({ status: "done", message: "done", result: { ok: "Order page" } }), durationMs: 1 };
        o.onText('{"status":"continue","message":"m","steps":[{"id":"s1","op":"click","target":"r1"},');
        await new Promise((r) => setTimeout(r, 20));
        o.onText("garbage");
        return {
          object: o.schema.parse({ status: "continue", message: "retry", steps: [{ id: "s1", op: "fill", target: "r1", value: "x" }, { id: "s2", op: "click", target: "r1" }] }),
          durationMs: 1,
          retries: [{ durationMs: 1, error: "unparseable output" }],
        };
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    } as unknown as ModelClient;
    const h = harness(model);
    const run = await h.coordinator.start({ goal: "g", pageIds: ["p1"] });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(h.executed.flat().map((s) => s.op)).toEqual(["click"]);
  });

  it("shows task instructions and human answers unfenced and untruncated", async () => {
    const prompts: string[] = [];
    const long = `use EUR ${"z".repeat(500)}`;
    let i = 0;
    const model = {
      generateStructured: async (o: { prompt: string; schema: { parse: (v: unknown) => unknown } }) => {
        prompts.push(o.prompt);
        return { object: o.schema.parse(i++ === 0 ? { status: "needs_input", message: "q", question: "Which currency?" } : { status: "done", message: "d", result: { ok: "Order page" } }), durationMs: 1 };
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    } as unknown as ModelClient;
    const h = harness(model);
    const run = await h.coordinator.start({ goal: "g", pageIds: ["p1"], instructions: "Acceptance: cite the order id" });
    for (let k = 0; k < 100 && h.repo.getRun(run.runId)!.status !== "needs_input"; k++) await new Promise((r) => setTimeout(r, 10));
    h.coordinator.answer(run.runId, long);
    await settle(h.repo, run.runId);
    const second = prompts[1]!;
    const section = second.slice(second.indexOf("=== USER INSTRUCTIONS"), second.indexOf("=== OBSERVATION"));
    expect(section).toContain("Acceptance: cite the order id");
    expect(section).toContain(long);
    expect(section).not.toContain("<<<DATA-");
  });
});
