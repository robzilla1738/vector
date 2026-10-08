# Aux Chromium source

Aux pins Chromium `154.0.8037.98` at the commit in [version.txt](version.txt). The source and build output live outside this repository. [downloads.ini](downloads.ini) records the official branch-point lite archive and its SHA-256; the exact `.98` security respin is fetched from the upstream tag and checked against its pinned commit. The branch-point archive alone does not contain that respin.

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
node chromium/stage-runtime.mjs "$HOME/aux-chromium-product/chromium/src/out/AuxDev/Aux.app"
chromium/aux-chromium run --flavor dev --profile /tmp/aux-chromium-profile
```

The current product checkout is `~/aux-chromium-product/chromium/src`; preserve its applied patches and incremental cache. The launcher, builder and staging tools default to it and Fast output through `dev-defaults.json`. Set `AUX_CHROMIUM_SRC` for a different checkout and `AUX_DEPOT_TOOLS` for depot_tools. Read [STATUS](../docs/STATUS.md) before staging: authored patches, applied patches, compiled patches and staged renderer/host bindings can be at different checkpoints. Do not rerun `setup` or `push` on an existing patched checkout.

Development builds use `out/AuxDev` and component linking. Fast/release builds use [flags.fast.gn](flags.fast.gn): official static linking, ThinLTO, PGO phase 2, H.264/AAC and Widevine. [flags.release.gn](flags.release.gn) imports these settings. Build flags alone do not prove that an output was built with them. Keep one native builder and use the plain development PID lock for every native source mutation/build.

`pop` removes the series in reverse order. `refresh --patch aux/<area>/<name>.patch <upstream paths...>` records a selected tracked diff, and `format <upstream paths...>` runs Chromium's clang-format. `stage-shell` builds the Chromium renderer with SurfaceEmbed's restricted `object-src 'self'` policy, stages current `apps/shell/dist` assets under `chrome/browser/resources/aux/assets`. Run it before a native resource rebuild when renderer assets change. CSP and bootstrap order can be checked with `node chromium/stage-shell.mjs verify`. The current AuxFast preview has the native Mojo host integration; methods still absent from its allowlist remain product gaps.

`stage-runtime` builds a self-contained runtime bundle and stages it beside an unsigned `Aux.app`. `slim-node.mjs` builds Node `26.7.0` with small ICU, no npm and LTO, then strips local symbols. Node 26 no longer includes Corepack or accepts its old configure switch. The official source archive is pinned to SHA-256 `e6b182cbeeab032d1082ca4ac4fe15e3a57de691d3bde78ecf8a761fd56ee356`; its incremental source build and executable are cached outside the repository in `~/aux-node-slim` (override with `AUX_NODE_CACHE`). The source build uses the same plain native development lock. Pass an app path to stage a different build, for example `node chromium/stage-runtime.mjs /path/to/Aux.app`. Run this before signing; the script refuses to modify a signed app. The slim executable's 90 MB size target is advisory and must be measured after the build.

## Source and build evidence

The exact `.98` upstream commit is the build input. Current compilation, native launch and performance status are recorded in [STATUS](../docs/STATUS.md); measurements belong in [BENCHMARKS](../docs/BENCHMARKS.md). Historical evidence does not establish that the current source or staged app passes.

Development and verification are local. Do not dispatch CI, push, sign or release as part of this implementation. The stock comparison must use the same Chromium version and resolved Fast flags as Aux, with the Aux shell disabled, before the five paired measurements run.
