import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { signingChanges, signingSequence, verifyPostSigningClaims, developmentSnapshot, validateDevelopmentSigningPlan } from './execute-development-signing.mjs';
const proposal = JSON.parse(fs.readFileSync(new URL('../../docs/integration/proposed/development-dp-signing/proposal.json', import.meta.url)));
test('partial signing failure retains attempted/verified boundary and never proceeds to later hosts', () => {
  const targets = ['inner', 'daemon', 'outer'].map(path => ({ path })), seen = [], receipts = [];
  const result = signingSequence(targets, { before: s => seen.push('check:' + s.path), sign: s => { seen.push('sign:' + s.path); if (s.path === 'daemon') throw Error('codesign-command-failed'); }, after: s => ({ path: s.path, verified: true }), persist: s => receipts.push(structuredClone(s)) });
  assert.equal(result.complete, false); assert.equal(result.signingAttempted, true);
  assert.deepEqual(result.attempted, ['inner', 'daemon']); assert.equal(result.verified.length, 1);
  assert.equal(result.error.code, 'codesign-command-failed'); assert.ok(!seen.some(s => s.includes('outer')));
  assert.equal(receipts.at(-1).signingAttempted, true); assert.equal(receipts.at(-1).complete, false);
  const before = signingSequence(targets, { before: () => { throw Error('full-package-prehash-mismatch'); }, sign: () => assert.fail('No signing allowed'), after: () => assert.fail(), persist: () => {} });
  assert.equal(before.signingAttempted, false); assert.equal(before.attempted.length, 0);
});
test('allowed signing deltas exclude original bindings/profiles/resources, mode changes and disappearing code', () => {
  const target = { path: 'Aux.app', kind: 'bundle', codeRelative: 'Aux.app/Contents/MacOS/Aux' };
  const before = [{ path: target.codeRelative, sha256: 'a', mode: 493 }, { path: 'Aux.app/Contents/Resources/provided-native.node', sha256: 'original', mode: 493 }, { path: 'Aux.app/Contents/embedded.provisionprofile', sha256: 'profile', mode: 384 }];
  const after = structuredClone(before); after[0].sha256 = 'signed'; after.push({ path: 'Aux.app/Contents/_CodeSignature/CodeResources', sha256: 'seal', mode: 420 });
  assert.equal(signingChanges(before, after, [target]).length, 2);
  for (const mutate of [a => a[1].sha256 = 're-signed-original', a => a[2].sha256 = 'changed-profile', a => a[0].mode = 420, a => a.shift(), a => a.push({ path: 'Aux.app/Contents/Resources/new-file', sha256: 'extra', mode: 420 })]) { const bad = structuredClone(after); mutate(bad); assert.throws(() => signingChanges(before, bad, [target])); }
});
test('actual post-sign leaf fingerprint, OU/Team, exact capabilities and signer mode are all required', () => {
  const step = { signer: 'development', preserveRuntime: true, capabilities: { values: proposal.proposedDpHosts[0].proposedEntitlements } };
  const observation = { flags: ['runtime'], entitlements: step.capabilities.values }, metadata = { team: proposal.identityInspection.teamId }, leaf = { sha1: proposal.identityInspection.publicCertificateSha1, team: proposal.identityInspection.teamId };
  verifyPostSigningClaims(step, observation, metadata, leaf, proposal);
  assert.throws(() => verifyPostSigningClaims(step, observation, metadata, { ...leaf, sha1: '0'.repeat(40) }, proposal));
  assert.throws(() => verifyPostSigningClaims(step, observation, { team: 'OTHER' }, leaf, proposal));
  assert.throws(() => verifyPostSigningClaims(step, { ...observation, flags: ['adhoc', 'runtime'] }, metadata, leaf, proposal));
  assert.throws(() => verifyPostSigningClaims(step, { ...observation, entitlements: {} }, metadata, leaf, proposal));
  assert.throws(() => validateDevelopmentSigningPlan({ targets: [] }, proposal));
});
test('small disposable snapshots refuse hardlinked code and include untargeted content changes', () => {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'aux-sign-snapshot-fixture-')));
  try { fs.writeFileSync(path.join(dir, 'code'), 'authored code fixture', { mode: 0o700 }); const initial = developmentSnapshot(dir); fs.writeFileSync(path.join(dir, 'resource'), 'authored resource fixture', { mode: 0o600 }); assert.notDeepEqual(developmentSnapshot(dir), initial); fs.linkSync(path.join(dir, 'code'), path.join(dir, 'linked')); assert.throws(() => developmentSnapshot(dir)); }
  finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
