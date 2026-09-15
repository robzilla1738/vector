//! The property table: [`PropertyId`], [`SpecifiedValue`], value parsing,
//! shorthand expansion and the generated [`ComputedStyle`] struct.
//!
//! The table is a single macro invocation ([`property_table!`]) so that the
//! property enum, the computed-style struct, initial values, inheritance and
//! the specified→computed converters can never drift apart. Adding a longhand
//! is one line.

use std::collections::BTreeMap;

use cssparser::{Parser, Token};
use ve_core::Size;

use crate::values::{
    AlignItems, BoxSizing, Color, Display, FlexDirection, FlexWrap, FontFamily, FontStyle,
    FontWeight, JustifyContent, Keyword, Length, LengthContext, LengthPercentage,
    LengthPercentageAuto, LineHeight, MaxSize, Overflow, PointerEvents, Position, Rgba, TextAlign,
    TextDecorationLine, TextTransform, TrackSize, Visibility, WhiteSpace, ZIndex,
};

/// Custom property store: raw token text keyed by `--name`.
pub type CustomProperties = BTreeMap<String, String>;

/// A parsed but not yet computed value.
#[derive(Clone, Debug, PartialEq)]
pub enum SpecifiedValue {
    /// `inherit`
    Inherit,
    /// `initial`
    Initial,
    /// `unset`
    Unset,
    /// `revert` (treated as `unset` in M0: there is no user origin).
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

