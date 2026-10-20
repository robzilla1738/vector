import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { buildDaemonNodeDevelopment, daemonNodeDevelopmentPaths } from './daemon-node-development.mjs';

const input = process.env.AUX_PROVIDED_DAEMON_STATIC_BINARY;
if (!input) throw new Error('Set AUX_PROVIDED_DAEMON_STATIC_BINARY to the pinned static daemon binary; no daemon is executed');
const original = await readFile(input);
const output = buildDaemonNodeDevelopment(original);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

test('exact original implementation/assets retained with counted resource edits', () => {
  assert.equal(output.files.length, 4);
  assert.deepEqual(output.manifest.launch.execArgv, ['--disable-sigusr1', '--use-system-ca']);
  assert.equal(output.manifest.sourceCodeSha256, '5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5');
  assert.equal(output.manifest.runtimeTested, false);
  assert.equal(output.manifest.dpRuntimeAccepted, false);
  assert.equal(output.manifest.developmentEdits.length, 12);
  const code = output.files.find(file => file.path === daemonNodeDevelopmentPaths.script).bytes.toString();
  const parsed = spawnSync(process.execPath, ['--input-type=module', '--check'], { input: code, encoding: 'utf8', maxBuffer: 1024 * 1024 });
  assert.equal(parsed.status, 0, parsed.stderr); // Syntax only: no imports/main/native execute.
  assert.match(code, /aux-native\.cjs/);
  assert.doesNotMatch(code, /daemon-native\.cjs|process\.execPath\s*=/);
  assert.match(code, /assert\.ok\(isSea\(\),`Run this diagnostic through the packaged daemon`\)/);
  assert.equal(output.manifest.files.every((pin, index) => pin.sha256 === digest(output.files[index].bytes)), true);
  const changed = Buffer.from(original); changed[changed.length - 1] ^= 1;
  assert.throws(() => buildDaemonNodeDevelopment(changed), /binary hash mismatch/);
});

test('owned asset module returns ArrayBuffer copies and rejects unknown or drifted bytes', async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), 'aux-daemon-node-assets-'));
  try {
    for (const file of output.files) {
      // Never write or import the original/adapted daemon entrypoint in this check.
      if (file.path === daemonNodeDevelopmentPaths.script) continue;
      const target = path.join(temporary, file.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, file.bytes, { mode: file.mode, flag: 'wx' });
    }
    const directory = path.dirname(path.join(temporary, daemonNodeDevelopmentPaths.script));
    const assets = await import(pathToFileURL(path.join(directory, 'assets.mjs')).href);
    const key = 'quickjs-emscripten-module.wasm';
    const first = assets.getAsset(key), second = assets.getAsset(key);
    assert(first instanceof ArrayBuffer); assert.notEqual(first, second);
    assert.equal(first.byteLength, 503134);
    new Uint8Array(first)[0] ^= 1;
    assert.equal(digest(Buffer.from(second)), '105c3bed22d457e43e3d1c3c1c6959fda62a8fe06f0fc8a985303c3a2be72232');
    assert.equal(typeof assets.getAsset(key, 'base64'), 'string');
    assert.throws(() => assets.getAsset('../native/provided-native.node'), /Unknown/);
    const assetPath = path.join(directory, 'assets', key);
    const changed = await readFile(assetPath); changed[0] ^= 1;
    await writeFile(assetPath, changed);
    const uncached = await import(`${pathToFileURL(path.join(directory, 'assets.mjs')).href}?drift`);
    assert.throws(() => uncached.getAsset(key), /hash mismatch/);
  } finally { await rm(temporary, { recursive: true, force: true }); }
});
