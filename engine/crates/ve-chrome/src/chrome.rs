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
    /// Downloads.
    Downloads,
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
    /// A command in the ⌘K palette.
    PaletteCommand {
        /// Stable command id (`new`, `rail`, `find`, …).
        id: String,
    },
    /// A history row (navigate).
    HistoryItem {
        /// URL to open.
        url: String,
    },
    /// Settings theme: dark.
    ThemeDark,
    /// Settings theme: light.
    ThemeLight,
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
    /// Active find match (1-based; 0 when none).
    pub find_active: u32,
    /// Total find matches on the current page.
    pub find_matches: u32,
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
    /// Why the active tab is on this backend (never a silent swap).
    pub route_reason: String,
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
            find_active: 0,
            find_matches: 0,
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
            route_reason: String::new(),
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

    /// True when `url` is a new-tab / start document (no live page to composite).
    #[must_use]
    pub fn is_start_url(url: &str) -> bool {
        is_start_url(url)
    }

    /// True when the active tab is a new-tab / start page (no live document).
    #[must_use]
    pub fn shows_start_page(&self) -> bool {
        self.tabs
            .iter()
            .find(|t| t.active)
            .map_or(true, |t| is_start_url(&t.url))
    }

    /// Stage card in window CSS px (inset rounded page host).
    #[must_use]
    pub fn stage_rect(&self, window: Size) -> Rect {
        let sb = self.sidebar_used();
        let rail = self.rail_used();
        let toolbar = self.metrics.toolbar_h;
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
        if y < self.metrics.toolbar_h && x > sb && x < window.width - self.rail_used() {
            return ChromeHit::CommandBar;
        }
        ChromeHit::Window
    }

    fn hit_overlay(&self, window: Size, x: f32, y: f32) -> ChromeHit {
        let p = Point::new(x, y);
        match self.overlay {
            ChromeOverlay::Palette => {
                let card = palette_card(window);
                for (id, row) in self.palette_rows(&card) {
                    if row.contains(p) {
                        return ChromeHit::PaletteCommand { id };
                    }
                }
                ChromeHit::Overlay(ChromeOverlay::Palette)
            }
            ChromeOverlay::History => {
                let card = palette_card(window);
                for (url, row) in self.history_rows(&card) {
                    if row.contains(p) {
                        return ChromeHit::HistoryItem { url };
                    }
                }
                ChromeHit::Overlay(ChromeOverlay::History)
            }
            ChromeOverlay::Settings => {
                let drawer = settings_drawer(window);
                let dark = settings_theme_rect(&drawer, true);
                let light = settings_theme_rect(&drawer, false);
                if dark.contains(p) {
                    return ChromeHit::ThemeDark;
                }
                if light.contains(p) {
                    return ChromeHit::ThemeLight;
                }
                ChromeHit::Overlay(ChromeOverlay::Settings)
            }
            ChromeOverlay::Downloads => ChromeHit::Overlay(ChromeOverlay::Downloads),
            ChromeOverlay::Cert => {
                let card = overlay_card(window);
                if y > card.y() + 200.0 && y < card.y() + 240.0 {
                    if x < card.x() + card.width() * 0.5 {
                        return ChromeHit::CertBlock;
                    }
                    return ChromeHit::CertProceed;
                }
                ChromeHit::Overlay(ChromeOverlay::Cert)
            }
            ChromeOverlay::Permission => {
                let card = overlay_card(window);
                if y > card.y() + 200.0 && y < card.y() + 240.0 {
                    if x < card.x() + card.width() * 0.5 {
                        return ChromeHit::PermissionDeny;
                    }
                    return ChromeHit::PermissionAllow;
                }
                ChromeHit::Overlay(ChromeOverlay::Permission)
            }
            ChromeOverlay::None => ChromeHit::Window,
        }
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
        let tabs_y = 48.0 + 56.0 + 8.0;
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
        let mut list = self.paint_base(window);
        self.append_overlay(&mut list, window);
        list
    }

    /// Chrome without the overlay layer (page blit goes between).
    #[must_use]
    pub fn paint_base(&self, window: Size) -> DisplayList {
        let mut list = DisplayList::new(window);
        let t = &self.tokens;
        list.push(DisplayItem::Rect {
            rect: Rect::new(0.0, 0.0, window.width, window.height),
            color: t.bg_window,
        });
        self.paint_sidebar(&mut list, window);
        self.paint_toolbar(&mut list, window);
        self.paint_stage(&mut list, window);
        if self.rail_open {
            self.paint_rail(&mut list, window);
        }
        if self.find_open {
            self.paint_find(&mut list, window);
        }
        list
    }

    /// Overlay scrim + card on top of an existing list.
    pub fn append_overlay(&self, list: &mut DisplayList, window: Size) {
        if self.overlay != ChromeOverlay::None {
            self.paint_overlay(list, window);
        }
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
        self.label(
            list,
            Point::new(16.0, 30.0),
            space,
            13.0,
            t.sb_ink_0,
        );

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
                    .unwrap_or('?')
                    .to_ascii_uppercase()
                    .to_string();
                self.label(list, Point::new(pin_x + 14.0, 74.0), &letter, 13.0, t.sb_ink_0);
                pin_x += 48.0;
            }
        }

        let mut y = 104.0;
        self.label(list, Point::new(16.0, y + 18.0), "+ New Tab", 12.0, t.sb_ink_1);
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
        let main_w = (window.width - sb - rail).max(1.0);
        list.push(DisplayItem::Rect {
            rect: Rect::new(sb, 0.0, main_w, self.metrics.toolbar_h),
            color: t.bg_window,
        });
        let pill_w = (main_w - 48.0).min(640.0);
        let pill_x = sb + ((main_w - pill_w) / 2.0).max(16.0);
        let pill = Rect::new(pill_x, 10.0, pill_w, 32.0);
        list.push(DisplayItem::RoundedClip {
            rect: pill,
            radius: 16.0,
        });
        list.push(DisplayItem::Rect {
            rect: pill,
            color: t.sb_field,
        });
        list.push(DisplayItem::PopClip);
        let active = self.tabs.iter().find(|tab| tab.active);
        let cmd = if !self.command.is_empty() {
            self.command.as_str()
        } else if active.is_some_and(|tab| !is_start_url(&tab.url)) {
            active.map(|tab| tab.url.as_str()).unwrap_or("")
        } else {
            "Search, enter an address, or ask the agent"
        };
        self.label(list, Point::new(pill.x() + 16.0, 31.0), cmd, 12.0, t.ink_2);
        if self.command_focused && !self.command.is_empty() {
            let chip = intent_label(&self.intent());
            if !chip.is_empty() {
                self.label(
                    list,
                    Point::new(pill.right() - 72.0, 31.0),
                    chip,
                    11.0,
                    t.ink_1,
                );
            }
        }
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
        if self.shows_start_page() {
            self.paint_start_page(list, stage);
            return;
        }
        let badge = match self.backend {
            ChromeBackend::Engine => "Vector Engine",
            ChromeBackend::Chromium => "Chromium",
        };
        self.label(
            list,
            Point::new(stage.x() + 12.0, stage.y() + 18.0),
            badge,
            12.0,
            t.engine,
        );
        if !self.route_reason.is_empty() {
            self.label(
                list,
                Point::new(stage.x() + 12.0, stage.y() + 36.0),
                &truncate(&self.route_reason, 42),
                12.0,
                t.ink_2,
            );
        }
    }

    fn paint_start_page(&self, list: &mut DisplayList, stage: Rect) {
        let t = &self.tokens;
        let hour = current_hour();
        let greeting = if hour < 5 {
            "Late night."
        } else if hour < 12 {
            "Good morning."
        } else if hour < 18 {
            "Good afternoon."
        } else {
            "Good evening."
        };
        self.label(
            list,
            Point::new(stage.x() + 48.0, stage.y() + 56.0),
            greeting,
            28.0,
            t.ink_0,
        );
        self.label(
            list,
            Point::new(stage.x() + 48.0, stage.y() + 80.0),
            &today_label(),
            13.0,
            t.ink_2,
        );
        let hero = Rect::new(stage.x() + 48.0, stage.y() + 128.0, (stage.width() - 96.0).min(520.0), 36.0);
        list.push(DisplayItem::RoundedClip {
            rect: hero,
            radius: 18.0,
        });
        list.push(DisplayItem::Rect {
            rect: hero,
            color: t.sb_field,
        });
        list.push(DisplayItem::PopClip);
        let hero_text = if self.command.is_empty() || is_start_url(&self.command) {
            "Search, enter an address, or ask the agent"
        } else {
            self.command.as_str()
        };
        self.label(
            list,
            Point::new(hero.x() + 16.0, hero.y() + 24.0),
            hero_text,
            13.0,
            t.ink_2,
        );
        let prompts = [
            "Summarise the open review comments on this PR",
            "Find the cheapest plan with SSO across these pricing pages",
            "Collect every talk title on this schedule into a table",
        ];
        let mut y = hero.y() + 56.0;
        for prompt in prompts {
            list.push(DisplayItem::RoundedClip {
                rect: Rect::new(hero.x(), y, hero.width(), 28.0),
                radius: 8.0,
            });
            list.push(DisplayItem::Rect {
                rect: Rect::new(hero.x(), y, hero.width(), 28.0),
                color: t.bg_0,
            });
            list.push(DisplayItem::PopClip);
            self.label(
                list,
                Point::new(hero.x() + 12.0, y + 19.0),
                prompt,
                12.0,
                t.ink_1,
            );
            y += 34.0;
        }
        y += 16.0;
        let pins = self
            .layout
            .pins
            .iter()
            .find(|(id, _)| id == &self.layout.active_space_id)
            .map(|(_, p)| p.as_slice())
            .unwrap_or(&[]);
        let favs: Vec<(String, String)> = if pins.is_empty() {
            self.bookmarks.iter().take(5).cloned().collect()
        } else {
            pins.iter()
                .take(5)
                .map(|p| (p.url.clone(), p.title.clone()))
                .collect()
        };
        if !favs.is_empty() {
            self.label(
                list,
                Point::new(stage.x() + 48.0, y + 14.0),
                if pins.is_empty() {
                    "Favourites"
                } else {
                    "Pinned"
                },
                12.0,
                t.ink_2,
            );
            y += 28.0;
            let mut x = stage.x() + 48.0;
            for (url, title) in favs {
                list.push(DisplayItem::RoundedClip {
                    rect: Rect::new(x, y, 56.0, 56.0),
                    radius: 14.0,
                });
                list.push(DisplayItem::Rect {
                    rect: Rect::new(x, y, 56.0, 56.0),
                    color: t.sb_pin_face,
                });
                list.push(DisplayItem::PopClip);
                let letter = host_of(&url)
                    .chars()
                    .next()
                    .unwrap_or('?')
                    .to_ascii_uppercase()
                    .to_string();
                self.label(list, Point::new(x + 20.0, y + 36.0), &letter, 16.0, t.ink_0);
                let tile = if title.is_empty() {
                    host_of(&url)
                } else {
                    title
                };
                self.label(
                    list,
                    Point::new(x, y + 76.0),
                    &truncate(&tile, 12),
                    11.0,
                    t.ink_1,
                );
                x += 72.0;
            }
            y += 96.0;
        }
        if !self.history.is_empty() {
            self.label(
                list,
                Point::new(stage.x() + 48.0, y + 14.0),
                "Recent",
                12.0,
                t.ink_2,
            );
            y += 32.0;
            for (url, title) in self.history.iter().take(4) {
                let label = if title.is_empty() {
                    host_of(url)
                } else {
                    title.clone()
                };
                self.label(
                    list,
                    Point::new(stage.x() + 48.0, y),
                    &truncate(&label, 42),
                    12.0,
                    t.ink_0,
                );
                y += 22.0;
            }
        }
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
            "Ask the page...",
            12.0,
            t.ink_2,
        );
    }

    fn paint_find(&self, list: &mut DisplayList, window: Size) {
        let t = &self.tokens;
        let stage = self.stage_rect(window);
        let bar = Rect::new(stage.x() + 12.0, stage.y() + 8.0, 360.0, 32.0);
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
        self.label(list, Point::new(bar.x() + 12.0, bar.y() + 21.0), q, 12.0, t.ink_0);
        let count = if self.find.is_empty() {
            String::new()
        } else if self.find_matches == 0 {
            "No results".to_string()
        } else {
            format!("{} of {}", self.find_active.max(1), self.find_matches)
        };
        if !count.is_empty() {
            self.label(
                list,
                Point::new(bar.x() + 200.0, bar.y() + 21.0),
                &count,
                11.0,
                if self.find_matches == 0 { t.err } else { t.ink_1 },
            );
        }
        self.label(
            list,
            Point::new(bar.x() + 300.0, bar.y() + 21.0),
            "Done",
            11.0,
            t.ink_1,
        );
        self.label(
            list,
            Point::new(bar.right() + 12.0, bar.y() + 21.0),
            &format!("{:.0}%", self.zoom * 100.0),
            11.0,
            t.ink_2,
        );
    }

    fn paint_overlay(&self, list: &mut DisplayList, window: Size) {
        list.push(DisplayItem::Rect {
            rect: Rect::new(0.0, 0.0, window.width, window.height),
            color: Rgba::rgba(0, 0, 0, 0.35),
        });
        match self.overlay {
            ChromeOverlay::Palette => self.paint_palette(list, window),
            ChromeOverlay::Settings => self.paint_settings(list, window),
            ChromeOverlay::History => self.paint_history(list, window),
            ChromeOverlay::Downloads => self.paint_downloads(list, window),
            ChromeOverlay::Cert | ChromeOverlay::Permission => self.paint_sheet(list, window),
            ChromeOverlay::None => {}
        }
    }

    fn paint_palette(&self, list: &mut DisplayList, window: Size) {
        let t = &self.tokens;
        let card = palette_card(window);
        paint_card(list, card, t);
        let field = Rect::new(card.x() + 16.0, card.y() + 14.0, card.width() - 32.0, 40.0);
        list.push(DisplayItem::RoundedClip {
            rect: field,
            radius: 10.0,
        });
        list.push(DisplayItem::Rect {
            rect: field,
            color: t.sb_field,
        });
        list.push(DisplayItem::PopClip);
        self.label(
            list,
            Point::new(field.x() + 14.0, field.y() + 26.0),
            "Type a command, address, or a task for the agent…",
            13.0,
            t.ink_2,
        );
        self.label(
            list,
            Point::new(field.right() - 36.0, field.y() + 26.0),
            "esc",
            11.0,
            t.ink_2,
        );
        let mut last_section = "";
        for (cmd, row) in palette_commands(self)
            .into_iter()
            .zip(self.palette_rows(&card).into_iter().map(|(_, r)| r))
        {
            if cmd.section != last_section {
                self.label(
                    list,
                    Point::new(card.x() + 20.0, row.y() - 6.0),
                    cmd.section,
                    11.0,
                    t.ink_2,
                );
                last_section = cmd.section;
            }
            self.label(
                list,
                Point::new(row.x() + 12.0, row.y() + 21.0),
                cmd.label,
                13.0,
                t.ink_0,
            );
            if !cmd.shortcut.is_empty() {
                self.label(
                    list,
                    Point::new(row.right() - 52.0, row.y() + 21.0),
                    cmd.shortcut,
                    11.0,
                    t.ink_2,
                );
            }
        }
    }

    fn paint_settings(&self, list: &mut DisplayList, window: Size) {
        let t = &self.tokens;
        let drawer = settings_drawer(window);
        paint_card(list, drawer, t);
        self.label(
            list,
            Point::new(drawer.x() + 20.0, drawer.y() + 32.0),
            "Settings",
            16.0,
            t.ink_0,
        );
        self.label(
            list,
            Point::new(drawer.x() + 20.0, drawer.y() + 64.0),
            "Appearance",
            11.0,
            t.ink_2,
        );
        let dark = settings_theme_rect(&drawer, true);
        let light = settings_theme_rect(&drawer, false);
        let dark_on = self.theme == ChromeTheme::Dark;
        list.push(DisplayItem::RoundedClip {
            rect: dark,
            radius: 8.0,
        });
        list.push(DisplayItem::Rect {
            rect: dark,
            color: if dark_on { t.sb_selected } else { t.sb_field },
        });
        list.push(DisplayItem::PopClip);
        list.push(DisplayItem::RoundedClip {
            rect: light,
            radius: 8.0,
        });
        list.push(DisplayItem::Rect {
            rect: light,
            color: if dark_on { t.sb_field } else { t.sb_selected },
        });
        list.push(DisplayItem::PopClip);
        self.label(
            list,
            Point::new(dark.x() + 16.0, dark.y() + 19.0),
            "Dark",
            12.0,
            t.ink_0,
        );
        self.label(
            list,
            Point::new(light.x() + 16.0, light.y() + 19.0),
            "Light",
            12.0,
            t.ink_0,
        );
        self.label(
            list,
            Point::new(drawer.x() + 20.0, drawer.y() + 140.0),
            "Engine",
            11.0,
            t.ink_2,
        );
        self.label(
            list,
            Point::new(drawer.x() + 20.0, drawer.y() + 164.0),
            "Vector Engine",
            13.0,
            t.ink_0,
        );
        self.label(
            list,
            Point::new(drawer.x() + 20.0, drawer.y() + 184.0),
            "Always · own engine for engine tabs",
            12.0,
            t.ink_1,
        );
        self.label(
            list,
            Point::new(drawer.x() + 20.0, drawer.y() + 216.0),
            "Models",
            11.0,
            t.ink_2,
        );
        self.label(
            list,
            Point::new(drawer.x() + 20.0, drawer.y() + 240.0),
            "Planner model",
            13.0,
            t.ink_0,
        );
        self.label(
            list,
            Point::new(drawer.x() + 20.0, drawer.y() + 260.0),
            "Qwen 3.8 27B",
            12.0,
            t.ink_1,
        );
        self.label(
            list,
            Point::new(drawer.x() + 20.0, drawer.y() + 292.0),
            "Agent effects",
            11.0,
            t.ink_2,
        );
        self.label(
            list,
            Point::new(drawer.x() + 20.0, drawer.y() + 316.0),
            "Read  Write  Navigate  Evaluate",
            12.0,
            t.ink_1,
        );
        self.label(
            list,
            Point::new(drawer.x() + 20.0, drawer.y() + 348.0),
            "Browsing",
            11.0,
            t.ink_2,
        );
        self.label(
            list,
            Point::new(drawer.x() + 20.0, drawer.y() + 372.0),
            "Search engine",
            13.0,
            t.ink_0,
        );
        self.label(
            list,
            Point::new(drawer.x() + 20.0, drawer.y() + 392.0),
            "https://duckduckgo.com/?q=%s",
            12.0,
            t.ink_1,
        );
        self.label(
            list,
            Point::new(drawer.x() + 20.0, drawer.y() + 428.0),
            &format!(
                "{} bookmarks · {} downloads · {:.0}% zoom",
                self.bookmarks.len(),
                self.download_names.len(),
                self.zoom * 100.0
            ),
            12.0,
            t.ink_1,
        );
    }

    fn paint_history(&self, list: &mut DisplayList, window: Size) {
        let t = &self.tokens;
        let card = palette_card(window);
        paint_card(list, card, t);
        let field = Rect::new(card.x() + 16.0, card.y() + 14.0, card.width() - 32.0, 40.0);
        list.push(DisplayItem::RoundedClip {
            rect: field,
            radius: 10.0,
        });
        list.push(DisplayItem::Rect {
            rect: field,
            color: t.sb_field,
        });
        list.push(DisplayItem::PopClip);
        self.label(
            list,
            Point::new(field.x() + 14.0, field.y() + 26.0),
            "Search history…",
            13.0,
            t.ink_2,
        );
        self.label(
            list,
            Point::new(card.x() + 20.0, card.y() + 80.0),
            "Today",
            11.0,
            t.ink_2,
        );
        if self.history.is_empty() {
            self.label(
                list,
                Point::new(card.x() + 20.0, card.y() + 110.0),
                "No history yet",
                12.0,
                t.ink_2,
            );
            return;
        }
        for (url, row) in self.history_rows(&card) {
            let title = self
                .history
                .iter()
                .rev()
                .find(|(u, _)| *u == url)
                .map(|(_, t)| t.as_str())
                .unwrap_or("");
            let line = if title.is_empty() { url.as_str() } else { title };
            self.label(
                list,
                Point::new(row.x() + 12.0, row.y() + 18.0),
                &truncate(line, 42),
                13.0,
                t.ink_0,
            );
            self.label(
                list,
                Point::new(row.x() + 12.0, row.y() + 34.0),
                &truncate(&url, 48),
                11.0,
                t.ink_2,
            );
        }
    }

    fn paint_downloads(&self, list: &mut DisplayList, window: Size) {
        let t = &self.tokens;
        let card = palette_card(window);
        paint_card(list, card, t);
        self.label(
            list,
            Point::new(card.x() + 20.0, card.y() + 32.0),
            "Downloads",
            16.0,
            t.ink_0,
        );
        if self.download_names.is_empty() {
            self.label(
                list,
                Point::new(card.x() + 20.0, card.y() + 72.0),
                "No downloads yet",
                12.0,
                t.ink_2,
            );
            return;
        }
        let mut y = card.y() + 72.0;
        for name in self.download_names.iter().rev().take(12) {
            self.label(
                list,
                Point::new(card.x() + 20.0, y),
                &truncate(name, 42),
                13.0,
                t.ink_0,
            );
            y += 28.0;
        }
    }

    fn paint_sheet(&self, list: &mut DisplayList, window: Size) {
        let t = &self.tokens;
        let card = overlay_card(window);
        paint_card(list, card, t);
        let title = if self.overlay == ChromeOverlay::Cert {
            "Certificate warning"
        } else {
            "Permission"
        };
        self.label(
            list,
            Point::new(card.x() + 20.0, card.y() + 32.0),
            title,
            15.0,
            t.ink_0,
        );
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

    fn palette_rows(&self, card: &Rect) -> Vec<(String, Rect)> {
        let mut y = card.y() + 64.0;
        let mut last_section = "";
        let mut out = Vec::new();
        for cmd in palette_commands(self) {
            if cmd.section != last_section {
                y += 22.0;
                last_section = cmd.section;
            }
            out.push((
                cmd.id.to_string(),
                Rect::new(card.x() + 8.0, y, card.width() - 16.0, 32.0),
            ));
            y += 32.0;
        }
        out
    }

    fn history_rows(&self, card: &Rect) -> Vec<(String, Rect)> {
        let mut y = card.y() + 90.0;
        let mut out = Vec::new();
        for (url, _) in self.history.iter().rev().take(10) {
            out.push((url.clone(), Rect::new(card.x() + 8.0, y, card.width() - 16.0, 40.0)));
            y += 40.0;
        }
        out
    }

    fn label(&self, list: &mut DisplayList, origin: Point, text: &str, size: f32, color: Rgba) {
        list.push(DisplayItem::Text(TextRun {
            origin,
            text: text.to_string(),
            size,
            color,
            weight: FontWeight::NORMAL,
            style: FontStyle::Normal,
            family: vec![
                FontFamily::Named("Inter".into()),
                FontFamily::SystemUi,
                FontFamily::SansSerif,
            ],
        }));
    }
}

