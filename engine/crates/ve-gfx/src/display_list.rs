//! Retained drawing commands.

use std::collections::HashMap;

use ve_core::{Edges, NodeId, Point, Rect, Size};
use ve_layout::LayoutTree;
use ve_style::{
    BackgroundClip, BackgroundImage, BackgroundOrigin, BackgroundPosition, BackgroundRepeat,
    BackgroundSize, ComputedStyle, Filter, FontFamily, FontStyle, FontWeight, LengthPercentageAuto,
    ContentVisibility, ObjectFit, Rgba, StyleTree, TextDecorationLine, TransformOp,
};

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
        /// `background-size` / `object-fit`.
        size: BackgroundSize,
        /// `background-position`.
        position: BackgroundPosition,
        /// `background-repeat`.
        repeat: BackgroundRepeat,
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
    /// Affine subsequent items until [`DisplayItem::PopTransform`].
    /// `p' = (p.x * sx + tx, p.y * sy + ty)`.
    PushTransform {
        /// X translation (includes transform-origin compensation).
        tx: f32,
        /// Y translation (includes transform-origin compensation).
        ty: f32,
        /// X scale.
        sx: f32,
        /// Y scale.
        sy: f32,
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
            Self::Image {
                rect,
                handle,
                src,
                size,
                position,
                repeat,
            } => Self::Image {
                rect: rect.translate(dx, dy),
                handle: *handle,
                src: *src,
                size: *size,
                position: *position,
                repeat: *repeat,
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
            Self::PushTransform { tx, ty, sx, sy } => Self::PushTransform {
                tx: *tx + dx,
                ty: *ty + dy,
                sx: *sx,
                sy: *sy,
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
            let mut tx = 0.0f32;
            let mut ty = 0.0f32;
            let mut sx = 1.0f32;
            let mut sy = 1.0f32;
            let mut xformed = false;
            for op in style
                .transform
                .iter()
                .chain(style.translate.iter())
                .chain(style.scale.iter())
            {
                match op {
                    TransformOp::Translate(x, y) => {
                        tx += x.resolve(item.rect.width());
                        ty += y.resolve(item.rect.height());
                        xformed = true;
                    }
                    TransformOp::Scale(x, y) => {
                        sx *= *x;
                        sy *= *y;
                        xformed = true;
                    }
                }
            }
            if (style.zoom - 1.0).abs() > f32::EPSILON {
                sx *= style.zoom;
                sy *= style.zoom;
                xformed = true;
            }
            if xformed {
                if (sx - 1.0).abs() > f32::EPSILON || (sy - 1.0).abs() > f32::EPSILON {
                    let ox = item.rect.x() + style.transform_origin.x.resolve(item.rect.width());
                    let oy = item.rect.y() + style.transform_origin.y.resolve(item.rect.height());
                    tx += ox * (1.0 - sx);
                    ty += oy * (1.0 - sy);
                }
                list.push(DisplayItem::PushTransform { tx, ty, sx, sy });
            }
            if faded {
                list.push(DisplayItem::PushOpacity(style.opacity.clamp(0.0, 1.0)));
            }
            if let Some(text) = &item.text {
                if style.visibility == ve_style::Visibility::Visible
                    && style.content_visibility != ContentVisibility::Hidden
                {
                    if !style.text_shadow.is_none() {
                        list.push(DisplayItem::Text(TextRun {
                            origin: Point::new(
                                item.rect.x() + style.text_shadow.dx,
                                item.rect.y() + item.baseline + style.text_shadow.dy,
                            ),
                            text: text.clone(),
                            size: style.font_size,
                            color: style.text_shadow.color,
                            weight: style.font_weight,
                            style: style.font_style,
                            family: style.font_family.clone(),
                        }));
                    }
                    list.push(DisplayItem::Text(TextRun {
                        origin: Point::new(item.rect.x(), item.rect.y() + item.baseline),
                        text: text.clone(),
                        size: style.font_size,
                        color: style.color,
                        weight: style.font_weight,
                        style: style.font_style,
                        family: style.font_family.clone(),
                    }));
                    if style.text_decoration_line == TextDecorationLine::Underline {
                        list.push(DisplayItem::Rect {
                            rect: Rect::new(
                                item.rect.x(),
                                item.rect.y() + item.baseline + 1.0,
                                item.rect.width().max(1.0),
                                1.0,
                            ),
                            color: style.text_decoration_color.resolve(style.color),
                        });
                    }
                }
            } else if !item.rect.is_empty()
                && style.visibility == ve_style::Visibility::Visible
                && style.content_visibility != ContentVisibility::Hidden
            {
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
                            rect: background_clip_rect(item.rect, &style),
                            color: bg,
                        });
                    }
                }
                if let BackgroundImage::LinearGradient(stops) = &style.background_image {
                    let clip = background_clip_rect(item.rect, &style);
                    list.push(DisplayItem::LinearGradient {
                        rect: clip,
                        start: Point::new(clip.x(), clip.y()),
                        end: Point::new(clip.x(), clip.bottom()),
                        stops: stops.clone(),
                    });
                }
                if let Some(handle) = images.get(&node) {
                    let is_bg = matches!(style.background_image, BackgroundImage::Url(_));
                    let (size, position, repeat) = if is_bg {
                        (
                            style.background_size,
                            style.background_position,
                            style.background_repeat,
                        )
                    } else {
                        (
                            object_fit_size(style.object_fit),
                            style.object_position,
                            BackgroundRepeat::NoRepeat,
                        )
                    };
                    let dest = if is_bg {
                        background_origin_rect(item.rect, &style)
                    } else {
                        item.rect
                    };
                    let clip = if is_bg {
                        Some(background_clip_rect(item.rect, &style))
                    } else {
                        None
                    };
                    if let Some(c) = clip {
                        list.push(DisplayItem::PushClip(c));
                    }
                    list.push(DisplayItem::Image {
                        rect: dest,
                        handle: *handle,
                        src: None,
                        size,
                        position,
                        repeat,
                    });
                    if clip.is_some() {
                        list.push(DisplayItem::PopClip);
                    }
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
                if !style.outline_style.is_none() && style.outline_width > 0.0 {
                    let grow = style.outline_offset + style.outline_width;
                    let outline = Rect::new(
                        item.rect.x() - grow,
                        item.rect.y() - grow,
                        item.rect.width() + grow * 2.0,
                        item.rect.height() + grow * 2.0,
                    );
                    let color = style.outline_color.resolve(style.color);
                    if !color.is_transparent() {
                        list.push(DisplayItem::Border {
                            rect: outline,
                            widths: Edges::uniform(style.outline_width),
                            color,
                        });
                    }
                }
            }
            if faded {
                list.push(DisplayItem::PopOpacity);
            }
            if xformed {
                list.push(DisplayItem::PopTransform);
            }
            if radius > 0.0 || clip.is_some() {
                list.push(DisplayItem::PopClip);
            }
        }
        list
    }
}

