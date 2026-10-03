// Actual App adapter body against controlled child/stream lifetime; no OS operations.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('./lib/app.mjs', import.meta.url), 'utf8');
const start = source.indexOf('    async discoverUtilityAppearance(selection) {');
const end = source.indexOf('    discoverPipAppearance(selection) {', start);
assert.ok(start > 0 && end > start);
function fixture() {
  let complete, entered;
  const ready = new Promise(resolve => { entered = resolve; });
  const context = { Promise, Error, fileAppearance: undefined, child: { pid: 42, exitCode: null, signalCode: null }, generation: 1, externalPid: undefined,
    appearanceStream: { discoverUtility: selection => { context.selection = selection; entered(); return new Promise(resolve => { complete = resolve; }); } } };
  context.running = () => context.child.exitCode === null && context.child.signalCode === null;
  const owner = vm.runInNewContext(`({${source.slice(start, end)}})`, context);
  return { context, observe: owner.discoverUtilityAppearance.bind(owner), ready, complete: value => complete(value) };
}
test('actual original App discovery forwards selectors and returns original raw bytes', async () => {
  const f = fixture(), selector = { browserWindowId: '12', windowKind: 'little', notBefore: '2026-10-03T12:00:00Z' };
  const result = f.observe(selector); await f.ready; assert.equal(f.context.selection, selector);
  f.complete('original native bytes'); assert.equal(await result, 'original native bytes');
});
for (const [name, retire] of [
  ['exit before close', c => { c.child.exitCode = 1; }],
  ['same PID replacement child', c => { c.child = { ...c.child }; }],
  ['new generation', c => { c.generation++; }],
  ['replacement stream', c => { c.appearanceStream = {}; }],
  ['external owner', c => { c.externalPid = 42; }],
]) test(`actual awaited discovery refuses ${name}`, async () => {
  const f = fixture(), pending = f.observe({ browserWindowId: '12', windowKind: 'little', notBefore: new Date().toISOString() });
  await f.ready; retire(f.context); f.complete('old owner receipt'); await assert.rejects(pending, /retired/);
});
