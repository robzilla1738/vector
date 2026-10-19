/** Public protocol: https://core.telegram.org/bots/api#getupdates and #sendmessage. */
import { fail } from '@aux/agent';
import { z } from 'zod';
export const telegramUpdate = z.object({
  update_id: z.number().int().nonnegative(),
  message: z
    .object({
      message_id: z.number().int(),
      text: z.string().max(10000).optional(),
      date: z.number(),
      chat: z.object({ id: z.number().int(), type: z.string() }),
      from: z
        .object({
          id: z.number().int(),
          is_bot: z.boolean(),
          first_name: z.string(),
          last_name: z.string().optional(),
          username: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});
export type TelegramUpdate = z.infer<typeof telegramUpdate>;
export interface ChannelTransport {
  identify(
    token: string,
    signal: AbortSignal,
  ): Promise<{ id: string; name: string }>;
  updates(
    token: string,
    offset: number,
    signal: AbortSignal,
  ): Promise<TelegramUpdate[]>;
  send(
    token: string,
    chatId: string,
    text: string,
    signal: AbortSignal,
  ): Promise<{ messageId: string }>;
}
async function api(
  token: string,
  method: string,
  params: unknown,
  signal: AbortSignal,
) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/${method}`,
      {
        method: 'POST',
        redirect: 'error',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.any([signal, AbortSignal.timeout(35000)]),
      },
    );
    if (!response.ok)
      fail(
        'PRECONDITION_FAILED',
        `Telegram ${method} failed with HTTP ${response.status}`,
      );
    const reader = response.body?.getReader();
    if (!reader)
      fail('PRECONDITION_FAILED', 'Telegram returned no response body');
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 2_000_000) {
        await reader.cancel();
        fail(
          'PRECONDITION_FAILED',
          'Telegram response exceeded the local limit',
        );
      }
      chunks.push(chunk.value);
    }
    const text = Buffer.concat(chunks).toString('utf8');
    const envelope = z
      .object({ ok: z.boolean(), result: z.unknown() })
      .parse(JSON.parse(text));
    if (!envelope.ok)
      fail('PRECONDITION_FAILED', `Telegram rejected ${method}`);
    return envelope.result;
  } catch {
    fail(
      'PRECONDITION_FAILED',
      `Telegram ${method} could not complete; inspect connection status before retrying`,
    );
  }
}
export const telegramTransport: ChannelTransport = {
  async identify(token, signal) {
    const bot = z
      .object({
        id: z.number(),
        is_bot: z.literal(true),
        username: z.string().optional(),
        first_name: z.string(),
      })
      .parse(await api(token, 'getMe', {}, signal));
    return { id: String(bot.id), name: bot.username ?? bot.first_name };
  },
  async updates(token, offset, signal) {
    return z
      .array(telegramUpdate)
      .max(100)
      .parse(
        await api(
          token,
          'getUpdates',
          { offset, limit: 100, timeout: 25, allowed_updates: ['message'] },
          signal,
        ),
      );
  },
  async send(token, chatId, text, signal) {
    const sent = z.object({ message_id: z.number() }).parse(
      await api(
        token,
        'sendMessage',
        {
          chat_id: chatId,
          text,
          link_preview_options: { is_disabled: true },
        },
        signal,
      ),
    );
    return { messageId: String(sent.message_id) };
  },
};
