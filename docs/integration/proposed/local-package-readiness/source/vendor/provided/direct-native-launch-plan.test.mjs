import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { directNativeLaunchPlan } from './direct-native-launch-plan.mjs';
const hash = value => createHash('sha256').update(value).digest('hex');
function fixture() {
  const app = '/fixture/output/Aux.app', home = '/fixture/approved-home';
  const profile = `${home}/preview-profile-local-browser-pass`, scope = hash(home);
  return { version: 1, kind: 'inherited-signed-preview-launch-handoff',
    authorityProofInherited: true, app, home, profile, scope,
    receiptPath: '/fixture/receipt.json', receiptSha256: '1'.repeat(64),
    command: ['node', 'scripts/aux.mjs', '--home', home, '--profile', profile,
      '--app', app, '--', '--new-window', 'chrome://newtab/'],
    environment: { HOME: home, CFFIXED_USER_HOME: home,
      AUX_ENABLE_PROVIDED_NATIVE_CARRIER: '1', AUX_NATIVE_KEYCHAIN_SCOPE: scope },
    removeEnvironment: ['AUX_ENABLE_PROVIDED_AGENT_INBOX_KEYCHAIN',
      'AUX_PROVIDED_DP_PROBE', 'AUX_DP_PROBE_APPROVED',
      'AUX_DP_PROBE_OPERATION', 'AUX_PROVIDED_NATIVE_LOAD_ONLY'] };
}
function derive(value) {
  const bytes = Buffer.from(JSON.stringify(value));
  return directNativeLaunchPlan(bytes, hash(bytes));
}
test('removes external tooling while preserving explicit approved scope and browser flags', () => {
  const input = fixture(), before = JSON.stringify(input), plan = derive(input);
  assert.equal(plan.command[0], '/fixture/output/Aux.app/Contents/MacOS/Aux');
  assert.equal(plan.command[1], `--user-data-dir=${input.profile}`);
  assert.equal(plan.environment.AUX_HOME, input.home);
  assert.equal(plan.environment.AUX_NATIVE_KEYCHAIN_SCOPE, input.scope);
  assert.equal(plan.requiresAcceptedReceiptValidation, true);
  assert.equal(plan.processLifetimeOwnerRequired, true);
  assert.equal(plan.launched, false);
  assert.equal(JSON.stringify(input), before);
});
test('refuses changed handoff bytes, profile/scope, acceptance and probe gate drift', () => {
  const bytes = Buffer.from(JSON.stringify(fixture()));
  assert.throws(() => directNativeLaunchPlan(bytes, '0'.repeat(64)));
  for (const mutate of [
    x => { x.home = '/fixture/new-home'; },
    x => { x.profile = '/fixture/owner-profile'; },
    x => { delete x.environment.AUX_ENABLE_PROVIDED_NATIVE_CARRIER; },
    x => { x.environment.AUX_ENABLE_PROVIDED_AGENT_INBOX_KEYCHAIN = '1'; },
    x => { x.command.push('--aux-development-runtime'); },
    x => { x.removeEnvironment = []; },
  ]) { const x = fixture(); mutate(x); assert.throws(() => derive(x)); }
});
