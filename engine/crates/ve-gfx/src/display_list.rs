//! Retained drawing commands.

use std::collections::HashMap;

use ve_core::{Edges, NodeId, Point, Rect, Size};
use ve_layout::LayoutTree;
use ve_style::{BackgroundImage, Filter, FontFamily, FontStyle, FontWeight, Rgba, StyleTree, TransformOp};

use crate::image::ImageHandle;

/// A run of text to draw with one style.
#[derive(Clone, Debug, PartialEq)]
pub struct TextRun {
    /// Baseline start point.
    pub origin: Point,
    /// The text.
    pub text: String,
    /// Font size in pixels.
    pub size: f32,
    /// Fill colour.
    pub color: Rgba,
    /// Weight.
    pub weight: FontWeight,
    /// Style.
    pub style: FontStyle,
    /// Family list, most preferred first.
    pub family: Vec<FontFamily>,
}

/// One drawing command. Coordinates are in the list's own space (viewport
/// pixels for a page list; layer space inside the compositor).
#[derive(Clone, Debug, PartialEq)]
pub enum DisplayItem {
    /// Filled rectangle.
    Rect {
        /// Bounds.
        rect: Rect,
        /// Fill colour.
        color: Rgba,
    },
    /// Rectangle outline with per-side widths (drawn inside `rect`).
    Border {
        /// Border-box bounds.
        rect: Rect,
        /// Side widths.
        widths: Edges,
        /// Colour (single colour for all sides in M0).
        color: Rgba,
    },
    /// Text.
    Text(TextRun),
    /// Decoded image stretched into `rect`.
    Image {
        /// Destination bounds.
        rect: Rect,
        /// The image.
        handle: ImageHandle,
        /// Optional source rectangle in image pixels. `None` uses the full image.
        src: Option<Rect>,
    },
    /// Linear gradient fill.
    LinearGradient {
        /// Destination bounds.
        rect: Rect,
        /// Start point in list space.
        start: Point,
        /// End point in list space.
        end: Point,
        /// Colour stops as (offset 0–1, colour).
        stops: Vec<(f32, Rgba)>,
    },
    /// Blur the pixels already in `rect` (filter: blur).
    FilterBlur {
        /// Region to blur.
        rect: Rect,
        /// Blur radius in CSS pixels.
        radius: f32,
    },
    /// Everything until the matching [`DisplayItem::PopClip`] is clipped to `rect`.
    PushClip(Rect),
    /// Ends a clip.
    PopClip,
    /// Everything until the matching [`DisplayItem::PopOpacity`] is drawn with this alpha.
    PushOpacity(f32),
    /// Ends an opacity group.
    PopOpacity,
    /// Clip to a rounded rectangle until [`DisplayItem::PopClip`].
    RoundedClip {
        /// Bounds.
        rect: Rect,
        /// Corner radius in CSS pixels (uniform).
        radius: f32,
    },
    /// Translate subsequent items until [`DisplayItem::PopTransform`].
    PushTransform {
        /// X translation.
        tx: f32,
        /// Y translation.
        ty: f32,
    },
    /// Ends a transform group.
    PopTransform,
    /// Drop shadow behind a rectangle.
    BoxShadow {
        /// Box bounds.
        rect: Rect,
        /// Offset.
        dx: f32,
        /// Offset.
        dy: f32,
        /// Blur radius.
        blur: f32,
        /// Shadow colour.
        color: Rgba,
    },
}

impl DisplayItem {
    /// Bounds of geometric items (`None` for stack operations).
    #[must_use]
    pub fn bounds(&self) -> Option<Rect> {
        match self {
            Self::Rect { rect, .. }
            | Self::Border { rect, .. }
            | Self::Image { rect, .. }
            | Self::LinearGradient { rect, .. }
            | Self::FilterBlur { rect, .. }
            | Self::PushClip(rect)
            | Self::RoundedClip { rect, .. }
            | Self::BoxShadow { rect, .. } => Some(*rect),
            Self::Text(run) => Some(Rect::new(
                run.origin.x,
                run.origin.y - run.size,
                run.text.chars().count() as f32 * run.size * 0.5,
                run.size * 1.2,
            )),
            Self::PopClip
            | Self::PushOpacity(_)
            | Self::PopOpacity
            | Self::PushTransform { .. }
            | Self::PopTransform => None,
        }
    }

