# Aux

Aux is a local browser under active clean-room reconstruction. Its TypeScript daemon, React extensions, agent engine, CLI, macOS helpers and Chromium integration are being implemented independently from behavior specifications.

Read [workspace rules](AGENTS.md), [specifications](docs/spec/README.md), [naming policy](docs/design/names.md) and [current progress](docs/STATUS.md). The former runtime is archived in git history; retained legacy build files are being retired as independent replacements become ready.

## Development

```sh
pnpm install
pnpm build
node scripts/aux.mjs --temp-profile
```

The launcher requires independently built daemon and extension outputs; these commands do not yet establish feature parity. `--no-browser` starts only the daemon. Always use disposable profiles for verification. Native builds are serialized with `python3 scripts/native-build.py <build command> [args...]`.

`pnpm typecheck`, `pnpm lint` and `pnpm test` check implemented workspace packages. `pnpm check:cleanroom` compares shipped source candidates and native patches against the local reference hash index; it currently reports legacy names still awaiting retirement. A green artifact scan alone never proves provenance or product parity.

All development stays local. Nothing is pushed, released, notarized or developer-signed. Final local packaging may use an ad hoc signature.
