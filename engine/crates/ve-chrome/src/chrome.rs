//! Retained Arc-style chrome: sidebar, command bar, inset stage, agent rail.

use ve_core::{Point, Rect, Size};
use ve_gfx::{DisplayItem, DisplayList, TextRun};
use ve_style::{FontFamily, FontStyle, FontWeight, Rgba};

use crate::intent::{detect_intent, intent_label, Intent, IntentContext};
use crate::tokens::{ChromeMetrics, ChromeTheme, ChromeTokens};
use crate::workspace::{host_of, Layout};

/// One sidebar / stage tab.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ChromeTab {
    /// Page id (string form of the engine page).
    pub page_id: String,
    /// Title (untrusted).
    pub title: String,
    /// URL.
    pub url: String,
    /// Selected.
    pub active: bool,
    /// Backend badge: `engine` or `chromium`.
    pub backend: ChromeBackend,
}

/// Page backend shown in the stage badge.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ChromeBackend {
    /// Own engine.
    Engine,
    /// Chromium host (sites the engine cannot run).
    Chromium,
}

/// Overlay surfaces (portalled siblings in the Electron shell).
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ChromeOverlay {
    /// None.
    #[default]
    None,
    /// ⌘K palette.
    Palette,
    /// Settings.
    Settings,
    /// History.
    History,
    /// Certificate interstitial.
    Cert,
    /// Permission prompt (never granted by page text).
    Permission,
}

/// Hit-test result in CSS window space.
#[derive(Clone, Debug, PartialEq)]
pub enum ChromeHit {
    /// Empty chrome chrome (gutter).
    Window,
    /// Space switcher.
    Space {
        /// Space id.
        id: String,
    },
    /// Sidebar tab row.
    Tab {
        /// Page id.
        page_id: String,
    },
    /// Pin tile.
    Pin {
        /// URL.
        url: String,
    },
    /// New tab.
    NewTab,
    /// Command bar (focus + type).
    CommandBar,
    /// Sidebar collapse / expand.
    SidebarToggle,
    /// Sidebar width drag.
    SidebarResize,
    /// Agent rail resize.
    RailResize,
    /// Agent rail toggle.
    RailToggle,
    /// Find field.
    Find,
    /// Zoom chip.
    Zoom,
    /// Overlay chrome.
    Overlay(ChromeOverlay),
    /// Certificate interstitial (Proceed / Block).
    CertProceed,
    /// Certificate interstitial block.
    CertBlock,
    /// Permission sheet allow.
    PermissionAllow,
    /// Permission sheet deny.
    PermissionDeny,
    /// Stage card; coordinates are page-local CSS px.
    Stage {
        /// Page X.
        x: f32,
        /// Page Y.
        y: f32,
    },
}

/// Widget tree for the primary window chrome.
#[derive(Clone, Debug)]
pub struct Chrome {
    /// Appearance.
    pub theme: ChromeTheme,
    /// Tokens for `theme`.
    pub tokens: ChromeTokens,
    /// Metrics.
    pub metrics: ChromeMetrics,
    /// Sidebar organisation.
    pub layout: Layout,
    /// Visible tabs (all spaces; layout filters).
    pub tabs: Vec<ChromeTab>,
    /// Command-bar text.
    pub command: String,
    /// Command bar focused.
    pub command_focused: bool,
    /// Find query (empty hides the bar).
    pub find: String,
    /// Find visible.
    pub find_open: bool,
    /// Page zoom (1.0 = 100%).
    pub zoom: f32,
    /// Sidebar collapsed to a rail.
    pub sidebar_collapsed: bool,
    /// Sidebar width (user-resized).
    pub sidebar_width: f32,
    /// Agent rail width.
    pub rail_width: f32,
    /// Agent rail visible.
    pub rail_open: bool,
    /// Overlay.
    pub overlay: ChromeOverlay,
    /// Agent status line.
    pub agent_status: String,
    /// Engine / Chromium badge for the active tab.
    pub backend: ChromeBackend,
    /// History rows `(url, title)` shown in the History overlay.
    pub history: Vec<(String, String)>,
    /// Bookmarks `(url, title)` shown in Settings.
    pub bookmarks: Vec<(String, String)>,
    /// Downloads listed in Settings.
    pub download_names: Vec<String>,
    /// Sheet title (cert host or permission effect).
    pub sheet_title: String,
    /// Sheet body (fingerprint or origin).
    pub sheet_body: String,
}

