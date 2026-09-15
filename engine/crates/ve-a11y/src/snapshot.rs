//! Semantic snapshots: serialisable, diffable flattenings of the
//! accessibility tree.

use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use ve_core::{NodeId, Rect, Revision};
use ve_dom::Document;

use crate::roles::Role;
use crate::tree::{AccessibilityNode, AccessibilityTree};

/// How much detail a snapshot carries.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SnapshotFormat {
    /// Agent-oriented: generic unnamed wrappers are pruned (children promoted),
    /// text that merely repeats a parent's name is dropped, no geometry,
    /// descriptions or tag names.
    #[default]
    Compact,
    /// Every node with every attribute, including bounds and tags.
    Full,
}

/// One row of a snapshot.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct SnapshotNode {
    /// Agent reference (the DOM node id).
    #[serde(rename = "ref")]
    pub node: NodeId,
    /// Nesting depth (0 for the document).
    pub depth: u16,
    /// Role.
    pub role: Role,
    /// Accessible name.
    #[serde(default, skip_serializing_if = "String::is_empty")]
    pub name: String,
    /// Accessible description (full format only).
    #[serde(default, skip_serializing_if = "String::is_empty")]
    pub description: String,
    /// Current value for controls.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
    /// Active states.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub states: Vec<String>,
    /// Heading level.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub level: Option<u8>,
    /// Link target (full format only).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub href: Option<String>,
    /// Element tag (full format only).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub tag: Option<String>,
    /// Bounds (full format only, when layout was available).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub bounds: Option<Rect>,
}

/// A flattened accessibility tree.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct SemanticSnapshot {
    /// Format the snapshot was captured in.
    pub format: SnapshotFormat,
    /// Document revision.
    pub revision: Revision,
    /// Document title.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    /// Document URL, if known to the caller.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    /// Nodes in document order.
    pub nodes: Vec<SnapshotNode>,
}

impl SemanticSnapshot {
    /// Captures a snapshot of `tree`.
    #[must_use]
    pub fn capture(tree: &AccessibilityTree, format: SnapshotFormat) -> Self {
        let mut nodes = Vec::new();
        flatten(&tree.root, 0, None, format, &mut nodes);
        Self {
            format,
            revision: tree.revision,
            title: (!tree.root.name.is_empty()).then(|| tree.root.name.clone()),
            url: None,
            nodes,
        }
    }

    /// Attaches the document URL.
    #[must_use]
    pub fn with_url(mut self, url: impl Into<String>) -> Self {
        self.url = Some(url.into());
        self
    }

    /// Finds the row for a reference.
    #[must_use]
    pub fn get(&self, node: NodeId) -> Option<&SnapshotNode> {
        self.nodes.iter().find(|n| n.node == node)
    }

    /// Human/agent readable outline, one node per line:
    /// `- role "name" [ref=n12.0] value="…" (state, state)`.
    #[must_use]
    pub fn to_text(&self) -> String {
        let mut out = String::new();
        for n in &self.nodes {
            for _ in 0..n.depth {
                out.push_str("  ");
            }
            out.push_str("- ");
            out.push_str(n.role.name());
            if let Some(level) = n.level {
                out.push_str(&format!(" h{level}"));
            }
            if !n.name.is_empty() {
                out.push_str(&format!(" {:?}", n.name));
            }
            out.push_str(&format!(" [ref={}]", n.node));
            if let Some(v) = &n.value {
                out.push_str(&format!(" value={v:?}"));
            }
            if let Some(h) = &n.href {
                out.push_str(&format!(" href={h:?}"));
            }
            if !n.states.is_empty() {
                out.push_str(&format!(" ({})", n.states.join(", ")));
            }
            if !n.description.is_empty() {
                out.push_str(&format!(" desc={:?}", n.description));
            }
            if let Some(b) = n.bounds {
                out.push_str(&format!(
                    " @({:.0},{:.0} {:.0}x{:.0})",
                    b.x(),
                    b.y(),
                    b.width(),
                    b.height()
                ));
            }
            out.push('\n');
        }
        out
    }

    /// JSON representation.
    #[must_use]
    pub fn to_json(&self) -> serde_json::Value {
        serde_json::to_value(self).expect("snapshot is serialisable")
    }

    /// Structural diff against an older snapshot of the same document.
    #[must_use]
    pub fn diff(&self, older: &SemanticSnapshot) -> SnapshotDiff {
        let old: HashMap<NodeId, &SnapshotNode> = older.nodes.iter().map(|n| (n.node, n)).collect();
        let new: HashMap<NodeId, &SnapshotNode> = self.nodes.iter().map(|n| (n.node, n)).collect();
        let mut diff = SnapshotDiff {
            from: older.revision,
            to: self.revision,
            ..SnapshotDiff::default()
        };
        for n in &self.nodes {
            match old.get(&n.node) {
                None => diff.added.push(n.node),
                Some(o) if *o != n => diff.changed.push(n.node),
                Some(_) => {}
            }
        }
        for n in &older.nodes {
            if !new.contains_key(&n.node) {
                diff.removed.push(n.node);
            }
        }
        diff
    }
}

/// Result of [`SemanticSnapshot::diff`].
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct SnapshotDiff {
    /// Revision of the older snapshot.
    pub from: Revision,
    /// Revision of the newer snapshot.
    pub to: Revision,
    /// References present only in the newer snapshot.
    pub added: Vec<NodeId>,
    /// References present only in the older snapshot.
    pub removed: Vec<NodeId>,
    /// References whose row changed.
    pub changed: Vec<NodeId>,
}

