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
            .or_else(|| tag.split("viewbox=\"").nth(1))
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
    let full = text.as_ref();
    let grads = parse_svg_gradients(full);
    let by_id = parse_svg_ids(full);
    let mut rest = full;
    while let Some(i) = rest.find("<rect") {
        let abs = full.len() - rest.len() + i;
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        if !svg_in_defs(full, abs) {
            paint_svg_rect(&mut img, tag, 0.0, 0.0, &grads);
        }
        rest = &rest[i + tag_end + 1..];
    }
    rest = text.as_ref();
    while let Some(i) = rest.find("<circle") {
        let abs = full.len() - rest.len() + i;
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        if !svg_in_defs(full, abs) {
            paint_svg_circle(&mut img, tag, 0.0, 0.0, &grads);
        }
        rest = &rest[i + tag_end + 1..];
    }
    rest = text.as_ref();
    while let Some(i) = rest.find("<ellipse") {
        let abs = full.len() - rest.len() + i;
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        if !svg_in_defs(full, abs) {
            paint_svg_ellipse(&mut img, tag, 0.0, 0.0, &grads);
        }
        rest = &rest[i + tag_end + 1..];
    }
    rest = text.as_ref();
    while let Some(i) = find_svg_tag(rest, "line") {
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        let x1 = svg_attr(tag, "x1").unwrap_or(0.0);
        let y1 = svg_attr(tag, "y1").unwrap_or(0.0);
        let x2 = svg_attr(tag, "x2").unwrap_or(0.0);
        let y2 = svg_attr(tag, "y2").unwrap_or(0.0);
        let (color, width) = svg_stroke(tag);
        stroke_line(&mut img, x1, y1, x2, y2, color, width);
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
        let (color, width) = svg_stroke(tag);
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
        let fill = svg_fill(tag);
        if closed && !fill.eq_ignore_ascii_case("none") && coords.len() >= 3 {
            fill_polygon_with(&mut img, &coords, |x, y| {
                paint_fill_color(tag, fill, &grads, x as f32 + 0.5, y as f32 + 0.5)
            });
        }
        for w in coords.windows(2) {
            stroke_line(&mut img, w[0].0, w[0].1, w[1].0, w[1].1, color, width);
        }
        rest = &rest[i + tag_end + 1..];
    }
    rest = text.as_ref();
    while let Some(i) = rest.find("<path") {
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        let (color, width) = svg_stroke(tag);
        if let Some(d) = svg_attr_str(tag, "d") {
            let mut pts = svg_path_points(d);
            let closed = d.bytes().any(|b| b == b'Z' || b == b'z');
            if closed && pts.len() >= 2 && pts.first() != pts.last() {
                let first = pts[0];
                pts.push(first);
            }
            let fill = svg_fill(tag);
            if closed && !fill.eq_ignore_ascii_case("none") && pts.len() >= 3 {
                fill_polygon_with(&mut img, &pts, |x, y| {
                    paint_fill_color(tag, fill, &grads, x as f32 + 0.5, y as f32 + 0.5)
                });
            }
            if svg_attr_str(tag, "stroke").is_some() || !closed {
                for w in pts.windows(2) {
                    stroke_line(&mut img, w[0].0, w[0].1, w[1].0, w[1].1, color, width);
                }
            }
        }
        rest = &rest[i + tag_end + 1..];
    }
    rest = full;
    while let Some(i) = rest.find("<use") {
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        let href = svg_attr_str(tag, "href")
            .or_else(|| svg_attr_str(tag, "xlink:href"))
            .unwrap_or("");
        let id = href.strip_prefix('#').unwrap_or(href);
        if let Some(src) = by_id.get(id) {
            let ox = svg_attr(tag, "x").unwrap_or(0.0);
            let oy = svg_attr(tag, "y").unwrap_or(0.0);
            if src.starts_with("<rect") {
                paint_svg_rect(&mut img, src, ox, oy, &grads);
            } else if src.starts_with("<circle") {
                paint_svg_circle(&mut img, src, ox, oy, &grads);
            } else if src.starts_with("<ellipse") {
                paint_svg_ellipse(&mut img, src, ox, oy, &grads);
            }
        }
        rest = &rest[i + tag_end + 1..];
    }
    rest = full;
    while let Some(i) = find_svg_tag(rest, "text") {
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        let after = &rest[i + tag_end + 1..];
        let content = after.split("</text>").next().unwrap_or("");
        let color = parse_svg_color(svg_fill(tag));
        let x = svg_attr(tag, "x").unwrap_or(0.0);
        let y = svg_attr(tag, "y").unwrap_or(0.0);
        paint_svg_text(&mut img, content, x, y, color);
        rest = after;
    }
    Ok(img)
}

