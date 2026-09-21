/**
 * Single-writer SQLite store on node:sqlite (Node 22+ built-in).
 * The runtime process is the only writer; the renderer and external
 * clients read through the API/event stream.
 */
import { chmodSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS kv(key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(
  session_id TEXT PRIMARY KEY, backend TEXT NOT NULL, label TEXT NOT NULL,
  status TEXT NOT NULL, detail TEXT, updated_at REAL NOT NULL);
CREATE TABLE IF NOT EXISTS pages(
  page_id TEXT PRIMARY KEY, backend TEXT NOT NULL, target_id TEXT NOT NULL,
  session_id TEXT, url TEXT NOT NULL, title TEXT NOT NULL DEFAULT '',
  favicon TEXT, epoch INTEGER NOT NULL DEFAULT 0, revision INTEGER NOT NULL DEFAULT 0,
  view_status TEXT NOT NULL DEFAULT 'hidden', controller TEXT NOT NULL DEFAULT 'none',
  owned INTEGER NOT NULL DEFAULT 0, created_at REAL NOT NULL, active_at REAL NOT NULL,
  detached INTEGER NOT NULL DEFAULT 0, json TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS tabs(
  page_id TEXT PRIMARY KEY, ordinal INTEGER NOT NULL, url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '', backend TEXT NOT NULL DEFAULT 'vector', active INTEGER NOT NULL DEFAULT 0,
  window_id TEXT NOT NULL DEFAULT 'main');
CREATE TABLE IF NOT EXISTS page_sets(
  set_id TEXT PRIMARY KEY, name TEXT NOT NULL, source TEXT NOT NULL,
  member_ids TEXT NOT NULL DEFAULT '[]', result_schema TEXT, program_id TEXT, created_at REAL NOT NULL);
CREATE TABLE IF NOT EXISTS set_members(
  member_id TEXT PRIMARY KEY, set_id TEXT NOT NULL, ordinal INTEGER NOT NULL,
  url TEXT, record_key TEXT, label TEXT, page_id TEXT, status TEXT NOT NULL DEFAULT 'queued',
  result_id TEXT, error TEXT);
CREATE INDEX IF NOT EXISTS idx_members_set ON set_members(set_id, ordinal);
CREATE TABLE IF NOT EXISTS runs(
  run_id TEXT PRIMARY KEY, goal TEXT NOT NULL, status TEXT NOT NULL,
  page_ids TEXT NOT NULL DEFAULT '[]', set_id TEXT, config TEXT, status_message TEXT,
  result TEXT, error TEXT, failure TEXT, started_at REAL, ended_at REAL, created_at REAL NOT NULL);
CREATE TABLE IF NOT EXISTS conversations(
  chat_id TEXT PRIMARY KEY, title TEXT NOT NULL, archived INTEGER NOT NULL DEFAULT 0,
  created_at REAL NOT NULL, updated_at REAL NOT NULL);
CREATE INDEX IF NOT EXISTS idx_conversations_state_updated ON conversations(archived, updated_at DESC);
CREATE TABLE IF NOT EXISTS steps(
  step_id TEXT PRIMARY KEY, run_id TEXT NOT NULL, page_id TEXT, op TEXT NOT NULL,
  inputs TEXT, expected TEXT, outcome TEXT, started_at REAL NOT NULL);
CREATE INDEX IF NOT EXISTS idx_steps_run ON steps(run_id, started_at);
CREATE TABLE IF NOT EXISTS results(
  result_id TEXT PRIMARY KEY, run_id TEXT, member_id TEXT, page_id TEXT,
  source_url TEXT NOT NULL, values_json TEXT NOT NULL, evidence TEXT,
  observed_at REAL NOT NULL, status TEXT NOT NULL, error TEXT);
CREATE INDEX IF NOT EXISTS idx_results_member ON results(member_id);
CREATE INDEX IF NOT EXISTS idx_results_run ON results(run_id);
CREATE TABLE IF NOT EXISTS observations(
  observation_id TEXT PRIMARY KEY, page_id TEXT NOT NULL, epoch INTEGER NOT NULL,
  revision INTEGER NOT NULL, observed_at REAL NOT NULL, scope TEXT, json TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_obs_page ON observations(page_id, revision);
CREATE TABLE IF NOT EXISTS programs(
  program_id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, version INTEGER NOT NULL DEFAULT 1,
  site_key TEXT NOT NULL, parameters TEXT NOT NULL DEFAULT '[]', steps_json TEXT NOT NULL,
  preconditions TEXT, postconditions TEXT, use_count INTEGER NOT NULL DEFAULT 0,
  last_used_at REAL, created_at REAL NOT NULL);
CREATE TABLE IF NOT EXISTS artifacts(
  artifact_id TEXT PRIMARY KEY, run_id TEXT, page_id TEXT, path TEXT NOT NULL,
  media_type TEXT NOT NULL, size INTEGER NOT NULL, status TEXT NOT NULL, created_at REAL NOT NULL);
CREATE TABLE IF NOT EXISTS model_calls(
  call_id TEXT PRIMARY KEY, run_id TEXT, role TEXT NOT NULL, model_id TEXT NOT NULL,
  provider_metadata TEXT, duration_ms REAL NOT NULL, input_tokens REAL, output_tokens REAL,
  cost_usd REAL, cost_estimated INTEGER, error TEXT, created_at REAL NOT NULL);
CREATE TABLE IF NOT EXISTS events(
  seq INTEGER PRIMARY KEY AUTOINCREMENT, run_id TEXT, type TEXT NOT NULL,
  payload TEXT NOT NULL, ts REAL NOT NULL);
CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
CREATE TABLE IF NOT EXISTS history(
  url TEXT NOT NULL, title TEXT NOT NULL DEFAULT '', page_id TEXT, visited_at REAL NOT NULL,
  PRIMARY KEY(url, visited_at));
CREATE INDEX IF NOT EXISTS idx_history_recent ON history(visited_at DESC, url DESC);
CREATE TABLE IF NOT EXISTS bookmarks(
  url TEXT PRIMARY KEY, title TEXT NOT NULL, created_at REAL NOT NULL);
CREATE TABLE IF NOT EXISTS downloads(
  id TEXT PRIMARY KEY, page_id TEXT, filename TEXT, path TEXT, state TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0, total_bytes INTEGER, started_at REAL NOT NULL, ended_at REAL);
CREATE TABLE IF NOT EXISTS spans(
  span_id TEXT PRIMARY KEY, parent_id TEXT, name TEXT NOT NULL, run_id TEXT, page_id TEXT,
  started_at REAL NOT NULL, ended_at REAL, duration_ms REAL, outcome TEXT, attrs TEXT NOT NULL DEFAULT '{}');
CREATE INDEX IF NOT EXISTS idx_spans_run ON spans(run_id, started_at);
CREATE TABLE IF NOT EXISTS response_metadata(
  request_id TEXT PRIMARY KEY, page_id TEXT NOT NULL, url TEXT NOT NULL, method TEXT NOT NULL,
  status INTEGER, content_type TEXT, started_at REAL NOT NULL, ended_at REAL, duration_ms REAL,
  body_artifact_id TEXT, body_bytes INTEGER, truncated INTEGER NOT NULL DEFAULT 0, run_id TEXT);
CREATE INDEX IF NOT EXISTS idx_respmeta_page ON response_metadata(page_id, started_at);
CREATE TABLE IF NOT EXISTS datasets(
  dataset_id TEXT PRIMARY KEY, run_id TEXT, page_id TEXT, source TEXT NOT NULL,
  schema_json TEXT NOT NULL DEFAULT '[]', row_count INTEGER NOT NULL DEFAULT 0,
  values_json TEXT NOT NULL DEFAULT '[]', provenance TEXT, created_at REAL NOT NULL,
  stale INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS operations(
  operation_id TEXT PRIMARY KEY, site_key TEXT NOT NULL, name TEXT NOT NULL,
  description TEXT, input_schema TEXT NOT NULL DEFAULT '{}', output_schema TEXT NOT NULL DEFAULT '{}',
  effect_class TEXT NOT NULL DEFAULT 'read', guards TEXT NOT NULL DEFAULT '{}',
  created_at REAL NOT NULL, updated_at REAL NOT NULL,
  UNIQUE(site_key, name));
CREATE TABLE IF NOT EXISTS operation_implementations(
  impl_id TEXT PRIMARY KEY, operation_id TEXT NOT NULL, kind TEXT NOT NULL,
  executable TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'candidate',
  evidence TEXT NOT NULL DEFAULT '[]', stats TEXT NOT NULL DEFAULT '{}',
  created_at REAL NOT NULL, updated_at REAL NOT NULL);
CREATE INDEX IF NOT EXISTS idx_impl_op ON operation_implementations(operation_id, state);
CREATE TABLE IF NOT EXISTS operation_invocations(
  invocation_id TEXT PRIMARY KEY, operation_id TEXT NOT NULL, impl_id TEXT,
  run_id TEXT, request_key TEXT, inputs TEXT NOT NULL DEFAULT '{}', status TEXT NOT NULL,
  effect_outcome TEXT NOT NULL DEFAULT 'unknown', route_reason TEXT,
  started_at REAL NOT NULL, ended_at REAL, error TEXT);
CREATE TABLE IF NOT EXISTS operation_reconciliations(
  invocation_id TEXT PRIMARY KEY, task_id TEXT NOT NULL, task_revision INTEGER NOT NULL,
  outcome TEXT NOT NULL CHECK(outcome IN ('applied','not_applied')), evidence_id TEXT NOT NULL,
  note TEXT NOT NULL, recorded_at INTEGER NOT NULL);
`;

/** Idempotent column additions for databases created before a column existed. */
const MIGRATIONS = [
  "ALTER TABLE downloads ADD COLUMN total_bytes INTEGER",
  "ALTER TABLE pages ADD COLUMN controller_epoch INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE operation_invocations ADD COLUMN request_key TEXT",
  "ALTER TABLE runs ADD COLUMN failure TEXT",
  "CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts)",
];

export type Db = DatabaseSync;
export const SCHEMA_VERSION = 13;

const OPERATION_RECONCILIATION_SCHEMA = `
CREATE TABLE IF NOT EXISTS operation_reconciliations(
  invocation_id TEXT PRIMARY KEY, task_id TEXT NOT NULL, task_revision INTEGER NOT NULL,
  outcome TEXT NOT NULL CHECK(outcome IN ('applied','not_applied')), evidence_id TEXT NOT NULL,
  note TEXT NOT NULL, recorded_at INTEGER NOT NULL);
`;

const CONVERSATION_SCHEMA = `
CREATE TABLE IF NOT EXISTS conversations(
  chat_id TEXT PRIMARY KEY, title TEXT NOT NULL, archived INTEGER NOT NULL DEFAULT 0,
  created_at REAL NOT NULL, updated_at REAL NOT NULL);
CREATE INDEX IF NOT EXISTS idx_conversations_state_updated ON conversations(archived, updated_at DESC);
WITH keyed AS (
  SELECT run_id, goal, created_at,
    coalesce(json_extract(CASE WHEN json_valid(config) THEN config ELSE '{}' END, '$.chatId'), run_id) AS chat_id
  FROM runs
)
INSERT OR IGNORE INTO conversations(chat_id,title,archived,created_at,updated_at)
SELECT k.chat_id,
  (SELECT k2.goal FROM keyed k2 WHERE k2.chat_id=k.chat_id ORDER BY k2.created_at, k2.run_id LIMIT 1),
  0, min(k.created_at), max(k.created_at)
FROM keyed k GROUP BY k.chat_id;
`;

/** Give every saved task one durable conversation without discarding older runs or context choices. */
function migrateTaskConversations(db: DatabaseSync): void {
  const rows = db.prepare(`SELECT run_id,config,created_at FROM runs
    WHERE json_valid(config) AND json_type(config,'$.taskId')='text'
    ORDER BY created_at,run_id`).all() as { run_id: string; config: string; created_at: number }[];
  const groups = new Map<string, { runId: string; config: Record<string, unknown>; createdAt: number; oldChatId: string }[]>();
  for (const row of rows) {
    const config = JSON.parse(row.config) as Record<string, unknown>;
    const taskId = typeof config.taskId === "string" ? config.taskId : "";
    if (!taskId) continue;
    const oldChatId = typeof config.chatId === "string" && config.chatId ? config.chatId : row.run_id;
    const group = groups.get(taskId) ?? [];
    group.push({ runId: row.run_id, config, createdAt: row.created_at, oldChatId });
    groups.set(taskId, group);
  }
  const updateRun = db.prepare("UPDATE runs SET config=? WHERE run_id=?");
  const getConversation = db.prepare("SELECT title,archived,created_at,updated_at FROM conversations WHERE chat_id=?");
  const upsertConversation = db.prepare(`INSERT INTO conversations(chat_id,title,archived,created_at,updated_at) VALUES(?,?,?,?,?)
    ON CONFLICT(chat_id) DO UPDATE SET title=excluded.title,archived=excluded.archived,
      created_at=min(conversations.created_at,excluded.created_at),updated_at=max(conversations.updated_at,excluded.updated_at)`);
  const getSetting = db.prepare("SELECT value FROM kv WHERE key=?");
  const putSetting = db.prepare("INSERT OR IGNORE INTO kv(key,value) VALUES(?,?)");
  const deleteConversation = db.prepare(`DELETE FROM conversations WHERE chat_id=? AND NOT EXISTS (
    SELECT 1 FROM runs WHERE coalesce(json_extract(CASE WHEN json_valid(config) THEN config ELSE '{}' END,'$.chatId'),run_id)=?)`);
  for (const [taskId, group] of groups) {
    const chatId = `task:${taskId}`;
    const taskRow = db.prepare("SELECT json,state FROM tasks WHERE task_id=?").get(taskId) as { json: string; state: string } | undefined;
    let title = group[0]!.config.taskId as string;
    try { title = taskRow ? String((JSON.parse(taskRow.json) as { title?: string }).title || title) : title; } catch { /* retain safe fallback */ }
    let createdAt = Math.min(...group.map(item => item.createdAt));
    let updatedAt = Math.max(...group.map(item => item.createdAt));
    const oldIds = [...new Set(group.map(item => item.oldChatId))];
    for (const oldId of oldIds) {
      const old = getConversation.get(oldId) as { title: string; archived: number; created_at: number; updated_at: number } | undefined;
      if (!old) continue;
      if (!taskRow && old.title) title = old.title;
      createdAt = Math.min(createdAt, old.created_at);
      updatedAt = Math.max(updatedAt, old.updated_at);
    }
    for (const item of group) updateRun.run(JSON.stringify({ ...item.config, chatId }), item.runId);
    upsertConversation.run(chatId, title.slice(0, 160), taskRow?.state === "archived" ? 1 : 0, createdAt, updatedAt);
    for (const prefix of ["conversationContext", "conversationAttachments", "conversationArtifacts", "conversationWorkspace"]) {
      const targetKey = `setting:${prefix}:${chatId}`;
      if (getSetting.get(targetKey)) continue;
      for (const oldId of oldIds.slice().reverse()) {
        const source = getSetting.get(`setting:${prefix}:${oldId}`) as { value: string } | undefined;
        if (source) { putSetting.run(targetKey, source.value); break; }
      }
    }
    for (const oldId of oldIds) if (oldId !== chatId) deleteConversation.run(oldId, oldId);
  }
}

const WINDOW_SCHEMA = `ALTER TABLE tabs ADD COLUMN window_id TEXT NOT NULL DEFAULT 'main';`;

const AGENT_CONNECTION_SCHEMA = `
CREATE TABLE IF NOT EXISTS agent_connections(
  connection_id TEXT PRIMARY KEY, name TEXT NOT NULL, client TEXT NOT NULL,
  scope_kind TEXT NOT NULL CHECK(scope_kind IN ('workspace','task')),
  workspace_id TEXT NOT NULL, task_id TEXT, token_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL, last_used_at INTEGER, revoked_at INTEGER,
  CHECK((scope_kind='workspace' AND task_id IS NULL) OR (scope_kind='task' AND task_id IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS idx_agent_connections_scope ON agent_connections(workspace_id,task_id,revoked_at);
`;

const EVIDENCE_SCHEMA = `
CREATE TABLE task_evidence(seq INTEGER PRIMARY KEY AUTOINCREMENT, evidence_id TEXT NOT NULL UNIQUE,
  task_id TEXT NOT NULL, task_revision INTEGER NOT NULL, criterion_id TEXT NOT NULL, json TEXT NOT NULL);
CREATE INDEX idx_task_evidence ON task_evidence(task_id,task_revision,criterion_id,seq);
CREATE TABLE criterion_reviews(seq INTEGER PRIMARY KEY AUTOINCREMENT, review_id TEXT NOT NULL UNIQUE,
  task_id TEXT NOT NULL, task_revision INTEGER NOT NULL, criterion_id TEXT NOT NULL, json TEXT NOT NULL);
CREATE INDEX idx_criterion_reviews ON criterion_reviews(task_id,task_revision,criterion_id,seq);
`;

const TASK_SCHEMA = `
CREATE TABLE workspaces(workspace_id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE tasks(task_id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, revision INTEGER NOT NULL,
  state TEXT NOT NULL CHECK(state IN ('open','archived')), updated_at INTEGER NOT NULL, json TEXT NOT NULL);
CREATE INDEX idx_tasks_workspace ON tasks(workspace_id,state,updated_at);
CREATE TABLE task_revisions(task_id TEXT NOT NULL, revision INTEGER NOT NULL, json TEXT NOT NULL,
  PRIMARY KEY(task_id,revision));
CREATE INDEX idx_runs_task ON runs(json_extract(config,'$.taskId'));
`;

const VAULT_ROUTINE_SCHEMA = `
CREATE TABLE IF NOT EXISTS vault_items(
  item_id TEXT PRIMARY KEY, label TEXT NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('password','secret')),
  username TEXT, account_label TEXT, origin TEXT NOT NULL,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, revoked_at INTEGER, expires_at INTEGER);
CREATE TABLE IF NOT EXISTS vault_grants(
  grant_id TEXT PRIMARY KEY, item_id TEXT NOT NULL, credential_ref TEXT NOT NULL UNIQUE,
  task_id TEXT, workspace_id TEXT, origin TEXT NOT NULL, account_label TEXT,
  created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, revoked_at INTEGER,
  last_used_at INTEGER, use_count INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS idx_vault_grants_item ON vault_grants(item_id,revoked_at);
CREATE TABLE IF NOT EXISTS vault_access(
  seq INTEGER PRIMARY KEY AUTOINCREMENT, item_id TEXT, grant_id TEXT, action TEXT NOT NULL,
  actor TEXT NOT NULL, task_id TEXT, origin TEXT, detail TEXT, recorded_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_vault_access_item ON vault_access(item_id,seq);
CREATE TABLE IF NOT EXISTS routines(
  routine_id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, revision INTEGER NOT NULL,
  paused INTEGER NOT NULL DEFAULT 0, archived_at INTEGER, updated_at INTEGER NOT NULL, json TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_routines_workspace ON routines(workspace_id,archived_at,updated_at);
CREATE TABLE IF NOT EXISTS routine_revisions(routine_id TEXT NOT NULL, revision INTEGER NOT NULL, json TEXT NOT NULL,
  PRIMARY KEY(routine_id,revision));
CREATE TABLE IF NOT EXISTS routine_runs(
  routine_run_id TEXT PRIMARY KEY, routine_id TEXT NOT NULL, revision INTEGER NOT NULL,
  occurrence_id TEXT, occurrence_identity TEXT, status TEXT NOT NULL,
  reason TEXT, chat_id TEXT, run_id TEXT, parameters TEXT NOT NULL DEFAULT '{}',
  started_at INTEGER, ended_at INTEGER, created_at INTEGER NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS idx_routine_occurrence ON routine_runs(occurrence_identity) WHERE occurrence_identity IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_routine_runs ON routine_runs(routine_id,created_at);
`;

const COORDINATOR_VERIFY_SCHEMA = `
CREATE TABLE IF NOT EXISTS coordinator_leases(
  lease_key TEXT PRIMARY KEY, owner_id TEXT NOT NULL, acquired_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL, generation INTEGER NOT NULL DEFAULT 1, fenced INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS criterion_verifications(
  verification_id TEXT PRIMARY KEY, task_id TEXT NOT NULL, task_revision INTEGER NOT NULL,
  criterion_id TEXT NOT NULL, json TEXT NOT NULL, recorded_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_criterion_verifications ON criterion_verifications(task_id,task_revision,criterion_id,recorded_at);
`;

const ACTION_JOURNAL_SCHEMA = `
CREATE TABLE action_intents(
  id TEXT PRIMARY KEY, idempotency_key TEXT NOT NULL UNIQUE,
  run_id TEXT NOT NULL, page_id TEXT NOT NULL, document_epoch INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending','confirmed','uncertain','not_applied')),
  created_at INTEGER NOT NULL, evidence TEXT);
CREATE INDEX idx_action_intents_unresolved ON action_intents(run_id, page_id, status);
CREATE TABLE action_transitions(
  seq INTEGER PRIMARY KEY AUTOINCREMENT, intent_id TEXT NOT NULL,
  status TEXT NOT NULL, recorded_at INTEGER NOT NULL, evidence TEXT);
CREATE TABLE journal_imports(source TEXT PRIMARY KEY, imported_at INTEGER NOT NULL);
`;

/**
 * Apply idempotent ALTER TABLE migrations. Only "duplicate column" (the
 * column already exists — expected on every start after the first) is
 * swallowed; disk-full, corruption or a bad statement propagate so a real
 * schema failure is never mistaken for "already migrated".
 */
export function applyMigrations(db: DatabaseSync, migrations: readonly string[] = MIGRATIONS): void {
  for (const sql of migrations) {
    try {
      db.exec(sql);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/duplicate column/i.test(msg)) continue;
      throw e;
    }
  }
}

export function openDb(path: string): DatabaseSync {
  const db = new DatabaseSync(path);
  try {
    const version = (db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version;
    if (version > SCHEMA_VERSION || version < 0) {
      throw new Error(`Database schema ${version} is not supported by Aux (maximum ${SCHEMA_VERSION}). Use the matching newer application; do not downgrade this database.`);
    }
    if (path !== ":memory:") chmodSync(path, 0o600);
    if (version < SCHEMA_VERSION) {
      const { count } = db.prepare("SELECT count(*) AS count FROM sqlite_schema WHERE name NOT LIKE 'sqlite_%'").get() as { count: number };
      if (count > 0 && path !== ":memory:") {
        // VACUUM snapshots committed WAL contents too. A private directory protects
        // the snapshot from creation onward; never copy just the main WAL database.
        const directory = mkdtempSync(`${path}.before-v${SCHEMA_VERSION}-`);
        chmodSync(directory, 0o700);
        const backup = join(directory, "state.sqlite");
        db.prepare("VACUUM INTO ?").run(backup);
        chmodSync(backup, 0o600);
      }
      db.exec("BEGIN IMMEDIATE");
      try {
        if (version < 1) {
          db.exec(SCHEMA);
          applyMigrations(db);
        }
        if (version < 2) db.exec(ACTION_JOURNAL_SCHEMA);
        if (version < 3) db.exec(TASK_SCHEMA);
        if (version < 4) db.exec(EVIDENCE_SCHEMA);
        if (version < 5) applyMigrations(db, [WINDOW_SCHEMA]);
        if (version < 6) db.exec(AGENT_CONNECTION_SCHEMA);
        if (version < 7) applyMigrations(db, ["ALTER TABLE runs ADD COLUMN failure TEXT"]);
        if (version < 8) db.exec(CONVERSATION_SCHEMA);
        if (version < 9) migrateTaskConversations(db);
        if (version < 10) db.exec(OPERATION_RECONCILIATION_SCHEMA);
        if (version < 11) {
          applyMigrations(db, ["ALTER TABLE bookmarks ADD COLUMN folder_path TEXT NOT NULL DEFAULT '[]'"]);
          db.exec("CREATE TABLE IF NOT EXISTS bookmark_folders(path TEXT PRIMARY KEY)");
        }
        if (version < 12) db.exec(VAULT_ROUTINE_SCHEMA);
        if (version < 13) db.exec(COORDINATOR_VERIFY_SCHEMA);
        db.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`);
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    }
    db.exec("PRAGMA journal_mode = WAL; PRAGMA synchronous = FULL;");
    return db;
  } catch (error) {
    db.close();
    throw error;
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
