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
    let clips = parse_svg_clips(full);
    let patterns = parse_svg_patterns(full);
    let filters = parse_svg_filters(full);
    let markers = parse_svg_markers(full);
    let by_id = parse_svg_ids(full);
    let mut rest = full;
    while let Some(i) = rest.find("<rect") {
        let abs = full.len() - rest.len() + i;
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        if !svg_in_defs(full, abs) && !svg_hidden(tag) {
            let g = with_filter_offset(svg_group_offset(full, abs), tag, &filters);
            paint_svg_rect(&mut img, tag, g, &grads, &clips, &patterns);
            apply_svg_filter(&mut img, tag, g, &filters);
        }
        rest = &rest[i + tag_end + 1..];
    }
    rest = text.as_ref();
    while let Some(i) = rest.find("<circle") {
        let abs = full.len() - rest.len() + i;
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        if !svg_in_defs(full, abs) && !svg_hidden(tag) {
            let g = with_filter_offset(svg_group_offset(full, abs), tag, &filters);
            paint_svg_circle(&mut img, tag, g, &grads, &clips, &patterns);
            apply_svg_filter(&mut img, tag, g, &filters);
        }
        rest = &rest[i + tag_end + 1..];
    }
    rest = text.as_ref();
    while let Some(i) = rest.find("<ellipse") {
        let abs = full.len() - rest.len() + i;
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        if !svg_in_defs(full, abs) && !svg_hidden(tag) {
            let g = with_filter_offset(svg_group_offset(full, abs), tag, &filters);
            paint_svg_ellipse(&mut img, tag, g, &grads, &clips, &patterns);
            apply_svg_filter(&mut img, tag, g, &filters);
        }
        rest = &rest[i + tag_end + 1..];
    }
    rest = text.as_ref();
    while let Some(i) = find_svg_tag(rest, "line") {
        let abs = full.len() - rest.len() + i;
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        let world = svg_group_offset(full, abs).then_tag(tag);
        let (x1, y1) = world.map(
            svg_attr(tag, "x1").unwrap_or(0.0),
            svg_attr(tag, "y1").unwrap_or(0.0),
        );
        let (x2, y2) = world.map(
            svg_attr(tag, "x2").unwrap_or(0.0),
            svg_attr(tag, "y2").unwrap_or(0.0),
        );
        if !svg_hidden(tag) {
            let (color, width) = svg_stroke(tag);
            let color = with_opacity(color, world.opacity);
            let width = width * svg_stroke_scale(tag, world.sx, world.sy);
            let dashes = svg_dash(tag);
            let cap = svg_linecap(tag);
            stroke_line(
                &mut img,
                x1,
                y1,
                x2,
                y2,
                color,
                width,
                &dashes,
                cap,
                svg_dashoffset(tag),
            );
            paint_svg_markers(&mut img, tag, x1, y1, x2, y2, &markers, &grads, &clips);
        }
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
        let abs = full.len() - rest.len() + i;
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        let world = svg_group_offset(full, abs).then_tag(tag);
        let closed = tag.starts_with("<polygon");
        let (color, width) = svg_stroke(tag);
        let width = width * svg_stroke_scale(tag, world.sx, world.sy);
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
            .filter_map(|c| (c.len() == 2).then_some(world.map(c[0], c[1])))
            .collect();
        if closed && coords.len() >= 2 {
            let first = coords[0];
            coords.push(first);
        }
        let fill = svg_fill(tag);
        if closed && !fill.eq_ignore_ascii_case("none") && coords.len() >= 3 {
            fill_polygon_with(&mut img, &coords, |x, y| {
                with_opacity(
                    paint_fill_color(tag, fill, &grads, &patterns, x as f32 + 0.5, y as f32 + 0.5),
                    world.opacity,
                )
            });
        }
        let color = with_opacity(color, world.opacity);
        let dashes = svg_dash(tag);
        let cap = svg_linecap(tag);
        let join = svg_linejoin(tag);
        let miter = svg_miterlimit(tag);
        for w in coords.windows(2) {
            stroke_line(
                &mut img,
                w[0].0,
                w[0].1,
                w[1].0,
                w[1].1,
                color,
                width,
                &dashes,
                cap,
                svg_dashoffset(tag),
            );
        }
        stroke_joins(&mut img, &coords, color, width, join, miter);
        if !coords.is_empty() {
            paint_one_marker(
                &mut img,
                tag,
                "marker-start",
                coords[0].0,
                coords[0].1,
                &markers,
                &grads,
                &clips,
            );
            let last = coords[coords.len() - 1];
            paint_one_marker(
                &mut img,
                tag,
                "marker-end",
                last.0,
                last.1,
                &markers,
                &grads,
                &clips,
            );
            if coords.len() >= 3 {
                for p in &coords[1..coords.len() - 1] {
                    paint_one_marker(
                        &mut img,
                        tag,
                        "marker-mid",
                        p.0,
                        p.1,
                        &markers,
                        &grads,
                        &clips,
                    );
                }
            }
        }
        rest = &rest[i + tag_end + 1..];
    }
    rest = text.as_ref();
    while let Some(i) = rest.find("<path") {
        let abs = full.len() - rest.len() + i;
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        let world = svg_group_offset(full, abs).then_tag(tag);
        let (color, width) = svg_stroke(tag);
        let width = width * svg_stroke_scale(tag, world.sx, world.sy);
        if let Some(d) = svg_attr_str(tag, "d") {
            let contours: Vec<Vec<(f32, f32)>> = svg_path_subpaths(d)
                .into_iter()
                .map(|sp| sp.into_iter().map(|(x, y)| world.map(x, y)).collect())
                .collect();
            let closed = d.bytes().any(|b| b == b'Z' || b == b'z');
            let fill = svg_fill(tag);
            if closed && !fill.eq_ignore_ascii_case("none") {
                let mut filled = contours.clone();
                for c in &mut filled {
                    if c.len() >= 2 && c.first() != c.last() {
                        let first = c[0];
                        c.push(first);
                    }
                }
                let evenodd = svg_attr_str(tag, "fill-rule")
                    .is_some_and(|s| s.eq_ignore_ascii_case("evenodd"));
                if evenodd {
                    fill_contours_with(&mut img, &filled, |x, y| {
                        with_opacity(
                            paint_fill_color(
                                tag,
                                fill,
                                &grads,
                                &patterns,
                                x as f32 + 0.5,
                                y as f32 + 0.5,
                            ),
                            world.opacity,
                        )
                    });
                } else {
                    for c in &filled {
                        fill_polygon_with(&mut img, c, |x, y| {
                            with_opacity(
                                paint_fill_color(
                                    tag,
                                    fill,
                                    &grads,
                                    &patterns,
                                    x as f32 + 0.5,
                                    y as f32 + 0.5,
                                ),
                                world.opacity,
                            )
                        });
                    }
                }
            }
            if svg_attr_str(tag, "stroke").is_some() || !closed {
                let color = with_opacity(color, world.opacity);
                let dashes = svg_dash(tag);
                let cap = svg_linecap(tag);
                let join = svg_linejoin(tag);
                let miter = svg_miterlimit(tag);
                for c in &contours {
                    for w in c.windows(2) {
                        stroke_line(
                            &mut img,
                            w[0].0,
                            w[0].1,
                            w[1].0,
                            w[1].1,
                            color,
                            width,
                            &dashes,
                            cap,
                            svg_dashoffset(tag),
                        );
                    }
                    stroke_joins(&mut img, c, color, width, join, miter);
                }
            }
        }
        rest = &rest[i + tag_end + 1..];
    }
    rest = full;
    while let Some(i) = rest.find("<use") {
        let abs = full.len() - rest.len() + i;
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        let href = svg_attr_str(tag, "href")
            .or_else(|| svg_attr_str(tag, "xlink:href"))
            .unwrap_or("");
        let id = href.strip_prefix('#').unwrap_or(href);
        if let Some(src) = by_id.get(id) {
            let g = svg_group_offset(full, abs);
            let ux = svg_attr(tag, "x").unwrap_or(0.0);
            let uy = svg_attr(tag, "y").unwrap_or(0.0);
            let xf = SvgXform {
                ox: g.ox + ux * g.sx,
                oy: g.oy + uy * g.sy,
                sx: g.sx,
                sy: g.sy,
                opacity: g.opacity,
                clip: g.clip,
            }
            .then_tag(tag);
            if src.starts_with("<rect") {
                paint_svg_rect(&mut img, src, xf, &grads, &clips, &patterns);
            } else if src.starts_with("<circle") {
                paint_svg_circle(&mut img, src, xf, &grads, &clips, &patterns);
            } else if src.starts_with("<ellipse") {
                paint_svg_ellipse(&mut img, src, xf, &grads, &clips, &patterns);
            }
        }
        rest = &rest[i + tag_end + 1..];
    }
    rest = full;
    while let Some(i) = find_svg_tag(rest, "image") {
        let abs = full.len() - rest.len() + i;
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        let href = svg_attr_str(tag, "href")
            .or_else(|| svg_attr_str(tag, "xlink:href"))
            .unwrap_or("");
        let id = href.strip_prefix('#').unwrap_or(href);
        if let Some(src) = by_id.get(id) {
            let g = svg_group_offset(full, abs);
            let ux = svg_attr(tag, "x").unwrap_or(0.0);
            let uy = svg_attr(tag, "y").unwrap_or(0.0);
            let xf = SvgXform {
                ox: g.ox + ux * g.sx,
                oy: g.oy + uy * g.sy,
                sx: g.sx,
                sy: g.sy,
                opacity: g.opacity,
                clip: g.clip,
            }
            .then_tag(tag);
            if src.starts_with("<rect") {
                paint_svg_rect(&mut img, src, xf, &grads, &clips, &patterns);
            } else if src.starts_with("<circle") {
                paint_svg_circle(&mut img, src, xf, &grads, &clips, &patterns);
            } else if src.starts_with("<ellipse") {
                paint_svg_ellipse(&mut img, src, xf, &grads, &clips, &patterns);
            }
        }
        rest = &rest[i + tag_end + 1..];
    }
    rest = full;
    while let Some(i) = find_svg_tag(rest, "text") {
        let abs = full.len() - rest.len() + i;
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        let after = &rest[i + tag_end + 1..];
        let raw = after.split("</text>").next().unwrap_or("");
        let content = svg_text_inner(raw);
        let world = svg_group_offset(full, abs).then_tag(tag);
        let fill = svg_tspan_attr(raw, "fill").unwrap_or_else(|| svg_fill(tag).to_string());
        let color = with_opacity(parse_svg_color(&fill), world.opacity);
        let (mut x, mut y) = if let Some((px, py)) = svg_text_path_start(raw, &by_id) {
            world.map(px, py)
        } else {
            world.map(
                svg_attr(tag, "x").unwrap_or(0.0) + svg_tspan_dx(raw),
                svg_attr(tag, "y").unwrap_or(0.0),
            )
        };
        let spacing = svg_attr(tag, "letter-spacing").unwrap_or(0.0);
        let word_sp = svg_attr(tag, "word-spacing").unwrap_or(0.0);
        let scale = (svg_attr(tag, "font-size").unwrap_or(7.0) / 7.0).max(0.5);
        if svg_attr_str(tag, "dominant-baseline")
            .unwrap_or("")
            .eq_ignore_ascii_case("hanging")
        {
            y += 7.0 * scale;
        }
        let vertical = svg_attr_str(tag, "writing-mode")
            .unwrap_or("")
            .to_ascii_lowercase()
            .starts_with("vertical");
        let mut text_w = 0.0_f32;
        let chars: Vec<char> = content.chars().collect();
        for (i, ch) in chars.iter().enumerate() {
            text_w += if *ch == ' ' {
                4.0 * scale + word_sp
            } else {
                6.0 * scale
            };
            if i + 1 < chars.len() {
                text_w += spacing;
            }
        }
        match svg_attr_str(tag, "text-anchor").unwrap_or("start") {
            "middle" => x -= text_w * 0.5,
            "end" => x -= text_w,
            _ => {}
        }
        let path_pts = svg_text_path_points(raw, &by_id).map(|pts| {
            pts.into_iter()
                .map(|(px, py)| world.map(px, py))
                .collect::<Vec<_>>()
        });
        paint_svg_text(
            &mut img,
            &content,
            x,
            y,
            color,
            spacing,
            word_sp,
            scale,
            vertical,
            path_pts.as_deref(),
        );
        let deco = svg_attr_str(tag, "text-decoration")
            .unwrap_or("")
            .to_ascii_lowercase();
        if deco.contains("underline") {
            let x0 = x.round() as i32;
            let y0 = y.round() as i32;
            let x1 = x0 + text_w.round() as i32;
            for xx in x0..x1 {
                plot_px(&mut img, xx, y0, color);
            }
        }
        if deco.contains("line-through") {
            let x0 = x.round() as i32;
            let y0 = y.round() as i32 - 3;
            let x1 = x0 + text_w.round() as i32;
            for xx in x0..x1 {
                plot_px(&mut img, xx, y0, color);
            }
        }
        if deco.contains("overline") {
            let x0 = x.round() as i32;
            let y0 = y.round() as i32 - (7.0 * scale).round() as i32;
            let x1 = x0 + text_w.round() as i32;
            for xx in x0..x1 {
                plot_px(&mut img, xx, y0, color);
            }
        }
        rest = after;
    }
    rest = full;
    while let Some(i) = find_svg_tag(rest, "foreignObject") {
        let abs = full.len() - rest.len() + i;
        let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
        let tag = &rest[i..i + tag_end];
        if !svg_in_defs(full, abs)
            && !svg_hidden(tag)
            && svg_attr_str(tag, "fill").is_some()
        {
            let g = with_filter_offset(svg_group_offset(full, abs), tag, &filters);
            paint_svg_rect(&mut img, tag, g, &grads, &clips, &patterns);
            apply_svg_filter(&mut img, tag, g, &filters);
        }
        rest = &rest[i + tag_end + 1..];
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

#[derive(Clone, Copy)]
struct SvgXform {
    ox: f32,
    oy: f32,
    sx: f32,
    sy: f32,
    opacity: f32,
    clip: Option<(f32, f32, f32, f32)>,
}

impl SvgXform {
    fn identity() -> Self {
        Self {
            ox: 0.0,
            oy: 0.0,
            sx: 1.0,
            sy: 1.0,
            opacity: 1.0,
            clip: None,
        }
    }

    fn map(self, x: f32, y: f32) -> (f32, f32) {
        (x * self.sx + self.ox, y * self.sy + self.oy)
    }

    fn map_pt(self, p: (f32, f32)) -> (f32, f32) {
        self.map(p.0, p.1)
    }

    fn allows(self, x: f32, y: f32) -> bool {
        match self.clip {
            Some((x0, y0, x1, y1)) => x >= x0 && x < x1 && y >= y0 && y < y1,
            None => true,
        }
    }

    fn then_tag(self, tag: &str) -> Self {
        let (tx, ty) = svg_translate(tag);
        let (sx, sy) = svg_scale(tag);
        Self {
            ox: self.ox + tx * self.sx,
            oy: self.oy + ty * self.sy,
            sx: self.sx * sx,
            sy: self.sy * sy,
            opacity: self.opacity,
            clip: self.clip,
        }
    }

    fn then_group(self, tag: &str) -> Self {
        let mut next = self.then_tag(tag);
        next.opacity *= svg_attr(tag, "opacity").unwrap_or(1.0).clamp(0.0, 1.0);
        next.clip = overflow_clip(self, tag);
        next
    }
}

fn overflow_hidden(tag: &str) -> bool {
    match svg_attr_str(tag, "overflow") {
        Some(s) => !s.eq_ignore_ascii_case("visible"),
        None => tag.starts_with("<svg"),
    }
}

fn overflow_clip(parent: SvgXform, tag: &str) -> Option<(f32, f32, f32, f32)> {
    if !overflow_hidden(tag) {
        return parent.clip;
    }
    let w = svg_attr(tag, "width")?;
    let h = svg_attr(tag, "height")?;
    let x = svg_attr(tag, "x").unwrap_or(0.0);
    let y = svg_attr(tag, "y").unwrap_or(0.0);
    let (ax, ay) = parent.map(x, y);
    let (bx, by) = parent.map(x + w, y + h);
    let next = (ax.min(bx), ay.min(by), ax.max(bx), ay.max(by));
    Some(match parent.clip {
        Some((x0, y0, x1, y1)) => (
            next.0.max(x0),
            next.1.max(y0),
            next.2.min(x1),
            next.3.min(y1),
        ),
        None => next,
    })
}

fn svg_group_offset(full: &str, pos: usize) -> SvgXform {
    let head = &full[..pos.min(full.len())];
    let mut events: Vec<(usize, bool, String)> = Vec::new();
    for (name, close) in [("g", "</g"), ("svg", "</svg")] {
        let mut rest = head;
        let mut base = 0usize;
        while let Some(i) = find_svg_tag(rest, name) {
            let abs = base + i;
            let tag_end = rest[i..].find('>').unwrap_or(rest.len() - i);
            events.push((abs, true, rest[i..i + tag_end].to_string()));
            let skip = i + tag_end + 1;
            rest = &rest[skip..];
            base += skip;
        }
        rest = head;
        base = 0;
        while let Some(i) = rest.find(close) {
            events.push((base + i, false, String::new()));
            rest = &rest[i + close.len()..];
            base += i + close.len();
        }
    }
    events.sort_by_key(|e| e.0);
    let mut stack = vec![SvgXform::identity()];
    for (_, open, tag) in events {
        if open {
            let parent = *stack.last().unwrap_or(&SvgXform::identity());
            stack.push(parent.then_group(&tag));
        } else if stack.len() > 1 {
            stack.pop();
        }
    }
    *stack.last().unwrap_or(&SvgXform::identity())
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

fn svg_hidden(tag: &str) -> bool {
    svg_attr_str(tag, "display").is_some_and(|s| s.eq_ignore_ascii_case("none"))
        || svg_attr_str(tag, "visibility")
            .is_some_and(|s| s.eq_ignore_ascii_case("hidden") || s.eq_ignore_ascii_case("collapse"))
}

fn svg_stroke_first(tag: &str) -> bool {
    svg_attr_str(tag, "paint-order")
        .unwrap_or("")
        .split_whitespace()
        .next()
        .is_some_and(|s| s.eq_ignore_ascii_case("stroke"))
}

struct SvgMarker {
    ref_x: f32,
    ref_y: f32,
    child: String,
}

struct SvgPattern {
    w: f32,
    h: f32,
    x: f32,
    y: f32,
    cw: f32,
    ch: f32,
    color: [u8; 4],
}

fn parse_svg_patterns(text: &str) -> HashMap<String, SvgPattern> {
    let mut out = HashMap::new();
    let mut rest = text;
    while let Some(i) = rest.find("<pattern") {
        let after = &rest[i..];
        let end = after
            .find("</pattern>")
            .map(|e| e + 10)
            .unwrap_or_else(|| after.find('>').map(|e| e + 1).unwrap_or(after.len()));
        let block = &after[..end];
        let tag_end = block.find('>').unwrap_or(block.len());
        let tag = &block[..tag_end];
        if let Some(id) = svg_attr_str(tag, "id") {
            if let Some(ri) = block.find("<rect") {
                let re = block[ri..].find('>').unwrap_or(block.len() - ri);
                let rtag = &block[ri..ri + re];
                out.insert(
                    id.to_string(),
                    SvgPattern {
                        w: svg_attr(tag, "width").unwrap_or(4.0).max(1.0),
                        h: svg_attr(tag, "height").unwrap_or(4.0).max(1.0),
                        x: svg_attr(rtag, "x").unwrap_or(0.0),
                        y: svg_attr(rtag, "y").unwrap_or(0.0),
                        cw: svg_attr(rtag, "width").unwrap_or(0.0),
                        ch: svg_attr(rtag, "height").unwrap_or(0.0),
                        color: parse_svg_color(svg_fill(rtag)),
                    },
                );
            }
        }
        rest = &after[end..];
    }
    out
}

enum SvgFilterKind {
    Blur(f32),
    Offset { dx: f32, dy: f32 },
    Flood { color: [u8; 4] },
    Saturate(f32),
    Erode(i32),
    Dilate(i32),
    Blend { color: [u8; 4], mode: SvgBlendMode },
    Arithmetic { k2: f32, k4: f32 },
    Turbulence,
    Out,
    Tile { x: f32, y: f32, w: f32, h: f32 },
    Component { slope: f32 },
    Convolve([f32; 9]),
    Displace { scale: f32 },
}

#[derive(Clone, Copy)]
enum SvgBlendMode {
    Multiply,
    Screen,
}

fn parse_svg_filters(text: &str) -> HashMap<String, SvgFilterKind> {
    let mut out = HashMap::new();
    let mut rest = text;
    while let Some(i) = rest.find("<filter") {
        let after = &rest[i..];
        let end = after
            .find("</filter>")
            .map(|e| e + 9)
            .unwrap_or_else(|| after.find('>').map(|e| e + 1).unwrap_or(after.len()));
        let block = &after[..end];
        let tag_end = block.find('>').unwrap_or(block.len());
        let tag = &block[..tag_end];
        if let Some(id) = svg_attr_str(tag, "id") {
            let flood_color = if let Some(fi) = block.find("<feFlood") {
                let fe = block[fi..].find('>').unwrap_or(block.len() - fi);
                let flood = &block[fi..fi + fe];
                let mut color =
                    parse_svg_color(svg_attr_str(flood, "flood-color").unwrap_or("#000000"));
                let op = svg_attr(flood, "flood-opacity")
                    .unwrap_or(1.0)
                    .clamp(0.0, 1.0);
                color[3] = (f32::from(color[3]) * op).round() as u8;
                Some(color)
            } else {
                None
            };
            if let Some(bi) = block.find("<feBlend") {
                let be = block[bi..].find('>').unwrap_or(block.len() - bi);
                let blend = &block[bi..bi + be];
                let mode = match svg_attr_str(blend, "mode").unwrap_or("multiply") {
                    s if s.eq_ignore_ascii_case("screen") => SvgBlendMode::Screen,
                    _ => SvgBlendMode::Multiply,
                };
                out.insert(
                    id.to_string(),
                    SvgFilterKind::Blend {
                        color: flood_color.unwrap_or([255, 255, 255, 255]),
                        mode,
                    },
                );
            } else if let Some(ci) = block.find("<feComposite") {
                let ce = block[ci..].find('>').unwrap_or(block.len() - ci);
                let comp = &block[ci..ci + ce];
                let op = svg_attr_str(comp, "operator").unwrap_or("over");
                if op.eq_ignore_ascii_case("arithmetic") {
                    out.insert(
                        id.to_string(),
                        SvgFilterKind::Arithmetic {
                            k2: svg_attr(comp, "k2").unwrap_or(1.0),
                            k4: svg_attr(comp, "k4").unwrap_or(0.0),
                        },
                    );
                } else if op.eq_ignore_ascii_case("out") {
                    out.insert(id.to_string(), SvgFilterKind::Out);
                }
            } else if block.contains("<feTile") {
                out.insert(
                    id.to_string(),
                    SvgFilterKind::Tile {
                        x: svg_attr(tag, "x").unwrap_or(0.0),
                        y: svg_attr(tag, "y").unwrap_or(0.0),
                        w: svg_attr(tag, "width").unwrap_or(8.0),
                        h: svg_attr(tag, "height").unwrap_or(8.0),
                    },
                );
            } else if let Some(ci) = block.find("<feComponentTransfer") {
                let rest = &block[ci..];
                let slope = if let Some(fi) = rest.find("<feFuncR") {
                    let fe = rest[fi..].find('>').unwrap_or(rest.len() - fi);
                    svg_attr(&rest[fi..fi + fe], "slope").unwrap_or(1.0)
                } else {
                    1.0
                };
                out.insert(id.to_string(), SvgFilterKind::Component { slope });
            } else if let Some(ci) = block.find("<feConvolveMatrix") {
                let ce = block[ci..].find('>').unwrap_or(block.len() - ci);
                let conv = &block[ci..ci + ce];
                let mut kernel = [0.0_f32, -1.0, 0.0, -1.0, 4.0, -1.0, 0.0, -1.0, 0.0];
                if let Some(raw) = svg_attr_str(conv, "kernelMatrix") {
                    let mut nums = raw
                        .split(|c: char| c == ',' || c.is_whitespace())
                        .filter_map(|s| s.parse().ok());
                    for slot in kernel.iter_mut() {
                        if let Some(n) = nums.next() {
                            *slot = n;
                        }
                    }
                }
                out.insert(id.to_string(), SvgFilterKind::Convolve(kernel));
            } else if let Some(di) = block.find("<feDisplacementMap") {
                let de = block[di..].find('>').unwrap_or(block.len() - di);
                let disp = &block[di..di + de];
                out.insert(
                    id.to_string(),
                    SvgFilterKind::Displace {
                        scale: svg_attr(disp, "scale").unwrap_or(0.0),
                    },
                );
            } else if block.contains("<feTurbulence") {
                out.insert(id.to_string(), SvgFilterKind::Turbulence);
            } else if let Some(color) = flood_color {
                out.insert(id.to_string(), SvgFilterKind::Flood { color });
            } else if let Some(ci) = block.find("<feColorMatrix") {
                let ce = block[ci..].find('>').unwrap_or(block.len() - ci);
                let cm = &block[ci..ci + ce];
                let kind = svg_attr_str(cm, "type").unwrap_or("matrix");
                if kind.eq_ignore_ascii_case("saturate") {
                    let amount = svg_attr_str(cm, "values")
                        .and_then(|s| s.split_whitespace().next()?.parse().ok())
                        .unwrap_or(1.0);
                    out.insert(id.to_string(), SvgFilterKind::Saturate(amount));
                }
            } else if let Some(bi) = block.find("<feGaussianBlur") {
                let be = block[bi..].find('>').unwrap_or(block.len() - bi);
                let blur = &block[bi..bi + be];
                let raw = svg_attr_str(blur, "stdDeviation").unwrap_or("0");
                let radius = raw
                    .split(|c: char| c == ',' || c.is_whitespace())
                    .find(|s| !s.is_empty())
                    .and_then(|s| s.parse().ok())
                    .unwrap_or(0.0);
                if radius > 0.0 {
                    out.insert(id.to_string(), SvgFilterKind::Blur(radius));
                }
            } else if let Some(mi) = block.find("<feMorphology") {
                let me = block[mi..].find('>').unwrap_or(block.len() - mi);
                let morph = &block[mi..mi + me];
                let op = svg_attr_str(morph, "operator").unwrap_or("erode");
                let radius = svg_attr(morph, "radius").unwrap_or(0.0).round().max(0.0) as i32;
                if radius > 0 {
                    if op.eq_ignore_ascii_case("dilate") {
                        out.insert(id.to_string(), SvgFilterKind::Dilate(radius));
                    } else {
                        out.insert(id.to_string(), SvgFilterKind::Erode(radius));
                    }
                }
            } else if let Some(oi) = block.find("<feOffset") {
                let oe = block[oi..].find('>').unwrap_or(block.len() - oi);
                let off = &block[oi..oi + oe];
                out.insert(
                    id.to_string(),
                    SvgFilterKind::Offset {
                        dx: svg_attr(off, "dx").unwrap_or(0.0),
                        dy: svg_attr(off, "dy").unwrap_or(0.0),
                    },
                );
            }
        }
        rest = &after[end..];
    }
    out
}

fn svg_filter_of<'a>(
    tag: &str,
    filters: &'a HashMap<String, SvgFilterKind>,
) -> Option<&'a SvgFilterKind> {
    parse_url_id(svg_attr_str(tag, "filter")?).and_then(|id| filters.get(id))
}

