import assert from 'node:assert/strict';
import test from 'node:test';
import { assertSubagentMemoryBracket, startSubagentMemoryWorkload, collectSubagentMemoryTrials } from './native-subagent-memory-workload.mjs';

function fixture() {
  const children = Array.from({ length: 5 }, (_, index) => ({ runId: `run-${index}`, agentId: `agent-${index}`, pageIds: [`page-${index}`] }));
  const expected = { parentRunId: 'parent', workspaceId: 'workspace', groupId: 'group', children, idlePageIds: Array.from({length:10},(_,i)=>`human-${i}`) };
  const receipt = { producer: 'aux-runtime-subagent-workload', version: 1, status: 'executing', observedAt: 1000,
    parentRunId: 'parent', workspaceId: 'workspace', groupId: 'group', children: children.map((child, index) => ({
      runId: child.runId, agentId: child.agentId, pageId: `copy-${index}`, requestedPageId: child.pageIds[0], requestedSessionId: `requested-${index}`, sourcePageId: `human-${index}`, sourceSessionId: `human-session-${index}`, sourceRunId: 'parent',
      cellId: `cell-${index}`, sessionId: `attachment-${index}`, deadlineAt: 2000, memoryLimitBytes: 128 * 1024 * 1024 })) };
  return { expected, record: { workloadBefore: receipt, workloadAfter: structuredClone(receipt) } };
}

test('twenty trials retain fresh before/after identities with the actual VM cap', () => {
  const { expected, record } = fixture();
  for (let trial = 0; trial < 20; trial++) {
    record.workloadBefore.observedAt = 1000 + trial * 2;
    record.workloadAfter.observedAt = 1001 + trial * 2;
    assert.deepEqual(assertSubagentMemoryBracket(record, expected), { before: record.workloadBefore, after: record.workloadAfter });
  }
});

for (const [name, change] of [
  ['missing fresh producer', record => { delete record.workloadAfter; }],
  ['cached/group state', record => { record.workloadAfter.status = 'running'; }],
  ['foreign child', record => { record.workloadAfter.children[0].runId = 'outsider'; }],
  ['completed/absent VM', record => { record.workloadAfter.children.pop(); }],
  ['attachment replacement', record => { record.workloadAfter.children[0].sessionId = 'replacement'; }],
  ['new cell replacing sampled execution', record => { record.workloadAfter.children[0].cellId = 'new-cell'; }],
  ['deadline expired', record => { record.workloadAfter.children[0].deadlineAt = 1000; }],
  ['wrong memory cap', record => { record.workloadAfter.children[0].memoryLimitBytes = 256 * 1024 * 1024; }],
]) test(`refuses ${name}`, () => {
  const { expected, record } = fixture(); change(record);
  assert.throws(() => assertSubagentMemoryBracket(record, expected));
});

test('unapproved parent fails before any service call or model response override', async () => {
  let calls = 0;
  await assert.rejects(startSubagentMemoryWorkload({ scopedRpc: async () => { calls++; },
    model: { respond() { calls++; }, holdText() {} }, signal: new AbortController().signal,
    parent: { runId: 'parent', pageIds: Array.from({ length: 5 }, (_, i) => `page-${i}`), config: {} },
    idlePageIds: Array.from({ length: 10 }, (_, i) => `idle-${i}`) }));
  assert.equal(calls, 0);
});

test('collector requires all twenty fresh native brackets and retains idle tabs and AC, then cancels actual workload', async () => {
  const { expected, record } = fixture(); let samples = 0, cleanup = 0;
  const idlePageIds = Array.from({ length: 10 }, (_, i) => `idle-${i}`);
  const options = { workload: { expected, idlePageIds, cleanup: async () => { cleanup++; } },
    signal: new AbortController().signal,
    readPages: async () => idlePageIds.map(pageId => ({ pageId, sessionId: `attachment-${pageId}`, url: 'https://fixture.test/idle' })),
    readPair: async () => ({ runtime: { dirty: false, commit: 'a'.repeat(40) }, native: { sourceCommit: 'a'.repeat(40), manifestHash: 'b'.repeat(64) } }),
    readPower: async () => "Now drawing from 'AC Power'",
    sampleNative: async () => { samples++; return { producer: 'aux-native-process-memory', status: 'sampled', ...structuredClone(record) }; } };
  const results = await collectSubagentMemoryTrials(options);
  assert.equal(samples, 20); assert.equal(results.length, 20); assert.equal(cleanup, 1);
});

test('missing fresh VM evidence fails the first sample and still releases the held workload', async () => {
  const { expected } = fixture(); let samples = 0, cleanup = 0;
  const idlePageIds = Array.from({ length: 10 }, (_, i) => `idle-${i}`);
  await assert.rejects(collectSubagentMemoryTrials({ workload: { expected, idlePageIds, cleanup: async () => { cleanup++; } },
    signal: new AbortController().signal, readPages: async () => idlePageIds.map(pageId => ({ pageId, sessionId: `attachment-${pageId}`, url: 'https://fixture.test/idle' })),
    readPair: async () => ({ runtime: { dirty: false, commit: 'a'.repeat(40) }, native: { sourceCommit: 'a'.repeat(40), manifestHash: 'b'.repeat(64) } }), readPower: async () => "Now drawing from 'AC Power'", sampleNative: async () => { samples++; return { producer: 'aux-native-process-memory', status: 'sampled' }; } }));
  assert.equal(samples, 1); assert.equal(cleanup, 1);
});
