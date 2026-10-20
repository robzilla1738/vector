# Conditional local Apple Development DP signing proposal

Historical proposal and scoped authentication evidence. Current development is local UI/behavior fidelity; the owner removed signing and provisioning from that work. Do not resume the actions or approval requests below. See [current status](../../../STATUS.md) and the workspace rules.

Status: **proposal only, not ready for signing approval**. Root's authorized read-only identity inspection found one valid Apple Development identity and no Developer ID Application identity. This assessment reads only that public fingerprint/team metadata and static copied implementation inputs. It invokes no signing tool mutation, private key, profile inspection/creation, native command, DP query, grant or developer service.

`proposal.json` contains concrete own-team identities, exact existing disposable home/scope, proposed first shared group, three actual DP callers and their currently available input hashes. It is deliberately **not** an executable policy for the existing ad hoc signer: it has no signing targets field, and all new authorities are explicitly false. Original supplied cryptography, wrapped formats, derivation labels and mapped `aux.<homeSHA>.<original logical key>` selectors remain unchanged.

## What is supported by source, and what is missing

Apple documents that DP Keychain access-group entitlement claims need provisioning authorization. Apple Development is a plausible local testing identity only when matching valid development profiles actually authorize the claims; the certificate alone establishes no group membership. Root subsequently inventoried13 local public provisioning files read-only and found **zero** usable unexpired certificate/team matches and zero Aux daemon/CLI/carrier group candidates. No profile was created, installed or modified. The private metadata report hash is recorded in proposal.json without copying other apps' profile contents. Their CMS authorization, certificate membership, TeamIdentifier, AppIdentifierPrefix, exact AppID or authorized wildcard, allowed group, expiry, macOS platform and actual test-Mac eligibility must all be checked and pinned before presenting a concrete signing action. No wildcard group is proposed in the executable entitlements. [Apple TN3137](https://developer.apple.com/documentation/technotes/tn3137-on-mac-keychains), [Apple TN3125](https://developer.apple.com/documentation/technotes/tn3125-inside-code-signing-provisioning-profiles).

A profile belongs at Contents/embedded.provisionprofile in a matching app-like bundle. Standalone executables need that structure to claim profile-authorized entitlements. The current loose carrier is therefore not ready for this path. The CLI SEA is also currently a sibling of the declared main wrapper, so its profile association must be resolved explicitly rather than assuming the wrapper's profile authorizes another process image. [Apple: signing a daemon with a restricted entitlement](https://developer.apple.com/documentation/xcode/signing-a-daemon-with-a-restricted-entitlement).

No documented certificate-only shortcut or static proof of current runtime authority was found. If profiles cannot validly authorize the exact claims, this conditional path remains blocked; the ad hoc missing-entitlement result is not solved by placing arbitrary own-team strings in an entitlement plist.

## Concrete packaging and signing proposal for review

Three actual DP process images need the same first/only explicit own-team Aux access group, scoped to the already approved disposable installation. Each uses its own exact application identifier. The interposer continues removing the original Aside group, so the OS selects the proposed shared default group while the existing selector mapping confines the rows. Worker threads use their host process identity; they do not obtain a separate group.

1. **Daemon:** existing Aux Daemon.app already declares aux-daemon as its main executable. Embed its validated development profile and sign only the copied host with the proposed own-team claims plus the original three runtime capabilities and reviewed DYLD exception.
2. **CLI SEA:** proposed minimal layout changes CFBundleExecutable to aux-cli-sea, making the actual supplied process image the profile-bearing main. Keep aux-cli as the fixed sibling pre-exec wrapper and sign that wrapper separately without DP claims. The normal direct CLI entry remains the wrapper; launching the SEA without its boundary must continue to refuse. This changes the present explicit signing plan: the CLI bundle operation signs SEA, and the separate loose-code target is the wrapper. Root must review bundle association and launcher behavior before adopting it.
3. **Carrier:** wrap the same compiled carrier in native/Aux Native Carrier.app/Contents/MacOS/aux-native-carrier with exact Aux Info.plist and validated embedded profile. Update only fixed browser carrier resolution and explicit signing target to that bundle. Preserve the current carrier runtime-flag choice; do not opportunistically enable other capabilities. The boundary dylib and original binding paths remain fixed and checked. This is a necessary packaging/native-path proposal, not a shared source edit already applied.

