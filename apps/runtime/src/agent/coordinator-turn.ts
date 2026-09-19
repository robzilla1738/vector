import {
  EventTypes,
  FinalDecisionSchema,
  PlanChunkSchema,
  RepairChunkSchema,
  VectorError,
  type FinalDecision,
  type Observation,
  type PlanChunk,
  type RepairChunk,
  type Run,
  type Step,
  type StepOutcome,
} from "@vector/contracts";
import type { z } from "zod";
import type { ModelClient } from "./model-client.js";
import { EarlyDispatcher } from "./early-dispatch.js";
import { PlanStreamParser } from "./plan-stream.js";
import { buildFinalAnswerPrompt, buildPlannerPrompt, FINAL_ANSWER_SYSTEM, PLANNER_SYSTEM } from "./planner.js";
import { compileSkill, markSkillFailed, tryReuseSkill, verifySkillPostconditions } from "./skills.js";
import { promptCannotGrant } from "./policy.js";
import { compileAndAuthorize } from "./action-compiler.js";
import { beginConsequentialWrite, settleWrite } from "./durable.js";
import { reduce, type Machine } from "./machine.js";
import { emptyRepairState, noteRepair, type RepairState } from "./repair.js";
import {
  harvestResults,
  MODEL_ERROR_LIMIT,
  NO_PROGRESS_LIMIT,
  OBSERVATION_BLIND_OPS,
  PLAN_REPEAT_LIMIT,
  verifyDoneAgainstObservation,
  type CoordinatorLoopHost,
} from "./coordinator-verify.js";

export type LoopControl = {
  abort: AbortController;
  paused: boolean;
  deadlineHit?: boolean;
  answerWaiter?: { resolve: (answer: string) => void };
};

export type TurnState = {
  self: CoordinatorLoopHost;
  runId: string;
  run: Run;
  c: LoopControl;
  model: ModelClient;
  modelId: string;
  machine: Machine;
  outcomes: StepOutcome[];
  modelCalls: number;
  stepsRun: number;
  repairState: RepairState;
  lastObsSig: string;
  noProgress: number;
  outcomeCursor: number;
  activePageId: string | undefined;
  lastError?: string;
  lastPlanSig: string;
  repeatCount: number;
  modelErrorCount: number;
  visionPending: boolean;
  visionUsed: boolean;
  lastActionFailed: boolean;
  doneChallenged: boolean;
  pendingObs?: { scope?: "full" | "forms" | "links" | "tables" | "subtree"; subtreeRef?: string };
  carriedObs?: Observation;
};

export function resetGuards(s: TurnState): void {
  s.noProgress = 0;
  s.repeatCount = 0;
  s.modelErrorCount = 0;
  s.repairState = emptyRepairState();
  s.lastPlanSig = "";
  s.lastError = undefined;
  s.lastActionFailed = false;
  s.doneChallenged = false;
}

export function giveUpRepair(s: TurnState, error?: string): void {
  const partial = s.outcomes.some((o) => o.status === "ok" && (o.extracted !== undefined || o.detail !== undefined));
  s.self.finish(
    s.runId,
    partial ? "partially_completed" : "failed",
    partial ? harvestResults(s.outcomes) : undefined,
    error,
    partial ? "Couldn't fully finish — here's what I found" : undefined,
  );
}

export async function structuredCall<T>(
  s: TurnState,
  role: "planner" | "repair" | "final",
  args: { modelId: string; system: string; prompt: string; schema: z.ZodType<T>; maxOutputTokens: number },
  stream?: { onText: (delta: string) => void; firstDispatchAt: () => number | undefined },
) {
  s.modelCalls++;
  const started = Date.now();
  try {
    const call =
      stream && s.model.streamStructured
        ? await s.model.streamStructured<T>({ ...args, signal: s.c.abort.signal, onText: stream.onText })
        : await s.model.generateStructured<T>({ ...args, signal: s.c.abort.signal });
    const firstDispatchAt = stream?.firstDispatchAt();
    s.self.deps.recordModelCall({
      runId: s.runId,
      role,
      modelId: args.modelId,
      durationMs: call.durationMs,
      inputTokens: call.inputTokens,
      outputTokens: call.outputTokens,
      providerMetadata:
        firstDispatchAt === undefined
          ? call.providerMetadata
          : { ...(call.providerMetadata ?? {}), stream: { firstDispatchMs: firstDispatchAt - started, totalMs: call.durationMs } },
    });
    return call;
  } catch (e) {
    s.self.deps.recordModelCall({
      runId: s.runId,
      role,
      modelId: args.modelId,
      durationMs: Date.now() - started,
      error: e instanceof Error ? e.message : String(e),
    });
    throw e;
  }
}

