# Native asynchronous profile-creation admission

Inactive, source-pinned successor of native composition `aux-session-writer-close-gn` (778 source records / 23 assets, manifest SHA-256 `2f2d89447a39710b711db114c5578b745e8b5a71a930ca0ffd9f0e7a614fd1a9`). No native checkout, GN, app, UI or startup refusal was changed by this proposal. `profile_impl.cc` was not in that parent inventory: its actual additional input is independently pinned to `e887443652d48563145855e2c525426aa44ccd1dc1023a7e1068fa4c092f06eb`.

The four generated source files and complete `followup.patch` add one process-lifetime, permanently closable native admission owner. A successful CAS acquires an actual synchronous dispatch scope; closure atomically prevents subsequent acquisitions and preserves the count of scopes that already entered. A new ProfileManager cannot reopen it. No environment variable, JavaScript object, receipt, caller Boolean or reset API grants admission.

The real `CreateProfileAsync` entry retains its generation through deferred/destruction queues and completion callbacks. Closed initialized completions use the already documented `nullptr` failure result. Created callbacks are suppressed after closure, never called with an undocumented null profile. Actual asynchronous constructor/registration and the already-loaded async mutation branch hold dispatch scopes. `CreateMultiProfileAsync` holds a scope over directory-name/pref/attributes/scheduling work; its queued ThreadPool deletion rechecks acquisition at actual dispatch. If it has not started, its original continuation returns to the UI thread and the real entrypoint delivers failure.

Already admitted ProfileImpl construction is observed at the real asynchronous constructor body. It remains in `unfinished_initializations` through preference loading, sync migration, the manager's initialized callback, and the rest of `DoFinalInit`. Only the actual end after `GetOriginTrialsControllerDelegate()` completes that observation. Destruction before that point becomes sticky `unresolved_initializations`; callback loss with a still-live object remains unfinished. A missing/duplicate observation becomes unknown, never success. The implementation does not delete, cancel or force-fail a live ProfileImpl and does not reinterpret a successful internal delegate callback as failure.

The migration-only native aggregate may call:

```cpp
aux::CloseAsyncProfileCreationAdmission();
aux::AsyncProfileCreationAdmissionSnapshot raw =
    aux::InspectAsyncProfileCreationAdmission();
```

The snapshot has `generation`, `closed`, `active_dispatches`, `unfinished_initializations`, and `unresolved_initializations`. These are component observations, **not a global drained result**. Register the new `.h` and `.cc` in profiles `:profile_manager` under `enable_aux_browser && is_mac`; both existing `:misc` and `:profile_manager_impl` already depend on that declaration target. The aggregate UI owner can depend on `:profile_manager` without a manager-implementation cycle. No ordinary-shutdown consumer is added: shutting down admission before later keyed-service final writes would be unsafe.

## Verified and remaining

`compile-evidence.json` records successful compilation of all three actual successor TUs with the current GN flags and a read-only VFS overlay for the new header. No checkout apply, full native link or browser launch occurred. `fixture-evidence.json` records two disposable executions linking the actual admission implementation: concurrent close while a real dispatch scope remains active, stale/invalid generation refusal, nullable callback/suppressed created callback, and initialization-tail/abandonment observations. The profile objects and callbacks in this lean fixture are captured; it does not claim actual browser initialization execution.

The gate does not cover infallible synchronous `GetProfile` or OTR APIs, existing services or every profile writer. An already-started `NukeProfileFromDisk` may post its own delayed retries after its initial synchronous scope ends; this proposal does not count those retries as stopped. `CreateProfileDirectory` README/filesystem tasks, the delayed SessionService timer, other child tasks after final initialization and storage durability also remain separate custody seams. A terminal ProfileImpl observation means only that the observed initialization tail finished. These gaps prevent treating zero counters as whole-profile authority or removing the state-2 startup refusal.

Reproduce only the changed boundary:

```sh
python3 docs/integration/proposed/aux-async-profile-creation-admission/verify.py
sh docs/integration/proposed/aux-async-profile-creation-admission/check.sh
python3 scripts/native-build.py python3 docs/integration/proposed/aux-async-profile-creation-admission/compile-check.py --output /tmp/fresh-aux-profile-compile
```

`prepare-source.py` recreates all pinned outputs from the exact read-only inputs and eleven count-one anchors. Root owns actual composition/GN application and aggregate integration.
