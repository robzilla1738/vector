import { createHash } from "node:crypto";
import { z } from "zod";
import {
  ChannelInboundSchema,
  type ChannelCredentials,
  type ChannelCursor,
  type ChannelInbound,
} from "@aux/contracts/channels";
import {
  channelJson,
  channelBinary,
  channelSocket,
  channelSocketUrl,
  ChannelTransportError,
  type ChannelNetwork,
  type ChannelTransport,
} from "./channel-transport.js";

const snowflake = z.string().regex(/^\d{1,24}$/);
const userSchema = z.object({ id: snowflake, username: z.string(), bot: z.boolean().optional() });
const attachmentSchema = z.object({
  id: snowflake,
  filename: z.string(),
  size: z.number().int().nonnegative().safe(),
  content_type: z.string().optional(),
  url: z.string().url(),
  duration_secs: z.number().nonnegative().optional(),
});
const messageSchema = z.object({
  id: snowflake,
  channel_id: snowflake,
  guild_id: snowflake.optional(),
  author: userSchema,
  content: z.string(),
  mentions: z.array(z.object({ id: snowflake })),
  webhook_id: z.unknown().optional(),
  attachments: z.array(attachmentSchema).max(10).optional(),
});

export async function discordTransport(
  credentials: Extract<ChannelCredentials, { provider: "discord" }>,
  signal: AbortSignal,
  network: ChannelNetwork,
): Promise<ChannelTransport> {
  async function api(path: string, requestSignal: AbortSignal, body?: Record<string, unknown>) {
    return channelJson(
      network,
      `https://discord.com/api/v10/${path}`,
      {
        method: body ? "POST" : "GET",
        headers: { Authorization: `Bot ${credentials.botToken}`, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      },
      requestSignal,
      body ? "send" : "read",
    );
  }
  const bot = userSchema.safeParse(await api("users/@me", signal));
  const app = z
    .object({ id: snowflake, bot: userSchema.optional() })
    .safeParse(await api("oauth2/applications/@me", signal));
  if (
    !bot.success ||
    bot.data.bot !== true ||
    !app.success ||
    (app.data.bot && app.data.bot.id !== bot.data.id)
  )
    throw new ChannelTransportError("identity");
  const gateway = await api("gateway/bot", signal);
  const gatewayUrl = channelSocketUrl(gateway.url, "discord.gg");
  const identity = {
    provider: "discord" as const,
    botId: bot.data.id,
    applicationId: app.data.id,
    name: bot.data.username.slice(0, 200),
    username: bot.data.username.slice(0, 200),
  };
  const channels = new Map<string, { type: number; parent_id?: string; guild_id?: string }>();
  return {
    identity,
    messageLength: 1900,
    async run(input) {
      let cursor: Extract<ChannelCursor, { provider: "discord" }> | undefined =
        input.cursor?.provider === "discord" ? input.cursor : undefined;
      while (!input.signal.aborted) {
        const url = new URL(cursor ? channelSocketUrl(cursor.resumeUrl, "discord.gg") : gatewayUrl);
        url.searchParams.set("v", "10");
        url.searchParams.set("encoding", "json");
        let identified = false,
          hello = false,
          awaitingHeartbeat = false,
          invalidResume = false;
        try {
          await channelSocket(
            network,
            url.href,
            input,
            async (frame, socket) => {
              if (frame.op === 10) {
                const data = z
                  .object({ heartbeat_interval: z.number().min(1000).max(300000) })
                  .safeParse(frame.d);
                if (!data.success || hello) throw new ChannelTransportError("invalid_response");
                hello = true;
                const heartbeat = () => {
                  if (awaitingHeartbeat) {
                    socket.end(new ChannelTransportError("network"));
                    return;
                  }
                  awaitingHeartbeat = true;
                  socket.send({ op: 1, d: cursor?.sequence ?? null });
                };
                socket.timeout(() => {
                  heartbeat();
                  socket.interval(heartbeat, data.data.heartbeat_interval);
                }, Math.random() * data.data.heartbeat_interval);
                if (cursor)
                  socket.send({
                    op: 6,
                    d: { token: credentials.botToken, session_id: cursor.sessionId, seq: cursor.sequence },
                  });
                else
                  socket.send({
                    op: 2,
                    d: {
                      token: credentials.botToken,
                      intents: 1 | 512 | 4096 | 32768,
                      properties: { os: process.platform, browser: "Aux", device: "Aux" },
                    },
                  });
                return;
              }
              if (!hello) throw new ChannelTransportError("invalid_response");
              if (frame.op === 11) {
                awaitingHeartbeat = false;
                return;
              }
              if (frame.op === 1) {
                socket.send({ op: 1, d: cursor?.sequence ?? null });
                return;
              }
              if (frame.op === 7) {
                socket.end();
                return;
              }
              if (frame.op === 9) {
                if (frame.d !== true) {
                  cursor = undefined;
                  await input.receive(null, null);
                }
                socket.timeout(() => socket.end(), 1000 + Math.random() * 4000);
                return;
              }
              if (frame.op !== 0) return;
              if (!Number.isSafeInteger(frame.s) || (frame.s as number) < 0)
                throw new ChannelTransportError("invalid_response");
              if (frame.t === "READY") {
                const data = z
                  .object({
                    user: userSchema,
                    application: z.object({ id: snowflake }),
                    session_id: z.string().min(1).max(160),
                    resume_gateway_url: z.string(),
                  })
                  .safeParse(frame.d);
                if (
                  !data.success ||
                  data.data.user.id !== identity.botId ||
                  data.data.application.id !== identity.applicationId
                )
                  throw new ChannelTransportError("identity");
                cursor = {
                  provider: "discord",
                  sequence: frame.s as number,
                  sessionId: data.data.session_id,
                  resumeUrl: channelSocketUrl(data.data.resume_gateway_url, "discord.gg"),
                };
                identified = true;
                await input.receive(null, cursor);
                socket.ready();
                return;
              }
              if (frame.t === "RESUMED" && cursor) {
                identified = true;
                socket.ready();
              }
              if (!identified || !cursor) throw new ChannelTransportError("identity");
              if ((frame.s as number) <= cursor.sequence) return;
              let message: ChannelInbound | null = null;
              if (frame.t === "MESSAGE_CREATE") {
                const parsed = messageSchema.safeParse(frame.d);
                if (
                  parsed.success &&
                  !parsed.data.author.bot &&
                  !parsed.data.webhook_id &&
                  parsed.data.author.id !== identity.botId
                ) {
                  const value = parsed.data;
                  let channel = channels.get(value.channel_id);
                  if (!channel) {
                    const result = z
                      .object({
                        id: snowflake,
                        type: z.number().int(),
                        parent_id: snowflake.nullish(),
                        guild_id: snowflake.optional(),
                      })
                      .safeParse(await api(`channels/${value.channel_id}`, input.signal));
                    if (
                      !result.success ||
                      result.data.id !== value.channel_id ||
                      result.data.guild_id !== value.guild_id
                    )
                      throw new ChannelTransportError("identity");
                    channel = {
                      type: result.data.type,
                      parent_id: result.data.parent_id ?? undefined,
                      guild_id: result.data.guild_id,
                    };
                    if (channels.size >= 1000) channels.delete(channels.keys().next().value!);
                    channels.set(value.channel_id, channel);
                  }
                  const thread = [10, 11, 12].includes(channel.type);
                  const inbound = ChannelInboundSchema.safeParse({
                    messageId: value.id,
                    peerId: value.author.id,
                    peerName: value.author.username.slice(0, 200),
                    conversationId: thread ? channel.parent_id : value.channel_id,
                    threadId: thread ? value.channel_id : undefined,
                    text: value.content,
                    attachments: value.attachments?.map((file) => ({
                      attachmentId: file.id,
                      filename: (file.filename.trim() || file.id).slice(0, 255),
                      byteLength: file.size,
                      mediaType: file.content_type,
                      durationSeconds: file.duration_secs,
                      kind: file.content_type?.toLowerCase().startsWith("image/")
                        ? "image"
                        : file.content_type?.toLowerCase().startsWith("audio/")
                          ? "audio"
                          : "document",
                    })),
                    direct: channel.type === 1 && !value.guild_id,
                    mentioned: value.mentions.some((user) => user.id === identity.botId),
                    inThread: thread,
                  });
                  if (inbound.success) message = inbound.data;
                }
              }
              const interaction =
                frame.t === "INTERACTION_CREATE"
                  ? z
                      .object({
                        id: snowflake,
                        application_id: snowflake,
                        type: z.literal(3),
                        token: z.string().min(1).max(1000),
                        channel_id: snowflake,
                        guild_id: snowflake.optional(),
                        member: z.object({ user: userSchema }).optional(),
                        user: userSchema.optional(),
                        data: z.object({ custom_id: z.string().uuid() }),
                        message: z.object({ id: snowflake, author: userSchema }),
                      })
                      .safeParse(frame.d)
                  : undefined;
              if (
                interaction?.success &&
                interaction.data.application_id === identity.applicationId &&
                interaction.data.message.author.id === identity.botId
              ) {
                const value = interaction.data,
                  person = value.member?.user ?? value.user;
                if (person && !person.bot && person.id !== identity.botId) {
                  const channel = z
                    .object({
                      id: snowflake,
                      type: z.number().int(),
                      parent_id: snowflake.nullish(),
                      guild_id: snowflake.optional(),
                    })
                    .safeParse(await api(`channels/${value.channel_id}`, input.signal));
                  if (
                    !channel.success ||
                    channel.data.id !== value.channel_id ||
                    channel.data.guild_id !== value.guild_id
                  )
                    throw new ChannelTransportError("identity");
                  const thread = [10, 11, 12].includes(channel.data.type);
                  const parsed = ChannelInboundSchema.safeParse({
                    messageId: `action:${value.id}`,
                    peerId: person.id,
                    peerName: person.username.slice(0, 200),
                    conversationId: thread ? channel.data.parent_id : value.channel_id,
                    threadId: thread ? value.channel_id : undefined,
                    text: "",
                    direct: true,
                    mentioned: true,
                    inThread: thread,
                    interaction: { actionId: value.data.custom_id, providerMessageId: value.message.id },
                  });
                  if (parsed.success) message = parsed.data;
                }
              }
              const next = { ...cursor, sequence: frame.s as number };
              await input.receive(message, next);
              if (interaction?.success) {
                await channelJson(
                  network,
                  `https://discord.com/api/v10/interactions/${interaction.data.id}/${interaction.data.token}/callback?with_response=true`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: 6 }),
                  },
                  input.signal,
                  "send",
                );
              }
              cursor = next;
            },
            (code) => {
              invalidResume = code === 4007 || code === 4009;
              return new ChannelTransportError(
                code === 4004 ? "authentication" : [4013, 4014].includes(code) ? "scope" : "network",
              );
            },
          );
        } catch (error) {
          if (!invalidResume || input.signal.aborted) throw error;
          cursor = undefined;
          await input.receive(null, null);
        }
      }
      input.signal.throwIfAborted();
    },
    async downloadAttachment(message, attachment, requestSignal) {
      const parsed = messageSchema.safeParse(
        await api(
          `channels/${message.threadId ?? message.conversationId}/messages/${message.messageId}`,
          requestSignal,
        ),
      );
      if (
        !parsed.success ||
        parsed.data.id !== message.messageId ||
        parsed.data.channel_id !== (message.threadId ?? message.conversationId) ||
        parsed.data.author.id !== message.peerId ||
        parsed.data.webhook_id
      )
        throw new ChannelTransportError("identity");
      const file = parsed.data.attachments?.find((file) => file.id === attachment.attachmentId);
      if (!file) throw new ChannelTransportError("identity");
      const url = new URL(file.url);
      if (
        url.protocol !== "https:" ||
        !["cdn.discordapp.com", "media.discordapp.net"].includes(url.hostname) ||
        url.username ||
        url.password ||
        url.port
      )
        throw new ChannelTransportError("identity");
      return channelBinary(network, url, {}, requestSignal);
    },
    async send(input, requestSignal) {
      const result = await api(`channels/${input.threadId ?? input.conversationId}/messages`, requestSignal, {
        content: input.text,
        components: input.reply?.buttons?.length
          ? [
              {
                type: 1,
                components: input.reply.buttons.map((button) => ({
                  type: 2,
                  style: 2,
                  label: button.label,
                  custom_id: button.actionId,
                })),
              },
            ]
          : undefined,
        allowed_mentions: { parse: [] },
        nonce: createHash("sha256").update(input.deliveryId).digest("hex").slice(0, 20),
        enforce_nonce: true,
        message_reference: input.replyToMessageId
          ? { message_id: input.replyToMessageId, fail_if_not_exists: false }
          : undefined,
      });
      const id = snowflake.safeParse(result.id);
      if (!id.success) throw new ChannelTransportError("delivery_unknown");
      return { messageId: id.data };
    },
  };
}
