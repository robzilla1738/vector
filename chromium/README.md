# Aux Chromium source

Aux pins Chromium `154.0.8037.58` at the commit in [version.txt](version.txt). The source and build output live outside this repository. [downloads.ini](downloads.ini) records the official branch-point lite archive and its SHA-256; the exact `.58` security respin is fetched from the signed upstream tag and checked against its pinned commit. The branch-point archive alone does not contain that respin.

The patch order is [patches/series](patches/series). Source patches are the reviewable record of every upstream change. No Chromium profile, build output, credential, downloaded archive, or reference capture belongs in Git.

## Local commands

For a **new empty checkout only**:

```sh
chromium/aux-chromium presetup
chromium/aux-chromium setup
chromium/aux-chromium push
chromium/aux-chromium sanity
chromium/aux-chromium stage-shell
chromium/aux-chromium configure --flavor dev
chromium/aux-chromium build --flavor dev
node chromium/stage-runtime.mjs "$HOME/aux-chromium-stable/chromium/src/out/AuxDev/Aux.app"
chromium/aux-chromium run --flavor dev --profile /tmp/aux-chromium-profile
```

The existing Mac already has the stable source, the ordered series through patch 0051, and a working incremental cache: **do not rerun `setup` or `push` there**. Use the [current continuation runbook](../experiments/chromium-fork/CONTINUATION.md) to inspect, stage, incrementally build and test `out/AuxDev/Aux.app`. `AUX_CHROMIUM_SRC` selects the source checkout; the default is `~/aux-chromium-stable/chromium/src`. `AUX_DEPOT_TOOLS` selects depot_tools. Development builds are component builds. Release flags request an official static build with ThinLTO and PGO disabled; that build is deferred and its existing cache is preserved. Keep a single native build active.

`pop` removes the series in reverse order. `refresh --patch aux/<area>/<name>.patch <upstream paths...>` records a selected tracked diff, and `format <upstream paths...>` runs Chromium's clang-format. `stage-shell` builds the Chromium renderer with SurfaceEmbed's restricted `object-src 'self'` policy, pins every asset with SHA-256 in [shell-assets](shell-assets), then installs the verified assets under `chrome/browser/resources/aux/assets`. Run it before a native resource rebuild when renderer assets change. A capture can be checked independently with `node chromium/stage-shell.mjs capture /tmp/aux-shell-test`. The current AuxDev build has the native Mojo host integration; methods still absent from its allowlist remain product gaps.

`stage-runtime` builds a self-contained runtime bundle and stages it beside an unsigned `Aux.app` with Node `26.7.0`. The official macOS arm64 Node archive is pinned to SHA-256 `7ee659a7768e641bbfd5360940660b8e8fd0052f77488f365562bac522fc15d4` and cached outside the repository. Pass an app path to stage a different build, for example `node chromium/stage-runtime.mjs /path/to/Aux.app`. Run this before signing; the script refuses to modify an app with a code signature. The same runtime bundler supplies the legacy Electron package until Electron is removed.

## Source and build evidence

The first stable source sync completed on September 24, 2026. The official branch-point lite archive was downloaded and SHA-256 verified as `6c00c51c52bdacc32e28029769c0e0d3e1c4fe17767127910c57984822dbaa6d`; exact-tag Git source is the build input. The full stable component app subsequently built. The incremental AuxDev app has since been rebuilt through patch 0051. See the [current evidence ledger](../docs/EVIDENCE.md) for exact scope; this is not an official static or signed build.

The repository is private and its repository-scoped `aux-mac-rcourson` runner has the `aux-mac` label. The [fork workflow](../.github/workflows/chromium.yml) accepts only trusted same-repository pull requests, validates the pinned source and patch series on PRs, and reserves incremental builds for scheduled/manual runs. Hosted TypeScript jobs stay in the runtime workflow. The owner requested local builds/tests and no paid billing; do not dispatch hosted jobs for this development checkpoint.
