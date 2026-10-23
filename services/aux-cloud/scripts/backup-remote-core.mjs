import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { open } from 'node:fs/promises';
import { join } from 'node:path';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const names = /^(bundle\.json|manifest\.sealed|database\.dump\.sealed|blob-[0-9]+\.bin\.sealed)$/;
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
export function validateRemoteReview(review, inventory) {
  assert.deepEqual(Object.keys(review).sort(), ['format', 'accountId', 'bucket', 'prefix', 'jobId', 'bundleId', 'inventorySha256', 'maxBytes'].sort());
  assert.equal(review.format, 'aux.backup.r2.review.v1');
  assert(/^[a-f0-9]{32}$/.test(review.accountId), 'Exact Cloudflare account required');
  assert(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(review.bucket), 'Exact R2 bucket required');
  assert(typeof review.prefix === 'string' && review.prefix.length <= 256 &&
    /^(?:[a-zA-Z0-9_-]+\/)+$/.test(review.prefix), 'Explicit bounded R2 prefix required');
  assert(uuid.test(inventory.jobId) && review.jobId === inventory.jobId && review.bundleId === inventory.bundleId,
    'Review belongs to another capture');
  assert.equal(review.inventorySha256, digest(JSON.stringify(inventory)), 'Review inventory mismatch');
  assert(Number.isSafeInteger(review.maxBytes) && review.maxBytes > 0 && review.maxBytes <= 1024 ** 3, 'Explicit remote byte budget required');
  assert(Number.isSafeInteger(inventory.expiresAt) && Array.isArray(inventory.files) &&
    inventory.files.length >= 2 && inventory.files.length <= 100_002, 'Invalid authenticated inventory');
  assert.equal(new Set(inventory.files.map(file => file.name)).size, inventory.files.length);
  for (const file of inventory.files) assert(names.test(file.name) && Number.isSafeInteger(file.size) && file.size > 0 &&
    /^[a-f0-9]{64}$/.test(file.sha256), 'Invalid ciphertext inventory');
  assert(inventory.files.reduce((sum, file) => sum + file.size, 0) <= review.maxBytes, 'Remote byte budget exceeded');
  assert(inventory.files.some(file => file.name === 'bundle.json') && inventory.files.some(file => file.name === 'manifest.sealed'));
  return review.prefix + inventory.jobId + '/';
}

