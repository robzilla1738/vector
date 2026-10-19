# Stable Skills service binding with actual Toast cold ownership

This four-source Chromium155 adaptation implements the previously identified actual binding; it does not replace supplied Skills UI or reconstruct BrowserWindowFeatures.

## Production Toast cold query

`ToastController::HasPendingToastWork()` examines the real queued ToastParams, current toast ID, actual close closure, actual Widget/View, scoped Widget observation, close timer, and mutation depth across show/queue/close/destruction callbacks. It does not expose testing getters or infer a finished widget from a high-level visibility flag. It neither consumes nor destroys queued parameters or callbacks. Actual Widget destruction still runs the original close callback, subscribers and queued toast code in their original order.

ToastService/ToastRegistry remain alive. Their Skills action callbacks retain the same BWI and resolve the stable Skills controller at real click time; they do not cache a Profile. ToastController's tab observation is also dynamic. The patch fixes its actual OnActiveTabChanged null-active-tab dereference by retiring only the old Omnibox/WebContents observations before returning for a genuinely empty model. It does not close/clear a toast or queue on that new empty path. Real subsequent activation binds the actual tab and runs stock tab-scoped toast rules.

## Stable Skills controller API

* `CanRebindForAuxProfileSwitch()` requires the actual registered normal regular window, no current private callback stack, no actual pending deletions/v2 delete callbacks, no production Toast pending work, and no actual showing tab Skills dialogs. It does not close a dialog, complete a deletion, fabricate a callback result, reload a Skills page, or revoke an active toast to become eligible.
* `PrepareForAuxProfileSwitch()` captures the exact source Profile, detaches the actual source IdentityManager observation, resets the actual PrefChangeRegistrar, and retires its private weak tasks only after that cold proof. Same controller, userdata registration and metadata survive. Pending source deletions are forbidden rather than completed through a different service.
* `RebindForAuxProfileSwitch(target)` requires committed regular target identity and the actual empty transfer model. It reconstructs the original pref/Identity subscriptions with real target factories. It clears only last-saved/deleted UI action metadata, never Skill objects. A prior source toast cannot later invoke a same-ID target Skill.
* `AbortForAuxProfileSwitch(source)` validates captured source, actual source Browser identity, and every restored WebContents BrowserContext. It reconstructs real source subscriptions against the populated restored model and preserves source metadata. Prepared state and captured source are consumed once.

Original constructor subscription setup is factored into `BindProfileSources()` and reused, preserving the exact preference name, callback body and identity service. Normal user/observer entrypoints have scoped callback depth and CHECK that a synchronous transfer has not reentered them. These are invariant guards, not successful no-op handling. Actual pending user work is refused by Can before effects; no pending callback is discarded to obtain a target state.

## Owner contract and remaining limits

Provider cold-checks this owner and the Toast query before any effects and again at its Begin boundary. Its existing synchronous/no-message-pump invariant must hold between Prepare and commit/abort; if cache construction or service callbacks can yield, the core needs recoverable revalidation before irreversible identity change rather than a late CHECK. No UI trigger/full-switch readiness is claimed by this proposal. Stable ToastService does not require reconstruction or a synthetic lifecycle event.

Source evidence: `skills_ui_window_controller.cc` constructor/deletion/toast-close/destructor/invoke paths; `ToastController::OnWidgetDestroyed` runs closures/subscribers before clearing state, then displays actual queued params; `ToastService::RegisterToasts` Skills callbacks resolve the same window's controller dynamically; `PrefChangeRegistrar::Reset` removes observations and clears the old PrefService. The manifest pins four baseline/output SHAs. Isolated patch check/replay, exact output equality and unchanged shared source hashes passed. No native build/runtime, owner profiles/skills, credentials, Keychain or OS grants were accessed. Compilation and functional acceptance remain pending.
