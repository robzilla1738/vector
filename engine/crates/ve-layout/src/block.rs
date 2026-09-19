//! Block formatting: sizing a box against its containing block and stacking
//! block-level children vertically, placing floats and honouring `clear`.

use std::collections::HashMap;

use ve_core::{Edges, Point, Rect, Size};
use ve_style::{
    BoxSizing, ColumnSpan, ComputedStyle, Float, LengthPercentage, LengthPercentageAuto,
    ListStylePosition, Position, PositionArea, PseudoElement, WritingMode,
};

use crate::box_tree::{BoxKind, Fragment, LayoutBox};
use crate::floats::FloatContext;
use crate::text::{MetricShaper, TextShaper};
use crate::{flex, inline, table};

/// Mutable state shared by the whole layout pass.
pub struct LayoutCtx<'a> {
    /// Text shaper for inline content.
    pub shaper: &'a mut dyn TextShaper,
    /// Viewport size (initial containing block, `vw`/`vh` already resolved by style).
    pub viewport: Size,
    /// Stack of float contexts, one per open block formatting context.
    pub floats: Vec<FloatContext>,
    /// Number of boxes laid out by this pass (for incremental-layout tests).
    pub laid_out: usize,
}

impl<'a> LayoutCtx<'a> {
    /// Creates a context with one (root) float context.
    pub fn new(shaper: &'a mut dyn TextShaper, viewport: Size) -> Self {
        Self {
            shaper,
            viewport,
            floats: vec![FloatContext::new()],
            laid_out: 0,
        }
    }

    /// The innermost block formatting context's floats.
    pub fn floats(&mut self) -> &mut FloatContext {
        if self.floats.is_empty() {
            self.floats.push(FloatContext::new());
        }
        self.floats.last_mut().expect("non-empty")
    }
}

/// The containing block a box is sized against.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct ContainingBlock {
    /// Content width of the containing block.
    pub width: f32,
    /// Content height, if definite (percentages of an indefinite height are `auto`).
    pub height: Option<f32>,
}

/// Sizes imposed from outside (flex/grid items, positioned boxes, table cells).
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Forced {
    /// Border-box width to use instead of the computed one.
    pub width: Option<f32>,
    /// Border-box height to use instead of the computed one.
    pub height: Option<f32>,
}

/// Resolves the four margins against the containing block width; `auto`
/// becomes zero (auto-centering is handled in [`layout_box_at`]).
#[must_use]
pub fn resolve_margins(style: &ComputedStyle, cb_width: f32) -> Edges {
    let r = |m: LengthPercentageAuto| m.resolve(cb_width).unwrap_or(0.0);
    Edges::new(
        r(style.margin_top),
        r(style.margin_right),
        r(style.margin_bottom),
        r(style.margin_left),
    )
}

/// Resolves padding against the containing block width.
#[must_use]
pub fn resolve_padding(style: &ComputedStyle, cb_width: f32) -> Edges {
    Edges::new(
        style.padding_top.resolve(cb_width).max(0.0),
        style.padding_right.resolve(cb_width).max(0.0),
        style.padding_bottom.resolve(cb_width).max(0.0),
        style.padding_left.resolve(cb_width).max(0.0),
    )
}

/// Used border widths as edges.
#[must_use]
pub fn border_edges(style: &ComputedStyle) -> Edges {
    Edges::new(
        style.border_top(),
        style.border_right(),
        style.border_bottom(),
        style.border_left(),
    )
}

/// Margin, padding and border of a box (all zero for anonymous boxes).
#[must_use]
pub fn box_edges(bx: &LayoutBox, cb_width: f32) -> (Edges, Edges, Edges) {
    if bx.has_own_edges() {
        (
            resolve_margins(&bx.style, cb_width),
            resolve_padding(&bx.style, cb_width),
            border_edges(&bx.style),
        )
    } else {
        (Edges::ZERO, Edges::ZERO, Edges::ZERO)
    }
}

/// Lays out the root box against the viewport and then places positioned
/// descendants.
pub fn layout_root(root: &mut LayoutBox, ctx: &mut LayoutCtx<'_>) {
    let cb = ContainingBlock {
        width: ctx.viewport.width,
        height: Some(ctx.viewport.height),
    };
    layout_box_at(root, ctx, cb, Point::ZERO, Forced::default());
    let viewport = Rect::new(0.0, 0.0, ctx.viewport.width, ctx.viewport.height);
    let mut anchors = HashMap::new();
    collect_anchors(root, &mut anchors);
    layout_positioned(root, ctx, viewport, viewport, &anchors);
}

