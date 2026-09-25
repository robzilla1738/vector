# Aux agent API

Generated from `packages/contracts/src/agent-api.ts`. Run `pnpm agent-api:docs` after editing the manifest.

The SDK, MCP and CLI project this manifest. Code mode exposes only entries supported on the `code` surface. Each call is validated against the matching RPC parameter and result schemas. Calls inside QuickJS appear synchronous while the host dispatches them asynchronously.

## Included model reference

- aux.tabs.list(params): List accessible tabs and their stable Aux page IDs.
- aux.tabs.playwright.domSnapshot(params): Read a structured DOM snapshot and stable element refs.
- aux.tabs.dom.execute(params): Run a typed program through the guarded journal and grants.

## Full model reference

- aux.tabs.list(params): List accessible tabs and their stable Aux page IDs.
- aux.tabs.turn.open(params): Open a background tab owned by one task turn; duplicate URLs reuse that turn's tab.
- aux.tabs.playwright.domSnapshot(params): Read a structured DOM snapshot and stable element refs.
- aux.tabs.playwright.elementInfo(params): Identify the observed element at viewport coordinates.
- aux.tabs.playwright.extract(params): Extract named fields from the current document.
- aux.tabs.playwright.waitFor(params): Wait for a declarative page condition.
- aux.tabs.dom.observe(params): Observe Aux refs and current document epoch.
- aux.tabs.dom.execute(params): Run a typed program through the guarded journal and grants.
- aux.tabs.content.text(params): Read page text and headings.

## Lookup reference

- aux.tabs.list(params): List accessible tabs and their stable Aux page IDs.
- aux.tabs.turn.open(params): Open a background tab owned by one task turn; duplicate URLs reuse that turn's tab.
- aux.tabs.turn.end(params): Close every temporary tab owned by the task turn.
- aux.tabs.playwright.domSnapshot(params): Read a structured DOM snapshot and stable element refs.
- aux.tabs.playwright.elementInfo(params): Identify the observed element at viewport coordinates.
- aux.tabs.playwright.extract(params): Extract named fields from the current document.
- aux.tabs.playwright.waitFor(params): Wait for a declarative page condition.
- aux.tabs.dom.observe(params): Observe Aux refs and current document epoch.
- aux.tabs.dom.execute(params): Run a typed program through the guarded journal and grants.
- aux.tabs.dom_cua.observe(params): Alias for Aux ref observation.
- aux.tabs.dom_cua.execute(params): Alias for guarded Aux ref actions.
- aux.tabs.content.text(params): Read page text and headings.
- aux.tabs.handoff(params): Yield an authorized tab to its human owner and stop automated input.
- aux.history.search(params): Search the derived browser history index.

## Transport availability

| API path | RPC method | Layer | Docs | SDK | MCP | CLI | Code |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `aux.js.run` | `agent.js.run` | management | model | yes | yes | yes | — |
| `aux.js.reset` | `agent.js.reset` | management | lookup | yes | yes | yes | — |
| `aux.tabs.list` | `pages.list` | management | included | yes | yes | yes | yes |
| `aux.tabs.open` | `pages.open` | management | model | yes | yes | yes | — |
| `aux.tabs.close` | `pages.close` | management | model | yes | yes | yes | — |
| `aux.tabs.turn.open` | `agent.turn.open` | management | model | yes | yes | yes | yes |
| `aux.tabs.turn.end` | `agent.turn.end` | management | lookup | yes | yes | yes | yes |
| `aux.tabs.playwright.domSnapshot` | `pages.observe` | playwright | included | yes | yes | yes | yes |
| `aux.tabs.playwright.elementInfo` | `pages.elementInfo` | playwright | model | yes | yes | yes | yes |
| `aux.tabs.playwright.evaluate` | `pages.read` | playwright | lookup | yes | yes | yes | yes |
| `aux.tabs.playwright.extract` | `pages.extract` | playwright | model | yes | yes | yes | yes |
| `aux.tabs.playwright.waitFor` | `pages.waitFor` | playwright | model | yes | yes | yes | yes |
| `aux.tabs.dom.observe` | `pages.observe` | dom | model | yes | yes | yes | yes |
| `aux.tabs.dom.accessibilityHtml` | `pages.accessibilityHtml` | dom | lookup | yes | yes | yes | yes |
| `aux.tabs.dom.execute` | `pages.execute` | dom | included | yes | yes | yes | yes |
| `aux.tabs.dom_cua.observe` | `pages.observe` | dom | lookup | yes | yes | yes | yes |
| `aux.tabs.dom_cua.execute` | `pages.execute` | dom | lookup | yes | yes | yes | yes |
| `aux.tabs.ax.observe` | `pages.observe` | ax | lookup | — | — | — | — |
| `aux.tabs.ax.write` | `pages.execute` | ax | lookup | — | — | — | — |
| `aux.tabs.cua.capture` | `pages.capture` | cua | model | yes | yes | yes | yes |
| `aux.tabs.cua.execute` | `pages.cuaExecute` | cua | lookup | yes | yes | yes | yes |
| `aux.tabs.content.text` | `pages.observe` | content | model | yes | yes | yes | yes |
| `aux.tabs.dialog` | `pages.dialog` | management | lookup | yes | yes | yes | — |
| `aux.tabs.handoff` | `pages.takeover` | management | lookup | yes | yes | yes | yes |
| `aux.tabs.dev.logs` | `pages.console` | dev | lookup | yes | yes | yes | yes |
| `aux.history.search` | `history.list` | management | lookup | yes | yes | yes | yes |
| `aux.web.fetch` | `agent.web.fetch` | web | lookup | yes | yes | yes | yes |
| `aux.web.search` | `agent.web.search` | web | lookup | yes | yes | yes | yes |
| `aux.images.generate` | `agent.images.generate` | image | lookup | yes | yes | yes | — |

The AX layer requires an explicit `ax` capability and stays disabled until the accessibility benchmark supports enabling it. Pixel actions require a captured document epoch and viewport. Code mode has no Node, file system or raw DevTools handle; page writes re-enter the guarded RPC invoker.
