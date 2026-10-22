# Owned direct-writer admission boundary

Implemented a necessary coordinator boundary, **not the complete native
stopped-writer fence**. The current Aux launcher/state2 refusal is unchanged.
No actual browser, daemon, renderer, owner process, credential, Keychain or
existing state directory was operated. Execution uses spawned synthetic writer
modules only. Source pins record the actual launcher, native supervisor and
offline journal/handoff reviewed for this design.

`scripts/lib/aux-disposable-writer-coordinator.mjs` creates its own private new
disposable root; existing-root adoption is rejected. Explicit small participant
source buffers require hashes. It spawns direct Node children itself, retains
their actual ChildProcess handles and does not export PID-kill handles. It does
not discover processes from names, ports or owner state. Environment forwarding
is restricted; no inherited NODE_OPTIONS, credentials or native injection.

All participating launches pass one synchronous admission gate. `freeze()`
closes it before awaiting anything, requests shutdown over the owned IPC channel
and waits for actual child close/clean exit. No automatic restart path bypasses
this gate. A failed or timed-out drain leaves admission blocked. It is **not**
enough for a child to acknowledge a message or for a callback to return true.
The returned receipt explicitly says owned-direct-participants-only,
nativeWritersVerified:false and descendantsVerified:false.

The same coordinator can exercise the real offline prepare/commit/recover/
verify implementation against its **fresh synthetic root only**. Its internal
capability cannot be obtained by a caller or used for any existing Aux state.
That closure verifies the coordinator phase, empty actual child set and root
identity. It is intentionally not general browser migration authority. No
external `assertStopped:()=>true` or verifier callback is accepted by this API.

Re-admission requires `reopen({expectedReceiptSha256})`. This calls the actual
`verifyStateMigration`: journal must be terminal, receipt hash exact, receipt
fields match the journal, originals/backups intact and current target hashes/
identities match the committed or rolled-back generation. No writes are allowed
to participating children until verification completes. Interrupted preparation
or commit remains frozen until explicit recovery. Unchanged terminal receipt
alone cannot hide changed target bytes. Reopen returns
state2LaunchAuthorized:false. Dispose only signals handles spawned here; it
retains the synthetic root/journals rather than deleting possibly live state.

## API and lean verification

`createAuxDisposableWriterCoordinator({participantSources,initialFiles})` returns
`root,start,freeze,migrate,recover,reopen,dispose,snapshot`.

* Participant descriptor: `{id,bytes,sha256}`. Reviewed synthetic modules send
  `{event:'ready'}` over IPC and handle `{event:'aux-fence-stop'}` by flushing,
  closing and exiting. Actual source pins, not an asserted role name, define
  what runs. This module cannot prevent a malicious or unsuitable participant
  from spawning detached descendants; do not use it for such code.
* Initial fixture files use bounded relative labels below `root/data`.
* `migrate({id,files,onCheckpoint})` delegates actual reviewed file descriptors
  to the durable transaction. `recover({action,onCheckpoint})` is explicit and
  restricted to the same retained coordinator. `onCheckpoint` observes the
  synthetic transaction and grants no shutdown authority.
* One coordinator handles one journal transaction; it may reopen the stopped
  participant generation after verified terminal state. It cannot recover a
  prior process's root or accept a persisted lock as proof of supervision.

`node --test scripts/lib/aux-disposable-writer-coordinator.test.mjs` passes six
focused synthetic tests: synchronous close/drain and stable writer output;
relaunch rejection at real journal checkpoints; interrupted commit/rollback;
wrong receipt and changed terminal target rejection; source drift/adoption
rejection; unclean writer exit leaves the gate blocked, including an abnormal
exit before freeze starts and after the active child set becomes empty. Child
errors immediately close admission. Disposal during an awaited empty drain
keeps admission closed and prevents migration. The test exercises real
child exits and actual offline journal receipts, not fake stopped acknowledgments.

## Exact missing native and renderer integration

1. Native `DaemonSupervisor::Start` launches independently using a ThreadPool
   task; `DidReadHealth` may schedule another Start after observed exit. Both
   the initial launch and retry timer must acquire the same per-home/profile
   generation admission authority. An external JavaScript lock cannot stop
   these existing native paths. A launch already pending must join drain.
2. `Shutdown`/`DidLaunch` already handle pending launch and `StopVerified` checks
   the owned daemon identity. `DidFinishShutdown(bool)` currently collapses
   success/failure into state, then invokes a no-argument closure.
   `BrowserPlatform::Shutdown` waits for that closure and resets the supervisor.
   A migration coordinator needs a retained typed terminal result with exact
   daemon creation identity, failed-drain status and generation, rather than
   interpreting callback completion as verified shutdown.
3. That native shutdown covers its direct daemon, not every supplied shell,
   runtime, MCP/helper or detached process descendant. The existing development
   guardian owns a POSIX group, but the launcher expressly records that runtime
   children can leave it. Every actual writer launch/spawn/respawn needs an
   enforced admission path or an OS containment mechanism with complete child
   lifetime ownership. An advisory file lock is insufficient.
4. Browser profile creation/open/reopen, Chromium singleton forwarding,
   additional windows, session restore, extension service workers and renderer
   restart must participate before preferences, SQLite or extension storage
   open. Drain must stop profile/background storage tasks and flush LevelDB/
   IndexedDB plus acknowledge renderer storage transactions. Daemon exit does
   not stop Chromium writers, and closing windows does not prove workers ended.
5. Generation admission must remain closed through prepare, partial commit,
   explicit recovery, filesystem/SQLite/renderer coordination and actual
   terminal verification. Gate reopening must reject missing/mismatched receipt,
   wrong home/profile identity, unknown journal, failed native drain or renderer
   acknowledgement. Update the actual native startup and launcher together.
6. Crash recovery needs ownership anchored by a surviving native broker/OS
   lifetime boundary; a stale lock or coordinator PID is not authority. This
   module deliberately refuses adoption rather than pretending it solved
   cross-process recovery. Ordinary current native startup does not yet inspect
   the journal/fence before opening state.
7. Only after those actual enforcement points and complete authority are
   implemented can the external handoff receive an all-writers stopped proof
   and state2 launch refusal be reconsidered. Native addon crypto migration,
   authority acceptance, signing scope and actual disposable app acceptance
   remain separate gates. No present test grants those capabilities.

No UI source, asset, stylesheet, package manifest, launcher or native source was
changed. This slice can be integrated as a necessary boundary/proof fixture; it
must not be advertised as the completed startup migration fence.
