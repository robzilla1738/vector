# Actual inactive OS-job custody

This slice adds real per-instance job admission/accounting to the actual AppKit/QuickLook boundary and pairs it with owned native dispatcher retirement. The supplied three-second QuickLook and five-second NSWorkspace synchronous waits/results remain unchanged while admission is open. No actual OS operation or owner state is exercised by the checks.

## Native API and result meaning

`AuxAppKitUtilityBoundary` owns a distinct `AuxOSJobCustody` by default. Its immutable protocol property binds the utility core to that same tracker. There is no global selected scope or JS-created tracker/handle/capability.

The native owner now always exposes:

```swift
owner.closeOSAdmissionAndDrain(timeout: 0) -> AuxOSDrainResult
```

- `.notPresent`: this immutable owner has no attached OS utility capability. This is an actual constructor fact and says nothing about other host capabilities.
- `.drained`: this utility capability has closed admission and no tracked jobs/effects remain.
- `.pending(snapshot)`: admission is closed but jobs/effects remain; do not release host custody or accept a stopped-writer claim. Retain the exact owner and query again.
- `.untracked`: an attached boundary supplied no custody. It cannot claim absence or drain.

Pure result/snapshot declarations live in `../aux-owned-dispatch-lifetime/source/AuxOSDrainResult.swift` and must be compiled even in the minimal no-OS graph. They import Foundation only. `AUX_MACOS_UTILITY_DISPATCH` continues to include utility declarations, not runtime acceptance. The owner stores its exact optional utility core, so the native drain method still works after synchronous registry retirement/removal. Existing constructors still attach no OS capability; the new method returns `.notPresent` there.

Both actual registry `retire` (including `AuxNativeContextRetire`) and nonblocking `closeOwner` immediately close utility admission. They do not claim asynchronous drain. Deinit does not block for callbacks. An explicit native host must retain the owner/capability until the real drain result permits its OS portion to close. Crypto's separately reviewed C bridge may map notPresent/drained0, pending1, untracked2; this slice supplies no standalone C/JS host initializer.

## Actual accounting and write fences

A recognized utility `run` obtains a synchronous command job. Each real metadata/clipboard effect, image write, QuickLook request/start/callback and NSWorkspace open/start/callback is accounted under the same instance. New jobs/effects are refused once admission closes. QuickLook request construction itself is inside admitted tracked start, with a synchronized retained request slot for cancellation.

A timeout marks the job; it does not complete it. QuickLook cancellation is a separately accounted effect and is not completion. NSWorkspace has no cancellation API, so its timed-out job remains pending until actual callback delivery. If a callback never arrives, or the OS drops the callback closure, its job remains pending indefinitely rather than fabricating drain. A delivered completed request skips a redundant untracked cancel action.

Every asynchronous QuickLook callback mkdir/ImageIO PNG write passes the actual job's write fence **before** any filesystem effect. After close, a late callback gets false without mkdir/write, then actually completes its job. An effect admitted immediately before close may still finish afterward; its active effect/write counters prevent drain success until it exits. Calling completion early cannot remove a job with an in-flight write. Synchronization locks are not held over OS/callback bodies, so inline callbacks/cancellation do not recursively deadlock the tracker. Once genuinely completed/removed, a token cannot admit more writes. Callback-owned storage remains memory-valid after synchronous timeout.

This proves utility-job custody only. A successful NSWorkspace completion denotes completion of its open request, not termination of the launched application. Other native/PDF/daemon/browser/renderer writers and whole-host admission remain separate obligations. No runtime flag, source-only build or this utility result is promoted into whole-host migration acceptance.

## Focused evidence

`check-owned.sh` compiles actual AppKit/QuickLook/ImageIO source, the actual owned C dispatcher and the real minimal software-authority source graph through `scripts/native-build.py`, then runs only captured OS boundaries. Final source passed15 checks: actual C run route, C retirement, post-retirement pending query, late-write denial, nonblocking owner destruction, exact no-capability versus untracked distinction, and cancellation that remains in-flight after inline callback completion. No Security backend, app open/enumeration, clipboard, QuickLook request or owner-file IO is invoked. One existing Security SDK deprecation warning remains in a compiled but unexecuted query source.

The separate controlled callback fixture `check.sh`/`tests/main.swift` covers missing callbacks, cancellation-not-completion, already-admitted writes, post-close start rejection, inline completion and throwing write accounting. Its preliminary30-check run passed before the final native owner/type factoring; those30 unchanged tests and earlier utility31/default fixtures were not repeated. The final15-check combined fixture covers the final integration and new cancellation-effect accounting.

New `source-pins.json` records the final actual compiler inputs and baseline owned-source SHA; `verify-source.py` validates those pins and proves existing no-OS call bodies remain identical after removing only the new additive drain query. Earlier review manifests/receipts remain historical. Root must refresh current composed source/dependency pins when integrating; they must not relabel old successful evidence as a run of this successor. Existing proposal compiler lists include the new pure result declaration (and utility builds also the new custody source). The active development-host build list is left for the host lane's generated successor review.
