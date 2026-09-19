//! OS window for `ve-shell --gui` (VEC-014).
//!
//! winit delivers keys, IME, and pointer events; softbuffer presents the
//! engine framebuffer. Chrome title is always [`ve_api::NativeBrowser::CHROME_TITLE`].
//! AccessKit publishes chrome-then-page to the platform accessibility API.

use std::num::NonZeroU32;
use std::sync::Arc;

use accesskit_winit::{Adapter, Event as AccessKitEvent, WindowEvent as AccessKitWindowEvent};
use anyhow::Result;
use softbuffer::{Context, Surface};
use ve_api::{BrowserService, BrowserServicePump, KeyState, NativeBrowser, NativeEvent};
use winit::application::ApplicationHandler;
use winit::event::{ElementState, MouseButton, WindowEvent};
use winit::event_loop::{ActiveEventLoop, ControlFlow, EventLoop, EventLoopProxy};
use winit::keyboard::{Key, ModifiersState, NamedKey};
use winit::window::{Window, WindowId};

/// Runs until the window is closed.
pub fn run(browser: NativeBrowser) -> Result<()> {
    run_shared(BrowserService::from_browser(browser), None)
}

/// GUI and MCP share one [`BrowserService`] / [`NativeBrowser`].
pub fn run_shared(service: BrowserService, pump: Option<BrowserServicePump>) -> Result<()> {
    let event_loop = EventLoop::<AccessKitEvent>::with_user_event().build()?;
    event_loop.set_control_flow(if pump.is_some() {
        ControlFlow::WaitUntil(std::time::Instant::now() + std::time::Duration::from_millis(16))
    } else {
        ControlFlow::Wait
    });
    let mut app = App {
        service,
        pump,
        window: None,
        context: None,
        surface: None,
        mods: ModifiersState::default(),
        adapter: None,
        proxy: event_loop.create_proxy(),
        host: None,
        #[cfg(feature = "gpu")]
        gpu: None,
    };
    event_loop.run_app(&mut app)?;
    Ok(())
}

struct App {
    service: BrowserService,
    pump: Option<BrowserServicePump>,
    window: Option<Arc<Window>>,
    #[allow(dead_code)]
    context: Option<Context<Arc<Window>>>,
    surface: Option<Surface<Arc<Window>, Arc<Window>>>,
    mods: ModifiersState,
    adapter: Option<Adapter>,
    proxy: EventLoopProxy<AccessKitEvent>,
    host: Option<ve_shell_mac::MacWindow>,
    #[cfg(feature = "gpu")]
    gpu: Option<crate::gpu_window::GpuWindow>,
}

impl App {
    fn browser(&self) -> &NativeBrowser {
        self.service.browser()
    }

    fn browser_mut(&mut self) -> &mut NativeBrowser {
        self.service.browser_mut()
    }

    fn drain_service(&mut self) -> bool {
        let Some(pump) = &self.pump else {
            return false;
        };
        pump.poll(&mut self.service) > 0
    }

