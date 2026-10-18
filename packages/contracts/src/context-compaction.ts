import { z } from "zod";

const tokens = z.number().int().nonnegative();
const hash = z.string().regex(/^[a-f0-9]{64}$/);
export const ContextProjectionSchema = z.object({
  version: z.literal(1),
  revision: z.number().int().positive(),
  boundarySeq: tokens,
  prefixHash: hash,
  authorityHash: hash,
  summary: z.string().min(1).max(48_000),
  modelId: z.string().min(1),
  createdAt: z.number(),
});
export type ContextProjection = z.infer<typeof ContextProjectionSchema>;

export const RunContextStatsSchema = z.object({
  runId: z.string().min(1),
  revision: tokens,
  modelId: z.string(),
  contextTokens: tokens,
  inputBudgetTokens: tokens,
  outputReserveTokens: tokens,
  estimatedInputTokens: tokens,
  observedInputTokens: tokens.optional(),
  occupancy: z.number().nonnegative(),
  updatedAt: z.number(),
  compaction: z.object({
    id: z.string(),
    status: z.enum(["idle", "queued", "preparing", "summarizing", "completed", "cancelled", "failed"]),
    reason: z.enum(["automatic", "manual", "overflow"]),
    stage: z.enum(["normal", "recovery", "emergency"]).optional(),
    completedChunks: tokens.optional(),
    totalChunks: tokens.optional(),
    message: z.string().max(500).optional(),
  }),
});
export type RunContextStats = z.infer<typeof RunContextStatsSchema>;

/** Encrypted run storage only; the API publishes stats without summary content. */
export const RunContextStateSchema = z.object({
  projection: ContextProjectionSchema.optional(),
  stats: RunContextStatsSchema,
});
export type RunContextState = z.infer<typeof RunContextStateSchema>;
export const RunContextStatsParams = z.object({ runId: z.string().min(1) }).strict();
export const RunContextCompactParams = RunContextStatsParams.extend({ expectedRevision: tokens }).strict();
export const RunContextCancelParams = RunContextStatsParams.extend({
  compactionId: z.string().min(1),
}).strict();
