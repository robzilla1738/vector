//! Text shaping abstraction: [`TextShaper`], [`ParleyShaper`], [`MetricShaper`].
//!
//! # Deterministic metrics
//!
//! CI machines have no fonts, and geometry must be reproducible across
//! platforms, so the default shaper is [`MetricShaper`]: a documented,
//! font-free metric model. For a font size `s`:
//!
//! | Quantity | Value |
//! |---|---|
//! | ascent | `0.8 s` |
//! | descent | `0.2 s` |
//! | content area | `1.0 s` (ascent + descent) |
//! | `line-height: normal` | `1.2 s` (from `ve-style`) |
//! | baseline in a line of height `h` | `(h - s) / 2 + 0.8 s` (half-leading + ascent) |
//! | advance of a character | `class(c) × s + letter-spacing` |
//!
//! Character classes ([`CharClass`]): `Narrow` (`i j l t f r I . , : ; ' ! \|`
//! and similar) `0.3 s`; `Space` `0.5 s`; `Lower` (other ASCII lowercase)
//! `0.5 s`; `Digit` `0.55 s`; `Upper` (other ASCII uppercase) `0.65 s`;
//! `Wide` (`m w M W @ %` and box-drawing) `0.8 s`; `Ideograph` (CJK,
//! fullwidth) `1.0 s`; `Other` `0.5 s`. Combining marks and zero-width
//! characters advance `0`.
//!
//! [`ParleyShaper`] shapes real glyphs and is used only when fonts have been
//! registered; without fonts it delegates to the metric model.

use std::ops::Range;

use ve_style::{ComputedStyle, FontFamily};

/// One line produced by shaping a text run.
#[derive(Clone, Debug, PartialEq)]
pub struct ShapedLine {
    /// Byte range of the source text on this line (trailing collapsible
    /// whitespace excluded).
    pub range: Range<usize>,
    /// Advance width in pixels.
    pub width: f32,
    /// Line height in pixels.
    pub height: f32,
    /// Baseline offset from the line top.
    pub baseline: f32,
}

/// Measures and line-breaks text. Implementations own their font caches.
pub trait TextShaper {
    /// Breaks `text` into lines. The first line may use only
    /// `first_available` pixels (the rest of the current line box); later
    /// lines get `available`. If `wrap` is `false` everything goes on one
    /// line regardless of width. Never returns an empty vector for non-empty
    /// text.
    fn shape(
        &mut self,
        text: &str,
        style: &ComputedStyle,
        first_available: f32,
        available: f32,
        wrap: bool,
    ) -> Vec<ShapedLine>;

    /// Advance width of `text` laid out on a single line.
    fn measure(&mut self, text: &str, style: &ComputedStyle) -> f32 {
        self.shape(text, style, f32::INFINITY, f32::INFINITY, false)
            .iter()
            .map(|l| l.width)
            .sum()
    }

    /// Width of the widest unbreakable unit (word) of `text`: the
    /// min-content contribution.
    fn min_content(&mut self, text: &str, style: &ComputedStyle) -> f32 {
        text.split([' ', '\n'])
            .map(|w| self.measure(w, style))
            .fold(0.0, f32::max)
    }

    /// Ascent above the baseline for `style`'s font, in pixels.
    fn ascent(&mut self, style: &ComputedStyle) -> f32 {
        style.font_size * MetricShaper::ASCENT_RATIO
    }

    /// Descent below the baseline for `style`'s font, in pixels.
    fn descent(&mut self, style: &ComputedStyle) -> f32 {
        style.font_size * MetricShaper::DESCENT_RATIO
    }

    /// Registers an OpenType/TrueType file. Default is a no-op (metric shaper).
    fn register_font(&mut self, _data: Vec<u8>) -> usize {
        0
    }
}

