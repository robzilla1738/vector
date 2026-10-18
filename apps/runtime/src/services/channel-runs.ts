import { randomUUID } from "node:crypto";
import { AuxError, EventTypes, taskConversationId, type Run } from "@aux/contracts";
import type { ChannelConnection, ChannelCursor, ChannelInbound } from "@aux/contracts/channels";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";
import type { AgentConnectionService, ScopedExternalClient } from "./agent-connections.js";
import type { ExternalSessionService } from "./external-sessions.js";
import type { RunService } from "./runs.js";
import type { TaskService } from "./tasks.js";
import { intakeChannelMessage, type ChannelIntakeDependencies } from "./channel-intake.js";
import { channelCommand, executeChannelCommand, type ChannelModels } from "./channel-commands.js";
import type { ChannelReply } from "@aux/contracts/channels";
import { ChannelStore, type StoredChannelMessage, type StoredChannelPeer } from "./channel-store.js";

const activeRuns = new Set<string>(["queued", "planning", "running", "paused", "needs_input"]);
type Owner = { connection: ChannelConnection; signal: AbortSignal };
type Dependencies = {
  repo: Repo;
  store: ChannelStore;
  events: EventBus;
  tasks: TaskService;
  runs: RunService;
  connections: AgentConnectionService;
  sessions: ExternalSessionService;
  models?: ChannelModels;
  intake?: ChannelIntakeDependencies;
  deliveryReady(connectionId: string): void;
  failed(connectionId: string): void;
};

function replyChunks(text: string, limit: number): string[] {
  const suffix = "\n\nOpen this task in Aux for the complete result.";
  const end = (text.codePointAt(63999) ?? 0) > 0xffff ? 63999 : 64000;
  const content = text.length > 64000 ? text.slice(0, end) + suffix : text;
  const chunks: string[] = [];
  let chunk = "";
  for (const character of content) {
    if (chunk.length + character.length > limit) {
      chunks.push(chunk);
      chunk = "";
    }
    chunk += character;
  }
  if (chunk) chunks.push(chunk);
  return chunks;
}

