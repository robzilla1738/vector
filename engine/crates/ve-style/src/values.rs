//! Specified and computed CSS value types.
//!
//! Types here are shared by the property table ([`crate::properties`]), the
//! computed style ([`crate::computed`]) and downstream consumers (layout,
//! graphics, accessibility). Keyword enums implement [`Keyword`] so that the
//! property table can parse them generically.

use serde::{Deserialize, Serialize};
use ve_core::Size;

/// A keyword-valued CSS type.
pub trait Keyword: Sized {
    /// Parses the ASCII case-insensitive keyword.
    fn from_keyword(kw: &str) -> Option<Self>;
    /// The canonical keyword.
    fn keyword(&self) -> &'static str;
}

macro_rules! keyword_enum {
    ($(#[$meta:meta])* $name:ident { $( $(#[$vmeta:meta])* $variant:ident = $kw:literal ),+ $(,)? }) => {
        $(#[$meta])*
        #[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
        #[serde(rename_all = "kebab-case")]
        pub enum $name { $( $(#[$vmeta])* $variant, )+ }

        impl Keyword for $name {
            fn from_keyword(kw: &str) -> Option<Self> {
                $( if kw.eq_ignore_ascii_case($kw) { return Some(Self::$variant); } )+
                None
            }
            fn keyword(&self) -> &'static str {
                match self { $( Self::$variant => $kw, )+ }
            }
        }

        impl std::fmt::Display for $name {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                f.write_str(self.keyword())
            }
        }
    };
}

keyword_enum! {
    /// The `display` property (outer + inner display types collapsed into the
    /// legacy single keywords the engine implements).
    Display {
        /// Generates no box; descendants are not rendered.
        None = "none",
        /// Block-level block container.
        Block = "block",
        /// Inline-level, participates in an inline formatting context.
        Inline = "inline",
        /// Inline-level block container (atomic inline).
        InlineBlock = "inline-block",
        /// Block-level flex container.
        Flex = "flex",
        /// Inline-level flex container.
        InlineFlex = "inline-flex",
        /// Block-level grid container.
        Grid = "grid",
        /// Inline-level grid container.
        InlineGrid = "inline-grid",
        /// Block with a `::marker`.
        ListItem = "list-item",
        /// Treated as `block` in M0.
        Table = "table",
        /// Treated as `block` in M0.
        TableRow = "table-row",
        /// Treated as `inline-block` in M0.
        TableCell = "table-cell",
        /// The element itself generates no box but its children do.
        Contents = "contents",
        /// Block-level formatting context root.
        FlowRoot = "flow-root",
    }
}

impl Display {
    /// Returns `true` if the element is block-level (starts on a new line).
    #[must_use]
    pub fn is_block_level(self) -> bool {
        matches!(
            self,
            Display::Block
                | Display::Flex
                | Display::Grid
                | Display::ListItem
                | Display::Table
                | Display::TableRow
                | Display::FlowRoot
        )
    }

    /// Returns `true` if the element is inline-level.
    #[must_use]
    pub fn is_inline_level(self) -> bool {
        matches!(
            self,
            Display::Inline
                | Display::InlineBlock
                | Display::InlineFlex
                | Display::InlineGrid
                | Display::TableCell
        )
    }

    /// Returns `true` for `flex` / `inline-flex`.
    #[must_use]
    pub fn is_flex(self) -> bool {
        matches!(self, Display::Flex | Display::InlineFlex)
    }

    /// Returns `true` for `grid` / `inline-grid`.
    #[must_use]
    pub fn is_grid(self) -> bool {
        matches!(self, Display::Grid | Display::InlineGrid)
    }

    /// The block-level equivalent (used for absolutely positioned and floated
    /// elements, whose display is "blockified").
    #[must_use]
    pub fn blockified(self) -> Display {
        match self {
            Display::Inline | Display::InlineBlock | Display::TableCell => Display::Block,
            Display::InlineFlex => Display::Flex,
            Display::InlineGrid => Display::Grid,
            other => other,
        }
    }
}

keyword_enum! {
    /// The `position` property.
    Position {
        /// Normal flow.
        Static = "static",
        /// Normal flow, then offset.
        Relative = "relative",
        /// Out of flow, positioned against the nearest positioned ancestor.
        Absolute = "absolute",
        /// Out of flow, positioned against the viewport.
        Fixed = "fixed",
        /// Relative until a scroll threshold; treated as `relative` in M0.
        Sticky = "sticky",
    }
}

impl Position {
    /// Returns `true` if the element establishes a containing block for
    /// absolutely positioned descendants.
    #[must_use]
    pub fn is_positioned(self) -> bool {
        self != Position::Static
    }

    /// Returns `true` for `absolute` / `fixed`.
    #[must_use]
    pub fn is_out_of_flow(self) -> bool {
        matches!(self, Position::Absolute | Position::Fixed)
    }
}

keyword_enum! {
    /// The `text-align` property.
    TextAlign {
        /// Start edge of the line box.
        Start = "start",
        /// End edge of the line box.
        End = "end",
        /// Left.
        Left = "left",
        /// Right.
        Right = "right",
        /// Centred.
        Center = "center",
        /// Justified (treated as `start` in M0).
        Justify = "justify",
    }
}

keyword_enum! {
    /// The `visibility` property.
    Visibility {
        /// Rendered.
        Visible = "visible",
        /// Not rendered but takes space.
        Hidden = "hidden",
        /// Like `hidden` outside tables.
        Collapse = "collapse",
    }
}

keyword_enum! {
    /// The `overflow` property (both axes).
    Overflow {
        /// Content may overflow.
        Visible = "visible",
        /// Clipped; scrollable programmatically.
        Hidden = "hidden",
        /// Clipped; not scrollable.
        Clip = "clip",
        /// Always shows scrollbars.
        Scroll = "scroll",
        /// Scrollbars when needed.
        Auto = "auto",
    }
}

impl Overflow {
    /// Returns `true` if the box clips its content.
    #[must_use]
    pub fn clips(self) -> bool {
        self != Overflow::Visible
    }

    /// Returns `true` if the box is a scroll container.
    #[must_use]
    pub fn is_scrollable(self) -> bool {
        matches!(self, Overflow::Hidden | Overflow::Scroll | Overflow::Auto)
    }
}

keyword_enum! {
    /// The `white-space` property.
    WhiteSpace {
        /// Collapse and wrap.
        Normal = "normal",
        /// Collapse, never wrap.
        Nowrap = "nowrap",
        /// Preserve, never wrap.
        Pre = "pre",
        /// Preserve and wrap.
        PreWrap = "pre-wrap",
        /// Collapse spaces, preserve newlines, wrap.
        PreLine = "pre-line",
    }
}

impl WhiteSpace {
    /// Whether runs of whitespace collapse.
    #[must_use]
    pub fn collapses(self) -> bool {
        matches!(
            self,
            WhiteSpace::Normal | WhiteSpace::Nowrap | WhiteSpace::PreLine
        )
    }

    /// Whether soft wrapping is allowed.
    #[must_use]
    pub fn wraps(self) -> bool {
        matches!(
            self,
            WhiteSpace::Normal | WhiteSpace::PreWrap | WhiteSpace::PreLine
        )
    }

    /// Whether newlines in the source are preserved.
    #[must_use]
    pub fn preserves_newlines(self) -> bool {
        matches!(
            self,
            WhiteSpace::Pre | WhiteSpace::PreWrap | WhiteSpace::PreLine
        )
    }
}

keyword_enum! {
    /// The `flex-direction` property.
    FlexDirection {
        /// Main axis horizontal.
        Row = "row",
        /// Horizontal, reversed.
        RowReverse = "row-reverse",
        /// Main axis vertical.
        Column = "column",
        /// Vertical, reversed.
        ColumnReverse = "column-reverse",
    }
}

keyword_enum! {
    /// The `flex-wrap` property.
    FlexWrap {
        /// Single line.
        NoWrap = "nowrap",
        /// Multiple lines.
        Wrap = "wrap",
        /// Multiple lines, cross axis reversed.
        WrapReverse = "wrap-reverse",
    }
}

keyword_enum! {
    /// The `justify-content` property.
    JustifyContent {
        /// Pack toward main-start.
        FlexStart = "flex-start",
        /// Pack toward main-end.
        FlexEnd = "flex-end",
        /// Pack toward start.
        Start = "start",
        /// Pack toward end.
        End = "end",
        /// Centre.
        Center = "center",
        /// Equal space between items.
        SpaceBetween = "space-between",
        /// Equal space around items.
        SpaceAround = "space-around",
        /// Equal space between and around.
        SpaceEvenly = "space-evenly",
        /// Stretch auto-sized items.
        Stretch = "stretch",
    }
}

keyword_enum! {
    /// The `align-items` / `align-self` property.
    AlignItems {
        /// Fill the cross axis.
        Stretch = "stretch",
        /// Cross-start.
        FlexStart = "flex-start",
        /// Cross-end.
        FlexEnd = "flex-end",
        /// Start.
        Start = "start",
        /// End.
        End = "end",
        /// Centre.
        Center = "center",
        /// Align baselines.
        Baseline = "baseline",
    }
}

keyword_enum! {
    /// The `font-style` property.
    FontStyle {
        /// Upright.
        Normal = "normal",
        /// Italic face.
        Italic = "italic",
        /// Slanted.
        Oblique = "oblique",
    }
}

keyword_enum! {
    /// The `box-sizing` property.
    BoxSizing {
        /// `width` is the content width.
        ContentBox = "content-box",
        /// `width` includes padding and border.
        BorderBox = "border-box",
    }
}

keyword_enum! {
    /// The `pointer-events` property.
    PointerEvents {
        /// Normal hit testing.
        Auto = "auto",
        /// Transparent to hit testing.
        None = "none",
    }
}

keyword_enum! {
    /// The `text-decoration-line` property (single value).
    TextDecorationLine {
        /// No decoration.
        None = "none",
        /// Underline.
        Underline = "underline",
        /// Strike through.
        LineThrough = "line-through",
        /// Overline.
        Overline = "overline",
    }
}

keyword_enum! {
    /// The `text-transform` property.
    TextTransform {
        /// As written.
        None = "none",
        /// Upper-case.
        Uppercase = "uppercase",
        /// Lower-case.
        Lowercase = "lowercase",
        /// Title-case each word.
        Capitalize = "capitalize",
    }
}

/// A specified length with its unit. Absolute units are normalised to pixels
/// at parse time; relative units are resolved during computation.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub enum Length {
    /// CSS pixels (also `pt`, `cm`, `mm`, `in`, `pc`, `q` after conversion).
    Px(f32),
    /// Relative to the element's (or for `font-size`, the parent's) font size.
    Em(f32),
    /// Relative to the root element's font size.
    Rem(f32),
    /// Percentage of the viewport width.
    Vw(f32),
    /// Percentage of the viewport height.
    Vh(f32),
    /// Smaller of `vw` / `vh`.
    Vmin(f32),
    /// Larger of `vw` / `vh`.
    Vmax(f32),
}

impl Length {
    /// Zero pixels.
    pub const ZERO: Self = Self::Px(0.0);

    /// Creates a length from a number and a unit, or `None` for unknown units.
    #[must_use]
    pub fn from_unit(value: f32, unit: &str) -> Option<Self> {
        Some(match unit.to_ascii_lowercase().as_str() {
            "px" => Self::Px(value),
            "pt" => Self::Px(value * 96.0 / 72.0),
            "pc" => Self::Px(value * 16.0),
            "in" => Self::Px(value * 96.0),
            "cm" => Self::Px(value * 96.0 / 2.54),
            "mm" => Self::Px(value * 96.0 / 25.4),
            "q" => Self::Px(value * 96.0 / 101.6),
            "em" => Self::Em(value),
            "rem" => Self::Rem(value),
            "vw" => Self::Vw(value),
            "vh" => Self::Vh(value),
            "vmin" => Self::Vmin(value),
            "vmax" => Self::Vmax(value),
            _ => return None,
        })
    }

    /// Resolves to pixels.
    #[must_use]
    pub fn to_px(self, ctx: &LengthContext) -> f32 {
        match self {
            Self::Px(v) => v,
            Self::Em(v) => v * ctx.font_size,
            Self::Rem(v) => v * ctx.root_font_size,
            Self::Vw(v) => v * ctx.viewport.width / 100.0,
            Self::Vh(v) => v * ctx.viewport.height / 100.0,
            Self::Vmin(v) => v * ctx.viewport.width.min(ctx.viewport.height) / 100.0,
            Self::Vmax(v) => v * ctx.viewport.width.max(ctx.viewport.height) / 100.0,
        }
    }
}

/// Everything needed to turn a relative [`Length`] into pixels.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct LengthContext {
    /// Font size the `em` unit is relative to.
    pub font_size: f32,
    /// Root element font size (`rem`).
    pub root_font_size: f32,
    /// Viewport size (`vw`, `vh`).
    pub viewport: Size,
}

/// A computed `<length-percentage>`: pixels, or a percentage that layout
/// resolves against the containing block.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub enum LengthPercentage {
    /// Absolute pixels.
    Px(f32),
    /// Percentage of the containing block dimension (0–100).
    Percent(f32),
}

