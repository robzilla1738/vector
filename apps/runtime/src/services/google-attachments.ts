import { createHash } from "node:crypto";
import { AuxError } from "@aux/contracts";
import type { NativeBridge } from "../native.js";
import type { ChannelIntakeDependencies } from "./channel-intake.js";
import { channelMediaType } from "./channel-intake.js";
import { nativeDocumentIntake } from "./native-document-intake.js";
import { nativeImageIntake } from "./native-image-intake.js";

export type GoogleAttachmentInspection = {
  bytes: Uint8Array;
  filename: string;
  mediaType: string;
  sha256: string;
  signal: AbortSignal;
  checkCurrent(): void;
};
export type InspectGoogleAttachment = (
  input: GoogleAttachmentInspection,
) => Promise<{ mediaType: string; sourceSha256: string }>;
export function googleAttachmentMetadata(
  source: Record<string, unknown>,
  messageId: string,
  attachmentId: string,
) {
  if (source.id !== messageId)
    throw new AuxError("ref_stale", "The original Gmail message metadata changed.");
  const pending = [{ value: source.payload, depth: 0 }],
    matches: Record<string, unknown>[] = [];
  let visited = 0;
  while (pending.length) {
    const { value, depth } = pending.pop()!;
    if (!value || typeof value !== "object" || Array.isArray(value) || ++visited > 1000 || depth > 16)
      throw new AuxError("backend_unavailable", "Gmail attachment metadata exceeds its supported structure.");
    const part = value as Record<string, unknown>,
      body = part.body as { attachmentId?: unknown } | undefined;
    if (body?.attachmentId === attachmentId) matches.push(part);
    if (part.parts !== undefined) {
      if (!Array.isArray(part.parts))
        throw new AuxError("backend_unavailable", "Gmail returned invalid attachment metadata.");
      if (part.parts.length + pending.length + visited > 1000)
        throw new AuxError(
          "backend_unavailable",
          "Gmail attachment metadata exceeds its supported structure.",
        );
      for (const child of part.parts) pending.push({ value: child, depth: depth + 1 });
    }
  }
  if (matches.length !== 1)
    throw new AuxError("ref_stale", "The exact original Gmail attachment metadata is unavailable.");
  const part = matches[0]!,
    size = (part.body as { size?: unknown }).size;
  if (
    typeof part.filename !== "string" ||
    typeof part.mimeType !== "string" ||
    !Number.isSafeInteger(size) ||
    (size as number) < 0
  )
    throw new AuxError("backend_unavailable", "Gmail returned incomplete attachment metadata.");
  const filename =
    part.filename
      .replace(/[\\/:]/g, "_")
      .replace(/[\p{Cc}\p{Cf}]/gu, "")
      .trim()
      .slice(0, 180) || "attachment";
  return {
    filename,
    mediaType: part.mimeType.split(";")[0]!.trim().toLowerCase().slice(0, 128),
    size: size as number,
  };
}
/** MIME publication requires decoding immutable bytes, not a caller or provider declaration. */
export function googleAttachmentInspector(
  deps: Pick<ChannelIntakeDependencies, "extractDocument" | "normalizeImage">,
): InspectGoogleAttachment {
  return async (input) => {
    const check = () => {
      input.signal.throwIfAborted();
      input.checkCurrent();
    };
    check();
    const bytes = Uint8Array.from(input.bytes),
      sha256 = createHash("sha256").update(bytes).digest("hex");
    if (sha256 !== input.sha256)
      throw new AuxError("ref_stale", "The original Gmail attachment bytes changed.");
    const detected = channelMediaType(bytes);
    if (
      input.mediaType !== "application/octet-stream" &&
      input.mediaType !== detected &&
      !(
        detected === "application/zip" &&
        input.mediaType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    )
      throw new AuxError("capability_unsupported", "The provider attachment MIME does not match its bytes.");
    if (["image/png", "image/jpeg", "image/webp"].includes(detected)) {
      if (!deps.normalizeImage)
        throw new AuxError("capability_unsupported", "Native attachment image inspection is unavailable.");
      const image = await deps.normalizeImage({
        ...input,
        bytes,
        mediaType: detected,
        checkCurrent: check,
      });
      try {
        check();
        if (image.sourceSha256 !== sha256)
          throw new AuxError("ref_stale", "The inspected attachment image identity changed.");
      } finally {
        image.bytes.fill(0);
      }
      return { mediaType: detected, sourceSha256: sha256 };
    }
    if (!["application/pdf", "application/zip", "text/plain"].includes(detected) || !deps.extractDocument)
      throw new AuxError(
        "capability_unsupported",
        "This attachment format has no available native inspector.",
      );
    const captured = await deps.extractDocument({
      ...input,
      bytes,
      mediaType: detected,
      checkCurrent: check,
    });
    try {
      check();
      if (captured.identity.sourceSha256 !== sha256)
        throw new AuxError("ref_stale", "The inspected attachment document identity changed.");
      return {
        mediaType:
          detected === "application/zip"
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : detected,
        sourceSha256: sha256,
      };
    } finally {
      await captured.release();
    }
  };
}
export function nativeGoogleAttachmentInspector(native: NativeBridge): InspectGoogleAttachment {
  return googleAttachmentInspector({
    extractDocument: nativeDocumentIntake(native),
    normalizeImage: nativeImageIntake(native),
  });
}
