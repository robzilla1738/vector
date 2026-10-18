import { z } from "zod";
import { DocumentCompletedSchema, DocumentFormatSchema, DocumentWarningSchema } from "./document-intake.js";

export const DOCUMENT_JOB_SOURCE_LIMIT = 64 * 1024 * 1024;
export const DOCUMENT_JOB_CHUNK_LIMIT = 256 * 1024;
export const DOCUMENT_JOB_OUTPUT_LIMIT = 32 * 1024 * 1024;
const sha256 = z.string().regex(/^[a-f0-9]{64}$/);
const page = z.number().int().min(1).max(1000);
const pages = z.array(page).min(1).max(1000);
export const PdfOperationSchema = z.discriminatedUnion("operation", [
  z
    .object({
      operation: z.literal("render"),
      pages: pages.max(20),
      scale: z.number().min(0.25).max(4).default(1),
    })
    .strict(),
  z.object({ operation: z.literal("text"), pages: pages.optional() }).strict(),
  z.object({ operation: z.literal("fields") }).strict(),
  z
    .object({
      operation: z.literal("fill"),
      values: z
        .array(
          z
            .object({ name: z.string().min(1).max(512), value: z.union([z.string().max(4096), z.boolean()]) })
            .strict(),
        )
        .min(1)
        .max(100),
    })
    .strict(),
  z
    .object({
      operation: z.literal("merge"),
      inputs: z
        .array(z.object({ sourceIndex: z.number().int().min(0).max(7), pages: pages.optional() }).strict())
        .min(2)
        .max(8),
    })
    .strict(),
  z.object({ operation: z.literal("split"), groups: z.array(pages).min(1).max(20) }).strict(),
  z
    .object({
      operation: z.literal("rotate"),
      pages,
      degrees: z.union([z.literal(90), z.literal(180), z.literal(270)]),
    })
    .strict(),
]);
export type PdfOperation = z.infer<typeof PdfOperationSchema>;
export const DocumentJobRequestSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("pdf"), options: PdfOperationSchema }).strict(),
  z.object({ kind: z.literal("extract") }).strict(),
  z.object({ kind: z.literal("audioInspect") }).strict(),
]);
const source = z
  .object({
    sha256,
    size: z.number().int().positive().max(DOCUMENT_JOB_SOURCE_LIMIT),
    mediaType: z.string().min(1).max(200),
  })
  .strict();
const jobId = z.string().min(1).max(128);
export const NativeDocumentJobParams = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("begin"),
      sources: z.array(source).min(1).max(8),
      request: DocumentJobRequestSchema,
    })
    .strict(),
  z
    .object({
      action: z.literal("append"),
      jobId,
      sourceIndex: z.number().int().min(0).max(7),
      offset: z.number().int().nonnegative().max(DOCUMENT_JOB_SOURCE_LIMIT),
      bytesBase64: z
        .string()
        .min(4)
        .max(4 * Math.ceil(DOCUMENT_JOB_CHUNK_LIMIT / 3)),
    })
    .strict(),
  z.object({ action: z.literal("run"), jobId }).strict(),
  z
    .object({
      action: z.literal("read"),
      jobId,
      outputIndex: z.number().int().min(0).max(39),
      offset: z.number().int().nonnegative().max(DOCUMENT_JOB_OUTPUT_LIMIT),
    })
    .strict(),
  z.object({ action: z.literal("close"), jobId }).strict(),
]);
export const AudioInspectionSchema = z
  .object({
    sourceSha256: sha256,
    mediaType: z.string().min(1),
    decodedFrames: z.number().int().positive(),
    sampleRate: z.number().int().positive().max(192000),
    channels: z.number().int().min(1).max(2),
    durationSeconds: z.number().positive().max(600),
    complete: z.literal(true),
  })
  .strict();
export const PdfFieldSchema = z
  .object({
    name: z.string().max(512),
    page,
    type: z.enum(["text", "checkbox", "unsupported"]),
    readOnly: z.boolean(),
    value: z.union([z.string().max(4096), z.boolean()]),
    appearanceSha256: sha256.optional(),
  })
  .strict();
