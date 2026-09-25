# Aux Chromium source

Aux pins Chromium `154.0.8037.58` at the commit in [version.txt](version.txt). The source and build output live outside this repository. [downloads.ini](downloads.ini) records the official branch-point lite archive and its SHA-256; the exact `.58` security respin is fetched from the signed upstream tag and checked against its pinned commit. The branch-point archive alone does not contain that respin.

The patch order is [patches/series](patches/series). Source patches are the reviewable record of every upstream change. No Chromium profile, build output, credential, downloaded archive, or reference capture belongs in Git.

## Local commands

```sh
chromium/aux-chromium presetup
chromium/aux-chromium setup
chromium/aux-chromium push
chromium/aux-chromium sanity
chromium/aux-chromium configure --flavor dev
chromium/aux-chromium build --flavor dev
chromium/aux-chromium run --flavor dev --profile /tmp/aux-chromium-profile
```

`AUX_CHROMIUM_SRC` selects the source checkout; the default is `~/aux-chromium-stable/chromium/src`. `AUX_DEPOT_TOOLS` selects depot_tools. Development builds are component builds. Release flags request an official build with ThinLTO and PGO disabled. Build runs at nice 10 with eight jobs. Keep a single native build active.

`pop` removes the series in reverse order. `refresh --patch aux/<area>/<name>.patch <upstream paths...>` records a selected tracked diff, and `format <upstream paths...>` runs Chromium's clang-format. `stage-shell` builds the Chromium renderer with SurfaceEmbed's restricted `object-src 'self'` policy, pins every asset with SHA-256 in [shell-assets](shell-assets), then installs the verified assets under `chrome/browser/resources/aux/assets`. Run it before `configure`; the Chromium GRD discovers those pinned assets from its manifest. A capture can be checked independently with `node chromium/stage-shell.mjs capture /tmp/aux-shell-test`. The native Mojo host integration is still required for a working shell.

## Source and build evidence

The first stable source sync completed on September 24, 2026. The official branch-point lite archive was downloaded and SHA-256 verified as `6c00c51c52bdacc32e28029769c0e0d3e1c4fe17767127910c57984822dbaa6d`; exact-tag Git source is the build input. `gn gen out/AuxDev` made 34,239 targets. The first full `chrome` compile was started with `nice -n 10`, eight local jobs, and 77,884 initial work items. Its final result belongs in [the evidence ledger](../docs/EVIDENCE.md), not in an unverified claim here.

The repository is private and its repository-scoped `aux-mac-rcourson` runner has the `aux-mac` label. The [fork workflow](../.github/workflows/chromium.yml) accepts only trusted same-repository pull requests, validates the pinned source and patch series on PRs, and reserves incremental builds for scheduled/manual runs. Hosted TypeScript jobs stay in the runtime workflow.