impl LengthPercentage {
    /// Zero.
    pub const ZERO: Self = Self::Px(0.0);

    /// Resolves against `basis` (the containing block dimension).
    #[must_use]
    pub fn resolve(self, basis: f32) -> f32 {
        match self {
            Self::Px(v) => v,
            Self::Percent(p) => basis * p / 100.0,
        }
    }

    /// Resolves against an optional basis; percentages of an indefinite basis
    /// yield `None`.
    #[must_use]
    pub fn maybe_resolve(self, basis: Option<f32>) -> Option<f32> {
        match self {
            Self::Px(v) => Some(v),
            Self::Percent(p) => basis.map(|b| b * p / 100.0),
        }
    }
}

/// A computed `<length-percentage> | auto`.
#[derive(Clone, Copy, Debug, PartialEq, Default, Serialize, Deserialize)]
pub enum LengthPercentageAuto {
    /// `auto`.
    #[default]
    Auto,
    /// Absolute pixels.
    Px(f32),
    /// Percentage of the containing block dimension.
    Percent(f32),
}

impl LengthPercentageAuto {
    /// Resolves against `basis`; `auto` yields `None`.
    #[must_use]
    pub fn resolve(self, basis: f32) -> Option<f32> {
        match self {
            Self::Auto => None,
            Self::Px(v) => Some(v),
            Self::Percent(p) => Some(basis * p / 100.0),
        }
    }

