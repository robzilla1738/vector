import { z } from "zod";
import { TAB_NAME_MAX_LENGTH, TAB_NAME_MIN_LENGTH, TAB_NAME_PATTERN } from "./tab-name-rule.js";

export const TabNameSuggestParamsSchema = z
  .object({
    pageId: z.string().min(1).max(200),
    expectedUrl: z.string().url().max(8192),
    expectedDocumentEpoch: z.number().int().nonnegative(),
  })
  .strict();

export const TabNameSchema = z
  .string()
  .trim()
  .min(TAB_NAME_MIN_LENGTH)
  .max(TAB_NAME_MAX_LENGTH)
  .regex(TAB_NAME_PATTERN);
export const TabNameModelSchema = z.object({ name: TabNameSchema }).strict();
export const TabNameSuggestionSchema = TabNameModelSchema.extend({
  pageId: z.string(),
  sourceUrl: z.string(),
  sourceTitle: z.string(),
  documentEpoch: z.number().int().nonnegative(),
  modelId: z.string(),
}).strict();
export type TabNameSuggestion = z.infer<typeof TabNameSuggestionSchema>;
