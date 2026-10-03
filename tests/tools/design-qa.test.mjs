// Synthetic tool-contract fixtures only. No native qualification or appearance evidence.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { PNG } from 'pngjs';
import { buildContactSheets } from '../../scripts/design-qa.mjs';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function fixture(change = () => {}) {
  const root = mkdtempSync(join(tmpdir(), 'aux-synthetic-design-qa-'));
  const json = (name, value) => { const bytes = Buffer.from(JSON.stringify(value)); writeFileSync(join(root, name), bytes); return { path: name, sha256: hash(bytes) }; };
  const productIdentity = { commit: 'a'.repeat(40), tree: 'b'.repeat(40), label: 'a'.repeat(40), dirty: false };
  const candidate = { productIdentity, native: { sourceCommit: productIdentity.commit, buildId: 'synthetic-test', manifestHash: 'c'.repeat(64) }, shellDigest: 'd'.repeat(64) };
  const paired = { ...candidate, harnessCommit: 'e'.repeat(40), moduleSha256: 'f'.repeat(64) };
  const png = PNG.sync.write({ width: 1, height: 1, data: Buffer.from([255, 255, 255, 255]) });
  writeFileSync(join(root, 'synthetic.png'), png);
  const capture = { name: 'synthetic', path: 'synthetic.png', sha256: hash(png), bytes: png.length, windowId: 1, state: 'default', provenanceObservationId: 'one', capturedAt: '2026-10-01T12:00:01Z', captureCompletedAt: '2026-10-01T12:00:01Z', pixelDimensions: { width: 1, height: 1 }, windowFrame: { x: 0, y: 0, width: 1, height: 1 } };
  const system = observedAt => ({ producer: 'native-window.trusted', observedAt, candidate: paired, windowId: 1, pid: 42, helperSha256: '1'.repeat(64), helperSourceSha256: '2'.repeat(64), accessibility: true, screenRecording: true, reduceMotion: false, reduceTransparency: false });
  const window = observedAt => ({ producer: 'aux-native-appearance-snapshot', version: 1, observedAt, candidate: paired, windowId: 1, pid: 42, windowKind: 'normal', frame: capture.windowFrame, nativeTheme: 'dark', backing: 'solid', material: 'solid', shell: { theme: 'dark', layout: 'vertical', sidebarAppearance: 'solid', systemDark: true, reduceMotion: false, reduceTransparency: false } });
  const before = { system: system('2026-10-01T12:00:00Z'), window: window('2026-10-01T12:00:00Z') };
  const after = { system: system('2026-10-01T12:00:02Z'), window: window('2026-10-01T12:00:02Z') };
  const manifest = { schema: 2, id: 'synthetic-tool-test', features: ['sample'], productIdentity, native: candidate.native, runtime: structuredClone(productIdentity), shellDigest: candidate.shellDigest, harnessCommit: paired.harnessCommit, moduleSha256: paired.moduleSha256, steps: [{ status: 'passed' }], captures: [capture] };
  const entry = { state: 'default', captureName: 'synthetic', observationId: 'one' };
  const inventory = { schema: 1, feature: 'sample', states: ['default'] };
  change({ before, after, manifest, capture, entry, candidate, inventory });
  for (const [name, side] of [['before', before], ['after', after]]) {
    const observed = Date.parse(side.window.observedAt);
    const rawWindow = Object.fromEntries(Object.entries(side.window).filter(([key]) => !['observedAt', 'candidate'].includes(key)));
    rawWindow.observedAtUnixMs = observed;
    side.window.rawReply = json(`${name}-native-raw.json`, rawWindow);
    side.window.requestStartedAt = new Date(observed - 1).toISOString();
    side.window.requestCompletedAt = new Date(observed + 1).toISOString();
    side.window.observedAt = new Date(observed).toISOString();
    side.system.rawReply = json(`${name}-helper-raw.json`, Object.fromEntries(['accessibility', 'screenRecording', 'reduceMotion', 'reduceTransparency'].map(key => [key, side.system[key]])));
  }
  const observation = { id: 'one', capture: structuredClone(capture), before: { system: json('before-system.json', before.system), window: json('before-window.json', before.window) }, after: { system: json('after-system.json', after.system), window: json('after-window.json', after.window) } };
  entry.provenance = capture.provenance = json('provenance.json', { schema: 1, candidate: paired, observations: [observation] });
  manifest.provenanceProducers = { helperSha256: '1'.repeat(64), helperSourceSha256: '2'.repeat(64), nativeSnapshotVersion: 1 };
  entry.manifest = json('manifest.json', manifest);
  const index = { schema: 2, candidate: { ...candidate, provenanceProducers: manifest.provenanceProducers }, features: [{ id: 'sample', requiredStateInventory: json('states.json', inventory), captures: [entry] }] };
  const input = join(root, 'index.json'), output = join(root, 'sheets'); writeFileSync(input, JSON.stringify(index));
  return { root, input, output, index, save: () => writeFileSync(input, JSON.stringify(index)) };
}
function run(change, check) {
  const f = fixture(change);
  try { check(f); } finally { rmSync(f.root, { recursive: true, force: true }); }
}
test('synthetic matching producers derive D and retain remaining missing cells', () => run(undefined, f => {
  const result = buildContactSheets(f.input, f.output).features[0];
  assert.equal(result.cells, 1); assert.equal(result.records[0].cell, 'D'); assert.deepEqual(result.missing, ['L:default', 'LR:default', 'DR:default']);
  assert.match(readFileSync(join(f.output, 'sample.html'), 'utf8'), /width="1" height="1"/);
  assert.equal(result.visualApproval, 'pending reviewer inspection');
}));
test('actual RT mapping derives LR without caller label', () => run(({ before, after }) => {
  for (const side of [before, after]) { side.system.reduceTransparency = true; side.window.nativeTheme = side.window.shell.theme = 'light'; side.window.shell.reduceTransparency = true; }
}, f => assert.equal(buildContactSheets(f.input, f.output).features[0].records[0].cell, 'LR')));
for (const [name, change] of [
  ['unknown theme', ({ before, after }) => { before.window.nativeTheme = after.window.nativeTheme = null; }],
  ['changed RT', ({ after }) => { after.system.reduceTransparency = true; }],
  ['Aux/native mismatch', ({ before }) => { before.window.shell.theme = 'light'; }],
]) test(`${name} is diagnostic and never counts`, () => run(change, f => {
  const result = buildContactSheets(f.input, f.output).features[0]; assert.equal(result.cells, 0); assert.equal(result.records[0].cell, null); assert.equal(result.missing.length, 4);
}));
for (const [name, change] of [
  ['unknown RT', ({ before }) => { before.system.reduceTransparency = null; }],
  ['missing shell readback', ({ before }) => { delete before.window.shell; }],
  ['unpaired runtime', ({ manifest }) => { manifest.runtime.commit = '9'.repeat(40); }],
  ['wrong helper pin', ({ before }) => { before.system.helperSha256 = '3'.repeat(64); }],
  ['wrong window', ({ before }) => { before.window.windowId = 2; }],
  ['wrong frozen identity', ({ manifest }) => { manifest.shellDigest = '9'.repeat(64); }],
  ['changed geometry', ({ after }) => { after.window.frame = { x: 0, y: 0, width: 2, height: 1 }; }],
  ['not bracketed', ({ after }) => { after.system.observedAt = '2026-10-01T11:59:59Z'; }],
  ['caller label', ({ entry }) => { entry.cell = 'L'; }],
  ['unknown state', ({ entry }) => { entry.state = 'omitted-state'; }],
  ['wrong bytes', ({ capture }) => { capture.bytes += 1; }],
  ['wrong PNG dimension', ({ capture }) => { capture.pixelDimensions.width = 2; }],
]) test(`${name} refuses before writing output`, () => run(change, f => {
  assert.throws(() => buildContactSheets(f.input, f.output)); assert.equal(existsSync(f.output), false);
}));
test('missing provenance and free text cannot count historical native screenshots', () => run(undefined, f => {
  delete f.index.features[0].captures[0].provenance; f.save(); assert.throws(() => buildContactSheets(f.input, f.output), /provenance/);
}));
test('altered observation artifact refuses even when cell looks plausible', () => run(undefined, f => {
  writeFileSync(join(f.root, 'before-window.json'), '{}'); assert.throws(() => buildContactSheets(f.input, f.output), /digest/);
}));
test('failed journey preserves diagnostic functional status', () => run(({ manifest }) => { manifest.error = 'later setup failure'; }, f => {
  assert.equal(buildContactSheets(f.input, f.output).features[0].records[0].functionalStatus, 'failed diagnostic');
}));

