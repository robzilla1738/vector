import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { assembleStartupHelper } from '../host/assemble-startup-helper.mjs';
const writer = readFileSync(new URL('../host/startup-receipt-writer.swift', import.meta.url));
const launcher = readFileSync(new URL('../host/startup-launch.swift', import.meta.url));
const lifetime = readFileSync(new URL('../host/startup-child-lifetime.swift', import.meta.url));
const cold = readFileSync(new URL('../host/startup-cold-process-audit.swift', import.meta.url));
const assembler = readFileSync(new URL('../host/assemble-startup-helper.mjs', import.meta.url));
test('retains exact original inputs in one deterministic helper source and pins assembly separately', () => {
  const first = assembleStartupHelper(writer, launcher, assembler, lifetime, cold);
  assert.deepEqual(first, assembleStartupHelper(writer, launcher, assembler, lifetime, cold));
  assert.equal(first.source.subarray(first.source.indexOf(writer), first.source.indexOf(writer) + writer.length).compare(writer), 0);
  assert.equal(first.source.subarray(first.source.indexOf(launcher), first.source.indexOf(launcher) + launcher.length).compare(launcher), 0);
  assert.match(first.source.toString(), new RegExp('let startupHelperSourceSha256 = "' + first.manifest.sourceSha256 + '"'));
  assert.equal(first.manifest.inputs.length, 5);
  assert.equal(Object.hasOwn(first.manifest, 'compiled'), false);
});
test('each actual source and assembly rule change changes the framed source identity', () => {
  const initial = assembleStartupHelper(writer, launcher, assembler, lifetime, cold).manifest.sourceSha256;
  for (let index = 0; index < 5; index++) {
    const inputs = [writer, launcher, assembler, lifetime, cold];
    inputs[index] = Buffer.concat([inputs[index], Buffer.from('\n// changed actual source\n')]);
    assert.notEqual(assembleStartupHelper(...inputs).manifest.sourceSha256, initial);
  }
  assert.notEqual(assembleStartupHelper(Buffer.from('ab'), Buffer.from('c'), assembler, lifetime, cold).manifest.sourceSha256,
    assembleStartupHelper(Buffer.from('a'), Buffer.from('bc'), assembler, lifetime, cold).manifest.sourceSha256);
});
test('refuses missing, oversized, NUL or invalid UTF8 source instead of silently normalizing', () => {
  for (const invalid of [Buffer.alloc(0), Buffer.alloc(262145, 65), Buffer.from([65, 0]), Buffer.from([0xff]), 'source'])
    assert.throws(() => assembleStartupHelper(invalid, launcher, assembler, lifetime, cold));
});
