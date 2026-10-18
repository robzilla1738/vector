import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ChannelCredentials, ChannelInbound, ChannelCursor } from "@aux/contracts/channels";
import {
  createChannelTransport,
  channelSocketUrl,
  type ChannelNetwork,
  type ChannelReceiver,
} from "../../apps/runtime/src/services/channel-transport.js";

class SocketFixture extends EventEmitter {
  readonly OPEN = 1;
  readyState = 1;
  sent: Record<string, unknown>[] = [];
  send(text: string, callback: (error?: Error) => void) {
    this.sent.push(JSON.parse(text));
    callback();
  }
  terminate() {
    if (this.readyState === 3) return;
    this.readyState = 3;
    queueMicrotask(() => this.emit("close", 1000));
  }
  frame(value: unknown) {
    this.emit("message", Buffer.from(JSON.stringify(value)));
  }
}
const slack: ChannelCredentials = {
  provider: "slack",
  botToken: "synthetic-slack-bot",
  appToken: "synthetic-slack-app",
};
const telegram: ChannelCredentials = { provider: "telegram", botToken: "100:synthetic-telegram" };
const discord: ChannelCredentials = { provider: "discord", botToken: "synthetic-discord" };
function fixture(
  provider: ChannelCredentials["provider"],
  override?: (method: string, body: Record<string, unknown>) => unknown,
) {
  const socket = new SocketFixture();
  const calls: { method: string; body: Record<string, unknown>; init: RequestInit }[] = [];
  const network: ChannelNetwork = {
    socket: async () => socket,
    fetch: async (url, init = {}) => {
      const method = new URL(String(url)).pathname.split("/").at(-1)!;
      const body = init.body ? JSON.parse(String(init.body)) : {};
      calls.push({ method, body, init });
      const custom = override?.(method, body);
      if (custom instanceof Response) return custom;
      if (custom !== undefined) return Response.json(custom);
      if (provider === "slack")
        return Response.json({
          ok: true,
          ...(
            {
              "auth.test": { bot_id: "B1", user_id: "U1", team_id: "T1" },
              "bots.info": { bot: { id: "B1", user_id: "U1", app_id: "A1", name: "Synthetic bot" } },
              "apps.connections.open": { url: "wss://wss.slack.com/link?ticket=synthetic" },
              "chat.postMessage": { ts: "12.34" },
            } as Record<string, Record<string, unknown>>
          )[method],
        });
      if (provider === "telegram")
        return Response.json({
          ok: true,
          result:
            (
              {
                getMe: { id: 100, is_bot: true, first_name: "Synthetic bot", username: "SyntheticBot" },
                getWebhookInfo: { url: "" },
                sendMessage: { message_id: 12 },
              } as Record<string, unknown>
            )[method] ?? [],
        });
      if (method === "@me")
        return Response.json(
          String(url).includes("oauth2")
            ? { id: "100", bot: { id: "100", username: "bot", bot: true } }
            : { id: "100", username: "bot", bot: true },
        );
      if (method === "bot") return Response.json({ url: "wss://gateway.discord.gg" });
      if (method === "messages") return Response.json({ id: "987" });
      return Response.json({ id: method, type: 12, parent_id: "300", guild_id: "400" });
    },
  };
  return { socket, calls, network };
}
const controllers: AbortController[] = [];
afterEach(() => {
  for (const controller of controllers.splice(0)) controller.abort();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
function receiver(receive: ChannelReceiver["receive"] = async () => {}, cursor?: ChannelCursor) {
  const controller = new AbortController();
  controllers.push(controller);
  return { controller, input: { signal: controller.signal, ready: vi.fn(), receive, cursor } };
}
function slackHello(socket: SocketFixture, appId = "A1") {
  socket.frame({ type: "hello", connection_info: { app_id: appId } });
}
function slackEvent(socket: SocketFixture, envelope = "e1", extra: Record<string, unknown> = {}) {
  socket.frame({
    type: "events_api",
    envelope_id: envelope,
    payload: {
      api_app_id: "A1",
      team_id: "T1",
      event: {
        type: "message",
        user: "U2",
        channel: "C1",
        ts: "123.45",
        text: "<@U1> Synthetic task",
        ...extra,
      },
    },
  });
}
function discordHello(socket: SocketFixture) {
  socket.frame({ op: 10, d: { heartbeat_interval: 1000 } });
}
function discordReady(socket: SocketFixture, botId = "100") {
  socket.frame({
    op: 0,
    t: "READY",
    s: 1,
    d: {
      user: { id: botId, username: "bot", bot: true },
      application: { id: "100" },
      session_id: "synthetic-session",
      resume_gateway_url: "wss://gateway.discord.gg",
    },
  });
}

describe("messenger transport authority and delivery", () => {
  it("refuses insecure, credential-bearing and unrelated socket destinations", () => {
    for (const url of [
      "ws://gateway.discord.gg",
      "wss://gateway.discord.gg.attacker.test",
      "wss://user:secret@gateway.discord.gg",
      "wss://gateway.discord.gg:444",
    ])
      expect(() => channelSocketUrl(url, "discord.gg")).toThrow();
    expect(channelSocketUrl("wss://wss.slack.com/link?ticket=synthetic", "slack.com")).toContain(
      "wss.slack.com",
    );
  });

  it("never replaces an existing Telegram webhook", async () => {
    const f = fixture("telegram", (method) =>
      method === "getWebhookInfo"
        ? { ok: true, result: { url: "https://existing.example.test" } }
        : undefined,
    );
    const { input } = receiver();
    await expect(createChannelTransport(telegram, input.signal, f.network)).rejects.toMatchObject({
      code: "webhook",
    });
    expect(f.calls.map((call) => call.method)).toEqual(["getMe", "getWebhookInfo"]);
  });

  it("advances Telegram offsets only after durable receipt and rejects anonymous and bot senders", async () => {
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const seen: (ChannelInbound | null)[] = [];
    const update = {
      update_id: 4,
      message: {
        message_id: 50,
        from: { id: 200, is_bot: false, first_name: "Synthetic" },
        chat: { id: -10, type: "supergroup" },
        text: "@SyntheticBot task",
        entities: [{ type: "mention", offset: 0, length: 13 }],
        is_topic_message: true,
        message_thread_id: 30,
      },
    };
    const { controller, input } = receiver(
      async (message) => {
        seen.push(message);
        await held;
      },
      { provider: "telegram", offset: 4 },
    );
    const f = fixture("telegram", (method, body) => {
      if (method !== "getUpdates") return undefined;
      if (body.offset === 4)
        return {
          ok: true,
          result: [
            update,
            { ...update, update_id: 5, message: { ...update.message, sender_chat: { id: -10 } } },
            {
              ...update,
              update_id: 6,
              message: { ...update.message, from: { ...update.message.from, is_bot: true } },
            },
          ],
        };
      controller.abort();
      return { ok: true, result: [] };
    });
    const transport = await createChannelTransport(telegram, input.signal, f.network);
    const running = transport.run(input).catch((error: unknown) => error);
    await vi.waitFor(() => expect(seen).toHaveLength(1));
    expect(f.calls.filter((call) => call.method === "getUpdates")).toHaveLength(1);
    expect(seen[0]).toMatchObject({
      peerId: "200",
      messageId: "-10:50",
      conversationId: "-10",
      threadId: "30",
      mentioned: true,
    });
    release();
    await running;
    expect(seen.slice(1)).toEqual([null, null]);
    expect(f.calls.at(-1)?.body.offset).toBe(7);
  });

  it("binds Slack app and bot tokens before admitting or acknowledging any envelope", async () => {
    const f = fixture("slack");
    const { input } = receiver(vi.fn());
    const transport = await createChannelTransport(slack, input.signal, f.network);
    const running = transport.run(input).catch((error: unknown) => error);
    await vi.waitFor(() => expect(f.socket.listenerCount("message")).toBe(1));
    slackHello(f.socket, "OTHER_APP");
    slackEvent(f.socket);
    expect(await running).toMatchObject({ code: "identity" });
    expect(input.receive).not.toHaveBeenCalled();
    expect(f.socket.sent).toEqual([]);
    expect(f.calls.find((call) => call.method === "apps.connections.open")?.init.headers).toMatchObject({
      Authorization: "Bearer synthetic-slack-app",
    });
  });

  it("ACKs Slack after durable storage, preserves canonical duplicate identity, and joins storage on abort", async () => {
    const f = fixture("slack");
    const seen: ChannelInbound[] = [];
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const { controller, input } = receiver(async (message) => {
      if (message) seen.push(message);
      await held;
    });
    const transport = await createChannelTransport(slack, input.signal, f.network);
    let finished = false;
    const running = transport
      .run(input)
      .catch(() => {})
      .finally(() => {
        finished = true;
      });
    await vi.waitFor(() => expect(f.socket.listenerCount("message")).toBe(1));
    slackHello(f.socket);
    slackEvent(f.socket);
    await vi.waitFor(() => expect(seen).toHaveLength(1));
    expect(f.socket.sent).toEqual([]);
    release();
    await vi.waitFor(() => expect(f.socket.sent).toEqual([{ envelope_id: "e1" }]));
    slackEvent(f.socket, "e2", { type: "app_mention" });
    await vi.waitFor(() => expect(seen).toHaveLength(2));
    expect(seen[0]?.messageId).toBe(seen[1]?.messageId);
    expect(seen[0]?.threadId).toBe("123.45");
    controller.abort();
    await running;
    expect(finished).toBe(true);
    expect(f.socket.readyState).toBe(3);
  });

  it("leaves a retired Slack envelope unacknowledged until its admitted storage finishes", async () => {
    const f = fixture("slack");
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const { controller, input } = receiver(vi.fn(() => held));
    const transport = await createChannelTransport(slack, input.signal, f.network);
    let finished = false;
    const running = transport
      .run(input)
      .catch(() => {})
      .finally(() => {
        finished = true;
      });
    await vi.waitFor(() => expect(f.socket.listenerCount("message")).toBe(1));
    slackHello(f.socket);
    slackEvent(f.socket);
    await vi.waitFor(() => expect(input.receive).toHaveBeenCalledOnce());
    controller.abort();
    await Promise.resolve();
    await Promise.resolve();
    expect(finished).toBe(false);
    expect(f.socket.sent).toEqual([]);
    release();
    await running;
    expect(f.socket.sent).toEqual([]);
  });

  it("checks Discord READY identity before setting connected", async () => {
    const f = fixture("discord");
    const { input } = receiver();
    const transport = await createChannelTransport(discord, input.signal, f.network);
    const running = transport.run(input).catch((error: unknown) => error);
    await vi.waitFor(() => expect(f.socket.listenerCount("message")).toBe(1));
    discordHello(f.socket);
    discordReady(f.socket, "999");
    expect(await running).toMatchObject({ code: "identity" });
    expect(input.ready).not.toHaveBeenCalled();
  });

  it("resumes Discord after its durable sequence and maps actual thread channels", async () => {
    const f = fixture("discord");
    const seen: { message: ChannelInbound | null; cursor?: ChannelCursor | null }[] = [];
    const cursor = {
      provider: "discord" as const,
      sequence: 10,
      sessionId: "saved-session",
      resumeUrl: "wss://gateway.discord.gg",
    };
    const { controller, input } = receiver(async (message, checkpoint) => {
      seen.push({ message, cursor: checkpoint });
    }, cursor);
    const transport = await createChannelTransport(discord, input.signal, f.network);
    const running = transport.run(input).catch(() => {});
    await vi.waitFor(() => expect(f.socket.listenerCount("message")).toBe(1));
    discordHello(f.socket);
    await vi.waitFor(() =>
      expect(f.socket.sent[0]).toMatchObject({ op: 6, d: { session_id: "saved-session", seq: 10 } }),
    );
    f.socket.frame({ op: 0, t: "RESUMED", s: 11, d: {} });
    f.socket.frame({
      op: 0,
      t: "MESSAGE_CREATE",
      s: 12,
      d: {
        id: "500",
        channel_id: "600",
        guild_id: "400",
        author: { id: "200", username: "Synthetic" },
        content: "Synthetic task",
        mentions: [{ id: "100" }],
      },
    });
    await vi.waitFor(() => expect(seen).toHaveLength(2));
    expect(seen[1]).toMatchObject({
      message: { peerId: "200", conversationId: "300", threadId: "600", inThread: true, mentioned: true },
      cursor: { sequence: 12 },
    });
    controller.abort();
    await running;
  });

  it("retires an unacknowledged Discord heartbeat and clears timers", async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const f = fixture("discord");
    const { input } = receiver();
    const transport = await createChannelTransport(discord, input.signal, f.network);
    const running = transport.run(input).catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(0);
    discordHello(f.socket);
    discordReady(f.socket);
    await vi.advanceTimersByTimeAsync(500);
    expect(f.socket.sent.at(-1)).toMatchObject({ op: 1, d: 1 });
    await vi.advanceTimersByTimeAsync(1000);
    expect(await running).toMatchObject({ code: "network" });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears an invalid Discord resume checkpoint before identifying a new session", async () => {
    const f = fixture("discord"),
      second = new SocketFixture();
    let connections = 0;
    f.network.socket = async () => (++connections === 1 ? f.socket : second);
    const { controller, input } = receiver(
      vi.fn(async () => {}),
      { provider: "discord", sequence: 10, sessionId: "old-session", resumeUrl: "wss://gateway.discord.gg" },
    );
    const transport = await createChannelTransport(discord, input.signal, f.network);
    const running = transport.run(input).catch(() => {});
    await vi.waitFor(() => expect(f.socket.listenerCount("message")).toBe(1));
    discordHello(f.socket);
    await vi.waitFor(() => expect(f.socket.sent[0]?.op).toBe(6));
    f.socket.readyState = 3;
    f.socket.emit("close", 4007);
    await vi.waitFor(() => expect(second.listenerCount("message")).toBe(1));
    expect(input.receive).toHaveBeenCalledWith(null, null);
    discordHello(second);
    await vi.waitFor(() => expect(second.sent[0]?.op).toBe(2));
    controller.abort();
    await running;
  });

  it.each([slack, telegram, discord])(
    "keeps $provider send uncertainty explicit and refuses redirects",
    async (credentials) => {
      const f = fixture(credentials.provider, (method) =>
        ["sendMessage", "chat.postMessage", "messages"].includes(method)
          ? new Response("", { status: 503 })
          : undefined,
      );
      const { input } = receiver();
      const transport = await createChannelTransport(credentials, input.signal, f.network);
      await expect(
        transport.send(
          { deliveryId: randomUUID(), conversationId: "300", text: "Synthetic reply" },
          input.signal,
        ),
      ).rejects.toMatchObject({ code: "delivery_unknown" });
      expect(f.calls.every((call) => call.init.redirect === "error")).toBe(true);
    },
  );

  it("uses stable Discord nonces without mention notifications", async () => {
    const f = fixture("discord");
    const { input } = receiver();
    const transport = await createChannelTransport(discord, input.signal, f.network);
    const delivery = {
      deliveryId: randomUUID(),
      conversationId: "300",
      threadId: "600",
      replyToMessageId: "500",
      text: "Synthetic reply",
    };
    await transport.send(delivery, input.signal);
    await transport.send(delivery, input.signal);
    const sends = f.calls.filter((call) => call.method === "messages");
    expect(sends[0]?.body).toMatchObject({
      enforce_nonce: true,
      allowed_mentions: { parse: [] },
      message_reference: { message_id: "500" },
    });
    expect(sends[0]?.body.nonce).toBe(sends[1]?.body.nonce);
  });

  it("never exposes Telegram token-bearing fetch failures", async () => {
    const { input } = receiver();
    const network: ChannelNetwork = {
      fetch: async (url) => {
        throw new Error(String(url));
      },
    };
    const error = await createChannelTransport(telegram, input.signal, network).catch(
      (error: unknown) => error,
    );
    expect(error).toMatchObject({ code: "network" });
    expect(String(error)).not.toContain(telegram.botToken);
  });

  it("never exposes socket tickets when socket creation fails", async () => {
    const f = fixture("slack");
    const { input } = receiver();
    f.network.socket = async (url) => {
      throw new Error(url);
    };
    const transport = await createChannelTransport(slack, input.signal, f.network);
    const error = await transport.run(input).catch((error: unknown) => error);
    expect(error).toMatchObject({ code: "network" });
    expect(String(error)).not.toContain("ticket=");
  });

  it.each([
    {
      credentials: telegram,
      body: { ok: false, error_code: 429, parameters: { retry_after: 65 } },
      wait: 65000,
    },
    { credentials: discord, body: { retry_after: 0.5 }, wait: 1000 },
  ])("preserves $credentials.provider rate-limit response guidance", async ({ credentials, body, wait }) => {
    const f = fixture(credentials.provider, (method) =>
      ["sendMessage", "messages"].includes(method) ? Response.json(body, { status: 429 }) : undefined,
    );
    const { input } = receiver();
    const transport = await createChannelTransport(credentials, input.signal, f.network);
    await expect(
      transport.send(
        { deliveryId: randomUUID(), conversationId: "300", text: "Synthetic reply" },
        input.signal,
      ),
    ).rejects.toMatchObject({ code: "rate_limited", retryAfterMs: wait });
    expect(f.calls.filter((call) => ["sendMessage", "messages"].includes(call.method))).toHaveLength(1);
  });
});
