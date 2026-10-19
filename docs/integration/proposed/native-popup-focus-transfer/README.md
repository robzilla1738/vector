# Supplied popup activation and options focus transfer

This one-file incremental proposal applies after `native-popup-keepalive` (`af2456f90`). It removes the independently introduced100ms blur timer and restores the recovered source's zero-delay weak callbacks and options focus-transfer states. The exact popup baseline/output are in `manifest.json`. There are no shared edits, supplied extension edits, new GN dependencies, builds or OS actions.

## Exact source conditions

- `045975a8` OnWidgetActivationChanged: active notifications matter only for the main widget in state1. Inactive options notifications are ignored during states1/2; other unrelated widgets are ignored. Remaining inactive notifications post a coordinator-weak callback at delay0.
- `04597a94` deferred inactive callback: return while picker+98 is set, main is active, or options is active. Otherwise set main delegate+e1 tofalse, clear its saved prior key-window state, and tail-call CloseOptions. **There is no explicit main Hide call.** This proposal preserves the original main visibility rather than inventing one.
- `0459936c` explicit options close: if main native window is not live/visible, close options. If both native windows are live/visible, state0→1, ActivateWindow(main), and post FinishOptionsWindowFocusTransfer if main is already active. Otherwise close options then post a fallback ActivateWindow guarded by options still absent (`045995fc`).
- `04597798` finish: only state1. Invalid main/content/options retires options and resets state0. If main is not yet active, wait for its activation callback. Once active, focus main content, set state2 and hide the live/visible options window. Already hidden/unavailable options instead reset0 and post close.
- `04597b18` options visibility callback: only options becoming invisible in state2. Reset0, then post weak CloseOptions at delay0. It never destroys its widget in the native visibility callback stack.
- `04597c38` close: reset picker/focus state, mark actual options WebContents hidden, detach its observer, and destroy the actual options tree. `045983e0` main activation sets delegate+e1 true and captures prior app focus before real activation/content focus.

All bounded original instructions and retained decompile inputs are pinned. The exact132-byte inactive body is distinguished from trailing adjacent functions. NativeVisibilityState is a bounded matching prefix, not a claimed complete method. Decompiled external/PIC calls remain static evidence, not runtime observations.

## Resolved native fields and155 adaptation

Main Widget construction at `0298c018` installs vptr `0e355210`; its +190 slot resolves to `043f1100`, which reads the native active flag. Main delegate vptr `0e504760` +70 resolves to `0a6e6af0`, exactly `ldrb w0,[x0,#e1]; ret`; preceding resize/fullscreen/maximize/minimize getters establish CanActivate's sequence.155's actual `WidgetDelegate::SetCanActivate`/`CanActivate` setter/getter use that same property. No arbitrary delegate offset is written in the port.

Original native visibility helper `02b425fc` has the same macOS14 remote-host activation-yield branch and SetVisibilityState dispatch as155 `NativeWidgetMacNSWindowHost::SetVisibilityState`. Its state0 child hide uses155 Widget::Hide, whose implementation sends actual kHideWindow. Main activation/content focus uses155 Widget::Activate and the existing WebView::RequestFocus path. The existing original-derived Aux capture/clear/restore Mac helpers are preserved; no new NSApp focus behavior is invented.

The retained Aux manager is a process singleton whereas the original coordinator is profile-bound. A WeakPtrFactory invalidated at DestroyWindows provides the original retirement cancellation boundary: disable, profile change/destruction, fresh tree replacement and process shutdown cancel callbacks before replacing the actual widgets. Normal hide/reopen does not recreate the coordinator or arbitrarily invalidate its weak callbacks. New options start idle; actual options destruction removes observation first. The separate asynchronous real-security response generation remains unchanged.

This proposal does not alter actual lock gates/routes, picker eligibility/results, saved shortcut defaults, resize/material/animation code, user-provided component structure or CSS. It does not claim an observed OS focus result. `verify.py` pins/replays the one-file correction and checks the recovered callback guards/order, weak retirement, unchanged security and ordinary resize boundary. Native compile and real disposable focus observation remain root verification.
