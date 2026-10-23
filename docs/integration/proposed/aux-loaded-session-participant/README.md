# Actual asynchronous loaded-session writer participant

`aux::CloseLoadedSessionWritersForMigration(ProfileManager&, callback)` in `chrome/browser/ui/aux_session_writer_participant.h` is an actual native UI-sequence callback owner. It consumes existing ProfileManager, Profile, SessionService and backend APIs; it does not accept a caller's success/custody Boolean or replace them with a receipt facade. Its implementation is compiled in the existing scheduler translation unit. Ordinary shutdown/startup is not wired to it.

The entry captures `GetLoadedProfiles()` as real Profile weak references before any reset can reenter destruction. It never retains or accesses the raw manager reference across an await. Its sequence is:

1. Close the real profile-switch snapshot scheduler and observe its actual in-flight reset and captured-write callbacks. An event subscription, rather than a timer/queue barrier, resumes the participant when these real counters change.
2. After those callbacks settle, permanently seal further delayed Rebuild/Flush dispatch. Unavailable pending paths remain counted and unresolved; they are not silently discarded. Unknown accounting produces an explicit `kSnapshotAccountingUnknown` result without starting manager closure.
3. For every profile in the captured loaded inventory, use only `SessionServiceFactory::GetForProfileIfExisting`. Missing services are explicit; no factory creation/restore path is used. Each existing service performs its actual final reset/save through `ResetFromCurrentBrowsersWithWriteCompletion`, including profiles with no queued scheduler paths. Disabled saving or actual write failures stay in that typed result.
4. Wait for all those real callbacks. Then invoke each still-owned service's actual `CloseCommandWriterAdmissionAndObserve`, and wait for its actual owned-manager/backend observations. Lost profiles/services, unavailable manager, rejected posts, failed writes and unsubmitted/deferred work remain explicit. An actual failed write is never converted to success; it remains data even though the owned writer is subsequently closed.

The service weak reference comes from its existing WeakPtrFactory. There is no strong or forged profile/service lifetime. Every callback retains the actual participant; it additionally retains itself until it produces an observation, so a dropped queued callback cannot erase unresolved pending accounting. Rejected/dropped origin tasks or callbacks have no timeout, destructor or fallback-success path. This intentional unresolved retention has no automatic cancellation/reset API.

The typed result contains `loaded_profile_count`, `initial_snapshot_dispatch`, `final_snapshot_dispatch` and indexed `profiles`. Each profile has an explicit outcome plus optional actual `write` and `close` values. `kObserved` means the table was observed; it is **not** an aggregate success or permission to migrate. No paths, names, account IDs, titles, URLs or credential payloads are added to the result.

## Exact scope and remaining lifecycle authority

This covers the captured existing loaded-profile inventory and its existing session services only. It does not close ProfileManager creation/reuse, renderer/navigation/extension admissions or another manager/process. Profiles/services created after inventory capture remain outside it. Weak lifetime observations do not prevent keyed-service teardown or establish exclusive profile custody. The caller must supply the already-owned manager on the native UI sequence and arrange genuine upstream lifecycle ownership; this API cannot create that ownership.

The final write is this participant's actual captured batch, not proof that the browser was otherwise idle. Backend observations mean owned-instance admission and RAII File-object release, with the previously documented void-operation/close-error/fsync limits. Pending/failed/owner-lost/unavailable results cannot authorize protected startup or replace full-profile custody. Current first refusals remain unchanged. The integrator's explicit migration-only owner may consume these raw results; invoking it during ordinary Shutdown could suppress legitimate later teardown writes and is not supported.

No runtime owner/profile/service was opened or inspected by this source lane. The accepted UI and browser remain intact.

## Focused checks and integration

Both actual changed TUs compiled with current pinned AuxFast GN target flags and the complete proposal header overlay: SessionServiceBase and the scheduler/native callback owner. Twenty-two executed production-header checks cover seal admission while callbacks remain pending, permanent late-dispatch refusal, retained unavailable paths, failed-write/unknown accounting and typed not-attempted/unsubmitted outcomes. Exact source checks verify weak inventory, existing-only lookup, actual callback write→close sequencing, no raw manager after await and unresolved owner retention. The callback owner itself was compiled, **not executed in a real browser**; no native async runtime acceptance is claimed.

The dry staged-parent replay preserved all 778 source records, 23 assets and historical steps from `out/native-reuse-composition-aux-session-writer-close-gn` (SHA-256 `2f2d89447a39710b711db114c5578b745e8b5a71a930ca0ffd9f0e7a614fd1a9`). Four edits and one new header produce 779 sources. Root owns registration of `aux_session_writer_participant.h`, the aggregate owner, shared source application, linking and disposable runtime acceptance. No whole-browser build, protected call, owner data, original addon, Security/Keychain operation, OS grant or signing ran.

```sh
python3 docs/integration/proposed/aux-loaded-session-participant/verify.py
python3 scripts/native-build.py sh docs/integration/proposed/aux-loaded-session-participant/check.sh
python3 docs/integration/proposed/aux-loaded-session-participant/prepare-composition.py \
  --artifact-root /Users/rcourson/Documents/Vibe/web --output /absolute/fresh/composition
```

Optional focused reproduction: `python3 scripts/native-build.py python3 docs/integration/proposed/aux-loaded-session-participant/compile-check.py --output /absolute/fresh/objects`. It compiles only the two changed TUs and does not link/run them. No broad unchanged suite was repeated.
