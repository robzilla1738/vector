//! Shapes an engine semantic snapshot into the runtime's
//! `ObservationContent` (contracts/observation.ts) so the Node side never
//! has to understand engine snapshot rows.
//!
//! Refs are rendered `r<index>` (architecture §11 "Refs, observations,
//! programs"); the page's ref map remembers which `NodeId` (index +
//! generation) each ref meant so stale refs resolve to `target_detached`
//! instead of a reused slot.

use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use serde_json::{Map, Value, json};
use ve_a11y::{Role, SemanticSnapshot, SnapshotNode};
use ve_agent::{DomPage, Page};
use ve_core::NodeId;

/// Observation request options (mirrors `ObservationRequest` plus `since`).
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct ObserveRequest {
    /// `full | forms | links | tables | subtree`.
    pub scope: Option<String>,
    /// Ref whose subtree to observe when `scope == "subtree"`.
    pub subtree_ref: Option<String>,
    /// Element budget (default 120).
    pub max_elements: Option<usize>,
    /// Text budget in characters (default 6000).
    pub max_text_chars: Option<usize>,
    /// Report refs changed since this revision.
    pub since_revision: Option<u64>,
}

/// Renders a ref for agents.
#[must_use]
pub fn ref_of(id: NodeId) -> String {
    format!("r{}", id.index())
}

/// Parses `r<index>` into the index.
#[must_use]
pub fn parse_ref(s: &str) -> Option<u32> {
    s.strip_prefix('r').and_then(|n| n.parse().ok())
}

/// Per-page memory of what refs meant at the last observation.
#[derive(Clone, Debug, Default)]
pub struct RefMap {
    by_index: HashMap<u32, NodeId>,
}

impl RefMap {
    /// Remembers every ref in a snapshot.
    pub fn absorb(&mut self, snapshot: &SemanticSnapshot) {
        for n in &snapshot.nodes {
            self.by_index.insert(n.node.index(), n.node);
        }
    }

    /// Remembers one node.
    pub fn insert(&mut self, id: NodeId) {
        self.by_index.insert(id.index(), id);
    }

    /// The node a ref pointed at when it was observed.
    #[must_use]
    pub fn get(&self, index: u32) -> Option<NodeId> {
        self.by_index.get(&index).copied()
    }

    /// Forgets everything (navigation).
    pub fn clear(&mut self) {
        self.by_index.clear();
    }

    /// Number of remembered refs.
    #[must_use]
    pub fn len(&self) -> usize {
        self.by_index.len()
    }

    /// Whether nothing has been observed yet.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.by_index.is_empty()
    }
}

fn state(n: &SnapshotNode, s: &str) -> bool {
    n.states.iter().any(|x| x == s)
}

fn is_form_field(role: Role) -> bool {
    matches!(
        role,
        Role::TextBox
            | Role::SearchBox
            | Role::Combobox
            | Role::Checkbox
            | Role::Radio
            | Role::ListBox
            | Role::SpinButton
            | Role::Slider
            | Role::Switch
    )
}

fn cell_text(nodes: &[SnapshotNode], i: usize) -> String {
    let cell = &nodes[i];
    if !cell.name.is_empty() {
        return cell.name.clone();
    }
    let mut out = Vec::new();
    for n in nodes
        .iter()
        .skip(i + 1)
        .take_while(|n| n.depth > cell.depth)
    {
        if n.role == Role::StaticText && !n.name.is_empty() {
            out.push(n.name.clone());
        } else if let Some(v) = &n.value {
            out.push(v.clone());
        }
    }
    out.join(" ")
}

