/** Single-writer SQLite storage. Existing incompatible databases are preserved. */
import { chmodSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import schema from "./schema.generated.json" with { type: "json" };

export type Db = DatabaseSync;
export const SCHEMA_VERSION = 5;
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
      if (![2, 3, 4, SCHEMA_VERSION].includes(version)) throw incompatible();
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
      if (
        version < 5 &&
        db
          .prepare("SELECT 1 FROM sqlite_schema WHERE name IN ('document_snapshots','document_segments')")
          .get()
      )
        throw incompatible();
      if (version < 4) {
        if (db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name='coding_process_logs'").get())
          throw incompatible();
        const statements = [
          schema.process_logs,
          "INSERT INTO aux_meta(key,value) VALUES('coding_process_logs_migration','0')",
        ];
        if (version === 2) {
          if (
            db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name='run_start_receipts'").get()
          )
            throw incompatible();
          statements.unshift(schema.run_starts);
        }
        applySchema(db, [...statements, "PRAGMA user_version=4"]);
      }
      if (version < 5) {
        applySchema(db, [schema.documents, "PRAGMA user_version=5"]);
      }
    } else {
      applySchema(db, [
        schema.profile,
        schema.run_starts,
        schema.process_logs,
        schema.documents,
        `PRAGMA user_version=${SCHEMA_VERSION}`,
      ]);
    }
    if (!financialTablesForDatabase(db).length) applySchema(db, [schema.private_spend]);
    if (path !== ":memory:") chmodSync(path, 0o600);
    db.exec("PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL; PRAGMA secure_delete=OFF");
    // A prior process never published these imports; no plaintext needs to be read to retire them.
    discardIncompleteDocumentSnapshots(db);
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

/** Opaque account totals travel with backups; no private content is present in this public financial table. */
export function financialTablesForDatabase(db: DatabaseSync): string[] {
  if (!db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name='private_spend'").get()) return [];
  const columns = db.prepare("PRAGMA table_info(private_spend)").all() as { name: string }[];
  if (
    columns
      .map((column) => column.name)
      .sort()
      .join(",") !== "cost_estimated,cost_usd,created_at,kind,lease_id,reserved_usd,state"
  )
    throw new Error("The opaque account budget schema is invalid.");
  return ["private_spend"];
}

export function documentTablesForDatabase(db: DatabaseSync): string[] {
  const { user_version: version } = db.prepare("PRAGMA user_version").get() as { user_version: number };
  const tables = ["document_snapshots", "document_segments"];
  const found = tables.filter((table) =>
    db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name=?").get(table),
  );
  if (version < 5) {
    if (found.length) throw new Error("Document tables do not match the historical database schema.");
    return [];
  }
  if (version !== 5 || found.length !== tables.length)
    throw new Error("The protected document schema is incomplete.");
  const expected = [
    "owner_kind:1,owner_id:2,document_id:3,snapshot_id:4,state:0,manifest:0",
    "owner_kind:1,owner_id:2,document_id:3,snapshot_id:4,ordinal:5,json:0",
  ];
  for (const [index, table] of tables.entries()) {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string; pk: number }[];
    if (columns.map((column) => `${column.name}:${column.pk}`).join(",") !== expected[index])
      throw new Error("The protected document row identity is invalid.");
  }
  return tables;
}

/** Snapshot copies may have foreign keys disabled; explicitly retire children before their staging manifest. */
export function discardIncompleteDocumentSnapshots(db: DatabaseSync) {
  if (!documentTablesForDatabase(db).length) return;
  db.exec(`DELETE FROM document_segments WHERE (owner_kind,owner_id,document_id,snapshot_id) IN
    (SELECT owner_kind,owner_id,document_id,snapshot_id FROM document_snapshots WHERE state='staging');
    DELETE FROM document_snapshots WHERE state='staging'`);
}
