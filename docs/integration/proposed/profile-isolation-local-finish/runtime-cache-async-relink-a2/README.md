# Unsigned host relink a2: exact frozen header paths

Prepared only; this proposal runs no native compile, link, product, signing tool or activation.

The actual serialized a1 attempt failed compilation because the moved host's two relative PDF/utility lifetime includes resolve to root-checkout copies when built in the full checkout. Its existing frozen worker header already includes the original private copies, producing duplicate definitions. This was missed in the sparse worker checkout, where those root-relative copies were absent.

This fresh a2 subtree preserves the original a1 recipe, source, plan, runner pins, manifest, result and compile log in `a1-evidence/`. `a1-evidence.json` pins both original paths and archived copies; preparation and execution verify both remain unchanged. The original `/private/tmp/aux-runtime-cache-async-object-20261023-a1` is not overwritten or reused. The a1 source subtree is not changed.

`path-adaptations.json` records two count-one substitutions layered on the frozen async host `3bda3d49…`: only its direct PDF and utility includes now name the exact original canonical header files under `/private/tmp/aux-async-writes-final/docs/integration/proposed/`. Each target is validated against both existing aliases in the original selected compiler `.d` and their byte hashes. No header, include guard, include search directory/order, compiler flag, or helper implementation changes. The final successor digest is recorded in that adaptation manifest. The original async source/helper files remain unchanged. A separate frozen package-mutation layer is applied only to the fresh copied inspector include and adds `AuxRuntimeMutablePins.inc`; its input/output hashes and counted changes are recorded in the plan. Missing files on that explicitly derived mutable-package list remain unverified-modified, while missing required runtime files still refuse. This supports actual supplied package upgrade/uninstall paths without accepting arbitrary missing core files.

The dependency rule is unchanged: 90 prior canonical files, minus the old host, plus the new host and four reviewed includes, gives exactly 94. The two alias pairs in the original 92 lexical paths are explained by `dependency-review.json`. The runner must see this precise canonical closure after real compilation and must verify every preserved native/link/header byte pin; current arbitrary paths are not accepted as equivalent.

## Integrator invocation

After cherry-picking, run this subtree's `prepare.py` in the root checkout. It defaults to the root's frozen `runtime-cache-async-integration` sibling, or accepts explicit absolute async and package-mutation overlay directories as its first and second arguments. Both frozen manifests must pass before source is prepared. Preparation only copies/adapts approved static source and verifies pins; it generates the complete concrete compiler/linker arrays and coherent manifests.

Then run this subtree's `run.py --execute`. It invokes `scripts/native-build.py` internally; do not double-wrap the lock. Fresh outputs must not exist:

- `/private/tmp/aux-runtime-cache-async-object-20261023-a2`
- `/private/tmp/aux-runtime-cache-async-link-20261023-a2`

The runner measures the replacement object only after successful compilation, builds the final daemon manifest from that digest, and invokes the established unsigned link checker. All 48 Swift sources, other 11 native objects, Node/Brotli archives, frameworks, exports, private-symbol rules and explicit no-ad-hoc-signing linker flag remain unchanged. It also checks the same paired module bytes/import set and private-definition set. Temporary files and caches use fresh output children.

The historical non-native `broker-runtime.js` collateral mismatch remains documented in the generated plan. This native successor does not authenticate a different JavaScript source/entry pair; the root integrator must pair the exact helper-pinned source/entry separately. No old off-lock object is reused as build acceptance. Existing cold-start refusal, custody/drain/recovery/publication limitations, signing and release separation remain intact.
