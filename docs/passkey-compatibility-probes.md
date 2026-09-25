# Virtual WebAuthn compatibility

`tests/smoke/chromium-webauthn-virtual.mjs` tests Chromium's WebAuthn protocol using a synthetic CTAP2 authenticator in a new disposable profile and a localhost relying party. It does not contact an account, platform authenticator, security key, password manager or synced passkey provider.

## Run

```sh
# Chrome for Testing control bundled with the Playwright dependency
node tests/smoke/chromium-webauthn-virtual.mjs

# Installed Chrome control, also with a new disposable profile
AUX_CONTROL_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  node tests/smoke/chromium-webauthn-virtual.mjs

# Compiled Aux proof candidate; use the exact executable from an isolated build
AUX_CANDIDATE_BIN='/absolute/path/to/out/AuxProof/Aux Host Proof.app/Contents/MacOS/Aux Host Proof' \
  node tests/smoke/chromium-webauthn-virtual.mjs
```

Each run creates and removes its own temporary `HOME`, user-data directory, and localhost server. The runner uses CDP `WebAuthn.enable`, `addVirtualAuthenticator`, `getCredentials`, `setUserVerified`, and `removeVirtualAuthenticator`. It verifies registration and assertion client data, exact origin and challenges, RP ID hashes, user-presence and user-verification flags, ES256 assertion signature, and a resident credential. An unrelated RP must fail with `SecurityError`; an authenticator whose UV state is off must fail a UV-required assertion with `NotAllowedError`.

## Results on September 25, 2026

| Browser | Version | Synthetic registration/assertion and signature | RP rejection | UV rejection | Resident credential |
| --- | --- | --- | --- | --- | --- |
| Compiled AuxProof candidate | 156.0.8074.0 | Pass | Pass | Pass | Pass |
| Installed Google Chrome control | 154.0.8037.58 | Pass | Pass | Pass | Pass |
| Chrome for Testing control | 153.0.8010.12 | Pass | Pass | Pass | Pass |

The run artifacts are local under `release/test-artifacts/`: `aux-candidate-webauthn-virtual.json`, `system-control-webauthn-virtual.json`, and `chrome-reference-webauthn-virtual.json`. A same-version independent Chrome 156 control was not installed; the two available controls are labeled by their real versions. No result is transferred from them to AuxProof. The stable-tag AuxDev executable, signed package and production Aux Profile integration must be run separately once their exact binaries are ready.

## Remaining gates

- **Platform passkeys:** exercise Touch ID, Apple Passwords/iCloud Keychain and synced credentials in the signed Aux bundle with its actual identity and entitlements. A virtual authenticator cannot prove any of these.
- **External security keys:** register and assert with supported physical USB/NFC/Bluetooth authenticators on target macOS releases.
- **Real accounts:** qualify at least two representative IdP/RP login flows including popup/redirect, account recovery and MFA; do not store account secrets in probe artifacts.
- **Profile isolation:** verify credentials and login state for distinct persistent Aux Profiles and private windows with the finished native ProfileManager mapping. The CDP virtual authenticator in this script is intentionally ephemeral and cannot prove OS credential partitioning or restart persistence.
- **Signed distribution:** repeat on the signed, packaged build outside the checkout, including permissions and update/restart behavior.

This is protocol evidence for B8. It is not a claim that native or synced passkeys are ready for users.