fn with_filter_offset(
    mut g: SvgXform,
    tag: &str,
    filters: &HashMap<String, SvgFilterKind>,
) -> SvgXform {
    if let Some(SvgFilterKind::Offset { dx, dy }) = svg_filter_of(tag, filters) {
        g.ox += *dx * g.sx;
        g.oy += *dy * g.sy;
    }
    g
}

fn svg_shape_bbox(tag: &str, g: SvgXform) -> (f32, f32, f32, f32) {
    let world = g.then_tag(tag);
    if let (Some(w), Some(h)) = (svg_attr(tag, "width"), svg_attr(tag, "height")) {
        let (ax, ay) = world.map(
            svg_attr(tag, "x").unwrap_or(0.0),
            svg_attr(tag, "y").unwrap_or(0.0),
        );
        let (bx, by) = world.map(
            svg_attr(tag, "x").unwrap_or(0.0) + w,
            svg_attr(tag, "y").unwrap_or(0.0) + h,
        );
        (ax.min(bx), ay.min(by), ax.max(bx), ay.max(by))
    } else if let Some(r) = svg_attr(tag, "r") {
        let (cx, cy) = world.map(
            svg_attr(tag, "cx").unwrap_or(0.0),
            svg_attr(tag, "cy").unwrap_or(0.0),
        );
        let rr = r * world.sx.abs().min(world.sy.abs());
        (cx - rr, cy - rr, cx + rr, cy + rr)
    } else {
        let (cx, cy) = world.map(
            svg_attr(tag, "cx").unwrap_or(0.0),
            svg_attr(tag, "cy").unwrap_or(0.0),
        );
        let rx = svg_attr(tag, "rx").unwrap_or(0.0) * world.sx.abs();
        let ry = svg_attr(tag, "ry").unwrap_or(0.0) * world.sy.abs();
        (cx - rx, cy - ry, cx + rx, cy + ry)
    }
}

