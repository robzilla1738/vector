# ChatGPT connection lifecycle and account catalog successor

This source slice fixes the existing ChatGPT connection without changing UI, CSS, artwork, scopes, PKCE, callback origins, provider endpoints or paid-plan policy. It makes no provider requests and reads no real credentials. It does not claim a ChatGPT subscription grants access to a particular model.

## Implemented

- A verified sign-in that declines direct plan permission is retained locally. Provider presence, credential listing, authentication and model discovery all exclude this sign-in-only state. Reconnection uses the retained issued client mapping.
- Only documented terminal refresh codes from the actual refresh-token endpoint clear unusable tokens. Registration and verified subject remain available for reconnection. A 401, policy/region/eligibility 403, `invalid_client` or temporary 503 alone does not destroy the credential.
- HTTP failures retain bounded status, machine code, parameter, request ID and structural response shape. The safe metadata survives the existing OAuth completion error wrapper. Raw messages, descriptions, arbitrary property names, response bodies and request tokens are not rendered or logged. Response reads are capped at 1 MiB; oversize bodies retain status and an explicit structural classification.
- Account model cache is tied to the actual selected credential reader. An account/token/permission change invalidates the cached result and rejects an outstanding result for the prior credential. Actual selected live catalog membership determines access; an opaque access token is never decoded for entitlement and missing plan metadata no longer defaults to eligibility.
- A cancelled authorization ID cannot be reused until its actual in-flight operation settles. Existing serialized refresh, credential compare-and-swap, ID signature/nonce/account checks, cancellation and local-only storage remain in place.

The official current references are [errors and recovery](https://developers.openai.com/siwc/token-sharing-open-source/errors-and-recovery), [profiles and sessions](https://developers.openai.com/siwc/token-sharing-open-source/profiles-and-sessions), and [models and inference](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference). In particular, authorization and model eligibility are separate, terminal refresh failures require reconnection, and model discovery uses the selected token's public account catalog. Safe structural metadata preserves useful diagnostics while avoiding arbitrary provider text or credential leakage.

## Exact source and runtime pairing

`source-check.json` records the actual supplied executable and extracted SEA input pins, 33 count-one ChatGPT anchors in each complete source composition, generated source hashes, syntax checks and final repository source pins. Both aux-v1 state1 and state2 projections succeed; the state2 cold-entry refusal remains intact. Generated daemon text is parsed, never evaluated.

The repository shim baseline was SHA-256 `5fa0b56141c9fb515c6b5ff979340c0958bf3b9dd79fb60a7636357605e73ede`; the new baseline is `01d85d165984f4b1a19745e91d2cff5542d69c954fb30f72ea8786094cdf2f10`.

The existing native-lifetime stage also transforms this shim. Its historical full-output equality check cannot be applied unchanged to the new baseline. `source/transform.mjs` is the exact pinned successor: it replays the SAME four count-one anchors from the immutable `standard-profile-isolation/chatgpt-login/source/shim-anchors.json`, preserving the existing physical operation/transport/lock ownership. Its reviewed output is `source/aux-chatgpt.cjs`, SHA-256 `b08d0acbdaf61e28806fd40a3a364a679fe6df8923392eb6b83ff2395df6887a`. Do not replace the historical lifetime proposal/evidence or omit that stage.

The integration owner must regenerate the actual daemon ordinary/dormant source pair through the existing cumulative transforms, compile/package that pair and replace the fixed `Resources/native/aux-chatgpt.cjs` leaf with this lifetime-paired successor. Do not copy only the new shim into an old generated daemon: the credential-reader constructor and catalog eligibility consumers must move together. Existing bootstrap/seed/module/permission gates and package modes remain unchanged. No new runtime import is introduced by the shim; existing source provenance entries already pin the active patch and shim. If the new successor generator is consumed by the root pipeline, its own source, pins and retained anchor dependency must also be added to that pipeline's provenance inventory.

## Focused evidence and limits

- `provider-free.tap`: 17/17 pass, no failures or skips. Fetch is prohibited globally; every request is a fake supplied explicitly to a fixture. Tests cover safe errors, policy versus terminal rejection, all six terminal codes, declined plan permission, nonce/account/PKCE-related flow checks, cancellation, token rotation, account cache invalidation and existing public Responses constraints. Synthetic lock tests use private temporary state and the existing macOS lock utility, not an owner account or newly linked host fixture.
- `node check.mjs`: actual pinned supplied source composition and paired shim replay/syntax pass. It generates no product executable and executes no daemon.
- Real registration, login, consent, refresh, selected model catalog, inference, sign-out/revocation and end-to-end UI error presentation are pending actual-account checks. No eligibility or provider capability is invented to make those controls appear ready.
- The existing inherited-FD `/usr/bin/lockf` boundary remains explicitly marked descendant-unknown by the native-lifetime successor. That historical advanced drain limitation is not cleared by these source fixes. Whether the bounded ordinary runtime permits the credential lock flow must be established in the paired real app; no permission or task guard is bypassed here.
- No cloud settings, credentials, OS grants, signing, product lifecycle, UI layout or release actions were performed. Runtime acceptance is false in the source evidence.
