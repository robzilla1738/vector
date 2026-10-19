import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, symlink, rm, realpath, chmod } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import seeder from './memory-seed.cjs';
const { seedBundledMemory } = seeder;
async function fixture(t) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'aux-memory-seed-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  const source = join(root, 'distribution'), home = join(root, 'home');
  await mkdir(source); const key = 'a'.repeat(64), entries = [];
  for (const [p, value] of [['memory-catalog.json', 'signed-envelope-fixture'], [`models/${key}/gen/model.json`, 'model-fixture'], [`models/${key}/CURRENT`, 'gen']]) {
    const b = Buffer.from(value); await mkdir(join(source, p, '..'), { recursive: true }); await writeFile(join(source, p), b);
    for (const d of p.split('/').slice(0, -1).map((_, i, a) => a.slice(0, i + 1).join('/'))) if (!entries.some((e) => e.path === d)) entries.push({ path: d, type: 'directory', mode: 0o700 });
    entries.push({ path: p, type: 'file', mode: 0o600, size: b.length, sourceSha256: createHash('sha256').update(b).digest('hex') });
  }
  return { source, home, entries, key };
}
test('new and partial existing homes seed only absent caches, preserve catalog and CURRENT', async (t) => {
  const f = await fixture(t); await mkdir(f.home, { mode: 0o700 });
  await writeFile(join(f.home, 'memory-catalog.json'), 'newer-or-modified-catalog');
  await mkdir(join(f.home, 'users')); await writeFile(join(f.home, 'users/credential'), 'untouched');
  const r = await seedBundledMemory(f); assert.deepEqual(r.retained, ['memory-catalog.json']);
  assert.equal(await readFile(join(f.home, 'memory-catalog.json'), 'utf8'), 'newer-or-modified-catalog');
  const current = join(f.home, 'models', f.key, 'CURRENT'); await writeFile(current, 'different');
  await seedBundledMemory(f); assert.equal(await readFile(current, 'utf8'), 'different');
  assert.equal(await readFile(join(f.home, 'users/credential'), 'utf8'), 'untouched');
  const second = { ...f, home: join(f.home, '..', 'fresh') };
  assert.equal((await seedBundledMemory(second)).seeded.length, 2);
});
test('pin failure precedes any cache publication; source/destination symlinks refuse', async (t) => {
  const f = await fixture(t); await writeFile(join(f.source, 'memory-catalog.json'), 'tampered');
  await assert.rejects(seedBundledMemory(f), /pin mismatch/);
  await assert.rejects(readFile(join(f.home, 'models', f.key, 'CURRENT')), { code: 'ENOENT' });
  const g = await fixture(t); await mkdir(g.home, { mode: 0o700 }); await symlink(g.source, join(g.home, 'models'));
  await assert.rejects(seedBundledMemory(g), /Unsafe/);
  const h = await fixture(t); await rm(join(h.source, 'memory-catalog.json')); await symlink('/dev/null', join(h.source, 'memory-catalog.json'));
  await assert.rejects(seedBundledMemory(h), /source type/);
  const j = await fixture(t); await mkdir(j.home, { mode: 0o700 }); await chmod(j.home, 0o755);
  await assert.rejects(seedBundledMemory(j), /Unsafe memory cache directory/);
  await assert.rejects(seedBundledMemory({ ...j, home: join(j.source, 'nested') }), /disjoint/);
  await assert.rejects(seedBundledMemory({ ...j, home: join(j.source, '..') }), /disjoint/);
  const k = await fixture(t); await mkdir(join(k.home, 'models', k.key), { recursive: true, mode: 0o700 });
  await writeFile(join(k.home, 'models', k.key, 'gen'), 'not-a-directory');
  await assert.rejects(seedBundledMemory(k), /Unsafe existing memory cache descendant/);

});
