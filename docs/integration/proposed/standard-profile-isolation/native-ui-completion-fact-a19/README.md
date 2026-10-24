# One-shot native UI transaction completion and actual owner acknowledgment

After every actual backend target, cache publication and renderer current-store
join succeeds, the real controller writes a final aggregate kind8 record. It
contains all native target/cache facts and actual current renderer-unit hashes.
Its exact ordinal, payload SHA, receipt and readback must be complete before any
completion fact can be minted. A failed record creation cannot substitute an
earlier per-domain kind8 receipt.

The actual live flow takes its move-only opaque completion once, calls the real
selected-home `AcceptNativeSelectedUiMigrationCompletion`, and retains the SAME
fact if that read/owner result is missing. The fact carries only a fixed frame10
for the original terminal ordinal, its exact expected reply and a fingerprint
binding the terminal, capture, intent, actual profile epochs and native generation.
It has a weak actual-controller current check. Destruction/absence opens nothing.

Only the selected-home owner can construct the separate move-only typed ACK,
after checking its actual selected owner/roots/generation/pulse/child before and
after the existing authenticated exchange and exact terminal reply match. Root's
owner implementation supplies that call. No JSON readiness Boolean, generic
publisher or per-profile preference stands in for this native acknowledgment.

The controller consumes a matching ACK only once and then repeats actual worker,
editor/current UTF16 stores, frontend and every DOM/cache readback. Cleanup is
fenced again by the same current owner ACK. A subsequent rollback invalidates
the target fact/ACK and requires actual original-source proofs and records. It
cannot reinterpret an earlier target terminal record as current source success.

This acknowledges a real current UI transaction only. It does not select an
installation, change stateIdentityVersion, admit COLD, alter cryptographic state
or claim full installation migration. Qualification/activation JSON remains
false. Fresh-process discovery and reconciliation are separate required paths.

The header has no full Profile/UI dependency. Native method bodies and the real
callsite live in the actual controller. Root registers the new header and pairs
its selected-home owner implementation. Exact counted overlays and source hashes
are in source-plan.json; source replay is not native execution/acceptance.
