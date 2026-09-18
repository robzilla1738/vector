//! Layout for the Vector Engine.
//!
//! Turns a document plus its [`StyleTree`] into a tree of positioned boxes:
//!
//! 1. [`box_tree`] builds [`LayoutBox`]es from the DOM (skipping `display:
//!    none`, flattening `display: contents`, wrapping mixed inline/block
//!    content in anonymous boxes, performing the CSS 2.1 table fix-up,
//!    generating `::before` / `::after` boxes and list-item markers,
//!    collapsing whitespace).
//! 2. [`block`] runs block formatting (vertical stacking, widths from the
//!    containing block, sibling margin collapsing, min/max clamping, float
//!    placement through [`floats`] and `clear`) and delegates to [`inline`]
//!    for inline formatting contexts (line boxes shortened by floats, greedy
//!    wrapping through a [`TextShaper`], inline-blocks), to [`flex`] for flex
//!    and grid containers (computed by `taffy`, measured by our own block
//!    layout) and to [`table`] for tables (automatic layout with
//!    `colspan` / `rowspan` geometry).
//! 3. Positioned boxes are placed against their containing block; `transform:
//!    translate/scale` is applied; `overflow` / `clip-path: inset()` clip
//!    rectangles are propagated to every fragment.
//! 4. [`stacking`] derives paint order (stacking contexts, `z-index`) and
//!    performs hit testing.
//!
//! # Contract
//!
//! * All geometry is in CSS pixels relative to the viewport origin; scroll
//!   offsets are applied by the caller.
//! * [`LayoutTree::rect_of`] returns the border box of a node's first
//!   fragment; inline elements split across lines get the union of fragments.
//!   [`LayoutTree::clip_of`] returns the clip rectangle ancestors impose on a
//!   node and [`LayoutTree::visible_rect_of`] the intersection of the two.
//! * Text is measured through the [`TextShaper`] trait. [`ParleyShaper`]
//!   shapes real glyphs when fonts are registered; [`MetricShaper`] is a
//!   deterministic, documented average-advance model used when no font data
//!   is available (headless servers, unit tests, CI conformance runs).
//! * [`LayoutEngine::relayout_incremental`] re-lays out only the subtrees
//!   under the nearest **layout boundaries** of the dirty nodes (architecture
//!   §4) and appends `Geometry` journal records for nodes whose document-space
//!   rectangle changed.
//! * Sticky positioning (`position: sticky`) is applied by
//!   [`LayoutTree::apply_sticky`] against the current scroll offset.

#![forbid(unsafe_code)]

pub mod block;
pub mod box_tree;
pub mod flex;
pub mod floats;
pub mod inline;
pub mod stacking;
pub mod table;
pub mod text;

use std::collections::{HashMap, HashSet};
use std::rc::Rc;

use ve_core::{Edges, NodeId, Point, Rect, Revision, Size, Stage};
use ve_dom::{DirtyFlags, Document, Node};
use ve_style::{ClipPath, ComputedStyle, LengthPercentageAuto, StyleTree, TransformOp};

pub use box_tree::{BoxKind, Fragment, LayoutBox, LineBox, Marker, build_box_tree};
pub use floats::FloatContext;
pub use stacking::{PaintItem, StackingContext};
pub use text::{CharClass, MetricShaper, ParleyShaper, ShapedLine, TextShaper};

/// Uniform grid over paint items so observe occlusion is O(k) not O(n).
#[derive(Clone, Debug, Default)]
struct HitIndex {
    cell: f32,
    cells: HashMap<(i32, i32), Vec<usize>>,
}

impl HitIndex {
    const CELL: f32 = 64.0;

    fn build(paint: &[PaintItem]) -> Self {
        let mut cells: HashMap<(i32, i32), Vec<usize>> = HashMap::new();
        for (i, item) in paint.iter().enumerate() {
            if !item.hit_testable {
                continue;
            }
            let r = item.rect;
            let x0 = (r.x() / Self::CELL).floor() as i32;
            let y0 = (r.y() / Self::CELL).floor() as i32;
            let x1 = (r.right() / Self::CELL).floor() as i32;
            let y1 = (r.bottom() / Self::CELL).floor() as i32;
            for y in y0..=y1 {
                for x in x0..=x1 {
                    cells.entry((x, y)).or_default().push(i);
                }
            }
        }
        Self {
            cell: Self::CELL,
            cells,
        }
    }

    fn query(&self, point: Point, paint: &[PaintItem]) -> Option<NodeId> {
        if self.cells.is_empty() {
            return paint
                .iter()
                .rev()
                .find(|item| item.hit_testable && item.rect.contains(point))
                .and_then(|i| i.element);
        }
        let cx = (point.x / self.cell).floor() as i32;
        let cy = (point.y / self.cell).floor() as i32;
        let idxs = self.cells.get(&(cx, cy))?;
        idxs.iter()
            .rev()
            .copied()
            .find(|&i| paint[i].hit_testable && paint[i].rect.contains(point))
            .and_then(|i| paint[i].element)
    }
}

/// Flags a relayout clears on the nodes it visits.
fn layout_flags() -> DirtyFlags {
    DirtyFlags::LAYOUT | DirtyFlags::TEXT | DirtyFlags::LAYOUT_CHILDREN
}

/// The result of laying out a document.
#[derive(Debug)]
pub struct LayoutTree {
    /// The root box (for the document element), with all descendants.
    pub root: LayoutBox,
    /// Viewport used for the layout.
    pub viewport: Size,
    /// Stacking context tree derived from the boxes.
    pub stacking: StackingContext,
    geometry: HashMap<NodeId, Rect>,
    clips: HashMap<NodeId, Rect>,
    /// `stacking` flattened once; hit testing and painting read this.
    paint: Vec<PaintItem>,
    /// Spatial index over `paint` (64 CSS-px cells) for observe occlusion.
    hit_index: HitIndex,
    revision: Revision,
    boxes_laid_out: usize,
}

impl LayoutTree {
    /// An empty tree used as a stand-in when taking ownership of a previous
    /// layout for [`LayoutEngine::relayout_incremental`].
    #[must_use]
    pub fn blank(viewport: Size) -> Self {
        Self {
            root: LayoutBox::new(None, BoxKind::Block, Rc::new(ComputedStyle::initial())),
            viewport,
            stacking: StackingContext::default(),
            geometry: HashMap::new(),
            clips: HashMap::new(),
            paint: Vec::new(),
            hit_index: HitIndex::default(),
            revision: Revision(0),
            boxes_laid_out: 0,
        }
    }

    /// Border-box rectangle of `node` (first fragment; union for inlines).
    #[must_use]
    pub fn rect_of(&self, node: NodeId) -> Option<Rect> {
        self.geometry.get(&node).copied()
    }

    /// The clip rectangle imposed on `node` by `overflow` / `clip-path`
    /// ancestors, in document coordinates (`None` = unclipped).
    #[must_use]
    pub fn clip_of(&self, node: NodeId) -> Option<Rect> {
        self.clips.get(&node).copied()
    }

