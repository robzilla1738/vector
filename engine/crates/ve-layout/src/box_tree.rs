//! Box tree construction from the DOM and computed styles.
//!
//! Besides the block/inline invariant, this module performs the CSS 2.1
//! table fix-up (§17.2.1: anonymous table, row-group, row and cell boxes),
//! generates `::before` / `::after` content boxes from the style tree's
//! pseudo-element styles, and attaches list-item markers.

use std::rc::Rc;

use ve_core::{NodeId, Point, Rect, Size};
use ve_dom::{Document, Namespace, NodeKind};

use crate::block::{ContainingBlock, Forced};
use ve_style::{
    ComputedStyle, Content, Display, FieldSizing, FontVariant, ListStylePosition, ListStyleType,
    PseudoElement, StyleTree, TextTransform, WhiteSpace,
};

/// What kind of formatting a box participates in / establishes.
#[derive(Clone, Debug, PartialEq)]
pub enum BoxKind {
    /// Block-level block container.
    Block,
    /// Inline-level, non-replaced (`<span>`): its children flow in the
    /// parent's inline formatting context.
    Inline,
    /// Atomic inline-level block container (`inline-block`, replaced elements).
    InlineBlock,
    /// Flex container (block- or inline-level).
    Flex,
    /// Grid container.
    Grid,
    /// Table wrapper (`display: table` / `inline-table`).
    Table,
    /// Table row group (`<thead>`, `<tbody>`, `<tfoot>`).
    TableRowGroup,
    /// Table row.
    TableRow,
    /// Table cell.
    TableCell,
    /// Table caption.
    TableCaption,
    /// A run of text (whitespace already collapsed per `white-space`).
    Text(String),
    /// Anonymous block wrapping inline content inside a block that also has
    /// block children, or wrapping text inside a flex/grid container.
    AnonymousBlock,
}

impl BoxKind {
    /// Returns `true` for table-internal kinds (everything but the wrapper).
    #[must_use]
    pub fn is_table_internal(&self) -> bool {
        matches!(
            self,
            BoxKind::TableRowGroup | BoxKind::TableRow | BoxKind::TableCell | BoxKind::TableCaption
        )
    }
}

/// One piece of an inline formatting context placed on a line.
#[derive(Clone, Debug, PartialEq)]
pub struct Fragment {
    /// The DOM node this fragment renders (text node or inline element;
    /// `None` for generated content).
    pub node: Option<NodeId>,
    /// The nearest element containing this fragment (what hit testing reports
    /// for text and generated content).
    pub owner: Option<NodeId>,
    /// Border-box rectangle in document coordinates.
    pub rect: Rect,
    /// The text rendered by this fragment, if it is a text fragment.
    pub text: Option<String>,
    /// Baseline offset from the fragment's top, for text fragments.
    pub baseline: f32,
    /// Clip rectangle inherited from `overflow` / `clip-path` ancestors, in
    /// document coordinates (`None` = unclipped).
    pub clip: Option<Rect>,
    /// The pseudo-element this fragment belongs to (`::before`, `::after`,
    /// `::marker`), if it is generated content.
    pub pseudo: Option<PseudoElement>,
}

/// A line box produced by inline layout.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct LineBox {
    /// Bounds of the line.
    pub rect: Rect,
    /// Fragments on the line, in visual order.
    pub fragments: Vec<Fragment>,
}

/// A list-item marker attached to a `display: list-item` box.
#[derive(Clone, Debug, PartialEq)]
pub struct Marker {
    /// Marker text including its trailing space (`"1. "`, `"• "`).
    pub text: String,
    /// `list-style-position`.
    pub position: ListStylePosition,
}

