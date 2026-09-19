//! Window chrome surface, split from [`crate::NativeBrowser`] (H2-A1).
//!
//! The browser owns pages/contexts; a window owns the OS surface, pointer,
//! URL bar, and compositor present state. Private windows are a distinct
//! [`crate::ContextId`] cookie/storage jar, not a silent backend swap.

use ve_core::{Point, Size};
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
    /// Whether the next urlbar keystroke replaces the buffer.
    pub urlbar_selected: bool,
    /// Compositor.
    pub compositor: Compositor,
    /// True after the last present consumed damage.
    pub presented: bool,
    /// Device pixel ratio.
    pub device_scale: f32,
    /// Window size in CSS px.
    pub size: Size,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn window_defaults() {
        let w = NativeWindow::new(2.0);
        assert!((w.device_scale - 2.0).abs() < f32::EPSILON);
        assert!(!w.urlbar_focused);
        assert!(!w.urlbar_selected);
        assert!(!w.presented);
        assert_eq!(w.surface.width, 1280);
        assert_eq!(w.surface.height, 720);
        assert_eq!(w.size, Size::new(1280.0, 720.0));
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
            urlbar_selected: false,
            compositor: Compositor::new(),
            presented: false,
            device_scale: device_scale.max(0.01),
            size: Size::new(1280.0, 720.0),
        }
    }
}

/// The document authority (pages + engine). Windows attach to one browser.
pub type Browser = crate::NativeBrowser;
