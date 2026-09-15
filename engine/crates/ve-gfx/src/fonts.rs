//! Font database and glyph rasterisation.

use swash::scale::{Render, ScaleContext, Source, StrikeWith};
use swash::zeno::Format;
use swash::{FontRef, GlyphId};
use ve_style::{FontFamily, FontStyle, FontWeight};

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
        self.db
            .query(&query)
            .or_else(|| self.db.faces().next().map(|f| f.id))
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

    /// Rasterises a glyph to an alpha mask.
    pub fn rasterize(&mut self, id: fontdb::ID, glyph: GlyphId, size: f32) -> Option<GlyphBitmap> {
        let (data, index) = self
            .db
            .face_source(id)
            .and_then(|(source, index)| match source {
                fontdb::Source::Binary(bin) => Some((bin, index)),
                #[allow(unreachable_patterns)]
                _ => None,
            })?;
        let bytes: &[u8] = (*data).as_ref();
        let font = FontRef::from_index(bytes, index as usize)?;
        let mut scaler = self.scaler.builder(font).size(size).hint(true).build();
        let image = Render::new(&[
            Source::ColorOutline(0),
            Source::ColorBitmap(StrikeWith::BestFit),
            Source::Outline,
        ])
        .format(Format::Alpha)
        .render(&mut scaler, glyph)?;
        Some(GlyphBitmap {
            width: image.placement.width,
            height: image.placement.height,
            left: image.placement.left,
            top: image.placement.top,
            data: image.data,
        })
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
}
