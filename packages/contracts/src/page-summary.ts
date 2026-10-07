import { z } from "zod";

export const PageSummaryInputSchema = z.object({
  pageId: z.string().min(1).max(200),
  focus: z.string().trim().min(1).max(512).optional(),
}).strict();
export const PageSummaryParamsSchema = PageSummaryInputSchema.extend({ runId: z.string().min(1).max(200) }).strict();
export const PageSummaryModelSchema = z.object({
  summary: z.string().trim().min(1).max(4000),
  // Exact source quotes: no trimming or normalization.
  quotes: z.array(z.string().min(1).max(1000)).min(1).max(4),
}).strict();
export const PageSummaryResultSchema = PageSummaryModelSchema.extend({
  pageId: z.string().min(1).max(200),
  observationId: z.string().min(1).max(200),
  documentEpoch: z.number().int().nonnegative(),
  revision: z.number().int().nonnegative(),
  sourceUrl: z.string().url().max(65536),
  sourceTitle: z.string().max(4096),
  modelId: z.string().min(1).max(500),
  truncated: z.boolean(),
}).strict();
export type PageSummaryParams = z.infer<typeof PageSummaryParamsSchema>;
export type PageSummaryResult = z.infer<typeof PageSummaryResultSchema>;
