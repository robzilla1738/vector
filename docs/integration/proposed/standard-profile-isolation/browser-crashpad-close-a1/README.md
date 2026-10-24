# Exact browser Crashpad registration close (inactive source)

This successor closes the browser client's actual task exception registration and its original restart receiver, then still requires the browser observer to prove the owned detached handler exited. It does not kill a handler, close another client's rights, disable normal crash handling, or infer completion from a timeout. UI is unchanged.

Five exact source files, 31 count-one replacements. `chrome/browser/ui/aux_browser_shutdown_drain.cc` is based on **custody a1 output**; the other four are selected Chromium originals captured in `baseline/`. Apply after the custody proposal, preserving its historical files. Root owns GN/actual projection/build.

## Native close

Only the primary browser executable's fixed native bridge opts into retained joinable restart-thread ownership. Non-browser Crashpad clients retain the existing detached thread and persistent receiver behavior. The close path is invoked on the actual final browser lifecycle sequence, after content/native-host reapers and their ES cohorts settle, never by the peer-report thread or normal window close.

The native client sets one-way restart close admission and wakes the original Mach receiver through its own private send right. The receiver remains the only owner of its receive right; it finishes any in-flight restart/handshake, destroys the original receiver object, and publishes completion. Only a successful original `pthread_join` permits registration release. Wake delivery/full queue/invalid destination and a completion flag alone are not closure.

The client queries only its own task exception masks and refuses if any current registration differs from its exact retained handler port. It restores system crash handling for those masks, releases its own right and the temporary queried rights. This is cooperative task ownership, not a hostile same-UID atomic port CAS. Another client can keep the handler alive; that remains pending in ES and cannot produce CLEAN.

Actual upstream handler semantics are `handler/mac/exception_handler_server.cc` `Run`/`DoMachNotifyNoSenders`: non-launchd handlers request native no-senders on their exception port and leave the server only on the corresponding notification. We do not synthesize that notification. `MachMessageServer::kOneShot` is the existing upstream facility used to reevaluate stop state after actual messages.

## Coupled prerequisite: inherited daemon registration

The selected Aux daemon launch uses `base::LaunchProcess` without a macOS exception-port reset. It can therefore inherit the browser's Crashpad registration. Browser-only close must **not** be called complete while that client is alive. The paired native daemon needs a final self-owned exception-registration close after its writers/children settle and before requesting browser CLEAN, preserving normal crash handling until final shutdown. This proposal does not silently change the daemon or waive handler liveness. Parent integration must supply and compile that exact native step; without it the browser observer honestly remains pending.

## Integration / evidence

- Add the private bridge header dependency to the existing Crashpad mac client build as needed; no second observer or C++ engine is linked into Crashpad/framework.
- Recompile actual Crashpad client, crash reporter component and shutdown drain units, then full browser after the current serialized build ends.
- `python3 <proposal>/check.py` replays all exact anchors and verifies changed-boundary ordering; this is source evidence only.
- `source-check.json` records one inert check. No Mach port, pthread, Crashpad handler, observer, app, credentials or provider was executed. No signing performed. Native compilation and real runtime acceptance remain parent-owned and unperformed here.
