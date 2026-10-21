# Restore an unambiguous saved profile workspace before switching

Pinned v603. Necessary Chromium155 integration using actual SessionRestore machinery; not a claim that this adaptation was recovered verbatim. Composes with empty-cache liveness and close-drain proposals, which touch other files.

## Behavior

Before source bindings or tab transfer, prepare the target's positively owned cache without adding NTP. Existing real collections, already-restored profiles, other live workspaces and startup preferences that do not request last-session restoration keep their current behavior. For a genuinely fresh target requiring restoration, invoke an explicit internal cache-only SessionRestore entrypoint. This validates normal regular unlocked profile, positive immutable cache role, empty model, no closing/deletion and no concurrent profile restore.

Use the actual async session read and existing tab/navigation/group/split/pinned/extra-data restoration pipeline. Before any restored tab is created, require exactly one saved normal window (or an empty session). Read errors, multiple windows and popups reject before merging, creating windows, pruning session windows or deleting stale session data. The hidden-cache mode permits the existing-browser branch despite invisibility and suppresses final Activate; it never enables fallback window creation or app restoration. Existing ordinary restore callers are unchanged.

A valid saved window restores into the genuine cache, preserving its native selection/groups/tab metadata through the existing implementation. Empty/no-session results alone permit the existing NTP fallback. Completion posts after the restore owner's scheduled deletion, then rechecks weak sender/source/target identities and request generation. The existing transaction prepares a fresh binding plan and checks all guards. A one-shot setup marker retains the genuine cache Actor/scrim settlement continuation even though preparation now happens before transaction cache-presence detection. Pending or failed restore states cannot proceed through the transaction's NTP fallback.

Cache state is window-owned: not-started, pending, ready or blocked. No process-global profile registry or files are fabricated. Browser closure cancels the actual restore owner and posts failed completion; weak continuation cannot resurrect the closed sender/cache. No input profile names, paths, tabs or secrets are logged.

## Explicit bounded limitation

Multiple saved windows and saved popups remain unmerged. The existing native asynchronous warning dialog explains that the session was left untouched and directs the user to open the profile in its own window to restore/organize it. The request fails; it does not silently replace the saved collection with NTP. Full per-window cache association is outside this bounded implementation. Startup acceptance still pins the exact approved profile-directory and does not infer new storage scope.

## Verification

Every transformation uses a one-occurrence anchor. Isolated git apply check and replay reproduce all eight pinned output SHA-256 hashes. No shared native mutation, build, runtime, signing, owner state or credentials accessed. Integrator focused compile: session_restore, aux_profile_switch_workspaces, aux_profile_switch_request, aux_profile_switch_transaction (header dependents rebuild normally).

Lean actual acceptance: disposable profile configured for last-session restore with one saved normal window; launch approved profile and select inactive profile; confirm no extra visible window, original tabs/selection/groups preserved and real switch completes. Verify empty saved session still gets NTP; a multiwindow session presents refusal and remains unmerged; close the sender while the async read is pending and confirm no continuation activates it. Run one forward/reverse switch to verify existing scrim settlement and source UI remain intact.
