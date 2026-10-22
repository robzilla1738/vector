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
import { PINNED_CONTEXT_LEDGER_DDL } from './aux-context-ledger-schema.mjs';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const transcriptPath = 'home/u/1/sessions/2026-10-22_fixture-session/messages.jsonl';
const transcript = Buffer.from(JSON.stringify({role:'user',content:'aside prose remains unchanged',timestamp:1}) + '\r\n' + JSON.stringify({role:'assistant',provider:'aside',api:'aside-provider',model:'fixture-only-model',content:[{type:'text',text:'original',textSignature:'retain'},{type:'toolCall',id:'unchanged',name:'subagent',arguments:{model:{provider:'aside',modelId:'opaque-retain'}}}],timestamp:2,stopReason:'toolUse'}) + '\n');
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
    [transcriptPath, transcript],
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
    transcriptSnapshots: [{ accountId: 1, sessionId: 'fixture-session', storageDate: '2026-10-22', ...value(transcriptPath) }],
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
  const migratedTranscript = await fs.readFile(path.join(f.root, transcriptPath));
  assert.equal(migratedTranscript.length, transcript.length);
  const offsets = bytes => { const entries = []; let start = 0; for (let end = bytes.indexOf(10); end !== -1; end = bytes.indexOf(10, start)) { entries.push({ id: String(start), jsonlReadSize: end-start+1, msg: JSON.parse(bytes.toString('utf8', start, end)) }); start = end+1; } return entries; };
  const beforeRows = offsets(transcript), afterRows = offsets(migratedTranscript);
  assert.deepEqual(afterRows.map(({id,jsonlReadSize})=>({id,jsonlReadSize})), beforeRows.map(({id,jsonlReadSize})=>({id,jsonlReadSize})));
  assert.deepEqual(afterRows[0], beforeRows[0]);
  assert.deepEqual(afterRows[1].msg, {...beforeRows[1].msg, provider:'aux', api:'aux-provider'});
  assert.equal(afterRows[1].msg.content[1].arguments.model.provider, 'aside');
  const transcriptReceipt = prepared.receipt.transformations.find(entry=>entry.path===transcriptPath).transcriptMigration;
  assert.equal(transcriptReceipt.byteOffsetsPreserved, true); assert.equal(transcriptReceipt.sourceSha256, sha(transcript));
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
test('context-ledger WAL-only historical events pair with the same crash journal and Aux DOM filter', async t => {
  const f = await fixture(t), producer = path.join(path.dirname(f.root), 'ledger-producer.db');
  const db = new DatabaseSync(producer);
  const target = ' {"targetId":"fixture-target","opaque":"aside_dom"} ', payload = ' {"kind":"content.snapshot","extra":[1,2,3]} ';
  let main, wal, shm;
  try {
    db.exec(PINNED_CONTEXT_LEDGER_DDL); db.exec('PRAGMA user_version=1; PRAGMA journal_mode=WAL; PRAGMA wal_autocheckpoint=0; PRAGMA wal_checkpoint(TRUNCATE); BEGIN IMMEDIATE;');
    db.prepare('INSERT INTO context_awareness_blobs(id,content_hash,content,redacted_bytes,created_at,last_seen_at) VALUES(?,?,?,?,?,?)').run('fixture-blob','fixture-hash',Buffer.from([0,255,7]),3,10,11);
    db.prepare('INSERT INTO context_awareness_frames(id,content,member_count,stored_bytes,created_at) VALUES(?,?,?,?,?)').run('fixture-frame',Buffer.from([9,8]),1,2,10);
    db.prepare('INSERT INTO context_awareness_events(id,occurred_at,source,kind,target,payload,blob_id,session_id) VALUES(?,?,?,?,?,?,?,?)').run('wal-only-ledger-event',12,'aside_dom','content.snapshot',target,payload,'fixture-blob','fixture-session');
    db.prepare('INSERT INTO context_awareness_events(id,occurred_at,source,kind,payload) VALUES(?,?,?,?,?)').run('native-ledger-event',13,'mac_ax','session.started','{}');
    db.prepare('INSERT INTO context_awareness_summaries(id,kind,window_from,window_to,created_at,updated_at,body) VALUES(?,?,?,?,?,?,?)').run('fixture-summary','glance',0,1,10,11,'opaque summary content');
    db.exec('COMMIT');
    main = await fs.readFile(producer); wal = await fs.readFile(`${producer}-wal`); shm = await fs.readFile(`${producer}-shm`);
  } finally { db.close(); }
  // Prove the historical event needs committed WAL, not a base-only fallback.
  const base = Buffer.from(main); base[18] = base[19] = 1;
  const baseReader = new DatabaseSync(':memory:');
  try { baseReader.deserialize(base); assert.equal(baseReader.prepare('SELECT count(*) n FROM context_awareness_events').get().n, 0); }
  finally { baseReader.close(); }
  const location = 'home/u/1/context-awareness/ledger.db';
  for (const [suffix, bytes] of [['', main], ['-wal', wal], ['-shm', shm]]) {
    const relative = location + suffix; await fs.mkdir(path.dirname(path.join(f.root, relative)), { recursive: true, mode: 0o700 });
    await fs.writeFile(path.join(f.root, relative), bytes, { mode: 0o600 }); f.files.push([relative, bytes]);
  }
  f.sqliteSnapshots.push({ accountId: 1, databaseKind: 'context-ledger', database: { bytes: main, expectedSha256: sha(main) }, wal: { bytes: wal, expectedSha256: sha(wal), disposition: 'present', replacement: 'empty-reviewed' }, shm: { bytes: shm, expectedSha256: sha(shm), disposition: 'present', replacement: 'empty-reviewed' }, rollbackJournal: 'absent' });
  const prepared = await prepareAuxDisposableStateHandoff(f);
  const ledger = prepared.receipt.transformations.find(item => item.databaseKind === 'context-ledger');
  assert.equal(ledger.checkpoint.databaseKind, 'context-ledger'); assert.equal(ledger.checkpoint.identityMigrationApplied, false);
  assert.equal(ledger.contextLedgerMigration.changedRows, 1);
  assert.equal(ledger.lineage.originalMainSha256, sha(main)); assert.equal(ledger.lineage.originalWalSha256, sha(wal));
  assert.equal(ledger.lineage.checkpointedMainSha256, ledger.lineage.identitySourceSha256); assert.equal(ledger.lineage.walCheckpointLineageVerified, true);
  await assert.rejects(commitStateMigration({ ...f, onCheckpoint: ({ stage, index }) => { if (stage === 'renamed-new-file' && index === 7) throw Error('ledger mixed-state crash'); } }), /mixed-state crash/);
  const committed = await recoverStateMigration({ ...f, action: 'complete' });
  assert.equal((await verifyStateMigration({ ...f, expectedReceiptSha256: committed.receiptSha256 })).verified, true);
  await verifyBackups(f, prepared);
  for (const suffix of ['-wal', '-shm']) assert.equal((await fs.readFile(path.join(f.root, location + suffix))).length, 0);
  const reader = new DatabaseSync(path.join(f.root, location));
  try {
    const event = reader.prepare('SELECT * FROM context_awareness_events WHERE source=?').all('aux_dom');
    assert.equal(event.length, 1); assert.equal(event[0].id, 'wal-only-ledger-event');
    assert.equal(event[0].target, target); assert.equal(event[0].payload, payload); assert.equal(event[0].occurred_at, 12);
    assert.equal(event[0].blob_id, 'fixture-blob'); assert.equal(event[0].session_id, 'fixture-session');
    assert.equal(reader.prepare('SELECT source FROM context_awareness_events WHERE id=?').get('native-ledger-event').source, 'mac_ax');
    assert.deepEqual(Buffer.from(reader.prepare('SELECT content FROM context_awareness_blobs').get().content), Buffer.from([0,255,7]));
    assert.deepEqual(Buffer.from(reader.prepare('SELECT content FROM context_awareness_frames').get().content), Buffer.from([9,8]));
    assert.equal(reader.prepare('SELECT body FROM context_awareness_summaries').get().body, 'opaque summary content');
    assert.equal(reader.prepare('PRAGMA quick_check').get().quick_check, 'ok');
    assert.equal(reader.prepare('PRAGMA foreign_key_check').all().length, 0);
  } finally { reader.close(); }
  assert.equal(prepared.receipt.startupVerified, false);
});

test('transcript route and combined target budget refuse unreviewed layouts before journal writes', async t => {
  const f = await fixture(t), descriptor = f.transcriptSnapshots[0];
  for (const patch of [{sessionId:'../escape'},{storageDate:'2026-02-30'},{storageDate:'fixture-session'},{accountId:-1}]) await assert.rejects(prepareAuxDisposableStateHandoff({...f,transcriptSnapshots:[{...descriptor,...patch}]}),/canonical/);
  await assert.rejects(prepareAuxDisposableStateHandoff({...f,transcriptSnapshots:Array.from({length:122},()=>descriptor)}),/bounded/);
  for (const [relative, bytes] of f.files) assert.deepEqual(await fs.readFile(path.join(f.root, relative)), bytes);
});
