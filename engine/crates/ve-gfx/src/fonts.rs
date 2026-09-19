//! Font database and glyph rasterisation.

use swash::scale::{Render, ScaleContext, Source, StrikeWith};
use swash::zeno::Format;
use swash::{FontRef, GlyphId};
use ve_style::{FontFamily, FontStyle, FontWeight};

/// One retained glyph in a run (H1-A6).
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct PlacedGlyph {
    /// Font glyph id.
    pub id: u32,
    /// Pen X, snapped to 1/4 CSS px.
    pub x: f32,
    /// Pen Y relative to the baseline.
    pub y: f32,
    /// Source character (emoji routing).
    pub ch: char,
}

/// Shaped glyph run retained across frames.
#[derive(Clone, Debug, PartialEq)]
pub struct RetainedGlyphRun {
    /// Positioned glyphs.
    pub glyphs: Vec<PlacedGlyph>,
    /// Font size.
    pub size: f32,
    /// Advance width.
    pub width: f32,
}

/// One verb in a scaled glyph outline (y-up, origin at the glyph origin).
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum GlyphVerb {
    /// Move the pen.
    MoveTo(f32, f32),
    /// Straight line.
    LineTo(f32, f32),
    /// Quadratic Bézier.
    QuadTo(f32, f32, f32, f32),
    /// Cubic Bézier.
    CurveTo(f32, f32, f32, f32, f32, f32),
    /// Close the current contour.
    Close,
}

/// Scaled glyph outline for GPU path filling.
#[derive(Clone, Debug, PartialEq)]
pub struct GlyphOutline {
    /// Path verbs in font-space pixels (y-up).
    pub verbs: Vec<GlyphVerb>,
}

/// An alpha-mask glyph image.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct GlyphBitmap {
    /// Width in pixels.
    pub width: u32,
    /// Height in pixels.
    pub height: u32,
    /// Horizontal offset from the pen position to the left edge.
    pub left: i32,
    /// Vertical offset from the baseline to the top edge (positive = up).
    pub top: i32,
    /// Coverage, row-major, one byte per pixel.
    pub data: Vec<u8>,
}

/// Font database plus rasteriser. Fonts are registered from bytes so the
/// engine has no dependency on the host's font configuration; embedders load
/// system fonts (or bundled ones) explicitly.
pub struct FontSystem {
    db: fontdb::Database,
    scaler: ScaleContext,
}

impl std::fmt::Debug for FontSystem {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("FontSystem")
            .field("faces", &self.db.len())
            .finish_non_exhaustive()
    }
}

impl Default for FontSystem {
    fn default() -> Self {
        Self::new()
    }
}

fn family(f: &FontFamily) -> fontdb::Family<'_> {
    match f {
        FontFamily::Named(n) => fontdb::Family::Name(n),
        FontFamily::Serif => fontdb::Family::Serif,
        FontFamily::SansSerif | FontFamily::SystemUi => fontdb::Family::SansSerif,
        FontFamily::Monospace => fontdb::Family::Monospace,
        FontFamily::Cursive => fontdb::Family::Cursive,
        FontFamily::Fantasy => fontdb::Family::Fantasy,
    }
}

impl FontSystem {
    /// Creates an empty font system.
    #[must_use]
    pub fn new() -> Self {
        Self {
            db: fontdb::Database::new(),
            scaler: ScaleContext::new(),
        }
    }

    /// Registers every face in a font file. Returns the number of faces now known.
    pub fn load_font_data(&mut self, data: Vec<u8>) -> usize {
        self.db.load_font_data(data);
        self.db.len()
    }

    /// Number of registered faces.
    #[must_use]
    pub fn len(&self) -> usize {
        self.db.len()
    }