    fn redraw(&mut self) {
        let Some(window) = &self.window else {
            return;
        };
        let tree = self.browser().accesskit_update();
        if let Some(adapter) = &mut self.adapter {
            adapter.update_if_active(|| tree);
        }
        #[cfg(feature = "gpu")]
        if let Some(gpu) = &mut self.gpu
        {
            let scale = window.scale_factor() as f32;
            if gpu.present(self.service.browser_mut(), scale).is_ok()
            {
                window.set_title(NativeBrowser::CHROME_TITLE);
                return;
            }
        }
        let Some(surface) = &mut self.surface else {
            return;
        };
        let _ = self.service.browser_mut().present();
        let frame = self.service.browser().framebuffer();
        let size = window.inner_size();
        let Some(w) = NonZeroU32::new(size.width) else {
            return;
        };
        let Some(h) = NonZeroU32::new(size.height) else {
            return;
        };
        if surface.resize(w, h).is_err() {
            return;
        }
        let Ok(mut buffer) = surface.buffer_mut() else {
            return;
        };
        let dst_w = size.width as usize;
        let dst_h = size.height as usize;
        let src_w = frame.width as usize;
        let src_h = frame.height as usize;
        if src_w == dst_w && src_h == dst_h && frame.rgba.len() >= src_w * src_h * 4 {
            for y in 0..dst_h {
                let src_row = y * src_w * 4;
                for x in 0..dst_w {
                    let i = src_row + x * 4;
                    let px = &frame.rgba[i..i + 4];
                    buffer[y * dst_w + x] = (u32::from(px[3]) << 24)
                        | (u32::from(px[0]) << 16)
                        | (u32::from(px[1]) << 8)
                        | u32::from(px[2]);
                }
            }
        } else {
            for y in 0..dst_h {
                let sy = y * src_h / dst_h.max(1);
                for x in 0..dst_w {
                    let sx = x * src_w / dst_w.max(1);
                    let px = frame
                        .pixel(sx as u32, sy as u32)
                        .unwrap_or([255, 255, 255, 255]);
                    buffer[y * dst_w + x] = (u32::from(px[3]) << 24)
                        | (u32::from(px[0]) << 16)
                        | (u32::from(px[1]) << 8)
                        | u32::from(px[2]);
                }
            }
        }
        let _ = buffer.present();
        window.set_title(NativeBrowser::CHROME_TITLE);
    }

    fn resize_viewport(&mut self, phys_w: u32, phys_h: u32, scale: Option<f32>) {
        #[cfg(feature = "gpu")]
        if let Some(gpu) = &mut self.gpu {
            gpu.resize(phys_w, phys_h);
        }
        let scale = scale.unwrap_or_else(|| {
            self.window
                .as_ref()
                .map_or(1.0, |w| w.scale_factor() as f32)
        });
        self.browser_mut().set_device_scale(scale.max(0.01));
        let _ = self.browser_mut().handle_event(NativeEvent::Resize {
            width: phys_w as f32 / scale.max(0.01),
            height: phys_h as f32 / scale.max(0.01),
        });
        if let Some(w) = &self.window {
            w.request_redraw();
        }
    }
}

impl ApplicationHandler<AccessKitEvent> for App {
    fn resumed(&mut self, event_loop: &ActiveEventLoop) {
        let attrs = Window::default_attributes()
            .with_title(NativeBrowser::CHROME_TITLE)
            .with_visible(false)
            .with_inner_size(winit::dpi::LogicalSize::new(1280.0, 720.0));
        let Ok(window) = event_loop.create_window(attrs) else {
            event_loop.exit();
            return;
        };
        window.set_ime_allowed(true);
        let mut host = ve_shell_mac::MacWindow::product();
        host.set_appearance(match self.browser().chrome().theme {
            ve_chrome::ChromeTheme::Light => ve_shell_mac::Appearance::Light,
            ve_chrome::ChromeTheme::Dark => ve_shell_mac::Appearance::Dark,
        });
        self.host = Some(host);
        let adapter = Adapter::with_event_loop_proxy(&window, self.proxy.clone());
        window.set_visible(true);
        let window = Arc::new(window);
        self.adapter = Some(adapter);
        #[cfg(feature = "gpu")]
        {
            self.gpu = crate::gpu_window::GpuWindow::attach(window.clone()).ok();
        }
        let Ok(context) = Context::new(window.clone()) else {
            event_loop.exit();
            return;
        };
        let Ok(surface) = Surface::new(&context, window.clone()) else {
            event_loop.exit();
            return;
        };
        self.window = Some(window);
        self.context = Some(context);
        self.surface = Some(surface);
        self.redraw();
    }

    fn about_to_wait(&mut self, event_loop: &ActiveEventLoop) {
        let drained = self.drain_service();
        if self.browser().needs_frame() {
            let range = ve_shell_mac::MacWindow::preferred_frame_rate_range(
                true,
                self.browser().reduced_motion(),
            );
            let dt = (1000.0 / range.preferred.max(10.0)).round() as u64;
            let dt = dt.clamp(8, 100);
            let _ = self
                .browser_mut()
                .handle_event(NativeEvent::Frame { dt_ms: dt as f32 });
            if let Some(w) = &self.window {
                w.request_redraw();
            }
            event_loop.set_control_flow(ControlFlow::WaitUntil(
                std::time::Instant::now() + std::time::Duration::from_millis(dt),
            ));
            return;
        }
        if drained {
            if let Some(w) = &self.window {
                w.request_redraw();
            }
        }
        if self.pump.is_some() {
            event_loop.set_control_flow(ControlFlow::WaitUntil(
                std::time::Instant::now() + std::time::Duration::from_millis(16),
            ));
        } else {
            event_loop.set_control_flow(ControlFlow::Wait);
        }
    }

