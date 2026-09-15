//! Accessible name and description computation (a pragmatic subset of the
//! Accessible Name and Description Computation 1.2 algorithm).

use std::collections::HashMap;

use ve_core::NodeId;
use ve_dom::{Document, ElementData, NodeKind};

use crate::roles::Role;

/// Pre-computed `<label for>` index so that naming every control on a page
/// costs O(n) instead of O(n × labels). Build once per observation.
#[derive(Clone, Debug, Default)]
pub struct LabelIndex {
    by_target: HashMap<String, Vec<NodeId>>,
}

impl LabelIndex {
    /// Indexes every `<label for="…">` in the light tree.
    #[must_use]
    pub fn build(doc: &Document) -> Self {
        let mut by_target: HashMap<String, Vec<NodeId>> = HashMap::new();
        for id in doc.elements() {
            if let Some(e) = doc.element(id)
                && e.is_html("label")
                && let Some(target) = e.attr("for")
            {
                by_target.entry(target.to_owned()).or_default().push(id);
            }
        }
        Self { by_target }
    }

    /// Labels whose `for` attribute equals `control_id`.
    #[must_use]
    pub fn labels_for(&self, control_id: &str) -> &[NodeId] {
        self.by_target
            .get(control_id)
            .map_or(&[][..], Vec::as_slice)
    }
}

/// Collapses whitespace runs and trims.
fn normalize(text: &str) -> String {
    text.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn attr_nonempty<'a>(element: &'a ElementData, name: &str) -> Option<&'a str> {
    element.attr(name).map(str::trim).filter(|v| !v.is_empty())
}

/// Text from the elements referenced by a space separated id list.
fn text_from_id_refs(doc: &Document, ids: &str) -> Option<String> {
    let parts: Vec<String> = ids
        .split_ascii_whitespace()
        .filter_map(|id| doc.element_by_id(id))
        // The referenced element itself may be hidden, but its hidden descendants are skipped.
        .map(|target| name_from_content(doc, target, false))
        .filter(|s| !s.is_empty())
        .collect();
    (!parts.is_empty()).then(|| parts.join(" "))
}

/// Recursive "name from content": text of descendants, with embedded
/// controls contributing their value and images their `alt`.
fn name_from_content(doc: &Document, id: NodeId, allow_hidden: bool) -> String {
    let mut out = String::new();
    collect_text(doc, id, allow_hidden, &mut out);
    normalize(&out)
}

fn is_hidden(element: &ElementData) -> bool {
    element.has_attr("hidden")
        || element
            .attr("aria-hidden")
            .is_some_and(|v| v.eq_ignore_ascii_case("true"))
}

fn collect_text(doc: &Document, id: NodeId, allow_hidden: bool, out: &mut String) {
    for child in doc.children(id) {
        let Some(node) = doc.get(child) else { continue };
        match &node.kind {
            NodeKind::Text(t) => out.push_str(t),
            NodeKind::Element(e) => {
                if !allow_hidden && is_hidden(e) {
                    continue;
                }
                if matches!(
                    e.name.as_str(),
                    "script" | "style" | "template" | "noscript"
                ) {
                    continue;
                }
                if let Some(label) = attr_nonempty(e, "aria-label") {
                    out.push(' ');
                    out.push_str(label);
                    out.push(' ');
                    continue;
                }
                match e.name.as_str() {
                    "img" | "area" => {
                        if let Some(alt) = e.attr("alt") {
                            out.push(' ');
                            out.push_str(alt);
                            out.push(' ');
                        }
                    }
                    // accname §2E: only embedded textboxes, comboboxes /
                    // listboxes and ranges contribute; checkboxes, radios,
                    // buttons, hidden and file inputs contribute nothing.
                    "textarea" => {
                        if let Some(v) = doc.form_value(child) {
                            out.push(' ');
                            out.push_str(&v);
                            out.push(' ');
                        }
                    }
                    "input" => {
                        let ty = e.attr("type").map(str::to_ascii_lowercase);
                        let textbox_like = match ty.as_deref() {
                            None => true,
                            Some(t) => matches!(
                                t,
                                "text"
                                    | "search"
                                    | "email"
                                    | "tel"
                                    | "url"
                                    | "password"
                                    | "number"
                                    | "range"
                                    | "date"
                                    | "time"
                                    | "datetime-local"
                                    | "month"
                                    | "week"
                                    | "color"
                            ),
                        };
                        if textbox_like && let Some(v) = doc.form_value(child) {
                            out.push(' ');
                            out.push_str(&v);
                            out.push(' ');
                        }
                    }
                    "select" => {
                        // The selected option's label, not its value attribute.
                        if let Some(option) = doc
                            .descendants(child)
                            .find(|&o| doc.element(o).is_some_and(|x| x.is_html("option")) && doc.is_selected(o))
                        {
                            let text = normalize(&doc.text_content(option));
                            if !text.is_empty() {
                                out.push(' ');
                                out.push_str(&text);
                                out.push(' ');
                            }
                        }
                    }
                    "br" => out.push(' '),
                    _ => {
                        let block_like = matches!(
                            e.name.as_str(),
                            "p" | "div"
                                | "li"
                                | "tr"
                                | "td"
                                | "th"
                                | "h1"
                                | "h2"
                                | "h3"
                                | "h4"
                                | "h5"
                                | "h6"
                                | "section"
                                | "article"
                        );
                        if block_like {
                            out.push(' ');
                        }
                        collect_text(doc, child, allow_hidden, out);
                        if block_like {
                            out.push(' ');
                        }
                    }
                }
            }
            _ => {}
        }
    }
}

