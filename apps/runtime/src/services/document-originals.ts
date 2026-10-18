import { createHash } from "node:crypto";
import { setImmediate } from "node:timers/promises";
import { AuxError } from "@aux/contracts";
import {
  DOCUMENT_SOURCE_CHUNK_BYTES,
  DocumentOriginalChunkSchema,
  type DocumentOriginal,
  type DocumentOriginalChunk,
  type ChannelDocumentOriginal,
} from "@aux/contracts/document-original";
import type { DocumentMetadata } from "@aux/contracts/document-intake";
import type { DocumentSnapshot } from "@aux/contracts/document-snapshot";
import type { DocumentOwner } from "./document-snapshots.js";
import type { Repo } from "../store/repo.js";
import { ChannelStore } from "./channel-store.js";
import { AgentConnectionService } from "./agent-connections.js";
const liveAuthority = (repo: Repo, source: ChannelDocumentOriginal, workspaceId: string) =>
  new AgentConnectionService(repo).isLive({
    external: true,
    connectionId: source.authorityId,
    scope: { kind: "workspace", workspaceId },
  });

export type DocumentOriginalSource =
  | { kind: "capture"; read(offset: number, signal: AbortSignal): Promise<DocumentOriginalChunk> }
  | ChannelDocumentOriginal;
const key = (owner: DocumentOwner, snapshotId: string) => [
  owner.kind,
  owner.ownerId,
  owner.documentId,
  snapshotId,
];
const hash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
function channelBytes(
  repo: Repo,
  owner: DocumentOwner,
  document: DocumentMetadata,
  source: ChannelDocumentOriginal,
): Buffer {
  const store = new ChannelStore(repo);
  const connection = store.get(source.connectionId);
  const message = store.message(source.connectionId, source.providerMessageId);
  const peer = store.peer(source.connectionId, source.peerKey);
  const record = store
    .attachments(source.connectionId, source.messageKey)
    .find((item) => item.attachmentKey === source.attachmentKey);
  if (
    !connection?.enabled ||
    connection.revision !== source.connectionRevision ||
    !liveAuthority(repo, source, connection.workspaceId) ||
    !message ||
    message.messageKey !== source.messageKey ||
    message.revision !== source.connectionRevision ||
    ["retired", "rejected"].includes(message.state) ||
    message.peerKey !== source.peerKey ||
    message.authorityId !== source.authorityId ||
    peer?.state !== "paired" ||
    peer.authorityId !== source.authorityId ||
    owner.kind !== "conversation" ||
    record?.attachmentId !== owner.documentId ||
    !record.bytesBase64 ||
    record.mediaType !== "application/pdf" ||
    record.sha256 !== document.sourceSha256
  )
    throw new AuxError("ref_stale", "The original channel document or paired account authority retired.");
  const bytes = Buffer.from(record.bytesBase64, "base64");
  if (bytes.length !== document.sourceBytes || hash(bytes) !== document.sourceSha256) {
    bytes.fill(0);
    throw new AuxError("ref_stale", "The original channel document bytes changed.");
  }
  return bytes;
}

/** Rechecks account/peer/source retirement without repeatedly decrypting the large attachment body. */
export function documentOriginalFence(repo: Repo, snapshot: DocumentSnapshot): () => void {
  const source = snapshot.original;
  if (source?.kind !== "channel") return () => {};
  const store = new ChannelStore(repo);
  const row = () =>
    repo.db
      .prepare(
        `SELECT state,updated_at,${repo.columnCipher ? "substr(body,1,160)" : "body"} AS stamp FROM channel_attachments WHERE connection_id=? AND message_key=? AND attachment_key=?`,
      )
      .get(source.connectionId, source.messageKey, source.attachmentKey);
  const captured = row();
  if (!captured) throw new AuxError("ref_stale", "The original channel attachment was removed.");
  const original = JSON.stringify(captured);
  return () => {
    const connection = store.get(source.connectionId);
    const peer = store.peer(source.connectionId, source.peerKey);
    const message = store.message(source.connectionId, source.providerMessageId);
    if (
      !connection?.enabled ||
      connection.revision !== source.connectionRevision ||
      !liveAuthority(repo, source, connection.workspaceId) ||
      peer?.state !== "paired" ||
      peer.authorityId !== source.authorityId ||
      !message ||
      message.messageKey !== source.messageKey ||
      message.authorityId !== source.authorityId ||
      ["retired", "rejected"].includes(message.state) ||
      JSON.stringify(row()) !== original
    )
      throw new AuxError("ref_stale", "The original channel document's account, person or capture retired.");
  };
}

