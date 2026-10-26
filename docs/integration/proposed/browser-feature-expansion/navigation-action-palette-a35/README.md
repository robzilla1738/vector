# Centered palette through the actual ActionItems

This fixes a concrete native dispatch gap without changing UI, shortcut defaults, native authentication or profile admission.

`BrowserCommandController::CreateCommandUpdater` selects `CommandActionUpdater` when `features::ShouldUseActionsForBrowserCommands()` is enabled. That condition includes `UseActionsForBrowserCommands` or `AppMenuGlowUp`. The updater maps `IDC_NEW_TAB`, `IDC_FOCUS_LOCATION` and `IDC_FOCUS_SEARCH` to their declarative ActionItems and invokes them directly. It bypasses `BrowserCommandController::HandleCommandWithDisposition`, where the previously reviewed centered-palette handling and diagnostics live.

The actual `BrowserActions` callbacks still called `chrome::NewTab`, `chrome::FocusLocationBar` and `chrome::FocusSearch` directly. This explains a source path that produces all three observed ordinary behaviors without the legacy palette diagnostics. The source review did not read runtime feature preferences or change those feature defaults.

The selected build header already has ENABLE_AUX_BROWSER=1 and ENABLE_AUX_SHELL=0. The actual command-controller object references ShowAuxCommandBar, and the scoped packaged framework contains the existing palette diagnostic strings. There is no reason to bypass an admission check or rewrite shortcut mappings to cover the missing ActionItem path.

## Narrow change

Only `chrome/browser/ui/browser_actions.cc` changes through four count-one anchors: the existing palette header and the three callbacks. On Aux macOS:

- The normal-window New Tab action opens the existing palette in new-tab mode and returns. A refused palette logs its existing kind of failure and creates no durable tab. Other window types retain the existing NewTab fallback, matching the reviewed controller behavior.
- Location and Search actions first try the existing navigate/commands palette modes. A refusal retains the trusted native location/search fallback. The location-visibility check still applies to that fallback, after the palette attempt, as in the legacy controller.
- All Agent/profile/window/document/admission checks remain in the unchanged ShowAuxCommandBar owner. No direct callback recursively dispatches the same command through the action updater.

Action titles/icons/metadata, palette geometry/material, native URL ownership and all other callbacks stay unchanged. No GN changes are requested; the shared function/header already exists in the selected UI target.

## Evidence and handoff

`source-plan.json` pins the actual native preimage `c98b6011a5f65906292dbfecd34be2fd2758d6d53724f022fa5da50badc7f38c` and successor `9015e59c3c3bd7e5f984b4ef043b4a5ff4e59e0118ce5cc334283bcd1606516e`. `native.patch` and `source/.../browser_actions.cc` are the exact output. `python3 check.py` passes counted replay and focused source-routing checks; its read-only dependency hashes cover the actual modern updater, legacy controller, action IDs, feature gate and generated build flags.

No native tree, build, app, profile, provider, signing or packaging operation was performed here. Root owns the one-owner compilation/framework pairing and actual Cmd+T/K/L checks. Actual acceptance must confirm a transient centered palette, unchanged durable tab count until commit, Escape dismissal, and trusted mode-specific behavior. Source coverage alone is not runtime acceptance.
