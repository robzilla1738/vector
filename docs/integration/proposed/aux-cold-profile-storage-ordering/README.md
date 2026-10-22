# Cold disposable-profile migration ordering

This bounded source-only proposal identifies the actual ownership boundaries for a future cold migration. It adds no coordinator that returns an invented all-writers receipt, performs no live teardown and does not activate state2. Fifteen actual native/packaging source files and exact anchors are recorded in `source-pins.json`. No existing profile, process, credentials, Keychain or browser UI was accessed.

## What is enforceable now

The native `BasicStartupComplete` state2 refusal remains before user-data initialization, ProcessSingleton forwarding, BrowserProcess state and ProfileManager/renderer/extension startup. The new SEA guard refuses copied daemon/CLI entry execution. The generated Node entry additionally defers its asset import until after that first refusal. Those are admission refusals for the new generation; they neither stop old writers nor authorize a transaction.

**Packaged CLI residual:** `provided-package.mjs` renames the supplied CLI to `aux-cli-sea` and installs `aux-cli-launcher` at `aux-cli`. The actual native `vendor/provided/native/cli-launcher.mm` reads `AUX_HOME`/`HOME`, executes `mkdir(home,0700)`, validates/canonicalizes the directory and constructs its scope **before** `execv(aux-cli-sea)`. Therefore the SEA refusal does not establish zero packaged-CLI state mutation. This source was not modified. A source-pinned pre-mkdir state2 admission check and native boundary-wrapper rebuild are required before making that stronger claim; merely changing the SEA or launch script is insufficient. Finder's development CFBundleExecutable adjustment is a separate launch route, not proof that every direct CLI invocation bypasses the wrapper.

## Actual ownership APIs and why live teardown is unsafe

| Actual source owner | Enforced behavior | What it does not prove |
| --- | --- | --- |
| `BrowserProcessImpl::profile_manager()` | Lazily calls `CreateProfileManager()` on first getter access | Calling the getter to inspect `GetLoadedProfiles()` is not a side-effect-free pre-profile probe |
| `ProfileManager::LoadProfileByPath()` / `CreateProfileAsync()` | Load routes through create; startup can defer create, and profile destruction can queue later creation | Empty current inventory is not closed future admission; queued work can reopen a profile |
| `BrowserContext::ForEachLoadedStoragePartition()` | Enumerates already loaded partitions; API documents that persisted partitions remain for the BrowserContext lifetime | Lazy/unloaded partitions and future creation are not fenced |
| `BrowserContextImpl::NotifyWillBeDestroyed()` | Sets shutdown state, notifies partitions, cancels navigations conditionally and disables renderer refcounts | Its void return is not a callback acknowledging all process/storage exits |
| `ProfileDestroyer` | Waits for dependent renderer hosts and retries | Source explicitly allows new hosts to appear during retry; destroying profiles changes live session/UI behavior |
| `ProfileImpl::~ProfileImpl()` | Performs two-phase keyed-service shutdown before `ShutdownStoragePartitions()` | Destructor entry or notification is not a durable database-copy boundary |
| `BrowserContextImpl::ShutdownStoragePartitions()` | Resets the partition map and a SQLite-owning BTM service | It has no completion receipt for every separately referenced backend or other process |
| `StoragePartitionImpl::~StoragePartitionImpl()` | Shuts down DOM storage, service workers, file-system and other contexts | External references, independent processes and later queued activity require separate lifetime handling |
| `DOMStorageContextWrapper::Shutdown()` | Resets session/local-storage Mojo controls and policy observer | No all-storage stable-file acknowledgement is returned |
| `StoragePartitionImpl::Flush()` / DOM Flush | Issues DOM/session/local-storage flush calls | Not a sync-to-disk guarantee, future-admission fence, IndexedDB closure or stopped-writer proof |
| `ServiceWorkerContextWrapper::Shutdown()` | Clears workers/context core and shuts down process manager | Not a global extension/helper/runtime-process barrier |

