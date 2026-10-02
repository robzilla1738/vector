import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { createPerformanceMailbox } from './performance-mailbox.mjs';
import { validateNativeStockProcessMemory, createNativeStockMemoryReader, collectNativeStockMemoryTrials, assertMatchedStockMemoryOverhead } from './native-stock-process-memory.mjs';

// Synthetic original protocol controls only; no stock app/kernel/AC qualification.
const chromium = { version: '145.0.7579.0', lastChange: 'actual-upstream-revision' };
const urls = Array.from({ length: 10 }, (_, i) => `https://fixture.test/idle/${i}`);
function record(sequence = 1) {
  return { producer: 'aux-native-stock-process-memory', version: 1, status: 'sampled', auxShellEnabled: false,
    chromiumVersion: chromium.version, chromiumLastChange: chromium.lastChange, windowId: 1, requestNonce: 'a'.repeat(32), sampleSequence: String(sequence),
    sampleStartUs: String(1000000 + sequence * 1000), sampleEndUs: String(1000100 + sequence * 1000),
    tabs: urls.map((url, i) => ({ url, documentReceipt: (i + 1).toString(16).padStart(32, '0') })),
    processes: [[100, 'browser', 2, [], 'b'.repeat(32), '300', [['100', '5', '10'], ['105', '20', '30']]],
      [101, 'renderer', 3, [1], 'b'.repeat(32), '301', [['200', '5', '10'], ['205', '20', '30']]],
      [102, 'gpu', 9, [2], 'b'.repeat(32), '302', [['300', '5', '10'], ['305', '20', '30']]]] };
}

test('stock preserves each original reading and computes distinct conservative bounds without shell/runtime', () => {
  const decoded = validateNativeStockProcessMemory(JSON.stringify(record()), 100, chromium);
  assert.equal(decoded.totalLowerBytes, 600n); assert.equal(decoded.totalUpperBytes, 615n);
  assert.equal(decoded.processes.reduce((sum, process) => sum + process.readings.length, 0), 6);
});
for (const [name, change] of [
  ['wrong tag', row => { row.chromiumVersion = '146.0.0.0'; }],
  ['same version different source revision', row => { row.chromiumLastChange = 'foreign'; }],
  ['Aux enabled', row => { row.auxShellEnabled = true; }],
  ['Aux runtime role', row => { row.processes[1][1] = 'runtime'; }],
  ['caller-selected PID', row => { row.processes[0][0] = 999; }],
  ['duplicate real PID', row => { row.processes[1][0] = 100; }],
  ['missing actual native host', row => { row.processes[1][3] = []; }],
  ['duplicate native host', row => { row.processes[2][3] = [1]; }],
  ['missing kernel reading', row => { row.processes[1][6].pop(); }],
  ['numeric estimated footprint', row => { row.processes[1][6][0][0] = 200; }],
  ['kernel outside native bracket', row => { row.processes[1][6][1][2] = '101'; }],
  ['zero kernel UUID', row => { row.processes[1][4] = '0'.repeat(32); }],
  ['missing tenth human tab', row => { row.tabs.pop(); }],
  ['duplicate document receipt', row => { row.tabs[1].documentReceipt = row.tabs[0].documentReceipt; }],
  ['foreign internal tab', row => { row.tabs[0].url = 'chrome://newtab/'; }],
  ['unknown extra authority field', row => { row.pidSelector = 101; }],
]) test(`stock refuses ${name}`, () => { const row = record(); change(row); assert.throws(() => validateNativeStockProcessMemory(JSON.stringify(row), 100, chromium)); });

