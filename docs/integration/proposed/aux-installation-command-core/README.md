# Inactive Aux installation command core

`source/AuxInstallationCommandCore.swift` implements a real string-in/string-out JSON dispatcher around the recovered existing-authority P256/PQ ports. It is **not integrated into any app, addon, carrier or package**. No owner data, Keychain, original addon, enclave/PQ runtime, signing or network operation was used.

Each `AuxInstallationCommandCore(context:)` owns an immutable explicit context. No input, authority selection or current-installation registry is process-global. A ready context is constructed only by importing supplied existing signing/KEM representations, checking both expected public keys, parsing an explicit Aux-v2 envelope and successfully authenticating/decrypting its 32-byte root. Those checks establish internal consistency, **not provenance, storage admission or permission to access an installation**.

The default context is unconfigured and refuses. Explicit absent and unavailable are different coordinator assertions. The core performs no storage reads from which to infer absence, and has no key factories or destructive writes.

| Command | Behavior |
| --- | --- |
| `install-status` / `keys-status` | `{installed:true,scheme}` for validated captured context; `{installed:false}` only for explicit absent; unavailable/unconfigured return errors. Preserves original status member; does not invent `keysInstalled`. |
| `get-public-keys` / `public-keys` | Existing `{scheme,sig,kem}`, base64 public bytes from imported key handles. |
| `install-init` / `init-keys` | Existing context returns `{scheme,sig_pub,kem_pub}` without generating authority. Explicit absent returns `Fresh installation coordinator is unavailable`; inaccessible/unconfigured remain errors. |
| `cdp-sign` | Strict one-member `{challenge:canonicalBase64}`; returns original `{signature:base64}`. P256 uses original DataProtocol signing and DER; PQ uses recovered MLDSA65 path. No extra application hash/context or universal 32-byte restriction. Empty challenge is rejected at this bounded API. |
| `dk-unwrap` | Reopens only explicit `aux.wrap.dk.v2`, returns `{dk:base64}` for a 32-byte authenticated root. |
| destroy aliases | Always explicit refusal until the real destruction coordinator exists; no fake success. |
| unknown | Bounded original-shaped `{"error":"Unknown command: ..."}`. |

Empty-input commands accept `""` or an empty JSON object. All JSON is bounded to16KiB and duplicate decoded keys are rejected by the pinned parser. Unexpected members, wrong types and noncanonical base64 fail. Native/import/crypto failures emit a fixed error, not potentially sensitive exception descriptions. JSON output uses sorted keys; member semantics follow the actual original consumers, not original key iteration order.

## Production versus external migration code

The explicit Aux-v2 parser constructs typed records directly and **never calls** the generic legacy-capable `init(json:)` envelope readers. `check.sh` lists the precise dependencies; neither `LegacyNativeEnvelopeReader.swift` nor `LegacyNativePqEnvelopeReader.swift` is compiled. No original wrapping-domain string is part of this core/dependency list. Shared record types still describe the historical version enum and schemes; the public command factory accepts only Aux-v2 format/scheme and the reader checks `.auxV2` again. External legacy capture/decrypt/migration remains a separate prerequisite, never a production fallback.

P256 uses the recovered ECDH→HKDF-SHA256 (empty salt, Aux-v2 context)→ChaChaPoly. PQ uses the recovered MLKEM decapsulation SymmetricKey directly for ChaChaPoly with Aux-v2 AAD; it does not invent P256-style HKDF or downgrade schemes. PQ and enclave imports compile but were **not executed**.

## Lean synthetic verification

Run `sh docs/integration/proposed/aux-installation-command-core/check.sh` from this worktree. It compiles the actual core and recovered dependencies for arm64/macOS13 using the installed SDK, then executes **software P256 only**. Fixed synthetic private scalars produce the same public keys used for actual signing and wrapping. Checks cover status/init/public shape, DER verification, same32-byte root recovery, independent captured contexts without state bleed, strict duplicate/member/base64 handling, absent versus unavailable refusal, destroy refusal, legacy format rejection, public mismatch and authenticated ciphertext tamper rejection. No fake sign/open callback stands in for crypto.

## Precise integration gap

No C or NAPI shim is emitted in this slice. The original C ABI is synchronous `char* AuxNativeRun(const char*,const char*)` with caller-owned result freed by `AuxNativeFree`; NAPI8 `run` returns that JSON **string**. Those signatures have no context argument. Binding an actual context honestly requires the real Aux-only storage coordinator and writer admission lifecycle to import a coherent installation, associate its scope with the loaded module/carrier instance, retain it for the call and retire it safely. A global optional context or stub always-returning-refusal export would not solve that boundary and is deliberately absent.

Next: supply reviewed storage/admission coordinator; keep unavailable/partial state fail-closed; implement the separately source-backed fresh-only factory and durable four-row writes; pair C exports/NAPI8 wrapper/carrier loader/module pins; preserve separately used PDF/OS exports. This core supplies no startup bypass, migration receipt, Keychain executor or installed-authority acceptance.

The known CLI caller mismatch (`keys-status.keysInstalled`, hardcoded P256) remains a separate next slice. Mac should consume `installed` plus validated actual scheme and `get-public-keys`; Windows retains its generic contract. Registration must never initialize keys. No shipping JS transform changes here.