export async function tryFinalDecision(s: TurnState, reason: string, obs: Observation): Promise<"done" | "input" | "gave_up"> {
  try {
    const call = await structuredCall<FinalDecision>(s, "final", {
      modelId: s.modelId,
      system: FINAL_ANSWER_SYSTEM,
      prompt: buildFinalAnswerPrompt({
        goal: s.run.goal,
        observation: obs,
        recentOutcomes: s.outcomes,
        reason,
        context: s.run.config?.context,
      }),
      schema: FinalDecisionSchema,
      maxOutputTokens: 4096,
    });
    const d = call.object;
    if (d.status === "needs_input" && d.question) {
      s.self.setStatus(s.runId, "needs_input", d.question);
      const answer = await s.self.waitForAnswer(s.c, s.runId);
      if (s.c.abort.signal.aborted) return "gave_up";
      s.outcomes.push({
        stepId: `input-${Date.now()}`,
        op: "human_input",
        status: "ok",
        startedAt: Date.now(),
        durationMs: 0,
        detail: `human answered: ${answer.slice(0, 120)}`,
      });
      return "input";
    }
    if (d.status !== "done") return "gave_up";
    const result = d.result && Object.keys(d.result).length ? d.result : harvestResults(s.outcomes);
    if (!s.activePageId) return "gave_up";
    const verifyObs = await s.self.deps.pages.observe(s.activePageId, { sinceRevision: obs.revision, format: "full" });
    const verified = verifyDoneAgainstObservation(result, verifyObs, s.outcomes);
    if (!verified.ok) return "gave_up";
    s.self.finish(s.runId, "completed", result, undefined, d.message || "Done");
    return "done";
  } catch {
    return "gave_up";
  }
}

export async function observeActivePage(s: TurnState): Promise<Observation> {
  const obsReq = s.pendingObs ?? {};
  s.pendingObs = undefined;
  try {
    if (s.carriedObs && s.carriedObs.pageId === s.activePageId) {
      const obs = s.carriedObs;
      s.carriedObs = undefined;
      return obs;
    }
    s.carriedObs = undefined;
    return await s.self.deps.pages.observe(s.activePageId!, obsReq);
  } catch (e) {
    if (e instanceof VectorError && e.code === "target_detached") {
      const next = s.run.pageIds.find((p) => {
        if (p === s.activePageId || !s.self.deps.pages.livePageIds().includes(p)) return false;
        const vs = s.self.deps.pages.get(p).viewStatus;
        return vs !== "detached" && vs !== "crashed";
      });
      if (!next) throw e;
      s.activePageId = next;
      s.self.setStatus(s.runId, "planning", `Page detached — moved to ${next}`);
      return await s.self.deps.pages.observe(next, obsReq);
    }
    throw e;
  }
}

export function noteObservationProgress(s: TurnState, obs: Observation): boolean {
  const sig = `${obs.content.url}#${obs.content.elements.length}#${obs.content.text.length}#${obs.content.text.slice(0, 200)}`;
  const yielded = s.outcomes
    .slice(s.outcomeCursor)
    .some((o) => o.status === "ok" && (o.extracted !== undefined || OBSERVATION_BLIND_OPS.has(o.op)));
  s.outcomeCursor = s.outcomes.length;
  if (sig === s.lastObsSig && !yielded) s.noProgress++;
  else {
    s.noProgress = 0;
    s.lastObsSig = sig;
  }
  return s.noProgress >= NO_PROGRESS_LIMIT;
}

