import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtemp, chmod, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { test } from 'node:test';
import { boundedRemoteOperation, runRemoteBackup } from './backup-remote-core.mjs';
const digest = value => createHash('sha256').update(value).digest('hex');

test('ciphertext delivery, retries and expiry preserve exact inventory and completion order (in-memory transport)', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'aux-remote-fixture-'));
  try {
    await chmod(directory, 0o700);
    const data = new Map([['bundle.json', Buffer.from('completion')], ['manifest.sealed', Buffer.from('encrypted manifest')],
      ['database.dump.sealed', Buffer.from('encrypted database')]]);
    for (const [name, bytes] of data) await writeFile(join(directory, name), bytes, { mode: 0o600 });
    const inventory = { jobId: randomUUID(), bundleId: randomUUID(), expiresAt: Date.now() + 10_000,
      files: [...data].map(([name, bytes]) => ({ name, size: bytes.length, sha256: digest(bytes) })) };
    const review = { format: 'aux.backup.r2.review.v1', accountId: 'a'.repeat(32), bucket: 'aux-backup-fixture',
      prefix: 'aux/dev/', jobId: inventory.jobId, bundleId: inventory.bundleId, inventorySha256: digest(JSON.stringify(inventory)), maxBytes: 1024 };
    const storage = new Map(), operations = []; let fail = true;
    const prefix = review.prefix + inventory.jobId + '/';
    const remote = {
      async get(key) { const bytes = storage.get(key); return bytes ? { body: Readable.from([bytes]), size: bytes.length } : null; },
      async list(p) { return { keys: [...storage.keys()].filter(key => key.startsWith(p)) }; },
      async put(key, body) {
        operations.push(['put', key]);
        if (storage.has(key)) throw { $metadata: { httpStatusCode: 412 } };
        const chunks = []; for await (const chunk of body) chunks.push(chunk);
        storage.set(key, Buffer.concat(chunks));
        if (fail) { fail = false; throw Error('lost reply after actual publication'); }
      },
      async delete(key) { operations.push(['delete', key]); storage.delete(key); },
    };
    const invoke = (command, changes = {}) => runRemoteBackup({ command, review, inventory, directory, remote, ...changes });
    await assert.rejects(invoke('deliver'));
    assert(!storage.has(prefix + 'bundle.json'));
    await invoke('deliver');
    assert.equal(operations.filter(([op]) => op === 'put').at(-1)[1], prefix + 'bundle.json');
    const writes = operations.length; await invoke('deliver'); assert.equal(operations.length, writes);
    await invoke('verify');
    await assert.rejects(invoke('expire'), /retention/);
    storage.set(prefix + 'unknown', Buffer.from('foreign'));
    await assert.rejects(invoke('expire', { now: inventory.expiresAt }), /Unowned/);
    assert.equal(operations.length, writes);
    storage.delete(prefix + 'unknown');
    const original = storage.get(prefix + 'manifest.sealed'); storage.set(prefix + 'manifest.sealed', Buffer.alloc(original.length));
    await assert.rejects(invoke('expire', { now: inventory.expiresAt }), /hash mismatch/);
    assert.equal(operations.length, writes); storage.set(prefix + 'manifest.sealed', original);
    await invoke('expire', { now: inventory.expiresAt });
    assert.equal(operations.find(([op]) => op === 'delete')[1], prefix + 'bundle.json');
    assert.equal(storage.size, 0);
    await invoke('expire', { now: inventory.expiresAt });
    await assert.rejects(invoke('deliver', { review: { ...review, maxBytes: 1 } }), /budget/);
    await assert.rejects(invoke('deliver', { review: { ...review, inventorySha256: '0'.repeat(64) } }), /inventory mismatch/);
    // Race between preflight and conditional PUT: exact content may be adopted;
    // differing content must fail full readback and never publish completion.
    remote.put = async (key, body) => { for await (const _ of body) { /* drain fixture */ }
      storage.set(key, Buffer.from('wrong')); throw { $metadata: { httpStatusCode: 412 } }; };
    await assert.rejects(invoke('deliver'), /length mismatch/);
    assert(!storage.has(prefix + 'bundle.json'));
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('remote operation deadline aborts with explicitly unknown outcome', async () => {
  let signal;
  await assert.rejects(boundedRemoteOperation(value => { signal = value; return new Promise(() => {}); }, 5), /outcome unknown/);
  assert.equal(signal.aborted, true);
});