The proposed group and claims are exact in proposal.json; they use the actual inspected team rather than the original supplied team. The profile's prefix must match this reviewed team-based plan; an unexpected legacy prefix requires another review, not silent substitution. No get-task-allow, application group, automation, biometric or other capability is added for these probes. A development profile may permit more than the app claims; that does not authorize claiming extra capabilities.

All other explicit package targets keep their separate reviewed policy. Do not developer-sign or re-sign original provided-native.node, frameworks, agent/runtime/memory payloads, or unrelated importer/helper code as a side effect. Their byte hashes and signatures remain preserved. No recursive/deep signing, release, notarization or Developer ID operation is proposed.

## Approval and proof order

Current permission covers only read-only identity inspection. Before any private-key signing, profile changes or new DP operation, root must complete actual profile availability/authorization review under appropriate permission, final package/path integration and exact copied input pins, then present the complete concrete action for explicit approval. The existing ad hoc signer is intentionally unchanged and rejects restricted-identity additions; this document is not an alternate execution channel.

After any later authorized signing, verify actual own-team code identity, original runtime capabilities, exact entitlements and embedded profile association statically before a bounded approved probe. The probe still needs to demonstrate real OS-accepted shared authority across daemon/CLI/carrier and exact-scope mutation/cleanup. Do not initialize again merely to test host symmetry; the currently attempted scope and marker require root's existing explicit diagnosis/cleanup handling first. Never fall back to the original Aside group, file Keychain, PEM authority, a different format or fabricated success.

The final native build succeeding and a public signing certificate being present are useful prerequisites. Neither establishes DP authority or authorizes signing.

## Concrete owner decision still required

There is no usable local profile to execute this proposal today. A viable next path would require the owner to authorize local Apple Development signing and creation/retrieval of matching macOS development profiles for the three exact Aux AppIDs/shared group, using the inspected identity/team and this test Mac. Such authorization would change the current no-developer-signing/no-provisioning constraints; none is inferred here. The request must disclose Apple developer service access and profile/device registration if required, private-key use for the exact copied hosts, and a later bounded same-scope DP proof. Root must review the actual returned profile authorization and final source/artifact pins before signing, and must keep the scope/crypto/isolation unchanged. This is not permission to publish, release, notarize, read other Keychain rows or grant biometrics/TCC.

## Implemented opt-in preparation (no signing execution path)

`vendor/provided/prepare-development-dp.mjs` now implements the bounded preparation. It never invokes codesign, security, xcodebuild, a product/native executable, network or DP. The existing ad hoc packaging/signing code is unchanged.

Project-only generation is available now:

```sh
node vendor/provided/prepare-development-dp.mjs --project-only /ABS/NEW_REVIEW_DIRECTORY
```

Actual project-only preparation succeeded in the lane's out/development-dp-project-review-v4. Its exact generated project, three shared build-only schemes, three entitlement plists and clearly labeled placeholder C source are checked in under project-inputs for review. Project/entitlement/scheme XML parses, and the pbxproj passes plutil lint. **Do not open/build this project in Xcode until provisioning use is authorized.** No Xcode command was run. preparation.json and committed project-preparation-evidence.json enumerate exact prospective locked-wrapper xcodebuild argv for each role, including the isolated future derived-data path and provisioning/device-registration switches; every action is marked unauthorized/unexecuted. CODE_SIGNING_ALLOWED=NO in every configuration, automatic base-entitlement injection is disabled, debug-dylib generation is disabled, and the selected certificate fingerprint is explicit. The placeholder targets exist solely to obtain matching profile assets later; they are never product/runtime substitutes or functional evidence.

Full three-host copy preparation requires a fresh source-matching boundary receipt after the CLI role fix:

```sh
node vendor/provided/prepare-development-dp.mjs \
  /ABS/COPIED_AUX_RESOURCES \
  /ABS/CURRENT_BOUNDARY_RECEIPT.json \
  /ABS/NEW_UNSIGNED_PREPARATION
```

