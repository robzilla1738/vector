//! The agent observation: `ObservationContent` exactly as defined in
//! `packages/contracts/src/observation.ts` (architecture §5).
//!
//! [`observe`] walks the DOM once with computed styles and layout at hand and
//! produces, under the request's budgets, the reading-order `text`,
//! `headings`, ranked interactive `elements`, `formFields`, `tables`, `links`,
//! `dialogs`, `frames` and `stats`. Refs are `r<index>` (the arena slot
//! index, architecture §3).
//!
//! **Compact** (default) carries what the planner reads; **Full** adds
//! `rect`, a CSS `selector` path, `offscreen` / `occluded` / `hidden`,
//! `description` and `states`, and includes elements that are attached but
//! not shown (`hidden: true`).

use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use ve_core::{NodeId, Point, Rect, Size};
use ve_dom::{Document, ElementData, NodeKind};
use ve_layout::LayoutTree;
use ve_style::{ComputedStyle, Display, Rgba, StyleTree, Visibility};

use crate::accname::{LabelIndex, compute_description, compute_name_with};
use crate::roles::Role;

/// The agent ref for a node: `r<index>`.
#[must_use]
pub fn ref_for(id: NodeId) -> String {
    format!("r{}", id.index())
}

/// Parses an `r<index>` ref into the slot index.
///
/// `r12`, `r12.3` and `r12:3` are accepted; the generation is ignored here
/// (see [`parse_ref_parts`]).
#[must_use]
pub fn parse_ref(text: &str) -> Option<u32> {
    parse_ref_parts(text).map(|(index, _)| index)
}

/// Parses `r<index>`, `r<index>.<generation>` or `r<index>:<generation>`.
#[must_use]
pub fn parse_ref_parts(text: &str) -> Option<(u32, Option<u32>)> {
    let digits = text.strip_prefix('r')?;
    let (index, generation) = if let Some((i, g)) = digits.split_once(['.', ':']) {
        (i, Some(g))
    } else {
        (digits, None)
    };
    if index.is_empty() || !index.bytes().all(|b| b.is_ascii_digit()) {
        return None;
    }
    if let Some(g) = generation {
        if g.is_empty() || !g.bytes().all(|b| b.is_ascii_digit()) {
            return None;
        }
        return Some((index.parse().ok()?, Some(g.parse().ok()?)));
    }
    Some((index.parse().ok()?, None))
}

/// Observation scope (`ObservationRequest.scope`).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Scope {
    /// Everything.
    #[default]
    Full,
    /// Form fields and the controls that submit them.
    Forms,
    /// Links only.
    Links,
    /// Tables (and the controls inside them).
    Tables,
    /// Everything, restricted to `subtreeRef`'s subtree.
    Subtree,
}

/// Detail level.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Format {
    /// What the planner reads.
    #[default]
    Compact,
    /// Inspector / portability detail.
    Full,
}

fn default_max_elements() -> usize {
    120
}

fn default_max_text_chars() -> usize {
    6000
}

fn default_max_tokens() -> usize {
    3000
}

/// `ObservationRequest` plus the engine-only `format`.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct ObservationRequest {
    /// Scope.
    pub scope: Scope,
    /// Root ref for `scope: subtree`.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subtree_ref: Option<String>,
    /// Element budget (default 120).
    pub max_elements: usize,
    /// Text budget in characters (default 6000).
    pub max_text_chars: usize,
    /// Approximate token budget (`ceil(rendered_chars / 4)`, default 3000).
    pub max_tokens: usize,
    /// Produce `changesSince` relative to this revision.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub since_revision: Option<u64>,
    /// Compact (default) or Full.
    pub format: Format,
}

impl Default for ObservationRequest {
    fn default() -> Self {
        Self {
            scope: Scope::Full,
            subtree_ref: None,
            max_elements: default_max_elements(),
            max_text_chars: default_max_text_chars(),
            max_tokens: default_max_tokens(),
            since_revision: None,
            format: Format::Compact,
        }
    }
}

/// `SelectorStrategy`.
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct SelectorStrategy {
    /// `role=button[name="Save"]` form.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub role: Option<RoleSelector>,
    /// CSS path.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub css: Option<String>,
    /// `XPath` (never produced by the engine).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub xpath: Option<String>,
    /// Text fallback.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
}

impl SelectorStrategy {
    fn is_empty(&self) -> bool {
        self.role.is_none() && self.css.is_none() && self.xpath.is_none() && self.text.is_none()
    }
}

fn default_frame() -> String {
    "main".into()
}

fn is_main_frame(s: &str) -> bool {
    s == "main"
}

fn is_main_frame_chain(chain: &[String]) -> bool {
    chain.is_empty() || chain == ["main"]
}

fn is_zero_depth(depth: &u32) -> bool {
    *depth == 0
}

/// `SelectorStrategy.role`.
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct RoleSelector {
    /// ARIA role.
    pub role: String,
    /// Accessible name.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

/// `{x, y, w, h}` in viewport CSS pixels.
#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct RectJson {
    /// Left.
    pub x: f32,
    /// Top.
    pub y: f32,
    /// Width.
    pub w: f32,
    /// Height.
    pub h: f32,
}

impl From<Rect> for RectJson {
    fn from(r: Rect) -> Self {
        Self {
            x: round1(r.x()),
            y: round1(r.y()),
            w: round1(r.width()),
            h: round1(r.height()),
        }
    }
}

fn round1(v: f32) -> f32 {
    (v * 10.0).round() / 10.0
}

/// `ElementRef`.
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementRef {
    /// `r<index>`.
    #[serde(rename = "ref")]
    pub reference: String,
    /// Frame key (`main`).
    #[serde(default = "default_frame", skip_serializing_if = "is_main_frame")]
    pub frame: String,
    /// Local tag name.
    pub tag: String,
    /// ARIA role.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub role: Option<String>,
    /// Accessible name.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// Visible text when there is no name.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
    /// Control type.
    #[serde(default, skip_serializing_if = "Option::is_none", rename = "type")]
    pub type_: Option<String>,
    /// Current value.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
    /// Checkedness.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub checked: Option<bool>,
    /// Selected option label (for `<select>`).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub selected: Option<String>,
    /// Resolved link target.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub href: Option<String>,
    /// Placeholder.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub placeholder: Option<String>,
    /// Disabled (only when true).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub disabled: Option<bool>,
    /// `<select>` / listbox choice labels, capped (plan A10).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub options: Option<Vec<String>>,
    /// `aria-expanded` / open `<details>` (only when the element has the state).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub expanded: Option<bool>,
    /// `aria-pressed`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pressed: Option<bool>,
    /// The document's focused element (only when true).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub focused: Option<bool>,
    /// `required` / `aria-required` (only when true).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub required: Option<bool>,
    /// Viewport rect (Full).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub rect: Option<RectJson>,
    /// Locator strategies (`{}` in Compact — the ref is the locator).
    #[serde(default, skip_serializing_if = "SelectorStrategy::is_empty")]
    pub selector: SelectorStrategy,
    /// Outside the viewport (Full).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub offscreen: Option<bool>,
    /// Covered at its centre point (Full).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub occluded: Option<bool>,
    /// Frame keys from the top document to this element's frame.
    #[serde(default, skip_serializing_if = "is_main_frame_chain")]
    pub frame_chain: Vec<String>,
    /// Shadow roots between this node and the light tree.
    #[serde(default, skip_serializing_if = "is_zero_depth")]
    pub shadow_depth: u32,
    /// Nearest scrollable ancestor (`r<index>`), if any.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scroll_container: Option<String>,
    /// Element covering this one at its centre (`r<index>`).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub occluded_by: Option<String>,
    /// Attached but not shown (Full).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub hidden: Option<bool>,
    /// Accessible description (Full).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    /// Expanded state names (Full).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub states: Option<Vec<String>>,
}

/// `FormField`.
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FormField {
    /// `r<index>`.
    #[serde(rename = "ref")]
    pub reference: String,
    /// Accessible label.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    /// `name` attribute.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// Control type.
    #[serde(rename = "type")]
    pub type_: String,
    /// Current value.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
    /// Required.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub required: Option<bool>,
    /// Constraint validity.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub valid: Option<bool>,
    /// Validation message when invalid.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub validation_message: Option<String>,
}

/// `TableBlock`.
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TableBlock {
    /// `r<index>`.
    #[serde(rename = "ref")]
    pub reference: String,
    /// Caption.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub caption: Option<String>,
    /// Column headers.
    pub columns: Vec<String>,
    /// First rows (≤ 12 × 12).
    pub rows: Vec<Vec<String>>,
    /// Total body rows.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub total_rows: Option<usize>,
    /// Rows or columns were cut.
    pub truncated: bool,
}

/// `FrameInfo`.
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FrameInfo {
    /// Frame key.
    pub frame: String,
    /// Frame URL.
    pub url: String,
    /// `name` attribute.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// Same origin as the top document.
    pub same_origin: bool,
}

/// `links[]` entry.
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct LinkEntry {
    /// `r<index>`.
    #[serde(rename = "ref")]
    pub reference: String,
    /// Link text.
    pub text: String,
    /// Resolved target.
    pub href: String,
}

/// `dialogs[]` entry.
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct DialogEntry {
    /// `dialog`, `alert`, `confirm`, `prompt`, `beforeunload`.
    #[serde(rename = "type")]
    pub type_: String,
    /// Message text.
    pub message: String,
}

/// A captured `console.*` line.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConsoleEntry {
    /// `log`, `info`, `warn`, `error`, `debug`.
    pub level: String,
    /// Message text.
    pub message: String,
    /// Virtual or wall time when logged, milliseconds.
    #[serde(default, skip_serializing_if = "is_zero_u64")]
    pub at_ms: u64,
}

fn is_zero_u64(n: &u64) -> bool {
    *n == 0
}

/// `viewport`.
#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct ViewportInfo {
    /// CSS px.
    pub width: f32,
    /// CSS px.
    pub height: f32,
    /// Device pixel ratio.
    pub scale: f32,
}

/// `scroll`.
#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScrollInfo {
    /// Horizontal offset.
    pub x: f32,
    /// Vertical offset.
    pub y: f32,
    /// Maximum vertical offset.
    pub max_y: f32,
}

/// `stats`.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Stats {
    /// Candidate elements before the budget.
    pub elements_total: usize,
    /// Elements emitted.
    pub elements_shown: usize,
    /// Characters in `text`.
    pub text_chars: usize,
    /// `ceil(chars / 4)` over the rendered observation.
    pub approx_tokens: usize,
}

