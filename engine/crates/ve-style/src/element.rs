//! Adapter exposing `ve-dom` nodes to the `selectors` matching algorithm.

use std::collections::HashMap;
use std::fmt;

use selectors::attr::{AttrSelectorOperation, CaseSensitivity, NamespaceConstraint};
use selectors::bloom::BloomFilter;
use selectors::context::MatchingContext;
use selectors::matching::ElementSelectorFlags;
use selectors::{Element, OpaqueElement};
use ve_dom::{Document, ElementData, Namespace, NodeId, NodeKind};

use crate::selector_impl::{CssString, PseudoClass, PseudoElement, VeSelectorImpl};

fn lang_matches(have: &str, want: &str) -> bool {
    if have.is_empty() || want.is_empty() {
        return false;
    }
    let have = have.to_ascii_lowercase();
    let want = want.to_ascii_lowercase();
    have == want || have.starts_with(&format!("{want}-"))
}

fn pragma_language(doc: &Document) -> Option<String> {
    for id in doc.elements() {
        let Some(el) = doc.element(id) else {
            continue;
        };
        if !el.is_html("meta") {
            continue;
        }
        let Some(equiv) = doc.attribute(id, "http-equiv") else {
            continue;
        };
        if !equiv.eq_ignore_ascii_case("content-language") {
            continue;
        }
        let Some(content) = doc.attribute(id, "content") else {
            continue;
        };
        let tag = content
            .split(',')
            .next()
            .unwrap_or("")
            .trim()
            .split_ascii_whitespace()
            .next()
            .unwrap_or("");
        if !tag.is_empty() {
            return Some(tag.to_owned());
        }
    }
    None
}

fn first_strong_dir(text: &str) -> Option<&'static str> {
    for ch in text.chars() {
        if matches!(
            ch,
            '\u{0590}'..='\u{08FF}' | '\u{FB1D}'..='\u{FDFF}' | '\u{FE70}'..='\u{FEFF}'
        ) {
            return Some("rtl");
        }
        if ch.is_ascii_alphabetic() {
            return Some("ltr");
        }
    }
    None
}

pub(crate) fn auto_dir_text(doc: &Document, id: NodeId) -> String {
    let el = doc.element(id);
    if el.is_some_and(|e| e.is_html("input") || e.is_html("textarea")) {
        return doc.form_value(id).unwrap_or_default();
    }
    let mut out = String::new();
    collect_auto_dir_text(doc, id, true, &mut out);
    out
}

fn collect_auto_dir_text(doc: &Document, id: NodeId, is_root: bool, out: &mut String) {
    match doc.get(id).map(|n| &n.kind) {
        Some(NodeKind::Text(t)) => {
            out.push_str(t);
            return;
        }
        Some(NodeKind::Element(_)) => {}
        _ => return,
    }
    let Some(el) = doc.element(id) else {
        return;
    };
    if !is_root && (el.attr("dir").is_some() || el.is_html("bdi")) {
        return;
    }
    if el.is_html("script") || el.is_html("style") {
        return;
    }
    if !is_root && (el.is_html("input") || el.is_html("textarea")) {
        return;
    }
    if el.is_html("slot") {
        if !is_root {
            if let Some(host) = doc
                .containing_shadow_root(id)
                .and_then(|shadow| doc.host(shadow))
            {
                if html_direction(doc, host) == "rtl" {
                    out.push('\u{05D0}');
                } else {
                    out.push('A');
                }
            }
            return;
        }
        let assigned = doc.assigned_nodes(id);
        if !assigned.is_empty() {
            for n in assigned {
                collect_auto_dir_text(doc, n, false, out);
            }
            return;
        }
    }
    let mut child = doc.first_child(id);
    while let Some(n) = child {
        collect_auto_dir_text(doc, n, false, out);
        child = doc.next_sibling(n);
    }
}

fn html_parent(doc: &Document, id: NodeId) -> Option<NodeId> {
    let p = doc.parent(id)?;
    if doc
        .get(p)
        .is_some_and(|n| matches!(n.kind, NodeKind::ShadowRoot { .. }))
    {
        return doc.host(p);
    }
    Some(p)
}

