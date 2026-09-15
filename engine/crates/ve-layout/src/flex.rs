//! Flex and grid containers, computed by `taffy` with items measured by the
//! engine's own block layout.
//!
//! The container's *content box* is handed to taffy as the root node; each
//! in-flow child becomes a leaf whose intrinsic size taffy obtains through
//! the measure callback (which runs a throw-away block layout). Once taffy has
//! resolved positions and sizes, every child is laid out for real at its
//! final location with its final size forced.

use taffy::prelude::*;
use taffy::tree::{LayoutInput, LayoutOutput};
use ve_core::{Point, Rect as CoreRect};
use ve_style::{
    AlignItems as CssAlign, ComputedStyle, Display as CssDisplay, FlexDirection as CssDir,
    FlexWrap as CssWrap, JustifyContent as CssJustify, LengthPercentage as CssLp,
    LengthPercentageAuto as CssLpa, MaxSize, TrackSize,
};

use crate::block::{ContainingBlock, Forced, LayoutCtx, layout_box_at, resolve_margins};
use crate::box_tree::LayoutBox;

fn lp(v: CssLp) -> LengthPercentage {
    match v {
        CssLp::Px(px) => length(px),
        CssLp::Percent(p) => percent(p / 100.0),
    }
}

fn lpa(v: CssLpa) -> LengthPercentageAuto {
    match v {
        CssLpa::Auto => auto(),
        CssLpa::Px(px) => length(px),
        CssLpa::Percent(p) => percent(p / 100.0),
    }
}

fn dimension(v: CssLpa) -> Dimension {
    match v {
        CssLpa::Auto => auto(),
        CssLpa::Px(px) => length(px),
        CssLpa::Percent(p) => percent(p / 100.0),
    }
}

fn max_dimension(v: MaxSize) -> LengthPercentageAuto {
    match v {
        MaxSize::None => auto(),
        MaxSize::Px(px) => length(px),
        MaxSize::Percent(p) => percent(p / 100.0),
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

fn justify(v: CssJustify) -> JustifyContent {
    match v {
        CssJustify::FlexStart => JustifyContent::FLEX_START,
        CssJustify::FlexEnd => JustifyContent::FLEX_END,
        CssJustify::Start => JustifyContent::START,
        CssJustify::End => JustifyContent::END,
        CssJustify::Center => JustifyContent::CENTER,
        CssJustify::SpaceBetween => JustifyContent::SPACE_BETWEEN,
        CssJustify::SpaceAround => JustifyContent::SPACE_AROUND,
        CssJustify::SpaceEvenly => JustifyContent::SPACE_EVENLY,
        CssJustify::Stretch => JustifyContent::STRETCH,
    }
}

fn align(v: CssAlign) -> AlignItems {
    match v {
        CssAlign::Stretch => AlignItems::STRETCH,
        CssAlign::FlexStart => AlignItems::FLEX_START,
        CssAlign::FlexEnd => AlignItems::FLEX_END,
        CssAlign::Start => AlignItems::START,
        CssAlign::End => AlignItems::END,
        CssAlign::Center => AlignItems::CENTER,
        CssAlign::Baseline => AlignItems::BASELINE,
    }
}

/// Style for the taffy root (the container's content box).
fn container_style(
    style: &ComputedStyle,
    content_width: f32,
    content_height: Option<f32>,
) -> Style<String> {
    let is_grid = style.display.is_grid()
        || matches!(style.display, CssDisplay::Grid | CssDisplay::InlineGrid);
    Style {
        display: if is_grid {
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
        justify_content: Some(justify(style.justify_content)),
        align_items: Some(align(style.align_items)),
        gap: Size {
            width: lp(style.column_gap),
            height: lp(style.row_gap),
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
        ..Style::default()
    }
}

/// Style for a flex/grid item.
fn item_style(style: &ComputedStyle) -> Style<String> {
    Style {
        display: Display::Block,
        size: Size {
            width: dimension(style.width),
            height: dimension(style.height),
        },
        min_size: Size {
            width: lpa(CssLpa::from_lp(style.min_width)),
            height: lpa(CssLpa::from_lp(style.min_height)),
        },
        max_size: Size {
            width: max_dimension(style.max_width),
            height: max_dimension(style.max_height),
        },
        margin: Rect {
            left: lpa(style.margin_left),
            right: lpa(style.margin_right),
            top: lpa(style.margin_top),
            bottom: lpa(style.margin_bottom),
        },
        flex_grow: style.flex_grow,
        flex_shrink: style.flex_shrink,
        flex_basis: dimension(style.flex_basis),
        ..Style::default()
    }
}

trait FromLp {
    fn from_lp(v: CssLp) -> Self;
}

impl FromLp for CssLpa {
    fn from_lp(v: CssLp) -> Self {
        match v {
            CssLp::Px(px) => CssLpa::Px(px),
            CssLp::Percent(p) => CssLpa::Percent(p),
        }
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
    let mut item_nodes: Vec<(usize, NodeId)> = Vec::new();
    for (index, child) in bx.children.iter().enumerate() {
        if child.is_out_of_flow() {
            continue;
        }
        let node = tree
            .new_leaf_with_context(item_style(&child.style), index)
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
            let cb_width = known.width.unwrap_or(match input.available_space.width {
                AvailableSpace::Definite(w) => w,
                AvailableSpace::MinContent => 0.0,
                AvailableSpace::MaxContent => viewport_width,
            });
            let forced = Forced {
                width: known.width,
                height: known.height,
            };
            layout_box_at(
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
        layout_box_at(
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