/// Records in-flow `anchor-name` boxes for `position-anchor` lookup.
pub fn collect_anchors(bx: &LayoutBox, out: &mut HashMap<String, Rect>) {
    if !bx.style.anchor_name.is_empty() {
        out.insert(bx.style.anchor_name.clone(), bx.rect);
    }
    for child in &bx.children {
        collect_anchors(child, out);
    }
}

/// Lays out `bx` with its **margin-box** top-left at `origin`. Sets
/// `bx.rect` (border box) and `bx.content`, and lays out all in-flow
/// descendants. Out-of-flow descendants only get their static position
/// recorded in `rect.origin`; see [`layout_positioned`].
pub fn layout_box_at(
    bx: &mut LayoutBox,
    ctx: &mut LayoutCtx<'_>,
    cb: ContainingBlock,
    origin: Point,
    forced: Forced,
) {
    ctx.laid_out += 1;
    bx.cb_width = cb.width;
    if bx.kind == BoxKind::Table {
        table::layout_table(bx, ctx, cb, origin, forced);
        return;
    }
    let style = bx.style.clone();
    let (margin, padding, border) = box_edges(bx, cb.width);
    // Parent/child adjoining top margins collapse into this used top margin
    // (CSS 2.1 §8.3.1); the first child's top is then not added again inside.
    let used_margin_top = peek_collapsing_top(bx, cb.width);
    let bp_h = padding.horizontal() + border.horizontal();
    let bp_v = padding.vertical() + border.vertical();
    let shrink_to_fit = !bx.is_block_level()
        || bx.is_float()
        || bx.is_out_of_flow()
        || matches!(bx.kind, BoxKind::TableCell | BoxKind::TableCaption) && forced.width.is_none();

    // ---- width -------------------------------------------------------------
    let mut margin_left = margin.left;
    let content_width = if let Some(w) = forced.width {
        (w - bp_h).max(0.0)
    } else if !bx.has_own_edges() {
        cb.width
    } else {
        match style.width.resolve(cb.width) {
            Some(w) => {
                let content = if style.box_sizing == BoxSizing::BorderBox {
                    (w - bp_h).max(0.0)
                } else {
                    w
                };
                let content = clamp_width(&style, content, cb.width, bp_h);
                // Horizontal auto margins centre a definite-width block.
                let free = cb.width - content - bp_h;
                let left_auto = style.margin_left.is_auto();
                let right_auto = style.margin_right.is_auto();
                if bx.is_block_level() && bx.is_in_flow() && (left_auto || right_auto) {
                    margin_left = if left_auto && right_auto {
                        (free / 2.0).max(0.0)
                    } else if left_auto {
                        (free - margin.right).max(0.0)
                    } else {
                        margin.left
                    };
                }
                content
            }
            // A replaced element with `width: auto` takes its intrinsic width,
            // or the specified height scaled by the intrinsic ratio.
            None if style.aspect_ratio.is_some() && !style.height.is_auto() => {
                let ratio = style.aspect_ratio.unwrap_or(1.0);
                let h = style.height.maybe_resolve(cb.height).unwrap_or(0.0);
                let h = if style.box_sizing == BoxSizing::BorderBox {
                    (h - bp_v).max(0.0)
                } else {
                    h
                };
                clamp_width(&style, h * ratio, cb.width, bp_h)
            }
            None if bx.replaced.is_some() => {
                let intrinsic = bx.replaced.unwrap_or_default();
                let from_height = style
                    .height
                    .maybe_resolve(cb.height)
                    .filter(|_| !style.height.is_auto() && intrinsic.height > 0.0)
                    .map(|h| h * intrinsic.width / intrinsic.height);
                clamp_width(
                    &style,
                    from_height.unwrap_or(intrinsic.width),
                    cb.width,
                    bp_h,
                )
            }
            None if !shrink_to_fit => clamp_width(
                &style,
                (cb.width - margin.horizontal() - bp_h).max(0.0),
                cb.width,
                bp_h,
            ),
            None => {
                // Shrink-to-fit for inline-blocks, floats, cells and positioned boxes.
                let available = (cb.width - margin.horizontal() - bp_h).max(0.0);
                let preferred = intrinsic_width(bx, ctx) - bp_h - margin.horizontal();
                let minimum = intrinsic_min_width(bx, ctx) - bp_h - margin.horizontal();
                let fit = preferred.min(available).max(minimum).max(0.0);
                clamp_width(&style, fit, cb.width, bp_h)
            }
        }
    };

    let border_origin = Point::new(origin.x + margin_left, origin.y + used_margin_top);
    let content_origin = Point::new(
        border_origin.x + border.left + padding.left,
        border_origin.y + border.top + padding.top,
    );
    let content_rect = Rect::new(content_origin.x, content_origin.y, content_width, 0.0);

    // ---- children ----------------------------------------------------------
    let child_cb_height = forced
        .height
        .map(|h| (h - bp_v).max(0.0))
        .or_else(|| style.height.maybe_resolve(cb.height))
        .map(|h| {
            if style.box_sizing == BoxSizing::BorderBox && forced.height.is_none() {
                (h - bp_v).max(0.0)
            } else {
                h
            }
        });
    let bfc = bx.establishes_bfc();
    if bfc {
        ctx.floats.push(FloatContext::new());
    }
    let mut content_height = match bx.kind {
        BoxKind::Text(_) => 0.0,
        BoxKind::Flex | BoxKind::Grid => flex::layout_flex(bx, ctx, content_rect, child_cb_height),
        _ if bx
            .children
            .iter()
            .any(|c| !c.is_block_level() && c.is_in_flow()) =>
        {
            inline::layout_inline(bx, ctx, content_rect)
        }
        _ if bx.style.writing_mode == WritingMode::VerticalRl => {
            layout_block_flow_vertical_rl(bx, ctx, content_rect, child_cb_height)
        }
        _ => layout_block_flow(bx, ctx, content_rect, child_cb_height),
    };
    if bfc {
        let floats = ctx.floats.pop().unwrap_or_default();
        // Floats extend the auto height of the formatting context root.
        if let Some(bottom) = floats.bottom() {
            content_height = content_height.max(bottom - content_origin.y);
        }
    }

    // ---- height ------------------------------------------------------------
    let content_height = if let Some(h) = forced.height {
        (h - bp_v).max(0.0)
    } else {
        let specified = child_cb_height.filter(|_| !style.height.is_auto());
        let from_ratio = style
            .aspect_ratio
            .filter(|_| specified.is_none())
            .map(|ratio| content_width / ratio.max(f32::EPSILON));
        let replaced_auto = bx
            .replaced
            .filter(|_| specified.is_none())
            .map(|intrinsic| {
                // auto height of a replaced element: intrinsic, or the used width
                // scaled by the intrinsic ratio when the width was specified
                if intrinsic.width > 0.0 && (content_width - intrinsic.width).abs() > 0.5 {
                    content_width * intrinsic.height / intrinsic.width
                } else {
                    intrinsic.height
                }
            });
        let size_contained = style.contain.contains_size()
            || style.container_type.contains_size()
            || style.content_visibility == ve_style::ContentVisibility::Hidden;
        let h = if size_contained
            && specified.is_none()
            && from_ratio.is_none()
            && replaced_auto.is_none()
        {
            0.0
        } else {
            specified
                .or(replaced_auto)
                .or(from_ratio)
                .unwrap_or(content_height)
        };
        clamp_height(&style, h, cb.height, bp_v)
    };

    bx.content = Rect::new(
        content_origin.x,
        content_origin.y,
        content_width,
        content_height,
    );
    bx.rect = Rect::new(
        border_origin.x,
        border_origin.y,
        content_width + bp_h,
        content_height + bp_v,
    );
    if bx.marker.is_some() {
        place_marker(bx, ctx);
    }
}

