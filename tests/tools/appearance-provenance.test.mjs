// Synthetic protocol/tool fixtures only: these are not native appearance evidence.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import { createAppearanceProvenance, normalizeNativeAppearance } from '../host/lib/appearance-provenance.mjs';
import { buildContactSheets } from '../../scripts/design-qa.mjs';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const candidate = {
  productIdentity: { commit: 'a'.repeat(40), tree: 'b'.repeat(40), label: 'a'.repeat(40), dirty: false },
  native: { sourceCommit: 'a'.repeat(40), buildId: 'synthetic', manifestHash: 'c'.repeat(64) },
  shellDigest: 'd'.repeat(64), harnessCommit: 'e'.repeat(40), moduleSha256: 'f'.repeat(64),
};
function raw() {
  return { producer: 'aux-native-appearance-snapshot', version: 1, pid: 42, windowId: 7, windowKind: 'normal',
    observedAtUnixMs: Date.now(), frame: { x: 10, y: 20, width: 100, height: 100 }, nativeTheme: 'dark', backing: 'solid', material: 'solid',
    shell: { theme: 'dark', layout: 'vertical', sidebarAppearance: 'solid', systemDark: true, reduceMotion: false, reduceTransparency: false } };
}
function fixture() {
  const directory = mkdtempSync(join(tmpdir(), 'aux-synthetic-appearance-'));
  const source = join(directory, 'native-window.swift'); writeFileSync(source, '// synthetic helper source');
  const executable = join(directory, `native-window-${hash(readFileSync(source)).slice(0, 12)}`); writeFileSync(executable, 'synthetic helper bytes, not executable');
  const state = { native: raw, identity: () => ({ native: candidate.native, runtime: candidate.productIdentity }),
    preferences: () => ({ accessibility: true, screenRecording: true, reduceMotion: false, reduceTransparency: false }),
    windows: () => [{ id: 7, layer: 0, x: 10, y: 20, width: 100, height: 100 }] };
  const options = { outputDir: directory, candidate, targetPid: 42, helperSource: source, helperExecutable: executable,
    helper: { trusted: async () => state.preferences(), windows: async () => state.windows() },
    observeWindow: async ({ windowId, notBefore }) => { assert.equal(windowId, 7); assert.ok(Number.isFinite(Date.parse(notBefore))); return JSON.stringify(state.native()); }, readIdentity: async () => state.identity() };
  const png = PNG.sync.write({ width: 1, height: 1, data: Buffer.from([255, 255, 255, 255]) });
  writeFileSync(join(directory, 'synthetic.png'), png);
  const capture = { name: 'synthetic', path: 'synthetic.png', sha256: hash(png), bytes: png.length, windowId: 7 };
  return { directory, source, executable, state, options, capture, close: () => rmSync(directory, { recursive: true, force: true }) };
}
async function run(body) { const f = fixture(); try { await body(f); } finally { f.close(); } }
function sheets(f, record, pins) {
  const put = (file, value) => { const bytes = Buffer.from(JSON.stringify(value)); writeFileSync(join(f.directory, file), bytes); return { path: file, sha256: hash(bytes) }; };
  const manifest = put('manifest.json', { schema: 2, features: ['sample'], ...candidate, runtime: candidate.productIdentity,
    provenanceProducers: pins, captures: [record], steps: [{ status: 'passed' }] });
  const index = { schema: 2, candidate: { productIdentity: candidate.productIdentity, native: candidate.native, shellDigest: candidate.shellDigest, provenanceProducers: pins },
    features: [{ id: 'sample', requiredStateInventory: put('states.json', { schema: 1, feature: 'sample', states: ['default'] }),
      captures: [{ state: 'default', captureName: record.name, observationId: record.provenanceObservationId, provenance: record.provenance, manifest }] }] };
  put('index.json', index);
  return buildContactSheets(join(f.directory, 'index.json'), join(f.directory, 'sheets')).features[0];
}
test('synthetic raw native time is normalized, originals stay exact, generated pairing passes QA', () => run(async f => {
  const producer = createAppearanceProvenance(f.options), before = await producer.before(7);
  const original = readFileSync(join(f.directory, 'synthetic.png'));
  const record = await producer.finish(before, f.capture, { state: 'default', capturedAt: new Date().toISOString(), captureCompletedAt: new Date().toISOString() });
  const proof = JSON.parse(readFileSync(join(f.directory, record.provenance.path)));
  const window = JSON.parse(readFileSync(join(f.directory, '.appearance-synthetic', proof.observations[0].before.window.path)));
  const reply = JSON.parse(readFileSync(join(f.directory, '.appearance-synthetic', window.rawReply.path)));
  assert.equal(window.observedAt, new Date(reply.observedAtUnixMs).toISOString());
  assert.deepEqual(readFileSync(join(f.directory, 'synthetic.png')), original);
  assert.equal(sheets(f, record, producer.pins).records[0].cell, 'D');
  await assert.rejects(() => producer.finish(before, f.capture, { state: 'default', capturedAt: new Date().toISOString(), captureCompletedAt: new Date().toISOString() }), /unconsumed/);
}));
test('missing real shell invocation refuses instead of using RPC/settings/debug fallback', () => run(f => {
  assert.throws(() => createAppearanceProvenance({ ...f.options, observeWindow: undefined }), /producer access/);
  assert.equal(readdirSync(f.directory).some(name => name.startsWith('.appearance')), false);
}));
for (const [name, change, message] of [
  ['wrong PID', r => { r.pid = 43; }, /PID/], ['wrong window', r => { r.windowId = 8; }, /window mismatch/],
  ['unsupported PiP', r => { r.windowKind = 'picture-in-picture'; }, /Unsupported/],
  ['stale native reply', r => { r.observedAtUnixMs -= 60_000; }, /Stale/],
  ['missing applied theme', r => { delete r.nativeTheme; }, /native theme/],
  ['caller appearance label', r => { r.cell = 'D'; }, /Unexpected native/],
]) test(`${name} cannot emit a counted capture`, () => run(async f => {
  f.state.native = () => { const r = raw(); change(r); return r; };
  const producer = createAppearanceProvenance(f.options);
  await assert.rejects(() => producer.before(7), message);
  assert.equal(existsSync(join(f.directory, '.appearance-synthetic')), false);
}));
test('helper permissions and native/runtime identity changes refuse', () => run(async f => {
  const producer = createAppearanceProvenance(f.options);
  f.state.preferences = () => ({ accessibility: false, screenRecording: true, reduceMotion: false, reduceTransparency: false });
  await assert.rejects(() => producer.before(7), /permissions/);
  f.state.identity = () => ({ native: candidate.native, runtime: { ...candidate.productIdentity, commit: '9'.repeat(40) } });
  await assert.rejects(() => producer.before(7), /runtime identity/);
}));
test('helper/native geometry and producer file tampering refuse', () => run(async f => {
  const producer = createAppearanceProvenance(f.options);
  f.state.windows = () => [{ id: 7, layer: 0, x: 10, y: 20, width: 101, height: 100 }];
  await assert.rejects(() => producer.before(7), /point frame/);
  writeFileSync(f.executable, 'changed helper');
  await assert.rejects(() => producer.before(7), /executable changed/);
}));
test('unknown actual native material/theme stays unknown and never counts', () => run(async f => {
  f.state.native = () => ({ ...raw(), nativeTheme: null, backing: null, material: null });
  const producer = createAppearanceProvenance(f.options), before = await producer.before(7);
  const record = await producer.finish(before, f.capture, { state: 'default', capturedAt: new Date().toISOString(), captureCompletedAt: new Date().toISOString() });
  assert.equal(sheets(f, record, producer.pins).records[0].cell, null);
}));
test('changed actual OS preference remains diagnostic in paired QA', () => run(async f => {
  const producer = createAppearanceProvenance(f.options), before = await producer.before(7), capturedAt = new Date().toISOString();
  f.state.preferences = () => ({ accessibility: true, screenRecording: true, reduceMotion: false, reduceTransparency: true });
  const record = await producer.finish(before, f.capture, { state: 'default', capturedAt, captureCompletedAt: capturedAt });
  assert.equal(sheets(f, record, producer.pins).cells, 0);
}));
test('forged before ticket and changed original PNG refuse before provenance writing', () => run(async f => {
  const producer = createAppearanceProvenance(f.options);
  await assert.rejects(() => producer.finish({ windowId: 7 }, f.capture, { state: 'default', capturedAt: new Date().toISOString(), captureCompletedAt: new Date().toISOString() }), /unconsumed/);
  const before = await producer.before(7); writeFileSync(join(f.directory, 'synthetic.png'), 'not original');
  await assert.rejects(() => producer.finish(before, f.capture, { state: 'default', capturedAt: new Date().toISOString(), captureCompletedAt: new Date().toISOString() }), /digest/);
  assert.equal(existsSync(join(f.directory, '.appearance-synthetic')), false);
}));
test('normalizer rejects timestamp outside actual native request boundaries', () => {
  const r = raw();
  assert.throws(() => normalizeNativeAppearance(JSON.stringify(r), { candidate, targetPid: 42, windowId: 7,
    startedAt: new Date(r.observedAtUnixMs + 1).toISOString(), completedAt: new Date(r.observedAtUnixMs + 2).toISOString() }), /unbracketed/);
});
