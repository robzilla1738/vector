//! Byte-to-text decoding for HTML documents.
//!
//! Follows the HTML "determine the character encoding" order in a pragmatic
//! subset: byte-order mark, then the transport's `charset` parameter, then a
//! prescan of the first 1024 bytes for `<meta charset>` /
//! `<meta http-equiv="Content-Type">`, then UTF-8. Supported encodings are
//! UTF-8, UTF-16 (BE/LE, BOM or label), windows-1252 (and its aliases
//! ISO-8859-1 / Latin-1 / US-ASCII, which the Encoding Standard maps onto
//! windows-1252). Anything else falls back to UTF-8 with replacement.

/// The encoding actually used to decode a document.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum Charset {
    /// UTF-8.
    Utf8,
    /// UTF-16 big-endian.
    Utf16Be,
    /// UTF-16 little-endian.
    Utf16Le,
    /// windows-1252 (the Encoding Standard's target for latin1 labels).
    Windows1252,
}

impl Charset {
    /// The canonical label.
    #[must_use]
    pub const fn label(self) -> &'static str {
        match self {
            Self::Utf8 => "utf-8",
            Self::Utf16Be => "utf-16be",
            Self::Utf16Le => "utf-16le",
            Self::Windows1252 => "windows-1252",
        }
    }

    /// Maps an encoding label (case-insensitive, trimmed) to a supported
    /// charset. Returns `None` for unknown labels.
    #[must_use]
    pub fn from_label(label: &str) -> Option<Self> {
        let l = label
            .trim()
            .trim_matches('"')
            .trim_matches('\'')
            .to_ascii_lowercase();
        Some(match l.as_str() {
            "utf-8" | "utf8" | "unicode-1-1-utf-8" => Self::Utf8,
            "utf-16be" => Self::Utf16Be,
            "utf-16" | "utf-16le" => Self::Utf16Le,
            "windows-1252" | "cp1252" | "x-cp1252" | "iso-8859-1" | "iso8859-1" | "iso_8859-1"
            | "latin1" | "latin-1" | "l1" | "ascii" | "us-ascii" | "ansi_x3.4-1968"
            | "iso-ir-100" | "cp819" | "ibm819" | "csisolatin1" => Self::Windows1252,
            _ => return None,
        })
    }
}

/// How a charset was chosen.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum CharsetSource {
    /// A byte-order mark.
    Bom,
    /// The transport's `Content-Type` charset parameter.
    Header,
    /// A `<meta>` declaration found by the prescan.
    Meta,
    /// Nothing declared; UTF-8 assumed.
    Default,
}

/// Result of [`decode_html_bytes`].
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Decoded {
    /// The decoded text.
    pub text: String,
    /// The charset used.
    pub charset: Charset,
    /// Where the charset came from.
    pub source: CharsetSource,
}

/// windows-1252 code points for bytes `0x80..=0x9F` (`0` = undefined, which
/// the Encoding Standard maps to U+0080..U+009F control characters).
const WINDOWS_1252_HIGH: [u16; 32] = [
    0x20AC, 0x0081, 0x201A, 0x0192, 0x201E, 0x2026, 0x2020, 0x2021, 0x02C6, 0x2030, 0x0160, 0x2039,
    0x0152, 0x008D, 0x017D, 0x008F, 0x0090, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2013, 0x2014,
    0x02DC, 0x2122, 0x0161, 0x203A, 0x0153, 0x009D, 0x017E, 0x0178,
];

/// Decodes windows-1252 bytes.
#[must_use]
pub fn decode_windows_1252(bytes: &[u8]) -> String {
    bytes
        .iter()
        .map(|&b| match b {
            0x80..=0x9F => char::from_u32(u32::from(WINDOWS_1252_HIGH[(b - 0x80) as usize]))
                .unwrap_or('\u{FFFD}'),
            _ => b as char,
        })
        .collect()
}

fn decode_utf16(bytes: &[u8], big_endian: bool) -> String {
    let units = bytes.chunks_exact(2).map(|c| {
        if big_endian {
            u16::from_be_bytes([c[0], c[1]])
        } else {
            u16::from_le_bytes([c[0], c[1]])
        }
    });
    char::decode_utf16(units)
        .map(|r| r.unwrap_or('\u{FFFD}'))
        .collect()
}