    /// The part of `node`'s border box that is not clipped away (`None` if
    /// the node has no box or is entirely clipped).
    #[must_use]
    pub fn visible_rect_of(&self, node: NodeId) -> Option<Rect> {
        let rect = self.rect_of(node)?;
        match self.clip_of(node) {
            None => Some(rect),
            Some(clip) => rect.intersection(&clip),
        }
    }

    /// All node rectangles.
    #[must_use]
    pub fn geometry(&self) -> &HashMap<NodeId, Rect> {
        &self.geometry
    }

    /// Height of the laid-out content (the scrollable height of the page).
    #[must_use]
    pub fn content_height(&self) -> f32 {
        self.root.rect.bottom().max(self.root.overflow_bottom())
    }

    /// The document revision this layout corresponds to.
    #[must_use]
    pub fn revision(&self) -> Revision {
        self.revision
    }

    /// Number of boxes the pass that produced this tree laid out (a full
    /// layout counts every box; an incremental one only the dirty subtrees).
    #[must_use]
    pub fn boxes_laid_out(&self) -> usize {
        self.boxes_laid_out
    }

    /// The topmost hit-testable element at `point`, in paint order.
    ///
    /// Reads the cached paint order; the observation builder calls this once
    /// per candidate element, so it must not re-flatten the stacking tree.
    #[must_use]
    pub fn hit_test(&self, point: Point) -> Option<NodeId> {
        self.hit_index.query(point, &self.paint)
    }

    /// Boxes in paint order (back to front).
    #[must_use]
    pub fn paint_order(&self) -> &[PaintItem] {
        &self.paint
    }

    /// Every fragment (text runs, atomic inlines, markers) in the tree.
    pub fn fragments(&self) -> impl Iterator<Item = &Fragment> {
        self.root.iter().flat_map(|bx| {
            bx.lines
                .iter()
                .flat_map(|l| l.fragments.iter())
                .chain(bx.marker_fragment.iter())
        })
    }

    /// Nodes whose rectangle differs between `self` and `previous` (added,
    /// removed or moved/resized).
    #[must_use]
    pub fn geometry_diff(&self, previous: &LayoutTree) -> Vec<NodeId> {
        let mut changed: Vec<NodeId> = self
            .geometry
            .iter()
            .filter(|(id, rect)| previous.geometry.get(*id) != Some(*rect))
            .map(|(id, _)| *id)
            .collect();
        changed.extend(
            previous
                .geometry
                .keys()
                .filter(|id| !self.geometry.contains_key(*id))
                .copied(),
        );
        changed.sort_unstable_by_key(|id| (id.index(), id.generation()));
        changed
    }

    fn rebuild_indexes(&mut self) {
        self.geometry.clear();
        self.clips.clear();
        collect_geometry(&self.root, &mut self.geometry, &mut self.clips);
        self.stacking = StackingContext::build(&self.root);
        self.paint = self.stacking.paint_order();
        self.hit_index = HitIndex::build(&self.paint);
    }

    /// Applies `position: sticky` against `scroll` (VEC-012).
    pub fn apply_sticky(&mut self, scroll: Point) {
        apply_sticky_box(&mut self.root, scroll, self.viewport, None);
        self.rebuild_indexes();
    }
}

/// Statistics of an incremental relayout.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct RelayoutStats {
    /// Boxes laid out by this pass.
    pub boxes_laid_out: usize,
    /// Layout boundaries re-laid out (0 when nothing was dirty).
    pub boundaries: usize,
    /// The pass fell back to a full layout.
    pub full: bool,
    /// Nodes whose document-space rectangle changed (each got a `Geometry`
    /// journal record).
    pub geometry_changed: usize,
}

/// Runs layout. Owns the text shaper so font caches persist across layouts.
pub struct LayoutEngine {
    shaper: Box<dyn TextShaper>,
}

impl Default for LayoutEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl LayoutEngine {
    /// Creates an engine with the deterministic [`MetricShaper`].
    #[must_use]
    pub fn new() -> Self {
        Self {
            shaper: Box::new(MetricShaper::default()),
        }
    }

    /// Creates an engine with a custom shaper (e.g. [`ParleyShaper`] with fonts).
    #[must_use]
    pub fn with_shaper(shaper: Box<dyn TextShaper>) -> Self {
        Self { shaper }
    }

    /// Registers a `@font-face` file on the current shaper.
    pub fn register_font(&mut self, data: Vec<u8>) -> usize {
        self.shaper.register_font(data)
    }

    /// Lays out `doc` into `viewport`.
    pub fn layout(&mut self, doc: &Document, styles: &StyleTree, viewport: Size) -> LayoutTree {
        let span = Stage::Layout.span();
        let _guard = span.enter();

        let mut root = build_box_tree(doc, styles);
        let mut ctx = block::LayoutCtx::new(self.shaper.as_mut(), viewport);
        block::layout_root(&mut root, &mut ctx);
        let boxes_laid_out = ctx.laid_out;
        finish_subtree(&mut root, None);

        let mut tree = LayoutTree {
            root,
            viewport,
            stacking: StackingContext::default(),
            geometry: HashMap::new(),
            clips: HashMap::new(),
            paint: Vec::new(),
            hit_index: HitIndex::default(),
            revision: styles.revision(),
            boxes_laid_out,
        };
        tree.rebuild_indexes();
        tracing::debug!(
            boxes = tree.geometry.len(),
            height = tree.root.rect.height(),
            "layout complete"
        );
        tree
    }

    /// Full layout that also appends a `Geometry` journal record for every
    /// node whose rectangle differs from `previous`.
    pub fn layout_recording(
        &mut self,
        doc: &mut Document,
        styles: &StyleTree,
        viewport: Size,
        previous: Option<&LayoutTree>,
    ) -> (LayoutTree, usize) {
        let mut tree = self.layout(doc, styles, viewport);
        let changed = match previous {
            Some(prev) => record_geometry(doc, &tree, prev),
            None => 0,
        };
        clear_layout_flags(doc, doc.root());
        tree.revision = doc.revision();
        (tree, changed)
    }

