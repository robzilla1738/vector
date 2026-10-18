import { withRunAuthorityMutation } from "./overnight-authority.js";
import {
  AuxError,
  EventTypes,
  newRunId,
  taskConversationId,
  type PageContextRef,
  MentionRefsSchema,
  type MentionRef,
  type Run,
  type RunMessage,
} from "@aux/contracts";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";
import { TaskService } from "./tasks.js";
import { SendJournal, type SendRecord } from "../safety/send-journal.js";

const active = new Set<Run["status"]>(["queued", "planning", "running", "paused", "needs_input"]);

export type QueueMessageInput = {
  messageId: string;
  runId: string;
  chatId: string;
  text: string;
  pageIds: string[];
  contextPageRefs: PageContextRef[];
  mentions?: MentionRef[];
  expectedRevision: number;
  /** This send supersedes an earlier message id — the nonce chain (04-A). */
  resendsMessageId?: string;
};

/** Serialized user follow-ups. A stable delivery run ID makes restart replay idempotent. */
export class RunMessageQueue {
  private readonly sendJournal: SendJournal;
  private draining = new Set<string>();
  private rerun = new Set<string>();
  private inFlight = new Set<Promise<void>>();
  private stopped = false;
  private unsubscribe: () => void;

  constructor(
    private repo: Repo,
    private events: EventBus,
    private start: (message: RunMessage) => Promise<Run>,
    private canSteer: (runId: string) => boolean,
    private signalSteer: (runId: string) => void,
  ) {
    this.sendJournal = new SendJournal(repo.db, repo.columnCipher);
    this.unsubscribe = events.subscribe((event) => {
      if (event.type !== EventTypes.RunUpdated) return;
      const run = event.payload.run as Run | undefined;
      if (run?.config?.chatId && !active.has(run.status)) this.schedule(run.config.chatId);
    });
  }

  list(chatId: string): RunMessage[] {
    return this.repo.listRunMessages(chatId);
  }
  messageStatus(nonce: string): SendRecord | undefined {
    const message = this.repo.getRunMessage(nonce);
    if (message) this.syncJournal(message);
    return this.sendJournal.messageStatus(nonce);
  }

  queue(input: QueueMessageInput): RunMessage {
    const mentions = MentionRefsSchema.parse(input.mentions ?? []);
    const message = this.repo.transaction(() => {
      const previous = this.repo.getRunMessage(input.messageId);
      if (previous) {
        if (
          previous.mode !== "queue" ||
          previous.chatId !== input.chatId ||
          previous.targetRunId !== input.runId ||
          previous.text !== input.text ||
          previous.expectedRevision !== input.expectedRevision ||
          previous.resendsNonce !== input.resendsMessageId ||
          JSON.stringify(previous.pageIds) !== JSON.stringify(input.pageIds) ||
          JSON.stringify(previous.contextPageRefs) !== JSON.stringify(input.contextPageRefs) ||
          JSON.stringify(previous.mentions ?? []) !== JSON.stringify(mentions)
        ) {
          throw new AuxError("conflict", "This message ID already belongs to another follow-up.");
        }
        return previous;
      }
      const target = this.repo.getRun(input.runId);
      if (!target || target.config?.chatId !== input.chatId)
        throw new AuxError("not_found", "The conversation run was not found.");
      if (input.resendsMessageId) {
        const superseded = this.repo.getRunMessage(input.resendsMessageId);
        if (!superseded || superseded.chatId !== input.chatId)
          throw new AuxError("not_found", "The message this send supersedes was not found.");
      }
      if (target.config.contextMemoryRevoked)
        throw new AuxError(
          "permission_denied",
          "This turn used a forgotten saved article. Start a new turn with current sources.",
        );
      if (target.config?.taskId) {
        const tasks = new TaskService(this.repo, this.events);
        const task = tasks.get(target.config.taskId);
        if (
          task.revision !== target.config.taskRevision ||
          task.state === "archived" ||
          (task.conversationId ?? taskConversationId(task.taskId)) !== input.chatId
        ) {
          throw new AuxError("conflict", "This saved task changed. Review it before queueing a follow-up.");
        }
      }
      if (this.repo.getConversation(input.chatId)?.archived)
        throw new AuxError("conflict", "Restore this conversation before queueing a message.");
      if ((target.config?.messageRevision ?? 0) !== input.expectedRevision)
        throw new AuxError("conflict", "This run changed. Review it before queueing another message.");
      if (this.repo.pendingRunMessageCount(input.chatId) >= 50)
        throw new AuxError(
          "conflict",
          "This conversation already has 50 waiting messages. Let some finish or remove one.",
        );
      if (
        new Set(input.pageIds).size !== input.pageIds.length ||
        new Set(input.contextPageRefs.map((ref) => ref.pageId)).size !== input.contextPageRefs.length ||
        input.contextPageRefs.some((ref) => !input.pageIds.includes(ref.pageId))
      ) {
        throw new AuxError("invalid_params", "Queued browser context must contain distinct selected pages.");
      }
      if (
        target.config?.taskId &&
        (JSON.stringify(input.pageIds) !== JSON.stringify(target.pageIds) ||
          JSON.stringify(input.contextPageRefs) !== JSON.stringify(target.config.contextPageRefs ?? []))
      ) {
        throw new AuxError(
          "conflict",
          "The selected browser context changed. Update it through the saved task after this run finishes.",
        );
      }
      const at = Date.now();
      return this.repo.insertRunMessage({
        messageId: input.messageId,
        chatId: input.chatId,
        targetRunId: input.runId,
        deliveryRunId: newRunId(),
        mode: "queue",
        status: "accepted",
        text: input.text,
        pageIds: input.pageIds,
        contextPageRefs: input.contextPageRefs,
        mentions,
        expectedRevision: input.expectedRevision,
        ...(input.resendsMessageId ? { resendsNonce: input.resendsMessageId } : {}),
        createdAt: at,
        updatedAt: at,
      });
    });
    this.changed(message);
    this.schedule(message.chatId);
    return message;
  }

