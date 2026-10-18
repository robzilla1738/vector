import { randomUUID } from "node:crypto";
import { AuxError, EventTypes, type Run, type RunContextState, type RunContextStats } from "@aux/contracts";
import {
  contextAuthorityHash,
  prepareConversationContext,
  type ContextCompactionControl,
} from "../agent/loop/compaction.js";
import { TranscriptStore } from "../agent/loop/transcript.js";
import { projectLegacyRecall } from "../agent/loop/legacy-recall.js";
import type { Repo } from "../store/repo.js";
import type { EventBus } from "../events.js";

export type IdleCompactionExecution = (
  signal: AbortSignal,
  check: () => void,
  prepare: (summarize: Parameters<typeof prepareConversationContext>[0]["summarize"]) => Promise<void>,
) => Promise<void>;

type Job = { id: string; cancel: AbortController; work: Promise<void> };

/** Owns background summaries separately from user conversations and their agent controls. */
export class IdleConversationCompactions {
  private readonly jobs = new Map<string, Job>();
  constructor(
    private readonly deps: {
      repo: Repo;
      events: EventBus;
      checkSource: (runId: string) => void;
      authority: (run: Run) => string;
    },
  ) {}

  start(
    run: Run,
    stats: RunContextStats,
    options: Parameters<typeof prepareConversationContext>[0]["options"],
    summaryLimits: NonNullable<Parameters<typeof prepareConversationContext>[0]["summaryLimits"]>,
    execute: IdleCompactionExecution,
  ): RunContextStats {
    if (this.jobs.has(run.runId)) throw new AuxError("conflict", "Compaction is already running.");
    const request = { id: randomUUID(), reason: "manual" as const, cancel: new AbortController() };
    const control: ContextCompactionControl = { pending: request };
    const transcript = new TranscriptStore(this.deps.repo.db, this.deps.repo.columnCipher);
    const fingerprint = () => {
      const source = this.deps.repo.getRun(run.runId);
      if (!source || source.config?.contextMemoryRevoked)
        throw new AuxError("cancelled", "The original conversation was removed or forgotten.");
      const chatId = source.config?.chatId ?? source.runId;
      const conversation = this.deps.repo.getConversation(chatId);
      return contextAuthorityHash({
        source: { ...source, config: { ...source.config, contextCompaction: undefined } },
        authority: this.deps.authority(source),
        transcript: transcript.entries(run.runId),
        park: transcript.openPark(run.runId),
        task: source.config?.taskId
          ? this.deps.repo.db
              .prepare("SELECT revision,state FROM tasks WHERE task_id=?")
              .get(source.config.taskId)
          : undefined,
        todos: this.deps.repo.loadCheckpoint(`run:${run.runId}`, "loop_todos"),
        preference: this.deps.repo.getSetting(`conversationContext:${chatId}`),
        conversation: conversation && {
          archived: conversation.archived,
          privateTask: conversation.privateTask,
          title: conversation.title,
        },
        turns: this.deps.repo.listRuns(500, { chatId }).map((turn) => [turn.runId, turn.status]),
        effects: this.deps.repo.db.prepare("SELECT * FROM action_intents WHERE run_id=?").all(run.runId),
        invocations: this.deps.repo.db
          .prepare("SELECT * FROM operation_invocations WHERE run_id=?")
          .all(run.runId),
        approvals: this.deps.repo.db
          .prepare("SELECT * FROM safety_suspensions WHERE run_id=?")
          .all(run.runId),
      });
    };
    this.deps.checkSource(run.runId);
    const original = fingerprint();
    const check = () => {
      request.cancel.signal.throwIfAborted();
      this.deps.checkSource(run.runId);
      if (fingerprint() !== original)
        throw new AuxError("cancelled", "The original conversation, model, Space or effects changed.");
    };
    const publish = (state: RunContextState) => {
      check();
      const current = this.deps.repo.getRun(run.runId)!;
      this.save(current, state);
    };
    const next: RunContextStats = {
      ...stats,
      revision: stats.revision + 1,
      updatedAt: Date.now(),
      compaction: {
        id: request.id,
        reason: "manual",
        status: "queued",
        message: "Preparing the saved conversation.",
      },
    };
    const job: Job = { ...request, work: Promise.resolve() };
    this.jobs.set(run.runId, job);
    try {
      publish({ ...run.config?.contextCompaction, stats: next });
    } catch (error) {
      this.jobs.delete(run.runId);
      throw error;
    }
    job.work = Promise.resolve().then(async () => {
      try {
        await execute(request.cancel.signal, check, async (summarize) => {
          check();
          await prepareConversationContext({
            runId: run.runId,
            modelId: stats.modelId,
            transcript,
            projectTranscript: (messages) =>
              projectLegacyRecall(this.deps.repo, transcript, run.runId, messages),
            options,
            summaryLimits,
            inheritedReferenceBudget: 6_000,
            materialize: async (messages) => {
              const todos = this.deps.repo.loadCheckpoint(`run:${run.runId}`, "loop_todos") as
                { todos?: unknown } | undefined;
              return todos?.todos
                ? [
                    ...messages,
                    { role: "user", content: `Current durable plan:\n${JSON.stringify(todos.todos)}` },
                  ]
                : messages;
            },
            signal: request.cancel.signal,
            owner: {
              control,
              check,
              authority: () => this.deps.authority(this.deps.repo.getRun(run.runId)!),
              read: () => this.deps.repo.getRun(run.runId)?.config?.contextCompaction,
              publish,
            },
            summarize,
          });
          check();
          const final = this.deps.repo.getRun(run.runId)?.config?.contextCompaction?.stats;
          if (final?.compaction.status !== "completed")
            throw new AuxError("model_error", final?.compaction.message ?? "Compaction did not complete.");
        });
      } catch (error) {
        const current = this.deps.repo.getRun(run.runId);
        const state = current?.config?.contextCompaction;
        if (current && !current.config?.contextMemoryRevoked && state?.stats.compaction.id === request.id) {
          const cancelled =
            request.cancel.signal.aborted ||
            (error instanceof AuxError &&
              ["cancelled", "ref_stale", "permission_denied"].includes(error.code));
          this.save(current, {
            projection: run.config?.contextCompaction?.projection,
            stats: {
              ...stats,
              revision: state.stats.revision + 1,
              updatedAt: Date.now(),
              compaction: {
                ...state.stats.compaction,
                status: cancelled ? "cancelled" : "failed",
                message: cancelled
                  ? "Compaction cancelled; original history preserved."
                  : state.stats.compaction.status === "failed"
                    ? state.stats.compaction.message
                    : "Compaction could not safely reduce this context. Original history preserved.",
              },
            },
          });
        }
      } finally {
        this.jobs.delete(run.runId);
      }
    });
    return next;
  }