    /// Returns the item moved by `(dx, dy)`.
    #[must_use]
    pub fn translated(&self, dx: f32, dy: f32) -> Self {
        match self {
            Self::Rect { rect, color } => Self::Rect {
                rect: rect.translate(dx, dy),
                color: *color,
            },
            Self::Border {
                rect,
                widths,
                color,
            } => Self::Border {
                rect: rect.translate(dx, dy),
                widths: *widths,
                color: *color,
            },
            Self::Text(run) => Self::Text(TextRun {
                origin: run.origin.translate(dx, dy),
                ..run.clone()
            }),
            Self::Image { rect, handle, src } => Self::Image {
                rect: rect.translate(dx, dy),
                handle: *handle,
                src: *src,
            },
            Self::LinearGradient {
                rect,
                start,
                end,
                stops,
            } => Self::LinearGradient {
                rect: rect.translate(dx, dy),
                start: start.translate(dx, dy),
                end: end.translate(dx, dy),
                stops: stops.clone(),
            },
            Self::FilterBlur { rect, radius } => Self::FilterBlur {
                rect: rect.translate(dx, dy),
                radius: *radius,
            },
            Self::PushClip(rect) => Self::PushClip(rect.translate(dx, dy)),
            Self::RoundedClip { rect, radius } => Self::RoundedClip {
                rect: rect.translate(dx, dy),
                radius: *radius,
            },
            Self::BoxShadow {
                rect,
                dx: sdx,
                dy: sdy,
                blur,
                color,
            } => Self::BoxShadow {
                rect: rect.translate(dx, dy),
                dx: *sdx,
                dy: *sdy,
                blur: *blur,
                color: *color,
            },
            Self::PushTransform { tx, ty } => Self::PushTransform {
                tx: *tx + dx,
                ty: *ty + dy,
            },
            other => other.clone(),
        }
    }
}

/// An ordered list of [`DisplayItem`]s.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct DisplayList {
    /// Nominal size of the surface this list paints.
    pub size: Size,
    items: Vec<DisplayItem>,
}

impl DisplayList {
    /// Creates an empty list for a surface of `size`.
    #[must_use]
    pub fn new(size: Size) -> Self {
        Self {
            size,
            items: Vec::new(),
        }
    }

    /// Appends an item.
    pub fn push(&mut self, item: DisplayItem) {
        self.items.push(item);
    }

    /// The items in paint order.
    #[must_use]
    pub fn items(&self) -> &[DisplayItem] {
        &self.items
    }

    /// Number of items.
    #[must_use]
    pub fn len(&self) -> usize {
        self.items.len()
    }

