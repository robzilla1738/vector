import {
  EventTypes,
  FinalDecisionSchema,
  newRunId,
  PlanChunkSchema,
  RepairChunkSchema,
  VectorError,
  type Observation,
  type PlanChunk,
  type Run,
  type Step,
  type StepOutcome,
} from "@vector/contracts";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";
import type { PageService } from "../services/pages.js";
import type { ModelClient } from "./model-client.js";
import { buildFinalAnswerPrompt, buildPlannerPrompt, buildVisionPrompt, extractJson, FINAL_ANSWER_SYSTEM, PLANNER_SYSTEM, VISION_SYSTEM } from "./planner.js";

interface RunControl {
  abort: AbortController;
  paused: boolean;
  answerWaiter?: { resolve: (answer: string) => void };
  span?: { spanId: string; end(outcome?: "ok" | "failed" | "cancelled", attrs?: Record<string, unknown>): void };
}

export interface CoordinatorDeps {
  repo: Repo;
  events: EventBus;
  pages: PageService;
  model: () => ModelClient | null;
  defaultModel: () => string;
  recoveryModel: () => string | undefined;
  /** Optional dedicated vision model; falls back to the planner model. */
  visionModel?: () => string | undefined;
  recordModelCall: (c: {
    runId: string;
    role: "planner" | "repair" | "vision" | "probe" | "final";
    modelId: string;
    durationMs: number;
    inputTokens?: number;
    outputTokens?: number;
    providerMetadata?: Record<string, unknown>;
    error?: string;
  }) => void;
  onStepRecorded?: (runId: string, outcome: StepOutcome, step: Step, obsArtifactId?: string) => void;
  /** Persist a planning observation; returns an artifact id for step records. */
  saveObservation?: (runId: string, obs: Observation) => string | undefined;
  /** structured spans + counters (§6) */
  tracer?: {
    start(
      name: string,
      ctx?: { runId?: string; pageId?: string; attrs?: Record<string, unknown> },
    ): { spanId: string; end(outcome?: "ok" | "failed" | "cancelled", attrs?: Record<string, unknown>): void };
    incr(name: string, by?: number): void;
  };
}

const DEFAULT_MAX_STEPS = 60;
const DEFAULT_MAX_MODEL_CALLS = 40;
const MAX_REPAIRS = 3;
const NO_PROGRESS_LIMIT = 3;
const PLAN_REPEAT_LIMIT = 3;
const MODEL_ERROR_LIMIT = 3;

/** Merge the run's extracted data for a partial-completion result — latest
 * value per key wins; huge page-text dumps are dropped so the result stays
 * readable in chat. */
function harvestResults(outcomes: StepOutcome[]): Record<string, unknown> | undefined {
  const merged: Record<string, unknown> = {};
  for (const o of outcomes) {
    if (o.status !== "ok" || !o.extracted) continue;
    for (const [k, v] of Object.entries(o.extracted)) {
      const s = typeof v === "string" ? v : JSON.stringify(v);
      if (s.length > 800) continue;
      merged[k] = v;
    }
  }
  return Object.keys(merged).length ? merged : undefined;
}
/** Ops whose effect the observer can't see — JS state, downloads, screenshots. */
const OBSERVATION_BLIND_OPS = new Set(["evaluate", "extract", "collectScroll", "expectDownload", "screenshot"]);

/**
 * The built-in agent: goal -> observe -> plan chunk -> execute locally ->
 * verify -> repair/escalate -> done. One page at a time per chunk; the
 * scheduler runs independent member runs in parallel instead.
 */
export class RunCoordinator {
  private controls = new Map<string, RunControl>();
  private answers = new Map<string, string>();

  constructor(private deps: CoordinatorDeps) {}

  list(limit = 50): Run[] {
    return this.deps.repo.listRuns(limit);
  }

  get(runId: string): Run {
    const run = this.deps.repo.getRun(runId);
    if (!run) throw new VectorError("not_found", `no run ${runId}`);
    return run;
  }

