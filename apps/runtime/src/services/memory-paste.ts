import { memoryContentSensitivityReason } from "@aux/contracts/memory-sensitivity";
import { MEMORY_PASTE_MAX_BYTES, MEMORY_PASTE_MAX_NOTES } from "@aux/contracts/memory-paste";

/** Complete bounded input is checked locally before even an ephemeral preview is retained. */
export function memoryPasteSensitivity(text: string): string | undefined {
  if (Buffer.byteLength(text, "utf8") > MEMORY_PASTE_MAX_BYTES)
    return "Paste at most 32 KiB. Nothing was saved.";
  return memoryOwnerTextSensitivity(text);
}

/** Shared content checks; each owner surface applies its own size limit first. */
export function memoryOwnerTextSensitivity(text: string): string | undefined {
  // eslint-disable-next-line no-control-regex -- Hidden control characters make owner review ambiguous.
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u206f]/u.test(text))
    return "Remove hidden control characters before reviewing these notes.";
  const normalized = text.normalize("NFKC").replace(/\s+/gu, " ");
  const sensitive = memoryContentSensitivityReason(normalized);
  if (sensitive) return `This paste contains ${sensitive}. Remove sensitive details before reviewing it.`;
  if (
    /\b(?:password|passwd|secret|api[ _-]?key|access[ _-]?token|refresh[ _-]?token|private[ _-]?key)\s*[:=]\s*\S+|\b(?:sk|vck|ghp|gho|xoxb|xoxp)[_-][a-z0-9_-]{8,}|\bbearer\s+[a-z0-9._~-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|\b\d{3}-\d{2}-\d{4}\b/iu.test(
      normalized,
    )
  )
    return "This paste appears to contain a credential or identity secret. Remove it before reviewing notes.";
  if (
    /\b(?:ignore|override|disregard)\b.{0,50}\b(?:instructions|system|safety|permissions)\b|\b(?:disable|bypass)\b.{0,30}\b(?:approval|safety|permissions)\b/iu.test(
      normalized,
    )
  )
    return "These notes include instructions to override permissions or safety. Remove those instructions before importing.";
  return undefined;
}
export function memoryPasteLines(text: string): string[] {
  return text
    .split(/\r?\n/u)
    .map((line) => line.trim().replace(/^(?:[-*•]\s+|\d+[.)]\s+)/u, ""))
    .filter(Boolean);
}
export function memoryPasteFormatReason(lines: string[]): string | undefined {
  if (!lines.length || lines.length > MEMORY_PASTE_MAX_NOTES)
    return "Use one note per line, with 1–40 notes. Nothing was saved.";
  if (lines.some((line) => line.length > 2000))
    return "Keep each note at 2,000 characters or fewer. Nothing was truncated or saved.";
  return undefined;
}
export const memoryPasteKey = (text: string) => text.normalize("NFKC").trim().replace(/\s+/gu, " ");
