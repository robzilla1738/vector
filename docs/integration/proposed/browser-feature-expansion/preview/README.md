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

## Native ingress and decorator completion — 2026-10-23

The earlier decorator/ingress gap now has source implementation. Root must apply
`shared-edits.json` as counted narrow edits to its current composed shared sources,
not replace shared files. `shared-native.patch` and `shared-baseline/` are the exact
review/replay equivalents. They pin 8 shared files and 26 edits; BrowserView uses
the root integration proposal as baseline, other files use the selected projected
native tree. No selected native files were changed by this lane.

New source owners:

- `aux_preview_controls.{h,cc}` installs native `ToolbarButton` Back, Dismiss and
  Promote plus a native profile/restriction label into TYPE_POPUP's existing
  toolbar FlexLayout. The actual LocationBarView/security model is retained.
  Controller `Open` calls `EnsureNativePreviewControls` before creation, so there
  is no missing external initialization requirement. Native toolbar preferred
  and minimum widths include the added controls. No existing colors, glass,
  radii, corners or normal-window layout are replaced.
- `aux_preview_ingress.{h,cc}` attaches a WebContents observer through TabHelpers.
  Only native left mouse input with no modifiers (opt-in preference) or Option
  alone can create a one-second, one-use pending intent. Cmd/middle/other clicks
  retain normal behavior. The existing content input router's trusted link
  receipt validates the native nonce, actual document and href; its selected
  `OnNativeTrustedMouseDownLink(frame,href)` callback confirms the pending intent.
  The requested URL must exactly match that acknowledged link. Browser-native
  roots/admission generation, cookie epoch, weak source document and actual
  active profile/window are rechecked before the queued native popup creation.
  No renderer-selected permission flag or standalone URL endpoint is introduced.
- `CanOpenQuick(actualBrowser)` supports root native command enablement.
  `OpenQuick(..., GURL("about:blank"))` normalizes to the empty native new-window
  path and focuses the real address bar. Ordinary URL input remains HTTP(S).

Counted shared hooks implement:

1. Context menu append/enable/execute for reserved command 34140, bound to the
   exact context RenderFrameHost and actual link URL. The selected command header
   had no 34140 use when reserved. No renderer-supplied profile selector.
2. Automatic/Option-click via OpenURLFromTab and the actual main-frame navigation
   throttle before starting the original navigation. Normal anchor-only movement,
   POST, missing trusted receipt, unsupported schemes and explicit modified-tab
   actions keep their existing path. Automatic mode is deliberately primary-frame
   only; iframe links can use the actual context-menu action.
3. Trusted-link callback wiring under ENABLE_AUX_BROWSER + IS_MAC. The retired
   shell's ContentBlockingController remains separate and is not activated.
4. Preview direct downloads, new windows/contents and external protocols refuse
   before their relevant native delegation; ReviewNativePopupCreation handles
   window creation before AddNewContents, which remains a second guard. Normal
   profile Option-download dispatch can be consumed as Peek only with a confirmed
   native modifier/link intent. No claim that arbitrary subresource network
   traffic is suppressed; Chromium retains ordinary network/permission policy.
5. Navigation throttle for start, redirects, responses/downloads and commits
   without URLLoader. Quick windows use normal policy but retain current-owner
   checks. Peek requires promotion for unsupported actions.
6. Actual BrowserView window-close and UnloadController tab-close fences call
   native active-work guards and show restrictions in the native preview toolbar.
   Existing profile-switch/drain/shutdown owners remain independent.

`PageIdentity` lives under `ui/aux/` but is NOT a retired-shell-only authority:
selected `chrome/browser/ui/BUILD.gn` already depends on
`//chrome/browser/aux:page_identity`, and the selected organization controller
uses that same actual `runtime_owned()` marker. ActorUiTabController supplies the
other existing active-work guard. No fallback shell service is used.

Root integration needs the four new helper files in the native target, plus its
already planned controller/throttle registrations. The counted patch includes
all shared calls; a full source replacement would incorrectly overwrite root
command/split work. No new private JS API is required for Peek/Quick; native
context menu and command34135 are the user entry points.

Source replay covers all 8 leaf files and all 26 shared edits in temporary
storage. Native compile, actual input dispatch timing, tiny-window origin width,
close/promotion behavior and comparison with the actual app are still runtime
acceptance checks. If a trusted link receipt arrives too late for its request,
that request retains normal navigation; no guessed receipt is substituted.
