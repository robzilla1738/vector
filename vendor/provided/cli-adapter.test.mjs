import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { adaptCliBinary, adaptCliCode } from './cli-adapter.mjs';
import { findMachOSeaSection, readSeaBlob } from '../aside/lib/sea.mjs';

test('unrecognized CLI inputs fail before adaptation', () => {
  assert.throws(() => adaptCliCode('module.exports = {};'), /hash mismatch/);
  assert.throws(() => adaptCliBinary(Buffer.from('different executable')), /hash mismatch/);
});

const source = process.env.AUX_PROVIDED_CLI_BINARY ?? join(homedir(), '.aside/cli/Aside CLI.app/Contents/MacOS/aside');
test('actual supplied CLI remains syntactically valid and its native loader cannot fall through to owner binding', { skip: !existsSync(source) }, () => {
  const original = readFileSync(source);
  const beforeSection = findMachOSeaSection(original);
  const before = readSeaBlob(original.subarray(beforeSection.offset, beforeSection.offset + beforeSection.size));
  const result = adaptCliBinary(original);
  const section = findMachOSeaSection(result.binary);
  const after = readSeaBlob(result.binary.subarray(section.offset, section.offset + section.size));
  execFileSync(process.execPath, ['--input-type=module', '--check'], { input: after.code }); // Parse only.
  assert.deepEqual(after.assets, before.assets);
  assert.deepEqual(after.tail, before.tail);
  assert.equal(after.entryPath, before.entryPath);
  assert.ok(after.code.includes('AuxDaemonSessionToken '));
  assert.ok(after.code.includes('Aux Daemon Auth v1\\0'));
  assert.ok(after.code.includes('aux.daemon.auth.'));
  assert.ok(after.code.includes('return [path.resolve(path.dirname(process.execPath), "../Resources/native/aux-native.cjs")]'));
  const loader = after.code.match(/function candidateBindingPaths\(\) \{[\s\S]*?\n\}/)[0];
  assert.equal(loader.includes('aside-native.node'), false);
  assert.equal(loader.includes('materializeEmbeddedBinding'), false);
  assert.equal(loader.includes('AUX_NATIVE_HELPER_BINDING'), false);
  let replayed = before.code;
  for (const anchor of result.applied) {
    assert.equal(replayed.split(anchor.find).length - 1, anchor.count);
    replayed = replayed.split(anchor.find).join(anchor.replace);
  }
  assert.equal(replayed, after.code);
  assert.deepEqual(adaptCliBinary(original).binary, result.binary);
});