/// Character width classes of the deterministic metric model.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum CharClass {
    /// Zero-width: combining marks, ZWSP, ZWJ/ZWNJ, soft hyphen.
    Zero,
    /// `i j l t f r I . , : ; ' ! | ` ´ and thin punctuation.
    Narrow,
    /// The space character (and NBSP).
    Space,
    /// Other ASCII lowercase letters.
    Lower,
    /// ASCII digits.
    Digit,
    /// Other ASCII uppercase letters.
    Upper,
    /// `m w M W @ % &` and box drawing.
    Wide,
    /// CJK ideographs, kana, hangul, fullwidth forms.
    Ideograph,
    /// Everything else.
    Other,
}

impl CharClass {
    /// Classifies a character.
    #[must_use]
    pub fn of(c: char) -> Self {
        match c {
            '\u{200B}' | '\u{200C}' | '\u{200D}' | '\u{00AD}' | '\u{FEFF}' | '\u{2060}' => {
                Self::Zero
            }
            '\u{0300}'..='\u{036F}' | '\u{20D0}'..='\u{20FF}' | '\u{FE20}'..='\u{FE2F}' => {
                Self::Zero
            }
            ' ' | '\u{00A0}' | '\t' => Self::Space,
            'i' | 'j' | 'l' | 't' | 'f' | 'r' | 'I' | '.' | ',' | ':' | ';' | '\'' | '!' | '|'
            | '`' | '\u{00B4}' | '(' | ')' | '[' | ']' | '{' | '}' | '/' | '\\' | '"' | '*'
            | '-' | '\u{2019}' | '\u{2018}' | '\u{00B7}' => Self::Narrow,
            'm' | 'w' | 'M' | 'W' | '@' | '%' | '&' | '\u{2500}'..='\u{257F}' => Self::Wide,
            'a'..='z' => Self::Lower,
            '0'..='9' => Self::Digit,
            'A'..='Z' => Self::Upper,
            '\u{1100}'..='\u{11FF}'
            | '\u{2E80}'..='\u{9FFF}'
            | '\u{AC00}'..='\u{D7AF}'
            | '\u{F900}'..='\u{FAFF}'
            | '\u{FF00}'..='\u{FF60}'
            | '\u{FFE0}'..='\u{FFE6}'
            | '\u{20000}'..='\u{2FA1F}' => Self::Ideograph,
            _ => Self::Other,
        }
    }

    /// Advance as a fraction of the font size.
    #[must_use]
    pub fn advance_ratio(self) -> f32 {
        match self {
            Self::Zero => 0.0,
            Self::Narrow => 0.3,
            Self::Space | Self::Lower | Self::Other => 0.5,
            Self::Digit => 0.55,
            Self::Upper => 0.65,
            Self::Wide => 0.8,
            Self::Ideograph => 1.0,
        }
    }
}

/// Deterministic shaper: character advances from [`CharClass`], ascent
/// `0.8em`, descent `0.2em`. See the module documentation.
///
/// Used when no font data is available and in tests. Wrapping is greedy at
/// spaces; forced `\n` breaks are honoured; `word-break: break-all` and
/// `overflow-wrap: anywhere|break-word` allow breaking inside words that do
/// not fit on a line of their own.
#[derive(Clone, Copy, Debug)]
pub struct MetricShaper {
    /// When `true` (the default) every character advances by its class
    /// ratio; when `false` every character advances `0.5em` (the M0 model).
    pub per_class: bool,
}

impl Default for MetricShaper {
    fn default() -> Self {
        Self { per_class: true }
    }
}

impl MetricShaper {
    /// Ascent as a fraction of the font size.
    pub const ASCENT_RATIO: f32 = 0.8;
    /// Descent as a fraction of the font size.
    pub const DESCENT_RATIO: f32 = 0.2;

    /// Advance of one character in pixels (before letter-spacing).
    #[must_use]
    pub fn char_advance(&self, c: char, font_size: f32) -> f32 {
        let ratio = if self.per_class {
            CharClass::of(c).advance_ratio()
        } else {
            0.5
        };
        ratio * font_size
    }

