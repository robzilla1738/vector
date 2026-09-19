import { VectorError, type Observation } from "@vector/contracts";
import { recoverAfterCrash } from "./recovery.js";
import { initialMachine, reduce } from "./machine.js";
import { emptyRepairState } from "./repair.js";
import {
  DEFAULT_MAX_MODEL_CALLS,
  DEFAULT_MAX_STEPS,
  harvestResults,
  MODEL_ERROR_LIMIT,
  TERMINAL_STATUSES,
  type CoordinatorLoopHost,
} from "./coordinator-verify.js";
import {
  dispatchPlan,
  giveUpRepair,
  handlePlannerFailure,
  isPlanFailure,
  noteObservationProgress,
  observeActivePage,
  planTurn,
  resetGuards,
  settleDonePlan,
  tryFinalDecision,
  type PlanAttempt,
  type TurnState,
} from "./coordinator-turn.js";

export {
  DEFAULT_MAX_MODEL_CALLS,
  DEFAULT_MAX_STEPS,
  TERMINAL_STATUSES,
  tryVisionPlan,
  verifyDoneAgainstObservation,
} from "./coordinator-verify.js";
export type { CoordinatorLoopHost } from "./coordinator-verify.js";

export async function runCoordinatorLoop(self: CoordinatorLoopHost, runId: string): Promise<void> {
  const run = self.get(runId);
  const c = self.controls.get(runId)!;
  const model = self.deps.model();
  if (!model) {
    self.finish(runId, "failed", undefined, "No model configured — set a Gateway API key in Settings");
    return;
  }
  const s: TurnState = {
    self,
    runId,
    run,
    c,
    model,
    modelId: run.config?.modelId ?? self.deps.defaultModel(),
    machine: reduce(initialMachine(), { type: "start" }),
    outcomes: [],
    modelCalls: 0,
    stepsRun: 0,
    repairState: emptyRepairState(),
    lastObsSig: "",
    noProgress: 0,
    outcomeCursor: 0,
    activePageId: run.pageIds[0],
    lastPlanSig: "",
    repeatCount: 0,
    modelErrorCount: 0,
    visionPending: false,
    visionUsed: false,
    lastActionFailed: false,
    doneChallenged: false,
  };
  const maxSteps = run.config?.maxSteps ?? DEFAULT_MAX_STEPS;
  const maxModelCalls = run.config?.maxModelCalls ?? DEFAULT_MAX_MODEL_CALLS;
  if (run.config?.deadlineMs) {
    AbortSignal.timeout(run.config.deadlineMs).addEventListener(
      "abort",
      () => {
        if (c.abort.signal.aborted) return;
        c.deadlineHit = true;
        c.abort.abort();
        c.answerWaiter?.resolve("");
      },
      { once: true },
    );
  }
  const prior = run.config?.checkpoint as { unresolvedEffects?: string[] } | undefined;
  if (prior?.unresolvedEffects?.length) {
    const recovery = recoverAfterCrash({
      crashAt: "dispatch",
      journal: prior.unresolvedEffects.map((id) => ({ id, idempotencyKey: id, committed: true })),
    });
    run.config = { ...(run.config ?? {}), lastCrashRecovery: recovery as unknown as Record<string, unknown> };
    self.deps.repo.saveRun(run);
    if (recovery.needsUserReview) {
      self.finish(runId, "partially_completed", undefined, "Uncertain dispatched effects need review after crash", "Needs review — already-dispatched writes were not retried");
      return;
    }
  }
  self.setStatus(runId, "planning", "Planning");
  const startedAt = Date.now();
  self.deps.repo.saveRun({ ...self.get(runId), startedAt });
  run.startedAt = startedAt;

  try {
    while (true) {
      await self.waitIfPaused(c, runId);
      if (maxModelCalls > 0 && s.modelCalls >= maxModelCalls) throw new VectorError("step_failed", "model call budget exhausted");
      if (s.stepsRun >= maxSteps) throw new VectorError("step_failed", "step budget exhausted");
      if (!s.activePageId) throw new VectorError("invalid_params", "run has no target page");

      const obs = await observeActivePage(s);
      const obsArtifactId = self.deps.saveObservation?.(runId, obs);
      self.assertTargetAlive(obs);
      if (noteObservationProgress(s, obs)) {
        const verdict = await tryFinalDecision(s, "page state stopped changing", obs);
        if (verdict === "done") return;
        if (verdict === "input") {
          resetGuards(s);
          continue;
        }
        throw new VectorError("step_failed", "no progress — same page state repeatedly");
      }

      self.setStatus(runId, "planning", "Thinking…");
      const attempt = await planTurn(s, obs, obsArtifactId);
      if (isPlanFailure(attempt)) {
        const next = await handlePlannerFailure(s, obs, attempt.early, attempt.error);
        if (next === "return") return;
        continue;
      }
      if (attempt.early && (attempt.plan.status !== "continue" || (attempt.plan.pageId && attempt.plan.pageId !== s.activePageId) || !attempt.plan.steps?.length)) {
        attempt.early.halt();
        const partial = await attempt.early.finish([]);
        s.stepsRun += partial.steps.length;
        attempt.early = undefined;
      }
      const next = await applyPlan(s, obs, attempt);
      if (next === "return") return;
    }
  } catch (e) {
    if (e instanceof VectorError && e.code === "cancelled") return;
    if (c.abort.signal.aborted) return;
    giveUpRepair(s, e instanceof Error ? e.message : String(e));
  } finally {
    if (c.deadlineHit && !TERMINAL_STATUSES.has(self.get(runId).status)) {
      const partial = s.outcomes.some((o) => o.status === "ok" && (o.extracted !== undefined || o.detail !== undefined));
      self.finish(
        runId,
        partial ? "partially_completed" : "failed",
        partial ? harvestResults(s.outcomes) : undefined,
        `run deadline exceeded (${run.config?.deadlineMs}ms)`,
        partial ? "Ran out of time — here's what I found" : "Ran out of time",
      );
    }
    self.controls.delete(runId);
  }
}

