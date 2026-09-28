import { createHash } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { NativeBridge } from "../native.js";
import { ProtectedStore } from "../services/protected-store.js";

const PREFIX = "auxenc:v1:";
const NAME = /^[a-z][a-z0-9_]*$/;
const KV_MARKER = "protected_sqlite_v1:kv_filtered";
const KV_PLAN = JSON.stringify({ column: "value", plaintext: ["meta:eventStreamId", "counter:%"] });
const IDENTITY_OVERRIDES: Readonly<Record<string, readonly string[]>> = {
  task_evidence: ["evidence_id"],
  criterion_reviews: ["review_id"],
};
export const protectedSqliteIdentity = (table: string, info: readonly { name: string; pk: number }[]): readonly string[] =>
  IDENTITY_OVERRIDES[table] ?? info.filter(item => item.pk > 0).sort((a, b) => a.pk - b.pk).map(item => item.name);
/** Event stream identity and tracing counters have SQL arithmetic readers. All other KV values are protected. */
export const protectedKvKey = (key: string): boolean => key !== "meta:eventStreamId" && !key.startsWith("counter:");
type Secrets = Pick<NativeBridge, "readSecret" | "storeSecret"> & {
  profileStorageRoot?: (args: { version: 1 }) => Promise<{ value: string }>;
  profileStorageFactor?: (args: { version: 1; purpose: "sqlite" }) => Promise<{ value: string }>;
};

/** Model/user text inventory. A table enters migration only after its SQL readers and writers use this codec. */
export const SENSITIVE_SQLITE_COLUMNS: Readonly<Record<string, readonly string[]>> = {
  kv: ["value"],
  sessions: ["label", "detail"],
  pages: ["url", "title", "favicon", "json"],
  tabs: ["url", "title"],
  page_sets: ["name", "result_schema"],
  set_members: ["url", "record_key", "label", "error"],
  runs: ["goal", "config", "status_message", "result", "error", "failure"],
  run_messages: ["text", "context_page_refs", "error"],
  conversations: ["title"],
  steps: ["inputs", "expected", "outcome"],
  results: ["source_url", "values_json", "evidence", "error"],
  programs: ["name", "description", "site_key", "parameters", "steps_json", "preconditions", "postconditions"],
  artifacts: ["path", "media_type"],
  model_calls: ["provider_metadata", "error"],
  events: ["payload"],
  history: ["url", "title"],
  history_projection_staging: ["url", "title"],
  bookmarks: ["url", "title", "folder_path"],
  bookmark_articles: ["url", "json"],
  bookmark_folders: ["path"],
  downloads: ["filename", "path"],
  spans: ["name", "outcome", "attrs"],
  response_metadata: ["url", "method", "content_type"],
  datasets: ["source", "schema_json", "values_json", "provenance"],
  operations: ["site_key", "name", "description", "input_schema", "output_schema", "guards"],
  operation_implementations: ["executable", "evidence", "stats"],
  operation_invocations: ["inputs", "route_reason", "error"],
  operation_reconciliations: ["note"],
  action_intents: ["evidence"],
  action_transitions: ["evidence"],
  safety_approval_requests: ["action_json"],
  safety_standing_grants: ["origin", "recipient"],
  safety_send_journal: ["text", "digest", "error_code"],
  safety_challenge_recovery: ["origin"],
  safety_audit: ["payload"],
  command_escalation_requests: ["body"],
  command_escalation_grants: ["body"],
  workspaces: ["name"],
  tasks: ["json"],
  task_revisions: ["json"],
  task_evidence: ["json"],
  criterion_reviews: ["json"],
  criterion_verifications: ["json"],
  agent_connections: ["name", "client"],
  calendar_connections: ["account_key", "label", "scopes"],
  vault_items: ["label", "username", "account_label", "origin"],
  vault_grants: ["origin", "account_label"],
  vault_access: ["origin", "detail"],
  routines: ["json"],
  routine_revisions: ["json"],
  routine_runs: ["reason", "parameters"],
  plugins: ["name", "description"],
  plugin_assets: ["name", "description", "content"],
  goals: ["body"],
  hooks: ["body"],
  hook_invocations: ["error"],
  outbound_mcp_servers: ["body"],
  outbound_mcp_grants: ["tool_name", "body"],
  subagent_groups: ["body"],
  subagents: ["body"],
  site_user_css: ["origin", "css"],
  site_zap_rules: ["origin", "selector"],
  run_transcript: ["message", "park"],
  safety_suspensions: ["request_json"],
  safety_decisions: ["origin", "destination", "request_json", "decision_json"],
  ai_spend: ["source", "model_id"],
} as const;

