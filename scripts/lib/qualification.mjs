import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import assert from 'node:assert/strict';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export function emptyQualification(previous) {
  if (previous.schema === 2) return previous;
  const gates = Object.fromEntries(Object.entries(previous).filter(([key, value]) => !key.startsWith('feature:') && value === 'passed'));
  return { schema: 2, gates, features: {} };
}

export function qualifiedFeatures(qualification, identity) {
  if (identity.dirty || qualification.schema !== 2) return [];
  return Object.entries(qualification.features)
    .filter(([, record]) => record.commit === identity.commit && record.productTree === identity.tree)
    .map(([feature]) => feature).sort();
}

/** Evidence paths must stay in their run directory, including through symlinks. */
export function evidenceBytes(root, path) {
  assert.equal(typeof path, 'string', 'Evidence path must be a string');
  const target = resolve(root, path);
  const canonicalRoot = realpathSync(root) + sep;
  assert.ok(realpathSync(target).startsWith(canonicalRoot), 'Evidence path escaped the run directory');
  assert.ok(lstatSync(target).isFile(), 'Evidence must be a regular file');
  return readFileSync(target);
}

export function validateJourneyManifest(manifest, { journey, identity, outputDir, moduleSha256, attended = false }) {
  assert.equal(identity.dirty, false, 'Dirty product identities cannot qualify');
  assert.equal(manifest.schema, 2, 'Journey manifest must use schema 2');
  assert.equal(manifest.id, journey.id, 'Journey identity mismatch');
  assert.deepEqual(manifest.features, journey.features, 'Journey feature coverage mismatch');
  assert.equal(manifest.moduleSha256, moduleSha256, 'Journey module changed');
  assert.deepEqual(manifest.productIdentity, identity, 'Manifest product identity mismatch');
  assert.ok(!manifest.error && !manifest.cleanupErrors?.length, 'Journey failed or could not clean up');
  assert.equal(manifest.native.sourceCommit, identity.label, 'Native product identity mismatch');
  assert.deepEqual(manifest.runtime, identity, 'Runtime product identity mismatch');
  assert.match(manifest.native.manifestHash, /^[a-f0-9]{64}$/, 'Missing native manifest digest');
  assert.ok(typeof manifest.native.buildId === 'string' && manifest.native.buildId.length, 'Missing native build identity');
  assert.match(manifest.shellDigest, /^[a-f0-9]{64}$/, 'Missing shell digest');
  assert.match(manifest.harnessCommit, /^[a-f0-9]{40}$/, 'Missing harness commit');
  assert.ok(Number.isInteger(manifest.attempt) && manifest.attempt >= 1, 'Missing attempt number');
  assert.ok(Number.isFinite(Date.parse(manifest.completedAt)), 'Missing completion timestamp');
  assert.ok(Array.isArray(manifest.steps) && manifest.steps.length, 'Journey has no evidence steps');
  assert.ok(manifest.steps.every(step => ['ui', 'rpc', 'operator'].includes(step.kind)), 'Journey has an unknown evidence kind');
  assert.ok(manifest.steps.every(step => step.status === 'passed'), 'Journey contains failed or incomplete steps');
  assert.ok(Array.isArray(manifest.captures) && manifest.captures.length, 'Journey has no captures');
  for (const capture of manifest.captures) {
    assert.match(capture.sha256, /^[a-f0-9]{64}$/);
    assert.equal(sha256(evidenceBytes(outputDir, capture.path)), capture.sha256, 'Capture hash mismatch');
  }
  const operatorSteps = manifest.steps.filter(step => step.kind === 'operator');
  assert.ok(!operatorSteps.length || (attended && journey.needs.includes('owner-presence')), 'Operator steps cannot qualify unattended');
  for (const feature of journey.features) {
    assert.ok(manifest.steps.some(step => step.kind === 'ui' && step.features?.includes(feature) &&
      Array.isArray(step.observations?.ax) && step.observations.ax.length > 0 &&
      step.observations.rpc !== undefined && step.observations.rpc !== null && step.inputs?.some(input =>
        input.status === 'passed' && ['press', 'click', 'focus', 'key', 'type', 'drag', 'scroll', 'menu', 'contextMenu', 'savePanel', 'openPanel'].includes(input.command) &&
        Number.isFinite(input.elapsedMs) && input.elapsedMs >= 0)), `No AX and native/RPC UI evidence for ${feature}`);
  }
  return manifest;
}

/** Records are assembled only from already validated manifests by qualify.mjs. */
export function featureRecord(identity, runs, carriedFrom) {
  assert.ok(runs.length, 'Qualification requires journey evidence');
  const first = runs[0].manifest;
  assert.ok(runs.every(run => run.manifest.native.buildId === first.native.buildId &&
    run.manifest.native.manifestHash === first.native.manifestHash &&
    run.manifest.shellDigest === first.shellDigest && run.manifest.harnessCommit === first.harnessCommit),
    'Qualification runs came from different builds');
  return {
    commit: identity.commit, productTree: identity.tree,
    ...(carriedFrom ? { carriedFrom } : {}),
    native: { buildId: first.native.buildId, manifestHash: first.native.manifestHash },
    shellDigest: first.shellDigest, harnessCommit: first.harnessCommit,
    qualifiedAt: new Date().toISOString(),
    journeys: runs.map(run => ({ id: run.manifest.id, moduleSha256: run.manifest.moduleSha256,
      manifest: run.path, manifestSha256: sha256(run.bytes), completedAt: run.manifest.completedAt,
      attempts: run.manifest.attempt })).sort((a, b) => a.id.localeCompare(b.id)),
  };
}

export function sortedQualification(value) {
  assert.equal(value.schema, 2);
  return { schema: 2,
    gates: Object.fromEntries(Object.entries(value.gates).sort(([a], [b]) => a.localeCompare(b))),
    features: Object.fromEntries(Object.entries(value.features).sort(([a], [b]) => a.localeCompare(b))),
  };
}