    pub fn length_px(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<f32> {
        match v {
            SpecifiedValue::Length(l) => Some(l.to_px(&ctx.lengths())),
            // Unitless zero is a valid `<length>`.
            SpecifiedValue::Number(n) if *n == 0.0 => Some(0.0),
            SpecifiedValue::Integer(0) => Some(0.0),
            _ => None,
        }
    }

    pub fn lp(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<LengthPercentage> {
        match v {
            SpecifiedValue::Percentage(p) => Some(LengthPercentage::Percent(*p)),
            _ => length_px(v, ctx).map(LengthPercentage::Px),
        }
    }

    /// `<length-percentage> | auto`, with `auto` mapped to zero (min-width/height).
    pub fn lp_auto_zero(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<LengthPercentage> {
        if v.keyword() == Some("auto") {
            return Some(LengthPercentage::ZERO);
        }
        lp(v, ctx)
    }

    pub fn lpa(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<LengthPercentageAuto> {
        match v {
            SpecifiedValue::Keyword(k) if k == "auto" => Some(LengthPercentageAuto::Auto),
            SpecifiedValue::Percentage(p) => Some(LengthPercentageAuto::Percent(*p)),
            _ => length_px(v, ctx).map(LengthPercentageAuto::Px),
        }
    }

    pub fn flex_basis(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<LengthPercentageAuto> {
        if v.keyword() == Some("content") {
            return Some(LengthPercentageAuto::Auto);
        }
        lpa(v, ctx)
    }

    pub fn max_size(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<MaxSize> {
        match v {
            SpecifiedValue::Keyword(k) if k == "none" => Some(MaxSize::None),
            SpecifiedValue::Percentage(p) => Some(MaxSize::Percent(*p)),
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

    pub fn opacity(v: &SpecifiedValue, _: &ConvertContext) -> Option<f32> {
        match v {
            SpecifiedValue::Number(n) => Some(n.clamp(0.0, 1.0)),
            SpecifiedValue::Integer(i) => Some((*i as f32).clamp(0.0, 1.0)),
            SpecifiedValue::Percentage(p) => Some((p / 100.0).clamp(0.0, 1.0)),
            _ => None,
        }
    }

    pub fn non_negative_number(v: &SpecifiedValue, _: &ConvertContext) -> Option<f32> {
        match v {
            SpecifiedValue::Number(n) if *n >= 0.0 => Some(*n),
            SpecifiedValue::Integer(i) if *i >= 0 => Some(*i as f32),
            _ => None,
        }
    }

    pub fn font_size(v: &SpecifiedValue, ctx: &ConvertContext) -> Option<f32> {
        let parent = ctx.parent_font_size;
        let px = match v {
            SpecifiedValue::Length(Length::Em(em)) => em * parent,
            SpecifiedValue::Length(l) => l.to_px(&ctx.lengths()),
            SpecifiedValue::Percentage(p) => parent * p / 100.0,
            SpecifiedValue::Number(n) if *n == 0.0 => 0.0,
            SpecifiedValue::Integer(0) => 0.0,
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
            _ => None,
        }
    }

    pub fn z_index(v: &SpecifiedValue, _: &ConvertContext) -> Option<ZIndex> {
        match v {
            SpecifiedValue::Keyword(k) if k == "auto" => Some(ZIndex::Auto),
            SpecifiedValue::Integer(i) => Some(ZIndex::Integer(*i)),
            _ => None,
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
            /// Looks a property up by (ASCII case-insensitive) name. Legacy
            /// aliases (`overflow-x`, `text-decoration`) map to their longhand.
            #[must_use]
            pub fn from_name(name: &str) -> Option<Self> {
                let lower = name.to_ascii_lowercase();
                match lower.as_str() {
                    $( $css => Some(Self::$variant), )+
                    "overflow-x" | "overflow-y" => Some(Self::Overflow),
                    "text-decoration" => Some(Self::TextDecorationLine),
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
    /// `width`
    Width: "width" => width: LengthPercentageAuto = LengthPercentageAuto::Auto, inherited = false, syntax = Single, convert = conv::lpa;
    /// `height`
    Height: "height" => height: LengthPercentageAuto = LengthPercentageAuto::Auto, inherited = false, syntax = Single, convert = conv::lpa;
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
    /// `border-top-width` (pixels)
    BorderTopWidth: "border-top-width" => border_top_width: f32 = 0.0, inherited = false, syntax = Single, convert = conv::border_width;
    /// `border-right-width` (pixels)
    BorderRightWidth: "border-right-width" => border_right_width: f32 = 0.0, inherited = false, syntax = Single, convert = conv::border_width;
    /// `border-bottom-width` (pixels)
    BorderBottomWidth: "border-bottom-width" => border_bottom_width: f32 = 0.0, inherited = false, syntax = Single, convert = conv::border_width;
    /// `border-left-width` (pixels)
    BorderLeftWidth: "border-left-width" => border_left_width: f32 = 0.0, inherited = false, syntax = Single, convert = conv::border_width;
    /// `border-top-color`
    BorderTopColor: "border-top-color" => border_top_color: Color = Color::CurrentColor, inherited = false, syntax = Single, convert = conv::color;
    /// `border-right-color`
    BorderRightColor: "border-right-color" => border_right_color: Color = Color::CurrentColor, inherited = false, syntax = Single, convert = conv::color;
    /// `border-bottom-color`
    BorderBottomColor: "border-bottom-color" => border_bottom_color: Color = Color::CurrentColor, inherited = false, syntax = Single, convert = conv::color;
    /// `border-left-color`
    BorderLeftColor: "border-left-color" => border_left_color: Color = Color::CurrentColor, inherited = false, syntax = Single, convert = conv::color;
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
    /// `overflow` (both axes; `overflow-x`/`-y` alias to it)
    Overflow: "overflow" => overflow: Overflow = Overflow::Visible, inherited = false, syntax = Single, convert = conv::kw::<Overflow>;
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
    /// `text-align`
    TextAlign: "text-align" => text_align: TextAlign = TextAlign::Start, inherited = true, syntax = Single, convert = conv::kw::<TextAlign>;
    /// `text-decoration-line` (single keyword; `text-decoration` aliases to it)
    TextDecorationLine: "text-decoration-line" => text_decoration_line: TextDecorationLine = TextDecorationLine::None, inherited = false, syntax = Single, convert = conv::kw::<TextDecorationLine>;
    /// `text-transform`
    TextTransform: "text-transform" => text_transform: TextTransform = TextTransform::None, inherited = true, syntax = Single, convert = conv::kw::<TextTransform>;
    /// `white-space`
    WhiteSpace: "white-space" => white_space: WhiteSpace = WhiteSpace::Normal, inherited = true, syntax = Single, convert = conv::kw::<WhiteSpace>;
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
    /// `justify-content`
    JustifyContent: "justify-content" => justify_content: JustifyContent = JustifyContent::FlexStart, inherited = false, syntax = Single, convert = conv::kw::<JustifyContent>;
    /// `align-items`
    AlignItems: "align-items" => align_items: AlignItems = AlignItems::Stretch, inherited = false, syntax = Single, convert = conv::kw::<AlignItems>;
    /// `row-gap`
    RowGap: "row-gap" => row_gap: LengthPercentage = LengthPercentage::ZERO, inherited = false, syntax = Single, convert = conv::lp;
    /// `column-gap`
    ColumnGap: "column-gap" => column_gap: LengthPercentage = LengthPercentage::ZERO, inherited = false, syntax = Single, convert = conv::lp;
    /// `grid-template-columns` (explicit tracks only; empty = `none`)
    GridTemplateColumns: "grid-template-columns" => grid_template_columns: Vec<TrackSize> = Vec::new(), inherited = false, syntax = TrackList, convert = conv::tracks;
    /// `grid-template-rows` (explicit tracks only; empty = `none`)
    GridTemplateRows: "grid-template-rows" => grid_template_rows: Vec<TrackSize> = Vec::new(), inherited = false, syntax = TrackList, convert = conv::tracks;
}

// ---------------------------------------------------------------------------
// Value parsing
// ---------------------------------------------------------------------------

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
                "revert" => SpecifiedValue::Revert,
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
        Token::Function(name)
            if name.eq_ignore_ascii_case("rgb") || name.eq_ignore_ascii_case("rgba") =>
        {
            let rgba = input
                .parse_nested_block(|args| {
                    parse_rgb_args(args).ok_or_else(|| args.new_error_for_next_token::<()>())
                })
                .ok()?;
            SpecifiedValue::Color(Color::Rgba(rgba))
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
            _ => None,
        }
    }
    let r = channel(input)?;
    let _ = input.try_parse(Parser::expect_comma);
    let g = channel(input)?;
    let _ = input.try_parse(Parser::expect_comma);
    let b = channel(input)?;
    let mut a = 1.0;
    if input.try_parse(Parser::expect_comma).is_ok()
        || input.try_parse(|i| i.expect_delim('/')).is_ok()
    {
        a = match input.next().ok()?.clone() {
            Token::Number { value, .. } => value.clamp(0.0, 1.0),
            Token::Percentage { unit_value, .. } => unit_value.clamp(0.0, 1.0),
            _ => return None,
        };
    }
    input.expect_exhausted().ok()?;
    Some(Rgba::rgba(r, g, b, a))
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
            Token::Function(name) if name.eq_ignore_ascii_case("repeat") => {
                let (count, inner) = input
                    .parse_nested_block(|args| {
                        let count = args.expect_integer()?;
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
            _ => return None,
        };
        tracks.push(track);
    }
    Some(SpecifiedValue::Tracks(tracks))
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
        let value = match self.syntax() {
            ValueSyntax::Single | ValueSyntax::Raw => parse_component(input)?,
            ValueSyntax::FamilyList => {
                if let Ok(v) = input.try_parse(|i| {
                    parse_component(i)
                        .filter(SpecifiedValue::is_css_wide)
                        .ok_or(())
                }) {
                    v
                } else {
                    parse_family_list(input)?
                }
            }
            ValueSyntax::TrackList => {
                if let Ok(v) = input.try_parse(|i| {
                    parse_component(i)
                        .filter(SpecifiedValue::is_css_wide)
                        .ok_or(())
                }) {
                    v
                } else {
                    parse_track_list(input)?
                }
            }
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

const BORDER_STYLES: &[&str] = &[
    "none", "hidden", "solid", "dashed", "dotted", "double", "groove", "ridge", "inset", "outset",
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
    let border_side =
        |side: usize, input: &mut Parser<'i, '_>| -> Option<Vec<(P, SpecifiedValue)>> {
            let widths = [
                P::BorderTopWidth,
                P::BorderRightWidth,
                P::BorderBottomWidth,
                P::BorderLeftWidth,
            ];
            let colors = [
                P::BorderTopColor,
                P::BorderRightColor,
                P::BorderBottomColor,
                P::BorderLeftColor,
            ];
            let mut width = SpecifiedValue::Keyword("medium".into());
            let mut color = SpecifiedValue::Color(Color::CurrentColor);
            let mut has_style = false;
            for v in parse_components(input, 3)? {
                match &v {
                    SpecifiedValue::Keyword(k) if BORDER_STYLES.contains(&k.as_str()) => {
                        has_style = true;
                        if k == "none" || k == "hidden" {
                            width = SpecifiedValue::Length(Length::ZERO);
                        }
                    }
                    _ if widths[0].accepts(&v) => width = v,
                    _ if colors[0].accepts(&v) => color = v,
                    _ => return None,
                }
            }
            if !has_style {
                // `border: 1px red` without a style renders no border.
                width = SpecifiedValue::Length(Length::ZERO);
            }
            let idx: Vec<usize> = if side == 4 {
                vec![0, 1, 2, 3]
            } else {
                vec![side]
            };
            Some(
                idx.into_iter()
                    .flat_map(|i| {
                        [
                            (widths[i].clone(), width.clone()),
                            (colors[i].clone(), color.clone()),
                        ]
                    })
                    .collect(),
            )
        };
    let result = match lower.as_str() {
        "margin" => four(
            [P::MarginTop, P::MarginRight, P::MarginBottom, P::MarginLeft],
            input,
        ),
        "padding" => four(
            [
                P::PaddingTop,
                P::PaddingRight,
                P::PaddingBottom,
                P::PaddingLeft,
            ],
            input,
        ),
        "inset" => four([P::Top, P::Right, P::Bottom, P::Left], input),
        "border-width" => four(
            [
                P::BorderTopWidth,
                P::BorderRightWidth,
                P::BorderBottomWidth,
                P::BorderLeftWidth,
            ],
            input,
        ),
        "border-color" => four(
            [
                P::BorderTopColor,
                P::BorderRightColor,
                P::BorderBottomColor,
                P::BorderLeftColor,
            ],
            input,
        ),
        "border" => border_side(4, input),
        "border-top" => border_side(0, input),
        "border-right" => border_side(1, input),
        "border-bottom" => border_side(2, input),
        "border-left" => border_side(3, input),
        "gap" | "grid-gap" => {
            let values = parse_components(input, 2)?;
            let row = values[0].clone();
            let col = values.get(1).cloned().unwrap_or_else(|| row.clone());
            (P::RowGap.accepts(&row) && P::ColumnGap.accepts(&col))
                .then(|| vec![(P::RowGap, row), (P::ColumnGap, col)])
        }
        "background" => {
            let values = parse_components(input, 1)?;
            P::BackgroundColor
                .accepts(&values[0])
                .then(|| vec![(P::BackgroundColor, values[0].clone())])
        }
        "flex" => {
            let values = parse_components(input, 3)?;
            let (grow, shrink, basis) = match values.as_slice() {
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
                [SpecifiedValue::Keyword(k)] if k == "initial" => (
                    SpecifiedValue::Number(0.0),
                    SpecifiedValue::Number(1.0),
                    SpecifiedValue::Keyword("auto".into()),
                ),
                [g @ (SpecifiedValue::Number(_) | SpecifiedValue::Integer(_))] => (
                    g.clone(),
                    SpecifiedValue::Number(1.0),
                    SpecifiedValue::Percentage(0.0),
                ),
                [
                    g @ (SpecifiedValue::Number(_) | SpecifiedValue::Integer(_)),
                    s @ (SpecifiedValue::Number(_) | SpecifiedValue::Integer(_)),
                ] => (g.clone(), s.clone(), SpecifiedValue::Percentage(0.0)),
                [
                    g @ (SpecifiedValue::Number(_) | SpecifiedValue::Integer(_)),
                    b,
                ] => (g.clone(), SpecifiedValue::Number(1.0), b.clone()),
                [g, s, b] => (g.clone(), s.clone(), b.clone()),
                [b] => (
                    SpecifiedValue::Number(1.0),
                    SpecifiedValue::Number(1.0),
                    b.clone(),
                ),
                _ => return Some(None),
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
        _ => return None,
    };
    Some(result.filter(|_| input.is_exhausted()))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn parse(prop: &str, value: &str) -> Option<SpecifiedValue> {
        PropertyId::from_name(prop).unwrap().parse_value_str(value)
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
            Some(PropertyId::Overflow)
        );
    }

    #[test]
    fn expands_shorthands() {
        let mut input = cssparser::ParserInput::new("1px 2em");
        let mut parser = Parser::new(&mut input);
        let out = expand_shorthand("margin", &mut parser).unwrap().unwrap();
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

        let mut input = cssparser::ParserInput::new("2px solid red");
        let mut parser = Parser::new(&mut input);
        let out = expand_shorthand("border", &mut parser).unwrap().unwrap();
        assert_eq!(out.len(), 8);
        assert!(out.iter().any(|(p, v)| *p == PropertyId::BorderLeftWidth
            && *v == SpecifiedValue::Length(Length::Px(2.0))));
        assert!(out.iter().any(|(p, v)| *p == PropertyId::BorderTopColor
            && *v == SpecifiedValue::Keyword("red".into())));

        let mut input = cssparser::ParserInput::new("1");
        let mut parser = Parser::new(&mut input);
        let out = expand_shorthand("flex", &mut parser).unwrap().unwrap();
        assert_eq!(
            out[2],
            (PropertyId::FlexBasis, SpecifiedValue::Percentage(0.0))
        );

        let mut input = cssparser::ParserInput::new("1px");
        let mut parser = Parser::new(&mut input);
        assert!(
            expand_shorthand("color", &mut parser).is_none(),
            "not a shorthand"
        );
    }
}
