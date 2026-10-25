# Finite renderer data protocol

These are module exports consumed only by the native controller's exact held document. Arguments are correlation and data, never Profile/path/epoch/native actor authority. Native must verify the authenticated journal and actual restored view correspondence before using them. Ordinary page callers cannot obtain native storage authority from any result.

## Adoption

`auxAdoptDraftMigrationRecovery(leaseId, revision, plan)` requires the same actual sealed, read-only recovery lease and unchanged fresh owner/work/memory inventory. The finite plan is:

```
{
  format: "aux.ui-draft-owner-adoption.v1",
  desired: "source" | "target",
  sourceOwnerStateJson, targetOwnerStateJson,
  sourceMemoryStateJson, targetMemoryStateJson,
  sourceCaptureJson, targetCaptureJson
}
```

Source capture JSON is the original verified opaque JS JSON. Target capture is synthesized from verified native UTF16/raw target facts without lossy string normalization. Both store inventories contain only reviewed families. Native has already selected/held the actual document and observed its desired physical stores; renderer comparison is an additional data check.

Owner records contain `{kind, scope, signatureJson}`. `scope` is captured from the actual owner; rich editor scope is joined through its actual uniquely registered composer/standalone New Tab controller. It is not a user-selected native locator. Captured and current inventories must match these actual facts. Older records without scope refuse rather than guessing correspondence.

Each concrete owner validates current equivalence to the recorded alternatives or its actual pristine physical-store base before returning a setter closure. Newer work counters, active composition/work/claims, differing attachments, ambiguous owners and missing setters refuse. Only after every preflight succeeds are actual setters invoked. Exceptions or asynchronous settlement retain the hold. The same plan is immutable across retry; a different plan cannot rebase the original source.

`auxReadDraftMigrationRecoveryAdoption(leaseId, revision)` returns:

```
{
  format: "aux.ui-draft-owner-adoption.v1", ok,
  pending, complete, retained,
  requestId, leaseId, revision,
  ownerStateJson, memoryStateJson,
  storeUnits: { origin, sessionEntries, localEntries }
}
```

Store keys and values use the existing numeric UTF16 wire representation. `complete` requires actual current owner signatures, actual pending-setter receipts, memory and current desired stores to match; it never means a native write was durable. Errors retain uncertainty and do not release partial adoption. Native uses this dedicated observer after intentional owner changes; the original capture validation baseline remains unchanged.

Source restoration preserves latest unsaved memory. Target retirement is computed from exact observed physical set/removal results. Unknown claim provenance refuses. Existing local acknowledgement must match; no acknowledgement is copied from a payload. Native continues to own all task and claim provenance.

## Closed successor handoff

`auxHandoffDraftMigrationRecovery(oldLeaseId, oldRevision, newRequestId, "utf16-v1")` requires actual completed adoption, the same current registry/work/memory/stores and a new canonical request UUID. The module mints one successor lease ID, captures actual current normal source without flushing, and transfers its actual freeze-restorer custody without calling any restorer or reopening input. The original fresh source and old journal data remain retained separately.

The successor envelope is the existing capture format plus `handoffFormat:"aux.ui-draft-recovery-handoff.v1"`, original request/lease/revision, `retired:true`, `closedHandoff:true`, `sealed:false`, `recoveryReadOnly:false`. It contains the actual normal source, including any preserved unsaved intents. Its guarded persistence path remains suppressed while held. Native must acquire corresponding backend/frontend/namespace/cache successor custody independently before proceeding or releasing anything.

`auxReadDraftMigrationRecoveryHandoff(oldLeaseId, oldRevision, newRequestId, "utf16-v1")` observes the exact retained old-to-successor receipt. A lost result does not mint another ID. Mismatched correlation refuses. Old release cannot unfreeze the successor. Actual successor release can be reported as a past exact release receipt, never current readiness. Termination or missing custody is unknown, never success.

## Internal module helpers

`auxDraftMigrationRecoveryApplying`, `auxDraftRecoveryDraftForScope`, and `auxDraftRecoverySettingsForScope` support only the concrete supplied owner adapters. No generic mutable actor map, arbitrary storage writer or public restore endpoint is added.
