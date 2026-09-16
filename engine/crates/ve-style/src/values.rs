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
        /// Block-level table wrapper.
        Table = "table",
        /// Inline-level table wrapper.
        InlineTable = "inline-table",
        /// Table row group (`<tbody>`).
        TableRowGroup = "table-row-group",
        /// Table header group (`<thead>`).
        TableHeaderGroup = "table-header-group",
        /// Table footer group (`<tfoot>`).
        TableFooterGroup = "table-footer-group",
        /// Table row (`<tr>`).
        TableRow = "table-row",
        /// Table cell (`<td>`, `<th>`).
        TableCell = "table-cell",
        /// Table column (`<col>`); generates no box of its own.
        TableColumn = "table-column",
        /// Table column group (`<colgroup>`); generates no box of its own.
        TableColumnGroup = "table-column-group",
        /// Table caption (`<caption>`).
        TableCaption = "table-caption",
        /// The element itself generates no box but its children do.
        Contents = "contents",
        /// Block-level formatting context root.
        FlowRoot = "flow-root",
    }
}

impl Display {
    /// Returns `true` if the element is block-level (starts on a new line).
    /// Table-internal boxes count as block-level for the purpose of the
    /// block/inline invariant: they never sit on a line box.
    #[must_use]
    pub fn is_block_level(self) -> bool {
        matches!(
            self,
            Display::Block
                | Display::Flex
                | Display::Grid
                | Display::ListItem
                | Display::Table
                | Display::FlowRoot
        ) || self.is_table_internal()
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
                | Display::InlineTable
        )
    }

    /// Returns `true` for `table` / `inline-table`.
    #[must_use]
    pub fn is_table(self) -> bool {
        matches!(self, Display::Table | Display::InlineTable)
    }

    /// Returns `true` for row groups, rows, cells, columns and captions.
    #[must_use]
    pub fn is_table_internal(self) -> bool {
        matches!(
            self,
            Display::TableRowGroup
                | Display::TableHeaderGroup
                | Display::TableFooterGroup
                | Display::TableRow
                | Display::TableCell
                | Display::TableColumn
                | Display::TableColumnGroup
                | Display::TableCaption
        )
    }

    /// Returns `true` for the three row-group display types.
    #[must_use]
    pub fn is_table_row_group(self) -> bool {
        matches!(
            self,
            Display::TableRowGroup | Display::TableHeaderGroup | Display::TableFooterGroup
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
            Display::Inline | Display::InlineBlock => Display::Block,
            Display::InlineFlex => Display::Flex,
            Display::InlineGrid => Display::Grid,
            Display::InlineTable => Display::Table,
            other if other.is_table_internal() => Display::Block,
            other => other,
        }
    }
}

keyword_enum! {
    /// The `float` property.
    Float {
        /// Not floated.
        None = "none",
        /// Floated to the left edge of the containing block.
        Left = "left",
        /// Floated to the right edge of the containing block.
        Right = "right",
    }
}

keyword_enum! {
    /// The `clear` property.
    Clear {
        /// No clearance.
        None = "none",
        /// Clear left floats.
        Left = "left",
        /// Clear right floats.
        Right = "right",
        /// Clear both.
        Both = "both",
    }
}

keyword_enum! {
    /// The `direction` property.
    Direction {
        /// Left to right.
        Ltr = "ltr",
        /// Right to left.
        Rtl = "rtl",
    }
}

keyword_enum! {
    /// The `unicode-bidi` property.
    UnicodeBidi {
        /// No additional embedding.
        Normal = "normal",
        /// Opens an embedding level.
        Embed = "embed",
        /// Isolates the content.
        Isolate = "isolate",
        /// Overrides the bidi algorithm.
        BidiOverride = "bidi-override",
        /// Isolate + override.
        IsolateOverride = "isolate-override",
        /// Direction from the first strong character.
        Plaintext = "plaintext",
    }
}

