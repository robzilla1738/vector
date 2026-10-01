# Benchmarks

**September 30, evening PT.** The owner stopped the paid 50×3 before a complete comparison. A finished call settles to reported usage, so the 16-call ceilings cost $24.76584, and the runner forecast is $15. Both fit the $46.065750631 that remained before the attempt. The remaining ledger was not why the owner stopped it. The partial local report `tests/benchmarks/reports/tasks-local-2026-10-01T02-13-17-435Z.json` is gitignored, `complete: false`, and `valid: true`. Planner arm `aux` has 79 of 150 rows on `meta/muse-spark-1.3-contributor` (trial 1 finished all 50, trial 2 through L29, 51 passes and 28 fails). The loop arm never started, and `abReadiness.ready` is false. Live ledger after the stop: committed $3.9699201, reserved $0.031831003 across 11 unsettled rows, remaining $45.998248897 of $50. The earlier unauthenticated report `tests/benchmarks/reports/tasks-local-2026-10-01T01-10-22-132Z.json` stays `complete: false` and `valid: false`. No planner deletion and no S5 qualification. Published to origin/codex/roadmap-integration (`bf375e85`, `df14a8fc`). The September 28 notes below stay as written.

**Latest S5 frozen partial A/B, September 28 (`918a1c10`).** [The retained report](/Users/rcourson/.codex/worktrees/aux-roadmap-native-data/web/tests/benchmarks/reports/tasks-local-2026-09-29T01-50-27-960Z.json) has planner 150/150 valid rows on Muse Spark 1.3 Contributor: 97/150 passed (64.7% pass@1), 2.107 mean calls, 3.029 multistep mean calls, 44 unresolved durable intents and zero ledger duplicates. Loop stopped at 8/150 after L06 opened an inline edit form but its receipt remained uncertain; 12 calls/175 seconds could not reconcile it. `complete:false` and `abReadiness.ready:false` prevent an efficiency or planner-removal conclusion. The S5 lane repaired inline-edit receipt proof and a native-select predispatch refusal, then [focused L06](/Users/rcourson/.codex/worktrees/aux-roadmap-native-data/web/tests/benchmarks/reports/tasks-local-2026-09-29T02-37-11-110Z.json) passed 1/1 in 7 attributed Contributor calls with two confirmed and zero unresolved intents. A justified new full same-build 50×3 A/B is running on frozen `5a9638cb`; no gate result is claimed yet. Shared ledger after this partial window: $2.881291387 committed, $0.008435601 reserved, $47.110273012 remaining.

**Current S5 gate, September 28, 2026.** A same-build 50×3 Contributor planner/loop comparator stopped at a concrete loop blocker: planner 150/150 valid (52.0% pass@1, 1.493 mean calls) and loop 8/150, so A/B readiness is false. [Partial report](/Users/rcourson/.codex/worktrees/aux-roadmap-native-data/web/tests/benchmarks/reports/tasks-local-2026-09-29T01-07-16-790Z.json). The isolated repair `4e1abaf9` rejects trailing download waiters before dispatch and strips bulky reasoning metadata during compaction; 66 focused tests passed and saved L08 context compacted to 138,441 bytes. One focused Contributor-only [L08 retest](/Users/rcourson/.codex/worktrees/aux-roadmap-native-data/web/tests/benchmarks/reports/tasks-local-2026-09-29T01-33-23-445Z.json) still failed 13 calls/0 oracle with one unresolved intent, without the prior compaction error. Ledger: $2.757591817 committed, $0.008435601 reserved, $47.233972582 remaining. No full gate or planner deletion follows; inspect the unresolved receipt before another paid call.

**Latest S5 diagnostic, September 28, 2026.** In the isolated S5 lane, one justified Muse Spark 1.3 Contributor L40 trial passed its oracle in four observed model calls with one confirmed and zero unresolved intents (49.3 s). The report is local to the S5 lane at `tests/benchmarks/reports/tasks-local-2026-09-29T01-06-01-704Z.json`. Shared ledger afterward: $2.680955061 committed, $0.006025001 reserved, $47.313019938 remaining. The full comparable 50×3 planner/loop A/B started afterward and remains in progress; this one-task diagnostic is not the S5 gate, and the planner remains. The later diagnostic supersedes the historical failed L40 descriptions below.

**Earlier S5 qualification note, September 28, 2026.** The latest Contributor-only L40 diagnostic on agent source `fdda8012` failed at six calls/0 oracle in 158 seconds; it is a one-task trace, not a corpus result. Its copied-link-name defect and subsequent partial-navigation/context/accounting gaps have deterministic source fixes through integrated `bfc71328`, with no paid validation after those fixes. The shared ledger stood at $2.661855465 committed, $0.006025001 reserved and $47.332119534 remaining after that diagnostic. The new [report-integrity helper](../tests/benchmarks/tasks/report-integrity.mjs) records the 50-task manifest SHA-256, selection, effective engine/model/call cap, durable intent status counts and nonexclusive ledger windows, and rejects a partial or unequal-budget A/B comparison. Its 4 tests and manifest validation passed; no new 50×3 A/B has run. Current and retained planner-era manifest bytes hash identically (`f5543f423a1e0e0bd8090baa5f4294ae355da176064278ad8031bc13ab1a7934`), and both code eras default to 16 model calls, but the retained report lacks per-row effective cap/provenance. The planner remains until a valid comparable full gate passes. No performance or cost improvement is claimed from the one-task diagnostic.

**Current S5 checkpoint, September 28, 2026.** A later one-task Contributor-only L40 diagnostic on agent source `feefed6f` failed at four model calls/0 oracle when hidden modal text was mistaken for fresh proof. Deterministic visible-modal repair and durable `model.call` attribution are integrated through `f0e346ba`, but no paid rerun followed. Shared ledger: $2.669875057 committed, $0.006025001 reserved, $47.324099942 remaining. The 50×3 comparable A/B, held-out tasks and planner-deletion decision remain open. The preceding six-call note is historical, not the latest diagnostic.

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