/// `ObservationContent`.
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ObservationContent {
    /// Document URL.
    pub url: String,
    /// Document title.
    pub title: String,
    /// Viewport.
    pub viewport: ViewportInfo,
    /// Scroll position.
    pub scroll: ScrollInfo,
    /// Frames (`main` first).
    pub frames: Vec<FrameInfo>,
    /// Reading-order text with landmark markers.
    pub text: String,
    /// Heading names in order.
    pub headings: Vec<String>,
    /// Ranked interactive elements.
    pub elements: Vec<ElementRef>,
    /// Form fields.
    pub form_fields: Vec<FormField>,
    /// Tables.
    pub tables: Vec<TableBlock>,
    /// Links.
    pub links: Vec<LinkEntry>,
    /// Open dialogs.
    pub dialogs: Vec<DialogEntry>,
    /// Page `console.*` lines captured since the last navigation.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub console: Vec<ConsoleEntry>,
    /// A budget was tripped.
    pub truncated: bool,
    /// Counters.
    pub stats: Stats,
}

impl ObservationContent {
    /// Finds an element by ref.
    #[must_use]
    pub fn element(&self, reference: &str) -> Option<&ElementRef> {
        self.elements.iter().find(|e| e.reference == reference)
    }

    /// Approximate size of the rendered (planner-facing) text for a `full`
    /// scope observation, in characters.
    #[must_use]
    pub fn rendered_chars(&self) -> usize {
        self.rendered_chars_for(Scope::Full)
    }

    /// Approximate size of what the runtime's `renderObservation` prints for
    /// `scope`, in characters: form fields for `full|forms|subtree`, elements
    /// and text for `full|subtree`, tables for `full|tables|subtree`, and the
    /// link list only for `links`.
    #[must_use]
    pub fn rendered_chars_for(&self, scope: Scope) -> usize {
        let want_fields = matches!(scope, Scope::Full | Scope::Forms | Scope::Subtree);
        let want_elements = matches!(scope, Scope::Full | Scope::Subtree);
        let want_tables = matches!(scope, Scope::Full | Scope::Tables | Scope::Subtree);
        let want_links = scope == Scope::Links;
        let mut chars = self.url.chars().count() + self.title.chars().count() + 80;
        chars += self
            .headings
            .iter()
            .map(|h| h.chars().count() + 3)
            .sum::<usize>();
        for e in self.elements.iter().filter(|_| want_elements) {
            chars += 8
                + e.role
                    .as_ref()
                    .map_or(e.tag.chars().count(), |r| r.chars().count())
                + e.name.as_ref().map_or(0, |n| n.chars().count() + 3)
                + e.value.as_ref().map_or(0, |v| v.chars().count() + 8)
                + e.href.as_ref().map_or(0, |h| h.chars().count() + 6)
                + usize::from(e.checked.is_some()) * 14
                + e.selected.as_ref().map_or(0, |s| s.chars().count() + 11);
        }
        for f in self.form_fields.iter().filter(|_| want_fields) {
            chars += 10
                + f.type_.chars().count()
                + f.label.as_ref().map_or(0, |l| l.chars().count())
                + f.value.as_ref().map_or(0, |v| v.chars().count() + 3);
        }
        for t in self.tables.iter().filter(|_| want_tables) {
            chars += 20
                + t.columns
                    .iter()
                    .map(|c| c.chars().count() + 3)
                    .sum::<usize>();
            for r in &t.rows {
                chars += r.iter().map(|c| c.chars().count() + 3).sum::<usize>();
            }
        }
        for l in self.links.iter().filter(|_| want_links) {
            chars += l.text.chars().count() + l.href.chars().count() + 10;
        }
        if want_elements {
            chars += self.text.chars().count();
        }
        chars
    }
}

/// Everything [`observe`] needs besides the request.
#[derive(Clone, Copy)]
pub struct ObserveInput<'a> {
    /// The DOM.
    pub doc: &'a Document,
    /// Computed styles.
    pub styles: &'a StyleTree,
    /// Layout.
    pub layout: &'a LayoutTree,
    /// Viewport size.
    pub viewport: Size,
    /// Device scale.
    pub scale: f32,
    /// Viewport scroll offset.
    pub scroll: Point,
    /// Focused element.
    pub focused: Option<NodeId>,
    /// Document URL.
    pub url: &'a str,
    /// Base URL for resolving hrefs (falls back to `url`).
    pub base_url: Option<&'a str>,
    /// Engine-level pending dialogs (none in M1).
    pub pending_dialogs: &'a [DialogEntry],
    /// When set, only these nodes are considered as interactive candidates
    /// (HitIndex incremental observe). Text / headings stay full-tree.
    pub restrict: Option<&'a [NodeId]>,
}

/// Per-element visibility classification (architecture §5).
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Visibility5 {
    /// Has a box, is not clipped away, `visibility: visible`, opacity > 0.01.
    pub shown: bool,
    /// Outside the viewport.
    pub offscreen: bool,
    /// Something else is on top at the centre.
    pub occluded: bool,
    /// Covering node when `occluded`.
    pub occluded_by: Option<NodeId>,
    /// Viewport-relative rect after clipping.
    pub rect: Rect,
}

/// Whether `role`/`element` is a form control that appears in `formFields`.
fn is_form_control(e: &ElementData) -> bool {
    match e.name.as_str() {
        "input" => !e.attr("type").is_some_and(|t| {
            matches!(
                t.to_ascii_lowercase().as_str(),
                "hidden" | "submit" | "button" | "reset" | "image"
            )
        }),
        "select" | "textarea" => true,
        _ => false,
    }
}

fn is_submit_control(e: &ElementData) -> bool {
    (e.is_html("button")
        && !e
            .attr("type")
            .is_some_and(|t| t.eq_ignore_ascii_case("button") || t.eq_ignore_ascii_case("reset")))
        || (e.is_html("input")
            && e.attr("type").is_some_and(|t| {
                t.eq_ignore_ascii_case("submit") || t.eq_ignore_ascii_case("image")
            }))
}

fn is_block_display(style: &ComputedStyle) -> bool {
    !matches!(
        style.display,
        Display::Inline | Display::InlineBlock | Display::None
    ) && !style.display.is_inline_level()
}

/// Password values are handles, never the secret, before model export (VEC-015/019).
fn redact_secret_field(input_type: Option<&str>, value: Option<String>) -> Option<String> {
    if input_type.is_some_and(|t| t.eq_ignore_ascii_case("password")) {
        match value {
            Some(v) if v.is_empty() => Some(String::new()),
            Some(_) => Some("{handle}".into()),
            None => Some(String::new()),
        }
    } else {
        value
    }
}

fn normalize(text: &str) -> String {
    text.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn truncate_chars(s: &str, max: usize) -> String {
    if s.chars().count() <= max {
        return s.to_owned();
    }
    let mut out: String = s.chars().take(max.saturating_sub(1)).collect();
    out.push('…');
    out
}

/// Builds an observation.
#[must_use]
pub fn observe(input: &ObserveInput<'_>, request: &ObservationRequest) -> ObservationContent {
    let span = ve_core::Stage::Snapshot.span();
    let _guard = span.enter();
    let mut builder = Builder::new(input, request);
    builder.run()
}

struct Builder<'a> {
    input: &'a ObserveInput<'a>,
    request: &'a ObservationRequest,
    doc: &'a Document,
    labels: LabelIndex,
    base: Option<url::Url>,
    viewport_rect: Rect,
    vis_cache: HashMap<NodeId, Visibility5>,
    root: NodeId,
    full: bool,
    truncated: bool,
}

/// A candidate element with its rank.
struct Candidate {
    id: NodeId,
    rank: u8,
    order: usize,
    vis: Visibility5,
    role: Option<Role>,
}

impl<'a> Builder<'a> {
    fn new(input: &'a ObserveInput<'a>, request: &'a ObservationRequest) -> Self {
        let doc = input.doc;
        let base = input
            .base_url
            .and_then(|b| url::Url::parse(b).ok())
            .or_else(|| url::Url::parse(input.url).ok());
        let root = match (request.scope, request.subtree_ref.as_deref()) {
            (Scope::Subtree, Some(r)) => parse_ref(r)
                .and_then(|i| doc.node_at_index(i).ok().flatten())
                .filter(|&id| doc.element(id).is_some())
                .unwrap_or_else(|| doc.body().unwrap_or(doc.root())),
            _ => doc.body().unwrap_or(doc.root()),
        };
        Self {
            input,
            request,
            doc,
            labels: LabelIndex::build(doc),
            base,
            viewport_rect: Rect::new(
                input.scroll.x,
                input.scroll.y,
                input.viewport.width,
                input.viewport.height,
            ),
            vis_cache: HashMap::new(),
            root,
            full: request.format == Format::Full,
            truncated: false,
        }
    }