struct SvgGrad {
    x1: f32,
    y1: f32,
    x2: f32,
    y2: f32,
    cx: f32,
    cy: f32,
    r: f32,
    stops: Vec<(f32, [u8; 4])>,
}

fn find_svg_tag(hay: &str, name: &str) -> Option<usize> {
    let pat = format!("<{name}");
    let mut off = 0;
    let mut rest = hay;
    while let Some(i) = rest.find(&pat) {
        let next = rest.as_bytes().get(i + pat.len()).copied().unwrap_or(b'>');
        if !next.is_ascii_alphabetic() {
            return Some(off + i);
        }
        let skip = i + pat.len();
        rest = &rest[skip..];
        off += skip;
    }
    None
}

fn svg_in_defs(full: &str, pos: usize) -> bool {
    let before = &full[..pos.min(full.len())];
    match (before.rfind("<defs"), before.rfind("</defs>")) {
        (Some(o), Some(c)) => o > c,
        (Some(_), None) => true,
        _ => false,
    }
}

fn parse_url_id(fill: &str) -> Option<&str> {
    let s = fill.trim();
    let s = s.strip_prefix("url(")?.trim_end_matches(')').trim();
    let s = s.trim_matches(|c| c == '"' || c == '\'');
    s.strip_prefix('#')
}

fn parse_svg_ids(text: &str) -> HashMap<String, String> {
    let mut out = HashMap::new();
    let mut rest = text;
    while let Some(i) = rest.find('<') {
        if rest[i..].starts_with("</") {
            rest = &rest[i + 2..];
            continue;
        }
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        if let Some(id) = svg_attr_str(tag, "id") {
            out.insert(id.to_string(), tag.to_string());
        }
        rest = &rest[i + tag_end + 1..];
    }
    out
}

fn parse_offset(s: &str) -> f32 {
    let s = s.trim();
    if let Some(p) = s.strip_suffix('%') {
        return p.parse::<f32>().unwrap_or(0.0) / 100.0;
    }
    s.parse::<f32>().unwrap_or(0.0)
}

fn parse_gradient_stops(block: &str) -> Vec<(f32, [u8; 4])> {
    let mut stops = Vec::new();
    let mut srest = block;
    while let Some(si) = srest.find("<stop") {
        let st_end = srest[si..].find('>').unwrap_or(srest.len() - si);
        let stop = &srest[si..si + st_end];
        let off = svg_attr_str(stop, "offset")
            .map(parse_offset)
            .unwrap_or(0.0);
        let color = parse_svg_color(svg_attr_str(stop, "stop-color").unwrap_or("#000000"));
        stops.push((off, color));
        srest = &srest[si + st_end + 1..];
    }
    stops.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap_or(std::cmp::Ordering::Equal));
    stops
}

fn parse_svg_gradients(text: &str) -> HashMap<String, SvgGrad> {
    let mut out = HashMap::new();
    for (open, close, radial) in [
        ("<linearGradient", "</linearGradient>", false),
        ("<radialGradient", "</radialGradient>", true),
    ] {
        let mut rest = text;
        while let Some(i) = rest.find(open) {
            let after = &rest[i..];
            let end = after
                .find(close)
                .map(|e| e + close.len())
                .unwrap_or_else(|| after.find('>').map(|e| e + 1).unwrap_or(after.len()));
            let block = &after[..end];
            let tag_end = block.find('>').unwrap_or(block.len());
            let tag = &block[..tag_end];
            if let Some(id) = svg_attr_str(tag, "id") {
                out.insert(
                    id.to_string(),
                    SvgGrad {
                        x1: svg_attr(tag, "x1").unwrap_or(0.0),
                        y1: svg_attr(tag, "y1").unwrap_or(0.0),
                        x2: svg_attr(tag, "x2").unwrap_or(1.0),
                        y2: svg_attr(tag, "y2").unwrap_or(0.0),
                        cx: svg_attr(tag, "cx").unwrap_or(0.0),
                        cy: svg_attr(tag, "cy").unwrap_or(0.0),
                        r: if radial {
                            svg_attr(tag, "r").unwrap_or(1.0)
                        } else {
                            0.0
                        },
                        stops: parse_gradient_stops(block),
                    },
                );
            }
            rest = &after[end..];
        }
    }
    out
}

