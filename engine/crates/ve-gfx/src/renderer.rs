//! The [`Renderer`] trait and the CPU [`SoftwareRenderer`].

use ve_core::Rect;
use ve_style::Rgba;

use crate::GfxError;
use crate::display_list::{DisplayItem, DisplayList, TextRun};
use crate::fonts::FontSystem;
use crate::image::ImageCache;

/// A rendered RGBA8 frame.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Frame {
    /// Width in pixels.
    pub width: u32,
    /// Height in pixels.
    pub height: u32,
    /// Non-premultiplied RGBA, row-major.
    pub rgba: Vec<u8>,
}

impl Frame {
    /// A frame filled with one colour.
    #[must_use]
    pub fn filled(width: u32, height: u32, color: [u8; 4]) -> Self {
        Self {
            width,
            height,
            rgba: color.repeat((width as usize) * (height as usize)),
        }
    }

    /// Pixel at `(x, y)`.
    #[must_use]
    pub fn pixel(&self, x: u32, y: u32) -> Option<[u8; 4]> {
        if x >= self.width || y >= self.height {
            return None;
        }
        let i = ((y * self.width + x) * 4) as usize;
        self.rgba[i..i + 4].try_into().ok()
    }

    /// Encodes the frame as a binary PPM (P6) image, dropping alpha. Handy
    /// for debugging without an image encoder dependency.
    #[must_use]
    pub fn to_ppm(&self) -> Vec<u8> {
        let mut out = format!("P6\n{} {}\n255\n", self.width, self.height).into_bytes();
        for px in self.rgba.chunks_exact(4) {
            out.extend_from_slice(&px[..3]);
        }
        out
    }
}

/// A paint backend.
pub trait Renderer {
    /// Backend name.
    fn name(&self) -> &'static str;

    /// Paints `list` into a `width × height` frame at `scale` device pixels
    /// per CSS pixel.
    fn render(
        &mut self,
        list: &DisplayList,
        width: u32,
        height: u32,
        scale: f32,
    ) -> Result<Frame, GfxError>;
}

/// A minimal CPU rasteriser: axis-aligned rectangles, borders, clip and
/// opacity stacks, images (nearest-neighbour) and glyphs from a
/// [`FontSystem`]. Not fast; correct and dependency-free.
pub struct SoftwareRenderer {
    /// Fonts used for text. Text is skipped when no font matches.
    pub fonts: FontSystem,
    /// Images referenced by display lists.
    pub images: ImageCache,
}

impl std::fmt::Debug for SoftwareRenderer {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("SoftwareRenderer")
            .field("fonts", &self.fonts.len())
            .field("images", &self.images.len())
            .finish()
    }
}

impl Default for SoftwareRenderer {
    fn default() -> Self {
        Self::new()
    }
}

struct Canvas {
    width: u32,
    height: u32,
    rgba: Vec<u8>,
    clip: Vec<Rect>,
    opacity: Vec<f32>,
    scale: f32,
}

impl Canvas {
    fn clip_rect(&self) -> Rect {
        self.clip.last().copied().unwrap_or(Rect::new(
            0.0,
            0.0,
            self.width as f32,
            self.height as f32,
        ))
    }

    fn alpha(&self) -> f32 {
        self.opacity.iter().product()
    }

    fn blend(&mut self, x: u32, y: u32, color: Rgba, coverage: f32) {
        let a = (color.a * coverage * self.alpha()).clamp(0.0, 1.0);
        if a <= 0.0 {
            return;
        }
        let i = ((y * self.width + x) * 4) as usize;
        let dst = &mut self.rgba[i..i + 4];
        let da = f32::from(dst[3]) / 255.0;
        let out_a = a + da * (1.0 - a);
        for (c, src) in [color.r, color.g, color.b].into_iter().enumerate() {
            let s = f32::from(src) / 255.0;
            let d = f32::from(dst[c]) / 255.0;
            let v = if out_a > 0.0 {
                (s * a + d * da * (1.0 - a)) / out_a
            } else {
                0.0
            };
            dst[c] = (v * 255.0).round() as u8;
        }
        dst[3] = (out_a * 255.0).round() as u8;
    }

