//! The accessibility tree.

use serde::{Deserialize, Serialize};
use ve_core::{NodeId, Rect, Revision, Stage};
use ve_dom::{Document, ElementData, NodeKind};
use ve_style::{Display, StyleTree, Visibility};

use crate::accname::{compute_description, compute_name};
use crate::roles::Role;

/// Boolean and tri-state properties of an accessibility node.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct States {
    /// The node has keyboard focus.
    pub focused: bool,
    /// The node can receive focus.
    pub focusable: bool,
    /// The control is disabled.
    pub disabled: bool,
    /// Checked state for checkable roles (`None` when not applicable).
    pub checked: Option<bool>,
    /// Selected state for options/tabs (`None` when not applicable).
    pub selected: Option<bool>,
    /// Expanded state (`aria-expanded`, `<details open>`).
    pub expanded: Option<bool>,
    /// Pressed state for toggle buttons.
    pub pressed: Option<bool>,
    /// The control is required.
    pub required: bool,
    /// The control is read-only.
    pub readonly: bool,
    /// `aria-invalid` is set.
    pub invalid: bool,
    /// The element is the current item (`aria-current`).
    pub current: bool,
}

impl States {
    /// Names of the states that are set, for compact serialisation.
    #[must_use]
    pub fn active(&self) -> Vec<&'static str> {
        let mut out = Vec::new();
        if self.focused {
            out.push("focused");
        }
        if self.disabled {
            out.push("disabled");
        }
        match self.checked {
            Some(true) => out.push("checked"),
            Some(false) => out.push("unchecked"),
            None => {}
        }
        if self.selected == Some(true) {
            out.push("selected");
        }
        match self.expanded {
            Some(true) => out.push("expanded"),
            Some(false) => out.push("collapsed"),
            None => {}
        }
        if self.pressed == Some(true) {
            out.push("pressed");
        }
        if self.required {
            out.push("required");
        }
        if self.readonly {
            out.push("readonly");
        }
        if self.invalid {
            out.push("invalid");
        }
        if self.current {
            out.push("current");
        }
        out
    }
}

/// One node of the accessibility tree.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct AccessibilityNode {
    /// The DOM node (the agent reference).
    pub id: NodeId,
    /// Role.
    pub role: Role,
    /// Accessible name (may be empty).
    pub name: String,
    /// Accessible description (may be empty).
    pub description: String,
    /// Current value for controls (text fields, sliders, comboboxes).
    pub value: Option<String>,
    /// States.
    pub states: States,
    /// Heading level (1–6) or `aria-level`.
    pub level: Option<u8>,
    /// Link target.
    pub href: Option<String>,
    /// Element local name (`text` for text nodes).
    pub tag: String,
    /// Border-box bounds if layout information was supplied.
    pub bounds: Option<Rect>,
    /// Children.
    pub children: Vec<AccessibilityNode>,
}

impl AccessibilityNode {
    /// Depth-first iterator over this node and its descendants.
    pub fn iter(&self) -> impl Iterator<Item = &AccessibilityNode> {
        let mut stack = vec![self];
        std::iter::from_fn(move || {
            let next = stack.pop()?;
            stack.extend(next.children.iter().rev());
            Some(next)
        })
    }
}

/// Inputs for building a tree beyond the document itself.
#[derive(Clone, Copy, Default)]
pub struct BuildOptions<'a> {
    /// Computed styles, used to exclude `display: none` / `visibility: hidden`.
    pub styles: Option<&'a StyleTree>,
    /// Geometry lookup, used to fill [`AccessibilityNode::bounds`].
    pub bounds: Option<&'a dyn Fn(NodeId) -> Option<Rect>>,
    /// The focused element.
    pub focused: Option<NodeId>,
}

/// The accessibility tree of a document at a revision.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct AccessibilityTree {
    /// Root node (role `document`).
    pub root: AccessibilityNode,
    /// Document revision the tree was built from.
    pub revision: Revision,
}