  async start(opts: {
    goal: string;
    pageIds: string[];
    setId?: string;
    modelId?: string;
    maxSteps?: number;
    maxModelCalls?: number;
    deadlineMs?: number;
    context?: string;
    chatId?: string;
  }): Promise<Run> {
    const run: Run = {
      runId: newRunId(),
      goal: opts.goal,
      status: "queued",
      pageIds: opts.pageIds,
      setId: opts.setId,
      config: {
        modelId: opts.modelId,
        maxSteps: opts.maxSteps ?? DEFAULT_MAX_STEPS,
        maxModelCalls: opts.maxModelCalls ?? DEFAULT_MAX_MODEL_CALLS,
        deadlineMs: opts.deadlineMs,
        context: opts.context,
        chatId: opts.chatId,
        implementation: opts.modelId ? `agent:${opts.modelId}` : "agent",
      },
      createdAt: Date.now(),
    };
    this.deps.repo.saveRun(run);
    this.deps.events.emit(EventTypes.RunUpdated, { run }, run.runId);
    const control: RunControl = {
      abort: new AbortController(),
      paused: false,
      span: this.deps.tracer?.start("run", {
        runId: run.runId,
        attrs: { goal: opts.goal.slice(0, 120), pages: opts.pageIds.length, modelId: opts.modelId },
      }),
    };
    this.deps.tracer?.incr("run.started");
    this.controls.set(run.runId, control);
    void this.loop(run.runId).catch((e) => {
      this.finish(run.runId, "failed", undefined, e instanceof Error ? e.message : String(e), e instanceof Error ? e.message : String(e));
    });
    return run;
  }

  pause(runId: string): Run {
    const c = this.controls.get(runId);
    const run = this.get(runId);
    if (c && (run.status === "running" || run.status === "planning")) {
      c.paused = true;
      this.setStatus(runId, "paused", "Paused");
    }
    return this.get(runId);
  }

  resume(runId: string): Run {
    const c = this.controls.get(runId);
    const run = this.get(runId);
    if (c && run.status === "paused") {
      c.paused = false;
      this.setStatus(runId, "running", "Resumed");
    } else if (run.status === "needs_input") {
      // resume requires runs.answer — pause-resume alone does not unblock it
      this.setStatus(runId, "needs_input", run.statusMessage);
    }
    return this.get(runId);
  }

  cancel(runId: string): Run {
    const c = this.controls.get(runId);
    if (c) {
      c.abort.abort();
      // resolve any pending needs_input wait so the loop can exit
      c.answerWaiter?.resolve("");
    }
    const run = this.get(runId);
    if (!["completed", "partially_completed", "failed", "cancelled", "interrupted"].includes(run.status)) {
      this.finish(runId, "cancelled", undefined, "Cancelled by user");
    }
    return this.get(runId);
  }

  answer(runId: string, answer: string): Run {
    const c = this.controls.get(runId);
    this.answers.set(runId, answer);
    c?.answerWaiter?.resolve(answer);
    const run = this.get(runId);
    if (run.status === "needs_input") this.setStatus(runId, "running", `Answer received`);
    return this.get(runId);
  }

  private setStatus(runId: string, status: Run["status"], message?: string) {
    const run = this.get(runId);
    run.status = status;
    if (message !== undefined) run.statusMessage = message;
    this.deps.repo.saveRun(run);
    this.deps.events.emit(EventTypes.RunStatus, { runId, status, message }, runId);
    this.deps.events.emit(EventTypes.RunUpdated, { run }, runId);
  }

  private finish(runId: string, status: Run["status"], result?: Record<string, unknown>, error?: string, message?: string) {
    const run = this.get(runId);
    run.status = status;
    run.result = result;
    run.error = error;
    run.endedAt = Date.now();
    if (message !== undefined) run.statusMessage = message;
    // stamp the call count so cards can badge "0-model" without a fetch
    run.config = { ...(run.config ?? {}), modelCalls: this.deps.repo.listModelCalls(runId).length };
    this.deps.repo.saveRun(run);
    this.deps.events.emit(EventTypes.RunStatus, { runId, status, error }, runId);
    this.deps.events.emit(EventTypes.RunUpdated, { run }, runId);
    const span = this.controls.get(runId)?.span;
    if (span) {
      span.end(
        status === "completed" ? "ok" : status === "cancelled" || status === "interrupted" ? "cancelled" : "failed",
        { status, durationMs: run.startedAt ? Date.now() - run.startedAt : undefined, error },
      );
      this.controls.get(runId)!.span = undefined;
    }
    this.deps.tracer?.incr(`run.${status}`);
  }

  private async waitIfPaused(c: RunControl, runId: string) {
    while (c.paused && !c.abort.signal.aborted) {
      await new Promise((r) => setTimeout(r, 120));
    }
    if (c.abort.signal.aborted) throw new VectorError("cancelled", "run cancelled");
  }

