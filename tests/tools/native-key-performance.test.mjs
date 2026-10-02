// Synthetic producer fixtures only; no native/AC performance qualification.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectNativeKeyEffects, rawPercentile } from '../host/lib/native-key-performance.mjs';
const candidate = {
  productIdentity: { commit: 'a'.repeat(40), tree: 'b'.repeat(40), label: 'a'.repeat(40), dirty: false },
  native: { sourceCommit: 'a'.repeat(40), buildId: 'synthetic', manifestHash: 'c'.repeat(64) },
  shellDigest: 'd'.repeat(64), harnessCommit: 'e'.repeat(40), moduleSha256: 'f'.repeat(64),
};
const ac = "Now drawing from 'AC Power'\n";
const selector = { role: 'AXButton', name: 'Before', scope: 'shell' };
function fixture() {
  const directory = mkdtempSync(join(tmpdir(), 'aux-synthetic-key-perf-'));
  const helperSource = join(directory, 'native-window.swift'); writeFileSync(helperSource, '// synthetic source');
  const digest = createHash('sha256').update(readFileSync(helperSource)).digest('hex');
  const helperExecutable = join(directory, `native-window-${digest.slice(0, 12)}`); writeFileSync(helperExecutable, 'not executable');
  let index = 0;
  const f = { calls: [], duration: 10, mutate: row => row };
  const measure = () => {
    const start = 1_000_000_000n + BigInt(++index) * 1_000_000_000n;
    return f.mutate({ via: 'hid', postedAtNs: String(start), observedAtNs: String(start + BigInt(Math.round(f.duration * 1_000_000))), elapsedMs: f.duration,
      notification: 'AXTitleChanged', expectedName: 'After', element: { name: 'After' } });
  };
  const ax = { pid: 42, helperSource, helperExecutable,
    measureKey: async (...args) => { f.calls.push(args); return measure(); },
    request: async (command, request) => { assert.equal(command, 'measureKey'); f.calls.push(request); const row = measure(); return { ...row, expectedVisible: false, selector: request.selector, visibleElements: [],
      ...(request.additionalHiddenSelectors ? { hiddenSelectors: [request.selector, ...request.additionalHiddenSelectors], effectConfirmedAtNs: row.observedAtNs } : {}) }; } };
  f.options = { ax, candidate, readIdentity: async () => ({ native: candidate.native, runtime: candidate.productIdentity }),
    prepareTrial: async () => {}, chord: 'command+s', selector, effect: { expectedName: 'After' }, readPower: async () => ac };
  f.close = () => rmSync(directory, { recursive: true, force: true }); return f;
}
async function run(body) { const f = fixture(); try { await body(f); } finally { f.close(); } }
test('collects 20 actual-call shaped raw intervals, paired pins and unrounded summary', () => run(async f => {
  const report = await collectNativeKeyEffects(f.options);
  assert.equal(report.status, 'measured'); assert.equal(report.measurements.length, 20); assert.equal(report.p95Ms, 10);
  assert.deepEqual(f.calls[0], ['command+s', selector, 'After', 500]);
  assert.equal(report.powerBefore, ac); assert.equal(report.powerAfter, ac); assert.match(report.endpoint, /not presentation/);
}));
test('unrounded just-over-budget raw interval refuses', () => run(async f => {
  f.duration = 50.000001;
  await assert.rejects(collectNativeKeyEffects(f.options), error => error.report.status === 'failed' && error.report.p95Ms > 50 && error.report.measurements.length === 20);
}));
test('one slow shortcut refuses even when its retained p95 is within budget', () => run(async f => {
  let trial = 0;
  f.options.prepareTrial = async () => { f.duration = ++trial === 20 ? 50.000001 : 10; };
  await assert.rejects(collectNativeKeyEffects(f.options), error =>
    error.report.measurements.length === 20 && error.report.p95Ms < 50 &&
    error.report.maxMs === 50.000001 && error.report.gatedMs === error.report.maxMs);
}));
test('raw percentile preserves precision without modifying samples', () => {
  const samples = [30.01, 30.04]; assert.equal(rawPercentile(samples, 0.95), 30.0385); assert.deepEqual(samples, [30.01, 30.04]);
  assert.throws(() => rawPercentile([-1], 0.95));
});
test('less than20 or dirty/unpaired candidate refuses before physical input', () => run(async f => {
  await assert.rejects(collectNativeKeyEffects({ ...f.options, trials: 19 }), /20–100/);
  await assert.rejects(collectNativeKeyEffects({ ...f.options, candidate: { ...candidate, productIdentity: { ...candidate.productIdentity, dirty: true } } }), /Clean/);
  assert.equal(f.calls.length, 0);
}));
test('power change after actual trials fails and retains originals', () => run(async f => {
  let reads = 0;
  await assert.rejects(collectNativeKeyEffects({ ...f.options, readPower: async () => ++reads === 1 ? ac : "Now drawing from 'Battery Power'" }), error => error.report.measurements.length === 20 && /AC power/.test(error.message));
}));
test('physical input failure is retained with original trial/stage and partial series', () => run(async f => {
  f.options.ax.measureKey = async (...args) => { f.calls.push(args); throw new Error('real helper refused focus'); };
  await assert.rejects(collectNativeKeyEffects(f.options), error => error.report.attempts[0].stage === 'physical-input' && error.report.attempts[0].error === 'real helper refused focus' && error.report.measurements.length === 0);
}));
for (const [name, mutate] of [
  ['reversed clock', row => ({ ...row, observedAtNs: '0' })],
  ['wrong elapsed', row => ({ ...row, elapsedMs: 1 })],
  ['synthetic input label', row => ({ ...row, via: 'cdp' })],
  ['missing AX effect', row => ({ ...row, element: { name: 'Before' } })],
  ['replayed interval', row => ({ ...row, postedAtNs: '1000000000', observedAtNs: '1010000000' })],
]) test(`${name} refuses and preserves raw helper reply`, () => run(async f => {
  f.mutate = mutate;
  await assert.rejects(collectNativeKeyEffects(f.options), error => error.report.attempts.at(-1).raw && error.report.attempts.at(-1).status === 'failed');
}));
test('runtime identity and helper bytes changes refuse', () => run(async f => {
  f.options.readIdentity = async () => ({ native: candidate.native, runtime: { ...candidate.productIdentity, dirty: true } });
  await assert.rejects(collectNativeKeyEffects(f.options), /Runtime candidate/);
  f.options.readIdentity = async () => ({ native: candidate.native, runtime: candidate.productIdentity });
  f.options.prepareTrial = async () => writeFileSync(f.options.ax.helperExecutable, 'changed');
  await assert.rejects(collectNativeKeyEffects(f.options), /Helper bytes/);
}));
test('minimal disappearance uses real existing raw helper request and250ms max gate', () => run(async f => {
  const options = { ...f.options, metric: 'minimal-toggle', additionalHiddenSelectors: [{ role: 'AXTabGroup', name: 'Tabs', scope: 'shell' }], effect: { expectedVisible: false } };
  const report = await collectNativeKeyEffects(options); assert.equal(report.budgetMs, 250); assert.equal(report.gatedMs, 10);
  assert.equal(f.calls[0].expectedVisible, false);
  f.duration = 250.000001;
  await assert.rejects(collectNativeKeyEffects(options), /exceeds 250/);
}));

test('minimal refuses one-control proof before input', () => run(async f => {
  await assert.rejects(collectNativeKeyEffects({ ...f.options, metric: 'minimal-toggle', effect: { expectedVisible: false } }), /both address and tab/);
  assert.equal(f.calls.length, 0);
}));
test('combined confirmation traversal remains inside the strict250ms interval', () => run(async f => {
  const extra = [{ role: 'AXTabGroup', name: 'Tabs', scope: 'shell' }];
  f.options.ax.request = async (_command, request) => {
    f.calls.push(request);
    const start = BigInt(f.calls.length) * 1000000000n;
    return { via: 'hid', postedAtNs: String(start), observedAtNs: String(start + 100000000n), effectConfirmedAtNs: String(start + 250000001n),
      elapsedMs: 250.000001, notification: 'AXLayoutChanged', expectedVisible: false,
      selector, hiddenSelectors: [selector, ...extra], visibleElements: [] };
  };
  await assert.rejects(collectNativeKeyEffects({ ...f.options, metric: 'minimal-toggle', additionalHiddenSelectors: extra,
    effect: { expectedVisible: false } }), error => error.report.measurements.length === 20 && error.report.maxMs > 250 && /exceeds 250/.test(error.message));
}));
