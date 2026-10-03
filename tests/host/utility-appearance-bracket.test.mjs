// Controlled producer-shaped samples and synthetic PNG; not native evidence.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import { createAppearanceProvenance } from './lib/appearance-provenance.mjs';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const candidate = { productIdentity: { commit: 'a'.repeat(40), tree: 'b'.repeat(40), label: 'a'.repeat(40), dirty: false }, native: { sourceCommit: 'a'.repeat(40), buildId: 'controlled', manifestHash: 'c'.repeat(64) }, shellDigest: 'd'.repeat(64), harnessCommit: 'e'.repeat(40), moduleSha256: 'f'.repeat(64) };
async function fixture(body) {
  const directory = mkdtempSync(join(tmpdir(), 'aux-controlled-utility-bracket-'));
  try {
    const source = join(directory, 'native-window.swift'); writeFileSync(source, 'controlled source');
    const executable = join(directory, `native-window-${hash(readFileSync(source)).slice(0, 12)}`); writeFileSync(executable, 'controlled nonexecutable');
    const owner = { producer: 'aux-native-utility-appearance-owner', version: 1, windowId: 7, browserWindowId: '12', windowKind: 'little', shellDocumentToken: 'A'.repeat(32), pages: [{ pageId: 'p_fixture', documentToken: 'B'.repeat(32), selected: true }] };
    const frame = { x: 0, y: 0, width: 960, height: 720 };
    const state = { owner, identity: { runtime: candidate.productIdentity, native: candidate.native } };
    const raw = () => JSON.stringify({ producer: 'aux-native-appearance-snapshot', version: 1, pid: 42, windowId: 7, windowKind: 'little', frame, observedAtUnixMs: Date.now(), nativeTheme: 'dark', backing: null, material: null, shell: { theme: 'dark', layout: 'vertical', sidebarAppearance: 'solid', systemDark: true, reduceMotion: false, reduceTransparency: false }, utilityOwnership: state.owner });
    const producer = createAppearanceProvenance({ outputDir: directory, candidate, targetPid: 42, helperSource: source, helperExecutable: executable,
      helper: { windows: async () => [{ id: 7, layer: 0, ...frame }], trusted: async () => ({ accessibility: true, screenRecording: true, reduceMotion: false, reduceTransparency: false }) },
      observeWindow: async () => raw(), discoverUtilityWindow: async () => raw(), readIdentity: async () => state.identity });
    const bytes = PNG.sync.write({ width: 1, height: 1, data: Buffer.from([0, 0, 0, 255]) }); writeFileSync(join(directory, 'controlled.png'), bytes);
    const capture = { name: 'controlled', path: 'controlled.png', windowId: 7, sha256: hash(bytes), bytes: bytes.length };
    await body({ producer, state, owner: structuredClone(owner), capture, directory });
  } finally { rmSync(directory, { recursive: true, force: true }); }
}
test('real producer adapter binds exact BWI to two original native/helper/runtime reads', () => fixture(async ({ producer, owner }) => {
  const discovered = await producer.discoverUtilityOwner({ browserWindowId: '12', windowKind: 'little' });
  assert.deepEqual(discovered.owner, owner); assert.deepEqual(discovered.before.window.utilityOwnership, owner); assert.deepEqual(discovered.after.window.utilityOwnership, owner);
  assert.equal(typeof discovered.discoveryRawJson, 'string');
}));
test('pre-read ownership cannot substitute for actual before-capture sample', () => fixture(async ({ producer, owner, state }) => {
  state.owner = { ...state.owner, shellDocumentToken: 'C'.repeat(32) };
  await assert.rejects(producer.before(7, undefined, undefined, owner), /retired or replaced/);
}));
test('after-capture guest replacement refuses despite unchanged PID/native window ID', () => fixture(async ({ producer, owner, state, capture }) => {
  const ticket = await producer.before(7, undefined, undefined, owner);
  const capturedAt = new Date().toISOString(); state.owner = { ...state.owner, pages: [{ ...state.owner.pages[0], documentToken: 'C'.repeat(32) }] };
  await assert.rejects(producer.finish(ticket, capture, { state: 'actual-little', capturedAt, captureCompletedAt: capturedAt }), /retired or replaced/);
}));
test('successful owned bracket persists original metadata and unknown material without inventing cell', () => fixture(async ({ producer, owner, capture, directory }) => {
  const ticket = await producer.before(7, undefined, undefined, owner), capturedAt = new Date().toISOString();
  const result = await producer.finish(ticket, capture, { state: 'actual-little', capturedAt, captureCompletedAt: capturedAt });
  const proof = JSON.parse(readFileSync(join(directory, result.provenance.path)));
  const window = JSON.parse(readFileSync(join(directory, '.appearance-controlled', proof.observations[0].before.window.path)));
  assert.deepEqual(window.utilityOwnership, owner); assert.equal(window.material, null);
}));
