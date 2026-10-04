// Controlled caller composition only: no native launch, input, or performance qualification.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as protocol from './native-command-presentation.mjs';
import * as warm from './native-warm-helper-identity.mjs';
import { rawPercentile } from './native-key-performance.mjs';
function fixture({ wrongMode = false, elapsed = 30000, helperError, abortAfterReady = false, helperDrift = false, duplicateRecord = false, seedCloseRefusal = false } = {}) {
  const signal = new AbortController(), calls = [], product = { dirty: false, sourceCommit: 'source' }, native = { sourceCommit: 'source', buildId: 'build', manifestHash: 'manifest' };
  const artifact = { bundle: '/controlled/Aux.app', artifact: {}, productIdentity: product, native };
  let generation = 0, live = false, sample = 0, mode = 'new-tab', prefix = '', seedLive = true, pending, ready, receipt;
  const identity = { runtime: product, native }, compilerArtifact = { decoded: { manifestRaw: 'original-manifest', auditRaw: 'original-audit' }, artifact: { binarySha256: '1'.repeat(64), sourceSha256: '2'.repeat(64), imageUuid: '3'.repeat(32) }, matchOriginalClient() {} };
  const pair = { compilerArtifact, validate() {} };
  const app = { async start() { calls.push('start'); generation++; live = true; }, async quit() { calls.push('quit'); live = false; }, async waitForStoppedCommandProfile() { calls.push('original-close'); return {}; }, pid: 700,
    get processObservation() { return { pid: 700, generation, launchKind: 'child', exitStatusAvailable: !live, spawnError: null, exitCode: live ? null : 0, signal: null }; }, async identity() { return identity; }, descriptor() {}, configurePerformanceMailbox() { return mailbox; } };
  const mailbox = { writer: { original: true }, invoke() { calls.push('arm'); sample++;
    const scope = { producer: 'aux-native-command-presentation', version: 1, sampleSequence: String(sample), windowId: 2, widgetRoutingId: 3, rendererPid: 4, nativeDocumentGeneration: '5', frameSinkClientId: 6, frameSinkSinkId: 7, resultsSource: mode === 'command' ? 'registry' : 'history', surfaceMode: wrongMode ? 'edit' : mode };
    ready = { pid: 700, generation, sequence: String(sample), raw: 'AUX_NATIVE_COMMAND_PRESENTATION_READY_V1 ' + JSON.stringify({ ...scope, status: 'ready' }), record: scope };
    const input = sample * 1000000;
    const measured = { ...scope, rendererMeasured: true, rendererFailure: 0, frameToken: 9, activated: true, submittedFrame: true, submissionFailure: -1, feedbackFlags: 4, nativeInputUs: String(input), nativeReceiptUs: String(input + 10), rendererInputUs: String(input), mutationUs: String(input + 1000), commitUs: String(input + 2000), submittedUs: String(input + 3000), receivedUs: String(input + 4000), embeddedUs: String(input + 5000), drawUs: String(input + 6000), presentationUs: String(input + elapsed), nativeInputSourcePid: 0, measured: true, elapsedMs: elapsed / 1000, status: 'measured' };
    const rawRecord = JSON.stringify(measured);
    receipt = { pid: 700, generation, operation: 'commandPresentationSnapshot', sequence: String(sample), recordRaw: rawRecord, commandReady: ready,
      raw: 'AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify({ producer: 'aux-native-fixture-reply', version: 1, pid: 700, windowId: 2, sequence: String(sample), operation: 'commandPresentationSnapshot', record: measured }) };
    if (duplicateRecord) receipt.raw = receipt.raw.replace('"record":{', '"record":{"windowId":2,');
    return new Promise(resolve => { pending = () => resolve(rawRecord); });
  }, async waitForCommandPresentationReady() { if (abortAfterReady) signal.abort(new Error('original abort')); return ready; }, get lastReceipt() { return receipt; } };
  const ax = { pid: 700, helperPid: 701, helperSource: '/controlled/helper', async key(key, via) { calls.push(['key', key, via]); if (key === 'command+t') mode = 'new-tab'; if (key === 'command+l') mode = 'edit'; if (key === 'command+k') mode = 'command'; if (['0','s'].includes(key)) pending(); }, async waitFor() {}, async type(value) { prefix = value; }, async query() { return [{ value: prefix, focused: true }]; }, async request() { return { producer: 'aux-native-warm-window-identity', version: 1, targetPid: 700, helperPid: 701, targetProcessUuid: '4'.repeat(32), targetProcessStartMachTicks: '100', helperProcessUuid: (helperDrift && sample ? '6' : '3').repeat(32), helperProcessStartMachTicks: '200' }; }, async close() { calls.push('helper-close'); if (helperError) throw helperError; return { reaped: true, clean: true }; } };
  const imports = { 'node:assert/strict': { default: assert }, 'node:child_process': {}, './app.mjs': { createJourneyApp: () => app }, './rpc.mjs': { createRpc: () => async method => { calls.push(method); if (method === 'pages.open') return { pageId: 'seed', url: 'http://127.0.0.1:1234/command-history/native-seed', backend: 'aux', ownedByRuntime: false }; if (method === 'pages.close') { if (seedCloseRefusal) return { ok: false }; seedLive = false; return { ok: true }; } if (method === 'pages.list') return seedLive ? [{ pageId: 'seed' }] : []; throw new Error(method); } }, './ax.mjs': { createAxClient: async () => ax }, './packaged-runtime-pair-artifact.mjs': { readPackagedRuntimePairBytes: () => artifact }, './command-history-dataset.mjs': { prepareCommandHistoryDataset() { calls.push('seed50000'); assert.equal(seedLive, false); return {}; }, readCommandHistoryDataset() { return { urlCount: 50000, visitCount: 50000, nativeQualificationProven: false }; } }, './native-window-compiler-artifact.mjs': { readNativeWindowCompilerExecutable() {} }, './native-warm-helper-identity.mjs': warm, './native-command-presentation.mjs': protocol, './native-key-performance.mjs': { rawPercentile } };
  const exports = {}, source = ts.transpileModule(readFileSync(new URL('./native-command-collector.mjs', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { exports, Buffer, URL, structuredClone, setTimeout, clearTimeout, require(name) { assert.ok(imports[name], name); return imports[name]; } });
  return { calls, collect: options => exports.collectNativeCommandPresentation({ pair, fixtureUrl: 'http://127.0.0.1:1234/', signal: signal.signal, readPower: () => "Now drawing from 'AC Power'", ...options }) };
}
test('actual caller composes original seed close, 60 READY→single HID trials and original cleanup', async () => {
  const f = fixture(), report = await f.collect(); assert.equal(report.status, 'passed'); assert.equal(report.attempts.length, 60);
  assert.ok(f.calls.indexOf('pages.close') < f.calls.indexOf('seed50000')); assert.equal(f.calls.filter(c => Array.isArray(c) && ['0','s'].includes(c[1]) && c[2] === 'hid').length, 60);
  assert.equal(report.nativeQualificationProven, false); assert.equal(report.firstFrameProven, false); assert.equal(report.ordinaryNavigationTimingProven, false);
  for (const attempt of report.attempts) { assert.ok(attempt.receipt.raw); assert.ok(attempt.ready.raw); assert.equal(attempt.receipt.recordRaw, undefined); assert.equal(attempt.ready.record, undefined); protocol.decodeNativeCommandPresentation(protocol.extractNativeCommandFixtureRecord(attempt.receipt.raw), attempt.ready.raw); }
});
test('fewer than 20 refuses before any original owner creation', async () => { const f = fixture(); await assert.rejects(f.collect({ trials: 19 })); assert.equal(f.calls.length, 0); });
test('wrong observed READY refuses before measured HID and still retires original owners', async () => { const f = fixture({ wrongMode: true }); await assert.rejects(f.collect()); assert.equal(f.calls.filter(c => Array.isArray(c) && ['0','s'].includes(c[1])).length, 0); assert.ok(f.calls.includes('helper-close')); });
test('original global abort after READY prevents measured HID', async () => { const f = fixture({ abortAfterReady: true }); await assert.rejects(f.collect(), error => error.cause.message === 'original abort'); assert.equal(f.calls.filter(c => Array.isArray(c) && ['0','s'].includes(c[1])).length, 0); });
test('unrounded fractional 30.004ms truthfully fails unchanged 30ms budget', async () => { const report = await fixture({ elapsed: 30004 }).collect(); assert.equal(report.status, 'failed'); assert.ok(report.metrics.every(row => row.p95Ms === 30.004 && !row.pass)); });
test('original primary and helper cleanup rejection identity both retained', async () => { const reason = new Error('original helper cleanup'), f = fixture({ wrongMode: true, helperError: reason }); await assert.rejects(f.collect(), error => { assert.equal(error.errors[1], reason); assert.ok(error.retainedOriginalOwners.app); assert.ok(error.retainedOriginalOwners.pendingCleanup.length); return true; }); });

test('original seed close refusal prevents dataset write and trial launch', async () => { const f = fixture({ seedCloseRefusal: true }); await assert.rejects(f.collect()); assert.ok(!f.calls.includes('seed50000')); assert.equal(f.calls.filter(c => c === 'start').length, 1); });
test('duplicate inner original record refuses despite parsed mailbox copy', async () => { await assert.rejects(fixture({ duplicateRecord: true }).collect()); });
test('original helper kernel UUID drift refuses trial evidence', async () => { await assert.rejects(fixture({ helperDrift: true }).collect()); });
