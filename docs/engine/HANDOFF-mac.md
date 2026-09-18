# Mac handoff

Branch `cursor/vector-current-review-418e`. PR: https://github.com/robzilla1738/vector/pull/11

Implementing HEAD (what CI below ran on): `1d95619490127ee83ac3da16ea078332f54dc363`. This file is a later docs-only commit on the same branch.

Do not mark the review complete from this file. This VM did not open your `.app`.

## 1. What is live now

**Checkout.** `pnpm dev` is the product: `ve-shell --gui --service 127.0.0.1:0` plus a Node runtime client on `VECTOR_BROWSER_SERVICE`. Default URL `http://127.0.0.1:4810/records`. Env the product uses: `VECTOR_ENGINE_MODE=always` (desktop default if unset), `VECTOR_SHELL`, `VECTOR_ENGINE_HOST`, `VECTOR_RESOURCES`. Packaged desktop sets `VECTOR_ENGINE_PROFILE=production` (`apps/desktop/main/runtime-env.ts`). Unpackaged stays developer. `pnpm dev:electron` is hybrid Electron, not the product. EngineView is the desktop surface. `dev:mock` / Vite is not EngineView.

**GitHub macos-latest on `1d95619`.** Runtime run https://github.com/robzilla1738/vector/actions/runs/35379205478 — job `Electron e2e (macOS)` SUCCESS, 4/4 (`tests/e2e/desktop.test.ts`): open/observe/execute on `vector-engine`, two tabs, parallel background programs, takeover blocks dispatch. Built `vector-engine.darwin-arm64.node`. Job `typecheck + unit (macos-latest)` SUCCESS. Engine run https://github.com/robzilla1738/vector/actions/runs/35379205682 on the same commit: `test (macos-latest)`, `clippy (macos-latest)`, `fmt (macos-latest)`, `@vector/engine-native (macos-latest)` SUCCESS. `@vector/engine-native (windows-latest)` was still `in_progress` when this was written; ignore it.

**Ubuntu only (same runtime run).** Job `integration (vector-engine backend)` SUCCESS, including `documentEpoch` after form GET.

**Vector runners, not hosted BrowserBench.** Evidence under `docs/engine/evidence/`. `officialFullSuite` is false on those reports. `--official-score` uses `VECTOR_PERFORMANCE_NOW=wall`.

| Runner | File | Number |
|---|---|---|
| Speedometer 10-iter Score | `speedometer-official-score-latest.json` | 32/32 names, displayedScore 1.83, `officialSpeedometerScore` true |
| JetStream Default | `jetstream-official-score-latest.json` | 72/72, geomean 323.94, `officialJetStreamGeometricMean` true |
| MotionMark ramp | `motionmark-official-score-latest.json` | 8/8, geomean 40.53, `officialMotionMarkGeometricMean` true |

**Official html/dom FAILs (keep FAIL).** Pin `7c20438303d2b39c8a2b924ed57dfa6448fd2ed2`: `sanitize-template-element`, `template-for-empty`. See `docs/engine/evidence/behavior-results.json` and `wpt-partial-updates-latest.json`.

**Gate D.** `compileAndAuthorize` in `apps/runtime/src/agent/action-compiler.ts` (member-agent, set-runner, coordinator, operations). `beginConsequentialWrite` in `apps/runtime/src/agent/durable.ts`. Fixture write counter: `GET|POST /api/writes` in `fixtures/forms-app/serve.ts`. Test: `tests/unit/review-gates.test.ts` “Gate D fixture write counter”.

## 2. What is left

**Always-mode native loop on your Mac.** Test: `tests/integration/vector-engine.test.ts` line 110 (`res.observation!.documentEpoch` must be `>` the observe-before value). Last GitHub FAIL: commit `f6301fa`, job `integration (vector-engine backend)` on https://github.com/robzilla1738/vector/actions/runs/35378067876 — URL became `status=approved`, assertion `expected 0 to be greater than 0`. Envelope must set `navigated` + `generation` (`engine/crates/ve-api/src/service.rs` `flatten_execute` ~173). `VectorEnginePage.absorb` (`packages/browser-driver/src/vector-engine.ts` 358–377) fires `onNavigated`. `PageService.wireDriverEvents` (`apps/runtime/src/services/pages.ts` 435) writes `documentEpoch`. Ubuntu on `1d95619` is green; that does not prove your Mac desktop.

**Gate A on Mac only.** Packaged desktop must be `VECTOR_ENGINE_PROFILE=production` → `securityProfile: "production"`, `isolation: "requireProcess"` (`apps/runtime/src/main.ts` 152–166). Prove on your machine: `pnpm package:electron` (or a packaged `.app`), launch it, `runtime.describe` shows `engine.securityProfile === "production"` and process isolation / `hostPath` to `ve-host`. Unpackaged `pnpm dev` / `pnpm dev:electron` is developer. CI e2e already sets `VECTOR_ENGINE_PROFILE=production` on macos-latest; that is the GitHub path, not your signed `.app`.

**This Linux agent could not prove.** Opening your `.app`. IME. VoiceOver. GPU.

## 3. How you pick up

```bash
git clone https://github.com/robzilla1738/vector.git
cd vector
git fetch origin cursor/vector-current-review-418e
git checkout cursor/vector-current-review-418e
git log -1 --oneline   # implementing SHA 1d95619 plus this handoff commit
pnpm install --frozen-lockfile
pnpm build
pnpm --filter @vector/engine-native build:cargo   # cargo -p ve-napi --features napi + cargo -p ve-host --features v8
```

Native product (`pnpm dev` needs `ve-shell`):

```bash
# optional prebuild; otherwise pnpm dev cargo-runs it
(cd engine && cargo build -p ve-shell --features window,v8,http)
pnpm dev
```

Hybrid desktop (EngineView, not ve-shell GUI):

```bash
pnpm --filter @vector/desktop build
VECTOR_ENGINE_MODE=always VECTOR_ENGINE_PROFILE=production pnpm dev:electron
```

CI twins:

```bash
VECTOR_ENGINE_MODE=always VECTOR_ENGINE_PROFILE=production pnpm test:e2e
VECTOR_REQUIRE_ENGINE=1 pnpm exec vitest run tests/integration/vector-engine.test.ts
```

Read first: `scripts/dev.mjs`, `apps/desktop/main/runtime-env.ts`, `apps/runtime/src/main.ts`, `tests/e2e/desktop.test.ts`, `tests/integration/vector-engine.test.ts`.

Landmines: do not weaken the two official html/dom FAILs. Do not call the bench numbers hosted BrowserBench scores. Do not push a `v*` tag. `apps/desktop` `dev:mock` / Vite is not EngineView on vector-engine.
