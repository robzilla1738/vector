import assert from 'node:assert/strict';
import test from 'node:test';
import { assertSubagentMemoryBracket, startSubagentMemoryWorkload } from './native-subagent-memory-workload.mjs';

function fixture() {
  const children = Array.from({ length: 5 }, (_, index) => ({ runId: `run-${index}`, agentId: `agent-${index}`, pageIds: [`page-${index}`] }));
  const expected = { parentRunId: 'parent', workspaceId: 'workspace', groupId: 'group', children, idlePageIds: Array.from({length:10},(_,i)=>`human-${i}`) };
  const receipt = { producer: 'aux-runtime-subagent-workload', version: 1, status: 'executing', observedAt: 1000,
    parentRunId: 'parent', workspaceId: 'workspace', groupId: 'group', children: children.map((child, index) => ({
      runId: child.runId, agentId: child.agentId, pageId: `copy-${index}`, requestedPageId: child.pageIds[0], requestedSessionId: `requested-${index}`, sourcePageId: `human-${index}`, sourceSessionId: `human-session-${index}`, sourceRunId: 'parent',
      documentEpoch: 1, requestedDocumentEpoch: 1, sourceDocumentEpoch: 1, cellId: `cell-${index}`, sessionId: `attachment-${index}`, deadlineAt: 2000, memoryLimitBytes: 128 * 1024 * 1024 })) };
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
  ['same-URL child document replacement', record => { record.workloadAfter.children[0].documentEpoch++; }],
  ['same-URL protected parent document replacement', record => { record.workloadAfter.children[0].requestedDocumentEpoch++; }],
  ['same-URL original human document replacement', record => { record.workloadAfter.children[0].sourceDocumentEpoch++; }],
  ['missing child epoch', record => { delete record.workloadAfter.children[0].documentEpoch; }],
  ['negative parent epoch', record => { record.workloadAfter.children[0].requestedDocumentEpoch = -1; }],
  ['fractional human epoch', record => { record.workloadAfter.children[0].sourceDocumentEpoch = 1.5; }],
  ['wrong memory cap', record => { record.workloadAfter.children[0].memoryLimitBytes = 256 * 1024 * 1024; }],
]) test(`refuses ${name}`, () => {
  const { expected, record } = fixture(); change(record);
  assert.throws(() => assertSubagentMemoryBracket(record, expected));
});

test('unapproved parent fails before any service call or model response override', async () => {
  let calls = 0;
  await assert.rejects(startSubagentMemoryWorkload({ scopedRpc: async () => { calls++; },
    model: { respond() { calls++; }, holdText() {} }, parentHold: { release() {}, cancel() {} }, readNativePreparation: async () => {}, until: async () => {}, signal: new AbortController().signal,
    parent: { runId: 'parent', pageIds: Array.from({ length: 5 }, (_, i) => `page-${i}`), config: {} },
    idlePageIds: Array.from({ length: 10 }, (_, i) => `idle-${i}`) }));
  assert.equal(calls, 0);
});

function preparationFixture() {
  const idlePageIds = Array.from({ length: 10 }, (_, i) => `human-${i}`);
  const sources = Array.from({ length: 5 }, (_, i) => ({ pageId: `protected-${i}`, sourcePageId: idlePageIds[i] }));
  const parent = { runId: 'parent', pageIds: sources.map(source => source.pageId), config: { taskId: 'task', taskRevision: 3, contextWorkspaceId: 'workspace', isolatedPageSources: sources, maxTokens: 250000, maxCostUsd: 5, deadlineMs: 180000 } };
  const ready = { producer: 'aux-runtime-subagent-preparation', version: 1, status: 'ready', observedAt: 100, deadlineAt: 1000, parentRunId: 'parent', taskId: 'task', taskRevision: 3, workspaceId: 'workspace', pages: sources.map(source => ({ ...source, sessionId: `s-${source.pageId}`, sourceSessionId: `s-${source.sourcePageId}`, documentEpoch: 1, sourceDocumentEpoch: 1 })) };
  return { parent, idlePageIds, ready };
}

