import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeNativeCdpRetirement, evaluateNativeCdpRetirementTrials } from '../host/lib/native-cdp-retirement.mjs';
// Explicit synthetic source controls. These records do not qualify native performance.
const fixture = (index, mode = 'takeover') => {
  const arm = { producer: 'aux-native-cdp-retirement', version: 1, status: 'armed', mode,
    nonce: `synthetic-${index}`, sequence: String(index + 1), pid: 123, browserWindowId: 5,
    hostIncarnation: 'host', connectionGeneration: 1, rootRunId: 'run', registeredRuns: ['run', 'child'], armedUs: '1000000',
    pages: [{ scope: { profileId: 'profile', tabId: 'page', isolationId: 'isolation', runId: 'run', taskRevision: 0,
      frameId: 'frame', documentToken: 'document', sourceOrigin: 'https://fixture.test', controlGeneration: 'before' }, leaseId: 'lease', initialCount: '1' }] };
  if (mode === 'stop') arm.pages.push({ ...structuredClone(arm.pages[0]), scope: { ...arm.pages[0].scope, tabId: 'child-page', runId: 'child' }, leaseId: 'child-lease' });
  const row = { ...structuredClone(arm), status: 'sampled', observedUs: '1200000', pages: arm.pages.map(page => ({
    ...structuredClone(page), scope: { ...page.scope, retiredControlGeneration: 'after' }, eventUs: '1100000', admittedUs: '1105000',
    lastDispatchUs: '1101000', retiredCount: '5', observedCount: '5', originalClockValid: true, documentState: 'retained', destroyedUs: '0' })) };
  return { arm, row };
};
const check = (row, arm = fixture(0).arm) => decodeNativeCdpRetirement(JSON.stringify(row), JSON.stringify(arm));
test('retains original arm, independent clocks and every registered family page', () => {
  const { arm, row } = fixture(0, 'stop'); const value = check(row, arm);
  assert.equal(value.pages.length, 2); assert.equal(value.pages[1].admissionLatencyUs, 5000n); assert.equal(value.pages[1].lastDispatchLatencyUs, 1000n);
});
for (const [name, mutate] of [
  ['post-retirement dispatch', row => { row.pages[0].observedCount = '6'; }],
  ['original queue latency', row => { row.pages[0].admittedUs = '1200001'; row.observedUs = '1300000'; }],
  ['missing physical clock', row => { row.pages[0].originalClockValid = false; }],
  ['late final dispatch', row => { row.pages[0].lastDispatchUs = '1106000'; }],
  ['same-page replacement', row => { row.pages[0].scope.documentToken = 'replacement'; }],
  ['new host incarnation', row => { row.hostIncarnation = 'replacement'; }],
  ['missing family descendant', row => { row.pages.pop(); }],
  ['registered ancestry drift', row => { row.registeredRuns.push('foreign'); }],
  ['borrowed source origin', row => { row.pages[0].scope.sourceOrigin = 'https://foreign.test'; }],
  ['destruction before retirement', row => { row.pages[0].documentState = 'destroyed'; row.pages[0].destroyedUs = '1100000'; }],
  ['unbounded record', row => { row.extra = 'x'.repeat(16384); }],
]) test(`refuses ${name}`, () => { const { arm, row } = fixture(0, 'stop'); mutate(row); assert.throws(() => check(row, arm)); });
const series = () => Array.from({ length: 20 }, (_, index) => { const { arm, row } = fixture(index); return {
  status: 'sampled', raw: JSON.stringify(row), armedRaw: JSON.stringify(arm), powerBefore: "Now drawing from 'AC Power'", powerAfter: "Now drawing from 'AC Power'" }; });
test('twenty complete original AC records are required', () => { assert.equal(evaluateNativeCdpRetirementTrials(series()).length, 20); assert.throws(() => evaluateNativeCdpRetirementTrials(series().slice(1))); });
test('preserves refusal/replay/battery failures', () => {
  const refused = series(); refused[10].status = 'refused'; assert.throws(() => evaluateNativeCdpRetirementTrials(refused));
  const replay = series(); replay[19] = replay[0]; assert.throws(() => evaluateNativeCdpRetirementTrials(replay));
  const battery = series(); battery[1].powerAfter = "Now drawing from 'Battery Power'"; assert.throws(() => evaluateNativeCdpRetirementTrials(battery));
});

test('retains actual original destruction only in Stop records after retirement', () => {
  const { arm, row } = fixture(0, 'stop'); row.pages[1].documentState = 'destroyed'; row.pages[1].destroyedUs = '1150000';
  assert.equal(check(row, arm).pages[1].original.destroyedUs, '1150000');
  const takeover = fixture(0); takeover.row.pages[0].documentState = 'destroyed'; takeover.row.pages[0].destroyedUs = '1150000';
  assert.throws(() => check(takeover.row, takeover.arm));
});

test('exact original five-second deadline refuses while one microsecond before remains valid', () => {
  const { arm, row } = fixture(0);
  row.observedUs = String(BigInt(arm.armedUs) + 4999999n);
  assert.ok(check(row, arm));
  row.observedUs = String(BigInt(arm.armedUs) + 5000000n);
  assert.throws(() => check(row, arm), /Original bounded arm interval expired/);
});
