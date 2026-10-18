import { z } from "zod";
import type { ChannelCredentials, ChannelInbound } from "@aux/contracts/channels";
import { ChannelInboundSchema } from "@aux/contracts/channels";
import {
  channelJson,
  channelSocket,
  channelSocketUrl,
  ChannelTransportError,
  type ChannelNetwork,
  type ChannelTransport,
} from "./channel-transport.js";

const identifier = z.string().min(1).max(160);
const authSchema = z.object({
  bot_id: identifier,
  user_id: identifier,
  team_id: identifier,
  user: z.string().optional(),
});
const botSchema = z.object({
  bot: z.object({ id: identifier, app_id: identifier, user_id: identifier, name: z.string() }),
});
const eventSchema = z.object({
  type: z.enum(["message", "app_mention"]),
  user: identifier,
  channel: identifier,
  ts: identifier,
  text: z.string(),
  thread_ts: identifier.optional(),
  channel_type: z.string().optional(),
  bot_id: z.unknown().optional(),
  subtype: z.unknown().optional(),
});

export async function slackTransport(
  credentials: Extract<ChannelCredentials, { provider: "slack" }>,
  signal: AbortSignal,
  network: ChannelNetwork,
): Promise<ChannelTransport> {
  async function api(
    method: string,
    token: string,
    body: Record<string, unknown>,
    requestSignal: AbortSignal,
    operation: "read" | "send" = "read",
  ) {
    const result = await channelJson(
      network,
      `https://slack.com/api/${method}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
      },
      requestSignal,
      operation,
    );
    if (result.ok !== true) {
      if (["invalid_auth", "not_authed", "token_revoked", "account_inactive"].includes(String(result.error)))
        throw new ChannelTransportError("authentication");
      if (["missing_scope", "not_allowed_token_type", "no_permission"].includes(String(result.error)))
        throw new ChannelTransportError("scope");
      if (result.error === "ratelimited") throw new ChannelTransportError("rate_limited", 30000);
      throw new ChannelTransportError("invalid_response");
    }
    return result;
  }
  const auth = authSchema.safeParse(await api("auth.test", credentials.botToken, {}, signal));
  if (!auth.success) throw new ChannelTransportError("identity");
  const bot = botSchema.safeParse(
    await api("bots.info", credentials.botToken, { bot: auth.data.bot_id }, signal),
  );
  if (!bot.success || bot.data.bot.id !== auth.data.bot_id || bot.data.bot.user_id !== auth.data.user_id)
    throw new ChannelTransportError("identity");
  const identity = {
    provider: "slack" as const,
    botId: auth.data.user_id,
    accountId: auth.data.team_id,
    applicationId: bot.data.bot.app_id,
    name: bot.data.bot.name.slice(0, 200) || "Slack bot",
  };
  // Opening the socket is read-only; the hello binds the app token to this bot before any event is admitted.
  let opened = await api("apps.connections.open", credentials.appToken, {}, signal);
  return {
    identity,
    messageLength: 3500,
    async run(input) {
      let first = true;
      while (!input.signal.aborted) {
        const url = channelSocketUrl(
          first
            ? opened.url
            : (await api("apps.connections.open", credentials.appToken, {}, input.signal)).url,
          "slack.com",
        );
        first = false;
        opened = {};
        let identified = false;
        await channelSocket(network, url, input, async (frame, socket) => {
          if (frame.type === "hello") {
            const connection = z.object({ app_id: identifier }).safeParse(frame.connection_info);
            if (!connection.success || connection.data.app_id !== identity.applicationId)
              throw new ChannelTransportError("identity");
            identified = true;
            socket.ready();
            return;
          }
          if (!identified) throw new ChannelTransportError("identity");
          if (frame.type === "disconnect") {
            socket.end();
            return;
          }
          if (typeof frame.envelope_id !== "string" || frame.envelope_id.length > 200) return;
          let message: ChannelInbound | null = null;
          if (frame.type === "events_api") {
            const payload = z
              .object({ api_app_id: identifier, team_id: identifier, event: z.unknown() })
              .safeParse(frame.payload);
            if (
              !payload.success ||
              payload.data.api_app_id !== identity.applicationId ||
              payload.data.team_id !== identity.accountId
            )
              throw new ChannelTransportError("identity");
            const event = eventSchema.safeParse(payload.data.event);
            if (
              event.success &&
              !event.data.bot_id &&
              !event.data.subtype &&
              event.data.user !== identity.botId
            ) {
              const value = event.data;
              const parsed = ChannelInboundSchema.safeParse({
                messageId: `${value.channel}:${value.ts}`,
                peerId: value.user,
                peerName: value.user,
                conversationId: value.channel,
                threadId: value.thread_ts ?? (value.channel.startsWith("D") ? undefined : value.ts),
                text: value.text,
                direct: value.channel_type === "im" || value.channel.startsWith("D"),
                mentioned: value.type === "app_mention" || value.text.includes(`<@${identity.botId}>`),
                inThread: Boolean(value.thread_ts),
              });
              if (parsed.success) message = parsed.data;
            }
          }
          await input.receive(message, { provider: "slack" });
          socket.send({ envelope_id: frame.envelope_id });
        });
      }
      input.signal.throwIfAborted();
    },
    async send(input, requestSignal) {
      const result = await api(
        "chat.postMessage",
        credentials.botToken,
        {
          channel: input.conversationId,
          text: input.text,
          thread_ts: input.threadId ?? input.replyToMessageId?.split(":").at(-1),
          client_msg_id: input.deliveryId,
          mrkdwn: false,
          parse: "none",
          link_names: false,
          unfurl_links: false,
          unfurl_media: false,
        },
        requestSignal,
        "send",
      );
      if (typeof result.ts !== "string") throw new ChannelTransportError("delivery_unknown");
      return { messageId: result.ts };
    },
  };
}
