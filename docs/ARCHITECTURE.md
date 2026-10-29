# Aux architecture

Aux ships the supplied Aside implementation on Aux Chromium, rebranded. Product rules are in the [contract](design/aside-contract.md); the live candidate is in [STATUS](STATUS.md).

## The app

`Aux.app` is a Chromium 155 build from the durable checkout, which carries the Aux delta recorded in `chromium/tree/`. Its supplied components live under `Contents/Resources/aux/`:

| Path | Component |
|---|---|
| `apps/daemon/Aux Daemon.app` | Supplied daemon (Node SEA) with Aux adaptations. The browser's native supervisor starts it, checks its owned health endpoint, and stops it on Quit. |
| `apps/extension/` | Supplied Agent extension: new tab, chat, side panel, settings. |
| `apps/cli/Aux CLI.app` | Supplied CLI, authenticating to the same daemon. |
| `apps/computer-use/` | Supplied Computer Use helper. |
| `agent-runtime/`, `memory-distribution/` | Supplied Node/Python runtime and memory model payloads. Immutable seeds; mutable state goes to the Aux home. |
| `native/` | Empty. The supplied addon, its carrier and the historical Keychain interposer were unreachable and are removed (2026-10-27). |
| `bundle.json`, `provenance/` | Stage manifest and the hashes of every input. |

On top of these sits the agent layer ([design](plans/2026-10-28-agent-model.md)). It gives each profile one named agent with a home thread and side chats, plus a chrome button beside the sidebar address field. It is added at release time by `vendor/provided/agent/` and the native files in `chromium/tree`; browsing, models and permissions are the supplied ones.

There is no Vault extension and no built-in password manager. Users bring a provider key or an eligible ChatGPT/Codex plan. Aux keeps its own home, app data, installation identity and ports (daemon 21520, bridge 21522, CDP 45203), separate from Aside.

## How a build is produced

1. **Stage.** `scripts/stage-provided.mjs` copies the pinned supplied inputs (`docs/source/*-inputs.json`, or the frozen snapshot in `out/`) and applies the Aux transforms in `scripts/lib/` and `vendor/provided/`. Each transform is count-checked against exact anchors.
2. **Audit.** `scripts/check-provided.mjs` confirms that every file the transforms did not touch still matches its supplied bytes.
3. **Assemble and package.** `scripts/assemble-provided.mjs` and `scripts/package-provided.mjs` combine the stage with a native Chromium build into `Aux.app`.
4. **Native.** Chromium changes live in the durable checkout and are exported to `chromium/tree/` (`scripts/chromium-tree.py`). Builds go through `scripts/native-build.py`.
5. **Repairs.** The current candidate is the A38 base plus receipt-bound deltas under `docs/integration/proposed/completion-20261026/`, applied by the repair executor in `scripts/candidate/`. Their exact inputs are in `integrator/current-source-selection.json`, and `python3 scripts/verify-candidate.py` checks the app still matches them. A fresh `stage:provided` does not reproduce the candidate on its own.

## Hosted service

`services/aux-cloud/` is the Next.js service on Vercel behind `api.`, `app.` and `share.getaux.co`: accounts (Clerk), device sessions, sync, shares, feedback uploads (Vercel Blob) and the public pages. It has no billing and no hosted inference. The desktop build talks to the production service; deploys are the owner's to run.

## Compatibility boundaries

The wire protocol and key domains are Aux (`AuxDaemonSessionToken`, `aux.dk.v2`; see the contract). Changing a wire or cryptographic format again is a versioned migration, not branding. No Aside identifier ships; the historical Keychain interposer was removed.

The retired clean-room implementation that preceded this design is at tag `archive/pre-cleanup-2026-10-27`.
