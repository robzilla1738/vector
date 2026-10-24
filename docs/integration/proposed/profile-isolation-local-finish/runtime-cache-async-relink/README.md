# Prepared combined unsigned WorkerHost successor

Status: prepared only. This combines the descriptor-count correction and the frozen asynchronous runtime-cache inspector overlay into one host compile and one daemon link. No compiler, linker, daemon, module, signing tool or policy activation was run for this proposal.

The exact input host is `e36e5c25…`, the count-corrected intermediate is `49718219…`, and the complete host is `3bda3d49671811e93b1890ef712328eecbb840ec32f0c3389ba43888765b5e39`. `prepare.py` checks the original count manifest and the frozen async overlay manifest, applies all four counted changes, and copies the three pinned includes beside the successor source. It does not modify either historical input. The source contains the new asynchronous native function and uses the descriptor array's actual size.

## Integrator steps

Cherry-pick the async integration source proposal first. In the integrator's checkout run `python3 docs/integration/proposed/profile-isolation-local-finish/runtime-cache-async-relink/prepare.py`. Its default overlay is that checkout's `runtime-cache-async-integration` sibling. Preparation can instead take one explicit absolute overlay directory, as used for the worker's frozen source during preparation here. It regenerates source, plan, runner pins, patch and manifest; it never compiles.

Then run `python3 docs/integration/proposed/profile-isolation-local-finish/runtime-cache-async-relink/run.py --execute` when ready. The runner internally uses `scripts/native-build.py` and `/tmp/aux-build.lock`; do not double-wrap it. It refuses stale input bytes, unprepared checkout paths and existing output directories.

The complete compiler command retains the prior selected host's flags and include search paths. It does not suppress CommonCrypto deprecation warnings. The actual compiler dependency set must equal the original dependency closure, replacing the host source and adding only the three reviewed includes. Path aliases are normalized for identity comparison; all original pinned files still undergo byte checks. The added includes are `AuxRuntimeCacheInspection.inc`, `AuxRuntimeCachePins.inc` and `AuxRuntimeCacheAsync.inc`.

After the actual compile succeeds, the runner measures the new object and generates the final daemon input manifest. It replaces only the selected `worker-host.o` in the current protected-startup invocation. All 48 Swift sources, the other 11 native objects, Node/Brotli archives, frameworks, private definitions, exports and `-no_adhoc_codesign` remain unchanged. The original link checker verifies module imports, private binding and unsigned artifacts, then the runner compares the resulting ABI/private-definition sets and module bytes to the prior protected-startup receipt.

Fresh output locations:

- `/private/tmp/aux-runtime-cache-async-object-20261023-a1` — new object, actual dependency list, compile log, measured daemon input manifest and result receipt.
- `/private/tmp/aux-runtime-cache-async-link-20261023-a1` — unsigned daemon, fresh Swift cache and link checker results.

Each attempt requires new output directories; failure evidence is retained. Compiler temporary/cache paths are inside the fresh object directory. No product is launched or installed.

## Evidence limits

The worker's earlier direct object compile in the async source proposal was outside the native build wrapper. It is historical diagnostic data, not serialized build acceptance and not reused as the successor object. This recipe performs a new serialized compile and link before claiming those steps passed.

The selected old compile receipt also lists `broker-runtime.js`, whose bytes changed from `e18616cb…` to `743db67f…`. It is not a C++ dependency or protected daemon link operand. Both values and that collateral distinction remain recorded in `plan.json`; its old acceptance is not borrowed for the new JavaScript pair. The integrator must independently bind the exact current source/entry pair. The native compiled runtime-cache pins in the three includes are preserved exactly; a different source/entry pair cannot silently be substituted.

This is an inactive native successor. It preserves loader/authority boundaries and existing cold-start refusal. It does not close broader namespace custody, whole-browser drain, restart recovery or atomic publication gaps, and does not authorize signing or release. Source and Python syntax checks are lean preparation evidence only. `runResult` stays null until the actual runner produces a separate execution receipt.
