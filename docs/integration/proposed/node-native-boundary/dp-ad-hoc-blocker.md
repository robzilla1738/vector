# Shared original DP authority: current ad hoc blocker

Assessment2026-10-19. No signing change, new native command, DP call or owner-state operation was performed for this assessment.

## Concrete observations and limits

Root reports that the approved actual daemon SEA first obtained four absent metadata-read results, then the installation probe failed in an original native command without an extracted numeric status. The existing report does not identify which command failed; it may have failed in install-status before install-init. Subsequent exact four-selector deletion returned-34018 for every row. The local SDK SecBase.h line341 defines this as errSecMissingEntitlement. The installation-phase native error is **not** assigned that status without evidence; failure reporting now retains the helper's separate exact-row status arrays.

The approved ad hoc daemon/CLI policy removes original app/team/Keychain-group claims and adds only the reviewed DYLD boundary capability. The current mapper preserves original DP=true/accessibility/crypto formats, isolates selectors, and removes the original Aside access group. No accepted writable shared default group was established. A not-found read is insufficient evidence of write/delete authority or of completed cleanup. Current private marker/state must remain under root's explicit diagnosis/cleanup control; this document does not authorize another initialization.

## Platform evidence

Local SDK SecItem.h lines201-217 ties default/shared Keychain groups to application identity and group entitlements, and lines1033-1037 apply those semantics when DP=true. Header SHA256s are SecItem.h `1a5a731dc52e85cf7fb6ebe26d75aa467113c07b6ec3389c98e183d75c651eaf` and SecBase.h `02982c827dd8045f652350d48411e5f1ce98f17c4cacc3502e6bf4cbdd27006d`, under the current MacOSX SDK Security.framework/Headers.

Apple's official documentation describes team-associated access groups for DP Keychain sharing, rather than an arbitrary string creating authority. The app's default group and group sharing are code-signing entitlement properties. [Apple: sharing Keychain items](https://developer.apple.com/documentation/security/sharing-access-to-keychain-items-among-a-collection-of-apps), [Apple platform security: Keychain protection](https://support.apple.com/guide/security-pdf/keychain-data-protection-secb0694df1a/web).

Apple's published Security server source builds groups from entitlement claims, conditionally accepts application/app-group identities only after validation, and relies on AMFI to enforce proper signing for explicit Keychain groups. It also distinguishes implicit token access, including its read-only limitation, from usable ordinary shared storage. Thus a read result alone cannot establish the missing mutable authority. [server_entitlement_helpers.c, SecTaskCopyAccessGroups](https://github.com/apple-oss-distributions/Security/blob/main/OSX/sec/ipc/server_entitlement_helpers.c).

The published validation helper checks code-signing state including validated entitlements; carrying an XML key in an ad hoc signature does not itself prove that validation. This is static published implementation evidence, not a claim that the running OS is byte-identical to that source revision. [SecTask.c, SecTaskEntitlementsValidated](https://github.com/apple-oss-distributions/Security/blob/main/sectask/SecTask.c).

## Result within the current constraints

No source-backed viable ad hoc configuration has been identified that preserves original DP semantics/formats, exact isolated selectors and a shared daemon/CLI/carrier authority while honoring the current local-only constraints. This is an evidence-backed acceptance blocker, not a proof that every conceivable macOS configuration is impossible.

Changing Aux selector names or faithfully passing empty install-init input cannot supply a missing OS entitlement. Arbitrary team/application/group claims are not an established replacement for validated authority. The following are outside this assessment and are **not proposed** as fixes: original Aside group fallback, fabricated Team ID, Developer ID signing, provisioning/release operations, security/AMFI relaxation, file-Keychain or PEM substitution, another crypto scheme, grant prompts, or switching off DP.

The original shared installation/Vault authority remains unaccepted. Root must report this concrete blocker and retain truthful failure behavior. Any later change to signing constraints or storage architecture requires an explicit owner decision and separately reviewed implementation; it must not be silently folded into branding, packaging or the approved diagnostic scope.