fn is_start_url(url: &str) -> bool {
    let u = url.trim();
    u.is_empty()
        || u.eq_ignore_ascii_case("about:blank")
        || u.eq_ignore_ascii_case("about:newtab")
        || u.starts_with("vector://new")
}

fn current_hour() -> u32 {
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    ((secs / 3600) % 24) as u32
}

fn today_label() -> String {
    let secs = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    let days = secs / 86_400;
    const WDAYS: [&str; 7] = [
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
    ];
    WDAYS[(days % 7) as usize].to_string()
}

fn overlay_card(window: Size) -> Rect {
    Rect::new(window.width * 0.5 - 240.0, 80.0, 480.0, 320.0)
}

fn palette_card(window: Size) -> Rect {
    let w = 520.0;
    let h = 580.0_f32.min(window.height - 96.0);
    Rect::new(((window.width - w) * 0.5).max(16.0), 72.0, w, h)
}

fn settings_drawer(window: Size) -> Rect {
    let w = 400.0;
    Rect::new(window.width - w - 16.0, 16.0, w, window.height - 32.0)
}

fn settings_theme_rect(drawer: &Rect, dark: bool) -> Rect {
    let x = if dark {
        drawer.x() + 20.0
    } else {
        drawer.x() + 100.0
    };
    Rect::new(x, drawer.y() + 76.0, 72.0, 28.0)
}

