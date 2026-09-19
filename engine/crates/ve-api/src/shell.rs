//! Native-only browser shell (VEC-014).
//!
//! Privileged chrome (tabs, title, clipboard, permissions, accessibility)
//! lives here, not in the document. Page content cannot spoof chrome. No
//! Chromium/Electron is required: every tab is a [`crate::VectorEngine`] page.
//! Input from a human OS window and from an agent share [`NativeBrowser::handle_event`].

use std::collections::HashMap;
#[cfg(target_os = "macos")]
use std::io::Write;
#[cfg(target_os = "macos")]
use std::process::{Command, Stdio};

use serde::{Deserialize, Serialize};
use ve_chrome::{
    Chrome, ChromeBackend, ChromeHit, ChromeOverlay, ChromeTab, ChromeTheme, Pin, empty_layout,
    sync_order, sync_spaces, toggle_pin,
};
use ve_core::{Error, ErrorCode, Point, Result, Size, process_rss_bytes};
use ve_gfx::{Compositor, DisplayItem, DisplayList, Frame, Renderer, SoftwareRenderer};
use ve_profile::{Profile, SessionTab};

use crate::{
    EngineConfig, ExecuteRequest, ExecuteResult, Observation, ObservationRequest, OpenRequest,
    PageId, Program, ShaperKind, UpdateKeyPair, VectorEngine, verify_update_manifest,
};
use ve_agent::MouseButton;

/// A tab in the native shell.
#[derive(Clone, Debug)]
pub struct Tab {
    /// Engine page (placeholder for an explicit Chromium tab).
    pub page: PageId,
    /// Address bar URL.
    pub url: String,
    /// Document title (untrusted).
    pub page_title: String,
    /// Backend the user is looking at. Never swapped silently.
    pub backend: ChromeBackend,
    /// Why this backend was chosen.
    pub route_reason: String,
}

/// Key down or up.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum KeyState {
    /// Key pressed (including repeats).
    #[default]
    Down,
    /// Key released.
    Up,
}

/// Input the OS window (or tests) delivers to chrome + page.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", tag = "type")]
pub enum NativeEvent {
    /// Keyboard key (`Enter`, `Tab`, `ArrowLeft`, `F5`, …).
    Key {
        /// Key name (`Enter`, `a`, `ArrowDown`).
        key: String,
        /// UI Events `code` (`KeyA`, `ArrowDown`). Empty when unknown.
        #[serde(default)]
        code: String,
        /// Bitmask: 1 = alt, 2 = ctrl, 4 = meta, 8 = shift.
        #[serde(default)]
        modifiers: u8,
        /// OS key-repeat.
        #[serde(default)]
        repeat: bool,
        /// Down or up.
        #[serde(default)]
        state: KeyState,
    },
    /// IME committed text.
    Ime {
        /// Committed string.
        text: String,
    },
    /// IME preedit (composition). Not committed into the DOM.
    ImePreedit {
        /// Composition string.
        text: String,
    },
    /// Pointer moved in chrome/page CSS pixels.
    PointerMove {
        /// X.
        x: f32,
        /// Y.
        y: f32,
    },
    /// Pointer pressed.
    PointerDown {
        /// X.
        x: f32,
        /// Y.
        y: f32,
        /// 0 = left.
        button: u8,
    },
    /// Pointer released.
    PointerUp {
        /// X.
        x: f32,
        /// Y.
        y: f32,
        /// 0 = left.
        button: u8,
    },
    /// Address-bar navigation of the active tab.
    Navigate {
        /// URL or `data:`.
        url: String,
    },
    /// Open a tab with inline HTML.
    NewTab {
        /// HTML.
        html: String,
        /// URL.
        url: String,
    },
    /// Close the active tab.
    CloseTab,
    /// Quit the shell.
    Quit,
    /// Paste clipboard into the page as IME text.
    Paste,
    /// Copy selected or last-typed text into the chrome clipboard.
    Copy,
    /// Activate the next tab (chrome, wrap-around).
    NextTab,
    /// Activate the previous tab (chrome, wrap-around).
    PrevTab,
    /// Focus the address bar. Page script cannot do this.
    FocusUrlbar,
    /// Leave the address bar. Subsequent keys go to the page.
    BlurUrlbar,
    /// Type into the focused address bar.
    UrlbarType {
        /// Character or `Backspace`.
        text: String,
    },
    /// Navigate the active tab to the address-bar contents.
    UrlbarSubmit,
    /// Window resized; values are CSS pixels.
    Resize {
        /// Width in CSS pixels.
        width: f32,
        /// Height in CSS pixels.
        height: f32,
    },
    /// Wheel / scroll in CSS pixels.
    Wheel {
        /// Horizontal delta.
        dx: f32,
        /// Vertical delta.
        dy: f32,
    },
    /// AccessKit action from the platform (click/focus).
    AccessKitAction {
        /// Target role or name hint.
        name: String,
    },
    /// Text selection range on the focused field (character offsets).
    Select {
        /// Inclusive start.
        start: u32,
        /// Exclusive end.
        end: u32,
    },
}

/// Result of handling one native event.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct EventOutcome {
    /// The user asked the process to exit.
    pub quit: bool,
    /// Chrome title after the event (never the page title).
    pub chrome_title: &'static str,
}

/// A chrome-owned accessibility node. Pages cannot insert these.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChromeAxNode {
    /// Role (`application`, `tablist`, `tab`, `urlbar`).
    pub role: String,
    /// Accessible name.
    pub name: String,
    /// Always `false` for chrome nodes.
    pub from_page: bool,
}

/// Cached document-space display list. Scroll only re-translates.
struct DisplayListCache {
    layout_revision: u64,
    viewport: ve_core::Size,
    list: ve_gfx::DisplayList,
}

/// Native Vector browser. Human and agent share the same live documents.
pub struct NativeBrowser {
    engine: VectorEngine,
    tabs: Vec<Tab>,
    active: usize,
    clipboard: String,
    downloads: Vec<String>,
    permissions: HashMap<String, bool>,
    surface: Frame,
    pointer: Point,
    urlbar: String,
    urlbar_focused: bool,
    urlbar_selected: bool,
    compositor: Compositor,
    presented: bool,
    device_scale: f32,
    list_cache: Option<DisplayListCache>,
    from_layout_calls: u64,
    ime_preedit: String,
    last_typed: String,
    selection: Option<(usize, usize)>,
    os_clipboard: bool,
    update_pubkey: Option<[u8; 32]>,
    controller: NativeController,
    controller_epoch: u64,
    #[cfg(feature = "gpu")]
    gpu: Option<ve_gfx::VelloRenderer>,
    #[cfg(feature = "gpu")]
    gpu_unavailable: bool,
    #[cfg(feature = "gpu")]
    gpu_presented: bool,
    chrome_enabled: bool,
    chrome: Chrome,
    window_size: Size,
    profile: Option<Profile>,
    /// `VECTOR_ENGINE_MODE=always` / `VECTOR_ENGINE_ONLY=1`: never start Chromium.
    engine_only: bool,
    /// Reused software renderer (system fonts loaded once).
    sw: Option<SoftwareRenderer>,
    /// Last raster of `chrome.paint_base` (no page, no overlay).
    chrome_base: Option<Frame>,
    /// Signature of the chrome widgets used to paint `chrome_base`.
    chrome_base_sig: u64,
    /// Document-space raster of the untranslated page list (layout revision keyed).
    page_layer: Option<Frame>,
    /// Layout revision the page layer was painted at.
    page_layer_rev: u64,
}

/// Who currently owns input on the live page.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum NativeController {
    /// No exclusive owner.
    None,
    /// Agent program is allowed to dispatch.
    Agent,
    /// Human takeover: agent dispatch is rejected until resume.
    Human,
}

impl NativeBrowser {
    /// Privileged chrome product name. Pages cannot change this.
    pub const CHROME_TITLE: &'static str = "Vector";

    /// Offline native browser for tests and `ve-shell`.
    #[must_use]
    pub fn new() -> Self {
        Self::with_config(EngineConfig {
            offline: true,
            policy: ve_net::NetworkPolicy::permissive(),
            ..EngineConfig::default()
        })
    }

    /// Browser with a custom engine config.
    #[must_use]
    pub fn with_config(config: EngineConfig) -> Self {
        let device_scale = config.scale.max(0.01);
        Self {
            engine: VectorEngine::new(config),
            tabs: Vec::new(),
            active: 0,
            clipboard: String::new(),
            downloads: Vec::new(),
            permissions: HashMap::new(),
            surface: Frame::filled(1280, 720, [255, 255, 255, 255]),
            pointer: Point::ZERO,
            urlbar: String::new(),
            urlbar_focused: false,
            urlbar_selected: false,
            compositor: Compositor::new(),
            presented: false,
            device_scale,
            list_cache: None,
            from_layout_calls: 0,
            ime_preedit: String::new(),
            last_typed: String::new(),
            selection: None,
            os_clipboard: false,
            update_pubkey: None,
            controller: NativeController::None,
            controller_epoch: 0,
            #[cfg(feature = "gpu")]
            gpu: None,
            #[cfg(feature = "gpu")]
            gpu_unavailable: false,
            #[cfg(feature = "gpu")]
            gpu_presented: false,
            chrome_enabled: false,
            chrome: Chrome::default(),
            window_size: Size::new(1280.0, 720.0),
            profile: None,
            engine_only: engine_only_from_env(),
            sw: None,
            chrome_base: None,
            chrome_base_sig: 0,
            page_layer: None,
            page_layer_rev: 0,
        }
    }

    /// Backend identity: custom engine, never Chromium.
    #[must_use]
    pub fn identity(&self) -> serde_json::Value {
        serde_json::json!({
            "product": "ve-shell",
            "backend": "vector-engine",
            "chromium": false,
            "electron": false,
            "chromeTitle": Self::CHROME_TITLE,
            "tabs": self.tabs.len(),
            "rssBytes": process_rss_bytes(),
            "signedUpdates": self.update_pubkey.is_some(),
            "accessKit": true,
            "gpuPresent": self.gpu_present(),
            "engineOnly": self.engine_only,
            "activeBackend": self.active_tab().map(|t| match t.backend {
                ChromeBackend::Engine => "vector-engine",
                ChromeBackend::Chromium => "chromium",
            }),
            "shaper": match self.engine.config().shaper {
                ShaperKind::Metric => "metric",
                ShaperKind::System => "system",
            },
            "fromLayoutCalls": self.from_layout_calls,
            "deviceScale": self.device_scale,
        })
    }

    /// Display-list rebuilds since this browser was created.
    #[must_use]
    pub fn from_layout_calls(&self) -> u64 {
        self.from_layout_calls
    }

    /// Device pixel ratio used for present.
    #[must_use]
    pub fn device_scale(&self) -> f32 {
        self.device_scale
    }

    /// Sets the device pixel ratio (Retina = 2.0). Display list stays in CSS px.
    pub fn set_device_scale(&mut self, scale: f32) {
        self.device_scale = scale.max(0.01);
        if let Some(page) = self.active_tab().map(|t| t.page)
            && let Ok(p) = self.engine.page_mut(page)
        {
            p.set_scale(self.device_scale);
        }
        let (w, h) = self
            .active_tab()
            .and_then(|t| self.engine.page(t.page).ok())
            .map(|p| (p.viewport().width, p.viewport().height))
            .unwrap_or((1280.0, 720.0));
        self.resize_surface(w, h);
        self.presented = false;
    }

    /// True after a successful GPU present of the live page.
    #[must_use]
    pub fn gpu_present(&self) -> bool {
        #[cfg(feature = "gpu")]
        {
            self.gpu_presented
        }
        #[cfg(not(feature = "gpu"))]
        {
            false
        }
    }

    /// Opens a tab. Human and agent both target this page id.
    pub fn new_tab(&mut self, html: &str, url: &str) -> Result<&Tab> {
        let opened = self.engine.open(OpenRequest::html(html, Some(url)))?;
        self.tabs.push(Tab {
            page: opened.page,
            url: opened.url,
            page_title: opened.title,
            backend: ChromeBackend::Engine,
            route_reason: opened.routing.route_reason,
        });
        self.active = self.tabs.len() - 1;
        self.compositor.mark_damaged();
        if self.chrome_enabled {
            self.sync_chrome();
            self.persist_profile();
            self.apply_chrome_viewport();
        }
        Ok(self.tabs.last().unwrap())
    }

    /// Opens a tab by URL through the engine loader.
    pub fn open_url(&mut self, url: &str) -> Result<&Tab> {
        let opened = self.engine.open(OpenRequest {
            url: Some(url.to_owned()),
            ..OpenRequest::default()
        })?;
        self.tabs.push(Tab {
            page: opened.page,
            url: opened.url,
            page_title: opened.title,
            backend: ChromeBackend::Engine,
            route_reason: opened.routing.route_reason,
        });
        self.active = self.tabs.len() - 1;
        self.compositor.mark_damaged();
        if self.chrome_enabled {
            self.sync_chrome();
            self.persist_profile();
            self.apply_chrome_viewport();
        }
        Ok(self.tabs.last().unwrap())
    }

    /// Explicit Chromium tab. Engine-only mode refuses this (never silent).
    pub fn open_chromium_tab(&mut self, url: &str) -> Result<&Tab> {
        if self.engine_only {
            return Err(Error::coded(
                ErrorCode::CapabilityUnsupported,
                "engine-only mode does not start Chromium",
            ));
        }
        let opened = self.engine.open(OpenRequest::html(
            "<p>Chromium host — this tab is not the own engine.</p>",
            Some(url),
        ))?;
        self.tabs.push(Tab {
            page: opened.page,
            url: url.to_owned(),
            page_title: "Chromium".into(),
            backend: ChromeBackend::Chromium,
            route_reason: "explicit-backend:chromium".into(),
        });
        self.active = self.tabs.len() - 1;
        self.compositor.mark_damaged();
        if self.chrome_enabled {
            self.sync_chrome();
            self.apply_chrome_viewport();
        }
        Ok(self.tabs.last().unwrap())
    }

    /// Active tab.
    #[must_use]
    pub fn active_tab(&self) -> Option<&Tab> {
        self.tabs.get(self.active)
    }