/// A node of the layout tree.
#[derive(Clone, Debug)]
pub struct LayoutBox {
    /// Generating DOM node (`None` for anonymous and generated boxes).
    pub node: Option<NodeId>,
    /// For generated content: which pseudo-element this box renders.
    pub pseudo: Option<PseudoElement>,
    /// The element hit testing and geometry attribute anonymous/generated
    /// descendants to (the originating element for `::before`, the nearest
    /// element ancestor for anonymous boxes).
    pub owner: Option<NodeId>,
    /// Formatting kind.
    pub kind: BoxKind,
    /// Computed style (anonymous boxes inherit their parent's).
    pub style: Rc<ComputedStyle>,
    /// Child boxes (empty for text and for boxes that hold line boxes).
    pub children: Vec<LayoutBox>,
    /// Border-box rectangle, valid after layout.
    pub rect: Rect,
    /// Content-box rectangle, valid after layout.
    pub content: Rect,
    /// Line boxes if this box establishes an inline formatting context.
    pub lines: Vec<LineBox>,
    /// Clip rectangle applied to this box by its ancestors (document
    /// coordinates), valid after layout. `None` = unclipped.
    pub clip: Option<Rect>,
    /// `colspan` for table cells (≥ 1).
    pub col_span: u32,
    /// `rowspan` for table cells (≥ 1; 0 means "to the end of the row group").
    pub row_span: u32,
    /// List marker, for `display: list-item` boxes.
    pub marker: Option<Marker>,
    /// The marker's placed fragment, valid after layout.
    pub marker_fragment: Option<Fragment>,
    /// Width of the containing block this box was last laid out against
    /// (recorded so a subtree can be re-laid-out in place).
    pub cb_width: f32,
    /// Memoised `(min-content, max-content)` widths, valid for one layout
    /// pass (the box tree is rebuilt whenever styles change).
    pub intrinsic_cache: Option<(f32, f32)>,
    /// Memoised complete layouts of this box for a flex/grid parent, keyed
    /// by the inputs that fully determine an independent formatting
    /// context's geometry. Same lifetime as [`Self::intrinsic_cache`]. See
    /// `flex::layout_item`.
    pub layout_cache: Vec<LayoutMemo>,
    /// Intrinsic content size of a replaced element (`<img>`, `<iframe>`,
    /// `<video>`, `<canvas>`, …) in CSS px: the fetched natural size, the
    /// `width`/`height` attributes, or the 300×150 default. Used when CSS
    /// leaves the corresponding dimension `auto`; one specified dimension
    /// scales the other by the intrinsic ratio.
    pub replaced: Option<Size>,
}

/// One memoised layout of a flex/grid item: the inputs it was laid out
/// with and the resulting subtree (with nested caches stripped, so memos do
/// not nest).
#[derive(Clone, Debug)]
pub struct LayoutMemo {
    /// Containing block the item was sized against.
    pub cb: ContainingBlock,
    /// Sizes forced by the container.
    pub forced: Forced,
    /// Margin-box origin the snapshot is positioned at.
    pub origin: Point,
    /// The laid-out box.
    pub snapshot: Box<LayoutBox>,
}

impl LayoutBox {
    /// Creates an unlaid-out box.
    #[must_use]
    pub fn new(node: Option<NodeId>, kind: BoxKind, style: Rc<ComputedStyle>) -> Self {
        Self {
            node,
            pseudo: None,
            owner: node,
            kind,
            style,
            children: Vec::new(),
            rect: Rect::ZERO,
            content: Rect::ZERO,
            lines: Vec::new(),
            clip: None,
            col_span: 1,
            row_span: 1,
            marker: None,
            marker_fragment: None,
            cb_width: 0.0,
            intrinsic_cache: None,
            layout_cache: Vec::new(),
            replaced: None,
        }
    }

    /// Drops every layout memo in this subtree.
    pub fn clear_layout_caches(&mut self) {
        self.layout_cache.clear();
        for child in &mut self.children {
            child.clear_layout_caches();
        }
    }

    /// Clones the laid-out subtree without any `layout_cache` entries. Unlike
    /// `clone()` + [`Self::clear_layout_caches`], this never copies the
    /// descendants' memos (each of which holds its own subtree snapshot), so
    /// the cost is one pass over the live boxes.
    #[must_use]
    pub fn snapshot_without_caches(&mut self) -> LayoutBox {
        let cache = std::mem::take(&mut self.layout_cache);
        let children = std::mem::take(&mut self.children);
        let mut snap = self.clone();
        let mut children = children;
        snap.children = children
            .iter_mut()
            .map(LayoutBox::snapshot_without_caches)
            .collect();
        self.children = children;
        self.layout_cache = cache;
        snap
    }

    /// Returns `true` if the box is block-level in its parent's flow.
    #[must_use]
    pub fn is_block_level(&self) -> bool {
        match self.kind {
            BoxKind::Block
            | BoxKind::AnonymousBlock
            | BoxKind::TableRowGroup
            | BoxKind::TableRow
            | BoxKind::TableCell
            | BoxKind::TableCaption => true,
            BoxKind::Flex | BoxKind::Grid | BoxKind::Table => self.style.display.is_block_level(),
            BoxKind::Inline | BoxKind::InlineBlock | BoxKind::Text(_) => false,
        }
    }

