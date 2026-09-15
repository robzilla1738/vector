//! Inline formatting: flowing text runs and atomic inlines into line boxes.

use ve_core::{NodeId, Point, Rect};
use ve_style::{ComputedStyle, TextAlign};

use crate::block::{
    ContainingBlock, Forced, LayoutCtx, layout_box_at, resolve_margins, translate_subtree,
};
use crate::box_tree::{BoxKind, Fragment, LayoutBox, LineBox};

/// One line under construction.
struct Line {
    y: f32,
    advance: f32,
    fragments: Vec<Fragment>,
}

impl Line {
    fn new(y: f32) -> Self {
        Self {
            y,
            advance: 0.0,
            fragments: Vec::new(),
        }
    }

    fn is_empty(&self) -> bool {
        self.fragments.is_empty()
    }
}

/// An inline element whose children are currently being flowed.
struct OpenInline {
    node: NodeId,
    /// Union of fragments on already finished lines.
    acc: Rect,
    /// Index into the current line's fragments where this element started.
    start: usize,
}

struct InlineState<'a, 'c> {
    ctx: &'a mut LayoutCtx<'c>,
    origin: Point,
    width: f32,
    line: Line,
    lines: Vec<LineBox>,
    open: Vec<OpenInline>,
    /// The block container's node (owner of bare text).
    container: Option<NodeId>,
}

impl InlineState<'_, '_> {
    fn remaining(&self) -> f32 {
        (self.width - self.line.advance).max(0.0)
    }

    fn owner(&self) -> Option<NodeId> {
        self.open.last().map(|o| o.node).or(self.container)
    }

    /// Closes the current line: aligns fragments vertically on a common
    /// baseline, applies `text-align`, records the line box.
    fn finish_line(&mut self, align: TextAlign) {
        if self.line.is_empty() {
            return;
        }
        let baseline = self
            .line
            .fragments
            .iter()
            .map(|f| f.baseline)
            .fold(0.0, f32::max);
        let height = self
            .line
            .fragments
            .iter()
            .map(|f| baseline - f.baseline + f.rect.height())
            .fold(0.0, f32::max);
        let line_width = self
            .line
            .fragments
            .iter()
            .map(|f| f.rect.right())
            .fold(self.origin.x, f32::max)
            - self.origin.x;
        let shift = match align {
            TextAlign::Center => ((self.width - line_width) / 2.0).max(0.0),
            TextAlign::Right | TextAlign::End => (self.width - line_width).max(0.0),
            _ => 0.0,
        };
        let mut fragments = std::mem::take(&mut self.line.fragments);
        for (i, f) in fragments.iter_mut().enumerate() {
            f.rect = f.rect.translate(shift, baseline - f.baseline);
            for open in &mut self.open {
                if i >= open.start {
                    open.acc = open.acc.union(&f.rect);
                }
            }
        }
        for open in &mut self.open {
            open.start = 0;
        }
        let rect = Rect::new(self.origin.x, self.line.y, self.width, height);
        self.lines.push(LineBox { rect, fragments });
        self.line = Line::new(rect.bottom());
    }

    fn push_fragment(&mut self, fragment: Fragment) {
        self.line.advance = fragment.rect.right() - self.origin.x;
        self.line.fragments.push(fragment);
    }
}

/// Lays out the inline-level children of `bx` into `bx.lines`. Returns the
/// height of the inline formatting context.
pub fn layout_inline(bx: &mut LayoutBox, ctx: &mut LayoutCtx<'_>, content: Rect) -> f32 {
    let align = bx.style.text_align;
    let mut state = InlineState {
        ctx,
        origin: content.origin,
        width: content.width(),
        line: Line::new(content.y()),
        lines: Vec::new(),
        open: Vec::new(),
        container: bx.node,
    };
    let mut children = std::mem::take(&mut bx.children);
    flow_children(&mut children, &mut state, align);
    state.finish_line(align);
    bx.lines = state.lines;
    sync_atomic_boxes(&mut children, &bx.lines);
    bx.children = children;
    bx.lines
        .last()
        .map_or(0.0, |l| l.rect.bottom() - content.y())
}

/// Atomic inline boxes are laid out before their line is finished; once
/// baseline alignment and `text-align` have moved the fragment, move the box
/// (and its subtree) to match.
fn sync_atomic_boxes(children: &mut [LayoutBox], lines: &[LineBox]) {
    for child in children {
        match child.kind {
            BoxKind::Inline => sync_atomic_boxes(&mut child.children, lines),
            BoxKind::InlineBlock | BoxKind::Flex | BoxKind::Grid if child.node.is_some() => {
                let fragment = lines
                    .iter()
                    .flat_map(|l| &l.fragments)
                    .find(|f| f.node == child.node && f.text.is_none());
                if let Some(f) = fragment {
                    let margins = resolve_margins(&child.style, f.rect.width());
                    let target = Point::new(f.rect.x() + margins.left, f.rect.y() + margins.top);
                    translate_subtree(child, target.x - child.rect.x(), target.y - child.rect.y());
                }
            }
            _ => {}
        }
    }
}