/// The `<label>` elements associated with a form control (by `for` or by
/// wrapping).
fn labels_for(
    doc: &Document,
    id: NodeId,
    element: &ElementData,
    index: Option<&LabelIndex>,
) -> Vec<NodeId> {
    let mut labels = Vec::new();
    if let Some(control_id) = element.id() {
        match index {
            Some(index) => labels.extend_from_slice(index.labels_for(control_id)),
            None => labels.extend(doc.elements().filter(|&l| {
                doc.element(l)
                    .is_some_and(|e| e.is_html("label") && e.attr("for") == Some(control_id))
            })),
        }
    }
    if let Some(wrapper) = doc
        .ancestors(id)
        .find(|&a| doc.element(a).is_some_and(|e| e.is_html("label")))
    {
        if !labels.contains(&wrapper) {
            labels.push(wrapper);
        }
    }
    labels
}

/// Native (host language) labelling: `alt`, `<label>`, `value` of buttons,
/// `<legend>`, `<caption>`, `<figcaption>`, `<title>` of SVG.
fn native_name(
    doc: &Document,
    id: NodeId,
    element: &ElementData,
    index: Option<&LabelIndex>,
) -> Option<String> {
    let first_child_named = |name: &str| {
        doc.children(id)
            .find(|&c| doc.element(c).is_some_and(|e| e.is_html(name)))
            .map(|c| name_from_content(doc, c, false))
            .filter(|s| !s.is_empty())
    };
    match element.name.as_str() {
        "img" | "area" => attr_nonempty(element, "alt").map(normalize),
        "input" => {
            let ty = element
                .attr("type")
                .map(str::to_ascii_lowercase)
                .unwrap_or_default();
            match ty.as_str() {
                "button" | "submit" | "reset" => {
                    attr_nonempty(element, "value").map(normalize).or_else(|| {
                        Some(match ty.as_str() {
                            "submit" => "Submit".to_owned(),
                            "reset" => "Reset".to_owned(),
                            _ => return None,
                        })
                    })
                }
                "image" => attr_nonempty(element, "alt")
                    .or_else(|| attr_nonempty(element, "value"))
                    .map(normalize),
                _ => label_text(doc, id, element, index),
            }
        }
        "select" | "textarea" | "meter" | "progress" | "output" => {
            label_text(doc, id, element, index)
        }
        "button" => label_text(doc, id, element, index),
        "fieldset" => first_child_named("legend"),
        "table" => first_child_named("caption"),
        "figure" => first_child_named("figcaption"),
        "details" => first_child_named("summary"),
        "svg" => first_child_named("title"),
        _ => None,
    }
}

fn label_text(
    doc: &Document,
    id: NodeId,
    element: &ElementData,
    index: Option<&LabelIndex>,
) -> Option<String> {
    let parts: Vec<String> = labels_for(doc, id, element, index)
        .into_iter()
        .map(|l| name_from_content(doc, l, false))
        .filter(|s| !s.is_empty())
        .collect();
    (!parts.is_empty()).then(|| parts.join(" "))
}