impl Default for Chrome {
    fn default() -> Self {
        Self {
            theme: ChromeTheme::Dark,
            tokens: ChromeTokens::default(),
            metrics: ChromeMetrics::default(),
            layout: crate::workspace::empty_layout(),
            tabs: Vec::new(),
            command: String::new(),
            command_focused: false,
            find: String::new(),
            find_open: false,
            zoom: 1.0,
            sidebar_collapsed: false,
            sidebar_width: ChromeMetrics::default().sidebar_w,
            rail_width: ChromeMetrics::default().rail_w,
            rail_open: true,
            overlay: ChromeOverlay::None,
            agent_status: String::new(),
            backend: ChromeBackend::Engine,
            history: Vec::new(),
            bookmarks: Vec::new(),
            download_names: Vec::new(),
            sheet_title: String::new(),
            sheet_body: String::new(),
        }
    }
}

impl Chrome {
    /// Applies `theme` and refreshes tokens.
    pub fn set_theme(&mut self, theme: ChromeTheme) {
        self.theme = theme;
        self.tokens = ChromeTokens::for_theme(theme);
    }

    /// Sidebar width actually used (rail when collapsed).
    #[must_use]
    pub fn sidebar_used(&self) -> f32 {
        if self.sidebar_collapsed {
            self.metrics.sidebar_rail_w
        } else {
            self.sidebar_width.max(self.metrics.sidebar_rail_w)
        }
    }

    /// Agent rail width actually used.
    #[must_use]
    pub fn rail_used(&self) -> f32 {
        if self.rail_open {
            self.rail_width.max(200.0)
        } else {
            0.0
        }
    }

    /// Stage card in window CSS px (inset rounded page host).
    #[must_use]
    pub fn stage_rect(&self, window: Size) -> Rect {
        let sb = self.sidebar_used();
        let rail = self.rail_used();
        let toolbar = if self.sidebar_collapsed {
            self.metrics.toolbar_h
        } else {
            0.0
        };
        let inset = self.metrics.stage_inset;
        let x = sb + inset;
        let y = toolbar + inset;
        let w = (window.width - sb - rail - inset * 2.0).max(1.0);
        let h = (window.height - toolbar - inset * 2.0).max(1.0);
        Rect::new(x, y, w, h)
    }

    /// Detected intent for the current command field.
    #[must_use]
    pub fn intent(&self) -> Intent {
        detect_intent(
            &self.command,
            IntentContext {
                has_page: self.tabs.iter().any(|t| t.active && !t.url.is_empty()),
                search_engine: None,
            },
        )
    }

    /// Hit-test window CSS coordinates.
    #[must_use]
    pub fn hit(&self, window: Size, x: f32, y: f32) -> ChromeHit {
        if self.overlay != ChromeOverlay::None {
            return self.hit_overlay(window, x, y);
        }
        let sb = self.sidebar_used();
        if x <= sb + 4.0 && x >= sb - 4.0 && !self.sidebar_collapsed {
            return ChromeHit::SidebarResize;
        }
        if self.rail_open {
            let rail_x = window.width - self.rail_used();
            if x >= rail_x - 4.0 && x <= rail_x + 4.0 {
                return ChromeHit::RailResize;
            }
        }
        if x < sb {
            return self.hit_sidebar(y);
        }
        let stage = self.stage_rect(window);
        if stage.contains(Point::new(x, y)) {
            return ChromeHit::Stage {
                x: x - stage.x(),
                y: y - stage.y(),
            };
        }
        if self.rail_open && x > window.width - self.rail_used() {
            return ChromeHit::RailToggle;
        }
        if self.sidebar_collapsed && y < self.metrics.toolbar_h {
            if x < sb + 80.0 {
                return ChromeHit::CommandBar;
            }
            return ChromeHit::SidebarToggle;
        }
        ChromeHit::Window
    }