    /// Re-lays out only the subtrees that need it.
    ///
    /// Every node carrying `LAYOUT` / `TEXT` is traced up to its nearest
    /// **layout boundary**: an element with a definite `width` and `height`,
    /// `overflow` other than `visible`, that is neither inline nor a table
    /// part, has a box in `previous`, and (unless it is itself positioned)
    /// contains no out-of-flow descendants. `LAYOUT_CHILDREN` is set on the
    /// path. Each boundary's subtree is rebuilt from the DOM and laid out in
    /// place with its previous border box forced, so nothing outside it can
    /// move. Falls back to a full layout when a dirty node has no boundary
    /// (or the viewport changed). Nodes whose rectangle changed get a
    /// `Geometry` journal record; all layout flags visited are cleared.
    pub fn relayout_incremental(
        &mut self,
        doc: &mut Document,
        styles: &StyleTree,
        viewport: Size,
        previous: LayoutTree,
    ) -> (LayoutTree, RelayoutStats) {
        let span = Stage::Layout.span();
        let _guard = span.enter();
        let mut stats = RelayoutStats::default();

        let dirty: Vec<NodeId> = std::iter::once(doc.root())
            .chain(doc.descendants(doc.root()))
            .filter(|&id| {
                doc.dirty(id)
                    .intersects(DirtyFlags::LAYOUT | DirtyFlags::TEXT)
            })
            .collect();
        if dirty.is_empty() && previous.viewport == viewport {
            let mut tree = previous;
            tree.boxes_laid_out = 0;
            tree.revision = doc.revision();
            return (tree, stats);
        }

        let mut boundaries: Vec<NodeId> = Vec::new();
        let mut full = previous.viewport != viewport;
        if !full {
            for &node in &dirty {
                match find_boundary(doc, styles, &previous, node) {
                    Some(boundary) => {
                        let path: Vec<NodeId> = doc.ancestors(node).collect();
                        for ancestor in path {
                            doc.mark_dirty(ancestor, DirtyFlags::LAYOUT_CHILDREN);
                            if ancestor == boundary {
                                break;
                            }
                        }
                        if !boundaries.contains(&boundary) {
                            boundaries.push(boundary);
                        }
                    }
                    None => {
                        full = true;
                        break;
                    }
                }
            }
        }
        if !full {
            // Drop boundaries nested inside other boundaries.
            let set: HashSet<NodeId> = boundaries.iter().copied().collect();
            boundaries.retain(|b| !doc.ancestors(*b).any(|a| set.contains(&a)));
        }

        if full {
            let (tree, changed) = self.layout_recording(doc, styles, viewport, Some(&previous));
            stats.full = true;
            stats.boxes_laid_out = tree.boxes_laid_out;
            stats.geometry_changed = changed;
            return (tree, stats);
        }

        // Rebuild each boundary's box subtree from the DOM. A boundary that
        // lost its box (`display: none`) means its parent must relayout.
        let mut fresh_boxes: Vec<(NodeId, LayoutBox)> = Vec::with_capacity(boundaries.len());
        for &boundary in &boundaries {
            match box_tree::build_element_box(doc, styles, boundary) {
                Some(bx) => fresh_boxes.push((boundary, bx)),
                None => {
                    let (tree, changed) =
                        self.layout_recording(doc, styles, viewport, Some(&previous));
                    stats.full = true;
                    stats.boxes_laid_out = tree.boxes_laid_out;
                    stats.geometry_changed = changed;
                    return (tree, stats);
                }
            }
        }

        let mut tree = previous;
        let viewport_rect = Rect::new(0.0, 0.0, viewport.width, viewport.height);
        let mut ctx = block::LayoutCtx::new(self.shaper.as_mut(), viewport);
        for (boundary, mut fresh) in fresh_boxes {
            let Some(old) = tree.root.find(boundary) else {
                continue;
            };
            let (old_rect, cb_width, inherited_clip) = (old.rect, old.cb_width, old.clip);
            let margins = block::resolve_margins(&fresh.style, cb_width);
            let origin = Point::new(old_rect.x() - margins.left, old_rect.y() - margins.top);
            block::layout_box_at(
                &mut fresh,
                &mut ctx,
                block::ContainingBlock {
                    width: cb_width,
                    height: None,
                },
                origin,
                block::Forced {
                    width: Some(old_rect.width()),
                    height: Some(old_rect.height()),
                },
            );
            let abs_cb = if fresh.style.position.is_positioned() {
                fresh.rect.inset(block::border_edges(&fresh.style))
            } else {
                viewport_rect
            };
            block::layout_positioned(&mut fresh, &mut ctx, abs_cb, viewport_rect);
            finish_subtree(&mut fresh, inherited_clip);
            if let Some(slot) = tree.root.find_mut(boundary) {
                *slot = fresh;
            }
            clear_layout_flags(doc, boundary);
            stats.boundaries += 1;
        }
        stats.boxes_laid_out = ctx.laid_out;
        drop(ctx);

        let old_geometry = std::mem::take(&mut tree.geometry);
        tree.rebuild_indexes();
        let mut changed = 0;
        let mut ids: Vec<NodeId> = tree
            .geometry
            .iter()
            .filter(|(id, rect)| old_geometry.get(*id) != Some(*rect))
            .map(|(id, _)| *id)
            .collect();
        ids.extend(
            old_geometry
                .keys()
                .filter(|id| !tree.geometry.contains_key(*id))
                .copied(),
        );
        for id in ids {
            doc.record_geometry_change(id);
            changed += 1;
        }
        stats.geometry_changed = changed;
        tree.boxes_laid_out = stats.boxes_laid_out;
        tree.revision = doc.revision();
        tracing::debug!(
            boundaries = stats.boundaries,
            boxes = stats.boxes_laid_out,
            changed,
            "incremental relayout"
        );
        (tree, stats)
    }
}

/// Returns `true` if `style` makes an element a layout boundary on its own
/// (architecture §4): definite width and height, clipping overflow, neither
/// inline nor a table part.
#[must_use]
pub fn is_boundary_style(style: &ComputedStyle) -> bool {
    matches!(style.width, LengthPercentageAuto::Px(_))
        && matches!(style.height, LengthPercentageAuto::Px(_))
        && (style.overflow.clips() || style.overflow_y.clips())
        && !style.display.is_inline_level()
        && !style.display.is_table_internal()
        && style.display != ve_style::Display::Contents
        && style.is_displayed()
}

/// The nearest layout boundary strictly above `node` that has a box in
/// `previous` and can be re-laid out in isolation. (The dirty element itself
/// is never its own boundary: its size may be what changed.)
fn find_boundary(
    doc: &Document,
    styles: &StyleTree,
    previous: &LayoutTree,
    node: NodeId,
) -> Option<NodeId> {
    let start = if doc.get(node).is_some_and(Node::is_element) {
        node
    } else {
        doc.parent(node)?
    };
    let root_element = doc.document_element()?;
    for candidate in doc.ancestors(start) {
        if candidate == root_element {
            return None;
        }
        let Some(style) = styles.get(candidate) else {
            continue;
        };
        if !is_boundary_style(style) || previous.root.find(candidate).is_none() {
            continue;
        }
        if style.float != ve_style::Float::None {
            continue;
        }
        let contains_out_of_flow = doc
            .descendants(candidate)
            .any(|d| styles.get(d).is_some_and(|s| s.position.is_out_of_flow()));
        if contains_out_of_flow && !style.position.is_positioned() {
            continue;
        }
        return Some(candidate);
    }
    None
}

