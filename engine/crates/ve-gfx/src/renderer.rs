//! The [`Renderer`] trait and the CPU [`SoftwareRenderer`].

use std::collections::HashMap;

use ve_core::{NodeId, Point, Rect};
use ve_style::Rgba;

use crate::GfxError;
use crate::display_list::{DisplayItem, DisplayList, TextRun};
use crate::fonts::FontSystem;
use crate::image::{ImageCache, ImageHandle};

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

fn sample_stops(stops: &[(f32, Rgba)], t: f32) -> Rgba {
    if stops.len() == 1 {
        return stops[0].1;
    }
    let t = t.clamp(0.0, 1.0);
    for w in stops.windows(2) {
        let (t0, c0) = w[0];
        let (t1, c1) = w[1];
        if t <= t1 {
            let span = (t1 - t0).max(f32::EPSILON);
            let u = ((t - t0) / span).clamp(0.0, 1.0);
            return Rgba::rgba(
                (f32::from(c0.r) + (f32::from(c1.r) - f32::from(c0.r)) * u).round() as u8,
                (f32::from(c0.g) + (f32::from(c1.g) - f32::from(c0.g)) * u).round() as u8,
                (f32::from(c0.b) + (f32::from(c1.b) - f32::from(c0.b)) * u).round() as u8,
                c0.a + (c1.a - c0.a) * u,
            );
        }
    }
    stops.last().map(|s| s.1).unwrap_or(Rgba::TRANSPARENT)
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
    /// Layout node → decoded `<img>` for [`DisplayList::from_layout_with`].
    pub node_images: HashMap<NodeId, ImageHandle>,
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

    fn fill_linear_gradient(
        &mut self,
        rect: Rect,
        start: Point,
        end: Point,
        stops: &[(f32, Rgba)],
    ) {
        if stops.is_empty() {
            return;
        }
        let Some(visible) = rect.intersection(&self.clip_rect()) else {
            return;
        };
        let s = self.scale;
        let dx = end.x - start.x;
        let dy = end.y - start.y;
        let len2 = dx * dx + dy * dy;
        let px0 = (visible.x() * s).floor().max(0.0) as u32;
        let py0 = (visible.y() * s).floor().max(0.0) as u32;
        let px1 = ((visible.right() * s).ceil() as u32).min(self.width);
        let py1 = ((visible.bottom() * s).ceil() as u32).min(self.height);
        for py in py0..py1 {
            for px in px0..px1 {
                let x = px as f32 / s;
                let y = py as f32 / s;
                let t = if len2 < f32::EPSILON {
                    0.0
                } else {
                    ((x - start.x) * dx + (y - start.y) * dy) / len2
                }
                .clamp(0.0, 1.0);
                self.blend(px, py, sample_stops(stops, t), 1.0);
            }
        }
    }

    fn blur_rect(&mut self, rect: Rect, radius: f32) {
        let r = radius.round().max(0.0) as i32;
        if r == 0 {
            return;
        }
        let Some(visible) = rect.intersection(&self.clip_rect()) else {
            return;
        };
        let s = self.scale;
        let x0 = (visible.x() * s).floor().max(0.0) as i32;
        let y0 = (visible.y() * s).floor().max(0.0) as i32;
        let x1 = ((visible.right() * s).ceil() as i32).min(self.width as i32);
        let y1 = ((visible.bottom() * s).ceil() as i32).min(self.height as i32);
        if x1 <= x0 || y1 <= y0 {
            return;
        }
        let src = self.rgba.clone();
        for y in y0..y1 {
            for x in x0..x1 {
                let mut acc = [0u32; 4];
                let mut n = 0u32;
                for yy in (y - r).max(y0)..(y + r + 1).min(y1) {
                    for xx in (x - r).max(x0)..(x + r + 1).min(x1) {
                        let i = ((yy as u32 * self.width + xx as u32) * 4) as usize;
                        acc[0] += u32::from(src[i]);
                        acc[1] += u32::from(src[i + 1]);
                        acc[2] += u32::from(src[i + 2]);
                        acc[3] += u32::from(src[i + 3]);
                        n += 1;
                    }
                }
                if n == 0 {
                    continue;
                }
                let i = ((y as u32 * self.width + x as u32) * 4) as usize;
                self.rgba[i] = (acc[0] / n) as u8;
                self.rgba[i + 1] = (acc[1] / n) as u8;
                self.rgba[i + 2] = (acc[2] / n) as u8;
                self.rgba[i + 3] = (acc[3] / n) as u8;
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
            node_images: HashMap::new(),
        }
    }

    /// Creates a renderer that paints with host-installed fonts (plan A19).
    #[must_use]
    pub fn with_system_fonts() -> Self {
        let mut fonts = FontSystem::new();
        fonts.load_system_fonts();
        fonts.set_generic(&ve_style::FontFamily::SansSerif, "Inter");
        fonts.set_generic(&ve_style::FontFamily::SystemUi, "Inter");
        Self {
            fonts,
            images: ImageCache::new(),
            node_images: HashMap::new(),
        }
    }

    /// Direct presentation into a retained `frame`. Skips PNG encoding. The
    /// GPU backend's [`crate::vello_backend::VelloRenderer::present_scene`]
    /// is the no-readback path; this is the CPU analogue.
    pub fn present_into(
        &mut self,
        list: &DisplayList,
        frame: &mut Frame,
        scale: f32,
    ) -> Result<(), GfxError> {
        let painted = self.render(list, frame.width, frame.height, scale)?;
        if frame.rgba.len() == painted.rgba.len() {
            frame.rgba.copy_from_slice(&painted.rgba);
        } else {
            *frame = painted;
        }
        Ok(())
    }

    fn draw_text(&mut self, canvas: &mut Canvas, run: &TextRun) {
        let Some(face) = self.fonts.query(&run.family, run.weight, run.style) else {
            return;
        };
        let size = run.size * canvas.scale;
        let origin_x = run.origin.x * canvas.scale;
        let baseline_y = run.origin.y * canvas.scale;
        let Some(shaped) = self.fonts.shape_retained(face, &run.text, size) else {
            return;
        };
        for glyph in shaped.glyphs {
            if glyph.id == 0 {
                continue;
            }
            if let Some(bitmap) = self.fonts.rasterize(face, glyph.id as u16, size)
                && bitmap.width > 0
            {
                let left = (origin_x + glyph.x).round() as i32 + bitmap.left;
                let top = (baseline_y + glyph.y).round() as i32 - bitmap.top;
                canvas.blit_alpha(
                    left,
                    top,
                    bitmap.width,
                    bitmap.height,
                    &bitmap.data,
                    run.color,
                );
            }
        }
    }

    fn draw_image(
        &self,
        canvas: &mut Canvas,
        rect: Rect,
        handle: crate::image::ImageHandle,
        src: Option<Rect>,
        size: ve_style::BackgroundSize,
        position: ve_style::BackgroundPosition,
        repeat: ve_style::BackgroundRepeat,
    ) {
        let Some(image) = self.images.get(handle) else {
            return;
        };
        let (dest, resolved_src) = crate::resolve_image_placement(
            rect,
            image.width as f32,
            image.height as f32,
            size,
            position,
        );
        let src = src.unwrap_or(resolved_src);
        let clipped = canvas.clip_rect().intersection(&rect).unwrap_or(Rect::ZERO);
        canvas.clip.push(clipped);
        for origin in crate::background_tile_origins(rect, dest, repeat) {
            let tile = Rect::new(origin.x, origin.y, dest.width(), dest.height());
            self.blit_image(canvas, tile, image, src);
        }
        canvas.clip.pop();
    }

    fn blit_image(
        &self,
        canvas: &mut Canvas,
        rect: Rect,
        image: &crate::image::DecodedImage,
        src: Rect,
    ) {
        let Some(visible) = rect.intersection(&canvas.clip_rect()) else {
            return;
        };
        let s = canvas.scale;
        let px0 = (visible.x() * s).floor().max(0.0) as u32;
        let py0 = (visible.y() * s).floor().max(0.0) as u32;
        let px1 = ((visible.right() * s).ceil() as u32).min(canvas.width);
        let py1 = ((visible.bottom() * s).ceil() as u32).min(canvas.height);
        for py in py0..py1 {
            let v = ((py as f32 / s - rect.y()) / rect.height().max(0.001)).clamp(0.0, 0.999_99);
            for px in px0..px1 {
                let u = ((px as f32 / s - rect.x()) / rect.width().max(0.001)).clamp(0.0, 0.999_99);
                let sx = (src.x() + u * src.width()) as u32;
                let sy = (src.y() + v * src.height()) as u32;
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
                DisplayItem::Image {
                    rect,
                    handle,
                    src,
                    size,
                    position,
                    repeat,
                } => self.draw_image(
                    &mut canvas,
                    *rect,
                    *handle,
                    *src,
                    *size,
                    *position,
                    *repeat,
                ),
                DisplayItem::LinearGradient {
                    rect,
                    start,
                    end,
                    stops,
                } => canvas.fill_linear_gradient(*rect, *start, *end, stops),
                DisplayItem::FilterBlur { rect, radius } => canvas.blur_rect(*rect, *radius),
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
                DisplayItem::RoundedClip { rect, .. } => {
                    let clipped = canvas.clip_rect().intersection(rect).unwrap_or(Rect::ZERO);
                    canvas.clip.push(clipped);
                }
                DisplayItem::PushTransform { .. } | DisplayItem::PopTransform => {}
                DisplayItem::BoxShadow {
                    rect,
                    dx,
                    dy,
                    color,
                    ..
                } => {
                    canvas.fill_rect(
                        Rect::new(rect.x() + dx, rect.y() + dy, rect.width(), rect.height()),
                        *color,
                    );
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

    #[test]
    fn system_fonts_paint_inter_ui_text() {
        let mut list = DisplayList::new(Size::new(200.0, 40.0));
        list.push(DisplayItem::Rect {
            rect: Rect::new(0.0, 0.0, 200.0, 40.0),
            color: Rgba::WHITE,
        });
        list.push(DisplayItem::Text(TextRun {
            origin: ve_core::Point::new(8.0, 28.0),
            text: "Personal".into(),
            size: 16.0,
            color: Rgba::BLACK,
            weight: ve_style::FontWeight::NORMAL,
            style: ve_style::FontStyle::Normal,
            family: vec![
                ve_style::FontFamily::Named("Inter".into()),
                ve_style::FontFamily::SansSerif,
            ],
        }));
        let mut renderer = SoftwareRenderer::with_system_fonts();
        let frame = renderer.render(&list, 200, 40, 1.0).unwrap();
        let ink = frame
            .rgba
            .chunks_exact(4)
            .filter(|px| px[0] < 200 && px[3] > 0)
            .count();
        assert!(
            ink > 40,
            "Inter/sans-serif must paint real glyphs, ink={ink}"
        );
    }
}