    /// Fills a CSS-pixel rectangle with antialiased edges.
    fn fill_rect(&mut self, rect: Rect, color: Rgba) {
        let Some(visible) = rect.intersection(&self.clip_rect()) else {
            return;
        };
        let s = self.scale;
        let (x0, y0, x1, y1) = (
            visible.x() * s,
            visible.y() * s,
            visible.right() * s,
            visible.bottom() * s,
        );
        let px0 = x0.floor().max(0.0) as u32;
        let py0 = y0.floor().max(0.0) as u32;
        let px1 = (x1.ceil() as u32).min(self.width);
        let py1 = (y1.ceil() as u32).min(self.height);
        for py in py0..py1 {
            let cy = ((py as f32 + 1.0).min(y1) - (py as f32).max(y0)).clamp(0.0, 1.0);
            for px in px0..px1 {
                let cx = ((px as f32 + 1.0).min(x1) - (px as f32).max(x0)).clamp(0.0, 1.0);
                self.blend(px, py, color, cx * cy);
            }
        }
    }

    fn blit_alpha(
        &mut self,
        left: i32,
        top: i32,
        width: u32,
        height: u32,
        data: &[u8],
        color: Rgba,
    ) {
        let clip = self.clip_rect();
        for row in 0..height {
            for col in 0..width {
                let cov = f32::from(data[(row * width + col) as usize]) / 255.0;
                if cov <= 0.0 {
                    continue;
                }
                let x = left + col as i32;
                let y = top + row as i32;
                if x < 0 || y < 0 || x >= self.width as i32 || y >= self.height as i32 {
                    continue;
                }
                if !clip.contains(ve_core::Point::new(
                    x as f32 / self.scale,
                    y as f32 / self.scale,
                )) {
                    continue;
                }
                self.blend(x as u32, y as u32, color, cov);
            }
        }
    }
}

impl SoftwareRenderer {
    /// Creates a renderer with no fonts or images.
    #[must_use]
    pub fn new() -> Self {
        Self {
            fonts: FontSystem::new(),
            images: ImageCache::new(),
        }
    }

    /// Creates a renderer that paints with host-installed fonts (plan A19).
    #[must_use]
    pub fn with_system_fonts() -> Self {
        let mut fonts = FontSystem::new();
        fonts.load_system_fonts();
        Self {
            fonts,
            images: ImageCache::new(),
        }
    }

    fn draw_text(&mut self, canvas: &mut Canvas, run: &TextRun) {
        let Some(face) = self.fonts.query(&run.family, run.weight, run.style) else {
            return;
        };
        let size = run.size * canvas.scale;
        let mut pen_x = run.origin.x * canvas.scale;
        let baseline_y = run.origin.y * canvas.scale;
        for ch in run.text.chars() {
            let Some(glyph) = self.fonts.glyph_for_char(face, ch) else {
                continue;
            };
            let advance = self.fonts.advance(face, glyph, size).unwrap_or(size * 0.5);
            if let Some(bitmap) = self.fonts.rasterize(face, glyph, size)
                && bitmap.width > 0
            {
                let left = pen_x.round() as i32 + bitmap.left;
                let top = baseline_y.round() as i32 - bitmap.top;
                canvas.blit_alpha(
                    left,
                    top,
                    bitmap.width,
                    bitmap.height,
                    &bitmap.data,
                    run.color,
                );
            }
            pen_x += advance;
        }
    }

    fn draw_image(&self, canvas: &mut Canvas, rect: Rect, handle: crate::image::ImageHandle) {
        let Some(image) = self.images.get(handle) else {
            return;
        };
        let Some(visible) = rect.intersection(&canvas.clip_rect()) else {
            return;
        };
        let s = canvas.scale;
        let px0 = (visible.x() * s).floor().max(0.0) as u32;
        let py0 = (visible.y() * s).floor().max(0.0) as u32;
        let px1 = ((visible.right() * s).ceil() as u32).min(canvas.width);
        let py1 = ((visible.bottom() * s).ceil() as u32).min(canvas.height);
        for py in py0..py1 {
            let v = ((py as f32 / s - rect.y()) / rect.height()).clamp(0.0, 0.999_99);
            for px in px0..px1 {
                let u = ((px as f32 / s - rect.x()) / rect.width()).clamp(0.0, 0.999_99);
                let sx = (u * image.width as f32) as u32;
                let sy = (v * image.height as f32) as u32;
                if let Some([r, g, b, a]) = image.pixel(sx, sy) {
                    canvas.blend(px, py, Rgba::rgba(r, g, b, f32::from(a) / 255.0), 1.0);
                }
            }
        }
    }
}

