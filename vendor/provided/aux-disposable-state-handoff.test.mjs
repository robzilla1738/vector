import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { prepareAuxDisposableStateHandoff } from './aux-disposable-state-handoff.mjs';
import { createStateMigrationId, commitStateMigration, recoverStateMigration, verifyStateMigration } from './aux-state-migration-transaction.mjs';
import { PINNED_PROVIDER_STATE_TARGET_DDL } from './aux-sqlite-provider-identity-schema.mjs';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const model = { provider: 'aside', modelId: 'fixture-only-model', thinkingLevel: 'medium', fastMode: true };
async function fixture(t) {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'aux-handoff-fixture-'));
  t.after(() => fs.rm(temporary, { recursive: true, force: true }));
  const parent = await fs.realpath(temporary), root = path.join(parent, 'stopped-copy');
  await fs.mkdir(root, { mode: 0o700 });
  const producer = path.join(parent, 'producer.db'), db = new DatabaseSync(producer);
  let dbBytes, walBytes, shmBytes;
  try {
    db.exec('CREATE TABLE projects(id TEXT PRIMARY KEY NOT NULL);'); db.exec(PINNED_PROVIDER_STATE_TARGET_DDL);
    db.exec('PRAGMA user_version=20; PRAGMA journal_mode=WAL; PRAGMA wal_autocheckpoint=0; PRAGMA wal_checkpoint(TRUNCATE);');
    db.prepare('INSERT INTO sessions(id,cwd,model,queued_messages) VALUES(?,?,?,?)').run('wal-only-handoff-session','/synthetic',JSON.stringify(model),'[{"provider":"aside","scope":"unaudited"}]');
    dbBytes = await fs.readFile(producer); walBytes = await fs.readFile(`${producer}-wal`); shmBytes = await fs.readFile(`${producer}-shm`);
  } finally { db.close(); }
  const files = [
    ['home/u/1/state.db', dbBytes], ['home/u/1/state.db-wal', walBytes], ['home/u/1/state.db-shm', shmBytes],
    ['home/u/1/settings.json', Buffer.from(JSON.stringify({ defaultModel: model, glass: { opacity: 0.22 } }))],
    ['home/u/1/credentials.json', Buffer.from('{"aside":{"type":"api_key","key":"synthetic-private-fixture"}}')],
    ['browser/Default/Preferences', Buffer.from(JSON.stringify({ aside: { profile_id: 'stable-fixture-profile', account_id: 1, account_user_id: 'fixture-user', vertical_tabs: { bookmarks_section_expanded: false } }, aux: { sidebar: { collapsed: true, hover: true }, cloud_cookie_restore: { revision: 8 } }, browser: { window_placement: { left: 30, top: 50 } } }))],
    ['browser/Local State', Buffer.from('{"aside":{"onboarding_completed":true,"vertical_tabs":{"profile_order":["Default"]}},"profile":{"last_used":"Default"}}')],
  ];
  for (const [relative, bytes] of files) { const filename = path.join(root, relative); await fs.mkdir(path.dirname(filename), { recursive: true, mode: 0o700 }); await fs.writeFile(filename, bytes, { mode: 0o600 }); }
  const value = relative => { const bytes = files.find(([name]) => name === relative)[1]; return { bytes, expectedSha256: sha(bytes) }; };
  return {
    root, transactionId: createStateMigrationId(), paths: { auxHome: 'home', browserUserData: 'browser' }, files,
    capability: { root, id: 'fixture-stopped-exclusive-root', disposable: true, exclusive: true, rollbackJournalAbsent: true, assertStopped: async () => true },
    jsonSnapshots: [
      { kind: 'provider-json', logicalPath: 'u/1/settings.json', ...value('home/u/1/settings.json') },
      { kind: 'provider-json', logicalPath: 'u/1/credentials.json', ...value('home/u/1/credentials.json') },
      { kind: 'profile-preferences', profileDirectory: 'Default', ...value('browser/Default/Preferences') },
      { kind: 'local-state', ...value('browser/Local State') },
    ],
    sqliteSnapshots: [{ accountId: 1, database: value('home/u/1/state.db'), wal: { ...value('home/u/1/state.db-wal'), disposition: 'present', replacement: 'empty-reviewed' }, shm: { ...value('home/u/1/state.db-shm'), disposition: 'present', replacement: 'empty-reviewed' }, rollbackJournal: 'absent' }],
  };
}
const crashAtMain = ({ stage, index }) => { if (stage === 'renamed-new-file' && index === 4) throw Error('synthetic crash after main before sidecars'); };
async function verifyBackups(f, prepared) {
  for (const [index, entry] of prepared.receipt.preparedFiles.entries()) {
    const actual = await fs.readFile(path.join(f.root, `.aux-state-migration-${f.transactionId}`, `${index}.original`));
    assert.equal(sha(actual), entry.beforeSha256);
  }
}
test('WAL-only row + JSON/prefs migrate through crash recovery before any fixture database open', async t => {
  const f = await fixture(t), prepared = await prepareAuxDisposableStateHandoff(f);
  assert.equal(prepared.receipt.status, 'prepared-not-committed'); assert.equal(prepared.receipt.startupVerified, false);
  const main = prepared.receipt.preparedFiles.find(file => file.path === 'home/u/1/state.db');
  assert.equal(main.beforeSha256, f.sqliteSnapshots[0].database.expectedSha256);
  await assert.rejects(commitStateMigration({ ...f, onCheckpoint: crashAtMain }), /synthetic crash/);
  // Deliberately do not open a mixed SQLite state. Its original WAL still exists.
  assert.equal(sha(await fs.readFile(path.join(f.root, 'home/u/1/state.db-wal'))), f.sqliteSnapshots[0].wal.expectedSha256);
  const committed = await recoverStateMigration({ ...f, action: 'complete' });
  assert.equal((await verifyStateMigration({ ...f, expectedReceiptSha256: committed.receiptSha256 })).verified, true);
  await verifyBackups(f, prepared);
  for (const sidecar of ['wal', 'shm']) assert.equal((await fs.readFile(path.join(f.root, `home/u/1/state.db-${sidecar}`))).length, 0);
  const prefs = JSON.parse(await fs.readFile(path.join(f.root, 'browser/Default/Preferences'), 'utf8'));
  assert.equal(prefs.aux.profile_id, 'stable-fixture-profile'); assert.equal(prefs.aux.vertical_tabs.bookmarks_section_expanded, false);
  assert.deepEqual(prefs.aux.sidebar, { collapsed: true, hover: true }); assert.deepEqual(prefs.browser.window_placement, { left: 30, top: 50 });
  assert.equal(JSON.parse(await fs.readFile(path.join(f.root, 'home/u/1/settings.json'), 'utf8')).defaultModel.provider, 'aux');
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(f.root, 'home/u/1/credentials.json'), 'utf8')), { aux: { type: 'api_key', key: 'synthetic-private-fixture' } });
  const db = new DatabaseSync(path.join(f.root, 'home/u/1/state.db'));
  try {
    const row = db.prepare('SELECT model,queued_messages FROM sessions WHERE id=?').get('wal-only-handoff-session');
    assert.deepEqual(JSON.parse(row.model), { ...model, provider: 'aux' });
    assert.equal(JSON.parse(row.queued_messages)[0].provider, 'aside'); // Explicit remaining audit gap.
    assert.equal(db.prepare('PRAGMA quick_check').get().quick_check, 'ok');
    assert.equal(db.prepare('PRAGMA journal_mode=WAL').get().journal_mode, 'wal');
    db.prepare('UPDATE sessions SET title=? WHERE id=?').run('fixture restart write', 'wal-only-handoff-session');
    assert.equal(db.prepare('SELECT title FROM sessions').get().title, 'fixture restart write');
  } finally { db.close(); }
  await verifyBackups(f, prepared);
});
test('rollback after main replacement restores exact original main/WAL/SHM and legacy row', async t => {
  const f = await fixture(t), prepared = await prepareAuxDisposableStateHandoff(f);
  await assert.rejects(commitStateMigration({ ...f, onCheckpoint: crashAtMain }), /synthetic crash/);
  const rolledBack = await recoverStateMigration({ ...f, action: 'rollback' });
  assert.equal((await verifyStateMigration({ ...f, expectedReceiptSha256: rolledBack.receiptSha256 })).verified, true);
  for (const [relative, bytes] of f.files) assert.deepEqual(await fs.readFile(path.join(f.root, relative)), bytes);
  await verifyBackups(f, prepared);
  const db = new DatabaseSync(path.join(f.root, 'home/u/1/state.db'));
  try { assert.equal(JSON.parse(db.prepare('SELECT model FROM sessions').get().model).provider, 'aside'); assert.equal(db.prepare('PRAGMA quick_check').get().quick_check, 'ok'); }
  finally { db.close(); }
});
test('unknown sidecar disposition, unreviewed reset and lost writer scope refuse without target changes', async t => {
  const f = await fixture(t);
  const unknown = structuredClone(f.sqliteSnapshots); unknown[0].shm.disposition = 'unknown';
  await assert.rejects(prepareAuxDisposableStateHandoff({ ...f, sqliteSnapshots: unknown }), /disposition/);
  const absent = structuredClone(f.sqliteSnapshots); absent[0].wal.disposition = 'absent';
  await assert.rejects(prepareAuxDisposableStateHandoff({ ...f, sqliteSnapshots: absent }), /disposition/);
  const unreviewed = structuredClone(f.sqliteSnapshots); delete unreviewed[0].wal.replacement;
  await assert.rejects(prepareAuxDisposableStateHandoff({ ...f, sqliteSnapshots: unreviewed }), /disposition/);
  await assert.rejects(prepareAuxDisposableStateHandoff({ ...f, capability: { ...f.capability, assertStopped: async () => false } }), /scope/);
  for (const [relative, bytes] of f.files) assert.deepEqual(await fs.readFile(path.join(f.root, relative)), bytes);
});
