# Native platform and local authentication

Status: ready for independent lifecycle/auth implementation; CDP viewport extensions remain draft as marked below. Sources: N1, N2, N3 in `provenance-sp3.md`. Evidence is static artifact inspection, not a runtime observation of the target version. Aux-specific decisions come from the accepted plan.

## P1. Browser-owned lifecycle

The browser owns the bundled local daemon, agent extension, vault extension and helpers. Ordinary launch must not require Node on PATH. Bundle executable paths are resolved relative to the running app; never locate a reference installation. Browser startup waits until components exist and the daemon health endpoint returns the expected service and bundle version before opening normal extension-backed windows.

Use daemon origin `http://127.0.0.1:21520`. Health checks run at 250 ms during activation. On unexpected daemon death, schedule restart after 500 ms. These timings are plan requirements; the exact reference backoff schedule is not independently recovered. A successful activation verifies the reported version against the installed bundle. A process that starts but never becomes healthy follows timeout recovery rather than counting as activated.

On browser exit or replacement: request authenticated `POST /shutdown`, wait for termination, then force-kill only a PID whose executable path has been freshly verified beneath the expected daemon bundle directory. An unreadable or mismatched executable must not be killed. Never reuse an old PID without verification. Once replacement is ready, launch the pending bundle, health-check it and verify its version before announcing readiness. Shutdown deadlines are Aux implementation choices and must be documented with the code; do not claim an unobserved reference value.

Local components are bundled directly rather than downloaded from a cloud component updater. Non-component Chromium and ad hoc packaging are requirements for final acceptance. Development uses disposable homes/profiles and mock Keychain.

## P2. Daemon authorization

A browser client first requests `GET /auth/daemon/challenge?clientKind=chromium`. HTTP 200 and a JSON object with nonempty string `challengeId` and `challenge` are required. Malformed JSON, network errors, missing fields and unsuccessful HTTP responses leave the client unauthorized.

The browser signs the challenge with its installation credential, domain-separated with `Aux Daemon Auth v1\0`, then sends JSON `{challengeId, signedChallenge}` to `POST /auth/daemon/session`. A successful response contains `token_type: "AuxDaemonSessionToken"`, a nonempty `access_token` and positive `expiresInSeconds`. Reject other token types, empty tokens and nonpositive expiries. Store the credential in memory as authorization scheme `AuxDaemonSessionToken` plus its opaque token. Refresh before expiry; discard cached authorization on rejection.

Authenticated requests send that Authorization value and `Content-Type: application/json` for JSON bodies. Do not expose installation keys, session tokens, signatures or model credentials in logs. Browser extension account signing uses the same installation authority, not an extension-generated substitute. Missing installation keys are an actionable setup error, not permission to fall back to an unauthenticated session.

Reference evidence establishes a domain-separated installation signer but does not prove the full key serialization/signature algorithm in this inspection. The daemon and browser must agree through the contracts spec; use an independently designed, audited standard implementation and mark cross-language auth verification as required acceptance evidence.

## P3. Profile binding and startup gate

Bind local account identity to a Chromium profile through authenticated `POST /accounts/profile-binding`; remove bindings through `POST /accounts/profile-binding/delete`. The browser supplies the profile index and canonical profile path; the daemon owns durable account bindings. Renaming a profile must not create another local account. Deleting a profile removes only its binding after validating the profile identity.

The account-state reader consumes local state for profile bindings, account completeness, security setup and auth state. It does blocking file I/O away from the UI thread, tolerates an incomplete atomic rewrite and refreshes when account state changes. It must not display a normal browsing window while its bound local account requires the password bootstrap gate.

The bootstrap window displays the independently built onboarding/unlock route. It hides ordinary windows while setup/unlock is required, closes stale bootstrap WebContents after extension reload, and opens a fresh ordinary browser once setup completes. Closed/stale callbacks must use weak ownership. The local account is auto-minted; cloud sign-in, sync token acquisition and cloud passphrases are hidden/unsupported in this phase.

Account-state exact disk JSON shape and binding response shape are coordinated with SP1, not inferred from field names here. The observable gate transitions are ready; byte-level persistence is draft until SP1 publishes it.

## P4. Secure CDP

Listen on loopback port 45203. Implement auth inside the native DevTools HTTP handler; there is no production JavaScript CDP proxy. Reject non-loopback remote connections and Host headers that do not denote localhost or a loopback IP, including attacker-controlled DNS hostnames. Parse host and port correctly, including bracketed IPv6. An Origin check supplements rather than replaces local authorization.

`GET /json/challenge` returns a short-lived challenge object. `POST /json/auth/session` accepts `{challengeId, signedChallenge}` and returns `{token_type, access_token, expiresInSeconds}` with token type `AuxSessionToken`. Missing fields, malformed bodies and invalid or expired challenges fail. A used challenge cannot mint another session. Protected `/json` discovery/target-management endpoints and `/devtools/` WebSocket upgrades require the session Authorization scheme. Do not let alternate endpoint spellings, query strings or upgrade routing bypass checks. Tokens expire and are scoped to this running browser authority.

`Browser.ensureProfile` creates or resolves an explicitly requested disposable browser profile and reports its identity; existing-profile selection must respect bindings and locks. The exact command parameter/result shape is coordinated with daemon contracts. `Aux.waitForDownload` resolves a completed download or reports interruption/timeout; never resolve merely because a download started. Standard target discovery, activation, closure and browser/version metadata continue to use upstream CDP behavior after authorization.

Draft: the reference contains an AI-tab viewport domain limited to top-level targets with an associated WebContents. Calls on child targets or detached targets must fail. Exact methods and payloads need additional source evidence; do not fabricate an API or claim parity from standard Emulation methods alone.

## P5. Extension installation and new tabs

Allowlist the newly generated agent/vault extension IDs for each private API. Ordinary third-party extensions and web pages cannot acquire those capabilities by naming a permission. Load the independent component extensions from the app bundle. Register the new-tab override before initial normal navigation, avoiding a first-window flash of the upstream new-tab page.

Prerender the extension new-tab page when its preference is enabled and resources are ready. Invalidated profiles, extension reloads and shutdown cancel stale prerenders. Disabling the preference must prevent speculative page creation. Activation preserves normal navigation/focus semantics; prerendering is not evidence that the user opened a tab.

## Acceptance evidence

Launch packaged `Aux.app` with Node absent from PATH and a disposable home; verify version-gated daemon readiness, authenticated extension bridge, first-tab override and clean shutdown. Restart after an owned daemon crash. Reject missing/expired/foreign CDP tokens and untrusted Host values. Verify a freshly created profile binds, gates setup once, and reopens unlocked. No runtime acceptance was performed by this spec lane.
