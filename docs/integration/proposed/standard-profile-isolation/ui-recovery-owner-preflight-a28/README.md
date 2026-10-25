# Read-only actual owner preflight before native restoration

Adds only `auxCheckDraftMigrationRecoveryAdoption(leaseId, revision, samePlan)` over A27 commit `64a41fbe3`. It extracts the existing concrete A27 owner, attachment, claim, memory and model/setter-plan predicates into one shared helper. Existing Adopt retains every predicate and its actual desired-store publication requirement.

Check first strictly validates the unchanged sealed fresh renderer source, then runs every actual current owner preflight and discards the returned setter closures without invocation. It does not require the desired source/target stores to have been published. It creates no adoption phase or retained plan, flushes nothing, changes no editor/model/memory/ACK/baseline and grants no native readiness.

Finite success: `{format:"aux.ui-draft-owner-adoption-preflight.v1",ok:true,readOnly:true,retained:true,requestId,leaseId,revision}`. Refusal uses the same correlation where actually held, `ok:false` and an error. There is no complete/closed/durable/activation flag. Native retains its immutable plan and binds each actual document/lease/request/revision; no plan hash or newly asserted actor selector is accepted as authority.

Native must perform this check before physical Restore, retain the real source/editor/cache/worker holds, declare durable original-restore intent and observe physical original bytes. It must then invoke the original actual Adopt and Read, which re-run the concrete predicates and require the now-observed desired stores. A prior Check never licenses overwriting later/newer state.

`source-plan.json` records the exact one-module successor and two counted anchors. Active adapter changes remain root-owned in `adapter-delta-request.json`. `node check.mjs` passed the six unchanged A27 actual-code cases and two focused new boundaries: target preflight before publication makes no setters/storage/baseline changes while real Adopt still refuses unpublished stores; newer actual editor work refuses preflight unchanged. All eight modules replay, reverse, syntax and class checks passed. No native/product execution, signing or readiness claim occurred.
