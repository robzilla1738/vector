# Aux local architecture

The shipping product reuses the supplied Aside implementation on Chromium and brands it as Aux. The independent implementation later in this file is retired. When the two differ, the supplied implementation wins. Product rules are in [design/aside-contract.md](design/aside-contract.md). The live candidate is in [STATUS](STATUS.md).

## Current product

- The browser is Chromium from `/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src`. Its native supervisor starts the supplied daemon from the app bundle, checks owned health, and supervises shutdown.
- The supplied Agent extension, daemon, CLI, helpers, and runtime ship with the candidate. There is no built-in password manager. Users bring a browser extension such as 1Password.
- Users bring a provider API key or connect an eligible ChatGPT/Codex plan. Aux does not sell inference or subscriptions.
- Aux home, ports, and installation identity stay separate from Aside. Disposable development launches use `--use-mock-keychain`.
- Public wire bytes (`AsideDaemonSessionToken`, `aside.daemon.auth.`, health `service:"aside-daemon"`, `Aside.*` commands) and `aside.dk.*` derivation labels stay until a versioned migration. Branding does not rename them.

## Retired independent implementation

The notes below describe the earlier clean-room architecture. They are not build instructions. In particular, ordinary windows are not gated on Vault setup, and the product is not implemented from `docs/spec/`.

Aux was independently implemented from the behavior specifications in `docs/spec/`. Naming and local boundaries were defined in `docs/design/names.md`.

The Chromium browser owned process startup. Its native supervisor located the components under `Contents/Resources/aux`, started the daemon, verified owned health, and supervised shutdown and restart. Native installation authentication signed challenges with a local P-256 key. Profile identities bound the canonical Chromium profile path to a local account. That design gated ordinary windows until Vault setup, unlock, and onboarding were acknowledged.

The daemon used Hono, tRPC, WebSocket transport, and SQLite. Account-scoped services provided sessions, provider credentials, projects, routines, memory/history/context, inbox, skills, channels, and encrypted Vault storage. The agent engine streamed durable events and applied session access policy to browser, file, shell, helper, and external tools. Credentials and decrypted Vault data did not enter ordinary model transcripts.

The independently keyed Agent and Vault extensions were bundled Chromium components. React surfaces used shared UI tokens and licensed upstream fonts/icons. Native `chrome.aux*` APIs exposed account authentication, browser preferences, autocomplete, notifications, popup hosting, filtering, and browser import. The authenticated extension bridge routed commands by account, profile, and browsing mode and validated observed document identities before actions.

The CLI authenticated to the same local daemon. Its MCP and persistent JavaScript REPL used the shared session/tool policy. Swift helpers provided permission-aware macOS operations through private parent pipes. Memory embeddings used pinned upstream ONNX weights. The local Vault used authenticated encryption and password/recovery wrapping.

Packaging assembled independent daemon/CLI Node SEA executables, both extensions, helpers, model data, and pinned Node/Python/ripgrep/Poppler runtimes. Development assembly permitted a component Chromium build and its adjacent libraries. That design's final installation required a non-component build with the retired shell disabled and a local ad hoc signature. No hosted service or system Node installation was required by that assembled architecture.

That description was the implemented independent structure, not completed parity with the supplied product.
