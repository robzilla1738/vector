import { z } from "zod";
import type { ChannelCredentials, ChannelInbound } from "@aux/contracts/channels";
import { ChannelInboundSchema } from "@aux/contracts/channels";
import {
  channelJson,
  ChannelTransportError,
  type ChannelNetwork,
  type ChannelTransport,
} from "./channel-transport.js";

const numericId = z.number().int().safe();
const personSchema = z.object({
  id: numericId,
  is_bot: z.boolean(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
});
const entitySchema = z.object({
  type: z.string(),
  offset: z.number().int().nonnegative(),
  length: z.number().int().nonnegative(),
  user: z.object({ id: numericId }).optional(),
});
const messageSchema = z.object({
  message_id: numericId,
  from: personSchema.optional(),
  sender_chat: z.unknown().optional(),
  chat: z.object({ id: numericId, type: z.string() }),
  text: z.string().optional(),
  entities: z.array(entitySchema).optional(),
  message_thread_id: numericId.optional(),
  is_topic_message: z.boolean().optional(),
  reply_to_message: z.object({ from: z.object({ id: numericId }).optional() }).optional(),
});

export async function telegramTransport(
  credentials: Extract<ChannelCredentials, { provider: "telegram" }>,
  signal: AbortSignal,
  network: ChannelNetwork,
): Promise<ChannelTransport> {
  // Telegram embeds its credential in the URL. Never retain native fetch errors or provider descriptions.
  if (!/^\d+:[A-Za-z0-9_-]+$/.test(credentials.botToken)) throw new ChannelTransportError("authentication");
  async function api(
    method: string,
    body: Record<string, unknown>,
    requestSignal: AbortSignal,
    operation: "read" | "send" = "read",
  ) {
    const result = await channelJson(
      network,
      `https://api.telegram.org/bot${credentials.botToken}/${method}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      requestSignal,
      operation,
    );
    if (result.ok !== true) {
      if (result.error_code === 401) throw new ChannelTransportError("authentication");
      if (result.error_code === 403) throw new ChannelTransportError("scope");
      if (result.error_code === 429) {
        const retry = z.object({ retry_after: z.number().positive() }).safeParse(result.parameters);
        throw new ChannelTransportError(
          "rate_limited",
          retry.success ? Math.min(86400000, Math.max(1000, retry.data.retry_after * 1000)) : 30000,
        );
      }
      throw new ChannelTransportError("invalid_response");
    }
    return result.result;
  }
  const bot = personSchema.safeParse(await api("getMe", {}, signal));
  if (!bot.success || !bot.data.is_bot || !bot.data.username) throw new ChannelTransportError("identity");
  const webhook = z.object({ url: z.string() }).safeParse(await api("getWebhookInfo", {}, signal));
  if (!webhook.success) throw new ChannelTransportError("invalid_response");
  if (webhook.data.url) throw new ChannelTransportError("webhook");
  const identity = {
    provider: "telegram" as const,
    botId: String(bot.data.id),
    name: bot.data.first_name.slice(0, 200),
    username: bot.data.username,
  };
  return {
    identity,
    messageLength: 3500,
    async run(input) {
      let offset = input.cursor?.provider === "telegram" ? input.cursor.offset : 0;
      input.ready();
      while (!input.signal.aborted) {
        const updates = z
          .array(z.object({ update_id: z.number().int().nonnegative(), message: z.unknown().optional() }))
          .max(100)
          .safeParse(
            await api(
              "getUpdates",
              { offset, limit: 100, timeout: 25, allowed_updates: ["message"] },
              input.signal,
            ),
          );
        if (!updates.success) throw new ChannelTransportError("invalid_response");
        for (const update of updates.data) {
          input.signal.throwIfAborted();
          if (update.update_id < offset) continue;
          let message: ChannelInbound | null = null;
          const parsed = messageSchema.safeParse(update.message);
          if (
            parsed.success &&
            parsed.data.from &&
            !parsed.data.from.is_bot &&
            !parsed.data.sender_chat &&
            parsed.data.text
          ) {
            const value = parsed.data,
              from = parsed.data.from;
            const text = value.text!;
            const mentioned =
              value.entities?.some(
                (entity) =>
                  (entity.type === "text_mention" && String(entity.user?.id) === identity.botId) ||
                  (entity.type === "mention" &&
                    text.slice(entity.offset, entity.offset + entity.length).toLowerCase() ===
                      `@${identity.username}`.toLowerCase()) ||
                  (entity.type === "bot_command" &&
                    text
                      .slice(entity.offset, entity.offset + entity.length)
                      .toLowerCase()
                      .endsWith(`@${identity.username}`.toLowerCase())),
              ) ?? false;
            const inbound = ChannelInboundSchema.safeParse({
              messageId: `${value.chat.id}:${value.message_id}`,
              peerId: String(from.id),
              peerName: [from.first_name, from.last_name].filter(Boolean).join(" ").slice(0, 200),
              conversationId: String(value.chat.id),
              threadId:
                value.is_topic_message && value.message_thread_id !== undefined
                  ? String(value.message_thread_id)
                  : undefined,
              text,
              direct: value.chat.type === "private",
              mentioned,
              inThread:
                value.is_topic_message === true ||
                String(value.reply_to_message?.from?.id) === identity.botId,
            });
            if (inbound.success) message = inbound.data;
          }
          const next = update.update_id + 1;
          await input.receive(message, { provider: "telegram", offset: next });
          offset = next;
        }
      }
      input.signal.throwIfAborted();
    },
    async send(input, requestSignal) {
      const result = z.object({ message_id: numericId }).safeParse(
        await api(
          "sendMessage",
          {
            chat_id: input.conversationId,
            text: input.text,
            message_thread_id: input.threadId ? Number(input.threadId) : undefined,
            reply_parameters: input.replyToMessageId
              ? {
                  message_id: Number(input.replyToMessageId.split(":").at(-1)),
                  allow_sending_without_reply: true,
                }
              : undefined,
            link_preview_options: { is_disabled: true },
          },
          requestSignal,
          "send",
        ),
      );
      if (!result.success) throw new ChannelTransportError("delivery_unknown");
      return { messageId: String(result.data.message_id) };
    },
  };
}