test('actual parent response release and genuine readiness precede every child launch', async () => {
  const { parent, idlePageIds, ready } = preparationFixture();
  const calls = []; let released = false, proved = false, count = 0;
  const workload = await startSubagentMemoryWorkload({ parent, idlePageIds, signal: new AbortController().signal,
    parentHold: { release() { released = true; calls.push('release'); }, cancel() { calls.push('cancel-parent'); } },
    model: { respond() {}, holdText() {} },
    readNativePreparation: async () => { assert.equal(released, true); calls.push('read'); return proved ? ready : { producer: ready.producer, version: 1, status: 'refused' }; },
    until: async (_label, predicate) => { assert.equal(await predicate(), false); assert.deepEqual(calls, ['runs.pause', 'runs.get', 'release', 'read']); proved = true; return predicate(); },
    scopedRpc: async method => { calls.push(method); if (method === 'runs.get') return { run: { status: 'paused' } }; if (method === 'subagents.createGroup') { assert.equal(proved, true); return { groupId: 'group', workspaceId: 'workspace' }; } if (method === 'subagents.spawn') return { agentId: `a-${count}`, runId: `r-${count++}`, pageIds: [parent.pageIds[count - 1]] }; },
  });
  assert.equal(count, 5); assert.equal(workload.preparation, ready);
  await workload.cleanup(); assert.equal(calls.filter(method => method === 'subagents.cancel').length, 5);
});

test('deadline before genuine pause readiness cancels the real parent hold and creates no children', async () => {
  const { parent, idlePageIds, ready } = preparationFixture(); let canceled = 0, launches = 0;
  await assert.rejects(startSubagentMemoryWorkload({ parent, idlePageIds, signal: new AbortController().signal,
    parentHold: { release() {}, cancel() { canceled++; } }, model: { respond() {}, holdText() {} },
    readNativePreparation: async () => ({ producer: ready.producer, version: 1, status: 'refused' }),
    until: async (_label, predicate) => { assert.equal(await predicate(), false); throw new Error('Original global deadline'); },
    scopedRpc: async method => { if (method === 'runs.get') return { run: { status: 'paused' } }; if (method.startsWith('subagents.')) launches++; },
  }), /Original global deadline/);
  assert.equal(canceled, 1); assert.equal(launches, 0);
});


test('exact native refusal waits for original runtime readiness before launching five children', async () => {
  const { parent, idlePageIds, ready } = preparationFixture();
  let proved = false, released = false, launches = 0;
  const workload = await startSubagentMemoryWorkload({ parent, idlePageIds, signal: new AbortController().signal,
    parentHold: { release() { released = true; }, cancel() {} }, model: { respond() {}, holdText() {} },
    readNativePreparation: async () => { assert.equal(released, true); return proved ? ready : { producer: 'aux-native-subagent-preparation', version: 1, status: 'refused' }; },
    until: async (_label, predicate) => { assert.equal(await predicate(), false); assert.equal(launches, 0); proved = true; return predicate(); },
    scopedRpc: async method => {
      if (method === 'runs.get') return { run: { status: 'paused' } };
      if (method === 'subagents.createGroup') { assert.equal(proved, true); return { groupId: 'group', workspaceId: 'workspace' }; }
      if (method === 'subagents.spawn') return { agentId: `a-${launches}`, runId: `r-${launches++}`, pageIds: [parent.pageIds[launches - 1]] };
    },
  });
  assert.equal(workload.preparation, ready); assert.equal(launches, 5);
  await workload.cleanup();
});

for (const [name, record] of [
  ['wrong producer', { producer: 'foreign-native-preparation', version: 1, status: 'refused' }],
  ['extra native field', { producer: 'aux-native-subagent-preparation', version: 1, status: 'refused', preparation: {} }],
  ['native ready instead of original runtime record', { producer: 'aux-native-subagent-preparation', version: 1, status: 'ready' }],
  ['wrong native version', { producer: 'aux-native-subagent-preparation', version: 2, status: 'refused' }],
]) test(`rejects ${name} before creating groups or children and cancels parent hold`, async () => {
  const { parent, idlePageIds } = preparationFixture(); let canceled = 0, launches = 0;
  await assert.rejects(startSubagentMemoryWorkload({ parent, idlePageIds, signal: new AbortController().signal,
    parentHold: { release() {}, cancel() { canceled++; } }, model: { respond() {}, holdText() {} },
    readNativePreparation: async () => record, until: async (_label, predicate) => predicate(),
    scopedRpc: async method => { if (method === 'runs.get') return { run: { status: 'paused' } }; if (method.startsWith('subagents.')) launches++; },
  }));
  assert.equal(canceled, 1); assert.equal(launches, 0);
});
