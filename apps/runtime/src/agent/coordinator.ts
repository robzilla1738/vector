import {
  EventTypes,
  newRunId,
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
import { recoverAfterCrash } from "./recovery.js";
import type { GrantSource } from "./permissions.js";
import { DurableWriteLedger } from "./durable.js";
import { initialMachine, reduce } from "./machine.js";
import type { CompiledSkill } from "./skills.js";
import {
  DEFAULT_MAX_MODEL_CALLS,
  DEFAULT_MAX_STEPS,
  TERMINAL_STATUSES,
  runCoordinatorLoop,
  tryVisionPlan,
  verifyDoneAgainstObservation,
} from "./coordinator-loop.js";

export { verifyDoneAgainstObservation } from "./coordinator-loop.js";

export interface RunControl {
  abort: AbortController;
  paused: boolean;
  deadlineHit?: boolean;
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
  saveObservation?: (runId: string, obs: Observation) => string | undefined;
  tracer?: {
    start(
      name: string,
      ctx?: { runId?: string; pageId?: string; attrs?: Record<string, unknown> },
    ): { spanId: string; end(outcome?: "ok" | "failed" | "cancelled", attrs?: Record<string, unknown>): void };
    incr(name: string, by?: number): void;
  };
  grants?: GrantSource;
  durableWrites?: DurableWriteLedger;
}

/** Thin machine apply: start/control + `reduce` via `runCoordinatorLoop`. */
export class RunCoordinator {
  controls = new Map<string, RunControl>();
  answers = new Map<string, string>();
  skills: CompiledSkill[] = [];
  unresolvedByRun = new Map<string, string[]>();
  durable: DurableWriteLedger;
  deps: CoordinatorDeps;

  constructor(deps: CoordinatorDeps) {
    this.deps = deps;
    this.durable = deps.durableWrites ?? new DurableWriteLedger();
  }

  seedSkills(skills: CompiledSkill[]) {
    this.skills = [...skills];
  }

  compiledSkills(): readonly CompiledSkill[] {
    return this.skills;
  }

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
    this.controls.set(run.runId, {
      abort: new AbortController(),
      paused: false,
      span: this.deps.tracer?.start("run", {
        runId: run.runId,
        attrs: { goal: opts.goal.slice(0, 120), pages: opts.pageIds.length, modelId: opts.modelId },
      }),
    });
    this.deps.tracer?.incr("run.started");
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
      this.setStatus(runId, "needs_input", run.statusMessage);
    }
    return this.get(runId);
  }

  cancel(runId: string): Run {
    const c = this.controls.get(runId);
    if (c) {
      c.abort.abort();
      c.answerWaiter?.resolve("");
    }
    const run = this.get(runId);
    if (!TERMINAL_STATUSES.has(run.status)) {
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

  setStatus(runId: string, status: Run["status"], message?: string) {
    const run = this.get(runId);
    run.status = status;
    if (message !== undefined) run.statusMessage = message;
    this.deps.repo.saveRun(run);
    this.persistCheckpoint(run);
    this.deps.events.emit(EventTypes.RunStatus, { runId, status, message }, runId);
    this.deps.events.emit(EventTypes.RunUpdated, { run }, runId);
  }

  persistCheckpoint(run: Run) {
    const unresolvedEffects = this.unresolvedByRun.get(run.runId) ?? [];
    const checkpoint = {
      planBoundary: run.status,
      unresolvedEffects,
      pageIdentity: { pageIds: run.pageIds },
      authorizationScope: run.pageIds,
      recoveryStatus: run.status,
    };
    run.config = { ...(run.config ?? {}), checkpoint };
    this.deps.repo.saveRun(run);
    this.deps.repo.saveCheckpoint(`run:${run.runId}`, "coordinator", checkpoint);
  }

  finish(runId: string, status: Run["status"], result?: Record<string, unknown>, error?: string, message?: string) {
    const run = this.get(runId);
    run.status = status;
    run.result = result;
    run.error = error;
    run.endedAt = Date.now();
    if (message !== undefined) run.statusMessage = message;
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
    for (const pageId of run.pageIds) this.deps.pages.releaseAgent?.(pageId);
  }

  async waitIfPaused(c: RunControl, _runId: string) {
    while (c.paused && !c.abort.signal.aborted) {
      await new Promise((r) => setTimeout(r, 120));
    }
    if (c.abort.signal.aborted) throw new VectorError("cancelled", "run cancelled");
  }

  async waitForAnswer(c: RunControl, runId: string): Promise<string> {
    const existing = this.answers.get(runId);
    if (existing !== undefined) {
      this.answers.delete(runId);
      return existing;
    }
    return new Promise<string>((resolve) => {
      c.answerWaiter = { resolve };
    });
  }

  async tryVisionPlan(args: {
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
    return tryVisionPlan(this, args);
  }

  assertTargetAlive(obs: Observation) {
    if (!obs) throw new VectorError("target_detached", "observation empty");
  }

  /** Apply the machine: start → observe → plan → authorize → dispatch → verify. */
  private async loop(runId: string) {
    reduce(initialMachine(), { type: "start" });
    await runCoordinatorLoop(this, runId);
  }

  failActive(reason: string): string[] {
    const failed: string[] = [];
    for (const run of this.deps.repo.listRuns(200)) {
      if (!["queued", "planning", "running", "paused", "needs_input"].includes(run.status)) continue;
      const c = this.controls.get(run.runId);
      if (c) {
        c.abort.abort();
        c.answerWaiter?.resolve("");
      }
      this.finish(run.runId, "failed", undefined, reason, "Stopped by a runtime fault");
      failed.push(run.runId);
    }
    return failed;
  }

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