    /// Returns `true` if the box is out of normal flow (`absolute` / `fixed`).
    #[must_use]
    pub fn is_out_of_flow(&self) -> bool {
        self.node.is_some() && self.style.position.is_out_of_flow()
    }

    /// Returns `true` if the box is a float (in flow, but placed by the float
    /// rules rather than the block or inline flow).
    #[must_use]
    pub fn is_float(&self) -> bool {
        (self.node.is_some() || self.pseudo.is_some()) && self.style.is_floating()
    }

    /// Returns `true` if the box takes part in the normal block/inline flow
    /// of its parent (neither positioned out of flow nor floated).
    #[must_use]
    pub fn is_in_flow(&self) -> bool {
        !self.is_out_of_flow() && !self.is_float()
    }

    /// Returns `true` if the box has its own margins/padding/border (i.e. is
    /// not anonymous).
    #[must_use]
    pub fn has_own_edges(&self) -> bool {
        self.node.is_some() || self.pseudo.is_some()
    }

    /// Returns `true` if the box establishes a block formatting context.
    #[must_use]
    pub fn establishes_bfc(&self) -> bool {
        matches!(
            self.kind,
            BoxKind::InlineBlock
                | BoxKind::Flex
                | BoxKind::Grid
                | BoxKind::Table
                | BoxKind::TableCell
                | BoxKind::TableCaption
        ) || (self.has_own_edges() && self.style.establishes_bfc())
    }

    /// Lowest edge reached by this box or any descendant / line.
    #[must_use]
    pub fn overflow_bottom(&self) -> f32 {
        let mut bottom = self.rect.bottom();
        for line in &self.lines {
            bottom = bottom.max(line.rect.bottom());
        }
        for child in &self.children {
            bottom = bottom.max(child.overflow_bottom());
        }
        bottom
    }

    /// Depth-first iterator over this box and all descendants.
    pub fn iter(&self) -> impl Iterator<Item = &LayoutBox> {
        let mut stack = vec![self];
        std::iter::from_fn(move || {
            let next = stack.pop()?;
            stack.extend(next.children.iter().rev());
            Some(next)
        })
    }

    /// Finds the box generated by `node` (depth first).
    #[must_use]
    pub fn find(&self, node: NodeId) -> Option<&LayoutBox> {
        self.iter().find(|b| b.node == Some(node))
    }

    /// Mutable variant of [`Self::find`].
    pub fn find_mut(&mut self, node: NodeId) -> Option<&mut LayoutBox> {
        if self.node == Some(node) {
            return Some(self);
        }
        for child in &mut self.children {
            if let Some(found) = child.find_mut(node) {
                return Some(found);
            }
        }
        None
    }

    /// Number of boxes in this subtree (including `self`).
    #[must_use]
    pub fn count(&self) -> usize {
        self.iter().count()
    }
}

/// Builds the box tree for the document element. Returns an empty block if
/// the document has no root element.
#[must_use]
pub fn build_box_tree(doc: &Document, styles: &StyleTree) -> LayoutBox {
    let Some(root) = doc.document_element() else {
        return LayoutBox::new(None, BoxKind::Block, Rc::new(ComputedStyle::initial()));
    };
    build_element_box(doc, styles, root)
        .unwrap_or_else(|| LayoutBox::new(None, BoxKind::Block, Rc::new(ComputedStyle::initial())))
}

/// Builds the box subtree for one element (`None` for `display: none` or
/// `display: contents`, which have no box of their own).
#[must_use]
pub fn build_element_box(doc: &Document, styles: &StyleTree, id: NodeId) -> Option<LayoutBox> {
    let style = styles.style(id);
    match style.display {
        Display::None | Display::Contents => None,
        Display::TableColumn | Display::TableColumnGroup => None,
        display => {
            let mut bx = LayoutBox::new(Some(id), container_kind(display), style.clone());
            if let Some(e) = doc.element(id)
                && e.is_html("td") | e.is_html("th")
            {
                bx.col_span = span_attr(doc, id, "colspan", 1);
                bx.row_span = span_attr(doc, id, "rowspan", 1);
            }
            bx.replaced =
                replaced_size(doc, id).or_else(|| field_sizing_content_size(doc, id, &style));
            if display == Display::ListItem {
                bx.marker = marker_for(doc, styles, id, &style);
            }
            if let Some(before) = styles.pseudo(id, PseudoElement::Before) {
                push_generated(&mut bx, id, PseudoElement::Before, before);
            }
            build_children(doc, styles, id, &mut bx);
            if let Some(after) = styles.pseudo(id, PseudoElement::After) {
                push_generated(&mut bx, id, PseudoElement::After, after);
            }
            normalize(&mut bx);
            Some(bx)
        }
    }
}

