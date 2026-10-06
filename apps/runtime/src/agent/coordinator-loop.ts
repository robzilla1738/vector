import { AuxError, type Observation } from "@aux/contracts";
import { recoverAfterCrash } from "./recovery.js";
import { emptyRepairState } from "./repair.js";
import {
  DEFAULT_MAX_MODEL_CALLS,
  DEFAULT_MAX_STEPS,
  MODEL_ERROR_LIMIT,
  TERMINAL_STATUSES,
  type CoordinatorLoopHost,
} from "./coordinator-verify.js";
import {
  awaitHumanAnswer,
  dispatchSourcePlan,
  dispatchPlan,
  giveUpRepair,
  hasNewSteer,
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
import { ModelFailureError } from "./model-failure.js";
import { isConsequential } from "./permissions.js";
export {
  DEFAULT_MAX_MODEL_CALLS,
  DEFAULT_MAX_STEPS,
  TERMINAL_STATUSES,
  tryVisionPlan,
  verifyDoneAgainstObservation,
  verifyResultCitations,
  markUnconfirmedWrites,
  NAV_OPS,
} from "./coordinator-verify.js";
export type { CoordinatorLoopHost } from "./coordinator-verify.js";

export async function runCoordinatorLoop(self: CoordinatorLoopHost, runId: string): Promise<void> {
  const run = self.get(runId);
  const c = self.controls.get(runId)!;
  const model = self.deps.model();
  if (!model) {
    const failure = {
      category: "configuration",
      message: "Set up a model connection in Settings before starting this turn.",
      retryable: false,
      action: "model_settings",
    } as const;
    await self.finish(runId, "failed", undefined, failure.message, undefined, failure);
    return;
  }
  const s: TurnState = {
    self,
    runId,
    run,
    c,
    model,
    modelId: run.config?.modelId ?? self.deps.defaultModel(),
    outcomes: [],
    observedPages: new Map(),
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
    appliedRevision: run.config?.messageRevision ?? 0,
    steers: self.deps.repo.listRunSteers(runId).map((message) => message.text),
  };
  const prior = run.config?.checkpoint as { unresolvedEffects?: string[] } | undefined;
  if (prior?.unresolvedEffects?.length) {
    const recovery = recoverAfterCrash({
      crashAt: "dispatch",
      journal: prior.unresolvedEffects.map((id) => ({ id, idempotencyKey: id, committed: true })),
    });
    run.config = { ...run.config, lastCrashRecovery: recovery as unknown as Record<string, unknown> };
    self.deps.repo.saveRun(run);
    if (recovery.needsUserReview) {
      await self.finish(
        runId,
        "partially_completed",
        undefined,
        "Uncertain dispatched effects need review after crash",
        "Needs review — already-dispatched writes were not retried",
      );
      return;
    }
  }
  await self.setStatus(runId, "planning", "Planning");
  const startedAt = run.startedAt ?? run.createdAt;
  self.deps.repo.saveRun({ ...self.get(runId), startedAt });
  run.startedAt = startedAt;

  try {
    while (true) {
      try {
        if (c.budgetInterrupted) {
          c.budgetInterrupted = false;
          s.observedPages.clear(); s.carriedObs = undefined; s.pendingObs = undefined;
          resetGuards(s);
        }
        const latest = self.get(runId);
        const unresolved = self.durable.unresolved(runId);
        if (unresolved.length) {
          await self.finish(
            runId,
            "interrupted",
            undefined,
            `An action's outcome is uncertain (${unresolved.map((intent) => intent.id).join(", ")}). Review it before continuing.`,
            "Stopped to avoid repeating an uncertain action",
          );
          return;
        }
        const revision = latest.config?.messageRevision ?? 0;
        if (revision !== s.appliedRevision) {
          await self.deps.turnMentions.begin(runId, latest.config?.mentions ?? [], self.ownedPages(runId), {
            workspaceId: latest.config?.contextWorkspaceId,
            taskId: latest.config?.taskId,
            taskRevision: latest.config?.taskRevision,
          });
          const selected = await self.refreshPageSelection(runId);
          s.activePageId = selected.includes(s.activePageId ?? "") ? s.activePageId : selected[0];
          s.observedPages.clear();
          s.appliedRevision = revision;
          s.steers = self.deps.repo.listRunSteers(runId).map((message) => message.text);
          s.notes = undefined;
          s.carriedObs = undefined;
          s.pendingObs = undefined;
          resetGuards(s);
        }
        s.run = latest;
        await self.waitIfPaused(c, runId);
        if (c.deadlineHit) {
          await self.pauseForBudget(runId, { reason: "time", limit: latest.config?.deadlineMs ?? 0,
            used: Date.now() - (latest.startedAt ?? latest.createdAt) });
          s.observedPages.clear(); s.carriedObs = undefined; s.pendingObs = undefined;
          resetGuards(s);
          continue;
        }
        const maxModelCalls = latest.config?.maxModelCalls ?? DEFAULT_MAX_MODEL_CALLS;
        const maxSteps = latest.config?.maxSteps ?? DEFAULT_MAX_STEPS;
        if (maxModelCalls > 0 && s.modelCalls >= maxModelCalls) {
          await self.pauseForBudget(runId, { reason: "model_calls", limit: maxModelCalls, used: s.modelCalls });
          continue;
        }
        if (maxSteps > 0 && s.stepsRun >= maxSteps) {
          await self.pauseForBudget(runId, { reason: "steps", limit: maxSteps, used: s.stepsRun });
          continue;
        }
        if (!s.activePageId) throw new AuxError("invalid_params", "run has no target page");

        const obs = await observeActivePage(s);
        if (hasNewSteer(s)) continue;
        const obsArtifactId = self.deps.saveObservation?.(runId, obs);
        self.assertTargetAlive(obs);
        if (noteObservationProgress(s, obs)) {
          const verdict = await tryFinalDecision(s, "page state stopped changing", obs);
          if (verdict === "done") return;
          if (verdict === "input") {
            resetGuards(s);
            continue;
          }
          throw new AuxError("step_failed", "no progress — same page state repeatedly");
        }

        await self.setStatus(runId, "planning", "Thinking…");
        const attempt = await planTurn(s, obs, obsArtifactId);
        if (hasNewSteer(s) || c.deadlineHit || c.budgetInterrupted) {
          if (attempt.early) {
            attempt.early.discardPending();
            const settled = await attempt.early.finish([]);
            s.stepsRun += settled.steps.length;
          }
          continue;
        }
        if (isPlanFailure(attempt)) {
          const next = await handlePlannerFailure(s, obs, attempt.early, attempt.error);
          if (next === "return") return;
          continue;
        }
        if (
          attempt.early &&
          (attempt.plan.status !== "continue" ||
            (attempt.plan.pageId && attempt.plan.pageId !== s.activePageId) ||
            !attempt.plan.steps?.length)
        ) {
          attempt.early.discardPending();
          const partial = await attempt.early.finish([]);
          s.stepsRun += partial.steps.length;
          attempt.early = undefined;
        }
        const next = await applyPlan(s, obs, attempt);
        if (hasNewSteer(s) && !TERMINAL_STATUSES.has(self.get(runId).status)) continue;
        if (next === "return") return;
      } catch (error) {
        if ((c.deadlineHit || c.budgetInterrupted) && !c.abort.signal.aborted) continue;
        // Accounting/retirement may finish after the owner has already returned
        // the page. The old aborted planning turn still cannot become a failure
        // or a retry against its stale observation merely because pause ended.
        if (
          c.takeoverInterrupted &&
          !c.abort.signal.aborted &&
          !TERMINAL_STATUSES.has(self.get(runId).status)
        ) {
          c.takeoverInterrupted = false;
          s.observedPages.clear();
          s.carriedObs = undefined;
          s.pendingObs = undefined;
          resetGuards(s);
          continue;
        }
        if (c.paused && !c.abort.signal.aborted && !TERMINAL_STATUSES.has(self.get(runId).status)) continue;
        if (hasNewSteer(s) && !c.abort.signal.aborted && !TERMINAL_STATUSES.has(self.get(runId).status))
          continue;
        throw error;
      }
    }
  } catch (e) {
    if (e instanceof AuxError && e.code === "cancelled") return;
    if (c.abort.signal.aborted) return;
    if (e instanceof ModelFailureError) await giveUpRepair(s, e.failure.message, e.failure);
    else await giveUpRepair(s, e instanceof Error ? e.message : String(e));
  } finally {
    self.controls.delete(runId);
  }
}

async function applyPlan(
  s: TurnState,
  obs: Observation,
  attempt: PlanAttempt,
): Promise<"return" | "continue"> {
  const { plan } = attempt;
  if (plan.status === "source") {
    await s.self.setStatus(s.runId, "running", plan.message);
    return dispatchSourcePlan(s, plan);
  }
  if (plan.status === "done" && !plan.steps?.some((step) => isConsequential(step.op)))
    return settleDonePlan(s, plan, obs, attempt);
  if (plan.status === "needs_input") {
    return (await awaitHumanAnswer(s, plan.question ?? "Needs input")) ? "continue" : "return";
  }
  const retargeted = !!(plan.pageId && plan.pageId !== s.activePageId && s.run.pageIds.includes(plan.pageId));
  if (retargeted) s.activePageId = plan.pageId!;
  if (plan.observationRequest) {
    s.pendingObs = { scope: plan.observationRequest.scope, subtreeRef: plan.observationRequest.subtreeRef };
  }
  await s.self.setStatus(s.runId, "running", plan.message);
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
      throw new AuxError("model_output_invalid", "continue without steps or observation request");
    }
    if (s.modelErrorCount === 2 && !s.visionUsed) s.visionPending = true;
    s.lastError = `you returned continue with no steps — provide steps, an observationRequest, or a pageId from PAGES to switch to`;
    return "continue";
  }
  s.modelErrorCount = 0;
  // a "done" carrying actions is treated as a continue: run them, then re-plan
  return dispatchPlan(
    s,
    obs,
    plan.status === "done" ? { ...attempt, plan: { ...plan, status: "continue" } } : attempt,
  );
}
