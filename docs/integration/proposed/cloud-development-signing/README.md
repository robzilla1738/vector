# Exact local cloud development signing review

The unsigned cloud integration is packaged separately from the current local UI build. Preparation clones only the new project-owned package, retains the six unchanged accepted helpers and existing profiles, then overlays exactly the newly generated daemon executable, its matching Node development entry and the CLI SEA executable. The current app and owner profiles remain unchanged.

Prepared app: `out/cloud-development-signing-review/Aux.app`. Complete inventory, before/after helper restoration, target entitlements and profile hashes are recorded in `review.json` beside that app. The immutable input cache is SHA256 b39e4b998398864ae0ae49c8a9772af19e85794cbe0c5fd2f016b621e5870814. A failed initial preparation rejected an incorrect generic group assumption; the corrected preparation requires exact equality with the existing approved cache's entitlements and signed executable hashes. It does not broaden the group or create a new profile.

Proposed operations, requiring a new owner exception:

1. Revalidate the existing profiles and the exact prepared inventory; locally development-sign the copied Aux CLI app, retaining its existing seven entitlements, identifier, Apple Development identity and hardened-runtime flag.
2. Sign the copied Aux Daemon app with its corresponding unchanged identity, profile and entitlements.
3. Renew only the enclosing Aux browser's ad hoc resource seal. The six other helpers remain byte-identical and independently verified.

The private-key identity is the existing certificate SHA1 47ACA5D1CFADD21CFEDC589B4DEED6E2B7A96D90, Team9F2JXY8TCK. Timestamping, provisioning, release, notarization, owner-profile access and new OS grants are excluded. Use only the previously approved disposable Aux scope. No product launch, Keychain data operation or signing was performed during preparation.

After approval, execution must pin the completed review's SHA256 and exact full inventory, preserve the original entitlements/profiles/capabilities and verify every nested signature plus the complete allowed signing delta. Integration must retain a clear new signing lineage; it must not relabel old authorization or authority evidence as acceptance of the new cloud bytes. The prepared app is a review location; its reviewed integration destination is the new `out/provided-candidate-cloud-development/Aux.app`, leaving the current local build intact.

Actual startup/sign-in, funded ZDR inference/dictation, sync/attachment recovery and sandbox checkout remain acceptance work. The existence of this review is not runtime proof or permission to sign.

Completed preparation: six unchanged helpers independently verify; profile hashes and entitlements match the approved cache exactly. Unsigned review SHA256 `69cd9eaf9af25c6dd86c950b11f1712fb14e1357f49025ed6c826a9e529f7b96`. Exact three-command signing plan: `out/cloud-development-signing-review/signing-plan.json`, SHA256 `43415d770be82878ab4a5ef0ded4ac525b0f0c8f667246ed652464c42af5d5a9`. New scoped approval requested; no signing or launch has occurred.
