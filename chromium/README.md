# Aux Chromium

Aux builds on Chromium `155.0.8059.85` (commit in [version.txt](version.txt)). The checkout and build output live outside the repo at `/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src`; how to build it is in [BUILDING.md](BUILDING.md).

## Here

- [patches/series](patches/series) lists the Aux patches in apply order; [patches/aux/](patches/aux/) holds them. They are the reviewable record of every upstream change. [patches/README.md](patches/README.md) describes area ownership.
- `patches/benchmark/` holds stock-Chromium comparison patches used only for performance measurements.
- `flags.*.gn` are GN argument sets. [flags.aux.gn](flags.aux.gn) is the local AuxFast build; `flags.fast.gn` and `flags.release.gn` are the official-build variants; `flags.dev.gn` and `flags.aside.gn` are component-build variants.
- `tests/` holds native smoke scripts.

The checkout already has the series applied, plus owner work. Never reset it, re-apply the series over it, or remove unrelated changes. The `aux-chromium` setup/push/pop tool that once rebuilt a fresh 154 checkout from the series stopped working when the shell was retired on 2026-10-18 and was removed; it is at tag `archive/pre-cleanup-2026-10-27`. A fresh checkout cannot be rebuilt from this repo today.
