//! Post-parse document classification (architecture §11 "Routing and
//! fallback", step 2): decides whether a freshly parsed document needs a
//! scripting browser (`requiresScript`) or contains content the engine
//! cannot render in this milestone. The runtime's router turns a positive
//! classification into `capability_unsupported` and reopens on Chromium.
//!
//! The rules are deliberately static and cheap: they run once per
//! navigation, before any observation.

use serde::{Deserialize, Serialize};
use ve_core::NodeId;
use ve_dom::{Document, NodeKind};

/// Routing information attached to every `open` / navigation result.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Routing {
    /// The document needs JavaScript (or an unsupported subsystem) to be
    /// useful; the router should reopen it on Chromium.
    pub requires_script: bool,
    /// Machine readable reason (`thin-body-with-external-script`, …).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
    /// `requiresScript` or `unsupportedContent`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kind: Option<String>,
}

impl Routing {
    fn script(reason: impl Into<String>) -> Self {
        Self {
            requires_script: true,
            reason: Some(reason.into()),
            kind: Some("requiresScript".into()),
        }
    }

    fn content(reason: impl Into<String>) -> Self {
        Self {
            requires_script: true,
            reason: Some(reason.into()),
            kind: Some("unsupportedContent".into()),
        }
    }
}

const APP_ROOT_IDS: &[&str] = &["root", "app", "__next", "__nuxt"];
const APP_ROOT_ATTRS: &[&str] = &["ng-version", "data-reactroot"];
const DATA_SCRIPT_TYPES: &[&str] = &["application/ld+json", "application/json", "importmap", "speculationrules"];

fn elements_named<'a>(doc: &'a Document, name: &'a str) -> impl Iterator<Item = NodeId> + 'a {
    doc.elements()
        .filter(move |&id| doc.element(id).is_some_and(|e| e.is_html(name)))
}