/// Intrinsic size for replaced elements. Fetched natural size wins; then
/// the `width`/`height` presentational attributes (one of them scales the
/// other by the natural ratio when known); embedded content defaults to
/// 300×150 (CSS 2 §10.3.2); an image with nothing known is 0×0.
fn replaced_size(doc: &Document, id: NodeId) -> Option<Size> {
    let e = doc.element(id)?;
    let is_img = e.is_html("img")
        || (e.is_html("input")
            && doc
                .attribute(id, "type")
                .is_some_and(|t| t.eq_ignore_ascii_case("image")));
    let is_svg =
        e.name == "svg" && (e.namespace == Namespace::Svg || e.namespace == Namespace::Html);
    let embedded = e.is_html("iframe")
        || e.is_html("video")
        || e.is_html("canvas")
        || e.is_html("embed")
        || e.is_html("object")
        || is_svg;
    if !is_img && !embedded {
        return None;
    }
    let attr_px = |name: &str| -> Option<f32> {
        let v = doc.attribute(id, name)?.trim();
        let v = v.strip_suffix("px").unwrap_or(v);
        v.parse::<f32>().ok().filter(|n| n.is_finite() && *n >= 0.0)
    };
    let (aw, ah) = (attr_px("width"), attr_px("height"));
    let natural = e
        .natural_size
        .map(|(w, h)| Size::new(w as f32, h as f32))
        .or_else(|| embedded.then(|| Size::new(300.0, 150.0)));
    let size = match (aw, ah, natural) {
        (Some(w), Some(h), _) => Size::new(w, h),
        (Some(w), None, Some(n)) if n.width > 0.0 => Size::new(w, w * n.height / n.width),
        (None, Some(h), Some(n)) if n.height > 0.0 => Size::new(h * n.width / n.height, h),
        (Some(w), None, _) => Size::new(w, 0.0),
        (None, Some(h), _) => Size::new(0.0, h),
        (None, None, Some(n)) => n,
        (None, None, None) => Size::new(0.0, 0.0),
    };
    Some(size)
}

/// `field-sizing: content` sizes an `<input>` / `<textarea>` to its value.
fn field_sizing_content_size(doc: &Document, id: NodeId, style: &ComputedStyle) -> Option<Size> {
    if style.field_sizing != FieldSizing::Content {
        return None;
    }
    let e = doc.element(id)?;
    let is_input = e.is_html("input");
    let is_textarea = e.is_html("textarea");
    if !is_input && !is_textarea {
        return None;
    }
    let value = if is_input {
        doc.attribute(id, "value").unwrap_or("").to_string()
    } else {
        doc.text_content(id)
    };
    let em = style.font_size.max(1.0);
    let ch = em * 0.5;
    let mut cols = 0usize;
    let mut lines = 0usize;
    for line in value.split('\n') {
        cols = cols.max(line.chars().count());
        lines += 1;
    }
    lines = lines.max(1);
    Some(Size::new(ch * cols as f32, em * 1.2 * lines as f32))
}

fn span_attr(doc: &Document, id: NodeId, name: &str, default: u32) -> u32 {
    doc.attribute(id, name)
        .and_then(|v| v.trim().parse::<u32>().ok())
        .map_or(default, |v| {
            let min = u32::from(name != "rowspan");
            v.clamp(min, 1000)
        })
}

fn container_kind(display: Display) -> BoxKind {
    match display {
        Display::Flex | Display::InlineFlex => BoxKind::Flex,
        Display::Grid | Display::InlineGrid => BoxKind::Grid,
        Display::Inline => BoxKind::Inline,
        Display::InlineBlock => BoxKind::InlineBlock,
        Display::Table | Display::InlineTable => BoxKind::Table,
        Display::TableRowGroup | Display::TableHeaderGroup | Display::TableFooterGroup => {
            BoxKind::TableRowGroup
        }
        Display::TableRow => BoxKind::TableRow,
        Display::TableCell => BoxKind::TableCell,
        Display::TableCaption => BoxKind::TableCaption,
        _ => BoxKind::Block,
    }
}

