//! Native-only browser shell (VEC-014).
//!
//! Privileged chrome (tabs, title, clipboard, permissions, accessibility)
//! lives here, not in the document. Page content cannot spoof chrome. No
//! Chromium/Electron is required: every tab is a [`crate::VectorEngine`] page.
//! Input from a human OS window and from an agent share [`NativeBrowser::handle_event`].

use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use ve_core::{Error, Point, Result, process_rss_bytes};
use ve_gfx::Frame;

use crate::{
    EngineConfig, ExecuteRequest, ExecuteResult, Observation, ObservationRequest, OpenRequest,
    PageId, Program, VectorEngine,
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
    /// Copy: no-op on chrome besides keeping clipboard (page cannot steal).
    Copy,
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
        }
    }

    /// Backend identity: custom engine, never Chromium.
    #[must_use]
    pub fn identity(&self) -> serde_json::Value {
        serde_json::json!({
            "backend": "vector-engine",
            "chromium": false,
            "electron": false,
            "chromeTitle": Self::CHROME_TITLE,
            "tabs": self.tabs.len(),
            "rssBytes": process_rss_bytes(),
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
                    name: tab.url.clone(),
                    from_page: false,
                });
            }
        }
        nodes
    }

    /// Chrome names joined for a screen-reader summary. Page content is omitted.
    #[must_use]
    pub fn screen_reader_text(&self) -> String {
        self.chrome_ax()
            .into_iter()
            .map(|n| n.name)
            .collect::<Vec<_>>()
            .join(" ")
    }

    /// Signed-update channel. Not implemented; reported honestly.
    #[must_use]
    pub fn update_status(&self) -> serde_json::Value {
        serde_json::json!({
            "signedUpdates": false,
            "channel": "dev",
            "current": env!("CARGO_PKG_VERSION"),
        })
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
        self.surface = self.engine.page_mut(page)?.present_frame(false)?;
        Ok(&self.surface)
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
                let _ = self.present();
            }
            NativeEvent::CloseTab => {
                if !self.tabs.is_empty() {
                    let tab = self.tabs.remove(self.active);
                    let _ = self.engine.close(tab.page);
                    if self.active >= self.tabs.len() {
                        self.active = self.tabs.len().saturating_sub(1);
                    }
                }
            }
            NativeEvent::Navigate { url } => {
                if let Some(tab) = self.tabs.get_mut(self.active) {
                    tab.url.clone_from(&url);
                    let _ = self.execute_active(Program::from_value(serde_json::json!([
                        {"id":"n","op":"navigate","url":url}
                    ]))?);
                    let _ = self.present();
                }
            }
            NativeEvent::Key { key } => {
                let _ = self.press_key(&key);
                let _ = self.present();
            }
            NativeEvent::Ime { text } => {
                let _ = self.execute_active(Program::from_value(serde_json::json!([
                    {"id":"t","op":"type","target":"css:input,textarea,[contenteditable]","value":text}
                ]))?);
                let _ = self.present();
            }
            NativeEvent::PointerMove { x, y } => {
                self.pointer = Point::new(x, y);
            }
            NativeEvent::PointerDown { x, y, button } => {
                self.pointer = Point::new(x, y);
                let _ = self.execute_active(Program::from_value(serde_json::json!([
                    {"id":"c","op":"clickPoint","x":x,"y":y,"button": if button == 0 { "left" } else { "right" }}
                ]))?);
                let _ = self.present();
            }
            NativeEvent::PointerUp { x, y, .. } => {
                self.pointer = Point::new(x, y);
            }
            NativeEvent::Copy => {}
            NativeEvent::Paste => {
                let text = self.clipboard.clone();
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

    /// Clipboard (chrome-owned).
    pub fn copy(&mut self, text: &str) {
        text.clone_into(&mut self.clipboard);
    }

    /// Clipboard contents.
    #[must_use]
    pub fn clipboard(&self) -> &str {
        &self.clipboard
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
        assert_eq!(id["backend"], "vector-engine");
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
}
