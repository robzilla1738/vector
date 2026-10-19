import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  access,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  inventoryProvidedRuntime,
  inventoryProvidedMemory,
  stageProvidedRuntime,
} from './provided-runtime.mjs';

const pinned = JSON.parse(
  await readFile(
    new URL('../../docs/source/provided-runtime-inputs.json', import.meta.url),
    'utf8',
  ),
);
async function runtimeFixture(root) {
  for (const path of ['bin', 'native', 'node', 'python/venv'])
    await mkdir(join(root, path), { recursive: true });
  for (const path of [
    'env.sh',
    'manifest.txt',
    'openssl.cnf',
    'prepare-python.py',
  ])
    await writeFile(join(root, path), '');
  await writeFile(join(root, 'version.txt'), '1.26.1019.335\n');
  await writeFile(
    join(root, 'python/venv/pyvenv.cfg'),
    'home = /provided/aside-runtime-1.26.1019.335/python/runtime/bin\n',
  );
}

test('runtime inventory excludes owner config/state and rejects escaping links', async () => {
  const root = await mkdtemp(join(tmpdir(), 'aux-runtime-fixture-'));
  try {
    await runtimeFixture(root);
    await symlink('/do-not-read-owner-config', join(root, '.npmrc'));
    await mkdir(join(root, 'tmp'));
    await writeFile(join(root, 'tmp/private-fixture'), 'excluded');
    await writeFile(join(root, 'bin/tool'), 'fixture');
    await symlink('tool', join(root, 'bin/alias'));
    const inventory = await inventoryProvidedRuntime(root);
    assert.ok(
      !inventory.files.some(
        (file) => file.path === '.npmrc' || file.path.startsWith('tmp'),
      ),
    );
    assert.equal(
      inventory.files.find((file) => file.path === 'bin/alias').linkTarget,
      'tool',
    );
    await symlink('/do-not-read-external-data', join(root, 'bin/escape'));
    await assert.rejects(
      inventoryProvidedRuntime(root),
      /symlink escapes allowed roots/,
    );
    await assert.rejects(
      stageProvidedRuntime({
        sourceRoot: root,
        outputRoot: join(root, 'out'),
        runtimeRoot: '/tmp/unsafe path/runtime',
      }),
      /shell-safe/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('memory distribution requires catalog hashes and rejects metadata symlinks', async () => {
  const root = await mkdtemp(join(tmpdir(), 'aux-memory-fixture-'));
  try {
    const hash = 'a'.repeat(64),
      generation = '11111111-1111-1111-1111-111111111111',
      payload = Buffer.from('static-model-fixture');
    const file = {
      bytes: payload.length,
      sha256: createHash('sha256').update(payload).digest('hex'),
    };
    const model = {
      formatVersion: 1,
      id: 'fixture-model',
      files: { 'weight.bin': file },
    };
    await mkdir(join(root, 'memory-runtimes'));
    await mkdir(join(root, 'models', hash, generation), { recursive: true });
    await writeFile(
      join(root, 'memory-catalog.json'),
      JSON.stringify({
        formatVersion: 1,
        signature: 'fixture-only-not-an-authenticity-proof',
        payload: JSON.stringify({
          formatVersion: 1,
          sequence: 1,
          runtimes: [],
          models: [model],
        }),
      }),
    );
    await writeFile(join(root, 'models', hash, 'CURRENT'), generation);
    const metadata = join(root, 'models', hash, generation, 'model.json');
    await writeFile(metadata, JSON.stringify(model));
    const weight = join(root, 'models', hash, generation, 'weight.bin');
    await writeFile(weight, payload);
    assert.equal(
      (await inventoryProvidedMemory(root)).files.filter(
        (file) => file.type === 'file',
      ).length,
      4,
    );
    await writeFile(weight, 'tampered');
    await assert.rejects(
      inventoryProvidedMemory(root),
      /payload hash mismatch/,
    );
    await rm(metadata);
    await symlink('/do-not-read-owner-index', metadata);
    await assert.rejects(
      inventoryProvidedMemory(root),
      /Symlink in distribution metadata/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

let missing = false;
try {
  await access(pinned.components.runtime.inputRoot);
  await access(join(pinned.components.memory.inputRoot, 'memory-catalog.json'));
} catch {
  missing = true;
}
test('one actual supplied runtime stage preserves distribution bytes/links and relocates only pinned text', {
  skip: missing
    ? 'Pinned external static distributions are unavailable'
    : false,
}, async () => {
  const root = await mkdtemp(join(tmpdir(), 'aux-supplied-runtime-'));
  try {
    const finalRuntime =
      '/Applications/Aux.app/Contents/Resources/aux/agent-runtime';
    const report = await stageProvidedRuntime({
      sourceRoot: pinned.components.runtime.inputRoot,
      memoryRoot: pinned.components.memory.inputRoot,
      outputRoot: join(root, 'staged'),
      runtimeRoot: finalRuntime,
    });
    for (const [name, component] of Object.entries(report.components)) {
      for (const file of component.files) {
        const output = join(root, 'staged', name, file.path);
        if (file.type === 'file' && !file.changeKinds.length)
          assert.equal(file.outputSha256, file.sourceSha256);
        if (file.type === 'symlink')
          assert.equal(file.linkTarget, file.outputLinkTarget);
        if (file.type === 'file')
          assert.equal((await lstat(output)).mode & 0o777, file.mode);
        if (file.anchors?.length) {
          let expected = await readFile(
            join(component.inputRoot, file.path),
            'utf8',
          );
          for (const anchor of file.anchors)
            expected = expected.split(anchor.find).join(anchor.replace);
          assert.equal(await readFile(output, 'utf8'), expected);
        }
      }
    }
    assert.equal(
      report.components.runtime.files.filter((file) => file.anchors?.length)
        .length,
      9,
    );
    assert.equal(
      report.components.memory.files.filter((file) => file.changeKinds.length)
        .length,
      0,
    );
    assert.deepEqual(await readdir(join(root, 'staged/runtime/tmp')), []);
    assert.equal(
      await readFile(join(root, 'staged/runtime/.npmrc'), 'utf8'),
      'fund=false\naudit=false\nupdate-notifier=false\n',
    );
    assert.equal(
      (await lstat(join(root, 'staged/runtime/.npmrc'))).mode & 0o777,
      0o600,
    );
    assert.ok(
      (await readFile(join(root, 'staged/runtime/env.sh'), 'utf8')).includes(
        'AUX_SKILL_RUNTIME',
      ),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
