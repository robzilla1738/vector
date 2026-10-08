import { z } from "zod";

const exportId = z.string().uuid();
export const TaskReceiptExportParamsSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("prepare"),
    exportId,
    taskId: z.string().min(1),
    expectedRevision: z.number().int().positive(),
    includeCapturedText: z.boolean(),
  }).strict(),
  z.object({ action: z.literal("retire"), exportId }).strict(),
]);

export const TaskReceiptExportResultSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("prepared"),
    exportId,
    artifactId: z.string().min(1),
    filename: z.string().min(1).max(255),
    byteLength: z.number().int().nonnegative(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    expiresAt: z.number().int().positive(),
  }).strict(),
  z.object({ status: z.literal("retired"), exportId }).strict(),
]);
export type TaskReceiptExportParams = z.infer<typeof TaskReceiptExportParamsSchema>;
export type TaskReceiptExportResult = z.infer<typeof TaskReceiptExportResultSchema>;