    fn hit_overlay(&self, window: Size, x: f32, y: f32) -> ChromeHit {
        let card = overlay_card(window);
        match self.overlay {
            ChromeOverlay::Cert => {
                if y > card.y() + 200.0 && y < card.y() + 240.0 {
                    if x < card.x() + card.width() * 0.5 {
                        return ChromeHit::CertBlock;
                    }
                    return ChromeHit::CertProceed;
                }
            }
            ChromeOverlay::Permission => {
                if y > card.y() + 200.0 && y < card.y() + 240.0 {
                    if x < card.x() + card.width() * 0.5 {
                        return ChromeHit::PermissionDeny;
                    }
                    return ChromeHit::PermissionAllow;
                }
            }
            _ => {}
        }
        ChromeHit::Overlay(self.overlay)
    }

    fn hit_sidebar(&self, y: f32) -> ChromeHit {
        if y < 48.0 {
            return ChromeHit::Space {
                id: self.layout.active_space_id.clone(),
            };
        }
        if y < 48.0 + 56.0 {
            if let Some((_, pins)) = self
                .layout
                .pins
                .iter()
                .find(|(id, _)| id == &self.layout.active_space_id)
                && let Some(pin) = pins.first()
            {
                return ChromeHit::Pin {
                    url: pin.url.clone(),
                };
            }
        }
        let cmd_y = 48.0 + 56.0 + 8.0;
        if (cmd_y..cmd_y + self.metrics.control_h + 8.0).contains(&y) {
            return ChromeHit::CommandBar;
        }
        let tabs_y = cmd_y + self.metrics.control_h + 16.0;
        if y < tabs_y + self.metrics.row_h {
            return ChromeHit::NewTab;
        }
        let mut row = tabs_y + self.metrics.row_h;
        for tab in self.tabs_for_active_space() {
            if (row..row + self.metrics.row_h).contains(&y) {
                return ChromeHit::Tab {
                    page_id: tab.page_id.clone(),
                };
            }
            row += self.metrics.row_h;
        }
        if y > 600.0 {
            return ChromeHit::SidebarToggle;
        }
        ChromeHit::Window
    }

    fn tabs_for_active_space(&self) -> Vec<&ChromeTab> {
        let space = &self.layout.active_space_id;
        let assigned: Vec<&str> = self
            .layout
            .tab_space
            .iter()
            .filter(|(_, s)| s == space)
            .map(|(id, _)| id.as_str())
            .collect();
        if assigned.is_empty() {
            return self.tabs.iter().collect();
        }
        self.tabs
            .iter()
            .filter(|t| assigned.iter().any(|id| *id == t.page_id))
            .collect()
    }

    /// Paints chrome into a display list sized to `window`.
    #[must_use]
    pub fn paint(&self, window: Size) -> DisplayList {
        let mut list = DisplayList::new(window);
        let t = &self.tokens;
        list.push(DisplayItem::Rect {
            rect: Rect::new(0.0, 0.0, window.width, window.height),
            color: t.bg_window,
        });
        self.paint_sidebar(&mut list, window);
        if self.sidebar_collapsed {
            self.paint_toolbar(&mut list, window);
        }
        self.paint_stage(&mut list, window);
        if self.rail_open {
            self.paint_rail(&mut list, window);
        }
        if self.find_open {
            self.paint_find(&mut list, window);
        }
        if self.overlay != ChromeOverlay::None {
            self.paint_overlay(&mut list, window);
        }
        list
    }

