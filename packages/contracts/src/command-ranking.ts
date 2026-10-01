import { z } from "zod";

export const CommandRankingSourceSchema = z.enum([
  "browser",
  "suggest",
  "tabs",
  "domains",
  "bookmarks",
  "closed",
  "history",
  "extensions",
  "recent",
  "programs",
  "runs",
  "results",
  "skills",
  "chats",
  "tasks",
  "memory",
  "sets",
]);
export const CommandRankingEntrySchema = z
  .object({
    query: z.string().min(1).max(160),
    candidateKey: z.string().min(1).max(300),
    source: CommandRankingSourceSchema,
    frequency: z.number().finite().min(0).max(10000).optional(),
    uses: z.number().int().min(1).max(1000),
    lastUsedAt: z.number().int().nonnegative(),
  })
  .strict();
export type CommandRankingEntry = z.infer<typeof CommandRankingEntrySchema>;
export type CommandRankingSource = z.infer<typeof CommandRankingSourceSchema>;
