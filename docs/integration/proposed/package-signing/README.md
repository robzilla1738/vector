# Explicit copied-package signing policy generator

`scripts/plan-provided-signing.mjs` fills the missing policy-generation seam for the existing `scripts/sign-provided.mjs`. It writes data only. It never signs, builds, launches product code, reads Keychain items or grants permissions. There is no `--apply`, identity lookup, recursive target discovery or `--deep` path.

The fixed list contains exactly11 targets: outer Aux.app; CLI wrapper bundle; daemon bundle; CLI SEA; nested password importer and its provider appex; Computer Use bundle; carrier; boundary dylib; and the two new guard addons. Every target pins its actual copied executable SHA256. Bundle executable names must match their actual regular Info.plist. The outer executable is explicitly provided by the integrator's browser review; it is never guessed from a build template.

All10 currently available target inputs were statically inspected and passed their role-specific metadata policy; see `static-input-observations.json`. These are supplied staged inputs/current compiled boundary outputs, not a final package. No final browser executable was available, so no final package policy or signature-validity claim is made.

## Integrator use after final package copy

Inspect the actual copied outer browser with static `codesign -dvvv`, `codesign -d --entitlements - --xml`, Info.plist and a SHA256 tool. Create an explicit review JSON outside the package:

```json
{
  "version": 1,
  "executable": "Contents/MacOS/ACTUAL_CFBundleExecutable",
  "sha256": "ACTUAL_COPIED_BROWSER_EXECUTABLE_SHA256",
  "signatureFlags": ["adhoc"],
  "observedEntitlements": {},
  "entitlements": {"preserveKeys": [], "removeKeys": []}
}
```

The example flags/empty dictionary are placeholders, not approved native-browser defaults. Copy actual sorted flag names and every actual entitlement/value. Explicitly partition every key between preservation and removal. Only existing `com.apple.security.*` boolean capabilities may be preserved; application groups, original identity/team/Keychain strings and arrays must be removed. The browser cannot receive the SEA-only DYLD exception through this generator. Any actual browser capability decision requires integrator review.

```sh
node scripts/plan-provided-signing.mjs \
  --package /ABS/COPIED_PACKAGE_PARENT \
  --browser-review /ABS/REVIEW.json \
  --output /ABS/NEW_SIGNING_POLICY.json

node scripts/sign-provided.mjs \
  --package /ABS/COPIED_PACKAGE_PARENT \
  --policy /ABS/NEW_SIGNING_POLICY.json \
  --receipt /ABS/NEW_VERIFY_ONLY_RECEIPT.json
```

The second command is the existing full-tree planner's verify-only mode. Signing remains a separate explicit integrator action. Policy output refuses overwrite and must be outside the copy. The package must report implementation supplied, signed false and disjoint source roots. Existing signer remains responsible for exhaustive whole-tree inventory, preserved signature verification, dependency order, actual signing and final protected-byte comparison.

## Fixed supplied decisions

The generator checks exact observed values, not just names. Daemon/CLI SEA must retain their original hardened-runtime flag and exact three JIT/library-validation boolean capabilities. Original app/team/Keychain claims must equal the pinned supplied identities before removal. Only these two original SEA hosts add the explicit DYLD environment boolean required by the reviewed fixed boundary; the new CLI wrapper does not receive it.

Importer/provider retain original sandbox/network booleans where actually present, remove exact original app/team/Keychain/autofill claims and preserve hardened runtime. Computer Use retains its two original automation/addressbook booleans and hardened runtime. New wrapper/carrier/dylib/guards must have empty entitlements and only unsigned/ad hoc/linker flags, without new hardened-runtime or other claims. Unexpected identity values, capabilities, flags or target paths refuse rather than silently choosing a new policy.

Original provided-native.node files, Chromium frameworks/helpers, all runtime code and signed memory/catalog payloads are absent from the target list. Their signatures and bytes remain preserved by the existing signing planner's whole-tree checks. Ad hoc signatures and preserved usage capabilities do not establish DP/entitlement sharing, TCC permissions, importer functionality or runtime acceptance.

## Focused evidence

Three pure metadata tests cover all11 roles/SEA-only additions, actual identity/capability/flag drift refusal, and exact explicit outer review/exhaustive key decisions. Current10 actual static inputs match the same policies. No compiler, signing operation, product launch, Keychain operation or grant was used.