/** AAD binds every value to its Profile, table, row and column. */
export class SqliteColumnCipher {
  private constructor(private readonly protectedStore: ProtectedStore, private readonly key: Buffer) {}

  static async create(secrets: Secrets, profileId: string, hasEncryptedRows: boolean) {
    const factorName = `sqlite_factor_v1_${createHash("sha256").update(profileId).digest("hex").slice(0, 24)}`;
    let value = (await secrets.readSecret(factorName)).value;
    if (!value) {
      if (hasEncryptedRows) throw new Error("The protected database factor is missing. Restore its OS credential store or use reviewed recovery.");
      if (!secrets.profileStorageFactor) throw new Error("Atomic protected database factor creation is unavailable.");
      const created = (await secrets.profileStorageFactor({ version: 1, purpose: "sqlite" })).value;
      value = (await secrets.readSecret(factorName)).value;
      if (value !== created) throw new Error("The protected database factor could not be confirmed.");
    }
    const factor = Buffer.from(value, "base64");
    if (factor.length !== 32 || factor.toString("base64") !== value) throw new Error("The protected database factor is invalid.");
    const protectedStore = new ProtectedStore(secrets, profileId);
    const key = await protectedStore.generationKey("runtime-sqlite", factor, !hasEncryptedRows);
    return new SqliteColumnCipher(protectedStore, key);
  }

  encrypt(table: string, rowId: string | number, column: string, value: string): string {
    if (!NAME.test(table) || !NAME.test(column) || !String(rowId)) throw new Error("Protected database field identity is invalid.");
    return PREFIX + this.protectedStore.seal(this.key, "runtime-sqlite", `${table}/${rowId}/${column}`, Buffer.from(value));
  }

  decrypt(table: string, rowId: string | number, column: string, value: string): string {
    if (!value.startsWith(PREFIX)) throw new Error("Protected database field is plaintext or has an unknown version.");
    return this.protectedStore.open(this.key, "runtime-sqlite", `${table}/${rowId}/${column}`,
      value.slice(PREFIX.length)).toString("utf8");
  }

  isEncrypted(value: string) { return value.startsWith(PREFIX); }
}

