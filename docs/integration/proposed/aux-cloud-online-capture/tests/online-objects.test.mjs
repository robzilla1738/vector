import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm, access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Readable } from 'node:stream';
import { readOnlineSnapshotObjects, onlineBlobEntries } from '../source/online-recovery-objects.mjs';

const service = process.env.AUX_TEST_SERVICE_ROOT || fileURLToPath(new URL('../../../../../services/aux-cloud/', import.meta.url));
const require = createRequire(join(service, 'package.json'));
const { PGlite } = require('@electric-sql/pglite');
const { writeBundle, unpackBundle } = await import(pathToFileURL(join(service, 'scripts/recovery-bundle.mjs')));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const host = 'synthetic.private.blob.invalid';

// This is real private-filesystem bundle IO and the full actual SQL schema,
// with only Blob delivery and pg_dump bytes synthetic. No provider credentials.
test('online immutable snapshot copies survive later deletion; missing/truncated references cannot publish', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw Error('Unexpected network access'); };
  const pg = new PGlite();
  const root = await mkdtemp(join(tmpdir(), 'aux-online-capture-'));
  try {
    const manifest = JSON.parse(await readFile(join(service, 'src/schema-manifest.json')));
    const migrations = (await readdir(join(service, 'migrations'))).filter(name => name.endsWith('.sql')).sort();
    assert.equal(migrations.length, 12);
    for (const name of migrations) {
      const bytes = await readFile(join(service, 'migrations', name));
      assert.equal(hash(bytes), manifest[name]);
      let ddl = bytes.toString();
      if (name === '001-auth.sql') {
        assert.equal(ddl.split('CREATE EXTENSION IF NOT EXISTS pgcrypto;').length, 2);
        ddl = ddl.replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;', '');
      }
      await pg.exec(ddl);
    }
    const user = randomUUID(), attachmentId = randomUUID(), inferenceId = randomUUID();
    const attachment = `aux/${user}/${attachmentId}/content`, avatar = `avatars/${user}/${randomUUID()}`;
    const attachmentBytes = Buffer.from('immutable attachment fixture');
    const avatarBytes = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), randomBytes(31)]);
    await pg.query('INSERT INTO aux_users(id,clerk_id,email,avatar_path,avatar_mime) VALUES($1,$2,$3,$4,$5)',
      [user, 'online-fixture', 'online-fixture@example.invalid', avatar, 'image/png']);
    for (const [id, purpose] of [[attachmentId, 'attachment'], [inferenceId, 'inference']]) {
      await pg.query(`INSERT INTO aux_attachments(id,user_id,pathname,name,content_type,expected_size,expected_sha256,purpose,state,expires_at)
        VALUES($1,$2,$3,'fixture','application/octet-stream',$4,$5,$6,'ready',now()+interval '1day')`,
        [id, user, `aux/${user}/${id}/content`, attachmentBytes.length, hash(attachmentBytes), purpose]);
    }
    await pg.exec('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const references = await readOnlineSnapshotObjects(pg);
    const snapshotRows = await pg.query('SELECT id,avatar_path FROM aux_users');
    await pg.exec('COMMIT');
    assert.equal(references.length, 2);
    assert.deepEqual(new Set(references.map(row => row.family)), new Set(['attachment', 'avatar']));
    // A later live DB update does not change the captured DB reference set.
    await pg.query('UPDATE aux_users SET avatar_path=NULL,avatar_mime=NULL WHERE id=$1', [user]);
    const makeStore = () => new Map([[attachment, attachmentBytes], [avatar, avatarBytes]]);
    const response = (pathname, bytes, afterRead = () => {}) => ({
      statusCode: 200, headers: new Headers(),
      blob: { pathname, url: `https://${host}/${pathname}`, contentType: pathname === avatar ? 'image/png' : 'application/octet-stream' },
      stream: Readable.toWeb(Readable.from((async function* () { yield bytes; afterRead(); })())),
    });
    const archive = Buffer.from('PGDMP synthetic snapshot\n' + JSON.stringify(snapshotRows.rows));
    async function* entries(load) {
      yield { name: 'database.dump', source: Readable.from([archive]) };
      yield* onlineBlobEntries(references, load, host);
    }
    const key = randomBytes(32), maxBytes = 8 * 1024 * 1024, store = makeStore();
    const completed = join(root, 'complete');
    await writeBundle({ directory: completed, key, maxBytes, metadata: { fixture: true }, entries: entries(async pathname => {
      const bytes = store.get(pathname);
      assert(bytes);
      return response(pathname, bytes, () => store.delete(pathname));
    }) });
    assert.equal(store.size, 0, 'source objects may disappear after their complete verified copy');
    const recovered = join(root, 'recovered');
    const result = await unpackBundle({ directory: completed, destination: recovered, key, maxBytes });
    assert.equal(result.manifest.files.length, 3);
    for (const entry of result.manifest.files.filter(row => row.object)) {
      const expected = entry.object.pathname === avatar ? avatarBytes : attachmentBytes;
      assert.equal(entry.object.observed_sha256, hash(expected));
      assert.equal(entry.object.observed_size, expected.length);
      assert.deepEqual(await readFile(join(recovered, entry.name)), expected);
    }
    const removed = makeStore();
    const aborted = join(root, 'deleted-during-capture');
    await assert.rejects(writeBundle({ directory: aborted, key, maxBytes, metadata: {}, entries: entries(async pathname => {
      const bytes = removed.get(pathname);
      if (!bytes) return null;
      return response(pathname, bytes, () => removed.delete(avatar));
    }) }), /unavailable/);
    await assert.rejects(access(aborted), { code: 'ENOENT' });
    const truncated = join(root, 'truncated');
    await assert.rejects(writeBundle({ directory: truncated, key, maxBytes, metadata: {}, entries: entries(async pathname => {
      const bytes = makeStore().get(pathname);
      return response(pathname, pathname === attachment ? bytes.subarray(0, 1) : bytes);
    }) }), /integrity/);
    await assert.rejects(access(truncated), { code: 'ENOENT' });
    const shortAvatar = join(root, 'avatar-advertised-short');
    await assert.rejects(writeBundle({ directory: shortAvatar, key, maxBytes, metadata: {}, entries: entries(async pathname => {
      const bytes = makeStore().get(pathname);
      const delivered = response(pathname, pathname === avatar ? bytes.subarray(0, 8) : bytes);
      if (pathname === avatar) delivered.headers.set('content-length', String(bytes.length));
      return delivered;
    }) }), /integrity/);
    await assert.rejects(access(shortAvatar), { code: 'ENOENT' });
  } finally {
    await pg.close();
    await rm(root, { recursive: true, force: true });
    globalThis.fetch = previousFetch;
  }
});
