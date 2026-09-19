//! Visual tokens ported from `apps/desktop/renderer/src/tokens.css`.

use ve_style::Rgba;

fn hex(rgb: u32) -> Rgba {
    Rgba::rgb(
        ((rgb >> 16) & 0xff) as u8,
        ((rgb >> 8) & 0xff) as u8,
        (rgb & 0xff) as u8,
    )
}

/// Shell metrics from the Electron token sheet (CSS px).
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct ChromeMetrics {
    /// Expanded sidebar width.
    pub sidebar_w: f32,
    /// Collapsed sidebar rail.
    pub sidebar_rail_w: f32,
    /// Agent rail width.
    pub rail_w: f32,
    /// Stage gutter.
    pub stage_inset: f32,
    /// Stage card radius.
    pub stage_radius: f32,
    /// Hidden-sidebar toolbar height.
    pub toolbar_h: f32,
    /// Command / control height.
    pub control_h: f32,
    /// Sidebar row height.
    pub row_h: f32,
}

impl Default for ChromeMetrics {
    fn default() -> Self {
        Self {
            sidebar_w: 260.0,
            sidebar_rail_w: 56.0,
            rail_w: 360.0,
            stage_inset: 8.0,
            stage_radius: 16.0,
            toolbar_h: 52.0,
            control_h: 28.0,
            row_h: 32.0,
        }
    }
}

/// One appearance (dark is the Electron default).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ChromeTheme {
    /// `[data-theme="dark"]`
    Dark,
    /// `[data-theme="light"]`
    Light,
}

/// Colour tokens used by the retained chrome.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct ChromeTokens {
    /// Window / sidebar sheet.
    pub bg_window: Rgba,
    /// Lifted surface.
    pub bg_0: Rgba,
    /// Tile / chip face (`--bg-2`).
    pub bg_2: Rgba,
    /// Stage card fill.
    pub stage_bg: Rgba,
    /// Stage gutter (same as window).
    pub stage_frame: Rgba,
    /// Primary ink.
    pub ink_0: Rgba,
    /// Secondary ink.
    pub ink_1: Rgba,
    /// Tertiary ink.
    pub ink_2: Rgba,
    /// Hairline.
    pub line: Rgba,
    /// Sidebar background.
    pub sb_bg: Rgba,
    /// Sidebar primary ink.
    pub sb_ink_0: Rgba,
    /// Sidebar muted ink.
    pub sb_ink_1: Rgba,
    /// Sidebar field (command bar).
    pub sb_field: Rgba,
    /// Selected tab pill.
    pub sb_selected: Rgba,
    /// Selected tab ink.
    pub sb_selected_ink: Rgba,
    /// Pin tile face.
    pub sb_pin_face: Rgba,
    /// Accent (inverse of canvas).
    pub accent: Rgba,
    /// Accent ink.
    pub accent_ink: Rgba,
    /// OK.
    pub ok: Rgba,
    /// Warn.
    pub warn: Rgba,
    /// Error.
    pub err: Rgba,
    /// Engine badge ink.
    pub engine: Rgba,
}

impl ChromeTokens {
    /// Tokens for `theme`.
    #[must_use]
    pub fn for_theme(theme: ChromeTheme) -> Self {
        match theme {
            ChromeTheme::Dark => Self {
                bg_window: hex(0x1f1f1f),
                bg_0: hex(0x242426),
                bg_2: hex(0x343438),
                stage_bg: hex(0x242426),
                stage_frame: hex(0x1f1f1f),
                ink_0: hex(0xf5f5f3),
                ink_1: hex(0xb4b4b0),
                ink_2: hex(0x8a8a86),
                line: Rgba::rgba(255, 255, 255, 0.10),
                sb_bg: hex(0x1f1f1f),
                sb_ink_0: hex(0xf4f4f2),
                sb_ink_1: hex(0xc8c8c4),
                sb_field: hex(0x2a2a28),
                sb_selected: hex(0x323230),
                sb_selected_ink: hex(0xf4f4f2),
                sb_pin_face: hex(0x323230),
                accent: hex(0xf5f5f3),
                accent_ink: hex(0x1c1c1e),
                ok: hex(0x7dba8a),
                warn: hex(0xc4a35a),
                err: hex(0xd98989),
                engine: hex(0xb4b4b0),
            },
            ChromeTheme::Light => Self {
                bg_window: hex(0xeeeeec),
                bg_0: hex(0xececea),
                bg_2: hex(0xfafaf8),
                stage_bg: hex(0xfafaf8),
                stage_frame: hex(0xeeeeec),
                ink_0: hex(0x141413),
                ink_1: hex(0x4a4a47),
                ink_2: hex(0x737370),
                line: Rgba::rgba(0, 0, 0, 0.10),
                sb_bg: hex(0xeeeeec),
                sb_ink_0: hex(0x1a1a18),
                sb_ink_1: hex(0x3f3f3c),
                sb_field: Rgba::WHITE,
                sb_selected: Rgba::WHITE,
                sb_selected_ink: hex(0x1a1a18),
                sb_pin_face: Rgba::WHITE,
                accent: hex(0x141413),
                accent_ink: hex(0xfafaf8),
                ok: hex(0x2f7a45),
                warn: hex(0x8a6a1f),
                err: hex(0xb04545),
                engine: hex(0x4a4a47),
            },
        }
    }
}

impl Default for ChromeTokens {
    fn default() -> Self {
        Self::for_theme(ChromeTheme::Dark)
    }
}
