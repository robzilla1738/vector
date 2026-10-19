# Aux local architecture

Aux is independently implemented from the behavior specifications in `docs/spec/`. Naming and local boundaries are defined in `docs/design/names.md`; the former vendored architecture is retired. Implementation and acceptance evidence live in `docs/STATUS.md`.

The Chromium browser owns process startup. Its native supervisor locates the components under `Contents/Resources/aux`, starts the daemon, verifies owned health, and supervises shutdown and restart. Native installation authentication signs challenges with a local P-256 key. Profile identities bind the canonical Chromium profile path to a local account; the browser gates ordinary windows until Vault setup, unlock, and onboarding are acknowledged.

The daemon uses Hono, tRPC, WebSocket transport, and SQLite. Account-scoped services provide sessions, provider credentials, projects, routines, memory/history/context, inbox, skills, channels, and encrypted Vault storage. The agent engine streams durable events and applies session access policy to browser, file, shell, helper, and external tools. Credentials and decrypted Vault data do not enter ordinary model transcripts.

The independently keyed Agent and Vault extensions are bundled Chromium components. React surfaces use shared UI tokens and licensed upstream fonts/icons. Native `chrome.aux*` APIs expose account authentication, browser preferences, autocomplete, notifications, popup hosting, filtering, and browser import. The authenticated extension bridge routes commands by account, profile, and browsing mode and validates observed document identities before actions.

The CLI authenticates to the same local daemon. Its MCP and persistent JavaScript REPL use the shared session/tool policy. Swift helpers provide permission-aware macOS operations through private parent pipes. Memory embeddings use pinned upstream ONNX weights; the local Vault uses authenticated encryption and password/recovery wrapping.

Packaging assembles independent daemon/CLI Node SEA executables, both extensions, helpers, model data, and pinned Node/Python/ripgrep/Poppler runtimes. Development assembly permits a component Chromium build and its adjacent libraries. Final installation requires a non-component build with the retired shell disabled and a local ad hoc signature. No hosted service or system Node installation is required by the assembled architecture.

This describes the implemented structure, not completed parity. Packaged runtime observation, native API breadth, missing secondary surfaces and Vault capabilities, clean patch reconstruction, visual/functional acceptance, and the full required model run remain tracked as outstanding until directly verified.