    fn width_of(&self, text: &str, style: &ComputedStyle) -> f32 {
        let mut font_size = style.font_size * style.text_size_adjust.max(0.01);
        if style.math_style == ve_style::MathStyle::Compact {
            font_size *= 0.7;
        }
        let mut width = 0.0;
        let mut chars = 0usize;
        for c in text.chars() {
            let advance = if c == '\t' {
                style.tab_size.max(1) as f32 * self.char_advance(' ', font_size)
            } else {
                self.char_advance(c, font_size)
            };
            width += advance;
            if advance > 0.0 {
                chars += 1;
            }
            if c == ' ' {
                width += style.word_spacing;
            }
        }
        let mut width = width + style.letter_spacing * chars as f32;
        if style.font_variant_ligatures.collapses() {
            width -= count_common_ligatures(text) as f32 * font_size * 0.15;
        }
        if style.font_kerning.applies() {
            width -= count_kern_pairs(text) as f32 * font_size * 0.1;
        }
        width * style.font_stretch.factor()
    }

    /// Baseline offset from the top of a line of `line_height` for `style`.
    #[must_use]
    pub fn baseline_in(style: &ComputedStyle, line_height: f32) -> f32 {
        let half_leading = (line_height - style.font_size) / 2.0;
        half_leading + style.font_size * Self::ASCENT_RATIO
    }
}

fn count_common_ligatures(text: &str) -> usize {
    let bytes = text.as_bytes();
    let mut n = 0;
    let mut i = 0;
    while i + 1 < bytes.len() {
        if bytes[i] == b'f' && matches!(bytes[i + 1], b'i' | b'l' | b'f') {
            n += 1;
            i += 2;
        } else {
            i += 1;
        }
    }
    n
}

fn count_kern_pairs(text: &str) -> usize {
    let mut chars = text.chars().peekable();
    let mut n = 0;
    while let Some(a) = chars.next() {
        let Some(&b) = chars.peek() else { break };
        if matches!(
            (a, b),
            ('A', 'V') | ('V', 'A') | ('T', 'o') | ('W', 'e') | ('A', 'W') | ('W', 'A')
        ) {
            n += 1;
        }
    }
    n
}

/// Whether `style` lets a word be broken anywhere when it would overflow.
fn breaks_words(style: &ComputedStyle) -> bool {
    matches!(
        style.word_break,
        ve_style::WordBreak::BreakAll | ve_style::WordBreak::BreakWord
    ) || matches!(
        style.overflow_wrap,
        ve_style::OverflowWrap::Anywhere | ve_style::OverflowWrap::BreakWord
    )
}