fn sample_grad(g: &SvgGrad, x: f32, y: f32) -> [u8; 4] {
    if g.stops.is_empty() {
        return [0, 0, 0, 255];
    }
    let t = if g.r > 0.0 {
        let dx = x - g.cx;
        let dy = y - g.cy;
        ((dx * dx + dy * dy).sqrt() / g.r).clamp(0.0, 1.0)
    } else {
        let dx = g.x2 - g.x1;
        let dy = g.y2 - g.y1;
        let len2 = dx * dx + dy * dy;
        if len2 < 1e-6 {
            0.0
        } else {
            ((x - g.x1) * dx + (y - g.y1) * dy) / len2
        }
    }
    .clamp(0.0, 1.0);
    if t <= g.stops[0].0 {
        return g.stops[0].1;
    }
    let last = g.stops.len() - 1;
    if t >= g.stops[last].0 {
        return g.stops[last].1;
    }
    let mut i = 0;
    while i + 1 < g.stops.len() && g.stops[i + 1].0 < t {
        i += 1;
    }
    let (a_t, a_c) = g.stops[i];
    let (b_t, b_c) = g.stops[i + 1];
    let u = ((t - a_t) / (b_t - a_t).max(1e-6)).clamp(0.0, 1.0);
    [
        (a_c[0] as f32 + (b_c[0] as f32 - a_c[0] as f32) * u) as u8,
        (a_c[1] as f32 + (b_c[1] as f32 - a_c[1] as f32) * u) as u8,
        (a_c[2] as f32 + (b_c[2] as f32 - a_c[2] as f32) * u) as u8,
        255,
    ]
}

fn paint_svg_rect(
    img: &mut DecodedImage,
    tag: &str,
    ox: f32,
    oy: f32,
    grads: &HashMap<String, SvgGrad>,
) {
    let x = (svg_attr(tag, "x").unwrap_or(0.0) + ox).max(0.0) as u32;
    let y = (svg_attr(tag, "y").unwrap_or(0.0) + oy).max(0.0) as u32;
    let w = svg_attr(tag, "width").unwrap_or(0.0).max(0.0) as u32;
    let h = svg_attr(tag, "height").unwrap_or(0.0).max(0.0) as u32;
    let fill = svg_fill(tag);
    for yy in y..(y + h).min(img.height) {
        for xx in x..(x + w).min(img.width) {
            let color = paint_fill_color(tag, fill, grads, xx as f32 + 0.5, yy as f32 + 0.5);
            let idx = ((yy * img.width + xx) * 4) as usize;
            img.rgba[idx..idx + 4].copy_from_slice(&color);
        }
    }
}

fn paint_svg_circle(
    img: &mut DecodedImage,
    tag: &str,
    ox: f32,
    oy: f32,
    grads: &HashMap<String, SvgGrad>,
) {
    let cx = svg_attr(tag, "cx").unwrap_or(0.0) + ox;
    let cy = svg_attr(tag, "cy").unwrap_or(0.0) + oy;
    let r = svg_attr(tag, "r").unwrap_or(0.0);
    let fill = svg_fill(tag);
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
                let color = paint_fill_color(tag, fill, grads, xx as f32 + 0.5, yy as f32 + 0.5);
                let idx = ((yy * img.width + xx) * 4) as usize;
                img.rgba[idx..idx + 4].copy_from_slice(&color);
            }
        }
    }
}

