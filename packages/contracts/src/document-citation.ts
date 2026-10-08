import { z } from "zod";
import { DocumentLocatorSchema, documentLocatorKey, type DocumentLocator } from "./document-intake.js";

/** The manifest digest binds the capture metadata, source bytes and ordered located text. */
export const DocumentCitationSourceSchema = z.object({
  chatId: z.string().min(1),
  attachmentId: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  snapshotId: z.string().uuid(),
}).strict();
export type DocumentCitationSource = z.infer<typeof DocumentCitationSourceSchema>;

export const DocumentResultCitationSchema = z.object({
  kind: z.literal("document"),
  source: DocumentCitationSourceSchema,
  locator: DocumentLocatorSchema,
  quote: z.string().trim().min(1).max(4_000),
}).strict();
export type DocumentResultCitation = z.infer<typeof DocumentResultCitationSchema>;

/** Written only by the terminal verifier, never accepted as model input. */
export const DocumentCitationReceiptSchema = z.object({
  runId: z.string().min(1),
  citation: DocumentResultCitationSchema,
  referenceSha256: z.string().regex(/^[a-f0-9]{64}$/),
  excerptSha256: z.string().regex(/^[a-f0-9]{64}$/),
}).strict();
export type DocumentCitationReceipt = z.infer<typeof DocumentCitationReceiptSchema>;

export function documentCitationKey(source: DocumentCitationSource, locator: DocumentLocator): string {
  return JSON.stringify([source.chatId, source.attachmentId, source.sha256, source.snapshotId, documentLocatorKey(locator)]);
}
