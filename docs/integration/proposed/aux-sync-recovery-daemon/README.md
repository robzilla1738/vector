# Actual daemon recovery integration successor

This implements source wiring, not an admission or activated app receipt. No UI/CSS/assets are changed. No daemon entry, native addon, Security/Keychain or network is executed by this proposal. Backend recovery has separate real deployment evidence; that does not prove this desktop path.

## Exact composition

Input is the two reviewed **development crypto entries after CAS5**: SEA `1c388767d30a37ce2759ef6750636526cd9a5c504704bdfd673c6b191ba3e396`, Node `40259e646d95cc81f14ecf419ce1226b009bec0aaa07a206a4d8fddb45b60101`. `source/adapt.mjs` exports `adaptAuxSyncRecoveryDaemon(code,{kind:'sea'|'node'})`; it accepts only those hashes and checks three count-one edits plus one preload anchor. Root composes this **after CAS5 and before OS8**. Recovery edits do not overlap OS8 anchors. Other variants must receive reviewed full projections before use; no wildcard hash acceptance.

The exact added preload is the same in both modes:

```js
const {AuxSyncRecoveryClient}=await import(new URL("aux-sync-recovery.mjs",__auxCryptoBaseURL));
```

It follows the existing live-DK import using the existing fixed `__auxCryptoBaseURL`. The unchanged unconditional cold refusal remains first; no static nonbuiltin import is added. `source-pins.json` contains both full preload find/replace anchors and final entry hashes. Root must extend its contiguous guard/preload identity assertion and provenance, not strip the guard.

`source/materialize-desktop.mjs` exports async `materializeSyncRecoveryDesktop()` returning **one** fixed `aux-sync-recovery.mjs` byte buffer, SHA256 and mode0644; it never writes/loads an app. Copy the identical output under `Resources/aux-crypto/` and Node's sibling `aux-crypto/`. `bundle.dependencies` pins all98 source/notice inputs and the exact existing esbuild version. The Zod MIT notice is retained, imports are bundled, and only builtin imports remain. This successor class is derived from the previous pinned desktop client; its only new behavior is authenticated enrollment-head lookup and retention of that exact context when preparing the enrollment.

## Actual boundaries reused

`source-evidence.json` contains exact extracted current source contracts:

- `signCdpChallenge(bytes)` calls `runMacInstallHelper('cdp-sign',{challenge:toBase64(bytes)}).signature` and decodes it. The bridge calls that helper directly, **not** the separate32-byte-only `signInstallationChallenge` wrapper and not an invented native signature method. It does not hash the challenge again or initialize/reset installation authority. Native P256 produces its existing SHA256/DER signature; backend verification is separately proven. Other installation schemes retain the existing helper route and their explicit coverage limits.
- `fetchAuxAPIAuthenticatedJson(account,path,{method:'POST',body,timeoutMs:20000,output})` is the actual JSON serialization/error/refresh path. The plain authenticated API helper has a different request contract and is not substituted. Existing root-level paths and the server's native-URL normalization remain intact. The client validates challenge/envelope/receipt fields after JSON transport.
- Existing normalizer wraps a backend `{error:{code,message}}` body inside `AuxApiError.details.error.error`; its default `getErrorCode` does not inspect that additional level. Only the specific typed `AuxApiError`, status409 and exact nested `RECOVERY_NOT_CONFIGURED` permit revision0. Unknown errors never mean absent recovery state. No shared global normalizer change is made.
- Context uses actual signed-in AccountRegistry ownership and access-token generation metadata. Metadata is not independent JWT authentication or native authority proof: existing authenticated requests verify remote admission; the actual CAS publisher rechecks fixed-home persisted context. Local key reads require `usable_owned` in the same generation; ownerless/mismatched/generation-old material is preserved and refused for explicit migration.
- Publication calls the actual CAS5 `publishAuxRecoveredCsk`, which invokes `csk-publish-absent-or-same` on the actual owned binding. No generic key setter or read-then-write emulation is used. Runtime capability/admission remain prerequisites; captured fixture responses do not establish them.

## Mutations and user confirmation

`accounts.auth.recoverSyncKey({accountId,recoveryEntropyB64})` keeps its name/input and now invokes the paired Aux-v2 reader and atomic publisher. It does not interpret old AUK recovery backups. Even if server Sync status is ready, explicit recovery can restore an absent local key; this corrects the old server-ready early return, which could leave the local key missing.

`accounts.auth.enrollSyncKeyRecovery` retains its name and accepts optional `recoveryEntropyB64`. **Existing UI sends only accountId and receives a setup-required error before requests or native calls.** No key is generated, no status is falsely promoted to `canEnroll`, and no unseen recovery secret is enrolled. Supplying entropy is an input contract, not proof the user actually saved it: wiring the real saved/verified12-word confirmation flow remains required. Current UI is untouched.

With explicit confirmed entropy, the client authenticates current encrypted material to obtain the expected recovery revision. Only the exact not-configured error selects first revision. Owner/generation fences cover awaits and head-to-preparation transition. A local per-account record retains only the non-secret encrypted/signed prepared request and entropy hash for lost-response retry; raw CSK/entropy are not cached. Same-context concurrent requests share the operation; changed context/entropy refuses while in flight. Successful publication removes the record. Explicit expired-challenge/state-changed errors discard it so a later intentional retry can prepare against current state; network errors retain the exact request for idempotent retry. This map is not cross-process custody, durable recovery or an authorization grant.

## Lean verification and limits

`tests/check.mts` executes the extracted **actual** helper bodies and new bridge with captured JSON transport/native response/publisher status. It checks exact signature/base64 ABI, JSON POST/authorization, no-entropy/no-IO refusal, the nested not-configured error, exact lost-reply retry, account change during material await, native publication conflict preserving a later local key, and refusal of unknown material errors. No backend/crypto suite is repeated; no original addon, real native CAS, DB or endpoint is called. The previous actual native CAS and real deployed backend fixtures remain separate evidence.

`verify.mjs <CAS5-SEA-source> <CAS5-Node-source>` checks dependencies, final hashes, unchanged first refusal, fixed preload order, full module parsing and builtin-only static imports. It parses but never evaluates a complete entry or the generated asset. Targeted TypeScript checks cover this successor and focused fixture. Root still owns staging, packaging, real native host admission, protected activation and disposable app/UI observation. Confirmed enrollment UI remains incomplete.
