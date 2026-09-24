import { AuxError, EventTypes, newRunId, type PageContextRef, type Run, type RunMessage } from "@aux/contracts";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";

const active = new Set<Run["status"]>(["queued", "planning", "running", "paused", "needs_input"]);

export type QueueMessageInput = {
  messageId: string;
  runId: string;
  chatId: string;
  text: string;
  pageIds: string[];
  contextPageRefs: PageContextRef[];
  expectedRevision: number;
};

/** Serialized user follow-ups. A stable delivery run ID makes restart replay idempotent. */
export class RunMessageQueue {
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
    this.unsubscribe = events.subscribe(event => {
      if (event.type !== EventTypes.RunUpdated) return;
      const run = event.payload.run as Run | undefined;
      if (run?.config?.chatId && !active.has(run.status)) this.schedule(run.config.chatId);
    });
  }

  list(chatId: string): RunMessage[] { return this.repo.listRunMessages(chatId); }

  queue(input: QueueMessageInput): RunMessage {
    const message = this.repo.transaction(() => {
      const previous = this.repo.getRunMessage(input.messageId);
      if (previous) {
        if (previous.mode !== "queue" || previous.chatId !== input.chatId || previous.targetRunId !== input.runId || previous.text !== input.text
          || previous.expectedRevision !== input.expectedRevision
          || JSON.stringify(previous.pageIds) !== JSON.stringify(input.pageIds)
          || JSON.stringify(previous.contextPageRefs) !== JSON.stringify(input.contextPageRefs)) {
          throw new AuxError("conflict", "This message ID already belongs to another follow-up.");
        }
        return previous;
      }
      const target = this.repo.getRun(input.runId);
      if (!target || target.config?.chatId !== input.chatId) throw new AuxError("not_found", "The conversation run was not found.");
      if (target.config?.taskId) throw new AuxError("conflict", "Continue this saved task through its task controls.");
      if (this.repo.getConversation(input.chatId)?.archived) throw new AuxError("conflict", "Restore this conversation before queueing a message.");
      if ((target.config?.messageRevision ?? 0) !== input.expectedRevision) throw new AuxError("conflict", "This run changed. Review it before queueing another message.");
      if (this.repo.pendingRunMessageCount(input.chatId) >= 50) throw new AuxError("conflict", "This conversation already has 50 waiting messages. Let some finish or remove one.");
      if (new Set(input.pageIds).size !== input.pageIds.length || !input.pageIds.length
        || new Set(input.contextPageRefs.map(ref => ref.pageId)).size !== input.contextPageRefs.length
        || input.contextPageRefs.some(ref => !input.pageIds.includes(ref.pageId))) {
        throw new AuxError("invalid_params", "Queued browser context must contain distinct selected pages.");
      }
      const at = Date.now();
      return this.repo.insertRunMessage({ messageId: input.messageId, chatId: input.chatId, targetRunId: input.runId,
        deliveryRunId: newRunId(), mode: "queue", status: "accepted", text: input.text,
        pageIds: input.pageIds, contextPageRefs: input.contextPageRefs,
        expectedRevision: input.expectedRevision, createdAt: at, updatedAt: at });
    });
    this.changed(message);
    this.schedule(message.chatId);
    return message;
  }

  steer(input: QueueMessageInput): RunMessage {
    const { message, created } = this.repo.transaction(() => {
      const previous = this.repo.getRunMessage(input.messageId);
      if (previous) {
        if (previous.mode !== "steer" || previous.chatId !== input.chatId || previous.targetRunId !== input.runId
          || previous.text !== input.text || previous.expectedRevision !== input.expectedRevision
          || JSON.stringify(previous.pageIds) !== JSON.stringify(input.pageIds)
          || JSON.stringify(previous.contextPageRefs) !== JSON.stringify(input.contextPageRefs)) {
          throw new AuxError("conflict", "This message ID already belongs to another correction.");
        }
        return { message: previous, created: false };
      }
      const target = this.repo.getRun(input.runId);
      if (!target || target.config?.chatId !== input.chatId) throw new AuxError("not_found", "The conversation run was not found.");
      if (target.config?.taskId) throw new AuxError("conflict", "Steer this saved task through its task controls.");
      if (!active.has(target.status) || !this.canSteer(input.runId)) throw new AuxError("conflict", "This run has finished. Send a follow-up instead.");
      if (this.repo.getConversation(input.chatId)?.archived) throw new AuxError("conflict", "Restore this conversation before correcting it.");
      if ((target.config?.messageRevision ?? 0) !== input.expectedRevision) throw new AuxError("conflict", "This run changed. Review it before steering again.");
      const corrections = this.repo.listRunSteers(input.runId);
      if (corrections.length >= 32 || corrections.reduce((size, correction) => size + correction.text.length, 0) + input.text.length > 20_000) {
        throw new AuxError("conflict", "This run has reached its correction limit. Stop it and start a follow-up.");
      }
      if (input.pageIds.length !== target.pageIds.length || input.pageIds.some((pageId, index) => pageId !== target.pageIds[index])
        || JSON.stringify(input.contextPageRefs) !== JSON.stringify(target.config?.contextPageRefs ?? [])) {
        throw new AuxError("conflict", "The selected browser context changed. Update it after this run finishes.");
      }
      const at = Date.now();
      const inserted = this.repo.insertRunMessage({ messageId: input.messageId, chatId: input.chatId, targetRunId: input.runId,
        deliveryRunId: newRunId(), mode: "steer", status: "delivered", text: input.text,
        pageIds: input.pageIds, contextPageRefs: input.contextPageRefs,
        expectedRevision: input.expectedRevision, createdAt: at, updatedAt: at });
      target.config = { ...target.config, messageRevision: input.expectedRevision + 1 };
      this.repo.saveRun(target);
      return { message: inserted, created: true };
    });
    if (created) {
      this.changed(message);
      this.events.emit(EventTypes.RunUpdated, { run: this.repo.getRun(message.targetRunId)! }, message.targetRunId);
      this.signalSteer(message.targetRunId);
    }
    return message;
  }

  cancel(messageId: string): RunMessage {
    const message = this.repo.getRunMessage(messageId);
    if (!message) throw new AuxError("not_found", "Queued message not found.");
    if (message.status === "delivered" || this.repo.getRun(message.deliveryRunId)) throw new AuxError("conflict", "This message already started. Stop its run instead.");
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
    for (const chatId of this.repo.pendingRunMessageChats()) this.schedule(chatId);
  }

  async stop(): Promise<void> {
    this.stopped = true;
    this.unsubscribe();
    await Promise.allSettled(this.inFlight);
  }

  private changed(message: RunMessage) {
    this.events.emit("conversation.messages.changed", { chatId: message.chatId, messageId: message.messageId, status: message.status });
  }

  private schedule(chatId: string) {
    if (this.stopped) return;
    if (this.draining.has(chatId)) { this.rerun.add(chatId); return; }
    this.draining.add(chatId);
    setImmediate(() => {
      if (this.stopped) { this.draining.delete(chatId); return; }
      const work = this.drain(chatId).catch(() => {
      this.events.emit("conversation.messages.error", { chatId, message: "Queued message delivery could not be checked." });
      }).finally(() => {
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
        if (message.status !== "delivered") this.changed(this.repo.updateRunMessage(message.messageId, "delivered"));
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
