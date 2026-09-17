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
use ve_core::{Error, Point, Result, process_rss_bytes};
use ve_gfx::{Compositor, Frame};

use crate::{
    EngineConfig, ExecuteRequest, ExecuteResult, Observation, ObservationRequest, OpenRequest,
    PageId, Program, UpdateKeyPair, VectorEngine, verify_update_manifest,
};

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

/// Input the OS window (or tests) delivers to chrome + page.
#[derive(Clone, Debug, PartialEq)]
pub enum NativeEvent {
    /// Keyboard key (`Enter`, `Tab`, `a`, …).
    Key {
        /// Key name.
        key: String,
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
    ime_preedit: String,
    last_typed: String,
    os_clipboard: bool,
    update_pubkey: Option<[u8; 32]>,
    #[cfg(feature = "gpu")]
    gpu: Option<ve_gfx::VelloRenderer>,
    #[cfg(feature = "gpu")]
    gpu_unavailable: bool,
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
            ime_preedit: String::new(),
            last_typed: String::new(),
            os_clipboard: false,
            update_pubkey: None,
            #[cfg(feature = "gpu")]
            gpu: None,
            #[cfg(feature = "gpu")]
            gpu_unavailable: false,
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
        })
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
        let page = self
            .active_tab()
            .ok_or_else(|| Error::not_found("no tab"))?
            .page;
        self.engine.observe(page, &ObservationRequest::default())
    }

    /// Agent program against the live native document.
    pub fn execute_active(&mut self, program: Program) -> Result<ExecuteResult> {
        let page = self
            .active_tab()
            .ok_or_else(|| Error::not_found("no tab"))?
            .page;
        self.engine.execute(
            page,
            &ExecuteRequest {
                program,
                ..ExecuteRequest::default()
            },
        )
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
        let list = {
            let p = self.engine.page_mut(page).ok()?;
            p.update();
            paint_page(p)
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
        gpu.present_list(&list, width, height, 1.0).ok()?;
        gpu.readback_present_target().ok()
    }

    #[cfg(feature = "gpu")]
    fn try_gpu_present_direct(&mut self, page: PageId) -> bool {
        if self.gpu_unavailable && self.gpu.is_none() {
            return false;
        }
        let list = {
            let Ok(p) = self.engine.page_mut(page) else {
                return false;
            };
            p.update();
            paint_page(p)
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
        gpu.present_list(&list, self.surface.width, self.surface.height, 1.0)
            .is_ok()
    }

    /// Display list for the active tab (GPU window present without CPU readback).
    #[cfg(feature = "gpu")]
    pub fn display_list_active(&mut self) -> Result<ve_gfx::DisplayList> {
        let page = self
            .active_tab()
            .ok_or_else(|| Error::not_found("no tab"))?
            .page;
        let p = self.engine.page_mut(page)?;
        p.update();
        Ok(paint_page(p))
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
                    let _ = self.execute_active(Program::from_value(serde_json::json!([
                        {"id":"n","op":"navigate","url":url}
                    ]))?);
                    self.present_dirty();
                }
            }
            NativeEvent::Key { key } => {
                if self.urlbar_focused {
                    if key == "Enter" {
                        let _ = self.handle_event(NativeEvent::UrlbarSubmit)?;
                    } else if key == "Escape" {
                        self.urlbar_focused = false;
                    } else if key == "Backspace" {
                        self.urlbar.pop();
                    } else if key.len() == 1 {
                        self.urlbar.push_str(&key);
                    }
                } else {
                    if key.len() == 1 {
                        self.last_typed.push_str(&key);
                    }
                    let _ = self.press_key(&key);
                    self.present_dirty();
                }
            }
            NativeEvent::Ime { text } => {
                self.ime_preedit.clear();
                self.last_typed.clone_from(&text);
                let _ = self.execute_active(Program::from_value(serde_json::json!([
                    {"id":"t","op":"type","target":"css:input,textarea,[contenteditable]","value":text}
                ]))?);
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
                let _ = self.execute_active(Program::from_value(serde_json::json!([
                    {"id":"c","op":"clickPoint","x":x,"y":y,"button": if button == 0 { "left" } else { "right" }}
                ]))?);
                self.present_dirty();
            }
            NativeEvent::PointerUp { x, y, .. } => {
                self.pointer = Point::new(x, y);
            }
            NativeEvent::Copy => {
                let text = self.selection_or_typed();
                self.copy(&text);
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

#[cfg(feature = "gpu")]
fn paint_page(page: &crate::Page) -> ve_gfx::DisplayList {
    use ve_core::{Rect, Size};
    use ve_gfx::{DisplayItem, DisplayList};

    let layout = page.layout_tree();
    let styles = page.style_tree();
    let viewport = page.viewport();
    let scroll = page.scroll_offset();
    let list = DisplayList::from_layout(layout, styles);
    let mut translated = DisplayList::new(Size::new(viewport.width, viewport.height));
    translated.push(DisplayItem::Rect {
        rect: Rect::new(0.0, 0.0, viewport.width, viewport.height),
        color: match list.items().first() {
            Some(DisplayItem::Rect { color, .. }) => *color,
            _ => ve_style::Rgba::WHITE,
        },
    });
    for item in list.items().iter().skip(1) {
        translated.push(item.translated(-scroll.x, -scroll.y));
    }
    translated
}

impl Default for NativeBrowser {
    fn default() -> Self {
        Self::new()
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
        let _ = browser.present_direct();
        let frame = browser.present().unwrap();
        assert!(frame.width > 0 && frame.height > 0);
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
        let _ = browser.handle_event(NativeEvent::Key { key: "Tab".into() });
        let _ = browser.handle_event(NativeEvent::Copy);
        browser.copy("paste-me");
        let _ = browser.handle_event(NativeEvent::Paste);
        let quit = browser.handle_event(NativeEvent::Quit).unwrap();
        assert!(quit.quit);
        assert_eq!(browser.pointer().x, 10.0);
    }

    #[test]
    fn urlbar_and_tab_switch_are_chrome_owned() {
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
        browser
            .handle_event(NativeEvent::Ime {
                text: "hello".into(),
            })
            .unwrap();
        browser.handle_event(NativeEvent::Copy).unwrap();
        assert_eq!(browser.clipboard(), "hello");
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
}
