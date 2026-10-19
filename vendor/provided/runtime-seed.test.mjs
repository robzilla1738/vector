import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const { seedBundledRuntime } = createRequire(import.meta.url)('./runtime-seed.cjs');
async function fixture(fn) {
  const root = await fs.realpath(await fs.mkdtemp(path.join(tmpdir(), 'aux-runtime-seed-')));
  const source = path.join(root, 'source'), home = path.join(root, 'home');
  await fs.mkdir(source); await fs.mkdir(home, { mode: 0o700 });
  const original = 'ASIDE_HOME=/original/runtime\n', staged = 'AUX_HOME=/bundle/Contents/Resources/aux/agent-runtime\n';
  await fs.writeFile(path.join(source, 'env.sh'), staged);
  await fs.writeFile(path.join(source, 'version.txt'), 'fixture');
  await fs.mkdir(path.join(source, 'bin')); await fs.symlink('../env.sh', path.join(source, 'bin/env'));
  const pin = (name, bytes, anchors) => ({ path: name, type: 'file', mode: 0o644, size: Buffer.byteLength(bytes), sourceSha256: createHash('sha256').update(bytes).digest('hex'), ...(anchors ? { anchors } : {}) });
  const pins = { version: 1, files: [pin('env.sh', original, [{ kind: 'identity', find: 'ASIDE_', replace: 'AUX_', count: 1 }, { kind: 'integration', find: '/original/runtime', replacement: 'runtimeRoot', count: 1 }]), pin('version.txt', 'fixture'), { path: 'bin', type: 'directory', mode: 0o755 }, { path: 'bin/env', type: 'symlink', mode: 0o755, linkTarget: '../env.sh' }] };
  const options = { source, home, bundleRuntimeRoot: '/bundle/Contents/Resources/aux/agent-runtime', pins };
  try { await fn(options); } finally { await fs.rm(root, { recursive: true, force: true }); }
}
test('relocates pinned text into private mutable cache, preserves bytes/links and existing mutations', () => fixture(async (o) => {
  const result = await seedBundledRuntime(o); assert.equal(result.seeded, true);
  assert.equal(await fs.readFile(path.join(result.runtime, 'env.sh'), 'utf8'), `AUX_HOME=${result.runtime}\n`);
  assert.equal(await fs.readlink(path.join(result.runtime, 'bin/env')), '../env.sh');
  assert.equal((await fs.stat(path.join(result.runtime, '.npmrc'))).mode & 0o777, 0o600);
  assert.equal((await fs.stat(path.join(result.runtime, 'tmp'))).mode & 0o777, 0o700);
  await fs.writeFile(path.join(result.runtime, 'version.txt'), 'genuine-new-version');
  assert.equal((await seedBundledRuntime(o)).retained, true);
  assert.equal(await fs.readFile(path.join(result.runtime, 'version.txt'), 'utf8'), 'genuine-new-version');
}));
test('drift and nonregular sources fail before publishing cache', () => fixture(async (o) => {
  await fs.writeFile(path.join(o.source, 'version.txt'), 'modified');
  await assert.rejects(seedBundledRuntime(o), /pin mismatch/);
  await assert.rejects(fs.stat(path.join(o.home, 'runtime')), { code: 'ENOENT' });
  await fs.unlink(path.join(o.source, 'version.txt')); await fs.symlink('env.sh', path.join(o.source, 'version.txt'));
  await assert.rejects(seedBundledRuntime(o), /not regular/);
  await fs.chmod(o.home, 0o755); await assert.rejects(seedBundledRuntime(o), /private0700/);
}));
test('refuses symlink cache and overlapping source/home', () => fixture(async (o) => {
  await fs.symlink(o.source, path.join(o.home, 'runtime'));
  await assert.rejects(seedBundledRuntime(o), /Unsafe existing/);
  await assert.rejects(seedBundledRuntime({ ...o, source: o.home }), /disjoint/);
}));
