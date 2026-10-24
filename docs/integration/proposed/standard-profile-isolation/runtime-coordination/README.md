# Runtime updater and use coordination

Inactive successor to `runtime-publication` commit `c43844547`. This supplies
native lease ownership for the real updater and task process paths and replaces
the updater's untracked filesystem writes with finite synchronous native calls.
It preserves the supplied UI, progress phases and whole-runtime backup flow. It
has not been compiled, linked, activated or accepted in a running app.

The exact current ordinary source and dormant entry are replayed independently
with 15 count-one anchors each. Input and resulting hashes are in
`source-check.json`; no old source/entry projection receipt is relabeled.
The current a21 tree, a3 host, stage, source projection and package are untouched.

## Actual behavior supplied

- `performInstall` first recovers an existing backup under an exclusive scope,
  then calls the native seed **outside** that scope, then obtains the installer
  scope. It cannot recursively wait for its own seed lease.
- Runtime metadata and archive roots now consistently use `aux-runtime-`.
  Downloads require a future authenticated Aux release policy before consuming
  an archive. Missing policy reports `AUX_RUNTIME_RELEASE_POLICY_UNAVAILABLE`.
  The At Inc. updater allowlist is removed; authentic bundled third-party
  signatures, required notices and compiled seed pins remain unchanged.
- Downloads feed bounded buffers directly to synchronous native writes. ZIP
  extraction preserves existing archive validation but creates directories,
  writes, chmods and symlinks through the retained native scope. ZIP iteration
  and the managed reader's actual close-bound lifetime both settle before
  normal scope closure. Missing/failed physical lifetime marks native uncertainty.
- Runtime home/tmp copying, backup recovery, whole-tree replacement, rollback
  and own-stage cleanup use the same scope. Native paths are restricted to the
  admitted task's `runtime`, `runtime.backup` and its one natively generated
  `.runtime-install-*` stage. No caller supplies a task FD, root or owner proof.
  Parent traversal is descriptor-relative and no-follow; copied regular files
  reject hard links, special files and changes while copying. Only whole runtime
  roots can be renamed, with `RENAME_EXCL`; uncertain renames/durability preserve
  both names and prevent cleanup/rollback.
- Status reads take a shared scope. They take exclusive ownership only when an
  actual missing runtime plus backup needs recovery. `getAgentRuntimeStatusUnlocked`
  no longer silently mutates. Quarantine status reads use synchronous native
  `fgetxattr`, avoiding a child process for routine startup/status checks.
- `acquireAgentRuntimeUse` acquires a native shared scope and checks the current
  native retained-runtime inspection. Its JS release closes only that admission
  guard; **each actual native exec/PTY reservation owns its own shared lease**.
  Thus an early JS callback cannot release a live process's runtime protection.
- An installer command explicitly enters `scope.run(callback)` only around its
  synchronous native spawn admission. That thread-local scope is restored as
  soon as the callback returns; asynchronous or unrelated jobs do not inherit
  exclusive ownership. The existing actual exec/PTY token retains the scope.
  Direct native exit and JS callbacks do not settle descendant custody.
- The lease core gains only an optional bounded acquisition-attempt parameter.
  Normal asynchronous acquisition retains the existing bound. Synchronous native
  spawn uses one nonblocking attempt; an installer race refuses rather than
  freezing the JS/UI loop for the full waiting period.

All own-stage native operations finish their OS calls before returning; there
is no new JS Promise-as-physical-proof API. `close()` requests closure. It can
release only a scope with no pending/created child cohorts or native unknown
outcome. GC and environment cleanup request that same closure and never certify
running work. Actual failed-before-child native callbacks settle their own
reservations. Actual child creation retains custody.

## Native integrator contract

`overlay.json` contains exact baseline pins and narrow counted overlays for the
publisher's WorkerHost and lease core. Compose these hunks with root's clean-query
changes; do not overwrite a newer root WorkerHost with the copied source file.
The new `AuxRuntimeCoordination.inc` is included after publication code.
The immutable zero-argument bindings are `acquireRuntimeMutation()` and
`acquireRuntimeUse()`; the result has frozen native-bound methods. All methods
that mutate require exclusive ownership; capture/revalidation uses the actual
Environment/Worker/Owner, never the caller's routing identity.

Actual Worker fields, read under its mutex with no Dispatcher call:

- `runtime_scope_pending`: genuine acquired/acquiring/retained scopes, including
  unknown physical children; actual known closure decrements it.
- `runtime_scope_unknown`: any native I/O uncertainty or unproven created child
  cohort. Current source has no active descendant-settlement producer, so this
  remains sticky after child creation.

Both fields are already added to this proposal's actual close/drain and retained
Worker cleanup checks. Root's clean-query must also include both. Native
`ExecReservation` and `PtyReservation` each own their exact `runtime_scope`.
`RuntimeChildCreatedLocked` runs inside the actual Worker lock; only proven
no-child failure calls `RuntimeChildFailed` after releasing it. Existing direct
exit handlers are unchanged.

`RuntimeChildCohortSettled(scope)` is an **uncalled native-only integration seam**
for a future proved kernel cohort. The native reservation owner must call it
exactly once per complete cohort, never for a PID probe/direct exit/empty map.
It decrements that scope's cohort count and recomputes only runtime scope
uncertainty; it never clears native I/O unknown flags or existing exec/PTY flags.
A shared installer scope can have several independent cohort tokens, each of
which must settle. It never re-enters Dispatcher to release a draining lease.
Root and the native observer lane own any future cohort binding and validation.

## Remaining limitations, explicitly not completion claims

1. **Real descendant settlement is missing in the selected predecessor.** Its
   exec/PTY callbacks deliberately retain unknown descendants. This proposal
   preserves that fact. After such a process is created, the scope remains
   retained; updater replacement and shutdown cannot report completion merely
   because its direct child exited. A fresh native supervisor/observer barrier
   and actual authorized capability verification are separate integration work.
   The reserved settlement seam does not establish this evidence.
2. **Aux release trust and hosting are not configured.** The source requests
   immutable native `authorizeRuntimeRelease` and `authorizeRuntimeReleaseFiles`
   policy entry points only for downloaded updates; no such authority is invented
   here. Root must not add a permissive stub. Bundled seeding and offline fallback
   remain available; downloaded updates honestly refuse until distribution is
   configured. No signing, verification command, xattr mutation or provider call
   was executed by this work.
3. **Abandoned stages are not blindly deleted.** Only the operation's own stage
   is cleaned. An old stage with uncertain provenance/outcome requires explicit
   recovery evidence; a directory name or successful new lock acquisition is
   not proof that an old process cohort settled. The prior broad pathname sweep
   is intentionally removed. Runtime/backup recovery remains guarded.
4. Native compilation, input-closure review, new real host/link receipts, final
   ordinary/dormant source projection and a successor package are pending root
   integration. These sources cannot be paired with the old a3 host.

## Focused evidence

`check.mjs` replays the actual ordinary and dormant inputs, syntax-checks those
outputs without importing them, checks the exact native child hooks and runs
three small synthetic async-scope isolation/reentrancy checks. It does not load
the product/native module, spawn a runtime command, touch owner state or claim a
native concurrency test. `source-check.json` records the result. No broad suite,
app launch, native build, provider request, signing or current-artifact mutation
was run.