test('ten genuine distinct documents may have the same URL, without being deduplicated away', () => {
  const row = record(); for (const tab of row.tabs) tab.url = urls[0];
  assert.equal(validateNativeStockProcessMemory(JSON.stringify(row), 100, chromium).row.tabs.length, 10);
});
function readerFixture() {
  let calls = 0;
  const f = { mutate: row => row, alterReceipt: receipt => receipt };
  const expectedIdentity = { sourceCommit: 'a'.repeat(40), manifestHash: 'c'.repeat(64), buildId: 'synthetic-stock', dirty: false, chromiumVersion: chromium.version, chromiumLastChange: chromium.lastChange };
  const transport = { async invoke(operation) {
    const count = ++calls, row = f.mutate(record(count), count), raw = JSON.stringify(row);
    const wrapper = { producer: 'aux-native-fixture-reply', version: 1, pid: 100, windowId: 1, sequence: String(count), operation, record: row };
    this.lastReceipt = f.alterReceipt({ pid: 100, generation: 1, sequence: String(count), operation, recordRaw: raw, raw: 'AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify(wrapper) });
    return raw;
  } };
  f.options = { transport, browserPid: 100, expectedIdentity, expectedChromium: chromium, expectedUrls: urls,
    readIdentity: async () => expectedIdentity, readPower: async () => "Now drawing from 'AC Power'" };
  f.calls = () => calls; return f;
}
test('twenty stock trials retain exact original child envelopes, all readings, source identity and AC', async () => {
  const f = readerFixture(), reader = createNativeStockMemoryReader(f.options);
  const trials = await collectNativeStockMemoryTrials({ reader, signal: new AbortController().signal });
  assert.equal(trials.length, 20); assert.equal(f.calls(), 20);
  for (const trial of trials) {
    assert.equal(trial.status, 'sampled'); assert.equal(trial.observation.decoded.totalLowerBytes, 600n);
    assert.ok(trial.observation.receipt.raw && trial.observation.before.power && trial.observation.after.power);
    assert.equal(trial.observation.raw, JSON.stringify(trial.observation.native));
  }
});
for (const [name, change] of [
  ['same-URL document replacement', row => { row.tabs[0].documentReceipt = 'c'.repeat(32); }],
  ['changed measurement owner nonce', row => { row.requestNonce = 'c'.repeat(32); }],
  ['replayed sample sequence', row => { row.sampleSequence = '1'; }],
]) test(`stock reader refuses ${name}`, async () => {
  const f = readerFixture(), reader = createNativeStockMemoryReader(f.options); await reader.sample(); f.mutate = row => { change(row); return row; };
  await assert.rejects(reader.sample(), error => Boolean(error.observation.raw && error.observation.receipt.raw));
});
test('original stock refusal after two sampled trials is retained and cannot substitute for a sample', async () => {
  const f = readerFixture(); f.mutate = (row, count) => count === 3 ? { producer: row.producer, version: 1, status: 'refused' } : row;
  await assert.rejects(collectNativeStockMemoryTrials({ reader: createNativeStockMemoryReader(f.options), signal: new AbortController().signal }), error => {
    assert.equal(error.trials.length, 3); assert.equal(error.trials[2].status, 'failed'); assert.ok(error.trials[2].observation.raw.includes('refused')); return true;
  });
  assert.equal(f.calls(), 3);
});
test('stock reader refuses a foreign original browser child without consuming memory as valid', async () => {
  const f = readerFixture(); f.alterReceipt = receipt => ({ ...receipt, pid: 999 });
  await assert.rejects(createNativeStockMemoryReader(f.options).sample(), error => Boolean(error.observation.raw && error.observation.receipt.raw));
});
test('stock reader requires original AC and clean source identity before its closed operation', async () => {
  const f = readerFixture(); f.options.readPower = async () => "Now drawing from 'Battery Power'";
  await assert.rejects(createNativeStockMemoryReader(f.options).sample()); assert.equal(f.calls(), 0);
  const changed = readerFixture(); changed.options.readIdentity = async () => ({ ...changed.options.expectedIdentity, dirty: true });
  await assert.rejects(createNativeStockMemoryReader(changed.options).sample()); assert.equal(changed.calls(), 0);
});
function originalObservation(row, stock, trial) {
  const operation = stock ? 'sampleStockProcessMemory' : 'sampleProcessMemory';
  const native = { sourceCommit: 'a'.repeat(40), buildId: 'synthetic', manifestHash: 'c'.repeat(64) };
  const identity = stock ? { ...native, dirty: false, chromiumVersion: chromium.version, chromiumLastChange: chromium.lastChange }
    : { runtime: { commit: native.sourceCommit, tree: 'd'.repeat(40), label: native.sourceCommit, dirty: false }, native };
  const raw = JSON.stringify(row), wrapper = { producer: 'aux-native-fixture-reply', version: 1, pid: 100, windowId: row.windowId, sequence: String(trial), operation, record: row };
  const envelope = 'AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify(wrapper);
  return { status: 'sampled', operation, raw, receipt: { raw: envelope, pid: 100, generation: 1, sequence: String(trial), operation, recordRaw: raw },
    before: { identity, power: "Now drawing from 'AC Power'" }, after: { identity: structuredClone(identity), power: "Now drawing from 'AC Power'" },
    sha256: createHash('sha256').update(envelope).digest('hex') };
}
function rewriteOriginal(observation, change) {
  const row = JSON.parse(observation.raw); change(row); observation.raw = JSON.stringify(row);
  observation.receipt.recordRaw = observation.raw;
  const wrapper = JSON.parse(observation.receipt.raw.slice('AUX_NATIVE_FIXTURE_REPLY_V1 '.length)); wrapper.record = row;
  observation.receipt.raw = 'AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify(wrapper);
  observation.sha256 = createHash('sha256').update(observation.receipt.raw).digest('hex');
}
function matchedTrials() {
  const human = urls.map((url, index) => ({ pageId: `human-${index}`, sessionId: `session-${index}`, documentEpoch: 1, url }));
  const stock = Array.from({ length: 20 }, (_, index) => ({ trial: index + 1, status: 'sampled', observation: originalObservation(record(index + 1), true, index + 1) }));
  const aux = Array.from({ length: 20 }, (_, index) => {
    const browserReadings = [['200', '5', '10'], ['200', '20', '30'], ['200', '60', '70'], ['200', '80', '90']];
    const row = { producer: 'aux-native-process-memory', version: 1, status: 'sampled', chromiumVersion: chromium.version, chromiumLastChange: chromium.lastChange,
      windowId: 1, widgetRoutingId: 2, requestNonce: 'b'.repeat(32), sampleSequence: String(index + 1), sampleStartUs: String(1000000 + (index + 1) * 1000), sampleEndUs: String(1000100 + (index + 1) * 1000),
      workload: { producer: 'aux-runtime-subagent-workload', version: 1, status: 'idle', activeExecutions: 0 }, workloadObservedAt: [1000, 1001], workloadRequestTimes: ['0', '3', '91', '95'],
      processes: [[100, 'browser', 2, [], 'b'.repeat(32), '300', structuredClone(browserReadings)], [101, 'shell', 3, [1], 'b'.repeat(32), '301', structuredClone(browserReadings)],
        [102, 'gpu', 9, [2], 'b'.repeat(32), '302', structuredClone(browserReadings)], [103, 'runtime', null, [], 'b'.repeat(32), '303', [['100', '40', '45'], ['100', '46', '50']], '7']] };
    return { trial: index + 1, mode: 'idle', status: 'sampled', idleBefore: structuredClone(human), idleAfter: structuredClone(human), observation: originalObservation(row, false, index + 1) };
  });
  return { stock, aux };
}
test('overhead subtracts stock lower bound from Aux upper, retaining all twenty originals', () => {
  const { aux, stock } = matchedTrials();
  assert.deepEqual(assertMatchedStockMemoryOverhead(aux, stock, 100n), { auxUpperBytes: 700n, stockLowerBytes: 600n, overheadUpperBytes: 100n, limitBytes: 100n });
  assert.throws(() => assertMatchedStockMemoryOverhead(aux, stock, 90n), /overhead exceeds/);
});
for (const [name, change] of [
  ['different actual ten-tab fixture', ({ stock }) => { rewriteOriginal(stock[0].observation, row => { row.tabs[0].url = 'https://other.test/'; }); }],
  ['different upstream source at same version', ({ aux }) => { rewriteOriginal(aux[0].observation, row => { row.chromiumLastChange = 'foreign'; }); }],
  ['missing twentieth stock reading', ({ stock }) => { stock.pop(); }],
  ['refused stock reading', ({ stock }) => { stock[0].status = 'failed'; }],
]) test(`overhead refuses ${name}`, () => { const trials = matchedTrials(); change(trials); assert.throws(() => assertMatchedStockMemoryOverhead(trials.aux, trials.stock, 100n)); });

// This is a real owned dirfd writer/control-file test with synthetic native stdout.
// It proves transport admission, not a stock launch or kernel measurement.
test('closed stock operation uses the shared private writer and original direct-child envelope', async () => {
  const root = mkdtempSync('/private/tmp/aux-native-journey-stock-mailbox-');
  const profile = join(root, 'profile'); mkdirSync(profile, { mode: 0o700 });
  const mailbox = createPerformanceMailbox({ userDataDir: profile, pid: 100, generation: 1 });
  try {
    const pending = mailbox.invoke('sampleStockProcessMemory');
    assert.deepEqual(JSON.parse(readFileSync(join(root, 'performance-request.json'))), { sequence: '1', operation: 'sampleStockProcessMemory' });
    const native = record();
    const raw = 'AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify({ producer: 'aux-native-fixture-reply', version: 1, pid: 100, windowId: 1, sequence: '1', operation: 'sampleStockProcessMemory', record: native });
    mailbox.write(Buffer.from(raw + '\n'), { pid: 100, generation: 1 });
    assert.deepEqual(JSON.parse(await pending), native);
    assert.equal(mailbox.lastReceipt.raw, raw);
  } finally { mailbox.dispose(); rmSync(root, { recursive: true, force: true }); }
});

test('stock comparison refuses public build labels when original private compiled tag is missing', () => {
  const trials = matchedTrials();
  rewriteOriginal(trials.aux[0].observation, row => { delete row.chromiumLastChange; });
  trials.aux[0].observation.before.identity.native.chromiumLastChange = chromium.lastChange;
  trials.aux[0].observation.after.identity.native.chromiumLastChange = chromium.lastChange;
  assert.throws(() => assertMatchedStockMemoryOverhead(trials.aux, trials.stock, 100n));
});
test('matching public tag cannot hide a different original compiled revision', () => {
  const trials = matchedTrials();
  rewriteOriginal(trials.aux[0].observation, row => { row.chromiumLastChange = 'different-actual-compiled-source'; });
  trials.aux[0].observation.before.identity.native.chromiumLastChange = chromium.lastChange;
  trials.aux[0].observation.after.identity.native.chromiumLastChange = chromium.lastChange;
  assert.throws(() => assertMatchedStockMemoryOverhead(trials.aux, trials.stock, 100n));
});
test('persisted report originals suffice and tampered derived totals cannot hide overhead', () => {
  const { aux, stock } = matchedTrials();
  for (const row of aux) { row.decoded = { totalConservativeBytes: 1n }; row.observation.native = { chromiumLastChange: 'forged' }; }
  for (const row of stock) row.observation.decoded = { totalLowerBytes: 999999n };
  assert.throws(() => assertMatchedStockMemoryOverhead(aux, stock, 90n), /overhead exceeds/);
  assert.equal(assertMatchedStockMemoryOverhead(aux, stock, 100n).overheadUpperBytes, 100n);
});
for (const [name, change] of [
  ['dropped original kernel', ({ aux }) => rewriteOriginal(aux[0].observation, row => { row.processes[0][6].pop(); })],
  ['original envelope mismatch', ({ aux }) => { aux[0].observation.receipt.recordRaw = '{}'; }],
  ['envelope digest drift', ({ stock }) => { stock[0].observation.sha256 = 'a'.repeat(64); }],
  ['missing actual AC', ({ aux }) => { aux[0].observation.after.power = "Now drawing from 'Battery Power'"; }],
  ['changed paired source', ({ stock }) => { stock[0].observation.after.identity.sourceCommit = 'b'.repeat(40); }],
  ['dirty actual stock source', ({ stock }) => { stock[0].observation.before.identity.dirty = true; stock[0].observation.after.identity.dirty = true; }],
  ['replayed original sample', ({ aux }) => rewriteOriginal(aux[1].observation, row => { row.sampleSequence = '1'; })],
  ['same-URL human document drift', ({ aux }) => { aux[1].idleBefore[0].documentEpoch++; aux[1].idleAfter[0].documentEpoch++; }],
  ['stock document drift', ({ stock }) => rewriteOriginal(stock[1].observation, row => { row.tabs[0].documentReceipt = 'c'.repeat(32); })],
]) test(`original stock comparison refuses ${name}`, () => {
  const trials = matchedTrials(); change(trials); assert.throws(() => assertMatchedStockMemoryOverhead(trials.aux, trials.stock, 100n));
});

for (const revision of ['0'.repeat(40), '0'.repeat(40) + '-refs/branch-heads/8037@{#1294}'])
  test(`original stock decoder rejects matching dummy revision ${revision}`, () => {
    const row = record(); row.chromiumLastChange = revision;
    assert.throws(() => validateNativeStockProcessMemory(JSON.stringify(row), 100, { ...chromium, lastChange: revision }), /Dummy compiled Chromium revision/);
  });
for (const both of [false, true]) test(`stock comparison rejects original dummy stock revision; Aux also dummy=${both}`, () => {
  const { aux, stock } = matchedTrials(), revision = '0'.repeat(40);
  for (const trial of stock) {
    rewriteOriginal(trial.observation, row => { row.chromiumLastChange = revision; });
    trial.observation.before.identity.chromiumLastChange = revision; trial.observation.after.identity.chromiumLastChange = revision;
  }
  if (both) for (const trial of aux) {
    rewriteOriginal(trial.observation, row => { row.chromiumLastChange = revision; });
    trial.observation.before.identity.native.chromiumLastChange = revision; trial.observation.after.identity.native.chromiumLastChange = revision;
  }
  assert.throws(() => assertMatchedStockMemoryOverhead(aux, stock, 100n), /Dummy compiled Chromium revision/);
});
