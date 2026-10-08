import { createHash } from "node:crypto";
import { setImmediate } from "node:timers/promises";
import { z } from "zod";
import { AuxError } from "@aux/contracts";
import {
  DOCUMENT_MAX_CHUNK_BYTES,
  DOCUMENT_MAX_FRAMED_BYTES,
  DOCUMENT_MAX_TEXT_BYTES,
  DOCUMENT_TEXT_DIGEST_PREFIX,
  DocumentImportParamsSchema,
  DocumentReadResultSchema,
  DocumentSegmentSchema,
  encodeDocumentSegment,
  type DocumentImportParams,
  type DocumentReadResult,
  type DocumentSegment,
} from "@aux/contracts/document-intake";
import {
  DocumentSnapshotSchema,
  documentSnapshotDigestInput,
  type DocumentSnapshot,
  type SavedDocumentPage,
} from "@aux/contracts/document-snapshot";
import type { Repo } from "../store/repo.js";

export type DocumentOwner = {
  kind: "conversation" | "task";
  ownerId: string;
  documentId: string;
};
export type DocumentSource = {
  read(cursor: string | undefined, signal: AbortSignal): Promise<DocumentReadResult>;
};
export type DocumentImportContext = {
  signal: AbortSignal;
  checkCurrent(): void;
  publish(snapshot: DocumentSnapshot): void;
};
type SnapshotRow = { snapshot_id: string; manifest: string };
const identity = (owner: DocumentOwner, snapshotId: string) => [
  owner.kind,
  owner.ownerId,
  owner.documentId,
  snapshotId,
];
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const CursorSchema = z.tuple([
  z.string().regex(/^[a-f0-9]{64}$/),
  z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
]);

/** Each import owns its cancellation and unpublished rows; only a complete immutable manifest is readable. */
export class DocumentSnapshots {
  private pending = new Map<AbortController, Promise<DocumentSnapshot>>();
  private closing?: Promise<void>;
  private closed = false;
  private cleanupFailures: unknown[] = [];

  constructor(private readonly repo: Repo) {}

  importSource(
    owner: DocumentOwner,
    input: DocumentImportParams,
    source: DocumentSource,
    context: DocumentImportContext,
  ): Promise<DocumentSnapshot> {
    if (this.closed) return Promise.reject(new AuxError("cancelled", "Document intake is closed."));
    const controller = new AbortController();
    const signal = AbortSignal.any([context.signal, controller.signal]);
    const operation = this.capture(owner, DocumentImportParamsSchema.parse(input), source, {
      ...context,
      signal,
    });
    this.pending.set(controller, operation);
    void operation.then(
      () => this.pending.delete(controller),
      () => this.pending.delete(controller),
    );
    return operation;
  }

