import { createHash, randomUUID } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, expect, it, vi } from "vitest";
import { Repo, openDb } from "@aux/runtime";
import {
  DOCUMENT_TEXT_DIGEST_PREFIX,
  encodeDocumentSegment,
  type DocumentReadResult,
  type DocumentSegment,
} from "@aux/contracts/document-intake";
import { DocumentSnapshots, type DocumentOwner } from "../../apps/runtime/src/services/document-snapshots.js";
import { initializeFieldCodec } from "../../apps/runtime/src/store/field-codec.js";
import { profileSecrets } from "../support/profile-secrets.js";

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});
function capture(text = "Confidential document paragraph") {
  const segments: DocumentSegment[] = Array.from({ length: 5 }, (_, index) => ({
    locator: { kind: "pdf", page: index + 1, block: 1, offset: 0 },
    text: text + " ".repeat(30_000),
  }));
  const document = {
    snapshotId: randomUUID(),
    filename: "Confidential filename.pdf",
    format: "pdf" as const,
    sourceSha256: "a".repeat(64),
    sourceBytes: 4000,
    extractorVersion: "aux-document-v1" as const,
    pageCount: 5,
    warnings: [],
  };
  const hash = createHash("sha256").update(DOCUMENT_TEXT_DIGEST_PREFIX);
  for (const segment of segments) hash.update(encodeDocumentSegment(segment));
  const completed = {
    textSha256: hash.digest("hex"),
    textBytes: segments.reduce((sum, segment) => sum + Buffer.byteLength(segment.text), 0),
    segmentCount: segments.length,
  };
  const input = {
    selectionId: randomUUID(),
    index: 0,
    snapshotId: document.snapshotId,
    sourceSha256: document.sourceSha256,
  };
  const chunks: DocumentReadResult[] = [
    { kind: "chunk", document, chunk: { index: 0, segments: segments.slice(0, 3) }, nextCursor: "tail" },
    { kind: "chunk", document, chunk: { index: 1, segments: segments.slice(3) }, completed },
  ];
  return {
    input,
    chunks,
    document,
    completed,
    source: { read: async (cursor?: string) => chunks[cursor ? 1 : 0]! },
  };
}
const owner: DocumentOwner = { kind: "conversation", ownerId: "chat", documentId: "document" };
const context = () => ({ signal: new AbortController().signal, checkCurrent: () => {}, publish: vi.fn() });

it("seals immutable metadata and segments, survives reopen, and fences cursor and ciphertext identities", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-document-segments-"));
  directories.push(directory);
  const path = join(directory, "state.sqlite");
  const secrets = profileSecrets("document-segments");
  let db = openDb(path);
  let repo = new Repo(db, await initializeFieldCodec(db, secrets.native, "document-segments"));
  const fixture = capture();
  const importing = new DocumentSnapshots(repo);
  const receipt = await importing.importSource(owner, fixture.input, fixture.source, context());
  expect(receipt.sha256).not.toBe(receipt.completed.textSha256);
  await importing.close();
  db.prepare(
    "INSERT INTO document_snapshots VALUES('conversation','chat','interrupted','interrupted','staging',NULL)",
  ).run();
  db.prepare(
    "INSERT INTO document_segments VALUES('conversation','chat','interrupted','interrupted',0,'unpublished ciphertext')",
  ).run();
  repo.close();
  expect(readFileSync(path).includes("Confidential")).toBe(false);
  const raw = new DatabaseSync(path, { readOnly: true });
  expect(JSON.stringify(raw.prepare("SELECT manifest FROM document_snapshots").all())).not.toContain(
    "Confidential",
  );
  expect(JSON.stringify(raw.prepare("SELECT json FROM document_segments").all())).not.toContain(
    "Confidential",
  );
  raw.close();
  db = openDb(path);
  repo = new Repo(db, await initializeFieldCodec(db, secrets.native, "document-segments"));
  expect(db.prepare("SELECT count(*) n FROM document_snapshots WHERE state='staging'").get()).toEqual({
    n: 0,
  });
  expect(
    db.prepare("SELECT count(*) n FROM document_segments WHERE document_id='interrupted'").get(),
  ).toEqual({ n: 0 });
  try {
    const saved = new DocumentSnapshots(repo);
    const first = saved.read(owner, receipt.sha256);
    expect(first.chunk.segments).toHaveLength(4);
    const second = saved.read(owner, receipt.sha256, first.nextCursor);
    expect(second.chunk.segments[0]?.locator).toMatchObject({ page: 5 });
    expect(saved.read(owner, receipt.sha256)).toEqual(first);
    expect(() => saved.read({ ...owner, ownerId: "other" }, receipt.sha256)).toThrow();
    const other = capture("Another source");
    const otherOwner = { ...owner, documentId: "other" };
    const otherReceipt = await saved.importSource(otherOwner, other.input, other.source, context());
    expect(() => saved.read(otherOwner, otherReceipt.sha256, first.nextCursor)).toThrow(/another snapshot/);
    const cipher = db
      .prepare("SELECT json FROM document_segments WHERE document_id='document' AND ordinal=0")
      .get() as { json: string };
    db.prepare("UPDATE document_segments SET json=? WHERE document_id='document' AND ordinal=1").run(
      cipher.json,
    );
    expect(() => saved.read(owner, receipt.sha256)).toThrow();
    await saved.close();
  } finally {
    repo.close();
  }
});

