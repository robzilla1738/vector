import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { syntheticCompilerFixture } from './fixtures/native-cdp-compiler-fixture.mjs';
import { readCdpRetirementReceipt, collectNativeCdpRetirement, evaluateAuthenticatedCdpRetirementReport } from '../host/lib/native-cdp-retirement-collector.mjs';
// Synthetic source controls only; no fixture here represents native or physical qualification.
const child = { pid: 123, generation: 2 };
const operation = 'prepareCdpStopMeasurement';
function receipt(record = { producer: 'aux-native-cdp-retirement', version: 1, status: 'armed', pid: 123 }) {
  const wrapper = { producer: 'aux-native-fixture-reply', version: 1, pid: 123, windowId: 7, sequence: '1', operation, record };
  return { ...child, sequence: '1', operation, recordRaw: JSON.stringify(record), raw: 'AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify(wrapper) };
}
test('retains original direct-child outer envelope and record bytes', () => {
  const original = receipt(); assert.equal(readCdpRetirementReceipt(original, child, operation).recordRaw, original.recordRaw);
});
for (const [name, mutate] of [
  ['foreign generation', value => { value.generation++; }],
  ['changed original record', value => { value.recordRaw = '{}'; }],
  ['wrong operation', value => { value.operation = 'completeCdpRetirementMeasurement'; }],
  ['foreign outer producer', value => { value.raw = value.raw.replace('aux-native-fixture-reply', 'caller-copy'); }],
]) test(`refuses ${name}`, () => { const value = receipt(); mutate(value); assert.throws(() => readCdpRetirementReceipt(value, child, operation)); });
test('original native refusal remains original evidence', () => {
  const value = receipt({ producer: 'aux-native-cdp-retirement', version: 1, status: 'refused' });
  assert.throws(() => readCdpRetirementReceipt(value, child, operation), error => error.nativeReceipt === value);
});
test('failed setup plus cleanup retains original owned child debt and first refused trial', async () => {
  const primary = new Error('setup refused');
  const ownedChild = { originalHandle: Symbol('owned child') };
  const cleanup = Object.assign(new Error('reap pending'), { ownedChild, reaped: Promise.resolve() });
  await assert.rejects(collectNativeCdpRetirement({ mode: 'stop', app: { pid: child.pid, processObservation: { ...child, launchKind: 'child', exitStatusAvailable: false, spawnError: null, exitCode: null, signal: null } }, mailbox: {}, signal: new AbortController().signal,
    prepareTrial: async () => { throw primary; }, performPhysicalInput: async () => { assert.fail('input forbidden'); },
    readPower: async () => { assert.fail('power measurement forbidden'); }, cleanupTrial: async () => { throw cleanup; } }), error => {
    assert.deepEqual(error.errors, [primary, cleanup]); assert.equal(error.ownedChild, ownedChild);
    assert.equal(error.cleanupDebt, cleanup); assert.equal(error.report.trials.length, 1); assert.equal(error.report.trials[0].status, 'refused'); return true;
  });
});

const candidate = { productIdentity: { commit: 'a'.repeat(40), tree: 'b'.repeat(40), label: 'a'.repeat(40), dirty: false },
  native: { sourceCommit: 'a'.repeat(40), buildId: 'synthetic', manifestHash: 'c'.repeat(64) },
  shellDigest: 'd'.repeat(64), harnessCommit: 'e'.repeat(40), moduleSha256: 'f'.repeat(64) };
function originalReport() {
  const fixture = syntheticCompilerFixture(), decoded = fixture.decode();
  const report = { mode: 'stop', candidate, originalChild: child, trials: [], helperCompiler: { manifestRaw: decoded.manifestRaw, auditRaw: decoded.auditRaw } };
  const helperAdmission = fixture.admission;
  for (let index = 0; index < 20; index++) {
    const arm = { producer: 'aux-native-cdp-retirement', version: 1, status: 'armed', mode: 'stop', nonce: `synthetic-${index}`,
      sequence: String(index + 1), pid: 123, browserWindowId: 5, hostIncarnation: 'host', connectionGeneration: 1,
      rootRunId: 'run', registeredRuns: ['run'], armedUs: '1000000', pages: [{ scope: { profileId: 'profile', tabId: 'page', isolationId: 'isolation',
        runId: 'run', taskRevision: 0, frameId: 'frame', documentToken: 'doc', sourceOrigin: 'https://fixture.test', controlGeneration: 'before' },
        leaseId: 'lease', initialCount: '1' }] };
    const completed = { ...structuredClone(arm), status: 'sampled', observedUs: '1200000', pages: [{ ...structuredClone(arm.pages[0]),
      scope: { ...arm.pages[0].scope, retiredControlGeneration: 'after' }, eventUs: '1100000', admittedUs: '1105000', lastDispatchUs: '1101000',
      retiredCount: '5', observedCount: '5', originalClockValid: true, documentState: 'retained', destroyedUs: '0' }] };
    const armReceipt = receipt(arm), completedReceipt = receipt(completed);
    armReceipt.sequence = String(index * 2 + 1); completedReceipt.sequence = String(index * 2 + 2);
    const originalArm = JSON.parse(armReceipt.raw.slice('AUX_NATIVE_FIXTURE_REPLY_V1 '.length));
    originalArm.sequence = armReceipt.sequence; armReceipt.raw = 'AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify(originalArm);
    completedReceipt.operation = 'completeCdpRetirementMeasurement';
    const outer = JSON.parse(completedReceipt.raw.slice('AUX_NATIVE_FIXTURE_REPLY_V1 '.length));
    outer.sequence = completedReceipt.sequence; outer.operation = completedReceipt.operation; completedReceipt.raw = 'AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify(outer);
    const identity = { runtime: candidate.productIdentity, native: candidate.native };
    const source = realpathSync(fileURLToPath(new URL('../host/lib/performance-mailbox-writer.py', import.meta.url)));
    const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex');
    const producer = { targetPid: 123, helperPid: 321, source: fixture.m.source.path, executable: fixture.m.output.path,
      sourceSha256: fixture.m.source.sha256, executableSha256: fixture.m.output.sha256,
      writer: { source, sourceSha256: digest(source), interpreter: realpathSync('/usr/bin/python3'), interpreterSha256: digest(realpathSync('/usr/bin/python3')) } };
    const warmIdentity = { producer: 'aux-native-warm-window-identity', version: 1, targetPid: 123, helperPid: 321, targetProcessUuid: 'a'.repeat(32), targetProcessStartMachTicks: '100', helperProcessUuid: fixture.m.output.uuid, helperProcessStartMachTicks: '200' };
    report.trials.push({ status: 'sampled', armReceipt, receipt: completedReceipt,
      beforeWarmHelperIdentity: warmIdentity, afterWarmHelperIdentity: structuredClone(warmIdentity),
      beforeIdentity: identity, afterIdentity: structuredClone(identity), beforeInputProducer: producer, afterInputProducer: structuredClone(producer),
      powerBefore: "Now drawing from 'AC Power'", powerAfter: "Now drawing from 'AC Power'" });
  }
  return { report, helperAdmission };
}
test('compact original-only report independently reconstructs all twenty trials', () => {
  const { report, helperAdmission } = originalReport(); assert.equal(evaluateAuthenticatedCdpRetirementReport(report, helperAdmission).length, 20);
  report.trials[0].raw = 'caller invented replacement'; report.trials[0].armedRaw = '{}';
  assert.equal(evaluateAuthenticatedCdpRetirementReport(report, helperAdmission).length, 20);
});
test('original receipt counter and compiled identity drift refuse despite derived labels', () => {
  const { report, helperAdmission } = originalReport();
  const receipt = report.trials[4].receipt;
  const original = JSON.parse(receipt.raw.slice('AUX_NATIVE_FIXTURE_REPLY_V1 '.length));
  original.record.pages[0].observedCount = '6'; receipt.recordRaw = JSON.stringify(original.record);
  receipt.raw = 'AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify(original);
  assert.throws(() => evaluateAuthenticatedCdpRetirementReport(report, helperAdmission));
  const { report: changed, helperAdmission: changedAdmission } = originalReport(); changed.trials[4].afterIdentity.native.sourceCommit = '0'.repeat(40);
  assert.throws(() => evaluateAuthenticatedCdpRetirementReport(changed, changedAdmission));
});

test('missing or foreign external approval and original helper/writer replacement refuse', () => {
  const { report, helperAdmission } = originalReport();
  assert.throws(() => evaluateAuthenticatedCdpRetirementReport(report), /external input-helper/);
  assert.throws(() => evaluateAuthenticatedCdpRetirementReport(report, { ...helperAdmission, auditSha256: '0'.repeat(64) }));
  for (const field of ['sourceSha256', 'executableSha256']) {
    const { report: changed, helperAdmission: admission } = originalReport();
    changed.trials[0].beforeInputProducer[field] = '0'.repeat(64);
    changed.trials[0].afterInputProducer[field] = '0'.repeat(64);
    assert.throws(() => evaluateAuthenticatedCdpRetirementReport(changed, admission));
  }
  const { report: changed, helperAdmission: admission } = originalReport();
  delete changed.trials[0].beforeInputProducer.writer;
  assert.throws(() => evaluateAuthenticatedCdpRetirementReport(changed, admission));
});

test('original loaded helper and target kernel identity refuse reuse replacement and missing replies', () => {
  for (const change of [
    row => { row.afterWarmHelperIdentity.helperProcessStartMachTicks = '201'; },
    row => { row.afterWarmHelperIdentity.targetProcessStartMachTicks = '101'; },
    row => { row.beforeWarmHelperIdentity.helperProcessUuid = 'e'.repeat(32); row.afterWarmHelperIdentity.helperProcessUuid = 'e'.repeat(32); },
    row => { row.afterWarmHelperIdentity.targetPid = 124; },
    row => { delete row.beforeWarmHelperIdentity; },
  ]) {
    const { report, helperAdmission } = originalReport(); change(report.trials[0]);
    assert.throws(() => evaluateAuthenticatedCdpRetirementReport(report, helperAdmission));
  }
});
