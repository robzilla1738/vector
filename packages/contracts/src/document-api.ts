import { z } from "zod";
import {
  DOCUMENT_MAX_TEXT_BYTES,
  DocumentImportParamsSchema,
} from "./document-intake.js";

const id = z.string().min(1);
const revision = z.number().int().positive();
const sha256 = z.string().regex(/^[a-f0-9]{64}$/);
const cursor = z.string().min(1).max(200);

export const ConversationDocumentImportParamsSchema = DocumentImportParamsSchema.extend({
  chatId: id,
}).strict();

export const TaskDocumentImportParamsSchema = DocumentImportParamsSchema.extend({
  taskId: id,
  expectedRevision: revision,
  criterionId: id,
}).strict();

export const ConversationDocumentReadParamsSchema = z
  .object({
    chatId: id,
    attachmentId: id,
    sha256: sha256.optional(),
    cursor: cursor.optional(),
  })
  .strict();

export const TaskDocumentReadParamsSchema = z
  .object({
    taskId: id,
    expectedRevision: revision,
    evidenceId: id,
    sha256,
    cursor: cursor.optional(),
  })
  .strict();

/** This input is captured UTF-8 text; a filename never establishes binary extraction. */
export const TaskTextEvidenceParamsSchema = z
  .object({
    taskId: id,
    expectedRevision: revision,
    criterionId: id,
    filename: z.string().min(1).max(1024).regex(/^[^/\\\x00-\x1f]+$/),
    content: z
      .string()
      .max(DOCUMENT_MAX_TEXT_BYTES)
      .refine(
        (value) =>
          !/[\uD800-\uDFFF]/u.test(value) &&
          !value.includes("\0") &&
          new TextEncoder().encode(value).byteLength <= DOCUMENT_MAX_TEXT_BYTES,
        "Captured text must contain valid Unicode within the document text budget.",
      ),
  })
  .strict();

export type ConversationDocumentImportParams = z.infer<typeof ConversationDocumentImportParamsSchema>;
export type TaskDocumentImportParams = z.infer<typeof TaskDocumentImportParamsSchema>;
export type ConversationDocumentReadParams = z.infer<typeof ConversationDocumentReadParamsSchema>;
export type TaskDocumentReadParams = z.infer<typeof TaskDocumentReadParamsSchema>;
export type TaskTextEvidenceParams = z.infer<typeof TaskTextEvidenceParamsSchema>;
