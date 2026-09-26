import { describe, expect, it, vi } from "vitest";
import type { DatabaseSync } from "node:sqlite";
import type { Observation, PlanStep, StepOutcome } from "@aux/contracts";
import { EventBus, openDb, Repo, RunCoordinator, type ModelClient } from "@aux/runtime";

const obs = (): Observation =>
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
      text: "Order page",
      headings: [],
      elements: [{ ref: "r1", tag: "button", role: "button", name: "Save", frame: "main" }],
      formFields: [],
      tables: [],
      links: [],
      dialogs: [],
      truncated: false,
      stats: { elementsTotal: 1, elementsShown: 1 },
    },
  }) as unknown as Observation;

const scripted = (objects: unknown[]): ModelClient => {
  const m = {
    calls: 0,
    generateStructured: async (o: { schema: { parse: (v: unknown) => unknown } }) => {
      const i = m.calls++;
      return { object: o.schema.parse(objects[Math.min(i, objects.length - 1)]), durationMs: 1 };
    },
    generateText: async () => ({ text: "", durationMs: 0 }),
    listModels: async () => [],
  };
  return m as never;
};

/**
 * What the SafetyDispatchGate produces on an `ask`: it parks a typed suspension
 * (approval/handoff/action-confirmation), then its thrown needs_input lands as
 * a failed step outcome — the coordinator must wait on THAT suspension, not a
 * second ask-user-question record.
 */
function gateAsk(runId: string, step: PlanStep | undefined, park?: (ctx: { runId: string; approvalId: string }) => void) {
  const approvalId = "ap-1";
  park?.({ runId, approvalId });
  const steps: StepOutcome[] = [{
    stepId: step?.id ?? "s1", op: step?.op ?? "click", status: "failed", startedAt: 1, durationMs: 1,
    error: { code: "needs_input", message: "Approve the checkout click?" },
  }];
  return { status: "failed" as const, steps };
}

function harness(model: ModelClient, onExecute: (runId: string, step: PlanStep | undefined) => { status: string; steps: StepOutcome[] }) {
  const db: DatabaseSync = openDb(":memory:");
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const pages = {
    observe: vi.fn(async () => obs()),
    execute: vi.fn(async (program: { steps: PlanStep[] }, ctx?: { runId?: string; onStep?: (o: StepOutcome, s: PlanStep) => void }) =>
      onExecute(ctx?.runId ?? "", program.steps[0])),
    capture: vi.fn(async () => ({ dataUrl: undefined, width: 0, height: 0, scale: 1 })),
    livePageIds: () => ["p1"],
    get: () => ({ viewStatus: "visible", documentEpoch: 1, url: "http://x.test/order" }),
  };
  const coordinator = new RunCoordinator({
    repo, events, pages: pages as never,
    model: () => model,
    defaultModel: () => "test/planner",
    recoveryModel: () => undefined,
    recordModelCall: () => {},
    grants: ["effect:read", "effect:write", "effect:egress"],
  });
  return { db, repo, coordinator, pages };
}

const suspensionState = (db: DatabaseSync, suspensionId: string) =>
  (db.prepare("SELECT state FROM safety_suspensions WHERE suspension_id=?").get(suspensionId) as { state: string }).state;

async function waitForStatus(repo: Repo, runId: string, status: string) {
  for (let i = 0; i < 400; i++) {
    const r = repo.getRun(runId)!;
    if (r.status === status || ["completed", "partially_completed", "failed", "cancelled", "interrupted"].includes(r.status)) return r;
    await new Promise((res) => setTimeout(res, 10));
  }
  throw new Error(`run never reached ${status}`);
}

async function settle(repo: Repo, runId: string) {
  for (let i = 0; i < 400; i++) {
    const r = repo.getRun(runId)!;
    if (["completed", "partially_completed", "failed", "cancelled", "interrupted"].includes(r.status)) return r;
    await new Promise((res) => setTimeout(res, 10));
  }
  throw new Error("run did not settle");
}

