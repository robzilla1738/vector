//! GPU rendering through vello on wgpu (feature `gpu`).
//!
//! The embedder supplies a `wgpu::Device` + `Queue`. Display lists carry
//! rectangles, borders, shaped text (as glyph cells plus optional decoded
//! images) into a `vello::Scene`. [`VelloRenderer::present_scene`] draws to a
//! texture without CPU readback; [`VelloRenderer::render_scene`] is the
//! capture/test path that copies pixels back.

use std::num::NonZeroUsize;

use ve_core::Rect;
use vello::kurbo::{Affine, BezPath, Rect as KRect, Stroke};
use vello::peniko::{Color, Fill, Mix};
use vello::{AaConfig, AaSupport, RenderParams, RendererOptions, Scene};

use crate::GfxError;
use crate::display_list::{DisplayItem, DisplayList};
use crate::fonts::{FontSystem, GlyphBitmap, GlyphVerb};
use crate::image::ImageCache;
use crate::renderer::{Frame, Renderer};

fn krect(r: Rect) -> KRect {
    KRect::new(
        f64::from(r.x()),
        f64::from(r.y()),
        f64::from(r.right()),
        f64::from(r.bottom()),
    )
}

fn color(c: ve_style::Rgba) -> Color {
    Color::from_rgba8(c.r, c.g, c.b, (c.a * 255.0).round() as u8)
}

/// Converts a display list into a vello scene (no GPU needed).
#[must_use]
pub fn build_scene(list: &DisplayList, scale: f32) -> Scene {
    build_scene_fonts(list, scale, None, None)
}

/// [`build_scene`] with decoded images for [`DisplayItem::Image`].
#[must_use]
pub fn build_scene_with(list: &DisplayList, scale: f32, images: Option<&ImageCache>) -> Scene {
    build_scene_fonts(list, scale, images, None)
}

fn glyph_to_rgba(bitmap: &GlyphBitmap, c: ve_style::Rgba) -> Vec<u8> {
    let mut rgba = vec![0u8; bitmap.data.len() * 4];
    let a0 = (c.a * 255.0).round() as u16;
    for (i, &cov) in bitmap.data.iter().enumerate() {
        let a = (u16::from(cov) * a0 / 255) as u8;
        let o = i * 4;
        rgba[o] = c.r;
        rgba[o + 1] = c.g;
        rgba[o + 2] = c.b;
        rgba[o + 3] = a;
    }
    rgba
}

fn peniko_rgba(rgba: Vec<u8>, width: u32, height: u32) -> vello::peniko::ImageBrush {
    vello::peniko::ImageBrush::from(vello::peniko::ImageData {
        data: vello::peniko::Blob::from(rgba),
        format: vello::peniko::ImageFormat::Rgba8,
        alpha_type: vello::peniko::ImageAlphaType::Alpha,
        width,
        height,
    })
}

fn outline_to_path(verbs: &[GlyphVerb]) -> BezPath {
    let mut path = BezPath::new();
    for verb in verbs {
        match *verb {
            GlyphVerb::MoveTo(x, y) => path.move_to((f64::from(x), f64::from(y))),
            GlyphVerb::LineTo(x, y) => path.line_to((f64::from(x), f64::from(y))),
            GlyphVerb::QuadTo(cx, cy, x, y) => {
                path.quad_to((f64::from(cx), f64::from(cy)), (f64::from(x), f64::from(y)));
            }
            GlyphVerb::CurveTo(c1x, c1y, c2x, c2y, x, y) => path.curve_to(
                (f64::from(c1x), f64::from(c1y)),
                (f64::from(c2x), f64::from(c2y)),
                (f64::from(x), f64::from(y)),
            ),
            GlyphVerb::Close => path.close_path(),
        }
    }
    path
}