This copies only daemon/CLI static bundles and current boundary artifacts into a new private output; removes no source inputs; rejects unexpected links/objects/hash drift; preserves the daemonbfe/CLI6638 original addons; adds the fixed current role loader/guard; sets CLI SEA as main with a separate unchanged wrapper; and creates the carrier app-like bundle. It emits complete output file hashes, initial copy provenance, exact Info.plist change hashes, three host/entitlement/profile paths and explicit **unauthorized** prospective signing argv. No profile is fabricated or embedded, and no signing is performed. Existing originals' signature bytes remain present where copied; “unsigned preparation” means no fresh signature/authority is claimed, not that immutable signatures were stripped.

The new pure decoded-profile gate checks own-team/prefix/platform, exact allowed AppID/group (including a profile's legitimate trailing wildcard), certificate membership, current dates and actual development Mac membership. It explicitly returns CMS-unverified/signing-unauthorized; decoding metadata alone does not authenticate a profile. Root must authenticate and pin actual CMS/profile bytes and recheck the requested entitlement subset before any later signing action. Missing profiles therefore remain a real blocker. Two focused tests exercise metadata refusal and the actual three-target disabled-signing project structure; no native compilation/signing/DP test is smuggled into them.

`integration-hooks.json` enumerates every active package/signer/runner/manifest seam with current root source hashes and exact anchor counts. `carrier-profile-bundle.patch` changes only the fixed native caller path against a pinned v26 pre-apply snapshot; root must check the actual live baseline and explicitly adopt this topology. Neither that patch nor any root/shared edit is applied. The current ad hoc target list and its entitlement rejection remain unchanged, as required.

### Exact later action boundary to present for owner review

Provisioning would request the three exact Aux AppIDs and one exact own-team scope group in proposal.json, for the existing certificate and this test Mac. Later authorized Xcode use may register that Mac/AppIDs, retrieve/create profiles, write the local Xcode profile cache, and use the selected signing key to sign **three temporary provisioning placeholder products**. It must not create another signing identity or touch other profiles. The three actual copied supplied process hosts would then require their own explicit development signing actions shown in preparation.json; wrapper/guard/original addons/runtime remain outside that private-key signing set. These are distinct effects that the owner must see; permission to inspect identities is insufficient.

The bounded later Xcode commands would select each of daemon, cli-sea and carrier shared schemes, Development configuration and the local macOS destination, explicitly override CODE_SIGNING_ALLOWED=YES, and opt into allowProvisioningUpdates/allowProvisioningDeviceRegistration **only after approval**. All such builds must use scripts/native-build.py and the shared lock. This preparation intentionally contains no script that runs those commands. Any key-access/OS prompt must be handled by the owner, never automatically granted. Actual returned profiles, final copied hashes and signed entitlements need review before the bounded same-scope DP proof; no reinitialization of the attempted authority is automatic.

## Actual fresh-input unsigned preparation completed

Full preparation subsequently succeeded using refreshed root out/provided-reuse/apps and the source-matching role-aware boundary receipt SHA27d1b37434d2ca0bdb3d1bf19cf3f1330a817fe143d8d6dc54d297c1d16cc6a6. The private output is lane/out/development-dp-unsigned-role-current-v2. All160 leaf hashes were independently rechecked; original daemonbfe and CLI6638 addons remain exact. Each bundle plist matches the intended AppID/main; the CLI wrapper remains separately pinned, and carrier bundle/path topology is explicit. No historical packaged-v24 candidate was reused.

unsigned-preparation-evidence.json pins the full private preparation report and generator, copied input origin, original addon hashes, concrete host/profile/entitlement paths, exact prospective provisioning/signing argv, and limits. This is a complete reviewable three-host unsigned preparation, not the full browser product. No embedded profiles exist, no Xcode/build/signing/private-key/native/DP operation was run, and root's native caller/source hooks remain unapplied. The actual root registration proofs are separate evidence owned by root; this preparation does not claim DP authority from them.
