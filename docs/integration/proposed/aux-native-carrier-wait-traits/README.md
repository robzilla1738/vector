# Actual process-wait task traits

Chromium's actual `base/process/process_posix.cc` WaitForExitWithTimeout checks `AssertBaseSyncPrimitivesAllowed` when timeout is nonzero. MayBlock alone does not admit that wait. The production reaper invokes WaitForExit; the fixture queues that exact reaper. Both tasks therefore require `base::WithBaseSyncPrimitives()` in addition to their existing traits. These are scheduling permissions for actual waits, not suppression of assertions or writer admission.

`inputs.json` pins exactly two original source bytes and find/replace anchors (one occurrence each), plus the CURRENT APPLIED style-repair772-source parent composition. `prepare.py --artifact-root /Users/rcourson/Documents/Vibe/web --output <fresh-output>` authenticates/replays that parent with the existing pinned extender, preparing only these two changes. It never edits the native checkout or runs a compiler/test. Root owns apply/build after the currently active build terminates.

Prepared successor: `out/native-reuse-composition-aux-carrier-wait-traits`. All772 source records and23 unchanged canonical artwork entries verified. Exact patch, metadata and before/after copies with backup mapping remain in that output. `review-receipt.json` records the successor hash. No UI changes, runtime authority, process killing, owner operations or fixture execution occurs here.
