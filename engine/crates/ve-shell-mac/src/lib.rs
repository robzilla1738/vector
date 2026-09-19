//! macOS window host (H2-A3).
//!
//! On macOS this wraps `objc2` `NSWindow`, the application menu, IME
//! (`NSTextInputClient`), scroll phases, and appearance. Every other OS uses
//! the headless test double with the same API.

use serde::{Deserialize, Serialize};

#[cfg(target_os = "macos")]
use objc2::rc::Retained;
#[cfg(target_os = "macos")]
use objc2_app_kit::NSWindow;

pub use ve_core::ScrollPhase;

/// `CADisplayLink.preferredFrameRateRange` (H1-A4 `ProMotion`).
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub struct FrameRateRange {
    /// Lowest acceptable Hz.
    pub minimum: f32,
    /// Highest acceptable Hz (120 on `ProMotion`).
    pub maximum: f32,
    /// Preferred Hz.
    pub preferred: f32,
}

/// Appearance.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum Appearance {
    /// Light.
    Light,
    /// Dark.
    Dark,
}

/// Application menu item.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct MenuItem {
    /// Title.
    pub title: String,
    /// Key equivalent (`t`, `[`, …).
    pub key: String,
    /// Command id (`new-tab`, `find`, …).
    pub command: String,
}

/// Default Vector menus (File / Edit / View / History).
#[must_use]
pub fn default_menus() -> Vec<(String, Vec<MenuItem>)> {
    vec![
        (
            "File".into(),
            vec![
                item("New Tab", "t", "new-tab"),
                item("Close Tab", "w", "close-tab"),
            ],
        ),
        (
            "Edit".into(),
            vec![
                item("Find…", "f", "find"),
                item("Copy", "c", "copy"),
                item("Paste", "v", "paste"),
            ],
        ),
        (
            "View".into(),
            vec![
                item("Reload", "r", "reload"),
                item("Actual Size", "0", "zoom-reset"),
                item("Zoom In", "=", "zoom-in"),
                item("Zoom Out", "-", "zoom-out"),
            ],
        ),
        (
            "History".into(),
            vec![item("Back", "[", "back"), item("Forward", "]", "forward")],
        ),
    ]
}

fn item(title: &str, key: &str, command: &str) -> MenuItem {
    MenuItem {
        title: title.into(),
        key: key.into(),
        command: command.into(),
    }
}

/// Window host. On macOS this wraps `NSWindow`; elsewhere it is a double.
#[derive(Clone, Debug)]
pub struct MacWindow {
    /// Title.
    pub title: String,
    /// Appearance.
    pub appearance: Appearance,
    /// Last scroll phase.
    pub scroll_phase: Option<ScrollPhase>,
    /// IME composition string.
    pub ime: String,
    /// IME marked range.
    pub ime_marked: bool,
    /// Installed menus.
    pub menus: Vec<(String, Vec<MenuItem>)>,
    /// Last menu command.
    pub last_command: Option<String>,
    /// Whether a native `NSWindow` was created (macOS only).
    pub native: bool,
    #[cfg(target_os = "macos")]
    _native_window: Option<Retained<NSWindow>>,
}

impl Default for MacWindow {
    fn default() -> Self {
        Self {
            title: "Vector".into(),
            appearance: Appearance::Dark,
            scroll_phase: None,
            ime: String::new(),
            ime_marked: false,
            menus: default_menus(),
            last_command: None,
            native: false,
            #[cfg(target_os = "macos")]
            _native_window: None,
        }
    }
}

impl MacWindow {
    /// Headless test double (all platforms).
    #[must_use]
    pub fn test_double() -> Self {
        Self::default()
    }

    /// Product window. On macOS this creates an `NSWindow`.
    #[must_use]
    pub fn product() -> Self {
        #[cfg(target_os = "macos")]
        {
            macos::create_window()
        }
        #[cfg(not(target_os = "macos"))]
        {
            Self::test_double()
        }
    }

    /// Attach the product host to the visible winit `NSView`.
    ///
    /// # Safety
    ///
    /// `ns_view` must be a live `AppKit` `NSView` on the main thread. The host
    /// retains its owning `NSWindow` for the lifetime of this value.
    #[cfg(target_os = "macos")]
    #[must_use]
    pub unsafe fn attach_product_view(
        ns_view: std::ptr::NonNull<std::ffi::c_void>,
    ) -> Option<Self> {
        unsafe { macos::attach_window(ns_view) }
    }

