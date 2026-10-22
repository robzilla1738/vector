import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash, randomBytes } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { put, get, del, head, BlobNotFoundError } from '@vercel/blob';

// Only the separately approved empty production resources, never development/owner data.
assert.equal(process.env.NEON_PROJECT_ID, 'ancient-river-76453764');
assert.equal(new URL(process.env.DATABASE_URL).hostname, 'ep-red-snow-b8ctxcyx-pooler.c-14.us-east-1.aws.neon.tech');
const sql = neon(process.env.DATABASE_URL);
const manifest = JSON.parse(await readFile(new URL('../src/schema-manifest.json', import.meta.url)));
const rows = await sql`SELECT name, sha256 FROM aux_migrations ORDER BY name`;
assert.deepEqual(Object.fromEntries(rows.map(r => [r.name, r.sha256])), manifest);
const mode = process.argv[2];
if (mode === 'seed') {
  await sql`CREATE TABLE aux_bootstrap_restore_probe (id integer PRIMARY KEY CHECK (id=1), marker text NOT NULL)`;
  await sql`INSERT INTO aux_bootstrap_restore_probe VALUES (1, 'before')`;
  const [point] = await sql`SELECT clock_timestamp() AS seeded_at, date_trunc('minute', clock_timestamp()) + interval '1 minute' AS restore_at`;
  await writeFile('.production-restore-point.local.json', JSON.stringify(point), { mode: 0o600 });
  console.log(JSON.stringify({ migrations: rows.length, ...point }));
} else if (mode === 'advance') {
  const point = JSON.parse(await readFile('.production-restore-point.local.json'));
  assert(Date.now() > Date.parse(point.restore_at) + 1000, 'wait until after the selected restore minute');
  await sql`UPDATE aux_bootstrap_restore_probe SET marker='after' WHERE id=1`;
  console.log('Primary synthetic marker advanced; earlier restore point preserved');
} else if (mode === 'blob') {
  const payload = randomBytes(1024 * 1024);
  const digest = v => createHash('sha256').update(v).digest('hex');
  let object;
  try {
    object = await put('bootstrap-synthetic/restore-probe.bin', payload, { access: 'private', addRandomSuffix: true });
    assert.equal(new URL(object.url).hostname, 'uur9brkrqm4lu0z2.private.blob.vercel-storage.com');
    const downloaded = await get(object.url, { access: 'private', useCache: false });
    assert.equal(downloaded.statusCode, 200);
    const bytes = Buffer.from(await new Response(downloaded.stream).arrayBuffer());
    assert.equal(digest(bytes), digest(payload));
    await del(object.url);
    await assert.rejects(() => head(object.url), BlobNotFoundError);
    await writeFile('.production-blob-proof.local.json', JSON.stringify({ store: 'store_UUr9bRkRQm4lu0Z2', access: 'private', bytes: payload.length, sha256: digest(payload), downloaded: true, deleted: true, at: new Date().toISOString() }, null, 2), { mode: 0o600 });
    console.log('Private production Blob: 1 MiB upload/read/hash/delete passed');
  } finally {
    if (object) await del(object.url);
  }
} else if (mode === 'cleanup') {
  const [row] = await sql`SELECT marker FROM aux_bootstrap_restore_probe WHERE id=1`;
  assert.equal(row.marker, 'after');
  await sql`DROP TABLE aux_bootstrap_restore_probe`;
  console.log('Primary synthetic probe removed; migration hashes match');
} else throw Error('Choose seed, advance, blob, or cleanup');
