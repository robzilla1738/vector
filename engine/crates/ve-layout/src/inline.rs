//! Inline formatting: flowing text runs and atomic inlines into line boxes.
//!
//! Line boxes are shortened by the floats of the enclosing block formatting
//! context (CSS 2.1 §9.5): every new line asks the [`FloatContext`] for the
//! free band at its `y`, a line that is too narrow for its first piece of
//! content drops below the next float, and a float encountered *inside* the
//! inline content is placed at the current line's top and shortens it.
//!
//! [`FloatContext`]: crate::floats::FloatContext

use ve_core::{NodeId, Point, Rect};
use ve_style::{
    ComputedStyle, Direction, HangingPunctuation, TextAlign, TextAlignLast, TextJustify,
    TextOverflow, TextWrap,
};

use crate::block::{
    ContainingBlock, Forced, LayoutCtx, layout_box_at, layout_float, resolve_margins,
    translate_subtree,
};
use crate::box_tree::{BoxKind, Fragment, LayoutBox, LineBox};

/// One line under construction.
struct Line {
    y: f32,
    /// Left edge of the line box (after float shortening).
    x: f32,
    /// Available width of the line box (after float shortening).
    width: f32,
    /// Distance from `x` to the right edge of the last fragment.
    advance: f32,
    fragments: Vec<Fragment>,
}

impl Line {
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
    /// Content box of the block container.
    content: Rect,
    /// `line-height` of the container, used to probe the float band.
    line_height: f32,
    line: Line,
    lines: Vec<LineBox>,
    open: Vec<OpenInline>,
    /// The block container's node (owner of bare text).
    container: Option<NodeId>,
    /// `text-justify` of the container.
    justify: TextJustify,
}

impl InlineState<'_, '_> {
    fn remaining(&self) -> f32 {
        (self.line.width - self.line.advance).max(0.0)
    }

    fn owner(&self) -> Option<NodeId> {
        self.open.last().map(|o| o.node).or(self.container)
    }

    /// Returns `true` if the current line is narrower than the container
    /// because of floats.
    fn is_shortened(&self) -> bool {
        self.line.width + 0.01 < self.content.width()
    }

    /// Starts a new (empty) line at `y`, shortened by the floats there.
    fn start_line(&mut self, y: f32) -> Line {
        let (l, r) =
            self.ctx
                .floats()
                .edges(y, self.line_height, self.content.x(), self.content.right());
        Line {
            y,
            x: l,
            width: (r - l).max(0.0),
            advance: 0.0,
            fragments: Vec::new(),
        }
    }

    /// Moves an empty current line down to the next float bottom (where the
    /// available width can change). Returns `false` if there is none.
    fn drop_below_float(&mut self) -> bool {
        let Some(next) = self.ctx.floats().next_bottom_after(self.line.y) else {
            return false;
        };
        self.line = self.start_line(next);
        true
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
            .fold(self.line.x, f32::max)
            - self.line.x;
        let shift = match align {
            TextAlign::Center => ((self.line.width - line_width) / 2.0).max(0.0),
            TextAlign::Right | TextAlign::End => (self.line.width - line_width).max(0.0),
            _ => 0.0,
        };
        let extra = if align == TextAlign::Justify && self.justify != TextJustify::None {
            (self.line.width - line_width).max(0.0)
        } else {
            0.0
        };
        let mut fragments = std::mem::take(&mut self.line.fragments);
        let gaps = fragments.len().saturating_sub(1);
        let step = if gaps > 0 { extra / gaps as f32 } else { 0.0 };
        for (i, f) in fragments.iter_mut().enumerate() {
            f.rect = f.rect.translate(shift + step * i as f32, baseline - f.baseline);
            for open in &mut self.open {
                if i >= open.start {
                    open.acc = open.acc.union(&f.rect);
                }
            }
        }
        for open in &mut self.open {
            open.start = 0;
        }
        let rect = Rect::new(self.line.x, self.line.y, self.line.width, height);
        self.lines.push(LineBox { rect, fragments });
        self.line = self.start_line(rect.bottom());
    }

    fn push_fragment(&mut self, fragment: Fragment) {
        self.line.advance = fragment.rect.right() - self.line.x;
        self.line.fragments.push(fragment);
    }

    fn pen(&self) -> Point {
        Point::new(self.line.x + self.line.advance, self.line.y)
    }
}

