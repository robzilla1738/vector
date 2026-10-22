# Production direct-daemon lifecycle fixture

This source-pinned proposal uses the allowed lifecycle-fixture fallback. It does not add a generic migration coordinator or pretend that direct-daemon quiesce establishes a renderer/profile all-writers barrier.

## Actual boundary assessment

The compiled direct-daemon API belongs to `chrome/browser/aux/DaemonSupervisor` and `BrowserPlatform`. It owns one direct child and its own launch/retry admission. Actual native profile sources expose different capabilities: `ProfileManager::GetLoadedProfiles()` inventories loaded profiles, `PrefService::CommitPendingWrite()` requests a preference commit, and `content::StoragePartition::Flush()` flushes pending partition work. None closes future renderer, extension service-worker, sessionStorage/localStorage/IndexedDB or independent runtime admission. A flush acknowledgement is not a stopped-writer acknowledgement. The actual `Profile` lifecycle points to `ProfileDestroyer::DestroyProfileWhenAppropriate`, which destroys profiles and changes live browser/session behavior. Calling it as a migration shortcut would exceed a UI-preserving writer fence.

Accordingly, no renderer/profile fence is fabricated here. The startup refusal and migration quarantine must remain until real per-owner admission/drain acknowledgement, storage-handle closure and restart ownership are integrated separately. The direct-daemon typed receipt still explicitly has `kOwnedDirectDaemonOnly` scope.

## Production code exercised

The existing lock/generation admission block moves unchanged into private `DaemonSupervisor::RunAdmittedLaunch()`. The actual private `Launch()` performs the same filesystem/environment preparation, then invokes that helper with the real `base::LaunchProcess` callback. Its closure executes synchronously under the admission lock. Launch becomes a private static member solely to call the private gate. All production code from `StopVerified` through shutdown, callback drain, ownership validation and result reporting remains byte-identical to the pinned compiled baseline.

A friend fixture is declared in the supervisor header; there is no public test bypass, alternate runtime protocol, GN registration change or delivered UI change. Test code calls the production gate, production `DidLaunch`, `QuiesceDirectDaemonForMigration`, `Start`, real bounded `StopVerified` path and real typed completion. It does not reimplement a coordinator or fake successful production drain results.

## Four fixture cases

1. No owned process: result is posted, scope is narrow, outcome is no-owned-process, and Start remains closed.
2. Queued launch: close admission while a launch reply is pending; the actual gate refuses to invoke the callback, and the production late reply completes no-owned-process without reopening Start.
3. Already admitted child: create one directly owned synthetic `/bin/sh -c 'exit 23'` child through the actual gate, retain its reply across closure, then deliver the stale generation. No acknowledgement occurs before the owned process drains; the production result contains its actual exit code.
4. Failed ownership drain: create one directly owned `/bin/sleep 30` child outside the disposable resource root. A mocked network factory handles only `/shutdown` without any socket. Production refuses termination after its bounded wait, retains the original owned handle, reports failure, keeps Start closed and posts the same failed result for repeated quiesce. Fixture cleanup uses only its retained direct-child handle and verified creation time, never process enumeration, a port owner or a name-based signal.

The two real children are synthetic fixture processes only. No owner daemon, profile, credentials, keychain, signing, browser UI or provider call is involved. All tests are POSIX-gated.

## Integration and honest verification status

`manifest.json` pins the actual compiled supervisor header/source baseline and all three proposed outputs. `fixture.patch` contains exactly those two modifications plus the new unit-test source. Offline source checks and patch application checks pass. Actual Chromium headers were inspected for Process, TestURLLoaderFactory and TestFuture APIs.

The native fixture is **not compiled or executed yet** in this lane; no native checkout or root GN file was modified. Root owns build integration. Add the new unit-test source to a dedicated `testonly` target depending on the actual `//chrome/browser/aux:platform`, `//base/test:test_support`, `//base/test:run_all_unittests`, `//services/network:test_support`, `//testing/gtest` and the normal test target support. Do not compile an included copy of the production `.cc`; link the ordinary production object. Apply only after all baseline hashes match, and preserve any newer checkout changes.

Build only the affected production/test target through the existing serialized native wrapper, then run `DaemonSupervisorLifecycleTest.*` once against disposable children. Expected time is approximately the one failed-drain three-second bound plus startup. A native compilation or runtime issue requires fixing the concrete fixture/API, not weakening scope or accepting a fabricated all-writers proof. A simultaneous-spawn lock contention test and real renderer/profile write-admission integration remain separate gaps.
