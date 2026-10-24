# Native Peek and Aux Quick Window

Four new selected-product native source files. This uses Chromium's real `TYPE_POPUP` browser, real native location bar, real tab ownership and actual tab movement. It does not use the inactive `ui/aux/little_window_controller`, and it does not replace or alter the supplied agent Mini Popup/composer. The supplied Mini Popup's compact native-window precedent is reused; its web chat surface and global shortcut stay independent. No selected LinkPreview implementation was found in the inspected selected browser UI/preloading paths.

No selected-tree mutation, app launch/close/restart, profile I/O, credentials, signing or release was performed. All descriptions below concern authored source, not accepted runtime behavior.

## Root integration contract

Add controller/throttle `.cc` files to the selected native GN target. Register regular-profile bool `aux.peek_links_enabled`, default false; do not turn it on through this integration. Root owns normal command/shortcut/API registrations and existing Appearance/General settings composition.

### Real native toolbar

The helper refuses to open until native root calls `SetNativeWindowDecorator` once. Register a native callback which installs/refreshes real native toolbar Back, Dismiss and Promote controls, a compact profile-name label and a restriction/status label in the newly marked popup, then returns true only when the actual native location bar remains visible. No replacement URL textfield, fake URL label, webpage overlay or JS registration is acceptable. Use existing ToolbarButton/button/style/color/material/corner owners; normal-window defaults stay unchanged.

The callback runs after popup creation and an actual blank tab exists, before target URL loading/show. This is necessary because ToolbarView's normal constructor ran before the helper could mark the window. `GetKind`/`Presentation` expose mode/profile/status; `ObservePresentation` signals restriction/promoting changes. Read Presentation again after action callbacks; navigation back availability also follows the real WebContents/navigation controller. Native toolbar callbacks invoke `Back`, `Dismiss`, `Promote` and show returned errors. This source does not itself paint new controls.

### Actual user intent

- Native page context menu: add “Peek link” for an actual HTTP(S) link, retrieve the context menu's exact RenderFrameHost and source browser at execution, and call `OpenPeek(..., Trigger::kContextMenu)`. Do not reuse a cached URL with a newly navigated source frame.
- Native modifier click: capture the designated modifier combination from the actual trusted native pointer event and consume it once with the corresponding actual renderer link-open request. Require a user-initiated GET link from the active tab and exact frame. Call `OpenPeek(..., Trigger::kModifierClick)`. Do not infer user intent from a URL or a renderer-controlled boolean; do not intercept all Ctrl/Cmd clicks or ordinary navigation.
- Opt-in ordinary click: only actual unmodified user link GET requests enter `Trigger::kOptInLinkClick`, which rechecks the profile preference. Default clicks remain Chromium's unchanged behavior. Redirects, script navigation, POST, downloads and protected auth callbacks are not new Peek triggers.
- Quick command: `OpenQuick(actual_browser, url)` creates a real compact browser. Empty URL opens a blank native tab and focuses the real location bar. No global shortcut is installed by the helper.

Call sites must distinguish refused interception from standard navigation: a user Peek request that was refused should show its explicit error rather than silently launching in another profile. All source frames are checked against the active source WebContents, active document, profile and real native/agent authority. The helper rechecks the weak document, actual profile epoch and native startup generation after native window creation and before the first target request.

### Navigation, new windows and close

Register `aux::preview::NavigationThrottle::MaybeCreateAndAdd(registry)` in the real navigation-throttle registration path. It gates both modes against actual owner/generation; Peek additionally blocks top-level non-HTTP(S), embedded-credential URLs, POST and download responses, showing “promote first.” Safe browsing, subresource policy and supported native permission prompts remain Chromium's responsibility. A blank native tab is inserted first, so its real TabInterface/window owner exists before target navigation/throttle creation.

Hook `AllowNewContents(source)` before actual Browser `AddNewContents`/other-disposition window creation from a Peek source. Refusal must destroy only the newly proposed child, set `was_blocked`, and retain the existing preview. Also gate external-protocol and direct `DownloadURL`/download-attribute entry points from Peek (use `IsPeekContents` and `ReportRestriction`); a navigation throttle alone does not cover these paths. Never create an unmarked auxiliary window behind the user's back. Ordinary native Quick Window browsing keeps normal flows.

The actual native close path must call `CanClose` on marked windows, retain unsafe active work and display the reason; Dismiss uses the same guard. A plain in-progress page request can be cancelled by dismissing its own preview. Agent ownership, media/capture, DevTools, modal/beforeunload state and profile downloads guard close. Promotion keeps beforeunload/form state because it moves the exact tab; it waits for loading and refuses agent/media/capture/modal/download interference. Empty source popup closure during a successful move is allowed. Existing browser-wide shutdown/custody policy still governs global shutdown; this helper's close check is not a new drain certificate.

### Promotion and organization

`Promote(popup, destination_or_null, stable_space_id_or_empty, callback)` refuses cross-profile targets. Without an explicit target it uses the surviving original normal source window, otherwise Chromium opens/finds an actual same-profile normal window. A ready actual OrganizationWindowController must select the destination Space before transfer. A loading/unavailable Space refuses, leaving the preview intact; retry after the native destination is ready.

The actual `chrome::MoveTabsToExistingWindow` transfers the same TabModel/WebContents/history exactly once. The tab handle is checked in the destination after transfer; there is no URL reopen fallback. TYPE_POPUP windows are omitted from session restore and must remain excluded from shared organization registration until their tab enters a normal window. Normal controller insertion observes/registers the transferred view. No global tab IDs are fabricated, and no view crosses profiles.

## Verification status

Exact four-file source inventory and patch replay checked. Native source has not been compiled or run by this worker. Root must integrate the above mandatory hooks and controls before this feature is reachable or described as ready. No extra copied CSS/rounded-corner owner was added, so actual material/corner fidelity depends on the preserved native popup/frame owners and the integrated native controls.

Later focused disposable acceptance: explicit link Peek → navigate → dismiss (source untouched); one POST/download refusal; exact-tab promotion preserving history; empty quick window and URL quick window → same-profile/Space promotion; one active-work refusal; ordinary click unchanged when off. This is sufficient without a broad repeated browser test suite.
