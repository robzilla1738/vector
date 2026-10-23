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

test('read-only fetch recovers real encrypted bundle without local job and rejects tampering', async () => {
  const { randomBytes } = await import('node:crypto');
  const { readFile, readdir, access, realpath } = await import('node:fs/promises');
  const { writeBundle } = await import('./recovery-bundle.mjs');
  const { fetchRemoteBackup } = await import('./backup-remote-core.mjs');
  const root = await realpath(await mkdtemp(join(tmpdir(), 'aux-fetch-fixture-'))), key = randomBytes(32);
  try {
    const source = join(root, 'original');
    await writeBundle({ directory: source, key, metadata: { retentionDeadline: new Date(Date.now() + 60_000).toISOString() },
      entries: [{ name: 'database.dump', source: Readable.from([Buffer.from('synthetic database archive')]) },
        { name: 'blob-0.bin', source: Readable.from([Buffer.from('synthetic private blob')]) }], maxBytes: 1024 });
    const jobId = randomUUID(), prefix = 'aux/dev/' + jobId + '/', storage = new Map();
    for (const name of await readdir(source)) storage.set(prefix + name, await readFile(join(source, name)));
    await rm(source, { recursive: true }); // No job binding, inventory or original local bundle survives.
    const review = { format: 'aux.backup.r2.fetch-review.v1', accountId: 'a'.repeat(32), bucket: 'aux-backup-fixture',
      prefix: 'aux/dev/', jobId, maxBytes: 16_384, maxFiles: 4 };
    const operations = [];
    const remote = {
      async list(p) { operations.push('list'); return { objects: [...storage].filter(([k]) => k.startsWith(p)).map(([key, bytes]) => ({ key, size: bytes.length })) }; },
      async get(k) { operations.push(k); const bytes = storage.get(k); return { size: bytes.length, body: Readable.from([bytes]) }; },
      async put() { throw Error('Forbidden provider write'); }, async delete() { throw Error('Forbidden provider delete'); },
    };
    const destination = join(root, 'recovered'), scratch = join(root, 'scratch');
    const result = await fetchRemoteBackup({ review, remote, directory: destination, scratch, key });
    assert.equal(result.authenticated, true); assert.equal(result.files, 4);
    assert.equal(operations.at(-1), prefix + 'bundle.json');
    assert.deepEqual((await readdir(result.directory)).sort(), [...storage.keys()].map(k => k.slice(prefix.length)).sort());
    await assert.rejects(access(scratch));
    const encrypted = storage.get(prefix + 'database.dump.sealed');
    const bad = Buffer.from(encrypted); bad[bad.length - 1] ^= 1; storage.set(prefix + 'database.dump.sealed', bad);
    const rejected = join(root, 'rejected'), rejectedScratch = join(root, 'rejected-scratch');
    await assert.rejects(fetchRemoteBackup({ review, remote, directory: rejected, scratch: rejectedScratch, key }));
    await assert.rejects(access(rejected)); await assert.rejects(access(rejectedScratch));
    storage.set(prefix + 'database.dump.sealed', encrypted);
    storage.set(prefix + 'blob-999.bin.sealed', Buffer.from('extra'));
    await assert.rejects(fetchRemoteBackup({ review: { ...review, maxFiles: 5 }, remote,
      directory: rejected, scratch: rejectedScratch, key }), /authenticated manifest/);
    await assert.rejects(access(rejected)); await assert.rejects(access(rejectedScratch));
  } finally { key.fill(0); await rm(root, { recursive: true, force: true }); }
});
