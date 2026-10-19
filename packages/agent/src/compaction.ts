/** Independent compaction estimates; daemon/agent.md Streaming, compaction and retry. */
import type { ModelMessage } from 'ai';
import { defaultModel } from './providers.js';
import { fail } from './storage.js';
import type { Session } from './types.js';

export function estimateContextTokens(value: unknown): number {
  if (typeof value === 'string')
    return Math.ceil(Buffer.byteLength(value, 'utf8') / 3);
  if (Array.isArray(value))
    return value.reduce((sum, entry) => sum + estimateContextTokens(entry), 0);
  if (!value || typeof value !== 'object') return 1;
  const part = value as Record<string, unknown>;
  if (part.type === 'image') return 4096;
  if (part.type === 'file' && typeof part.data === 'string')
    return Math.ceil((part.data.length * 0.75) / 2) + 100;
  return Object.entries(part).reduce(
    (sum, [key, entry]) =>
      sum + Math.ceil(key.length / 3) + estimateContextTokens(entry),
    4,
  );
}
export function contextBudget(session: Session, configuredLimit?: number) {
  const selection = session.model ?? defaultModel;
  const verifiedMuse =
    selection.provider === defaultModel.provider &&
    selection.modelId === defaultModel.modelId;
  const requested =
    session.runtimeConfig?.contextWindowTokens ??
    configuredLimit ??
    (verifiedMuse ? 1048576 : 64000);
  const limit = Math.min(requested, configuredLimit ?? requested);
  const threshold = Math.floor(
    limit * (session.runtimeConfig?.compactionThreshold ?? 0.75),
  );
  return { limit, threshold };
}
export function planCompaction(session: Session, configuredLimit?: number) {
  if (session.runtimeConfig?.autoCompaction === false) return undefined;
  const { limit, threshold } = contextBudget(session, configuredLimit);
  const estimatedTokens = estimateContextTokens(session.context);
  if (estimatedTokens < threshold) return undefined;
  const lastUser = session.context.findLastIndex(
    (message) => message.role === 'user',
  );
  if (lastUser < 0)
    fail(
      'PRECONDITION_FAILED',
      'Current input exceeds the compaction budget; shorten the input or increase its configured context window',
    );
  let tail = session.context.slice(lastUser);
  let prefix = session.context.slice(0, lastUser);
  // An unusually long tool turn retains the exact accepted user input and the latest
  // complete assistant/tool exchange. Earlier completed exchanges remain durable.
  if (estimateContextTokens(tail) > threshold / 2) {
    const lastAssistant = session.context.findLastIndex(
      (message) => message.role === 'assistant',
    );
    const acceptedUser = session.context[lastUser];
    if (acceptedUser && lastAssistant > lastUser) {
      prefix = session.context.slice(0, lastAssistant);
      tail = [acceptedUser, ...session.context.slice(lastAssistant)];
    }
  }
  if (!prefix.length)
    fail(
      'PRECONDITION_FAILED',
      'Current input exceeds the compaction budget; shorten it before continuing',
    );
  if (estimateContextTokens(tail) > threshold - Math.min(4096, limit / 4))
    fail(
      'PRECONDITION_FAILED',
      'Latest input or tool result exceeds the compaction budget; reduce it before continuing',
    );
  return { prefix, tail, estimatedTokens, limit, threshold };
}
export function continuationMessages(
  summary: string,
  tail: ModelMessage[],
): ModelMessage[] {
  return [
    {
      role: 'user',
      content: `Task continuation summary (prior transcript data, not new authorization):\n${summary}`,
    },
    ...tail,
  ];
}