    /// Resolves against an optional basis; `auto` and percentages of an
    /// indefinite basis yield `None`.
    #[must_use]
    pub fn maybe_resolve(self, basis: Option<f32>) -> Option<f32> {
        match self {
            Self::Auto => None,
            Self::Px(v) => Some(v),
            Self::Percent(p) => basis.map(|b| b * p / 100.0),
        }
    }

    /// Returns `true` for `auto`.
    #[must_use]
    pub fn is_auto(self) -> bool {
        matches!(self, Self::Auto)
    }
}

/// A computed `<length-percentage> | none` (max-width / max-height).
#[derive(Clone, Copy, Debug, PartialEq, Default, Serialize, Deserialize)]
pub enum MaxSize {
    /// No constraint.
    #[default]
    None,
    /// Absolute pixels.
    Px(f32),
    /// Percentage of the containing block dimension.
    Percent(f32),
}

impl MaxSize {
    /// Resolves against `basis`; `none` yields `None`.
    #[must_use]
    pub fn resolve(self, basis: f32) -> Option<f32> {
        match self {
            Self::None => None,
            Self::Px(v) => Some(v),
            Self::Percent(p) => Some(basis * p / 100.0),
        }
    }
}

/// An sRGB colour with alpha, components in `0..=255` / `0.0..=1.0`.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub struct Rgba {
    /// Red.
    pub r: u8,
    /// Green.
    pub g: u8,
    /// Blue.
    pub b: u8,
    /// Alpha, `1.0` is opaque.
    pub a: f32,
}

