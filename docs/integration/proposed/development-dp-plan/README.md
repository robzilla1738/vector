# Explicit development-layout signing and diagnostic review generator

`vendor/provided/plan-development-dp.mjs` generates review artifacts only. It has no signing, provisioning, Xcode, native host/helper, DP or private-key execution path. Its only subprocesses are static `plutil` and read-only `codesign -d` inspection when a complete package is explicitly supplied. Default ad hoc packaging/signing is unchanged. Existing approved stage, preview and home are not modified or inspected by this generator.

Root subsequently received scoped human authorization to use Xcode for the presented local development provisioning/signing preparation. This generator does not infer execution authority from a Boolean flag: root must bind its final exact plan/preview to that authorization. This lane remains source-only. Actual profile availability and authentication remain required.

## Concrete topology, not a general signing API

Exactly eleven paths are allowed:

- Three development-signed bundles: daemon main SEA, CLI **main SEA** (`aux-cli-sea`), profile-bearing `Aux Native Carrier.app`.
- Eight ad hoc targets: outer `Aux.app`, computer-use app, importer app, importer appex, standalone CLI pre-exec wrapper (`aux-cli`), boundary dylib, daemon guard, CLI guard.

All loose code precedes enclosing bundles; nested importer provider precedes importer/daemon; outer app is last. No original addon, framework, runtime or memory code may be a signing target. Runtime flags and original capability booleans must match current root's exhaustive static policy; only the three fixed development hosts receive reviewed own-Team/AppID/exact shared group values. Unknown entitlement keys, different role bindings, arbitrary target sets, mismatched bundle main or unreviewed browser capabilities refuse generation.

The existing root ad hoc policy helper is reused only for **read-only validation of original observed capabilities**. This module does not call its signing runner or modify its definitions. The development topology is separate: CLI bundle main becomes SEA, wrapper is loose ad hoc code, carrier becomes a bundle. Prospective codesign arguments are emitted as `authorized:false,executed:false`; there is no apply option.

## Inputs and immutable gates

The generator requires an explicit request JSON, a reviewed SHA of the concrete unsigned three-host `preparation.json`, and its exact current boundary receipt. It rehashes all 160 prepared leaves, current boundary sources and four compiled artifacts. A complete unsigned supplied package must contain an exact three-host overlay at `Aux.app/Contents/Resources/aux`; files are checked against preparation pins, including the two distinct original native bindings. Additional embedded profiles are allowed only at the three fixed profile locations and need separate authentication. All package leaves are snapshotted, links must stay inside the copy, hardlinks/nonregular/shared-writable files refuse, and the package is rehashed again before writing a plan.

No full development package exists yet. The concrete three-host preparation lacks outer browser and computer-use app; omitting `packageRoot` therefore produces a **blocked review artifact with zero actual target observations**, while listing the exact eleven-path future topology. It does not fabricate signatures/prehashes for missing hosts. A full plan requires the actual copied package and reviewed browser executable/SHA/flags/capabilities.

For each existing embedded profile, explicit request entries must pin an actual CMS report and compiled CMS helper receipt. The report must match exact embedded bytes, fixed proposal, host role, reviewed device hash, actual helper artifact/source, current validity dates and a trust evaluation within five minutes. These are trusted local root-generated receipts with explicitly reviewed hashes, not a signature over arbitrary third-party JSON. The generator cannot turn caller claims into CMS proof. Root must originate them from the receipt-backed authentication runner. The runner summary now includes authenticated profile validity, evaluated time and a hash of the reviewed device identifier; raw profile/device data is not emitted by this plan.

An output is a new canonical directory outside package/preparation/approved home. `development-review-plan.json` pins the full package snapshot, proposal/preparation/boundary receipt, exact eleven step prehashes when available, exhaustive entitlements and their new output files, current profile reports and prospective nonexecuted commands. Any later signing executor must recheck **all** pins immediately before starting, then allow only selected code and corresponding signature metadata to change, preserve every untargeted leaf, and emit new signed-code/entitlement/profile hashes. This generator does not implement or substitute for that executor.

## Request shape

