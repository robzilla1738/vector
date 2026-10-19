# Aux Vault passkeys

Original implementation of the local passkey item behavior in approved
`docs/spec/daemon/services.md` § Vault (the previous exact authenticator contract
was unknown), with an explicitly selected Chromium provider and WebAuthn3
request/response encoding. This is a dedicated encrypted credential collection,
not item notes or a model tool.

`createPasskeyRouter(services, adapter)` returns `{router, service}`. Mount the
router as `passkeys`; use the structural `PasskeyVaultAdapter` in schema.ts.
Subscribe Vault security changes to `service.clearEphemeral(accountId)`.
The core adapter owns atomic encrypted envelope writes and fresh verification;
it must never export private passkey records through ordinary snapshots,
item search, cipher item APIs, model context or regular export.

Only the password-manager extension can begin/confirm/cancel. A request needs
an installation-key signature over `Aux Passkey Request v1\n` followed by the
exact raw UTF-8 payload. Native code constructs the immutable envelope after
Chromium RP/origin/frame/permissions-policy/TLS checks. Native document ownership,
profile account gate, current top origin and expiry are rechecked on retrieval
and completion. Daemon checks the signature, account/profile binding, mode,
origin, RP, client data and challenge. Confirmation requires explicit presence
and fresh password/biometric verification; an unlocked key alone is insufficient.

ES256, platform credentials, discoverable credentials, `none` attestation and
`credProps` are implemented. Authenticator flags truthfully report UP+UV and no
backup eligibility/state; every persistent assertion signs and increments its
current encrypted record counter in the same synchronous Vault mutation. Native
and durable per-record request IDs prevent duplicate consumption. A successful
signature whose native completion is canceled is not rolled back or replayed.
Unsupported cryptographic algorithms, extensions, cross-origin frames,
conditional/ambient/immediate requests, payment and remote overrides do not
silently claim support. The native chooser leaves these with existing providers.
Direct/enterprise attestation is explicitly unsupported by Aux Vault.

Private-mode credentials are separate, memory-only and scoped to a random
native Profile lifetime nonce. They cannot read or modify normal-mode keys.
Native Profile destruction calls authenticated Chromium-only
`passkeys.retirePrivateSession`, which removes only that exact nonce. Vault
worker last-window cleanup is a second path; fresh signed requests prune older
private epochs, and lock/account deletion clear all associated RAM keys. A
reopened private Profile never inherits its predecessor's keys.

Vault UI modules in `apps/vault/src/passkeys/` are standalone. Mount
`PasskeyConsent` for `requestIdFromHash()` (`#/passkeys/<UUID>`) behind the current
Vault account setup/unlock gate, passing existing `rpc` and `resolveAccount`.
Call `installPasskeyLifecycle(rpc, resolveAccount)` once in the split private
worker; add the Vault-only `dev.aux.ext.private.credentials` manifest permission.
An ordinary extension build reports that the native API is unavailable.

Focused disposable test verifies real generated P-256 signatures, public key
encoding, UP/UV, counters, replay across service recreation, tampered native
proof, wrong password, a verification/lock race and private epoch isolation.
It does not register credentials on owner sites, access Keychain, or prompt
biometrics. Production native request/consent completion still needs a full
linked disposable-profile WebAuthn fixture observation after integration.

Primary upstream sources:
- https://www.w3.org/TR/webauthn-3/
- Chromium155 `content/browser/webauth/authenticator_common_impl.cc`
- Chromium155 `components/webauthn/json/value_conversions.{h,cc}`
- Chromium155 `components/webauthn/core/browser/client_data_json.{h,cc}`
- https://developer.chrome.com/docs/extensions/reference/api/webAuthenticationProxy
  (not attached globally; the selected adapter uses native callbacks only).
