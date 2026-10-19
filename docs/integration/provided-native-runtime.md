# Supplied daemon / native lifecycle adaptation

2026-10-19. Proposed source changes only. The live/shared Chromium checkout was not edited, compiled or launched. `native-provided-supervisor.patch` and `native-provided-profile-security.patch` are staged under `docs/integration/proposed/`; adjacent JSON pins original native inputs and proposed output SHA-256. Full proposed files are under `proposed/native/` for review. Apply `native-provided-entrypoints.patch` first, then profile-security, then supervisor. All three apply in order to disposable source copies with matching proposed output hashes.

## Exact daemon contract evidence

`provided-supervisor-contract-anchors.json` records unique code anchors and byte offsets from the original installed1.26.1016.1852 SEA. Binary SHA-256 is `60d3c50a649a528927137c427d284e695a98162476d28065bb9634e937fed286`; embedded code SHA-256 is `5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5`. Reproduce with `node vendor/provided/audit-supervisor.mjs <pinned-static-daemon-executable>`. This extracts text and does not execute/import daemon code or use an owner daemon.

| Boundary | Actual supplied contract after matching Aux identity rewrite | Current native / proposal |
| --- | --- | --- |
| GET /health | `{service:'aux-daemon',version:'1.26.1016.1852',pid,host,port,ready,status:'running'|'idle',startedAt,runningSessionCount,semaphore}`. `ready` comes from actual server readiness. | Existing native service/ready/owned-child PID checks match. Change exact expected version only; retain remaining checks and no health PID adoption. |
| GET /auth/daemon/challenge?clientKind=chromium | `chromium` is explicitly in enum alongside agent-manager-extension/password-manager-extension/password-importer/internal-web/cli. Returns `{challengeId,challenge}`; random UUID+32 random bytes encoded standard base64; expires30s; max1024 pending. | Existing route/query/result parsing matches. No invented clientKind or challenge wrapper. |
| POST /auth/daemon/session | Plain JSON `{challengeId,signedChallenge}`. Challenge is deleted before verification (one-use). Signature verifies against original installation public identity and domain-prefixed raw challenge. | Existing route/body match. **Signing implementation remains blocked**, below. |
| Token | `{token_type:'AuxDaemonSessionToken',access_token,expiresInSeconds:86400}`. Authorization is `AuxDaemonSessionToken <JWT>`. | Existing response parsing/scheme/expiry refresh logic matches after runtime identity rewrite. Do not log token. |
| POST /shutdown | Actual authenticated shutdown handler invokes `requestShutdown` and returns `{status:'shutting_down'}`. Body is unused; native `{}` is valid. | Keep real shutdown request and verified owned-child fallback termination. Never contact/take over installed Aside or adopt arbitrary PID. |
| Bundle paths | Root packages actual aux-daemon app and original UI entries under current Resources/aux layout. | Current native daemon/app/extension path layout can remain if root mirrors it. Fallback Node is still opt-in and bundle-contained. |

This is more than a version substitution: every route, clientKind, body, response shape and token field above was checked against the pinned source. It does not establish native crypto eligibility or actual packaged runtime acceptance.

## Environment and immutable runtime boundaries

The staged supervisor sets `AUX_AGENT_RUNTIME_DIR=<Resources/aux>/agent-runtime`, supported by the matching runtime lane's explicit count-checked override; previously the supplied daemon resolved agent runtime under its state home. It also sets `AUX_COMPUTER_USE_SOURCE_APP=<Resources/aux>/apps/computer-use/Aux Computer Use.app`, the supplied helper source-app override. Root must provide matching actual package contents. Existing imported helper binary env variables may remain for other adapters, but are not proof that the supplied helper consumes them.

The independent `AUX_EMBEDDING_MODEL_DIR=apps/memory/models/minilm` is removed: it is not read by the supplied compiled daemon. Compiled supplied memory ignores its source-mode `AUX_MEMORY_MODEL_DIR`; real caches are `$AUX_HOME/memory-catalog.json`, `$AUX_HOME/models/`, `$AUX_HOME/memory-runtimes/`. Root will seed the pinned catalog/models/memory-runtimes from bundled immutable files into Aux home before launch. The final native bootstrap must preserve valid existing Aux caches and must never copy user data. No invented read-only override is required; merely setting the old env is not a solution. No model/cache download was performed here.

## Original native installation identity is mandatory

The supplied daemon can use native installation schemes including p256_v1 and pq_v1; it calls original native installation/get-public-keys/sign operations and verifies that actual identity. The independent browser PEM signer is **not** established as compatible with the preserved native installation identity. This proposal does not replace, reinterpret or create a hybrid identity. Existing calls to `SignDaemonChallenge` remain untouched but blocked for reused-stack acceptance.

