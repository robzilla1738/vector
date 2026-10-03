// Synthetic schema/protocol controls. No compiler audit, bundle, helper or launch evidence.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { canonicalPairJson, decodePackagedRuntimePair, pairHash } from './lib/packaged-runtime-pair-protocol.mjs';
const schema = JSON.parse(readFileSync(new URL('./lib/packaged-runtime-pair.schema.json', import.meta.url), 'utf8'));
function example(rule, root) {
  if (rule.$ref) return example(root.$defs[rule.$ref.split('/').at(-1)], root);
  if (rule.allOf) return Object.assign({}, ...rule.allOf.map(member => example(member, root)));
  if (!rule.type && rule.properties) return Object.fromEntries(Object.entries(rule.properties).map(([key, member]) => [key, example(member, root)]));
  if (rule.oneOf) return example(rule.oneOf[0], root);
  if ('const' in rule) return structuredClone(rule.const);
  if (rule.enum) return rule.enum[0];
  if (rule.type === 'object') return Object.fromEntries(rule.required.map(key => [key, example(rule.properties[key], root)]));
  if (rule.type === 'array') return Array.from({ length: rule.minItems ?? 0 }, () => example(rule.items, root));
  if (rule.type === 'integer') return rule.minimum ?? 1;
  if (rule.pattern === '^[a-f0-9]{40}$') return 'a'.repeat(40);
  if (rule.pattern === '^[a-f0-9]{64}$') return 'b'.repeat(64);
  return rule.pattern === '^/' ? '/synthetic/file' : 'member';
}
function fixture() {
  const manifest = example(schema.manifestSchema, schema.manifestSchema), audit = example(schema.independentAuditSchema, schema.independentAuditSchema);
  manifest.source.productIdentity.label = manifest.source.productIdentity.commit;
  manifest.package.runtimeIdentity = structuredClone(manifest.source.productIdentity);
  manifest.native.buildId = '195+' + 'b'.repeat(64) + '+' + manifest.native.sourceCommit;
  manifest.native.compiledClosure.scope = 'compiled-deployment';
  manifest.native.graph.argv = ['nice', '-n', '10', 'autoninja', '-C', manifest.native.compiledClosure.root, ...manifest.native.graph.targets, '-j', '8', '-k', '0'];
  manifest.native.generatedFiles = Array.from({ length: 3 }, (_, index) => ({ ...example(schema.manifestSchema.$defs.regularFile, schema.manifestSchema), path: `/synthetic/generated/${index}` }));
  manifest.native.graph.children = [example(schema.manifestSchema.$defs.successfulChild, schema.manifestSchema)];
  manifest.package.stage.children = structuredClone(manifest.native.graph.children);
  for (const c of [manifest.native.compiledClosure, manifest.package.appClosure, manifest.package.runtimeClosure, manifest.package.shellAssets.sourceInputClosure]) c.inventorySha256 = pairHash(canonicalPairJson(c.rows));
  const admission = { manifestPath: '/synthetic/pair.json', manifestSha256: '', auditPath: '/synthetic/root-audit.json', auditSha256: '',
    helperManifestPath: manifest.inputHelper.compiledArtifactManifest.path, helperManifestSha256: manifest.inputHelper.compiledArtifactManifest.sha256,
    helperAuditPath: manifest.inputHelper.independentHelperAudit.path, helperAuditSha256: manifest.inputHelper.independentHelperAudit.sha256 };
  audit.manifest = { path: admission.manifestPath, sha256: '' };
  audit.originalPairProof = structuredClone(manifest.originalPairProof);
  audit.helperManifest = structuredClone(manifest.inputHelper.compiledArtifactManifest);
  audit.independentHelperAudit = structuredClone(manifest.inputHelper.independentHelperAudit);
  audit.actualSourceHead = manifest.source.head; audit.actualProductIdentity = structuredClone(manifest.source.productIdentity);
  audit.actualNativeBuildId = manifest.native.buildId; audit.actualNativeSourceCommit = manifest.native.sourceCommit;
  const encode = () => {
    const manifestRaw = canonicalPairJson(manifest) + '\n';
    admission.manifestSha256 = pairHash(manifestRaw); audit.manifest.sha256 = admission.manifestSha256;
    const auditRaw = canonicalPairJson(audit) + '\n'; admission.auditSha256 = pairHash(auditRaw);
    return [manifestRaw, auditRaw, admission];
  };
  return { manifest, audit, admission, encode };
}
test('separate approved-reference joins retain packaged/inactive semantics without a runtime handshake', () => {
  const f = fixture(), decoded = decodePackagedRuntimePair(...f.encode());
  assert.equal(decoded.runtimeStatus, 'inactive-private'); assert.equal('runtime' in decoded, false);
  assert.deepEqual(decoded.manifest.package.runtimeIdentity, decoded.manifest.source.productIdentity);
});
test('root audit mismatch, unsuccessful graph/cleanup and private runtime claims refuse', () => {
  for (const change of [f => { f.audit.actualNativeBuildId += 'foreign'; }, f => { f.audit.originalPairProof.sha256 = 'c'.repeat(64); },
    f => { f.manifest.native.graph.exitCode = 1; }, f => { f.manifest.package.stage.children = []; },
    f => { f.manifest.cleanup.cleanupDebt = 'unreaped'; }, f => { f.manifest.privateRuntimeActive = true; },
    f => { f.manifest.package.runtimeIdentity.commit = 'c'.repeat(40); }, f => { f.audit.checks.runtimeClosureComplete = false; },
    f => { f.manifest.inputHelper.compilerManifestProducer = 'aux-native-input-helper'; }]) {
    const f = fixture(); change(f); assert.throws(() => decodePackagedRuntimePair(...f.encode()));
  }
});
test('duplicate keys, foreign external hashes and mismatched or duplicate closure declarations refuse', () => {
  const f = fixture(), [manifestRaw, auditRaw, admission] = f.encode();
  const duplicate = manifestRaw.replace('"version":1', '"version":2,"version":1');
  assert.throws(() => decodePackagedRuntimePair(duplicate, auditRaw, { ...admission, manifestSha256: pairHash(duplicate) }));
  assert.throws(() => decodePackagedRuntimePair(manifestRaw, auditRaw, { ...admission, auditSha256: 'c'.repeat(64) }));
  for (const change of [x => { x.manifest.package.appClosure.rows.push(structuredClone(x.manifest.package.appClosure.rows[0])); },
    x => { x.manifest.package.appClosure.rows[0].path = '../foreign'; }, x => { x.manifest.native.generatedFiles = []; },
    x => { x.manifest.package.appClosure.inventorySha256 = 'c'.repeat(64); }]) {
    const x = fixture(); change(x); assert.throws(() => decodePackagedRuntimePair(...x.encode()));
  }
});

test('original ordered full graph and GRIT carrier declarations cannot be substituted', () => {
  for (const change of [f => { f.manifest.native.graph.targets.reverse(); },
    f => { f.manifest.native.graph.argv.pop(); },
    f => { f.manifest.native.graph.argv[5] = '/foreign/output'; },
    f => { f.manifest.package.shellAssets.deployedCarriers = []; },
    f => { delete f.manifest.package.shellAssets.resourceReadbackProof; },
    f => { f.manifest.package.shellAssets.files = f.manifest.package.shellAssets.sourceInputClosure; }]) {
    const f = fixture(); change(f); assert.throws(() => decodePackagedRuntimePair(...f.encode()));
  }
});
