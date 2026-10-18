# Building Aux locally

Aux uses Chromium155.0.8059.85 on macOS arm64. The default product checkout is
`~/Documents/Code/aux-chromium-security-155/chromium/src`; Fast output is
`out/AuxFast/Aux.app`. `dev-defaults.json` and `dev-config.mjs` select these defaults.
The preserved older product checkout is historical, not the current build target.
See [STATUS](../docs/STATUS.md) for current source, build identity, observations and
unfinished crash/performance acceptance. [Earlier build notes](../docs/archive/2026-10-18-native-building-history.md)
are historical records and do not identify a current running preview.

From the repository root, use the existing launcher with a disposable Profile:

```bash
node scripts/dev.mjs --temp-profile
```

It holds one plain PID lock, regenerates contracts/bindings, rebuilds workspace
modules and renderer, stages assets, builds Chromium incrementally, stages the
runtime and launches. The same launcher owns the app and temporary Profile until
normal application-menu Quit retires the app, runtime, Profile and lock. Do not
start another builder while that preview is alive, force-clear its lock, reset a
preserved checkout or replace its cleanup owner. Commit a coherent source slice
before the complete build so embedded source metadata names the candidate honestly.

For runtime-only edits against an unchanged compiled native ABI and renderer:

```bash
node scripts/dev.mjs --runtime-only --temp-profile
```

This checks the actual Mach-O host ABI before staging current runtime code and
preserves the renderer. It cannot prove native changes or new renderer behavior.
For LLDB observation, use an interactive terminal and the same owner:

```bash
node scripts/dev.mjs --temp-profile --debug-native
```

Without interactive stdin LLDB may retire on EOF. Deliberate debugger signals are
not application-crash evidence. Never use LLDB to manipulate native UI.

For a bounded build/tool command, use the launcher's same lock wrapper:

```bash
node scripts/dev.mjs -- chromium/aux-chromium build --flavor fast
```

An explicit `AUX_CHROMIUM_SRC` selects a different checkout; it does not authorize
resetting that checkout or touching an owner's real Profile. Keep matching stock
builds and their flags separate. A cloned Aux.app is not a compiled stock browser.
Runtime unit tests import dist, so rebuild `npx tsc -b` after runtime edits before
testing. Run `npm run check` per integrated source slice and observe changed native
behavior after compilation. Consolidate native edits as area patches listed in
`chromium/patches/series`, proving forward/reverse application and actual bytes.
Compilation, observation and acceptance are distinct evidence.

Renderer staging checks CSP/bootstrap order and uses actual asset inventory for
GN. Reports for style/bytes/coverage are advisory; compile errors fail builds.
Keep full ICU and existing correctness fixes. Native performance acceptance uses
real matching155 Aux/stock builds and `pnpm perf`; source bytes or diagnostic
Runtime Ready marks are not paired performance results. No push, hosted Actions,
signing, notarization or release work is part of development.