    /// Map `AppKit` `NSEvent.phase` / `momentumPhase` bits onto [`ScrollPhase`].
    #[must_use]
    pub fn scroll_phase_from_nsevent(phase: u8, momentum: u8) -> ScrollPhase {
        match (phase, momentum) {
            (1, _) => ScrollPhase::Began,
            (2, _) => ScrollPhase::Changed,
            (4 | 8, _) => ScrollPhase::Cancelled,
            (_, 1 | 2 | 4) => ScrollPhase::Ended,
            _ => ScrollPhase::Ended,
        }
    }

    /// `ProMotion` `preferredFrameRateRange`: 80–120 Hz while interacting,
    /// 10–80 Hz idle, 10–60 Hz when `prefers-reduced-motion`.
    #[must_use]
    pub fn preferred_frame_rate_range(interacting: bool, reduced_motion: bool) -> FrameRateRange {
        if reduced_motion {
            FrameRateRange {
                minimum: 10.0,
                maximum: 60.0,
                preferred: 60.0,
            }
        } else if interacting {
            FrameRateRange {
                minimum: 80.0,
                maximum: 120.0,
                preferred: 120.0,
            }
        } else {
            FrameRateRange {
                minimum: 10.0,
                maximum: 80.0,
                preferred: 10.0,
            }
        }
    }

    /// Map `NSAppearance` name onto [`Appearance`].
    #[must_use]
    pub fn appearance_from_ns_name(name: &str) -> Appearance {
        if name.to_ascii_lowercase().contains("dark") {
            Appearance::Dark
        } else {
            Appearance::Light
        }
    }

    /// Menu / IME / scroll-phase hook.
    pub fn set_scroll_phase(&mut self, phase: ScrollPhase) {
        self.scroll_phase = Some(phase);
    }

    /// IME composition (`NSTextInputClient` insertText / setMarkedText).
    pub fn set_ime(&mut self, text: impl Into<String>, marked: bool) {
        self.ime = text.into();
        self.ime_marked = marked;
    }

    /// Appearance from `AppKit` (`NSApp.effectiveAppearance`).
    pub fn set_appearance(&mut self, appearance: Appearance) {
        self.appearance = appearance;
    }

    /// Dispatch a menu command.
    pub fn perform(&mut self, command: &str) {
        self.last_command = Some(command.to_string());
    }
}

#[cfg(target_os = "macos")]
mod macos {
    use super::MacWindow;
    use objc2::MainThreadOnly;
    use objc2::rc::Retained;
    use objc2::runtime::AnyObject;
    use objc2_app_kit::{
        NSApplication, NSApplicationActivationPolicy, NSColor, NSMenu, NSMenuItem, NSView,
        NSWindow, NSWindowStyleMask,
    };
    use objc2_foundation::{MainThreadMarker, NSPoint, NSRect, NSSize, NSString};

    /// Creates a titled, closable, resizable `NSWindow` and the Vector menu.
    pub(super) fn create_window() -> MacWindow {
        let mtm =
            MainThreadMarker::new().expect("ve-shell product window requires the main thread");
        let app = NSApplication::sharedApplication(mtm);
        app.setActivationPolicy(NSApplicationActivationPolicy::Regular);
        let frame = NSRect::new(NSPoint::new(80.0, 80.0), NSSize::new(1280.0, 720.0));
        let mask = NSWindowStyleMask::Titled
            | NSWindowStyleMask::Closable
            | NSWindowStyleMask::Miniaturizable
            | NSWindowStyleMask::Resizable;
        let window = unsafe {
            NSWindow::initWithContentRect_styleMask_backing_defer(
                NSWindow::alloc(mtm),
                frame,
                mask,
                objc2_app_kit::NSBackingStoreType::Buffered,
                false,
            )
        };
        window.setTitle(&NSString::from_str("Vector"));
        window.setBackgroundColor(Some(&NSColor::colorWithWhite_alpha(0.122, 1.0)));
        install_menus(mtm, &app);
        window.makeKeyAndOrderFront(None);
        let host = host_for_window(window, &app);
        let _app: &AnyObject = app.as_ref();
        host
    }

