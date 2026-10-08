import { createHash, randomUUID } from "node:crypto";
import type { Repo } from "@aux/runtime";
import { DOCUMENT_TEXT_DIGEST_PREFIX, encodeDocumentSegment } from "@aux/contracts/document-intake";
import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";

export async function saveDocumentSnapshot(repo: Repo) {
  const segment = {
    locator: { kind: "text" as const, line: 1, offset: 0 },
    text: "Protected segmented document",
  };
  const document = {
    snapshotId: randomUUID(),
    filename: "Protected filename.txt",
    format: "text" as const,
    sourceSha256: createHash("sha256").update(segment.text).digest("hex"),
    sourceBytes: Buffer.byteLength(segment.text),
    extractorVersion: "aux-document-v1" as const,
    warnings: [],
  };
  const completed = {
    textSha256: createHash("sha256")
      .update(DOCUMENT_TEXT_DIGEST_PREFIX)
      .update(encodeDocumentSegment(segment))
      .digest("hex"),
    textBytes: document.sourceBytes,
    segmentCount: 1,
  };
  const owner = { kind: "conversation" as const, ownerId: "fixture-chat", documentId: "fixture-document" };
  const store = new DocumentSnapshots(repo);
  try {
    const snapshot = await store.importSource(
      owner,
      {
        selectionId: randomUUID(),
        index: 0,
        snapshotId: document.snapshotId,
        sourceSha256: document.sourceSha256,
      },
      {
        read: async () => ({ kind: "chunk", document, chunk: { index: 0, segments: [segment] }, completed }),
      },
      { signal: new AbortController().signal, checkCurrent: () => {}, publish: () => {} },
    );
    return { owner, snapshot };
  } finally {
    await store.close();
  }
}
