# Per-window persistence guard and helper profile rebind

`session-helper.patch` is a concrete two-source155 adaptation of original Browser migration suppression (`+0x105`, sequence `+0x108`, zero-delay reset0455d804). It only modifies `SessionServiceBrowserHelper`; manifest pins exact appliedv32 inputs/outputs. No shared writes, native compilation or runtime acceptance.

The current helper has moved the session/history effects out of the original Browser observer. It cannot be rebound merely by changing Browser.profile_. Its stored profile reference is made rebindable, with internal Mac+ENABLE_AUX_BROWSER-only entry points:

- `uint64_t BeginAuxProfileSwitch()`: normal regular window only, checks actual model/profile agreement, enables this helper's persistence suppression and returns its next generation. A subsequent real switch can supersede a still-pending reset from the previous one.
- `RebindAuxProfileSwitch(target_profile)`: only while suppressed, regular target only, actual model empty and already bound to that exact target profile. Changes the same helper's profile reference. No model/observer/helper replacement.
- `EndAuxProfileSwitch(generation)`: stale generation is ignored, current generation must still be suppressed; verifies model/profile and every actual WebContents BrowserContext before resuming. The owner must schedule this at the recovered zero-delay post-switch boundary, using its own weak lifetime cancellation. This helper does not introduce a different activation timing.

All real service getters and private history/group/split persistence sinks skip while suppressed; the two observer callbacks with direct factory access are guarded too. `OnTabStripModelChanged` deliberately remains active: required SessionTabHelper::SetWindowID runs on actual insertion/replacement even during migration. Removing this observer would silently lose that bookkeeping. No profile-wide SessionService flag is changed and other windows continue to save normally.

There is no synthetic success result or automatic rebuild on resume. The separately recovered500ms touched-profile scheduler rebuilds genuine registered workspaces. The complete owner still must preserve real tab/collection ownership, cached Profile keepalives and hidden-role registration, then rebind other profile-bound controllers and schedule matching generation completion. The adaptation does not pause direct SessionTabHelper navigation events globally or claim to finish every profile consumer.

Original proof windows and v32 helper sources are SHA-pinned in source-evidence.json; raw_ref assignment support is actual `partition_alloc/pointers/raw_ref.h` operator=(T&). Both source outputs independently replay with matching hashes in a disposable temporary tree. Native build and actual profile switching remain pending. No profile/Keychain/OS or network operation was performed.
