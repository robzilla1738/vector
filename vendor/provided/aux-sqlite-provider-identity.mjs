/** External migration tool: caller-owned stopped snapshot buffers only. No paths,
 * filesystem access, native authority, network or delivered-runtime integration.
 */
import { DatabaseSync, constants } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { PINNED_PROVIDER_STATE_TARGET_DDL, PINNED_PROVIDER_STATE_USER_VERSION } from './aux-sqlite-provider-identity-schema.mjs';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const tables = Object.freeze([{ table: 'sessions', column: 'model' }, { table: 'routines', column: 'session_config' }]);
const MAX_DB = 64 * 1024 * 1024, MAX_ROWS = 20_000, MAX_JSON = 2 * 1024 * 1024;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const own = (value, name) => Object.prototype.hasOwnProperty.call(value, name);

function schema(db) {
  return tables.map(({ table }) => ({
    table,
    objects: db.prepare('SELECT type,name,tbl_name,sql FROM sqlite_schema WHERE tbl_name = ? ORDER BY type,name').all(table),
    columns: db.prepare(`PRAGMA table_xinfo(${table})`).all(),
  }));
}
function pinnedSchema() {
  const db = new DatabaseSync(':memory:', { allowExtension: false });
  try { db.exec(PINNED_PROVIDER_STATE_TARGET_DDL); return schema(db); }
  finally { db.close(); }
}
const expectedSchema = JSON.stringify(pinnedSchema());

/** JSON.parse validates syntax; this pass detects duplicate members and locates
 * the exact target value token. Unrelated JSON text is never reserialized.
 */
function jsonTree(text) {
  if (typeof text !== 'string' || Buffer.byteLength(text) > MAX_JSON) throw Error('Provider JSON must be bounded text');
  let value;
  try { value = JSON.parse(text); } catch { throw Error('Invalid stored provider JSON'); }
  let index = 0;
  const whitespace = () => { while (/\s/.test(text[index] ?? '') && index < text.length) index++; };
  const string = () => {
    const start = index++;
    while (index < text.length) { if (text[index] === '\\') { index += 2; continue; } if (text[index++] === '"') break; }
    return { start, end: index, value: JSON.parse(text.slice(start, index)) };
  };
  function visit(depth = 0) {
    if (depth > 64) throw Error('Provider JSON nesting exceeds migration limit');
    whitespace(); const start = index;
    if (text[index] === '"') return string();
    if (text[index] === '{') {
      index++; whitespace(); const fields = new Map();
      while (text[index] !== '}') {
        const name = string().value; whitespace(); index++; whitespace();
        if (fields.has(name)) throw Error('Ambiguous duplicate JSON member');
        fields.set(name, visit(depth + 1)); whitespace();
        if (text[index] === '}') break;
        index++; whitespace();
      }
      index++; return { start, end: index, fields };
    }
    if (text[index] === '[') {
      index++; whitespace();
      while (text[index] !== ']') { visit(depth + 1); whitespace(); if (text[index] === ']') break; index++; whitespace(); }
      index++; return { start, end: index };
    }
    while (index < text.length && !/[\s,\]}]/.test(text[index])) index++;
    return { start, end: index };
  }
  const node = visit(); whitespace(); if (index !== text.length) throw Error('Unexpected provider JSON suffix');
  return { value, node };
}
function migrateText(text, routine) {
  const { value, node } = jsonTree(text);
  if (!object(value)) throw Error('Unknown provider JSON schema');
  if (routine && !own(value, 'model')) return text;
  const selection = routine ? value.model : value, selectionNode = routine ? node.fields?.get('model') : node;
  if (!object(selection) || typeof selection.provider !== 'string' || typeof selection.modelId !== 'string' || !selection.modelId.length || !['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'].includes(selection.thinkingLevel) || (own(selection, 'fastMode') && typeof selection.fastMode !== 'boolean')) throw Error('Unknown stored model selection schema');
  if (selection.provider !== 'aside') return text;
  const provider = selectionNode?.fields?.get('provider');
  if (!provider || provider.value !== 'aside') throw Error('Provider token/schema conflict');
  return text.slice(0, provider.start) + '"aux"' + text.slice(provider.end);
}
function rows(db, table) {
  const statement = db.prepare(`SELECT * FROM ${table} ORDER BY id LIMIT ${MAX_ROWS + 1}`);
  statement.setReadBigInts(true);
  const result = statement.all();
  if (result.length > MAX_ROWS || result.some(row => typeof row.id !== 'string' || !row.id.length)) throw Error('Unsupported state row count or identity');
  return result;
}
const fingerprint = value => sha(JSON.stringify(value, (_key, item) => typeof item === 'bigint' ? { $integer: String(item) } : item instanceof Uint8Array ? { $blob: Buffer.from(item).toString('base64') } : item));
function unchangedFields(row, column) { const copy = { ...row }; delete copy[column]; return fingerprint(copy); }
function integrity(db) {
  const checks = db.prepare('PRAGMA quick_check').all();
  if (checks.length !== 1 || checks[0].quick_check !== 'ok') throw Error('State database integrity check failed');
}
async function assertStopped(capability, hashes, phase) {
  if (!capability || capability.disposable !== true || capability.exclusive !== true || capability.rollbackJournalAbsent !== true || !/^[A-Za-z0-9-]{8,128}$/.test(capability.id) || typeof capability.assertStopped !== 'function' || await capability.assertStopped({ ...hashes, phase }) !== true) throw Error('Live stopped-disposable database/sidecar snapshot capability required');
}

