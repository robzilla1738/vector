//! Image format sniffing, decoding and the decoded-image cache.

use std::collections::HashMap;

use crate::GfxError;

/// Raster/vector image formats the engine recognises.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum ImageFormat {
    /// PNG.
    Png,
    /// JPEG.
    Jpeg,
    /// GIF.
    Gif,
    /// WebP.
    WebP,
    /// BMP.
    Bmp,
    /// ICO.
    Ico,
    /// AVIF (ISO BMFF).
    Avif,
    /// SVG (XML).
    Svg,
    /// Unrecognised.
    Unknown,
}

impl ImageFormat {
    /// The canonical MIME type.
    #[must_use]
    pub fn mime_type(self) -> &'static str {
        match self {
            Self::Png => "image/png",
            Self::Jpeg => "image/jpeg",
            Self::Gif => "image/gif",
            Self::WebP => "image/webp",
            Self::Bmp => "image/bmp",
            Self::Ico => "image/x-icon",
            Self::Avif => "image/avif",
            Self::Svg => "image/svg+xml",
            Self::Unknown => "application/octet-stream",
        }
    }
}

/// Detects the format from magic bytes (MIME Sniffing Standard §6.1 subset).
#[must_use]
pub fn sniff_format(bytes: &[u8]) -> ImageFormat {
    if bytes.starts_with(b"\x89PNG\r\n\x1a\n") {
        ImageFormat::Png
    } else if bytes.starts_with(&[0xFF, 0xD8, 0xFF]) {
        ImageFormat::Jpeg
    } else if bytes.starts_with(b"GIF87a") || bytes.starts_with(b"GIF89a") {
        ImageFormat::Gif
    } else if bytes.len() >= 12 && &bytes[0..4] == b"RIFF" && &bytes[8..12] == b"WEBP" {
        ImageFormat::WebP
    } else if bytes.starts_with(b"BM") {
        ImageFormat::Bmp
    } else if bytes.starts_with(&[0x00, 0x00, 0x01, 0x00]) {
        ImageFormat::Ico
    } else if bytes.len() >= 12
        && &bytes[4..8] == b"ftyp"
        && (&bytes[8..12] == b"avif" || &bytes[8..12] == b"avis")
    {
        ImageFormat::Avif
    } else {
        let head = String::from_utf8_lossy(&bytes[..bytes.len().min(1024)]);
        let trimmed = head.trim_start_matches('\u{feff}').trim_start();
        if trimmed.starts_with('<') && trimmed.contains("<svg") {
            ImageFormat::Svg
        } else {
            ImageFormat::Unknown
        }
    }
}

/// A decoded RGBA8 image.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DecodedImage {
    /// Width in pixels.
    pub width: u32,
    /// Height in pixels.
    pub height: u32,
    /// Non-premultiplied RGBA, row-major.
    pub rgba: Vec<u8>,
}

impl DecodedImage {
    /// Creates an image from raw RGBA data (length must be `width * height * 4`).
    #[must_use]
    pub fn from_rgba(width: u32, height: u32, rgba: Vec<u8>) -> Option<Self> {
        (rgba.len() == (width as usize) * (height as usize) * 4).then_some(Self {
            width,
            height,
            rgba,
        })
    }

    /// A solid-colour image (useful as a placeholder).
    #[must_use]
    pub fn solid(width: u32, height: u32, rgba: [u8; 4]) -> Self {
        Self {
            width,
            height,
            rgba: rgba.repeat((width as usize) * (height as usize)),
        }
    }

    /// Pixel at `(x, y)`.
    #[must_use]
    pub fn pixel(&self, x: u32, y: u32) -> Option<[u8; 4]> {
        if x >= self.width || y >= self.height {
            return None;
        }
        let i = ((y * self.width + x) * 4) as usize;
        self.rgba[i..i + 4].try_into().ok()
    }
}

