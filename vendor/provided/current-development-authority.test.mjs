import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { developmentTargetDefinitions, developmentTargets, orderedDevelopmentTargets, preparedLeafPath } from './plan-development-dp.mjs';
import { developmentProbeOperation } from './run-development-dp-probe.mjs';
import { validateCurrentAuthorityRequest, validateLaunchAuthorityReport } from './current-development-authority.mjs';

test('explicit no-password-manager topology permits exactly six ad hoc and three real authority roles', () => {
  const targets = developmentTargetDefinitions(true), ordered = orderedDevelopmentTargets(targets, { passwordManagerExcluded: true });
  assert.equal(targets.length, 9);
  assert.equal(targets.filter(target => target.signer === 'development').length, 3);
  assert.equal(targets.filter(target => target.signer === 'adhoc').length, 6);
  assert.ok(targets.every(target => !target.path.includes('Password Importer')));
  assert.equal(ordered.at(-1).path, 'Aux.app');
  assert.equal(developmentTargets.length, 11); // Historical plan format is preserved.
  assert.throws(() => orderedDevelopmentTargets(targets));
  assert.throws(() => orderedDevelopmentTargets(developmentTargets, { passwordManagerExcluded: true }));
  assert.throws(() => orderedDevelopmentTargets(targets.slice(1), { passwordManagerExcluded: true }));
  assert.throws(() => developmentTargetDefinitions('true'));
});

test('verify-existing can never select initialize or cleanup when its marker is missing', () => {
  assert.equal(developmentProbeOperation('verify-existing', true), 'verify');
  assert.throws(() => developmentProbeOperation('verify-existing', false), /initialization is not authorized/);
  assert.throws(() => developmentProbeOperation('unreviewed', true));
  assert.equal(developmentProbeOperation('installation', false), 'initialize'); // Historical explicit operation unchanged.
  assert.equal(developmentProbeOperation('cleanup', true), 'cleanup');
});

test('current workflow requires actual package handoff, explicit local signing, existing exact scope and no initialization/provisioning', () => {
  const scope = { policy: { core: { scope: 'fixture-scope', home: '/fixture-private-home' } } };
  const request = { packageHandoff: true, localSigningAuthorized: true, allowAppleTrustNetwork: true, scope: scope.policy.core.scope, home: scope.policy.core.home, profileSha256: 'faa4760e2746dcea329ad272390a33d9960c3419bb8b991654a35ac5b7ee1a6d', packageReportSha256: 'a'.repeat(64), testMacIdentifier: 'PUBLIC-FIXTURE-ID', operation: 'verify-existing', provisioningAllowed: false, initializeAllowed: false };
  validateCurrentAuthorityRequest(request, scope);
  for (const change of [value => value.packageHandoff = false, value => value.localSigningAuthorized = false, value => value.operation = 'installation', value => value.initializeAllowed = true, value => value.provisioningAllowed = true, value => value.scope = 'OTHER', value => value.home = '/owner', value => value.profileSha256 = '0'.repeat(64), value => value.packageReportSha256 = undefined]) {
    const bad = structuredClone(request); change(bad); assert.throws(() => validateCurrentAuthorityRequest(bad, scope));
  }
});

test('signed launch handoff requires actual three-host same-authority verify receipt, not old package signed:false or a health response', () => {
  const success = { ok: true, scheme: 'pq_v1', publicKeyHash: 'b'.repeat(64), rawCdpVerified: true, httpDomainVerified: true, tamperRefused: true, originalFormatPreserved: true, defaultGroupVerified: true };
  const receiptSha = 'a'.repeat(64), scope = 'fixture-scope';
  const report = { ok: true, phase: 'verify-existing', operation: 'verify', scope, signedReceiptSha256: receiptSha, productMainStarted: false, secretsLogged: false, results: ['daemon','carrier','cli'].map(host => ({ host, result: { ...success } })) };
  validateLaunchAuthorityReport(report, receiptSha, scope);
  for (const change of [value => value.operation = 'initialize', value => value.signedReceiptSha256 = 'old', value => value.results.pop(), value => value.results[0].result.defaultGroupVerified = false, value => value.results[1].result.httpDomainVerified = false, value => value.results[2].result.rawCdpVerified = false, value => value.results[1].result.publicKeyHash = 'c'.repeat(64)]) {
    const bad = structuredClone(report); change(bad); assert.throws(() => validateLaunchAuthorityReport(bad, receiptSha, scope));
  }
  const source = readFileSync(new URL('./current-development-authority.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /prepareDevelopmentProject|prepareDevelopmentDp\(|xcodebuild|allowProvisioningUpdates|find-identity|spawnSync/);
  assert.match(source, /phase: 'verify-existing'/);
  assert.match(source, /packageReportIsHistoricalUnsignedInput: true/);
});


test('direct-package preparation validates existing leaf path without recreating historical copy tree', () => {
  const packageRoot = '/fixture/project/out/current', prefix = packageRoot + '/Aux.app/Contents/Resources/aux';
  const prep = { method: 'current-completed-package-no-provisioning-project', resourceRoot: prefix };
  assert.equal(preparedLeafPath(prep, '/fixture/review', packageRoot, { path: 'Resources/aux/agent-runtime/node/bin/node' }), prefix + '/agent-runtime/node/bin/node');
  for (const file of ['Resources/aux/../outside', 'Resources/aux//bad', 'Resources/aux/a/../../outside', 'Resources/other/a']) assert.throws(() => preparedLeafPath(prep, '/fixture/review', packageRoot, { path: file }));
  assert.throws(() => preparedLeafPath({ ...prep, resourceRoot: '/owner' }, '/fixture/review', packageRoot, { path: 'Resources/aux/a' }));
  assert.equal(preparedLeafPath({}, '/fixture/legacy', packageRoot, { path: 'Resources/aux/a' }), '/fixture/legacy/Resources/aux/a');
});
