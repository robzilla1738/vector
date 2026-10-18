# Virtual WebAuthn compatibility

`tests/smoke/chromium-webauthn-virtual.mjs` tests Chromium's WebAuthn protocol using a synthetic CTAP2 authenticator in a new disposable profile and a localhost relying party. It does not contact an account, platform authenticator, security key, password manager or synced passkey provider.

## Run

```sh
# Chrome for Testing control bundled with the Playwright dependency
node tests/smoke/chromium-webauthn-virtual.mjs

# Installed Chrome control, also with a new disposable profile
AUX_CONTROL_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  node tests/smoke/chromium-webauthn-virtual.mjs

# Current candidate; original preview must first retire normally
AUX_CHROMIUM_SRC='/absolute/patched/src' \
AUX_CANDIDATE_BIN='/absolute/patched/src/out/AuxFast/Aux.app/Contents/MacOS/Aux' \
  node scripts/dev.mjs -- node tests/smoke/chromium-webauthn-virtual.mjs
```

The Aux route reuses the original launcher/plain lock and read-only candidate preflight described in [extension compatibility probes](extension-compatibility-probes.md). It admits current unsigned `Aux.app` developer outputs including genuine `AuxFast` only with matching native byte/UUID, bundle/framework version, linked ABI and separately recorded configuration evidence. It does not change or relabel the binary. `AUX_CONTROL_BIN` remains the external-browser control route; an Aux executable must use the guarded candidate route. No `enable_fido`/extension flag is invented as WebAuthn proof: real CDP virtual-authenticator operations and cryptographic checks below must pass. Preflight alone does not establish protocol or platform-passkey support.

Each run creates and removes its own temporary `HOME`, user-data directory, and localhost server. The runner uses CDP `WebAuthn.enable`, `addVirtualAuthenticator`, `getCredentials`, `setUserVerified`, and `removeVirtualAuthenticator`. It verifies registration and assertion client data, exact origin and challenges, RP ID hashes, user-presence and user-verification flags, ES256 assertion signature, and a resident credential. An unrelated RP must fail with `SecurityError`; an authenticator whose UV state is off must fail a UV-required assertion with `NotAllowedError`.

## Results on September 25, 2026

| Browser                         | Version       | Synthetic registration/assertion and signature | RP rejection | UV rejection | Resident credential |
| ------------------------------- | ------------- | ---------------------------------------------- | ------------ | ------------ | ------------------- |
| Compiled AuxProof candidate     | 156.0.8074.0  | Pass                                           | Pass         | Pass         | Pass                |
| Installed Google Chrome control | 154.0.8037.58 | Pass                                           | Pass         | Pass         | Pass                |
| Chrome for Testing control      | 153.0.8010.12 | Pass                                           | Pass         | Pass         | Pass                |

The run artifacts are local under `release/test-artifacts/`: `aux-candidate-webauthn-virtual.json`, `system-control-webauthn-virtual.json`, and `chrome-reference-webauthn-virtual.json`. A same-version independent Chrome 156 control was not installed; the two available controls are labeled by their real versions. No result is transferred from them to AuxProof. The stable-tag AuxDev executable, signed package and production Aux Profile integration must be run separately once their exact binaries are ready.

## Remaining gates

- **Platform passkeys:** exercise Touch ID, Apple Passwords/iCloud Keychain and synced credentials in the signed Aux bundle with its actual identity and entitlements. A virtual authenticator cannot prove any of these.
- **External security keys:** register and assert with supported physical USB/NFC/Bluetooth authenticators on target macOS releases.
- **Real accounts:** qualify at least two representative IdP/RP login flows including popup/redirect, account recovery and MFA; do not store account secrets in probe artifacts.
- **Profile isolation:** verify credentials and login state for distinct persistent Aux Profiles and private windows with the finished native ProfileManager mapping. The CDP virtual authenticator in this script is intentionally ephemeral and cannot prove OS credential partitioning or restart persistence.
- **Signed distribution:** repeat on the signed, packaged build outside the checkout, including permissions and update/restart behavior.

This is protocol evidence for B8. It is not a claim that native or synced passkeys are ready for users.
