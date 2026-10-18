import { AgentConnectionService } from "../../apps/runtime/src/services/agent-connections.js";
import { seedChannel } from "../fixtures/channels.js";
import { captureOriginalPdf as capture } from "../support/pdf-original.js";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, expect, it, vi } from "vitest";
import { type Run } from "@aux/contracts";
import { DOCUMENT_SOURCE_CHUNK_BYTES } from "@aux/contracts/document-original";
import { documentSnapshotDigestInput } from "@aux/contracts/document-snapshot";
import { Repo, openDb, SCHEMA_VERSION } from "@aux/runtime";
import { DocumentSnapshots, type DocumentOwner } from "../../apps/runtime/src/services/document-snapshots.js";
import { ConversationDocuments } from "../../apps/runtime/src/services/conversation-documents.js";
import { initializeFieldCodec } from "../../apps/runtime/src/store/field-codec.js";
import { withPdfSources, listPdfSources } from "../../apps/runtime/src/services/pdf-sources.js";
import { EventBus } from "../../apps/runtime/src/events.js";
import { TaskService } from "../../apps/runtime/src/services/tasks.js";
import { TaskEvidenceService } from "../../apps/runtime/src/services/task-evidence.js";
import { profileSecrets } from "../support/profile-secrets.js";

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanups.splice(0)) await close();
});
const identity: DocumentOwner = { kind: "conversation", ownerId: "chat", documentId: "pdf" };
const signal = () => new AbortController().signal;
const context = () => ({ signal: signal(), checkCurrent: () => {}, publish: vi.fn() });