/// Greedy word-wrapping over `text` using a width oracle. Shared by the
/// metric shaper and used as fallback by the parley shaper.
fn greedy_wrap(
    text: &str,
    first_available: f32,
    available: f32,
    wrap: bool,
    break_words: bool,
    hyphenate: bool,
    auto_hyphen: bool,
    break_spaces: bool,
    height: f32,
    baseline: f32,
    width_of: &dyn Fn(&str) -> f32,
) -> Vec<ShapedLine> {
    let mut lines = Vec::new();
    let mut line_start = 0usize;
    let mut line_end = 0usize; // end of committed content on the current line
    let mut limit = first_available;

    let push_line = |start: usize, end: usize, lines: &mut Vec<ShapedLine>| {
        let slice = &text[start..end];
        lines.push(ShapedLine {
            range: start..end,
            width: width_of(slice),
            height,
            baseline,
        });
    };

    for (idx, word) in split_words(text, hyphenate, auto_hyphen, break_spaces) {
        if word == "\n" {
            push_line(line_start, line_end, &mut lines);
            line_start = idx + 1;
            line_end = line_start;
            limit = available;
            continue;
        }
        let candidate_end = idx + word.len();
        let candidate = if break_spaces {
            &text[line_start..candidate_end]
        } else {
            text[line_start..candidate_end].trim_end()
        };
        let fits = !wrap || width_of(candidate) <= limit + 0.01;
        if fits {
            line_end = candidate_end;
            continue;
        }
        if line_end != line_start {
            // Break before this word.
            let end = if break_spaces {
                line_end
            } else {
                text[line_start..line_end].trim_end().len() + line_start
            };
            push_line(line_start, end, &mut lines);
            line_start = idx;
            limit = available;
        }
        // The word starts a line. Does it fit on its own?
        let word_trimmed = word.trim_end();
        if width_of(word_trimmed) <= limit + 0.01 || !break_words {
            // Fits (or must overflow rather than be dropped).
            line_end = candidate_end;
            continue;
        }
        // Break inside the word, character by character.
        let mut piece_start = idx;
        for (ci, ch) in word_trimmed.char_indices() {
            let abs = idx + ci;
            let with_char = &text[piece_start..abs + ch.len_utf8()];
            if abs > piece_start && width_of(with_char) > limit + 0.01 {
                push_line(piece_start, abs, &mut lines);
                piece_start = abs;
                limit = available;
            }
        }
        line_start = piece_start;
        line_end = candidate_end;
    }
    let trimmed_end = if break_spaces {
        line_end
    } else {
        line_start + text[line_start..line_end].trim_end().len()
    };
    if trimmed_end > line_start || lines.is_empty() {
        push_line(line_start, trimmed_end.max(line_start), &mut lines);
    }
    lines
}

/// Splits into `(byte_offset, word)` where a word is a maximal run of
/// non-space characters plus the following spaces, or a lone `"\n"`.
fn split_words(
    text: &str,
    hyphenate: bool,
    auto_hyphen: bool,
    break_spaces: bool,
) -> Vec<(usize, &str)> {
    let mut raw = Vec::new();
    let mut start: Option<usize> = None;
    let mut in_trailing_space = false;
    for (i, ch) in text.char_indices() {
        if hyphenate && ch == '\u{00AD}' {
            if let Some(s) = start.take() {
                raw.push((s, &text[s..i]));
            }
            in_trailing_space = false;
            continue;
        }
        if ch == '\n' {
            if let Some(s) = start.take() {
                raw.push((s, &text[s..i]));
            }
            raw.push((i, "\n"));
            in_trailing_space = false;
        } else if ch == ' ' {
            if start.is_none() {
                start = Some(i);
            }
            in_trailing_space = true;
        } else {
            if in_trailing_space && let Some(s) = start.take() {
                raw.push((s, &text[s..i]));
            }
            in_trailing_space = false;
            if start.is_none() {
                start = Some(i);
            }
        }
    }
    if let Some(s) = start {
        raw.push((s, &text[s..]));
    }
    let mut out = raw;
    if auto_hyphen {
        let mut hyphenated = Vec::new();
        for (idx, word) in out {
            if word == "\n" || word.chars().all(|c| c == ' ') {
                hyphenated.push((idx, word));
                continue;
            }
            let letters: Vec<(usize, char)> = word
                .char_indices()
                .filter(|(_, ch)| *ch != ' ')
                .collect();
            if letters.len() <= 3 {
                hyphenated.push((idx, word));
                continue;
            }
            let mut start_b = 0usize;
            for (n, (ci, ch)) in letters.iter().enumerate() {
                if n > 0 && n % 3 == 0 {
                    hyphenated.push((idx + start_b, &word[start_b..*ci]));
                    start_b = *ci;
                }
                let _ = ch;
            }
            if start_b < word.len() {
                hyphenated.push((idx + start_b, &word[start_b..]));
            }
        }
        out = hyphenated;
    }
    if !break_spaces {
        return out;
    }
    let mut exploded = Vec::new();
    for (idx, word) in out {
        if word == "\n" {
            exploded.push((idx, word));
            continue;
        }
        let cut = word.trim_end_matches(' ').len();
        if cut == word.len() {
            exploded.push((idx, word));
            continue;
        }
        if cut > 0 {
            exploded.push((idx, &word[..cut]));
        }
        let mut i = cut;
        while i < word.len() {
            exploded.push((idx + i, &word[i..i + 1]));
            i += 1;
        }
    }
    exploded
}

