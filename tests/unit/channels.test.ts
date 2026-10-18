import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuxError, EventTypes, type Run } from "@aux/contracts";
import type { ChannelCredentials, ChannelInbound } from "@aux/contracts/channels";
import { AgentConnectionService } from "../../apps/runtime/src/services/agent-connections.js";
import { ChannelService } from "../../apps/runtime/src/services/channels.js";
import {
  ChannelTransportError,
  type ChannelDelivery,
  type ChannelReceiver,
} from "../../apps/runtime/src/services/channel-transport.js";
import { ExternalSessionService } from "../../apps/runtime/src/services/external-sessions.js";
import { RunMessageQueue } from "../../apps/runtime/src/services/run-messages.js";
import type { RunService } from "../../apps/runtime/src/services/runs.js";
import { TaskService } from "../../apps/runtime/src/services/tasks.js";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { initializeFieldCodec } from "../../apps/runtime/src/store/field-codec.js";
import { Repo } from "../../apps/runtime/src/store/repo.js";
import { EventBus } from "../../apps/runtime/src/events.js";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import { profileSecrets } from "../support/profile-secrets.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
  vi.restoreAllMocks();
});
const credentials: ChannelCredentials = { provider: "telegram", botToken: "100:synthetic-only" };
const inbound = (
  id: number,
  text = "Synthetic task",
  extra: Partial<ChannelInbound> = {},
): ChannelInbound => ({
  messageId: `300:${id}`,
  peerId: "200",
  peerName: "Synthetic person",
  conversationId: "300",
  text,
  direct: true,
  mentioned: false,
  inThread: false,
  ...extra,
});
async function fixture() {
  const profileId = randomUUID(),
    secrets = profileSecrets(profileId),
    db = openDb(":memory:");
  const native = { ...secrets.native, available: () => true } as unknown as NativeBridge;
  const codec = await initializeFieldCodec(db, native, profileId),
    repo = new Repo(db, codec),
    events = new EventBus(repo);
  const tasks = new TaskService(repo, events),
    workspace = tasks.createWorkspace("Synthetic channel Space");
  const connections = new AgentConnectionService(repo);
  const ownerLive = { value: true };
  const owner = {
    current: async () => {
      if (!ownerLive.value) throw new AuxError("permission_denied", "Original synthetic owner retired");
    },
  };
  const start = vi.fn(async (input: Parameters<RunService["start"]>[0]): Promise<Run> => {
    const run: Run = {
      runId: input.deliveryRunId!,
      goal: input.goal,
      status: "running",
      pageIds: input.pageIds ?? [],
      createdAt: Date.now(),
      config: {
        taskId: input.taskId,
        taskRevision: input.taskRevision,
        chatId: input.chatId,
        contextWorkspaceId: input.contextWorkspaceId,
        externalConnectionId: input.externalConnectionId,
        externalParentRunId: input.externalParentRunId,
        messageRevision: 0,
        contextPageRefs: input.contextPageRefs ?? [],
      },
    };
    repo.saveRun(run);
    events.emit(EventTypes.RunUpdated, { run }, run.runId);
    return run;
  });
  const cancel = vi.fn(async (id: string): Promise<Run> => {
    const run = repo.getRun(id)!;
    const stopped: Run = { ...run, status: "cancelled", endedAt: Date.now() };
    repo.saveRun(stopped);
    events.emit(EventTypes.RunUpdated, { run: stopped }, id);
    return stopped;
  });
  const queue = new RunMessageQueue(
    repo,
    events,
    async (message) => {
      const target = repo.getRun(message.targetRunId)!;
      return start({
        goal: message.text,
        deliveryRunId: message.deliveryRunId,
        taskId: target.config?.taskId,
        taskRevision: target.config?.taskRevision,
        chatId: message.chatId,
        externalConnectionId: target.config?.externalConnectionId,
        externalParentRunId: target.config?.externalParentRunId,
        pageIds: message.pageIds,
        contextPageRefs: message.contextPageRefs,
      });
    },
    () => true,
    () => {},
  );
  const runs = { start, cancel, messages: queue } as unknown as RunService;
  const sessions = new ExternalSessionService(
    repo,
    events,
    fixtureTurnMentions(() => undefined),
    async (id, parent) => {
      for (const run of repo.listRuns(500))
        if (
          run.runId !== parent &&
          run.config?.externalConnectionId === id &&
          ["running", "queued", "needs_input"].includes(run.status)
        )
          await cancel(run.runId);
    },
  );
  const receivers: ChannelReceiver[] = [],
    sends: ChannelDelivery[] = [];
  let unknownNextSend = false,
    factoryOffline = false;
  const transport = vi.fn(async () => {
    if (factoryOffline) throw new ChannelTransportError("network");
    return {
      identity: {
        provider: "telegram" as const,
        botId: "100",
        name: "Synthetic bot",
        username: "SyntheticBot",
      },
      messageLength: 3500,
      run: async (input: ChannelReceiver) => {
        receivers.push(input);
        input.ready();
        await new Promise<void>((resolve) => {
          if (input.signal.aborted) {
            resolve();
            return;
          }
          input.signal.addEventListener("abort", () => resolve(), { once: true });
        });
      },
      send: async (input: ChannelDelivery) => {
        sends.push(input);
        if (unknownNextSend) {
          unknownNextSend = false;
          throw new ChannelTransportError("delivery_unknown");
        }
        return { messageId: String(sends.length) };
      },
    };
  });
  const service = new ChannelService({
    repo,
    native,
    profileId,
    privateProfile: false,
    events,
    connections,
    sessions,
    runs,
    tasks,
    transport,
  });
  cleanup.push(async () => {
    await service.close();
    await queue.stop();
    await sessions.dispose();
    repo.close();
  });
  const save = (audience: "paired" | "everyone" = "paired", followUp: "queue" | "steer" = "queue") =>
    service.save(
      {
        provider: "telegram",
        name: "Synthetic channel",
        workspaceId: workspace.workspaceId,
        enabled: true,
        expectedRevision: null,
        options: { audience, requireMentionsInThreads: true, followUp },
        credentials,
      },
      owner,
    );
  const receive = async (message: ChannelInbound) => {
    await vi.waitFor(() => expect(receivers.length).toBeGreaterThan(0));
    await receivers
      .at(-1)!
      .receive(message, { provider: "telegram", offset: Number(message.messageId.split(":")[1]) + 1 });
  };
  return {
    service,
    repo,
    events,
    connections,
    sessions,
    native,
    secrets,
    workspace,
    owner,
    ownerLive,
    start,
    cancel,
    transport,
    receivers,
    sends,
    save,
    receive,
    setUnknown: () => {
      unknownNextSend = true;
    },
    offline: () => {
      factoryOffline = true;
    },
  };
}

