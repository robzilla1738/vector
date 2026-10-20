# Supplied account/extension popup native window chrome

Proposed only: three existing files, no native source writes, GN changes, builds, browser launch, profile read, authority/Keychain operation or signing. This ports actual popup native-window producers and their real frame-state consumer; it does not make unavailable account authentication succeed.

## Recovered behavior

Original `BrowserNativeWidgetMac::PopulateCreateWindowParams` at45512e8 checks the actual BrowserInitState app-name markers. For `aside-account-password-popup` and `aside-extension-popup` it produces:

| Property | Original account popup | Original extension popup |
| --- | --- | --- |
| Native class | BrowserNativeWidgetWindow | BrowserNativeWidgetWindow |
| Style | Titled + Closable + FullSizeContentView | Same |
| Transparent titlebar | true | true |
| Hidden native title | true | true |
| Native document-window animation | true | true |
| Titlebar height query4550500 | override true, height0 | override false, height0 |
| Movable by background | false | false |
| Close button only | false | true |
| Traffic lights hidden | true | false |

This replaces the current stock155 fallback for these exact markers (default native class/style15 with normal title/frame sizing). Normal, PWA, PiP, importer and unrelated windows retain their existing creation branches.

These are not guessed numeric enums. Original factory2132a58 indexes tablee9a2360; index1 dereferences actual Objective-C metadata named **BrowserNativeWidgetWindow**. The complete four-class table/pointer/name chains are pinned in `source-evidence.json`. Original0x8003 is the union of the named AppKit style bits; the local SDK NSWindow.h definitions are pinned. Factory selectors positively decode the transparent-titlebar, hidden-title and animation fields. The extension/account app-name comparisons are retained directly with their Aux identities.

Original CreateNSWindow4551750 uses the actual native Browser window and frame. Exact selector resolution is essential: trampolinec550e68 resolves `setCloseButtonOnly:`, c550e74 resolves `setMovableByWindowBackground:`, and c550e80 resolves `setTrafficLightsHidden:`. The account/extension branch operands produce the values in the table above. Earlier provisional interpretations of these numeric trampolines must not be used; the retained selector-slot decoder verifies the actual names.

## Real frame owner

Original BrowserNativeWidgetWindow setters9c28404/9c28468 forward to its actual BrowserWindowFrame. Frame setters4381104/4381140 persist their real booleans, request native layout, synchronously settle that layout, and update the actual three standard buttons. Original update43811fc uses button types0/1/2 (Close/Minimize/Zoom); a button is shown only when lights are not hidden and it is Close or close-only is false. It updates alpha, hidden and enabled state together, plus supported reveal amounts and the actual cell control view on27. No replacement traffic-light Views are created.

The port adds those same setters and flags to the existing remote_cocoa native classes. Layout/reveal updates consume that same state. A155 adaptation records whether the newly ported setters have explicitly established popup state: even an explicit false setting survives subsequent native layout, while unrelated windows which never use these setters keep their stock default reveal policy. Existing always-show traffic-light behavior still goes through its real frame, and the already-existing macOS26 corner/inset behavior is untouched.

## Integration

Apply `native.patch` against `manifest.json` baselines after the full401 build/package boundary. Files:

* chrome/browser/ui/views/frame/browser_native_widget_mac.mm
* components/remote_cocoa/app_shim/browser_native_widget_window_mac.h
* components/remote_cocoa/app_shim/browser_native_widget_window_mac.mm

No new sources or schema/Mojo fields; the original class and existing native window factory are reused. Root owns any actual target-header dependency and compiler adaptation. No BrowserView, Body/Region, startup, menu or L4 global layout files are changed. Native creation owns the real OS window; its existing destruction/delegates remain unchanged. The retained401 renderer drag-region path supplies its own native input routing.

`python3 verify.py --native-root <read-only Chromium src>` checks original bounded byte/assembly hashes, exact selector trampoline/slot/name chains, actual class table and button types, SDK definitions, existing factory/schema references, and a disposable three-file patch replay against exact outputs. No NSWindow is created by this check. Actual native compilation, traffic-light/drag/layout observation and authentication remain unverified here. Other popup marker consumers (session/window restoration, BrowserView chrome visibility, etc.) remain separate source-backed work; no complete onboarding or popup parity is claimed.
