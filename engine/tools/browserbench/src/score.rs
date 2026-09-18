//! Official JetStream Next scoring from `JetStreamDriver.js` at pin c603c04.
//!
//! `toScore(ms) = 5000 / max(ms, 1)`.
//! `DefaultBenchmark`: first iteration split from the rest; remaining sorted
//! descending; `worstCaseCount` default 4; average of remaining; per-test
//! score is the geomean of First / Worst / Average. Overall published score
//! is the geomean of those per-test scores.
//!
//! A 1-iteration lab p50 is not this. Do not write `officialJetStreamGeometricMean`
//! true unless every official Default name ran `defaultIterationCount` (120)
//! with this split.

/// Lab iteration timer. Official `JetStreamDriver.js` uses `performance.now()`.
/// Vector's `performance.now()` is virtual, so this is wall `Date.now()`.
pub const LAB_ITERATION_CLOCK: &str = "Date.now-wall";

/// Official `defaultIterationCount` in `JetStreamDriver.js`.
pub const DEFAULT_ITERATION_COUNT: u32 = 120;

/// Official `defaultWorstCaseCount` in `JetStreamDriver.js`.
pub const DEFAULT_WORST_CASE_COUNT: usize = 4;

/// Official `toScore(timeValue)`.
#[must_use]
pub fn to_score(time_ms: f64) -> f64 {
    5000.0 / time_ms.max(1.0)
}

/// Official `geomeanScore`. Empty or non-positive inputs are not a score.
#[must_use]
pub fn geomean(values: &[f64]) -> Option<f64> {
    if values.is_empty() || values.iter().any(|v| *v <= 0.0) {
        return None;
    }
    let product: f64 = values.iter().copied().product();
    Some(product.powf(1.0 / values.len() as f64))
}

/// Official `DefaultBenchmark` first / average / worst split.
#[derive(Clone, Debug, PartialEq)]
pub struct OfficialDefaultScore {
    pub first_ms: f64,
    pub first_score: f64,
    pub average_ms: f64,
    pub average_score: f64,
    pub worst_ms: f64,
    pub worst_score: f64,
    pub score: f64,
}

/// Complete official DefaultBenchmark score. Needs `1 + worst_case_count`
/// samples (`iterations > worstCaseCount` in the official driver).
#[must_use]
pub fn official_default_score(
    samples_ms: &[u64],
    worst_case_count: usize,
) -> Option<OfficialDefaultScore> {
    if samples_ms.is_empty() {
        return None;
    }
    let first_ms = samples_ms[0] as f64;
    let first_score = to_score(first_ms);
    // typescript-lib: iterations=1, worstCaseCount=0. Score is First only.
    if samples_ms.len() == 1 && worst_case_count == 0 {
        return Some(OfficialDefaultScore {
            first_ms,
            first_score,
            average_ms: first_ms,
            average_score: first_score,
            worst_ms: first_ms,
            worst_score: first_score,
            score: first_score,
        });
    }
    if worst_case_count > 0 && samples_ms.len() <= worst_case_count {
        return None;
    }
    let mut rest: Vec<f64> = samples_ms[1..].iter().map(|s| *s as f64).collect();
    rest.sort_by(|a, b| b.partial_cmp(a).unwrap_or(std::cmp::Ordering::Equal));
    let average_ms = rest.iter().sum::<f64>() / rest.len() as f64;
    let average_score = to_score(average_ms);
    let (worst_ms, worst_score, score) = if worst_case_count == 0 {
        (
            average_ms,
            average_score,
            geomean(&[first_score, average_score])?,
        )
    } else {
        let worst_ms = rest[..worst_case_count].iter().sum::<f64>() / worst_case_count as f64;
        let worst_score = to_score(worst_ms);
        (
            worst_ms,
            worst_score,
            geomean(&[first_score, worst_score, average_score])?,
        )
    };
    Some(OfficialDefaultScore {
        first_ms,
        first_score,
        average_ms,
        average_score,
        worst_ms,
        worst_score,
        score,
    })
}

/// Official `JetStreamDriver.js` iteration clock. Vector's `performance.now()`
/// is virtual unless `VECTOR_PERFORMANCE_NOW=wall` rebases it onto `Date.now()`.
pub const OFFICIAL_ITERATION_CLOCK: &str = "performance.now";

/// True when this process asked for wall-backed `performance.now()`.
#[must_use]
pub fn performance_now_is_wall() -> bool {
    matches!(
        std::env::var("VECTOR_PERFORMANCE_NOW").as_deref(),
        Ok("wall")
    )
}

/// Clock label for this process: official API when wall-backed, else lab.
#[must_use]
pub fn jetstream_iteration_clock() -> &'static str {
    if performance_now_is_wall() {
        OFFICIAL_ITERATION_CLOCK
    } else {
        LAB_ITERATION_CLOCK
    }
}

/// JS expression official runners use to time one iteration.
#[must_use]
pub fn jetstream_iteration_now_js() -> &'static str {
    if performance_now_is_wall() {
        "performance.now()"
    } else {
        "Date.now()"
    }
}

