//! Table layout: CSS 2.1 §17 automatic table layout with separated borders.
//!
//! The box tree has already been fixed up (§17.2.1), so a [`BoxKind::Table`]
//! box contains only captions, row groups and out-of-flow boxes; row groups
//! contain rows; rows contain cells. This module:
//!
//! 1. builds the cell grid, honouring `colspan` / `rowspan` occupancy;
//! 2. computes per-column min- and max-content widths from the cells
//!    (spanning cells spread their contribution over the spanned columns);
//! 3. resolves the table width (specified, forced, or shrink-to-fit) and
//!    distributes it over the columns (§17.5.2.2);
//! 4. lays out every cell at its column width, sizes rows from the tallest
//!    cell (a spanning cell's excess goes to the last row it spans), and
//!    positions rows, row groups and cells with `border-spacing`;
//! 5. vertically aligns cell content (`top` / `middle` / `bottom`);
//! 6. places captions above or below per `caption-side`.
//!
//! `border-collapse: collapse` zeroes the spacing (done by the cascade) and
//! adjacent cells share an edge of `max(left, right)` / `max(top, bottom)`
//! so the shared border is not doubled. Column elements contribute no widths.

use ve_core::{Point, Rect, Size};
use ve_style::{
    BorderCollapse, BoxSizing, CaptionSide, LengthPercentageAuto, TableLayout, VerticalAlign,
    Visibility,
};

use crate::block::{
    ContainingBlock, Forced, LayoutCtx, border_edges, box_edges, intrinsic_min_width,
    intrinsic_width, layout_box_at, resolve_margins, translate_subtree,
};
use crate::box_tree::{BoxKind, LayoutBox};

/// A cell's place in the grid: indices into the box tree plus its span.
#[derive(Clone, Copy, Debug)]
struct GridCell {
    group: usize,
    row: usize,
    cell: usize,
    /// First grid row / column occupied.
    grid_row: usize,
    col: usize,
    col_span: usize,
    row_span: usize,
}

/// The resolved grid of a table.
struct Grid {
    cells: Vec<GridCell>,
    /// `(group index, row index)` for every grid row, in order.
    rows: Vec<(usize, usize)>,
    n_cols: usize,
}

/// A column's specified width, if any.
#[derive(Clone, Copy, Debug, PartialEq)]
enum ColSpec {
    Auto,
    Px(f32),
    Percent(f32),
}

fn row_groups(bx: &LayoutBox) -> impl Iterator<Item = (usize, &LayoutBox)> {
    bx.children
        .iter()
        .enumerate()
        .filter(|(_, c)| c.kind == BoxKind::TableRowGroup)
}

fn build_grid(bx: &LayoutBox) -> Grid {
    let mut cells = Vec::new();
    let mut rows = Vec::new();
    // occupancy[grid_row][col]
    let mut occupancy: Vec<Vec<bool>> = Vec::new();
    let mut n_cols = 0usize;
    for (g, group) in row_groups(bx) {
        let group_rows: Vec<usize> = group
            .children
            .iter()
            .enumerate()
            .filter(|(_, r)| r.kind == BoxKind::TableRow)
            .map(|(i, _)| i)
            .collect();
        let first_grid_row = rows.len();
        for (k, &r) in group_rows.iter().enumerate() {
            let grid_row = first_grid_row + k;
            rows.push((g, r));
            if occupancy.len() <= grid_row {
                occupancy.resize(grid_row + 1, Vec::new());
            }
            let row = &group.children[r];
            let mut col = 0usize;
            for (c, cell) in row.children.iter().enumerate() {
                if cell.kind != BoxKind::TableCell {
                    continue;
                }
                while occupancy[grid_row].get(col).copied().unwrap_or(false) {
                    col += 1;
                }
                let col_span = (cell.col_span.max(1)) as usize;
                let row_span = if cell.row_span == 0 {
                    group_rows.len() - k
                } else {
                    (cell.row_span as usize).min(group_rows.len() - k)
                };
                for rr in grid_row..grid_row + row_span {
                    if occupancy.len() <= rr {
                        occupancy.resize(rr + 1, Vec::new());
                    }
                    if occupancy[rr].len() < col + col_span {
                        occupancy[rr].resize(col + col_span, false);
                    }
                    for slot in occupancy[rr].iter_mut().skip(col).take(col_span) {
                        *slot = true;
                    }
                }
                n_cols = n_cols.max(col + col_span);
                cells.push(GridCell {
                    group: g,
                    row: r,
                    cell: c,
                    grid_row,
                    col,
                    col_span,
                    row_span,
                });
                col += col_span;
            }
        }
    }
    Grid {
        cells,
        rows,
        n_cols,
    }
}

