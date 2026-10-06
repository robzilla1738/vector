import { closeCreatedPage } from "../services/close-created-page.js";
import { browserContextPage } from "../services/browser-context-page.js";
import { withRunAuthorityMutation, withRunDispatchMutation } from "../services/overnight-authority.js";
import {
  EventTypes,
  newRunId,
  AuxError,
  type Observation,
  type PageTarget,
  type PlanChunk,
  type Run,
  type Step,
  type StepOutcome,
} from "@aux/contracts";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";
import type { PageService } from "../services/pages.js";
import type { ModelClient } from "./model-client.js";
import type { AgentModelCategory, AgentModelRoute } from "@aux/contracts/model-registry";
import type { GrantSource } from "./permissions.js";
import { DurableWriteLedger } from "./durable.js";
import { SuspensionStore } from "../safety/suspensions.js";
import { CoordinatorLease, coordinatorOwnerId } from "./coordinator-lease.js";
import { PageOwnership } from "../scheduler/page-ownership.js";
import type { CompiledSkill } from "./skills.js";
import { runToolLoop, type AgentLoopHostDeps } from "./loop/host.js";
import {
  DEFAULT_MAX_MODEL_CALLS,
  DEFAULT_MAX_STEPS,
  TERMINAL_STATUSES,
  runCoordinatorLoop,
  tryVisionPlan,
} from "./coordinator-loop.js";

export {
  verifyDoneAgainstObservation,
  verifyResultCitations,
  markUnconfirmedWrites,
  NAV_OPS,
} from "./coordinator-loop.js";

export interface RunControl {
  abort: AbortController;
  paused: boolean;
  dispatchAbort?: AbortController;
  takeoverInterrupted?: boolean;
  interruptPlanning?: () => void;
  deadlineHit?: boolean;
  deadlineTimer?: ReturnType<typeof setTimeout>;
  answerWaiter?: { resolve: (answer: string) => void };
  span?: {
    spanId: string;
    end(outcome?: "ok" | "failed" | "cancelled", attrs?: Record<string, unknown>): void;
  };
}

export interface CoordinatorDeps {
  taskSource?: (taskId: string) => { revision: number; state: string; sourceOrigin?: string };
  turnMentions: import("../services/turn-mention-service.js").TurnMentionService;
  repo: Repo;
  events: EventBus;
  pages: PageService;
  model: () => ModelClient | null;
  imageReferences?: (run: Run) => string[];
  memoryReferences?: (
    run: Run,
  ) => Promise<{ url: string; title: string; capturedAt: number; text: string }[]>;
  defaultModel: () => string;
  recoveryModel: () => string | undefined;
  visionModel?: () => string | undefined;
  routeModel?: (category: AgentModelCategory) => AgentModelRoute;
  /** Pre-call user-budget gate (D11): throws permission_denied when a scope is spent. */
  checkBudget?: (scope: { runId: string }) => void | Promise<void>;
  recordModelCall: (c: {
    runId: string;
    role: "planner" | "repair" | "vision" | "probe" | "final" | "agent";
    modelId: string;
    durationMs: number;
    inputTokens?: number;
    outputTokens?: number;
    cachedInputTokens?: number;
    providerMetadata?: Record<string, unknown>;
    error?: string;
  }) => void | Promise<void>;
  onStepRecorded?: (runId: string, outcome: StepOutcome, step: Step, obsArtifactId?: string) => void;
  saveObservation?: (runId: string, obs: Observation) => string | undefined;
  saveCompletedReport?: (run: Run, markdown: string) => string;
  saveCompletedHtml?: (run: Run, html: string) => void;
  saveCompletedGenerated?: (
    run: Run,
    file: import("@aux/contracts").CompletedGeneratedFile,
  ) => Promise<{ artifactId: string }>;
  tracer?: {
    start(
      name: string,
      ctx?: { runId?: string; pageId?: string; attrs?: Record<string, unknown> },
    ): {
      spanId: string;
      end(outcome?: "ok" | "failed" | "cancelled", attrs?: Record<string, unknown>): void;
    };
    incr(name: string, by?: number): void;
  };
  grants?: GrantSource;
  durableWrites?: DurableWriteLedger;
  suspensions?: SuspensionStore;
  vault?: import("../services/vault.js").VaultService;
  calendar?: import("../services/calendar-connections.js").CalendarConnectionService;
  operations?: import("../services/operations.js").OperationService;
  pageOwnership?: PageOwnership;
  browserEgress?: import("../safety/browser-egress.js").BrowserEgress;
  /** S5 tool loop backends (decide()-gated web tools, provider cache options) — main.ts wires them. */
  agentLoop?: AgentLoopHostDeps;
}