fn clip_decoded_bbox(
    img: &DecodedImage,
    x0: f32,
    y0: f32,
    x1: f32,
    y1: f32,
    pad: i32,
) -> (i32, i32, i32, i32) {
    let bx0 = (x0.floor() as i32 - pad).max(0);
    let by0 = (y0.floor() as i32 - pad).max(0);
    let bx1 = ((x1.ceil() as i32) + pad).min(img.width as i32);
    let by1 = ((y1.ceil() as i32) + pad).min(img.height as i32);
    (bx0, by0, bx1, by1)
}

fn apply_svg_filter(
    img: &mut DecodedImage,
    tag: &str,
    g: SvgXform,
    filters: &HashMap<String, SvgFilterKind>,
) {
    let Some(kind) = svg_filter_of(tag, filters) else {
        return;
    };
    let (x0, y0, x1, y1) = svg_shape_bbox(tag, g);
    match kind {
        SvgFilterKind::Blur(radius) => {
            let (bx0, by0, bx1, by1) =
                clip_decoded_bbox(img, x0, y0, x1, y1, radius.ceil() as i32 + 1);
            blur_decoded_rect(img, bx0, by0, bx1, by1, *radius);
        }
        SvgFilterKind::Flood { color } => {
            let (bx0, by0, bx1, by1) = clip_decoded_bbox(img, x0, y0, x1, y1, 0);
            fill_decoded_rect(img, bx0, by0, bx1, by1, *color);
        }
        SvgFilterKind::Saturate(amount) => {
            let (bx0, by0, bx1, by1) = clip_decoded_bbox(img, x0, y0, x1, y1, 0);
            saturate_decoded_rect(img, bx0, by0, bx1, by1, *amount);
        }
        SvgFilterKind::Erode(radius) => {
            let (bx0, by0, bx1, by1) = clip_decoded_bbox(img, x0, y0, x1, y1, 0);
            erode_decoded_rect(img, bx0, by0, bx1, by1, *radius);
        }
        SvgFilterKind::Dilate(radius) => {
            let (bx0, by0, bx1, by1) =
                clip_decoded_bbox(img, x0, y0, x1, y1, *radius);
            dilate_decoded_rect(img, bx0, by0, bx1, by1, *radius);
        }
        SvgFilterKind::Blend { color, mode } => {
            let (bx0, by0, bx1, by1) = clip_decoded_bbox(img, x0, y0, x1, y1, 0);
            blend_decoded_rect(img, bx0, by0, bx1, by1, *color, *mode);
        }
        SvgFilterKind::Arithmetic { k2, k4 } => {
            let (bx0, by0, bx1, by1) = clip_decoded_bbox(img, x0, y0, x1, y1, 0);
            arithmetic_decoded_rect(img, bx0, by0, bx1, by1, *k2, *k4);
        }
        SvgFilterKind::Turbulence => {
            let (bx0, by0, bx1, by1) = clip_decoded_bbox(img, x0, y0, x1, y1, 0);
            turbulence_decoded_rect(img, bx0, by0, bx1, by1);
        }
        SvgFilterKind::Out => {
            let (bx0, by0, bx1, by1) = clip_decoded_bbox(img, x0, y0, x1, y1, 0);
            clear_decoded_rect(img, bx0, by0, bx1, by1);
        }
        SvgFilterKind::Tile { x, y, w, h } => {
            let (sx0, sy0, sx1, sy1) = clip_decoded_bbox(img, x0, y0, x1, y1, 0);
            let (dx0, dy0, dx1, dy1) = clip_decoded_bbox(img, *x, *y, *x + *w, *y + *h, 0);
            tile_decoded_rect(img, sx0, sy0, sx1, sy1, dx0, dy0, dx1, dy1);
        }
        SvgFilterKind::Component { slope } => {
            let (bx0, by0, bx1, by1) = clip_decoded_bbox(img, x0, y0, x1, y1, 0);
            component_decoded_rect(img, bx0, by0, bx1, by1, *slope);
        }
        SvgFilterKind::Convolve(kernel) => {
            let (bx0, by0, bx1, by1) = clip_decoded_bbox(img, x0, y0, x1, y1, 1);
            convolve_decoded_rect(img, bx0, by0, bx1, by1, kernel);
        }
        SvgFilterKind::Displace { scale } => {
            let (bx0, by0, bx1, by1) = clip_decoded_bbox(img, x0, y0, x1, y1, 0);
            displace_decoded_rect(img, bx0, by0, bx1, by1, *scale);
        }
        SvgFilterKind::Offset { .. } => {}
    }
}

fn fill_decoded_rect(img: &mut DecodedImage, x0: i32, y0: i32, x1: i32, y1: i32, color: [u8; 4]) {
    for y in y0..y1 {
        for x in x0..x1 {
            plot_px(img, x, y, color);
        }
    }
}

fn clear_decoded_rect(img: &mut DecodedImage, x0: i32, y0: i32, x1: i32, y1: i32) {
    for y in y0..y1 {
        for x in x0..x1 {
            plot_px(img, x, y, [0, 0, 0, 0]);
        }
    }
}

fn component_decoded_rect(img: &mut DecodedImage, x0: i32, y0: i32, x1: i32, y1: i32, slope: f32) {
    for y in y0..y1 {
        for x in x0..x1 {
            if x < 0 || y < 0 {
                continue;
            }
            let i = ((y as u32 * img.width + x as u32) * 4) as usize;
            if i + 3 >= img.rgba.len() || img.rgba[i + 3] == 0 {
                continue;
            }
            let v = f32::from(img.rgba[i]) / 255.0 * slope;
            img.rgba[i] = (v.clamp(0.0, 1.0) * 255.0).round() as u8;
        }
    }
}

fn convolve_decoded_rect(
    img: &mut DecodedImage,
    x0: i32,
    y0: i32,
    x1: i32,
    y1: i32,
    kernel: &[f32; 9],
) {
    let mut src = vec![[0u8; 4]; ((x1 - x0).max(0) * (y1 - y0).max(0)) as usize];
    let tw = (x1 - x0).max(0);
    for y in y0..y1 {
        for x in x0..x1 {
            let i = ((y - y0) * tw + (x - x0)) as usize;
            if x >= 0 && y >= 0 {
                if let Some(px) = img.pixel(x as u32, y as u32) {
                    src[i] = px;
                }
            }
        }
    }
    let sample = |x: i32, y: i32| -> [u8; 4] {
        if x < x0 || y < y0 || x >= x1 || y >= y1 {
            return [0, 0, 0, 0];
        }
        src[((y - y0) * tw + (x - x0)) as usize]
    };
    for y in y0..y1 {
        for x in x0..x1 {
            let mut acc = [0.0_f32; 4];
            for ky in -1..=1 {
                for kx in -1..=1 {
                    let k = kernel[((ky + 1) * 3 + (kx + 1)) as usize];
                    let p = sample(x + kx, y + ky);
                    for c in 0..4 {
                        acc[c] += f32::from(p[c]) * k;
                    }
                }
            }
            let out = [
                acc[0].round().clamp(0.0, 255.0) as u8,
                acc[1].round().clamp(0.0, 255.0) as u8,
                acc[2].round().clamp(0.0, 255.0) as u8,
                acc[3].round().clamp(0.0, 255.0) as u8,
            ];
            plot_px(img, x, y, out);
        }
    }
}

fn displace_decoded_rect(img: &mut DecodedImage, x0: i32, y0: i32, x1: i32, y1: i32, scale: f32) {
    let dx = scale.round() as i32;
    if dx == 0 {
        return;
    }
    let tw = (x1 - x0).max(0);
    let th = (y1 - y0).max(0);
    let mut src = vec![[0u8; 4]; (tw * th) as usize];
    for y in y0..y1 {
        for x in x0..x1 {
            let i = ((y - y0) * tw + (x - x0)) as usize;
            if x >= 0 && y >= 0 {
                if let Some(px) = img.pixel(x as u32, y as u32) {
                    src[i] = px;
                }
            }
            plot_px(img, x, y, [0, 0, 0, 0]);
        }
    }
    for y in y0..y1 {
        for x in x0..x1 {
            let i = ((y - y0) * tw + (x - x0)) as usize;
            plot_px(img, x + dx, y, src[i]);
        }
    }
}

fn tile_decoded_rect(
    img: &mut DecodedImage,
    sx0: i32,
    sy0: i32,
    sx1: i32,
    sy1: i32,
    dx0: i32,
    dy0: i32,
    dx1: i32,
    dy1: i32,
) {
    let sw = sx1 - sx0;
    let sh = sy1 - sy0;
    if sw <= 0 || sh <= 0 {
        return;
    }
    let mut tile = vec![[0u8; 4]; (sw * sh) as usize];
    for y in sy0..sy1 {
        for x in sx0..sx1 {
            let i = ((y - sy0) * sw + (x - sx0)) as usize;
            if let Some(px) = img.pixel(x as u32, y as u32) {
                tile[i] = px;
            }
        }
    }
    for y in dy0..dy1 {
        for x in dx0..dx1 {
            let tx = (x - sx0).rem_euclid(sw);
            let ty = (y - sy0).rem_euclid(sh);
            let i = (ty * sw + tx) as usize;
            plot_px(img, x, y, tile[i]);
        }
    }
}

fn saturate_decoded_rect(img: &mut DecodedImage, x0: i32, y0: i32, x1: i32, y1: i32, amount: f32) {
    let amount = amount.clamp(0.0, 1.0);
    for y in y0..y1 {
        for x in x0..x1 {
            if x < 0 || y < 0 {
                continue;
            }
            let i = ((y as u32 * img.width + x as u32) * 4) as usize;
            if i + 3 >= img.rgba.len() {
                continue;
            }
            let r = f32::from(img.rgba[i]);
            let g = f32::from(img.rgba[i + 1]);
            let b = f32::from(img.rgba[i + 2]);
            let y601 = 0.299 * r + 0.587 * g + 0.114 * b;
            img.rgba[i] = (y601 + (r - y601) * amount).round() as u8;
            img.rgba[i + 1] = (y601 + (g - y601) * amount).round() as u8;
            img.rgba[i + 2] = (y601 + (b - y601) * amount).round() as u8;
        }
    }
}