/// Appends a `::before` / `::after` box (with its text child) to `parent`.
fn push_generated(
    parent: &mut LayoutBox,
    owner: NodeId,
    pseudo: PseudoElement,
    style: &Rc<ComputedStyle>,
) {
    let Content::Text(text) = &style.content else {
        return;
    };
    let collapsed = apply_text_casing(&collapse_whitespace(text, style.white_space), style);
    let mut bx = LayoutBox::new(None, container_kind(style.display), style.clone());
    bx.pseudo = Some(pseudo);
    bx.owner = Some(owner);
    if !collapsed.is_empty() {
        let mut text_box = LayoutBox::new(None, BoxKind::Text(collapsed), style.clone());
        text_box.pseudo = Some(pseudo);
        text_box.owner = Some(owner);
        bx.children.push(text_box);
    }
    parent.children.push(bx);
}

/// Computes the marker for a `display: list-item` element: its ordinal among
/// preceding list-item siblings (honouring `<ol start>`, `<li value>` and
/// `reversed`) rendered with `list-style-type`.
fn marker_for(
    doc: &Document,
    styles: &StyleTree,
    id: NodeId,
    style: &ComputedStyle,
) -> Option<Marker> {
    if style.list_style_type == ListStyleType::None {
        return None;
    }
    let parent = doc.parent(id);
    let siblings: Vec<NodeId> = parent
        .map(|p| {
            doc.children(p)
                .filter(|&c| {
                    doc.get(c).is_some_and(ve_dom::Node::is_element)
                        && styles.style(c).display == Display::ListItem
                })
                .collect()
        })
        .unwrap_or_default();
    let reversed = parent.is_some_and(|p| doc.attribute(p, "reversed").is_some());
    let start = parent
        .and_then(|p| doc.attribute(p, "start"))
        .and_then(|s| s.trim().parse::<i32>().ok());
    let mut ordinal = start.unwrap_or(if reversed { siblings.len() as i32 } else { 1 });
    for sib in &siblings {
        if let Some(v) = doc
            .attribute(*sib, "value")
            .and_then(|s| s.trim().parse::<i32>().ok())
        {
            ordinal = v;
        }
        if *sib == id {
            break;
        }
        ordinal += if reversed { -1 } else { 1 };
    }
    let text = style.list_style_type.marker_text(ordinal);
    if text.is_empty() {
        return None;
    }
    Some(Marker {
        text: format!("{text} "),
        position: style.list_style_position,
    })
}

/// Appends boxes for the children of `node` to `parent`.
fn build_children(doc: &Document, styles: &StyleTree, node: NodeId, parent: &mut LayoutBox) {
    for child in doc.children(node) {
        let Some(n) = doc.get(child) else { continue };
        match &n.kind {
            NodeKind::Element(_) => {
                let style = styles.style(child);
                match style.display {
                    Display::Contents => build_children(doc, styles, child, parent),
                    _ => {
                        if let Some(bx) = build_element_box(doc, styles, child) {
                            parent.children.push(bx);
                        }
                    }
                }
            }
            NodeKind::Text(text) => {
                let style = styles.style(child);
                let collapsed =
                    apply_text_casing(&collapse_whitespace(text, style.white_space), &style);
                if !collapsed.is_empty() {
                    let mut bx = LayoutBox::new(Some(child), BoxKind::Text(collapsed), style);
                    bx.owner = Some(node);
                    parent.children.push(bx);
                }
            }
            _ => {}
        }
    }
}

/// Collapses whitespace according to `white-space`. Newlines are kept as
/// `\n` where the property preserves them so inline layout can force breaks.
#[must_use]
fn apply_text_casing(text: &str, style: &ComputedStyle) -> String {
    let transformed = match style.text_transform {
        TextTransform::None => text.to_owned(),
        TextTransform::Uppercase => text.to_uppercase(),
        TextTransform::Lowercase => text.to_lowercase(),
        TextTransform::Capitalize => {
            let mut out = String::with_capacity(text.len());
            let mut start = true;
            for c in text.chars() {
                if c.is_whitespace() {
                    start = true;
                    out.push(c);
                } else if start {
                    out.extend(c.to_uppercase());
                    start = false;
                } else {
                    out.push(c);
                }
            }
            out
        }
    };
    if style.font_variant == FontVariant::SmallCaps {
        transformed.to_uppercase()
    } else {
        transformed
    }
}

