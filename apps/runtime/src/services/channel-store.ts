import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { AuxError } from "@aux/contracts";
import {
  ChannelConnectionSchema,
  ChannelCursorSchema,
  ChannelFailureCodeSchema,
  ChannelInboundSchema,
  ChannelPeerSchema,
  type ChannelConnection,
  type ChannelCursor,
  type ChannelInbound,
} from "@aux/contracts/channels";
import type { Repo } from "../store/repo.js";
import { withSecureDelete } from "../store/db.js";

const connectionEnvelope = z
  .object({ connection: ChannelConnectionSchema, lookupKey: z.string().regex(/^[A-Za-z0-9+/]{43}=$/) })
  .strict();
export const StoredChannelPeerSchema = ChannelPeerSchema.extend({
  authorityId: z.string().uuid().optional(),
});
export type StoredChannelPeer = z.infer<typeof StoredChannelPeerSchema>;
const threadSchema = z
  .object({
    taskId: z.string().min(1),
    lastRunId: z.string().optional(),
    conversationId: z.string().min(1),
    threadId: z.string().optional(),
  })
  .strict();
export type ChannelThread = z.infer<typeof threadSchema>;
const messageBody = z
  .object({
    message: ChannelInboundSchema,
    messageUuid: z.string().uuid(),
    deliveryRunId: z.string().min(1),
    needsInputNotified: z.boolean().default(false),
  })
  .strict();
type MessageBody = z.infer<typeof messageBody>;
export type ChannelMessageState =
  "pending" | "admitting" | "running" | "queued" | "completed" | "rejected" | "retired" | "failed";
export type StoredChannelMessage = MessageBody & {
  connectionId: string;
  messageKey: string;
  revision: string;
  peerKey: string;
  state: ChannelMessageState;
  runId?: string;
  receivedAt: number;
};
const deliveryBody = z
  .object({
    conversationId: z.string().min(1),
    threadId: z.string().optional(),
    replyToMessageId: z.string().optional(),
    text: z.string().min(1),
    providerMessageId: z.string().optional(),
    errorCode: ChannelFailureCodeSchema.optional(),
  })
  .strict();
export type StoredChannelDelivery = z.infer<typeof deliveryBody> & {
  deliveryId: string;
  connectionId: string;
  revision: string;
  peerKey: string;
  runId?: string;
  state: "pending" | "sending" | "delivered" | "failed" | "unknown";
  createdAt: number;
  updatedAt: number;
};
type MessageRow = {
  connection_id: string;
  message_key: string;
  revision: string;
  peer_key: string;
  state: ChannelMessageState;
  run_id: string | null;
  body: string;
  received_at: number;
};
type DeliveryRow = {
  delivery_id: string;
  connection_id: string;
  revision: string;
  peer_key: string;
  run_id: string | null;
  state: StoredChannelDelivery["state"];
  body: string;
  created_at: number;
  updated_at: number;
};

/** Protected bodies and per-connection keyed indexes survive reviewed cross-Profile recovery. */
export class ChannelStore {
  constructor(readonly repo: Repo) {}

