# AIM file-picker focus lifetime, pinned native610

The existing file-selector read/context ownership and settled-profile admission
are retained. This proposal fixes its presenter's separate deferred focus owner.

`OnDidChangeFocus` posts `FinishFocusRestoration` with the presenter's weak pointer.
Previously `Hide()` reset only the Boolean and FocusManager observation; it did
not invalidate the queued callback. The callback itself unconditionally activated
the popup and focused its renderer. Thus a callback queued before Hide could
steal focus after the popup closed, or operate on a newer picker cycle. Repeated
`OnFileSelectionClosed()` also called ScopedObservation::Observe without resetting
a prior observation. A missing widget/FocusManager left the restoration flag true
without any observation able to complete it.

Six count-one edits in one source file:

- Reset the old restoration cycle before starting another; mark pending only
  once its actual FocusManager exists.
- Reset the cycle when its widget is destroyed as well as on the existing Hide.
- Invalidate the presenter's dedicated weak factory when resetting. Inspection
  of the pinned source confirms its sole deferred callback is focus restoration.
  This does not cancel FileReader/native file reads, context handoffs, uploads,
  native queries, or renderer reset acknowledgments.
- Finish only a currently pending, shown AIM popup. Check the weak owner after
  synchronous focus/activation callbacks before touching it again.
- Guard the post-close reset against synchronous destruction or a newer cycle.

No profile busy guard is relaxed. Native610 selected attachments still require
empty original SearchboxContextData, renderer reset acknowledgment and original
live-idle checks before profile retirement. Pending reads/context handoffs still
hold the selector's RAII operation count. Retained conversation/context and live
AI work intentionally remain bound to their original profile.

Verification: current native file matched the native610 composition hash; all six
anchors matched exactly once; generated patch passed `git apply --check`. Header
signatures are unchanged. No shared native modifications, compile, app launch,
credentials or broad tests. Parent should include the source in its next native
build and check picker cancel/close and immediate hide/reopen focus behavior.

Reproduce source-only preparation with `python3 prepare.py`. `files.json` pins
composition/input/output hashes and every replacement. `source/` is a review copy.