fn paint_card(list: &mut DisplayList, card: Rect, t: &ChromeTokens) {
    list.push(DisplayItem::BoxShadow {
        rect: card,
        dx: 0.0,
        dy: 12.0,
        blur: 40.0,
        color: Rgba::rgba(0, 0, 0, 0.45),
    });
    list.push(DisplayItem::RoundedClip {
        rect: card,
        radius: 16.0,
    });
    list.push(DisplayItem::Rect {
        rect: card,
        color: t.bg_0,
    });
    list.push(DisplayItem::PopClip);
}

struct PaletteCmd {
    id: &'static str,
    section: &'static str,
    label: &'static str,
    shortcut: &'static str,
}

fn palette_commands(chrome: &Chrome) -> Vec<PaletteCmd> {
    let rail = if chrome.rail_open {
        "Hide agent rail"
    } else {
        "Show agent rail"
    };
    let hide_sb = if chrome.sidebar_collapsed {
        "Show sidebar"
    } else {
        "Hide sidebar completely"
    };
    vec![
        PaletteCmd {
            id: "rail",
            section: "Agent",
            label: rail,
            shortcut: "⌘⇧A",
        },
        PaletteCmd {
            id: "obs",
            section: "Agent",
            label: "Inspect what the agent sees",
            shortcut: "",
        },
        PaletteCmd {
            id: "collect",
            section: "Agent",
            label: "Collect open tabs into a set",
            shortcut: "",
        },
        PaletteCmd {
            id: "new",
            section: "Window",
            label: "New tab",
            shortcut: "⌘T",
        },
        PaletteCmd {
            id: "ov",
            section: "Window",
            label: "Tab overview",
            shortcut: "⌘⇧O",
        },
        PaletteCmd {
            id: "reload",
            section: "Window",
            label: "Reload page",
            shortcut: "⌘R",
        },
        PaletteCmd {
            id: "hard",
            section: "Window",
            label: "Hard reload",
            shortcut: "⇧⌘R",
        },
        PaletteCmd {
            id: "find",
            section: "Window",
            label: "Find in page",
            shortcut: "⌘F",
        },
        PaletteCmd {
            id: "sb",
            section: "Window",
            label: "Toggle sidebar",
            shortcut: "⌘S",
        },
        PaletteCmd {
            id: "hide-sb",
            section: "Window",
            label: hide_sb,
            shortcut: "",
        },
        PaletteCmd {
            id: "bm",
            section: "Window",
            label: "Bookmark this page",
            shortcut: "⌘D",
        },
        PaletteCmd {
            id: "pin",
            section: "Window",
            label: "Pin this site to the space",
            shortcut: "",
        },
        PaletteCmd {
            id: "split",
            section: "Window",
            label: "Split view with page…",
            shortcut: "",
        },
        PaletteCmd {
            id: "settings",
            section: "Window",
            label: "Settings",
            shortcut: "⌘,",
        },
        PaletteCmd {
            id: "history",
            section: "Window",
            label: "History",
            shortcut: "⌘Y",
        },
        PaletteCmd {
            id: "downloads",
            section: "Window",
            label: "Downloads",
            shortcut: "⌘⇧J",
        },
    ]
}