fn erode_decoded_rect(img: &mut DecodedImage, x0: i32, y0: i32, x1: i32, y1: i32, radius: i32) {
    if radius <= 0 || x1 <= x0 || y1 <= y0 {
        return;
    }
    let src = img.rgba.clone();
    let width = img.width;
    let opaque = |x: i32, y: i32| -> bool {
        if x < x0 || y < y0 || x >= x1 || y >= y1 || x < 0 || y < 0 {
            return false;
        }
        let i = ((y as u32 * width + x as u32) * 4) as usize;
        i + 3 < src.len() && src[i + 3] > 0
    };
    for y in y0..y1 {
        for x in x0..x1 {
            let mut keep = true;
            for yy in (y - radius)..=(y + radius) {
                for xx in (x - radius)..=(x + radius) {
                    if !opaque(xx, yy) {
                        keep = false;
                    }
                }
            }
            if !keep {
                plot_px(img, x, y, [0, 0, 0, 0]);
            }
        }
    }
}

fn dilate_decoded_rect(img: &mut DecodedImage, x0: i32, y0: i32, x1: i32, y1: i32, radius: i32) {
    if radius <= 0 || x1 <= x0 || y1 <= y0 {
        return;
    }
    let src = img.rgba.clone();
    let width = img.width;
    let sample = |x: i32, y: i32| -> [u8; 4] {
        if x < 0 || y < 0 {
            return [0, 0, 0, 0];
        }
        let i = ((y as u32 * width + x as u32) * 4) as usize;
        if i + 3 >= src.len() {
            return [0, 0, 0, 0];
        }
        [src[i], src[i + 1], src[i + 2], src[i + 3]]
    };
    for y in y0..y1 {
        for x in x0..x1 {
            let mut best = [0u8; 4];
            for yy in (y - radius)..=(y + radius) {
                for xx in (x - radius)..=(x + radius) {
                    let px = sample(xx, yy);
                    if px[3] > best[3] {
                        best = px;
                    }
                }
            }
            if best[3] > 0 {
                plot_px(img, x, y, best);
            }
        }
    }
}

fn blend_decoded_rect(
    img: &mut DecodedImage,
    x0: i32,
    y0: i32,
    x1: i32,
    y1: i32,
    color: [u8; 4],
    mode: SvgBlendMode,
) {
    for y in y0..y1 {
        for x in x0..x1 {
            if x < 0 || y < 0 {
                continue;
            }
            let i = ((y as u32 * img.width + x as u32) * 4) as usize;
            if i + 3 >= img.rgba.len() || img.rgba[i + 3] == 0 {
                continue;
            }
            let mut out = [img.rgba[i], img.rgba[i + 1], img.rgba[i + 2], img.rgba[i + 3]];
            for c in 0..3 {
                let s = u16::from(out[c]);
                let b = u16::from(color[c]);
                out[c] = match mode {
                    SvgBlendMode::Multiply => ((s * b) / 255) as u8,
                    SvgBlendMode::Screen => (255 - ((255 - s) * (255 - b)) / 255) as u8,
                };
            }
            img.rgba[i..i + 4].copy_from_slice(&out);
        }
    }
}

fn arithmetic_decoded_rect(
    img: &mut DecodedImage,
    x0: i32,
    y0: i32,
    x1: i32,
    y1: i32,
    k2: f32,
    k4: f32,
) {
    for y in y0..y1 {
        for x in x0..x1 {
            if x < 0 || y < 0 {
                continue;
            }
            let i = ((y as u32 * img.width + x as u32) * 4) as usize;
            if i + 3 >= img.rgba.len() || img.rgba[i + 3] == 0 {
                continue;
            }
            for c in 0..3 {
                let v = f32::from(img.rgba[i + c]) / 255.0 * k2 + k4;
                img.rgba[i + c] = (v.clamp(0.0, 1.0) * 255.0).round() as u8;
            }
        }
    }
}

fn turbulence_decoded_rect(img: &mut DecodedImage, x0: i32, y0: i32, x1: i32, y1: i32) {
    for y in y0..y1 {
        for x in x0..x1 {
            if x < 0 || y < 0 {
                continue;
            }
            let i = ((y as u32 * img.width + x as u32) * 4) as usize;
            if i + 3 >= img.rgba.len() || img.rgba[i + 3] == 0 {
                continue;
            }
            let n = x.wrapping_mul(374_761_393) ^ y.wrapping_mul(668_265_263);
            let grain = ((n >> 8) & 127) as u8;
            for c in 0..3 {
                img.rgba[i + c] = (u16::from(img.rgba[i + c]) / 2 + u16::from(grain) / 2) as u8;
            }
        }
    }
}

fn blur_decoded_rect(img: &mut DecodedImage, x0: i32, y0: i32, x1: i32, y1: i32, radius: f32) {
    let r = radius.round().max(0.0) as i32;
    if r == 0 || x1 <= x0 || y1 <= y0 {
        return;
    }
    let src = img.rgba.clone();
    for y in y0..y1 {
        for x in x0..x1 {
            let mut acc = [0u32; 4];
            let mut n = 0u32;
            for yy in (y - r).max(y0)..(y + r + 1).min(y1) {
                for xx in (x - r).max(x0)..(x + r + 1).min(x1) {
                    let i = ((yy as u32 * img.width + xx as u32) * 4) as usize;
                    if i + 3 < src.len() {
                        acc[0] += u32::from(src[i]);
                        acc[1] += u32::from(src[i + 1]);
                        acc[2] += u32::from(src[i + 2]);
                        acc[3] += u32::from(src[i + 3]);
                        n += 1;
                    }
                }
            }
            if n == 0 {
                continue;
            }
            let i = ((y as u32 * img.width + x as u32) * 4) as usize;
            if i + 3 < img.rgba.len() {
                img.rgba[i] = (acc[0] / n) as u8;
                img.rgba[i + 1] = (acc[1] / n) as u8;
                img.rgba[i + 2] = (acc[2] / n) as u8;
                img.rgba[i + 3] = (acc[3] / n) as u8;
            }
        }
    }
}

fn sample_pattern(p: &SvgPattern, x: f32, y: f32) -> [u8; 4] {
    let lx = ((x % p.w) + p.w) % p.w;
    let ly = ((y % p.h) + p.h) % p.h;
    if lx >= p.x && lx < p.x + p.cw && ly >= p.y && ly < p.y + p.ch {
        p.color
    } else {
        [0, 0, 0, 0]
    }
}

fn parse_svg_markers(text: &str) -> HashMap<String, SvgMarker> {
    let mut out = HashMap::new();
    let mut rest = text;
    while let Some(i) = rest.find("<marker") {
        let after = &rest[i..];
        let end = after
            .find("</marker>")
            .map(|e| e + 9)
            .unwrap_or_else(|| after.find('>').map(|e| e + 1).unwrap_or(after.len()));
        let block = &after[..end];
        let tag_end = block.find('>').unwrap_or(block.len());
        let tag = &block[..tag_end];
        if let Some(id) = svg_attr_str(tag, "id") {
            let inner = &block[tag_end.min(block.len())..];
            let child = ["<rect", "<circle", "<ellipse", "<path"]
                .iter()
                .filter_map(|p| inner.find(p).map(|at| (at, *p)))
                .min_by_key(|(at, _)| *at)
                .map(|(at, _)| {
                    let ce = inner[at..].find('>').unwrap_or(inner.len() - at);
                    inner[at..at + ce].to_string()
                })
                .unwrap_or_default();
            if !child.is_empty() {
                out.insert(
                    id.to_string(),
                    SvgMarker {
                        ref_x: svg_attr(tag, "refX").unwrap_or(0.0),
                        ref_y: svg_attr(tag, "refY").unwrap_or(0.0),
                        child,
                    },
                );
            }
        }
        rest = &after[end..];
    }
    out
}

fn paint_one_marker(
    img: &mut DecodedImage,
    tag: &str,
    attr: &str,
    x: f32,
    y: f32,
    markers: &HashMap<String, SvgMarker>,
    grads: &HashMap<String, SvgGrad>,
    clips: &HashMap<String, SvgClip>,
) {
    let Some(href) = svg_attr_str(tag, attr) else {
        return;
    };
    let Some(id) = parse_url_id(href) else {
        return;
    };
    let Some(m) = markers.get(id) else {
        return;
    };
    let xf = SvgXform {
        ox: x - m.ref_x,
        oy: y - m.ref_y,
        sx: 1.0,
        sy: 1.0,
        opacity: 1.0,
        clip: None,
    };
    if m.child.starts_with("<rect") {
        paint_svg_rect(img, &m.child, xf, grads, clips, &HashMap::new());
    } else if m.child.starts_with("<circle") {
        paint_svg_circle(img, &m.child, xf, grads, clips, &HashMap::new());
    } else if m.child.starts_with("<ellipse") {
        paint_svg_ellipse(img, &m.child, xf, grads, clips, &HashMap::new());
    }
}

fn paint_svg_markers(
    img: &mut DecodedImage,
    tag: &str,
    x1: f32,
    y1: f32,
    x2: f32,
    y2: f32,
    markers: &HashMap<String, SvgMarker>,
    grads: &HashMap<String, SvgGrad>,
    clips: &HashMap<String, SvgClip>,
) {
    paint_one_marker(img, tag, "marker-start", x1, y1, markers, grads, clips);
    paint_one_marker(img, tag, "marker-end", x2, y2, markers, grads, clips);
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

#[derive(Clone, Copy)]
enum SvgClip {
    Rect { x: f32, y: f32, w: f32, h: f32 },
    Circle { cx: f32, cy: f32, r: f32 },
    Ellipse { cx: f32, cy: f32, rx: f32, ry: f32 },
}

fn parse_clip_or_mask_block(block: &str, id: &str, out: &mut HashMap<String, SvgClip>) {
    if let Some(ri) = block.find("<rect") {
        let re = block[ri..].find('>').unwrap_or(block.len() - ri);
        let rtag = &block[ri..ri + re];
        out.insert(
            id.to_string(),
            SvgClip::Rect {
                x: svg_attr(rtag, "x").unwrap_or(0.0),
                y: svg_attr(rtag, "y").unwrap_or(0.0),
                w: svg_attr(rtag, "width").unwrap_or(0.0),
                h: svg_attr(rtag, "height").unwrap_or(0.0),
            },
        );
    } else if let Some(ci) = block.find("<circle") {
        let ce = block[ci..].find('>').unwrap_or(block.len() - ci);
        let ctag = &block[ci..ci + ce];
        out.insert(
            id.to_string(),
            SvgClip::Circle {
                cx: svg_attr(ctag, "cx").unwrap_or(0.0),
                cy: svg_attr(ctag, "cy").unwrap_or(0.0),
                r: svg_attr(ctag, "r").unwrap_or(0.0),
            },
        );
    } else if let Some(ei) = block.find("<ellipse") {
        let ee = block[ei..].find('>').unwrap_or(block.len() - ei);
        let etag = &block[ei..ei + ee];
        out.insert(
            id.to_string(),
            SvgClip::Ellipse {
                cx: svg_attr(etag, "cx").unwrap_or(0.0),
                cy: svg_attr(etag, "cy").unwrap_or(0.0),
                rx: svg_attr(etag, "rx").unwrap_or(0.0),
                ry: svg_attr(etag, "ry").unwrap_or(0.0),
            },
        );
    }
}

fn parse_svg_clips(text: &str) -> HashMap<String, SvgClip> {
    let mut out = HashMap::new();
    for (open, close) in [("<clipPath", "</clipPath>"), ("<mask", "</mask>")] {
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
                parse_clip_or_mask_block(block, id, &mut out);
            }
            rest = &after[end..];
        }
    }
    out
}

fn pixel_allowed(tag: &str, clips: &HashMap<String, SvgClip>, g: SvgXform, x: f32, y: f32) -> bool {
    g.allows(x, y) && clip_allows(tag, clips, x, y)
}