/** Transactional table conversion. Call only after that table's SQL adapters are installed. */
export function migrateSensitiveTable(db: DatabaseSync, cipher: SqliteColumnCipher, table: string): number {
  if (table === "kv") throw new Error("KV requires its filtered migration plan.");
  const columns = SENSITIVE_SQLITE_COLUMNS[table] ?? [];
  if (!NAME.test(table) || !columns.length || columns.some(column => !NAME.test(column)))
    throw new Error("Protected database table or column is not registered.");
  const info = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string; pk: number }[];
  const present = new Set(info.map(item => item.name));
  if (columns.some(column => !present.has(column))) throw new Error("Protected database schema does not match the migration plan.");
  const identity = protectedSqliteIdentity(table, info);
  if (!identity.length || identity.some(column => columns.includes(column)))
    throw new Error("Protected database primary keys need an explicit stable identity migration.");
  if (db.prepare("SELECT 1 FROM sqlite_schema WHERE tbl_name=? AND type='trigger' LIMIT 1").get(table))
    throw new Error("Protected database triggers need an explicit query adaptation before migration.");
  const marker = `protected_sqlite_v1:${table}`;
  const plan = IDENTITY_OVERRIDES[table] ? JSON.stringify({ columns, identity }) : JSON.stringify(columns);
  let changed = 0;
  db.exec("BEGIN IMMEDIATE");
  try {
    const marked = db.prepare("SELECT value FROM aux_meta WHERE key=?").get(marker) as { value: string } | undefined;
    if (marked && marked.value !== plan)
      throw new Error("Protected database column inventory changed without a new migration version.");
    const rows = db.prepare(`SELECT rowid AS aux_rowid, ${[...new Set([...identity, ...columns])].join(", ")} FROM ${table}`).all() as
      (Record<string, unknown> & { aux_rowid: number })[];
    for (const row of rows) {
      const recordId = JSON.stringify(identity.map(column => row[column]));
      const updates = columns.filter(column => row[column] !== null && row[column] !== undefined);
      if (!updates.length) continue;
      const values = updates.map(column => {
        const value = row[column];
        if (typeof value !== "string") throw new Error("Protected database field is not text.");
        if (cipher.isEncrypted(value)) {
          cipher.decrypt(table, recordId, column, value);
          return value;
        }
        if (marked) throw new Error("Protected database field was written as plaintext after migration.");
        changed++;
        const encrypted = cipher.encrypt(table, recordId, column, value);
        if (cipher.decrypt(table, recordId, column, encrypted) !== value)
          throw new Error("Protected database field could not be verified.");
        return encrypted;
      });
      db.prepare(`UPDATE ${table} SET ${updates.map(column => `${column}=?`).join(", ")} WHERE rowid=?`)
        .run(...values, row.aux_rowid);
    }
    db.prepare("INSERT INTO aux_meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
      .run(marker, plan);
    db.exec("COMMIT");
  } catch (error) {
    if (db.isTransaction) db.exec("ROLLBACK");
    throw error;
  }
  return changed;
}

/** Transactionally seal every KV value except the two explicitly retained operational families. */
export function migrateSensitiveKv(db: DatabaseSync, cipher: SqliteColumnCipher): number {
  let changed = 0;
  db.exec("BEGIN IMMEDIATE");
  try {
    const marked = db.prepare("SELECT value FROM aux_meta WHERE key=?").get(KV_MARKER) as { value: string } | undefined;
    if (marked && marked.value !== KV_PLAN) throw new Error("Protected KV inventory changed without a new migration version.");
    const rows = db.prepare("SELECT key,value FROM kv ORDER BY key").all() as { key: string; value: string }[];
    for (const row of rows) {
      if (!protectedKvKey(row.key)) {
        if (cipher.isEncrypted(row.value)) throw new Error("Operational KV value unexpectedly uses a protected envelope.");
        continue;
      }
      const id = JSON.stringify([row.key]);
      if (cipher.isEncrypted(row.value)) {
        cipher.decrypt("kv", id, "value", row.value);
        continue;
      }
      if (marked) throw new Error("Protected KV value was written as plaintext after migration.");
      const encrypted = cipher.encrypt("kv", id, "value", row.value);
      if (cipher.decrypt("kv", id, "value", encrypted) !== row.value)
        throw new Error("Protected KV value could not be verified.");
      db.prepare("UPDATE kv SET value=? WHERE key=?").run(encrypted, row.key);
      changed++;
    }
    db.prepare("INSERT INTO aux_meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
      .run(KV_MARKER, KV_PLAN);
    db.exec("COMMIT");
  } catch (error) {
    if (db.isTransaction) db.exec("ROLLBACK");
    throw error;
  }
  return changed;
}

/** Rebuild the current database and truncate its WAL after all adapted tables migrate.
 * This cannot erase pre-existing backups, exported copies or artifact files. */
export function compactProtectedSqlite(db: DatabaseSync): void {
  if (db.isTransaction) throw new Error("Protected database compaction requires no open transaction.");
  const checkpoint = () => {
    const row = db.prepare("PRAGMA wal_checkpoint(TRUNCATE)").get() as { busy: number };
    if (row.busy) throw new Error("Protected database WAL has an active reader; compaction is incomplete.");
  };
  checkpoint();
  db.exec("VACUUM");
  checkpoint();
}
