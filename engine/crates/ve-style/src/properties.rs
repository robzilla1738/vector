//! The property table: [`PropertyId`], [`SpecifiedValue`], value parsing,
//! shorthand expansion and the generated [`ComputedStyle`] struct.
//!
//! The table is a single macro invocation ([`property_table!`]) so that the
//! property enum, the computed-style struct, initial values, inheritance and
//! the specified→computed converters can never drift apart. Adding a longhand
//! is one line.
//!
//! The table covers the phase-1 (M1) property set of the architecture
//! document: everything needed to decide visibility, geometry and reading
//! order on static pages. Logical properties (`margin-inline-start`, …) are
//! aliased to their physical longhands assuming `horizontal-tb` / `ltr`.
//! `writing-mode` is parsed; `vertical-rl` stacking is applied in layout.

use std::collections::BTreeMap;

use cssparser::{Parser, Token};
use ve_core::Size;

use crate::values::{
    AlignItems, BorderCollapse, BorderStyle, BoxShadow, BoxSizing, CaptionSide, Clear, ClipPath,
    Color, Content, ContentItem, Direction, Display, FlexDirection, FlexWrap, Float, FontFamily,
    FontStyle, FontWeight, GridLine, JustifyContent, Keyword, Length, LengthContext,
    LengthPercentage, LengthPercentageAuto, LineHeight, ListStylePosition, ListStyleType, MaxSize,
    ObjectFit, Overflow, OverflowWrap, PointerEvents, Position, Rgba, SelfAlignment, TextAlign,
    TextDecorationLine, TextOverflow, TextTransform, TrackSize, TransformOp, UnicodeBidi,
    VerticalAlign, Visibility, WhiteSpace, WordBreak, WritingMode, ZIndex,
};

/// Custom property store: raw token text keyed by `--name`.
pub type CustomProperties = BTreeMap<String, String>;

/// A `calc()`-family expression, kept symbolic until computed-value time.
#[derive(Clone, Debug, PartialEq)]
pub enum CalcExpr {
    /// A unitless number.
    Number(f32),
    /// A length.
    Length(Length),
    /// A percentage (0–100).
    Percent(f32),
    /// `a + b + …` (subtraction is addition of a negated product).
    Sum(Vec<CalcExpr>),
    /// `a * b * …` (division is multiplication by a reciprocal number).
    Product(Vec<CalcExpr>),
    /// `min(a, b, …)`
    Min(Vec<CalcExpr>),
    /// `max(a, b, …)`
    Max(Vec<CalcExpr>),
    /// `clamp(min, val, max)`
    Clamp(Box<[CalcExpr; 3]>),
}

/// The value of an evaluated [`CalcExpr`].
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct CalcValue {
    /// Pixel part (or the number itself when `is_number`).
    pub px: f32,
    /// Percentage part (0–100).
    pub percent: f32,
    /// The expression is a plain `<number>`.
    pub is_number: bool,
}

impl CalcValue {
    fn number(n: f32) -> Self {
        Self {
            px: n,
            percent: 0.0,
            is_number: true,
        }
    }

    fn length(px: f32, percent: f32) -> Self {
        Self {
            px,
            percent,
            is_number: false,
        }
    }

    /// The pixel value if the result is a length with no percentage part.
    #[must_use]
    pub fn as_px(self) -> Option<f32> {
        (!self.is_number && self.percent == 0.0).then_some(self.px)
    }

    /// The numeric value if the result is a plain number.
    #[must_use]
    pub fn as_number(self) -> Option<f32> {
        self.is_number.then_some(self.px)
    }

    /// The result as a `<length-percentage>`.
    #[must_use]
    pub fn as_length_percentage(self) -> Option<LengthPercentage> {
        (!self.is_number).then(|| LengthPercentage::from_parts(self.px, self.percent))
    }
}

impl CalcExpr {
    /// Evaluates the expression. Percentages inside `min()`/`max()`/`clamp()`
    /// that are compared against lengths are resolved against
    /// `ctx.viewport.width` — an approximation, since the containing block is
    /// unknown at computed-value time. Returns `None` for type errors.
    #[must_use]
    pub fn evaluate(&self, ctx: &LengthContext) -> Option<CalcValue> {
        fn same_kind(values: &[CalcValue]) -> bool {
            values.windows(2).all(|w| w[0].is_number == w[1].is_number)
        }
        fn comparable(values: &[CalcValue], ctx: &LengthContext) -> Vec<f32> {
            let mixed = values.iter().any(|v| v.percent != 0.0)
                && values.iter().any(|v| v.px != 0.0 || v.percent == 0.0);
            values
                .iter()
                .map(|v| {
                    if v.is_number {
                        v.px
                    } else if mixed {
                        v.px + v.percent * ctx.viewport.width / 100.0
                    } else if v.percent != 0.0 {
                        v.percent
                    } else {
                        v.px
                    }
                })
                .collect()
        }
        fn rebuild(template: CalcValue, values: &[CalcValue], picked: f32) -> CalcValue {
            if template.is_number {
                CalcValue::number(picked)
            } else if values.iter().all(|v| v.px == 0.0 && v.percent != 0.0) {
                CalcValue::length(0.0, picked)
            } else {
                CalcValue::length(picked, 0.0)
            }
        }
        match self {
            Self::Number(n) => Some(CalcValue::number(*n)),
            Self::Length(l) => Some(CalcValue::length(l.to_px(ctx), 0.0)),
            Self::Percent(p) => Some(CalcValue::length(0.0, *p)),
            Self::Sum(terms) => {
                let values: Vec<CalcValue> = terms
                    .iter()
                    .map(|t| t.evaluate(ctx))
                    .collect::<Option<_>>()?;
                if !same_kind(&values) {
                    return None;
                }
                let first = *values.first()?;
                Some(values.iter().skip(1).fold(first, |acc, v| CalcValue {
                    px: acc.px + v.px,
                    percent: acc.percent + v.percent,
                    is_number: acc.is_number,
                }))
            }
            Self::Product(factors) => {
                let values: Vec<CalcValue> = factors
                    .iter()
                    .map(|t| t.evaluate(ctx))
                    .collect::<Option<_>>()?;
                let non_numbers = values.iter().filter(|v| !v.is_number).count();
                if non_numbers > 1 {
                    return None;
                }
                let scale: f32 = values
                    .iter()
                    .filter(|v| v.is_number)
                    .map(|v| v.px)
                    .product();
                Some(match values.iter().find(|v| !v.is_number) {
                    Some(len) => CalcValue::length(len.px * scale, len.percent * scale),
                    None => CalcValue::number(scale),
                })
            }
            Self::Min(args) | Self::Max(args) => {
                let values: Vec<CalcValue> = args
                    .iter()
                    .map(|t| t.evaluate(ctx))
                    .collect::<Option<_>>()?;
                if values.is_empty() || !same_kind(&values) {
                    return None;
                }
                let nums = comparable(&values, ctx);
                let picked = if matches!(self, Self::Min(_)) {
                    nums.iter().copied().fold(f32::INFINITY, f32::min)
                } else {
                    nums.iter().copied().fold(f32::NEG_INFINITY, f32::max)
                };
                Some(rebuild(values[0], &values, picked))
            }
            Self::Clamp(args) => {
                let values = [
                    args[0].evaluate(ctx)?,
                    args[1].evaluate(ctx)?,
                    args[2].evaluate(ctx)?,
                ];
                if !same_kind(&values) {
                    return None;
                }
                let nums = comparable(&values, ctx);
                let picked = nums[1].max(nums[0]).min(nums[2].max(nums[0]));
                Some(rebuild(values[0], &values, picked))
            }
        }
    }
}

/// A `transform` function as specified (lengths not yet computed).
#[derive(Clone, Debug, PartialEq)]
pub enum SpecifiedTransform {
    /// `translate(x[, y])` / `translateX` / `translateY`.
    Translate(SpecifiedValue, SpecifiedValue),
    /// `scale(x[, y])` / `scaleX` / `scaleY`.
    Scale(f32, f32),
}

/// A `box-shadow` as specified (lengths not yet computed).
#[derive(Clone, Debug, PartialEq)]
pub struct SpecifiedBoxShadow {
    /// Horizontal offset.
    pub dx: SpecifiedValue,
    /// Vertical offset.
    pub dy: SpecifiedValue,
    /// Blur radius.
    pub blur: SpecifiedValue,
    /// Shadow colour (`currentcolor` allowed).
    pub color: Color,
}

/// A parsed but not yet computed value.
#[derive(Clone, Debug, PartialEq)]
pub enum SpecifiedValue {
    /// `inherit`
    Inherit,
    /// `initial`
    Initial,
    /// `unset`
    Unset,
    /// `revert`: rolls back to the user-agent cascaded value.
    Revert,
    /// A value containing `var()` references; substituted at compute time.
    Var(String),
    /// Raw token text (custom properties).
    Raw(String),
    /// An identifier, lower-cased.
    Keyword(String),
    /// A length with unit.
    Length(Length),
    /// A percentage in `0..=100` (not a fraction).
    Percentage(f32),
    /// A unitless number.
    Number(f32),
    /// An integer.
    Integer(i32),
    /// A colour.
    Color(Color),
    /// A quoted string.
    Str(String),
    /// A font-family list.
    Family(Vec<FontFamily>),
    /// A grid track list.
    Tracks(Vec<TrackSize>),
    /// A `calc()` / `min()` / `max()` / `clamp()` expression.
    Calc(CalcExpr),
    /// A `content` list.
    Content(Vec<ContentItem>),
    /// A `transform` list (`none` is the empty list).
    Transform(Vec<SpecifiedTransform>),
    /// `clip-path: inset(top right bottom left)`.
    ClipInset(Box<[SpecifiedValue; 4]>),
    /// `box-shadow: <offset-x> <offset-y> <blur>? <color>?`.
    BoxShadow(Box<SpecifiedBoxShadow>),
    /// A grid line placement.
    GridLine(GridLine),
    /// A function or token the engine does not understand. Never accepted by
    /// any property; exists so shorthands can skip fidelity-only components.
    Unsupported,
}

impl SpecifiedValue {
    /// Returns `true` for the CSS-wide keywords.
    #[must_use]
    pub fn is_css_wide(&self) -> bool {
        matches!(
            self,
            Self::Inherit | Self::Initial | Self::Unset | Self::Revert
        )
    }

    fn keyword(&self) -> Option<&str> {
        match self {
            Self::Keyword(k) => Some(k),
            _ => None,
        }
    }

    fn is_numeric(&self) -> bool {
        matches!(self, Self::Number(_) | Self::Integer(_))
    }
}

/// Context-free facts needed to convert a specified value to a computed one.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct ConvertContext {
    /// The element's own font size (after `font-size` has been applied).
    pub font_size: f32,
    /// The parent's font size (basis for `font-size: 1.2em` / `%`).
    pub parent_font_size: f32,
    /// The parent's font weight (`bolder` / `lighter`).
    pub parent_font_weight: FontWeight,
    /// The parent's colour (`color: currentcolor`).
    pub parent_color: Rgba,
    /// Root element font size (`rem`).
    pub root_font_size: f32,
    /// Viewport size (`vw`, `vh`).
    pub viewport: Size,
}

impl ConvertContext {
    /// A context used only to *validate* values at parse time.
    pub const DUMMY: Self = Self {
        font_size: 16.0,
        parent_font_size: 16.0,
        parent_font_weight: FontWeight::NORMAL,
        parent_color: Rgba::BLACK,
        root_font_size: 16.0,
        viewport: Size {
            width: 1024.0,
            height: 768.0,
        },
    };

    fn lengths(&self) -> LengthContext {
        LengthContext {
            font_size: self.font_size,
            root_font_size: self.root_font_size,
            viewport: self.viewport,
        }
    }
}

/// How a property's value is tokenised before validation.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum ValueSyntax {
    /// One component value.
    Single,
    /// Comma separated list of family names.
    FamilyList,
    /// Space separated list of track sizes.
    TrackList,
    /// The `content` property.
    Content,
    /// The `transform` property.
    Transform,
    /// The `clip-path` property.
    ClipPath,
    /// `grid-*-start` / `grid-*-end`.
    GridLine,
    /// The `box-shadow` property.
    BoxShadow,
    /// Arbitrary token stream (custom properties).
    Raw,
}

/// Specified → computed converters. Each returns `None` if the value is not
/// valid for the property, which drops the declaration at parse time.
mod conv {
    use super::*;

    pub fn kw<T: Keyword>(v: &SpecifiedValue, _: &ConvertContext) -> Option<T> {
        T::from_keyword(v.keyword()?)
    }

