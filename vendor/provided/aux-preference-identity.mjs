/** Offline migration only. No filesystem/native access and never an app fallback.
 * Feed parsed Preferences/Local State from an explicitly authorized disposable
 * copy while its browser is stopped. Caller owns backups and durable CAS writes.
 */
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const mapping = (scope, suffix, type) => Object.freeze({ scope, from: `aside.${suffix}`, to: `aux.${suffix}`, type });
export const AUX_PREFERENCE_IDENTITY = Object.freeze([
  mapping('local-state', 'onboarding_completed', 'boolean'),
  mapping('local-state', 'vertical_tabs.profile_order', 'array'),
  mapping('profile', 'profile_id', 'string'),
  mapping('profile', 'account_user_id', 'string'),
  mapping('profile', 'account_id', 'integer'),
  mapping('profile', 'account_email', 'string'),
  mapping('profile', 'account_display_name', 'string'),
  mapping('profile', 'account_profile_url', 'string'),
  mapping('profile', 'account_has_persisted_session', 'boolean'),
  mapping('profile', 'account_auth_paused', 'boolean'),
  mapping('profile', 'sync_auth_diagnostic_message', 'string'),
  mapping('profile', 'sync_encryption_diagnostic_message', 'string'),
  mapping('profile', 'bootstrap_complete', 'boolean'),
  mapping('profile', 'automatic_password_gate_suppressed', 'boolean'),
  mapping('profile', 'account_password_extension_available', 'boolean'),
  mapping('profile', 'vertical_tabs.bookmarks_section_enabled', 'boolean'),
  mapping('profile', 'vertical_tabs.bookmarks_section_expanded', 'boolean'),
  mapping('profile', 'vertical_tabs.chats_section_expanded', 'boolean'),
  mapping('profile', 'vertical_tabs.expanded_bookmark_folder_ids', 'array'),
]);
function dictionary(value) { return value !== null && typeof value === 'object' && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null); }
function assertJson(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) return;
  if (Array.isArray(value)) { for (const item of value) assertJson(item); return; }
  if (!dictionary(value) || Object.getOwnPropertySymbols(value).length) throw Error('Preferences must contain JSON data only');
  for (const property of Object.values(Object.getOwnPropertyDescriptors(value))) {
    if (!own(property, 'value') || !property.enumerable) throw Error('Preferences must contain plain JSON fields');
    assertJson(property.value);
  }
}
function lookup(root, path) {
  const parts = path.split('.'); let cursor = root;
  for (const part of parts) {
    if (!dictionary(cursor)) throw Error(`Non-dictionary preference path: ${path}`);
    if (!own(cursor, part)) return { present: false };
    cursor = cursor[part];
  }
  return { present: true, value: cursor };
}
function assign(root, path, value) {
  const parts = path.split('.'); let cursor = root;
  for (const part of parts.slice(0, -1)) {
    if (!own(cursor, part)) cursor[part] = {};
    if (!dictionary(cursor[part])) throw Error(`Non-dictionary preference path: ${path}`);
    cursor = cursor[part];
  }
  cursor[parts.at(-1)] = structuredClone(value);
}
function remove(root, path) {
  const parts = path.split('.'); let cursor = root; const parents = [];
  for (const part of parts.slice(0, -1)) { parents.push([cursor, part]); cursor = cursor[part]; }
  delete cursor[parts.at(-1)];
  for (const [parent, part] of parents.reverse()) { if (Object.keys(parent[part]).length) break; delete parent[part]; }
}
function validType(value, type) {
  if (type === 'array') return Array.isArray(value);
  if (type === 'integer') return Number.isInteger(value) && value >= -2147483648 && value <= 2147483647;
  return typeof value === type;
}
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function migrateAuxPreferenceDocument(input, { scope } = {}) {
  if (!['profile', 'local-state'].includes(scope)) throw Error('Explicit preference scope required');
  if (!dictionary(input)) throw Error('Preferences root must be a JSON dictionary');
  assertJson(input);
  // Chromium uses nested dictionaries for dot-separated preference paths. Flat
  // aliases must not silently coexist with those authoritative nested paths.
  if (Object.keys(input).some(key => key.startsWith('aside.') || key.startsWith('aux.'))) throw Error('Flat product preference keys require explicit review');
  const preferences = structuredClone(input), moved = [], alreadyEqual = [];
  for (const entry of AUX_PREFERENCE_IDENTITY.filter(entry => entry.scope === scope)) {
    const old = lookup(preferences, entry.from), current = lookup(preferences, entry.to);
    if (current.present && !validType(current.value, entry.type)) throw Error(`Invalid preference type: ${entry.to}`);
    if (!old.present) continue;
    if (!validType(old.value, entry.type)) throw Error(`Invalid preference type: ${entry.from}`);
    if (current.present && !isDeepStrictEqual(old.value, current.value)) throw Error(`Conflicting preference values: ${entry.to}`);
    if (current.present) alreadyEqual.push(entry.to); else { assign(preferences, entry.to, old.value); moved.push(entry.to); }
    remove(preferences, entry.from);
  }
  // Unknown/wrong-scope product state must not be discarded or blindly renamed.
  if (own(preferences, 'aside')) {
    if (!dictionary(preferences.aside) || Object.keys(preferences.aside).length) throw Error('Unmapped legacy preference state requires explicit review');
    delete preferences.aside;
  }
  return {
    preferences,
    receipt: { format: 'aux.preference-identity.v1', scope, sourceSha256: hash(input), outputSha256: hash(preferences), moved, alreadyEqual, changed: !isDeepStrictEqual(input, preferences) },
  };
}
