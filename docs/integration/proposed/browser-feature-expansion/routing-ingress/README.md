# Native external URL ingress

Source proposal, not runtime acceptance. Preserves normal browser UI and existing selected startup/profile selection. No app lifecycle, profiles, credentials or selected native source were touched.

## Delivered

- `application:openURLs:` marks actual macOS receipt tabs with one native-only, nonserialized authority bit. The bit survives the existing startup queue. It is not inferred from `is_untrusted_launch`, the sender-app string, URL parameters, renderer gestures, restored sessions or bookmark navigation.
- After `RunInLastProfileSafely` and existing native incognito policy choose the profile, the ingress checks routing against that actual profile. No inferred account or caller-specified storage path.
- Already-running `ProcessSingleton` argv enters at `ProcessCommandLineWithProfile`, after native profile loading. Only plain HTTP(S) arguments with no switches other than existing profile/user-data directory selectors are intercepted. App, headless, restore, incognito, extension and other command flags retain the original startup path.
- A batch with no handled rules remains entirely on the original native path. A mixed handled batch advances in input order; each native unmatched continuation finishes its synchronous opening before the next URL is dispatched, and each routed URL waits for its actual asynchronous routing callback. This preserves navigation dispatch order, not network completion order.
- The batch holds a weak native profile, cookie-binding epoch, admitted generation, actual held roots, and rule snapshot. Profile unload/change, admission closure, root loss or rule edits stop the remaining batch. Existing `routing::Open` performs its own destination checks through profile/window creation.
- Every matched refusal is consumed. One native warning appears per failed batch; URLs, credentials, query strings and account details are neither shown nor logged. There is no wrong-profile fallback.
- Unmatched continuations clear the receipt bit before calling the original native opening function, preserving the original tab fields and existing privacy/opaque-initiator handling. The native argv continuation regenerates the original last-opened profile list only when invoked; it never retains raw profile pointers across asynchronous waits.

## Integrator contract

Add `chrome/browser/aux/routing/external_routing_ingress.cc`, `cold_start_routing.cc` and `shortcut_routing_mac.mm` to the selected native Mac Aux sources with their shared header. Apply the ten counted edits in `shared-edits.json` to the current composition, not wholesale baseline replacement. Shared paths: `chrome/browser/ui/startup/startup_tab.h`, `chrome/browser/app_controller_mac.mm`, `chrome/browser/ui/startup/startup_browser_creator.cc`, `chrome/browser/ui/startup/startup_browser_creator_impl.cc`.

`MaybeRouteExternalTabs(Profile*, StartupTabs, NativeTabFallback)` transfers an entire batch only when at least one marked URL is handled/refused. False leaves all tabs unchanged. `MaybeRouteExternalCommandLine` has the same transfer contract for the narrow native argv form. These are native receipt APIs; do not expose them to the extension/daemon bridge or renderer navigation. Existing JS routing must remain `Authority::kCurrentProfile`.

`StartupTab::aux_native_external_receipt` defaults false, is never persisted, and is set only by the macOS receipt and dedicated native command-line helper. Actual `.webloc`/`.crwebloc` native file receipts retain their bit only while the native resolver converts them to a validated HTTP(S) URL. No arbitrary-path renderer/daemon API is added. Other schemes outside these native shortcut files retain the original handlers; unsupported shortcut targets refuse visibly.

## Focused verification and remaining acceptance

Both leaf patch replay and all ten shared anchors replay successfully against pinned byte hashes. This verifies reproducibility only. Root owns the native compile and disposable app check. Necessary behavior checks: mixed matched/unmatched URL dispatch order; unavailable target never opens in source; changed profile/rules while waiting cancel; OS receipt before startup survives queue; ordinary renderer/window.open/session restore never enters external routing; argv selectors preserve native profile choice; incognito/auth callbacks retain native policy.

Direct executable cold-start HTTP(S) argv and actual OS shortcut-file receipts are now implemented as source, with these contracts:

- Initial argv tabs are marked immediately after the native command-line provider and before reset/pinned/preferences tabs are combined. Only supported ordinary URL arguments with profile selectors qualify; process restart/login/resume arguments never acquire new receipt authority.
- Startup behavior, restore options and original `HAS_CMD_LINE_TABS` are calculated before partitioning. Native reset/pinned/session entries remain unchanged. The native restore/create runs first and returns its real browser. The continuation holds copied URLs, weak profile, held roots, cookie epoch, admitted generation and exact rule snapshot across that call; no stack launcher/raw profile is retained asynchronously.
- Admission must be established when preparing the continuation and remain current afterward. If unavailable or changed, withheld links are refused visibly rather than opened in the source profile. No provider calls occur before native admission.
- Chromium's existing empty-startup NTP fallback remains. If this was a new empty source window (not a synchronous restored session), the first unmatched URL replaces that placeholder. Restored NTPs/pinned/reset tabs are never removed. Routed URLs may leave the original profile's ordinary startup window open, consistent with native startup creation; this should be evaluated in the disposable UI check.
- Native file-open receipts are resolved one at a time on the blocking pool, then select the profile through existing `RunInProfileSafely`/`RunInLastProfileSafely`. Plain `.webloc` uses its URL and the native last safe profile; `.crwebloc` uses the supplied `CrProfile` safe basename. As in the existing Chromium resolver, a missing shortcut profile selects the native last safe profile before rule evaluation; a matched routing destination refusal never falls back.
- Plist extraction directly follows the supplied ChromeWeblocFile format using Foundation's parser and Chromium's SafeBaseName, with a 64 KiB read bound, Objective-C type checks and no whole-plist/path logging. There is no second file read/TOCTOU reinterpretation. Only valid HTTP(S) targets without embedded credentials enter this route. Invalid/unreadable/unsupported files show one native warning; their bytes are not navigated or interpreted as a URL.
- Native shortcut batching waits for each profile load and routed open settlement before advancing. A nonreceipt shortcut mixed into a legacy startup queue delegates to its original resolver without gaining routing authority; that unrelated legacy resolver retains its existing scheduling.

Follow-up shared proposal is cumulative over `bf48609dd`: the new anchors are `resolve-native-shortcuts`, `include-cold-start-ingress`, `mark-actual-cold-argv`, and `preserve-restore-before-routing`. Apply only those new anchors if the first six are already integrated. The four-file leaf manifest is authoritative for the updated optional settlement/window-owner callback in `MaybeRouteExternalTabs`.

Remaining work for these paths is native compilation and one disposable mixed startup/shortcut behavior check, including restore, missing profile, owner change and no duplicate links. Special argv switches outside the documented ordinary-URL form intentionally retain Chromium's native behavior. No known unsupported cold-start HTTP(S)/native `.webloc` implementation gap is being represented as accepted runtime behavior.

No actual app launch, profile I/O, provider call, signing or release was performed. Native warning UI and timing remain unobserved until integration.