export async function prepareSqliteProviderIdentity({ databaseBytes, expectedSha256, walBytes, capability }) {
  if (!(databaseBytes instanceof Uint8Array) || databaseBytes.length < 100 || databaseBytes.length > MAX_DB || !/^[a-f0-9]{64}$/.test(expectedSha256) || sha(databaseBytes) !== expectedSha256) throw Error('Invalid or changed bounded state database snapshot');
  if (walBytes !== null && !(walBytes instanceof Uint8Array)) throw Error('Explicit absent or empty WAL snapshot required');
  if (walBytes?.length) throw Error('Unsupported nonempty WAL snapshot; checkpoint only an authorized private clone first');
  const input = Buffer.from(databaseBytes);
  if (input.subarray(0, 16).toString() !== 'SQLite format 3\0') throw Error('Unknown database format');
  if (input[18] !== 1 || input[19] !== 1) throw Error('Unsupported WAL-mode database header; checkpoint and leave WAL mode on an authorized private clone first');
  const hashes = { databaseSha256: expectedSha256, walSha256: walBytes === null ? null : sha(walBytes) };
  await assertStopped(capability, hashes, 'prepare-sqlite-copy');
  const db = new DatabaseSync(':memory:', { allowExtension: false }); let began = false;
  try {
    db.deserialize(input); db.enableDefensive(true);
    db.exec('PRAGMA trusted_schema=OFF; PRAGMA temp_store=MEMORY; PRAGMA journal_mode=MEMORY; PRAGMA foreign_keys=OFF;');
    if (db.prepare('PRAGMA user_version').get().user_version !== PINNED_PROVIDER_STATE_USER_VERSION || JSON.stringify(schema(db)) !== expectedSchema || db.prepare("SELECT 1 FROM sqlite_schema WHERE name='routines_v1'").get()) throw Error('Unknown or unfinished supplied state database schema');
    integrity(db);
    const originals = tables.map(({ table, column }) => ({ table, column, rows: rows(db, table) }));
    const plans = originals.map(({ table, column, rows: data }) => ({ table, column, rows: data.map(row => ({ id: row.id, before: row[column], after: migrateText(row[column], table === 'routines'), otherHash: unchangedFields(row, column) })) }));
    // Reject update triggers/virtual/generated/custom layouts through exact schema;
    // authorizer additionally limits every executed write to these two columns.
    db.setAuthorizer((action, table, column) => {
      if ([constants.SQLITE_INSERT, constants.SQLITE_DELETE].includes(action)) return constants.SQLITE_DENY;
      if (action === constants.SQLITE_UPDATE && !tables.some(item => item.table === table && item.column === column)) return constants.SQLITE_DENY;
      return constants.SQLITE_OK;
    });
    db.exec('BEGIN IMMEDIATE'); began = true;
    const counts = {};
    for (const plan of plans) {
      counts[plan.table] = 0;
      const update = db.prepare(`UPDATE ${plan.table} SET ${plan.column}=? WHERE id=? AND ${plan.column}=?`);
      for (const row of plan.rows) {
        if (row.before === row.after) continue;
        if (update.run(row.after, row.id, row.before).changes !== 1) throw Error('Provider database row compare-and-exchange conflict');
        counts[plan.table]++;
      }
    }
    for (const plan of plans) {
      const actual = rows(db, plan.table);
      if (actual.length !== plan.rows.length || actual.some((row, index) => row.id !== plan.rows[index].id || row[plan.column] !== plan.rows[index].after || unchangedFields(row, plan.column) !== plan.rows[index].otherHash)) throw Error('Unrelated state fields or rows changed');
    }
    if (JSON.stringify(schema(db)) !== expectedSchema) throw Error('Database schema changed');
    integrity(db); db.exec('COMMIT'); began = false;
    await assertStopped(capability, hashes, 'sqlite-copy-prepared');
    const changed = counts.sessions + counts.routines > 0;
    const output = changed ? Buffer.from(db.serialize()) : Buffer.from(input);
    if (output.length > MAX_DB || output[18] !== 1 || output[19] !== 1) throw Error('Unsupported prepared database output');
    return {
      bytes: output,
      receipt: { format: 'aux.sqlite-provider-identity.v1', sourceSha256: expectedSha256, outputSha256: sha(output), walDisposition: walBytes === null ? 'verified-absent' : 'verified-empty', changed, changedRows: counts, targetSchemaSha256: sha(expectedSchema), userVersion: PINNED_PROVIDER_STATE_USER_VERSION, uncoveredReferences: ['queued/steering messages', 'transcripts', 'other provider references outside selected columns'] },
    };
  } catch (error) { if (began) { try { db.exec('ROLLBACK'); } catch {} } throw error; }
  finally { db.close(); input.fill(0); }
}
