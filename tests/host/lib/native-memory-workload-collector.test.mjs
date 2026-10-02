import assert from 'node:assert/strict';
import test from 'node:test';
import { createNativeProcessMemoryReader } from './native-process-memory.mjs';
import { createNativeWorkloadPreparationAdapter, collectNativeMemoryWorkloadTrials } from './native-memory-workload-collector.mjs';
import { collectNativeMemoryBudget } from './native-memory-budget.mjs';

// Synthetic original protocol controls against the actual reader; not native
// kernel measurements, five real VMs, AC hardware or M3 qualification.
function fixture(mode = 'idle') {
  const idlePageIds = Array.from({ length: 10 }, (_, i) => `human-${i}`);
  const pages = idlePageIds.map(pageId => ({ pageId, sessionId: `session-${pageId}`, documentEpoch: 1, url: 'https://fixture.test/idle' }));
  const children = Array.from({ length: 5 }, (_, i) => ({ runId: `run-${i}`, agentId: `agent-${i}`, pageIds: [`protected-${i}`] }));
  const expected = { groupId: 'group', parentRunId: 'parent', workspaceId: 'workspace', children, idlePageIds };
  let count = 0, cleanup = 0;
  const candidate = { productIdentity: { commit: 'a'.repeat(40), tree: 'b'.repeat(40), label: 'a'.repeat(40), dirty: false },
    native: { sourceCommit: 'a'.repeat(40), buildId: 'synthetic', manifestHash: 'c'.repeat(64) },
    shellDigest: 'd'.repeat(64), harnessCommit: 'e'.repeat(40), moduleSha256: 'f'.repeat(64) };
  const f = { pages, idlePageIds, change: row => row, fail: () => {}, cleanupFail: false };
  f.candidate = candidate;
  const transport = { async invoke(operation) {
    const sequence = ++count; f.fail(sequence);
    const start = 1000000 + sequence * 1000;
    const readings = [['100', '5', '10'], ['105', '20', '30'], ['103', '60', '70'], ['102', '80', '90']];
    const workload = mode === 'idle' ? { producer: 'aux-runtime-subagent-workload', version: 1, status: 'idle', activeExecutions: 0 }
      : { producer: 'aux-runtime-subagent-workload', version: 1, status: 'executing', parentRunId: 'parent', workspaceId: 'workspace', groupId: 'group',
        children: children.map((child, i) => ({ runId: child.runId, agentId: child.agentId, cellId: `cell-${i}`, deadlineAt: 1000000, memoryLimitBytes: 128 * 1024 * 1024,
          sourceRunId: 'parent', sourcePageId: idlePageIds[i], sourceSessionId: `session-${idlePageIds[i]}`, sourceDocumentEpoch: 1,
          requestedPageId: child.pageIds[0], requestedSessionId: `protected-session-${i}`, requestedDocumentEpoch: 1,
          pageId: `child-${i}`, sessionId: `child-session-${i}`, documentEpoch: 1 })) };
    let row = operation === 'prepareSubagentMemoryWorkload'
      ? { producer: 'aux-native-subagent-preparation', version: 1, status: 'ready', windowId: 1, widgetRoutingId: 2, requestNonce: 'a'.repeat(32), sampleSequence: String(sequence), runtimePid: 103, runtimeConnectionGeneration: '7', issuedUs: String(start), receivedUs: String(start + 100),
        preparation: { producer: 'aux-runtime-subagent-preparation', version: 1, status: 'ready', observedAt: 1000, deadlineAt: 1000000, parentRunId: 'parent', taskId: 'task', taskRevision: 1, workspaceId: 'workspace',
          pages: children.map((child, i) => ({ pageId: child.pageIds[0], sessionId: `protected-session-${i}`, documentEpoch: 1, sourcePageId: idlePageIds[i], sourceSessionId: `session-${idlePageIds[i]}`, sourceDocumentEpoch: 1 })) } }
      : { producer: 'aux-native-process-memory', version: 1, status: 'sampled', windowId: 1, widgetRoutingId: 2, requestNonce: 'a'.repeat(32), sampleSequence: String(sequence), sampleStartUs: String(start), sampleEndUs: String(start + 100),
        workload, workloadObservedAt: [1000 + sequence * 2, 1001 + sequence * 2], workloadRequestTimes: ['0', '3', '91', '95'], processes: [
          [100, 'browser', 2, [], 'b'.repeat(32), '300', structuredClone(readings)],
          [101, 'shell', 3, [1], 'b'.repeat(32), '301', structuredClone(readings)],
          [102, 'gpu', 9, [2], 'b'.repeat(32), '302', structuredClone(readings)],
          [103, 'runtime', null, [], 'b'.repeat(32), '303', [['110', '40', '45'], ['115', '46', '50']], '7'],
        ] };
    row = f.change(row, sequence);
    const raw = JSON.stringify(row), wrapper = { producer: 'aux-native-fixture-reply', version: 1, pid: 100, windowId: 1, sequence: String(sequence), operation, record: row };
    this.lastReceipt = { pid: 100, generation: 1, sequence: String(sequence), operation, recordRaw: raw, raw: 'AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify(wrapper) };
    return raw;
  } };
  f.options = { reader: createNativeProcessMemoryReader({ transport, browserPid: 100, candidate, readIdentity: async () => ({ runtime: candidate.productIdentity, native: candidate.native }), readPower: async () => "Now drawing from 'AC Power'" }), browserPid: 100, mode, idlePageIds,
    readPages: async () => structuredClone(pages), signal: new AbortController().signal,
    ...(mode === 'executing' ? { workload: { expected, idlePageIds, cleanup: async () => { cleanup++; if (f.cleanupFail) throw new Error('Exact cancellation ACK missing'); } } } : {}) };
  f.calls = () => count; f.cleanups = () => cleanup;
  return f;
}

for (const mode of ['idle', 'executing']) test(`twenty ${mode} trials retain original compact bytes, every kernel and whole workload brackets`, async () => {
  const f = fixture(mode), result = await collectNativeMemoryWorkloadTrials(f.options);
  assert.equal(result.trials.length, 20); assert.equal(f.calls(), 20); assert.equal(f.cleanups(), mode === 'executing' ? 1 : 0);
  for (const trial of result.trials) {
    assert.equal(trial.status, 'sampled'); assert.equal(trial.decoded.totalConservativeBytes, 430n);
    assert.equal(trial.decoded.processes.reduce((sum, process) => sum + process.readings.length, 0), 14);
    assert.equal(JSON.stringify(trial.decoded.row), trial.observation.raw);
    assert.ok(trial.observation.receipt.raw.startsWith('AUX_NATIVE_FIXTURE_REPLY_V1 '));
    assert.equal(trial.bracket.before.observedAt + 1, trial.bracket.after.observedAt);
    assert.deepEqual(trial.idleBefore, trial.idleAfter);
  }
});

test('preparation adapter retains exact native refusal and unwraps only original ready scope', async () => {
  const f = fixture('executing'), adapter = createNativeWorkloadPreparationAdapter(f.options.reader);
  f.change = row => ({ producer: row.producer, version: 1, status: 'refused' });
  assert.deepEqual(await adapter.readNativePreparation(), { producer: 'aux-native-subagent-preparation', version: 1, status: 'refused' });
  f.change = row => row;
  const ready = await adapter.readNativePreparation();
  assert.equal(ready.producer, 'aux-runtime-subagent-preparation'); assert.equal(ready.parentRunId, 'parent');
  assert.equal(adapter.observations.length, 2); assert.deepEqual(ready, adapter.observations[1].native.preparation);
});

test('native refusal after sampled trials preserves failed original evidence and performs actual cleanup', async () => {
  const f = fixture('executing'); f.change = (row, sequence) => sequence === 3 ? { producer: row.producer, version: 1, status: 'refused' } : row;
  await assert.rejects(collectNativeMemoryWorkloadTrials(f.options), error => {
    assert.equal(error.trials.length, 3); assert.equal(error.trials[0].status, 'sampled'); assert.equal(error.trials[2].status, 'failed');
    assert.ok(error.trials[2].observation.raw.includes('refused')); assert.ok(error.trials[2].observation.receipt.raw); return true;
  });
  assert.equal(f.calls(), 3); assert.equal(f.cleanups(), 1);
});

for (const [name, change] of [
  ['same-URL document replacement', page => { page.documentEpoch++; }],
  ['attachment replacement', page => { page.sessionId = 'new-attachment'; }],
]) test(`retained human ${name} between trials refuses rather than repins`, async () => {
  const f = fixture('executing'); let reads = 0;
  f.options.readPages = async () => { if (++reads === 3) change(f.pages[0]); return structuredClone(f.pages); };
  await assert.rejects(collectNativeMemoryWorkloadTrials(f.options), error => { assert.equal(error.trials.length, 2); assert.equal(error.trials[1].status, 'failed'); return true; });
  assert.equal(f.calls(), 1); assert.equal(f.cleanups(), 1);
});

test('running five VMs cannot count as idle and idle cannot count as executing', async () => {
  for (const mode of ['idle', 'executing']) {
    const f = fixture(mode); f.options.mode = mode === 'idle' ? 'executing' : 'idle';
    if (mode === 'idle') f.options.workload = fixture('executing').options.workload; else delete f.options.workload;
    await assert.rejects(collectNativeMemoryWorkloadTrials(f.options), error => { assert.equal(error.trials.length, 1); return true; });
  }
});

test('cleanup failure retains all twenty original trials and its exact rejection', async () => {
  const f = fixture('executing'); f.cleanupFail = true;
  await assert.rejects(collectNativeMemoryWorkloadTrials(f.options), error => { assert.equal(error.trials.length, 20); assert.match(error.cleanupFailure.message, /ACK missing/); return true; });
  assert.equal(f.cleanups(), 1);
});

test('deadline abort preserves the unfinished trial and cancels the genuine workload', async () => {
  const f = fixture('executing'), controller = new AbortController(); controller.abort(); f.options.signal = controller.signal;
  await assert.rejects(collectNativeMemoryWorkloadTrials(f.options), error => { assert.equal(error.trials.length, 1); assert.match(error.trials[0].error, /deadline/); return true; });
  assert.equal(f.calls(), 0); assert.equal(f.cleanups(), 1);
});


for (const [name, change] of [
  ['original source document', child => { child.sourceDocumentEpoch++; }],
  ['original source attachment', child => { child.sourceSessionId = 'stale-source'; }],
]) test(`native ${name} must match the ten actual retained human tabs`, async () => {
  const f = fixture('executing'); f.change = row => { change(row.workload.children[0]); return row; };
  await assert.rejects(collectNativeMemoryWorkloadTrials(f.options), error => { assert.equal(error.trials.length, 1); assert.ok(error.trials[0].observation.receipt.raw); return true; });
  assert.equal(f.cleanups(), 1);
});

test('preparation transport failure retains original reader observation without fabricating refused scope', async () => {
  const f = fixture('executing'), adapter = createNativeWorkloadPreparationAdapter(f.options.reader);
  f.change = row => { row.preparation.selector = '#foreign'; return row; };
  await assert.rejects(adapter.readNativePreparation(), error => {
    assert.equal(error.preparationObservations.length, 1); assert.equal(error.preparationObservations[0].status, 'failed');
    assert.ok(error.preparationObservations[0].raw.includes('selector')); assert.ok(error.preparationObservations[0].receipt.raw); return true;
  });
});


test('scope precondition rejection still cancels the already launched real workload', async () => {
  const f = fixture('executing'); f.options.idlePageIds = ['foreign'];
  await assert.rejects(collectNativeMemoryWorkloadTrials(f.options), error => { assert.equal(error.trials.length, 0); return true; });
  assert.equal(f.calls(), 0); assert.equal(f.cleanups(), 1);
});

for (const mode of ['idle', 'executing']) test(`${mode} exact byte budget boundary retains serializable original evidence`, async () => {
  const f = fixture(mode), runtimeLimit = mode === 'idle' ? 120_000_000 : 250_000_000;
  f.change = row => {
    for (const process of row.processes) if (process[1] === 'shell' || process[1] === 'runtime')
      for (const reading of process[6]) reading[0] = String(process[1] === 'shell' ? 150_000_000 : runtimeLimit);
    return row;
  };
  const report = await collectNativeMemoryBudget(f.options, f.candidate);
  assert.equal(report.status, 'measured'); assert.equal(report.attempts.length, 20);
  assert.deepEqual(report.maximumBytes, { shell: '150000000', runtime: String(runtimeLimit), allProcesses: String(150_000_000 + runtimeLimit + 210) });
  assert.match(report.stockComparison, /required separately/);
  for (const attempt of report.attempts) assert.equal(JSON.stringify(attempt.decoded.row), attempt.observation.raw);
  assert.doesNotThrow(() => JSON.stringify(report));
});

for (const [mode, role, bytes] of [['idle', 'shell', 150_000_001], ['idle', 'runtime', 120_000_001], ['executing', 'runtime', 250_000_001]])
  test(`${mode} ${role} one byte above budget refuses without dropping measured trials`, async () => {
    const f = fixture(mode);
    f.change = row => { for (const reading of row.processes.find(process => process[1] === role)[6]) reading[0] = String(bytes); return row; };
    await assert.rejects(collectNativeMemoryBudget(f.options, f.candidate), error => {
      assert.equal(error.report.status, 'failed'); assert.equal(error.report.attempts.length, 20);
      assert.equal(error.report.maximumBytes[role], String(bytes)); return true;
    });
    assert.equal(f.cleanups(), mode === 'executing' ? 1 : 0);
  });

test('memory budget report retains original native refusal and exact cleanup failure', async () => {
  const f = fixture('executing'); f.cleanupFail = true;
  f.change = row => ({ producer: row.producer, version: 1, status: 'refused' });
  await assert.rejects(collectNativeMemoryBudget(f.options, f.candidate), error => {
    assert.equal(error.report.attempts.length, 1);
    assert.ok(error.report.attempts[0].observation.raw.includes('refused'));
    assert.match(error.report.cleanupFailure, /ACK missing/); return true;
  });
});

test('memory report cannot relabel original native observations to a different build', async () => {
  const f = fixture(), candidate = structuredClone(f.candidate); candidate.native.buildId = 'foreign';
  await assert.rejects(collectNativeMemoryBudget(f.options, candidate), error => {
    assert.equal(error.report.attempts.length, 20); assert.match(error.message, /Report candidate/); return true;
  });
});
