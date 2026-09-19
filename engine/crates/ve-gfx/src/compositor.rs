//! Layers and compositing.
//!
//! A [`Layer`] is a display list positioned in root space with a scroll
//! offset and an opacity. [`Compositor::composite`] flattens all layers into
//! a single [`DisplayList`] by clipping each layer to its bounds, translating
//! its content by the scroll offset, and wrapping it in an opacity group when
//! needed. The output is what a [`crate::Renderer`] draws each frame.

use ve_core::{Point, Rect, Size};

use crate::display_list::{DisplayItem, DisplayList};

/// Identifies a layer.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub struct LayerId(pub u32);

/// A positioned, scrollable, translucent display list.
#[derive(Clone, Debug)]
pub struct Layer {
    /// Identifier.
    pub id: LayerId,
    /// Bounds in root space; content is clipped to this rectangle.
    pub rect: Rect,
    /// Scroll offset: content is drawn shifted by `-offset`.
    pub scroll: Point,
    /// Opacity in `0..=1`.
    pub opacity: f32,
    /// Compositor-only translation, applied after scroll (no relayout).
    pub translate: Point,
    /// Content in layer-local coordinates (origin = `rect.origin`).
    pub content: DisplayList,
}

impl Layer {
    /// Largest scroll offset that still shows content.
    #[must_use]
    pub fn max_scroll(&self) -> Point {
        let bounds = self.content.bounds();
        Point::new(
            (bounds.right() - self.rect.width()).max(0.0),
            (bounds.bottom() - self.rect.height()).max(0.0),
        )
    }
}

/// Owns layers in back-to-front order.
#[derive(Clone, Debug, Default)]
pub struct Compositor {
    layers: Vec<Layer>,
    next_id: u32,
    /// True when a layer was added, scrolled, or had its content replaced
    /// since the last [`Self::take_damage`]. Direct presentation skips a
    /// full scene rebuild when this is false.
    damaged: bool,
}

impl Compositor {
    /// Creates an empty compositor.
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Adds a layer on top of the existing ones.
    pub fn add_layer(&mut self, rect: Rect, content: DisplayList) -> LayerId {
        self.next_id += 1;
        let id = LayerId(self.next_id);
        self.layers.push(Layer {
            id,
            rect,
            scroll: Point::ZERO,
            opacity: 1.0,
            translate: Point::ZERO,
            content,
        });
        self.damaged = true;
        id
    }

    /// Whether layers changed since the last present.
    #[must_use]
    pub fn is_damaged(&self) -> bool {
        self.damaged
    }

    /// Marks the compositor dirty so the next present rebuilds the scene.
    pub fn mark_damaged(&mut self) {
        self.damaged = true;
    }

    /// Clears the damage bit (after a successful present).
    pub fn take_damage(&mut self) -> bool {
        std::mem::take(&mut self.damaged)
    }

    /// Looks up a layer.
    #[must_use]
    pub fn layer(&self, id: LayerId) -> Option<&Layer> {
        self.layers.iter().find(|l| l.id == id)
    }

    /// Looks up a layer mutably.
    pub fn layer_mut(&mut self, id: LayerId) -> Option<&mut Layer> {
        self.layers.iter_mut().find(|l| l.id == id)
    }

    /// Removes a layer. Returns `true` if it existed.
    pub fn remove_layer(&mut self, id: LayerId) -> bool {
        let before = self.layers.len();
        self.layers.retain(|l| l.id != id);
        let removed = self.layers.len() != before;
        if removed {
            self.damaged = true;
        }
        removed
    }

    /// Scrolls a layer by `(dx, dy)`, clamped to its content. Returns the new offset.
    pub fn scroll_by(&mut self, id: LayerId, dx: f32, dy: f32) -> Option<Point> {
        let scroll = {
            let layer = self.layer_mut(id)?;
            let max = layer.max_scroll();
            layer.scroll = Point::new(
                (layer.scroll.x + dx).clamp(0.0, max.x),
                (layer.scroll.y + dy).clamp(0.0, max.y),
            );
            layer.scroll
        };
        self.damaged = true;
        Some(scroll)
    }

    /// Replaces a layer's content (e.g. after relayout), keeping its scroll
    /// offset clamped to the new content.
    pub fn set_content(&mut self, id: LayerId, content: DisplayList) -> bool {
        {
            let Some(layer) = self.layer_mut(id) else {
                return false;
            };
            layer.content = content;
            let max = layer.max_scroll();
            layer.scroll = Point::new(layer.scroll.x.min(max.x), layer.scroll.y.min(max.y));
        }
        self.damaged = true;
        true
    }

