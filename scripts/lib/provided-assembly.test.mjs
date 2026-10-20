import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chmod, lstat, mkdir, mkdtemp, readFile, readlink, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { assembleProvidedResources } from './provided-assembly.mjs';

async function fixture(t) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'aux-resource-test-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  const stageRoot = join(root, 'stage'), outputRoot = join(root, 'assembled');
  const save = async (path, data) => { await mkdir(join(stageRoot, path, '..'), { recursive: true }); await writeFile(join(stageRoot, path), JSON.stringify(data)); };
  await save('manifest.json', { version: 1, implementation: 'supplied', finalApp: '/Applications/Aux.app', brandInputs: [], blockers: ['fixture'] });
  await save('ui/manifest.json', { components: { agent: { files: [] }, vault: { files: [] } } });
  await save('apps/manifest.json', { components: { daemon: { app: 'daemon/Aux Daemon.app', files: [] }, cli: { app: 'cli/Aux CLI.app', files: [] } } });
  await save('computer-use/manifest.json', { files: [] });
  const bytes = Buffer.from('catalog verified immutable runtime\n'), sha = createHash('sha256').update(bytes).digest('hex');
  await save('distribution/manifest.json', { runtimeRoot: '/Applications/Aux.app/Contents/Resources/aux/agent-runtime', components: { runtime: { files: [
    { path: 'python', type: 'directory', mode: 0o755 },
    { path: 'python/runtime', type: 'file', mode: 0o755, outputSha256: sha },
    { path: 'python/current', type: 'symlink', mode: 0o755, linkTarget: 'runtime' },
  ] }, memory: { files: [] } } });
  for (const path of ['ui/agent', 'ui/vault', 'apps/daemon/Aux Daemon.app', 'apps/cli/Aux CLI.app', 'computer-use/Aux Computer Use.app', 'distribution/memory', 'distribution/runtime/python']) await mkdir(join(stageRoot, path), { recursive: true });
  await chmod(join(stageRoot, 'distribution/runtime/python'), 0o755);
  await writeFile(join(stageRoot, 'distribution/runtime/python/runtime'), bytes, { mode: 0o755 });
  await symlink('runtime', join(stageRoot, 'distribution/runtime/python/current'));
  // Darwin symlinks have 0755, Linux 0777; use the actual fixture mode.
  const manifest = JSON.parse(await readFile(join(stageRoot, 'distribution/manifest.json')));
  manifest.components.runtime.files[2].mode = (await lstat(join(stageRoot, 'distribution/runtime/python/current'))).mode & 0o777;
  await save('distribution/manifest.json', manifest);
  return { stageRoot, outputRoot };
}

test('assembly retains immutable runtime bytes, executable mode and internal relative links in final layout', async (t) => {
  const options = await fixture(t), report = await assembleProvidedResources(options);
  const runtime = join(options.outputRoot, 'agent-runtime/python');
  assert.equal(await readFile(join(runtime, 'runtime'), 'utf8'), 'catalog verified immutable runtime\n');
  assert.equal((await lstat(join(runtime, 'runtime'))).mode & 0o777, 0o755);
  assert.equal(await readlink(join(runtime, 'current')), 'runtime');
  assert.equal(report.productionReady, false);
  assert.deepEqual(report.excludedProducts, ['vault', 'password-importer']);
  await assert.rejects(lstat(join(options.outputRoot, 'apps/vault')), { code: 'ENOENT' });
  await assert.rejects(assembleProvidedResources(options), /already exists/);
});

test('assembly rejects modified bytes and unreported resources without publishing output', async (t) => {
  const options = await fixture(t);
  await writeFile(join(options.stageRoot, 'distribution/runtime/python/runtime'), 'tampered');
  await assert.rejects(assembleProvidedResources(options), /hash changed/);
  await assert.rejects(lstat(options.outputRoot), { code: 'ENOENT' });
  await writeFile(join(options.stageRoot, 'ui/agent/owner-data'), 'must not copy');
  await assert.rejects(assembleProvidedResources(options), /Incomplete staged component inventory/);
});

test('assembly rejects a symlink that escapes its staged distribution', async (t) => {
  const options = await fixture(t), path = join(options.stageRoot, 'distribution/runtime/python/current');
  await rm(path);
  await symlink('../../../manifest.json', path);
  const manifestPath = join(options.stageRoot, 'distribution/manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath));
  manifest.components.runtime.files[2].linkTarget = '../../../manifest.json';
  await writeFile(manifestPath, JSON.stringify(manifest));
  await assert.rejects(assembleProvidedResources(options), /link changed or escapes/);
  await assert.rejects(lstat(options.outputRoot), { code: 'ENOENT' });
});


test('assembly verifies but omits the built-in credential importer and provider bundle', async (t) => {
  const options = await fixture(t), path = 'Contents/Applications/Aux Password Importer.app/Contents/PlugIns/AsidePasswordImporterProvider.appex/Contents/MacOS/aux-password-importer-provider';
  const bytes = Buffer.from('static importer fixture'), sha = createHash('sha256').update(bytes).digest('hex');
  const source = join(options.stageRoot, 'apps/daemon/Aux Daemon.app', path);
  await mkdir(join(source, '..'), { recursive: true });
  await writeFile(source, bytes, { mode: 0o755 });
  const manifestPath = join(options.stageRoot, 'apps/manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath));
  manifest.components.daemon.files.push({ path, outputSha256: sha, outputMode: 0o755 });
  await writeFile(manifestPath, JSON.stringify(manifest));
  const report = await assembleProvidedResources(options);
  assert.equal(report.excludedFiles.length, 1);
  await assert.rejects(lstat(join(options.outputRoot, 'apps/daemon/Aux Daemon.app/Contents/Applications/Aux Password Importer.app')), { code: 'ENOENT' });
  assert.equal(await readFile(source, 'utf8'), bytes.toString());
});