keyword_enum! {
    /// The `word-break` property.
    WordBreak {
        /// Break at normal opportunities.
        Normal = "normal",
        /// Break anywhere.
        BreakAll = "break-all",
        /// No breaks inside CJK words.
        KeepAll = "keep-all",
        /// Legacy alias of `overflow-wrap: anywhere`.
        BreakWord = "break-word",
    }
}

keyword_enum! {
    /// The `overflow-wrap` property.
    OverflowWrap {
        /// Only break at normal opportunities.
        Normal = "normal",
        /// Break long words when they would overflow.
        BreakWord = "break-word",
        /// Like `break-word`, also affects min-content.
        Anywhere = "anywhere",
    }
}

keyword_enum! {
    /// The `text-overflow` property.
    TextOverflow {
        /// Clip overflowing text.
        Clip = "clip",
        /// Show an ellipsis.
        Ellipsis = "ellipsis",
    }
}

keyword_enum! {
    /// The `list-style-type` property (keyword subset; strings are `Custom`).
    ListStyleType {
        /// No marker.
        None = "none",
        /// Filled circle.
        Disc = "disc",
        /// Hollow circle.
        Circle = "circle",
        /// Filled square.
        Square = "square",
        /// `1.`
        Decimal = "decimal",
        /// `01.`
        DecimalLeadingZero = "decimal-leading-zero",
        /// `a.`
        LowerAlpha = "lower-alpha",
        /// `A.`
        UpperAlpha = "upper-alpha",
        /// `a.` (alias)
        LowerLatin = "lower-latin",
        /// `A.` (alias)
        UpperLatin = "upper-latin",
        /// `i.`
        LowerRoman = "lower-roman",
        /// `I.`
        UpperRoman = "upper-roman",
    }
}

impl ListStyleType {
    /// The marker text for the 1-based ordinal `n` (without trailing space).
    #[must_use]
    pub fn marker_text(self, n: i32) -> String {
        fn alpha(n: i32, upper: bool) -> String {
            let mut n = n.max(1);
            let mut out = Vec::new();
            while n > 0 {
                n -= 1;
                let c = b'a' + (n % 26) as u8;
                out.push(if upper { c.to_ascii_uppercase() } else { c });
                n /= 26;
            }
            out.reverse();
            String::from_utf8(out).unwrap_or_default()
        }
        fn roman(n: i32, upper: bool) -> String {
            if !(1..4000).contains(&n) {
                return n.to_string();
            }
            const TABLE: [(i32, &str); 13] = [
                (1000, "m"),
                (900, "cm"),
                (500, "d"),
                (400, "cd"),
                (100, "c"),
                (90, "xc"),
                (50, "l"),
                (40, "xl"),
                (10, "x"),
                (9, "ix"),
                (5, "v"),
                (4, "iv"),
                (1, "i"),
            ];
            let mut n = n;
            let mut out = String::new();
            for (value, text) in TABLE {
                while n >= value {
                    out.push_str(text);
                    n -= value;
                }
            }
            if upper { out.to_uppercase() } else { out }
        }
        match self {
            Self::None => String::new(),
            Self::Disc => "\u{2022}".to_owned(),
            Self::Circle => "\u{25E6}".to_owned(),
            Self::Square => "\u{25AA}".to_owned(),
            Self::Decimal => format!("{n}."),
            Self::DecimalLeadingZero => format!("{n:02}."),
            Self::LowerAlpha | Self::LowerLatin => format!("{}.", alpha(n, false)),
            Self::UpperAlpha | Self::UpperLatin => format!("{}.", alpha(n, true)),
            Self::LowerRoman => format!("{}.", roman(n, false)),
            Self::UpperRoman => format!("{}.", roman(n, true)),
        }
    }
}