fn background_origin_rect(rect: Rect, style: &ComputedStyle) -> Rect {
    let kind = match style.background_origin {
        BackgroundOrigin::BorderBox => BackgroundClip::BorderBox,
        BackgroundOrigin::PaddingBox => BackgroundClip::PaddingBox,
        BackgroundOrigin::ContentBox => BackgroundClip::ContentBox,
    };
    inset_box(rect, style, kind)
}

fn background_clip_rect(rect: Rect, style: &ComputedStyle) -> Rect {
    inset_box(rect, style, style.background_clip)
}

fn inset_box(rect: Rect, style: &ComputedStyle, kind: BackgroundClip) -> Rect {
    let w = rect.width();
    let (bt, br, bb, bl) = match kind {
        BackgroundClip::BorderBox => return rect,
        BackgroundClip::PaddingBox => (
            style.border_top(),
            style.border_right(),
            style.border_bottom(),
            style.border_left(),
        ),
        BackgroundClip::ContentBox => (
            style.border_top() + style.padding_top.resolve(w),
            style.border_right() + style.padding_right.resolve(w),
            style.border_bottom() + style.padding_bottom.resolve(w),
            style.border_left() + style.padding_left.resolve(w),
        ),
    };
    Rect::new(
        rect.x() + bl,
        rect.y() + bt,
        (rect.width() - bl - br).max(0.0),
        (rect.height() - bt - bb).max(0.0),
    )
}