/// Per-column min/max content widths and specified widths.
struct Columns {
    min: Vec<f32>,
    max: Vec<f32>,
    spec: Vec<ColSpec>,
}

fn cell<'a>(bx: &'a LayoutBox, gc: &GridCell) -> &'a LayoutBox {
    &bx.children[gc.group].children[gc.row].children[gc.cell]
}

fn cell_mut<'a>(bx: &'a mut LayoutBox, gc: &GridCell) -> &'a mut LayoutBox {
    &mut bx.children[gc.group].children[gc.row].children[gc.cell]
}

/// Overlap on the grid line after column/row `i` (shared collapsed border).
fn collapsed_overlaps(bx: &LayoutBox, grid: &Grid) -> (Vec<f32>, Vec<f32>) {
    let n = grid.n_cols;
    let nr = grid.rows.len();
    let mut col_left = vec![0.0_f32; n];
    let mut col_right = vec![0.0_f32; n];
    let mut row_top = vec![0.0_f32; nr];
    let mut row_bottom = vec![0.0_f32; nr];
    for gc in &grid.cells {
        let b = border_edges(&cell(bx, gc).style);
        if n > 0 {
            col_left[gc.col] = col_left[gc.col].max(b.left);
            let last_c = gc.col + gc.col_span - 1;
            col_right[last_c] = col_right[last_c].max(b.right);
        }
        if nr > 0 {
            row_top[gc.grid_row] = row_top[gc.grid_row].max(b.top);
            let last_r = (gc.grid_row + gc.row_span - 1).min(nr.saturating_sub(1));
            row_bottom[last_r] = row_bottom[last_r].max(b.bottom);
        }
    }
    let mut col_ov = vec![0.0; n];
    for i in 0..n.saturating_sub(1) {
        col_ov[i] = col_right[i].max(col_left[i + 1]);
    }
    let mut row_ov = vec![0.0; nr];
    for i in 0..nr.saturating_sub(1) {
        row_ov[i] = row_bottom[i].max(row_top[i + 1]);
    }
    (col_ov, row_ov)
}

fn overlap_sum(ov: &[f32], start: usize, end: usize) -> f32 {
    ov.get(start..end).map_or(0.0, |s| s.iter().copied().sum())
}

fn column_widths_fixed(bx: &LayoutBox, grid: &Grid) -> Columns {
    let n = grid.n_cols;
    let mut cols = Columns {
        min: vec![0.0; n],
        max: vec![0.0; n],
        spec: vec![ColSpec::Auto; n],
    };
    let first_row = grid.rows.first().copied();
    for gc in &grid.cells {
        if first_row != Some((gc.group, gc.row)) || gc.col_span != 1 {
            continue;
        }
        let cell = cell(bx, gc);
        let (_, padding, border) = box_edges(cell, 0.0);
        let bp_h = padding.horizontal() + border.horizontal();
        let min_width = cell.style.min_width.resolve(0.0);
        let min_border_box = if cell.style.box_sizing == BoxSizing::BorderBox {
            min_width
        } else {
            min_width + bp_h
        };
        cols.min[gc.col] = cols.min[gc.col].max(min_border_box);
        cols.max[gc.col] = cols.max[gc.col].max(min_border_box);
        match cell.style.width {
            LengthPercentageAuto::Px(w) => {
                let border_box = if cell.style.box_sizing == BoxSizing::BorderBox {
                    w
                } else {
                    w + bp_h
                };
                cols.spec[gc.col] = ColSpec::Px(border_box);
                cols.min[gc.col] = border_box;
                cols.max[gc.col] = border_box;
            }
            LengthPercentageAuto::Percent(p) => {
                cols.spec[gc.col] = ColSpec::Percent(p);
            }
            _ => {}
        }
    }
    cols
}

