import { createHash, randomUUID } from "node:crypto";
import { vi } from "vitest";
import { DOCUMENT_TEXT_DIGEST_PREFIX, type DocumentReadResult } from "@aux/contracts/document-intake";
import { DOCUMENT_SOURCE_CHUNK_BYTES, type DocumentOriginalChunk } from "@aux/contracts/document-original";
const hash = (value: Uint8Array | string) => createHash("sha256").update(value).digest("hex");
export function captureOriginalPdf(size = DOCUMENT_SOURCE_CHUNK_BYTES * 2 + 31) {
  const bytes = Buffer.alloc(size, 65);
  bytes.write("%PDF-1.7\nConfidential original scanned PDF\n");
  const document = {
    snapshotId: randomUUID(),
    filename: "scan.pdf",
    format: "pdf" as const,
    sourceSha256: hash(bytes),
    sourceBytes: bytes.length,
    extractorVersion: "aux-document-v1" as const,
    pageCount: 2,
    warnings: [{ code: "no_selectable_text" as const, count: 2, firstPage: 1 }],
  };
  const completed = { textSha256: hash(DOCUMENT_TEXT_DIGEST_PREFIX), textBytes: 0, segmentCount: 0 };
  const result: DocumentReadResult = {
    kind: "chunk",
    document,
    chunk: { index: 0, segments: [] },
    completed,
  };
  const input = {
    selectionId: randomUUID(),
    index: 0,
    snapshotId: document.snapshotId,
    sourceSha256: document.sourceSha256,
  };
  const read = vi.fn(async (offset: number, _signal: AbortSignal): Promise<DocumentOriginalChunk> => {
    const nextOffset = Math.min(offset + DOCUMENT_SOURCE_CHUNK_BYTES, bytes.length);
    return {
      snapshotId: document.snapshotId,
      sourceSha256: document.sourceSha256,
      sourceBytes: bytes.length,
      offset,
      nextOffset,
      bytesBase64: bytes.subarray(offset, nextOffset).toString("base64"),
    };
  });
  return {
    bytes,
    document,
    completed,
    input,
    source: { read: async () => result, original: { kind: "capture" as const, read } },
    read,
  };
}
