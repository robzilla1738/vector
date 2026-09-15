//! Block formatting: sizing a box against its containing block and stacking
//! block-level children vertically, placing floats and honouring `clear`.

use ve_core::{Edges, Point, Rect, Size};
use ve_style::{
    BoxSizing, ComputedStyle, Float, LengthPercentageAuto, ListStylePosition, Position,
    PseudoElement,
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
    layout_positioned(root, ctx, viewport, viewport);
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

    let border_origin = Point::new(origin.x + margin_left, origin.y + margin.top);
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
        let h = specified.unwrap_or(content_height);
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

/// Stacks block-level children vertically. Returns the content height.
fn layout_block_flow(
    bx: &mut LayoutBox,
    ctx: &mut LayoutCtx<'_>,
    content: Rect,
    cb_height: Option<f32>,
) -> f32 {
    let cb = ContainingBlock {
        width: content.width(),
        height: cb_height,
    };
    let mut cursor = content.y();
    let mut prev_margin_bottom = 0.0_f32;
    let mut last_margin_bottom = 0.0_f32;
    let parent_has_bottom_edge = bx.has_own_edges()
        && (bx.style.padding_bottom != ve_style::LengthPercentage::ZERO
            || bx.style.border_bottom() > 0.0
            || bx.establishes_bfc());

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
        // `clear` moves the box below the relevant floats (its own margin
        // then no longer collapses through).
        if child.has_own_edges()
            && let Some(clearance) = ctx.floats().clearance(child.style.clear)
            && clearance > cursor + margins.top.max(prev_margin_bottom) - prev_margin_bottom
        {
            cursor = clearance;
            prev_margin_bottom = margins.top;
        }
        // Adjoining sibling margins collapse to the larger of the two.
        let gap = margins.top.max(prev_margin_bottom) - prev_margin_bottom;
        let mut margin_origin = Point::new(content.x(), cursor + gap - margins.top);
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
                        margin_origin = Point::new(content.x(), cursor - margins.top);
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
        cursor = child.rect.bottom() + margins.bottom;
        prev_margin_bottom = margins.bottom;
        last_margin_bottom = margins.bottom;
    }
    let mut height = cursor - content.y();
    if !parent_has_bottom_edge {
        // The last child's bottom margin collapses through the parent.
        height -= last_margin_bottom;
    }
    height.max(0.0)
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
            place_absolute(child, ctx, cb_rect);
        }
        layout_positioned(child, ctx, own_cb, viewport);
    }
}

fn place_absolute(bx: &mut LayoutBox, ctx: &mut LayoutCtx<'_>, cb_rect: Rect) {
    let style = bx.style.clone();
    let static_pos = bx.rect.origin;
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
    let x = match (left, right) {
        (Some(l), _) => cb_rect.x() + l + margins.left,
        (None, Some(r)) => cb_rect.right() - r - margins.right - size.width,
        (None, None) => static_pos.x + margins.left,
    };
    let y = match (top, bottom) {
        (Some(t), _) => cb_rect.y() + t + margins.top,
        (None, Some(b)) => cb_rect.bottom() - b - margins.bottom - size.height,
        (None, None) => static_pos.y + margins.top,
    };
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
