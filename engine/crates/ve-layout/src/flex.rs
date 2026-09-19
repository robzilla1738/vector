//! Flex and grid containers, computed by `taffy` with items measured by the
//! engine's own block layout.
//!
//! The container's *content box* is handed to taffy as the root node; each
//! in-flow child becomes a leaf whose intrinsic size taffy obtains through
//! the measure callback (which runs a throw-away block layout). Once taffy has
//! resolved positions and sizes, every child is laid out for real at its
//! final location with its final size forced.
//!
//! `calc(px + %)` values are pre-resolved against the container's content
//! box because taffy's calc support needs an external resolver; `order` is
//! honoured by sorting the items before they are handed to taffy.

use taffy::prelude::*;
use taffy::tree::{LayoutInput, LayoutOutput};
use taffy::{GridTemplateArea, GridTemplateAreas as TaffyGridTemplateAreas};
use ve_core::{Point, Rect as CoreRect};
use ve_style::{
    AlignItems as CssAlign, ComputedStyle, FlexDirection as CssDir, FlexWrap as CssWrap, GridLine,
    JustifyContent as CssJustify, LengthPercentage as CssLp, LengthPercentageAuto as CssLpa,
    MaxSize, SelfAlignment, TrackSize,
};

use crate::block::{
    ContainingBlock, Forced, LayoutCtx, fit_content_width, layout_box_at, resolve_margins,
    translate_subtree,
};
use crate::box_tree::{LayoutBox, LayoutMemo};

/// Memos kept per item. Taffy probes an item at min-content, max-content
/// and one or two definite sizes (with and without a known cross size)
/// before the final pass, and every *ancestor* container's probe reaches a
/// nested item with its own available width, so an item nested `d` levels
/// deep sees about `3 d` distinct inputs. The bound must exceed that or the
/// FIFO thrashes and the layout is exponential again (the 8-entry bound hung
/// `nested_flex_containers_lay_out_in_linear_time` for minutes). Memos are
/// cleared with the layout pass, so the memory cost is transient.
const ITEM_MEMOS: usize = 256;

/// Lays out a flex/grid item at `origin`, reusing a memoised layout when the
/// item was already laid out with the same containing block and forced
/// sizes. Items establish independent formatting contexts, so those inputs
/// fully determine their geometry and a hit only needs a translation.
///
/// Without the memo every taffy measure call and the final pass each run a
/// complete subtree layout, so nested containers cost `O(k^depth)`; a
/// nested chain of a few dozen flex containers (as produced by XHTML
/// self-closing tags parsed as HTML) would never finish.
fn layout_item(
    child: &mut LayoutBox,
    ctx: &mut LayoutCtx<'_>,
    cb: ContainingBlock,
    origin: Point,
    forced: Forced,
) {
    if let Some(pos) = child
        .layout_cache
        .iter()
        .position(|m| m.cb == cb && m.forced == forced)
    {
        let memos = std::mem::take(&mut child.layout_cache);
        let memo = &memos[pos];
        let (dx, dy) = (origin.x - memo.origin.x, origin.y - memo.origin.y);
        let mut restored = (*memo.snapshot).clone();
        translate_subtree(&mut restored, dx, dy);
        // The snapshot was stored without nested memos (they would nest
        // snapshots exponentially), but the live subtree still holds the
        // memos its descendants accumulated. Keep them: without this a later
        // miss at this level re-lays the whole subtree out cold, and nested
        // containers become exponential again despite the memo.
        graft_layout_caches(&mut restored, child);
        *child = restored;
        child.layout_cache = memos;
        return;
    }
    layout_box_at(child, ctx, cb, origin, forced);
    let snapshot = child.snapshot_without_caches();
    if child.layout_cache.len() >= ITEM_MEMOS {
        child.layout_cache.remove(0);
    }
    child.layout_cache.push(LayoutMemo {
        cb,
        forced,
        origin,
        snapshot: Box::new(snapshot),
    });
}

/// Moves every descendant's `layout_cache` from `src` onto the structurally
/// identical `dst` (both are layouts of the same DOM subtree).
fn graft_layout_caches(dst: &mut LayoutBox, src: &mut LayoutBox) {
    for (d, s) in dst.children.iter_mut().zip(src.children.iter_mut()) {
        d.layout_cache = std::mem::take(&mut s.layout_cache);
        graft_layout_caches(d, s);
    }
}

/// Percentage bases for pre-resolving `calc()`.
#[derive(Clone, Copy)]
struct Basis {
    width: f32,
    height: f32,
}