```json
{
  "preparationPath": "/ABS/concrete-preparation/preparation.json",
  "preparationSha256": "REVIEWED_PREPARATION_HASH",
  "boundaryReceiptPath": "/ABS/provided-native-role-current/native-build-receipt.json",
  "packageRoot": "/ABS/NEW_UNSIGNED_FULL_PACKAGE",
  "output": "/ABS/NEW_REVIEW_OUTPUT",
  "now": "CURRENT_ISO_TIME_WITHIN_60_SECONDS",
  "testMacIdentifier": "ROOT_REVIEWED_ACTUAL_DEVICE_IDENTIFIER",
  "browserReview": {
    "version": 1,
    "executable": "Contents/MacOS/Aux",
    "sha256": "ACTUAL_COPIED_BROWSER_HASH",
    "observedEntitlements": {},
    "signatureFlags": [],
    "entitlements": { "preserveKeys": [], "removeKeys": [] }
  },
  "profileReports": [{
    "role": "daemon",
    "reportPath": "/ABS/ACTUAL_CMS_REPORT.json",
    "reportSha256": "REVIEWED_REPORT_HASH",
    "helperReceiptPath": "/ABS/profile-cms-build-receipt.json",
    "helperReceiptSha256": "REVIEWED_COMPILED_CMS_RECEIPT_HASH"
  }]
}
```

`profileReports` must contain daemon, cli-sea and carrier when their profiles are present; missing profiles/reports remain explicit blockers. The example browser metadata is a shape only, never a review decision. Omit `packageRoot`, `browserReview` and reports for the existing three-host-only preflight. Run `node vendor/provided/plan-development-dp.mjs explicit-request.json`; it does not execute generated commands.

## Diagnostic handoff and remaining seams

The diagnostic section fixes the same approved DBCA home/scope/group and all three exact executable paths. Original status/public/sign can verify common authority; only daemon may initialize, only once after a positively fresh exact-row baseline and a newly approved preview. Existing marker or incomplete creation must verify/refuse, never regenerate to make hosts agree. Current approved home has historical failure state; this generator makes no freshness claim and does not read it.

Still required by root:

1. Opt-in package overlay integration: carrier app, CLI SEA main, fixed paths; preserve default ad hoc topology. Carrier resolver patch from the three-host preparation must be compiled and source-receipt pinned.
2. Actual authenticated profiles embedded before final hashes; Apple provisioning/private group authority remains unproven until OS acceptance.
3. A separate explicit development signing executor with exact snapshot/inside-out guards and post-sign receipt. Current `scripts/sign-provided.mjs` intentionally remains ad hoc-only and rejects this topology.
4. A new exact-scope diagnostic stage/preview and runner bound to signed output hashes. The prior approved preview is immutable and **not reusable** for changed signatures/layout. Its loose carrier path must not silently point elsewhere. Existing helper/group receipts require explicit development-group review; no arbitrary default-group authority is assumed.
5. Actual root-only OS proof with no original Aside group fallback, no new backend/format, no unseen family or biometric/UI grant.

Focused verification in this slice: three pure topology/capability/CMS-joining tests plus existing CMS joining test pass; JS syntax passes. A real **source-only**, subsequently historical preflight rehashed the concrete 160-leaf preparation and actual boundary artifacts; it produced zero target observations and explicit full-package/profile/signing/runtime gates. No native build, signing, Xcode operation, actual profile input or DP call occurred.

Root later opened and saved the v2 provisioning project in Xcode. The recorded preflight happened before that mutation; its historical160-leaf check is not proof that v2 remains unchanged. A future run must use a fresh fully pinned preparation (v3) and will refuse the changed v2 leaves. Root owns the automatic-signing generator correction: placeholder selection `Apple Development` may resolve the Xcode configuration conflict, but never proves leaf identity. The final signing plan still pins certificate SHA1 `47ACA5D1CFADD21CFEDC589B4DEED6E2B7A96D90`; a post-sign receipt must inspect the actual development leaf certificate/Team/group rather than trust Xcode selector text.

The optional explicit request `allowAppleTrustNetwork:true` accepts only correspondingly reported positive revocation verification with networking permitted. Offline remains the default and refuses online reports. The signing executor must carry the same explicit mode and cannot silently switch modes when an offline check fails. This is policy-preserving Apple trust fetching, not an authentication bypass.