    fn paint_sidebar(&self, list: &mut DisplayList, window: Size) {
        let sb = self.sidebar_used();
        let t = &self.tokens;
        list.push(DisplayItem::Rect {
            rect: Rect::new(0.0, 0.0, sb, window.height),
            color: t.sb_bg,
        });
        list.push(DisplayItem::Rect {
            rect: Rect::new(sb - 1.0, 0.0, 1.0, window.height),
            color: t.line,
        });
        if self.sidebar_collapsed {
            self.label(list, Point::new(18.0, 32.0), "V", 15.0, t.sb_ink_0);
            return;
        }
        let space = self
            .layout
            .spaces
            .iter()
            .find(|s| s.id == self.layout.active_space_id)
            .map_or("Personal", |s| s.name.as_str());
        self.label(list, Point::new(16.0, 30.0), space, 13.0, t.sb_ink_0);

        let mut pin_x = 16.0;
        if let Some((_, pins)) = self
            .layout
            .pins
            .iter()
            .find(|(id, _)| id == &self.layout.active_space_id)
        {
            for pin in pins.iter().take(5) {
                list.push(DisplayItem::RoundedClip {
                    rect: Rect::new(pin_x, 48.0, 40.0, 40.0),
                    radius: 10.0,
                });
                list.push(DisplayItem::Rect {
                    rect: Rect::new(pin_x, 48.0, 40.0, 40.0),
                    color: t.sb_pin_face,
                });
                list.push(DisplayItem::PopClip);
                let letter = host_of(&pin.url)
                    .chars()
                    .next()
                    .unwrap_or('·')
                    .to_ascii_uppercase()
                    .to_string();
                self.label(list, Point::new(pin_x + 14.0, 74.0), &letter, 13.0, t.sb_ink_0);
                pin_x += 48.0;
            }
        }

        let cmd_y = 104.0;
        list.push(DisplayItem::RoundedClip {
            rect: Rect::new(12.0, cmd_y, sb - 24.0, self.metrics.control_h),
            radius: 8.0,
        });
        list.push(DisplayItem::Rect {
            rect: Rect::new(12.0, cmd_y, sb - 24.0, self.metrics.control_h),
            color: t.sb_field,
        });
        list.push(DisplayItem::PopClip);
        let cmd = if self.command.is_empty() {
            "Search or ask"
        } else {
            self.command.as_str()
        };
        let cmd_color = if self.command.is_empty() {
            t.ink_2
        } else {
            t.sb_ink_0
        };
        self.label(
            list,
            Point::new(20.0, cmd_y + 19.0),
            cmd,
            12.0,
            cmd_color,
        );
        if self.command_focused && !self.command.is_empty() {
            let chip = intent_label(&self.intent());
            if !chip.is_empty() {
                self.label(
                    list,
                    Point::new(sb - 110.0, cmd_y + 19.0),
                    chip,
                    11.0,
                    t.ink_1,
                );
            }
        }

        let mut y = cmd_y + self.metrics.control_h + 16.0;
        self.label(list, Point::new(16.0, y + 18.0), "New Tab", 12.0, t.sb_ink_1);
        y += self.metrics.row_h;
        for tab in self.tabs_for_active_space() {
            if tab.active {
                list.push(DisplayItem::RoundedClip {
                    rect: Rect::new(8.0, y, sb - 16.0, self.metrics.row_h),
                    radius: 8.0,
                });
                list.push(DisplayItem::Rect {
                    rect: Rect::new(8.0, y, sb - 16.0, self.metrics.row_h),
                    color: t.sb_selected,
                });
                list.push(DisplayItem::PopClip);
            }
            let title = if tab.title.is_empty() {
                host_of(&tab.url)
            } else {
                tab.title.clone()
            };
            let ink = if tab.active {
                t.sb_selected_ink
            } else {
                t.sb_ink_0
            };
            self.label(list, Point::new(16.0, y + 20.0), &truncate(&title, 28), 12.0, ink);
            y += self.metrics.row_h;
        }
        self.label(
            list,
            Point::new(16.0, window.height - 20.0),
            "Vector",
            11.0,
            t.sb_ink_1,
        );
    }

    fn paint_toolbar(&self, list: &mut DisplayList, window: Size) {
        let t = &self.tokens;
        let sb = self.sidebar_used();
        let rail = self.rail_used();
        list.push(DisplayItem::Rect {
            rect: Rect::new(sb, 0.0, window.width - sb - rail, self.metrics.toolbar_h),
            color: t.bg_window,
        });
        let cmd = if self.command.is_empty() {
            self.tabs
                .iter()
                .find(|tab| tab.active)
                .map(|tab| tab.url.as_str())
                .unwrap_or("Search or ask")
        } else {
            self.command.as_str()
        };
        list.push(DisplayItem::RoundedClip {
            rect: Rect::new(sb + 80.0, 12.0, window.width - sb - rail - 160.0, 28.0),
            radius: 8.0,
        });
        list.push(DisplayItem::Rect {
            rect: Rect::new(sb + 80.0, 12.0, window.width - sb - rail - 160.0, 28.0),
            color: t.sb_field,
        });
        list.push(DisplayItem::PopClip);
        self.label(list, Point::new(sb + 92.0, 31.0), cmd, 12.0, t.ink_0);
    }

