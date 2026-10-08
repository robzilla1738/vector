import { TranscriptStore } from "./loop/transcript.js";
import type { ModelMessage } from "./loop/types.js";
import { CloudSetupUnavailable } from "../services/cloud-setup-unavailable.js";
import { lineageRuns, runRoot } from "../services/run-lineage.js";
import { resourceFundingAccounting } from "../services/resource-accounting.js";
import {
  RunFundingService,
  ResourceFundingUnavailable,
  ModelFundingUnavailable,
  ResourceLimitsUnavailable,
} from "../services/run-funding.js";
import {
  markInterruptedRuns,
  activeRunIds,
  recoverablePark,
  retireParkedProofs,
} from "../services/startup-recovery.js";
import { closeCreatedPage } from "../services/close-created-page.js";
import { browserContextPage } from "../services/browser-context-page.js";
import { withRunAuthorityMutation, withRunDispatchMutation } from "../services/overnight-authority.js";
import {
  EventTypes,
  MentionRefsSchema,
  newRunId,
  AuxError,
  type Observation,
  type PageTarget,
  type Run,
  type Step,
  type StepOutcome,
  type BudgetSuspension,
} from "@aux/contracts";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";
import type { PageService } from "../services/pages.js";
import type { ModelClient } from "./model-client.js";
import { DurableWriteLedger } from "./durable.js";
import { ApprovalStore } from "../safety/approval.js";
import { SuspensionStore } from "../safety/suspensions.js";
import { CoordinatorLease, coordinatorOwnerId } from "./coordinator-lease.js";
import { PageOwnership } from "../scheduler/page-ownership.js";
import { runToolLoop, taskMessage, type AgentLoopHostDeps } from "./loop/host.js";
import { DEFAULT_MAX_MODEL_CALLS } from "./model-client.js";
import { DEFAULT_MAX_STEPS, TERMINAL_STATUSES } from "./run-state.js";

export { markUnconfirmedWrites, verifyResultCitations, NAV_OPS } from "./result-verification.js";

export interface RunControl {
  abort: AbortController;
  paused: boolean;
  dispatchAbort?: AbortController;
  preserveParkOnShutdown?: boolean;
  takeoverInterrupted?: boolean;
  budgetInterrupted?: boolean;
  interruptPlanning?: () => void;
  deadlineHit?: boolean;
  deadlineTimer?: ReturnType<typeof setTimeout>;
  budgetWaiter?: { suspensionId: string; resolve: () => void };
  budgetContinuation?: Promise<void>;
  resourceContinuation?: Promise<void>;
  resourceWaiter?: {
    suspensionId: string;
    validate: () => Promise<void>;
    retryReady?: () => Promise<void>;
    resolve: () => void;
  };
  answerWaiter?: { resolve: (answer: string) => void };
  span?: {
    spanId: string;
    end(outcome?: "ok" | "failed" | "cancelled", attrs?: Record<string, unknown>): void;
  };
}

const BUDGET_INTERRUPTION = Symbol("trusted run budget interruption");
const TAKEOVER_INTERRUPTION = Symbol("trusted run takeover interruption");

export interface CoordinatorDeps {
  onDeadline?: (runId: string) => void;
  prepareSources?: (run: Run, signal: AbortSignal) => Promise<void>;
  checkRunSource?: (runId: string) => void;
  checkSharedBudget?: (runId: string) => Promise<void>;
  reserveModelCall?: (runId: string) => Promise<() => void>;
  admitToolCall?: (runId: string, callId: string, toolName: string) => Promise<void>;
  sharedCallCap?: (runId: string) => boolean;
  budgetOwner?: (runId: string) => string;
  pauseFamily?: (runId: string, reason: string) => Promise<() => Promise<void>>;
  taskSource?: (taskId: string) => { revision: number; state: string; sourceOrigin?: string };
  turnMentions: import("../services/turn-mention-service.js").TurnMentionService;
  /** Native OTR already owns the private browser session and its signed-in tabs. */
  privateBrowserProfile?: boolean;
  repo: Repo;
  events: EventBus;
  pages: PageService;
  model: () => ModelClient | null;
  imageReferences?: (run: Run) => string[];
  memoryReferences?: (
    run: Run,
  ) => Promise<{ url: string; title: string; capturedAt: number; text: string }[]>;
  defaultModel: () => string;
  /** Pre-call user-budget gate (D11): throws permission_denied when a scope is spent. */
  checkBudget?: (scope: {
    runId: string;
    requiredUsd?: number;
    excludeRunLimit?: boolean;
  }) => void | Promise<void>;
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
  readOnly?: boolean;
  durableWrites?: DurableWriteLedger;
  suspensions?: SuspensionStore;
  approvals?: ApprovalStore;
  vault?: import("../services/vault.js").VaultService;
  calendar?: import("../services/calendar-connections.js").CalendarConnectionService;
  operations?: import("../services/operations.js").OperationService;
  pageOwnership?: PageOwnership;
  browserEgress?: import("../safety/browser-egress.js").BrowserEgress;
  /** S5 tool loop backends (decide()-gated web tools, provider cache options) — main.ts wires them. */
  agentLoop?: AgentLoopHostDeps;
  funding?: import("../services/run-funding.js").RunFundingService;
}

