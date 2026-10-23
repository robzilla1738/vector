# Native fresh-reservation restart boundary

Read-only design against the pinned source inventory. No adoption implementation,
protected operation, authority generation, compiler run or startup acceptance is
claimed here. The current live cohort-lease successor is deliberately not edited.

## Existing executable boundary

`AuxFreshNativeHome.create` uses a private initializer only after its actual
exclusive reservation and child creation. `generationAttempted` starts false and
exists only in memory. Recreating that type from a reservation would restore
factory capability after an unknown previous attempt; it must not be the restart
API. `AuxFreshNativeSecureCapture.capture` additionally requires all five rows
absent and the home empty, so it cannot authenticate a staged restart.

`NativeFreshStagedContext` currently stores the original real capture. Only the
stage coordinator's successful matching observation constructs it. Its
revalidation checks the signed policy, retained home, exact reservation hash and
actual immutable initial journal. Recreated target coordinators reuse that live
context; they cannot reconstruct it after process exit. Target `.intent` recovery
is already observation-only and must stay that way.

## Smallest concrete source continuation

1. Add a distinct `AuxResumedFreshNativeHome` with a private initializer and no
   generation/absence methods. Its only producer is an instance method on the
   actual authenticated fresh policy. Reauthenticate that policy before and after
   opening. Open the fixed canonical private parent and fixed reservation with
   `openat`, `O_NOFOLLOW|O_NONBLOCK|O_CLOEXEC`; retain parent/reservation/child FDs.
   Require owned 0700 directories, 0600 regular single-link bounded reservation,
   no extended ACL, stable inode/path identity and exact before/after bytes.
   A strict duplicate-aware marker decoder accepts only the known v1 keys,
   canonical UUID transaction/child grammar, and a scope derived from the actual
   canonical child path. Disk fields are locators, never authority or absence.
2. Read only the existing fixed initial-journal directory and
   `initial-journal.json` through that retained child FD. Existing store
   constructors create directories/LOCK and require an expected journal, so they
   are not the initial discovery reader. Add a bounded existing-only reader:
   no mkdir, publication or missing-to-empty conversion. Decode the exact native
   v2 journal, compare policy hash/role/group, reservation hash, scope and
   transaction, and derive the five selectors independently. Refuse v1 review
   journals. Retain the exact journal bytes/digest.
3. Add a private staged-context ownership branch for the resumed owner, leaving
   the fresh factory input unchanged. A single native `resume` producer privately
   constructs a provisional context only after steps 1–2, then creates the actual
   `AuxNativeFreshTargetBoundary` before returning it. That constructor recaptures
   the protected stage, verifies its exact hash/schema/selector/candidate/public
   bindings and imports/unwraps its actual authority. Failure never publishes the
   provisional context. No public constructor accepts a journal, hash, capture
   flag or arbitrary selector as authorization.
4. Make context revalidation/retained-FD access operate on either genuine owner
   branch. Share the native cohort operation lease across all aliases for that
   live reservation. New-process admission still needs its actual early-host
   owner; a file lock is coordination only. Load existing progress through the
   retained FD; absent progress can create its first draft only after protected
   stage authentication. Loaded intent cannot mint an Add ticket. Continue the
   existing one-row durable draft→intent→single Add→observation machinery.
5. Only the current terminal four-target reauthentication may yield
   `NativeFreshTerminalSelection`. Selection publication and handing the home to
   profiles/workers must remain after that terminal check and actual native host
   admission. Do not expose a recovered root or private representations to disk.

## Failure and crash cases

| Observation | Required outcome |
| --- | --- |
| Marker exists but child missing/unsafe, malformed marker or changed inode | Preserve evidence; refuse adoption and generation. |
| No initial journal | Preserve partial reservation; no factory retry. |
| Journal exists, protected stage absent | Unresolved pre-/unknown-stage-write outcome; no stage Add replay and no new authority. |
| Protected stage unavailable | Retry observation only; never infer absence. |
| Wrong policy/reservation/scope/stage hash, invalid authority or mixed target | Refuse; retain all rows/journals. |
| Matching protected stage, draft progress | Resume exact prepared candidate; next newly durable intent may perform its one Add. |
| Matching protected stage, loaded intent | Observe only; no reissued Add even if target absent. |
| Terminal progress | Independently verify all four current rows and stage before yielding terminal selection. |

## Remaining admission limit

Protected-stage binding establishes the exact staged candidate under the current
explicit group; it does not prove that another entitled process cannot write that
group or that profiles/workers have stopped. Private FD ownership likewise does
not establish all-process custody. The native early-host/process producer and
whole-profile migration/readmission remain separate required integration. This
fresh restart route must neither discard legacy migration nor mark state2 active.

The next source slice should be additive successor copies of home/context reader
interfaces after the live lease/context commit freezes. No current pins, source
files or compiler queue were changed for this inventory.
