# Aux rename compatibility register

This register documents intentional legacy identities during the staged migration.
The complete inventory and retirement work are requirements A1–A5 of AUX-ROADMAP.md.
No public namespace availability or external brand clearance has been established.

| Surface | Current change | Compatibility / remaining work |
|---|---|---|
| Runtime configuration | AUX_* canonical, VECTOR_* aliases | Normalize each source before merging; process env > first dotenv > later dotenv; canonical nonempty value wins within a source |
| Runtime data | New installs use OS data root / Aux Browser | Existing Library/Application Support/Vector used in place; two roots require explicit AUX_DATA_DIR; full backup/migration still pending |
| Database | New installations use aux-state.sqlite | Existing vector.sqlite used in place; two databases fail closed; no data moved |
| Runtime discovery | Shared runtime.json resolution in desktop/runtime/CLI/MCP | AUX_RUNTIME_FILE overrides discovery, VECTOR_RUNTIME_FILE accepted |
| Executables | auxctl, aux-runtime, aux-mcp aliases added | Legacy vector, vector-runtime, vector-mcp retained; help and package identities still being migrated |
| Browser chrome | Window/menu/title, engine badge and relevant settings use Aux | Aux Browser.app uses Aux display/menu names; internal package identity retained, signing/icon qualification pending |
| Browser profile | Explicit userData/sessionData pin; AUX_PROFILE_DIR override; persist:vector-default retained | New profiles use Aux Browser Profile (separate development profile); legacy @vector/desktop and marked Vector profiles retained in place; ambiguity fails closed. OS credential compatibility still pending |
| Engine paint profile | persist:vector-engine-paint retained | Separate persisted partition pending migration |
| Page marker | __vectorTid retained | Driver/shell protocol consumers must migrate together |
| Backend wire IDs | vector, chrome, vector-engine retained | Canonical chromium, attached-chromium, aux-engine need versioned adapters and persisted-state migration |
| Packages and Rust crates | @vector/* and ve-* retained | Coordinated import/lockfile/build/addon/package migration pending |
| MCP tools and URIs | Generated desktop config uses scoped aux_* connections; legacy clients keep vector_* browser tools; new task tools use aux_* | AUX_MCP_TOOL_PREFIX=aux requires a generated scoped token and fails closed for old broad configs; vector:// resources and hand-written legacy descriptor clients remain compatibility surfaces |
| Extensions | AUX_EXTENSION_PATHS remains a developer compatibility input; Settings installs managed unpacked copies | Managed enable/disable/removal is durable. Chrome Web Store, automatic updates and full Chrome API parity remain unqualified |
| Local development handoff | Fixed root manifests yield bounded JS/Python/Rust/Go readiness and reviewed build/check/service commands; files open through their macOS default app; linked Aux preview tabs expose bounded console/network diagnostics; task-bound summary, PR draft, portable patch and hashed manifest live beside project metadata; native approval can commit the exact reviewed tree locally with explicit author identity; explicitly connected GitHub, Vercel and Sentry accounts provide read-only repository/deployment/issue health | Patch preparation is capped at 2 MB and fails visibly when incomplete. Detection covers common npm/pnpm/yarn/bun, Python/uv/Poetry/Pipenv, Cargo and Go module markers, not every monorepo or toolchain. Preview evidence is page-scoped and does not prove process ownership. Local commits disable hooks, signing, credentials and network. Live service connections require user-supplied tokens. Remote PR creation and external publish remain disabled |
| Historical records | Original intent and engine evidence preserved | Clearly historical; active documentation progressively moves to Aux |
| CI distribution | Manual private artifact workflow; no tag publishing | Signing/update/distribution work remains separately gated |

All retained compatibility references must be reassessed before M1 is verified.
An adapter being present does not mean the complete rename has finished.