impl TextShaper for MetricShaper {
    fn shape(
        &mut self,
        text: &str,
        style: &ComputedStyle,
        first_available: f32,
        available: f32,
        wrap: bool,
    ) -> Vec<ShapedLine> {
        let font_size = style.font_size;
        let height = style.line_height.to_px(font_size);
        let baseline = Self::baseline_in(style, height);
        let width_of = |s: &str| self.width_of(s, style);
        greedy_wrap(
            text,
            first_available,
            available,
            wrap,
            breaks_words(style),
            style.hyphens != ve_style::Hyphens::None,
            style.hyphens == ve_style::Hyphens::Auto,
            style.white_space == ve_style::WhiteSpace::BreakSpaces,
            height,
            baseline,
            &width_of,
        )
    }

    fn measure(&mut self, text: &str, style: &ComputedStyle) -> f32 {
        text.split('\n')
            .map(|line| self.width_of(line, style))
            .fold(0.0, f32::max)
    }
}

/// Real shaping and line breaking through `parley` (HarfBuzz-compatible
/// shaping via `harfrust`, Unicode line breaking via ICU4X). Fonts must be
/// registered explicitly — system font discovery is intentionally disabled so
/// that the default build has no platform dependencies.
pub struct ParleyShaper {
    fonts: parley::FontContext,
    layouts: parley::LayoutContext<[u8; 4]>,
    fallback: MetricShaper,
    has_fonts: bool,
}

impl std::fmt::Debug for ParleyShaper {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("ParleyShaper")
            .field("has_fonts", &self.has_fonts)
            .finish_non_exhaustive()
    }
}

impl Default for ParleyShaper {
    fn default() -> Self {
        Self::new()
    }
}

impl ParleyShaper {
    /// Creates a shaper with no fonts. Until [`Self::register_font`] is called
    /// it behaves like [`MetricShaper`].
    #[must_use]
    pub fn new() -> Self {
        Self::with_system_fonts_enabled(false)
    }

    /// System-installed fonts through fontique. Used by `ve-shell --gui`,
    /// the corpus, and Speedometer. Tests/WPT/perf keep [`Self::new`].
    #[must_use]
    pub fn with_system_fonts() -> Self {
        Self::with_system_fonts_enabled(true)
    }

    fn with_system_fonts_enabled(system_fonts: bool) -> Self {
        let collection = parley::fontique::Collection::new(parley::fontique::CollectionOptions {
            shared: false,
            system_fonts,
        });
        let fonts = parley::FontContext {
            collection,
            source_cache: parley::fontique::SourceCache::default(),
        };
        Self {
            fonts,
            layouts: parley::LayoutContext::new(),
            fallback: MetricShaper::default(),
            has_fonts: system_fonts,
        }
    }

    /// Registers an OpenType/TrueType font file (all faces in it). Returns the
    /// number of families discovered.
    pub fn register_font(&mut self, data: Vec<u8>) -> usize {
        let blob = parley::fontique::Blob::from(data);
        let registered = self.fonts.collection.register_fonts(blob, None);
        self.has_fonts |= !registered.is_empty();
        registered.len()
    }

    /// Returns `true` if at least one font has been registered.
    #[must_use]
    pub fn has_fonts(&self) -> bool {
        self.has_fonts
    }

