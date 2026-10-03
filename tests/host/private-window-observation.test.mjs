// Synthetic raw protocol controls only; no native/window/compilation evidence.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizePrivateWindowObservation, privateWindowPrefix } from './lib/private-window-observation.mjs';
const sourceCommit = 'a'.repeat(40), manifestHash = 'b'.repeat(64);
const native = { sourceCommit, manifestHash, buildId: `195.0+${manifestHash}+${sourceCommit}` };
const candidate = { productIdentity: { commit: sourceCommit, tree: 'c'.repeat(40), label: sourceCommit, dirty: false },
  native, shellDigest: 'd'.repeat(64), harnessCommit: 'e'.repeat(40), moduleSha256: 'f'.repeat(64) };
const options = { candidate, targetPid: 42, windowId: 7, startedAt: '2026-10-03T01:00:00.000Z', completedAt: '2026-10-03T01:00:01.000Z' };
function receipt() { return { producer: 'aux-native-private-window-observation', version: 1,
  native: { buildId: native.buildId, sourceCommit }, runtimeStatus: 'inactive-private',
  appearance: { producer: 'aux-native-appearance-snapshot', version: 1, pid: 42, windowId: 7,
    frame: { x: 10, y: 20, width: 900, height: 600 }, windowKind: 'private',
    nativeTheme: 'dark', backing: null, material: null, observedAtUnixMs: Date.parse('2026-10-03T01:00:00.500Z'),
    shell: { theme: 'dark', layout: 'vertical', sidebarAppearance: 'solid', systemDark: true, reduceMotion: false, reduceTransparency: false } } }; }
const encode = record => privateWindowPrefix + JSON.stringify(record) + '\n';
test('retains original native receipt and explicitly inactive runtime with unknown material', () => {
  const line = encode(receipt()), result = normalizePrivateWindowObservation(line, options);
  assert.equal(result.raw.line, line); assert.equal(result.native.manifestHash, manifestHash);
  assert.equal(result.runtimeStatus, 'inactive-private'); assert.equal(result.window.material, null);
  assert.equal('runtime' in result, false); assert.equal(result.window.windowKind, 'private');
});
test('refuses foreign compiled source/build, normal window, wrong PID/window and stale read', () => {
  for (const change of [r => { r.native.sourceCommit = '1'.repeat(40); }, r => { r.native.buildId += '+extra'; },
    r => { r.appearance.windowKind = 'normal'; }, r => { r.appearance.pid++; }, r => { r.appearance.windowId++; },
    r => { r.appearance.observedAtUnixMs -= 2000; }, r => { r.runtimeStatus = 'connected'; },
    r => { r.appearance.frame.guessed = true; }, r => { r.native.runtimeIdentity = candidate.productIdentity; }]) {
    const value = receipt(); change(value); assert.throws(() => normalizePrivateWindowObservation(encode(value), options));
  }
});
test('refuses duplicate/nested identity fields, noncanonical numbers and extra whitespace', () => {
  const line = encode(receipt());
  for (const wrong of [line.replace('"version":1', '"version":2,"version":1'),
    line.replace('"windowId":7', '"windowId":8,"windowId":7'),
    line.replace('"pid":42', '"pid":4.2e1'), line.replace('"native":', '"native": {},"native":'),
    line.replace('{', '{ '), line + '\n']) assert.throws(() => normalizePrivateWindowObservation(wrong, options));
});
