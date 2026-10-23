import assert from 'node:assert/strict';
import { createHash, timingSafeEqual } from 'node:crypto';
import { constants } from 'node:fs';
import { open, realpath, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { readOnlineSnapshotObjects } from './online-recovery-objects.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const familyKeys = ['family', 'pathname', 'content_type', 'expected_size', 'expected_sha256', 'maximum_size'];

// The wrapping key is independent of AUX_AUTH_SECRET. Rotating it would make
// restored server-wrapped sync keys unreadable; this checks intended config only,
// and does not install secrets or attest the future deployed environment.
export function validateRestoreWrappingKey(manifest, configuredKey) {
  const original = manifest.metadata?.wrappingKey;
  const canonical = value => typeof value === 'string' &&
    /^[A-Za-z0-9+/]{43}=$/.test(value) && Buffer.from(value, 'base64').toString('base64') === value;
  assert(canonical(original) && canonical(configuredKey), 'Exact recovered sync wrapping key required');
  const expected = Buffer.from(original, 'base64'), configured = Buffer.from(configuredKey, 'base64');
  try {
    assert(expected.length === 32 && configured.length === 32 && timingSafeEqual(expected, configured),
      'Restore wrapping configuration differs from captured sync key');
  } finally { expected.fill(0); configured.fill(0); }
}

export function validateOnlineRestoreManifest(manifest, currentMigrations) {
  assert.equal(manifest.version, 1, 'Unsupported recovery manifest');
  assert.equal(manifest.metadata?.consistency, 'exported-postgres-snapshot-with-complete-immutable-object-copies.v1', 'Use the complete online capture format');
  assert.deepEqual(manifest.metadata.migrations, currentMigrations, 'Restore requires the exact current schema');
  assert(Date.parse(manifest.metadata.retentionDeadline) > Date.now(), 'Recovery retention deadline exceeded');
  assert(Array.isArray(manifest.files) && manifest.files.length <= 100_001, 'Invalid recovery file count');
  const names = new Set(), paths = new Set();
  const objects = [];
  let archive;
  for (const file of manifest.files) {
    assert(/^(database\.dump|blob-[0-9]+\.bin)$/.test(file.name) && !names.has(file.name), 'Unsafe or duplicate recovery file');
    names.add(file.name);
    assert(Number.isSafeInteger(file.size) && file.size >= 0 && /^[a-f0-9]{64}$/.test(file.sha256), 'Invalid recovery file bounds');
    if (file.name === 'database.dump') {
      assert(!file.object, 'Database archive cannot be an object'); archive = file; continue;
    }
    const object = file.object;
    assert(object && !paths.has(object.pathname) && ['attachment', 'avatar'].includes(object.family), 'Invalid object family/reference');
    assert.equal(object.observed_size, file.size, 'Object/file size mismatch');
    assert.equal(object.observed_sha256, file.sha256, 'Object/file hash mismatch');
    assert(file.size <= object.maximum_size && object.maximum_size <= 100 * 1024 * 1024, 'Object capture bound mismatch');
    paths.add(object.pathname);
    objects.push(file);
  }
  assert(archive, 'Database archive required');
  return { archive, objects };
}

// Must be called against the newly imported, still unserved isolated database.
// No caller flag or returned counts prove that deployment/writer exclusion.
export async function sanitizeRestoredDatabase(db, manifest, currentMigrations) {
  const plan = validateOnlineRestoreManifest(manifest, currentMigrations);
  await db.query('BEGIN');
  try {
    const rows = (await db.query('SELECT name,sha256 FROM aux_migrations ORDER BY name')).rows;
    assert.deepEqual(Object.fromEntries(rows.map(row => [row.name, row.sha256])), currentMigrations, 'Restored migration mismatch');
    const references = await readOnlineSnapshotObjects(db);
    const supplied = new Map(plan.objects.map(file => [file.object.pathname, file.object]));
    assert.equal(references.length, supplied.size, 'Manifest does not cover restored durable objects exactly');
    for (const reference of references) {
      const saved = supplied.get(reference.pathname);
      assert(saved, 'Restored DB object absent from bundle');
      for (const key of familyKeys) assert.equal(saved[key], reference[key], 'Restored DB object binding mismatch');
    }
    // Keep installation public material, sync generations, wrapped CSKs,
    // recovery revisions, financial records and user-deletion flags unchanged.
    const sessions = await db.query(`UPDATE aux_sessions SET revoked_at=COALESCE(revoked_at,now()),
      access_expires_at=LEAST(access_expires_at,now()),expires_at=LEAST(expires_at,now()) RETURNING id`);
    await db.query('DELETE FROM aux_refresh_tokens');
    await db.query('DELETE FROM aux_email_challenges');
    await db.query('DELETE FROM aux_device_requests');
    await db.query('DELETE FROM aux_sync_recovery_challenges_v2');
    await db.query('DELETE FROM aux_rate_limits');
    const transient = await db.query(`UPDATE aux_attachments SET state='deleted'
      WHERE purpose='inference' OR state<>'ready' RETURNING id`);
    // Metadata/FKs remain present. No absent object is recreated or presented
    // as ready, and an existing deletion is never reset to live.
    const shares = await db.query('UPDATE shared_sessions SET revoked_at=COALESCE(revoked_at,now()) RETURNING id');
    await db.query('COMMIT');
    return { revokedSessions: sessions.rows.length, transientObjectsUnavailable: transient.rows.length,
      revokedShares: shares.rows.length, durableObjects: references.length,
      statelessCapabilitySecretRotationStillRequired: true, cutoverAuthorized: false };
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}

export async function readVerifiedRestoreFile(directory, entry) {
  assert(/^(database\.dump|blob-[0-9]+\.bin)$/.test(entry.name), 'Unsafe recovery file name');
  assert.equal(await realpath(directory), directory, 'Canonical recovery staging required');
  const parent = await stat(directory);
  assert(parent.isDirectory() && parent.uid === process.getuid() && (parent.mode & 0o7777) === 0o700, 'Private staging required');
  const file = await open(join(directory, entry.name), constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await file.stat();
    assert(before.isFile() && before.nlink === 1 && before.uid === process.getuid() &&
      (before.mode & 0o7777) === 0o600 && before.size === entry.size, 'Unsafe restored file');
    const bytes = await file.readFile();
    const after = await file.stat();
    assert(before.dev === after.dev && before.ino === after.ino && before.size === after.size &&
      before.mtimeMs === after.mtimeMs && before.ctimeMs === after.ctimeMs && hash(bytes) === entry.sha256, 'Restored file changed or failed integrity');
    return bytes;
  } finally { await file.close(); }
}

export async function verifyRestoreArchive(directory, entry) {
  assert.equal(entry.name, 'database.dump');
  assert.equal(await realpath(directory), directory, 'Canonical recovery staging required');
  const parent = await stat(directory);
  assert(parent.isDirectory() && parent.uid === process.getuid() && (parent.mode & 0o7777) === 0o700, 'Private archive staging required');
  const file = await open(join(directory, entry.name), constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await file.stat();
    assert(before.isFile() && before.nlink === 1 && before.uid === process.getuid() &&
      (before.mode & 0o7777) === 0o600 && before.size === entry.size, 'Unsafe database archive');
    const digest = createHash('sha256'), buffer = Buffer.alloc(65_536);
    let size = 0;
    for (;;) {
      const { bytesRead } = await file.read(buffer, 0, buffer.length, null);
      if (!bytesRead) break;
      size += bytesRead;
      assert(size <= entry.size, 'Database archive grew');
      digest.update(buffer.subarray(0, bytesRead));
    }
    const after = await file.stat();
    assert(size === entry.size && digest.digest('hex') === entry.sha256 &&
      before.dev === after.dev && before.ino === after.ino && before.mtimeMs === after.mtimeMs &&
      before.ctimeMs === after.ctimeMs && before.size === after.size, 'Database archive integrity changed');
  } finally { await file.close(); }
}

async function verifyPrivateRead(response, entry, targetHostname) {
  assert(response && response.statusCode === 200, 'Restored private object unavailable');
  const object = entry.object;
  assert.equal(response.blob.pathname, object.pathname, 'Restored object path mismatch');
  assert.equal(new URL(response.blob.url).hostname, targetHostname, 'Wrong private restore store');
  assert.equal(response.blob.contentType.split(';')[0], object.content_type, 'Restored content type mismatch');
  const reader = response.stream.getReader(), digest = createHash('sha256');
  let size = 0, ended = false;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) { ended = true; break; }
      size += chunk.value.byteLength;
      assert(size <= entry.size, 'Restored private object exceeds bound');
      digest.update(chunk.value);
    }
    assert.equal(size, entry.size, 'Restored private object truncated');
    assert.equal(digest.digest('hex'), entry.sha256, 'Restored private object hash mismatch');
  } finally {
    try { if (!ended) await reader.cancel(); }
    finally { reader.releaseLock(); }
  }
}

