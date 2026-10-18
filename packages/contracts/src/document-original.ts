import { z } from "zod";
import { DOCUMENT_MAX_SOURCE_BYTES, DocumentImportParamsSchema } from "./document-intake.js";

export const DOCUMENT_SOURCE_CHUNK_BYTES = 128 * 1024;
const whole = z.number().int().nonnegative().max(DOCUMENT_MAX_SOURCE_BYTES);
const id = z.string().min(1).max(200);
export const DocumentOriginalChunkSchema = z
  .object({
    snapshotId: z.string().uuid(),
    sourceSha256: z.string().regex(/^[a-f0-9]{64}$/),
    sourceBytes: whole,
    offset: whole,
    bytesBase64: z
      .string()
      .min(1)
      .max(Math.ceil(DOCUMENT_SOURCE_CHUNK_BYTES / 3) * 4),
    nextOffset: whole,
  })
  .strict();
export type DocumentOriginalChunk = z.infer<typeof DocumentOriginalChunkSchema>;
export const DocumentOriginalReadParamsSchema = DocumentImportParamsSchema.extend({ offset: whole }).strict();
export type DocumentOriginalReadParams = z.infer<typeof DocumentOriginalReadParamsSchema>;
export const ChannelDocumentOriginalSchema = z
  .object({
    kind: z.literal("channel"),
    connectionId: z.string().uuid(),
    connectionRevision: z.string().uuid(),
    messageKey: id,
    providerMessageId: id,
    peerKey: id,
    authorityId: z.string().uuid(),
    attachmentKey: id,
  })
  .strict();
export const DocumentOriginalSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("capture"),
      chunks: z
        .number()
        .int()
        .positive()
        .max(DOCUMENT_MAX_SOURCE_BYTES / DOCUMENT_SOURCE_CHUNK_BYTES),
    })
    .strict(),
  ChannelDocumentOriginalSchema,
]);
export type DocumentOriginal = z.infer<typeof DocumentOriginalSchema>;
export type ChannelDocumentOriginal = z.infer<typeof ChannelDocumentOriginalSchema>;
