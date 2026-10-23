import assert from 'node:assert/strict';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { constants } from 'node:fs';
import { link, mkdir, open, readdir, realpath, rm, rmdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { unpackBundle } from './recovery-bundle.mjs';

const fileFlags = constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK;
const jobName = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const sealedName = /^(bundle\.json|manifest\.sealed|database\.dump\.sealed|blob-[0-9]+\.bin\.sealed)$/;
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const mac = (bytes, key) => createHmac('sha256', key).update('aux.backup.job.v1\0').update(bytes).digest('hex');

async function directory(path, expected) {
  assert.equal(await realpath(path), path, 'Canonical private directory required');
  const descriptor = await open(path, fileFlags | constants.O_DIRECTORY);
  try {
    const state = await descriptor.stat();
    assert(state.isDirectory() && state.uid === process.getuid() && (state.mode & 0o7777) === 0o700,
      'Owned mode0700 directory required');
    const identity = { dev: state.dev, ino: state.ino };
    if (expected) assert.deepEqual(identity, expected, 'Backup directory replaced');
    return identity;
  } finally { await descriptor.close(); }
}
async function syncDirectory(path) {
  const descriptor = await open(path, fileFlags | constants.O_DIRECTORY);
  try { await descriptor.sync(); } finally { await descriptor.close(); }
}
async function writeExclusive(path, bytes) {
  const file = await open(path, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  try { await file.writeFile(bytes); await file.sync(); } finally { await file.close(); }
}
async function readPrivate(path, maximum = 16 * 1024 * 1024) {
  const file = await open(path, fileFlags);
  try {
    const state = await file.stat();
    assert(state.isFile() && state.nlink === 1 && state.uid === process.getuid() &&
      (state.mode & 0o7777) === 0o600 && state.size <= maximum, 'Unsafe backup file');
    return await file.readFile();
  } finally { await file.close(); }
}
async function signedWrite(path, value, key) {
  const payload = JSON.stringify(value);
  await writeExclusive(path, JSON.stringify({ payload, mac: mac(payload, key) }) + '\n');
}
async function signedRead(path, key) {
  const envelope = JSON.parse(await readPrivate(path));
  assert(typeof envelope.payload === 'string' && /^[a-f0-9]{64}$/.test(envelope.mac), 'Invalid job record');
  assert(timingSafeEqual(Buffer.from(envelope.mac, 'hex'), Buffer.from(mac(envelope.payload, key), 'hex')), 'Job authentication failed');
  return JSON.parse(envelope.payload);
}
async function fingerprint(path) {
  const file = await open(path, fileFlags);
  try {
    const before = await file.stat();
    assert(before.isFile() && before.nlink === 1 && before.uid === process.getuid() &&
      (before.mode & 0o7777) === 0o600, 'Unsafe ciphertext file');
    const hash = createHash('sha256'), bytes = Buffer.alloc(65_536);
    let size = 0;
    for (;;) {
      const result = await file.read(bytes, 0, bytes.length, null);
      if (!result.bytesRead) break;
      size += result.bytesRead;
      hash.update(bytes.subarray(0, result.bytesRead));
    }
    const after = await file.stat();
    assert(before.dev === after.dev && before.ino === after.ino && before.size === size && after.size === size &&
      before.mtimeMs === after.mtimeMs && before.ctimeMs === after.ctimeMs, 'Ciphertext changed during read');
    return { size, sha256: hash.digest('hex') };
  } finally { await file.close(); }
}

// A stale directory lock deliberately requires operator investigation; no PID
// assertion or automatic lock deletion grants custody after a crash.
export async function withBackupJobLock(root, action) {
  const identity = await directory(root);
  const lock = join(root, '.backup-job-lock');
  await mkdir(lock, { mode: 0o700 });
  const lockIdentity = await directory(lock);
  await syncDirectory(root);
  try { return await action(); }
  finally {
    await directory(root, identity);
    await directory(lock, lockIdentity);
    await rmdir(lock); // Only our empty, identity-matched lock; never recursive.
    await syncDirectory(root);
  }
}
export async function recordBackupStatus(job, phase, key, details = {}) {
  await directory(job.path, job.identity);
  const records = (await readdir(job.path)).filter(name => /^[0-9]{6}\.status$/.test(name)).sort();
  const next = records.length ? Number(records.at(-1).slice(0, 6)) + 1 : 0;
  assert(next < 1_000_000, 'Status record limit reached');
  await signedWrite(join(job.path, String(next).padStart(6, '0') + '.status'),
    { format: 'aux.backup.status.v1', jobId: job.id, phase, at: new Date().toISOString(), ...details }, key);
  await syncDirectory(job.path);
}
export async function createBackupJob(root, targetRoot, key) {
  const rootIdentity = await directory(root), targetIdentity = await directory(targetRoot);
  assert(root !== targetRoot && !root.startsWith(targetRoot + '/') && !targetRoot.startsWith(root + '/'), 'Separate delivery root required');
  const id = randomUUID(), path = join(root, id), target = join(targetRoot, id);
  await mkdir(path, { mode: 0o700 });
  await mkdir(target, { mode: 0o700 });
  const value = { format: 'aux.backup.binding.v1', id, path, identity: await directory(path),
    root, rootIdentity, target, targetIdentity: await directory(target), targetRoot, deliveryRootIdentity: targetIdentity };
  await signedWrite(join(path, 'binding.json'), value, key);
  await syncDirectory(path); await syncDirectory(root); await syncDirectory(targetRoot);
  await recordBackupStatus(value, 'capture-intent-no-automatic-recapture', key);
  return value;
}
export async function loadBackupJob(root, id, key) {
  assert(jobName.test(id), 'Explicit valid job ID required');
  await directory(root);
  const value = await signedRead(join(root, id, 'binding.json'), key);
  assert.equal(value.format, 'aux.backup.binding.v1');
  assert.equal(value.id, id); assert.equal(value.root, root); assert.equal(value.path, join(root, id));
  await directory(root, value.rootIdentity); await directory(value.path, value.identity);
  await directory(value.targetRoot, value.deliveryRootIdentity); await directory(value.target, value.targetIdentity);
  return value;
}
export async function authenticateCapturedJob(job, key, maxBytes) {
  const source = join(job.path, 'bundle'), scratch = join(job.path, 'verification');
  await directory(job.path, job.identity);
  const sourceIdentity = await directory(source);
  try {
    const { manifest } = await unpackBundle({ directory: source, destination: scratch, key, maxBytes });
    const expected = ['bundle.json', 'manifest.sealed', ...manifest.files.map(file => file.name + '.sealed')].sort();
    assert.deepEqual((await readdir(source)).sort(), expected, 'Unexpected bundle files');
    const expiresAt = Date.parse(manifest.metadata.retentionDeadline);
    assert(Number.isSafeInteger(expiresAt) && expiresAt > Date.now() && expiresAt <= Date.now() + 7 * 86400_000,
      'Bounded authenticated expiry required');
    const files = [];
    for (const name of expected) {
      assert(sealedName.test(name), 'Unsupported bundle file');
      files.push({ name, ...await fingerprint(join(source, name)) });
    }
    const inventory = { format: 'aux.backup.inventory.v1', jobId: job.id, binding: digest(JSON.stringify(job)),
      bundleId: manifest.id, sourceIdentity, expiresAt, files };
    await signedWrite(join(job.path, 'inventory.json'), inventory, key);
    await syncDirectory(job.path);
    await recordBackupStatus(job, 'capture-authenticated', key);
  } finally { await rm(scratch, { recursive: true, force: true }); }
}
async function loadInventory(job, key) {
  const inventory = await signedRead(join(job.path, 'inventory.json'), key);
  assert.equal(inventory.format, 'aux.backup.inventory.v1');
  assert.equal(inventory.jobId, job.id); assert.equal(inventory.binding, digest(JSON.stringify(job)));
  assert(Array.isArray(inventory.files) && inventory.files.length <= 100_002);
  assert(new Set(inventory.files.map(file => file.name)).size === inventory.files.length);
  assert(inventory.files.every(file => sealedName.test(file.name)) && inventory.files.some(file => file.name === 'bundle.json'));
  return inventory;
}
async function checkFiles(path, identity, files, allowMissing) {
  await directory(path, identity);
  const names = await readdir(path), expected = new Map(files.map(file => [file.name, file]));
  assert(names.every(name => expected.has(name)), 'Unowned delivery entry; refusing mutation');
  if (!allowMissing) assert.equal(names.length, files.length, 'Incomplete captured source');
  for (const name of names) assert.deepEqual(await fingerprint(join(path, name)),
    { size: expected.get(name).size, sha256: expected.get(name).sha256 }, 'Ciphertext integrity mismatch');
}
async function removePendingCopies(job, files) {
  await directory(job.target, job.targetIdentity);
  for (const file of files) {
    const name = file.name + '.pending';
    if (!(await readdir(job.target)).includes(name)) continue;
    const descriptor = await open(join(job.target, name), fileFlags);
    try {
      const state = await descriptor.stat();
      assert(state.isFile() && state.nlink === 1 && state.uid === process.getuid() &&
        (state.mode & 0o7777) === 0o600 && state.size <= file.size, 'Unsafe pending ciphertext');
    } finally { await descriptor.close(); }
    // This exact temporary name belongs to this authenticated inventory only.
    // Removing it retries delivery of frozen ciphertext, never source capture.
    await unlink(join(job.target, name));
    await syncDirectory(job.target);
  }
}
async function copyCiphertext(source, target, expected) {
  const input = await open(source, fileFlags);
  let output;
  try {
    output = await open(target + '.pending', constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
    const buffer = Buffer.alloc(65_536), hash = createHash('sha256');
    let size = 0;
    for (;;) {
      const { bytesRead } = await input.read(buffer, 0, buffer.length, null);
      if (!bytesRead) break;
      size += bytesRead;
      assert(size <= expected.size, 'Source grew during delivery');
      const part = buffer.subarray(0, bytesRead); hash.update(part);
      let written = 0;
      while (written < bytesRead) written += (await output.write(part, written, bytesRead - written)).bytesWritten;
    }
    assert.equal(size, expected.size); assert.equal(hash.digest('hex'), expected.sha256);
    await output.sync();
  } finally { await input.close(); if (output) await output.close(); }
  assert.deepEqual(await fingerprint(target + '.pending'), { size: expected.size, sha256: expected.sha256 }, 'Delivery readback mismatch');
  await link(target + '.pending', target); // Atomic no-overwrite publication.
  await unlink(target + '.pending');
}
export async function deliverBackupJob(job, key) {
  const inventory = await loadInventory(job, key);
  assert(Date.now() < inventory.expiresAt, 'Capture expired; never recapture on retry');
  const source = join(job.path, 'bundle');
  await checkFiles(source, inventory.sourceIdentity, inventory.files, false);
  await removePendingCopies(job, inventory.files);
  await checkFiles(job.target, job.targetIdentity, inventory.files, true);
  // bundle.json is the existing format's completion marker. A crash leaves no
  // apparently complete backup until every ciphertext has been read back.
  const ordered = [...inventory.files].sort((a, b) => (a.name === 'bundle.json') - (b.name === 'bundle.json'));
  await recordBackupStatus(job, 'delivery-intent', key);
  for (const file of ordered) {
    if ((await readdir(job.target)).includes(file.name)) continue; // Exact inventory was verified above.
    await directory(job.target, job.targetIdentity);
    await copyCiphertext(join(source, file.name), join(job.target, file.name), file);
    await syncDirectory(job.target);
  }
  await checkFiles(job.target, job.targetIdentity, inventory.files, false);
  await recordBackupStatus(job, 'delivered-ciphertext-verified-local-only', key);
  return { jobId: job.id, files: inventory.files.length, independentCustodyEstablished: false };
}
export async function expireBackupJob(job, key) {
  const inventory = await loadInventory(job, key);
  assert(Date.now() >= inventory.expiresAt, 'Retention deadline has not elapsed');
  const source = join(job.path, 'bundle');
  // Validate the entire remaining set BEFORE any unlink. Interrupted expiry can
  // continue missing-file deletion, but modified/unknown entries never qualify.
  await checkFiles(source, inventory.sourceIdentity, inventory.files, true);
  await removePendingCopies(job, inventory.files);
  await checkFiles(job.target, job.targetIdentity, inventory.files, true);
  await recordBackupStatus(job, 'expiry-delete-intent', key);
  for (const [path, identity] of [[job.target, job.targetIdentity], [source, inventory.sourceIdentity]]) {
    const ordered = [...inventory.files].sort((a, b) => (b.name === 'bundle.json') - (a.name === 'bundle.json'));
    for (const file of ordered) {
      await directory(path, identity);
      if (!(await readdir(path)).includes(file.name)) continue;
      assert.deepEqual(await fingerprint(join(path, file.name)), { size: file.size, sha256: file.sha256 });
      await unlink(join(path, file.name)); await syncDirectory(path);
    }
  }
  await recordBackupStatus(job, 'expired-owned-ciphertexts-removed', key);
  return { jobId: job.id, expired: true, privateStatusInventoryRetained: true };
}
