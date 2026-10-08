import { setImmediate as yieldTask } from "node:timers/promises";
import type { MethodParams, MethodResult } from "@aux/contracts";
import { conversationReplyText } from "@aux/contracts/conversation-reply-text";
import type { Repo } from "../store/repo.js";

type Hit = NonNullable<MethodResult<"conversations.search">["match"]>;
/** Search durable visible message text in bounded batches; never index hidden context or source bodies. */
export async function searchConversation(
  repo: Repo,
  params: MethodParams<"conversations.search">,
  signal?: AbortSignal,
) {
  const expression = new RegExp(params.query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "giu");
  let before: { createdAt: number; runId: string } | undefined;
  let matches = 0;
  let first: { match: Hit; ordinal: number } | undefined;
  let last: typeof first, selected: typeof first;
  let foundCursor = false;
  let yieldedAt = performance.now();
  for (;;) {
    signal?.throwIfAborted();
    const batch = repo.listRuns(50, { chatId: params.chatId, before, includeArchived: true });
    for (const run of batch) {
      const parts = [
        { part: "goal", text: run.goal },
        ...repo
          .listRunSteers(run.runId)
          .map((message) => ({ part: `steer:${message.messageId}`, text: message.text })),
        { part: "reply", text: conversationReplyText(run) },
        { part: "error", text: run.failure?.message ?? run.error ?? "" },
      ];
      for (const { part, text } of parts) {
        let occurrence = 0;
        for (const match of text.matchAll(expression)) {
          const hit = {
            match: {
              runId: run.runId,
              part,
              offset: match.index,
              occurrence: occurrence++,
              excerpt: text.slice(Math.max(0, match.index - 80), match.index + match[0].length + 120),
            },
            ordinal: ++matches,
          };
          first ??= hit;
          if (foundCursor && !selected && params.direction === "next") selected = hit;
          if (
            params.cursor?.runId === run.runId &&
            params.cursor.part === part &&
            params.cursor.offset === match.index
          ) {
            foundCursor = true;
            if (params.direction === "current") selected = hit;
            else if (params.direction === "previous") selected = last;
          }
          last = hit;
        }
      }
      if (performance.now() - yieldedAt >= 8) {
        await yieldTask();
        signal?.throwIfAborted();
        yieldedAt = performance.now();
      }
    }
    if (batch.length < 50) break;
    const oldest = batch.at(-1)!;
    before = { createdAt: oldest.createdAt, runId: oldest.runId };
    await yieldTask();
  }
  selected ??= params.direction === "previous" ? last : first;
  return { match: selected?.match ?? null, matches, activeMatch: selected?.ordinal ?? 0 };
}
