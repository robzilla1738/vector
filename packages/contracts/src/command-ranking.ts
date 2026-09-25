import { z } from "zod";

export const CommandRankingSourceSchema = z.enum([
  "browser",
  "suggest",
  "tabs",
  "domains",
  "bookmarks",
  "recent",
  "programs",
  "runs",
  "results",
  "skills",
  "chats",
]);
export const CommandRankingEntrySchema = z
  .object({
    query: z.string().min(1).max(160),
    candidateKey: z.string().min(1).max(300),
    source: CommandRankingSourceSchema,
    uses: z.number().int().min(1).max(1000),
    lastUsedAt: z.number().int().nonnegative(),
  })
  .strict();
export type CommandRankingEntry = z.infer<typeof CommandRankingEntrySchema>;
export type CommandRankingSource = z.infer<typeof CommandRankingSourceSchema>;