fn clear_layout_flags(doc: &mut Document, root: NodeId) {
    let ids: Vec<NodeId> = std::iter::once(root).chain(doc.descendants(root)).collect();
    for id in ids {
        doc.clear_dirty(id, layout_flags());
    }
    let ancestors: Vec<NodeId> = doc.ancestors(root).collect();
    for id in ancestors {
        doc.clear_dirty(id, DirtyFlags::LAYOUT_CHILDREN);
    }
}

/// Appends `Geometry` journal records for nodes whose rect changed.
fn record_geometry(doc: &mut Document, tree: &LayoutTree, previous: &LayoutTree) -> usize {
    let changed = tree.geometry_diff(previous);
    let count = changed.len();
    for id in changed {
        doc.record_geometry_change(id);
    }
    count
}

/// Post-layout passes over a laid-out subtree: `transform`, then clip
/// propagation.
fn finish_subtree(bx: &mut LayoutBox, inherited_clip: Option<Rect>) {
    apply_transforms(bx);
    propagate_clips(bx, inherited_clip);
}

/// Applies `transform: translate() / scale()` to boxes (geometry only).
fn apply_transforms(bx: &mut LayoutBox) {
    if bx.has_own_edges() && !bx.style.transform.is_empty() {
        let rect = bx.rect;
        let center = rect.center();
        for op in bx.style.transform.clone() {
            match op {
                TransformOp::Translate(x, y) => {
                    block::translate_subtree(bx, x.resolve(rect.width()), y.resolve(rect.height()));
                }
                TransformOp::Scale(sx, sy) => scale_subtree(bx, center, sx, sy),
            }
        }
    }
    for child in &mut bx.children {
        apply_transforms(child);
    }
}

fn scale_rect(r: Rect, center: Point, sx: f32, sy: f32) -> Rect {
    let x = center.x + (r.x() - center.x) * sx;
    let y = center.y + (r.y() - center.y) * sy;
    let right = center.x + (r.right() - center.x) * sx;
    let bottom = center.y + (r.bottom() - center.y) * sy;
    Rect::from_points(Point::new(x, y), Point::new(right, bottom))
}

fn scale_subtree(bx: &mut LayoutBox, center: Point, sx: f32, sy: f32) {
    bx.rect = scale_rect(bx.rect, center, sx, sy);
    bx.content = scale_rect(bx.content, center, sx, sy);
    for line in &mut bx.lines {
        line.rect = scale_rect(line.rect, center, sx, sy);
        for f in &mut line.fragments {
            f.rect = scale_rect(f.rect, center, sx, sy);
        }
    }
    if let Some(m) = &mut bx.marker_fragment {
        m.rect = scale_rect(m.rect, center, sx, sy);
    }
    for child in &mut bx.children {
        scale_subtree(child, center, sx, sy);
    }
}

/// The clip rectangle `bx` imposes on its descendants, if any.
fn own_clip(bx: &LayoutBox) -> Option<Rect> {
    if !bx.has_own_edges() {
        return None;
    }
    let style = &bx.style;
    let mut clip: Option<Rect> = None;
    if style.overflow.clips() || style.overflow_y.clips() {
        // The padding box clips; an axis left `visible` while the other clips
        // computes to `auto`, so both axes clip.
        let padding_box = bx.rect.inset(block::border_edges(style));
        clip = Some(padding_box);
    }
    if let ClipPath::Inset {
        top,
        right,
        bottom,
        left,
    } = style.clip_path
    {
        let inset = bx.rect.inset(Edges::new(
            top.resolve(bx.rect.height()),
            right.resolve(bx.rect.width()),
            bottom.resolve(bx.rect.height()),
            left.resolve(bx.rect.width()),
        ));
        clip = Some(match clip {
            Some(c) => c
                .intersection(&inset)
                .unwrap_or(Rect::new(inset.x(), inset.y(), 0.0, 0.0)),
            None => inset,
        });
    }
    clip
}

fn intersect(a: Option<Rect>, b: Option<Rect>) -> Option<Rect> {
    match (a, b) {
        (None, x) | (x, None) => x,
        (Some(a), Some(b)) => Some(a.intersection(&b).unwrap_or(Rect::new(
            a.x().max(b.x()),
            a.y().max(b.y()),
            0.0,
            0.0,
        ))),
    }
}

/// Stores the inherited clip on `bx` and its fragments, then recurses with
/// the clip narrowed by `bx`'s own `overflow` / `clip-path`. `clip-path`
/// also clips the box itself.
fn propagate_clips(bx: &mut LayoutBox, inherited: Option<Rect>) {
    let self_clip = if matches!(bx.style.clip_path, ClipPath::Inset { .. }) && bx.has_own_edges() {
        intersect(inherited, own_clip(bx))
    } else {
        inherited
    };
    bx.clip = self_clip;
    let child_clip = intersect(inherited, own_clip(bx));
    for line in &mut bx.lines {
        for f in &mut line.fragments {
            f.clip = child_clip;
        }
    }
    if let Some(m) = &mut bx.marker_fragment {
        m.clip = child_clip;
    }
    for child in &mut bx.children {
        // Fixed-position boxes escape every clip but the viewport's.
        let clip = if child.style.position == ve_style::Position::Fixed && child.node.is_some() {
            None
        } else {
            child_clip
        };
        propagate_clips(child, clip);
    }
}

fn collect_geometry(
    bx: &LayoutBox,
    out: &mut HashMap<NodeId, Rect>,
    clips: &mut HashMap<NodeId, Rect>,
) {
    if let Some(node) = bx.node {
        out.entry(node)
            .and_modify(|r| *r = r.union(&bx.rect))
            .or_insert(bx.rect);
        if let Some(clip) = bx.clip {
            clips.entry(node).or_insert(clip);
        }
    }
    for line in &bx.lines {
        // Atomic-inline placeholders carry the margin box; the element's own
        // box supplies its geometry, so only text fragments contribute here.
        for fragment in line.fragments.iter().filter(|f| f.text.is_some()) {
            if let Some(node) = fragment.node {
                out.entry(node)
                    .and_modify(|r| *r = r.union(&fragment.rect))
                    .or_insert(fragment.rect);
                if let Some(clip) = fragment.clip {
                    clips.entry(node).or_insert(clip);
                }
            }
        }
    }
    for child in &bx.children {
        collect_geometry(child, out, clips);
    }
}

