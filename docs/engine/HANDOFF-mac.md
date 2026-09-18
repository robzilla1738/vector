# Mac review status

Branch `cursor/vector-current-review-418e`. PR: https://github.com/robzilla1738/vector/pull/11

Mac pickup of `Vector_Current_Review_60b2d41` on this development tree. Windows, GitHub Release, and `v*` tags are out of scope.

## Product

`pnpm dev` is the product: `ve-shell --gui --service 127.0.0.1:0` plus a Node runtime client on `VECTOR_BROWSER_SERVICE`. Default URL `http://127.0.0.1:4810/records`. Env: `VECTOR_ENGINE_MODE=always` (desktop default if unset), `VECTOR_SHELL`, `VECTOR_ENGINE_HOST`, `VECTOR_RESOURCES`. Packaged desktop sets `VECTOR_ENGINE_PROFILE=production` (`apps/desktop/main/runtime-env.ts`). Unpackaged stays developer unless that env is set. `pnpm dev:electron` is hybrid Electron, not the product. EngineView is the desktop surface. `dev:mock` / Vite is not EngineView.

## Mac-run exits (this machine)

| Gate | Proof |
|---|---|
| A | `cargo test -p ve-host --features v8 --test process --test containment`: 13 + 4 PASS. Production `ve-host` runs V8 under `sandbox_init`. Node loop with `VECTOR_ENGINE_PROFILE=production`: `runtime.describe` shows `securityProfile=production`, `isolation=process`, `hostPath` matching `ve-host` |
| B | `cargo test -p ve-shell --features window,v8 --test window`: live OS window and MCP share one page. IME, takeover, resize, wheel, AccessKit action, display-list scene. `ve-api` IME preedit, selection/copy, GPU present + MCP share |
| C | `ve-agent` `review_behavior_counterexamples` and `stream_lock_bodyused` PASS. Official `html/dom/partial-updates` pin `7c204383`: **28 PASS / 2 FAIL of 30**. Combined Mac tree-family run (official + `testharness.txt`): **142 PASS / 2 FAIL of 144** (`wpt-partial-updates-latest.json`). Kept FAILs: `sanitize-template-element`, `template-for-empty` |
| D | `tests/unit/review-gates.test.ts` 19/19, including fixture write counter |
| E | `concurrency_tail_and_process_tree_memory` PASS. Bench JSON under `docs/engine/evidence/` is Vector runners with `VECTOR_PERFORMANCE_NOW=wall`, not hosted BrowserBench |
| F | `tests/integration/mcp-live.test.ts` open/observe/execute/takeover/resume. Action compiler and page query in `review-gates.test.ts` |

Always-mode native loop: `VECTOR_REQUIRE_ENGINE=1 VECTOR_ENGINE_PROFILE=production` `tests/integration/vector-engine.test.ts`. After filter GET, `documentEpoch` is greater than the observe-before value. Production `routeReason` is `native-only` (fail-closed). Developer always-mode stays `engine-always`.

## Official html/dom (keep FAIL)

Pin `7c20438303d2b39c8a2b924ed57dfa6448fd2ed2`. Do not weaken `sanitize-template-element` or `template-for-empty`. See `docs/engine/evidence/behavior-results.json`.

Mac fix that closed `src-referrerpolicy.sub.html`: `Page::pump_virtual_time` completes pending script fetches and follow-up testharness `step_timeout` + `fetch()` inside the requested horizon (`engine/crates/ve-agent/src/page.rs`). It does not jump past `ms`, so src-streaming chunk 2 (delay 300) stays off during a 50ms pump. Bindings: `pump_virtual_time_completes_pending_fetch`, `pump_virtual_time_does_not_jump_past_horizon`, `pump_virtual_time_finishes_second_timeout_then_fetch`, `pump_virtual_time_long_horizon_finishes_timeout_fetch_chain`.

## Vector runners, not hosted BrowserBench

| Runner | File | Number |
|---|---|---|
| Speedometer 10-iter Score | `speedometer-official-score-latest.json` | 32/32 names, displayedScore 1.83, `officialSpeedometerScore` true |
| JetStream Default | `jetstream-official-score-latest.json` | 72/72, geomean 323.94, `officialJetStreamGeometricMean` true |
| MotionMark ramp | `motionmark-official-score-latest.json` | 8/8, geomean 40.53, `officialMotionMarkGeometricMean` true |

`officialFullSuite` is false. `--official-score` uses `VECTOR_PERFORMANCE_NOW=wall`.

## Not run

Live VoiceOver.app. Packaged signed `.app`. Official Speedometer/JetStream/MotionMark re-score on this machine. Windows addon.

Landmines: do not weaken the two official html/dom FAILs. Do not call the bench numbers hosted BrowserBench scores. Do not push a `v*` tag. `apps/desktop` `dev:mock` / Vite is not EngineView on vector-engine.