  async cancel(runId: string, compactionId: string): Promise<boolean> {
    const job = this.jobs.get(runId);
    if (!job) return false;
    if (job.id !== compactionId) throw new AuxError("conflict", "This compaction changed.");
    job.cancel.abort(new AuxError("cancelled", "The person cancelled context compaction."));
    await job.work;
    return true;
  }

  async retire(chatId?: string): Promise<void> {
    const jobs = [...this.jobs].filter(
      ([runId]) => !chatId || (this.deps.repo.getRun(runId)?.config?.chatId ?? runId) === chatId,
    );
    for (const [, job] of jobs)
      job.cancel.abort(new AuxError("cancelled", "The original conversation retired."));
    await Promise.all(jobs.map(([, job]) => job.work));
  }

  owns(runId: string): boolean {
    return this.jobs.has(runId);
  }

  hasConversation(chatId: string): boolean {
    return [...this.jobs.keys()].some(
      (runId) => (this.deps.repo.getRun(runId)?.config?.chatId ?? runId) === chatId,
    );
  }

  async retireWorkspace(workspaceId: string): Promise<void> {
    const chats = new Set(
      [...this.jobs.keys()].flatMap((runId) => {
        const run = this.deps.repo.getRun(runId);
        const chatId = run?.config?.chatId ?? runId;
        return run?.config?.contextWorkspaceId === workspaceId ||
          this.deps.repo.getSetting(`conversationWorkspace:${chatId}`) === workspaceId
          ? [chatId]
          : [];
      }),
    );
    await Promise.all([...chats].map((chatId) => this.retire(chatId)));
  }

  private save(run: Run, contextCompaction: RunContextState) {
    run.config = { ...run.config, contextCompaction };
    this.deps.repo.saveRun(run);
    this.deps.events.emit(EventTypes.RunContextChanged, { ...contextCompaction.stats }, run.runId);
  }
}
