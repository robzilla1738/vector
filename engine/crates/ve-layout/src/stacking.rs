//! Stacking contexts, paint order and hit testing.
//!
//! A simplified CSS 2.1 Appendix E: a box establishes a stacking context if it
//! is the root, is positioned with a non-`auto` `z-index`, is `fixed`, or has
//! `opacity < 1`. Positioned boxes with `z-index: auto` are painted at level
//! zero after in-flow content, which is modelled as a pseudo-context with
//! `z-index: 0` that does not isolate its descendants.

use ve_core::{NodeId, Point, Rect};
use ve_style::{PointerEvents, Position, Visibility, ZIndex};

use crate::box_tree::{BoxKind, LayoutBox};

/// One thing to paint, in back-to-front order.
#[derive(Clone, Debug, PartialEq)]
pub struct PaintItem {
    /// The DOM node painted (`None` for anonymous boxes).
    pub node: Option<NodeId>,
    /// The element hit testing reports for this item.
    pub element: Option<NodeId>,
    /// Border-box (or fragment) rectangle.
    pub rect: Rect,
    /// Text content, for text fragments.
    pub text: Option<String>,
    /// Baseline offset for text fragments.
    pub baseline: f32,
    /// Whether the item participates in hit testing.
    pub hit_testable: bool,
}

/// A stacking context: its own items plus child contexts ordered by z-index.
#[derive(Clone, Debug, Default)]
pub struct StackingContext {
    /// The establishing element (`None` for the root context of an empty document).
    pub node: Option<NodeId>,
    /// Effective z-index (`auto` counts as 0).
    pub z_index: i32,
    /// Items painted by this context in tree order. The first item is the
    /// establishing box itself.
    pub items: Vec<PaintItem>,
    /// Child contexts in tree order (sorted by z-index when painting).
    pub children: Vec<StackingContext>,
}

fn establishes_context(bx: &LayoutBox) -> bool {
    bx.node.is_some()
        && ((bx.style.position.is_positioned() && bx.style.z_index != ZIndex::Auto)
            || bx.style.position == Position::Fixed
            || bx.style.opacity < 1.0)
}

fn is_positioned_auto(bx: &LayoutBox) -> bool {
    bx.node.is_some() && bx.style.position.is_positioned() && bx.style.z_index == ZIndex::Auto
}

impl StackingContext {
    /// Builds the stacking tree for the laid-out box tree.
    #[must_use]
    pub fn build(root: &LayoutBox) -> Self {
        let mut ctx = StackingContext {
            node: root.node,
            z_index: 0,
            items: Vec::new(),
            children: Vec::new(),
        };
        ctx.collect(root, None);
        ctx
    }

    fn collect(&mut self, bx: &LayoutBox, inherited_owner: Option<NodeId>) {
        let hit_testable = bx.style.pointer_events != PointerEvents::None
            && bx.style.visibility == Visibility::Visible;
        let owner = bx.node.or(inherited_owner);
        if !matches!(bx.kind, BoxKind::Text(_)) {
            self.items.push(PaintItem {
                node: bx.node,
                element: owner,
                rect: bx.rect,
                text: None,
                baseline: 0.0,
                hit_testable: hit_testable && bx.node.is_some(),
            });
        }
        for line in &bx.lines {
            for fragment in &line.fragments {
                if fragment.text.is_some() {
                    self.items.push(PaintItem {
                        node: fragment.node,
                        element: fragment.owner.or(owner),
                        rect: fragment.rect,
                        text: fragment.text.clone(),
                        baseline: fragment.baseline,
                        hit_testable,
                    });
                }
            }
        }
        for child in &bx.children {
            if establishes_context(child) || is_positioned_auto(child) {
                let z = match child.style.z_index {
                    ZIndex::Integer(z) if child.style.position.is_positioned() => z,
                    _ => 0,
                };
                let mut sub = StackingContext {
                    node: child.node,
                    z_index: z,
                    items: Vec::new(),
                    children: Vec::new(),
                };
                sub.collect(child, owner);
                self.children.push(sub);
            } else {
                self.collect(child, owner);
            }
        }
    }

