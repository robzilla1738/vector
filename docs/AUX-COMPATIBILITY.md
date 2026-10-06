# Aux compatibility register

Aux uses one native Chromium host and one runtime per Profile. Current implementation status is in [STATUS.md](STATUS.md), and the delivery plan is in [ROADMAP.md](ROADMAP.md).

| Surface | Canonical form |
|---|---|
| Runtime configuration | `AUX_*`; process environment overrides dotenv values |
| Runtime state | `aux-state.sqlite` in the Profile’s Aux Runtime Data directory |
| Runtime discovery | `runtime.json`; `AUX_RUNTIME_FILE` overrides discovery |
| Executables | `auxctl`, `aux-runtime`, `aux-mcp` |
| Browser host | Native Chromium, with the private CDP broker |
| Packages | `@aux/*` |
| MCP tools and URIs | Scoped `aux_*` tools and `aux://` resources |
| Development checks | Local `npm run check`; optional `npm run size` |

Public namespace availability, signing, notarization and release distribution remain separate work.
