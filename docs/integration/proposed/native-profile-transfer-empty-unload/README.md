# Keep temporary profile-transfer emptiness out of browser close state

Pinned to actual native v597; v598 changes unrelated files. This is a Chromium155 integration lifecycle correction, not a recovered-original implementation claim. Parent observed a successful forward switch followed by `transaction.entry-state.11` on reverse.

The transaction establishes `aux_profile_switch_in_progress_` and generation-bound `aux_profile_switch_suppress_empty_` for the visible Browser and both real cache Browsers before `ProfileSwitchTabCollection::Take` detaches the final tab. It keeps suppression through target insertion or source rollback and posts generation-checked suppression release only after all finish/abort hooks. Both collection detach paths in TabStripModel notify every observer's `TabStripEmpty`.

Browser::TabStripEmpty already suppresses actual Close during this transfer. UnloadController::OnWindowClosing has the corresponding Mac/Aux concrete-Browser guard. But UnloadController separately observes TabStripEmpty and unconditionally sets `is_attempting_to_close_browser_`, poisoning the visible Browser and target cache even though no close occurred. Re-insertion never clears that flag, correctly: real close state must not be reset by adding tabs.

Apply the existing OnWindowClosing transfer predicate at the actual empty-strip notification before the assignment. Ordinary last-tab closure retains the original assignment, all entry/admission checks remain unchanged, and existing genuine close state is never cleared. A request to close during mutation still follows the transaction's existing deferred-close path after release; this patch does not modify it. Non-Aux/non-Mac builds are unchanged. Existing includes and Browser friendship already support this exact predicate in this same translation unit.

Validation: one counted replacement; isolated `git apply --check` and apply reproduce the pinned output SHA-256. No shared native mutation, build, runtime, profile access or signing performed. Integrator should compile unload_controller and then verify a fresh disposable launch can switch forward and reverse, with normal last-tab close still working. The already-running poisoned Browser must not be repaired by clearing its close flag.

The missing sidebar tab row is investigated separately by the chat parity lane; this patch makes no unsupported claim that it resolves that presentation issue.
