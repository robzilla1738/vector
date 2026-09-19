//! Shared input vocabulary (scroll phases, …).

use serde::{Deserialize, Serialize};

/// Trackpad / wheel gesture phase (H1-A5).
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ScrollPhase {
    /// Gesture started. Stale momentum is dropped.
    Began,
    /// Finger still moving. Default for unphased wheels.
    #[default]
    Changed,
    /// Finger lifted. Existing velocity may coast.
    Ended,
    /// Gesture aborted. Velocity is zeroed.
    Cancelled,
}
