import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { openDb, Repo } from "@aux/runtime";
import { compactProtectedSqlite, migrateSensitiveTable, SENSITIVE_SQLITE_COLUMNS, SqliteColumnCipher } from
  "../../apps/runtime/src/store/sqlite-protection.js";

function fixture() {
  const db = openDb(":memory:");
  const saved = new Map<string, string>();
  const secrets = {
    async readSecret(name: string) { return { value: saved.get(name) }; },
    async storeSecret(name: string, value: string) { saved.set(name, value); return { ok: true as const }; },
    async profileStorageRoot() {
      const name = `aux_root_v1_${createHash("sha256").update("profile-one").digest("hex").slice(0, 24)}`;
      if (!saved.has(name)) saved.set(name, randomBytes(32).toString("base64"));
      return { value: saved.get(name)! };
    },
    async profileStorageFactor() {
      const name = `sqlite_factor_v1_${createHash("sha256").update("profile-one").digest("hex").slice(0, 24)}`;
      if (!saved.has(name)) saved.set(name, randomBytes(32).toString("base64"));
      return { value: saved.get(name)! };
    },
  };
  return { db, saved, secrets, close: () => db.close() };
}

it("registers only columns present in the canonical SQLite schema", () => {
  const f = fixture();
  try {
    for (const [table, columns] of Object.entries(SENSITIVE_SQLITE_COLUMNS)) {
      if (!f.db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name=?").get(table)) continue;
      const actual = new Set((f.db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[])
        .map(column => column.name));
      expect(columns.filter(column => !actual.has(column))).toEqual([]);
    }
  } finally { f.close(); }
});

it("migrates a table atomically with stable AAD and refuses tampered or plaintext values", async () => {
  const f = fixture();
  try {
    const cipher = await SqliteColumnCipher.create(f.secrets, "profile-one", false);
    f.db.prepare("INSERT INTO kv(key,value) VALUES(?,?)").run("one", "private amber");
    f.db.prepare("INSERT INTO kv(key,value) VALUES(?,?)").run("two", "private violet");
    expect(migrateSensitiveTable(f.db, cipher, "kv")).toBe(2);
    const first = (f.db.prepare("SELECT value FROM kv WHERE key='one'").get() as { value: string }).value;
    expect(first).not.toContain("amber");
    expect(cipher.decrypt("kv", JSON.stringify(["one"]), "value", first)).toBe("private amber");
    expect(() => cipher.decrypt("kv", JSON.stringify(["two"]), "value", first)).toThrow();
    expect(migrateSensitiveTable(f.db, cipher, "kv")).toBe(0);
    f.db.prepare("UPDATE kv SET value='plain again' WHERE key='one'").run();
    f.db.prepare("UPDATE kv SET value='auxenc:v1:bad' WHERE key='two'").run();
    expect(() => migrateSensitiveTable(f.db, cipher, "kv")).toThrow();
    expect(f.db.prepare("SELECT value FROM kv WHERE key='one'").get()).toMatchObject({ value: "plain again" });
  } finally { f.close(); }
});

it("requires stable primary keys and adapted triggers before converting a table", async () => {
  const f = fixture();
  try {
    const cipher = await SqliteColumnCipher.create(f.secrets, "profile-one", false);
    expect(() => migrateSensitiveTable(f.db, cipher, "history")).toThrow(/primary keys/);
    expect(() => migrateSensitiveTable(f.db, cipher, "bookmark_articles")).toThrow(/primary keys/);
    expect(() => migrateSensitiveTable(f.db, cipher, "history_projection_staging")).toThrow(/primary keys/);
  } finally { f.close(); }
});

it("protects model call metadata across migration, new writes and a new repository", async () => {
  const f = fixture();
  try {
    const legacy = new Repo(f.db);
    legacy.saveModelCall({ callId: "old", runId: "run", role: "agent", modelId: "model",
      providerMetadata: { prompt: "private indigo" }, durationMs: 1, error: "private scarlet", createdAt: 1 });
    const cipher = await SqliteColumnCipher.create(f.secrets, "profile-one", false);
    expect(migrateSensitiveTable(f.db, cipher, "model_calls")).toBe(2);
    const protectedRepo = new Repo(f.db, cipher);
    expect(protectedRepo.listModelCalls("run")[0]).toMatchObject({
      providerMetadata: { prompt: "private indigo" }, error: "private scarlet",
    });
    protectedRepo.saveModelCall({ callId: "new", runId: "run", role: "agent", modelId: "model",
      providerMetadata: { prompt: "private teal" }, durationMs: 1, createdAt: 2 });
    const raw = f.db.prepare("SELECT provider_metadata,error FROM model_calls WHERE call_id='old'").get() as
      { provider_metadata: string; error: string };
    expect(JSON.stringify(raw)).not.toMatch(/indigo|scarlet/);
    const freshCipher = await SqliteColumnCipher.create(f.secrets, "profile-one", true);
    expect(new Repo(f.db, freshCipher).listModelCalls("run")).toHaveLength(2);
    f.db.prepare("UPDATE model_calls SET error='altered' WHERE call_id='old'").run();
    expect(() => protectedRepo.listModelCalls("run")).toThrow(/plaintext/);
  } finally { f.close(); }
});

it("rolls back a failed first migration without marking the table protected", async () => {
  const f = fixture();
  try {
    const cipher = await SqliteColumnCipher.create(f.secrets, "profile-one", false);
    f.db.prepare("INSERT INTO model_calls(call_id,role,model_id,provider_metadata,duration_ms,cost_estimated,error,created_at) VALUES(?,?,?,?,?,?,?,?)")
      .run("a", "agent", "model", "private blue", 1, 0, "private red", 1);
    f.db.prepare("INSERT INTO model_calls(call_id,role,model_id,provider_metadata,duration_ms,cost_estimated,error,created_at) VALUES(?,?,?,?,?,?,?,?)")
      .run("b", "agent", "model", "auxenc:v1:corrupt", 1, 0, null, 2);
    expect(() => migrateSensitiveTable(f.db, cipher, "model_calls")).toThrow();
    expect(f.db.prepare("SELECT provider_metadata FROM model_calls WHERE call_id='a'").get())
      .toMatchObject({ provider_metadata: "private blue" });
    expect(f.db.prepare("SELECT value FROM aux_meta WHERE key='protected_sqlite_v1:model_calls'").get())
      .toBeUndefined();
  } finally { f.close(); }
});

it("opens migrated model calls after an on-disk restart with the same Profile factor", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-protected-sqlite-"));
  const file = join(directory, "state.sqlite");
  const oldBackup = join(directory, "old.sqlite");
  const newBackup = join(directory, "new.sqlite");
  const secrets = fixture();
  let db = openDb(file);
  try {
    const cipher = await SqliteColumnCipher.create(secrets.secrets, "profile-one", false);
    new Repo(db).saveModelCall({ callId: "legacy", runId: "run", role: "agent", modelId: "model",
      durationMs: 1, error: "legacy private error", createdAt: 0 });
    db.prepare("VACUUM INTO ?").run(oldBackup);
    migrateSensitiveTable(db, cipher, "model_calls");
    new Repo(db, cipher).saveModelCall({ callId: "durable", runId: "run", role: "agent", modelId: "model",
      durationMs: 1, error: "durable private error", createdAt: 1 });
    compactProtectedSqlite(db);
    db.prepare("VACUUM INTO ?").run(newBackup);
    expect(readFileSync(oldBackup).includes("legacy private error")).toBe(true);
    expect(readFileSync(newBackup).includes("legacy private error")).toBe(false);
    expect(readFileSync(file).includes("legacy private error")).toBe(false);
    if (existsSync(`${file}-wal`)) expect(readFileSync(`${file}-wal`).includes("legacy private error")).toBe(false);
    db.close();
    db = openDb(file);
    const reopened = await SqliteColumnCipher.create(secrets.secrets, "profile-one", true);
    expect(new Repo(db, reopened).listModelCalls("run").map(call => call.error))
      .toEqual(["legacy private error", "durable private error"]);
    const raw = db.prepare("SELECT error FROM model_calls WHERE call_id='durable'").get() as { error: string };
    expect(raw.error).not.toContain("private error");
  } finally { db.close(); secrets.close(); rmSync(directory, { recursive: true, force: true }); }
});