fn column_widths(
    bx: &mut LayoutBox,
    grid: &Grid,
    spacing: f32,
    ctx: &mut LayoutCtx<'_>,
) -> Columns {
    if bx.style.table_layout == TableLayout::Fixed {
        return column_widths_fixed(bx, grid);
    }
    let n = grid.n_cols;
    let mut cols = Columns {
        min: vec![0.0; n],
        max: vec![0.0; n],
        spec: vec![ColSpec::Auto; n],
    };
    // Single-column cells first, spanning cells afterwards (§17.5.2.2 step 2).
    let mut order: Vec<&GridCell> = grid.cells.iter().collect();
    order.sort_by_key(|c| c.col_span);
    for gc in order {
        let cell = cell_mut(bx, gc);
        let style = cell.style.clone();
        let (_, padding, border) = box_edges(cell, 0.0);
        let bp_h = padding.horizontal() + border.horizontal();
        let mut cell_min = intrinsic_min_width(cell, ctx);
        let mut cell_max = intrinsic_width(cell, ctx);
        let spec = match style.width {
            LengthPercentageAuto::Px(w) => {
                let border_box = if style.box_sizing == BoxSizing::BorderBox {
                    w
                } else {
                    w + bp_h
                };
                cell_max = cell_max.max(border_box).max(cell_min);
                cell_min = cell_min.max(border_box.min(cell_max));
                ColSpec::Px(border_box)
            }
            LengthPercentageAuto::Percent(p) => ColSpec::Percent(p),
            _ => ColSpec::Auto,
        };
        let inner_spacing = spacing * (gc.col_span.saturating_sub(1)) as f32;
        let range = gc.col..gc.col + gc.col_span;
        if gc.col_span == 1 {
            cols.min[gc.col] = cols.min[gc.col].max(cell_min);
            cols.max[gc.col] = cols.max[gc.col].max(cell_max);
            if let ColSpec::Px(w) = spec {
                cols.spec[gc.col] = match cols.spec[gc.col] {
                    ColSpec::Px(old) => ColSpec::Px(old.max(w)),
                    ColSpec::Percent(p) => ColSpec::Percent(p),
                    ColSpec::Auto => ColSpec::Px(w),
                };
            } else if let ColSpec::Percent(p) = spec {
                cols.spec[gc.col] = ColSpec::Percent(p);
            }
        } else {
            let sum_min: f32 = cols.min[range.clone()].iter().sum();
            let sum_max: f32 = cols.max[range.clone()].iter().sum();
            let deficit_min = cell_min - inner_spacing - sum_min;
            if deficit_min > 0.0 {
                let each = deficit_min / gc.col_span as f32;
                for c in range.clone() {
                    cols.min[c] += each;
                }
            }
            let deficit_max = cell_max - inner_spacing - sum_max;
            if deficit_max > 0.0 {
                let each = deficit_max / gc.col_span as f32;
                for c in range.clone() {
                    cols.max[c] += each;
                }
            }
        }
    }
    for c in 0..n {
        cols.max[c] = cols.max[c].max(cols.min[c]);
    }
    cols
}

/// Distributes `available` (the width of the column area, spacing excluded)
/// over the columns.
fn distribute(cols: &Columns, available: f32) -> Vec<f32> {
    let n = cols.min.len();
    if n == 0 {
        return Vec::new();
    }
    let mut widths = cols.min.clone();
    // 1. Percentage columns get their share (never below min-content) and
    //    fixed-width columns their specified width; auto columns flex.
    let mut remaining = available;
    let mut flexible: Vec<usize> = Vec::new();
    let mut fixed: Vec<usize> = Vec::new();
    for (c, width) in widths.iter_mut().enumerate().take(n) {
        match cols.spec[c] {
            ColSpec::Percent(p) => {
                *width = (available * p / 100.0).max(cols.min[c]);
                remaining -= *width;
            }
            ColSpec::Px(_) => {
                *width = cols.max[c];
                remaining -= *width;
                fixed.push(c);
            }
            ColSpec::Auto => flexible.push(c),
        }
    }
    if flexible.is_empty() {
        // Only fixed / percentage columns: fixed ones absorb the slack.
        if !fixed.is_empty() && remaining > 0.0 {
            let sum: f32 = fixed.iter().map(|&c| widths[c]).sum();
            for &c in &fixed {
                widths[c] += if sum > 0.0 {
                    remaining * widths[c] / sum
                } else {
                    remaining / fixed.len() as f32
                };
            }
        } else if remaining < 0.0 {
            // Over-constrained: shrink fixed columns towards their minimum.
            let mut deficit = -remaining;
            for &c in &fixed {
                let give = (widths[c] - cols.min[c]).min(deficit).max(0.0);
                widths[c] -= give;
                deficit -= give;
            }
        }
        return widths;
    }
    let sum_min: f32 = flexible.iter().map(|&c| cols.min[c]).sum();
    let sum_max: f32 = flexible.iter().map(|&c| cols.max[c]).sum();
    if remaining <= sum_min {
        // Nothing to give: every column at its minimum.
        return widths;
    }
    if remaining >= sum_max {
        // Everyone at max; the excess is shared proportionally to the max
        // widths (equally when they are all zero).
        let extra = remaining - sum_max;
        for &c in &flexible {
            let share = if sum_max > 0.0 {
                extra * cols.max[c] / sum_max
            } else {
                extra / flexible.len() as f32
            };
            widths[c] = cols.max[c] + share;
        }
        return widths;
    }
    // Between min and max: interpolate.
    let t = (remaining - sum_min) / (sum_max - sum_min).max(f32::EPSILON);
    for &c in &flexible {
        widths[c] = cols.min[c] + (cols.max[c] - cols.min[c]) * t;
    }
    widths
}

