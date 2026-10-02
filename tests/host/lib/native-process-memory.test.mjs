import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateNativeProcessMemory } from './native-process-memory.mjs';
const record = () => {
  const readings = [['100', '5', '10'], ['105', '20', '30'], ['103', '60', '70'], ['102', '80', '90']];
  const row = { producer: 'aux-native-process-memory', version: 1, status: 'sampled', windowId: 1, widgetRoutingId: 2,
    requestNonce: 'a'.repeat(32), sampleSequence: '1', sampleStartUs: '1000000', sampleEndUs: '1000100', workload: { producer: 'aux-runtime-subagent-workload', version: 1, status: 'idle', activeExecutions: 0 },
    workloadObservedAt: [1000, 1001], workloadRequestTimes: ['0', '3', '91', '95'], processes: [
      [100, 'browser', 2, [], 'b'.repeat(32), '300', structuredClone(readings)],
      [101, 'shell', 3, [1], 'b'.repeat(32), '301', structuredClone(readings)],
      [102, 'gpu', 9, [2], 'b'.repeat(32), '302', structuredClone(readings)],
      [103, 'runtime', null, [], 'b'.repeat(32), '303', [['110', '40', '45'], ['115', '46', '50']], '7'],
    ] };
  return row;
};
test('conservative totals preserve all readings and deduplicate native roles; decoder grants no authority', () => {
  const result = validateNativeProcessMemory(JSON.stringify(record()), 100);
  assert.equal(result.totalConservativeBytes, 430n); assert.equal(result.shellMaxBytes, 105n);
  assert.equal(result.runtimeMaxBytes, 115n); assert.equal(result.processes.length, 4);
});
for (const [name, mutate] of [
  ['PID reused across roles', row => { row.processes[3][0] = 101; }],
  ['foreign browser PID', row => { row.processes[0][0] = 109; }],
  ['duplicate GPU ownership', row => { row.processes[1][1] = 'gpu'; row.processes[1][2] = 9; }],
  ['missing actual host', row => { row.processes[1][3] = []; }],
  ['invented runtime host', row => { row.processes[3][3] = [9]; }],
  ['duplicate child identity', row => { row.processes[2][3] = [1]; }],
  ['shell mislabeled as utility', row => { row.processes[1][2] = 6; }],
  ['dropped kernel reading', row => { row.processes[0][6].pop(); }],
  ['runtime sampled outside browser bracket', row => { row.processes[3][6][0][1] = '25'; }],
  ['browser after precedes runtime', row => { row.processes[0][6][2][1] = '49'; }],
  ['estimated numeric footprint', row => { row.processes[1][6][0][0] = 100; }],
  ['sample over bounded interval', row => { row.sampleEndUs = '7000000'; }],
  ['unknown caller selection metadata', row => { row.pageSelector = '#caller'; }],
  ['unavailable kernel identity', row => { row.processes[2][4] = '0'.repeat(32); }],
  ['native refusal', row => { row.status = 'refused'; }],
]) test(`refuses ${name}`, () => {
  const row = record(); mutate(row); assert.throws(() => validateNativeProcessMemory(JSON.stringify(row), 100));
});

for (const [name, mutate] of [
  ['before response after first kernel', row => { row.workloadRequestTimes[1] = '6'; }],
  ['after request before last kernel', row => { row.workloadRequestTimes[2] = '89'; }],
  ['rounded original runtime timestamp', row => { row.workloadObservedAt[0] = 1000.5; }],
  ['reversed original runtime observation', row => { row.workloadObservedAt = [1001, 1000]; }],
  ['missing original runtime observation', row => { row.workloadObservedAt.pop(); }],
  ['refused workload mislabeled idle', row => { row.workload.status = 'refused'; }],
  ['nonempty idle VM inventory', row => { row.workload.activeExecutions = 1; }],
  ['invented shared workload selector', row => { row.workload.selector = '#caller'; }],
]) test(`refuses ${name}`, () => { const row = record(); mutate(row); assert.throws(() => validateNativeProcessMemory(JSON.stringify(row), 100)); });
const executing = () => ({ producer: 'aux-runtime-subagent-workload', version: 1, status: 'executing',
  parentRunId: 'parent', workspaceId: 'workspace', groupId: 'group', children: Array.from({ length: 5 }, (_, i) => ({
    runId: `run-${i}`, cellId: `cell-${i}`, agentId: `agent-${i}`, sourceRunId: 'parent', deadlineAt: 1000000,
    memoryLimitBytes: 128 * 1024 * 1024, sourcePageId: `human-${i}`, sourceSessionId: `human-session-${i}`, sourceDocumentEpoch: 1,
    requestedPageId: `parent-copy-${i}`, requestedSessionId: `parent-session-${i}`, requestedDocumentEpoch: 2,
    pageId: `child-copy-${i}`, sessionId: `child-session-${i}`, documentEpoch: 3,
  })) });
test('lossless compaction reconstructs both complete original five-VM observations', () => {
  const row = record(); row.workload = executing(); const result = validateNativeProcessMemory(JSON.stringify(row), 100);
  assert.deepEqual(result.workload.before, { ...row.workload, observedAt: 1000 });
  assert.deepEqual(result.workload.after, { ...row.workload, observedAt: 1001 });
  assert.equal(result.totalConservativeBytes, 430n);
});
for (const [name, mutate] of [
  ['same-source copy reused', child => { child.pageId = child.requestedPageId; }],
  ['missing current original document', child => { delete child.sourceDocumentEpoch; }],
  ['invalid current protected document', child => { child.requestedDocumentEpoch = -1; }],
  ['expired genuine VM', child => { child.deadlineAt = 1001; }],
  ['weakened original VM hard cap', child => { child.memoryLimitBytes *= 2; }],
]) test(`refuses ${name}`, () => { const row = record(); row.workload = executing(); mutate(row.workload.children[0]); assert.throws(() => validateNativeProcessMemory(JSON.stringify(row), 100)); });
