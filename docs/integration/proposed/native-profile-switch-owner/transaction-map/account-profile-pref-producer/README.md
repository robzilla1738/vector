# Original account preference producer primitives

This three-file source-only proposal follows the GN/pref split c1ae7a703. It completes the actual original account-state preference registration and ports the supplied native preference mutation/read helpers without inventing an account selector, API, authentication result or unlock state. Exact three-file replay passed. Native compilation/runtime did not run. The full asynchronous updater is not mounted or claimed complete by this slice.

The seven added registrations come directly from supplied `034e3f1c.c`: email/display name/picture URL and the two diagnostic messages are empty strings; persisted-session and auth-paused are false. The existing actual browser_prefs registration hook runs this table before profile access. Root may compile `account_profile_prefs.cc/h` with the low-level registration target; it depends only on `components/prefs` and the standard library, with no ProfileManager/browser/UI edge.

Exact native helper effects now available for the real updater port:

- `4103c38`: set nonempty actual user binding plus optional nonnegative account ID; an empty user invokes original full account-pref clearing. No registry binding is created by this helper.
- `4103d40`: clear account ID/user/email/display/picture/session/paused and both diagnostics. It does not change UUID, bootstrap completion, global onboarding or any Vault/crypto material.
- `41040a4`: real persisted-session presentation is `has_persisted_session && !email.empty()`, and unchanged email/session values do not produce extra writes.
- `41042ec`: update actual paused state when changed.
- `41043ac`: write actual selected display name and picture URL only to registered prefs.
- `4103854`, `4103954`, `4103a68`: expose native account display/picture metadata only with a real saved user or nonnegative account ID and an actual persisted-session or paused flag. These metadata flags do not grant browsing, authenticate a daemon request or unlock a Vault.

No browser storage secret, session token, fabricated cloud user, account-completion stamp or OS identity is added. The new helpers deliberately do not choose the current registry account or synthesize a successful producer. They are source-backed operations for the owner that is being recovered below.

## Recovered real owner, not an extension method

Original keyed-service factory `02e84b1c` names `AsideProfileAttributesUpdater`; actual BuildService `4162d34` gets the real ProfileManager's ProfileAttributesStorage and constructs the 208-byte service `415e7e8` with that storage and the actual Profile. The class observes the Profile and attributes storage, applies persisted account metadata, then starts `RefreshAccountsState(true)` (`415ebd0`). It is not `chrome.asideAccount.setProfileAccount`; the supplied extensions only feature-detect that absent optional API.

`415fec0` watches the real accounts path. Callback `41602e8` always refreshes with the real bind-admission flag true; a real watcher error resets/restarts the watch. Refresh coalesces in-flight/queued/bind-admission flags at owner +a0/+a1/+a2 and reads the actual account snapshot off-thread, returning to a weak service owner. Shutdown `415ed94` invalidates that owner before removing Profile/storage observations and the watch.

`4160ce0` first evaluates actual bootstrap completion and sets global onboarding only from that real result. It resolves an existing actual cloud profile binding by ID/path, then stored user preference, then the genuine stored account row's user. Its automatic binding branch is **not** a generic `currentAccountId` fallback: it requires the exact last-used **already-loaded** Profile (`27a55f4`, current155 `ProfileManager::GetLastUsedProfileIfLoaded()`), a real account with persisted session or paused auth and nonempty email/user, no existing saved user, no matching existing registry claim, and no other loaded profile claiming that user/account. This prevents stealing another profile's account.

Only after this selection does it write the preference helpers, real ProfileAttributesStorage labels/avatar and actual account bootstrap. Its `/accounts/profile-binding` POST contains the selected real user/account plus canonical Profile ID, path and optional native display-order index, using actual native daemon authorization. The supplied daemon has the matching real public route (still protected by global daemon-token middleware). No endpoint replacement is needed.

## Remaining owner effects requiring faithful integration

The callback also updates the actual sync preference/service graph and original avatar fetch owner. `41603e4` touches the genuine sync preferences (`sync.encryption_bootstrap_token`, `sync.has_setup_completed`, `sync.cached_passphrase_type`) and not merely the bootstrap gate. `415f2f4` owns real URL validation, cached-avatar URL/picture tests, browser-process fetch/decode and weak completion into the actual profile attributes entry. `415fb9c` preserves original local-profile naming behavior while updating real GAIA/auth display fields. These effects must be ported before mounting a purported full updater; replacing them with a timer that just writes a current account or reusing independent strict-Vault policy would be incorrect. Bounded evidence is included so the remaining native owner can be reviewed and implemented without inventing its identity or lifecycle.
