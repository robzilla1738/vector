//! macOS window host. Real `objc2` bindings land behind `target_os = "macos"`;
//! every other OS uses the headless test double (H2-A3).

#![forbid(unsafe_code)]

/// Scroll-phase events from AppKit / the test double.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ScrollPhase {
    /// Began.
    Began,
    /// Changed.
    Changed,
    /// Ended / momentum.
    Ended,
}

/// Appearance.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Appearance {
    /// Light.
    Light,
    /// Dark.
    Dark,
}

/// Window host. On macOS this will wrap `NSWindow`; elsewhere it is a double.
#[derive(Clone, Debug)]
pub struct MacWindow {
    /// Title.
    pub title: String,
    /// Appearance.
    pub appearance: Appearance,
    /// Last scroll phase.
    pub scroll_phase: Option<ScrollPhase>,
    /// IME composition string.
    pub ime: String,
}

impl Default for MacWindow {
    fn default() -> Self {
        Self {
            title: "Vector".into(),
            appearance: Appearance::Light,
            scroll_phase: None,
            ime: String::new(),
        }
    }
}

impl MacWindow {
    /// Headless test double (all platforms).
    #[must_use]
    pub fn test_double() -> Self {
        Self::default()
    }

    /// Menu / IME / scroll-phase hook.
    pub fn set_scroll_phase(&mut self, phase: ScrollPhase) {
        self.scroll_phase = Some(phase);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_double_exists() {
        let mut w = MacWindow::test_double();
        w.set_scroll_phase(ScrollPhase::Began);
        assert_eq!(w.scroll_phase, Some(ScrollPhase::Began));
    }
}