fn paint_text(
    scene: &mut Scene,
    run: &crate::TextRun,
    transform: Affine,
    fonts: Option<&mut FontSystem>,
) {
    if let Some(fonts) = fonts
        && let Some(face) = fonts.query(&run.family, run.weight, run.style)
    {
        let mut x = f64::from(run.origin.x);
        let baseline = f64::from(run.origin.y);
        for ch in run.text.chars() {
            let Some(glyph) = fonts.glyph_for_char(face, ch) else {
                continue;
            };
            let advance = fonts
                .advance(face, glyph, run.size)
                .unwrap_or(run.size * 0.5);
            if let Some(outline) = fonts.outline(face, glyph, run.size)
                && !outline.verbs.is_empty()
            {
                let path = outline_to_path(&outline.verbs);
                let affine = transform
                    * Affine::translate((x, baseline))
                    * Affine::scale_non_uniform(1.0, -1.0);
                scene.fill(Fill::NonZero, affine, color(run.color), None, &path);
            } else if let Some(bitmap) = fonts.rasterize(face, glyph, run.size)
                && bitmap.width > 0
                && bitmap.height > 0
                && !bitmap.data.is_empty()
            {
                let rgba = glyph_to_rgba(&bitmap, run.color);
                let image = peniko_rgba(rgba, bitmap.width, bitmap.height);
                let affine = transform
                    * Affine::translate((
                        x + f64::from(bitmap.left),
                        baseline - f64::from(bitmap.top),
                    ));
                scene.draw_image(&image, affine);
            }
            x += f64::from(advance);
        }
        return;
    }
    let mut x = f64::from(run.origin.x);
    let y = f64::from(run.origin.y) - f64::from(run.size);
    let w = f64::from(run.size) * 0.5;
    let h = f64::from(run.size);
    for _ch in run.text.chars() {
        scene.fill(
            Fill::NonZero,
            transform,
            color(run.color),
            None,
            &KRect::new(x, y, x + w.max(1.0), y + h.max(1.0)),
        );
        x += w.max(1.0);
    }
}

/// [`build_scene_with`] plus glyph outlines from [`FontSystem`].
#[must_use]
pub fn build_scene_fonts(
    list: &DisplayList,
    scale: f32,
    images: Option<&ImageCache>,
    mut fonts: Option<&mut FontSystem>,
) -> Scene {
    let mut scene = Scene::new();
    let transform = Affine::scale(f64::from(scale));
    for item in list.items() {
        match item {
            DisplayItem::Rect { rect, color: c } => {
                scene.fill(Fill::NonZero, transform, color(*c), None, &krect(*rect));
            }
            DisplayItem::Border {
                rect,
                widths,
                color: c,
            } => {
                // Uniform-width borders stroke the centre line; mixed widths fall back to four fills.
                let uniform = widths.top == widths.right
                    && widths.top == widths.bottom
                    && widths.top == widths.left;
                if uniform && widths.top > 0.0 {
                    let inset = f64::from(widths.top) / 2.0;
                    let r = krect(*rect).inset(-inset);
                    scene.stroke(
                        &Stroke::new(f64::from(widths.top)),
                        transform,
                        color(*c),
                        None,
                        &r,
                    );
                } else {
                    let r = *rect;
                    for side in [
                        Rect::new(r.x(), r.y(), r.width(), widths.top),
                        Rect::new(r.x(), r.bottom() - widths.bottom, r.width(), widths.bottom),
                        Rect::new(r.x(), r.y(), widths.left, r.height()),
                        Rect::new(r.right() - widths.right, r.y(), widths.right, r.height()),
                    ] {
                        scene.fill(Fill::NonZero, transform, color(*c), None, &krect(side));
                    }
                }
            }
            DisplayItem::Text(run) => {
                paint_text(&mut scene, run, transform, fonts.as_deref_mut());
            }
            DisplayItem::Image { rect, handle } => {
                if let Some(img) = images.and_then(|c| c.get(*handle)) {
                    let image = peniko_rgba(img.rgba.clone(), img.width, img.height);
                    let sx = f64::from(rect.width()) / f64::from(img.width.max(1));
                    let sy = f64::from(rect.height()) / f64::from(img.height.max(1));
                    let affine = transform
                        * Affine::translate((f64::from(rect.x()), f64::from(rect.y())))
                        * Affine::scale_non_uniform(sx, sy);
                    scene.draw_image(&image, affine);
                } else {
                    scene.fill(
                        Fill::NonZero,
                        transform,
                        color(ve_style::Rgba::rgb(255, 0, 255)),
                        None,
                        &krect(*rect),
                    );
                }
            }
            DisplayItem::PushClip(rect) => {
                scene.push_clip_layer(Fill::NonZero, transform, &krect(*rect))
            }
            DisplayItem::PushOpacity(alpha) => {
                let everything = KRect::new(
                    0.0,
                    0.0,
                    f64::from(list.size.width),
                    f64::from(list.size.height),
                );
                scene.push_layer(Fill::NonZero, Mix::Normal, *alpha, transform, &everything);
            }
            DisplayItem::PopClip | DisplayItem::PopOpacity => scene.pop_layer(),
        }
    }
    scene
}

