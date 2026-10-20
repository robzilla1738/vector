# Local development signing review — v416

**Preparation only. No signing, provisioning, private-key use, product launch or Keychain operation is authorized or performed.** The owner approved “Prepare a local-only review.” The earlier v32 execution approval remains historical.

The review is bound to the copied candidate at `/Users/rcourson/Documents/Vibe/web/out/provided-candidate-v416-review-local/Aux.app`. The matching v416 browser build passed (587 steps,12m06.78s), as did the generated-key probe. Packaging preserved10,803 supplied resources and418 native leaves while omitting the retired independent runtime.

[Exact target summary](review-summary.json) records code/plist hashes, entitlement decisions, inside-out order and all eleven proposed commands. The complete11232-leaf pre-signing inventory is in [the full local review](/Users/rcourson/Documents/Vibe/web/out/development-review-v416/review.json), pinned by the summary SHA-256. This is a review artifact, not an executable signing policy.

## Proposed exception, requiring separate execution approval

- Three Apple Development signatures: copied Aux daemon, CLI SEA and native carrier, using Robert Courson’s available development certificate `47ACA5D1CFADD21CFEDC589B4DEED6E2B7A96D90` (team `9F2JXY8TCK`). Their only shared Keychain group is the existing disposable Aux scope recorded in the summary.
- Eight ad hoc signatures: copied browser, Computer Use helper, Password Importer/provider, CLI wrapper, boundary library and two native guards. Existing role-specific capability decisions are explicit. No recursive/deep signing, original-addon re-signing or immutable runtime/framework replacement is proposed.
- The exact existing public development profile was copied into the three private candidate hosts. Its prior validation is historical; fresh authenticated profile/certificate/device/group validation is required immediately before any separately approved signing. No profile download, creation, device registration or other provisioning is proposed.
- Recheck all preimages, sign only the recorded copied targets, then verify signatures/entitlements and preservation of untargeted leaves. No installation, Developer ID release, upload, timestamp service or notarization is proposed.

Signing approval would **not** approve a browser launch, Keychain test, OS permission or acceptance flag. Those remain held. The new Agent inbox master-key family is explicitly excluded and disabled. The existing disposable home was not read or changed during preparation. This review does not grant password/autofill capabilities or Computer Use OS access.

The copied candidate contains v416. Later source-only importer changes are separate and are not silently included in these preimages.