fn lp(v: CssLp, basis: f32) -> LengthPercentage {
    match v {
        CssLp::Px(px) => length(px),
        CssLp::Percent(p) => percent(p / 100.0),
        CssLp::Calc { .. } => length(v.resolve(basis)),
    }
}

fn lpa(v: CssLpa, basis: f32) -> LengthPercentageAuto {
    match v {
        CssLpa::Auto => auto(),
        CssLpa::Px(px) => length(px),
        CssLpa::Percent(p) => percent(p / 100.0),
        CssLpa::Calc { .. } => length(v.resolve(basis).unwrap_or(0.0)),
    }
}

fn dimension(v: CssLpa, basis: f32) -> Dimension {
    match v {
        CssLpa::Auto => auto(),
        CssLpa::Px(px) => length(px),
        CssLpa::Percent(p) => percent(p / 100.0),
        CssLpa::Calc { .. } => length(v.resolve(basis).unwrap_or(0.0)),
    }
}

fn min_dimension(v: CssLp, basis: f32) -> LengthPercentageAuto {
    match v {
        CssLp::Px(px) => length(px),
        CssLp::Percent(p) => percent(p / 100.0),
        CssLp::Calc { .. } => length(v.resolve(basis)),
    }
}

fn max_dimension(v: MaxSize, basis: f32) -> LengthPercentageAuto {
    match v {
        MaxSize::None => auto(),
        MaxSize::Px(px) => length(px),
        MaxSize::Percent(p) => percent(p / 100.0),
        MaxSize::Calc { .. } => length(v.resolve(basis).unwrap_or(0.0)),
    }
}

fn track(t: TrackSize) -> GridTemplateComponent<String> {
    match t {
        TrackSize::Px(px) => length(px),
        TrackSize::Percent(p) => percent(p / 100.0),
        TrackSize::Fr(f) => fr(f),
        TrackSize::Auto => auto(),
        TrackSize::MinContent => min_content(),
        TrackSize::MaxContent => max_content(),
    }
}

fn auto_track(t: TrackSize) -> TrackSizingFunction {
    match t {
        TrackSize::Px(px) => length(px),
        TrackSize::Percent(p) => percent(p / 100.0),
        TrackSize::Fr(f) => fr(f),
        TrackSize::Auto => auto(),
        TrackSize::MinContent => min_content(),
        TrackSize::MaxContent => max_content(),
    }
}

fn placement(start: GridLine, end: GridLine) -> Line<GridPlacement<String>> {
    let one = |g: GridLine, suffix: &str| -> GridPlacement<String> {
        match g {
            GridLine::Auto => auto(),
            GridLine::Line(n) => line(i16::try_from(n).unwrap_or(i16::MAX)),
            GridLine::Span(n) => span(u16::try_from(n).unwrap_or(u16::MAX)),
            GridLine::Named(name) => GridPlacement::NamedLine(format!("{name}{suffix}"), 1),
        }
    };
    Line {
        start: one(start, "-start"),
        end: one(end, "-end"),
    }
}

fn justify(v: CssJustify) -> Option<JustifyContent> {
    Some(match v {
        CssJustify::Normal => return None,
        CssJustify::FlexStart => JustifyContent::FLEX_START,
        CssJustify::FlexEnd => JustifyContent::FLEX_END,
        CssJustify::Start | CssJustify::Left => JustifyContent::START,
        CssJustify::End | CssJustify::Right => JustifyContent::END,
        CssJustify::Center => JustifyContent::CENTER,
        CssJustify::SpaceBetween => JustifyContent::SPACE_BETWEEN,
        CssJustify::SpaceAround => JustifyContent::SPACE_AROUND,
        CssJustify::SpaceEvenly => JustifyContent::SPACE_EVENLY,
        CssJustify::Stretch => JustifyContent::STRETCH,
        CssJustify::Baseline => JustifyContent::START,
    })
}

fn align(v: CssAlign) -> Option<AlignItems> {
    Some(match v {
        CssAlign::Normal => return None,
        CssAlign::Stretch => AlignItems::STRETCH,
        CssAlign::FlexStart | CssAlign::SelfStart => AlignItems::FLEX_START,
        CssAlign::FlexEnd | CssAlign::SelfEnd => AlignItems::FLEX_END,
        CssAlign::Start | CssAlign::Left => AlignItems::START,
        CssAlign::End | CssAlign::Right => AlignItems::END,
        CssAlign::Center => AlignItems::CENTER,
        CssAlign::Baseline => AlignItems::BASELINE,
    })
}