fn paint_svg_ellipse(
    img: &mut DecodedImage,
    tag: &str,
    ox: f32,
    oy: f32,
    grads: &HashMap<String, SvgGrad>,
) {
    let cx = svg_attr(tag, "cx").unwrap_or(0.0) + ox;
    let cy = svg_attr(tag, "cy").unwrap_or(0.0) + oy;
    let rx = svg_attr(tag, "rx").unwrap_or(0.0);
    let ry = svg_attr(tag, "ry").unwrap_or(0.0);
    let fill = svg_fill(tag);
    let x0 = (cx - rx).floor().max(0.0) as u32;
    let y0 = (cy - ry).floor().max(0.0) as u32;
    let x1 = (cx + rx).ceil().min(img.width as f32) as u32;
    let y1 = (cy + ry).ceil().min(img.height as f32) as u32;
    for yy in y0..y1 {
        for xx in x0..x1 {
            let nx = (xx as f32 + 0.5 - cx) / rx.max(0.001);
            let ny = (yy as f32 + 0.5 - cy) / ry.max(0.001);
            if nx * nx + ny * ny <= 1.0 {
                let color = paint_fill_color(tag, fill, grads, xx as f32 + 0.5, yy as f32 + 0.5);
                let idx = ((yy * img.width + xx) * 4) as usize;
                img.rgba[idx..idx + 4].copy_from_slice(&color);
            }
        }
    }
}

fn glyph_5x7(ch: char) -> Option<[u8; 7]> {
    Some(match ch {
        'I' => [
            0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100,
        ],
        'X' => [
            0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b01010, 0b10001,
        ],
        'H' => [
            0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001,
        ],
        'A' => [
            0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001,
        ],
        'V' => [
            0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100,
        ],
        'E' => [
            0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111,
        ],
        'C' => [
            0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110,
        ],
        'T' => [
            0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100,
        ],
        'O' => [
            0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110,
        ],
        'R' => [
            0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001,
        ],
        _ => return None,
    })
}

fn paint_svg_text(img: &mut DecodedImage, content: &str, x: f32, y: f32, color: [u8; 4]) {
    let mut cx = x.round() as i32;
    let baseline = y.round() as i32;
    for ch in content.chars() {
        if ch == ' ' {
            cx += 4;
            continue;
        }
        let Some(rows) = glyph_5x7(ch) else {
            cx += 6;
            continue;
        };
        for (row, bits) in rows.iter().enumerate() {
            for col in 0..5 {
                if bits & (1 << (4 - col)) == 0 {
                    continue;
                }
                let xx = cx + col as i32;
                let yy = baseline - 7 + row as i32;
                if xx >= 0 && yy >= 0 && (xx as u32) < img.width && (yy as u32) < img.height {
                    let idx = ((yy as u32 * img.width + xx as u32) * 4) as usize;
                    img.rgba[idx..idx + 4].copy_from_slice(&color);
                }
            }
        }
        cx += 6;
    }
}

fn fill_polygon_with(
    img: &mut DecodedImage,
    pts: &[(f32, f32)],
    mut color_at: impl FnMut(u32, u32) -> [u8; 4],
) {
    if pts.len() < 3 {
        return;
    }
    let mut min_y = i32::MAX;
    let mut max_y = i32::MIN;
    for p in pts {
        let y = p.1.round() as i32;
        min_y = min_y.min(y);
        max_y = max_y.max(y);
    }
    min_y = min_y.max(0);
    max_y = max_y.min(img.height as i32 - 1);
    for y in min_y..=max_y {
        let mut xs = Vec::new();
        for w in pts.windows(2) {
            let (x0, y0) = w[0];
            let (x1, y1) = w[1];
            let yf = y as f32 + 0.5;
            if (y0 <= yf && y1 > yf) || (y1 <= yf && y0 > yf) {
                let t = (yf - y0) / (y1 - y0);
                xs.push(x0 + t * (x1 - x0));
            }
        }
        xs.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
        for pair in xs.chunks(2) {
            if pair.len() < 2 {
                continue;
            }
            let x0 = pair[0].ceil().max(0.0) as u32;
            let x1 = pair[1].floor().min(img.width.saturating_sub(1) as f32) as u32;
            if x0 > x1 {
                continue;
            }
            for x in x0..=x1 {
                let idx = ((y as u32 * img.width + x) * 4) as usize;
                if idx + 3 < img.rgba.len() {
                    img.rgba[idx..idx + 4].copy_from_slice(&color_at(x, y as u32));
                }
            }
        }
    }
}