    fn style(&self, id: NodeId) -> Option<&'a std::rc::Rc<ComputedStyle>> {
        self.input.styles.get(id)
    }

    fn shadow_depth(&self, id: NodeId) -> u32 {
        let mut n = 0u32;
        let mut cur = Some(id);
        while let Some(node) = cur {
            let Some(shadow) = self.doc.containing_shadow_root(node) else {
                break;
            };
            n += 1;
            cur = self.doc.host(shadow);
        }
        n
    }

    fn scroll_container_ref(&self, id: NodeId) -> Option<String> {
        std::iter::once(id)
            .chain(self.doc.ancestors(id))
            .find(|&a| {
                self.input
                    .styles
                    .get(a)
                    .is_some_and(|s| s.overflow.is_scrollable())
                    && self
                        .doc
                        .element(a)
                        .is_some_and(|e| !e.is_html("body") && !e.is_html("html"))
            })
            .map(ref_for)
    }

    fn resolve_href(&self, href: &str) -> String {
        let href = href.trim();
        match &self.base {
            Some(base) => base
                .join(href)
                .map_or_else(|_| href.to_owned(), |u| u.to_string()),
            None => href.to_owned(),
        }
    }

    fn is_focusable(&self, id: NodeId, e: &ElementData) -> bool {
        if e.has_attr("disabled") {
            return false;
        }
        e.has_attr("tabindex")
            || matches!(
                e.name.as_str(),
                "input" | "button" | "select" | "textarea" | "summary" | "iframe"
            )
            || ((e.is_html("a") || e.is_html("area")) && e.has_attr("href"))
            || e.attr("contenteditable")
                .is_some_and(|v| !v.eq_ignore_ascii_case("false"))
            || Role::for_element(self.doc, id).is_some_and(Role::is_interactive)
    }

    /// §5 visibility. Layout coordinates are document coordinates; the
    /// returned rect is viewport-relative.
    fn visibility(&mut self, id: NodeId) -> Visibility5 {
        if let Some(v) = self.vis_cache.get(&id) {
            return *v;
        }
        let v = self.compute_visibility(id);
        self.vis_cache.insert(id, v);
        v
    }

    fn compute_visibility(&self, id: NodeId) -> Visibility5 {
        let doc = self.doc;
        let Some(style) = self.style(id) else {
            return Visibility5::default();
        };
        if !style.is_displayed() || style.visibility != Visibility::Visible {
            return Visibility5::default();
        }
        let Some(mut rect) = self.input.layout.rect_of(id) else {
            return Visibility5::default();
        };
        let mut opacity = style.opacity;
        let mut clipped_away = false;
        for a in doc.ancestors(id) {
            let Some(s) = self.style(a) else { continue };
            opacity *= s.opacity;
            if s.overflow.clips()
                && let Some(clip) = self.input.layout.rect_of(a)
            {
                match rect.intersection(&clip) {
                    Some(r) => rect = r,
                    None => {
                        // Zero-size focusables (skip links) stay shown.
                        rect = Rect::new(rect.x(), rect.y(), 0.0, 0.0);
                        clipped_away = true;
                    }
                }
            }
            if doc.element(a).is_some_and(|e| e.has_attr("hidden")) {
                return Visibility5::default();
            }
        }
        if opacity <= 0.01 {
            return Visibility5::default();
        }
        let element = doc.element(id);
        let focusable = element.is_some_and(|e| self.is_focusable(id, e));
        if (rect.is_empty() || clipped_away) && !focusable {
            return Visibility5::default();
        }
        let offscreen = !rect.intersects(&self.viewport_rect) && !rect.is_empty()
            || (rect.is_empty() && !self.viewport_rect.contains(Point::new(rect.x(), rect.y())));
        let (occluded, occluded_by) = if rect.is_empty() || offscreen {
            (false, None)
        } else {
            let center = rect.center();
            // Occluded: the topmost box at the centre belongs to neither the
            // element, a descendant, nor an ancestor (an ancestor hit means the
            // centre fell between the element's own fragments).
            match self.input.layout.hit_test(center) {
                Some(hit)
                    if hit != id
                        && !doc.is_ancestor_of(id, hit)
                        && !doc.is_ancestor_of(hit, id) =>
                {
                    (true, Some(hit))
                }
                _ => (false, None),
            }
        };
        let viewport_rect = rect.translate(-self.input.scroll.x, -self.input.scroll.y);
        Visibility5 {
            shown: true,
            offscreen,
            occluded,
            occluded_by,
            rect: viewport_rect,
        }
    }

    /// Effective background colour: nearest non-transparent ancestor
    /// background, else white.
    fn effective_background(&self, id: NodeId) -> Rgba {
        for a in std::iter::once(id).chain(self.doc.ancestors(id)) {
            if let Some(s) = self.style(a) {
                let bg = s.background_color.resolve(s.color);
                if !bg.is_transparent() {
                    return bg;
                }
            }
        }
        Rgba::WHITE
    }

    /// The "screen-reader only" pattern: text the same colour as its
    /// background at a tiny size, or clipped to ≤ 1 px.
    fn is_hidden_text(&mut self, id: NodeId) -> bool {
        let Some(style) = self.style(id).cloned() else {
            return false;
        };
        if style.font_size < 6.0 && style.color == self.effective_background(id) {
            return true;
        }
        if style.font_size < 1.0 {
            return true;
        }
        let vis = self.visibility(id);
        if vis.shown && (vis.rect.width() <= 1.0 || vis.rect.height() <= 1.0) {
            // Only counts when the element itself is clipped, not merely empty.
            return self.input.layout.rect_of(id).is_some_and(|r| !r.is_empty());
        }
        if !vis.shown {
            // Clipped away entirely by an overflow ancestor while laid out.
            return style.overflow.clips()
                && self
                    .input
                    .layout
                    .rect_of(id)
                    .is_some_and(|r| r.width() <= 1.0 || r.height() <= 1.0);
        }
        false
    }

    fn skip_element(e: &ElementData) -> bool {
        matches!(
            e.name.as_str(),
            "script" | "style" | "template" | "noscript" | "head" | "meta" | "link" | "title"
        ) || e.has_attr("hidden")
            || e.attr("aria-hidden")
                .is_some_and(|v| v.eq_ignore_ascii_case("true"))
    }

    fn landmark_marker(&self, id: NodeId, e: &ElementData) -> Option<&'static str> {
        let role = Role::for_element(self.doc, id)?;
        Some(match role {
            Role::Navigation => "[nav]",
            Role::Main => "[main]",
            Role::ContentInfo => "[footer]",
            Role::Banner => "[header]",
            Role::Complementary => "[aside]",
            Role::Form if e.is_html("form") => "[form]",
            Role::Dialog => "[dialog]",
            _ => return None,
        })
    }

    // ---------------------------------------------------------------------
    // Text and headings
    // ---------------------------------------------------------------------

    fn collect_text(&mut self, root: NodeId, max_chars: usize) -> (String, Vec<String>) {
        let mut out = String::new();
        let mut headings = Vec::new();
        let mut line = String::new();
        let mut over = false;
        self.walk_text(
            root,
            max_chars,
            &mut out,
            &mut line,
            &mut headings,
            &mut over,
        );
        Self::flush_line(&mut out, &mut line, max_chars, &mut over);
        if over {
            self.truncated = true;
        }
        let text = out.trim_end().to_owned();
        (text, headings)
    }

    fn flush_line(out: &mut String, line: &mut String, max_chars: usize, over: &mut bool) {
        let trimmed = normalize(line);
        line.clear();
        if trimmed.is_empty() {
            return;
        }
        if *over {
            return;
        }
        let current = out.chars().count();
        if current + trimmed.chars().count() + 1 > max_chars {
            let room = max_chars.saturating_sub(current + 1);
            if room > 8 {
                out.push_str(&truncate_chars(&trimmed, room));
                out.push('\n');
            }
            *over = true;
            return;
        }
        out.push_str(&trimmed);
        out.push('\n');
    }

    fn walk_text(
        &mut self,
        id: NodeId,
        max_chars: usize,
        out: &mut String,
        line: &mut String,
        headings: &mut Vec<String>,
        over: &mut bool,
    ) {
        let doc = self.doc;
        let children: Vec<NodeId> = doc.children(id).collect();
        for child in children {
            if *over {
                return;
            }
            let Some(node) = doc.get(child) else { continue };
            match &node.kind {
                NodeKind::Text(t) => {
                    line.push(' ');
                    line.push_str(t);
                }
                NodeKind::Element(e) => {
                    if Self::skip_element(e) || !self.input.styles.is_displayed(child) {
                        continue;
                    }
                    if self
                        .style(child)
                        .is_some_and(|s| s.visibility != Visibility::Visible)
                    {
                        continue;
                    }
                    let e = e.clone();
                    let block = self.style(child).is_some_and(|s| is_block_display(s))
                        || matches!(e.name.as_str(), "br" | "li" | "tr" | "option");
                    if self.is_hidden_text(child) {
                        continue;
                    }
                    let marker = self.landmark_marker(child, &e);
                    if block {
                        Self::flush_line(out, line, max_chars, over);
                    }
                    if let Some(m) = marker {
                        Self::flush_line(out, line, max_chars, over);
                        line.push_str(m);
                        Self::flush_line(out, line, max_chars, over);
                    }
                    if let Some(level) = heading_level(&e) {
                        let name = compute_name_with(doc, child, Some(&self.labels));
                        let name = if name.is_empty() {
                            normalize(&doc.text_content(child))
                        } else {
                            name
                        };
                        if !name.is_empty() {
                            headings.push(name.clone());
                            line.push_str(&format!(
                                "{} {name}",
                                "#".repeat(usize::from(level.min(6)))
                            ));
                            Self::flush_line(out, line, max_chars, over);
                            continue;
                        }
                    }
                    match e.name.as_str() {
                        "img" | "area" => {
                            if let Some(alt) = e.attr("alt")
                                && !alt.trim().is_empty()
                            {
                                line.push_str(&format!(" [img: {}]", normalize(alt)));
                            }
                        }
                        "input" | "textarea" | "select" | "button" => {
                            // Controls are listed in `elements`; keep the flow readable.
                            if e.is_html("button") {
                                let name = compute_name_with(doc, child, Some(&self.labels));
                                if !name.is_empty() {
                                    line.push_str(&format!(" [{name}]"));
                                }
                            }
                        }
                        "br" => Self::flush_line(out, line, max_chars, over),
                        "table" => {
                            // Tables are emitted structurally in `tables`; the text
                            // keeps a marker so the reading order stays intact.
                            Self::flush_line(out, line, max_chars, over);
                            let caption = doc
                                .children(child)
                                .find(|&c| doc.element(c).is_some_and(|e| e.is_html("caption")))
                                .map(|c| normalize(&doc.text_content(c)))
                                .filter(|c| !c.is_empty());
                            line.push_str(&match caption {
                                Some(c) => format!("[table: {c}]"),
                                None => "[table]".to_owned(),
                            });
                            Self::flush_line(out, line, max_chars, over);
                        }
                        _ => self.walk_text(child, max_chars, out, line, headings, over),
                    }
                    if block {
                        Self::flush_line(out, line, max_chars, over);
                    }
                }
                _ => {}
            }
        }
    }

    // ---------------------------------------------------------------------
    // Elements
    // ---------------------------------------------------------------------

    fn is_candidate(e: &ElementData, role: Option<Role>) -> bool {
        if Self::skip_element(e) {
            return false;
        }
        if e.is_html("input")
            && e.attr("type")
                .is_some_and(|t| t.eq_ignore_ascii_case("hidden"))
        {
            return false;
        }
        if e.is_html("option") {
            return false;
        }
        role.is_some_and(Role::is_interactive)
            || matches!(
                e.name.as_str(),
                "button" | "input" | "select" | "textarea" | "summary" | "details"
            )
            || ((e.is_html("a") || e.is_html("area")) && e.has_attr("href"))
            || e.has_attr("tabindex")
            || e.has_attr("onclick")
            || e.attr("contenteditable")
                .is_some_and(|v| !v.eq_ignore_ascii_case("false"))
    }

    fn in_scope(&self, e: &ElementData, role: Option<Role>) -> bool {
        match self.request.scope {
            Scope::Full | Scope::Subtree => true,
            Scope::Forms => is_form_control(e) || is_submit_control(e),
            Scope::Links => role == Some(Role::Link),
            Scope::Tables => true,
        }
    }

    fn inside_table(&self, id: NodeId) -> bool {
        self.doc
            .ancestors(id)
            .any(|a| self.doc.element(a).is_some_and(|e| e.is_html("table")))
    }

    fn collect_candidates(&mut self) -> Vec<Candidate> {
        let mut out = Vec::new();
        let mut order = 0usize;
        if let Some(ids) = self.input.restrict {
            for &id in ids {
                if self.doc.element(id).is_some() {
                    self.walk_candidates(id, false, &mut order, &mut out);
                }
            }
            out.retain(|c| ids.contains(&c.id));
            return out;
        }
        self.walk_candidates(self.root, true, &mut order, &mut out);
        out
    }

    fn walk_candidates(
        &mut self,
        id: NodeId,
        is_scope_root: bool,
        order: &mut usize,
        out: &mut Vec<Candidate>,
    ) {
        let doc = self.doc;
        if let Some(e) = doc.element(id) {
            if Self::skip_element(e) {
                return;
            }
            if !self.input.styles.is_displayed(id) {
                return;
            }
            let consider = !is_scope_root || self.request.scope == Scope::Subtree;
            if consider {
                *order += 1;
                let role = Role::for_element(doc, id);
                if Self::is_candidate(e, role)
                    && self.in_scope(e, role)
                    && !(self.request.scope == Scope::Tables && !self.inside_table(id))
                {
                    let vis = self.visibility(id);
                    if vis.shown || self.full {
                        let e = doc.element(id).expect("live element");
                        let is_link = role == Some(Role::Link);
                        let form = is_form_control(e);
                        let form_field = form
                            || matches!(
                                role,
                                Some(Role::TextBox | Role::SearchBox | Role::Checkbox)
                            );
                        let in_view_action =
                            !vis.offscreen && (is_submit_control(e) || role == Some(Role::Button));
                        let decisive = form_field || in_view_action;
                        let rank = if !vis.shown {
                            6
                        } else if vis.occluded {
                            5
                        } else if decisive {
                            0
                        } else if !vis.offscreen && !is_link {
                            1
                        } else if !vis.offscreen && is_link {
                            2
                        } else {
                            3
                        };
                        out.push(Candidate {
                            id,
                            rank,
                            order: *order,
                            vis,
                            role,
                        });
                    }
                }
            }
        }
        let mut children: Vec<NodeId> = doc.children(id).collect();
        if let Some(shadow) = doc.shadow_root(id) {
            children.extend(doc.children(shadow));
        }
        for child in children {
            self.walk_candidates(child, false, order, out);
        }
    }

    /// Choice labels of a `<select>` or an ARIA listbox/menu/radiogroup, capped at 20.
    fn option_labels(&self, id: NodeId, e: &ve_dom::ElementData) -> Option<Vec<String>> {
        let doc = self.doc;
        let labels: Vec<String> = if e.is_html("select") {
            doc.descendants(id)
                .filter(|&d| doc.element(d).is_some_and(|o| o.is_html("option")))
                .map(|o| {
                    normalize(
                        &doc.attribute(o, "label")
                            .map_or_else(|| doc.text_content(o), str::to_owned),
                    )
                })
                .filter(|l| !l.is_empty())
                .take(20)
                .collect()
        } else if e
            .attr("role")
            .is_some_and(|r| matches!(r, "listbox" | "menu" | "radiogroup"))
        {
            doc.descendants(id)
                .filter(|&d| {
                    doc.element(d).is_some_and(|o| {
                        o.attr("role")
                            .is_some_and(|r| matches!(r, "option" | "menuitem" | "radio"))
                    })
                })
                .map(|o| {
                    normalize(
                        &doc.attribute(o, "aria-label")
                            .map_or_else(|| doc.text_content(o), str::to_owned),
                    )
                })
                .filter(|l| !l.is_empty())
                .take(20)
                .collect()
        } else {
            return None;
        };
        (!labels.is_empty()).then_some(labels)
    }

    fn selected_option(&self, select: NodeId) -> Option<(String, String)> {
        let doc = self.doc;
        let options: Vec<NodeId> = doc
            .descendants(select)
            .filter(|&d| doc.element(d).is_some_and(|e| e.is_html("option")))
            .collect();
        let chosen = options
            .iter()
            .copied()
            .find(|&o| doc.is_selected(o))
            .or_else(|| options.first().copied())?;
        let label = doc
            .attribute(chosen, "label")
            .map_or_else(|| doc.text_content(chosen), str::to_owned);
        let label = normalize(&label);
        let value = doc
            .attribute(chosen, "value")
            .map_or_else(|| label.clone(), str::to_owned);
        Some((value, label))
    }

    fn control_type(e: &ElementData) -> Option<String> {
        Some(match e.name.as_str() {
            "input" => e
                .attr("type")
                .map_or_else(|| "text".to_owned(), str::to_ascii_lowercase),
            "select" => {
                if e.has_attr("multiple") {
                    "select-multiple".into()
                } else {
                    "select".into()
                }
            }
            "textarea" => "textarea".into(),
            "button" => e
                .attr("type")
                .map_or_else(|| "submit".to_owned(), str::to_ascii_lowercase),
            _ => return None,
        })
    }

    fn css_path(&self, id: NodeId) -> String {
        let doc = self.doc;
        let mut segments = Vec::new();
        let mut cur = Some(id);
        while let Some(n) = cur {
            let Some(e) = doc.element(n) else { break };
            if let Some(el_id) = e.id()
                && !el_id.is_empty()
                && !el_id.contains(|c: char| c.is_whitespace() || c == '.' || c == ':')
                && doc.element_by_id(el_id) == Some(n)
            {
                segments.push(format!("#{el_id}"));
                break;
            }
            let parent = doc.parent(n);
            let nth = parent.map_or(1, |p| {
                doc.children(p)
                    .filter(|&c| doc.element(c).is_some())
                    .position(|c| c == n)
                    .unwrap_or(0)
                    + 1
            });
            let is_root = parent.is_none_or(|p| doc.element(p).is_none());
            if is_root || e.is_html("body") || e.is_html("head") {
                segments.push(e.name.clone());
            } else {
                segments.push(format!("{}:nth-child({nth})", e.name));
            }
            cur = parent;
        }
        segments.reverse();
        segments.join(" > ")
    }

    fn element_ref(&mut self, c: &Candidate) -> ElementRef {
        let doc = self.doc;
        let id = c.id;
        let e = doc.element(id).expect("live element").clone();
        let name = compute_name_with(doc, id, Some(&self.labels));
        let role = c
            .role
            .filter(|r| *r != Role::Generic)
            .map(|r| r.name().to_owned());
        let disabled = e.has_attr("disabled")
            || e.attr("aria-disabled")
                .is_some_and(|v| v.eq_ignore_ascii_case("true"))
            || doc.ancestors(id).any(|a| {
                doc.element(a)
                    .is_some_and(|f| f.is_html("fieldset") && f.has_attr("disabled"))
            });
        let type_ = Self::control_type(&e);
        let input_type = type_.clone().filter(|_| e.is_html("input"));
        let checkable = matches!(input_type.as_deref(), Some("checkbox" | "radio"))
            || c.role
                .is_some_and(|r| matches!(r, Role::Checkbox | Role::Radio | Role::Switch));
        let checked = checkable.then(|| match e.attr("aria-checked") {
            Some(v) if !e.is_html("input") => v.eq_ignore_ascii_case("true"),
            _ => doc.is_checked(id),
        });
        let (value, selected) = if e.is_html("select") {
            match self.selected_option(id) {
                Some((v, l)) => (Some(v), Some(l)),
                None => (None, None),
            }
        } else if checkable
            || matches!(
                input_type.as_deref(),
                Some("submit" | "button" | "reset" | "image")
            )
        {
            (None, None)
        } else if e.is_html("input") || e.is_html("textarea") {
            let raw = doc.form_value(id).or_else(|| Some(String::new()));
            (redact_secret_field(input_type.as_deref(), raw), None)
        } else if e.attr("contenteditable").is_some() {
            (Some(normalize(&doc.text_content(id))), None)
        } else {
            (
                e.attr("aria-valuetext")
                    .or(e.attr("aria-valuenow"))
                    .map(str::to_owned),
                None,
            )
        };
        let href = ((e.is_html("a") || e.is_html("area")) && e.has_attr("href"))
            .then(|| e.attr("href").map(|h| self.resolve_href(h)))
            .flatten();
        let text = if name.is_empty() {
            let t = normalize(&doc.text_content(id));
            (!t.is_empty()).then(|| truncate_chars(&t, 80))
        } else {
            None
        };
        let mut out = ElementRef {
            reference: ref_for(id),
            frame: "main".into(),
            tag: e.name.clone(),
            role: role.clone(),
            name: (!name.is_empty()).then(|| truncate_chars(&name, 256)),
            text,
            type_,
            value,
            checked,
            selected,
            href,
            placeholder: e.attr("placeholder").map(normalize),
            disabled: disabled.then_some(true),
            options: self.option_labels(id, &e),
            expanded: if let Some(v) = e.attr("aria-expanded") {
                Some(v.eq_ignore_ascii_case("true"))
            } else if e.is_html("summary") {
                doc.parent(id).map(|d| doc.attribute(d, "open").is_some())
            } else {
                None
            },
            pressed: e
                .attr("aria-pressed")
                .map(|v| v.eq_ignore_ascii_case("true")),
            focused: (self.input.focused == Some(id)).then_some(true),
            required: (e.has_attr("required")
                || e.attr("aria-required")
                    .is_some_and(|v| v.eq_ignore_ascii_case("true")))
            .then_some(true),
            rect: None,
            selector: SelectorStrategy::default(),
            // Compact carries these only when true: a click on such an
            // element needs a scroll first or will not land at all.
            offscreen: c.vis.offscreen.then_some(true),
            occluded: c.vis.occluded.then_some(true),
            frame_chain: vec!["main".into()],
            shadow_depth: self.shadow_depth(id),
            scroll_container: self.scroll_container_ref(id),
            occluded_by: c.vis.occluded_by.map(ref_for),
            hidden: None,
            description: None,
            states: None,
        };
        if self.full {
            out.rect = Some(c.vis.rect.into());
            out.selector = SelectorStrategy {
                role: role.map(|r| RoleSelector {
                    role: r,
                    name: out.name.clone(),
                }),
                css: Some(self.css_path(id)),
                xpath: None,
                text: out.name.clone().filter(|_| {
                    matches!(
                        c.role,
                        Some(Role::Link | Role::Button | Role::MenuItem | Role::Tab)
                    )
                }),
            };
            out.offscreen = Some(c.vis.offscreen);
            out.occluded = Some(c.vis.occluded);
            out.hidden = Some(!c.vis.shown);
            let description = compute_description(doc, id, &name);
            out.description = (!description.is_empty()).then_some(description);
            let mut states = Vec::new();
            if self.input.focused == Some(id) {
                states.push("focused".to_owned());
            }
            if let Some(v) = e.attr("aria-expanded") {
                states.push(format!("expanded={}", v.eq_ignore_ascii_case("true")));
            } else if e.is_html("details") || e.is_html("summary") {
                let details = if e.is_html("details") {
                    Some(id)
                } else {
                    doc.parent(id)
                };
                let open = details.is_some_and(|d| doc.attribute(d, "open").is_some());
                states.push(format!("expanded={open}"));
            }
            if let Some(v) = e.attr("aria-pressed") {
                states.push(format!("pressed={}", v.eq_ignore_ascii_case("true")));
            }
            if let Some(level) = heading_level(&e) {
                states.push(format!("level={level}"));
            }
            if e.has_attr("required")
                || e.attr("aria-required")
                    .is_some_and(|v| v.eq_ignore_ascii_case("true"))
            {
                states.push("required".into());
            }
            if e.attr("aria-invalid")
                .is_some_and(|v| !v.eq_ignore_ascii_case("false"))
            {
                states.push("invalid".into());
            }
            if e.attr("aria-busy")
                .is_some_and(|v| v.eq_ignore_ascii_case("true"))
            {
                states.push("busy".into());
            }
            if e.has_attr("readonly") {
                states.push("readonly".into());
            }
            out.states = Some(states);
        }
        out
    }

    // ---------------------------------------------------------------------
    // Form fields
    // ---------------------------------------------------------------------

    fn form_field(&self, id: NodeId, element: &ElementRef) -> FormField {
        let doc = self.doc;
        let e = doc.element(id).expect("live element");
        let type_ = element.type_.clone().unwrap_or_else(|| "text".into());
        let value = if e.is_html("select") {
            element.value.clone()
        } else if element.checked.is_some() {
            Some(if element.checked == Some(true) {
                "on".to_owned()
            } else {
                String::new()
            })
        } else {
            element.value.clone()
        };
        let required = e.has_attr("required")
            || e.attr("aria-required")
                .is_some_and(|v| v.eq_ignore_ascii_case("true"));
        let (valid, message) = validity(e, &type_, value.as_deref().unwrap_or(""), required);
        FormField {
            reference: element.reference.clone(),
            label: element.name.clone(),
            name: e.attr("name").map(str::to_owned),
            type_,
            value,
            required: required.then_some(true),
            valid: Some(valid),
            validation_message: (!valid).then_some(message),
        }
    }

    // ---------------------------------------------------------------------
    // Tables
    // ---------------------------------------------------------------------

    fn cell_text(&self, cell: NodeId) -> String {
        let doc = self.doc;
        let mut out = String::new();
        let mut stack: Vec<NodeId> = doc.children(cell).collect();
        stack.reverse();
        while let Some(n) = stack.pop() {
            match doc.get(n).map(|node| &node.kind) {
                Some(NodeKind::Text(t)) => {
                    out.push(' ');
                    out.push_str(t);
                }
                Some(NodeKind::Element(e)) => {
                    if Self::skip_element(e) || !self.input.styles.is_displayed(n) {
                        continue;
                    }
                    match e.name.as_str() {
                        "input" | "select" | "textarea" => {
                            if let Some(v) = doc.form_value(n) {
                                out.push(' ');
                                out.push_str(&v);
                            }
                        }
                        "img" => {
                            if let Some(alt) = e.attr("alt") {
                                out.push(' ');
                                out.push_str(alt);
                            }
                        }
                        _ => {
                            let kids: Vec<NodeId> = doc.children(n).collect();
                            stack.extend(kids.into_iter().rev());
                        }
                    }
                }
                _ => {}
            }
        }
        normalize(&out)
    }

    fn table_block(&self, table: NodeId) -> Option<TableBlock> {
        const MAX_ROWS: usize = 12;
        const MAX_COLS: usize = 12;
        let doc = self.doc;
        let rows: Vec<NodeId> = doc
            .descendants(table)
            .filter(|&d| {
                doc.element(d).is_some_and(|e| e.is_html("tr"))
                    && !doc
                        .ancestors(d)
                        .take_while(|&a| a != table)
                        .any(|a| doc.element(a).is_some_and(|e| e.is_html("table")))
            })
            .collect();
        if rows.is_empty() {
            return None;
        }
        let cells_of = |tr: NodeId| -> Vec<NodeId> {
            doc.children(tr)
                .filter(|&c| {
                    doc.element(c)
                        .is_some_and(|e| e.is_html("td") || e.is_html("th"))
                })
                .collect()
        };
        let is_header_row = |tr: NodeId| {
            let cells = cells_of(tr);
            !cells.is_empty()
                && cells
                    .iter()
                    .all(|&c| doc.element(c).is_some_and(|e| e.is_html("th")))
        };
        let (columns, body): (Vec<String>, Vec<NodeId>) = if is_header_row(rows[0]) {
            (
                cells_of(rows[0])
                    .into_iter()
                    .map(|c| self.cell_text(c))
                    .collect(),
                rows[1..].to_vec(),
            )
        } else {
            (Vec::new(), rows.clone())
        };
        let mut truncated = columns.len() > MAX_COLS;
        let columns: Vec<String> = columns.into_iter().take(MAX_COLS).collect();
        let total_rows = body.len();
        let mut out_rows = Vec::new();
        for &tr in body.iter().take(MAX_ROWS) {
            let cells = cells_of(tr);
            if cells.len() > MAX_COLS {
                truncated = true;
            }
            out_rows.push(
                cells
                    .into_iter()
                    .take(MAX_COLS)
                    .map(|c| self.cell_text(c))
                    .collect(),
            );
        }
        if total_rows > MAX_ROWS {
            truncated = true;
        }
        let caption = doc
            .children(table)
            .find(|&c| doc.element(c).is_some_and(|e| e.is_html("caption")))
            .map(|c| normalize(&doc.text_content(c)))
            .filter(|c| !c.is_empty())
            .or_else(|| {
                let name = compute_name_with(doc, table, Some(&self.labels));
                (!name.is_empty()).then_some(name)
            });
        Some(TableBlock {
            reference: ref_for(table),
            caption,
            columns,
            rows: out_rows,
            total_rows: Some(total_rows),
            truncated,
        })
    }

    fn collect_tables(&mut self) -> Vec<TableBlock> {
        let doc = self.doc;
        let tables: Vec<NodeId> = doc
            .descendants(self.root)
            .filter(|&d| doc.element(d).is_some_and(|e| e.is_html("table")))
            .filter(|&d| self.input.styles.is_displayed(d))
            .filter(|&d| {
                !doc.ancestors(d)
                    .any(|a| doc.element(a).is_some_and(Self::skip_element))
            })
            .collect();
        let mut out = Vec::new();
        for t in tables {
            if let Some(block) = self.table_block(t) {
                if block.truncated {
                    self.truncated = true;
                }
                out.push(block);
            }
        }
        out
    }

    // ---------------------------------------------------------------------
    // Frames and dialogs
    // ---------------------------------------------------------------------

    fn collect_frames(&self) -> Vec<FrameInfo> {
        let doc = self.doc;
        let origin_of = |u: &str| url::Url::parse(u).ok().map(|u| u.origin());
        let top_origin = origin_of(self.input.url);
        let mut frames = vec![FrameInfo {
            frame: "main".into(),
            url: self.input.url.to_owned(),
            name: None,
            same_origin: true,
        }];
        for (i, id) in doc
            .elements()
            .filter(|&d| doc.element(d).is_some_and(|e| e.is_html("iframe")))
            .enumerate()
        {
            let e = doc.element(id).expect("live");
            let src = e
                .attr("src")
                .map(|s| self.resolve_href(s))
                .unwrap_or_default();
            let same_origin = src.is_empty()
                || src.starts_with("about:")
                || (top_origin.is_some() && origin_of(&src) == top_origin);
            frames.push(FrameInfo {
                frame: format!("f{}", i + 1),
                url: src,
                name: e.attr("name").map(str::to_owned),
                same_origin,
            });
        }
        frames
    }

    fn collect_dialogs(&mut self) -> Vec<DialogEntry> {
        let doc = self.doc;
        let mut out: Vec<DialogEntry> = self.input.pending_dialogs.to_vec();
        let ids: Vec<NodeId> = doc.descendants(self.root).collect();
        for id in ids {
            let Some(e) = doc.element(id) else { continue };
            let is_dialog = (e.is_html("dialog") && e.has_attr("open"))
                || e.attr("role").is_some_and(|r| {
                    r.split_ascii_whitespace().any(|t| {
                        t.eq_ignore_ascii_case("dialog") || t.eq_ignore_ascii_case("alertdialog")
                    })
                });
            if !is_dialog || Self::skip_element(e) || !self.input.styles.is_displayed(id) {
                continue;
            }
            if !e.is_html("dialog") && !self.visibility(id).shown {
                continue;
            }
            let name = compute_name_with(doc, id, Some(&self.labels));
            let body = normalize(&doc.text_content(id));
            let message = if name.is_empty() {
                body
            } else {
                format!("{name}: {body}")
            };
            out.push(DialogEntry {
                type_: if e
                    .attr("role")
                    .is_some_and(|r| r.eq_ignore_ascii_case("alertdialog"))
                {
                    "alertdialog".into()
                } else {
                    "dialog".into()
                },
                message: truncate_chars(&message, 300),
            });
        }
        out
    }

    // ---------------------------------------------------------------------
    // Assembly
    // ---------------------------------------------------------------------

    fn run(&mut self) -> ObservationContent {
        let doc = self.doc;
        let scope = self.request.scope;
        let want_text = matches!(scope, Scope::Full | Scope::Subtree);
        let want_tables = matches!(scope, Scope::Full | Scope::Subtree | Scope::Tables);
        let want_links = matches!(scope, Scope::Full | Scope::Subtree | Scope::Links);
        let want_fields = matches!(scope, Scope::Full | Scope::Subtree | Scope::Forms);

        let mut candidates = self.collect_candidates();
        let elements_total = candidates.len();
        candidates.sort_by_key(|c| (c.rank, c.order));
        let max = self.request.max_elements.max(1);
        if candidates.len() > max {
            self.truncated = true;
            candidates.truncate(max);
        }
        let mut elements = Vec::with_capacity(candidates.len());
        let mut form_fields = Vec::new();
        let mut links = Vec::new();
        for c in &candidates {
            let element = self.element_ref(c);
            let e = doc.element(c.id).expect("live");
            if want_fields && is_form_control(e) && c.vis.shown {
                form_fields.push(self.form_field(c.id, &element));
            }
            if want_links
                && c.role == Some(Role::Link)
                && c.vis.shown
                && let Some(href) = &element.href
            {
                links.push(LinkEntry {
                    reference: element.reference.clone(),
                    text: element
                        .name
                        .clone()
                        .or_else(|| element.text.clone())
                        .unwrap_or_default(),
                    href: href.clone(),
                });
            }
            elements.push(element);
        }

        let (text, headings) = if want_text {
            let root = self.root;
            self.collect_text(root, self.request.max_text_chars.max(16))
        } else {
            (String::new(), Vec::new())
        };
        let tables = if want_tables {
            self.collect_tables()
        } else {
            Vec::new()
        };
        let dialogs = self.collect_dialogs();
        let frames = self.collect_frames();

        let max_y = (self.input.layout.content_height() - self.input.viewport.height).max(0.0);
        let mut content = ObservationContent {
            url: self.input.url.to_owned(),
            title: doc.title().unwrap_or_default(),
            viewport: ViewportInfo {
                width: self.input.viewport.width,
                height: self.input.viewport.height,
                scale: self.input.scale,
            },
            scroll: ScrollInfo {
                x: self.input.scroll.x,
                y: self.input.scroll.y,
                max_y,
            },
            frames,
            text,
            headings,
            elements,
            form_fields,
            tables,
            links,
            dialogs,
            console: Vec::new(),
            truncated: self.truncated,
            stats: Stats::default(),
        };
        content.stats = Stats {
            elements_total,
            elements_shown: content.elements.len(),
            text_chars: content.text.chars().count(),
            approx_tokens: content.rendered_chars_for(self.request.scope).div_ceil(4),
        };
        if self.apply_token_budget(&mut content) {
            content.truncated = true;
        }
        content
    }

    fn apply_token_budget(&self, content: &mut ObservationContent) -> bool {
        let max = self.request.max_tokens.max(1);
        let scope = self.request.scope;
        let mut truncated = false;
        while content.rendered_chars_for(scope).div_ceil(4) > max && !content.elements.is_empty() {
            content.elements.pop();
            truncated = true;
        }
        while content.rendered_chars_for(scope).div_ceil(4) > max && !content.links.is_empty() {
            content.links.pop();
            truncated = true;
        }
        while content.rendered_chars_for(scope).div_ceil(4) > max && !content.tables.is_empty() {
            content.tables.pop();
            truncated = true;
        }
        while content.rendered_chars_for(scope).div_ceil(4) > max && !content.dialogs.is_empty() {
            content.dialogs.pop();
            truncated = true;
        }
        while content.rendered_chars_for(scope).div_ceil(4) > max && content.headings.len() > 1 {
            content.headings.pop();
            truncated = true;
        }
        while content.rendered_chars_for(scope).div_ceil(4) > max
            && content.text.chars().count() > 32
        {
            let keep = content.text.chars().count().saturating_mul(3) / 4;
            content.text = truncate_chars(&content.text, keep.max(32));
            truncated = true;
        }
        content.stats.approx_tokens = content.rendered_chars_for(scope).div_ceil(4);
        content.stats.elements_shown = content.elements.len();
        content.stats.text_chars = content.text.chars().count();
        truncated
    }
}