/// The horizontal `border-spacing` used by `bx` (zero when collapsing).
fn spacing_of(bx: &LayoutBox) -> Size {
    Size::new(
        bx.style.border_spacing_x.max(0.0),
        bx.style.border_spacing_y.max(0.0),
    )
}

/// Min- and max-content widths of the table's **border box** (captions
/// included, margins excluded).
pub fn intrinsic_widths(bx: &mut LayoutBox, ctx: &mut LayoutCtx<'_>) -> (f32, f32) {
    let style = bx.style.clone();
    let (_, padding, border) = box_edges(bx, 0.0);
    let bp_h = padding.horizontal() + border.horizontal();
    let spacing = spacing_of(bx);
    let grid = build_grid(bx);
    let cols = column_widths(bx, &grid, spacing.width, ctx);
    let total_spacing = if grid.n_cols == 0 {
        0.0
    } else {
        spacing.width * (grid.n_cols + 1) as f32
    };
    let mut min: f32 = cols.min.iter().sum::<f32>() + total_spacing;
    let mut max: f32 = cols.max.iter().sum::<f32>() + total_spacing;
    for caption in bx
        .children
        .iter_mut()
        .filter(|c| c.kind == BoxKind::TableCaption)
    {
        min = min.max(intrinsic_min_width(caption, ctx) - bp_h);
        max = max.max(intrinsic_width(caption, ctx) - bp_h);
    }
    if let LengthPercentageAuto::Px(w) = style.width {
        let border_box = if style.box_sizing == BoxSizing::BorderBox {
            w
        } else {
            w + bp_h
        };
        let w = border_box.max(min + bp_h);
        return (w, w);
    }
    (min + bp_h, max.max(min) + bp_h)
}