    /// Whether the list has no items.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.items.is_empty()
    }

    /// Union of all item bounds.
    #[must_use]
    pub fn bounds(&self) -> Rect {
        self.items
            .iter()
            .filter_map(DisplayItem::bounds)
            .fold(Rect::ZERO, |acc, r| acc.union(&r))
    }

    /// Appends every item of `other`, translated by `(dx, dy)`.
    pub fn append_translated(&mut self, other: &DisplayList, dx: f32, dy: f32) {
        self.items
            .extend(other.items.iter().map(|i| i.translated(dx, dy)));
    }

    /// Builds the display list for a laid-out page: canvas background, then
    /// for every box in paint order its background, borders, images and text.
    #[must_use]
    pub fn from_layout(layout: &LayoutTree, styles: &StyleTree) -> Self {
        Self::from_layout_with(layout, styles, &HashMap::new())
    }

    /// [`from_layout`] with decoded `<img>` pixels keyed by node.
    #[must_use]
    pub fn from_layout_with(
        layout: &LayoutTree,
        styles: &StyleTree,
        images: &HashMap<NodeId, ImageHandle>,
    ) -> Self {
        let span = ve_core::Stage::Paint.span();
        let _guard = span.enter();
        let mut list = Self::new(layout.viewport);
        // The canvas takes the root element's background, defaulting to white.
        let root_style = layout.root.node.map(|n| styles.style(n));
        let canvas = root_style
            .as_ref()
            .map(|s| s.background_color.resolve(s.color))
            .filter(|c| !c.is_transparent())
            .unwrap_or(Rgba::WHITE);
        list.push(DisplayItem::Rect {
            rect: Rect::new(0.0, 0.0, layout.viewport.width, layout.viewport.height),
            color: canvas,
        });

        for item in layout.paint_order() {
            let Some(node) = item.node else { continue };
            let style = styles.style(node);
            let clip = layout.clip_of(node);
            let faded = style.opacity < 1.0 - f32::EPSILON;
            let radius = style
                .border_top_left_radius
                .max(style.border_top_right_radius)
                .max(style.border_bottom_right_radius)
                .max(style.border_bottom_left_radius);
            if radius > 0.0 {
                list.push(DisplayItem::RoundedClip {
                    rect: item.rect,
                    radius,
                });
            } else if let Some(c) = clip {
                list.push(DisplayItem::PushClip(c));
            }
            let translate = style.transform.iter().find_map(|op| match op {
                TransformOp::Translate(x, y) => {
                    Some((x.resolve(item.rect.width()), y.resolve(item.rect.height())))
                }
                _ => None,
            });
            if let Some((tx, ty)) = translate {
                list.push(DisplayItem::PushTransform { tx, ty });
            }
            if faded {
                list.push(DisplayItem::PushOpacity(style.opacity.clamp(0.0, 1.0)));
            }
            if let Some(text) = &item.text {
                if style.visibility == ve_style::Visibility::Visible {
                    list.push(DisplayItem::Text(TextRun {
                        origin: Point::new(item.rect.x(), item.rect.y() + item.baseline),
                        text: text.clone(),
                        size: style.font_size,
                        color: style.color,
                        weight: style.font_weight,
                        style: style.font_style,
                        family: style.font_family.clone(),
                    }));
                }
            } else if !item.rect.is_empty() && style.visibility == ve_style::Visibility::Visible {
                if !style.box_shadow.is_none() {
                    list.push(DisplayItem::BoxShadow {
                        rect: item.rect,
                        dx: style.box_shadow.dx,
                        dy: style.box_shadow.dy,
                        blur: style.box_shadow.blur,
                        color: style.box_shadow.color,
                    });
                }
                // Skip the root box background: it was promoted to the canvas.
                if Some(node) != layout.root.node {
                    let bg = style.background_color.resolve(style.color);
                    if !bg.is_transparent() {
                        list.push(DisplayItem::Rect {
                            rect: item.rect,
                            color: bg,
                        });
                    }
                }
                if let BackgroundImage::LinearGradient(stops) = &style.background_image {
                    list.push(DisplayItem::LinearGradient {
                        rect: item.rect,
                        start: Point::new(item.rect.x(), item.rect.y()),
                        end: Point::new(item.rect.x(), item.rect.bottom()),
                        stops: stops.clone(),
                    });
                }
                if let Some(handle) = images.get(&node) {
                    list.push(DisplayItem::Image {
                        rect: item.rect,
                        handle: *handle,
                        src: None,
                    });
                }
                if let Filter::Blur(radius) = style.filter {
                    if radius > 0.0 {
                        list.push(DisplayItem::FilterBlur {
                            rect: item.rect,
                            radius,
                        });
                    }
                }
                let widths = Edges::new(
                    style.border_top_width,
                    style.border_right_width,
                    style.border_bottom_width,
                    style.border_left_width,
                );
                if widths.horizontal() > 0.0 || widths.vertical() > 0.0 {
                    let color = style.border_top_color.resolve(style.color);
                    if !color.is_transparent() {
                        list.push(DisplayItem::Border {
                            rect: item.rect,
                            widths,
                            color,
                        });
                    }
                }
            }
            if faded {
                list.push(DisplayItem::PopOpacity);
            }
            if translate.is_some() {
                list.push(DisplayItem::PopTransform);
            }
            if radius > 0.0 || clip.is_some() {
                list.push(DisplayItem::PopClip);
            }
        }
        list
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ve_style::StyleEngine;

    #[test]
    fn builds_backgrounds_borders_and_text_in_paint_order() {
        let html = "<style>body{margin:0;background:#eee} #a{width:100px;height:20px;background:red;border:2px solid blue}\
                    #b{position:absolute;top:0;left:0;width:10px;height:10px;background:green;z-index:1}</style>\
                    <div id=a>Hi</div><div id=b></div>";
        let doc = ve_html::parse_document(html).document;
        let mut engine = StyleEngine::new();
        engine.add_document_styles(&doc);
        let styles = engine.compute(&doc);
        let layout = ve_layout::LayoutEngine::new().layout(&doc, &styles, Size::new(200.0, 100.0));
        let list = DisplayList::from_layout(&layout, &styles);

        let rects: Vec<(Rect, Rgba)> = list
            .items()
            .iter()
            .filter_map(|i| match i {
                DisplayItem::Rect { rect, color } => Some((*rect, *color)),
                _ => None,
            })
            .collect();
        assert_eq!(
            rects[0],
            (Rect::new(0.0, 0.0, 200.0, 100.0), Rgba::WHITE),
            "canvas first"
        );
        assert!(
            rects
                .iter()
                .any(|(r, c)| *c == Rgba::rgb(238, 238, 238) && r.width() == 200.0),
            "body background"
        );
        let red = rects
            .iter()
            .position(|(_, c)| *c == Rgba::rgb(255, 0, 0))
            .unwrap();
        let green = rects
            .iter()
            .position(|(_, c)| *c == Rgba::rgb(0, 128, 0))
            .unwrap();
        assert!(
            red < green,
            "positioned z-index:1 box paints after in-flow content"
        );
        assert_eq!(rects[red].0.size, Size::new(104.0, 24.0), "border box");
        assert!(list.items().iter().any(|i| matches!(i, DisplayItem::Border { widths, color, .. } if widths.top == 2.0 && *color == Rgba::rgb(0, 0, 255))));
        assert!(
            list.items().iter().any(
                |i| matches!(i, DisplayItem::Text(run) if run.text == "Hi" && run.size == 16.0)
            )
        );
        assert_eq!(list.bounds().size, Size::new(200.0, 100.0));
        assert_eq!(
            list.items()[1]
                .translated(5.0, 5.0)
                .bounds()
                .unwrap()
                .origin,
            Point::new(5.0, 5.0)
        );
    }

    #[test]
    fn from_layout_emits_opacity_and_overflow_clips() {
        let html = "<style>body{margin:0} .clip{width:50px;height:50px;overflow:hidden;opacity:0.5} .clip div{width:200px;height:200px;background:red}</style>\
                    <div class=clip><div></div></div>";
        let doc = ve_html::parse_document(html).document;
        let mut engine = StyleEngine::new();
        engine.add_document_styles(&doc);
        let styles = engine.compute(&doc);
        let layout = ve_layout::LayoutEngine::new().layout(&doc, &styles, Size::new(200.0, 100.0));
        let list = DisplayList::from_layout(&layout, &styles);
        assert!(
            list.items()
                .iter()
                .any(|i| matches!(i, DisplayItem::PushOpacity(a) if (*a - 0.5).abs() < 0.01)),
            "opacity group missing: {:?}",
            list.items()
        );
        assert!(
            list.items()
                .iter()
                .any(|i| matches!(i, DisplayItem::PushClip(_))),
            "overflow clip missing"
        );
    }

    #[test]
    fn from_layout_emits_box_shadow() {
        let html = "<style>body{margin:0} #s{width:40px;height:20px;background:red;box-shadow:2px 3px 4px black}</style>\
                    <div id=s></div>";
        let doc = ve_html::parse_document(html).document;
        let mut engine = StyleEngine::new();
        engine.add_document_styles(&doc);
        let styles = engine.compute(&doc);
        let layout = ve_layout::LayoutEngine::new().layout(&doc, &styles, Size::new(200.0, 100.0));
        let list = DisplayList::from_layout(&layout, &styles);
        assert!(
            list.items().iter().any(|i| matches!(
                i,
                DisplayItem::BoxShadow {
                    dx,
                    dy,
                    blur,
                    color,
                    ..
                } if (*dx - 2.0).abs() < f32::EPSILON
                    && (*dy - 3.0).abs() < f32::EPSILON
                    && (*blur - 4.0).abs() < f32::EPSILON
                    && *color == Rgba::BLACK
            )),
            "box-shadow missing: {:?}",
            list.items()
        );
    }

    #[test]
    fn from_layout_emits_linear_gradient_and_filter_blur() {
        let html = "<style>body{margin:0} #g{width:40px;height:20px;background-image:linear-gradient(red, blue);filter:blur(2px)}</style>\
                    <div id=g></div>";
        let doc = ve_html::parse_document(html).document;
        let mut engine = StyleEngine::new();
        engine.add_document_styles(&doc);
        let styles = engine.compute(&doc);
        let layout = ve_layout::LayoutEngine::new().layout(&doc, &styles, Size::new(200.0, 100.0));
        let list = DisplayList::from_layout(&layout, &styles);
        assert!(
            list.items()
                .iter()
                .any(|i| matches!(i, DisplayItem::LinearGradient { stops, .. } if stops.len() >= 2)),
            "linear-gradient missing: {:?}",
            list.items()
        );
        assert!(
            list.items()
                .iter()
                .any(|i| matches!(i, DisplayItem::FilterBlur { radius, .. } if *radius >= 2.0)),
            "filter blur missing: {:?}",
            list.items()
        );
    }
}