async function applyPlan(s: TurnState, obs: Observation, attempt: PlanAttempt): Promise<"return" | "continue"> {
  const { plan } = attempt;
  if (plan.status === "done") return settleDonePlan(s, plan, obs, attempt.visionPlanned);
  if (plan.status === "needs_input") {
    s.machine = reduce(s.machine, { type: "plan", status: "needs_input" });
    s.self.setStatus(s.runId, "needs_input", plan.question ?? "Needs input");
    const answer = await s.self.waitForAnswer(s.c, s.runId);
    if (s.c.abort.signal.aborted) return "return";
    s.outcomes.push({
      stepId: `input-${Date.now()}`,
      op: "human_input",
      status: "ok",
      startedAt: Date.now(),
      durationMs: 0,
      detail: `human answered: ${answer.slice(0, 120)}`,
    });
    s.machine = reduce(s.machine, { type: "answer" });
    return "continue";
  }
  const retargeted = !!(plan.pageId && plan.pageId !== s.activePageId && s.run.pageIds.includes(plan.pageId));
  if (retargeted) s.activePageId = plan.pageId!;
  if (plan.observationRequest) {
    s.pendingObs = { scope: plan.observationRequest.scope, subtreeRef: plan.observationRequest.subtreeRef };
  }
  s.self.setStatus(s.runId, "running", plan.message);
  if (!plan.steps?.length) {
    if (plan.observationRequest || retargeted) {
      s.modelErrorCount = 0;
      return "continue";
    }
    s.modelErrorCount++;
    if (s.modelErrorCount >= MODEL_ERROR_LIMIT) {
      const verdict = await tryFinalDecision(s, "planner returned empty continue plans repeatedly", obs);
      if (verdict === "done") return "return";
      if (verdict === "input") {
        resetGuards(s);
        return "continue";
      }
      throw new VectorError("model_output_invalid", "continue without steps or observation request");
    }
    if (s.modelErrorCount === 2 && !s.visionUsed) s.visionPending = true;
    s.lastError = `you returned continue with no steps — provide steps, an observationRequest, or a pageId from PAGES to switch to`;
    return "continue";
  }
  s.modelErrorCount = 0;
  return dispatchPlan(s, obs, attempt);
}
