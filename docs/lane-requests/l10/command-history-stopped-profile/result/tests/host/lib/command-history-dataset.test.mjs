// Controlled disposable SQLite schemas/rows, not native History qualification.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import vm from 'node:vm';
import ts from 'typescript';
const source = fs.readFileSync(new URL('./command-history-dataset.mjs', import.meta.url), 'utf8');
const nativeSchema = 'CREATE TABLE urls(id INTEGER PRIMARY KEY AUTOINCREMENT,url LONGVARCHAR,title LONGVARCHAR,visit_count INTEGER DEFAULT 0 NOT NULL,typed_count INTEGER DEFAULT 0 NOT NULL,last_visit_time INTEGER NOT NULL,hidden INTEGER DEFAULT 0 NOT NULL); CREATE TABLE visits(id INTEGER PRIMARY KEY AUTOINCREMENT,url INTEGER NOT NULL,visit_time INTEGER NOT NULL,from_visit INTEGER,external_referrer_url TEXT,transition INTEGER DEFAULT 0 NOT NULL,visit_duration INTEGER DEFAULT 0 NOT NULL,opener_visit INTEGER);';
async function fixture(body, seed = false) {
  const root = fs.realpathSync(fs.mkdtempSync('/private/tmp/aux-native-journey-history-')), profile = path.join(root, 'profile'), directory = path.join(profile, 'Default');
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 }); fs.chmodSync(profile, 0o700);
  const file = path.join(directory, 'History'), db = new DatabaseSync(file); db.exec(nativeSchema);
  if (seed) db.exec("INSERT INTO urls VALUES(1,'http://127.0.0.1:1234/command-history/native-seed','Original native seed',1,0,13344473500000000,0); INSERT INTO visits(id,url,visit_time) VALUES(1,1,13344473500000000);");
  db.close(); fs.chmodSync(file, 0o600);
  const pin = filename => { const row = fs.lstatSync(filename); return { dev: row.dev, ino: row.ino, uid: row.uid, mode: row.mode & 0o777 }; };
  const receipts = new WeakMap(), lease = {}, state = { active: true };
  const receipt = { fixtureId: 'a'.repeat(32), userDataDir: profile, profile: 'Default', generation: 1, originalChild: { pid: 42, generation: 1, closed: true, code: 0, signal: 'SIGTERM' }, root: { realpath: root, ...pin(root) }, directory: pin(profile) };
  receipts.set(lease, receipt);
  const exports = {}, imports = { 'node:assert/strict': assert, 'node:fs': fs, 'node:crypto': crypto, 'node:path': path, 'node:sqlite': { DatabaseSync }, './app.mjs': { readStoppedCommandProfile(value) { assert.ok(state.active && receipts.has(value), 'Original stopped Profile retired/foreign'); return structuredClone(receipts.get(value)); } } };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText,
    { exports, Buffer, URL, process: { getuid: process.getuid }, structuredClone, require(name) { assert.ok(imports[name], name); return imports[name]; } });
  try { await body({ ...exports, lease, receipt, receipts, file, root, state }); } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
test('actual fixed 50000 SQLite rows/counts/schema/hash readback retains original seeded row and App lineage', () => fixture(f => {
  const dataset = f.prepareCommandHistoryDataset(f.lease, 'http://127.0.0.1:1234/');
  const read = f.readCommandHistoryDataset(dataset, f.lease); assert.equal(read.actual.urlCount, 50000); assert.equal(read.actual.visitCount, 50000); assert.match(read.actual.rowsSha256, /^[a-f0-9]{64}$/); assert.equal(read.nativeQualificationProven, false);
  const next = {}; f.receipts.set(next, { ...f.receipt, generation: 2, originalChild: { ...f.receipt.originalChild, generation: 2, pid: 43 } });
  assert.equal(f.readCommandHistoryDataset(dataset, next).profile.generation, 2);
  const foreign = {}; f.receipts.set(foreign, { ...f.receipt, fixtureId: 'b'.repeat(32) }); assert.throws(() => f.readCommandHistoryDataset(dataset, foreign), /Different original/);
}, true));
test('changed row/timestamp cannot retain original dataset proof', () => fixture(f => {
  const dataset = f.prepareCommandHistoryDataset(f.lease, 'http://127.0.0.1:1234/');
  const db = new DatabaseSync(f.file); db.exec('UPDATE visits SET visit_time=visit_time+1 WHERE id=1'); db.close();
  assert.throws(() => f.readCommandHistoryDataset(dataset, f.lease));
}));
test('foreign initial rows refuse without deleting or replacing original database', () => fixture(f => {
  const db = new DatabaseSync(f.file); db.exec("INSERT INTO urls(url,last_visit_time) VALUES('https://foreign.invalid/',1)"); db.close(); const before = fs.readFileSync(f.file);
  assert.throws(() => f.prepareCommandHistoryDataset(f.lease, 'http://127.0.0.1:1234/'), error => error.cleanupDebt === true && error.stoppedProfileLease === f.lease);
  assert.deepEqual(fs.readFileSync(f.file), before);
}));
test('unknown journal and symlink refuse without modifying either original entry', () => fixture(f => {
  const unknown = f.file + '-wal'; fs.writeFileSync(unknown, 'unknown retained debt');
  assert.throws(() => f.prepareCommandHistoryDataset(f.lease, 'http://127.0.0.1:1234/')); assert.equal(fs.readFileSync(unknown, 'utf8'), 'unknown retained debt'); fs.unlinkSync(unknown);
  fs.renameSync(f.file, f.file + '.original'); fs.symlinkSync(f.file + '.original', f.file);
  assert.throws(() => f.prepareCommandHistoryDataset(f.lease, 'http://127.0.0.1:1234/')); assert.ok(fs.lstatSync(f.file).isSymbolicLink());
}));
test('real transaction failure rolls back and retains original primary and owned Profile debt', () => fixture(f => {
  const db = new DatabaseSync(f.file); db.exec("CREATE TRIGGER controlled_failure BEFORE INSERT ON visits BEGIN SELECT RAISE(ABORT,'controlled write refused'); END"); db.close();
  assert.throws(() => f.prepareCommandHistoryDataset(f.lease, 'http://127.0.0.1:1234/'), error => error.cleanupDebt === true && error.cause.message.includes('controlled write refused'));
  const check = new DatabaseSync(f.file); try { assert.equal(check.prepare('SELECT COUNT(*) AS n FROM urls').get().n, 0); assert.equal(check.prepare('SELECT COUNT(*) AS n FROM visits').get().n, 0); } finally { check.close(); }
}));
test('retired/forged stopped lease and caller-selected URL/count reject before workload writes', () => fixture(f => {
  const before = fs.readFileSync(f.file); assert.throws(() => f.prepareCommandHistoryDataset({}, 'http://127.0.0.1:1234/'));
  assert.throws(() => f.prepareCommandHistoryDataset(f.lease, 'https://foreign.invalid/'));
  assert.throws(() => f.prepareCommandHistoryDataset(f.lease, 'http://127.0.0.1:1234/', 10), /selectors/);
  f.state.active = false; assert.throws(() => f.prepareCommandHistoryDataset(f.lease, 'http://127.0.0.1:1234/')); assert.deepEqual(fs.readFileSync(f.file), before);
}));