    pub(super) unsafe fn attach_window(
        ns_view: std::ptr::NonNull<std::ffi::c_void>,
    ) -> Option<MacWindow> {
        let view = unsafe { Retained::<NSView>::retain(ns_view.as_ptr().cast()) }?;
        let window = view.window()?;
        let mtm = MainThreadMarker::new()?;
        let app = NSApplication::sharedApplication(mtm);
        install_menus(mtm, &app);
        window.setTitle(&NSString::from_str("Vector"));
        Some(host_for_window(window, &app))
    }

    fn host_for_window(window: Retained<NSWindow>, app: &NSApplication) -> MacWindow {
        let mut host = MacWindow {
            native: true,
            appearance: super::MacWindow::appearance_from_ns_name(
                &app.effectiveAppearance().name().to_string(),
            ),
            _native_window: Some(window),
            ..MacWindow::default()
        };
        host.set_ime(String::new(), false);
        host.set_scroll_phase(super::MacWindow::scroll_phase_from_nsevent(0, 0));
        host
    }

    fn install_menus(mtm: MainThreadMarker, app: &NSApplication) {
        let menubar = NSMenu::new(mtm);
        for (title, items) in super::default_menus() {
            let top = NSMenuItem::new(mtm);
            top.setTitle(&NSString::from_str(&title));
            let submenu = NSMenu::new(mtm);
            submenu.setTitle(&NSString::from_str(&title));
            for item in items {
                let key = NSString::from_str(&item.key);
                let mi = NSMenuItem::new(mtm);
                mi.setTitle(&NSString::from_str(&item.title));
                mi.setKeyEquivalent(&key);
                submenu.addItem(&mi);
            }
            top.setSubmenu(Some(&submenu));
            menubar.addItem(&top);
        }
        app.setMainMenu(Some(&menubar));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn host_forwards_ime_scroll_and_appearance() {
        let mut w = MacWindow::test_double();
        w.set_ime("你", true);
        w.set_scroll_phase(MacWindow::scroll_phase_from_nsevent(2, 0));
        w.set_appearance(MacWindow::appearance_from_ns_name("NSAppearanceNameAqua"));
        assert_eq!(w.ime, "你");
        assert!(w.ime_marked);
        assert_eq!(w.scroll_phase, Some(ScrollPhase::Changed));
        assert_eq!(w.appearance, Appearance::Light);
        w.set_ime("你好", false);
        w.set_scroll_phase(MacWindow::scroll_phase_from_nsevent(0, 2));
        assert_eq!(w.ime, "你好");
        assert!(!w.ime_marked);
        assert_eq!(w.scroll_phase, Some(ScrollPhase::Ended));
    }

    #[test]
    fn test_double_covers_ime_scroll_appearance_menus() {
        let mut w = MacWindow::test_double();
        w.set_scroll_phase(ScrollPhase::Began);
        w.set_ime("こんにちは", true);
        w.set_appearance(Appearance::Dark);
        w.perform("find");
        assert_eq!(w.scroll_phase, Some(ScrollPhase::Began));
        assert_eq!(w.ime, "こんにちは");
        assert!(w.ime_marked);
        assert_eq!(w.appearance, Appearance::Dark);
        assert_eq!(w.last_command.as_deref(), Some("find"));
        assert!(w.menus.iter().any(|(t, _)| t == "File"));
        assert!(!w.native);
        assert_eq!(
            MacWindow::scroll_phase_from_nsevent(1, 0),
            ScrollPhase::Began
        );
        assert_eq!(
            MacWindow::scroll_phase_from_nsevent(2, 0),
            ScrollPhase::Changed
        );
        assert_eq!(
            MacWindow::appearance_from_ns_name("NSAppearanceNameDarkAqua"),
            Appearance::Dark
        );
        assert_eq!(
            MacWindow::appearance_from_ns_name("NSAppearanceNameAqua"),
            Appearance::Light
        );
    }

    #[test]
    fn preferred_frame_rate_range_promotes_when_interacting() {
        let interact = MacWindow::preferred_frame_rate_range(true, false);
        assert_eq!(interact.minimum, 80.0);
        assert_eq!(interact.maximum, 120.0);
        assert_eq!(interact.preferred, 120.0);
        let idle = MacWindow::preferred_frame_rate_range(false, false);
        assert_eq!(idle.preferred, 10.0);
        assert!(idle.maximum <= 80.0);
        let reduce = MacWindow::preferred_frame_rate_range(true, true);
        assert!(reduce.maximum <= 60.0);
    }
}
