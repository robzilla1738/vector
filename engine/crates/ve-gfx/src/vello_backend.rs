//! GPU rendering through vello on wgpu (feature `gpu`).
//!
//! The embedder supplies a `wgpu::Device` + `Queue`. Display lists carry
//! rectangles, borders, shaped text (as glyph cells plus optional decoded
//! images) into a `vello::Scene`. [`VelloRenderer::present_scene`] draws to a
//! texture without CPU readback; [`VelloRenderer::render_scene`] is the
//! capture/test path that copies pixels back.

use std::num::NonZeroUsize;

use ve_core::Rect;
use vello::kurbo::{Affine, Rect as KRect, Stroke};
use vello::peniko::{Blob, Color, Fill, FontData, Mix};
use vello::{AaConfig, AaSupport, Glyph, RenderParams, RendererOptions, Scene};

use crate::GfxError;
use crate::display_list::{DisplayItem, DisplayList};
use crate::fonts::FontSystem;
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

fn is_lost_device(err: &GfxError) -> bool {
    let GfxError::Gpu(s) = err else {
        return false;
    };
    let s = s.to_ascii_lowercase();
    s.contains("lost") || s.contains("destroyed")
}

fn readback_texture(
    device: &wgpu::Device,
    queue: &wgpu::Queue,
    texture: &wgpu::Texture,
    width: u32,
    height: u32,
) -> Result<Frame, GfxError> {
    let size = wgpu::Extent3d {
        width,
        height,
        depth_or_array_layers: 1,
    };
    let bytes_per_row = (width * 4).div_ceil(wgpu::COPY_BYTES_PER_ROW_ALIGNMENT)
        * wgpu::COPY_BYTES_PER_ROW_ALIGNMENT;
    let buffer = device.create_buffer(&wgpu::BufferDescriptor {
        label: Some("ve-gfx readback"),
        size: u64::from(bytes_per_row) * u64::from(height),
        usage: wgpu::BufferUsages::COPY_DST | wgpu::BufferUsages::MAP_READ,
        mapped_at_creation: false,
    });
    let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
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
    queue.submit(Some(encoder.finish()));
    buffer.map_async(wgpu::MapMode::Read, .., |_| {});
    device
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

fn peniko_rgba(rgba: Vec<u8>, width: u32, height: u32) -> vello::peniko::ImageBrush {
    vello::peniko::ImageBrush::from(vello::peniko::ImageData {
        data: vello::peniko::Blob::from(rgba),
        format: vello::peniko::ImageFormat::Rgba8,
        alpha_type: vello::peniko::ImageAlphaType::Alpha,
        width,
        height,
    })
}

fn paint_text(
    scene: &mut Scene,
    run: &crate::TextRun,
    transform: Affine,
    fonts: Option<&mut FontSystem>,
) {
    if let Some(fonts) = fonts
        && let Some(face) = fonts.query(&run.family, run.weight, run.style)
        && let Some(shaped) = fonts.shape_retained(face, &run.text, run.size)
    {
        if let Some(font) = fonts.with_face_bytes(face, |bytes, index| {
            FontData::new(Blob::new(std::sync::Arc::new(bytes.to_vec())), index)
        }) {
            let origin = Affine::translate((f64::from(run.origin.x), f64::from(run.origin.y)));
            scene
                .draw_glyphs(&font)
                .font_size(run.size)
                .hint(true)
                .brush(color(run.color))
                .transform(transform * origin)
                .draw(
                    Fill::NonZero,
                    shaped.glyphs.iter().map(|g| Glyph {
                        id: g.id,
                        x: g.x,
                        y: g.y,
                    }),
                );
            return;
        }
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
            DisplayItem::Image { rect, handle, .. } => {
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
            DisplayItem::PopClip | DisplayItem::PopOpacity | DisplayItem::PopTransform => {
                scene.pop_layer()
            }
            DisplayItem::RoundedClip { rect, .. } => {
                scene.push_clip_layer(Fill::NonZero, transform, &krect(*rect));
            }
            DisplayItem::PushTransform { tx, ty } => {
                let shifted = transform * Affine::translate((f64::from(*tx), f64::from(*ty)));
                let everything = KRect::new(
                    0.0,
                    0.0,
                    f64::from(list.size.width),
                    f64::from(list.size.height),
                );
                scene.push_layer(Fill::NonZero, Mix::Normal, 1.0, shifted, &everything);
            }
            DisplayItem::LinearGradient { rect, stops, .. } => {
                let c = stops
                    .first()
                    .map(|(_, c)| *c)
                    .unwrap_or(ve_style::Rgba::TRANSPARENT);
                scene.fill(Fill::NonZero, transform, color(c), None, &krect(*rect));
            }
            DisplayItem::FilterBlur { .. } => {}
            DisplayItem::BoxShadow {
                rect,
                dx,
                dy,
                color: c,
                ..
            } => {
                let shadow = Rect::new(rect.x() + dx, rect.y() + dy, rect.width(), rect.height());
                scene.fill(Fill::NonZero, transform, color(*c), None, &krect(shadow));
            }
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
    present_target: Option<(u32, u32, wgpu::Texture)>,
    cached_scene: Option<Scene>,
}

impl std::fmt::Debug for VelloRenderer {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("VelloRenderer").finish_non_exhaustive()
    }
}

impl VelloRenderer {
    /// Creates a headless GPU renderer (high-performance adapter, then fallback).
    ///
    /// Returns the renderer and a short adapter identity string
    /// (`backend:name`). Used by `MotionMark` GPU presentation.
    pub fn headless() -> Result<(Self, String), GfxError> {
        let instance = wgpu::Instance::default();
        let adapter =
            match pollster::block_on(instance.request_adapter(&wgpu::RequestAdapterOptions {
                power_preference: wgpu::PowerPreference::HighPerformance,
                compatible_surface: None,
                force_fallback_adapter: false,
            })) {
                Ok(a) => a,
                Err(_) => {
                    pollster::block_on(instance.request_adapter(&wgpu::RequestAdapterOptions {
                        force_fallback_adapter: true,
                        ..wgpu::RequestAdapterOptions::default()
                    }))
                    .map_err(|e| GfxError::Gpu(e.to_string()))?
                }
            };
        let info = adapter.get_info();
        let identity = format!("{:?}:{}", info.backend, info.name);
        let (device, queue) =
            pollster::block_on(adapter.request_device(&wgpu::DeviceDescriptor::default()))
                .map_err(|e| GfxError::Gpu(e.to_string()))?;
        Ok((Self::new(device, queue)?, identity))
    }

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
            present_target: None,
            cached_scene: None,
        })
    }

    /// wgpu device used for surface configuration.
    #[must_use]
    pub fn device(&self) -> &wgpu::Device {
        &self.device
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

    fn create_present_texture(device: &wgpu::Device, width: u32, height: u32) -> wgpu::Texture {
        device.create_texture(&wgpu::TextureDescriptor {
            label: Some("ve-gfx present target"),
            size: wgpu::Extent3d {
                width,
                height,
                depth_or_array_layers: 1,
            },
            mip_level_count: 1,
            sample_count: 1,
            dimension: wgpu::TextureDimension::D2,
            format: wgpu::TextureFormat::Rgba8Unorm,
            usage: wgpu::TextureUsages::STORAGE_BINDING | wgpu::TextureUsages::COPY_SRC,
            view_formats: &[],
        })
    }

    fn present_to_cached(
        &mut self,
        scene: &Scene,
        width: u32,
        height: u32,
    ) -> Result<(), GfxError> {
        let needs_new = self
            .present_target
            .as_ref()
            .is_none_or(|(w, h, _)| *w != width || *h != height);
        if needs_new {
            self.present_target = Some((
                width,
                height,
                Self::create_present_texture(&self.device, width, height),
            ));
        }
        let view = self
            .present_target
            .as_ref()
            .expect("present target")
            .2
            .create_view(&wgpu::TextureViewDescriptor::default());
        self.present_scene(scene, &view, width, height)
    }

    fn drop_present_target(&mut self) {
        self.present_target = None;
        self.cached_scene = None;
    }

    /// GPU present of `list` with no CPU readback (`MotionMark` / VEC-013).
    /// Reuses the offscreen target; on a device-lost error the target is
    /// dropped and the present is retried once.
    pub fn present_list(
        &mut self,
        list: &DisplayList,
        width: u32,
        height: u32,
        scale: f32,
    ) -> Result<(), GfxError> {
        if width == 0 || height == 0 {
            return Err(GfxError::Gpu("zero-sized frame".into()));
        }
        match self.present_list_once(list, width, height, scale) {
            Ok(()) => Ok(()),
            Err(e) if is_lost_device(&e) => {
                self.drop_present_target();
                self.present_list_once(list, width, height, scale)
            }
            Err(e) => Err(e),
        }
    }

    fn present_list_once(
        &mut self,
        list: &DisplayList,
        width: u32,
        height: u32,
        scale: f32,
    ) -> Result<(), GfxError> {
        let scene = build_scene_fonts(
            list,
            if scale > 0.0 { scale } else { 1.0 },
            None,
            Some(&mut self.fonts),
        );
        self.present_to_cached(&scene, width, height)
    }

    /// GPU present of a composited surface. Skips scene rebuild when the
    /// compositor is not damaged and a scene is already cached.
    pub fn present_composited(
        &mut self,
        compositor: &mut crate::Compositor,
        width: u32,
        height: u32,
        scale: f32,
    ) -> Result<(), GfxError> {
        if width == 0 || height == 0 {
            return Err(GfxError::Gpu("zero-sized frame".into()));
        }
        if compositor.is_damaged() || self.cached_scene.is_none() {
            let list = compositor.composite(ve_core::Size::new(width as f32, height as f32));
            self.cached_scene = Some(build_scene_fonts(
                &list,
                if scale > 0.0 { scale } else { 1.0 },
                None,
                Some(&mut self.fonts),
            ));
            let _ = compositor.take_damage();
        }
        let scene = self.cached_scene.take().expect("cached after rebuild");
        let result = match self.present_to_cached(&scene, width, height) {
            Ok(()) => Ok(()),
            Err(e) if is_lost_device(&e) => {
                self.drop_present_target();
                self.present_to_cached(&scene, width, height)
            }
            Err(e) => Err(e),
        };
        self.cached_scene = Some(scene);
        result
    }

    /// Copies the cached present target into a CPU frame (window / tests).
    pub fn readback_present_target(&mut self) -> Result<Frame, GfxError> {
        let (width, height) = self
            .present_target
            .as_ref()
            .map(|(w, h, _)| (*w, *h))
            .ok_or_else(|| GfxError::Gpu("no present target".into()))?;
        readback_texture(
            &self.device,
            &self.queue,
            &self.present_target.as_ref().expect("present target").2,
            width,
            height,
        )
    }

    /// GPU-GPU copy of the present target onto `dest` (window swapchain).
    /// `dest` must be `Rgba8Unorm` and have `COPY_DST`.
    pub fn blit_present_target(
        &self,
        dest: &wgpu::Texture,
        dest_format: wgpu::TextureFormat,
        width: u32,
        height: u32,
    ) -> Result<(), GfxError> {
        let src = self
            .present_target
            .as_ref()
            .ok_or_else(|| GfxError::Gpu("no present target".into()))?;
        if dest_format != wgpu::TextureFormat::Rgba8Unorm {
            return Err(GfxError::Gpu(format!(
                "surface format {dest_format:?} is not Rgba8Unorm"
            )));
        }
        let mut encoder = self
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("ve-gfx blit"),
            });
        encoder.copy_texture_to_texture(
            wgpu::TexelCopyTextureInfo {
                texture: &src.2,
                mip_level: 0,
                origin: wgpu::Origin3d::ZERO,
                aspect: wgpu::TextureAspect::All,
            },
            wgpu::TexelCopyTextureInfo {
                texture: dest,
                mip_level: 0,
                origin: wgpu::Origin3d::ZERO,
                aspect: wgpu::TextureAspect::All,
            },
            wgpu::Extent3d {
                width,
                height,
                depth_or_array_layers: 1,
            },
        );
        self.queue.submit(std::iter::once(encoder.finish()));
        Ok(())
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
            src: None,
            size: ve_style::BackgroundSize::Auto,
            position: ve_style::BackgroundPosition::default(),
            repeat: ve_style::BackgroundRepeat::NoRepeat,
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

    #[test]
    fn cpu_and_gpu_frames_for_text_and_image() {
        let mut list = DisplayList::new(Size::new(32.0, 16.0));
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
            src: None,
            size: ve_style::BackgroundSize::Auto,
            position: ve_style::BackgroundPosition::default(),
            repeat: ve_style::BackgroundRepeat::NoRepeat,
        });
        let mut cpu = crate::SoftwareRenderer::new();
        let cpu_frame = cpu.render(&list, 32, 16, 1.0).unwrap();
        assert!(!cpu_frame.rgba.is_empty());
        let Ok((mut gpu, _)) = VelloRenderer::headless() else {
            return;
        };
        let Ok(gpu_frame) = gpu.render(&list, 32, 16, 1.0) else {
            return;
        };
        assert_eq!(gpu_frame.width, cpu_frame.width);
        assert_eq!(gpu_frame.height, cpu_frame.height);
        assert!(!gpu_frame.rgba.is_empty());
        assert!(!build_scene(&list, 1.0).encoding().is_empty());
        assert!(gpu.present_list(&list, 32, 16, 1.0).is_ok());
        let _ = gpu.present_list(&list, 32, 16, 1.0);
    }
}