    /// Flattens the tree into back-to-front paint order.
    #[must_use]
    pub fn paint_order(&self) -> Vec<PaintItem> {
        let mut out = Vec::new();
        self.paint_into(&mut out);
        out
    }

    fn paint_into(&self, out: &mut Vec<PaintItem>) {
        let mut children: Vec<&StackingContext> = self.children.iter().collect();
        children.sort_by_key(|c| c.z_index); // stable: tree order within equal z
        let mut items = self.items.iter();
        if let Some(first) = items.next() {
            out.push(first.clone());
        }
        for child in children.iter().filter(|c| c.z_index < 0) {
            child.paint_into(out);
        }
        out.extend(items.cloned());
        for child in children.iter().filter(|c| c.z_index >= 0) {
            child.paint_into(out);
        }
    }

    /// The element of the topmost hit-testable item containing `point`.
    #[must_use]
    pub fn hit_test(&self, point: Point) -> Option<NodeId> {
        self.paint_order()
            .iter()
            .rev()
            .find(|item| item.hit_testable && item.rect.contains(point))
            .and_then(|i| i.element)
    }

    /// Total number of items in this context and all descendants.
    #[must_use]
    pub fn item_count(&self) -> usize {
        self.items.len()
            + self
                .children
                .iter()
                .map(StackingContext::item_count)
                .sum::<usize>()
    }
}

#[cfg(test)]
mod tests {
    use std::rc::Rc;

    use super::*;
    use ve_style::ComputedStyle;

    fn bx(node: u32, rect: Rect, style: ComputedStyle) -> LayoutBox {
        let mut b = LayoutBox::new(Some(NodeId::new(node, 0)), BoxKind::Block, Rc::new(style));
        b.rect = rect;
        b
    }

    #[test]
    fn z_index_orders_contexts_and_hit_testing_prefers_topmost() {
        let mut root = bx(
            1,
            Rect::new(0.0, 0.0, 100.0, 100.0),
            ComputedStyle::initial(),
        );
        let neg = bx(
            2,
            Rect::new(0.0, 0.0, 50.0, 50.0),
            ComputedStyle {
                position: Position::Absolute,
                z_index: ZIndex::Integer(-1),
                ..ComputedStyle::initial()
            },
        );
        let plain = bx(3, Rect::new(0.0, 0.0, 50.0, 50.0), ComputedStyle::initial());
        let pos_auto = bx(
            4,
            Rect::new(0.0, 0.0, 50.0, 50.0),
            ComputedStyle {
                position: Position::Relative,
                ..ComputedStyle::initial()
            },
        );
        let top = bx(
            5,
            Rect::new(0.0, 0.0, 50.0, 50.0),
            ComputedStyle {
                position: Position::Absolute,
                z_index: ZIndex::Integer(3),
                ..ComputedStyle::initial()
            },
        );
        let invisible = bx(
            6,
            Rect::new(0.0, 0.0, 50.0, 50.0),
            ComputedStyle {
                position: Position::Absolute,
                z_index: ZIndex::Integer(9),
                pointer_events: PointerEvents::None,
                ..ComputedStyle::initial()
            },
        );
        // Deliberately out of z order in the tree.
        root.children = vec![top, neg, plain, pos_auto, invisible];
        let ctx = StackingContext::build(&root);
        let order: Vec<u32> = ctx
            .paint_order()
            .iter()
            .filter_map(|i| i.node.map(NodeId::index))
            .collect();
        assert_eq!(order, vec![1, 2, 3, 4, 5, 6]);
        assert_eq!(
            ctx.hit_test(Point::new(10.0, 10.0)),
            Some(NodeId::new(5, 0)),
            "pointer-events:none is skipped"
        );
        assert_eq!(
            ctx.hit_test(Point::new(90.0, 90.0)),
            Some(NodeId::new(1, 0))
        );
        assert_eq!(ctx.hit_test(Point::new(500.0, 500.0)), None);
        assert_eq!(ctx.item_count(), 6);
    }
}