impl Renderer for SoftwareRenderer {
    fn name(&self) -> &'static str {
        "software"
    }

    fn render(
        &mut self,
        list: &DisplayList,
        width: u32,
        height: u32,
        scale: f32,
    ) -> Result<Frame, GfxError> {
        if width == 0 || height == 0 {
            return Err(GfxError::Gpu("zero-sized frame".into()));
        }
        let span = ve_core::Stage::Paint.span();
        let _guard = span.enter();
        let mut canvas = Canvas {
            width,
            height,
            rgba: vec![0; (width as usize) * (height as usize) * 4],
            clip: Vec::new(),
            opacity: Vec::new(),
            scale: if scale > 0.0 { scale } else { 1.0 },
        };
        for item in list.items() {
            match item {
                DisplayItem::Rect { rect, color } => canvas.fill_rect(*rect, *color),
                DisplayItem::Border {
                    rect,
                    widths,
                    color,
                } => {
                    let r = *rect;
                    canvas.fill_rect(Rect::new(r.x(), r.y(), r.width(), widths.top), *color);
                    canvas.fill_rect(
                        Rect::new(r.x(), r.bottom() - widths.bottom, r.width(), widths.bottom),
                        *color,
                    );
                    canvas.fill_rect(
                        Rect::new(
                            r.x(),
                            r.y() + widths.top,
                            widths.left,
                            r.height() - widths.vertical(),
                        ),
                        *color,
                    );
                    canvas.fill_rect(
                        Rect::new(
                            r.right() - widths.right,
                            r.y() + widths.top,
                            widths.right,
                            r.height() - widths.vertical(),
                        ),
                        *color,
                    );
                }
                DisplayItem::Text(run) => self.draw_text(&mut canvas, run),
                DisplayItem::Image { rect, handle } => self.draw_image(&mut canvas, *rect, *handle),
                DisplayItem::PushClip(rect) => {
                    let clipped = canvas.clip_rect().intersection(rect).unwrap_or(Rect::ZERO);
                    canvas.clip.push(clipped);
                }
                DisplayItem::PopClip => {
                    canvas.clip.pop();
                }
                DisplayItem::PushOpacity(a) => canvas.opacity.push(a.clamp(0.0, 1.0)),
                DisplayItem::PopOpacity => {
                    canvas.opacity.pop();
                }
            }
        }
        Ok(Frame {
            width,
            height,
            rgba: canvas.rgba,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ve_core::{Edges, Size};

    #[test]
    fn software_renderer_fills_clips_and_blends() {
        let mut list = DisplayList::new(Size::new(10.0, 10.0));
        list.push(DisplayItem::Rect {
            rect: Rect::new(0.0, 0.0, 10.0, 10.0),
            color: Rgba::WHITE,
        });
        list.push(DisplayItem::PushClip(Rect::new(0.0, 0.0, 5.0, 10.0)));
        list.push(DisplayItem::Rect {
            rect: Rect::new(0.0, 0.0, 10.0, 10.0),
            color: Rgba::rgb(255, 0, 0),
        });
        list.push(DisplayItem::PopClip);
        list.push(DisplayItem::PushOpacity(0.5));
        list.push(DisplayItem::Rect {
            rect: Rect::new(6.0, 6.0, 2.0, 2.0),
            color: Rgba::BLACK,
        });
        list.push(DisplayItem::PopOpacity);
        list.push(DisplayItem::Border {
            rect: Rect::new(0.0, 0.0, 10.0, 10.0),
            widths: Edges::uniform(1.0),
            color: Rgba::rgb(0, 0, 255),
        });
        list.push(DisplayItem::Text(TextRun {
            origin: ve_core::Point::new(1.0, 8.0),
            text: "x".into(),
            size: 8.0,
            color: Rgba::BLACK,
            weight: ve_style::FontWeight::NORMAL,
            style: ve_style::FontStyle::Normal,
            family: vec![],
        }));

        let mut renderer = SoftwareRenderer::new();
        let frame = renderer.render(&list, 10, 10, 1.0).unwrap();
        assert_eq!(
            frame.pixel(2, 5),
            Some([255, 0, 0, 255]),
            "inside clip: red"
        );
        assert_eq!(
            frame.pixel(7, 5),
            Some([255, 255, 255, 255]),
            "outside clip: white"
        );
        assert_eq!(
            frame.pixel(6, 6),
            Some([128, 128, 128, 255]),
            "50% black over white"
        );
        assert_eq!(frame.pixel(0, 5), Some([0, 0, 255, 255]), "left border");
        assert_eq!(frame.pixel(9, 9), Some([0, 0, 255, 255]), "corner border");
        assert!(renderer.render(&list, 0, 4, 1.0).is_err());

        let hi = renderer.render(&list, 20, 20, 2.0).unwrap();
        assert_eq!(hi.pixel(4, 10), Some([255, 0, 0, 255]), "HiDPI scale");
        assert_eq!(hi.to_ppm().len(), "P6\n20 20\n255\n".len() + 20 * 20 * 3);
    }
}