/// Collapses text according to the computed CSS `white-space` mode.
pub fn collapse_whitespace(text: &str, ws: WhiteSpace) -> String {
    if !ws.collapses() {
        return text.to_owned();
    }
    let mut out = String::with_capacity(text.len());
    let mut pending_space = false;
    let mut pending_newline = false;
    for ch in text.chars() {
        match ch {
            '\n' | '\r' if ws.preserves_newlines() => pending_newline = true,
            c if c.is_whitespace() => pending_space = true,
            c => {
                if pending_newline {
                    out.push('\n');
                } else if pending_space {
                    out.push(' ');
                }
                pending_space = false;
                pending_newline = false;
                out.push(c);
            }
        }
    }
    if pending_newline {
        out.push('\n');
    } else if pending_space {
        out.push(' ');
    }
    out
}

fn is_space_text(bx: &LayoutBox) -> bool {
    matches!(&bx.kind, BoxKind::Text(t) if t.trim().is_empty())
}

/// Wraps `children` in an anonymous box of `kind` carrying `style`.
fn anonymous(kind: BoxKind, style: &Rc<ComputedStyle>, owner: Option<NodeId>) -> LayoutBox {
    let display = kind_display(&kind);
    let mut anon = LayoutBox::new(None, kind, Rc::new(anonymous_style(style, &display)));
    anon.owner = owner;
    anon
}

fn kind_display(kind: &BoxKind) -> Display {
    match kind {
        BoxKind::Table => Display::Table,
        BoxKind::TableRowGroup => Display::TableRowGroup,
        BoxKind::TableRow => Display::TableRow,
        BoxKind::TableCell => Display::TableCell,
        BoxKind::TableCaption => Display::TableCaption,
        _ => Display::Block,
    }
}

/// The style of an anonymous box: inherited properties from the parent,
/// everything else initial, with the given display.
fn anonymous_style(parent: &ComputedStyle, display: &Display) -> ComputedStyle {
    let mut style = ComputedStyle::inherited_from(parent);
    style.display = *display;
    style
}

/// Enforces the block/inline invariant and the table structure rules:
///
/// * a block container's children are either all block-level or all
///   inline-level (inline runs are wrapped in anonymous blocks);
/// * flex and grid containers wrap text in anonymous items;
/// * consecutive table-internal boxes outside a table get an anonymous
///   table; tables, row groups and rows get the missing intermediate
///   anonymous boxes (§17.2.1).
///
/// Whitespace-only text between blocks is dropped.
fn normalize(bx: &mut LayoutBox) {
    match bx.kind {
        BoxKind::Table => normalize_table(bx),
        BoxKind::TableRowGroup => normalize_row_group(bx),
        BoxKind::TableRow => normalize_row(bx),
        BoxKind::Block
        | BoxKind::InlineBlock
        | BoxKind::AnonymousBlock
        | BoxKind::TableCell
        | BoxKind::TableCaption
        | BoxKind::Flex
        | BoxKind::Grid => normalize_flow(bx),
        BoxKind::Inline | BoxKind::Text(_) => {}
    }
}

fn normalize_flow(bx: &mut LayoutBox) {
    // 1. Table-internal children outside a table: wrap runs in an anonymous table.
    if bx.children.iter().any(|c| c.kind.is_table_internal()) {
        let style = bx.style.clone();
        let owner = bx.owner;
        let children = std::mem::take(&mut bx.children);
        let mut run: Vec<LayoutBox> = Vec::new();
        let flush = |run: &mut Vec<LayoutBox>, out: &mut Vec<LayoutBox>| {
            if run.is_empty() {
                return;
            }
            let mut table = anonymous(BoxKind::Table, &style, owner);
            table.children = std::mem::take(run);
            normalize_table(&mut table);
            out.push(table);
        };
        for child in children {
            if child.kind.is_table_internal() || (!run.is_empty() && is_space_text(&child)) {
                run.push(child);
            } else {
                flush(&mut run, &mut bx.children);
                bx.children.push(child);
            }
        }
        flush(&mut run, &mut bx.children);
    }

    let is_flex_or_grid = matches!(bx.kind, BoxKind::Flex | BoxKind::Grid);
    let has_block = bx
        .children
        .iter()
        .any(|c| c.is_block_level() && c.is_in_flow());
    let has_inline = bx
        .children
        .iter()
        .any(|c| !c.is_block_level() && c.is_in_flow());
    if !is_flex_or_grid && (!has_block || !has_inline) {
        return;
    }

    let style = bx.style.clone();
    let owner = bx.owner;
    let children = std::mem::take(&mut bx.children);
    let mut run: Vec<LayoutBox> = Vec::new();
    let flush = |run: &mut Vec<LayoutBox>, out: &mut Vec<LayoutBox>| {
        if run.is_empty() {
            return;
        }
        if run.iter().all(is_space_text) {
            run.clear();
            return;
        }
        let mut anon = LayoutBox::new(None, BoxKind::AnonymousBlock, style.clone());
        anon.owner = owner;
        anon.children = std::mem::take(run);
        out.push(anon);
    };
    for child in children {
        let wrap = if is_flex_or_grid {
            matches!(child.kind, BoxKind::Text(_))
                || (child.pseudo.is_some() && !child.is_block_level())
        } else {
            !child.is_block_level() && child.is_in_flow()
        };
        if wrap {
            run.push(child);
        } else if !child.is_in_flow() && !run.is_empty() && !is_flex_or_grid {
            // Floats and positioned boxes inside an inline run stay in that run.
            run.push(child);
        } else {
            flush(&mut run, &mut bx.children);
            bx.children.push(child);
        }
    }
    flush(&mut run, &mut bx.children);
}

