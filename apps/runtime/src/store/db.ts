/**
 * Single-writer SQLite store on node:sqlite (Node 22+ built-in).
 * The runtime process is the only writer. The desktop main process also
 * opens a short-lived read-only connection for human history suggestions;
 * renderer and external clients cannot open the database directly.
 */
import { chmodSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { sanitizeOperationInputSamples } from "@aux/contracts/operation-input-stats";

/** Lookups by run/page that previously scanned their tables (schema v5). */
const HOT_PATH_INDEXES = [
  "CREATE INDEX IF NOT EXISTS idx_datasets_page ON datasets(page_id)",
  "CREATE INDEX IF NOT EXISTS idx_artifacts_run ON artifacts(run_id)",
  "CREATE INDEX IF NOT EXISTS idx_artifacts_page ON artifacts(page_id)",
  "CREATE INDEX IF NOT EXISTS idx_model_calls_run ON model_calls(run_id)",
  "CREATE INDEX IF NOT EXISTS idx_events_run ON events(run_id, seq)",
  "CREATE INDEX IF NOT EXISTS idx_invocations_request ON operation_invocations(request_key, operation_id)",
  "CREATE INDEX IF NOT EXISTS idx_respmeta_run ON response_metadata(run_id)",
];

/**
 * Canonical schema for new Aux profiles. Declared as one unit with explicit
 * foreign keys; created atomically for a fresh database. Pre-versioning
 * development databases are incompatible and preserved untouched — openDb
 * refuses them with a recoverable message rather than resetting data.
 */
const SCHEMA = `
CREATE TABLE aux_meta(key TEXT PRIMARY KEY, value TEXT NOT NULL);
INSERT INTO aux_meta(key,value) VALUES('schema','aux');
CREATE TABLE kv(key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE sessions(
  session_id TEXT PRIMARY KEY, backend TEXT NOT NULL, label TEXT NOT NULL,
  status TEXT NOT NULL, detail TEXT, updated_at REAL NOT NULL);
CREATE TABLE pages(
  page_id TEXT PRIMARY KEY, backend TEXT NOT NULL, target_id TEXT NOT NULL,
  session_id TEXT, url TEXT NOT NULL, title TEXT NOT NULL DEFAULT '',
  favicon TEXT, epoch INTEGER NOT NULL DEFAULT 0, revision INTEGER NOT NULL DEFAULT 0,
  view_status TEXT NOT NULL DEFAULT 'hidden', controller TEXT NOT NULL DEFAULT 'none',
  owned INTEGER NOT NULL DEFAULT 0, created_at REAL NOT NULL, active_at REAL NOT NULL,
  detached INTEGER NOT NULL DEFAULT 0, json TEXT NOT NULL DEFAULT '{}');
CREATE TABLE tabs(
  page_id TEXT PRIMARY KEY REFERENCES pages(page_id), ordinal INTEGER NOT NULL, url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '', backend TEXT NOT NULL DEFAULT 'aux', active INTEGER NOT NULL DEFAULT 0,
  window_id TEXT NOT NULL DEFAULT 'main');
CREATE TABLE page_sets(
  set_id TEXT PRIMARY KEY, name TEXT NOT NULL, source TEXT NOT NULL,
  member_ids TEXT NOT NULL DEFAULT '[]', result_schema TEXT, program_id TEXT REFERENCES programs(program_id) ON DELETE SET NULL, created_at REAL NOT NULL);
CREATE TABLE set_members(
  member_id TEXT PRIMARY KEY, set_id TEXT NOT NULL REFERENCES page_sets(set_id), ordinal INTEGER NOT NULL,
  url TEXT, record_key TEXT, label TEXT, page_id TEXT, status TEXT NOT NULL DEFAULT 'queued',
  result_id TEXT REFERENCES results(result_id) ON DELETE SET NULL, error TEXT);
CREATE INDEX idx_members_set ON set_members(set_id, ordinal);
CREATE TABLE runs(
  run_id TEXT PRIMARY KEY, goal TEXT NOT NULL, status TEXT NOT NULL,
  page_ids TEXT NOT NULL DEFAULT '[]', set_id TEXT REFERENCES page_sets(set_id), config TEXT, status_message TEXT,
  result TEXT, error TEXT, failure TEXT, started_at REAL, ended_at REAL, created_at REAL NOT NULL);
CREATE TABLE run_messages(
  message_id TEXT PRIMARY KEY, chat_id TEXT NOT NULL,
  target_run_id TEXT NOT NULL REFERENCES runs(run_id) ON DELETE CASCADE,
  delivery_run_id TEXT NOT NULL UNIQUE,
  mode TEXT NOT NULL CHECK(mode IN ('queue','steer')),
  status TEXT NOT NULL CHECK(status IN ('accepted','delivering','delivered','needs_attention','cancelled')),
  text TEXT NOT NULL, page_ids TEXT NOT NULL DEFAULT '[]', context_page_refs TEXT NOT NULL DEFAULT '[]',
  expected_revision INTEGER NOT NULL DEFAULT 0,
  error TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE INDEX idx_run_messages_chat ON run_messages(chat_id,created_at,message_id);
CREATE INDEX idx_run_messages_status ON run_messages(status,created_at,message_id);
CREATE TABLE conversations(
  chat_id TEXT PRIMARY KEY, title TEXT NOT NULL, archived INTEGER NOT NULL DEFAULT 0,
  created_at REAL NOT NULL, updated_at REAL NOT NULL);
CREATE INDEX idx_conversations_state_updated ON conversations(archived, updated_at DESC);
CREATE TABLE steps(
  step_id TEXT PRIMARY KEY, run_id TEXT NOT NULL, page_id TEXT,
  op TEXT NOT NULL, inputs TEXT, expected TEXT, outcome TEXT, started_at REAL NOT NULL);
CREATE INDEX idx_steps_run ON steps(run_id, started_at);
CREATE TABLE results(
  result_id TEXT PRIMARY KEY, run_id TEXT, member_id TEXT REFERENCES set_members(member_id),
  page_id TEXT, source_url TEXT NOT NULL, values_json TEXT NOT NULL, evidence TEXT,
  observed_at REAL NOT NULL, status TEXT NOT NULL, error TEXT);
CREATE INDEX idx_results_member ON results(member_id);
CREATE INDEX idx_results_run ON results(run_id);
CREATE TABLE content_memory(
  memory_id TEXT PRIMARY KEY, profile_id TEXT NOT NULL, workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id) ON DELETE CASCADE,
  source_key TEXT NOT NULL, origin TEXT NOT NULL, captured_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
  ciphertext TEXT NOT NULL, UNIQUE(profile_id,workspace_id,source_key));
CREATE INDEX idx_content_memory_workspace ON content_memory(profile_id,workspace_id,captured_at DESC);
CREATE INDEX idx_content_memory_expiry ON content_memory(expires_at);
CREATE TABLE programs(
  program_id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, version INTEGER NOT NULL DEFAULT 1,
  site_key TEXT NOT NULL, parameters TEXT NOT NULL DEFAULT '[]', steps_json TEXT NOT NULL,
  preconditions TEXT, postconditions TEXT, use_count INTEGER NOT NULL DEFAULT 0,
  last_used_at REAL, created_at REAL NOT NULL);
CREATE TABLE artifacts(
  artifact_id TEXT PRIMARY KEY, run_id TEXT, page_id TEXT,
  path TEXT NOT NULL, media_type TEXT NOT NULL, size INTEGER NOT NULL, status TEXT NOT NULL, created_at REAL NOT NULL);
CREATE TABLE result_versions(
  artifact_id TEXT PRIMARY KEY REFERENCES artifacts(artifact_id) ON DELETE CASCADE,
  root_artifact_id TEXT NOT NULL, parent_artifact_id TEXT NOT NULL,
  chat_id TEXT NOT NULL, revision INTEGER NOT NULL, created_at REAL NOT NULL,
  UNIQUE(root_artifact_id,revision));
CREATE INDEX idx_result_versions_chat ON result_versions(chat_id,created_at DESC);
CREATE TABLE model_calls(
  call_id TEXT PRIMARY KEY, run_id TEXT, role TEXT NOT NULL, model_id TEXT NOT NULL,
  provider_metadata TEXT, duration_ms REAL NOT NULL, input_tokens REAL, output_tokens REAL,
  cost_usd REAL, cost_estimated INTEGER, error TEXT, created_at REAL NOT NULL);
CREATE TABLE events(
  seq INTEGER PRIMARY KEY AUTOINCREMENT, run_id TEXT, type TEXT NOT NULL,
  payload TEXT NOT NULL, ts REAL NOT NULL);
CREATE INDEX idx_events_ts ON events(ts);
CREATE TABLE history(
  url TEXT NOT NULL, title TEXT NOT NULL DEFAULT '', page_id TEXT, visited_at REAL NOT NULL,
  PRIMARY KEY(url, visited_at));
CREATE INDEX idx_history_recent ON history(visited_at DESC, url DESC);
CREATE TABLE bookmarks(
  url TEXT PRIMARY KEY, title TEXT NOT NULL, created_at REAL NOT NULL,
  folder_path TEXT NOT NULL DEFAULT '[]',
  reading_list INTEGER NOT NULL DEFAULT 0, read_at REAL);
-- Reading-list offline copies: the extracted article JSON, keyed by the owning bookmark.
CREATE TABLE bookmark_articles(
  url TEXT PRIMARY KEY, json TEXT NOT NULL, saved_at REAL NOT NULL);
CREATE TABLE bookmark_folders(path TEXT PRIMARY KEY);
CREATE TABLE downloads(
  id TEXT PRIMARY KEY, page_id TEXT, filename TEXT, path TEXT, state TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0, total_bytes INTEGER, started_at REAL NOT NULL, ended_at REAL);
CREATE TABLE spans(
  span_id TEXT PRIMARY KEY, parent_id TEXT, name TEXT NOT NULL,
  run_id TEXT, page_id TEXT,
  started_at REAL NOT NULL, ended_at REAL, duration_ms REAL, outcome TEXT, attrs TEXT NOT NULL DEFAULT '{}');
CREATE INDEX idx_spans_run ON spans(run_id, started_at);
CREATE TABLE response_metadata(
  request_id TEXT PRIMARY KEY, page_id TEXT NOT NULL, url TEXT NOT NULL, method TEXT NOT NULL,
  status INTEGER, content_type TEXT, started_at REAL NOT NULL, ended_at REAL, duration_ms REAL,
  body_artifact_id TEXT, body_bytes INTEGER,
  truncated INTEGER NOT NULL DEFAULT 0, run_id TEXT);
CREATE INDEX idx_respmeta_page ON response_metadata(page_id, started_at);
CREATE TABLE datasets(
  dataset_id TEXT PRIMARY KEY, run_id TEXT, page_id TEXT,
  source TEXT NOT NULL, schema_json TEXT NOT NULL DEFAULT '[]', row_count INTEGER NOT NULL DEFAULT 0,
  values_json TEXT NOT NULL DEFAULT '[]', provenance TEXT, created_at REAL NOT NULL,
  stale INTEGER NOT NULL DEFAULT 0);
CREATE TABLE operations(
  operation_id TEXT PRIMARY KEY, site_key TEXT NOT NULL, name TEXT NOT NULL,
  description TEXT, input_schema TEXT NOT NULL DEFAULT '{}', output_schema TEXT NOT NULL DEFAULT '{}',
  effect_class TEXT NOT NULL DEFAULT 'read', guards TEXT NOT NULL DEFAULT '{}',
  created_at REAL NOT NULL, updated_at REAL NOT NULL,
  UNIQUE(site_key, name));
CREATE TABLE operation_implementations(
  impl_id TEXT PRIMARY KEY, operation_id TEXT NOT NULL REFERENCES operations(operation_id), kind TEXT NOT NULL,
  executable TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'candidate',
  evidence TEXT NOT NULL DEFAULT '[]', stats TEXT NOT NULL DEFAULT '{}',
  created_at REAL NOT NULL, updated_at REAL NOT NULL);
CREATE INDEX idx_impl_op ON operation_implementations(operation_id, state);
CREATE TABLE operation_invocations(
  invocation_id TEXT PRIMARY KEY, operation_id TEXT NOT NULL REFERENCES operations(operation_id) ON DELETE CASCADE,
  impl_id TEXT REFERENCES operation_implementations(impl_id) ON DELETE SET NULL,
  run_id TEXT, request_key TEXT, inputs TEXT NOT NULL DEFAULT '{}', status TEXT NOT NULL,
  effect_outcome TEXT NOT NULL DEFAULT 'unknown', route_reason TEXT,
  started_at REAL NOT NULL, ended_at REAL, error TEXT);
CREATE TABLE operation_reconciliations(
  invocation_id TEXT PRIMARY KEY REFERENCES operation_invocations(invocation_id) ON DELETE CASCADE,
  task_id TEXT NOT NULL, task_revision INTEGER NOT NULL,
  outcome TEXT NOT NULL CHECK(outcome IN ('applied','not_applied')), evidence_id TEXT NOT NULL,
  note TEXT NOT NULL, recorded_at INTEGER NOT NULL);
CREATE TABLE action_intents(
  id TEXT PRIMARY KEY, idempotency_key TEXT NOT NULL UNIQUE,
  run_id TEXT NOT NULL, page_id TEXT NOT NULL, document_epoch INTEGER NOT NULL,
  task_id TEXT, task_revision INTEGER,
  status TEXT NOT NULL CHECK(status IN ('pending','confirmed','uncertain','not_applied')),
  created_at INTEGER NOT NULL, evidence TEXT);
CREATE INDEX idx_action_intents_unresolved ON action_intents(run_id, page_id, status);
CREATE INDEX idx_action_intents_task_unresolved ON action_intents(task_id,task_revision,status);
CREATE TABLE action_transitions(
  seq INTEGER PRIMARY KEY AUTOINCREMENT, intent_id TEXT NOT NULL REFERENCES action_intents(id) ON DELETE CASCADE,
  status TEXT NOT NULL, recorded_at INTEGER NOT NULL, evidence TEXT);
CREATE TABLE workspaces(workspace_id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE tasks(task_id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id), revision INTEGER NOT NULL,
  state TEXT NOT NULL CHECK(state IN ('open','archived')), updated_at INTEGER NOT NULL, json TEXT NOT NULL);
CREATE INDEX idx_tasks_workspace ON tasks(workspace_id,state,updated_at);
CREATE TABLE task_revisions(task_id TEXT NOT NULL REFERENCES tasks(task_id), revision INTEGER NOT NULL, json TEXT NOT NULL,
  PRIMARY KEY(task_id,revision));
CREATE INDEX idx_runs_task ON runs(json_extract(config,'$.taskId'));
CREATE TABLE task_evidence(seq INTEGER PRIMARY KEY AUTOINCREMENT, evidence_id TEXT NOT NULL UNIQUE,
  task_id TEXT NOT NULL REFERENCES tasks(task_id), task_revision INTEGER NOT NULL, criterion_id TEXT NOT NULL, json TEXT NOT NULL);
CREATE INDEX idx_task_evidence ON task_evidence(task_id,task_revision,criterion_id,seq);
CREATE TABLE criterion_reviews(seq INTEGER PRIMARY KEY AUTOINCREMENT, review_id TEXT NOT NULL UNIQUE,
  task_id TEXT NOT NULL REFERENCES tasks(task_id), task_revision INTEGER NOT NULL, criterion_id TEXT NOT NULL, json TEXT NOT NULL);
CREATE INDEX idx_criterion_reviews ON criterion_reviews(task_id,task_revision,criterion_id,seq);
CREATE TABLE agent_connections(
  connection_id TEXT PRIMARY KEY, name TEXT NOT NULL, client TEXT NOT NULL,
  scope_kind TEXT NOT NULL CHECK(scope_kind IN ('workspace','task')),
  workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id), task_id TEXT REFERENCES tasks(task_id), token_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL, last_used_at INTEGER, revoked_at INTEGER,
  CHECK((scope_kind='workspace' AND task_id IS NULL) OR (scope_kind='task' AND task_id IS NOT NULL))
);
CREATE INDEX idx_agent_connections_scope ON agent_connections(workspace_id,task_id,revoked_at);
CREATE TABLE calendar_connections(
  connection_id TEXT PRIMARY KEY, provider TEXT NOT NULL CHECK(provider='google'),
  account_key TEXT NOT NULL, label TEXT NOT NULL, secret_name TEXT NOT NULL UNIQUE,
  scopes TEXT NOT NULL, state TEXT NOT NULL CHECK(state IN ('active','needs_reauth')),
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, revoked_at INTEGER);
CREATE UNIQUE INDEX idx_calendar_account_active ON calendar_connections(provider,account_key) WHERE revoked_at IS NULL;
CREATE TABLE calendar_task_grants(
  grant_id TEXT PRIMARY KEY, task_id TEXT NOT NULL REFERENCES tasks(task_id),
  task_revision INTEGER NOT NULL, connection_id TEXT NOT NULL REFERENCES calendar_connections(connection_id),
  created_at INTEGER NOT NULL, revoked_at INTEGER);
CREATE UNIQUE INDEX idx_calendar_task_grant_active ON calendar_task_grants(task_id,task_revision,connection_id) WHERE revoked_at IS NULL;
CREATE TABLE vault_items(
  item_id TEXT PRIMARY KEY, label TEXT NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('password','secret')),
  username TEXT, account_label TEXT, origin TEXT NOT NULL,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, revoked_at INTEGER, expires_at INTEGER);
CREATE TABLE vault_grants(
  grant_id TEXT PRIMARY KEY, item_id TEXT NOT NULL REFERENCES vault_items(item_id), credential_ref TEXT NOT NULL UNIQUE,
  task_id TEXT REFERENCES tasks(task_id), workspace_id TEXT REFERENCES workspaces(workspace_id), origin TEXT NOT NULL, account_label TEXT,
  created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, revoked_at INTEGER,
  last_used_at INTEGER, use_count INTEGER NOT NULL DEFAULT 0);
CREATE INDEX idx_vault_grants_item ON vault_grants(item_id,revoked_at);
CREATE TABLE vault_access(
  seq INTEGER PRIMARY KEY AUTOINCREMENT, item_id TEXT REFERENCES vault_items(item_id),
  grant_id TEXT REFERENCES vault_grants(grant_id), action TEXT NOT NULL,
  actor TEXT NOT NULL, task_id TEXT, origin TEXT, detail TEXT, recorded_at INTEGER NOT NULL);
CREATE INDEX idx_vault_access_item ON vault_access(item_id,seq);
CREATE TABLE routines(
  routine_id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id), revision INTEGER NOT NULL,
  paused INTEGER NOT NULL DEFAULT 0, archived_at INTEGER, updated_at INTEGER NOT NULL, json TEXT NOT NULL);
CREATE INDEX idx_routines_workspace ON routines(workspace_id,archived_at,updated_at);
CREATE TABLE routine_revisions(routine_id TEXT NOT NULL REFERENCES routines(routine_id), revision INTEGER NOT NULL, json TEXT NOT NULL,
  PRIMARY KEY(routine_id,revision));
CREATE TABLE routine_runs(
  routine_run_id TEXT PRIMARY KEY, routine_id TEXT NOT NULL REFERENCES routines(routine_id), revision INTEGER NOT NULL,
  occurrence_id TEXT, occurrence_identity TEXT, status TEXT NOT NULL,
  reason TEXT, chat_id TEXT, run_id TEXT, parameters TEXT NOT NULL DEFAULT '{}',
  started_at INTEGER, ended_at INTEGER, created_at INTEGER NOT NULL);
CREATE UNIQUE INDEX idx_routine_occurrence ON routine_runs(occurrence_identity) WHERE occurrence_identity IS NOT NULL;
CREATE INDEX idx_routine_runs ON routine_runs(routine_id,created_at);
CREATE TABLE coordinator_leases(
  lease_key TEXT PRIMARY KEY, owner_id TEXT NOT NULL, acquired_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL, generation INTEGER NOT NULL DEFAULT 1, fenced INTEGER NOT NULL DEFAULT 0);
CREATE TABLE criterion_verifications(
  verification_id TEXT PRIMARY KEY, task_id TEXT NOT NULL REFERENCES tasks(task_id), task_revision INTEGER NOT NULL,
  criterion_id TEXT NOT NULL, json TEXT NOT NULL, recorded_at INTEGER NOT NULL);
CREATE INDEX idx_criterion_verifications ON criterion_verifications(task_id,task_revision,criterion_id,recorded_at);
-- Omnibox deep-history search: FTS5 external-content index over history,
-- kept in sync by triggers so repo writes need no index bookkeeping.
CREATE VIRTUAL TABLE history_fts USING fts5(url, title, content='history', content_rowid='rowid');
CREATE TRIGGER history_fts_ai AFTER INSERT ON history BEGIN
  INSERT INTO history_fts(rowid,url,title) VALUES(new.rowid,new.url,new.title);
END;
CREATE TRIGGER history_fts_ad AFTER DELETE ON history BEGIN
  INSERT INTO history_fts(history_fts,rowid,url,title) VALUES('delete',old.rowid,old.url,old.title);
END;
CREATE TRIGGER history_fts_au AFTER UPDATE ON history BEGIN
  INSERT INTO history_fts(history_fts,rowid,url,title) VALUES('delete',old.rowid,old.url,old.title);
  INSERT INTO history_fts(rowid,url,title) VALUES(new.rowid,new.url,new.title);
END;
CREATE TABLE plugins(
  plugin_id TEXT PRIMARY KEY, name TEXT NOT NULL, version TEXT, description TEXT,
  workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id),
  routine_ids TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL, uninstalled_at INTEGER);
CREATE INDEX idx_plugins_workspace ON plugins(workspace_id,uninstalled_at);
${HOT_PATH_INDEXES.join(";\n")};
`;

export type Db = DatabaseSync;
export const SCHEMA_VERSION = 12;

/**
 * Statements that upgrade a database from user_version N to N+1.
 */
const MIGRATIONS: Record<number, string[] | ((db: DatabaseSync) => string[])> = {
  // v1 → v2: history full-text index, populated from existing rows.
  1: [
    `CREATE VIRTUAL TABLE history_fts USING fts5(url, title, content='history', content_rowid='rowid')`,
    `INSERT INTO history_fts(history_fts) VALUES('rebuild')`,
    `CREATE TRIGGER history_fts_ai AFTER INSERT ON history BEGIN
       INSERT INTO history_fts(rowid,url,title) VALUES(new.rowid,new.url,new.title);
     END`,
    `CREATE TRIGGER history_fts_ad AFTER DELETE ON history BEGIN
       INSERT INTO history_fts(history_fts,rowid,url,title) VALUES('delete',old.rowid,old.url,old.title);
     END`,
    `CREATE TRIGGER history_fts_au AFTER UPDATE ON history BEGIN
       INSERT INTO history_fts(history_fts,rowid,url,title) VALUES('delete',old.rowid,old.url,old.title);
       INSERT INTO history_fts(rowid,url,title) VALUES(new.rowid,new.url,new.title);
     END`,
  ],
  // v2 → v3: reading-list bookmark subtype + offline article copies.
  2: [
    `ALTER TABLE bookmarks ADD COLUMN reading_list INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE bookmarks ADD COLUMN read_at REAL`,
    `CREATE TABLE bookmark_articles(
       url TEXT PRIMARY KEY, json TEXT NOT NULL, saved_at REAL NOT NULL)`,
  ],
  // v3 → v4: thin plugins — installed capability bundles and the routines each created.
  3: [
    `CREATE TABLE plugins(
       plugin_id TEXT PRIMARY KEY, name TEXT NOT NULL, version TEXT, description TEXT,
       workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id),
       routine_ids TEXT NOT NULL DEFAULT '[]',
       created_at INTEGER NOT NULL, uninstalled_at INTEGER)`,
    `CREATE INDEX idx_plugins_workspace ON plugins(workspace_id,uninstalled_at)`,
  ],
  // v4 → v5: indexes for per-run/per-page lookups and retention deletes.
  4: (db) =>
    HOT_PATH_INDEXES.filter((sql) => db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name=?").get(/ ON (\w+)\(/.exec(sql)![1]!)),
  // v5 → v6: ordered, crash-recoverable conversation messages.
  5: [
    `CREATE TABLE run_messages(
      message_id TEXT PRIMARY KEY, chat_id TEXT NOT NULL,
      target_run_id TEXT NOT NULL REFERENCES runs(run_id) ON DELETE CASCADE,
      delivery_run_id TEXT NOT NULL UNIQUE,
      mode TEXT NOT NULL CHECK(mode IN ('queue','steer')),
      status TEXT NOT NULL CHECK(status IN ('accepted','delivering','delivered','needs_attention','cancelled')),
      text TEXT NOT NULL, page_ids TEXT NOT NULL DEFAULT '[]', context_page_refs TEXT NOT NULL DEFAULT '[]',
      expected_revision INTEGER NOT NULL DEFAULT 0,
      error TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
    `CREATE INDEX idx_run_messages_chat ON run_messages(chat_id,created_at,message_id)`,
    `CREATE INDEX idx_run_messages_status ON run_messages(status,created_at,message_id)`,
  ],
  // v6 → v7: account-scoped outbound calendar reads. Tokens stay in OS-backed secret storage.
  6: [
    `CREATE TABLE calendar_connections(
      connection_id TEXT PRIMARY KEY, provider TEXT NOT NULL CHECK(provider='google'),
      account_key TEXT NOT NULL, label TEXT NOT NULL, secret_name TEXT NOT NULL UNIQUE,
      scopes TEXT NOT NULL, state TEXT NOT NULL CHECK(state IN ('active','needs_reauth')),
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, revoked_at INTEGER)`,
    `CREATE UNIQUE INDEX idx_calendar_account_active ON calendar_connections(provider,account_key) WHERE revoked_at IS NULL`,
  ],
  // v7 → v8: grants bind one calendar account to one saved task revision.
  7: [
    `CREATE TABLE calendar_task_grants(
      grant_id TEXT PRIMARY KEY, task_id TEXT NOT NULL REFERENCES tasks(task_id),
      task_revision INTEGER NOT NULL, connection_id TEXT NOT NULL REFERENCES calendar_connections(connection_id),
      created_at INTEGER NOT NULL, revoked_at INTEGER)`,
    `CREATE UNIQUE INDEX idx_calendar_task_grant_active ON calendar_task_grants(task_id,task_revision,connection_id) WHERE revoked_at IS NULL`,
  ],
  // v8 → v9: direct browser effects belong to an exact saved task revision.
  8: (db) => {
    if(!db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name='action_intents'").get())return [];
    const columns=db.prepare("PRAGMA table_info(action_intents)").all() as {name:string}[];
    const names=new Set(columns.map(column=>column.name));
    return [
      ...(!names.has('task_id')?[`ALTER TABLE action_intents ADD COLUMN task_id TEXT`]:[]),
      ...(!names.has('task_revision')?[`ALTER TABLE action_intents ADD COLUMN task_revision INTEGER`]:[]),
      `CREATE INDEX IF NOT EXISTS idx_action_intents_task_unresolved ON action_intents(task_id,task_revision,status)`,
    ];
  },
  // v9 → v10: encrypted, opt-in page-content recall. No text or search tokens are stored in SQLite.
  9: [
    `CREATE TABLE content_memory(
      memory_id TEXT PRIMARY KEY, profile_id TEXT NOT NULL, workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id) ON DELETE CASCADE,
      source_key TEXT NOT NULL, origin TEXT NOT NULL, captured_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
      ciphertext TEXT NOT NULL, UNIQUE(profile_id,workspace_id,source_key))`,
    `CREATE INDEX idx_content_memory_workspace ON content_memory(profile_id,workspace_id,captured_at DESC)`,
    `CREATE INDEX idx_content_memory_expiry ON content_memory(expires_at)`,
  ],
  // v10 → v11: ambient page observations are transient. Explicit run-owned evidence remains separate.
  10: [`DROP TABLE IF EXISTS observations`],
  // v11 → v12: edited result versions are durable artifacts with explicit lineage.
  11: [
    `CREATE TABLE result_versions(
      artifact_id TEXT PRIMARY KEY REFERENCES artifacts(artifact_id) ON DELETE CASCADE,
      root_artifact_id TEXT NOT NULL, parent_artifact_id TEXT NOT NULL,
      chat_id TEXT NOT NULL, revision INTEGER NOT NULL, created_at REAL NOT NULL,
      UNIQUE(root_artifact_id,revision))`,
    `CREATE INDEX idx_result_versions_chat ON result_versions(chat_id,created_at DESC)`,
  ],
};

/** Apply schema statements atomically; rolls back fully on any failure. */
export function applyMigrations(db: DatabaseSync, statements: string[]): void {
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const statement of statements) db.exec(statement);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

/** Step a supported older schema to SCHEMA_VERSION, backing up the file first. */
function migrate(db: DatabaseSync, path: string, from: number): void {
  let backupDirectory: string | undefined;
  try {
    if (path !== ":memory:") {
      backupDirectory = mkdtempSync(join(tmpdir(), "aux-db-backup-"));
      const backup = join(backupDirectory, "aux-state.sqlite");
      db.exec(`VACUUM INTO '${backup.replaceAll("'", "''")}'`);
      chmodSync(backup, 0o600);
    }
    for (let version = from; version < SCHEMA_VERSION; version += 1) {
      const step = MIGRATIONS[version];
      const statements = typeof step === "function" ? step(db) : step;
      if (!statements) {
        throw new Error(
          `This Aux database is schema ${version} but no migration to ${version + 1} is defined. The file was preserved unchanged.`,
        );
      }
      applyMigrations(db, [...statements, `PRAGMA user_version = ${version + 1}`]);
    }
    db.exec("VACUUM");
  } catch (error) {
    if (backupDirectory) throw new Error(`Database migration failed. The original snapshot is at ${join(backupDirectory, "aux-state.sqlite")}.`, { cause: error });
    throw error;
  }
  if (backupDirectory) rmSync(backupDirectory, { recursive: true, force: true });
}

