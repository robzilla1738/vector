// Controlled producer-shaped records; no native/window/pixel qualification.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeUtilityAppearanceOwner, readUtilityAppearanceJson } from './lib/utility-appearance-owner.mjs';
import { normalizeNativeAppearance } from './lib/appearance-provenance.mjs';
import { createAppearanceStream } from './lib/appearance-stream.mjs';
const candidate = { productIdentity: { commit: 'a'.repeat(40), tree: 'b'.repeat(40), label: 'a'.repeat(40), dirty: false }, native: { sourceCommit: 'a'.repeat(40), buildId: 'controlled', manifestHash: 'c'.repeat(64) }, shellDigest: 'd'.repeat(64), harnessCommit: 'e'.repeat(40), moduleSha256: 'f'.repeat(64) };
const owner = changes => ({ producer: 'aux-native-utility-appearance-owner', version: 1, windowId: 7, browserWindowId: '12', windowKind: 'little', shellDocumentToken: 'A'.repeat(32), pages: [{ pageId: 'p_fixture', documentToken: 'B'.repeat(32), selected: true }], ...changes });
const raw = changes => ({ producer: 'aux-native-appearance-snapshot', version: 1, pid: 42, windowId: 7, observedAtUnixMs: Date.now(), frame: { x: 10, y: 20, width: 960, height: 720 }, windowKind: 'little', nativeTheme: 'dark', backing: null, material: null, shell: { theme: 'dark', layout: 'vertical', sidebarAppearance: 'solid', systemDark: true, reduceMotion: false, reduceTransparency: false }, utilityOwnership: owner(), ...changes });
const normalize = value => normalizeNativeAppearance(JSON.stringify(value), { candidate, targetPid: 42, windowId: value.windowId, startedAt: new Date(0).toISOString(), completedAt: new Date(Date.now() + 1000).toISOString() });
test('actual selected-guest shape retains full native identity without inferring material', () => {
  const value = normalize(raw()); assert.deepEqual(value.utilityOwnership, owner()); assert.equal(value.material, null);
  assert.ok(Object.isFrozen(value.utilityOwnership.pages[0]));
  assert.deepEqual(decodeUtilityAppearanceOwner(owner({ windowKind: 'normal', pages: [] })).pages, []);
});
for (const [name, change] of [
  ['foreign outer window', { windowId: 8 }], ['foreign kind', { windowKind: 'normal' }],
  ['unknown field', { label: 'narrow' }], ['noncanonical BWI', { browserWindowId: '012' }],
  ['missing shell document', { shellDocumentToken: null }], ['zero document', { shellDocumentToken: '0'.repeat(32) }],
  ['empty Little', { pages: [] }], ['unselected guest', { pages: [{ ...owner().pages[0], selected: false }] }],
  ['foreign page token', { pages: [{ ...owner().pages[0], documentToken: 'b'.repeat(32) }] }],
]) test(`${name} cannot establish utility ownership`, () => assert.throws(() => normalize(raw({ utilityOwnership: owner(change) }))));
test('null metadata stays explicit unknown and cannot decode as an owner', () => {
  assert.equal(normalize(raw({ utilityOwnership: null })).utilityOwnership, null);
  assert.throws(() => decodeUtilityAppearanceOwner(null));
});
test('duplicate nested identity keys and payload overflow refuse; native numeric .0 is supported', () => {
  const source = JSON.stringify(raw()).replace('"width":960', '"width":960.0');
  assert.equal(readUtilityAppearanceJson(source).frame.width, 960);
  assert.throws(() => readUtilityAppearanceJson(source.replace('"browserWindowId":"12"', '"browserWindowId":"99","browserWindowId":"12"')), /Duplicate/);
  assert.throws(() => readUtilityAppearanceJson(source + ' '.repeat(4096)), /4096/);
});
test('future exact native BWI discovery ignores unrelated, null and historical observations', async () => {
  const stream = createAppearanceStream({ pid: 42, generation: 1, candidate });
  const write = value => stream.write(Buffer.from(`AUX_NATIVE_APPEARANCE_V1 ${JSON.stringify(value)}\n`), { pid: 42, generation: 1 });
  write(raw({ observedAtUnixMs: Date.now() - 1000 }));
  const pending = stream.discoverUtility({ browserWindowId: '12', windowKind: 'little', notBefore: new Date().toISOString() });
  write(raw({ windowId: 8, utilityOwnership: owner({ windowId: 8, browserWindowId: '13' }) }));
  write(raw({ windowId: 9, utilityOwnership: null }));
  const actual = raw(); write(actual); assert.equal(await pending, JSON.stringify(actual)); stream.dispose();
});
test('utility discovery cannot borrow a retired direct-child generation', async () => {
  const stream = createAppearanceStream({ pid: 42, generation: 1, candidate });
  const pending = stream.discoverUtility({ browserWindowId: '12', windowKind: 'little', notBefore: new Date().toISOString() });
  stream.reset({ pid: 43, generation: 2, candidate }); await assert.rejects(pending, /restarted/); stream.dispose();
});