/// Lays out a table box with its margin-box top-left at `origin`.
pub fn layout_table(
    bx: &mut LayoutBox,
    ctx: &mut LayoutCtx<'_>,
    cb: ContainingBlock,
    origin: Point,
    forced: Forced,
) {
    let style = bx.style.clone();
    let (margin, padding, border) = box_edges(bx, cb.width);
    let bp_h = padding.horizontal() + border.horizontal();
    let bp_v = padding.vertical() + border.vertical();
    let spacing = spacing_of(bx);
    let grid = build_grid(bx);
    let cols = column_widths(bx, &grid, spacing.width, ctx);
    let total_spacing = if grid.n_cols == 0 {
        0.0
    } else {
        spacing.width * (grid.n_cols + 1) as f32
    };
    let sum_min: f32 = cols.min.iter().sum::<f32>() + total_spacing;
    let sum_max: f32 = cols.max.iter().sum::<f32>() + total_spacing;

    // ---- table width ---------------------------------------------------
    let content_width = if let Some(w) = forced.width {
        (w - bp_h).max(sum_min)
    } else {
        match style.width.resolve(cb.width) {
            Some(w) => {
                let content = if style.box_sizing == BoxSizing::BorderBox {
                    (w - bp_h).max(0.0)
                } else {
                    w
                };
                content.max(sum_min)
            }
            None => {
                let available = (cb.width - margin.horizontal() - bp_h).max(0.0);
                sum_min.max(sum_max.min(available))
            }
        }
    };
    let widths = distribute(&cols, content_width - total_spacing);

    let mut margin_left = margin.left;
    if forced.width.is_none()
        && bx.is_block_level()
        && bx.is_in_flow()
        && (style.margin_left.is_auto() || style.margin_right.is_auto())
    {
        let free = cb.width - content_width - bp_h;
        margin_left = if style.margin_left.is_auto() && style.margin_right.is_auto() {
            (free / 2.0).max(0.0)
        } else if style.margin_left.is_auto() {
            (free - margin.right).max(0.0)
        } else {
            margin.left
        };
    }
    let border_origin = Point::new(origin.x + margin_left, origin.y + margin.top);
    let content_x = border_origin.x + border.left + padding.left;
    let mut cursor_y = border_origin.y + border.top + padding.top;
    let content_top = cursor_y;

    // ---- captions (top) ------------------------------------------------
    let table_border_width = content_width + bp_h;
    for side in [CaptionSide::Top, CaptionSide::Bottom] {
        if side == CaptionSide::Bottom {
            cursor_y = layout_rows(
                bx,
                ctx,
                &grid,
                &widths,
                spacing,
                content_x,
                cursor_y,
                content_width,
            );
        }
        for caption in bx
            .children
            .iter_mut()
            .filter(|c| c.kind == BoxKind::TableCaption && c.style.caption_side == side)
        {
            let cb = ContainingBlock {
                width: table_border_width,
                height: None,
            };
            layout_box_at(
                caption,
                ctx,
                cb,
                Point::new(border_origin.x, cursor_y),
                Forced {
                    width: Some(table_border_width),
                    height: None,
                },
            );
            let m = resolve_margins(&caption.style, table_border_width);
            cursor_y = caption.rect.bottom() + m.bottom;
        }
    }

    // Out-of-flow children get their static position.
    for child in bx.children.iter_mut().filter(|c| c.is_out_of_flow()) {
        child.rect = Rect::new(content_x, content_top, 0.0, 0.0);
    }

    // ---- final size ----------------------------------------------------
    let natural = cursor_y - content_top;
    let content_height = match forced.height {
        Some(h) => (h - bp_v).max(0.0),
        None => {
            let specified = style.height.maybe_resolve(cb.height).map_or(0.0, |h| {
                if style.box_sizing == BoxSizing::BorderBox {
                    (h - bp_v).max(0.0)
                } else {
                    h
                }
            });
            natural.max(specified)
        }
    };
    bx.content = Rect::new(content_x, content_top, content_width, content_height);
    bx.rect = Rect::new(
        border_origin.x,
        border_origin.y,
        content_width + bp_h,
        content_height + bp_v,
    );
}

