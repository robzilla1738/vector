import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const schemas = JSON.parse(readFileSync(new URL('./packaged-runtime-pair.schema.json', import.meta.url), 'utf8'));
export const pairHash = value => createHash('sha256').update(value).digest('hex');
const compare = (a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b));
export function canonicalPairJson(value) {
  const sort = item => {
    if (Array.isArray(item)) return item.map(sort);
    if (item && typeof item === 'object') return Object.fromEntries(Object.keys(item).sort(compare).map(key => [key, sort(item[key])]));
    return item;
  };
  return JSON.stringify(sort(value));
}
function validate(value, rule, root, depth = 0) {
  assert.ok(depth < 32, 'Pair schema depth limit');
  assert.ok(rule && typeof rule === 'object', 'Missing closed schema rule');
  if (Array.isArray(rule.type)) {
    let matches = 0;
    for (const type of rule.type) { try { validate(value, { ...rule, type }, root, depth + 1); matches++; } catch {} }
    assert.equal(matches, 1, 'Invalid schema union member'); return;
  }
  if (rule.$ref) return validate(value, root.$defs[rule.$ref.split('/').at(-1)], root, depth + 1);
  if (rule.allOf) { for (const member of rule.allOf) validate(value, member, root, depth + 1); return; }
  if (!rule.type && rule.properties) { for (const [key, member] of Object.entries(rule.properties)) if (Object.hasOwn(value, key)) validate(value[key], member, root, depth + 1); return; }
  if (rule.oneOf) {
    let matches = 0;
    for (const option of rule.oneOf) { try { validate(value, option, root, depth + 1); matches++; } catch {} }
    assert.equal(matches, 1, 'Invalid closed pair row'); return;
  }
  if ('const' in rule) assert.deepEqual(value, rule.const);
  if (rule.enum) assert.ok(rule.enum.includes(value), 'Unknown pair scope');
  if (rule.type === 'object') {
    assert.ok(value && typeof value === 'object' && !Array.isArray(value));
    for (const key of rule.required ?? []) assert.ok(Object.hasOwn(value, key), `Missing pair ${key}`);
    if (rule.additionalProperties === false) for (const key of Object.keys(value)) assert.ok(Object.hasOwn(rule.properties, key), `Unexpected pair ${key}`);
    for (const [key, member] of Object.entries(value)) validate(member, rule.properties?.[key] ?? rule.additionalProperties, root, depth + 1);
  } else if (rule.type === 'array') {
    assert.ok(Array.isArray(value) && value.length >= (rule.minItems ?? 0) && value.length <= Math.min(rule.maxItems ?? 100000, 100000));
    if (rule.uniqueItems) assert.equal(new Set(value.map(canonicalPairJson)).size, value.length, 'Duplicate pair array member');
    for (const item of value) validate(item, rule.items, root, depth + 1);
  } else if (rule.type === 'string') {
    assert.ok(typeof value === 'string' && value.length >= (rule.minLength ?? 0) && Buffer.byteLength(value) <= 16384 && !value.includes('\0'));
    if (rule.pattern) assert.match(value, new RegExp(rule.pattern));
  } else if (rule.type === 'boolean') {
    assert.equal(typeof value, 'boolean');
  } else if (rule.type === 'null') {
    assert.equal(value, null);
  } else if (rule.type === 'integer') {
    assert.ok(Number.isSafeInteger(value) && value >= (rule.minimum ?? Number.MIN_SAFE_INTEGER) && value <= (rule.maximum ?? Number.MAX_SAFE_INTEGER));
  }
}
export function decodeCanonicalPairDocument(raw, schema) {
  assert.ok(typeof raw === 'string' && Buffer.byteLength(raw) <= 32 * 1024 * 1024);
  const value = JSON.parse(raw);
  assert.equal(raw, canonicalPairJson(value) + '\n', 'Noncanonical or duplicate pair fields');
  validate(value, schema, schema); return value;
}
function reference(actual, path, sha256) { assert.deepEqual(actual, { path, sha256 }, 'Foreign original pair reference'); }
/** External approved hashes are independent inputs. No manifest self-approval,
 * private runtime handshake, process launch or qualification is inferred. */
export function decodePackagedRuntimePair(manifestRaw, auditRaw, admission) {
  validate(admission, schemas.externalAdmissionArguments, schemas.externalAdmissionArguments);
  assert.equal(pairHash(manifestRaw), admission.manifestSha256); assert.equal(pairHash(auditRaw), admission.auditSha256);
  const manifest = decodeCanonicalPairDocument(manifestRaw, schemas.manifestSchema), audit = decodeCanonicalPairDocument(auditRaw, schemas.independentAuditSchema);
  reference(audit.manifest, admission.manifestPath, admission.manifestSha256);
  assert.deepEqual(audit.originalPairProof, manifest.originalPairProof);
  reference(manifest.inputHelper.compiledArtifactManifest, admission.helperManifestPath, admission.helperManifestSha256);
  reference(manifest.inputHelper.independentHelperAudit, admission.helperAuditPath, admission.helperAuditSha256);
  assert.deepEqual(audit.helperManifest, manifest.inputHelper.compiledArtifactManifest);
  assert.deepEqual(audit.independentHelperAudit, manifest.inputHelper.independentHelperAudit);
  const product = manifest.source.productIdentity;
  assert.equal(product.label, product.commit); assert.deepEqual(manifest.package.runtimeIdentity, product);
  assert.equal(manifest.native.sourceCommit, product.commit);
  assert.deepEqual(audit.actualProductIdentity, product); assert.equal(audit.actualSourceHead, manifest.source.head);
  assert.equal(audit.actualNativeBuildId, manifest.native.buildId); assert.equal(audit.actualNativeSourceCommit, manifest.native.sourceCommit);
  const build = manifest.native.buildId.split('+');
  assert.equal(build.length, 3); assert.ok(build[0].length > 0); assert.match(build[1], /^[a-f0-9]{64}$/); assert.equal(build[2], product.commit);
  for (const closure of [manifest.native.compiledClosure, manifest.package.appClosure, manifest.package.runtimeClosure, manifest.package.shellAssets.sourceInputClosure]) {
    assert.equal(closure.inventorySha256, pairHash(canonicalPairJson(closure.rows)));
    const paths = closure.rows.map(row => row.path);
    assert.equal(new Set(paths).size, paths.length, 'Duplicate closure path');
    assert.deepEqual(paths, [...paths].sort(compare), 'Closure is not in UTF-8 byte order');
  }
  assert.equal(manifest.native.compiledClosure.scope, 'compiled-deployment');
  for (const closure of [manifest.package.appClosure, manifest.package.runtimeClosure, manifest.package.shellAssets.sourceInputClosure]) assert.equal(closure.scope, 'complete-tree');
  assert.equal(new Set(manifest.native.generatedFiles.map(row => row.path)).size, manifest.native.generatedFiles.length, 'Duplicate generated identity files');
  assert.ok(manifest.native.generatedFiles.length > 0, 'Missing original compiled generated identity files');
  assert.deepEqual(manifest.native.graph.argv, ['nice', '-n', '10', 'autoninja', '-C', manifest.native.compiledClosure.root, ...manifest.native.graph.targets, '-j', '8', '-k', '0'], 'Foreign original full-graph invocation');
  assert.ok(manifest.native.graph.children.length > 0, 'Missing original successful graph children');
  assert.ok(manifest.package.stage.children.length > 0, 'Missing original runtime stage children');
  return { manifest, audit, native: { buildId: manifest.native.buildId, sourceCommit: manifest.native.sourceCommit, manifestHash: build[1] }, runtimeStatus: 'inactive-private' };
}
