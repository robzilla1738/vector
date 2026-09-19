//! Float placement (CSS 2.1 §9.5) for one block formatting context.
//!
//! A [`FloatContext`] records the margin boxes of the floats already placed
//! in a block formatting context, in document coordinates. Block layout asks
//! it where the next float goes ([`FloatContext::place`]), inline layout
//! asks how much of a line at a given `y` is free ([`FloatContext::edges`]),
//! and `clear` asks for the lowest float bottom on a side
//! ([`FloatContext::clearance`]).

use ve_core::{Point, Rect};
use ve_style::{Clear, Float};

/// One placed float.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct PlacedFloat {
    /// Margin box in document coordinates.
    pub rect: Rect,
    /// Exclusion used for line wrapping (`shape-outside`; defaults to `rect`).
    pub wrap: Rect,
    /// Which side it floats to.
    pub side: Float,
}

/// The floats of one block formatting context.
#[derive(Clone, Debug, Default)]
pub struct FloatContext {
    floats: Vec<PlacedFloat>,
    /// The top of the most recently placed float; a later float's top may not
    /// be above it (rule 5).
    last_top: f32,
}

impl FloatContext {
    /// An empty context.
    #[must_use]
    pub fn new() -> Self {
        Self {
            floats: Vec::new(),
            last_top: f32::NEG_INFINITY,
        }
    }

    /// Returns `true` if no float has been placed.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.floats.is_empty()
    }

    /// The placed floats.
    #[must_use]
    pub fn floats(&self) -> &[PlacedFloat] {
        &self.floats
    }

    /// Lowest margin-box bottom of all floats (`None` if empty).
    #[must_use]
    pub fn bottom(&self) -> Option<f32> {
        self.floats.iter().map(|f| f.rect.bottom()).reduce(f32::max)
    }

    /// The horizontal band `[left, right]` free of floats for a line box
    /// occupying `[y, y + height)`, given the containing block's content
    /// edges. Left floats push `left` right; right floats pull `right` left.
    #[must_use]
    pub fn edges(&self, y: f32, height: f32, cb_left: f32, cb_right: f32) -> (f32, f32) {
        let y1 = y + height.max(1.0);
        let mut left = cb_left;
        let mut right = cb_right;
        for f in &self.floats {
            if f.wrap.y() < y1 && f.wrap.bottom() > y && f.wrap.height() > 0.0 {
                match f.side {
                    Float::Left => left = left.max(f.wrap.right()),
                    Float::Right => right = right.min(f.wrap.x()),
                    Float::None => {}
                }
            }
        }
        (left, right.max(left))
    }

    /// The `y` below which a box with `clear` may start (`None` if nothing
    /// to clear).
    #[must_use]
    pub fn clearance(&self, clear: Clear) -> Option<f32> {
        self.floats
            .iter()
            .filter(|f| match clear {
                Clear::None => false,
                Clear::Left => f.side == Float::Left,
                Clear::Right => f.side == Float::Right,
                Clear::Both => true,
            })
            .map(|f| f.rect.bottom())
            .reduce(f32::max)
    }

    /// The next float bottom strictly below `y` (the next `y` at which the
    /// available width can change), if any.
    #[must_use]
    pub fn next_bottom_after(&self, y: f32) -> Option<f32> {
        self.floats
            .iter()
            .map(|f| f.rect.bottom())
            .filter(|b| *b > y + 0.01)
            .reduce(f32::min)
    }

    /// Finds the position for a float of `size` (margin box) on `side`, no
    /// higher than `y_min`, inside the containing block's content edges.
    /// Returns the margin-box origin and records the float.
    pub fn place(
        &mut self,
        side: Float,
        size: ve_core::Size,
        y_min: f32,
        cb_left: f32,
        cb_right: f32,
    ) -> Point {
        let mut y = y_min.max(self.last_top);
        let width = size.width;
        let height = size.height.max(0.0);
        // Candidate positions: the requested y, then every float bottom below it.
        let mut guard = 0;
        loop {
            let (left, right) = self.edges(y, height, cb_left, cb_right);
            let fits = right - left + 0.01 >= width || (left == cb_left && right == cb_right);
            if fits || guard > self.floats.len() + 1 {
                let x = match side {
                    Float::Right => right - width,
                    _ => left,
                };
                let origin = Point::new(x, y);
                let rect = Rect::new(x, y, width, height);
                self.floats.push(PlacedFloat {
                    rect,
                    wrap: rect,
                    side,
                });
                self.last_top = y;
                return origin;
            }
            match self.next_bottom_after(y) {
                Some(next) => y = next,
                None => {
                    // Nothing below: it goes at the current y regardless.
                    guard = usize::MAX - 1;
                }
            }
            guard += 1;
        }
    }

    /// Replaces the last placed float's wrap rectangle (`shape-outside`).
    pub fn set_last_wrap(&mut self, wrap: Rect) {
        if let Some(last) = self.floats.last_mut() {
            last.wrap = wrap;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ve_core::Size;

    #[test]
    fn places_and_reports_edges_and_clearance() {
        let mut ctx = FloatContext::new();
        let a = ctx.place(Float::Left, Size::new(100.0, 50.0), 0.0, 0.0, 400.0);
        assert_eq!(a, Point::new(0.0, 0.0));
        let b = ctx.place(Float::Left, Size::new(100.0, 30.0), 0.0, 0.0, 400.0);
        assert_eq!(b, Point::new(100.0, 0.0), "next to the first float");
        let c = ctx.place(Float::Right, Size::new(150.0, 20.0), 10.0, 0.0, 400.0);
        assert_eq!(c, Point::new(250.0, 10.0));
        // Too wide for the remaining band at y=10 -> drops below the right float.
        let d = ctx.place(Float::Right, Size::new(120.0, 20.0), 10.0, 0.0, 400.0);
        assert_eq!(d, Point::new(280.0, 30.0));
        // The band [5, 15) overlaps the right float placed at y = 10.
        assert_eq!(ctx.edges(5.0, 10.0, 0.0, 400.0), (200.0, 250.0));
        assert_eq!(ctx.edges(0.0, 10.0, 0.0, 400.0), (200.0, 400.0));
        assert_eq!(ctx.edges(15.0, 10.0, 0.0, 400.0), (200.0, 250.0));
        assert_eq!(ctx.edges(40.0, 10.0, 0.0, 400.0), (100.0, 280.0));
        assert_eq!(ctx.edges(60.0, 10.0, 0.0, 400.0), (0.0, 400.0));
        assert_eq!(ctx.clearance(Clear::Left), Some(50.0));
        assert_eq!(ctx.clearance(Clear::Right), Some(50.0));
        assert_eq!(ctx.clearance(Clear::None), None);
        assert_eq!(ctx.bottom(), Some(50.0));
        assert_eq!(ctx.next_bottom_after(0.0), Some(30.0));
    }

    #[test]
    fn shape_outside_wrap_narrows_edges() {
        let mut ctx = FloatContext::new();
        ctx.place(Float::Left, Size::new(100.0, 50.0), 0.0, 0.0, 400.0);
        ctx.set_last_wrap(Rect::new(0.0, 0.0, 80.0, 50.0));
        assert_eq!(ctx.edges(0.0, 10.0, 0.0, 400.0), (80.0, 400.0));
        assert_eq!(ctx.floats()[0].rect.width(), 100.0, "margin box stays");
    }
}
