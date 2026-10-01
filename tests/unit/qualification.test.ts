import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { emptyQualification, qualifiedFeatures, sha256, validateJourneyManifest } from '../../scripts/lib/qualification.mjs';

const identity = { commit: 'a'.repeat(40), tree: 'b'.repeat(40), dirty: false, label: 'a'.repeat(40) };
const journey = { id: 'split-view', features: ['splitView'], needs: ['accessibility', 'screen-recording'] };

it('keeps legacy gate results while requiring new evidence for feature records', () => {
  expect(emptyQualification({ 's3-submit-confirmation': 'passed', 'feature:splitView': 'a'.repeat(40) }))
    .toEqual({ schema: 2, gates: { 's3-submit-confirmation': 'passed' }, features: {} });
  const records = { schema: 2, gates: {}, features: {
    splitView: { commit: identity.commit, productTree: identity.tree },
    reader: { commit: 'c'.repeat(40), productTree: identity.tree },
  } };
  expect(qualifiedFeatures(records, identity)).toEqual(['splitView']);
  expect(qualifiedFeatures(records, { ...identity, dirty: true })).toEqual([]);
  expect(qualifiedFeatures(records, { ...identity, tree: 'd'.repeat(40) })).toEqual([]);
});

it('requires exact identities, passed UI proof and unmodified captures', () => {
  const outputDir = mkdtempSync(join(tmpdir(), 'aux-qualification-test-'));
  const capture = Buffer.from('fixture image');
  const manifest = { schema: 2, id: journey.id, features: journey.features, moduleSha256: 'c'.repeat(64), productIdentity: identity,
    native: { sourceCommit: identity.label, buildId: '154+fixture', manifestHash: 'd'.repeat(64) }, runtime: identity,
    shellDigest: 'e'.repeat(64), harnessCommit: 'f'.repeat(40), attempt: 1, completedAt: new Date().toISOString(),
    steps: [{ name: 'split', kind: 'ui', features: ['splitView'], status: 'passed', inputs: [{ command: 'click', status: 'passed', elapsedMs: 4 }], observations: { ax: [{ role: 'AXSplitter', name: 'Split' }], rpc: { panes: 2 } } }],
    captures: [{ path: 'capture.png', sha256: sha256(capture) }],
  };
  const validate = (value: unknown = manifest) => validateJourneyManifest(value, { journey, identity, outputDir, moduleSha256: manifest.moduleSha256 });
  try {
    writeFileSync(join(outputDir, 'capture.png'), capture);
    expect(validate()).toBe(manifest);
    expect(() => validate({ ...manifest, runtime: { ...identity, dirty: true } })).toThrow();
    expect(() => validate({ ...manifest, cleanupErrors: [{ name: 'app', error: 'fixture' }] })).toThrow(/clean up/);
    expect(() => validate({ ...manifest, error: 'fixture' })).toThrow(/failed/);
    expect(() => validate({ ...manifest, steps: [{ ...manifest.steps[0]!, kind: 'rpc' }] })).toThrow(/No AX/);
    expect(() => validate({ ...manifest, steps: [{ ...manifest.steps[0]!, inputs: [] }] })).toThrow(/No AX/);
    expect(() => validate({ ...manifest, steps: [{ ...manifest.steps[0]!, observations: { ax: [], rpc: { panes: 2 } } }] })).toThrow(/No AX/);
    expect(() => validate({ ...manifest, steps: [{ ...manifest.steps[0]!, observations: { ax: manifest.steps[0]!.observations.ax } }] })).toThrow(/No AX/);
    expect(() => validate({ ...manifest, steps: [{ ...manifest.steps[0]!, inputs: [{ command: 'hover', status: 'passed', elapsedMs: 2 }] }] })).toThrow(/No AX/);
    expect(() => validate({ ...manifest, steps: [{ ...manifest.steps[0]!, status: 'failed' }] })).toThrow(/failed/);
    expect(() => validate({ ...manifest, steps: [{ ...manifest.steps[0]!, kind: 'operator' }] })).toThrow(/Operator/);
    expect(() => validate({ ...manifest, moduleSha256: '0'.repeat(64) })).toThrow(/module changed/);
    expect(() => validate({ ...manifest, captures: [{ path: '../escape.png', sha256: manifest.captures[0]!.sha256 }] })).toThrow();
    writeFileSync(join(outputDir, 'capture.png'), 'changed');
    expect(() => validate()).toThrow(/Capture hash/);
  } finally { rmSync(outputDir, { recursive: true, force: true }); }
});
