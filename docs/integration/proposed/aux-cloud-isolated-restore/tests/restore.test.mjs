import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdtemp, readFile, readdir, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readOnlineSnapshotObjects } from '../../../../../services/aux-cloud/scripts/online-recovery-objects.mjs';
import { validateOnlineRestoreManifest, sanitizeRestoredDatabase, restorePrivateObjects, verifyRestoreArchive } from '../../../../../services/aux-cloud/scripts/recovery-restore-core.mjs';

const service = process.env.AUX_TEST_SERVICE_ROOT || fileURLToPath(new URL('../../../../../services/aux-cloud/', import.meta.url));
const require = createRequire(join(service, 'package.json'));
const { PGlite } = require('@electric-sql/pglite');
const { writeBundle, unpackBundle } = await import(pathToFileURL(join(service, 'scripts/recovery-bundle.mjs')));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

test('isolated restore binds both object families, quarantines auth/transients and refuses collisions without data reset', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw Error('Unexpected network access'); };
  const pg = new PGlite();
  const root = await realpath(await mkdtemp(join(tmpdir(), 'aux-restore-fixture-')));
  try {
    const migrations = JSON.parse(await readFile(join(service, 'src/schema-manifest.json')));
    assert.equal(Object.keys(migrations).length, 12);
    for (const name of (await readdir(join(service, 'migrations'))).filter(name => name.endsWith('.sql')).sort()) {
      const bytes = await readFile(join(service, 'migrations', name));
      assert.equal(hash(bytes), migrations[name]);
      let ddl = bytes.toString();
      if (name === '001-auth.sql') { assert.equal(ddl.split('CREATE EXTENSION IF NOT EXISTS pgcrypto;').length, 2); ddl = ddl.replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;', ''); }
      await pg.exec(ddl);
    }
    await pg.exec('CREATE TABLE aux_migrations(name text PRIMARY KEY,sha256 text NOT NULL)');
    for (const [name, digest] of Object.entries(migrations)) await pg.query('INSERT INTO aux_migrations VALUES($1,$2)', [name, digest]);
    const user = randomUUID(), removedUser = randomUUID(), session = randomUUID(), blobId = randomUUID();
    const avatar = `avatars/${user}/${randomUUID()}`, pathname = `aux/${user}/${blobId}/content`;
    const data = Buffer.from('{"messages":["preserved encrypted snapshot fixture"]}'), image = Buffer.from('synthetic private avatar');
    await pg.query("INSERT INTO aux_users(id,clerk_id,email,avatar_path,avatar_mime,sync_generation) VALUES($1,'fixture-owner','owner@example.invalid',$2,'image/png',3)", [user, avatar]);
    await pg.query("INSERT INTO aux_users(id,clerk_id,email,deleted_at,sync_generation) VALUES($1,'fixture-deleted','deleted@example.invalid',now(),9)", [removedUser]);
    await pg.query("INSERT INTO aux_sessions(id,user_id,access_hash,access_expires_at,expires_at,platform) VALUES($1,$2,'old-access',now()+interval '1day',now()+interval '2days','macos')", [session, user]);
    await pg.query("INSERT INTO aux_refresh_tokens(token_hash,session_id,rotation_reply) VALUES('old-refresh',$1,'old-encrypted-reply')", [session]);
    await pg.query("INSERT INTO aux_email_challenges(email,code_hash,expires_at) VALUES('owner@example.invalid','old-email-code',now()+interval '1day')");
    await pg.query("INSERT INTO aux_device_requests(device_code_hash,user_code_hash,device_name,requested_email_hash) VALUES('old-device','old-code','fixture','old-email')");
    await pg.query("INSERT INTO aux_rate_limits(key,window_start,expires_at) VALUES('old-rate',1,now()+interval '1day')");
    const wrapped = { mode: 'server_wrapped', ct: 'opaque-existing-CSK', v: 1 };
    await pg.query('INSERT INTO sync_keys(user_id,generation,wrapped_key) VALUES($1,3,$2)', [user, wrapped]);
    await pg.query("INSERT INTO aux_sync_recovery_v2 VALUES($1,3,1,$2,$3,$4,$5,now())", [user, randomUUID(), { format: 'aux.sync-recovery.v2', encrypted: 'opaque-kept' }, 'a'.repeat(64), session]);
    await pg.query("INSERT INTO aux_sync_recovery_challenges_v2(id,user_id,session_id,fingerprint,generation,operation,request_hash,nonce,expires_at) VALUES($1,$2,$3,'old-fingerprint',3,'material',$4,'old-nonce',now()+interval '1day')", [randomUUID(), user, session, 'b'.repeat(64)]);
    for (const [id, purpose, state] of [[blobId, 'attachment', 'ready'], [randomUUID(), 'inference', 'ready'], [randomUUID(), 'attachment', 'issued']]) {
      await pg.query(`INSERT INTO aux_attachments(id,user_id,pathname,name,content_type,expected_size,expected_sha256,purpose,state,expires_at)
        VALUES($1,$2,$3,'fixture','application/json',$4,$5,$6,$7,now()+interval '1day')`,
        [id, user, `aux/${user}/${id}/content`, data.length, hash(data), purpose, state]);
    }
    await pg.query("INSERT INTO aux_session_snapshots(user_id,session_id,generation,blob_id) VALUES($1,'kept-session',3,$2)", [user, blobId]);
    const sharedMessages = [{ role: 'user', content: 'preserved share content' }];
    await pg.query("INSERT INTO shared_sessions(id,user_id,source_session_id,title,messages) VALUES('restore-share-fixture',$1,'kept-session','fixture',$2)", [user, sharedMessages]);
    const references = await readOnlineSnapshotObjects(pg);
    const payload = new Map([[pathname, data], [avatar, image]]);
    const objects = references.map((object, index) => ({ name: `blob-${index}.bin`, source: Readable.from([payload.get(object.pathname)]),
      object: { ...object, observed_size: payload.get(object.pathname).length, observed_sha256: hash(payload.get(object.pathname)) } }));
    const key = randomBytes(32), sealed = join(root, 'sealed'), directory = join(root, 'unpacked');
    await writeBundle({ directory: sealed, key, maxBytes: 1024 * 1024, metadata: {
      migrations, retentionDeadline: new Date(Date.now() + 86_400_000).toISOString(),
      consistency: 'exported-postgres-snapshot-with-complete-immutable-object-copies.v1', resource: { blob: 'store_SyntheticSource' },
    }, entries: [{ name: 'database.dump', source: Readable.from([Buffer.from('PGDMP synthetic')]) }, ...objects] });
    const { manifest } = await unpackBundle({ directory: sealed, key, destination: directory, maxBytes: 1024 * 1024 });
    const plan = validateOnlineRestoreManifest(manifest, migrations);
    await verifyRestoreArchive(directory, plan.archive);
    const wrong = structuredClone(manifest); wrong.files.find(entry => entry.object).object.content_type = 'text/plain';
    await assert.rejects(sanitizeRestoredDatabase(pg, wrong, migrations), /binding/);
    assert.equal((await pg.query('SELECT count(*)::int AS count FROM aux_sessions WHERE revoked_at IS NULL')).rows[0].count, 1, 'mismatch rolled back before quarantine');
    const result = await sanitizeRestoredDatabase(pg, manifest, migrations);
    assert.equal(result.revokedSessions, 1);
    for (const table of ['aux_refresh_tokens', 'aux_email_challenges', 'aux_device_requests', 'aux_sync_recovery_challenges_v2', 'aux_rate_limits'])
      assert.equal((await pg.query('SELECT count(*)::int AS count FROM ' + table)).rows[0].count, 0);
    assert.equal((await pg.query("SELECT count(*)::int AS count FROM aux_sessions WHERE access_hash='old-access' AND revoked_at IS NULL AND expires_at>now()")).rows[0].count, 0);
    assert.deepEqual((await pg.query('SELECT wrapped_key FROM sync_keys WHERE user_id=$1', [user])).rows[0].wrapped_key, wrapped);
    assert.equal((await pg.query('SELECT count(*)::int AS count FROM aux_sync_recovery_v2')).rows[0].count, 1);
    assert.equal((await pg.query('SELECT sync_generation FROM aux_users WHERE id=$1', [user])).rows[0].sync_generation, 3);
    assert((await pg.query('SELECT deleted_at FROM aux_users WHERE id=$1', [removedUser])).rows[0].deleted_at);
    assert.equal((await pg.query("SELECT count(*)::int AS count FROM aux_attachments WHERE state='deleted'")).rows[0].count, 2);
    assert.equal((await pg.query("SELECT blob_id FROM aux_session_snapshots WHERE session_id='kept-session'")).rows[0].blob_id, blobId);
    const share = (await pg.query("SELECT messages,revoked_at FROM shared_sessions WHERE id='restore-share-fixture'")).rows[0];
    assert.deepEqual(share.messages, sharedMessages); assert(share.revoked_at);
    const store = new Map(), receipts = [], targetHostname = 'synthetictarget.private.blob.invalid';
    const storage = {
      head: async path => store.has(path) ? { exists: true } : null,
      put: async (path, bytes, options) => { assert.equal(options.allowOverwrite, false); assert.equal(options.access, 'private'); assert(!store.has(path)); store.set(path, { bytes: Buffer.from(bytes), contentType: options.contentType }); return { pathname: path, url: `https://${targetHostname}/${path}` }; },
      get: async path => { const object = store.get(path); return { statusCode: 200, blob: { pathname: path, url: `https://${targetHostname}/${path}`, contentType: object.contentType }, stream: Readable.toWeb(Readable.from([object.bytes])) }; },
    };
    const restored = await restorePrivateObjects({ objects: plan.objects, directory, targetHostname, storage, checkpoint: async event => receipts.push(event) });
    assert.equal(restored.objectsVerified, 2); assert.equal(restored.databaseOrDeploymentActivated, false);
    assert.deepEqual(store.get(pathname).bytes, data); assert.deepEqual(store.get(avatar).bytes, image);
    assert.deepEqual(receipts.map(row => row.phase), ['object-write-intent', 'object-verified', 'object-write-intent', 'object-verified']);
    await assert.rejects(restorePrivateObjects({ objects: plan.objects, directory, targetHostname, storage, checkpoint: async () => {} }), /already exists/);
    assert.equal(store.size, 2, 'collision never overwrote or deleted bytes');
  } finally { await pg.close(); await rm(root, { recursive: true, force: true }); globalThis.fetch = previousFetch; }
});