  async steer(input: QueueMessageInput): Promise<RunMessage> {
    return withRunAuthorityMutation(
      this.repo,
      async () => {
        const mentions = MentionRefsSchema.parse(input.mentions ?? []);
        const { message, created } = this.repo.transaction(() => {
          const previous = this.repo.getRunMessage(input.messageId);
          if (previous) {
            if (
              previous.mode !== "steer" ||
              previous.chatId !== input.chatId ||
              previous.targetRunId !== input.runId ||
              previous.text !== input.text ||
              previous.expectedRevision !== input.expectedRevision ||
              previous.resendsNonce !== input.resendsMessageId ||
              JSON.stringify(previous.pageIds) !== JSON.stringify(input.pageIds) ||
              JSON.stringify(previous.contextPageRefs) !== JSON.stringify(input.contextPageRefs) ||
              JSON.stringify(previous.mentions ?? []) !== JSON.stringify(mentions)
            ) {
              throw new AuxError("conflict", "This message ID already belongs to another correction.");
            }
            return { message: previous, created: false };
          }
          const target = this.repo.getRun(input.runId);
          if (!target || target.config?.chatId !== input.chatId)
            throw new AuxError("not_found", "The conversation run was not found.");
          if (input.resendsMessageId) {
            const superseded = this.repo.getRunMessage(input.resendsMessageId);
            if (!superseded || superseded.chatId !== input.chatId)
              throw new AuxError("not_found", "The message this send supersedes was not found.");
          }
          if (target.config?.taskId) {
            const tasks = new TaskService(this.repo, this.events);
            const task = tasks.get(target.config.taskId);
            if (
              task.revision !== target.config.taskRevision ||
              task.state === "archived" ||
              (task.conversationId ?? taskConversationId(task.taskId)) !== input.chatId
            ) {
              throw new AuxError("conflict", "This saved task changed. Review it before steering this run.");
            }
          }
          if (!active.has(target.status) || !this.canSteer(input.runId))
            throw new AuxError("conflict", "This run has finished. Send a follow-up instead.");
          if (this.repo.getConversation(input.chatId)?.archived)
            throw new AuxError("conflict", "Restore this conversation before correcting it.");
          if ((target.config?.messageRevision ?? 0) !== input.expectedRevision)
            throw new AuxError("conflict", "This run changed. Review it before steering again.");
          const corrections = this.repo.listRunSteers(input.runId);
          if (
            corrections.length >= 32 ||
            corrections.reduce((size, correction) => size + correction.text.length, 0) + input.text.length >
              20_000
          ) {
            throw new AuxError(
              "conflict",
              "This run has reached its correction limit. Stop it and start a follow-up.",
            );
          }
          if (
            input.pageIds.length !== target.pageIds.length ||
            input.pageIds.some((pageId, index) => pageId !== target.pageIds[index]) ||
            JSON.stringify(input.contextPageRefs) !== JSON.stringify(target.config?.contextPageRefs ?? [])
          ) {
            throw new AuxError(
              "conflict",
              "The selected browser context changed. Update it after this run finishes.",
            );
          }
          const at = Date.now();
          const inserted = this.repo.insertRunMessage({
            messageId: input.messageId,
            chatId: input.chatId,
            targetRunId: input.runId,
            deliveryRunId: newRunId(),
            mode: "steer",
            status: "delivered",
            text: input.text,
            pageIds: input.pageIds,
            contextPageRefs: input.contextPageRefs,
            mentions,
            expectedRevision: input.expectedRevision,
            ...(input.resendsMessageId ? { resendsNonce: input.resendsMessageId } : {}),
            createdAt: at,
            updatedAt: at,
          });
          target.config = { ...target.config, messageRevision: input.expectedRevision + 1, mentions };
          this.repo.saveRun(target);
          return { message: inserted, created: true };
        });
        if (created) {
          this.changed(message);
          this.events.emit(
            EventTypes.RunUpdated,
            { run: this.repo.getRun(message.targetRunId)! },
            message.targetRunId,
          );
          this.signalSteer(message.targetRunId);
        }
        return message;
      },
      input.runId,
    );
  }

