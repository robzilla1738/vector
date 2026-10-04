// Real private dirfd transport, synthetic native receipts; no native launch.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createPerformanceMailbox } from '../host/lib/performance-mailbox.mjs';
const source = { pid: 42, generation: 1 }, method = 'commandPresentationSnapshot';
const record = { producer: 'aux-native-command-presentation', version: 1, sampleSequence: '9', windowId: 2, widgetRoutingId: 3, rendererPid: 4, nativeDocumentGeneration: '5', frameSinkClientId: 6, frameSinkSinkId: 7, resultsSource: 'history', surfaceMode: 'edit', status: 'ready' };
const ready = () => Buffer.from('AUX_NATIVE_COMMAND_PRESENTATION_READY_V1 ' + JSON.stringify(record) + '\n');
const refusal = () => Buffer.from('AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify({ producer: 'aux-native-fixture-reply', version: 1, pid: 42, windowId: 2, sequence: '1', operation: method, record: { producer: record.producer, version: 1, windowId: 2, status: 'refused', measured: false, reason: 'cancelled' } }) + '\n');
async function fixture(body) {
  const root = mkdtempSync('/private/tmp/aux-native-journey-command-mailbox-'); mkdirSync(join(root, 'profile'), { mode: 0o700 });
  const mailbox = createPerformanceMailbox({ userDataDir: join(root, 'profile'), ...source });
  try { await body(mailbox, root); } finally { mailbox.dispose(); rmSync(root, { recursive: true, force: true }); }
}
test('fixed command crosses original writer and fragmented same-child READY is retained separately from completion', () => fixture(async (mailbox, root) => {
  const completion = mailbox.invoke(method), preparation = mailbox.waitForCommandPresentationReady();
  assert.deepEqual(JSON.parse(readFileSync(join(root, 'performance-request.json'))), { sequence: '1', operation: method });
  for (const byte of ready()) mailbox.write(Buffer.from([byte]), source);
  const observed = await preparation; assert.equal(observed.raw, ready().toString().trimEnd()); assert.equal(observed.pid, 42); assert.equal(observed.record.sampleSequence, '9');
  mailbox.write(refusal(), source); assert.equal(JSON.parse(await completion).status, 'refused'); assert.deepEqual(mailbox.lastReceipt.commandReady, observed);
}));
test('preparation refusal rejects READY waiter and retains original final refusal', () => fixture(async mailbox => {
  const completion = mailbox.invoke(method), preparation = mailbox.waitForCommandPresentationReady(); mailbox.write(refusal(), source);
  await assert.rejects(preparation, /preparation refused/); assert.equal(JSON.parse(await completion).reason, 'cancelled');
}));
for (const kind of ['foreign-child', 'duplicate', 'disposed']) test(`original readiness refuses ${kind}`, () => fixture(async mailbox => {
  const completion = mailbox.invoke(method); const preparation = mailbox.waitForCommandPresentationReady();
  if (kind === 'foreign-child') mailbox.write(ready(), { ...source, generation: 2 });
  else if (kind === 'disposed') mailbox.dispose();
  else { mailbox.write(ready(), source); await preparation; mailbox.write(ready(), source); }
  await assert.rejects(completion); if (kind !== 'duplicate') await assert.rejects(preparation);
}));
test('unrequested readiness cannot arm or survive into another transaction', () => fixture(async mailbox => {
  mailbox.write(ready(), source); await assert.rejects(mailbox.invoke(method), /Unrequested/); await assert.rejects(mailbox.waitForCommandPresentationReady(), /Unrequested/);
}));
function measured(changes = {}) {
  const value = { ...record, rendererMeasured: true, rendererFailure: 0, frameToken: 9, activated: true, submittedFrame: true, submissionFailure: -1, feedbackFlags: 4, nativeInputUs: '1000000', nativeReceiptUs: '1000010', rendererInputUs: '1000000', mutationUs: '1001000', commitUs: '1002000', submittedUs: '1003000', receivedUs: '1004000', embeddedUs: '1005000', drawUs: '1006000', presentationUs: '1029999', nativeInputSourcePid: 0, measured: true, elapsedMs: 29.999, status: 'measured', ...changes };
  return Buffer.from('AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify({ producer: 'aux-native-fixture-reply', version: 1, pid: 42, windowId: 2, sequence: '1', operation: method, record: value }) + '\n');
}
test('measured final must match original READY and native timing independently', () => fixture(async mailbox => {
  const completion = mailbox.invoke(method); mailbox.write(ready(), source);
  const originalReady = await mailbox.waitForCommandPresentationReady(); mailbox.write(measured(), source);
  assert.equal(JSON.parse(await completion).elapsedMs, 29.999); assert.equal(mailbox.lastReceipt.commandReady.raw, originalReady.raw);
}));
for (const kind of ['without-ready', 'changed-mode', 'software-frame']) test(`measured final refuses ${kind}`, () => fixture(async mailbox => {
  const completion = mailbox.invoke(method);
  if (kind !== 'without-ready') mailbox.write(ready(), source);
  mailbox.write(measured(kind === 'changed-mode' ? { surfaceMode: 'new-tab' } : kind === 'software-frame' ? { feedbackFlags: 0 } : {}), source);
  await assert.rejects(completion);
}));
test('later transaction refuses a repeated native sample even with new mailbox sequence', () => fixture(async mailbox => {
  const first = mailbox.invoke(method); mailbox.write(ready(), source); mailbox.write(refusal(), source); await first;
  const next = mailbox.invoke(method), preparation = mailbox.waitForCommandPresentationReady(); mailbox.write(ready(), source);
  await assert.rejects(next, /Stale/); await assert.rejects(preparation, /Stale/);
}));