export async function captureDocumentOriginal(
  repo: Repo,
  owner: DocumentOwner,
  document: DocumentMetadata,
  source: DocumentOriginalSource,
  signal: AbortSignal,
  check: () => void,
): Promise<DocumentOriginal> {
  if (source.kind === "channel") return source;
  const digest = createHash("sha256");
  let offset = 0,
    ordinal = 0;
  while (offset < document.sourceBytes) {
    check();
    const chunk = DocumentOriginalChunkSchema.parse(await source.read(offset, signal));
    check();
    const bytes = Buffer.from(chunk.bytesBase64, "base64");
    const length = Math.min(DOCUMENT_SOURCE_CHUNK_BYTES, document.sourceBytes - offset);
    if (
      chunk.snapshotId !== document.snapshotId ||
      chunk.sourceSha256 !== document.sourceSha256 ||
      chunk.sourceBytes !== document.sourceBytes ||
      chunk.offset !== offset ||
      chunk.nextOffset !== offset + length ||
      bytes.length !== length ||
      bytes.toString("base64") !== chunk.bytesBase64
    )
      throw new AuxError(
        "ref_stale",
        "Original document bytes do not match the immutable selected snapshot.",
      );
    if (offset === 0 && document.format === "pdf" && !bytes.subarray(0, 1024).includes(Buffer.from("%PDF-")))
      throw new AuxError("invalid_params", "The selected PDF original has invalid MIME bytes.");
    digest.update(bytes);
    const identity = [...key(owner, document.snapshotId), ordinal++];
    const sealed = repo.protectRecordField(
      "document_source_chunks",
      identity,
      "json",
      JSON.stringify({ offset, bytesBase64: chunk.bytesBase64 }),
    );
    repo.db.prepare("INSERT INTO document_source_chunks VALUES(?,?,?,?,?,?)").run(...identity, sealed);
    bytes.fill(0);
    offset = chunk.nextOffset;
    await setImmediate();
  }
  check();
  if (!ordinal || digest.digest("hex") !== document.sourceSha256)
    throw new AuxError("ref_stale", "The complete original document does not match its source hash.");
  return { kind: "capture", chunks: ordinal };
}

export async function readDocumentOriginal(
  repo: Repo,
  owner: DocumentOwner,
  snapshot: DocumentSnapshot,
  signal: AbortSignal,
  check: () => void,
): Promise<Buffer> {
  check();
  const source = snapshot.original;
  if (!source)
    throw new AuxError(
      "capability_unsupported",
      "This older import retained extracted text only. Attach the original PDF again to use PDF operations.",
    );
  if (source.kind === "channel") return channelBytes(repo, owner, snapshot.document, source);
  const expectedCount = Math.ceil(snapshot.document.sourceBytes / DOCUMENT_SOURCE_CHUNK_BYTES);
  if (source.chunks !== expectedCount)
    throw new AuxError("ref_stale", "The original PDF chunk manifest changed.");
  const bytes = Buffer.alloc(snapshot.document.sourceBytes);
  try {
    for (let ordinal = 0; ordinal < source.chunks; ordinal++) {
      signal.throwIfAborted();
      check();
      const row = repo.db
        .prepare(
          "SELECT json FROM document_source_chunks WHERE owner_kind=? AND owner_id=? AND document_id=? AND snapshot_id=? AND ordinal=?",
        )
        .get(...key(owner, snapshot.document.snapshotId), ordinal) as { json: string } | undefined;
      if (!row) throw new AuxError("ref_stale", "Original PDF bytes are missing or were forgotten.");
      const value: unknown = JSON.parse(
        repo.revealRecordField(
          "document_source_chunks",
          [...key(owner, snapshot.document.snapshotId), ordinal],
          "json",
          row.json,
        ),
      );
      if (
        !value ||
        typeof value !== "object" ||
        !("offset" in value) ||
        !("bytesBase64" in value) ||
        typeof value.bytesBase64 !== "string" ||
        value.bytesBase64.length > Math.ceil(DOCUMENT_SOURCE_CHUNK_BYTES / 3) * 4
      )
        throw new AuxError("ref_stale", "The original PDF chunk is invalid.");
      const part = Buffer.from(value.bytesBase64, "base64");
      const offset = ordinal * DOCUMENT_SOURCE_CHUNK_BYTES;
      if (
        value.offset !== offset ||
        part.length !== Math.min(DOCUMENT_SOURCE_CHUNK_BYTES, bytes.length - offset) ||
        part.toString("base64") !== value.bytesBase64
      )
        throw new AuxError("ref_stale", "The original PDF chunk changed its exact bounds.");
      part.copy(bytes, offset);
      part.fill(0);
      if (ordinal % 8 === 7) await setImmediate();
    }
    check();
    if (hash(bytes) !== snapshot.document.sourceSha256)
      throw new AuxError("ref_stale", "Original PDF bytes do not match their immutable source hash.");
    return bytes;
  } catch (error) {
    bytes.fill(0);
    throw error;
  }
}
