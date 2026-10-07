# Building Aux locally

Aux uses Chromium 154 on macOS arm64. The current product checkout is `~/aux-chromium-product/chromium/src`; the completed roadmap app is `out/AuxFast/Aux.app`, with native areas through 0078 and the packaged runtime. The incremental development output is `out/AuxDev/Aux.app`. Select it explicitly below: the tools retain `~/aux-chromium-stable/chromium/src` as their default. Preserve both existing checkouts and caches; do not reset them or run setup/push to change an applied build.

```bash
export AUX_CHROMIUM_SRC="$HOME/aux-chromium-product/chromium/src"
node scripts/dev.mjs --temp-profile
```

The launcher takes one plain PID lock, rebuilds workspace modules, builds the Chromium shell, stages the current renderer and regenerated host bindings, compiles incrementally, stages the runtime and launches. The lock remains held until the app exits. Temporary Profiles are removed after the owned app process exits. Without `--temp-profile`, the launcher uses the dedicated `~/aux-dev-profile`. Real browser Profiles require explicit owner permission.

For a stage or build command outside the launcher, use its lock wrapper:

```bash
node scripts/dev.mjs -- chromium/aux-chromium stage-shell
node scripts/dev.mjs -- chromium/aux-chromium build
```

A second builder refuses immediately. The previous inspection preview retired before this launcher transition. Native source changes are consolidated in `chromium/patches/series` through area 0078. The launcher above requires an already configured AuxDev build and rebuilds that flavor; it does not select the completed AuxFast app. Launch the current AuxFast executable through the same `scripts/dev.mjs -- command` lock wrapper with an explicitly disposable `--user-data-dir`; retain launcher ownership until the app quits before deleting that Profile. Check [STATUS](../docs/STATUS.md) for current delivery and deferred acceptance.

Renderer assets come from `apps/shell/dist`, with CSP and bootstrap-order checks. The generated asset inventory feeds GN; SHA pinning and product qualification do not gate staging. Node’s downloaded archive integrity check is retained.

No release, signing, notarization, push or hosted CI is part of this workflow. Performance and phase completion are tracked by [the roadmap](../docs/ROADMAP.md) and [status](../docs/STATUS.md). Historical builder records are [archived](../docs/archive/2026-10-05-v2/NATIVE-BUILDING-HISTORY.md).
