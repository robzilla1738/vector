import assert from 'node:assert/strict';
import test from 'node:test';
import { retainClosedContextProof, requireClosedContextUnsent, requireClosedContextRecoveredRun } from './closed-context-recovery-proof.mjs';
const source = () => ({ pageId: 'selected-native', url: 'http://127.0.0.1:73/context', sessionId: 'selected-document', documentEpoch: 7, ownedByRuntime: false, loading: false, viewStatus: 'live' });
const foreign = { pageId: 'unrelated-tool', url: 'http://127.0.0.1:73/tool', sessionId: 'foreign-document', documentEpoch: 1, ownedByRuntime: true };
const runs = [{ runId: 'previous', status: 'completed', goal: 'Previously selected source', pageIds: ['selected-native'] }];
const calls = [{ messages: [{ role: 'user', content: 'Previous explicit request' }], tools: [{ type: 'function' }] }];
const draft = 'Keep this draft after my selected source closes.';
const proof = () => retainClosedContextProof([source(), foreign], source().url, runs, calls);
const recovered = () => ({ runId: 'new-person-send', status: 'completed', goal: draft, pageIds: [], config: { mentions: [], contextPageRefs: [], isolatedPageSources: [] } });
test('actual selected native document and original requests are retained independently', () => {
 const pages = [source(), foreign], inventory = structuredClone(runs), requests = structuredClone(calls);
 const retained = retainClosedContextProof(pages, source().url, inventory, requests);
 pages[0].sessionId = 'replacement'; inventory.push({ ...runs[0], runId: 'unexpected' }); requests.push({ messages: [], tools: [] });
 assert.equal(retained.source.sessionId, 'selected-document'); assert.equal(retained.runs.length, 1); assert.equal(retained.modelCalls.length, 1);
});
test('genuine closed source absence with unchanged runs/requests admits only unsent draft state', () => requireClosedContextUnsent(proof(), [foreign], structuredClone(runs), structuredClone(calls)));
test('old source still present or hidden pre-consent model/run work is rejected', () => {
 for (const [pages, inventory, requests] of [[[source(), foreign], runs, calls], [[foreign], [...runs, { ...runs[0], runId: 'hidden' }], calls], [[foreign], [{ ...runs[0], status: 'running' }], calls], [[foreign], runs, [...calls, { messages: [], tools: [] }]], [[foreign], runs, [{ ...calls[0], messages: [{ role: 'user', content: 'Changed source' }] }]]]) assert.throws(() => requireClosedContextUnsent(proof(), pages, inventory, requests));
});
test('missing/ambiguous/driver-owned/changed availability source cannot be called original', () => {
 for (const pages of [[], [source(), source()], [{ ...source(), sessionId: '' }], [{ ...source(), documentEpoch: -1 }], [{ ...source(), ownedByRuntime: true }], [{ ...source(), agentIsolation: {} }], [{ ...source(), loading: true }], [{ ...source(), viewStatus: 'crashed' }]]) assert.throws(() => retainClosedContextProof(pages, source().url, runs, calls));
});
test('explicit recovered original draft has completely page-free scope', () => requireClosedContextRecoveredRun(proof(), recovered(), draft));
test('empty pageIds alone can hide stale closed mention/document grants: required proof falsifies it', () => {
 for (const key of ['mentions', 'contextPageRefs', 'isolatedPageSources']) {
  const value = recovered(); value.config[key] = [{ ...source(), kind: 'tab', access: 'act' }];
  assert.deepEqual(value.pageIds, []); // The prior journey's recovered-run scope assertion accepts this.
  assert.throws(() => requireClosedContextRecoveredRun(proof(), value, draft));
 }
});
test('old run, changed draft and foreign fallback page never constitute recovery', () => {
 for (const update of [{ runId: 'previous' }, { goal: 'Rewritten or empty draft' }, { pageIds: [foreign.pageId] }, { pageIds: [source().pageId] }]) assert.throws(() => requireClosedContextRecoveredRun(proof(), { ...recovered(), ...update }, draft));
});
test('late completed result cannot acquire context after initial page-free acceptance', () => {
 const started = recovered(); started.status = 'running'; requireClosedContextRecoveredRun(proof(), started, draft);
 const completed = { ...recovered(), config: { mentions: [], contextPageRefs: [source()], isolatedPageSources: [] } };
 assert.throws(() => requireClosedContextRecoveredRun(proof(), completed, draft));
});
