// Explicit operator drill. No provisioning, traffic changes or existing-object adoption.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const service = fileURLToPath(new URL('../../../../services/aux-cloud/', import.meta.url));
const require = createRequire(join(service, 'package.json'));
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { get, put, del, head, BlobNotFoundError } = require('@vercel/blob');
const [privateDirectory, reviewPath] = process.argv.slice(2);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
let source, target, targetAdmin, stage = 'admission', root, sequence = 0;
let sourceSeeded = false, sourceCleaned = false;
const ownedObjects = [];
const user = randomUUID(), deletedUser = randomUUID(), session = randomUUID(), attachment = randomUUID();
const share = 'restore-' + randomUUID(), email = user + '@example.invalid';
const rateKey = 'restore-' + user, device = 'restore-' + randomUUID();
const pathname = `aux/${user}/${attachment}/content`, avatar = `avatars/${user}/${randomUUID()}`;
const payloads = new Map([[pathname, randomBytes(65536)], [avatar, Buffer.from('synthetic hosted private avatar')]]);
const csk = randomBytes(32);
async function privateEnv(path) {
  const info = await lstat(path);
  assert(info.isFile() && !info.isSymbolicLink() && info.uid === process.getuid() && (info.mode & 0o777) === 0o600);
  return parseEnv(await readFile(path, 'utf8'));
}
async function checkpoint(value) {
  await writeFile(join(root, String(sequence++).padStart(4, '0') + '.json'), JSON.stringify({ stage, ...value }) + '\n', { mode: 0o600, flag: 'wx' });
}
async function run(script, args, env) {
  const child = spawn(process.execPath, [join(service, 'scripts', script), ...args], { cwd: service, env, stdio: 'ignore' });
  await new Promise((accept, reject) => {
    let spawned = false, uncertain = false;
    child.once('spawn', () => { spawned = true; });
    child.on('error', () => { uncertain = true; if (!spawned) reject(Error('CLI unavailable')); });
    child.once('exit', code => code === 0 && !uncertain ? accept() : reject(Error('CLI failed or uncertain')));
    // No wrapper timeout can kill a CLI while its importer still owns staging.
  });
}
async function verifyObject(path, token, hostname) {
  const response = await get(path, { token, access: 'private', useCache: false });
  assert(response && response.statusCode === 200 && new URL(response.blob.url).hostname === hostname);
  const bytes = Buffer.from(await new Response(response.stream).arrayBuffer());
  assert.equal(hash(bytes), hash(payloads.get(path)));
}
async function removeSourceFixtures(sourceToken, sourceHostname) {
  for (const path of ownedObjects) {
    await verifyObject(path, sourceToken, sourceHostname);
    await del(path, { token: sourceToken });
    await assert.rejects(() => head(path, { token: sourceToken }), BlobNotFoundError);
  }
  if (sourceSeeded) {
    await source.query('BEGIN');
    try {
      await source.query('DELETE FROM aux_email_challenges WHERE email=$1', [email]);
      await source.query('DELETE FROM aux_device_requests WHERE device_code_hash=$1', [device]);
      await source.query('DELETE FROM aux_rate_limits WHERE key=$1', [rateKey]);
      await source.query('DELETE FROM aux_refresh_tokens WHERE session_id=$1', [session]);
      await source.query('DELETE FROM aux_sessions WHERE id=$1 AND user_id=$2', [session, user]);
      await source.query('DELETE FROM aux_users WHERE id IN ($1,$2) AND clerk_id IN ($3,$4)', [user, deletedUser, 'restore-' + user, 'restore-' + deletedUser]);
      await source.query('COMMIT');
    } catch (error) { await source.query('ROLLBACK'); throw error; }
    assert.equal(Number((await source.query('SELECT count(*) FROM aux_users WHERE id IN ($1,$2)', [user, deletedUser])).rows[0].count), 0);
  }
  sourceCleaned = true;
}
try {
  assert(privateDirectory && reviewPath);
  root = resolve(privateDirectory);
  await mkdir(root, { mode: 0o700 });
  assert.equal(await realpath(root), root);
  const review = JSON.parse(await readFile(reviewPath));
  assert.equal(review.format, 'aux.hosted-restore-12.review.v1');
  assert.equal(review.sourceProject, 'ancient-river-76453764');
  assert.equal(review.sourceHost, 'ep-red-snow-b8ctxcyx.c-14.us-east-1.aws.neon.tech');
  assert.equal(review.sourceBlob, 'uur9brkrqm4lu0z2.private.blob.vercel-storage.com');
  assert.equal(review.targetBlob, '6koqauoahm1ivxeq.private.blob.vercel-storage.com');
  assert.equal(review.targetBranch, 'br-dark-bread-b8v0xmd8');
  assert.equal(review.targetHost, 'ep-small-band-b87iop7i.c-14.us-east-1.aws.neon.tech');
  assert.equal(review.targetDatabase, 'aux_recovery_12_20261023');
  assert(review.targetComputeCu === 0.25 && review.targetExpiryHours === 1 && review.targetUnserved === true);
  assert(/^[a-z_][a-z0-9_]{0,62}$/.test(review.targetDatabase));
  const bootstrap = await privateEnv(join(service, '.env.production-bootstrap.local'));
  const secrets = await privateEnv(join(service, '.env.production-secrets.local'));
  const development = await privateEnv(join(service, '.env.local'));
  const sourceUrl = new URL(bootstrap.DATABASE_URL_UNPOOLED);
  const targetUrl = new URL(sourceUrl);
  targetUrl.hostname = review.targetHost;
  targetUrl.pathname = '/' + review.targetDatabase;
  assert.equal(sourceUrl.hostname, review.sourceHost);
  assert.equal(bootstrap.NEON_PROJECT_ID, review.sourceProject);
  assert.equal(targetUrl.hostname, review.targetHost);
  assert(targetUrl.hostname.endsWith('.neon.tech') && !targetUrl.hostname.includes('-pooler.') && targetUrl.hostname !== sourceUrl.hostname);
  assert.equal(decodeURIComponent(targetUrl.pathname.slice(1)), review.targetDatabase);
  const sourceToken = bootstrap.BLOB_READ_WRITE_TOKEN;
  const targetToken = development.BLOB_READ_WRITE_TOKEN;
  for (const [token, hostname] of [[sourceToken, review.sourceBlob], [targetToken, review.targetBlob]])
    assert.equal(token.split('_')[3].toLowerCase() + '.private.blob.vercel-storage.com', hostname);
  const env = { PATH: process.env.PATH, LANG: 'C', DATABASE_URL_UNPOOLED: bootstrap.DATABASE_URL_UNPOOLED,
    NEON_PROJECT_ID: bootstrap.NEON_PROJECT_ID, BLOB_READ_WRITE_TOKEN: sourceToken,
    AUX_DATA_ENCRYPTION_KEY: secrets.AUX_DATA_ENCRYPTION_KEY };
  neonConfig.webSocketConstructor = globalThis.WebSocket;
  source = new Pool({ connectionString: sourceUrl.toString(), max: 1 });
  const adminUrl = new URL(targetUrl); adminUrl.pathname = '/neondb';
  targetAdmin = new Pool({ connectionString: adminUrl.toString(), max: 1 });
  stage = 'empty resource and schema preflight';
  const migrations = JSON.parse(await readFile(join(service, 'src/schema-manifest.json')));
  assert.equal(Object.keys(migrations).length, 12);
  assert.deepEqual(Object.fromEntries((await source.query('SELECT name,sha256 FROM aux_migrations ORDER BY name')).rows.map(row => [row.name, row.sha256])), migrations);
  const tables = (await source.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename<>'aux_migrations' ORDER BY tablename")).rows;
  assert.equal(tables.length, 29);
  for (const { tablename } of tables) {
    assert(/^[a-z_][a-z0-9_]*$/.test(tablename));
    assert.equal(Number((await source.query('SELECT count(*) FROM "' + tablename + '"')).rows[0].count), 0);
  }
  await targetAdmin.query('CREATE DATABASE "' + review.targetDatabase + '" TEMPLATE template0');
  await targetAdmin.end(); targetAdmin = null;
  target = new Pool({ connectionString: targetUrl.toString(), max: 1 });
  assert.equal(Number((await target.query("SELECT count(*) FROM pg_tables WHERE schemaname='public'")).rows[0].count), 0);
  for (const path of payloads.keys()) {
    await assert.rejects(() => head(path, { token: sourceToken }), BlobNotFoundError);
    await assert.rejects(() => head(path, { token: targetToken }), BlobNotFoundError);
  }
  await checkpoint({ sourceEmptyTables: tables.length, migrations: 12, targetHost: review.targetHost, targetBranch: review.targetBranch });
  stage = 'synthetic fixture';
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', Buffer.from(env.AUX_DATA_ENCRYPTION_KEY, 'base64'), iv);
  cipher.setAAD(Buffer.from(`aux.sync-key.v1:${user}:3`));
  const wrapped = { mode: 'server_wrapped', v: 1, iv: iv.toString('base64'), ct: Buffer.concat([cipher.update(csk), cipher.final()]).toString('base64'), tag: cipher.getAuthTag().toString('base64') };
  await source.query('BEGIN');
  try {
    await source.query("INSERT INTO aux_users(id,clerk_id,email,avatar_path,avatar_mime,sync_generation) VALUES($1,$2,$3,$4,'image/png',3)", [user, 'restore-' + user, email, avatar]);
    await source.query("INSERT INTO aux_users(id,clerk_id,email,deleted_at,sync_generation) VALUES($1,$2,$3,now(),9)", [deletedUser, 'restore-' + deletedUser, deletedUser + '@example.invalid']);
    await source.query("INSERT INTO aux_sessions(id,user_id,access_hash,access_expires_at,expires_at,platform) VALUES($1,$2,'old-access',now()+interval '1day',now()+interval '2days','macos')", [session, user]);
    await source.query("INSERT INTO aux_refresh_tokens(token_hash,session_id,rotation_reply) VALUES($1,$2,'old-reply')", ['restore-' + user, session]);
    await source.query("INSERT INTO aux_email_challenges(email,code_hash,expires_at) VALUES($1,'old-code',now()+interval '1day')", [email]);
    await source.query("INSERT INTO aux_device_requests(device_code_hash,user_code_hash,device_name,requested_email_hash) VALUES($1,$2,'fixture','old-email')", [device, device]);
    await source.query("INSERT INTO aux_rate_limits(key,window_start,expires_at) VALUES($1,1,now()+interval '1day')", [rateKey]);
    await source.query('INSERT INTO sync_keys(user_id,generation,wrapped_key) VALUES($1,3,$2)', [user, wrapped]);
    await source.query('INSERT INTO aux_sync_recovery_v2 VALUES($1,3,1,$2,$3,$4,$5,now())', [user, randomUUID(), { format: 'aux.sync-recovery.v2', encrypted: 'opaque-kept' }, 'a'.repeat(64), session]);
    await source.query("INSERT INTO aux_sync_recovery_challenges_v2(id,user_id,session_id,fingerprint,generation,operation,request_hash,nonce,expires_at) VALUES($1,$2,$3,'old-fingerprint',3,'material',$4,'old-nonce',now()+interval '1day')", [randomUUID(), user, session, 'b'.repeat(64)]);
    for (const [id, purpose, state] of [[attachment, 'attachment', 'ready'], [randomUUID(), 'inference', 'ready'], [randomUUID(), 'attachment', 'issued']])
      await source.query("INSERT INTO aux_attachments(id,user_id,pathname,name,content_type,expected_size,expected_sha256,purpose,state,expires_at) VALUES($1,$2,$3,'fixture','application/octet-stream',$4,$5,$6,$7,now()+interval '1day')", [id, user, `aux/${user}/${id}/content`, payloads.get(pathname).length, hash(payloads.get(pathname)), purpose, state]);
    await source.query("INSERT INTO aux_session_snapshots(user_id,session_id,generation,blob_id) VALUES($1,'kept-session',3,$2)", [user, attachment]);
    await source.query("INSERT INTO shared_sessions(id,user_id,source_session_id,title,messages) VALUES($1,$2,'kept-session','fixture',$3)", [share, user, JSON.stringify([{ role: 'user', content: 'preserved fixture' }])]);
    await source.query('COMMIT'); sourceSeeded = true;
  } catch (error) { await source.query('ROLLBACK'); throw error; }
  for (const [path, bytes] of payloads) {
    ownedObjects.push(path);
    const object = await put(path, bytes, { token: sourceToken, access: 'private', contentType: path === avatar ? 'image/png' : 'application/octet-stream', addRandomSuffix: false, allowOverwrite: false });
    assert.equal(new URL(object.url).hostname, review.sourceBlob);
  }
  const key = join(root, 'recovery.key'), bundle = join(root, 'bundle');
  await writeFile(key, randomBytes(32).toString('hex') + '\n', { mode: 0o600, flag: 'wx' });
  stage = 'actual online capture CLI';
  await run('cloud-recovery-online.mjs', ['capture', bundle, key, '--max-bytes=10485760'], env);
  stage = 'owned source cleanup';
  await removeSourceFixtures(sourceToken, review.sourceBlob);
  for (const { tablename } of tables)
    assert.equal(Number((await source.query('SELECT count(*) FROM "' + tablename + '"')).rows[0].count), 0);
  await checkpoint({ sourceFixturesRemoved: true, sourceEmptyTables: tables.length });
  const targetReview = join(root, 'target.json');
  await writeFile(targetReview, JSON.stringify({ format: 'aux.isolated-restore-target.v1', databaseHost: review.targetHost, databaseName: review.targetDatabase, blobHostname: review.targetBlob }), { mode: 0o600, flag: 'wx' });
  stage = 'actual isolated restore CLI';
  await run('cloud-recovery-restore.mjs', [bundle, key, targetReview, join(root, 'restore-progress'), '--max-bytes=10485760'], {
    PATH: process.env.PATH, LANG: 'C', AUX_RESTORE_DATABASE_URL: targetUrl.toString(),
    AUX_RESTORE_BLOB_READ_WRITE_TOKEN: targetToken, AUX_RESTORE_DATA_ENCRYPTION_KEY: env.AUX_DATA_ENCRYPTION_KEY,
  });
  stage = 'restored quarantine and key acceptance';
  assert.deepEqual(Object.fromEntries((await target.query('SELECT name,sha256 FROM aux_migrations ORDER BY name')).rows.map(row => [row.name, row.sha256])), migrations);
  assert.equal(Number((await target.query('SELECT count(*) FROM aux_sessions WHERE revoked_at IS NULL')).rows[0].count), 0);
  for (const table of ['aux_refresh_tokens', 'aux_email_challenges', 'aux_device_requests', 'aux_sync_recovery_challenges_v2', 'aux_rate_limits'])
    assert.equal(Number((await target.query('SELECT count(*) FROM ' + table)).rows[0].count), 0);
  const recovered = (await target.query('SELECT wrapped_key,generation FROM sync_keys WHERE user_id=$1', [user])).rows[0];
  assert.equal(recovered.generation, 3); assert.deepEqual(recovered.wrapped_key, wrapped);
  const decipher = createDecipheriv('aes-256-gcm', Buffer.from(env.AUX_DATA_ENCRYPTION_KEY, 'base64'), Buffer.from(wrapped.iv, 'base64'));
  decipher.setAAD(Buffer.from(`aux.sync-key.v1:${user}:3`)); decipher.setAuthTag(Buffer.from(wrapped.tag, 'base64'));
  const clear = Buffer.concat([decipher.update(Buffer.from(wrapped.ct, 'base64')), decipher.final()]);
  assert(clear.equals(csk)); clear.fill(0);
  assert.equal((await target.query('SELECT sync_generation FROM aux_users WHERE id=$1', [user])).rows[0].sync_generation, 3);
  assert((await target.query('SELECT deleted_at FROM aux_users WHERE id=$1', [deletedUser])).rows[0].deleted_at);
  assert.equal(Number((await target.query('SELECT count(*) FROM aux_sync_recovery_v2')).rows[0].count), 1);
  assert.equal(Number((await target.query("SELECT count(*) FROM aux_attachments WHERE state='deleted'")).rows[0].count), 2);
  assert.equal((await target.query("SELECT blob_id FROM aux_session_snapshots WHERE user_id=$1", [user])).rows[0].blob_id, attachment);
  assert((await target.query('SELECT revoked_at FROM shared_sessions WHERE id=$1', [share])).rows[0].revoked_at);
  for (const path of payloads.keys()) await verifyObject(path, targetToken, review.targetBlob);
  await checkpoint({ success: true, migrations: 12, realCaptureCli: true, realRestoreCli: true, recoveredCSK: true, bothPrivateObjectFamilies: true,
    quarantineVerified: true, sourceFixturesRemoved: true, targetRetainedForExplicitCleanup: true, targetObjectPaths: [...payloads.keys()], targetDatabase: review.targetDatabase, targetBranch: review.targetBranch, productionActivated: false });
  console.log('Current12 hosted capture/restore and private-object acceptance passed; isolated target retained for reviewed cleanup.');
} catch {
  if (root) await checkpoint({ success: false, stoppedForReview: true, sourceSeeded, sourceCleaned, generatedSourceUsers: [user, deletedUser], ownedObjectPaths: ownedObjects, partialTargetsRetained: true }).catch(() => {});
  console.error('Hosted drill stopped at ' + stage + '; retain private artifacts and partial targets for review.');
  process.exitCode = 1;
} finally {
  csk.fill(0);
  await source?.end(); await target?.end(); await targetAdmin?.end();
}