fn truncate(s: &str, max: usize) -> String {
    let mut out = String::new();
    for (i, ch) in s.chars().enumerate() {
        if i >= max {
            out.push_str("...");
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
    fn start_page_paints_greeting_and_prompts() {
        let chrome = Chrome::default();
        let list = chrome.paint(Size::new(1280.0, 720.0));
        let texts: Vec<&str> = list
            .items()
            .iter()
            .filter_map(|i| match i {
                DisplayItem::Text(run) => Some(run.text.as_str()),
                _ => None,
            })
            .collect();
        assert!(
            texts.iter().any(|t| t.starts_with("Good ") || *t == "Late night."),
            "{texts:?}"
        );
        assert!(
            texts
                .iter()
                .any(|t| t.contains("Search, enter an address")),
            "{texts:?}"
        );
        assert!(
            texts
                .iter()
                .any(|t| t.contains("Summarise the open review comments")),
            "{texts:?}"
        );
    }

    #[test]
    fn paints_sidebar_stage_rail_and_text() {
        let mut chrome = sample();
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
        chrome.backend = ChromeBackend::Chromium;
        chrome.route_reason = "explicit-backend:chromium".into();
        let list = chrome.paint(window);
        let texts: Vec<&str> = list
            .items()
            .iter()
            .filter_map(|i| match i {
                DisplayItem::Text(run) => Some(run.text.as_str()),
                _ => None,
            })
            .collect();
        assert!(texts.iter().any(|t| *t == "Chromium"), "{texts:?}");
        assert!(texts.iter().any(|t| *t == "explicit-backend:chromium"), "{texts:?}");
        assert!(texts.iter().any(|t| *t == "Agent"), "{texts:?}");
        assert!(texts.iter().any(|t| *t == "Open"), "{texts:?}");
        let stage = chrome.stage_rect(window);
        assert!(stage.x() >= 260.0);
        assert!(stage.width() < 1280.0 - 360.0);
        assert!(matches!(
            chrome.hit(window, 520.0, 24.0),
            ChromeHit::CommandBar
        ));
        assert!(
            texts
                .iter()
                .any(|t| t.contains("Search, enter an address, or ask the agent")
                    || t.contains("example.com")),
            "{texts:?}"
        );
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
    fn palette_lists_electron_commands() {
        let mut chrome = sample();
        chrome.overlay = ChromeOverlay::Palette;
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
        for expected in [
            "Type a command, address, or a task for the agent…",
            "Agent",
            "Window",
            "Hide agent rail",
            "New tab",
            "Find in page",
            "Toggle sidebar",
            "Settings",
            "History",
            "Downloads",
        ] {
            assert!(texts.iter().any(|t| *t == expected), "missing {expected}: {texts:?}");
        }
        let card = palette_card(window);
        let rows = chrome.palette_rows(&card);
        let new_tab = rows.iter().find(|(id, _)| id == "new").expect("new");
        let hit = chrome.hit(window, new_tab.1.x() + 4.0, new_tab.1.y() + 4.0);
        assert_eq!(
            hit,
            ChromeHit::PaletteCommand { id: "new".into() }
        );
    }

    #[test]
    fn settings_drawer_lists_electron_sections() {
        let mut chrome = sample();
        chrome.overlay = ChromeOverlay::Settings;
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
        for expected in [
            "Settings",
            "Appearance",
            "Dark",
            "Light",
            "Engine",
            "Vector Engine",
            "Models",
            "Planner model",
            "Agent effects",
            "Search engine",
        ] {
            assert!(texts.iter().any(|t| *t == expected), "missing {expected}: {texts:?}");
        }
        let drawer = settings_drawer(window);
        let dark = settings_theme_rect(&drawer, true);
        assert_eq!(
            chrome.hit(window, dark.x() + 4.0, dark.y() + 4.0),
            ChromeHit::ThemeDark
        );
    }

    #[test]
    fn find_bar_shows_match_count() {
        let mut chrome = sample();
        chrome.find_open = true;
        chrome.find = "hello".into();
        chrome.find_active = 1;
        chrome.find_matches = 3;
        let list = chrome.paint(Size::new(1280.0, 720.0));
        let texts: Vec<&str> = list
            .items()
            .iter()
            .filter_map(|i| match i {
                DisplayItem::Text(run) => Some(run.text.as_str()),
                _ => None,
            })
            .collect();
        assert!(texts.iter().any(|t| *t == "hello"), "{texts:?}");
        assert!(texts.iter().any(|t| *t == "1 of 3"), "{texts:?}");
        assert!(texts.iter().any(|t| *t == "Done"), "{texts:?}");
        chrome.find_matches = 0;
        chrome.find_active = 0;
        let list = chrome.paint(Size::new(1280.0, 720.0));
        let texts: Vec<&str> = list
            .items()
            .iter()
            .filter_map(|i| match i {
                DisplayItem::Text(run) => Some(run.text.as_str()),
                _ => None,
            })
            .collect();
        assert!(texts.iter().any(|t| *t == "No results"), "{texts:?}");
    }

    #[test]
    fn history_overlay_hits_rows() {
        let mut chrome = sample();
        chrome.overlay = ChromeOverlay::History;
        chrome.history.push(("https://example.test/".into(), "Example".into()));
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
        assert!(texts.iter().any(|t| *t == "Search history…"), "{texts:?}");
        assert!(texts.iter().any(|t| *t == "Today"), "{texts:?}");
        assert!(texts.iter().any(|t| *t == "Example"), "{texts:?}");
        let card = palette_card(window);
        let row = chrome.history_rows(&card).remove(0);
        assert_eq!(
            chrome.hit(window, row.1.x() + 4.0, row.1.y() + 4.0),
            ChromeHit::HistoryItem {
                url: "https://example.test/".into()
            }
        );
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
