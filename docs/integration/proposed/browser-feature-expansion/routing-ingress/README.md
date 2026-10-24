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

Add `chrome/browser/aux/routing/external_routing_ingress.cc` to the selected native Mac Aux sources with the two leaf files. Apply the six counted edits in `shared-edits.json` to the current composition, not wholesale baseline replacement. Shared paths: `chrome/browser/ui/startup/startup_tab.h`, `chrome/browser/app_controller_mac.mm`, `chrome/browser/ui/startup/startup_browser_creator.cc`.

`MaybeRouteExternalTabs(Profile*, StartupTabs, NativeTabFallback)` transfers an entire batch only when at least one marked URL is handled/refused. False leaves all tabs unchanged. `MaybeRouteExternalCommandLine` has the same transfer contract for the narrow native argv form. These are native receipt APIs; do not expose them to the extension/daemon bridge or renderer navigation. Existing JS routing must remain `Authority::kCurrentProfile`.

`StartupTab::aux_native_external_receipt` defaults false, is never persisted, and is set only by the macOS receipt and dedicated native command-line helper. `.webloc` files remain on Chromium's existing shortcut resolution path; their parsed targets do not inherit this bit. Unsupported schemes retain the original native handlers.

## Focused verification and remaining acceptance

Both leaf patch replay and all six shared anchors replay successfully against pinned byte hashes. This verifies reproducibility only. Root owns the native compile and disposable app check. Necessary behavior checks: mixed matched/unmatched URL dispatch order; unavailable target never opens in source; changed profile/rules while waiting cancel; OS receipt before startup survives queue; ordinary renderer/window.open/session restore never enters external routing; argv selectors preserve native profile choice; incognito/auth callbacks retain native policy.

Direct executable **cold-start argv** is not intercepted here. That path combines crash/session restoration and synchronous browser creation; it needs a separate native startup continuation rather than pretending an asynchronous routed browser is already available. Cold-start macOS Apple Events are covered via the existing queued receipt. Special argv forms and `.webloc` files intentionally retain native behavior. This is not complete universal OS/CLI route acceptance.

No actual app launch, profile I/O, provider call, signing or release was performed. Native warning UI and timing remain unobserved until integration.
