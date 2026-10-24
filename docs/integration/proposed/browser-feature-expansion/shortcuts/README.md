# Atomic browser shortcut profiles

This proposal overlays the exact root navigation shortcut owner, retaining its
existing commands/capture/menu behavior. Root owns shared schema, extension API
registration, composition, source projection and native build. No selected tree,
app lifecycle, profiles or OS settings were changed by this worker.

## Native integration

Project `source/chrome/browser/ui/aux_keyboard_shortcuts.{h,mm}` AFTER the root
navigation proposal. Baseline/source hashes and the two-file patch are pinned.

Public `aux` functions:

- `GetShortcutProfile(Profile*)`: `{success,format:'aux-shortcuts',version:1,
  platform:'mac',ownerGeneration,revision,bindings}`. Global Mini popup omitted.
- `ExportShortcutProfile(Profile*)`: `{success,ownerGeneration,revision,
  configuration:{format:'aux-shortcuts',version:1,platform:'mac',mappings}}`.
  Only `configuration` belongs in the exported file. It contains effective
  in-app mappings keyed by decimal command ID; no owner/profile/account data.
- `ImportShortcutProfile(Profile*,ownerGeneration,revision,const DictValue& mappings)`:
  replace the in-app override table after validation, returning Get's response.
  Missing mappings use native defaults; an empty string explicitly unbinds an
  in-app command. Unknown IDs, global 34069, oversized/invalid chords are refused.
- `ResetShortcutProfile(Profile*,ownerGeneration,revision)`: the same atomic path
  with empty overrides, not a sequence of individual reset calls.

Root JavaScript wrappers are `getShortcutProfile()`, `exportShortcutProfile()`,
`importShortcutProfile({ownerGeneration,revision,mappings})`,
`resetShortcutProfile({ownerGeneration,revision})`. Bind to actual sender/profile,
require native admission, validate strict request keys and bounded input, and
return the native result without optimistic success. No new GN source needed;
`//crypto` hash linkage and existing Carbon framework linkage must be available.

### Atomicity and conflict rules

The UI-sequence native owner requires a regular original profile, current actual
BrowserPrivateRoots/admission generation and no pending cookie restoration.
Opaque owner generation hashes actual profile identity + cookie epoch + admitted
generation. Revision hashes that owner, the actual stored override dictionary
and current global popup chord (for conflict invalidation); there is no second
counter preference or generation supplied by a renderer.

All prospective bindings, including native defaults for omitted keys, are parsed
with the existing native parser. Validate equivalent key collisions against the
entire proposed table and the unchanged global Mini popup chord. Menu conflicts
use the prospective table, so swapping two in-app shortcuts is not mistaken for
collision with their old mappings. Preserve supplied intentional displacement by
a command's own default. Validate enabled macOS symbolic hotkeys through
`CopySymbolicHotKeys` and application switching chords; unavailable OS/menu
reservations refuse the operation. This does not claim knowledge of arbitrary
third-party global shortcut registrations unavailable through those APIs.

After validation, recheck live native owner/revision immediately before ONE
`SetDict(kOverrides, ...)`. There is no global shortcut registration or global
preference mutation. Read back the actual dictionary/owner to catch synchronous
observer changes, refresh native menu equivalents, return authoritative state.
`persistence:'native-pref-queued'` expressly denotes the existing PrefService
persistence contract, not a new durable disk receipt. Ordinary per-command
get/set/reset functions remain, with safe support for new empty defaults.

Root command IDs 34120..34139 are included as unbound entries and native catalog
items. The catalog asks root-owned `IsAuxFeatureCommandEnabled(actualBrowser,id)`
from `chrome/browser/ui/aux_feature_commands.h`; no handler readiness is invented.
The native menu and parser safely handle empty chords instead of dereferencing
an absent default accelerator. Existing shortcut defaults are unchanged.

## Supplied editor

Compose `transformAuxShortcutProfiles` after navigation and the other feature
adapters. It touches the pinned supplied shortcut capture/catalog and full
Appearance page. It reuses supplied group, row, description, button and keycap
components/classes. No CSS, replacement page, global key registration or cloud
service is added. The import picker is bounded to 64 KiB; the prospective changes
are reviewed inline before one Apply. Reset all also requires reviewing changes.
Global Mini popup is explicitly excluded from file and editor operations.

An operation in flight locks the session. No queued mutations are replayed after
closure. Native refusal invalidates the local revision: Reload is explicit and
requires reviewing again, rather than silently retrying against a new revision.
A changed owner is never adopted. Export requires the response owner/revision to
match the session, and exports only the portable configuration. Delayed file
reads are ignored after unmount, a newer selection, reset, apply or reload.
Supplied query state refreshes after native acceptance, not after an optimistic
local table edit. The unbound fallback and client collision check permit empty
defaults without considering every unbound command a duplicate.

## Current-window sidebar mode audit

Selected native owner:
`chrome/browser/ui/tabs/vertical_tab_strip_state_controller.{h,cc}`.
Use `VerticalTabStripStateController::From(actual BrowserWindowInterface*)`,
`ShouldDisplayVerticalTabs()`, `IsCollapsed()`, `GetCollapseState()` and
`RequestCollapse(bool)`. `SetCollapsed(bool)` is private, called by the delegate
when the transition completes. `RegisterOnCollapseChanged` allows actual settled
state observation. Collapse uses window session key `kCollapsedKey`; do not add a
profile preference or force other windows to follow it.

`SetExpandOnHoverEnabled(bool)` writes the EXISTING profile preference
`prefs::kVerticalTabsExpandOnHoverEnabled`; it is not window-local. Therefore a
window-only mode API should expose current collapse plus current hover availability,
request collapse through the real delegate, and report pending/settled transition.
If hover is disabled, refuse the label 'auto-hide' or explicitly request a separate
profile-wide hover setting; do not silently flip it. The normal collapse button
and existing transition/focus/drag locks remain authoritative.

## Focused verification

Five source/adapter checks cover pinned assets and transformed syntax, unchanged
supplied bodies/classes, actual native receipt/revision use, refusal reload,
profile mismatch, operation closure and bounded portable input. Two-file patch
replay passes. Native compilation and actual import/swap/conflict/reset behavior
remain root integration checks; no runtime acceptance is claimed here.
