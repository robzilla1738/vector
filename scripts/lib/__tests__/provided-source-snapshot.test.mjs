import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chmod, lstat, mkdir, mkdtemp, readFile, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { parseProvidedCheckArguments, resolveProvidedSourceSnapshot } from '../provided-source-snapshot.mjs';
const hash = value => createHash('sha256').update(value).digest('hex');
const json = async (path, value) => { await mkdir(dirname(path), { recursive: true }); await writeFile(path, JSON.stringify(value)); };
async function fixture(t) {
  const repositoryRoot = await mkdtemp(join(tmpdir(), 'aux-frozen-fixture-'));
  t.after(() => rm(repositoryRoot, { recursive: true, force: true }));
  const snapshotRoot = join(repositoryRoot, 'out/frozen');
  const groups = { ui: ['agent', 'vault'], app: ['daemon', 'cli'], runtime: ['runtime', 'memory'], helper: ['computerUse'] };
  const names = { ui: 'provided-ui-inputs', app: 'provided-app-inputs', runtime: 'provided-runtime-inputs', helper: 'provided-computer-use-inputs' };
  const manifest = { version: 1, kind: 'provided-source-snapshot', components: {} };
  for (const [group, components] of Object.entries(groups)) {
    const pins = {};
    for (const name of components) {
      const root = join(snapshotRoot, name); await mkdir(root, { recursive: true });
      const bytes = Buffer.from(`exact original ${name}`); await writeFile(join(root, 'payload'), bytes, { mode: 0o600 });
      const pin = { files: [{ path: 'payload', size: bytes.length, sourceSha256: hash(bytes), mode: 0o600 }] };
      if (group !== 'app') pin.sourceVersion = 'original-version';
      if (name === 'runtime') {
        await symlink('payload', join(root, 'link'));
        pin.files.push({ path: 'link', type: 'symlink', linkTarget: 'payload', mode: (await lstat(join(root, 'link'))).mode & 0o777 });
      }
      pins[name] = pin;
    }
    const pinFile = `docs/source/${names[group]}.json`;
    const canonical = group === 'helper' ? { version: 1, ...pins.computerUse } : { version: 1, components: pins };
    await json(join(repositoryRoot, pinFile), canonical);
    const pinSha256 = hash(await readFile(join(repositoryRoot, pinFile)));
    for (const name of components) manifest.components[name] = { path: name, pinFile, pinSha256, ...(pins[name].sourceVersion ? { sourceVersion: pins[name].sourceVersion } : {}) };
  }
  const save = () => json(join(snapshotRoot, 'manifest.json'), manifest); await save();
  return { repositoryRoot, snapshotRoot, manifest, save };
}
test('explicit exact snapshot verifies complete components and contained dependency link', async t => {
  const fixtureInput = await fixture(t), result = await resolveProvidedSourceSnapshot(fixtureInput);
  assert.equal(Object.keys(result.roots).length, 7); assert.equal(result.inventories.runtime, 2);
  assert.equal(result.manifestSha256, hash(await readFile(result.manifestPath)));
  assert.equal(await resolveProvidedSourceSnapshot({ repositoryRoot: fixtureInput.repositoryRoot }), null);
});
test('missing or drifted original bytes fail instead of falling back', async t => {
  const input = await fixture(t); await unlink(join(input.snapshotRoot, 'agent/payload'));
  await assert.rejects(resolveProvidedSourceSnapshot(input), /Missing frozen/);
  await writeFile(join(input.snapshotRoot, 'agent/payload'), 'new version', { mode: 0o600 });
  await assert.rejects(resolveProvidedSourceSnapshot(input), /hash\/size differs/);
});
test('complete source inventory rejects unreported files and changed pinned mode', async t => {
  const input = await fixture(t), extra = join(input.snapshotRoot, 'vault/extra'); await writeFile(extra, 'unexpected');
  await assert.rejects(resolveProvidedSourceSnapshot(input), /Unpinned/); await unlink(extra);
  await chmod(join(input.snapshotRoot, 'vault/payload'), 0o644);
  await assert.rejects(resolveProvidedSourceSnapshot(input), /type\/mode/);
});
test('version, canonical pin hash and component completeness cannot be substituted', async t => {
  const input = await fixture(t); input.manifest.components.agent.sourceVersion = 'new'; await input.save();
  await assert.rejects(resolveProvidedSourceSnapshot(input), /version mismatch/);
  input.manifest.components.agent.sourceVersion = 'original-version'; input.manifest.components.agent.pinSha256 = '0'.repeat(64); await input.save();
  await assert.rejects(resolveProvidedSourceSnapshot(input), /canonical pin mismatch/);
  delete input.manifest.components.agent; await input.save();
  await assert.rejects(resolveProvidedSourceSnapshot(input), /Incomplete/);
});
test('relative root escape, overlapping roots and symlink roots are rejected', async t => {
  const input = await fixture(t); input.manifest.components.agent.path = '../outside'; await input.save();
  await assert.rejects(resolveProvidedSourceSnapshot(input), /Invalid frozen/);
  input.manifest.components.agent.path = 'vault'; await input.save();
  await assert.rejects(resolveProvidedSourceSnapshot(input), /hash\/size differs|overlap/);
  await symlink('agent', join(input.snapshotRoot, 'alias')); input.manifest.components.agent.path = 'alias'; await input.save();
  await assert.rejects(resolveProvidedSourceSnapshot(input), /not a real directory/);
});
test('dependency symlink cannot escape even if link bytes are pinned', async t => {
  const input = await fixture(t), pinFile = input.manifest.components.runtime.pinFile;
  await unlink(join(input.snapshotRoot, 'runtime/link')); await symlink('../agent/payload', join(input.snapshotRoot, 'runtime/link'));
  const pins = JSON.parse(await readFile(join(input.repositoryRoot, pinFile))); pins.components.runtime.files[1].linkTarget = '../agent/payload';
  await json(join(input.repositoryRoot, pinFile), pins);
  const pinSha256 = hash(await readFile(join(input.repositoryRoot, pinFile)));
  input.manifest.components.runtime.pinSha256 = input.manifest.components.memory.pinSha256 = pinSha256; await input.save();
  await assert.rejects(resolveProvidedSourceSnapshot(input), /link escapes/);
});
test('checker argument parser keeps default strict and rejects malformed optional flag', () => {
  assert.deepEqual(parseProvidedCheckArguments([], '/default'), { output: '/default', sourceSnapshotRoot: undefined });
  assert.deepEqual(parseProvidedCheckArguments(['/stage', '--source-snapshot', '/snapshot'], '/default'), { output: '/stage', sourceSnapshotRoot: '/snapshot' });
  for (const args of [['--source-snapshot'], ['--other'], ['one', 'two'], ['--source-snapshot', '/a', '--source-snapshot', '/b']])
    assert.throws(() => parseProvidedCheckArguments(args, '/default'));
});
