# Aux

Aux reuses the implementation supplied by the owner, preserving its UI and behavior while changing branding, assets and identifiers to Aux. The clean-room reconstruction approach was superseded by the owner's direction on 2026-10-19.

Launch scope (2026-10-23): no Aux payments. Users bring provider API keys or connect eligible ChatGPT/Codex plan access; Aux subscriptions and Aux-funded inference are deferred. Preserve the current UI. The [provider-funded launch plan](docs/plans/2026-10-23-provider-funded-launch.md) records exact implementation and remaining ChatGPT integration/runtime acceptance boundaries. Source defaults and future Vercel configurations now disable payments and hosted inference; this does not replace an existing deployed Preview or the accepted desktop app.

Owner-directed exception (2026-10-20): Aux will not ship its own password manager or the supplied Vault product. Users bring their existing password manager, such as 1Password, through its browser extension. The local-browser pass removes Vault surfaces/bundles and decouples browser/agent startup from Vault setup. Third-party extension and desktop-app integration are not yet verified. See `docs/acceptance/local-browser-pass.json` for build and runtime evidence.

Read the [supplied contract](docs/design/aside-contract.md), [active reuse plan](docs/plans/2026-10-19-supplied-implementation-reuse.md), [workspace rules](AGENTS.md) and [current progress](docs/STATUS.md). Preserve the supplied components and matching runtime contracts. Independent replacements remain recoverable in Git and must not displace the supplied UI.

## Completion plan

The [final completion execution plan](docs/ROADMAP-EXECUTION-GRAPH.md) defines the remaining implementation, three parallel worker lanes, shared ownership, focused acceptance journeys, and separate development-signing/production/distribution gates. It is a plan, not a readiness claim or authorization to release.

The [desktop feature expansion plan](docs/plans/2026-10-23-browser-feature-expansion.md) covers the owner's new organization, navigation, window and productivity requirements while preserving the accepted UI. Desktop windows share a tab list with independent viewing; mobile is explicitly deferred. This planning-only roadmap supplements the existing startup/isolation and pre-release gates.

## Current local preview

The current copied app is `out/provided-candidate-local-browser-pass/Aux.app`. It uses an explicitly accepted, isolated disposable development profile; it is not installed or released. Ordinary opening now has an accepted-startup record for the exact reviewed app bytes. Replacing that app requires a verified successor record, not copying the old acceptance to new code. See [current status](docs/STATUS.md) and the [actual comparison](out/pass1-ui-completion/compare.html). Functional acceptance and remaining gaps are recorded in [the continuation ledger](docs/acceptance/completion-continuation-2026-10-20.json); this preview is not declared complete.

When restaging this preview, pass `--app-path` with the exact absolute `finalApp` from its accepted baseline/cache. The staging default is `~/Applications/Aux.app`; using that default for this preview changes runtime relocation bytes and invalidates retained-helper reuse. Compare the fresh resource inventory before accepting a successor.

## Development

The supplied implementation now has a pinned, atomic staging path:

```sh
pnpm stage:provided --replace
pnpm check:provided
pnpm assemble:provided
```

Staging replaces only a verified generated stage and keeps its previous output as a sibling backup. Use `node scripts/stage-provided.mjs --output <fresh-directory>` for another candidate, and `node scripts/check-provided.mjs <directory>` to audit it. The stage preserves the supplied Agent/Vault UI, daemon/CLI code, agent runtime and catalog-verified memory distributions with recorded Aux changes. It deliberately reports incomplete native/helper/startup integration; it is not yet a runnable production app. `pnpm check` runs the supplied-component checks and preservation audit, not final product acceptance. See [staging details](docs/source/provided-apps.md).

If an installed Aside update removes the pinned source version, use an explicit project-owned frozen snapshot for audits and packaging: `node scripts/check-provided.mjs <stage> --source-snapshot <root>` and add `--source-snapshot <root>` to the package command. All seven original component inventories, versions, hashes, modes and contained links are checked; missing inputs still fail. The recovered1852 snapshot is `out/provided-source-snapshot-1.26.1016.1852`. See [snapshot verification](docs/integration/proposed/provided-source-snapshot-check/README.md). This option checks an existing stage; its transformations remain bound to the original pins.

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

The owner-authorized [v498 local authentication repair](docs/acceptance/provided-v498-local-auth-repair.json) now has verified development signatures and a working normal disposable onboarding window. Its development authority layout selects the original signed supplied daemon executable, rather than the unchanged runtime Node host. The copied candidate is `out/provided-candidate-v498-development-local/Aux.app`; it is not installed or released. Actual cloud sign-in and broader behavior/visual acceptance remain incomplete.
