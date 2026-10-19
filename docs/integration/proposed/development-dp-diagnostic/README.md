# Development-signed diagnostic for the existing approved Aux scope

This is a separate diagnostic path for the three copied development-signed hosts. It retains the original human-approved disposable home, SHA256 scope, four installation selectors, source-known continuation families and approval ID. The original preview must remain byte-identical at SHA256 `58a7808370579e09299a1d63eef02897931348ee81590d870e439c459d745752`. That approval is evidence for the same operation/scope, not evidence that new artifacts were previously reviewed. The subsequent owner's Xcode instruction authorizes the scoped provisioning/signing and retry. Root binds the final exact signed-artifact review to those existing instructions; this code never invents a new human-approved hash or requests an unrelated grant.

The old preview, old approval stage and original helper sources are unchanged. This lane has performed no native compile/helper execution, signing, profile input, approved-home read, Keychain operation or product launch.

## New helper and actual default group

`native/development-dp-scope-helper.mm` uses the original fixed home/scope/approval declarations. Before any exact-selector `SecItemCopyMatching` or `SecItemDelete`, it verifies the current process through public `SecCode` APIs:

- Apple generic anchor, exact reviewed development leaf SHA1 `47ACA5D1CFADD21CFEDC589B4DEED6E2B7A96D90`, and actual daemon/CLI signing identifier.
- Actual signed Team ID `9F2JXY8TCK`, correct Aux application identifier, and exactly one signed access group: `9F2JXY8TCK.dev.aux.dp.dbca8cbbce80cb5eb3f2f89043330556fdbf2350f3c057a69d6e10e6b3d11476`.
- The existing real boundary/pointer validation, non-deny-all mode, explicit probe gates and canonical private approved home.

The query keeps the original omitted access-group semantics because the production mapper deliberately rejects explicit non-original groups and removes the original group. A verified single signed group defines the host's actual default; no caller-supplied group is accepted. Successful inspection must return that actual group's hash for all four rows. The separate JS diagnostic refuses missing/wrong group hashes. No owner-group fallback, family enumeration, alternative storage, format changes, secret logging or new developer identity is introduced. The helper runs inside the daemon/CLI process; it is not a fourth development-signed host.

Only four exact scoped generic-password rows are inspected/deleted. Continuation cleanup remains the original source-known logical keys derived from registries/explicit fixture IDs inside this same approved home. No `install-destroy`, arbitrary selector, biometric action or implicit initialization is added.

## Required ordering

1. Root compiles the helper with `node vendor/provided/build-development-dp-helper.mjs NEW_OUTPUT STATIC_NODE_HEADERS`. The builder internally uses `scripts/native-build.py`; do not wrap it in another locking invocation. It records exact source, policy, proposal, Node-header and compiled-output hashes, and verifies the linker's existing local signature without loading the addon. A current successful receipt is required.
2. Assemble a fresh unsigned complete package using `--development-dp-layout`. Run `prepare-development-dp-diagnostic.mjs REQUEST.json` with `{packageRoot,helperReceiptPath,output}`. It only copies the new JS diagnostic, original common verifier/policy, and compiled helper into each host: eight new leaves total. It refuses existing destinations, signed packages, overlapping inputs and any changed approved scope. It does not access the approved home.
3. Embed the actual authenticated profiles and generate the exact full signing plan **after** this overlay. Sign/verify through the separate exact development executor. Adding these files afterward would invalidate the app's signed resources and success receipt. The helper's linker signature remains immutable within the allowed eleven-target plan; it does not add a signing target.
4. Generate a new signed-artifact review with `run-development-dp-probe.mjs review REQUEST.json`. Its request contains `signedReceiptPath`, `signedReceiptSha256`, `overlayPath`, `overlaySha256`, `cmsReceiptPath`, `cmsReceiptSha256`, `testMacIdentifier`, explicit `allowAppleTrustNetwork`, and a fresh external `output`. It consumes the executor's `verifySignedDevelopmentReceipt`, checks all final signed package/source/overlay/helper hashes, and freshly authenticates all three embedded profiles using the pinned current CMS helper. This step runs the read-only CMS trust helper, with network permitted only by the explicit matching mode; it makes no DP calls or product launches.
5. Root uses `run-development-dp-probe.mjs run REQUEST.json` with `{reviewPath,reviewSha256,testMacIdentifier,phase,reportPath}`. The review SHA is a root-reviewed artifact pin, **not a claim of a new human-approved SHA**. The runner revalidates the actual signed receipt/full inventory, current overlay/helper sources and fresh CMS before launching any host. Every phase uses only the fixed approved home/scope and sanitized source-known operations.

The signing executor export is provided by `execute-development-signing.mjs` (integrated by root). Review/runner import it only at execution time, and refuse without an exact success receipt; partial or verify-only outcomes are not signed success.

## Existing incomplete creation marker

The original attempted test wrote `.aux-dp-created.json` before its first native status call; initialization was never proven. Installation phase sees that marker and requests **verify**, which refuses if the public-key hash was never recorded. It does not unlink, initialize over, or regenerate an existing authority.

Root must first choose explicit `phase:"cleanup"` if recovery is required. The original source-known continuation clears and new exact four-selector helper must actually return success/not-found statuses before the original diagnostic removes its owned marker. Then a separate installation phase requires all four exact baseline rows to be absent before the one original daemon `install-init`. The actual CLI and fixed profile-bearing carrier verify the daemon's existing original public authority and raw-CDP/HTTP-domain signatures. No host regenerates keys merely to make verification match.

Cleanup failure retains the marker and reports actual bounded status metadata. The parent approval and owner data remain untouched. Real OS acceptance, cleanup, browser startup and UI behavior are still root-only pending operations.

## Evidence in this slice

Three focused pure/static checks pass: unchanged approval scope binding; refusal of partial/wrong certificate/team/group receipt shapes; and native source constraints for the actual code-signature gate/four exact selectors. JS syntax and whitespace checks pass. These checks are not native compilation or runtime acceptance. Source and inspected public SDK header pins are in `source-provenance.json`.
