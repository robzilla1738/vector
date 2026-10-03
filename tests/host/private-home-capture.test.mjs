// Controlled original owners only. No native launch/helper/capture occurs.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { tmpdir } from 'node:os';
import vm from 'node:vm';
import ts from 'typescript';
const source = readFileSync(new URL('./private-home-capture.mjs', import.meta.url), 'utf8');
function fixture({ captureFailure = false, helperDebt = false, browserDebt = false } = {}) {
  const directory = mkdtempSync(path.join(tmpdir(), 'aux-controlled-private-runner-')), output = path.join(directory, 'evidence');
  const state = { released: 0, starts: 0, focuses: 0, helperCloses: 0, browserCloses: 0 };
  const candidate = { harnessCommit: 'a'.repeat(40), moduleSha256: 'b'.repeat(64) };
  const pair = { bundle: '/controlled/Aux.app', productIdentity: { commit: 'c'.repeat(40) }, native: { sourceCommit: 'c'.repeat(40) }, shellDigest: 'd'.repeat(64), artifact: { controlled: true },
    compilerArtifact: { artifact: { binarySha256: 'e'.repeat(64), sourceSha256: 'f'.repeat(64) } }, validate() {}, release() { state.released++; } };
  const app = { async startPrivateObservation() { state.starts++; }, async quit() { state.browserCloses++; if (browserDebt) throw new Error('Original browser close debt'); return { pid: 42, generation: 1, code: null, signal: 'SIGTERM' }; } };
  const helper = { async waitFor() {}, async dump() { return { controlledAX: true }; }, async focus() { state.focuses++; }, async query() { return [{ focused: state.focuses > 0 }]; },
    async close() { state.helperCloses++; if (helperDebt) throw new Error('Original helper close debt'); return { producer: 'aux-native-input-helper-close', reaped: true, clean: true, primary: null }; } };
  const captures = [], dependencies = {
    'node:assert/strict': assert, 'node:fs': fs, 'node:path': path,
    './lib/app.mjs': { createJourneyApp(options) { assert.equal(options.admittedPair, pair); return app; }, readPrivateAppObservation(original, artifact) { assert.equal(original, app); assert.equal(artifact, pair); return { pid: 42, windowId: 7, candidate, assertLive() {} }; } },
    './lib/ax.mjs': { async createAxClient(pid, options) { assert.equal(pid, 42); assert.equal(options.compilerArtifact, pair.compilerArtifact); return helper; } },
    './lib/evidence.mjs': { createEvidence() { return { captures, async capture(name, options) { assert.equal(options.windowId, 7); if (captureFailure) throw new Error('Actual producer refused capture'); captures.push({ name, state: options.state }); } }; } },
    './lib/appearance-provenance.mjs': { createPrivateAppearanceProvenance() { return {}; } },
    './lib/packaged-runtime-pair-artifact.mjs': { retainPackagedRuntimePair(admission) { assert.equal(admission.controlled, true); return pair; } },
  };
  const exports = {}; vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText,
    { exports, structuredClone, setTimeout, clearTimeout, require(name) { assert.ok(dependencies[name], name); return dependencies[name]; } });
  return { state, output, run: () => exports.capturePrivateHome({ admission: { controlled: true }, outputDir: output }), dispose: () => rmSync(directory, { recursive: true, force: true }) };
}
test('separate private observer records genuine owner-projected semantic states and never active runtime/qualification', async () => {
  const f = fixture(); try { const report = await f.run(); assert.equal(report.runtimeStatus, 'inactive-private'); assert.equal(report.qualification, 'none'); assert.equal('runtime' in report, false);
    assert.deepEqual(Array.from(report.captures, row => row.state), ['private-home-ready', 'private-home-search-focused']); assert.equal(f.state.focuses, 1); assert.equal(f.state.released, 1);
  } finally { f.dispose(); }
});
test('producer refusal retains original failure in diagnostic manifest and still reaps both original owners', async () => {
  const f = fixture({ captureFailure: true }); try { await assert.rejects(f.run(), /capture failed/); const report = JSON.parse(readFileSync(path.join(f.output, 'manifest.json')));
    assert.equal(report.error.message, 'Actual producer refused capture'); assert.equal(report.captures.length, 0); assert.equal(f.state.helperCloses, 1); assert.equal(f.state.browserCloses, 1); assert.equal(f.state.released, 1);
  } finally { f.dispose(); }
});
for (const debt of ['helperDebt', 'browserDebt']) test(`original ${debt} retains artifact and explicit quarantine`, async () => {
  const f = fixture({ [debt]: true }); try { await assert.rejects(f.run()); const report = JSON.parse(readFileSync(path.join(f.output, 'manifest.json')));
    assert.equal(report.cleanup.artifactRetained, true); assert.equal(report.cleanup.failures.length, 1); assert.equal(f.state.released, 0);
  } finally { f.dispose(); }
});
