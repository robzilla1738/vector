import {
  DOCUMENT_TEXT_DIGEST_PREFIX,
  encodeDocumentSegment,
  type DocumentChunk,
  type DocumentSegment,
} from "@aux/contracts/document-intake";
import {
  documentSnapshotDigestInput,
  type DocumentSnapshot,
  type SavedDocumentPage,
} from "@aux/contracts/document-snapshot";

const utf8 = new TextEncoder();
async function sha256(bytes: Uint8Array) {
  const digest = await crypto.subtle.digest("SHA-256", new Uint8Array(bytes));
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

/** Development text fixture with the same bounded located-text shape as native intake. */
export async function mockDocument(filename: string, content: string) {
  const characters = Array.from(content),
    segments: DocumentSegment[] = [];
  let line = 1,
    offset = 0;
  for (let index = 0; index < characters.length; index += 8192) {
    const text = characters.slice(index, index + 8192).join("");
    segments.push({ locator: { kind: "text", line, offset }, text });
    const lines = text.split("\n");
    line += lines.length - 1;
    offset = lines.length > 1 ? utf8.encode(lines.at(-1)!).length : offset + utf8.encode(text).length;
  }
  const frames = [utf8.encode(DOCUMENT_TEXT_DIGEST_PREFIX), ...segments.map(encodeDocumentSegment)];
  const bytes = new Uint8Array(frames.reduce((total, frame) => total + frame.length, 0));
  let position = 0;
  for (const frame of frames) {
    bytes.set(frame, position);
    position += frame.length;
  }
  const original = utf8.encode(content);
  const snapshot: Omit<DocumentSnapshot, "sha256"> = {
    document: {
      snapshotId: crypto.randomUUID(),
      filename,
      format: "text",
      sourceSha256: await sha256(original),
      sourceBytes: original.length,
      extractorVersion: "aux-document-v1",
      warnings: [],
    },
    completed: { textSha256: await sha256(bytes), textBytes: original.length, segmentCount: segments.length },
  };
  const manifest: DocumentSnapshot = {
    ...snapshot,
    sha256: await sha256(utf8.encode(documentSnapshotDigestInput(snapshot))),
  };
  const chunks: DocumentChunk[] = [];
  // Three segments fit even when every character occupies four UTF-8 bytes.
  for (let index = 0; index < segments.length; index += 3)
    chunks.push({ index: chunks.length, segments: segments.slice(index, index + 3) });
  if (!chunks.length) chunks.push({ index: 0, segments: [] });
  return {
    manifest,
    read(cursor?: string): SavedDocumentPage {
      const index = cursor ? Number(cursor) : 0;
      const chunk = Number.isSafeInteger(index) && index >= 0 ? chunks[index] : undefined;
      if (!chunk || (cursor !== undefined && cursor !== String(index)))
        throw new Error("ref_stale: Document section is unavailable.");
      return { ...manifest, chunk, ...(index + 1 < chunks.length ? { nextCursor: String(index + 1) } : {}) };
    },
  };
}