fn object_fit_size(fit: ObjectFit) -> BackgroundSize {
    match fit {
        ObjectFit::Cover => BackgroundSize::Cover,
        ObjectFit::Contain | ObjectFit::ScaleDown => BackgroundSize::Contain,
        ObjectFit::None => BackgroundSize::Auto,
        ObjectFit::Fill => BackgroundSize::Size {
            width: LengthPercentageAuto::Percent(100.0),
            height: LengthPercentageAuto::Percent(100.0),
        },
    }
}

fn resolve_axis(value: LengthPercentageAuto, basis: f32, auto: f32) -> f32 {
    match value {
        LengthPercentageAuto::Auto => auto,
        LengthPercentageAuto::Px(px) => px,
        LengthPercentageAuto::Percent(p) => basis * p / 100.0,
        LengthPercentageAuto::Calc { px, percent } => px + basis * percent / 100.0,
    }
}

/// Destination and source rectangles for one background / object-fit tile.
#[must_use]
pub fn resolve_image_placement(
    box_rect: Rect,
    img_w: f32,
    img_h: f32,
    size: BackgroundSize,
    position: BackgroundPosition,
) -> (Rect, Rect) {
    let box_w = box_rect.width().max(0.001);
    let box_h = box_rect.height().max(0.001);
    let img_w = img_w.max(0.001);
    let img_h = img_h.max(0.001);
    let (tile_w, tile_h, src) = match size {
        BackgroundSize::Cover => {
            let scale = (box_w / img_w).max(box_h / img_h);
            let src_w = (box_w / scale).min(img_w);
            let src_h = (box_h / scale).min(img_h);
            let extra_x = (img_w - src_w).max(0.0);
            let extra_y = (img_h - src_h).max(0.0);
            (
                box_w,
                box_h,
                Rect::new(
                    position.x.resolve(extra_x),
                    position.y.resolve(extra_y),
                    src_w,
                    src_h,
                ),
            )
        }
        BackgroundSize::Contain => {
            let scale = (box_w / img_w).min(box_h / img_h);
            (
                img_w * scale,
                img_h * scale,
                Rect::new(0.0, 0.0, img_w, img_h),
            )
        }
        BackgroundSize::Auto => (img_w, img_h, Rect::new(0.0, 0.0, img_w, img_h)),
        BackgroundSize::Size { width, height } => {
            let tw = resolve_axis(width, box_w, img_w);
            let th = resolve_axis(height, box_h, img_h);
            (tw.max(0.001), th.max(0.001), Rect::new(0.0, 0.0, img_w, img_h))
        }
    };
    let dx = position.x.resolve((box_w - tile_w).max(0.0));
    let dy = position.y.resolve((box_h - tile_h).max(0.0));
    (
        Rect::new(box_rect.x() + dx, box_rect.y() + dy, tile_w, tile_h),
        src,
    )
}

