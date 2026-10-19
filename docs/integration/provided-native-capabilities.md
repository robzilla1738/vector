# Required capture and extension-launch native adapters

2026-10-19. Staged-only patch: `proposed/native-provided-capture-launch.patch`; exact source/output SHA-256 plus sequential count-one edits: adjacent JSON. No shared native edit, compile, app launch, screenshot, OS prompt or owner profile access. Original supplied UI consumers remain intact.

## Static native evidence

The supplied native map targets Chromium153 arm64 framework hash `64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c`. This matches the arm64 slice of the installed static framework at `/Applications/Aside.app/Contents/Frameworks/Aside Framework.framework/Versions/1.0.928.1/Aside Framework`; universal-file hash is `0338d5517ac8910ff0f821f573e0b297107e0df6d914c3989986051ca6b745db`. It is older than the pinned1.26 UI package. Do not infer that every newer UI experimental/canary capability is present in this framework.

`vendor/provided/audit-native-capabilities.py` reads the selected file without executing it, verifies the exact arm64 hash, records original schema/literal locations and hashes bounded original instruction ranges. Reproduce by passing that static framework path. Its output is `provided-native-capability-evidence.json`.

REA session inspection found no active target. REA rejected the universal framework for Ghidra with `architecture_unsupported` (cannot enforce slice selection); no application was launched or analysis session left open. Existing supplied decompiles and bounded arm64 instruction inspection were used instead. Instruction excerpts were disassembled through temporary tiny Mach-O carriers containing only the selected original range, preserving original RVAs; this does not recover whole-program types/call semantics. Literal absence is bounded evidence, not proof of global unsupported behavior.

Observed anchors:

- Original `management.launchExtension` schema is exactly `(id:string) → callback()/Promise<void>` with optional callback and no return values.
- Original private-entitlement guard at0x407a394 includes a native permission-set lookup comparing ID0x116 and returns the literal `Permission denied: missing private entitlements` on denial.
- Original launch Run passes target/sender/context and a context flag into delegate0x40c9570 (direct call0x407a608). Delegate resolves browser/container/action, checks enabled action, activates a window and invokes an action; it emits distinct missing-browser/action errors. Resolved roles are inferred by matching data flow and current Chromium primitives, not recovered type names.
- Original capture target lookup0x760fd90 calls0xa286780 with capture requirement0 at0x760fe10, matching current `CanCaptureVisiblePage(...,kActiveTabOrAllUrls)`; no custom private-permission bypass is present in this target lookup. The bounded original authorization routine has the standard all-URLs/activeTab flow and error literal. A bounded Run/authorization scan found no0x11x permission comparison; this is not a claim that the private permission has no other implementation anywhere.

## Capture: preserve real standard implementation

Pinned Agent already requests `<all_urls>` and calls actual `chrome.tabs.captureVisibleTab(windowId?,{format:'png'})`; it retries the actual rate-limit error once. Current Chromium `tabs_api.cc` selects the active tab in the authorised window, calls `PermissionsData::CanCaptureVisiblePage`, then performs the real asynchronous surface capture and screenshot restrictions. That already permits ordinary HTTP(S) capture with `<all_urls>` without a user-gesture check.

The staged patch registers the missing required permission `dev.aux.ext.private.capture-tab-without-userinteraction` as private, nonoptional, component-only, explicitly allowlisted to Aux Agent. The actual capture implementation/authorization stays unchanged: no artificial API response or implementation substitution, no invented protected-page bypass, no OS screenshot restriction bypass. Standard activeTab rules for chrome:/other extensions/data/Web Store and existing policy/file-access checks remain effective. Granting this compatibility declaration alone does not claim additional capture access beyond the real native implementation.

Actual runtime capture acceptance still needs disposable ordinary/protected/policy-blocked pages after build. If a later exact supplied source establishes another private permission effect, adapt that narrow behavior with separate evidence rather than guessing from its name.

## Launch: actual action invocation

The staged patch implements the original `chrome.management.launchExtension(id)` method in the existing management namespace, without modifying the supplied tabsearch caller or replacing it with a new UI route. Current API schema/function registration follows the normal existing management generator, with histogram2088 and permission284 appended. The new child API feature requires both management and the private launch permission, component location, privileged extension context and explicit Aux Agent allowlist. Native code repeats the permission/component check and rejects nonexistent/disabled targets.

A small virtual delegate seam keeps `//extensions` independent of `//chrome`. Unsupported embedders/platforms return the original unsupported error. Chrome delegates to its real `ExtensionsContainer` / `ToolbarActionViewModel`, selecting the sender's actual same-profile browser or last active ordinary browser **without crossing profile/incognito boundaries**. It verifies target availability in private mode, live active contents and enabled action, activates the window, and executes the native action. This handles actual popup/onClicked/sidepanel behavior instead of guessing an extension's root HTML. Missing browser/container/action or disabled action rejects; success acknowledges invocation only.

The original guard is a private entitlement. No new standalone user-gesture requirement was invented: the supplied caller is the user's tabsearch selection, and the original delegate invokes its user-action primitive. The adapter uses current `InvocationSource::kApi`; it does not claim popup delivery or an arbitrary action's downstream success. This is privileged browser UI functionality, unavailable to arbitrary websites/extensions.

## Verification and remaining Blink capability

The patch applies to disposable copies of all12 affected native files; all exact proposed SHA outputs match. Chromium's own comment-aware JSON parser accepts the altered management/API/permission schemas. No C++ build or action/capture was run while the shared native build is active.

`dev.aux.blink.expose-wv` / `webview.attachTab(tabId)` remains separate. The older original arm64 framework has no raw `expose-wv` or `attachTab` literal; the newer UI's experimental consumer remains unchanged. Current standard extension WebView owns new guest contents and cannot simply be aliased to an existing tab. A concrete native renderer/browser adapter can use current `GuestContentsHandle` borrowing/restore lifecycle, but must validate actual frame/profile/mode/permission, preserve original tab ownership, and detach on target/document/element destruction. Permission registration alone is not implementation, and no fake attach success is included in this patch.