/// Positions the list marker of a `display: list-item` box just outside (or
/// at the start of) its content box, on the first line.
fn place_marker(bx: &mut LayoutBox, ctx: &mut LayoutCtx<'_>) {
    let Some(marker) = &bx.marker else { return };
    let style = bx.style.clone();
    let width = ctx.shaper.measure(&marker.text, &style);
    let line_height = bx.lines.first().map_or_else(
        || style.line_height.to_px(style.font_size),
        |l| l.rect.height(),
    );
    let x = match marker.position {
        ListStylePosition::Outside => bx.content.x() - width,
        ListStylePosition::Inside => bx.content.x(),
    };
    let rect = Rect::new(x, bx.content.y(), width, line_height);
    bx.marker_fragment = Some(Fragment {
        node: None,
        owner: bx.node,
        rect,
        text: Some(marker.text.clone()),
        baseline: MetricShaper::baseline_in(&style, line_height),
        clip: None,
        pseudo: Some(PseudoElement::Marker),
    });
}

fn clamp_width(style: &ComputedStyle, content: f32, cb_width: f32, bp_h: f32) -> f32 {
    let border_box = style.box_sizing == BoxSizing::BorderBox;
    let adjust = |v: f32| if border_box { (v - bp_h).max(0.0) } else { v };
    let mut w = content;
    if let Some(max) = style.max_width.resolve(cb_width) {
        w = w.min(adjust(max));
    }
    w = w.max(adjust(style.min_width.resolve(cb_width)));
    w.max(0.0)
}

