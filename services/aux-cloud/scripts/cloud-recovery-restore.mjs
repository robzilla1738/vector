// Isolated target only. No source/provider deletion, provisioning or cutover.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { constants } from 'node:fs';
import { mkdir, mkdtemp, open, readFile, realpath, rm } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { get, put, head, BlobNotFoundError } from '@vercel/blob';
import { readRecoveryKey, unpackBundle } from './recovery-bundle.mjs';
import { validateRestoreWrappingKey, validateOnlineRestoreManifest, verifyRestoreArchive, sanitizeRestoredDatabase, restorePrivateObjects } from './recovery-restore-core.mjs';

const [bundle, keyFile, targetReviewFile, reportDirectory, ...flags] = process.argv.slice(2);
const maxBytes = Number(flags.find(flag => flag.startsWith('--max-bytes='))?.slice(12));
let stage = 'arguments', reportRoot, temporary, db, pool;
let sequence = 0, key;
async function checkpoint(value) {
  const file = await open(join(reportRoot, String(sequence++).padStart(6, '0') + '.json'),
    constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  try {
    await file.writeFile(JSON.stringify({ format: 'aux.isolated-restore.progress.v1', ...value,
      cutoverAuthorized: false, productionActivated: false }) + '\n');
    await file.sync();
  } finally { await file.close(); }
  const directory = await open(reportRoot, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
  try { await directory.sync(); } finally { await directory.close(); }
}
async function runRestore(archive, url) {
  await new Promise((done, fail) => {
    const child = spawn(process.env.AUX_PG_RESTORE || '/opt/homebrew/opt/libpq/bin/pg_restore',
      ['--no-owner', '--no-privileges', '--single-transaction', '--exit-on-error', '--dbname=' + decodeURIComponent(url.pathname.slice(1)), archive],
      { env: { PATH: process.env.PATH, LANG: 'C', PGHOST: url.hostname, PGPORT: url.port || '5432',
        PGDATABASE: decodeURIComponent(url.pathname.slice(1)), PGUSER: decodeURIComponent(url.username),
        PGPASSWORD: decodeURIComponent(url.password), PGSSLMODE: 'verify-full', PGSSLROOTCERT: 'system',
        PGCONNECT_TIMEOUT: '20', PGOPTIONS: '-c statement_timeout=300000 -c lock_timeout=10000' }, stdio: ['ignore', 'ignore', 'pipe'] });
    // Never print SQL/provider diagnostics; they may contain private material.
    child.stderr.resume();
    const timer = setTimeout(() => child.kill('SIGTERM'), 300_000);
    child.once('error', () => { clearTimeout(timer); fail(Error('Restore client unavailable')); });
    child.once('exit', code => { clearTimeout(timer); code === 0 ? done() : fail(Error('Isolated archive import failed')); });
  });
}
try {
  assert(bundle && keyFile && targetReviewFile && reportDirectory && Number.isSafeInteger(maxBytes) && maxBytes > 0,
    'Expected sealed bundle, separate key, reviewed target, fresh report directory and explicit byte budget');
  assert(!resolve(keyFile).startsWith(resolve(bundle) + sep), 'Keep key separate from bundle');
  const reviewBytes = await readFile(targetReviewFile);
  assert(reviewBytes.length <= 16_384, 'Target review is too large');
  const review = JSON.parse(reviewBytes);
  assert.deepEqual(Object.keys(review).sort(), ['blobHostname', 'databaseHost', 'databaseName', 'format']);
  assert.equal(review.format, 'aux.isolated-restore-target.v1');
  const url = new URL(process.env.AUX_RESTORE_DATABASE_URL || '');
  assert(['postgres:', 'postgresql:'].includes(url.protocol) && url.username && url.password);
  assert([...url.searchParams].every(([name, value]) =>
    (name === 'sslmode' && ['require', 'verify-full'].includes(value)) ||
    (name === 'channel_binding' && value === 'require')), 'Unreviewed connection override');
  assert(!url.hash, 'Connection fragment is unsupported');
  assert.equal(url.hostname, review.databaseHost);
  assert.equal(decodeURIComponent(url.pathname.slice(1)), review.databaseName);
  assert(/^[A-Za-z_][A-Za-z0-9_]{0,62}$/.test(review.databaseName));
  assert(!url.hostname.includes('-pooler.') && url.hostname.endsWith('.neon.tech'));
  assert.notEqual(url.hostname, 'ep-red-snow-b8ctxcyx.c-14.us-east-1.aws.neon.tech', 'Source host is never a restore target');
  const token = process.env.AUX_RESTORE_BLOB_READ_WRITE_TOKEN;
  assert(typeof token === 'string' && /^vercel_blob_rw_[A-Za-z0-9]+_[A-Za-z0-9_-]+$/.test(token), 'Separate target Blob credential required');
  const storeId = token.split('_')[3].toLowerCase();
  assert.equal(review.blobHostname, storeId + '.private.blob.vercel-storage.com');
  assert.notEqual(review.blobHostname, 'uur9brkrqm4lu0z2.private.blob.vercel-storage.com', 'Source Blob store is never a restore target');
  // A review describes the intended resource, not permission, isolation or an
  // empty-store proof. Actual credentials, schema reads and create-only writes
  // enforce the mechanical boundaries; operator custody remains external.
  reportRoot = resolve(reportDirectory);
  assert(!reportRoot.startsWith(resolve(bundle) + sep), 'Progress records must stay outside source bundle');
  await mkdir(reportRoot, { mode: 0o700 });
  await checkpoint({ phase: 'started' });
  stage = 'authenticated unpack';
  temporary = await realpath(await mkdtemp(join(tmpdir(), 'aux-isolated-restore-')));
  const unpacked = join(temporary, 'unpacked');
  key = await readRecoveryKey(keyFile);
  const { manifest } = await unpackBundle({ directory: resolve(bundle), key, destination: unpacked, maxBytes });
  const currentMigrations = JSON.parse(await readFile(new URL('../src/schema-manifest.json', import.meta.url)));
  const plan = validateOnlineRestoreManifest(manifest, currentMigrations);
  // Separate candidate configuration must match the authenticated captured key
  // before any destination mutation. Never derive it from or rotate it with the
  // new AUX_AUTH_SECRET; actual deployment/key custody remains an operator step.
  validateRestoreWrappingKey(manifest, process.env.AUX_RESTORE_DATA_ENCRYPTION_KEY);
  assert.notEqual(review.blobHostname,
    String(manifest.metadata.resource.blob).replace(/^store_/, '').toLowerCase() + '.private.blob.vercel-storage.com');
  stage = 'empty isolated database';
  neonConfig.webSocketConstructor = globalThis.WebSocket;
  pool = new Pool({ connectionString: url.toString(), max: 1, connectionTimeoutMillis: 20_000 });
  db = await pool.connect();
  const [empty] = (await db.query(`SELECT
    (SELECT count(*) FROM pg_namespace WHERE nspname NOT IN ('public','information_schema') AND nspname NOT LIKE 'pg_%') AS schemas,
    (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public') +
    (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public') +
    (SELECT count(*) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public') AS objects`)).rows;
  assert.equal(Number(empty.schemas), 0, 'Destination must have no application schema');
  assert.equal(Number(empty.objects), 0, 'Destination public schema must be empty');
  await verifyRestoreArchive(unpacked, plan.archive);
  await checkpoint({ phase: 'archive-import-intent', bundleId: manifest.id });
  stage = 'archive import';
  await runRestore(join(unpacked, plan.archive.name), url);
  stage = 'database quarantine';
  const sanitized = await sanitizeRestoredDatabase(db, manifest, currentMigrations);
  await checkpoint({ phase: 'database-quarantined', ...sanitized });
  stage = 'create-only private restore';
  const restored = await restorePrivateObjects({ objects: plan.objects, directory: unpacked,
    targetHostname: review.blobHostname, checkpoint,
    storage: {
      head: async path => { try { return await head(path, { token }); } catch (error) { if (error instanceof BlobNotFoundError) return null; throw error; } },
      put: (path, bytes, options) => put(path, bytes, { ...options, token }),
      get: (path, options) => get(path, { ...options, token }),
    } });
  await checkpoint({ phase: 'copies-verified-not-activated', ...restored,
    requirements: ['Keep target unserved until separately reviewed cutover', 'Configure a NEW AUX_AUTH_SECRET to invalidate stateless capabilities',
      'Install the exact recovered AUX_DATA_ENCRYPTION_KEY through independent custody',
      'Reconcile post-snapshot deletions and external identity/billing state before activation'] });
  console.log(JSON.stringify({ isolatedCopiesVerified: true, objects: restored.objectsVerified, cutoverAuthorized: false,
    sourceDataChanged: false, deploymentChanged: false }));
} catch {
  if (reportRoot) await checkpoint({ phase: 'stopped-for-review', stage, partialDestinationRetained: true }).catch(() => {});
  console.error('Isolated restore stopped at ' + stage + '. Existing/partial targets are retained; no cutover or automatic retry.');
  process.exitCode = 1;
} finally {
  key?.fill(0);
  if (db) db.release();
  if (pool) await pool.end();
  if (temporary) await rm(temporary, { recursive: true, force: true });
}
