# Inactive owned-instance Node-API8 adapter

`source/aux-owned-napi-adapter.cc` is an actual native attach factory for the owned context-bearing C dispatcher. **It contains no module initializer or JS factory.** A trusted native host must supply the exact immutable owned instance; JavaScript never supplies a handle, scope, key record or replacement core. This slice changes no app, packaging input, accepted-state gate, UI or original PDF/OS route.

## Exact producer and ownership contract

The host calls:

```c
napi_status AuxAttachOwnedDispatcher(napi_env env, napi_value target,
  uint64_t immutable_handle, void* retained_owner,
  AuxReleaseOwnedDispatcher release_owner);
```

`retained_owner` and its native nonthrowing release callback must identify **one transferred retain of the same instance as immutable_handle**. A valid nonnull ownership pair is consumed on every return, including attach failure. A null/invalid ownership pair is rejected without transfer because there is no callable ownership contract. The host must issue a distinct instance per attachment/environment; duplicate attachment of one handle is not a shared-owner protocol. Neither the adapter nor a numeric handle establishes host authentication.

The instance lives only in native callback data. Its handle and owner/release pair are constant after construction. Two explicit references cover the function finalizer and environment cleanup hook. Either path atomically closes once, invokes real registry retirement (closing new calls and draining acquired calls), and releases exactly the transferred owner retain. Each path independently drops its own callback-state reference. If function GC precedes environment cleanup, the cleanup reference retains only the already-closed small native state; authority is already retired/released. If cleanup comes first, the function finalizer later frees the remaining closed state. Attach failures retire/release immediately even when callbacks were already installed; later callbacks cannot release again. No NAPI operation occurs inside either finalizer/cleanup callback.

`run` holds a callback-state lease, validates bounded string arguments, calls the real internal ContextRun API and creates a JS **JSON string**. A native result has a single RAII owner using `AuxNativeResultFree`; copying succeeds or fails before that owner frees the result. It does not return a parsed JS object or a Promise. A null C result becomes an empty JS string, matching the pinned original NAPI MakeString branch; this does not reuse the carrier's separate null-result error contract. That fallback is verified statically in the actual conversion expression, without attempting unsafe allocation-failure injection. Missing command preserves the original `TypeError("run(command, input) requires a command")`; omitted input is empty string; extra arguments beyond the first two are ignored. Nonstring/oversized arguments explicitly throw TypeError rather than depending on the original unchecked ReadString malformed-type behavior. Embedded NUL reaches the internal strict input refusal; JSON command behavior remains the actual core's responsibility.

The `run` property uses ordinary original-style writable/enumerable/configurable attributes. Defining the own data property avoids invoking a target object's inherited setter. Only a native host-supplied target is supported; this is not a JS-callable `attach` API.

## Genuine fixture, separate from production

`tests/fixture-module.cc` is the **only standalone module initializer** in this proposal. Its native Swift producer constructs fixed synthetic software P256 material, traverses the actual fresh reducer and captured terminal-context constructor, retains `AuxOwnedCommandDispatcher` and supplies its handle/retain/release pair. No JSON selector, environment path, current installation or JS-supplied authority is used. The fixture also attempts one intentionally failed attachment before its successful attachment to check consumed-owner failure semantics. Fixture counters contain only counts, never private bytes/handles.

`check.sh` uses the frozen snapshot's Node headers and runtime. All C++/Swift compiler invocations run under `scripts/native-build.py` and `/tmp/aux-build.lock`. It loads the actual linked `.node` in the frozen Node executable with a disposable HOME/TMPDIR and sanitized environment, then deletes temporary outputs. No signing tool, owner profile, original addon, Keychain or OS grant runs. Security/PQ/SE types compile as dependencies; only fixed software CryptoKit operations execute. The inherited executor deprecation warning is unchanged.

The real fixture passed **18 checks**: exported API has no JS handle/factory; JSON string return; exact missing-command TypeError; strict type/size rejection; omitted input and extra-argument handling; exact synthetic root; real DER signature verified by Node against the same public key; native error envelope; duplicate JSON rejection; failed attach ownership; function garbage collection; worker-environment cleanup; and fresh worker instances after retirement. Created/released owner counts match exactly after GC and worker shutdown, so cleanup/finalizer order does not double-release. Native result copying/freeing executes through the actual RAII call path; it is not replaced with a JS mock.

Run:

```
sh docs/integration/proposed/aux-owned-napi-adapter/check.sh
```

## Remaining real host integration

The adapter does **not** supply the trusted host producer for actual installations. That producer must still enforce current native startup refusal, validate host/signer/group/provisioning, hold all participating writer admission/custody, capture exact reviewed rows, recover the correct durable existing/fresh journal and authenticate terminal readback before issuing a context. Context retirement must precede admission reopening. Captured evidence/provenance assertions are not promoted to authorization by attachment. Workers need their own authenticated owner association; a module filename alone is not sufficient.

There is deliberately no production `NAPI_MODULE(...)`, no fake always-refuse original Run export, no mutable globally selected scope, no JavaScript installation initializer and no compatibility fallback into legacy readers. The fixture's broad dependency list compiles external migration interfaces solely for synthetic context production; it is not a production source-selection recipe. Root must pair the eventual authenticated host and installation-only adapter while retaining existing PDF/OS bindings separately. Nothing here activates a native successor, migration or signed runtime.
