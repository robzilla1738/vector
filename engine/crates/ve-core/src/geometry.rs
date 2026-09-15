//! Device-independent pixel geometry shared across the engine.
//!
//! All values are `f32` CSS pixels. The coordinate system has its origin at
//! the top-left of the viewport with `y` growing downwards, matching CSS.

use serde::{Deserialize, Serialize};

/// A 2D point.
#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct Point {
    /// Horizontal coordinate.
    pub x: f32,
    /// Vertical coordinate.
    pub y: f32,
}

impl Point {
    /// The origin `(0, 0)`.
    pub const ZERO: Self = Self { x: 0.0, y: 0.0 };

    /// Creates a point.
    #[must_use]
    pub const fn new(x: f32, y: f32) -> Self {
        Self { x, y }
    }

    /// Returns this point translated by `(dx, dy)`.
    #[must_use]
    pub fn translate(self, dx: f32, dy: f32) -> Self {
        Self::new(self.x + dx, self.y + dy)
    }
}

/// A 2D size. Negative components are never produced by the engine.
#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct Size {
    /// Horizontal extent.
    pub width: f32,
    /// Vertical extent.
    pub height: f32,
}

impl Size {
    /// The empty size.
    pub const ZERO: Self = Self {
        width: 0.0,
        height: 0.0,
    };

    /// Creates a size.
    #[must_use]
    pub const fn new(width: f32, height: f32) -> Self {
        Self { width, height }
    }

    /// Returns `true` if either dimension is zero or negative.
    #[must_use]
    pub fn is_empty(self) -> bool {
        self.width <= 0.0 || self.height <= 0.0
    }
}

/// An axis-aligned rectangle described by its top-left corner and size.
#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct Rect {
    /// Top-left corner.
    pub origin: Point,
    /// Extent.
    pub size: Size,
}

impl Rect {
    /// The empty rectangle at the origin.
    pub const ZERO: Self = Self {
        origin: Point::ZERO,
        size: Size::ZERO,
    };

    /// Creates a rectangle from its top-left corner and dimensions.
    #[must_use]
    pub const fn new(x: f32, y: f32, width: f32, height: f32) -> Self {
        Self {
            origin: Point::new(x, y),
            size: Size::new(width, height),
        }
    }

    /// Creates a rectangle from two opposite corners (any order).
    #[must_use]
    pub fn from_points(a: Point, b: Point) -> Self {
        let x0 = a.x.min(b.x);
        let y0 = a.y.min(b.y);
        Self::new(x0, y0, a.x.max(b.x) - x0, a.y.max(b.y) - y0)
    }

    /// Left edge.
    #[must_use]
    pub fn x(&self) -> f32 {
        self.origin.x
    }

    /// Top edge.
    #[must_use]
    pub fn y(&self) -> f32 {
        self.origin.y
    }

    /// Width.
    #[must_use]
    pub fn width(&self) -> f32 {
        self.size.width
    }

    /// Height.
    #[must_use]
    pub fn height(&self) -> f32 {
        self.size.height
    }

    /// Right edge (`x + width`).
    #[must_use]
    pub fn right(&self) -> f32 {
        self.origin.x + self.size.width
    }

    /// Bottom edge (`y + height`).
    #[must_use]
    pub fn bottom(&self) -> f32 {
        self.origin.y + self.size.height
    }

    /// Centre point.
    #[must_use]
    pub fn center(&self) -> Point {
        Point::new(
            self.origin.x + self.size.width / 2.0,
            self.origin.y + self.size.height / 2.0,
        )
    }

