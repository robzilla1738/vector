import { z } from "zod";

const id = z.string().uuid();
export const InlineAssistTextSchema = z.string().min(1).max(12_000).refine(
  value => !/[\p{Cc}\p{Cf}]/u.test(value.replace(/[\n\t]/g, "")),
  "Only plain text, tabs, and line breaks are allowed",
);
export const InlineAssistCaptureParamsSchema = z.object({
  pageId: z.string().min(1).max(200),
  expectedUrl: z.string().url().max(8192),
  expectedDocumentEpoch: z.number().int().nonnegative(),
}).strict();
export const InlineAssistCaptureSchema = z.object({
  captureId: id,
  pageId: z.string(),
  url: z.string().url(),
  documentEpoch: z.number().int().nonnegative(),
  origin: z.string().url(),
  fieldLabel: z.string().max(120),
  sourceText: z.string().max(8_000),
  mode: z.enum(["selection", "field"]),
  maxReplacementLength: z.number().int().positive().optional(),
}).strict();
export const InlineAssistDraftParamsSchema = z.object({
  captureId: id,
  instruction: z.string().trim().min(2).max(1000),
}).strict();
export const InlineAssistDraftSchema = z.object({
  captureId: id,
  replacement: InlineAssistTextSchema,
  modelId: z.string(),
}).strict();
export const InlineAssistApplyParamsSchema = z.object({
  captureId: id,
  replacement: InlineAssistTextSchema,
  /** The exact terminal proposal is rechecked in runtime before this bypasses model drafting. */
  proposalRunId: z.string().min(1).max(200).optional(),
}).strict();
export const InlineAssistApplySchema = z.object({ applied: z.literal(true), undoAvailable: z.literal(true) }).strict();
export const InlineAssistCancelParamsSchema = z.object({ captureId: id }).strict();
export type InlineAssistCapture = z.infer<typeof InlineAssistCaptureSchema>;
