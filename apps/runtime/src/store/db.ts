/** Single-writer SQLite storage. Existing incompatible databases are preserved. */
import { chmodSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import schema from "./schema.generated.json" with { type: "json" };

export type Db = DatabaseSync;
export const SCHEMA_VERSION = 10;
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
      if (![2, 3, 4, 5, 6, 7, 8, 9, SCHEMA_VERSION].includes(version)) throw incompatible();
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
      documentSourceTablesForDatabase(db);
      if (version >= 5) documentTablesForDatabase(db);
      if (version >= 6) channelTablesForDatabase(db);
      desktopTablesForDatabase(db);
      googleTablesForDatabase(db);
      if (version < 7 && db.prepare("SELECT 1 FROM sqlite_schema WHERE name='channel_attachments'").get())
        throw incompatible();
      if (version < 6 && db.prepare("SELECT 1 FROM sqlite_schema WHERE name LIKE 'channel_%'").get())
        throw incompatible();
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
      if (version < 6) applySchema(db, [schema.channels, "PRAGMA user_version=6"]);
      if (version < 7) applySchema(db, [schema.channel_attachments, "PRAGMA user_version=7"]);
      if (version < 8) applySchema(db, [schema.desktop_context, "PRAGMA user_version=8"]);
      if (version < 9) applySchema(db, [schema.google, "PRAGMA user_version=9"]);
      if (version < 10) applySchema(db, [schema.document_sources, "PRAGMA user_version=10"]);
    } else {
      applySchema(db, [
        schema.profile,
        schema.run_starts,
        schema.process_logs,
        schema.documents,
        schema.channels,
        schema.channel_attachments,
        schema.desktop_context,
        schema.google,
        schema.document_sources,
        `PRAGMA user_version=${SCHEMA_VERSION}`,
      ]);
    }
    desktopTablesForDatabase(db);
    googleTablesForDatabase(db);
    channelTablesForDatabase(db);
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
  const sourceTables = documentSourceTablesForDatabase(db);
  const tables = ["document_snapshots", "document_segments"];
  const found = tables.filter((table) =>
    db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name=?").get(table),
  );
  if (version < 5) {
    if (found.length) throw new Error("Document tables do not match the historical database schema.");
    return [];
  }
  if (![5, 6, 7, 8, 9, 10].includes(version) || found.length !== tables.length)
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
  return [...tables, ...sourceTables];
}

export function channelTablesForDatabase(db: DatabaseSync): string[] {
  const { user_version: version } = db.prepare("PRAGMA user_version").get() as { user_version: number };
  const expected = {
    channel_connections:
      "connection_id:1,revision:0,workspace_id:0,enabled:0,body:0,created_at:0,updated_at:0",
    channel_peers: "connection_id:1,peer_key:2,body:0",
    channel_threads: "connection_id:1,peer_key:2,thread_key:3,task_id:0,body:0",
    channel_messages:
      "connection_id:1,message_key:2,revision:0,peer_key:0,state:0,run_id:0,body:0,received_at:0",
    channel_outbox:
      "delivery_id:1,connection_id:0,revision:0,peer_key:0,run_id:0,state:0,body:0,created_at:0,updated_at:0",
    channel_cursors: "connection_id:1,revision:0,body:0",
    ...(version >= 7
      ? {
          channel_attachments:
            "connection_id:1,message_key:2,attachment_key:3,state:0,body:0,created_at:0,updated_at:0",
        }
      : {}),
  };
  const tables = Object.keys(expected);
  const found = (
    db.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name LIKE 'channel_%'").all() as {
      name: string;
    }[]
  ).map((row) => row.name);
  if (version < 6) {
    if (found.length) throw new Error("Channel tables do not match the historical database schema.");
    return [];
  }
  if (
    ![6, 7, 8, 9, 10].includes(version) ||
    found.length !== tables.length ||
    found.some((table) => !tables.includes(table))
  )
    throw new Error("The protected channel schema is incomplete.");
  for (const [table, identity] of Object.entries(expected)) {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string; pk: number }[];
    if (columns.map((column) => `${column.name}:${column.pk}`).join(",") !== identity)
      throw new Error("The protected channel row identity is invalid.");
  }
  return tables;
}

/** Snapshot copies may have foreign keys disabled; explicitly retire children before their staging manifest. */
export function discardIncompleteDocumentSnapshots(db: DatabaseSync) {
  if (!documentTablesForDatabase(db).length) return;
  if (documentSourceTablesForDatabase(db).length)
    db.exec(`DELETE FROM document_source_chunks WHERE (owner_kind,owner_id,document_id,snapshot_id) IN
      (SELECT owner_kind,owner_id,document_id,snapshot_id FROM document_snapshots WHERE state='staging')`);
  db.exec(`DELETE FROM document_segments WHERE (owner_kind,owner_id,document_id,snapshot_id) IN
    (SELECT owner_kind,owner_id,document_id,snapshot_id FROM document_snapshots WHERE state='staging');
    DELETE FROM document_snapshots WHERE state='staging'`);
}