  cancel(messageId: string): RunMessage {
    const message = this.repo.getRunMessage(messageId);
    if (!message) throw new AuxError("not_found", "Queued message not found.");
    if (message.status === "delivered" || this.repo.getRun(message.deliveryRunId))
      throw new AuxError("conflict", "This message already started. Stop its run instead.");
    if (message.status === "cancelled") return message;
    const cancelled = this.repo.updateRunMessage(messageId, "cancelled");
    this.changed(cancelled);
    this.schedule(cancelled.chatId);
    return cancelled;
  }

  cancelForChat(chatId: string): void {
    for (const message of this.repo.cancelPendingRunMessages(chatId)) this.changed(message);
  }

  resumePending(): void {
    for (const chatId of this.repo.pendingRunMessageChats()) {
      for (const message of this.repo.listRunMessages(chatId)) this.syncJournal(message);
      this.schedule(chatId);
    }
  }

  async stop(): Promise<void> {
    this.stopped = true;
    this.unsubscribe();
    await Promise.allSettled(this.inFlight);
  }

  private changed(message: RunMessage) {
    this.syncJournal(message);
    this.events.emit("conversation.messages.changed", {
      chatId: message.chatId,
      messageId: message.messageId,
      status: message.status,
    });
  }

  private syncJournal(message: RunMessage): void {
    const record = this.sendJournal.queue(
      {
        nonce: message.messageId,
        threadId: message.chatId,
        turnId: message.targetRunId,
        text: message.text,
        ...(message.resendsNonce ? { supersedes: message.resendsNonce } : {}),
      },
      message.createdAt,
    );
    if (message.status === "cancelled") {
      if (record.state !== "cancelled") this.sendJournal.cancel(record.nonce);
      return;
    }
    if (record.state === "cancelled" || record.state === "failed") return;
    const accepted = this.sendJournal.acceptLocal(record.nonce, message.deliveryRunId, message.updatedAt);
    if (message.status === "delivered" && accepted.state !== "acknowledged")
      this.sendJournal.acknowledge(record.nonce, message.deliveryRunId, message.updatedAt);
    else if (message.status === "needs_attention" && accepted.state !== "parked")
      this.sendJournal.park(record.nonce, message.updatedAt);
  }

  private schedule(chatId: string) {
    if (this.stopped) return;
    if (this.draining.has(chatId)) {
      this.rerun.add(chatId);
      return;
    }
    this.draining.add(chatId);
    setImmediate(() => {
      if (this.stopped) {
        this.draining.delete(chatId);
        return;
      }
      const work = this.drain(chatId)
        .catch(() => {
          this.events.emit("conversation.messages.error", {
            chatId,
            message: "Queued message delivery could not be checked.",
          });
        })
        .finally(() => {
          this.inFlight.delete(work);
          this.draining.delete(chatId);
          if (this.rerun.delete(chatId)) this.schedule(chatId);
        });
      this.inFlight.add(work);
    });
  }

  private async drain(chatId: string): Promise<void> {
    while (!this.stopped) {
      const message = this.repo.nextRunMessage(chatId);
      if (!message || message.status === "needs_attention") return;
      const delivered = this.repo.getRun(message.deliveryRunId);
      if (delivered) {
        if (message.status !== "delivered")
          this.changed(this.repo.updateRunMessage(message.messageId, "delivered"));
        if (active.has(delivered.status)) return;
        continue;
      }
      const target = this.repo.getRun(message.targetRunId);
      if (!target || active.has(target.status) || this.repo.activeConversationRun(chatId)) return;
      this.changed(this.repo.updateRunMessage(message.messageId, "delivering"));
      try {
        const run = await this.start(message);
        this.changed(this.repo.updateRunMessage(message.messageId, "delivered"));
        if (active.has(run.status)) return;
      } catch (error) {
        const text = error instanceof Error ? error.message : String(error);
        this.changed(this.repo.updateRunMessage(message.messageId, "needs_attention", text));
        return;
      }
    }
  }
}
