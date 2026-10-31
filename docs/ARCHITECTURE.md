# Aux architecture

Aux is a Chromium build with a local daemon, an Agent extension and a set of helpers. It started as the supplied Aside implementation, rebranded, and Aux's own source now replaces the parts it can build. Product rules are in the [contract](design/aside-contract.md), and the latest build is in [STATUS](STATUS.md).

## The app

`Aux.app` is a Chromium 155 build from the durable checkout, which carries the Aux delta recorded in `chromium/tree/`. The rebase to current stable is REL-1 in the [finish plan](ROADMAP-EXECUTION-GRAPH.md). Its components live under `Contents/Resources/aux/`:

| Path | Component |
|---|---|
| `apps/daemon/Aux Daemon.app` | The daemon (Node SEA) with Aux adaptations. The browser's native supervisor starts it, checks its health endpoint and stops it on Quit. |
| `apps/extension/` | The Agent extension: new tab, chat, side panel, settings |
| `apps/cli/Aux CLI.app` | The `aux` command, which talks to the same daemon. It's linked to `~/.local/bin/aux` from Settings › Developers. |
| `apps/computer-use/` | Computer Use helper |
| `agent-runtime/`, `memory-distribution/` | Node and Python runtime and memory model payloads. They're immutable seeds, and mutable state goes to the Aux home. |

The browser opens before the daemon is ready, and the agent catches up when the daemon answers.

## The agent

Work happens in individual chats. The panel opens on a chat, New chat starts one, and the Chats menu lists them. `aux ask` and `aux repl` keep one ongoing chat. The agent layer lives in `vendor/provided/agent/` and the native files in `chromium/tree`, and browsing, models and permissions are the supplied ones.

Models come from two places:

- **Local agent CLIs.** `vendor/provided/provider-cli/` drives official CLIs with the user's own login, and Add a local agent… registers any command that speaks the Agent Client Protocol. The CLI gets browser tools through a per-turn MCP endpoint, and its own shell and file actions ask Aux first. This is also the only way the agent gets a shell in 1.0.
- **API keys.** Requests go straight to the provider.

There's no in-app provider sign-in, no Aux plan and no hosted inference.

## Spaces

Spaces replace profiles. A Space shares sign-ins with another Space or is isolated, which a hidden Chromium profile backs, so isolated Spaces have their own cookies, site data and extensions. Pins, bookmarks and theme are per Space. One agent spans all Spaces.

## Passwords

There's no Vault. Aux fills logins imported from another browser and never saves new ones. Users bring a password manager extension.

## Ports and isolation

Aux keeps its own home, app data, installation identity and ports, separate from Aside. The daemon is on 21520, the extension bridge is `/extension-bridge` on that port, and CDP is on 45203. Nothing listens on 21522.

## How a build is produced

1. **Native.** Chromium changes live in the durable checkout and are exported to `chromium/tree/` (`scripts/chromium-tree.py`). Builds go through `scripts/native-build.py`. See [BUILDING](../chromium/BUILDING.md).
2. **Assemble.** `scripts/release/assemble.py` takes the native app and the components of the sealed candidate, applies the release transforms (`scripts/release/transforms.mjs`, `package-edits.json`), adds the release add-ons, the relinked daemon and the rebuilt runtime (`scripts/runtime/`), and signs the result with Developer ID.
3. **Package.** `scripts/release/package.py` notarizes, staples and makes the DMG and appcast. See [release](source/release.md).

The sealed candidate is the A38 base plus receipt-bound repairs under `docs/integration/proposed/completion-20261026/`, and `python3 scripts/verify-candidate.py` checks it. Assembly starts from it, so a change to its components is still a count-checked edit. The older `stage-provided`, `check-provided` and assembly scripts stay for supplied-UI audits.

## Hosted service

`services/aux-cloud/` is the Next.js service on Vercel behind `api.`, `app.` and `share.getaux.co`. It has no billing and no hosted inference. Aux works without it. Decision 9 of the finish plan pauses its sign-up, sync, shares and uploads for 1.0, and keeps the data.

The website at `getaux.co`, with the download page, user docs and update feed, is the separate `aux-web` repository.

## Compatibility boundaries

The wire protocol and key domains are Aux (`AuxDaemonSessionToken`, `aux.dk.v2`; see the contract). Changing a wire or cryptographic format again is a versioned migration, not branding. Installed homes pin the bootstrap policy hash of the build that created them, so a change to a pinned module needs a migration too (`docs/spec/native/macos-utilities.md` section 7).

The retired clean-room implementation that preceded this design is at tag `archive/pre-cleanup-2026-10-27`.