    fn user_event(&mut self, _event_loop: &ActiveEventLoop, event: AccessKitEvent) {
        match event.window_event {
            AccessKitWindowEvent::InitialTreeRequested => {
                let tree = self.browser().accesskit_update();
                if let Some(adapter) = &mut self.adapter {
                    adapter.update_if_active(|| tree);
                }
            }
            AccessKitWindowEvent::ActionRequested(req) => {
                let name = self.browser().accesskit_action_name(req.target.0);
                let _ = self
                    .browser_mut()
                    .handle_event(NativeEvent::AccessKitAction { name });
                if let Some(w) = &self.window {
                    w.request_redraw();
                }
            }
            AccessKitWindowEvent::AccessibilityDeactivated => {}
        }
    }

    fn window_event(&mut self, event_loop: &ActiveEventLoop, _id: WindowId, event: WindowEvent) {
        if let (Some(window), Some(adapter)) = (&self.window, &mut self.adapter) {
            adapter.process_event(window.as_ref(), &event);
        }
        match event {
            WindowEvent::CloseRequested => event_loop.exit(),
            WindowEvent::RedrawRequested => self.redraw(),
            WindowEvent::Resized(size) => {
                self.resize_viewport(size.width, size.height, None);
            }
            WindowEvent::ScaleFactorChanged { scale_factor, .. } => {
                if let Some(w) = &self.window {
                    let size = w.inner_size();
                    self.resize_viewport(size.width, size.height, Some(scale_factor as f32));
                }
            }
            WindowEvent::ModifiersChanged(m) => {
                self.mods = m.state();
            }
            WindowEvent::KeyboardInput { event, .. } => {
                let key = match event.logical_key {
                    Key::Named(NamedKey::Enter) => "Enter".into(),
                    Key::Named(NamedKey::Tab) => "Tab".into(),
                    Key::Named(NamedKey::Escape) => "Escape".into(),
                    Key::Named(NamedKey::Backspace) => "Backspace".into(),
                    Key::Named(NamedKey::Delete) => "Delete".into(),
                    Key::Named(NamedKey::Space) => " ".into(),
                    Key::Named(NamedKey::ArrowLeft) => "ArrowLeft".into(),
                    Key::Named(NamedKey::ArrowRight) => "ArrowRight".into(),
                    Key::Named(NamedKey::ArrowUp) => "ArrowUp".into(),
                    Key::Named(NamedKey::ArrowDown) => "ArrowDown".into(),
                    Key::Named(NamedKey::Home) => "Home".into(),
                    Key::Named(NamedKey::End) => "End".into(),
                    Key::Named(NamedKey::PageUp) => "PageUp".into(),
                    Key::Named(NamedKey::PageDown) => "PageDown".into(),
                    Key::Named(NamedKey::F1) => "F1".into(),
                    Key::Named(NamedKey::F2) => "F2".into(),
                    Key::Named(NamedKey::F3) => "F3".into(),
                    Key::Named(NamedKey::F4) => "F4".into(),
                    Key::Named(NamedKey::F5) => "F5".into(),
                    Key::Named(NamedKey::F12) => "F12".into(),
                    Key::Character(c) => c.to_string(),
                    _ => return,
                };
                let state = if event.state == ElementState::Pressed {
                    KeyState::Down
                } else {
                    KeyState::Up
                };
                let mut modifiers = 0u8;
                if self.mods.alt_key() {
                    modifiers |= 1;
                }
                if self.mods.control_key() {
                    modifiers |= 2;
                }
                if self.mods.super_key() {
                    modifiers |= 4;
                }
                if self.mods.shift_key() {
                    modifiers |= 8;
                }
                let chrome = self.mods.control_key() || self.mods.super_key();
                let ev = if state == KeyState::Down && chrome && key == "t" {
                    NativeEvent::NewTab {
                        html: "<body></body>".into(),
                        url: "about:blank".into(),
                    }
                } else if state == KeyState::Down && chrome && key == "w" {
                    NativeEvent::CloseTab
                } else if state == KeyState::Down && chrome && key == "l" {
                    NativeEvent::FocusUrlbar
                } else if state == KeyState::Down && chrome && key == "Tab" {
                    NativeEvent::NextTab
                } else {
                    NativeEvent::Key {
                        key,
                        code: format!("{:?}", event.physical_key),
                        modifiers,
                        repeat: event.repeat,
                        state,
                    }
                };
                let _ = self.browser_mut().handle_event(ev);
                if let Some(w) = &self.window {
                    w.request_redraw();
                }
            }
            WindowEvent::Ime(ime) => match ime {
                winit::event::Ime::Preedit(text, _) => {
                    if let Some(host) = &mut self.host {
                        host.set_ime(&text, true);
                    }
                    let _ = self
                        .browser_mut()
                        .handle_event(NativeEvent::ImePreedit { text });
                }
                winit::event::Ime::Commit(text) => {
                    if let Some(host) = &mut self.host {
                        host.set_ime(&text, false);
                    }
                    let _ = self.browser_mut().handle_event(NativeEvent::Ime { text });
                    if let Some(w) = &self.window {
                        w.request_redraw();
                    }
                }
                _ => {}
            },
            WindowEvent::CursorMoved { position, .. } => {
                let scale = self.window.as_ref().map_or(1.0, |w| w.scale_factor()) as f32;
                let _ = self.browser_mut().handle_event(NativeEvent::PointerMove {
                    x: position.x as f32 / scale.max(0.01),
                    y: position.y as f32 / scale.max(0.01),
                });
            }
            WindowEvent::MouseWheel { delta, phase, .. } => {
                let scroll_phase = match phase {
                    winit::event::TouchPhase::Started => ve_shell_mac::ScrollPhase::Began,
                    winit::event::TouchPhase::Moved => ve_shell_mac::ScrollPhase::Changed,
                    winit::event::TouchPhase::Ended => ve_shell_mac::ScrollPhase::Ended,
                    winit::event::TouchPhase::Cancelled => ve_shell_mac::ScrollPhase::Cancelled,
                };
                if let Some(host) = &mut self.host {
                    host.set_scroll_phase(scroll_phase);
                }
                let scale = self.window.as_ref().map_or(1.0, |w| w.scale_factor()) as f32;
                let (dx, dy) = match delta {
                    winit::event::MouseScrollDelta::LineDelta(x, y) => (x * 40.0, -y * 40.0),
                    winit::event::MouseScrollDelta::PixelDelta(p) => {
                        (p.x as f32 / scale.max(0.01), p.y as f32 / scale.max(0.01))
                    }
                };
                let _ = self.browser_mut().handle_event(NativeEvent::Wheel {
                    dx,
                    dy,
                    phase: scroll_phase,
                });
                if let Some(w) = &self.window {
                    w.request_redraw();
                }
            }
            WindowEvent::MouseInput {
                state: ElementState::Pressed,
                button,
                ..
            } => {
                let p = self.browser().pointer();
                let b = u8::from(button != MouseButton::Left);
                let _ = self.browser_mut().handle_event(NativeEvent::PointerDown {
                    x: p.x,
                    y: p.y,
                    button: b,
                });
                if let Some(w) = &self.window {
                    w.request_redraw();
                }
            }
            WindowEvent::MouseInput {
                state: ElementState::Released,
                button,
                ..
            } => {
                let p = self.browser().pointer();
                let b = u8::from(button != MouseButton::Left);
                let _ = self.browser_mut().handle_event(NativeEvent::PointerUp {
                    x: p.x,
                    y: p.y,
                    button: b,
                });
            }
            _ => {}
        }
    }
}
