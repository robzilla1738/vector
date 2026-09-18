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
use ve_core::{Error, ErrorCode, Point, Result, Size, process_rss_bytes};
use ve_gfx::{Compositor, Frame};

use crate::{
    EngineConfig, ExecuteRequest, ExecuteResult, Observation, ObservationRequest, OpenRequest,
    PageId, Program, ShaperKind, UpdateKeyPair, VectorEngine, verify_update_manifest,
};
use ve_agent::MouseButton;

/// A tab in the native shell.
#[derive(Clone, Debug)]
pub struct Tab {
    /// Engine page.
    pub page: PageId,
    /// Address bar URL.
    pub url: String,
    /// Document title (untrusted).
    pub page_title: String,
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
    revision: u64,
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
        });
        self.active = self.tabs.len() - 1;
        self.compositor.mark_damaged();
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
        });
        self.active = self.tabs.len() - 1;
        self.compositor.mark_damaged();
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
    }

    fn resize_surface(&mut self, css_w: f32, css_h: f32) {
        let pw = (css_w * self.device_scale).round().max(1.0) as u32;
        let ph = (css_h * self.device_scale).round().max(1.0) as u32;
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
        let page = self
            .active_tab()
            .ok_or_else(|| Error::not_found("no tab"))?
            .page;
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
        let page = self
            .active_tab()
            .ok_or_else(|| Error::not_found("no tab"))?
            .page;
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
        let list = self.paint_page_id(page)?;
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
        let Some(list) = self.paint_page_id(page) else {
            return false;
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
        let page = self
            .active_tab()
            .ok_or_else(|| Error::not_found("no tab"))?
            .page;
        self.paint_page_id(page)
            .ok_or_else(|| Error::internal("paint failed"))
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
            }
            NativeEvent::BlurUrlbar => {
                self.urlbar_focused = false;
            }
            NativeEvent::UrlbarType { text } => {
                if self.urlbar_focused {
                    if text == "Backspace" {
                        self.urlbar.pop();
                    } else {
                        self.urlbar.push_str(&text);
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
                        } else if key == "Backspace" {
                            self.urlbar.pop();
                        } else if key.len() == 1 {
                            self.urlbar.push_str(&key);
                        }
                    }
                } else if self.dispatch_chrome_shortcut(&key, modifiers, state) {
                    // chrome handled
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
                self.ime_preedit.clear();
                self.last_typed.clone_from(&text);
                self.dispatch_human_ime(&text)?;
                self.present_dirty();
            }
            NativeEvent::ImePreedit { text } => {
                self.ime_preedit = text;
            }
            NativeEvent::PointerMove { x, y } => {
                self.pointer = Point::new(x, y);
            }
            NativeEvent::PointerDown { x, y, button } => {
                self.pointer = Point::new(x, y);
                self.dispatch_human_click(x, y, button)?;
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
                self.set_css_viewport(width, height);
                self.present_dirty();
            }
            NativeEvent::Wheel { dx, dy } => {
                self.dispatch_human_scroll(dx, dy)?;
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
    }

    /// Whether chrome granted `name`.
    #[must_use]
    pub fn permitted(&self, name: &str) -> bool {
        self.permissions.get(name).copied().unwrap_or(false)
    }

    /// Record a download in chrome UI.
    pub fn record_download(&mut self, filename: &str) {
        self.downloads.push(filename.to_owned());
    }

    /// Downloads listed in chrome.
    #[must_use]
    pub fn downloads(&self) -> &[String] {
        &self.downloads
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
            "f" | "F" => true, // find — chrome owns this
            "-" => true,       // zoom out
            "=" | "+" => true, // zoom in
            "0" => true,       // zoom reset
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

        let cached = self
            .list_cache
            .as_ref()
            .map(|c| (c.revision, c.layout_revision, c.viewport));
        let (revision, layout_revision, viewport, scroll, rebuilt) = {
            let p = self.engine.page_mut(page).ok()?;
            p.update();
            let revision = p.document().revision().0;
            let layout_revision = p.layout_tree().revision().0;
            let viewport = p.viewport();
            let scroll = p.scroll_offset();
            let hit = cached
                .is_some_and(|(r, l, v)| r == revision && l == layout_revision && v == viewport);
            let rebuilt = if hit {
                None
            } else {
                Some(DisplayList::from_layout_with(
                    p.layout_tree(),
                    p.style_tree(),
                    p.node_images(),
                ))
            };
            (revision, layout_revision, viewport, scroll, rebuilt)
        };
        if let Some(list) = rebuilt {
            self.from_layout_calls += 1;
            self.list_cache = Some(DisplayListCache {
                revision,
                layout_revision,
                viewport,
                list,
            });
        }
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
        ve_gfx::DisplayItem::RoundedClip { rect, radius } => serde_json::json!({
            "kind": "roundedClip",
            "x": rect.x(),
            "y": rect.y(),
            "w": rect.width(),
            "h": rect.height(),
            "radius": radius,
        }),
        ve_gfx::DisplayItem::PushTransform { tx, ty } => {
            serde_json::json!({"kind": "transform", "tx": tx, "ty": ty})
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
        browser
            .handle_event(NativeEvent::NewTab {
                html: "<p style=\"height:4000px\">tall</p>".into(),
                url: "https://scroll.test/".into(),
            })
            .unwrap();
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
}
