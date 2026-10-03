// Controlled source/protocol fixtures only; no helper, browser or native slot.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as utilityOwner from './lib/utility-appearance-owner.mjs';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { tmpdir } from 'node:os';
import vm from 'node:vm';
import ts from 'typescript';
import { PNG } from 'pngjs';
import { evidenceBytes } from '../../scripts/lib/qualification.mjs';
import { normalizePrivateWindowObservation, privateWindowPrefix } from './lib/private-window-observation.mjs';
import { isDeepStrictEqual } from 'node:util';
import { normalizeNativeAppearance, normalizePipAppearance, normalizeTrustedPreferences } from './lib/appearance-provenance.mjs';
import { fileURLToPath } from 'node:url';
import { EventEmitter } from 'node:events';
import { createPrivateObservationOwner } from './lib/private-observation-owner.mjs';
import { decodeWarmWindowHelperIdentity } from './lib/native-warm-helper-identity.mjs';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const source = fs.readFileSync(new URL('./lib/appearance-provenance.mjs', import.meta.url), 'utf8');
function fixture() {
  const directory = fs.mkdtempSync(path.join(tmpdir(), 'aux-controlled-private-proof-'));
  const helperSource = path.join(directory, 'native-window.swift'); fs.writeFileSync(helperSource, 'controlled, not Swift');
  const helperExecutable = path.join(directory, 'native-window-' + hash(fs.readFileSync(helperSource)).slice(0, 12)); fs.writeFileSync(helperExecutable, 'controlled, not executable');
  const candidate = { productIdentity: { commit: 'a'.repeat(40), tree: 'b'.repeat(40), label: 'a'.repeat(40), dirty: false },
    native: { sourceCommit: 'a'.repeat(40), buildId: '195+' + 'c'.repeat(64) + '+' + 'a'.repeat(40), manifestHash: 'c'.repeat(64) }, shellDigest: 'd'.repeat(64), harnessCommit: 'e'.repeat(40), moduleSha256: 'f'.repeat(64) };
  const state = { live: true, uuid: '1'.repeat(32), start: '123', ambiguous: false, observed: 0, closedDuringKernel: false };
  const app = {}, pair = { productIdentity: candidate.productIdentity, native: candidate.native, shellDigest: candidate.shellDigest, artifact: Object.freeze({ controlled: true }), image: { imageUuid: '1'.repeat(32) },
    compilerArtifact: { artifact: { imageUuid: '2'.repeat(32), binarySha256: hash(fs.readFileSync(helperExecutable)), sourceSha256: hash(fs.readFileSync(helperSource)) }, matchOriginalClient(helper) { assert.equal(helper.helperExecutable, helperExecutable); } },
    validate() { assert.ok(state.live, 'Retired original artifact'); } };
  const child = Object.assign(new EventEmitter(), { pid: 42, exitCode: null, signalCode: null });
  const observedOwner = createPrivateObservationOwner({ child, generation: 1, pair, stream: { dispose() {},
    async observe(selection) { state.observed++; const line = privateWindowPrefix + JSON.stringify({ producer: 'aux-native-private-window-observation', version: 1, native: { sourceCommit: candidate.native.sourceCommit, buildId: candidate.native.buildId }, runtimeStatus: 'inactive-private',
      appearance: { producer: 'aux-native-appearance-snapshot', version: 1, pid: 42, windowId: 7, windowKind: 'private', observedAtUnixMs: Date.now(), frame: { x: 0, y: 0, width: 100, height: 100 }, nativeTheme: 'dark', backing: null, material: null,
        shell: { theme: 'dark', layout: 'vertical', sidebarAppearance: 'solid', systemDark: true, reduceMotion: false, reduceTransparency: false } } }) + '\n';
      if (state.badRaw) return { native: pair.native, runtimeStatus: 'inactive-private', window: { pid: 42, windowKind: 'private' }, raw: {} };
      if (state.foreignRaw) return normalizePrivateWindowObservation(line.replace('"pid":42', '"pid":99'), { candidate, targetPid: 42, windowId: 7 });
      if (state.retireDuringObserve) child.exitCode = 1;
      return normalizePrivateWindowObservation(line, { candidate, targetPid: 42, windowId: selection.windowId, startedAt: selection.notBefore, completedAt: new Date().toISOString() });
    } } });
  const owner = { ...observedOwner, windowId: 7, candidate };
  const helper = { helperSource, helperExecutable, targetPid: 42, helperPid: 43,
    async request(op) { assert.equal(op, 'warmWindowIdentity'); if (state.closedDuringKernel) state.live = false;
      return { producer: 'aux-native-warm-window-identity', version: 1, targetPid: 42, helperPid: 43, targetProcessUuid: state.uuid, targetProcessStartMachTicks: state.start, helperProcessUuid: '2'.repeat(32), helperProcessStartMachTicks: '124' }; },
    async windows() { return [{ id: 7, layer: 0, x: 0, y: 0, width: 100, height: 100 }, ...(state.ambiguous ? [{ id: 8, layer: 0 }] : [])]; },
    async trusted() { return { accessibility: true, screenRecording: true, reduceMotion: false, reduceTransparency: false }; } };
  const imports = { './utility-appearance-owner.mjs': utilityOwner, 'node:assert/strict': { default: Object.assign((...args) => assert(...args), assert, { deepEqual: (a, b, message) => assert.deepEqual(structuredClone(a), structuredClone(b), message) }) }, 'node:crypto': crypto, 'node:fs': fs, 'node:path': path, pngjs: { PNG },
    '../../../scripts/lib/qualification.mjs': { evidenceBytes }, './app.mjs': { readPrivateAppObservation(value, artifact) { assert.equal(value, app); assert.equal(artifact, pair); pair.validate(); return owner; } },
    './packaged-runtime-pair-artifact.mjs': { readPackagedRuntimePair(value) { assert.equal(value, pair, 'Foreign artifact'); pair.validate(); return pair; } },
    './private-window-observation.mjs': { normalizePrivateWindowObservation }, './native-warm-helper-identity.mjs': { decodeWarmWindowHelperIdentity } };
  const exports = {}; vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
    { exports, Buffer, structuredClone, Date, require(name) { assert.ok(imports[name], name); return imports[name]; } });
  const create = (overrides = {}) => exports.createPrivateAppearanceProvenance({ outputDir: directory, app, admittedPair: pair, helper, ...overrides });
  const png = PNG.sync.write({ width: 1, height: 1, data: Buffer.from([0, 0, 0, 255]) }); fs.writeFileSync(path.join(directory, 'controlled.png'), png);
  const capture = { name: 'controlled', path: 'controlled.png', sha256: hash(png), bytes: png.length, windowId: 7 };
  return { directory, state, pair, app, create, capture, candidate, close: () => fs.rmSync(directory, { recursive: true, force: true }) };
}

