import { DocumentOriginalSchema } from "./document-original.js";
import { z } from "zod";
import { DocumentChunkSchema, DocumentCompletedSchema, DocumentMetadataSchema } from "./document-intake.js";

export const DocumentSnapshotSchema = z
  .object({
    document: DocumentMetadataSchema,
    completed: DocumentCompletedSchema,
    original: DocumentOriginalSchema.optional(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
export type DocumentSnapshot = z.infer<typeof DocumentSnapshotSchema>;

export const SavedDocumentPageSchema = DocumentSnapshotSchema.extend({
  chunk: DocumentChunkSchema,
  nextCursor: z.string().min(1).max(200).optional(),
}).strict();
export type SavedDocumentPage = z.infer<typeof SavedDocumentPageSchema>;

/** Fixed ordering binds source identity and metadata as well as the canonical located-text digest. */
export function documentSnapshotDigestInput(snapshot: Omit<DocumentSnapshot, "sha256">): string {
  const { document: d, completed: c } = snapshot;
  return JSON.stringify([
    snapshot.original ? "aux-document-manifest-v2" : "aux-document-manifest-v1",
    [
      d.snapshotId,
      d.filename,
      d.format,
      d.sourceSha256,
      d.sourceBytes,
      d.extractorVersion,
      d.pageCount ?? null,
      d.warnings.map((warning) => [
        warning.code,
        warning.count,
        warning.story ?? null,
        warning.firstPage ?? null,
        warning.firstPart ?? null,
      ]),
    ],
    [c.textSha256, c.textBytes, c.segmentCount],
    ...(snapshot.original ? [snapshot.original] : []),
  ]);
}
