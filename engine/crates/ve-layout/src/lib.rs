//! Layout for the Vector Engine.
//!
//! Turns a document plus its [`StyleTree`] into a tree of positioned boxes:
//!
//! 1. [`box_tree`] builds [`LayoutBox`]es from the DOM (skipping `display:
//!    none`, wrapping mixed inline/block content in anonymous boxes, collapsing
//!    whitespace).
//! 2. [`block`] runs block formatting (vertical stacking, widths from the
//!    containing block, sibling margin collapsing, min/max clamping) and
//!    delegates to [`inline`] for inline formatting contexts (line boxes,
//!    greedy wrapping through a [`TextShaper`]) and to [`flex`] for flex and
//!    grid containers (computed by `taffy`, measured by our own block layout).
//! 3. Positioned boxes are placed against their containing block.
//! 4. [`stacking`] derives paint order (stacking contexts, `z-index`) and
//!    performs hit testing.
//!
//! # Contract
//!
//! * All geometry is in CSS pixels relative to the viewport origin; scroll
//!   offsets are applied by the caller.
//! * [`LayoutTree::rect_of`] returns the border box of a node's first
//!   fragment; inline elements split across lines get the union of fragments.
//! * Text is measured through the [`TextShaper`] trait. [`ParleyShaper`]
//!   shapes real glyphs when fonts are registered; [`MetricShaper`] is a
//!   deterministic average-advance fallback used when no font data is
//!   available (headless servers, unit tests).
//! * Not yet implemented (deliberate M0 stubs): floats, tables (rendered as
//!   blocks), `position: sticky` (as `relative`), parent/child margin
//!   collapsing, writing modes, fragmentation.

#![forbid(unsafe_code)]

pub mod block;
pub mod box_tree;
pub mod flex;
pub mod inline;
pub mod stacking;
pub mod text;

use std::collections::HashMap;

use ve_core::{NodeId, Point, Rect, Revision, Size, Stage};
use ve_dom::Document;
use ve_style::StyleTree;

pub use box_tree::{BoxKind, Fragment, LayoutBox, LineBox, build_box_tree};
pub use stacking::{PaintItem, StackingContext};
pub use text::{MetricShaper, ParleyShaper, ShapedLine, TextShaper};

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
    /// `stacking` flattened once; hit testing and painting read this.
    paint: Vec<PaintItem>,
    revision: Revision,
}