/// Computes the accessible name of element `id`. Returns an empty string
/// when the element has no name.
#[must_use]
pub fn compute_name(doc: &Document, id: NodeId) -> String {
    compute_name_with(doc, id, None)
}

/// [`compute_name`] with a pre-built [`LabelIndex`].
#[must_use]
pub fn compute_name_with(doc: &Document, id: NodeId, index: Option<&LabelIndex>) -> String {
    let Some(element) = doc.element(id) else {
        return doc
            .get(id)
            .and_then(ve_dom::Node::as_text)
            .map(normalize)
            .unwrap_or_default();
    };
    // 1. aria-labelledby
    if let Some(ids) = attr_nonempty(element, "aria-labelledby")
        && let Some(text) = text_from_id_refs(doc, ids)
    {
        return text;
    }
    // 2. aria-label
    if let Some(label) = attr_nonempty(element, "aria-label") {
        return normalize(label);
    }
    // 3. host language labelling
    if let Some(native) = native_name(doc, id, element, index) {
        return native;
    }
    // 4. name from content
    let role = Role::for_element(doc, id).unwrap_or(Role::Generic);
    if role.allows_name_from_content() {
        let text = name_from_content(doc, id, false);
        if !text.is_empty() {
            return text;
        }
    }
    // 5. tooltip / placeholder
    if let Some(title) = attr_nonempty(element, "title") {
        return normalize(title);
    }
    if matches!(element.name.as_str(), "input" | "textarea")
        && let Some(placeholder) = attr_nonempty(element, "placeholder")
    {
        return normalize(placeholder);
    }
    String::new()
}

/// Computes the accessible description (`aria-describedby`, else `title`
/// when it was not consumed as the name).
#[must_use]
pub fn compute_description(doc: &Document, id: NodeId, name: &str) -> String {
    let Some(element) = doc.element(id) else {
        return String::new();
    };
    if let Some(ids) = attr_nonempty(element, "aria-describedby")
        && let Some(text) = text_from_id_refs(doc, ids)
    {
        return text;
    }
    match attr_nonempty(element, "title") {
        Some(title) if normalize(title) != name => normalize(title),
        _ => String::new(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn name_sources_follow_precedence() {
        let doc = ve_html::parse_document(
            r#"<label for=e>Email  address</label><input id=e placeholder=ph>
               <button aria-label="Close dialog" title="x">X</button>
               <a href=# id=l><img alt="Home icon"> Home</a>
               <h2 id=h>Heading <span hidden>secret</span></h2>
               <div aria-labelledby="h l"></div>
               <input type=submit>
               <input id=p placeholder="Search…">
               <button title="Tip">Go</button>
               <fieldset><legend>Ship to</legend></fieldset>"#,
        )
        .document;
        let nth = |name: &str, n: usize| {
            doc.elements()
                .filter(|&e| doc.element(e).unwrap().name == name)
                .nth(n)
                .unwrap()
        };
        assert_eq!(
            compute_name(&doc, nth("input", 0)),
            "Email address",
            "label[for] wins over placeholder"
        );
        assert_eq!(compute_name(&doc, nth("button", 0)), "Close dialog");
        assert_eq!(
            compute_description(&doc, nth("button", 0), "Close dialog"),
            "x"
        );
        assert_eq!(
            compute_name(&doc, nth("a", 0)),
            "Home icon Home",
            "alt participates in name from content"
        );
        assert_eq!(
            compute_name(&doc, nth("h2", 0)),
            "Heading",
            "hidden descendants excluded"
        );
        assert_eq!(
            compute_name(&doc, nth("div", 0)),
            "Heading Home icon Home",
            "labelledby concatenates"
        );
        assert_eq!(compute_name(&doc, nth("input", 1)), "Submit");
        assert_eq!(
            compute_name(&doc, nth("input", 2)),
            "Search…",
            "placeholder as last resort"
        );
        assert_eq!(
            compute_name(&doc, nth("button", 1)),
            "Go",
            "content beats title"
        );
        assert_eq!(compute_description(&doc, nth("button", 1), "Go"), "Tip");
        assert_eq!(compute_name(&doc, nth("fieldset", 0)), "Ship to");
        let index = LabelIndex::build(&doc);
        assert_eq!(index.labels_for("e").len(), 1);
        assert_eq!(
            compute_name_with(&doc, nth("input", 0), Some(&index)),
            "Email address",
            "indexed lookup agrees with the scan"
        );
    }
}