fn clip_allows(tag: &str, clips: &HashMap<String, SvgClip>, x: f32, y: f32) -> bool {
    let raw = svg_attr_str(tag, "clip-path").or_else(|| svg_attr_str(tag, "mask"));
    let Some(raw) = raw else {
        return true;
    };
    let Some(id) = parse_url_id(raw) else {
        return true;
    };
    match clips.get(id) {
        Some(SvgClip::Rect { x: cx, y: cy, w, h }) => {
            x >= *cx && x < *cx + *w && y >= *cy && y < *cy + *h
        }
        Some(SvgClip::Circle { cx, cy, r }) => {
            let dx = x - *cx;
            let dy = y - *cy;
            dx * dx + dy * dy <= *r * *r
        }
        Some(SvgClip::Ellipse { cx, cy, rx, ry }) => {
            let nx = (x - *cx) / rx.max(0.001);
            let ny = (y - *cy) / ry.max(0.001);
            nx * nx + ny * ny <= 1.0
        }
        None => true,
    }
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
    g: SvgXform,
    grads: &HashMap<String, SvgGrad>,
    clips: &HashMap<String, SvgClip>,
    patterns: &HashMap<String, SvgPattern>,
) {
    let (esx, esy) = svg_scale(tag);
    let (etx, ety) = svg_translate(tag);
    let (ang, rcx, rcy) = svg_rotate(tag);
    let (kx, ky) = svg_skew(tag);
    let lx = svg_attr(tag, "x").unwrap_or(0.0) * esx + etx;
    let ly = svg_attr(tag, "y").unwrap_or(0.0) * esy + ety;
    let lw = (svg_attr(tag, "width").unwrap_or(0.0) * esx).max(0.0);
    let lh = (svg_attr(tag, "height").unwrap_or(0.0) * esy).max(0.0);
    let (x0, y0) = g.map(lx, ly);
    let w = lw * g.sx;
    let h = lh * g.sy;
    let fill = svg_fill(tag);
    if ang.abs() < 0.001 && kx.abs() < 1e-6 && ky.abs() < 1e-6 {
        let x = x0.max(0.0) as u32;
        let y = y0.max(0.0) as u32;
        let ww = w.max(0.0) as u32;
        let hh = h.max(0.0) as u32;
        let stroke_first = svg_stroke_first(tag);
        if stroke_first {
            stroke_svg_rect_edges(img, tag, x0, y0, w, h, g.opacity);
        }
        if !fill.eq_ignore_ascii_case("none") {
            for yy in y..(y + hh).min(img.height) {
                for xx in x..(x + ww).min(img.width) {
                    if !pixel_allowed(tag, clips, g, xx as f32 + 0.5, yy as f32 + 0.5) {
                        continue;
                    }
                    let color = with_opacity(
                        paint_fill_color(
                            tag,
                            fill,
                            grads,
                            patterns,
                            xx as f32 + 0.5,
                            yy as f32 + 0.5,
                        ),
                        g.opacity,
                    );
                    let idx = ((yy * img.width + xx) * 4) as usize;
                    img.rgba[idx..idx + 4].copy_from_slice(&color);
                }
            }
        }
        if !stroke_first {
            stroke_svg_rect_edges(img, tag, x0, y0, w, h, g.opacity);
        }
        return;
    }
    let rad = ang.to_radians();
    let map_local = |x: f32, y: f32| {
        let (sx, sy) = svg_skew_pt(x, y, kx, ky);
        g.map_pt(svg_rotate_pt(sx, sy, rad, rcx, rcy))
    };
    let corners = [
        map_local(lx, ly),
        map_local(lx + lw, ly),
        map_local(lx + lw, ly + lh),
        map_local(lx, ly + lh),
    ];
    let minx = corners
        .iter()
        .map(|p| p.0)
        .fold(f32::MAX, f32::min)
        .floor()
        .max(0.0) as u32;
    let miny = corners
        .iter()
        .map(|p| p.1)
        .fold(f32::MAX, f32::min)
        .floor()
        .max(0.0) as u32;
    let maxx = corners
        .iter()
        .map(|p| p.0)
        .fold(0.0_f32, f32::max)
        .ceil()
        .min(img.width as f32) as u32;
    let maxy = corners
        .iter()
        .map(|p| p.1)
        .fold(0.0_f32, f32::max)
        .ceil()
        .min(img.height as f32) as u32;
    let inv_sx = if g.sx.abs() < 1e-6 { 0.0 } else { 1.0 / g.sx };
    let inv_sy = if g.sy.abs() < 1e-6 { 0.0 } else { 1.0 / g.sy };
    for yy in miny..maxy {
        for xx in minx..maxx {
            let px = (xx as f32 + 0.5 - g.ox) * inv_sx;
            let py = (yy as f32 + 0.5 - g.oy) * inv_sy;
            let (rx, ry) = svg_rotate_pt(px, py, -rad, rcx, rcy);
            let (ux, uy) = svg_unskew_pt(rx, ry, kx, ky);
            if ux >= lx && ux < lx + lw && uy >= ly && uy < ly + lh {
                if !pixel_allowed(tag, clips, g, xx as f32 + 0.5, yy as f32 + 0.5) {
                    continue;
                }
                if !fill.eq_ignore_ascii_case("none") {
                    let color = with_opacity(
                        paint_fill_color(
                            tag,
                            fill,
                            grads,
                            patterns,
                            xx as f32 + 0.5,
                            yy as f32 + 0.5,
                        ),
                        g.opacity,
                    );
                    let idx = ((yy * img.width + xx) * 4) as usize;
                    img.rgba[idx..idx + 4].copy_from_slice(&color);
                }
            }
        }
    }
}

fn stroke_svg_rect_edges(
    img: &mut DecodedImage,
    tag: &str,
    x0: f32,
    y0: f32,
    w: f32,
    h: f32,
    opacity: f32,
) {
    let stroke = svg_attr_str(tag, "stroke").unwrap_or("");
    if stroke.is_empty() || stroke.eq_ignore_ascii_case("none") {
        return;
    }
    let (color, width) = svg_stroke(tag);
    let color = with_opacity(color, opacity);
    let dashes = svg_dash(tag);
    let cap = svg_linecap(tag);
    let x1 = x0 + w;
    let y1 = y0 + h;
    let offset = svg_dashoffset(tag);
    stroke_line(img, x0, y0, x1, y0, color, width, &dashes, cap, offset);
    stroke_line(img, x1, y0, x1, y1, color, width, &dashes, cap, offset);
    stroke_line(img, x1, y1, x0, y1, color, width, &dashes, cap, offset);
    stroke_line(img, x0, y1, x0, y0, color, width, &dashes, cap, offset);
}

fn paint_svg_circle(
    img: &mut DecodedImage,
    tag: &str,
    g: SvgXform,
    grads: &HashMap<String, SvgGrad>,
    clips: &HashMap<String, SvgClip>,
    patterns: &HashMap<String, SvgPattern>,
) {
    let world = g.then_tag(tag);
    let (cx, cy) = world.map(
        svg_attr(tag, "cx").unwrap_or(0.0),
        svg_attr(tag, "cy").unwrap_or(0.0),
    );
    let r = svg_attr(tag, "r").unwrap_or(0.0) * world.sx.abs().min(world.sy.abs());
    let fill = svg_fill(tag);
    let (stroke_color, stroke_w) = svg_stroke(tag);
    let stroke_color = with_opacity(stroke_color, world.opacity);
    let has_stroke = svg_attr_str(tag, "stroke").is_some_and(|s| !s.eq_ignore_ascii_case("none"));
    let pad = if has_stroke {
        (stroke_w * 0.5).max(0.5)
    } else {
        0.0
    };
    let r2 = r * r;
    let x0 = (cx - r - pad).floor().max(0.0) as u32;
    let y0 = (cy - r - pad).floor().max(0.0) as u32;
    let x1 = (cx + r + pad).ceil().min(img.width as f32) as u32;
    let y1 = (cy + r + pad).ceil().min(img.height as f32) as u32;
    let inner = (r - pad).max(0.0);
    let outer = r + pad;
    for yy in y0..y1 {
        for xx in x0..x1 {
            let dx = xx as f32 + 0.5 - cx;
            let dy = yy as f32 + 0.5 - cy;
            let dist = dx.hypot(dy);
            if !pixel_allowed(tag, clips, world, xx as f32 + 0.5, yy as f32 + 0.5) {
                continue;
            }
            let idx = ((yy * img.width + xx) * 4) as usize;
            let in_fill = !fill.eq_ignore_ascii_case("none") && dist * dist <= r2;
            let in_stroke = has_stroke && dist >= inner && dist <= outer;
            let stroke_first = svg_stroke_first(tag);
            if stroke_first && in_stroke {
                img.rgba[idx..idx + 4].copy_from_slice(&stroke_color);
            }
            if in_fill {
                let color = with_opacity(
                    paint_fill_color(tag, fill, grads, patterns, xx as f32 + 0.5, yy as f32 + 0.5),
                    world.opacity,
                );
                img.rgba[idx..idx + 4].copy_from_slice(&color);
            }
            if !stroke_first && in_stroke {
                img.rgba[idx..idx + 4].copy_from_slice(&stroke_color);
            }
        }
    }
}

