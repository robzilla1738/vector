import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

export const subagentMemoryCode = 'globalThis.memoryWorkload = new Uint8Array(8 * 1024 * 1024); memoryWorkload.fill(17); for (let i = 0; i < 11; i++) sleep(10000); memoryWorkload[0]';
const unique = (values, count, message) => { assert.equal(values.length, count, message); assert.equal(new Set(values).size, count, message); };
const id = value => assert.ok(typeof value === 'string' && value.length > 0 && value.length <= 128, 'Missing native workload identity');

export function assertParentPreparation(receipt, parent, idlePageIds) {
  assert.equal(receipt?.producer, 'aux-runtime-subagent-preparation'); assert.equal(receipt.version, 1); assert.equal(receipt.status, 'ready');
  assert.equal(receipt.parentRunId, parent.runId); assert.equal(receipt.taskId, parent.config.taskId);
  assert.equal(receipt.taskRevision, parent.config.taskRevision); assert.equal(receipt.workspaceId, parent.config.contextWorkspaceId);
  assert.ok(Number.isSafeInteger(receipt.observedAt) && receipt.observedAt > 0);
  assert.ok(Number.isSafeInteger(receipt.deadlineAt) && receipt.deadlineAt > receipt.observedAt);
  unique(receipt.pages?.map(page => page.pageId) ?? [], 5, 'Five genuine protected parent copies required');
  unique(receipt.pages.map(page => page.sourcePageId), 5, 'Five distinct genuine original sources required');
  for (const page of receipt.pages) {
    assert.ok(parent.pageIds.includes(page.pageId)); assert.ok(idlePageIds.includes(page.sourcePageId));
    assert.ok(parent.config.isolatedPageSources.some(source => source.pageId === page.pageId && source.sourcePageId === page.sourcePageId));
    id(page.sessionId); id(page.sourceSessionId);
    assert.ok(Number.isSafeInteger(page.documentEpoch) && page.documentEpoch >= 0);
    assert.ok(Number.isSafeInteger(page.sourceDocumentEpoch) && page.sourceDocumentEpoch >= 0);
  }
  return receipt;
}

/** Validate ORIGINAL native runtime evidence, never cached tool output or group state. */
export function assertExecutingSubagentReceipt(receipt, expected) {
  assert.equal(receipt?.producer, 'aux-runtime-subagent-workload');
  assert.equal(receipt.version, 1); assert.equal(receipt.status, 'executing');
  assert.equal(receipt.groupId, expected.groupId); assert.equal(receipt.parentRunId, expected.parentRunId);
  assert.equal(receipt.workspaceId, expected.workspaceId);
  assert.ok(Number.isSafeInteger(receipt.observedAt) && receipt.observedAt > 0);
  unique(receipt.children?.map(child => child.runId) ?? [], 5, 'Five current child runs required');
  unique(receipt.children.map(child => child.agentId), 5, 'Five genuine agents required');
  unique(receipt.children.map(child => child.cellId), 5, 'Five genuine VM cells required');
  for (const child of receipt.children) {
    for (const value of [child.agentId, child.runId, child.cellId, child.pageId, child.sessionId, child.requestedPageId, child.requestedSessionId, child.sourcePageId, child.sourceSessionId]) id(value);
    for (const epoch of [child.documentEpoch, child.requestedDocumentEpoch, child.sourceDocumentEpoch]) assert.ok(Number.isSafeInteger(epoch) && epoch >= 0, "Current document epoch required");
    const actual = expected.children.find(item => item.runId === child.runId);
    assert.ok(actual, 'Foreign run in native workload');
    assert.equal(child.agentId, actual.agentId); assert.equal(child.requestedPageId, actual.pageIds[0]);
    assert.ok(expected.idlePageIds.includes(child.sourcePageId), 'Original source must be one of ten retained human tabs');
    assert.notEqual(child.pageId, child.requestedPageId); assert.notEqual(child.requestedPageId, child.sourcePageId);
    assert.equal(child.sourceRunId, expected.parentRunId);
    assert.equal(child.memoryLimitBytes, 128 * 1024 * 1024);
    assert.ok(Number.isSafeInteger(child.deadlineAt) && child.deadlineAt > receipt.observedAt, 'Expired VM');
  }
  return receipt;
}

export function assertSubagentMemoryBracket(record, expected) {
  const before = assertExecutingSubagentReceipt(record.workloadBefore, expected);
  const after = assertExecutingSubagentReceipt(record.workloadAfter, expected);
  assert.ok(after.observedAt >= before.observedAt, 'Workload observation order');
  const identity = value => value.children.map(child => [child.runId, child.agentId, child.cellId, child.pageId, child.sessionId, child.sourcePageId, child.sourceSessionId, child.requestedPageId, child.requestedSessionId, child.documentEpoch, child.requestedDocumentEpoch, child.sourceDocumentEpoch, child.deadlineAt]).sort();
  assert.deepEqual(identity(after), identity(before), 'Execution/attachment changed during memory sample');
  return { before, after };
}

/** Actual scoped service launch. Caller must first obtain a disposable UI-issued
 * workspace connection and a real parent with five person-approved resources.
 * This helper cannot create a connection, approve a task or override a lease.
 */
