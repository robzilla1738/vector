// Explicit operator transport only. No capture, scheduler or provider creation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { open, realpath } from 'node:fs/promises';
import { readRecoveryKey } from './recovery-bundle.mjs';
import { loadBackupJob, loadAuthenticatedBackupInventory, loadVerifiedBackupDelivery, recordBackupStatus, withBackupJobLock } from './backup-job-core.mjs';
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
    const accessKeyId = process.env.AUX_BACKUP_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AUX_BACKUP_R2_SECRET_ACCESS_KEY;
    assert(accessKeyId && secretAccessKey, 'Explicit scoped R2 credentials required');
    const { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    client = new S3Client({ endpoint: `https://${review.accountId}.r2.cloudflarestorage.com`, region: 'auto',
      credentials: { accessKeyId, secretAccessKey }, maxAttempts: 1, forcePathStyle: true,
      followRegionRedirects: false, requestChecksumCalculation: 'WHEN_REQUIRED', responseChecksumValidation: 'WHEN_REQUIRED' });
    const send = (Constructor, input, signal) => client.send(new Constructor({ Bucket: review.bucket, ...input }), { abortSignal: signal });
    const remote = {
      async get(Key, signal) {
        try { const value = await send(GetObjectCommand, { Key }, signal); return { body: value.Body, size: value.ContentLength }; }
        catch (error) { if (error?.$metadata?.httpStatusCode === 404) return null; throw error; }
      },
      put: (Key, Body, ContentLength, signal) => send(PutObjectCommand,
        { Key, Body, ContentLength, IfNoneMatch: '*', ContentType: 'application/octet-stream' }, signal),
      async list(Prefix, ContinuationToken, signal) {
        const value = await send(ListObjectsV2Command, { Prefix, ContinuationToken, MaxKeys: 1000 }, signal);
        assert(!value.IsTruncated || value.NextContinuationToken, 'Incomplete remote listing');
        return { keys: (value.Contents ?? []).map(value => value.Key), next: value.IsTruncated ? value.NextContinuationToken : undefined };
      },
      delete: (Key, signal) => send(DeleteObjectCommand, { Key }, signal),
    };
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
