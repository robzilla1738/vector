# Finite renderer draft capture lease v1

This protocol is a data producer in the actual supplied
`assets/draft-storage-ixLojjZ5.js` module. It grants no profile, document, root,
startup, migration, target-write or durability authority. Native owns the real
Profile, enabled extension instance/permissions, WebContents, frame/document,
actual document ID, admitted generation and complete required-frame/worker set.
Native must revalidate those actual owners throughout. No renderer-supplied path,
profile ID, epoch or `writersClosed` argument is accepted.

All methods return plain JSON-compatible objects. The common format is
`aux.ui-draft-capture-lease.v1`. The native caller must preserve the exact
`JSON.stringify` result bytes before conservative parsing; malformed or
normalizing conversion refuses. Draft storage values remain original strings.

| Export | Arguments | Operation |
| --- | --- | --- |
| `auxPrepareDraftMigrationCapture` | Native operation's canonical lowercase request UUID | Inspect actual registered owners, refuse active/unknown work, freeze productive input, synchronously flush latest actual editor/settings state through original writers, retain a preliminary immutable capture and lease. This can perform ordinary source-store writes; it is not safe to replay after a lost result. |
| `auxReadDraftMigrationCapture` | None | Read-only observation of the currently retained lease/result. No freeze, flush, write, new lease or counter increment. Native adopts a recovered result only when its own exact request UUID and actual held document match. |
| `auxValidateDraftMigrationCapture` | Exact lease UUID, original safe-integer revision | Inspect the same real local owners, work, memory and claims. After sealing, also require exact store bytes. It never creates or repairs state. |
| `auxSealDraftMigrationCapture` | Exact lease UUID, original revision | After native has genuinely closed ALL cohort/backend writers, read final actual stores once and retain sealed bytes. It does not flush or write. Repeated seal/read observes the same retained sealed capture; a later byte change refuses. |
| `auxObserveDraftMigrationTarget` | Exact sealed lease UUID, original revision | Read current known-family stores while checking actual held owner/work/memory signatures. Returns `stores:{origin,sessionEntries,localEntries}` only; no mutation intents or target authorization. Native compares exact planned target bytes. Original sealed source baseline remains immutable. |
| `auxReleaseDraftMigrationCapture` | Exact lease UUID | Release only that lease and restore actual editor editability. No timeout/reset/delete/claim-reclaim/credential operation exists. |

A successful prepare returns:

```json
{
  "format": "aux.ui-draft-capture-lease.v1",
  "ok": true,
  "requestId": "opaque-native-operation-uuid",
  "leaseId": "distinct-module-generated-uuid",
  "revision": 1,
  "ownerCount": 2,
  "sealed": false,
  "capture": {"format": "aux.ui-draft-capture.v1"}
}
```

The illustrative UUID strings above are schema labels; actual values must match
`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`.
Revision is an integer from0 through2^53−1; ownerCount is bounded by256. Request
and lease IDs are correlation data, never authentication. The original capture
object includes its exact origin, local/session entries and mutation intents.
Its UTF-8 JSON is bounded by32MiB; original codec record/size bounds also apply.
The retained aggregate owner signatures and memory are separately bounded.

Successful read/seal adds `retained:true` and reports the current `sealed` state.
Successful validation echoes requestId/leaseId/revision/ownerCount, `closed:true`
and `sealed`. Here **closed means only this reviewed renderer producer is held
and unchanged**. It is not backend writer closure, complete-page coverage,
durable persistence, a qualified journal, or permission to activate.

Failure has `ok:false,error`. Read failure with a known retained lease also
returns `retained:true,requestId,leaseId,revision` and its known sealed state;
this allows exact known-lease abort/release, not successful adoption. No lease
returns `retained:false`. A second prepare never replaces a held lease. A wrong
release UUID never unfreezes an existing lease. Restore failure remains failure.

## Native cohort order

1. Inventory and hold every required actual extension frame/document and actual
   worker/backend owner. Unsupported lifecycle, legacy cached modules lacking
   these functions, missing owners, unknown pages or lost permissions refuse.
2. Invoke prepare with a fresh native request UUID on every held document.
   Retain preliminary results explicitly unqualified. A lost reply is unknown;
   observe using read, adopt only an exact requestId in the same native document,
   and never rerun an ambiguous physical flush.
3. Close the actual native DOM/extension/backend writers after all editor flushes.
   File-data queue acknowledgements alone do not prove this closure. Native owns
   those gates; it does not accept a Boolean from this payload as their proof.
4. Invoke seal for every held exact document, retain the final exact bytes and
   require `sealed:true`. This separate read is necessary because later frame
   flushes can legitimately change shared local/session stores after an earlier
   preliminary capture. Resolve real cross-frame shared intents; do not assume
   one renderer's storage snapshot is the sole origin inventory.
5. Strictly validate all sealed leases and actual native owners before/after the
   real backend drain, journal/backup and any later target transaction. A lost
   seal reply is recovered by read; no new flush or target write is inferred.
6. Release exact leases on safe completion/abort under the native controller's
   ownership. A destroyed/changed document, callback timeout or partial restore
   is uncertainty, never absence of productive work.

No test-only JavaScript execution or permission widening is provided. The paired
native lane is evaluating actual own-extension ScriptExecutor permissions with
exact frame/document matching. This producer does not assert that path works.

After native target writes, use target observation rather than source validation
for readback. Source validation remains strict and intentionally fails if target
bytes differ. Target observation does not consult stored-claim inference, since
that key can be intentionally transformed by native CAS; the actual in-memory
claim is still covered by its unchanged memory signature. Any new actual owner,
work, memory edit or attempted renderer write still refuses observation. Native
must retain/route productive storage notifications rather than ignore new work.
No successful observation proves target correctness or permits recovery.
