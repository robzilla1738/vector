# Passkey next-slice contract — proposal, not implemented

The approved build-facing `docs/spec/daemon/services.md` identifies passkeys and login
type as Vault item data. It does not specify ceremony dispatch, authenticator storage,
credential algorithms, user verification, conditional UI or native response contracts.
The proposal below is an independent design; none of it establishes completed parity.

Public upstream findings:

- [WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/) scopes credentials to an RP ID,
  authenticates client data with origin/challenge binding, and distinguishes user
  presence from user verification. An unlocked Vault alone must not claim a fresh
  verified ceremony. Password or biometric verification can support user verification
  within an authenticator boundary. Assertion signatures bind authenticator data and
  the client-data hash; counter behavior must be truthful.
- [Chrome webAuthenticationProxy](https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy)
  is a remote-desktop forwarding API. Attach suspends normal processing; create/get
  events expose serialized public-key options and request IDs, with completion and
  cancellation callbacks. Its documented request schema does not provide the trusted
  frame/origin envelope proposed below. Therefore suitability as a local Vault
  authenticator is unproven. Do not enable it globally as a shortcut or replace
  navigator.credentials in page JavaScript.
- [Apple Credential Provider](https://developer.apple.com/documentation/authenticationservices/ascredentialproviderviewcontroller)
  and [AutoFill entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.authentication-services.autofill-credential-provider)
  are another integration path. Current available evidence did not establish macOS
  entitlement/ad-hoc packaging feasibility. They are not required for the proposed
  Aux-browser-only native hook and remain a separate investigation.

## Proposed original boundary

Native lane owns an Aux authenticator adapter inside the browser's validated WebAuthn
request flow. It uses upstream browser validation for secure context, RP-domain
relationship, frame permissions and client-data construction. The renderer/content
script cannot supply or override trusted origin, account, profile or frame identity.
Do not use a CDP virtual authenticator as the shipping provider.

A proposed private permission/name is `dev.aux.ext.private.credentials` /
`chrome.auxCredentials` (requires integrator/API registration; no existing API claimed).
Only the Aux Vault extension receives native requests and completes them:

```
PendingCeremony {
  requestId: UUID, kind: 'create' | 'get', accountId: number,
  profileId: string, browserMode: 'default' | 'incognito',
  targetId: string, frameToken: opaque, origin: string, topOrigin: string,
  rpId: string, clientDataJSON: base64url, clientDataHash: base64url,
  options: serialized public-key options, expiresAt: epochMillis
}
```

Native stores the immutable envelope; the extension receives an opaque request ID and
redacted display/candidate fields. `getPending(requestId)`, `onRequest`,
`onRequestCanceled(requestId)`, and `complete(requestId,response|DOMException)` are
proposed private methods/events. Completion is one-shot and rejected after cancellation,
navigation/frame destruction, account/profile/mode switch, timeout or browser lock.
Normal browser passkey providers remain available when Aux Vault is not selected.

Vault daemon proposal (only the authenticated Vault extension, never agent/model tools):
`passkeys.begin({nativeRequestId})` obtains the trusted native envelope via a private
browser bridge; it never trusts web-page supplied RP/origin. `candidates` returns
RP-scoped credential metadata. `confirmCreate` or `confirmGet` consumes a fresh
ceremony-bound user-presence/verification proof. Signing responses contain public
credential/authenticator bytes only. No general-purpose sign(privateKey,bytes) API.
Cancel, reject, timeout and unsupported algorithm/extensions return truthful failures.

Start with a real local ES256 authenticator, explicit consent and attestation `none`.
Each stored credential needs random credentialId, exact RP identity, userHandle,
user/display names, algorithm/public key, encrypted private key, created/last-used
metadata and transactional counter/backup state. Put private credential records in a
separate authenticated encrypted Vault envelope collection with domain separation.
Ordinary item snapshot/search/export/model access must never expose the private key.
This needs a backwards-compatible Vault format migration and specialized secret access,
not a `sections` or `notes` field containing PKCS8.

## Decisions and evidence required before implementation

1. Native owner selects the Chromium authenticator integration point and defines
   immutable request transport + cancellation. Verify origin/challenge construction
   stays in trusted browser code and the original browser providers still work.
2. Vault owner defines encrypted format migration, deletion/recovery/backup semantics,
   fresh password/biometric verification, rate limits and replay invalidation on lock.
   UP/UV flags must reflect the actual gesture and verification, never just unlocked.
3. Explicitly scope v1 discoverability, conditional mediation, cross-origin frames,
   incognito persistence, unsupported PRF/largeBlob/hmac-secret/credProtect extensions,
   exclude/allow credential lists, signature counters and export/import. Unknown or
   unsupported required capabilities must fail without a fabricated credential.
4. Validate create and get against an independent local RP verifier using disposable
   profile/account. Cover wrong RP/origin/challenge, replay/cancel/timeout/navigation,
   lock/profile changes, duplicate exclusion and counter commit boundaries. Test
   actual user-presence UI with fixtures; no owner accounts or real site registrations.

Recommended next split: native request adapter contract first, then encrypted daemon
credential/signing service plus Vault selection/consent UI, then full local RP acceptance.
