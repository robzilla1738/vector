//! Retained chrome widgets painted into the same compositor as the page.
//!
//! Tokens and layout match `docs/ui/shell.md` and
//! `apps/desktop/renderer/src/{tokens.css,workspace.ts,intent.ts}`:
//! Arc-style sidebar, command bar, inset stage, resizable agent rail.

#![forbid(unsafe_code)]

mod chrome;
mod intent;
mod tokens;
mod workspace;

pub use chrome::{Chrome, ChromeBackend, ChromeHit, ChromeOverlay, ChromeTab};
pub use intent::{detect_intent, intent_label, is_url_like, to_url, Intent, IntentContext, RunScope};
pub use tokens::{ChromeMetrics, ChromeTheme, ChromeTokens};
pub use workspace::{
    design_reference_sites, empty_layout, folders_in_space, host_of, parse_layout, set_active_space,
    sync_order, sync_spaces, tabs_in_folder, tabs_in_space, toggle_pin, unfiled_tabs, Folder,
    Layout, Pin, Space, SpaceColor, MAX_PINS,
};