/** Run lifecycle and control; the agent loop itself lives in `runCoordinatorLoop`. */
export class RunCoordinator {
  controls = new Map<string, RunControl>();
  /** Exact trusted external utility participants own their pages through the API lease. */
  private externalPageOwners = new WeakMap<
    RunControl,
    { runId: string; connectionId?: string; taskId?: string; taskRevision?: number }
  >();
  private executions = new Map<string, Promise<void>>();
  private restoredDecisions = new Set<string>();
  private closed = false;
  answers = new Map<string, string>();
  private createdPages = new Map<string, Set<string>>();
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
    this.deps.funding ??= new RunFundingService(deps.repo, resourceFundingAccounting(deps.repo));
    this.durable = deps.durableWrites ?? new DurableWriteLedger(deps.repo.db);
    this.suspensions = deps.suspensions ?? new SuspensionStore(deps.repo.db);
    this.leases = new CoordinatorLease(deps.repo.db);
    this.pageOwnership = deps.pageOwnership ?? new PageOwnership();
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
    /** Captured only by the authorized fork_self reservation; never persisted in Run.config. */
    forkTranscript?: ModelMessage[];
    branchSourceRunIds?: string[];
    runId?: string;
    messageId?: string;
    goal: string;
    taskId?: string;
    taskRevision?: number;
    pageIds: string[];
    setId?: string;
    modelId?: string;
    reasoning?: "low" | "medium" | "high";
    privateTask?: boolean;
    agentMode?: import("@aux/contracts").AgentMode;
    executionTarget?: "local" | "cloud";
    nativeTurnContext?: string;
    externalConnectionId?: string;
    externalParentRunId?: string;
    setMemberSource?: NonNullable<Run["config"]>["setMemberSource"];
    maxSteps?: number;
    maxModelCalls?: number;
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
    /** routine-declared account boundary stamped on the run */
    accountLabels?: string[];
    subagentProfile?: string;
    agentProfile?: import("@aux/contracts").AgentProfile;
    auxPackages?: import("@aux/contracts").AuxPackageSnapshot[];
    projectRoot?: string;
    coderWorktree?: import("@aux/contracts").CoderWorktree;
    calendarGrantIds?: string[];
  }): Promise<Run> {
    if (this.closed) throw new AuxError("cancelled", "Run execution is closed.");
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
    const leaseKey = opts.taskId && !opts.setMemberSource ? `task:${opts.taskId}` : undefined;
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
        reasoning: opts.reasoning,
        privateTask: this.deps.privateBrowserProfile || (opts.privateTask ?? false),
        agentMode: opts.agentMode,
        executionTarget: opts.executionTarget ?? "local",
        nativeTurnContext: opts.nativeTurnContext,
        externalConnectionId: opts.externalConnectionId,
        externalParentRunId: opts.externalParentRunId,
        setMemberSource: opts.setMemberSource,
        maxSteps: opts.maxSteps ?? DEFAULT_MAX_STEPS,
        maxModelCalls: opts.maxModelCalls ?? DEFAULT_MAX_MODEL_CALLS,
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
        agentProfile: opts.agentProfile,
        auxPackages: opts.auxPackages,
        projectRoot: opts.projectRoot,
        coderWorktree: opts.coderWorktree,
        calendarGrantIds,
        retryOfRunId: opts.retryOfRunId,
        branchSourceRunIds: opts.branchSourceRunIds,
        implementation: "agent-loop",
      },
      createdAt: Date.now(),
    };
    this.deps.repo.transaction(() => {
      this.deps.repo.saveRun(run);
      if (opts.forkTranscript) {
        const transcript = new TranscriptStore(this.deps.repo.db, this.deps.repo.columnCipher);
        transcript.append(run.runId, [
          ...opts.forkTranscript,
          taskMessage(
            run,
            run.config?.contextWorkspaceId
              ? this.deps.agentLoop?.workspaceContext?.(run.config.contextWorkspaceId)
              : "",
          ),
        ]);
      }
    });
    if (opts.setMemberSource) {
      const source = opts.setMemberSource;
      this.deps.repo.db
        .prepare(
          `INSERT INTO set_run_members(child_run_id,parent_run_id,set_id,member_id,source_digest,state,created_at,updated_at)
        VALUES(?,?,?,?,?,'running',?,?)`,
        )
        .run(
          run.runId,
          source.parentRunId,
          source.setId,
          source.memberId,
          source.sourceDigest,
          Date.now(),
          Date.now(),
        );
    }
    this.deps.events.emit(EventTypes.RunUpdated, { run }, run.runId);
    this.launchRun(run);
    return run;
  }

  /** Reuse the normal loop only after a trusted request restores a durable parked call. */
  private launchRun(run: Run): void {
    const runLease = `run:${run.runId}`;
    this.leases.acquire(runLease, this.leaseOwner);
    this.heldLeases.add(runLease);
    const control: RunControl = {
      abort: new AbortController(),
      paused: false,
      dispatchAbort: new AbortController(),
      span: this.deps.tracer?.start("run", {
        runId: run.runId,
        attrs: { goal: run.goal.slice(0, 120), pages: run.pageIds.length, modelId: run.config?.modelId },
      }),
    };
    this.armDeadline(run.runId, control, run.config?.deadlineMs);
    this.controls.set(run.runId, control);
    this.deps.tracer?.incr("run.started");
    const execution = this.loop(run.runId)
      .catch(async (e) => {
        const error = control.deadlineHit
          ? `run deadline exceeded (${run.config?.deadlineMs}ms)`
          : e instanceof Error
            ? e.message
            : String(e);
        if (!control.abort.signal.aborted && !TERMINAL_STATUSES.has(this.get(run.runId).status))
          await this.finish(run.runId, "failed", undefined, error, error);
        if (this.controls.get(run.runId) === control) this.controls.delete(run.runId);
        if (this.closed) throw e;
      })
      .finally(() => {
        if (this.executions.get(run.runId) === execution) this.executions.delete(run.runId);
      });
    this.executions.set(run.runId, execution);
    void execution;
  }

  registerBatch(run: Run, pageOwner: "coordinator" | "external" = "coordinator"): () => void {
    if (
      pageOwner === "external" &&
      (run.config?.implementation !== "external-agent" || !run.config.externalConnectionId)
    )
      throw new AuxError(
        "permission_denied",
        "External utility ownership requires its original external session.",
      );
    if (this.closed) throw new AuxError("cancelled", "Run execution is closed.");
    const taskLease = run.config?.taskId ? `task:${run.config.taskId}` : undefined;
    if (taskLease) {
      this.leases.acquire(taskLease, this.leaseOwner);
      this.heldLeases.add(taskLease);
    }
    const control: RunControl = {
      abort: new AbortController(),
      paused: false,
      dispatchAbort: new AbortController(),
    };
    if (pageOwner === "external")
      this.externalPageOwners.set(control, {
        runId: run.runId,
        connectionId: run.config?.externalConnectionId,
        taskId: run.config?.taskId,
        taskRevision: run.config?.taskRevision,
      });
    this.controls.set(run.runId, control);
    this.armDeadline(run.runId, control, run.config?.deadlineMs);
    return () => {
      if (control.deadlineTimer) clearTimeout(control.deadlineTimer);
      this.controls.delete(run.runId);
      if (taskLease) {
        this.leases.release(taskLease, this.leaseOwner);
        this.heldLeases.delete(taskLease);
      }
    };
  }

  private retirePendingProofs(runId: string): void {
    const run = this.get(runId);
    const approvals =
      this.deps.approvals ??
      new ApprovalStore(this.deps.repo.db, undefined, undefined, undefined, (id) =>
        this.deps.repo.getRun(id),
      );
    this.deps.repo.transaction(() => {
      const pending = this.suspensions.pending(runId);
      if (pending) approvals.retireTurn(pending.turnId, pending.threadId);
      approvals.retireTurn(runId, run.config?.chatId ?? runId);
      this.suspensions.resolveRun(runId, "cancelled");
    });
  }

  private armDeadline(runId: string, control: RunControl, limit?: number): void {
    if (control.deadlineTimer) clearTimeout(control.deadlineTimer);
    control.deadlineHit = false;
    if (!limit) return;
    const schedule = () => {
      const run = this.get(runId);
      const remaining = limit - (Date.now() - (run.startedAt ?? run.createdAt));
      control.deadlineTimer = setTimeout(
        () => {
          if (control.abort.signal.aborted || this.controls.get(runId) !== control) return;
          const current = this.get(runId);
          if (limit - (Date.now() - (current.startedAt ?? current.createdAt)) > 0) {
            schedule();
            return;
          }
          control.deadlineHit = true;
          this.retirePendingProofs(runId);
          control.interruptPlanning?.();
          control.dispatchAbort?.abort(BUDGET_INTERRUPTION);
          control.budgetWaiter?.resolve();
          control.budgetWaiter = undefined;
          control.answerWaiter?.resolve("");
          this.deps.onDeadline?.(runId);
        },
        Math.max(0, Math.min(2_147_483_647, remaining)),
      );
    };
    schedule();
  }

  pauseForBudget(runId: string, budget: BudgetSuspension): Promise<void> {
    budget = this.deps.funding?.timeBudget(runId, budget) ?? budget;
    const owner =
      budget.reason === "spend" || budget.funding ? (this.deps.budgetOwner?.(runId) ?? runId) : runId;
    if (owner !== runId) return this.pauseForBudget(owner, budget);
    const control = this.controls.get(runId);
    if (!control || control.abort.signal.aborted)
      return Promise.reject(new AuxError("cancelled", "run cancelled"));
    if (control.budgetContinuation) return control.budgetContinuation;
    const pending = Promise.resolve()
      .then(() => this.parkBudget(runId, budget))
      .finally(() => {
        if (control.budgetContinuation === pending) control.budgetContinuation = undefined;
      });
    control.budgetContinuation = pending;
    return pending;
  }

  async pauseForResourceFunding(
    error:
      | ResourceFundingUnavailable
      | ResourceLimitsUnavailable
      | ModelFundingUnavailable
      | CloudSetupUnavailable,
    current?: () => void | Promise<void>,
  ): Promise<void> {
    const validate = async () => {
      this.deps.checkRunSource?.(error.runId);
      if (error instanceof ModelFundingUnavailable) {
        if (!this.deps.funding)
          throw new AuxError("capability_unsupported", "Original model funding is unavailable.");
        await this.deps.funding.assertModelUnavailable(error);
      } else if (error instanceof ResourceFundingUnavailable) {
        const funding = this.deps.funding;
        if (!funding) throw new AuxError("capability_unsupported", "Original run funding is unavailable.");
        funding.assertResourceOwner(error);
      } else {
        if (!current)
          throw new AuxError("permission_denied", "Original cloud usage-limit authority is unavailable.");
        await current();
      }
    };
    await validate();
    const rootId = runRoot(this.deps.repo, error.runId, true);
    const control = this.controls.get(rootId);
    if (!control || control.abort.signal.aborted)
      return Promise.reject(new AuxError("cancelled", "Original cloud owner stopped."));
    if (control.resourceContinuation) return control.resourceContinuation;
    const pending = Promise.resolve()
      .then(async () => {
        const resumePeers = await this.deps.pauseFamily?.(
          rootId,
          error instanceof ModelFundingUnavailable
            ? "Model funding capability needs review"
            : "Cloud resource funding needs review",
        );
        await validate();
        if (control.abort.signal.aborted) throw new AuxError("cancelled", "Original cloud owner stopped.");
        this.retirePendingProofs(rootId);
        control.budgetInterrupted = true;
        control.interruptPlanning?.();
        control.dispatchAbort?.abort(BUDGET_INTERRUPTION);
        // The original aborted signal remains the immutable retirement witness.
        control.dispatchAbort = new AbortController();
        const run = this.get(rootId);
        const suspension = this.suspensions.park({
          runId: rootId,
          turnId: rootId,
          threadId: run.config?.chatId ?? rootId,
          kind: "handoff",
          request: {
            kind: "handoff",
            ...(error instanceof ModelFundingUnavailable
              ? { modelLimits: error.proof }
              : error instanceof ResourceFundingUnavailable
                ? { resourceFunding: error.funding }
                : error instanceof CloudSetupUnavailable
                  ? { cloudSetup: error.proof }
                  : { resourceLimits: error.proof }),
            instruction: error.message,
            guidance:
              error instanceof ModelFundingUnavailable
                ? "Stop this run before changing model connections. An answer or budget increase cannot supply a missing provider bound."
                : error instanceof CloudSetupUnavailable
                  ? "Continue locally or stop this run. Configure Cloud in Settings, then use Retry Cloud setup here. An answer cannot authorize account setup."
                  : "Continue locally, stop this run, or configure a verified cloud resource envelope. An answer or budget increase cannot authorize an unenforceable envelope.",
          },
        });
        const continued = new Promise<void>((resolve) => {
          const stopped = () => resolve();
          control.abort.signal.addEventListener("abort", stopped, { once: true });
          control.resourceWaiter = {
            suspensionId: suspension.suspensionId,
            validate,
            retryReady: error instanceof CloudSetupUnavailable ? error.ready : undefined,
            resolve: () => {
              control.abort.signal.removeEventListener("abort", stopped);
              resolve();
            },
          };
        });
        await this.setStatus(rootId, "needs_input", error.message);
        await continued;
        if (control.abort.signal.aborted) throw new AuxError("cancelled", "Original cloud owner stopped.");
        control.budgetInterrupted = false;
        await resumePeers?.();
      })
      .finally(() => {
        if (control.resourceContinuation === pending) {
          control.resourceContinuation = undefined;
          control.resourceWaiter?.resolve();
          control.resourceWaiter = undefined;
        }
      });
    control.resourceContinuation = pending;
    return pending;
  }

  activeRunIds(): string[] {
    return [...new Set([...this.controls.keys(), ...this.executions.keys()])];
  }

  close(): Promise<void> {
    this.closed = true;
    const ids = this.activeRunIds();
    const continuations = [...this.controls.values()].flatMap((control) =>
      [control.resourceContinuation, control.budgetContinuation].filter(
        (pending): pending is Promise<void> => !!pending,
      ),
    );
    const executions = [...this.executions.values()];
    // Revoke every original control and proof before yielding to cleanup ACKs.
    for (const id of ids) {
      const control = this.controls.get(id);
      if (control && recoverablePark(this.deps.repo, id)) control.preserveParkOnShutdown = true;
      control?.abort.abort();
      control?.dispatchAbort?.abort();
      if (control?.deadlineTimer) clearTimeout(control.deadlineTimer);
      control?.budgetWaiter?.resolve();
      control?.answerWaiter?.resolve("");
    }
    const proofFailures: unknown[] = [];
    for (const id of ids) {
      try {
        if (this.deps.repo.getRun(id)) {
          if (this.controls.get(id)?.preserveParkOnShutdown) retireParkedProofs(this.deps.repo, id);
          else this.retirePendingProofs(id);
        }
      } catch (error) {
        proofFailures.push(error);
      }
    }
    return Promise.allSettled([...continuations, ...executions]).then((settled) => {
      const failures = [
        ...proofFailures,
        ...settled.flatMap((result) =>
          result.status === "rejected" &&
          !(result.reason instanceof AuxError && result.reason.code === "cancelled") &&
          !(result.reason instanceof Error && result.reason.name === "AbortError")
            ? [result.reason]
            : [],
        ),
      ];
      if (failures.length) throw new AggregateError(failures, "Run execution shutdown did not complete.");
      for (const key of this.heldLeases) this.leases.release(key, this.leaseOwner);
      this.heldLeases.clear();
      this.controls.clear();
      this.answers.clear();
    });
  }

  useLocalExecution(runId: string, suspensionId: string, originalOwner: () => Promise<void>): Promise<Run> {
    return this.resolveCloudHandoff(runId, suspensionId, originalOwner, "local");
  }

  retryCloudSetup(runId: string, suspensionId: string, originalOwner: () => Promise<void>): Promise<Run> {
    return this.resolveCloudHandoff(runId, suspensionId, originalOwner, "cloud");
  }

  private async resolveCloudHandoff(
    runId: string,
    suspensionId: string,
    originalOwner: () => Promise<void>,
    target: "local" | "cloud",
  ): Promise<Run> {
    return withRunAuthorityMutation(
      this.deps.repo,
      async () => {
        await originalOwner();
        await this.restoreDecisionControl(runId, suspensionId);
        const restored = this.restoredDecisions.has(runId);
        const control = this.controls.get(runId);
        const waiter = control?.resourceWaiter;
        const pending = this.suspensions.pending(runId);
        const root = this.get(runId);
        if (
          runRoot(this.deps.repo, runId, true) !== runId ||
          !control ||
          control.abort.signal.aborted ||
          (!restored && waiter?.suspensionId !== suspensionId) ||
          pending?.suspensionId !== suspensionId ||
          pending.kind !== "handoff" ||
          (!pending.request.resourceFunding &&
            !pending.request.resourceLimits &&
            !pending.request.cloudSetup) ||
          (target === "cloud" && (!pending.request.cloudSetup || (!restored && !waiter?.retryReady))) ||
          root.status !== "needs_input" ||
          root.config?.executionTarget !== "cloud"
        )
          throw new AuxError("ref_stale", "The original cloud resource handoff is no longer pending.");
        const family = lineageRuns(this.deps.repo, runId);
        const snapshots = family.map((id) => ({ id, config: JSON.stringify(this.get(id).config) }));
        const validate = async () => {
          await originalOwner();
          if (restored)
            await this.deps.agentLoop?.cloudExecutor?.recoverReview?.(
              { runId, threadId: root.config?.chatId ?? runId, turnId: runId },
              pending.request,
              target,
            );
          else await waiter!.validate();
          if (
            control.abort.signal.aborted ||
            (!restored && control.resourceWaiter !== waiter) ||
            this.get(runId).status !== "needs_input" ||
            this.suspensions.pending(runId)?.suspensionId !== suspensionId ||
            JSON.stringify(lineageRuns(this.deps.repo, runId)) !== JSON.stringify(family) ||
            snapshots.some(({ id, config }) => JSON.stringify(this.get(id).config) !== config)
          )
            throw new AuxError("ref_stale", "The original cloud family changed during cleanup.");
        };
        await validate();
        const cloud = this.deps.agentLoop?.cloudExecutor;
        if (!cloud || (restored && !cloud.recoverReview))
          throw new AuxError("capability_unsupported", "Original cloud cleanup is unavailable.");
        // Cleanup is real even when the request was refused before starting a VM.
        // Any ambiguous stop keeps the cloud mode, handoff and funding holds intact.
        for (const id of family) await cloud.closeRun(id);
        await validate();
        if (target === "cloud") {
          if (!restored) await waiter!.retryReady!();
          await validate();
        }
        this.deps.repo.transaction(() => {
          for (const id of family) {
            const run = this.get(id);
            if (id !== runId && TERMINAL_STATUSES.has(run.status)) continue;
            if (!run.config) throw new AuxError("ref_stale", "Original run configuration is unavailable.");
            run.config.executionTarget = target;
            if (id === runId) {
              run.status = "running";
              run.statusMessage = target === "local" ? "Continuing locally" : "Retrying Cloud setup";
            }
            this.deps.repo.saveRun(run);
          }
          this.suspensions.resolve(suspensionId, "answered");
        });
        this.deps.events.emit(
          EventTypes.RunStatus,
          {
            runId,
            status: "running",
            message: target === "local" ? "Continuing locally" : "Retrying Cloud setup",
          },
          runId,
        );
        this.deps.events.emit(EventTypes.RunUpdated, { run: this.get(runId) }, runId);
        if (restored) this.startRestoredDecision(runId);
        else waiter!.resolve();
        return this.get(runId);
      },
      runId,
    );
  }

  private async parkBudget(runId: string, budget: BudgetSuspension): Promise<void> {
    const control = this.controls.get(runId);
    if (!control || control.abort.signal.aborted) throw new AuxError("cancelled", "run cancelled");
    const run = this.get(runId);
    const resumePeers = await this.deps.pauseFamily?.(runId, "Parent budget reached");
    this.retirePendingProofs(runId);
    control.budgetInterrupted = true;
    control.interruptPlanning?.();
    control.dispatchAbort?.abort(BUDGET_INTERRUPTION);
    const suspension = this.suspensions.park({
      runId,
      turnId: runId,
      threadId: run.config?.chatId ?? runId,
      kind: "budget",
      request: {
        kind: "budget",
        budget,
        instruction: "The configured budget has been reached.",
        guidance: "Raise the limit and choose Continue, or stop this run.",
      },
    });
    const continued = new Promise<void>((resolve) => {
      control.budgetWaiter = { suspensionId: suspension.suspensionId, resolve };
    });
    run.status = "needs_input";
    run.statusMessage = "Budget reached — waiting for Continue";
    this.deps.repo.saveRun(run);
    this.deps.events.emit(
      EventTypes.RunStatus,
      { runId, status: run.status, message: run.statusMessage },
      runId,
    );
    this.deps.events.emit(EventTypes.RunUpdated, { run }, runId);
    this.releasePages(runId, true);
    await continued;
    if (control.abort.signal.aborted) throw new AuxError("cancelled", "run cancelled");
    if (control.dispatchAbort?.signal.aborted) control.dispatchAbort = new AbortController();
    await resumePeers?.();
    await this.waitIfPaused(control, runId);
  }

  async checkModelBudget(runId: string, excludeRunLimit = false): Promise<void> {
    this.deps.checkRunSource?.(runId);
    await this.deps.checkSharedBudget?.(runId);
    while (true) {
      try {
        await this.deps.checkBudget?.({ runId, ...(excludeRunLimit ? { excludeRunLimit: true } : {}) });
        return;
      } catch (error) {
        const detail = error instanceof AuxError ? error.detail : undefined;
        if (
          !(error instanceof AuxError) ||
          error.code !== "permission_denied" ||
          !detail ||
          typeof detail !== "object" ||
          !("scope" in detail) ||
          !("limitUsd" in detail) ||
          !("spentUsd" in detail) ||
          !["run", "day", "month", "routine", "nightShift"].includes(String(detail.scope)) ||
          typeof detail.limitUsd !== "number" ||
          !Number.isFinite(detail.limitUsd) ||
          detail.limitUsd <= 0 ||
          typeof detail.spentUsd !== "number" ||
          !Number.isFinite(detail.spentUsd) ||
          detail.spentUsd < 0
        )
          throw error;
        await this.pauseForBudget(runId, {
          reason: "spend",
          limit: detail.limitUsd,
          used: detail.spentUsd,
          scope: detail.scope as BudgetSuspension["scope"],
        });
        throw new AuxError("cancelled", "Budget continuation requires a fresh observation.");
      }
    }
  }

  async continueBudget(
    runId: string,
    suspensionId: string,
    limits?: {
      maxModelCalls?: number;
      maxSteps?: number;
      deadlineMs?: number;
      funding?: import("../services/run-funding.js").FundingLimits;
    },
    originalOwner?: () => Promise<void>,
  ): Promise<Run> {
    const original = this.suspensions.pending(runId);
    if (
      !original ||
      original.kind !== "budget" ||
      original.suspensionId !== suspensionId ||
      !original.request.budget
    )
      throw new AuxError("conflict", "The budget request changed.");
    return withRunAuthorityMutation(
      this.deps.repo,
      async () => {
        if (!this.controls.has(runId) || this.restoredDecisions.has(runId)) {
          if (this.get(runId).config?.nativeTurnContext && !originalOwner)
            throw new AuxError("permission_denied", "Continue this restored budget from Aux.");
          await originalOwner?.();
          await this.restoreDecisionControl(runId, suspensionId);
        }
        await this.deps.checkBudget?.({
          runId,
          requiredUsd: original.request.budget!.requiredUsd,
          ...(original.request.budget!.funding && this.deps.funding?.rootCostOwned(runId)
            ? { excludeRunLimit: true }
            : {}),
        });
        const control = this.controls.get(runId);
        const run = this.get(runId);
        const current = this.suspensions.pending(runId);
        if (
          !control ||
          control.abort.signal.aborted ||
          control.paused ||
          run.status !== "needs_input" ||
          (!this.restoredDecisions.has(runId) && control.budgetWaiter?.suspensionId !== suspensionId) ||
          current?.suspensionId !== suspensionId ||
          JSON.stringify(current) !== JSON.stringify(original)
        )
          throw new AuxError("conflict", "The original budget request is no longer pending.");
        await originalOwner?.();
        this.deps.checkRunSource?.(runId);
        if (this.suspensions.pending(runId)?.suspensionId !== suspensionId || control.abort.signal.aborted)
          throw new AuxError("ref_stale", "The budget request changed during validation.");
        const budget = original.request.budget!;
        const field =
          budget.reason === "model_calls"
            ? "maxModelCalls"
            : budget.reason === "steps"
              ? "maxSteps"
              : budget.reason === "time"
                ? "deadlineMs"
                : undefined;
        if (Object.keys(limits ?? {}).some((key) => key !== (budget.funding ? "funding" : field)))
          throw new AuxError("invalid_params", "Change only the limit for this budget request.");
        const limit = field && !budget.funding ? (limits?.[field] ?? run.config?.[field] ?? 0) : undefined;
        const used = budget.reason === "time" ? Date.now() - (run.startedAt ?? run.createdAt) : budget.used;
        if (
          field &&
          !budget.funding &&
          (limit === undefined ||
            !Number.isSafeInteger(limit) ||
            limit < 0 ||
            (limit !== 0 && limit <= Math.max(used, budget.limit)))
        )
          throw new AuxError("conflict", "Raise the configured limit before continuing.");
        run.config = { ...run.config, ...(field && !budget.funding ? { [field]: limit } : {}) };
        run.status = "running";
        run.statusMessage = "Continuing after budget review";
        let deadlines: { runId: string; deadlineMs: number }[] = [];
        this.deps.repo.transaction(() => {
          if (budget.funding) {
            if (!this.deps.funding)
              throw new AuxError("capability_unsupported", "Original funding is unavailable.");
            deadlines = this.deps.funding.continue(runId, budget, limits?.funding);
            run.config = this.get(runId).config;
          }
          this.suspensions.resolve(suspensionId, "answered");
          this.deps.repo.saveRun(run);
        });
        if (budget.reason === "time" && !budget.funding) this.armDeadline(runId, control, limit);
        for (const deadline of deadlines) {
          const ownerControl = this.controls.get(deadline.runId);
          if (ownerControl) this.armDeadline(deadline.runId, ownerControl, deadline.deadlineMs);
        }
        const waiter = control.budgetWaiter;
        control.budgetWaiter = undefined;
        this.deps.events.emit(EventTypes.RunUpdated, { run }, runId);
        this.deps.events.emit(
          EventTypes.RunStatus,
          { runId, status: run.status, message: run.statusMessage },
          runId,
        );
        control.budgetInterrupted = false;
        if (this.restoredDecisions.has(runId)) this.startRestoredDecision(runId);
        else waiter!.resolve();
        return run;
      },
      runId,
    );
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
    c.dispatchAbort?.abort(TAKEOVER_INTERRUPTION);
    c.budgetWaiter?.resolve();
    c.budgetWaiter = undefined;
    c.answerWaiter?.resolve("Page control changed; the pending action was cancelled.");
    this.deps.browserEgress?.suspendRun(runId);
  }

  interruptForBudget(runId: string): void {
    const c = this.controls.get(runId);
    if (!c || c.abort.signal.aborted) return;
    c.paused = true;
    c.budgetInterrupted = true;
    c.interruptPlanning?.();
    c.dispatchAbort?.abort(BUDGET_INTERRUPTION);
    c.answerWaiter?.resolve("");
    this.releasePages(runId, true);
  }

  async bindRestartOwner(
    runId: string,
    suspensionId: string,
    token: string,
    currentOwner: () => Promise<void>,
  ): Promise<void> {
    if (this.controls.has(runId) && !this.restoredDecisions.has(runId)) {
      if (this.get(runId).config?.nativeTurnContext !== token)
        throw new AuxError("permission_denied", "The original Aux owner changed.");
      await currentOwner();
      return;
    }
    const pending = recoverablePark(this.deps.repo, runId),
      run = this.get(runId),
      snapshot = JSON.stringify(run);
    if (this.closed || !token || pending?.suspensionId !== suspensionId)
      throw new AuxError("ref_stale", "The original parked request changed.");
    await currentOwner();
    const source = await this.deps.turnMentions.begin(
      runId,
      run.config?.mentions ?? [],
      this.ownedPages(runId),
      {
        nativeTurnContext: token,
        workspaceId: run.config?.contextWorkspaceId,
        privateTask: run.config?.privateTask,
        sourcePageIds: run.pageIds,
        taskId: run.config?.taskId,
        taskRevision: run.config?.taskRevision,
      },
    );
    try {
      await this.deps.turnMentions.assertRestartOwner(runId);
      await currentOwner();
      if (
        this.deps.turnMentions.capture(runId) !== source.token ||
        this.closed ||
        (this.controls.has(runId) && !this.restoredDecisions.has(runId)) ||
        JSON.stringify(this.get(runId)) !== snapshot ||
        this.suspensions.pending(runId)?.suspensionId !== suspensionId
      )
        throw new AuxError("ref_stale", "The original parked run changed during owner binding.");
      run.config = { ...run.config, nativeTurnContext: token };
      this.deps.repo.saveRun(run);
    } catch (error) {
      this.deps.turnMentions.endIfCurrent(runId, source.token);
      throw error;
    }
  }

  private async restoreDecisionControl(runId: string, suspensionId: string): Promise<void> {
    if (this.controls.has(runId)) return;
    const run = this.get(runId),
      pending = recoverablePark(this.deps.repo, runId),
      snapshot = JSON.stringify(run);
    if (this.closed || pending?.suspensionId !== suspensionId)
      throw new AuxError("ref_stale", "The durable continuation is unavailable.");
    this.deps.checkRunSource?.(runId);
    await this.deps.turnMentions.begin(runId, run.config?.mentions ?? [], this.ownedPages(runId), {
      nativeTurnContext: run.config?.nativeTurnContext,
      workspaceId: run.config?.contextWorkspaceId,
      privateTask: run.config?.privateTask,
      sourcePageIds: run.pageIds,
      taskId: run.config?.taskId,
      taskRevision: run.config?.taskRevision,
    });
    if (this.controls.has(runId)) return;
    if (
      this.closed ||
      JSON.stringify(this.get(runId)) !== snapshot ||
      this.suspensions.pending(runId)?.suspensionId !== suspensionId
    )
      throw new AuxError("ref_stale", "The durable continuation changed during source validation.");
    const keys = [`run:${runId}`, ...(run.config?.taskId ? [`task:${run.config.taskId}`] : [])];
    const acquired: string[] = [];
    try {
      for (const key of keys) {
        this.leases.acquire(key, this.leaseOwner);
        this.heldLeases.add(key);
        acquired.push(key);
      }
    } catch (error) {
      for (const key of acquired) {
        this.leases.release(key, this.leaseOwner);
        this.heldLeases.delete(key);
      }
      throw error;
    }
    this.controls.set(runId, {
      abort: new AbortController(),
      dispatchAbort: new AbortController(),
      paused: false,
    });
    this.restoredDecisions.add(runId);
  }

  private startRestoredDecision(runId: string): void {
    const control = this.controls.get(runId);
    if (!this.restoredDecisions.delete(runId) || !control || control.abort.signal.aborted)
      throw new AuxError("cancelled", "The restored continuation stopped.");
    if (control.deadlineTimer) clearTimeout(control.deadlineTimer);
    this.controls.delete(runId);
    this.launchRun(this.get(runId));
  }

  async retryModelSetup(
    runId: string,
    suspensionId: string,
    originalOwner: () => Promise<void>,
  ): Promise<Run> {
    return withRunAuthorityMutation(
      this.deps.repo,
      async () => {
        await originalOwner();
        await this.restoreDecisionControl(runId, suspensionId);
        const pending = this.suspensions.pending(runId),
          run = this.get(runId),
          config = JSON.stringify(run.config);
        const proof = pending?.request.modelLimits;
        const reviewedRun = proof && this.deps.repo.getRun(proof.runId);
        if (
          pending?.suspensionId !== suspensionId ||
          !proof ||
          !lineageRuns(this.deps.repo, runId).includes(proof.runId) ||
          !reviewedRun ||
          (reviewedRun.config?.modelId ?? this.deps.defaultModel()) !== proof.modelId ||
          !this.deps.funding
        )
          throw new AuxError("ref_stale", "The original model review changed.");
        await this.deps.funding.assertModelAdmission(proof.runId, proof.modelId);
        await originalOwner();
        this.deps.checkRunSource?.(runId);
        if (
          JSON.stringify(this.get(runId).config) !== config ||
          JSON.stringify(this.deps.repo.getRun(proof.runId)?.config) !== JSON.stringify(reviewedRun.config) ||
          this.suspensions.pending(runId)?.suspensionId !== suspensionId
        )
          throw new AuxError("ref_stale", "The original model review changed during validation.");
        const control = this.controls.get(runId);
        const restored = this.restoredDecisions.has(runId);
        if (
          !control ||
          control.abort.signal.aborted ||
          (!restored && control.resourceWaiter?.suspensionId !== suspensionId)
        )
          throw new AuxError("ref_stale", "The original model continuation changed.");
        this.suspensions.resolve(suspensionId, "answered");
        run.status = "running";
        run.statusMessage = "Retrying the reviewed model route";
        this.deps.repo.saveRun(run);
        if (restored) this.startRestoredDecision(runId);
        else control.resourceWaiter!.resolve();
        return this.get(runId);
      },
      runId,
    );
  }

  private rehydrateParkedRun(runId: string): void {
    if (this.controls.has(runId)) return;
    const run = this.get(runId);
    const parked = new TranscriptStore(this.deps.repo.db, this.deps.repo.columnCipher).openPark(runId);
    if (this.closed || run.status !== "needs_input" || run.config?.implementation !== "agent-loop" || !parked)
      throw new AuxError("conflict", "The original run has no recoverable parked call.");
    const pending = this.suspensions.pending(runId);
    if (
      pending &&
      (pending.kind === "budget" ||
        pending.request.resourceFunding ||
        pending.request.resourceLimits ||
        pending.request.cloudSetup ||
        pending.request.modelLimits)
    )
      throw new AuxError("conflict", "This suspension requires its original dedicated continuation.");
    this.deps.checkRunSource?.(runId);
    const taskLease = run.config?.taskId ? `task:${run.config.taskId}` : undefined;
    if (taskLease) {
      this.leases.acquire(taskLease, this.leaseOwner);
      this.heldLeases.add(taskLease);
    }
    try {
      this.launchRun(run);
    } catch (error) {
      if (taskLease) {
        this.leases.release(taskLease, this.leaseOwner);
        this.heldLeases.delete(taskLease);
      }
      throw error;
    }
  }

  async resume(runId: string): Promise<Run> {
    if (this.suspensions.pending(runId)?.kind === "budget")
      throw new AuxError("conflict", "Use Continue on the current budget request.");
    if (!this.controls.has(runId)) this.rehydrateParkedRun(runId);
    const c = this.controls.get(runId);
    const run = this.get(runId);
    if (!c || c.abort.signal.aborted)
      throw new AuxError("conflict", "The original run control is unavailable.");

    if (c?.paused) {
      c.paused = false;
      c.budgetInterrupted = false;
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
      c.budgetWaiter?.resolve();
      c.budgetWaiter = undefined;
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
        if (this.deps.turnMentions.hasPageSelection(runId))
          run.pageIds = this.deps.turnMentions.selectedPages(runId);
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
    this.deps.checkRunSource?.(runId);
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
    if (this.deps.turnMentions.has(runId)) this.deps.turnMentions.created(runId, pageId);
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
        const validated = MentionRefsSchema.parse(mentions);
        if (
          this.deps.turnMentions.has(runId) &&
          JSON.stringify(validated) === JSON.stringify(run.config?.mentions ?? [])
        ) {
          const original = JSON.stringify(run);
          await this.deps.turnMentions.revalidateSelection(runId);
          recheck();
          if (JSON.stringify(this.get(runId)) !== original)
            throw new AuxError("ref_stale", "The original answer changed during source validation.");
          return this.answer(runId, answer);
        }
        const owned = this.ownedPages(runId);
        return this.deps.turnMentions.acknowledge(
          runId,
          validated,
          owned,
          {
            workspaceId: run.config?.contextWorkspaceId,
            nativeTurnContext: run.config?.nativeTurnContext,
            privateTask: run.config?.privateTask,
            sourcePageIds:
              run.config?.setMemberSource ||
              run.config?.projectRoot ||
              run.config?.subagentProfile ||
              (run.config?.privateTask && run.pageIds.length)
                ? run.pageIds
                : undefined,
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
        const pending = this.suspensions.pending(runId);
        if (
          pending?.request.resourceFunding ||
          pending?.request.resourceLimits ||
          pending?.request.cloudSetup ||
          pending?.request.modelLimits
        )
          throw new AuxError(
            "conflict",
            pending.request.modelLimits
              ? "Stop this run before changing the model connection; an answer cannot supply the missing provider bound."
              : "Use Continue locally on the original cloud resource handoff.",
          );
        if (pending?.kind === "budget")
          throw new AuxError("conflict", "Use Continue on the current budget request.");
        if (!this.controls.has(runId)) {
          this.answers.set(runId, answer);
          try {
            this.rehydrateParkedRun(runId);
          } catch (error) {
            this.answers.delete(runId);
            throw error;
          }
          return this.get(runId);
        }
        const c = this.controls.get(runId);
        const run = this.get(runId);
        if (run.status === "needs_input") await this.setStatus(runId, "running", `Answer received`);
        if (c?.answerWaiter) {
          this.answers.delete(runId);
          c.answerWaiter.resolve(answer);
        } else this.answers.set(runId, answer);
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

  isBudgetInterruption(signal: AbortSignal): boolean {
    return signal.aborted && signal.reason === BUDGET_INTERRUPTION;
  }

  async waitForAnswer(c: RunControl, runId: string): Promise<string> {
    // Status publication can let an acknowledged correction retire dispatch
    // before this waiter is installed. Its old question must not park again.
    if (c.dispatchAbort?.signal.aborted || c.abort.signal.aborted) return "";
    if (c.takeoverInterrupted) {
      await this.waitIfPaused(c, runId);
      return "Page control changed; the pending action was cancelled.";
    }
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
    if (!c.abort.signal.aborted) await this.waitIfPaused(c, runId);
    return answer;
  }

  /**
   * Run body — the planner loop (observe → plan → authorize → dispatch →
   * verify) or the S5 tool loop when the run's engine is `agent-loop`.
   */
  private async initializeRun(runId: string, control: RunControl, signal: AbortSignal) {
    const run = this.get(runId);
    await this.deps.prepareSources?.(run, signal);
    if (signal.aborted) throw new AuxError("cancelled", "Original source preparation was interrupted.");
    const preparedRun = this.get(runId);
    run.pageIds = preparedRun.pageIds;
    run.config = preparedRun.config;
    await this.deps.turnMentions.begin(runId, run.config?.mentions ?? [], this.ownedPages(runId), {
      workspaceId: run.config?.contextWorkspaceId,
      nativeTurnContext: run.config?.nativeTurnContext,
      privateTask: run.config?.privateTask,
      sourcePageIds:
        run.config?.setMemberSource ||
        run.config?.projectRoot ||
        run.config?.externalParentRunId ||
        run.config?.subagentProfile ||
        (run.config?.privateTask && run.pageIds.length)
          ? run.pageIds
          : undefined,
      taskId: run.config?.taskId,
      taskRevision: run.config?.taskRevision,
    });
    if (run.config?.privateTask && !run.config?.isolatedPageSources) {
      run.pageIds = this.deps.turnMentions.sourcePages(runId).map((page) => page.pageId);
      this.deps.repo.saveRun(run);
    } else if (run.config?.nativeTurnContext || this.deps.turnMentions.hasPageSelection(runId)) {
      run.pageIds = this.deps.turnMentions.selectedPages(runId);
      this.deps.repo.saveRun(run);
    }
    if (this.deps.turnMentions.unavailableImplicitPages(runId).length) {
      const message =
        "Some browser tabs are still loading and were omitted from this run’s context. Open them before mentioning them.";
      run.statusMessage = message;
      this.deps.repo.saveRun(run);
      this.deps.events.emit(EventTypes.RunStatus, { runId, status: run.status, message }, runId);
    }
    await this.acquirePages(runId);
    if (this.get(runId).config?.privateTask && !this.deps.privateBrowserProfile) {
      const current = this.get(runId);
      await this.deps.turnMentions.begin(runId, current.config?.mentions ?? [], this.ownedPages(runId), {
        workspaceId: current.config?.contextWorkspaceId,
        nativeTurnContext: current.config?.nativeTurnContext,
        privateTask: true,
        sourcePageIds: this.ownedPages(runId),
        taskId: current.config?.taskId,
        taskRevision: current.config?.taskRevision,
      });
    }
    if (signal.aborted) throw new AuxError("cancelled", "Original initialization was interrupted.");
    await this.waitIfPaused(control, runId);
    if (signal.aborted) throw new AuxError("cancelled", "Original initialization was interrupted.");
  }

  private async loop(runId: string) {
    const control = this.controls.get(runId)!;
    try {
      while (true) {
        const dispatch = control.dispatchAbort!;
        const signal = AbortSignal.any([control.abort.signal, dispatch.signal]);
        try {
          await this.initializeRun(runId, control, signal);
          break;
        } catch (error) {
          if (
            control.abort.signal.aborted ||
            this.controls.get(runId) !== control ||
            !dispatch.signal.aborted ||
            ![BUDGET_INTERRUPTION, TAKEOVER_INTERRUPTION].includes(dispatch.signal.reason)
          )
            throw error;
          this.deps.checkRunSource?.(runId);
          const takeover = dispatch.signal.reason === TAKEOVER_INTERRUPTION;
          if (!takeover && control.deadlineHit) {
            const run = this.get(runId);
            await this.pauseForBudget(runId, {
              reason: "time",
              limit: run.config?.deadlineMs ?? 0,
              used: Date.now() - (run.startedAt ?? run.createdAt),
            });
          } else if (!takeover) await this.deps.checkSharedBudget?.(runId);
          while (control.paused && !control.abort.signal.aborted)
            await new Promise((resolve) => setTimeout(resolve, 120));
          if (control.abort.signal.aborted || this.controls.get(runId) !== control)
            throw new AuxError("cancelled", "The original run stopped before initialization resumed.");
          this.deps.checkRunSource?.(runId);
          control.dispatchAbort = new AbortController();
          control.budgetInterrupted = false;
          if (takeover) control.takeoverInterrupted = false;
        }
      }
      await runToolLoop(this, runId);
    } finally {
      this.deps.turnMentions.end(runId);
      this.releasePages(runId);
    }
  }

  private async acquirePages(runId: string): Promise<void> {
    if (this.pageReleases.has(runId)) return;
    const control = this.controls.get(runId);
    if (!control) throw new AuxError("cancelled", "run has ended");
    const external = this.externalPageOwners.get(control);
    if (external) {
      const run = this.get(runId);
      if (
        control.abort.signal.aborted ||
        run.config?.implementation !== "external-agent" ||
        external.runId !== runId ||
        run.config.externalConnectionId !== external.connectionId ||
        run.config.taskId !== external.taskId ||
        run.config.taskRevision !== external.taskRevision ||
        run.config.externalRetirementPending ||
        TERMINAL_STATUSES.has(run.status)
      )
        throw new AuxError("cancelled", "The original external utility participant retired.");
      // The API holds and revalidates the exact external lease and task-read proof.
      // Financial pause/Continue must not adopt those pages as coordinator-owned.
      return;
    }
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
      if (
        this.deps.browserEgress &&
        !run.config?.isolatedPageSources &&
        ((run.config?.privateTask && !this.deps.privateBrowserProfile) || !!run.config?.setMemberSource)
      ) {
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
            AbortSignal.any([
              control.abort.signal,
              ...(control.dispatchAbort ? [control.dispatchAbort.signal] : []),
            ]),
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
    // Financial pause and retirement still fence the original run's network authority.
    if (suspend) this.deps.browserEgress?.suspendRun(runId);
    else this.deps.browserEgress?.revokeRun(runId);
    const control = this.controls.get(runId);
    // The API participant joins/releases its own external page claim.
    if (control && this.externalPageOwners.has(control)) return;
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
    for (const runId of activeRunIds(this.deps.repo)) {
      const run = this.get(runId);
      const c = this.controls.get(run.runId);
      if (c) {
        c.abort.abort();
        c.budgetWaiter?.resolve();
        c.budgetWaiter = undefined;
        c.answerWaiter?.resolve("");
      }
      await this.finish(run.runId, "failed", undefined, reason, "Stopped by a runtime fault");
      failed.push(run.runId);
    }
    return failed;
  }

  async markInterrupted() {
    await markInterruptedRuns(this.deps.repo);
  }
}