    /// Returns `true` if the rectangle has no area.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.size.is_empty()
    }

    /// Returns `true` if `p` lies inside the rectangle. Edges on the left and
    /// top are inclusive, right and bottom exclusive, so adjacent boxes never
    /// both claim a point during hit testing.
    #[must_use]
    pub fn contains(&self, p: Point) -> bool {
        p.x >= self.origin.x && p.y >= self.origin.y && p.x < self.right() && p.y < self.bottom()
    }

    /// Returns `true` if the two rectangles overlap with positive area.
    #[must_use]
    pub fn intersects(&self, other: &Rect) -> bool {
        self.origin.x < other.right()
            && other.origin.x < self.right()
            && self.origin.y < other.bottom()
            && other.origin.y < self.bottom()
    }

    /// The overlapping region, or `None` if the rectangles do not intersect.
    #[must_use]
    pub fn intersection(&self, other: &Rect) -> Option<Rect> {
        if !self.intersects(other) {
            return None;
        }
        let x0 = self.origin.x.max(other.origin.x);
        let y0 = self.origin.y.max(other.origin.y);
        let x1 = self.right().min(other.right());
        let y1 = self.bottom().min(other.bottom());
        Some(Rect::new(x0, y0, x1 - x0, y1 - y0))
    }

    /// The smallest rectangle containing both inputs. Empty rectangles are
    /// treated as absent so that a running union can start from
    /// [`Rect::ZERO`].
    #[must_use]
    pub fn union(&self, other: &Rect) -> Rect {
        match (self.is_empty(), other.is_empty()) {
            (true, true) => Rect::ZERO,
            (true, false) => *other,
            (false, true) => *self,
            (false, false) => Rect::from_points(
                Point::new(
                    self.origin.x.min(other.origin.x),
                    self.origin.y.min(other.origin.y),
                ),
                Point::new(
                    self.right().max(other.right()),
                    self.bottom().max(other.bottom()),
                ),
            ),
        }
    }

    /// Returns this rectangle moved by `(dx, dy)`.
    #[must_use]
    pub fn translate(&self, dx: f32, dy: f32) -> Rect {
        Rect {
            origin: self.origin.translate(dx, dy),
            size: self.size,
        }
    }

    /// Shrinks the rectangle by the given edges (e.g. padding or border).
    /// The result is clamped so the size never becomes negative.
    #[must_use]
    pub fn inset(&self, edges: Edges) -> Rect {
        Rect::new(
            self.origin.x + edges.left,
            self.origin.y + edges.top,
            (self.size.width - edges.horizontal()).max(0.0),
            (self.size.height - edges.vertical()).max(0.0),
        )
    }

    /// Grows the rectangle by the given edges (inverse of [`Rect::inset`]).
    #[must_use]
    pub fn outset(&self, edges: Edges) -> Rect {
        Rect::new(
            self.origin.x - edges.left,
            self.origin.y - edges.top,
            self.size.width + edges.horizontal(),
            self.size.height + edges.vertical(),
        )
    }
}

/// Four per-side lengths (margins, padding, border widths, insets).
#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct Edges {
    /// Top edge.
    pub top: f32,
    /// Right edge.
    pub right: f32,
    /// Bottom edge.
    pub bottom: f32,
    /// Left edge.
    pub left: f32,
}

impl Edges {
    /// All edges zero.
    pub const ZERO: Self = Self {
        top: 0.0,
        right: 0.0,
        bottom: 0.0,
        left: 0.0,
    };

    /// Creates edges in CSS order (top, right, bottom, left).
    #[must_use]
    pub const fn new(top: f32, right: f32, bottom: f32, left: f32) -> Self {
        Self {
            top,
            right,
            bottom,
            left,
        }
    }

    /// Creates edges with the same value on every side.
    #[must_use]
    pub const fn uniform(v: f32) -> Self {
        Self::new(v, v, v, v)
    }

    /// `left + right`.
    #[must_use]
    pub fn horizontal(&self) -> f32 {
        self.left + self.right
    }

    /// `top + bottom`.
    #[must_use]
    pub fn vertical(&self) -> f32 {
        self.top + self.bottom
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rect_containment_and_intersection() {
        let a = Rect::new(0.0, 0.0, 10.0, 10.0);
        let b = Rect::new(5.0, 5.0, 10.0, 10.0);
        assert!(a.contains(Point::new(0.0, 0.0)));
        assert!(
            !a.contains(Point::new(10.0, 10.0)),
            "right/bottom edges are exclusive"
        );
        assert_eq!(a.intersection(&b), Some(Rect::new(5.0, 5.0, 5.0, 5.0)));
        assert_eq!(a.union(&b), Rect::new(0.0, 0.0, 15.0, 15.0));
        assert!(a.intersection(&Rect::new(20.0, 20.0, 1.0, 1.0)).is_none());
        assert_eq!(Rect::ZERO.union(&b), b);
    }

    #[test]
    fn inset_clamps_to_zero() {
        let r = Rect::new(0.0, 0.0, 10.0, 4.0).inset(Edges::uniform(3.0));
        assert_eq!(r, Rect::new(3.0, 3.0, 4.0, 0.0));
        assert_eq!(r.outset(Edges::uniform(3.0)).size, Size::new(10.0, 6.0));
    }
}