    fn calc(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<CalcValue> {
        match v {
            SpecifiedValue::Calc(expr) => expr.evaluate(&ctx.lengths()),
            _ => None,
        }
    }

    pub fn length_px(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<f32> {
        match v {
            SpecifiedValue::Length(l) => Some(l.to_px(&ctx.lengths())),
            // Unitless zero is a valid `<length>`.
            SpecifiedValue::Number(n) if *n == 0.0 => Some(0.0),
            SpecifiedValue::Integer(0) => Some(0.0),
            SpecifiedValue::Calc(_) => calc(v, ctx)?.as_px(),
            _ => None,
        }
    }

    pub fn lp(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<LengthPercentage> {
        match v {
            SpecifiedValue::Percentage(p) => Some(LengthPercentage::Percent(*p)),
            SpecifiedValue::Calc(_) => calc(v, ctx)?.as_length_percentage(),
            _ => length_px(v, ctx).map(LengthPercentage::Px),
        }
    }

    /// `<length-percentage> | auto`, with `auto` mapped to zero (min-width/height).
    pub fn lp_auto_zero(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<LengthPercentage> {
        if matches!(
            v.keyword(),
            Some("auto" | "min-content" | "max-content" | "fit-content" | "stretch")
        ) {
            return Some(LengthPercentage::ZERO);
        }
        lp(v, ctx)
    }

    pub fn lpa(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<LengthPercentageAuto> {
        match v {
            SpecifiedValue::Keyword(k) if k == "auto" => Some(LengthPercentageAuto::Auto),
            SpecifiedValue::Percentage(p) => Some(LengthPercentageAuto::Percent(*p)),
            SpecifiedValue::Calc(_) => calc(v, ctx)?
                .as_length_percentage()
                .map(LengthPercentageAuto::from),
            _ => length_px(v, ctx).map(LengthPercentageAuto::Px),
        }
    }

    /// `width` / `height`: intrinsic sizing keywords compute to `auto`.
    pub fn size(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<LengthPercentageAuto> {
        if matches!(
            v.keyword(),
            Some("min-content" | "max-content" | "fit-content" | "stretch")
        ) {
            return Some(LengthPercentageAuto::Auto);
        }
        lpa(v, ctx)
    }

    pub fn flex_basis(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<LengthPercentageAuto> {
        if v.keyword() == Some("content") {
            return Some(LengthPercentageAuto::Auto);
        }
        size(v, ctx)
    }

    pub fn max_size(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<MaxSize> {
        match v {
            SpecifiedValue::Keyword(k)
                if matches!(
                    k.as_str(),
                    "none" | "min-content" | "max-content" | "fit-content" | "stretch"
                ) =>
            {
                Some(MaxSize::None)
            }
            SpecifiedValue::Percentage(p) => Some(MaxSize::Percent(*p)),
            SpecifiedValue::Calc(_) => match calc(v, ctx)?.as_length_percentage()? {
                LengthPercentage::Px(px) => Some(MaxSize::Px(px)),
                LengthPercentage::Percent(p) => Some(MaxSize::Percent(p)),
                LengthPercentage::Calc { px, percent } => Some(MaxSize::Calc { px, percent }),
            },
            _ => length_px(v, ctx).map(MaxSize::Px),
        }
    }

    pub fn border_width(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<f32> {
        match v.keyword() {
            Some("thin") => Some(1.0),
            Some("medium") => Some(3.0),
            Some("thick") => Some(5.0),
            Some(_) => None,
            None => length_px(v, ctx).filter(|px| *px >= 0.0),
        }
    }

    pub fn color(v: &SpecifiedValue, _: &ConvertContext) -> Option<Color> {
        match v {
            SpecifiedValue::Color(c) => Some(*c),
            SpecifiedValue::Keyword(k) => Rgba::from_name(k).map(Color::Rgba),
            _ => None,
        }
    }

    /// The `color` property itself: `currentcolor` means the inherited colour.
    pub fn color_rgba(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<Rgba> {
        color(v, ctx).map(|c| c.resolve(ctx.parent_color))
    }

    pub fn opacity(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<f32> {
        match v {
            SpecifiedValue::Number(n) => Some(n.clamp(0.0, 1.0)),
            SpecifiedValue::Integer(i) => Some((*i as f32).clamp(0.0, 1.0)),
            SpecifiedValue::Percentage(p) => Some((p / 100.0).clamp(0.0, 1.0)),
            SpecifiedValue::Calc(_) => calc(v, ctx)?.as_number().map(|n| n.clamp(0.0, 1.0)),
            _ => None,
        }
    }

    pub fn non_negative_number(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<f32> {
        match v {
            SpecifiedValue::Number(n) if *n >= 0.0 => Some(*n),
            SpecifiedValue::Integer(i) if *i >= 0 => Some(*i as f32),
            SpecifiedValue::Calc(_) => calc(v, ctx)?.as_number().filter(|n| *n >= 0.0),
            _ => None,
        }
    }

    pub fn integer(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<i32> {
        match v {
            SpecifiedValue::Integer(i) => Some(*i),
            SpecifiedValue::Calc(_) => calc(v, ctx)?.as_number().map(|n| n.round() as i32),
            _ => None,
        }
    }

    pub fn font_size(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<f32> {
        let parent = ctx.parent_font_size;
        let parent_ctx = LengthContext {
            font_size: parent,
            ..ctx.lengths()
        };
        let px = match v {
            SpecifiedValue::Length(l) => l.to_px(&parent_ctx),
            SpecifiedValue::Percentage(p) => parent * p / 100.0,
            SpecifiedValue::Number(n) if *n == 0.0 => 0.0,
            SpecifiedValue::Integer(0) => 0.0,
            SpecifiedValue::Calc(expr) => {
                let value = expr.evaluate(&parent_ctx)?;
                if value.is_number {
                    return None;
                }
                value.px + parent * value.percent / 100.0
            }
            SpecifiedValue::Keyword(k) => match k.as_str() {
                "xx-small" => 9.0,
                "x-small" => 10.0,
                "small" => 13.0,
                "medium" => 16.0,
                "large" => 18.0,
                "x-large" => 24.0,
                "xx-large" => 32.0,
                "xxx-large" => 48.0,
                "larger" => parent * 1.2,
                "smaller" => parent / 1.2,
                _ => return None,
            },
            _ => return None,
        };
        (px >= 0.0).then_some(px)
    }

    pub fn font_weight(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<FontWeight> {
        match v {
            SpecifiedValue::Number(n) if (1.0..=1000.0).contains(n) => Some(FontWeight(*n as u16)),
            SpecifiedValue::Integer(i) if (1..=1000).contains(i) => Some(FontWeight(*i as u16)),
            SpecifiedValue::Keyword(k) => match k.as_str() {
                "normal" => Some(FontWeight::NORMAL),
                "bold" => Some(FontWeight::BOLD),
                "bolder" => Some(ctx.parent_font_weight.bolder()),
                "lighter" => Some(ctx.parent_font_weight.lighter()),
                _ => None,
            },
            _ => None,
        }
    }

    pub fn line_height(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<LineHeight> {
        match v {
            SpecifiedValue::Keyword(k) if k == "normal" => Some(LineHeight::Normal),
            SpecifiedValue::Number(n) if *n >= 0.0 => Some(LineHeight::Number(*n)),
            SpecifiedValue::Integer(i) if *i >= 0 => Some(LineHeight::Number(*i as f32)),
            SpecifiedValue::Percentage(p) => Some(LineHeight::Px(ctx.font_size * p / 100.0)),
            SpecifiedValue::Length(l) => Some(LineHeight::Px(l.to_px(&ctx.lengths()))),
            SpecifiedValue::Calc(_) => {
                let value = calc(v, ctx)?;
                Some(if value.is_number {
                    LineHeight::Number(value.px.max(0.0))
                } else {
                    LineHeight::Px(value.px + ctx.font_size * value.percent / 100.0)
                })
            }
            _ => None,
        }
    }

    /// `letter-spacing`: `normal` computes to zero.
    pub fn spacing(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<f32> {
        if v.keyword() == Some("normal") {
            return Some(0.0);
        }
        length_px(v, ctx)
    }

    pub fn z_index(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<ZIndex> {
        match v {
            SpecifiedValue::Keyword(k) if k == "auto" => Some(ZIndex::Auto),
            _ => integer(v, ctx).map(ZIndex::Integer),
        }
    }

    pub fn family(v: &SpecifiedValue, _: &ConvertContext) -> Option<Vec<FontFamily>> {
        match v {
            SpecifiedValue::Family(f) if !f.is_empty() => Some(f.clone()),
            _ => None,
        }
    }

    pub fn tracks(v: &SpecifiedValue, _: &ConvertContext) -> Option<Vec<TrackSize>> {
        match v {
            SpecifiedValue::Tracks(t) => Some(t.clone()),
            SpecifiedValue::Keyword(k) if k == "none" => Some(Vec::new()),
            _ => None,
        }
    }

    pub fn grid_line(v: &SpecifiedValue, _: &ConvertContext) -> Option<GridLine> {
        match v {
            SpecifiedValue::GridLine(l) => Some(*l),
            SpecifiedValue::Keyword(k) if k == "auto" => Some(GridLine::Auto),
            SpecifiedValue::Integer(i) if *i != 0 => Some(GridLine::Line(*i)),
            _ => None,
        }
    }

    pub fn vertical_align(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<VerticalAlign> {
        match v {
            SpecifiedValue::Keyword(k) => VerticalAlign::from_keyword(k),
            SpecifiedValue::Percentage(p) => Some(VerticalAlign::Percent(*p)),
            _ => length_px(v, ctx).map(VerticalAlign::Length),
        }
    }

    pub fn list_style_type(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<ListStyleType> {
        match v {
            // `list-style-type: "-"` (string markers) render as a disc for geometry.
            SpecifiedValue::Str(_) => Some(ListStyleType::Disc),
            _ => kw(v, ctx),
        }
    }

    pub fn content(v: &SpecifiedValue, _: &ConvertContext) -> Option<Content> {
        match v {
            SpecifiedValue::Keyword(k) if k == "normal" => Some(Content::Normal),
            SpecifiedValue::Keyword(k) if k == "none" => Some(Content::None),
            SpecifiedValue::Str(s) => Some(Content::Items(vec![ContentItem::Text(s.clone())])),
            SpecifiedValue::Content(items) => Some(Content::Items(items.clone())),
            _ => None,
        }
    }

    pub fn transform(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<Vec<TransformOp>> {
        match v {
            SpecifiedValue::Keyword(k) if k == "none" => Some(Vec::new()),
            SpecifiedValue::Transform(ops) => ops
                .iter()
                .map(|op| match op {
                    SpecifiedTransform::Translate(x, y) => {
                        Some(TransformOp::Translate(lp(x, ctx)?, lp(y, ctx)?))
                    }
                    SpecifiedTransform::Scale(x, y) => Some(TransformOp::Scale(*x, *y)),
                })
                .collect(),
            _ => None,
        }
    }

    pub fn box_shadow(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<BoxShadow> {
        match v {
            SpecifiedValue::Keyword(k) if k == "none" => Some(BoxShadow::default()),
            SpecifiedValue::BoxShadow(s) => Some(BoxShadow {
                dx: length_px(&s.dx, ctx).unwrap_or(0.0),
                dy: length_px(&s.dy, ctx).unwrap_or(0.0),
                blur: length_px(&s.blur, ctx).unwrap_or(0.0).max(0.0),
                color: match s.color {
                    Color::Rgba(c) => c,
                    Color::CurrentColor => ctx.parent_color,
                },
            }),
            _ => None,
        }
    }

    pub fn clip_path(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<ClipPath> {
        match v {
            SpecifiedValue::Keyword(k) if k == "none" => Some(ClipPath::None),
            SpecifiedValue::ClipInset(sides) => Some(ClipPath::Inset {
                top: lp(&sides[0], ctx)?,
                right: lp(&sides[1], ctx)?,
                bottom: lp(&sides[2], ctx)?,
                left: lp(&sides[3], ctx)?,
            }),
            _ => None,
        }
    }
}

macro_rules! property_table {
    ($(
        $(#[$doc:meta])*
        $variant:ident : $css:literal => $field:ident : $ty:ty = $initial:expr,
            inherited = $inh:literal, syntax = $syntax:ident, convert = $conv:expr;
    )+) => {
        /// A longhand property known to the engine, or a custom property.
        #[derive(Clone, Debug, PartialEq, Eq, Hash)]
        pub enum PropertyId {
            $( $(#[$doc])* $variant, )+
            /// A `--custom` property (name kept case-sensitive, including dashes).
            Custom(String),
        }

        impl PropertyId {
            /// Every longhand in the table (excluding custom properties).
            pub const ALL: &'static [PropertyId] = &[ $( PropertyId::$variant, )+ ];

            /// Looks a property up by (ASCII case-insensitive) name. Logical
            /// properties map to their physical longhand (`horizontal-tb`,
            /// `ltr`); `text-decoration` maps to `text-decoration-line`.
            #[must_use]
            pub fn from_name(name: &str) -> Option<Self> {
                let lower = name.to_ascii_lowercase();
                match lower.as_str() {
                    $( $css => Some(Self::$variant), )+
                    "text-decoration" => Some(Self::TextDecorationLine),
                    "inline-size" => Some(Self::Width),
                    "block-size" => Some(Self::Height),
                    "min-inline-size" => Some(Self::MinWidth),
                    "min-block-size" => Some(Self::MinHeight),
                    "max-inline-size" => Some(Self::MaxWidth),
                    "max-block-size" => Some(Self::MaxHeight),
                    "margin-inline-start" => Some(Self::MarginLeft),
                    "margin-inline-end" => Some(Self::MarginRight),
                    "margin-block-start" => Some(Self::MarginTop),
                    "margin-block-end" => Some(Self::MarginBottom),
                    "padding-inline-start" => Some(Self::PaddingLeft),
                    "padding-inline-end" => Some(Self::PaddingRight),
                    "padding-block-start" => Some(Self::PaddingTop),
                    "padding-block-end" => Some(Self::PaddingBottom),
                    "inset-inline-start" => Some(Self::Left),
                    "inset-inline-end" => Some(Self::Right),
                    "inset-block-start" => Some(Self::Top),
                    "inset-block-end" => Some(Self::Bottom),
                    "border-inline-start-width" => Some(Self::BorderLeftWidth),
                    "border-inline-end-width" => Some(Self::BorderRightWidth),
                    "border-block-start-width" => Some(Self::BorderTopWidth),
                    "border-block-end-width" => Some(Self::BorderBottomWidth),
                    "border-inline-start-style" => Some(Self::BorderLeftStyle),
                    "border-inline-end-style" => Some(Self::BorderRightStyle),
                    "border-block-start-style" => Some(Self::BorderTopStyle),
                    "border-block-end-style" => Some(Self::BorderBottomStyle),
                    "border-inline-start-color" => Some(Self::BorderLeftColor),
                    "border-inline-end-color" => Some(Self::BorderRightColor),
                    "border-block-start-color" => Some(Self::BorderTopColor),
                    "border-block-end-color" => Some(Self::BorderBottomColor),
                    "overflow-inline" => Some(Self::OverflowX),
                    "overflow-block" => Some(Self::OverflowY),
                    "word-wrap" => Some(Self::OverflowWrap),
                    _ if lower.starts_with("--") && lower.len() > 2 => Some(Self::Custom(name.to_owned())),
                    _ => None,
                }
            }

            /// The canonical property name.
            #[must_use]
            pub fn name(&self) -> &str {
                match self {
                    $( Self::$variant => $css, )+
                    Self::Custom(n) => n.as_str(),
                }
            }

            /// Whether the property inherits by default.
            #[must_use]
            pub fn is_inherited(&self) -> bool {
                match self {
                    $( Self::$variant => $inh, )+
                    Self::Custom(_) => true,
                }
            }

            fn syntax(&self) -> ValueSyntax {
                match self {
                    $( Self::$variant => ValueSyntax::$syntax, )+
                    Self::Custom(_) => ValueSyntax::Raw,
                }
            }

            /// Returns `true` if `value` is acceptable for this property.
            #[must_use]
            pub fn accepts(&self, value: &SpecifiedValue) -> bool {
                if value.is_css_wide() || matches!(value, SpecifiedValue::Var(_)) {
                    return true;
                }
                match self {
                    $( Self::$variant => {
                        let f: fn(&SpecifiedValue, &ConvertContext) -> Option<$ty> = $conv;
                        f(value, &ConvertContext::DUMMY).is_some()
                    } )+
                    Self::Custom(_) => matches!(value, SpecifiedValue::Raw(_)),
                }
            }
        }

        /// The computed value of every property for one element.
        ///
        /// Lengths are in CSS pixels unless they depend on the containing block
        /// (then they stay [`LengthPercentage`]-ish). Text nodes share their
        /// parent's `ComputedStyle`.
        #[derive(Clone, Debug, PartialEq)]
        pub struct ComputedStyle {
            $( $(#[$doc])* pub $field: $ty, )+
            /// Custom property values (always inherited), raw token text keyed by `--name`.
            pub custom_properties: std::rc::Rc<CustomProperties>,
        }

        impl Default for ComputedStyle {
            fn default() -> Self {
                Self::initial()
            }
        }

        impl ComputedStyle {
            /// The initial value of every property (the style of the root's
            /// hypothetical parent).
            #[must_use]
            pub fn initial() -> Self {
                Self { $( $field: $initial, )+ custom_properties: Default::default() }
            }

            /// The style a child starts from: inherited properties copied from
            /// `parent`, everything else initial.
            #[must_use]
            pub fn inherited_from(parent: &Self) -> Self {
                let mut style = Self::initial();
                $( if $inh { style.$field = parent.$field.clone(); } )+
                style.custom_properties = parent.custom_properties.clone();
                style
            }

            /// Returns `true` if every *inherited* property has the same
            /// computed value in both styles (so children need not be
            /// recomputed when only non-inherited properties changed).
            #[must_use]
            pub fn inherited_eq(&self, other: &Self) -> bool {
                $( if $inh && self.$field != other.$field { return false; } )+
                self.custom_properties == other.custom_properties
            }

            pub(crate) fn inherit_field(&mut self, prop: &PropertyId, parent: &Self) {
                match prop {
                    $( PropertyId::$variant => self.$field = parent.$field.clone(), )+
                    PropertyId::Custom(_) => {}
                }
            }

            pub(crate) fn reset_field(&mut self, prop: &PropertyId) {
                match prop {
                    $( PropertyId::$variant => self.$field = $initial, )+
                    PropertyId::Custom(_) => {}
                }
            }

            pub(crate) fn set_field(
                &mut self,
                prop: &PropertyId,
                value: &SpecifiedValue,
                ctx: &ConvertContext,
            ) -> bool {
                match prop {
                    $( PropertyId::$variant => {
                        let f: fn(&SpecifiedValue, &ConvertContext) -> Option<$ty> = $conv;
                        match f(value, ctx) {
                            Some(v) => { self.$field = v; true }
                            None => false,
                        }
                    } )+
                    PropertyId::Custom(_) => false,
                }
            }
        }
    };
}

property_table! {
    /// `display`
    Display: "display" => display: Display = Display::Inline, inherited = false, syntax = Single, convert = conv::kw::<Display>;
    /// `position`
    Position: "position" => position: Position = Position::Static, inherited = false, syntax = Single, convert = conv::kw::<Position>;
    /// `top`
    Top: "top" => top: LengthPercentageAuto = LengthPercentageAuto::Auto, inherited = false, syntax = Single, convert = conv::lpa;
    /// `right`
    Right: "right" => right: LengthPercentageAuto = LengthPercentageAuto::Auto, inherited = false, syntax = Single, convert = conv::lpa;
    /// `bottom`
    Bottom: "bottom" => bottom: LengthPercentageAuto = LengthPercentageAuto::Auto, inherited = false, syntax = Single, convert = conv::lpa;
    /// `left`
    Left: "left" => left: LengthPercentageAuto = LengthPercentageAuto::Auto, inherited = false, syntax = Single, convert = conv::lpa;
    /// `z-index`
    ZIndex: "z-index" => z_index: ZIndex = ZIndex::Auto, inherited = false, syntax = Single, convert = conv::z_index;
    /// `float`
    Float: "float" => float: Float = Float::None, inherited = false, syntax = Single, convert = conv::kw::<Float>;
    /// `clear`
    Clear: "clear" => clear: Clear = Clear::None, inherited = false, syntax = Single, convert = conv::kw::<Clear>;
    /// `width` (intrinsic sizing keywords compute to `auto`)
    Width: "width" => width: LengthPercentageAuto = LengthPercentageAuto::Auto, inherited = false, syntax = Single, convert = conv::size;
    /// `height`
    Height: "height" => height: LengthPercentageAuto = LengthPercentageAuto::Auto, inherited = false, syntax = Single, convert = conv::size;
    /// `min-width` (`auto` computes to zero)
    MinWidth: "min-width" => min_width: LengthPercentage = LengthPercentage::ZERO, inherited = false, syntax = Single, convert = conv::lp_auto_zero;
    /// `min-height` (`auto` computes to zero)
    MinHeight: "min-height" => min_height: LengthPercentage = LengthPercentage::ZERO, inherited = false, syntax = Single, convert = conv::lp_auto_zero;
    /// `max-width`
    MaxWidth: "max-width" => max_width: MaxSize = MaxSize::None, inherited = false, syntax = Single, convert = conv::max_size;
    /// `max-height`
    MaxHeight: "max-height" => max_height: MaxSize = MaxSize::None, inherited = false, syntax = Single, convert = conv::max_size;
    /// `margin-top`
    MarginTop: "margin-top" => margin_top: LengthPercentageAuto = LengthPercentageAuto::Px(0.0), inherited = false, syntax = Single, convert = conv::lpa;
    /// `margin-right`
    MarginRight: "margin-right" => margin_right: LengthPercentageAuto = LengthPercentageAuto::Px(0.0), inherited = false, syntax = Single, convert = conv::lpa;
    /// `margin-bottom`
    MarginBottom: "margin-bottom" => margin_bottom: LengthPercentageAuto = LengthPercentageAuto::Px(0.0), inherited = false, syntax = Single, convert = conv::lpa;
    /// `margin-left`
    MarginLeft: "margin-left" => margin_left: LengthPercentageAuto = LengthPercentageAuto::Px(0.0), inherited = false, syntax = Single, convert = conv::lpa;
    /// `padding-top`
    PaddingTop: "padding-top" => padding_top: LengthPercentage = LengthPercentage::ZERO, inherited = false, syntax = Single, convert = conv::lp;
    /// `padding-right`
    PaddingRight: "padding-right" => padding_right: LengthPercentage = LengthPercentage::ZERO, inherited = false, syntax = Single, convert = conv::lp;
    /// `padding-bottom`
    PaddingBottom: "padding-bottom" => padding_bottom: LengthPercentage = LengthPercentage::ZERO, inherited = false, syntax = Single, convert = conv::lp;
    /// `padding-left`
    PaddingLeft: "padding-left" => padding_left: LengthPercentage = LengthPercentage::ZERO, inherited = false, syntax = Single, convert = conv::lp;
    /// `border-top-width` (pixels; zeroed after the cascade when the side's style is `none`)
    BorderTopWidth: "border-top-width" => border_top_width: f32 = 0.0, inherited = false, syntax = Single, convert = conv::border_width;
    /// `border-right-width` (pixels)
    BorderRightWidth: "border-right-width" => border_right_width: f32 = 0.0, inherited = false, syntax = Single, convert = conv::border_width;
    /// `border-bottom-width` (pixels)
    BorderBottomWidth: "border-bottom-width" => border_bottom_width: f32 = 0.0, inherited = false, syntax = Single, convert = conv::border_width;
    /// `border-left-width` (pixels)
    BorderLeftWidth: "border-left-width" => border_left_width: f32 = 0.0, inherited = false, syntax = Single, convert = conv::border_width;
    /// `border-top-style`
    BorderTopStyle: "border-top-style" => border_top_style: BorderStyle = BorderStyle::None, inherited = false, syntax = Single, convert = conv::kw::<BorderStyle>;
    /// `border-right-style`
    BorderRightStyle: "border-right-style" => border_right_style: BorderStyle = BorderStyle::None, inherited = false, syntax = Single, convert = conv::kw::<BorderStyle>;
    /// `border-bottom-style`
    BorderBottomStyle: "border-bottom-style" => border_bottom_style: BorderStyle = BorderStyle::None, inherited = false, syntax = Single, convert = conv::kw::<BorderStyle>;
    /// `border-left-style`
    BorderLeftStyle: "border-left-style" => border_left_style: BorderStyle = BorderStyle::None, inherited = false, syntax = Single, convert = conv::kw::<BorderStyle>;
    /// `border-top-color`
    BorderTopColor: "border-top-color" => border_top_color: Color = Color::CurrentColor, inherited = false, syntax = Single, convert = conv::color;
    /// `border-right-color`
    BorderRightColor: "border-right-color" => border_right_color: Color = Color::CurrentColor, inherited = false, syntax = Single, convert = conv::color;
    /// `border-bottom-color`
    BorderBottomColor: "border-bottom-color" => border_bottom_color: Color = Color::CurrentColor, inherited = false, syntax = Single, convert = conv::color;
    /// `border-left-color`
    BorderLeftColor: "border-left-color" => border_left_color: Color = Color::CurrentColor, inherited = false, syntax = Single, convert = conv::color;
    /// `border-collapse`
    BorderCollapse: "border-collapse" => border_collapse: BorderCollapse = BorderCollapse::Separate, inherited = true, syntax = Single, convert = conv::kw::<BorderCollapse>;
    /// Horizontal `border-spacing` (pixels); the `border-spacing` shorthand sets both.
    BorderSpacingX: "-ve-border-spacing-x" => border_spacing_x: f32 = 0.0, inherited = true, syntax = Single, convert = conv::length_px;
    /// Vertical `border-spacing` (pixels).
    BorderSpacingY: "-ve-border-spacing-y" => border_spacing_y: f32 = 0.0, inherited = true, syntax = Single, convert = conv::length_px;
    /// `caption-side`
    CaptionSide: "caption-side" => caption_side: CaptionSide = CaptionSide::Top, inherited = true, syntax = Single, convert = conv::kw::<CaptionSide>;
    /// `box-sizing`
    BoxSizing: "box-sizing" => box_sizing: BoxSizing = BoxSizing::ContentBox, inherited = false, syntax = Single, convert = conv::kw::<BoxSizing>;
    /// `color` (fully resolved; `currentcolor` is the inherited colour)
    Color: "color" => color: Rgba = Rgba::BLACK, inherited = true, syntax = Single, convert = conv::color_rgba;
    /// `background-color`
    BackgroundColor: "background-color" => background_color: Color = Color::Rgba(Rgba::TRANSPARENT), inherited = false, syntax = Single, convert = conv::color;
    /// `opacity`
    Opacity: "opacity" => opacity: f32 = 1.0, inherited = false, syntax = Single, convert = conv::opacity;
    /// `visibility`
    Visibility: "visibility" => visibility: Visibility = Visibility::Visible, inherited = true, syntax = Single, convert = conv::kw::<Visibility>;
    /// `overflow-x` (the field is named `overflow` for the common single-axis case)
    OverflowX: "overflow-x" => overflow: Overflow = Overflow::Visible, inherited = false, syntax = Single, convert = conv::kw::<Overflow>;
    /// `overflow-y`
    OverflowY: "overflow-y" => overflow_y: Overflow = Overflow::Visible, inherited = false, syntax = Single, convert = conv::kw::<Overflow>;
    /// `clip-path` (only `inset()`; visibility only)
    ClipPath: "clip-path" => clip_path: ClipPath = ClipPath::None, inherited = false, syntax = ClipPath, convert = conv::clip_path;
    /// `transform` (`translate` / `scale` only; geometry only)
    Transform: "transform" => transform: Vec<TransformOp> = Vec::new(), inherited = false, syntax = Transform, convert = conv::transform;
    /// `font-size` (pixels)
    FontSize: "font-size" => font_size: f32 = 16.0, inherited = true, syntax = Single, convert = conv::font_size;
    /// `font-weight`
    FontWeight: "font-weight" => font_weight: FontWeight = FontWeight::NORMAL, inherited = true, syntax = Single, convert = conv::font_weight;
    /// `font-style`
    FontStyle: "font-style" => font_style: FontStyle = FontStyle::Normal, inherited = true, syntax = Single, convert = conv::kw::<FontStyle>;
    /// `font-family`
    FontFamily: "font-family" => font_family: Vec<FontFamily> = vec![FontFamily::SansSerif], inherited = true, syntax = FamilyList, convert = conv::family;
    /// `line-height`
    LineHeight: "line-height" => line_height: LineHeight = LineHeight::Normal, inherited = true, syntax = Single, convert = conv::line_height;
    /// `letter-spacing` (pixels; `normal` is zero)
    LetterSpacing: "letter-spacing" => letter_spacing: f32 = 0.0, inherited = true, syntax = Single, convert = conv::spacing;
    /// `word-spacing` (pixels; `normal` is zero)
    WordSpacing: "word-spacing" => word_spacing: f32 = 0.0, inherited = true, syntax = Single, convert = conv::spacing;
    /// `text-align`
    TextAlign: "text-align" => text_align: TextAlign = TextAlign::Start, inherited = true, syntax = Single, convert = conv::kw::<TextAlign>;
    /// `text-indent`
    TextIndent: "text-indent" => text_indent: LengthPercentage = LengthPercentage::ZERO, inherited = true, syntax = Single, convert = conv::lp;
    /// `text-decoration-line` (single keyword; `text-decoration` aliases to it)
    TextDecorationLine: "text-decoration-line" => text_decoration_line: TextDecorationLine = TextDecorationLine::None, inherited = false, syntax = Single, convert = conv::kw::<TextDecorationLine>;
    /// `text-transform`
    TextTransform: "text-transform" => text_transform: TextTransform = TextTransform::None, inherited = true, syntax = Single, convert = conv::kw::<TextTransform>;
    /// `text-overflow`
    TextOverflow: "text-overflow" => text_overflow: TextOverflow = TextOverflow::Clip, inherited = false, syntax = Single, convert = conv::kw::<TextOverflow>;
    /// `white-space`
    WhiteSpace: "white-space" => white_space: WhiteSpace = WhiteSpace::Normal, inherited = true, syntax = Single, convert = conv::kw::<WhiteSpace>;
    /// `word-break`
    WordBreak: "word-break" => word_break: WordBreak = WordBreak::Normal, inherited = true, syntax = Single, convert = conv::kw::<WordBreak>;
    /// `overflow-wrap` (`word-wrap` aliases to it)
    OverflowWrap: "overflow-wrap" => overflow_wrap: OverflowWrap = OverflowWrap::Normal, inherited = true, syntax = Single, convert = conv::kw::<OverflowWrap>;
    /// `direction`
    Direction: "direction" => direction: Direction = Direction::Ltr, inherited = true, syntax = Single, convert = conv::kw::<Direction>;
    /// `writing-mode`
    WritingMode: "writing-mode" => writing_mode: WritingMode = WritingMode::HorizontalTb, inherited = true, syntax = Single, convert = conv::kw::<WritingMode>;
    /// `unicode-bidi`
    UnicodeBidi: "unicode-bidi" => unicode_bidi: UnicodeBidi = UnicodeBidi::Normal, inherited = false, syntax = Single, convert = conv::kw::<UnicodeBidi>;
    /// `vertical-align`
    VerticalAlign: "vertical-align" => vertical_align: VerticalAlign = VerticalAlign::Baseline, inherited = false, syntax = Single, convert = conv::vertical_align;
    /// `list-style-type`
    ListStyleType: "list-style-type" => list_style_type: ListStyleType = ListStyleType::Disc, inherited = true, syntax = Single, convert = conv::list_style_type;
    /// `list-style-position`
    ListStylePosition: "list-style-position" => list_style_position: ListStylePosition = ListStylePosition::Outside, inherited = true, syntax = Single, convert = conv::kw::<ListStylePosition>;
    /// `content` (text for `::before` / `::after` only)
    Content: "content" => content: Content = Content::Normal, inherited = false, syntax = Content, convert = conv::content;
    /// `pointer-events`
    PointerEvents: "pointer-events" => pointer_events: PointerEvents = PointerEvents::Auto, inherited = true, syntax = Single, convert = conv::kw::<PointerEvents>;
    /// `flex-direction`
    FlexDirection: "flex-direction" => flex_direction: FlexDirection = FlexDirection::Row, inherited = false, syntax = Single, convert = conv::kw::<FlexDirection>;
    /// `flex-wrap`
    FlexWrap: "flex-wrap" => flex_wrap: FlexWrap = FlexWrap::NoWrap, inherited = false, syntax = Single, convert = conv::kw::<FlexWrap>;
    /// `flex-grow`
    FlexGrow: "flex-grow" => flex_grow: f32 = 0.0, inherited = false, syntax = Single, convert = conv::non_negative_number;
    /// `flex-shrink`
    FlexShrink: "flex-shrink" => flex_shrink: f32 = 1.0, inherited = false, syntax = Single, convert = conv::non_negative_number;
    /// `flex-basis` (`content` computes to `auto`)
    FlexBasis: "flex-basis" => flex_basis: LengthPercentageAuto = LengthPercentageAuto::Auto, inherited = false, syntax = Single, convert = conv::flex_basis;
    /// `order`
    Order: "order" => order: i32 = 0, inherited = false, syntax = Single, convert = conv::integer;
    /// `justify-content`
    JustifyContent: "justify-content" => justify_content: JustifyContent = JustifyContent::Normal, inherited = false, syntax = Single, convert = conv::kw::<JustifyContent>;
    /// `align-content`
    AlignContent: "align-content" => align_content: JustifyContent = JustifyContent::Normal, inherited = false, syntax = Single, convert = conv::kw::<JustifyContent>;
    /// `align-items`
    AlignItems: "align-items" => align_items: AlignItems = AlignItems::Normal, inherited = false, syntax = Single, convert = conv::kw::<AlignItems>;
    /// `justify-items`
    JustifyItems: "justify-items" => justify_items: AlignItems = AlignItems::Normal, inherited = false, syntax = Single, convert = conv::kw::<AlignItems>;
    /// `align-self`
    AlignSelf: "align-self" => align_self: SelfAlignment = SelfAlignment::Auto, inherited = false, syntax = Single, convert = conv::kw::<SelfAlignment>;
    /// `justify-self`
    JustifySelf: "justify-self" => justify_self: SelfAlignment = SelfAlignment::Auto, inherited = false, syntax = Single, convert = conv::kw::<SelfAlignment>;
    /// `row-gap`
    RowGap: "row-gap" => row_gap: LengthPercentage = LengthPercentage::ZERO, inherited = false, syntax = Single, convert = conv::lp_auto_zero;
    /// `column-gap`
    ColumnGap: "column-gap" => column_gap: LengthPercentage = LengthPercentage::ZERO, inherited = false, syntax = Single, convert = conv::lp_auto_zero;
    /// `grid-template-columns` (explicit tracks only; empty = `none`)
    GridTemplateColumns: "grid-template-columns" => grid_template_columns: Vec<TrackSize> = Vec::new(), inherited = false, syntax = TrackList, convert = conv::tracks;
    /// `grid-template-rows` (explicit tracks only; empty = `none`)
    GridTemplateRows: "grid-template-rows" => grid_template_rows: Vec<TrackSize> = Vec::new(), inherited = false, syntax = TrackList, convert = conv::tracks;
    /// `grid-auto-columns` (first track size only)
    GridAutoColumns: "grid-auto-columns" => grid_auto_columns: Vec<TrackSize> = Vec::new(), inherited = false, syntax = TrackList, convert = conv::tracks;
    /// `grid-auto-rows` (first track size only)
    GridAutoRows: "grid-auto-rows" => grid_auto_rows: Vec<TrackSize> = Vec::new(), inherited = false, syntax = TrackList, convert = conv::tracks;
    /// `grid-row-start`
    GridRowStart: "grid-row-start" => grid_row_start: GridLine = GridLine::Auto, inherited = false, syntax = GridLine, convert = conv::grid_line;
    /// `grid-row-end`
    GridRowEnd: "grid-row-end" => grid_row_end: GridLine = GridLine::Auto, inherited = false, syntax = GridLine, convert = conv::grid_line;
    /// `grid-column-start`
    GridColumnStart: "grid-column-start" => grid_column_start: GridLine = GridLine::Auto, inherited = false, syntax = GridLine, convert = conv::grid_line;
    /// `grid-column-end`
    GridColumnEnd: "grid-column-end" => grid_column_end: GridLine = GridLine::Auto, inherited = false, syntax = GridLine, convert = conv::grid_line;
    /// `border-top-left-radius` (pixels)
    BorderTopLeftRadius: "border-top-left-radius" => border_top_left_radius: f32 = 0.0, inherited = false, syntax = Single, convert = conv::length_px;
    /// `border-top-right-radius` (pixels)
    BorderTopRightRadius: "border-top-right-radius" => border_top_right_radius: f32 = 0.0, inherited = false, syntax = Single, convert = conv::length_px;
    /// `border-bottom-right-radius` (pixels)
    BorderBottomRightRadius: "border-bottom-right-radius" => border_bottom_right_radius: f32 = 0.0, inherited = false, syntax = Single, convert = conv::length_px;
    /// `border-bottom-left-radius` (pixels)
    BorderBottomLeftRadius: "border-bottom-left-radius" => border_bottom_left_radius: f32 = 0.0, inherited = false, syntax = Single, convert = conv::length_px;
    /// `object-fit`
    ObjectFit: "object-fit" => object_fit: ObjectFit = ObjectFit::Fill, inherited = false, syntax = Single, convert = conv::kw::<ObjectFit>;
    /// `box-shadow` (first shadow only)
    BoxShadow: "box-shadow" => box_shadow: BoxShadow = BoxShadow {
        dx: 0.0,
        dy: 0.0,
        blur: 0.0,
        color: Rgba::TRANSPARENT,
    }, inherited = false, syntax = BoxShadow, convert = conv::box_shadow;
}

impl ComputedStyle {
    /// Used border width for a side: zero when the side's style is `none` / `hidden`.
    #[must_use]
    pub fn used_border_width(width: f32, style: BorderStyle) -> f32 {
        if style.is_none() { 0.0 } else { width }
    }

    /// Used `border-top-width`.
    #[must_use]
    pub fn border_top(&self) -> f32 {
        Self::used_border_width(self.border_top_width, self.border_top_style)
    }

    /// Used `border-right-width`.
    #[must_use]
    pub fn border_right(&self) -> f32 {
        Self::used_border_width(self.border_right_width, self.border_right_style)
    }

    /// Used `border-bottom-width`.
    #[must_use]
    pub fn border_bottom(&self) -> f32 {
        Self::used_border_width(self.border_bottom_width, self.border_bottom_style)
    }

    /// Used `border-left-width`.
    #[must_use]
    pub fn border_left(&self) -> f32 {
        Self::used_border_width(self.border_left_width, self.border_left_style)
    }

    /// Returns `true` if either overflow axis clips content.
    #[must_use]
    pub fn overflow_clips(&self) -> bool {
        self.overflow.clips() || self.overflow_y.clips()
    }

    /// Returns `true` if the element is a float that is in flow (not
    /// absolutely positioned).
    #[must_use]
    pub fn is_floating(&self) -> bool {
        self.float != Float::None && !self.position.is_out_of_flow()
    }

    /// Returns `true` if the box establishes a new block formatting context
    /// for the purpose of float placement.
    #[must_use]
    pub fn establishes_bfc(&self) -> bool {
        self.is_floating()
            || self.position.is_out_of_flow()
            || self.overflow_clips()
            || matches!(
                self.display,
                Display::FlowRoot
                    | Display::InlineBlock
                    | Display::TableCell
                    | Display::TableCaption
                    | Display::Table
                    | Display::InlineTable
            )
            || self.display.is_flex()
            || self.display.is_grid()
    }
}

/// Properties whose *unknown or deferred* declarations could change what is
/// displayed, where, or whether it is visible. Used by the coverage counter
/// (see [`crate::coverage`]).
pub const GEOMETRY_AFFECTING_DEFERRED: &[&str] = &[
    "aspect-ratio",
    "contain",
    "content-visibility",
    "columns",
    "column-count",
    "column-width",
    "translate",
    "rotate",
    "scale",
    "offset",
    "offset-path",
    "position-anchor",
    "anchor-name",
    "inset-area",
    "position-area",
    "clip",
    "zoom",
    "container-type",
    "text-orientation",
    "float-offset",
    "shape-outside",
    "table-layout",
    "empty-cells",
    "visibility-collapse",
    "grid-template-areas",
    "grid-area",
    "field-sizing",
    "resize",
];

/// Known properties the engine parses names for but does not implement.
/// Declarations of these count as `deferred` rather than `unknown`.
pub const DEFERRED_PROPERTIES: &[&str] = &[
    "animation",
    "animation-name",
    "animation-duration",
    "animation-delay",
    "animation-timing-function",
    "animation-iteration-count",
    "animation-direction",
    "animation-fill-mode",
    "animation-play-state",
    "transition",
    "transition-property",
    "transition-duration",
    "transition-delay",
    "transition-timing-function",
    "background-image",
    "background-position",
    "background-position-x",
    "background-position-y",
    "background-size",
    "background-repeat",
    "background-attachment",
    "background-clip",
    "background-origin",
    "background-blend-mode",
    "border-radius",
    "border-image",
    "text-shadow",
    "filter",
    "backdrop-filter",
    "mix-blend-mode",
    "isolation",
    "outline",
    "outline-width",
    "outline-style",
    "outline-color",
    "outline-offset",
    "cursor",
    "user-select",
    "will-change",
    "font-variant",
    "font-variant-ligatures",
    "font-variant-numeric",
    "font-feature-settings",
    "font-kerning",
    "font-stretch",
    "font-display",
    "font-optical-sizing",
    "text-rendering",
    "text-decoration-color",
    "text-decoration-style",
    "text-decoration-thickness",
    "text-underline-offset",
    "text-underline-position",
    "text-size-adjust",
    "-webkit-text-size-adjust",
    "-webkit-font-smoothing",
    "-moz-osx-font-smoothing",
    "-webkit-tap-highlight-color",
    "-webkit-appearance",
    "appearance",
    "scroll-behavior",
    "scroll-margin",
    "scroll-padding",
    "scroll-snap-type",
    "scroll-snap-align",
    "overscroll-behavior",
    "touch-action",
    "object-position",
    "image-rendering",
    "quotes",
    "counter-reset",
    "counter-increment",
    "tab-size",
    "hyphens",
    "orphans",
    "widows",
    "page-break-before",
    "page-break-after",
    "page-break-inside",
    "break-before",
    "break-after",
    "break-inside",
    "speak",
    "src",
    "unicode-range",
    "aspect-ratio",
    "contain",
    "content-visibility",
    "columns",
    "column-count",
    "column-width",
    "column-rule",
    "column-span",
    "translate",
    "rotate",
    "scale",
    "transform-origin",
    "transform-style",
    "transform-box",
    "perspective",
    "perspective-origin",
    "backface-visibility",
    "clip",
    "zoom",
    "container-type",
    "container-name",
    "container",
    "table-layout",
    "empty-cells",
    "grid-template-areas",
    "grid-auto-flow",
    "resize",
    "accent-color",
    "color-scheme",
    "forced-color-adjust",
    "print-color-adjust",
    "shape-outside",
    "text-wrap",
    "text-align-last",
    "text-justify",
    "hanging-punctuation",
    "line-clamp",
    "-webkit-line-clamp",
    "-webkit-box-orient",
    "inset-area",
    "position-area",
    "position-anchor",
    "anchor-name",
    "view-transition-name",
    "field-sizing",
    "text-emphasis",
    "ruby-position",
    "caret-color",
    "text-orientation",
    "font-synthesis",
    "font-language-override",
    "font-palette",
    "math-style",
    "math-depth",
    "list-style-image",
    "marker-offset",
    "vector-effect",
    "fill",
    "stroke",
    "stroke-width",
];

// ---------------------------------------------------------------------------
// Value parsing
// ---------------------------------------------------------------------------

/// Skips a function's arguments and yields [`SpecifiedValue::Unsupported`].
fn skip_function(input: &mut Parser<'_, '_>) -> SpecifiedValue {
    let _ = input.parse_nested_block(|args| {
        while args.next_including_whitespace_and_comments().is_ok() {}
        Ok::<_, cssparser::ParseError<'_, ()>>(())
    });
    SpecifiedValue::Unsupported
}

/// Parses one component value (an identifier, number, dimension, colour…).
fn parse_component<'i>(input: &mut Parser<'i, '_>) -> Option<SpecifiedValue> {
    let token = input.next().ok()?.clone();
    Some(match token {
        Token::Ident(ident) => {
            let lower = ident.to_ascii_lowercase();
            match lower.as_str() {
                "inherit" => SpecifiedValue::Inherit,
                "initial" => SpecifiedValue::Initial,
                "unset" => SpecifiedValue::Unset,
                "revert" | "revert-layer" => SpecifiedValue::Revert,
                "currentcolor" => SpecifiedValue::Color(Color::CurrentColor),
                _ => SpecifiedValue::Keyword(lower),
            }
        }
        Token::Hash(h) | Token::IDHash(h) => {
            SpecifiedValue::Color(Color::Rgba(Rgba::from_hex(&h)?))
        }
        Token::Dimension { value, unit, .. } => {
            SpecifiedValue::Length(Length::from_unit(value, &unit)?)
        }
        Token::Percentage { unit_value, .. } => SpecifiedValue::Percentage(unit_value * 100.0),
        Token::Number {
            value, int_value, ..
        } => match int_value {
            Some(i) => SpecifiedValue::Integer(i),
            None => SpecifiedValue::Number(value),
        },
        Token::QuotedString(s) => SpecifiedValue::Str(s.to_string()),
        Token::UnquotedUrl(_) => SpecifiedValue::Unsupported,
        Token::Function(name) => {
            let lower = name.to_ascii_lowercase();
            match lower.as_str() {
                "rgb" | "rgba" => {
                    let rgba = input
                        .parse_nested_block(|args| {
                            parse_rgb_args(args)
                                .ok_or_else(|| args.new_error_for_next_token::<()>())
                        })
                        .ok()?;
                    SpecifiedValue::Color(Color::Rgba(rgba))
                }
                "hsl" | "hsla" => {
                    let rgba = input
                        .parse_nested_block(|args| {
                            parse_hsl_args(args)
                                .ok_or_else(|| args.new_error_for_next_token::<()>())
                        })
                        .ok()?;
                    SpecifiedValue::Color(Color::Rgba(rgba))
                }
                "calc" | "min" | "max" | "clamp" | "-webkit-calc" | "-moz-calc" => {
                    let expr = input
                        .parse_nested_block(|args| {
                            parse_calc_function(&lower, args)
                                .ok_or_else(|| args.new_error_for_next_token::<()>())
                        })
                        .ok()?;
                    SpecifiedValue::Calc(expr)
                }
                _ => skip_function(input),
            }
        }
        _ => return None,
    })
}

/// Parses the arguments of `rgb()` / `rgba()` in legacy (comma) or modern
/// (space, slash) syntax.
fn parse_rgb_args(input: &mut Parser<'_, '_>) -> Option<Rgba> {
    fn channel(input: &mut Parser<'_, '_>) -> Option<u8> {
        match input.next().ok()?.clone() {
            Token::Number { value, .. } => Some(value.round().clamp(0.0, 255.0) as u8),
            Token::Percentage { unit_value, .. } => {
                Some((unit_value * 255.0).round().clamp(0.0, 255.0) as u8)
            }
            Token::Ident(k) if k.eq_ignore_ascii_case("none") => Some(0),
            _ => None,
        }
    }
    let r = channel(input)?;
    let _ = input.try_parse(Parser::expect_comma);
    let g = channel(input)?;
    let _ = input.try_parse(Parser::expect_comma);
    let b = channel(input)?;
    let a = parse_alpha(input)?;
    input.expect_exhausted().ok()?;
    Some(Rgba::rgba(r, g, b, a))
}

/// Optional `, alpha` / `/ alpha` tail of a colour function.
fn parse_alpha(input: &mut Parser<'_, '_>) -> Option<f32> {
    let mut a = 1.0;
    if input.try_parse(Parser::expect_comma).is_ok()
        || input.try_parse(|i| i.expect_delim('/')).is_ok()
    {
        a = match input.next().ok()?.clone() {
            Token::Number { value, .. } => value.clamp(0.0, 1.0),
            Token::Percentage { unit_value, .. } => unit_value.clamp(0.0, 1.0),
            Token::Ident(k) if k.eq_ignore_ascii_case("none") => 0.0,
            _ => return None,
        };
    }
    Some(a)
}

/// Parses the arguments of `hsl()` / `hsla()`.
fn parse_hsl_args(input: &mut Parser<'_, '_>) -> Option<Rgba> {
    let hue = match input.next().ok()?.clone() {
        Token::Number { value, .. } => value,
        Token::Dimension { value, unit, .. } => match unit.to_ascii_lowercase().as_str() {
            "deg" => value,
            "grad" => value * 0.9,
            "rad" => value.to_degrees(),
            "turn" => value * 360.0,
            _ => return None,
        },
        _ => return None,
    };
    let _ = input.try_parse(Parser::expect_comma);
    let pct = |input: &mut Parser<'_, '_>| match input.next().ok()?.clone() {
        Token::Percentage { unit_value, .. } => Some(unit_value),
        Token::Number { value, .. } => Some(value / 100.0),
        _ => None,
    };
    let s = pct(input)?;
    let _ = input.try_parse(Parser::expect_comma);
    let l = pct(input)?;
    let a = parse_alpha(input)?;
    input.expect_exhausted().ok()?;
    Some(Rgba::from_hsl(hue, s, l, a))
}

/// Parses the body of `calc()`, `min()`, `max()` or `clamp()`.
fn parse_calc_function(name: &str, input: &mut Parser<'_, '_>) -> Option<CalcExpr> {
    match name {
        "min" | "max" => {
            let args = input
                .parse_comma_separated(|i| {
                    parse_calc_sum(i).ok_or_else(|| i.new_error_for_next_token::<()>())
                })
                .ok()?;
            (!args.is_empty()).then(|| {
                if name == "min" {
                    CalcExpr::Min(args)
                } else {
                    CalcExpr::Max(args)
                }
            })
        }
        "clamp" => {
            let args = input
                .parse_comma_separated(|i| {
                    parse_calc_sum(i).ok_or_else(|| i.new_error_for_next_token::<()>())
                })
                .ok()?;
            let [a, b, c]: [CalcExpr; 3] = args.try_into().ok()?;
            Some(CalcExpr::Clamp(Box::new([a, b, c])))
        }
        _ => {
            let expr = parse_calc_sum(input)?;
            input.expect_exhausted().ok()?;
            Some(expr)
        }
    }
}

fn parse_calc_sum(input: &mut Parser<'_, '_>) -> Option<CalcExpr> {
    let mut terms = vec![parse_calc_product(input)?];
    loop {
        let state = input.state();
        let Ok(token) = input.next().cloned() else {
            break;
        };
        match token {
            Token::Delim('+') => terms.push(parse_calc_product(input)?),
            Token::Delim('-') => {
                let term = parse_calc_product(input)?;
                terms.push(CalcExpr::Product(vec![CalcExpr::Number(-1.0), term]));
            }
            // `10px -5px`: a signed numeric token is an addition.
            Token::Number { has_sign: true, .. }
            | Token::Dimension { has_sign: true, .. }
            | Token::Percentage { has_sign: true, .. } => {
                input.reset(&state);
                terms.push(parse_calc_product(input)?);
            }
            _ => {
                input.reset(&state);
                break;
            }
        }
    }
    Some(if terms.len() == 1 {
        terms.pop()?
    } else {
        CalcExpr::Sum(terms)
    })
}

fn parse_calc_product(input: &mut Parser<'_, '_>) -> Option<CalcExpr> {
    let mut factors = vec![parse_calc_value(input)?];
    loop {
        let state = input.state();
        let Ok(token) = input.next().cloned() else {
            break;
        };
        match token {
            Token::Delim('*') => factors.push(parse_calc_value(input)?),
            Token::Delim('/') => match parse_calc_value(input)? {
                CalcExpr::Number(n) if n != 0.0 => factors.push(CalcExpr::Number(1.0 / n)),
                _ => return None,
            },
            _ => {
                input.reset(&state);
                break;
            }
        }
    }
    Some(if factors.len() == 1 {
        factors.pop()?
    } else {
        CalcExpr::Product(factors)
    })
}

fn parse_calc_value(input: &mut Parser<'_, '_>) -> Option<CalcExpr> {
    match input.next().ok()?.clone() {
        Token::Number { value, .. } => Some(CalcExpr::Number(value)),
        Token::Dimension { value, unit, .. } => {
            Length::from_unit(value, &unit).map(CalcExpr::Length)
        }
        Token::Percentage { unit_value, .. } => Some(CalcExpr::Percent(unit_value * 100.0)),
        Token::Ident(k) if k.eq_ignore_ascii_case("pi") => {
            Some(CalcExpr::Number(std::f32::consts::PI))
        }
        Token::Ident(k) if k.eq_ignore_ascii_case("e") => {
            Some(CalcExpr::Number(std::f32::consts::E))
        }
        Token::ParenthesisBlock => input
            .parse_nested_block(|args| {
                parse_calc_sum(args).ok_or_else(|| args.new_error_for_next_token::<()>())
            })
            .ok(),
        Token::Function(name) => {
            let lower = name.to_ascii_lowercase();
            if matches!(lower.as_str(), "calc" | "min" | "max" | "clamp") {
                input
                    .parse_nested_block(|args| {
                        parse_calc_function(&lower, args)
                            .ok_or_else(|| args.new_error_for_next_token::<()>())
                    })
                    .ok()
            } else {
                None
            }
        }
        _ => None,
    }
}

fn parse_family_list(input: &mut Parser<'_, '_>) -> Option<SpecifiedValue> {
    let families = input
        .parse_comma_separated(|i| {
            if let Ok(s) = i.try_parse(|i| i.expect_string_cloned()) {
                return Ok(FontFamily::Named(s.to_string()));
            }
            let mut words = vec![i.expect_ident_cloned()?.to_string()];
            while let Ok(w) = i.try_parse(|i| i.expect_ident_cloned()) {
                words.push(w.to_string());
            }
            let name = words.join(" ");
            Ok::<_, cssparser::ParseError<'_, ()>>(if words.len() == 1 {
                FontFamily::from_ident(&name)
            } else {
                FontFamily::Named(name)
            })
        })
        .ok()?;
    Some(SpecifiedValue::Family(families))
}

fn parse_track_list(input: &mut Parser<'_, '_>) -> Option<SpecifiedValue> {
    let mut tracks = Vec::new();
    while !input.is_exhausted() {
        let track = match input.next().ok()?.clone() {
            Token::Ident(k) if k.eq_ignore_ascii_case("none") && tracks.is_empty() => {
                return input
                    .is_exhausted()
                    .then_some(SpecifiedValue::Keyword("none".into()));
            }
            Token::Ident(k) if k.eq_ignore_ascii_case("auto") => TrackSize::Auto,
            Token::Ident(k) if k.eq_ignore_ascii_case("min-content") => TrackSize::MinContent,
            Token::Ident(k) if k.eq_ignore_ascii_case("max-content") => TrackSize::MaxContent,
            Token::Dimension { value, unit, .. } if unit.eq_ignore_ascii_case("fr") => {
                TrackSize::Fr(value)
            }
            Token::Dimension { value, unit, .. } => match Length::from_unit(value, &unit)? {
                Length::Px(px) => TrackSize::Px(px),
                other => TrackSize::Px(other.to_px(&ConvertContext::DUMMY.lengths())),
            },
            Token::Percentage { unit_value, .. } => TrackSize::Percent(unit_value * 100.0),
            Token::Number { value: 0.0, .. } => TrackSize::Px(0.0),
            // Line names `[a b]` contribute no track.
            Token::SquareBracketBlock => {
                let _ = input.parse_nested_block(|args| {
                    while args.next().is_ok() {}
                    Ok::<_, cssparser::ParseError<'_, ()>>(())
                });
                continue;
            }
            Token::Function(name) if name.eq_ignore_ascii_case("repeat") => {
                let (count, inner) = input
                    .parse_nested_block(|args| {
                        let count = match args.next()?.clone() {
                            Token::Number {
                                int_value: Some(i), ..
                            } => i,
                            // `auto-fill` / `auto-fit`: approximate with one repetition.
                            Token::Ident(_) => 1,
                            _ => return Err(args.new_error_for_next_token()),
                        };
                        args.expect_comma()?;
                        let inner = parse_track_list(args)
                            .ok_or_else(|| args.new_error_for_next_token::<()>())?;
                        Ok::<_, cssparser::ParseError<'_, ()>>((count, inner))
                    })
                    .ok()?;
                if let SpecifiedValue::Tracks(inner) = inner {
                    for _ in 0..count.clamp(0, 1000) {
                        tracks.extend(inner.iter().copied());
                    }
                }
                continue;
            }
            Token::Function(name)
                if name.eq_ignore_ascii_case("minmax")
                    || name.eq_ignore_ascii_case("fit-content") =>
            {
                // `minmax(a, b)`: use the max track; `fit-content(x)`: `auto`.
                let inner = input
                    .parse_nested_block(|args| {
                        let mut last = TrackSize::Auto;
                        while !args.is_exhausted() {
                            match args.next()?.clone() {
                                Token::Comma => {}
                                Token::Dimension { value, unit, .. }
                                    if unit.eq_ignore_ascii_case("fr") =>
                                {
                                    last = TrackSize::Fr(value);
                                }
                                Token::Dimension { value, unit, .. } => {
                                    if let Some(l) = Length::from_unit(value, &unit) {
                                        last = TrackSize::Px(
                                            l.to_px(&ConvertContext::DUMMY.lengths()),
                                        );
                                    }
                                }
                                Token::Percentage { unit_value, .. } => {
                                    last = TrackSize::Percent(unit_value * 100.0);
                                }
                                Token::Ident(k) if k.eq_ignore_ascii_case("min-content") => {
                                    last = TrackSize::MinContent;
                                }
                                Token::Ident(k) if k.eq_ignore_ascii_case("max-content") => {
                                    last = TrackSize::MaxContent;
                                }
                                _ => {}
                            }
                        }
                        Ok::<_, cssparser::ParseError<'_, ()>>(last)
                    })
                    .ok()?;
                if name.eq_ignore_ascii_case("fit-content") {
                    TrackSize::Auto
                } else {
                    inner
                }
            }
            _ => return None,
        };
        tracks.push(track);
    }
    Some(SpecifiedValue::Tracks(tracks))
}

fn parse_content_list(input: &mut Parser<'_, '_>) -> Option<SpecifiedValue> {
    let mut items = Vec::new();
    while !input.is_exhausted() {
        let item = match input.next().ok()?.clone() {
            Token::QuotedString(s) => ContentItem::Text(s.to_string()),
            Token::Ident(k) => match k.to_ascii_lowercase().as_str() {
                "normal" if items.is_empty() => {
                    return input
                        .is_exhausted()
                        .then_some(SpecifiedValue::Keyword("normal".into()));
                }
                "none" if items.is_empty() => {
                    return input
                        .is_exhausted()
                        .then_some(SpecifiedValue::Keyword("none".into()));
                }
                "open-quote" => ContentItem::OpenQuote,
                "close-quote" => ContentItem::CloseQuote,
                "no-open-quote" | "no-close-quote" => ContentItem::NoQuote,
                _ => return None,
            },
            Token::Function(name) => match name.to_ascii_lowercase().as_str() {
                "attr" => {
                    let attr = input
                        .parse_nested_block(|args| {
                            let name = args.expect_ident_cloned()?.to_string();
                            while args.next().is_ok() {}
                            Ok::<_, cssparser::ParseError<'_, ()>>(name)
                        })
                        .ok()?;
                    ContentItem::Attr(attr.to_ascii_lowercase())
                }
                "counter" | "counters" | "url" | "image-set" | "linear-gradient" => {
                    skip_function(input);
                    ContentItem::Ignored
                }
                _ => return None,
            },
            Token::UnquotedUrl(_) => ContentItem::Ignored,
            _ => return None,
        };
        items.push(item);
    }
    (!items.is_empty()).then_some(SpecifiedValue::Content(items))
}

fn parse_transform_list(input: &mut Parser<'_, '_>) -> Option<SpecifiedValue> {
    let mut ops = Vec::new();
    while !input.is_exhausted() {
        let Token::Function(name) = input.next().ok()?.clone() else {
            return None;
        };
        let lower = name.to_ascii_lowercase();
        let op = input
            .parse_nested_block(|args| {
                let mut values = Vec::new();
                while !args.is_exhausted() {
                    if args.try_parse(Parser::expect_comma).is_ok() {
                        continue;
                    }
                    let v = parse_component(args)
                        .ok_or_else(|| args.new_error_for_next_token::<()>())?;
                    values.push(v);
                }
                let number = |v: &SpecifiedValue| match v {
                    SpecifiedValue::Number(n) => Some(*n),
                    SpecifiedValue::Integer(i) => Some(*i as f32),
                    SpecifiedValue::Percentage(p) => Some(p / 100.0),
                    _ => None,
                };
                let zero = SpecifiedValue::Length(Length::ZERO);
                let op = match (lower.as_str(), values.as_slice()) {
                    ("translate", [x]) => SpecifiedTransform::Translate(x.clone(), zero),
                    ("translate", [x, y]) => SpecifiedTransform::Translate(x.clone(), y.clone()),
                    ("translatex", [x]) => SpecifiedTransform::Translate(x.clone(), zero),
                    ("translatey", [y]) => SpecifiedTransform::Translate(zero, y.clone()),
                    ("translate3d", [x, y, _]) => {
                        SpecifiedTransform::Translate(x.clone(), y.clone())
                    }
                    ("scale", [s]) => {
                        let s = number(s).ok_or_else(|| args.new_error_for_next_token::<()>())?;
                        SpecifiedTransform::Scale(s, s)
                    }
                    ("scale", [x, y]) | ("scale3d", [x, y, _]) => SpecifiedTransform::Scale(
                        number(x).ok_or_else(|| args.new_error_for_next_token::<()>())?,
                        number(y).ok_or_else(|| args.new_error_for_next_token::<()>())?,
                    ),
                    ("scalex", [x]) => SpecifiedTransform::Scale(
                        number(x).ok_or_else(|| args.new_error_for_next_token::<()>())?,
                        1.0,
                    ),
                    ("scaley", [y]) => SpecifiedTransform::Scale(
                        1.0,
                        number(y).ok_or_else(|| args.new_error_for_next_token::<()>())?,
                    ),
                    // Rotations, skews and matrices do not move the box's
                    // axis-aligned centre; treat them as identity.
                    (
                        "rotate" | "rotatex" | "rotatey" | "rotatez" | "rotate3d" | "skew"
                        | "skewx" | "skewy" | "matrix" | "matrix3d" | "perspective",
                        _,
                    ) => SpecifiedTransform::Scale(1.0, 1.0),
                    _ => return Err(args.new_error_for_next_token()),
                };
                Ok::<_, cssparser::ParseError<'_, ()>>(op)
            })
            .ok()?;
        ops.push(op);
    }
    (!ops.is_empty()).then_some(SpecifiedValue::Transform(ops))
}

fn parse_clip_path(input: &mut Parser<'_, '_>) -> Option<SpecifiedValue> {
    match input.next().ok()?.clone() {
        Token::Ident(k) if k.eq_ignore_ascii_case("none") => {
            Some(SpecifiedValue::Keyword("none".into()))
        }
        Token::Function(name) if name.eq_ignore_ascii_case("inset") => {
            let sides = input
                .parse_nested_block(|args| {
                    let mut values = Vec::new();
                    while !args.is_exhausted() && values.len() < 4 {
                        if let Ok(v) = args.try_parse(|i| {
                            parse_component(i).ok_or_else(|| i.new_error_for_next_token::<()>())
                        }) {
                            if matches!(v, SpecifiedValue::Keyword(ref k) if k == "round") {
                                // `round <border-radius>`: skip the radii.
                                while args.next().is_ok() {}
                                break;
                            }
                            values.push(v);
                        } else {
                            break;
                        }
                    }
                    while args.next().is_ok() {}
                    sides(values).ok_or_else(|| args.new_error_for_next_token::<()>())
                })
                .ok()?;
            Some(SpecifiedValue::ClipInset(Box::new(sides)))
        }
        Token::Function(_) => {
            skip_function(input);
            None
        }
        _ => None,
    }
}

fn parse_box_shadow(input: &mut Parser<'_, '_>) -> Option<SpecifiedValue> {
    let mut lengths = Vec::new();
    let mut color = Color::Rgba(Rgba::BLACK);
    while !input.is_exhausted() {
        let v = parse_component(input)?;
        match v {
            SpecifiedValue::Keyword(k) if k == "none" && lengths.is_empty() => {
                return input
                    .is_exhausted()
                    .then_some(SpecifiedValue::Keyword("none".into()));
            }
            SpecifiedValue::Keyword(k) if k == "inset" => {}
            SpecifiedValue::Color(c) => color = c,
            SpecifiedValue::Keyword(k) => {
                if let Some(rgba) = Rgba::from_name(&k) {
                    color = Color::Rgba(rgba);
                } else {
                    return None;
                }
            }
            other => {
                if lengths.len() >= 4 {
                    return None;
                }
                lengths.push(other);
            }
        }
    }
    if lengths.len() < 2 {
        return None;
    }
    Some(SpecifiedValue::BoxShadow(Box::new(SpecifiedBoxShadow {
        dx: lengths[0].clone(),
        dy: lengths[1].clone(),
        blur: lengths.get(2).cloned().unwrap_or(SpecifiedValue::Number(0.0)),
        color,
    })))
}

fn parse_grid_line(input: &mut Parser<'_, '_>) -> Option<SpecifiedValue> {
    let mut span = false;
    let mut number: Option<i32> = None;
    while !input.is_exhausted() {
        match input.next().ok()?.clone() {
            Token::Ident(k) if k.eq_ignore_ascii_case("auto") => {
                return input
                    .is_exhausted()
                    .then_some(SpecifiedValue::Keyword("auto".into()));
            }
            Token::Ident(k) if k.eq_ignore_ascii_case("span") => span = true,
            // Custom line names are ignored; the number (if any) is kept.
            Token::Ident(_) => {}
            Token::Number {
                int_value: Some(i), ..
            } if i != 0 => number = Some(i),
            _ => return None,
        }
    }
    Some(SpecifiedValue::GridLine(match (span, number) {
        (true, n) => GridLine::Span(n.unwrap_or(1).max(1) as u32),
        (false, Some(n)) => GridLine::Line(n),
        (false, None) => GridLine::Auto,
    }))
}

/// Reads the remaining input as raw text (for custom properties and `var()`
/// detection) without consuming it.
fn peek_raw<'i>(input: &mut Parser<'i, '_>) -> &'i str {
    let state = input.state();
    let start = input.position();
    while input.next_including_whitespace_and_comments().is_ok() {}
    let raw = input.slice_from(start);
    input.reset(&state);
    raw
}

impl PropertyId {
    /// Parses a full declaration value for this property. Returns `None` if
    /// the value is invalid (the declaration must then be dropped).
    pub fn parse_value<'i>(&self, input: &mut Parser<'i, '_>) -> Option<SpecifiedValue> {
        let raw = peek_raw(input).trim();
        if raw.is_empty() {
            return None;
        }
        if matches!(self, PropertyId::Custom(_)) {
            while input.next_including_whitespace_and_comments().is_ok() {}
            return Some(SpecifiedValue::Raw(raw.to_owned()));
        }
        if raw.contains("var(") {
            while input.next_including_whitespace_and_comments().is_ok() {}
            return Some(SpecifiedValue::Var(raw.to_owned()));
        }
        let css_wide = |input: &mut Parser<'i, '_>| {
            input.try_parse(|i| {
                parse_component(i)
                    .filter(SpecifiedValue::is_css_wide)
                    .ok_or(())
            })
        };
        let value = match self.syntax() {
            ValueSyntax::Single | ValueSyntax::Raw => parse_component(input)?,
            ValueSyntax::FamilyList => css_wide(input)
                .or_else(|()| parse_family_list(input).ok_or(()))
                .ok()?,
            ValueSyntax::TrackList => css_wide(input)
                .or_else(|()| parse_track_list(input).ok_or(()))
                .ok()?,
            ValueSyntax::Content => css_wide(input)
                .or_else(|()| parse_content_list(input).ok_or(()))
                .ok()?,
            ValueSyntax::Transform => css_wide(input)
                .or_else(|()| {
                    input
                        .try_parse(|i| match parse_component(i) {
                            Some(SpecifiedValue::Keyword(k)) if k == "none" => {
                                Ok(SpecifiedValue::Keyword(k))
                            }
                            _ => Err(()),
                        })
                        .or_else(|()| parse_transform_list(input).ok_or(()))
                })
                .ok()?,
            ValueSyntax::ClipPath => css_wide(input)
                .or_else(|()| parse_clip_path(input).ok_or(()))
                .ok()?,
            ValueSyntax::GridLine => css_wide(input)
                .or_else(|()| parse_grid_line(input).ok_or(()))
                .ok()?,
            ValueSyntax::BoxShadow => css_wide(input)
                .or_else(|()| parse_box_shadow(input).ok_or(()))
                .ok()?,
        };
        input.expect_exhausted().ok()?;
        self.accepts(&value).then_some(value)
    }

    /// Parses a value from a string (used after `var()` substitution).
    #[must_use]
    pub fn parse_value_str(&self, text: &str) -> Option<SpecifiedValue> {
        let mut input = cssparser::ParserInput::new(text);
        let mut parser = Parser::new(&mut input);
        self.parse_value(&mut parser)
    }
}

// ---------------------------------------------------------------------------
// Shorthands
// ---------------------------------------------------------------------------

fn sides(values: Vec<SpecifiedValue>) -> Option<[SpecifiedValue; 4]> {
    let mut it = values.into_iter();
    let a = it.next()?;
    let b = it.next().unwrap_or_else(|| a.clone());
    let c = it.next().unwrap_or_else(|| a.clone());
    let d = it.next().unwrap_or_else(|| b.clone());
    it.next().is_none().then_some([a, b, c, d])
}

fn parse_components<'i>(input: &mut Parser<'i, '_>, max: usize) -> Option<Vec<SpecifiedValue>> {
    let mut out = Vec::new();
    while !input.is_exhausted() {
        if out.len() == max {
            return None;
        }
        out.push(parse_component(input)?);
    }
    (!out.is_empty()).then_some(out)
}

/// Names of every shorthand [`expand_shorthand`] understands.
pub const SHORTHANDS: &[&str] = &[
    "margin",
    "margin-inline",
    "margin-block",
    "padding",
    "padding-inline",
    "padding-block",
    "inset",
    "inset-inline",
    "inset-block",
    "border-width",
    "border-style",
    "border-color",
    "border",
    "border-top",
    "border-right",
    "border-bottom",
    "border-left",
    "border-inline-start",
    "border-inline-end",
    "border-block-start",
    "border-block-end",
    "border-spacing",
    "overflow",
    "gap",
    "grid-gap",
    "background",
    "flex",
    "flex-flow",
    "place-items",
    "place-content",
    "place-self",
    "grid-row",
    "grid-column",
    "grid-area",
    "grid-template",
    "grid",
    "list-style",
    "font",
];

/// Expands a shorthand into longhand `(property, value)` pairs. Returns
/// `None` if `name` is not a shorthand, `Some(None)` if it is but the value is
/// invalid.
#[allow(clippy::option_option)]
pub fn expand_shorthand<'i>(
    name: &str,
    input: &mut Parser<'i, '_>,
) -> Option<Option<Vec<(PropertyId, SpecifiedValue)>>> {
    use PropertyId as P;
    let lower = name.to_ascii_lowercase();
    let four = |props: [P; 4], input: &mut Parser<'i, '_>| -> Option<Vec<(P, SpecifiedValue)>> {
        let values = parse_components(input, 4)?;
        if values.len() == 1 && values[0].is_css_wide() {
            return Some(props.into_iter().map(|p| (p, values[0].clone())).collect());
        }
        let [a, b, c, d] = sides(values)?;
        let out: Vec<_> = props.into_iter().zip([a, b, c, d]).collect();
        out.iter().all(|(p, v)| p.accepts(v)).then_some(out)
    };
    let two = |props: [P; 2], input: &mut Parser<'i, '_>| -> Option<Vec<(P, SpecifiedValue)>> {
        let values = parse_components(input, 2)?;
        let a = values[0].clone();
        let b = values.get(1).cloned().unwrap_or_else(|| a.clone());
        let out = vec![(props[0].clone(), a), (props[1].clone(), b)];
        out.iter().all(|(p, v)| p.accepts(v)).then_some(out)
    };
    let widths = [
        P::BorderTopWidth,
        P::BorderRightWidth,
        P::BorderBottomWidth,
        P::BorderLeftWidth,
    ];
    let styles = [
        P::BorderTopStyle,
        P::BorderRightStyle,
        P::BorderBottomStyle,
        P::BorderLeftStyle,
    ];
    let colors = [
        P::BorderTopColor,
        P::BorderRightColor,
        P::BorderBottomColor,
        P::BorderLeftColor,
    ];
    let border_side =
        |sides_idx: &[usize], input: &mut Parser<'i, '_>| -> Option<Vec<(P, SpecifiedValue)>> {
            let values = parse_components(input, 3)?;
            if values.len() == 1 && values[0].is_css_wide() {
                return Some(
                    sides_idx
                        .iter()
                        .flat_map(|&i| {
                            [
                                (widths[i].clone(), values[0].clone()),
                                (styles[i].clone(), values[0].clone()),
                                (colors[i].clone(), values[0].clone()),
                            ]
                        })
                        .collect(),
                );
            }
            let mut width = SpecifiedValue::Keyword("medium".into());
            let mut style = SpecifiedValue::Keyword("none".into());
            let mut color = SpecifiedValue::Color(Color::CurrentColor);
            for v in values {
                if styles[0].accepts(&v) {
                    style = v;
                } else if widths[0].accepts(&v) {
                    width = v;
                } else if colors[0].accepts(&v) {
                    color = v;
                } else {
                    return None;
                }
            }
            Some(
                sides_idx
                    .iter()
                    .flat_map(|&i| {
                        [
                            (widths[i].clone(), width.clone()),
                            (styles[i].clone(), style.clone()),
                            (colors[i].clone(), color.clone()),
                        ]
                    })
                    .collect(),
            )
        };
    if !SHORTHANDS.contains(&lower.as_str()) {
        return None;
    }
    let result = (|| -> Option<Vec<(P, SpecifiedValue)>> {
        match lower.as_str() {
            "margin" => four(
                [P::MarginTop, P::MarginRight, P::MarginBottom, P::MarginLeft],
                input,
            ),
            "margin-inline" => two([P::MarginLeft, P::MarginRight], input),
            "margin-block" => two([P::MarginTop, P::MarginBottom], input),
            "padding" => four(
                [
                    P::PaddingTop,
                    P::PaddingRight,
                    P::PaddingBottom,
                    P::PaddingLeft,
                ],
                input,
            ),
            "padding-inline" => two([P::PaddingLeft, P::PaddingRight], input),
            "padding-block" => two([P::PaddingTop, P::PaddingBottom], input),
            "inset" => four([P::Top, P::Right, P::Bottom, P::Left], input),
            "inset-inline" => two([P::Left, P::Right], input),
            "inset-block" => two([P::Top, P::Bottom], input),
            "border-width" => four(widths.clone(), input),
            "border-style" => four(styles.clone(), input),
            "border-color" => four(colors.clone(), input),
            "border" => border_side(&[0, 1, 2, 3], input),
            "border-top" | "border-block-start" => border_side(&[0], input),
            "border-right" | "border-inline-end" => border_side(&[1], input),
            "border-bottom" | "border-block-end" => border_side(&[2], input),
            "border-left" | "border-inline-start" => border_side(&[3], input),
            "border-spacing" => two([P::BorderSpacingX, P::BorderSpacingY], input),
            "overflow" => two([P::OverflowX, P::OverflowY], input),
            "gap" | "grid-gap" => two([P::RowGap, P::ColumnGap], input),
            "place-items" => two([P::AlignItems, P::JustifyItems], input),
            "place-content" => two([P::AlignContent, P::JustifyContent], input),
            "place-self" => two([P::AlignSelf, P::JustifySelf], input),
            "background" => {
                let values = parse_components(input, 16)?;
                if values.len() == 1 && values[0].is_css_wide() {
                    return Some(vec![(P::BackgroundColor, values[0].clone())]);
                }
                // The colour is the only component the engine keeps; images,
                // positions and repeat keywords are fidelity-only.
                let color = values
                    .iter()
                    .find(|v| {
                        P::BackgroundColor.accepts(v)
                            && !matches!(v, SpecifiedValue::Keyword(k) if is_background_keyword(k))
                    })
                    .cloned()
                    .unwrap_or(SpecifiedValue::Color(Color::Rgba(Rgba::TRANSPARENT)));
                Some(vec![(P::BackgroundColor, color)])
            }
            "flex" => {
                let values = parse_components(input, 3)?;
                let (grow, shrink, basis) = match values.as_slice() {
                    [v] if v.is_css_wide() => (v.clone(), v.clone(), v.clone()),
                    [SpecifiedValue::Keyword(k)] if k == "none" => (
                        SpecifiedValue::Number(0.0),
                        SpecifiedValue::Number(0.0),
                        SpecifiedValue::Keyword("auto".into()),
                    ),
                    [SpecifiedValue::Keyword(k)] if k == "auto" => (
                        SpecifiedValue::Number(1.0),
                        SpecifiedValue::Number(1.0),
                        SpecifiedValue::Keyword("auto".into()),
                    ),
                    [g] if g.is_numeric() => (
                        g.clone(),
                        SpecifiedValue::Number(1.0),
                        SpecifiedValue::Percentage(0.0),
                    ),
                    [g, s] if g.is_numeric() && s.is_numeric() => {
                        (g.clone(), s.clone(), SpecifiedValue::Percentage(0.0))
                    }
                    [g, b] if g.is_numeric() => (g.clone(), SpecifiedValue::Number(1.0), b.clone()),
                    [b, g] if g.is_numeric() => (g.clone(), SpecifiedValue::Number(1.0), b.clone()),
                    [g, s, b] if g.is_numeric() && s.is_numeric() => {
                        (g.clone(), s.clone(), b.clone())
                    }
                    [b, g, s] if g.is_numeric() && s.is_numeric() => {
                        (g.clone(), s.clone(), b.clone())
                    }
                    [b] => (
                        SpecifiedValue::Number(1.0),
                        SpecifiedValue::Number(1.0),
                        b.clone(),
                    ),
                    _ => return None,
                };
                (P::FlexGrow.accepts(&grow)
                    && P::FlexShrink.accepts(&shrink)
                    && P::FlexBasis.accepts(&basis))
                .then(|| {
                    vec![
                        (P::FlexGrow, grow),
                        (P::FlexShrink, shrink),
                        (P::FlexBasis, basis),
                    ]
                })
            }
            "flex-flow" => {
                let values = parse_components(input, 2)?;
                let mut out = vec![
                    (P::FlexDirection, SpecifiedValue::Keyword("row".into())),
                    (P::FlexWrap, SpecifiedValue::Keyword("nowrap".into())),
                ];
                if values.len() == 1 && values[0].is_css_wide() {
                    return Some(vec![
                        (P::FlexDirection, values[0].clone()),
                        (P::FlexWrap, values[0].clone()),
                    ]);
                }
                for v in values {
                    if P::FlexDirection.accepts(&v) {
                        out[0].1 = v;
                    } else if P::FlexWrap.accepts(&v) {
                        out[1].1 = v;
                    } else {
                        return None;
                    }
                }
                Some(out)
            }
            "grid-row" | "grid-column" => {
                let (start, end) = if lower == "grid-row" {
                    (P::GridRowStart, P::GridRowEnd)
                } else {
                    (P::GridColumnStart, P::GridColumnEnd)
                };
                grid_placement_pair(input).map(|(a, b)| vec![(start, a), (end, b)])
            }
            "grid-area" => slash_separated(input, 4).and_then(|parts| {
                let mut it = parts.into_iter();
                let row_start = it.next()?;
                let column_start = it.next().unwrap_or_else(|| mirror_line(&row_start));
                let row_end = it.next().unwrap_or_else(|| mirror_line(&row_start));
                let column_end = it.next().unwrap_or_else(|| mirror_line(&column_start));
                let out = vec![
                    (P::GridRowStart, row_start),
                    (P::GridColumnStart, column_start),
                    (P::GridRowEnd, row_end),
                    (P::GridColumnEnd, column_end),
                ];
                out.iter().all(|(p, v)| p.accepts(v)).then_some(out)
            }),
            "grid-template" | "grid" => {
                // `<rows> / <columns>`; the `grid` shorthand's auto-flow forms fall
                // back to `none` for both templates.
                let raw = peek_raw(input).trim().to_owned();
                while input.next_including_whitespace_and_comments().is_ok() {}
                let mut parts = raw.splitn(2, '/');
                let rows = parts.next().unwrap_or("none").trim();
                let cols = parts.next().unwrap_or("none").trim();
                let parse = |text: &str| {
                    if text.is_empty() || text.contains("auto-flow") || text.contains('"') {
                        return Some(SpecifiedValue::Keyword("none".into()));
                    }
                    P::GridTemplateRows.parse_value_str(text)
                };
                Some(vec![
                    (P::GridTemplateRows, parse(rows)?),
                    (P::GridTemplateColumns, parse(cols)?),
                ])
            }
            "list-style" => {
                let values = parse_components(input, 3)?;
                if values.len() == 1 && values[0].is_css_wide() {
                    return Some(vec![
                        (P::ListStyleType, values[0].clone()),
                        (P::ListStylePosition, values[0].clone()),
                    ]);
                }
                let mut ty = SpecifiedValue::Keyword("disc".into());
                let mut pos = SpecifiedValue::Keyword("outside".into());
                for v in values {
                    if P::ListStylePosition.accepts(&v) {
                        pos = v;
                    } else if matches!(v, SpecifiedValue::Unsupported) {
                        // `url(...)` image: no marker text change.
                    } else if P::ListStyleType.accepts(&v) {
                        ty = v;
                    } else {
                        return None;
                    }
                }
                Some(vec![(P::ListStyleType, ty), (P::ListStylePosition, pos)])
            }
            "font" => expand_font(input),
            _ => None,
        }
    })();
    Some(result.filter(|_| input.is_exhausted()))
}

fn is_background_keyword(k: &str) -> bool {
    matches!(
        k,
        "none"
            | "repeat"
            | "repeat-x"
            | "repeat-y"
            | "no-repeat"
            | "space"
            | "round"
            | "scroll"
            | "fixed"
            | "local"
            | "border-box"
            | "padding-box"
            | "content-box"
            | "text"
            | "top"
            | "bottom"
            | "left"
            | "right"
            | "center"
            | "cover"
            | "contain"
            | "auto"
    )
}

/// Splits the remaining input on `/` into at most `max` grid-line values.
fn slash_separated(input: &mut Parser<'_, '_>, max: usize) -> Option<Vec<SpecifiedValue>> {
    let raw = peek_raw(input).trim().to_owned();
    while input.next_including_whitespace_and_comments().is_ok() {}
    let parts: Vec<&str> = raw.split('/').map(str::trim).collect();
    if parts.is_empty() || parts.len() > max {
        return None;
    }
    parts
        .into_iter()
        .map(|text| PropertyId::GridRowStart.parse_value_str(text))
        .collect()
}

fn grid_placement_pair(input: &mut Parser<'_, '_>) -> Option<(SpecifiedValue, SpecifiedValue)> {
    let parts = slash_separated(input, 2)?;
    let mut it = parts.into_iter();
    let start = it.next()?;
    let end = it.next().unwrap_or_else(|| mirror_line(&start));
    Some((start, end))
}

/// The end line implied by a start line alone: named lines repeat, numbers
/// and spans become `auto`.
fn mirror_line(start: &SpecifiedValue) -> SpecifiedValue {
    match start {
        v if v.is_css_wide() => v.clone(),
        _ => SpecifiedValue::Keyword("auto".into()),
    }
}

/// `font: [style|variant|weight|stretch]* size [/ line-height] family`.
fn expand_font(input: &mut Parser<'_, '_>) -> Option<Vec<(PropertyId, SpecifiedValue)>> {
    use PropertyId as P;
    let raw = peek_raw(input).trim().to_owned();
    if let Some(v) = P::FontSize
        .parse_value_str(&raw)
        .filter(SpecifiedValue::is_css_wide)
    {
        while input.next_including_whitespace_and_comments().is_ok() {}
        return Some(vec![
            (P::FontStyle, v.clone()),
            (P::FontWeight, v.clone()),
            (P::FontSize, v.clone()),
            (P::LineHeight, v.clone()),
            (P::FontFamily, v),
        ]);
    }
    // System font keywords (`font: menu`) reset to the UA defaults.
    if matches!(
        raw.as_str(),
        "caption" | "icon" | "menu" | "message-box" | "small-caption" | "status-bar"
    ) {
        while input.next_including_whitespace_and_comments().is_ok() {}
        return Some(vec![
            (P::FontStyle, SpecifiedValue::Keyword("normal".into())),
            (P::FontWeight, SpecifiedValue::Keyword("normal".into())),
            (P::FontSize, SpecifiedValue::Length(Length::Px(13.333))),
            (P::LineHeight, SpecifiedValue::Keyword("normal".into())),
            (
                P::FontFamily,
                SpecifiedValue::Family(vec![FontFamily::SystemUi]),
            ),
        ]);
    }
    let mut style = SpecifiedValue::Keyword("normal".into());
    let mut weight = SpecifiedValue::Keyword("normal".into());
    let mut size = None;
    let mut line_height = SpecifiedValue::Keyword("normal".into());
    while size.is_none() {
        let v = parse_component(input)?;
        if P::FontSize.accepts(&v) && !matches!(v, SpecifiedValue::Keyword(ref k) if k == "normal")
        {
            size = Some(v);
        } else if P::FontStyle.accepts(&v) {
            style = v;
        } else if P::FontWeight.accepts(&v) {
            weight = v;
        } else if matches!(&v, SpecifiedValue::Keyword(k) if matches!(k.as_str(), "normal" | "small-caps" | "condensed" | "expanded" | "ultra-condensed" | "extra-condensed" | "semi-condensed" | "semi-expanded" | "extra-expanded" | "ultra-expanded"))
        {
            // variant / stretch: not modelled.
        } else {
            return None;
        }
    }
    if input.try_parse(|i| i.expect_delim('/')).is_ok() {
        line_height = parse_component(input)?;
        if !P::LineHeight.accepts(&line_height) {
            return None;
        }
    }
    let family = parse_family_list(input)?;
    Some(vec![
        (P::FontStyle, style),
        (P::FontWeight, weight),
        (P::FontSize, size?),
        (P::LineHeight, line_height),
        (P::FontFamily, family),
    ])
}

#[cfg(test)]
mod tests {
    use super::*;

    fn parse(prop: &str, value: &str) -> Option<SpecifiedValue> {
        PropertyId::from_name(prop).unwrap().parse_value_str(value)
    }

    fn expand(name: &str, value: &str) -> Option<Vec<(PropertyId, SpecifiedValue)>> {
        let mut input = cssparser::ParserInput::new(value);
        let mut parser = Parser::new(&mut input);
        expand_shorthand(name, &mut parser).unwrap_or_else(|| panic!("{name} is not a shorthand"))
    }

    #[test]
    fn validates_values_per_property() {
        assert_eq!(
            parse("display", "Flex"),
            Some(SpecifiedValue::Keyword("flex".into()))
        );
        assert_eq!(
            parse("display", "12px"),
            None,
            "length is not a display value"
        );
        assert_eq!(
            parse("width", "50%"),
            Some(SpecifiedValue::Percentage(50.0))
        );
        assert_eq!(
            parse("width", "auto"),
            Some(SpecifiedValue::Keyword("auto".into()))
        );
        assert_eq!(parse("margin-top", "0"), Some(SpecifiedValue::Integer(0)));
        assert_eq!(
            parse("margin-top", "3"),
            None,
            "unitless non-zero is invalid"
        );
        assert_eq!(
            parse("color", "rgb(1, 2, 3)"),
            Some(SpecifiedValue::Color(Color::Rgba(Rgba::rgb(1, 2, 3))))
        );
        assert_eq!(
            parse("color", "rgb(10 20 30 / 50%)").map(|v| matches!(v, SpecifiedValue::Color(_))),
            Some(true)
        );
        assert_eq!(
            parse("color", "hsl(120, 100%, 25%)"),
            Some(SpecifiedValue::Color(Color::Rgba(Rgba::rgb(0, 128, 0))))
        );
        assert_eq!(
            parse("color", "var(--fg, black)"),
            Some(SpecifiedValue::Var("var(--fg, black)".into()))
        );
        assert_eq!(
            parse("--brand", " #ff0000 "),
            Some(SpecifiedValue::Raw("#ff0000".into()))
        );
        assert_eq!(
            parse("font-weight", "bolder"),
            Some(SpecifiedValue::Keyword("bolder".into()))
        );
        assert_eq!(parse("font-weight", "1200"), None);
        assert_eq!(
            parse("font-family", "\"Inter\", Helvetica Neue, sans-serif"),
            Some(SpecifiedValue::Family(vec![
                FontFamily::Named("Inter".into()),
                FontFamily::Named("Helvetica Neue".into()),
                FontFamily::SansSerif
            ]))
        );
        assert_eq!(
            parse("grid-template-columns", "repeat(2, 1fr) 100px auto"),
            Some(SpecifiedValue::Tracks(vec![
                TrackSize::Fr(1.0),
                TrackSize::Fr(1.0),
                TrackSize::Px(100.0),
                TrackSize::Auto
            ]))
        );
        assert!(PropertyId::from_name("not-a-property").is_none());
        assert_eq!(
            PropertyId::from_name("overflow-x"),
            Some(PropertyId::OverflowX)
        );
        assert_eq!(
            PropertyId::from_name("margin-inline-start"),
            Some(PropertyId::MarginLeft)
        );
    }

    #[test]
    fn phase_one_property_families_parse() {
        let ok = |p: &str, v: &str| assert!(parse(p, v).is_some(), "{p}: {v} should parse");
        let bad = |p: &str, v: &str| assert!(parse(p, v).is_none(), "{p}: {v} should be rejected");
        ok("display", "table-row-group");
        ok("display", "contents");
        ok("display", "list-item");
        ok("float", "left");
        bad("float", "up");
        ok("clear", "both");
        ok("order", "-2");
        bad("order", "1.5");
        ok("align-self", "flex-end");
        ok("justify-items", "center");
        ok("align-content", "space-between");
        ok("grid-row-start", "span 2");
        ok("grid-column-end", "-1");
        ok("text-overflow", "ellipsis");
        ok("white-space", "pre-wrap");
        ok("white-space", "pre-line");
        ok("white-space", "pre");
        ok("word-break", "break-all");
        ok("overflow-wrap", "anywhere");
        ok("letter-spacing", "normal");
        ok("letter-spacing", "0.1em");
        ok("direction", "rtl");
        ok("unicode-bidi", "isolate");
        ok("vertical-align", "middle");
        ok("vertical-align", "-2px");
        ok("vertical-align", "20%");
        ok("list-style-type", "lower-roman");
        ok("content", "\"a\" attr(title) \" b\"");
        ok("content", "none");
        ok("clip-path", "inset(1px 2px 3px 4px)");
        ok("clip-path", "inset(50%)");
        ok("transform", "translate(10px, 20%) scale(2)");
        ok("transform", "none");
        ok("box-shadow", "0 4px 8px black");
        ok("box-shadow", "none");
        ok("border-top-style", "dashed");
        ok("pointer-events", "none");
        ok("opacity", "0.5");
        ok("z-index", "3");
        ok("box-sizing", "border-box");
        ok("overflow-y", "scroll");
        ok("width", "10ch");
        ok("width", "2rem");
        ok("width", "50vw");
        ok("height", "10vh");
        ok("width", "fit-content");
        ok("color", "rebeccapurple");
        ok("background-color", "hsla(0 0% 0% / 0.5)");
        ok("--x", "anything at all");
        ok("width", "inherit");
        ok("display", "initial");
        ok("color", "unset");
        ok("margin-left", "revert");
        assert_eq!(PropertyId::ALL.len(), 99);
        assert_eq!(
            parse("writing-mode", "vertical-rl"),
            Some(SpecifiedValue::Keyword("vertical-rl".into()))
        );
    }

    #[test]
    fn calc_family_evaluates() {
        let px = |v: &str| {
            let value = parse("width", v).expect("parses");
            let mut style = ComputedStyle::initial();
            let ok = style.set_field(&PropertyId::Width, &value, &ConvertContext::DUMMY);
            assert!(ok, "{v} accepted");
            style.width
        };
        assert_eq!(px("calc(10px + 2em)"), LengthPercentageAuto::Px(42.0));
        assert_eq!(
            px("calc(100% - 20px)"),
            LengthPercentageAuto::Calc {
                px: -20.0,
                percent: 100.0
            }
        );
        assert_eq!(px("calc((10px + 6px) * 2)"), LengthPercentageAuto::Px(32.0));
        assert_eq!(px("calc(30px / 3)"), LengthPercentageAuto::Px(10.0));
        assert_eq!(px("calc(10px -5px)"), LengthPercentageAuto::Px(5.0));
        assert_eq!(px("min(10px, 2em, 40px)"), LengthPercentageAuto::Px(10.0));
        assert_eq!(px("max(10px, 2em)"), LengthPercentageAuto::Px(32.0));
        assert_eq!(px("clamp(10px, 5px, 20px)"), LengthPercentageAuto::Px(10.0));
        assert_eq!(
            px("clamp(10px, 50px, 20px)"),
            LengthPercentageAuto::Px(20.0)
        );
        assert_eq!(px("min(10%, 50%)"), LengthPercentageAuto::Percent(10.0));
        assert!(
            parse("width", "calc(10px + 2)").is_none(),
            "length + number is a type error"
        );
        assert!(
            parse("width", "calc(10px * 2px)").is_none(),
            "length * length is invalid"
        );
        let opacity = parse("opacity", "calc(1 / 4)").unwrap();
        let mut style = ComputedStyle::initial();
        assert!(style.set_field(&PropertyId::Opacity, &opacity, &ConvertContext::DUMMY));
        assert_eq!(style.opacity, 0.25);
        let lh = parse("line-height", "calc(1.5 * 2)").unwrap();
        assert!(style.set_field(&PropertyId::LineHeight, &lh, &ConvertContext::DUMMY));
        assert_eq!(style.line_height, LineHeight::Number(3.0));
    }

    #[test]
    fn expands_shorthands() {
        let out = expand("margin", "1px 2em").unwrap();
        assert_eq!(out.len(), 4);
        assert_eq!(
            out[0],
            (
                PropertyId::MarginTop,
                SpecifiedValue::Length(Length::Px(1.0))
            )
        );
        assert_eq!(
            out[3],
            (
                PropertyId::MarginLeft,
                SpecifiedValue::Length(Length::Em(2.0))
            )
        );

        let out = expand("border", "2px solid red").unwrap();
        assert_eq!(out.len(), 12, "width, style and colour for four sides");
        assert!(out.iter().any(|(p, v)| *p == PropertyId::BorderLeftWidth
            && *v == SpecifiedValue::Length(Length::Px(2.0))));
        assert!(out.iter().any(|(p, v)| *p == PropertyId::BorderTopStyle
            && *v == SpecifiedValue::Keyword("solid".into())));
        assert!(out.iter().any(|(p, v)| *p == PropertyId::BorderTopColor
            && *v == SpecifiedValue::Keyword("red".into())));

        let out = expand("flex", "1").unwrap();
        assert_eq!(
            out[2],
            (PropertyId::FlexBasis, SpecifiedValue::Percentage(0.0))
        );
        let out = expand("flex", "1 0 auto").unwrap();
        assert_eq!(out[1], (PropertyId::FlexShrink, SpecifiedValue::Integer(0)));

        let out = expand("overflow", "hidden auto").unwrap();
        assert_eq!(
            out[0],
            (
                PropertyId::OverflowX,
                SpecifiedValue::Keyword("hidden".into())
            )
        );
        assert_eq!(
            out[1],
            (
                PropertyId::OverflowY,
                SpecifiedValue::Keyword("auto".into())
            )
        );

        let out = expand("grid-area", "1 / 2 / 3 / 4").unwrap();
        assert_eq!(
            out[3],
            (
                PropertyId::GridColumnEnd,
                SpecifiedValue::GridLine(GridLine::Line(4))
            )
        );
        let out = expand("grid-column", "2 / span 3").unwrap();
        assert_eq!(
            out[1],
            (
                PropertyId::GridColumnEnd,
                SpecifiedValue::GridLine(GridLine::Span(3))
            )
        );
        let out = expand("grid-row", "3").unwrap();
        assert_eq!(
            out[1],
            (
                PropertyId::GridRowEnd,
                SpecifiedValue::Keyword("auto".into())
            )
        );

        let out = expand("flex-flow", "column wrap").unwrap();
        assert_eq!(out[0].1, SpecifiedValue::Keyword("column".into()));
        assert_eq!(out[1].1, SpecifiedValue::Keyword("wrap".into()));

        let out = expand("font", "italic bold 12px/1.5 \"Inter\", serif").unwrap();
        assert_eq!(
            out[2],
            (
                PropertyId::FontSize,
                SpecifiedValue::Length(Length::Px(12.0))
            )
        );
        assert_eq!(
            out[3],
            (PropertyId::LineHeight, SpecifiedValue::Number(1.5))
        );
        assert_eq!(
            out[0],
            (
                PropertyId::FontStyle,
                SpecifiedValue::Keyword("italic".into())
            )
        );

        let out = expand("background", "url(x.png) no-repeat red").unwrap();
        assert_eq!(
            out[0],
            (
                PropertyId::BackgroundColor,
                SpecifiedValue::Keyword("red".into())
            )
        );
        let out = expand("background", "url(x.png)").unwrap();
        assert_eq!(
            out[0],
            (
                PropertyId::BackgroundColor,
                SpecifiedValue::Color(Color::Rgba(Rgba::TRANSPARENT))
            )
        );

        let out = expand("list-style", "none inside").unwrap();
        assert_eq!(out[0].1, SpecifiedValue::Keyword("none".into()));
        assert_eq!(out[1].1, SpecifiedValue::Keyword("inside".into()));

        let out = expand("border-spacing", "4px").unwrap();
        assert_eq!(
            out[1],
            (
                PropertyId::BorderSpacingY,
                SpecifiedValue::Length(Length::Px(4.0))
            )
        );

        let mut input = cssparser::ParserInput::new("1px");
        let mut parser = Parser::new(&mut input);
        assert!(
            expand_shorthand("color", &mut parser).is_none(),
            "not a shorthand"
        );
    }
}