fn heading_level(e: &ElementData) -> Option<u8> {
    if let Some(level) = e.attr("aria-level").and_then(|v| v.parse().ok())
        && e.attr("role")
            .is_some_and(|r| r.eq_ignore_ascii_case("heading"))
    {
        return Some(level);
    }
    match e.name.as_str() {
        "h1" => Some(1),
        "h2" => Some(2),
        "h3" => Some(3),
        "h4" => Some(4),
        "h5" => Some(5),
        "h6" => Some(6),
        _ if e
            .attr("role")
            .is_some_and(|r| r.eq_ignore_ascii_case("heading")) =>
        {
            Some(2)
        }
        _ => None,
    }
}

/// Constraint validation subset: `required`, `type=email`, `minlength` /
/// `maxlength`, numeric `min` / `max`, `aria-invalid`.
fn validity(e: &ElementData, type_: &str, value: &str, required: bool) -> (bool, String) {
    if e.attr("aria-invalid")
        .is_some_and(|v| !v.eq_ignore_ascii_case("false"))
    {
        return (false, "Invalid value.".into());
    }
    let empty = value.trim().is_empty();
    if required && empty {
        return (
            false,
            match type_ {
                "checkbox" => "Please check this box if you want to proceed.".into(),
                "radio" => "Please select one of these options.".into(),
                "select" | "select-multiple" => "Please select an item in the list.".into(),
                _ => "Please fill out this field.".into(),
            },
        );
    }
    if empty {
        return (true, String::new());
    }
    match type_ {
        "email" => {
            if !value.contains('@') {
                return (
                    false,
                    format!(
                        "Please include an '@' in the email address. '{value}' is missing an '@'."
                    ),
                );
            }
            if value.ends_with('@') || value.starts_with('@') {
                return (false, "Please enter a part following '@'.".into());
            }
        }
        "url" => {
            if url::Url::parse(value).is_err() {
                return (false, "Please enter a URL.".into());
            }
        }
        "number" | "range" => match value.parse::<f64>() {
            Err(_) => return (false, "Please enter a number.".into()),
            Ok(n) => {
                if let Some(min) = e.attr("min").and_then(|m| m.parse::<f64>().ok())
                    && n < min
                {
                    return (
                        false,
                        format!("Value must be greater than or equal to {min}."),
                    );
                }
                if let Some(max) = e.attr("max").and_then(|m| m.parse::<f64>().ok())
                    && n > max
                {
                    return (false, format!("Value must be less than or equal to {max}."));
                }
            }
        },
        _ => {}
    }
    if let Some(min) = e.attr("minlength").and_then(|m| m.parse::<usize>().ok())
        && value.chars().count() < min
    {
        return (
            false,
            format!("Please lengthen this text to {min} characters or more."),
        );
    }
    if let Some(max) = e.attr("maxlength").and_then(|m| m.parse::<usize>().ok())
        && value.chars().count() > max
    {
        return (
            false,
            format!("Please shorten this text to {max} characters or less."),
        );
    }
    (true, String::new())
}