test('corrupt PNG with plausible header refuses decoding', () => run(undefined, f => {
  const path = join(f.root, 'synthetic.png'); const bytes = readFileSync(path); bytes[bytes.length - 1] ^= 1; writeFileSync(path, bytes);
  // Preserve manifest/provenance equality while replacing the original bytes/hash.
  const manifest = JSON.parse(readFileSync(join(f.root, 'manifest.json'))); manifest.captures[0].sha256 = hash(bytes);
  const provenance = JSON.parse(readFileSync(join(f.root, 'provenance.json'))); provenance.observations[0].capture.sha256 = hash(bytes);
  const put = (name, value) => { const data = Buffer.from(JSON.stringify(value)); writeFileSync(join(f.root, name), data); return hash(data); };
  manifest.captures[0].provenance.sha256 = put('provenance.json', provenance);
  f.index.features[0].captures[0].provenance.sha256 = manifest.captures[0].provenance.sha256;
  f.index.features[0].captures[0].manifest.sha256 = put('manifest.json', manifest); f.save();
  assert.throws(() => buildContactSheets(f.input, f.output));
}));

const utilityOwner = () => ({ producer: 'aux-native-utility-appearance-owner', version: 1, windowId: 1, browserWindowId: '12', windowKind: 'normal', shellDocumentToken: 'A'.repeat(32), pages: [{ pageId: 'p_fixture', documentToken: 'B'.repeat(32), selected: true }] });
test('actual producer-shaped stable utility ownership remains bound to the original capture', () => run(({ before, after }) => {
  before.window.utilityOwnership = utilityOwner(); after.window.utilityOwnership = utilityOwner();
}, f => assert.equal(buildContactSheets(f.input, f.output).features[0].records[0].cell, 'D')));
for (const [name, change] of [
  ['shell document', owner => { owner.shellDocumentToken = 'C'.repeat(32); }],
  ['selected guest document', owner => { owner.pages[0].documentToken = 'C'.repeat(32); }],
  ['native BWI', owner => { owner.browserWindowId = '13'; }],
  ['OS window', owner => { owner.windowId = 2; }],
]) test(`changed utility ${name} refuses appearance contribution`, () => run(({ before, after }) => {
  before.window.utilityOwnership = utilityOwner(); after.window.utilityOwnership = utilityOwner(); change(after.window.utilityOwnership);
}, f => assert.throws(() => buildContactSheets(f.input, f.output))));
for (const missing of [false, true]) test(`unknown utility ownership ${missing ? 'missing' : 'null'} never contributes a cell`, () => run(({ before, after }) => {
  before.window.utilityOwnership = null;
  if (!missing) after.window.utilityOwnership = null;
}, f => {
  const result = buildContactSheets(f.input, f.output).features[0]; assert.equal(result.cells, 0); assert.equal(result.records[0].cell, null);
}));
