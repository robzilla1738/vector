import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { developmentTargets, orderedDevelopmentTargets, developmentCapabilities, checkProfileReport } from './plan-development-dp.mjs';
const proposal = JSON.parse(fs.readFileSync(new URL('../../docs/integration/proposed/development-dp-signing/proposal.json', import.meta.url)));
const sha = text => createHash('sha256').update(text).digest('hex');
test('exact 8+3 topology preserves SEA main/wrapper split and signs inside out', () => {
  const ordered = orderedDevelopmentTargets(developmentTargets);
  assert.equal(ordered.at(-1).path, 'Aux.app');
  assert.equal(ordered.filter(t => t.signer === 'adhoc').length, 8);
  const cli = ordered.find(t => t.role === 'cli-sea'), wrapper = ordered.find(t => t.emptyCapabilities);
  assert.equal(cli.kind, 'bundle'); assert.equal(cli.executable, 'Contents/MacOS/aux-cli-sea');
  assert.ok(ordered.indexOf(wrapper) < ordered.indexOf(cli));
  assert.ok(ordered.findIndex(t => t.path.endsWith('.appex')) < ordered.findIndex(t => t.path.endsWith('Aux Password Importer.app')));
  assert.equal(ordered.find(t => t.role === 'carrier').executable, 'Contents/MacOS/aux-native-carrier');
  for (const targets of [developmentTargets.slice(1), [...developmentTargets, developmentTargets[0]], developmentTargets.map(t => t.role === 'carrier' ? { ...t, signer: 'adhoc' } : t)]) assert.throws(() => orderedDevelopmentTargets(targets));
});
test('original supplied host capabilities are checked exhaustively, replacing only reviewed identity/group', () => {
  const def = developmentTargets.find(d => d.role === 'cli-sea'), cap = ['com.apple.security.cs.allow-jit', 'com.apple.security.cs.allow-unsigned-executable-memory', 'com.apple.security.cs.disable-library-validation'];
  const observation = { sha256: 'a'.repeat(64), flags: ['runtime'], entitlements: { ...Object.fromEntries(cap.map(k => [k, true])), 'com.apple.application-identifier': '8CPD4K4TBB.at.studio.AsideBrowser.cli', 'com.apple.developer.team-identifier': '8CPD4K4TBB', 'keychain-access-groups': ['8CPD4K4TBB.at.studio.AsideBrowser.cryptography'] } };
  const policy = developmentCapabilities(def, observation, proposal);
  assert.deepEqual(policy.values['keychain-access-groups'], [proposal.proposedFirstAndOnlySharedGroup]);
  assert.equal(policy.values['com.apple.security.cs.allow-dyld-environment-variables'], true);
  assert.equal(policy.preserveKeys.length, 3); assert.equal(policy.removeKeys.length, 3);
  assert.throws(() => developmentCapabilities(def, { ...observation, entitlements: { ...observation.entitlements, 'unreviewed': true } }, proposal));
  const changed = structuredClone(proposal); changed.proposedDpHosts.find(h => h.role === 'cli-sea').proposedEntitlements['arbitrary-capability'] = true;
  assert.throws(() => developmentCapabilities(def, observation, changed));
});
test('pure CMS receipt joining refuses stale/device/profile/group-proposal mismatches; no report can authorize execution', () => {
  const expected = { now: '2026-10-19T00:00:00Z', role: 'daemon', cmsSha256: 'b'.repeat(64), proposalSha256: 'c'.repeat(64), testMacIdentifier: 'AUTHORED-FIXTURE-MAC' };
  const report = { version: 1, cmsSignatureVerified: true, appleProvisioningPolicyVerified: true, offlinePositiveRevocationVerified: true, metadataClaimsMatch: true, signingAuthorized: false, cmsSha256: expected.cmsSha256, proposalSha256: expected.proposalSha256, role: expected.role, evaluatedAt: expected.now, reviewedDeviceSha256: sha(expected.testMacIdentifier), profileCreationDate: '2026-10-01T00:00:00Z', profileExpirationDate: '2026-11-01T00:00:00Z' };
  checkProfileReport(report, expected);
  for (const change of [r => r.evaluatedAt = 'invalid', r => r.evaluatedAt = '2026-10-18T00:00:00Z', r => r.profileExpirationDate = '2026-10-18T00:00:00Z', r => r.reviewedDeviceSha256 = '0'.repeat(64), r => r.cmsSha256 = '0'.repeat(64), r => r.proposalSha256 = '0'.repeat(64), r => r.signingAuthorized = true]) { const bad = structuredClone(report); change(bad); assert.throws(() => checkProfileReport(bad, expected)); }
});
