# Disposable real-browser RP acceptance

Run from the rebuilt workspace with Node22+:

```sh
node apps/daemon/src/passkeys/acceptance/server.mjs --report /tmp/aux-passkey-rp-report.json
```

The optional report file must not exist. Use a fresh path per run. The server
binds only IPv4 loopback, selects an available port, prints the exact RP URL and
holds fixture public keys/challenges only in memory. It does not inspect Aux
profiles, credentials, Keychain or daemon state, and never asks for the Vault
password. Enter only a newly created disposable Vault fixture password in the
actual Aux Vault consent window.

The RP is `http://localhost:<port>` with RP ID `localhost`. Loopback localhost is
a potentially trustworthy origin under [Secure Contexts §3.1](https://www.w3.org/TR/secure-contexts/#is-origin-trustworthy).
The page requires actual `isSecureContext` and native WebAuthn JSON methods;
failure blocks the run. No certificate exception, owner trust-store change,
virtual authenticator, API monkeypatch or fake credential response is used.
Registration/assertion checks follow [WebAuthn3](https://www.w3.org/TR/webauthn-3/).

Use the final linked Aux browser with a disposable browser profile and disposable
Aux home/account, a configured/unlocked fixture Vault, and completed onboarding.
Do not use an owner system passkey if the stock provider UI appears. Keep the
same server process and exact URL throughout all cases.

1. With case `normal`, register using **Aux Vault**, approve the precise RP and
   perform fresh fixture password verification. Register validates native
   client data, challenge, origin, RP hash, none attestation, AAGUID, COSE P-256,
   public-key DER, discoverability and exact UP/UV/AT flags. It does not claim
   key possession until a valid assertion is received.
2. Verify an assertion, repeat it, and require independent Node ES256 signature
   validation and a strictly increasing persisted counter. Restart the daemon
   and browser against these same disposable stores, then assert again at the
   same RP URL to verify persistence (the RP server must stay running).
3. Start fallback, choose **Other providers**, observe stock Chromium UI and
   cancel it. Record that observation. A NotAllowedError alone is insufficient.
4. Start timed abort, choose Aux and leave the Vault request open. At 15 seconds
   the real AbortController fires. Require AbortError at the RP and directly
   observe that the old Vault request can no longer complete. Record it.
5. Start navigation, choose Aux and leave the Vault request open. The RP
   navigates at 15 seconds, invalidates its challenge and records navigation.
   Directly verify the old Vault request is canceled. Record it. Navigation
   telemetry alone is not a native cancellation assertion.
6. Open this exact URL in a disposable private window. Set case `private`,
   register and assert. Close every private window, including Vault popup.
   Reopen a fresh private window at the same URL; keep case `private`, run the
   private-reopen action, choose Aux and require zero credential candidates.
   Cancel, record the manual no-candidate/closed-window observations, and verify
   the normal case still asserts in the ordinary window.

Download the report or retain the optional report file plus disposable-profile
UI screenshots. Reports distinguish cryptographic verification, expected DOM
errors, navigation telemetry and human observations. They never automatically
convert a cancellation into proof of fallback or private key deletion. No
browser acceptance result is prepopulated by the local verifier tests.

Focused harness validation:

```sh
node --test apps/daemon/src/passkeys/acceptance/verifier.test.mjs
```

These tests generate local fixture keys and exercise verifier/server rejection
boundaries; they do not count as native/browser acceptance. Retire the server
with its own foreground Ctrl-C when the run is complete. No native source edits
or full browser link are part of this harness slice.
