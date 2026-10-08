/** Single-writer SQLite storage. Existing incompatible databases are preserved. */
import { chmodSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import schema from "./schema.generated.json" with { type: "json" };

export type Db = DatabaseSync;
export const SCHEMA_VERSION = 3;
const SCHEMA_IDENTITY = "aux-v3";

/** Apply a fresh schema atomically, preserving the database on failure. */
export function applySchema(db: DatabaseSync, statements: readonly string[]): void {
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const statement of statements) db.exec(statement);
    db.exec("COMMIT");
  } catch (error) {
    if (db.isTransaction) db.exec("ROLLBACK");
    throw error;
  }
}

export function openDb(path: string): DatabaseSync {
  const db = new DatabaseSync(path);
  try {
    db.exec("PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON");
    const version = (db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version;
    const { count } = db
      .prepare("SELECT count(*) AS count FROM sqlite_schema WHERE name NOT LIKE 'sqlite_%'")
      .get() as { count: number };
    if (count > 0 || version !== 0) {
      const incompatible = () =>
        new Error(
          `This database is incompatible with Aux v3 schema ${SCHEMA_VERSION}. The file was preserved unchanged; choose a fresh AUX_DATA_DIR.`,
        );
      if (version !== 2 && version !== SCHEMA_VERSION) throw incompatible();
      const hasMarker = Boolean(
        db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name='aux_meta'").get(),
      );
      if (!hasMarker) throw incompatible();
      let identity: string | undefined;
      try {
        identity = (
          db.prepare("SELECT value FROM aux_meta WHERE key='schema'").get() as { value: string } | undefined
        )?.value;
      } catch {
        throw incompatible();
      }
      if (identity !== SCHEMA_IDENTITY) throw incompatible();
      if (version === 2) applySchema(db, [schema.run_starts, `PRAGMA user_version=${SCHEMA_VERSION}`]);
    } else {
      applySchema(db, [schema.profile, schema.run_starts, `PRAGMA user_version=${SCHEMA_VERSION}`]);
    }
    if (path !== ":memory:") chmodSync(path, 0o600);
    db.exec("PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL; PRAGMA secure_delete=OFF");
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

/** Batch optional writes without opening a nested transaction. WAL stays NORMAL. */
export function commitRelaxed(db: DatabaseSync, fn: () => void): boolean {
  if (db.isTransaction) return false;
  db.exec("BEGIN");
  try {
    fn();
    db.exec("COMMIT");
  } catch (error) {
    if (db.isTransaction) db.exec("ROLLBACK");
    throw error;
  }
  return true;
}

/** SQLite's deletion pragma is connection-wide; scope it to sensitive mutations. */
export function withSecureDelete<T>(db: DatabaseSync, work: () => T): T {
  const previous = (db.prepare("PRAGMA secure_delete").get() as { secure_delete: number }).secure_delete;
  db.exec("PRAGMA secure_delete=ON");
  try {
    return work();
  } finally {
    db.exec(`PRAGMA secure_delete=${previous}`);
  }
}

export function kvGet(db: DatabaseSync, key: string): string | undefined {
  const row = db.prepare("SELECT value FROM kv WHERE key=?").get(key) as { value: string } | undefined;
  return row?.value;
}
export function kvSet(db: DatabaseSync, key: string, value: string): void {
  db.prepare("INSERT INTO kv(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(
    key,
    value,
  );
}
export function kvGetJson<T>(db: DatabaseSync, key: string): T | undefined {
  const v = kvGet(db, key);
  return v === undefined ? undefined : (JSON.parse(v) as T);
}
export function kvSetJson(db: DatabaseSync, key: string, value: unknown): void {
  kvSet(db, key, JSON.stringify(value));
}
