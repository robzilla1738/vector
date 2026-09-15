//! Text shaping abstraction: [`TextShaper`], [`ParleyShaper`], [`MetricShaper`].

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
}

/// Deterministic shaper: every character advances `advance_ratio × font-size`.
///
/// Used when no font data is available and in tests. Wrapping is greedy at
/// spaces; forced `\n` breaks are honoured.
#[derive(Clone, Copy, Debug)]
pub struct MetricShaper {
    /// Advance per character as a fraction of the font size.
    pub advance_ratio: f32,
    /// Baseline position as a fraction of the line height.
    pub baseline_ratio: f32,
}

impl Default for MetricShaper {
    fn default() -> Self {
        Self {
            advance_ratio: 0.5,
            baseline_ratio: 0.8,
        }
    }
}

impl MetricShaper {
    fn width_of(&self, text: &str, font_size: f32) -> f32 {
        text.chars().count() as f32 * font_size * self.advance_ratio
    }
}

/// Greedy word-wrapping over `text` using a width oracle. Shared by the
/// metric shaper and used as fallback by the parley shaper.
fn greedy_wrap(
    text: &str,
    first_available: f32,
    available: f32,
    wrap: bool,
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

    for (idx, word) in split_words(text) {
        if word == "\n" {
            push_line(line_start, line_end, &mut lines);
            line_start = idx + 1;
            line_end = line_start;
            limit = available;
            continue;
        }
        let candidate_end = idx + word.len();
        let candidate = text[line_start..candidate_end].trim_end();
        let fits = !wrap || width_of(candidate) <= limit + 0.01;
        if fits || line_end == line_start {
            // Either it fits, or it is the first word on the line (overflow rather than drop it).
            line_end = candidate_end;
        } else {
            push_line(
                line_start,
                text[line_start..line_end].trim_end().len() + line_start,
                &mut lines,
            );
            line_start = idx;
            line_end = candidate_end;
            limit = available;
            if !fits && lines.len() == 1 && first_available < available {
                // The word may fit on a fresh full-width line; re-check by continuing.
            }
        }
    }
    let trimmed_end = line_start + text[line_start..line_end].trim_end().len();
    if trimmed_end > line_start || lines.is_empty() {
        push_line(line_start, trimmed_end.max(line_start), &mut lines);
    }
    lines
}

/// Splits into `(byte_offset, word)` where a word is a maximal run of
/// non-space characters plus the following spaces, or a lone `"\n"`.
fn split_words(text: &str) -> Vec<(usize, &str)> {
    let mut out = Vec::new();
    let mut start: Option<usize> = None;
    let mut in_trailing_space = false;
    for (i, ch) in text.char_indices() {
        if ch == '\n' {
            if let Some(s) = start.take() {
                out.push((s, &text[s..i]));
            }
            out.push((i, "\n"));
            in_trailing_space = false;
        } else if ch == ' ' {
            if start.is_none() {
                start = Some(i);
            }
            in_trailing_space = true;
        } else {
            if in_trailing_space && let Some(s) = start.take() {
                out.push((s, &text[s..i]));
            }
            in_trailing_space = false;
            if start.is_none() {
                start = Some(i);
            }
        }
    }
    if let Some(s) = start {
        out.push((s, &text[s..]));
    }
    out
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
        let baseline = height * self.baseline_ratio;
        let width_of = |s: &str| self.width_of(s, font_size);
        greedy_wrap(
            text,
            first_available,
            available,
            wrap,
            height,
            baseline,
            &width_of,
        )
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
        let collection = parley::fontique::Collection::new(parley::fontique::CollectionOptions {
            shared: false,
            system_fonts: false,
        });
        let fonts = parley::FontContext {
            collection,
            source_cache: parley::fontique::SourceCache::default(),
        };
        Self {
            fonts,
            layouts: parley::LayoutContext::new(),
            fallback: MetricShaper::default(),
            has_fonts: false,
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
            if lines.len() > 1 {
                // Same width for every line: the single pass is already correct.
                return lines;
            }
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
        let mut shaper = MetricShaper::default(); // 5px per char
        let lines = shaper.shape("aaaa bbbb cccc", &style, 45.0, 45.0, true);
        assert_eq!(lines.len(), 2);
        assert_eq!(&"aaaa bbbb cccc"[lines[0].range.clone()], "aaaa bbbb");
        assert_eq!(lines[0].width, 45.0);
        assert_eq!(lines[1].height, 12.0);

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
}
