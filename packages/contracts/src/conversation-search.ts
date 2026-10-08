import { z } from "zod";
import type { Run } from "./entities.js";

export function conversationReply(run: Run): string | null {
  const goal = run.goal.trim().toLowerCase();
  const prose = (value: unknown) => {
    const text = typeof value === "string" ? value.trim() : "";
    return text && text.toLowerCase() !== goal ? text : "";
  };
  const answer = prose(run.result?.answer);
  const report = prose(run.result?.report);
  const message =
    run.failure || (run.error && run.statusMessage === run.error) ? "" : prose(run.statusMessage);
  if (report && run.status === "completed") return report;
  if (answer && run.status !== "completed" && message) return `${message}\n\n${answer}`;
  if (answer) return answer;
  if (message) return message;
  if (!run.result) return null;
  const rest = Object.entries(run.result)
    .flatMap(([key, value]) => (key === "answer" ? [] : [prose(value)]))
    .filter(Boolean);
  return rest.length ? rest.join("\n\n") : null;
}

export const ConversationSearchCursorSchema = z
  .object({
    runId: z.string().min(1),
    part: z.string().min(1).max(250),
    offset: z.number().int().nonnegative(),
  })
  .strict();
export const ConversationSearchParams = z
  .object({
    chatId: z.string().min(1),
    query: z.string().min(1).max(500),
    cursor: ConversationSearchCursorSchema.optional(),
    direction: z.enum(["current", "next", "previous"]).default("current"),
  })
  .strict();
export const ConversationSearchResultSchema = z.object({
  match: ConversationSearchCursorSchema.extend({
    excerpt: z.string(),
    occurrence: z.number().int().nonnegative(),
  }).nullable(),
  matches: z.number().int().nonnegative(),
  activeMatch: z.number().int().nonnegative(),
});
