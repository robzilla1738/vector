# Stable Glic IPH profile lifecycle

Source-only Chromium155 platform adaptation; not compiled or runtime accepted. Original compiled feature evidence is in `glic-original-scope-evidence.json`. Patch replay and all input/output hashes are verified without shared source writes.

`CanPrepareForAuxProfileSwitch()` checks the genuine service/profile binding, active call depth, pending promo result callbacks, and both real Glic promo features' queued and active states. The upstream active query includes continued promos. No promo is aborted, dismissed or fabricated.

Owner order: call Can on every genuine cohort owner before cache effects; revalidate before Prepare; Prepare before source detach; after actual identity commits (and real target Glic eligibility/service is known), Rebind(targetService); Finish after actual target insertion. Source rollback after restored source tabs calls Abort, which verifies the captured source profile. BWF owns gained/lost eligibility separately; do not reuse this hook to manufacture an eligible service.

Same controller, user-data, WeakPtrs, window identity and `RepeatingTimer` survive. Preparation does not stop/restart the timer or reset a blocked-this-instance stop: ticks in the bounded synchronous interval return before promo dispatch. Genuine timer phase and real source result ownership remain intact. There is no task-pumping transaction assumption hidden in an empty result. The provider must refuse outstanding callbacks and retain its no-yield boundary.

The new depth leave uses a destruction-safe weak closure. Pending-result count increments before the actual promo request, decrements only on its real result, and cannot allow a profile switch during synchronous result/preload callbacks. No callbacks or ordinary metrics behavior are synthesized. This is the IPH portion only; split-button, nudge, task-bubble and service subscriptions are separately bound and still require their concrete lifecycle before enabling an owner transaction.
