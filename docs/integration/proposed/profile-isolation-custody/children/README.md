# Actual content-child reap evidence

This proposal connects actual macOS content-helper launches to a retained lifetime record carried with the existing internal launcher `Process` move ownership. It reserves the record before spawn, binds the actual returned PID and creation time, validates that association before waiting, and settles only on evidence from the existing native reaper. A mismatched/null birth, wrong process, or unknown wait result remains unresolved. Failed launches settle without creating fictitious child lifetime.

Existing upstream termination status is insufficient: POSIX `GetTerminationStatusImpl` returns normal termination even when `waitpid` fails, and macOS `EnsureProcessTerminated` returns void after paths that can encounter an already-reaped child. Additive paired APIs expose `pending`, `reaped`, or `unknown` from those same native waits. Existing callers retain the same status and termination behavior. No second waitpid, observer thread, signal sequence, polling loop, or timeout-as-drain assertion is added.

The actual mac launcher normal termination query and forced termination path use the paired evidence under the retained record's mutex. The new MAC-only shared pointer member on internal `ChildProcessLauncherHelper::Process` is necessary to carry launch identity through moves; a PID-only global lookup could adopt another process after PID reuse. This changes the internal type layout, requiring normal dependency rebuilding of all users, not manual object replacement.

## Integration

Apply `native.patch` only to a fresh isolated source composition matching every predecessor in `sources.json`. All changed files plus the new header are provided under `source/`. Add `aux_child_lifetime.h` to the existing content/browser GN source inventory through the integrator-owned registration. Rebuild normal affected dependency closure after the current full browser compilation completes; do not alter that active snapshot. No protocol, UI, Swift, signing or owner-data changes.

## Checks and honest limits

`check.py` compiles the actual changed POSIX wait body and actual ledger header with minimal base-type stand-ins. A disposable fork tests actual reap and subsequent ECHILD; ledger checks cover sticky unknown, birth mismatch, launch failure and permanent false all-writer coverage. This is not a full Chromium translation-unit compile or app execution. Those remain required when the native build lock becomes available.

The tracker covers only actual mac content-helper launches using these paths. Native messaging, Crashpad, app relaunch, external helpers and grandchildren are not covered. Launch record ownership and a matching pre-wait birth reduce ambiguity; they do not create OS-mandatory filesystem custody or eliminate every outside reaper race. Unknown entries remain retained. `Inspect()` always reports all-writer coverage false, even when zero known entries remain. No clean marker or existing-root reopen is enabled. No browser-root generation association is inferred from the process-wide ledger.