export type PlanAttempt = {
  plan: PlanChunk;
  visionPlanned: boolean;
  early?: EarlyDispatcher;
  reuse: ReturnType<typeof tryReuseSkill>;
  nextObserveReq: () => { scope?: "full" | "forms" | "links" | "tables" | "subtree"; subtreeRef?: string };
  onStepRecorded: (outcome: StepOutcome, step: Step) => void;
};

export async function planTurn(
  s: TurnState,
  obs: Observation,
  obsArtifactId: string | undefined,
): Promise<PlanAttempt | PlanFailure> {
  const onStepRecorded = (outcome: StepOutcome, step: Step) => {
    s.outcomes.push(outcome);
    s.self.deps.onStepRecorded?.(s.runId, outcome, step, obsArtifactId);
    s.self.deps.events.emit(
      EventTypes.StepFinished,
      { runId: s.runId, stepId: outcome.stepId, op: outcome.op, status: outcome.status, durationMs: outcome.durationMs, error: outcome.error },
      s.runId,
    );
  };
  let early: EarlyDispatcher | undefined;
  const nextObserveReq = () => {
    const r = s.pendingObs ?? {};
    s.pendingObs = undefined;
    return r;
  };
  const canStream = typeof s.model.streamStructured === "function" && s.run.pageIds.length <= 1;
  const plannerCall = async (): Promise<PlanChunk> => {
    const prompt = buildPlannerPrompt({
      goal: s.run.goal,
      observations: [obs],
      recentOutcomes: s.outcomes,
      pageIds: s.run.pageIds,
      repairNote: s.lastError,
      context: s.run.config?.context,
      budget: { tokens: 3000 },
    });
    const args = { modelId: s.modelId, system: PLANNER_SYSTEM, prompt, schema: PlanChunkSchema, maxOutputTokens: 8192 };
    if (!canStream) return (await structuredCall<PlanChunk>(s, "planner", args)).object;
    const parser = new PlanStreamParser();
    const epoch = obs.documentEpoch;
    const dispatcher = new EarlyDispatcher(
      (steps, { first, last }) => {
        const live = s.self.deps.pages.get(s.activePageId!);
        const prepared = compileAndAuthorize({
          pageId: s.activePageId!,
          documentEpoch: live.documentEpoch ?? epoch,
          observedEpoch: epoch,
          steps,
          observation: obs.content,
          url: live.url ?? obs.content.url,
          grants: s.self.deps.grants,
        });
        if ("rejected" in prepared) return Promise.reject(new VectorError("conflict", prepared.rejected));
        if ("denied" in prepared) return Promise.reject(new VectorError("permission_denied", prepared.denied));
        const write = beginConsequentialWrite(s.self.durable, {
          runId: s.runId,
          pageId: s.activePageId!,
          documentEpoch: epoch,
          revision: obs.revision,
          steps: prepared.program.steps ?? [],
        });
        if (write.skip) return Promise.resolve({ status: "completed" as const, steps: [] });
        return s.self.deps.pages
          .execute(
            { ...prepared.program, ...(first ? { documentEpoch: epoch } : {}) },
            { runId: s.runId, signal: s.c.abort.signal, onStep: onStepRecorded },
            last ? { returnObservation: nextObserveReq() } : {},
          )
          .then((r) => {
            settleWrite(s.self.durable, write.intentId, r.status === "completed");
            return r;
          });
      },
      24,
    );
    early = dispatcher;
    const call = await structuredCall<PlanChunk>(s, "planner", args, {
      onText: (delta) => {
        for (const step of parser.push(delta)) {
          if (parser.status === "continue" && (parser.pageId === undefined || parser.pageId === s.activePageId)) dispatcher.offer(step);
          else dispatcher.halt();
        }
      },
      firstDispatchAt: () => dispatcher.firstDispatchAt,
    });
    return call.object;
  };

  const thinObs = obs.content.elements.length === 0 && obs.content.text.trim().length < 80;
  let visionPlanned = false;
  const claimedGrants = promptCannotGrant(`${obs.content.title}\n${obs.content.text}`, []);
  if (claimedGrants.length) {
    s.run.config = { ...(s.run.config ?? {}), ignoredPageGrants: claimedGrants };
  }
  const reuse = tryReuseSkill(s.self.skills, s.run.goal, obs.content, obs.content.url, obs.documentEpoch);
  try {
    let plan: PlanChunk;
    if ("skill" in reuse && !s.lastError && !s.visionPending && !thinObs) {
      plan = {
        status: "continue",
        message: `reusing skill ${reuse.skill.id}`,
        steps: reuse.skill.program.steps as PlanChunk["steps"],
      };
    } else if ((s.visionPending || thinObs) && !s.visionUsed) {
      s.visionUsed = true;
      s.visionPending = false;
      const visionId = s.self.deps.visionModel?.();
      if (visionId) {
        s.self.setStatus(s.runId, "planning", "Looking at the page…");
        const v = await s.self.tryVisionPlan({
          runId: s.runId,
          pageId: s.activePageId!,
          goal: s.run.goal,
          url: obs.content.url,
          lastError: s.lastError,
          outcomes: s.outcomes,
          model: s.model,
          modelId: visionId,
          signal: s.c.abort.signal,
          onModelCall: () => s.modelCalls++,
        });
        if (v) {
          plan = v;
          visionPlanned = true;
        } else {
          plan = await plannerCall();
        }
      } else {
        plan = await plannerCall();
      }
    } else {
      plan = await plannerCall();
    }
    return { plan, visionPlanned, early, reuse, nextObserveReq, onStepRecorded };
  } catch (error) {
    return { error, early };
  }
}