fn svg_opacity_attr(tag: &str, name: &str) -> f32 {
    svg_attr(tag, name)
        .or_else(|| svg_attr(tag, "opacity"))
        .unwrap_or(1.0)
        .clamp(0.0, 1.0)
}

fn with_opacity(mut color: [u8; 4], opacity: f32) -> [u8; 4] {
    color[3] = (f32::from(color[3]) * opacity).round() as u8;
    color
}

fn paint_fill_color(
    tag: &str,
    fill: &str,
    grads: &HashMap<String, SvgGrad>,
    x: f32,
    y: f32,
) -> [u8; 4] {
    let color = parse_url_id(fill)
        .and_then(|id| grads.get(id))
        .map(|g| sample_grad(g, x, y))
        .unwrap_or_else(|| parse_svg_color(fill));
    with_opacity(color, svg_opacity_attr(tag, "fill-opacity"))
}

fn svg_stroke(tag: &str) -> ([u8; 4], f32) {
    let raw = svg_attr_str(tag, "stroke").unwrap_or_else(|| svg_fill(tag));
    let color = with_opacity(
        parse_svg_color(raw),
        svg_opacity_attr(tag, "stroke-opacity"),
    );
    let width = svg_attr(tag, "stroke-width").unwrap_or(1.0).max(0.0);
    (color, width)
}

fn stroke_line(
    img: &mut DecodedImage,
    x1: f32,
    y1: f32,
    x2: f32,
    y2: f32,
    color: [u8; 4],
    width: f32,
) {
    let steps = (x2 - x1).abs().max((y2 - y1).abs()).ceil().max(1.0) as i32;
    let radius = (width * 0.5).max(0.5);
    let r = radius.ceil() as i32;
    for s in 0..=steps {
        let t = s as f32 / steps as f32;
        let cx = (x1 + (x2 - x1) * t).round() as i32;
        let cy = (y1 + (y2 - y1) * t).round() as i32;
        for dy in -r..=r {
            for dx in -r..=r {
                if (dx as f32).hypot(dy as f32) > radius + 0.25 {
                    continue;
                }
                let xx = cx + dx;
                let yy = cy + dy;
                if xx >= 0 && yy >= 0 && (xx as u32) < img.width && (yy as u32) < img.height {
                    let idx = ((yy as u32 * img.width + xx as u32) * 4) as usize;
                    img.rgba[idx..idx + 4].copy_from_slice(&color);
                }
            }
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
            'Q' => {
                while ni + 3 < next_cmd_at {
                    let mut cpx = nums[ni];
                    let mut cpy = nums[ni + 1];
                    let mut x = nums[ni + 2];
                    let mut y = nums[ni + 3];
                    if rel {
                        cpx += cx;
                        cpy += cy;
                        x += cx;
                        y += cy;
                    }
                    sample_quad(&mut out, cx, cy, cpx, cpy, x, y);
                    cx = x;
                    cy = y;
                    ni += 4;
                }
            }
            'C' => {
                while ni + 5 < next_cmd_at {
                    let mut x1 = nums[ni];
                    let mut y1 = nums[ni + 1];
                    let mut x2 = nums[ni + 2];
                    let mut y2 = nums[ni + 3];
                    let mut x = nums[ni + 4];
                    let mut y = nums[ni + 5];
                    if rel {
                        x1 += cx;
                        y1 += cy;
                        x2 += cx;
                        y2 += cy;
                        x += cx;
                        y += cy;
                    }
                    sample_cubic(&mut out, cx, cy, x1, y1, x2, y2, x, y);
                    cx = x;
                    cy = y;
                    ni += 6;
                }
            }
            'A' => {
                while ni + 6 < next_cmd_at {
                    let rx = nums[ni];
                    let ry = nums[ni + 1];
                    let phi = nums[ni + 2];
                    let large = nums[ni + 3];
                    let sweep = nums[ni + 4];
                    let mut x = nums[ni + 5];
                    let mut y = nums[ni + 6];
                    if rel {
                        x += cx;
                        y += cy;
                    }
                    sample_arc(
                        &mut out,
                        cx,
                        cy,
                        rx,
                        ry,
                        phi,
                        large != 0.0,
                        sweep != 0.0,
                        x,
                        y,
                    );
                    cx = x;
                    cy = y;
                    ni += 7;
                }
            }
            _ => {}
        }
    }
    out
}

