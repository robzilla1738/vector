// Synthetic source/protocol controls only; no native appearance or setup evidence.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { dismissObservedSetup } from './lib/dismiss-observed-setup.mjs';
import { createAppearanceProvenance } from './lib/appearance-provenance.mjs';

const row = { id: 7, layer: 0, x: 10, y: 20, width: 100, height: 100 };
function client() {
  const calls = [], steps = [], diagnostics = [];
  return { calls, steps, diagnostics, app: { pid: 42 }, assert,
    ax: { pid: 42, windows: async () => [{ ...row }], waitFor: async (...args) => calls.push(['waitFor', ...args]),
      click: async (...args) => calls.push(['click', ...args]), press: async (...args) => calls.push(['press', ...args]),
      key: async (...args) => calls.push(['key', ...args]), dump: async () => ({ synthetic: true }),
      query: async selector => selector.name === 'Setup saved for later' ? [{ name: selector.name }] : [] },
    diagnostic: (name, value) => diagnostics.push({ name, value }), rpc: async () => ({}),
    step: async (name, options, run) => {
      const start = calls.length, step = { name, options }; steps.push(step);
      step.observations = await run();
      if (options.kind === 'ui') {
        assert.ok(calls.slice(start).some(call => ['click', 'press', 'key'].includes(call[0])), 'Actual runner requires passed UI input');
        assert.ok(step.observations?.ax && step.observations?.rpc, 'Actual runner requires AX plus RPC/native observations');
      }
      // Actual runner retains observations but does not return the action result.
    } };
}
function receipt(kind) { return { before: { window: { pid: 42, windowId: 7, windowKind: kind } }, after: { window: { pid: 42, windowId: 7, windowKind: kind } } }; }
test('without native appearance reader original normal setup remains mandatory', async () => {
  const t = client(); await dismissObservedSetup(t);
  assert.equal(t.calls[0][0], 'waitFor'); assert.equal(t.calls[0][1].name, 'Finish later');
  assert.ok(t.calls.some(call => call[0] === 'click' && call[1].name === 'Finish later'));
  assert.equal(t.diagnostics.length, 0);
});
test('normal, Little and Quick Ask receipts retain original setup instead of borrowing private exclusion', async () => {
  for (const kind of ['normal', 'little', 'quick-ask']) {
    const t = client(), native = receipt(kind);
    await dismissObservedSetup(t, async id => { assert.equal(id, 7); return native; });
    assert.ok(t.calls.some(call => call[0] === 'click' && call[1].name === 'Finish later'));
    assert.equal(t.diagnostics[0].value, native);
  }
});
test('actual private receipt excludes optional setup and retains both original observations', async () => {
  const t = client(), native = receipt('private');
  await dismissObservedSetup(t, async () => native);
  assert.deepEqual(t.calls, []); assert.equal(t.steps.length, 1);
  assert.equal(t.steps[0].options.kind, 'rpc');
  assert.equal(t.steps[0].observations.native, native);
  assert.equal(t.diagnostics[0].value, native);
  t.ax.query = async () => [{ name: 'Finish later' }];
  await assert.rejects(dismissObservedSetup(t, async () => native), /actual UI/);
});
test('foreign/unknown/changed kind and replaced helper windows refuse before setup effects', async () => {
  for (const mutate of [r => { r.before.window.pid = 43; }, r => { r.after.window.windowId = 8; },
    r => { r.before.window.windowKind = 'normal'; }, r => { r.before.window.windowKind = r.after.window.windowKind = 'caller-private'; }]) {
    const t = client(), native = receipt('private'); mutate(native);
    await assert.rejects(dismissObservedSetup(t, async () => native)); assert.deepEqual(t.calls, []);
  }
  for (const drift of ['helper', 'window', 'ambiguous']) {
    const t = client();
    await assert.rejects(dismissObservedSetup(t, async () => {
      if (drift === 'helper') t.ax.pid = 43;
      if (drift === 'window') t.ax.windows = async () => [{ ...row, id: 8 }];
      if (drift === 'ambiguous') t.ax.windows = async () => [{ ...row }, { ...row, id: 8 }];
      return receipt('private');
    })); assert.deepEqual(t.calls, []);
  }
});

const candidate = { productIdentity: { commit: 'a'.repeat(40), tree: 'b'.repeat(40), label: 'a'.repeat(40), dirty: false },
  native: { sourceCommit: 'a'.repeat(40), buildId: 'synthetic', manifestHash: 'c'.repeat(64) }, shellDigest: 'd'.repeat(64), harnessCommit: 'e'.repeat(40), moduleSha256: 'f'.repeat(64) };
function producer() {
  const directory = mkdtempSync(join(tmpdir(), 'aux-synthetic-setup-kind-'));
  const helperSource = join(directory, 'native-window.swift'); writeFileSync(helperSource, '// synthetic source');
  const digest = createHash('sha256').update('// synthetic source').digest('hex');
  const helperExecutable = join(directory, `native-window-${digest.slice(0, 12)}`); writeFileSync(helperExecutable, 'not executable');
  let count = 0;
  const state = { change: () => {}, preferences: () => ({ accessibility: true, screenRecording: true, reduceMotion: false, reduceTransparency: false }) };
  const reader = createAppearanceProvenance({ outputDir: directory, helperSource, helperExecutable, candidate, targetPid: 42,
    helper: { windows: async () => [{ ...row }], trusted: async () => state.preferences() },
    readIdentity: async () => ({ native: candidate.native, runtime: candidate.productIdentity }),
    observeWindow: async () => {
      const raw = { producer: 'aux-native-appearance-snapshot', version: 1, pid: 42, windowId: 7, windowKind: 'private',
        observedAtUnixMs: Date.now(), frame: { x: 10, y: 20, width: 100, height: 100 }, nativeTheme: null, backing: null, material: null,
        shell: { theme: 'dark', layout: 'vertical', sidebarAppearance: 'solid', systemDark: true, reduceMotion: false, reduceTransparency: false } };
      state.change(raw, ++count); return JSON.stringify(raw);
    } });
  return { reader, state, close: () => rmSync(directory, { recursive: true, force: true }) };
}
test('strict producer admission retains actual kind and raw observations without asserting unknown material', async () => {
  const p = producer();
  try {
    const record = await p.reader.observeWindowKind(7);
    assert.equal(record.before.window.windowKind, 'private'); assert.equal(record.after.window.windowKind, 'private');
    assert.equal(JSON.parse(record.before.rawJson).windowKind, 'private');
    assert.equal(record.after.window.material, null);
  } finally { p.close(); }
});
test('native kind drift or wrong PID cannot supply setup admission', async () => {
  for (const change of [(raw, count) => { if (count === 2) raw.windowKind = 'normal'; }, raw => { raw.pid = 43; }]) {
    const p = producer(); p.state.change = change;
    try { await assert.rejects(p.reader.observeWindowKind(7)); } finally { p.close(); }
  }
});
