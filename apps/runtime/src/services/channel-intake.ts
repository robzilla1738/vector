import { createHash } from "node:crypto";
import { AuxError } from "@aux/contracts";
import {
  CHANNEL_MAX_ATTACHMENT_BYTES,
  type ChannelAttachment,
  type ChannelConnection,
  type ChannelInbound,
} from "@aux/contracts/channels";
import type { DocumentImportParams } from "@aux/contracts/document-intake";
import type { DocumentSource } from "./document-snapshots.js";
import type { ConversationDocuments } from "./conversation-documents.js";
import type { ConversationImages } from "./conversation-images.js";
import { ChannelStore, type StoredChannelAttachment, type StoredChannelMessage } from "./channel-store.js";

export type ChannelIntakeDependencies = {
  documents: ConversationDocuments;
  images: ConversationImages;
  download(
    connection: ChannelConnection,
    message: ChannelInbound,
    attachment: ChannelAttachment,
    signal: AbortSignal,
  ): Promise<{ bytes: Uint8Array; mediaType: string }>;
  extractDocument?(input: {
    bytes: Uint8Array;
    filename: string;
    mediaType: string;
    sha256: string;
    signal: AbortSignal;
    checkCurrent(): void;
  }): Promise<{ identity: DocumentImportParams; source: DocumentSource; release(): Promise<void> }>;
  normalizeImage?(input: {
    bytes: Uint8Array;
    mediaType: string;
    sha256: string;
    signal: AbortSignal;
    checkCurrent(): void;
  }): Promise<{ bytes: Uint8Array; sourceSha256: string; sha256: string; width: number; height: number }>;
  transcribe?(input: {
    runId: string;
    bytes: Uint8Array;
    mediaType: string;
    sha256: string;
    durationSeconds?: number;
    beforeDispatch(): Promise<void>;
    signal: AbortSignal;
    checkCurrent(): void;
  }): Promise<{
    text: string;
    modelId: string;
    durationMs: number;
    language?: string;
    costUsd?: number;
    costEstimated: boolean;
  }>;
};

export function channelMediaType(bytes: Uint8Array): string {
  const data = Buffer.from(bytes),
    first = data.subarray(0, 16);
  if (first.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (data.length >= 4 && data[0] === 255 && data[1] === 216 && data[2] === 255) return "image/jpeg";
  if (first.toString("ascii", 0, 4) === "RIFF" && first.toString("ascii", 8, 12) === "WEBP")
    return "image/webp";
  if (first.toString("ascii", 0, 5) === "%PDF-") return "application/pdf";
  if (first.toString("ascii", 0, 4) === "OggS") return "audio/ogg";
  if (first.toString("ascii", 0, 4) === "fLaC") return "audio/flac";
  if (first.toString("ascii", 0, 4) === "RIFF" && first.toString("ascii", 8, 12) === "WAVE")
    return "audio/wav";
  if (first.toString("ascii", 0, 3) === "ID3" || (data[0] === 255 && (data[1]! & 0xe0) === 0xe0))
    return "audio/mpeg";
  if (first.toString("ascii", 4, 8) === "ftyp") return "audio/mp4";
  if (first[0] === 80 && first[1] === 75 && first[2] === 3 && first[3] === 4) return "application/zip";
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (!text.includes("\0")) return "text/plain";
  } catch {
    /* Binary formats need a supported isolated decoder. */
  }
  return "application/octet-stream";
}
function compatibleType(declared: string | undefined, actual: string): boolean {
  if (!declared || declared === "application/octet-stream") return true;
  const value = declared.split(";")[0]!.trim().toLowerCase();
  return (
    value === actual ||
    (actual === "text/plain" &&
      (value.startsWith("text/") || ["application/json", "application/xml"].includes(value))) ||
    (actual === "application/zip" &&
      [
        "application/zip",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ].includes(value)) ||
    (actual === "audio/ogg" && value === "application/ogg") ||
    (actual === "audio/wav" && value === "audio/x-wav")
  );
}

