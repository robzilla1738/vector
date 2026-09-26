import type { ModelMessage } from "ai";

/** Anthropic allows four breakpoints. System, tools, and the history prefix use three. */
export const ANTHROPIC_CACHE_CONTROL = { type: "ephemeral" as const };

/**
 * Direct Anthropic calls cache the stable prefix: the system prompt, the tool
 * list (breakpoint on the last tool), and every message except the newest.
 * The newest message is the turn that just changed, so it stays outside the
 * breakpoint and the next step still hits the prefix.
 */
export function anthropicCachedMessages(system: string, messages: ModelMessage[]): ModelMessage[] {
  const history = messages.map((message, index) =>
    messages.length >= 2 && index === messages.length - 2 ? stampAnthropicCache(message) : message,
  );
  if (!system) return history;
  return [stampAnthropicCache({ role: "system", content: system }), ...history];
}

export function stampAnthropicCache(message: ModelMessage): ModelMessage {
  const current = message.providerOptions?.anthropic;
  const anthropic = current && typeof current === "object" ? { ...current } : {};
  return {
    ...message,
    providerOptions: {
      ...message.providerOptions,
      anthropic: { ...anthropic, cacheControl: ANTHROPIC_CACHE_CONTROL },
    },
  };
}

export function openAiSessionCache(sessionId: string): { openai: { promptCacheKey: string } } {
  return { openai: { promptCacheKey: sessionId } };
}