/// True only when official scoring ran at the official iteration count for
/// every executed JetStream name **and** used official `performance.now()`.
/// `Date.now-wall` lab subsets stay false.
#[must_use]
pub fn published_jetstream_ready(iterations: u32, executed_default_names: usize) -> bool {
    published_jetstream_ready_with_clock(iterations, executed_default_names, LAB_ITERATION_CLOCK)
}

/// Same gate with an explicit clock label.
#[must_use]
pub fn published_jetstream_ready_with_clock(
    iterations: u32,
    executed_default_names: usize,
    clock: &str,
) -> bool {
    iterations >= DEFAULT_ITERATION_COUNT
        && executed_default_names >= 72
        && clock == OFFICIAL_ITERATION_CLOCK
}

/// Official Speedometer 3.0 `iterationCount` in `resources/shared/params.mjs`.
pub const SPEEDOMETER_ITERATION_COUNT: u32 = 10;

/// Official Speedometer 3.0 default suite count (`tests.mjs` default tags).
pub const SPEEDOMETER_DEFAULT_SUITES: usize = 32;

/// Official `geomeanToScore` in `benchmark-runner.mjs`: `1000 / geomean(ms)`.
#[must_use]
pub fn speedometer_geomean_to_score(geomean_ms: f64) -> Option<f64> {
    if geomean_ms <= 0.0 {
        return None;
    }
    Some(1000.0 / geomean_ms)
}

/// One official Speedometer iteration: geomean of the 32 suite totals, then
/// `1000 / geomean`. Displayed Score is the arithmetic mean of 10 of these.
#[must_use]
pub fn official_speedometer_iteration_score(suite_totals_ms: &[f64]) -> Option<f64> {
    if suite_totals_ms.len() < SPEEDOMETER_DEFAULT_SUITES {
        return None;
    }
    if suite_totals_ms.iter().any(|v| *v <= 0.0) {
        return None;
    }
    speedometer_geomean_to_score(geomean(suite_totals_ms)?)
}

/// Lab Speedometer steps are add/finish helpers, not `benchmark-runner.mjs`.
pub const LAB_SPEEDOMETER_STEPS: &str = "lab-add-finish";

/// Official `benchmark-runner.mjs` step source.
pub const OFFICIAL_SPEEDOMETER_STEPS: &str = "benchmark-runner.mjs";

/// True only when the official runner produced 10 iteration scores from all
/// 32 default suites in one iteration (not independent suite p50s).
#[must_use]
pub fn published_speedometer_ready(iterations: u32, executed_default_suites: usize) -> bool {
    published_speedometer_ready_official(iterations, executed_default_suites, false)
}

/// `official_iteration_scores` is true only when each sample is one
/// `1000/geomean(32 suite totals)` from a full iteration, not a suite p50.
#[must_use]
pub fn published_speedometer_ready_official(
    iterations: u32,
    executed_default_suites: usize,
    official_iteration_scores: bool,
) -> bool {
    published_speedometer_ready_with_steps(
        iterations,
        executed_default_suites,
        official_iteration_scores,
        LAB_SPEEDOMETER_STEPS,
    )
}

/// Lab add/finish steps cannot set a published Score.
#[must_use]
pub fn published_speedometer_ready_with_steps(
    iterations: u32,
    executed_default_suites: usize,
    official_iteration_scores: bool,
    steps: &str,
) -> bool {
    official_iteration_scores
        && iterations >= SPEEDOMETER_ITERATION_COUNT
        && executed_default_suites >= SPEEDOMETER_DEFAULT_SUITES
        && steps == OFFICIAL_SPEEDOMETER_STEPS
}

/// Arithmetic mean of official iteration scores (displayed Speedometer Score).
#[must_use]
pub fn official_speedometer_displayed_score(iteration_scores: &[f64]) -> Option<f64> {
    if iteration_scores.len() < SPEEDOMETER_ITERATION_COUNT as usize {
        return None;
    }
    if iteration_scores.iter().any(|v| *v <= 0.0) {
        return None;
    }
    Some(iteration_scores.iter().sum::<f64>() / iteration_scores.len() as f64)
}

/// Official MotionMark 1.3 default test count (`resources/runner/tests.js`).
pub const MOTIONMARK_DEFAULT_TESTS: usize = 8;

/// Official MotionMark 1.3 iteration count (`BenchmarkRunnerClient.iterationCount`).
pub const MOTIONMARK_ITERATION_COUNT: u32 = 1;

/// Official MotionMark `test-interval` seconds (`benchmarkDefaultParameters`).
pub const MOTIONMARK_TEST_INTERVAL_SECS: u32 = 30;

/// Lab ramp timer. Official MotionMark uses `time-measurement: performance`.
/// Vector's `performance.now()` is virtual, so this is wall `Date.now()`.
pub const LAB_MOTIONMARK_CLOCK: &str = "Date.now-wall";

/// Official `time-measurement: performance`.
pub const OFFICIAL_MOTIONMARK_CLOCK: &str = "performance.now";

