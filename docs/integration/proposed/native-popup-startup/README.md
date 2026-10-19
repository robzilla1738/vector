# Popup startup and preference observation

This incremental proposal registers the saved global shortcut from the actual browser startup path, observes local-state changes, and removes registration/profile mutation from `getEnabled`. It changes no supplied extension bytes, routes, defaults, sizes, materials or activation timing. `manifest.json` pins all four current native inputs and proposed outputs. Apply only on those exact baselines after `native-popup-retirement`.

## Recovered source behavior

The pinned arm64 AddedToWidget body starts at `036d87c0`: its initialized guard returns before reinitialization. After accelerator setup, `036d8f24..036d8f50` checks Browser type `+60==0`, excludes the bit at Browser `+f0`, loads its actual Profile from `+68`, obtains singleton `04594700`, then invokes coordinator factory `04594b00`. The method identification is derived from the surrounding widget observation, toolbar initialization and accelerator setup; raw instruction bounds and hashes are recorded, not claimed original C++ source.

The cache bit is independently established by the original constructor `031cd628` (CreateParams `+71` to Browser `+f0`) and the existing `native-profile-switch-workspace` proposal. Its actual155 equivalent is `BrowserInitState::From(browser)->is_aux_profile_switch_cache()`. It is not an incognito flag or `omit_from_session_restore`.

Singleton `04594700` initializes a real local-state registrar and subscribes to enabled and shortcut changes. `04599728` creates a coordinator only when enabled with an already-loaded last-used profile; when disabled it retires the coordinator and shortcut. `027a55f4` resolves the manager's last-used profile directory through its loaded-profile lookup, matching155 `ProfileManager::GetLastUsedProfileIfLoaded()`. No loading, guessed profile or default account is introduced. Factory `04594b00` rejects OTR/null profiles, disabled state and an existing coordinator.

Shortcut observer `045996ac` unregisters the prior accelerator, clears its registered tuple and refreshes registration through `04599e90`; it does not close an existing popup. GetEnabled `0427ca84` reads the real enabled preference without a manager lookup or shortcut registration.

## Port and integration

- `BrowserView::AddedToWidget`, after `LoadAccelerators`, invokes initialization for actual normal non-cache browsers. Repeated browser construction does not replace an existing registered coordinator.
- Local-state `PrefChangeRegistrar` subscriptions apply external/managed enabled and shortcut changes. Startup/observer registration failures are real warnings, never successful registration claims. API setters retain their existing synchronous validation/error behavior; their own synchronous preference notification is suppressed to avoid registering the same accelerator twice.
- Disabling does not parse a shortcut, and can unregister while shortcut handling is suspended.155 `GlobalAcceleratorListener::UnregisterAccelerator` explicitly handles suspension while removing its map entry. Profile destruction likewise removes the real registration even when suspended.
- The pure getters return before constructing the singleton, so reading a preference cannot bind/retire another profile's popup or fail because an OS shortcut is occupied.
- `PostMainMessageLoopRun` retires observers/widgets/registration before profile gates/platform shutdown. This is an explicit155 lifecycle adaptation to the retained NoDestructor manager. It is not an original runtime observation.

Root must add `//chrome/browser/extensions/api/aux_mini_popup` as a direct dependency of the owner targets for BrowserView and ChromeBrowserMainParts. No GN files or shared source were edited here. The header-only target cannot satisfy the new function calls. Do not integrate the getter change separately from startup and preference registration.

## Bounded gaps

Original successful registration also acquires a restart-enabled keepalive with numeric origin25. Its153 enum identity has not yet been established against155, so this patch does not invent an enum or claim last-browser-window app lifetime parity. Existing default enabled/shortcut and locked-route behavior remain unproved and unchanged. Original preference-setter canonicalization/failure rollback is not fully ported here; current real API errors are preserved.

The separately recovered inactive callback `04597a94` has a132-byte body: it skips a pending picker and either widget's active predicate, then performs its real hide path. `045975a8` posts zero-delay weak callbacks, while `04597798` coordinates an options focus-transfer state. The current100ms dismissal remains unchanged until the virtual active predicate and all transfer-state writers/lifecycle are established together. A short bounded extraction contains trailing bytes beyond the actual132-byte body; only the real132 bytes are pinned as the function, and the REA provider reports external-call/PIC truncation rather than runtime proof.

`python3 verify.py` checks pinned supplied bytes, all four native baseline/output hashes, exact patch replay and the startup/getter/observer boundaries. No native compilation, registration, dialogs, shortcuts, OS action, signing, owner state or runtime acceptance occurred.
