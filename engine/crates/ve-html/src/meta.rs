//! Document-level metadata read after parsing: `<base href>`, `<meta
//! http-equiv="refresh">`, and the declared `<meta charset>`.

use ve_core::NodeId;
use ve_dom::Document;

/// A `<meta http-equiv="refresh">` directive.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct MetaRefresh {
    /// Delay in whole seconds.
    pub seconds: u64,
    /// Target URL as written (relative allowed); `None` reloads the page.
    pub url: Option<String>,
}

/// Metadata of a parsed document that affects navigation.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct DocumentMeta {
    /// `href` of the first `<base>` element with one.
    pub base_href: Option<String>,
    /// The first `<meta http-equiv=refresh>`.
    pub refresh: Option<MetaRefresh>,
    /// The declared `<meta charset>` / `Content-Type` charset, lower-cased.
    pub charset: Option<String>,
    /// The `<html lang>` attribute.
    pub lang: Option<String>,
}

/// Parses the `content` of a refresh directive: `5; url=/next`, `0;URL='x'`,
/// `3`.
#[must_use]
pub fn parse_refresh_content(content: &str) -> Option<MetaRefresh> {
    let content = content.trim();
    let (time, rest) = content
        .find([';', ','])
        .map_or((content, ""), |i| (&content[..i], &content[i + 1..]));
    let time = time.trim();
    let seconds: u64 = if time.is_empty() {
        0
    } else {
        // "5.9" is allowed; digits before the dot count.
        let digits: String = time.chars().take_while(|c| c.is_ascii_digit()).collect();
        if digits.is_empty() {
            return None;
        }
        digits.parse().ok()?
    };
    let rest = rest.trim();
    if rest.is_empty() {
        return Some(MetaRefresh { seconds, url: None });
    }
    let url = rest
        .strip_prefix("url")
        .or_else(|| rest.strip_prefix("URL"))
        .or_else(|| rest.strip_prefix("Url"))
        .map_or(rest, |after| {
            after.trim_start().trim_start_matches('=').trim_start()
        })
        .trim_matches(|c| c == '\'' || c == '"')
        .trim();
    Some(MetaRefresh {
        seconds,
        url: (!url.is_empty()).then(|| url.to_owned()),
    })
}

fn head_elements(doc: &Document) -> Vec<NodeId> {
    match doc.head() {
        Some(head) => doc
            .descendants(head)
            .filter(|&d| doc.element(d).is_some())
            .collect(),
        None => doc.elements().collect(),
    }
}

/// Reads [`DocumentMeta`] from a parsed document.
#[must_use]
pub fn document_meta(doc: &Document) -> DocumentMeta {
    let mut meta = DocumentMeta {
        lang: doc
            .document_element()
            .and_then(|html| doc.attribute(html, "lang"))
            .map(str::to_owned),
        ..DocumentMeta::default()
    };
    for id in head_elements(doc) {
        let Some(element) = doc.element(id) else {
            continue;
        };
        match element.name.as_str() {
            "base" if meta.base_href.is_none() => {
                if let Some(href) = element.attr("href") {
                    meta.base_href = Some(href.trim().to_owned());
                }
            }
            "meta" => {
                if let Some(cs) = element.attr("charset")
                    && meta.charset.is_none()
                {
                    meta.charset = Some(cs.trim().to_ascii_lowercase());
                }
                if let Some(equiv) = element.attr("http-equiv")
                    && let Some(content) = element.attr("content")
                {
                    if equiv.eq_ignore_ascii_case("refresh") && meta.refresh.is_none() {
                        meta.refresh = parse_refresh_content(content);
                    } else if equiv.eq_ignore_ascii_case("content-type") && meta.charset.is_none() {
                        meta.charset = content.split(';').skip(1).find_map(|p| {
                            let (k, v) = p.trim().split_once('=')?;
                            k.trim()
                                .eq_ignore_ascii_case("charset")
                                .then(|| v.trim().trim_matches('"').to_ascii_lowercase())
                        });
                    }
                }
            }
            _ => {}
        }
    }
    meta
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn refresh_content_forms() {
        assert_eq!(
            parse_refresh_content("5; url=/next"),
            Some(MetaRefresh {
                seconds: 5,
                url: Some("/next".into())
            })
        );
        assert_eq!(
            parse_refresh_content("0;URL='https://x.test/'"),
            Some(MetaRefresh {
                seconds: 0,
                url: Some("https://x.test/".into())
            })
        );
        assert_eq!(
            parse_refresh_content("3"),
            Some(MetaRefresh {
                seconds: 3,
                url: None
            })
        );
        assert_eq!(
            parse_refresh_content("2.5,/x"),
            Some(MetaRefresh {
                seconds: 2,
                url: Some("/x".into())
            })
        );
        assert_eq!(parse_refresh_content("soon; url=/x"), None);
    }

    #[test]
    fn reads_base_refresh_charset_and_lang() {
        let doc = crate::parse_document(
            r#"<!doctype html><html lang="en-GB"><head><base href="https://docs.test/v2/">
            <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
            <meta http-equiv="refresh" content="0; url=intro.html"></head><body>x</body></html>"#,
        )
        .document;
        let meta = document_meta(&doc);
        assert_eq!(meta.base_href.as_deref(), Some("https://docs.test/v2/"));
        assert_eq!(meta.charset.as_deref(), Some("iso-8859-1"));
        assert_eq!(meta.lang.as_deref(), Some("en-GB"));
        assert_eq!(
            meta.refresh,
            Some(MetaRefresh {
                seconds: 0,
                url: Some("intro.html".into())
            })
        );
        let plain = document_meta(&crate::parse_document("<p>x</p>").document);
        assert_eq!(plain, DocumentMeta::default());
    }
}
