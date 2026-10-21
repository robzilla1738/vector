# Drain pending settled workspace snapshots before close

Pinned v603; composes with native-empty-cache-session-liveness (different files). The original 500ms generation batching stays unchanged during normal use.

ProfileSwitchSessionRebuild now registers its live UI-sequence owners and exposes a synchronous pending-only drain. On accepted OnWindowClosing (after all close admission checks, before WindowClosing/session tab detach) and OnShutdownStarting (before teardown), snapshot weak rebuild-owner identities, advance their generations, and run the existing rebuild of already-loaded profiles/existing saving SessionServices. This serializes real settled collections before destruction. Older queued generations do nothing. No pending paths means no reset. No new profiles/services, nested loops, forced save or filesystem operations are introduced; normal SessionService/CommandStorageManager shutdown still flushes actual scheduled commands.

Weak snapshots tolerate an owner disappearing during a preceding rebuild; membership is removed on destruction. UI-sequence assertions retain existing threading contract. The actual profile-switch mutation cannot interleave with these close points because it is synchronous and close is deferred while mutation flags are set. The drain does not run at destruction, when collection data could already be gone.

Count-checked replacements and isolated full patch/hash replay passed. Native compile/runtime not performed by lane. Focused targets are aux_profile_switch_session_rebuild, unload_controller and browser_shutdown. Actual disposable check: switch then immediately quit, reopen via legitimate startup preferences and inspect saved state. This patch does not implement inactive-cache restoration, supplied separately.
