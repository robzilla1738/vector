import { budgetLineage } from "../fixtures/budget-lineage.js";
import { fixturePage, fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { describe, it, expect, vi } from "vitest";
import { APICallError, JSONParseError, NoObjectGeneratedError, TypeValidationError } from "ai";
import { ApprovalStore, BudgetsService, EventBus, openDb, Repo, RunCoordinator } from "@aux/runtime";
import type { ModelClient } from "@aux/runtime";
import { AuxError, type Observation } from "@aux/contracts";
import { isStructuredOutputError } from "../../apps/runtime/src/agent/gateway-client.js";

const apiErr = (statusCode: number, message = "boom") =>
  new APICallError({ message, url: "https://gw.test", requestBodyValues: {}, statusCode });

describe("gateway fallback guard (P1-2 / retry amplification)", () => {
  it("falls back only on structured-output failures", async () => {
    expect(
      await isStructuredOutputError(
        new NoObjectGeneratedError({
          message: "no object",
          text: "x",
          response: { id: "r", timestamp: new Date(), modelId: "m" },
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          finishReason: "stop",
        } as never),
      ),
    ).toBe(true);
    expect(
      await isStructuredOutputError(new TypeValidationError({ value: {}, cause: new Error("bad") })),
    ).toBe(true);
    expect(await isStructuredOutputError(new JSONParseError({ text: "{", cause: new Error("bad") }))).toBe(
      true,
    );
    expect(await isStructuredOutputError(apiErr(400, "response_format is not supported by this model"))).toBe(
      true,
    );
    expect(await isStructuredOutputError(new Error("Unsupported JSON schema fields: oneOf"))).toBe(false);
  });
  it("never retries auth, quota, server, network or abort errors", async () => {
    expect(await isStructuredOutputError(apiErr(401))).toBe(false);
    expect(await isStructuredOutputError(apiErr(403))).toBe(false);
    expect(await isStructuredOutputError(apiErr(429, "rate limit"))).toBe(false);
    expect(await isStructuredOutputError(apiErr(500))).toBe(false);
    expect(await isStructuredOutputError(apiErr(400, "invalid api key"))).toBe(false);
    expect(await isStructuredOutputError(new TypeError("fetch failed"))).toBe(false);
    expect(await isStructuredOutputError(new DOMException("aborted", "AbortError"))).toBe(false);
    expect(await isStructuredOutputError(new DOMException("timed out", "TimeoutError"))).toBe(false);
  });
});

const obs = (): Observation =>
  ({
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
      text: "a normal page with plenty of readable text content",
      headings: [],
      elements: Array.from({ length: 5 }, (_, i) => ({ ref: `r${i + 1}`, tag: "button", frame: "main" })),
      formFields: [],
      tables: [],
      links: [],
      dialogs: [],
      truncated: false,
      stats: { elementsTotal: 5, elementsShown: 5, textChars: 40, approxTokens: 10 },
    },
  }) as unknown as Observation;

function harness(model: ModelClient) {
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const recorded: { role: string; error?: string }[] = [];
  const pages = {
    observe: vi.fn(async () => obs()),
    execute: vi.fn(async (program: { steps: { id: string; op: string }[] }) => ({
      status: "completed" as const,
      steps: program.steps.map((s) => ({
        stepId: s.id,
        op: s.op,
        status: "ok" as const,
        startedAt: Date.now(),
        durationMs: 1,
      })),
    })),
    capture: vi.fn(async () => ({ dataUrl: undefined, width: 0, height: 0, scale: 1 })),
    livePageIds: () => ["p1"],
    get: (fixturePageId: string): import("@aux/contracts").PageTarget => ({
      ...fixturePage(fixturePageId, "http://x.test/", 1),
      viewStatus: "visible",
    }),
  };
  const coordinator = new RunCoordinator({
    turnMentions: fixtureTurnMentions((pageId) => pages.get(pageId)),
    repo,
    events,
    pages: pages as never,
    model: () => model,
    defaultModel: () => "test/planner",
    recordModelCall: (c) => {
      recorded.push({ role: c.role, error: c.error });
    },
  });
  return { repo, coordinator, recorded };
}