export function isPlanFailure(attempt: PlanAttempt | PlanFailure): attempt is PlanFailure {
  return "error" in attempt;
}

export type PlanFailure = { error: unknown; early?: EarlyDispatcher };

export async function handlePlannerFailure(
  s: TurnState,
  obs: Observation,
  early: EarlyDispatcher | undefined,
  e: unknown,
): Promise<"return" | "continue"> {
  if (early) {
    early.halt();
    const partial = await early.finish([]);
    if (partial.steps.length) s.stepsRun += partial.steps.length;
  }
  if (s.c.abort.signal.aborted) throw e;
  s.modelErrorCount++;
  if (s.modelErrorCount >= MODEL_ERROR_LIMIT) {
    const verdict = await tryFinalDecision(s, `model calls kept failing (${e instanceof Error ? e.message : String(e)})`, obs);
    if (verdict === "done") return "return";
    if (verdict === "input") {
      resetGuards(s);
      return "continue";
    }
    throw e;
  }
  if (s.modelErrorCount === 2 && !s.visionUsed) s.visionPending = true;
  s.lastError = `model call failed (${e instanceof Error ? e.message : String(e)}) — respond with a valid PlanChunk`;
  return "continue";
}

export async function settleDonePlan(
  s: TurnState,
  plan: PlanChunk,
  obs: Observation,
  visionPlanned: boolean,
): Promise<"return" | "continue"> {
  s.machine = reduce(s.machine, { type: "plan", status: "done" });
  if (s.lastActionFailed && !s.doneChallenged && !visionPlanned) {
    s.doneChallenged = true;
    s.lastError = `the last action failed (${s.lastError ?? "see outcomes"}) and you returned done without trying an alternative — if another mechanism could reach the goal (press Enter, navigate to a URL you can construct, a different selector), run it now; only return done again if every alternative is exhausted`;
    return "continue";
  }
  let verifyObs = obs;
  try {
    verifyObs = await s.self.deps.pages.observe(s.activePageId!, { sinceRevision: obs.revision, format: "full" });
  } catch {
    verifyObs = obs;
  }
  const verified = verifyDoneAgainstObservation(plan.result, verifyObs, s.outcomes);
  s.machine = reduce(s.machine, { type: "verified", ok: verified.ok });
  if (!verified.ok && !s.doneChallenged) {
    s.doneChallenged = true;
    s.lastError = `done was not verified against a fresh observation (${verified.reason}) — re-observe and only return done with values that appear on the page`;
    return "continue";
  }
  if (!verified.ok) {
    s.self.finish(s.runId, "failed", plan.result, `done not verified: ${verified.reason}`, "Done was not grounded in the page");
    return "return";
  }
  s.self.finish(s.runId, "completed", plan.result, undefined, plan.message || "Done");
  return "return";
}

