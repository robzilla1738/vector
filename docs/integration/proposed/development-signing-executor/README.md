# Exact development signing executor — source-only delivery

`vendor/provided/execute-development-signing.mjs` is a separate executor for the eleven fixed development-layout targets. Default is **verify-only**, performing static copied-file/signature inspection and writing an unsigned-operation receipt, with no signing or CMS helper execution. `mode:"sign"` is the sole opt-in signing mode. Root owns actual execution under the already presented human scope; this module does not add an approval conversation, provision, discover profiles, run Xcode, launch product code, perform DP commands, or alter the previous approval stage/home.

This lane implemented and tested source only. No execution against actual package/signing identity/profile occurred. The Team is never hardcoded: it comes from the exact pinned current proposal. Root's corrected public certificate OU/Team `9F2JXY8TCK` therefore applies after integration, while the SHA1 remains `47ACA5D1CFADD21CFEDC589B4DEED6E2B7A96D90`. Historical CN-parenthetical Team assumptions are not authority.

## Gates and operation

- Exact reviewed plan SHA, current fixed proposal hash, complete full-package inventory, exactly8 ad hoc +3 development paths/order, distinct original native role hashes, bundle mains/IDs, original capability/flag observations, and eleven pinned XML entitlement artifacts must match. There are no caller-supplied arbitrary target paths or signing argv. Commands are reconstructed from the fixed topology and exact certificate fingerprint. Source/package overlap and hardlinks/unsafe paths refuse.
- All original addon signatures are statically verified without changing bytes. Every target prehash/observed signature is checked before effects. Full package and loaded-source hashes are rechecked before each command. Newly signed code/signature metadata are tracked between steps; all untargeted leaves, including profiles, original addons, framework/runtime/memory and package metadata, must remain byte-for-byte unchanged.
- Sign mode freshly authenticates **all3** actual embedded CMS profiles before any signing. The exact helper receipt must match the plan's pin/current sources/artifact. Proofs older than60seconds are refreshed, the development target is authenticated immediately before its private-key signature, and all development profiles are checked again afterward/finally. Current authenticated validity/device/AppID/team/group/certificate gates apply. `allowAppleTrustNetwork` must be an explicit Boolean matching the plan; offline remains default and never silently retries online. The explicit online mode retains required positive revocation and Apple provisioning policy.
- Inside-out signing uses only `/usr/bin/codesign`, fixed `--timestamp=none`, preserved runtime flag and pinned entitlements, with8 ad hoc identities `-` and3 exact development fingerprint identities. No recursive/deep signing, automatic identity selection, release/notarization or generic X.509 fallback exists.
- Each result must pass strict all-architecture signature verification; exact final capabilities/runtime/adhoc mode and Team are checked. For development code, codesign extracts its **actual embedded public leaf certificate** into a new private temporary directory. Node X509 parsing checks exact leaf SHA1 and subject OU; both must match the pinned certificate/own Team, together with codesign's TeamIdentifier. Profile bytes must remain unchanged.
- After enclosing bundles seal, every inner/outer signature is verified again, the final full snapshot is rehashed, and target/profile hashes must match the corresponding proof. The complete receipt records source pins, initial/final snapshots, every target proof, certificate hash/Team (no subject name), CMS proofs, allowed deltas and untargeted preservation. It still sets `productionReady:false,dpExecuted:false,productLaunched:false`.

No Keychain enumeration/private-key export is implemented. Actual codesign in root's later sign mode necessarily requests the explicitly approved signing private key; the code does not inspect or log it. CMS/codesign raw failure output is not logged. Temporary extracted public certificates are removed. Static code-signature inspection does not execute original native code.

## Partial failures

Before each signing command, a private0600 receipt checkpoint is fsynced with the current attempted target. Each verified target adds its actual proof. First failure stops further signing; no rollback, automatic restart or deletion of the copied package occurs. A failure after any attempt returns `status:"failed-after-signing-attempt",signed:null,packageMayBePartiallySigned:true,unsignedClaimMade:false`. It includes attempted versus verified steps, sanitized exit/error metadata, final inventory when readable and preservation outcome. A command may modify code before returning an error, so attempted is intentionally conservative. A final verification failure also refuses success.

