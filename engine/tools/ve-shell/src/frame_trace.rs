//! Frame tracer for `ve-shell --trace-frames` and `perf frames`.

use std::path::Path;
use std::time::Instant;

use serde::{Deserialize, Serialize};
use ve_api::{KeyState, NativeBrowser, NativeEvent, ScrollPhase};

/// One recorded sample.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FrameSample {
    /// Milliseconds from trace start.
    pub t_ms: f64,
    /// `input` or `paint`.
    pub kind: String,
    /// Event name when `kind=input`.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event: Option<String>,
    /// Paint duration.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub frame_ms: Option<f64>,
    /// Cumulative `from_layout` calls.
    pub from_layout: u64,
    /// Frame exceeded 16.7 ms.
    pub jank: bool,
}

/// In-memory trace.
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FrameTrace {
    /// Samples in order.
    pub samples: Vec<FrameSample>,
}

impl FrameTrace {
    /// Empty trace.
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Append a sample.
    pub fn push(&mut self, sample: FrameSample) {
        self.samples.push(sample);
    }

    /// Write JSON.
    pub fn write(&self, path: &Path) -> std::io::Result<()> {
        std::fs::write(path, serde_json::to_vec_pretty(self).unwrap_or_default())
    }
}

/// Scripted input event.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", tag = "type")]
pub enum ReplayEvent {
    /// Wheel.
    Wheel {
        /// Horizontal CSS px.
        #[serde(default)]
        dx: f32,
        /// Vertical CSS px.
        dy: f32,
        /// Delay before the event.
        #[serde(default)]
        delay_ms: u64,
    },
    /// Click.
    Click {
        /// X.
        x: f32,
        /// Y.
        y: f32,
        /// Delay before the event.
        #[serde(default)]
        delay_ms: u64,
    },
    /// Key.
    Key {
        /// Key name.
        key: String,
        /// Delay before the event.
        #[serde(default)]
        delay_ms: u64,
    },
}

/// Replay scripted events onto `browser` and record input→paint.
pub fn replay(browser: &mut NativeBrowser, events: &[ReplayEvent]) -> FrameTrace {
    let start = Instant::now();
    let mut trace = FrameTrace::new();
    for ev in events {
        let native = match ev {
            ReplayEvent::Wheel { dx, dy, .. } => NativeEvent::Wheel {
                dx: *dx,
                dy: *dy,
                phase: ScrollPhase::Changed,
            },
            ReplayEvent::Click { x, y, .. } => NativeEvent::PointerDown {
                x: *x,
                y: *y,
                button: 0,
            },
            ReplayEvent::Key { key, .. } => NativeEvent::Key {
                key: key.clone(),
                code: key.clone(),
                modifiers: 0,
                repeat: false,
                state: KeyState::Down,
            },
        };
        let name = match ev {
            ReplayEvent::Wheel { .. } => "wheel",
            ReplayEvent::Click { .. } => "click",
            ReplayEvent::Key { .. } => "key",
        };
        let t_in = start.elapsed().as_secs_f64() * 1000.0;
        let _ = browser.handle_event(native);
        trace.push(FrameSample {
            t_ms: t_in,
            kind: "input".into(),
            event: Some(name.into()),
            frame_ms: None,
            from_layout: browser.from_layout_calls(),
            jank: false,
        });
        let paint_start = Instant::now();
        let _ = browser.present();
        let frame_ms = paint_start.elapsed().as_secs_f64() * 1000.0;
        trace.push(FrameSample {
            t_ms: start.elapsed().as_secs_f64() * 1000.0,
            kind: "paint".into(),
            event: None,
            frame_ms: Some(frame_ms),
            from_layout: browser.from_layout_calls(),
            jank: frame_ms > 16.7,
        });
    }
    trace
}

/// Load a replay JSON array.
pub fn load_replay(path: &Path) -> std::io::Result<Vec<ReplayEvent>> {
    let bytes = std::fs::read(path)?;
    serde_json::from_slice(&bytes).map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))
}
