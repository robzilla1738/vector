import { z } from "zod";

export const DOCUMENT_MAX_SOURCE_BYTES = 64 * 1024 * 1024;
export const DOCUMENT_MAX_TEXT_BYTES = 16 * 1024 * 1024;
export const DOCUMENT_MAX_FRAMED_BYTES = 32 * 1024 * 1024;
export const DOCUMENT_MAX_SEGMENT_BYTES = 32 * 1024;
export const DOCUMENT_MAX_CHUNK_BYTES = 128 * 1024;
export const DOCUMENT_EXTRACTOR_VERSION = "aux-document-v1";
export const DOCUMENT_TEXT_DIGEST_PREFIX = "aux-document-text-v1\n";

const whole = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const positive = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const sha256 = z.string().regex(/^[0-9a-f]{64}$/);
const cursor = z.string().min(1).max(200);
const filename = z.string().min(1).max(1024);
const utf8 = new TextEncoder();

export const DocumentFormatSchema = z.enum(["text", "pdf", "docx"]);
export const DocumentStorySchema = z.enum(["body", "header", "footer", "footnote", "endnote", "comment"]);
export const DocumentPartSchema = z
  .string()
  .max(80)
  .regex(/^word\/(?:document|header[1-9]\d*|footer[1-9]\d*|footnotes|endnotes|comments)\.xml$/);

export const DocumentLocatorSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("text"), line: positive, offset: whole }).strict(),
  z
    .object({
      kind: z.literal("pdf"),
      page: positive,
      block: positive,
      offset: whole,
    })
    .strict(),
  z
    .object({
      kind: z.literal("docx"),
      part: DocumentPartSchema,
      paragraph: positive,
      offset: whole,
      headingLevel: z.number().int().min(1).max(9).optional(),
      table: positive.optional(),
      row: positive.optional(),
      column: positive.optional(),
      noteId: z
        .string()
        .max(20)
        .regex(/^(?:0|-?[1-9]\d*)$/)
        .optional(),
    })
    .strict(),
]);
export type DocumentLocator = z.infer<typeof DocumentLocatorSchema>;

/** Keys contain only the fixed ASCII grammar; offsets count UTF8 bytes. */
export function documentLocatorKey(locator: DocumentLocator): string {
  if (locator.kind === "text") return `text:${locator.line}:${locator.offset}`;
  if (locator.kind === "pdf") return `pdf:${locator.page}:${locator.block}:${locator.offset}`;
  return [
    "docx",
    locator.part,
    locator.paragraph,
    locator.offset,
    locator.headingLevel ?? 0,
    locator.table ?? 0,
    locator.row ?? 0,
    locator.column ?? 0,
    locator.noteId ?? "",
  ].join(":");
}

export const DocumentSegmentSchema = z
  .object({
    locator: DocumentLocatorSchema,
    text: z
      .string()
      .min(1)
      .max(DOCUMENT_MAX_SEGMENT_BYTES)
      .refine(
        (value) =>
          !/[\uD800-\uDFFF]/u.test(value) &&
          !value.includes("\0") &&
          utf8.encode(value).byteLength <= DOCUMENT_MAX_SEGMENT_BYTES,
        "Document text must contain valid Unicode within the UTF8 segment budget.",
      ),
  })
  .strict()
  .refine(({ locator }) => {
    if (locator.kind !== "docx") return true;
    const tableFields = [locator.table, locator.row, locator.column];
    return (
      tableFields.every((value) => value === undefined) || tableFields.every((value) => value !== undefined)
    );
  }, "Document table locators require table, row and column together.");
export type DocumentSegment = z.infer<typeof DocumentSegmentSchema>;

/** Append this frame to SHA256 after DOCUMENT_TEXT_DIGEST_PREFIX, in segment order. */
export function encodeDocumentSegment(segment: DocumentSegment): Uint8Array {
  const key = utf8.encode(documentLocatorKey(segment.locator));
  const text = utf8.encode(segment.text);
  const frame = new Uint8Array(8 + key.byteLength + text.byteLength);
  const lengths = new DataView(frame.buffer);
  lengths.setUint32(0, key.byteLength, false);
  frame.set(key, 4);
  lengths.setUint32(4 + key.byteLength, text.byteLength, false);
  frame.set(text, 8 + key.byteLength);
  return frame;
}

export const DocumentWarningCodeSchema = z.enum([
  "no_selectable_text",
  "external_relationships_ignored",
  "embedded_content_ignored",
  "unsupported_markup_ignored",
]);
export const DocumentWarningSchema = z
  .object({
    code: DocumentWarningCodeSchema,
    count: positive,
    story: DocumentStorySchema.optional(),
    firstPage: positive.optional(),
    firstPart: DocumentPartSchema.optional(),
  })
  .strict();
export type DocumentWarning = z.infer<typeof DocumentWarningSchema>;