    /// Whether no fonts are registered.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.db.is_empty()
    }

    /// Discovers fonts installed on the host (plan A19) so screenshots can
    /// paint real glyphs. Safe to call more than once.
    pub fn load_system_fonts(&mut self) {
        self.db.load_system_fonts();
        self.load_known_ui_fonts();
    }

    /// Loads Inter Regular from known install paths when the fontconfig
    /// family name does not resolve (Linux CI without a full Inter family).
    pub fn load_known_ui_fonts(&mut self) {
        const CANDIDATES: &[&str] = &[
            "/usr/share/fonts/truetype/macos/Inter-Regular.ttf",
            "/usr/share/fonts/truetype/inter/Inter-Regular.ttf",
            "/usr/share/fonts/truetype/inter/Inter[slnt,wght].ttf",
            "/Library/Fonts/Inter-Regular.ttf",
        ];
        for path in CANDIDATES {
            if let Ok(bytes) = std::fs::read(path) {
                self.load_font_data(bytes);
                break;
            }
        }
    }

    /// Sets the concrete family used for a generic one (e.g. `sans-serif`).
    pub fn set_generic(&mut self, generic: &FontFamily, name: &str) {
        match generic {
            FontFamily::Serif => self.db.set_serif_family(name),
            FontFamily::SansSerif | FontFamily::SystemUi => self.db.set_sans_serif_family(name),
            FontFamily::Monospace => self.db.set_monospace_family(name),
            FontFamily::Cursive => self.db.set_cursive_family(name),
            FontFamily::Fantasy => self.db.set_fantasy_family(name),
            FontFamily::Named(_) => {}
        }
    }

    /// Finds the best face for a CSS family list, weight and style.
    #[must_use]
    pub fn query(
        &self,
        families: &[FontFamily],
        weight: FontWeight,
        style: FontStyle,
    ) -> Option<fontdb::ID> {
        let fams: Vec<fontdb::Family<'_>> = families
            .iter()
            .map(family)
            .chain(std::iter::once(fontdb::Family::SansSerif))
            .collect();
        let query = fontdb::Query {
            families: &fams,
            weight: fontdb::Weight(weight.0),
            stretch: fontdb::Stretch::Normal,
            style: match style {
                FontStyle::Normal => fontdb::Style::Normal,
                FontStyle::Italic => fontdb::Style::Italic,
                FontStyle::Oblique => fontdb::Style::Oblique,
            },
        };
        let wants_inter = families.iter().any(|f| match f {
            FontFamily::Named(n) => n.eq_ignore_ascii_case("Inter"),
            FontFamily::SansSerif | FontFamily::SystemUi => true,
            _ => false,
        });
        if wants_inter && let Some(id) = self.prefer_static_inter(weight) {
            return Some(id);
        }
        self.db
            .query(&query)
            .or_else(|| self.db.faces().next().map(|f| f.id))
    }

    /// Prefer a static Inter face over a variable `Inter[…]` instance.
    fn prefer_static_inter(&self, weight: FontWeight) -> Option<fontdb::ID> {
        let want = i32::from(weight.0);
        let mut best: Option<(i32, fontdb::ID)> = None;
        for face in self.db.faces() {
            let path = match &face.source {
                fontdb::Source::File(p) => p.to_string_lossy().into_owned(),
                fontdb::Source::Binary(_) => String::new(),
            };
            let lower = path.to_ascii_lowercase();
            if !lower.contains("inter") || path.contains('[') {
                continue;
            }
            let mut score = 0;
            if lower.contains("inter-regular") && want <= 450 {
                score += 100;
            } else if lower.contains("inter-medium") && (451..=599).contains(&want) {
                score += 100;
            } else if lower.contains("inter-semibold") && (600..=749).contains(&want) {
                score += 100;
            } else if lower.contains("inter-bold") && want >= 750 {
                score += 100;
            }
            if lower.contains("/macos/") {
                score += 10;
            }
            score -= (i32::from(face.weight.0) - want).abs() / 25;
            if best.is_none_or(|(s, _)| score > s) {
                best = Some((score, face.id));
            }
        }
        best.filter(|(s, _)| *s > 0).map(|(_, id)| id)
    }

    /// Runs `f` with a `swash` font reference for `id`.
    pub fn with_font<T>(&self, id: fontdb::ID, f: impl FnOnce(FontRef<'_>) -> T) -> Option<T> {
        self.db.with_face_data(id, |data, index| {
            FontRef::from_index(data, index as usize).map(f)
        })?
    }

    /// Glyph id for a character (0 if the font lacks it).
    #[must_use]
    pub fn glyph_for_char(&self, id: fontdb::ID, ch: char) -> Option<GlyphId> {
        self.with_font(id, |font| font.charmap().map(ch))
    }

    /// Horizontal advance of a glyph at `size` pixels.
    #[must_use]
    pub fn advance(&self, id: fontdb::ID, glyph: GlyphId, size: f32) -> Option<f32> {
        self.with_font(id, |font| {
            font.glyph_metrics(&[]).scale(size).advance_width(glyph)
        })
    }

    /// Runs `f` with the face bytes and collection index.
    pub fn with_face_bytes<T>(&self, id: fontdb::ID, f: impl FnOnce(&[u8], u32) -> T) -> Option<T> {
        self.db.with_face_data(id, |data, index| f(data, index))
    }

    /// Retained glyph run: ids and 1/4-px snapped pen positions.
    #[must_use]
    pub fn shape_retained(&self, id: fontdb::ID, text: &str, size: f32) -> Option<RetainedGlyphRun> {
        let mut glyphs = Vec::new();
        let mut x = 0.0f32;
        for ch in text.chars() {
            let Some(gid) = self.glyph_for_char(id, ch) else {
                continue;
            };
            if gid == 0 {
                continue;
            }
            let advance = self.advance(id, gid, size).unwrap_or(size * 0.5);
            let snapped = (x * 4.0).round() / 4.0;
            glyphs.push(PlacedGlyph {
                id: u32::from(gid),
                x: snapped,
                y: 0.0,
                ch,
            });
            x += advance;
        }
        Some(RetainedGlyphRun { glyphs, size, width: x })
    }

    /// Width of `text` at `size` pixels using simple per-glyph advances (no shaping).
    #[must_use]
    pub fn measure(&self, id: fontdb::ID, text: &str, size: f32) -> Option<f32> {
        self.with_font(id, |font| {
            let charmap = font.charmap();
            let metrics = font.glyph_metrics(&[]).scale(size);
            text.chars()
                .map(|c| metrics.advance_width(charmap.map(c)))
                .sum()
        })
    }

    /// Scaled outline for `glyph` (empty if the face has no outline).
    pub fn outline(&mut self, id: fontdb::ID, glyph: GlyphId, size: f32) -> Option<GlyphOutline> {
        use swash::zeno::{Command, PathData};
        let FontSystem { db, scaler } = self;
        db.with_face_data(id, |bytes, index| {
            let font = FontRef::from_index(bytes, index as usize)?;
            let mut built = scaler
                .builder(font)
                .size(size)
                .hint(size <= 36.0)
                .build();
            let outline = built.scale_outline(glyph)?;
            let mut verbs = Vec::new();
            for cmd in outline.path().commands() {
                match cmd {
                    Command::MoveTo(p) => verbs.push(GlyphVerb::MoveTo(p.x, p.y)),
                    Command::LineTo(p) => verbs.push(GlyphVerb::LineTo(p.x, p.y)),
                    Command::QuadTo(c, p) => verbs.push(GlyphVerb::QuadTo(c.x, c.y, p.x, p.y)),
                    Command::CurveTo(c1, c2, p) => {
                        verbs.push(GlyphVerb::CurveTo(c1.x, c1.y, c2.x, c2.y, p.x, p.y));
                    }
                    Command::Close => verbs.push(GlyphVerb::Close),
                }
            }
            (!verbs.is_empty()).then_some(GlyphOutline { verbs })
        })
        .flatten()
    }

    /// Rasterises a glyph to an alpha mask.
    pub fn rasterize(&mut self, id: fontdb::ID, glyph: GlyphId, size: f32) -> Option<GlyphBitmap> {
        self.rasterize_hinted(id, glyph, size, size <= 36.0)
    }

    /// Rasterises a glyph, with explicit hinter control.
    ///
    /// Chrome UI is 11–16 CSS px. At Retina (`scale=2`) that is 22–32 physical
    /// px; hinting only below 18 left those glyphs unhinted.
    pub fn rasterize_hinted(
        &mut self,
        id: fontdb::ID,
        glyph: GlyphId,
        size: f32,
        hint: bool,
    ) -> Option<GlyphBitmap> {
        let FontSystem { db, scaler } = self;
        db.with_face_data(id, |bytes, index| {
            let font = FontRef::from_index(bytes, index as usize)?;
            let mut built = scaler
                .builder(font)
                .size(size)
                .hint(hint)
                .build();
            let image = Render::new(&[
                Source::ColorOutline(0),
                Source::ColorBitmap(StrikeWith::BestFit),
                Source::Outline,
            ])
            .format(Format::Alpha)
            .render(&mut built, glyph)?;
            Some(GlyphBitmap {
                width: image.placement.width,
                height: image.placement.height,
                left: image.placement.left,
                top: image.placement.top,
                data: image.data,
            })
        })
        .flatten()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_font_system_answers_none_without_panicking() {
        let mut fs = FontSystem::new();
        assert!(fs.is_empty());
        assert!(
            fs.query(
                &[FontFamily::SansSerif],
                FontWeight::NORMAL,
                FontStyle::Normal
            )
            .is_none()
        );
        fs.set_generic(&FontFamily::SansSerif, "Inter");
        assert_eq!(
            fs.load_font_data(vec![0, 1, 2, 3]),
            0,
            "garbage is not a font"
        );
        assert!(
            fs.query(
                &[FontFamily::Named("Inter".into())],
                FontWeight::BOLD,
                FontStyle::Italic
            )
            .is_none()
        );
    }

    #[test]
    fn system_fonts_rasterize_a_glyph() {
        let mut fs = FontSystem::new();
        fs.load_system_fonts();
        let Some(id) = fs.query(
            &[FontFamily::SansSerif],
            FontWeight::NORMAL,
            FontStyle::Normal,
        ) else {
            return;
        };
        let Some(glyph) = fs.glyph_for_char(id, 'A') else {
            return;
        };
        let bitmap = fs
            .rasterize(id, glyph, 16.0)
            .expect("system fonts are File sources and must still rasterize (plan A19)");
        assert!(
            bitmap.width > 0 && bitmap.height > 0 && !bitmap.data.is_empty(),
            "empty glyph mask {bitmap:?}"
        );
        let outline = fs
            .outline(id, glyph, 16.0)
            .expect("system fonts must yield outlines");
        assert!(
            !outline.verbs.is_empty(),
            "glyph outline must contain path verbs"
        );
        let shaped = fs
            .shape_retained(id, "Hi", 16.0)
            .expect("retained run");
        assert_eq!(shaped.glyphs.len(), 2);
        for g in &shaped.glyphs {
            let quarter = (g.x * 4.0).round() / 4.0;
            assert!((g.x - quarter).abs() < f32::EPSILON);
            assert_ne!(g.id, 0, "missing glyphs are skipped, not .notdef");
        }
        let tofu = fs
            .shape_retained(id, "\u{10ffff}", 16.0)
            .expect("missing char");
        assert!(
            tofu.glyphs.is_empty(),
            "unmapped characters must not emit glyph 0"
        );
        let retina = fs
            .rasterize_hinted(id, glyph, 24.0, true)
            .expect("Retina 12 CSS px is 24 physical");
        assert!(
            retina.width > 0 && retina.height > 0,
            "hinted 24px UI glyph must rasterize"
        );
        if let Some(ui) = fs.query(
            &[FontFamily::Named("Inter".into())],
            FontWeight::NORMAL,
            FontStyle::Normal,
        ) {
            let path = match &fs.db.face(ui).expect("face").source {
                fontdb::Source::File(p) => p.to_string_lossy().into_owned(),
                fontdb::Source::Binary(_) => String::new(),
            };
            if !path.is_empty() {
                assert!(
                    !path.contains('['),
                    "UI Inter must be a static face, got {path}"
                );
            }
        }
    }
}
