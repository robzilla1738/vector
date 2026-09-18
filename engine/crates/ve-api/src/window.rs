//! Window chrome surface, split from [`crate::NativeBrowser`] (H2-A1).
//!
//! The browser owns pages/contexts; a window owns the OS surface, pointer,
//! URL bar, and compositor present state.

use ve_core::Point;
use ve_gfx::{Compositor, Frame};

/// One OS window's chrome + present state.
#[derive(Debug)]
pub struct NativeWindow {
    /// Software framebuffer.
    pub surface: Frame,
    /// Last pointer in CSS px.
    pub pointer: Point,
    /// Address bar text.
    pub urlbar: String,
    /// Whether the address bar owns keys.
    pub urlbar_focused: bool,
    /// Compositor.
    pub compositor: Compositor,
    /// Device pixel ratio.
    pub device_scale: f32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn window_defaults() {
        let w = NativeWindow::new(2.0);
        assert!((w.device_scale - 2.0).abs() < f32::EPSILON);
        assert!(!w.urlbar_focused);
    }
}

impl NativeWindow {
    /// Default 1280×720 window.
    #[must_use]
    pub fn new(device_scale: f32) -> Self {
        Self {
            surface: Frame::filled(1280, 720, [255, 255, 255, 255]),
            pointer: Point::ZERO,
            urlbar: String::new(),
            urlbar_focused: false,
            compositor: Compositor::new(),
            device_scale: device_scale.max(0.01),
        }
    }
}

/// The document authority (pages + engine). Windows attach to one browser.
pub type Browser = crate::NativeBrowser;
