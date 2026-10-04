// Synthetic protocol/collector tests only. No native hardware or budget proof.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateLittlePresentationPair } from '../host/lib/native-little-performance-protocol.mjs';
import { extractOriginalGuestFixtureRecord } from '../host/lib/guest-original-record.mjs';
import { collectGuestPresentations } from '../host/lib/native-guest-performance.mjs';
const ready = (trial = 1) => ({ producer: 'aux-native-little-presentation-upperbound', version: 1, metric: 'little-window', startKind: 'native-arm-upperbound', earliestPresentationProven: false, requestNonce: trial.toString(16).padStart(32, '0'), sampleSequence: String(trial), windowId: 7, widgetRoutingId: 1, rendererPid: 42, nativeDocumentGeneration: '1', shellSink: { clientId: 1, sinkId: 2 }, displaySink: { clientId: 3, sinkId: 4 }, armedUs: String(trial * 1000000), status: 'ready', reason: 'ready', measured: false });
const measured = (trial = 1, elapsed = 400000) => {
  const start = trial * 1000000;
  const frame = (sink, token) => ({ token, surface: { frameSink: sink, parentSequenceNumber: 1, childSequenceNumber: 2, embedToken: 'C'.repeat(32) }, surfaceSize: { width: 100, height: 100 }, visibleBounds: { x: 0, y: 0, width: 100, height: 100 } });
  return { ...ready(trial), status: 'measured', reason: 'measured-upperbound', measured: true, target: { windowId: 8 + trial, widgetRoutingId: 2 + trial, rendererPid: 43, nativeDocumentGeneration: String(trial), shellSink: { clientId: 5, sinkId: 6 }, displaySink: { clientId: 7, sinkId: 8 } }, guestCommittedUs: String(start + 200000), witnessObservedUs: String(start + 250000), commitUs: String(start + 260000), submittedUs: String(start + 270000), drawUs: String(start + 280000), swapStartUs: String(start + 290000), swapEndUs: String(start + 300000), presentedUs: String(start + elapsed), observedUs: String(start + elapsed + 1), elapsedUs: String(elapsed), shellFrameToken: 1, feedbackFlags: 4, drawn: [frame({ clientId: 5, sinkId: 6 }, 1), frame({ clientId: 9, sinkId: 10 }, 2)] };
};
test('whole Arm upperbound includes external creation and never claims earliest presentation', () => {
  assert.equal(validateLittlePresentationPair(JSON.stringify(ready()), JSON.stringify(measured())).elapsedMs, 400);
});
for (const changes of [{ earliestPresentationProven: true }, { armedUs: '1100000' }, { guestCommittedUs: '900000' }, { submittedUs: '1400000' }, { elapsedUs: '100000' }, { feedbackFlags: 0 }, { drawn: [] }, { status: 'refused', measured: false, reason: 'foreign_target' }]) test(`bad Little proof refuses ${JSON.stringify(changes)}`, () => assert.throws(() => validateLittlePresentationPair(JSON.stringify(ready()), JSON.stringify({ ...measured(), ...changes }))));
test('borrowed source window or foreign target root token refuses', () => {
  const value = measured(); value.target.windowId = 7;
  assert.throws(() => validateLittlePresentationPair(JSON.stringify(ready()), JSON.stringify(value)));
  value.target.windowId = 8; value.drawn[0].token = 99;
  assert.throws(() => validateLittlePresentationPair(JSON.stringify(ready()), JSON.stringify(value)));
});
const directory = mkdtempSync(join(tmpdir(), 'aux-synthetic-little-helper-'));
after(() => rmSync(directory, { recursive: true, force: true }));
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const source = join(directory, 'native-window.swift'); writeFileSync(source, 'synthetic source');
const executable = join(directory, `native-window-${hash(source).slice(0, 12)}`); writeFileSync(executable, 'synthetic unexecuted helper');
const candidate = { productIdentity: { commit: 'a'.repeat(40), tree: 'b'.repeat(40), label: 'a'.repeat(40), dirty: false }, native: { sourceCommit: 'a'.repeat(40), buildId: 'synthetic', manifestHash: 'c'.repeat(64) }, shellDigest: 'd'.repeat(64), harnessCommit: 'e'.repeat(40), moduleSha256: 'f'.repeat(64) };
function fixture(outlier = false) {
  const actions = []; let trial = 0, sequence = 0;
  const writerSource = realpathSync(fileURLToPath(new URL('../host/lib/performance-mailbox-writer.py', import.meta.url))), interpreter = realpathSync('/usr/bin/python3');
  const transport = { writer: { source: writerSource, sourceSha256: hash(writerSource), interpreter, interpreterSha256: hash(interpreter) }, async invoke(method) {
    actions.push(method);
    const record = method === 'prepareLittleWindowPresentation' ? ready(++trial) : measured(trial, outlier && trial === 20 ? 600001 : 400000), text = JSON.stringify(record);
    this.lastReceipt = { pid: 42, generation: 1, sequence: String(++sequence), operation: method, recordRaw: text, raw: 'AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify({ producer: 'aux-native-fixture-reply', version: 1, pid: 42, windowId: 7, sequence: String(sequence), operation: method, record }) }; return text;
  } };
  return { actions, options: { transport, ax: { pid: 42, helperPid: 99, helperSource: source, helperExecutable: executable }, candidate, readIdentity: async () => ({ runtime: candidate.productIdentity, native: candidate.native }), readPower: async () => "Now drawing from 'AC Power'", metric: 'little-window', setup: async () => actions.push('setup'), input: async () => actions.push('external'), cleanup: async () => actions.push('close-exact-target') } };
}
test('20 genuine-channel-shaped samples preserve Arm/external/Complete/cleanup order and raw upperbounds', async () => {
  const f = fixture(), report = await collectGuestPresentations(f.options);
  assert.equal(report.status, 'measured'); assert.equal(report.maxMs, 400); assert.equal(report.p95Ms, 400); assert.equal(report.budgetMs, 600);
  for (let i = 0; i < 20; i++) assert.deepEqual(f.actions.slice(i * 5, i * 5 + 5), ['setup', 'prepareLittleWindowPresentation', 'external', 'completeLittleWindowPresentation', 'close-exact-target']);
});
test('one 600.001ms outlier refuses even when p95 passes and retains all originals', async () => {
  const f = fixture(true);
  await assert.rejects(collectGuestPresentations(f.options), error => error.report.samplesMs.length === 20 && error.report.p95Ms === 400 && error.report.maxMs === 600.001 && error.report.attempts.every(row => row.measuredRaw && row.measuredReceipt.raw));
});

test('Little original bytes retain actual nested .0 through full collector', async () => {
  const f = fixture(), invoke = f.options.transport.invoke;
  f.options.transport.invoke = async function(method) { await invoke.call(this, method); this.lastReceipt.raw = this.lastReceipt.raw.replace('"clientId":1', '"clientId":1.0'); assert.ok(this.lastReceipt.raw.includes('1.0')); this.lastReceipt.recordRaw = extractOriginalGuestFixtureRecord(this.lastReceipt.raw); return this.lastReceipt.recordRaw; };
  const report = await collectGuestPresentations(f.options); assert.equal(report.samplesMs.length, 20); assert.equal(report.status, 'measured');
});
