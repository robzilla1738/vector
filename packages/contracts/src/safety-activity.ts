import { z } from "zod";

export const SafetyActivityCursorSchema = z
  .object({
    at: z.number().int().nonnegative(),
    decisionId: z.string().uuid(),
  })
  .strict();
export const SafetyActivityQuerySchema = z
  .object({
    limit: z.number().int().min(1).max(200).default(50),
    cursor: SafetyActivityCursorSchema.optional(),
  })
  .strict();
export const SafetyActivityEntrySchema = z.object({
  decisionId: z.string().uuid(),
  at: z.number().int().nonnegative(),
  actor: z.string(),
  effect: z.string(),
  category: z.string(),
  action: z.string(),
  origin: z.string().nullable(),
  status: z.enum(["allow", "ask", "deny"]),
  source: z.string(),
  guidance: z.string().max(512).nullable(),
  runId: z.string().nullable(),
  taskId: z.string().nullable(),
});
export const SafetyActivityPageSchema = z.object({
  entries: z.array(SafetyActivityEntrySchema).max(200),
  nextCursor: SafetyActivityCursorSchema.nullable(),
});
export type SafetyActivityQuery = z.infer<typeof SafetyActivityQuerySchema>;
export type SafetyActivityEntry = z.infer<typeof SafetyActivityEntrySchema>;
export type SafetyActivityPage = z.infer<typeof SafetyActivityPageSchema>;
