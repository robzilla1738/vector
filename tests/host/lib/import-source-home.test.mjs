import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, renameSync, symlinkSync, unlinkSync, chmodSync, linkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createImportSourceOwner, createImportSourceHome, readImportSourceHome, disposeImportSourceHome, importSourceEnvironment } from './import-source-home.mjs';
function fixture(t) {
  const root = mkdtempSync('/tmp/aux-native-journey-');
  const profile = join(root, 'profile'); mkdirSync(profile, { mode: 0o700 });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const owner = createImportSourceOwner(profile);
  const lease = createImportSourceHome(owner, 'http://127.0.0.1:32123/');
  return { root, profile, owner, lease, receipt: readImportSourceHome(lease, owner) };
}
test('original lease contains only actual synthetic Chrome bookmark and SQLite visit, with stable restart readback', t => {
  const { root, profile, owner, lease, receipt } = fixture(t);
  assert.deepEqual(receipt.categories, ['bookmarks', 'history']);
  assert.deepEqual(receipt.counts, { bookmarks: 1, history: 1 });
  assert.equal(receipt.source, 'chrome'); assert.equal(receipt.profile, 'Default');
  const bookmarks = JSON.parse(readFileSync(receipt.files[0].path));
  assert.equal(bookmarks.roots.bookmark_bar.children[0].url, 'http://127.0.0.1:32123/setup/bookmark');
  const db = new DatabaseSync(receipt.files[1].path, { readOnly: true });
  try { assert.deepEqual({ ...db.prepare('SELECT u.url,v.id FROM visits v JOIN urls u ON v.url=u.id').get() }, { url: 'http://127.0.0.1:32123/setup/history', id: 1 }); } finally { db.close(); }
  // Browser startup may legitimately add Profile children and change parent nlink.
  mkdirSync(join(profile, 'Default'), { mode: 0o700 }); mkdirSync(join(root, 'runtime'), { mode: 0o700 });
  assert.strictEqual(readImportSourceHome(lease, owner), receipt);
  assert.equal(Object.isFrozen(receipt.files[0]), true);
  disposeImportSourceHome(lease, owner);
  assert.equal(existsSync(receipt.home), false); assert.equal(existsSync(join(profile, 'Default')), true);
  assert.throws(() => readImportSourceHome(lease, owner), /retired/);
});
test('forged, copied and foreign-owner lease cannot read or clean original files', t => {
  const { owner, lease, receipt } = fixture(t);
  for (const [candidate, holder] of [[{}, owner], [{ ...lease }, owner], [lease, {}]]) {
    assert.throws(() => readImportSourceHome(candidate, holder), /Foreign/);
    assert.throws(() => disposeImportSourceHome(candidate, holder), /Foreign/);
  }
  assert.equal(existsSync(receipt.files[0].path), true);
});
test('changed file refuses admission and cleanup without deleting original source', t => {
  const { owner, lease, receipt } = fixture(t);
  writeFileSync(receipt.files[0].path, '{}');
  assert.throws(() => readImportSourceHome(lease, owner), /changed/);
  assert.throws(() => disposeImportSourceHome(lease, owner), /changed/);
  assert.equal(existsSync(receipt.files[1].path), true);
});
test('unknown secret-shaped file refuses cleanup and retains lease for original inspection', t => {
  const { owner, lease, receipt } = fixture(t);
  const unknown = join(receipt.home, 'Library/Application Support/Google/Chrome/Default/Login Data');
  writeFileSync(unknown, 'synthetic unknown', { mode: 0o600 });
  assert.throws(() => disposeImportSourceHome(lease, owner), /Unknown/);
  assert.equal(existsSync(receipt.files[0].path), true);
  unlinkSync(unknown); assert.strictEqual(readImportSourceHome(lease, owner), receipt);
});
test('symlink, hardlink and permissive source files are refused', t => {
  const { root, owner, lease, receipt } = fixture(t);
  const path = receipt.files[0].path, backup = join(root, 'backup');
  renameSync(path, backup); symlinkSync(backup, path);
  assert.throws(() => readImportSourceHome(lease, owner), /identity/);
  assert.throws(() => disposeImportSourceHome(lease, owner), /identity/);
  unlinkSync(path); renameSync(backup, path);
  linkSync(path, backup); assert.throws(() => readImportSourceHome(lease, owner), /identity/);
  unlinkSync(backup); chmodSync(path, 0o644); assert.throws(() => readImportSourceHome(lease, owner), /identity/);
});
test('replaced source tree cannot be adopted or cleaned', t => {
  const { owner, lease, receipt } = fixture(t);
  renameSync(receipt.home, `${receipt.home}-original`); mkdirSync(receipt.home, { mode: 0o700 });
  assert.throws(() => readImportSourceHome(lease, owner), /replaced/);
  assert.throws(() => disposeImportSourceHome(lease, owner), /replaced/);
  assert.equal(existsSync(`${receipt.home}-original`), true); assert.equal(existsSync(receipt.home), true);
});
test('real HOME, foreign root, symlinked Profile and non-loopback sources are never admitted', t => {
  const { root, profile } = fixture(t);
  assert.throws(() => createImportSourceOwner(process.env.HOME), /disposable/);
  assert.throws(() => createImportSourceHome(createImportSourceOwner(profile), 'https://example.com/'), /loopback/);
  const foreign = join(root, 'foreign'); mkdirSync(foreign, { mode: 0o700 });
  assert.throws(() => createImportSourceOwner(foreign), /disposable/);
  renameSync(profile, `${profile}-original`); symlinkSync(`${profile}-original`, profile);
  assert.throws(() => createImportSourceOwner(profile), /disposable/);
});
test('inherited override stripped, caller override refused, unrelated environment preserved', () => {
  assert.deepEqual(importSourceEnvironment({ AUX_IMPORT_SOURCE_HOME: '/foreign', PATH: '/original' }, { AUX_RUN_ENGINE: 'agent-loop' }), { PATH: '/original', AUX_RUN_ENGINE: 'agent-loop' });
  assert.throws(() => importSourceEnvironment({}, { AUX_IMPORT_SOURCE_HOME: '/foreign' }), /original App lease/);
});

test('original App proxy adapter refuses source env even alongside all three legitimate transport keys', async () => {
  const { validateFixtureEnv } = await import('./app.mjs');
  assert.throws(() => validateFixtureEnv({ HTTPS_PROXY: 'http://127.0.0.1:32123/', NODE_EXTRA_CA_CERTS: '/synthetic', NODE_USE_ENV_PROXY: '1', AUX_IMPORT_SOURCE_HOME: '/foreign' }, 'http://127.0.0.1:32123/', '/unused'), /only the owned loopback/);
});

test('App-original Profile identity captured before preparation refuses later replacement', t => {
  const root = mkdtempSync('/tmp/aux-native-journey-');
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const profile = join(root, 'profile'); mkdirSync(profile, { mode: 0o700 });
  const owner = createImportSourceOwner(profile);
  renameSync(profile, `${profile}-original`); mkdirSync(profile, { mode: 0o700 });
  assert.throws(() => createImportSourceHome(owner, 'http://127.0.0.1:32123/'), /replaced/);
  assert.equal(existsSync(join(profile, 'import-source-home')), false);
  assert.throws(() => createImportSourceHome({}, 'http://127.0.0.1:32123/'), /Foreign/);
});
