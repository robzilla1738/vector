# Building Aux locally

Aux uses Chromium155.0.8059.85 on macOS arm64. The shared checkout is
`/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src`.
The existing dirty checkout contains owner work: never reset it or remove its changes.
Read the root `AGENTS.md`, `docs/design/names.md` and `docs/STATUS.md` first.
The earlier runtime/shell development commands are retired; their history remains
under `docs/archive/`.

## Native targets

- `out/AuxAside` is the intermediate component build. Its historical output directory
  name is not a shipped product identifier. It must have `enable_aux_browser=true`
  and `enable_aux_shell=false`; a disabled browser flag does not verify new sources.
- `out/AuxFast` is the final independent non-component build. Use
  `chromium/flags.aux.gn`, with `is_official_build=false` for the local unsigned build.
  Preserve an existing args file before changing it. The browser executable lives
  at `out/AuxFast/Aux.app/Contents/MacOS/Aux`.
- Every native compile and generation command uses the shared serialization wrapper:
  `python3 /Users/rcourson/Documents/Vibe/web/scripts/native-build.py <command> [args...]`.
  Do not clear a live lock or run a second build against the same output.

The integrator applies lane patches to shared files and owns the patch series,
root GN integration, startup, preferences and API registration. A delivered patch
may already be applied to the shared checkout. Check before applying it again.
Record focused enabled-object compilation separately from full linkage, runtime
observation and parity acceptance.

## Workspace and assembly

From the workspace root, run `pnpm build`, `node scripts/build-runtime.mjs`, then
`node scripts/build-sea.mjs`. Package only independently built artifacts with
`node scripts/package-aux.mjs --chromium /absolute/path/to/Aux.app --app /absolute/output/Aux.app`.
Intermediate component packaging additionally requires `--development`; it does
not satisfy final installation acceptance. Assembly uses local ad hoc signing.
No push, hosted Actions, Developer ID signing, notarization or release is authorized.

The native browser owns its bundled daemon lifecycle. For runtime observation,
set a disposable `AUX_HOME` and `--user-data-dir`, and use `--use-mock-keychain`.
Native import fixtures additionally require a supported disposable source-home
override. Never test against the owner's real browser profiles or credential stores.
Wait for the owned health endpoint and actual app registration before attaching a
UI automation tool that could otherwise launch a second unconfigured instance.
Use `node scripts/aux.mjs --temp-profile` for ordinary disposable development
launches after assembly. Final acceptance also launches the app with only system
tools on PATH, proving no external Node installation is needed.

The final patch series must reconstruct current bytes from the upstream base.
Forward/reverse patch checks are useful intermediate evidence; they do not replace
fresh-series build, real disposable browser observation, provenance review, visual
comparisons or the required model tasks. Current evidence and gaps are in
`docs/STATUS.md`.