`WaitForDeletionTasksForTesting` and network/cert verifier flush APIs are explicitly testing APIs, not production migration completion hooks. Do not use them as an authority shortcut.

## Supported stopped-before-start path

A safe narrow target is a **new disposable copy** that the migration owner created exclusively and that no browser/profile/runtime has ever opened. The cold migration must run before launching any process that can touch this copy. This avoids attempting to move live BrowserContext storage. Original snapshots may come only from separately authorized source state whose actual writers are already fully stopped with retained ownership evidence; a copied WAL is not itself proof of that condition.

The supported order is:

1. Create and retain exclusive custody of the new disposable target. Do not adopt an existing owner home/profile, infer custody from a PID file, or promote ProcessSingleton/advisory-lock possession into authority.
2. Keep all new-generation browser, daemon, CLI, wrapper, helper and runtime admissions closed. Existing native/SEA refusals remain. The CLI wrapper pre-mkdir gap must be closed before an owner can assert complete participating-entry refusal.
3. Join only actually owned old browser/helper/descendant lifetimes. A direct daemon result covers that one child; a process-group guardian does not cover a descendant that escaped the group. If any writer scope is unknown, stop here. No live ProfileManager, profile destruction, storage flush or process-name takeover is a substitute.
4. While no process has opened the target, perform the existing bounded offline journal prepare/commit/recover/verify against its explicit disposable capability. No Chromium ProfileManager or BrowserContext should be instantiated in the migration process. Keep the original snapshot/sidecars and hashes for rollback; no copying over a live SQLite/LevelDB directory.
5. Verify terminal target state and complete entrypoint/ownership coverage before any consumer starts. The current unconditional state2 quarantine remains because this complete authority is not implemented. A terminal transaction receipt alone cannot unlock it.
6. On a future reviewed implementation, start the newly accepted process generation only after custody and readmission verification. Acquire normal ProcessSingleton/profile ownership at ordinary startup, then let ProfileManager and extension storage open the migrated copy. A leftover migration journal or mismatched target must keep admission closed.

This order is supported as a design for never-opened disposable targets. This proposal does **not** implement or attest to step 3 or readmission; real old-writer custody and descendant fencing remain absent.

## Smallest next native implementation slice

The immediate implementable slice is the packaged CLI wrapper **pre-home-mutation refusal**, not a live BrowserContext shutdown coordinator:

- Use its already resolved, fixed outer bundle resource root to read only the immutable `bundle.json` before `getenv(AUX_HOME/HOME)` or `mkdir`.
- Match the native browser's strict marker policy: valid supported implementation/profile and state1 only; missing/malformed/duplicate-key/unsafe marker or state2 refuses. Never trust an environment/command-line acceptance flag and never examine owner state to decide admission.
- Pin original wrapper/build sources, add pure marker and source-order fixtures, rebuild that exact native boundary wrapper through the owner pipeline and verify the new packaged `aux-cli` bytes. Preserve normal state1 home/scope behavior and UI.
- Keep scope explicitly “this new wrapper refused before home mutation.” This still says nothing about already-running old wrappers, helpers, runtime bootstrap direct entry or every writer.

After that, the necessary coordinator is actual owned browser/helper/descendant lifetime custody outside Chrome startup. It must not call `profile_manager()` merely to discover that no manager exists: that getter creates one. No additional speculative native state-machine class is added here because it would not enforce the missing owners. Only once custody is real should a narrowly typed before-profile transaction/readmission integration be proposed.

## Verification and limits

`node docs/integration/proposed/aux-cold-profile-storage-ordering/check-source.mjs` verifies all source hashes/anchors and the concrete getter/queue/destructor/flush/wrapper ordering assumptions. It reads static source only. No native checkout, GN file, adaptation input, packaged asset or accepted UI changed. No build or runtime test was performed. Source drift requires re-review; this document must never be consumed as a stopped-writer receipt.