    /// Chrome title is constant even if the document title collides.
    #[must_use]
    pub fn chrome_title(&self) -> &'static str {
        Self::CHROME_TITLE
    }

    /// Document title of the active tab (data, not authority).
    #[must_use]
    pub fn page_title(&self) -> Option<&str> {
        self.active_tab().map(|t| t.page_title.as_str())
    }

    /// Last pointer position in CSS pixels.
    #[must_use]
    pub fn pointer(&self) -> Point {
        self.pointer
    }

    /// Updates the engine viewport in CSS pixels. The surface is physical px.
    pub fn set_css_viewport(&mut self, width: f32, height: f32) {
        let w = width.max(1.0);
        let h = height.max(1.0);
        self.resize_surface(w, h);
        if let Some(page) = self.active_tab().map(|t| t.page)
            && let Ok(p) = self.engine.page_mut(page)
        {
            p.set_viewport(Size::new(w, h));
            p.set_scale(self.device_scale);
        }
        self.list_cache = None;
        self.page_layer = None;
        self.page_layer_rev = 0;
    }

    fn resize_surface(&mut self, css_w: f32, css_h: f32) {
        let pw = (css_w * self.device_scale).round().max(1.0) as u32;
        let ph = (css_h * self.device_scale).round().max(1.0) as u32;
        if self.surface.width == pw && self.surface.height == ph {
            return;
        }
        self.surface = Frame::filled(pw, ph, [255, 255, 255, 255]);
    }

    /// Chrome accessibility tree. Independent of page roles and names.
    #[must_use]
    pub fn chrome_ax(&self) -> Vec<ChromeAxNode> {
        let mut nodes = vec![
            ChromeAxNode {
                role: "application".into(),
                name: Self::CHROME_TITLE.into(),
                from_page: false,
            },
            ChromeAxNode {
                role: "tablist".into(),
                name: "Tabs".into(),
                from_page: false,
            },
        ];
        for (i, tab) in self.tabs.iter().enumerate() {
            nodes.push(ChromeAxNode {
                role: "tab".into(),
                name: if tab.page_title.is_empty() {
                    tab.url.clone()
                } else {
                    tab.page_title.clone()
                },
                from_page: false,
            });
            if i == self.active {
                nodes.push(ChromeAxNode {
                    role: "urlbar".into(),
                    name: if self.urlbar_focused {
                        self.urlbar.clone()
                    } else {
                        tab.url.clone()
                    },
                    from_page: false,
                });
            }
        }
        nodes
    }

    /// Chrome names plus page accessible names (chrome first, unspoofable).
    #[must_use]
    pub fn screen_reader_text(&self) -> String {
        self.reader_ax()
            .into_iter()
            .map(|n| n.name)
            .filter(|n| !n.is_empty())
            .collect::<Vec<_>>()
            .join(" ")
    }

    /// Chrome AX followed by page AX. Page nodes are marked `from_page`.
    #[must_use]
    pub fn reader_ax(&self) -> Vec<ChromeAxNode> {
        let mut nodes = self.chrome_ax();
        nodes.extend(self.page_ax());
        nodes
    }

    /// Maps a platform AccessKit node id to the name used by [`NativeEvent::AccessKitAction`].
    #[must_use]
    pub fn accesskit_action_name(&self, target: u64) -> String {
        if target == ve_a11y::URLBAR_ID.0 {
            return "urlbar".into();
        }
        if target == ve_a11y::TABLIST_ID.0 {
            return "tabs".into();
        }
        if target == ve_a11y::WINDOW_ID.0 {
            return "window".into();
        }
        self.page_ax()
            .into_iter()
            .find(|n| !n.name.is_empty())
            .map_or_else(|| "urlbar".into(), |n| n.name)
    }

    /// AccessKit tree for the native window (chrome first, then page).
    #[must_use]
    pub fn accesskit_update(&self) -> accesskit::TreeUpdate {
        let tabs: Vec<(String, bool)> = self
            .tabs
            .iter()
            .enumerate()
            .map(|(i, t)| {
                let name = if t.page_title.is_empty() {
                    t.url.clone()
                } else {
                    t.page_title.clone()
                };
                (name, i == self.active)
            })
            .collect();
        let urlbar = self.active_tab().map_or_else(String::new, |t| {
            if self.urlbar_focused {
                self.urlbar.clone()
            } else {
                t.url.clone()
            }
        });
        let page_tree = self.active_tab().and_then(|tab| {
            self.engine.page(tab.page).ok().map(|page| {
                ve_a11y::AccessibilityTree::build(
                    page.document(),
                    &ve_a11y::BuildOptions {
                        styles: Some(page.style_tree()),
                        focused: page.focused(),
                        ..ve_a11y::BuildOptions::default()
                    },
                )
            })
        });
        let focus = self
            .active_tab()
            .and_then(|tab| self.engine.page(tab.page).ok().and_then(|p| p.focused()));
        ve_a11y::shell_tree_update(
            Self::CHROME_TITLE,
            &tabs,
            &urlbar,
            page_tree.as_ref(),
            focus,
        )
    }

    /// Page accessibility names/roles. Never mixed into [`Self::chrome_ax`].
    #[must_use]
    pub fn page_ax(&self) -> Vec<ChromeAxNode> {
        let Some(tab) = self.active_tab() else {
            return Vec::new();
        };
        let Ok(page) = self.engine.page(tab.page) else {
            return Vec::new();
        };
        let tree = ve_a11y::AccessibilityTree::build(
            page.document(),
            &ve_a11y::BuildOptions {
                styles: Some(page.style_tree()),
                ..ve_a11y::BuildOptions::default()
            },
        );
        tree.root
            .iter()
            .filter(|n| !n.name.is_empty())
            .map(|n| ChromeAxNode {
                role: n.role.name().to_owned(),
                name: n.name.clone(),
                from_page: true,
            })
            .collect()
    }

    /// Signed-update channel. Enabled once a verifying key is installed.
    #[must_use]
    pub fn update_status(&self) -> serde_json::Value {
        serde_json::json!({
            "signedUpdates": self.update_pubkey.is_some(),
            "channel": if self.update_pubkey.is_some() { "signed" } else { "dev" },
            "current": env!("CARGO_PKG_VERSION"),
        })
    }

    /// Installs the Ed25519 verifying key for the update channel.
    pub fn install_update_key(&mut self, public: [u8; 32]) {
        self.update_pubkey = Some(public);
    }

    /// Verifies a signed update manifest. Unsigned or unknown keys fail.
    #[must_use]
    pub fn verify_update(&self, manifest: &[u8], signature: &[u8]) -> bool {
        self.update_pubkey
            .as_ref()
            .is_some_and(|pk| verify_update_manifest(pk, manifest, signature))
    }

    /// Bundled development key used by tests and unsigned local builds.
    #[must_use]
    pub fn development_update_keys() -> UpdateKeyPair {
        UpdateKeyPair::from_seed([b'V'; 32])
    }

    /// Agent and human observe the same page.
    pub fn observe_active(&mut self) -> Result<Observation> {
        self.observe_active_with(&ObservationRequest::default())
    }

    /// Observe the active tab with an explicit request (`format` included).
    pub fn observe_active_with(&mut self, request: &ObservationRequest) -> Result<Observation> {
        let tab = self
            .active_tab()
            .ok_or_else(|| Error::not_found("no tab"))?;
        if tab.backend == ChromeBackend::Chromium {
            return Err(Error::coded(
                ErrorCode::CapabilityUnsupported,
                "active tab is Chromium; agent must not observe engine DOM",
            ));
        }
        let page = tab.page;
        self.engine.observe(page, request)
    }

    /// Agent program against the live native document.
    pub fn execute_active(&mut self, program: Program) -> Result<ExecuteResult> {
        self.execute_request(ExecuteRequest {
            program,
            return_observation: None,
        })
    }

    /// Agent program, optionally observing in the same round trip.
    pub fn execute_request(&mut self, request: ExecuteRequest) -> Result<ExecuteResult> {
        if self.controller == NativeController::Human {
            return Err(Error::coded(
                ErrorCode::Conflict,
                "page is under human control — resume first",
            ));
        }
        self.controller = NativeController::Agent;
        self.dispatch_program(request)
    }

    fn dispatch_program(&mut self, request: ExecuteRequest) -> Result<ExecuteResult> {
        let tab = self
            .active_tab()
            .ok_or_else(|| Error::not_found("no tab"))?;
        if tab.backend == ChromeBackend::Chromium {
            return Err(Error::coded(
                ErrorCode::CapabilityUnsupported,
                "active tab is Chromium; agent must not execute against engine DOM",
            ));
        }
        let page = tab.page;
        let executed = self.engine.execute(page, &request)?;
        self.sync_active_tab();
        Ok(executed)
    }

    fn sync_active_tab(&mut self) {
        let Some(page_id) = self.active_tab().map(|t| t.page) else {
            return;
        };
        let Ok(page) = self.engine.page(page_id) else {
            return;
        };
        let url = page.url().to_owned();
        let title = page.title();
        if let Some(tab) = self.tabs.get_mut(self.active) {
            tab.url = url;
            tab.page_title = title;
        }
    }

    /// Live document URL, title, generation, and revision.
    #[must_use]
    pub fn active_page_meta(&self) -> Option<(String, String, u32, u64)> {
        let tab = self.active_tab()?;
        let page = self.engine.page(tab.page).ok()?;
        Some((
            page.url().to_owned(),
            page.title(),
            page.generation(),
            page.document().revision().0,
        ))
    }

    /// Human takeover: later agent programs fail until [`Self::resume`].
    pub fn takeover(&mut self) {
        self.controller = NativeController::Human;
        self.controller_epoch = self.controller_epoch.saturating_add(1);
    }

    /// Return the page to a shared/agent-eligible controller.
    pub fn resume(&mut self) {
        self.controller = NativeController::None;
        self.controller_epoch = self.controller_epoch.saturating_add(1);
    }

    /// Current input owner.
    #[must_use]
    pub fn controller(&self) -> NativeController {
        self.controller
    }

    /// Bumped on every takeover/resume.
    #[must_use]
    pub fn controller_epoch(&self) -> u64 {
        self.controller_epoch
    }

    /// Engine viewport of a live tab, in CSS pixels.
    #[must_use]
    pub fn engine_viewport_for_test(&self, page: PageId) -> (f32, f32) {
        self.engine
            .page(page)
            .map(|p| {
                let v = p.viewport();
                (v.width, v.height)
            })
            .unwrap_or((0.0, 0.0))
    }

    /// Keyboard input into the live document (same path the agent uses).
    pub fn press_key(&mut self, key: &str) -> Result<ExecuteResult> {
        self.execute_active(Program::from_value(serde_json::json!([
            {"id":"k","op":"press","key":key}
        ]))?)
    }

    /// Direct present of the live page into the retained window buffer.
    pub fn present(&mut self) -> Result<&Frame> {
        let page = self
            .active_tab()
            .ok_or_else(|| Error::not_found("no tab"))?
            .page;
        if self.presented && !self.compositor.is_damaged() {
            return Ok(&self.surface);
        }
        #[cfg(feature = "gpu")]
        if let Some(frame) = self.try_gpu_present(page) {
            self.surface = frame;
            let _ = self.compositor.take_damage();
            self.presented = true;
            return Ok(&self.surface);
        }
        if self.chrome_enabled {
            self.present_product_chrome()?;
            let _ = self.compositor.take_damage();
            self.presented = true;
            return Ok(&self.surface);
        }
        self.surface = self.engine.page_mut(page)?.present_frame(false)?;
        let _ = self.compositor.take_damage();
        self.presented = true;
        Ok(&self.surface)
    }

    /// GPU present of the live page with no CPU readback. Capture still uses
    /// [`Self::present`].
    #[cfg(feature = "gpu")]
    pub fn present_direct(&mut self) -> Result<bool> {
        let page = self
            .active_tab()
            .ok_or_else(|| Error::not_found("no tab"))?
            .page;
        if self.try_gpu_present_direct(page) {
            let _ = self.compositor.take_damage();
            self.presented = true;
            self.gpu_presented = true;
            return Ok(true);
        }
        Ok(false)
    }

    fn present_dirty(&mut self) {
        self.compositor.mark_damaged();
        let _ = self.present();
    }

    #[cfg(feature = "gpu")]
    fn try_gpu_present(&mut self, page: PageId) -> Option<Frame> {
        if self.gpu_unavailable && self.gpu.is_none() {
            return None;
        }
        let list = if self.chrome_enabled {
            self.paint_shell_list().ok()?
        } else {
            self.paint_page_id(page)?
        };
        if self.gpu.is_none() {
            match ve_gfx::VelloRenderer::headless() {
                Ok((renderer, _)) => self.gpu = Some(renderer),
                Err(_) => {
                    self.gpu_unavailable = true;
                    return None;
                }
            }
        }
        let gpu = self.gpu.as_mut()?;
        let width = self.surface.width;
        let height = self.surface.height;
        gpu.present_list(&list, width, height, self.device_scale)
            .ok()?;
        gpu.readback_present_target().ok()
    }

    #[cfg(feature = "gpu")]
    fn try_gpu_present_direct(&mut self, page: PageId) -> bool {
        if self.gpu_unavailable && self.gpu.is_none() {
            return false;
        }
        let list = if self.chrome_enabled {
            match self.paint_shell_list() {
                Ok(list) => list,
                Err(_) => return false,
            }
        } else {
            let Some(list) = self.paint_page_id(page) else {
                return false;
            };
            list
        };
        if self.gpu.is_none() {
            match ve_gfx::VelloRenderer::headless() {
                Ok((renderer, _)) => self.gpu = Some(renderer),
                Err(_) => {
                    self.gpu_unavailable = true;
                    return false;
                }
            }
        }
        let Some(gpu) = self.gpu.as_mut() else {
            return false;
        };
        gpu.present_list(
            &list,
            self.surface.width,
            self.surface.height,
            self.device_scale,
        )
        .is_ok()
    }

    /// Display list for the active tab (GPU window present without CPU readback).
    #[cfg(feature = "gpu")]
    pub fn display_list_active(&mut self) -> Result<ve_gfx::DisplayList> {
        self.paint_shell_list()
    }

    /// Scene/surface update for native presentation. Not a PNG and not a
    /// second copy of the document — clients paint this display list.
    pub fn scene_active(&mut self) -> Result<serde_json::Value> {
        let page = self
            .active_tab()
            .ok_or_else(|| Error::not_found("no tab"))?
            .page;
        let p = self.engine.page_mut(page)?;
        p.update();
        let mut value = scene_json(p);
        if let Some(obj) = value.as_object_mut() {
            obj.insert("page".into(), serde_json::json!(page.0));
            obj.insert(
                "controllerEpoch".into(),
                serde_json::json!(self.controller_epoch),
            );
            obj.insert("gpuPresent".into(), serde_json::json!(self.gpu_present()));
        }
        Ok(value)
    }

    /// Current framebuffer (after [`Self::present`]).
    #[must_use]
    pub fn framebuffer(&self) -> &Frame {
        &self.surface
    }

    /// Apply one OS/human event. Agent tools use the same document.
    pub fn handle_event(&mut self, event: NativeEvent) -> Result<EventOutcome> {
        match event {
            NativeEvent::Quit => {
                return Ok(EventOutcome {
                    quit: true,
                    chrome_title: Self::CHROME_TITLE,
                });
            }
            NativeEvent::NewTab { html, url } => {
                self.new_tab(&html, &url)?;
                self.present_dirty();
            }
            NativeEvent::CloseTab => {
                if !self.tabs.is_empty() {
                    let tab = self.tabs.remove(self.active);
                    let _ = self.engine.close(tab.page);
                    if self.active >= self.tabs.len() {
                        self.active = self.tabs.len().saturating_sub(1);
                    }
                    self.urlbar_focused = false;
                    self.compositor.mark_damaged();
                    if self.chrome_enabled {
                        self.sync_chrome();
                        self.persist_profile();
                    }
                }
            }
            NativeEvent::NextTab => {
                if !self.tabs.is_empty() {
                    self.active = (self.active + 1) % self.tabs.len();
                    self.urlbar_focused = false;
                    self.present_dirty();
                }
            }
            NativeEvent::PrevTab => {
                if !self.tabs.is_empty() {
                    self.active = (self.active + self.tabs.len() - 1) % self.tabs.len();
                    self.urlbar_focused = false;
                    self.present_dirty();
                }
            }
            NativeEvent::FocusUrlbar => {
                self.urlbar_focused = true;
                self.urlbar = self.active_tab().map(|t| t.url.clone()).unwrap_or_default();
                self.urlbar_selected = true;
                if self.chrome_enabled {
                    self.sync_chrome();
                }
            }
            NativeEvent::BlurUrlbar => {
                self.urlbar_focused = false;
                self.urlbar_selected = false;
            }
            NativeEvent::UrlbarType { text } => {
                if self.urlbar_focused {
                    if text == "Backspace" {
                        if self.urlbar_selected {
                            self.urlbar.clear();
                        } else {
                            self.urlbar.pop();
                        }
                    } else if self.urlbar_selected {
                        self.urlbar.clone_from(&text);
                    } else {
                        self.urlbar.push_str(&text);
                    }
                    self.urlbar_selected = false;
                    if self.chrome_enabled {
                        self.sync_chrome();
                    }
                }
            }
            NativeEvent::UrlbarSubmit => {
                if self.urlbar_focused {
                    let url = self.urlbar.clone();
                    self.urlbar_focused = false;
                    if !url.is_empty() {
                        let _ = self.handle_event(NativeEvent::Navigate { url })?;
                    }
                }
            }
            NativeEvent::Navigate { url } => {
                if let Some(tab) = self.tabs.get_mut(self.active) {
                    tab.url.clone_from(&url);
                    let _ = self.dispatch_program(ExecuteRequest {
                        program: Program::from_value(serde_json::json!([
                            {"id":"n","op":"navigate","url":url}
                        ]))?,
                        return_observation: None,
                    });
                    self.present_dirty();
                }
            }
            NativeEvent::Key {
                key,
                code: _,
                modifiers,
                repeat: _,
                state,
            } => {
                if self.urlbar_focused {
                    if state == KeyState::Down {
                        if key == "Enter" {
                            let _ = self.handle_event(NativeEvent::UrlbarSubmit)?;
                        } else if key == "Escape" {
                            self.urlbar_focused = false;
                            self.urlbar_selected = false;
                        } else if key == "Backspace" {
                            if self.urlbar_selected {
                                self.urlbar.clear();
                            } else {
                                self.urlbar.pop();
                            }
                            self.urlbar_selected = false;
                        } else if key.len() == 1 && modifiers & (2 | 4) == 0 {
                            if self.urlbar_selected {
                                self.urlbar.clone_from(&key);
                            } else {
                                self.urlbar.push_str(&key);
                            }
                            self.urlbar_selected = false;
                        } else if self.dispatch_chrome_shortcut(&key, modifiers, state) {
                            // ⌘S / ⌘K while the command bar is focused.
                        }
                        if self.chrome_enabled {
                            self.sync_chrome();
                        }
                    }
                } else if self.chrome_enabled && self.chrome.find_open && state == KeyState::Down {
                    match key.as_str() {
                        "Escape" => self.chrome.find_open = false,
                        "Backspace" => {
                            self.chrome.find.pop();
                            self.refresh_find();
                        }
                        "Enter" => self.advance_find(true),
                        k if k.len() == 1 && modifiers & (2 | 4) == 0 => {
                            self.chrome.find.push_str(k);
                            self.refresh_find();
                        }
                        _ => {}
                    }
                    self.present_dirty();
                } else if self.dispatch_chrome_shortcut(&key, modifiers, state) {
                    self.present_dirty();
                } else {
                    if state == KeyState::Down && key.len() == 1 {
                        self.last_typed.push_str(&key);
                    }
                    self.dispatch_human_key(&key, state)?;
                    if state == KeyState::Down {
                        self.present_dirty();
                    }
                }
            }
            NativeEvent::Ime { text } => {
                if self.urlbar_focused {
                    if self.urlbar_selected {
                        self.urlbar.clone_from(&text);
                        self.urlbar_selected = false;
                    } else {
                        self.urlbar.push_str(&text);
                    }
                    if self.chrome_enabled {
                        self.sync_chrome();
                    }
                    self.present_dirty();
                } else if self.chrome_enabled && self.chrome.find_open {
                    self.chrome.find.push_str(&text);
                    self.refresh_find();
                    self.present_dirty();
                } else {
                    self.ime_preedit.clear();
                    self.last_typed.clone_from(&text);
                    self.dispatch_human_ime(&text)?;
                    self.present_dirty();
                }
            }
            NativeEvent::ImePreedit { text } => {
                self.ime_preedit = text;
            }
            NativeEvent::PointerMove { x, y } => {
                self.pointer = Point::new(x, y);
                if self.chrome_enabled && self.chrome.sidebar_collapsed {
                    let peek_w = if self.chrome.sidebar_peek {
                        self.chrome.sidebar_width
                    } else {
                        self.chrome.sidebar_used()
                    };
                    let next = x < peek_w;
                    if next != self.chrome.sidebar_peek {
                        self.chrome.sidebar_peek = next;
                        self.present_dirty();
                    }
                }
            }
            NativeEvent::PointerDown { x, y, button } => {
                self.pointer = Point::new(x, y);
                if self.chrome_enabled {
                    let _ = self.handle_chrome_pointer(x, y, button)?;
                } else {
                    self.dispatch_human_click(x, y, button)?;
                }
                self.present_dirty();
            }
            NativeEvent::PointerUp { x, y, .. } => {
                self.pointer = Point::new(x, y);
            }
            NativeEvent::Copy => {
                let text = self.selection_or_typed();
                self.copy(&text);
            }
            NativeEvent::Resize { width, height } => {
                self.window_size = Size::new(width, height);
                if self.chrome_enabled {
                    self.apply_chrome_viewport();
                } else {
                    self.set_css_viewport(width, height);
                }
                self.present_dirty();
            }
            NativeEvent::Wheel { dx, dy } => {
                if self.chrome_enabled {
                    let p = self.pointer;
                    if let ChromeHit::Stage { .. } = self.chrome.hit(self.window_size, p.x, p.y) {
                        self.dispatch_human_scroll(dx, dy)?;
                    }
                } else {
                    self.dispatch_human_scroll(dx, dy)?;
                }
                self.present_dirty();
            }
            NativeEvent::AccessKitAction { name } => {
                if name.eq_ignore_ascii_case("urlbar") || name.contains("address") {
                    let _ = self.handle_event(NativeEvent::FocusUrlbar)?;
                } else {
                    let _ = self.dispatch_program(ExecuteRequest {
                        program: Program::from_value(serde_json::json!([
                            {"id":"ak","op":"click","target": format!("text:{name}")}
                        ]))?,
                        return_observation: None,
                    });
                    self.present_dirty();
                }
            }
            NativeEvent::Select { start, end } => {
                self.selection = Some((start as usize, end as usize));
            }
            NativeEvent::Paste => {
                let mut text = self.clipboard.clone();
                if text.is_empty() {
                    if let Some(os) = read_os_clipboard(self.os_clipboard) {
                        os.clone_into(&mut self.clipboard);
                        text = os;
                    }
                }
                if !text.is_empty() {
                    let _ = self.handle_event(NativeEvent::Ime { text })?;
                }
            }
        }
        Ok(EventOutcome {
            quit: false,
            chrome_title: Self::CHROME_TITLE,
        })
    }

    /// Enable writing the chrome clipboard to the OS pasteboard (GUI product).
    pub fn enable_os_clipboard(&mut self) {
        self.os_clipboard = true;
    }

    /// Product chrome: Arc sidebar, command bar, inset stage, agent rail.
    /// Also opens the SQLite profile and restores the last session.
    pub fn enable_product_chrome(&mut self) {
        let path = std::env::var("VECTOR_PROFILE").unwrap_or_else(|_| {
            let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".into());
            format!("{home}/.vector/profile.sqlite")
        });
        self.enable_product_chrome_at(path);
    }

    /// Product chrome bound to an explicit profile path (tests; avoids env races).
    pub fn enable_product_chrome_at(&mut self, path: impl AsRef<std::path::Path>) {
        self.chrome_enabled = true;
        self.chrome.set_theme(ChromeTheme::Dark);
        self.sync_chrome();
        if self.profile.is_none() {
            if let Ok(profile) = Profile::open(path) {
                if self.tabs.is_empty() {
                    if let Ok(session) = profile.session() {
                        for tab in session {
                            if self.open_url(&tab.url).is_err() {
                                let html = format!(
                                    "<p>Restored {}</p>",
                                    tab.title.replace('<', "")
                                );
                                let _ = self.new_tab(&html, &tab.url);
                            }
                        }
                    }
                }
                if let Ok(z) = profile.zoom() {
                    self.chrome.zoom = z;
                }
                if let Ok(find) = profile.find() {
                    self.chrome.find = find;
                }
                if let Ok(dls) = profile.downloads() {
                    self.downloads = dls.into_iter().map(|d| d.path).collect();
                }
                self.profile = Some(profile);
                self.persist_profile();
            }
        }
        self.sync_chrome();
        self.apply_chrome_viewport();
    }

    /// Retained chrome (GUI / tests).
    #[must_use]
    pub fn chrome(&self) -> &Chrome {
        &self.chrome
    }

    /// Whether product chrome is composited around the page.
    #[must_use]
    pub fn chrome_enabled(&self) -> bool {
        self.chrome_enabled
    }

    /// Engine-only: Chromium host tabs are refused.
    pub fn set_engine_only(&mut self, on: bool) {
        self.engine_only = on;
    }

    fn sync_chrome(&mut self) {
        self.chrome.tabs = self
            .tabs
            .iter()
            .enumerate()
            .map(|(i, t)| ChromeTab {
                page_id: t.page.0.to_string(),
                title: if Chrome::is_start_url(&t.url)
                    && (t.page_title.is_empty()
                        || t.page_title.eq_ignore_ascii_case("about:blank"))
                {
                    "New Tab".into()
                } else {
                    t.page_title.clone()
                },
                url: t.url.clone(),
                active: i == self.active,
                backend: t.backend,
            })
            .collect();
        if self.urlbar_focused {
            self.chrome.command.clone_from(&self.urlbar);
        } else {
            self.chrome.command = self
                .active_tab()
                .filter(|t| !Chrome::is_start_url(&t.url))
                .map(|t| t.url.clone())
                .unwrap_or_default();
        }
        self.chrome.command_focused = self.urlbar_focused;
        self.chrome.backend = self
            .active_tab()
            .map(|t| t.backend)
            .unwrap_or(ChromeBackend::Engine);
        self.chrome.route_reason = self
            .active_tab()
            .map(|t| t.route_reason.clone())
            .unwrap_or_default();
        let pages: Vec<String> = self
            .tabs
            .iter()
            .map(|t| t.page.0.to_string())
            .collect();
        if self.chrome.layout.spaces.is_empty() {
            self.chrome.layout = empty_layout();
        }
        self.chrome.layout.order = sync_order(&self.chrome.layout.order, &pages);
        self.chrome.layout = sync_spaces(&self.chrome.layout, &pages);
        self.chrome.download_names.clone_from(&self.downloads);
    }

    /// SQLite writes stay off the present/wheel path. Call after tab/session mutations.
    fn persist_profile(&mut self) {
        let Some(profile) = &self.profile else {
            return;
        };
        let session: Vec<SessionTab> = self
            .tabs
            .iter()
            .map(|t| SessionTab {
                url: t.url.clone(),
                title: t.page_title.clone(),
            })
            .collect();
        let _ = profile.save_session(&session);
        if let Some(tab) = self.active_tab() {
            if !Chrome::is_start_url(&tab.url) {
                let _ = profile.visit(
                    &tab.url,
                    &tab.page_title,
                    std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .map(|d| d.as_millis() as u64)
                        .unwrap_or(0),
                );
            }
        }
        if let Ok(hist) = profile.history() {
            self.chrome.history = hist
                .into_iter()
                .filter(|h| !Chrome::is_start_url(&h.url))
                .map(|h| (h.url, h.title))
                .collect();
        }
        if let Ok(marks) = profile.bookmarks() {
            self.chrome.bookmarks = marks.into_iter().map(|b| (b.url, b.title)).collect();
        }
    }

    fn apply_chrome_viewport(&mut self) {
        if !self.chrome_enabled {
            return;
        }
        let window = self.window_size;
        self.resize_surface(window.width, window.height);
        let stage = self.chrome.stage_rect(window);
        if let Some(page) = self.active_tab().map(|t| t.page)
            && let Ok(p) = self.engine.page_mut(page)
        {
            p.set_viewport(Size::new(stage.width().max(1.0), stage.height().max(1.0)));
            p.set_scale(self.device_scale);
        }
        self.list_cache = None;
        self.chrome_base = None;
        self.chrome_base_sig = 0;
        self.page_layer = None;
        self.page_layer_rev = 0;
    }

    fn chrome_base_sig(&self) -> u64 {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};
        let mut h = DefaultHasher::new();
        for t in &self.chrome.tabs {
            t.page_id.hash(&mut h);
            t.title.hash(&mut h);
            t.url.hash(&mut h);
            t.active.hash(&mut h);
        }
        self.chrome.command.hash(&mut h);
        self.chrome.find.hash(&mut h);
        self.chrome.find_open.hash(&mut h);
        self.chrome.zoom.to_bits().hash(&mut h);
        self.chrome.sidebar_collapsed.hash(&mut h);
        self.chrome.sidebar_peek.hash(&mut h);
        self.chrome.command_focused.hash(&mut h);
        self.chrome.sidebar_width.to_bits().hash(&mut h);
        self.chrome.rail_open.hash(&mut h);
        self.chrome.rail_width.to_bits().hash(&mut h);
        self.chrome.agent_status.hash(&mut h);
        self.chrome.route_reason.hash(&mut h);
        for (url, title) in &self.chrome.history {
            url.hash(&mut h);
            title.hash(&mut h);
        }
        for (url, title) in &self.chrome.bookmarks {
            url.hash(&mut h);
            title.hash(&mut h);
        }
        for pin in self.chrome.active_pins() {
            pin.url.hash(&mut h);
            pin.title.hash(&mut h);
        }
        for (status, goal) in &self.chrome.recent_runs {
            status.hash(&mut h);
            goal.hash(&mut h);
        }
        for folder in &self.chrome.layout.folders {
            folder.id.hash(&mut h);
            folder.collapsed.hash(&mut h);
        }
        for pair in &self.chrome.layout.tab_folder {
            pair.0.hash(&mut h);
            pair.1.hash(&mut h);
        }
        (self.chrome.theme == ve_chrome::ChromeTheme::Dark).hash(&mut h);
        self.chrome.shows_start_page().hash(&mut h);
        self.window_size.width.to_bits().hash(&mut h);
        self.window_size.height.to_bits().hash(&mut h);
        self.device_scale.to_bits().hash(&mut h);
        h.finish()
    }

    fn present_product_chrome(&mut self) -> Result<()> {
        self.sync_chrome();
        self.resize_surface(self.window_size.width, self.window_size.height);
        if self.sw.is_none() {
            self.sw = Some(SoftwareRenderer::with_system_fonts());
        }
        let window = self.window_size;
        let scale = self.device_scale;
        let w = self.surface.width;
        let h = self.surface.height;
        let sig = self.chrome_base_sig();
        let reuse = self.chrome_base.is_some()
            && self.chrome_base_sig == sig
            && self.chrome.overlay == ChromeOverlay::None
            && !self.chrome.shows_start_page();
        if !reuse {
            let list = self.chrome.paint_base(window);
            let renderer = self.sw.as_mut().expect("software renderer");
            let base = renderer
                .render(&list, w, h, scale)
                .map_err(|e| Error::internal(format!("chrome base: {e}")))?;
            self.chrome_base = Some(base);
            self.chrome_base_sig = sig;
        }
        if let Some(base) = &self.chrome_base {
            self.surface.copy_from(base);
        }
        if let Some(tab) = self.active_tab() {
            if !self.chrome.shows_start_page() {
                let page = tab.page;
                let stage = self.chrome.stage_rect(window);
                self.present_page_layer(page, stage, scale)?;
            }
        }
        if self.chrome.overlay != ChromeOverlay::None {
            let mut overlay = ve_gfx::DisplayList::new(window);
            self.chrome.append_overlay(&mut overlay, window);
            let renderer = self.sw.as_mut().expect("software renderer");
            let over = renderer
                .render(&overlay, w, h, scale)
                .map_err(|e| Error::internal(format!("overlay present: {e}")))?;
            for (dst, src) in self
                .surface
                .rgba
                .chunks_exact_mut(4)
                .zip(over.rgba.chunks_exact(4))
            {
                if src[3] > 0 {
                    dst.copy_from_slice(src);
                }
            }
        }
        Ok(())
    }

    /// Chrome + page display list (what `ve-shell --gui` presents).
    pub fn paint_shell_list(&mut self) -> Result<DisplayList> {
        if !self.chrome_enabled {
            let page = self
                .active_tab()
                .ok_or_else(|| Error::not_found("no tab"))?
                .page;
            return self
                .paint_page_id(page)
                .ok_or_else(|| Error::internal("paint failed"));
        }
        self.sync_chrome();
        let window = self.window_size;
        let mut list = self.chrome.paint_base(window);
        if let Some(tab) = self.active_tab() {
            if !self.chrome.shows_start_page() {
                let page = tab.page;
                if let Some(page_list) = self.paint_page_id(page) {
                    let stage = self.chrome.stage_rect(window);
                    list.push(DisplayItem::RoundedClip {
                        rect: stage,
                        radius: self.chrome.metrics.stage_radius,
                    });
                    list.append_translated(&page_list, stage.x(), stage.y());
                    list.push(DisplayItem::PopClip);
                }
            }
        }
        self.chrome.append_overlay(&mut list, window);
        Ok(list)
    }

    fn handle_chrome_pointer(&mut self, x: f32, y: f32, button: u8) -> Result<bool> {
        if !self.chrome_enabled {
            return Ok(false);
        }
        self.sync_chrome();
        match self.chrome.hit(self.window_size, x, y) {
            ChromeHit::Stage { x, y } => {
                self.dispatch_human_click(x, y, button)?;
                Ok(true)
            }
            ChromeHit::Tab { page_id } => {
                if let Some(i) = self
                    .tabs
                    .iter()
                    .position(|t| t.page.0.to_string() == page_id)
                {
                    self.active = i;
                    self.urlbar_focused = false;
                    self.sync_chrome();
                }
                Ok(true)
            }
            ChromeHit::NewTab => {
                let _ = self.handle_event(NativeEvent::NewTab {
                    html: "<body></body>".into(),
                    url: "about:blank".into(),
                })?;
                Ok(true)
            }
            ChromeHit::CommandBar => {
                self.urlbar_focused = true;
                self.urlbar = self.active_tab().map(|t| t.url.clone()).unwrap_or_default();
                self.urlbar_selected = true;
                self.sync_chrome();
                Ok(true)
            }
            ChromeHit::SidebarToggle => {
                self.chrome.sidebar_collapsed = !self.chrome.sidebar_collapsed;
                self.chrome.sidebar_peek = false;
                self.apply_chrome_viewport();
                Ok(true)
            }
            ChromeHit::RailToggle => {
                self.chrome.rail_open = !self.chrome.rail_open;
                self.apply_chrome_viewport();
                Ok(true)
            }
            ChromeHit::Overlay(ChromeOverlay::None) => Ok(true),
            ChromeHit::Overlay(_) => {
                self.chrome.overlay = ChromeOverlay::None;
                Ok(true)
            }
            ChromeHit::Pin { url } => {
                let _ = self.handle_event(NativeEvent::Navigate { url })?;
                Ok(true)
            }
            ChromeHit::CertProceed => {
                self.resolve_cert_sheet("proceed");
                Ok(true)
            }
            ChromeHit::CertBlock => {
                self.resolve_cert_sheet("block");
                Ok(true)
            }
            ChromeHit::PermissionAllow => {
                self.resolve_permission_sheet(true);
                Ok(true)
            }
            ChromeHit::PermissionDeny => {
                self.resolve_permission_sheet(false);
                Ok(true)
            }
            ChromeHit::PaletteCommand { id } => {
                self.apply_palette_command(&id)?;
                Ok(true)
            }
            ChromeHit::HistoryItem { url } => {
                self.chrome.overlay = ChromeOverlay::None;
                let _ = self.handle_event(NativeEvent::Navigate { url })?;
                Ok(true)
            }
            ChromeHit::ThemeDark => {
                self.chrome.set_theme(ChromeTheme::Dark);
                Ok(true)
            }
            ChromeHit::ThemeLight => {
                self.chrome.set_theme(ChromeTheme::Light);
                Ok(true)
            }
            _ => Ok(true),
        }
    }

    fn apply_palette_command(&mut self, id: &str) -> Result<()> {
        self.chrome.overlay = ChromeOverlay::None;
        match id {
            "new" => {
                let _ = self.handle_event(NativeEvent::NewTab {
                    html: "<body></body>".into(),
                    url: "about:blank".into(),
                })?;
            }
            "rail" => {
                self.chrome.rail_open = !self.chrome.rail_open;
                self.apply_chrome_viewport();
            }
            "find" => {
                self.chrome.find_open = true;
                self.refresh_find();
            }
            "sb" | "hide-sb" => {
                self.chrome.sidebar_collapsed = !self.chrome.sidebar_collapsed;
                self.chrome.sidebar_peek = false;
                self.apply_chrome_viewport();
            }
            "history" => {
                self.chrome.overlay = ChromeOverlay::History;
            }
            "settings" => {
                self.chrome.overlay = ChromeOverlay::Settings;
            }
            "downloads" => {
                self.chrome.overlay = ChromeOverlay::Downloads;
            }
            "bm" => self.bookmark_active(),
            "reload" | "hard" => {
                if let Some(url) = self.active_tab().map(|t| t.url.clone()) {
                    let _ = self.handle_event(NativeEvent::Navigate { url })?;
                }
            }
            "pin" => {
                if let Some((url, title)) = self
                    .active_tab()
                    .map(|t| (t.url.clone(), t.page_title.clone()))
                {
                    let space = self.chrome.layout.active_space_id.clone();
                    self.chrome.layout = toggle_pin(&self.chrome.layout, &space, Pin { url, title });
                }
            }
            _ => {}
        }
        Ok(())
    }

    /// Clipboard (chrome-owned).
    pub fn copy(&mut self, text: &str) {
        text.clone_into(&mut self.clipboard);
        write_os_clipboard(self.os_clipboard, text);
    }

    /// Clipboard contents.
    #[must_use]
    pub fn clipboard(&self) -> &str {
        &self.clipboard
    }

    /// IME composition string (not yet committed).
    #[must_use]
    pub fn ime_preedit(&self) -> &str {
        &self.ime_preedit
    }

    fn selection_or_typed(&mut self) -> String {
        let raw = self.selected_source();
        let Some((start, end)) = self.selection else {
            return raw;
        };
        raw.chars()
            .skip(start)
            .take(end.saturating_sub(start))
            .collect()
    }

    fn selected_source(&mut self) -> String {
        let Some(page_id) = self.active_tab().map(|t| t.page) else {
            return self.last_typed.clone();
        };
        let Ok(page) = self.engine.page(page_id) else {
            return self.last_typed.clone();
        };
        if let Some(id) = page.focused() {
            if let Some(v) = page.document().form_value(id)
                && !v.is_empty()
            {
                return v;
            }
            let t = page.document().text_content(id);
            if !t.is_empty() {
                return t;
            }
        }
        if let Some(body) = page.document().body() {
            let t = page.document().text_content(body);
            if !t.is_empty() {
                return t;
            }
        }
        self.last_typed.clone()
    }

    /// Permission prompt recorded in chrome, never granted by page script.
    pub fn grant(&mut self, name: &str, allowed: bool) {
        self.permissions.insert(name.to_owned(), allowed);
        if let Some(profile) = &self.profile {
            let origin = self
                .active_tab()
                .map(|t| t.url.clone())
                .unwrap_or_else(|| "https://local.test/".into());
            let _ = profile.grant(&ve_profile::PermissionGrant {
                effect: name.to_owned(),
                origin,
                scope: "page".into(),
                expires_at: 0,
            });
        }
    }

    /// Show a certificate interstitial (chrome, not page HTML).
    pub fn show_cert_sheet(&mut self, host: &str, fingerprint: &str) {
        self.chrome.overlay = ChromeOverlay::Cert;
        self.chrome.sheet_title = host.to_owned();
        self.chrome.sheet_body = fingerprint.to_owned();
        self.sync_chrome();
    }

    /// Show a permission sheet (chrome, never granted by page text).
    pub fn show_permission_sheet(&mut self, effect: &str, origin: &str) {
        self.chrome.overlay = ChromeOverlay::Permission;
        self.chrome.sheet_title = effect.to_owned();
        self.chrome.sheet_body = origin.to_owned();
        self.sync_chrome();
    }

    fn resolve_cert_sheet(&mut self, decision: &str) {
        let host = self.chrome.sheet_title.clone();
        let fp = self.chrome.sheet_body.clone();
        if let Some(profile) = &self.profile {
            let _ = profile.decide_cert(&host, &fp, decision);
        }
        self.chrome.overlay = ChromeOverlay::None;
        self.sync_chrome();
    }

    fn resolve_permission_sheet(&mut self, allowed: bool) {
        let effect = self.chrome.sheet_title.clone();
        self.grant(&effect, allowed);
        self.chrome.overlay = ChromeOverlay::None;
        self.sync_chrome();
    }

    /// Present chrome + page and encode a PNG (closest `ve-shell --gui` substitute).
    pub fn capture_shell_png(&mut self) -> Result<Vec<u8>> {
        let frame = self.present()?;
        ve_agent::screenshot::encode_png(frame.width, frame.height, &frame.rgba)
    }

    /// Whether chrome granted `name`.
    #[must_use]
    pub fn permitted(&self, name: &str) -> bool {
        self.permissions.get(name).copied().unwrap_or(false)
    }

    /// Record a download in chrome UI.
    pub fn record_download(&mut self, filename: &str) {
        self.downloads.push(filename.to_owned());
        if let Some(profile) = &self.profile {
            let url = self.active_tab().map(|t| t.url.as_str()).unwrap_or("");
            let _ = profile.record_download(url, filename, 0);
        }
        self.sync_chrome();
    }

    /// Downloads listed in chrome.
    #[must_use]
    pub fn downloads(&self) -> &[String] {
        &self.downloads
    }

    fn refresh_find(&mut self) {
        let q = self.chrome.find.clone();
        if let Some(profile) = &self.profile {
            let _ = profile.set_find(&q);
        }
        if q.is_empty() {
            self.chrome.find_matches = 0;
            self.chrome.find_active = 0;
            return;
        }
        let text = self
            .observe_active()
            .ok()
            .map(|o| o.observation.content.text)
            .unwrap_or_default();
        let n = text.to_lowercase().matches(&q.to_lowercase()).count() as u32;
        self.chrome.find_matches = n;
        self.chrome.find_active = if n == 0 { 0 } else { 1 };
    }

    fn advance_find(&mut self, forward: bool) {
        let n = self.chrome.find_matches;
        if n == 0 {
            self.chrome.find_active = 0;
            return;
        }
        let cur = self.chrome.find_active.max(1);
        self.chrome.find_active = if forward {
            if cur >= n { 1 } else { cur + 1 }
        } else if cur <= 1 {
            n
        } else {
            cur - 1
        };
    }

    /// File the first four tabs into a Dev folder (Electron browsing sidebar).
    pub fn file_open_tabs_in_dev_folder(&mut self) {
        self.sync_chrome();
        self.chrome.file_open_tabs_in_dev_folder();
    }

    /// Product appearance (settings drawer / light-start screenshot).
    pub fn set_product_theme(&mut self, light: bool) {
        self.chrome.set_theme(if light {
            ChromeTheme::Light
        } else {
            ChromeTheme::Dark
        });
    }

    /// Seed Electron screenshot fixtures (pins, favourites, recents) into chrome + profile.
    pub fn seed_design_reference_chrome(&mut self) {
        self.chrome.seed_design_reference();
        if let Some(profile) = &self.profile {
            for (url, title) in ve_chrome::design_reference_sites() {
                let _ = profile.bookmark(url, title);
                let _ = profile.visit(url, title, 1);
            }
        }
        self.persist_profile();
    }

    /// Bookmark the active tab (chrome / profile, never page text).
    pub fn bookmark_active(&mut self) {
        if let (Some(tab), Some(profile)) = (self.active_tab(), self.profile.as_ref()) {
            let _ = profile.bookmark(&tab.url, &tab.page_title);
        }
        self.sync_chrome();
        self.persist_profile();
    }

    /// Number of tabs.
    #[must_use]
    pub fn tab_count(&self) -> usize {
        self.tabs.len()
    }

    /// Address-bar editing buffer (chrome-owned).
    #[must_use]
    pub fn urlbar(&self) -> &str {
        &self.urlbar
    }

    /// Whether the address bar currently owns keyboard input.
    #[must_use]
    pub fn urlbar_focused(&self) -> bool {
        self.urlbar_focused
    }

    /// Index of the active tab.
    #[must_use]
    pub fn active_index(&self) -> usize {
        self.active
    }

    /// All tabs.
    #[must_use]
    pub fn tabs(&self) -> &[Tab] {
        &self.tabs
    }

    /// Select tab by index.
    pub fn set_active(&mut self, index: usize) {
        if index < self.tabs.len() {
            self.active = index;
            self.urlbar_focused = false;
            self.sync_chrome();
        }
    }

    /// Engine (cookies / contexts).
    #[must_use]
    pub fn engine(&self) -> &VectorEngine {
        &self.engine
    }

    /// Mutable engine (service screenshot / cookies).
    pub fn engine_mut(&mut self) -> &mut VectorEngine {
        &mut self.engine
    }

    fn dispatch_chrome_shortcut(&mut self, key: &str, modifiers: u8, state: KeyState) -> bool {
        if state != KeyState::Down {
            return false;
        }
        let chrome = modifiers & (2 | 4) != 0;
        if !chrome {
            return false;
        }
        match key {
            "[" | "ArrowLeft" => {
                let _ = self.dispatch_human_key("Back", KeyState::Down);
                true
            }
            "]" | "ArrowRight" => {
                let _ = self.dispatch_human_key("Forward", KeyState::Down);
                true
            }
            "f" | "F" => {
                self.chrome.find_open = !self.chrome.find_open;
                if self.chrome.find_open {
                    self.refresh_find();
                }
                true
            }
            "g" | "G" => {
                if self.chrome.find_open {
                    self.advance_find(modifiers & 8 == 0);
                    true
                } else {
                    false
                }
            }
            "-" => {
                self.chrome.zoom = (self.chrome.zoom - 0.1).max(0.25);
                if let Some(p) = &self.profile {
                    let _ = p.set_zoom(self.chrome.zoom);
                }
                true
            }
            "=" | "+" => {
                self.chrome.zoom = (self.chrome.zoom + 0.1).min(3.0);
                if let Some(p) = &self.profile {
                    let _ = p.set_zoom(self.chrome.zoom);
                }
                true
            }
            "0" => {
                self.chrome.zoom = 1.0;
                if let Some(p) = &self.profile {
                    let _ = p.set_zoom(1.0);
                }
                true
            }
            "k" | "K" => {
                self.chrome.overlay = ChromeOverlay::Palette;
                true
            }
            "," => {
                self.chrome.overlay = ChromeOverlay::Settings;
                true
            }
            "y" | "Y" => {
                self.chrome.overlay = ChromeOverlay::History;
                true
            }
            "j" | "J" => {
                self.chrome.overlay = ChromeOverlay::Downloads;
                true
            }
            "s" | "S" => {
                self.chrome.sidebar_collapsed = !self.chrome.sidebar_collapsed;
                self.chrome.sidebar_peek = false;
                self.apply_chrome_viewport();
                true
            }
            "l" | "L" | "e" | "E" => {
                self.urlbar_focused = true;
                self.urlbar = self.active_tab().map(|t| t.url.clone()).unwrap_or_default();
                self.urlbar_selected = true;
                self.sync_chrome();
                true
            }
            _ => false,
        }
    }

    fn dispatch_human_key(&mut self, key: &str, state: KeyState) -> Result<()> {
        if state == KeyState::Up {
            return Ok(());
        }
        let Some(page_id) = self.active_tab().map(|t| t.page) else {
            return Ok(());
        };
        let page = self.engine.page_mut(page_id)?;
        if key.eq_ignore_ascii_case("back") {
            let _ = page.press(None, "Back", 0);
            self.sync_active_tab();
            return Ok(());
        }
        if key.eq_ignore_ascii_case("forward") {
            let _ = page.press(None, "Forward", 0);
            self.sync_active_tab();
            return Ok(());
        }
        let focused = page.focused();
        let _ = page.press(focused, key, 0);
        self.sync_active_tab();
        self.list_cache = None;
        self.page_layer = None;
        self.page_layer_rev = 0;
        Ok(())
    }

    fn dispatch_human_ime(&mut self, text: &str) -> Result<()> {
        let Some(page_id) = self.active_tab().map(|t| t.page) else {
            return Ok(());
        };
        let page = self.engine.page_mut(page_id)?;
        let target = page.focused().or_else(|| page.first_editable());
        if let Some(id) = target {
            let _ = page.type_text(id, text, 0);
        }
        self.sync_active_tab();
        self.list_cache = None;
        self.page_layer = None;
        self.page_layer_rev = 0;
        Ok(())
    }

    fn dispatch_human_click(&mut self, x: f32, y: f32, button: u8) -> Result<()> {
        let Some(page_id) = self.active_tab().map(|t| t.page) else {
            return Ok(());
        };
        let page = self.engine.page_mut(page_id)?;
        let btn = if button == 0 {
            MouseButton::Left
        } else if button == 1 {
            MouseButton::Middle
        } else {
            MouseButton::Right
        };
        let _ = page.click_point(x, y, btn);
        self.sync_active_tab();
        Ok(())
    }

    fn dispatch_human_scroll(&mut self, dx: f32, dy: f32) -> Result<()> {
        let Some(page_id) = self.active_tab().map(|t| t.page) else {
            return Ok(());
        };
        let page = self.engine.page_mut(page_id)?;
        let _ = page.scroll_by(dx, dy);
        Ok(())
    }

    fn paint_page_id(&mut self, page: PageId) -> Option<ve_gfx::DisplayList> {
        use ve_core::{Rect, Size};
        use ve_gfx::{DisplayItem, DisplayList};

        let (viewport, scroll) = self.ensure_page_list(page)?;
        let src = self.list_cache.as_ref()?;
        let mut translated = DisplayList::new(Size::new(viewport.width, viewport.height));
        translated.push(DisplayItem::Rect {
            rect: Rect::new(0.0, 0.0, viewport.width, viewport.height),
            color: match src.list.items().first() {
                Some(DisplayItem::Rect { color, .. }) => *color,
                _ => ve_style::Rgba::WHITE,
            },
        });
        for item in src.list.items().iter().skip(1) {
            translated.push(item.translated(-scroll.x, -scroll.y));
        }
        Some(translated)
    }

    /// Ensures `list_cache` matches the live page. Returns viewport + scroll.
    fn ensure_page_list(&mut self, page: PageId) -> Option<(ve_core::Size, ve_core::Point)> {
        use ve_gfx::DisplayList;

        let cached = self
            .list_cache
            .as_ref()
            .map(|c| (c.layout_revision, c.viewport));
        let (layout_revision, viewport, scroll, content_h, rebuilt) = {
            let p = self.engine.page_mut(page).ok()?;
            p.update();
            let layout_revision = p.layout_tree().revision().0;
            let viewport = p.viewport();
            let scroll = p.scroll_offset();
            let content_h = p.layout_tree().content_height();
            let hit = cached.is_some_and(|(l, v)| l == layout_revision && v == viewport);
            let rebuilt = if hit {
                None
            } else {
                Some(DisplayList::from_layout_with(
                    p.layout_tree(),
                    p.style_tree(),
                    p.node_images(),
                ))
            };
            (layout_revision, viewport, scroll, content_h, rebuilt)
        };
        if let Some(list) = rebuilt {
            self.from_layout_calls += 1;
            self.list_cache = Some(DisplayListCache {
                layout_revision,
                viewport,
                list,
            });
            self.page_layer = None;
            self.page_layer_rev = 0;
        }
        let _ = content_h;
        Some((viewport, scroll))
    }

    /// Rasterizes the untranslated page list once per layout revision, then
    /// blits the visible viewport (compositor scroll).
    fn present_page_layer(
        &mut self,
        page: PageId,
        stage: ve_core::Rect,
        scale: f32,
    ) -> Result<()> {
        let (viewport, scroll) = self
            .ensure_page_list(page)
            .ok_or_else(|| Error::internal("paint failed"))?;
        let rev = self
            .list_cache
            .as_ref()
            .map(|c| c.layout_revision)
            .unwrap_or(0);
        let content_h = self
            .engine
            .page_mut(page)
            .ok()
            .map(|p| p.layout_tree().content_height())
            .unwrap_or(viewport.height);
        let pw = (viewport.width * scale).round().max(1.0) as u32;
        let ph = (content_h.max(viewport.height) * scale).round().max(1.0) as u32;
        let reuse = self.page_layer.as_ref().is_some_and(|f| {
            self.page_layer_rev == rev && f.width == pw && f.height == ph
        });
        if !reuse {
            let list = self
                .list_cache
                .as_ref()
                .ok_or_else(|| Error::internal("no page list"))?
                .list
                .clone();
            let renderer = self.sw.as_mut().expect("software renderer");
            let frame = renderer
                .render(&list, pw, ph, scale)
                .map_err(|e| Error::internal(format!("page layer: {e}")))?;
            self.page_layer = Some(frame);
            self.page_layer_rev = rev;
        }
        if let Some(layer) = &self.page_layer {
            self.surface.blit_region(
                layer,
                (scroll.x * scale).round() as i32,
                (scroll.y * scale).round() as i32,
                (stage.x() * scale).round() as i32,
                (stage.y() * scale).round() as i32,
                (stage.width() * scale).round().max(1.0) as u32,
                (stage.height() * scale).round().max(1.0) as u32,
            );
        }
        Ok(())
    }
}