Power loss, forced termination or receipt I/O failure may leave the last in-progress checkpoint rather than a complete result. Such a copy is **unverified/potentially partial**. Never infer unsigned or resume from it; a fresh exact plan/prehash inspection is necessary. The input `package.json` remains preserved historical assembly metadata and may still say `signed:false`; only a success signing receipt is authoritative. This executor does not silently update packaging metadata after outer sealing.

## Root-only explicit request

```json
{
  "planPath": "/ABS/REVIEW/development-review-plan.json",
  "planSha256": "REVIEWED_EXACT_PLAN_SHA256",
  "receiptPath": "/ABS/NEW-development-signing-receipt.json",
  "mode": "verify-only",
  "allowAppleTrustNetwork": true,
  "testMacIdentifier": "ROOT_REVIEWED_ACTUAL_DEVICE_IDENTIFIER",
  "cmsInputs": [
    {"role":"daemon","receiptPath":"/ABS/profile-cms-build-receipt.json","receiptSha256":"PLAN_PINNED_HELPER_RECEIPT"},
    {"role":"cli-sea","receiptPath":"/ABS/profile-cms-build-receipt.json","receiptSha256":"PLAN_PINNED_HELPER_RECEIPT"},
    {"role":"carrier","receiptPath":"/ABS/profile-cms-build-receipt.json","receiptSha256":"PLAN_PINNED_HELPER_RECEIPT"}
  ]
}
```

`node vendor/provided/execute-development-signing.mjs explicit-request.json` runs the default read-only path unless `mode` is explicitly `sign`. The new receipt must be outside package/approved home; existing files refuse. Root may use sign mode only for its actual copied package within the scoped human authorization. No agent sign execution is included in this delivery.

## Consumer API

`verifySignedDevelopmentReceipt({receiptPath,receiptSha256})` performs **filesystem-only** validation of an explicitly reviewed success receipt: exact success/mode, fixed plan/proposal/source pins, current full final inventory, all11 target/certificate/capability/profile proofs, and permitted signature-only deltas. It returns the receipt and never executes hosts, native helpers, CMS or signing. Signature/CMS proofs originate in the pinned root-generated executor receipt; it is not a cryptographic authentication of arbitrary JSON. A diagnostic preparer must also perform its separately required fresh CMS/exact-scope checks and bind the actual signed receipt/artifacts to the new approved preview.

Success receipt shape includes `implementation:"exact-development-signing",status:"signed-and-verified",mode:"sign",planPath,planSha256,proposalSha256,packageRoot,sources,expectedDevelopmentLeafSha1,expectedTeam,expectedGroup,allowAppleTrustNetwork,finalInventory,finalSnapshotSha256,finalProofs,cmsProofs,changes,untargetedLeavesPreserved:true,signed:true`. Source-only diagnostic work can import the above consumer rather than trusting `signed:true` alone.

Remaining integration: root must assemble the complete corrected development overlay and actual CMS-authenticated profiles; exercise the executor on that disposable copy; inspect signed receipts; and create a separate development diagnostic preview using current compiled carrier/helper/group boundaries. Signing success alone cannot establish DP shared-group authority, original native behavior or runtime acceptance.

## Focused verification

Four new tests exercise partial-failure stop/attempt bookkeeping, allowed signature deltas versus original/profile/resource/mode changes, exact leaf/Team/capability/signer mismatches, and small disposable snapshot/hardlink refusal. Together with four existing trust-mode/planner checks, eight tests pass. They use authored callbacks/fixtures only; none invokes codesign, CMS, native binding, profile discovery, Xcode, build or DP operations. JS syntax passes. Actual sign-mode behavior remains unexecuted by this lane.
