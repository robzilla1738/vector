# Active-profile AppKit shortcut hints and actual accelerator queries

Count-checked follow-up against actual574, preserving the API571 bridge and native Ask567 validation diagnostic. The supplied1852 capture hook remains the closest authority for IDs/defaults; original native C++ customization policy was not recovered. These are explicit155 integrations of that supplied contract, not newly designed controls.

## Actual owners

The current Cocoa `BrowserWindowCommandHandler` receives a real NSMenuItem and the exact NSWindow, invokes the existing native validator, then applies its enabled/toggle/hidden/title result. This proposal inserts an Aux-only key-equivalent update in that existing path. It does not change those validation results, enable Ask or another command, change a tag/action, duplicate an item, or alter click dispatch.

The shared resolver now updates each configured item's actual keyEquivalent/modifierMask from the same effective profile bindings used by keyboard dispatch. Displaced duplicate hints (for example upstream Save Page when supplied Toggle Sidebar claims Command+S) are blanked, retaining the menu item's real click behavior. Item-owned associated data retains the original equivalent and our last written value. Original hints are restored when a binding no longer displaces them; if the real native owner independently changes an item, that newer value becomes the baseline rather than restoring a stale snapshot. No profile pointer, account identity or owner content is stored in menu metadata.

Full main-menu refresh runs after a successful setter/reset and when the existing BrowserNativeWidgetMac activation callback reports an actual active browser. Normal menu validation also reads the actual receiving window's current browser/profile, covering same-window profile rebind without a stale captured profile. There is no process-lifetime observer, guessed last-active fallback or force-enabled state. Conflict checks use each configurable command's effective binding and each unrelated item's retained genuine native baseline, rather than another profile's transient displayed hints.

## Tooltip/query cause

`BrowserWidget::GetAccelerator` delegates to `BrowserView::GetAccelerator`; ToolbarView and ordinary accelerator providers ultimately reach that owner. It now consults a pure `GetKeyboardShortcut(Profile*, id, out)` for recognized IDs before the unchanged upstream fallback. This query only reads existing profile/LocalState preferences; it does not register a shortcut, create preferences or capture/global state.

The observed Collapse tooltip has a separate positively identified owner: `browser_actions.cc` seeds its action with Shift+Command+L, then `VerticalTabStripStateController::UpdateCollapseActionItem` formats the tooltip from that action's accelerator. That existing method now uses the same effective binding before formatting. Its existing profile-pref registrar observes the actual registered override dictionary, refreshing the action/tooltip on edits. Existing destruction and genuine profile-rebind Reset/Init paths own that observation. The observer checks preference registration, and pure queries fall back to contract defaults for an unregistered test fixture without creating state. Collapse text/image/enabled/visibility rules and all other actions remain unchanged.

## GN/compile boundaries

Main `//chrome/browser/ui` receives a Mac+Aux dependency on the already existing low `//chrome/browser/aux:keyboard_shortcuts` target for BrowserNativeWidgetMac/BrowserView. `//chrome/browser/ui/tabs:impl` receives the same gated dependency for its real state controller. Cocoa already depends on that low target from570, so it needs no further GN edit. The low target still has no full-UI or tabs:impl dependency; its navigator/profile-manager dependencies remain header/interface targets. The public pure getter uses a forward-declared accelerator pointer, requiring no new public header dependency.

Expected focused objects: aux_keyboard_shortcuts, browser_window_command_handler, browser_native_widget_mac, browser_view and vertical_tab_strip_state_controller. Root owns generation, native application and compilation.

## Verification and remaining acceptance

`python3 verify.py` checks all eight actual baselines/output hashes, unique counted anchors and complete patch replay. No native build, runtime/menu access, profile/credential/OS operation or shared checkout mutation was performed. Root should compare the actual menu hints before/after an Ask shortcut change/reset, switch real disposable browser profiles, and confirm normal menu click enabled guards remain. The actual Collapse tooltip should report the saved binding instead of the upstream hardcoded key.

OS symbolic hotkeys retain the existing platform conflict limitation. This proposal does not claim recovered original C++ or runtime acceptance, and it does not change supplied UI/CSS, command execution policy, MiniPopup enablement or account gates.
