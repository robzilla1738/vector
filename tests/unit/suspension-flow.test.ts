import { fixturePage, fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { describe, expect, it, vi } from "vitest";
import type { ExecContext } from "../../apps/runtime/src/execution/executor.js";
import type { DatabaseSync } from "node:sqlite";
import type { Observation, PlanStep, StepOutcome } from "@aux/contracts";
import { EventBus, MockModelClient, openDb, Repo, RunCoordinator, type ModelClient } from "@aux/runtime";

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

const tool = (toolName: string, input: unknown = {}) => ({
  toolCalls: [{ toolCallId: crypto.randomUUID(), toolName, input }],
});
const done = () => tool("submit_result", { report: "Order page reviewed." });
const scripted = (steps: MockModelClient["toolSteps"]): ModelClient => {
  const model = new MockModelClient().scriptToolSteps(steps);
  const dispatch = model.toolCallStep.bind(model);
  let calls = 0;
  model.toolCallStep = async (request) => {
    if (++calls > steps.length) throw new Error("Unexpected SDK request beyond the fixture script.");
    return dispatch(request);
  };
  return model;
};

/**
 * What the SafetyDispatchGate produces on an `ask`: it parks a typed suspension
 * (approval/handoff/action-confirmation), then its thrown needs_input lands as
 * a failed step outcome — the coordinator must wait on THAT suspension, not a
 * second ask-user-question record.
 */
function gateAsk(
  runId: string,
  step: PlanStep | undefined,
  park?: (ctx: { runId: string; approvalId: string }) => void,
) {
  const approvalId = "ap-1";
  park?.({ runId, approvalId });
  const steps: StepOutcome[] = [
    {
      stepId: step?.id ?? "s1",
      op: step?.op ?? "click",
      status: "failed",
      startedAt: 1,
      durationMs: 1,
      error: { code: "needs_input", message: "Approve the checkout click?" },
    },
  ];
  return { status: "failed" as const, steps };
}

function harness(
  model: ModelClient,
  onExecute: (runId: string, step: PlanStep | undefined) => { status: string; steps: StepOutcome[] },
) {
  const db: DatabaseSync = openDb(":memory:");
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const pages = {
    observe: vi.fn(async () => obs()),
    execute: vi.fn(async (program: { steps: PlanStep[] }, ctx: ExecContext = {}) => {
      const step = program.steps[0]!;
      const prior = db
        .prepare(
          "SELECT state FROM safety_suspensions WHERE run_id=? AND kind='approval' ORDER BY created_at DESC LIMIT 1",
        )
        .get(ctx.runId ?? "") as { state: string } | undefined;
      if (prior && ["answered", "cancelled"].includes(prior.state)) {
        const allowed = prior.state === "answered";
        if (allowed) ctx.beforeDispatch?.(step);
        const outcome: StepOutcome = {
          stepId: step.id,
          op: step.op,
          status: allowed ? "ok" : "failed",
          startedAt: 1,
          durationMs: 1,
          effect: allowed ? "observed" : "authorized",
          ...(allowed
            ? {
                receipt: {
                  observed: "Checkout click applied",
                  remoteConfirmed: false,
                  uncertain: false,
                  unconfirmed: false,
                  dispatchedBeforeTakeover: false,
                },
              }
            : { error: { code: "permission_denied", message: "The person declined this action." } }),
        };
        ctx.settleStep?.(outcome, step);
        ctx.onStep?.(outcome, step);
        return { status: allowed ? "completed" : "failed", steps: [outcome] };
      }
      return onExecute(ctx.runId ?? "", step);
    }),
    capture: vi.fn(async () => ({ dataUrl: undefined, width: 0, height: 0, scale: 1 })),
    livePageIds: () => ["p1"],
    get: (fixturePageId: string): import("@aux/contracts").PageTarget => ({
      ...fixturePage(fixturePageId, "http://x.test/order", 1),
      viewStatus: "visible",
      documentEpoch: 1,
      url: "http://x.test/order",
    }),
  };
  const coordinator = new RunCoordinator({
    turnMentions: fixtureTurnMentions((pageId) => pages.get(pageId)),
    repo,
    events,
    pages: pages as never,
    model: () => model,
    defaultModel: () => "test/planner",

    recordModelCall: () => {},
  });
  return { db, repo, coordinator, pages };
}

const suspensionState = (db: DatabaseSync, suspensionId: string) =>
  (
    db.prepare("SELECT state FROM safety_suspensions WHERE suspension_id=?").get(suspensionId) as {
      state: string;
    }
  ).state;

async function waitForStatus(repo: Repo, runId: string, status: string) {
  for (let i = 0; i < 400; i++) {
    const r = repo.getRun(runId)!;
    if (
      r.status === status ||
      ["completed", "partially_completed", "failed", "cancelled", "interrupted"].includes(r.status)
    )
      return r;
    await new Promise((res) => setTimeout(res, 10));
  }
  throw new Error(`run never reached ${status}`);
}

async function settle(repo: Repo, runId: string) {
  for (let i = 0; i < 400; i++) {
    const r = repo.getRun(runId)!;
    if (["completed", "partially_completed", "failed", "cancelled", "interrupted"].includes(r.status))
      return r;
    await new Promise((res) => setTimeout(res, 10));
  }
  throw new Error("run did not settle");
}

describe("gate ask → coordinator suspension flow", () => {
  it("waits on the gate-parked approval suspension and wakes on its decision", async () => {
    const model = scripted([
      tool("snapshot"),
      tool("act", { steps: [{ id: "s1", op: "click", target: "r1" }] }),
      done(),
    ]);
    let coordinator!: RunCoordinator;
    const h = harness(model, (runId) =>
      gateAsk(runId, { id: "s1", op: "click", target: "r1" } as PlanStep, ({ runId, approvalId }) =>
        coordinator.suspensions.park({
          runId,
          threadId: "chat-1",
          turnId: runId,
          kind: "approval",
          request: {
            kind: "approval",
            approvalId,
            instruction: "Approve the checkout click?",
            guidance: "Wait for approval.",
          },
        }),
      ),
    );
    coordinator = h.coordinator;

    const run = await coordinator.start({ goal: "place the order", pageIds: ["p1"], chatId: "chat-1" });
    const parked = await waitForStatus(h.repo, run.runId, "needs_input");

    // The run parked on the GATE's suspension — kind and approvalId survive;
    // no second ask-user-question record superseded it.
    const pending = coordinator.suspensions.pending(run.runId);
    expect(parked.status).toBe("needs_input");
    expect(pending?.kind).toBe("approval");
    expect(pending?.request.approvalId).toBe("ap-1");
    expect(
      h.db.prepare("SELECT COUNT(*) AS n FROM safety_suspensions WHERE run_id=?").get(run.runId),
    ).toEqual({ n: 1 });

    // What safety.approvals.decide does: resolve the suspension, wake the run.
    const resolved = coordinator.suspensions.resolveByApprovalId("ap-1", "answered");
    expect(resolved?.runId).toBe(run.runId);
    await coordinator.answer(resolved!.runId, "The user approved the requested action.");

    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(suspensionState(h.db, pending!.suspensionId)).toBe("answered");
    h.db.close();
  });

  it("a declined approval keeps the suspension cancelled and resumes with refusal guidance", async () => {
    const model = scripted([
      tool("snapshot"),
      tool("act", { steps: [{ id: "s1", op: "click", target: "r1" }] }),
      done(),
    ]);
    let coordinator!: RunCoordinator;
    const h = harness(model, (runId) =>
      gateAsk(runId, { id: "s1", op: "click", target: "r1" } as PlanStep, ({ runId, approvalId }) =>
        coordinator.suspensions.park({
          runId,
          threadId: "chat-1",
          turnId: runId,
          kind: "approval",
          request: {
            kind: "approval",
            approvalId,
            instruction: "Approve the checkout click?",
            guidance: "Wait for approval.",
          },
        }),
      ),
    );
    coordinator = h.coordinator;

    const run = await coordinator.start({ goal: "place the order", pageIds: ["p1"], chatId: "chat-1" });
    await waitForStatus(h.repo, run.runId, "needs_input");
    const pending = coordinator.suspensions.pending(run.runId)!;

    const resolved = coordinator.suspensions.resolveByApprovalId("ap-1", "cancelled");
    await coordinator.answer(
      resolved!.runId,
      "The user declined the requested action. Do not retry it; choose a different action.",
    );

    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    // The run's wait-loop resolve is a no-op — the decline stands.
    expect(suspensionState(h.db, pending.suspensionId)).toBe("cancelled");
    h.db.close();
  });

  it("an explicit action-confirmation waits for the actual user's review", async () => {
    const h = harness(
      scripted([
        tool("snapshot"),
        tool("request_action_confirmation", { summary: "Review the observed order page." }),
        done(),
      ]),
      () => {
        throw new Error("No page action was requested.");
      },
    );
    const run = await h.coordinator.start({ goal: "Review the order", pageIds: ["p1"], chatId: "chat-1" });
    expect((await waitForStatus(h.repo, run.runId, "needs_input")).status).toBe("needs_input");
    const pending = h.coordinator.suspensions.pending(run.runId)!;
    expect(pending.kind).toBe("action-confirmation");
    await h.coordinator.answer(run.runId, "Reviewed.");
    expect((await settle(h.repo, run.runId)).status).toBe("completed");
    expect(suspensionState(h.db, pending.suspensionId)).toBe("answered");
    h.db.close();
  });

  it("an unbound needs_input does not invent an approval; the SDK explicitly asks the user", async () => {
    const model = scripted([
      tool("snapshot"),
      tool("act", { steps: [{ id: "s1", op: "click", target: "r1" }] }),
      tool("ask_user_question", { question: "How should I continue after the blocked action?" }),
      done(),
    ]);
    const h = harness(model, (runId) => gateAsk(runId, { id: "s1", op: "click", target: "r1" } as PlanStep));

    const run = await h.coordinator.start({ goal: "place the order", pageIds: ["p1"], chatId: "chat-1" });
    await waitForStatus(h.repo, run.runId, "needs_input");

    const pending = h.coordinator.suspensions.pending(run.runId);
    expect(pending?.kind).toBe("ask-user-question");

    await h.coordinator.answer(run.runId, "yes, submit it");
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    h.db.close();
  });
});

it("preserves a genuinely parked run across graceful restart, history limits and current native authority", async () => {
  const { markInterruptedRuns, activeRunIds } =
    await import("../../apps/runtime/src/services/startup-recovery.js");
  const { TranscriptStore } = await import("../../apps/runtime/src/agent/loop/transcript.js");
  const { TurnMentionService } = await import("../../apps/runtime/src/services/turn-mention-service.js");
  const h = harness(
    scripted([tool("snapshot"), tool("ask_user_question", { question: "Continue?" })]),
    () => {
      throw new Error("This review authorizes no browser effect");
    },
  );
  let ownerAvailable = true;
  const nativeSource = vi.fn(async (token: string) => {
    if (!ownerAvailable) throw new Error("Original native window unavailable");
    expect(token).toBe("owner-token");
    return { revision: 0, layout: null, windowId: "main", activePageId: "p1" };
  });
  h.coordinator.deps.turnMentions = new TurnMentionService({
    page: (id) => h.pages.get(id),
    organization: async () => ({ revision: 0, shared: null }),
    routine: () => undefined,
    connectors: () => ({ entries: [], access: [] }),
    turnSourceContext: nativeSource,
  });
  const run = await h.coordinator.start({
    goal: "Review the order",
    pageIds: ["p1"],
    chatId: "restart-chat",
    nativeTurnContext: "owner-token",
  });
  await waitForStatus(h.repo, run.runId, "needs_input");
  const suspension = h.coordinator.suspensions.pending(run.runId)!;
  const transcript = new TranscriptStore(h.db);
  expect(transcript.openPark(run.runId)).toBeDefined();
  await h.coordinator.close();
  expect(h.coordinator.suspensions.pending(run.runId)?.suspensionId).toBe(suspension.suspensionId);
  h.db
    .prepare(
      "INSERT INTO conversations(chat_id,title,archived,created_at,updated_at,private_task) VALUES(?,?,1,0,0,0)",
    )
    .run("archived-active", "Archived");
  h.repo.saveRun({
    runId: "old-active",
    goal: "Interrupted work",
    status: "running",
    pageIds: [],
    createdAt: 0,
    config: { chatId: "archived-active" },
  });
  for (let index = 0; index < 205; index++)
    h.repo.saveRun({
      runId: `history-${index}`,
      goal: "History",
      status: "completed",
      pageIds: [],
      createdAt: Date.now() + index,
    });
  await markInterruptedRuns(h.repo);
  const continuedModel = scripted([tool("snapshot"), done()]);
  const recovered = new RunCoordinator({ ...h.coordinator.deps, model: () => continuedModel });
  recovered.suspensions.expireOrphans(new Set(activeRunIds(h.repo)));
  expect(h.repo.getRun(run.runId)?.status).toBe("needs_input");
  expect(h.repo.getRun("old-active")?.status).toBe("interrupted");
  expect(recovered.controls.has(run.runId)).toBe(false);
  ownerAvailable = false;
  nativeSource.mockClear();
  await expect(recovered.answerWithMentions(run.runId, "Continue", [], () => {})).rejects.toThrow(
    /native window/,
  );
  expect(recovered.controls.has(run.runId)).toBe(false);
  ownerAvailable = true;
  await recovered.answerWithMentions(run.runId, "Continue", [], () => {});
  expect(recovered.controls.has(run.runId)).toBe(true);
  expect((await settle(h.repo, run.runId)).status).toBe("completed");
  expect(nativeSource.mock.calls.length).toBeGreaterThanOrEqual(3);
  expect(transcript.openPark(run.runId)).toBeUndefined();
  expect(h.pages.execute).not.toHaveBeenCalled();
  await recovered.close();
  h.db.close();
});
