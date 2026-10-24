# Exact original frontend Begin observation

The actual controller now creates and retains a native request nonce before
beginning backend work. The frontend's original State records that nonce before
posting its capture and retains the SAME shared private backend capture before
invoking the consumer callback. Losing that callback no longer destroys custody.
The old native Begin overload remains compatible and generates its own nonce.

`ObserveAuxUiMigrationLease(originalNonce)` is a read-only native observation. It
returns actual preparing state, a handle sharing the same original State/backend
token, or the exact pre-target gate-aborted observation recorded by this same
frontend instance. Unknown nonces, owner loss and absence return an error; no
new capture, flush, writer or replacement token is created. A target-attempted
state is factual data and cannot be used by this preliminary controller as a
pre-target cleanup shortcut.

The controller pairs its lost-Begin retry with this observation. It preserves
pending/unknown state until actual original custody or an exact abort is known,
then uses the existing actual gate release before productive renderer/worker
restore. Overall capture remains unqualified and target flow remains disabled.

Retired requests are bounded at64, and retired Begin requests cannot be reused to
recreate a hold. The past abort record proves only that this original pre-target
gate was retired, never ordinary callback drain, current actor readiness or
cross-store success. Queued original work retains its original ordering and real
completion semantics. Profile death/unknown identity cannot become absence-as-abort.

Three owners, sixteen counted anchors and exact prior A10/A11b output hashes are
recorded. Source replay is not native execution or compilation. Root owns the
actual three-owner compile and paired app verification. No UI/CSS, signing,
release, owner-state, provider or OS permission action was performed here.
