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
    if samples_ms.len() <= worst_case_count {
        return None;
    }
    let first_ms = samples_ms[0] as f64;
    let first_score = to_score(first_ms);
    let mut rest: Vec<f64> = samples_ms[1..].iter().map(|s| *s as f64).collect();
    rest.sort_by(|a, b| b.partial_cmp(a).unwrap_or(std::cmp::Ordering::Equal));
    let average_ms = rest.iter().sum::<f64>() / rest.len() as f64;
    let average_score = to_score(average_ms);
    let worst_ms = rest[..worst_case_count].iter().sum::<f64>() / worst_case_count as f64;
    let worst_score = to_score(worst_ms);
    let score = geomean(&[first_score, worst_score, average_score])?;
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

/// True only when official scoring ran at the official iteration count for
/// every executed JetStream name. Lab subsets stay false.
#[must_use]
pub fn published_jetstream_ready(iterations: u32, executed_default_names: usize) -> bool {
    iterations >= DEFAULT_ITERATION_COUNT && executed_default_names >= 72
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
        // first=10; remaining desc 20,12,9,8,7; worst2=(20+12)/2=16; avg=13.2
        let samples = [10_u64, 8, 12, 9, 20, 7];
        let s = official_default_score(&samples, 2).expect("score");
        assert!((s.first_ms - 10.0).abs() < 1e-9);
        assert!((s.first_score - 500.0).abs() < 1e-9);
        assert!((s.worst_ms - 16.0).abs() < 1e-9);
        assert!((s.worst_score - 5000.0 / 16.0).abs() < 1e-9);
        assert!((s.average_ms - 13.2).abs() < 1e-9);
        let expected = geomean(&[500.0, 5000.0 / 16.0, 5000.0 / 13.2]).unwrap();
        assert!((s.score - expected).abs() < 1e-9);
    }

    #[test]
    fn one_iteration_is_not_an_official_default_score() {
        assert!(official_default_score(&[18], DEFAULT_WORST_CASE_COUNT).is_none());
        assert!(!published_jetstream_ready(1, 72));
        assert!(!published_jetstream_ready(120, 12));
    }
}
