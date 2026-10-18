import { z } from "zod";

/** A user-selected live page at the moment it was attached to a conversation. */
export const PageContextRefSchema = z
  .object({
    pageId: z.string().min(1).max(200),
    url: z.string().min(1).max(8192),
    documentEpoch: z.number().int().nonnegative(),
    sessionId: z.string().max(200).optional(),
    selectedAt: z.number().int().nonnegative().optional(),
  })
  .strict();
export type PageContextRef = z.infer<typeof PageContextRefSchema>;