// The CLI passes only files returned by authenticated unpack + exact DB binding.
// Existing objects always refuse; an uncertain write is retained for review,
// never overwritten, deleted, blindly retried or reported as completed.
export async function restorePrivateObjects({ objects, directory, targetHostname, storage, checkpoint }) {
  let verified = 0;
  for (const entry of objects) {
    const object = entry.object;
    assert.equal(await storage.head(object.pathname), null, 'Restore destination object already exists');
    const bytes = await readVerifiedRestoreFile(directory, entry);
    try {
      await checkpoint({ phase: 'object-write-intent', pathname: object.pathname, sha256: entry.sha256, verified });
      const written = await storage.put(object.pathname, bytes, {
        access: 'private', contentType: object.content_type, addRandomSuffix: false, allowOverwrite: false,
      });
      assert.equal(written.pathname, object.pathname, 'Restore write path mismatch');
      assert.equal(new URL(written.url).hostname, targetHostname, 'Wrong private restore store');
      await verifyPrivateRead(await storage.get(object.pathname, { access: 'private', useCache: false,
        abortSignal: AbortSignal.timeout(120_000) }), entry, targetHostname);
      verified++;
      await checkpoint({ phase: 'object-verified', pathname: object.pathname, sha256: entry.sha256, verified });
    } finally { bytes.fill(0); }
  }
  return { objectsVerified: verified, databaseOrDeploymentActivated: false };
}