fn element_ref(page: &DomPage, n: &SnapshotNode) -> Value {
    let doc = page.document();
    let id = n.node;
    let tag = n
        .tag
        .clone()
        .or_else(|| doc.element(id).map(|e| e.name.clone()))
        .unwrap_or_else(|| "text".into());
    let mut el = Map::new();
    el.insert("ref".into(), json!(ref_of(id)));
    el.insert("frame".into(), json!("main"));
    el.insert("tag".into(), json!(tag));
    el.insert("role".into(), json!(n.role.name()));
    if !n.name.is_empty() {
        el.insert("name".into(), json!(n.name));
    }
    if let Some(v) = &n.value {
        el.insert("value".into(), json!(v));
    }
    if let Some(t) = doc.attribute(id, "type") {
        el.insert("type".into(), json!(t.to_ascii_lowercase()));
    }
    if let Some(p) = doc.attribute(id, "placeholder") {
        el.insert("placeholder".into(), json!(p));
    }
    if state(n, "checked") {
        el.insert("checked".into(), json!(true));
    } else if state(n, "unchecked") {
        el.insert("checked".into(), json!(false));
    }
    if state(n, "disabled") {
        el.insert("disabled".into(), json!(true));
    }
    if let Some(h) = &n.href {
        el.insert("href".into(), json!(h));
    }
    if let Some(b) = n.bounds {
        el.insert(
            "rect".into(),
            json!({ "x": b.x(), "y": b.y(), "w": b.width(), "h": b.height() }),
        );
    }
    // A portable selector so learned programs can be translated across
    // backends: `#id` when the element has one, else role+name.
    let mut selector = Map::new();
    if let Some(id_attr) = doc.attribute(id, "id").filter(|s| !s.is_empty()) {
        selector.insert("css".into(), json!(format!("#{id_attr}")));
    }
    let mut role = Map::new();
    role.insert("role".into(), json!(n.role.name()));
    if !n.name.is_empty() {
        role.insert("name".into(), json!(n.name));
    }
    selector.insert("role".into(), Value::Object(role));
    el.insert("selector".into(), Value::Object(selector));
    Value::Object(el)
}

fn render_text(nodes: &[SnapshotNode], budget: usize) -> (String, bool) {
    let mut out = String::new();
    let mut parents: Vec<(u16, String)> = Vec::new();
    let mut truncated = false;
    for n in nodes {
        while parents.last().is_some_and(|(d, _)| *d >= n.depth) {
            parents.pop();
        }
        let parent_name = parents.last().map(|(_, s)| s.as_str());
        let skip = match n.role {
            Role::Generic | Role::Presentation => {
                n.name.is_empty() && n.value.is_none() && n.states.is_empty()
            }
            Role::StaticText => parent_name.is_some_and(|p| p == n.name),
            _ => false,
        };
        if !skip {
            let mut line = String::new();
            for _ in 0..parents.len() {
                line.push_str("  ");
            }
            line.push_str("- ");
            line.push_str(n.role.name());
            if let Some(l) = n.level {
                line.push_str(&format!(" h{l}"));
            }
            if !n.name.is_empty() {
                line.push_str(&format!(" {:?}", n.name));
            }
            if n.role != Role::StaticText && n.role != Role::Document {
                line.push_str(&format!(" [{}]", ref_of(n.node)));
            }
            if let Some(v) = &n.value {
                line.push_str(&format!(" value={v:?}"));
            }
            if let Some(h) = &n.href {
                line.push_str(&format!(" href={h:?}"));
            }
            if !n.states.is_empty() {
                line.push_str(&format!(" ({})", n.states.join(", ")));
            }
            line.push('\n');
            if out.len() + line.len() > budget {
                truncated = true;
                break;
            }
            out.push_str(&line);
            parents.push((n.depth, n.name.clone()));
        }
    }
    (out, truncated)
}

