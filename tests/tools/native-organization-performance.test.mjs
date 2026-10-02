// Synthetic receipt fixtures only. These tests cannot qualify native performance.
import { test, afterEach } from 'node:test';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';
import { collectNativeOrganizationWork } from '../host/lib/native-organization-performance.mjs';

const uuid = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const token = n => String(n).padStart(32, '0');
const candidate = {
  productIdentity: { commit: 'a'.repeat(40), tree: 'b'.repeat(40), label: 'a'.repeat(40), dirty: false },
  native: { sourceCommit: 'a'.repeat(40), buildId: 'synthetic', manifestHash: 'c'.repeat(64) },
  shellDigest: 'd'.repeat(64), harnessCommit: 'e'.repeat(40), moduleSha256: 'f'.repeat(64),
};
const directories = new Set();
afterEach(() => { for (const path of directories) rmSync(path, { recursive: true, force: true }); directories.clear(); });
const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex');
function fixture(metric = 'auto-archive') {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), 'aux-synthetic-org-performance-'))); directories.add(directory);
  const helperSource = join(directory, 'native-window.swift'); writeFileSync(helperSource, '// synthetic observer');
  const helperExecutable = join(directory, `native-window-${digest(helperSource).slice(0, 12)}`); writeFileSync(helperExecutable, 'not executable');
  const source = join(directory, 'performance-mailbox-writer.py'); writeFileSync(source, '# synthetic transport metadata');
  const interpreter = realpathSync('/usr/bin/python3');
  const writer = { source, sourceSha256: digest(source), interpreter, interpreterSha256: digest(interpreter) };
  const f = { calls: [], scope: null, index: 0, mutate: row => row, failWork: false };
  f.options = { metric, candidate, readPower: async () => "Now drawing from 'AC Power'",
    readIdentity: async () => ({ runtime: candidate.productIdentity, native: candidate.native }),
    prepareTrial: async () => {}, performWork: async () => { if (f.failWork) throw new Error('actual-work-refused'); },
    ax: { pid: 42, helperPid: 41, helperSource, helperExecutable },
    transport: { writer, lastReceipt: null, invoke: async operation => {
      f.calls.push(operation);
      if (operation.startsWith('prepare')) {
        f.scope = { requestNonce: token(++f.index), sampleSequence: f.index, windowId: 2, rendererPid: 43, documentToken: token(999), nativeDocumentGeneration: 1, metric };
        const row = { producer: 'aux-native-organization-work-v1', version: 1, pid: 42, operation, scope: f.scope, status: 'ready' };
        return receipt(row, operation);
      }
      const row = { producer: 'aux-native-organization-work-v1', version: 1, pid: 42, operation, scope: f.scope, status: 'measured',
        sample: { startMs: f.index * 100, durationMs: 10, durationUpperBoundMs: 10.2, completedThroughMs: f.index * 100 + 11, maximumTaskMs: 8, maximumLongTaskMs: 0, overlappingLongTasks: 0, completedTasks: 2, longTaskCoverage: true },
        work: { committed: true, units: 1, batchIds: [uuid(f.index + 2000)], operationId: uuid(f.index + 1000), kind: metric === 'auto-archive' ? 'nativeArchiveBatch' : 'runtimeLiveFolderRender', runtimePid: 44, rowsCommitted: true } };
      return receipt(f.mutate(row), operation);
    } } };
  let sequence = 0;
  function receipt(row, operation) {
    const recordRaw = JSON.stringify(row), counter = String(++sequence);
    const observed = { pid: 42, generation: 1, sequence: counter, operation, recordRaw,
      raw: 'AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify({ producer: 'aux-native-fixture-reply', version: 1, pid: 42, windowId: 2, sequence: counter, operation, record: row }) };
    f.options.transport.lastReceipt = f.mutateReceipt ? f.mutateReceipt(observed) : observed;
    return recordRaw;
  }
  return f;
}
test('collects20 positive whole async cycles and genuine completed-task shaped receipts', async () => {
  const f = fixture(), report = await collectNativeOrganizationWork(f.options);
  assert.equal(report.status, 'measured'); assert.equal(report.measurements.length, 20);
  assert.equal(report.maximumCycleUpperBoundMs, 10.2); assert.equal(report.maximumTaskMs, 8);
  assert.equal(report.power.length, 40);
  assert.deepEqual(f.calls.slice(0, 2), ['prepareOrganizationAutoArchiveWork', 'completeOrganizationWork']);
});
test('live source requires distinct runtime process and committed renderer rows', async () => {
  const f = fixture('live-folder-refresh'), report = await collectNativeOrganizationWork(f.options);
  assert.equal(report.measurements.length, 20); assert.equal(report.measurements[0].work.runtimePid, 44);
  assert.equal(f.calls[0], 'prepareOrganizationLiveFolderWork');
});
for (const [name, mutate, message] of [
  ['empty archive cycle', row => { row.work.units = 0; }, /Empty/],
  ['whole async cycle exceeds50 while synchronous tasks are fast', row => { row.sample.durationMs = 50; row.sample.durationUpperBoundMs = 50.2; row.sample.completedThroughMs += 100; }, /Whole asynchronous/],
  ['completed task exceeds50', row => { row.sample.maximumTaskMs = 50.000001; }, /renderer task/],
  ['zero long-task entries without coverage', row => { row.sample.longTaskCoverage = false; }, /coverage/],
  ['read before native completion watermark', row => { row.sample.completedThroughMs = row.sample.startMs + row.sample.durationMs; }, /final task/],
  ['actual long task conservative boundary overlap', row => { row.sample.overlappingLongTasks = 1; row.sample.maximumLongTaskMs = 50; }, /overlapping long/],
  ['task buffer overflow', row => { row.sample.completedTasks = 4097; }, /overflowed/],
  ['different document completion', row => { row.scope = { ...row.scope, documentToken: token(777) }; }, /scope changed/],
  ['unfinished archive batch', row => { row.work.committed = false; }, /unfinished/],
  ['archive batch greater than20', row => { row.work.units = 21; }, /exceeded20/],
  ['privacy bound omitted', row => { row.sample.durationUpperBoundMs = row.sample.durationMs; }, /privacy/],
]) test(`refuses ${name} and retains exact failed receipt`, async () => {
  const f = fixture(); f.mutate = row => { mutate(row); return row; };
  await assert.rejects(collectNativeOrganizationWork(f.options), error => {
    assert.match(error.message, message); assert.equal(error.report.status, 'failed');
    assert.equal(error.report.attempts[0].status, 'failed'); assert.ok(error.report.attempts[0].raw); return true;
  });
});
for (const [name, mutate, message] of [
  ['source refreshed on shell renderer', row => { row.work.runtimePid = row.scope.rendererPid; }, /off the UI/],
  ['command resolved before React commit', row => { row.work.rowsCommitted = false; }, /React commit/],
]) test(`live refuses ${name}`, async () => {
  const f = fixture('live-folder-refresh'); f.mutate = row => { mutate(row); return row; };
  await assert.rejects(collectNativeOrganizationWork(f.options), message);
});
test('rejects replayed operation even with different native sample', async () => {
  const f = fixture(); f.mutate = row => { row.work.operationId = uuid(123); return row; };
  await assert.rejects(collectNativeOrganizationWork(f.options), error => {
    assert.match(error.message, /Replayed work/); assert.equal(error.report.measurements.length, 1); return true;
  });
});
test('refused actual work still retires armed native scope exactly once', async () => {
  const f = fixture(); f.failWork = true;
  await assert.rejects(collectNativeOrganizationWork(f.options), error => {
    assert.match(error.message, /actual-work-refused/); assert.ok(error.report.attempts[0].cleanup); return true;
  });
  assert.deepEqual(f.calls, ['prepareOrganizationAutoArchiveWork', 'completeOrganizationWork']);
});
test('less than20, unsupported metric or dirty source refuses before arming', async () => {
  const f = fixture();
  await assert.rejects(collectNativeOrganizationWork({ ...f.options, trials: 19 }), /20–100/);
  await assert.rejects(collectNativeOrganizationWork({ ...f.options, metric: 'AX-walltime' }), /Unsupported/);
  await assert.rejects(collectNativeOrganizationWork({ ...f.options, candidate: { ...candidate, productIdentity: { ...candidate.productIdentity, dirty: true } } }), /Clean/);
  assert.deepEqual(f.calls, []);
});
test('AC loss after work refuses while preserving real raw receipt', async () => {
  const f = fixture(); let calls = 0;
  await assert.rejects(collectNativeOrganizationWork({ ...f.options, readPower: async () => ++calls === 1 ? "Now drawing from 'AC Power'" : "Now drawing from 'Battery Power'" }), error => {
    assert.match(error.message, /AC power/); assert.ok(error.report.attempts[0].raw); assert.equal(error.report.measurements.length, 0); return true;
  });
});

for (const [name, mutate, message] of [
  ['missing original stderr', receipt => ({ ...receipt, raw: undefined }), /original native stderr/],
  ['changed native wrapper producer', receipt => ({ ...receipt, raw: receipt.raw.replace('aux-native-fixture-reply', 'renderer-invented') }), /aux-native-fixture-reply/],
  ['native process replaced between arm and read', receipt => ({ ...receipt, generation: receipt.operation === 'completeOrganizationWork' ? 2 : 1 }), /generation changed/],
]) test(`refuses ${name} even with plausible sample fields`, async () => {
  const f = fixture(); f.mutateReceipt = mutate;
  await assert.rejects(collectNativeOrganizationWork(f.options), message);
});
