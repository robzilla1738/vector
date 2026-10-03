// Controlled in-memory source/replay/carrier originals. No graph, controller,
// extraction, helper, native pair admission or presentation proof is executed.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { canonicalPairJson, pairHash } from './lib/packaged-runtime-pair-protocol.mjs';
import { readShellResourceIndex } from './lib/shell-resource-index.mjs';
import vm from 'node:vm';
import ts from 'typescript';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as protocol from './lib/packaged-runtime-pair-protocol.mjs';
import * as carrier from './lib/shell-resource-carrier.mjs';
const body = readFileSync(new URL('./lib/shell-resource-readback.mjs', import.meta.url), 'utf8').replaceAll('import.meta.url', JSON.stringify(new URL('./lib/shell-resource-readback.mjs', import.meta.url).href));
const imports = { 'node:assert/strict': { default: Object.assign((...args) => assert(...args), assert, { deepEqual: (a, b, message) => assert.deepEqual(structuredClone(a), structuredClone(b), message) }) }, 'node:fs': fs, 'node:path': path,
  './packaged-runtime-pair-protocol.mjs': protocol, './shell-resource-carrier.mjs': carrier, './shell-resource-index.mjs': { readShellResourceIndex },
  // The full resolution implementation has separate filesystem/lifecycle
  // controls. These cases isolate actual 175-row wrapper/PAK joins.
  './shell-resolution-provenance.mjs': { verifyOriginalResolutionClosure() { return () => {}; } } };
