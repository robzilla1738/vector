# Building Aux locally

The October 16 combined UI candidate built source `c612736f5` in **25 steps /
8m55.10s**, with 207 renderer assets, **273 methods / 30 events**
(`cce8203bcbd0`) and slim Node 26.9. It includes direct composer model/thinking
controls, compact General dialogs, shared search focus styling and the restored
chat toolbar. The disposable preview is running under the existing launcher and
plain lock. Let it retire normally before another build; do not clear its lock
or remove its Profile while live. See STATUS for the observed flows and remaining
full-parity work. Log: `/tmp/aux-parity-combined-build.log`.
The October 12 build notes below are historical.

Aux uses Chromium 154 on macOS arm64. The product checkout is
`~/Documents/Code/aux-chromium-product/chromium/src`; the built app is `out/AuxFast/Aux.app`.
The October 12 parity build includes native area 0041 (held Ctrl-Tab routing)
and completed in **24 steps / 8m56.42s**, with **273 methods / 30 events**,
`cce8203bcbd0`, 206 renderer assets and slim Node 26.9. Its disposable app and
launcher retired normally at the owner's wrap-up; the Profile and lock were
removed. Final renderer review fixes postdate this candidate and require the
next ordinary build. Home and local fixture navigation were observed; native
Ctrl-Tab release/focus and broader workflow/performance acceptance remain in
[STATUS](../docs/STATUS.md). Earlier builds' observations are historical evidence,
not new walkthroughs of this candidate. Preserve every launcher's ownership
until normal retirement.

The launcher defaults to this preserved product checkout and Fast output through
`dev-defaults.json`. Set `AUX_CHROMIUM_SRC` for another checkout, or `--flavor dev`
for `out/AuxDev/Aux.app`. Preserve both checkouts and caches; do not reset them or
run setup/push to change applied source.

```bash
export AUX_CHROMIUM_SRC="$HOME/Documents/Code/aux-chromium-product/chromium/src"
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
export AUX_CHROMIUM_SRC="$HOME/Documents/Code/aux-chromium-product/chromium/src"
node scripts/dev.mjs -- chromium/aux-chromium stage-shell
node scripts/dev.mjs -- chromium/aux-chromium build --flavor fast
node scripts/dev.mjs -- node chromium/stage-runtime.mjs "$AUX_CHROMIUM_SRC/out/AuxFast/Aux.app"
aux_preview_profile=$(mktemp -d "${TMPDIR:-/tmp}/aux-preview.XXXXXX")
node scripts/dev.mjs -- "$AUX_CHROMIUM_SRC/out/AuxFast/Aux.app/Contents/MacOS/Aux" "--user-data-dir=$aux_preview_profile"
rm -rf -- "$aux_preview_profile"
```

The final command waits for the owned app to exit before the temporary Profile is removed. Do not run another builder while it is open. AuxFast's static link and debug-symbol generation can take many minutes even for renderer changes; an unchanged console line alone does not mean the build stalled. The current launcher and `/tmp` build logs are session artifacts, not prerequisites for future builds. See STATUS for the last observed build and the checks still pending.