/// Lays out rows and cells starting at `top`; returns the `y` below the last
/// row (including the trailing spacing).
#[allow(clippy::too_many_arguments)]
fn layout_rows(
    bx: &mut LayoutBox,
    ctx: &mut LayoutCtx<'_>,
    grid: &Grid,
    widths: &[f32],
    spacing: Size,
    content_x: f32,
    top: f32,
    content_width: f32,
) -> f32 {
    if grid.rows.is_empty() {
        return top;
    }
    let collapsed = bx.style.border_collapse == BorderCollapse::Collapse;
    let (col_ov, row_ov) = if collapsed {
        collapsed_overlaps(bx, grid)
    } else {
        (vec![0.0; widths.len()], vec![0.0; grid.rows.len()])
    };
    // Column x positions. Collapsed adjacent borders occupy one shared edge.
    let mut col_x = Vec::with_capacity(widths.len());
    let mut x = content_x + spacing.width;
    for (i, w) in widths.iter().enumerate() {
        col_x.push(x);
        x += w + spacing.width - col_ov.get(i).copied().unwrap_or(0.0);
    }
    let cell_width = |gc: &GridCell| -> f32 {
        widths[gc.col..gc.col + gc.col_span].iter().sum::<f32>()
            + spacing.width * (gc.col_span - 1) as f32
            - overlap_sum(&col_ov, gc.col, gc.col + gc.col_span.saturating_sub(1))
    };

    // ---- measure: row heights ---------------------------------------------
    let n_rows = grid.rows.len();
    let mut row_heights: Vec<f32> = grid
        .rows
        .iter()
        .map(|&(g, r)| {
            let row = &bx.children[g].children[r];
            row.style.height.resolve(0.0).unwrap_or(0.0).max(0.0)
        })
        .collect();
    let mut natural: Vec<f32> = vec![0.0; grid.cells.len()];
    for (i, gc) in grid.cells.iter().enumerate() {
        let w = cell_width(gc);
        let cell = cell_mut(bx, gc);
        layout_box_at(
            cell,
            ctx,
            ContainingBlock {
                width: w,
                height: None,
            },
            Point::ZERO,
            Forced {
                width: Some(w),
                height: None,
            },
        );
        let h = cell.rect.height();
        natural[i] = cell.content.height();
        if gc.row_span == 1 {
            row_heights[gc.grid_row] = row_heights[gc.grid_row].max(h);
        }
    }
    // Spanning cells: the deficit goes to the last spanned row.
    for gc in grid.cells.iter().filter(|c| c.row_span > 1) {
        let cell = cell_mut(bx, gc);
        let h = cell.rect.height();
        let last = (gc.grid_row + gc.row_span - 1).min(n_rows - 1);
        let spanned: f32 = row_heights[gc.grid_row..=last].iter().sum::<f32>()
            + spacing.height * (last - gc.grid_row) as f32
            - overlap_sum(&row_ov, gc.grid_row, last);
        if h > spanned {
            row_heights[last] += h - spanned;
        }
    }
    for (i, &(g, r)) in grid.rows.iter().enumerate() {
        if bx.children[g].children[r].style.visibility == Visibility::Collapse {
            row_heights[i] = 0.0;
        }
    }

    // ---- place: rows, groups, cells ----------------------------------------
    let mut row_y = Vec::with_capacity(n_rows);
    let mut y = top + spacing.height;
    for (i, h) in row_heights.iter().enumerate() {
        row_y.push(y);
        y += h + spacing.height - row_ov.get(i).copied().unwrap_or(0.0);
    }
    let bottom = y;
    for (i, gc) in grid.cells.iter().enumerate() {
        let w = cell_width(gc);
        let last = (gc.grid_row + gc.row_span - 1).min(n_rows - 1);
        let h: f32 = row_heights[gc.grid_row..=last].iter().sum::<f32>()
            + spacing.height * (last - gc.grid_row) as f32
            - overlap_sum(&row_ov, gc.grid_row, last);
        let cell = cell_mut(bx, gc);
        let valign = cell.style.vertical_align;
        layout_box_at(
            cell,
            ctx,
            ContainingBlock {
                width: w,
                height: Some(h),
            },
            Point::new(col_x[gc.col], row_y[gc.grid_row]),
            Forced {
                width: Some(w),
                height: Some(h),
            },
        );
        // Vertical alignment of the cell content inside the forced height.
        let free = cell.content.height() - natural[i];
        let shift = match valign {
            VerticalAlign::Middle => free / 2.0,
            VerticalAlign::Bottom | VerticalAlign::TextBottom => free,
            _ => 0.0,
        };
        if shift > 0.01 {
            let rect = cell.rect;
            let content = cell.content;
            for child in &mut cell.children {
                translate_subtree(child, 0.0, shift);
            }
            for line in &mut cell.lines {
                line.rect = line.rect.translate(0.0, shift);
                for f in &mut line.fragments {
                    f.rect = f.rect.translate(0.0, shift);
                }
            }
            cell.rect = rect;
            cell.content = content;
        }
    }
    for (grid_row, &(g, r)) in grid.rows.iter().enumerate() {
        let row = &mut bx.children[g].children[r];
        row.rect = Rect::new(
            content_x,
            row_y[grid_row],
            content_width,
            row_heights[grid_row],
        );
        row.content = row.rect;
        row.cb_width = content_width;
        for child in row.children.iter_mut().filter(|c| c.is_out_of_flow()) {
            child.rect = Rect::new(content_x, row_y[grid_row], 0.0, 0.0);
        }
    }
    for (g, first_row) in
        grid.rows
            .iter()
            .enumerate()
            .fold(Vec::<(usize, usize)>::new(), |mut acc, (i, &(g, _))| {
                if acc.last().is_none_or(|(lg, _)| *lg != g) {
                    acc.push((g, i));
                }
                acc
            })
    {
        let last_row = grid
            .rows
            .iter()
            .rposition(|&(gg, _)| gg == g)
            .unwrap_or(first_row);
        let group = &mut bx.children[g];
        let y0 = row_y[first_row];
        let y1 = row_y[last_row] + row_heights[last_row];
        group.rect = Rect::new(content_x, y0, content_width, y1 - y0);
        group.content = group.rect;
        group.cb_width = content_width;
        for child in group.children.iter_mut().filter(|c| c.is_out_of_flow()) {
            child.rect = Rect::new(content_x, y0, 0.0, 0.0);
        }
    }
    // Row groups without rows still need a rect.
    for group in bx
        .children
        .iter_mut()
        .filter(|c| c.kind == BoxKind::TableRowGroup && c.rect == Rect::ZERO)
    {
        group.rect = Rect::new(content_x, top, content_width, 0.0);
        group.content = group.rect;
    }
    bottom
}