/** Remote requests retain external authority through the ordinary task/run/approval lifecycle. */
export class ChannelRunService {
  private owners = new Map<string, Owner>();
  private authorities = new Map<string, string>();
  private jobs = new Map<string, Promise<void>>();
  private repeat = new Set<string>();
  private unsubscribe: () => void;
  private timer: ReturnType<typeof setInterval>;
  private closed = false;
  constructor(private deps: Dependencies) {
    this.unsubscribe = deps.events.subscribe((event) => {
      if (event.type !== EventTypes.RunUpdated && event.type !== "conversation.messages.changed") return;
      if (event.type === EventTypes.RunUpdated) {
        const runId = event.runId ?? (event.payload.run as Run | undefined)?.runId;
        const row = runId
          ? (deps.repo.db
              .prepare(
                "SELECT json_extract(config,'$.externalConnectionId') AS authority FROM run_lookup WHERE run_id=?",
              )
              .get(runId) as { authority: string | null } | undefined)
          : undefined;
        const id = row?.authority ? this.authorities.get(row.authority) : undefined;
        if (id) this.schedule(id);
      } else for (const id of this.owners.keys()) this.schedule(id);
    });
    this.timer = setInterval(() => {
      for (const id of this.owners.keys()) this.schedule(id);
    }, 30000);
    this.timer.unref();
  }
  activate(connection: ChannelConnection, signal: AbortSignal) {
    if (this.closed) throw new AuxError("cancelled", "Channels are closing.");
    this.owners.set(connection.connectionId, { connection, signal });
    for (const peer of this.deps.store.peers(connection.connectionId))
      if (peer.authorityId) this.authorities.set(peer.authorityId, connection.connectionId);
    this.schedule(connection.connectionId);
  }
  retire(connectionId: string): Promise<void> {
    this.owners.delete(connectionId);
    for (const [id, channel] of this.authorities) if (channel === connectionId) this.authorities.delete(id);
    this.repeat.delete(connectionId);
    return this.jobs.get(connectionId) ?? Promise.resolve();
  }
  private current(owner: Owner) {
    owner.signal.throwIfAborted();
    if (this.closed || this.owners.get(owner.connection.connectionId) !== owner)
      throw new AuxError("cancelled", "The original channel session retired.");
    this.deps.store.assertCurrent(owner.connection);
  }
  private client(connection: ChannelConnection, peer: StoredChannelPeer): ScopedExternalClient {
    if (
      peer.state === "blocked" ||
      (peer.state !== "paired" && connection.options.audience !== "everyone") ||
      !peer.authorityId
    )
      throw new AuxError("permission_denied", "This person is not allowed to use the channel.");
    const client = {
      external: true as const,
      connectionId: peer.authorityId,
      scope: { kind: "workspace" as const, workspaceId: connection.workspaceId },
    };
    if (!this.deps.connections.isLive(client))
      throw new AuxError("permission_denied", "This person's channel connection retired.");
    return client;
  }
  /** Called by original local pairing/configuration or the explicitly enabled Everyone audience. */
  grant(connection: ChannelConnection, peer: StoredChannelPeer): StoredChannelPeer {
    if (peer.state === "blocked")
      throw new AuxError("permission_denied", "Unblock this person in Aux first.");
    if (peer.authorityId) {
      this.client(connection, peer);
      this.authorities.set(peer.authorityId, connection.connectionId);
      return peer;
    }
    const { connection: authority } = this.deps.connections.create({
      name: `${connection.provider} channel`,
      client: connection.provider,
      scope: { kind: "workspace", workspaceId: connection.workspaceId },
    });
    const updated = { ...peer, authorityId: authority.connectionId, updatedAt: Date.now() };
    this.deps.store.savePeer(connection.connectionId, updated);
    this.authorities.set(authority.connectionId, connection.connectionId);
    return updated;
  }
  private threadKey(connection: ChannelConnection, message: ChannelInbound) {
    return this.deps.store.key(
      connection.connectionId,
      "thread",
      JSON.stringify([message.conversationId, message.threadId ?? null]),
    );
  }
  /** Only durable, bounded intake belongs before the provider ACK; execution starts on the next turn. */
  receive(connection: ChannelConnection, message: ChannelInbound | null, cursor?: ChannelCursor | null) {
    const owner = this.owners.get(connection.connectionId);
    if (!owner || owner.connection.revision !== connection.revision)
      throw new AuxError("cancelled", "The original channel session retired.");
    this.current(owner);
    let accepted = false;
    this.deps.repo.transaction(() => {
      if (!message || this.deps.store.hasMessage(connection.connectionId, message.messageId)) {
        this.deps.store.receive(connection, null, cursor);
        return;
      }
      const peerKey = this.deps.store.key(connection.connectionId, "peer", message.peerId);
      let peer = this.deps.store.peer(connection.connectionId, peerKey);
      const existingThread =
        peer && this.deps.store.thread(connection.connectionId, peerKey, this.threadKey(connection, message));
      const addressed =
        message.direct ||
        message.mentioned ||
        (message.inThread && !connection.options.requireMentionsInThreads && Boolean(existingThread));
      if (!addressed || peer?.state === "blocked") {
        this.deps.store.receive(connection, null, cursor);
        return;
      }
      const action = channelCommand(message, connection)?.name;
      if (
        action !== "pair" &&
        peer?.authorityId &&
        !this.deps.connections.isLive({
          external: true,
          connectionId: peer.authorityId,
          scope: { kind: "workspace", workspaceId: connection.workspaceId },
        })
      ) {
        this.deps.store.savePeer(connection.connectionId, {
          ...peer,
          state: "pending",
          updatedAt: Date.now(),
        });
        this.deps.store.receive(connection, null, cursor);
        return;
      }
      if (action !== "pair" && connection.options.audience === "paired" && peer?.state !== "paired") {
        this.deps.store.receive(connection, null, cursor);
        return;
      }
      if (!peer) {
        if (this.deps.store.counts(connection.connectionId).peers >= 1000)
          throw new AuxError("conflict", "Review the channel's existing people before adding another.");
        peer = {
          peerKey,
          providerUserId: message.peerId,
          name: message.peerName,
          state: "pending",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      }
      if (action === "pair") {
        const pairing =
          peer.state === "paired"
            ? peer
            : { ...peer, requestId: randomUUID(), expiresAt: Date.now() + 600000 };
        this.deps.store.savePeer(connection.connectionId, {
          ...pairing,
          name: message.peerName,
          updatedAt: Date.now(),
        });
        this.deps.store.receive(connection, message, cursor, "rejected");
        this.deps.events.emit("channels.changed", { connectionId: connection.connectionId });
        return;
      }
      this.deps.store.savePeer(connection.connectionId, peer);
      peer = this.grant(connection, peer);
      this.client(connection, peer);
      if (this.deps.store.counts(connection.connectionId).pendingMessages >= 200)
        throw new AuxError("conflict", "This channel's waiting messages must finish before accepting more.");
      accepted = this.deps.store.receive(connection, message, cursor, "pending", peer.authorityId);
    });
    if (accepted) this.deps.events.emit("channels.changed", { connectionId: connection.connectionId });
    this.schedule(connection.connectionId);
  }
  private schedule(connectionId: string) {
    if (this.closed || !this.owners.has(connectionId)) return;
    if (this.jobs.has(connectionId)) {
      this.repeat.add(connectionId);
      return;
    }
    const work = new Promise<void>((resolve) => setImmediate(resolve))
      .then(async () => {
        do {
          this.repeat.delete(connectionId);
          const owner = this.owners.get(connectionId);
          if (!owner) return;
          await this.drain(owner);
        } while (this.repeat.has(connectionId));
      })
      .catch(() => {
        if (!this.closed) this.deps.failed(connectionId);
      })
      .finally(() => {
        this.jobs.delete(connectionId);
        this.repeat.delete(connectionId);
      });
    this.jobs.set(connectionId, work);
  }
  private assertConversation(
    connection: ChannelConnection,
    message: StoredChannelMessage,
    peer: StoredChannelPeer,
    run: Run,
  ) {
    const thread = this.deps.store.thread(
      message.connectionId,
      message.peerKey,
      this.threadKey(connection, message.message),
    );
    if (
      !thread ||
      run.config?.taskId !== thread.taskId ||
      run.config.externalConnectionId !== peer.authorityId ||
      run.config.chatId !== taskConversationId(thread.taskId)
    )
      throw new AuxError("permission_denied", "The original channel conversation changed.");
  }
  private assertRun(
    connection: ChannelConnection,
    message: StoredChannelMessage,
    peer: StoredChannelPeer,
    run: Run,
  ) {
    this.assertConversation(connection, message, peer, run);
    if (run.runId === message.deliveryRunId) {
      if (run.goal !== (message.preparedText ?? message.message.text))
        throw new AuxError("permission_denied", "The original channel request changed.");
      return;
    }
    const followUp = this.deps.repo.getRunMessage(message.messageUuid);
    if (
      !followUp ||
      followUp.text !== (message.preparedText ?? message.message.text) ||
      followUp.chatId !== run.config?.chatId ||
      (followUp.mode === "queue" ? followUp.deliveryRunId !== run.runId : followUp.targetRunId !== run.runId)
    )
      throw new AuxError(
        "permission_denied",
        "This reply does not belong to the originating channel request.",
      );
  }
  private addReply(
    connection: ChannelConnection,
    message: StoredChannelMessage,
    text: string,
    reply?: ChannelReply,
  ) {
    const limit = connection.provider === "discord" ? 1900 : 3500;
    let first = true;
    for (const chunk of replyChunks(text, limit)) {
      const now = Date.now();
      this.deps.store.saveDelivery({
        deliveryId: randomUUID(),
        connectionId: connection.connectionId,
        revision: connection.revision,
        peerKey: message.peerKey,
        runId: message.runId,
        conversationId: message.message.conversationId,
        threadId: message.message.threadId,
        replyToMessageId: message.message.messageId,
        text: chunk,
        ...(reply && first ? { reply } : {}),
        state: "pending",
        createdAt: now,
        updatedAt: now,
      });
      first = false;
    }
  }
  private async drain(owner: Owner) {
    this.current(owner);
    const connection = owner.connection,
      store = this.deps.store;
    const previousCount = store.counts(connection.connectionId).pendingMessages;
    const messages = store.messages(connection.connectionId, ["pending", "admitting", "running", "queued"]);
    const completedRuns = new Set<string>();
    for (const message of messages) {
      this.current(owner);
      if (message.revision !== connection.revision) {
        store.saveMessage({ ...message, state: "retired" });
        continue;
      }
      const peer = store.peer(connection.connectionId, message.peerKey);
      if (!peer || message.authorityId !== peer.authorityId) {
        store.saveMessage({ ...message, state: "retired" });
        continue;
      }
      try {
        this.client(connection, peer);
      } catch {
        store.saveMessage({ ...message, state: "retired" });
        continue;
      }
      if (message.state === "pending") {
        try {
          await this.admit(owner, peer, message);
        } catch (error) {
          this.current(owner);
          const outstanding = store
            .messages(connection.connectionId, ["pending", "admitting"])
            .some((item) => item.messageKey === message.messageKey);
          if (outstanding)
            this.deps.repo.transaction(() => {
              this.addReply(
                connection,
                message,
                (channelCommand(message.message, connection) || message.message.interaction) &&
                  error instanceof AuxError &&
                  ["invalid_params", "conflict", "capability_unsupported"].includes(error.code)
                  ? error.message
                  : "This request needs attention in Aux before it can continue.",
              );
              store.saveMessage({ ...message, state: "failed" });
            });
        }
        continue;
      }
      let run = message.runId ? this.deps.repo.getRun(message.runId) : undefined;
      if (message.state === "queued") {
        const queued = this.deps.repo.getRunMessage(message.messageUuid);
        if (!queued || ["needs_attention", "cancelled"].includes(queued.status)) {
          this.deps.repo.transaction(() => {
            this.addReply(connection, message, "This follow-up needs attention in Aux.");
            store.saveMessage({ ...message, state: "failed" });
          });
          continue;
        }
        run = this.deps.repo.getRun(queued.deliveryRunId);
        if (!run) continue;
      }
      if (!run) {
        // An admitted run with no durable acceptance after a crash is not automatically redispatched.
        this.deps.repo.transaction(() => {
          this.addReply(
            connection,
            message,
            "This request was interrupted. Review it in Aux before sending it again.",
          );
          store.saveMessage({ ...message, state: "failed" });
        });
        continue;
      }
      try {
        this.assertRun(connection, message, peer, run);
      } catch {
        store.saveMessage({ ...message, state: "retired" });
        continue;
      }
      if (message.state === "queued") {
        const key = this.threadKey(connection, message.message);
        const thread = store.thread(connection.connectionId, peer.peerKey, key)!;
        store.saveThread(connection.connectionId, peer.peerKey, key, { ...thread, lastRunId: run.runId });
      }
      if (run.status === "needs_input" && !message.needsInputNotified) {
        this.deps.repo.transaction(() => {
          this.addReply(connection, message, "This task needs your input in Aux.");
          store.saveMessage({ ...message, runId: run.runId, needsInputNotified: true });
        });
      }
      if (activeRuns.has(run.status)) {
        this.deps.sessions.ensure(this.client(connection, peer));
        if (message.state === "admitting")
          store.saveMessage({ ...message, state: "running", runId: run.runId });
        continue;
      }
      if (completedRuns.has(run.runId)) continue;
      completedRuns.add(run.runId);
      const sameRun = messages.filter(
        (item) =>
          item.runId === run.runId &&
          item.peerKey === message.peerKey &&
          item.revision === connection.revision &&
          this.threadKey(connection, item.message) === this.threadKey(connection, message.message),
      );
      const latest = sameRun.at(-1) ?? message;
      const report = typeof run.result?.report === "string" ? run.result.report.trim() : "";
      const reply = ["completed", "partially_completed"].includes(run.status)
        ? report || "Finished. Open this task in Aux to review the result."
        : run.status === "cancelled"
          ? "This task stopped in Aux."
          : "This task needs attention in Aux.";
      this.deps.repo.transaction(() => {
        this.addReply(connection, { ...latest, runId: run.runId }, reply);
        for (const item of sameRun.length ? sameRun : [message])
          store.saveMessage({ ...item, state: "completed", runId: run.runId });
      });
    }
    this.deps.deliveryReady(connection.connectionId);
    if (previousCount !== store.counts(connection.connectionId).pendingMessages)
      this.deps.events.emit("channels.changed", { connectionId: connection.connectionId });
  }
  private async admit(owner: Owner, peer: StoredChannelPeer, message: StoredChannelMessage) {
    const { connection } = owner,
      store = this.deps.store;
    this.current(owner);
    const client = this.client(connection, peer);
    const key = this.threadKey(connection, message.message);
    let thread = store.thread(connection.connectionId, peer.peerKey, key);
    if (channelCommand(message.message, connection)?.name === "stop") {
      if (thread?.lastRunId) {
        const run = this.deps.repo.getRun(thread.lastRunId);
        if (run) {
          this.assertConversation(connection, message, peer, run);
          await this.deps.runs.cancel(run.runId, "Stopped by the originating channel person.");
        }
      }
      this.current(owner);
      store.saveMessage({ ...message, state: "completed" });
      return;
    }
    const parent = this.deps.sessions.ensure(client);
    if (!parent) throw new AuxError("permission_denied", "The original channel session is unavailable.");
    if (!thread) {
      thread = this.deps.repo.transaction(() => {
        const task = this.deps.tasks.create(
          {
            workspaceId: connection.workspaceId,
            title: `${connection.provider[0]!.toUpperCase()}${connection.provider.slice(1)} conversation`,
            objective: "Respond to the requests in this messenger conversation.",
            criteria: [
              {
                criterionId: "response",
                description: "Address the requested task and provide the result with appropriate evidence.",
                verification: "manual",
              },
            ],
            resources: [],
          },
          "external",
        );
        const created = {
          taskId: task.taskId,
          conversationId: message.message.conversationId,
          threadId: message.message.threadId,
          preferencesRevision: 0,
        };
        store.saveThread(connection.connectionId, peer.peerKey, key, created);
        return created;
      });
    }
    let request = message.message;
    const interaction = request.interaction;
    let sourceDelivery: ReturnType<ChannelStore["deliveries"]>[number] | undefined;
    if (interaction) {
      sourceDelivery = store
        .deliveries(connection.connectionId, ["delivered"])
        .find(
          (delivery) =>
            delivery.revision === connection.revision &&
            delivery.peerKey === peer.peerKey &&
            delivery.conversationId === request.conversationId &&
            delivery.threadId === request.threadId &&
            delivery.providerMessageId === interaction.providerMessageId &&
            delivery.reply?.buttons?.some((button) => button.actionId === interaction.actionId),
        );
      const button = sourceDelivery?.reply?.buttons?.find((item) => item.actionId === interaction.actionId);
      if (
        !button ||
        button.usedBy ||
        button.expiresAt <= Date.now() ||
        button.preferencesRevision !== thread.preferencesRevision
      )
        throw new AuxError(
          "conflict",
          "This channel action expired or belongs to a changed conversation. Request the command again.",
        );
      request = { ...request, text: button.command };
    }
    const action = channelCommand(request, connection);
    if (action && action.name !== "pair" && action.name !== "stop") {
      const result = await executeChannelCommand({
        command: action,
        repo: this.deps.repo,
        models: this.deps.models,
        connection,
        authorityId: peer.authorityId!,
        peerKey: peer.peerKey,
        thread,
        checkCurrent: () => {
          this.current(owner);
          this.client(connection, peer);
        },
      });
      this.current(owner);
      this.client(connection, peer);
      const currentThread = store.thread(connection.connectionId, peer.peerKey, key);
      if (currentThread?.preferencesRevision !== thread.preferencesRevision)
        throw new AuxError("conflict", "The conversation preferences changed. Request the command again.");
      this.deps.repo.transaction(() => {
        store.saveThread(connection.connectionId, peer.peerKey, key, result.thread);
        if (sourceDelivery && interaction)
          store.saveDelivery({
            ...sourceDelivery,
            reply: {
              ...sourceDelivery.reply,
              buttons: sourceDelivery.reply?.buttons?.map((button) =>
                button.actionId === interaction.actionId ? { ...button, usedBy: message.messageKey } : button,
              ),
            },
            updatedAt: Date.now(),
          });
        this.addReply(connection, message, result.text, result.reply);
        store.saveMessage({ ...message, state: "completed" });
      });
      this.deps.deliveryReady(connection.connectionId);
      return;
    }
    const target = thread.lastRunId ? this.deps.repo.getRun(thread.lastRunId) : undefined;
    if (
      target &&
      activeRuns.has(target.status) &&
      (message.message.attachments?.length || thread.modelId || thread.reasoning)
    ) {
      this.assertConversation(connection, message, peer, target);
      if (this.deps.intake && message.message.attachments?.length)
        await intakeChannelMessage({
          deps: this.deps.intake,
          store,
          connection,
          message,
          chatId: taskConversationId(thread.taskId),
          parentRunId: parent,
          signal: owner.signal,
          mode: "capture",
          checkCurrent: () => {
            this.current(owner);
            this.client(connection, peer);
          },
        });
      // A fresh turn admits these exact originals after current work; an immutable text queue cannot acquire later sources.
      return;
    }
    if (message.message.attachments?.length && !message.preparedText) {
      if (!this.deps.intake)
        throw new AuxError(
          "capability_unsupported",
          "Attachment intake is unavailable. The source message is retained.",
        );
      const outcome = await intakeChannelMessage({
        deps: this.deps.intake,
        store,
        connection,
        message,
        chatId: taskConversationId(thread.taskId),
        parentRunId: parent,
        signal: owner.signal,
        checkCurrent: () => {
          this.current(owner);
          this.client(connection, peer);
        },
      });
      this.current(owner);
      if (!outcome.usable) {
        this.deps.repo.transaction(() => {
          this.addReply(
            connection,
            message,
            outcome.failures.join("\n") || "No attachment could be admitted. Originals are retained.",
          );
          store.saveMessage({ ...message, state: "completed" });
        });
        this.deps.deliveryReady(connection.connectionId);
        return;
      }
      message = {
        ...message,
        preparedText: outcome.text || "Inspect the attached source and describe its contents.",
      };
      store.saveMessage(message);
    }
    if (target && activeRuns.has(target.status)) {
      this.assertConversation(connection, message, peer, target);
      if (target.config?.externalParentRunId !== parent)
        throw new AuxError("permission_denied", "The original channel session changed.");
      const input = {
        messageId: message.messageUuid,
        runId: target.runId,
        chatId: taskConversationId(thread.taskId),
        text: message.preparedText ?? message.message.text,
        pageIds: target.pageIds,
        contextPageRefs: target.config?.contextPageRefs ?? [],
        expectedRevision: target.config?.messageRevision ?? 0,
      };
      const queued =
        connection.options.followUp === "steer" && !message.message.attachments?.length
          ? await this.deps.runs.messages.steer(input)
          : this.deps.runs.messages.queue(input);
      this.current(owner);
      this.client(connection, peer);
      store.saveMessage({
        ...message,
        state: queued.mode === "steer" ? "running" : "queued",
        runId: queued.mode === "steer" ? target.runId : queued.deliveryRunId,
      });
      return;
    }
    const task = this.deps.tasks.get(thread.taskId);
    if (task.workspaceId !== connection.workspaceId)
      throw new AuxError("permission_denied", "This channel's task belongs to another Space.");
    store.saveMessage({ ...message, state: "admitting", runId: message.deliveryRunId });
    try {
      const run = await this.deps.runs.start({
        ...this.deps.tasks.prepareRun(task.taskId, task.revision, undefined, parent),
        goal: message.preparedText ?? message.message.text,
        modelId: thread.modelId,
        reasoning: thread.reasoning,
        executionTarget: "local",
        deliveryRunId: message.deliveryRunId,
        externalConnectionId: client.connectionId,
        externalParentRunId: parent,
      });
      this.current(owner);
      this.client(connection, peer);
      if (run.runId !== message.deliveryRunId)
        throw new AuxError("conflict", "The original channel run identity changed.");
      this.assertRun(connection, message, peer, run);
      this.deps.repo.transaction(() => {
        store.saveMessage({ ...message, state: "running", runId: run.runId });
        store.saveThread(connection.connectionId, peer.peerKey, key, { ...thread, lastRunId: run.runId });
      });
      this.repeat.add(connection.connectionId);
    } catch (error) {
      const accepted = this.deps.repo.getRun(message.deliveryRunId);
      if (accepted?.config?.externalConnectionId === client.connectionId && activeRuns.has(accepted.status))
        await this.deps.runs.cancel(accepted.runId, "The original channel admission retired.");
      if (
        this.owners.get(connection.connectionId) === owner &&
        !owner.signal.aborted &&
        this.deps.connections.isLive(client)
      ) {
        this.deps.repo.transaction(() => {
          this.addReply(
            connection,
            message,
            "This request could not start. Review the task in Aux before trying again.",
          );
          store.saveMessage({ ...message, state: "failed" });
        });
      }
      throw error;
    }
  }
  async close() {
    this.closed = true;
    this.unsubscribe();
    clearInterval(this.timer);
    this.owners.clear();
    this.authorities.clear();
    this.repeat.clear();
    await Promise.all(this.jobs.values());
  }
}
