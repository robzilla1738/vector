# Existing-authority migration step caller

This is a concrete **external-only existing-installation caller**, connecting the prepared four-row candidate, exact selector review, captured-result reducer, private durable store and actual create-only Security adapter source. It provides no fresh mode, reset/delete/overwrite, active selector switch, C API, startup entry point or UI integration. The real Security adapter remains unexecuted.

The constructor requires the exact candidate, bindings matching the review digest, durable store, an explicitly selected Security boundary and bounded readback challenge. `ReviewedExistingInstallationSecurityAdapter` is the actual adapter to `ExternalInstallationSecurityExecutor`; tests explicitly select a separate in-memory captured boundary. There is no default real adapter or injected cryptographic-success validator.

## Actual step ordering

- `start` captures original/target rows, runs the existing candidate-bound preparation checks, and persists either draft or terminal blocked state. Missing originals cannot trigger fresh installation.
- `performOneStep` loads/binds the current durable checkpoint. Blocked or abandoned state returns before any Security capture. A draft is converted to a **persisted intent** before an add request can be obtained.
- Every intent is reconciled against fresh captures first. If a previous uncertain add already produced matching bytes, the caller persists observed progress and returns without adding that row again. Lost/unknown/malformed/access-blocked state remains terminal blocked under the reducer's rules.
- Before the one possible add, it obtains the reducer's exact candidate-bound create-only request and checks the current durable head again. A returned status is **persisted before readback**. Nonzero/duplicate status is terminal, even when matching target bytes might later be visible. A throwing add boundary leaves the intent intact and returns `uncertainAdd`; the next explicit call must reload/reconcile.
- After successful status persistence, fresh capture/readback is reconciled and persisted. Each explicit step issues **at most one** create-only row operation. Readback/recovery-only steps can issue none. Filesystem/CAS failures propagate as uncertain work requiring reload; there is no automatic add retry or rebase.

## Authenticated target readback

Once the captured four-row cohort matches the journal and exact candidate hashes, readback does more than compare hashes. It parses target authority metadata; imports the **target** signing/KEM representations against both expected public keys; signs and verifies the continuity challenge; requires an explicit Aux-v2 envelope; and opens it using the recovered P256 or PQ authority implementation. PQ and enclave branches are compile-only and have not run.

The resulting `AuthenticatedInstallationReadback` exposes the two recovered public response shapes and captured receipt, never plaintext DK. `sameRootByVerifiedCandidateLineage` means: preparation authenticated old→new same-DK, current original/target captures match those exact hashes, and the target wrapper now authenticates under the same checked authority. It is not authority provenance, custody, entitlement or runtime acceptance proof. Owned temporary root buffers are cleared; no blanket zeroization of all Swift/CryptoKit copies is claimed. A failed authentication is persisted as terminal `target-authentication-failed`, without private error interpolation.

## Admission and recovery limits

**External admission/custody remains unmet.** The instance `NSLock` serializes only calls on that object. Journal CAS/locking and the immediate pre-add head check are not an atomic fence around Security operations or other browser/helper processes. There is no Boolean parameter that purports to prove all writers stopped or grants authority access. A reviewed caller must establish real custody and runtime authorization before invoking the actual adapter.

**The exact prepared candidate must be supplied again after restart.** The durable journal stores hashes, not private representations or candidate payload. The fixture creates a new caller around the retained in-memory candidate; it does not simulate loss/restoration of that candidate across process termination. Secure durable candidate retention/restoration remains missing. Regenerating a random wrapper is not an equivalent resume input and fails candidate/journal binding.

The current scoped legacy artifacts remove their old group and prefix old logical selectors. The explicit-group Security adapter still requires effective entitlement/group review; raw original-group queries are not equivalent and this caller adds no mapping/default-group fallback. No real capture for those artifacts is claimed.

## Focused verification

`node docs/integration/proposed/aux-existing-installation-step-caller/check.mjs` passed **18 sequencing assertions**, using fixed synthetic software keys, captured/in-memory Security results and **real private disposable journal files**. The captured boundary verifies the durable intent exists before each add and the returned success status is durable before readback. Cases cover normal four-step migration with concrete target cryptographic readback; uncertain add observed by a new caller without duplicate add; terminal duplicate status despite matching data; changed final readback refusal; and missing-original refusal with zero adds. Node independently authenticates the normal target wrapper to the original synthetic root.

`verify-caller.py` checks composed source/fixture/evidence pins and ordering/authentication boundaries. Composed SDK typecheck passed, with the previously documented deprecated UI-fail constant warning from the unchanged Security adapter. No actual Security, Keychain, enclave/PQ, owner state, signing, provider or active-selection operation ran.

Remaining real integration: candidate custody/restoration, all-writer admission, effective original/Aux entitlement binding, approved actual Security execution and authenticated native target acceptance, followed by reviewed durable active selection/restart/rollback. This source caller is useful implementation, not a ready migration command or product readiness claim.
