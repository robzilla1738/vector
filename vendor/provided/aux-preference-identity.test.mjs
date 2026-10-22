import test from 'node:test';
import assert from 'node:assert/strict';
import { AUX_PREFERENCE_IDENTITY, migrateAuxPreferenceDocument } from './aux-preference-identity.mjs';

const profile = () => ({
  aside: {
    profile_id: 'fixture-profile-stable', account_user_id: 'fixture-cloud-user', account_id: 17,
    account_email: 'synthetic@example.invalid', account_display_name: 'Synthetic User', account_profile_url: '',
    account_has_persisted_session: true, account_auth_paused: false,
    sync_auth_diagnostic_message: '', sync_encryption_diagnostic_message: 'fixture diagnostic',
    bootstrap_complete: true, automatic_password_gate_suppressed: true, account_password_extension_available: true,
    vertical_tabs: { bookmarks_section_enabled: false, bookmarks_section_expanded: false, chats_section_expanded: true, expanded_bookmark_folder_ids: ['913', '5', '913'] },
  },
  aux: { cloud_cookie_restore: { userId: 'fixture-cloud-user', generation: 8, revision: 19, objectSha256: 'fixture' }, vertical_sidebar: { collapsed: true, hover: true } },
  profile: { name: 'Synthetic', exit_type: 'Normal' },
  browser: { window_placement: { left: 70, top: 90, right: 1400, bottom: 1000 } },
  extensions: { settings: { fixture: { state: 1 } } },
});
test('moves all 17 profile keys while preserving stable identity, sidebar UI and unrelated state', () => {
  const input = profile(), original = structuredClone(input), old = input.aside;
  const { preferences, receipt } = migrateAuxPreferenceDocument(input, { scope: 'profile' });
  assert.deepEqual(input, original); assert.equal(Object.hasOwn(preferences, 'aside'), false);
  for (const [key, value] of Object.entries(old)) assert.deepEqual(preferences.aux[key], value);
  assert.deepEqual(preferences.aux.cloud_cookie_restore, input.aux.cloud_cookie_restore);
  assert.deepEqual(preferences.aux.vertical_sidebar, input.aux.vertical_sidebar);
  assert.deepEqual(preferences.browser, input.browser); assert.deepEqual(preferences.extensions, input.extensions);
  assert.equal(receipt.moved.length, 17); assert.notEqual(receipt.sourceSha256, receipt.outputSha256);
  assert.equal(JSON.stringify(receipt).includes('fixture-cloud-user'), false);
  const repeated = migrateAuxPreferenceDocument(preferences, { scope: 'profile' });
  assert.deepEqual(repeated.preferences, preferences); assert.equal(repeated.receipt.changed, false);
});
test('migrates Local State onboarding and explicit profile order without sorting/removing entries', () => {
  const input = { aside: { onboarding_completed: true, vertical_tabs: { profile_order: ['Profile 3', 'Default', 'Profile 3'] } }, profile: { last_used: 'Profile 3', info_cache: { Default: {}, 'Profile 3': {} } } };
  const { preferences, receipt } = migrateAuxPreferenceDocument(input, { scope: 'local-state' });
  assert.deepEqual(preferences.aux, input.aside); assert.deepEqual(preferences.profile, input.profile); assert.equal(receipt.moved.length, 2);
  assert.equal(AUX_PREFERENCE_IDENTITY.length, 19);
});
test('conflicting Aux identity or sidebar values fail without mutation; equal values deduplicate', () => {
  for (const aux of [{ account_user_id: 'different-user' }, { vertical_tabs: { bookmarks_section_enabled: true } }]) {
    const input = { ...profile(), aux }, before = structuredClone(input);
    assert.throws(() => migrateAuxPreferenceDocument(input, { scope: 'profile' }), /Conflicting/); assert.deepEqual(input, before);
  }
  const input = profile(); input.aux.account_user_id = input.aside.account_user_id;
  const result = migrateAuxPreferenceDocument(input, { scope: 'profile' });
  assert.deepEqual(result.receipt.alreadyEqual, ['aux.account_user_id']);
});
test('unmapped/wrong-scope state, flat aliases, invalid typed values and destination path collisions fail closed', () => {
  const cases = [
    [{ aside: { unsupported_setting: true } }, 'profile', /Unmapped/],
    [{ aside: { onboarding_completed: true } }, 'profile', /Unmapped/],
    [{ aside: { account_id: '17' } }, 'profile', /type/],
    [{ aside: { account_id: 17 }, aux: false }, 'profile', /dictionary/],
    [{ 'aside.account_id': 17 }, 'profile', /Flat/],
    [{ aside: { vertical_tabs: false } }, 'profile', /dictionary/],
  ];
  for (const [input, scope, expected] of cases) {
    const original = structuredClone(input);
    assert.throws(() => migrateAuxPreferenceDocument(input, { scope }), expected); assert.deepEqual(input, original);
  }
  assert.throws(() => migrateAuxPreferenceDocument({}), /scope/);
});
test('fresh state creates no fabricated onboarding/session/profile IDs or extra defaults', () => {
  const input = { browser: { window_placement: { left: 20 } }, aux: { cloud_cookie_restore: {} } };
  assert.deepEqual(migrateAuxPreferenceDocument(input, { scope: 'profile' }).preferences, input);
  assert.deepEqual(migrateAuxPreferenceDocument({}, { scope: 'local-state' }).preferences, {});
});
