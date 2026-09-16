//! Graphics for the Vector Engine.
//!
//! The paint pipeline is split into backend-independent and backend-specific
//! halves:
//!
//! * [`DisplayList`] — a flat, retained list of drawing commands built from a
//!   laid-out page ([`DisplayList::from_layout`]). It is the only thing
//!   renderers consume, so every backend paints identical output.
//! * [`Compositor`] — layers with scroll offsets and opacity, flattened into
//!   one display list per frame.
//! * [`FontSystem`] — font database (`fontdb`) plus glyph rasterisation
//!   (`swash`). Fonts are registered from bytes; system font discovery is the
//!   embedder's decision.
//! * [`Renderer`] — the backend trait. [`SoftwareRenderer`] is a small,
//!   always-available CPU rasteriser (rectangles, borders, clips, opacity,
//!   glyphs when fonts are registered) used for tests and headless
//!   screenshots. [`VelloRenderer`] (feature `gpu`) renders through vello on
//!   wgpu.
//! * [`image`] — format sniffing always; decoding through the `image` crate
//!   behind the `images` feature (implied by `gpu`).
//!
//! GPU text is encoded as glyph outlines from [`FontSystem`] when fonts are
//! registered, otherwise as filled glyph cells. Images use [`ImageCache`].
//! Capture still readbacks; [`VelloRenderer::present_scene`] paints without a CPU copy.

#![forbid(unsafe_code)]

pub mod compositor;
pub mod display_list;
pub mod fonts;
pub mod image;
pub mod renderer;
#[cfg(feature = "gpu")]
pub mod vello_backend;

pub use compositor::{Compositor, Layer, LayerId};
pub use display_list::{DisplayItem, DisplayList, TextRun};
pub use fonts::{FontSystem, GlyphBitmap, GlyphOutline, GlyphVerb};
pub use image::{DecodedImage, ImageCache, ImageFormat, ImageHandle, sniff_format};
pub use renderer::{Frame, Renderer, SoftwareRenderer};
#[cfg(feature = "gpu")]
pub use vello_backend::{VelloRenderer, build_scene, build_scene_fonts, build_scene_with};

/// Errors from the graphics layer.
#[derive(Debug, thiserror::Error)]
pub enum GfxError {
    /// Capability not compiled in or not implemented.
    #[error("unsupported: {0}")]
    Unsupported(String),
    /// Image decoding failed.
    #[error("decode: {0}")]
    Decode(String),
    /// GPU / device failure.
    #[error("gpu: {0}")]
    Gpu(String),
    /// Font loading or shaping failure.
    #[error("font: {0}")]
    Font(String),
}

impl From<GfxError> for ve_core::Error {
    fn from(e: GfxError) -> Self {
        match e {
            GfxError::Unsupported(s) => ve_core::Error::Unsupported(s),
            other => ve_core::Error::InvalidState(other.to_string()),
        }
    }
}