it("does not publish changed captures, bad completion receipts or a stale owner's partial rows", async () => {
  const repo = new Repo(openDb(":memory:"));
  const store = new DocumentSnapshots(repo);
  try {
    for (const change of ["source", "digest", "owner"] as const) {
      const fixture = capture();
      const ctx = context();
      if (change === "source") fixture.input.sourceSha256 = "b".repeat(64);
      if (change === "digest") fixture.completed.textSha256 = "b".repeat(64);
      if (change === "owner")
        ctx.publish.mockImplementation(() => {
          throw new Error("Owner was removed");
        });
      await expect(store.importSource(owner, fixture.input, fixture.source, ctx)).rejects.toThrow();
      expect(repo.db.prepare("SELECT count(*) n FROM document_snapshots").get()).toEqual({ n: 0 });
      expect(repo.db.prepare("SELECT count(*) n FROM document_segments").get()).toEqual({ n: 0 });
    }
  } finally {
    await store.close();
    repo.close();
  }
});

it("cancels and joins a pending native read before retiring unpublished rows and closing", async () => {
  const repo = new Repo(openDb(":memory:"));
  const store = new DocumentSnapshots(repo);
  const fixture = capture();
  let acknowledgeRead!: () => void;
  const reading = new Promise<void>((resolve) => {
    acknowledgeRead = resolve;
  });
  const ctx = context();
  const pending = store.importSource(
    owner,
    fixture.input,
    {
      read: async (cursor, signal) => {
        if (!cursor) return fixture.chunks[0]!;
        acknowledgeRead();
        return new Promise((_, reject) =>
          signal.addEventListener("abort", () => reject(new Error("Native read cancelled")), { once: true }),
        );
      },
    },
    ctx,
  );
  const rejected = pending.then(
    () => {
      throw new Error("Expected the owned read to be cancelled");
    },
    (error: Error) => expect(error.message).toMatch(/cancelled/),
  );
  await reading;
  await store.close();
  await rejected;
  expect(ctx.publish).not.toHaveBeenCalled();
  expect(repo.db.prepare("SELECT count(*) n FROM document_snapshots").get()).toEqual({ n: 0 });
  expect(repo.db.prepare("SELECT count(*) n FROM document_segments").get()).toEqual({ n: 0 });
  await expect(store.importSource(owner, fixture.input, fixture.source, context())).rejects.toThrow(/closed/);
  repo.close();
});
