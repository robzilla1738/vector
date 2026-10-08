import { z } from "zod";
import { CloudCodingIdentitySchema } from "./coding-files.js";
import { CloudProcessIdentitySchema } from "./coding-processes.js";
const id = z.string().trim().min(1).max(200);
export const CodingRunParams = z.object({ runId: id }).strict();
export const CodingChangesParams = CodingRunParams.extend({
  receiptId: id.optional(),
  path: z.string().optional(),
  full: z.boolean().optional(),
})
  .strict()
  .refine(
    (input) => ((!input.path && !input.full) || !!input.receiptId) && (!input.full || !!input.path),
    "Select a receipt before requesting file contents.",
  );
export const CodingFileStateSchema = z
  .object({
    path: z.string(),
    content: z.string().nullable(),
    contentBase64: z.string().optional(),
    contentTruncated: z.boolean().optional(),
    version: z.string().nullable(),
    mode: z.number().optional(),
  })
  .strict();
export const CodingFileReceiptSchema = z
  .object({
    execution: CloudCodingIdentitySchema.optional(),
    receiptId: id,
    actionId: id,
    runId: id,
    createdAt: z.number(),
    status: z.enum(["pending", "confirmed", "partially_applied", "uncertain", "not_applied"]),
    before: z.array(CodingFileStateSchema),
    after: z.array(CodingFileStateSchema),
    undoOf: id.optional(),
    requestHash: z.string().optional(),
    error: z.string().optional(),
    fileOutcomes: z
      .array(
        z.object({
          path: z.string(),
          status: z.enum(["pending", "confirmed", "uncertain", "not_applied"]),
        }),
      )
      .optional(),
  })
  .strict();
export const CodingProcessViewSchema = z
  .object({
    execution: CloudProcessIdentitySchema.optional(),
    processId: id,
    runId: id,
    actionId: id,
    command: z.string(),
    workdir: z.string(),
    startedAt: z.number(),
    endedAt: z.number().optional(),
    state: z.enum(["starting", "running", "completed", "failed", "stopped", "uncertain", "interrupted"]),
    exitCode: z.number().nullable().optional(),
    signal: z.string().nullable().optional(),
  })
  .strict();
export type CodingProcessView = z.infer<typeof CodingProcessViewSchema>;
export const CodingUndoParams = CodingRunParams.extend({
  receiptIds: z.array(id).min(1).max(200),
  actionId: id,
}).strict();
export const CodingProcessParams = CodingRunParams.extend({ processId: id }).strict();
export const CodingLogsParams = CodingProcessParams.extend({
  cursor: z.number().int().nonnegative().default(0),
}).strict();
export const CodingLogsSchema = z
  .object({ text: z.string(), cursor: z.number().int().nonnegative(), truncated: z.boolean() })
  .strict();