const exported = {}; vm.runInNewContext(ts.transpileModule(body, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
  { exports: exported, Buffer, URL, require(name) { assert.ok(imports[name], name); return imports[name]; } });
const { verifyShellResourceReadback } = exported;
const proofSchema = JSON.parse(readFileSync(new URL('./lib/shell-resource-readback.schema.json', import.meta.url)));
const importSchema = JSON.parse(readFileSync(new URL('./lib/shell-import-input-closure.schema.json', import.meta.url)));
const replaySchema = JSON.parse(readFileSync(new URL('./lib/shell-action-replay.schema.json', import.meta.url)));
function fixture({ alias = false } = {}) {
  const documents = new Map();
  const put = (path, value) => { const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value); documents.set(path, bytes); return { path, sha256: pairHash(bytes) }; };
  const generic = put('/synthetic/evidence', 'controlled original evidence');
  function example(rule, schema) {
    if (rule.$ref) return rule.$ref.endsWith('/reference') ? { ...generic } : example(schema.$defs[rule.$ref.split('/').at(-1)], schema);
    if ('const' in rule) return structuredClone(rule.const);
    if (rule.enum) return rule.enum[0];
    if (Array.isArray(rule.type)) return rule.type.includes('null') ? null : 'controlled';
    if (rule.type === 'object') return Object.fromEntries((rule.required ?? []).map(key => [key, example(rule.properties[key], schema)]));
    if (rule.type === 'array') return Array.from({ length: rule.minItems ?? 0 }, () => example(rule.items, schema));
    if (rule.type === 'boolean') return false;
    if (rule.type === 'integer') return rule.minimum ?? 0;
    if (rule.pattern === '^[a-f0-9]{40}$') return 'a'.repeat(40);
    if (rule.pattern === '^[a-f0-9]{64}$') return 'b'.repeat(64);
    if (rule.pattern?.includes('fresh-empty-pycache')) return '/synthetic/probe/fresh-empty-pycache';
    return rule.pattern === '^/' ? '/synthetic/unused' : 'controlled';
  }
  const originals = Array.from({ length: 175 }, (_, index) => {
    const path = `asset-${String(index).padStart(3, '0')}.js`, bytes = Buffer.from(`controlled input ${alias && index === 174 ? 0 : index}`);
    return { path, bytes, name: `IDR_AUX_ASSET_${index}`, id: index + 1, input: put('/synthetic/source/' + path, bytes) };
  });
  const files = originals.map(row => ({ path: row.path, bytes: row.bytes.length, sha256: row.input.sha256 }));
  const source = { kind: 'aux-webui-shell-v1', files, sha256: pairHash(files.map(row => `${row.path}\t${row.bytes}\t${row.sha256}\n`).join('')) };
  const sourceRef = put('/synthetic/source/manifest.json', JSON.stringify(source));
  const grd = put('/synthetic/build/resources.grd', '<grit><includes>\n' + originals.map(row => `<include name="${row.name}" file="${row.input.path}" resource_path="${row.path}" use_base_dir="false" type="chrome_html" />`).join('\n') + '\n</includes></grit>');
  const header = put('/synthetic/build/resources.h', originals.map(row => `#define ${row.name} ${row.id}`).join('\n'));
  const map = put('/synthetic/build/map.cc', 'const webui::ResourcePath kAuxResources[175] = {\n' + originals.map(row => `  {"${row.path}", ${row.name}},`).join('\n') + '\n};');
  const selected = readShellResourceIndex(documents.get(grd.path).toString(), documents.get(header.path).toString(), documents.get(map.path).toString());
  const compressed = originals.map(row => gzipSync(row.bytes));
  const count = alias ? 174 : 175, start = 12 + ((count + 1) * 6) + (alias ? 4 : 0);
  const pak = Buffer.alloc(start + compressed.slice(0, count).reduce((sum, bytes) => sum + bytes.length, 0));
  pak.writeUInt32LE(5); pak.writeUInt16LE(count, 8); pak.writeUInt16LE(alias ? 1 : 0, 10); let offset = start;
  for (let index = 0; index < count; index++) { pak.writeUInt16LE(index + 1, 12 + index * 6); pak.writeUInt32LE(offset, 14 + index * 6); compressed[index].copy(pak, offset); offset += compressed[index].length; }
  pak.writeUInt32LE(offset, 14 + count * 6);
  if (alias) { pak.writeUInt16LE(175, 12 + (count + 1) * 6); pak.writeUInt16LE(0, 14 + (count + 1) * 6); }
  const buildPak = put('/synthetic/build/aux.pak', pak), deployedPak = put('/synthetic/Aux.app/carrier.pak', pak);
  const closure = (root, refs) => ({ root, rows: refs.map(reference => ({ kind: 'regular', path: reference.path.slice(root.length + 1), sha256: reference.sha256, size: documents.get(reference.path).length, mode: 0o600 })) });
  const proof = example(proofSchema, proofSchema), replay = example(replaySchema, replaySchema);
  Object.assign(proof, { pinnedManifest: sourceRef, dimensionAwareDigest: source.sha256, generatedGrd: grd, generatedHeader: header, generatedResourceMap: map, originalBuildPak: buildPak, deployedCarriers: [deployedPak], expectedReplayPak: put('/synthetic/scratch/expected.pak', pak), failures: [], passed: true });
  Object.assign(replay, { originalSourceManifest: sourceRef, originalGeneratedGrd: grd, originalGeneratedHeader: header, originalGeneratedResourceMap: map, originalSuccessfulGraphProof: proof.originalGraphProof,
    ownedScratchRoot: '/synthetic/scratch', failures: [], passed: true, exitCode: 0 });
  const imports = example(importSchema, importSchema);
  proof.originalGritAction.argv = Array.from({ length: 101 }, (_, i) => `controlled-arg-${i}`);
  imports.sourceCommit = proof.sourceCommit; imports.originalArgv = [...proof.originalGritAction.argv];
  proof.originalImportInputClosureProof = put('/synthetic/imports.json', canonicalPairJson(imports) + '\n');
  replay.originalImportInputClosureProof = proof.originalImportInputClosureProof;
  replay.originalGritAction.argv = [...proof.originalGritAction.argv]; replay.originalGritAction.responseFiles = [];
  replay.rows = []; proof.rows = [];
  for (let index = 0; index < 175; index++) {
    const original = originals[index], expected = put(`/synthetic/scratch/${index}.transformed`, original.bytes), stored = put(`/synthetic/scratch/${index}.stored`, compressed[index]);
    const r = example(replaySchema.properties.rows.items, replaySchema);
    Object.assign(r, { resourcePath: original.path, resourceName: original.name, resourceId: original.id,
      originalSourceInput: original.input, originalSourceInputSize: original.bytes.length, actualGritNodeType: 'chrome_html', actualTransformStages: ['original-input-read', 'chrome-html-gather', 'gzip-compress'],
      originalSelectedIncludeEvidence: put(`/synthetic/include/${index}`, canonicalPairJson({ element: selected[index].element, rawAttributes: selected[index].rawAttributes, effectiveAttributes: selected[index].selectedInclude, originalGeneratedGrd: grd }) + '\n'),
      expectedTransformedArtifact: expected, expectedTransformedSize: original.bytes.length, expectedTransformedSha256: expected.sha256,
      expectedStoredArtifact: stored, expectedStoredSize: compressed[index].length, expectedStoredSha256: stored.sha256,
      sourceEqualsExpectedTransformed: true, failures: [] }); replay.rows.push(r);
    const payload = reference => ({ artifact: reference, resourceId: original.id, aliasOf: alias && index === 174 ? 1 : null, storedSize: compressed[index].length, storedSha256: stored.sha256,
      compression: 'gzip', decodedSize: original.bytes.length, decodedSha256: expected.sha256, decodedEvidence: expected });
    const p = example(proofSchema.properties.rows.items, proofSchema);
    Object.assign(p, { resourcePath: original.path, resourceName: original.name, resourceId: original.id, sourceInput: original.input, sourceInputSize: original.bytes.length,
      selectedInclude: structuredClone(selected[index].selectedInclude), originalBuildPayload: payload(buildPak), deployedPayloads: [payload(deployedPak)],
      storedPayloadsEqual: true, decodedPayloadsEqual: true, expectedTransformedPayloadEqual: true, failures: [] });
    Object.assign(p.transform, { kind: 'original-action-transform', expectedTransformedArtifact: expected, expectedTransformedSize: original.bytes.length,
      expectedTransformedSha256: expected.sha256, sourceEqualityProved: true }); proof.rows.push(p);
  }
  const manifest = { source: { productIdentity: { commit: proof.sourceCommit } }, native: { graph: { terminalProof: proof.originalGraphProof }, compiledClosure: closure('/synthetic/build', [grd, header, map, buildPak]) },
    package: { appRoot: '/synthetic/Aux.app', appClosure: closure('/synthetic/Aux.app', [deployedPak]), shellAssets: { sourceInputClosure: closure('/synthetic/source', [sourceRef, ...originals.map(row => row.input)]),
      pinnedManifest: sourceRef, dimensionAwareDigest: source.sha256, generatedResourceMap: map, generatedPak: buildPak, deployedCarriers: [deployedPak] } } };
  proof.finishedUtc = '2026-10-03T12:00:00.000Z';
  proof.decodedTotalBytes = originals.slice(0, count).reduce((sum, row) => sum + row.bytes.length, 0);
  proof.carrierDecodedTotals = [proof.decodedTotalBytes, proof.decodedTotalBytes];
  const encode = () => {
    const replayRef = put('/synthetic/replay.json', canonicalPairJson(replay) + '\n');
    for (const row of proof.rows) row.transform.actionEvidence = replayRef;
    manifest.package.shellAssets.resourceReadbackProof = put('/synthetic/readback.json', canonicalPairJson(proof) + '\n');
  };
  const reader = { read(reference) { const bytes = documents.get(reference.path); assert.ok(bytes); assert.equal(pairHash(bytes), reference.sha256); return Buffer.from(bytes); },
    retain(reference) { this.read(reference); }, validate() {} };
  return { manifest, proof, replay, encode, reader };
}
test('joins all175 original inputs, independent expected outputs and actual stored/deployed resource bytes', () => {
  const f = fixture(); f.encode(); assert.equal(verifyShellResourceReadback(f.manifest, f.reader).resources, 175);
});
test('summary booleans cannot replace actual byte, identity, input-set or independent-output joins', () => {
  for (const change of [f => { f.proof.rows[0].originalBuildPayload.storedSha256 = 'a'.repeat(64); },
    f => { f.proof.rows[0].resourceId = f.proof.rows[1].resourceId; },
    f => { f.replay.inputOrigin = 'decoded-carrier'; },
    f => { f.replay.rows[0].expectedTransformedArtifact = f.proof.deployedCarriers[0]; f.proof.rows[0].transform.expectedTransformedArtifact = f.proof.deployedCarriers[0]; },
    f => { f.proof.rows[0].sourceInputSize++; }, f => { f.replay.rows[0].sourceEqualsExpectedTransformed = false; },
    f => { f.replay.originalSourceManifest.sha256 = 'a'.repeat(64); },
    f => { f.proof.rows[0].selectedInclude.type = 'BINDATA'; },
    f => { f.proof.carrierDecodedTotals[1]--; }]) {
    const f = fixture(); change(f); f.encode(); assert.throws(() => verifyShellResourceReadback(f.manifest, f.reader));
  }
});

test('actual producer-shaped selected wrapper and independent expected PAK count aliases once', () => {
  const f = fixture({ alias: true }); f.encode(); assert.equal(verifyShellResourceReadback(f.manifest, f.reader).resources, 175);
  f.proof.decodedTotalBytes += f.proof.rows[174].sourceInputSize; f.encode(); assert.throws(() => verifyShellResourceReadback(f.manifest, f.reader), /aggregate/);
});
test('expected PAK cannot borrow a compared carrier or escape owned replay output', () => {
  for (const select of [f => f.proof.originalBuildPak, f => f.proof.deployedCarriers[0]]) {
    const f = fixture(); f.proof.expectedReplayPak = select(f); f.encode(); assert.throws(() => verifyShellResourceReadback(f.manifest, f.reader), /independent replay/);
  }
});