    fn paint_stage(&self, list: &mut DisplayList, window: Size) {
        let t = &self.tokens;
        let stage = self.stage_rect(window);
        list.push(DisplayItem::BoxShadow {
            rect: stage,
            dx: 0.0,
            dy: 8.0,
            blur: 28.0,
            color: Rgba::rgba(0, 0, 0, 0.28),
        });
        list.push(DisplayItem::RoundedClip {
            rect: stage,
            radius: self.metrics.stage_radius,
        });
        list.push(DisplayItem::Rect {
            rect: stage,
            color: t.stage_bg,
        });
        list.push(DisplayItem::PopClip);
        let badge = match self.backend {
            ChromeBackend::Engine => "Vector Engine",
            ChromeBackend::Chromium => "Chromium",
        };
        self.label(
            list,
            Point::new(stage.x() + 12.0, stage.y() + 18.0),
            badge,
            11.0,
            t.engine,
        );
    }

    fn paint_rail(&self, list: &mut DisplayList, window: Size) {
        let t = &self.tokens;
        let w = self.rail_used();
        let x = window.width - w;
        list.push(DisplayItem::Rect {
            rect: Rect::new(x, 0.0, w, window.height),
            color: t.bg_0,
        });
        list.push(DisplayItem::Rect {
            rect: Rect::new(x, 0.0, 1.0, window.height),
            color: t.line,
        });
        self.label(list, Point::new(x + 16.0, 28.0), "Agent", 13.0, t.ink_0);
        let status = if self.agent_status.is_empty() {
            "Ready"
        } else {
            self.agent_status.as_str()
        };
        self.label(list, Point::new(x + 16.0, 52.0), status, 12.0, t.ink_1);
        list.push(DisplayItem::RoundedClip {
            rect: Rect::new(x + 12.0, window.height - 56.0, w - 24.0, 36.0),
            radius: 8.0,
        });
        list.push(DisplayItem::Rect {
            rect: Rect::new(x + 12.0, window.height - 56.0, w - 24.0, 36.0),
            color: t.sb_field,
        });
        list.push(DisplayItem::PopClip);
        self.label(
            list,
            Point::new(x + 24.0, window.height - 32.0),
            "Ask the page…",
            12.0,
            t.ink_2,
        );
    }

    fn paint_find(&self, list: &mut DisplayList, window: Size) {
        let t = &self.tokens;
        let stage = self.stage_rect(window);
        let bar = Rect::new(stage.x() + 12.0, stage.y() + 8.0, 280.0, 28.0);
        list.push(DisplayItem::RoundedClip {
            rect: bar,
            radius: 8.0,
        });
        list.push(DisplayItem::Rect {
            rect: bar,
            color: t.sb_field,
        });
        list.push(DisplayItem::PopClip);
        let q = if self.find.is_empty() {
            "Find in page"
        } else {
            self.find.as_str()
        };
        self.label(list, Point::new(bar.x() + 10.0, bar.y() + 19.0), q, 12.0, t.ink_0);
        self.label(
            list,
            Point::new(bar.x() + 200.0, bar.y() + 19.0),
            &format!("{:.0}%", self.zoom * 100.0),
            11.0,
            t.ink_1,
        );
    }