async function fixture(file = false) {
  const directory = mkdtempSync(join(tmpdir(), "aux-originals-")),
    path = file ? join(directory, "state.sqlite") : ":memory:",
    secrets = profileSecrets("originals");
  const db = openDb(path),
    repo = new Repo(db, await initializeFieldCodec(db, secrets.native, "originals"));
  const documents = new DocumentSnapshots(repo),
    attachments = new ConversationDocuments(repo, documents);
  cleanups.push(async () => {
    await documents.close();
    repo.close();
    rmSync(directory, { recursive: true, force: true });
  });
  return { repo, db, documents, attachments, path, secrets };
}
it("retains an image-only PDF as encrypted exact original bytes, not invented text or an output artifact", async () => {
  const f = await fixture(true),
    c = capture();
  const receipt = await f.documents.importSource(identity, c.input, c.source, context());
  expect(receipt.completed).toMatchObject({ textBytes: 0, segmentCount: 0 });
  expect(f.documents.read(identity, receipt.sha256).chunk.segments).toEqual([]);
  expect(receipt.original).toEqual({ kind: "capture", chunks: 3 });
  expect(documentSnapshotDigestInput(receipt)).toContain("aux-document-manifest-v2");
  expect(c.read.mock.calls.map(([offset]) => offset)).toEqual([
    0,
    DOCUMENT_SOURCE_CHUNK_BYTES,
    2 * DOCUMENT_SOURCE_CHUNK_BYTES,
  ]);
  const rows = f.db.prepare("SELECT json FROM document_source_chunks").all();
  expect(JSON.stringify(rows)).not.toContain(c.bytes.subarray(0, 120).toString("base64"));
  const saved = await f.documents.useOriginal(
    identity,
    receipt.sha256,
    signal(),
    () => {},
    async (bytes) => Buffer.from(bytes),
  );
  expect(saved).toEqual(c.bytes);
  expect(readFileSync(f.path).includes("Confidential")).toBe(false);
  expect(f.db.prepare("SELECT count(*) n FROM artifacts").get()).toEqual({ n: 0 });
});
it.each(["hash", "offset", "mime", "truncated"] as const)(
  "never publishes an original with %s mismatch",
  async (change) => {
    const f = await fixture(),
      c = capture(),
      ctx = context();
    const base = c.read.getMockImplementation()!;
    c.read.mockImplementation(async (offset, s) => {
      const chunk = await base(offset, s);
      if (change === "hash") chunk.sourceSha256 = "b".repeat(64);
      if (change === "offset") chunk.nextOffset--;
      if (change === "truncated") chunk.bytesBase64 = Buffer.from("partial").toString("base64");
      if (change === "mime") {
        const bad = Buffer.from(chunk.bytesBase64, "base64");
        bad.fill(65, 0, 16);
        chunk.bytesBase64 = bad.toString("base64");
      }
      return chunk;
    });
    await expect(f.documents.importSource(identity, c.input, c.source, ctx)).rejects.toThrow();
    expect(ctx.publish).not.toHaveBeenCalled();
    expect(f.db.prepare("SELECT count(*) n FROM document_source_chunks").get()).toEqual({ n: 0 });
    expect(f.db.prepare("SELECT count(*) n FROM document_snapshots").get()).toEqual({ n: 0 });
  },
);
it("authenticates source chunk ordinals and owner identity and removes source bytes with Forget", async () => {
  const f = await fixture(),
    c = capture(),
    receipt = await f.documents.importSource(identity, c.input, c.source, context());
  const cipher = f.db.prepare("SELECT json FROM document_source_chunks WHERE ordinal=0").get() as {
    json: string;
  };
  f.db.prepare("UPDATE document_source_chunks SET json=? WHERE ordinal=1").run(cipher.json);
  await expect(
    f.documents.useOriginal(
      identity,
      receipt.sha256,
      signal(),
      () => {},
      async () => true,
    ),
  ).rejects.toThrow();
  await expect(
    f.documents.useOriginal(
      { ...identity, ownerId: "other" },
      receipt.sha256,
      signal(),
      () => {},
      async () => true,
    ),
  ).rejects.toMatchObject({ code: "ref_stale" });
  f.documents.remove(identity);
  expect(f.db.prepare("SELECT count(*) n FROM document_source_chunks").get()).toEqual({ n: 0 });
});
it("cancels and joins the native operation using original bytes before owner retirement completes", async () => {
  const f = await fixture(),
    c = capture(),
    receipt = await f.documents.importSource(identity, c.input, c.source, context());
  let started!: () => void, acknowledge!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  let nativeClosed = false;
  const operation = f.documents.useOriginal(
    identity,
    receipt.sha256,
    signal(),
    () => {},
    async (bytes, s) => {
      expect(bytes).toEqual(c.bytes);
      started();
      try {
        await new Promise<void>((_, reject) =>
          s.addEventListener(
            "abort",
            () => {
              acknowledge = () => reject(s.reason);
            },
            { once: true },
          ),
        );
      } finally {
        nativeClosed = true;
      }
    },
  );
  const observed = operation.catch((error: unknown) => error);
  await ready;
  let retired = false;
  const retiring = f.documents.retireOwner(identity.kind, identity.ownerId).then(() => {
    retired = true;
  });
  await Promise.resolve();
  expect(retired).toBe(false);
  expect(nativeClosed).toBe(false);
  acknowledge();
  await retiring;
  expect(nativeClosed).toBe(true);
  await expect(observed).resolves.toMatchObject({ name: "AbortError" });
  f.documents.remove(identity);
  expect(f.db.prepare("SELECT count(*) n FROM document_source_chunks").get()).toEqual({ n: 0 });
});
it("uses only the exact selected attachment, exposes scanned source identity, and fences deselection", async () => {
  const f = await fixture(),
    c = capture();
  f.repo.createConversationDraft("chat", "Synthetic", false);
  await f.attachments.importDocument("chat", c.input, c.source, {
    signal: signal(),
    checkCurrent: () => {},
  });
  const record = f.attachments.records("chat")[0];
  if (!record) throw new Error("Missing attachment");
  const ref = { chatId: "chat", attachmentId: record.attachmentId, sha256: record.sha256 };
  const run: Run = {
    runId: "run",
    goal: "Rotate selected scan",
    status: "running",
    pageIds: [],
    createdAt: 1,
    config: { contextAttachmentRefs: [ref] },
  };
  f.repo.saveRun(run);
  const deps = { repo: f.repo, documents: f.documents, attachments: f.attachments },
    owner = { run, signal: signal(), checkCurrent: () => {} };
  expect(await listPdfSources(deps, {}, owner)).toMatchObject({
    sources: [
      {
        source: { kind: "attachment", attachmentId: record.attachmentId },
        status: "available",
        filename: "scan.pdf",
      },
    ],
  });
  await expect(
    withPdfSources(deps, [{ kind: "attachment", attachmentId: "not-selected" }], owner, async () => true),
  ).rejects.toMatchObject({ code: "permission_denied" });
  await expect(
    withPdfSources(
      deps,
      [{ kind: "attachment", attachmentId: record.attachmentId }],
      owner,
      async (sources, _s, check) => {
        expect(sources[0]!.bytes).toEqual(c.bytes);
        f.attachments.update("chat", record.attachmentId, { included: false });
        check();
        return true;
      },
    ),
  ).rejects.toMatchObject({ code: "ref_stale" });
  expect((await listPdfSources(deps, {}, owner)).sources[0]).toMatchObject({ status: "unavailable" });
});
it("admits only original PDF task evidence from the exact current task revision", async () => {
  const f = await fixture(),
    c = capture(),
    events = new EventBus(f.repo),
    tasks = new TaskService(f.repo, events),
    evidence = new TaskEvidenceService(f.repo, events, f.documents);
  const workspace = tasks.createWorkspace("Synthetic"),
    task = tasks.create({
      workspaceId: workspace.workspaceId,
      title: "Rotate",
      objective: "Rotate PDF",
      criteria: [{ criterionId: "pdf", description: "Source", verification: "manual" }],
    });
  const record = await evidence.importDocument(
    { ...c.input, taskId: task.taskId, expectedRevision: task.revision, criterionId: "pdf" },
    c.source,
    { signal: signal() },
  );
  const prepared = tasks.prepareRun(task.taskId, task.revision),
    run: Run = {
      runId: "task-run",
      goal: "Rotate",
      status: "running",
      pageIds: [],
      createdAt: 1,
      config: {
        taskId: task.taskId,
        taskRevision: task.revision,
        contextTaskDocumentRefs: prepared.contextTaskDocumentRefs,
      },
    };
  f.repo.saveRun(run);
  const deps = { repo: f.repo, documents: f.documents, attachments: f.attachments },
    owner = { run, signal: signal(), checkCurrent: () => {} };
  expect(prepared.contextTaskDocumentRefs).toHaveLength(1);
  expect(
    await withPdfSources(
      deps,
      [{ kind: "task_document", evidenceId: record.evidenceId }],
      owner,
      async (sources) => Buffer.from(sources[0]!.bytes),
    ),
  ).toEqual(c.bytes);
  f.db.prepare("UPDATE tasks SET revision=revision+1 WHERE task_id=?").run(task.taskId);
  await expect(
    withPdfSources(deps, [{ kind: "task_document", evidenceId: record.evidenceId }], owner, async () => true),
  ).rejects.toMatchObject({ code: "ref_stale" });
  expect((await listPdfSources(deps, {}, owner)).sources[0]).toMatchObject({ status: "unavailable" });
});
function historicalDatabase(forged: boolean) {
  const directory = mkdtempSync(join(tmpdir(), "aux-original-migration-"));
  cleanups.push(async () => {
    rmSync(directory, { recursive: true, force: true });
  });
  const path = join(directory, "state.sqlite"),
    db = openDb(path);
  db.exec(
    "DROP TABLE connector_file_transfers; DROP TABLE x_task_grants; DROP TABLE x_accounts; DROP TABLE x_credential_jobs; DROP TABLE document_source_chunks; PRAGMA user_version=9",
  );
  if (forged) db.exec("CREATE TABLE document_source_forged(secret TEXT)");
  db.close();
  return path;
}
it("migrates an authentic schema9 database to encrypted original-byte support", () => {
  const migrated = openDb(historicalDatabase(false));
  expect(migrated.prepare("PRAGMA user_version").get()).toEqual({ user_version: SCHEMA_VERSION });
  migrated.close();
});
it("refuses a forged historical source table before changing the database", () => {
  const path = historicalDatabase(true);
  expect(() => openDb(path)).toThrow(/historical/);
  const raw = new DatabaseSync(path);
  expect(raw.prepare("PRAGMA user_version").get()).toEqual({ user_version: 9 });
  expect(
    raw.prepare("SELECT name FROM sqlite_schema WHERE name='document_source_chunks'").get(),
  ).toBeUndefined();
  raw.close();
});
it("keeps the legacy text-only manifest digest unchanged and reports missing originals honestly", async () => {
  const f = await fixture(),
    receipt = f.documents.writeText(identity, "notes.txt", "original text", () => {});
  expect(documentSnapshotDigestInput(receipt)).toContain("aux-document-manifest-v1");
  await expect(
    f.documents.useOriginal(
      identity,
      receipt.sha256,
      signal(),
      () => {},
      async () => true,
    ),
  ).rejects.toMatchObject({ code: "capability_unsupported" });
});