fn flow_children(children: &mut [LayoutBox], state: &mut InlineState<'_, '_>, align: TextAlign) {
    for child in children {
        if child.is_out_of_flow() {
            child.rect = Rect::new(state.origin.x + state.line.advance, state.line.y, 0.0, 0.0);
            continue;
        }
        match &child.kind {
            BoxKind::Text(text) => {
                let text = text.clone();
                flow_text(child, &text, state, align);
            }
            BoxKind::Inline => {
                let node = child.node.expect("inline boxes come from elements");
                state.open.push(OpenInline {
                    node,
                    acc: Rect::ZERO,
                    start: state.line.fragments.len(),
                });
                flow_children(&mut child.children, state, align);
                let open = state.open.pop().expect("balanced open/close");
                let rect = state.line.fragments[open.start..]
                    .iter()
                    .fold(open.acc, |r, f| r.union(&f.rect));
                child.rect = rect;
                child.content = rect;
            }
            _ => flow_atomic(child, state, align),
        }
    }
}

fn flow_text(child: &mut LayoutBox, text: &str, state: &mut InlineState<'_, '_>, align: TextAlign) {
    let style: &ComputedStyle = &child.style;
    let wrap = style.white_space.wraps();
    let mut lines = state
        .ctx
        .shaper
        .shape(text, style, state.remaining(), state.width, wrap);
    // If the first piece does not fit next to existing content, start a new line and reshape.
    if wrap
        && !state.line.is_empty()
        && lines
            .first()
            .is_some_and(|l| l.width > state.remaining() + 0.01)
    {
        state.finish_line(align);
        lines = state
            .ctx
            .shaper
            .shape(text, style, state.width, state.width, wrap);
    }
    let mut union = Rect::ZERO;
    for (i, shaped) in lines.into_iter().enumerate() {
        if i > 0 {
            state.finish_line(align);
        }
        let mut piece = &text[shaped.range.clone()];
        let mut width = shaped.width;
        if state.line.is_empty() && piece.starts_with(' ') {
            // Collapsible whitespace at the start of a line is removed.
            let trimmed = piece.trim_start();
            width -= state
                .ctx
                .shaper
                .measure(&piece[..piece.len() - trimmed.len()], style);
            piece = trimmed;
        }
        if piece.is_empty() {
            if i == 0 && !state.line.is_empty() && text.starts_with(' ') {
                // A lone collapsible space between inline content keeps its advance.
                let space = state.ctx.shaper.measure(" ", style);
                let rect = Rect::new(
                    state.origin.x + state.line.advance,
                    state.line.y,
                    space,
                    shaped.height,
                );
                state.push_fragment(Fragment {
                    node: child.node,
                    owner: state.owner(),
                    rect,
                    text: Some(" ".into()),
                    baseline: shaped.baseline,
                });
                union = union.union(&rect);
            }
            continue;
        }
        let rect = Rect::new(
            state.origin.x + state.line.advance,
            state.line.y,
            width.max(0.0),
            shaped.height,
        );
        union = union.union(&rect);
        state.push_fragment(Fragment {
            node: child.node,
            owner: state.owner(),
            rect,
            text: Some(piece.to_owned()),
            baseline: shaped.baseline,
        });
    }
    child.rect = union;
    child.content = union;
}

/// Places an atomic inline (inline-block, inline flex/grid) on the line.
fn flow_atomic(child: &mut LayoutBox, state: &mut InlineState<'_, '_>, align: TextAlign) {
    let cb = ContainingBlock {
        width: state.width,
        height: None,
    };
    let margins = resolve_margins(&child.style, state.width);
    let origin = Point::new(state.origin.x + state.line.advance, state.line.y);
    layout_box_at(child, state.ctx, cb, origin, Forced::default());
    let margin_width = child.rect.width() + margins.horizontal();
    if !state.line.is_empty() && margin_width > state.remaining() + 0.01 {
        state.finish_line(align);
        let dx = state.origin.x + margins.left - child.rect.x();
        let dy = state.line.y + margins.top - child.rect.y();
        translate_subtree(child, dx, dy);
    }
    let margin_box = child.rect.outset(margins);
    // Atomic inlines sit on the baseline with their bottom margin edge.
    state.push_fragment(Fragment {
        node: child.node,
        owner: state.owner(),
        rect: margin_box,
        text: None,
        baseline: margin_box.height(),
    });
}
