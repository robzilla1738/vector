# Exact current copied-app local authority workflow

The owner explicitly renewed local-signing authorization after the disconnected-toolbar repair, for the current copied development app and its necessary helpers. This supersedes the current no-signing rule **only for this scope**. No provisioning, release, key reset/new initialization, owner profiles or unrelated OS grants are included. Root owns the app and must finish packaging/stop owned processes before handing it over.

`vendor/provided/current-development-authority.mjs` is a reusable explicit-request CLI. Each mode is separate; importing it performs no signing or runtime operation. It uses the existing strict CMS/profile, exact-byte signing, immutable-leaf, and original shared-authority verifier implementations. The only reusable signing-policy change is an explicit `passwordManagerExcluded:true` topology: exactly **nine** targets (six ad hoc plus daemon/CLI/carrier development signatures). The historical eleven-target topology remains valid when that flag is absent. It never tolerates arbitrary missing targets, and rejects an importer appearing in the current inventory. No original addon/runtime/model leaf is a sign target. The new `verify-existing` diagnostic phase refuses a missing marker and cannot choose initialization or cleanup.

## Root handoff and commands

Root's new package must have used `--development-dp-layout`, giving `daemonRuntime:provided-sea` and `nativeCarrierLayout:profile-bundle`. Existing current path is `/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-browser-pass/Aux.app`; the workflow accepts an explicitly handed-over new copied output under repository `out/`, never a source root. The exact package-report SHA must be computed **after the new package completes**; do not substitute the still-running/older package at the same path.

Write a private `out/...-request.json` containing:

```json
{
  "packageRoot": "/absolute/repository/out/provided-candidate-local-browser-pass",
  "packageReportSha256": "SHA_OF_JUST_COMPLETED_PACKAGE_JSON",
  "packageHandoff": true,
  "localSigningAuthorized": true,
  "scope": "dbca8cbbce80cb5eb3f2f89043330556fdbf2350f3c057a69d6e10e6b3d11476",
  "home": "/private/var/folders/98/j36zgdnd0h507whjl16gxl780000gp/T/aux-provided-dp-approval-mqbKLj",
  "operation": "verify-existing",
  "provisioningAllowed": false,
  "initializeAllowed": false,
  "allowAppleTrustNetwork": true,
  "profileSourcePath": "/absolute/repository/out/provided-candidate-v498-development-local/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/embedded.provisionprofile",
  "profileSha256": "faa4760e2746dcea329ad272390a33d9960c3419bb8b991654a35ac5b7ee1a6d",
  "boundaryReceiptPath": "/absolute/repository/out/provided-native-inbox-v413/native-build-receipt.json",
  "cmsReceiptPath": "/absolute/repository/out/profile-cms-build-v2/profile-cms-build-receipt.json",
  "cmsReceiptSha256": "SHA_OF_THAT_CMS_RECEIPT",
  "diagnosticHelperReceiptPath": "/absolute/repository/out/development-dp-helper-v1/dp-scope-helper-receipt.json",
  "testMacIdentifier": "THE_EXISTING_REVIEWED_PUBLIC_DEVICE_ID",
  "output": "/absolute/repository/out/current-local-authority-v527"
}
```

Use the actual reviewed public device ID from existing private output metadata, not a placeholder or newly provisioned device. `prepare` freshly authenticates the same existing profile for all three roles before app mutation. It embeds those exact three profile copies and eight reviewed diagnostic leaves only; generates no provisioning project and runs no provisioning script. It snapshots current package resources as the concrete preparation, avoiding an unnecessary historical bundle copy. Interrupted preparation is not signed or retried over existing outputs.

```
node vendor/provided/current-development-authority.mjs prepare /absolute/request.json
```

It returns `inputPath,inputSha256`. The signing-plan output must be a fresh **sibling** outside the preparation output, copied app and approved home (the legacy planner deliberately refuses overlapping review/input trees). `plan` request:

```json
{"inputPath":".../inputs.json","inputSha256":"RETURNED_SHA","output":"/absolute/repository/out/current-local-authority-v527-signing-plan"}
```

```
node vendor/provided/current-development-authority.mjs plan /absolute/plan-request.json
```

It returns `executionPath,executionSha256`. `sign` request:

```json
{"inputPath":".../inputs.json","inputSha256":"RETURNED_SHA","executionPath":".../signing-request.json","executionSha256":"RETURNED_SHA"}
```

```
node vendor/provided/current-development-authority.mjs sign /absolute/sign-request.json
```

This is the first private-key operation. It uses the exact current nine-target plan; reauthenticates actual public CMS/device/certificate claims; signs inside out with no `--deep`; checks all target leaf/team/entitlement claims; and proves every untargeted leaf/mode/link unchanged. Failure records partial state and stops. Do not run the old eleven-target preparation/planning helpers against the removed importer topology.

`verify` request:

```json
{"inputPath":".../inputs.json","inputSha256":"RETURNED_SHA","signedReceiptPath":".../signing-receipt.json","signedReceiptSha256":"SHA_OF_SUCCESS_RECEIPT"}
```

```
node vendor/provided/current-development-authority.mjs verify /absolute/verify-request.json
```

This uses the original approved-scope daemon/carrier/CLI diagnostic, reads/signs only the existing exact authority, and refuses to initialize if the old marker is absent/incomplete. It never deletes/resets/creates keys. A successful report requires the same actual public key across all three hosts, correct group, raw-CDP/HTTP-domain signatures and tamper refusal. The separate inbox-key flag remains unset. No product UI is launched.

## Signed launch handoff

`handoff` request includes signed receipt path/SHA, authority report path/SHA, and a fresh external `output` JSON path. It validates the full current signed inventory again, requires successful **verify-existing** three-host proof, and writes the exact launch command/environment for the existing disposable `preview-profile-local-browser-pass`. It does not launch or modify that profile.

```
node vendor/provided/current-development-authority.mjs handoff /absolute/handoff-request.json
```

Root should consume this handoff instead of treating `package.json.signed === false` as final signature status. That package report remains the immutable **historical unsigned assembly input**; the successful signing receipt and its freshly revalidated final inventory are authoritative. Root should also verify owned processes/ports clear, then use the handoff's command/environment while removing its listed diagnostic/inbox variables. No profile suppression/auth flags are introduced. Handoff flags explicitly leave `accountStartupVerified:false,aiRequestVerified:false` until root observes genuine profile resolution, model/provider inventory and an actual authorized AI request.

## Lean verification so far

Fifteen focused pure fixture tests passed across topology/ordering, receipt joining, preservation, failure bookkeeping, verify-only selection and handoff. The existing public CMS profile was freshly authenticated read-only for daemon, CLI and carrier: all signature/device claims match; expiry 2027-10-19. The profile remains byte-identical. The public validation receipt is `public-profile-validation.json`. No current candidate preparation, signing, DP call or product launch has happened in this lane; these require root's package handoff.
