import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdtemp, mkdir, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { writeBundle, unpackBundle } from '../../../../services/aux-cloud/scripts/recovery-bundle.mjs';
import { withBackupJobLock, createBackupJob, loadBackupJob, authenticateCapturedJob,
  deliverBackupJob, expireBackupJob } from '../../../../services/aux-cloud/scripts/backup-job-core.mjs';

const temporary = await realpath(await mkdtemp(join(tmpdir(), 'aux-local-backup-')));
const root = join(temporary, 'jobs'), target = join(temporary, 'delivery'), key = randomBytes(32);
const originalNow = Date.now, originalFetch = globalThis.fetch;
globalThis.fetch = async () => { throw Error('Network forbidden'); };
try {
  await mkdir(root, { mode: 0o700 }); await mkdir(target, { mode: 0o700 });
  await withBackupJobLock(root, async () => {
    await assert.rejects(() => withBackupJobLock(root, async () => {}), { code: 'EEXIST' });
    const job = await createBackupJob(root, target, key);
    const deadline = Date.now() + 60_000;
    await writeBundle({ directory: join(job.path, 'bundle'), key, maxBytes: 4096,
      metadata: { retentionDeadline: new Date(deadline).toISOString(), wrappingKey: randomBytes(32).toString('base64') },
      entries: [{ name: 'database.dump', source: Readable.from([Buffer.from('PGDMP synthetic archive')]) },
        { name: 'blob-0.bin', source: Readable.from([Buffer.from('synthetic private data')]) }] });
    await authenticateCapturedJob(job, key, 4096);
    const loaded = await loadBackupJob(root, job.id, key);
    const outside = join(temporary, 'not-owned');
    await writeFile(outside, 'unchanged', { mode: 0o600 });
    const pending = join(job.target, 'database.dump.sealed.pending');
    await symlink(outside, pending);
    await assert.rejects(() => deliverBackupJob(loaded, key));
    assert(!(await readdir(job.target)).includes('bundle.json'));
    assert.equal(await readFile(outside, 'utf8'), 'unchanged');
    await rm(pending);
    await writeFile(pending, 'partial encrypted copy', { mode: 0o600 });
    const delivered = await deliverBackupJob(loaded, key);
    assert.equal(delivered.files, 4);
    for (const name of await readdir(job.target))
      assert.deepEqual(await readFile(join(job.target, name)), await readFile(join(job.path, 'bundle', name)));
    assert(!(await readdir(job.target)).some(name => name.endsWith('.pending')));
    const verification = join(temporary, 'independent-readback');
    const restored = await unpackBundle({ directory: job.target, key, destination: verification, maxBytes: 4096 });
    assert.equal(restored.manifest.files.length, 2);
    await assert.rejects(() => expireBackupJob(loaded, key), /deadline/);
    await assert.rejects(() => loadBackupJob(root, job.id, randomBytes(32)), /authentication/);
    Date.now = () => deadline + 1;
    await writeFile(join(job.target, 'unowned.txt'), 'retain', { mode: 0o600 });
    await assert.rejects(() => expireBackupJob(loaded, key), /Unowned/);
    assert((await readdir(job.target)).includes('bundle.json'));
    await rm(join(job.target, 'unowned.txt'));
    const expired = await expireBackupJob(loaded, key);
    assert.equal(expired.expired, true);
    assert.deepEqual(await readdir(job.target), []);
    assert.deepEqual(await readdir(join(job.path, 'bundle')), []);
    assert((await readdir(job.path)).includes('inventory.json'));
    assert((await readdir(job.path)).some(name => name.endsWith('.status')));
    assert.equal(await readFile(outside, 'utf8'), 'unchanged');
  });
  assert(!(await readdir(root)).includes('.backup-job-lock'));
  console.log(JSON.stringify({ actualEncryptedBundle: true, localLock: true, unsafeDeliveryRefused: true,
    frozenCiphertextRetryVerified: true, expiryAuthenticationAndInventoryEnforced: true,
    captureProcessInvoked: false, providerOperations: 0, remoteCustodyEstablished: false }));
} finally {
  Date.now = originalNow; globalThis.fetch = originalFetch; key.fill(0);
  await rm(temporary, { recursive: true, force: true });
}