    /// Serialises the computed family list back to CSS `font-family` syntax,
    /// which parley parses natively (including generic keywords).
    fn family_for(style: &ComputedStyle) -> parley::FontFamily<'static> {
        let css = style
            .font_family
            .iter()
            .map(|f| match f {
                FontFamily::Named(name) => format!("\"{}\"", name.replace('"', "\\\"")),
                FontFamily::Serif => "serif".to_owned(),
                FontFamily::SansSerif => "sans-serif".to_owned(),
                FontFamily::Monospace => "monospace".to_owned(),
                FontFamily::Cursive => "cursive".to_owned(),
                FontFamily::Fantasy => "fantasy".to_owned(),
                FontFamily::SystemUi => "system-ui".to_owned(),
            })
            .collect::<Vec<_>>()
            .join(", ");
        parley::FontFamily::Source(std::borrow::Cow::Owned(if css.is_empty() {
            "sans-serif".to_owned()
        } else {
            css
        }))
    }

    fn layout_run(
        &mut self,
        text: &str,
        style: &ComputedStyle,
        max_advance: Option<f32>,
    ) -> parley::Layout<[u8; 4]> {
        let line_height = style.line_height.to_px(style.font_size) / style.font_size;
        let mut builder = self
            .layouts
            .ranged_builder(&mut self.fonts, text, 1.0, true);
        builder.push_default(parley::StyleProperty::FontSize(style.font_size));
        builder.push_default(parley::StyleProperty::FontFamily(Self::family_for(style)));
        builder.push_default(parley::StyleProperty::FontWeight(parley::FontWeight::new(
            f32::from(style.font_weight.0),
        )));
        builder.push_default(parley::StyleProperty::LineHeight(
            parley::LineHeight::FontSizeRelative(line_height),
        ));
        if style.letter_spacing != 0.0 {
            builder.push_default(parley::StyleProperty::LetterSpacing(style.letter_spacing));
        }
        let mut layout = builder.build(text);
        layout.break_all_lines(max_advance);
        layout
    }

    fn lines_of(layout: &parley::Layout<[u8; 4]>, offset: usize) -> Vec<ShapedLine> {
        layout
            .lines()
            .map(|line| {
                let m = line.metrics();
                let r = line.text_range();
                ShapedLine {
                    range: (offset + r.start)..(offset + r.end),
                    width: m.advance,
                    height: m.line_height,
                    baseline: m.baseline - m.block_min_coord,
                }
            })
            .collect()
    }
}

impl TextShaper for ParleyShaper {
    fn shape(
        &mut self,
        text: &str,
        style: &ComputedStyle,
        first_available: f32,
        available: f32,
        wrap: bool,
    ) -> Vec<ShapedLine> {
        if !self.has_fonts {
            return self
                .fallback
                .shape(text, style, first_available, available, wrap);
        }
        if !wrap {
            return Self::lines_of(&self.layout_run(text, style, None), 0);
        }
        // First pass constrained to the remaining space on the current line.
        let first = self.layout_run(text, style, Some(first_available.max(0.0)));
        let mut lines = Self::lines_of(&first, 0);
        if lines.len() <= 1 || (first_available - available).abs() < 0.01 {
            return lines;
        }
        // Keep the first line, re-flow the remainder at full width.
        let head = lines.remove(0);
        let rest_start = head.range.end;
        let rest = text[rest_start..].trim_start();
        let rest_offset = rest_start + (text.len() - rest_start - rest.len());
        let mut out = vec![head];
        if !rest.is_empty() {
            out.extend(Self::lines_of(
                &self.layout_run(rest, style, Some(available)),
                rest_offset,
            ));
        }
        out
    }

