# Browser-owned native host descendant custody — source slice A1

This inactive source proposal gives the primary macOS browser executable its own fresh descendant observer before framework loading. The daemon observer cannot see sibling native-messaging/content children. The implementation reuses the selected a4 daemon ES event/pulse/sole-reap model, with a separate process-native bootstrap identity and exact launch families. No UI, build, app, signing, provider or OS grant has changed.

## Implemented source

Five new `base/process/mac/aux_browser_descendant_*` files contain one engine, one main-only provider, and a native header client/ABI. The engine initializes immediately after allocator registration in the main executable and before `dlopen` of the browser framework. Helpers do not initialize another observer. Main and framework must not link two engine copies. Framework callers resolve the fixed versioned native bridge using `RTLD_MAIN_ONLY`, never a plugin or configurable library path. Tickets are native-only IDs retained in the main image, never renderer, JS or IPC handles. Bootstrap identity comes from the actual main process audit PID/version, before any admitted daemon generation exists.

The original macOS27 subscription inspection, self-DUP pulse, sequential event accounting, audit-token identity, native successful-spawn interval matching, original sole-reaper evidence and `es_sync_client` fence are preserved. Unavailable capability refuses startup; missing birth/event/accounting evidence remains unknown. No `ps`, process-group assumption or empty observer map is substituted.

Per-root lineage follows fork/exec audit identities through every descendant. A native-host/content cohort settles at a real pulse fence only after its original direct reap and its last observed descendant exit. A long-lived daemon cannot prevent that independent cohort from settling. Every observed self-root must have exactly one actual successful native ticket once publications are known, including exited roots buffered while a different launch was pending. A reverse-coverage failure is sticky unknown. Bounded native registries refuse additional launches rather than dropping evidence.

The eight count-patched selected files integrate:

- primary executable entry before framework loading;
- existing native-message and mac content launch reservations and original waits;
- actual `OwnedNativePeerChild` launch/reap;
- exact selected-home authenticated startup-generation transfer;
- Crashpad's actual intermediate fork and original `waitpid` (its detached handler remains in the root lineage);
- browser shutdown's pre-ACK scope and post-ACK final fence.

The browser pre-ACK scope excludes only the one actual daemon ticket transferred after the existing authenticated startup reply is accepted and the selected peer/ready generation remain current. No arbitrary PID/name is excluded. That daemon still must satisfy its own existing writer/observer CLEAN protocol. Its browser-side cohort stays retained through the authenticated ACK and original reap, and is included in the final all-family fence. Browser/content/native-host roots and unassigned roots cannot use this exemption.

## Root integration requests

`manifest.json`, `replacements.json` and `change.patch` pin the actual selected native predecessors and 35 literal edits. Stage into a new native source composition; do not edit prior receipts.

Root owns GN: compile `aux_browser_descendant_engine.cc` and `aux_browser_descendant_bridge.cc` into the **primary mac browser executable only**, with C++20, blocks and exceptions enabled for these two finite native units, SDK availability handling and EndpointSecurity/libbsm/System linkage. Export `_AuxGetBrowserDescendantBridgeV1` from that executable and define `AUX_BROWSER_DESCENDANT_CUSTODY` for its `chrome_exe_main_mac.cc`. The framework/content/Crashpad use only the header bridge client; do not add the engine to their linkage or helper executables. Retain normal existing target configs for the eight patched files. No daemon addon/private C imports change in this slice.

The restricted EndpointSecurity entitlement, compatible OS, fresh-entry acceptance and real descendant tests remain external activation/build gates. This proposal does not sign or grant them. Parent must compile the new engine/provider and affected browser translation units, then perform a fresh full linked browser build and exact package/source binding.

## Concrete unfinished close participant

A1 accounts for Crashpad; it does not call it drained merely because its intermediate child was reaped. The original `SpawnSubprocess` intentionally detaches the real handler. The handler remains pending until actual ES exit. The browser's current `CrashpadClient` owns a send right **and** installs task exception-port references; destroying the client alone does not remove the latter. Its restart thread is detached and blocks indefinitely on its own notify receive port. A follow-on source slice must close only this browser's exact registration, prevent further restart admission, and wait actual restart-thread cleanup so the owned handler can naturally exit after its last client goes away. No process kill, crash-service disable during normal operation or shared-handler exemption is in A1. Until that follow-on and actual observation pass, pre-ACK and final clean remain pending honestly.

`source-check.json` records one passed count-replay and inert lineage scenario check (unmatched short-lived root, ambiguous attribution, fork surviving direct reap, independent daemon/native-host lifetime, and no crash exemption). It is not native/runtime evidence. Parent owns actual compilation, subscription, entitlement and runtime checks. All historical accepted UI, candidates and native operands remain intact.