fn apply_sticky_box(bx: &mut LayoutBox, scroll: Point, viewport: Size, containing: Option<Rect>) {
    let cb = containing.unwrap_or(Rect::new(0.0, 0.0, viewport.width, viewport.height));
    if bx.style.position == ve_style::Position::Sticky {
        let view = Rect::new(scroll.x, scroll.y, viewport.width, viewport.height);
        let mut dx = 0.0_f32;
        let mut dy = 0.0_f32;
        if let Some(top) = bx.style.top.maybe_resolve(Some(viewport.height)) {
            let limit = view.y() + top;
            if bx.rect.y() < limit {
                let room = (cb.bottom() - bx.rect.height() - bx.rect.y()).max(0.0);
                dy = (limit - bx.rect.y()).min(room);
            }
        }
        if let Some(left) = bx.style.left.resolve(viewport.width) {
            let limit = view.x() + left;
            if bx.rect.x() < limit {
                let room = (cb.right() - bx.rect.width() - bx.rect.x()).max(0.0);
                dx = (limit - bx.rect.x()).min(room);
            }
        }
        if dx != 0.0 || dy != 0.0 {
            crate::block::translate_subtree(bx, dx, dy);
        }
    }
    let next_cb = if bx.has_own_edges() {
        Some(bx.rect)
    } else {
        containing
    };
    for child in &mut bx.children {
        apply_sticky_box(child, scroll, viewport, next_cb);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ve_style::StyleEngine;

    fn layout(html: &str, width: f32) -> (Document, StyleEngine, LayoutTree) {
        let doc = ve_html::parse_document(html).document;
        let mut engine = StyleEngine::new();
        engine.media = ve_style::MediaEnv::screen(width, 600.0);
        engine.add_document_styles(&doc);
        let styles = engine.compute(&doc);
        let tree = LayoutEngine::new().layout(&doc, &styles, Size::new(width, 600.0));
        (doc, engine, tree)
    }

    fn rect(tree: &LayoutTree, engine: &StyleEngine, doc: &Document, sel: &str) -> Rect {
        tree.rect_of(engine.select_one(doc, sel).unwrap()).unwrap()
    }

    #[test]
    fn replaced_elements_take_intrinsic_attribute_and_natural_sizes() {
        // attributes → size; one attribute + natural ratio → scaled; iframe
        // default 300×150; CSS width with auto height keeps the ratio
        let html = "<style>body{margin:0} img,iframe{display:block} #css{width:100px}</style>\
             <img id=attrs width=40 height=20>\
             <img id=nat>\
             <img id=half width=50>\
             <iframe id=frame></iframe>\
             <img id=css>\
             <img id=none>";
        let mut doc = ve_html::parse_document(html).document;
        let mut engine = StyleEngine::new();
        engine.media = ve_style::MediaEnv::screen(400.0, 600.0);
        engine.add_document_styles(&doc);
        for sel in ["#nat", "#half", "#css"] {
            let id = engine.select_one(&doc, sel).unwrap();
            doc.set_natural_size(id, 200, 100).unwrap();
        }
        let styles = engine.compute(&doc);
        let tree = LayoutEngine::new().layout(&doc, &styles, Size::new(400.0, 600.0));
        let r = |sel: &str| rect(&tree, &engine, &doc, sel);
        assert_eq!(r("#attrs").size, Size::new(40.0, 20.0));
        assert_eq!(r("#nat").size, Size::new(200.0, 100.0));
        assert_eq!(r("#half").size, Size::new(50.0, 25.0));
        assert_eq!(
            r("#frame").size,
            Size::new(304.0, 154.0),
            "300×150 content plus the UA 2px border"
        );
        assert_eq!(r("#css").size, Size::new(100.0, 50.0));
        assert_eq!(r("#none").size, Size::new(0.0, 0.0));
    }

    #[test]
    fn blocks_stack_vertically_with_margins_and_padding() {
        let (doc, engine, tree) = layout(
            "<style>body{margin:0} div{height:50px} #b{margin-top:10px;padding:5px;width:50%}</style>\
             <div id=a></div><div id=b></div>",
            400.0,
        );
        assert_eq!(
            rect(&tree, &engine, &doc, "#a"),
            Rect::new(0.0, 0.0, 400.0, 50.0)
        );
        assert_eq!(
            rect(&tree, &engine, &doc, "#b"),
            Rect::new(0.0, 60.0, 210.0, 60.0),
            "50% + padding, 10px margin"
        );
        assert_eq!(tree.rect_of(doc.body().unwrap()).unwrap().height(), 120.0);
        assert_eq!(tree.content_height(), 120.0);
    }

    #[test]
    fn inline_text_wraps_into_lines() {
        // MetricShaper: 16px font, lowercase 0.5em -> 8px per char; 100px fits 12 chars.
        let (doc, engine, tree) = layout(
            "<style>body{margin:0;font-size:16px;line-height:20px} p{margin:0;width:100px}</style>\
             <p>aaaa bbbb cccc dddd</p>",
            400.0,
        );
        let p = engine.select_one(&doc, "p").unwrap();
        assert_eq!(tree.rect_of(p).unwrap().height(), 40.0, "two lines of 20px");
        let text = doc.first_child(p).unwrap();
        let text_rect = tree.rect_of(text).unwrap();
        assert!(text_rect.width() <= 100.0);
        assert_eq!(text_rect.height(), 40.0);
    }

    #[test]
    fn flex_row_distributes_width_and_hit_testing_finds_items() {
        let (doc, engine, tree) = layout(
            "<style>body{margin:0} .row{display:flex;width:300px} .item{flex:1;height:30px} #big{flex:2}</style>\
             <div class=row><div class=item id=a></div><div class=item id=big></div></div>",
            400.0,
        );
        assert_eq!(
            rect(&tree, &engine, &doc, "#a"),
            Rect::new(0.0, 0.0, 100.0, 30.0)
        );
        assert_eq!(
            rect(&tree, &engine, &doc, "#big"),
            Rect::new(100.0, 0.0, 200.0, 30.0)
        );
        assert_eq!(
            tree.hit_test(Point::new(150.0, 10.0)),
            engine.select_one(&doc, "#big").ok()
        );
        assert_eq!(
            tree.hit_test(Point::new(350.0, 10.0)),
            Some(doc.body().unwrap()),
            "outside the row"
        );
        assert_eq!(
            tree.hit_test(Point::new(150.0, 10.0)),
            tree.paint_order()
                .iter()
                .rev()
                .find(|item| item.hit_testable && item.rect.contains(Point::new(150.0, 10.0)))
                .and_then(|i| i.element),
            "spatial index matches linear paint-order scan"
        );
    }

    #[test]
    fn nested_flex_containers_lay_out_in_linear_time() {
        // Every level is a row flex container holding a fixed item and the
        // next level. Without memoised item layouts each level costs a
        // multiple of the level below (taffy measures plus the final pass),
        // which is exponential in depth and never finishes at this depth.
        const DEPTH: usize = 40;
        let mut html = String::from(
            "<style>body{margin:0} .f{display:flex} .a{flex:0 0 10px;height:10px}</style>",
        );
        for _ in 0..DEPTH {
            html.push_str("<div class=f><div class=a></div>");
        }
        html.push_str("<div class=a id=leaf></div>");
        for _ in 0..DEPTH {
            html.push_str("</div>");
        }
        let (doc, engine, tree) = layout(&html, 800.0);
        assert_eq!(
            rect(&tree, &engine, &doc, "#leaf"),
            Rect::new(10.0 * DEPTH as f32, 0.0, 10.0, 10.0)
        );
        // Roughly 3 boxes per level, each laid out a bounded number of times.
        assert!(
            tree.boxes_laid_out < 40 * DEPTH,
            "boxes laid out: {}",
            tree.boxes_laid_out
        );
    }

    #[test]
    fn grid_placement_and_order_are_honoured() {
        let (doc, engine, tree) = layout(
            "<style>body{margin:0} .g{display:grid;grid-template-columns:100px 100px;grid-template-rows:20px 20px;width:200px}\
             #a{grid-column:2;grid-row:1} #b{order:1} #c{order:-1}</style>\
             <div class=g><div id=a></div><div id=b></div><div id=c></div></div>",
            400.0,
        );
        assert_eq!(
            rect(&tree, &engine, &doc, "#a"),
            Rect::new(100.0, 0.0, 100.0, 20.0)
        );
        // Auto-placed items fill the remaining cells in order-modified order: c then b.
        assert_eq!(
            rect(&tree, &engine, &doc, "#c"),
            Rect::new(0.0, 0.0, 100.0, 20.0)
        );
        assert_eq!(
            rect(&tree, &engine, &doc, "#b"),
            Rect::new(0.0, 20.0, 100.0, 20.0)
        );
    }

    #[test]
    fn positioned_boxes_and_stacking_order() {
        let (doc, engine, tree) = layout(
            "<style>body{margin:0} #rel{position:relative;top:5px;left:5px;height:20px}\
             #abs{position:absolute;top:10px;left:20px;width:50px;height:50px;z-index:5}\
             #under{position:absolute;top:10px;left:20px;width:50px;height:50px;z-index:1}</style>\
             <div id=rel></div><div id=under></div><div id=abs></div>",
            400.0,
        );
        assert_eq!(
            rect(&tree, &engine, &doc, "#rel"),
            Rect::new(5.0, 5.0, 400.0, 20.0)
        );
        assert_eq!(
            rect(&tree, &engine, &doc, "#abs"),
            Rect::new(20.0, 10.0, 50.0, 50.0)
        );
        assert_eq!(
            tree.hit_test(Point::new(30.0, 30.0)),
            engine.select_one(&doc, "#abs").ok()
        );
        let order: Vec<_> = tree.paint_order().iter().filter_map(|i| i.node).collect();
        let pos = |sel: &str| {
            order
                .iter()
                .position(|n| *n == engine.select_one(&doc, sel).unwrap())
                .unwrap()
        };
        assert!(pos("#under") < pos("#abs"));
        assert!(pos("#rel") < pos("#under"), "in-flow before positioned");
    }

    #[test]
    fn floats_shorten_lines_and_clear_moves_below() {
        // 8px per lowercase char, 20px lines. The float takes 100px on the left.
        let (doc, engine, tree) = layout(
            "<style>body{margin:0;font-size:16px;line-height:20px;width:300px}\
             #f{float:left;width:100px;height:60px} #r{float:right;width:50px;height:10px}\
             #c{clear:left;height:10px} #next{height:10px}</style>\
             <div id=f></div><div id=r></div><p id=p style='margin:0'>aaaa bbbb cccc dddd eeee ffff</p>\
             <div id=c></div><div id=next></div>",
            300.0,
        );
        assert_eq!(
            rect(&tree, &engine, &doc, "#f"),
            Rect::new(0.0, 0.0, 100.0, 60.0)
        );
        assert_eq!(
            rect(&tree, &engine, &doc, "#r"),
            Rect::new(250.0, 0.0, 50.0, 10.0)
        );
        let p = engine.select_one(&doc, "p").unwrap();
        let lines = &tree.root.find(p).unwrap().lines;
        assert_eq!(
            lines[0].rect,
            Rect::new(100.0, 0.0, 150.0, 20.0),
            "shortened by both floats"
        );
        assert_eq!(
            lines[1].rect,
            Rect::new(100.0, 20.0, 200.0, 20.0),
            "right float ended"
        );
        assert_eq!(lines[0].fragments[0].rect.x(), 100.0);
        // Two words of 4 chars (32px) + space fit per 150px line? 3 words = 32*3 + 16 = 112 -> yes.
        assert_eq!(
            lines[0].fragments[0].text.as_deref(),
            Some("aaaa bbbb cccc")
        );
        // The p itself is not shortened (block box spans the container).
        assert_eq!(tree.rect_of(p).unwrap().width(), 300.0);
        // The paragraph ends at 40px; clear:left goes below the 60px left float.
        let c = rect(&tree, &engine, &doc, "#c");
        assert_eq!(c.y(), 60.0);
        assert_eq!(rect(&tree, &engine, &doc, "#next").y(), c.bottom());
    }

    #[test]
    fn inline_blocks_sit_on_lines_and_wrap() {
        let (doc, engine, tree) = layout(
            "<style>body{margin:0;font-size:16px;line-height:20px;width:100px}\
             span{display:inline-block;width:40px;height:30px;margin:0 5px}</style>\
             <div><span id=a></span><span id=b></span><span id=c></span></div>",
            100.0,
        );
        assert_eq!(
            rect(&tree, &engine, &doc, "#a"),
            Rect::new(5.0, 0.0, 40.0, 30.0)
        );
        assert_eq!(
            rect(&tree, &engine, &doc, "#b"),
            Rect::new(55.0, 0.0, 40.0, 30.0)
        );
        assert_eq!(
            rect(&tree, &engine, &doc, "#c"),
            Rect::new(5.0, 30.0, 40.0, 30.0),
            "wrapped"
        );
        assert_eq!(rect(&tree, &engine, &doc, "div").height(), 60.0);
    }

    #[test]
    fn tables_size_columns_and_span_cells() {
        let (doc, engine, tree) = layout(
            "<style>body{margin:0} table{border-spacing:0;width:300px} td{padding:0;height:20px}</style>\
             <table><tr><td id=a style='width:100px'>x</td><td id=b>y</td></tr>\
             <tr><td id=c colspan=2>z</td></tr>\
             <tr><td id=d rowspan=2>r</td><td id=e>e</td></tr><tr><td id=f style='height:40px'>f</td></tr></table>",
            400.0,
        );
        assert_eq!(rect(&tree, &engine, &doc, "table").width(), 300.0);
        assert_eq!(
            rect(&tree, &engine, &doc, "#a"),
            Rect::new(0.0, 0.0, 100.0, 20.0)
        );
        assert_eq!(
            rect(&tree, &engine, &doc, "#b"),
            Rect::new(100.0, 0.0, 200.0, 20.0)
        );
        assert_eq!(
            rect(&tree, &engine, &doc, "#c"),
            Rect::new(0.0, 20.0, 300.0, 20.0),
            "colspan"
        );
        assert_eq!(
            rect(&tree, &engine, &doc, "#e"),
            Rect::new(100.0, 40.0, 200.0, 20.0)
        );
        assert_eq!(
            rect(&tree, &engine, &doc, "#f"),
            Rect::new(100.0, 60.0, 200.0, 40.0)
        );
        assert_eq!(
            rect(&tree, &engine, &doc, "#d"),
            Rect::new(0.0, 40.0, 100.0, 60.0),
            "rowspan"
        );
        assert_eq!(rect(&tree, &engine, &doc, "table").height(), 100.0);
        let rows: Vec<Rect> = engine
            .select(&doc, "tr")
            .unwrap()
            .into_iter()
            .map(|r| tree.rect_of(r).unwrap())
            .collect();
        assert_eq!(rows[2], Rect::new(0.0, 40.0, 300.0, 20.0));
    }

    #[test]
    fn generated_content_markers_and_clips() {
        let (doc, engine, tree) = layout(
            "<style>body{margin:0;font-size:16px;line-height:20px}\
             p{margin:0} p::before{content:'ab'} p::after{content:'c'}\
             ul{margin:0;padding-left:40px} li{list-style-type:decimal}\
             #clip{width:100px;height:50px;overflow:hidden} #inner{height:200px;width:300px}\
             #cp{clip-path:inset(10px 20px);height:20px}</style>\
             <p>x</p><ul><li id=li>item</li></ul><div id=clip><div id=inner></div></div><div id=cp></div>",
            400.0,
        );
        let p = engine.select_one(&doc, "p").unwrap();
        let frags: Vec<(Option<ve_style::PseudoElement>, String)> =
            tree.root.find(p).unwrap().lines[0]
                .fragments
                .iter()
                .map(|f| (f.pseudo, f.text.clone().unwrap_or_default()))
                .collect();
        assert_eq!(
            frags,
            vec![
                (Some(ve_style::PseudoElement::Before), "ab".into()),
                (None, "x".into()),
                (Some(ve_style::PseudoElement::After), "c".into()),
            ]
        );
        let li = engine.select_one(&doc, "#li").unwrap();
        let marker = tree.root.find(li).unwrap().marker_fragment.clone().unwrap();
        assert_eq!(marker.text.as_deref(), Some("1. "));
        assert_eq!(marker.pseudo, Some(ve_style::PseudoElement::Marker));
        assert!(
            marker.rect.right() <= 40.0,
            "outside marker ends at the content edge"
        );
        let inner = engine.select_one(&doc, "#inner").unwrap();
        assert_eq!(tree.clip_of(inner), Some(Rect::new(0.0, 40.0, 100.0, 50.0)));
        assert_eq!(
            tree.visible_rect_of(inner),
            Some(Rect::new(0.0, 40.0, 100.0, 50.0))
        );
        let cp = engine.select_one(&doc, "#cp").unwrap();
        assert_eq!(tree.clip_of(cp), Some(Rect::new(20.0, 100.0, 360.0, 0.0)));
    }

    #[test]
    fn incremental_relayout_touches_only_the_dirty_boundary() {
        let html = "<style>body{margin:0} .box{width:100px;height:100px;overflow:hidden} .box div{height:10px}</style>\
             <div id=a class=box><div></div><div></div><div></div></div>\
             <div id=b class=box><div id=t></div><div></div><div></div></div>\
             <div id=c class=box><div></div><div></div><div></div></div>";
        let mut doc = ve_html::parse_document(html).document;
        let mut style_engine = StyleEngine::new();
        style_engine.media = ve_style::MediaEnv::screen(400.0, 600.0);
        style_engine.add_document_styles(&doc);
        let mut styles = style_engine.compute(&doc);
        let mut layout_engine = LayoutEngine::new();
        let viewport = Size::new(400.0, 600.0);
        // The recording variant clears the parser's initial layout flags.
        let (full, _) = layout_engine.layout_recording(&mut doc, &styles, viewport, None);
        let total_boxes = full.boxes_laid_out();
        assert!(total_boxes > 10);
        let b = style_engine.select_one(&doc, "#b").unwrap();
        let t = style_engine.select_one(&doc, "#t").unwrap();
        let c = style_engine.select_one(&doc, "#c").unwrap();

        // Change the height of a child inside #b.
        let since = doc.revision();
        doc.set_attribute(t, "style", "height:30px").unwrap();
        style_engine.restyle_incremental(&mut doc, &mut styles, since);
        assert!(doc.dirty(t).contains(DirtyFlags::LAYOUT));
        let before = doc.revision();
        let (tree, stats) = layout_engine.relayout_incremental(&mut doc, &styles, viewport, full);
        assert!(!stats.full);
        assert_eq!(stats.boundaries, 1);
        let subtree = doc.descendants(b).count() + 1;
        assert!(
            stats.boxes_laid_out <= subtree,
            "O(subtree): laid out {} boxes for a {}-node subtree (document has {})",
            stats.boxes_laid_out,
            subtree,
            total_boxes
        );
        assert!(stats.boxes_laid_out < total_boxes / 2);
        assert_eq!(tree.rect_of(t).unwrap().height(), 30.0);
        assert_eq!(
            tree.rect_of(c).unwrap(),
            Rect::new(0.0, 200.0, 100.0, 100.0),
            "unmoved"
        );
        assert!(!doc.dirty(t).intersects(DirtyFlags::LAYOUT));
        // The sibling below #t moved: a Geometry journal record was appended.
        let sibling = doc.next_sibling(t).unwrap();
        let recorded: Vec<NodeId> = doc
            .journal()
            .entries_since(before)
            .unwrap()
            .filter_map(|e| match &e.mutation {
                ve_dom::Mutation::GeometryChanged { node } => Some(*node),
                _ => None,
            })
            .collect();
        assert!(recorded.contains(&sibling));
        assert!(!recorded.contains(&c));
        assert_eq!(stats.geometry_changed, recorded.len());
        assert!(doc.dirty(sibling).contains(DirtyFlags::A11Y));

        // A clean document does no work.
        let (tree, stats) = layout_engine.relayout_incremental(&mut doc, &styles, viewport, tree);
        assert_eq!(stats.boxes_laid_out, 0);
        assert_eq!(tree.rect_of(t).unwrap().height(), 30.0);

        // A change outside any boundary falls back to a full layout.
        let since = doc.revision();
        doc.set_attribute(c, "style", "height:10px").unwrap();
        style_engine.restyle_incremental(&mut doc, &mut styles, since);
        let (tree, stats) = layout_engine.relayout_incremental(&mut doc, &styles, viewport, tree);
        assert!(stats.full);
        assert_eq!(tree.rect_of(c).unwrap().height(), 10.0);
    }

    #[test]
    fn sticky_holds_top_inside_the_viewport() {
        let html = "<style>body{margin:0} #cb{height:400px} #s{position:sticky;top:10px;height:20px;width:100px}</style>\
                    <div id=cb><div id=s>sticky</div></div>";
        let (doc, engine, mut tree) = layout(html, 200.0);
        let before = rect(&tree, &engine, &doc, "#s");
        tree.apply_sticky(Point::new(0.0, 40.0));
        let after = rect(&tree, &engine, &doc, "#s");
        assert!(
            after.y() >= 50.0 - 0.5,
            "sticky top:10 with scroll 40 should sit at >= 50, got {} (was {})",
            after.y(),
            before.y()
        );
    }

    #[test]
    fn incremental_layout_matches_full_on_a_large_tree() {
        let mut html = String::from("<style>body{margin:0}div{height:8px;width:100px}</style>");
        for i in 0..200 {
            html.push_str(&format!("<div id=n{i}></div>"));
        }
        let mut doc = ve_html::parse_document(&html).document;
        let mut style_engine = StyleEngine::new();
        style_engine.media = ve_style::MediaEnv::screen(200.0, 600.0);
        style_engine.add_document_styles(&doc);
        let mut styles = style_engine.compute(&doc);
        let mut layout_engine = LayoutEngine::new();
        let viewport = Size::new(200.0, 600.0);
        let (full, _) = layout_engine.layout_recording(&mut doc, &styles, viewport, None);
        let n0 = style_engine.select_one(&doc, "#n0").unwrap();
        let since = doc.revision();
        doc.set_attribute(n0, "style", "height:24px").unwrap();
        style_engine.restyle_incremental(&mut doc, &mut styles, since);
        let (incr, stats) = layout_engine.relayout_incremental(&mut doc, &styles, viewport, full);
        let fresh = layout_engine.layout(&doc, &styles, viewport);
        assert_eq!(
            incr.rect_of(n0).unwrap().height(),
            fresh.rect_of(n0).unwrap().height()
        );
        assert_eq!(incr.root.rect.height(), fresh.root.rect.height());
        assert!(
            stats.boxes_laid_out > 0,
            "scaling: incremental must actually layout something"
        );
    }

    #[test]
    fn parent_child_margins_collapse_when_parent_has_no_edges() {
        let (doc, engine, tree) = layout(
            "<style>html,body{margin:0} #outer{margin-top:10px} #inner{margin-top:20px;height:10px}</style>\
             <div id=outer><div id=inner></div></div>",
            400.0,
        );
        let outer = rect(&tree, &engine, &doc, "#outer");
        let inner = rect(&tree, &engine, &doc, "#inner");
        assert!(
            (inner.y() - 20.0).abs() < 0.5,
            "collapsed margin is 20px from the outer margin edge, got inner.y={}",
            inner.y()
        );
        assert!(
            (inner.y() - outer.y()).abs() < 0.5,
            "child top margin must not add space inside the parent (inner {} vs outer {})",
            inner.y(),
            outer.y()
        );
        assert!((inner.height() - 10.0).abs() < 0.5);
    }

    #[test]
    fn collapsed_table_borders_share_an_edge() {
        let (doc, engine, tree) = layout(
            "<style>html,body{margin:0} table{border-collapse:collapse}\
             td{border:1px solid;padding:0;width:40px;height:20px}</style>\
             <table><tr><td id=a></td><td id=b></td></tr>\
             <tr><td id=c></td><td id=d></td></tr></table>",
            400.0,
        );
        let a = rect(&tree, &engine, &doc, "#a");
        let b = rect(&tree, &engine, &doc, "#b");
        let c = rect(&tree, &engine, &doc, "#c");
        let shared_x = a.right() - b.x();
        assert!(
            (shared_x - 1.0).abs() <= 1.0 && shared_x > 0.5,
            "horizontal shared edge should be ~1px, not doubled; got {shared_x} (a.right={} b.x={})",
            a.right(),
            b.x()
        );
        let shared_y = a.bottom() - c.y();
        assert!(
            (shared_y - 1.0).abs() <= 1.0 && shared_y > 0.5,
            "vertical shared edge should be ~1px, not doubled; got {shared_y} (a.bottom={} c.y={})",
            a.bottom(),
            c.y()
        );
    }

    #[test]
    fn vertical_rl_stacks_children_leftward() {
        let (doc, engine, tree) = layout(
            "<style>html,body{margin:0}\
             #outer{writing-mode:vertical-rl;width:200px;height:100px}\
             #a,#b{width:40px;height:50px}</style>\
             <div id=outer><div id=a></div><div id=b></div></div>",
            400.0,
        );
        let a = rect(&tree, &engine, &doc, "#a");
        let b = rect(&tree, &engine, &doc, "#b");
        assert!(
            (a.x() - 160.0).abs() < 1.0,
            "first child sits on the right, got a.x={}",
            a.x()
        );
        assert!(
            (b.x() - 120.0).abs() < 1.0,
            "second child is to the left of the first, got b.x={}",
            b.x()
        );
        assert!(b.x() < a.x(), "vertical-rl stacks leftward");
        assert!((a.y() - b.y()).abs() < 1.0);
    }

    #[test]
    fn rtl_block_places_inline_at_inline_end() {
        let (doc, engine, tree) = layout(
            "<style>html,body{margin:0}\
             #b{direction:rtl;width:200px;height:20px}\
             #i{display:inline-block;width:40px;height:10px}</style>\
             <div id=b><span id=i></span></div>",
            400.0,
        );
        let block = rect(&tree, &engine, &doc, "#b");
        let inline = rect(&tree, &engine, &doc, "#i");
        let expected = block.right() - inline.width();
        assert!(
            (inline.x() - expected).abs() < 1.0,
            "inline-start is the right edge under direction:rtl; got x={} want {}",
            inline.x(),
            expected
        );
    }

    #[test]
    fn aspect_ratio_sizes_auto_axis() {
        let (doc, engine, tree) = layout(
            "<style>body{margin:0}\
             #w{width:160px;aspect-ratio:16/9}\
             #h{display:inline-block;height:90px;aspect-ratio:16/9}</style>\
             <div id=w></div><div id=h></div>",
            400.0,
        );
        let wide = rect(&tree, &engine, &doc, "#w");
        assert!(
            (wide.width() - 160.0).abs() < 0.5,
            "width stays specified, got {}",
            wide.width()
        );
        assert!(
            (wide.height() - 90.0).abs() < 0.5,
            "height from 16/9, got {}",
            wide.height()
        );
        let tall = rect(&tree, &engine, &doc, "#h");
        assert!(
            (tall.height() - 90.0).abs() < 0.5,
            "height stays specified, got {}",
            tall.height()
        );
        assert!(
            (tall.width() - 160.0).abs() < 0.5,
            "width from 16/9, got {}",
            tall.width()
        );
    }

    #[test]
    fn contain_size_does_not_grow_from_children() {
        let (doc, engine, tree) = layout(
            "<style>body{margin:0} #c{contain:size;width:80px} #k{height:40px}</style>\
             <div id=c><div id=k></div></div>",
            400.0,
        );
        let boxc = rect(&tree, &engine, &doc, "#c");
        assert!(
            boxc.height() < 8.0,
            "contain:size auto height stays empty, got {}",
            boxc.height()
        );
    }
}
