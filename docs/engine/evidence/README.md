# Vector Engine evidence (VEC-001–025)

Each package lists the acceptance target, current-tree evidence, and remaining
gaps. Identity is the native Vector Engine (`vector-engine`), not Chromium.

**Labels follow Vector_Current_Review_60b2d41 Finding 6.** The supported testharness subset is adapted-harness coverage, not unmodified upstream. Official `html/dom/partial-updates` on pin 7c204383: 28 PASS / 2 FAIL of 30 (`sanitize-template-element`, `template-for-empty` — HTML5 contradictions; do not weaken empty-for-streaming). Official `html/dom/idlharness.https.html` fetches IDL over TLS and PASSes (0 FAIL subtests after V8 `MarkAsUndetectable` for `document.all`). That is that file only, not the entire web. Official `html/dom` tree numbers in `wpt-tree-latest.json` are not a claim that the entire web passes. Official JetStream Next on pin c603c04: SunSpider 12/12 PASS plus Default JS and wasm including Dart-flute-todomvc/Kotlin-compose/dotnet-interp/dotnet-aot/transformersjs-bert (`jetstream-default-latest.json`, 72 PASS / 0 FAIL / 0 NOTRUN of 72 executed names). That is not a JetStream geometric-mean published score. `browserbench --official-score` sets `VECTOR_PERFORMANCE_NOW=wall` so `performance.now()` is `Date.now()-timeOrigin` (WPT virtual time is unchanged). It uses JetStreamDriver.js per-test iteration/worstCaseCount (jsdom 15, typescript 1, Kotlin 5, default 120). Same-page `runIteration(i)`, `__resetSeed`, first/average/worst, `toScore`, geomean. All 72 Default names PASS in `jetstream-official-score-latest.json` (geomean 323.94, clock `performance.now`, `officialJetStreamGeometricMean` true). That is Vector same-page `runIteration` with `VECTOR_PERFORMANCE_NOW=wall`, not a browserbench.org hosted leaderboard result. Speedometer official Score loop: 32/32 PASS over 10 iterations (`speedometer-official-score-latest.json`, displayedScore 7.64, steps `lab-add-finish`, `officialSpeedometerScore` false). Lab add/finish is not `benchmark-runner.mjs`. That is not a published Score. MotionMark official ramp: 8/8 ScoreCalculator bootstrap medians (`motionmark-official-score-latest.json`, geomean 40.53, clock `performance.now`, `officialMotionMarkGeometricMean` true). That is Vector evaluate-pumped ramp with `VECTOR_PERFORMANCE_NOW=wall`, not a browserbench.org hosted leaderboard result. Canvas Arcs/Paths/Lines at 1.0 never dropped FPS. `gpu.multiply` stays NOTRUN without `--features gpu`. A 1-iteration lab p50 is not a published score. Official MotionMark 1.3 HTML: 8/8 names PASS (`motionmark-official-latest.json`); canvas-class and gpu.multiply remain adapted class probes. ve-vm remains research (V8 is production).

| Ticket | Evidence file | Status |
|---|---|---|
| VEC-001 | [VEC-001.md](VEC-001.md) | implemented |
| VEC-002 | [VEC-002.md](VEC-002.md) | implemented |
| VEC-003 | [VEC-003.md](VEC-003.md) | implemented |
| VEC-004 | [VEC-004.md](VEC-004.md) | implemented |
| VEC-005 | [VEC-005.md](VEC-005.md) | implemented |
| VEC-006 | [VEC-006.md](VEC-006.md) | implemented |
| VEC-007 | [VEC-007.md](VEC-007.md) | implemented |
| VEC-008 | [VEC-008.md](VEC-008.md) | implemented |
| VEC-009 | [VEC-009.md](VEC-009.md) | implemented |
| VEC-010 | [VEC-010.md](VEC-010.md) | implemented |
| VEC-011 | [VEC-011.md](VEC-011.md) | implemented |
| VEC-012 | [VEC-012.md](VEC-012.md) | implemented |
| VEC-013 | [VEC-013.md](VEC-013.md) | implemented |
| VEC-014 | [VEC-014.md](VEC-014.md) | implemented |
| VEC-015 | [VEC-015.md](VEC-015.md) | implemented |
| VEC-016 | [VEC-016.md](VEC-016.md) | implemented |
| VEC-017 | [VEC-017.md](VEC-017.md) | implemented |
| VEC-018 | [VEC-018.md](VEC-018.md) | implemented |
| VEC-019 | [VEC-019.md](VEC-019.md) | implemented |
| VEC-020 | [VEC-020.md](VEC-020.md) | implemented |
| VEC-021 | [VEC-021.md](VEC-021.md) | implemented |
| VEC-022 | [VEC-022.md](VEC-022.md) | implemented |
| VEC-023 | [VEC-023.md](VEC-023.md) | implemented |
| VEC-024 | [VEC-024.md](VEC-024.md) | implemented |
| VEC-025 | [VEC-025.md](VEC-025.md) | research track (V8 remains production) |