/// Tile origins for `background-repeat` inside `box_rect`.
#[must_use]
pub fn background_tile_origins(
    box_rect: Rect,
    tile: Rect,
    repeat: BackgroundRepeat,
) -> Vec<Point> {
    let mut out = vec![Point::new(tile.x(), tile.y())];
    let tw = tile.width().max(0.001);
    let th = tile.height().max(0.001);
    let repeat_x = matches!(repeat, BackgroundRepeat::Repeat | BackgroundRepeat::RepeatX);
    let repeat_y = matches!(repeat, BackgroundRepeat::Repeat | BackgroundRepeat::RepeatY);
    if repeat_x {
        let mut x = tile.x() - tw;
        while x + tw > box_rect.x() {
            out.push(Point::new(x, tile.y()));
            x -= tw;
        }
        let mut x = tile.x() + tw;
        while x < box_rect.right() {
            out.push(Point::new(x, tile.y()));
            x += tw;
        }
    }
    if repeat_y {
        let row: Vec<Point> = out.clone();
        let mut y = tile.y() - th;
        while y + th > box_rect.y() {
            for p in &row {
                out.push(Point::new(p.x, y));
            }
            y -= th;
        }
        let mut y = tile.y() + th;
        while y < box_rect.bottom() {
            for p in &row {
                out.push(Point::new(p.x, y));
            }
            y += th;
        }
    }
    out
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
    fn from_layout_emits_outline_and_text_shadow() {
        let html = "<style>body{margin:0} #o{width:40px;height:20px;background:red;outline:2px solid blue;outline-offset:1px}\
                    #t{text-shadow:1px 2px black}</style>\
                    <div id=o></div><p id=t>Hi</p>";
        let doc = ve_html::parse_document(html).document;
        let mut engine = StyleEngine::new();
        engine.add_document_styles(&doc);
        let styles = engine.compute(&doc);
        let layout = ve_layout::LayoutEngine::new().layout(&doc, &styles, Size::new(200.0, 100.0));
        let list = DisplayList::from_layout(&layout, &styles);
        assert!(
            list.items().iter().any(|i| matches!(
                i,
                DisplayItem::Border { widths, color, .. }
                    if widths.top == 2.0 && *color == Rgba::rgb(0, 0, 255)
            )),
            "outline missing: {:?}",
            list.items()
        );
        assert!(
            list.items().iter().any(|i| matches!(
                i,
                DisplayItem::Text(run) if run.text == "Hi" && run.color == Rgba::BLACK
            )),
            "text-shadow missing: {:?}",
            list.items()
        );
    }

    #[test]
    fn from_layout_emits_text_underline() {
        let html = "<style>body{margin:0} #t{text-decoration:underline}</style><p id=t>Hi</p>";
        let doc = ve_html::parse_document(html).document;
        let mut engine = StyleEngine::new();
        engine.add_document_styles(&doc);
        let styles = engine.compute(&doc);
        let id = engine.select(&doc, "#t").unwrap()[0];
        assert_eq!(
            styles.style(id).text_decoration_line,
            TextDecorationLine::Underline
        );
        let layout = ve_layout::LayoutEngine::new().layout(&doc, &styles, Size::new(200.0, 100.0));
        let list = DisplayList::from_layout(&layout, &styles);
        assert!(
            list.items().iter().any(|i| matches!(i, DisplayItem::Rect { .. }))
                && list
                    .items()
                    .iter()
                    .any(|i| matches!(i, DisplayItem::Text(run) if run.text == "Hi")),
            "underline missing: {:?}",
            list.items()
        );
    }

    #[test]
    fn from_layout_applies_individual_translate() {
        let html = "<style>body{margin:0} #g{width:20px;height:10px;background:red;translate:8px 4px}</style>\
                    <div id=g></div>";
        let doc = ve_html::parse_document(html).document;
        let mut engine = StyleEngine::new();
        engine.add_document_styles(&doc);
        let styles = engine.compute(&doc);
        let id = engine.select(&doc, "#g").unwrap()[0];
        assert!(
            !styles.style(id).translate.is_empty(),
            "translate computed"
        );
        let layout = ve_layout::LayoutEngine::new().layout(&doc, &styles, Size::new(200.0, 100.0));
        let list = DisplayList::from_layout(&layout, &styles);
        assert!(
            list.items()
                .iter()
                .any(|i| matches!(i, DisplayItem::PushTransform { tx, ty, sx, sy } if (*tx - 8.0).abs() < 0.1 && (*ty - 4.0).abs() < 0.1 && (*sx - 1.0).abs() < f32::EPSILON && (*sy - 1.0).abs() < f32::EPSILON)),
            "individual translate missing: {:?}",
            list.items()
        );
    }

    #[test]
    fn from_layout_applies_individual_scale() {
        let html = "<style>body{margin:0} #g{width:20px;height:10px;background:red;scale:2;transform-origin:0 0}</style>\
                    <div id=g></div>";
        let doc = ve_html::parse_document(html).document;
        let mut engine = StyleEngine::new();
        engine.add_document_styles(&doc);
        let styles = engine.compute(&doc);
        let id = engine.select(&doc, "#g").unwrap()[0];
        assert!(!styles.style(id).scale.is_empty(), "scale computed");
        let layout = ve_layout::LayoutEngine::new().layout(&doc, &styles, Size::new(200.0, 100.0));
        let list = DisplayList::from_layout(&layout, &styles);
        assert!(
            list.items().iter().any(|i| matches!(
                i,
                DisplayItem::PushTransform { sx, sy, .. }
                    if (*sx - 2.0).abs() < 0.1 && (*sy - 2.0).abs() < 0.1
            )),
            "individual scale missing: {:?}",
            list.items()
        );
    }

    #[test]
    fn from_layout_applies_zoom_and_hides_content_visibility() {
        let html = "<style>body{margin:0} #z{width:10px;height:10px;background:red;zoom:2;transform-origin:0 0} #h{width:10px;height:10px;background:blue;content-visibility:hidden}</style>\
                    <div id=z></div><div id=h></div>";
        let doc = ve_html::parse_document(html).document;
        let mut engine = StyleEngine::new();
        engine.add_document_styles(&doc);
        let styles = engine.compute(&doc);
        let z = engine.select(&doc, "#z").unwrap()[0];
        let h = engine.select(&doc, "#h").unwrap()[0];
        assert!((styles.style(z).zoom - 2.0).abs() < f32::EPSILON);
        assert_eq!(
            styles.style(h).content_visibility,
            ContentVisibility::Hidden
        );
        let layout = ve_layout::LayoutEngine::new().layout(&doc, &styles, Size::new(200.0, 100.0));
        let list = DisplayList::from_layout(&layout, &styles);
        assert!(
            list.items().iter().any(|i| matches!(
                i,
                DisplayItem::PushTransform { sx, sy, .. }
                    if (*sx - 2.0).abs() < 0.1 && (*sy - 2.0).abs() < 0.1
            )),
            "zoom missing: {:?}",
            list.items()
        );
        let blues = list
            .items()
            .iter()
            .filter(|i| matches!(i, DisplayItem::Rect { color, .. } if *color == Rgba::rgb(0, 0, 255)))
            .count();
        assert_eq!(blues, 0, "hidden still painted: {:?}", list.items());
    }

    #[test]
    fn from_layout_uses_background_origin_content_box() {
        let html = "<style>body{margin:0} #g{width:40px;height:20px;padding:4px;border:2px solid black;background-image:url(\"https://a.test/x.png\");background-origin:content-box;background-repeat:no-repeat}</style>\
                    <div id=g></div>";
        let doc = ve_html::parse_document(html).document;
        let mut engine = StyleEngine::new();
        engine.add_document_styles(&doc);
        let styles = engine.compute(&doc);
        let id = engine.select(&doc, "#g").unwrap()[0];
        assert_eq!(
            styles.style(id).background_origin,
            BackgroundOrigin::ContentBox
        );
        let layout = ve_layout::LayoutEngine::new().layout(&doc, &styles, Size::new(200.0, 100.0));
        let mut images = HashMap::new();
        images.insert(id, ImageHandle(1));
        let list = DisplayList::from_layout_with(&layout, &styles, &images);
        assert!(
            list.items().iter().any(|i| matches!(
                i,
                DisplayItem::Image { rect, .. } if (rect.width() - 40.0).abs() < 0.5
            )),
            "origin content-box image missing: {:?}",
            list.items()
        );
    }

    #[test]
    fn from_layout_clips_background_to_content_box() {
        let html = "<style>body{margin:0} #g{width:40px;height:20px;padding:4px;border:2px solid black;background:red;background-clip:content-box}</style>\
                    <div id=g></div>";
        let doc = ve_html::parse_document(html).document;
        let mut engine = StyleEngine::new();
        engine.add_document_styles(&doc);
        let styles = engine.compute(&doc);
        let id = engine.select(&doc, "#g").unwrap()[0];
        assert_eq!(styles.style(id).background_clip, BackgroundClip::ContentBox);
        assert_eq!(styles.style(id).cursor, "auto");
        let layout = ve_layout::LayoutEngine::new().layout(&doc, &styles, Size::new(200.0, 100.0));
        let list = DisplayList::from_layout(&layout, &styles);
        let bg = list.items().iter().find_map(|i| match i {
            DisplayItem::Rect { rect, color } if *color == Rgba::rgb(255, 0, 0) => Some(*rect),
            _ => None,
        });
        let bg = bg.expect("content-box background");
        assert!(
            (bg.width() - 40.0).abs() < 0.5,
            "content width, got {}",
            bg.width()
        );
        assert!(
            (bg.height() - 20.0).abs() < 0.5,
            "content height, got {}",
            bg.height()
        );
    }

    #[test]
    fn from_layout_emits_background_size_cover() {
        let html = "<style>body{margin:0} #g{width:40px;height:20px;background-image:url(\"https://a.test/x.png\");background-size:cover;background-repeat:no-repeat;background-position:center}</style>\
                    <div id=g></div>";
        let doc = ve_html::parse_document(html).document;
        let mut engine = StyleEngine::new();
        engine.add_document_styles(&doc);
        let styles = engine.compute(&doc);
        let id = engine.select(&doc, "#g").unwrap()[0];
        assert_eq!(styles.style(id).background_size, BackgroundSize::Cover);
        assert_eq!(styles.style(id).background_repeat, BackgroundRepeat::NoRepeat);
        let layout = ve_layout::LayoutEngine::new().layout(&doc, &styles, Size::new(200.0, 100.0));
        let mut images = HashMap::new();
        images.insert(id, ImageHandle(1));
        let list = DisplayList::from_layout_with(&layout, &styles, &images);
        assert!(
            list.items().iter().any(|i| matches!(
                i,
                DisplayItem::Image {
                    size: BackgroundSize::Cover,
                    repeat: BackgroundRepeat::NoRepeat,
                    ..
                }
            )),
            "cover image missing: {:?}",
            list.items()
        );
        let (dest, src) = resolve_image_placement(
            Rect::new(0.0, 0.0, 40.0, 20.0),
            10.0,
            10.0,
            BackgroundSize::Cover,
            BackgroundPosition {
                x: ve_style::LengthPercentage::Percent(50.0),
                y: ve_style::LengthPercentage::Percent(50.0),
            },
        );
        assert!((dest.width() - 40.0).abs() < f32::EPSILON);
        assert!((src.height() - 5.0).abs() < f32::EPSILON);
        assert!((src.y() - 2.5).abs() < f32::EPSILON);
    }

    #[test]
    fn from_layout_emits_object_position() {
        let html = "<style>body{margin:0} img{display:block;width:40px;height:20px;object-fit:none;object-position:right bottom}</style>\
                    <img id=g>";
        let doc = ve_html::parse_document(html).document;
        let mut engine = StyleEngine::new();
        engine.add_document_styles(&doc);
        let styles = engine.compute(&doc);
        let id = engine.select(&doc, "#g").unwrap()[0];
        assert_eq!(
            styles.style(id).object_position.x,
            ve_style::LengthPercentage::Percent(100.0)
        );
        assert_eq!(
            styles.style(id).object_position.y,
            ve_style::LengthPercentage::Percent(100.0)
        );
        let layout = ve_layout::LayoutEngine::new().layout(&doc, &styles, Size::new(200.0, 100.0));
        let mut images = HashMap::new();
        images.insert(id, ImageHandle(1));
        let list = DisplayList::from_layout_with(&layout, &styles, &images);
        assert!(
            list.items().iter().any(|i| matches!(
                i,
                DisplayItem::Image {
                    position,
                    repeat: BackgroundRepeat::NoRepeat,
                    ..
                } if position.x == ve_style::LengthPercentage::Percent(100.0)
                    && position.y == ve_style::LengthPercentage::Percent(100.0)
            )),
            "object-position missing: {:?}",
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
