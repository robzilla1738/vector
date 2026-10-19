# Retired native passkey broker versus supplied Vault

Static inspection only, using five exact hash-pinned supplied Vault files and six current Chromium source files recorded in source-and-anchor.json. No owner Vault, credential, Keychain, native browser, passkey ceremony or site was accessed. The independent native broker is not part of the supplied Vault implementation.

## Positive supplied flow

- Manifest registers content/content.js at document_start/all_frames and makes fido2-page-script.js web accessible. background.js registers that script through chrome.scripting with world MAIN, runAt document_start, allFrames/persistAcrossSessions true.
- fido2-page-script.js captures navigator.credentials.create/get originals, replaces methods, serializes supported publicKey requests to ASIDE_FIDO2_CREATE_REQUEST/GET_REQUEST window messages, and correlates bounded responses. Its original method calls are preserved fallbacks when disabled, unsupported, dialog declined or response says fallback. Conditional get includes its own relay/browser-native fallback handling.
- content/content.js and content-runtime.js implement the isolated-world bridge and original page dialog. They send chrome.runtime commands fido2CreateRequest/fido2GetRequest with requestId/options/delegatedCrossOrigin and post correlated page responses.
- background.js routes those commands to UM/GM respectively; validates sender/RP/scope/request generation and Vault status, shows the original content dialog, and executes original P256 ceremony helpers nM/tQ. xM persists the resulting passkey private JWK and metadata through the supplied encrypted Vault item operation; sQ updates a passkey counter via updateItem. Results become credential responses in the page shim. This is reused actual behavior, not a proposed native key generator.
- These five files contain no auxCredentials or asideCredentials namespace use. The supplied manifest does not request that namespace or webAuthenticationProxy. Absence is scoped to these actual flow files and permission inventory, not a claim that no platform API exists elsewhere.

## Conflicting independent flow

Content AuthenticatorCommonImpl has two inserted provider-choice branches: nonconditional make and modal get, with security/UI/cross-origin/virtual/payment checks. They invoke ChooseAuxPasskeyProvider before normal WebAuthenticationRequestProxy and upstream handling. ChromeWebAuthenticationDelegate currently calls aux::passkeys::ChooseProvider, which opens an extra "Choose a passkey provider" tab-modal dialog. Selecting Aux opens `/index.html#/passkeys/<random id>` in the Vault extension and expects auxCredentials.getRequest/complete/reject.

The independent request proof is ECDSA over `Aux Passkey Request v1\n` plus private request payload, obtained through LoadInstallationPrivateKey. Root's actual supplied-authority proposal intentionally returns null there; no original private installation key is exportable or invented. The supplied Vault has no independent route/namespace contract to consume this request. Thus normal browser fallback from original Vault (or other WebAuthn callers) can be intercepted by an extra provider dialog and routed into an incompatible UI/proof path. Leaving it enabled because it compiles would preserve the independent implementation over the supplied one.

Independent private_session_cleanup also posts `/trpc/passkeys.retirePrivateSession`; no matching root router exists in the pinned supplied daemon (its top-level passwordManager contains its own Vault flow). That cleanup is reached through broker-created ProfileSession tracking; disabling broker selection prevents new sessions through these content hooks. No broad removal or synthetic success is proposed.

## Narrow proposal

`disable-independent-provider.patch` changes exactly one ChromeWebAuthenticationDelegate body to call the content base ChooseAuxPasskeyProvider. The current base implementation immediately invokes callback(false) and returns an empty cancellation closure. Existing content continuation sets aux_provider_chosen then re-enters its established normal path, preserving upstream proxy, OS and browser providers. It neither creates credentials nor claims successful Vault handling.

This disables only the retired browser-owned chooser. It does not remove supplied page/content/background code, intercept its messages, introduce an independent consent surface, alter credentials, modify Chromium standard protocol, register a new provider, or replace original dialogs. Existing unused independent APIs/build sources remain recoverable; separate integrator cleanup may remove their registration after this narrow behavior correction is compiled/observed. No low-level WebAuthn/security-check removal is needed for this proposal.

Patch source is pinned and `git apply --check` passes against current checkout. Native compilation and actual supplied create/get/fallback/conditional observation remain pending behind the full build lock; this report does not claim runtime passkey acceptance.
