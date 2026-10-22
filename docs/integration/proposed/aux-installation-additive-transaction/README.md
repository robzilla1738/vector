# Captured-result additive installation transaction

This is a bounded external, pure state machine bound to the verified four-row candidate. It does **not** execute Security calls, save a journal, modify original rows, initialize/reset an installation or switch an active selector. It is not a Keychain transaction implementation or evidence that the app is ready.

`AdditiveInstallationTransaction.prepare` takes the candidate, explicit four original/target selector bindings, a transaction UUID and complete captured read results. It binds both public keys, channel, original row hashes and prepared payload hashes into a candidate digest. Every original must still match; every target must explicitly report absent. Even an already-present target with identical bytes is a collision at preparation. Failures/invalid captures remain blocked. Target identities must be distinct, Aux-only, and disjoint from every original; these checks do not establish entitlement or authority provenance.

The hash-only journal includes selectors, original/prepared payload hashes, candidate digest, revision, phase, ordered intents/readbacks and a bounded failure reason. It includes no private representation or wrapped-root payload. Encoding is bounded to 16 KiB; strict parsing rejects duplicate names, unknown structural keys, malformed hashes, invalid role ordering and impossible phase shapes. The opaque candidate payloads must be retained separately by the future caller; a journal alone cannot recreate an add request or authorize a replacement.

## Concrete flow

1. Persist the draft checkpoint, then call `intendNext` with its exact asserted durable hash plus fresh original/target captures.
2. Persist the returned **intent** before calling `addRequest`. Only that intent's exact checkpoint hash and matching candidate can expose one `add-only-if-absent` request. Originals are rechecked; verified targets must still match and every unverified target must still be absent. The request permits no overwrite or deletion.
3. A separately reviewed executor would perform exactly one create-only operation. `capturedAddStatus` records the supplied OSStatus; nonzero status, including duplicate, blocks. Success still requires readback.
4. `reconcile` consumes explicit fresh original/target captures. Only a journaled intent can explain a matching new target. Unknown bytes, unjournaled rows, changed/lost originals, lost verified targets, access failures and invalid success values block. A missing target after captured add success blocks rather than being called successful or retried automatically.
5. Once all four target captures match, `verifiedReceipt` requires a final complete original/target recheck and the exact ready checkpoint. It reports captured readback hashes; it does not switch selectors or claim persistence/provenance.

`AssertedDurableCheckpoint` is exactly that: a **caller assertion**, not proof that fsync occurred. `journal.checkpoint()` only computes the expected bytes' hash. The pure API cannot prove capture provenance, ordering of real OS operations, an exclusive writer fence, absence of another writer, or durable storage. A future caller must supply those facts; constructing this value is not authorization.

## Restart and abandonment

After a crash with a durable intent and no recorded result, reload its journal and explicitly reconcile fresh captures. An absent intended target may yield a new intent for create-only retry. A matching intended target is observed as matching; no claim is made that this transaction created or owns it. Unknown data or an unjournaled target blocks. Earlier verified targets may not disappear. Exact bytes are checked again before any further request.

**Blocked is terminal for resume/reconciliation.** A captured nonzero/duplicate add status, missing readback after success, or any other blocked failure cannot reopen when later captures are missing or favorable. Reconciliation throws before inspecting those captures and preserves the failed journal unchanged. Only explicit abandonment remains available; a blocked journal is never an automatic retry/adoption path.

`abandon` preserves the original hashes, target hashes and observed partial cohort, and permanently refuses resume from that abandoned journal. It emits no delete. Here rollback means **continue using untouched originals and quarantine the partial additive target**, not reverse OS operations. There is no active-selection transition to undo. Cleanup of abandoned target items would require a separate reviewed operation and is not provided.

## Required durable/native integration boundary

The missing caller must hold a real stopped/exclusive disposable authority boundary, capture truthful statuses under reviewed original/Aux entitlements, bind selectors to every capture, retain the candidate privately, and store immutable revision checkpoints with exclusive create/CAS, private permissions, same-directory write/rename plus file/directory fsync and restart reconciliation. It must reject stale checkpoints and concurrent changes; an advisory lock or multiple per-row adds is not atomicity. An actual create-only Security executor, independent authenticated target readback, durable selection/rollback protocol and authorized restart tests remain missing. Do not reuse original `installSave`: its delete-before-add behavior violates this model.

## Focused checks

`node docs/integration/proposed/aux-installation-additive-transaction/check.mjs` passed 28 synthetic software assertions: initial absence/access/collision checks, exact checkpoint/refusal, serialized intent restart, crash after simulated add before status, unknown target/changed original, duplicate status, missing readback after success, all-four final receipt and non-destructive abandonment. Both duplicate-status and missing-after-success failures refuse reopening with later absent or exact-matching targets; explicit abandonment of a blocked journal remains possible. Targets are only in-memory dictionaries. Journal byte roundtrip is a parser/restart simulation, **not** a disk durability test. The fixture prepares its candidate from fixed synthetic software keys; no enclave/PQ/addon/Keychain or persistence executor runs.

`verify-transaction.py` checks new source/fixture/dependency pins and absence of Security/filesystem/reset executors. SDK typecheck covers the composed source, including unexecuted hardware branches. Existing recovery/source pins remain unchanged.
