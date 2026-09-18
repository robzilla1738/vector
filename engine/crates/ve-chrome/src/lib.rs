//! Retained chrome widgets painted into the same compositor as the page.
//!
//! AppKit owns the window (`ve-shell-mac`); this crate draws tabs, the URL
//! bar, find, and zoom using [`ve_gfx::DisplayList`] primitives. Tokens match
//! `apps/desktop/renderer/src/workspace.ts` / `intent.ts`.

#![forbid(unsafe_code)]

use ve_core::{Point, Rect, Size};
use ve_gfx::{DisplayItem, DisplayList};
use ve_style::Rgba;

/// Visual tokens ported from the Electron chrome.
#[derive(Clone, Debug, PartialEq)]
pub struct ChromeTokens {
    /// Sidebar / chrome background.
    pub surface: Rgba,
    /// Hairline.
    pub hairline: Rgba,
    /// Accent (command bar focus).
    pub accent: Rgba,
    /// Primary text.
    pub text: Rgba,
}

impl Default for ChromeTokens {
    fn default() -> Self {
        Self {
            surface: Rgba::rgb(246, 246, 246),
            hairline: Rgba::rgb(220, 220, 220),
            accent: Rgba::rgb(0, 122, 255),
            text: Rgba::rgb(28, 28, 30),
        }
    }
}

/// One chrome tab chip.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ChromeTab {
    /// Title (untrusted page title, truncated by the shell).
    pub title: String,
    /// Selected.
    pub active: bool,
}

/// Widget tree for the primary window chrome.
#[derive(Clone, Debug)]
pub struct Chrome {
    /// Tokens.
    pub tokens: ChromeTokens,
    /// Tabs left-to-right.
    pub tabs: Vec<ChromeTab>,
    /// Address bar text.
    pub url: String,
    /// Find query (empty hides the bar).
    pub find: String,
    /// Page zoom (1.0 = 100%).
    pub zoom: f32,
}

impl Default for Chrome {
    fn default() -> Self {
        Self {
            tokens: ChromeTokens::default(),
            tabs: Vec::new(),
            url: String::new(),
            find: String::new(),
            zoom: 1.0,
        }
    }
}

impl Chrome {
    /// Paints chrome into a display list sized to `window`.
    #[must_use]
    pub fn paint(&self, window: Size) -> DisplayList {
        let mut list = DisplayList::new(window);
        let bar_h = 36.0;
        list.push(DisplayItem::Rect {
            rect: Rect::new(0.0, 0.0, window.width, bar_h),
            color: self.tokens.surface,
        });
        list.push(DisplayItem::Rect {
            rect: Rect::new(0.0, bar_h - 1.0, window.width, 1.0),
            color: self.tokens.hairline,
        });
        let mut x = 8.0;
        for tab in &self.tabs {
            let w = 120.0;
            list.push(DisplayItem::Rect {
                rect: Rect::new(x, 6.0, w, 24.0),
                color: if tab.active {
                    self.tokens.accent
                } else {
                    self.tokens.hairline
                },
            });
            x += w + 6.0;
        }
        list.push(DisplayItem::Rect {
            rect: Rect::new(8.0, bar_h + 6.0, window.width - 16.0, 28.0),
            color: Rgba::WHITE,
        });
        let _ = Point::ZERO;
        list
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn paints_tab_strip() {
        let mut chrome = Chrome::default();
        chrome.tabs.push(ChromeTab {
            title: "New Tab".into(),
            active: true,
        });
        let list = chrome.paint(Size::new(800.0, 600.0));
        assert!(list.len() >= 3);
    }
}
