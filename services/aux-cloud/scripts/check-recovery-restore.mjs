import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { spawn } from 'node:child_process';
import { createHash, createDecipheriv } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { put, get, head, del, BlobNotFoundError } from '@vercel/blob';

// This is the one reviewed disposable branch, not a general live restore command.
assert.equal(process.env.AUX_ALLOW_ISOLATED_RESTORE, 'br-dawn-pond-b8ycf4rt');
assert.equal(process.env.NEON_PROJECT_ID, 'ancient-river-76453764');
const source = new URL(process.env.DATABASE_URL_UNPOOLED);
assert.equal(source.hostname, 'ep-red-snow-b8ctxcyx.c-14.us-east-1.aws.neon.tech');
const target = new URL(source);
target.hostname = 'ep-autumn-glade-b8wp7k2h.c-14.us-east-1.aws.neon.tech';
const database = 'aux_recovery_fixture_20261022', root = resolve(process.argv[2]);
const pgEnv = { PATH: process.env.PATH, HOME: process.env.HOME, LANG: 'C', PGHOST: target.hostname, PGPORT: '5432', PGDATABASE: 'neondb', PGUSER: decodeURIComponent(target.username), PGPASSWORD: decodeURIComponent(target.password), PGSSLMODE: 'verify-full', PGSSLROOTCERT: 'system', PGCONNECT_TIMEOUT: '20', PGOPTIONS: '-c statement_timeout=300000 -c lock_timeout=10000' };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
let created = false, blob, success = false, databaseRemoved = false, blobRemoved = false, stage = 'fixture admission';
async function run(binary, args, selectedDatabase = 'neondb') {
  await new Promise((done, fail) => {
    const child = spawn('/opt/homebrew/opt/libpq/bin/' + binary, args, { env: { ...pgEnv, PGDATABASE: selectedDatabase }, stdio: ['ignore', 'ignore', 'pipe'] });
    let errorText = '';
    child.stderr.on('data', bytes => { if (errorText.length < 8192) errorText += bytes.toString(); });
    child.once('error', () => fail(Error('PostgreSQL tool unavailable')));
    child.once('exit', code => {
      if (code === 0) return done();
      const category = /permission denied|must have CREATEDB/i.test(errorText) ? 'permission' : /already exists/i.test(errorText) ? 'existing destination' : /SSL|certificate/i.test(errorText) ? 'TLS' : 'command';
      fail(Error('Isolated PostgreSQL ' + category + ' failure'));
    });
  });
}
try {
  const fixture = JSON.parse(await readFile(join(root, 'fixture.local.json')));
  const manifest = JSON.parse(await readFile(join(root, 'recovered/manifest.json')));
  assert.equal(manifest.metadata.resource.project, 'ancient-river-76453764');
  assert(Date.parse(manifest.metadata.retentionDeadline) > Date.now());
  assert.equal(manifest.files.length, 2);
  const object = manifest.files.find(entry => entry.name === 'blob-0.bin');
  assert.equal(object.object.pathname, fixture.pathname);
  assert.equal(fixture.pathname, `aux/${fixture.user}/${fixture.id}/content`);
  assert.equal(object.size, 1048576);
  const main = neon(source.toString());
  const [missing] = await main`SELECT count(*)::int AS count FROM aux_users WHERE id=${fixture.user}`;
  assert.equal(missing.count, 0, 'Synthetic source user must already be removed');
  await assert.rejects(() => head(fixture.pathname), BlobNotFoundError);
  stage = 'empty destination creation';
  await run('psql', ['--no-psqlrc', '--set=ON_ERROR_STOP=1', '--command=CREATE DATABASE ' + database + ' TEMPLATE template0']);
  created = true;
  target.pathname = '/' + database;
  const sql = neon(target.toString());
  const [before] = await sql`SELECT count(*)::int AS count FROM pg_tables WHERE schemaname='public'`;
  assert.equal(before.count, 0);
  stage = 'archive import';
  await run('pg_restore', ['--no-owner', '--no-privileges', '--single-transaction', '--exit-on-error', '--dbname=' + database, join(root, 'recovered/database.dump')], database);
  stage = 'restored schema and ownership';
  const rows = await sql`SELECT name,sha256 FROM aux_migrations ORDER BY name`;
  assert.deepEqual(Object.fromEntries(rows.map(row => [row.name, row.sha256])), manifest.metadata.migrations);
  const users = await sql`SELECT id,clerk_id FROM aux_users`;
  assert.equal(users.length, 1); assert.equal(users[0].id, fixture.user); assert.equal(users[0].clerk_id, 'recovery_fixture_' + fixture.user);
  const [attachment] = await sql`SELECT user_id,pathname,expected_sha256,expected_size,state FROM aux_attachments WHERE id=${fixture.id}`;
  assert.equal(attachment.user_id, fixture.user); assert.equal(attachment.pathname, fixture.pathname);
  assert.equal(attachment.expected_sha256, fixture.sha256); assert.equal(Number(attachment.expected_size), 1048576); assert.equal(attachment.state, 'ready');
  stage = 'recovered wrapping key decryption';
  const [stored] = await sql`SELECT generation,wrapped_key FROM sync_keys WHERE user_id=${fixture.user}`;
  const envelope = stored.wrapped_key;
  assert.equal(stored.generation, 0); assert.equal(envelope.mode, 'server_wrapped');
  const decipher = createDecipheriv('aes-256-gcm', Buffer.from(manifest.metadata.wrappingKey, 'base64'), Buffer.from(envelope.iv, 'base64'));
  decipher.setAAD(Buffer.from(`aux.sync-key.v1:${fixture.user}:0`)); decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
  const csk = Buffer.concat([decipher.update(Buffer.from(envelope.ct, 'base64')), decipher.final()]);
  assert.equal(hash(csk), fixture.cskSha256); csk.fill(0);
  stage = 'private file restoration';
  const bytes = await readFile(join(root, 'recovered/blob-0.bin'));
  assert.equal(hash(bytes), attachment.expected_sha256);
  blob = await put(fixture.pathname, bytes, { access: 'private', contentType: object.object.content_type, addRandomSuffix: false, allowOverwrite: false });
  assert.equal(new URL(blob.url).hostname, 'uur9brkrqm4lu0z2.private.blob.vercel-storage.com');
  const restored = await get(blob.url, { access: 'private', useCache: false });
  assert(restored && restored.statusCode === 200);
  assert.equal(hash(Buffer.from(await new Response(restored.stream).arrayBuffer())), attachment.expected_sha256);
  success = true;
} catch (error) {
  console.error(JSON.stringify({ isolatedRestoreFailed: true, stage, category: error instanceof assert.AssertionError ? 'acceptance mismatch' : 'provider/tool boundary' }));
  process.exitCode = 1;
} finally {
  if (blob) { await del(blob.url); await assert.rejects(() => head(blob.url), BlobNotFoundError); blobRemoved = true; }
  if (created) { await run('psql', ['--no-psqlrc', '--set=ON_ERROR_STOP=1', '--command=DROP DATABASE ' + database + ' WITH (FORCE)']); databaseRemoved = true; }
  const proof = { kind: 'isolated-postgres-private-file-wrapping-key-restore', checkedAt: new Date().toISOString(), success,
    project: 'ancient-river-76453764', branch: 'br-dawn-pond-b8ycf4rt', computeCu: 0.25, branchExpiryHours: 1,
    migrationsVerified: success ? 11 : 0, restoredOwnerAndAttachmentMatch: success, recoveredWrappingKeyDecryptsOriginalCSK: success,
    restoredPrivateFileHashMatches: success, restoredSyntheticBlobRemoved: blobRemoved, restoredDatabaseRemoved: databaseRemoved,
    branchDeleted: false, primaryReset: false, productionActivated: false, durableBackupConfigured: false, independentKeyCustody: false };
  await writeFile(join(root, 'restore-proof.json'), JSON.stringify(proof, null, 2) + '\n', { mode: 0o600 });
  console.log(JSON.stringify(proof));
}