  private encode(table: string, identity: string[], value: unknown) {
    return this.repo.protectRecordField(table, identity, "body", JSON.stringify(value));
  }
  private decode<T>(table: string, identity: string[], body: string, schema: z.ZodType<T>): T {
    return schema.parse(JSON.parse(this.repo.revealRecordField(table, identity, "body", body)));
  }
  private envelope(connectionId: string) {
    const row = this.repo.db
      .prepare("SELECT revision,workspace_id,enabled,body FROM channel_connections WHERE connection_id=?")
      .get(connectionId) as
      { revision: string; workspace_id: string; enabled: number; body: string } | undefined;
    if (!row) return undefined;
    const value = this.decode("channel_connections", [connectionId], row.body, connectionEnvelope);
    if (
      value.connection.connectionId !== connectionId ||
      value.connection.revision !== row.revision ||
      value.connection.workspaceId !== row.workspace_id ||
      value.connection.enabled !== Boolean(row.enabled)
    )
      throw new AuxError("internal", "Protected channel identity does not match its record.");
    return value;
  }
  get(connectionId: string): ChannelConnection | undefined {
    return this.envelope(connectionId)?.connection;
  }
  list(): ChannelConnection[] {
    return (
      this.repo.db
        .prepare("SELECT connection_id FROM channel_connections ORDER BY created_at,connection_id")
        .all() as { connection_id: string }[]
    ).map((row) => this.envelope(row.connection_id)!.connection);
  }
  assertCurrent(connection: ChannelConnection) {
    const current = this.get(connection.connectionId);
    if (!current?.enabled || current.revision !== connection.revision)
      throw new AuxError("conflict", "This channel connection changed or stopped.");
  }
  save(connection: ChannelConnection, expectedRevision: string | null) {
    return this.repo.transaction(() => {
      if (connection.provider !== connection.identity.provider)
        throw new AuxError("invalid_params", "Channel identity belongs to another messenger.");
      const previous = this.envelope(connection.connectionId);
      if ((previous?.connection.revision ?? null) !== expectedRevision)
        throw new AuxError("conflict", "This channel connection changed. Reopen it before saving.");
      const value = connectionEnvelope.parse({
        connection,
        lookupKey: previous?.lookupKey ?? randomBytes(32).toString("base64"),
      });
      this.repo.db
        .prepare(
          `INSERT INTO channel_connections(connection_id,revision,workspace_id,enabled,body,created_at,updated_at)
        VALUES(?,?,?,?,?,?,?) ON CONFLICT(connection_id) DO UPDATE SET revision=excluded.revision,workspace_id=excluded.workspace_id,
        enabled=excluded.enabled,body=excluded.body,updated_at=excluded.updated_at`,
        )
        .run(
          connection.connectionId,
          connection.revision,
          connection.workspaceId,
          Number(connection.enabled),
          this.encode("channel_connections", [connection.connectionId], value),
          connection.createdAt,
          connection.updatedAt,
        );
      if (previous && previous.connection.revision !== connection.revision) {
        this.repo.db
          .prepare("DELETE FROM channel_cursors WHERE connection_id=?")
          .run(connection.connectionId);
        this.repo.db
          .prepare(
            "UPDATE channel_messages SET state='retired' WHERE connection_id=? AND state IN ('pending','admitting','running','queued')",
          )
          .run(connection.connectionId);
        this.repo.db
          .prepare(
            "UPDATE channel_outbox SET state=CASE WHEN state='sending' THEN 'unknown' ELSE 'failed' END,updated_at=? WHERE connection_id=? AND state IN ('pending','sending')",
          )
          .run(Date.now(), connection.connectionId);
      }
      return connection;
    });
  }
  remove(connectionId: string) {
    withSecureDelete(this.repo.db, () =>
      this.repo.db.prepare("DELETE FROM channel_connections WHERE connection_id=?").run(connectionId),
    );
  }
  key(connectionId: string, kind: "peer" | "thread" | "message", value: string) {
    const envelope = this.envelope(connectionId);
    if (!envelope) throw new AuxError("not_found", "Channel connection does not exist.");
    return createHmac("sha256", Buffer.from(envelope.lookupKey, "base64"))
      .update(`${kind}\0${value}`)
      .digest("hex");
  }
  peers(connectionId: string): StoredChannelPeer[] {
    return (
      this.repo.db
        .prepare("SELECT peer_key,body FROM channel_peers WHERE connection_id=? ORDER BY peer_key")
        .all(connectionId) as { peer_key: string; body: string }[]
    ).map((row) =>
      this.decode("channel_peers", [connectionId, row.peer_key], row.body, StoredChannelPeerSchema),
    );
  }
  peer(connectionId: string, peerKey: string): StoredChannelPeer | undefined {
    const row = this.repo.db
      .prepare("SELECT body FROM channel_peers WHERE connection_id=? AND peer_key=?")
      .get(connectionId, peerKey) as { body: string } | undefined;
    return row && this.decode("channel_peers", [connectionId, peerKey], row.body, StoredChannelPeerSchema);
  }
  savePeer(connectionId: string, value: StoredChannelPeer) {
    const peer = StoredChannelPeerSchema.parse(value);
    if (peer.peerKey !== this.key(connectionId, "peer", peer.providerUserId))
      throw new AuxError("invalid_params", "Channel peer identity changed.");
    this.repo.db
      .prepare(
        "INSERT INTO channel_peers(connection_id,peer_key,body) VALUES(?,?,?) ON CONFLICT(connection_id,peer_key) DO UPDATE SET body=excluded.body",
      )
      .run(connectionId, peer.peerKey, this.encode("channel_peers", [connectionId, peer.peerKey], peer));
  }
  thread(connectionId: string, peerKey: string, threadKey: string): ChannelThread | undefined {
    const row = this.repo.db
      .prepare("SELECT body FROM channel_threads WHERE connection_id=? AND peer_key=? AND thread_key=?")
      .get(connectionId, peerKey, threadKey) as { body: string } | undefined;
    return row && this.decode("channel_threads", [connectionId, peerKey, threadKey], row.body, threadSchema);
  }
  saveThread(connectionId: string, peerKey: string, threadKey: string, value: ChannelThread) {
    const thread = threadSchema.parse(value);
    this.repo.db
      .prepare(
        `INSERT INTO channel_threads(connection_id,peer_key,thread_key,task_id,body) VALUES(?,?,?,?,?)
      ON CONFLICT(connection_id,peer_key,thread_key) DO UPDATE SET task_id=excluded.task_id,body=excluded.body`,
      )
      .run(
        connectionId,
        peerKey,
        threadKey,
        thread.taskId,
        this.encode("channel_threads", [connectionId, peerKey, threadKey], thread),
      );
  }
  cursor(connection: ChannelConnection): ChannelCursor | undefined {
    const row = this.repo.db
      .prepare("SELECT revision,body FROM channel_cursors WHERE connection_id=?")
      .get(connection.connectionId) as { revision: string; body: string } | undefined;
    if (!row || row.revision !== connection.revision) return undefined;
    return this.decode("channel_cursors", [connection.connectionId], row.body, ChannelCursorSchema);
  }
  /** The checkpoint and deduplicated input commit together before any network ACK. */
  receive(
    connection: ChannelConnection,
    message: ChannelInbound | null,
    cursor?: ChannelCursor | null,
    state: "pending" | "rejected" = "pending",
  ): boolean {
    return this.repo.transaction(() => {
      this.assertCurrent(connection);
      if (cursor && cursor.provider !== connection.provider)
        throw new AuxError("invalid_params", "Channel checkpoint belongs to another messenger.");
      let inserted = false;
      if (message) {
        const messageKey = this.key(connection.connectionId, "message", message.messageId);
        const body = messageBody.parse({ message, messageUuid: randomUUID(), deliveryRunId: randomUUID() });
        inserted =
          this.repo.db
            .prepare(
              `INSERT INTO channel_messages(connection_id,message_key,revision,peer_key,state,body,received_at)
          VALUES(?,?,?,?,?,?,?) ON CONFLICT(connection_id,message_key) DO NOTHING`,
            )
            .run(
              connection.connectionId,
              messageKey,
              connection.revision,
              this.key(connection.connectionId, "peer", message.peerId),
              state,
              this.encode("channel_messages", [connection.connectionId, messageKey], body),
              Date.now(),
            ).changes === 1;
      }
      if (cursor === null)
        this.repo.db
          .prepare("DELETE FROM channel_cursors WHERE connection_id=?")
          .run(connection.connectionId);
      else if (cursor)
        this.repo.db
          .prepare(
            "INSERT INTO channel_cursors(connection_id,revision,body) VALUES(?,?,?) ON CONFLICT(connection_id) DO UPDATE SET revision=excluded.revision,body=excluded.body",
          )
          .run(
            connection.connectionId,
            connection.revision,
            this.encode("channel_cursors", [connection.connectionId], ChannelCursorSchema.parse(cursor)),
          );
      return inserted;
    });
  }
  messages(connectionId: string, states: ChannelMessageState[]): StoredChannelMessage[] {
    if (!states.length) return [];
    return (
      this.repo.db
        .prepare(
          `SELECT * FROM channel_messages WHERE connection_id=? AND state IN (${states.map(() => "?").join(",")}) ORDER BY received_at,message_key`,
        )
        .all(connectionId, ...states) as MessageRow[]
    ).map((row) => ({
      ...this.decode("channel_messages", [row.connection_id, row.message_key], row.body, messageBody),
      connectionId: row.connection_id,
      messageKey: row.message_key,
      revision: row.revision,
      peerKey: row.peer_key,
      state: row.state,
      runId: row.run_id ?? undefined,
      receivedAt: row.received_at,
    }));
  }
  saveMessage(message: StoredChannelMessage) {
    const result = this.repo.db
      .prepare(
        "UPDATE channel_messages SET state=?,run_id=?,body=? WHERE connection_id=? AND message_key=? AND revision=?",
      )
      .run(
        message.state,
        message.runId ?? null,
        this.encode(
          "channel_messages",
          [message.connectionId, message.messageKey],
          messageBody.parse({
            message: message.message,
            messageUuid: message.messageUuid,
            deliveryRunId: message.deliveryRunId,
            needsInputNotified: message.needsInputNotified,
          }),
        ),
        message.connectionId,
        message.messageKey,
        message.revision,
      );
    if (result.changes !== 1) throw new AuxError("conflict", "The original channel message changed.");
  }
  deliveries(connectionId: string): StoredChannelDelivery[] {
    return (
      this.repo.db
        .prepare("SELECT * FROM channel_outbox WHERE connection_id=? ORDER BY created_at,delivery_id")
        .all(connectionId) as DeliveryRow[]
    ).map((row) => ({
      ...this.decode("channel_outbox", [row.delivery_id], row.body, deliveryBody),
      deliveryId: row.delivery_id,
      connectionId: row.connection_id,
      revision: row.revision,
      peerKey: row.peer_key,
      runId: row.run_id ?? undefined,
      state: row.state,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }
  saveDelivery(value: StoredChannelDelivery) {
    const body = deliveryBody.parse({
      conversationId: value.conversationId,
      threadId: value.threadId,
      replyToMessageId: value.replyToMessageId,
      text: value.text,
      providerMessageId: value.providerMessageId,
      errorCode: value.errorCode,
    });
    const previous = this.repo.db
      .prepare("SELECT * FROM channel_outbox WHERE delivery_id=?")
      .get(value.deliveryId) as DeliveryRow | undefined;
    if (previous) {
      const original = this.decode("channel_outbox", [value.deliveryId], previous.body, deliveryBody);
      if (
        previous.connection_id !== value.connectionId ||
        previous.revision !== value.revision ||
        previous.peer_key !== value.peerKey ||
        (previous.run_id ?? undefined) !== value.runId ||
        previous.created_at !== value.createdAt ||
        original.text !== value.text ||
        original.conversationId !== value.conversationId ||
        original.threadId !== value.threadId ||
        original.replyToMessageId !== value.replyToMessageId
      )
        throw new AuxError("conflict", "This delivery belongs to another channel reply.");
    }
    this.repo.db
      .prepare(
        `INSERT INTO channel_outbox(delivery_id,connection_id,revision,peer_key,run_id,state,body,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(delivery_id) DO UPDATE SET state=excluded.state,body=excluded.body,updated_at=excluded.updated_at`,
      )
      .run(
        value.deliveryId,
        value.connectionId,
        value.revision,
        value.peerKey,
        value.runId ?? null,
        value.state,
        this.encode("channel_outbox", [value.deliveryId], body),
        value.createdAt,
        value.updatedAt,
      );
  }
  recover() {
    // A process can die after provider acceptance. Keep the ambiguity; never replay an uncertain send.
    this.repo.db
      .prepare("UPDATE channel_outbox SET state='unknown',updated_at=? WHERE state='sending'")
      .run(Date.now());
  }
}