keyword_enum! {
    /// The `border-*-style` properties.
    BorderStyle {
        /// No border (width computes to zero).
        None = "none",
        /// Like `none`, but wins in collapsed table borders.
        Hidden = "hidden",
        /// Solid line.
        Solid = "solid",
        /// Dashed.
        Dashed = "dashed",
        /// Dotted.
        Dotted = "dotted",
        /// Double line.
        Double = "double",
        /// 3D groove.
        Groove = "groove",
        /// 3D ridge.
        Ridge = "ridge",
        /// 3D inset.
        Inset = "inset",
        /// 3D outset.
        Outset = "outset",
    }
}

impl BorderStyle {
    /// Returns `true` if the style paints nothing (`none` / `hidden`).
    #[must_use]
    pub fn is_none(self) -> bool {
        matches!(self, Self::None | Self::Hidden)
    }
}

keyword_enum! {
    /// The `border-collapse` property.
    BorderCollapse {
        /// Separate borders with `border-spacing`.
        Separate = "separate",
        /// Adjacent borders collapse into one.
        Collapse = "collapse",
    }
}

keyword_enum! {
    /// The `caption-side` property.
    CaptionSide {
        /// Caption above the table.
        Top = "top",
        /// Caption below the table.
        Bottom = "bottom",
    }
}

keyword_enum! {
    /// The `list-style-position` property.
    ListStylePosition {
        /// Marker outside the principal box.
        Outside = "outside",
        /// Marker is the first inline content.
        Inside = "inside",
    }
}

keyword_enum! {
    /// `align-self` / `justify-self`: the item-level alignment keywords.
    SelfAlignment {
        /// Use the container's `align-items` / `justify-items`.
        Auto = "auto",
        /// Behaves as `stretch` (flex) / `start` (grid absolutely positioned).
        Normal = "normal",
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
        /// Start of the item itself.
        SelfStart = "self-start",
        /// End of the item itself.
        SelfEnd = "self-end",
        /// Centre.
        Center = "center",
        /// Align baselines.
        Baseline = "baseline",
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
        /// Like `pre-wrap`; preserved spaces also take space at line ends.
        BreakSpaces = "break-spaces",
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
            WhiteSpace::Normal
                | WhiteSpace::PreWrap
                | WhiteSpace::PreLine
                | WhiteSpace::BreakSpaces
        )
    }

    /// Whether newlines in the source are preserved.
    #[must_use]
    pub fn preserves_newlines(self) -> bool {
        matches!(
            self,
            WhiteSpace::Pre | WhiteSpace::PreWrap | WhiteSpace::PreLine | WhiteSpace::BreakSpaces
        )
    }
}

/// The computed `vertical-align`.
#[derive(Clone, Copy, Debug, PartialEq, Default, Serialize, Deserialize)]
pub enum VerticalAlign {
    /// Align the baseline with the parent's baseline.
    #[default]
    Baseline,
    /// Lower the baseline (subscript).
    Sub,
    /// Raise the baseline (superscript).
    Super,
    /// Align the top with the line box top.
    Top,
    /// Align the top with the parent's content-area top.
    TextTop,
    /// Centre on the parent's baseline plus half the x-height.
    Middle,
    /// Align the bottom with the line box bottom.
    Bottom,
    /// Align the bottom with the parent's content-area bottom.
    TextBottom,
    /// Raise the baseline by this many pixels (negative lowers).
    Length(f32),
    /// Raise the baseline by this percentage of the line height.
    Percent(f32),
}

impl VerticalAlign {
    /// Parses a keyword value.
    #[must_use]
    pub fn from_keyword(kw: &str) -> Option<Self> {
        Some(match kw.to_ascii_lowercase().as_str() {
            "baseline" => Self::Baseline,
            "sub" => Self::Sub,
            "super" => Self::Super,
            "top" => Self::Top,
            "text-top" => Self::TextTop,
            "middle" => Self::Middle,
            "bottom" => Self::Bottom,
            "text-bottom" => Self::TextBottom,
            _ => return None,
        })
    }
}