fn html_direction(doc: &Document, id: NodeId) -> String {
    let mut cur = Some(id);
    while let Some(n) = cur {
        if let Some(el) = doc.element(n) {
            let dir = el.attr("dir").map(str::to_ascii_lowercase);
            match dir.as_deref() {
                Some("ltr") => return "ltr".into(),
                Some("rtl") => return "rtl".into(),
                Some("auto") => {
                    return first_strong_dir(&auto_dir_text(doc, n))
                        .unwrap_or("ltr")
                        .into();
                }
                _ if el.is_html("bdi") => {
                    return first_strong_dir(&auto_dir_text(doc, n))
                        .unwrap_or("ltr")
                        .into();
                }
                _ => {}
            }
        }
        cur = html_parent(doc, n);
    }
    "ltr".into()
}

fn language_of(doc: &Document, id: NodeId) -> Option<String> {
    let mut cur = Some(id);
    while let Some(n) = cur {
        if let Some(el) = doc.element(n)
            && let Some(v) = el.attr("lang")
        {
            if v.is_empty() {
                return None;
            }
            return Some(v.to_owned());
        }
        cur = doc.parent(n);
    }
    if let Some(p) = pragma_language(doc) {
        return Some(p);
    }
    doc.content_language().map(str::to_owned)
}

/// Per-element user-interaction state that selectors can observe.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct ElementState {
    /// The pointer is over the element (or a descendant).
    pub hover: bool,
    /// The element is being activated (mouse down).
    pub active: bool,
    /// The element has keyboard focus.
    pub focus: bool,
    /// Focus should be rendered (`:focus-visible`).
    pub focus_visible: bool,
    /// The element is the URL fragment target.
    pub target: bool,
}

/// Interaction state for a whole document. Owned by the embedder / agent
/// layer and passed to the style engine at compute time.
#[derive(Clone, Debug, Default)]
pub struct InteractionState {
    states: HashMap<NodeId, ElementState>,
    focused: Option<NodeId>,
}

impl InteractionState {
    /// Creates an empty state (nothing hovered, focused or active).
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// State of `id` (default if untouched).
    #[must_use]
    pub fn get(&self, id: NodeId) -> ElementState {
        self.states.get(&id).copied().unwrap_or_default()
    }

    /// The focused element, if any.
    #[must_use]
    pub fn focused(&self) -> Option<NodeId> {
        self.focused
    }

    /// Moves focus to `id` (or clears it with `None`).
    pub fn set_focus(&mut self, id: Option<NodeId>, visible: bool) {
        if let Some(old) = self.focused.take() {
            let s = self.states.entry(old).or_default();
            s.focus = false;
            s.focus_visible = false;
        }
        if let Some(new) = id {
            let s = self.states.entry(new).or_default();
            s.focus = true;
            s.focus_visible = visible;
        }
        self.focused = id;
    }

    /// Sets hover on exactly the nodes in `chain` (the hovered element and
    /// its ancestors), clearing it everywhere else.
    pub fn set_hover_chain(&mut self, chain: &[NodeId]) {
        for s in self.states.values_mut() {
            s.hover = false;
        }
        for id in chain {
            self.states.entry(*id).or_default().hover = true;
        }
    }

    /// Sets or clears the active state of `id`.
    pub fn set_active(&mut self, id: NodeId, active: bool) {
        self.states.entry(id).or_default().active = active;
    }

    /// Sets or clears the `:target` state of `id`.
    pub fn set_target(&mut self, id: Option<NodeId>) {
        for s in self.states.values_mut() {
            s.target = false;
        }
        if let Some(id) = id {
            self.states.entry(id).or_default().target = true;
        }
    }
}

/// A DOM element viewed through the [`selectors::Element`] trait.
#[derive(Clone)]
pub struct DomElement<'a> {
    /// The owning document.
    pub doc: &'a Document,
    /// Interaction state used for user-action pseudo-classes.
    pub interaction: &'a InteractionState,
    /// The element id.
    pub id: NodeId,
    /// When matching rules for a pseudo-element (`a::before`), the
    /// pseudo-element being styled; `None` for the element itself.
    pub pseudo: Option<PseudoElement>,
}

impl fmt::Debug for DomElement<'_> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self.doc.element(self.id) {
            Some(e) => write!(f, "<{} {}>", e.name, self.id),
            None => write!(f, "<stale {}>", self.id),
        }
    }
}

impl<'a> DomElement<'a> {
    /// Wraps `id`, which must be a live element.
    #[must_use]
    pub fn new(doc: &'a Document, interaction: &'a InteractionState, id: NodeId) -> Self {
        Self {
            doc,
            interaction,
            id,
            pseudo: None,
        }
    }

    /// Wraps `id` for matching rules that target `pseudo` on it.
    #[must_use]
    pub fn for_pseudo(
        doc: &'a Document,
        interaction: &'a InteractionState,
        id: NodeId,
        pseudo: PseudoElement,
    ) -> Self {
        Self {
            doc,
            interaction,
            id,
            pseudo: Some(pseudo),
        }
    }