fn clamp_height(style: &ComputedStyle, content: f32, cb_height: Option<f32>, bp_v: f32) -> f32 {
    let border_box = style.box_sizing == BoxSizing::BorderBox;
    let adjust = |v: f32| if border_box { (v - bp_v).max(0.0) } else { v };
    let mut h = content;
    if let Some(max) = style.max_height.maybe_resolve(cb_height) {
        h = h.min(adjust(max));
    }
    if let Some(min) = style.min_height.maybe_resolve(cb_height) {
        h = h.max(adjust(min));
    }
    h.max(0.0)
}

fn adjoins_children_top(bx: &LayoutBox) -> bool {
    if bx.establishes_bfc() {
        return false;
    }
    if !bx.has_own_edges() {
        return true;
    }
    bx.style.padding_top == LengthPercentage::ZERO && bx.style.border_top() <= 0.0
}

fn style_may_collapse_through(bx: &LayoutBox) -> bool {
    if bx.replaced.is_some() || bx.establishes_bfc() {
        return false;
    }
    if bx.has_own_edges() {
        let s = &bx.style;
        if s.padding_top != LengthPercentage::ZERO || s.padding_bottom != LengthPercentage::ZERO {
            return false;
        }
        if s.border_top() > 0.0 || s.border_bottom() > 0.0 {
            return false;
        }
        if !s.height.is_auto() {
            return false;
        }
        if s.min_height != LengthPercentage::ZERO {
            return false;
        }
    }
    bx.children
        .iter()
        .all(|c| !c.is_in_flow() || (c.is_block_level() && style_may_collapse_through(c)))
}

/// Adjoining top margin of `bx` as seen by its parent (own top plus
/// descendants that collapse through, CSS 2.1 §8.3.1).
fn peek_collapsing_top(bx: &LayoutBox, cb_width: f32) -> f32 {
    let own = if bx.has_own_edges() {
        resolve_margins(&bx.style, cb_width)
    } else {
        Edges::ZERO
    };
    let mut m = own.top;
    if !adjoins_children_top(bx) {
        return m;
    }
    let inner_cb = (cb_width
        - own.horizontal()
        - if bx.has_own_edges() {
            border_edges(&bx.style).horizontal() + resolve_padding(&bx.style, cb_width).horizontal()
        } else {
            0.0
        })
    .max(0.0);
    let mut saw = false;
    let mut all_through = true;
    for child in &bx.children {
        if !child.is_in_flow() {
            continue;
        }
        if !child.is_block_level() {
            return m;
        }
        saw = true;
        m = m.max(peek_collapsing_top(child, inner_cb));
        if !style_may_collapse_through(child) {
            all_through = false;
            break;
        }
    }
    if (!saw || all_through) && style_may_collapse_through(bx) {
        m = m.max(own.bottom);
    }
    m
}

/// Stacks block-level children vertically. Returns the content height.
fn used_column_count(style: &ComputedStyle, width: f32) -> u32 {
    if let Some(n) = style.column_count.filter(|n| *n >= 2) {
        return n;
    }
    if let Some(cw) = style.column_width.filter(|w| *w > 0.0) {
        return ((width / cw).floor() as u32).max(1);
    }
    1
}

fn layout_block_flow_columns(
    bx: &mut LayoutBox,
    ctx: &mut LayoutCtx<'_>,
    content: Rect,
    cb_height: Option<f32>,
    cols: u32,
) -> f32 {
    let cols = cols.max(2) as usize;
    let gap = bx.style.column_gap.resolve(content.width());
    let col_w = ((content.width() - gap * (cols as f32 - 1.0)) / cols as f32).max(0.0);
    let cb = ContainingBlock {
        width: col_w,
        height: cb_height,
    };
    let full = ContainingBlock {
        width: content.width(),
        height: cb_height,
    };
    let mut col_y = vec![content.y(); cols];
    let mut i = 0usize;
    for child in &mut bx.children {
        if child.is_out_of_flow() || child.is_float() {
            continue;
        }
        if child.style.column_span == ColumnSpan::All {
            let y = col_y.iter().copied().fold(content.y(), f32::max);
            layout_box_at(
                child,
                ctx,
                full,
                Point::new(content.x(), y),
                Forced::default(),
            );
            if child.style.position == Position::Relative || child.style.position == Position::Sticky
            {
                apply_relative_offset(child, full);
            }
            let bottom = child.rect.bottom();
            for slot in &mut col_y {
                *slot = bottom;
            }
            i = 0;
            continue;
        }
        let col = i % cols;
        i += 1;
        let x = content.x() + col as f32 * (col_w + gap);
        layout_box_at(
            child,
            ctx,
            cb,
            Point::new(x, col_y[col]),
            Forced::default(),
        );
        if child.style.position == Position::Relative || child.style.position == Position::Sticky {
            apply_relative_offset(child, cb);
        }
        col_y[col] = child.rect.bottom();
    }
    col_y.into_iter().fold(content.y(), f32::max) - content.y()
}

