# Concrete importer retirement and post-load gate bindings

Incremental two-file proposal after `9b58e19ba`. Three exact anchors; no shared native changes, registration or build. New callable exports:

* `CaptureImportOwnerRetirement(WebContents&)` returns the actual once-only native owner retirement. Capture it with the original initiating contents, before the async work. It retains Chromium's weak `gfx::NativeWindow`, resolves its real Views Widget on invocation, and calls `Widget::CloseNow()`. If the native window still exists without a Views widget, it performs original `orderOut:nil` then `close`. An expired native window does nothing. It neither finds an arbitrary profile window nor stores an unowned WebContents or Browser pointer.
* `OpenImportedProfile(target_path)` performs the positively mapped actual profile load/window creation and then invokes `aux::RequestProfileBootstrap(actual_returned_browser->GetProfile())`, the already implemented original account-password gate. Null loader result does not enter the gate. No fabricated account, unlock, onboarding-complete preference or generic activation callback is introduced.

## Correction to the preceding finding

The prior README's inference that `2959bb0` was a Browser retirement / did-close primitive was incorrect. Its receiver is **views::Widget**, not Browser. Original `6f3328` resolves the native window's delegate and `28ad1d0` retrieves its weak Widget; the calling wrapper then invokes `2959bb0`. The complete latter body matches **Widget::CloseNow**: mark widget closed; reset the AX observation; protect the observer call stack; notify WidgetObserver's first non-destructor virtual (`OnWidgetClosing`, slot16); notify AnyWidgetObserverSingleton; finally invoke native-widget immediate closure. It has none of `CloseWithReason`'s close-request/OnCloseRequested early guards or placement saving. Current155 `ui/views/widget/widget.cc::CloseNow` provides precisely this primitive. The former proposed `UnloadController::OnWindowCloseComplete` interpretation would have bypassed required tab teardown and is not used.

This port uses the real Widget API, so current155 native/browser destruction and tab settlement remain owned by their existing machinery. It never publishes a synthetic Browser-did-close event or calls BrowserManager deletion itself. Original `458d5b0/458d718` retire this widget before presenting the completion dialog; the owner should retain that ordering. The already delivered Firefox owner posts completion onto an independent task, so synchronous widget destruction does not require invoking a deleted Handler afterward.

## Post-load owner identity

Original `458d2f0` consumes the actual returned browser's Profile and resolves `2e84c48/52d94(..., true)` before invoking `417c4ec`. The singleton constructor `2e84c48` uses the exact literal at `dad744a`: `AsideAccountPasswordGate`, followed by its actual source filename. Thus this is the same service already ported in `chrome/browser/aux/profile_gate.cc`; it is not a new onboarding implementation. Existing `RequestProfileBootstrap` is source-pinned to this same method in `native-profile-switch-owner/transaction-map/account-gate-policy` and `account-gate-continuation`. It retains the real suppression, completed-state, omitted/OTR, genuine-browser-presence and weak lifetime rules. The normal loader itself handles real window reuse/activation; we add no replacement activation policy.

## Handler binding

The real Firefox WebUI lifecycle can now be assembled without guessed closures:

```
lifecycle.set_controls_enabled = CaptureImportWindowControls(*contents);
lifecycle.retire_owner = CaptureImportOwnerRetirement(*contents);
lifecycle.open_profile = base::BindOnce(&OpenImportedProfile);
```

Capture before starting work; move these into the already source-owned import completion. Chromium's corresponding completion can bind `OpenImportedProfile` to its real result path only on successful destination completion. No completion UI is warranted for a failed worker/profile/write barrier. Root owns Handler and GN registration; `.mm` needs existing importer UI dependencies plus actual `//chrome/browser/aux` gate dependency and Views Widget target.

`verify.py` checks original thin hash, five bounded original code ranges, exact gate-class literal, baseline/output hashes, three anchored transformations and disposable patch replay. No actual native close, profile load, Keychain/OS operation, native build or runtime test was performed. Integration compilation/behavior observation remains root-owned.