/** Run lifecycle and control; the agent loop itself lives in `runCoordinatorLoop`. */
export class RunCoordinator {
  controls = new Map<string, RunControl>();
  answers = new Map<string, string>();
  private createdPages = new Map<string, Set<string>>();
  skills: CompiledSkill[] = [];
  unresolvedByRun = new Map<string, string[]>();
  durable: DurableWriteLedger;
  suspensions: SuspensionStore;
  deps: CoordinatorDeps;
  private leases: CoordinatorLease;
  private leaseOwner = coordinatorOwnerId();
  private heldLeases = new Set<string>();
  private readonly pageOwnership: PageOwnership;
  private pageReleases = new Map<string, () => void>();

  constructor(deps: CoordinatorDeps) {
    this.deps = deps;
    this.durable = deps.durableWrites ?? new DurableWriteLedger(deps.repo.db);
    this.suspensions = deps.suspensions ?? new SuspensionStore(deps.repo.db);
    this.leases = new CoordinatorLease(deps.repo.db);
    this.pageOwnership = deps.pageOwnership ?? new PageOwnership();
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
    nightShiftItemId?: string;
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
    maxTokens?: number;
    maxCostUsd?: number;
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
    contextMemoryIds?: string[];
    contextPageRefs?: import("@aux/contracts").PageContextRef[];
    mentions?: import("@aux/contracts").MentionRef[];
    contextWorkspaceId?: string;
    contextWorkspaceRevision?: number;
    contextBrowsingMemory?: boolean;
    chatId?: string;
    retryOfRunId?: string;
    /**
     * Execution engine (S5 A/B): "agent" keeps the planner loop;
     * "agent-loop" runs the durable tool-call loop. The corpus gate decides
     * which survives — never ship both permanently.
     */
    engine?: "agent" | "agent-loop";
    /** routine-declared account boundary stamped on the run */
    accountLabels?: string[];
    subagentProfile?: "explorer" | "read_only" | "default";
    calendarGrantIds?: string[];
  }): Promise<Run> {
    if (opts.runId) {
      const existing = this.deps.repo.getRun(opts.runId);
      if (existing) return existing;
    }
    const calendarGrantIds =
      opts.calendarGrantIds ??
      (opts.taskId && opts.taskRevision && this.deps.calendar
        ? this.deps.calendar
            .taskGrants(opts.taskId)
            .filter((grant) => grant.taskRevision === opts.taskRevision)
            .map((grant) => grant.grantId)
        : undefined);
    const leaseKey = opts.taskId ? `task:${opts.taskId}` : undefined;
    if (leaseKey) {
      this.leases.acquire(leaseKey, this.leaseOwner);
      this.heldLeases.add(leaseKey);
    }
    const run: Run = {
      runId: opts.runId ?? newRunId(),
      goal: opts.goal,
      status: "queued",
      pageIds: opts.pageIds,
      setId: opts.setId,
      config: {
        nightShiftItemId: opts.nightShiftItemId,
        modelId: opts.modelId,
        maxSteps: opts.maxSteps ?? DEFAULT_MAX_STEPS,
        maxModelCalls: opts.maxModelCalls ?? DEFAULT_MAX_MODEL_CALLS,
        maxTokens: opts.maxTokens,
        maxCostUsd: opts.maxCostUsd,
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
        contextMemoryIds: opts.contextMemoryIds,
        contextPageRefs: opts.contextPageRefs,
        mentions: opts.mentions,
        messageRevision: 0,
        messageId: opts.messageId,
        contextWorkspaceId: opts.contextWorkspaceId,
        contextWorkspaceRevision: opts.contextWorkspaceRevision,
        contextBrowsingMemory: opts.contextBrowsingMemory,
        chatId: opts.chatId,
        taskId: opts.taskId,
        taskRevision: opts.taskRevision,
        accountLabels: opts.accountLabels,
        subagentProfile: opts.subagentProfile,
        calendarGrantIds,
        retryOfRunId: opts.retryOfRunId,
        implementation:
          opts.engine === "agent-loop" ? "agent-loop" : opts.modelId ? `agent:${opts.modelId}` : "agent",
      },
      createdAt: Date.now(),
    };
    this.deps.repo.saveRun(run);
    this.deps.events.emit(EventTypes.RunUpdated, { run }, run.runId);
    const runLease = `run:${run.runId}`;
    this.leases.acquire(runLease, this.leaseOwner);
    this.heldLeases.add(runLease);
    const control: RunControl = {
      abort: new AbortController(),
      paused: false,
      span: this.deps.tracer?.start("run", {
        runId: run.runId,
        attrs: { goal: opts.goal.slice(0, 120), pages: opts.pageIds.length, modelId: opts.modelId },
      }),
    };
    if (run.config?.deadlineMs)
      control.deadlineTimer = setTimeout(() => {
        if (control.abort.signal.aborted) return;
        control.deadlineHit = true;
        control.abort.abort();
        control.answerWaiter?.resolve("");
      }, run.config.deadlineMs);
    this.controls.set(run.runId, control);
    this.deps.tracer?.incr("run.started");
    void this.loop(run.runId).catch(async (e) => {
      const error = control.deadlineHit
        ? `run deadline exceeded (${run.config?.deadlineMs}ms)`
        : e instanceof Error
          ? e.message
          : String(e);
      await this.finish(run.runId, "failed", undefined, error, error);
      this.controls.delete(run.runId);
    });
    return run;
  }

  async pause(runId: string): Promise<Run> {
    const c = this.controls.get(runId);
    const run = this.get(runId);
    if (c && (run.status === "queued" || run.status === "running" || run.status === "planning")) {
      c.paused = true;
      await this.setStatus(runId, "paused", "Paused");
    }
    return this.get(runId);
  }

  /** A physical takeover fences a live dispatch before the owner uses the page. */
  interruptForTakeover(runId: string): void {
    const c = this.controls.get(runId);
    if (!c || c.abort.signal.aborted) return;
    c.paused = true;
    c.takeoverInterrupted = true;
    c.interruptPlanning?.();
    c.dispatchAbort?.abort();
    this.deps.browserEgress?.suspendRun(runId);
  }

  async resume(runId: string): Promise<Run> {
    const c = this.controls.get(runId);
    const run = this.get(runId);
    if (c?.paused) {
      c.paused = false;
      if (run.status === "paused") await this.setStatus(runId, "running", "Resumed");
    } else if (run.status === "needs_input") {
      await this.setStatus(runId, "needs_input", run.statusMessage);
    }
    return this.get(runId);
  }

  async cancel(runId: string, reason = "Cancelled by user"): Promise<Run> {
    this.deps.browserEgress?.revokeRun(runId);
    const c = this.controls.get(runId);
    if (c) {
      c.abort.abort();
      c.answerWaiter?.resolve("");
    }
    const run = this.get(runId);
    if (!TERMINAL_STATUSES.has(run.status)) {
      await this.finish(runId, "cancelled", undefined, reason);
    }
    return this.get(runId);
  }

  async refreshPageSelection(runId: string): Promise<string[]> {
    return withRunAuthorityMutation(
      this.deps.repo,
      async () => {
        const token = this.deps.turnMentions.capture(runId);
        const run = this.get(runId);
        this.releasePages(runId);
        if (run.config?.mentions?.length) run.pageIds = this.deps.turnMentions.selectedPages(runId);
        else {
          const steer = this.deps.repo.listRunSteers(runId).at(-1);
          if (steer) run.pageIds = [...steer.pageIds];
        }
        run.config = { ...run.config, isolatedPageSources: undefined };
        this.deps.repo.saveRun(run);
        await this.acquirePages(runId);
        if (!this.deps.turnMentions.has(runId) || this.deps.turnMentions.capture(runId) !== token) {
          this.releasePages(runId);
          throw new AuxError("conflict", "This turn changed while acquiring its newly selected pages.");
        }
        return [...this.get(runId).pageIds];
      },
      runId,
    );
  }

  pageSourceCheck(runId: string, pageId: string): () => void {
    const before = this.get(runId);
    const revision = before.config?.messageRevision;
    const taskId = before.config?.taskId;
    const taskRevision = before.config?.taskRevision;
    const source = taskId ? this.deps.taskSource?.(taskId) : undefined;
    if (taskId && (!source || source.revision !== taskRevision))
      throw new AuxError("permission_denied", "The saved task source revision is unavailable.");
    return () => {
      const run = this.get(runId);
      const control = this.controls.get(runId);
      const owner = this.pageOwnership.snapshot()[pageId];
      if (
        !control ||
        control.abort.signal.aborted ||
        !owner ||
        owner.actor !== "coordinator" ||
        owner.runId !== runId ||
        (!run.pageIds.includes(pageId) && !this.ownedPages(runId).includes(pageId)) ||
        run.config?.messageRevision !== revision ||
        run.config?.taskId !== taskId ||
        run.config?.taskRevision !== taskRevision
      )
        throw new AuxError("permission_denied", "This run's approved source or page lease changed.");
      if (taskId) {
        const current = this.deps.taskSource?.(taskId);
        if (
          !current ||
          current.state !== "open" ||
          current.revision !== taskRevision ||
          current.sourceOrigin !== source?.sourceOrigin
        )
          throw new AuxError("permission_denied", "This task's current source approval changed.");
      }
    };
  }

  usePage<T>(runId: string, pageId: string, access: "read" | "act", dispatch: () => Promise<T>): Promise<T> {
    return this.deps.turnMentions.useSourcePage(
      runId,
      pageId,
      access,
      this.pageSourceCheck(runId, pageId),
      dispatch,
    );
  }

  assertPage(runId: string, pageId: string, access: "read" | "act"): Promise<void> {
    return this.usePage(runId, pageId, access, async () => undefined);
  }

  ownedPages(runId: string): string[] {
    return [...(this.createdPages.get(runId) ?? [])];
  }

  ownPage(runId: string, pageId: string): void {
    this.deps.turnMentions.created(runId, pageId);
    const pages = this.createdPages.get(runId) ?? new Set<string>();
    pages.add(pageId);
    this.createdPages.set(runId, pages);
  }

  /** An acknowledged correction revokes the current plan without cancelling the run. */
  steer(runId: string): void {
    this.deps.turnMentions.end(runId);
    const c = this.controls.get(runId);
    if (!c || c.abort.signal.aborted) return;
    c.interruptPlanning?.();
    c.dispatchAbort?.abort();
    c.answerWaiter?.resolve("");
  }

  async answerWithMentions(
    runId: string,
    answer: string,
    mentions: readonly import("@aux/contracts").MentionRef[],
    recheck: () => void,
  ): Promise<Run> {
    return withRunAuthorityMutation(
      this.deps.repo,
      async () => {
        const run = this.get(runId);
        const owned = this.ownedPages(runId);
        return this.deps.turnMentions.acknowledge(
          runId,
          mentions,
          owned,
          {
            workspaceId: run.config?.contextWorkspaceId,
            taskId: run.config?.taskId,
            taskRevision: run.config?.taskRevision,
          },
          (validated) => {
            recheck();
            const current = this.get(runId);
            current.config = {
              ...current.config,
              mentions: [...validated],
              messageRevision: (current.config?.messageRevision ?? 0) + 1,
            };
            this.deps.repo.saveRun(current);
            return this.answer(runId, answer);
          },
        );
      },
      runId,
    );
  }

  async answer(runId: string, answer: string): Promise<Run> {
    return withRunAuthorityMutation(
      this.deps.repo,
      async () => {
        const c = this.controls.get(runId);
        const run = this.get(runId);
        if (run.status === "needs_input") await this.setStatus(runId, "running", `Answer received`);
        this.answers.set(runId, answer);
        c?.answerWaiter?.resolve(answer);
        return this.get(runId);
      },
      runId,
    );
  }

  async setStatus(runId: string, status: Run["status"], message?: string) {
    const mutate =
      status === "paused" || TERMINAL_STATUSES.has(status)
        ? withRunDispatchMutation
        : withRunAuthorityMutation;
    await mutate(
      this.deps.repo,
      async () => {
        const run = this.get(runId);
        if (this.controls.get(runId)?.paused && (status === "running" || status === "planning")) {
          status = "paused";
          message = "Paused — active work is finishing";
        }
        run.status = status;
        if (message !== undefined) run.statusMessage = message;
        this.deps.repo.saveRun(run);
        this.persistCheckpoint(run);
        this.deps.events.emit(EventTypes.RunStatus, { runId, status, message }, runId);
        this.deps.events.emit(EventTypes.RunUpdated, { run }, runId);
      },
      runId,
    );
  }

  persistCheckpoint(run: Run) {
    const unresolvedEffects = [
      ...new Set([
        ...(this.unresolvedByRun.get(run.runId) ?? []),
        ...this.durable.unresolved(run.runId).map((intent) => intent.id),
      ]),
    ];
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
    try {
      if (taskKey && this.heldLeases.has(taskKey)) this.leases.refresh(taskKey, this.leaseOwner);
    } catch {
      /* fenced owners stop at finish */
    }
  }

  async finish(
    runId: string,
    status: Run["status"],
    result?: Record<string, unknown>,
    error?: string,
    message?: string,
    failure?: Run["failure"],
  ) {
    await withRunDispatchMutation(
      this.deps.repo,
      async () => {
        this.deps.turnMentions.end(runId);
        this.createdPages.delete(runId);
        const run = this.get(runId);
        if (run.status === "cancelled") return;
        const unresolved = this.durable.unresolved(runId);
        if (unresolved.length) {
          if (status === "completed") result = undefined;
          if (["completed", "partially_completed", "failed"].includes(status)) status = "interrupted";
          error = `Uncertain action outcome (${unresolved.map((intent) => intent.id).join(", ")}). Reconciliation is required.${error ? ` ${error}` : ""}`;
          message = "Stopped with an uncertain outcome; no automatic retry";
        }
        run.status = status;
        if (result) {
          result = { ...result };
          delete result.automaticReportArtifactId;
        }
        run.result = result;
        run.error = error;
        run.failure = failure;
        run.endedAt = Date.now();
        if (message !== undefined) run.statusMessage = message;
        run.config = { ...run.config, modelCalls: this.deps.repo.listModelCalls(runId).length };
        this.deps.repo.saveRun(run);
        this.persistCheckpoint(run);
        this.suspensions.resolveRun(runId, "cancelled");
        if (
          status === "completed" &&
          run.config?.chatId &&
          ((typeof result?.report === "string" && result.report.trim()) ||
            (typeof result?.html === "string" && result.html.trim()))
        ) {
          try {
            if (typeof result?.report === "string" && result.report.trim()) {
              const artifactId = this.deps.saveCompletedReport?.(run, result.report);
              if (artifactId) {
                run.result = { ...run.result, automaticReportArtifactId: artifactId };
                this.deps.repo.saveRun(run);
              }
            }
            if (typeof result?.html === "string" && result.html.trim())
              this.deps.saveCompletedHtml?.(run, result.html);
          } catch (cause) {
            run.status = "partially_completed";
            run.error = `The generated result could not be saved: ${cause instanceof Error ? cause.message : String(cause)}`;
            run.statusMessage = "A generated result could not be saved";
            this.persistCheckpoint(run);
            status = run.status;
            error = run.error;
          }
        }
        this.deps.events.emit(EventTypes.RunStatus, { runId, status, error }, runId);
        this.deps.events.emit(EventTypes.RunUpdated, { run }, runId);
        const span = this.controls.get(runId)?.span;
        const timer = this.controls.get(runId)?.deadlineTimer;
        if (timer) clearTimeout(timer);
        if (span) {
          span.end(
            status === "completed"
              ? "ok"
              : status === "cancelled" || status === "interrupted"
                ? "cancelled"
                : "failed",
            { status, durationMs: run.startedAt ? Date.now() - run.startedAt : undefined, error },
          );
          this.controls.get(runId)!.span = undefined;
        }
        this.deps.tracer?.incr(`run.${status}`);
        for (const pageId of run.pageIds) this.deps.pages.releaseAgent?.(pageId);
        const taskKey = run.config?.taskId ? `task:${run.config.taskId}` : undefined;
        const runKey = `run:${runId}`;
        if (taskKey && this.heldLeases.has(taskKey)) {
          this.leases.release(taskKey, this.leaseOwner);
          this.heldLeases.delete(taskKey);
        }
        if (this.heldLeases.has(runKey)) {
          this.leases.release(runKey, this.leaseOwner);
          this.heldLeases.delete(runKey);
        }
      },
      runId,
    );
  }

  async waitIfPaused(c: RunControl, runId: string) {
    if (c.paused) this.releasePages(runId, true);
    while (c.paused && !c.abort.signal.aborted) {
      await new Promise((r) => setTimeout(r, 120));
    }
    if (c.abort.signal.aborted) throw new AuxError("cancelled", "run cancelled");
    await this.acquirePages(runId);
  }

  async waitForAnswer(c: RunControl, runId: string): Promise<string> {
    const existing = this.answers.get(runId);
    if (existing !== undefined) {
      this.answers.delete(runId);
      return existing;
    }
    this.releasePages(runId, true);
    const answer = await new Promise<string>((resolve) => {
      c.answerWaiter = {
        resolve: (answer) => {
          c.answerWaiter = undefined;
          resolve(answer);
        },
      };
    });
    if (!c.abort.signal.aborted) await this.acquirePages(runId);
    return answer;
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

  /**
   * Run body — the planner loop (observe → plan → authorize → dispatch →
   * verify) or the S5 tool loop when the run's engine is `agent-loop`.
   */
  private async loop(runId: string) {
    try {
      const run = this.get(runId);
      await this.deps.turnMentions.begin(runId, run.config?.mentions ?? [], this.ownedPages(runId), {
        workspaceId: run.config?.contextWorkspaceId,
        taskId: run.config?.taskId,
        taskRevision: run.config?.taskRevision,
      });
      if (run.config?.mentions?.length) {
        run.pageIds = this.deps.turnMentions.selectedPages(runId);
        this.deps.repo.saveRun(run);
      }
      await this.acquirePages(runId);
      const control = this.controls.get(runId);
      if (!control) throw new AuxError("cancelled", "Run ended while preparing its pages.");
      await this.waitIfPaused(control, runId);
      if (this.get(runId).config?.implementation === "agent-loop") await runToolLoop(this, runId);
      else await runCoordinatorLoop(this, runId);
    } finally {
      this.deps.turnMentions.end(runId);
      this.releasePages(runId);
    }
  }

  private async acquirePages(runId: string): Promise<void> {
    if (this.pageReleases.has(runId)) return;
    const control = this.controls.get(runId);
    if (!control) throw new AuxError("cancelled", "run has ended");
    const releases: Array<() => void> = [];
    const opened: PageTarget[] = [];
    try {
      const run = this.get(runId);
      if (this.deps.browserEgress) {
        // Protect run context before even the first controlled navigation.
        const memoryOffset = run.config?.context?.indexOf("SPACE MEMORY SUMMARY") ?? -1;
        if (memoryOffset >= 0)
          this.deps.browserEgress.protect(runId, run.config!.context!.slice(memoryOffset), "memory");
        if (run.config?.contextWorkspaceId && run.config.instructions)
          this.deps.browserEgress.protect(runId, run.config.instructions, "memory");
      }
      if (this.deps.browserEgress && !run.config?.isolatedPageSources && !run.config?.mentions?.length) {
        const sources: NonNullable<NonNullable<Run["config"]>["isolatedPageSources"]> = [];
        for (const sourcePageId of run.pageIds) {
          if (control.abort.signal.aborted)
            throw new AuxError("cancelled", "Run cancelled before opening its temporary tab.");
          const source = browserContextPage(() => this.deps.pages.get(sourcePageId));
          // An empty tab grants no destination. The tool loop must choose an
          // exact HTTP(S) URL before openTab creates any actionable document.
          if (source.url === "about:blank") continue;
          const agentScope = await this.deps.browserEgress.creationScope(runId, sourcePageId);
          const copy = await this.deps.pages.open({
            url: agentScope.source!.expectedUrl,
            windowId: source.windowId,
            background: true,
            ownedByRuntime: true,
            agentScope,
            signal: control.abort.signal,
            beforeNavigate: async (target) => {
              releases.push(await this.claimPage(runId, target.pageId, agentScope.source!.expectedUrl));
            },
          });
          opened.push(structuredClone(copy));
          this.ownPage(runId, copy.pageId);
          sources.push({ sourcePageId, pageId: copy.pageId, url: agentScope.source!.expectedUrl });
        }
        if (control.abort.signal.aborted)
          throw new AuxError("cancelled", "Run cancelled while opening its temporary tab.");
        if (!sources.length && run.config?.implementation !== "agent-loop")
          throw new AuxError(
            "capability_unsupported",
            "This planner needs a website to open in a protected temporary tab. Choose a website before starting.",
          );
        const current = this.get(runId);
        if (
          this.controls.get(runId) !== control ||
          TERMINAL_STATUSES.has(current.status) ||
          current.config?.taskId !== run.config?.taskId ||
          current.config?.taskRevision !== run.config?.taskRevision ||
          current.config?.messageRevision !== run.config?.messageRevision ||
          JSON.stringify(current.pageIds) !== JSON.stringify(run.pageIds)
        )
          throw new AuxError("ref_stale", "The original run changed while opening its temporary tabs.");
        current.pageIds = sources.map((source) => source.pageId);
        current.config = { ...current.config, isolatedPageSources: sources };
        this.deps.repo.saveRun(current);
        this.deps.events.emit(EventTypes.RunUpdated, { run: current }, runId);
      } else {
        releases.push(
          await this.pageOwnership.acquireMany(
            run.pageIds,
            { actor: "coordinator", runId },
            control.abort.signal,
          ),
        );
        const humanHeld = run.pageIds.find((pageId) => this.deps.pages.get(pageId).controller === "human");
        if (humanHeld) throw new AuxError("conflict", `Page ${humanHeld} is under human control`);
        for (const pageId of run.pageIds) await this.deps.browserEgress?.acquire(runId, pageId);
      }
      if (control.abort.signal.aborted)
        throw new AuxError("cancelled", "run cancelled while waiting for a page");
      this.pageReleases.set(runId, () => {
        for (const release of releases.slice().reverse()) release();
      });
    } catch (error) {
      this.deps.browserEgress?.revokeRun(runId);
      for (const release of releases.reverse()) release();
      const cleanupErrors: unknown[] = [];
      for (const page of opened) {
        try {
          await closeCreatedPage(this.deps.pages, page, runId);
        } catch (cleanup) {
          cleanupErrors.push(cleanup);
        }
      }
      if (cleanupErrors.length)
        throw new AggregateError(
          [error, ...cleanupErrors],
          "Page acquisition failed and original native cleanup remains unresolved.",
        );
      throw error;
    }
  }

  private releasePages(runId: string, suspend = false): void {
    if (suspend) this.deps.browserEgress?.suspendRun(runId);
    else this.deps.browserEgress?.revokeRun(runId);
    const release = this.pageReleases.get(runId);
    this.pageReleases.delete(runId);
    release?.();
  }

  ownsPages(runId: string): boolean {
    return this.pageReleases.has(runId);
  }

  async claimPage(runId: string, pageId: string, initialDestination?: string): Promise<() => void> {
    const control = this.controls.get(runId);
    if (!control) throw new AuxError("cancelled", "run has ended");
    const release = await this.pageOwnership.acquire(
      { pageId, actor: "coordinator", runId },
      control.abort.signal,
    );
    try {
      const revoke = await this.deps.browserEgress?.acquire(runId, pageId, initialDestination);
      return () => {
        revoke?.();
        release();
      };
    } catch (error) {
      release();
      throw error;
    }
  }

  async failActive(reason: string): Promise<string[]> {
    const failed: string[] = [];
    for (const run of this.deps.repo.listRuns(200)) {
      if (!["queued", "planning", "running", "paused", "needs_input"].includes(run.status)) continue;
      const c = this.controls.get(run.runId);
      if (c) {
        c.abort.abort();
        c.answerWaiter?.resolve("");
      }
      await this.finish(run.runId, "failed", undefined, reason, "Stopped by a runtime fault");
      failed.push(run.runId);
    }
    return failed;
  }

  async markInterrupted() {
    for (const run of this.deps.repo.listRuns(200)) {
      if (["queued", "planning", "running", "paused", "needs_input"].includes(run.status)) {
        await withRunDispatchMutation(
          this.deps.repo,
          async () => {
            const current = this.deps.repo.getRun(run.runId);
            if (
              !current ||
              !["queued", "planning", "running", "paused", "needs_input"].includes(current.status)
            )
              return;
            current.status = "interrupted";
            current.endedAt = Date.now();
            this.deps.repo.saveRun(current);
          },
          run.runId,
        );
      }
    }
  }
}
