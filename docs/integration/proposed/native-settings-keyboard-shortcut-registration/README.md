# Keyboard shortcut bridge registration (v568)

Count-checked glue for `601f9aeb8` / native-settings-keyboard-shortcut-bridge. All six baselines are pinned to the actual shared v568 files; this proposal does not modify that checkout or the root composer.

## Target topology

`//chrome/browser/aux:keyboard_shortcut_parser` is a Mac+Aux-only public-header target. Its public base/ui-base/events dependencies cover every include of the inline parser. Both MiniPopup and the resolver depend on this target, with no resolver→MiniPopup→resolver cycle.

`//chrome/browser/aux:keyboard_shortcuts` compiles only the new `.mm`, exports the small `.h` and public base value types. Its private dependencies are the parser, browser-process interface, actual MiniPopup owner, Profile interface, browser-window public collection/interface, pref registry/prefs, content public browser, ui-base/global accelerator listener, events and gfx. AppKit is explicit. It does **not** depend on full `//chrome/browser/ui`, preferences API, Cocoa or a profile-manager implementation. GlobalBrowserCollection is read through the existing `browser_window` interface target; its implementation remains supplied by the final browser's existing owner.

The actual Cocoa delegate is compiled by `//chrome/browser/ui/cocoa:cocoa`, **not** the main UI source_set. That target gets the resolver dependency under its existing Mac assertion and Aux predicate. Preferences gets the resolver; MiniPopup gets only the parser. No new dep or source is added to main UI. Existing MiniPopup dependencies reach profile-manager and browser-window interface targets and the standalone select-file policy target, not full UI; no new full-UI back edge is introduced by these changes.

The existing real `RegisterAuxProfilePrefs` is already registered at profile startup; the bridge's new call registers `aux.browser.keyboard_shortcuts` once. No extra registry/startup call is added here.

## Function metrics

Adds the four requested permanent IDs2089–2092 before ENUM_BOUNDARY, with exact matching `ExtensionFunctions` XML entries:

- 2089 `AUXBROWSERPREFERENCES_GETKEYBOARDSHORTCUTS`
- 2090 `AUXBROWSERPREFERENCES_SETKEYBOARDSHORTCUT`
- 2091 `AUXBROWSERPREFERENCES_RESETKEYBOARDSHORTCUT`
- 2092 `AUXBROWSERPREFERENCES_SETSHORTCUTHANDLINGSUSPENDED`

The existing header/XML LINT.ThenChange pair is preserved. No previous metric number is changed. The existing generated extension function registry obtains the four classes from the already registered preferences API header/schema.

## Verification

`python3 verify.py` checks exact baseline/output hashes, unique counted anchors, complete patch replay, four declaration IDs and matching XML values. This is source verification only. No GN generation, native compile, app launch, profile/OS operation or shared file mutation was performed.

Root should compose the bridge first and this glue next, then run its normal single GN/focused compile pass. Expected changed compile owners are `aux_browser_preferences`, `aux_mini_popup`, `//chrome/browser/aux:keyboard_shortcuts` and `//chrome/browser/ui/cocoa:cocoa` plus schema-generated function registrations. The new public histogram enum may invalidate other normal consumers; no extra broad test is requested.