it("reuses the encrypted channel original without a second binary copy and retires it with its paired authority", async () => {
  const f = await fixture(),
    c = capture(),
    tasks = new TaskService(f.repo, new EventBus(f.repo)),
    workspace = tasks.createWorkspace("Synthetic"),
    task = tasks.create({
      workspaceId: workspace.workspaceId,
      title: "Source",
      objective: "Read",
      criteria: [{ criterionId: "read", description: "Read", verification: "manual" }],
    });
  const ch = seedChannel(f.repo, workspace.workspaceId, task.taskId),
    connections = new AgentConnectionService(f.repo);
  const authority = connections.create({
    name: "Synthetic PDF peer",
    client: "telegram",
    scope: { kind: "workspace", workspaceId: workspace.workspaceId },
  }).connection;
  ch.store.savePeer(ch.connection.connectionId, {
    ...ch.store.peer(ch.connection.connectionId, ch.peerKey)!,
    state: "paired",
    authorityId: authority.connectionId,
    requestId: undefined,
    expiresAt: undefined,
  });
  const message = { ...ch.savedMessage, state: "pending" as const, authorityId: authority.connectionId };
  ch.store.saveMessage(message);
  const original = {
    kind: "channel" as const,
    connectionId: ch.connection.connectionId,
    connectionRevision: ch.connection.revision,
    messageKey: message.messageKey,
    providerMessageId: message.message.messageId,
    peerKey: ch.peerKey,
    authorityId: authority.connectionId,
    attachmentKey: ch.store.key(ch.connection.connectionId, "attachment", "source"),
  };
  ch.store.saveAttachment({
    connectionId: original.connectionId,
    messageKey: original.messageKey,
    attachmentKey: original.attachmentKey,
    state: "ready",
    source: { attachmentId: "source", filename: "scan.pdf", kind: "document", mediaType: "application/pdf" },
    bytesBase64: c.bytes.toString("base64"),
    sha256: c.document.sourceSha256,
    mediaType: "application/pdf",
    attachmentId: identity.documentId,
    createdAt: 1,
    updatedAt: 1,
  });
  const receipt = await f.documents.importSource(identity, c.input, { ...c.source, original }, context());
  expect(f.db.prepare("SELECT count(*) n FROM document_source_chunks").get()).toEqual({ n: 0 });
  expect(
    await f.documents.useOriginal(
      identity,
      receipt.sha256,
      signal(),
      () => {},
      async (bytes) => Buffer.from(bytes),
    ),
  ).toEqual(c.bytes);
  await expect(
    f.documents.useOriginal(
      identity,
      receipt.sha256,
      signal(),
      () => {},
      async (_bytes, _s, check) => {
        connections.revoke(authority.connectionId);
        check();
        return true;
      },
    ),
  ).rejects.toMatchObject({ code: "ref_stale" });
  await expect(
    f.documents.useOriginal(
      identity,
      receipt.sha256,
      signal(),
      () => {},
      async () => true,
    ),
  ).rejects.toMatchObject({ code: "ref_stale" });
});
