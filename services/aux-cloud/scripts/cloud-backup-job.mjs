// Local operator producer only: no scheduler, remote custody or activation.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { readRecoveryKey } from './recovery-bundle.mjs';
import { waitForCaptureExit } from './backup-capture-process.mjs';
import { withBackupJobLock, createBackupJob, loadBackupJob, authenticateCapturedJob,
  deliverBackupJob, expireBackupJob, recordBackupStatus } from './backup-job-core.mjs';

const [command, rootArgument, targetOrId, keyArgument, ...flags] = process.argv.slice(2);
let key, job;
async function captureOnce(job, key, keyFile, maxBytes) {
  const child = spawn(process.execPath, [fileURLToPath(new URL('./cloud-recovery-online.mjs', import.meta.url)),
    'capture', join(job.path, 'bundle'), keyFile, '--max-bytes=' + maxBytes],
    { env: process.env, stdio: ['ignore', 'ignore', 'ignore'] });
  await waitForCaptureExit(child, phase => recordBackupStatus(job, phase, key));
}
async function deliverWithBoundedRetry(job, key) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try { return await deliverBackupJob(job, key); }
    catch {
      await recordBackupStatus(job, 'delivery-failed', key, { attempt });
      if (attempt === 3) throw Error('Delivery requires operator review');
    }
  }
}
try {
  assert(['capture', 'deliver', 'expire'].includes(command) && rootArgument && targetOrId && keyArgument,
    'Expected capture JOB_ROOT TARGET_ROOT KEY_FILE --max-bytes=N, or deliver/expire JOB_ROOT JOB_ID KEY_FILE');
  const root = await realpath(rootArgument), keyFile = await realpath(keyArgument);
  assert(!keyFile.startsWith(root + '/'), 'Keep the recovery key outside jobs');
  key = await readRecoveryKey(keyFile);
  const result = await withBackupJobLock(root, async () => {
    try {
      if (command === 'capture') {
        const target = await realpath(targetOrId);
        assert(!keyFile.startsWith(target + '/'), 'Keep the recovery key outside delivery');
        const maxBytes = Number(flags.find(value => value.startsWith('--max-bytes='))?.slice(12));
        assert(Number.isSafeInteger(maxBytes) && maxBytes > 0 && flags.length === 1, 'Explicit capture byte budget required');
        job = await createBackupJob(root, target, key);
        await captureOnce(job, key, keyFile, maxBytes);
        await authenticateCapturedJob(job, key, maxBytes);
        return await deliverWithBoundedRetry(job, key);
      }
      assert.equal(flags.length, 0, 'Unsupported argument');
      job = await loadBackupJob(root, targetOrId, key);
      assert(!keyFile.startsWith(job.targetRoot + '/'), 'Keep the recovery key outside delivery');
      return await (command === 'expire' ? expireBackupJob(job, key) : deliverWithBoundedRetry(job, key));
    } catch (error) {
      if (job) await recordBackupStatus(job, 'stopped-for-operator-review', key);
      throw error;
    }
  });
  console.log(JSON.stringify({ ...result, productionActivated: false, remoteCustodyEstablished: false }));
} catch {
  console.error('Backup job stopped. Preserve job/status records and investigate; capture is never automatically repeated.');
  process.exitCode = 1;
} finally { key?.fill(0); }
