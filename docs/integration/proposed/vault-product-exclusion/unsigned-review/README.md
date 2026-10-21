# Vault exclusion: concrete unsigned local review

Prepared 2026-10-21. This is a review-only copy of the archived585 daemon, never the running586 daemon. No production staging/scripts, native checkout, accepted startup record, profiles or shared app were modified. Nothing was signed or launched. No Keychain, private key, provisioning or permissions operation occurred.

The full copy is `/Users/rcourson/Documents/Vibe/web/out/vault-exclusion-unsigned-review-20261021/Aux Daemon.app`. **Do not launch it:** original signature metadata remains in place but is invalidated by the modified executable/resource. “Unsigned” here means no new valid signature was applied, not that all historical signature bytes were stripped.

`review-summary.json` pins the exact binary/resource inputs and outputs and the complete143-leaf inventory. Only two leaves change;141 retain exact bytes, modes and link targets. The existing SEA writer was used as in `vendor/provided/daemon-adapter.mjs`; the reconstructed SEA preserves flags, entry path, reserved bytes, every original asset and extension tail. The five source edits remain count-checked against the exact adapted source hash. Source syntax was compiled without evaluation. Full source is saved privately beside the review bundle; it is not committed.

The changed158228480-byte executable SHA-256 is `618af805eaf83f6b7d7d2de1e22a8dfc5e8e2052c291cc8dc712d5c34768ee85`. The203-byte inert skill seed SHA-256 is `09732935b6f0b54ce75c5fbe3956c9f88681c4c5e3362093aed8be96e09ba3f7`. Full review SHA-256 is `981db79f17ed9e3bdb47dfa3719c8d4294dad9b0bbb0173836a128609fe85e38`.

## Minimal prospective authorization scope

One Apple Development target: the copied Aux Daemon.app, using the previously recorded Robert Courson identity and the exact existing disposable Aux Keychain group. Preserve its current seven entitlement keys: application identifier, team identifier, allow-dyld-environment-variables, allow-jit, allow-unsigned-executable-memory, disable-library-validation and keychain-access-groups. No broadened group, capability or identity. Public archived signature metadata was displayed read-only; current private identity availability was not queried.

Do not re-sign the CLI, native carrier, guards, importer, original addons or runtime. All141 unchanged daemon leaves are pinned, including embedded profile and native resources. The runtime outside this copy was neither read for credentials nor modified. No profile creation/download, device registration, release, timestamp service or notarization is proposed. Before any authorized signing, validate the existing embedded profile and signing identity against the exact application/group claims and reject insufficient authority.

After explicit authorization, an integrator would sign only the changed copied daemon, verify its complete inventory and retained nested signatures, then incorporate it into a fresh candidate and refresh that candidate's outer ad hoc resource seal. The outer candidate/native bytes do not exist in this narrow review and must be pinned at that future integration point. No prepared command here executes signing or grants runtime acceptance. Existing signed daemon signatures cannot simply be reused for this payload.

One subsequent authorized disposable launch should check absent builtin Vault catalog, rejected product router endpoints, genuine installation authentication and retained model/provider-settings routes. Paid AI acceptance, owner profiles, actual provider credentials and broad UI retesting are unnecessary for this exclusion. Runtime behavior remains unverified.

To reproduce construction, run `node --experimental-vm-modules materialize.mjs <exact archived585 Aux Daemon.app> <fresh review-output-directory>` from this folder. It refuses an existing output and never executes the extracted source.

## Owner-approved signature completed

The owner subsequently approved scoped local signing of this exact daemon. A fresh copy at `out/vault-exclusion-signed-review-20261021/Aux Daemon.app` was signed once with the existing Robert Courson identity after complete unsigned inventory verification, fresh authenticated Apple provisioning-profile trust/claims/device validation, identity availability and exact seven-entitlement comparison. No other target was signed; unsigned evidence remains unchanged. `signed-summary.json` pins the full external receipt.

The signed executable SHA is `24f8117933a3642c7a22f736b89a5c8adefa7f2ab371f9d63c88755ac2981b7f`. Signing changed only its bytes and `Contents/_CodeSignature/CodeResources`. Complete remaining leaf inventory, original addons/assets, embedded profile and nested signatures are preserved. Strict recursive verification (not recursive signing), exact entitlements and extracted public signing-certificate SHA1 pass. No runtime or Keychain data operation occurred; the approved signing operation used the existing private signing key without reading its material.

The construction script initially had a path-sort mismatch, fixed before any signing. After the one successful signing command, public certificate extraction used incorrect option syntax; corrected extraction and final verification completed without repeating signing. These were bookkeeping failures, not waived validation.

Integration must generate a new staged unsigned daemon from the exact five source edits and seed, then compare its extracted SEA source/asset/seed hashes to the unsigned review. Introduce this already-signed daemon only via a fresh pinned cache/inventory update: retain seven existing other helper proofs; replace daemon signature proof and its changed executable/CodeResources/seed entries with this complete signed inventory. Reconcile the new staged source expectation rather than copying old stage/cache hashes. Rebuild the enclosing candidate resource seal and fresh accepted-startup receipt after full final inventory verification. The root owns this integration and the single approved disposable startup/API check; this lane has performed neither.
