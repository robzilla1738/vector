Source-only review; no migration implementation, state inspection, key access, record edits or compatibility relaxation.

The v9→v10 resource hash changes. Current supported Aux v9 homes are intentionally distinct from unsupported legacy/Aside state, but the existing native installation binds its exact policy hash in multiple places:

| Locator within actual native roots | Exact format / relevant binding |
|---|---|
| Control/.aux-first-installation.v1 | aux.first-installation.reservation.v1; home, scope, transactionId; no policy hash |
| Control/<home>/.aux-native-fresh-initial-journal-v2-<transaction>/initial-journal.json | aux.install.native-fresh.initial-journal.v2; policySha256, reservationSha256, scope, target hashes, stagePayloadSha256 |
| Control/<home>/.aux-native-fresh-targets-v2-<transaction>/ | aux.install.native-fresh.targets-journal.v2 and targets.head.v2; policySha256, initialJournalSha256, revision/phase/hash chain |
| Tasks/.aux-task-installation.v1 | aux.native.task-reservation.v1; taskHome, controlScope, controlTransactionId, controlReservationSha256, policySha256 |
| Existing secure-stage row selected by the initial journal | aux.install.native-fresh.secure-stage.v2; exact policySha256 and wrapped target representations; its full bytes hash to stagePayloadSha256 |

Scope itself is the hash of the canonical private home path. Installation target selectors derive from scope and fixed Aux labels, not an arbitrary supplied successor policy hash. Existing unwrap/ciphertext formats do not need branding changes here.

A policySha256 rewrite is not a policy-only migration: changing the initial journal changes its hash, the progress journal binding, and the exact protected secure-stage payload/hash. That would require protected-store writes and a multi-record transaction. None is authorized or implemented.

A preservation-based compatibility design would require an explicitly signed finite v9/v10 lineage tuple, separate historical installation policy identity from current operational policy identity, and validation at each existing journal/TaskLayout/runtime owner check. It must preserve all original journal/target/cipher bytes and authenticate the same actual owner. This is extra compatibility machinery rather than a prerequisite for the requested fresh-install/new-profile completion.

Integrator decision: keep this documentation only and use a fresh explicitly selected successor disposable namespace (integrator/fresh-successor-scope). Existing A38 state and keys remain unchanged. Any new key entry is an explicit user handoff; it does not justify an implicit key reset, ciphertext reinterpretation or historical journal rewrite. Unsupported existing state continues to refuse intact. No source in this selected-owner batch changes policy formats, derivation labels, persisted installation records or migration behavior.
