import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { Transform } from 'node:stream';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { get } from '@vercel/blob';
import { readRecoveryKey, writeBundle, unpackBundle, recoveryFileSource } from './recovery-bundle.mjs';
import { readOnlineSnapshotObjects, onlineBlobEntries } from './online-recovery-objects.mjs';

const [command, directory, keyFile, ...flags] = process.argv.slice(2);
const budget = Number(flags.find(v => v.startsWith('--max-bytes='))?.split('=')[1]);
const pgDump = process.env.AUX_PG_DUMP || '/opt/homebrew/opt/libpq/bin/pg_dump';
const pgRestore = process.env.AUX_PG_RESTORE || '/opt/homebrew/opt/libpq/bin/pg_restore';
let phase = 'arguments';
async function run(binary, args, env = {}, output) {
  await new Promise((accept, reject) => {
    // Provider credentials are supplied only in environment, never argv/log output.
    const child = spawn(binary, args, { env: { PATH: process.env.PATH, HOME: process.env.HOME, LANG: 'C', ...env }, stdio: ['ignore', output ? 'pipe' : 'ignore', 'pipe'] });
    const timer = setTimeout(() => child.kill('SIGTERM'), 300000);
    let diagnostic = '';
    child.stderr.on('data', chunk => { if (diagnostic.length < 8192) diagnostic += chunk.toString(); });
    const completed = new Promise((done, failed) => {
      child.once('error', () => failed(Error('PostgreSQL recovery tool could not start')));
      child.once('exit', code => {
        if (code === 0) return done();
        const category = /certificate|SSL error|root certificate/i.test(diagnostic) ? 'TLS validation' : /snapshot/i.test(diagnostic) ? 'snapshot' : /permission denied/i.test(diagnostic) ? 'database permission' : /version mismatch|unsupported version/i.test(diagnostic) ? 'tool version' : 'archive command';
        failed(Error(`PostgreSQL recovery tool failed: ${category}`));
      });
    });
    let bytes = 0;
    const streamed = output ? pipeline(child.stdout, new Transform({ transform(chunk, _encoding, done) {
      bytes += chunk.length;
      done(bytes > output.limit ? Error('Database archive exceeds byte budget') : null, chunk);
    } }), createWriteStream(output.path, { flags: 'wx', mode: 0o600 })) : Promise.resolve();
    Promise.all([completed, streamed]).then(accept, error => { child.kill('SIGTERM'); reject(error); }).finally(() => clearTimeout(timer));
  });
}
function separateKey(bundle, key) {
  assert(!resolve(key).startsWith(resolve(bundle) + sep), 'Keep the recovery key outside the bundle');
}
async function capture() {
  assert(!flags.includes('--quiesced'), 'Online capture makes no operator quiescence assertion');
  assert(Number.isSafeInteger(budget) && budget > 0, 'Set an explicit --max-bytes budget');
  separateKey(directory, keyFile);
  phase = 'resource binding';
  const url = new URL(process.env.DATABASE_URL_UNPOOLED || '');
  assert.equal(process.env.NEON_PROJECT_ID, 'ancient-river-76453764');
  assert.equal(url.hostname, 'ep-red-snow-b8ctxcyx.c-14.us-east-1.aws.neon.tech');
  const wrappingKey = process.env.AUX_DATA_ENCRYPTION_KEY;
  assert(wrappingKey && /^[A-Za-z0-9+/]{43}=$/.test(wrappingKey), 'Production wrapping key is required');
  const key = await readRecoveryKey(keyFile), temp = await mkdtemp(join(tmpdir(), 'aux-recovery-'));
  neonConfig.webSocketConstructor = globalThis.WebSocket;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL_UNPOOLED, max: 1, connectionTimeoutMillis: 20000 });
  let db;
  try {
    phase = 'database snapshot';
    db = await pool.connect();
    await db.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const manifest = JSON.parse(await readFile(new URL('../src/schema-manifest.json', import.meta.url)));
    const migrationRows = (await db.query('SELECT name,sha256 FROM aux_migrations ORDER BY name')).rows;
    assert.deepEqual(Object.fromEntries(migrationRows.map(r => [r.name, r.sha256])), manifest);
    const objects = await readOnlineSnapshotObjects(db);
    // Known attachment sizes plus conservative 2 MiB per avatar reserve room
    // before pg_dump. Every streamed byte remains independently budgeted.
    const total = objects.reduce((n, object) => n + object.maximum_size, 0);
    assert(Number.isSafeInteger(total) && total < budget, 'Private objects exceed export budget');
    const [{ snapshot }] = (await db.query('SELECT pg_export_snapshot() AS snapshot')).rows;
    const archive = join(temp, 'database.dump');
    phase = 'database archive';
    await run(pgDump, ['--format=custom', '--no-owner', '--no-privileges', '--snapshot=' + snapshot], {
      PGHOST: url.hostname, PGPORT: url.port || '5432', PGDATABASE: decodeURIComponent(url.pathname.slice(1)),
      PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password), PGSSLMODE: 'verify-full', PGSSLROOTCERT: 'system',
      PGCONNECT_TIMEOUT: '20', PGOPTIONS: '-c statement_timeout=300000 -c lock_timeout=10000',
    }, { path: archive, limit: budget - total });
    // pg_restore also checks the custom archive before it enters a sealed bundle.
    phase = 'archive validation';
    await run(pgRestore, ['--list', archive]);
    async function* entries() {
      yield { name: 'database.dump', source: recoveryFileSource(archive) };
      phase = 'online snapshot object verification';
      yield* onlineBlobEntries(objects, get, 'uur9brkrqm4lu0z2.private.blob.vercel-storage.com');
      // A failed/lost DB close must abort before writeBundle publishes its
      // encrypted manifest and completion record, not after that publication.
      phase = 'snapshot close';
      await db.query('COMMIT');
    }
    phase = 'sealed bundle';
    const result = await writeBundle({ directory, key, maxBytes: budget, entries: entries(), metadata: {
      resource: { project: 'ancient-river-76453764', branch: 'br-red-hall-b857cl2i', blob: 'store_UUr9bRkRQm4lu0Z2' },
      migrations: manifest, wrappingKey, retentionDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      consistency: 'exported-postgres-snapshot-with-complete-immutable-object-copies.v1',
      concurrentDeletion: 'abort-on-unavailable-or-mismatch; no write pause is claimed',
      objectFamilies: ['ready non-inference attachments', 'referenced private avatars'],
      readyObjects: objects.length,
      excludes: ['provider API credentials', 'all ephemeral inference files and uploads not ready at snapshot', 'provider webhook history outside Aux'],
    } });
    console.log(JSON.stringify({ kind: 'sealed-local-online-recovery-bundle', ...result, readyObjects: objects.length, productionActivated: false }));
  } finally {
    if (db) { await db.query('ROLLBACK').catch(() => {}); db.release(); }
    await pool.end(); await rm(temp, { recursive: true, force: true });
  }
}

