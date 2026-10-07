# Building Aux locally

Aux uses Chromium 154 on macOS arm64. The current product checkout is `~/aux-chromium-product/chromium/src`; the current UI preview app is `out/AuxFast/Aux.app`, with native areas through 0078 and the packaged runtime. The incremental development output is `out/AuxDev/Aux.app`. Select it explicitly below: the tools retain `~/aux-chromium-stable/chromium/src` as their default. Preserve both existing checkouts and caches; do not reset them or run setup/push to change an applied build.

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

## Rebuild the current AuxFast preview

The October 7 UI handoff uses AuxFast, not the default AuxDev flavor. First quit the existing disposable Aux preview normally and let its launcher release the lock. Keep the product checkout and incremental cache. From the repository root:

```bash
export AUX_CHROMIUM_SRC="$HOME/aux-chromium-product/chromium/src"
node scripts/dev.mjs -- chromium/aux-chromium stage-shell
node scripts/dev.mjs -- chromium/aux-chromium build --flavor fast
node scripts/dev.mjs -- node chromium/stage-runtime.mjs "$AUX_CHROMIUM_SRC/out/AuxFast/Aux.app"
aux_preview_profile=$(mktemp -d "${TMPDIR:-/tmp}/aux-preview.XXXXXX")
node scripts/dev.mjs -- "$AUX_CHROMIUM_SRC/out/AuxFast/Aux.app/Contents/MacOS/Aux" "--user-data-dir=$aux_preview_profile"
rm -rf -- "$aux_preview_profile"
```

The final command waits for the owned app to exit before the temporary Profile is removed. Do not run another builder while it is open. AuxFast's static link and debug-symbol generation can take many minutes even for renderer changes; an unchanged console line alone does not mean the build stalled. The current launcher and `/tmp` build logs are session artifacts, not prerequisites for future builds. See STATUS for the last observed build and the checks still pending.
