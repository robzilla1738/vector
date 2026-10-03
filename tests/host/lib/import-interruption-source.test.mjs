import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createImportSourceOwner, createImportInterruptionSourceHome, readImportSourceHome, disposeImportSourceHome } from './import-source-home.mjs';
import { IMPORT_INTERRUPTION_ROWS } from './import-interruption-source.mjs';
function fixture(t) {
  const root = mkdtempSync('/tmp/aux-native-journey-'); t.after(() => rmSync(root, { recursive: true, force: true }));
  const profile = join(root, 'profile'); mkdirSync(profile, { mode: 0o700 });
  const owner = createImportSourceOwner(profile), lease = createImportInterruptionSourceHome(owner, 'http://127.0.0.1:32123/');
  return { owner, lease, receipt: readImportSourceHome(lease, owner) };
}
test('fixed5001 SQLite cohort has exact unique source rows, timestamps, hashes and unchanged1MiB cap', t => {
  const { owner, lease, receipt } = fixture(t);
  assert.equal(receipt.cohort, 'interruption-history-5001'); assert.deepEqual(receipt.counts, { bookmarks: 1, history: IMPORT_INTERRUPTION_ROWS });
  const path = receipt.files[1].path; assert.ok(statSync(path).size <= 1048576);
  const db = new DatabaseSync(path, { readOnly: true });
  try {
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM urls').get().n, 5001);
    assert.equal(db.prepare('SELECT COUNT(DISTINCT url) AS n FROM urls').get().n, 5001);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM visits').get().n, 5001);
    assert.equal(db.prepare('SELECT url FROM urls WHERE id=1').get().url, 'http://127.0.0.1:32123/setup/interrupt-history/1');
    assert.equal(db.prepare('SELECT url FROM urls WHERE id=5001').get().url, 'http://127.0.0.1:32123/setup/interrupt-history/5001');
    assert.equal(db.prepare('SELECT MAX(visit_time)-MIN(visit_time) AS span FROM visits').get().span, 5000000000);
    assert.equal(db.prepare('SELECT COUNT(DISTINCT visit_time) AS n FROM visits').get().n, 5001);
  } finally { db.close(); }
  assert.strictEqual(readImportSourceHome(lease, owner), receipt);
  console.info(`Fixed SQLite bytes: ${statSync(path).size}`);
  disposeImportSourceHome(lease, owner); assert.equal(existsSync(receipt.home), false);
});
test('changed large original source refuses cleanup and retains actual files', t => {
  const { owner, lease, receipt } = fixture(t);
  writeFileSync(receipt.files[0].path, '{}');
  assert.throws(() => readImportSourceHome(lease, owner), /changed/);
  assert.throws(() => disposeImportSourceHome(lease, owner), /changed/);
  assert.equal(existsSync(receipt.files[1].path), true);
});
