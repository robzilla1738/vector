import assert from 'node:assert/strict';
import { neon } from '@neondatabase/serverless';
import { put, del, head, get, BlobNotFoundError } from '@vercel/blob';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

assert.equal(process.env.AUX_ALLOW_PRODUCTION_BOOTSTRAP_CHECK, '1', 'Explicit disposable bootstrap check required');
assert.equal(process.env.NEON_PROJECT_ID, 'ancient-river-76453764');
assert.equal(new URL(process.env.DATABASE_URL).hostname, 'ep-red-snow-b8ctxcyx-pooler.c-14.us-east-1.aws.neon.tech');
const root = resolve(process.argv[2]);
const sql = neon(process.env.DATABASE_URL);
const [existing] = await sql`SELECT count(*)::int AS count FROM aux_users`;
assert.equal(existing.count, 0, 'Only the new inactive, empty production database may be used');
const user = randomUUID(), id = randomUUID(), pathname = `aux/${user}/${id}/content`;
const bytes = randomBytes(1024 * 1024), digest = v => createHash('sha256').update(v).digest('hex');
let blob, success = false;
async function run(args) {
  await new Promise((done, fail) => {
    const child = spawn(process.execPath, ['scripts/cloud-recovery.mjs', ...args], { env: process.env, stdio: ['ignore', 'inherit', 'inherit'] });
    child.once('error', fail); child.once('exit', code => code === 0 ? done() : fail(Error('Recovery capture check failed')));
  });
}
try {
  await sql`INSERT INTO aux_users(id,clerk_id,email,name) VALUES(${user},${'recovery_fixture_' + user},${user + '@example.invalid'},'Disposable recovery fixture')`;
  blob = await put(pathname, bytes, { access: 'private', addRandomSuffix: false, contentType: 'application/octet-stream' });
  assert.equal(new URL(blob.url).hostname, 'uur9brkrqm4lu0z2.private.blob.vercel-storage.com');
  const observed = await get(blob.url, { access: 'private', useCache: false });
  assert.equal(observed.statusCode, 200);
  console.log(JSON.stringify({ syntheticPrivateRead: { sdkSize: observed.blob.size, contentLength: observed.headers.get('content-length'), chunked: observed.headers.get('transfer-encoding') === 'chunked' } }));
  await observed.stream.cancel();
  await sql`INSERT INTO aux_attachments(id,user_id,pathname,name,content_type,expected_size,expected_sha256,purpose,state,expires_at) VALUES(${id},${user},${pathname},'synthetic.bin','application/octet-stream',${bytes.length},${digest(bytes)},'attachment','ready',now()+interval '15 minutes')`;
  await run(['capture', join(root, 'sealed'), join(root, 'recovery-key.local'), '--quiesced', '--max-bytes=5242880']);
  // Remove the source object before recovering the local copy. Never touch another path.
  await del(blob.url);
  await assert.rejects(() => head(blob.url), BlobNotFoundError);
  await run(['unpack', join(root, 'sealed'), join(root, 'recovery-key.local'), '--destination=' + join(root, 'recovered'), '--max-bytes=5242880']);
  const manifest = JSON.parse(await readFile(join(root, 'recovered/manifest.json')));
  assert.equal(manifest.files.length, 2);
  assert.equal(manifest.metadata.wrappingKey, process.env.AUX_DATA_ENCRYPTION_KEY);
  assert.equal(manifest.files.find(f => f.name === 'blob-0.bin').object.pathname, pathname);
  assert.equal(digest(await readFile(join(root, 'recovered/blob-0.bin'))), digest(bytes));
  success = true;
} finally {
  if (blob) await del(blob.url);
  await sql`DELETE FROM aux_users WHERE id=${user} AND clerk_id=${'recovery_fixture_' + user}`;
  const [left] = await sql`SELECT count(*)::int AS count FROM aux_users WHERE id=${user}`;
  assert.equal(left.count, 0);
  const proof = { kind: 'local-sealed-recovery-capture', checkedAt: new Date().toISOString(), success, syntheticSourceBytes: bytes.length,
    actualPostgresCustomArchive: success, archiveIndexReadableAfterDecrypt: success, lostSyntheticPrivateFileRecoveredLocally: success,
    wrappingKeyRecovered: success, fixtureUserRemoved: true, fixtureBlobRemoved: true, databaseRestoredIntoSeparateCompute: false,
    durableBackupDestination: false, independentKeyCustody: false, productionActivated: false, desktopUiChanged: false };
  await writeFile(join(root, 'proof.json'), JSON.stringify(proof, null, 2) + '\n', { mode: 0o600 });
  console.log(JSON.stringify(proof));
}
