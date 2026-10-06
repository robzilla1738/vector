# Building Aux locally

Aux uses Chromium 154 on macOS arm64. The retained checkout is `~/aux-chromium-stable/chromium/src`; its incremental output is `out/AuxDev/Aux.app`. Do not reset that checkout or run setup/push to change an existing build.

```bash
node scripts/dev.mjs --temp-profile
```

The launcher takes one plain PID lock, rebuilds workspace modules, builds the Chromium shell, stages the current renderer and regenerated host bindings, compiles incrementally, stages the runtime and launches. The lock remains held until the app exits. Temporary Profiles are removed after the owned app process exits. Without `--temp-profile`, the launcher uses the dedicated `~/aux-dev-profile`. Real browser Profiles require explicit owner permission.

For a stage or build command outside the launcher, use its lock wrapper:

```bash
node scripts/dev.mjs -- chromium/aux-chromium stage-shell
node scripts/dev.mjs -- chromium/aux-chromium build
```

A second builder refuses immediately. The previous inspection preview retired before this launcher transition. Native source changes are recorded in `chromium/patches/series`; patch consolidation is still in progress. The launcher requires an already configured AuxDev build.

Renderer assets come from `apps/shell/dist`, with CSP and bootstrap-order checks. The generated asset inventory feeds GN; SHA pinning and product qualification do not gate staging. Node’s downloaded archive integrity check is retained.

No release, signing, notarization, push or hosted CI is part of this workflow. Performance and phase completion are tracked by [the roadmap](../docs/ROADMAP.md) and [status](../docs/STATUS.md). Historical builder records are [archived](../docs/archive/2026-10-05-v2/NATIVE-BUILDING-HISTORY.md).