export async function startSubagentMemoryWorkload({ scopedRpc, model, parent, idlePageIds, signal, parentHold, readNativePreparation, until }) {
  assert.equal(typeof scopedRpc, 'function'); assert.ok(model?.respond && model?.holdText);
  assert.equal(typeof parentHold?.release, 'function', 'Actual held parent model response required');
  assert.equal(typeof parentHold?.cancel, 'function');
  assert.equal(typeof readNativePreparation, 'function', 'Native preparation producer required');
  assert.equal(typeof until, 'function', 'Journey global-deadline predicate required');
  assert.ok(signal instanceof AbortSignal && !signal.aborted);
  unique(parent.pageIds, 5, 'Parent must own five distinct approved resources');
  unique(idlePageIds, 10, 'Ten real idle fixture tabs required');
  assert.ok(parent.config?.contextWorkspaceId && parent.config?.taskId && parent.config?.taskRevision, 'Real source-task workspace provenance required');
  assert.equal(parent.config.isolatedPageSources?.length, 5, 'Actual protected parent source lineage required');
  assert.ok(parent.pageIds.every(pageId => parent.config.isolatedPageSources.some(source => source.pageId === pageId && idlePageIds.includes(source.sourcePageId))), 'Protected pages must derive from the ten retained human fixture tabs');
  assert.ok(parent.config.maxTokens >= 250000 && parent.config.maxCostUsd >= 5 && parent.config.deadlineMs >= 180000, 'Parent must retain the real five-child budget/deadline');
  const markers = Array.from({ length: 5 }, () => `aux-memory-child-${randomUUID()}`);
  const holds = [], children = [];
  model.respond(payload => {
    const authored = payload.messages.filter(message => message.role === 'user').flatMap(message => typeof message.content === 'string' ? [message.content] : Array.isArray(message.content) ? message.content.filter(part => part?.type === 'text' && typeof part.text === 'string').map(part => part.text) : []).join('\n');
    const matches = markers.filter(marker => authored.includes(marker));
    assert.equal(matches.length, 1, 'Unrelated or ambiguous model request');
    const marker = matches[0];
    const toolRows = payload.messages.filter(message => message.role === 'tool');
    if (!toolRows.length) return { tool_calls: [{ id: `repl-${marker}`, type: 'function', function: { name: 'repl', arguments: JSON.stringify({ code: subagentMemoryCode, deadlineMs: 120000, yieldTimeMs: 0 }) } }] };
    // This response only holds provider completion. Fresh native VM receipts,
    // rather than this cached tool row, authorize every memory observation.
    const pending = toolRows.some(message => {
      try { const output = JSON.parse(message.content); return output?.output?.running === true || output?.running === true; }
      catch { return false; }
    });
    assert.ok(pending, 'Real REPL must yield a pending cell before the hold');
    const hold = model.holdText(`Workload ${marker} is waiting.`, ' Workload released.');
    holds.push(hold); return hold.response;
  });
  let group;
  const cleanup = async () => {
    parentHold.cancel();
    for (const hold of holds) hold.cancel();
    const results = await Promise.allSettled(children.map(child => scopedRpc('subagents.cancel', { agentId: child.agentId })));
    const failures = results.filter(result => result.status === 'rejected');
    assert.equal(failures.length, 0, 'Actual child cancellation failed');
  };
  try {
    await scopedRpc('runs.pause', { runId: parent.runId });
    const paused = await scopedRpc('runs.get', { runId: parent.runId });
    assert.equal(paused.run.status, 'paused', 'Actual parent pause must be acknowledged');
    parentHold.release();
    const preparation = await until('parent reaches the actual no-page-ownership paused boundary', async () => {
      const value = await readNativePreparation();
      if (value?.producer === 'aux-native-subagent-preparation') {
        assert.deepEqual(Object.keys(value).sort(), ['producer', 'status', 'version'], 'Native refusal must retain its exact closed shape');
        assert.equal(value.version, 1); assert.equal(value.status, 'refused');
        return false;
      }
      assert.equal(value?.producer, 'aux-runtime-subagent-preparation'); assert.equal(value.version, 1);
      if (value.status === 'refused') return false;
      assertParentPreparation(value, parent, idlePageIds); return value;
    });
    group = await scopedRpc('subagents.createGroup', { parentRunId: parent.runId, tokenBudget: 250000, costBudgetUsd: 5, timeBudgetMs: 180000 });
    for (let index = 0; index < 5; index++) {
      assert.ok(!signal.aborted);
      const child = await scopedRpc('subagents.spawn', { groupId: group.groupId, sourceRunId: parent.runId,
        goal: `${markers[index]} Execute the provided disposable memory workload.`, profile: 'read_only',
        pageIds: [parent.pageIds[index]], tokenAllocation: 50000, costAllocationUsd: 1, maxModelCalls: 4 });
      children.push(child);
    }
    unique(children.map(child => child.runId), 5, 'Service must launch five actual runs');
    return { expected: { groupId: group.groupId, parentRunId: parent.runId, workspaceId: group.workspaceId, children, idlePageIds: [...idlePageIds] }, preparation, idlePageIds: [...idlePageIds], cleanup };
  } catch (error) { try { await cleanup(); } catch (cleanupError) { throw new AggregateError([error, cleanupError], 'Workload launch and cleanup failed'); } throw error; }
}
