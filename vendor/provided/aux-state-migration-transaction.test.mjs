import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { createStateMigrationId, prepareStateMigration, commitStateMigration, recoverStateMigration, verifyStateMigration } from './aux-state-migration-transaction.mjs';

const sha = value => createHash('sha256').update(value).digest('hex');
async function fixture(t) {
  const parent = await fs.mkdtemp(path.join(os.tmpdir(), 'aux-state-tx-fixture-'));
  t.after(() => fs.rm(parent, { recursive: true, force: true }));
  const root = await fs.realpath(parent);
  await fs.mkdir(path.join(root, 'Default'), { mode: 0o700 });
  const files = [
    { path: 'Local State', before: Buffer.from('{"profile_order":["Default"]}'), bytes: Buffer.from('{"aux_order":["Default"]}') },
    { path: 'Default/Preferences', before: Buffer.from('{"syntheticCredential":"fixture-only-old"}'), bytes: Buffer.from('{"syntheticCredential":"fixture-only-new"}') },
  ];
  for (const file of files) { await fs.writeFile(path.join(root, file.path), file.before, { mode: 0o600 }); file.expectedSha256 = sha(file.before); }
  const capability = { root, id: 'synthetic-exclusive-scope', disposable: true, exclusive: true, assertStopped: async () => true };
  return { root, files, capability, transactionId: createStateMigrationId() };
}
async function contents(f) { return Promise.all(f.files.map(file => fs.readFile(path.join(f.root, file.path)))); }
const crashAfterFirst = ({ stage, index }) => { if (stage === 'renamed-new-file' && index === 0) throw Error('simulated crash'); };

test('durable normal commit verifies explicit receipt and retains private original backups', async t => {
  const f = await fixture(t), original = await contents(f);
  await prepareStateMigration(f); assert.deepEqual(await contents(f), original);
  const receipt = await commitStateMigration(f);
  assert.deepEqual(await contents(f), f.files.map(file => file.bytes));
  assert.equal(JSON.stringify(receipt).includes('fixture-only'), false);
  const verified = await verifyStateMigration({ ...f, expectedReceiptSha256: receipt.receiptSha256 });
  assert.equal(verified.verified, true); assert.equal(verified.originalsRetained, true);
  for (const [index, file] of f.files.entries()) {
    const backup = path.join(f.root, `.aux-state-migration-${f.transactionId}`, `${index}.original`);
    assert.deepEqual(await fs.readFile(backup), file.before);
    assert.equal((await fs.stat(backup)).mode & 0o777, 0o600);
  }
  await assert.rejects(verifyStateMigration({ ...f, expectedReceiptSha256: '0'.repeat(64) }), /receipt mismatch/);
});
test('concurrent source change after preparation refuses commit before any replacement', async t => {
  const f = await fixture(t); await prepareStateMigration(f);
  await fs.writeFile(path.join(f.root, f.files[1].path), 'external-change');
  await assert.rejects(commitStateMigration(f), /Concurrent or unknown/);
  assert.deepEqual((await contents(f))[0], f.files[0].before);
  await assert.rejects(recoverStateMigration({ ...f, action: 'rollback' }), /Concurrent or unknown/);
  assert.equal((await contents(f))[1].toString(), 'external-change');
});
for (const action of ['complete', 'rollback']) {
  test(`mid-commit crash recovers explicitly by ${action} without mixed-state launch claim`, async t => {
    const f = await fixture(t); await prepareStateMigration(f);
    await assert.rejects(commitStateMigration({ ...f, onCheckpoint: crashAfterFirst }), /simulated crash/);
    assert.deepEqual(await contents(f), [f.files[0].bytes, f.files[1].before]);
    await assert.rejects(commitStateMigration(f), /Explicit recovery/);
    const receipt = await recoverStateMigration({ ...f, action });
    assert.deepEqual(await contents(f), f.files.map(file => action === 'complete' ? file.bytes : file.before));
    assert.equal((await verifyStateMigration({ ...f, expectedReceiptSha256: receipt.receiptSha256 })).verified, true);
  });
}
test('unknown concurrent state during crash recovery refuses both directions before restoring anything', async t => {
  const f = await fixture(t); await prepareStateMigration(f);
  await assert.rejects(commitStateMigration({ ...f, onCheckpoint: crashAfterFirst }), /simulated crash/);
  await fs.writeFile(path.join(f.root, f.files[1].path), 'external-after-crash');
  for (const action of ['complete', 'rollback']) await assert.rejects(recoverStateMigration({ ...f, action }), /Concurrent or unknown/);
  assert.deepEqual((await contents(f))[0], f.files[0].bytes);
});
test('symlink, traversal, duplicate aliases, hard links and unsafe permissions fail without writes', async t => {
  const f = await fixture(t), target = path.join(f.root, f.files[1].path);
  await assert.rejects(prepareStateMigration({ ...f, files: [{ ...f.files[0], path: '../outside' }] }), /Unsafe/);
  await assert.rejects(prepareStateMigration({ ...f, files: [f.files[0], { ...f.files[0], path: 'LOCAL STATE' }] }), /Duplicate/);
  await fs.rename(target, path.join(f.root, 'original-fixture'));
  await fs.symlink('../original-fixture', target);
  await assert.rejects(prepareStateMigration(f), /Symlink/);
  await fs.unlink(target); await fs.link(path.join(f.root, 'original-fixture'), target);
  await assert.rejects(prepareStateMigration(f), /alias/);
  await fs.unlink(target); await fs.rename(path.join(f.root, 'original-fixture'), target); await fs.chmod(target, 0o644);
  await assert.rejects(prepareStateMigration(f), /permissions/);
  assert.deepEqual((await contents(f))[0], f.files[0].before);
});
test('capability must remain genuinely stopped throughout; root aliases are refused', async t => {
  const f = await fixture(t); let stopped = true;
  f.capability.assertStopped = async () => stopped;
  await prepareStateMigration(f); stopped = false;
  await assert.rejects(commitStateMigration(f), /capability/);
  assert.deepEqual(await contents(f), f.files.map(file => file.before));
  const alias = path.join(f.root, 'root-alias'); await fs.symlink(f.root, alias);
  await assert.rejects(prepareStateMigration({ ...f, root: alias, capability: { ...f.capability, root: alias } }), /canonical/);
});
test('incomplete preparation can only roll back; input originals remain unmodified', async t => {
  const f = await fixture(t);
  await assert.rejects(prepareStateMigration({ ...f, onCheckpoint: ({ stage, index }) => { if (stage === 'prepared-file' && index === 0) throw Error('prepare-crash'); } }), /prepare-crash/);
  assert.deepEqual(await contents(f), f.files.map(file => file.before));
  await assert.rejects(recoverStateMigration({ ...f, action: 'complete' }));
  const receipt = await recoverStateMigration({ ...f, action: 'rollback' });
  assert.equal((await verifyStateMigration({ ...f, expectedReceiptSha256: receipt.receiptSha256 })).verified, true);
});
test('verification refuses lost originals even when all committed target hashes still match', async t => {
  const f = await fixture(t); await prepareStateMigration(f);
  const receipt = await commitStateMigration(f);
  await fs.unlink(path.join(f.root, `.aux-state-migration-${f.transactionId}`, '0.original'));
  await assert.rejects(verifyStateMigration({ ...f, expectedReceiptSha256: receipt.receiptSha256 }));
});
