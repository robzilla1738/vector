import { z } from "zod";

export const TabNameSuggestParamsSchema = z.object({
  pageId: z.string().min(1).max(200),
  expectedUrl: z.string().url().max(8192),
  expectedDocumentEpoch: z.number().int().nonnegative(),
}).strict();

export const TabNameSchema = z.string().trim().min(2).max(60).regex(/^[^\p{Cc}\p{Cf}]+$/u);
export const TabNameModelSchema = z.object({ name: TabNameSchema }).strict();
export const TabNameSuggestionSchema = TabNameModelSchema.extend({
  pageId: z.string(),
  sourceUrl: z.string(),
  sourceTitle: z.string(),
  documentEpoch: z.number().int().nonnegative(),
  modelId: z.string(),
}).strict();
export type TabNameSuggestion = z.infer<typeof TabNameSuggestionSchema>;
