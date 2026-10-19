import { test } from 'node:test';
import assert from 'node:assert/strict';
import { policyForSigningTarget, providedSigningTargets } from './provided-signing-policy.mjs';
const sha256 = 'a'.repeat(64), team = '8CPD4K4TBB';
const cs = ['com.apple.security.cs.allow-jit', 'com.apple.security.cs.allow-unsigned-executable-memory', 'com.apple.security.cs.disable-library-validation'];
const booleans = keys => Object.fromEntries(keys.map(key => [key, true]));
const ids = suffix => ({ 'com.apple.application-identifier': `${team}.at.studio.AsideBrowser.${suffix}`, 'com.apple.developer.team-identifier': team, 'keychain-access-groups': [`${team}.at.studio.AsideBrowser.cryptography`] });
const daemon = providedSigningTargets.find(t => t.path.endsWith('/apps/daemon/Aux Daemon.app')).path;
const cliSea = providedSigningTargets.find(t => t.path.endsWith('/aux-cli-sea')).path;
const guard = providedSigningTargets.find(t => t.path.endsWith('/aux-native-guard.node')).path;
const sea = { sha256, flags: ['runtime'], entitlements: { ...booleans(cs), ...ids('daemon') } };

test('exact eleven reviewed targets, original host claims partitioned and DYLD only on two SEA hosts', () => {
  assert.equal(providedSigningTargets.length, 11);
  assert.equal(new Set(providedSigningTargets.map(t => t.path)).size, 11);
  assert.equal(providedSigningTargets.some(t => /provided-native|framework|agent-runtime|memory-distribution/.test(t.path)), false);
  for (const target of providedSigningTargets.filter(t => t.path !== 'Aux.app')) {
    let values = {}, flags = ['adhoc'];
    if (target.path === daemon || target.path === cliSea) { values = { ...booleans(cs), ...ids(target.path === daemon ? 'daemon' : 'cli') }; flags = ['runtime']; }
    if (target.path.endsWith('/Aux Password Importer.app') || target.path.endsWith('.appex')) {
      const provider = target.path.endsWith('.appex');
      values = { ...booleans(['com.apple.security.app-sandbox', ...(!provider ? ['com.apple.security.network.client'] : [])]), ...ids(provider ? 'PasswordImporter.CredentialProvider' : 'PasswordImporter'), 'com.apple.developer.authentication-services.autofill-credential-provider': true }; flags = ['runtime'];
    }
    if (target.path.endsWith('/Aux Computer Use.app')) { values = booleans(['com.apple.security.automation.apple-events', 'com.apple.security.personal-information.addressbook']); flags = ['runtime']; }
    const p = policyForSigningTarget(target.path, { sha256, flags, entitlements: values });
    assert.deepEqual([...p.preserveKeys, ...p.removeKeys].sort(), Object.keys(values).sort());
    assert.equal(p.addDyldEnvironmentForBoundary === true, target.path === daemon || target.path === cliSea);
  }
});

test('unreviewed host capabilities, identities, flags and arbitrary targets refuse', () => {
  assert.throws(() => policyForSigningTarget(daemon, { ...sea, entitlements: { ...sea.entitlements, 'com.apple.security.cs.debugger': true } }), /Unreviewed/);
  assert.throws(() => policyForSigningTarget(daemon, { ...sea, entitlements: { ...sea.entitlements, 'keychain-access-groups': ['OTHER'] } }), /Unreviewed/);
  assert.throws(() => policyForSigningTarget(daemon, { ...sea, flags: [] }), /runtime/);
  assert.throws(() => policyForSigningTarget(guard, sea), /runtime/);
  assert.throws(() => policyForSigningTarget(guard, { sha256, flags: [], entitlements: { 'com.apple.security.cs.allow-jit': true } }), /Unreviewed/);
  assert.throws(() => policyForSigningTarget('Aux.app/arbitrary.node', sea), /Unknown/);
});

test('outer browser requires exact actual prehash, flags, values and exhaustive explicit decisions', () => {
  const observed = { sha256, flags: ['adhoc'], entitlements: { 'com.apple.security.device.camera': true } };
  const review = { version: 1, sha256, signatureFlags: ['adhoc'], observedEntitlements: observed.entitlements, entitlements: { preserveKeys: ['com.apple.security.device.camera'], removeKeys: [] } };
  assert.deepEqual(policyForSigningTarget('Aux.app', observed, review), review.entitlements);
  assert.throws(() => policyForSigningTarget('Aux.app', observed), /explicit review/);
  assert.throws(() => policyForSigningTarget('Aux.app', observed, { ...review, sha256: 'b'.repeat(64) }), /explicit review/);
  assert.throws(() => policyForSigningTarget('Aux.app', observed, { ...review, entitlements: { preserveKeys: [], removeKeys: [] } }), /exhaustive/);
  assert.throws(() => policyForSigningTarget('Aux.app', observed, { ...review, entitlements: { ...review.entitlements, addDyldEnvironmentForBoundary: true } }), /SEA-only/);
});