fn layout_block_flow(
    bx: &mut LayoutBox,
    ctx: &mut LayoutCtx<'_>,
    content: Rect,
    cb_height: Option<f32>,
) -> f32 {
    let cols = used_column_count(&bx.style, content.width());
    if cols >= 2 {
        return layout_block_flow_columns(bx, ctx, content, cb_height, cols);
    }
    let cb = ContainingBlock {
        width: content.width(),
        height: cb_height,
    };
    let mut cursor = content.y();
    let mut prev_margin_bottom = 0.0_f32;
    let mut last_margin_bottom = 0.0_f32;
    let parent_adjoins_top = adjoins_children_top(bx);
    let parent_has_bottom_edge = bx.has_own_edges()
        && (bx.style.padding_bottom != LengthPercentage::ZERO
            || bx.style.border_bottom() > 0.0
            || bx.establishes_bfc());
    let mut first_inflow = true;

    for child in &mut bx.children {
        if child.is_out_of_flow() {
            child.rect = Rect::new(content.x(), cursor, 0.0, 0.0);
            continue;
        }
        if child.is_float() {
            layout_float(child, ctx, content, cursor);
            continue;
        }
        let margins = if child.has_own_edges() {
            resolve_margins(&child.style, cb.width)
        } else {
            Edges::ZERO
        };
        let used_top = peek_collapsing_top(child, cb.width);
        let mut absorb_top = first_inflow && parent_adjoins_top;
        first_inflow = false;
        // `clear` moves the box below the relevant floats (its own margin
        // then no longer collapses through).
        if child.has_own_edges()
            && let Some(clearance) = ctx.floats().clearance(child.style.clear)
            && clearance > cursor + used_top.max(prev_margin_bottom) - prev_margin_bottom
        {
            cursor = clearance;
            prev_margin_bottom = used_top;
            absorb_top = false;
        }
        // Adjoining sibling (and parent/child) margins collapse to the max.
        let gap = if absorb_top {
            0.0
        } else {
            used_top.max(prev_margin_bottom) - prev_margin_bottom
        };
        let mut margin_origin = Point::new(content.x(), cursor + gap - used_top);
        let mut child_cb = cb;
        if child.establishes_bfc() && !ctx.floats().is_empty() {
            // A new formatting context must not overlap floats: narrow it to
            // the free band, or move it below the floats if it does not fit.
            let top = cursor + gap;
            let (l, r) = ctx.floats().edges(top, 1.0, content.x(), content.right());
            if l > content.x() || r < content.right() {
                let needed = child
                    .style
                    .width
                    .resolve(cb.width)
                    .map(|w| w + margins.horizontal());
                if needed.is_some_and(|w| w > r - l + 0.01) {
                    if let Some(next) = ctx.floats().next_bottom_after(top) {
                        cursor = next;
                        margin_origin = Point::new(content.x(), cursor - used_top);
                    }
                } else {
                    margin_origin.x = l;
                    child_cb.width = r - l;
                }
            }
        }
        layout_box_at(child, ctx, child_cb, margin_origin, Forced::default());
        if child.style.position == Position::Relative || child.style.position == Position::Sticky {
            apply_relative_offset(child, cb);
        }
        if style_may_collapse_through(child) && child.rect.height() < 0.01 {
            let adjoining = used_top.max(margins.bottom).max(prev_margin_bottom);
            cursor = child.rect.bottom();
            prev_margin_bottom = adjoining;
            last_margin_bottom = adjoining;
        } else {
            cursor = child.rect.bottom() + margins.bottom;
            prev_margin_bottom = margins.bottom;
            last_margin_bottom = margins.bottom;
        }
    }
    let mut height = cursor - content.y();
    if !parent_has_bottom_edge {
        // The last child's bottom margin collapses through the parent.
        height -= last_margin_bottom;
    }
    height.max(0.0)
}

