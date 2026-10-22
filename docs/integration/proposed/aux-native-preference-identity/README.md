# Native preference identity proposal

Prepared, **not applied or compiled**. This follows `out/native-reuse-composition-aux-protocol-v1/manifest.json`, whose exact SHA256 is pinned in this proposal's manifest. The inspected native checkout already contains that protocol proposal. Only copies under this new review directory change; the current app, shared native checkout, source composition, profiles and UI remain untouched.

## Exact scope

Nineteen distinct product preference names occur 97 times in 21 files. `manifest.json` records each old/new key, scope, registered type, source location, per-file exact quoted replacement count and baseline/output hash. `baseline/` and `source/` are complete reviewable file snapshots; `native.patch` changes only those quoted preference literals. No geometry, colors, glass, icons, window placement, layout, interaction logic, schema payload field or API/event name changes.

| Scope | Existing suffix under `aside.` → same suffix under `aux.` |
| --- | --- |
| Local State | `onboarding_completed`, `vertical_tabs.profile_order` |
| Profile Preferences identity/account | `profile_id`, `account_user_id`, `account_id`, `account_email`, `account_display_name`, `account_profile_url`, `account_has_persisted_session`, `account_auth_paused` |
| Profile Preferences startup/diagnostics | `bootstrap_complete`, `automatic_password_gate_suppressed`, `account_password_extension_available`, `sync_auth_diagnostic_message`, `sync_encryption_diagnostic_message` |
| Profile Preferences sidebar | `vertical_tabs.bookmarks_section_enabled`, `vertical_tabs.bookmarks_section_expanded`, `vertical_tabs.chats_section_expanded`, `vertical_tabs.expanded_bookmark_folder_ids` |

Consumers and registrations are paired, including `browser_prefs.cc`, `browser_ui_prefs.cc`, profile label/avatar/controllers, account updater/observers, chat navigation and native cookie restore. Stable profile/account IDs are copied without regeneration. Profile order, expanded bookmark IDs, all booleans, diagnostics and display strings retain exact values, including false values, empty strings, array order and duplicate array elements.

The native `aside.account_display_name` registration exists both in `profile_gate_prefs.cc` and `browser_ui_prefs.cc` in the inspected baseline. Both literals are renamed together; this proposal does not change preexisting registration behavior or conceal that duplication.

The already-Aux `aux.cloud_cookie_restore` record and all other existing Aux/Chromium preferences are unchanged. The proposal includes no settings-field rename such as `bookmarksSectionEnabled`, no account API payload rename such as `profileId`/`accountId`, and no daemon record format change.

## Separate dependencies, deliberately not patched

The exact quoted-product scan across `chrome` C++/Objective-C++ sources also found three non-preference contracts, inventoried under `excluded`:

- `aside.verticalTabsTidy` in `chrome/browser/ui/views/frame/aux_tabs_actions.cc` is an extension message; migrate the actual handler together.
- `aside.inboxNotification` and `aside.notificationPermissionChanged` in `chrome/browser/notifications/aux_notification_inbox.cc` are dispatched events; migrate all receivers together.

These still require the integrator's coordinated protocol/extension work before an Aux-only delivered product can be claimed. No blanket `aside.` replacement was used. Files outside native C++/Objective-C++ and persisted daemon/extension storage are not covered by this preference inventory.

## Offline state migration hook

`vendor/provided/aux-preference-identity.mjs` is a pure source-side migration helper. It performs **no filesystem access**, native operation, owner-state read or write. Call `migrateAuxPreferenceDocument(parsedJson, {scope:"profile"})` for Preferences and `{scope:"local-state"}` for Local State, only on an explicitly authorized disposable copy with its browser stopped.

It understands Chromium's nested dictionaries for dot-separated preference paths. It returns a cloned migrated document and a value-free versioned receipt listing moved/equal destination keys and parsed-document fingerprints. It never mutates the input or inserts defaults, IDs, signed-in flags or onboarding completion. Existing matching Aux values deduplicate safely; conflicting values, wrong types, namespace collisions, flat dotted aliases, unknown/wrong-scope legacy state and invalid scope are refused without mutation. Unknown state needs explicit review, not deletion or an automatic wholesale namespace rename.

The helper's legacy lookup table belongs to the migration tool/source side, outside the delivered Aux app. After the disposable state copy has been explicitly migrated, the proposed native product reads/writes only Aux preference names; it has no runtime legacy fallback.

### Integrator's application sequence

1. Keep the accepted app/profile intact. Create a separate explicitly authorized disposable copy; do not use an owner Aside profile. Stop all writers for that copy and retain full original Preferences/Local State plus filesystem metadata and raw-byte hashes in a private migration journal. This helper's JSON fingerprints are not a replacement for raw-file CAS protection.
2. Parse both documents without duplicate-member ambiguity and migrate every copied profile's Preferences plus the user-data directory's Local State. Prepare all outputs before writing any. Fail on any conflict/unknown key; do not partially launch the successor. Preserve unrelated JSON, `Secure Preferences`, OS crypt configuration, sessions, extension state and daemon data.
3. Commit the prepared files through a reviewed durable transaction/journal: recheck original raw hashes and stopped-writer ownership, write owned temporary files in the same directory, preserve permissions, fsync, rename and fsync directories. Multi-file rename is not atomic: retain the journal/originals and complete or roll back the entire set before the next launch. This pure helper intentionally does not implement that filesystem transaction.
4. Compose this patch only after the exact pinned native protocol parent. The integrator owns shared manifests/builds. Use `scripts/extend-provided-native.py` with this `native.patch`/`manifest.json` and a fresh composition output, then normal locked apply/build scripts. Additional metadata such as excluded-contract notes is review data, not an activation receipt.
5. Launch only the successor against the explicitly migrated copy. Observe stable profile switching/account association, cookie restore fences, onboarding/bootstrap, sidebar bookmark/chat expansion/order, Local State profile order and restart persistence. Compare the actual app's UI to the accepted baseline. Static replay/synthetic tests below do not prove those runtime behaviors. No new signing or authority access is authorized by this proposal.

## Lean verification completed

`python3 docs/integration/proposed/aux-native-preference-identity/verify.py --native-root <checkout>` passed against the actual unchanged checkout: all 21 baseline hashes matched the applied protocol parent, all 97 counted replacements reconstructed the exact output snapshots, and the patch checked/applied/reproduced those outputs in a temporary directory. The script never applies to shared native files.

`node --test vendor/provided/aux-preference-identity.test.mjs` passed five synthetic state checks: all 17 profile keys and unrelated/current UI state preserved; both Local State keys/order preserved; conflict refusal/equal deduplication; unknown/wrong-scope/flat/type/path refusal; and no fabricated fresh state. No owner files were read. There is no compile, actual migrated-profile launch or runtime acceptance claim.
