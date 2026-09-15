//! Pipeline stages, tracing spans and lightweight per-stage timing.
//!
//! Every subsystem wraps its main entry point in [`Stage::span`] so that a
//! `tracing` subscriber (or the `perf` tool) sees a uniform `stage` span
//! hierarchy regardless of which crate did the work.

use std::fmt;
use std::time::{Duration, Instant};

use serde::{Deserialize, Serialize};

/// The named stages of the rendering / agent pipeline.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Stage {
    /// Network fetch of the main resource or a subresource.
    Fetch,
    /// HTML tokenisation and tree construction.
    Parse,
    /// CSS parsing, selector matching and the cascade.
    Style,
    /// Box tree construction and geometry.
    Layout,
    /// Display list construction and rasterisation.
    Paint,
    /// JavaScript execution and event-loop turns.
    Script,
    /// Accessibility tree and semantic snapshot construction.
    Snapshot,
    /// Agent program interpretation.
    Agent,
}

impl Stage {
    /// All stages in pipeline order.
    pub const ALL: [Stage; 8] = [
        Stage::Fetch,
        Stage::Parse,
        Stage::Style,
        Stage::Layout,
        Stage::Paint,
        Stage::Script,
        Stage::Snapshot,
        Stage::Agent,
    ];

    /// Stable lower-case name used in spans and JSON.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Stage::Fetch => "fetch",
            Stage::Parse => "parse",
            Stage::Style => "style",
            Stage::Layout => "layout",
            Stage::Paint => "paint",
            Stage::Script => "script",
            Stage::Snapshot => "snapshot",
            Stage::Agent => "agent",
        }
    }

    /// Creates the canonical `tracing` span for this stage.
    #[must_use]
    pub fn span(self) -> tracing::Span {
        tracing::info_span!("stage", stage = self.as_str())
    }
}

impl fmt::Display for Stage {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

/// One timed execution of a stage.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct StageSample {
    /// Which stage ran.
    pub stage: Stage,
    /// Wall-clock duration in microseconds.
    pub micros: u64,
}

/// Records how long each stage took. Used by the `perf` tool and available to
/// embedders who want cheap instrumentation without a `tracing` subscriber.
#[derive(Debug, Default, Clone)]
pub struct StageTimer {
    samples: Vec<StageSample>,
}

impl StageTimer {
    /// Creates an empty timer.
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Runs `f` inside the stage's tracing span and records its duration.
    pub fn time<T>(&mut self, stage: Stage, f: impl FnOnce() -> T) -> T {
        let span = stage.span();
        let _guard = span.enter();
        let start = Instant::now();
        let out = f();
        self.record(stage, start.elapsed());
        out
    }

    /// Records an externally measured duration.
    pub fn record(&mut self, stage: Stage, elapsed: Duration) {
        let micros = u64::try_from(elapsed.as_micros()).unwrap_or(u64::MAX);
        self.samples.push(StageSample { stage, micros });
    }

    /// All samples in the order they were recorded.
    #[must_use]
    pub fn samples(&self) -> &[StageSample] {
        &self.samples
    }

    /// Sum of all samples for `stage`, in microseconds.
    #[must_use]
    pub fn total_micros(&self, stage: Stage) -> u64 {
        self.samples
            .iter()
            .filter(|s| s.stage == stage)
            .map(|s| s.micros)
            .sum()
    }

    /// Removes all samples.
    pub fn clear(&mut self) {
        self.samples.clear();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn timer_records_samples_per_stage() {
        let mut timer = StageTimer::new();
        let v = timer.time(Stage::Parse, || 41 + 1);
        assert_eq!(v, 42);
        timer.record(Stage::Parse, Duration::from_micros(10));
        timer.record(Stage::Layout, Duration::from_micros(5));
        assert_eq!(timer.samples().len(), 3);
        assert!(timer.total_micros(Stage::Parse) >= 10);
        assert_eq!(timer.total_micros(Stage::Layout), 5);
        assert_eq!(timer.total_micros(Stage::Paint), 0);
        assert_eq!(
            serde_json::to_string(&Stage::Snapshot).unwrap(),
            "\"snapshot\""
        );
    }
}
