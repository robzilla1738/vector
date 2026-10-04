import assert from 'node:assert/strict';

/** Assertion receipt from actual native page catalog, existing run records and fixture requests. No grant. */
export function retainClosedContextProof(pages, url, runs, modelCalls) {
  const matches = pages.filter(page => page.url === url);
  assert.equal(matches.length, 1, 'Original selected context URL must identify one actual native source');
  const source = matches[0];
  assert.ok(typeof source.pageId === 'string' && source.pageId);
  assert.ok(typeof source.sessionId === 'string' && source.sessionId);
  assert.ok(Number.isSafeInteger(source.documentEpoch) && source.documentEpoch >= 0);
  assert.equal(source.ownedByRuntime, false);
  assert.ok(!source.agentIsolation && !source.loading && !source.detached && !source.crashed && !['detached', 'crashed'].includes(source.viewStatus));
  assert.equal(new Set(runs.map(run => run.runId)).size, runs.length);
  return structuredClone({ source, runs, modelCalls });
}
export function requireClosedContextUnsent(proof, pages, runs, modelCalls) {
  assert.ok(!pages.some(page => page.pageId === proof.source.pageId), 'The actual original selected native page must be absent after Close');
  assert.deepEqual(runs, proof.runs, 'Closing/removing unsent context must not start or alter a conversation run');
  assert.deepEqual(modelCalls, proof.modelCalls, 'Closed/unsent context must not dispatch another model request');
}
export function requireClosedContextRecoveredRun(proof, run, draft) {
  assert.ok(typeof run.runId === 'string' && run.runId);
  assert.ok(!proof.runs.some(prior => prior.runId === run.runId), 'Only the genuinely new post-consent run is recovery');
  assert.equal(run.goal, draft, 'Recovery must submit the exact preserved draft');
  assert.deepEqual(run.pageIds, [], 'Removing closed context cannot fall back to another page');
  assert.deepEqual(run.config?.mentions ?? [], [], 'Recovered page-free turn cannot retain stale mention/access grants');
  assert.deepEqual(run.config?.contextPageRefs ?? [], [], 'Recovered page-free turn cannot retain closed document/session snapshots');
  assert.deepEqual(run.config?.isolatedPageSources ?? [], [], 'Recovered page-free turn cannot manufacture protected-copy scope');
}
