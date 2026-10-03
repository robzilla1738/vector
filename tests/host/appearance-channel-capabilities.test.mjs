// Contract controls only; receipts here do not attest a compiled native process.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';
const contractUrl = new URL('../../packages/contracts/src/host-capabilities.ts', import.meta.url);
const { z } = createRequire(contractUrl)('zod');
const source = readFileSync(contractUrl, 'utf8');
const exports = {};
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports, require: name => { assert.equal(name, 'zod'); return { z }; } });
const schema = exports.HostCapabilitiesSchema;
const original = { buildId: 'controlled-build', sourceCommit: 'a'.repeat(40), methods: [], qualifiedFeatures: [] };
const channel = { producer: 'aux-native-appearance-file-channel', version: 1, pid: 42, processUuid: 'a'.repeat(32), processStartMachTicks: '9', buildId: original.buildId, sourceCommit: original.sourceCommit, nonce: 'b'.repeat(32), basename: 'native-appearance-channel.jsonl', rootDevice: '1', rootInode: '2', profileName: 'Default', profileDevice: '1', profileInode: '3', fileDevice: '1', fileInode: '4', publicKeySpkiHex: 'a'.repeat(88), headerSha256: 'c'.repeat(64) };
test('ordinary capabilities remain exact and optional closed native receipt is retained', () => {
  assert.deepEqual(schema.parse(original), original);
  assert.deepEqual(schema.parse({ ...original, nativeAppearanceFileChannel: channel }).nativeAppearanceFileChannel, channel);
});
test('unknown keys, foreign profile/file names and invalid kernel fields refuse', () => {
  for (const change of [{ extra: true }, { profileName: 'Private' }, { basename: '../foreign' }, { processUuid: '0'.repeat(32) }, { processStartMachTicks: '18446744073709551616' }, { pid: 0 }])
    assert.equal(schema.safeParse({ ...original, nativeAppearanceFileChannel: { ...channel, ...change } }).success, false);
});