/// A computed `grid-row-start` / `grid-column-end` value.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default, Serialize, Deserialize)]
pub enum GridLine {
    /// Auto-placed.
    #[default]
    Auto,
    /// A specific line number (1-based, negative counts from the end).
    Line(i32),
    /// Span this many tracks from the opposite edge.
    Span(u32),
}

/// One component of the `content` property.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum ContentItem {
    /// A literal string.
    Text(String),
    /// `attr(name)`: the value of an attribute of the originating element.
    Attr(String),
    /// `open-quote`.
    OpenQuote,
    /// `close-quote`.
    CloseQuote,
    /// `no-open-quote` / `no-close-quote`.
    NoQuote,
    /// `counter(...)` / `counters(...)` / `url(...)` — recognised but
    /// contributes no text in M1.
    Ignored,
}

/// The computed `content` property.
#[derive(Clone, Debug, PartialEq, Eq, Default, Serialize, Deserialize)]
pub enum Content {
    /// `normal`: no generated box for `::before` / `::after`.
    #[default]
    Normal,
    /// `none`.
    None,
    /// A list of items (resolved to text by the style engine for pseudo-elements).
    Items(Vec<ContentItem>),
    /// Already-resolved text (what a `::before`/`::after` box renders).
    Text(String),
}

impl Content {
    /// Returns `true` if a `::before` / `::after` box is generated.
    #[must_use]
    pub fn generates_box(&self) -> bool {
        matches!(self, Self::Items(_) | Self::Text(_))
    }

    /// Resolves the items to text using `attr` for `attr()` references.
    #[must_use]
    pub fn resolve(&self, attr: impl Fn(&str) -> Option<String>) -> Option<String> {
        match self {
            Self::Normal | Self::None => None,
            Self::Text(t) => Some(t.clone()),
            Self::Items(items) => {
                let mut out = String::new();
                for item in items {
                    match item {
                        ContentItem::Text(t) => out.push_str(t),
                        ContentItem::Attr(name) => {
                            if let Some(v) = attr(name) {
                                out.push_str(&v);
                            }
                        }
                        ContentItem::OpenQuote => out.push('\u{201C}'),
                        ContentItem::CloseQuote => out.push('\u{201D}'),
                        ContentItem::NoQuote | ContentItem::Ignored => {}
                    }
                }
                Some(out)
            }
        }
    }
}

/// The computed `clip-path` (only `inset()` is understood).
#[derive(Clone, Copy, Debug, PartialEq, Default, Serialize, Deserialize)]
pub enum ClipPath {
    /// No clipping.
    #[default]
    None,
    /// `inset(top right bottom left)` from the border box.
    Inset {
        /// Top inset.
        top: LengthPercentage,
        /// Right inset.
        right: LengthPercentage,
        /// Bottom inset.
        bottom: LengthPercentage,
        /// Left inset.
        left: LengthPercentage,
    },
}

/// One `transform` function (only the geometry-affecting subset).
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub enum TransformOp {
    /// `translate(x, y)` — percentages refer to the box's own border box.
    Translate(LengthPercentage, LengthPercentage),
    /// `scale(x, y)` about the transform origin (box centre).
    Scale(f32, f32),
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
        /// `normal`: behaves as `stretch` for `align-content`, `flex-start`
        /// for `justify-content`.
        Normal = "normal",
        /// Left (treated as `start`).
        Left = "left",
        /// Right (treated as `end`).
        Right = "right",
        /// Baseline (treated as `start` for content distribution).
        Baseline = "baseline",
    }
}

