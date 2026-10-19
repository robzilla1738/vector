# Owned scheduler permits for child waits

Follows `docs/spec/daemon/agent.md` Tool inventory/Subagents and Streaming/concurrency. This is a separate followup to the delegation/routine slice. The existing run semaphore could deadlock when every active parent held a slot while waiting on a queued child.

The proposed shared engine patch tracks exactly which account/session runs hold acquired permits. Both model and external runs register ownership immediately after acquisition and release only a permit still in that set. `yieldRunSlot` rejects nonowners, releases one owned permit for the supplied child wait, and reacquires using the same run abort signal before returning to the caller. Cancellation during waiting/reacquisition leaves no permit for the outer finally to decrement twice. Generic human suspensions do not yield; an active provider stream retains its slot. No additional delegation depth or global concurrency is granted.

`subagent_wait` checks all child/account/parent identities, bounds and deduplicates the request, then uses that seam around the owned child wait. It fails explicitly if shared scheduler integration is absent. Waiting preserves child status/transcript and cancellation checks.

## Verification

Three actual `runExternal` fixtures pass using a scratch bundle of the proposed shared engine code: two simultaneous parents plus two queued children at concurrency two; cancellation while awaiting a child; cancellation while the parent waits to reacquire behind an unrelated run. Tests assert the active counter stays nonnegative and within capacity, cancellation does not release the unrelated run's permit, and both the counter and owned-permit set reach zero after shutdown. No provider/model call was made. Agent/daemon typechecks and touched-file Biome pass.

The scratch bundle also passed real central-hook idle-parent approval, conflicting prompt rejection, parent response and parent-cancel/child-abort cleanup. This extends the first slice's explicitly modeled unit evidence. Shared workspace engine files remain unchanged in this lane.

Apply `docs/implementation/agent-tool-hooks.patch` first, then `docs/implementation/agent-scheduler-hooks.patch`. Root owns those shared edits and the routine tool mount. Normal tests import the actual engine; before root application, the scheduler fixture supports an explicit test-only `AUX_TEST_SCHEDULER_ENGINE` module path pointing to the proposed scratch bundle. The fixture never builds or patches shared files. Integrated model-driven child work and approval/routine behavior still require acceptance observations. Native0101 remains staged and unapplied.
