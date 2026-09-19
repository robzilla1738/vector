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
        if let Some(vb) = tag
            .split("viewBox=\"")
            .nth(1)
            .and_then(|s| s.split('"').next())
        {
            let nums: Vec<f32> = vb
                .split_whitespace()
                .filter_map(|p| p.parse().ok())
                .collect();
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
    rest = text.as_ref();
    while let Some(i) = rest.find("<ellipse") {
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        let cx = svg_attr(tag, "cx").unwrap_or(0.0);
        let cy = svg_attr(tag, "cy").unwrap_or(0.0);
        let rx = svg_attr(tag, "rx").unwrap_or(0.0);
        let ry = svg_attr(tag, "ry").unwrap_or(0.0);
        let color = parse_svg_color(svg_fill(tag));
        let x0 = (cx - rx).floor().max(0.0) as u32;
        let y0 = (cy - ry).floor().max(0.0) as u32;
        let x1 = (cx + rx).ceil().min(img.width as f32) as u32;
        let y1 = (cy + ry).ceil().min(img.height as f32) as u32;
        for yy in y0..y1 {
            for xx in x0..x1 {
                let nx = (xx as f32 + 0.5 - cx) / rx.max(0.001);
                let ny = (yy as f32 + 0.5 - cy) / ry.max(0.001);
                if nx * nx + ny * ny <= 1.0 {
                    let idx = ((yy * img.width + xx) * 4) as usize;
                    img.rgba[idx..idx + 4].copy_from_slice(&color);
                }
            }
        }
        rest = &rest[i + tag_end + 1..];
    }
    rest = text.as_ref();
    while let Some(i) = rest.find("<line") {
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        let x1 = svg_attr(tag, "x1").unwrap_or(0.0);
        let y1 = svg_attr(tag, "y1").unwrap_or(0.0);
        let x2 = svg_attr(tag, "x2").unwrap_or(0.0);
        let y2 = svg_attr(tag, "y2").unwrap_or(0.0);
        let color = parse_svg_color(
            tag.split("stroke=")
                .nth(1)
                .and_then(|s| {
                    let q = s.chars().next()?;
                    if q == '"' || q == '\'' {
                        s[1..].split(q).next()
                    } else {
                        None
                    }
                })
                .unwrap_or("#000000"),
        );
        stroke_line(&mut img, x1, y1, x2, y2, color);
        rest = &rest[i + tag_end + 1..];
    }
    rest = text.as_ref();
    loop {
        let i = match (rest.find("<polyline"), rest.find("<polygon")) {
            (Some(a), Some(b)) => a.min(b),
            (Some(a), None) => a,
            (None, Some(b)) => b,
            (None, None) => break,
        };
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        let closed = tag.starts_with("<polygon");
        let color = parse_svg_color(
            tag.split("stroke=")
                .nth(1)
                .and_then(|s| {
                    let q = s.chars().next()?;
                    if q == '"' || q == '\'' {
                        s[1..].split(q).next()
                    } else {
                        None
                    }
                })
                .unwrap_or_else(|| svg_fill(tag)),
        );
        let mut pts = Vec::new();
        if let Some(raw) = svg_attr_str(tag, "points") {
            for pair in raw.split(|c: char| c == ',' || c.is_whitespace()) {
                if pair.is_empty() {
                    continue;
                }
                if let Ok(n) = pair.parse::<f32>() {
                    pts.push(n);
                }
            }
        }
        let mut coords: Vec<(f32, f32)> = pts
            .chunks(2)
            .filter_map(|c| (c.len() == 2).then_some((c[0], c[1])))
            .collect();
        if closed && coords.len() >= 2 {
            let first = coords[0];
            coords.push(first);
        }
        for w in coords.windows(2) {
            stroke_line(&mut img, w[0].0, w[0].1, w[1].0, w[1].1, color);
        }
        rest = &rest[i + tag_end + 1..];
    }
    rest = text.as_ref();
    while let Some(i) = rest.find("<path") {
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        let color = parse_svg_color(
            tag.split("stroke=")
                .nth(1)
                .and_then(|s| {
                    let q = s.chars().next()?;
                    if q == '"' || q == '\'' {
                        s[1..].split(q).next()
                    } else {
                        None
                    }
                })
                .unwrap_or_else(|| svg_fill(tag)),
        );
        if let Some(d) = svg_attr_str(tag, "d") {
            for w in svg_path_points(d).windows(2) {
                stroke_line(&mut img, w[0].0, w[0].1, w[1].0, w[1].1, color);
            }
        }
        rest = &rest[i + tag_end + 1..];
    }
    Ok(img)
}

fn stroke_line(img: &mut DecodedImage, x1: f32, y1: f32, x2: f32, y2: f32, color: [u8; 4]) {
    let steps = (x2 - x1).abs().max((y2 - y1).abs()).ceil().max(1.0) as i32;
    for s in 0..=steps {
        let t = s as f32 / steps as f32;
        let xx = (x1 + (x2 - x1) * t).round() as i32;
        let yy = (y1 + (y2 - y1) * t).round() as i32;
        if xx >= 0 && yy >= 0 && (xx as u32) < img.width && (yy as u32) < img.height {
            let idx = ((yy as u32 * img.width + xx as u32) * 4) as usize;
            img.rgba[idx..idx + 4].copy_from_slice(&color);
        }
    }
}

