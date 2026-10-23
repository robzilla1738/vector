import assert from 'node:assert/strict';
import { randomBytes, createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { Readable, Transform } from 'node:stream';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { get } from '@vercel/blob';
import { readRecoveryKey, writeBundle, unpackBundle, recoveryFileSource } from './recovery-bundle.mjs';
import { runPostgresTool as run } from './recovery-tool-process.mjs';

const [command, directory, keyFile, ...flags] = process.argv.slice(2);
const budget = Number(flags.find(v => v.startsWith('--max-bytes='))?.split('=')[1]);
const pgDump = process.env.AUX_PG_DUMP || '/opt/homebrew/opt/libpq/bin/pg_dump';
const pgRestore = process.env.AUX_PG_RESTORE || '/opt/homebrew/opt/libpq/bin/pg_restore';
let phase = 'arguments';
function separateKey(bundle, key) {
  assert(!resolve(key).startsWith(resolve(bundle) + sep), 'Keep the recovery key outside the bundle');
}
async function capture() {
  assert(flags.includes('--quiesced'), 'Stop cloud writes/maintenance before capture and pass --quiesced; the tool does not stop them');
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
    const objects = (await db.query("SELECT pathname,expected_size,expected_sha256,content_type FROM aux_attachments WHERE state='ready' AND purpose<>'inference' ORDER BY pathname")).rows;
    assert(objects.length <= 100_000, 'Review recovery capacity before exporting more than 100000 objects');
    const total = objects.reduce((n, o) => n + Number(o.expected_size), 0);
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
      for (let i = 0; i < objects.length; i++) {
        phase = 'private object path';
        const object = objects[i];
        assert(/^aux\/[0-9a-f-]{36}\/[0-9a-f-]{36}\/content$/.test(object.pathname), 'Unexpected private object path');
        phase = 'private object download';
        const response = await get(object.pathname, { access: 'private', useCache: false, abortSignal: AbortSignal.timeout(120000) });
        assert(response && response.statusCode === 200, 'Referenced private object is missing; snapshot is incomplete');
        phase = 'private object store binding';
        assert.equal(new URL(response.blob.url).hostname, 'uur9brkrqm4lu0z2.private.blob.vercel-storage.com');
        phase = 'private object size';
        // SDK2.8 reports size0 when a chunked origin omits Content-Length.
        // An advertised length must match; the streamed count/hash remain mandatory.
        if (response.headers.has('content-length')) assert.equal(response.blob.size, Number(object.expected_size));
        phase = 'private object content type';
        assert.equal(response.blob.contentType.split(';')[0], object.content_type);
        let size = 0;
        const hash = createHash('sha256');
        const checked = new Transform({ transform(chunk, _encoding, done) {
          size += chunk.length;
          if (size > Number(object.expected_size)) return done(Error('Private object grew during export'));
          hash.update(chunk); done(null, chunk);
        }, flush(done) {
          done(size === Number(object.expected_size) && hash.digest('hex') === object.expected_sha256 ? null : Error('Private object hash mismatch'));
        } });
        // Readable.compose propagates input errors and backpressure to the encrypted writer.
        phase = 'private object stream';
        const source = Readable.fromWeb(response.stream).compose(checked);
        yield { name: `blob-${i}.bin`, source, object };
      }
    }
    phase = 'sealed bundle';
    const result = await writeBundle({ directory, key, maxBytes: budget, entries: entries(), metadata: {
      resource: { project: 'ancient-river-76453764', branch: 'br-red-hall-b857cl2i', blob: 'store_UUr9bRkRQm4lu0Z2' },
      migrations: manifest, wrappingKey, retentionDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      quiescedByOperator: true, readyObjects: objects.length,
      excludes: ['provider API credentials', 'all ephemeral inference files and uploads not ready at snapshot', 'provider webhook history outside Aux'],
    } });
    await db.query('COMMIT');
    console.log(JSON.stringify({ kind: 'sealed-local-recovery-bundle', ...result, readyObjects: objects.length, productionActivated: false }));
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
    assert(directory && keyFile, 'Usage: capture bundle-directory key-file --quiesced --max-bytes=N');
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
  const category = /^PostgreSQL recovery tool failed: (TLS validation|snapshot|database permission|tool version|archive command)$/.test(error?.message || '') ? error.message : 'Check private key, integrity, byte budget and quiescence';
  const code = /^[A-Z_0-9]{1,64}$/.test(error?.code || '') ? error.code : 'UNCLASSIFIED';
  console.error(`Recovery operation failed at ${phase} (${code}). ${category}. No cutover performed.`);
  process.exitCode = 1;
}
