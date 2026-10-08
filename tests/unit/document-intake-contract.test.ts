import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  DOCUMENT_TEXT_DIGEST_PREFIX,
  DocumentChunkSchema,
  DocumentMetadataSchema,
  DocumentReadResultSchema,
  DocumentSegmentSchema,
  encodeDocumentSegment,
} from "@aux/contracts/document-intake";

const metadata = {
  snapshotId: "af06846a-66a3-48ae-aeb7-596e5b593bae",
  filename: "empty.txt",
  format: "text",
  sourceSha256: createHash("sha256").update("").digest("hex"),
  sourceBytes: 0,
  extractorVersion: "aux-document-v1",
  warnings: [],
};
const completed = {
  textSha256: "ef6830b74d2f59421d0d60de29a156f5e9afa28f15906e1eb9ef74534081dbfa",
  textBytes: 0,
  segmentCount: 0,
};

describe("native document intake contract", () => {
  it("matches an independent UTF8/big-endian digest vector", () => {
    const segment = DocumentSegmentSchema.parse({
      locator: { kind: "text", line: 1, offset: 0 },
      text: "café 😀\n",
    });
    const bytes = encodeDocumentSegment(segment);
    expect(Buffer.from(bytes).toString("hex")).toBe("00000008746578743a313a300000000b636166c3a920f09f98800a");
    expect(createHash("sha256").update(DOCUMENT_TEXT_DIGEST_PREFIX).update(bytes).digest("hex")).toBe(
      "ecd137992ea1ba131cb28b14e18989e8fe00de71fc868fe63db84e6261d171a3",
    );
    expect(DocumentSegmentSchema.safeParse({ ...segment, text: "\ud800" }).success).toBe(false);
  });

  it("accepts a complete empty text snapshot but never two completion dispositions", () => {
    const result = { kind: "chunk", document: metadata, chunk: { index: 0, segments: [] }, completed };
    expect(DocumentReadResultSchema.safeParse(result).success).toBe(true);
    expect(DocumentReadResultSchema.safeParse({ ...result, nextCursor: "next" }).success).toBe(false);
    expect(
      DocumentReadResultSchema.safeParse({
        ...result,
        document: { ...metadata, format: "pdf", pageCount: 1 },
      }).success,
    ).toBe(false);
  });

  it("bounds canonical bytes and counted warning groups", () => {
    const segment = { locator: { kind: "text", line: 1, offset: 0 }, text: "é".repeat(16 * 1024) };
    expect(DocumentSegmentSchema.safeParse(segment).success).toBe(true);
    expect(DocumentChunkSchema.safeParse({ index: 0, segments: [segment, segment, segment] }).success).toBe(
      true,
    );
    expect(
      DocumentChunkSchema.safeParse({ index: 0, segments: [segment, segment, segment, segment] }).success,
    ).toBe(false);
    const warning = { code: "no_selectable_text", count: 1, firstPage: 2 };
    const pdf = { ...metadata, format: "pdf", pageCount: 3, warnings: [warning] };
    expect(DocumentMetadataSchema.safeParse(pdf).success).toBe(true);
    expect(DocumentMetadataSchema.safeParse({ ...pdf, warnings: [warning, warning] }).success).toBe(false);
  });
});