Root/runtime lane are preparing the original `.node` native crypto behind a narrowly isolated Aux Keychain identity boundary and a self-contained bridge carrier. Supervisor/auxAccount challenge signing must use that carrier once its exact contract is ready. Do not apply or launch this proposal as a claim that PEM keys authorize the supplied original native installation. No Keychain material or OS grants were accessed.

## Concrete profile state proposal

- Read actual owner-only0600 atomic `accounts.json`, version1, without following file symlinks. Supplied registry uses0600 temp-file+fsync+rename, so existing file safety checks remain compatible.
- Resolve `profileAccountBindings[actualNativeProfileId]` and validate the stored profileId/path/accountId against the actual registered Chromium profile. Read the referenced actual account row. Do not confuse cloud `profileBindings`, a different object, with local binding.
- `onboardingCompletedAt` is string|null, not a numeric timestamp. No synthetic `security-state.json`, masterkey-file inference or credential reads.
- Bind through real authenticated POST `/trpc/accounts.ensureProfileAccount`, plain JSON `{profileId,chromiumProfileId,profilePath,profileIndex,bindingVersion:1,localOnly:true}`. This is default-transformer tRPC, with response `result.data` directly the account row. Original `/accounts/profile-binding` is the separate cloud bindProfile contract requiring `userId` and writes cloud profileBindings; independent native was sending an incompatible local payload. Replace that local call with ensureProfileAccount instead of inventing a userId.
- Context supplies actual `chromiumProfileId`, `bindingVersion:1`, `localOnly` and bound account/user identity derived from real account metadata. Missing strict-binding method/event remain optional as in the pinned UI; no methods are fabricated.

### Genuine local-account gate, separate from hosted onboarding

The supplied registry creates real `mode:'local',provider:'anonymous'` accounts. It does **not** prove local onboarding through `localBootstraps.isComplete`: that field's observed setter is cloud/user-bound. Actual `accounts.auth.completeOnboarding` calls a hosted endpoint; no successful cloud completion can be synthesized.

The proposed native eligibility rule exempts **only the actual referenced anonymous/local account** from a cloud timestamp requirement. It still requires actual initialized/unlocked Vault state and no outstanding required password verification. This is an explicit local native gate policy requested for Aux integration, not evidence that original cloud onboarding ran; it changes no registry/UI account field. Cloud accounts continue to require an actual nonempty onboardingCompletedAt. The exact original native local gate remains unverified and must be compared during reused-stack acceptance.

### Real Vault status request

New staged `FetchProfileSecurity` reads metadata on a worker, then requests authenticated loopback GET `/trpc/passwordManager.auth.status?input=<URLencoded plain {accountId:N}>`, accepts only HTTP200 bounded64KiB within2s with redirects/cookies disabled, and parses actual `result.data` booleans `isInitialized`, `isLocked`, `requiresPasswordVerification`. It uses the supplied default `app-account:N` scope, **not** a guessed native-profile-specific Vault. Runtime lane confirms chromium tokens are permitted by this procedure. The response has no owner IDs, so the client controls account input and rereads exact profile/account/user binding after the asynchronous request. Token changes invalidate the caller's result. Errors remain locked.

The status procedure may initialize/migrate the selected own Vault metadata or reconcile its settings. It is not represented as an entirely side-effect-free read. No status query was issued in this slice.

Profile gate, getProfileContext/getProfiles/openProfileRoute and mini-popup status consumers are migrated to that async path in the staged patch. Cross-profile open verifies only the selected target's fresh state, actual profile pointer/path and ordinary mode; locked routes are limited to actual Aux auth/onboarding main entry or actual Vault popup. No external open is granted for a locked profile. Weak profile/generation checks discard torn-down UI responses.

The old synchronous metadata reader intentionally returns configured=false/locked=true until actual status is fetched. Independent passkey broker sync readers remain fail-closed and unported; its unsupported supplied-Vault consent route is already a separate blocker. It must be adapted to the actual supplied passkey implementation rather than obtaining fabricated unlocked state. The staged metadata probe is disposable-only and updated for real map-shaped registry/local/cloud cases; it has **not been compiled/run**.

## Remaining acceptance

Source patches are not native compile or runtime evidence. After root finishes the active build and implements original-native signing: review/apply, run GN/focused compile under the build lock, exercise disposable actual daemon installation and registry transitions, verify local anonymous/real Vault lock/unlock and stale-binding rejection, then observe the original entrypoints. Missing Blink/capture/launch capabilities and true original native local-window semantics remain separately tracked. No owner state/profile, credential, Keychain, grant or network request was used by this static slice.
