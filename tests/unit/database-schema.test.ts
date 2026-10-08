import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { withSecureDelete, openDb, PrivacyCheckpoint, Repo, SCHEMA_VERSION } from "@aux/runtime";

const directories: string[] = [];
const connections: DatabaseSync[] = [];
function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "aux-migration-"));
  directories.push(directory);
  return { directory, path: join(directory, "state.sqlite") };
}
function track(db: DatabaseSync) {
  connections.push(db);
  return db;
}
function version(db: DatabaseSync) {
  return (db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version;
}
afterEach(() => {
  for (const db of connections.splice(0)) {
    try {
      db.close();
    } catch {
      /* already closed */
    }
  }
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe("fresh schema", () => {
  it("overwrites deleted plaintext cells before a checkpointed profile is persisted", () => {
    const { path } = fixture();
    const db = track(openDb(path));
    expect(db.prepare("PRAGMA secure_delete").get()).toEqual({ secure_delete: 0 });
    const secret = "private-answer-sentinel-".repeat(500);
    db.prepare("INSERT INTO kv(key,value) VALUES(?,?)").run("forgotten-answer", secret);
    withSecureDelete(db, () => db.prepare("DELETE FROM kv WHERE key=?").run("forgotten-answer"));
    db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
    db.close();
    expect(readFileSync(path).includes(Buffer.from("private-answer-sentinel"))).toBe(false);
    expect(track(openDb(path)).prepare("PRAGMA secure_delete").get()).toEqual({ secure_delete: 0 });
  });

  it("truncates the live WAL after deletion without closing the active profile", async () => {
    const { path } = fixture();
    const db = track(openDb(path));
    const secret = "forgotten-wal-sentinel-".repeat(500);
    db.prepare("INSERT INTO kv(key,value) VALUES(?,?)").run("forgotten", secret);
    withSecureDelete(db, () => db.prepare("DELETE FROM kv WHERE key=?").run("forgotten"));
    const checkpoint = new PrivacyCheckpoint(path);
    try {
      expect(statSync(`${path}-wal`).size).toBeGreaterThan(0);
      checkpoint.request();
      const deadline = Date.now() + 5_000;
      while (Date.now() < deadline && statSync(`${path}-wal`).size > 0) {
        expect(db.prepare("SELECT count(*) AS count FROM kv").get()).toEqual({ count: 0 });
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      expect(statSync(`${path}-wal`).size).toBe(0);
      expect(readFileSync(path).includes(Buffer.from("forgotten-wal-sentinel"))).toBe(false);
    } finally {
      await checkpoint.close();
    }
  });

  it("retries a deletion checkpoint after another reader releases its snapshot", async () => {
    const { path } = fixture();
    const db = track(openDb(path));
    db.prepare("INSERT INTO kv(key,value) VALUES(?,?)").run("key", "old snapshot");
    const reader = track(new DatabaseSync(path, { readOnly: true }));
    reader.exec("BEGIN");
    reader.prepare("SELECT value FROM kv WHERE key='key'").get();
    db.prepare("DELETE FROM kv WHERE key='key'").run();
    const checkpoint = new PrivacyCheckpoint(path);
    try {
      checkpoint.request();
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(statSync(`${path}-wal`).size).toBeGreaterThan(0);
      reader.exec("COMMIT");
      const deadline = Date.now() + 5_000;
      while (Date.now() < deadline && statSync(`${path}-wal`).size > 0)
        await new Promise((resolve) => setTimeout(resolve, 20));
      expect(statSync(`${path}-wal`).size).toBe(0);
    } finally {
      reader.close();
      await checkpoint.close();
    }
  });

  it("initializes a fresh profile with every table, indexes, and the Aux marker", () => {
    const { directory, path } = fixture();
    const db = track(openDb(path));
    expect(version(db)).toBe(SCHEMA_VERSION);
    expect(db.prepare("PRAGMA journal_mode").get()).toEqual({ journal_mode: "wal" });
    expect(db.prepare("PRAGMA synchronous").get()).toEqual({ synchronous: 1 });
    expect(db.prepare("PRAGMA secure_delete").get()).toEqual({ secure_delete: 0 });
    expect(
      (db.prepare("SELECT value FROM aux_meta WHERE key='schema'").get() as { value: string }).value,
    ).toBe("aux-v3");
    const tables = db.prepare("SELECT name FROM sqlite_schema WHERE type='table'").all() as {
      name: string;
    }[];
    for (const table of [
      "kv",
      "sessions",
      "pages",
      "tabs",
      "page_sets",
      "set_members",
      "runs",
      "run_messages",
      "conversations",
      "steps",
      "results",
      "content_memory",
      "programs",
      "artifacts",
      "model_calls",
      "private_spend",
      "events",
      "history",
      "bookmarks",
      "bookmark_folders",
      "bookmark_articles",
      "downloads",
      "spans",
      "response_metadata",
      "datasets",
      "operations",
      "operation_implementations",
      "operation_invocations",
      "operation_reconciliations",
      "action_intents",
      "action_transitions",
      "workspaces",
      "tasks",
      "task_lookup",
      "task_revisions",
      "task_evidence",
      "criterion_reviews",
      "agent_connections",
      "vault_items",
      "vault_grants",
      "vault_access",
      "routines",
      "routine_revisions",
      "calendar_connections",
      "calendar_task_grants",
      "routine_runs",
      "coordinator_leases",
      "criterion_verifications",
      "history_fts",
      "plugins",
      "history_projection_staging",
      "safety_approval_requests",
      "safety_send_journal",
      "plugin_assets",
      "plugin_skill_grants",
      "goals",
      "hooks",
      "hook_invocations",
      "site_user_css",
      "site_zap_rules",
      "run_lookup",
      "coding_process_logs",
    ]) {
      expect(tables.map((row) => row.name)).toContain(table);
    }
    expect(tables.map((row) => row.name)).not.toContain("journal_imports");
    expect(tables.map((row) => row.name)).not.toContain("observations");
    for (const index of [
      "idx_conversations_state_updated",
      "idx_run_lookup_task",
      "idx_tasks_workspace",
      "idx_task_lookup_conversation",
      "idx_action_intents_unresolved",
      "idx_action_intents_task_unresolved",
      "idx_events_run",
      "idx_artifacts_run",
      "idx_respmeta_run",
    ]) {
      expect(
        db.prepare("SELECT name FROM sqlite_schema WHERE type='index' AND name=?").get(index),
      ).toBeDefined();
    }
    db.prepare("INSERT INTO kv VALUES (?, ?)").run("synthetic", "retained");
    db.close();
    const reopened = track(openDb(path));
    expect((reopened.prepare("SELECT value FROM kv").get() as { value: string }).value).toBe("retained");
    expect(readdirSync(directory).filter((name) => !name.startsWith("state.sqlite"))).toEqual([]);
  });

  it("adds first-send receipts to a v2 Profile without rewriting its saved chat or settings", () => {
    const { path } = fixture();
    const previous = track(openDb(path)),
      repo = new Repo(previous);
    repo.saveRun({
      runId: "saved-run",
      goal: "Saved question",
      status: "completed",
      pageIds: [],
      createdAt: 42,
      config: { chatId: "saved-chat" },
    });
    repo.setSetting("owner-choice", "preserved");
    previous.exec("DROP TABLE run_start_receipts; DROP TABLE coding_process_logs; PRAGMA user_version=2");
    const savedRun = previous.prepare("SELECT * FROM runs").get();
    const savedChat = previous.prepare("SELECT * FROM conversations").get();
    previous.close();
    const upgraded = track(openDb(path));
    expect(version(upgraded)).toBe(SCHEMA_VERSION);
    expect(upgraded.prepare("SELECT * FROM runs").get()).toEqual(savedRun);
    expect(upgraded.prepare("SELECT * FROM conversations").get()).toEqual(savedChat);
    expect(new Repo(upgraded).getSetting("owner-choice")).toBe("preserved");
    expect(upgraded.prepare("SELECT count(*) AS n FROM run_start_receipts").get()).toEqual({ n: 0 });
  });

  it("enforces foreign keys on owned child rows and cascades deletes", () => {
    const { path } = fixture();
    const db = track(openDb(path));
    expect(() =>
      db
        .prepare("INSERT INTO action_transitions(intent_id,status,recorded_at) VALUES(?,?,?)")
        .run("missing", "pending", 1),
    ).toThrow(/FOREIGN KEY/);
    db.prepare(
      "INSERT INTO action_intents(id,idempotency_key,run_id,page_id,document_epoch,status,created_at) VALUES(?,?,?,?,?,?,?)",
    ).run("i1", "k1", "run", "page", 1, "pending", 1);
    db.prepare("INSERT INTO action_transitions(intent_id,status,recorded_at) VALUES(?,?,?)").run(
      "i1",
      "pending",
      1,
    );
    db.prepare("DELETE FROM action_intents WHERE id='i1'").run();
    expect((db.prepare("SELECT count(*) AS n FROM action_transitions").get() as { n: number }).n).toBe(0);
  });

  it("refuses pre-versioning development databases without modifying them", () => {
    const { directory, path } = fixture();
    const legacy = track(new DatabaseSync(path));
    legacy.exec(
      "CREATE TABLE kv(key TEXT PRIMARY KEY, value TEXT NOT NULL); INSERT INTO kv VALUES ('kept','yes')",
    );
    expect(() => openDb(path)).toThrow(/incompatible with Aux v3/);
    expect(version(legacy)).toBe(0);
    expect((legacy.prepare("SELECT value FROM kv").get() as { value: string }).value).toBe("yes");
    expect(legacy.prepare("SELECT name FROM sqlite_schema WHERE name='pages'").get()).toBeUndefined();
    expect(
      readdirSync(directory).filter((name) => name !== "state.sqlite" && !name.startsWith("state.sqlite-")),
    ).toEqual([]);
  });

  it("refuses legacy versioned databases that lack the Aux marker", () => {
    const { path } = fixture();
    const legacy = track(new DatabaseSync(path));
    legacy.exec(
      "PRAGMA user_version=13; CREATE TABLE kv(key TEXT PRIMARY KEY, value TEXT NOT NULL); INSERT INTO kv VALUES ('kept','yes')",
    );
    expect(() => openDb(path)).toThrow(/incompatible with Aux v3/);
    expect(version(legacy)).toBe(13);
    expect((legacy.prepare("SELECT value FROM kv").get() as { value: string }).value).toBe("yes");
  });

  it("refuses newer Aux schemas without modifying them", () => {
    const { directory, path } = fixture();
    const newer = track(openDb(path));
    newer.exec(
      `PRAGMA user_version=${SCHEMA_VERSION + 1}; CREATE TABLE future(value TEXT); INSERT INTO future VALUES ('keep')`,
    );
    expect(() => openDb(path)).toThrow(/incompatible with Aux v3/);
    expect(version(newer)).toBe(SCHEMA_VERSION + 1);
    expect((newer.prepare("SELECT value FROM future").get() as { value: string }).value).toBe("keep");
    expect(
      readdirSync(directory).filter((name) => name !== "state.sqlite" && !name.startsWith("state.sqlite-")),
    ).toEqual([]);
  });

  it("refuses partially-initialized databases even when table names match", () => {
    const { path } = fixture();
    const legacy = track(new DatabaseSync(path));
    // version 0 + existing tables is treated as pre-versioning regardless of shape.
    legacy.exec("CREATE TABLE aux_meta(synthetic TEXT); INSERT INTO aux_meta VALUES ('preserved')");
    legacy.exec("CREATE TABLE kv(key TEXT PRIMARY KEY, value TEXT NOT NULL)");
    expect(() => openDb(path)).toThrow(/incompatible with Aux v3/);
    expect((legacy.prepare("SELECT synthetic FROM aux_meta").get() as { synthetic: string }).synthetic).toBe(
      "preserved",
    );
  });
  it("refuses the old Aux v1 identity without rewriting its bytes", () => {
    const { path } = fixture();
    const legacy = new DatabaseSync(path);
    legacy.exec(`CREATE TABLE aux_meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
      INSERT INTO aux_meta VALUES('schema','aux');
      CREATE TABLE kv(key TEXT PRIMARY KEY,value TEXT NOT NULL);
      INSERT INTO kv VALUES('private','preserved'); PRAGMA user_version=1`);
    legacy.close();
    const before = readFileSync(path);
    expect(() => openDb(path)).toThrow(/incompatible with Aux v3/);
    expect(readFileSync(path)).toEqual(before);
  });

  it("restores deletion settings after a sensitive mutation fails", () => {
    const db = track(openDb(":memory:"));
    expect(() =>
      withSecureDelete(db, () => {
        expect(db.prepare("PRAGMA secure_delete").get()).toEqual({ secure_delete: 1 });
        throw new Error("failed mutation");
      }),
    ).toThrow("failed mutation");
    expect(db.prepare("PRAGMA secure_delete").get()).toEqual({ secure_delete: 0 });
  });
});

it("adds opaque account receipts to an existing development schema4 Profile", () => {
  const { path } = fixture();
  const db = track(openDb(path));
  db.exec("DROP TABLE private_spend");
  db.close();
  const reopened = track(openDb(path));
  expect(version(reopened)).toBe(SCHEMA_VERSION);
  expect(reopened.prepare("SELECT COUNT(*) n FROM private_spend").get()).toEqual({ n: 0 });
});
