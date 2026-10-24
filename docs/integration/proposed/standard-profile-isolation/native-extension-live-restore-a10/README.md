# A10 — exact-original live extension preference restoration

This slice closes the live rollback gap in the actual LOCAL frontend transaction.
The existing one-shot API stays unchanged. The retained path now keeps the SAME
privately minted LevelDB capture across its own target, observation and source
restoration, including actual backend task lifetime. The original weak owner is
still invalidated by every existing ordinary backend Get/Write operation. A
foreign, destroyed or intervened backend refuses rather than adopting a new owner.

The new native-only virtual operations are consumed through both real quota and
weak-unlimited wrappers, then the actual LeveldbValueStore. The frontend uses
these operations under its existing opaque writer lease. This is not an
unconnected helper or a caller-provided restoration map.

The backend accepts only the exact original six raw records or their fixed,
validated legacy-to-Aux target. Target CAS requires the exact original source.
Only those six keys enter a single WriteBatch; unrelated records remain untouched.
Source restoration recreates exact original JSON bytes and original absence,
including explicit false. Physical sync is followed by exact raw readback. A
fresh read uses an empty synchronous batch and another raw observation, so an
unknown earlier callback cannot masquerade as durable completion.

The first target attempt is latched before physical work and cannot be replayed.
An unknown target/restore requires actual same-token source/target observation;
restoration cannot blindly repeat an unresolved action. A successful restore or
readback exposes native observations, not a whole-profile admission grant.
File-data sync does not claim directory durability or cross-store atomicity.

The actual frontend retains the backend token instead of consuming it during
target commit. It exposes `CopyTargetRecords`, `RestoreAuxUiMigrationLease` and
fresh source/sync observations. Callback failure clears knowledge flags and keeps
the gate; it cannot imply not-started. Target release requires current synced
exact target, no restoration path and no queued old work. A current synced exact
source is a safe local abort: deferred original callbacks can replay only after
that native source state is known. The outer controller must restore/join every
other actual domain before reopening the entire cohort; replay is not drain.

Quota usage is invalidated on every target/restore attempt because even a failed
sync can have applied. Normal UI, styles, ordinary storage behavior and the
original unique-capture methods are preserved.

## Scope and evidence

Ten actual native owners are pinned by before/after hashes and28 counted anchors.
`check.py` verifies exact replay, input preservation and actual frontend/wrapper/
backend consumption and sync/CAS boundaries. It is a source contract check, not
native execution. Root owns projection and actual object compilation; no app,
helper, provider, profile, credential, OS grant, signing or release was used.

This is LIVE original-token restoration. Process-loss recovery is still separate:
the authenticated durable intent must be loaded under freshly rediscovered native
owners/holds, then current raw records must match exact original/target facts.
No raw-record recovery constructor or caller restoration map is introduced here.
The DOM/cache, cross-store journal/recovery and final activation joins remain
required. Runtime acceptance and complete migration readiness remain false.