  private async waitForAnswer(c: RunControl, runId: string): Promise<string> {
    const existing = this.answers.get(runId);
    if (existing !== undefined) {
      this.answers.delete(runId);
      return existing;
    }
    return new Promise<string>((resolve) => {
      c.answerWaiter = { resolve };
    });
  }

  private async loop(runId: string) {
    const run = this.get(runId);
    const c = this.controls.get(runId)!;
    const model = this.deps.model();
    if (!model) {
      this.finish(runId, "failed", undefined, "No model configured — set a Gateway API key in Settings");
      return;
    }
    const modelId = run.config?.modelId ?? this.deps.defaultModel();
    const maxSteps = run.config?.maxSteps ?? DEFAULT_MAX_STEPS;
    const maxModelCalls = run.config?.maxModelCalls ?? DEFAULT_MAX_MODEL_CALLS;
    const deadline = run.config?.deadlineMs ? Date.now() + run.config.deadlineMs : undefined;

    this.setStatus(runId, "planning", "Planning");
    const startedAt = Date.now();
    this.deps.repo.saveRun({ ...this.get(runId), startedAt });
    run.startedAt = startedAt;

    const outcomes: StepOutcome[] = [];
    let modelCalls = 0;
    let stepsRun = 0;
    let repairCount = 0;
    let lastObsSig = "";
    let noProgress = 0;
    let outcomeCursor = 0;
    let activePageId = run.pageIds[0];
    let lastError: string | undefined;
    let lastPlanSig = "";
    let repeatCount = 0;
    let modelErrorCount = 0;
    let visionPending = false;
    let visionUsed = false;
    let lastActionFailed = false;
    let doneChallenged = false;
    let pendingObs: { scope?: "full" | "forms" | "links" | "tables" | "subtree"; subtreeRef?: string } | undefined;

    /**
     * A guard stopped the action loop — give the model one last, action-free
     * call to report what it concluded or ask a human. "done" finishes the
     * run with the best supported answer; "input" hands back to the loop with
     * guards reset after the human replies; "gave_up" means the caller
     * surfaces its original error.
     */
    const tryFinalDecision = async (reason: string, obs: Observation): Promise<"done" | "input" | "gave_up"> => {
      try {
        const call = await model.generateStructured({
          modelId,
          system: FINAL_ANSWER_SYSTEM,
          prompt: buildFinalAnswerPrompt({
            goal: run.goal,
            observation: obs,
            recentOutcomes: outcomes,
            reason,
            context: run.config?.context,
          }),
          schema: FinalDecisionSchema,
          signal: c.abort.signal,
          maxOutputTokens: 4096,
        });
        modelCalls++;
        this.deps.recordModelCall({
          runId,
          role: "final",
          modelId,
          durationMs: call.durationMs,
          inputTokens: call.inputTokens,
          outputTokens: call.outputTokens,
          providerMetadata: call.providerMetadata,
        });
        const d = call.object;
        if (d.status === "needs_input" && d.question) {
          this.setStatus(runId, "needs_input", d.question);
          const answer = await this.waitForAnswer(c, runId);
          if (c.abort.signal.aborted) return "gave_up";
          outcomes.push({
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
        const result = d.result && Object.keys(d.result).length ? d.result : harvestResults(outcomes);
        this.finish(runId, "completed", result, undefined, d.message || "Done");
        return "done";
      } catch {
        return "gave_up";
      }
    };
    const resetGuards = () => {
      noProgress = 0;
      repeatCount = 0;
      modelErrorCount = 0;
      repairCount = 0;
      lastPlanSig = "";
      lastError = undefined;
      lastActionFailed = false;
      doneChallenged = false;
    };

    try {
      while (true) {
        await this.waitIfPaused(c, runId);
        if (deadline && Date.now() > deadline) throw new VectorError("condition_timeout", "run deadline exceeded");
        if (modelCalls >= maxModelCalls) throw new VectorError("step_failed", "model call budget exhausted");
        if (stepsRun >= maxSteps) throw new VectorError("step_failed", "step budget exhausted");
        if (!activePageId) throw new VectorError("invalid_params", "run has no target page");

        // fresh observation — the current state of the world; persisted so
        // the timeline can scrub back to what the planner actually saw.
        // A pending observationRequest (from the last plan) is honored here:
        // the planner may ask for a subtree expansion or a different scope.
        const obsReq = pendingObs ?? {};
        pendingObs = undefined;
        let obs: Observation;
        try {
          obs = await this.deps.pages.observe(activePageId, obsReq);
        } catch (e) {
          // The tab closed/crashed out from under the run — retarget to
          // another live page in scope instead of dying on the dead one.
          if (e instanceof VectorError && e.code === "target_detached") {
            const next = run.pageIds.find((p) => {
              if (p === activePageId || !this.deps.pages.livePageIds().includes(p)) return false;
              const vs = this.deps.pages.get(p).viewStatus;
              return vs !== "detached" && vs !== "crashed";
            });
            if (!next) throw e;
            activePageId = next;
            this.setStatus(runId, "planning", `Page detached — moved to ${next}`);
            obs = await this.deps.pages.observe(next, obsReq);
          } else {
            throw e;
          }
        }
        const obsArtifactId = this.deps.saveObservation?.(runId, obs);
        this.assertTargetAlive(obs);

        const sig = `${obs.content.url}#${obs.content.elements.length}#${obs.content.text.length}#${obs.content.text.slice(0, 200)}`;
        // information-gathering or observation-invisible steps that succeeded
        // are progress even when the DOM signature doesn't move
        const yielded = outcomes
          .slice(outcomeCursor)
          .some((o) => o.status === "ok" && (o.extracted !== undefined || OBSERVATION_BLIND_OPS.has(o.op)));
        outcomeCursor = outcomes.length;
        if (sig === lastObsSig && !yielded) {
          noProgress++;
        } else {
          noProgress = 0;
          lastObsSig = sig;
        }
        if (noProgress >= NO_PROGRESS_LIMIT) {
          const verdict = await tryFinalDecision("page state stopped changing", obs);
          if (verdict === "done") return;
          if (verdict === "input") {
            resetGuards();
            continue;
          }
          throw new VectorError("step_failed", "no progress — same page state repeatedly");
        }

        this.setStatus(runId, "planning", "Thinking…");
        const plannerCall = async (): Promise<PlanChunk> => {
          const prompt = buildPlannerPrompt({
            goal: run.goal,
            observations: [obs],
            recentOutcomes: outcomes,
            pageIds: run.pageIds,
            repairNote: lastError,
            context: run.config?.context,
          });
          const call = await model.generateStructured({
            modelId,
            system: PLANNER_SYSTEM,
            prompt,
            schema: PlanChunkSchema,
            signal: c.abort.signal,
            maxOutputTokens: 8192,
          });
          modelCalls++;
          this.deps.recordModelCall({
            runId,
            role: "planner",
            modelId,
            durationMs: call.durationMs,
            inputTokens: call.inputTokens,
            outputTokens: call.outputTokens,
            providerMetadata: call.providerMetadata,
          });
          return call.object;
        };
        // Vision fallback: a failed chunk (or a page whose structured
        // observation is too thin to act on) re-plans once from a screenshot.
        const thinObs = obs.content.elements.length === 0 && obs.content.text.trim().length < 80;
        let plan: PlanChunk;
        let visionPlanned = false;
        try {
          if ((visionPending || thinObs) && !visionUsed) {
            visionUsed = true;
            visionPending = false;
            this.setStatus(runId, "planning", "Looking at the page…");
            const v = await this.tryVisionPlan({
              runId,
              pageId: activePageId,
              goal: run.goal,
              url: obs.content.url,
              lastError,
              outcomes,
              model,
              modelId: this.deps.visionModel?.() ?? modelId,
              signal: c.abort.signal,
              onModelCall: () => modelCalls++,
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
        } catch (e) {
          // A malformed/truncated model response is transient — re-observe and
          // try again rather than ending the run on a single bad completion.
          if (c.abort.signal.aborted) throw e;
          modelErrorCount++;
          if (modelErrorCount >= MODEL_ERROR_LIMIT) {
            const verdict = await tryFinalDecision(`model calls kept failing (${e instanceof Error ? e.message : String(e)})`, obs);
            if (verdict === "done") return;
            if (verdict === "input") {
              resetGuards();
              continue;
            }
            throw e;
          }
          if (modelErrorCount === 2 && !visionUsed) visionPending = true;
          lastError = `model call failed (${e instanceof Error ? e.message : String(e)}) — respond with a valid PlanChunk`;
          continue;
        }

        if (plan.status === "done") {
          // Done declared immediately after a failed action chunk — nothing
          // has been attempted since the failure, so the model may be
          // answering with a link/summary instead of trying the alternative
          // mechanism. Challenge once; a second done is accepted as final.
          if (lastActionFailed && !doneChallenged && !visionPlanned) {
            doneChallenged = true;
            lastError = `the last action failed (${lastError ?? "see outcomes"}) and you returned done without trying an alternative — if another mechanism could reach the goal (press Enter, navigate to a URL you can construct, a different selector), run it now; only return done again if every alternative is exhausted`;
            continue;
          }
          this.finish(runId, "completed", plan.result, undefined, plan.message || "Done");
          return;
        }
        if (plan.status === "needs_input") {
          this.setStatus(runId, "needs_input", plan.question ?? "Needs input");
          const answer = await this.waitForAnswer(c, runId);
          if (c.abort.signal.aborted) return;
          outcomes.push({
            stepId: `input-${Date.now()}`,
            op: "human_input",
            status: "ok",
            startedAt: Date.now(),
            durationMs: 0,
            detail: `human answered: ${answer.slice(0, 120)}`,
          });
          continue;
        }
        const retargeted = !!(plan.pageId && plan.pageId !== activePageId && run.pageIds.includes(plan.pageId));
        if (retargeted) activePageId = plan.pageId!;
        // a requested scope alongside steps applies to the next observation
        if (plan.observationRequest) {
          pendingObs = {
            scope: plan.observationRequest.scope,
            subtreeRef: plan.observationRequest.subtreeRef,
          };
        }
        this.setStatus(runId, "running", plan.message);

        if (!plan.steps?.length) {
          // "look at that page/scope" is a valid step-free plan — the loop
          // re-observes the new target at the top. A bare empty continue is a
          // model slip: nudge it rather than killing the run outright.
          if (plan.observationRequest || retargeted) {
            modelErrorCount = 0;
            continue;
          }
          modelErrorCount++;
          if (modelErrorCount >= MODEL_ERROR_LIMIT) {
            const verdict = await tryFinalDecision("planner returned empty continue plans repeatedly", obs);
            if (verdict === "done") return;
            if (verdict === "input") {
              resetGuards();
              continue;
            }
            throw new VectorError("model_output_invalid", "continue without steps or observation request");
          }
          if (modelErrorCount === 2 && !visionUsed) visionPending = true;
          lastError = `you returned continue with no steps — provide steps, an observationRequest, or a pageId from PAGES to switch to`;
          continue;
        }
        modelErrorCount = 0;

        // Convergence guard: the same effectful op-sequence planned
        // consecutively means the planner isn't learning from its own
        // outcomes (params and refs churn between rounds, so the signature is
        // op-only). Plans made only of observation-blind ops are exempt —
        // repeated reads/computes are cheap and often legitimate polling.
        // Nudge via repairNote without re-executing; hard-stop at the limit.
        if (plan.steps.every((s) => OBSERVATION_BLIND_OPS.has(s.op))) {
          lastPlanSig = "";
        } else {
          const planSig = plan.steps.map((s) => s.op).join("|");
          if (planSig === lastPlanSig) {
            repeatCount++;
            if (repeatCount >= PLAN_REPEAT_LIMIT) {
              const verdict = await tryFinalDecision("planner repeated the same steps without finishing", obs);
              if (verdict === "done") return;
              if (verdict === "input") {
                resetGuards();
                continue;
              }
              throw new VectorError("step_failed", "planner repeated the same steps without finishing");
            }
            lastError = `You already ran this exact step sequence and it did not complete the goal. If the goal is met return status="done" with the result; if blocked, ask for input or request a different observation scope — do NOT repeat the same actions.`;
            continue;
          }
          repeatCount = 0;
          lastPlanSig = planSig;
        }

        const program = { pageId: activePageId, documentEpoch: obs.documentEpoch, steps: plan.steps };
        const result = await this.deps.pages.execute(program, {
          runId,
          signal: c.abort.signal,
          onStep: (outcome, step) => {
            outcomes.push(outcome);
            this.deps.onStepRecorded?.(runId, outcome, step, obsArtifactId);
            this.deps.events.emit(
              EventTypes.StepFinished,
              { runId, stepId: outcome.stepId, op: outcome.op, status: outcome.status, durationMs: outcome.durationMs, error: outcome.error },
              runId,
            );
          },
        });
        stepsRun += plan.steps.length;
        lastError = undefined;
        lastActionFailed = false;
        repairCount = 0;

        if (result.status === "cancelled") return;
        if (result.status === "failed") {
          lastError = result.error;
          lastActionFailed = true;
          // recovery ladder: re-observe happens naturally at loop top;
          // vision fallback, then recovery model, then give up.
          repairCount++;
          if (!visionUsed) visionPending = true;
          if (repairCount > MAX_REPAIRS) {
            const partial = outcomes.some((o) => o.status === "ok" && (o.extracted !== undefined || o.detail !== undefined));
            this.finish(
              runId,
              partial ? "partially_completed" : "failed",
              partial ? harvestResults(outcomes) : undefined,
              lastError,
              partial ? "Couldn't fully finish — here's what I found" : undefined,
            );
            return;
          }
          const recoveryModelId = this.deps.recoveryModel();
          if (repairCount === MAX_REPAIRS && recoveryModelId && recoveryModelId !== modelId) {
            // one stronger-model repair attempt before surrendering
            const fresh = await this.deps.pages.observe(activePageId, {});
            const repair = await model.generateStructured({
              modelId: recoveryModelId,
              system: `${PLANNER_SYSTEM}\n\nYou are the recovery model. A chunk failed: ${lastError}. Produce a corrected bounded chunk.`,
              prompt: buildPlannerPrompt({ goal: run.goal, observations: [fresh], recentOutcomes: outcomes, pageIds: run.pageIds, repairNote: lastError, context: run.config?.context }),
              schema: RepairChunkSchema,
              signal: c.abort.signal,
              maxOutputTokens: 8192,
            });
            modelCalls++;
            this.deps.recordModelCall({ runId, role: "repair", modelId: recoveryModelId, durationMs: repair.durationMs, inputTokens: repair.inputTokens, outputTokens: repair.outputTokens });
            if (repair.object.steps.length) {
              const r2 = await this.deps.pages.execute({ pageId: activePageId, steps: repair.object.steps }, { runId, signal: c.abort.signal });
              stepsRun += repair.object.steps.length;
              if (r2.status === "completed") {
                lastError = undefined;
                repairCount = 0;
              }
            }
          }
          continue;
        }
      }
    } catch (e) {
      if (e instanceof VectorError && e.code === "cancelled") return;
      if (c.abort.signal.aborted) return;
      const partial = outcomes.some((o) => o.status === "ok" && (o.extracted !== undefined || o.detail !== undefined));
      this.finish(
        runId,
        partial ? "partially_completed" : "failed",
        partial ? harvestResults(outcomes) : undefined,
        e instanceof Error ? e.message : String(e),
        partial ? "Couldn't fully finish — here's what I found" : undefined,
      );
    } finally {
      this.controls.delete(runId);
    }
  }

  /**
   * One screenshot-grounded replan. Returns a validated PlanChunk or null —
   * any failure (capture, model, parse) falls back to the text planner.
   */
  private async tryVisionPlan(args: {
    runId: string;
    pageId: string;
    goal: string;
    url: string;
    lastError?: string;
    outcomes: StepOutcome[];
    model: ModelClient;
    modelId: string;
    signal: AbortSignal;
    onModelCall?: () => void;
  }): Promise<PlanChunk | null> {
    const started = Date.now();
    try {
      const shot = await this.deps.pages.capture(args.pageId, { format: "dataUrl" });
      if (!shot.dataUrl) return null;
      const res = await args.model.generateText({
        modelId: args.modelId,
        system: VISION_SYSTEM,
        prompt: buildVisionPrompt({ goal: args.goal, url: args.url, lastError: args.lastError, recentOutcomes: args.outcomes }),
        imageDataUrl: shot.dataUrl,
        signal: args.signal,
        maxOutputTokens: 8192,
      });
      args.onModelCall?.();
      this.deps.recordModelCall({
        runId: args.runId,
        role: "vision",
        modelId: args.modelId,
        durationMs: res.durationMs,
        inputTokens: res.inputTokens,
        outputTokens: res.outputTokens,
      });
      const parsed = PlanChunkSchema.safeParse(extractJson(res.text));
      return parsed.success ? parsed.data : null;
    } catch (e) {
      if (args.signal.aborted) throw e;
      this.deps.recordModelCall({
        runId: args.runId,
        role: "vision",
        modelId: args.modelId,
        durationMs: Date.now() - started,
        error: e instanceof Error ? e.message : String(e),
      });
      return null;
    }
  }

  private assertTargetAlive(obs: Observation) {
    if (!obs) throw new VectorError("target_detached", "observation empty");
  }

  /** On shutdown: mark active runs interrupted — never replay on restart. */
  markInterrupted() {
    for (const run of this.deps.repo.listRuns(200)) {
      if (["queued", "planning", "running", "paused", "needs_input"].includes(run.status)) {
        run.status = "interrupted";
        run.endedAt = Date.now();
        this.deps.repo.saveRun(run);
      }
    }
  }
}
