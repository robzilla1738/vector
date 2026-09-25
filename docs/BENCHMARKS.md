# Benchmarks

Every published performance number has a row here. Numbers without a row are not
claims. Engine-era rows (the removed custom engine, Speedometer, frame gates) are
frozen in [archive/perf-engine](archive/perf-engine/).

New browser-layer reports retain each raw sample and include deterministic
nonparametric 95% bootstrap intervals for p50 and p95 (2,000 resamples). The
intervals describe measurement uncertainty; a fixture or headless report does
not qualify the native Chromium shell targets in the reviewed roadmap.

The [native Aux versus same-tag Chromium runner](native-benchmark.md) records
FirstPaint and input-to-presented-tab-switch UMA samples. It has no published
result until both benchmark builds complete the 20-trial qualification run.

The rows below are historical measurements at their named builds. They do not establish v2 native performance or current agent success. New v2 measurements must name the commit, build flavour (component trend or static claim), power state, raw artifact, and p50/p95 bootstrap intervals.

## Browser layer (`pnpm bench`)

Records fixture, headless standalone Chromium, darwin arm64, p50. Reports are
written to `tests/benchmarks/reports/` (gitignored). CI runs
`pnpm bench --repeats 5 --check-budgets` against `scripts/budgets.json`.
That five-trial run is a regression smoke; the qualification run uses at least
20 trials under the section 8 controls.

| Metric | Value | Build | n | Notes |
|---|---:|---|---:|---|
| `click.nav.step` | 158 ms | `main` 2b323d5a | 5 | Playwright click waited for the form navigation |
| `click.nav.step` | 7 ms | `aux-excellence` | 10 | raw CDP dispatch; next read waits only for an in-flight commit |
| `click.nonav.step` | 66 ms | `main` 2b323d5a | 5 | Playwright actionability checks |
| `click.nonav.step` | 9 ms | `aux-excellence` | 10 | one in-page hit test, three `Input` events |
| `fill.ref.step` | 5 ms | `aux-excellence` | 10 | |
| `observe.full` | 32 ms | `aux-excellence` | 10 | isolated-world one-pass walk; load ≈ 14 |
| `navigate+observe` | 44 ms | `aux-excellence` | 10 | load ≈ 14; 21 ms on an idle machine |
| full observation | 9,593 bytes | `main` 2b323d5a | 5 | |
| full observation | 4,117 bytes | `aux-excellence` | 10 | selectors/rects/links/console stay server-side |
| MCP full observation | 6,760 bytes | `aux-excellence` | 10 | was 16,280 |

Transport: `--transport http` adds the loopback API (auth, zod, JSON) to every call.

## Agent surfaces

| Metric | Value | Build | Source |
|---|---:|---|---|
| MCP `tools/list`, default scoped catalog | 20.4 KB | `aux-excellence` | `tests/unit/mcp-stdio.test.ts` (was 98.7 KB) |
| MCP `tools/list`, with project tools | 46.5 KB | `aux-excellence` | same |
| `aux_page_execute` input schema | 5.3 KB | `aux-excellence` | flat step schema (was 64.5 KB) |

## Desktop

| Metric | Value | Build | Source |
|---|---:|---|---|
| Renderer startup JS | 446 KB | `aux-excellence` | `pnpm budgets` (was 883 KB) |
| Renderer startup CSS | 184 KB | `aux-excellence` | `pnpm budgets` (was 196 KB) |
| Packaged app (`dir`, arm64) | 251.6 MB | `aux-excellence` | `pnpm package:local`; Electron framework 232.8 MB of it (was 357 MB) |

## Tasks (`pnpm bench:tasks`)

Runs three trials per task by default with a fixture reset before each task and
reports pass@1, pass@k and flaky tasks. The last published run is 2026-09-15 (one
trial, `alibaba/qwen3.8-27b`): `aux` 6/8, `aux-mcp` 8/8, `playwright-mcp` 8/8. It
predates planner memory, grounded completion checks and the compact MCP catalog;
re-run before quoting a current number.
