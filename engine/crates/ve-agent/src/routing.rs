//! Static-page classification for the runtime's router (architecture §11).
//!
//! After parse (before any observe) the document is classified as
//! `requiresScript` when one of the listed heuristics holds, or when the
//! content is something the engine cannot render (`capability_unsupported`
//! content: PDF, media-only, canvas-only bodies). The result is exposed on the
//! `open()` result as `routing` so the runtime can reopen on Chromium and
//! record the origin.

use serde::{Deserialize, Serialize};
use ve_dom::{Document, NodeKind};

/// CSS coverage counters from `ve-style`.
///
/// **Hook:** the layout track is adding `declarations_total` / `unknown` /
/// `deferred` counters to the style engine. Until they land this is always
/// `None`; once present, [`classify`] should also set `requires_script` when
/// `(unknown + deferred) / declarations_total > 5 %` for declarations that
/// affect `display` / `position` / `visibility`.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CssCoverage {
    /// Declarations seen.
    pub declarations_total: usize,
    /// Declarations with unknown properties.
    pub unknown: usize,
    /// Declarations the engine parsed but defers to a later milestone.
    pub deferred: usize,
}

/// Router input for one opened document.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RoutingInfo {
    /// The document needs script (or unsupported content) to be useful.
    pub requires_script: bool,
    /// `static` or the reason the page was classified as needing script.
    pub route_reason: String,
    /// CSS coverage counters (see [`CssCoverage`]); `None` until wired.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub css_coverage: Option<CssCoverage>,
    /// Body text length after parse (for benchmark reporting).
    pub body_text_chars: usize,
    /// External scripts (not JSON / importmap).
    pub external_scripts: usize,
}

impl RoutingInfo {
    /// A static page.
    #[must_use]
    pub fn static_page(body_text_chars: usize, external_scripts: usize) -> Self {
        Self {
            requires_script: false,
            route_reason: "static".into(),
            css_coverage: None,
            body_text_chars,
            external_scripts,
        }
    }
}

fn normalized_len(text: &str) -> usize {
    text.split_whitespace().map(|w| w.chars().count() + 1).sum::<usize>().saturating_sub(1)
}

/// Text of `root` skipping script/style/template/noscript.
fn visible_text(doc: &Document, root: ve_dom::NodeId) -> String {
    let mut out = String::new();
    let mut stack: Vec<ve_dom::NodeId> = vec![root];
    while let Some(n) = stack.pop() {
        match doc.get(n).map(|node| &node.kind) {
            Some(NodeKind::Text(t)) => {
                out.push(' ');
                out.push_str(t);
            }
            Some(NodeKind::Element(e)) => {
                if matches!(
                    e.name.as_str(),
                    "script" | "style" | "template" | "noscript" | "svg"
                ) {
                    continue;
                }
                let kids: Vec<_> = doc.children(n).collect();
                stack.extend(kids.into_iter().rev());
            }
            Some(_) => {
                let kids: Vec<_> = doc.children(n).collect();
                stack.extend(kids.into_iter().rev());
            }
            None => {}
        }
    }
    out
}

fn is_json_like_script(ty: Option<&str>) -> bool {
    ty.is_some_and(|t| {
        let t = t.trim().to_ascii_lowercase();
        t == "application/ld+json"
            || t == "application/json"
            || t == "importmap"
            || t == "speculationrules"
            || t.ends_with("+json")
    })
}

