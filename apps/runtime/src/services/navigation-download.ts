import { AuxError, NativeCdpDownloadOutcomeSchema, type NativeCdpDownloadOutcome } from "@aux/contracts";
import {
  NativeDocumentJobParams,
  NativeDocumentJobResult,
  type NativeDocumentJobInput,
} from "@aux/contracts/document-jobs";
import type { NativeBridge } from "../native.js";
import type { ArtifactStore } from "./artifacts.js";
import { readNativeDocumentOutput } from "./native-document-jobs.js";

export type NavigationDownloadInput = {
  runId: string;
  pageId: string;
  outcome: NativeCdpDownloadOutcome;
  signal: AbortSignal;
  validateSource(): void;
};
export type AdmittedNavigationDownload = {
  artifactId: string;
  suggestedFilename: string;
  sha256: string;
  mediaType: string;
};

/** Bytes, not a server declaration/filename, determine this limited source MIME. */
export function navigationDownloadMime(bytes: Uint8Array): string {
  const data = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (data.subarray(0, 1024).includes(Buffer.from("%PDF-"))) return "application/pdf";
  if (data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (data.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) return "image/jpeg";
  if (
    data.length >= 12 &&
    data.subarray(0, 4).toString("ascii") === "RIFF" &&
    data.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "image/webp";
  if (data.subarray(0, 4).equals(Buffer.from([80, 75, 3, 4]))) return "application/zip";
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(data);
    if (!text.includes("\0")) return "text/plain";
  } catch {
    /* Binary originals remain actual opaque artifacts, never guessed documents. */
  }
  return "application/octet-stream";
}

/** Private original-outcome producer; no caller/model file path is admitted. */
export function navigationDownloadIntake(native: NativeBridge, artifacts: ArtifactStore) {
  return async (input: NavigationDownloadInput): Promise<AdmittedNavigationDownload> => {
    const source = NativeCdpDownloadOutcomeSchema.parse(input.outcome);
    const runId = input.runId;
    const pageId = input.pageId;
    const signal = input.signal;
    const validateSource = input.validateSource;
    const check = () => {
      signal.throwIfAborted();
      validateSource();
    };
    check();
    const capabilities = await native.capabilities?.();
    check();
    const method = native.documentJob?.bind(native);
    if (
      !method ||
      capabilities?.downloadOriginal !== true ||
      !capabilities.methods.includes("native.documentJob")
    )
      throw new AuxError(
        "capability_unsupported",
        "This browser cannot admit an original navigation download.",
      );
    const call = async (params: NativeDocumentJobInput) => {
      const result = NativeDocumentJobResult.parse(await method(NativeDocumentJobParams.parse(params)));
      if (params.action !== result.action)
        throw new AuxError(
          "backend_unavailable",
          "The original download job returned another action's reply.",
        );
      return result;
    };
    // Native consumes its actual one-use outcome and binds the original lease's
    // runId. JobID is acknowledged before waiting for completion, so cancellation
    // can retire and join the exact existing capture without retrying download.
    const begun = await call({ action: "beginDownload", source: { ...source, pageId, runId } });
    if (begun.action !== "beginDownload")
      throw new AuxError("backend_unavailable", "Original download admission failed.");
    const jobId = begun.jobId;
    let closing: Promise<void> | undefined;
    const close = () =>
      (closing ??= call({ action: "close", jobId }).then((result) => {
        if (result.action !== "close" || !result.joined)
          throw new AuxError("backend_unavailable", "Original download capture did not join retirement.");
      }));
    const abort = () => {
      void close().catch(() => undefined);
    };
    signal.addEventListener("abort", abort, { once: true });
    let bytes: Buffer | undefined;
    try {
      check();
      const captured = await call({ action: "capture", jobId });
      check();
      if (
        captured.action !== "capture" ||
        captured.source.downloadId !== source.downloadId ||
        captured.source.runId !== runId
      )
        throw new AuxError("backend_unavailable", "Captured download changed its original run or GUID.");
      const original = captured.source;
      bytes = await readNativeDocumentOutput(call, jobId, 0, original, check);
      check();
      if (navigationDownloadMime(bytes) !== original.mediaType)
        throw new AuxError("backend_unavailable", "Downloaded source MIME does not match its actual bytes.");
      const sha256 = original.sha256; // The shared reader verified these immutable bytes.

      const saved = await artifacts.saveManyStrict(
        [{ runId, pageId, label: original.filename, mediaType: original.mediaType, buffer: bytes }],
        check,
      );
      check();
      const artifact = saved[0];
      if (!artifact || saved.length !== 1)
        throw new AuxError("backend_unavailable", "Original downloaded artifact was not saved.");
      return {
        artifactId: artifact.artifactId,
        suggestedFilename: original.filename,
        sha256,
        mediaType: original.mediaType,
      };
    } finally {
      signal.removeEventListener("abort", abort);
      try {
        await close();
      } finally {
        bytes?.fill(0);
      }
    }
  };
}
