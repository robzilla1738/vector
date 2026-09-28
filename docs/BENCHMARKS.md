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

The separate [native command-bar instrument](../tests/benchmarks/native-command-bar.mjs) measures a 50,000-URL Chromium History fixture in the built Aux WebUI. On September 28, pinned source `970adc61`, AuxDev component build, battery power, and 20 queries, the [raw artifact](../release/test-artifacts/native-s11-command-latency-layout-2026-09-28/manifest.json) records p50 **30.5 ms** (95% bootstrap interval 30.3–30.6) and p95 **30.8 ms** (30.6–32.4). CDP inserts text and the second animation frame approximates presentation. This is a trend, not the M4 ≤30 ms qualification; the target remains open.

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
reports pass@1, pass@k and flaky tasks.

### S5 planner-versus-loop A/B gate — 2026-09-26

50-task fixture corpus (records, forms, interaction, modal, attachment,
embedded-frame) × 3 trials, model `meta/muse-spark-1.3-contributor`, both
adapters on the same build (`015df813` plus the answer-extraction,
uncertain-settle and terse-answer fixes committed alongside this row). Report:
`tests/benchmarks/reports/tasks-local-2026-09-26T12-52-46-585Z.json`. Spend is
the recorded `actual_nanos` from the shared AI Gateway spend ledger attributed
per call timestamp.

| Adapter | Engine | pass@1 | pass@3 | mean calls | mean tokens | spend | p50 | p95 | flaky |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `aux` | `agent` (legacy planner) | 46.0% (23/50, sd 0) | 46.0% | 1.7 | 5.1K | $0.0575 | 4.1 s | 33.0 s | — |
| `aux-loop` | `agent-loop` (durable loop v2) | **90.0%** (45/50, sd 0) | **98.0%** | 4.4 | 130.4K | $0.2338 | 8.1 s | 28.1 s | 11 |

**Decision (ROADMAP S5 item 10):** v2 beats the planner on pass@1 by 44 points
but uses ~2.6× more model calls and ~25× the tokens, so the deletion clause
("matches or beats on pass@1 *with fewer calls*") is **not satisfied — the
planner stays** (`AUX_RUN_ENGINE` selects the engine). The durable loop's
remaining fails are dominated by uncertain-dispatch write blocks on the rich
form task and intermittent provider tool-call markup leaks; the planner's are
structural (it cannot open modals or re-observe after acting). The S14
qualification bar (§line 155: ≥30% fewer calls than the planner baseline on
multi-step tasks) is also not yet met; call-count reduction is open work.

### S5 loop call-count rerun — 2026-09-26 afternoon

Same 50×3 fixture corpus and model, loop only, at `bfc70693`. The planner row
above is the baseline; it was not rerun. Report:
`tests/benchmarks/reports/tasks-local-2026-09-26T16-26-47-494Z.json`.
Spend is the ledger delta for this run, $0.2121.

| Adapter | Engine | pass@1 | pass@3 | mean calls | multi-step mean calls | mean tokens | spend | p50 | p95 | flaky |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `aux-loop` | `agent-loop` | **95.3%** (47/47/49 of 50, sd 0.94) | **98.0%** | 2.640 | 4.246 (n=69) | 79.9K | $0.2121 | 3.8 s | 21.5 s | 3 |

**Decision:** pass@1 still beats the planner (46.0%). Mean calls 2.640 do not
beat 1.707, and the multi-step mean 4.246 does not beat 1.653 (30% under the
planner's 2.362). The deletion clause is **not satisfied — the planner stays**.
Rows that finished without a 16-call uncertain block still average about 3.2
model calls on multi-step tasks. That floor is the navigate-then-act-then-submit
shape, not a retry loop.