/// Stacks block-level children right-to-left (`writing-mode: vertical-rl`).
/// Physical width is the stacking size; a definite containing-block height
/// stretches `height: auto` children.
fn layout_block_flow_vertical_rl(
    bx: &mut LayoutBox,
    ctx: &mut LayoutCtx<'_>,
    content: Rect,
    cb_height: Option<f32>,
) -> f32 {
    let cb = ContainingBlock {
        width: content.width(),
        height: cb_height,
    };
    let mut cursor = content.right();
    let mut max_height = cb_height.unwrap_or(0.0);
    for child in &mut bx.children {
        if child.is_out_of_flow() {
            child.rect = Rect::new(cursor, content.y(), 0.0, 0.0);
            continue;
        }
        if child.is_float() {
            layout_float(child, ctx, content, content.y());
            continue;
        }
        let margins = if child.has_own_edges() {
            resolve_margins(&child.style, cb.width)
        } else {
            Edges::ZERO
        };
        let forced = Forced {
            width: None,
            height: if child.style.height.is_auto() {
                cb_height
            } else {
                None
            },
        };
        layout_box_at(child, ctx, cb, Point::ZERO, forced);
        if child.style.position == Position::Relative || child.style.position == Position::Sticky {
            apply_relative_offset(child, cb);
        }
        let margin_box_w = child.rect.width() + margins.horizontal();
        cursor -= margin_box_w;
        translate_subtree(
            child,
            cursor + margins.left - child.rect.x(),
            content.y() + margins.top - child.rect.y(),
        );
        max_height = max_height.max(child.rect.height() + margins.vertical());
    }
    max_height.max(0.0)
}

/// Lays out a float (shrink-to-fit) and places it against the current
/// block formatting context's floats, no higher than `y_min`.
pub fn layout_float(child: &mut LayoutBox, ctx: &mut LayoutCtx<'_>, content: Rect, y_min: f32) {
    let cb = ContainingBlock {
        width: content.width(),
        height: None,
    };
    layout_box_at(child, ctx, cb, Point::ZERO, Forced::default());
    let margins = resolve_margins(&child.style, cb.width);
    let size = Size::new(
        child.rect.width() + margins.horizontal(),
        child.rect.height() + margins.vertical(),
    );
    let mut y = y_min;
    if let Some(clearance) = ctx.floats().clearance(child.style.clear) {
        y = y.max(clearance);
    }
    let side = if child.style.float == Float::Right {
        Float::Right
    } else {
        Float::Left
    };
    let origin = ctx
        .floats()
        .place(side, size, y, content.x(), content.right());
    let extra = child.style.float_offset.resolve(size.width);
    let origin = Point::new(
        origin.x
            + if side == Float::Right {
                -extra
            } else {
                extra
            },
        origin.y,
    );
    let margin_box = Rect::new(origin.x, origin.y, size.width, size.height);
    ctx.floats()
        .set_last_wrap(child.style.shape_outside.wrap_rect(margin_box));
    translate_subtree(
        child,
        origin.x + margins.left - child.rect.x(),
        origin.y + margins.top - child.rect.y(),
    );
}

/// Shifts a relatively positioned box (and everything inside it) by its
/// `top`/`left` (or `bottom`/`right`) offsets.
fn apply_relative_offset(bx: &mut LayoutBox, cb: ContainingBlock) {
    let dx = bx
        .style
        .left
        .resolve(cb.width)
        .or_else(|| bx.style.right.resolve(cb.width).map(|r| -r))
        .unwrap_or(0.0);
    let dy = bx
        .style
        .top
        .maybe_resolve(cb.height)
        .or_else(|| bx.style.bottom.maybe_resolve(cb.height).map(|b| -b))
        .unwrap_or(0.0);
    if dx != 0.0 || dy != 0.0 {
        translate_subtree(bx, dx, dy);
    }
}

/// Moves a box and all its descendants, lines, fragments and marker.
pub fn translate_subtree(bx: &mut LayoutBox, dx: f32, dy: f32) {
    if dx == 0.0 && dy == 0.0 {
        return;
    }
    bx.rect = bx.rect.translate(dx, dy);
    bx.content = bx.content.translate(dx, dy);
    for line in &mut bx.lines {
        line.rect = line.rect.translate(dx, dy);
        for fragment in &mut line.fragments {
            fragment.rect = fragment.rect.translate(dx, dy);
        }
    }
    if let Some(m) = &mut bx.marker_fragment {
        m.rect = m.rect.translate(dx, dy);
    }
    for child in &mut bx.children {
        translate_subtree(child, dx, dy);
    }
}

/// Own horizontal edges (border + padding + margin) resolved against a zero
/// basis, for intrinsic sizing.
fn own_horizontal_edges(bx: &LayoutBox) -> f32 {
    if bx.has_own_edges() {
        border_edges(&bx.style).horizontal()
            + resolve_padding(&bx.style, 0.0).horizontal()
            + resolve_margins(&bx.style, 0.0).horizontal()
    } else {
        0.0
    }
}