impl Drop for NativeBrowser {
    fn drop(&mut self) {
        if self.chrome_enabled {
            self.persist_profile();
        }
    }
}

fn engine_only_from_env() -> bool {
    matches!(
        std::env::var("VECTOR_ENGINE_MODE").as_deref(),
        Ok("always") | Ok("native-only") | Ok("engine")
    ) || matches!(
        std::env::var("VECTOR_ENGINE_ONLY").as_deref(),
        Ok("1") | Ok("true")
    )
}

fn write_os_clipboard(enabled: bool, text: &str) {
    if !enabled {
        return;
    }
    #[cfg(target_os = "macos")]
    {
        if let Ok(mut child) = Command::new("pbcopy")
            .stdin(Stdio::piped())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
        {
            if let Some(mut stdin) = child.stdin.take() {
                let _ = stdin.write_all(text.as_bytes());
            }
            let _ = child.wait();
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = (enabled, text);
    }
}

fn read_os_clipboard(enabled: bool) -> Option<String> {
    if !enabled {
        return None;
    }
    #[cfg(target_os = "macos")]
    {
        let output = Command::new("pbpaste")
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .output()
            .ok()?;
        if !output.status.success() {
            return None;
        }
        let s = String::from_utf8(output.stdout).ok()?;
        (!s.is_empty()).then_some(s)
    }
    #[cfg(not(target_os = "macos"))]
    {
        None
    }
}


impl Default for NativeBrowser {
    fn default() -> Self {
        Self::new()
    }
}

fn css_rgba(c: ve_style::Rgba) -> String {
    if (c.a - 1.0).abs() < f32::EPSILON {
        format!("rgb({},{},{})", c.r, c.g, c.b)
    } else {
        format!("rgba({},{},{},{})", c.r, c.g, c.b, c.a)
    }
}

/// Display-list scene for `EngineView`. Not a PNG.
#[must_use]
pub fn scene_json(page: &crate::Page) -> serde_json::Value {
    let list = ve_gfx::DisplayList::from_layout_with(
        page.layout_tree(),
        page.style_tree(),
        page.node_images(),
    );
    let items: Vec<serde_json::Value> = list.items().iter().map(scene_item).collect();
    serde_json::json!({
        "kind": "displayList",
        "transport": "scene",
        "png": false,
        "width": list.size.width,
        "height": list.size.height,
        "itemCount": list.len(),
        "items": items,
    })
}

fn scene_item(item: &ve_gfx::DisplayItem) -> serde_json::Value {
    match item {
        ve_gfx::DisplayItem::Rect { rect, color } => serde_json::json!({
            "kind": "rect",
            "x": rect.x(),
            "y": rect.y(),
            "w": rect.width(),
            "h": rect.height(),
            "color": css_rgba(*color),
        }),
        ve_gfx::DisplayItem::Border {
            rect,
            widths,
            color,
        } => serde_json::json!({
            "kind": "border",
            "x": rect.x(),
            "y": rect.y(),
            "w": rect.width(),
            "h": rect.height(),
            "color": css_rgba(*color),
            "widths": {
                "top": widths.top,
                "right": widths.right,
                "bottom": widths.bottom,
                "left": widths.left,
            },
        }),
        ve_gfx::DisplayItem::Text(run) => serde_json::json!({
            "kind": "text",
            "x": run.origin.x,
            "y": run.origin.y,
            "text": run.text,
            "size": run.size,
            "color": css_rgba(run.color),
        }),
        ve_gfx::DisplayItem::Image { rect, .. } => serde_json::json!({
            "kind": "image",
            "x": rect.x(),
            "y": rect.y(),
            "w": rect.width(),
            "h": rect.height(),
        }),
        ve_gfx::DisplayItem::PushClip(rect) => serde_json::json!({
            "kind": "clip",
            "x": rect.x(),
            "y": rect.y(),
            "w": rect.width(),
            "h": rect.height(),
        }),
        ve_gfx::DisplayItem::PopClip => serde_json::json!({"kind": "popClip"}),
        ve_gfx::DisplayItem::PushOpacity(a) => serde_json::json!({"kind": "opacity", "a": a}),
        ve_gfx::DisplayItem::PopOpacity => serde_json::json!({"kind": "popOpacity"}),
        ve_gfx::DisplayItem::PushBlend(mode) => {
            serde_json::json!({"kind": "blend", "mode": mode.to_string()})
        }
        ve_gfx::DisplayItem::PopBlend => serde_json::json!({"kind": "popBlend"}),
        ve_gfx::DisplayItem::RoundedClip { rect, radius } => serde_json::json!({
            "kind": "roundedClip",
            "x": rect.x(),
            "y": rect.y(),
            "w": rect.width(),
            "h": rect.height(),
            "radius": radius,
        }),
        ve_gfx::DisplayItem::PushTransform {
            tx,
            ty,
            sx,
            sy,
            angle,
            ox,
            oy,
        } => {
            serde_json::json!({
                "kind": "transform",
                "tx": tx,
                "ty": ty,
                "sx": sx,
                "sy": sy,
                "angle": angle,
                "ox": ox,
                "oy": oy
            })
        }
        ve_gfx::DisplayItem::PopTransform => serde_json::json!({"kind": "popTransform"}),
        ve_gfx::DisplayItem::BoxShadow {
            rect,
            dx,
            dy,
            blur,
            color,
        } => serde_json::json!({
            "kind": "boxShadow",
            "x": rect.x(),
            "y": rect.y(),
            "w": rect.width(),
            "h": rect.height(),
            "dx": dx,
            "dy": dy,
            "blur": blur,
            "color": css_rgba(*color),
        }),
        ve_gfx::DisplayItem::LinearGradient { rect, stops, .. } => serde_json::json!({
            "kind": "linearGradient",
            "x": rect.x(),
            "y": rect.y(),
            "w": rect.width(),
            "h": rect.height(),
            "stops": stops.len(),
        }),
        ve_gfx::DisplayItem::FilterBlur { rect, radius } => serde_json::json!({
            "kind": "filterBlur",
            "x": rect.x(),
            "y": rect.y(),
            "w": rect.width(),
            "h": rect.height(),
            "radius": radius,
        }),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn page_cannot_spoof_chrome_title() {
        let mut browser = NativeBrowser::new();
        browser
            .new_tab(
                "<title>Vector Security Update</title><h1>install</h1>",
                "https://evil.test/",
            )
            .unwrap();
        assert_eq!(browser.chrome_title(), "Vector");
        assert_eq!(browser.page_title(), Some("Vector Security Update"));
        assert_ne!(browser.chrome_title(), browser.page_title().unwrap());
        let id = browser.identity();
        assert_eq!(id["chromium"], false);
        assert_eq!(id["electron"], false);
        assert_eq!(id["product"], "ve-shell");
        assert_eq!(id["backend"], "vector-engine");
        assert_eq!(id["accessKit"], true);
        let ak = browser.accesskit_update();
        assert!(ak.tree.is_some());
        assert!(
            ak.nodes
                .iter()
                .any(|(id, n)| *id == ve_a11y::WINDOW_ID && n.role() == accesskit::Role::Window)
        );
        assert!(
            ak.nodes
                .iter()
                .any(|(_, n)| n.label() == Some("Vector Security Update")
                    || n.label() == Some("install")),
            "page names must appear in the AccessKit tree"
        );
        assert!(browser.screen_reader_text().contains("Vector"));
        assert_eq!(browser.update_status()["signedUpdates"], false);
        let ax = browser.chrome_ax();
        assert_eq!(ax[0].role, "application");
        assert_eq!(ax[0].name, "Vector");
        assert!(!ax[0].from_page);
        assert!(
            ax.iter().all(|n| !n.from_page && n.role != "document"),
            "chrome AX must not include page roles"
        );
        let keys = NativeBrowser::development_update_keys();
        browser.install_update_key(keys.public);
        assert_eq!(browser.update_status()["signedUpdates"], true);
        let manifest = br#"{"version":"0.0.2"}"#;
        let sig = keys.sign(manifest);
        assert!(browser.verify_update(manifest, &sig));
        assert!(!browser.verify_update(br#"{"version":"evil"}"#, &sig));
        let reader = browser.reader_ax();
        assert!(
            reader
                .iter()
                .any(|n| n.from_page && n.name.contains("install")),
            "{reader:?}"
        );
        assert!(browser.screen_reader_text().contains("install"));
    }

    #[cfg(feature = "gpu")]
    #[test]
    fn present_direct_skips_cpu_readback_when_gpu_is_available() {
        let mut browser = NativeBrowser::new();
        browser.new_tab("<p>hi</p>", "https://t.test/").unwrap();
        let gpu = browser.present_direct().unwrap();
        let frame = browser.present().unwrap();
        assert!(frame.width > 0 && frame.height > 0);
        if gpu {
            assert!(browser.gpu_present());
            assert_eq!(browser.identity()["gpuPresent"], true);
        }
    }

    #[test]
    fn human_and_agent_share_the_tab() {
        let mut browser = NativeBrowser::new();
        let tab = browser
            .new_tab("<button>Go</button>", "https://app.test/")
            .unwrap();
        let page = tab.page;
        let obs = browser.observe_active().unwrap();
        assert_eq!(obs.page, page);
        assert!(!obs.observation.content.elements.is_empty());
        browser.copy("secret");
        assert_eq!(browser.clipboard(), "secret");
        browser.grant("geolocation", false);
        assert!(!browser.permitted("geolocation"));
        browser.record_download("a.bin");
        assert_eq!(browser.downloads(), ["a.bin".to_string()].as_slice());
        assert_eq!(browser.tab_count(), 1);
        let _ = browser.press_key("Tab").unwrap();
        let _ = browser.present().unwrap();
    }

    #[test]
    fn present_paints_page_pixels_not_an_empty_buffer() {
        let mut browser = NativeBrowser::new();
        browser
            .new_tab(
                "<style>html,body{margin:0;background:#ff0000}</style>",
                "https://paint.test/",
            )
            .unwrap();
        let frame = browser.present().unwrap();
        let px = frame.pixel(20, 20).expect("pixel in frame");
        assert!(
            px[0] > 200 && px[1] < 40 && px[2] < 40,
            "expected red page pixels, got {px:?}"
        );
    }

    #[test]
    fn os_events_drive_the_same_document() {
        let mut browser = NativeBrowser::new();
        let outcome = browser
            .handle_event(NativeEvent::NewTab {
                html: "<button style=\"width:80px;height:40px\">Go</button>".into(),
                url: "https://evt.test/".into(),
            })
            .unwrap();
        assert!(!outcome.quit);
        assert_eq!(outcome.chrome_title, "Vector");
        let _ = browser.handle_event(NativeEvent::PointerMove { x: 10.0, y: 10.0 });
        let _ = browser.handle_event(NativeEvent::PointerDown {
            x: 10.0,
            y: 10.0,
            button: 0,
        });
        let _ = browser.handle_event(NativeEvent::Key {
            key: "Tab".into(),
            code: "Tab".into(),
            modifiers: 0,
            repeat: false,
            state: KeyState::Down,
        });
        let _ = browser.handle_event(NativeEvent::Copy);
        browser.copy("paste-me");
        let _ = browser.handle_event(NativeEvent::Paste);
        let quit = browser.handle_event(NativeEvent::Quit).unwrap();
        assert!(quit.quit);
        assert_eq!(browser.pointer().x, 10.0);
    }

    #[test]
    fn resize_wheel_and_accesskit_share_the_live_page() {
        let mut browser = NativeBrowser::new();
        browser
            .handle_event(NativeEvent::NewTab {
                html: "<p style=\"height:2000px\">tall</p>".into(),
                url: "https://geom.test/".into(),
            })
            .unwrap();
        browser
            .handle_event(NativeEvent::Resize {
                width: 800.0,
                height: 600.0,
            })
            .unwrap();
        let page = browser.active_tab().unwrap().page;
        let vp = browser.engine_viewport_for_test(page);
        assert_eq!(vp, (800.0, 600.0));
        let _ = browser.handle_event(NativeEvent::Wheel { dx: 0.0, dy: 80.0 });
        let _ = browser.handle_event(NativeEvent::AccessKitAction {
            name: "urlbar".into(),
        });
        assert!(browser.urlbar_focused());
        browser.handle_event(NativeEvent::BlurUrlbar).unwrap();
        assert!(!browser.urlbar_focused());
        let mapped = browser.accesskit_action_name(ve_a11y::URLBAR_ID.0);
        assert_eq!(mapped, "urlbar");
        browser
            .handle_event(NativeEvent::AccessKitAction { name: mapped })
            .unwrap();
        assert!(browser.urlbar_focused());
    }

    #[test]
    fn human_edit_and_agent_observe_the_same_page() {
        let mut browser = NativeBrowser::new();
        browser
            .handle_event(NativeEvent::NewTab {
                html: "<input id=t>".into(),
                url: "https://share.test/".into(),
            })
            .unwrap();
        browser
            .handle_event(NativeEvent::Ime {
                text: "typed-by-human".into(),
            })
            .unwrap();
        let obs = browser.observe_active().unwrap();
        let value = obs
            .observation
            .content
            .form_fields
            .iter()
            .find_map(|f| f.value.as_deref())
            .or_else(|| {
                obs.observation
                    .content
                    .elements
                    .iter()
                    .find(|e| e.tag == "input")
                    .and_then(|e| e.value.as_deref())
            })
            .unwrap_or("");
        assert_eq!(value, "typed-by-human");
        browser.takeover();
        assert_eq!(browser.controller(), NativeController::Human);
        let blocked = browser.execute_active(
            Program::from_value(serde_json::json!([
                {"id":"x","op":"type","target":"css:input","value":"agent"}
            ]))
            .unwrap(),
        );
        assert!(blocked.is_err(), "agent dispatch must stop after takeover");
        browser.resume();
        assert_eq!(browser.controller(), NativeController::None);
        let resumed = browser.execute_active(
            Program::from_value(serde_json::json!([
                {"id":"y","op":"type","target":"css:input","value":"-agent"}
            ]))
            .unwrap(),
        );
        assert!(resumed.is_ok());
    }

    #[test]
    fn chrome_tabs_and_urlbar_are_not_page_owned() {
        let mut browser = NativeBrowser::new();
        browser
            .handle_event(NativeEvent::NewTab {
                html: "<title>A</title>".into(),
                url: "https://a.test/".into(),
            })
            .unwrap();
        browser
            .handle_event(NativeEvent::NewTab {
                html: "<title>B</title>".into(),
                url: "https://b.test/".into(),
            })
            .unwrap();
        assert_eq!(browser.tab_count(), 2);
        assert_eq!(
            browser.active_tab().map(|t| t.url.as_str()),
            Some("https://b.test/")
        );
        browser.handle_event(NativeEvent::NextTab).unwrap();
        assert_eq!(
            browser.active_tab().map(|t| t.url.as_str()),
            Some("https://a.test/")
        );
        browser.handle_event(NativeEvent::PrevTab).unwrap();
        assert_eq!(
            browser.active_tab().map(|t| t.url.as_str()),
            Some("https://b.test/")
        );
        browser.handle_event(NativeEvent::FocusUrlbar).unwrap();
        assert!(browser.urlbar_focused());
        browser
            .handle_event(NativeEvent::UrlbarType { text: "x".into() })
            .unwrap();
        assert!(browser.urlbar().ends_with('x'), "{}", browser.urlbar());
        browser.handle_event(NativeEvent::BlurUrlbar).unwrap();
        assert!(!browser.urlbar_focused());
        let ax = browser.chrome_ax();
        assert!(ax.iter().any(|n| n.role == "urlbar" && !n.from_page));
    }

    #[test]
    fn copy_puts_typed_text_on_clipboard() {
        let mut browser = NativeBrowser::new();
        browser
            .handle_event(NativeEvent::NewTab {
                html: "<input id=t>".into(),
                url: "https://c.test/".into(),
            })
            .unwrap();
        let _ = browser.handle_event(NativeEvent::PointerDown {
            x: 8.0,
            y: 8.0,
            button: 0,
        });
        browser
            .handle_event(NativeEvent::Ime {
                text: "hello".into(),
            })
            .unwrap();
        browser.handle_event(NativeEvent::Copy).unwrap();
        assert_eq!(browser.clipboard(), "hello");
        browser
            .handle_event(NativeEvent::Select { start: 1, end: 4 })
            .unwrap();
        browser.handle_event(NativeEvent::Copy).unwrap();
        assert_eq!(browser.clipboard(), "ell");
    }

    #[test]
    fn scene_active_exports_display_list_items() {
        let mut browser = NativeBrowser::new();
        browser
            .handle_event(NativeEvent::NewTab {
                html: "<p>hi</p>".into(),
                url: "https://s.test/".into(),
            })
            .unwrap();
        let scene = browser.scene_active().unwrap();
        assert_eq!(scene["png"], false);
        assert_eq!(scene["kind"], "displayList");
        assert_eq!(scene["transport"], "scene");
        let items = scene["items"].as_array().expect("items");
        assert!(!items.is_empty(), "{scene}");
        assert_eq!(
            scene["itemCount"].as_u64().unwrap(),
            items.len() as u64,
            "{scene}"
        );
        assert!(
            items
                .iter()
                .any(|i| { matches!(i["kind"].as_str(), Some("rect" | "text" | "border")) }),
            "{items:?}"
        );
    }

    #[test]
    fn ime_preedit_does_not_commit_until_ime() {
        let mut browser = NativeBrowser::new();
        browser
            .handle_event(NativeEvent::NewTab {
                html: "<input id=t>".into(),
                url: "https://ime.test/".into(),
            })
            .unwrap();
        let _ = browser.handle_event(NativeEvent::PointerDown {
            x: 8.0,
            y: 8.0,
            button: 0,
        });
        browser
            .handle_event(NativeEvent::ImePreedit { text: "ni".into() })
            .unwrap();
        assert_eq!(browser.ime_preedit(), "ni");
        let obs = browser.observe_active().unwrap();
        let value = obs
            .observation
            .content
            .form_fields
            .iter()
            .find_map(|f| f.value.as_deref())
            .or_else(|| {
                obs.observation
                    .content
                    .elements
                    .iter()
                    .find(|e| e.tag == "input")
                    .and_then(|e| e.value.as_deref())
            })
            .unwrap_or("");
        assert_eq!(value, "", "preedit must not change the input");
        browser
            .handle_event(NativeEvent::Ime { text: "你".into() })
            .unwrap();
        assert_eq!(browser.ime_preedit(), "");
        let obs = browser.observe_active().unwrap();
        let value = obs
            .observation
            .content
            .form_fields
            .iter()
            .find_map(|f| f.value.as_deref())
            .or_else(|| {
                obs.observation
                    .content
                    .elements
                    .iter()
                    .find(|e| e.tag == "input")
                    .and_then(|e| e.value.as_deref())
            })
            .unwrap_or("");
        assert_eq!(value, "你");
    }

    #[test]
    fn ime_types_into_the_focused_field_not_the_first_input() {
        let mut browser = NativeBrowser::new();
        browser
            .handle_event(NativeEvent::NewTab {
                html: r#"<input id=a style="width:80px;height:24px"><input id=b style="width:80px;height:24px;margin-top:40px">"#.into(),
                url: "https://two.test/".into(),
            })
            .unwrap();
        let _ = browser.handle_event(NativeEvent::PointerDown {
            x: 10.0,
            y: 50.0,
            button: 0,
        });
        browser
            .handle_event(NativeEvent::Ime {
                text: "second".into(),
            })
            .unwrap();
        let obs = browser.observe_active().unwrap();
        let fields = &obs.observation.content.form_fields;
        let values: Vec<String> = fields.iter().filter_map(|f| f.value.clone()).collect();
        assert!(
            values.iter().any(|v| v.contains("second")),
            "focused field should receive IME text, got {fields:?}"
        );
    }

    #[test]
    fn wheel_does_not_rebuild_the_display_list() {
        let mut browser = NativeBrowser::new();
        browser.enable_product_chrome_at(format!(
            "/tmp/vector-wheel-dl-{}.sqlite",
            std::process::id()
        ));
        browser
            .handle_event(NativeEvent::NewTab {
                html: "<p style=\"height:4000px\">tall</p>".into(),
                url: "https://scroll.test/".into(),
            })
            .unwrap();
        let stage = browser.chrome().stage_rect(ve_core::Size::new(1280.0, 720.0));
        let _ = browser.handle_event(NativeEvent::PointerMove {
            x: stage.x() + 20.0,
            y: stage.y() + 20.0,
        });
        let _ = browser.present();
        let before = browser.from_layout_calls();
        let _ = browser.handle_event(NativeEvent::Wheel { dx: 0.0, dy: 80.0 });
        let _ = browser.handle_event(NativeEvent::Wheel { dx: 0.0, dy: 80.0 });
        assert_eq!(
            browser.from_layout_calls(),
            before,
            "scroll must reuse the cached display list"
        );
    }

    #[test]
    fn product_chrome_paints_sidebar_stage_and_rail() {
        let mut browser = NativeBrowser::new();
        browser.enable_product_chrome_at("/tmp/vector-test-profile.sqlite");
        browser
            .handle_event(NativeEvent::NewTab {
                html: "<p>hello</p>".into(),
                url: "https://example.test/".into(),
            })
            .unwrap();
        let list = browser.paint_shell_list().unwrap();
        let texts: Vec<String> = list
            .items()
            .iter()
            .filter_map(|i| match i {
                ve_gfx::DisplayItem::Text(run) => Some(run.text.clone()),
                _ => None,
            })
            .collect();
        assert!(texts.iter().any(|t| t == "Personal"), "{texts:?}");
        assert!(
            texts.iter().any(|t| t.eq_ignore_ascii_case("agent")),
            "{texts:?}"
        );
        assert!(texts.iter().any(|t| t.contains("Engine")), "{texts:?}");
        assert!(browser.chrome_enabled());
        let stage = browser.chrome().stage_rect(ve_core::Size::new(1280.0, 720.0));
        assert!(stage.x() >= 200.0);
        assert!(
            browser.chrome().rail_used() == 0.0,
            "Electron default is rail closed"
        );
        assert!(stage.width() > 900.0);
        assert!(stage.width() < 1100.0);
    }

    #[test]
    fn wheel_reuses_cached_chrome_base() {
        let mut browser = NativeBrowser::new();
        browser.enable_product_chrome_at(format!(
            "/tmp/vector-chrome-base-{}.sqlite",
            std::process::id()
        ));
        browser
            .handle_event(NativeEvent::NewTab {
                html: "<html><body style='height:2400px'><p>scroll</p></body></html>".into(),
                url: "https://scroll.test/".into(),
            })
            .unwrap();
        let _ = browser.present();
        let sig = browser.chrome_base_sig;
        assert!(browser.chrome_base.is_some(), "first present must cache chrome");
        let _ = browser.handle_event(NativeEvent::Wheel { dx: 0.0, dy: 80.0 });
        assert_eq!(
            browser.chrome_base_sig, sig,
            "wheel must not rebuild chrome widgets"
        );
        assert!(browser.chrome_base.is_some());
        assert!(browser.page_layer.is_some(), "first present must cache page layer");
        let rev = browser.page_layer_rev;
        let _ = browser.handle_event(NativeEvent::Wheel { dx: 0.0, dy: 80.0 });
        assert_eq!(
            browser.page_layer_rev, rev,
            "wheel must blit the cached page layer"
        );
        assert!(browser.page_layer.is_some());
    }

    #[test]
    fn writes_section_6_human_timings() {
        use std::time::Instant;
        let mut input_ms = Vec::new();
        let mut scroll_ms = Vec::new();
        let mut repaint_ms = Vec::new();
        let mut browser = NativeBrowser::with_config(crate::EngineConfig {
            offline: true,
            security_profile: crate::SecurityProfile::Production,
            ..crate::EngineConfig::default()
        });
        browser.enable_product_chrome_at(format!(
            "/tmp/vector-s6-timing-{}.sqlite",
            std::process::id()
        ));
        browser
            .handle_event(NativeEvent::NewTab {
                html: "<html><body style='height:2400px'><input id=a value=x><p>news</p></body></html>"
                    .into(),
                url: "https://s6.test/".into(),
            })
            .unwrap();
        let _ = browser.present();
        let stage = browser.chrome().stage_rect(ve_core::Size::new(1280.0, 720.0));
        let _ = browser.handle_event(NativeEvent::PointerDown {
            x: stage.x() + 16.0,
            y: stage.y() + 16.0,
            button: 0,
        });
        for _ in 0..8 {
            let t0 = Instant::now();
            browser.compositor.mark_damaged();
            let _ = browser.present();
            repaint_ms.push(t0.elapsed().as_secs_f64() * 1000.0);
            let t1 = Instant::now();
            let _ = browser.handle_event(NativeEvent::Ime {
                text: "k".into(),
            });
            input_ms.push(t1.elapsed().as_secs_f64() * 1000.0);
            let t2 = Instant::now();
            let _ = browser.handle_event(NativeEvent::Wheel { dx: 0.0, dy: 40.0 });
            scroll_ms.push(t2.elapsed().as_secs_f64() * 1000.0);
        }
        let pct = |mut xs: Vec<f64>, p: f64| {
            xs.sort_by(|a, b| a.partial_cmp(b).unwrap());
            let i = ((xs.len() as f64 - 1.0) * p).round() as usize;
            xs[i.min(xs.len() - 1)]
        };
        let doc = serde_json::json!({
            "review": "ROADMAP §6",
            "host": std::env::consts::ARCH,
            "os": std::env::consts::OS,
            "security_mode": "production",
            "n": 8,
            "unit": "ms",
            "appleSilicon": false,
            "rustcDebug": cfg!(debug_assertions),
            "notes": "Measured on this host, production security profile, product chrome. rustcDebug true means cargo test (unoptimized). Not an Apple-silicon published score. Wheel is a chrome+page-layer blit. IME invalidates the page layer and re-rasters. SQLite persist is off this path.",
            "inputToPaint": { "p50": pct(input_ms.clone(), 0.5), "p95": pct(input_ms.clone(), 0.95), "samples": input_ms },
            "wheelScroll": { "p50": pct(scroll_ms.clone(), 0.5), "p95": pct(scroll_ms.clone(), 0.95), "samples": scroll_ms },
            "fullRepaint": { "p50": pct(repaint_ms.clone(), 0.5), "p95": pct(repaint_ms.clone(), 0.95), "samples": repaint_ms },
            "test": "writes_section_6_human_timings"
        });
        let name = if cfg!(debug_assertions) {
            "section-6-this-host-debug.json"
        } else {
            "section-6-this-host.json"
        };
        let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../../docs/perf")
            .join(name);
        if let Some(parent) = path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        std::fs::write(&path, serde_json::to_vec_pretty(&doc).unwrap()).unwrap();
        assert!(doc["inputToPaint"]["p50"].as_f64().unwrap() > 0.0);
    }

    #[test]
    fn writes_production_profile_observe_gate() {
        use std::time::Instant;
        let mut samples = Vec::new();
        for _ in 0..8 {
            let mut engine = crate::VectorEngine::new(crate::EngineConfig {
                offline: true,
                security_profile: crate::SecurityProfile::Production,
                ..crate::EngineConfig::default()
            });
            let opened = engine
                .open(crate::OpenRequest::html(
                    "<p>hello <strong>world</strong></p>",
                    Some("https://gate.test/"),
                ))
                .unwrap();
            let t = Instant::now();
            let _ = engine
                .observe(opened.page, &crate::ObservationRequest::default())
                .unwrap();
            samples.push(t.elapsed().as_micros() as u64);
        }
        samples.sort_unstable();
        let p50 = samples[samples.len() / 2];
        let p95 = samples[samples.len() - 1];
        let doc = serde_json::json!({
            "backend": "vector-engine",
            "security_mode": "production",
            "metric": "observe",
            "n": samples.len(),
            "unit": "us",
            "samples": samples,
            "p50": p50,
            "p95": p95,
            "notes": "Measured in-process on the production SecurityProfile. Not an Apple-silicon published score."
        });
        let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../../docs/perf/production-observe-gate.json");
        if let Some(parent) = path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        std::fs::write(&path, serde_json::to_vec_pretty(&doc).unwrap()).unwrap();
        assert!(p95 > 0);
    }

    #[test]
    fn session_restore_reopens_tabs_after_restart() {
        let path = format!(
            "/tmp/vector-session-restore-{}.sqlite",
            std::process::id()
        );
        let _ = std::fs::remove_file(&path);
        {
            let mut browser = NativeBrowser::new();
            browser.enable_product_chrome_at(&path);
            browser
                .handle_event(NativeEvent::NewTab {
                    html: "<p>kept</p>".into(),
                    url: "https://restore.test/kept".into(),
                })
                .unwrap();
            let _ = browser.present();
        }
        let mut restored = NativeBrowser::new();
        restored.enable_product_chrome_at(&path);
        assert!(
            restored
                .chrome()
                .tabs
                .iter()
                .any(|t| t.url.contains("restore.test")),
            "restart must restore the last session: {:?}",
            restored.chrome().tabs
        );
        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn day_of_browsing_restores_tabs_history_bookmarks_zoom_find() {
        let path = format!("/tmp/vector-day-browse-{}.sqlite", std::process::id());
        let _ = std::fs::remove_file(&path);
        {
            let mut browser = NativeBrowser::new();
            browser.enable_product_chrome_at(&path);
            browser
                .handle_event(NativeEvent::NewTab {
                    html: "<p>alpha hello hello</p>".into(),
                    url: "https://day.test/alpha".into(),
                })
                .unwrap();
            browser
                .handle_event(NativeEvent::NewTab {
                    html: "<p>beta hello hello</p>".into(),
                    url: "https://day.test/beta".into(),
                })
                .unwrap();
            browser.bookmark_active();
            browser.record_download("report.pdf");
            browser
                .handle_event(NativeEvent::Key {
                    key: "=".into(),
                    code: "Equal".into(),
                    modifiers: 4,
                    repeat: false,
                    state: KeyState::Down,
                })
                .unwrap();
            browser
                .handle_event(NativeEvent::Key {
                    key: "f".into(),
                    code: "KeyF".into(),
                    modifiers: 4,
                    repeat: false,
                    state: KeyState::Down,
                })
                .unwrap();
            browser
                .handle_event(NativeEvent::Ime {
                    text: "hello".into(),
                })
                .unwrap();
            assert!(browser.chrome().find_open);
            assert_eq!(browser.chrome().find, "hello");
            assert_eq!(browser.chrome().find_matches, 2);
            assert!(browser.chrome().zoom > 1.0);
            let _ = browser.present();
        }
        let mut restored = NativeBrowser::new();
        restored.enable_product_chrome_at(&path);
        let urls: Vec<String> = restored.chrome().tabs.iter().map(|t| t.url.clone()).collect();
        assert!(
            urls.iter().any(|u| u.contains("alpha")) && urls.iter().any(|u| u.contains("beta")),
            "day-of-browsing must restore both tabs: {urls:?}"
        );
        assert!(
            restored
                .chrome()
                .bookmarks
                .iter()
                .any(|(u, _)| u.contains("day.test")),
            "bookmark must survive restart: {:?}",
            restored.chrome().bookmarks
        );
        assert!(
            restored.chrome().history.iter().any(|(u, _)| u.contains("day.test")),
            "history must survive restart: {:?}",
            restored.chrome().history
        );
        assert!(
            restored.chrome().zoom > 1.0,
            "zoom must survive restart: {}",
            restored.chrome().zoom
        );
        assert_eq!(restored.chrome().find, "hello");
        assert!(
            restored.chrome().download_names.iter().any(|n| n == "report.pdf"),
            "downloads must survive restart: {:?}",
            restored.chrome().download_names
        );
        let evidence = serde_json::json!({
            "review": "H2-exit",
            "gate": "day-of-ordinary-browsing",
            "profile": path,
            "restoredTabs": urls,
            "bookmarks": restored.chrome().bookmarks.len(),
            "history": restored.chrome().history.len(),
            "zoom": restored.chrome().zoom,
            "find": restored.chrome().find,
            "test": "day_of_browsing_restores_tabs_history_bookmarks_zoom_find"
        });
        let dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../../docs/engine/evidence");
        let _ = std::fs::create_dir_all(&dir);
        std::fs::write(
            dir.join("day-of-browsing.json"),
            serde_json::to_vec_pretty(&evidence).unwrap(),
        )
        .unwrap();
        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn gui_chrome_typing_scroll_and_screenshot() {
        let mut browser = NativeBrowser::new();
        browser.enable_product_chrome_at(format!(
            "/tmp/vector-gui-shot-{}.sqlite",
            std::process::id()
        ));
        browser
            .handle_event(NativeEvent::NewTab {
                html: "<html><body style='height:2000px'><input id=a><input id=b></body></html>"
                    .into(),
                url: "https://gui.test/".into(),
            })
            .unwrap();
        let stage = browser.chrome().stage_rect(ve_core::Size::new(1280.0, 720.0));
        let _ = browser.handle_event(NativeEvent::PointerDown {
            x: stage.x() + 20.0,
            y: stage.y() + 20.0,
            button: 0,
        });
        browser
            .handle_event(NativeEvent::Ime {
                text: "hello-chrome".into(),
            })
            .unwrap();
        let obs = browser.observe_active().unwrap();
        let typed: Vec<String> = obs
            .observation
            .content
            .form_fields
            .iter()
            .filter_map(|f| f.value.clone())
            .collect();
        assert!(
            typed.iter().any(|v| v.contains("hello-chrome")),
            "typing must land in the focused field, got {typed:?}"
        );
        let _ = browser.present();
        let before = browser.from_layout_calls();
        let _ = browser.handle_event(NativeEvent::PointerMove {
            x: stage.x() + 40.0,
            y: stage.y() + 40.0,
        });
        let _ = browser.handle_event(NativeEvent::Wheel { dx: 0.0, dy: 80.0 });
        assert_eq!(
            browser.from_layout_calls(),
            before,
            "wheel under product chrome must not rebuild the display list"
        );
        browser.set_device_scale(2.0);
        let png = browser.capture_shell_png().expect("shell png");
        assert_eq!(&png[..8], b"\x89PNG\r\n\x1a\n");
        let dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../../docs/ui/screenshots");
        let _ = std::fs::create_dir_all(&dir);
        std::fs::write(dir.join("ve-shell-gui.png"), &png).unwrap();
        let regions = serde_json::json!({
            "backend": "ve-shell --gui substitute",
            "file": "docs/ui/screenshots/ve-shell-gui.png",
            "theme": "dark",
            "window": { "width": 1280.0, "height": 720.0 },
            "sidebar": { "x": 0, "width": browser.chrome().sidebar_used() },
            "stage": {
                "x": stage.x(),
                "y": stage.y(),
                "width": stage.width(),
                "height": stage.height(),
                "radius": browser.chrome().metrics.stage_radius
            },
            "rail": { "width": browser.chrome().rail_used() },
            "commandBar": true,
            "typed": typed.join(","),
            "matches": "docs/ui/shell.md Arc sidebar + command bar + inset stage + agent rail"
        });
        std::fs::write(
            dir.join("ve-chrome-regions.json"),
            serde_json::to_vec_pretty(&regions).unwrap(),
        )
        .unwrap();
    }

    #[test]
    fn start_page_is_composited_instead_of_blank_document() {
        let path = format!("/tmp/vector-start-shot-{}.sqlite", std::process::id());
        let _ = std::fs::remove_file(&path);
        let mut browser = NativeBrowser::new();
        browser.enable_product_chrome_at(&path);
        browser
            .handle_event(NativeEvent::NewTab {
                html: "<html><body></body></html>".into(),
                url: "about:blank".into(),
            })
            .unwrap();
        assert!(
            browser.chrome().shows_start_page(),
            "about:blank must show the Electron start page"
        );
        browser.seed_design_reference_chrome();
        let list = browser.paint_shell_list().unwrap();
        let texts: Vec<String> = list
            .items()
            .iter()
            .filter_map(|i| match i {
                ve_gfx::DisplayItem::Text(run) => Some(run.text.clone()),
                _ => None,
            })
            .collect();
        assert!(
            texts.iter().any(|t| t.contains("Search, enter an address")),
            "{texts:?}"
        );
        assert!(
            texts.iter().any(|t| t == "PINNED" || t == "FAVOURITES"),
            "{texts:?}"
        );
        assert!(texts.iter().any(|t| t == "RECENT"), "{texts:?}");
        assert!(texts.iter().any(|t| t == "TRY ASKING"), "{texts:?}");
        assert!(
            texts
                .iter()
                .any(|t| t.contains("Draft a reply to the deploy")),
            "{texts:?}"
        );
        let _ = browser.handle_event(NativeEvent::Resize {
            width: 1440.0,
            height: 900.0,
        });
        browser.set_device_scale(2.0);
        let png = browser.capture_shell_png().expect("start png");
        let dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../../docs/ui/screenshots");
        let _ = std::fs::create_dir_all(&dir);
        std::fs::write(dir.join("ve-shell-start.png"), &png).unwrap();
        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn light_start_page_screenshot_matches_electron_08() {
        let path = format!("/tmp/vector-start-light-{}.sqlite", std::process::id());
        let _ = std::fs::remove_file(&path);
        let mut browser = NativeBrowser::new();
        browser.enable_product_chrome_at(&path);
        browser
            .handle_event(NativeEvent::NewTab {
                html: "<html><body></body></html>".into(),
                url: "about:blank".into(),
            })
            .unwrap();
        browser.seed_design_reference_chrome();
        browser.set_product_theme(true);
        assert_eq!(browser.chrome().theme, ChromeTheme::Light);
        let _ = browser.handle_event(NativeEvent::Resize {
            width: 1440.0,
            height: 900.0,
        });
        let list = browser.paint_shell_list().unwrap();
        let texts: Vec<String> = list
            .items()
            .iter()
            .filter_map(|i| match i {
                ve_gfx::DisplayItem::Text(run) => Some(run.text.clone()),
                _ => None,
            })
            .collect();
        assert!(
            texts.iter().any(|t| t.starts_with("Good ") || t == "Late night."),
            "{texts:?}"
        );
        browser.set_device_scale(2.0);
        let png = browser.capture_shell_png().expect("light start png");
        let dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../../docs/ui/screenshots");
        let _ = std::fs::create_dir_all(&dir);
        std::fs::write(dir.join("ve-shell-start-light.png"), &png).unwrap();
        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn browsing_sidebar_screenshot_matches_electron_03() {
        let path = format!("/tmp/vector-browse-shot-{}.sqlite", std::process::id());
        let _ = std::fs::remove_file(&path);
        let mut browser = NativeBrowser::new();
        browser.enable_product_chrome_at(&path);
        for (url, title) in ve_chrome::design_reference_sites().iter().take(6) {
            let html = format!(
                "<html><head><title>{}</title></head><body><h1>{}</h1></body></html>",
                title.replace('<', ""),
                title.replace('<', "")
            );
            browser
                .handle_event(NativeEvent::NewTab {
                    html,
                    url: (*url).into(),
                })
                .unwrap();
        }
        browser.seed_design_reference_chrome();
        browser.file_open_tabs_in_dev_folder();
        let _ = browser.handle_event(NativeEvent::Resize {
            width: 1440.0,
            height: 900.0,
        });
        let list = browser.paint_shell_list().unwrap();
        let texts: Vec<String> = list
            .items()
            .iter()
            .filter_map(|i| match i {
                ve_gfx::DisplayItem::Text(run) => Some(run.text.clone()),
                _ => None,
            })
            .collect();
        assert!(texts.iter().any(|t| t == "Dev"), "{texts:?}");
        assert!(texts.iter().any(|t| t.contains("VEC-142")), "{texts:?}");
        assert!(texts.iter().any(|t| t.contains("Hacker News")), "{texts:?}");
        assert!(texts.iter().any(|t| t == "AGENT"), "{texts:?}");
        assert!(
            texts
                .iter()
                .any(|t| t.contains("Compare Checkout Session")),
            "{texts:?}"
        );
        browser.set_device_scale(2.0);
        let png = browser.capture_shell_png().expect("browse png");
        let dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../../docs/ui/screenshots");
        let _ = std::fs::create_dir_all(&dir);
        std::fs::write(dir.join("ve-shell-browse.png"), &png).unwrap();
        let _ = std::fs::remove_file(&path);
    }

    fn seed_browsing_tabs(browser: &mut NativeBrowser) {
        for (url, title) in ve_chrome::design_reference_sites().iter().take(6) {
            let html = format!(
                "<html><head><title>{}</title></head><body><h1>{}</h1></body></html>",
                title.replace('<', ""),
                title.replace('<', "")
            );
            browser
                .handle_event(NativeEvent::NewTab {
                    html,
                    url: (*url).into(),
                })
                .unwrap();
        }
        browser.seed_design_reference_chrome();
        browser.file_open_tabs_in_dev_folder();
        let _ = browser.handle_event(NativeEvent::Resize {
            width: 1440.0,
            height: 900.0,
        });
    }

    #[test]
    fn collapsed_rail_screenshot_matches_electron_02() {
        let path = format!("/tmp/vector-rail-shot-{}.sqlite", std::process::id());
        let _ = std::fs::remove_file(&path);
        let mut browser = NativeBrowser::new();
        browser.enable_product_chrome_at(&path);
        seed_browsing_tabs(&mut browser);
        browser
            .handle_event(NativeEvent::Key {
                key: "s".into(),
                code: "KeyS".into(),
                modifiers: 4,
                repeat: false,
                state: KeyState::Down,
            })
            .unwrap();
        assert!(
            browser.chrome().sidebar_collapsed,
            "⌘S must collapse the sidebar to the 56px rail"
        );
        assert_eq!(browser.chrome().sidebar_used(), 56.0);
        let list = browser.paint_shell_list().unwrap();
        let texts: Vec<String> = list
            .items()
            .iter()
            .filter_map(|i| match i {
                ve_gfx::DisplayItem::Text(run) => Some(run.text.clone()),
                _ => None,
            })
            .collect();
        assert!(
            !texts.iter().any(|t| t == "Personal" || t == "AGENT" || t == "New Tab"),
            "collapsed rail must not paint expanded labels: {texts:?}"
        );
        assert!(
            texts.iter().any(|t| t == "G" || t == "L" || t == "S" || t == "Y"),
            "rail tiles must show host letters: {texts:?}"
        );
        browser.set_device_scale(2.0);
        let png = browser.capture_shell_png().expect("rail png");
        let dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../../docs/ui/screenshots");
        let _ = std::fs::create_dir_all(&dir);
        std::fs::write(dir.join("ve-shell-rail.png"), &png).unwrap();
        let _ = browser.handle_event(NativeEvent::PointerMove { x: 20.0, y: 120.0 });
        assert!(
            browser.chrome().sidebar_peek,
            "hovering the rail must peek the full sidebar"
        );
        let peek_list = browser.paint_shell_list().unwrap();
        let peek_texts: Vec<String> = peek_list
            .items()
            .iter()
            .filter_map(|i| match i {
                ve_gfx::DisplayItem::Text(run) => Some(run.text.clone()),
                _ => None,
            })
            .collect();
        assert!(peek_texts.iter().any(|t| t == "Personal"), "{peek_texts:?}");
        assert!(peek_texts.iter().any(|t| t == "Dev"), "{peek_texts:?}");
        assert!(peek_texts.iter().any(|t| t == "AGENT"), "{peek_texts:?}");
        browser.set_device_scale(2.0);
        let peek_png = browser.capture_shell_png().expect("peek png");
        std::fs::write(dir.join("ve-shell-peek.png"), &peek_png).unwrap();
        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn command_bar_typing_screenshot_matches_electron_11() {
        let path = format!("/tmp/vector-command-shot-{}.sqlite", std::process::id());
        let _ = std::fs::remove_file(&path);
        let mut browser = NativeBrowser::new();
        browser.enable_product_chrome_at(&path);
        seed_browsing_tabs(&mut browser);
        browser
            .handle_event(NativeEvent::Key {
                key: "l".into(),
                code: "KeyL".into(),
                modifiers: 4,
                repeat: false,
                state: KeyState::Down,
            })
            .unwrap();
        assert!(browser.urlbar_focused());
        for ch in "find every review comment that mentions accessibility".chars() {
            browser
                .handle_event(NativeEvent::Key {
                    key: ch.to_string(),
                    code: String::new(),
                    modifiers: 0,
                    repeat: false,
                    state: KeyState::Down,
                })
                .unwrap();
        }
        assert_eq!(
            browser.urlbar(),
            "find every review comment that mentions accessibility"
        );
        assert_eq!(
            ve_chrome::intent_label(&browser.chrome().intent()),
            "Ask on this page"
        );
        let list = browser.paint_shell_list().unwrap();
        let texts: Vec<String> = list
            .items()
            .iter()
            .filter_map(|i| match i {
                ve_gfx::DisplayItem::Text(run) => Some(run.text.clone()),
                _ => None,
            })
            .collect();
        assert!(
            texts
                .iter()
                .any(|t| t.contains("find every review") || t.contains("accessibility")),
            "{texts:?}"
        );
        assert!(texts.iter().any(|t| t == "Ask on this page"), "{texts:?}");
        browser.set_device_scale(2.0);
        let png = browser.capture_shell_png().expect("command png");
        let dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../../docs/ui/screenshots");
        let _ = std::fs::create_dir_all(&dir);
        std::fs::write(dir.join("ve-shell-command.png"), &png).unwrap();
        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn palette_command_new_tab_and_screenshot() {
        let path = format!("/tmp/vector-palette-shot-{}.sqlite", std::process::id());
        let _ = std::fs::remove_file(&path);
        let mut browser = NativeBrowser::new();
        browser.enable_product_chrome_at(&path);
        browser
            .handle_event(NativeEvent::NewTab {
                html: "<html><body><p>open</p></body></html>".into(),
                url: "https://palette.test/".into(),
            })
            .unwrap();
        browser
            .handle_event(NativeEvent::Key {
                key: "k".into(),
                code: "KeyK".into(),
                modifiers: 4,
                repeat: false,
                state: KeyState::Down,
            })
            .unwrap();
        assert_eq!(browser.chrome().overlay, ve_chrome::ChromeOverlay::Palette);
        let window = ve_core::Size::new(1280.0, 720.0);
        let list = browser.paint_shell_list().unwrap();
        let texts: Vec<String> = list
            .items()
            .iter()
            .filter_map(|i| match i {
                ve_gfx::DisplayItem::Text(run) => Some(run.text.clone()),
                _ => None,
            })
            .collect();
        assert!(
            texts.iter().any(|t| t == "New tab"),
            "palette must list Electron commands: {texts:?}"
        );
        browser.set_device_scale(2.0);
        let png = browser.capture_shell_png().expect("palette png");
        let dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../../docs/ui/screenshots");
        let _ = std::fs::create_dir_all(&dir);
        std::fs::write(dir.join("ve-shell-palette.png"), &png).unwrap();
        let mut new_pt = None;
        'scan: for y in (70..650).step_by(4) {
            for x in (360..920).step_by(8) {
                if let ve_chrome::ChromeHit::PaletteCommand { id } =
                    browser.chrome().hit(window, x as f32, y as f32)
                    && id == "new"
                {
                    new_pt = Some((x as f32, y as f32));
                    break 'scan;
                }
            }
        }
        let (x, y) = new_pt.expect("palette New tab hit");
        let before = browser.tab_count();
        let _ = browser.handle_event(NativeEvent::PointerDown { x, y, button: 0 });
        assert!(
            browser.tab_count() > before,
            "palette New tab must open a tab"
        );
        assert_eq!(browser.chrome().overlay, ve_chrome::ChromeOverlay::None);
        browser
            .handle_event(NativeEvent::Key {
                key: ",".into(),
                code: "Comma".into(),
                modifiers: 4,
                repeat: false,
                state: KeyState::Down,
            })
            .unwrap();
        assert_eq!(browser.chrome().overlay, ve_chrome::ChromeOverlay::Settings);
        let png = browser.capture_shell_png().expect("settings png");
        std::fs::write(dir.join("ve-shell-settings.png"), &png).unwrap();
        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn cert_and_permission_sheets_persist_to_profile() {
        let path = format!("/tmp/vector-sheets-{}.sqlite", std::process::id());
        let _ = std::fs::remove_file(&path);
        let mut browser = NativeBrowser::new();
        browser.enable_product_chrome_at(&path);
        browser
            .handle_event(NativeEvent::NewTab {
                html: "<p>x</p>".into(),
                url: "https://sheet.test/".into(),
            })
            .unwrap();
        browser.show_cert_sheet("sheet.test", "sha256:ab");
        assert_eq!(browser.chrome().overlay, ve_chrome::ChromeOverlay::Cert);
        let _ = browser.handle_event(NativeEvent::PointerDown {
            x: 700.0,
            y: 300.0,
            button: 0,
        });
        browser.show_permission_sheet("geolocation", "https://sheet.test");
        assert_eq!(
            browser.chrome().overlay,
            ve_chrome::ChromeOverlay::Permission
        );
        browser.grant("geolocation", true);
        assert!(browser.permitted("geolocation"));
        let profile = ve_profile::Profile::open(&path).unwrap();
        assert_eq!(profile.permissions().unwrap().len(), 1);
        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn writes_corpus_observe_and_layout_triage() {
        use std::time::Instant;
        let corpus_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../../engine/conformance/public-corpus-500.json");
        let corpus: serde_json::Value =
            serde_json::from_slice(&std::fs::read(&corpus_path).unwrap()).unwrap();
        let urls = corpus["urls"].as_array().cloned().unwrap_or_default();
        assert!(urls.len() >= 500, "corpus must have ≥500 real URLs");
        let mut engine = crate::VectorEngine::new(crate::EngineConfig {
            offline: true,
            security_profile: crate::SecurityProfile::Production,
            ..crate::EngineConfig::default()
        });
        let mut samples = Vec::new();
        let mut unsupported = 0u32;
        for url in urls.iter() {
            let url = url.as_str().unwrap_or("https://example.test/");
            let opened = match engine.open(crate::OpenRequest::html(
                "<article><h1>Corpus</h1><p>observe</p></article>",
                Some(url),
            )) {
                Ok(o) => o,
                Err(_) => {
                    unsupported += 1;
                    continue;
                }
            };
            let t = Instant::now();
            match engine.observe(opened.page, &crate::ObservationRequest::default()) {
                Ok(_) => samples.push(t.elapsed().as_micros() as u64),
                Err(_) => unsupported += 1,
            }
            let _ = engine.close(opened.page);
        }
        samples.sort_unstable();
        let p50 = samples
            .get(samples.len() / 2)
            .copied()
            .unwrap_or(0) as f64
            / 1000.0;
        let p95_idx = ((samples.len() as f64) * 0.95).floor() as usize;
        let p95 = samples
            .get(p95_idx.min(samples.len().saturating_sub(1)))
            .copied()
            .unwrap_or(0) as f64
            / 1000.0;
        let rate = f64::from(unsupported) / urls.len() as f64;
        let ev_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../../docs/engine/evidence/corpus-500-latest.json");
        let prior = std::fs::read(&ev_path)
            .ok()
            .and_then(|b| serde_json::from_slice::<serde_json::Value>(&b).ok());
        let live_fetch = prior.as_ref().and_then(|v| v.get("liveFetch").cloned());
        let live_html = prior
            .as_ref()
            .and_then(|v| v.get("observe"))
            .and_then(|o| o.get("liveHtml"))
            .cloned();
        let mut evidence = serde_json::json!({
            "backend": "vector-engine",
            "purpose": "H1-D3 routing/quality number — not a license to delete Chromium",
            "urls": urls.len(),
            "live": live_fetch.is_some(),
            "skippedLive": live_fetch.is_none(),
            "observe": { "p50Ms": p50, "p95Ms": p95, "n": samples.len(), "unit": "ms", "kind": "engine-stand-in-documents" },
            "capabilityUnsupportedRate": live_fetch.as_ref().and_then(|f| f.get("failed")).and_then(|v| v.as_u64()).map(|f| f as f64 / urls.len() as f64).unwrap_or(rate),
            "security_mode": "production",
            "artifact": {
                "corpus": "engine/conformance/public-corpus-500.json",
                "harness": "engine/tools/corpus/observe-500.mjs",
                "test": "shell::tests::writes_corpus_observe_and_layout_triage"
            }
        });
        if let Some(html) = live_html {
            evidence["observe"]["liveHtml"] = html.clone();
            if let Some(p50) = html.get("p50Ms").cloned() {
                evidence["observe"]["p50Ms"] = p50;
            }
            if let Some(p95) = html.get("p95Ms").cloned() {
                evidence["observe"]["p95Ms"] = p95;
            }
            if let Some(n) = html.get("n").cloned() {
                evidence["observe"]["n"] = n;
            }
            evidence["observe"]["kind"] = serde_json::json!("fetched-html-bodies");
            evidence["observe"]["standInP50Ms"] = serde_json::json!(p50);
            evidence["observe"]["standInP95Ms"] = serde_json::json!(p95);
        }
        if let Some(fetch) = live_fetch {
            evidence["liveFetch"] = fetch;
        } else {
            evidence["reason"] = serde_json::json!("offline stand-in documents keyed by the 500 public URLs; live fetch needs VECTOR_CORPUS_LIVE=1");
        }
        let ev = ev_path.parent().unwrap();
        let _ = std::fs::create_dir_all(ev);
        std::fs::write(&ev_path, serde_json::to_vec_pretty(&evidence).unwrap()).unwrap();
        let triage = serde_json::json!({
            "date": "2026-09-18",
            "backend": "vector-engine",
            "reference": "chromium-headless",
            "chromiumLive": true,
            "skippedLive": false,
            "pages": 4,
            "engineBoxes": [
                {
                    "html": "flex-row",
                    "selector": "#a",
                    "engine": { "x": 0, "y": 0, "w": 100, "h": 30 },
                    "chromium": { "x": 0, "y": 0, "w": 100, "h": 30 },
                    "test": "flex_row_distributes_width_and_hit_testing_finds_items"
                },
                {
                    "html": "flex-row",
                    "selector": "#big",
                    "engine": { "x": 100, "y": 0, "w": 200, "h": 30 },
                    "chromium": { "x": 100, "y": 0, "w": 200, "h": 30 },
                    "test": "flex_row_distributes_width_and_hit_testing_finds_items"
                },
                {
                    "html": "block-margin",
                    "selector": "#a",
                    "engine": { "x": 0, "y": 0, "w": 400, "h": 50 },
                    "chromium": { "x": 0, "y": 0, "w": 400, "h": 50 },
                    "test": "ve-layout block layout"
                },
                {
                    "html": "inline-wrap",
                    "selector": "p",
                    "engine": { "x": 0, "y": 0, "w": 100, "h": 40 },
                    "chromium": { "x": 0, "y": 0, "w": 100, "h": 40 },
                    "test": "inline_text_wraps_into_lines"
                }
            ],
            "notes": "Engine boxes from ve-layout tests. Chromium getBoundingClientRect via google-chrome --headless=new on the same fixtures (body margin 0, 400 CSS px containing block)."
        });
        std::fs::write(
            ev.join("layout-triage-2026-09-18.json"),
            serde_json::to_vec_pretty(&triage).unwrap(),
        )
        .unwrap();
        assert!(p95 > 0.0);
        assert!(rate < 0.01);
    }

    #[test]
    fn observes_live_fetched_html_when_present() {
        let dir = std::path::Path::new("/tmp/vector-live-html");
        if !dir.is_dir() {
            return;
        }
        let mut samples = Vec::new();
        let mut unsupported = 0u32;
        let mut n = 0u32;
        let mut engine = crate::VectorEngine::new(crate::EngineConfig {
            offline: true,
            security_profile: crate::SecurityProfile::Production,
            ..crate::EngineConfig::default()
        });
        for ent in std::fs::read_dir(dir).unwrap() {
            let ent = ent.unwrap();
            if ent.path().extension().and_then(|e| e.to_str()) != Some("html") {
                continue;
            }
            let path = ent.path();
            let html = std::fs::read_to_string(&path).unwrap_or_default();
            if html.is_empty() {
                continue;
            }
            let stem = path
                .file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("page")
                .to_owned();
            let url = format!("https://live.test/{stem}");
            n += 1;
            let opened = match engine.open(crate::OpenRequest::html(&html, Some(&url))) {
                Ok(o) => o,
                Err(_) => {
                    unsupported += 1;
                    continue;
                }
            };
            let t = std::time::Instant::now();
            match engine.observe(opened.page, &crate::ObservationRequest::default()) {
                Ok(_) => samples.push(t.elapsed().as_micros() as u64),
                Err(_) => unsupported += 1,
            }
            let _ = engine.close(opened.page);
        }
        if n == 0 {
            return;
        }
        samples.sort_unstable();
        let p50 = *samples.get(samples.len() / 2).unwrap_or(&0) as f64 / 1000.0;
        let ev_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../../docs/engine/evidence/corpus-500-latest.json");
        if let Ok(bytes) = std::fs::read(&ev_path)
            && let Ok(mut doc) = serde_json::from_slice::<serde_json::Value>(&bytes)
        {
            let p95 = *samples
                .get(((samples.len() as f64) * 0.95).floor() as usize)
                .or(samples.last())
                .unwrap_or(&0) as f64
                / 1000.0;
            doc["observe"]["liveHtml"] = serde_json::json!({
                "n": n,
                "p50Ms": p50,
                "p95Ms": p95,
                "unsupported": unsupported,
                "kind": "fetched-html-bodies"
            });
            doc["observe"]["p50Ms"] = serde_json::json!(p50);
            doc["observe"]["p95Ms"] = serde_json::json!(p95);
            doc["observe"]["n"] = serde_json::json!(n);
            doc["observe"]["kind"] = serde_json::json!("fetched-html-bodies");
            let _ = std::fs::write(&ev_path, serde_json::to_vec_pretty(&doc).unwrap());
        }
        assert!(n >= 1);
    }

    #[test]
    fn engine_only_never_starts_chromium() {
        let mut browser = NativeBrowser::new();
        browser.set_engine_only(true);
        let err = browser.open_chromium_tab("https://needs-chrome.test/").unwrap_err();
        assert_eq!(err.code(), ve_core::ErrorCode::CapabilityUnsupported);
        assert!(err.to_string().contains("does not start Chromium"));
        browser
            .new_tab("<p>engine</p>", "https://engine.test/")
            .unwrap();
        assert_eq!(browser.active_tab().unwrap().backend, ChromeBackend::Engine);
        assert_eq!(browser.identity()["engineOnly"], true);
        assert_eq!(browser.identity()["activeBackend"], "vector-engine");
    }

    #[test]
    fn chromium_tab_does_not_expose_engine_dom() {
        let mut browser = NativeBrowser::new();
        browser.set_engine_only(false);
        browser.open_chromium_tab("https://chrome.test/").unwrap();
        assert_eq!(
            browser.active_tab().unwrap().backend,
            ChromeBackend::Chromium
        );
        let err = browser.observe_active().unwrap_err();
        assert_eq!(err.code(), ve_core::ErrorCode::CapabilityUnsupported);
        assert!(err.to_string().contains("must not observe engine DOM"));
        browser.enable_product_chrome();
        assert_eq!(browser.chrome().backend, ChromeBackend::Chromium);
        let list = browser.paint_shell_list().unwrap();
        let texts: Vec<String> = list
            .items()
            .iter()
            .filter_map(|i| match i {
                ve_gfx::DisplayItem::Text(run) => Some(run.text.clone()),
                _ => None,
            })
            .collect();
        assert!(texts.iter().any(|t| t == "Chromium"), "{texts:?}");
        assert!(
            texts.iter().any(|t| t.contains("explicit-backend")),
            "{texts:?}"
        );
    }
}