    fn register_font(&mut self, data: Vec<u8>) -> usize {
        Self::register_font(self, data)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn metric_shaper_wraps_greedily_and_honours_forced_breaks() {
        let style = ComputedStyle {
            font_size: 10.0,
            line_height: ve_style::LineHeight::Px(12.0),
            ..ComputedStyle::initial()
        };
        let mut shaper = MetricShaper::default(); // 5px per lowercase char / space
        let lines = shaper.shape("aaaa bbbb cccc", &style, 45.0, 45.0, true);
        assert_eq!(lines.len(), 2);
        assert_eq!(&"aaaa bbbb cccc"[lines[0].range.clone()], "aaaa bbbb");
        assert_eq!(lines[0].width, 45.0);
        assert_eq!(lines[1].height, 12.0);
        assert_eq!(lines[1].baseline, 9.0, "(12 - 10) / 2 + 8");

        let lines = shaper.shape("ab cd", &style, 10.0, 100.0, true);
        assert_eq!(lines.len(), 2, "first line has room for one word only");
        assert_eq!(&"ab cd"[lines[1].range.clone()], "cd");

        let lines = shaper.shape("a\nb", &style, 100.0, 100.0, true);
        assert_eq!(lines.len(), 2);
        assert_eq!(shaper.measure("abc", &style), 15.0);
        assert_eq!(
            shaper
                .shape("toolongword x", &style, 10.0, 10.0, true)
                .len(),
            2,
            "overflowing word stays whole"
        );
        assert_eq!(shaper.min_content("aa bbbb c", &style), 20.0);
    }

    #[test]
    fn metric_shaper_char_classes_and_spacing_are_documented_values() {
        let style = ComputedStyle {
            font_size: 10.0,
            ..ComputedStyle::initial()
        };
        let mut shaper = MetricShaper::default();
        assert_eq!(shaper.measure("i", &style), 3.0);
        assert_eq!(shaper.measure("m", &style), 8.0);
        assert_eq!(shaper.measure("A", &style), 6.5);
        assert_eq!(shaper.measure("7", &style), 5.5);
        assert_eq!(shaper.measure("\u{4E2D}", &style), 10.0);
        assert_eq!(
            shaper.measure("a\u{0301}", &style),
            5.0,
            "combining mark is zero-width"
        );
        assert_eq!(shaper.ascent(&style), 8.0);
        assert_eq!(shaper.descent(&style), 2.0);
        let spaced = ComputedStyle {
            letter_spacing: 1.0,
            ..style.clone()
        };
        assert_eq!(shaper.measure("aaa", &spaced), 18.0);
        let uniform = MetricShaper { per_class: false };
        assert_eq!(uniform.char_advance('W', 10.0), 5.0);

        // break-all splits a word that cannot fit on a line of its own.
        let breaking = ComputedStyle {
            word_break: ve_style::WordBreak::BreakAll,
            ..style
        };
        let lines = shaper.shape("aaaaaaaa", &breaking, 20.0, 20.0, true);
        assert_eq!(lines.len(), 2);
        assert_eq!(lines[0].width, 20.0);
    }

    #[test]
    fn parley_shaper_without_fonts_falls_back() {
        let style = ComputedStyle::initial();
        let mut shaper = ParleyShaper::new();
        assert!(!shaper.has_fonts());
        let lines = shaper.shape("hello world", &style, 1000.0, 1000.0, true);
        assert_eq!(lines.len(), 1);
        assert!(lines[0].width > 0.0);
    }

    #[test]
    fn parley_shaper_registers_ahem_reftest_font() {
        let path = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("../../conformance/fonts/Ahem.ttf");
        let bytes =
            std::fs::read(&path).unwrap_or_else(|e| panic!("missing {}: {e}", path.display()));
        let mut shaper = ParleyShaper::new();
        assert!(
            shaper.register_font(bytes) >= 1,
            "Ahem.ttf must register at least one family"
        );
        assert!(shaper.has_fonts());
        let style = ComputedStyle {
            font_size: 16.0,
            font_family: vec![FontFamily::Named("Ahem".into())],
            ..ComputedStyle::initial()
        };
        let lines = shaper.shape("XXXX", &style, 1000.0, 1000.0, true);
        assert_eq!(lines.len(), 1);
        assert!(
            (lines[0].width - 64.0).abs() < 1.0,
            "Ahem is square: 4×16px = 64, got {}",
            lines[0].width
        );
    }
}