    /// Layers in paint order.
    #[must_use]
    pub fn layers(&self) -> &[Layer] {
        &self.layers
    }

    /// Compositor-only animation: lerp opacity from `from` to `to` at `t` in `0..=1`.
    pub fn animate_opacity_at(&mut self, id: LayerId, from: f32, to: f32, t: f32) -> bool {
        self.animate_opacity(id, from + (to - from) * t.clamp(0.0, 1.0))
    }

    /// Compositor-only animation: change opacity without relayout.
    pub fn animate_opacity(&mut self, id: LayerId, opacity: f32) -> bool {
        let Some(layer) = self.layer_mut(id) else {
            return false;
        };
        layer.opacity = opacity.clamp(0.0, 1.0);
        self.damaged = true;
        true
    }

    /// Compositor-only animation: lerp translation from `from` to `to` at `t` in `0..=1`.
    pub fn animate_translate_at(&mut self, id: LayerId, from: Point, to: Point, t: f32) -> bool {
        let t = t.clamp(0.0, 1.0);
        self.animate_translate(
            id,
            Point::new(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t),
        )
    }

    /// Compositor-only animation: translate a layer without relayout.
    pub fn animate_translate(&mut self, id: LayerId, offset: Point) -> bool {
        let Some(layer) = self.layer_mut(id) else {
            return false;
        };
        layer.translate = offset;
        self.damaged = true;
        true
    }

    /// Flattens all layers into one root-space display list for a surface of `size`.
    #[must_use]
    pub fn composite(&self, size: Size) -> DisplayList {
        let mut out = DisplayList::new(size);
        for layer in &self.layers {
            if layer.opacity <= 0.0 {
                continue;
            }
            let grouped = layer.opacity < 1.0;
            if grouped {
                out.push(DisplayItem::PushOpacity(layer.opacity));
            }
            out.push(DisplayItem::PushClip(layer.rect));
            out.append_translated(
                &layer.content,
                layer.rect.x() - layer.scroll.x + layer.translate.x,
                layer.rect.y() - layer.scroll.y + layer.translate.y,
            );
            out.push(DisplayItem::PopClip);
            if grouped {
                out.push(DisplayItem::PopOpacity);
            }
        }
        out
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ve_style::Rgba;

    #[test]
    fn composite_clips_translates_and_groups_layers() {
        let mut content = DisplayList::new(Size::new(100.0, 1000.0));
        content.push(DisplayItem::Rect {
            rect: Rect::new(0.0, 500.0, 100.0, 10.0),
            color: Rgba::BLACK,
        });
        let mut comp = Compositor::new();
        let id = comp.add_layer(Rect::new(10.0, 20.0, 100.0, 100.0), content);
        comp.layer_mut(id).unwrap().opacity = 0.5;

        assert_eq!(
            comp.scroll_by(id, 0.0, 5000.0),
            Some(Point::new(0.0, 410.0)),
            "clamped to content"
        );
        assert!(comp.take_damage(), "scroll marks damage");
        assert!(!comp.take_damage(), "damage is consumed");
        comp.mark_damaged();
        assert!(comp.is_damaged());
        assert!(comp.take_damage());
        let out = comp.composite(Size::new(200.0, 200.0));
        let items = out.items();
        assert!(matches!(items[0], DisplayItem::PushOpacity(o) if (o - 0.5).abs() < f32::EPSILON));
        assert_eq!(
            items[1],
            DisplayItem::PushClip(Rect::new(10.0, 20.0, 100.0, 100.0))
        );
        assert_eq!(
            items[2],
            DisplayItem::Rect {
                rect: Rect::new(10.0, 110.0, 100.0, 10.0),
                color: Rgba::BLACK
            }
        );
        assert_eq!(items[3], DisplayItem::PopClip);
        assert_eq!(items[4], DisplayItem::PopOpacity);
        assert!(comp.animate_opacity(id, 0.25));
        assert!((comp.layer(id).unwrap().opacity - 0.25).abs() < f32::EPSILON);
        assert!(comp.animate_opacity_at(id, 0.0, 1.0, 0.4));
        assert!((comp.layer(id).unwrap().opacity - 0.4).abs() < f32::EPSILON);
        assert!(comp.animate_translate_at(id, Point::ZERO, Point::new(20.0, 0.0), 0.5));
        assert!((comp.layer(id).unwrap().translate.x - 10.0).abs() < f32::EPSILON);
        assert!(comp.take_damage());
        assert!(comp.remove_layer(id));
        assert!(comp.composite(Size::ZERO).is_empty());
    }
}