describe("gate ask → coordinator suspension flow", () => {
  it("waits on the gate-parked approval suspension and wakes on its decision", async () => {
    const model = scripted([
      { status: "continue", message: "submit", steps: [{ id: "s1", op: "click", target: "r1" }] },
      { status: "done", message: "done", result: { ok: "Order page" } },
    ]);
    let coordinator!: RunCoordinator;
    const h = harness(model, (runId) => gateAsk(runId, { id: "s1", op: "click", target: "r1" } as PlanStep,
      ({ runId, approvalId }) => coordinator.suspensions.park({
        runId, threadId: "chat-1", turnId: runId, kind: "approval",
        request: { kind: "approval", approvalId, instruction: "Approve the checkout click?", guidance: "Wait for approval." },
      })));
    coordinator = h.coordinator;

    const run = await coordinator.start({ goal: "place the order", pageIds: ["p1"], chatId: "chat-1" });
    const parked = await waitForStatus(h.repo, run.runId, "needs_input");

    // The run parked on the GATE's suspension — kind and approvalId survive;
    // no second ask-user-question record superseded it.
    const pending = coordinator.suspensions.pending(run.runId);
    expect(parked.status).toBe("needs_input");
    expect(pending?.kind).toBe("approval");
    expect(pending?.request.approvalId).toBe("ap-1");
    expect(h.db.prepare("SELECT COUNT(*) AS n FROM safety_suspensions WHERE run_id=?").get(run.runId)).toEqual({ n: 1 });

    // What safety.approvals.decide does: resolve the suspension, wake the run.
    const resolved = coordinator.suspensions.resolveByApprovalId("ap-1", "answered");
    expect(resolved?.runId).toBe(run.runId);
    coordinator.answer(resolved!.runId, "The user approved the requested action.");

    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(suspensionState(h.db, pending!.suspensionId)).toBe("answered");
    h.db.close();
  });

  it("a declined approval keeps the suspension cancelled and resumes with refusal guidance", async () => {
    const model = scripted([
      { status: "continue", message: "submit", steps: [{ id: "s1", op: "click", target: "r1" }] },
      { status: "done", message: "done", result: { ok: "Order page" } },
    ]);
    let coordinator!: RunCoordinator;
    const h = harness(model, (runId) => gateAsk(runId, { id: "s1", op: "click", target: "r1" } as PlanStep,
      ({ runId, approvalId }) => coordinator.suspensions.park({
        runId, threadId: "chat-1", turnId: runId, kind: "approval",
        request: { kind: "approval", approvalId, instruction: "Approve the checkout click?", guidance: "Wait for approval." },
      })));
    coordinator = h.coordinator;

    const run = await coordinator.start({ goal: "place the order", pageIds: ["p1"], chatId: "chat-1" });
    await waitForStatus(h.repo, run.runId, "needs_input");
    const pending = coordinator.suspensions.pending(run.runId)!;

    const resolved = coordinator.suspensions.resolveByApprovalId("ap-1", "cancelled");
    coordinator.answer(resolved!.runId, "The user declined the requested action. Do not retry it; choose a different action.");

    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    // The run's wait-loop resolve is a no-op — the decline stands.
    expect(suspensionState(h.db, pending.suspensionId)).toBe("cancelled");
    h.db.close();
  });

  it("an action-confirmation ask replans with guidance instead of waiting on the user", async () => {
    const model = scripted([
      { status: "continue", message: "click", steps: [{ id: "s1", op: "click", target: "r1" }] },
      { status: "done", message: "done", result: { ok: "Order page" } },
    ]);
    let coordinator!: RunCoordinator;
    let asked = false;
    const h = harness(model, (runId, step) => {
      // Only the first dispatch asks; the replanned chunk dispatches cleanly.
      if (!asked) {
        asked = true;
        return gateAsk(runId, step, ({ runId }) => coordinator.suspensions.park({
          runId, threadId: "chat-1", turnId: runId, kind: "action-confirmation",
          request: { kind: "action-confirmation", instruction: "Produce a final confirmation turn with a review artifact.", guidance: "End the turn with one tool call carrying the artifact." },
        }));
      }
      return { status: "completed" as const, steps: [{ stepId: step?.id ?? "s1", op: step?.op ?? "click", status: "ok" as const, startedAt: 1, durationMs: 1 }] };
    });
    coordinator = h.coordinator;

    const run = await coordinator.start({ goal: "check out", pageIds: ["p1"], chatId: "chat-1" });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    // The suspension was resolved by replanning — never parked for a human.
    expect(coordinator.suspensions.pending(run.runId)).toBeUndefined();
    h.db.close();
  });

  it("a needs_input with no parked suspension falls back to ask-user-question", async () => {
    const model = scripted([
      { status: "continue", message: "submit", steps: [{ id: "s1", op: "click", target: "r1" }] },
      { status: "done", message: "done", result: { ok: "Order page" } },
    ]);
    const h = harness(model, (runId) => gateAsk(runId, { id: "s1", op: "click", target: "r1" } as PlanStep));

    const run = await h.coordinator.start({ goal: "place the order", pageIds: ["p1"], chatId: "chat-1" });
    await waitForStatus(h.repo, run.runId, "needs_input");

    const pending = h.coordinator.suspensions.pending(run.runId);
    expect(pending?.kind).toBe("ask-user-question");

    h.coordinator.answer(run.runId, "yes, submit it");
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    h.db.close();
  });
});