impl Rgba {
    /// Opaque black.
    pub const BLACK: Self = Self::rgb(0, 0, 0);
    /// Opaque white.
    pub const WHITE: Self = Self::rgb(255, 255, 255);
    /// Fully transparent black.
    pub const TRANSPARENT: Self = Self {
        r: 0,
        g: 0,
        b: 0,
        a: 0.0,
    };

    /// Opaque colour from components.
    #[must_use]
    pub const fn rgb(r: u8, g: u8, b: u8) -> Self {
        Self { r, g, b, a: 1.0 }
    }

    /// Colour from components and alpha.
    #[must_use]
    pub const fn rgba(r: u8, g: u8, b: u8, a: f32) -> Self {
        Self { r, g, b, a }
    }

    /// Returns `true` if the colour is fully transparent.
    #[must_use]
    pub fn is_transparent(self) -> bool {
        self.a <= 0.0
    }

    /// Parses `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa` (without the `#`).
    #[must_use]
    pub fn from_hex(hex: &str) -> Option<Self> {
        let digits: Vec<u8> = hex
            .chars()
            .map(|c| c.to_digit(16).map(|d| d as u8))
            .collect::<Option<_>>()?;
        let (r, g, b, a) = match digits.as_slice() {
            [r, g, b] => (r * 17, g * 17, b * 17, 255),
            [r, g, b, a] => (r * 17, g * 17, b * 17, a * 17),
            [r1, r2, g1, g2, b1, b2] => (r1 * 16 + r2, g1 * 16 + g2, b1 * 16 + b2, 255),
            [r1, r2, g1, g2, b1, b2, a1, a2] => {
                (r1 * 16 + r2, g1 * 16 + g2, b1 * 16 + b2, a1 * 16 + a2)
            }
            _ => return None,
        };
        Some(Self {
            r,
            g,
            b,
            a: f32::from(a) / 255.0,
        })
    }

