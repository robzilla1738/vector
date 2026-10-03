import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = new URL('./native-warm-cohort.mjs', import.meta.url);
// Actual collector executed with controlled observations/children only. These
// records never admit a native trial, real helper, AC power or hardware result.
function fixture() {
  const candidate = {stock:{dirty:false,sourceCommit:'a'.repeat(40),sourceTree:'b'.repeat(40),upstreamCommit:'c'.repeat(40),upstreamTag:'195.0.0.0',chromiumVersion:'195.0.0.0',chromiumLastChange:'c'.repeat(40),manifestHash:'d'.repeat(64),buildId:'controlled'}};
  const identity = candidate.stock, calls = [];
  let opens = 0;
  const observe = async owner => {
    calls.push(`observe:${owner.index}`);
    const index = owner.index, start = BigInt(index * 1000 + 100), elapsed = BigInt(index + 1);
    return { record: { producer: 'aux-native-stock-warm-presentation', status: 'measured', measured: true,
      earliestPresentationProven: true, classification: 'warm-additional-window', sampleSequence: '1',
      browserPid: index + 100, originalBrowserProcessUuid: 'd'.repeat(32), originalBrowserProcessStart: String(index + 1),
      launchReceiptSha256: String(index), measurementNonce: String(index), nativeInputUs: String(start),
      presentedUs: String(start + elapsed), elapsedUs: String(elapsed) },
      cold: { record: { browserPid: index + 100, browserImageUuid: 'd'.repeat(32), browserStartMachTicks: String(index + 1) } },
      inputPair: { helperPairMatched: true } };
  };
  const exports = {}, script = ts.transpileModule(readFileSync(source, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(script, { exports, structuredClone, AbortSignal,
    require(name) { if (name === 'node:assert/strict') return { default: assert };
      if (name === 'node:child_process') return { execFileSync() { throw new Error('Native producer forbidden'); } };
      if (name === './native-aux-warm-observation.mjs') return {observeAuxWarmWindow(){throw new Error('Stock cannot borrow Aux producer');}};
      assert.equal(name, './native-stock-warm-observation.mjs'); return { observeStockWarmWindow: owner => observe(owner) }; } });
  const rawCollect = options => exports.collectWarmWindows('stock', options);
  const collect = options => rawCollect(options).catch(error => error.report);
  const options = { candidate, signal: new AbortController().signal, readPower: async () => "Now drawing from 'AC Power'",
    async openTrial(index) { opens++; calls.push(`open:${index}`);
      return { index, readIdentity: async () => identity,
        ax: { helperPid: index + 500, async close() { calls.push(`ax-close:${index}`); return {
          producer: 'aux-native-input-helper-close', helperPid: index + 500, reaped: true, clean: true,
          cleanupRequested: true, code: 0, signal: null, pendingCount: 0 }; } },
        startup: { async stop() { calls.push(`browser-stop:${index}`); return { cleanupDebt: false, nativeSlotRetained: false }; } } }; } };
  return { collect, rawCollect, options, calls, count: () => opens, observe };
}
test('twenty controlled trials retain raw nearest-rank distributions and clean before next trial', async () => {
  const f = fixture(), report = await f.collect(f.options);
  assert.equal(report.status, 'observed'); assert.equal(report.samplesUs.length, 20);
  assert.equal(report.p50Us, '10'); assert.equal(report.p95Us, '19'); assert.equal(report.maxUs, '20');
  assert.equal(report.nativeQualificationProven, false); assert.equal(report.compiledHelperProven, false);
  assert.equal(report.relativeComparisonProven, false);
  assert.deepEqual(f.calls.slice(0, 5), ['open:0', 'observe:0', 'ax-close:0', 'browser-stop:0', 'open:1']);
});
test('under twenty trials refuse before owned launch', async () => {
  const f = fixture(), report = await f.collect({ ...f.options, trials: 19 });
  assert.equal(report.status, 'failed'); assert.equal(f.count(), 0); assert.equal(report.samplesUs.length, 0);
});
test('browser cleanup debt stops cohort and preserves retained-slot receipt', async () => {
  const f = fixture(), open = f.options.openTrial;
  f.options.openTrial = async index => { const owner = await open(index);
    owner.startup.stop = async () => ({ cleanupDebt: true, nativeSlotRetained: true }); return owner; };
  const report = await f.collect(f.options);
  assert.equal(report.status, 'failed'); assert.equal(f.count(), 1); assert.equal(report.samplesUs.length, 0);
  assert.equal(report.attempts[0].browserCleanup.nativeSlotRetained, true);
});
test('unsolicited input-helper exit is retained and original browser still receives stop', async () => {
  const f = fixture(), open = f.options.openTrial, primary = new Error('controlled unsolicited exit');
  f.options.openTrial = async index => { const owner = await open(index);
    owner.ax.close = async () => ({ helperPid: owner.ax.helperPid, producer: 'aux-native-input-helper-close',
      reaped: true, clean: false, cleanupRequested: false, code: 0, signal: null, pendingCount: 0, primary });
    return owner; };
  const report = await f.collect(f.options);
  assert.equal(report.status, 'failed'); assert.equal(f.count(), 1);
  assert.equal(report.attempts[0].inputCleanup.primary, primary); assert.ok(f.calls.includes('browser-stop:0'));
});
test('battery read before trial never creates an owned process', async () => {
  const f = fixture(), report = await f.collect({ ...f.options, readPower: async () => 'Battery Power' });
  assert.equal(report.status, 'failed'); assert.equal(f.count(), 0);
});
test('candidate drift after observation preserves source failure and cleans both original owners', async () => {
  const f = fixture(), open = f.options.openTrial;
  f.options.openTrial = async index => { const owner = await open(index); let count = 0;
    owner.readIdentity = async () => ++count === 1 ? f.options.candidate.stock : {...f.options.candidate.stock,buildId:'changed'}; return owner; };
  const report = await f.collect(f.options);
  assert.equal(report.status, 'failed'); assert.equal(f.count(), 1); assert.match(report.primary.message, /Actual Stock identity changed/);
  assert.deepEqual(f.calls.slice(-2), ['ax-close:0', 'browser-stop:0']); assert.equal(report.samplesUs.length, 0);
});

test('production failure throws with original cause and serializable failed report', async () => {
  const f = fixture();
  await assert.rejects(f.rawCollect({ ...f.options, trials: 19 }), error => {
    assert.equal(error.cause, error.report.primary);
    const saved = JSON.parse(JSON.stringify(error.report));
    assert.equal(saved.status, 'failed'); assert.match(saved.error, /20–100/); return true;
  });
});

test('replayed original Stock process generation cannot count a second sample', async()=>{
 const f=fixture(),open=f.options.openTrial;
 f.options.openTrial=async index=>{const owner=await open(index);if(index===1)owner.index=0;return owner;};
 const report=await f.collect(f.options);assert.equal(report.status,'failed');assert.equal(report.samplesUs.length,1);assert.match(report.primary.message,/Repeated original process generation/);assert.equal(f.count(),2);
});
test('AC loss after actual observation retains original sample but does not count it',async()=>{
 const f=fixture();let reads=0;f.options.readPower=async()=>++reads===1?"Now drawing from 'AC Power'":'Battery Power';
 const report=await f.collect(f.options);assert.equal(report.status,'failed');assert.equal(report.samplesUs.length,0);assert.ok(report.attempts[0].observation.record.elapsedUs);assert.deepEqual(f.calls.slice(-2),['ax-close:0','browser-stop:0']);
});
test('unknown producer kind refuses before any owned trial effects',async()=>{
 const source=readFileSync(new URL('./native-warm-cohort.mjs',import.meta.url),'utf8');
 const script=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const exports={};
 vm.runInNewContext(script,{exports,structuredClone,AbortSignal,require(name){if(name==='node:assert/strict')return {default:assert};return {};}});
 await assert.rejects(exports.collectWarmWindows('foreign',{}),/Closed original warm producer/);
});
