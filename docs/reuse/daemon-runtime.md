# Supplied daemon runtime adaptation

This slice adapts the owner's supplied daemon itself, not the earlier independent backend. It is not production-ready: the native binding, automatic skill writes and real local onboarding gates still need integration.

## Pinned input

Static source: `~/Library/Application Support/Aside/AsideDaemon/mac-arm64/1.26.1016.1852/Aside Daemon.app/Contents/MacOS/aside-daemon`.

- Binary SHA256: `60d3c50a649a528927137c427d284e695a98162476d28065bb9634e937fed286`.
- Embedded SEA code SHA256: `5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5`.
- QuickJS WASM: 503134 bytes, SHA256 `105c3bed22d457e43e3d1c3c1c6959fda62a8fe06f0fc8a985303c3a2be72232`.
- Photon WASM: 1881634 bytes, SHA256 `10468181565c56004c867f3a4af96f89a0ef5a63a72f2b5fb12c1f1992a3615c`.

The downloaded extracted daemon is a different hash/version carrier and is not substituted for this pinned installed package. Version remains `1.26.1016.1852`; native startup must compare that version rather than independent daemon `0.2.0`.

## Staging seam

`vendor/provided/daemon-adapter.mjs` exports `adaptDaemonBinary(originalBuffer)`, returning `{binary,codeSha256,applied,assets}`, and `nativeShimPath`. It checks both input hashes, applies 25 counted edit groups, preserves the original SEA assets/tail and checks every anchor. Root staging owns app copying, plist/executable/importer renaming, Aux icons and local ad hoc signing. It must not append the old daemon prelude, fake hosted API, bridge facade or plan bypass.

The adapter changes Aux environment prefixes, home, ports (21520/45203), app/extension identities, original auth audience/issuer/domains and fixed wire-prefix parsing offsets. It retains the actual account, engine, Vault, tRPC and persistence implementation. Original lowercase provider/schema enums remain unchanged. Telemetry is disabled. Hosted API/releases/sharing targets point to a deliberately unavailable loopback boundary; requests fail rather than receive invented success. A subsequent explicit local-service implementation is separate work.

## Native adapter: disposable tests only

`daemon-native.cjs` is explicitly gated by `AUX_PROVIDED_TEST_ADAPTER=1`. It is **not a faithful production substitute** for the supplied native crypto/storage. Its file-backed DK/KEM/AES storage proves only disposable auth boundary integration and must not be shipped as evidence of original security behavior. It never loads or forwards to the supplied native binding. Unsupported OS/PDF/destruction commands return errors.

The bridge uses browser-owned `$AUX_HOME/installation-private.pem` (P256 PKCS8, owner-only) and matching `installation-public.pem` (SPKI). This matches the supplied daemon's SHA256/DER P256 verifier over `Aux Daemon Auth v1\0` plus raw challenge. Disposable DK/KEM and encrypted fixture values stay under `installation-runtime/`; their format differs from the original native implementation. No owner Keychain read or target execution occurred.

Static strings in the actual supplied native binding include the fixed access group `8CPD4K4TBB.at.studio.AsideBrowser.cryptography`, PWM service/account labels and install command names. Strings alone do not establish call semantics, entitlement behavior or encryption layout. Faithful reuse requires focused native inspection and a reviewed Aux identity adaptation before any original native command is executed.

## Actual account and Vault contracts

The supplied daemon really defaults to numeric account 0, provider anonymous, mode local, authStatus active. This is its own behavior, not fabricated account JSON. `$AUX_HOME/accounts.json` uses `profileAccountBindings` for local account scope; `profileBindings` binds cloud users. The former maps profileId to `{profileId,accountId,profileIndex?,profilePath?,updatedAt}`. `accounts.resolveProfileAccount` returns the actual account row directly; bindingVersion 1 local context accepts chromiumProfileId/profileId/profilePath/profileIndex/localOnly.

`accounts.summary` returns `{currentAccountId,accounts:[...row,hasSession,profileBindings:[{profileId,profileIndex,profilePath,updatedAt}]]}`. Account rows carry `onboardingCompletedAt:string|null`.

`passwordManager.auth.status` accepts optional `{accountId:number,pwmAccountId?:UUID,profileId?:string}` and returns `{isInitialized,isLocked,expiresAt,accountPasswordExposure,requiresPasswordVerification}`. The default profile scope is `app-account:<numericAccountId>`. `$AUX_HOME/password-manager/accounts.json` stores the separate Vault UUID accounts/connections; actual Vault files live under `password-manager/accounts/<uuid>/`. There is no independent `security-state.json`; native consumers must use actual authenticated APIs rather than manufacture that summary.

