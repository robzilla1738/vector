# Cold direct-entry admission refusal and startup boundary

This proposal closes a concrete bypass of the existing unaccepted-generation quarantine. The native browser already refuses state2 at `BasicStartupComplete`, but its copied daemon and CLI SEA binaries can be invoked directly outside the browser and launcher. `applyAuxColdEntryAdmission` inserts an unconditional state2 refusal as the first executable statement of those actual source-pinned entries. State1 is byte-identical. This is necessary admission closure for these new entrypoints, **not permission to migrate or evidence that all writers stopped**.

## Actual cold-start ordering

`startup-source-evidence.json` records current source hashes and exact anchors from the native checkout and packaged runtime provisioning sources. No process/profile/state data was inspected.

1. `content/app/content_main_runner_impl.cc` invokes `delegate_->BasicStartupComplete()` and immediately returns its exit code before `PreSandboxStartup()` or later browser startup.
2. `ChromeMainDelegate::BasicStartupComplete()` first runs `PackagedIdentityAllowsStartup()` for the Aux browser and nested browser helpers, before development acceptance, user-data paths, singleton forwarding, preferences or installation authority. Its compiled predicate unconditionally rejects state2 and unknown generations. A process-type switch is not an exception.
3. `ChromeMainDelegate::PostEarlyInitialization()` later resolves user-data and calls `AcquireProcessSingleton()`. That creates the singleton and invokes `NotifyOtherProcessOrCreate()`. It can forward a command to an already-running browser. Singleton success is therefore neither proof of no existing writer nor authority over CLI/runtime/helper processes.
4. `ChromeBrowserMainParts::PreCreateThreadsImpl()` calls `browser_process_->Init()` and uses Local State. Later, `PreMainMessageLoopRunImpl()` starts BrowserPlatform before `PreProfileInit()` and `ProfileManager::AutoloadProfiles()`. A gate placed only beside profile autoload would already be too late to claim no native state initialization.
5. `ChromeProcessSingleton::Unlock()` eventually releases queued notifications to browser startup callbacks; renderers, extension workers, profile services and restored sessions remain separate lifetime owners.

The currently enforced native refusal is thus the appropriate pre-state location for the new browser generation. No new native patch is necessary for that narrow refusal. It does not stop a previously running accepted browser or old/helper processes, and it must not be relabeled as an all-writers fence.

## Concrete implementation and integration

Call `applyAuxColdEntryAdmission({component:'daemon'|'cli',path:'entry.mjs',text,original,stateIdentityVersion})` after the existing composed daemon/CLI transforms. Raw original SHA and the unchanged first builtin import are pinned; prefix drift, repeated gates, unknown versions or wrong sources refuse. Replay the one returned integration anchor and pin this module plus `inputs.json` in stage provenance.

For state2, the guard is before the first executable source statement and before bundled module initializers, argument parsing, native binding loading, login/config persistence, session mutations, daemon startup dispatch and runtime/cache bootstrap. CLI's hashbang remains the first line. The original ESM imports are statically inventoried as Node builtins only; their hoisting does not execute an authorized reused user module. No home path, credentials, marker file, PID, port, advisory lock or inherited acceptance environment is read.

The error is `AUX_STATE_IDENTITY_QUARANTINED` with a fixed Aux-only message. There is no diagnostic flag, environment variable, receipt or Boolean that unlocks the state2 entry. Native-binding diagnostic entrypoints also remain refused for this unaccepted generation; an integration check must expect refusal rather than add a bypass. A future accepted migration requires a new reviewed admission implementation and stage, not editing a persisted acceptance flag. This changes no state1 behavior or UI.

## Actual writer coverage and remaining boundaries

| Entry / writer | Enforced by this proposal | Remaining scope |
| --- | --- | --- |
| New state2 supplied daemon SEA, including its adapted Node-development entry | First executable refusal, inherited when the normal adapter supplies both forms | Previously launched daemon or alternate uninstrumented script can remain active; no stop receipt emitted |
| New state2 supplied CLI SEA | First executable refusal before parseAsync, login/session/settings commands and binding loading | Existing/older CLI processes, external wrappers and other copies remain outside this gate |
| New native browser / Chromium helpers | Existing compiled BasicStartupComplete refusal, not modified here | An already running accepted browser and its profiles/workers remain outside cold admission |
| `memory-bootstrap.cjs` -> `memory-seed.cjs` | Normal new daemon call cannot be reached after refusal | Direct requires can still call provisioning; source actually creates private home/cache files and needs separate owned admission |
| `runtime-bootstrap.cjs` -> `runtime-seed.cjs` | Normal new daemon call cannot be reached after refusal | Direct requires can stage/write/rename runtime caches; distributed Node/Python/shell binaries can be launched independently |
| Supplied Computer Use helper | None claimed | `scripts/lib/provided-computer-use.mjs` pins copied packaged implementation bytes. The independent Swift helper is not evidence that those delivered bytes enforce a new migration gate. Direct helper/carrier entry and native messaging need their own actual paired boundary |
| Descendants, MCP workers, memory process, image workers and shell/command spawns | A refused new daemon cannot create new ones through its normal entry | Already-running or independently spawned descendants may escape a process group and must be drained with actual ownership/containment |
| Renderer, extension service worker, local/session storage, IndexedDB/LevelDB and profile preference writers | Only a refused new browser generation cannot create them through this startup | No existing-renderer/storage drain or writer admission acknowledgement exists here; no database mutation is authorized |

In the actual CLI source, `runLogin`, `runSessionQueue`, `runSettingsSaveSessions` and final `buildProgram(...).parseAsync(process.argv)` are behind the first-statement gate. The daemon's final startup/verify dispatch, `spawnCommand`, workers, runtime acquisition and native/memory initialization are likewise behind it. This inventory is not a claim that every third-party or opaque runtime writer has been instrumented.

## Lean verification completed

`node --experimental-vm-modules --test vendor/provided/aux-cold-entry-admission.test.mjs` passes four focused cases. Actual complete supplied daemon/CLI source is compiled as an ESM module, every static dependency is checked against the pinned builtin inventory, and undefined synthetic builtin bindings make fs/process/native functions uncallable. Evaluating each actual entry still throws the exact quarantine error before any bundled initializer. State1 byte equality and wrong prefix/source/version/mixed refusal also pass.

A read-only in-memory composition probe applies one anchor each to the actual daemon/CLI in `out/provided-reuse-aux-parallel-identity`. No packaged code was executed, native build run, owner state read, helper launched, process inspected or root pipeline changed. Root must integrate and rebuild the copied components before claiming that a successor contains this gate. State2 activation, all-writers proof and native cryptographic migration remain blocked separately.