/// Public helper: classify one element (used by the agent's actionability
/// checks so both agree on "shown").
#[must_use]
pub fn classify(input: &ObserveInput<'_>, id: NodeId) -> Visibility5 {
    let request = ObservationRequest::default();
    let mut builder = Builder::new(input, &request);
    builder.visibility(id)
}

/// The "block-level" test used for text line breaking; exposed for tests.
#[must_use]
pub fn is_block_level_style(style: &ComputedStyle) -> bool {
    is_block_display(style)
}

#[cfg(test)]
mod tests {
    use super::*;
    use ve_layout::LayoutEngine;
    use ve_style::{MediaEnv, StyleEngine};

    #[test]
    fn parse_ref_accepts_generation_suffixes() {
        assert_eq!(parse_ref_parts("r12"), Some((12, None)));
        assert_eq!(parse_ref_parts("r12.3"), Some((12, Some(3))));
        assert_eq!(parse_ref_parts("r12:3"), Some((12, Some(3))));
        assert_eq!(parse_ref("r12:3"), Some(12));
        assert_eq!(parse_ref_parts("x12"), None);
    }

    struct Page {
        doc: Document,
        styles: StyleTree,
        layout: LayoutTree,
        viewport: Size,
    }

    fn page(html: &str) -> Page {
        page_with_viewport(html, Size::new(1280.0, 720.0))
    }