/// Builds an `ObservationContent` object from a Full snapshot of `page`.
#[must_use]
pub fn build_content(page: &DomPage, snapshot: &SemanticSnapshot, req: &ObserveRequest) -> Value {
    let scope = req.scope.as_deref().unwrap_or("full");
    let max_elements = req.max_elements.unwrap_or(120);
    let max_text = req.max_text_chars.unwrap_or(6000);
    let nodes = &snapshot.nodes;

    let want_elements = matches!(scope, "full" | "subtree");
    let want_forms = matches!(scope, "full" | "forms" | "subtree");
    let want_links = matches!(scope, "full" | "links" | "subtree");
    let want_tables = matches!(scope, "full" | "tables" | "subtree");

    let mut elements = Vec::new();
    let mut form_fields = Vec::new();
    let mut links = Vec::new();
    let mut headings = Vec::new();
    let mut tables = Vec::new();
    let mut dialogs = Vec::new();
    let mut elements_total = 0usize;

    for (i, n) in nodes.iter().enumerate() {
        match n.role {
            Role::Heading => headings.push(json!(format!("h{} {}", n.level.unwrap_or(2), n.name))),
            Role::Dialog | Role::Alert => {
                dialogs.push(json!({ "type": n.role.name(), "message": n.name }))
            }
            Role::Table if want_tables => {
                let depth = n.depth;
                let mut rows: Vec<Vec<String>> = Vec::new();
                let mut columns: Vec<String> = Vec::new();
                let mut j = i + 1;
                while j < nodes.len() && nodes[j].depth > depth {
                    if nodes[j].role == Role::Row {
                        let row_depth = nodes[j].depth;
                        let mut cells = Vec::new();
                        let mut header = false;
                        let mut k = j + 1;
                        while k < nodes.len() && nodes[k].depth > row_depth {
                            if matches!(
                                nodes[k].role,
                                Role::Cell | Role::ColumnHeader | Role::RowHeader
                            ) {
                                header |= nodes[k].role == Role::ColumnHeader;
                                cells.push(cell_text(nodes, k));
                            }
                            k += 1;
                        }
                        if header && columns.is_empty() {
                            columns = cells;
                        } else {
                            rows.push(cells);
                        }
                        j = k;
                    } else {
                        j += 1;
                    }
                }
                let total = rows.len();
                let truncated = total > 50;
                rows.truncate(50);
                tables.push(json!({
                    "ref": ref_of(n.node),
                    "caption": if n.name.is_empty() { Value::Null } else { json!(n.name) },
                    "columns": columns,
                    "rows": rows,
                    "totalRows": total,
                    "truncated": truncated,
                }));
            }
            _ => {}
        }
        if n.role.is_interactive() || state(n, "focused") {
            elements_total += 1;
            if want_elements && elements.len() < max_elements {
                elements.push(element_ref(page, n));
            }
        }
        if want_forms && is_form_field(n.role) {
            let mut f = Map::new();
            f.insert("ref".into(), json!(ref_of(n.node)));
            if !n.name.is_empty() {
                f.insert("label".into(), json!(n.name));
            }
            if let Some(name) = page.document().attribute(n.node, "name") {
                f.insert("name".into(), json!(name));
            }
            let tag = page.document().element(n.node).map(|e| e.name.as_str());
            let ty = match (page.document().attribute(n.node, "type"), tag) {
                (Some(t), _) => t.to_ascii_lowercase(),
                (None, Some("input")) => "text".to_owned(),
                (None, Some(t @ ("textarea" | "select"))) => t.to_owned(),
                _ => n.role.name().to_owned(),
            };
            f.insert("type".into(), json!(ty));
            if let Some(v) = &n.value {
                f.insert("value".into(), json!(v));
            } else if n.role.is_checkable() {
                f.insert(
                    "value".into(),
                    json!(if state(n, "checked") { "on" } else { "" }),
                );
            }
            if state(n, "required") {
                f.insert("required".into(), json!(true));
            }
            f.insert("valid".into(), json!(!state(n, "invalid")));
            form_fields.push(Value::Object(f));
        }
        if want_links && n.role == Role::Link {
            if let Some(h) = &n.href {
                links.push(json!({ "ref": ref_of(n.node), "text": n.name, "href": h }));
            }
        }
    }

    let (text, text_truncated) = if matches!(scope, "full" | "subtree") {
        render_text(nodes, max_text)
    } else {
        (String::new(), false)
    };
    let viewport = page.viewport();
    let scroll = page.scroll_offset();
    let max_y = (page.layout_tree().content_height() - viewport.height).max(0.0);
    let text_chars = text.chars().count();
    let truncated = text_truncated || elements_total > elements.len();
    let mut tables_capped = tables;
    if tables_capped.len() > 20 {
        tables_capped.truncate(20);
    }
    json!({
        "url": page.url().unwrap_or("about:blank"),
        "title": page.document().title().unwrap_or_default(),
        "viewport": { "width": viewport.width, "height": viewport.height, "scale": 1 },
        "scroll": { "x": scroll.x, "y": scroll.y, "maxY": max_y },
        "frames": [{ "frame": "main", "url": page.url().unwrap_or("about:blank"), "sameOrigin": true }],
        "text": text,
        "headings": headings,
        "elements": elements,
        "formFields": form_fields,
        "tables": tables_capped,
        "links": links,
        "dialogs": dialogs,
        "truncated": truncated,
        "stats": {
            "elementsTotal": elements_total,
            "elementsShown": elements.len(),
            "textChars": text_chars,
            "approxTokens": text_chars.div_ceil(4),
        },
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use ve_a11y::SnapshotFormat;

    const HTML: &str = r#"<title>Shop</title><body>
        <h1>Products</h1>
        <form action=/s><label for=q>Search</label><input id=q name=q placeholder="Find" required><button id=go>Go</button></form>
        <input type=checkbox id=c checked><label for=c>Remember</label>
        <table><tr><th>Name</th><th>Price</th></tr><tr><td>Boot</td><td>10</td></tr><tr><td>Hat</td><td>5</td></tr></table>
        <a href="/next" id=next>Next</a>
        <div><div><p>Some prose</p></div></div></body>"#;

    #[test]
    fn shapes_snapshot_into_observation_content() {
        let page = DomPage::from_html(HTML, Some("https://shop.test/"));
        let snap = page.snapshot(SnapshotFormat::Full);
        let content = build_content(&page, &snap, &ObserveRequest::default());
        assert_eq!(content["url"], "https://shop.test/");
        assert_eq!(content["title"], "Shop");
        assert_eq!(content["headings"][0], "h1 Products");
        let elements = content["elements"].as_array().unwrap();
        assert!(
            elements
                .iter()
                .all(|e| e["ref"].as_str().unwrap().starts_with('r'))
        );
        let go = elements.iter().find(|e| e["name"] == "Go").expect("button");
        assert_eq!(go["role"], "button");
        assert_eq!(go["tag"], "button");
        assert_eq!(go["selector"]["css"], "#go");
        assert_eq!(go["selector"]["role"]["role"], "button");
        assert!(go["rect"]["w"].as_f64().unwrap() > 0.0);
        let cb = elements
            .iter()
            .find(|e| e["type"] == "checkbox")
            .expect("checkbox");
        assert_eq!(cb["checked"], true);
        let link = elements.iter().find(|e| e["role"] == "link").expect("link");
        assert_eq!(link["href"], "/next");

        let fields = content["formFields"].as_array().unwrap();
        let q = fields.iter().find(|f| f["name"] == "q").expect("field");
        assert_eq!(q["label"], "Search");
        assert_eq!(q["type"], "text");
        assert_eq!(q["required"], true);

        let table = &content["tables"][0];
        assert_eq!(table["columns"], json!(["Name", "Price"]));
        assert_eq!(table["rows"], json!([["Boot", "10"], ["Hat", "5"]]));
        assert_eq!(table["totalRows"], 2);

        assert_eq!(content["links"][0]["href"], "/next");
        let text = content["text"].as_str().unwrap();
        assert!(text.contains("heading h1 \"Products\""), "{text}");
        assert!(text.contains("- text \"Some prose\""), "{text}");
        assert!(
            !text.contains("- generic"),
            "generic wrappers pruned: {text}"
        );
        assert_eq!(content["stats"]["elementsShown"], elements.len());
        assert_eq!(content["truncated"], false);
        assert_eq!(content["viewport"]["width"], 1280.0);

        // budgets
        let small = build_content(
            &page,
            &snap,
            &ObserveRequest {
                max_elements: Some(1),
                max_text_chars: Some(40),
                ..ObserveRequest::default()
            },
        );
        assert_eq!(small["elements"].as_array().unwrap().len(), 1);
        assert_eq!(small["truncated"], true);

        // scopes
        let forms = build_content(
            &page,
            &snap,
            &ObserveRequest {
                scope: Some("forms".into()),
                ..ObserveRequest::default()
            },
        );
        assert!(forms["elements"].as_array().unwrap().is_empty());
        assert!(!forms["formFields"].as_array().unwrap().is_empty());
        assert_eq!(forms["text"], "");

        let mut refs = RefMap::default();
        refs.absorb(&snap);
        let id = go["ref"].as_str().unwrap();
        let idx = parse_ref(id).unwrap();
        assert_eq!(refs.get(idx).map(ref_of).as_deref(), Some(id));
        assert!(parse_ref("css:x").is_none());
    }
}
