# One disposable Data Protection scope: approval runbook

Status: compiled and signed preparation is ready; awaiting explicit human approval. The exact-scope helper compiled successfully and its signature verified. The version-2 preview pins the helper receipt and both signed actual SEA hosts. No original installation, signing, Vault, PDF or Keychain command has run.

This uses the original native binding and macOS Data Protection Keychain semantics. A disposable HOME isolates application metadata and supplies a hashed item namespace; it does **not** create a separate Keychain database. The actual default/shared entitlement group of the ad hoc hosts is unknown. Original Aside access-group selectors are removed, unknown selectors refuse, and there is no fallback to the original group, file Keychain, search-list change, enumeration, biometric prompt or OS grant.

## Exact requested scope

Canonical home: `/private/var/folders/98/j36zgdnd0h507whjl16gxl780000gp/T/aux-provided-dp-approval-mqbKLj` (current user, mode0700, empty when prepared).

Scope: `dbca8cbbce80cb5eb3f2f89043330556fdbf2350f3c057a69d6e10e6b3d11476`.

The installation uses four generic-password rows. Their service is `aux.<scope>.aside.install`; their respective accounts are `aux.<scope>.aside.install.meta`, `aux.<scope>.aside.install.sig`, `aux.<scope>.aside.install.kem` and `aux.<scope>.aside.dk`. Queries retain Data Protection=true and interaction-fail behavior. Metadata inspection returns OSStatus and access-group hashes only, never stored data.

The approval may cover later disposable Vault/20-task tests in this **same** home and scope, using only source-known logical key families: `aside.pwm.session_<nativeSlot>`, `aux.pwm.auth_<PWM-account-UUID>`, `aux.csk_<accountId>`, and explicitly registered local-fixture `mcp:index:<accountId>` / `mcp:<accountId>:<serverId>`. The boundary adds the fixed Aux scope to actual selectors. IDs must come from this home's registries; MCP fixture IDs must additionally be listed in its private `.aux-dp-test-keys.json`. These names are identifiers, not credential values. The actual supplied MCP query carries its exact original access group, which the existing mapper removes while scoping service/account. The ungrouped unknown-prefix query remains refused. Static source evidence and an uncompiled fixture-only proposal are in ../mcp-query-evidence; no production mapper expansion is needed. Channels, biometrics, unknown families and any other home/scope require further review.

## What the approved installation probe does

1. Verify the human-approved whole-preview SHA, current native/helper receipts, every staged artifact hash, and the canonical private home before launching anything.
2. In the actual supplied daemon SEA entitlement context, query only the four exact installation selectors. All four must be absent before creating an exclusive private ownership marker and invoking original `install-init` **once**. Existing or incomplete authority is never regenerated.
3. Read original status/public keys and sign a public random challenge. Verify both raw32-byte CDP signing and the original `Aside Daemon Auth v1\0` HTTP domain; verify a tampered challenge fails.
4. Use the actual carrier and actual CLI SEA wrapper to perform only original status/public/sign commands. Their public-key hash must equal the first daemon result. These hosts never call install-init for symmetry testing.
5. Report only safe booleans, public-key hashes, known OSStatus codes and access-group hashes. An entitlement or permission refusal is a failed result; it is never converted to success or a different backend/scheme.

The runner is `vendor/provided/run-approved-dp-probe.mjs`. Without an explicit exact preview SHA it refuses before any host launch. After the human reply, the integrator may run:

```sh
node vendor/provided/run-approved-dp-probe.mjs \
  docs/integration/proposed/node-native-boundary/approval-preview/dp-query-preview.json \
  HUMAN_APPROVED_WHOLE_PREVIEW_SHA256 installation /ABS/PRIVATE/installation-result.json
```

The SHA is a guard against changed prework, not automatic consent. No approval is inferred from a build, static review, environment flag or this document.

## Continuing tests without replacing authority

The `environment` phase returns the fixed approved HOME/AUX_HOME/scope and existing external carrier acceptance flag, with diagnostic/deny-all modes absent. Use these only with the fully assembled supplied product and matching boundary artifacts; the minimal approval staging tree lacks the full UI/runtime resources. Keep the same initialized authority. Use disposable profiles, only the permitted Muse model through the actual credential API, and remove test credentials afterward. No biometric/OS grants or additional key families are authorized by this plan. Failed initial creation requires exact cleanup and review before another attempt.

## Exact cleanup

After the tests, the `cleanup` phase runs in the same actual daemon SEA context. It requires the private marker recording the four-row absent baseline. It derives only known exact continuation keys from this home's bounded registries and explicit MCP fixture IDs, clears those through the original `secure-clear`, then deletes the four fixed installation selectors using the compiled helper. It never invokes install-destroy, wildcard queries, enumeration, another group or another scope. A failure retains the marker and reports the refusal rather than widening deletion. It removes no owner files or unrelated rows.

```sh
node vendor/provided/run-approved-dp-probe.mjs \
  docs/integration/proposed/node-native-boundary/approval-preview/dp-query-preview.json \
  HUMAN_APPROVED_WHOLE_PREVIEW_SHA256 cleanup /ABS/PRIVATE/cleanup-result.json
```

Actual DP accessibility, default entitlement group and cross-host authority remain unproven until this approved probe succeeds. Load-only proofs establish registration and boundary interception, not crypto or Keychain acceptance.

## Build the helper after the browser build finishes

Run `node vendor/provided/build-dp-scope-helper.mjs out/provided-dp-helper-current` only after the current full native build is terminal. It compiles through the shared build lock into a new private directory, checks the fixed policy/header agreement and unchanged source/Node-header hashes, verifies the resulting signature, then publishes an actual successful receipt. It never loads the helper, starts a supplied host or calls a Security API. A failed build publishes no successful receipt. Pass that receipt to the existing preview preparer; do not treat the earlier missing job as a successful build or ask for approval of a non-runnable preview.
