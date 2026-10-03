// Controlled in-memory documentary/closure providers. These controls exercise
// the actual retainer joins; they do not admit a native/compiler artifact.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { requireClosureFile } from './lib/shell-resource-readback.mjs';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const source = readFileSync(new URL('./lib/packaged-runtime-pair-artifact.mjs', import.meta.url), 'utf8');
function fixture() {
  const documents = new Map(), state = { fileValidations: 0, closureValidations: 0, helperValidations: 0, released: 0, live: true, refuseReadback: false };
  const put = (filename, value) => { const bytes = Buffer.from(value); documents.set(filename, bytes); return { path: filename, sha256: hash(bytes), size: bytes.length, mode: 0o600 }; };
  const product = { commit: 'a'.repeat(40), tree: 'b'.repeat(40), label: 'a'.repeat(40), dirty: false };
  const runtimeIdentityFile = put('/controlled/Aux.app/Contents/Resources/aux-runtime/aux-runtime-identity.json', JSON.stringify(product));
  const binary = put('/controlled/Aux.app/Contents/MacOS/Aux', 'controlled Mach-O input'), nodeFile = put('/controlled/Aux.app/Contents/Resources/aux-runtime/node', 'controlled node');
  const closure = (root, refs) => ({ root, rows: refs.map(ref => ({ kind: 'regular', path: ref.path.slice(root.length + 1), sha256: ref.sha256, size: ref.size, mode: ref.mode })) });
  const inputSource = put('/controlled/native-window.swift', 'controlled source'), inputExecutable = put('/controlled/native-window-executable', 'controlled executable');
  const generated = put('/controlled/build/generated.h', 'controlled compiled identity');
  const manifestRef = put('/controlled/manifest', 'controlled original manifest'), auditRef = put('/controlled/audit', 'controlled original root audit');
  const manifest = { source: { productIdentity: product }, native: { generatedFiles: [generated], compiledClosure: closure('/controlled/build', [generated]) },
    package: { appRoot: '/controlled/Aux.app', runtimeRootRelative: 'Contents/Resources/aux-runtime', appClosure: closure('/controlled/Aux.app', [runtimeIdentityFile, binary, nodeFile]),
      runtimeClosure: closure('/controlled/Aux.app/Contents/Resources/aux-runtime', [runtimeIdentityFile, nodeFile]), runtimeIdentityFile, runtimeIdentity: product, runtimeIdentityRelative: 'Contents/Resources/aux-runtime/aux-runtime-identity.json',
      nodeFile, nodeRelative: 'Contents/Resources/aux-runtime/node', shellAssets: { sourceInputClosure: closure('/controlled/source', []), resourceReadbackProof: put('/controlled/readback', 'controlled retained resource proof') } },
    inputHelper: { source: inputSource, executable: inputExecutable } };
  const native = { buildId: '195+' + 'c'.repeat(64) + '+' + 'a'.repeat(40), sourceCommit: product.commit, manifestHash: 'c'.repeat(64) };
  const admission = { manifestPath: manifestRef.path, manifestSha256: manifestRef.sha256, auditPath: auditRef.path, auditSha256: auditRef.sha256,
    helperManifestPath: '/controlled/helper-manifest', helperManifestSha256: 'd'.repeat(64), helperAuditPath: '/controlled/helper-audit', helperAuditSha256: 'e'.repeat(64) };
  const validate = () => assert.equal(state.live, true, 'Original held bytes replaced');
  const refs = { read(ref) { validate(); const bytes = documents.get(ref.path); assert.ok(bytes); assert.equal(hash(bytes), ref.sha256); return Buffer.from(bytes); },
    retain(ref) { this.read(ref); }, validate() { state.fileValidations++; validate(); }, release() { state.released++; } };
  const helper = { decoded: { manifest: { source: { ...inputSource, bytes: inputSource.size }, output: { ...inputExecutable, bytes: inputExecutable.size } } }, artifact: {},
    validate() { state.helperValidations++; validate(); }, release() { state.released++; } };
  const dependencies = { 'node:assert/strict': Object.assign((...args) => assert(...args), assert, { deepEqual: (a, b, message) => assert.deepEqual(structuredClone(a), structuredClone(b), message) }), 'node:path': path,
    './packaged-runtime-files.mjs': { retainPackagedRuntimeFiles: () => refs }, './packaged-runtime-closure.mjs': { retainApprovedClosure: () => ({ validate() { state.closureValidations++; validate(); }, release() { state.released++; } }) },
    './packaged-runtime-pair-protocol.mjs': { decodePackagedRuntimePair(raw, audit, supplied) { assert.equal(raw, 'controlled original manifest'); assert.equal(audit, 'controlled original root audit'); assert.equal(supplied, admission); return { manifest, audit: {}, native }; } },
    './native-window-compiler-artifact.mjs': { retainNativeWindowCompiler(supplied) { assert.equal(supplied.auditSha256, admission.helperAuditSha256); return helper; } },
    './startup-helper-manifest.mjs': { readStartupMachO(bytes) { assert.equal(bytes.toString(), 'controlled Mach-O input'); return { architecture: 'arm64', imageUuid: '1'.repeat(32) }; } },
    './shell-resource-readback.mjs': { requireClosureFile, verifyShellResourceReadback() { if (state.refuseReadback) throw new Error('Actual175 carrier inclusion refused'); return { sourceDigest: 'f'.repeat(64), validate() {} }; } } };
  const exports = {}; vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText,
    { exports, structuredClone, require(name) { assert.ok(dependencies[name], name); return dependencies[name]; } });
  return { state, manifest, open: () => exports.retainPackagedRuntimePair(admission), read: exports.readPackagedRuntimePair };
}
test('actual join keeps all four closures/helper/compiled image and separate inactive runtime artifact immutable', () => {
  const f = fixture(), lease = f.open(); try {
    assert.equal(f.read(lease), lease); assert.equal(lease.runtimeStatus, 'inactive-private'); assert.equal(lease.qualification, 'none'); assert.equal('runtime' in lease, false);
    assert.ok(f.state.closureValidations >= 4 && f.state.helperValidations > 0);
    assert.throws(() => { lease.image.imageUuid = '2'.repeat(32); }, TypeError);
    assert.throws(() => { lease.productIdentity.commit = '0'.repeat(40); }, TypeError);
    assert.throws(() => f.read({ ...lease }), /Foreign packaged/);
    f.state.live = false; assert.throws(() => f.read(lease), /replaced/);
  } finally { lease.release(); } assert.equal(f.state.released, 6);
});
test('runtime App membership drift and independent carrier refusal release every partial original lease', () => {
  const f = fixture(); f.manifest.package.runtimeClosure.rows[0].sha256 = '0'.repeat(64); assert.throws(f.open, /Runtime closure differs/); assert.equal(f.state.released, 5);
  const g = fixture(); g.state.refuseReadback = true; assert.throws(g.open, /inclusion refused/); assert.equal(g.state.released, 6);
});
