# Original installation input and diagnostic failure audit

Static original daemon code SHA256: `5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5`.

The actual `initInstallation()` calls `runMacInstallHelper('install-init')` with no payload. `runMacInstallHelper` passes `ei ? JSON.stringify(ei) : ''`, and `runNativeHelperCommand` defaults input to the empty string before calling the original binding. Status/public-key calls use the same parameterless convention. The source does **not** supply a required scheme field. Its separate metadata constant is not a native init request payload.

Pinned original native binary SHA256: `bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb`. Static symbols are `_$s16AsideNativeSwift14cmdInstallInitSSyF` at0x34df4, `_$s16AsideNativeSwift16cmdInstallStatusSSyF` at0x3a990 and `_$s16AsideNativeSwift16cmdGetPublicKeysSSyF` at0x418bc. These Swift signatures return String and have no request parameter. No original function was executed by this audit.

The probe previously passed the JSON text `{}` for these commands. Its source-only correction now sends the exact original empty string, while `cdp-sign` retains its actual JSON challenge object. This is a fidelity correction, **not evidence that the input difference caused the observed failure**. Initialization remains once-only in a positively fresh scope; no scheme override, replacement authority, crypto/backend change or retry was added.

Root reports the approved first daemon probe reached original-native-error with no extracted numeric status, and a later exact cleanup inspection exposed all four SecItemDelete statuses as-34018. The old outer runner discarded nested exactRows on a failing child. It now preserves only bounded signed32-bit OSStatus arrays, exact four-row metadata, optional validated public group hashes, operation and known diagnostic codes. It forwards no raw error strings, secrets or arbitrary child fields. The separate top-level error with no OSStatus remains unknown rather than being relabeled-34018.

Pure callback/JSON fixtures verify empty parameterless inputs, unchanged original signing domains, no reinitialization during host verification, nested cleanup failure status preservation and raw-field refusal. The approved staged preview/artifacts and disposable home were not modified. No native/DP operation or signing/build was performed by this slice; root owns any further approved diagnosis and cleanup.

## Dispatcher and future bounded trace follow-up

Static dispatcher range0x48eb4..0x49af8 stores input lines before comparing command names. Matched branches directly call no-argument cmdInstallInit at0x4956c, cmdInstallStatus at0x495f0 and cmdGetPublicKeys at0x49744. Disassembled three function bodies contain no input-line reader/getter or JSON input deserializer calls; their dataWithJSONObject calls serialize result dictionaries. Pinned byte ranges are in parameterless-dispatch-evidence.json. This further excludes a required scheme request and provides no support for attributing this failure to JSON{}; it is static analysis, not another execution.

A future diagnostic revision records only lastAllowedCommand from the fixed four-command allowlist when an invocation/parse fails. Callback exceptions are reduced to a fixed public error code. The outer failure sanitizer preserves that allowlisted name and refuses arbitrary trace strings. Pure fixtures inject a failure at each of the first three commands to verify attribution. Existing approved artifacts/home remain unchanged; using revised diagnostic bytes requires root's explicit approval/integration handling.