fn sample_quad(out: &mut Vec<(f32, f32)>, x0: f32, y0: f32, x1: f32, y1: f32, x2: f32, y2: f32) {
    if out.last() != Some(&(x0, y0)) {
        out.push((x0, y0));
    }
    for i in 1..=12 {
        let t = i as f32 / 12.0;
        let u = 1.0 - t;
        out.push((
            u * u * x0 + 2.0 * u * t * x1 + t * t * x2,
            u * u * y0 + 2.0 * u * t * y1 + t * t * y2,
        ));
    }
}

fn sample_arc(
    out: &mut Vec<(f32, f32)>,
    x0: f32,
    y0: f32,
    mut rx: f32,
    mut ry: f32,
    phi_deg: f32,
    large: bool,
    sweep: bool,
    x: f32,
    y: f32,
) {
    rx = rx.abs();
    ry = ry.abs();
    if rx < 1e-6 || ry < 1e-6 {
        if out.last() != Some(&(x0, y0)) {
            out.push((x0, y0));
        }
        out.push((x, y));
        return;
    }
    let phi = phi_deg.to_radians();
    let (cos_p, sin_p) = (phi.cos(), phi.sin());
    let dx = (x0 - x) / 2.0;
    let dy = (y0 - y) / 2.0;
    let x1 = cos_p * dx + sin_p * dy;
    let y1 = -sin_p * dx + cos_p * dy;
    let lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
    if lambda > 1.0 {
        let s = lambda.sqrt();
        rx *= s;
        ry *= s;
    }
    let num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
    let den = rx * rx * y1 * y1 + ry * ry * x1 * x1;
    let sq = (num / den.max(1e-12)).max(0.0).sqrt();
    let sign = if large == sweep { -1.0 } else { 1.0 };
    let cx1 = sign * sq * rx * y1 / ry;
    let cy1 = sign * sq * -ry * x1 / rx;
    let ccx = cos_p * cx1 - sin_p * cy1 + (x0 + x) / 2.0;
    let ccy = sin_p * cx1 + cos_p * cy1 + (y0 + y) / 2.0;
    let vec_angle = |ux: f32, uy: f32, vx: f32, vy: f32| {
        let n = (ux * ux + uy * uy).sqrt() * (vx * vx + vy * vy).sqrt();
        let mut a = ((ux * vx + uy * vy) / n.max(1e-12)).clamp(-1.0, 1.0).acos();
        if ux * vy - uy * vx < 0.0 {
            a = -a;
        }
        a
    };
    let theta1 = vec_angle(1.0, 0.0, (x1 - cx1) / rx, (y1 - cy1) / ry);
    let mut dtheta = vec_angle(
        (x1 - cx1) / rx,
        (y1 - cy1) / ry,
        (-x1 - cx1) / rx,
        (-y1 - cy1) / ry,
    );
    if !sweep && dtheta > 0.0 {
        dtheta -= std::f32::consts::TAU;
    }
    if sweep && dtheta < 0.0 {
        dtheta += std::f32::consts::TAU;
    }
    if out.last() != Some(&(x0, y0)) {
        out.push((x0, y0));
    }
    for i in 1..=16 {
        let th = theta1 + dtheta * (i as f32 / 16.0);
        let px = rx * th.cos();
        let py = ry * th.sin();
        out.push((cos_p * px - sin_p * py + ccx, sin_p * px + cos_p * py + ccy));
    }
}