async function waitForRun(repo: Repo, runId: string, ms = 5000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const r = repo.getRun(runId);
    if (r && ["completed", "partially_completed", "failed", "cancelled", "interrupted"].includes(r.status))
      return r;
    await new Promise((r) => setTimeout(r, 15));
  }
  throw new Error(`run did not finish: ${repo.getRun(runId)?.status}`);
}

describe("run deadline budget", () => {
  it("interrupts a hung model call and parks until an explicitly increased deadline", async () => {
    let seen: AbortSignal | undefined;
    const model: ModelClient = {
      generateStructured: async () => { throw new Error("No planner dispatch."); },
      toolCallStep: (o) =>
        new Promise((_res, rej) => {
          seen = o.signal;
          o.signal?.addEventListener("abort", () => rej(new DOMException("aborted", "AbortError")), {
            once: true,
          });
        }),
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const h = harness(model);
    const started = Date.now();
    const run = await h.coordinator.start({ goal: "g", pageIds: ["p1"], deadlineMs: 120 });
    await vi.waitFor(() => expect(h.repo.getRun(run.runId)?.status).toBe("needs_input"));
    expect(Date.now() - started).toBeLessThan(3000);
    const pending = h.coordinator.suspensions.pending(run.runId)!;
    expect(pending.kind).toBe("budget");
    expect(pending.request.budget).toMatchObject({ reason: "time", limit: 120 });
    await expect(h.coordinator.continueBudget(run.runId, pending.suspensionId)).rejects.toMatchObject({
      code: "conflict",
    });
    expect(seen?.aborted).toBe(true);
    // the hung call was counted and recorded with its error
    expect(h.recorded.filter((c) => c.role === "agent" && c.error)).toHaveLength(1);
    await h.coordinator.cancel(run.runId);
    await vi.waitFor(() => expect(h.coordinator.controls.has(run.runId)).toBe(false));
    h.repo.db.close();
  });
});

describe("explicit run call budgets", () => {
  const askingModel = () => {
    let calls = 0;
    const model: ModelClient = {
      generateStructured: async () => { throw new Error("No planner dispatch."); },
      toolCallStep: async () => ({
        message: { role: "assistant", content: [] },
        toolCalls: [{ toolCallId: `question-${++calls}`, toolName: "ask_user_question", input: { question: `Question ${calls}` } }],
        durationMs: 1,
      }),
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    return { model, calls: () => calls };
  };
  it("has no default sixteen-call cap", async () => {
    const model = askingModel();
    const h = harness(model.model);
    const run = await h.coordinator.start({ goal: "Gather the requested details", pageIds: ["p1"] });
    expect(run.config?.maxModelCalls).toBe(0);
    expect(run.config?.maxSteps).toBe(0);
    for (let index = 1; index <= 18; index++) {
      await vi.waitFor(() => expect(model.calls()).toBe(index));
      await vi.waitFor(() => expect(h.repo.getRun(run.runId)?.status).toBe("needs_input"));
      expect(h.coordinator.suspensions.pending(run.runId)?.kind).toBe("ask-user-question");
      if (index < 18) await h.coordinator.answer(run.runId, "Continue gathering details");
    }
    await h.coordinator.cancel(run.runId);
    await vi.waitFor(() => expect(h.coordinator.controls.has(run.runId)).toBe(false));
    h.repo.db.close();
  });
  it("rechecks actual spend and refuses Continue until Settings raises the live limit", async () => {
    const model = askingModel();
    const h = harness(model.model);
    let dayUsd = 1;
    h.repo.saveModelCall({
      callId: "previous-billed-call",
      role: "agent",
      modelId: "fixture",
      durationMs: 1,
      costUsd: 1,
      createdAt: Date.now(),
    });
    const budgets = new BudgetsService(h.repo.db, () => ({ dayUsd }), budgetLineage(h.repo));
    h.coordinator.deps.checkBudget = ({ runId }) => budgets.assertWithin({ runId });
    const run = await h.coordinator.start({ goal: "Gather details", pageIds: ["p1"] });
    await vi.waitFor(() => expect(h.coordinator.suspensions.pending(run.runId)?.kind).toBe("budget"));
    const pending = h.coordinator.suspensions.pending(run.runId)!;
    expect(pending.request.budget).toMatchObject({ reason: "spend", scope: "day", used: 1, limit: 1 });
    await expect(h.coordinator.continueBudget(run.runId, pending.suspensionId)).rejects.toMatchObject({
      code: "permission_denied",
    });
    expect(model.calls()).toBe(0);
    dayUsd = 2;
    await h.coordinator.continueBudget(run.runId, pending.suspensionId);
    await vi.waitFor(() => expect(model.calls()).toBe(1));
    expect(budgets.spentDayUsd()).toBe(1);
    await h.coordinator.cancel(run.runId);
    await vi.waitFor(() => expect(h.coordinator.controls.has(run.runId)).toBe(false));
    h.repo.db.close();
  });
  it("requires an exact current request and an increased limit before continuing", async () => {
    const model = askingModel();
    const h = harness(model.model);
    const run = await h.coordinator.start({ goal: "Gather details", pageIds: ["p1"], maxModelCalls: 1 });
    await vi.waitFor(() => expect(h.repo.getRun(run.runId)?.status).toBe("needs_input"));
    const approvals = new ApprovalStore(h.repo.db);
    const approvalId = approvals.issue(
      {
        profileId: "profile",
        scope: { kind: "task", id: "task" },
        effect: "write",
        action: "click",
        category: "purchase",
        authentication: "touch_id",
        invocationDigest: "a".repeat(64),
        origin: "https://site.test",
        turnId: run.runId,
        threadId: run.runId,
        requestedAt: Date.now(),
      },
      "turn",
    );
    const proof = approvals.prepareDevice(approvalId, run.runId);
    await h.coordinator.answer(run.runId, "The requested detail");
    await vi.waitFor(() => expect(h.coordinator.suspensions.pending(run.runId)?.kind).toBe("budget"));
    expect(() => approvals.confirmDevice(approvalId, run.runId, proof.fingerprint)).toThrow();
    const pending = h.coordinator.suspensions.pending(run.runId)!;
    expect(pending.request.budget).toMatchObject({ reason: "model_calls", used: 1, limit: 1 });
    await expect(h.coordinator.answer(run.runId, "Continue")).rejects.toMatchObject({ code: "conflict" });
    await expect(h.coordinator.resume(run.runId)).rejects.toMatchObject({ code: "conflict" });
    await expect(
      h.coordinator.continueBudget(run.runId, "different-request", { maxModelCalls: 2 }),
    ).rejects.toMatchObject({ code: "conflict" });
    await expect(h.coordinator.continueBudget(run.runId, pending.suspensionId)).rejects.toMatchObject({
      code: "conflict",
    });
    expect(model.calls()).toBe(1);
    await h.coordinator.continueBudget(run.runId, pending.suspensionId, { maxModelCalls: 2 });
    await vi.waitFor(() => expect(model.calls()).toBe(2));
    await expect(
      h.coordinator.continueBudget(run.runId, pending.suspensionId, { maxModelCalls: 3 }),
    ).rejects.toMatchObject({ code: "conflict" });
    await h.coordinator.cancel(run.runId);
    await vi.waitFor(() => expect(h.coordinator.controls.has(run.runId)).toBe(false));
    h.repo.db.close();
  });
});

describe("model call accounting", () => {
  it("records a failed SDK attempt once and persists only safe provider state", async () => {
    let attempts = 0;
    const model: ModelClient = {
      generateStructured: async () => { throw new Error("No planner dispatch."); },
      toolCallStep: async () => {
        attempts++;
        throw new AuxError("model_error", "The model provider is temporarily unavailable.");
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const h = harness(model);
    const run = await h.coordinator.start({ goal: "g", pageIds: ["p1"], maxModelCalls: 10 });
    const done = await waitForRun(h.repo, run.runId);
    expect(done.status).toBe("failed");
    expect(attempts).toBe(1);
    expect(h.recorded).toEqual([{ role: "agent", error: "The model provider is temporarily unavailable." }]);
    expect(done.error).not.toContain("private provider response body");
    h.repo.db.close();
  });
});
