import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { validateAuthenticatedProfile } from './authenticate-development-profile.mjs';
const proposal = JSON.parse(fs.readFileSync(new URL('../../docs/integration/proposed/development-dp-signing/proposal.json', import.meta.url)));
test('pure joining gate rejects untrusted CMS, changed bytes, weaker policy and mismatched profile without authorizing signing', () => {
  const p = structuredClone(proposal), der = Buffer.from('authored-public-certificate-fixture');
  p.identityInspection.publicCertificateSha1 = createHash('sha1').update(der).digest('hex');
  const host = p.proposedDpHosts[0], team = p.identityInspection.teamId, bytes = Buffer.from('NOT A REAL CMS PROFILE');
  const reply = { version: 1, authenticated: true, offline: true, positiveRevocationRequired: true, policy: 'AppleOSXProvisioningProfileSigning', signingAuthorized: false, cmsSha256: createHash('sha256').update(bytes).digest('hex'), payloadSha256: 'a'.repeat(64), profile: {
    TeamIdentifier: [team], ApplicationIdentifierPrefix: [team], Platform: ['OSX'], CreationDate: '2026-10-01T00:00:00Z', ExpirationDate: '2026-11-01T00:00:00Z', ProvisionedDevices: ['FIXTURE-MAC'], DeveloperCertificates: [der.toString('base64')], Entitlements: { 'com.apple.application-identifier': team + '.' + host.bundleIdentifier, 'com.apple.developer.team-identifier': team, 'keychain-access-groups': [p.proposedFirstAndOnlySharedGroup] }
  } };
  const options = { now: '2026-10-19T00:00:00Z', testMacIdentifier: 'FIXTURE-MAC' };
  const result = validateAuthenticatedProfile(reply, bytes, host, p, options);
  assert.equal(result.signingAuthorized, false); assert.equal(result.metadataClaimsMatch, true);
  for (const change of [r => r.authenticated = false, r => r.offline = false, r => r.positiveRevocationRequired = false, r => r.policy = 'BasicX509', r => r.cmsSha256 = '0'.repeat(64), r => r.profile.Entitlements['keychain-access-groups'] = ['OTHER']]) {
    const bad = structuredClone(reply); change(bad);
    assert.throws(() => validateAuthenticatedProfile(bad, bytes, host, p, options));
  }
  assert.throws(() => validateAuthenticatedProfile(reply, Buffer.from('changed'), host, p, options));
  // This is deliberately only a JS boundary fixture, never real CMS evidence.
});
