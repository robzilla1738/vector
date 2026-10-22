import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { prepareSqliteProviderIdentity } from './aux-sqlite-provider-identity.mjs';
import { PINNED_PROVIDER_STATE_TARGET_DDL } from './aux-sqlite-provider-identity-schema.mjs';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const model = ' { "provider" : "aside", "modelId" : "fixture-model", "thinkingLevel":"medium", "fastMode":true, "unrelated":{"brandText":"aside","number":1e2} } ';
const routine = ' { "harnessId":"v1", "model" : {"provider":"aside","modelId":"fixture-model", "thinkingLevel":"high", "fastMode":false}, "notificationsEnabled":true, "untouched":"aside" } ';
function fixture({ sessionModel = model, routineConfig = routine, mutate } = {}) {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE projects(id TEXT PRIMARY KEY NOT NULL);');
    db.exec(PINNED_PROVIDER_STATE_TARGET_DDL);
    db.exec('PRAGMA user_version=20; CREATE TABLE unrelated(id TEXT PRIMARY KEY,value BLOB);');
    db.prepare('INSERT INTO sessions(id,cwd,model,queued_messages,steering_messages,updated_at) VALUES(?,?,?,?,?,?)').run('fixture-session', '/synthetic', sessionModel, '[{"provider":"aside","text":"not audited"}]', '[]', 177);
    db.prepare('INSERT INTO sessions(id,cwd,model,updated_at) VALUES(?,?,?,?)').run('untouched-session', '/other', model.replace('"aside"', '"custom-provider"'), 178);
    db.prepare('INSERT INTO routines(id,type,environment,name,prompt,rrule,status,created_at,updated_at,metadata,session_config) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run('fixture-routine','standalone','device','Fixture','Synthetic','FREQ=DAILY','paused',170,180,'{"provider":"aside","opaque":true}',routineConfig);
    db.prepare('INSERT INTO unrelated(id,value) VALUES(?,?)').run('fixture', Buffer.from([0, 7, 9, 255]));
    mutate?.(db);
    return Buffer.from(db.serialize());
  } finally { db.close(); }
}
function request(databaseBytes, extra = {}) {
  return { databaseBytes, expectedSha256: sha(databaseBytes), walBytes: null, capability: { id: 'fixture-sqlite-copy', disposable: true, exclusive: true, rollbackJournalAbsent: true, assertStopped: async () => true }, ...extra };
}
function read(bytes) {
  const db = new DatabaseSync(':memory:');
  try {
    db.deserialize(bytes);
    return { sessions: db.prepare('SELECT * FROM sessions ORDER BY id').all().map(row => ({ ...row })), routines: db.prepare('SELECT * FROM routines ORDER BY id').all().map(row => ({ ...row })), unrelated: db.prepare('SELECT * FROM unrelated ORDER BY id').all().map(row => ({ ...row })), version: db.prepare('PRAGMA user_version').get().user_version };
  } finally { db.close(); }
}
test('source-derived SQLite clone changes only exact provider tokens and preserves other row bytes/fields', async () => {
  const bytes = fixture(), originalBytes = Buffer.from(bytes), original = read(bytes);
  const result = await prepareSqliteProviderIdentity(request(bytes));
  assert.deepEqual(bytes, originalBytes);
  const actual = read(result.bytes), expected = structuredClone(original);
  expected.sessions[0].model = model.replace('"aside"', '"aux"');
  expected.routines[0].session_config = routine.replace('"aside"', '"aux"');
  assert.deepEqual(actual, expected);
  assert.deepEqual(result.receipt.changedRows, { sessions: 1, routines: 1 });
  assert.equal(result.receipt.userVersion, 20);
  assert.equal(result.receipt.uncoveredReferences.includes('queued/steering messages'), true);
  assert.equal(JSON.stringify(result.receipt).includes('fixture-session'), false);
});
test('already-Aux selections and optional missing routine model return byte-identical DB', async () => {
  const bytes = fixture({ sessionModel: model.replace('"aside"', '"aux"'), routineConfig: '{"harnessId":"v1","other":"aside"}' });
  const result = await prepareSqliteProviderIdentity(request(bytes));
  assert.equal(result.receipt.changed, false); assert.deepEqual(result.bytes, bytes);
});
test('ambiguous duplicate JSON, malformed selections and unknown routine shape fail without source mutation', async () => {
  for (const config of [
    { sessionModel: '{"provider":"aside","provider":"aux","modelId":"x","thinkingLevel":"medium"}' },
    { sessionModel: '{"provider":"aside","modelId":"x","thinkingLevel":"unknown"}' },
    { sessionModel: '{}' },
    { routineConfig: '{"model":null}' },
    { routineConfig: '[]' },
    { sessionModel: '{invalid-json}' },
  ]) {
    const bytes = fixture(config), before = Buffer.from(bytes);
    await assert.rejects(prepareSqliteProviderIdentity(request(bytes)));
    assert.deepEqual(bytes, before);
  }
});
test('unknown columns/indexes/triggers/user version and unfinished routine migration are refused', async () => {
  for (const sql of [
    'ALTER TABLE sessions ADD COLUMN unknown_future TEXT',
    'CREATE INDEX unknown_future_index ON sessions(model)',
    'CREATE TRIGGER unknown_update AFTER UPDATE ON sessions BEGIN UPDATE unrelated SET value=x\'01\'; END',
    'PRAGMA user_version=21',
    'CREATE TABLE routines_v1(id TEXT)',
  ]) {
    const bytes = fixture({ mutate: db => db.exec(sql) });
    await assert.rejects(prepareSqliteProviderIdentity(request(bytes)), /Unknown or unfinished/);
  }
});
test('nonempty/missing WAL, WAL-mode header and unproven stopped/rollback-journal scope fail explicitly', async () => {
  const bytes = fixture();
  await assert.rejects(prepareSqliteProviderIdentity(request(bytes, { walBytes: Buffer.from([1]) })), /Unsupported nonempty WAL/);
  await assert.rejects(prepareSqliteProviderIdentity(request(bytes, { walBytes: undefined })), /Explicit absent/);
  const walMode = Buffer.from(bytes); walMode[18] = walMode[19] = 2;
  await assert.rejects(prepareSqliteProviderIdentity(request(walMode)), /WAL-mode/);
  const unproven = request(bytes); unproven.capability.rollbackJournalAbsent = false;
  await assert.rejects(prepareSqliteProviderIdentity(unproven), /capability/);
  const expired = request(bytes); expired.capability.assertStopped = async ({ phase }) => phase !== 'sqlite-copy-prepared';
  await assert.rejects(prepareSqliteProviderIdentity(expired), /capability/);
  const emptyWal = await prepareSqliteProviderIdentity(request(bytes, { walBytes: Buffer.alloc(0) }));
  assert.equal(emptyWal.receipt.walDisposition, 'verified-empty');
});