  private async capture(
    owner: DocumentOwner,
    input: DocumentImportParams,
    source: DocumentSource,
    context: DocumentImportContext,
  ): Promise<DocumentSnapshot> {
    const check = () => {
      if (context.signal.aborted) throw new AuxError("cancelled", "Document import was cancelled.");
      context.checkCurrent();
    };
    check();
    const key = identity(owner, input.snapshotId);
    let staged = false;
    let cursor: string | undefined;
    let metadata: string | undefined;
    let chunkIndex = 0;
    let ordinal = 0;
    let textBytes = 0;
    let framedBytes = 0;
    const textHash = createHash("sha256").update(DOCUMENT_TEXT_DIGEST_PREFIX);
    try {
      for (;;) {
        check();
        const result = DocumentReadResultSchema.parse(await source.read(cursor, context.signal));
        check();
        if (result.kind === "unreadable")
          throw new AuxError(
            "invalid_params",
            `The selected document could not be read: ${result.reason.replaceAll("_", " ")}.`,
          );
        if (
          result.document.snapshotId !== input.snapshotId ||
          result.document.sourceSha256 !== input.sourceSha256
        )
          throw new AuxError("ref_stale", "The selected document no longer matches the reviewed snapshot.");
        const serialized = JSON.stringify(result.document);
        if (metadata !== undefined && serialized !== metadata)
          throw new AuxError("ref_stale", "Document metadata changed during import.");
        if (result.chunk.index !== chunkIndex++)
          throw new AuxError("ref_stale", "The document stream skipped or repeated a chunk.");
        if (!staged) {
          this.repo.db
            .prepare(
              "INSERT INTO document_snapshots(owner_kind,owner_id,document_id,snapshot_id,state) VALUES(?,?,?,?,'staging')",
            )
            .run(...key);
          staged = true;
          metadata = serialized;
        }
        this.repo.transaction(() => {
          for (const segment of result.chunk.segments) {
            if (segment.locator.kind === "pdf" && segment.locator.page > (result.document.pageCount ?? 0))
              throw new AuxError("invalid_params", "A document segment names a page outside its source.");
            const frame = encodeDocumentSegment(segment);
            framedBytes += frame.byteLength;
            textBytes += Buffer.byteLength(segment.text);
            if (framedBytes > DOCUMENT_MAX_FRAMED_BYTES || textBytes > DOCUMENT_MAX_TEXT_BYTES)
              throw new AuxError("invalid_params", "The selected document exceeds the extracted text limit.");
            textHash.update(frame);
            const row = [...key, ordinal++];
            const sealed = this.repo.protectRecordField(
              "document_segments",
              row,
              "json",
              JSON.stringify(segment),
            );
            this.repo.db.prepare("INSERT INTO document_segments VALUES(?,?,?,?,?,?)").run(...row, sealed);
          }
        });
        if (result.completed) {
          if (
            result.completed.textBytes !== textBytes ||
            result.completed.segmentCount !== ordinal ||
            result.completed.textSha256 !== textHash.digest("hex")
          )
            throw new AuxError("ref_stale", "The complete document did not match its extraction receipt.");
          const captured = { document: result.document, completed: result.completed };
          const snapshot = { ...captured, sha256: digest(documentSnapshotDigestInput(captured)) };
          check();
          this.repo.transaction(() => {
            check();
            const manifest = this.repo.protectRecordField(
              "document_snapshots",
              key,
              "manifest",
              JSON.stringify(snapshot),
            );
            const updated = this.repo.db
              .prepare(
                "UPDATE document_snapshots SET state='published',manifest=? WHERE owner_kind=? AND owner_id=? AND document_id=? AND snapshot_id=? AND state='staging'",
              )
              .run(manifest, ...key);
            if (updated.changes !== 1)
              throw new AuxError("ref_stale", "The original document import was retired.");
            context.publish(snapshot);
            check();
          });
          return snapshot;
        }
        if (!result.nextCursor || result.nextCursor === cursor)
          throw new AuxError("ref_stale", "The document stream repeated a continuation.");
        cursor = result.nextCursor;
        await setImmediate();
      }
    } catch (error) {
      if (staged) {
        try {
          this.repo.db
            .prepare(
              "DELETE FROM document_snapshots WHERE owner_kind=? AND owner_id=? AND document_id=? AND snapshot_id=? AND state='staging'",
            )
            .run(...key);
        } catch (cleanup) {
          this.cleanupFailures.push(cleanup);
          throw new AggregateError(
            [error, cleanup],
            "Document import and unpublished snapshot cleanup failed.",
          );
        }
      }
      throw error;
    }
  }

  metadata(owner: DocumentOwner, expectedSha256?: string): DocumentSnapshot {
    return this.original(owner, expectedSha256).snapshot;
  }

  private original(owner: DocumentOwner, expectedSha256?: string) {
    if (this.closed) throw new AuxError("cancelled", "Document reading is closed.");
    const row = this.repo.db
      .prepare(
        "SELECT snapshot_id,manifest FROM document_snapshots WHERE owner_kind=? AND owner_id=? AND document_id=? AND state='published'",
      )
      .get(owner.kind, owner.ownerId, owner.documentId) as SnapshotRow | undefined;
    if (!row) throw new AuxError("ref_stale", "The original saved document is unavailable.");
    const snapshot = DocumentSnapshotSchema.parse(
      JSON.parse(
        this.repo.revealRecordField(
          "document_snapshots",
          identity(owner, row.snapshot_id),
          "manifest",
          row.manifest,
        ),
      ),
    );
    if (
      snapshot.document.snapshotId !== row.snapshot_id ||
      snapshot.sha256 !== digest(documentSnapshotDigestInput(snapshot)) ||
      (expectedSha256 !== undefined && snapshot.sha256 !== expectedSha256)
    )
      throw new AuxError("ref_stale", "The saved document no longer matches its original identity.");
    return { snapshot, manifest: row.manifest };
  }