fn used_text_align(style: &ComputedStyle) -> TextAlign {
    match (style.text_align, style.direction) {
        (TextAlign::Start, Direction::Rtl) => TextAlign::End,
        (TextAlign::End, Direction::Rtl) => TextAlign::Start,
        (align, _) => align,
    }
}

fn used_text_align_last(style: &ComputedStyle) -> Option<TextAlign> {
    let align = match style.text_align_last {
        TextAlignLast::Auto => return None,
        TextAlignLast::Start => TextAlign::Start,
        TextAlignLast::End => TextAlign::End,
        TextAlignLast::Left => TextAlign::Left,
        TextAlignLast::Right => TextAlign::Right,
        TextAlignLast::Center => TextAlign::Center,
        TextAlignLast::Justify => TextAlign::Start,
    };
    Some(match (align, style.direction) {
        (TextAlign::Start, Direction::Rtl) => TextAlign::End,
        (TextAlign::End, Direction::Rtl) => TextAlign::Start,
        (a, _) => a,
    })
}

/// Lays out the inline-level children of `bx` into `bx.lines`. Returns the
/// height of the inline formatting context.
pub fn layout_inline(bx: &mut LayoutBox, ctx: &mut LayoutCtx<'_>, content: Rect) -> f32 {
    let align = used_text_align(&bx.style);
    let line_height = bx.style.line_height.to_px(bx.style.font_size);
    let indent = bx.style.text_indent.resolve(content.width());
    let mut state = InlineState {
        ctx,
        content,
        line_height,
        line: Line {
            y: content.y(),
            x: content.x(),
            width: content.width(),
            advance: 0.0,
            fragments: Vec::new(),
        },
        lines: Vec::new(),
        open: Vec::new(),
        container: bx.node,
        justify: bx.style.text_justify,
    };
    state.line = state.start_line(content.y());
    state.line.advance = indent.max(0.0);
    let mut children = std::mem::take(&mut bx.children);
    flow_children(&mut children, &mut state, align);
    state.finish_line(used_text_align_last(&bx.style).unwrap_or(align));
    bx.lines = state.lines;
    if let Some(n) = bx.style.line_clamp {
        bx.lines.truncate(n.max(1) as usize);
    }
    if bx.style.text_overflow == TextOverflow::Ellipsis && bx.style.overflow.clips() {
        apply_text_ellipsis(&mut bx.lines, content.right(), &bx.style, state.ctx.shaper);
    }
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
            BoxKind::InlineBlock | BoxKind::Flex | BoxKind::Grid | BoxKind::Table
                if child.node.is_some() && child.is_in_flow() =>
            {
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
            let pen = state.pen();
            child.rect = Rect::new(pen.x, pen.y, 0.0, 0.0);
            continue;
        }
        if child.is_float() {
            flow_float(child, state);
            continue;
        }
        match &child.kind {
            BoxKind::Text(text) => {
                let text = text.clone();
                flow_text(child, &text, state, align);
            }
            BoxKind::Inline => {
                let Some(node) = child.node else {
                    // A generated inline (`::before` with `display: inline`):
                    // flow its children as part of the owner.
                    flow_children(&mut child.children, state, align);
                    continue;
                };
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

/// A float inside inline content: placed no higher than the current line's
/// top, then the current line is shortened (a left float pushes content
/// already on the line to the right).
fn flow_float(child: &mut LayoutBox, state: &mut InlineState<'_, '_>) {
    let content = state.content;
    layout_float(child, state.ctx, content, state.line.y);
    let (l, r) = state.ctx.floats().edges(
        state.line.y,
        state.line_height.max(1.0),
        content.x(),
        content.right(),
    );
    let dx = l - state.line.x;
    if dx != 0.0 {
        for f in &mut state.line.fragments {
            f.rect = f.rect.translate(dx, 0.0);
        }
    }
    state.line.x = l;
    state.line.width = (r - l).max(0.0);
}

fn apply_text_ellipsis(
    lines: &mut [LineBox],
    max_right: f32,
    style: &ComputedStyle,
    shaper: &mut dyn crate::text::TextShaper,
) {
    let dots = "…";
    let dw = shaper.measure(dots, style);
    for line in lines.iter_mut() {
        if !line
            .fragments
            .iter()
            .any(|f| f.text.is_some() && f.rect.right() > max_right + 0.01)
        {
            continue;
        }
        let limit = max_right - dw;
        line.fragments.retain(|f| f.rect.x() < limit + 0.01);
        let Some(last) = line.fragments.iter_mut().rev().find(|f| f.text.is_some()) else {
            continue;
        };
        let budget = (limit - last.rect.x()).max(0.0);
        let mut t = last.text.clone().unwrap_or_default();
        while !t.is_empty() && shaper.measure(&t, style) > budget + 0.01 {
            t.pop();
        }
        t.push_str(dots);
        let width = shaper.measure(&t, style);
        last.text = Some(t);
        last.rect = Rect::new(last.rect.x(), last.rect.y(), width.max(0.0), last.rect.height());
    }
}

fn flow_text(child: &mut LayoutBox, text: &str, state: &mut InlineState<'_, '_>, align: TextAlign) {
    let style: &ComputedStyle = &child.style;
    let wrap = style.white_space.wraps() && style.text_wrap != TextWrap::Nowrap;
    let mut lines = state
        .ctx
        .shaper
        .shape(text, style, state.remaining(), state.line.width, wrap);
    // If the first piece does not fit next to existing content, start a new
    // line; if it does not fit on an empty line shortened by floats, drop
    // below the floats. Then reshape.
    let mut guard = 0;
    while wrap
        && lines
            .first()
            .is_some_and(|l| l.width > state.remaining() + 0.01)
        && guard < 64
    {
        guard += 1;
        if !state.line.is_empty() {
            state.finish_line(align);
        } else if !(state.is_shortened() && state.drop_below_float()) {
            break;
        }
        lines = state
            .ctx
            .shaper
            .shape(text, style, state.remaining(), state.line.width, wrap);
    }
    if wrap && style.text_wrap == TextWrap::Balance && lines.len() > 1 {
        let n = lines.len();
        let total: f32 = lines.iter().map(|l| l.width).sum();
        let target = (total / n as f32) + 0.5;
        let balanced = state.ctx.shaper.shape(text, style, target, target, wrap);
        if balanced.len() == n {
            lines = balanced;
        }
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
                let pen = state.pen();
                let rect = Rect::new(pen.x, pen.y, space, shaped.height);
                state.push_fragment(Fragment {
                    node: child.node,
                    owner: state.owner(),
                    rect,
                    text: Some(" ".into()),
                    baseline: shaped.baseline,
                    clip: None,
                    pseudo: child.pseudo,
                });
                union = union.union(&rect);
            }
            continue;
        }
        let pen = state.pen();
        let mut x = pen.x;
        if style.hanging_punctuation == HangingPunctuation::First
            && state.line.is_empty()
            && piece.starts_with(|c: char| matches!(c, '"' | '\'' | '“' | '‘' | '«' | '('))
        {
            if let Some(mark) = piece.chars().next() {
                let mut buf = [0u8; 4];
                x -= state.ctx.shaper.measure(mark.encode_utf8(&mut buf), style);
            }
        }
        let rect = Rect::new(x, pen.y, width.max(0.0), shaped.height);
        union = union.union(&rect);
        state.push_fragment(Fragment {
            node: child.node,
            owner: state.owner(),
            rect,
            text: Some(piece.to_owned()),
            baseline: shaped.baseline,
            clip: None,
            pseudo: child.pseudo,
        });
    }
    child.rect = union;
    child.content = union;
}

/// Places an atomic inline (inline-block, inline flex/grid/table) on the line.
fn flow_atomic(child: &mut LayoutBox, state: &mut InlineState<'_, '_>, align: TextAlign) {
    let cb = ContainingBlock {
        width: state.content.width(),
        height: None,
    };
    let margins = resolve_margins(&child.style, cb.width);
    let origin = state.pen();
    layout_box_at(child, state.ctx, cb, origin, Forced::default());
    let margin_width = child.rect.width() + margins.horizontal();
    let mut guard = 0;
    while margin_width > state.remaining() + 0.01 && guard < 64 {
        guard += 1;
        if !state.line.is_empty() {
            state.finish_line(align);
        } else if !(state.is_shortened() && state.drop_below_float()) {
            break;
        }
        let pen = state.pen();
        let dx = pen.x + margins.left - child.rect.x();
        let dy = pen.y + margins.top - child.rect.y();
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
        clip: None,
        pseudo: child.pseudo,
    });
}
