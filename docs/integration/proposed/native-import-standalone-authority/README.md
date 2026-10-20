# Original standalone importer window and retirement authority

Incremental two-file authority correction after `4d088bfee`; eight counted anchors. No shared native edits, GN/build or runtime operations.

## Source creator, not an ordinary browser tab

Supplied `04202ac4.c` and complete bounded raw `4202ac4..4202ebc` establish the real entry owner:

1. Resolve the originating Profile's original Profile, then enumerate real browser windows with callback `4203838`.
2. That callback requires actual native-backed browser state, exact creation `app_name == "aside-import-data"`, and the same original Profile. It returns the existing owner; caller invokes its native Show then Activate and returns.
3. Otherwise check actual profile window-creation status, construct app-popup creation parameters with **trusted_source=true**, **user_gesture=true**, the actual originating Profile and exact app name. Bounds are **720×500**, centered using the original owning native window bounds/display work area with positive-size fallback and `AdjustToFit` semantics. It is not an independent normal browser tab or a modal overlay inside that browser.
4. Parameter writes at `4202dc0..dc8` occur after the original `CreateForAppPopup` factory: +44 receives uint16 **1** (byte44 true, byte45 false); +a0/a2 are zero. These are pinned raw facts; do not call this “both flags true” or infer current155 parameter offsets. Root should map those fields using the existing creation-parameter evidence before adding extra flags.
5. Create the real native browser; add exactly one active `chrome://aside-import-data/` tab; configure its native appearance via `458cc00`; Show. This is the native owner later captured by source `458d5b0/458d718` and closed with `Widget::CloseNow` before completion UX.

Branding changes only app name/host to `aux-import-data`. Current root's WebUI registration makes `chrome://aux-import-data/` navigable in an ordinary browser, but registration alone does **not** implement this standalone entrypoint/ownership.

## Concrete correction implemented

`IsStandaloneImportOwner(WebContents&)` verifies actual `BrowserWindowInterface::TYPE_APP_POPUP`, fixed `BrowserInitState::app_name`, exact one-tab identity and committed importer origin. A tab URL alone never establishes native retirement authority. The exact-one-tab/origin assertions are current155 integration checks enforcing the positively proven standalone creator's ownership; they do not change importer category/source policy.

Both capture helpers now return **empty callbacks** for an ordinary browser tab. The real Handler must reject that UI context before starting an operation requiring window UX. Firefox's delivered `WebUILifecycle` already checks that required callbacks exist. Chromium/Safari Handler wiring must perform the equivalent actual-context check; never substitute an empty/no-op lifecycle and report success.

Captured callbacks retain weak initiating WebContents and weak native-window identity and recheck the complete owner at invocation. They therefore cannot close or disable a normal window, a replacement window, an importer window containing additional unrelated tabs, or contents subsequently moved to a different owner. The original Views CloseNow and NSWindow fallback remain unchanged inside that verified standalone scope.

## Minimal remaining creator integration

Root should add the original native entrypoint (actual app-popup creation, existing-window reuse and one-tab navigation) rather than reusing normal tab navigation. The source's `458cc00..458cf98` native appearance is also pinned here but is **not** independently recreated in this proposal. Its first exact operation removes style-mask bits4/8 and adds0x8000; later operations include native content/titlebar setup. Those operations need a coherent original AppKit adapter before asserting standalone visual parity. Do not silently replace them with account-popup styling or a generic dialog because both are frameless.

The delivered authority guard is usable immediately to prevent unsafe ordinary-window retirement while that actual entrypoint is implemented. It does not claim the standalone creator or its appearance is fully mounted, nor does it invent profile/window creation success. Root owns entry registration/Handler/GN.

`verify.py` checks complete original thin hash, three bounded raw ranges, both exact host/URL literals, before/after hashes, eight single-use anchors and disposable patch replay. No actual owner profiles, native windows or source data were opened.
