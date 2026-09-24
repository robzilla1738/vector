import {
  EventTypes,
  newRunId,
  AuxError,
  type Observation,
  type PlanChunk,
  type Run,
  type Step,
  type StepOutcome,
} from "@aux/contracts";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";
import type { PageService } from "../services/pages.js";
import type { ModelClient } from "./model-client.js";
import type { GrantSource } from "./permissions.js";
import { DurableWriteLedger } from "./durable.js";
import { CoordinatorLease, coordinatorOwnerId } from "./coordinator-lease.js";
import type { CompiledSkill } from "./skills.js";
import {
  DEFAULT_MAX_MODEL_CALLS,
  DEFAULT_MAX_STEPS,
  TERMINAL_STATUSES,
  runCoordinatorLoop,
  tryVisionPlan,
} from "./coordinator-loop.js";

export { verifyDoneAgainstObservation } from "./coordinator-loop.js";

export interface RunControl {
  abort: AbortController;
  paused: boolean;
  dispatchAbort?: AbortController;
  interruptPlanning?: () => void;
  deadlineHit?: boolean;
  answerWaiter?: { resolve: (answer: string) => void };
  span?: { spanId: string; end(outcome?: "ok" | "failed" | "cancelled", attrs?: Record<string, unknown>): void };
}

export interface CoordinatorDeps {
  repo: Repo;
  events: EventBus;
  pages: PageService;
  model: () => ModelClient | null;
  imageReferences?: (run: Run) => string[];
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
    cachedInputTokens?: number;
    providerMetadata?: Record<string, unknown>;
    error?: string;
  }) => void;
  onStepRecorded?: (runId: string, outcome: StepOutcome, step: Step, obsArtifactId?: string) => void;
  saveObservation?: (runId: string, obs: Observation) => string | undefined;
  saveCompletedReport?: (run: Run, markdown: string) => void;
  tracer?: {
    start(
      name: string,
      ctx?: { runId?: string; pageId?: string; attrs?: Record<string, unknown> },
    ): { spanId: string; end(outcome?: "ok" | "failed" | "cancelled", attrs?: Record<string, unknown>): void };
    incr(name: string, by?: number): void;
  };
  grants?: GrantSource;
  durableWrites?: DurableWriteLedger;
  vault?: import("../services/vault.js").VaultService;
  calendar?: import("../services/calendar-connections.js").CalendarConnectionService;
  operations?: import("../services/operations.js").OperationService;
}

/** Run lifecycle and control; the agent loop itself lives in `runCoordinatorLoop`. */
export class RunCoordinator {
  controls = new Map<string, RunControl>();
  answers = new Map<string, string>();
  skills: CompiledSkill[] = [];
  unresolvedByRun = new Map<string, string[]>();
  durable: DurableWriteLedger;
  deps: CoordinatorDeps;
  private leases: CoordinatorLease;
  private leaseOwner = coordinatorOwnerId();
  private heldLeases = new Set<string>();

  constructor(deps: CoordinatorDeps) {
    this.deps = deps;
    this.durable = deps.durableWrites ?? new DurableWriteLedger(deps.repo.db);
    this.leases = new CoordinatorLease(deps.repo.db);
  }

  seedSkills(skills: CompiledSkill[]) {
    this.skills = [...skills];
  }

  compiledSkills(): readonly CompiledSkill[] {
    return this.skills;
  }

  list(limit = 50, options: Parameters<Repo["listRuns"]>[1] = {}): Run[] {
    return this.deps.repo.listRuns(limit, options);
  }

  get(runId: string): Run {
    const run = this.deps.repo.getRun(runId);
    if (!run) throw new AuxError("not_found", `no run ${runId}`);
    return run;
  }

  async start(opts: {
    runId?: string;
    messageId?: string;
    goal: string;
    taskId?: string;
    taskRevision?: number;
    pageIds: string[];
    setId?: string;
    modelId?: string;
    maxSteps?: number;
    maxModelCalls?: number;
    deadlineMs?: number;
    context?: string;
    instructions?: string;
    contextRunIds?: string[];
    contextAttachmentIds?: string[];
    contextDocumentEvidence?: string;
    contextArtifactEvidence?: string;
    contextArtifactIds?: string[];
    contextSourceArtifactIds?: string[];
    contextImageArtifactIds?: string[];
    contextPageRefs?: import("@aux/contracts").PageContextRef[];
    contextWorkspaceId?: string;
    contextWorkspaceRevision?: number;
    contextBrowsingMemory?: boolean;
    chatId?: string;
    retryOfRunId?: string;
    /** routine-declared account boundary stamped on the run */
    accountLabels?: string[];
  }): Promise<Run> {
    const leaseKey = opts.taskId ? `task:${opts.taskId}` : undefined;
    if (leaseKey) {
      this.leases.acquire(leaseKey, this.leaseOwner);
      this.heldLeases.add(leaseKey);
    }
    if (opts.runId) {
      const existing = this.deps.repo.getRun(opts.runId);
      if (existing) return existing;
    }
    const run: Run = {
      runId: opts.runId ?? newRunId(),
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
        instructions: opts.instructions,
        contextRunIds: opts.contextRunIds,
        contextAttachmentIds: opts.contextAttachmentIds,
        contextDocumentEvidence: opts.contextDocumentEvidence,
        contextArtifactEvidence: opts.contextArtifactEvidence,
        contextArtifactIds: opts.contextArtifactIds,
        contextSourceArtifactIds: opts.contextSourceArtifactIds,
        contextImageArtifactIds: opts.contextImageArtifactIds,
        contextPageRefs: opts.contextPageRefs,
        messageRevision: 0,
        messageId: opts.messageId,
        contextWorkspaceId: opts.contextWorkspaceId,
        contextWorkspaceRevision: opts.contextWorkspaceRevision,
        contextBrowsingMemory: opts.contextBrowsingMemory,
        chatId: opts.chatId,
        taskId: opts.taskId,
        taskRevision: opts.taskRevision,
        accountLabels: opts.accountLabels,
        retryOfRunId: opts.retryOfRunId,
        implementation: opts.modelId ? `agent:${opts.modelId}` : "agent",
      },
      createdAt: Date.now(),
    };
    this.deps.repo.saveRun(run);
    this.deps.events.emit(EventTypes.RunUpdated, { run }, run.runId);
    const runLease = `run:${run.runId}`;
    this.leases.acquire(runLease, this.leaseOwner);
    this.heldLeases.add(runLease);
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