impl AccessibilityTree {
    /// Builds the tree.
    #[must_use]
    pub fn build(doc: &Document, options: &BuildOptions<'_>) -> Self {
        let span = Stage::Snapshot.span();
        let _guard = span.enter();
        let builder = Builder { doc, options };
        let root_id = doc.document_element().unwrap_or(doc.root());
        let mut root = builder.node_for(root_id, Role::Document);
        root.name = doc.title().unwrap_or_default();
        if let Some(body) = doc.body() {
            builder.build_children(body, &mut root.children);
        } else if doc.document_element().is_some() {
            builder.build_children(root_id, &mut root.children);
        }
        Self {
            root,
            revision: doc.revision(),
        }
    }

    /// Finds the node for a DOM id.
    #[must_use]
    pub fn find(&self, id: NodeId) -> Option<&AccessibilityNode> {
        self.root.iter().find(|n| n.id == id)
    }

    /// Depth-first iterator over all nodes.
    pub fn iter(&self) -> impl Iterator<Item = &AccessibilityNode> {
        self.root.iter()
    }
}

struct Builder<'a> {
    doc: &'a Document,
    options: &'a BuildOptions<'a>,
}

impl Builder<'_> {
    fn is_excluded(&self, id: NodeId, element: &ElementData) -> bool {
        if matches!(
            element.name.as_str(),
            "script" | "style" | "template" | "noscript" | "head" | "meta" | "link" | "title"
        ) {
            return true;
        }
        if element.has_attr("hidden")
            || element
                .attr("aria-hidden")
                .is_some_and(|v| v.eq_ignore_ascii_case("true"))
        {
            return true;
        }
        if element.is_html("input")
            && element
                .attr("type")
                .is_some_and(|t| t.eq_ignore_ascii_case("hidden"))
        {
            return true;
        }
        if let Some(styles) = self.options.styles
            && let Some(style) = styles.get(id)
            && (style.display == Display::None || style.visibility != Visibility::Visible)
        {
            return true;
        }
        false
    }

    /// Whether any descendant element (light tree) has an interactive role.
    fn has_interactive_descendant(&self, id: NodeId) -> bool {
        self.doc.descendants(id).any(|d| {
            self.doc.get(d).is_some_and(ve_dom::Node::is_element)
                && Role::for_element(self.doc, d).is_some_and(Role::is_interactive)
        })
    }

    fn build_children(&self, parent: NodeId, out: &mut Vec<AccessibilityNode>) {
        // A shadow host exposes its shadow tree instead of its light children
        // (slot assignment is not modelled yet).
        let container = self.doc.shadow_root(parent).unwrap_or(parent);
        for child in self.doc.children(container) {
            let Some(node) = self.doc.get(child) else {
                continue;
            };
            match &node.kind {
                NodeKind::Text(text) => {
                    let normalized = text.split_whitespace().collect::<Vec<_>>().join(" ");
                    if !normalized.is_empty() {
                        out.push(AccessibilityNode {
                            id: child,
                            role: Role::StaticText,
                            name: normalized,
                            description: String::new(),
                            value: None,
                            states: States::default(),
                            level: None,
                            href: None,
                            tag: "text".into(),
                            bounds: self.options.bounds.and_then(|f| f(child)),
                            children: Vec::new(),
                        });
                    }
                }
                NodeKind::Element(element) => {
                    if self.is_excluded(child, element) {
                        continue;
                    }
                    let Some(role) = Role::for_element(self.doc, child) else {
                        continue;
                    };
                    let mut acc = self.node_for(child, role);
                    // Leaf-like widgets (buttons, links, options…) whose name already
                    // captures their content are exposed without children, unless
                    // something interactive is nested inside them.
                    let leaf_like = matches!(
                        role,
                        Role::Button
                            | Role::Link
                            | Role::Tab
                            | Role::MenuItem
                            | Role::Option
                            | Role::Checkbox
                            | Role::Radio
                            | Role::Switch
                            | Role::Tooltip
                    ) && !acc.name.is_empty()
                        && !self.has_interactive_descendant(child);
                    if !leaf_like {
                        self.build_children(child, &mut acc.children);
                    }
                    out.push(acc);
                }
                _ => {}
            }
        }
    }

    fn node_for(&self, id: NodeId, role: Role) -> AccessibilityNode {
        let doc = self.doc;
        let Some(element) = doc.element(id) else {
            return AccessibilityNode {
                id,
                role,
                name: String::new(),
                description: String::new(),
                value: None,
                states: States::default(),
                level: None,
                href: None,
                tag: String::new(),
                bounds: None,
                children: Vec::new(),
            };
        };
        let name = compute_name(doc, id);
        let description = compute_description(doc, id, &name);
        let aria_bool = |attr: &str| element.attr(attr).map(|v| v.eq_ignore_ascii_case("true"));
        let is_input_type = |types: &[&str]| {
            element.is_html("input")
                && element
                    .attr("type")
                    .map(str::to_ascii_lowercase)
                    .is_some_and(|t| types.contains(&t.as_str()))
        };
        let disabled = element.has_attr("disabled")
            || aria_bool("aria-disabled") == Some(true)
            || doc.ancestors(id).any(|a| {
                doc.element(a)
                    .is_some_and(|e| e.is_html("fieldset") && e.has_attr("disabled"))
            });
        let checked = if role.is_checkable() {
            Some(match element.attr("aria-checked") {
                Some(v) => v.eq_ignore_ascii_case("true"),
                None => doc.is_checked(id),
            })
        } else {
            None
        };
        let selected = if role == Role::Option {
            Some(doc.is_selected(id) || aria_bool("aria-selected") == Some(true))
        } else if matches!(role, Role::Tab | Role::Row | Role::Cell | Role::TreeItem) {
            aria_bool("aria-selected")
        } else {
            None
        };
        let expanded = aria_bool("aria-expanded").or_else(|| {
            (element.is_html("details") || element.is_html("summary")).then(|| {
                let details = if element.is_html("details") {
                    Some(id)
                } else {
                    doc.parent(id)
                };
                details
                    .and_then(|d| doc.element(d))
                    .is_some_and(|d| d.has_attr("open"))
            })
        });
        let pressed = aria_bool("aria-pressed");
        let native_focusable = matches!(
            element.name.as_str(),
            "input" | "button" | "select" | "textarea" | "summary" | "iframe"
        ) || (element.is_html("a") && element.has_attr("href"));
        let focusable = !disabled
            && (element.has_attr("tabindex") || role.is_interactive() || native_focusable);
        let states = States {
            focused: self.options.focused == Some(id),
            focusable,
            disabled,
            checked,
            selected,
            expanded,
            pressed,
            required: element.has_attr("required") || aria_bool("aria-required") == Some(true),
            readonly: element.has_attr("readonly") || aria_bool("aria-readonly") == Some(true),
            invalid: element
                .attr("aria-invalid")
                .is_some_and(|v| !v.eq_ignore_ascii_case("false")),
            current: element
                .attr("aria-current")
                .is_some_and(|v| !v.eq_ignore_ascii_case("false")),
        };
        let value = match role {
            Role::TextBox | Role::SearchBox | Role::SpinButton | Role::Slider => doc.form_value(id),
            Role::Combobox | Role::ListBox if element.is_html("select") => {
                selected_option_text(doc, id)
            }
            Role::Combobox => doc.form_value(id),
            Role::ProgressBar => element.attr("value").map(str::to_owned),
            _ => element
                .attr("aria-valuetext")
                .or(element.attr("aria-valuenow"))
                .map(str::to_owned),
        }
        .filter(|_| !is_input_type(&["checkbox", "radio", "button", "submit", "reset"]));
        let level = element.attr("aria-level").and_then(|v| v.parse().ok()).or(
            match element.name.as_str() {
                "h1" => Some(1),
                "h2" => Some(2),
                "h3" => Some(3),
                "h4" => Some(4),
                "h5" => Some(5),
                "h6" => Some(6),
                _ => None,
            },
        );
        let href = (role == Role::Link)
            .then(|| element.attr("href").map(str::to_owned))
            .flatten();
        AccessibilityNode {
            id,
            role,
            name,
            description,
            value,
            states,
            level,
            href,
            tag: element.name.clone(),
            bounds: self.options.bounds.and_then(|f| f(id)),
            children: Vec::new(),
        }
    }
}

