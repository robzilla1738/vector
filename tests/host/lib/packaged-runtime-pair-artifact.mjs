import assert from 'node:assert/strict';
import { join } from 'node:path';
import { retainPackagedRuntimeFiles } from './packaged-runtime-files.mjs';
import { retainApprovedClosure } from './packaged-runtime-closure.mjs';
import { decodePackagedRuntimePair } from './packaged-runtime-pair-protocol.mjs';
import { retainNativeWindowCompiler } from './native-window-compiler-artifact.mjs';
import { readStartupMachO } from './startup-helper-manifest.mjs';
import { requireClosureFile, verifyShellResourceReadback } from './shell-resource-readback.mjs';
const admitted = new WeakSet();
const ref = value => ({ path: value.path, sha256: value.sha256 });
const freeze = value => {
  if (value && typeof value === 'object') { for (const child of Object.values(value)) freeze(child); Object.freeze(value); }
  return value;
};
/** Only the external integrator's approved manifest/root/helper audit hashes can
 * admit a complete retained pair. There is no compilation or approval fallback. */
export function retainPackagedRuntimePair(admission) {
  const files = retainPackagedRuntimeFiles(), closures = []; let helper, retired = false;
  const release = () => { if (retired) return; retired = true; helper?.release(); for (const lease of closures) lease.release(); files.release(); };
  try {
    const manifestRaw = files.read({ path: admission.manifestPath, sha256: admission.manifestSha256 }).toString('utf8');
    const auditRaw = files.read({ path: admission.auditPath, sha256: admission.auditSha256 }).toString('utf8');
    const decoded = decodePackagedRuntimePair(manifestRaw, auditRaw, admission), m = decoded.manifest;
    const retainRefs = value => {
      if (!value || typeof value !== 'object') return;
      if (typeof value.path === 'string' && typeof value.sha256 === 'string' && value.path.startsWith('/')) files.retain(ref(value));
      else for (const child of Object.values(value)) retainRefs(child);
    };
    retainRefs(m); retainRefs(decoded.audit);
    assert.equal(m.package.appClosure.root, m.package.appRoot);
    assert.equal(m.package.runtimeClosure.root, join(m.package.appRoot, m.package.runtimeRootRelative));
    for (const closure of [m.native.compiledClosure, m.package.appClosure, m.package.runtimeClosure, m.package.shellAssets.sourceInputClosure]) closures.push(retainApprovedClosure(closure));
    const prefix = m.package.runtimeRootRelative + '/';
    for (const row of m.package.runtimeClosure.rows) {
      const app = m.package.appClosure.rows.find(item => item.path === prefix + row.path);
      assert.deepEqual(app, { ...row, path: prefix + row.path }, 'Runtime closure differs from same App members');
    }
    for (const generated of m.native.generatedFiles) requireClosureFile(m.native.compiledClosure, generated);
    for (const [file, relative] of [[m.package.nodeFile, m.package.nodeRelative], [m.package.runtimeIdentityFile, m.package.runtimeIdentityRelative]]) {
      assert.equal(file.path, join(m.package.appRoot, relative)); requireClosureFile(m.package.appClosure, file);
    }
    requireClosureFile(m.package.runtimeClosure, m.package.runtimeIdentityFile);
    assert.deepEqual(JSON.parse(files.read(ref(m.package.runtimeIdentityFile)).toString('utf8')), m.source.productIdentity);
    helper = retainNativeWindowCompiler({ manifestPath: admission.helperManifestPath, manifestSha256: admission.helperManifestSha256,
      auditPath: admission.helperAuditPath, auditSha256: admission.helperAuditSha256 });
    for (const [declared, actual] of [[m.inputHelper.source, helper.decoded.manifest.source], [m.inputHelper.executable, helper.decoded.manifest.output]]) {
      assert.equal(declared.path, actual.path); assert.equal(declared.sha256, actual.sha256);
      assert.equal(declared.mode, actual.mode); assert.equal(declared.size, actual.bytes);
    }
    const shell = verifyShellResourceReadback(m, files);
    const binaryPath = join(m.package.appRoot, 'Contents/MacOS/Aux');
    const binaryRow = m.package.appClosure.rows.find(row => row.path === 'Contents/MacOS/Aux');
    assert.equal(binaryRow?.kind, 'regular', 'Missing fixed actual Aux executable');
    const binary = { path: binaryPath, sha256: binaryRow.sha256 };
    const image = Object.freeze(readStartupMachO(files.read(binary, 64 * 1024 * 1024))); assert.equal(image.architecture, 'arm64');
    const validate = () => {
      assert.equal(retired, false, 'Retired original packaged pair');
      shell.validate(); files.validate(); for (const closure of closures) closure.validate(); helper.validate();
    };
    validate();
    const lease = Object.freeze({ native: freeze(structuredClone(decoded.native)), productIdentity: freeze(structuredClone(m.source.productIdentity)),
      bundle: m.package.appRoot, runtimeStatus: 'inactive-private', shellDigest: shell.sourceDigest,
      image, compilerArtifact: helper, validate, release,
      artifact: freeze({ manifest: { path: admission.manifestPath, sha256: admission.manifestSha256 },
        audit: { path: admission.auditPath, sha256: admission.auditSha256 }, runtimeIdentityFile: { ...m.package.runtimeIdentityFile },
        runtimeIdentity: structuredClone(m.package.runtimeIdentity), resourceReadbackProof: { ...m.package.shellAssets.resourceReadbackProof } }),
      privateRuntimeActive: false, qualification: 'none' });
    admitted.add(lease); return lease;
  } catch (error) { release(); throw error; }
}
export function readPackagedRuntimePair(lease) {
  assert.ok(admitted.has(lease), 'Foreign packaged pair artifact'); lease.validate(); return lease;
}