/// vello renderer bound to a wgpu device.
pub struct VelloRenderer {
    device: wgpu::Device,
    queue: wgpu::Queue,
    renderer: vello::Renderer,
    /// Glyph rasteriser used when encoding text.
    pub fonts: FontSystem,
}

impl std::fmt::Debug for VelloRenderer {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("VelloRenderer").finish_non_exhaustive()
    }
}

impl VelloRenderer {
    /// Creates a renderer for `device`.
    pub fn new(device: wgpu::Device, queue: wgpu::Queue) -> Result<Self, GfxError> {
        let renderer = vello::Renderer::new(
            &device,
            RendererOptions {
                use_cpu: false,
                antialiasing_support: AaSupport::area_only(),
                num_init_threads: NonZeroUsize::new(1),
                ..RendererOptions::default()
            },
        )
        .map_err(|e| GfxError::Gpu(e.to_string()))?;
        Ok(Self {
            device,
            queue,
            renderer,
            fonts: FontSystem::new(),
        })
    }

    /// Renders a scene to an RGBA8 texture and reads it back.
    pub fn render_scene(
        &mut self,
        scene: &Scene,
        width: u32,
        height: u32,
    ) -> Result<Frame, GfxError> {
        let size = wgpu::Extent3d {
            width,
            height,
            depth_or_array_layers: 1,
        };
        let texture = self.device.create_texture(&wgpu::TextureDescriptor {
            label: Some("ve-gfx target"),
            size,
            mip_level_count: 1,
            sample_count: 1,
            dimension: wgpu::TextureDimension::D2,
            format: wgpu::TextureFormat::Rgba8Unorm,
            usage: wgpu::TextureUsages::STORAGE_BINDING | wgpu::TextureUsages::COPY_SRC,
            view_formats: &[],
        });
        let view = texture.create_view(&wgpu::TextureViewDescriptor::default());
        let params = RenderParams {
            base_color: Color::TRANSPARENT,
            width,
            height,
            antialiasing_method: AaConfig::Area,
        };
        self.renderer
            .render_to_texture(&self.device, &self.queue, scene, &view, &params)
            .map_err(|e| GfxError::Gpu(e.to_string()))?;

        let bytes_per_row = (width * 4).div_ceil(wgpu::COPY_BYTES_PER_ROW_ALIGNMENT)
            * wgpu::COPY_BYTES_PER_ROW_ALIGNMENT;
        let buffer = self.device.create_buffer(&wgpu::BufferDescriptor {
            label: Some("ve-gfx readback"),
            size: u64::from(bytes_per_row) * u64::from(height),
            usage: wgpu::BufferUsages::COPY_DST | wgpu::BufferUsages::MAP_READ,
            mapped_at_creation: false,
        });
        let mut encoder = self
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("ve-gfx readback"),
            });
        encoder.copy_texture_to_buffer(
            texture.as_image_copy(),
            wgpu::TexelCopyBufferInfo {
                buffer: &buffer,
                layout: wgpu::TexelCopyBufferLayout {
                    offset: 0,
                    bytes_per_row: Some(bytes_per_row),
                    rows_per_image: None,
                },
            },
            size,
        );
        self.queue.submit(Some(encoder.finish()));
        buffer.map_async(wgpu::MapMode::Read, .., |_| {});
        self.device
            .poll(wgpu::PollType::wait_indefinitely())
            .map_err(|e| GfxError::Gpu(e.to_string()))?;
        let mapped = buffer.get_mapped_range(..);
        let mut rgba = Vec::with_capacity((width as usize) * (height as usize) * 4);
        for row in mapped.chunks(bytes_per_row as usize) {
            rgba.extend_from_slice(&row[..(width * 4) as usize]);
        }
        drop(mapped);
        buffer.unmap();
        Ok(Frame {
            width,
            height,
            rgba,
        })
    }

    /// Direct presentation: paint `scene` into `view` without a CPU readback.
    pub fn present_scene(
        &mut self,
        scene: &Scene,
        view: &wgpu::TextureView,
        width: u32,
        height: u32,
    ) -> Result<(), GfxError> {
        let params = RenderParams {
            base_color: Color::TRANSPARENT,
            width,
            height,
            antialiasing_method: AaConfig::Area,
        };
        self.renderer
            .render_to_texture(&self.device, &self.queue, scene, view, &params)
            .map_err(|e| GfxError::Gpu(e.to_string()))
    }
}