fn paint_svg_ellipse(
    img: &mut DecodedImage,
    tag: &str,
    g: SvgXform,
    grads: &HashMap<String, SvgGrad>,
    clips: &HashMap<String, SvgClip>,
    patterns: &HashMap<String, SvgPattern>,
) {
    let world = g.then_tag(tag);
    let (cx, cy) = world.map(
        svg_attr(tag, "cx").unwrap_or(0.0),
        svg_attr(tag, "cy").unwrap_or(0.0),
    );
    let rx = svg_attr(tag, "rx").unwrap_or(0.0) * world.sx.abs();
    let ry = svg_attr(tag, "ry").unwrap_or(0.0) * world.sy.abs();
    let fill = svg_fill(tag);
    let (stroke_color, stroke_w) = svg_stroke(tag);
    let stroke_color = with_opacity(stroke_color, world.opacity);
    let has_stroke = svg_attr_str(tag, "stroke").is_some_and(|s| !s.eq_ignore_ascii_case("none"));
    let pad = if has_stroke {
        (stroke_w * 0.5).max(0.5)
    } else {
        0.0
    };
    let x0 = (cx - rx - pad).floor().max(0.0) as u32;
    let y0 = (cy - ry - pad).floor().max(0.0) as u32;
    let x1 = (cx + rx + pad).ceil().min(img.width as f32) as u32;
    let y1 = (cy + ry + pad).ceil().min(img.height as f32) as u32;
    let scale = rx.abs().min(ry.abs()).max(0.001);
    for yy in y0..y1 {
        for xx in x0..x1 {
            let nx = (xx as f32 + 0.5 - cx) / rx.max(0.001);
            let ny = (yy as f32 + 0.5 - cy) / ry.max(0.001);
            let n = (nx * nx + ny * ny).sqrt();
            if !pixel_allowed(tag, clips, world, xx as f32 + 0.5, yy as f32 + 0.5) {
                continue;
            }
            let idx = ((yy * img.width + xx) * 4) as usize;
            let in_fill = !fill.eq_ignore_ascii_case("none") && n <= 1.0;
            let in_stroke = has_stroke && (n - 1.0).abs() * scale <= pad;
            let stroke_first = svg_stroke_first(tag);
            if stroke_first && in_stroke {
                img.rgba[idx..idx + 4].copy_from_slice(&stroke_color);
            }
            if in_fill {
                let color = with_opacity(
                    paint_fill_color(tag, fill, grads, patterns, xx as f32 + 0.5, yy as f32 + 0.5),
                    world.opacity,
                );
                img.rgba[idx..idx + 4].copy_from_slice(&color);
            }
            if !stroke_first && in_stroke {
                img.rgba[idx..idx + 4].copy_from_slice(&stroke_color);
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

fn svg_unwrap_tag(content: &str, open: &str, close: &str) -> String {
    if let Some(i) = content.find(open) {
        let after = content[i..]
            .find('>')
            .map(|e| i + e + 1)
            .unwrap_or(content.len());
        return content[after..]
            .split(close)
            .next()
            .unwrap_or("")
            .to_string();
    }
    content.to_string()
}

fn svg_text_inner(content: &str) -> String {
    let s = svg_unwrap_tag(content, "<textPath", "</textPath>");
    svg_unwrap_tag(&s, "<tspan", "</tspan>")
}

fn svg_tspan_tag(content: &str) -> Option<&str> {
    let i = content.find("<tspan")?;
    let end = content[i..].find('>')?;
    Some(&content[i..i + end])
}

fn svg_tspan_attr<'a>(content: &'a str, name: &str) -> Option<String> {
    svg_attr_str(svg_tspan_tag(content)?, name).map(|s| s.to_string())
}

fn svg_tspan_dx(content: &str) -> f32 {
    svg_tspan_tag(content)
        .and_then(|t| svg_attr(t, "dx"))
        .unwrap_or(0.0)
}

fn svg_text_path_points<'a>(
    content: &str,
    by_id: &'a HashMap<String, String>,
) -> Option<Vec<(f32, f32)>> {
    let i = content.find("<textPath")?;
    let tag_end = content[i..].find('>')?;
    let tag = &content[i..i + tag_end];
    let href = svg_attr_str(tag, "href").or_else(|| svg_attr_str(tag, "xlink:href"))?;
    let id = href.strip_prefix('#')?;
    let src = by_id.get(id)?;
    let d = svg_attr_str(src, "d")?;
    svg_path_subpaths(d).into_iter().find(|c| c.len() >= 2)
}

fn svg_text_path_start(content: &str, by_id: &HashMap<String, String>) -> Option<(f32, f32)> {
    svg_text_path_points(content, by_id)
        .and_then(|c| c.into_iter().next())
        .or_else(|| {
            let i = content.find("<textPath")?;
            let tag_end = content[i..].find('>')?;
            let tag = &content[i..i + tag_end];
            let href = svg_attr_str(tag, "href").or_else(|| svg_attr_str(tag, "xlink:href"))?;
            let id = href.strip_prefix('#')?;
            let src = by_id.get(id)?;
            let d = svg_attr_str(src, "d")?;
            svg_path_subpaths(d)
                .into_iter()
                .find_map(|c| c.into_iter().next())
        })
}

fn svg_polyline_at(pts: &[(f32, f32)], dist: f32) -> (f32, f32) {
    let mut left = dist.max(0.0);
    for w in pts.windows(2) {
        let dx = w[1].0 - w[0].0;
        let dy = w[1].1 - w[0].1;
        let len = (dx * dx + dy * dy).sqrt();
        if len <= 0.0 {
            continue;
        }
        if left <= len {
            let t = left / len;
            return (w[0].0 + dx * t, w[0].1 + dy * t);
        }
        left -= len;
    }
    pts.last().copied().unwrap_or((0.0, 0.0))
}

fn paint_svg_text(
    img: &mut DecodedImage,
    content: &str,
    x: f32,
    y: f32,
    color: [u8; 4],
    letter_spacing: f32,
    word_spacing: f32,
    scale: f32,
    vertical: bool,
    path: Option<&[(f32, f32)]>,
) {
    let mut cx = x;
    let mut cy = y;
    let mut along = 0.0_f32;
    let gap = letter_spacing;
    let word = word_spacing;
    let s = scale.round().max(1.0) as i32;
    let step = |ch: char| -> f32 {
        if ch == ' ' {
            4.0 * scale + gap + word
        } else {
            6.0 * scale + gap
        }
    };
    for ch in content.chars() {
        let (px, py) = if let Some(pts) = path.filter(|p| p.len() >= 2) {
            svg_polyline_at(pts, along)
        } else {
            (cx, cy)
        };
        if ch != ' ' {
            if let Some(rows) = glyph_5x7(ch) {
                let origin_x = px.round() as i32;
                let baseline = py.round() as i32;
                for (row, bits) in rows.iter().enumerate() {
                    for col in 0..5 {
                        if bits & (1 << (4 - col)) == 0 {
                            continue;
                        }
                        for dy in 0..s {
                            for dx in 0..s {
                                let xx = origin_x + col as i32 * s + dx;
                                let yy = baseline - 7 * s + row as i32 * s + dy;
                                if xx >= 0
                                    && yy >= 0
                                    && (xx as u32) < img.width
                                    && (yy as u32) < img.height
                                {
                                    let idx = ((yy as u32 * img.width + xx as u32) * 4) as usize;
                                    img.rgba[idx..idx + 4].copy_from_slice(&color);
                                }
                            }
                        }
                    }
                }
            }
        }
        let adv = step(ch);
        along += adv;
        if vertical {
            cy += adv;
        } else {
            cx += adv;
        }
    }
}

fn fill_polygon_with(
    img: &mut DecodedImage,
    pts: &[(f32, f32)],
    color_at: impl FnMut(u32, u32) -> [u8; 4],
) {
    let one = [pts.to_vec()];
    fill_contours_with(img, &one, color_at);
}

fn fill_contours_with(
    img: &mut DecodedImage,
    contours: &[Vec<(f32, f32)>],
    mut color_at: impl FnMut(u32, u32) -> [u8; 4],
) {
    let mut min_y = i32::MAX;
    let mut max_y = i32::MIN;
    for pts in contours {
        for p in pts {
            let y = p.1.round() as i32;
            min_y = min_y.min(y);
            max_y = max_y.max(y);
        }
    }
    if min_y == i32::MAX {
        return;
    }
    min_y = min_y.max(0);
    max_y = max_y.min(img.height as i32 - 1);
    for y in min_y..=max_y {
        let mut xs = Vec::new();
        let yf = y as f32 + 0.5;
        for pts in contours {
            for w in pts.windows(2) {
                let (x0, y0) = w[0];
                let (x1, y1) = w[1];
                if (y0 <= yf && y1 > yf) || (y1 <= yf && y0 > yf) {
                    let t = (yf - y0) / (y1 - y0);
                    xs.push(x0 + t * (x1 - x0));
                }
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

fn svg_translate(tag: &str) -> (f32, f32) {
    let Some(raw) = svg_attr_str(tag, "transform") else {
        return (0.0, 0.0);
    };
    let mut x = 0.0;
    let mut y = 0.0;
    if let Some(idx) = raw.find("translate") {
        let rest = raw[idx + 9..].trim();
        let rest = rest.trim_start_matches('(');
        let rest = rest.split(')').next().unwrap_or("").trim();
        let mut nums = rest
            .split(|c: char| c == ',' || c.is_whitespace())
            .filter(|s| !s.is_empty());
        x += nums.next().and_then(|s| s.parse().ok()).unwrap_or(0.0);
        y += nums.next().and_then(|s| s.parse().ok()).unwrap_or(0.0);
    }
    if let Some(idx) = raw.find("matrix") {
        let rest = raw[idx + 6..].trim();
        let rest = rest.trim_start_matches('(');
        let rest = rest.split(')').next().unwrap_or("").trim();
        let nums: Vec<f32> = rest
            .split(|c: char| c == ',' || c.is_whitespace())
            .filter(|s| !s.is_empty())
            .filter_map(|s| s.parse().ok())
            .collect();
        if nums.len() >= 6 {
            x += nums[4];
            y += nums[5];
        }
    }
    (x, y)
}

fn svg_scale(tag: &str) -> (f32, f32) {
    let Some(raw) = svg_attr_str(tag, "transform") else {
        return (1.0, 1.0);
    };
    let mut x = 1.0;
    let mut y = 1.0;
    if let Some(idx) = raw.find("scale") {
        let rest = raw[idx + 5..].trim();
        let rest = rest.trim_start_matches('(');
        let rest = rest.split(')').next().unwrap_or("").trim();
        let mut nums = rest
            .split(|c: char| c == ',' || c.is_whitespace())
            .filter(|s| !s.is_empty());
        x = nums.next().and_then(|s| s.parse().ok()).unwrap_or(1.0);
        y = nums.next().and_then(|s| s.parse().ok()).unwrap_or(x);
    }
    if let Some(idx) = raw.find("matrix") {
        let rest = raw[idx + 6..].trim();
        let rest = rest.trim_start_matches('(');
        let rest = rest.split(')').next().unwrap_or("").trim();
        let nums: Vec<f32> = rest
            .split(|c: char| c == ',' || c.is_whitespace())
            .filter(|s| !s.is_empty())
            .filter_map(|s| s.parse().ok())
            .collect();
        if nums.len() >= 6 {
            x *= nums[0];
            y *= nums[3];
        }
    }
    (x, y)
}

fn svg_rotate_pt(x: f32, y: f32, rad: f32, cx: f32, cy: f32) -> (f32, f32) {
    let dx = x - cx;
    let dy = y - cy;
    let c = rad.cos();
    let s = rad.sin();
    (cx + dx * c - dy * s, cy + dx * s + dy * c)
}

fn svg_skew(tag: &str) -> (f32, f32) {
    let Some(raw) = svg_attr_str(tag, "transform") else {
        return (0.0, 0.0);
    };
    let parse_deg = |raw: &str, name: &str| -> f32 {
        let Some(idx) = raw.find(name) else {
            return 0.0;
        };
        let rest = raw[idx + name.len()..].trim();
        let rest = rest.trim_start_matches('(');
        let rest = rest.split(')').next().unwrap_or("").trim();
        rest.parse::<f32>().unwrap_or(0.0).to_radians().tan()
    };
    (parse_deg(raw, "skewX"), parse_deg(raw, "skewY"))
}

fn svg_skew_pt(x: f32, y: f32, kx: f32, ky: f32) -> (f32, f32) {
    let x1 = x + y * kx;
    (x1, y + x1 * ky)
}

fn svg_unskew_pt(xp: f32, yp: f32, kx: f32, ky: f32) -> (f32, f32) {
    let y = yp - xp * ky;
    (xp - y * kx, y)
}

fn svg_rotate(tag: &str) -> (f32, f32, f32) {
    let Some(raw) = svg_attr_str(tag, "transform") else {
        return (0.0, 0.0, 0.0);
    };
    let Some(idx) = raw.find("rotate") else {
        return (0.0, 0.0, 0.0);
    };
    let rest = raw[idx + 6..].trim();
    let rest = rest.trim_start_matches('(');
    let rest = rest.split(')').next().unwrap_or("").trim();
    let mut nums = rest
        .split(|c: char| c == ',' || c.is_whitespace())
        .filter(|s| !s.is_empty());
    let ang = nums.next().and_then(|s| s.parse().ok()).unwrap_or(0.0);
    let cx = nums.next().and_then(|s| s.parse().ok()).unwrap_or(0.0);
    let cy = nums.next().and_then(|s| s.parse().ok()).unwrap_or(0.0);
    (ang, cx, cy)
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
    patterns: &HashMap<String, SvgPattern>,
    x: f32,
    y: f32,
) -> [u8; 4] {
    let color = if let Some(id) = parse_url_id(fill) {
        if let Some(p) = patterns.get(id) {
            sample_pattern(p, x, y)
        } else if let Some(g) = grads.get(id) {
            sample_grad(g, x, y)
        } else {
            parse_svg_color(fill)
        }
    } else {
        parse_svg_color(fill)
    };
    with_opacity(color, svg_opacity_attr(tag, "fill-opacity"))
}

fn svg_linecap(tag: &str) -> &'static str {
    let raw = svg_attr_str(tag, "stroke-linecap").unwrap_or("round");
    if raw.eq_ignore_ascii_case("butt") {
        "butt"
    } else if raw.eq_ignore_ascii_case("square") {
        "square"
    } else {
        "round"
    }
}

fn svg_linejoin(tag: &str) -> &'static str {
    let raw = svg_attr_str(tag, "stroke-linejoin").unwrap_or("round");
    if raw.eq_ignore_ascii_case("miter") {
        "miter"
    } else if raw.eq_ignore_ascii_case("bevel") {
        "bevel"
    } else {
        "round"
    }
}

fn svg_miterlimit(tag: &str) -> f32 {
    svg_attr(tag, "stroke-miterlimit").unwrap_or(4.0).max(1.0)
}

fn svg_dash(tag: &str) -> Vec<f32> {
    let Some(raw) = svg_attr_str(tag, "stroke-dasharray") else {
        return Vec::new();
    };
    if raw.eq_ignore_ascii_case("none") {
        return Vec::new();
    }
    raw.split(|c: char| c == ',' || c.is_whitespace())
        .filter(|s| !s.is_empty())
        .filter_map(|s| s.parse().ok())
        .filter(|n: &f32| *n >= 0.0)
        .collect()
}

fn svg_dashoffset(tag: &str) -> f32 {
    svg_attr(tag, "stroke-dashoffset").unwrap_or(0.0)
}

fn svg_stroke_scale(tag: &str, sx: f32, sy: f32) -> f32 {
    if svg_attr_str(tag, "vector-effect")
        .is_some_and(|s| s.eq_ignore_ascii_case("non-scaling-stroke"))
    {
        1.0
    } else {
        ((sx.abs() + sy.abs()) * 0.5).max(0.0)
    }
}

fn dash_on(dashes: &[f32], dist: f32, offset: f32) -> bool {
    if dashes.is_empty() {
        return true;
    }
    let period: f32 = dashes.iter().sum();
    if period <= 0.0 {
        return true;
    }
    let mut d = (dist + offset) % period;
    if d < 0.0 {
        d += period;
    }
    let mut acc = 0.0;
    for (i, seg) in dashes.iter().enumerate() {
        acc += *seg;
        if d < acc {
            return i % 2 == 0;
        }
    }
    true
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
    mut x1: f32,
    mut y1: f32,
    mut x2: f32,
    mut y2: f32,
    color: [u8; 4],
    width: f32,
    dashes: &[f32],
    cap: &str,
    offset: f32,
) {
    let mut dx = x2 - x1;
    let mut dy = y2 - y1;
    let mut len = dx.hypot(dy);
    let radius = (width * 0.5).max(0.5);
    let round = !cap.eq_ignore_ascii_case("butt") && !cap.eq_ignore_ascii_case("square");
    if cap.eq_ignore_ascii_case("square") && len > 0.0 {
        let ux = dx / len;
        let uy = dy / len;
        x1 -= ux * radius;
        y1 -= uy * radius;
        x2 += ux * radius;
        y2 += uy * radius;
        dx = x2 - x1;
        dy = y2 - y1;
        len = dx.hypot(dy);
    }
    let nx = if len > 0.0 { -dy / len } else { 0.0 };
    let ny = if len > 0.0 { dx / len } else { 1.0 };
    let steps = dx.abs().max(dy.abs()).ceil().max(1.0) as i32;
    let r = radius.ceil() as i32;
    for s in 0..=steps {
        let t = s as f32 / steps as f32;
        if !dash_on(dashes, t * len, offset) {
            continue;
        }
        let cx = x1 + dx * t;
        let cy = y1 + dy * t;
        if round {
            let cxi = cx.round() as i32;
            let cyi = cy.round() as i32;
            for oy in -r..=r {
                for ox in -r..=r {
                    if (ox as f32).hypot(oy as f32) > radius + 0.25 {
                        continue;
                    }
                    let xx = cxi + ox;
                    let yy = cyi + oy;
                    if xx >= 0 && yy >= 0 && (xx as u32) < img.width && (yy as u32) < img.height {
                        let idx = ((yy as u32 * img.width + xx as u32) * 4) as usize;
                        img.rgba[idx..idx + 4].copy_from_slice(&color);
                    }
                }
            }
        } else {
            for k in -r..=r {
                if (k as f32).abs() > radius + 0.25 {
                    continue;
                }
                let xx = (cx + nx * k as f32).round() as i32;
                let yy = (cy + ny * k as f32).round() as i32;
                if xx >= 0 && yy >= 0 && (xx as u32) < img.width && (yy as u32) < img.height {
                    let idx = ((yy as u32 * img.width + xx as u32) * 4) as usize;
                    img.rgba[idx..idx + 4].copy_from_slice(&color);
                }
            }
        }
    }
}

fn plot_px(img: &mut DecodedImage, x: i32, y: i32, color: [u8; 4]) {
    if x >= 0 && y >= 0 && (x as u32) < img.width && (y as u32) < img.height {
        let idx = ((y as u32 * img.width + x as u32) * 4) as usize;
        img.rgba[idx..idx + 4].copy_from_slice(&color);
    }
}

fn stroke_joins(
    img: &mut DecodedImage,
    pts: &[(f32, f32)],
    color: [u8; 4],
    width: f32,
    join: &str,
    miter_limit: f32,
) {
    if pts.len() < 3 {
        return;
    }
    let closed = pts.first() == pts.last();
    let n = if closed { pts.len() - 1 } else { pts.len() };
    if n < 2 {
        return;
    }
    let start = if closed { 0 } else { 1 };
    let end = if closed { n } else { n.saturating_sub(1) };
    let radius = (width * 0.5).max(0.5);
    for i in start..end {
        let prev = pts[(i + n - 1) % n];
        let cur = pts[i];
        let next = pts[(i + 1) % n];
        stroke_join(img, prev, cur, next, color, radius, join, miter_limit);
    }
}

fn stroke_join(
    img: &mut DecodedImage,
    prev: (f32, f32),
    cur: (f32, f32),
    next: (f32, f32),
    color: [u8; 4],
    radius: f32,
    join: &str,
    miter_limit: f32,
) {
    let (ax, ay) = (cur.0 - prev.0, cur.1 - prev.1);
    let (bx, by) = (next.0 - cur.0, next.1 - cur.1);
    let alen = ax.hypot(ay);
    let blen = bx.hypot(by);
    if alen < 1e-4 || blen < 1e-4 {
        return;
    }
    let (ix, iy) = (ax / alen, ay / alen);
    let (ox, oy) = (bx / blen, by / blen);
    if join.eq_ignore_ascii_case("round") {
        let r = radius.ceil() as i32;
        let cxi = cur.0.round() as i32;
        let cyi = cur.1.round() as i32;
        for dy in -r..=r {
            for dx in -r..=r {
                if (dx as f32).hypot(dy as f32) > radius + 0.25 {
                    continue;
                }
                plot_px(img, cxi + dx, cyi + dy, color);
            }
        }
        return;
    }
    let cross = ix * oy - iy * ox;
    let sign = if cross < 0.0 { 1.0 } else { -1.0 };
    let (inx, iny) = (-iy, ix);
    let (onx, ony) = (-oy, ox);
    let p1 = (cur.0 + inx * radius * sign, cur.1 + iny * radius * sign);
    let p2 = (cur.0 + onx * radius * sign, cur.1 + ony * radius * sign);
    let mut use_bevel = join.eq_ignore_ascii_case("bevel");
    let mut miter = p1;
    if !use_bevel {
        let det = ix * oy - iy * ox;
        if det.abs() < 1e-5 {
            use_bevel = true;
        } else {
            let t = ((p2.0 - p1.0) * oy - (p2.1 - p1.1) * ox) / det;
            miter = (p1.0 + t * ix, p1.1 + t * iy);
            let mlen = (miter.0 - cur.0).hypot(miter.1 - cur.1);
            if mlen > miter_limit * radius {
                use_bevel = true;
            }
        }
    }
    if use_bevel {
        fill_polygon_with(img, &[cur, p1, p2, cur], |_, _| color);
    } else {
        fill_polygon_with(img, &[cur, p1, miter, p2, cur], |_, _| color);
    }
}

fn svg_path_subpaths(d: &str) -> Vec<Vec<(f32, f32)>> {
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
    let mut contours = Vec::new();
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
                if first && !out.is_empty() {
                    contours.push(std::mem::take(&mut out));
                }
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
    if !out.is_empty() {
        contours.push(out);
    }
    contours
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
    let bytes = tag.as_bytes();
    let mut search = tag;
    while let Some(i) = search.find(&key) {
        let abs = tag.len() - search.len() + i;
        let boundary = abs == 0 || bytes[abs - 1].is_ascii_whitespace() || bytes[abs - 1] == b'<';
        if boundary {
            let rest = &search[i + key.len()..];
            let q = rest.chars().next()?;
            if q == '"' || q == '\'' {
                return rest[1..].split(q).next();
            }
            return None;
        }
        search = &search[i + 1..];
    }
    None
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

    #[test]
    fn decode_svg_translate_moves_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <rect x='0' y='0' width='3' height='3' fill='#0000ff' transform='translate(4, 4)'/></svg>",
        )
        .expect("svg translate");
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(5, 5), Some([0, 0, 255, 255]));
    }

    #[test]
    fn decode_svg_scale_enlarges_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <rect x='1' y='1' width='2' height='2' fill='#ffff00' transform='scale(2)'/></svg>",
        )
        .expect("svg scale");
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(3, 3), Some([255, 255, 0, 255]));
        assert_eq!(img.pixel(5, 5), Some([255, 255, 0, 255]));
    }

    #[test]
    fn decode_svg_rotate_moves_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <rect x='0' y='0' width='3' height='3' fill='#0000ff' transform='rotate(180, 4, 4)'/></svg>",
        )
        .expect("svg rotate");
        assert_eq!(img.pixel(1, 1), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(6, 6), Some([0, 0, 255, 255]));
    }

    #[test]
    fn decode_svg_group_translate_moves_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <g transform='translate(4, 4)'><rect x='0' y='0' width='3' height='3' fill='#ff0000'/></g></svg>",
        )
        .expect("svg group");
        assert_eq!(img.pixel(1, 1), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(5, 5), Some([255, 0, 0, 255]));
    }

    #[test]
    fn decode_svg_matrix_translates_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <rect x='0' y='0' width='3' height='3' fill='#00ff00' transform='matrix(1,0,0,1,4,4)'/></svg>",
        )
        .expect("svg matrix");
        assert_eq!(img.pixel(1, 1), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(5, 5), Some([0, 255, 0, 255]));
    }

    #[test]
    fn decode_svg_group_scale_enlarges_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <g transform='scale(2)'><rect x='1' y='1' width='2' height='2' fill='#ffff00'/></g></svg>",
        )
        .expect("svg group scale");
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(3, 3), Some([255, 255, 0, 255]));
        assert_eq!(img.pixel(5, 5), Some([255, 255, 0, 255]));
    }

    #[test]
    fn decode_svg_group_translate_then_element_scale() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <g transform='translate(2, 2)'><rect x='1' y='1' width='2' height='2' fill='#ff00ff' transform='scale(2)'/></g></svg>",
        )
        .expect("svg group then scale");
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(5, 5), Some([255, 0, 255, 255]));
    }

    #[test]
    fn decode_svg_matrix_scales_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <rect x='1' y='1' width='2' height='2' fill='#00ffff' transform='matrix(2,0,0,2,0,0)'/></svg>",
        )
        .expect("svg matrix scale");
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(3, 3), Some([0, 255, 255, 255]));
        assert_eq!(img.pixel(5, 5), Some([0, 255, 255, 255]));
    }

    #[test]
    fn decode_svg_skew_x_shears_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <rect x='0' y='2' width='2' height='2' fill='#ff8800' transform='skewX(45)'/></svg>",
        )
        .expect("svg skew");
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(1, 2), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(3, 3), Some([255, 136, 0, 255]));
    }

    #[test]
    fn decode_svg_clip_path_masks_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><clipPath id='c'><rect x='2' y='2' width='4' height='4'/></clipPath></defs>\
              <rect x='0' y='0' width='8' height='8' fill='#ff0000' clip-path='url(#c)'/></svg>",
        )
        .expect("svg clip");
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(3, 3), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(7, 7), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_clip_path_circle_masks_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><clipPath id='c'><circle cx='4' cy='4' r='2'/></clipPath></defs>\
              <rect x='0' y='0' width='8' height='8' fill='#00ff00' clip-path='url(#c)'/></svg>",
        )
        .expect("svg circle clip");
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(4, 4), Some([0, 255, 0, 255]));
        assert_eq!(img.pixel(7, 7), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_clip_path_ellipse_masks_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><clipPath id='c'><ellipse cx='4' cy='4' rx='3' ry='2'/></clipPath></defs>\
              <rect x='0' y='0' width='8' height='8' fill='#0000ff' clip-path='url(#c)'/></svg>",
        )
        .expect("svg ellipse clip");
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(4, 4), Some([0, 0, 255, 255]));
        assert_eq!(img.pixel(6, 4), Some([0, 0, 255, 255]));
        assert_eq!(img.pixel(7, 7), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_stroke_dasharray_skips_gaps() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <line x1='0' y1='4' x2='8' y2='4' stroke='#ff0000' stroke-width='2' stroke-dasharray='1 3'/></svg>",
        )
        .expect("svg dash");
        assert_eq!(img.pixel(0, 4), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(2, 4), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(4, 4), Some([255, 0, 0, 255]));
    }

    #[test]
    fn decode_svg_text_anchor_end_shifts_left() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <text x='8' y='7' fill='#ff0000' text-anchor='end'>I</text></svg>",
        )
        .expect("svg text-anchor");
        assert_eq!(img.pixel(4, 3), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(7, 3), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_stroke_linecap_butt_keeps_end_empty() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <line x1='2' y1='4' x2='6' y2='4' stroke='#ff0000' stroke-width='4' stroke-linecap='butt'/></svg>",
        )
        .expect("svg linecap butt");
        assert_eq!(img.pixel(0, 4), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(4, 4), Some([255, 0, 0, 255]));
    }

    #[test]
    fn decode_svg_stroke_linecap_square_extends_end() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <line x1='2' y1='4' x2='6' y2='4' stroke='#00ff00' stroke-width='4' stroke-linecap='square'/></svg>",
        )
        .expect("svg linecap square");
        assert_eq!(img.pixel(0, 4), Some([0, 255, 0, 255]));
        assert_eq!(img.pixel(4, 4), Some([0, 255, 0, 255]));
    }

    #[test]
    fn decode_svg_fill_rule_evenodd_keeps_hole_empty() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <path fill='#ff0000' fill-rule='evenodd' d='M0,0 L8,0 L8,8 L0,8 Z M2,2 L6,2 L6,6 L2,6 Z'/></svg>",
        )
        .expect("svg evenodd");
        assert_eq!(img.pixel(0, 0), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(4, 4), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_stroke_linejoin_miter_reaches_outer_corner() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <polyline points='2,6 2,2 6,2' fill='none' stroke='#0000ff' stroke-width='4' stroke-linecap='butt' stroke-linejoin='miter'/></svg>",
        )
        .expect("svg linejoin miter");
        assert_eq!(img.pixel(0, 0), Some([0, 0, 255, 255]));
        assert_eq!(img.pixel(2, 2), Some([0, 0, 255, 255]));
    }

    #[test]
    fn decode_svg_stroke_linejoin_bevel_keeps_outer_corner_empty() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <polyline points='2,6 2,2 6,2' fill='none' stroke='#0000ff' stroke-width='4' stroke-linecap='butt' stroke-linejoin='bevel'/></svg>",
        )
        .expect("svg linejoin bevel");
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(2, 2), Some([0, 0, 255, 255]));
    }

    #[test]
    fn decode_svg_group_opacity_tints_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <g opacity='0.5'><rect x='0' y='0' width='8' height='8' fill='#00ff00'/></g></svg>",
        )
        .expect("svg group opacity");
        assert_eq!(img.pixel(3, 3), Some([0, 255, 0, 128]));
    }

    #[test]
    fn decode_svg_rect_stroke_paints_edge() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <rect x='2' y='2' width='4' height='4' fill='none' stroke='#ff0000' stroke-width='2' stroke-linecap='butt'/></svg>",
        )
        .expect("svg rect stroke");
        assert_eq!(img.pixel(2, 4), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(4, 4), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_circle_stroke_keeps_center_empty() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <circle cx='4' cy='4' r='3' fill='none' stroke='#ff0000' stroke-width='2'/></svg>",
        )
        .expect("svg circle stroke");
        assert_eq!(img.pixel(4, 4), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(4, 1), Some([255, 0, 0, 255]));
    }

    #[test]
    fn decode_svg_ellipse_stroke_keeps_center_empty() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <ellipse cx='4' cy='4' rx='3' ry='2' fill='none' stroke='#00ff00' stroke-width='2'/></svg>",
        )
        .expect("svg ellipse stroke");
        assert_eq!(img.pixel(4, 4), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(1, 4), Some([0, 255, 0, 255]));
    }

    #[test]
    fn decode_svg_paint_order_stroke_fill_keeps_edge_fill() {
        let fill_first = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <rect x='1' y='1' width='6' height='6' fill='#0000ff' stroke='#ff0000' stroke-width='4'/></svg>",
        )
        .expect("svg default paint-order");
        let stroke_first = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <rect x='1' y='1' width='6' height='6' fill='#0000ff' stroke='#ff0000' stroke-width='4' paint-order='stroke fill'/></svg>",
        )
        .expect("svg stroke fill paint-order");
        assert_eq!(fill_first.pixel(1, 4), Some([255, 0, 0, 255]));
        assert_eq!(stroke_first.pixel(1, 4), Some([0, 0, 255, 255]));
    }

    #[test]
    fn decode_svg_marker_end_paints_at_line_end() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><marker id='m' markerWidth='4' markerHeight='4' refX='2' refY='2'>\
              <rect x='0' y='0' width='4' height='4' fill='#00ff00'/></marker></defs>\
              <line x1='0' y1='4' x2='6' y2='4' stroke='#ff0000' stroke-width='1' marker-end='url(#m)'/></svg>",
        )
        .expect("svg marker-end");
        assert_eq!(img.pixel(6, 4), Some([0, 255, 0, 255]));
        assert_eq!(img.pixel(0, 4), Some([255, 0, 0, 255]));
    }

    #[test]
    fn decode_svg_visibility_hidden_skips_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <rect x='0' y='0' width='8' height='8' fill='#ff0000' visibility='hidden'/></svg>",
        )
        .expect("svg hidden");
        assert_eq!(img.pixel(4, 4), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_stroke_dashoffset_shifts_gaps() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <line x1='0' y1='4' x2='8' y2='4' stroke='#ff0000' stroke-width='2' stroke-linecap='butt' stroke-dasharray='1 3' stroke-dashoffset='1'/></svg>",
        )
        .expect("svg dashoffset");
        assert_eq!(img.pixel(0, 4), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(3, 4), Some([255, 0, 0, 255]));
    }

    #[test]
    fn decode_svg_vector_effect_keeps_stroke_unscaled() {
        let scaled = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <g transform='scale(2)'>\
              <line x1='0' y1='1' x2='4' y2='1' stroke='#ff0000' stroke-width='1' stroke-linecap='butt'/></g></svg>",
        )
        .expect("svg scaled stroke");
        let unscaled = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <g transform='scale(2)'>\
              <line x1='0' y1='1' x2='4' y2='1' stroke='#ff0000' stroke-width='1' stroke-linecap='butt' vector-effect='non-scaling-stroke'/></g></svg>",
        )
        .expect("svg non-scaling stroke");
        assert_eq!(scaled.pixel(2, 1), Some([255, 0, 0, 255]));
        assert_eq!(unscaled.pixel(2, 2), Some([255, 0, 0, 255]));
        assert_eq!(unscaled.pixel(2, 1), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_marker_start_paints_at_line_start() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><marker id='s' markerWidth='4' markerHeight='4' refX='2' refY='2'>\
              <rect x='0' y='0' width='4' height='4' fill='#0000ff'/></marker></defs>\
              <line x1='2' y1='4' x2='8' y2='4' stroke='#ff0000' stroke-width='1' marker-start='url(#s)'/></svg>",
        )
        .expect("svg marker-start");
        assert_eq!(img.pixel(2, 4), Some([0, 0, 255, 255]));
    }

    #[test]
    fn decode_svg_pattern_tiles_rect_fill() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><pattern id='p' width='4' height='4'>\
              <rect x='0' y='0' width='2' height='2' fill='#ff0000'/></pattern></defs>\
              <rect x='0' y='0' width='8' height='8' fill='url(#p)'/></svg>",
        )
        .expect("svg pattern");
        assert_eq!(img.pixel(0, 0), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(2, 0), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(4, 0), Some([255, 0, 0, 255]));
    }

    #[test]
    fn decode_svg_mask_hides_unmasked_pixels() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><mask id='m'><rect x='0' y='0' width='4' height='8' fill='#ffffff'/></mask></defs>\
              <rect x='0' y='0' width='8' height='8' fill='#00ff00' mask='url(#m)'/></svg>",
        )
        .expect("svg mask");
        assert_eq!(img.pixel(2, 4), Some([0, 255, 0, 255]));
        assert_eq!(img.pixel(6, 4), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_text_decoration_underline_paints_baseline() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <text x='0' y='7' fill='#ff0000' text-decoration='underline'>I</text></svg>",
        )
        .expect("svg underline");
        assert_eq!(img.pixel(2, 7), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(2, 3), Some([255, 0, 0, 255]));
    }

    #[test]
    fn decode_svg_filter_blur_spills_outside_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><filter id='f'><feGaussianBlur stdDeviation='1'/></filter></defs>\
              <rect x='2' y='2' width='4' height='4' fill='#ff0000' filter='url(#f)'/></svg>",
        )
        .expect("svg blur");
        assert_eq!(img.pixel(4, 4), Some([255, 0, 0, 255]));
        let edge = img.pixel(1, 4).unwrap_or([0, 0, 0, 0]);
        assert!(edge[0] > 0, "expected blur spill, got {edge:?}");
        assert!(edge[0] < 255, "expected faded spill, got {edge:?}");
    }

    #[test]
    fn decode_svg_filter_offset_moves_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><filter id='o'><feOffset dx='3' dy='0'/></filter></defs>\
              <rect x='1' y='2' width='3' height='4' fill='#ff0000' filter='url(#o)'/></svg>",
        )
        .expect("svg offset");
        assert_eq!(img.pixel(1, 4), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(4, 4), Some([255, 0, 0, 255]));
    }

    #[test]
    fn decode_svg_image_href_paints_referenced_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><rect id='r' x='0' y='0' width='4' height='4' fill='#00ff00'/></defs>\
              <image href='#r' x='2' y='2' width='4' height='4'/></svg>",
        )
        .expect("svg image");
        assert_eq!(img.pixel(3, 3), Some([0, 255, 0, 255]));
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_marker_mid_paints_at_polyline_vertex() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><marker id='m' markerWidth='4' markerHeight='4' refX='2' refY='2'>\
              <rect x='0' y='0' width='4' height='4' fill='#0000ff'/></marker></defs>\
              <polyline points='0,4 4,4 8,4' fill='none' stroke='#ff0000' stroke-width='1' marker-mid='url(#m)'/></svg>",
        )
        .expect("svg marker-mid");
        assert_eq!(img.pixel(4, 4), Some([0, 0, 255, 255]));
        assert_eq!(img.pixel(0, 4), Some([255, 0, 0, 255]));
    }

    #[test]
    fn decode_svg_filter_flood_fills_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><filter id='f'><feFlood flood-color='#00ff00' flood-opacity='1'/></filter></defs>\
              <rect x='2' y='2' width='4' height='4' fill='#ff0000' filter='url(#f)'/></svg>",
        )
        .expect("svg flood");
        assert_eq!(img.pixel(4, 4), Some([0, 255, 0, 255]));
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_filter_saturate_greys_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><filter id='f'><feColorMatrix type='saturate' values='0'/></filter></defs>\
              <rect x='2' y='2' width='4' height='4' fill='#ff0000' filter='url(#f)'/></svg>",
        )
        .expect("svg saturate");
        let px = img.pixel(4, 4).unwrap_or([0, 0, 0, 0]);
        assert_eq!(px[0], px[1], "{px:?}");
        assert_eq!(px[1], px[2], "{px:?}");
        assert!(px[0] > 0 && px[0] < 255, "{px:?}");
        assert_eq!(px[3], 255, "{px:?}");
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_text_path_starts_on_path() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><path id='p' d='M 4 7 L 8 7'/></defs>\
              <text fill='#ff0000'><textPath href='#p'>I</textPath></text></svg>",
        )
        .expect("svg textPath");
        assert_eq!(img.pixel(6, 3), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(1, 3), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_nested_overflow_hidden_clips_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <svg x='0' y='0' width='4' height='4' overflow='hidden'>\
              <rect x='2' y='2' width='6' height='6' fill='#ff0000'/></svg></svg>",
        )
        .expect("svg overflow");
        assert_eq!(img.pixel(3, 3), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(6, 6), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_letter_spacing_shifts_second_glyph() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='16' height='8'>\
              <text x='0' y='7' fill='#ff0000' letter-spacing='4'>II</text></svg>",
        )
        .expect("svg letter-spacing");
        assert_eq!(img.pixel(2, 3), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(12, 3), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(8, 3), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_tspan_dx_and_fill() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <text x='0' y='7' fill='#0000ff'><tspan fill='#ff0000' dx='4'>I</tspan></text></svg>",
        )
        .expect("svg tspan");
        assert_eq!(img.pixel(6, 3), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(2, 3), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_text_decoration_line_through() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <text x='0' y='7' fill='#ff0000' text-decoration='line-through'>I</text></svg>",
        )
        .expect("svg line-through");
        assert_eq!(img.pixel(0, 4), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(2, 3), Some([255, 0, 0, 255]));
    }

    #[test]
    fn decode_svg_filter_erode_shrinks_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><filter id='f'><feMorphology operator='erode' radius='1'/></filter></defs>\
              <rect x='2' y='2' width='4' height='4' fill='#ff0000' filter='url(#f)'/></svg>",
        )
        .expect("svg erode");
        assert_eq!(img.pixel(4, 4), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(2, 2), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(2, 4), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_font_size_scales_glyph() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>\
              <text x='0' y='14' fill='#ff0000' font-size='14'>I</text></svg>",
        )
        .expect("svg font-size");
        assert_eq!(img.pixel(4, 8), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(5, 8), Some([255, 0, 0, 255]));
    }

    #[test]
    fn decode_svg_dominant_baseline_hanging_keeps_glyph() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <text x='0' y='0' fill='#ff0000' dominant-baseline='hanging'>I</text></svg>",
        )
        .expect("svg hanging");
        assert_eq!(img.pixel(2, 3), Some([255, 0, 0, 255]));
    }

    #[test]
    fn decode_svg_word_spacing_shifts_second_word() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='16' height='8'>\
              <text x='0' y='7' fill='#ff0000' word-spacing='2'>I I</text></svg>",
        )
        .expect("svg word-spacing");
        assert_eq!(img.pixel(2, 3), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(14, 3), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(12, 3), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_foreign_object_fill_paints_box() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <foreignObject x='2' y='2' width='3' height='3' fill='#00ff00'/></svg>",
        )
        .expect("svg foreignObject");
        assert_eq!(img.pixel(3, 3), Some([0, 255, 0, 255]));
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_filter_dilate_grows_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><filter id='f'><feMorphology operator='dilate' radius='1'/></filter></defs>\
              <rect x='3' y='3' width='2' height='2' fill='#ff0000' filter='url(#f)'/></svg>",
        )
        .expect("svg dilate");
        assert_eq!(img.pixel(3, 3), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(2, 3), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_filter_blend_multiply_tints_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><filter id='f'><feFlood flood-color='#808080'/><feBlend mode='multiply'/></filter></defs>\
              <rect x='2' y='2' width='4' height='4' fill='#ff0000' filter='url(#f)'/></svg>",
        )
        .expect("svg blend");
        assert_eq!(img.pixel(4, 4), Some([128, 0, 0, 255]));
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_filter_arithmetic_scales_red() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><filter id='f'><feComposite operator='arithmetic' k2='0.5' k4='0'/></filter></defs>\
              <rect x='2' y='2' width='4' height='4' fill='#ff0000' filter='url(#f)'/></svg>",
        )
        .expect("svg arithmetic");
        assert_eq!(img.pixel(4, 4), Some([128, 0, 0, 255]));
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_filter_turbulence_varies_pixels() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><filter id='f'><feTurbulence baseFrequency='0.4'/></filter></defs>\
              <rect x='1' y='1' width='6' height='6' fill='#ff0000' filter='url(#f)'/></svg>",
        )
        .expect("svg turbulence");
        let a = img.pixel(2, 2).expect("a");
        let b = img.pixel(5, 5).expect("b");
        assert_ne!(a, [255, 0, 0, 255]);
        assert_ne!(a, b);
        assert_eq!(a[3], 255);
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_text_writing_mode_vertical() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>\
              <text x='0' y='7' fill='#ff0000' writing-mode='vertical-rl'>II</text></svg>",
        )
        .expect("svg vertical text");
        assert_eq!(img.pixel(2, 3), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(2, 9), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(8, 3), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_text_path_follows_vertical_path() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>\
              <path id='p' d='M 0 7 V 20' fill='none'/>\
              <text fill='#ff0000'><textPath href='#p'>II</textPath></text></svg>",
        )
        .expect("svg textPath along");
        assert_eq!(img.pixel(2, 3), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(2, 9), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(8, 3), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_filter_composite_out_punches_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><filter id='f'><feComposite operator='out'/></filter></defs>\
              <rect x='2' y='2' width='4' height='4' fill='#ff0000' filter='url(#f)'/></svg>",
        )
        .expect("svg composite out");
        assert_eq!(img.pixel(4, 4), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_filter_tile_repeats_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><filter id='f' x='0' y='0' width='8' height='8'><feTile/></filter></defs>\
              <rect x='0' y='0' width='2' height='2' fill='#ff0000' filter='url(#f)'/></svg>",
        )
        .expect("svg tile");
        assert_eq!(img.pixel(0, 0), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(2, 0), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(4, 2), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(6, 6), Some([255, 0, 0, 255]));
    }

    #[test]
    fn decode_svg_filter_component_scales_red() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><filter id='f'><feComponentTransfer><feFuncR type='linear' slope='0.5'/></feComponentTransfer></filter></defs>\
              <rect x='2' y='2' width='4' height='4' fill='#ff0000' filter='url(#f)'/></svg>",
        )
        .expect("svg component");
        assert_eq!(img.pixel(4, 4), Some([128, 0, 0, 255]));
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_filter_convolve_zeros_interior() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><filter id='f'><feConvolveMatrix order='3' kernelMatrix='0 -1 0 -1 4 -1 0 -1 0'/></filter></defs>\
              <rect x='2' y='2' width='4' height='4' fill='#ff0000' filter='url(#f)'/></svg>",
        )
        .expect("svg convolve");
        assert_eq!(img.pixel(4, 4), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(2, 2), Some([255, 0, 0, 255]));
    }

    #[test]
    fn decode_svg_filter_displace_shifts_rect() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <defs><filter id='f'><feDisplacementMap scale='2'/></filter></defs>\
              <rect x='1' y='2' width='2' height='2' fill='#ff0000' filter='url(#f)'/></svg>",
        )
        .expect("svg displace");
        assert_eq!(img.pixel(1, 2), Some([0, 0, 0, 0]));
        assert_eq!(img.pixel(3, 2), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(0, 0), Some([0, 0, 0, 0]));
    }

    #[test]
    fn decode_svg_text_decoration_overline_paints_top() {
        let img = decode(
            b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>\
              <text x='0' y='7' fill='#ff0000' text-decoration='overline'>I</text></svg>",
        )
        .expect("svg overline");
        assert_eq!(img.pixel(2, 0), Some([255, 0, 0, 255]));
        assert_eq!(img.pixel(2, 3), Some([255, 0, 0, 255]));
    }
}
