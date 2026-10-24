# Native runtime publication under standard profile isolation

Inactive source successor. This implements the native seed operation and common
cooperative lease primitive after the owner selected standard browser profile
isolation. It does not claim mandatory exclusion of unrelated same-UID programs,
complete writer integration, a compiled module, a usable package or runtime
acceptance. The current app, a3 native artifacts and a21 build remain unchanged.

## Implemented boundary

`seedBundledRuntime()` is a zero-argument immutable native binding. It captures
the actual registered Environment/Worker/Owner, increments native pending before
queueing, and authenticates the exact task descriptor and transport generation.
The new native C callback executes within the existing retained dispatcher Entry
and its fresh before/after guards. The distribution directory is derived from
the admitted daemon bundle policy and fixed `agent-runtime` sibling. JavaScript
cannot select a source path, FD, pin set, staging name, destination or owner.

A single native worker creates a random exclusive staging directory, copies all
compiled seed pins, reverses the nine original bundled text relocations before
checking original hashes, applies the task-home relocations, creates exact
symlinks/modes, and verifies the complete resulting inventory and namespace.
Files and directories are physically flushed. No asynchronous copy child or JS
mutation handle exists. The fixed additional leaves are `tmp` and `.npmrc`.
The compiled text-root literal is pinned to the existing metadata; changing the
packaged seed requires an explicitly reviewed inventory/text-root successor.

The final local close/cancel admission check and sole
`renameatx_np(..., "runtime", RENAME_EXCL)` run under the Worker mutex. The
exclusive lease spans final validation, publication, parent fsync, dispatcher's
postguard, retained-published-inode check and outcome bookkeeping. An existing
runtime and EEXIST are retained unchanged. Uncertain syscall errors, failed
postchecks/durability or a known committed rename never trigger destination
cleanup or rollback. A failed precommit operation cleans only its own retained
staging directory under the same exclusive lease; cleanup uncertainty poisons
the existing native unknown-work flag. Non-EEXIST rename errors conservatively
leave both names untouched for reconciliation.

NAPI cleanup requests cancellation but keeps pending and the cleanup hook until
the actual native async completion callback. Only definitive failure to queue
can settle before execution. Native lease release occurs after physical work
and outcome handling, independently of whether JavaScript observes its Promise.
The two JS leaves now call this native operation; they perform no staging writes.

## Common lease contract for remaining runtime writers

`aux_runtime_publication::Lease` is native-only, noncopyable and owns its FDs.
`Acquire(authenticated_task_fd, native_current, Mode::kSharedUse)` obtains a shared
runtime-use lease. `Mode::kExclusiveMutation` obtains exclusive mutation/seed
ownership. Keep the holder in the actual native operation record, not a JS
external with a garbage-collection release policy.

Each acquisition independently opens the authenticated task directory, locks
that directory exclusively as an admission gate, and opens the fixed private
`.aux-runtime-use.lock` inode. The leaf is validated, fsynced when created and
**never unlinked** by participating writers or cleanup. Shared holders acquire SH
on that leaf then release admission; exclusive holders retain admission while
waiting for EX and throughout mutation. Thus a pending admitted exclusive writer
prevents new uses while existing users physically settle. Independent open file
descriptions exclude separate workers in the same process as well as processes.
Waiting is bounded and checks native closure; timeout never settles any other
holder's work. This is cooperative coordination, not an OS sandbox.

Root must attach shared holders to actual agent/npm/pip process and OS work
lifetimes, including descendant/pipe work covered by the existing supervised
operation. A Promise resolving, kill request, cancellation or requested shutdown
is insufficient. Completion must release the holder directly from retained
native state **without re-entering dispatcher execution**: the publisher can be
waiting for it while holding the admitted dispatcher action. Unknown physical
settlement must keep ownership pending; do not free a live holder in a finalizer.
Root must attach the exclusive holder before any updater download/extract,
copy/chmod/symlink, backup recovery, replacement or cleanup mutation and retain it
through all actual work and outcome. Status/recovery helpers may not mutate
outside that ownership. Do not disable updater behavior as a substitute.

## Exact shared integration requests

`overlay.json` pins four actual predecessor leaves, exact count-one replacements,
three new native leaves and six immutable dependencies. `changes.patch` supplies
the reviewable narrow textual diff. These are proposals, not edits to the
selected build inputs.

1. WorkerHost: add five system/bridge includes, include the two implementation
   leaves after the existing inspector/pins/async definitions, register only the
   immutable zero-argument `seedBundledRuntime` property. Existing native methods
   remain unchanged. The bridge/header must enter the fresh native input closure.
2. The **actually compiled** dispatcher predecessor is the recovery checkout
   `AuxOwnedCommandDispatcher.swift`, not an older repository lookalike. Add its
   native action method and C export exactly; retain current guards and Owner ABI.
3. Apply the two runtime JS replacements together with the actual rebuilt host
   and Swift entry objects. The old a3 host lacks the new binding and must refuse;
   never attach the new JS to an old package or relabel old link receipts.
4. Root's updater/use lane must consume the shared lease class above and close
   every participating runtime mutation path. That integration is not delivered
   by the seed-only binding. No whole-writer guarantee is set here.
5. Generate fresh real native compile/link receipts and a new paired source/entry
   projection/package review. Preserve native addon/import/private ABI checks,
   current unsigned policy and cold-start acceptance gates until actual evidence.

## Focused evidence

Run `python3 verify-source.py` for exact read-only baseline/dependency hashes,
counted replay, one exclusive-rename check, no JS staging mutations, cancellation
accounting structure and syntax checks for only the two changed JS leaves.
`source-check.json` records that bounded check. It does not execute C++/Swift,
load a module, create a cache, run an app or claim coordination/runtime acceptance.
Native compilation and actual cooperative-writer integration remain required.
