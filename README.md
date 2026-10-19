# Aux

Aux reuses the implementation supplied by the owner, preserving its UI and behavior while changing branding, assets and identifiers to Aux. The clean-room reconstruction approach was superseded by the owner's direction on 2026-10-19.

Read the [active reuse plan](docs/plans/2026-10-19-supplied-implementation-reuse.md), [workspace rules](AGENTS.md) and [current progress](docs/STATUS.md). Preserve the supplied components and matching runtime contracts. Independent replacements remain recoverable in Git and must not displace the supplied UI.

## Development

The build/packaging pipeline is transitioning to the supplied implementation. The commands below currently build the earlier independent components; they are recovery/development tools and do not yet produce the requested faithful reused build. Existing staging machinery under `vendor/aside/` and `scripts/vendor-aside.mjs` is being reviewed against the pinned supplied version before reuse.

```sh
pnpm install
pnpm build
node scripts/build-runtime.mjs
node scripts/build-sea.mjs
node scripts/package-aux.mjs --development
node scripts/aux.mjs --temp-profile
```

Assembly also requires a rebuilt native Chromium app with `enable_aux_browser=true` and `enable_aux_shell=false`. Development assembly uses the intermediate component build; final installation requires `is_component_build=false`. The native browser owns daemon startup. These commands do not yet establish feature parity. `--no-browser` starts only the daemon. Always use disposable profiles for verification. Native builds are serialized with `python3 scripts/native-build.py <build command> [args...]`.

`pnpm typecheck`, `pnpm lint` and `pnpm test` check implemented workspace packages. `pnpm check:cleanroom` compares shipped source candidates and native patches against the local reference hash index; it currently reports legacy names still awaiting retirement. A green artifact scan alone never proves provenance or product parity.

All development stays local. Nothing is pushed, released, notarized or developer-signed. Final local packaging may use an ad hoc signature.
