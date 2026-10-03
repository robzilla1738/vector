import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = new URL('../../apps/shell/src/native-performance-fixture-observer.ts', import.meta.url);
// Executes the actual adapted module with a controlled private request. No
// native observation, UI, helper, mailbox file or timing evidence is produced.
function observer() {
  const script = ts.transpileModule(readFileSync(source, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(script, { exports, setTimeout() { throw new Error('Timer polling forbidden'); },
    setInterval() { throw new Error('Timer polling forbidden'); } });
  return exports.startNativePerformanceFixtureObserver;
}
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
test('real adapted observer remains blocked without timers between native Ready and Complete', async () => {
  const calls = []; let next;
  const stop = observer()(async method => {
    calls.push(method);
    if (calls.length === 1) return { sequence: '1', operation: 'prepareAuxWarmWindow' };
    if (method === 'prepareAuxWarmWindow') return { status: 'ready' };
    return new Promise(resolve => { next = resolve; });
  });
  await flush(); assert.deepEqual(calls, ['performanceFixtureNextRequest', 'prepareAuxWarmWindow', 'performanceFixtureNextRequest']);
  await flush(); assert.equal(calls.length, 3);
  next({ sequence: '2', operation: 'completeAuxWarmWindow' }); await flush();
  assert.equal(calls[3], 'completeAuxWarmWindow'); stop();
});
for (const value of [{ sequence: '1', operation: 'prepareForeignWarmWindow' },
  { sequence: '2', operation: 'prepareAuxWarmWindow' },
  { sequence: '1', operation: 'prepareAuxWarmWindow', windowId: 4 }]) {
  test(`actual adapted observer rejects malformed/private selector ${JSON.stringify(value)}`, async () => {
    const calls = []; const stop = observer()(async method => { calls.push(method); return value; });
    await flush(); assert.deepEqual(calls, ['performanceFixtureNextRequest']); stop();
  });
}
test('retired observer cannot consume a late warm completion', async () => {
  const calls = []; let resolve;
  const stop = observer()(method => { calls.push(method); return new Promise(done => { resolve = done; }); });
  stop(); resolve({ sequence: '1', operation: 'completeAuxWarmWindow' }); await flush();
  assert.deepEqual(calls, ['performanceFixtureNextRequest']);
});
