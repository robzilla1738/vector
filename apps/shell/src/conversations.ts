import type { Run } from "@aux/contracts";
/** Existing chat IDs are durable; legacy runs each remain a separate conversation. */
export function recentConversations(runs: Run[]): Run[] {
  const seen = new Set<string>();
  return [...runs]
    .sort((a, b) => b.createdAt - a.createdAt)
    .filter((run) => {
      const key = run.config?.chatId ?? run.runId;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