/// Decodes an encoded image. Requires the `images` feature (implied by
/// `gpu`); without it every format reports [`GfxError::Unsupported`].
pub fn decode(bytes: &[u8]) -> Result<DecodedImage, GfxError> {
    let format = sniff_format(bytes);
    if format == ImageFormat::Svg {
        return decode_svg(bytes);
    }
    #[cfg(feature = "images")]
    {
        if !matches!(
            format,
            ImageFormat::Unknown | ImageFormat::Avif | ImageFormat::Ico
        ) {
            let img = ::image::load_from_memory(bytes)
                .map_err(|e| GfxError::Decode(e.to_string()))?
                .to_rgba8();
            let (width, height) = img.dimensions();
            return Ok(DecodedImage {
                width,
                height,
                rgba: img.into_raw(),
            });
        }
    }
    Err(GfxError::Unsupported(format!(
        "decoding {} images (enable the `images` feature)",
        format.mime_type()
    )))
}

fn svg_attr(tag: &str, name: &str) -> Option<f32> {
    for quote in ['"', '\''] {
        let key = format!("{name}={quote}");
        if let Some(i) = tag.find(&key) {
            let rest = &tag[i + key.len()..];
            if let Some(end) = rest.find(quote)
                && let Ok(n) = rest[..end].parse()
            {
                return Some(n);
            }
        }
    }
    None
}

fn decode_svg(bytes: &[u8]) -> Result<DecodedImage, GfxError> {
    let text = String::from_utf8_lossy(bytes);
    let mut width = 64u32;
    let mut height = 64u32;
    if let Some(start) = text.find("<svg") {
        let tag_end = text[start..].find('>').unwrap_or(64);
        let tag = &text[start..start + tag_end];
        if let Some(w) = svg_attr(tag, "width") {
            width = w.max(1.0) as u32;
        }
        if let Some(h) = svg_attr(tag, "height") {
            height = h.max(1.0) as u32;
        }
        if let Some(vb) = tag.split("viewBox=\"").nth(1).and_then(|s| s.split('"').next())
        {
            let nums: Vec<f32> = vb.split_whitespace().filter_map(|p| p.parse().ok()).collect();
            if nums.len() == 4 {
                width = nums[2].max(1.0) as u32;
                height = nums[3].max(1.0) as u32;
            }
        }
    }
    width = width.min(2048);
    height = height.min(2048);
    let mut img = DecodedImage::solid(width, height, [0, 0, 0, 0]);
    let mut rest = text.as_ref();
    while let Some(i) = rest.find("<rect") {
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        let x = svg_attr(tag, "x").unwrap_or(0.0) as u32;
        let y = svg_attr(tag, "y").unwrap_or(0.0) as u32;
        let w = svg_attr(tag, "width").unwrap_or(0.0) as u32;
        let h = svg_attr(tag, "height").unwrap_or(0.0) as u32;
        let fill = tag
            .split("fill=")
            .nth(1)
            .and_then(|s| {
                let q = s.chars().next()?;
                if q == '"' || q == '\'' {
                    s[1..].split(q).next()
                } else {
                    None
                }
            })
            .unwrap_or("#000000");
        let color = parse_svg_color(fill);
        for yy in y..(y + h).min(img.height) {
            for xx in x..(x + w).min(img.width) {
                let idx = ((yy * img.width + xx) * 4) as usize;
                img.rgba[idx..idx + 4].copy_from_slice(&color);
            }
        }
        rest = &rest[i + tag_end + 1..];
    }
    rest = text.as_ref();
    while let Some(i) = rest.find("<circle") {
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        let cx = svg_attr(tag, "cx").unwrap_or(0.0);
        let cy = svg_attr(tag, "cy").unwrap_or(0.0);
        let r = svg_attr(tag, "r").unwrap_or(0.0);
        let fill = tag
            .split("fill=")
            .nth(1)
            .and_then(|s| {
                let q = s.chars().next()?;
                if q == '"' || q == '\'' {
                    s[1..].split(q).next()
                } else {
                    None
                }
            })
            .unwrap_or("#000000");
        let color = parse_svg_color(fill);
        let r2 = r * r;
        let x0 = (cx - r).floor().max(0.0) as u32;
        let y0 = (cy - r).floor().max(0.0) as u32;
        let x1 = (cx + r).ceil().min(img.width as f32) as u32;
        let y1 = (cy + r).ceil().min(img.height as f32) as u32;
        for yy in y0..y1 {
            for xx in x0..x1 {
                let dx = xx as f32 + 0.5 - cx;
                let dy = yy as f32 + 0.5 - cy;
                if dx * dx + dy * dy <= r2 {
                    let idx = ((yy * img.width + xx) * 4) as usize;
                    img.rgba[idx..idx + 4].copy_from_slice(&color);
                }
            }
        }
        rest = &rest[i + tag_end + 1..];
    }
    Ok(img)
}

