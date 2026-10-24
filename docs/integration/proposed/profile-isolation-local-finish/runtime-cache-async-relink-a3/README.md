# Prepared a3 unsigned FD-cleanup successor

Prepared only. The predecessor is the actual successful serialized a2 tuple, not the earlier failed a1 attempt or a worker diagnostic compile:

- Object: `/private/tmp/aux-runtime-cache-async-object-20261023-a2/worker-host.o`, SHA `e238ee61290754896b9d713d3b08e4eba0fd4aa5d492947187f6c6d07349f24f`.
- Object/result and exact daemon input manifest are in that same a2 output directory.
- Daemon: `/private/tmp/aux-runtime-cache-async-link-20261023-a2/Aux Daemon`, SHA `1764d6135366116ab50f6dd5886779c68225e1b4f18af6ecfd47c170a9ea3ffa`, with its actual successful link receipt.

`prepare.py` verifies that tuple, its root plan/runner, dependency file, unchanged inputs and real object/executable hashes. It copies the same five native source/include files into this fresh a3 subtree. Exactly one include changes: the two count-one RAII cleanup replacements from the disjoint `runtime-cache-fd-cleanup` overlay. The host remains `e490c700…`, including the exact original canonical lifetime-header paths. The async dispatcher, compiled runtime pins and final mutable-package allowlist remain byte-identical to successful a2.

The changed inspector is `d09f42b7…` → `d67c7ad5acb41a731ecf24aaf8575a5f3433ae854026b0f78fcb94c542d3915c`. This owns the duplicate/descendant descriptors across throwing string allocations and preserves `errno` during cleanup. It changes no policy, status, allowlist, interface or UI and makes no new custody claim.

## Integrator invocation

Run this subtree's `prepare.py` in root after cherry-picking. It defaults to the root `runtime-cache-fd-cleanup` overlay, or takes its absolute directory as one argument. Preparation verifies bytes and writes reviewable source/recipe/manifest only.

Then run this subtree's `run.py --execute`. It invokes the existing native-build lock wrapper internally; do not double-wrap. Fresh required outputs:

- `/private/tmp/aux-runtime-cache-async-object-20261023-a3`
- `/private/tmp/aux-runtime-cache-async-link-20261023-a3`

The compiler argument array is the actual successful a2 array with only source/object/dependency output paths changed. Its actual dependency set must match a2's 94 canonical files after the explicit five source/include relocations; no other dependency is allowed or removed. The new inspector hash is the only changed source content. All previous byte pins and immutable a2 results remain verified before and after execution.

Only after real compile success does the runner measure the new host object and generate a daemon manifest. It substitutes that one object in the actual successful a2 link recipe and keeps the other 11 native objects, all 48 Swift sources, archives, linker flags, exports and private definitions. Fresh caches/output paths are used. The established checker must prove unsigned output and actual module import/private binding, and the runner requires the same module bytes/ABI and private definitions as a2.

All a2 paths and bytes remain untouched. The old historical non-native JS collateral distinction remains in the plan; it does not replace the integrator's independent source/entry pairing. No source-only check claims native success. This worker performed no native compilation/link, test executable, signing, product execution, activation or packaging. Existing startup/refusal and broader custody/drain/publication limitations remain unchanged.