    fn paint_overlay(&self, list: &mut DisplayList, window: Size) {
        let t = &self.tokens;
        list.push(DisplayItem::Rect {
            rect: Rect::new(0.0, 0.0, window.width, window.height),
            color: Rgba::rgba(0, 0, 0, 0.35),
        });
        let card = Rect::new(window.width * 0.5 - 240.0, 80.0, 480.0, 320.0);
        list.push(DisplayItem::RoundedClip {
            rect: card,
            radius: 16.0,
        });
        list.push(DisplayItem::Rect {
            rect: card,
            color: t.bg_0,
        });
        list.push(DisplayItem::PopClip);
        let title = match self.overlay {
            ChromeOverlay::Palette => "Command palette",
            ChromeOverlay::Settings => "Settings",
            ChromeOverlay::History => "History",
            ChromeOverlay::Cert => "Certificate warning",
            ChromeOverlay::Permission => "Permission",
            ChromeOverlay::None => "",
        };
        self.label(
            list,
            Point::new(card.x() + 20.0, card.y() + 32.0),
            title,
            15.0,
            t.ink_0,
        );
        match self.overlay {
            ChromeOverlay::History => {
                let mut y = card.y() + 64.0;
                for (url, title) in self.history.iter().rev().take(8) {
                    let line = if title.is_empty() {
                        url.as_str()
                    } else {
                        title.as_str()
                    };
                    self.label(list, Point::new(card.x() + 20.0, y), &truncate(line, 42), 12.0, t.ink_1);
                    y += 22.0;
                }
                if self.history.is_empty() {
                    self.label(list, Point::new(card.x() + 20.0, y), "No history yet", 12.0, t.ink_2);
                }
            }
            ChromeOverlay::Settings => {
                self.label(
                    list,
                    Point::new(card.x() + 20.0, card.y() + 64.0),
                    &format!("{} bookmarks · {} downloads", self.bookmarks.len(), self.download_names.len()),
                    12.0,
                    t.ink_1,
                );
            }
            ChromeOverlay::Cert | ChromeOverlay::Permission => {
                if !self.sheet_title.is_empty() {
                    self.label(
                        list,
                        Point::new(card.x() + 20.0, card.y() + 72.0),
                        &self.sheet_title,
                        13.0,
                        t.ink_0,
                    );
                }
                if !self.sheet_body.is_empty() {
                    self.label(
                        list,
                        Point::new(card.x() + 20.0, card.y() + 98.0),
                        &truncate(&self.sheet_body, 48),
                        12.0,
                        t.ink_1,
                    );
                }
                let deny = if self.overlay == ChromeOverlay::Cert {
                    "Block"
                } else {
                    "Deny"
                };
                let allow = if self.overlay == ChromeOverlay::Cert {
                    "Proceed"
                } else {
                    "Allow"
                };
                self.label(list, Point::new(card.x() + 40.0, card.y() + 228.0), deny, 12.0, t.err);
                self.label(list, Point::new(card.x() + 260.0, card.y() + 228.0), allow, 12.0, t.ok);
            }
            ChromeOverlay::Palette => {
                self.label(
                    list,
                    Point::new(card.x() + 20.0, card.y() + 72.0),
                    "Type a URL, search, or ask the agent",
                    12.0,
                    t.ink_1,
                );
            }
            ChromeOverlay::None => {}
        }
    }

    fn label(&self, list: &mut DisplayList, origin: Point, text: &str, size: f32, color: Rgba) {
        list.push(DisplayItem::Text(TextRun {
            origin,
            text: text.to_string(),
            size,
            color,
            weight: FontWeight::NORMAL,
            style: FontStyle::Normal,
            family: vec![FontFamily::SystemUi, FontFamily::SansSerif],
        }));
    }
}

fn overlay_card(window: Size) -> Rect {
    Rect::new(window.width * 0.5 - 240.0, 80.0, 480.0, 320.0)
}

