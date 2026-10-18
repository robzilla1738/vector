import { createHash } from "node:crypto";
import { AuxError } from "@aux/contracts";
import {
  DOCUMENT_JOB_CHUNK_LIMIT,
  DOCUMENT_JOB_OUTPUT_LIMIT,
  DOCUMENT_JOB_SOURCE_LIMIT,
  NativeDocumentJobParams,
  NativeDocumentJobResult,
  type DocumentJobReport,
  type DocumentJobRequest,
  type NativeDocumentJobInput,
} from "@aux/contracts/document-jobs";
import type { NativeBridge } from "../native.js";

export type AdmittedJobSource = { bytes: Uint8Array; sha256: string; mediaType: string };
export type DocumentJobOutput = { bytes: Buffer; sha256: string; mediaType: string; label: string };
const hash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

/** Read one immutable native-owned output using exact original offsets/hash. */
export async function readNativeDocumentOutput(
  call: (
    input: NativeDocumentJobInput,
  ) => Promise<import("@aux/contracts/document-jobs").NativeDocumentJobOutput>,
  jobId: string,
  outputIndex: number,
  output: { size: number; sha256: string },
  check: () => void,
): Promise<Buffer> {
  const bytes = Buffer.alloc(output.size);
  let offset = 0;
  try {
    do {
      check();
      const receipt = await call({ action: "read", jobId, outputIndex, offset });
      check();
      if (receipt.action !== "read")
        throw new AuxError("backend_unavailable", "Invalid document output reply.");
      const chunk = Buffer.from(receipt.bytesBase64, "base64");
      if (
        receipt.offset !== offset ||
        chunk.toString("base64") !== receipt.bytesBase64 ||
        chunk.length > DOCUMENT_JOB_CHUNK_LIMIT ||
        chunk.length > bytes.length - offset ||
        (!chunk.length && offset !== bytes.length) ||
        receipt.done !== (offset + chunk.length === bytes.length)
      )
        throw new AuxError("backend_unavailable", "The document output was truncated or reordered.");
      chunk.copy(bytes, offset);
      offset += chunk.length;
    } while (offset < bytes.length);
    if (hash(bytes) !== output.sha256) {
      bytes.fill(0);
      throw new AuxError("backend_unavailable", "The original native output hash failed verification.");
    }
    return bytes;
  } catch (error) {
    bytes.fill(0);
    throw error;
  }
}

/** One original native channel owns upload, computation, output and process retirement. */
export async function nativeDocumentJob(
  native: NativeBridge,
  request: DocumentJobRequest,
  sources: readonly AdmittedJobSource[],
  owner: { signal: AbortSignal; checkCurrent(): void },
): Promise<{ report: DocumentJobReport; outputs: DocumentJobOutput[] }> {
  const check = () => {
    owner.signal.throwIfAborted();
    owner.checkCurrent();
  };
  check();
  // Copy before the first await: a caller's mutable view cannot alter later chunks.
  const admitted = sources.map((source) => ({ ...source, bytes: Buffer.from(source.bytes) }));
  if (
    !admitted.length ||
    admitted.length > 8 ||
    admitted.reduce((total, source) => total + source.bytes.length, 0) > DOCUMENT_JOB_SOURCE_LIMIT ||
    admitted.some((source) => !source.bytes.length || hash(source.bytes) !== source.sha256)
  )
    throw new AuxError("invalid_params", "Document source bytes do not match their admitted identity.");
  const capabilities = await native.capabilities?.();
  check();
  const method = native.documentJob?.bind(native);
  if (!method || !capabilities?.methods.includes("native.documentJob"))
    throw new AuxError("capability_unsupported", "This browser build cannot run isolated document jobs.");
  const call = async (input: NativeDocumentJobInput) => {
    const result = NativeDocumentJobResult.parse(await method(NativeDocumentJobParams.parse(input)));
    if (result.action !== input.action)
      throw new AuxError("backend_unavailable", "The original document job returned another action's reply.");
    return result;
  };
  const started = await call({
    action: "begin",
    request,
    sources: admitted.map(({ bytes, ...source }) => ({ ...source, size: bytes.length })),
  });
  if (started.action !== "begin")
    throw new AuxError("backend_unavailable", "Invalid document job admission.");
  const jobId = started.jobId;
  let closing: Promise<void> | undefined;
  const close = () =>
    (closing ??= call({ action: "close", jobId }).then((result) => {
      if (result.action !== "close" || !result.joined)
        throw new AuxError(
          "backend_unavailable",
          "The original document utility did not confirm retirement.",
        );
    }));
  const abort = () => {
    void close().catch(() => undefined);
  };
  owner.signal.addEventListener("abort", abort, { once: true });
  try {
    check();
    for (const [sourceIndex, source] of admitted.entries()) {
      for (let offset = 0; offset < source.bytes.length; offset += DOCUMENT_JOB_CHUNK_LIMIT) {
        check();
        const chunk = source.bytes.subarray(offset, offset + DOCUMENT_JOB_CHUNK_LIMIT);
        const receipt = await call({
          action: "append",
          jobId,
          sourceIndex,
          offset,
          bytesBase64: chunk.toString("base64"),
        });
        check();
        if (receipt.action !== "append" || receipt.offset !== offset + chunk.length)
          throw new AuxError("backend_unavailable", "The original document upload lost its exact offset.");
      }
    }
    const completed = await call({ action: "run", jobId });
    check();
    if (
      completed.action !== "run" ||
      completed.report.kind !== request.kind ||
      completed.report.sourceSha256.length !== admitted.length ||
      completed.report.sourceSha256.some((digest, index) => digest !== admitted[index]!.sha256) ||
      completed.outputs.reduce((total, output) => total + output.size, 0) > DOCUMENT_JOB_OUTPUT_LIMIT
    )
      throw new AuxError(
        "backend_unavailable",
        "The isolated computation changed its original source identity.",
      );
    const outputs: DocumentJobOutput[] = [];
    for (const [outputIndex, output] of completed.outputs.entries()) {
      const bytes = await readNativeDocumentOutput(call, jobId, outputIndex, output, check);
      if (
        (output.mediaType === "application/pdf" && !bytes.subarray(0, 1024).includes(Buffer.from("%PDF-"))) ||
        (output.mediaType === "image/png" &&
          !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
      ) {
        bytes.fill(0);
        throw new AuxError(
          "backend_unavailable",
          "The document output MIME declaration failed verification.",
        );
      }
      outputs.push({ ...output, bytes });
    }
    check();
    return { report: completed.report, outputs };
  } finally {
    owner.signal.removeEventListener("abort", abort);
    try {
      await close();
    } finally {
      for (const source of admitted) source.bytes.fill(0);
    }
  }
}
