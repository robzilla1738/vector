// Explicitly authorized synthetic acceptance only; never captures database or owner data.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chmod, mkdtemp, mkdir, readFile, writeFile, rm, realpath, stat, access } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Readable } from 'node:stream';
const execute = promisify(execFile), digest = bytes => createHash('sha256').update(bytes).digest('hex');
const source = resolve(process.argv[2]), evidencePath = resolve(process.argv[3]);
const transfer = '/private/tmp/aux-provider-secret-transfer-20261023';
const secretPath = join(transfer, 'r2-transfer.json');
const evidence = { format: 'aux.backup.r2.live-acceptance.v1', startedAt: new Date().toISOString(),
  accountId: '5a5f6f8a4d1c1d35cfe82c4a74c966b9', bucket: 'aux-recovery-prod',
  maxBytes: 1024 * 1024, syntheticOnly: true, productionDataRead: false,
  productionActivated: false, schedulerConfigured: false, phases: [] };
const save = async phase => { evidence.phases.push({ phase, at: new Date().toISOString() }); await writeFile(evidencePath, JSON.stringify(evidence, null, 2) + '\n'); console.log(JSON.stringify({ phase })); };
let key, remote, root, review, inventory, settled = false;
try {
  const parent = await stat(transfer), secret = await stat(secretPath);
  assert(parent.isDirectory() && parent.uid === process.getuid() && (parent.mode & 0o777) === 0o700);
  assert(secret.isFile() && secret.uid === process.getuid() && (secret.mode & 0o777) === 0o600);
  const credentials = JSON.parse(await readFile(secretPath, 'utf8'));
  for (const name of ['AUX_BACKUP_R2_ACCESS_KEY_ID', 'AUX_BACKUP_R2_SECRET_ACCESS_KEY']) {
    assert(typeof credentials[name] === 'string' && credentials[name].length > 10);
    process.env[name] = credentials[name];
  }
  const result = await execute('/Users/rcourson/.local/bin/op-agents', ['read', 'op://Agents/c2spe7d5jhft5falu424bbyzu4/password'], { maxBuffer: 4096 });
  assert(/^[a-f0-9]{64}$/.test(result.stdout.trim())); key = Buffer.from(result.stdout.trim(), 'hex');
  const module = name => import(pathToFileURL(join(source, 'services/aux-cloud/scripts', name)));
  const { writeBundle, unpackBundle } = await module('recovery-bundle.mjs');
  const { createBackupJob, authenticateCapturedJob, deliverBackupJob, loadVerifiedBackupDelivery } = await module('backup-job-core.mjs');
  const { runRemoteBackup, fetchRemoteBackup } = await module('backup-remote-core.mjs');
  const { createR2Storage } = await module('backup-r2-storage.mjs');
  evidence.sourceHashes = {};
  for (const name of ['recovery-bundle.mjs', 'backup-job-core.mjs', 'backup-remote-core.mjs', 'backup-r2-storage.mjs']) evidence.sourceHashes[name] = digest(await readFile(join(source, 'services/aux-cloud/scripts', name)));
  root = await realpath(await mkdtemp('/private/tmp/aux-r2-live-drill-')); await chmod(root, 0o700);
  const jobs = join(root, 'jobs'), delivered = join(root, 'delivered');
  await mkdir(jobs, { mode: 0o700 }); await mkdir(delivered, { mode: 0o700 });
  const job = await createBackupJob(jobs, delivered, key);
  const database = Buffer.from('Aux synthetic recovery fixture; not a PostgreSQL archive.\n');
  const blob = Buffer.from('Aux synthetic encrypted attachment fixture.\n');
  const deadline = Date.now() + 90_000;
  await writeBundle({ directory: join(job.path, 'bundle'), key,
    metadata: { synthetic: true, retentionDeadline: new Date(deadline).toISOString() },
    entries: [{ name: 'database.dump', source: Readable.from([database]) }, { name: 'blob-0.bin', source: Readable.from([blob]) }], maxBytes: evidence.maxBytes });
  await authenticateCapturedJob(job, key, evidence.maxBytes); await deliverBackupJob(job, key);
  const delivery = await loadVerifiedBackupDelivery(job, key); inventory = delivery.inventory;
  review = { format: 'aux.backup.r2.review.v1', accountId: evidence.accountId, bucket: evidence.bucket,
    prefix: 'aux/synthetic-acceptance-20261023/', jobId: job.id, bundleId: inventory.bundleId,
    inventorySha256: digest(JSON.stringify(inventory)), maxBytes: evidence.maxBytes };
  evidence.review = review; evidence.files = inventory.files; evidence.expiresAt = new Date(deadline).toISOString();
  remote = await createR2Storage(review); await save('synthetic-encrypted-capture-authenticated');
  evidence.delivery = await runRemoteBackup({ command: 'deliver', review, inventory, directory: delivery.directory, remote });
  evidence.verification = await runRemoteBackup({ command: 'verify', review, inventory, remote });
  await save('real-r2-deliver-and-full-readback-verified');
  await rm(jobs, { recursive: true }); await rm(delivered, { recursive: true });
  await assert.rejects(access(jobs)); await assert.rejects(access(delivered));
  const fetchReview = { format: 'aux.backup.r2.fetch-review.v1', accountId: review.accountId, bucket: review.bucket,
    prefix: review.prefix, jobId: job.id, maxBytes: evidence.maxBytes, maxFiles: 4 };
  evidence.fetch = await fetchRemoteBackup({ review: fetchReview, remote, directory: join(root, 'recovered'), scratch: join(root, 'scratch'), key });
  // Keep only non-local recovery metadata in the committed evidence.
  const recovered = evidence.fetch.directory; delete evidence.fetch.directory;
  const plain = join(root, 'plaintext'); await unpackBundle({ directory: recovered, destination: plain, key, maxBytes: evidence.maxBytes });
  assert.deepEqual(await readFile(join(plain, 'database.dump')), database);
  assert.deepEqual(await readFile(join(plain, 'blob-0.bin')), blob);
  await rm(plain, { recursive: true });
  evidence.originalLocalJobAndDeliveryRemovedBeforeFetch = true; evidence.syntheticPlaintextCompared = true;
  await save('real-r2-fetch-authenticated-without-local-job');
  await assert.rejects(runRemoteBackup({ command: 'expire', review, inventory, remote }), /retention/);
  evidence.earlyExpiryRefused = true;
  while (Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, Math.min(10_000, deadline - Date.now() + 5)));
  evidence.expiry = await runRemoteBackup({ command: 'expire', review, inventory, remote });
  evidence.remotePrefixEmpty = (await remote.list(review.prefix + review.jobId + '/')).keys.length === 0;
  assert(evidence.remotePrefixEmpty); settled = true; evidence.passed = true;
  await save('authenticated-expiry-and-exact-prefix-absence-verified');
} catch (error) {
  // SDK error objects may contain credential-bearing request metadata: never emit them.
  evidence.passed = false; evidence.failure = { name: error?.name ?? 'Error', status: Number.isInteger(error?.$metadata?.httpStatusCode) ? error.$metadata.httpStatusCode : null };
  if (remote && review && inventory) {
    try {
      while (Date.now() < inventory.expiresAt) await new Promise(resolve => setTimeout(resolve, Math.min(10_000, inventory.expiresAt - Date.now() + 5)));
      const { runRemoteBackup } = await import(pathToFileURL(join(source, 'services/aux-cloud/scripts/backup-remote-core.mjs')));
      evidence.failureCleanup = await runRemoteBackup({ command: 'expire', review, inventory, remote }); settled = true;
    } catch { evidence.failureCleanup = 'Exact generated prefix requires operator review'; }
  }
  await save('acceptance-stopped'); process.exitCode = 1;
} finally {
  remote?.destroy(); key?.fill(0);
  delete process.env.AUX_BACKUP_R2_ACCESS_KEY_ID; delete process.env.AUX_BACKUP_R2_SECRET_ACCESS_KEY;
  if (root && (settled || !review)) { await rm(root, { recursive: true, force: true }); evidence.privateDrillRootRemoved = true; }
  else if (root) evidence.retainedPrivateRootForExactCleanup = root;
  await rm(transfer, { recursive: true, force: true });
  evidence.transientCredentialTransferRemoved = true; evidence.finishedAt = new Date().toISOString();
  await writeFile(evidencePath, JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify({ passed: evidence.passed, remotePrefixEmpty: evidence.remotePrefixEmpty ?? false,
    transientCredentialTransferRemoved: true, privateDrillRootRemoved: evidence.privateDrillRootRemoved ?? false }));
}
