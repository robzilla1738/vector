//! Block formatting: sizing a box against its containing block and stacking
//! block-level children vertically.

use ve_core::{Edges, Point, Rect, Size};
use ve_style::{BoxSizing, ComputedStyle, LengthPercentageAuto, Position};

use crate::box_tree::{BoxKind, LayoutBox};
use crate::text::TextShaper;
use crate::{flex, inline};

/// Mutable state shared by the whole layout pass.
pub struct LayoutCtx<'a> {
    /// Text shaper for inline content.
    pub shaper: &'a mut dyn TextShaper,
    /// Viewport size (initial containing block, `vw`/`vh` already resolved by style).
    pub viewport: Size,
}

/// The containing block a box is sized against.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct ContainingBlock {
    /// Content width of the containing block.
    pub width: f32,
    /// Content height, if definite (percentages of an indefinite height are `auto`).
    pub height: Option<f32>,
}

/// Sizes imposed from outside (flex/grid items, positioned boxes).
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
        style.padding_top.resolve(cb_width),
        style.padding_right.resolve(cb_width),
        style.padding_bottom.resolve(cb_width),
        style.padding_left.resolve(cb_width),
    )
}

/// Border widths as edges.
#[must_use]
pub fn border_edges(style: &ComputedStyle) -> Edges {
    Edges::new(
        style.border_top_width,
        style.border_right_width,
        style.border_bottom_width,
        style.border_left_width,
    )
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
    let style = bx.style.clone();
    let is_anonymous = bx.node.is_none();
    let (margin, padding, border) = if is_anonymous {
        (Edges::ZERO, Edges::ZERO, Edges::ZERO)
    } else {
        (
            resolve_margins(&style, cb.width),
            resolve_padding(&style, cb.width),
            border_edges(&style),
        )
    };
    let bp_h = padding.horizontal() + border.horizontal();
    let bp_v = padding.vertical() + border.vertical();

    // ---- width -------------------------------------------------------------
    let mut margin_left = margin.left;
    let content_width = if let Some(w) = forced.width {
        (w - bp_h).max(0.0)
    } else if is_anonymous {
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
                if bx.is_block_level() && (left_auto || right_auto) {
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
            None if bx.is_block_level() || matches!(bx.kind, BoxKind::AnonymousBlock) => {
                clamp_width(
                    &style,
                    (cb.width - margin.horizontal() - bp_h).max(0.0),
                    cb.width,
                    bp_h,
                )
            }
            None => {
                // Shrink-to-fit for inline-blocks and positioned boxes.
                let available = (cb.width - margin.horizontal() - bp_h).max(0.0);
                let preferred = intrinsic_width(bx, ctx);
                clamp_width(&style, preferred.min(available), cb.width, bp_h)
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
    let content_height = match bx.kind {
        BoxKind::Text(_) => 0.0,
        BoxKind::Flex | BoxKind::Grid => flex::layout_flex(bx, ctx, content_rect, child_cb_height),
        _ if bx
            .children
            .iter()
            .any(|c| !c.is_block_level() && !c.is_out_of_flow()) =>
        {
            inline::layout_inline(bx, ctx, content_rect)
        }
        _ => layout_block_flow(bx, ctx, content_rect, child_cb_height),
    };

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
    if let Some(basis) = cb_height
        && let Some(max) = style.max_height.resolve(basis)
    {
        h = h.min(adjust(max));
    } else if let ve_style::MaxSize::Px(max) = style.max_height {
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
    let parent_has_bottom_edge = bx.style.padding_bottom != ve_style::LengthPercentage::ZERO
        || bx.style.border_bottom_width > 0.0;

    for child in &mut bx.children {
        if child.is_out_of_flow() {
            child.rect = Rect::new(content.x(), cursor, 0.0, 0.0);
            continue;
        }
        let margins = if child.node.is_some() {
            resolve_margins(&child.style, cb.width)
        } else {
            Edges::ZERO
        };
        // Adjoining sibling margins collapse to the larger of the two.
        let gap = margins.top.max(prev_margin_bottom) - prev_margin_bottom;
        let margin_origin = Point::new(content.x(), cursor + gap - margins.top);
        layout_box_at(child, ctx, cb, margin_origin, Forced::default());
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

/// Moves a box and all its descendants, lines and fragments.
pub fn translate_subtree(bx: &mut LayoutBox, dx: f32, dy: f32) {
    bx.rect = bx.rect.translate(dx, dy);
    bx.content = bx.content.translate(dx, dy);
    for line in &mut bx.lines {
        line.rect = line.rect.translate(dx, dy);
        for fragment in &mut line.fragments {
            fragment.rect = fragment.rect.translate(dx, dy);
        }
    }
    for child in &mut bx.children {
        translate_subtree(child, dx, dy);
    }
}

/// Max-content width of a box: the width it would take if nothing wrapped.
/// Used for shrink-to-fit sizing and flex/grid measurement.
pub fn intrinsic_width(bx: &mut LayoutBox, ctx: &mut LayoutCtx<'_>) -> f32 {
    let style = bx.style.clone();
    if let Some(w) = style.width.resolve(f32::NAN).filter(|w| !w.is_nan()) {
        // Definite pixel width.
        let bp = if bx.node.is_some() {
            border_edges(&style).horizontal() + resolve_padding(&style, 0.0).horizontal()
        } else {
            0.0
        };
        return if style.box_sizing == BoxSizing::BorderBox {
            w
        } else {
            w + bp
        };
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
    if bx.node.is_none() {
        return inner;
    }
    inner
        + border_edges(&style).horizontal()
        + resolve_padding(&style, 0.0).horizontal()
        + resolve_margins(&style, 0.0).horizontal()
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
    let own_cb = if bx.node.is_some() && bx.style.position.is_positioned() {
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
    let bp = border_edges(&style).horizontal() + resolve_padding(&style, cb.width).horizontal();
    let forced_width = match (style.width.is_auto(), left, right) {
        (true, Some(l), Some(r)) => Some((cb.width - l - r - margins.horizontal()).max(0.0)),
        _ => None,
    };
    let _ = bp;

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