fn svg_path_points(d: &str) -> Vec<(f32, f32)> {
    let mut nums = Vec::new();
    let mut cmds = Vec::new();
    let mut rest = d.trim();
    while !rest.is_empty() {
        let c = rest.as_bytes()[0] as char;
        if c.is_ascii_alphabetic() {
            cmds.push((nums.len(), c));
            rest = rest[1..].trim_start();
            continue;
        }
        if c == ',' {
            rest = rest[1..].trim_start();
            continue;
        }
        let bytes = rest.as_bytes();
        let mut end = 0;
        if bytes[0] == b'+' || bytes[0] == b'-' {
            end = 1;
        }
        let mut saw_dot = false;
        while end < bytes.len() {
            let ch = bytes[end] as char;
            if ch.is_ascii_digit() {
                end += 1;
            } else if ch == '.' && !saw_dot {
                saw_dot = true;
                end += 1;
            } else {
                break;
            }
        }
        if end > 0
            && rest[..end]
                .parse::<f32>()
                .ok()
                .map(|n| {
                    nums.push(n);
                    true
                })
                .unwrap_or(false)
        {
            rest = rest[end..].trim_start();
            continue;
        }
        rest = rest[1..].trim_start();
    }
    let mut out = Vec::new();
    let mut cx = 0.0;
    let mut cy = 0.0;
    let mut sx = 0.0;
    let mut sy = 0.0;
    for (i, &(start, cmd)) in cmds.iter().enumerate() {
        let next_cmd_at = cmds.get(i + 1).map(|(idx, _)| *idx).unwrap_or(nums.len());
        let mut ni = start;
        let rel = cmd.is_ascii_lowercase();
        match cmd.to_ascii_uppercase() {
            'M' | 'L' => {
                let mut first = cmd.eq_ignore_ascii_case(&'m');
                while ni + 1 < next_cmd_at {
                    let mut x = nums[ni];
                    let mut y = nums[ni + 1];
                    if rel {
                        x += cx;
                        y += cy;
                    }
                    if !first && !out.is_empty() {
                        out.push((cx, cy));
                    }
                    out.push((x, y));
                    cx = x;
                    cy = y;
                    if first {
                        sx = x;
                        sy = y;
                        first = false;
                    }
                    ni += 2;
                }
            }
            'H' => {
                while ni < next_cmd_at {
                    let mut x = nums[ni];
                    if rel {
                        x += cx;
                    }
                    out.push((cx, cy));
                    out.push((x, cy));
                    cx = x;
                    ni += 1;
                }
            }
            'V' => {
                while ni < next_cmd_at {
                    let mut y = nums[ni];
                    if rel {
                        y += cy;
                    }
                    out.push((cx, cy));
                    out.push((cx, y));
                    cy = y;
                    ni += 1;
                }
            }
            'Z' => {
                out.push((cx, cy));
                out.push((sx, sy));
                cx = sx;
                cy = sy;
            }
            _ => {}
        }
    }
    out
}

fn svg_attr_str<'a>(tag: &'a str, name: &str) -> Option<&'a str> {
    let key = format!("{name}=");
    let rest = tag.split(&key).nth(1)?;
    let q = rest.chars().next()?;
    if q == '"' || q == '\'' {
        rest[1..].split(q).next()
    } else {
        None
    }
}

fn svg_fill(tag: &str) -> &str {
    tag.split("fill=")
        .nth(1)
        .and_then(|s| {
            let q = s.chars().next()?;
            if q == '"' || q == '\'' {
                s[1..].split(q).next()
            } else {
                None
            }
        })
        .unwrap_or("#000000")
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

    /// Copies every entry from `other`, preserving handles so a display list
    /// built with [`Page::node_images`] can paint on a different renderer.
    pub fn extend_from(&mut self, other: &Self) {
        for (handle, image) in &other.images {
            self.images.insert(*handle, image.clone());
            self.next = self.next.max(handle.0);
        }
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
        let mut a = ImageCache::new();
        let ha = a.insert(DecodedImage::solid(1, 1, [9, 8, 7, 255]));
        let mut b = ImageCache::new();
        b.extend_from(&a);
        assert_eq!(b.get(ha).unwrap().pixel(0, 0), Some([9, 8, 7, 255]));
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
        let ellipse = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><ellipse cx='4' cy='4' rx='3' ry='2' fill='#0000ff'/></svg>",
        )
        .expect("svg ellipse");
        assert_eq!(ellipse.pixel(4, 4), Some([0, 0, 255, 255]));
        assert_eq!(ellipse.pixel(0, 0), Some([0, 0, 0, 0]));
        let line = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><line x1='0' y1='0' x2='7' y2='0' stroke='#ffffff'/></svg>",
        )
        .expect("svg line");
        assert_eq!(line.pixel(0, 0), Some([255, 255, 255, 255]));
        assert_eq!(line.pixel(7, 0), Some([255, 255, 255, 255]));
        let poly = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><polyline points='0,0 7,0' stroke='#00ffff'/></svg>",
        )
        .expect("svg polyline");
        assert_eq!(poly.pixel(0, 0), Some([0, 255, 255, 255]));
        assert_eq!(poly.pixel(7, 0), Some([0, 255, 255, 255]));
        let path = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><path d='M0 0 H7 V0' stroke='#ff00ff'/></svg>",
        )
        .expect("svg path");
        assert_eq!(path.pixel(0, 0), Some([255, 0, 255, 255]));
        assert_eq!(path.pixel(7, 0), Some([255, 0, 255, 255]));
    }
}
