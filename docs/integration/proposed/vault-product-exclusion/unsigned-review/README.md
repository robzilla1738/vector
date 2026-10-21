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
