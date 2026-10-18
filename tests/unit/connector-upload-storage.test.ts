import { randomUUID } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, expect, it, vi } from "vitest";
import { DurableWriteLedger, openDb, Repo, SCHEMA_VERSION } from "@aux/runtime";
import type { ConnectorFileTransferRecord } from "@aux/contracts/connector-file-upload";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import { connectorTransferTablesForDatabase } from "../../apps/runtime/src/store/db.js";
import {
  encryptedFieldsForDatabase,
  initializeFieldCodec,
} from "../../apps/runtime/src/store/field-codec.js";
import { ConnectorUploadStore } from "../../apps/runtime/src/services/connector-upload-store.js";
import {
  createRuntimeBackup,
  stageRuntimeRestore,
  applyPendingRuntimeRestore,
} from "../../apps/runtime/src/services/runtime-backup.js";
import {
  exportRecoveryPackage,
  inspectRecoveryPackage,
  stageRecoveryPackage,
} from "../../apps/runtime/src/services/recovery-package.js";
import { profileSecrets } from "../support/profile-secrets.js";

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const close of cleanup.splice(0).reverse()) close();
});
function directory() {
  const path = mkdtempSync(join(tmpdir(), "aux-connector-storage-"));
  mkdirSync(join(path, "artifacts"));
  cleanup.push(() => rmSync(path, { recursive: true, force: true }));
  return path;
}
async function fixture() {
  const dir = directory(),
    profileId = randomUUID();
  const native = {
    ...profileSecrets(profileId).native,
    available: () => true,
    async recoveryOwnerAuth() {
      return { approved: true as const };
    },
  } as unknown as NativeBridge;
  const db = openDb(join(dir, "state.sqlite"));
  const codec = await initializeFieldCodec(db, native, profileId);
  const repo = new Repo(db, codec);
  cleanup.push(() => {
    if (db.isOpen) repo.close();
  });
  repo.saveRun({
    runId: "original-run",
    goal: "Synthetic storage fixture",
    status: "completed",
    pageIds: [],
    createdAt: 1,
  });
  const store = new ConnectorUploadStore(repo);
  return { dir, profileId, native, repo, store, codec };
}
function record(state: ConnectorFileTransferRecord["state"] = "prepared"): ConnectorFileTransferRecord {
  return {
    transferId: randomUUID(),
    runId: "original-run",
    taskId: randomUUID(),
    taskRevision: 1,
    workspaceId: "original-space",
    serverId: randomUUID(),
    provider: "slack",
    sourceDigest: "a".repeat(64),
    toolsRevision: 1,
    oauthEpoch: 2,
    ownerIdentity: "e".repeat(64),
    source: {
      reference: { kind: "attachment", attachmentId: "selected-original" },
      sha256: "b".repeat(64),
      size: 8,
      mediaType: "application/pdf",
      filename: "private-original.pdf",
      sourceIdentity: "original-native-source",
    },
    phase: "upload",
    state,
    createdAt: 1,
    updatedAt: 2,
    intentIds: { allocation: "original-allocation-intent", upload: "original-upload-intent" },
    approval: { approvalId: "original-approval", identity: "c".repeat(64), digest: "d".repeat(64) },
    allocation: {
      callId: randomUUID(),
      fileId: "original-file",
      response: "allocation-receipt",
      instruction: {
        url: "https://files.slack.com/upload?sealed=synthetic-private-value",
        headers: { Authorization: "synthetic-private-header" },
        encoding: { kind: "raw" },
      },
    },
  };
}
function lowerSchema(db: DatabaseSync, version: number) {
  db.exec("DROP TABLE connector_file_transfers");
  if (version < 11) db.exec("DROP TABLE x_task_grants; DROP TABLE x_accounts; DROP TABLE x_credential_jobs");
  if (version < 10) db.exec("DROP TABLE document_source_chunks");
  if (version < 9) db.exec("DROP TABLE google_task_grants");
  if (version < 8)
    db.exec(
      "DROP TABLE desktop_context_captures; DROP TABLE desktop_context_generations; DROP TABLE desktop_context_retired_keys",
    );
  if (version < 7) db.exec("DROP TABLE channel_attachments");
  if (version < 6)
    db.exec(
      "DROP TABLE channel_threads; DROP TABLE channel_peers; DROP TABLE channel_messages; DROP TABLE channel_outbox; DROP TABLE channel_cursors; DROP TABLE channel_connections",
    );
  if (version < 5) db.exec("DROP TABLE document_segments; DROP TABLE document_snapshots");
  if (version < 4)
    db.exec("DROP TABLE coding_process_logs; DELETE FROM aux_meta WHERE key='coding_process_logs_migration'");
  if (version < 3) db.exec("DROP TABLE run_start_receipts");
  db.exec(`PRAGMA user_version=${version}`);
}
it.each([2, 3, 4, 5, 6, 7, 8, 9, 10, 11])(
  "migrates historical schema%i without losing owner records",
  (version) => {
    const file = join(directory(), "state.sqlite"),
      db = openDb(file);
    db.exec("INSERT INTO kv VALUES('owner-marker','retained')");
    lowerSchema(db, version);
    expect(encryptedFieldsForDatabase(db)).not.toHaveProperty("connector_file_transfers");
    db.close();
    const migrated = openDb(file);
    try {
      expect(migrated.prepare("PRAGMA user_version").get()).toEqual({ user_version: SCHEMA_VERSION });
      expect(migrated.prepare("SELECT value FROM kv WHERE key='owner-marker'").get()).toEqual({
        value: "retained",
      });
      expect(connectorTransferTablesForDatabase(migrated)).toEqual(["connector_file_transfers"]);
      expect(encryptedFieldsForDatabase(migrated).connector_file_transfers).toEqual(["body"]);
      expect(migrated.prepare("PRAGMA foreign_key_check").all()).toEqual([]);
    } finally {
      migrated.close();
    }
  },
);
it("preserves an unexpected historical upload table before migration", () => {
  const file = join(directory(), "state.sqlite"),
    db = openDb(file);
  db.exec("PRAGMA user_version=11");
  db.close();
  expect(() => openDb(file)).toThrow(/historical database schema/);
  const preserved = new DatabaseSync(file);
  try {
    expect(preserved.prepare("PRAGMA user_version").get()).toEqual({ user_version: 11 });
  } finally {
    preserved.close();
  }
});
it.each([
  "DROP TABLE connector_file_transfers",
  "ALTER TABLE connector_file_transfers ADD COLUMN unexpected TEXT",
  "DROP INDEX idx_connector_file_transfers_run",
  "DROP INDEX idx_connector_file_transfers_state",
  "DROP INDEX idx_connector_file_transfers_state; CREATE INDEX idx_connector_file_transfers_state ON connector_file_transfers(transfer_id,state)",
  "DROP INDEX idx_connector_file_transfers_state; CREATE INDEX idx_connector_file_transfers_state ON connector_file_transfers(state,transfer_id) WHERE state='running'",
  "DROP INDEX idx_connector_file_transfers_run; CREATE INDEX idx_connector_file_transfers_run ON connector_file_transfers(state,run_id)",
  "DROP INDEX idx_connector_file_transfers_run; CREATE INDEX idx_connector_file_transfers_run ON connector_file_transfers(run_id,state) WHERE state='running'",
  "DROP TABLE connector_file_transfers; CREATE TABLE connector_file_transfers(transfer_id TEXT PRIMARY KEY,run_id TEXT NOT NULL,state TEXT NOT NULL,body TEXT NOT NULL,updated_at REAL NOT NULL); CREATE INDEX idx_connector_file_transfers_run ON connector_file_transfers(run_id,state)",
])("refuses changed transfer schema: %s", (mutation) => {
  const file = join(directory(), "state.sqlite"),
    db = openDb(file);
  db.exec(mutation);
  db.close();
  expect(() => openDb(file)).toThrow(/Protected connector transfer/);
});
it("encrypts private filenames, signed instructions and phase receipts using transfer-bound AAD", async () => {
  const f = await fixture(),
    first = record(),
    second = record();
  f.store.save(first);
  f.store.save(second);
  const raw = f.repo.db
    .prepare("SELECT body FROM connector_file_transfers WHERE transfer_id=?")
    .get(first.transferId) as { body: string };
  for (const secret of [
    first.source.filename,
    "synthetic-private-value",
    "synthetic-private-header",
    "allocation-receipt",
  ])
    expect(raw.body).not.toContain(secret);
  expect(f.store.get(first.transferId)).toEqual(first);
  f.repo.db
    .prepare("UPDATE connector_file_transfers SET body=? WHERE transfer_id=?")
    .run(raw.body, second.transferId);
  expect(() => f.store.get(second.transferId)).toThrow();
  await expect(createRuntimeBackup(f.repo, f.dir)).rejects.toThrow();
});
it.each([
  "plaintext",
  "tampered",
  "indexed-state",
  "indexed-run",
  "indexed-time",
  "manifest",
  "owner-manifest",
  "orphaned-run",
])("rejects %s transfer bodies at actual store, backup and recovery reads", async (mutation) => {
  const f = await fixture(),
    job = record();
  f.store.save(job);
  const row = f.repo.db.prepare("SELECT body FROM connector_file_transfers").get() as { body: string };
  if (mutation === "plaintext")
    f.repo.db.prepare("UPDATE connector_file_transfers SET body=?").run(JSON.stringify(job));
  if (mutation === "tampered")
    f.repo.db.prepare("UPDATE connector_file_transfers SET body=?").run(row.body.slice(0, -8) + "AAAAAAAA");
  if (mutation === "indexed-state") f.repo.db.exec("UPDATE connector_file_transfers SET state='completed'");
  if (mutation === "indexed-run") {
    f.repo.saveRun({
      runId: "replacement-run",
      goal: "Other",
      status: "completed",
      pageIds: [],
      createdAt: 1,
    });
    f.repo.db.exec("UPDATE connector_file_transfers SET run_id='replacement-run'");
  }
  if (mutation === "orphaned-run")
    f.repo.db.exec("PRAGMA foreign_keys=OFF; DELETE FROM runs; PRAGMA foreign_keys=ON");
  if (mutation === "indexed-time") f.repo.db.exec("UPDATE connector_file_transfers SET updated_at=999");
  if (mutation === "owner-manifest")
    f.repo.db
      .prepare("UPDATE connector_file_transfers SET body=?")
      .run(
        f.codec.encrypt(
          "connector_file_transfers",
          JSON.stringify([job.transferId]),
          "body",
          JSON.stringify({ ...job, ownerIdentity: undefined }),
        ),
      );
  if (mutation === "manifest")
    f.repo.db
      .prepare("UPDATE connector_file_transfers SET body=?")
      .run(
        f.codec.encrypt(
          "connector_file_transfers",
          JSON.stringify([job.transferId]),
          "body",
          JSON.stringify({ ...job, source: {} }),
        ),
      );
  await expect(initializeFieldCodec(f.repo.db, f.native, f.profileId)).resolves.toBeDefined();
  const read = () =>
    mutation === "orphaned-run" ? connectorTransferTablesForDatabase(f.repo.db) : f.store.get(job.transferId);
  expect(read).toThrow();
  await expect(createRuntimeBackup(f.repo, f.dir)).rejects.toThrow();
  await expect(
    exportRecoveryPackage(f.repo, f.native, f.dir, f.profileId, "fixture recovery phrase long enough"),
  ).rejects.toThrow();
});
it("retains uncertain receipts after boot and retires only undispatched authority without replay", async () => {
  const f = await fixture();
  const jobs = [
    "prepared",
    "waiting",
    "running",
    "uncertain",
    "completed",
    "uploaded",
    "failed",
    "retired",
  ].map((state) => record(state as ConnectorFileTransferRecord["state"]));
  for (const job of jobs) f.store.save(job);
  f.store.retireRestored();
  expect(
    f.store
      .list("original-run")
      .map((job) => job.state)
      .sort(),
  ).toEqual(
    ["retired", "retired", "uncertain", "uncertain", "completed", "uploaded", "failed", "retired"].sort(),
  );
  for (const original of jobs) {
    const current = f.store.get(original.transferId);
    expect(current.intentIds).toEqual(original.intentIds);
    expect(current.allocation).toEqual(original.allocation);
    expect(current.approval).toEqual(
      ["prepared", "waiting", "running"].includes(original.state) ? undefined : original.approval,
    );
  }
  const before = f.store.list("original-run");
  f.store.retireRestored();
  expect(f.store.list("original-run")).toEqual(before);
});
it("includes encrypted upload records in managed backups and authenticates a same-Profile restore", async () => {
  const f = await fixture(),
    job = record("running");
  f.store.save(job);
  const writes = new DurableWriteLedger(f.repo.db);
  const intent = writes.begin({
    runId: job.runId,
    pageId: "connector-file:original:upload",
    documentEpoch: 0,
    signature: "original-immutable-upload-digest",
  }).intent;
  writes.fail(intent.id);
  const backup = await createRuntimeBackup(f.repo, f.dir);
  const path = join(backup.path, "state.sqlite");
  expect(readFileSync(path).includes(Buffer.from("synthetic-private-header"))).toBe(false);
  await stageRuntimeRestore(f.dir, backup.path, f.codec);
  f.repo.close();
  expect((await applyPendingRuntimeRestore(f.dir, join(f.dir, "state.sqlite"), f.profileId)).applied).toBe(
    true,
  );
  const db = openDb(join(f.dir, "state.sqlite"));
  try {
    const codec = await initializeFieldCodec(db, f.native, f.profileId),
      repo = new Repo(db, codec),
      store = new ConnectorUploadStore(repo);
    store.retireRestored();
    expect(new DurableWriteLedger(db).getById(intent.id)?.status).toBe("uncertain");
    expect(store.get(job.transferId)).toMatchObject({
      state: "uncertain",
      intentIds: job.intentIds,
      allocation: job.allocation,
    });
  } finally {
    db.close();
  }
});
it("cross-Profile recovery reseals records and retires approvals while preserving uncertain outcomes", async () => {
  const source = await fixture(),
    target = await fixture();
  target.repo.deleteConversation("original-run");
  const jobs = [record("waiting"), record("running"), record("uncertain")];
  for (const job of jobs) source.store.save(job);
  const phrase = "reviewed fixture recovery phrase only";
  const exported = await exportRecoveryPackage(
    source.repo,
    source.native,
    source.dir,
    source.profileId,
    phrase,
  );
  expect(exported.manifest.sqliteTables).toContain("connector_file_transfers");
  const review = await inspectRecoveryPackage(exported.path, phrase, target.profileId);
  await stageRecoveryPackage(
    target.repo,
    target.native,
    target.dir,
    target.profileId,
    exported.path,
    phrase,
    review.sha256,
    review.reviewToken,
  );
  target.repo.close();
  expect(
    (await applyPendingRuntimeRestore(target.dir, join(target.dir, "state.sqlite"), target.profileId))
      .applied,
  ).toBe(true);
  const db = openDb(join(target.dir, "state.sqlite"));
  try {
    const codec = await initializeFieldCodec(db, target.native, target.profileId),
      repo = new Repo(db, codec),
      store = new ConnectorUploadStore(repo);
    for (const original of jobs) {
      const job = store.get(original.transferId);
      expect(job.state).toBe(original.state === "waiting" ? "retired" : "uncertain");
      expect(job.intentIds).toEqual(original.intentIds);
      expect(job.allocation).toEqual(original.allocation);
      expect(job.approval).toBeUndefined();
      const row = db
        .prepare("SELECT body FROM connector_file_transfers WHERE transfer_id=?")
        .get(job.transferId) as { body: string };
      expect(() =>
        source.codec.decrypt("connector_file_transfers", JSON.stringify([job.transferId]), "body", row.body),
      ).toThrow();
    }
  } finally {
    db.close();
  }
});
it("Forget cascades upload records only for the original run and leaves unrelated receipts", async () => {
  const f = await fixture(),
    removed = record("uncertain"),
    retained = { ...record("completed"), runId: "other-run" };
  f.repo.saveRun({ runId: retained.runId, goal: "Other", status: "completed", pageIds: [], createdAt: 1 });
  f.store.save(removed);
  f.store.save(retained);
  expect(f.repo.deleteConversation("original-run").deletedRuns).toBe(1);
  expect(() => f.store.get(removed.transferId)).toThrow(/unavailable/);
  expect(f.store.get(retained.transferId)).toEqual(retained);
  expect(f.repo.db.prepare("PRAGMA foreign_key_check").all()).toEqual([]);
});