keyword_enum! {
    /// The `align-items` / `justify-items` property.
    AlignItems {
        /// Fill the cross axis.
        Stretch = "stretch",
        /// `normal`: `stretch` in flex and grid.
        Normal = "normal",
        /// Cross-start.
        FlexStart = "flex-start",
        /// Cross-end.
        FlexEnd = "flex-end",
        /// Start.
        Start = "start",
        /// End.
        End = "end",
        /// Start of the item itself.
        SelfStart = "self-start",
        /// End of the item itself.
        SelfEnd = "self-end",
        /// Centre.
        Center = "center",
        /// Align baselines.
        Baseline = "baseline",
        /// Legacy `left` (`justify-items`), treated as `start`.
        Left = "left",
        /// Legacy `right` (`justify-items`), treated as `end`.
        Right = "right",
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
    /// Advance of `0` in the element's font: `0.5em` under the engine's
    /// deterministic metrics (see `ve-layout::MetricShaper`).
    Ch(f32),
    /// x-height of the element's font: `0.5em` under the deterministic metrics.
    Ex(f32),
}

impl Length {
    /// Zero pixels.
    pub const ZERO: Self = Self::Px(0.0);

    /// `ch` and `ex` as a fraction of the font size (matches `MetricShaper`).
    pub const CH_RATIO: f32 = 0.5;

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
            "vw" | "svw" | "lvw" | "dvw" | "vi" => Self::Vw(value),
            "vh" | "svh" | "lvh" | "dvh" | "vb" => Self::Vh(value),
            "vmin" => Self::Vmin(value),
            "vmax" => Self::Vmax(value),
            "ch" => Self::Ch(value),
            "ex" => Self::Ex(value),
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
            Self::Ch(v) | Self::Ex(v) => v * ctx.font_size * Self::CH_RATIO,
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
    /// `calc()` mixing both: `px + percent% of the basis`.
    Calc {
        /// Pixel part.
        px: f32,
        /// Percentage part (0–100).
        percent: f32,
    },
}

impl LengthPercentage {
    /// Zero.
    pub const ZERO: Self = Self::Px(0.0);

    /// Builds the simplest representation of `px + percent%`.
    #[must_use]
    pub fn from_parts(px: f32, percent: f32) -> Self {
        if percent == 0.0 {
            Self::Px(px)
        } else if px == 0.0 {
            Self::Percent(percent)
        } else {
            Self::Calc { px, percent }
        }
    }

    /// Resolves against `basis` (the containing block dimension).
    #[must_use]
    pub fn resolve(self, basis: f32) -> f32 {
        match self {
            Self::Px(v) => v,
            Self::Percent(p) => basis * p / 100.0,
            Self::Calc { px, percent } => px + basis * percent / 100.0,
        }
    }

    /// Resolves against an optional basis; percentages of an indefinite basis
    /// yield `None`.
    #[must_use]
    pub fn maybe_resolve(self, basis: Option<f32>) -> Option<f32> {
        match self {
            Self::Px(v) => Some(v),
            Self::Percent(_) | Self::Calc { .. } => basis.map(|b| self.resolve(b)),
        }
    }

    /// Returns `true` if the value depends on the containing block.
    #[must_use]
    pub fn has_percent(self) -> bool {
        !matches!(self, Self::Px(_))
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
    /// `calc()` mixing both.
    Calc {
        /// Pixel part.
        px: f32,
        /// Percentage part (0–100).
        percent: f32,
    },
}

impl LengthPercentageAuto {
    /// Resolves against `basis`; `auto` yields `None`.
    #[must_use]
    pub fn resolve(self, basis: f32) -> Option<f32> {
        match self {
            Self::Auto => None,
            Self::Px(v) => Some(v),
            Self::Percent(p) => Some(basis * p / 100.0),
            Self::Calc { px, percent } => Some(px + basis * percent / 100.0),
        }
    }

    /// Resolves against an optional basis; `auto` and percentages of an
    /// indefinite basis yield `None`.
    #[must_use]
    pub fn maybe_resolve(self, basis: Option<f32>) -> Option<f32> {
        match self {
            Self::Auto => None,
            Self::Px(v) => Some(v),
            Self::Percent(_) | Self::Calc { .. } => basis.and_then(|b| self.resolve(b)),
        }
    }

    /// Returns `true` for `auto`.
    #[must_use]
    pub fn is_auto(self) -> bool {
        matches!(self, Self::Auto)
    }

    /// Returns `true` for a definite pixel value.
    #[must_use]
    pub fn is_definite_px(self) -> bool {
        matches!(self, Self::Px(_))
    }

    /// The non-auto part, if any.
    #[must_use]
    pub fn to_length_percentage(self) -> Option<LengthPercentage> {
        match self {
            Self::Auto => None,
            Self::Px(v) => Some(LengthPercentage::Px(v)),
            Self::Percent(p) => Some(LengthPercentage::Percent(p)),
            Self::Calc { px, percent } => Some(LengthPercentage::Calc { px, percent }),
        }
    }
}

impl From<LengthPercentage> for LengthPercentageAuto {
    fn from(v: LengthPercentage) -> Self {
        match v {
            LengthPercentage::Px(px) => Self::Px(px),
            LengthPercentage::Percent(p) => Self::Percent(p),
            LengthPercentage::Calc { px, percent } => Self::Calc { px, percent },
        }
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
    /// `calc()` mixing both.
    Calc {
        /// Pixel part.
        px: f32,
        /// Percentage part (0–100).
        percent: f32,
    },
}

impl MaxSize {
    /// Resolves against `basis`; `none` yields `None`.
    #[must_use]
    pub fn resolve(self, basis: f32) -> Option<f32> {
        match self {
            Self::None => None,
            Self::Px(v) => Some(v),
            Self::Percent(p) => Some(basis * p / 100.0),
            Self::Calc { px, percent } => Some(px + basis * percent / 100.0),
        }
    }

    /// Resolves against an optional basis; `none` and percentages of an
    /// indefinite basis yield `None`.
    #[must_use]
    pub fn maybe_resolve(self, basis: Option<f32>) -> Option<f32> {
        match self {
            Self::None => None,
            Self::Px(v) => Some(v),
            Self::Percent(_) | Self::Calc { .. } => basis.and_then(|b| self.resolve(b)),
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

    /// Looks up a CSS named colour or system colour (case-insensitive).
    #[must_use]
    pub fn from_name(name: &str) -> Option<Self> {
        let lower = name.to_ascii_lowercase();
        if lower == "transparent" {
            return Some(Self::TRANSPARENT);
        }
        NAMED_COLORS
            .binary_search_by(|(n, _)| n.cmp(&lower.as_str()))
            .ok()
            .map(|i| {
                let rgb = NAMED_COLORS[i].1;
                Self::rgb(
                    (rgb >> 16) as u8,
                    (rgb >> 8 & 0xff) as u8,
                    (rgb & 0xff) as u8,
                )
            })
    }

    /// Converts `hsl()` components (hue in degrees, saturation and lightness
    /// in `0..=1`) to sRGB.
    #[must_use]
    pub fn from_hsl(hue: f32, saturation: f32, lightness: f32, alpha: f32) -> Self {
        let h = hue.rem_euclid(360.0) / 30.0;
        let s = saturation.clamp(0.0, 1.0);
        let l = lightness.clamp(0.0, 1.0);
        let a = s * l.min(1.0 - l);
        let f = |n: f32| {
            let k = (n + h).rem_euclid(12.0);
            l - a * (k - 3.0).min(9.0 - k).clamp(-1.0, 1.0)
        };
        let channel = |v: f32| (v * 255.0).round().clamp(0.0, 255.0) as u8;
        Self::rgba(
            channel(f(0.0)),
            channel(f(8.0)),
            channel(f(4.0)),
            alpha.clamp(0.0, 1.0),
        )
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

/// CSS Color 4 named colours plus the CSS system colours, sorted by name
/// for binary search.
const NAMED_COLORS: &[(&str, u32)] = &[
    ("aliceblue", 0xf0f8ff),
    ("antiquewhite", 0xfaebd7),
    ("aqua", 0x00ffff),
    ("aquamarine", 0x7fffd4),
    ("azure", 0xf0ffff),
    ("beige", 0xf5f5dc),
    ("bisque", 0xffe4c4),
    ("black", 0x000000),
    ("blanchedalmond", 0xffebcd),
    ("blue", 0x0000ff),
    ("blueviolet", 0x8a2be2),
    ("brown", 0xa52a2a),
    ("burlywood", 0xdeb887),
    ("cadetblue", 0x5f9ea0),
    ("chartreuse", 0x7fff00),
    ("chocolate", 0xd2691e),
    ("coral", 0xff7f50),
    ("cornflowerblue", 0x6495ed),
    ("cornsilk", 0xfff8dc),
    ("crimson", 0xdc143c),
    ("cyan", 0x00ffff),
    ("darkblue", 0x00008b),
    ("darkcyan", 0x008b8b),
    ("darkgoldenrod", 0xb8860b),
    ("darkgray", 0xa9a9a9),
    ("darkgreen", 0x006400),
    ("darkgrey", 0xa9a9a9),
    ("darkkhaki", 0xbdb76b),
    ("darkmagenta", 0x8b008b),
    ("darkolivegreen", 0x556b2f),
    ("darkorange", 0xff8c00),
    ("darkorchid", 0x9932cc),
    ("darkred", 0x8b0000),
    ("darksalmon", 0xe9967a),
    ("darkseagreen", 0x8fbc8f),
    ("darkslateblue", 0x483d8b),
    ("darkslategray", 0x2f4f4f),
    ("darkslategrey", 0x2f4f4f),
    ("darkturquoise", 0x00ced1),
    ("darkviolet", 0x9400d3),
    ("deeppink", 0xff1493),
    ("deepskyblue", 0x00bfff),
    ("dimgray", 0x696969),
    ("dimgrey", 0x696969),
    ("dodgerblue", 0x1e90ff),
    ("firebrick", 0xb22222),
    ("floralwhite", 0xfffaf0),
    ("forestgreen", 0x228b22),
    ("fuchsia", 0xff00ff),
    ("gainsboro", 0xdcdcdc),
    ("ghostwhite", 0xf8f8ff),
    ("gold", 0xffd700),
    ("goldenrod", 0xdaa520),
    ("gray", 0x808080),
    ("green", 0x008000),
    ("greenyellow", 0xadff2f),
    ("grey", 0x808080),
    ("honeydew", 0xf0fff0),
    ("hotpink", 0xff69b4),
    ("indianred", 0xcd5c5c),
    ("indigo", 0x4b0082),
    ("ivory", 0xfffff0),
    ("khaki", 0xf0e68c),
    ("lavender", 0xe6e6fa),
    ("lavenderblush", 0xfff0f5),
    ("lawngreen", 0x7cfc00),
    ("lemonchiffon", 0xfffacd),
    ("lightblue", 0xadd8e6),
    ("lightcoral", 0xf08080),
    ("lightcyan", 0xe0ffff),
    ("lightgoldenrodyellow", 0xfafad2),
    ("lightgray", 0xd3d3d3),
    ("lightgreen", 0x90ee90),
    ("lightgrey", 0xd3d3d3),
    ("lightpink", 0xffb6c1),
    ("lightsalmon", 0xffa07a),
    ("lightseagreen", 0x20b2aa),
    ("lightskyblue", 0x87cefa),
    ("lightslategray", 0x778899),
    ("lightslategrey", 0x778899),
    ("lightsteelblue", 0xb0c4de),
    ("lightyellow", 0xffffe0),
    ("lime", 0x00ff00),
    ("limegreen", 0x32cd32),
    ("linen", 0xfaf0e6),
    ("magenta", 0xff00ff),
    ("maroon", 0x800000),
    ("mediumaquamarine", 0x66cdaa),
    ("mediumblue", 0x0000cd),
    ("mediumorchid", 0xba55d3),
    ("mediumpurple", 0x9370db),
    ("mediumseagreen", 0x3cb371),
    ("mediumslateblue", 0x7b68ee),
    ("mediumspringgreen", 0x00fa9a),
    ("mediumturquoise", 0x48d1cc),
    ("mediumvioletred", 0xc71585),
    ("midnightblue", 0x191970),
    ("mintcream", 0xf5fffa),
    ("mistyrose", 0xffe4e1),
    ("moccasin", 0xffe4b5),
    ("navajowhite", 0xffdead),
    ("navy", 0x000080),
    ("oldlace", 0xfdf5e6),
    ("olive", 0x808000),
    ("olivedrab", 0x6b8e23),
    ("orange", 0xffa500),
    ("orangered", 0xff4500),
    ("orchid", 0xda70d6),
    ("palegoldenrod", 0xeee8aa),
    ("palegreen", 0x98fb98),
    ("paleturquoise", 0xafeeee),
    ("palevioletred", 0xdb7093),
    ("papayawhip", 0xffefd5),
    ("peachpuff", 0xffdab9),
    ("peru", 0xcd853f),
    ("pink", 0xffc0cb),
    ("plum", 0xdda0dd),
    ("powderblue", 0xb0e0e6),
    ("purple", 0x800080),
    ("rebeccapurple", 0x663399),
    ("red", 0xff0000),
    ("rosybrown", 0xbc8f8f),
    ("royalblue", 0x4169e1),
    ("saddlebrown", 0x8b4513),
    ("salmon", 0xfa8072),
    ("sandybrown", 0xf4a460),
    ("seagreen", 0x2e8b57),
    ("seashell", 0xfff5ee),
    ("sienna", 0xa0522d),
    ("silver", 0xc0c0c0),
    ("skyblue", 0x87ceeb),
    ("slateblue", 0x6a5acd),
    ("slategray", 0x708090),
    ("slategrey", 0x708090),
    ("snow", 0xfffafa),
    ("springgreen", 0x00ff7f),
    ("steelblue", 0x4682b4),
    ("tan", 0xd2b48c),
    ("teal", 0x008080),
    ("thistle", 0xd8bfd8),
    ("tomato", 0xff6347),
    ("turquoise", 0x40e0d0),
    ("violet", 0xee82ee),
    ("wheat", 0xf5deb3),
    ("white", 0xffffff),
    ("whitesmoke", 0xf5f5f5),
    ("yellow", 0xffff00),
    ("yellowgreen", 0x9acd32),
    ("canvas", 0xffffff),
    ("canvastext", 0x000000),
    ("linktext", 0x0000ee),
    ("visitedtext", 0x551a8b),
    ("activetext", 0xff0000),
    ("buttonface", 0xefefef),
    ("buttontext", 0x000000),
    ("buttonborder", 0x767676),
    ("field", 0xffffff),
    ("fieldtext", 0x000000),
    ("graytext", 0x808080),
    ("highlight", 0x0078d7),
    ("highlighttext", 0xffffff),
    ("mark", 0xffff00),
    ("marktext", 0x000000),
    ("selecteditem", 0x0078d7),
    ("selecteditemtext", 0xffffff),
    ("accentcolor", 0x0078d7),
    ("accentcolortext", 0xffffff),
];

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

    /// CSS serialisation.
    #[must_use]
    pub fn to_css(&self) -> String {
        match self {
            Self::Named(n) => format!("\"{n}\""),
            Self::Serif => "serif".into(),
            Self::SansSerif => "sans-serif".into(),
            Self::Monospace => "monospace".into(),
            Self::Cursive => "cursive".into(),
            Self::Fantasy => "fantasy".into(),
            Self::SystemUi => "system-ui".into(),
        }
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
