# Minimal Aux runtime capture → scoped owner → actual Node-API8

This inactive composition uses only the Aux-v2 runtime target-capture type, native finite credential policy, owned lifetime registry and real Node-API8 attach adapter. It excludes external migration/candidate/journal/stage readers and their historical wrapping labels from the compiled graph. It changes no UI, assets, pipeline, package, accepted-state gate, signing, owner state or actual Security record.

## Narrow production declarations

`AuxOwnedCommandDispatcher(runtimeCaptured:)` accepts only the private-constructed `AuxRuntimeCapturedCommandContext`. `ScopedAuxCommandContext.runtime(terminal:policy:boundary:)` accepts that same typed context, derives its four fixed target selectors from its immutable selection, uses the same scope/group and builds the credential core itself with the explicit finite native policy. There is no arbitrary-core initializer, caller-supplied prebuilt foreign credential core, JS handle/scope factory or Boolean admission override.

The runtime scoped factory hashes both the exact four selectors and the complete public runtime selection: scope, generation ID, group, scheme, signing/KEM public bytes and all four target hashes. It records runtime generation/selection evidence separately. `transactionId`, `journalSha256` and `securityReviewSha256` are **nil** for this mode; a runtime selection is not misrepresented as a migration transaction or durable journal receipt. Other existing modes retain their actual transaction/journal fields. Admission evidence remains false.

`AUX_MINIMAL_RUNTIME_DISPATCH` is a declaration/source-composition flag. It selects runtime owner constructors and excludes captured-terminal/migration factories and their type dependencies. `AUX_SCOPED_SECURE_STORE_DISPATCH` adds the already reviewed optional per-instance credential route. Neither flag provides host authority or startup acceptance. The recovered-fresh flag is deliberately absent in this minimal graph. Original installation dispatch semantics and separate PDF/OS routing remain unchanged.

## Distinct actual minimal graph check

```
sh docs/integration/proposed/aux-minimal-owned-node/check.sh
```

The explicit build list contains the eight shared crypto/core files, runtime target capture, secure-store core, scoped context and lifetime registry, plus a **fixture-only** producer/module initializer. It contains no external migration preparation, original/legacy envelope reader, journal/store/coordinator, old interposer, provided addon or original C ABI export. The build compiles actual Security adapter source but never invokes it.

The fixture constructs fixed synthetic software P256 signing/KEM authority, actual Aux-v2 wrapped root and four captured row bytes. It hashes those rows into the actual runtime selection, calls the real private runtime-context validator, pairs the exact scope/group with a finite native credential policy, and creates the real owned instance. A changed captured signing row is rejected; the narrow direct runtime owner also returns a real installed status. No installation authority is discovered, created from real state or recovered from a fabricated receipt.

All compiler invocations run under `scripts/native-build.py` and `/tmp/aux-build.lock` against frozen Node headers. Frozen Node loads the linked actual `.node` under sanitized disposable HOME/TMPDIR. The shared39 checks cover genuine software installation signing/root plus credential failure/race/refusal, owned-result/NAPI behavior, GC and worker cleanup. The old default24 lifetime checks were **not repeated** in this slice.

After Node exits, the check reads the actual compiled Mach-O bytes and rejects any case-insensitive occurrence of the old product-brand substring. It passed with **zero occurrences**. `evidence/build-check.json` records the actual observed artifact SHA and limits. Temporary fixture outputs are deleted; the receipt is historical check evidence, not a shipped app receipt or a claim that other runtime inputs are brand-clean.

## Remaining boundary

No production module initializer or actual trusted host producer is added. A clean host must still establish exact signer/group/provisioning, selected installation ownership, all-writer admission/custody and live exact Security capture. Crypto's clean-host result can supply its typed runtime context to the same factory later; a checksum/context alone grants none of those permissions. Finite real account/MCP/session key-policy construction and explicit copy-only migration of existing credentials remain separate. UI fidelity and all existing accepted app bytes stay untouched.
