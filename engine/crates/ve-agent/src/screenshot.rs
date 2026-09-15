//! Screenshots through `ve-gfx`'s software renderer, encoded as PNG.

use serde::{Deserialize, Serialize};
use ve_core::{Result, Size};
use ve_gfx::{DisplayList, Renderer, SoftwareRenderer};
use ve_layout::LayoutTree;
use ve_style::StyleTree;

/// A rendered screenshot.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Screenshot {
    /// Width in device pixels.
    pub width: u32,
    /// Height in device pixels.
    pub height: u32,
    /// Device pixel ratio used.
    pub scale: f32,
    /// PNG bytes.
    #[serde(skip)]
    pub png: Vec<u8>,
    /// Whether the whole document was captured.
    pub full_page: bool,
}

impl Screenshot {
    /// JSON with the PNG as base64 (`pngBase64`), for the C ABI.
    #[must_use]
    pub fn to_json(&self) -> serde_json::Value {
        serde_json::json!({
            "width": self.width,
            "height": self.height,
            "scale": self.scale,
            "fullPage": self.full_page,
            "format": "png",
            "bytes": self.png.len(),
            "pngBase64": ve_net::base64_encode(&self.png),
        })
    }
}

/// Renders `layout` at `scroll` into a PNG.
pub fn capture(
    renderer: &mut SoftwareRenderer,
    layout: &LayoutTree,
    styles: &StyleTree,
    viewport: Size,
    scroll: ve_core::Point,
    scale: f32,
    full_page: bool,
) -> Result<Screenshot> {
    let span = ve_core::Stage::Paint.span();
    let _guard = span.enter();
    let scale = if scale.is_finite() && scale > 0.0 {
        scale
    } else {
        1.0
    };
    let list = DisplayList::from_layout(layout, styles);
    let (css_width, css_height, dx, dy) = if full_page {
        (
            viewport.width.max(layout.root.rect.right()),
            layout.content_height().max(viewport.height),
            0.0,
            0.0,
        )
    } else {
        (viewport.width, viewport.height, -scroll.x, -scroll.y)
    };
    let mut translated = DisplayList::new(Size::new(css_width, css_height));
    // The canvas background is the first item; re-paint it at the full size.
    translated.push(ve_gfx::DisplayItem::Rect {
        rect: ve_core::Rect::new(0.0, 0.0, css_width, css_height),
        color: match list.items().first() {
            Some(ve_gfx::DisplayItem::Rect { color, .. }) => *color,
            _ => ve_style::Rgba::WHITE,
        },
    });
    for item in list.items().iter().skip(1) {
        translated.push(item.translated(dx, dy));
    }
    let width = (css_width * scale).round().max(1.0) as u32;
    let height = (css_height * scale).round().max(1.0) as u32;
    let frame = renderer.render(&translated, width, height, scale)?;
    let png = encode_png(frame.width, frame.height, &frame.rgba)?;
    Ok(Screenshot {
        width: frame.width,
        height: frame.height,
        scale,
        png,
        full_page,
    })
}

/// Encodes RGBA8 pixels as PNG.
pub fn encode_png(width: u32, height: u32, rgba: &[u8]) -> Result<Vec<u8>> {
    let mut out = Vec::new();
    {
        let mut encoder = png::Encoder::new(&mut out, width, height);
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
        let mut writer = encoder
            .write_header()
            .map_err(|e| ve_core::Error::internal(format!("png header: {e}")))?;
        writer
            .write_image_data(rgba)
            .map_err(|e| ve_core::Error::internal(format!("png data: {e}")))?;
    }
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encodes_a_valid_png() {
        let pixels = vec![255u8, 0, 0, 255, 0, 255, 0, 255];
        let png = encode_png(2, 1, &pixels).unwrap();
        assert_eq!(&png[..8], b"\x89PNG\r\n\x1a\n");
        let decoder = png::Decoder::new(std::io::Cursor::new(png));
        let mut reader = decoder.read_info().unwrap();
        let mut buf = vec![0; reader.output_buffer_size().unwrap()];
        let info = reader.next_frame(&mut buf).unwrap();
        assert_eq!((info.width, info.height), (2, 1));
        assert_eq!(&buf[..8], &pixels[..]);
    }
}
