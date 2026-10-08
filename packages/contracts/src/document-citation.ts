import { z } from "zod";
import {
  DOCUMENT_MAX_FRAMED_BYTES,
  DOCUMENT_MAX_SEGMENT_BYTES,
  DocumentLocatorSchema,
  documentLocatorKey,
  type DocumentLocator,
} from "./document-intake.js";

/** The manifest digest binds the capture metadata, source bytes and ordered located text. */
export const DocumentCitationSourceSchema = z
  .object({
    chatId: z.string().min(1),
    attachmentId: z.string().min(1),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    snapshotId: z.string().uuid(),
  })
  .strict();
export type DocumentCitationSource = z.infer<typeof DocumentCitationSourceSchema>;

export const DocumentResultCitationSchema = z
  .object({
    kind: z.literal("document"),
    source: DocumentCitationSourceSchema,
    locator: DocumentLocatorSchema,
    quote: z.string().trim().min(1).max(4_000),
  })
  .strict();
export type DocumentResultCitation = z.infer<typeof DocumentResultCitationSchema>;

/** Written only by the terminal verifier, never accepted as model input. */
export const DocumentCitationReceiptSchema = z
  .object({
    runId: z.string().min(1),
    citation: DocumentResultCitationSchema,
    referenceSha256: z.string().regex(/^[a-f0-9]{64}$/),
    excerptSha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
export type DocumentCitationReceipt = z.infer<typeof DocumentCitationReceiptSchema>;

export function documentCitationKey(source: DocumentCitationSource, locator: DocumentLocator): string {
  return JSON.stringify([
    source.chatId,
    source.attachmentId,
    source.sha256,
    source.snapshotId,
    documentLocatorKey(locator),
  ]);
}

/** Source-relative recipe; private document text is never duplicated into run state. */
export const DocumentAdmissionRecipeSchema = z
  .object({
    source: DocumentCitationSourceSchema,
    referenceSha256: z.string().regex(/^[a-f0-9]{64}$/),
    locator: DocumentLocatorSchema,
    ordinal: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    projection: z.enum(["text", "workbook-values-v1"]),
    spans: z
      .array(
        z
          .object({
            start: z
              .number()
              .int()
              .nonnegative()
              .max(DOCUMENT_MAX_SEGMENT_BYTES * 16),
            length: z
              .number()
              .int()
              .nonnegative()
              .max(DOCUMENT_MAX_SEGMENT_BYTES * 16),
          })
          .strict(),
      )
      .min(1)
      .max(512),
    length: z
      .number()
      .int()
      .positive()
      .max(DOCUMENT_MAX_SEGMENT_BYTES * 16),
    excerptSha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
export type DocumentAdmissionRecipe = z.infer<typeof DocumentAdmissionRecipeSchema>;
export const DocumentAdmissionsSchema = z
  .object({
    version: z.literal(1),
    runId: z.string().min(1),
    recipes: z.array(DocumentAdmissionRecipeSchema).max(Math.floor(DOCUMENT_MAX_FRAMED_BYTES / 256)),
  })
  .strict()
  .refine(
    (value) => new TextEncoder().encode(JSON.stringify(value)).byteLength <= DOCUMENT_MAX_FRAMED_BYTES,
    "Document admission state exceeds its protected metadata budget.",
  );