/// Max-content width of a box: the width it would take if nothing wrapped.
/// Includes the box's own margins, border and padding. Used for
/// shrink-to-fit sizing and flex/grid/table measurement. Memoised per box
/// (see [`LayoutBox::intrinsic_cache`]) so nested shrink-to-fit boxes and
/// tables stay linear.
pub fn intrinsic_width(bx: &mut LayoutBox, ctx: &mut LayoutCtx<'_>) -> f32 {
    if let Some((_, max)) = bx.intrinsic_cache {
        return max;
    }
    let max = intrinsic_width_uncached(bx, ctx);
    let min = intrinsic_min_width_uncached(bx, ctx);
    bx.intrinsic_cache = Some((min, max));
    max
}

/// Min-content width of a box: the narrowest it can be without overflowing
/// (the widest unbreakable word, or the widest child's min-content).
pub fn intrinsic_min_width(bx: &mut LayoutBox, ctx: &mut LayoutCtx<'_>) -> f32 {
    if let Some((min, _)) = bx.intrinsic_cache {
        return min;
    }
    let max = intrinsic_width_uncached(bx, ctx);
    let min = intrinsic_min_width_uncached(bx, ctx);
    bx.intrinsic_cache = Some((min, max));
    min
}

fn intrinsic_width_uncached(bx: &mut LayoutBox, ctx: &mut LayoutCtx<'_>) -> f32 {
    let style = bx.style.clone();
    if let Some(intrinsic) = bx.replaced
        && style.width.is_auto()
    {
        return intrinsic.width + own_horizontal_edges(bx);
    }
    if bx.kind == BoxKind::Table {
        let (_, max) = table::intrinsic_widths(bx, ctx);
        return max + resolve_margins(&style, 0.0).horizontal();
    }
    if let LengthPercentageAuto::Px(w) = style.width {
        let bp = if bx.has_own_edges() {
            border_edges(&style).horizontal() + resolve_padding(&style, 0.0).horizontal()
        } else {
            0.0
        };
        let content = if style.box_sizing == BoxSizing::BorderBox {
            w
        } else {
            w + bp
        };
        return content + resolve_margins(&style, 0.0).horizontal();
    }
    let inner = match &bx.kind {
        BoxKind::Text(text) => text
            .split('\n')
            .map(|line| ctx.shaper.measure(line, &style))
            .fold(0.0, f32::max),
        _ => {
            let all_inline = bx.children.iter().all(|c| !c.is_block_level());
            let mut sum = 0.0;
            let mut max = 0.0_f32;
            for child in &mut bx.children {
                if child.is_out_of_flow() {
                    continue;
                }
                let w = intrinsic_width(child, ctx);
                sum += w;
                max = max.max(w);
            }
            if all_inline { sum } else { max }
        }
    };
    let inner = if bx.has_own_edges() {
        clamp_width(&style, inner, 0.0, 0.0)
    } else {
        inner
    };
    inner + own_horizontal_edges(bx)
}

/// Fit-content border-box width of a flex/grid item measured by its
/// container: max-content clamped to the available space and floored at
/// min-content (CSS Sizing §5.2.1). `available` is the container's
/// available main size (`f32::INFINITY` for a max-content probe).
pub fn fit_content_width(bx: &mut LayoutBox, ctx: &mut LayoutCtx<'_>, available: f32) -> f32 {
    let margins = resolve_margins(&bx.style, available.min(f32::MAX)).horizontal();
    let max = intrinsic_width(bx, ctx) - margins;
    let min = intrinsic_min_width(bx, ctx) - margins;
    max.min((available - margins).max(0.0)).max(min).max(0.0)
}

fn intrinsic_min_width_uncached(bx: &mut LayoutBox, ctx: &mut LayoutCtx<'_>) -> f32 {
    let style = bx.style.clone();
    if let Some(intrinsic) = bx.replaced
        && style.width.is_auto()
    {
        return intrinsic.width + own_horizontal_edges(bx);
    }
    if bx.kind == BoxKind::Table {
        let (min, _) = table::intrinsic_widths(bx, ctx);
        return min + resolve_margins(&style, 0.0).horizontal();
    }
    if let LengthPercentageAuto::Px(_) = style.width {
        return intrinsic_width_uncached(bx, ctx);
    }
    let inner = match &bx.kind {
        BoxKind::Text(text) => {
            if style.white_space.wraps() {
                ctx.shaper.min_content(text, &style)
            } else {
                text.split('\n')
                    .map(|line| ctx.shaper.measure(line, &style))
                    .fold(0.0, f32::max)
            }
        }
        _ => {
            let mut max = 0.0_f32;
            for child in &mut bx.children {
                if child.is_out_of_flow() {
                    continue;
                }
                max = max.max(intrinsic_min_width(child, ctx));
            }
            max
        }
    };
    let inner = if bx.has_own_edges() {
        clamp_width(&style, inner, 0.0, 0.0)
    } else {
        inner
    };
    inner + own_horizontal_edges(bx)
}