    fn page_with_viewport(html: &str, viewport: Size) -> Page {
        let doc = ve_html::parse_document(html).document;
        let mut engine = StyleEngine::new();
        engine.media = MediaEnv::screen(viewport.width, viewport.height);
        engine.add_document_styles(&doc);
        let styles = engine.compute(&doc);
        let layout = LayoutEngine::new().layout(&doc, &styles, viewport);
        Page {
            doc,
            styles,
            layout,
            viewport,
        }
    }

    impl Page {
        fn input(&self) -> ObserveInput<'_> {
            ObserveInput {
                doc: &self.doc,
                styles: &self.styles,
                layout: &self.layout,
                viewport: self.viewport,
                scale: 1.0,
                scroll: Point::ZERO,
                focused: None,
                url: "https://app.test/records?page=2",
                base_url: None,
                pending_dialogs: &[],
                restrict: None,
            }
        }

        fn observe(&self, request: &ObservationRequest) -> ObservationContent {
            observe(&self.input(), request)
        }

        fn compact(&self) -> ObservationContent {
            self.observe(&ObservationRequest::default())
        }

        fn full(&self) -> ObservationContent {
            self.observe(&ObservationRequest {
                format: Format::Full,
                ..ObservationRequest::default()
            })
        }

        fn id(&self, css_id: &str) -> NodeId {
            self.doc.element_by_id(css_id).expect(css_id)
        }
    }

    const APP: &str = r#"<!doctype html><html><head><title>Records — fixture</title>
        <style>body{margin:0;font-size:16px;line-height:20px} .sr{position:absolute;width:1px;height:1px;overflow:hidden}
        .tiny{font-size:4px;color:#fff;background:#fff}</style></head>
        <body>
        <header><h1>Records</h1><nav aria-label="Main"><a href="/records">All records</a> <a href="new">New record</a></nav></header>
        <main>
          <form method="get" action="/records"><label for="status">Filter by status</label>
            <select id="status" name="status"><option value="">All statuses</option><option value="draft" selected>draft</option></select>
            <label for="q">Search</label><input id="q" name="q" placeholder="Find" required>
            <input type="checkbox" id="archived" name="archived" checked><label for="archived">Include archived</label>
            <button id="apply" type="submit">Apply filter</button></form>
          <table id="records"><caption>All records</caption><thead><tr><th>Title</th><th>Owner</th><th>Status</th></tr></thead>
            <tbody><tr><td><a href="/records/rec-01">Record 01</a></td><td>Alex</td><td>draft</td></tr>
            <tr><td><a href="/records/rec-02">Record 02</a></td><td>Sam</td><td>approved</td></tr></tbody></table>
          <p>Showing <b>2</b> records.<span class="sr">Screen reader only text</span><span class="tiny">tiny hidden</span></p>
          <div hidden><button id="ghost">Ghost</button></div>
          <button id="off" style="position:absolute;top:5000px">Way down</button>
          <dialog open id="dlg"><p>Are you sure?</p><button>Yes</button></dialog>
        </main>
        <footer><a href="https://other.test/about">About</a></footer>
        <iframe src="/embed" name="emb"></iframe><iframe src="https://cdn.other.test/w"></iframe>
        </body></html>"#;

    #[test]
    fn compact_observation_has_exact_wire_shape() {
        let p = page(APP);
        let obs = p.compact();
        let json = serde_json::to_value(&obs).unwrap();
        let mut keys: Vec<&str> = json
            .as_object()
            .unwrap()
            .keys()
            .map(String::as_str)
            .collect();
        keys.sort_unstable();
        let mut expected = [
            "url",
            "title",
            "viewport",
            "scroll",
            "frames",
            "text",
            "headings",
            "elements",
            "formFields",
            "tables",
            "links",
            "dialogs",
            "truncated",
            "stats",
        ];
        expected.sort_unstable();
        assert_eq!(keys, expected, "exactly the ObservationContent keys");
        assert_eq!(json["title"], "Records — fixture");
        assert_eq!(json["url"], "https://app.test/records?page=2");
        assert_eq!(
            json["viewport"],
            serde_json::json!({"width": 1280.0, "height": 720.0, "scale": 1.0})
        );
        assert_eq!(json["scroll"]["x"], 0.0);
        assert!(
            json["scroll"]["maxY"].as_f64().unwrap() > 0.0,
            "page taller than viewport"
        );
        let stats = &json["stats"];
        for k in [
            "elementsTotal",
            "elementsShown",
            "textChars",
            "approxTokens",
        ] {
            assert!(stats.get(k).is_some(), "stats.{k}");
        }
        assert_eq!(
            stats["approxTokens"].as_u64().unwrap() as usize,
            obs.rendered_chars().div_ceil(4)
        );
        let first = &json["elements"][0];
        assert!(first["ref"].as_str().unwrap().starts_with('r'));
        assert!(
            first.get("frame").is_none(),
            "compact: default frame omitted"
        );
        assert!(
            first.get("selector").is_none(),
            "compact: empty selector omitted"
        );
        assert!(first.get("rect").is_none(), "compact: no rect");
        let field = &json["formFields"][0];
        assert!(field.get("type").is_some() && field.get("ref").is_some());
    }

    #[test]
    fn refs_are_arena_indices_and_round_trip() {
        let p = page(APP);
        let obs = p.compact();
        let apply = p.id("apply");
        let e = obs.element(&ref_for(apply)).expect("apply button listed");
        assert_eq!(e.reference, format!("r{}", apply.index()));
        assert_eq!(parse_ref(&e.reference), Some(apply.index()));
        assert_eq!(parse_ref("r"), None);
        assert_eq!(parse_ref("n12.0"), None);
        assert_eq!(parse_ref("r12x"), None);
        assert_eq!(
            (e.role.as_deref(), e.name.as_deref(), e.type_.as_deref()),
            (Some("button"), Some("Apply filter"), Some("submit"))
        );
    }

    #[test]
    fn elements_carry_values_checked_selected_and_hrefs() {
        let p = page(APP);
        let obs = p.compact();
        let select = obs.element(&ref_for(p.id("status"))).unwrap();
        assert_eq!(select.role.as_deref(), Some("combobox"));
        assert_eq!(select.value.as_deref(), Some("draft"));
        assert_eq!(select.selected.as_deref(), Some("draft"));
        assert_eq!(select.name.as_deref(), Some("Filter by status"));
        let q = obs.element(&ref_for(p.id("q"))).unwrap();
        assert_eq!(
            q.value.as_deref(),
            Some(""),
            "empty text field still reports value"
        );
        assert_eq!(q.placeholder.as_deref(), Some("Find"));
        assert_eq!(q.type_.as_deref(), Some("text"));
        let cb = obs.element(&ref_for(p.id("archived"))).unwrap();
        assert_eq!(cb.checked, Some(true));
        assert!(cb.value.is_none(), "checkboxes do not carry a value");
        assert_eq!(cb.name.as_deref(), Some("Include archived"));
        let link = obs
            .elements
            .iter()
            .find(|e| e.name.as_deref() == Some("New record"))
            .unwrap();
        assert_eq!(
            link.href.as_deref(),
            Some("https://app.test/new"),
            "relative href resolved"
        );
        assert_eq!(link.role.as_deref(), Some("link"));
        assert!(
            obs.links
                .iter()
                .any(|l| l.href == "https://other.test/about" && l.text == "About")
        );
    }

    #[test]
    fn hidden_offscreen_and_dialog_classification() {
        let p = page(APP);
        let obs = p.compact();
        assert!(
            obs.element(&ref_for(p.id("ghost"))).is_none(),
            "display:none subtree excluded"
        );
        let off = obs
            .element(&ref_for(p.id("off")))
            .expect("offscreen element still listed");
        let off_pos = obs
            .elements
            .iter()
            .position(|e| e.reference == off.reference)
            .unwrap();
        let last_in_view = obs
            .elements
            .iter()
            .rposition(|e| e.name.as_deref() == Some("Apply filter"))
            .unwrap();
        assert!(off_pos > last_in_view, "offscreen sorted after in-viewport");
        assert!(
            !obs.text.contains("Screen reader only"),
            "sr-only text excluded"
        );
        assert!(
            !obs.text.contains("tiny hidden"),
            "same-colour tiny text excluded"
        );
        assert!(obs.text.contains("Showing 2 records."));
        assert_eq!(obs.dialogs.len(), 1);
        assert_eq!(obs.dialogs[0].type_, "dialog");
        assert!(obs.dialogs[0].message.contains("Are you sure?"));

        let full = p.full();
        let off = full.element(&ref_for(p.id("off"))).unwrap();
        assert_eq!(off.offscreen, Some(true));
        assert_eq!(off.hidden, Some(false));
        assert!(off.rect.unwrap().y >= 4000.0);
        assert!(
            full.element(&ref_for(p.id("ghost"))).is_none(),
            "display:none stays out even in Full"
        );
    }

    #[test]
    fn text_has_landmark_markers_headings_and_block_breaks() {
        let p = page(APP);
        let obs = p.compact();
        assert_eq!(obs.headings, vec!["Records"]);
        let lines: Vec<&str> = obs.text.lines().collect();
        assert_eq!(lines[0], "[header]");
        assert_eq!(lines[1], "# Records");
        assert!(lines.contains(&"[nav]"), "{lines:?}");
        assert!(lines.contains(&"[main]"));
        assert!(lines.contains(&"[footer]"));
        assert!(lines.contains(&"[table: All records]"), "{lines:?}");
        assert!(
            lines.iter().any(|l| l.contains("All records New record")),
            "inline links stay on one line: {lines:?}"
        );
        assert!(
            !obs.text.contains("Record 01"),
            "table cells are not dumped into text"
        );
        assert_eq!(obs.stats.text_chars, obs.text.chars().count());
    }

    #[test]
    fn tables_are_capped_at_twelve_by_twelve() {
        let mut html = String::from("<table id=t><tr>");
        for c in 0..15 {
            html.push_str(&format!("<th>C{c}</th>"));
        }
        html.push_str("</tr>");
        for r in 0..30 {
            html.push_str("<tr>");
            for c in 0..15 {
                html.push_str(&format!("<td>{r}-{c}</td>"));
            }
            html.push_str("</tr>");
        }
        html.push_str("</table>");
        let p = page(&html);
        let obs = p.compact();
        assert_eq!(obs.tables.len(), 1);
        let t = &obs.tables[0];
        assert_eq!(t.columns.len(), 12);
        assert_eq!(t.rows.len(), 12);
        assert_eq!(t.rows[0].len(), 12);
        assert_eq!(t.rows[11][0], "11-0");
        assert_eq!(t.total_rows, Some(30));
        assert!(t.truncated && obs.truncated);
        assert_eq!(t.reference, ref_for(p.id("t")));

        let small = page("<table><tr><td>a</td><td>b</td></tr></table>").compact();
        assert_eq!(
            small.tables[0].columns,
            Vec::<String>::new(),
            "no header row"
        );
        assert_eq!(small.tables[0].rows, vec![vec!["a", "b"]]);
        assert!(!small.tables[0].truncated);
    }

    #[test]
    fn element_budget_keeps_form_fields_before_links() {
        let mut html = String::from("<form><label>Q <input name=q value=held></label></form>");
        for i in 0..40 {
            html.push_str(&format!(r#"<a href="/n/{i}">link {i}</a>"#));
        }
        let p = page(&html);
        let obs = p.observe(&ObservationRequest {
            max_elements: 5,
            ..ObservationRequest::default()
        });
        assert!(obs.truncated);
        assert!(
            !obs.form_fields.is_empty(),
            "token budget must not drop the decisive form field: {obs:?}"
        );
        assert_eq!(obs.form_fields[0].name.as_deref(), Some("q"));
    }

    #[test]
    fn element_budget_is_honoured_and_reported() {
        let mut html = String::new();
        for i in 0..40 {
            html.push_str(&format!("<button>B{i}</button>"));
        }
        let p = page(&html);
        let obs = p.observe(&ObservationRequest {
            max_elements: 10,
            ..ObservationRequest::default()
        });
        assert_eq!(obs.elements.len(), 10);
        assert_eq!(obs.stats.elements_total, 40);
        assert_eq!(obs.stats.elements_shown, 10);
        assert!(obs.truncated);
        assert_eq!(
            obs.elements[0].name.as_deref(),
            Some("B0"),
            "document order within a rank"
        );
        let all = p.compact();
        assert_eq!(all.elements.len(), 40);
        assert!(!all.truncated);
    }

    #[test]
    fn text_budget_is_honoured_during_collection() {
        let mut html = String::new();
        for i in 0..200 {
            html.push_str(&format!(
                "<p>Paragraph number {i} with some filler words.</p>"
            ));
        }
        let p = page(&html);
        let obs = p.observe(&ObservationRequest {
            max_text_chars: 300,
            ..ObservationRequest::default()
        });
        assert!(obs.text.chars().count() <= 300, "{}", obs.text.len());
        assert!(obs.truncated);
        assert!(obs.text.starts_with("Paragraph number 0"));
    }

    #[test]
    fn token_budget_caps_approx_tokens() {
        let mut html = String::from("<body>");
        for i in 0..200 {
            html.push_str(&format!(
                r#"<a href="https://example.test/very/long/path/{i}/and/more/segments/here">link {i}</a>"#
            ));
        }
        html.push_str("</body>");
        let p = page(&html);
        let obs = p.observe(&ObservationRequest::default());
        assert!(
            obs.stats.approx_tokens <= 3000,
            "approx_tokens {}",
            obs.stats.approx_tokens
        );
        assert!(obs.truncated);
    }

    #[test]
    fn scopes_restrict_collection_at_the_source() {
        let p = page(APP);
        let forms = p.observe(&ObservationRequest {
            scope: Scope::Forms,
            ..ObservationRequest::default()
        });
        assert!(forms.text.is_empty() && forms.tables.is_empty() && forms.links.is_empty());
        assert!(!forms.form_fields.is_empty());
        assert!(
            forms
                .elements
                .iter()
                .all(|e| matches!(e.tag.as_str(), "input" | "select" | "textarea" | "button")),
            "{:?}",
            forms.elements.iter().map(|e| &e.tag).collect::<Vec<_>>()
        );

        let links = p.observe(&ObservationRequest {
            scope: Scope::Links,
            ..ObservationRequest::default()
        });
        assert!(
            links
                .elements
                .iter()
                .all(|e| e.role.as_deref() == Some("link"))
        );
        assert_eq!(links.links.len(), links.elements.len());
        assert!(links.form_fields.is_empty());

        let tables = p.observe(&ObservationRequest {
            scope: Scope::Tables,
            ..ObservationRequest::default()
        });
        assert_eq!(tables.tables.len(), 1);
        assert!(
            tables
                .elements
                .iter()
                .all(|e| e.name.as_deref().is_some_and(|n| n.starts_with("Record"))),
            "only controls inside tables"
        );

        let subtree = p.observe(&ObservationRequest {
            scope: Scope::Subtree,
            subtree_ref: Some(ref_for(p.id("dlg"))),
            ..ObservationRequest::default()
        });
        assert_eq!(subtree.elements.len(), 1);
        assert_eq!(subtree.elements[0].name.as_deref(), Some("Yes"));
        assert_eq!(subtree.text.trim(), "Are you sure?\n[Yes]");
        assert!(subtree.headings.is_empty());
    }

    #[test]
    fn form_fields_report_validity() {
        let p = page(
            r#"<form><input id=a required><input id=b type=email value="nope"><input id=c type=number min=1 max=5 value=9>
            <input id=d minlength=3 value=ab><input id=e aria-invalid=true value=x><input id=f value=ok required>
            <select id=g required><option value="">Pick</option></select><textarea id=h name=notes>hi</textarea></form>"#,
        );
        let obs = p.compact();
        let field = |id: &str| {
            obs.form_fields
                .iter()
                .find(|f| f.reference == ref_for(p.id(id)))
                .unwrap()
        };
        assert_eq!(
            (field("a").valid, field("a").required),
            (Some(false), Some(true))
        );
        assert_eq!(
            field("a").validation_message.as_deref(),
            Some("Please fill out this field.")
        );
        assert!(
            field("b")
                .validation_message
                .as_deref()
                .unwrap()
                .contains("'@'")
        );
        assert_eq!(
            field("c").validation_message.as_deref(),
            Some("Value must be less than or equal to 5.")
        );
        assert!(
            field("d")
                .validation_message
                .as_deref()
                .unwrap()
                .starts_with("Please lengthen")
        );
        assert_eq!(field("e").valid, Some(false));
        assert_eq!(
            (field("f").valid, field("f").validation_message.is_none()),
            (Some(true), true)
        );
        assert_eq!(
            field("g").validation_message.as_deref(),
            Some("Please select an item in the list.")
        );
        assert_eq!(
            (
                field("h").type_.as_str(),
                field("h").value.as_deref(),
                field("h").name.as_deref()
            ),
            ("textarea", Some("hi"), Some("notes"))
        );
    }

    #[test]
    fn frames_list_main_and_iframes_with_origin_check() {
        let p = page(APP);
        let obs = p.compact();
        assert_eq!(obs.frames.len(), 3);
        assert_eq!(
            (obs.frames[0].frame.as_str(), obs.frames[0].same_origin),
            ("main", true)
        );
        assert_eq!(obs.frames[1].url, "https://app.test/embed");
        assert_eq!(obs.frames[1].name.as_deref(), Some("emb"));
        assert!(obs.frames[1].same_origin);
        assert!(!obs.frames[2].same_origin);
        assert_eq!(obs.frames[2].frame, "f2");
    }

    #[test]
    fn full_format_adds_rect_selector_states_and_hidden_elements() {
        let p = page(
            r#"<style>body{margin:0}</style><main id=m><form id=f><input id=q aria-describedby=h required title="Search box"><p id=h>Helper</p>
            <button id=b aria-pressed=true>Go</button></form><details id=d><summary id=s>More</summary><p>Body</p></details>
            <button id=v style="visibility:hidden">Invisible</button></main>"#,
        );
        let mut input = p.input();
        input.focused = Some(p.id("q"));
        let full = observe(
            &input,
            &ObservationRequest {
                format: Format::Full,
                ..ObservationRequest::default()
            },
        );
        let q = full.element(&ref_for(p.id("q"))).unwrap();
        assert_eq!(q.selector.css.as_deref(), Some("#q"));
        assert_eq!(q.description.as_deref(), Some("Helper"));
        assert!(q.states.as_ref().unwrap().contains(&"focused".to_owned()));
        assert!(q.states.as_ref().unwrap().contains(&"required".to_owned()));
        assert!(q.rect.is_some());
        assert_eq!(
            (q.offscreen, q.occluded, q.hidden),
            (Some(false), Some(false), Some(false))
        );
        let b = full.element(&ref_for(p.id("b"))).unwrap();
        assert!(
            b.states
                .as_ref()
                .unwrap()
                .contains(&"pressed=true".to_owned())
        );
        assert_eq!(b.selector.role.as_ref().unwrap().role, "button");
        assert_eq!(b.selector.text.as_deref(), Some("Go"));
        let s = full.element(&ref_for(p.id("s"))).unwrap();
        assert!(
            s.states
                .as_ref()
                .unwrap()
                .contains(&"expanded=false".to_owned())
        );
        let v = full
            .element(&ref_for(p.id("v")))
            .expect("Full includes attached but unshown elements");
        assert_eq!(v.hidden, Some(true));
        assert!(
            p.compact().element(&ref_for(p.id("v"))).is_none(),
            "Compact drops it"
        );
        // CSS path for an element without id: nth-child chain ending at an id.
        let body_button = page("<div id=wrap><span></span><button>x</button></div>").full();
        assert_eq!(
            body_button.elements[0].selector.css.as_deref(),
            Some("#wrap > button:nth-child(2)")
        );
        let no_ids = page("<div><button>x</button></div>").full();
        assert_eq!(
            no_ids.elements[0].selector.css.as_deref(),
            Some("html > body > div:nth-child(1) > button:nth-child(1)")
        );
    }

    #[test]
    fn occluded_elements_are_demoted_and_flagged() {
        let p = page(
            r#"<style>body{margin:0} #cover{position:absolute;left:0;top:0;width:400px;height:100px;z-index:5}
            button{display:block;width:100px;height:30px}</style>
            <button id=under>Under</button><button id=free style="position:absolute;top:200px">Free</button><div id=cover></div>"#,
        );
        let full = p.full();
        let under = full.element(&ref_for(p.id("under"))).unwrap();
        assert_eq!(under.occluded, Some(true), "{under:?}");
        assert_eq!(
            under.occluded_by.as_deref(),
            Some(ref_for(p.id("cover")).as_str()),
            "occludedBy names the cover"
        );
        let free = full.element(&ref_for(p.id("free"))).unwrap();
        assert_eq!(free.occluded, Some(false));
        assert!(free.occluded_by.is_none());
        let compact = p.compact();
        assert_eq!(
            compact.elements[0].reference,
            ref_for(p.id("free")),
            "occluded sorted after"
        );
        assert_eq!(compact.elements[1].reference, ref_for(p.id("under")));
    }

    #[test]
    fn protocol_fields_frame_chain_scroll_shadow_and_occluder() {
        let p = page(
            r#"<style>#box{height:40px;overflow:auto}</style>
            <div id=box><button id=in>In</button></div>
            <div id=host><template shadowrootmode="open"><button id=s>Shadow</button></template></div>"#,
        );
        let full = p.full();
        let inner = full.element(&ref_for(p.id("in"))).unwrap();
        assert_eq!(inner.frame_chain, vec!["main".to_string()]);
        assert_eq!(
            inner.scroll_container.as_deref(),
            Some(ref_for(p.id("box")).as_str())
        );
        let shadow = full
            .elements
            .iter()
            .find(|e| e.name.as_deref() == Some("Shadow"))
            .expect("shadow button is observed");
        assert!(shadow.shadow_depth >= 1, "{shadow:?}");
    }

    #[test]
    fn held_out_task_controls_are_in_the_top_forty() {
        let cases = [
            (
                include_str!("../../../../tests/held-out/pages/increment.html"),
                "Increment",
            ),
            (
                include_str!("../../../../tests/held-out/pages/submit.html"),
                "Name",
            ),
            (
                include_str!("../../../../tests/held-out/pages/table.html"),
                "Widget",
            ),
        ];
        for (html, needle) in cases {
            let p = page(html);
            let obs = p.compact();
            let top: Vec<String> = obs
                .elements
                .iter()
                .take(40)
                .map(|e| {
                    format!(
                        "{} {} {}",
                        e.name.as_deref().unwrap_or(""),
                        e.text.as_deref().unwrap_or(""),
                        e.role.as_deref().unwrap_or("")
                    )
                })
                .collect();
            let hit = top.iter().any(|t| t.contains(needle))
                || obs
                    .form_fields
                    .iter()
                    .take(40)
                    .any(|f| f.label.as_deref().unwrap_or("").contains(needle))
                || obs
                    .tables
                    .iter()
                    .any(|t| t.rows.iter().any(|r| r.iter().any(|c| c.contains(needle))));
            assert!(hit, "task control {needle:?} missing from top 40: {top:?}");
        }
    }

    #[test]
    fn ranking_puts_form_fields_before_links_and_below_fold_last() {
        let p = page_with_viewport(
            r#"<style>body{margin:0} div{height:400px}</style>
            <a id=l1 href="/a">Top link</a><button id=b1>Top button</button>
            <div></div><input id=i1 aria-label="Below field"><a id=l2 href="/b">Below link</a><button id=b2>Below button</button>"#,
            Size::new(800.0, 300.0),
        );
        let obs = p.compact();
        let order: Vec<String> = obs.elements.iter().map(|e| e.reference.clone()).collect();
        let expected = ["b1", "i1", "l1", "l2", "b2"].map(|id| ref_for(p.id(id)));
        assert_eq!(
            order, expected,
            "in-view interactive, form fields, in-view links, below fold"
        );
    }

    #[test]
    fn scroll_offset_moves_the_viewport_window() {
        let p = page_with_viewport(
            r#"<style>body{margin:0} div{height:1000px}</style><div></div><button id=b>Deep</button>"#,
            Size::new(800.0, 300.0),
        );
        let mut input = p.input();
        let full = ObservationRequest {
            format: Format::Full,
            ..ObservationRequest::default()
        };
        let before = observe(&input, &full);
        assert_eq!(before.elements[0].offscreen, Some(true));
        input.scroll = Point::new(0.0, 900.0);
        let after = observe(&input, &full);
        assert_eq!(after.elements[0].offscreen, Some(false));
        assert_eq!(after.scroll.y, 900.0);
        assert!(
            after.elements[0].rect.unwrap().y < 300.0,
            "rect is viewport-relative"
        );
    }

    #[test]
    fn request_defaults_and_json_names() {
        let req: ObservationRequest =
            serde_json::from_str(r#"{"scope":"subtree","subtreeRef":"r4","sinceRevision":9}"#)
                .unwrap();
        assert_eq!(req.scope, Scope::Subtree);
        assert_eq!(req.max_elements, 120);
        assert_eq!(req.max_text_chars, 6000);
        assert_eq!(req.since_revision, Some(9));
        assert_eq!(req.format, Format::Compact);
        let full: ObservationRequest =
            serde_json::from_str(r#"{"format":"full","maxElements":5}"#).unwrap();
        assert_eq!((full.format, full.max_elements), (Format::Full, 5));
        assert!(serde_json::from_str::<ObservationRequest>(r#"{"scope":"weird"}"#).is_err());
    }

    #[test]
    fn classify_agrees_with_observe() {
        let p = page(
            r##"<style>body{margin:0}</style><button id=a>A</button><button id=b hidden>B</button><a id=c href="#" style="width:0;height:0;display:block;overflow:hidden">skip</a>"##,
        );
        let input = p.input();
        assert!(classify(&input, p.id("a")).shown);
        assert!(!classify(&input, p.id("b")).shown);
        assert!(
            classify(&input, p.id("c")).shown,
            "zero-size focusable counts as shown"
        );
    }

    #[test]
    fn password_values_are_handles_not_secrets() {
        let p = page(
            r#"<html><body><form><input id="pw" type="password" value="s3cret-value"></form></body></html>"#,
        );
        let obs = p.compact();
        let field = obs
            .form_fields
            .iter()
            .find(|f| f.type_ == "password")
            .expect("password field");
        assert_eq!(field.value.as_deref(), Some("{handle}"));
        assert!(
            !serde_json::to_string(&obs)
                .unwrap()
                .contains("s3cret-value"),
            "secret must not appear in the observation"
        );
    }
}
