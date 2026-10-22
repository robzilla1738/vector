import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { checkpointPrivateSqliteSnapshot } from './aux-sqlite-wal-copy.mjs';
import { prepareSqliteProviderIdentity } from './aux-sqlite-provider-identity.mjs';
import { PINNED_PROVIDER_STATE_TARGET_DDL } from './aux-sqlite-provider-identity-schema.mjs';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const model = '{"provider":"aside","modelId":"fixture-only","thinkingLevel":"medium","fastMode":true}';
async function fixture(t, mutate) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'aux-wal-source-fixture-'));
  const filename = path.join(directory, 'state.db'), db = new DatabaseSync(filename);
  t.after(async () => { db.close(); await fs.rm(directory, { recursive: true, force: true }); });
  db.exec('CREATE TABLE projects(id TEXT PRIMARY KEY NOT NULL);'); db.exec(PINNED_PROVIDER_STATE_TARGET_DDL);
  db.exec('PRAGMA user_version=20; PRAGMA journal_mode=WAL; PRAGMA wal_autocheckpoint=0; PRAGMA wal_checkpoint(TRUNCATE);');
  db.exec('BEGIN IMMEDIATE');
  db.prepare('INSERT INTO sessions(id,cwd,model) VALUES(?,?,?)').run('wal-only-session','/synthetic',model);
  db.prepare('INSERT INTO routines(id,type,environment,name,prompt,rrule,status,created_at,updated_at,metadata,session_config) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run('wal-only-routine','standalone','device','Synthetic','Synthetic','FREQ=DAILY','paused',1,2,'{}',`{"model":${model}}`);
  db.exec('COMMIT'); mutate?.(db);
  const databaseBytes = await fs.readFile(filename), walBytes = await fs.readFile(`${filename}-wal`);
  return {
    filename, databaseBytes, walBytes, expectedSha256: sha(databaseBytes), expectedWalSha256: sha(walBytes), rollbackJournalBytes: null,
    capability: { id: 'synthetic-wal-snapshot', disposable: true, exclusive: true, rollbackJournalAbsent: true, assertStopped: async () => true },
  };
}
function read(bytes) {
  const db = new DatabaseSync(':memory:');
  try { db.deserialize(bytes); return { sessions: db.prepare('SELECT id,model FROM sessions ORDER BY id').all().map(row => ({ ...row })), routines: db.prepare('SELECT id,session_config FROM routines ORDER BY id').all().map(row => ({ ...row })) }; }
  finally { db.close(); }
}
test('real committed WAL-only session/routine rows survive private checkpoint and feed provider migration', async t => {
  const f = await fixture(t), originalMain = Buffer.from(f.databaseBytes), originalWal = Buffer.from(f.walBytes);
  // Demonstrate that the committed rows are not in the base main file.
  const base = Buffer.from(originalMain); base[18] = base[19] = 1;
  assert.equal(read(base).sessions.length, 0);
  const result = await checkpointPrivateSqliteSnapshot(f);
  assert.deepEqual(read(result.bytes), { sessions: [{ id: 'wal-only-session', model }], routines: [{ id: 'wal-only-routine', session_config: `{"model":${model}}` }] });
  assert.equal(result.receipt.independentlyProjectedCheckpoint, true); assert.equal(result.receipt.providerMigrationApplied, false);
  assert.ok(result.receipt.frames > 0); assert.equal(result.receipt.committedTransactions, 1);
  assert.equal(result.bytes[18], 1); assert.equal(result.bytes[19], 1);
  assert.deepEqual(f.databaseBytes, originalMain); assert.deepEqual(f.walBytes, originalWal);
  assert.deepEqual(await fs.readFile(f.filename), originalMain); assert.deepEqual(await fs.readFile(`${f.filename}-wal`), originalWal);
  const migrated = await prepareSqliteProviderIdentity({ databaseBytes: result.bytes, expectedSha256: result.receipt.outputSha256, walBytes: null, capability: f.capability });
  assert.equal(JSON.parse(read(migrated.bytes).sessions[0].model).provider, 'aux');
});
test('malformed WAL header, page-size/salt/checksum damage and torn tails are refused without base fallback', async t => {
  const f = await fixture(t);
  for (const mutate of [
    bytes => { bytes[0] ^= 1; return bytes; },
    bytes => { bytes.writeUInt32BE(512, 8); return bytes; },
    bytes => { bytes[32 + 8] ^= 1; return bytes; },
    bytes => { bytes[32 + 24 + 17] ^= 1; return bytes; },
    bytes => bytes.subarray(0, bytes.length - 1),
  ]) {
    const damaged = mutate(Buffer.from(f.walBytes));
    await assert.rejects(checkpointPrivateSqliteSnapshot({ ...f, walBytes: damaged, expectedWalSha256: sha(damaged) }), /WAL/);
  }
  assert.deepEqual(await fs.readFile(`${f.filename}-wal`), f.walBytes);
});
test('missing snapshot hashes, lost capability and rollback journal are explicitly refused', async t => {
  const f = await fixture(t);
  await assert.rejects(checkpointPrivateSqliteSnapshot({ ...f, expectedWalSha256: '0'.repeat(64) }), /expected hashes/);
  await assert.rejects(checkpointPrivateSqliteSnapshot({ ...f, rollbackJournalBytes: Buffer.alloc(0) }), /Rollback-journal/);
  await assert.rejects(checkpointPrivateSqliteSnapshot({ ...f, capability: { ...f.capability, assertStopped: async () => false } }), /capability/);
  await assert.rejects(checkpointPrivateSqliteSnapshot({ ...f, capability: { ...f.capability, assertStopped: async ({ phase }) => phase !== 'wal-copy-prepared' } }), /capability/);
});
function rewriteChecksums(wal, bigEndian) {
  const result = Buffer.from(wal); result.writeUInt32BE(bigEndian ? 0x377f0683 : 0x377f0682, 0);
  let first = 0, second = 0;
  function add(start, length) {
    for (let at = start; at < start + length; at += 8) {
      first = (first + (bigEndian ? result.readUInt32BE(at) : result.readUInt32LE(at)) + second) >>> 0;
      second = (second + (bigEndian ? result.readUInt32BE(at + 4) : result.readUInt32LE(at + 4)) + first) >>> 0;
    }
  }
  add(0, 24); result.writeUInt32BE(first, 24); result.writeUInt32BE(second, 28);
  const page = result.readUInt32BE(8);
  for (let offset = 32; offset < result.length; offset += 24 + page) {
    add(offset, 8); add(offset + 24, page);
    result.writeUInt32BE(first, offset + 16); result.writeUInt32BE(second, offset + 20);
  }
  return result;
}
test('both checksum byte orders work; a checksum-valid uncommitted tail is explicitly refused', async t => {
  const f = await fixture(t);
  const bigEndian = rewriteChecksums(f.walBytes, true);
  const result = await checkpointPrivateSqliteSnapshot({ ...f, walBytes: bigEndian, expectedWalSha256: sha(bigEndian) });
  assert.equal(read(result.bytes).sessions[0].id, 'wal-only-session');
  const size = f.walBytes.readUInt32BE(8), extra = Buffer.from(f.walBytes.subarray(f.walBytes.length - 24 - size));
  extra.writeUInt32BE(0, 4);
  const uncommitted = rewriteChecksums(Buffer.concat([f.walBytes, extra]), false);
  await assert.rejects(checkpointPrivateSqliteSnapshot({ ...f, walBytes: uncommitted, expectedWalSha256: sha(uncommitted) }), /uncommitted WAL tail/);
});
test('schema validation still rejects committed unknown triggers after a valid private WAL checkpoint', async t => {
  const f = await fixture(t, db => db.exec('CREATE TRIGGER unknown_model_update AFTER UPDATE ON sessions BEGIN SELECT 1; END'));
  await assert.rejects(checkpointPrivateSqliteSnapshot(f), /Unknown or unfinished/);
  assert.deepEqual(await fs.readFile(f.filename), f.databaseBytes);
  assert.deepEqual(await fs.readFile(`${f.filename}-wal`), f.walBytes);
});