function privateSheets(f, record, pins, { admitted = true, mutate = () => {} } = {}) {
  const put = (name, value) => { const bytes = Buffer.from(JSON.stringify(value)); fs.writeFileSync(path.join(f.directory, name), bytes); return { path: name, sha256: hash(bytes) }; };
  const manifest = { schema: 1, kind: 'aux-private-observation', runtimeStatus: 'inactive-private', qualification: 'none', features: ['electronMigration'], ...f.candidate,
    packagedRuntimeArtifact: f.pair.artifact, provenanceProducers: pins, captures: [record], steps: [{ status: 'passed' }] };
  mutate(manifest);
  const index = { schema: 2, candidate: { productIdentity: f.candidate.productIdentity, native: f.candidate.native, shellDigest: f.candidate.shellDigest, provenanceProducers: pins },
    features: [{ id: 'electronMigration', requiredStateInventory: put('states.json', { schema: 1, feature: 'electronMigration', states: ['privateHome-ready'] }),
      captures: [{ state: 'privateHome-ready', captureName: record.name, observationId: record.provenanceObservationId, provenance: record.provenance, manifest: put('manifest.json', manifest) }] }] };
  put('index.json', index);
  // Actual QA source with an explicitly controlled admission seam, not a real pair.
  const script = fs.readFileSync(new URL('../../scripts/design-qa.mjs', import.meta.url), 'utf8').replaceAll('import.meta.url', JSON.stringify(new URL('../../scripts/design-qa.mjs', import.meta.url).href)).replace(/\brequire\b/g, 'ensure');
  const dependencies = { 'node:crypto': crypto, 'node:fs': fs, 'node:path': path, 'node:url': { fileURLToPath },
    'node:util': { isDeepStrictEqual: (a, b) => isDeepStrictEqual(structuredClone(a), structuredClone(b)) }, pngjs: { PNG },
    '../tests/host/lib/packaged-runtime-pair-artifact.mjs': { retainPackagedRuntimePair(value) { assert.equal(value.controlled, true); return { ...f.pair, release() {} }; } },
    '../tests/host/lib/private-window-observation.mjs': { normalizePrivateWindowObservation }, '../tests/host/lib/native-warm-helper-identity.mjs': { decodeWarmWindowHelperIdentity },
    '../tests/host/lib/appearance-provenance.mjs': { normalizeNativeAppearance, normalizePipAppearance, normalizeTrustedPreferences } };
  const exports = {}; vm.runInNewContext(ts.transpileModule(script, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
    { exports, Buffer, structuredClone, process: { argv: [] }, require(name) { assert.ok(dependencies[name], name); return dependencies[name]; } });
  return exports.buildContactSheets(path.join(f.directory, 'index.json'), path.join(f.directory, 'sheets'), admitted ? { privateAdmission: { controlled: true } } : {}).features[0];
}
async function run(body) { const f = fixture(); try { await body(f); } finally { f.close(); } }
test('private proof retains original envelope/kernel brackets and inactive artifact, never an active runtime', () => run(async f => {
  const producer = f.create(), ticket = await producer.before(7);
  const record = await producer.finish(ticket, f.capture, { state: 'privateHome-ready', capturedAt: new Date().toISOString(), captureCompletedAt: new Date().toISOString() });
  const proof = JSON.parse(fs.readFileSync(path.join(f.directory, record.provenance.path)));
  assert.equal(proof.runtimeStatus, 'inactive-private'); assert.deepEqual(proof.packagedRuntimeArtifact, f.pair.artifact); assert.equal('runtime' in proof, false);
  const folder = path.dirname(path.join(f.directory, record.provenance.path));
  const window = JSON.parse(fs.readFileSync(path.join(folder, proof.observations[0].before.window.path)));
  assert.equal(window.backing, null); assert.equal(window.material, null);
  assert.ok(fs.readFileSync(path.join(folder, window.rawReply.path), 'utf8').startsWith(privateWindowPrefix));
  const kernel = JSON.parse(fs.readFileSync(path.join(folder, proof.observations[0].before.kernel.path))); assert.deepEqual(kernel.before, kernel.after);
  const sheet = privateSheets(f, record, producer.pins); assert.equal(sheet.records[0].cell, null); assert.ok(sheet.records[0].reasons.includes('Unknown actual native backing/material'));
  assert.throws(() => privateSheets(f, record, producer.pins, { admitted: false }), /externally admitted/);
  assert.throws(() => privateSheets(f, record, producer.pins, { mutate: m => { m.runtime = m.productIdentity; } }), /externally admitted/);
}));
test('unbranded App/pair and foreign helper target refuse before observation', () => run(f => {
  assert.throws(() => f.create({ app: {} })); assert.throws(() => f.create({ admittedPair: {} }), /Foreign artifact/); assert.equal(f.state.observed, 0);
}));
test('late original kernel generation change refuses capture completion', () => run(async f => {
  const producer = f.create(), ticket = await producer.before(7); f.state.start = '999';
  await assert.rejects(producer.finish(ticket, f.capture, { state: 'ready', capturedAt: new Date().toISOString(), captureCompletedAt: new Date().toISOString() }), /generation changed/);
  assert.equal(fs.existsSync(path.join(f.directory, '.appearance-controlled')), false);
}));
test('helper target image mismatch and retired owner during awaited kernel read refuse', () => run(async f => {
  f.state.uuid = '3'.repeat(32); await assert.rejects(f.create().before(7), /kernel image/);
  f.state.uuid = '1'.repeat(32); f.state.closedDuringKernel = true; await assert.rejects(f.create().before(7), /Retired/);
}));
test('additional layer-zero window cannot borrow private capture ownership', () => run(async f => {
  f.state.ambiguous = true; await assert.rejects(f.create().before(7), /sole original/);
}));

test('actual decoded owner receipt rejects missing raw bytes, foreign raw identity and exit during observation', () => run(async f => {
  f.state.badRaw = true; await assert.rejects(f.create().before(7), /original private observation bytes/);
  f.state.badRaw = false; f.state.foreignRaw = true; await assert.rejects(f.create().before(7), /PID|pid|identity|target/);
  f.state.foreignRaw = false; f.state.retireDuringObserve = true; await assert.rejects(f.create().before(7), /exited/);
}));
