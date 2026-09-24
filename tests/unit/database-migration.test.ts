import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { applyMigrations, openDb, Repo } from "@aux/runtime";

const directories: string[] = [];
const connections: DatabaseSync[] = [];
function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "aux-migration-"));
  directories.push(directory);
  return { directory, path: join(directory, "state.sqlite") };
}
function track(db: DatabaseSync) { connections.push(db); return db; }
function version(db: DatabaseSync) { return (db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version; }
afterEach(() => {
  for (const db of connections.splice(0)) { try { db.close(); } catch { /* already closed */ } }
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe("schema versioning", () => {
  it("initializes a fresh profile with every table, indexes, and the Aux marker", () => {
    const { directory, path } = fixture();
    const db = track(openDb(path));
    expect(version(db)).toBe(9);
    expect((db.prepare("SELECT value FROM aux_meta WHERE key='schema'").get() as { value: string }).value).toBe("aux");
    const tables = db.prepare("SELECT name FROM sqlite_schema WHERE type='table'").all() as { name: string }[];
    for (const table of [
      "kv", "sessions", "pages", "tabs", "page_sets", "set_members", "runs", "run_messages", "conversations",
      "steps", "results", "observations", "programs", "artifacts", "model_calls", "events",
      "history", "bookmarks", "bookmark_folders", "bookmark_articles", "downloads", "spans", "response_metadata",
      "datasets", "operations", "operation_implementations", "operation_invocations",
      "operation_reconciliations", "action_intents", "action_transitions", "workspaces",
      "tasks", "task_revisions", "task_evidence", "criterion_reviews", "agent_connections",
      "vault_items", "vault_grants", "vault_access", "routines", "routine_revisions", "calendar_connections", "calendar_task_grants",
      "routine_runs", "coordinator_leases", "criterion_verifications", "history_fts", "plugins",
    ]) {
      expect(tables.map(row => row.name)).toContain(table);
    }
    expect(tables.map(row => row.name)).not.toContain("journal_imports");
    for (const index of ["idx_conversations_state_updated", "idx_runs_task", "idx_tasks_workspace", "idx_action_intents_unresolved", "idx_action_intents_task_unresolved", "idx_events_run", "idx_artifacts_run", "idx_respmeta_run"]) {
      expect(db.prepare("SELECT name FROM sqlite_schema WHERE type='index' AND name=?").get(index)).toBeDefined();
    }
    db.prepare("INSERT INTO kv VALUES (?, ?)").run("synthetic", "retained");
    db.close();
    const reopened = track(openDb(path));
    expect((reopened.prepare("SELECT value FROM kv").get() as { value: string }).value).toBe("retained");
    expect(readdirSync(directory).filter(name => !name.startsWith("state.sqlite"))).toEqual([]);
  });

  it("enforces foreign keys on owned child rows and cascades deletes", () => {
    const { path } = fixture();
    const db = track(openDb(path));
    expect(() =>
      db.prepare("INSERT INTO action_transitions(intent_id,status,recorded_at) VALUES(?,?,?)").run("missing", "pending", 1)
    ).toThrow(/FOREIGN KEY/);
    db.prepare("INSERT INTO action_intents(id,idempotency_key,run_id,page_id,document_epoch,status,created_at) VALUES(?,?,?,?,?,?,?)")
      .run("i1", "k1", "run", "page", 1, "pending", 1);
    db.prepare("INSERT INTO action_transitions(intent_id,status,recorded_at) VALUES(?,?,?)").run("i1", "pending", 1);
    db.prepare("DELETE FROM action_intents WHERE id='i1'").run();
    expect((db.prepare("SELECT count(*) AS n FROM action_transitions").get() as { n: number }).n).toBe(0);
  });

  it("refuses pre-versioning development databases without modifying them", () => {
    const { directory, path } = fixture();
    const legacy = track(new DatabaseSync(path));
    legacy.exec("CREATE TABLE kv(key TEXT PRIMARY KEY, value TEXT NOT NULL); INSERT INTO kv VALUES ('kept','yes')");
    expect(() => openDb(path)).toThrow(/pre-versioning development schema/);
    expect(version(legacy)).toBe(0);
    expect((legacy.prepare("SELECT value FROM kv").get() as { value: string }).value).toBe("yes");
    expect(legacy.prepare("SELECT name FROM sqlite_schema WHERE name='pages'").get()).toBeUndefined();
    expect(readdirSync(directory).filter(name => name !== "state.sqlite" && !name.startsWith("state.sqlite-"))).toEqual([]);
  });

  it("refuses legacy versioned databases that lack the Aux marker", () => {
    const { path } = fixture();
    const legacy = track(new DatabaseSync(path));
    legacy.exec("PRAGMA user_version=13; CREATE TABLE kv(key TEXT PRIMARY KEY, value TEXT NOT NULL); INSERT INTO kv VALUES ('kept','yes')");
    expect(() => openDb(path)).toThrow(/incompatible development schema/);
    expect(version(legacy)).toBe(13);
    expect((legacy.prepare("SELECT value FROM kv").get() as { value: string }).value).toBe("yes");
  });

  it("refuses newer Aux schemas without modifying them", () => {
    const { directory, path } = fixture();
    const newer = track(openDb(path));
    newer.exec("PRAGMA user_version=10; CREATE TABLE future(value TEXT); INSERT INTO future VALUES ('keep')");
    expect(() => openDb(path)).toThrow(/schema 10.*newer/);
    expect(version(newer)).toBe(10);
    expect((newer.prepare("SELECT value FROM future").get() as { value: string }).value).toBe("keep");
    expect(readdirSync(directory).filter(name => name !== "state.sqlite" && !name.startsWith("state.sqlite-"))).toEqual([]);
  });

  it("refuses partially-initialized databases even when table names match", () => {
    const { path } = fixture();
    const legacy = track(new DatabaseSync(path));
    // version 0 + existing tables is treated as pre-versioning regardless of shape.
    legacy.exec("CREATE TABLE aux_meta(synthetic TEXT); INSERT INTO aux_meta VALUES ('preserved')");
    legacy.exec("CREATE TABLE kv(key TEXT PRIMARY KEY, value TEXT NOT NULL)");
    expect(() => openDb(path)).toThrow(/pre-versioning/);
    expect((legacy.prepare("SELECT synthetic FROM aux_meta").get() as { synthetic: string }).synthetic).toBe("preserved");
  });

  it("applies future schema steps atomically without losing data", () => {
    const { path } = fixture();
    const db = track(openDb(path));
    new Repo(db).addBookmark("https://kept.test/", "Kept");
    // Simulates a future upgrade path: statements + version stamp commit together.
    applyMigrations(db, ["ALTER TABLE kv ADD COLUMN note TEXT", "PRAGMA user_version = 10"]);
    expect(version(db)).toBe(10);
    expect(new Repo(db).listBookmarks()).toMatchObject([{ url: "https://kept.test/", title: "Kept" }]);
    expect(() => applyMigrations(db, ["THIS IS NOT SQL"])).toThrow();
    expect(version(db)).toBe(10);
  });

  it("upgrades existing v5 profiles with the durable message table", () => {
    const { path } = fixture();
    const old = track(openDb(path));
    old.prepare("INSERT INTO kv(key,value) VALUES(?,?)").run("saved", "kept");
    old.exec("DROP TABLE run_messages; DROP TABLE calendar_task_grants; DROP TABLE calendar_connections; PRAGMA user_version=5");
    old.close();
    const upgraded = track(openDb(path));
    expect(version(upgraded)).toBe(9);
    expect(upgraded.prepare("SELECT name FROM sqlite_schema WHERE name='run_messages'").get()).toBeDefined();
    expect(upgraded.prepare("SELECT name FROM sqlite_schema WHERE name='calendar_connections'").get()).toBeDefined();
    expect(upgraded.prepare("SELECT name FROM sqlite_schema WHERE name='calendar_task_grants'").get()).toBeDefined();
    expect((upgraded.prepare("SELECT value FROM kv WHERE key='saved'").get() as { value: string }).value).toBe("kept");
  });

  it("upgrades v7 profiles with task-scoped Calendar grants", () => {
    const { path } = fixture();
    const old = track(openDb(path));
    old.prepare("INSERT INTO kv(key,value) VALUES(?,?)").run("saved", "kept");
    old.exec("DROP TABLE calendar_task_grants; PRAGMA user_version=7");
    old.close();
    const upgraded = track(openDb(path));
    expect(version(upgraded)).toBe(9);
    expect(upgraded.prepare("SELECT name FROM sqlite_schema WHERE name='calendar_task_grants'").get()).toBeDefined();
    expect((upgraded.prepare("SELECT value FROM kv WHERE key='saved'").get() as { value: string }).value).toBe("kept");
  });

  it("migrates an existing v8 action journal without losing unresolved writes", () => {
    const {path}=fixture();
    const old=track(new DatabaseSync(path));
    old.exec(`PRAGMA user_version=8;
      CREATE TABLE aux_meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
      INSERT INTO aux_meta VALUES('schema','aux');
      CREATE TABLE action_intents(id TEXT PRIMARY KEY,idempotency_key TEXT NOT NULL UNIQUE,run_id TEXT NOT NULL,page_id TEXT NOT NULL,document_epoch INTEGER NOT NULL,status TEXT NOT NULL,created_at INTEGER NOT NULL,evidence TEXT);
      INSERT INTO action_intents VALUES('i1','k1','r1','p1',1,'uncertain',100,NULL);`);
    old.close();
    const upgraded=track(openDb(path));
    expect(version(upgraded)).toBe(9);
    expect(upgraded.prepare("SELECT task_id,task_revision,status FROM action_intents WHERE id='i1'").get()).toMatchObject({task_id:null,task_revision:null,status:'uncertain'});
    expect(upgraded.prepare("SELECT name FROM sqlite_schema WHERE name='idx_action_intents_task_unresolved'").get()).toBeDefined();
  });

  it("migrates v1 databases to v2 and backfills the history index", () => {
    const { path } = fixture();
    // Minimal v1-shaped database: marker + history + bookmarks rows, no FTS objects.
    const legacy = new DatabaseSync(path);
    legacy.exec(`
      PRAGMA user_version = 1;
      CREATE TABLE aux_meta(key TEXT PRIMARY KEY, value TEXT NOT NULL);
      INSERT INTO aux_meta(key,value) VALUES('schema','aux');
      CREATE TABLE history(url TEXT NOT NULL, title TEXT NOT NULL DEFAULT '', page_id TEXT, visited_at REAL NOT NULL, PRIMARY KEY(url, visited_at));
      CREATE TABLE bookmarks(url TEXT PRIMARY KEY, title TEXT NOT NULL, created_at REAL NOT NULL, folder_path TEXT NOT NULL DEFAULT '[]');
      INSERT INTO history(url,title,visited_at) VALUES('https://kept.example/','Kept Page',1000),('https://other.example/','Other',999);
      INSERT INTO bookmarks(url,title,created_at) VALUES('https://saved.example/','Saved Page',1000);
    `);
    legacy.close();
    const db = track(openDb(path));
    expect(version(db)).toBe(9);
    expect(db.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name='plugins'").get()).toBeDefined();
    const repo = new Repo(db);
    expect(repo.listHistory()).toHaveLength(2);
    expect(repo.listHistory("kept")).toMatchObject([{ url: "https://kept.example/", title: "Kept Page" }]);
    // The triggers live: writes after migration stay indexed.
    repo.addHistory("https://fresh.example/", "Fresh Title");
    expect(repo.listHistory("fresh")).toMatchObject([{ url: "https://fresh.example/" }]);
    // The v3 columns arrive on migrated rows as plain bookmarks.
    expect(repo.listBookmarks()).toMatchObject([{ url: "https://saved.example/", title: "Saved Page" }]);
  });
});
