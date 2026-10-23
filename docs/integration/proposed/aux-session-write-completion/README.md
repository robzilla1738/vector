# Actual session snapshot write completion

This successor connects the real workspace snapshot dispatch to actual `CommandStorageBackend` write-method outcomes. It does not substitute a timer, queued task or asserted success Boolean for backend completion. The source proposal is unactivated; no protected startup, profile, UI or accepted app was changed.

The existing backend append implementation remains byte-for-byte identical after extracting its return result: same file format, initial-state marker, file selection, serialization/encryption, error handling and primary/secondary policy. `AppendCommandsWithCompletion()` invokes that real implementation and posts its observed outcome back to the original sequence. An append skipped because no initial state exists is distinct from success; file-open, write, serialization and encryption failures remain distinct failures. A dropped completion is never inferred successful. No flush, fsync, directory durability or atomicity guarantee was added.

`CommandStorageManager::SaveWithCompletion()` submits the captured batch on the existing non-nestable sequenced backend runner. Its posted jobs retain the actual backend reference and result callback. All six existing clear/encrypted post sites have an observed route; ordinary `Save()` retains its error-only route. Both selected copies must report successful writes in dual modes, even when the original secondary error callback intentionally ignores errors. Missing encrypted backends and rejected task posts explicitly fail the observation. Pre-existing deferred encryption operations prevent a successful result rather than silently falling back or claiming their completion. An empty captured batch reports no observed write, not success. Results remain asynchronous, including synchronous rejection paths.

`SessionServiceBase::ResetFromCurrentBrowsersWithWriteCompletion()` performs the actual reset, then immediately submits the captured commands for observation. Weak lifetime checks prevent access after a reset or save delegate destroys its service/manager. The closed workspace participant invokes this combined method and retains a pending write count independently of the scheduling owner's lifetime. Late results decrement that count only after real backend completion; every failure remains retained. Its old `dispatch_complete()` stays scoped to dispatch; the new `captured_writes_complete()` additionally requires all captured write observations to succeed. No callback can reopen admission.

## Safety and remaining boundary

This observation covers only the newly captured snapshot batch and the selected copies' actual write-method returns. It does not fence other SessionService commands, queued migration/rotation/read operations, older or later writes, encrypted initialization, renderers, extensions, prefs, IndexedDB, helpers or independent processes. It neither closes backend file handles nor grants whole-writer/protected-authority custody. It must not unlock the current state2 refusal.

The original startup/reset/2500ms delayed-save path is unchanged when the native snapshot admission remains open. The observed close path deliberately submits its final snapshot immediately rather than waiting for that timer. A genuine native coordinator still must invoke the participant while actual profiles/services are alive, and separately close and observe all other writers. No such authority, JS switch, environment bypass or coordinator is fabricated here.

The previous unapplied snapshot proposal used `NoDestructor` for a trivial tracker. Compiling the actual scheduler caught Chromium's static assertion. This successor uses the required plain trivial function-local static; no accepted app was affected.

## Focused evidence and integration

Four real changed translation units compiled using the current `out/AuxFast` GN target/rule flags and a proposal-only source include overlay: backend, manager, SessionServiceBase and workspace scheduler. The commands/flags, source hashes and object hashes are recorded. This is object compilation, not a linked browser or runtime backend test. Thirty-seven executed captured checks cover every failure result, dual-copy success, deferred encryption, empty batch, late callback/lost scheduling owner, pending observation and duplicate completion. Source verification proves the original append body unchanged and checks all post/error/lifetime pairings. No real backend I/O, original addon, owner state, Security operation, OS grant, signing or browser launch ran.

The exact dry staged-parent composition replay passed: all 775 parent source records, 23 assets and historical steps retained; eight source changes and one new header produce 776 sources. Parent SHA-256 is `45f930fefd68d687a1100c397f95ad65f60164c8b77d86bdc4d849b3dd01f873` at `out/native-reuse-composition-aux-workspace-snapshot-dispatch`. Root owns shared GN header registration, source application, linking and actual disposable runtime acceptance.

```sh
python3 docs/integration/proposed/aux-session-write-completion/verify.py
python3 scripts/native-build.py sh docs/integration/proposed/aux-session-write-completion/check.sh
python3 docs/integration/proposed/aux-session-write-completion/prepare-composition.py \
  --artifact-root /Users/rcourson/Documents/Vibe/web --output /absolute/fresh/composition
```

An optional changed-TU reproduction is `python3 scripts/native-build.py python3 docs/integration/proposed/aux-session-write-completion/compile-check.py --output /absolute/fresh/objects`. It compiles only these four TUs from pinned existing GN flags, writes outside the native checkout, and never links or runs them. No further broad tests are needed for this source slice.