fn align_self(v: SelfAlignment) -> Option<AlignSelf> {
    Some(match v {
        SelfAlignment::Auto | SelfAlignment::Normal => return None,
        SelfAlignment::Stretch => AlignSelf::STRETCH,
        SelfAlignment::FlexStart | SelfAlignment::SelfStart => AlignSelf::FLEX_START,
        SelfAlignment::FlexEnd | SelfAlignment::SelfEnd => AlignSelf::FLEX_END,
        SelfAlignment::Start => AlignSelf::START,
        SelfAlignment::End => AlignSelf::END,
        SelfAlignment::Center => AlignSelf::CENTER,
        SelfAlignment::Baseline => AlignSelf::BASELINE,
    })
}

/// Style for the taffy root (the container's content box).
fn container_style(
    style: &ComputedStyle,
    content_width: f32,
    content_height: Option<f32>,
) -> Style<String> {
    let basis = Basis {
        width: content_width,
        height: content_height.unwrap_or(0.0),
    };
    Style {
        display: if style.display.is_grid() {
            Display::Grid
        } else {
            Display::Flex
        },
        size: Size {
            width: length(content_width),
            height: content_height.map_or(auto(), length),
        },
        flex_direction: match style.flex_direction {
            CssDir::Row => FlexDirection::Row,
            CssDir::RowReverse => FlexDirection::RowReverse,
            CssDir::Column => FlexDirection::Column,
            CssDir::ColumnReverse => FlexDirection::ColumnReverse,
        },
        flex_wrap: match style.flex_wrap {
            CssWrap::NoWrap => FlexWrap::NoWrap,
            CssWrap::Wrap => FlexWrap::Wrap,
            CssWrap::WrapReverse => FlexWrap::WrapReverse,
        },
        justify_content: justify(style.justify_content),
        align_content: justify(style.align_content),
        align_items: align(style.align_items),
        justify_items: align(style.justify_items),
        gap: Size {
            width: lp(style.column_gap, basis.width),
            height: lp(style.row_gap, basis.height),
        },
        grid_template_columns: style
            .grid_template_columns
            .iter()
            .copied()
            .map(track)
            .collect(),
        grid_template_rows: style
            .grid_template_rows
            .iter()
            .copied()
            .map(track)
            .collect(),
        grid_auto_columns: style
            .grid_auto_columns
            .iter()
            .copied()
            .map(auto_track)
            .collect(),
        grid_auto_rows: style
            .grid_auto_rows
            .iter()
            .copied()
            .map(auto_track)
            .collect(),
        grid_template_areas: (!style.grid_template_areas.is_none()).then(|| {
            let areas = style
                .grid_template_areas
                .named_boxes()
                .into_iter()
                .map(|(name, rs, re, cs, ce)| GridTemplateArea {
                    name,
                    row_start: rs,
                    row_end: re,
                    column_start: cs,
                    column_end: ce,
                })
                .collect();
            TaffyGridTemplateAreas {
                areas,
                row_count: style.grid_template_areas.row_count(),
                column_count: style.grid_template_areas.column_count(),
            }
        }),
        ..Style::default()
    }
}

/// Style for a flex/grid item.
fn item_style(style: &ComputedStyle, basis: Basis) -> Style<String> {
    Style {
        display: Display::Block,
        size: Size {
            width: dimension(style.width, basis.width),
            height: dimension(style.height, basis.height),
        },
        min_size: Size {
            width: min_dimension(style.min_width, basis.width),
            height: min_dimension(style.min_height, basis.height),
        },
        max_size: Size {
            width: max_dimension(style.max_width, basis.width),
            height: max_dimension(style.max_height, basis.height),
        },
        margin: Rect {
            left: lpa(style.margin_left, basis.width),
            right: lpa(style.margin_right, basis.width),
            top: lpa(style.margin_top, basis.width),
            bottom: lpa(style.margin_bottom, basis.width),
        },
        flex_grow: style.flex_grow,
        flex_shrink: style.flex_shrink,
        flex_basis: dimension(style.flex_basis, basis.width),
        align_self: align_self(style.align_self),
        justify_self: align_self(style.justify_self),
        grid_row: placement(style.grid_row_start.clone(), style.grid_row_end.clone()),
        grid_column: placement(
            style.grid_column_start.clone(),
            style.grid_column_end.clone(),
        ),
        ..Style::default()
    }
}

