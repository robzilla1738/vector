# Retained fresh-home process ownership successor

Three exact source replacements are pinned in `integration.json`, with complete before/after source copies and `source.patch`. No original proposal, accepted app, root manifest, Chromium tree, signed policy, state, credential or authority is changed. Integrator must replace all three operands together in the actual runtime graph and update its exact receipts; this proposal alone is inactive.

## Changed boundary

The real fresh and resumed home objects capture their creator PID internally in immutable instance storage. Inherited-owner validation, generation-attempt claiming, journal reads and FD duplication reject before path/FD calls or inherited instance locks. Cohort acquisition returns unavailable and completion/release returns without acting when the instance belongs to another process. No API accepts a PID or new admission flag, no state is synthesized, and none of this proves whole-writer custody.

Both canonical registries hold PID, lock and map in **one private State instance**, rather than independently lazy Swift static properties. The owning State's PID is checked before FD inspection, map access or its lock. Home create/reopen initializes/checks those registries before new filesystem work; a returned parent home has already obtained its registry lease. A fresh exec process still constructs new registry/owner objects through the existing authenticated-policy reopen path; no inherited wrapper is reinterpreted as a new owner.

This is not a claim that a Swift static is an eager image initializer or that arbitrary fork from a signal handler/during Swift runtime initialization is supported. A child must not reuse inherited native owners; legitimate new-process reopen uses fresh process initialization and actual policy authentication. The per-instance checks reject returned inherited owners before reaching a registry getter. No generic process lookup, PID reuse lookup or caller-supplied process claim grants access.

## Destructor chain

Retained descriptors are plain `Int32` members, not RAII handles: Swift member destruction does not close them. Local home deinit closes its three descriptors; foreign deinit returns before close. Inherited descriptor references intentionally remain until child process teardown rather than permitting an inherited owner to act on them.

Instance and registry NSLocks use manually retained `Unmanaged<NSLock>` storage. Local destruction releases those locks; foreign destruction does not call `release`, so automatic ARC does not destroy a lock inherited while another parent thread held it. A cohort operation's automatic strong-owner release may destroy its lease, but that lease has the same creator guard/manual lock lifetime. Home target-progress leases reach the same guarded class. Resumed policy is a value struct containing policy contents/Data/String, with no descriptor or custom release path. Weak canonical-owner wrappers hold only weak references. Foundation/Swift memory teardown is not claimed to make arbitrary post-fork runtime operations safe.

## Verification and remaining integration

`verify.py` checks exact original and successor hashes, full patch replay and the changed owner/registry entrypoints without touching state. `compile.py` typechecks the actual existing cold-bootstrap Swift graph with only these three replacements and its original conditional flags. It must run through `python3 scripts/native-build.py` and `/tmp/aux-build.lock`.

The compile receipt records actual inputs/outputs, source immutability, command, compiler log and result. No substitute type stubs, link, load, executable, Keychain/Security operation, protected runtime or signing is used. Typechecking and source checks do not accept process/fork behavior, authenticated reopen, profile switching, startup or whole-custody closure. Root owns integration with current OWNER/AUTH/PEER/COLD successors and later approved real-runtime acceptance.

Actual serialized graph typecheck passed (39 immutable inputs, arm64 macOS13.0 typecheck target). Existing Security API deprecation warnings remain in unchanged inputs. This target is not a whole-package minimum-OS claim. No link/load/execution occurred.
