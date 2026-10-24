# Runtime publication successor: exact native custody blocker

No callable publisher was added. The selected source can retain the authenticated
Owner/action and derive a task directory FD. It cannot meet the proposed
publisher's required stage-name custody across identity checking and the atomic
publication syscall. Replacing the current copy loop with a check-then-rename
would improve crash visibility but would not implement the requested contract.
The current feature candidate, runtime bytes, ABI, stage and source pair are
unchanged. This conclusion does not claim a new runtime test or close cold
startup, hostile same-UID custody, whole-writer drain or cache completeness.

## Available authority versus missing custody

- The actual WorkerHost retains `shared_ptr<Owner>` from its registered Node
  Environment. Its imported Owner is released through the existing native lifetime.
- `AuxCommandDispatcherRegistry.withEntry` increments `entry.active`, retains the
  Entry and holds `entry.execution` through a synchronous admitted native action.
  Fresh authority checks can wrap a native publication action; this seam exists.
- `NativeFreshStagedContext.duplicateAuthenticatedTaskHome` derives the task FD
  through the admitted native Owner and returns the authenticated transport
  generation. `AuxNativeTaskLayout` retains the task home and verifies metadata,
  reservation, identity and policy. These are authentic sources of authority.
- **None excludes mutation of the staged directory entry.** The seed creates and
  populates staging with JS pathname filesystem calls. `withBrokerAwaited` only
  counts a pending reviewed Promise and retains its Owner; it releases the Worker
  mutex before invoking JavaScript. The seed's filesystem operations do not
  acquire `entry.execution`. The task-layout `entry` helper compares `fstat` and
  `fstatat`; it does not grant a name lock or mandatory filesystem custody.

The failing boundary is precise:

1. Native code opens `.aux-runtime-seed-*` using the retained task FD and verifies
   device/inode and metadata against the retained staged directory FD.
2. Another writer replaces that child directory entry after the final check.
3. `renameatx_np(taskFd, stagingName, taskFd, "runtime", RENAME_EXCL)` publishes the
   replacement entry. The syscall receives a basename, not the verified stage FD.

`RENAME_EXCL` protects the destination from replacement, including an existing
empty directory. It does not compare the source entry to an expected inode.
Another `lstat`, a post-rename check, advisory flock, JS nonce, or an in-process
mutex used only by the publisher cannot close that gap. A postcheck may correctly
report an unknown outcome, but it cannot retroactively ensure the authenticated
stage was the object published. Deleting or rolling back runtime is disallowed.

## Required next contract before a coupled implementation

The producer and publisher need a native retained staging lease with enforceable
namespace custody: its creation/population/mutation path must be mediated by that
owner, and the final name-to-held-directory association must remain protected
through publication. The same authority must define when permitted writers are
settled, when revocation prevents starting publication, and how an already
committed rename becomes unknown if durability or post-authorization fails.
A JS staging name plus expected device/inode mismatch values cannot supply this
capability. Existing locks do not prove exclusion of hostile same-UID writers;
that mandatory custody boundary remains explicitly open.

There are two distinct architecture choices; neither is silently selected here:

1. **Mandatory custody:** provide an enforceable filesystem/process security
   boundary that prevents even other same-UID writers from substituting the
   staging entry while the admitted owner publishes it. An advisory lock or
   ordinary same-UID permissions are insufficient. The actual provider,
   installation/grant requirements and authenticated admission must be reviewed
   before the publisher can rely on it.
2. **Explicit cooperative supervised-writer contract:** if the owner chooses a
   narrower model, every Aux stage creator, copier, chmod/symlink operation,
   publisher and cleanup path must use one retained native staging lease and the
   same cross-process coordination rule. Close mutator admission, await every
   actual worker/handle completion, and hold exclusive coordination from final
   FD/entry validation through rename and durability/outcome recording. Native
   retirement must revoke new mutators without falsely settling existing ones.
   No Aux helper or JS pathname cleanup may bypass this protocol. Unexpected
   mutations must refuse or remain unknown. This can serialize participating Aux
   writers but **cannot** claim protection from nonparticipating same-UID code;
   it requires an explicit owner architecture decision, and existing mandatory
   custody/cold-start release gates do not become satisfied as a side effect.

Once that contract is actually available, a coupled unsigned successor must
update WorkerHost registration/NAPI, the C bridge and dispatcher, Owner/task-FD
publication method, runtime seed and bootstrap together. It must preserve fixed
literal `runtime`, one exclusive syscall, EEXIST retention, post-commit unknown
outcomes, no ordinary-rename fallback, no destination cleanup, and original
runtime files/text reversals. Rebuild both native source entries and their link
inputs/receipts; do not attach this ABI to the already built feature candidate.
No build recipe claiming this contract is supplied while its custody provider is
absent. `proposed-interface.h` in the predecessor audit remains a design contract,
not a registered operation.

## Focused evidence

`evidence.json` confirms all ten predecessor audit pins still match, adds the
actual linked awaited/synchronous broker and Owner task-projection source pins,
and count-checks seven exact seams. This was one bounded static hash/count check.
No broad tests, payload copy, native compilation, product/module execution,
owner-state access, credentials, OS grants, signing or release occurred.