/// Decodes `bytes` with `charset`.
#[must_use]
pub fn decode_with(bytes: &[u8], charset: Charset) -> String {
    match charset {
        Charset::Utf8 => String::from_utf8_lossy(bytes).into_owned(),
        Charset::Utf16Be => decode_utf16(bytes, true),
        Charset::Utf16Le => decode_utf16(bytes, false),
        Charset::Windows1252 => decode_windows_1252(bytes),
    }
}

/// Extracts `charset=` from a `Content-Type`-like value (`text/html;
/// charset=utf-8`).
fn charset_param(value: &str) -> Option<String> {
    value.split(';').skip(1).map(str::trim).find_map(|p| {
        let (k, v) = p.split_once('=')?;
        k.trim()
            .eq_ignore_ascii_case("charset")
            .then(|| v.trim().trim_matches('"').trim_matches('\'').to_owned())
    })
}

/// Reads the attributes of a tag body (`meta charset="x" http-equiv=y`)
/// into `(name, value)` pairs, lower-casing names.
fn tag_attributes(tag: &str) -> Vec<(String, String)> {
    let mut out = Vec::new();
    let bytes = tag.as_bytes();
    let mut i = 0;
    // Skip the tag name.
    while i < bytes.len() && !bytes[i].is_ascii_whitespace() && bytes[i] != b'/' {
        i += 1;
    }
    while i < bytes.len() {
        while i < bytes.len() && (bytes[i].is_ascii_whitespace() || bytes[i] == b'/') {
            i += 1;
        }
        let name_start = i;
        while i < bytes.len()
            && !bytes[i].is_ascii_whitespace()
            && bytes[i] != b'='
            && bytes[i] != b'/'
            && bytes[i] != b'>'
        {
            i += 1;
        }
        if name_start == i {
            break;
        }
        let name = tag[name_start..i].to_ascii_lowercase();
        while i < bytes.len() && bytes[i].is_ascii_whitespace() {
            i += 1;
        }
        let mut value = String::new();
        if i < bytes.len() && bytes[i] == b'=' {
            i += 1;
            while i < bytes.len() && bytes[i].is_ascii_whitespace() {
                i += 1;
            }
            if i < bytes.len() && (bytes[i] == b'"' || bytes[i] == b'\'') {
                let quote = bytes[i];
                i += 1;
                let start = i;
                while i < bytes.len() && bytes[i] != quote {
                    i += 1;
                }
                tag[start..i.min(bytes.len())].clone_into(&mut value);
                i += 1;
            } else {
                let start = i;
                while i < bytes.len() && !bytes[i].is_ascii_whitespace() && bytes[i] != b'>' {
                    i += 1;
                }
                tag[start..i].clone_into(&mut value);
            }
        }
        out.push((name, value));
    }
    out
}

/// Prescans the first 1024 bytes for a `<meta>` charset declaration.
#[must_use]
pub fn sniff_meta_charset(bytes: &[u8]) -> Option<String> {
    let window = &bytes[..bytes.len().min(1024)];
    // The prescan only needs ASCII structure; decode lossily.
    let text = String::from_utf8_lossy(window);
    let lower = text.to_ascii_lowercase();
    let mut pos = 0;
    while let Some(rel) = lower[pos..].find("<meta") {
        let start = pos + rel;
        let Some(end_rel) = lower[start..].find('>') else {
            break;
        };
        let end = start + end_rel;
        let tag = &text[start + 1..end];
        let attrs = tag_attributes(tag);
        let attr = |n: &str| attrs.iter().find(|(k, _)| k == n).map(|(_, v)| v.as_str());
        if let Some(cs) = attr("charset") {
            return Some(cs.trim().to_ascii_lowercase());
        }
        if attr("http-equiv").is_some_and(|v| v.eq_ignore_ascii_case("content-type"))
            && let Some(content) = attr("content")
            && let Some(cs) = charset_param(content)
        {
            return Some(cs.to_ascii_lowercase());
        }
        pos = end + 1;
    }
    None
}

