//! OS window for `ve-shell --gui` (VEC-014).
//!
//! winit delivers keys, IME, and pointer events; softbuffer presents the
//! engine framebuffer. Chrome title is always [`ve_api::NativeBrowser::CHROME_TITLE`].

use std::num::NonZeroU32;
use std::rc::Rc;

use anyhow::Result;
use softbuffer::{Context, Surface};
use ve_api::{NativeBrowser, NativeEvent};
use winit::application::ApplicationHandler;
use winit::event::{ElementState, MouseButton, WindowEvent};
use winit::event_loop::{ActiveEventLoop, ControlFlow, EventLoop};
use winit::keyboard::{Key, ModifiersState, NamedKey};
use winit::window::{Window, WindowId};

/// Runs until the window is closed.
pub fn run(browser: NativeBrowser) -> Result<()> {
    let event_loop = EventLoop::new()?;
    event_loop.set_control_flow(ControlFlow::Wait);
    let mut app = App {
        browser,
        window: None,
        context: None,
        surface: None,
        mods: ModifiersState::default(),
    };
    event_loop.run_app(&mut app)?;
    Ok(())
}

struct App {
    browser: NativeBrowser,
    window: Option<Rc<Window>>,
    #[allow(dead_code)]
    context: Option<Context<Rc<Window>>>,
    surface: Option<Surface<Rc<Window>, Rc<Window>>>,
    mods: ModifiersState,
}

impl App {
    fn redraw(&mut self) {
        let Some(window) = &self.window else {
            return;
        };
        let Some(surface) = &mut self.surface else {
            return;
        };
        let _ = self.browser.present();
        let frame = self.browser.framebuffer();
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
        let _ = buffer.present();
        window.set_title(NativeBrowser::CHROME_TITLE);
    }
}

impl ApplicationHandler for App {
    fn resumed(&mut self, event_loop: &ActiveEventLoop) {
        let attrs = Window::default_attributes()
            .with_title(NativeBrowser::CHROME_TITLE)
            .with_inner_size(winit::dpi::LogicalSize::new(1280.0, 720.0));
        let Ok(window) = event_loop.create_window(attrs) else {
            event_loop.exit();
            return;
        };
        window.set_ime_allowed(true);
        let window = Rc::new(window);
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

    fn window_event(&mut self, event_loop: &ActiveEventLoop, _id: WindowId, event: WindowEvent) {
        match event {
            WindowEvent::CloseRequested => event_loop.exit(),
            WindowEvent::RedrawRequested => self.redraw(),
            WindowEvent::ModifiersChanged(m) => {
                self.mods = m.state();
            }
            WindowEvent::KeyboardInput { event, .. } => {
                if event.state != ElementState::Pressed {
                    return;
                }
                let key = match event.logical_key {
                    Key::Named(NamedKey::Enter) => "Enter".into(),
                    Key::Named(NamedKey::Tab) => "Tab".into(),
                    Key::Named(NamedKey::Escape) => "Escape".into(),
                    Key::Named(NamedKey::Backspace) => "Backspace".into(),
                    Key::Named(NamedKey::Space) => " ".into(),
                    Key::Character(c) => c.to_string(),
                    _ => return,
                };
                let chrome = self.mods.control_key() || self.mods.super_key();
                let ev = if chrome && key == "t" {
                    NativeEvent::NewTab {
                        html: "<body></body>".into(),
                        url: "about:blank".into(),
                    }
                } else if chrome && key == "w" {
                    NativeEvent::CloseTab
                } else if chrome && key == "l" {
                    NativeEvent::FocusUrlbar
                } else if chrome && key == "Tab" {
                    NativeEvent::NextTab
                } else {
                    NativeEvent::Key { key }
                };
                let _ = self.browser.handle_event(ev);
                if let Some(w) = &self.window {
                    w.request_redraw();
                }
            }
            WindowEvent::Ime(winit::event::Ime::Commit(text)) => {
                let _ = self.browser.handle_event(NativeEvent::Ime { text });
                if let Some(w) = &self.window {
                    w.request_redraw();
                }
            }
            WindowEvent::CursorMoved { position, .. } => {
                let _ = self.browser.handle_event(NativeEvent::PointerMove {
                    x: position.x as f32,
                    y: position.y as f32,
                });
            }
            WindowEvent::MouseInput {
                state: ElementState::Pressed,
                button,
                ..
            } => {
                let p = self.browser.pointer();
                let b = u8::from(button != MouseButton::Left);
                let _ = self.browser.handle_event(NativeEvent::PointerDown {
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
                let p = self.browser.pointer();
                let b = u8::from(button != MouseButton::Left);
                let _ = self.browser.handle_event(NativeEvent::PointerUp {
                    x: p.x,
                    y: p.y,
                    button: b,
                });
            }
            _ => {}
        }
    }
}