/// Text of the selected `<option>` of a `<select>` (first option if none is
/// explicitly selected, per HTML's selectedness setting algorithm).
fn selected_option_text(doc: &Document, select: NodeId) -> Option<String> {
    let options: Vec<NodeId> = doc
        .descendants(select)
        .filter(|&d| doc.element(d).is_some_and(|e| e.is_html("option")))
        .collect();
    let chosen = options
        .iter()
        .copied()
        .find(|&o| doc.is_selected(o))
        .or_else(|| options.first().copied())?;
    let text = doc
        .attribute(chosen, "label")
        .map_or_else(|| doc.text_content(chosen), str::to_owned);
    Some(text.split_whitespace().collect::<Vec<_>>().join(" "))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn builds_roles_names_states_and_values() {
        let html = r#"<title>Shop</title><body>
            <nav><a href="/x">Home</a></nav>
            <h2>Cart</h2>
            <label for=q>Search</label><input id=q value="shoes" required>
            <input type=checkbox id=c checked aria-label="Gift">
            <select aria-label="Size"><option>S<option selected>M</select>
            <button disabled>Buy</button>
            <div hidden>nope</div><script>x()</script>
            <details open><summary>More</summary><p>Body</p></details>
        </body>"#;
        let doc = ve_html::parse_document(html).document;
        let q = doc.element_by_id("q").unwrap();
        let tree = AccessibilityTree::build(
            &doc,
            &BuildOptions {
                focused: Some(q),
                ..BuildOptions::default()
            },
        );
        assert_eq!(tree.root.role, Role::Document);
        assert_eq!(tree.root.name, "Shop");

        let by_role = |role: Role| {
            tree.iter()
                .filter(move |n| n.role == role)
                .collect::<Vec<_>>()
        };
        let link = &by_role(Role::Link)[0];
        assert_eq!(
            (link.name.as_str(), link.href.as_deref()),
            ("Home", Some("/x"))
        );
        assert!(
            link.children.is_empty(),
            "name-from-content links do not repeat text children"
        );
        let heading = &by_role(Role::Heading)[0];
        assert_eq!((heading.name.as_str(), heading.level), ("Cart", Some(2)));
        let textbox = &by_role(Role::TextBox)[0];
        assert_eq!(textbox.name, "Search");
        assert_eq!(textbox.value.as_deref(), Some("shoes"));
        assert!(textbox.states.focused && textbox.states.required);
        let checkbox = &by_role(Role::Checkbox)[0];
        assert_eq!(
            (checkbox.name.as_str(), checkbox.states.checked),
            ("Gift", Some(true))
        );
        let combo = &by_role(Role::Combobox)[0];
        assert_eq!(combo.value.as_deref(), Some("M"));
        let button = &by_role(Role::Button)[0];
        assert!(button.states.disabled && !button.states.focusable);
        assert!(
            tree.iter().all(|n| n.name != "nope" && n.tag != "script"),
            "hidden and script excluded"
        );
        let summary = tree.iter().find(|n| n.tag == "summary").unwrap();
        assert_eq!(summary.states.expanded, Some(true));
        assert!(tree.find(q).is_some());
    }
}