it("retires actionable transfers in indexed bounded batches without reading completed history bodies", async () => {
  const f = await fixture();
  const terminal = Array.from({ length: 300 }, (_, index) => record(index % 2 ? "completed" : "uncertain"));
  const actionable = Array.from({ length: 405 }, (_, index) =>
    record(index % 3 === 0 ? "running" : index % 3 === 1 ? "prepared" : "waiting"),
  );
  for (const job of [...terminal, ...actionable]) f.store.save(job);
  const decrypt = vi.spyOn(f.repo, "revealRecordField");
  const prepare = vi.spyOn(f.repo.db, "prepare");
  f.store.retireRestored();
  const decoded = new Set(
    decrypt.mock.calls.filter(([table]) => table === "connector_file_transfers").map(([, keys]) => keys[0]),
  );
  expect(decoded).toEqual(new Set(actionable.map((job) => job.transferId)));
  expect(prepare.mock.calls.some(([sql]) => sql === "SELECT * FROM connector_file_transfers")).toBe(false);
  const query = "SELECT * FROM connector_file_transfers WHERE state=? ORDER BY transfer_id LIMIT 100";
  expect(prepare.mock.calls.some(([sql]) => sql === query)).toBe(true);
  const plan = f.repo.db.prepare(`EXPLAIN QUERY PLAN ${query}`).all("running") as { detail: string }[];
  expect(
    plan.some(({ detail }) => detail.includes("USING INDEX idx_connector_file_transfers_state (state=?)")),
  ).toBe(true);
  decrypt.mockRestore();
  prepare.mockRestore();
  for (const job of terminal) expect(f.store.get(job.transferId)).toEqual(job);
  for (const job of actionable) {
    const current = f.store.get(job.transferId);
    expect(current).toMatchObject({
      state: job.state === "running" ? "uncertain" : "retired",
      intentIds: job.intentIds,
    });
    expect(current.approval).toBeUndefined();
  }
});

