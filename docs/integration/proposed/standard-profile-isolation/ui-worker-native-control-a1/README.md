# Actual native worker control and lifetime

This slice supplies the native consumer of the canonical Agent worker pause
producer. It adds two new native owners, `ui_storage_migration_worker.{h,cc}`,
without modifying the shared checkout. Root owns projection, registration, GN,
compilation, the paired package and actual app observation.

The helper retains the actual regular Profile, enabled canonical Extension
object, ProcessManager worker/context UUID, serviceworker version/start token,
render process and storage partition. It verifies the actual running script,
scope, first-party storage key and activated lifecycle. Exactly one canonical
worker is required; unknown/extra running canonical-origin workers refuse.
Off-the-record/system profiles, inactive processes and replacement owners refuse.
The outer controller still owns actual admission, profile/epoch binding and every
frame/browser/backend/daemon gate; this helper supplies no such grant.

The lifetime is a direct, checked
`ServiceWorkerContext::StartingExternalRequest(version,kDoesNotTimeout,uuid)`.
It must return `kOk`. Only that owned request is balanced, with checked
`FinishedExternalRequest`, after an exact source release or correlated known
pre-lease refusal. This distinction matters: the standard extensions keepalive
wrapper discards the content result. Its bookkeeping is not proof of a hold.
Likewise `WorkerId::operator==` excludes the start token, so this helper explicitly
checks the token and genuine ProcessManager context UUID as well.

Native EventRouter dispatch restricts browser context, canonical extension and
actual process/thread/version. Replies come through the actual ExtensionFunction
worker metadata; no API argument chooses a profile, partition, worker or path.
The dispatcher supplies the genuine source process and verifies a currently
registered worker; its WorkerId lacks a start token, which the helper rejoins to
the captured native running instance before every reply. Event delivery alone
is not producer completion. The bounded original report bytes are retained as
data, never converted into native identity or a writer-admission certificate.

## Public contract and root registration

The header declares native-only Begin, Read, Validate and Release functions,
`IsUiStorageMigrationWorkerPending`, `HasValidUiStorageMigrationWorkerLease`, and
`AcceptUiStorageMigrationWorkerReply(ExtensionFunction&,requestId,operation,resultJson)`.

The result envelope has `success`, `qualified:false`,
`activationAuthorized:false`, `retained`, `nativeOwnerCurrent`, `sourceHeld`,
`prepareRequestId` and optional bounded `reportJson`/native error. `sourceHeld`
means only last strictly parsed producer state plus current native ownership.
The controller must Validate at each required boundary and join real gates.

Root must register these shared seams together:

1. Add the two source files to the actual native build target.
2. Add native-only EventRouter event
   `auxBrowserPreferences.onUiMigrationWorkerControl`, taking one finite object:
   canonical requestId, operation enum prepare/read/validate/release, optional
   leaseId and safe numeric revision. Native generates all its control arguments.
3. Add `replyUiMigrationWorkerControl` with exactly one finite object containing
   requestId, that operation enum and resultJson (at most65,536 UTF-8 bytes).
   The ExtensionFunction passes `*this` to the helper. It must not accept a caller
   Profile or worker selector and must not create an owner on an unsolicited reply.
4. Register the reply ExtensionFunction, function histogram and the event
   histogram `AUXBROWSERPREFERENCES_ONUIMIGRATIONWORKERCONTROL`. Preserve the
   existing canonical API exposure; no new extension permission is needed.
5. The native migration controller prepares this exact owner before closing the
   frontend gate, validates around its physical barriers, and reopens those gates
   before exact source release. Worker inventory cannot be blanket-allowed.
6. Integrate the paired worker producer follow-up in the background closure
   proposal. Its immutable correlated no-lease report is required for safe-abort
   before a source lease exists; do not stage only one side of that protocol.

`Accept...` returns true only when the exact native RPC transport was consumed,
not when its producer result was successful. Root should return API failure for
an unsolicited/wrong native sender or request. All authority stays native.

## Uncertainty, recovery and cleanup

No timer, callback destruction, missing dispatch or worker termination becomes
closed/not-started. Unknown delivery retains the same worker, owned physical
request and original prepare correlation. Read can observe that same attempt;
it never replays a writer or prepares a successor. A successful held observation
can supersede older control *transport callbacks*, which receive explicit failed
`transportSuperseded` results. It does not call physical jobs completed.

Release is allowed only for the known lease belonging to that original attempt.
Native must reopen its real backend gate first. A lost release response can be
resolved by an exact same-worker read with original request/lease/revision. Only
then is the native owned reference balanced. Release acknowledges resumed work,
not its drain. The finite settled native result is retained so loss of the
consumer's callback after acknowledgment does not force an absence inference.

The only no-lease safe-abort consumes an authenticated matching report from the
reviewed producer branch before assigning a lease, with immutable original
prepare ID, `attemptState:"not-started"`, no lease/revision and no deferred jobs.
It balances only this native external request and returns failed/unqualified,
`noProducerLeaseCreated:true`, `ownExternalRequestRetired:true`. Existing ordinary
callbacks may still be active; neither source nor backend drain is inferred.
Malformed, missing, wrong-attempt and merely undeliverable replies remain pending.

Actual Profile destruction, Extension replacement/unload, ProcessManager/context
shutdown, process exit and serviceworker transition invalidate this owner. They
notify pending callbacks of failure without resetting uncertain source work or
retargeting cleanup. A profile-lifetime failure can remain retained until actual
owner destruction/recovery; it cannot authorize target activation.

## Evidence and limits

`check-source.mjs` pins20 actual native API dependencies and their counted
signatures, confirms exact new-file ownership/absence and source safety hooks,
and emits `source-plan.json` with output hashes. This is a source contract check;
it does not compile or execute Chromium. The paired actual JavaScript producer
has11 focused synthetic cases, including immutable correlated pre-lease refusal.
No product, native serviceworker, profile, helper, credential, provider, OS grant,
signing or release operation was run here.

Actual native object compilation, EventRouter/API registration, controller gate
integration, worker replacement/lost-result behavior and the complete paired app
remain root/organization integration and observation. Full writer coverage and
runtime acceptance remain false.