// Transport operations have a finite deadline covering both headers and body.
// A timeout never means a PUT/DELETE did not happen. Retry only this same job.
export async function boundedRemoteOperation(action, milliseconds = 60_000) {
  assert(Number.isSafeInteger(milliseconds) && milliseconds > 0 && milliseconds <= 300_000);
  const controller = new AbortController();
  let timer;
  try {
    return await Promise.race([action(controller.signal), new Promise((_, reject) => {
      timer = setTimeout(() => { controller.abort(); reject(Error('Remote outcome unknown; retry the exact authenticated job')); }, milliseconds);
    })]);
  } finally { clearTimeout(timer); controller.abort(); }
}
async function verifyObject(remote, key, file, allowMissing) {
  return boundedRemoteOperation(async signal => {
    const response = await remote.get(key, signal);
    if (response === null) { assert(allowMissing, 'Remote ciphertext missing'); return false; }
    const body = response.body;
    try {
      assert(body && body[Symbol.asyncIterator], 'Streaming object body required');
      if (response.size !== undefined) assert.equal(response.size, file.size, 'Remote length mismatch');
      let count = 0; const hash = createHash('sha256');
      for await (const chunk of body) {
        assert(!signal.aborted, 'Remote read aborted');
        const bytes = Buffer.from(chunk); count += bytes.length;
        assert(count <= file.size, 'Remote ciphertext exceeds inventory'); hash.update(bytes);
      }
      assert.equal(count, file.size, 'Remote length mismatch');
      assert.equal(hash.digest('hex'), file.sha256, 'Remote ciphertext hash mismatch');
      return true;
    } finally { body?.destroy?.(); }
  });
}
async function remoteInventory(remote, prefix, files) {
  const known = new Map(files.map(file => [prefix + file.name, file]));
  const seen = new Set(), tokens = new Set(); let continuation;
  // Each page must advance and yield at least one new key. Cap pages and objects.
  for (let page = 0; page <= files.length; page++) {
    const result = await boundedRemoteOperation(signal => remote.list(prefix, continuation, signal));
    assert(Array.isArray(result.keys) && result.keys.length <= 1000, 'Invalid remote listing');
    for (const key of result.keys) {
      assert(known.has(key) && !seen.has(key), 'Unowned or repeated remote object; refusing mutation');
      seen.add(key);
    }
    if (!result.next) return seen;
    assert(result.keys.length > 0 && typeof result.next === 'string' && !tokens.has(result.next), 'Unbounded remote listing');
    tokens.add(result.next); continuation = result.next;
  }
  throw Error('Remote listing exceeds authenticated inventory');
}
export async function runRemoteBackup({ command, review, inventory, directory, remote, now = Date.now() }) {
  assert(['deliver', 'verify', 'expire'].includes(command));
  const prefix = validateRemoteReview(review, inventory);
  if (command === 'expire') assert(now >= inventory.expiresAt, 'Authenticated retention has not elapsed');
  if (command === 'deliver') assert(now < inventory.expiresAt, 'Expired capture cannot be delivered');
  const present = await remoteInventory(remote, prefix, inventory.files);
  if (command === 'deliver' && present.has(prefix + 'bundle.json'))
    assert.equal(present.size, inventory.files.length, 'Existing completion marker has missing ciphertext; operator review required');
  // Whole-set preflight before publishing or deleting anything.
  for (const file of inventory.files) if (present.has(prefix + file.name)) await verifyObject(remote, prefix + file.name, file, false);
  if (command === 'verify') {
    assert.equal(present.size, inventory.files.length, 'Incomplete remote backup');
    return { jobId: inventory.jobId, verified: true, files: present.size };
  }
  const ordered = [...inventory.files].sort((a, b) => command === 'expire'
    ? (b.name === 'bundle.json') - (a.name === 'bundle.json')
    : (a.name === 'bundle.json') - (b.name === 'bundle.json'));
  for (const file of ordered) {
    const key = prefix + file.name;
    if (command === 'expire') {
      if (!present.has(key)) continue;
      // Recheck immediately before mutation; credentials/bucket policy must
      // exclude other writers. S3 DeleteObject has no hash precondition.
      await verifyObject(remote, key, file, false);
      await boundedRemoteOperation(signal => remote.delete(key, signal));
      continue;
    }
    if (present.has(key)) continue;
    assert(Date.now() < inventory.expiresAt, 'Capture expired during delivery; completion not published');
    const input = await open(join(directory, file.name), constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    try {
      const state = await input.stat();
      assert(state.isFile() && state.nlink === 1 && state.uid === process.getuid() &&
        (state.mode & 0o7777) === 0o600 && state.size === file.size, 'Unsafe local ciphertext');
      await boundedRemoteOperation(async signal => {
        const body = input.createReadStream({ autoClose: false, start: 0, end: file.size ? file.size - 1 : undefined });
        try { await remote.put(key, body, file.size, signal); }
        catch (error) { if (error?.$metadata?.httpStatusCode !== 412) throw error; }
        finally { body.destroy(); }
      });
    } finally { await input.close(); }
    await verifyObject(remote, key, file, false);
  }
  const final = await remoteInventory(remote, prefix, inventory.files);
  if (command === 'expire') assert.equal(final.size, 0, 'Remote deletion incomplete; retry same job');
  else {
    assert.equal(final.size, inventory.files.length, 'Remote delivery incomplete');
    for (const file of inventory.files) await verifyObject(remote, prefix + file.name, file, false);
  }
  return { jobId: inventory.jobId, files: inventory.files.length, [command === 'expire' ? 'expired' : 'verified']: true };
}
