# Native site routing and authenticated CLI

Source implementation for the selected Aux browser, not the retired `enable_aux_shell` graph. It preserves default UI and adds one supplied General settings row/dialog. This proposal does not edit the selected native tree, run an app, access owner state, sign or release anything.

## Integrator contract

Register Local State dictionaries `aux.routing.rules` and `aux.routing.profile_index`, empty by default. Add `routing_model.cc` and `routing_service.cc` to the selected Aux native target. Add the model test only to the appropriate unit-test target. Dependencies include the existing organization coordinator/controller, native profile/window/navigation APIs and `net/base/url_util`.

After a normal profile's actual admission and initialization, call `aux::routing::RememberProfile(profile)`. Do not put this call inside `GetProfileId`: it reads the ID itself. The native index stores a stable Aux UUID and the already registered native directory basename. It never accepts a renderer path or scans profile files. Existing IDs are never silently retargeted. Profiles not yet admitted in this build are unavailable until opened normally; display names never become persistent identities.

Native wrappers in `auxBrowserPreferences`:

- `getRoutingState()` calls `GetState(actual_profile)` for the trusted settings UI.
- `setRoutingRules({revision,configuration})` calls `ReplaceRules`. The result includes `configuration`, `profiles` and `persistence:"native-pref-queued"`. This is native preference persistence, **not** an atomic-write/drain receipt.
- `testRoutingUrl({url})` calls `Resolve` with `Authority::kExternal`, for the trusted settings UI only. This previews saved rules without loading a profile or opening/navigating anything.
- `routeBrowserLink({operation,url?,profile?,space?,boundProfileId})` verifies regular profile and exact `boundProfileId == GetProfileId(actual_profile)`. `operation` is `open`, `resolve` or `list`; the first two use `Authority::kCurrentProfile`. The `list` reply exposes only the exact caller profile and its Spaces; it must not return all `GetState` rules/profiles. This API is for the supplied authenticated extension command bridge, not a public webpage.

No renderer selects the `Authority` enum. Account-scoped CLI calls may not widen their authority to another native/account profile through an automatic rule. An explicit CLI profile is first resolved against that account's registered profiles and bound through the existing daemon/extension route.

Compose `applyAuxBrowserRouting` for CLI, daemon, agent background **after Aux wire identity**, and compose `transformAuxRoutingSettings` for `assets/general-3dgRbrRk.js` after ordinary branding/adaptations. Root manifests and composed source inventory remain integrator-owned. The CLI command uses the supplied Commander program, `createDaemonClient`, `resolveAccount`, tRPC account-instance middleware, `resolveCliBrowserBinding` and existing authenticated extension bridge; there is no new listener or `open`/shell bypass. The agent forwards the checked route's profile to the native API.

## External ingress hook

Root owns broad startup source edits. In selected `ENABLE_AUX_BROWSER` macOS `OpenStartupTabsInBrowserWithProfile`, before ordinary URL opening, call routing only for regular, actually admitted profile + untrusted external HTTP(S) StartupTabs. For each candidate, call `Resolve` synchronously first. `handled:false` means no matching rule and continue ordinary Chromium flow. Otherwise remove the tab from the original opening list and call `Open` once; any `ok:false` is shown to the user through existing native warning UI, never passed back to the default opener. This distinguishes refusal from no-match and prevents both duplicate navigation and wrong-profile fallback.

The corresponding already-running command-line external URL receipt needs the same per-URL hook after `SetupProfileAndIncognito`; do not intercept profile restore URLs, redirects, POST, arbitrary renderer navigation or protected auth schemes. New CLI does not depend on an unauthenticated argv/open command. Wire every supported external receipt through this resolver; these shared hooks are not included in this worker-owned patch.

The service bypasses automatic rules for loopback receipts and common OAuth callback query/fragment fields. This is a conservative compatibility heuristic, not a claim to recognize every OAuth URL. Redirects and in-page authentication navigation are outside the routing entry points entirely.

## Behavior

Rules are version 1, max 200, strict keys, UUID identities, canonical host and optional normalized path, enabled flag, bounded integer priority, exact/subdomain match, stable user ordering. No regex/glob or credentials in URLs. Ranking: priority, longer path, exact host, longer host, then original order. `/work` does not match `/workshop`; `example.org` does not match `example.org.evil`. Validation refuses unknown future config without clearing stored bytes.

A matching unavailable destination refuses instead of trying another rule or the default profile. Explicit profile overrides rules. Space validation uses the actual organization owner; no directory JSON probing. A nonloaded target Space is reported as needing profile load during read-only resolve and checked again before opening. A busy/missing organization projection refuses. The actual native controller selects the Space before native `NavigateParams` creates a new tab, which the actual controller registers.

Source epoch/native admission generation/config revision are rechecked through async profile loading and window creation. Target identity/epoch and native metadata are checked again before navigation. The 15-second request timeout cancels subsequent navigation, not a profile/window creation already issued to Chromium. There is no retry after navigation dispatch. Existing active-work profile state is not rebound or switched by routing; a target native profile window is used/opened normally.

The supplied General dialog edits typed controls, preserves supplied row/dialog/button/select/switch components, saves via CAS, supports enable/disable, remove and order, and previews saved rules. Unsaved changes cannot be misleadingly tested as persisted rules. Unavailable destination references remain visible/removable.

## Evidence and outstanding acceptance

- Four focused adapter checks: exact supplied source pins/anchor application and static parse, invalid/remote CLI input refusing before transport, native profile route/cancellation guard, supplied General composition. No supplied module is executed.
- Three native matcher tests authored (strict/canonical input, hostile host/path boundaries, deterministic ordering); **not yet compiled or run**.
- Five native source files count-pinned and exact patch replay checked.
- Root still owns GN/API/schema/pref registrations, identity-index startup hook, external receipt hooks, fully composed daemon/agent/CLI verification and actual native compile.
- No actual settings, CLI command, profile loading, multi-window routing or app runtime acceptance has occurred. The current startup/custody/drain gate still governs any later disposable launch. Native PrefService background persistence/drain coverage is not certified by these source changes.
