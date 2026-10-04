// Synthetic decoder/collector cases only; no actual paint/performance evidence.
import { test, after } from 'node:test';
import { mkdtempSync, writeFileSync, rmSync, readFileSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const directory = mkdtempSync(join(tmpdir(), 'aux-synthetic-guest-helper-'));
after(() => rmSync(directory, { recursive: true, force: true }));
const source = join(directory, 'native-window.swift'), executable = join(directory, `native-window-${createHash('sha256').update('synthetic source').digest('hex').slice(0, 12)}`);
writeFileSync(source, 'synthetic source'); writeFileSync(executable, 'synthetic helper, never executed');
import assert from 'node:assert/strict';
import { validateGuestPresentationPair, collectGuestPresentations } from '../host/lib/native-guest-performance.mjs';
const ready = (trial = 1) => ({ producer: 'aux-native-guest-presentation', version: 1, metric: 'tab-switch', requestNonce: trial.toString(16).padStart(32, '0'), sampleSequence: String(trial), windowId: 7, widgetRoutingId: 1, rendererPid: 42, nativeDocumentGeneration: '1', shellSink: { clientId: 1, sinkId: 2 }, displaySink: { clientId: 3, sinkId: 4 }, status: 'ready', reason: 'ready', measured: false });
const measured = (trial = 1, elapsed = 1000) => {
  const start = trial * 100000;
  return { ...ready(trial), status: 'measured', reason: 'measured', measured: true, nativeInputUs: String(start), rendererInputUs: String(start), nativeObservedUs: String(start + 1), mutationUs: String(start + 2), commitUs: String(start + 3), submittedUs: String(start + 4), drawUs: String(start + 5), swapStartUs: String(start + 6), swapEndUs: String(start + 7), presentedUs: String(start + elapsed), elapsedUs: String(elapsed), originalInputKind: 'keydown', sourcePid: 99, shellFrameToken: 1, feedbackFlags: 4, drawn: [{ token: 2, surface: { frameSink: { clientId: 5, sinkId: 6 }, parentSequenceNumber: 1, childSequenceNumber: 2, embedToken: 'C'.repeat(32) }, surfaceSize: { width: 100, height: 100 }, visibleBounds: { x: 0, y: 0, width: 100, height: 100 } }] };
};
test('decoder accepts exact same-clock native pair without requiring root/child token equality', () => {
  assert.equal(validateGuestPresentationPair(JSON.stringify(ready()), JSON.stringify(measured()), 'tab-switch').elapsedMs, 1);
});
for (const changes of [{ submittedUs: '200000' }, { requestNonce: 'f'.repeat(32) }, { feedbackFlags: 0 }, { elapsedUs: '1001' }, { status: 'refused', reason: 'no_native_input' }, { drawn: [] }]) test(`bad actual pair refuses ${JSON.stringify(changes)}`, () => {
  assert.throws(() => validateGuestPresentationPair(JSON.stringify(ready()), JSON.stringify({ ...measured(), ...changes }), 'tab-switch'));
});
const candidate = { productIdentity: { commit: 'a'.repeat(40), tree: 'b'.repeat(40), label: 'a'.repeat(40), dirty: false }, native: { sourceCommit: 'a'.repeat(40), buildId: 'synthetic', manifestHash: 'c'.repeat(64) }, shellDigest: 'd'.repeat(64), harnessCommit: 'e'.repeat(40), moduleSha256: 'f'.repeat(64) };
function syntheticTransport(transport) {
  let sequence = 0;
  const writerSource = realpathSync(fileURLToPath(new URL('../host/lib/performance-mailbox-writer.py', import.meta.url))), interpreter = realpathSync('/usr/bin/python3');
  const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
  return { writer: { source: writerSource, sourceSha256: hash(writerSource), interpreter, interpreterSha256: hash(interpreter) }, lastReceipt: undefined, async invoke(method) {
    const text = await transport.invoke(method), record = JSON.parse(text);
    this.lastReceipt = { pid: 42, generation: 1, sequence: String(++sequence), operation: method, recordRaw: text,
      raw: 'AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify({ producer: 'aux-native-fixture-reply', version: 1, pid: 42, windowId: record.windowId ?? 7, sequence: String(sequence), operation: method, record }) };
    return text;
  } };
}
const fixture = (changes = {}) => {
  let trial = 0; const actions = [];
  const value = { actions, options: { metric: 'tab-switch', candidate, ax: { pid: 42, helperPid: 99, helperSource: source, helperExecutable: executable }, readIdentity: async () => ({ runtime: candidate.productIdentity, native: candidate.native }), readPower: async () => "Now drawing from 'AC Power'", setup: async () => {}, input: async () => { actions.push('hid'); }, transport: { invoke: async method => { actions.push(method); return JSON.stringify(method === 'completeGuestPresentation' ? measured(trial) : ready(++trial)); } }, ...changes } };
  value.options.transport = syntheticTransport(value.options.transport); return value;
};
test('20 trials invoke genuine private Prepare before input and Complete afterward', async () => {
  const f = fixture(), report = await collectGuestPresentations(f.options);
  assert.equal(report.samplesMs.length, 20); assert.equal(report.status, 'measured');
  for (let i = 0; i < 20; i++) assert.deepEqual(f.actions.slice(i * 3, i * 3 + 3), ['prepareGuestTabSwitchPresentation', 'hid', 'completeGuestPresentation']);
});
test('malformed Ready refuses before real input; original raw retained', async () => {
  let hid = false;
  await assert.rejects(collectGuestPresentations(fixture({ input: async () => { hid = true; }, transport: { invoke: async () => JSON.stringify({ ...ready(), measured: true }) } }).options), error => { assert.ok(error.report.attempts[0].readyRaw); return true; });
  assert.equal(hid, false);
});
test('19 trials refuse, budget overrun retains all raw intervals', async () => {
  await assert.rejects(collectGuestPresentations(fixture({ trials: 19 }).options));
  const f = fixture(); let trial = 0;
  f.options.transport = syntheticTransport({ invoke: async method => JSON.stringify(method === 'completeGuestPresentation' ? measured(trial, 50001) : ready(++trial)) });
  await assert.rejects(collectGuestPresentations(f.options), error => { assert.equal(error.report.samplesMs.length, 20); assert.equal(error.report.maxMs, 50.001); return true; });
});

test('strict sample sequence refuses even with a new nonce', async () => {
  const f = fixture(); let trial = 0;
  f.options.transport = syntheticTransport({ invoke: async method => {
    const value = method === 'completeGuestPresentation' ? measured(trial) : ready(++trial);
    value.sampleSequence = '1'; return JSON.stringify(value);
  } });
  await assert.rejects(collectGuestPresentations(f.options), error => { assert.match(error.message, /sample sequence/); assert.equal(error.report.samplesMs.length, 1); return true; });
});
test('divider p95 uses nearest rank; max remains raw diagnostic', async () => {
  for (const outliers of [1, 2]) {
    const f = fixture({ metric: 'divider-frame' }); let trial = 0;
    f.options.transport = syntheticTransport({ invoke: async method => {
      const value = method === 'completeGuestPresentation' ? measured(trial, trial > 20 - outliers ? 20000 : 16000) : ready(++trial);
      value.metric = 'divider-frame'; if (value.status === 'measured') value.originalInputKind = 'left-drag';
      return JSON.stringify(value);
    } });
    if (outliers === 1) { const report = await collectGuestPresentations(f.options); assert.equal(report.p95Ms, 16); assert.equal(report.maxMs, 20); }
    else await assert.rejects(collectGuestPresentations(f.options), error => { assert.equal(error.report.p95Ms, 20); return true; });
  }
});

test('scope-less honest native refusal retains reason and never becomes measurement', async () => {
  const raw = JSON.stringify({ producer: 'aux-native-guest-presentation', version: 1, status: 'refused', reason: 'no_native_input', measured: false });
  await assert.rejects(collectGuestPresentations(fixture({ transport: { invoke: async () => raw } }).options), error => {
    assert.match(error.message, /no_native_input/); assert.equal(error.report.attempts[0].readyRaw, raw); assert.equal(error.report.samplesMs.length, 0); return true;
  });
});
test('original native transport refusal is retained without inventing Ready scope', async () => {
  const error = new Error('native refused'); error.nativeRaw = 'original diagnostic refusal';
  await assert.rejects(collectGuestPresentations(fixture({ transport: { invoke: async () => { throw error; } } }).options), error => {
    assert.equal(error.report.transportRefusalRaw, 'original diagnostic refusal'); assert.equal(error.report.attempts[0].readyRaw, undefined); return true;
  });
});

test('original native receipt is required before real input and remains byte-for-byte with hash', async () => {
  const f = fixture(); const report = await collectGuestPresentations(f.options);
  const receipt = report.attempts[0].readyReceipt;
  assert.equal(receipt.sha256, createHash('sha256').update(receipt.raw).digest('hex'));
  const bad = fixture(); let hid = false; bad.options.input = async () => { hid = true; };
  const transport = bad.options.transport; bad.options.transport = { writer: transport.writer, invoke: method => transport.invoke(method) };
  await assert.rejects(collectGuestPresentations(bad.options), /original native stderr receipt/); assert.equal(hid, false);
});

test('optional Ready consumer receives immutable genuine scope before input', async () => {
  const f = fixture(); let readyCalls = 0;
  f.options.onReady = async value => { assert.ok(Object.isFrozen(value.ready.shellSink)); assert.ok(Object.isFrozen(value.receipt)); assert.equal(value.ready.windowId, 7); readyCalls++; };
  const report = await collectGuestPresentations(f.options); assert.equal(readyCalls, 20); assert.ok(report.writer.sourceSha256);
});

test('raw tab p50 is reported alongside unchanged stricter max gate', async () => {
  const f = fixture(); let trial = 0;
  f.options.transport = syntheticTransport({ invoke: async method => JSON.stringify(method === 'completeGuestPresentation' ? measured(trial, trial <= 10 ? 10000 : 20000) : ready(++trial)) });
  const report = await collectGuestPresentations(f.options); assert.equal(report.p50Ms, 10); assert.equal(report.gatedMs, 20); assert.equal(report.budgetMs, 50);
});
test('nested duplicate drawn field refuses without replacing original raw evidence', () => {
  const raw = JSON.stringify(measured()).replace('"width":100', '"width":99,"width":100');
  assert.throws(() => validateGuestPresentationPair(JSON.stringify(ready()), raw, 'tab-switch'), /Duplicate/);
});
test('unrounded split-drop150.001ms and divider16.701ms remain failures', async () => {
  for (const [metric, elapsed, kind] of [['split-drop', 150001, 'left-up'], ['divider-frame', 16701, 'left-drag']]) {
    const f = fixture({ metric }); let trial = 0;
    f.options.transport = syntheticTransport({ invoke: async method => { const row = method === 'completeGuestPresentation' ? measured(trial, elapsed) : ready(++trial); row.metric = metric; if (row.measured) { row.originalInputKind = kind; for (const key of Object.keys(row)) if (key.endsWith('Us') && key !== 'elapsedUs') row[key] = String(BigInt(row[key]) + BigInt(trial * 900000)); } return JSON.stringify(row); } });
    await assert.rejects(collectGuestPresentations(f.options), error => { assert.equal(error.report.samplesMs.length, 20); assert.equal(error.report.gatedMs, elapsed / 1000); return true; });
  }
});
