# Daemon's inherited Crashpad registration: exact native capture and final close

Source-only paired prerequisite for `browser-crashpad-close-a1`. Two original files/four count-one anchors plus a new native helper/header. No JS/provider call, UI change, public addon import, caller-selected task/port/mask, signing or app execution.

The actual fresh `AuxNativeDaemonMain` captures its own task's inherited Crashpad masks (`EXC_CRASH | EXC_RESOURCE`, the selected macOS >=27 behavior) before observer/bootstrap/images/Node. Each kernel-returned right, mask, behavior and flavor is retained in a native process-bound object. Duplicate/missing masks, wrong process, query failure or invalid rights refuse startup. No late empty snapshot is substituted.

The exact Swift owner shutdown entry first requires the actual `AuxDevelopmentOwnerCleanSettlementStatus(pointer) == 0`. Only then it calls the hidden native close, before `owner.completeBrowserCleanShutdown()` requests authenticated browser drain. The close reads the current task masks and compares every row/port/behavior/flavor with the captured snapshot. Changed/unverifiable registration refuses without overwriting it. It looks up the fixed `com.apple.ReportCrash` service using the same native bootstrap mechanism as supplied Crashpad, restores this daemon's own masks to the system handler, and physically releases both snapshot/query rights and its system lookup reference. Every release must succeed before status0. A partially failed outcome remains sticky unknown, retaining evidence/rights; no rollback or reset.

The browser can then close its own registration/restart thread and wait for the exact owned handler's native ES exit/fence before browser CLEAN. The daemon's own descendants must already have settled under the native clean query, so they cannot silently retain inherited client rights. Unrelated/shared Crashpad clients may keep the handler alive and correctly leave drain pending; no handler is killed or exempted.

Other exception masks are untouched. The selected platform baseline is macOS27; EXC_GUARD is delivered as EXC_CRASH on macOS13+. This is standard cooperative task ownership, not hostile same-UID task-port CAS. Source still requires the restricted descendant-observer capability; no entitlement/grant is created here.

## Parent integration

1. Replay `replacements.json` against exact captured native a4 originals (main/OwnerDrain remain the same in current a5 tuple). Copy the new helper/header to the fresh coupled source, preserving older tuples.
2. Compile changed main + new helper using `compile-review.json` commands after creating its fresh output directory and acquiring the normal serialized native build lock. The commands are prepared only, not executed here. Recompile/link the full real Swift owner operand, not an isolated replacement module.
3. Add the helper object and the two exact hidden private definitions `AuxCaptureInheritedCrashRegistration`, `AuxCloseInheritedCrashRegistration` to the next strict link manifest. Preserve all prior frozen definitions and the unchanged50 addon imports. No Node/addon ABI change.
4. Bind actual successful compile/link receipts with browser custody/Crashpad close and immutable final daemon source/entry. This proposal alone is not a runnable or accepted successor.

`check.py` performed one inert replay and ordering check. `source-check.json` is not native compilation, Mach-port execution or runtime acceptance. The source references are the actual macOS SDK `task_get_exception_ports` (32-row MIG capacity) and supplied Crashpad `util/mach/bootstrap.cc::SystemCrashReporterHandler`, `client/crashpad_client_mac.cc::SetCrashExceptionPorts`.