export async function dispatchPlan(
  s: TurnState,
  obs: Observation,
  attempt: PlanAttempt,
): Promise<"return" | "continue"> {
  const { plan, early, reuse, nextObserveReq, onStepRecorded } = attempt;
  let repeatNudge: string | undefined;
  if (plan.steps!.every((step) => OBSERVATION_BLIND_OPS.has(step.op))) {
    s.lastPlanSig = "";
  } else {
    const planSig = plan.steps!.map((step) => step.op).join("|");
    if (planSig === s.lastPlanSig) {
      s.repeatCount++;
      if (s.repeatCount >= PLAN_REPEAT_LIMIT) {
        if (early) await early.finish([]);
        const verdict = await tryFinalDecision(s, "planner repeated the same steps without finishing", obs);
        if (verdict === "done") return "return";
        if (verdict === "input") {
          resetGuards(s);
          return "continue";
        }
        throw new VectorError("step_failed", "planner repeated the same steps without finishing");
      }
      if (s.lastActionFailed) {
        s.lastError = `You already ran this exact step sequence and it did not complete the goal. If the goal is met return status="done" with the result; if blocked, ask for input or request a different observation scope — do NOT repeat the same actions.`;
        repeatNudge = s.lastError;
      }
    } else {
      s.repeatCount = 0;
      s.lastPlanSig = planSig;
    }
  }

  s.machine = reduce(s.machine, { type: "plan", status: "continue" });
  const compiled = compileAndAuthorize({
    pageId: s.activePageId!,
    documentEpoch: obs.documentEpoch,
    steps: plan.steps ?? [],
    observation: obs.content,
    url: obs.content.url,
    guards: "skill" in reuse ? reuse.skill.preconditions : undefined,
    grants: s.self.deps.grants,
  });
  if ("rejected" in compiled) {
    s.machine = reduce(s.machine, { type: "authorized", ok: false });
    if (early) await early.finish([]);
    s.lastError = compiled.rejected;
    s.lastActionFailed = true;
    if (!noteRepair(s.repairState, compiled.rejected).allowed) {
      giveUpRepair(s, s.lastError);
      return "return";
    }
    return "continue";
  }
  if ("denied" in compiled) {
    s.machine = reduce(s.machine, { type: "authorized", ok: false });
    if (early) await early.finish([]);
    s.lastError = compiled.denied;
    s.lastActionFailed = true;
    if (!noteRepair(s.repairState, compiled.denied).allowed) {
      giveUpRepair(s, s.lastError);
      return "return";
    }
    return "continue";
  }
  s.machine = reduce(s.machine, { type: "authorized", ok: true });
  const write = beginConsequentialWrite(s.self.durable, {
    runId: s.runId,
    pageId: s.activePageId!,
    documentEpoch: obs.documentEpoch,
    revision: obs.revision,
    steps: compiled.program.steps ?? [],
  });
  const streamed = early && early.dispatchedCount > 0;
  const result = write.skip
    ? { status: "completed" as const, steps: [] }
    : streamed
      ? await early!.finish(plan.steps ?? [])
      : await s.self.deps.pages.execute(compiled.program, { runId: s.runId, signal: s.c.abort.signal, onStep: onStepRecorded }, { returnObservation: nextObserveReq() });
  if (early && !streamed) early.halt();
  settleWrite(s.self.durable, write.intentId, result.status === "completed");
  const carried = early ? early.observation : (result as { observation?: Observation }).observation;
  if (carried && carried.pageId === s.activePageId) s.carriedObs = carried;
  s.stepsRun += plan.steps!.length;
  s.lastError = repeatNudge;
  s.lastActionFailed = false;
  s.self.unresolvedByRun.set(
    s.runId,
    s.outcomes
      .filter(
        (o) =>
          o.receipt?.uncertain === true ||
          o.receipt?.dispatchedBeforeTakeover === true ||
          o.effect === "uncertain" ||
          o.effect === "dispatched",
      )
      .map((o) => o.stepId),
  );
  s.self.persistCheckpoint(s.self.get(s.runId));
  if ("skill" in reuse && result.status !== "failed" && result.status !== "cancelled") {
    const after = s.carriedObs ?? (await s.self.deps.pages.observe(s.activePageId!, {}));
    if (!verifySkillPostconditions(reuse.skill, after.content, after.content.url, after.documentEpoch)) {
      markSkillFailed(reuse.skill);
      s.lastError = `skill ${reuse.skill.id} postconditions failed`;
      s.lastActionFailed = true;
    }
  }
  if (result.status !== "failed" && result.status !== "cancelled" && plan.steps?.length && !("skill" in reuse)) {
    try {
      const origin = new URL(obs.content.url).origin;
      const named = obs.content.elements
        .filter((e) => e.role && e.name)
        .slice(0, 2)
        .map((e) => ({ role: e.role, nameIncludes: (e.name ?? "").slice(0, 40) }));
      const writes = plan.steps.some((step) =>
        ["click", "fill", "type", "press", "select", "check", "uncheck", "navigate", "submit"].includes(step.op),
      );
      if (s.self.skills.length < 32 && named.length > 0 && !writes) {
        s.self.skills.push(
          compileSkill({
            id: `${s.runId}:${s.self.skills.length}`,
            goalPattern: s.run.goal.slice(0, 64),
            pageId: s.activePageId!,
            steps: plan.steps,
            preconditions: [{ exactOrigin: origin }, ...named],
            postconditions: [{ exactOrigin: origin }],
            evidence: `compiled from a successful read-only chunk on ${origin}`,
          }),
        );
      }
    } catch {
      /* invalid page URL — skip skill compile */
    }
  }
  if (result.status === "cancelled") return "return";
  if (result.status !== "failed") s.repairState = emptyRepairState();
  if (result.status !== "failed") return "continue";
  return recoverFailedChunk(s, result.error);
}

