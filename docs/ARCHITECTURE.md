# Aux architecture

Aux ships the supplied Aside implementation on Aux Chromium, rebranded. Product rules are in the [contract](design/aside-contract.md); the live candidate is in [STATUS](STATUS.md).

## The app

`Aux.app` is a Chromium 155 build from the durable checkout with the Aux patch series applied. Its supplied components live under `Contents/Resources/aux/`:

| Path | Component |
|---|---|
| `apps/daemon/Aux Daemon.app` | Supplied daemon (Node SEA) with Aux adaptations. The browser's native supervisor starts it, checks its owned health endpoint, and stops it on Quit. |
| `apps/extension/` | Supplied Agent extension: new tab, chat, side panel, settings. |
| `apps/cli/Aux CLI.app` | Supplied CLI, authenticating to the same daemon. |
| `apps/computer-use/` | Supplied Computer Use helper. |
| `agent-runtime/`, `memory-distribution/` | Supplied Node/Python runtime and memory model payloads. Immutable seeds; mutable state goes to the Aux home. |
| `native/` | Native boundary library and carrier for the original addon. |
| `bundle.json`, `provenance/` | Stage manifest and the hashes of every input. |

There is no Vault extension and no built-in password manager. Users bring a provider key or an eligible ChatGPT/Codex plan. Aux keeps its own home, app data, installation identity and ports (daemon 21520, bridge 21522, CDP 45203), separate from Aside.

## How a build is produced

1. **Stage.** `scripts/stage-provided.mjs` copies the pinned supplied inputs (`docs/source/*-inputs.json`, or the frozen snapshot in `out/`) and applies the Aux transforms in `scripts/lib/` and `vendor/provided/`. Each transform is count-checked against exact anchors.
2. **Audit.** `scripts/check-provided.mjs` confirms that every file the transforms did not touch still matches its supplied bytes.
3. **Assemble and package.** `scripts/assemble-provided.mjs` and `scripts/package-provided.mjs` combine the stage with a native Chromium build into `Aux.app`.
4. **Native.** Chromium changes are patches in `chromium/patches/`, built from the durable checkout through `scripts/native-build.py`.
5. **Repairs.** The current candidate was then repaired with receipt-bound deltas under `docs/integration/proposed/completion-20261026/`. Their exact inputs are in `integrator/current-source-selection.json`.

## Compatibility boundaries

The wire protocol and key domains are Aux (`AuxDaemonSessionToken`, `aux.dk.v2`; see the contract). Changing a wire or cryptographic format again is a versioned migration, not branding. The boundary guard's legacy Keychain acceptance list is the last Aside identifier; STATUS tracks it.

The retired clean-room implementation that preceded this design is at tag `archive/pre-cleanup-2026-10-27`.