export const DocumentJobReportSchema = z
  .object({
    kind: z.enum(["pdf", "extract", "audioInspect"]),
    sourceSha256: z.array(sha256).min(1).max(8),
    pageCount: z.number().int().nonnegative().max(1000).optional(),
    fields: z.array(PdfFieldSchema).max(500).optional(),
    audio: AudioInspectionSchema.optional(),
    text: z
      .string()
      .max(2 * 1024 * 1024)
      .optional(),
    pageMappings: z
      .array(
        z
          .object({
            outputIndex: z.number().int().nonnegative(),
            page,
            sourceIndex: z.number().int().nonnegative().max(7),
            sourcePage: page,
            rotation: z.number().int().min(0).max(270),
          })
          .strict(),
      )
      .max(1000)
      .optional(),
    appearancesVerified: z.literal(true).optional(),
    extraction: z
      .object({
        format: DocumentFormatSchema,
        pageCount: z.number().int().positive().optional(),
        warnings: z.array(DocumentWarningSchema).max(35),
        completed: DocumentCompletedSchema,
      })
      .strict()
      .optional(),
  })
  .strict();
export const NativeDocumentJobResult = z.discriminatedUnion("action", [
  z.object({ action: z.literal("begin"), jobId }).strict(),
  z
    .object({
      action: z.literal("append"),
      offset: z.number().int().nonnegative().max(DOCUMENT_JOB_SOURCE_LIMIT),
    })
    .strict(),
  z
    .object({
      action: z.literal("run"),
      report: DocumentJobReportSchema,
      outputs: z
        .array(
          z
            .object({
              sha256,
              size: z.number().int().nonnegative().max(DOCUMENT_JOB_OUTPUT_LIMIT),
              mediaType: z.enum(["application/pdf", "image/png", "text/plain", "application/json"]),
              label: z.string().min(1).max(128),
            })
            .strict(),
        )
        .max(40),
    })
    .strict(),
  z
    .object({
      action: z.literal("read"),
      offset: z.number().int().nonnegative().max(DOCUMENT_JOB_OUTPUT_LIMIT),
      bytesBase64: z.string().max(4 * Math.ceil(DOCUMENT_JOB_CHUNK_LIMIT / 3)),
      done: z.boolean(),
    })
    .strict(),
  z.object({ action: z.literal("close"), joined: z.literal(true) }).strict(),
]);
export type NativeDocumentJobInput = z.infer<typeof NativeDocumentJobParams>;
export type NativeDocumentJobOutput = z.infer<typeof NativeDocumentJobResult>;
export type DocumentJobRequest = z.infer<typeof DocumentJobRequestSchema>;
export type DocumentJobReport = z.infer<typeof DocumentJobReportSchema>;

export const PdfSourceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("artifact"), artifactId: z.string().min(1).max(200) }).strict(),
  z.object({ kind: z.literal("attachment"), attachmentId: z.string().min(1).max(200) }).strict(),
  z.object({ kind: z.literal("task_document"), evidenceId: z.string().min(1).max(200) }).strict(),
]);
export type PdfSource = z.infer<typeof PdfSourceSchema>;
export const PdfToolInputSchema = z
  .object({
    sources: z.array(PdfSourceSchema).min(1).max(8),
    options: PdfOperationSchema,
  })
  .strict();
export type PdfToolInput = z.infer<typeof PdfToolInputSchema>;
export const PdfJobReceiptSchema = z
  .object({
    operationId: z.string().uuid(),
    runId: z.string().min(1),
    operation: z.enum(["render", "text", "fields", "fill", "merge", "split", "rotate"]),
    sources: z
      .array(
        z
          .object({
            source: PdfSourceSchema,
            sha256,
            size: z.number().int().positive(),
            snapshotSha256: sha256.optional(),
          })
          .strict(),
      )
      .min(1)
      .max(8),
    outputs: z
      .array(
        z
          .object({
            artifactId: z.string(),
            sha256,
            mediaType: z.string(),
            size: z.number().int().nonnegative(),
            label: z.string(),
          })
          .strict(),
      )
      .max(40),
    report: DocumentJobReportSchema,
    truncated: z.boolean(),
    fieldsArtifactId: z.string().optional(),
    durationMs: z.number().int().nonnegative(),
  })
  .strict();
export type PdfJobReceipt = z.infer<typeof PdfJobReceiptSchema>;