impl SnapshotDiff {
    /// Returns `true` if nothing changed.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.added.is_empty() && self.removed.is_empty() && self.changed.is_empty()
    }
}

fn flatten(
    node: &AccessibilityNode,
    depth: u16,
    parent_name: Option<&str>,
    format: SnapshotFormat,
    out: &mut Vec<SnapshotNode>,
) {
    let is_document = depth == 0;
    let prune =
        format == SnapshotFormat::Compact && !is_document && should_prune(node, parent_name);
    let child_depth = if prune { depth } else { depth + 1 };
    if !prune {
        out.push(row(node, depth, format));
    }
    let name_for_children = if prune {
        parent_name
    } else {
        Some(node.name.as_str())
    };
    for child in &node.children {
        flatten(child, child_depth, name_for_children, format, out);
    }
}

/// Compact-format pruning rules.
fn should_prune(node: &AccessibilityNode, parent_name: Option<&str>) -> bool {
    match node.role {
        Role::Generic | Role::Presentation => {
            node.name.is_empty() && node.value.is_none() && node.states.active().is_empty()
        }
        Role::StaticText => parent_name.is_some_and(|p| p == node.name),
        _ => false,
    }
}

fn row(node: &AccessibilityNode, depth: u16, format: SnapshotFormat) -> SnapshotNode {
    let full = format == SnapshotFormat::Full;
    SnapshotNode {
        node: node.id,
        depth,
        role: node.role,
        name: node.name.clone(),
        description: if full {
            node.description.clone()
        } else {
            String::new()
        },
        value: node.value.clone(),
        states: node
            .states
            .active()
            .iter()
            .map(|s| (*s).to_owned())
            .collect(),
        level: node.level,
        href: if full { node.href.clone() } else { None },
        tag: full.then(|| node.tag.clone()),
        bounds: if full { node.bounds } else { None },
    }
}

/// References touched since `since`, according to the document's mutation
/// journal, restricted to nodes that still exist. Returns `None` if the
/// journal no longer covers `since` (take a fresh full snapshot instead).
#[must_use]
pub fn changed_refs_since(doc: &Document, since: Revision) -> Option<Vec<NodeId>> {
    Some(
        doc.journal()
            .touched_since(since)?
            .into_iter()
            .filter(|&id| doc.contains(id))
            .collect(),
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tree::BuildOptions;

    const HTML: &str = r#"<title>T</title><body><div><div><nav aria-label="Main"><ul><li><a href="/a">A</a></li></ul></nav></div></div>
        <main><h1>Hello</h1><p>Para text</p><input aria-label="Name" value="v"></main></body>"#;

    #[test]
    fn compact_prunes_wrappers_and_full_keeps_everything() {
        let doc = ve_html::parse_document(HTML).document;
        let tree = AccessibilityTree::build(&doc, &BuildOptions::default());
        let compact = SemanticSnapshot::capture(&tree, SnapshotFormat::Compact);
        let full = SemanticSnapshot::capture(&tree, SnapshotFormat::Full);
        assert!(full.nodes.len() > compact.nodes.len());
        assert!(
            compact.nodes.iter().all(|n| n.role != Role::Generic),
            "generic wrappers pruned"
        );
        assert!(
            full.nodes
                .iter()
                .any(|n| n.role == Role::Generic && n.tag.as_deref() == Some("div"))
        );

        let text = compact.to_text();
        assert!(text.starts_with("- document \"T\" [ref="), "{text}");
        assert!(text.contains("- navigation \"Main\""));
        assert!(
            text.contains("    - list [ref="),
            "list nested directly under nav after pruning: {text}"
        );
        assert!(text.contains("- link \"A\""));
        assert!(text.contains("- heading h1 \"Hello\""));
        assert!(text.contains("- textbox \"Name\" [ref=") && text.contains("value=\"v\""));
        // Paragraph text is kept as a text child (paragraphs do not take name from content).
        assert!(text.contains("- paragraph [ref=") && text.contains("- text \"Para text\""));

        let json = compact.to_json();
        assert_eq!(json["format"], "compact");
        assert!(
            json["nodes"]
                .as_array()
                .unwrap()
                .iter()
                .all(|n| n.get("bounds").is_none())
        );
        let round: SemanticSnapshot = serde_json::from_value(json).unwrap();
        assert_eq!(round, compact);
    }

    #[test]
    fn diff_and_journal_track_changes() {
        let mut doc = ve_html::parse_document(HTML).document;
        let before = SemanticSnapshot::capture(
            &AccessibilityTree::build(&doc, &BuildOptions::default()),
            SnapshotFormat::Compact,
        );
        let rev = doc.revision();

        let input = doc
            .elements()
            .find(|&e| doc.element(e).unwrap().is_html("input"))
            .unwrap();
        doc.set_form_value(input, "changed").unwrap();
        let p = doc
            .elements()
            .find(|&e| doc.element(e).unwrap().is_html("p"))
            .unwrap();
        doc.destroy(p).unwrap();

        let after = SemanticSnapshot::capture(
            &AccessibilityTree::build(&doc, &BuildOptions::default()),
            SnapshotFormat::Compact,
        );
        let diff = after.diff(&before);
        assert_eq!(diff.changed, vec![input]);
        assert!(diff.removed.contains(&p));
        assert!(diff.added.is_empty());
        assert_eq!(
            changed_refs_since(&doc, rev),
            Some(vec![input]),
            "destroyed nodes are filtered out"
        );
        assert!(before.diff(&before).is_empty());
    }
}
