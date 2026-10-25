# Closed Local/Session recovery handoff

This six-file successor pairs the privileged Local/Session control interfaces with the frozen native API:

```cpp
void HandoffAuxUiMigrationRecovery(AuxUiMigrationLease&, AuxUiLeaseCallback);
void ReadAuxUiMigrationHandoff(AuxUiMigrationLease&, AuxUiLeaseCallback);
```

The integrator owns that actual AsyncDB/native/renderer-cohort producer. It must mint and retain one successor State/token under the existing gate, preserve the immutable predecessor, and return duplicate private handles only to that same fully joined successor. These service sources must be compiled with that concrete producer; the frozen API declaration alone is not completion evidence.

`HandoffAuxUiPreferenceRecovery(originalRequest, originalToken, newNativeRequest)` calls that genuine producer once. The native-controller nonce is correlation only. The service retains the original opaque lease separately, adopts the actual successor lease and increments its lease generation before returning. The real service/backend owner remains unchanged. There is no Release, Begin, queue replay, root/Profile selector or readiness argument.

An original-request `ReadAuxUiPreferenceLease` uses `ReadAuxUiMigrationHandoff` while unresolved. That native observation can recover a lost completion by returning the same retained successor; it cannot create another transfer or retry a write. Once adopted, old-request reads are annotated actual successor readbacks. Repeating the original Handoff with identical correlation performs that same observation; a different nonce/token refuses. A pending/failed/partially joined handoff blocks mutation and Release. Unknown or missing owners stay held/unknown. Historical receipts are not current readiness or proof of release.

The append-only reply fields identify pending/successful handoff and the exact original request/token and successor request. `reply.request_id/token` continue to describe the actual returned lease. Existing ordinals and metadata/source/target/action/allocation fields remain intact.

Session namespace receivers remain frozen under their original native freeze key, held separately from the new lease request. Both sides preflight the exact retained namespace inventory; no Resume is issued at handoff. Only the eventual real release uses that original key, with the existing native same-task rehold-on-failure behavior. A changed namespace join keeps the new physical successor held and refuses ordinary mutation/release.

`source-plan.json` records six exact predecessor inputs and28 counted anchors, including the A27/A28 fields not yet present in the frozen native tree. `before/`, `native.patch`, and the single fresh-directory replay receipt preserve reviewability. Root owns Mojo generation, matching producer projection and actual relative-path compilation. No product/native execution, compilation, signing or owner-data access occurred here. This proposal and the independently delivered frontend A31/A31b do not replace cross-store controller/JS adoption acceptance.