export function openDb(path: string): DatabaseSync {
  const db = new DatabaseSync(path);
  try {
    // A relaunch can overlap the previous process's WAL checkpoint;
    // statements wait briefly instead of failing with database is locked.
    db.exec("PRAGMA busy_timeout = 5000");
    db.exec("PRAGMA foreign_keys = ON");
    const version = (db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version;
    const { count } = db.prepare("SELECT count(*) AS count FROM sqlite_schema WHERE name NOT LIKE 'sqlite_%'").get() as { count: number };
    if (version === 0 && count > 0) {
      throw new Error("This database uses a pre-versioning development schema. It was preserved unchanged; move it aside or choose a different AUX_DATA_DIR.");
    }
    if (version > 0) {
      const marker = count > 0 && db.prepare("SELECT name FROM sqlite_schema WHERE name='aux_meta'").get()
        ? (db.prepare("SELECT value FROM aux_meta WHERE key='schema'").get() as { value: string } | undefined)?.value
        : undefined;
      if (marker !== "aux") {
        throw new Error("This database uses an incompatible development schema. It was preserved unchanged; move it aside or choose a different AUX_DATA_DIR.");
      }
    }
    if (version > SCHEMA_VERSION || version < 0) {
      throw new Error(`Database schema ${version} is newer than this Aux build supports (schema ${SCHEMA_VERSION}). The file was left unchanged; use the matching newer application.`);
    }
    // SQLite may otherwise leave deleted run answers in reusable database pages.
    // Set on every compatible connection, before migrations or Forget writes.
    db.exec("PRAGMA secure_delete = ON");
    if (path !== ":memory:") chmodSync(path, 0o600);
    if (version === 0) {
      applyMigrations(db, [SCHEMA, `PRAGMA user_version = ${SCHEMA_VERSION}`]);
    } else if (version < SCHEMA_VERSION) {
      migrate(db, path, version);
    }
    db.exec("PRAGMA journal_mode = WAL; PRAGMA synchronous = FULL;");
    sanitizeOperationInputSamples(db);
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

/**
 * Commit `fn` as one transaction without an fsync of its own. The connection
 * stays `synchronous = FULL` for everything else — the action journal among
 * it — and WAL NORMAL commits remain crash-consistent: a power loss can drop
 * the latest of them, never corrupt the file, and the next FULL commit syncs
 * the WAL including these frames. Returns false (nothing run) while another
 * transaction is open on the connection.
 */
export function commitRelaxed(db: DatabaseSync, fn: () => void): boolean {
  if (db.isTransaction) return false;
  db.exec("PRAGMA synchronous = NORMAL");
  try {
    db.exec("BEGIN");
    try {
      fn();
      db.exec("COMMIT");
    } catch (e) {
      if (db.isTransaction) db.exec("ROLLBACK");
      throw e;
    }
  } finally {
    db.exec("PRAGMA synchronous = FULL");
  }
  return true;
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
