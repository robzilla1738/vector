//! Direct GPU presentation onto a winit window (VEC-013).
//!
//! Paints the engine display list to a wgpu surface without a CPU readback.
//! Capture still uses [`ve_api::NativeBrowser::present`].

use std::sync::Arc;

use ve_api::NativeBrowser;
use ve_gfx::VelloRenderer;
use winit::window::Window;

/// Window swapchain presenter.
pub struct GpuWindow {
    surface: wgpu::Surface<'static>,
    renderer: VelloRenderer,
    config: wgpu::SurfaceConfiguration,
    format: wgpu::TextureFormat,
}

impl GpuWindow {
    /// Creates a surface-compatible Vello renderer for `window`.
    pub fn attach(window: Arc<Window>) -> Result<Self, String> {
        let size = window.inner_size();
        let width = size.width.max(1);
        let height = size.height.max(1);
        let instance = wgpu::Instance::default();
        let surface = instance.create_surface(window).map_err(|e| e.to_string())?;
        let adapter = pollster::block_on(instance.request_adapter(&wgpu::RequestAdapterOptions {
            power_preference: wgpu::PowerPreference::HighPerformance,
            compatible_surface: Some(&surface),
            force_fallback_adapter: false,
        }))
        .or_else(|_| {
            pollster::block_on(instance.request_adapter(&wgpu::RequestAdapterOptions {
                compatible_surface: Some(&surface),
                force_fallback_adapter: true,
                ..wgpu::RequestAdapterOptions::default()
            }))
        })
        .map_err(|e| e.to_string())?;
        let (device, queue) =
            pollster::block_on(adapter.request_device(&wgpu::DeviceDescriptor::default()))
                .map_err(|e| e.to_string())?;
        let caps = surface.get_capabilities(&adapter);
        let format = caps
            .formats
            .iter()
            .copied()
            .find(|f| *f == wgpu::TextureFormat::Rgba8Unorm)
            .ok_or_else(|| "no Rgba8Unorm swapchain format".to_owned())?;
        let config = wgpu::SurfaceConfiguration {
            usage: wgpu::TextureUsages::COPY_DST | wgpu::TextureUsages::RENDER_ATTACHMENT,
            format,
            width,
            height,
            present_mode: wgpu::PresentMode::AutoVsync,
            alpha_mode: caps.alpha_modes[0],
            view_formats: vec![],
            desired_maximum_frame_latency: 2,
        };
        surface.configure(&device, &config);
        let renderer = VelloRenderer::new(device, queue).map_err(|e| e.to_string())?;
        Ok(Self {
            surface,
            renderer,
            config,
            format,
        })
    }

    /// Reconfigures the swapchain.
    pub fn resize(&mut self, width: u32, height: u32) {
        if width == 0 || height == 0 {
            return;
        }
        self.config.width = width;
        self.config.height = height;
        self.surface.configure(self.renderer.device(), &self.config);
    }

    /// Presents the live page without a CPU readback.
    pub fn present(&mut self, browser: &mut NativeBrowser, scale: f32) -> Result<(), String> {
        let list = browser.display_list_active().map_err(|e| e.to_string())?;
        let width = self.config.width.max(1);
        let height = self.config.height.max(1);
        self.renderer
            .present_list(&list, width, height, scale.max(0.01))
            .map_err(|e| e.to_string())?;
        let frame = match self.surface.get_current_texture() {
            wgpu::CurrentSurfaceTexture::Success(t)
            | wgpu::CurrentSurfaceTexture::Suboptimal(t) => t,
            wgpu::CurrentSurfaceTexture::Timeout => return Err("surface timeout".into()),
            wgpu::CurrentSurfaceTexture::Occluded => return Err("surface occluded".into()),
            wgpu::CurrentSurfaceTexture::Outdated => return Err("surface outdated".into()),
            wgpu::CurrentSurfaceTexture::Lost => return Err("surface lost".into()),
            wgpu::CurrentSurfaceTexture::Validation => return Err("surface validation".into()),
        };
        self.renderer
            .blit_present_target(&frame.texture, self.format, width, height)
            .map_err(|e| e.to_string())?;
        frame.present();
        Ok(())
    }
}