fn sample_cubic(
    out: &mut Vec<(f32, f32)>,
    x0: f32,
    y0: f32,
    x1: f32,
    y1: f32,
    x2: f32,
    y2: f32,
    x3: f32,
    y3: f32,
) {
    if out.last() != Some(&(x0, y0)) {
        out.push((x0, y0));
    }
    for i in 1..=16 {
        let t = i as f32 / 16.0;
        let u = 1.0 - t;
        out.push((
            u * u * u * x0 + 3.0 * u * u * t * x1 + 3.0 * u * t * t * x2 + t * t * t * x3,
            u * u * u * y0 + 3.0 * u * u * t * y1 + 3.0 * u * t * t * y2 + t * t * t * y3,
        ));
    }
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
        let quad = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='16' height='8'><path d='M0 7 Q8 0 15 7' stroke='#00ff00'/></svg>",
        )
        .expect("svg quadratic path");
        assert_eq!(quad.pixel(0, 7), Some([0, 255, 0, 255]));
        assert_eq!(quad.pixel(15, 7), Some([0, 255, 0, 255]));
        assert_eq!(quad.pixel(8, 4), Some([0, 255, 0, 255]));
        let arc = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M0 8 A8 8 0 0 0 8 0' stroke='#ff0000'/></svg>",
        )
        .expect("svg arc path");
        assert_eq!(arc.pixel(0, 8), Some([255, 0, 0, 255]));
        assert_eq!(arc.pixel(8, 0), Some([255, 0, 0, 255]));
        let mut reds = Vec::new();
        for y in 0..16 {
            for x in 0..16 {
                if arc.pixel(x, y) == Some([255, 0, 0, 255]) {
                    reds.push((x, y));
                }
            }
        }
        assert!(
            reds.iter().any(|&(x, y)| x <= 6 && y <= 6),
            "arc should paint the short quarter, reds={reds:?}"
        );
    }

    #[test]
    fn decode_svg_linear_gradient_use_and_text() {
        let grad = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><linearGradient id='g' x1='0' y1='0' x2='8' y2='0'>\
              <stop offset='0' stop-color='#ff0000'/>\
              <stop offset='1' stop-color='#0000ff'/>\
              </linearGradient></defs>\
              <rect x='0' y='0' width='8' height='8' fill='url(#g)'/></svg>",
        )
        .expect("svg linearGradient");
        let left = grad.pixel(0, 0).unwrap();
        let right = grad.pixel(7, 0).unwrap();
        assert!(
            left[0] > 200 && left[2] < 60,
            "left should be red: {left:?}"
        );
        assert!(
            right[2] > 200 && right[0] < 60,
            "right should be blue: {right:?}"
        );
        let reused = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <rect id='r' x='0' y='0' width='4' height='8' fill='#00ff00'/>\
              <use href='#r' x='4' y='0'/></svg>",
        )
        .expect("svg use");
        assert_eq!(reused.pixel(1, 1), Some([0, 255, 0, 255]));
        assert_eq!(reused.pixel(6, 1), Some([0, 255, 0, 255]));
        let text = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>\
              <text x='1' y='8' fill='#ff0000'>I</text></svg>",
        )
        .expect("svg text");
        assert_eq!(
            text.pixel(3, 4),
            Some([255, 0, 0, 255]),
            "{:?}",
            text.pixel(3, 4)
        );
    }

    #[test]
    fn decode_svg_radial_gradient_is_white_at_center() {
        let grad = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><radialGradient id='g' cx='4' cy='4' r='4'>\
              <stop offset='0' stop-color='#ffffff'/>\
              <stop offset='1' stop-color='#0000ff'/>\
              </radialGradient></defs>\
              <rect x='0' y='0' width='8' height='8' fill='url(#g)'/></svg>",
        )
        .expect("svg radialGradient");
        let center = grad.pixel(4, 4).unwrap();
        let corner = grad.pixel(0, 0).unwrap();
        assert!(
            center[0] > 200 && center[1] > 200,
            "center should be white: {center:?}"
        );
        assert!(
            corner[2] > 200 && corner[0] < 60,
            "corner should be blue: {corner:?}"
        );
    }

    #[test]
    fn decode_svg_closed_path_fills_interior() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <path d='M1 1 H6 V6 H1 Z' fill='#ff0000'/></svg>",
        )
        .expect("svg path fill");
        assert_eq!(
            img.pixel(3, 3),
            Some([255, 0, 0, 255]),
            "{:?}",
            img.pixel(3, 3)
        );
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]), "{:?}", img.pixel(0, 0));
    }

    #[test]
    fn decode_svg_circle_and_ellipse_sample_gradients() {
        let circle = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><linearGradient id='g' x1='0' y1='0' x2='8' y2='0'>\
              <stop offset='0' stop-color='#ff0000'/>\
              <stop offset='1' stop-color='#0000ff'/>\
              </linearGradient></defs>\
              <circle cx='4' cy='4' r='3' fill='url(#g)'/></svg>",
        )
        .expect("svg circle gradient");
        let left = circle.pixel(2, 4).unwrap();
        let right = circle.pixel(6, 4).unwrap();
        assert!(
            left[0] > right[0] && right[2] > left[2],
            "circle should sample the gradient: left={left:?} right={right:?}"
        );
        let ellipse = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><linearGradient id='g' x1='0' y1='0' x2='8' y2='0'>\
              <stop offset='0' stop-color='#ff0000'/>\
              <stop offset='1' stop-color='#0000ff'/>\
              </linearGradient></defs>\
              <ellipse cx='4' cy='4' rx='3' ry='2' fill='url(#g)'/></svg>",
        )
        .expect("svg ellipse gradient");
        let el = ellipse.pixel(2, 4).unwrap();
        let er = ellipse.pixel(6, 4).unwrap();
        assert!(
            el[0] > er[0] && er[2] > el[2],
            "ellipse should sample the gradient: left={el:?} right={er:?}"
        );
    }

    #[test]
    fn decode_svg_text_paints_vector_letters() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>\
              <text x='1' y='8' fill='#ff0000'>V</text></svg>",
        )
        .expect("svg text V");
        assert_eq!(
            img.pixel(1, 1),
            Some([255, 0, 0, 255]),
            "{:?}",
            img.pixel(1, 1)
        );
    }

    #[test]
    fn decode_svg_path_and_polygon_sample_gradients() {
        let path = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><linearGradient id='g' x1='0' y1='0' x2='8' y2='0'>\
              <stop offset='0' stop-color='#ff0000'/>\
              <stop offset='1' stop-color='#0000ff'/>\
              </linearGradient></defs>\
              <path d='M0 0 H8 V8 H0 Z' fill='url(#g)'/></svg>",
        )
        .expect("svg path gradient");
        let left = path.pixel(1, 4).unwrap();
        let right = path.pixel(6, 4).unwrap();
        assert!(
            left[0] > right[0] && right[2] > left[2],
            "path should sample the gradient: left={left:?} right={right:?}"
        );
        let polygon = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><linearGradient id='g' x1='0' y1='0' x2='8' y2='0'>\
              <stop offset='0' stop-color='#ff0000'/>\
              <stop offset='1' stop-color='#0000ff'/>\
              </linearGradient></defs>\
              <polygon points='0,0 8,0 8,8 0,8' fill='url(#g)'/></svg>",
        )
        .expect("svg polygon gradient");
        let pl = polygon.pixel(1, 4).unwrap();
        let pr = polygon.pixel(6, 4).unwrap();
        assert!(
            pl[0] > pr[0] && pr[2] > pl[2],
            "polygon should sample the gradient: left={pl:?} right={pr:?}"
        );
    }

    #[test]
    fn decode_svg_stroke_width_and_opacity() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <line x1='0' y1='3' x2='7' y2='3' stroke='#ff0000' stroke-width='3' stroke-opacity='0.5'/></svg>",
        )
        .expect("svg stroke");
        let mid = img.pixel(3, 3).unwrap();
        let halo = img.pixel(3, 4).unwrap();
        let far = img.pixel(3, 1).unwrap();
        assert_eq!(mid, [255, 0, 0, 128], "{mid:?}");
        assert_eq!(halo, [255, 0, 0, 128], "{halo:?}");
        assert_eq!(far, [0, 0, 0, 0], "{far:?}");
    }

    #[test]
    fn decode_svg_fill_opacity_tints_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <rect x='0' y='0' width='8' height='8' fill='#00ff00' fill-opacity='0.5'/></svg>",
        )
        .expect("svg fill opacity");
        assert_eq!(img.pixel(2, 2), Some([0, 255, 0, 128]));
    }
}