/// Clock label for this MotionMark process.
#[must_use]
pub fn motionmark_clock() -> &'static str {
    if performance_now_is_wall() {
        OFFICIAL_MOTIONMARK_CLOCK
    } else {
        LAB_MOTIONMARK_CLOCK
    }
}

/// Official MotionMark score is the geomean of per-test ramp-complexity
/// bootstrap medians (`results.js` ScoreCalculator, controller=`ramp`).
/// initialize+animate samples are not that.
#[must_use]
pub fn published_motionmark_ready(ramp_complexity_scores: usize) -> bool {
    ramp_complexity_scores >= MOTIONMARK_DEFAULT_TESTS
}

/// Date.now-wall cannot publish. Official `performance.now()` is required.
#[must_use]
pub fn published_motionmark_ready_with_clock(ramp_complexity_scores: usize, clock: &str) -> bool {
    published_motionmark_ready(ramp_complexity_scores) && clock == OFFICIAL_MOTIONMARK_CLOCK
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn to_score_matches_webkit() {
        assert!((to_score(10.0) - 500.0).abs() < 1e-9);
        assert!((to_score(0.5) - 5000.0).abs() < 1e-9);
        assert!((to_score(1.0) - 5000.0).abs() < 1e-9);
    }

    #[test]
    fn official_default_split_matches_webkit() {
        // first=10; remaining desc 20,12,9,8,7; worst2=(20+12)/2=16; avg=11.2
        let samples = [10_u64, 8, 12, 9, 20, 7];
        let s = official_default_score(&samples, 2).expect("score");
        assert!((s.first_ms - 10.0).abs() < 1e-9);
        assert!((s.first_score - 500.0).abs() < 1e-9);
        assert!((s.worst_ms - 16.0).abs() < 1e-9);
        assert!((s.worst_score - 5000.0 / 16.0).abs() < 1e-9);
        assert!((s.average_ms - 11.2).abs() < 1e-9);
        let expected = geomean(&[500.0, 5000.0 / 16.0, 5000.0 / 11.2]).unwrap();
        assert!((s.score - expected).abs() < 1e-9);
    }

    #[test]
    fn one_iteration_is_first_only_when_worst_is_zero() {
        let s = official_default_score(&[20], 0).expect("first-only");
        assert!((s.score - 250.0).abs() < 1e-9);
    }

    #[test]
    fn one_iteration_is_not_an_official_default_score() {
        assert!(official_default_score(&[18], DEFAULT_WORST_CASE_COUNT).is_none());
        assert!(!published_jetstream_ready(1, 72));
        assert!(!published_jetstream_ready(120, 12));
        assert!(!published_jetstream_ready(120, 72));
        assert!(!published_jetstream_ready_with_clock(
            120,
            72,
            LAB_ITERATION_CLOCK
        ));
        assert!(published_jetstream_ready_with_clock(
            120,
            72,
            OFFICIAL_ITERATION_CLOCK
        ));
        assert_eq!(LAB_ITERATION_CLOCK, "Date.now-wall");
        assert_eq!(jetstream_iteration_clock(), LAB_ITERATION_CLOCK);
        assert_eq!(jetstream_iteration_now_js(), "Date.now()");
    }

    #[test]
    fn speedometer_geomean_to_score_matches_webkit() {
        assert!((speedometer_geomean_to_score(10.0).unwrap() - 100.0).abs() < 1e-9);
        assert!(speedometer_geomean_to_score(0.0).is_none());
        let totals = vec![10.0; SPEEDOMETER_DEFAULT_SUITES];
        assert!((official_speedometer_iteration_score(&totals).unwrap() - 100.0).abs() < 1e-9);
        assert!(official_speedometer_iteration_score(&[10.0; 31]).is_none());
        assert!(!published_speedometer_ready(1, 32));
        assert!(!published_speedometer_ready(10, 8));
        assert!(!published_speedometer_ready(10, 32));
        assert!(!published_speedometer_ready_official(10, 32, true));
        assert!(published_speedometer_ready_with_steps(
            10,
            32,
            true,
            OFFICIAL_SPEEDOMETER_STEPS
        ));
        let scores = vec![100.0; SPEEDOMETER_ITERATION_COUNT as usize];
        assert!((official_speedometer_displayed_score(&scores).unwrap() - 100.0).abs() < 1e-9);
        assert!(official_speedometer_displayed_score(&[100.0; 9]).is_none());
    }

    #[test]
    fn motionmark_initialize_animate_is_not_a_published_score() {
        assert!(!published_motionmark_ready(0));
        assert!(!published_motionmark_ready(7));
        assert!(published_motionmark_ready(8));
        assert!(!published_motionmark_ready_with_clock(
            8,
            LAB_MOTIONMARK_CLOCK
        ));
        assert!(published_motionmark_ready_with_clock(
            8,
            OFFICIAL_MOTIONMARK_CLOCK
        ));
        assert_eq!(LAB_MOTIONMARK_CLOCK, "Date.now-wall");
        assert_eq!(motionmark_clock(), LAB_MOTIONMARK_CLOCK);
    }
}