describe("normal Profile messenger ownership", () => {
  it("does not replace a live transport when deferred startup runs after Settings", async () => {
    const f = await fixture();
    await f.save();
    await vi.waitFor(() => expect(f.receivers).toHaveLength(1));
    f.service.start();
    await f.service.list(f.owner);
    expect(f.transport).toHaveBeenCalledOnce();
    expect(f.receivers).toHaveLength(1);
    expect(f.receivers[0]?.signal.aborted).toBe(false);
  });
  it("requires local pairing, deduplicates requests and replies only in the originating task/thread", async () => {
    const f = await fixture(),
      connection = await f.save();
    await f.receive(inbound(1));
    expect(f.start).not.toHaveBeenCalled();
    await f.receive(inbound(2, "/pair"));
    const [peer] = await f.service.peers(connection.connectionId, connection.revision, f.owner);
    expect(peer).toMatchObject({ state: "pending", providerUserId: "200" });
    await f.service.pair(
      connection.connectionId,
      connection.revision,
      peer!.peerKey,
      "pair",
      peer!.requestId,
      f.owner,
    );
    await f.receive(inbound(3));
    await f.receive(inbound(3));
    await vi.waitFor(() => expect(f.start).toHaveBeenCalledOnce());
    const options = f.start.mock.calls[0]![0],
      run = f.repo.getRun(options.deliveryRunId!)!;
    expect(options.nativeTurnContext).toBeUndefined();
    expect(options.agentMode).toBeUndefined();
    expect(run.config?.externalConnectionId).toBeTruthy();
    const finished = {
      ...run,
      status: "completed" as const,
      result: { report: "Synthetic completed answer" },
      endedAt: Date.now(),
    };
    f.repo.saveRun(finished);
    f.events.emit(EventTypes.RunUpdated, { run: finished }, run.runId);
    await vi.waitFor(() => expect(f.sends).toHaveLength(1));
    expect(f.sends[0]).toMatchObject({
      conversationId: "300",
      replyToMessageId: "300:3",
      text: "Synthetic completed answer",
    });
    const calls = f.start.mock.calls.length;
    await f.receive(inbound(4, "Synthetic unaddressed group request", { direct: false }));
    expect(f.start.mock.calls).toHaveLength(calls);
  });

  it.each(["queue", "steer"] as const)("admits %s follow-ups in the original conversation", async (mode) => {
    const f = await fixture();
    const connection = await f.save("everyone", mode);
    await f.receive(inbound(1));
    await vi.waitFor(() => expect(f.start).toHaveBeenCalledOnce());
    const original = f.repo.getRun(f.start.mock.calls[0]![0].deliveryRunId!)!;
    await f.receive(inbound(2, "Synthetic follow-up"));
    await vi.waitFor(() => expect(f.repo.listRunMessages(original.config!.chatId!)).toHaveLength(1));
    const followUp = f.repo.listRunMessages(original.config!.chatId!)[0]!;
    expect(followUp).toMatchObject({ mode, text: "Synthetic follow-up", targetRunId: original.runId });
    const finished = {
      ...f.repo.getRun(original.runId)!,
      status: "completed" as const,
      result: { report: "Synthetic first result" },
      endedAt: Date.now(),
    };
    f.repo.saveRun(finished);
    f.events.emit(EventTypes.RunUpdated, { run: finished }, original.runId);
    await vi.waitFor(() => expect(f.start).toHaveBeenCalledTimes(mode === "queue" ? 2 : 1));
    const last = f.repo.getRun(f.start.mock.calls.at(-1)![0].deliveryRunId!)!;
    expect(last.config?.externalConnectionId).toBe(original.config?.externalConnectionId);
    if (mode === "queue") {
      const second = f.repo.getRun(followUp.deliveryRunId)!;
      const completed = {
        ...second,
        status: "completed" as const,
        result: { report: "Synthetic follow-up result" },
        endedAt: Date.now(),
      };
      f.repo.saveRun(completed);
      f.events.emit(EventTypes.RunUpdated, { run: completed }, second.runId);
    }
    await vi.waitFor(() => expect(f.sends.some((item) => item.replyToMessageId === "300:2")).toBe(true));
    expect(f.service.store.messages(connection.connectionId, ["failed"])).toHaveLength(0);
  });

  it("stops only the originating person's conversation", async () => {
    const f = await fixture();
    await f.save("everyone");
    await f.receive(inbound(1));
    await f.receive(inbound(2, "Another person's task", { peerId: "201" }));
    await vi.waitFor(() => expect(f.start).toHaveBeenCalledTimes(2));
    const first = f.start.mock.calls[0]![0].deliveryRunId!;
    const second = f.start.mock.calls[1]![0].deliveryRunId!;
    await f.receive(inbound(3, "/stop"));
    await vi.waitFor(() =>
      expect(f.cancel).toHaveBeenCalledWith(first, "Stopped by the originating channel person."),
    );
    expect(f.repo.getRun(second)?.status).toBe("running");
    expect(f.cancel).toHaveBeenCalledOnce();
  });

  it("keeps uncertain sends out of automatic retries and preserves explicit retry identity", async () => {
    const f = await fixture(),
      connection = await f.save("everyone");
    await f.receive(inbound(1));
    await vi.waitFor(() => expect(f.start).toHaveBeenCalledOnce());
    f.setUnknown();
    const run = f.repo.getRun(f.start.mock.calls[0]![0].deliveryRunId!)!;
    const finished = {
      ...run,
      status: "completed" as const,
      result: { report: "Synthetic ambiguous reply" },
      endedAt: Date.now(),
    };
    f.repo.saveRun(finished);
    f.events.emit(EventTypes.RunUpdated, { run: finished }, run.runId);
    await vi.waitFor(() =>
      expect(f.service.store.deliveries(connection.connectionId, ["unknown"])).toHaveLength(1),
    );
    f.events.emit(EventTypes.RunUpdated, { run: finished }, run.runId);
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(f.sends).toHaveLength(1);
    const delivery = f.service.store.deliveries(connection.connectionId, ["unknown"])[0]!;
    await f.service.retryDelivery(connection.connectionId, connection.revision, delivery.deliveryId, f.owner);
    await vi.waitFor(() => expect(f.sends).toHaveLength(2));
    expect(f.sends[0]?.deliveryId).toBe(f.sends[1]?.deliveryId);
  });

  it("preserves chunk order and Unicode boundaries in longer replies", async () => {
    const f = await fixture();
    await f.save("everyone");
    await f.receive(inbound(1));
    await vi.waitFor(() => expect(f.start).toHaveBeenCalledOnce());
    const run = f.repo.getRun(f.start.mock.calls[0]![0].deliveryRunId!)!;
    const report = "x".repeat(3499) + "🚀" + "y".repeat(3502);
    const finished = { ...run, status: "completed" as const, result: { report }, endedAt: Date.now() };
    f.repo.saveRun(finished);
    f.events.emit(EventTypes.RunUpdated, { run: finished }, run.runId);
    await vi.waitFor(() => expect(f.sends).toHaveLength(3));
    expect(f.sends.map((item) => item.text).join("")).toBe(report);
    expect(f.sends.every((item) => item.text.length <= 3500 && !/[\uD800-\uDBFF]$/.test(item.text))).toBe(
      true,
    );
  });

  it("cannot retry a past reply with replacement pairing authority", async () => {
    const f = await fixture(),
      connection = await f.save("everyone");
    await f.receive(inbound(1));
    await vi.waitFor(() => expect(f.start).toHaveBeenCalledOnce());
    f.setUnknown();
    const run = f.repo.getRun(f.start.mock.calls[0]![0].deliveryRunId!)!;
    const finished = {
      ...run,
      status: "completed" as const,
      result: { report: "Synthetic past answer" },
      endedAt: Date.now(),
    };
    f.repo.saveRun(finished);
    f.events.emit(EventTypes.RunUpdated, { run: finished }, run.runId);
    await vi.waitFor(() =>
      expect(f.service.store.deliveries(connection.connectionId, ["unknown"])).toHaveLength(1),
    );
    const delivery = f.service.store.deliveries(connection.connectionId, ["unknown"])[0]!;
    const [peer] = await f.service.peers(connection.connectionId, connection.revision, f.owner);
    await f.service.pair(
      connection.connectionId,
      connection.revision,
      peer!.peerKey,
      "block",
      undefined,
      f.owner,
    );
    await f.service.pair(
      connection.connectionId,
      connection.revision,
      peer!.peerKey,
      "pair",
      undefined,
      f.owner,
    );
    await expect(
      f.service.retryDelivery(connection.connectionId, connection.revision, delivery.deliveryId, f.owner),
    ).rejects.toThrow(/cannot be retried/);
    expect(f.sends).toHaveLength(1);
  });

  it("disables a channel during provider outage without another credential request", async () => {
    const f = await fixture(),
      connection = await f.save("everyone");
    await f.receive(inbound(1));
    await vi.waitFor(() => expect(f.start).toHaveBeenCalledOnce());
    const run = f.repo.getRun(f.start.mock.calls[0]![0].deliveryRunId!)!;
    f.offline();
    const factoryCalls = f.transport.mock.calls.length;
    const result = await f.service.save(
      {
        provider: connection.provider,
        name: connection.name,
        workspaceId: connection.workspaceId,
        connectionId: connection.connectionId,
        expectedRevision: connection.revision,
        enabled: false,
        options: connection.options,
      },
      f.owner,
    );
    expect(result.enabled).toBe(false);
    expect(f.transport.mock.calls).toHaveLength(factoryCalls);
    expect(f.receivers[0]?.signal.aborted).toBe(true);
    expect(f.repo.getRun(run.runId)?.status).toBe("cancelled");
    expect(f.connections.list().every((item) => item.revokedAt !== undefined)).toBe(true);
  });

  it("keeps blocked people blocked across reconnect and Everyone audience", async () => {
    const f = await fixture(),
      connection = await f.save("everyone");
    await f.receive(inbound(1));
    await vi.waitFor(() => expect(f.start).toHaveBeenCalledOnce());
    const [peer] = await f.service.peers(connection.connectionId, connection.revision, f.owner);
    await f.service.pair(
      connection.connectionId,
      connection.revision,
      peer!.peerKey,
      "block",
      undefined,
      f.owner,
    );
    await f.service.reconnect(connection.connectionId, connection.revision, f.owner);
    await vi.waitFor(() => expect(f.receivers).toHaveLength(2));
    await f.receive(inbound(2));
    expect(f.start).toHaveBeenCalledOnce();
    expect((await f.service.peers(connection.connectionId, connection.revision, f.owner))[0]?.state).toBe(
      "blocked",
    );
  });

  it("joins and rolls back an accepted credential write when the original window retires", async () => {
    const f = await fixture(),
      original = f.native.storeSecret.bind(f.native);
    let release!: () => void,
      held = false;
    const wait = new Promise<void>((resolve) => {
      release = resolve;
    });
    vi.spyOn(f.native, "storeSecret").mockImplementation(async (name, value) => {
      if (name.startsWith("channel-key-") && value && !held) {
        held = true;
        await wait;
      }
      return original(name, value);
    });
    const saving = f.save().catch((error: unknown) => error);
    await vi.waitFor(() => expect(held).toBe(true));
    f.ownerLive.value = false;
    release();
    expect(await saving).toMatchObject({ code: "permission_denied" });
    expect(f.service.store.list()).toEqual([]);
    expect(
      [...f.secrets.values.entries()]
        .filter(([key]) => key.startsWith("channel-key-"))
        .every(([, value]) => !value),
    ).toBe(true);
    expect(f.receivers).toEqual([]);
  });

  it("keeps disable pending until an originally admitted start retires, without sending a late reply", async () => {
    const f = await fixture(),
      connection = await f.save("everyone");
    const original = f.start.getMockImplementation()!;
    let release!: () => void;
    const wait = new Promise<void>((resolve) => {
      release = resolve;
    });
    f.start.mockImplementation(async (input) => {
      await wait;
      return original(input);
    });
    await f.receive(inbound(1));
    await vi.waitFor(() => expect(f.start).toHaveBeenCalledOnce());
    let finished = false;
    const disabling = f.service
      .save(
        {
          provider: connection.provider,
          name: connection.name,
          workspaceId: connection.workspaceId,
          connectionId: connection.connectionId,
          expectedRevision: connection.revision,
          enabled: false,
          options: connection.options,
        },
        f.owner,
      )
      .finally(() => {
        finished = true;
      });
    await vi.waitFor(() => expect(f.receivers[0]?.signal.aborted).toBe(true));
    expect(finished).toBe(false);
    release();
    await disabling;
    const id = f.start.mock.calls[0]![0].deliveryRunId!;
    expect(f.repo.getRun(id)?.status).toBe("cancelled");
    expect(f.sends).toEqual([]);
  });
});
