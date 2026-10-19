# Stable vertical-strip state and profile sources

`vertical-controller.patch` adapts only vertical_tab_strip_state_controller.{h,cc}, with exact appliedv32 input/output hashes in vertical-controller-manifest.json. It adds internal Mac+Aux transaction hooks, with no switch trigger or caller. No shared source edits, build or runtime acceptance.

## What stays with the actual window

The SAME controller, native-view delegate, its SetCollapsed callback, root ActionItem, resize state, enable locks, SessionID, browser activation subscription and all view callback lists survive. `state_.collapsed` and `state_.uncollapsed_width` are retained exactly.

There is **no cached-controller state copy** and no re-read of initial collapsed/width prefs. The parent recovery of original455cfec proves that a hidden cached workspace is deliberately created expanded with the active strip's width. That preview geometry is not evidence of a desired restored collapsed state. No original helper proving a cached-state restore was found. Copying that geometry to the live window would create an unsupported behavior change.

Mode and expand-on-hover settings are genuinely profile-owned preferences in155; the hook reads those from the target PrefService. The active window's collapse and width remain independent per-window state, as represented by VerticalTabStripState and current controller getters/setters.

## Concrete transaction API

1. `BeginAuxProfileSwitch()` checks a regular normal Browser, actual model/profile/pref agreement and returns a new generation. Persistence is paused for this controller only. If a prior generation has not completed yet, the last actually presented mode/hover baseline is retained for the final notifications.
2. `RebindAuxProfileSwitch(SessionService* target_service)` requires the actual model to be empty and already target-profile bound. A nonnull service must belong to that exact profile. It removes the old session observer, resets the pending BrowserCollection observation and old pref registrar, binds actual target prefs and session observer, preserving existing per-window state and UI ownership. A null target session remains honestly absent; this hook does not create one.
3. `EndAuxProfileSwitch(generation)` ignores stale generations, verifies target model/prefs and requires target tabs to be present before resuming. It refreshes target mode/hover values without replaying user enable metrics, first-time pref writes or delayed-mode toasts just because the profile changed. Existing enable locks remain effective; normal lock release observes the newly bound profile prefs. Actual changes notify the existing view callback lists, the same collapse action is refreshed, and current per-window state can then be persisted to the real target session/prefs.

The owner must schedule End at its recovered generation-bound/weak-owned post-switch boundary after all profile consumers are coherent. It is not safe inside the no-callback Browser identity closure. No extra activation timing is invented here.

## Persistence and lifetime boundaries

UpdateSessionService and UpdatePrefService skip while paused, including activation/creation callback paths that reach these sinks. Profile mode/hover change handling and hover IPH wait until migration completes rather than exposing a half-bound model. Lock destruction still releases the lock count while paused; it defers profile-source UI changes until End. Tabstrip resize/collapse state itself is not reset, and there is no profile-wide saving toggle affecting other windows.

Constructor factoring preserves the existing effect sequence: pref observer setup, optional initial geometry restore, action update, browser-activation subscription, session observer/creation-readiness observation, then the existing startup IPH timer. It does not re-run constructor geometry restore or startup timers on a profile rebind. OnDestroying continues to remove the actual observed session service and clear the pointer; the existing destructor and delegate callback cleanup remain intact.

## Exact remaining source review points

The complete owner still needs real collection migration, Browser/profile identity commit, cache ownership validation, other profile-bound controllers and actual visual integration. This patch cannot make a detached tab cache appear as a registered source workspace, and it cannot establish whole profile parity by itself.

There is a separate current155 cache-creation effect worth reviewing against the original: constructor SetUncollapsedWidth(restored source width) calls NotifyCollapseChanged, then UpdatePrefService, even before a hidden cache is registered as ready. Session writes wait for BrowserCollection readiness, but pref writes do not. The factory intentionally supplies original expanded preview geometry. This proposal does not invent a hidden-cache exception to that current constructor behavior without original controller evidence.

## Evidence and checks

Current controller/state, BrowserWindowFeatures creation arguments and session API sources are SHA-pinned in source-evidence.json. Parent native-profile-switch-workspace/original-cache-create.txt pins the forced-expanded/source-width original algorithm; corresponding manifest/README are separately source-pinned here. Original cached state restoration remains unproven, explicitly rejected as an assumption.

The two-source patch independently replays in a disposable temporary tree and matches both final SHA256 outputs. Native compilation and actual UI/profile-switch runtime acceptance remain pending. No target/native execution, profile/preferences read, OS grant, Keychain, network or shared checkout write occurred.