/** Validate before migration so partial or unknown desktop tables never mutate an old DB. */
export function desktopTablesForDatabase(db: DatabaseSync): string[] {
  const { user_version: version } = db.prepare("PRAGMA user_version").get() as { user_version: number };
  const expected = {
    desktop_context_generations: "workspace_id:1,app_key:2,generation:0,key_name:0",
    desktop_context_captures:
      "workspace_id:1,capture_id:2,app_key:0,generation:0,captured_at:0,expires_at:0,content:0",
    desktop_context_retired_keys: "key_name:1",
  };
  const found = (
    db
      .prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name LIKE 'desktop_context_%'")
      .all() as { name: string }[]
  ).map((row) => row.name);
  if (version < 8) {
    if (found.length) throw new Error("Desktop context tables do not match the historical database schema.");
    return [];
  }
  if (
    ![8, 9, 10].includes(version) ||
    found.length !== Object.keys(expected).length ||
    found.some((table) => !Object.hasOwn(expected, table))
  )
    throw new Error("Protected desktop context inventory is incomplete.");
  for (const [table, columns] of Object.entries(expected)) {
    const actual = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string; pk: number }[];
    if (actual.map((column) => `${column.name}:${column.pk}`).join(",") !== columns)
      throw new Error("Protected desktop context row identity differs.");
  }
  return Object.keys(expected);
}

/** A complete protected grant inventory is required before migrating or restoring. */
export function googleTablesForDatabase(db: DatabaseSync): string[] {
  const { user_version: version } = db.prepare("PRAGMA user_version").get() as { user_version: number };
  const found = (
    db.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name LIKE 'google_%'").all() as {
      name: string;
    }[]
  ).map((row) => row.name);
  if (version < 9) {
    if (found.length) throw new Error("Google grant tables do not match the historical database schema.");
    return [];
  }
  if (![9, 10].includes(version) || found.length !== 1 || found[0] !== "google_task_grants")
    throw new Error("Protected Google grant inventory is incomplete.");
  const columns = db.prepare("PRAGMA table_info(google_task_grants)").all() as { name: string; pk: number }[];
  if (
    columns.map((column) => `${column.name}:${column.pk}`).join(",") !==
    "grant_id:1,task_id:0,task_revision:0,connection_id:0,body:0,created_at:0,revoked_at:0"
  )
    throw new Error("Protected Google grant row identity differs.");
  const foreignKeys = db.prepare("PRAGMA foreign_key_list(google_task_grants)").all() as {
    table: string;
    from: string;
    to: string;
    on_delete: string;
  }[];
  if (
    foreignKeys
      .map((key) => `${key.from}:${key.table}:${key.to}:${key.on_delete}`)
      .sort()
      .join(",") !== "connection_id:calendar_connections:connection_id:CASCADE,task_id:tasks:task_id:CASCADE"
  )
    throw new Error("Protected Google grant retirement differs.");
  for (const [index, columns] of [
    ["idx_google_task_grants_task", "task_id,task_revision,revoked_at"],
    ["idx_google_task_grants_connection", "connection_id,revoked_at"],
  ]) {
    const actual = db.prepare(`PRAGMA index_info(${index})`).all() as { name: string }[];
    if (actual.map((column) => column.name).join(",") !== columns)
      throw new Error("Protected Google grant indexes differ.");
  }
  return found;
}

export function documentSourceTablesForDatabase(db: DatabaseSync): string[] {
  const { user_version: version } = db.prepare("PRAGMA user_version").get() as { user_version: number };
  const found = db
    .prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name LIKE 'document_source_%'")
    .all() as { name: string }[];
  if (version < 10) {
    if (found.length) throw new Error("Original document tables do not match the historical schema.");
    return [];
  }
  if (version !== 10 || found.length !== 1 || found[0]?.name !== "document_source_chunks")
    throw new Error("The protected original document schema is incomplete.");
  const columns = db.prepare("PRAGMA table_info(document_source_chunks)").all() as {
    name: string;
    pk: number;
  }[];
  if (
    columns.map((column) => `${column.name}:${column.pk}`).join(",") !==
    "owner_kind:1,owner_id:2,document_id:3,snapshot_id:4,ordinal:5,json:0"
  )
    throw new Error("The protected original document fields are invalid.");
  const links = db.prepare("PRAGMA foreign_key_list(document_source_chunks)").all() as {
    table: string;
    from: string;
    to: string;
    on_delete: string;
  }[];
  if (
    links.length !== 4 ||
    links.some(
      (link) => link.table !== "document_snapshots" || link.from !== link.to || link.on_delete !== "CASCADE",
    )
  )
    throw new Error("The protected original document ownership is invalid.");
  return ["document_source_chunks"];
}