/// Second pass: places `absolute` / `fixed` boxes against their containing
/// block. `abs_cb` is the padding box of the nearest positioned ancestor,
/// `viewport` the initial containing block.
pub fn layout_positioned(
    bx: &mut LayoutBox,
    ctx: &mut LayoutCtx<'_>,
    abs_cb: Rect,
    viewport: Rect,
    anchors: &HashMap<String, Rect>,
) {
    let own_cb = if bx.has_own_edges() && bx.style.position.is_positioned() {
        // Padding box of this box.
        let border = border_edges(&bx.style);
        bx.rect.inset(border)
    } else {
        abs_cb
    };
    for child in &mut bx.children {
        if child.is_out_of_flow() {
            let cb_rect = if child.style.position == Position::Fixed {
                viewport
            } else {
                own_cb
            };
            place_absolute(child, ctx, cb_rect, anchors);
        }
        layout_positioned(child, ctx, own_cb, viewport, anchors);
    }
}

fn place_absolute(
    bx: &mut LayoutBox,
    ctx: &mut LayoutCtx<'_>,
    mut cb_rect: Rect,
    anchors: &HashMap<String, Rect>,
) {
    let style = bx.style.clone();
    let static_pos = bx.rect.origin;
    if !style.position_anchor.is_empty()
        && let Some(r) = anchors.get(&style.position_anchor)
    {
        cb_rect = *r;
    }
    let cb = ContainingBlock {
        width: cb_rect.width(),
        height: Some(cb_rect.height()),
    };
    let margins = resolve_margins(&style, cb.width);

    // Width: explicit, or from left+right, or shrink-to-fit (done by layout_box_at).
    let left = style.left.resolve(cb.width);
    let right = style.right.resolve(cb.width);
    let top = style.top.resolve(cb_rect.height());
    let bottom = style.bottom.resolve(cb_rect.height());
    let forced_width = match (style.width.is_auto(), left, right) {
        (true, Some(l), Some(r)) => Some((cb.width - l - r - margins.horizontal()).max(0.0)),
        _ => None,
    };

    // Lay out at a provisional origin to learn the size, then position.
    layout_box_at(
        bx,
        ctx,
        cb,
        Point::ZERO,
        Forced {
            width: forced_width,
            height: None,
        },
    );
    let size = bx.rect.size;
    let mut x = match (left, right) {
        (Some(l), _) => cb_rect.x() + l + margins.left,
        (None, Some(r)) => cb_rect.right() - r - margins.right - size.width,
        (None, None) => static_pos.x + margins.left,
    };
    let mut y = match (top, bottom) {
        (Some(t), _) => cb_rect.y() + t + margins.top,
        (None, Some(b)) => cb_rect.bottom() - b - margins.bottom - size.height,
        (None, None) => static_pos.y + margins.top,
    };
    if left.is_none() && right.is_none() {
        x = match style.position_area {
            PositionArea::Left => cb_rect.x() - size.width - margins.right,
            PositionArea::Right => cb_rect.right() + margins.left,
            PositionArea::Center => cb_rect.x() + (cb_rect.width() - size.width) / 2.0,
            PositionArea::Top | PositionArea::Bottom => cb_rect.x() + margins.left,
            PositionArea::None => x,
        };
    }
    if top.is_none() && bottom.is_none() {
        y = match style.position_area {
            PositionArea::Top => cb_rect.y() - size.height - margins.bottom,
            PositionArea::Bottom => cb_rect.bottom() + margins.top,
            PositionArea::Center => cb_rect.y() + (cb_rect.height() - size.height) / 2.0,
            PositionArea::Left | PositionArea::Right => cb_rect.y() + margins.top,
            PositionArea::None => y,
        };
    }
    let forced_height = match (style.height.is_auto(), top, bottom) {
        (true, Some(t), Some(b)) => Some((cb_rect.height() - t - b - margins.vertical()).max(0.0)),
        _ => None,
    };
    if forced_height.is_some() {
        layout_box_at(
            bx,
            ctx,
            cb,
            Point::ZERO,
            Forced {
                width: forced_width,
                height: forced_height,
            },
        );
    }
    let dx = x - bx.rect.x();
    let dy = y - bx.rect.y();
    translate_subtree(bx, dx, dy);
}
