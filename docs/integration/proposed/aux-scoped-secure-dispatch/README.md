# Inactive same-installation secure-store capability in owned Node dispatch

This source-only composition routes the existing `secure-save`, `secure-read` and `secure-clear` JSON-string contract alongside the installation command core **inside one owned instance**. It adds no JS factory, selected scope, handle argument, key-policy setter, new module initializer, original interposer fallback, UI or package change. It does not authorize physical Security execution or reactivate the excluded password-manager product.

## Typed scope and policy binding

`ImmutableAuxLogicalKeyPolicy(allowedLogicalKeys:)` is an explicit finite native-only policy: nonempty, at most1024 exact UTF8 keys, each bounded512bytes and without NUL. It is immutable after construction. The only evidence field is its deterministic SHA over sorted exact UTF8 bytes; raw logical keys are not emitted in receipts. This is a concrete host policy, not proof that its keys have been authorized. JS keeps its supplied logical `key` command argument but cannot add it to the allowed set or change scope/group.

`ScopedAuxCommandContext` has a private constructor and only typed terminal factories:

- `existing(terminal,bindings:[InstallationRowBinding],policy,boundary)` authenticates the **entire exact original/target binding array** against the captured terminal's SHA. It derives a common `aux.<64hex>.` scope and explicit group from the actual reviewed targets; it does not invent a missing scope field or accept a Boolean.
- `capturedFresh(terminal,bindings:[FreshTargetBinding],policy,boundary)` checks the corresponding exact captured-fresh binding digest before deriving that same scope/group.
- `recoveredFresh(terminal,review:ReviewedFreshSecurityBoundary,policy,boundary)` additionally checks actual terminal scope, transaction ID, security-review SHA and target-binding SHA against that typed reviewed fresh boundary. It does not manufacture a lost cohort.

All four targets must have the same scope prefix on both service and account and the same explicit Aux-only ASCII group. The physical secure-store selectors are constructed by `ReviewedAuxSecureStoreScope` itself. A caller cannot pass in a prebuilt foreign secure-store core/review and have it accepted. Every fixed key's derived physical selector must be disjoint from installation targets, existing original authority selectors and, for recovered fresh mode, the exact secure-stage row. Thus even a terminal-bound but unsafe overlapping selector configuration is rejected before backend calls.

Evidence contains scope, transaction/checkpoint/binding digests, group digest, logical-policy digest and optional fresh security-review digest. `runtimeAdmissionVerified` remains false. Captured terminal evidence is not promoted to host authority or ownership.

## Owned router and default behavior

`AUX_SCOPED_SECURE_STORE_DISPATCH` is declaration/source composition only. It adds the concrete `AuxOwnedCommandDispatcher(scopedTerminal:)` overload and an optional secure-store core inside each private registry entry. Existing captured/recovered constructors set that optional capability to nil. The flag provides no startup acceptance, credentials, provisioning or runtime admission.

The C entrypoint still validates handle ownership before reading caller pointers, acquires the same entry lease/execution lock, decodes the same bounded input and produces the same owned JSON text result. Only the three exact secure-store command names go to the optional secure-store core. All other commands go to the original installation core. With no optional capability (or with the flag absent), the default path is unchanged. Retirement closes and drains both command families together; there is no separate unbounded current credential scope. Node-API callback data and result ownership are unchanged.

The actual `ActualAuxSecureStoreBoundary` source compiles but is never selected by this fixture. A real clean host must satisfy separately reviewed scope/group/entitlement/admission requirements. The original mapper/interposer removes/rejects different explicit groups and must **not** be bypassed or reused as a way to route these new exact Aux selectors. Existing protected credentials require explicit copy-only migration; missing new selectors do not imply old records vanished or permission to initialize/reset them.

## Actual `.node` fixture and lean checks

```
sh docs/integration/proposed/aux-scoped-secure-dispatch/check.sh
```

The installed SDK builds actual C++ Node-API8 plus Swift through `scripts/native-build.py` and the global native build lock, using frozen Node headers. Frozen Node loads the real linked addon under disposable HOME/TMPDIR. The fixture reuses real synthetic software installation authority, real private fresh journals and a restarted typed terminal, then supplies a captured in-memory credential backend under a finite native fixture policy. Signing and root unwrap remain real CryptoKit calls; no Security/Keychain, enclave, PQ, original addon or owner state executes.

The real addon passed **39 JS checks**: all18 installation/NAPI/lifetime/worker checks plus secure save/read/update/clear; missing versus blocked/invalid reads; write failure preserving prior data; Add race failure with exactly one update and one Add; denied key and duplicate JSON with zero backend calls; clear failure preserving data; exact clear and idempotent not-found clear. Native fixture assertions also exercise captured-fresh pairing, rejection of terminal-bound cross-group and authority/credential overlap, and rejection of a different fresh transaction review. No raw key, selector, handle or policy factory is exposed to JS. Only fixture counters are exposed in addition to `run`.

The default non-capability lifetime build separately passed its24 software/C ABI concurrency/retirement checks under the same serialized build wrapper. Actual secure-store query/core source compiled in the scoped fixture; physical Security operations:0. Existing no-authentication-UI SDK deprecation warnings remain unchanged.

## Remaining boundary

The production trusted host, finite account/session/MCP key-policy producer, all-writer custody, signer/provisioning approval, current row ownership, actual Security execution and explicit existing-record migration remain separate work/authorization. Root's minimal runtime-capture type can receive another narrow typed factory later; this composition does not pull legacy migration fallback into a production entrypoint. Original PDF/OS addon routes remain separate and untouched. No product-readiness or native activation claim is made.

## Narrow minimal runtime factory

With `AUX_MINIMAL_RUNTIME_DISPATCH`, external captured/migration factory declarations are excluded and `.runtime(terminal:AuxRuntimeCapturedCommandContext,policy:boundary:)` is available. It binds the exact selection's four fixed targets, scope/group, public authority and target hashes; records generation/selection digest; and leaves transaction/journal/security-review fields nil. Those fields are now optional specifically to avoid presenting a runtime selection as a durable migration receipt. Existing modes still fill their actual fields. The private constructor, immutable finite key policy, physical selector separation and admission-false evidence remain unchanged. Exact minimal compilation/Node/byte-scan evidence is in `aux-minimal-owned-node`.