    fn data(&self) -> &'a ElementData {
        self.doc
            .element(self.id)
            .expect("DomElement wraps a live element")
    }

    fn wrap(&self, id: NodeId) -> Self {
        Self {
            doc: self.doc,
            interaction: self.interaction,
            id,
            pseudo: None,
        }
    }

    fn sibling_element(&self, mut next: impl FnMut(NodeId) -> Option<NodeId>) -> Option<Self> {
        let mut cur = next(self.id);
        while let Some(id) = cur {
            if self.doc.get(id)?.is_element() {
                return Some(self.wrap(id));
            }
            cur = next(id);
        }
        None
    }

    fn is_form_control(e: &ElementData) -> bool {
        e.namespace == Namespace::Html
            && matches!(
                e.name.as_str(),
                "input" | "button" | "select" | "textarea" | "option" | "optgroup" | "fieldset"
            )
    }

    fn is_disabled(&self) -> bool {
        let e = self.data();
        if !Self::is_form_control(e) {
            return false;
        }
        if e.has_attr("disabled") {
            return true;
        }
        // Descendants of a disabled <fieldset> are disabled too.
        self.doc.ancestors(self.id).any(|a| {
            self.doc
                .element(a)
                .is_some_and(|x| x.is_html("fieldset") && x.has_attr("disabled"))
        })
    }

    fn is_text_entry(e: &ElementData) -> bool {
        e.is_html("textarea")
            || (e.is_html("input")
                && !matches!(
                    e.attr("type").map(str::to_ascii_lowercase).as_deref(),
                    Some(
                        "checkbox"
                            | "radio"
                            | "button"
                            | "submit"
                            | "reset"
                            | "hidden"
                            | "file"
                            | "image"
                            | "range"
                            | "color"
                    )
                ))
    }
}

