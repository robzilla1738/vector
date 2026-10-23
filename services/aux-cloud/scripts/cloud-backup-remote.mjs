// Explicit operator transport only. No capture, scheduler or provider creation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { open, realpath } from 'node:fs/promises';
import { readRecoveryKey } from './recovery-bundle.mjs';
import { loadBackupJob, loadAuthenticatedBackupInventory, loadVerifiedBackupDelivery, recordBackupStatus, withBackupJobLock } from './backup-job-core.mjs';
import { createR2Storage } from './backup-r2-storage.mjs';
import { runRemoteBackup, validateRemoteReview } from './backup-remote-core.mjs';

const [command, rootArgument, id, keyArgument, reviewArgument, ...extra] = process.argv.slice(2);
let key, client;
try {
  assert(['deliver', 'verify', 'expire'].includes(command) && rootArgument && id && keyArgument && reviewArgument && extra.length === 0,
    'Expected deliver/verify/expire JOB_ROOT JOB_ID KEY_FILE REVIEW_JSON');
  const root = await realpath(rootArgument), keyFile = await realpath(keyArgument);
  assert(!keyFile.startsWith(root + '/'), 'Key must remain outside jobs');
  key = await readRecoveryKey(keyFile);
  const result = await withBackupJobLock(root, async () => {
    const job = await loadBackupJob(root, id, key);
    assert(!keyFile.startsWith(job.targetRoot + '/'), 'Key must remain outside ciphertext delivery');
    const { inventory, directory } = command === 'expire'
      ? { inventory: await loadAuthenticatedBackupInventory(job, key) }
      : await loadVerifiedBackupDelivery(job, key);
    const reviewFile = await open(reviewArgument, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    let review;
    try {
      const state = await reviewFile.stat();
      assert(state.isFile() && state.size <= 16_384 && state.uid === process.getuid() &&
        !(state.mode & 0o022), 'Owned non-writable review file required');
      review = JSON.parse(await reviewFile.readFile('utf8'));
    } finally { await reviewFile.close(); }
    validateRemoteReview(review, inventory);
    const remote = await createR2Storage(review);
    client = remote;
    await recordBackupStatus(job, `remote-${command}-intent`, key, { reviewSha256: createHash('sha256').update(JSON.stringify(review)).digest('hex') });
    try {
      const result = await runRemoteBackup({ command, review, inventory, directory, remote });
      await recordBackupStatus(job, `remote-${command}-verified`, key);
      return result;
    } catch {
      await recordBackupStatus(job, `remote-${command}-unknown-outcome-review-required`, key);
      throw Error('Remote operation stopped');
    }
  });
  console.log(JSON.stringify({ ...result, productionActivated: false, schedulerConfigured: false }));
} catch {
  console.error('Remote backup stopped. Preserve the authenticated job and retry only its exact ciphertext after operator review.');
  process.exitCode = 1;
} finally { client?.destroy(); key?.fill(0); }
