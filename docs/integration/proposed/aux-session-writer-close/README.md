# Owned session command-writer closure

This source successor implements permanent native admission closure for one existing SessionService/CommandStorageManager and its actual owned clear/encrypted backend instances. It extends the captured-snapshot write result; it does **not** turn that result into whole-profile custody. No shared native sources, GN files, accepted app or UI changed.

`SessionServiceBase::CloseCommandWriterAdmissionAndObserve()` forwards through its already-owned manager. An absent manager produces an explicit asynchronous unavailable observation; the method invokes no lazy getter, factory or rebuild. No coordinator, JS/environment switch, protected-authority grant or state2 readmission is introduced.

The manager closes admission synchronously before cancelling its save timer or posting close jobs. Guards cover scheduling/rebuild buffers and reset flags, save, rotation/deletion, read/migration/fallback dispatch, write-error delegate retries and encryptor initialization/replay. A delegate can reentrantly close during Save: rotation rechecks lifetime/admission after Save returns. Moved-out deferred replay is counted while running. If it reenters close, unexecuted opaque closures are moved back into the owned pending vector, replay stops, and the active-at-close observation remains conservative. If the manager itself is destroyed, no private payload restoration is claimed.

Close does not submit or discard pending commands to manufacture success. It reports unsubmitted command/reset counts, pending and active encryption operations, missing required encrypted backend, refusal counts and unknown accounting. These are retained unresolved conditions. The existing open scheduling/2500ms save and encryption behavior is preserved until explicit native closure. There is no reopening/reset/replay API.

Each close task holds the actual backend reference and executes non-nestably on its existing sequenced runner behind already-posted work. Both actually-owned backends are included, even a clear backend retained only for fallback. A rejected post reports rejection, not closure. The backend verifies its real owning sequence, closes its own admission, and releases its owned File object. It does **not** call cleanup-deleting `CloseFile()`, initialize directories, truncate, reopen or delete incomplete files. Future public append/read/rotation/delete entries refuse before I/O, including already-posted read replies that attempt a later fallback or deletion. All posted receiver references are explicit scoped references. Completion callbacks survive manager destruction; dropped callbacks remain unobserved.

## Exact observation and remaining gaps

Backend results distinguish role, owning-sequence observation, permanent admission closure, owned File-object release, rejected tasks, refused requests, prior unsuccessful append returns and unknown counters. Prior append failures remain recorded; they do not become success because a close ran. The new close result is separate from `SessionWriteCompletion` and has no combined “complete” authorization method.

File-object release means exactly that Chromium's RAII `File` object was destroyed. The pinned `File::~File`→`File::Close`→scoped-FD close path is real, but returns no close-error status here. Existing rotation/deletion/initialization routines also return void or ignore individual filesystem results. This proposal observes their sequenced calls returning before its close task, **not their successful side effects**, and does not invent missing outcome reporting. There is no fsync, atomicity, directory durability, arbitrary external-FD or whole-process drain guarantee.

It fences only these owned instances. Another manager/process, static file consumer, renderer, extension, prefs/IndexedDB writer or independent helper can still access the same storage. Origin-sequence callbacks can still execute after backend observation, although these closed instances reject their later I/O requests. A genuine native lifecycle owner must first stop upstream activity, obtain the actual final snapshot write result, close this participant, and separately own every other writer. Pending/unavailable/rejected/unknown results cannot authorize migration or protected startup. No native owner currently initiates this close; current first refusals remain intact.

## Focused verification and integration

Three actual changed production TUs compiled with pinned current AuxFast GN flags and a proposal-only include overlay: backend, manager and SessionServiceBase. Seventeen executed checks cover actual production admission state, irreversible closure/failure retention, unavailable defaults, closed-write refusal and exact move-only identity retention of unexecuted closures. Source checks cover all six backend and thirteen manager entry gates, actual owning-sequence ordering, explicit receiver ownership, reentrant Save/replay and no lazy manager creation. The original real append/serialization/write body stays byte-identical. This is source/object and bounded software verification, **not real backend/file-close execution, linking or browser runtime acceptance**.

The dry staged-parent composition replay preserved all 777 sources and 23 assets at `out/native-reuse-composition-aux-session-write-gn` (SHA-256 `eac2e5cba8b41fe82611378892a55cd424ffe4a7b19c1031beea30a3ce59c806`). Seven source edits and one new header produce 778 source records. Root owns registration of `components/sessions/core/session_writer_admission.h`, source application and any future linking/runtime acceptance. No whole-browser build, protected call, owner data, original addon, Security/Keychain operation, OS grant or signing ran.

```sh
python3 docs/integration/proposed/aux-session-writer-close/verify.py
python3 scripts/native-build.py sh docs/integration/proposed/aux-session-writer-close/check.sh
python3 docs/integration/proposed/aux-session-writer-close/prepare-composition.py \
  --artifact-root /Users/rcourson/Documents/Vibe/web --output /absolute/fresh/composition
```

An optional changed-TU reproduction is `python3 scripts/native-build.py python3 docs/integration/proposed/aux-session-writer-close/compile-check.py --output /absolute/fresh/objects`. It compiles only those three TUs from existing pinned flags and does not link or run them. No broad unchanged suite was repeated.