fn parse_svg_color(s: &str) -> [u8; 4] {
    let s = s.trim();
    if let Some(hex) = s.strip_prefix('#') {
        if hex.len() == 6 {
            if let Ok(n) = u32::from_str_radix(hex, 16) {
                return [
                    ((n >> 16) & 0xff) as u8,
                    ((n >> 8) & 0xff) as u8,
                    (n & 0xff) as u8,
                    255,
                ];
            }
        }
    }
    [0, 0, 0, 255]
}

/// Handle to a decoded image in an [`ImageCache`].
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub struct ImageHandle(pub u32);

/// Decoded images keyed by handle; renderers look images up here.
#[derive(Clone, Debug, Default)]
pub struct ImageCache {
    images: HashMap<ImageHandle, DecodedImage>,
    next: u32,
}

impl ImageCache {
    /// Creates an empty cache.
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Stores an image.
    pub fn insert(&mut self, image: DecodedImage) -> ImageHandle {
        self.next += 1;
        let handle = ImageHandle(self.next);
        self.images.insert(handle, image);
        handle
    }

    /// Looks an image up.
    #[must_use]
    pub fn get(&self, handle: ImageHandle) -> Option<&DecodedImage> {
        self.images.get(&handle)
    }

    /// Removes an image.
    pub fn remove(&mut self, handle: ImageHandle) -> Option<DecodedImage> {
        self.images.remove(&handle)
    }

    /// Number of images.
    #[must_use]
    pub fn len(&self) -> usize {
        self.images.len()
    }

    /// Whether the cache is empty.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.images.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sniffs_formats_from_magic_bytes() {
        assert_eq!(sniff_format(b"\x89PNG\r\n\x1a\n...."), ImageFormat::Png);
        assert_eq!(sniff_format(&[0xFF, 0xD8, 0xFF, 0xE0]), ImageFormat::Jpeg);
        assert_eq!(sniff_format(b"GIF89a"), ImageFormat::Gif);
        assert_eq!(
            sniff_format(b"RIFF\x00\x00\x00\x00WEBPVP8 "),
            ImageFormat::WebP
        );
        assert_eq!(sniff_format(b"\x00\x00\x00\x1cftypavif"), ImageFormat::Avif);
        assert_eq!(
            sniff_format(b"  <?xml version='1.0'?><svg xmlns='http://www.w3.org/2000/svg'/>"),
            ImageFormat::Svg
        );
        assert_eq!(sniff_format(b"hello"), ImageFormat::Unknown);
        assert_eq!(ImageFormat::WebP.mime_type(), "image/webp");
    }

    #[test]
    fn cache_and_decoded_image_basics() {
        let mut cache = ImageCache::new();
        let h = cache.insert(DecodedImage::solid(2, 1, [1, 2, 3, 255]));
        assert_eq!(cache.get(h).unwrap().pixel(1, 0), Some([1, 2, 3, 255]));
        assert_eq!(cache.get(h).unwrap().pixel(2, 0), None);
        assert!(DecodedImage::from_rgba(2, 2, vec![0; 3]).is_none());
        assert!(cache.remove(h).is_some() && cache.is_empty());
        if cfg!(not(feature = "images")) {
            assert!(matches!(
                decode(b"\x89PNG\r\n\x1a\n"),
                Err(GfxError::Unsupported(_))
            ));
        }
        let svg = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><rect x='0' y='0' width='8' height='8' fill='#ff0000'/></svg>",
        )
        .expect("svg");
        assert_eq!(svg.width, 8);
        assert_eq!(svg.pixel(0, 0), Some([255, 0, 0, 255]));
        let circle = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><circle cx='4' cy='4' r='3' fill='#00ff00'/></svg>",
        )
        .expect("svg circle");
        assert_eq!(circle.pixel(4, 4), Some([0, 255, 0, 255]));
        assert_eq!(circle.pixel(0, 0), Some([0, 0, 0, 0]));
    }
}
