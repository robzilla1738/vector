# Fresh disposable startup milestone — missing capability checkpoint

Scope is one fresh-profile browser, its paired daemon and profile initialization. Preserve the current UI and accepted app. No legacy migration, advanced recovery, task-capability expansion, provisioning or release. CLI routing follows browser startup and is not its acceptance gate.

## Actual diagnostic findings

- Prior direct entry ended with SIGKILL(-9). Current `codesign --verify` reports the ARM64 executable is unsigned; Gatekeeper assessment exits3, `rejected`, `source=no usable signature`. Recent matching kernel/amfid records and a new Aux crash report were not available, so the prior kill is not independently attributed from a crash record. The unsigned executable is demonstrably rejected by macOS signing policy.
- One valid installed identity is `Apple Development: Robert Courson (68DV3N28DS)`, SHA1 `47ACA5D1CFADD21CFEDC589B4DEED6E2B7A96D90`, team `9F2JXY8TCK`. Its public certificate SHA256 `ff0293a06f20704a1f3b3f2571b3362ef439a2dfb3b0bc90bcf3d5debfc73a1c` exactly matches the existing native browser/daemon policy. No private key was exported or used.
- Current macOS is27.0.1. The installed SDK's `EndpointSecurity/ESClient.h:818` explicitly requires `com.apple.developer.endpoint-security.client` for `es_new_descendants_client`. It requires neither root nor TCC approval.
- Both the browser primary executable and the native daemon require that client at their first native entry. The actual A24 compile command includes `AUX_BROWSER_DESCENDANT_CUSTODY`; this dependency exists even though COLD startup is disabled.
- Fourteen installed profiles were decoded read-only. Two wildcard profiles can match the Aux application identifiers, but **zero grants Endpoint Security**. Three profiles embedded in the accepted app also lack this capability. The candidate embeds no provisioning profiles. Unrelated profile names and details remain only in a private diagnostic directory.
- The daemon's current signature validator additionally rejects the required Endpoint Security entitlement. A daemon signed without it fails the first observer; one signed with it would fail the later whitelist. The bounded correction must admit this exact required entitlement for the actual daemon host, retaining all other identity/privilege checks.

These observations are in `diagnostics.json`, `existing-profile-capabilities.json` and `macho-signature-inventory.json`. None is a successful startup result.

## Existing startup components and smallest correction

The native factory already supports genuinely empty state without migrating a legacy profile: authenticated parent, retained empty roots, exclusive reservation, actual absence checks, one-shot generation, protected stage, ready provider and fixed native entry. Existing reservations are resume-only. No new task architecture is needed.

The bounded source/resource correction is:

1. Select an explicit, canonical, private disposable data directory before Chromium can fall back to a default or policy-redirected directory. Use a disposable OS home with separate native data/cache paths; a generic `/tmp/profile` aliases those paths on macOS and is invalid for the existing contract.
2. Run existing native root capture, sealed daemon selection and startup authorization after validated user-data selection and before crash reporting, histogram/singleton writes or Local State reads. Preserve later checks as revalidation. Helpers never run the browser-only sequence.
3. Initialize the genuine new Profile ID after actual user-pref initialization and before profile services. Retain the existing created-new-store, absent-value and actual-admission checks.
4. Enable the existing protected startup consistently, package the missing sealed daemon `AuxFreshBootstrapPolicy.json` for the four exact isolated roots, and select the fixed paired native entry. Preserve ordinary-source quarantine and refuse legacy state. The launcher must not reuse historical acceptance or an owner's development profile.
5. Correct the narrow Endpoint Security entitlement conflict, then seal final module/resource hashes and sign the coherent copy only after owner approval and compatible existing profiles are available.

**Missing dependency:** the existing startup design needs Apple-authorized Endpoint Security profiles for `dev.aux.browser` and `dev.aux.browser.daemon`. No such existing profile was found. Obtaining/requesting one is provisioning and is outside the owner's current authorization. Removing supervision or substituting an unguarded Node route would change the startup/security architecture; neither was done. Startup source/flags were not changed while this dependency awaits clarification.

This capability is imposed by Aux's current descendant-supervision design; it is not an inherent requirement of ordinary Chromium profile cookie/extension separation. If no existing compatible profile is available and provisioning remains excluded, the alternative is a bounded separation of ordinary fresh-browser startup from privileged task supervision, with supervised task/automation execution kept unavailable. That changes the current startup/security contract and must be decided before implementation. No replacement task architecture or unsupervised productive task path was added.

## Signing review

`signing-scope-review.json` enumerates the exact current code objects and pre-signing hashes:16 native browser images plus6 embedded images with invalid/absent signatures. The latter are native daemon, PTY, two CLI images, Computer Use and memory. Ninety-four other Mach-O signatures already verify individually and should be preserved. This inventory diagnoses the existing candidate; it is **not permission to sign**, nor a claim that every inactive helper is needed for the first browser check.

The intended approval action is local development signing of **one separate corrected candidate copy**, its necessary nested browser code and paired daemon/runtime objects, inside out, with the matching existing Apple Development identity. It includes final exact resource sealing and verification only. No accepted app replacement, key export, account login, new OS grant, capability request, provisioning, notarization, upload or release is included. CLI routing remains deferred.

Approval is **not ready yet**: signing the current bytes would leave the missing capability, wrong startup order and absent sealed policy unresolved. Final code-object hashes and the smallest necessary helper set must be frozen after those bounded corrections and after compatible existing capability profiles are supplied. No misleading sign-now approval is requested.

## Working / failed / untested

| State | Evidence |
|---|---|
| Working preparation | A40 paired assembly exists; previous exact resource comparison preserves CSS/art/fonts and the accepted app. Read-only identity, certificate, signature and capability diagnosis completed. |
| Failed | A40 launch is refused by the launcher; direct unsigned entry terminated. Native startup also lacks its enabled chain, sealed policy and authorized Endpoint Security capability. |
| Untested — blocked | Actual navigation, two-profile cookie/extension/Aux isolation, multiple windows, draft/attachment persistence, sidebar/chat/settings and visual comparison. No new usable app was produced at this checkpoint. |
| Follow-up — explicit | BYOK credential storage and actual inference; eligible ChatGPT/Codex account connection; AI model/search/tidy behavior; third-party extension installation, isolation and1Password autofill/native messaging; any separately required Computer Use OS permissions. These remain on the roadmap. |

No signing, provisioning, new app/helper execution, UI change or new feature batch occurred during this investigation. The owner was asked whether an existing Endpoint Security approval/profile is available before proceeding past this dependency.
