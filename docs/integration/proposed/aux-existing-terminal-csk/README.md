# Existing-installation terminal → CSK handoff consumer

External migration-tool source only; no native runtime producer, registration,
activation, protected read, key generation or compilation was performed here.
This is not fresh installation and it does not replace the existing authority.

The concrete missing pairing was `DurableCapturedCskHandoff` accepting arbitrary
caller `capturedRoot`. `ExistingTerminalCskHandoff` removes that argument. Its
begin/resume calls obtain the root only inside the actual installation command
core's `withCskPublicationRoot` callback (`AUX_ATOMIC_CSK_DISPATCH`). That core
imports the terminal's preserved signing/KEM authorities and explicit Aux-v2 DK
wrapper. The terminal binder has already verified old/new candidate continuity.
The existing CSK authenticator then opens both exact old/new envelopes under that
root, proving the same CSK/owner metadata without modifying randomized prepared
bytes. No private authority/root/CSK is added to journal files or receipts.

The new consumer requires actual current ready installation and selected pointer
HEADs matching the existing-migration terminal, candidate and binding hashes. It
also checks that all four installation target selectors and the credential target
belong to the exact reviewed historical disposable Aux scope/group. This is an
explicit bounded compatibility subset, not arbitrary user-profile support.
A wrapper rechecks those actual HEADs before/after every captured credential
callback and around each handoff step. Selection/rollback/error races refuse;
post-Add failure remains unknown through the existing durable intent. The wrapper
never re-arms Add, changes old rows, chooses a new authority, changes selection,
deletes evidence or emits state2 admission. Loaded CSK handoffs remain
observation-only, even a draft or missing target.

These are ordinary source consumers, not authority provenance. The captured
terminal's false provenance/admission flags are unchanged. Head checks and private
cooperative journal locks do not fence uncooperating writers or make an Add and
selection publication atomic. Content-manifest descriptors do not prove profile
migration. The caller must still supply an actually authorized existing source
capture/selector boundary and real stopped-cohort/native admission.

## Exact next native prerequisite

The current external `CapturedHistoricalAuxCredentialBinding` uses a fixed Aux
scope/group and a reviewed old suffix candidate. The historical interposer
actually prefixes service/account and removes the original access group. The
current clean explicit-group executor is not a source-proven substitute for that
removed-group read. The smallest missing producer is an isolated authenticated
existing-Aux migration host route that binds the actual approved historical home,
actual signed host/default-group entitlements and exact old physical query; it
must return typed four-row/credential observations, distinguish unavailable from
missing, and retain genuine native pre-profile/process custody. It must not
query the owner's reference-product state, guess old groups, reuse fresh-home
absence, or load the original interposer into the clean delivered runtime.

Once that producer exists, the existing candidate archive/recovery → additive
four-row coordinator → selected terminal can feed this consumer. Original rows,
archives, partial revisions and old selection remain preserved for explicit
rollback. Account sync recovery is separate; Vault is still excluded.

`typecheck.mjs` prepares only public generated Swift source then typechecks actual
separate files. It is intentionally not queued, per the current scoped task.
The original crypto/CSK/transaction fixtures are unchanged and not repeated.
