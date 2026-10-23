// Read-only remote recovery without a surviving local job or inventory.
import assert from 'node:assert/strict';
import { constants } from 'node:fs';
import { open, realpath } from 'node:fs/promises';
import { resolve } from 'node:path';
import { readRecoveryKey } from './recovery-bundle.mjs';
import { createR2Storage } from './backup-r2-storage.mjs';
import { fetchRemoteBackup, validateFetchReview } from './backup-remote-core.mjs';
const [reviewPath, destination, scratchPath, keyPath, ...extra] = process.argv.slice(2);
let key, remote;
try {
  assert(reviewPath && destination && scratchPath && keyPath && !extra.length,
    'Expected REVIEW_JSON NEW_DESTINATION NEW_SCRATCH RECOVERY_KEY_FILE');
  const directory = resolve(destination), scratch = resolve(scratchPath), keyFile = await realpath(keyPath);
  for (const path of [directory, scratch]) assert(keyFile !== path && !keyFile.startsWith(path + '/'), 'Recovery key must remain outside new destinations');
  const file = await open(reviewPath, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  let review;
  try {
    const state = await file.stat();
    assert(state.isFile() && state.size <= 16_384 && state.uid === process.getuid() && !(state.mode & 0o022), 'Owned non-writable review file required');
    review = JSON.parse(await file.readFile('utf8'));
  } finally { await file.close(); }
  validateFetchReview(review);
  key = await readRecoveryKey(keyFile);
  remote = await createR2Storage(review);
  const result = await fetchRemoteBackup({ review, remote, directory, scratch, key });
  console.log(JSON.stringify({ ...result, providerWrites: false, productionActivated: false }));
} catch {
  console.error('Remote recovery stopped. No provider writes were requested; inspect local destination before retrying.');
  process.exitCode = 1;
} finally { remote?.destroy(); key?.fill(0); }
