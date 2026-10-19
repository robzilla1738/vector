# Aux

Aux is a browser built on Aside's agent stack: its daemon, extensions, CLI and skills, with Aux naming, logo and icon. Everything runs locally.

## Run it

```bash
pnpm install
npm run vendor:aside          # stage daemon, CLI, extensions, runtime into out/aside-staged
node scripts/aux.mjs --temp-profile
```

Install the `aux` command and a self-contained `~/Applications/Aux.app` (browser, daemon, extensions, agent runtime and launcher inside the bundle, APFS clones so no extra disk) with `npm run package`. The launcher scripts need `node` 22 or newer on PATH. `npm run package -- --dev` builds a thin launcher that points at this checkout instead. The bundle is at most ad-hoc signed.

Options: `--chromium <path>`, `--home <dir>`, `--profile <dir>` (default `~/.aux/profile`), `--temp-profile`, `--env-file`, `--no-browser`, `--real-keychain`, and `-- <extra chromium args>`. The default Chromium is `~/Documents/Code/aux-chromium-security-155/chromium/src/out/AuxAside/Aux.app`.

The CLI is staged at `out/aside-staged/cli/Aux CLI.app`. Run `aux --help`.

## How it fits together

See `docs/design/aside-contract.md`.

## History

The earlier Aux runtime/shell is in git tag `aux-v3-final` and `docs/archive/aux-v3/`.