fn truncate(s: &str, max: usize) -> String {
    let mut out = String::new();
    for (i, ch) in s.chars().enumerate() {
        if i >= max {
            out.push('…');
            break;
        }
        out.push(ch);
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::workspace::{empty_layout, Pin};

    fn sample() -> Chrome {
        let mut c = Chrome::default();
        c.tabs.push(ChromeTab {
            page_id: "1".into(),
            title: "Example".into(),
            url: "https://example.test/".into(),
            active: true,
            backend: ChromeBackend::Engine,
        });
        c.layout = empty_layout();
        c.layout.pins[0].1.push(Pin {
            url: "https://example.test/".into(),
            title: "Example".into(),
        });
        c.command = "example.com".into();
        c.command_focused = true;
        c.agent_status = "Idle".into();
        c
    }

    #[test]
    fn paints_sidebar_stage_rail_and_text() {
        let chrome = sample();
        let window = Size::new(1280.0, 720.0);
        let list = chrome.paint(window);
        let texts: Vec<&str> = list
            .items()
            .iter()
            .filter_map(|i| match i {
                DisplayItem::Text(run) => Some(run.text.as_str()),
                _ => None,
            })
            .collect();
        assert!(texts.iter().any(|t| *t == "Personal"), "{texts:?}");
        assert!(texts.iter().any(|t| *t == "Example"), "{texts:?}");
        assert!(texts.iter().any(|t| *t == "Vector Engine"), "{texts:?}");
        assert!(texts.iter().any(|t| *t == "Agent"), "{texts:?}");
        assert!(texts.iter().any(|t| *t == "Open"), "{texts:?}");
        let stage = chrome.stage_rect(window);
        assert!(stage.x() >= 260.0);
        assert!(stage.width() < 1280.0 - 360.0);
        assert!(matches!(
            chrome.hit(window, 20.0, 120.0),
            ChromeHit::CommandBar
        ));
        assert!(matches!(
            chrome.hit(window, stage.x() + 10.0, stage.y() + 40.0),
            ChromeHit::Stage { .. }
        ));
    }

    #[test]
    fn rounded_stage_is_not_a_gray_tab_strip() {
        let chrome = sample();
        let list = chrome.paint(Size::new(1280.0, 720.0));
        assert!(
            list.items()
                .iter()
                .any(|i| matches!(i, DisplayItem::RoundedClip { radius, .. } if *radius >= 16.0))
        );
        assert!(
            list.items()
                .iter()
                .any(|i| matches!(i, DisplayItem::BoxShadow { .. }))
        );
    }

    #[test]
    fn cert_and_permission_sheets_are_not_page_content() {
        let mut chrome = sample();
        chrome.overlay = ChromeOverlay::Cert;
        chrome.sheet_title = "example.test".into();
        chrome.sheet_body = "sha256:aa".into();
        let list = chrome.paint(Size::new(1280.0, 720.0));
        let texts: Vec<&str> = list
            .items()
            .iter()
            .filter_map(|i| match i {
                DisplayItem::Text(run) => Some(run.text.as_str()),
                _ => None,
            })
            .collect();
        assert!(texts.iter().any(|t| *t == "Certificate warning"), "{texts:?}");
        assert!(texts.iter().any(|t| *t == "Block"), "{texts:?}");
        assert!(texts.iter().any(|t| *t == "Proceed"), "{texts:?}");
        chrome.overlay = ChromeOverlay::Permission;
        chrome.sheet_title = "geolocation".into();
        chrome.sheet_body = "https://example.test".into();
        let list = chrome.paint(Size::new(1280.0, 720.0));
        let texts: Vec<&str> = list
            .items()
            .iter()
            .filter_map(|i| match i {
                DisplayItem::Text(run) => Some(run.text.as_str()),
                _ => None,
            })
            .collect();
        assert!(texts.iter().any(|t| *t == "Permission"), "{texts:?}");
        assert!(texts.iter().any(|t| *t == "Allow"), "{texts:?}");
    }

    #[test]
    fn writes_screenshot_match_regions() {
        let chrome = sample();
        let window = Size::new(1280.0, 720.0);
        let stage = chrome.stage_rect(window);
        let doc = serde_json::json!({
            "backend": "ve-chrome",
            "theme": "dark",
            "window": { "width": window.width, "height": window.height },
            "sidebar": { "x": 0, "width": chrome.sidebar_used() },
            "stage": { "x": stage.x(), "y": stage.y(), "width": stage.width(), "height": stage.height(), "radius": chrome.metrics.stage_radius },
            "rail": { "width": chrome.rail_used() },
            "commandBar": true,
            "matches": "docs/ui/shell.md Arc sidebar + command bar + inset stage + agent rail"
        });
        let dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../../docs/ui/screenshots");
        let _ = std::fs::create_dir_all(&dir);
        std::fs::write(dir.join("ve-chrome-regions.json"), serde_json::to_vec_pretty(&doc).unwrap())
            .unwrap();
    }
}
