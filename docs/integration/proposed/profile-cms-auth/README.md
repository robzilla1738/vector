# Offline Apple provisioning-profile authentication proposal

Prepared source, not compiled or executed. No actual profile input, signing, private-key access, provisioning request, DP command or network access was performed for this slice. Default ad hoc packaging and the existing approval preview remain unchanged.

The metadata-only gate from the unsigned three-host preparation deliberately cannot approve a profile. This separate helper authenticates a bounded, explicitly supplied CMS message before its payload reaches that gate. The runner does not discover or copy local profiles. Root must supply a reviewed exact CMS SHA256, the current test Mac identifier, the specific proposed host role and current review time. No raw profile, device identifier or certificate is written to the report.

## Policy and evidence

Apple's [policy registry](https://github.com/apple-oss-distributions/Security/blob/main/OSX/sec/Security/SecPolicy.list) declares `OSXProvisioningProfileSigning` as exported, Apple-anchored and supported by `SecPolicyCreateWithProperties`. Apple's [policy header](https://github.com/apple-oss-distributions/Security/blob/main/trust/headers/SecPolicyPriv.h) documents provisioning-specific signer/intermediate restrictions, digital-signature usage and OCSP checking. We do not substitute a generic X.509 or generic CMS signing policy.

`kSecPolicyAppleOSXProvisioningProfileSigning` is exported in the installed macOS SDK Security.tbd, but is **not declared in the public SecPolicy.h**. This is an explicit private policy-identifier dependency. The implementation uses public CMSDecoder/SecPolicy/SecTrust functions with that dynamically resolved identifier. Missing identifier, unsupported factory or mismatched policy properties refuses verification; no guessed OID or private factory function is used. Compilation alone cannot establish that this policy remains usable on the installed OS.

The public [CMSDecoder](https://developer.apple.com/documentation/security/cmsdecoder) API verifies the signature separately from trust evaluation. The helper requires exactly one signer and a valid attached signature, obtains its unevaluated SecTrust, installs the provisioning policy plus OCSP **positive-response required / network disabled**, disables issuer fetching, then evaluates trust. It never sets an arbitrary verification date, adds trust anchors, changes trust settings or permits an unsigned payload. An absent/stale offline revocation response can cause a genuine profile to fail; this remains a refusal, not an override or online fallback. This helper establishes no new online revocation freshness.

Security's OS trust service can consult system anchors and existing public certificate/revocation caches. This is not a claim of an entirely self-contained certificate implementation or of zero OS cache activity. The helper has no SecItem, private-key, profile discovery, signing, provisioning or trust-settings mutation calls. There is no owner Keychain enumeration or requested OS grant. Root must decide whether this public OS trust evaluation is suitable before executing it.

## Exact flow and bounds

1. Runner reads the explicit regular canonical CMS file using O_NOFOLLOW, at most 2 MiB, and checks its reviewed SHA256. Group/world-writable inputs are refused.
2. Runner checks the separately compiled helper receipt against current source pins and helper bytes. It spawns the fixed receipt binary with a minimal environment, no inherited DYLD settings, a 20-second timeout and bounded output. The helper itself has a 15-second alarm.
3. Authenticated payload is decoded as a plist, normalized only for its public dates/data, and returned privately over the pipe with hashes of the original CMS and authenticated payload. The command-line runner emits only a sanitized summary; raw helper stdout must never be printed or committed.
4. Existing strict metadata checks enforce current dates, exact own Team/prefix, proposed AppID/shared group, inspected development certificate, development device and platform. The result records exact CMS/payload/helper/receipt/proposal hashes and **always signingAuthorized:false**.

The pure JS export `validateAuthenticatedProfile` is only a joining gate for the trusted helper response; authored fixture responses cannot prove CMS authenticity. Callers must use the receipt-backed `authenticateDevelopmentProfile` entrypoint for a real input. Caller-supplied test Mac identity must itself be independently inspected by root; this tool does not discover hardware identity.

## Later integrator-only commands

Do not run during the frozen full build. These commands are a reviewable recipe, not execution evidence:

```sh
python3 scripts/native-build.py node vendor/provided/build-profile-cms.mjs /ABS/NEW-CMS-BUILD
node vendor/provided/authenticate-development-profile.mjs /ABS/explicit-request.json
```

The first command serializes one helper compile and writes `profile-cms-build-receipt.json` only after actual compile success, including selected SDK header hashes. It does not run the binary. No receipt exists for this source yet. The second command is read-only authentication only, with this request structure:

```json
{
  "profilePath": "/EXPLICIT/REVIEWED/profile.provisionprofile",
  "expectedProfileSha256": "REVIEWED_64_HEX",
  "receiptPath": "/ABS/NEW-CMS-BUILD/profile-cms-build-receipt.json",
  "proposalPath": "/ABS/REPO/docs/integration/proposed/development-dp-signing/proposal.json",
  "role": "daemon",
  "testMacIdentifier": "ROOT_REVIEWED_DEVICE_IDENTIFIER",
  "now": "CURRENT_ISO_TIME_WITHIN_60_SECONDS"
}
```

No local matching profiles currently exist according to root's separate public-metadata inventory. This proposal neither obtains them nor makes the unsigned package signable. Future profile authentication still needs compile proof and an actual root-selected public CMS input. Provisioning, developer signing and DP execution remain separate owner decisions.

## Explicit Apple trust network mode (source-only follow-up)

Root observed actual offline refusal `errSecIncompleteCertRevocationCheck` (-67635), reflecting unavailable cached positive OCSP rather than a weaker-policy workaround. Offline remains default. The explicitly supplied runner request Boolean `allowAppleTrustNetwork:true` selects only `--authenticated-json-with-network`; this permits Security issuer/revocation fetching while retaining the same Apple provisioning policy and required positive OCSP. No generic trust fallback, negative-response suppression or policy bypass is added. Report fields distinguish `networkAccessAllowed:true, onlinePositiveRevocationVerified:true, offlinePositiveRevocationVerified:false`. Allowed networking does not prove an actual HTTP request occurred; an existing positive cache can also satisfy evaluation. The planner requires the same explicit mode and rejects an online report under offline defaults. The root-authorized Apple trust/provisioning network scope governs later root execution; this lane did not execute this mode. New helper source pins require a new actual compiled receipt.