/// Table children: captions, row groups, rows (wrapped into an anonymous
/// row group) and anything else (wrapped into anonymous row group → row →
/// cell).
fn normalize_table(bx: &mut LayoutBox) {
    let style = bx.style.clone();
    let owner = bx.owner;
    let children = std::mem::take(&mut bx.children);
    let mut pending_rows: Vec<LayoutBox> = Vec::new();
    let mut pending_misc: Vec<LayoutBox> = Vec::new();
    let flush_rows = |rows: &mut Vec<LayoutBox>, out: &mut Vec<LayoutBox>| {
        if rows.is_empty() {
            return;
        }
        let mut group = anonymous(BoxKind::TableRowGroup, &style, owner);
        group.children = std::mem::take(rows);
        normalize_row_group(&mut group);
        out.push(group);
    };
    let flush_misc = |misc: &mut Vec<LayoutBox>, rows: &mut Vec<LayoutBox>| {
        if misc.is_empty() || misc.iter().all(is_space_text) {
            misc.clear();
            return;
        }
        let mut row = anonymous(BoxKind::TableRow, &style, owner);
        row.children = std::mem::take(misc);
        normalize_row(&mut row);
        rows.push(row);
    };
    for child in children {
        match child.kind {
            BoxKind::TableCaption | BoxKind::TableRowGroup => {
                flush_misc(&mut pending_misc, &mut pending_rows);
                flush_rows(&mut pending_rows, &mut bx.children);
                let mut child = child;
                if child.kind == BoxKind::TableRowGroup {
                    normalize_row_group(&mut child);
                } else {
                    normalize_flow(&mut child);
                }
                bx.children.push(child);
            }
            BoxKind::TableRow => {
                flush_misc(&mut pending_misc, &mut pending_rows);
                let mut child = child;
                normalize_row(&mut child);
                pending_rows.push(child);
            }
            _ if child.is_out_of_flow() => bx.children.push(child),
            _ => pending_misc.push(child),
        }
    }
    flush_misc(&mut pending_misc, &mut pending_rows);
    flush_rows(&mut pending_rows, &mut bx.children);
}

/// Row group children: rows; anything else is wrapped into an anonymous row.
fn normalize_row_group(bx: &mut LayoutBox) {
    let style = bx.style.clone();
    let owner = bx.owner;
    let children = std::mem::take(&mut bx.children);
    let mut misc: Vec<LayoutBox> = Vec::new();
    let flush = |misc: &mut Vec<LayoutBox>, out: &mut Vec<LayoutBox>| {
        if misc.is_empty() || misc.iter().all(is_space_text) {
            misc.clear();
            return;
        }
        let mut row = anonymous(BoxKind::TableRow, &style, owner);
        row.children = std::mem::take(misc);
        normalize_row(&mut row);
        out.push(row);
    };
    for child in children {
        if child.kind == BoxKind::TableRow {
            flush(&mut misc, &mut bx.children);
            let mut child = child;
            normalize_row(&mut child);
            bx.children.push(child);
        } else if child.is_out_of_flow() {
            bx.children.push(child);
        } else {
            misc.push(child);
        }
    }
    flush(&mut misc, &mut bx.children);
}