it("refuses corrupt actionable bodies before startup retirement mutates any selected record", async () => {
  const f = await fixture(),
    first = record("prepared"),
    second = record("running");
  f.store.save(first);
  f.store.save(second);
  f.repo.db
    .prepare("UPDATE connector_file_transfers SET body=? WHERE transfer_id=?")
    .run(JSON.stringify(second), second.transferId);
  expect(() => f.store.retireRestored()).toThrow();
  expect(f.store.get(first.transferId)).toEqual(first);
  await expect(createRuntimeBackup(f.repo, f.dir)).rejects.toThrow();
});

it("does not decrypt damaged terminal history at boot and still refuses its actual read or export", async () => {
  const f = await fixture(),
    terminal = record("completed"),
    active = record("prepared");
  f.store.save(terminal);
  f.store.save(active);
  f.repo.db
    .prepare("UPDATE connector_file_transfers SET body=? WHERE transfer_id=?")
    .run(JSON.stringify(terminal), terminal.transferId);
  await expect(initializeFieldCodec(f.repo.db, f.native, f.profileId)).resolves.toBeDefined();
  expect(() => f.store.retireRestored()).not.toThrow();
  expect(f.store.get(active.transferId).state).toBe("retired");
  expect(() => f.store.get(terminal.transferId)).toThrow();
  await expect(createRuntimeBackup(f.repo, f.dir)).rejects.toThrow();
  await expect(
    exportRecoveryPackage(f.repo, f.native, f.dir, f.profileId, "fixture recovery phrase long enough"),
  ).rejects.toThrow();
});
