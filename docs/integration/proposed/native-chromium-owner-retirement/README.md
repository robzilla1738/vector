# Chromium new-target owner retirement: source-positive finding

No behavioral patch is justified for the default destructor. The current native ChromiumNewTargetImport/Handler ownership preserves the supplied owner-retirement behavior. In particular, closing/destroying the initiating owner does **not** mean source import cancellation or automatic deletion of the reserved profile.

## Positive original chain

- Original WebUI handler destructor424f238 invalidates its own weak state, resets Safari and Firefox owners, then loads the owned Chromium migrator at handler+10, clears that pointer, calls4252f84 at424f2c4 and deallocates its90-byte object. This is unique ownership, not a process-global import job surviving the Handler.
- Migrator ctor4252ec0 initializes owner+80/+88 as a real weak-flag/owner pair. Destructor4252f84 clears+88, marks flag+4 invalid at4252fa4, releases it, then releases stored completion+78, runner+70, receipt+68 and strings. The complete destructor4252f84..42530c0 has no call to failure4253b3c, profile-attributes removal, target deletion or real completion callback.
- Start posts the provider task with owned selected-source/path values and a separate owner-weak reply bound to42534e8. Provider reply invoker41b06c8 tests the weak flag and returns at41b06d8 on invalid/absent ownership before entering the reservation path. Thus destruction **before provider reply** does not create/reserve a target.
- After actual reservation,42534e8 copies/moves source kind, source path, target path, display name and optional captured provider password into the worker4255868 task. Its separate reply is bound to4257640 with the same owner weak pair. Reply invoker425f03c tests flag+4 and returns at425f04c before entering that method if the owner retired. Task/reply wrapper4253d68 retains the work and reply independently; it does not pass an owner pointer or owner-alive callback into the clone worker.
- Therefore an already running clone can finish its own real work after owner destruction. The worker's existing source-defined local failure cleanup still applies, but an abandoned weak reply does **not** invoke the coordinator failure cleanup. A successful copy whose owner disappeared can retain its reserved attributes/copied directory; adding deletion in the destructor would diverge from the supplied implementation.
- Worker-success4257640 builds `CreateProfileAsync`'s initialized callback with the same weak pair+80/+88 and a null created callback at425783c. Initialized invoker2979d00 likewise returns on invalid ownership. If retirement occurs after actual CreateProfileAsync dispatch, ProfileManager's already requested creation is not rolled back; the retired migrator does not apply its later metadata/restoration/completion.

These are source semantics under owner destruction; they do not claim that every UI close gesture is admitted during a job. Original Start also disables genuine native standard buttons when its UI flag requests it. Nor do they claim that work survives global application shutdown: task-runner shutdown policy is a different boundary.

## Current native comparison

Retained current snapshots in `current/` pin the actual reviewed implementations and their whole-file hashes:

- `Handler` owns `unique_ptr<ChromiumNewTargetImport> new_target_`. Its weak factory is last; destruction retires Handler replies and later destroys this actual owner. The destructor's `CancelChromiumWebUIImport` branch applies to the distinct current-profile mode1 service job, not mode0 `new_target_`.
- `ChromiumNewTargetImport`'s default destructor destroys its **last** WeakPtrFactory first. All captured-provider, clone-worker, profile-initialized and destination replies bind its WeakPtr. Its Completion is destroyed rather than called with a fabricated failed/cancelled result.
- Provider/copy tasks own their inputs by value and have no owner-alive cancellation predicate. The existing clone worker remains the owner of source-defined local failure cleanup. No destructor removes reserved attributes or the copied target. No new delayed work reaches the dead raw ProfileManager through the retired weak coordinator callback.
- Its actual destination keepalive is released on retirement. Already enqueued native store operations retain their real backend ownership; no cancellation/rollback of imported data is invented.

The header sentence saying the real owner “must outlive its accepted job” is overly broad historical guidance, **not a current enforcement mechanism**. It should be read as no raw owner use after destruction; the source-correct behavior above intentionally permits retirement while owned tasks finish. The requirement to retire the controller before ProfileManager shutdown remains valid for the current155 adapter. No hidden reference-counted UI owner or forced successful completion should be introduced to satisfy that comment.

## Verification and limits

`python3 verify.py` checks the full original static SHA, nine bounded original code ranges, exact assembly artifacts and the four immutable current source snapshots. It performs no native build, launch, task execution, profile/DB/Keychain/OS access or runtime close test. This is a positive static lifetime comparison, not runtime cancellation acceptance. No shared native source, GN, root manifests or Handler implementation was changed.
