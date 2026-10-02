// Synthetic transport/caller tests only, never native appearance evidence.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { captureOwnedPip } from '../host/lib/pip-capture.mjs';
import { createPipAppearanceStream } from '../host/lib/appearance-stream.mjs';
const candidate = {
  productIdentity: { commit: 'a'.repeat(40), tree: 'b'.repeat(40), label: 'a'.repeat(40), dirty: false },
  native: { sourceCommit: 'a'.repeat(40), buildId: 'synthetic', manifestHash: 'c'.repeat(64) },
  shellDigest: 'd'.repeat(64), harnessCommit: 'e'.repeat(40), moduleSha256: 'f'.repeat(64),
};
const raw = changes => ({ producer: 'aux-native-pip-appearance', version: 1, pid: 42, windowId: 8, ownerWindowId: 7, ownerPageId: 'actual-page', surfaceKind: 'video-pip', windowLayer: 3, registrationGeneration: '1', frame: { x: 0, y: 0, width: 100, height: 100 }, nativeTheme: 'dark', viewTheme: 'dark', auxTheme: null, windowOpaque: true, backing: null, material: null, nativeReduceTransparency: false, nativeReduceMotion: false, nativeUnixMs: Date.now(), ...changes });
const selection = () => ({ ownerPageId: 'actual-page', surfaceKind: 'video-pip', notBefore: new Date().toISOString(), timeoutMs: 20 });
const write = (s, value) => s.write(Buffer.from(`AUX_NATIVE_PIP_APPEARANCE_V1 ${JSON.stringify(value)}\n`), { pid: 42, generation: 1 });
const stream = () => createPipAppearanceStream({ pid: 42, generation: 1, candidate });
test('fresh private discovery ignores another owner and returns original matching bytes', async () => {
  const s = stream(), pending = s.discover(selection());
  write(s, raw({ ownerPageId: 'foreign', windowId: 9 }));
  const actual = raw(); write(s, actual);
  assert.equal(await pending, JSON.stringify(actual)); s.dispose();
});
test('historical and wrong-kind receipts cannot satisfy discovery', async () => {
  const s = stream(); write(s, raw({ nativeUnixMs: Date.now() - 1000 }));
  const pending = s.discover(selection()); write(s, raw({ surfaceKind: 'document-pip' }));
  await assert.rejects(pending, /No fresh owned/); s.dispose();
});
test('restart invalidates pending owner discovery', async () => {
  const s = stream(), pending = s.discover(selection());
  s.reset({ pid: 43, generation: 2, candidate });
  await assert.rejects(pending, /restarted/); s.dispose();
});
test('child discovery and direct window observation cannot overlap', async () => {
  const s = stream(), pending = s.discover(selection());
  await assert.rejects(s.observe({ windowId: 8, notBefore: new Date().toISOString() }), /Ambiguous/);
  s.dispose(); await assert.rejects(pending, /exited/);
});
for (const changes of [{ ownerWindowId: 8 }, { ownerPageId: '' }, { pid: 99 }, { requestedCell: 'D' }]) test(`malformed producer refuses discovery ${JSON.stringify(changes)}`, async () => {
  const s = stream(), pending = s.discover(selection()); write(s, raw(changes));
  await assert.rejects(pending); s.dispose();
});
test('disabled appearance does not invoke child transport or capture', async () => {
  assert.equal(await captureOwnedPip({ appearanceEnabled: false }, 'unused'), undefined);
});
test('consumer passes actual owner and registration fences without material inference', async () => {
  const value = raw(); let captured;
  const t = { appearanceEnabled: true, app: { pid: 42 }, discoverPipAppearance: async request => {
    assert.equal(request.ownerPageId, value.ownerPageId); assert.equal(request.surfaceKind, value.surfaceKind); return JSON.stringify(value);
  }, capturePip: async (name, options) => { captured = { name, ...options }; return captured; } };
  await captureOwnedPip(t, 'actual-child', { pageId: 'actual-page' }, 'video-pip', 'manual');
  assert.deepEqual(captured.expectedOwner, { ownerPageId: 'actual-page', ownerWindowId: 7, registrationGeneration: '1', surfaceKind: 'video-pip' });
  assert.equal(captured.windowId, 8); assert.equal('material' in captured, false);
});
for (const changes of [{ pid: 43 }, { ownerPageId: 'foreign' }, { surfaceKind: 'document-pip' }, { registrationGeneration: '0' }]) test(`consumer refuses foreign receipt ${JSON.stringify(changes)}`, async () => {
  await assert.rejects(captureOwnedPip({ appearanceEnabled: true, app: { pid: 42 }, discoverPipAppearance: async () => JSON.stringify(raw(changes)), capturePip: () => assert.fail('foreign capture') }, 'child', { pageId: 'actual-page' }, 'video-pip', 'manual'));
});

import { createPipAppearanceProvenance } from '../host/lib/appearance-provenance.mjs';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const digest = value => createHash('sha256').update(value).digest('hex');
const owner = { ownerPageId: 'actual-page', ownerWindowId: 7, registrationGeneration: '1', surfaceKind: 'video-pip' };
for (const changes of [{ ownerPageId: 'new-owner' }, { ownerWindowId: 9 }, { registrationGeneration: '2' }, { surfaceKind: 'document-pip' }]) test(`fresh before refuses changed discovery fence ${JSON.stringify(changes)}`, async () => {
  const directory = mkdtempSync(join(tmpdir(), 'aux-synthetic-child-owner-'));
  try {
    const source = join(directory, 'native-window.swift'), executable = join(directory, `native-window-${digest('synthetic source').slice(0, 12)}`);
    writeFileSync(source, 'synthetic source'); writeFileSync(executable, 'synthetic binary');
    const provider = createPipAppearanceProvenance({ outputDir: directory, candidate, targetPid: 42, helperSource: source, helperExecutable: executable,
      readIdentity: async () => ({ native: candidate.native, runtime: candidate.productIdentity }),
      observeWindow: async () => JSON.stringify(raw(changes)),
      helper: { windows: async () => [{ id: 8, layer: 3, x: 0, y: 0, width: 100, height: 100 }], trusted: async () => ({ accessibility: true, screenRecording: true, reduceMotion: false, reduceTransparency: false }) } });
    await assert.rejects(provider.before(8, owner), /changed before capture/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
