# Audited native CLI embedding — integration slice A1

This is a local source proposal, not an enabled CLI, app build or runtime acceptance. No supplied UI, CSS, assets or default geometry change. The root integrator owns projection, GN/registration, compilation, pairing and packaging.

## Concrete implementation

* A terminal frontend uses a credential-free Mach Hello and a private send-once reply. It verifies the actual browser audit trailer, signed image, CDHash and process birth **before** transmitting bounded argv/environment or working-directory/stdin/stdout/stderr fileports. The browser independently verifies the actual CLI audit identity before granting the private invocation receiver. Private signals and final completion retain the nonce and authenticated birth. A public service locator is discovery only.
* The CLI image and fixed `aux-native-cli-entry.mjs` resource use the supplied native parent's strict signature/team/certificate/CDHash and immutable resource-path checks. A string prefix is only a file classification check. Neither signatures nor fileports create profile/task authority.
* Native launch gains an optional borrowed directory FD (default `-1` preserves every existing launch). macOS spawn applies `fchdir` to the real retained descriptor before descriptor remapping/closing. It rejects a conflicting path or invalid directory. No global `chdir` or rewritten Node filesystem API is used.
* The existing owned child primitive forwards only SIGINT/SIGTERM/SIGHUP/SIGWINCH to its actual still-waitable owned process group, serialized with its sole reaper. Completion is emitted only from observed/reaped child status or definite no-start. A failed bind can already have spawned a child and stays retained. Unknown send/owner retirement remains quarantined.
* The retained-daemon backend retains the **existing** prepared provider/parent and creates one real command/OS owner. It validates the current authenticated browser and CLI births, caches one exact sequence/request/reply until acknowledgement, and refuses stale/ambiguous requests. It returns actual native root descriptors, never JSON path authority. Its factory is private and uncalled until the actual target gateway exists.
* A CLI-specific sealed-entry reader is an exact count-checked derivative of the actual compiled current daemon reader; it preserves descriptor/resource revalidation. It does not weaken the current CLI role image policy.
* A native-only custody query reads the existing EndpointSecurity live/root identity maps under their current mutex, preserving event tracking and bridge ABI. Positive matches remain managed through exec/reparenting. Absence is **unknown**, never proof of a manual terminal. Browser launch currently refuses both managed and unknown clients.

## Deliberate current gates

`PrepareAndLaunch` has no successful admission case. The current retained custody registry cannot prove global manual/unowned status or resolve a genuine task-to-Profile grant. A signed Aux CLI launched from an AI task must not escape that task by requesting another profile. The browser's selected home is not a native Profile capability. No caller-supplied parent PID, profile Boolean, argv, environment, raw JSON, marker or fileport may fill this gap.

The native frontend preserves the existing quarantine marker and explicitly refuses its private-child branch until real retained-runtime join is paired. Ordinary standalone SEA remains refused. There is no fresh installer/provider per invocation: the existing daemon holds its installer flock for its lifetime. The backend factory is private and has no caller, so it cannot import the daemon's global target from signature-only ingress.

## Why a real child rather than a daemon Worker

The actual pinned Node 26.5 Worker bootstrap does not own process state: `process.chdir` is unavailable, and Worker cwd is shared through the process cwd counter. The supplied CLI uses relative filesystem/child-process behavior. A daemon Worker would need a global cwd change or filesystem rewriting and would change command semantics. A browser-owned physical CLI child can preserve argv, inherited stdio, cwd and actual descendant custody; it must join the retained daemon through a genuine native proxy owner rather than bootstrap a second installation.

## Remaining local implementation before activation

1. A native manual/task admission producer must classify the actual kernel peer across all relevant Aux custody and retain the real native Profile/target/cohort. Until manual status can be proved, unknown refuses. Initially refusing all managed task callers is acceptable; supplying task CLI later requires actual inherited task capabilities, not profile selection by argv.
2. A browser-to-retained-daemon private gateway must carry that native grant and authenticated CLI birth, retain the existing provider, and bind a dedicated invocation/retirement owner. Existing public JSON endpoints are not sufficient.
3. A real CLI proxy owner and authenticated root-fileport transfer must implement the actual Node/Worker native owner interface, including command, secure-store, PDF, OS, writer and child custody. Copying opaque handles between processes or using forked provider pointers is invalid.
4. Pair the CLI bootstrap, Worker preload, embedded PDF/utility/child role image policy and exact sealed entry with that owner. Preserve all refusal paths until paired. Current `execPrivateParent` and embedded-daemon-only policy cannot simply be relabelled.
5. Root adds coherent startup registration, shutdown admission/thread joining, GN/native inputs, source-entry pairing and package selection. Root compiles the focused units once, then performs bounded disposable real terminal/CLI/browser tests when execution is authorized. Signing/release remain separate.

## Evidence

`source-plan.json` contains six native-relative overlays, eleven exact single-match anchors, input/output hashes and source locations. `native.patch` is the matching reversible patch. `source-files.json` names every added source and intended destination. `dependency-pins.json` pins actual source/link/Node inputs. `sealed-entry-plan.json` pins all seven counted reader substitutions. `static-check.json` records one static replay; it is not a compiler or runtime receipt. `COMPILE-HANDOFF.md` lists the root-owned focused compile graph.