impl Element for DomElement<'_> {
    type Impl = VeSelectorImpl;

    fn opaque(&self) -> OpaqueElement {
        OpaqueElement::new(self.doc.get(self.id).expect("live element"))
    }

    fn parent_element(&self) -> Option<Self> {
        let parent = self.doc.parent(self.id)?;
        self.doc
            .get(parent)?
            .is_element()
            .then(|| self.wrap(parent))
    }

    fn parent_node_is_shadow_root(&self) -> bool {
        self.doc
            .parent(self.id)
            .and_then(|p| self.doc.get(p))
            .is_some_and(|n| matches!(n.kind, NodeKind::ShadowRoot { .. }))
    }

    fn containing_shadow_host(&self) -> Option<Self> {
        let mut cur = self.doc.parent(self.id);
        while let Some(id) = cur {
            let node = self.doc.get(id)?;
            if matches!(node.kind, NodeKind::ShadowRoot { .. }) {
                return node.host().map(|h| self.wrap(h));
            }
            cur = node.parent();
        }
        None
    }

    fn is_pseudo_element(&self) -> bool {
        false
    }

    fn prev_sibling_element(&self) -> Option<Self> {
        self.sibling_element(|id| self.doc.prev_sibling(id))
    }

    fn next_sibling_element(&self) -> Option<Self> {
        self.sibling_element(|id| self.doc.next_sibling(id))
    }

    fn first_element_child(&self) -> Option<Self> {
        self.doc
            .children(self.id)
            .find(|&c| self.doc.get(c).is_some_and(ve_dom::Node::is_element))
            .map(|c| self.wrap(c))
    }

    fn is_html_element_in_html_document(&self) -> bool {
        self.data().namespace == Namespace::Html
    }

    fn has_local_name(&self, local_name: &str) -> bool {
        self.data().name == local_name
    }

    fn has_namespace(&self, ns: &str) -> bool {
        self.data().namespace.uri() == ns
    }

    fn is_same_type(&self, other: &Self) -> bool {
        let (a, b) = (self.data(), other.data());
        a.name == b.name && a.namespace == b.namespace
    }

    fn attr_matches(
        &self,
        ns: &NamespaceConstraint<&CssString>,
        local_name: &CssString,
        operation: &AttrSelectorOperation<&CssString>,
    ) -> bool {
        if let NamespaceConstraint::Specific(url) = ns
            && !url.is_empty()
        {
            // Namespaced attribute selectors are not supported yet.
            return false;
        }
        let e = self.data();
        let value = if e.namespace == Namespace::Html {
            e.attributes
                .iter()
                .find(|a| a.name.eq_ignore_ascii_case(local_name))
                .map(|a| a.value.as_str())
        } else {
            e.attr(local_name)
        };
        value.is_some_and(|v| operation.eval_str(v))
    }

    fn match_non_ts_pseudo_class(
        &self,
        pc: &PseudoClass,
        _context: &mut MatchingContext<VeSelectorImpl>,
    ) -> bool {
        let e = self.data();
        let state = self.interaction.get(self.id);
        match pc {
            PseudoClass::Hover => state.hover,
            PseudoClass::Active => state.active,
            PseudoClass::Focus => state.focus,
            PseudoClass::FocusVisible => state.focus_visible,
            PseudoClass::FocusWithin => self
                .interaction
                .focused()
                .is_some_and(|f| f == self.id || self.doc.is_ancestor_of(self.id, f)),
            PseudoClass::Enabled => Self::is_form_control(e) && !self.is_disabled(),
            PseudoClass::Disabled => self.is_disabled(),
            PseudoClass::Checked => {
                if e.is_html("option") {
                    self.doc.is_selected(self.id)
                } else {
                    e.is_html("input")
                        && matches!(
                            e.attr("type").map(str::to_ascii_lowercase).as_deref(),
                            Some("checkbox" | "radio")
                        )
                        && self.doc.is_checked(self.id)
                }
            }
            PseudoClass::Link | PseudoClass::AnyLink => self.is_link(),
            PseudoClass::Visited => false,
            PseudoClass::Target => state.target,
            PseudoClass::Required => Self::is_form_control(e) && e.has_attr("required"),
            PseudoClass::Optional => Self::is_form_control(e) && !e.has_attr("required"),
            PseudoClass::ReadWrite => {
                Self::is_text_entry(e) && !e.has_attr("readonly") && !self.is_disabled()
            }
            PseudoClass::ReadOnly => {
                !(Self::is_text_entry(e) && !e.has_attr("readonly") && !self.is_disabled())
            }
            PseudoClass::PlaceholderShown => {
                Self::is_text_entry(e)
                    && e.attr("placeholder").is_some_and(|p| !p.is_empty())
                    && self.doc.form_value(self.id).unwrap_or_default().is_empty()
            }
            PseudoClass::Defined => true,
            PseudoClass::Lang(tag) => {
                language_of(self.doc, self.id).is_some_and(|have| lang_matches(&have, tag.as_str()))
            }
            PseudoClass::Dir(dir) => {
                html_direction(self.doc, self.id) == dir.as_str().to_ascii_lowercase()
            }
        }
    }

    fn match_pseudo_element(
        &self,
        pe: &PseudoElement,
        _context: &mut MatchingContext<VeSelectorImpl>,
    ) -> bool {
        self.pseudo == Some(*pe)
    }

    fn apply_selector_flags(&self, _flags: ElementSelectorFlags) {}

    fn is_link(&self) -> bool {
        let e = self.data();
        e.namespace == Namespace::Html
            && matches!(e.name.as_str(), "a" | "area" | "link")
            && e.has_attr("href")
    }

    fn is_html_slot_element(&self) -> bool {
        self.data().is_html("slot")
    }

    fn has_id(&self, id: &CssString, case_sensitivity: CaseSensitivity) -> bool {
        self.data()
            .id()
            .is_some_and(|v| case_sensitivity.eq(v.as_bytes(), id.as_bytes()))
    }

    fn has_class(&self, name: &CssString, case_sensitivity: CaseSensitivity) -> bool {
        self.data()
            .classes()
            .any(|c| case_sensitivity.eq(c.as_bytes(), name.as_bytes()))
    }

    fn has_custom_state(&self, _name: &CssString) -> bool {
        false
    }

    fn imported_part(&self, _name: &CssString) -> Option<CssString> {
        None
    }

    fn is_part(&self, _name: &CssString) -> bool {
        false
    }

    fn is_empty(&self) -> bool {
        self.doc
            .children(self.id)
            .all(|c| match self.doc.get(c).map(|n| &n.kind) {
                Some(NodeKind::Text(t)) => t.is_empty(),
                Some(NodeKind::Comment(_) | NodeKind::ProcessingInstruction { .. }) => true,
                _ => false,
            })
    }

    fn is_root(&self) -> bool {
        self.doc
            .parent(self.id)
            .and_then(|p| self.doc.get(p))
            .is_some_and(|n| matches!(n.kind, NodeKind::Document))
    }

    fn add_element_unique_hashes(&self, _filter: &mut BloomFilter) -> bool {
        false
    }
}