async function recoverFailedChunk(s: TurnState, error: string | undefined): Promise<"return" | "continue"> {
  s.lastError = error;
  s.lastActionFailed = true;
  const decision = noteRepair(s.repairState, error);
  if (!s.visionUsed) s.visionPending = true;
  if (!decision.allowed) {
    giveUpRepair(s, s.lastError);
    return "return";
  }
  const recoveryModelId = s.self.deps.recoveryModel();
  if (decision.recover && recoveryModelId && recoveryModelId !== s.modelId) {
    const fresh = await s.self.deps.pages.observe(s.activePageId!, {});
    const repair = await structuredCall<RepairChunk>(s, "repair", {
      modelId: recoveryModelId,
      system: `${PLANNER_SYSTEM}\n\nYou are the recovery model. A chunk failed: ${s.lastError}. Produce a corrected bounded chunk.`,
      prompt: buildPlannerPrompt({
        goal: s.run.goal,
        observations: [fresh],
        recentOutcomes: s.outcomes,
        pageIds: s.run.pageIds,
        repairNote: s.lastError,
        context: s.run.config?.context,
        budget: { tokens: 3000 },
      }),
      schema: RepairChunkSchema,
      maxOutputTokens: 8192,
    });
    if (repair.object.steps.length) {
      const compiled = compileAndAuthorize({
        pageId: s.activePageId!,
        documentEpoch: fresh.documentEpoch,
        observedEpoch: fresh.documentEpoch,
        steps: repair.object.steps,
        observation: fresh.content,
        url: fresh.content.url,
        grants: s.self.deps.grants,
      });
      if (!("rejected" in compiled) && !("denied" in compiled)) {
        const write = beginConsequentialWrite(s.self.durable, {
          runId: s.runId,
          pageId: s.activePageId!,
          documentEpoch: fresh.documentEpoch,
          revision: fresh.revision,
          steps: compiled.program.steps ?? [],
        });
        if (!write.skip) {
          const r2 = await s.self.deps.pages.execute(compiled.program, { runId: s.runId, signal: s.c.abort.signal });
          settleWrite(s.self.durable, write.intentId, r2.status === "completed");
          s.stepsRun += compiled.program.steps?.length ?? repair.object.steps.length;
          if (r2.status === "completed") {
            s.lastError = undefined;
            s.repairState = emptyRepairState();
          }
        }
      }
    }
  }
  return "continue";
}
