# Aux Chromium

Aux builds on Chromium `155.0.8059.85` (commit in [version.txt](version.txt)). The checkout and build output live outside the repo at `/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src`; how to build it is in [BUILDING.md](BUILDING.md).

## Here

- [tree/](tree/README.md) is the complete, verified Aux delta on 155.0.8059.85: the record of every upstream change and the way to rebuild the native checkout.
- `flags.*.gn` are GN argument sets. [flags.aux.gn](flags.aux.gn) is the local AuxFast build; `flags.fast.gn` and `flags.release.gn` are the official-build variants of the same browser; `flags.dev.gn` is its component build, and `flags.aside.gn` a plain Chromium component build. The retired shell flag no longer exists.
- `tests/` holds native smoke scripts.

The checkout already carries the delta, plus owner work. Never reset it, apply the tree over it, or remove unrelated changes. `scripts/chromium-tree.py verify` replays the delta onto the base commit in a temporary index, and `apply` targets a clean 155.0.8059.85 checkout. A clean apply followed by a full build has not been done yet, so rebuilding a fresh checkout from this repo is unproven. The old `aux-chromium` setup tool and the patch series are at tag `archive/pre-cleanup-2026-10-27`.
