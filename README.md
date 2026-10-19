# Aux

Aux is a browser built on Aside's agent stack: its daemon, extensions, CLI and skills, with Aux naming, logo and icon. Everything runs locally.

## Run it

```bash
pnpm install
npm run vendor:aside          # stage daemon, CLI, extensions, runtime into out/aside-staged
node scripts/aux.mjs --temp-profile
```

Install the `aux` command and a launcher app (`~/Applications/Aux.app`) with `npm run package`.

Options: `--chromium <path>`, `--home <dir>`, `--profile <dir>` (default `~/.aux/profile`), `--temp-profile`, `--env-file`, `--no-browser`, `--real-keychain`, and `-- <extra chromium args>`. The default Chromium is `~/Documents/Code/aux-chromium-security-155/chromium/src/out/AuxAside/Aux.app`.

The CLI is staged at `out/aside-staged/cli/Aux CLI.app`. Run `aux --help`.

## How it fits together

See `docs/design/aside-contract.md`.

## History

The earlier Aux runtime/shell is in git tag `aux-v3-final` and `docs/archive/aux-v3/`.