## Genuine gates and side effects

- `accounts.auth.completeOnboarding` POSTs the hosted `/auth/onboarding/complete`, validates `{onboardingCompletedAt:string,saved:true}` then updates the account. It is not a local completion method. Local-only native gating needs an explicit integration decision.
- Original `accountHasAllowedPlan` and free-plan defaults remain intact. No max plan/staff bypass was added. Feature availability must be evaluated against actual local account semantics.
- Runtime installation fetches real release metadata. The integrator is separately reusing the supplied runtime; there is no fake install-complete response here.
- Startup calls `syncInstalledAsideBrowserSkills`, which can overwrite existing external agent skill files. Do not launch against the owner's HOME. Disposable probes must isolate HOME and agent config roots, or an explicit platform patch must remove automatic external writes.
- Startup prepares the computer-use helper runtime, context-awareness reconciliation and account bootstrap. These require isolated resources/settings and reviewed native boundaries before a real probe.

## Evidence

Focused Node tests use generated disposable P256 keys and verify raw public-key equality, signing/domain refusal, test secure-value ciphertext/tamper refusal, owner-only key rejection, production test-adapter refusal, unsupported native-command refusal, input pinning, exact auth parsing offsets and preserved real plan checks. The actual SEA binary rewrite succeeded in ignored lane output, preserving both WASM assets. This is static/staging and fixture evidence only: no daemon launch, model call, owner profile/credential/Keychain access or fidelity acceptance is claimed.

## Bundled runtime and automatic writes follow-up

The adapter now has 29 counted edits. `AUX_AGENT_RUNTIME_DIR` explicitly selects the supplied bundled agent runtime without redirecting it through the independent runtime. The original updater still runs and reports real metadata failure; no fake release/version response is added. Original `getAgentRuntimeStatusUnlocked` already reports a verified cached installation with `latestVersion:null` on metadata failure. `acquireAgentRuntimeUse` already permits that cache after installer failure when version.txt, required executable files and quarantine checks pass.

macOS required cached executable files are `bin/{node,npm,npx,python,python3,python3.13,pip,pip3,rg,pdfinfo,pdftoppm,pdftotext}`, `node/bin/node`, `python/venv/bin/python`, and `native/bin/{rg,pdfinfo,pdftoppm,pdftotext}`. The code checks actual regular executable files and parses version.txt; it does not accept a fabricated installed flag.

`AUX_COMPUTER_USE_SOURCE_APP` selects an explicit bundled Computer Use source app; executable name becomes `aux-computer-use`. The existing runtime-copy/update lifecycle remains unchanged. Startup external skill synchronization is opt-in with `AUX_ALLOW_EXTERNAL_SKILL_SYNC=1`, preventing unsolicited writes to owner agent directories. Explicit skill APIs remain the supplied implementation. This is an intentional local platform boundary, not a claimed unchanged behavior.

The compiled daemon ignores its development model-path environment variable. Its actual memory catalog/model/runtime caches remain `$AUX_HOME/memory-catalog.json`, `$AUX_HOME/models` and `$AUX_HOME/memory-runtimes`. Supplying those verified resources is integrator-owned.

### Skill and secure-storage identifiers

Additional counted identity edits change the six embedded `aside-browser` names to `aux-browser` (including skill directory/front matter and MCP client labels), five embedded guide command references, two CLI update command references and the embedded CLI presence check. No lowercase task/file/routine wire links or provider/schema fields are blanket-renamed. `AUX_KEYCHAIN_ID_PREFIX` becomes `aux`; production native scope mapping still needs carrier integration. The mapper does not substitute encrypted bytes or KEM behavior.

### Exact HTTP versus CDP signing inputs

The original daemon HTTP verifier consumes `Aux Daemon Auth v1\0` concatenated with a 32-byte random challenge. Original secure-CDP client behavior differs: `signInstallationChallenge` decodes the `/json/challenge` challenge, requires exactly 32 bytes, and passes those **raw 32 bytes** to native `cdp-sign`, without a domain prefix. Native CDP must use that original contract rather than reuse the independent HTTP-domain verifier.

For `p256_v1`, original daemon verification takes a raw 65-byte uncompressed point, constructs SPKI and verifies SHA256/DER ECDSA. For `pq_v1`, it takes a raw 1952-byte ML-DSA-65 public key, prepends SPKI DER `308207b2300b0609608648016503040312038207a100`, and uses `crypto.verify(null,message,key,signature)`. The native carrier passes caller bytes and original output unchanged; it adds no prefix or forced P256 downgrade. No real original signing has been executed.
