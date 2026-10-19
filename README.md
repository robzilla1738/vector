# Aux

Aux reuses the implementation supplied by the owner, preserving its UI and behavior while changing branding, assets and identifiers to Aux. The clean-room reconstruction approach was superseded by the owner's direction on 2026-10-19.

Read the [active reuse plan](docs/plans/2026-10-19-supplied-implementation-reuse.md), [workspace rules](AGENTS.md) and [current progress](docs/STATUS.md). Preserve the supplied components and matching runtime contracts. Independent replacements remain recoverable in Git and must not displace the supplied UI.

## Development

The supplied implementation now has a pinned, atomic staging path:

```sh
pnpm stage:provided --replace
pnpm check:provided
```

Staging replaces only a verified generated stage and keeps its previous output as a sibling backup. Use `node scripts/stage-provided.mjs --output <fresh-directory>` for another candidate, and `node scripts/check-provided.mjs <directory>` to audit it. The stage preserves the supplied Agent/Vault UI, daemon/CLI code, agent runtime and catalog-verified memory distributions with recorded Aux changes. It deliberately reports incomplete native/helper/startup integration; it is not yet a runnable production app. `pnpm check` runs the supplied-component checks and preservation audit, not final product acceptance. See [staging details](docs/source/provided-apps.md).

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

`pnpm typecheck`, `pnpm lint` and `pnpm test` check the earlier workspace packages. `pnpm check:independent` retains their historical build/check workflow. `pnpm check:cleanroom` is a historical reconstruction audit and is excluded from the active reuse gate: byte-identical supplied files are expected. A passing preservation audit alone does not prove runtime or product parity.

All development stays local. Nothing is pushed, released, notarized or developer-signed. Final local packaging may use an ad hoc signature.
