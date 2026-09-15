//! Box tree construction from the DOM and computed styles.

use std::rc::Rc;

use ve_core::{NodeId, Rect};
use ve_dom::{Document, NodeKind};
use ve_style::{ComputedStyle, Display, StyleTree, WhiteSpace};

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
    /// A run of text (whitespace already collapsed per `white-space`).
    Text(String),
    /// Anonymous block wrapping inline content inside a block that also has
    /// block children, or wrapping text inside a flex/grid container.
    AnonymousBlock,
}

/// One piece of an inline formatting context placed on a line.
#[derive(Clone, Debug, PartialEq)]
pub struct Fragment {
    /// The DOM node this fragment renders (text node or inline element).
    pub node: Option<NodeId>,
    /// The nearest element containing this fragment (what hit testing reports
    /// for text).
    pub owner: Option<NodeId>,
    /// Border-box rectangle in viewport coordinates.
    pub rect: Rect,
    /// The text rendered by this fragment, if it is a text fragment.
    pub text: Option<String>,
    /// Baseline offset from the fragment's top, for text fragments.
    pub baseline: f32,
}

/// A line box produced by inline layout.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct LineBox {
    /// Bounds of the line.
    pub rect: Rect,
    /// Fragments on the line, in visual order.
    pub fragments: Vec<Fragment>,
}

/// A node of the layout tree.
#[derive(Clone, Debug)]
pub struct LayoutBox {
    /// Generating DOM node (`None` for anonymous boxes).
    pub node: Option<NodeId>,
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
}

impl LayoutBox {
    /// Creates an unlaid-out box.
    #[must_use]
    pub fn new(node: Option<NodeId>, kind: BoxKind, style: Rc<ComputedStyle>) -> Self {
        Self {
            node,
            kind,
            style,
            children: Vec::new(),
            rect: Rect::ZERO,
            content: Rect::ZERO,
            lines: Vec::new(),
        }
    }

    /// Returns `true` if the box is block-level in its parent's flow.
    #[must_use]
    pub fn is_block_level(&self) -> bool {
        match self.kind {
            BoxKind::Block | BoxKind::AnonymousBlock => true,
            BoxKind::Flex | BoxKind::Grid => self.style.display.is_block_level(),
            BoxKind::Inline | BoxKind::InlineBlock | BoxKind::Text(_) => false,
        }
    }

    /// Returns `true` if the box is out of normal flow (`absolute` / `fixed`).
    #[must_use]
    pub fn is_out_of_flow(&self) -> bool {
        self.node.is_some() && self.style.position.is_out_of_flow()
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
}

/// Builds the box tree for the document element. Returns an empty block if
/// the document has no root element.
#[must_use]
pub fn build_box_tree(doc: &Document, styles: &StyleTree) -> LayoutBox {
    let Some(root) = doc.document_element() else {
        return LayoutBox::new(None, BoxKind::Block, Rc::new(ComputedStyle::initial()));
    };
    let style = styles.style(root);
    let mut bx = LayoutBox::new(Some(root), container_kind(style.display), style);
    build_children(doc, styles, root, &mut bx);
    normalize(&mut bx);
    bx
}

fn container_kind(display: Display) -> BoxKind {
    match display {
        Display::Flex | Display::InlineFlex => BoxKind::Flex,
        Display::Grid | Display::InlineGrid => BoxKind::Grid,
        Display::Inline => BoxKind::Inline,
        Display::InlineBlock | Display::TableCell => BoxKind::InlineBlock,
        _ => BoxKind::Block,
    }
}

/// Appends boxes for the children of `node` to `parent`.
fn build_children(doc: &Document, styles: &StyleTree, node: NodeId, parent: &mut LayoutBox) {
    for child in doc.children(node) {
        let Some(n) = doc.get(child) else { continue };
        match &n.kind {
            NodeKind::Element(_) => {
                let style = styles.style(child);
                match style.display {
                    Display::None => {}
                    Display::Contents => build_children(doc, styles, child, parent),
                    display => {
                        let mut bx = LayoutBox::new(Some(child), container_kind(display), style);
                        build_children(doc, styles, child, &mut bx);
                        normalize(&mut bx);
                        parent.children.push(bx);
                    }
                }
            }
            NodeKind::Text(text) => {
                let style = styles.style(child);
                let collapsed = collapse_whitespace(text, style.white_space);
                if !collapsed.is_empty() {
                    parent.children.push(LayoutBox::new(
                        Some(child),
                        BoxKind::Text(collapsed),
                        style,
                    ));
                }
            }
            _ => {}
        }
    }
}

/// Collapses whitespace according to `white-space`. Newlines are kept as
/// `\n` where the property preserves them so inline layout can force breaks.
#[must_use]
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

/// Enforces the block/inline invariant: a block container's children are
/// either all block-level or all inline-level. Flex and grid containers get
/// text wrapped into anonymous flex items. Whitespace-only text between
/// blocks is dropped.
fn normalize(bx: &mut LayoutBox) {
    let is_flow_container = matches!(
        bx.kind,
        BoxKind::Block | BoxKind::InlineBlock | BoxKind::AnonymousBlock
    );
    let is_flex_or_grid = matches!(bx.kind, BoxKind::Flex | BoxKind::Grid);
    if !(is_flow_container || is_flex_or_grid) {
        return;
    }
    let has_block = bx
        .children
        .iter()
        .any(|c| c.is_block_level() && !c.is_out_of_flow());
    let has_inline = bx
        .children
        .iter()
        .any(|c| !c.is_block_level() && !c.is_out_of_flow());
    if is_flow_container && !(has_block && has_inline) {
        return;
    }

    let style = bx.style.clone();
    let children = std::mem::take(&mut bx.children);
    let mut run: Vec<LayoutBox> = Vec::new();
    let flush = |run: &mut Vec<LayoutBox>, out: &mut Vec<LayoutBox>| {
        if run.is_empty() {
            return;
        }
        let only_space = run
            .iter()
            .all(|c| matches!(&c.kind, BoxKind::Text(t) if t.trim().is_empty()));
        if only_space {
            run.clear();
            return;
        }
        let mut anon = LayoutBox::new(None, BoxKind::AnonymousBlock, style.clone());
        anon.children = std::mem::take(run);
        out.push(anon);
    };
    for child in children {
        let wrap = if is_flex_or_grid {
            matches!(child.kind, BoxKind::Text(_))
        } else {
            !child.is_block_level() && !child.is_out_of_flow()
        };
        if wrap {
            run.push(child);
        } else {
            flush(&mut run, &mut bx.children);
            bx.children.push(child);
        }
    }
    flush(&mut run, &mut bx.children);
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
}