/// Lays out the in-flow children of a flex/grid container inside `content`.
/// Returns the content height.
pub fn layout_flex(
    bx: &mut LayoutBox,
    ctx: &mut LayoutCtx<'_>,
    content: CoreRect,
    cb_height: Option<f32>,
) -> f32 {
    let style = bx.style.clone();
    let mut tree: TaffyTree<usize> = TaffyTree::new();
    let basis = Basis {
        width: content.width(),
        height: cb_height.unwrap_or(0.0),
    };
    // `order`: items are handed to taffy in order-modified document order.
    let mut indices: Vec<usize> = bx
        .children
        .iter()
        .enumerate()
        .filter(|(_, c)| !c.is_out_of_flow())
        .map(|(i, _)| i)
        .collect();
    indices.sort_by_key(|&i| bx.children[i].style.order);
    let mut item_nodes: Vec<(usize, NodeId)> = Vec::new();
    for index in indices {
        let child = &bx.children[index];
        let node = tree
            .new_leaf_with_context(item_style(&child.style, basis), index)
            .expect("taffy leaf");
        item_nodes.push((index, node));
    }
    let children: Vec<NodeId> = item_nodes.iter().map(|(_, n)| *n).collect();
    let definite_height = if style.height.is_auto() {
        None
    } else {
        cb_height
    };
    let root = tree
        .new_with_children(
            container_style(&style, content.width(), definite_height),
            &children,
        )
        .expect("taffy root");

    let viewport_width = ctx.viewport.width;
    let items = &mut bx.children;
    let available = Size {
        width: AvailableSpace::Definite(content.width()),
        height: cb_height.map_or(AvailableSpace::MaxContent, AvailableSpace::Definite),
    };
    tree.compute_layout_with_measure(
        root,
        available,
        |input: LayoutInput, _node, index: Option<&mut usize>, _style| {
            let Some(&mut index) = index else {
                return LayoutOutput::HIDDEN;
            };
            let known = input.known_dimensions;
            let child = &mut items[index];
            // A nested flex/grid container measured without a known width is
            // content-sized (flex-basis: auto → max-content clamped to the
            // available space), never stretched to fill the outer container
            // the way `layout_box_at` sizes a block. Forcing the fit-content
            // width also keys the memo on the item's own size rather than on
            // whichever ancestor is probing, which keeps nested containers
            // linear. Text-bearing items keep the block path: their
            // pre-layout intrinsic widths do not collapse whitespace yet.
            let available = match input.available_space.width {
                AvailableSpace::Definite(w) => w,
                AvailableSpace::MinContent => 0.0,
                AvailableSpace::MaxContent => f32::INFINITY,
            };
            // Anonymous items share the container's style (and so its
            // `display`); only element-generated boxes are real containers.
            let nested_container = child.node.is_some()
                && !style.display.is_grid()
                && (child.style.display.is_flex() || child.style.display.is_grid());
            let width = known
                .width
                .or_else(|| nested_container.then(|| fit_content_width(child, ctx, available)));
            let cb_width = if available.is_finite() {
                available
            } else {
                viewport_width
            };
            let forced = Forced {
                width,
                height: known.height,
            };
            layout_item(
                child,
                ctx,
                ContainingBlock {
                    width: cb_width,
                    height: None,
                },
                Point::ZERO,
                forced,
            );
            // Taffy adds margins itself; report the border box.
            LayoutOutput::from_outer_size(Size {
                width: known.width.unwrap_or(child.rect.width()),
                height: known.height.unwrap_or(child.rect.height()),
            })
        },
    )
    .expect("taffy layout");

    for (index, node) in item_nodes {
        let layout = tree.layout(node).expect("laid out");
        let child = &mut items[index];
        let margins = resolve_margins(&child.style, content.width());
        let origin = Point::new(
            content.x() + layout.location.x - margins.left,
            content.y() + layout.location.y - margins.top,
        );
        let forced = Forced {
            width: Some(layout.size.width),
            height: Some(layout.size.height),
        };
        layout_item(
            child,
            ctx,
            ContainingBlock {
                width: layout.size.width,
                height: Some(layout.size.height),
            },
            origin,
            forced,
        );
    }
    // Out-of-flow children get their static position at the content origin.
    for child in items.iter_mut().filter(|c| c.is_out_of_flow()) {
        child.rect = CoreRect::new(content.x(), content.y(), 0.0, 0.0);
    }
    tree.layout(root).map_or(0.0, |l| l.size.height)
}