/// Decodes HTML bytes choosing the charset from BOM, transport hint, `<meta>`
/// prescan, then UTF-8. `transport_charset` is the `Content-Type` parameter.
#[must_use]
pub fn decode_html_bytes(bytes: &[u8], transport_charset: Option<&str>) -> Decoded {
    if bytes.starts_with(&[0xEF, 0xBB, 0xBF]) {
        return Decoded {
            text: decode_with(&bytes[3..], Charset::Utf8),
            charset: Charset::Utf8,
            source: CharsetSource::Bom,
        };
    }
    if bytes.starts_with(&[0xFE, 0xFF]) {
        return Decoded {
            text: decode_with(&bytes[2..], Charset::Utf16Be),
            charset: Charset::Utf16Be,
            source: CharsetSource::Bom,
        };
    }
    if bytes.starts_with(&[0xFF, 0xFE]) {
        return Decoded {
            text: decode_with(&bytes[2..], Charset::Utf16Le),
            charset: Charset::Utf16Le,
            source: CharsetSource::Bom,
        };
    }
    if let Some(cs) = transport_charset.and_then(Charset::from_label) {
        return Decoded {
            text: decode_with(bytes, cs),
            charset: cs,
            source: CharsetSource::Header,
        };
    }
    if let Some(cs) = sniff_meta_charset(bytes).and_then(|l| Charset::from_label(&l)) {
        // A document cannot be UTF-16 if we can read its meta tag as ASCII.
        let cs = match cs {
            Charset::Utf16Be | Charset::Utf16Le => Charset::Utf8,
            other => other,
        };
        return Decoded {
            text: decode_with(bytes, cs),
            charset: cs,
            source: CharsetSource::Meta,
        };
    }
    Decoded {
        text: decode_with(bytes, Charset::Utf8),
        charset: Charset::Utf8,
        source: CharsetSource::Default,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn windows_1252_specials_and_latin1_identity() {
        assert_eq!(decode_windows_1252(b"caf\xE9 \x80 \x93 \x94"), "café € “ ”");
        assert_eq!(
            decode_windows_1252(b"\x81"),
            "\u{81}",
            "undefined maps to control"
        );
        assert_eq!(
            Charset::from_label(" ISO-8859-1 "),
            Some(Charset::Windows1252)
        );
        assert_eq!(Charset::from_label("UTF8"), Some(Charset::Utf8));
        assert_eq!(Charset::from_label("shift_jis"), None);
    }

    #[test]
    fn charset_precedence_bom_header_meta_default() {
        let bom = decode_html_bytes(b"\xEF\xBB\xBF<p>hi</p>", Some("iso-8859-1"));
        assert_eq!(
            (bom.text.as_str(), bom.source),
            ("<p>hi</p>", CharsetSource::Bom)
        );

        let header = decode_html_bytes(b"<p>caf\xE9</p>", Some("windows-1252"));
        assert_eq!(header.text, "<p>café</p>");
        assert_eq!(header.source, CharsetSource::Header);

        let meta = decode_html_bytes(
            b"<!doctype html><html><head><meta charset='latin1'><title>x</title></head><body>na\xEFve",
            None,
        );
        assert_eq!(meta.source, CharsetSource::Meta);
        assert!(meta.text.ends_with("naïve"));

        let http_equiv = decode_html_bytes(
            b"<meta http-equiv=\"Content-Type\" content=\"text/html; charset=ISO-8859-1\">\xE9",
            None,
        );
        assert_eq!(
            (http_equiv.text.as_str(), http_equiv.charset),
            (
                "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=ISO-8859-1\">é",
                Charset::Windows1252
            )
        );

        let default = decode_html_bytes("<p>ünïcode</p>".as_bytes(), None);
        assert_eq!(default.text, "<p>ünïcode</p>");
        assert_eq!(default.source, CharsetSource::Default);

        let utf16 = decode_html_bytes(b"\xFF\xFEh\x00i\x00", None);
        assert_eq!(
            (utf16.text.as_str(), utf16.charset),
            ("hi", Charset::Utf16Le)
        );

        let unknown_header = decode_html_bytes("<p>é</p>".as_bytes(), Some("shift_jis"));
        assert_eq!(
            unknown_header.charset,
            Charset::Utf8,
            "unknown label ignored"
        );
    }

    #[test]
    fn meta_prescan_is_bounded_and_tolerant() {
        let mut far = vec![b' '; 1100];
        far.extend_from_slice(b"<meta charset=latin1>");
        assert_eq!(
            sniff_meta_charset(&far),
            None,
            "beyond the 1024-byte window"
        );
        assert_eq!(
            sniff_meta_charset(b"<META  CHARSET = \"UTF-8\" />"),
            Some("utf-8".into())
        );
        assert_eq!(
            sniff_meta_charset(b"<meta name=viewport content=width>"),
            None
        );
        assert_eq!(
            sniff_meta_charset(b"<meta charset"),
            None,
            "unterminated tag"
        );
    }
}
