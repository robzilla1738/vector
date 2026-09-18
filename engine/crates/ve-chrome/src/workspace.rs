//! Port of `apps/desktop/renderer/src/workspace.ts`.

use serde::{Deserialize, Serialize};

/// Space identity colours (grayscale steps in the token sheet).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum SpaceColor {
    /// Blue slot.
    Blue,
    /// Violet slot.
    Violet,
    /// Pink slot.
    Pink,
    /// Orange slot.
    Orange,
    /// Green slot.
    Green,
    /// Teal slot.
    Teal,
    /// Slate slot.
    Slate,
}

/// One Arc-style space.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Space {
    /// Stable id.
    pub id: String,
    /// Display name.
    pub name: String,
    /// Identity colour.
    pub color: SpaceColor,
}

/// Pinned site (cap 5).
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Pin {
    /// URL.
    pub url: String,
    /// Title.
    pub title: String,
}

/// Maximum pins per space.
pub const MAX_PINS: usize = 5;

/// Named tab folder.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Folder {
    /// Stable id.
    pub id: String,
    /// Display name.
    pub name: String,
    /// Owning space.
    pub space_id: String,
    /// Collapsed in the sidebar.
    pub collapsed: bool,
}

/// Sidebar organisation. The runtime owns pages; chrome owns arrangement.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Layout {
    /// Spaces.
    pub spaces: Vec<Space>,
    /// Active space id.
    pub active_space_id: String,
    /// page id → space id.
    pub tab_space: Vec<(String, String)>,
    /// Explicit tab order.
    pub order: Vec<String>,
    /// Pins per space.
    pub pins: Vec<(String, Vec<Pin>)>,
    /// Folders.
    pub folders: Vec<Folder>,
    /// page id → folder id.
    pub tab_folder: Vec<(String, String)>,
}

/// Default Personal space.
#[must_use]
pub fn default_space() -> Space {
    Space {
        id: "space-personal".into(),
        name: "Personal".into(),
        color: SpaceColor::Blue,
    }
}

/// Empty layout with one space.
#[must_use]
pub fn empty_layout() -> Layout {
    let space = default_space();
    Layout {
        active_space_id: space.id.clone(),
        pins: vec![(space.id.clone(), Vec::new())],
        spaces: vec![space],
        tab_space: Vec::new(),
        order: Vec::new(),
        folders: Vec::new(),
        tab_folder: Vec::new(),
    }
}

/// Host without `www.` — tiles, pins, start page.
#[must_use]
pub fn host_of(url: &str) -> String {
    url::Url::parse(url)
        .ok()
        .and_then(|u| u.host_str().map(str::to_string))
        .map(|h| h.trim_start_matches("www.").to_string())
        .unwrap_or_else(|| url.to_string())
}

/// Keep `order` in sync with live page ids.
#[must_use]
pub fn sync_order(order: &[String], pages: &[String]) -> Vec<String> {
    let live: std::collections::HashSet<&str> = pages.iter().map(String::as_str).collect();
    let mut kept: Vec<String> = order
        .iter()
        .filter(|id| live.contains(id.as_str()))
        .cloned()
        .collect();
    let known: std::collections::HashSet<String> = kept.iter().cloned().collect();
    for p in pages {
        if !known.contains(p) {
            kept.push(p.clone());
        }
    }
    kept
}

/// Assign unknown pages to the active space.
#[must_use]
pub fn sync_spaces(layout: &Layout, pages: &[String]) -> Layout {
    let valid: std::collections::HashSet<&str> =
        layout.spaces.iter().map(|s| s.id.as_str()).collect();
    let mut tab_space = Vec::new();
    for p in pages {
        let cur = layout
            .tab_space
            .iter()
            .find(|(id, _)| id == p)
            .map(|(_, s)| s.as_str());
        let next = cur
            .filter(|s| valid.contains(*s))
            .unwrap_or(layout.active_space_id.as_str());
        tab_space.push((p.clone(), next.to_string()));
    }
    Layout {
        tab_space,
        ..layout.clone()
    }
}

/// Ordered tabs for one space.
#[must_use]
pub fn tabs_in_space(layout: &Layout, pages: &[String], space_id: &str) -> Vec<String> {
    let mut out = Vec::new();
    for id in &layout.order {
        if pages.iter().any(|p| p == id) {
            let space = layout
                .tab_space
                .iter()
                .find(|(p, _)| p == id)
                .map(|(_, s)| s.as_str())
                .unwrap_or(layout.active_space_id.as_str());
            if space == space_id {
                out.push(id.clone());
            }
        }
    }
    for p in pages {
        if !layout.order.contains(p) {
            let space = layout
                .tab_space
                .iter()
                .find(|(id, _)| id == p)
                .map(|(_, s)| s.as_str())
                .unwrap_or(layout.active_space_id.as_str());
            if space == space_id {
                out.push(p.clone());
            }
        }
    }
    out
}

/// Pin or unpin a URL in a space (cap [`MAX_PINS`]).
#[must_use]
pub fn toggle_pin(layout: &Layout, space_id: &str, pin: Pin) -> Layout {
    let mut pins = layout.pins.clone();
    let entry = pins.iter_mut().find(|(id, _)| id == space_id);
    if let Some((_, list)) = entry {
        if let Some(i) = list.iter().position(|p| p.url == pin.url) {
            list.remove(i);
        } else {
            list.push(pin);
            list.truncate(MAX_PINS);
        }
    } else {
        pins.push((space_id.to_string(), vec![pin]));
    }
    Layout {
        pins,
        ..layout.clone()
    }
}

/// Switch the active space.
#[must_use]
pub fn set_active_space(layout: &Layout, space_id: &str) -> Layout {
    if layout.spaces.iter().any(|s| s.id == space_id) {
        Layout {
            active_space_id: space_id.to_string(),
            ..layout.clone()
        }
    } else {
        layout.clone()
    }
}

/// Parse a stored layout; corrupt data becomes [`empty_layout`].
#[must_use]
pub fn parse_layout(raw: Option<&str>) -> Layout {
    let Some(raw) = raw else {
        return empty_layout();
    };
    serde_json::from_str(raw).unwrap_or_else(|_| empty_layout())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sync_order_keeps_and_appends() {
        let order = sync_order(&["b".into(), "a".into()], &["a".into(), "c".into()]);
        assert_eq!(order, vec!["a".to_string(), "c".to_string()]);
    }

    #[test]
    fn host_strips_www() {
        assert_eq!(host_of("https://www.example.test/x"), "example.test");
    }

    #[test]
    fn pin_cap() {
        let mut layout = empty_layout();
        for i in 0..6 {
            layout = toggle_pin(
                &layout,
                &layout.active_space_id,
                Pin {
                    url: format!("https://p{i}.test/"),
                    title: format!("{i}"),
                },
            );
        }
        let n = layout.pins[0].1.len();
        assert_eq!(n, MAX_PINS);
    }
}