/// Classifies a parsed document. `content_type` is the response MIME type.
#[must_use]
pub fn classify(doc: &Document, content_type: Option<&str>) -> RoutingInfo {
    if let Some(ct) = content_type {
        let ct = ct.to_ascii_lowercase();
        if ct.starts_with("application/pdf") {
            return RoutingInfo {
                requires_script: true,
                route_reason: "unsupported-content: application/pdf".into(),
                css_coverage: None,
                body_text_chars: 0,
                external_scripts: 0,
            };
        }
        if ct.starts_with("video/") || ct.starts_with("audio/") || ct.starts_with("image/") {
            return RoutingInfo {
                requires_script: true,
                route_reason: format!("unsupported-content: {ct}"),
                css_coverage: None,
                body_text_chars: 0,
                external_scripts: 0,
            };
        }
    }
    let body = doc.body();
    let body_text = body.map(|b| visible_text(doc, b)).unwrap_or_default();
    let text_len = normalized_len(&body_text);

    let mut external_scripts = 0usize;
    let mut has_onsubmit_form = false;
    let mut form_without_submit = false;
    let mut noscript_mentions_js = false;
    let mut templates = 0usize;
    let mut slots = 0usize;
    let mut empty_root: Option<String> = None;
    let mut body_onload = false;
    let mut meta_refresh_js = false;
    let mut body_element_children = 0usize;
    let mut body_canvas_only = false;
    let mut body_media_only = false;

    if let Some(b) = body {
        let be = doc.element(b);
        body_onload = be.is_some_and(|e| e.has_attr("onload"));
        let kids: Vec<_> = doc
            .children(b)
            .filter(|&c| doc.element(c).is_some_and(|e| !matches!(e.name.as_str(), "script" | "style" | "noscript" | "template")))
            .collect();
        body_element_children = kids.len();
        if !kids.is_empty() {
            body_canvas_only = kids
                .iter()
                .all(|&k| doc.element(k).is_some_and(|e| e.is_html("canvas")));
            body_media_only = kids
                .iter()
                .all(|&k| doc.element(k).is_some_and(|e| matches!(e.name.as_str(), "video" | "audio")));
        }
    }

    for id in doc.elements() {
        let Some(e) = doc.element(id) else { continue };
        match e.name.as_str() {
            "script" => {
                if e.has_attr("src") && !is_json_like_script(e.attr("type")) {
                    external_scripts += 1;
                }
            }
            "form" => {
                if e.has_attr("onsubmit") {
                    has_onsubmit_form = true;
                }
                if !e.has_attr("action") && crate::forms::default_button(doc, id).is_none() {
                    form_without_submit = true;
                }
            }
            "noscript" => {
                let text = doc.text_content(id).to_ascii_lowercase();
                let words: Vec<&str> = text.split_whitespace().collect();
                let joined = words.join(" ");
                if joined.contains("javascript") || joined.contains("enable js") {
                    noscript_mentions_js = true;
                }
            }
            "template" => templates += 1,
            "slot" => slots += 1,
            "meta" => {
                if e.attr("http-equiv")
                    .is_some_and(|v| v.eq_ignore_ascii_case("refresh"))
                    && let Some(content) = e.attr("content")
                    && let Some(refresh) = ve_html::parse_refresh_content(content)
                    && refresh
                        .url
                        .as_deref()
                        .is_some_and(|u| u.trim_start().to_ascii_lowercase().starts_with("javascript:"))
                {
                    meta_refresh_js = true;
                }
            }
            _ => {}
        }
        if empty_root.is_none() {
            let id_attr = e.id().unwrap_or("");
            let is_root_container = matches!(id_attr, "root" | "app" | "__next" | "__nuxt")
                || e.has_attr("ng-version")
                || e.has_attr("data-reactroot");
            if is_root_container && !doc.children(id).any(|c| doc.element(c).is_some()) {
                empty_root = Some(if id_attr.is_empty() {
                    e.name.clone()
                } else {
                    format!("#{id_attr}")
                });
            }
        }
    }

    let reason = if text_len < 200 && external_scripts >= 1 {
        Some(format!(
            "empty-shell: body text {text_len} chars with {external_scripts} external script(s)"
        ))
    } else if let Some(root) = empty_root {
        Some(format!("empty-root-container: {root} has no element children"))
    } else if noscript_mentions_js && text_len < 1000 {
        Some(format!(
            "noscript-requires-js: <noscript> mentions JavaScript and body text is {text_len} chars"
        ))
    } else if meta_refresh_js {
        Some("meta-refresh-javascript: <meta http-equiv=refresh> targets a javascript: URL".into())
    } else if body_onload && text_len < 200 {
        Some(format!("body-onload: <body onload> drives content ({text_len} chars)"))
    } else if has_onsubmit_form {
        Some("form-onsubmit: a <form> has an onsubmit handler".into())
    } else if form_without_submit {
        Some("form-without-action-or-submit: a <form> lacks both action and a submit control".into())
    } else if (templates + slots) >= 3 && text_len < 200 {
        Some(format!(
            "template-heavy: {templates} <template>/{slots} <slot> with {text_len} chars of light-DOM text"
        ))
    } else if body_canvas_only {
        Some("unsupported-content: <canvas>-only body".into())
    } else if body_media_only {
        Some("unsupported-content: media-only body".into())
    } else if body_element_children == 0 && text_len == 0 && external_scripts == 0 && body.is_some() {
        None
    } else {
        None
    };

    match reason {
        Some(route_reason) => RoutingInfo {
            requires_script: true,
            route_reason,
            css_coverage: None,
            body_text_chars: text_len,
            external_scripts,
        },
        None => RoutingInfo::static_page(text_len, external_scripts),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn classify_html(html: &str) -> RoutingInfo {
        classify(&ve_html::parse_document(html).document, Some("text/html"))
    }

    #[test]
    fn static_pages_stay_on_the_engine() {
        let lorem = "Lorem ipsum dolor sit amet consectetur adipiscing elit. ".repeat(10);
        let info = classify_html(&format!(
            "<title>Docs</title><nav><a href=/>Home</a></nav><main><h1>Guide</h1><p>{lorem}</p>\
             <form action=/search><input name=q><button>Go</button></form></main>\
             <script type=\"application/ld+json\" src=x.json></script>"
        ));
        assert!(!info.requires_script, "{}", info.route_reason);
        assert_eq!(info.route_reason, "static");
        assert_eq!(info.external_scripts, 0, "JSON scripts do not count");
        assert!(info.body_text_chars > 400);
        // Plenty of text with a script tag is still static.
        let with_script = classify_html(&format!("<p>{lorem}</p><script src=app.js></script>"));
        assert!(!with_script.requires_script);
        assert_eq!(with_script.external_scripts, 1);
        // A GET form with a submit button is fine even without action.
        let form = classify_html(&format!("<p>{lorem}</p><form><input name=q><input type=submit></form>"));
        assert!(!form.requires_script);
        let empty = classify_html("<body></body>");
        assert!(!empty.requires_script, "an empty static body is not a script shell");
    }

    #[test]
    fn script_shells_are_routed_to_chromium() {
        let shell = classify_html("<div id=root></div><script src=/bundle.js></script>");
        assert!(shell.requires_script);
        assert!(shell.route_reason.starts_with("empty-shell"), "{}", shell.route_reason);

        let lorem = "words ".repeat(60);
        let root = classify_html(&format!("<p>{lorem}</p><div id=app></div>"));
        assert!(root.route_reason.starts_with("empty-root-container: #app"), "{}", root.route_reason);
        let ng = classify_html(&format!("<p>{lorem}</p><app-root ng-version=\"17\"></app-root>"));
        assert!(ng.route_reason.contains("app-root"));

        let noscript = classify_html("<body><noscript>You need to enable JavaScript to run this app.</noscript><p>Loading</p></body>");
        assert!(noscript.route_reason.starts_with("noscript-requires-js"));
        let noscript_long = classify_html(&format!("<noscript>Please enable JavaScript</noscript><p>{}</p>", "text ".repeat(300)));
        assert!(!noscript_long.requires_script, "long static text outweighs the noscript notice");

        let refresh = classify_html(&format!("<meta http-equiv=refresh content=\"0; url=javascript:boot()\"><p>{lorem}</p>"));
        assert!(refresh.route_reason.starts_with("meta-refresh-javascript"));

        let onload = classify_html("<body onload=\"init()\"><p>hi</p></body>");
        assert!(onload.route_reason.starts_with("body-onload"));

        let onsubmit = classify_html(&format!("<p>{lorem}</p><form action=/x onsubmit=\"return go()\"><input name=q><button>Go</button></form>"));
        assert!(onsubmit.route_reason.starts_with("form-onsubmit"));

        let no_submit = classify_html(&format!("<p>{lorem}</p><form><input name=q></form>"));
        assert!(no_submit.route_reason.starts_with("form-without-action-or-submit"));

        let templates = classify_html("<template><p>a</p></template><template><p>b</p></template><slot></slot><p>x</p>");
        assert!(templates.route_reason.starts_with("template-heavy"));

        let canvas = classify_html("<body><canvas></canvas></body>");
        assert!(canvas.route_reason.contains("canvas"));
        let media = classify_html("<body><video src=x.mp4></video></body>");
        assert!(media.route_reason.contains("media-only"));
    }

    #[test]
    fn unsupported_content_types() {
        let doc = ve_html::parse_document("").document;
        let pdf = classify(&doc, Some("application/pdf"));
        assert!(pdf.requires_script);
        assert_eq!(pdf.route_reason, "unsupported-content: application/pdf");
        let video = classify(&doc, Some("video/mp4"));
        assert!(video.route_reason.contains("video/mp4"));
        let json = serde_json::to_value(RoutingInfo::static_page(10, 0)).unwrap();
        assert_eq!(json["requiresScript"], false);
        assert_eq!(json["routeReason"], "static");
        assert!(json.get("cssCoverage").is_none(), "hook: absent until ve-style exposes counters");
    }
}
