# Building Aux locally

Aux uses Chromium 154 on macOS arm64. The current product checkout is `~/aux-chromium-product/chromium/src`; the current preview app is `out/AuxFast/Aux.app`, with the frozen 42-area native checkpoint consolidated into 32 equivalent areas plus additive areas 0033–0036. The latest native build succeeded in 33 steps / 30m40.20s with **272 methods / 30 events**, `97d6daa5466e`, including native PDF/DOCX extraction, retained-file receipt Save and acknowledged extension reload. Its pinned Node 26.9 runtime is still building before staging and launch. Later account/retained-process/split-drag/export-completion renderer changes and the source-identity header improvement need the next combined staging/build; they are not in this renderer snapshot. Current acceptance is in STATUS. The launcher and staging tools default to that product checkout and Fast output through `dev-defaults.json`. Set `AUX_CHROMIUM_SRC` to use another checkout, or `--flavor dev` for `out/AuxDev/Aux.app`. Preserve both existing checkouts and caches; do not reset them or run setup/push to change an applied build.

```bash
export AUX_CHROMIUM_SRC="$HOME/aux-chromium-product/chromium/src"
node scripts/dev.mjs --temp-profile
```

The launcher takes one plain PID lock, rebuilds workspace modules, builds the Chromium shell, stages the current renderer and regenerated host bindings, compiles incrementally, stages the runtime and launches. The lock remains held until the app exits. For runtime-only changes against an already built renderer and matching compiled host ABI, use `node scripts/dev.mjs --runtime-only --temp-profile`. That explicit mode checks the actual Mach-O manifest hash, stages current runtime code and preserves the same launch/cleanup owner; it refuses a native ABI mismatch. Temporary Profiles are removed after the owned app process exits. Without `--temp-profile`, the launcher uses the dedicated `~/aux-dev-profile`. Real browser Profiles require explicit owner permission.

For a stage or build command outside the launcher, use its lock wrapper:

```bash
node scripts/dev.mjs -- chromium/aux-chromium stage-shell
node scripts/dev.mjs -- chromium/aux-chromium build
```

A second builder refuses immediately. The previous inspection preview retired before this launcher transition. Native source changes are consolidated in `chromium/patches/series` in 32 consolidated areas, with new changes appended from 0033. The launcher above explicitly reuses the completed AuxFast cache. Pass `--flavor dev` to use the configured AuxDev build; its cache may require a much larger rebuild. Launch the current AuxFast executable through the same `scripts/dev.mjs -- command` lock wrapper with an explicitly disposable `--user-data-dir`; retain launcher ownership until the app quits before deleting that Profile. Check [STATUS](../docs/STATUS.md) for current delivery and deferred acceptance.

Renderer assets come from `apps/shell/dist`, with CSP and bootstrap-order checks. The generated asset inventory feeds GN; SHA pinning and product qualification do not gate staging. Node’s downloaded archive integrity check is retained.

No release, signing, notarization, push or hosted CI is part of this workflow. Performance and phase completion are tracked by [the roadmap](../docs/ROADMAP.md) and [status](../docs/STATUS.md). Historical builder records are [archived](../docs/archive/2026-10-05-v2/NATIVE-BUILDING-HISTORY.md).

## Rebuild the current AuxFast preview

AuxFast is the default local development flavor. First quit the existing disposable Aux preview normally and let its launcher release the lock. Keep the product checkout and incremental cache. From the repository root:

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
