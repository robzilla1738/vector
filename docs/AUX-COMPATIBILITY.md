# Aux compatibility register

> Host scope, September 24: this document describes the existing Electron development/package baseline unless explicitly labeled otherwise. Chromium is now the intended architecture with a partial executable proof; these instructions and feature results do not qualify the fork. Start with [the current handoff](HANDOFF.md) and [candidate runbook](../experiments/chromium-fork/CONTINUATION.md). No signed release is claimed.

The development reset completed the Vector→Aux rename. Legacy names are not
accepted anymore; this register records the canonical surfaces and the
intentional boundaries that remain. No public namespace availability or
external brand clearance has been established.

| Surface | Canonical form | Notes |
|---|---|---|
| Runtime configuration | `AUX_*` only | Process env > first dotenv > later dotenv. `VECTOR_*` keys are ignored |
| Runtime data | OS data root / `Aux Browser` | A legacy `Vector` data directory is preserved untouched and never selected |
| Database | `aux-state.sqlite`, schema `user_version` 1 | A `vector.sqlite` in the selected directory fails closed with a recoverable message; it is never opened, migrated, or deleted |
| Runtime discovery | Shared `runtime.json` resolution in desktop/runtime/CLI/MCP | `AUX_RUNTIME_FILE` overrides discovery |
| Executables | `auxctl`, `aux-runtime`, `aux-mcp` | |
| Browser chrome | Window/menu/title and settings use Aux | `Aux Browser.app` uses Aux display/menu names; signing/icon qualification pending |
| Browser profile | `Aux Browser Profile` (`Aux Browser Development Profile` unpackaged); `AUX_PROFILE_DIR` override; `persist:aux-default` | Legacy `Vector`/`@vector/desktop` profile directories are left in place and ignored |
| Page marker | `__auxTid` | Driver/shell protocol detail; not a public contract |
| Backend wire IDs | `aux` (managed Chromium), `chrome` (attached external Chrome) | Connection kind, not engine family — both are Chromium |
| Packages | `@aux/*` (`@aux/chromium-driver` for the browser driver) | The ve-* Rust crates moved to the `engine-track` branch |
| MCP tools and URIs | Scoped `aux_*` tools, `aux://` resources | A generated scoped `AUX_MCP_TOKEN` is always required; unscoped configs fail closed |
| Extensions | `AUX_EXTENSION_PATHS` developer input; Settings installs managed unpacked copies | Managed enable/disable/removal is durable. Chrome Web Store, automatic updates and full Chrome API parity remain unqualified |
| Local development handoff | Fixed root manifests yield bounded JS/Python/Rust/Go readiness and reviewed build/check/service commands; files open through their macOS default app; linked Aux preview tabs expose bounded console/network diagnostics; task-bound summary, PR draft, portable patch and hashed manifest live beside project metadata; native approval can commit the exact reviewed tree locally with explicit author identity; explicitly connected GitHub, Vercel and Sentry accounts provide read-only repository/deployment/issue health | Patch preparation is capped at 2 MB and fails visibly when incomplete. Detection covers common npm/pnpm/yarn/bun, Python/uv/Poetry/Pipenv, Cargo and Go module markers, not every monorepo or toolchain. Preview evidence is page-scoped and does not prove process ownership. Local commits disable hooks, signing, credentials and network. Live service connections require user-supplied tokens. Remote PR creation and external publish remain disabled |
| Historical records | Original intent and engine evidence preserved | Clearly historical; active documentation is canonical |
| CI distribution | Manual private artifact workflow; no tag publishing | Signing/update/distribution work remains separately gated |

After the external beta starts, new Aux schema versions receive tested
migrations and recovery; that lifecycle boundary is intentional even though
legacy Vector compatibility was removed.