export const DocumentMetadataSchema = z
  .object({
    snapshotId: z.string().uuid(),
    filename,
    format: DocumentFormatSchema,
    sourceSha256: sha256,
    sourceBytes: whole.max(DOCUMENT_MAX_SOURCE_BYTES),
    extractorVersion: z.literal(DOCUMENT_EXTRACTOR_VERSION),
    pageCount: positive.optional(),
    warnings: z
      .array(DocumentWarningSchema)
      .max(DocumentWarningCodeSchema.options.length * (DocumentStorySchema.options.length + 1)),
  })
  .strict()
  .refine(({ format, pageCount, warnings }) => {
    if ((format === "pdf") !== (pageCount !== undefined)) return false;
    const keys = warnings.map((warning) => `${warning.code}:${warning.story ?? ""}`);
    if (new Set(keys).size !== keys.length) return false;
    return warnings.every((warning) => {
      if (warning.code === "no_selectable_text") {
        return (
          format === "pdf" &&
          warning.story === undefined &&
          warning.firstPart === undefined &&
          warning.firstPage !== undefined &&
          warning.firstPage <= (pageCount ?? 0) &&
          warning.count < (pageCount ?? 0)
        );
      }
      return format === "docx" && warning.firstPage === undefined;
    });
  }, "Document metadata must match its format and use unique counted warning groups.");
export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;

export const DocumentCompletedSchema = z
  .object({
    textSha256: sha256,
    textBytes: whole.max(DOCUMENT_MAX_TEXT_BYTES),
    segmentCount: whole.max(DOCUMENT_MAX_FRAMED_BYTES / 8),
  })
  .strict();
export type DocumentCompleted = z.infer<typeof DocumentCompletedSchema>;

export const DocumentChunkSchema = z
  .object({
    index: whole,
    segments: z.array(DocumentSegmentSchema).max(DOCUMENT_MAX_CHUNK_BYTES / 8),
  })
  .strict()
  .refine(({ segments }) => {
    let bytes = 0;
    for (const segment of segments) {
      bytes += 8 + documentLocatorKey(segment.locator).length + utf8.encode(segment.text).byteLength;
      if (bytes > DOCUMENT_MAX_CHUNK_BYTES) return false;
    }
    return true;
  }, "Document chunks must fit the canonical UTF8 frame budget.");

export type DocumentChunk = z.infer<typeof DocumentChunkSchema>;

export const DocumentUnreadableReasonSchema = z.enum([
  "unsupported_format",
  "encrypted",
  "no_text",
  "invalid_document",
  "source_limit",
  "text_limit",
  "structure_limit",
  "timeout",
  "io_error",
  "extractor_unavailable",
]);
export const DocumentReadResultSchema = z
  .discriminatedUnion("kind", [
    z
      .object({
        kind: z.literal("chunk"),
        document: DocumentMetadataSchema,
        chunk: DocumentChunkSchema,
        nextCursor: cursor.optional(),
        completed: DocumentCompletedSchema.optional(),
      })
      .strict(),
    z
      .object({
        kind: z.literal("unreadable"),
        filename,
        reason: DocumentUnreadableReasonSchema,
      })
      .strict(),
  ])
  .refine((result) => {
    if (result.kind !== "chunk") return true;
    if ((result.nextCursor !== undefined) === (result.completed !== undefined)) return false;
    if (!result.chunk.segments.every((segment) => segment.locator.kind === result.document.format)) {
      return false;
    }
    if (result.chunk.segments.length) return true;
    return (
      result.document.format === "text" &&
      result.chunk.index === 0 &&
      result.completed?.textBytes === 0 &&
      result.completed.segmentCount === 0
    );
  }, "A document chunk requires exactly one continuation or completion, with matching locators.");
export type DocumentReadResult = z.infer<typeof DocumentReadResultSchema>;

export const DocumentSelectionSchema = z
  .object({
    selectionId: z.string().uuid(),
    count: positive,
  })
  .strict();
export const DocumentReadParamsSchema = z
  .object({
    selectionId: z.string().uuid(),
    index: whole,
    cursor: cursor.optional(),
  })
  .strict();
export const DocumentSnapshotIdentitySchema = z
  .object({
    snapshotId: z.string().uuid(),
    sourceSha256: sha256,
  })
  .strict();
export const DocumentImportParamsSchema = DocumentReadParamsSchema.omit({ cursor: true })
  .extend(DocumentSnapshotIdentitySchema.shape)
  .strict();

export type DocumentSelection = z.infer<typeof DocumentSelectionSchema>;
export type DocumentReadParams = z.infer<typeof DocumentReadParamsSchema>;
export type DocumentImportParams = z.infer<typeof DocumentImportParamsSchema>;
export type DocumentSnapshotIdentity = z.infer<typeof DocumentSnapshotIdentitySchema>;
export type DocumentUnreadableReason = z.infer<typeof DocumentUnreadableReasonSchema>;