  cancel(runId: string, reason = "Cancelled by user"): Run {
    const c = this.controls.get(runId);
    if (c) {
      c.abort.abort();
      c.answerWaiter?.resolve("");
    }
    const run = this.get(runId);
    if (!TERMINAL_STATUSES.has(run.status)) {
      this.finish(runId, "cancelled", undefined, reason);
    }
    return this.get(runId);
  }

  /** An acknowledged correction revokes the current plan without cancelling the run. */
  steer(runId: string): void {
    const c = this.controls.get(runId);
    if (!c || c.abort.signal.aborted) return;
    c.interruptPlanning?.();
    c.dispatchAbort?.abort();
    c.answerWaiter?.resolve("");
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
    const unresolvedEffects = [...new Set([
      ...(this.unresolvedByRun.get(run.runId) ?? []),
      ...this.durable.unresolved(run.runId).map(intent => intent.id),
    ])];
    const checkpoint = {
      planBoundary: run.status,
      unresolvedEffects,
      pageIdentity: { pageIds: run.pageIds },
      authorizationScope: run.pageIds,
      recoveryStatus: run.status,
    };
    run.config = { ...run.config, checkpoint };
    this.deps.repo.saveRun(run);
    this.deps.repo.saveCheckpoint(`run:${run.runId}`, "coordinator", checkpoint);
    const taskKey = run.config?.taskId ? `task:${run.config.taskId}` : undefined;
    try { if (taskKey && this.heldLeases.has(taskKey)) this.leases.refresh(taskKey, this.leaseOwner); } catch { /* fenced owners stop at finish */ }
  }

  finish(runId: string, status: Run["status"], result?: Record<string, unknown>, error?: string, message?: string, failure?: Run["failure"]) {
    const run = this.get(runId);
    if (run.status === "cancelled") return;
    const unresolved = this.durable.unresolved(runId);
    if (unresolved.length) {
      if (status === "completed") result = undefined;
      if (["completed", "partially_completed", "failed"].includes(status)) status = "interrupted";
      error = `Uncertain action outcome (${unresolved.map(intent => intent.id).join(", ")}). Reconciliation is required.${error ? ` ${error}` : ""}`;
      message = "Stopped with an uncertain outcome; no automatic retry";
    }
    run.status = status;
    run.result = result;
    run.error = error;
    run.failure = failure;
    run.endedAt = Date.now();
    if (message !== undefined) run.statusMessage = message;
    run.config = { ...run.config, modelCalls: this.deps.repo.listModelCalls(runId).length };
    this.deps.repo.saveRun(run);
    this.persistCheckpoint(run);
    if (status === "completed" && typeof result?.report === "string" && result.report.trim() && run.config?.chatId) {
      try { this.deps.saveCompletedReport?.(run, result.report); }
      catch (cause) {
        run.status = "partially_completed";
        run.error = `The report could not be saved: ${cause instanceof Error ? cause.message : String(cause)}`;
        run.statusMessage = "The report was generated but could not be saved";
        this.persistCheckpoint(run);
        status = run.status;
        error = run.error;
      }
    }
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
    const taskKey = run.config?.taskId ? `task:${run.config.taskId}` : undefined;
    const runKey = `run:${runId}`;
    if (taskKey && this.heldLeases.has(taskKey)) { this.leases.release(taskKey, this.leaseOwner); this.heldLeases.delete(taskKey); }
    if (this.heldLeases.has(runKey)) { this.leases.release(runKey, this.leaseOwner); this.heldLeases.delete(runKey); }
  }

  async waitIfPaused(c: RunControl, _runId: string) {
    while (c.paused && !c.abort.signal.aborted) {
      await new Promise((r) => setTimeout(r, 120));
    }
    if (c.abort.signal.aborted) throw new AuxError("cancelled", "run cancelled");
  }

  async waitForAnswer(c: RunControl, runId: string): Promise<string> {
    const existing = this.answers.get(runId);
    if (existing !== undefined) {
      this.answers.delete(runId);
      return existing;
    }
    return new Promise<string>((resolve) => {
      c.answerWaiter = { resolve: answer => { c.answerWaiter = undefined; resolve(answer); } };
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
    instructions?: string;
    notes?: string;
  }): Promise<PlanChunk | null> {
    return tryVisionPlan(this, args);
  }

  assertTargetAlive(obs: Observation) {
    if (!obs) throw new AuxError("target_detached", "observation empty");
  }

  /** observe → plan → authorize → dispatch → verify, until a terminal status. */
  private async loop(runId: string) {
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
