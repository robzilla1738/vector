# durable-checkout-a1

On 2026-10-27, `/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src` was behind the tree the current candidate (`2a215e71`) was built from, `/private/tmp/aux-chromium-recovery-snapshot-20261023/src`. The `phase1-native-a1`, `product-logo-a1` and `split-multipane-metrics-a1` projections had gone only to the `/private/tmp` tree. The durable tree held each lane's exact `baselineSha256` and the `/private/tmp` tree held each `outputSha256`.

Those three lanes (15 files) were re-projected into the durable tree from their committed `source/` folders, with both hashes checked. A sweep of `/private/tmp` sources newer than 2026-10-23 (outside `out/`, `.git`, `third_party`, `v8`, `build`, `buildtools`) found no other difference.

The durable `out/AuxFast` had been copied from the `/private/tmp` tree, so its relative toolchain paths had the wrong depth. `gn gen out/AuxFast` regenerated it with `args.gn` unchanged.

Aux's `build/toolchain/apple/aux_host_link_filter.py` hard-coded `/private/tmp/.../out/AuxFast` as the only allowed linker working directory. It now derives `out/AuxFast` from its own checkout (`projection.json`). No allowlist, flag or output class changed.
