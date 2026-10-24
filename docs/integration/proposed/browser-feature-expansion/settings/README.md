# Supplied browser feature settings

Source-only final transform: `vendor/provided/aux-browser-feature-settings.mjs`.
Compose `transformAuxBrowserFeatureSettings` after the existing navigation,
theme and routing adapters. Root owns composition and stage-input manifests.

The supplied Appearance owner receives three native switches: Navigation in
sidebar, Minimal browser UI and Open links in Peek. The supplied General owner
receives a Tab cleanup row and dialog. Existing component bodies, typography,
classes and page layout are retained; no CSS or alternate settings page is added.
The new controls use the same supplied rows, switches, dialogs and buttons.

## Required native contracts

- `getFramePresentation()` returns `{success, sidebarNavigation, minimal, peekLinks}`.
- `setFramePresentation({sidebarNavigation?, minimal?, peekLinks?})` returns
  an actual native result with `success` and optional `error`. Each key is boolean.
  Defaults remain false. An unavailable field is not simulated.
- `getOrganizationSettings()` returns
  `{success, ownerGeneration, revision, cleanup:{enabled,inactivityDays}}`.
  Generation and revision are nonempty opaque strings.
- `setOrganizationCleanupPolicy({ownerGeneration,expectedRevision,enabled,inactivityDays})`
  returns `{success,revision,error?}` from actual durable commit settlement.
  Native validation enforces enabled boolean, whole days 1..3650, managed policy,
  regular profile admission and owner generation/revision checks.

The session serializes writes without optimistic state. The actual commit result
must succeed before rereading native settings. Failed CAS commits refresh the
revision but still report failure; no success toast is shown. A different owner
generation invalidates the session until settings are reopened. A closed dialog
cannot republish an in-flight result or perform subsequent reads/writes. Native
I/O remains owned by native code after the receiver closes.

Cleanup remains off by default. The UI describes the native retention contract
(pins, active work and protected tabs retained), so runtime acceptance must verify
those existing native guards before exposing it as finished.

## Sidebar mode audit

The selected `vertical_tab_strip_region_view.cc` has a real collapsed-state
controller, hover expansion, drag handling and collapse animation. The inspected
`auxBrowserPreferences` API does not expose an independent persistent auto-hide
mode preference. This adapter does not invent a preference or alter existing
collapse/hover behavior. A future Always show / Auto-hide selector needs a real
native window-specific state owner and a defined relationship to the existing
collapse button. The native sidebar-navigation setting is separate.

## Shortcut audit and shared native follow-up contract

Existing supplied `assets/use-shortcut-capture-DGr8Ws5Z.js` supports per-command
recording/reset, suspension during recording and a client exact-string collision
check. Native `chrome/browser/ui/aux_keyboard_shortcuts.mm` additionally parses
accelerators, rejects equivalent duplicate bindings and browser menu conflicts,
and applies managed-preference checks. `aux_keyboard_shortcuts.h` exposes only
per-command get/set/reset. There is no atomic batch import, export envelope,
reset-all or revisioned review API. Do not implement import by looping over
`setKeyboardShortcut`: swaps can fail halfway and the Mini popup command has a
separate native/global shortcut registration owner.

Recommended root-owned shared contract before import/reset-all UI:

1. `getShortcutConfiguration()` returns
   `{success,ownerGeneration,revision,platform:'mac',bindings,customizations}`.
   Bindings include canonical serialization, stable command ID, default value,
   customized status and availability. Revision covers all owners, including
   Mini popup. A local export is a size-bounded document
   `{format:'aux-shortcuts',version:1,platform:'mac',bindings:[{commandId,shortcut}]}`;
   it contains no profile ID, generation, account data or filesystem paths.
2. `validateShortcutConfiguration({ownerGeneration,expectedRevision,configuration})`
   parses the entire prospective table against actual native command availability,
   accelerator equivalence, reserved/menu shortcuts and OS/global registration
   constraints. Return structured conflicts with involved command IDs and reason,
   never treat the renderer's string comparison as authoritative. No mutation.
3. `applyShortcutConfiguration` takes the same request and revalidates at apply.
   Commit all affected preference/native owners together or refuse without change.
   Any global shortcut registration failure must retain/restore the old table and
   report failure. No irreversible partial loop. Return authoritative new revision
   and effective bindings only after actual result. Do not call queued PrefService
   writes a durable disk receipt.
4. `resetShortcutConfiguration({ownerGeneration,expectedRevision})` is the same
   atomic path with actual native defaults. Reset-all must handle swapped commands
   and any global registration collision; per-command reset already can refuse a
   default now occupied by another customization.
5. Keep the existing supplied capture UI and add import/export/reset actions only
   after this contract exists. File parsing rejects unknown version/platform,
   oversized input, unknown commands and duplicate command IDs. Show a review of
   changed bindings/conflicts before apply. Same-profile updates must invalidate
   the current capture/query cache; stale profile/generation never retargets.

This is an integration recommendation, not an implemented shortcut API.

## Evidence

Five focused tests cover pinned source hashes, transformed JavaScript syntax,
exact restoration of prior supplied bytes/classes, duplicate/anchor-drift
rejection, real-receipt ordering, refreshed CAS revision, stale-owner refusal,
in-flight closure and invalid policy input. Passed on 2026-10-23 with:

```
AUX_NAVIGATION_ADAPTER=/Users/rcourson/Documents/Vibe/web/vendor/provided/aux-navigation-command-bar.mjs node --experimental-vm-modules --test vendor/provided/aux-browser-feature-settings.test.mjs
```

No app launch, native runtime claim, signing, provider request or owner-state I/O.