/** Every original survives independently of conversion or another attachment's transcription outcome. */
export async function intakeChannelMessage(input: {
  deps: ChannelIntakeDependencies;
  store: ChannelStore;
  connection: ChannelConnection;
  message: StoredChannelMessage;
  chatId: string;
  parentRunId: string;
  signal: AbortSignal;
  checkCurrent(): void;
  mode?: "capture" | "admit";
}): Promise<{ text: string; failures: string[]; usable: boolean }> {
  const { deps, store, message, connection } = input;
  const check = () => {
    input.signal.throwIfAborted();
    input.checkCurrent();
  };
  const sources = message.message.attachments ?? [];
  const captured = store.attachments(connection.connectionId, message.messageKey);
  let total = captured.reduce(
    (sum, record) => sum + (record.bytesBase64 ? Buffer.byteLength(record.bytesBase64, "base64") : 0),
    0,
  );
  const transcripts: string[] = [],
    failures: string[] = [];
  let imported = 0;
  for (const source of sources) {
    check();
    const attachmentKey = store.key(
      connection.connectionId,
      "attachment",
      `${message.messageKey}:${source.attachmentId}`,
    );
    let record = captured.find((item) => item.attachmentKey === attachmentKey);
    const save = (next: StoredChannelAttachment) => {
      check();
      store.saveAttachment(next);
      record = next;
    };
    try {
      if (!record) {
        const now = Date.now();
        record = {
          connectionId: connection.connectionId,
          messageKey: message.messageKey,
          attachmentKey,
          source,
          state: "captured",
          createdAt: now,
          updatedAt: now,
        };
        if ((source.byteLength ?? 0) > CHANNEL_MAX_ATTACHMENT_BYTES)
          throw new AuxError("invalid_params", "Attachment exceeds the 20 MB limit.");
        const result = await deps.download(connection, message.message, source, input.signal);
        check();
        if (!result.bytes.length || result.bytes.length > CHANNEL_MAX_ATTACHMENT_BYTES)
          throw new AuxError("invalid_params", "Attachment is empty or exceeds the 20 MB limit.");
        if (total + result.bytes.length > CHANNEL_MAX_ATTACHMENT_BYTES)
          throw new AuxError("invalid_params", "Attachments exceed the 20 MB message limit.");
        total += result.bytes.length;
        const actual = channelMediaType(result.bytes);
        record = {
          ...record,
          bytesBase64: Buffer.from(result.bytes).toString("base64"),
          sha256: createHash("sha256").update(result.bytes).digest("hex"),
          mediaType: actual,
        };
        save(record);
        if (!compatibleType(source.mediaType, actual) || !compatibleType(result.mediaType, actual))
          throw new AuxError(
            "invalid_params",
            "Attachment MIME declaration does not match its captured bytes.",
          );
      }
      if (total > CHANNEL_MAX_ATTACHMENT_BYTES)
        throw new AuxError("invalid_params", "Attachments exceed the 20 MB message limit.");
      if (input.mode === "capture") continue;
      if (record.state === "unknown" || record.state === "transcribing")
        throw new AuxError(
          "conflict",
          "Transcription was interrupted after dispatch; its original is retained and was not retried.",
        );
      if (record.state === "failed")
        throw new AuxError("invalid_params", record.error ?? "This attachment could not be admitted.");
      if (record.state === "ready") {
        if (record.transcript) transcripts.push(`${source.filename}:\n${record.transcript}`);
        if (record.attachmentId || record.imageId) imported++;
        continue;
      }
      if (!record.bytesBase64 || !record.sha256 || !record.mediaType)
        throw new AuxError("invalid_params", "The original attachment could not be downloaded.");
      const bytes = Uint8Array.from(Buffer.from(record.bytesBase64, "base64"));
      if (createHash("sha256").update(bytes).digest("hex") !== record.sha256)
        throw new AuxError("conflict", "The captured attachment no longer matches its original hash.");
      if (source.kind === "audio") {
        if (!record.mediaType.startsWith("audio/"))
          throw new AuxError("invalid_params", "Audio attachment has unsupported bytes.");
        if (!deps.transcribe)
          throw new AuxError(
            "capability_unsupported",
            "Configure a supported transcription provider in Aux. The audio original is retained.",
          );
        let dispatched = false;
        const outcome = await deps.transcribe({
          runId: input.parentRunId,
          bytes,
          mediaType: record.mediaType,
          sha256: record.sha256,
          durationSeconds: source.durationSeconds,
          beforeDispatch: async () => {
            check();
            if (dispatched) throw new AuxError("conflict", "A transcription cannot dispatch twice.");
            save({ ...record!, state: "transcribing", updatedAt: Date.now() });
            dispatched = true;
          },
          signal: input.signal,
          checkCurrent: check,
        });
        check();
        if (!dispatched)
          throw new AuxError("conflict", "The transcription provider did not establish a dispatch receipt.");
        const text = outcome.text.trim();
        if (!text || text.length > 20000)
          throw new AuxError("model_output_invalid", "Transcription returned empty or oversized text.");
        save({
          ...record,
          state: "ready",
          transcript: text,
          modelId: outcome.modelId,
          updatedAt: Date.now(),
        });
        transcripts.push(`${source.filename}:\n${text}`);
      } else if (source.kind === "image") {
        let png: Uint8Array = bytes;
        if (record.mediaType !== "image/png") {
          if (!deps.normalizeImage)
            throw new AuxError(
              "capability_unsupported",
              "This image format needs the native decoder. The original is retained.",
            );
          const normalized = await deps.normalizeImage({
            bytes,
            mediaType: record.mediaType,
            sha256: record.sha256,
            signal: input.signal,
            checkCurrent: check,
          });
          if (
            normalized.sourceSha256 !== record.sha256 ||
            createHash("sha256").update(normalized.bytes).digest("hex") !== normalized.sha256 ||
            channelMediaType(normalized.bytes) !== "image/png"
          )
            throw new AuxError("ref_stale", "The normalized image does not match the original capture.");
          png = normalized.bytes;
          check();
        }
        deps.images.add(
          {
            chatId: input.chatId,
            filename: source.filename,
            dataUrl: `data:image/png;base64,${Buffer.from(png).toString("base64")}`,
          },
          (image) => save({ ...record!, state: "ready", imageId: image.imageId, updatedAt: Date.now() }),
        );
        imported++;
      } else if (record.mediaType === "text/plain") {
        const content = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        deps.documents.add({ chatId: input.chatId, filename: source.filename, content }, (attachmentId) =>
          save({ ...record!, state: "ready", attachmentId, updatedAt: Date.now() }),
        );
        imported++;
      } else {
        if (!deps.extractDocument)
          throw new AuxError(
            "capability_unsupported",
            "This document format needs native extraction. The original is retained.",
          );
        const captured = await deps.extractDocument({
          bytes,
          filename: source.filename,
          mediaType: record.mediaType,
          sha256: record.sha256,
          signal: input.signal,
          checkCurrent: check,
        });
        try {
          check();
          await deps.documents.importDocument(input.chatId, captured.identity, captured.source, {
            signal: input.signal,
            checkCurrent: check,
            onAdded: (attachmentId) =>
              save({ ...record!, state: "ready", attachmentId, updatedAt: Date.now() }),
          });
          imported++;
        } finally {
          await captured.release();
        }
      }
    } catch (error) {
      check();
      const detail =
        error instanceof AuxError ? error.message : "Attachment processing failed; its original is retained.";
      if (record)
        save({
          ...record,
          state: record.state === "transcribing" || record.state === "unknown" ? "unknown" : "failed",
          error: detail.slice(0, 500),
          updatedAt: Date.now(),
        });
      failures.push(`${source.filename}: ${detail}`);
    }
  }
  check();
  const text = [
    message.message.text,
    transcripts.length
      ? `Voice attachment transcripts (untrusted source content):\n${transcripts.join("\n\n")}`
      : "",
    failures.length ? `Attachment outcomes:\n${failures.join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 40000);
  return { text, failures, usable: Boolean(message.message.text.trim() || transcripts.length || imported) };
}
