# Inactive instance-owned command lifetime and C ABI

This source-only slice implements the lifetime mechanism for a trusted in-process `CapturedTerminalCommandContext`. It does not authenticate a host, grant storage authority, create a current installation, activate a package or bypass the state2 refusal. No Security/Keychain call, owner data, signed helper, enclave/PQ operation, provider, UI or packaging change occurred.

## Implemented mechanism

`AuxOwnedCommandDispatcher(capturedTerminal:)` issues a process-local UInt64 handle for that exact immutable command core. The registry stores **distinct instances**, never a selected global scope. Issued IDs increase monotonically and are never reused; zero, foreign and retired IDs fail lookup before context access. An ID is not a pointer and is never passed to `Unmanaged.fromOpaque`. It is an internal lookup identifier, **not an authentication capability**; only a trusted host may obtain/transport it. Neither JSON input nor JS receives a constructor or scope-selection command.

Every operation acquires the registry entry while open and increments its active count under a condition lock. A separate per-instance execution lock serializes calls on the imported authority. The call retains its entry, executes outside the registry lock, copies JSON output into its result buffer and releases the lease. Distinct contexts remain independent.

Explicit retirement closes admission under the same registry lock, waits for all acquired operations (including queued ones), then removes the entry. New calls see retiring/invalid, not another scope. A reentrant same-thread retire returns `-2` rather than waiting on itself; recursive acquisition of the same instance also refuses. Owner destruction closes admission without waiting on its own lease; the last release removes the entry. Retired handles cannot acquire a successor even if another instance is later created. No arbitrary process signals or global default context exist.

## Actual internal C boundary

`source/aux-owned-command-dispatcher.h` is compiled by the C fixture and linked to the real Swift `@_cdecl` functions:

```c
char* AuxNativeContextRun(uint64_t handle,
  const uint8_t* command, intptr_t command_length,
  const uint8_t* input, intptr_t input_length);
void AuxNativeResultFree(char* result);
int32_t AuxNativeContextRetire(uint64_t handle);
```

Run returns owned NUL-terminated UTF-8 **JSON text**. The caller must copy it and free exactly once using ResultFree; null is possible on allocation failure. Only result pointers issued by Run (or null) may be passed to Free—ordinary C ownership rules apply. Input pointers for a valid owned handle must identify readable buffers for their lengths; the ABI cannot validate arbitrary process addresses. It bounds lengths, rejects malformed UTF-8/embedded NUL and checks the handle **before reading input buffers**. Invalid-handle tests deliberately pass unreadable input pointers to establish that ordering. Empty input remains empty string; command parsing/response shape stays with the real command core.

The context parameter is deliberate. This is **not** an always-refusing fake original `AuxNativeRun(command,input)` export or an untrusted mutable global current-installation shim. There is no C context-construction API: only the trusted Swift producer can install a captured terminal core. The C test receives a real synthetic owner handle created through that path.

## NAPI and admission remain unimplemented

No NAPI module initialization is added because the real trusted host-to-module context association is still absent. The eventual Node-API8 adapter must receive an owned instance from that authenticated host, retain it as callback/module-instance data, call ContextRun, create a JS string from the returned bytes, and free the result exactly once. Missing command must retain the original TypeError and omitted second argument must become empty string. JS must not supply an arbitrary handle, scope, record JSON or context replacement. Workers require their own authenticated instance association; merely loading a module path is not authority.

Before any live context is issued, the host still needs actual writer admission/custody, reviewed explicit storage capture, current signer/group/provisioning validation and terminal durable receipt/readback binding. Existing/fresh external migration tools remain separate and inactive. This process registry establishes none of those properties. Captured terminal evidence still reports provenance/admission false; the lifetime owner does not promote it to authorization.

Original PDF and OS helper routes are untouched. This new installation-only internal ABI must be paired with its future carrier/NAPI consumers and packaging pins before use; it does not remove the existing combined module or claim a complete native replacement.

## Lean check

```
sh docs/integration/proposed/aux-owned-dispatch-lifetime/check.sh
```

The installed Apple SDK compiles the actual C header/caller and Swift mechanism for arm64/macOS13, links them, and passes **24 checks**. Fixed synthetic software authority goes through the actual fresh reducer and terminal context constructor. Checks cover separate exact roots, C-owned JSON/result freeing, invalid/retired handles, invalid-handle-before-pointer ordering, malformed UTF-8/lengths, reentrant refusal, active-operation drain, retiring admission, independent instances, nonreused handles, and owner destruction during a lease. Bounded semaphore gates make retirement overlap a real acquired operation rather than relying on timing of crypto. No Security, physical store or NAPI operation runs; SDK compilation emits the existing unrelated no-authentication-UI deprecation warning without changing that reviewed executor.

The build dependency list includes external legacy migration types only to compile existing terminal binder interfaces; this fixture is not a production packaging recipe. Production installation module inputs and legacy-tool separation still require the integrator’s final explicit file selection. `source-pins.json` records the actual source/check/dependency bytes reviewed here.

## Optional recovered-fresh typed handoff

The declaration-only Swift flag `AUX_RECOVERED_FRESH_DISPATCH` includes a second narrow owner/registry initializer accepting `RecoveredFreshTerminalCommandContext` from the fresh coordinator. Its private entry constructor accepts only that concrete type or the existing captured terminal type, never an arbitrary core or provenance Boolean. A private entry insertion method shares handle/lifetime mechanics. The flag supplies type/source composition, **not runtime admission or an acceptance bypass**; it is off for unrelated default fixture builds so they need not compile the fresh coordinator. The actual paired restarted-coordinator→owner→NAPI check and exact dependency composition are in `aux-recovered-fresh-owned-handoff`. Existing lifetime test evidence above remains its historical default-composition check; this source extension is additionally compiled/exercised by the new18-check integration fixture.