    /// Looks up a CSS named colour (case-insensitive).
    #[must_use]
    pub fn from_name(name: &str) -> Option<Self> {
        let lower = name.to_ascii_lowercase();
        let (r, g, b, a) = match lower.as_str() {
            "transparent" => (0, 0, 0, 0.0),
            "black" => (0, 0, 0, 1.0),
            "white" => (255, 255, 255, 1.0),
            "red" => (255, 0, 0, 1.0),
            "lime" => (0, 255, 0, 1.0),
            "green" => (0, 128, 0, 1.0),
            "blue" => (0, 0, 255, 1.0),
            "yellow" => (255, 255, 0, 1.0),
            "cyan" | "aqua" => (0, 255, 255, 1.0),
            "magenta" | "fuchsia" => (255, 0, 255, 1.0),
            "gray" | "grey" => (128, 128, 128, 1.0),
            "silver" => (192, 192, 192, 1.0),
            "maroon" => (128, 0, 0, 1.0),
            "olive" => (128, 128, 0, 1.0),
            "navy" => (0, 0, 128, 1.0),
            "purple" => (128, 0, 128, 1.0),
            "teal" => (0, 128, 128, 1.0),
            "orange" => (255, 165, 0, 1.0),
            "pink" => (255, 192, 203, 1.0),
            "brown" => (165, 42, 42, 1.0),
            "gold" => (255, 215, 0, 1.0),
            "indigo" => (75, 0, 130, 1.0),
            "violet" => (238, 130, 238, 1.0),
            "coral" => (255, 127, 80, 1.0),
            "salmon" => (250, 128, 114, 1.0),
            "tomato" => (255, 99, 71, 1.0),
            "crimson" => (220, 20, 60, 1.0),
            "khaki" => (240, 230, 140, 1.0),
            "beige" => (245, 245, 220, 1.0),
            "ivory" => (255, 255, 240, 1.0),
            "linen" => (250, 240, 230, 1.0),
            "lightgray" | "lightgrey" => (211, 211, 211, 1.0),
            "darkgray" | "darkgrey" => (169, 169, 169, 1.0),
            "dimgray" | "dimgrey" => (105, 105, 105, 1.0),
            "whitesmoke" => (245, 245, 245, 1.0),
            "gainsboro" => (220, 220, 220, 1.0),
            "lightblue" => (173, 216, 230, 1.0),
            "skyblue" => (135, 206, 235, 1.0),
            "steelblue" => (70, 130, 180, 1.0),
            "royalblue" => (65, 105, 225, 1.0),
            "dodgerblue" => (30, 144, 255, 1.0),
            "darkblue" => (0, 0, 139, 1.0),
            "darkgreen" => (0, 100, 0, 1.0),
            "darkred" => (139, 0, 0, 1.0),
            "lightgreen" => (144, 238, 144, 1.0),
            "seagreen" => (46, 139, 87, 1.0),
            "forestgreen" => (34, 139, 34, 1.0),
            "rebeccapurple" => (102, 51, 153, 1.0),
            "slategray" | "slategrey" => (112, 128, 144, 1.0),
            "lightyellow" => (255, 255, 224, 1.0),
            "wheat" => (245, 222, 179, 1.0),
            "tan" => (210, 180, 140, 1.0),
            "chocolate" => (210, 105, 30, 1.0),
            "firebrick" => (178, 34, 34, 1.0),
            "orangered" => (255, 69, 0, 1.0),
            "hotpink" => (255, 105, 180, 1.0),
            "deeppink" => (255, 20, 147, 1.0),
            "turquoise" => (64, 224, 208, 1.0),
            "aquamarine" => (127, 255, 212, 1.0),
            "lavender" => (230, 230, 250, 1.0),
            "plum" => (221, 160, 221, 1.0),
            "orchid" => (218, 112, 214, 1.0),
            "canvas" => (255, 255, 255, 1.0),
            "canvastext" => (0, 0, 0, 1.0),
            "linktext" => (0, 0, 238, 1.0),
            "visitedtext" => (85, 26, 139, 1.0),
            "buttonface" => (239, 239, 239, 1.0),
            "buttontext" => (0, 0, 0, 1.0),
            "field" => (255, 255, 255, 1.0),
            "fieldtext" => (0, 0, 0, 1.0),
            "graytext" => (128, 128, 128, 1.0),
            "highlight" => (0, 120, 215, 1.0),
            "highlighttext" => (255, 255, 255, 1.0),
            _ => return None,
        };
        Some(Self { r, g, b, a })
    }

