# Aux clean-room workspace

Aux is an independently implemented local browser targeting the behavior and visual layout documented in `docs/spec/`. The accepted plan is `/Users/rcourson/.factory/specs/2026-10-19-aux-v1-clean-room-rebuild-to-full-aside-parity-multi-agent.md`. It supersedes the former vendoring architecture and wire-contract requirements. Read `docs/spec/README.md`, `docs/design/names.md` and `docs/STATUS.md` first.

## Clean-room boundary

- Spec agents may inspect the reference app and supplied reference artifacts. They write original behavior specs with provenance and capture screenshots only with disposable profiles. No reference code, assets, font, identifiers or UI prose may enter shipped sources.
- Build agents read only approved `docs/spec/`, reference screenshots and public upstream documentation. They must never open reference bundles, decompiles, `vendor/aside/`, `out/aside-staged/`, `aside-rea 2`, or `AI Blueprints/06`. Start fresh build agents rather than reusing spec agents.
- Specs describe behavior, data shapes, measurements, errors and states in original words. Mark sections `ready` only when supported by evidence; record unknowns explicitly. Build slices cite their spec sections.
- New internal names use Aux throughout. The name mapping lives in `docs/design/names.md`. Reference provenance belongs in `docs/spec/provenance.md`.
- Assets must be original or independently licensed upstream assets. Use Lucide (ISC), Geist/Geist Mono (OFL) and licensed upstream Chromium/npm dependencies with attribution.

## Layout and ownership

- `packages/contracts`, `packages/ui`, `packages/agent`, `packages/skills`, `packages/filter-lists`: shared contracts, design system, agent engine, built-in skills and filter catalog.
- `apps/daemon`, `apps/extension`, `apps/vault`, `apps/cli`, `apps/computer-use`, `apps/password-importer`, `apps/memory`: independent application components.
- `chromium/patches/aux/`: existing native work and new patches starting at 0086.
- `scripts/`: independent launcher, build, packaging, provenance and acceptance tooling.
- `docs/spec/`: build-facing behavior specifications. `out/reference/`: gitignored reference evidence and hash index.
- Legacy vendoring stays isolated until replacement acceptance; it must not be used as a build template or shipped in the rebuilt app.

## Working rules

- Integrator commits coherent slices to local `main`; lanes use their own worktrees and deliver commits for integration. Never push or run hosted Actions. No developer signing, notarization, release or cloud work. Ad hoc signing for local packaging is permitted by the accepted plan.
- Work in parallel on substantial, disjoint lanes. The integrator owns root manifests, patch series, GN roots, browser startup and prefs, API registration and GRD files. Request shared edits instead of racing them.
- Native lanes share the existing Chromium checkout, edit disjoint paths, and serialize builds through `/tmp/aux-build.lock`. Never reset the checkout or delete owner changes.
- Never print or commit credentials. `.env` contains `AI_GATEWAY_API_KEY`. AI tests use only `vercel-ai-gateway/meta/muse-spark-1.3-contributor`, stored via the rebuilt model credential API under `$AUX_HOME/u/<account>/credentials.json`.
- Use disposable profiles. Ask before touching the owner's real browser profiles. Retire a process only after verifying its live identity; historical PIDs are not authorization to kill an unrelated process.
- Unsigned Chromium uses `--use-mock-keychain`.
- Keep verification lean: focused tests for contracts, signing/auth, crypto, filters and scheduling; typecheck/lint, clean-room checks and daemon smoke per integrated slice; native compilation and disposable-profile observation after native changes. Final parity and task evidence must cover the full plan.
- Record actual progress, evidence and remaining gaps in `docs/STATUS.md`. Do not call scaffolding or unverified stubs complete.