try {
  if (command === 'init-key') {
    assert(directory && !keyFile && !flags.length, 'Usage: init-key /private/path/key');
    await writeFile(directory, randomBytes(32).toString('hex') + '\n', { mode: 0o600, flag: 'wx' });
    console.log('Private recovery key created; store separately from encrypted bundles');
  } else if (command === 'capture') {
    assert(directory && keyFile, 'Usage: capture bundle-directory key-file --max-bytes=N');
    await capture();
  } else if (command === 'unpack') {
    const destination = flags.find(v => v.startsWith('--destination='))?.slice('--destination='.length);
    assert(directory && keyFile && destination, 'Usage: unpack bundle-directory key-file --destination=new-private-directory --max-bytes=N');
    separateKey(directory, keyFile);
    assert(!resolve(keyFile).startsWith(resolve(destination) + sep), 'Key must stay outside recovery staging');
    const result = await unpackBundle({ directory, destination, key: await readRecoveryKey(keyFile), maxBytes: budget });
    try {
      assert(Date.parse(result.manifest.metadata.retentionDeadline) > Date.now(), 'Recovery bundle exceeds retention deadline');
      await run(pgRestore, ['--list', join(destination, 'database.dump')]);
    } catch (error) { await rm(destination, { recursive: true, force: true }); throw error; }
    console.log(JSON.stringify({ authenticated: true, files: result.manifest.files.length, bytes: result.bytes, localStagingOnly: true, databaseOrBlobWrites: false }));
  } else throw Error('Choose init-key, capture, or unpack');
} catch (error) {
  // Never print database, provider or cryptographic exceptions containing private material.
  const category = /^PostgreSQL recovery tool failed: (TLS validation|snapshot|database permission|tool version|archive command)$/.test(error?.message || '') ? error.message : 'Check private key, integrity, byte budget and complete snapshot object availability';
  const code = /^[A-Z_0-9]{1,64}$/.test(error?.code || '') ? error.code : 'UNCLASSIFIED';
  console.error(`Recovery operation failed at ${phase} (${code}). ${category}. No cutover performed.`);
  process.exitCode = 1;
}
