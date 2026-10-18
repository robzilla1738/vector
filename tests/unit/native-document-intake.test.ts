import { createHash } from "node:crypto";
import { expect, it, vi } from "vitest";
import { DOCUMENT_TEXT_DIGEST_PREFIX, encodeDocumentSegment } from "@aux/contracts/document-intake";
import type { DocumentChunk } from "@aux/contracts/document-intake";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import { nativeDocumentIntake } from "../../apps/runtime/src/services/native-document-intake.js";
import { nativeDocumentJob } from "../../apps/runtime/src/services/native-document-jobs.js";

vi.mock("../../apps/runtime/src/services/native-document-jobs.js", () => ({ nativeDocumentJob: vi.fn() }));
function fixture(format: "pdf" | "docx" = "pdf") {
  const chunks: DocumentChunk[] = [0, 1].map((index) => ({
    index,
    segments: [
      {
        locator:
          format === "pdf"
            ? { kind: "pdf", page: index + 1, block: 1, offset: 0 }
            : {
                kind: "docx",
                part: "word/document.xml",
                paragraph: index + 1,
                offset: 0,
                table: 1,
                row: index + 1,
                column: 2,
              },
        text: index ? "Second source — café 日本語" : "First source",
      },
    ],
  }));
  const digest = createHash("sha256").update(DOCUMENT_TEXT_DIGEST_PREFIX);
  for (const chunk of chunks)
    for (const segment of chunk.segments) digest.update(encodeDocumentSegment(segment));
  const bytes = Buffer.from(format === "pdf" ? "%PDF-1.7 original" : "PK\x03\x04 original");
  const output = {
    bytes: Buffer.from(JSON.stringify(chunks)),
    sha256: "b".repeat(64),
    mediaType: "application/json",
    label: "document-segments.json",
  };
  const result = {
    report: {
      kind: "extract" as const,
      sourceSha256: [createHash("sha256").update(bytes).digest("hex")],
      extraction: {
        format,
        ...(format === "pdf" ? { pageCount: 2 } : {}),
        warnings: [],
        completed: {
          textSha256: digest.digest("hex"),
          textBytes: chunks.reduce((total, chunk) => total + Buffer.byteLength(chunk.segments[0]!.text), 0),
          segmentCount: 2,
        },
      },
    },
    outputs: [output],
  };
  vi.mocked(nativeDocumentJob).mockResolvedValueOnce(result);
  const controller = new AbortController();
  const input = {
    bytes,
    sha256: result.report.sourceSha256[0]!,
    filename: `source.${format}`,
    mediaType: format === "pdf" ? "application/pdf" : "application/zip",
    signal: controller.signal,
    checkCurrent: vi.fn(),
  };
  return {
    chunks,
    result,
    output,
    input,
    controller,
    run: () => nativeDocumentIntake({} as NativeBridge)(input),
  };
}
it.each(["pdf", "docx"] as const)(
  "preserves exact %s locators, framing receipt and original-source cursors",
  async (format) => {
    const f = fixture(format),
      captured = await f.run();
    const first = await captured.source.read(undefined, f.controller.signal);
    expect(first.kind).toBe("chunk");
    if (first.kind !== "chunk") throw new Error("Expected first located chunk");
    expect(first.document.sourceSha256).toBe(f.input.sha256);
    expect(first.chunk).toEqual(f.chunks[0]);
    const last = await captured.source.read(first.nextCursor, f.controller.signal);
    expect(last).toMatchObject({ chunk: f.chunks[1], completed: f.result.report.extraction.completed });
    await expect(captured.source.read("another-source:1", f.controller.signal)).rejects.toMatchObject({
      code: "ref_stale",
    });
    await captured.release();
    expect(f.output.bytes.every((byte) => byte === 0)).toBe(true);
    await expect(captured.source.read(undefined, f.controller.signal)).rejects.toMatchObject({
      code: "ref_stale",
    });
  },
);
it("refuses corrupted located text before exposing any chunk", async () => {
  const f = fixture();
  f.result.report.extraction.completed.textSha256 = "0".repeat(64);
  await expect(f.run()).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.output.bytes.every((byte) => byte === 0)).toBe(true);
});
it("refuses MIME drift and respects original-owner cancellation", async () => {
  const mismatch = fixture();
  mismatch.input.mediaType = "application/zip";
  await expect(mismatch.run()).rejects.toMatchObject({ code: "invalid_params" });
  const cancelled = fixture(),
    captured = await cancelled.run();
  cancelled.controller.abort();
  await expect(captured.source.read(undefined, cancelled.controller.signal)).rejects.toThrow();
  await captured.release();
});