/// Text of `id`'s rendered-ish descendants: script, style, template and
/// noscript subtrees excluded, whitespace collapsed.
pub fn body_text(doc: &Document, id: NodeId) -> String {
    fn walk(doc: &Document, id: NodeId, out: &mut String) {
        for child in doc.children(id) {
            match doc.get(child).map(|n| &n.kind) {
                Some(NodeKind::Text(t)) => {
                    out.push(' ');
                    out.push_str(t);
                }
                Some(NodeKind::Element(e)) => {
                    if matches!(e.name.as_str(), "script" | "style" | "template" | "noscript") {
                        continue;
                    }
                    walk(doc, child, out);
                }
                _ => {}
            }
        }
    }
    let mut out = String::new();
    walk(doc, id, &mut out);
    out.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn has_element_children(doc: &Document, id: NodeId) -> bool {
    doc.children(id).any(|c| doc.get(c).is_some_and(ve_dom::Node::is_element))
}

fn is_submit_control(doc: &Document, id: NodeId) -> bool {
    let Some(e) = doc.element(id) else {
        return false;
    };
    if e.is_html("button") {
        return !e
            .attr("type")
            .is_some_and(|t| t.eq_ignore_ascii_case("button") || t.eq_ignore_ascii_case("reset"));
    }
    e.is_html("input")
        && e.attr("type")
            .is_some_and(|t| t.eq_ignore_ascii_case("submit") || t.eq_ignore_ascii_case("image"))
}

/// Classifies a parsed document. Returns a `Routing` whose
/// `requires_script` is `false` for documents the engine can serve.
#[must_use]
pub fn classify(doc: &Document) -> Routing {
    let Some(body) = doc.body() else {
        return Routing::default();
    };
    let text = body_text(doc, body);
    let text_len = text.chars().count();

    // Unsupported content: canvas-only or media-only bodies.
    if text.is_empty() {
        let has = |name: &str| elements_named(doc, name).next().is_some();
        if has("canvas") {
            return Routing::content("canvas-only");
        }
        if has("video") || has("audio") || has("embed") || has("object") {
            return Routing::content("media-only");
        }
    }

    // 1. thin body + external, non-data script
    if text_len < 200 {
        let external = elements_named(doc, "script").any(|id| {
            let e = doc.element(id).expect("element");
            e.has_attr("src")
                && !e
                    .attr("type")
                    .is_some_and(|t| DATA_SCRIPT_TYPES.iter().any(|d| t.eq_ignore_ascii_case(d)))
        });
        if external {
            return Routing::script("thin-body-with-external-script");
        }
    }

    // 2. empty application root container
    for id in APP_ROOT_IDS {
        if let Some(root) = doc.element_by_id(id)
            && !has_element_children(doc, root)
            && body_text(doc, root).is_empty()
        {
            return Routing::script(format!("empty-app-root(#{id})"));
        }
    }
    for attr in APP_ROOT_ATTRS {
        if let Some(root) = doc.elements().find(|&id| doc.attribute(id, attr).is_some())
            && !has_element_children(doc, root)
            && body_text(doc, root).is_empty()
        {
            return Routing::script(format!("empty-app-root([{attr}])"));
        }
    }

    // 3. noscript says JavaScript is required and the body is short
    if text_len < 1000 {
        let mentions_js = elements_named(doc, "noscript").any(|id| {
            let t = doc.text_content(id).to_ascii_lowercase();
            t.contains("javascript") || t.split_whitespace().collect::<Vec<_>>().join(" ").contains("enable js")
        });
        if mentions_js {
            return Routing::script("noscript-requires-js");
        }
    }

    // 4. body onload driving content
    if doc.attribute(body, "onload").is_some() {
        return Routing::script("body-onload");
    }

    // 5. forms that cannot submit without script
    for form in elements_named(doc, "form") {
        if doc.attribute(form, "onsubmit").is_some() {
            return Routing::script("form-onsubmit");
        }
        let has_action = doc.attribute(form, "action").is_some();
        let has_submit = doc.descendants(form).any(|d| is_submit_control(doc, d));
        if !has_action && !has_submit {
            return Routing::script("form-without-action-or-submit");
        }
    }

    // 6. template/slot-heavy with no light-DOM content
    if text.is_empty() {
        let shells = elements_named(doc, "template").count() + elements_named(doc, "slot").count();
        if shells > 0 {
            return Routing::script("template-only");
        }
    }

    Routing::default()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn parse(html: &str) -> Document {
        ve_html::parse_document(html).document
    }

    #[test]
    fn static_documents_pass() {
        let doc = parse(
            "<title>t</title><body><h1>Records</h1><form action=/x><input name=q><button>Go</button></form>\
             <script>document.getElementById('x')</script><p>plenty of static text here</p></body>",
        );
        assert_eq!(classify(&doc), Routing::default());
    }

    #[test]
    fn spa_shells_are_flagged() {
        let doc = parse(r#"<body><div id="root"></div><script src="/bundle.js"></script></body>"#);
        let r = classify(&doc);
        assert!(r.requires_script);
        assert_eq!(r.reason.as_deref(), Some("thin-body-with-external-script"));

        let doc = parse(&format!(
            r#"<body><div id="app"></div><p>{}</p></body>"#,
            "static text ".repeat(40)
        ));
        assert_eq!(classify(&doc).reason.as_deref(), Some("empty-app-root(#app)"));

        let doc = parse("<body><noscript>Please enable JavaScript</noscript><p>hi</p></body>");
        assert_eq!(classify(&doc).reason.as_deref(), Some("noscript-requires-js"));

        let doc = parse("<body onload=\"boot()\"><p>content</p></body>");
        assert_eq!(classify(&doc).reason.as_deref(), Some("body-onload"));

        let doc = parse("<body><form><input name=a></form></body>");
        assert_eq!(classify(&doc).reason.as_deref(), Some("form-without-action-or-submit"));

        let doc = parse("<body><form onsubmit=\"return go()\"><button>x</button></form></body>");
        assert_eq!(classify(&doc).reason.as_deref(), Some("form-onsubmit"));

        let doc = parse("<body><canvas></canvas></body>");
        let r = classify(&doc);
        assert_eq!(r.kind.as_deref(), Some("unsupportedContent"));
        assert_eq!(r.reason.as_deref(), Some("canvas-only"));

        let doc = parse("<body><template><p>x</p></template></body>");
        assert_eq!(classify(&doc).reason.as_deref(), Some("template-only"));
    }

    #[test]
    fn data_scripts_do_not_count_as_external() {
        let doc = parse(r#"<body><p>short</p><script type="application/ld+json" src="/x.json"></script></body>"#);
        assert!(!classify(&doc).requires_script);
    }
}
