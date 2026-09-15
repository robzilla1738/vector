//! GPU rendering through vello on wgpu (feature `gpu`).
//!
//! The embedder supplies a `wgpu::Device` + `Queue` (creating them is
//! asynchronous and platform specific); this module turns a [`DisplayList`]
//! into a `vello::Scene`, renders it to an offscreen RGBA8 texture and reads
//! the pixels back into a [`Frame`]. Text is not yet drawn here (vello glyph
//! runs need shaped glyph ids, which will come from parley in `ve-layout`).

use std::num::NonZeroUsize;

use ve_core::Rect;
use vello::kurbo::{Affine, Rect as KRect, Stroke};
use vello::peniko::{Color, Fill, Mix};
use vello::{AaConfig, AaSupport, RenderParams, RendererOptions, Scene};

use crate::GfxError;
use crate::display_list::{DisplayItem, DisplayList};
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
            DisplayItem::Text(_) | DisplayItem::Image { .. } => {}
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
        let scene = build_scene(list, if scale > 0.0 { scale } else { 1.0 });
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
}