/// Row children: cells; consecutive non-cells are wrapped into an anonymous cell.
fn normalize_row(bx: &mut LayoutBox) {
    let style = bx.style.clone();
    let owner = bx.owner;
    let children = std::mem::take(&mut bx.children);
    let mut misc: Vec<LayoutBox> = Vec::new();
    let flush = |misc: &mut Vec<LayoutBox>, out: &mut Vec<LayoutBox>| {
        if misc.is_empty() || misc.iter().all(is_space_text) {
            misc.clear();
            return;
        }
        let mut cell = anonymous(BoxKind::TableCell, &style, owner);
        cell.children = std::mem::take(misc);
        normalize_flow(&mut cell);
        out.push(cell);
    };
    for child in children {
        if child.kind == BoxKind::TableCell {
            flush(&mut misc, &mut bx.children);
            let mut child = child;
            normalize_flow(&mut child);
            bx.children.push(child);
        } else if child.is_out_of_flow() {
            bx.children.push(child);
        } else {
            misc.push(child);
        }
    }
    flush(&mut misc, &mut bx.children);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn whitespace_collapsing_follows_white_space() {
        assert_eq!(
            collapse_whitespace("  a \n\t b  ", WhiteSpace::Normal),
            " a b "
        );
        assert_eq!(collapse_whitespace("a \n b", WhiteSpace::PreLine), "a\nb");
        assert_eq!(collapse_whitespace("a \n b", WhiteSpace::Pre), "a \n b");
        assert_eq!(collapse_whitespace("   ", WhiteSpace::Normal), " ");
    }

    #[test]
    fn mixed_content_gets_anonymous_blocks() {
        let style = Rc::new(ComputedStyle::initial());
        let block_style = Rc::new(ComputedStyle {
            display: Display::Block,
            ..ComputedStyle::initial()
        });
        let mut bx = LayoutBox::new(None, BoxKind::Block, style.clone());
        bx.children.push(LayoutBox::new(
            None,
            BoxKind::Text("hello".into()),
            style.clone(),
        ));
        bx.children
            .push(LayoutBox::new(None, BoxKind::Block, block_style));
        bx.children.push(LayoutBox::new(
            None,
            BoxKind::Text(" ".into()),
            style.clone(),
        ));
        bx.children
            .push(LayoutBox::new(None, BoxKind::Inline, style.clone()));
        normalize(&mut bx);
        assert_eq!(
            bx.children.len(),
            3,
            "anon(text), block, anon(space + inline)"
        );
        assert!(matches!(bx.children[0].kind, BoxKind::AnonymousBlock));
        assert!(matches!(bx.children[1].kind, BoxKind::Block));
        assert!(matches!(bx.children[2].kind, BoxKind::AnonymousBlock));
        assert_eq!(
            bx.children[2].children.len(),
            2,
            "the space precedes inline content on the same line"
        );
        assert_eq!(bx.iter().count(), 7);

        // A whitespace-only run between blocks is dropped entirely.
        let mut only_space = LayoutBox::new(None, BoxKind::Block, style.clone());
        only_space
            .children
            .push(LayoutBox::new(None, BoxKind::Block, style.clone()));
        only_space.children.push(LayoutBox::new(
            None,
            BoxKind::Text(" ".into()),
            style.clone(),
        ));
        only_space
            .children
            .push(LayoutBox::new(None, BoxKind::Block, style));
        normalize(&mut only_space);
        assert_eq!(only_space.children.len(), 2);
    }

    #[test]
    fn table_fixup_inserts_anonymous_boxes() {
        let style = Rc::new(ComputedStyle::initial());
        let kind_box = |kind: BoxKind| LayoutBox::new(Some(NodeId::new(1, 0)), kind, style.clone());
        // <table> with two bare cells and a bare row: cells become one row.
        let mut table = kind_box(BoxKind::Table);
        table.children.push(kind_box(BoxKind::TableCell));
        table.children.push(kind_box(BoxKind::TableCell));
        table.children.push(kind_box(BoxKind::TableRow));
        normalize(&mut table);
        assert_eq!(table.children.len(), 1, "one anonymous row group");
        let group = &table.children[0];
        assert_eq!(group.kind, BoxKind::TableRowGroup);
        assert_eq!(
            group.children.len(),
            2,
            "anonymous row with two cells + the bare row"
        );
        assert_eq!(group.children[0].children.len(), 2);

        // Cells outside a table get an anonymous table.
        let mut div = kind_box(BoxKind::Block);
        div.children.push(kind_box(BoxKind::TableCell));
        div.children.push(kind_box(BoxKind::Block));
        normalize(&mut div);
        assert_eq!(div.children.len(), 2);
        assert_eq!(div.children[0].kind, BoxKind::Table);
        assert!(div.children[0].node.is_none(), "anonymous");
        assert_eq!(
            div.children[0].children[0].children[0].children[0].kind,
            BoxKind::TableCell
        );
    }
}
