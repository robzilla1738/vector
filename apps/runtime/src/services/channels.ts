import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";
import { AuxError } from "@aux/contracts";
import {
  ChannelConnectionSchema,
  ChannelCredentialsSchema,
  ChannelIdentitySchema,
  ChannelSaveParamsSchema,
  ChannelStatusSchema,
  type ChannelConnection,
  type ChannelCredentials,
  type ChannelFailureCode,
  type ChannelIdentity,
  type ChannelSaveParams,
} from "@aux/contracts/channels";
import type { NativeBridge } from "../native.js";
import type { Repo } from "../store/repo.js";
import type { EventBus } from "../events.js";
import type { AgentConnectionService } from "./agent-connections.js";
import type { ExternalSessionService } from "./external-sessions.js";
import type { RunService } from "./runs.js";
import type { TaskService } from "./tasks.js";
import { ChannelRunService } from "./channel-runs.js";
import { ChannelStore, type StoredChannelDelivery, type StoredChannelPeer } from "./channel-store.js";
import { ChannelTransportError, createChannelTransport, type ChannelTransport } from "./channel-transport.js";

export type ChannelControlOwner = { current(): Promise<void> };
type Status = z.infer<typeof ChannelStatusSchema>;
type State = Pick<Status, "status" | "credentialAvailable" | "errorCode">;
type Entry = {
  connection: ChannelConnection;
  controller: AbortController;
  network?: AbortController;
  transport?: ChannelTransport;
  worker?: Promise<void>;
  sender?: Promise<void>;
  reconnect: boolean;
  activated: boolean;
};
type Dependencies = {
  repo: Repo;
  native: NativeBridge;
  profileId: string;
  privateProfile: boolean;
  events: EventBus;
  connections: AgentConnectionService;
  sessions: ExternalSessionService;
  runs: RunService;
  tasks: TaskService;
  transport?: (credentials: ChannelCredentials, signal: AbortSignal) => Promise<ChannelTransport>;
};
const secretSchema = z
  .object({
    version: z.literal(1),
    connectionId: z.string().uuid(),
    identity: ChannelIdentitySchema,
    credentials: ChannelCredentialsSchema,
  })
  .strict();
const secretName = (id: string) => `channel-key-${id}`;
const sameIdentity = (a: ChannelIdentity, b: ChannelIdentity) =>
  a.provider === b.provider &&
  a.botId === b.botId &&
  a.accountId === b.accountId &&
  a.applicationId === b.applicationId;
const safeFailure = (error: unknown): ChannelFailureCode =>
  error instanceof ChannelTransportError ? error.code : "runtime";

