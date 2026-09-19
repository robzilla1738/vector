//! Page clocks. Tests and goldens stay on [`Clock::Virtual`]. The GUI uses
//! [`Clock::Wall`] so idle pages still advance `performance.now` / rAF.

use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

/// Source of `Page::now_ms()`.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Clock {
    /// Deterministic virtual milliseconds, advanced by settle / waits.
    #[default]
    Virtual,
    /// `SystemTime` milliseconds since UNIX epoch, offset to zero at page open.
    Wall,
}

impl Clock {
    /// Current wall milliseconds since UNIX epoch.
    #[must_use]
    pub fn wall_unix_ms() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_millis() as u64)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn virtual_is_default() {
        assert_eq!(Clock::default(), Clock::Virtual);
    }

    #[test]
    fn wall_unix_ms_is_nonzero() {
        assert!(Clock::wall_unix_ms() > 0);
    }
}
