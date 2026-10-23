# Native profile-switch snapshot dispatch participant

This patch implements one actual browser-owned writer boundary in the supplied profile-switch lifecycle. It changes the existing `ProfileSwitchSessionRebuild` production scheduler, rather than introducing a coordinator that merely accepts an asserted receipt. The accepted app, shared native checkout and UI are unchanged.

`ProfileSwitchSessionRebuild::CloseAdmissionAndDispatchPendingSnapshots()` is native UI-sequence only. It closes process-wide admission **before** invoking any real snapshot callback, invalidates each owner's delayed generation, and dispatches pending original/target profile snapshots through the existing `SessionService::ResetFromCurrentBrowsers()` call. New owners cannot schedule after closure. The existing `Schedule`, delayed `Rebuild`, close flush and destructor now participate in shared accounting. The ordinary open path keeps both profile paths, deduplication, the 500ms delay, service selection and reset invocation unchanged. No JS, environment switch, marker, approval Boolean or protected-owner activation is added.

The observation explicitly distinguishes pending paths, in-flight reset calls, unresolved paths and unknown accounting. Reentrant close cannot report a call complete while its callback remains active. A reset callback may destroy its scheduling owner: the remaining loop uses local state and accounting survives independently. Destruction with queued paths records unobserved work; missing profiles/non-saving or absent services stay unresolved. An unavailable browser/ProfileManager leaves paths pending. Counter overflow or unmatched completion stays unknown. No timeout, destructor, retry or repeated close alone converts these states to success; pending work requires an actual observed dispatch. There is no reopening or reset API.

## Exact scope

`dispatch_complete()` means only that this scheduler's admission is closed and every admitted snapshot path had an observed return from its reset dispatch. **It is not storage durability or whole-writer custody.** Source inspection proves why: `SessionServiceBase::ResetFromCurrentBrowsers()` invokes `ScheduleResetCommands()`, which ends in `CommandStorageManager::StartSaveTimer()`; the backing write happens later. This patch does not close or flush that backend, browser prefs, IndexedDB, extensions, renderers, other session-service writers, helpers, CLI invocations or independent processes.

A future genuine native owner must call this participant while settled Browser/Profile objects still exist and consume its typed observation alongside separately owned participants. Calling it after live profile teardown, using it as a protected-owner grant, or treating pending/unknown as success is unsupported. The current state2 first refusal remains unchanged and cannot consume this value as authorization. No production caller presently initiates this close; ordinary startup behavior remains unchanged until the integrator wires an authenticated lifecycle owner. Existing `FlushPendingBeforeClose()` remains an ordinary window-close flush, not a permanent process-wide admission close.

## Review and integration

`manifest.json` pins two exact native baselines, the new production header, context dependencies, and count-checked patch anchors. `native.patch` changes only two existing scheduler files and adds one header; no view, layout, artwork or stylesheet changes occur.

Prepare a separate composition, without applying or building the native checkout:

```sh
python3 docs/integration/proposed/aux-workspace-snapshot-dispatch/prepare-composition.py \
  --artifact-root /Users/rcourson/Documents/Vibe/web \
  --output /absolute/fresh/output
```

The pinned predecessor is `out/native-reuse-composition-aux-owned-helper-drain-gn`: 774 source records and 23 binary assets. One actual dry composition/replay preserved all 774 prior sources and23 assets and produced 775 sources. The script refuses baseline/dependency/parent drift, preserves historical steps and verifies all unchanged output hashes. Root owns any later shared source apply, GN registration and native build.

The focused C++17 fixture compiled the exact production accounting header and passed 26 checks: deduplication, permanent admission closure, reentrant/in-flight completion, nested pending work, unavailable/unresolved paths, owner loss, idle close, accounting underflow and overflow. Source verification additionally checks actual Schedule/Close/Rebuild/destructor wiring, pre-path admission, stale-generation rejection, and no member access after reset callbacks can destroy the owner. These are bounded software/source checks, **not a compiled Chromium scheduler TU or real browser/backend runtime test**. No protected factory, Security/Keychain, owner profile, original addon, OS grant, signing or UI operation ran.