impl Renderer for VelloRenderer {
    fn name(&self) -> &'static str {
        "vello"
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
        let scene = build_scene_fonts(
            list,
            if scale > 0.0 { scale } else { 1.0 },
            None,
            Some(&mut self.fonts),
        );
        self.render_scene(&scene, width, height)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ve_core::Size;

    #[test]
    fn scene_building_needs_no_device() {
        let mut list = DisplayList::new(Size::new(10.0, 10.0));
        list.push(DisplayItem::PushClip(Rect::new(0.0, 0.0, 5.0, 5.0)));
        list.push(DisplayItem::Rect {
            rect: Rect::new(0.0, 0.0, 10.0, 10.0),
            color: ve_style::Rgba::BLACK,
        });
        list.push(DisplayItem::PopClip);
        let scene = build_scene(&list, 2.0);
        assert!(!scene.encoding().is_empty());
    }

    #[test]
    fn text_and_image_items_are_not_dropped() {
        let mut list = DisplayList::new(Size::new(40.0, 20.0));
        list.push(DisplayItem::Text(crate::TextRun {
            origin: ve_core::Point::new(1.0, 12.0),
            text: "Hi".into(),
            size: 10.0,
            color: ve_style::Rgba::BLACK,
            weight: ve_style::FontWeight::NORMAL,
            style: ve_style::FontStyle::Normal,
            family: vec![],
        }));
        list.push(DisplayItem::Image {
            rect: Rect::new(0.0, 0.0, 8.0, 8.0),
            handle: crate::ImageHandle(1),
        });
        let empty = DisplayList::new(Size::new(40.0, 20.0));
        let with = build_scene(&list, 1.0);
        let without = build_scene(&empty, 1.0);
        assert!(
            !with.encoding().is_empty(),
            "text/image must encode GPU commands"
        );
        assert!(
            without.encoding().is_empty()
                || with.encoding().draw_tags.len() >= without.encoding().draw_tags.len()
        );
    }

    #[test]
    fn glyph_outlines_encode_when_fonts_are_loaded() {
        let mut fonts = FontSystem::new();
        fonts.load_system_fonts();
        if fonts.is_empty() {
            return;
        }
        let mut list = DisplayList::new(Size::new(80.0, 24.0));
        list.push(DisplayItem::Text(crate::TextRun {
            origin: ve_core::Point::new(2.0, 16.0),
            text: "Ag".into(),
            size: 16.0,
            color: ve_style::Rgba::BLACK,
            weight: ve_style::FontWeight::NORMAL,
            style: ve_style::FontStyle::Normal,
            family: vec![ve_style::FontFamily::SansSerif],
        }));
        let cells = build_scene(&list, 1.0);
        let glyphs = build_scene_fonts(&list, 1.0, None, Some(&mut fonts));
        assert!(!glyphs.encoding().is_empty());
        assert!(
            glyphs.encoding().resources.patches.is_empty(),
            "glyph outlines fill paths; image patches are the bitmap fallback"
        );
        assert!(
            glyphs.encoding().draw_tags.len() >= cells.encoding().draw_tags.len(),
            "outlined glyphs must encode at least as many draw tags as cell fallback"
        );
    }
}
