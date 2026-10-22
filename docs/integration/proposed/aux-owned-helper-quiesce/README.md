# Owned direct-helper quiesce aggregation proposal

This source proposal pairs **this browser's owned direct daemon and direct installation-carrier calls only**. It does not claim renderer, extension, descendants, independent CLI/helpers, profile storage or all-writer custody. It changes no UI or ordinary startup behavior and exposes no JS/environment switch. Existing native methods/signatures remain compatible.

New BrowserPlatform methods:

- `QuiesceOwnedDirectHelpersForMigration(callback)` closes carrier and direct-daemon admission synchronously, then uses the existing actual direct-daemon quiesce callback and an actual carrier custody snapshot. Its callback can truthfully report pending/unresolved work; it is not a “wait succeeded” Boolean.
- `InspectOwnedDirectHelperQuiesce()` returns a new actual carrier snapshot with the retained direct-daemon result. There is no timeout, process census, PID kill, reset or reopen. Missing direct callback remains pending. Existing separate direct-daemon API remains unchanged.

`OwnedDirectHelperQuiesceObservation` retains raw scoped direct outcome/exit code and carrier admission/active-call/unresolved-child counts. Readiness distinguishes close not requested, direct pending/failure, carrier admission open, carrier calls pending, unresolved children, contradictory or unexpected direct observations and drained. `owned_helpers_drained()` is true only for the actual successful/no-owned direct outcome **and** closed carrier admission with zero active/unresolved children. Zero direct exit code remains the existing optional-null representation; no new meaning is assigned to it.

The first direct observation is retained. A conflicting later observation cannot overwrite failure as success. Repeated BrowserPlatform calls after a direct result retain that result and refresh only the carrier snapshot; this avoids changing a previously observed Exited into NoOwnedProcess merely because normal Shutdown later released its verified handle. Lost weak completion after shutdown leaves an uncompleted direct observation pending, never inferred successful. Pending carrier snapshots can be refreshed by explicit inspection; a stale pending callback value is not promoted by elapsed time.

The existing `DirectDaemonQuiesceResult` definition moves verbatim to a dependency-light header without changing fields, enum values or layout. This makes the actual production aggregation state testable without a fake Chromium stand-in. InstallationCarrierCustody source is unchanged and included only as a pinned production dependency/fixture input. New headers require integrator source/GN inventory registration as appropriate; this lane does not edit shared GN or apply the patch.

## Verification and integration limits

The standalone focused fixture compiles actual new production state/header and unchanged actual carrier-custody source, then passes27 checks. It exercises pending/missing direct results, queued launch rejection, active calls, synthetic launched-without-exit retention, explicit synthetic observed exit, direct failure, contradictory results, unknown outcomes and repeated observations. No child is actually launched and no real process-exit acceptance is claimed. It uses no browser/profile, OS effects, protected Security, owner data or signing. The shared build lock serializes this tiny fixture; **no Chromium checkout build was run**.

The BrowserPlatform translation unit itself has not been compiled in this lane. Root owns source composition and an eventual focused native build. `native.patch`, mirrored reviewed sources and `manifest.json` provide source-count/hash checked integration. `verify.py` checks frozen source/patch correspondence and verbatim result relocation; `--live` additionally checks the current checkout still matches pinned baseline, without applying anything.

This aggregate is an executable bounded participant, not the missing trusted whole-profile coordinator. Actual exact home/profile scope, authenticated custody handoff, browser renderer/storage exclusion and independently invocable runtimes remain separate unmet requirements. Do not use its scoped success to activate migration or an unaccepted application generation.
