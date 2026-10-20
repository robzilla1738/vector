# Aux

Aux reuses the implementation supplied by the owner, preserving its UI and behavior while changing branding, assets and identifiers to Aux. The clean-room reconstruction approach was superseded by the owner's direction on 2026-10-19.

Read the [supplied contract](docs/design/aside-contract.md), [active reuse plan](docs/plans/2026-10-19-supplied-implementation-reuse.md), [workspace rules](AGENTS.md) and [current progress](docs/STATUS.md). Preserve the supplied components and matching runtime contracts. Independent replacements remain recoverable in Git and must not displace the supplied UI.

## Development

The supplied implementation now has a pinned, atomic staging path:

```sh
pnpm stage:provided --replace
pnpm check:provided
pnpm assemble:provided
```

Staging replaces only a verified generated stage and keeps its previous output as a sibling backup. Use `node scripts/stage-provided.mjs --output <fresh-directory>` for another candidate, and `node scripts/check-provided.mjs <directory>` to audit it. The stage preserves the supplied Agent/Vault UI, daemon/CLI code, agent runtime and catalog-verified memory distributions with recorded Aux changes. It deliberately reports incomplete native/helper/startup integration; it is not yet a runnable production app. `pnpm check` runs the supplied-component checks and preservation audit, not final product acceptance. See [staging details](docs/source/provided-apps.md).

`assemble:provided` verifies staged file hashes, modes, complete leaf coverage and contained dependency links while copying the supplied components into a new `out/provided-resources` directory in the final `Contents/Resources/aux` layout. It refuses an existing output. This is resource assembly, not a signed browser or installation. See [assembly and signing](docs/source/provided-assembly.md).

`pnpm package` now selects the supplied native app assembler. It requires explicit successful native and boundary build receipts, the matching composition and a new output directory; see the assembly documentation for the complete command. `scripts/sign-provided.mjs` verifies an explicit inside-out ad hoc signing policy and signs only with `--apply`. Neither command installs or launches the candidate.

The development launcher selects the supplied installed app by default, or a candidate through `node scripts/aux.mjs --temp-profile --app /absolute/path/Aux.app`. It refuses an app without the supplied resource marker, uses mock Keychain for Chromium, and does not create the native runtime acceptance flag. `--no-browser` selects the packaged supplied daemon and its fixed pre-exec boundary; health readiness alone does not establish native authentication or behavior acceptance. A private process-group guardian bounds shutdown of owned processes. Temporary state is retained with its path printed because detached descendants cannot yet be proven stopped; group cleanup is not a complete shutdown receipt.

The build/packaging pipeline is transitioning to the supplied implementation. The commands below currently build the earlier independent components; they are recovery/development tools and do not yet produce the requested faithful reused build. Existing staging machinery under `vendor/aside/` and `scripts/vendor-aside.mjs` is being reviewed against the pinned supplied version before reuse.

```sh
pnpm install
pnpm build
node scripts/build-runtime.mjs
node scripts/build-sea.mjs
node scripts/package-aux.mjs --development
```

Supplied assembly requires a rebuilt native Chromium app with `enable_aux_browser=true`, `enable_aux_shell=false`, `is_component_build=false` and `aux_test_hooks=false`. The native browser owns daemon startup. The historical commands above do not establish feature parity and do not produce an app accepted by the current launcher. Always use disposable profiles for verification. Native builds are serialized with `python3 scripts/native-build.py <build command> [args...]`.

`pnpm typecheck`, `pnpm lint` and `pnpm test` check the earlier workspace packages. `pnpm check:independent` retains their historical build/check workflow. `pnpm check:cleanroom` is a historical reconstruction audit and is excluded from the active reuse gate: byte-identical supplied files are expected. A passing preservation audit alone does not prove runtime or product parity.

All development stays local, with 1:1 Aside UI and behavior as the priority. Signing/provisioning execution and release remain outside the current development work. The owner approved one unsigned [local-only signing review](docs/integration/proposed/local-development-review-v416/README.md); preparation grants no execution permission. Earlier scoped authentication-helper signing evidence remains historical; see the current workspace rules.