  read(owner: DocumentOwner, sha256: string, cursor?: string): SavedDocumentPage {
    const { snapshot, manifest } = this.original(owner, sha256);
    const key = identity(owner, snapshot.document.snapshotId);
    const binding = digest(JSON.stringify([...key, sha256]));
    let start = 0;
    let chunkIndex = 0;
    if (cursor !== undefined) {
      let parsed: z.infer<typeof CursorSchema>;
      try {
        if (cursor.length > 200 || !/^[A-Za-z0-9_-]+$/.test(cursor)) throw new Error("Invalid cursor");
        parsed = CursorSchema.parse(JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")));
      } catch {
        throw new AuxError("ref_stale", "The saved document cursor is invalid.");
      }
      if (parsed[0] !== binding || parsed[1] >= snapshot.completed.segmentCount || parsed[2] > parsed[1])
        throw new AuxError("ref_stale", "The saved document cursor belongs to another snapshot.");
      start = parsed[1];
      chunkIndex = parsed[2];
    }
    const segments: DocumentSegment[] = [];
    let bytes = 0;
    let ordinal = start;
    while (ordinal < snapshot.completed.segmentCount) {
      const segment = this.segment(key, ordinal, manifest);
      const frameBytes = encodeDocumentSegment(segment).byteLength;
      if (bytes + frameBytes > DOCUMENT_MAX_CHUNK_BYTES) break;
      segments.push(segment);
      bytes += frameBytes;
      ordinal++;
    }
    return {
      ...snapshot,
      chunk: { index: chunkIndex, segments },
      ...(ordinal < snapshot.completed.segmentCount
        ? {
            nextCursor: Buffer.from(JSON.stringify([binding, ordinal, chunkIndex + 1])).toString("base64url"),
          }
        : {}),
    };
  }

  async *segments(
    owner: DocumentOwner,
    sha256: string,
    signal: AbortSignal,
    checkCurrent: () => void,
  ): AsyncGenerator<DocumentSegment> {
    const { snapshot, manifest } = this.original(owner, sha256);
    const key = identity(owner, snapshot.document.snapshotId);
    let batchBytes = 0;
    for (let ordinal = 0; ordinal < snapshot.completed.segmentCount; ordinal++) {
      if (this.closed || signal.aborted) throw new AuxError("cancelled", "Document reading was cancelled.");
      checkCurrent();
      const segment = this.segment(key, ordinal, manifest);
      batchBytes += Buffer.byteLength(segment.text);
      yield segment;
      if (batchBytes >= DOCUMENT_MAX_CHUNK_BYTES || ordinal % 32 === 31) {
        await setImmediate();
        batchBytes = 0;
      }
    }
    if (this.closed || signal.aborted) throw new AuxError("cancelled", "Document reading was cancelled.");
    checkCurrent();
    this.metadata(owner, sha256);
  }

  private segment(key: string[], ordinal: number, manifest: string): DocumentSegment {
    const row = this.repo.db
      .prepare(
        `SELECT segments.json FROM document_segments segments JOIN document_snapshots snapshot
        USING(owner_kind,owner_id,document_id,snapshot_id)
        WHERE owner_kind=? AND owner_id=? AND document_id=? AND snapshot_id=? AND ordinal=?
          AND snapshot.state='published' AND snapshot.manifest=?`,
      )
      .get(...key, ordinal, manifest) as { json: string } | undefined;
    if (!row) throw new AuxError("ref_stale", "A segment of the saved document is unavailable.");
    return DocumentSegmentSchema.parse(
      JSON.parse(this.repo.revealRecordField("document_segments", [...key, ordinal], "json", row.json)),
    );
  }

  remove(owner: DocumentOwner) {
    this.repo.db
      .prepare("DELETE FROM document_snapshots WHERE owner_kind=? AND owner_id=? AND document_id=?")
      .run(owner.kind, owner.ownerId, owner.documentId);
  }

  close(): Promise<void> {
    if (this.closing) return this.closing;
    this.closed = true;
    for (const controller of this.pending.keys()) controller.abort();
    this.closing = Promise.allSettled(this.pending.values()).then(() => {
      if (this.cleanupFailures.length)
        throw new AggregateError(this.cleanupFailures, "Unpublished document imports could not be retired.");
    });
    return this.closing;
  }
}