impl LayoutTree {
    /// Border-box rectangle of `node` (first fragment; union for inlines).
    #[must_use]
    pub fn rect_of(&self, node: NodeId) -> Option<Rect> {
        self.geometry.get(&node).copied()
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

    /// The topmost hit-testable element at `point`, in paint order.
    ///
    /// Reads the cached paint order; the observation builder calls this once
    /// per candidate element, so it must not re-flatten the stacking tree.
    #[must_use]
    pub fn hit_test(&self, point: Point) -> Option<NodeId> {
        self.paint
            .iter()
            .rev()
            .find(|item| item.hit_testable && item.rect.contains(point))
            .and_then(|i| i.element)
    }

    /// Boxes in paint order (back to front).
    #[must_use]
    pub fn paint_order(&self) -> &[PaintItem] {
        &self.paint
    }
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

    /// Lays out `doc` into `viewport`.
    pub fn layout(&mut self, doc: &Document, styles: &StyleTree, viewport: Size) -> LayoutTree {
        let span = Stage::Layout.span();
        let _guard = span.enter();

        let mut root = build_box_tree(doc, styles);
        let mut ctx = block::LayoutCtx {
            shaper: self.shaper.as_mut(),
            viewport,
        };
        block::layout_root(&mut root, &mut ctx);

        let mut geometry = HashMap::new();
        collect_geometry(&root, &mut geometry);
        let stacking = StackingContext::build(&root);
        let paint = stacking.paint_order();
        tracing::debug!(
            boxes = geometry.len(),
            height = root.rect.height(),
            "layout complete"
        );
        LayoutTree {
            root,
            viewport,
            stacking,
            geometry,
            paint,
            revision: styles.revision(),
        }
    }
}

fn collect_geometry(bx: &LayoutBox, out: &mut HashMap<NodeId, Rect>) {
    if let Some(node) = bx.node {
        out.entry(node)
            .and_modify(|r| *r = r.union(&bx.rect))
            .or_insert(bx.rect);
    }
    for line in &bx.lines {
        for fragment in &line.fragments {
            if let Some(node) = fragment.node {
                out.entry(node)
                    .and_modify(|r| *r = r.union(&fragment.rect))
                    .or_insert(fragment.rect);
            }
        }
    }
    for child in &bx.children {
        collect_geometry(child, out);
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

    #[test]
    fn blocks_stack_vertically_with_margins_and_padding() {
        let (doc, engine, tree) = layout(
            "<style>body{margin:0} div{height:50px} #b{margin-top:10px;padding:5px;width:50%}</style>\
             <div id=a></div><div id=b></div>",
            400.0,
        );
        let a = tree
            .rect_of(engine.select_one(&doc, "#a").unwrap())
            .unwrap();
        let b = tree
            .rect_of(engine.select_one(&doc, "#b").unwrap())
            .unwrap();
        assert_eq!(a, Rect::new(0.0, 0.0, 400.0, 50.0));
        assert_eq!(
            b,
            Rect::new(0.0, 60.0, 210.0, 60.0),
            "50% + padding, 10px margin"
        );
        assert_eq!(tree.rect_of(doc.body().unwrap()).unwrap().height(), 120.0);
        assert_eq!(tree.content_height(), 120.0);
    }

    #[test]
    fn inline_text_wraps_into_lines() {
        // MetricShaper: 16px font, 0.5em per char -> 8px per char; 100px fits 12 chars.
        let (doc, engine, tree) = layout(
            "<style>body{margin:0;font-size:16px;line-height:20px} p{margin:0;width:100px}</style>\
             <p>aaaa bbbb cccc dddd</p>",
            400.0,
        );
        let p = engine.select_one(&doc, "p").unwrap();
        let rect = tree.rect_of(p).unwrap();
        assert_eq!(rect.height(), 40.0, "two lines of 20px");
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
        let a = tree
            .rect_of(engine.select_one(&doc, "#a").unwrap())
            .unwrap();
        let big = tree
            .rect_of(engine.select_one(&doc, "#big").unwrap())
            .unwrap();
        assert_eq!(a, Rect::new(0.0, 0.0, 100.0, 30.0));
        assert_eq!(big, Rect::new(100.0, 0.0, 200.0, 30.0));
        assert_eq!(
            tree.hit_test(Point::new(150.0, 10.0)),
            engine.select_one(&doc, "#big").ok()
        );
        assert_eq!(
            tree.hit_test(Point::new(350.0, 10.0)),
            Some(doc.body().unwrap()),
            "outside the row"
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
        let rel = tree
            .rect_of(engine.select_one(&doc, "#rel").unwrap())
            .unwrap();
        assert_eq!(rel, Rect::new(5.0, 5.0, 400.0, 20.0));
        let abs = tree
            .rect_of(engine.select_one(&doc, "#abs").unwrap())
            .unwrap();
        assert_eq!(abs, Rect::new(20.0, 10.0, 50.0, 50.0));
        // Both absolutes overlap; z-index 5 paints on top and wins hit testing.
        assert_eq!(
            tree.hit_test(Point::new(30.0, 30.0)),
            engine.select_one(&doc, "#abs").ok()
        );
        let order: Vec<_> = tree
            .paint_order()
            .into_iter()
            .filter_map(|i| i.node)
            .collect();
        let pos = |sel: &str| {
            order
                .iter()
                .position(|n| *n == engine.select_one(&doc, sel).unwrap())
                .unwrap()
        };
        assert!(pos("#under") < pos("#abs"));
        assert!(pos("#rel") < pos("#under"), "in-flow before positioned");
    }
}
