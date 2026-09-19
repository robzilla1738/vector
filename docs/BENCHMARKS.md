# Benchmarks

Every published performance number has a row here. Numbers without a table row are not claims.

| Metric | Value | Profile | n | Source |
|---|---|---|---|---|
| `pages.observe` compact (records fixture) | 1.3 ms p50 | production-labelled agent path | 5 | `pnpm bench --backend both` / README |
| `pages.observe` full (records fixture) | 1.5 ms p50 | same | 5 | README |
| `pages.open` | 7.8 ms p50 | same | 5 | README |
| navigate + observe | 3.8 ms p50 | same | 5 | README |
| full observation size | 5,917 bytes | engine Compact/Full mix | 5 | README — canonical vs `docs/engine/architecture.md` §0 |
| `perf --gate m1` observe p95 | see last `perf` JSON | `production` | 200 | `cargo run --release -p perf -- --gate m1` |
| Speedometer 3.0 displayed | 1.83 | profiling input, not a target | — | `docs/ROADMAP.md` §3 |
| Speedometer 3.0 Chrome (same machine) | 11.6 ms TodoMVC-JavaScript-ES5 add/complete/delete (Google Chrome 148.0.7778.96) | tracked only | 1 | `docs/engine/evidence/speedometer-chrome-tracked.json`; not an official displayed score, not a target |
| Held-out mock 5.32× | retired | MockModelClient, n=1 | 1 | superseded by live row |
| Held-out live GPT 5.6 Luna | engine 5/15 verified (find-in-table 5/5); median wait 1119 ms, IQR 98, CI 849–1734; competitor 5/15 median 1858 ms | live planner `openai/gpt-5.6-luna-fast` | 5 trials × 3 tasks | `docs/engine/evidence/held-out-latest.json`; increment/submit oracles failed; not a stretch-target score |

Architecture §0 previously listed full observation as 13,148 bytes. That row is superseded by the README table (5,917 bytes) until a new `pnpm bench` run is committed.