/** One normal Profile owns credentials, audience consent, remote authority and every transport producer. */
export class ChannelService {
  readonly store: ChannelStore;
  private workflow: ChannelRunService;
  private active = new Map<string, Entry>();
  private states = new Map<string, State>();
  private retiring = new Map<string, Promise<void>>();
  private controlTail = Promise.resolve();
  private abort = new AbortController();
  private closed = false;
  private closing?: Promise<void>;
  private started = false;
  constructor(private deps: Dependencies) {
    if (deps.privateProfile)
      throw new AuxError("permission_denied", "Channels are unavailable in private windows.");
    this.available();
    this.store = new ChannelStore(deps.repo);
    this.store.recover();
    this.workflow = new ChannelRunService({
      ...deps,
      store: this.store,
      deliveryReady: (id) => this.flush(id),
      failed: (id) => {
        const entry = this.active.get(id);
        if (entry) this.fault(entry, "runtime");
      },
    });
  }
  private available() {
    if (this.closed) throw new AuxError("cancelled", "Channels are closing.");
    if (
      this.deps.privateProfile ||
      !this.deps.profileId ||
      !this.deps.native.available() ||
      !this.deps.repo.columnCipher
    )
      throw new AuxError("permission_denied", "Manage channels in the normal protected Aux Profile.");
  }
  private control<T>(work: () => Promise<T>): Promise<T> {
    const result = this.controlTail.then(work);
    this.controlTail = result.then(
      () => {},
      () => {},
    );
    return result;
  }
  private async original(owner: ChannelControlOwner) {
    this.available();
    await owner.current();
    this.available();
  }
  private changed(connectionId: string) {
    this.deps.events.emit("channels.changed", { connectionId });
  }
  private setState(connectionId: string, state: State) {
    this.states.set(connectionId, state);
    this.changed(connectionId);
  }
  private current(entry: Entry) {
    entry.controller.signal.throwIfAborted();
    if (this.closed || this.active.get(entry.connection.connectionId) !== entry)
      throw new AuxError("cancelled", "The original channel transport retired.");
    this.store.assertCurrent(entry.connection);
  }
  private status(connection: ChannelConnection): Status {
    const state = this.states.get(connection.connectionId) ?? {
      status: "offline" as const,
      credentialAvailable: false,
    };
    const counts = this.store.counts(connection.connectionId);
    return ChannelStatusSchema.parse({
      ...connection,
      ...state,
      pendingMessages: counts.pendingMessages,
      uncertainDeliveries: counts.uncertainDeliveries,
    });
  }
  async list(owner: ChannelControlOwner): Promise<Status[]> {
    await this.original(owner);
    this.start();
    const connections = this.store.list();
    for (const connection of connections)
      if (!this.states.has(connection.connectionId)) {
        let credentialAvailable = false;
        try {
          await this.readCredentials(connection);
          credentialAvailable = true;
        } catch {
          /* A disconnected row can be inspected without a functioning OS credential. */
        }
        await this.original(owner);
        this.states.set(connection.connectionId, { status: "offline", credentialAvailable });
      }
    const result = connections.map((connection) => this.status(connection));
    await this.original(owner);
    return result;
  }
  start() {
    this.available();
    if (this.started) return;
    this.started = true;
    for (const connection of this.store.list())
      if (
        connection.enabled &&
        !this.active.has(connection.connectionId) &&
        !this.retiring.has(connection.connectionId)
      )
        this.install(connection);
  }
  private async readCredentials(connection: ChannelConnection): Promise<ChannelCredentials> {
    let value: string | undefined;
    try {
      value = (await this.deps.native.readSecret(secretName(connection.connectionId))).value;
    } catch {
      throw new ChannelTransportError("runtime");
    }
    let decoded: unknown;
    try {
      decoded = value ? JSON.parse(value) : undefined;
    } catch {
      throw new ChannelTransportError("authentication");
    }
    const parsed = secretSchema.safeParse(decoded);
    if (
      !parsed.success ||
      parsed.data.connectionId !== connection.connectionId ||
      parsed.data.credentials.provider !== connection.provider ||
      !sameIdentity(parsed.data.identity, connection.identity)
    )
      throw new ChannelTransportError("authentication");
    return parsed.data.credentials;
  }
  private createTransport(credentials: ChannelCredentials, signal: AbortSignal) {
    return (this.deps.transport ?? createChannelTransport)(credentials, signal);
  }
  save(input: ChannelSaveParams, owner: ChannelControlOwner): Promise<Status> {
    const value = ChannelSaveParamsSchema.parse(input);
    return this.control(async () => {
      await this.original(owner);
      const previous = value.connectionId ? this.store.get(value.connectionId) : undefined;
      if ((previous?.revision ?? null) !== value.expectedRevision || (value.connectionId && !previous))
        throw new AuxError("conflict", "This channel changed. Reopen it before saving.");
      if (!this.deps.repo.getWorkspace(value.workspaceId))
        throw new AuxError("not_found", "The selected Space no longer exists.");
      if (previous && previous.provider !== value.provider)
        throw new AuxError("invalid_params", "Add a separate connection for another messenger.");
      if (previous && !value.enabled && !value.credentials) {
        const stopped = ChannelConnectionSchema.parse({
          ...previous,
          name: value.name,
          workspaceId: value.workspaceId,
          options: value.options,
          enabled: false,
          revision: randomUUID(),
          updatedAt: Date.now(),
        });
        this.store.save(stopped, previous.revision);
        await this.retire(previous);
        this.rotatePeers(stopped, previous.workspaceId === stopped.workspaceId);
        this.setState(stopped.connectionId, {
          status: "offline",
          credentialAvailable: this.states.get(stopped.connectionId)?.credentialAvailable ?? false,
        });
        return this.status(stopped);
      }
      const credentials = value.credentials ?? (previous ? await this.readCredentials(previous) : undefined);
      if (!credentials) throw new AuxError("invalid_params", "Enter this messenger's credentials.");
      await this.original(owner);
      const transport = await this.createTransport(credentials, this.abort.signal);
      await this.original(owner);
      if (previous && !sameIdentity(previous.identity, transport.identity))
        throw new AuxError(
          "conflict",
          "These credentials belong to another bot. Add it as a separate connection.",
        );
      if (
        this.store
          .list()
          .some(
            (item) =>
              item.connectionId !== previous?.connectionId && sameIdentity(item.identity, transport.identity),
          )
      )
        throw new AuxError("conflict", "This bot is already connected in this Profile.");
      const now = Date.now(),
        connection = ChannelConnectionSchema.parse({
          connectionId: previous?.connectionId ?? randomUUID(),
          revision: randomUUID(),
          provider: value.provider,
          name: value.name,
          workspaceId: value.workspaceId,
          enabled: value.enabled,
          options: value.options,
          identity: transport.identity,
          createdAt: previous?.createdAt ?? now,
          updatedAt: now,
        });
      let before: string | undefined,
        attempted = false,
        committed = false;
      try {
        try {
          before = (await this.deps.native.readSecret(secretName(connection.connectionId))).value;
        } catch {
          throw new ChannelTransportError("runtime");
        }
        await this.original(owner);
        attempted = true;
        const saved = await this.deps.native.storeSecret(
          secretName(connection.connectionId),
          JSON.stringify(
            secretSchema.parse({
              version: 1,
              connectionId: connection.connectionId,
              identity: connection.identity,
              credentials,
            }),
          ),
        );
        if (!saved.ok) throw new ChannelTransportError("runtime");
        await this.original(owner);
        this.store.save(connection, value.expectedRevision);
        committed = true;
      } catch (error) {
        if (attempted && !committed) {
          try {
            if (!(await this.deps.native.storeSecret(secretName(connection.connectionId), before ?? "")).ok)
              throw new Error("Credential rollback refused");
          } catch {
            throw new AuxError(
              "backend_unavailable",
              "The credential write could not be retired. Reopen Channels before continuing.",
            );
          }
        }
        if (error instanceof AuxError || error instanceof ChannelTransportError) throw error;
        throw new ChannelTransportError("runtime");
      }
      if (previous) await this.retire(previous);
      this.available();
      this.rotatePeers(connection, !previous || previous.workspaceId === connection.workspaceId);
      this.setState(connection.connectionId, {
        status: connection.enabled ? "connecting" : "offline",
        credentialAvailable: true,
      });
      if (connection.enabled && !this.closed) this.install(connection, transport);
      return this.status(connection);
    });
  }
  private requireConnection(connectionId: string, revision: string) {
    const connection = this.store.get(connectionId);
    if (!connection || connection.revision !== revision)
      throw new AuxError("conflict", "This channel changed. Reopen it before continuing.");
    return connection;
  }
  private rotatePeers(connection: ChannelConnection, preservePairing: boolean) {
    for (const peer of this.store.peers(connection.connectionId)) {
      const paired = preservePairing && peer.state === "paired";
      const updated: StoredChannelPeer = {
        ...peer,
        authorityId: undefined,
        requestId: undefined,
        expiresAt: undefined,
        state: peer.state === "blocked" ? "blocked" : paired ? "paired" : "pending",
        updatedAt: Date.now(),
      };
      this.store.savePeer(connection.connectionId, updated);
      if (connection.enabled && paired) this.workflow.grant(connection, updated);
    }
  }
  reconnect(connectionId: string, revision: string, owner: ChannelControlOwner): Promise<Status> {
    return this.control(async () => {
      await this.original(owner);
      const connection = this.requireConnection(connectionId, revision);
      if (!connection.enabled) throw new AuxError("conflict", "Enable this channel before reconnecting.");
      const entry = this.active.get(connectionId);
      if (entry) {
        entry.reconnect = true;
        entry.network?.abort();
      } else {
        const credentials = await this.readCredentials(connection);
        await this.original(owner);
        const transport = await this.createTransport(credentials, this.abort.signal);
        await this.original(owner);
        this.requireConnection(connectionId, revision);
        if (!sameIdentity(connection.identity, transport.identity))
          throw new ChannelTransportError("identity");
        await this.retire(connection);
        this.available();
        this.rotatePeers(connection, true);
        this.install(connection, transport);
      }
      return this.status(connection);
    });
  }
  remove(connectionId: string, revision: string, owner: ChannelControlOwner): Promise<{ removed: true }> {
    return this.control(async () => {
      await this.original(owner);
      const previous = this.requireConnection(connectionId, revision);
      const disabled = { ...previous, enabled: false, revision: randomUUID(), updatedAt: Date.now() };
      this.store.save(disabled, previous.revision);
      this.setState(connectionId, { status: "offline", credentialAvailable: true });
      await this.retire(previous);
      await this.original(owner);
      try {
        if (!(await this.deps.native.storeSecret(secretName(connectionId), "")).ok)
          throw new Error("Credential removal refused");
      } catch {
        throw new AuxError(
          "backend_unavailable",
          "The channel stopped. Its credentials could not be removed; try Remove again.",
        );
      }
      this.states.set(connectionId, { status: "offline", credentialAvailable: false });
      await this.original(owner);
      this.store.remove(connectionId);
      this.states.delete(connectionId);
      this.changed(connectionId);
      return { removed: true };
    });
  }
  peers(connectionId: string, revision: string, owner: ChannelControlOwner) {
    return this.control(async () => {
      await this.original(owner);
      this.requireConnection(connectionId, revision);
      return this.store.peers(connectionId).map(({ authorityId: _authority, ...peer }) => peer);
    });
  }
  pair(
    connectionId: string,
    revision: string,
    peerKey: string,
    action: "pair" | "block",
    requestId: string | undefined,
    owner: ChannelControlOwner,
  ) {
    return this.control(async () => {
      await this.original(owner);
      const connection = this.requireConnection(connectionId, revision),
        peer = this.store.peer(connectionId, peerKey);
      if (!peer) throw new AuxError("not_found", "This channel person is no longer available.");
      if (
        action === "pair" &&
        peer.requestId &&
        (requestId !== peer.requestId || !peer.expiresAt || peer.expiresAt <= Date.now())
      )
        throw new AuxError("conflict", "This pairing request expired. Send /pair to the bot again.");
      if (
        action === "pair" &&
        peer.state !== "blocked" &&
        peer.authorityId &&
        this.deps.connections.isLive({
          external: true,
          connectionId: peer.authorityId,
          scope: { kind: "workspace", workspaceId: connection.workspaceId },
        })
      ) {
        const paired = {
          ...peer,
          state: "paired" as const,
          requestId: undefined,
          expiresAt: undefined,
          updatedAt: Date.now(),
        };
        this.store.savePeer(connectionId, paired);
        this.changed(connectionId);
        const { authorityId: _authority, ...result } = paired;
        return result;
      }
      this.deps.repo.transaction(() => {
        this.store.savePeer(connectionId, {
          ...peer,
          state: "blocked",
          authorityId: undefined,
          updatedAt: Date.now(),
        });
        this.store.retirePeerWork(connectionId, peerKey);
        if (peer.authorityId) this.revoke(peer.authorityId);
      });
      if (peer.authorityId) {
        await this.deps.sessions.end(peer.authorityId, "cancelled", "Channel pairing changed");
        await this.original(owner);
        this.requireConnection(connectionId, revision);
      }
      let updated: StoredChannelPeer = {
        ...peer,
        state: action === "pair" ? "paired" : "blocked",
        authorityId: undefined,
        requestId: undefined,
        expiresAt: undefined,
        updatedAt: Date.now(),
      };
      this.store.savePeer(connectionId, updated);
      if (action === "pair" && connection.enabled) updated = this.workflow.grant(connection, updated);
      this.changed(connectionId);
      const { authorityId: _authority, ...result } = updated;
      return result;
    });
  }
  deliveries(connectionId: string, revision: string, owner: ChannelControlOwner) {
    return this.control(async () => {
      await this.original(owner);
      const connection = this.requireConnection(connectionId, revision);
      return this.store
        .deliveries(connectionId, ["failed", "unknown"])
        .slice(-50)
        .map((item) => ({
          deliveryId: item.deliveryId,
          connectionId: item.connectionId,
          state: item.state,
          errorCode: item.errorCode,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          text: item.text,
          peerName: this.store.peer(connectionId, item.peerKey)?.name ?? "Original person",
          conversationId: item.conversationId,
          canRetry: connection.enabled && item.revision === revision && this.allowedReply(connection, item),
        }));
    });
  }
  retryDelivery(connectionId: string, revision: string, deliveryId: string, owner: ChannelControlOwner) {
    return this.control(async () => {
      await this.original(owner);
      const connection = this.requireConnection(connectionId, revision);
      const delivery = this.store
        .deliveries(connectionId, ["failed", "unknown"])
        .find((item) => item.deliveryId === deliveryId);
      if (
        !connection.enabled ||
        !delivery ||
        delivery.revision !== revision ||
        !this.allowedReply(connection, delivery)
      )
        throw new AuxError("conflict", "The original reply cannot be retried on this connection.");
      this.store.saveDelivery({
        ...delivery,
        state: "pending",
        errorCode: undefined,
        retryAt: undefined,
        updatedAt: Date.now(),
      });
      this.flush(connectionId);
      this.changed(connectionId);
      return { queued: true as const };
    });
  }
  private allowed(connection: ChannelConnection, peerKey: string) {
    const peer = this.store.peer(connection.connectionId, peerKey);
    return (
      peer &&
      peer.state !== "blocked" &&
      (peer.state === "paired" || connection.options.audience === "everyone") &&
      peer.authorityId &&
      this.deps.connections.isLive({
        external: true,
        connectionId: peer.authorityId,
        scope: { kind: "workspace", workspaceId: connection.workspaceId },
      })
    );
  }
  private allowedReply(connection: ChannelConnection, delivery: StoredChannelDelivery) {
    if (!this.allowed(connection, delivery.peerKey) || !delivery.replyToMessageId) return false;
    const source = this.store.message(connection.connectionId, delivery.replyToMessageId);
    const peer = this.store.peer(connection.connectionId, delivery.peerKey);
    if (
      !source ||
      !peer ||
      source.authorityId !== peer.authorityId ||
      source.revision !== connection.revision ||
      source.peerKey !== delivery.peerKey ||
      ["retired", "rejected"].includes(source.state) ||
      source.message.conversationId !== delivery.conversationId ||
      source.message.threadId !== delivery.threadId ||
      source.runId !== delivery.runId
    )
      return false;
    if (!delivery.runId) return true;
    const run = this.deps.repo.getRun(delivery.runId);
    const key = this.store.key(
      connection.connectionId,
      "thread",
      JSON.stringify([delivery.conversationId, delivery.threadId ?? null]),
    );
    const thread = this.store.thread(connection.connectionId, delivery.peerKey, key);
    return Boolean(
      run &&
      thread &&
      run.config?.externalConnectionId === peer.authorityId &&
      run.config?.taskId === thread.taskId,
    );
  }
  private install(connection: ChannelConnection, verified?: ChannelTransport) {
    const entry: Entry = {
      connection,
      controller: new AbortController(),
      reconnect: false,
      activated: false,
    };
    this.active.set(connection.connectionId, entry);
    this.setState(connection.connectionId, { status: "connecting", credentialAvailable: Boolean(verified) });
    entry.worker = this.loop(entry, verified).catch((error: unknown) => {
      if (!entry.controller.signal.aborted) this.fault(entry, safeFailure(error));
    });
  }
  private async loop(entry: Entry, verified?: ChannelTransport) {
    let failures = 0;
    while (!entry.controller.signal.aborted) {
      entry.network = new AbortController();
      const signal = AbortSignal.any([entry.controller.signal, entry.network.signal]);
      let wait = 0;
      try {
        this.current(entry);
        const credentials = await this.readCredentials(entry.connection);
        this.current(entry);
        const transport = verified ?? (await this.createTransport(credentials, signal));
        verified = undefined;
        this.current(entry);
        if (!sameIdentity(entry.connection.identity, transport.identity))
          throw new ChannelTransportError("identity");
        entry.transport = transport;
        if (!entry.activated) {
          this.workflow.activate(entry.connection, entry.controller.signal);
          entry.activated = true;
        }
        await transport.run({
          signal,
          cursor: this.store.cursor(entry.connection),
          ready: () => {
            this.current(entry);
            failures = 0;
            this.setState(entry.connection.connectionId, { status: "connected", credentialAvailable: true });
            this.flush(entry.connection.connectionId);
          },
          receive: async (message, cursor) => {
            this.current(entry);
            signal.throwIfAborted();
            this.workflow.receive(entry.connection, message, cursor);
          },
        });
        if (!signal.aborted) throw new ChannelTransportError("network");
      } catch (error) {
        if (entry.controller.signal.aborted) return;
        if (!signal.aborted || !entry.reconnect) {
          const code = safeFailure(error);
          if (["authentication", "identity", "scope", "webhook", "runtime"].includes(code)) throw error;
          this.setState(entry.connection.connectionId, {
            status: "offline",
            credentialAvailable: true,
            errorCode: code,
          });
          wait =
            error instanceof ChannelTransportError && error.retryAfterMs !== undefined
              ? error.retryAfterMs
              : Math.min(30000, 500 * 2 ** Math.min(++failures, 6)) + Math.random() * 500;
        }
      } finally {
        entry.network.abort();
        await entry.sender;
        entry.transport = undefined;
      }
      if (entry.reconnect) {
        entry.reconnect = false;
        wait = 0;
      }
      if (wait) {
        entry.network = new AbortController();
        try {
          await delay(wait, undefined, {
            signal: AbortSignal.any([entry.controller.signal, entry.network.signal]),
          });
        } catch (error) {
          if (!entry.reconnect) throw error;
        }
        entry.reconnect = false;
      }
    }
  }
  private flush(connectionId: string) {
    const entry = this.active.get(connectionId);
    if (
      !entry ||
      entry.sender ||
      !entry.transport ||
      !entry.network ||
      this.states.get(connectionId)?.status !== "connected"
    )
      return;
    const transport = entry.transport,
      signal = AbortSignal.any([entry.controller.signal, entry.network.signal]);
    entry.sender = (async () => {
      for (;;) {
        this.current(entry);
        signal.throwIfAborted();
        const pending = this.store.deliveries(connectionId, ["pending"])[0];
        if (!pending) return;
        if (pending.revision !== entry.connection.revision || !this.allowedReply(entry.connection, pending)) {
          this.store.saveDelivery({ ...pending, state: "failed", updatedAt: Date.now() });
          continue;
        }
        if (pending.retryAt && pending.retryAt > Date.now())
          await delay(pending.retryAt - Date.now(), undefined, { signal });
        this.current(entry);
        signal.throwIfAborted();
        const sending = {
          ...pending,
          state: "sending" as const,
          errorCode: undefined,
          retryAt: undefined,
          updatedAt: Date.now(),
        };
        this.store.saveDelivery(sending);
        try {
          const result = await transport.send(sending, signal);
          this.store.saveDelivery({
            ...sending,
            state: "delivered",
            providerMessageId: result.messageId,
            updatedAt: Date.now(),
          });
        } catch (error) {
          const code = signal.aborted ? "delivery_unknown" : safeFailure(error);
          if (error instanceof ChannelTransportError && code === "rate_limited") {
            this.store.saveDelivery({
              ...sending,
              state: "pending",
              errorCode: code,
              retryAt: Date.now() + (error.retryAfterMs ?? 30000),
              updatedAt: Date.now(),
            });
          } else
            this.store.saveDelivery({
              ...sending,
              state: code === "delivery_unknown" ? "unknown" : "failed",
              errorCode: code,
              updatedAt: Date.now(),
            });
          if (["authentication", "identity", "scope", "runtime"].includes(code)) throw error;
        }
        this.changed(connectionId);
      }
    })()
      .catch((error: unknown) => {
        if (!signal.aborted) this.fault(entry, safeFailure(error));
      })
      .finally(() => {
        entry.sender = undefined;
        if (
          !signal.aborted &&
          this.active.get(connectionId) === entry &&
          this.store.deliveries(connectionId, ["pending"]).length
        )
          this.flush(connectionId);
      });
  }
  private revoke(authorityId: string) {
    try {
      this.deps.connections.revoke(authorityId);
    } catch (error) {
      if (!(error instanceof AuxError && error.code === "not_found")) throw error;
    }
  }
  private fault(entry: Entry, code: ChannelFailureCode) {
    this.setState(entry.connection.connectionId, {
      status: "needs_attention",
      credentialAvailable: code !== "authentication",
      errorCode: code,
    });
    void this.retire(entry.connection).catch(() => {
      this.states.set(entry.connection.connectionId, {
        status: "needs_attention",
        credentialAvailable: false,
        errorCode: "runtime",
      });
    });
  }
  private async retire(connection: ChannelConnection): Promise<void> {
    const id = connection.connectionId,
      previous = this.retiring.get(id);
    if (previous) return previous;
    const entry = this.active.get(id);
    this.active.delete(id);
    entry?.controller.abort();
    const admission = this.workflow.retire(id);
    const peers = this.store.peers(id);
    for (const peer of peers) if (peer.authorityId) this.revoke(peer.authorityId);
    this.store.retireWork(id);
    const work = Promise.allSettled([
      admission,
      entry?.worker,
      entry?.sender,
      ...peers.flatMap((peer) =>
        peer.authorityId
          ? [this.deps.sessions.end(peer.authorityId, "cancelled", "Channel connection retired")]
          : [],
      ),
    ])
      .then((results) => {
        if (results.some((result) => result.status === "rejected"))
          throw new AuxError("backend_unavailable", "Channel retirement needs attention in Aux.");
      })
      .finally(() => {
        this.retiring.delete(id);
      });
    this.retiring.set(id, work);
    await work;
  }
  close(): Promise<void> {
    if (this.closing) return this.closing;
    this.closed = true;
    this.abort.abort();
    const retiring = [...this.active.values()].map((entry) => this.retire(entry.connection));
    this.closing = (async () => {
      await this.controlTail;
      const remaining = this.store.list().map((connection) => this.retire(connection));
      const results = await Promise.allSettled([...retiring, ...remaining, ...this.retiring.values()]);
      await this.workflow.close();
      if (results.some((result) => result.status === "rejected"))
        throw new AuxError("backend_unavailable", "Channel retirement is incomplete.");
    })();
    return this.closing;
  }
}
