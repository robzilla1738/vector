/**
 * Single-writer SQLite store on node:sqlite (Node 22+ built-in).
 * The runtime process is the only writer; the renderer and external
 * clients read through the API/event stream.
 */
import { DatabaseSync } from "node:sqlite";

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
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
  title TEXT NOT NULL DEFAULT '', backend TEXT NOT NULL DEFAULT 'vector', active INTEGER NOT NULL DEFAULT 0);
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
  result TEXT, error TEXT, started_at REAL, ended_at REAL, created_at REAL NOT NULL);
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
CREATE TABLE IF NOT EXISTS history(
  url TEXT NOT NULL, title TEXT NOT NULL DEFAULT '', page_id TEXT, visited_at REAL NOT NULL,
  PRIMARY KEY(url, visited_at));
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
`;

/** Idempotent column additions for databases created before a column existed. */
const MIGRATIONS = [
  "ALTER TABLE downloads ADD COLUMN total_bytes INTEGER",
  "ALTER TABLE pages ADD COLUMN controller_epoch INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE operation_invocations ADD COLUMN request_key TEXT",
];

export type Db = DatabaseSync;

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
  db.exec(SCHEMA);
  applyMigrations(db);
  return db;
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
