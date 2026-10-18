import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { AuxError } from "@aux/contracts";
import {
  DOCUMENT_EXTRACTOR_VERSION,
  DOCUMENT_TEXT_DIGEST_PREFIX,
  DocumentChunkSchema,
  DocumentMetadataSchema,
  DocumentReadResultSchema,
  encodeDocumentSegment,
} from "@aux/contracts/document-intake";
import type { NativeBridge } from "../native.js";
import type { ChannelIntakeDependencies } from "./channel-intake.js";
import { nativeDocumentJob } from "./native-document-jobs.js";

/** Preserve PDF pages and Office story/table locators through the existing snapshot intake. */
export function nativeDocumentIntake(
  native: NativeBridge,
): NonNullable<ChannelIntakeDependencies["extractDocument"]> {
  return async (input) => {
    const check = () => {
      input.signal.throwIfAborted();
      input.checkCurrent();
    };
    check();
    const result = await nativeDocumentJob(native, { kind: "extract" }, [input], {
      signal: input.signal,
      checkCurrent: check,
    });
    const extraction = result.report.extraction;
    const output = result.outputs[0];
    try {
      check();
      if (!extraction || result.outputs.length !== 1 || output?.mediaType !== "application/json")
        throw new AuxError(
          "backend_unavailable",
          "The native extractor did not return located document text.",
        );
      const expectedFormat =
        input.mediaType === "application/pdf"
          ? "pdf"
          : [
                "application/zip",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              ].includes(input.mediaType)
            ? "docx"
            : "text";
      if (extraction.format !== expectedFormat)
        throw new AuxError("invalid_params", "The document format does not match its admitted MIME type.");
      let chunks = z
        .array(DocumentChunkSchema)
        .min(1)
        .max(400)
        .parse(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(output.bytes)));
      // Verify all canonical located frames before exposing even the first chunk.
      const digest = createHash("sha256").update(DOCUMENT_TEXT_DIGEST_PREFIX);
      let textBytes = 0,
        segmentCount = 0,
        framedBytes = 0;
      for (const [index, chunk] of chunks.entries()) {
        if (chunk.index !== index)
          throw new AuxError("ref_stale", "The extracted document chunks were reordered.");
        for (const segment of chunk.segments) {
          const frame = encodeDocumentSegment(segment);
          framedBytes += frame.length;
          textBytes += Buffer.byteLength(segment.text);
          segmentCount++;
          if (framedBytes > 32 * 1024 * 1024 || textBytes > 16 * 1024 * 1024)
            throw new AuxError("invalid_params", "The extracted document exceeds its bounded text budget.");
          digest.update(frame);
        }
      }
      if (
        extraction.completed.textSha256 !== digest.digest("hex") ||
        extraction.completed.textBytes !== textBytes ||
        extraction.completed.segmentCount !== segmentCount
      )
        throw new AuxError("ref_stale", "Located text did not match the native extraction receipt.");
      const snapshotId = randomUUID(),
        selectionId = randomUUID();
      const document = DocumentMetadataSchema.parse({
        snapshotId,
        filename: input.filename,
        format: extraction.format,
        sourceSha256: input.sha256,
        sourceBytes: input.bytes.length,
        extractorVersion: DOCUMENT_EXTRACTOR_VERSION,
        ...(extraction.pageCount ? { pageCount: extraction.pageCount } : {}),
        warnings: extraction.warnings,
      });
      let released = false;
      const cursorFor = (index: number) => `${snapshotId}:${index}`;
      return {
        identity: { selectionId, index: 0, snapshotId, sourceSha256: input.sha256 },
        source: {
          async read(cursor, signal) {
            signal.throwIfAborted();
            check();
            if (released) throw new AuxError("ref_stale", "The original document intake retired.");
            const index =
              cursor === undefined ? 0 : chunks.findIndex((_, index) => cursorFor(index) === cursor);
            const chunk = chunks[index];
            if (!chunk)
              throw new AuxError("ref_stale", "The document cursor does not belong to this source.");
            return DocumentReadResultSchema.parse({
              kind: "chunk",
              document,
              chunk,
              ...(index + 1 < chunks.length
                ? { nextCursor: cursorFor(index + 1) }
                : { completed: extraction.completed }),
            });
          },
        },
        async release() {
          released = true;
          chunks = [];
          output.bytes.fill(0);
        },
      };
    } catch (error) {
      for (const item of result.outputs) item.bytes.fill(0);
      throw error;
    }
  };
}