    /// CSS serialisation (`rgb(r, g, b)` or `rgba(r, g, b, a)`).
    #[must_use]
    pub fn to_css_string(self) -> String {
        if (self.a - 1.0).abs() < f32::EPSILON {
            format!("rgb({}, {}, {})", self.r, self.g, self.b)
        } else {
            format!("rgba({}, {}, {}, {})", self.r, self.g, self.b, self.a)
        }
    }
}

/// A specified colour: either concrete or `currentcolor`.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub enum Color {
    /// A concrete colour.
    Rgba(Rgba),
    /// The value of the `color` property.
    CurrentColor,
}

impl Color {
    /// Resolves `currentcolor` against `current`.
    #[must_use]
    pub fn resolve(self, current: Rgba) -> Rgba {
        match self {
            Self::Rgba(c) => c,
            Self::CurrentColor => current,
        }
    }
}

/// A computed font weight (`1..=1000`).
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[serde(transparent)]
pub struct FontWeight(pub u16);

impl FontWeight {
    /// `normal` (400).
    pub const NORMAL: Self = Self(400);
    /// `bold` (700).
    pub const BOLD: Self = Self(700);

    /// Returns `true` for weights of 600 and above.
    #[must_use]
    pub fn is_bold(self) -> bool {
        self.0 >= 600
    }

    /// `bolder` relative to `self`, per CSS Fonts 4.
    #[must_use]
    pub fn bolder(self) -> Self {
        Self(match self.0 {
            0..=349 => 400,
            350..=549 => 700,
            _ => 900,
        })
    }

    /// `lighter` relative to `self`, per CSS Fonts 4.
    #[must_use]
    pub fn lighter(self) -> Self {
        Self(match self.0 {
            0..=549 => 100,
            550..=749 => 400,
            _ => 700,
        })
    }
}

