# Building Aux locally

Aux uses Chromium 155.0.8059.85 on macOS arm64. The shared checkout is
`/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src`.
`depot_tools` for that checkout is `/Users/rcourson/Documents/Vibe/aux-chromium-durable/depot_tools`.
The existing dirty checkout contains owner work: never reset it or remove its changes.
Read the root `AGENTS.md` and `docs/STATUS.md` first.

## Native targets

- `out/AuxAside` is the intermediate component build. Its historical output directory
  name is not a shipped product identifier. It must have `enable_aux_browser=true`;
  a disabled browser flag does not verify new sources. The retired shell flag no longer exists.
- `out/AuxFast` is the final non-component build. Use
  `chromium/flags.aux.gn`, with `is_official_build=false` for the local unsigned build.
  Preserve an existing args file before changing it. The browser executable lives
  at `out/AuxFast/Aux.app/Contents/MacOS/Aux`.
- Every native compile and generation command uses the shared serialization wrapper:
  `python3 /Users/rcourson/Documents/Vibe/Aux/scripts/native-build.py <command> [args...]`.
  Do not clear a live lock or run a second build against the same output.

The integrator applies lane patches to shared files and owns `chromium/tree/`,
root GN integration, startup, preferences and API registration. A delivered patch
may already be applied to the shared checkout. Check before applying it again.
Record focused enabled-object compilation separately from full linkage, runtime
observation and parity acceptance.

## Assembly

Stage, audit, assemble and package the supplied implementation with the root
`pnpm stage:provided`, `pnpm check:provided`, `pnpm assemble:provided` and
`pnpm package:provided` (see the root README). Candidate repairs are applied as
receipt-bound deltas under `docs/integration/proposed/completion-20261026/`.
No push, hosted Actions, signing, notarization or release is authorized.

The native browser owns its bundled daemon lifecycle. For runtime observation,
set a disposable `AUX_HOME` and `--user-data-dir`, and use `--use-mock-keychain`.
Native import fixtures additionally require a supported disposable source-home
override. Never test against the owner's real browser profiles or credential stores.
Wait for the owned health endpoint and actual app registration before attaching a
UI automation tool that could otherwise launch a second unconfigured instance.
Use `node scripts/aux.mjs --temp-profile` for ordinary disposable development
launches after assembly. Final acceptance also launches the app with only system
tools on PATH, proving no external Node installation is needed.

`src/aux_native_pdf_bridge/node_headers` (the only symlink in `tree/added.tar.gz`) points at the
frozen snapshot's Node headers inside this repository:
`/Users/rcourson/Documents/Vibe/Aux/out/provided-source-snapshot-1.26.1016.1852/runtime/node/include/node`.
The web→Aux rename left it pointing at the deleted `.../Vibe/web/out/...`; the integrator repointed it
in the durable checkout on 2026-10-28. `chromium-tree.py export` records the link's target text, and
`apply` re-roots any absolute link into `<this repo>/out/provided-source-snapshot-*` (other absolute
links are refused). Re-export after the repoint so `added.tar.gz` stops carrying the old `web` target.

The complete Aux delta lives in [tree/](tree/README.md): re-export it with `scripts/chromium-tree.py export` after every native change, and `verify` replays it onto the base commit. Applying it to a clean 155.0.8059.85 checkout reproduces the durable tree.
Forward/reverse patch checks are useful intermediate evidence; they do not replace
fresh-series build, real disposable browser observation, provenance review, visual
comparisons or the required model tasks. Current evidence and gaps are in
`docs/STATUS.md`.