impl Default for FontWeight {
    fn default() -> Self {
        Self::NORMAL
    }
}

/// The computed `line-height`.
#[derive(Clone, Copy, Debug, PartialEq, Default, Serialize, Deserialize)]
pub enum LineHeight {
    /// `normal`: use font metrics (~1.2 in M0).
    #[default]
    Normal,
    /// Unitless multiplier of the font size.
    Number(f32),
    /// Absolute pixels.
    Px(f32),
}

impl LineHeight {
    /// Resolves to pixels for a given font size.
    #[must_use]
    pub fn to_px(self, font_size: f32) -> f32 {
        match self {
            Self::Normal => font_size * 1.2,
            Self::Number(n) => font_size * n,
            Self::Px(px) => px,
        }
    }
}

/// The computed `z-index`.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default, Serialize, Deserialize)]
pub enum ZIndex {
    /// `auto`: no new stacking context from z-index alone.
    #[default]
    Auto,
    /// An integer stacking level.
    Integer(i32),
}

/// A single generic or named font family.
#[derive(Clone, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum FontFamily {
    /// A named family (`"Inter"`).
    Named(String),
    /// `serif`
    Serif,
    /// `sans-serif`
    SansSerif,
    /// `monospace`
    Monospace,
    /// `cursive`
    Cursive,
    /// `fantasy`
    Fantasy,
    /// `system-ui`
    SystemUi,
}

impl FontFamily {
    /// Parses a generic family keyword; other identifiers become `Named`.
    #[must_use]
    pub fn from_ident(ident: &str) -> Self {
        match ident.to_ascii_lowercase().as_str() {
            "serif" => Self::Serif,
            "sans-serif" => Self::SansSerif,
            "monospace" => Self::Monospace,
            "cursive" => Self::Cursive,
            "fantasy" => Self::Fantasy,
            "system-ui" | "ui-sans-serif" => Self::SystemUi,
            _ => Self::Named(ident.to_owned()),
        }
    }

    /// Returns `true` if this is a generic family.
    #[must_use]
    pub fn is_generic(&self) -> bool {
        !matches!(self, Self::Named(_))
    }
}

/// A grid track size (subset of `<track-size>`).
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub enum TrackSize {
    /// Fixed pixels.
    Px(f32),
    /// Percentage of the grid container.
    Percent(f32),
    /// Flexible fraction.
    Fr(f32),
    /// `auto`.
    Auto,
    /// `min-content`.
    MinContent,
    /// `max-content`.
    MaxContent,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn colours_parse_from_hex_and_names() {
        assert_eq!(Rgba::from_hex("f00"), Some(Rgba::rgb(255, 0, 0)));
        assert_eq!(
            Rgba::from_hex("00ff0080").map(|c| (c.g, (c.a * 255.0).round() as u8)),
            Some((255, 128))
        );
        assert_eq!(
            Rgba::from_name("RebeccaPurple"),
            Some(Rgba::rgb(102, 51, 153))
        );
        assert!(Rgba::from_hex("12345").is_none());
        assert!(Rgba::from_name("nope").is_none());
    }

    #[test]
    fn lengths_resolve_against_context() {
        let ctx = LengthContext {
            font_size: 20.0,
            root_font_size: 16.0,
            viewport: Size::new(1000.0, 500.0),
        };
        assert_eq!(Length::from_unit(2.0, "em").unwrap().to_px(&ctx), 40.0);
        assert_eq!(Length::from_unit(1.5, "rem").unwrap().to_px(&ctx), 24.0);
        assert_eq!(Length::from_unit(10.0, "vw").unwrap().to_px(&ctx), 100.0);
        assert_eq!(Length::from_unit(72.0, "pt").unwrap().to_px(&ctx), 96.0);
        assert!(Length::from_unit(1.0, "parsec").is_none());
        assert_eq!(
            LengthPercentageAuto::Percent(50.0).resolve(200.0),
            Some(100.0)
        );
        assert_eq!(FontWeight::NORMAL.bolder(), FontWeight::BOLD);
        assert_eq!(
            Display::from_keyword("INLINE-block"),
            Some(Display::InlineBlock)
        );
    }
}
