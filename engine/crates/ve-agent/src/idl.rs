//! Generated WebIDL traits implemented over the live `ve-dom` document.

use ve_core::NodeId;
use ve_dom::{Document, Namespace, NodeKind, ShadowRootMode};
use ve_script::JsValue;
use ve_script::generated::{
    DOMImplementationInterface, DocumentInterface, ElementInterface, EventTargetInterface,
    HTMLButtonElementInterface, HTMLCollectionInterface, HTMLElementInterface,
    HTMLFormElementInterface, HTMLInputElementInterface, MediaQueryListInterface, NodeInterface,
    ShadowRootInterface, WindowInterface,
};

use crate::page::{Page, outer_html};

/// A live node handle that implements the generated `Node` interface.
pub(crate) struct LiveNode<'a> {
    doc: &'a mut Document,
    id: NodeId,
}

impl<'a> LiveNode<'a> {
    pub(crate) fn new(doc: &'a mut Document, id: NodeId) -> Self {
        Self { doc, id }
    }

    pub(crate) fn node_name_of(doc: &Document, id: NodeId) -> String {
        match doc.get(id).map(|n| &n.kind) {
            Some(NodeKind::Element(e)) => e.tag_name(),
            Some(NodeKind::Text(_)) => "#text".into(),
            Some(NodeKind::Comment(_)) => "#comment".into(),
            Some(NodeKind::Document) => "#document".into(),
            Some(NodeKind::DocumentFragment | NodeKind::ShadowRoot { .. }) => {
                "#document-fragment".into()
            }
            Some(NodeKind::Doctype { name, .. }) => name.clone(),
            Some(NodeKind::ProcessingInstruction { target, .. }) => target.clone(),
            None => String::new(),
        }
    }
}

impl EventTargetInterface for LiveNode<'_> {
    fn add_event_listener(
        &mut self,
        _type_: String,
        _callback: JsValue,
        _options: Option<JsValue>,
    ) {
    }

    fn remove_event_listener(
        &mut self,
        _type_: String,
        _callback: JsValue,
        _options: Option<JsValue>,
    ) {
    }

    fn dispatch_event(&mut self, _event: JsValue) -> bool {
        true
    }
}

impl NodeInterface for LiveNode<'_> {
    fn node_type(&self) -> u16 {
        self.doc.get(self.id).map_or(0, ve_dom::Node::node_type)
    }

    fn node_name(&self) -> String {
        Self::node_name_of(self.doc, self.id)
    }

    fn node_value(&self) -> Option<String> {
        self.doc
            .get(self.id)
            .and_then(ve_dom::Node::as_character_data)
            .map(ToOwned::to_owned)
    }

    fn set_node_value(&mut self, value: Option<String>) {
        let _ = self.doc.set_text(self.id, value.unwrap_or_default());
    }

    fn text_content(&self) -> Option<String> {
        text_content_of(self.doc, self.id)
    }

    fn set_text_content(&mut self, value: Option<String>) {
        let text = value.unwrap_or_default();
        let kind = self.doc.get(self.id).map(|n| match &n.kind {
            NodeKind::Document | NodeKind::Doctype { .. } => 0u8,
            NodeKind::Text(_) | NodeKind::Comment(_) | NodeKind::ProcessingInstruction { .. } => 1,
            NodeKind::Element(_) | NodeKind::DocumentFragment | NodeKind::ShadowRoot { .. } => 2,
        });
        match kind {
            Some(1) => {
                let _ = self.doc.set_text(self.id, text);
            }
            Some(2) => {
                let kids: Vec<_> = self.doc.children(self.id).collect();
                for kid in kids {
                    let _ = self.doc.remove(kid);
                }
                if !text.is_empty() {
                    let _ = self.doc.append_text(self.id, &text);
                }
            }
            _ => {}
        }
    }

    fn parent_node(&self) -> Option<NodeId> {
        self.doc.parent(self.id)
    }

    fn parent_element(&self) -> Option<NodeId> {
        self.doc
            .parent(self.id)
            .filter(|&p| self.doc.get(p).is_some_and(ve_dom::Node::is_element))
    }

    fn first_child(&self) -> Option<NodeId> {
        self.doc.first_child(self.id)
    }

    fn last_child(&self) -> Option<NodeId> {
        self.doc.last_child(self.id)
    }

    fn previous_sibling(&self) -> Option<NodeId> {
        self.doc.prev_sibling(self.id)
    }

    fn next_sibling(&self) -> Option<NodeId> {
        self.doc.next_sibling(self.id)
    }

    fn is_connected(&self) -> bool {
        self.doc.is_connected(self.id)
    }

    fn base_u_r_i(&self) -> String {
        String::new()
    }

    fn append_child(&mut self, node: NodeId) -> NodeId {
        let _ = self.doc.append_child(self.id, node);
        node
    }

    fn insert_before(&mut self, node: NodeId, child: Option<NodeId>) -> NodeId {
        match child {
            Some(sib) => {
                let _ = self.doc.insert_before(sib, node);
            }
            None => {
                let _ = self.doc.append_child(self.id, node);
            }
        }
        node
    }

    fn remove_child(&mut self, child: NodeId) -> NodeId {
        let _ = self.doc.remove(child);
        child
    }

    fn replace_child(&mut self, node: NodeId, child: NodeId) -> NodeId {
        let _ = self
            .doc
            .insert_before(child, node)
            .or_else(|_| self.doc.append_child(self.id, node));
        let _ = self.doc.remove(child);
        child
    }

    fn clone_node(&mut self, deep: Option<bool>) -> NodeId {
        self.doc
            .clone_node(self.id, deep.unwrap_or(false))
            .unwrap_or(self.id)
    }

    fn contains(&mut self, other: Option<NodeId>) -> bool {
        let Some(other) = other else {
            return false;
        };
        self.id == other || self.doc.is_ancestor_of(self.id, other)
    }

    fn is_equal_node(&mut self, other: Option<NodeId>) -> bool {
        let Some(other) = other else {
            return false;
        };
        outer_html(self.doc, self.id) == outer_html(self.doc, other)
    }

    fn has_child_nodes(&mut self) -> bool {
        self.doc.first_child(self.id).is_some()
    }

    fn compare_document_position(&mut self, other: NodeId) -> u16 {
        compare_document_position(self.doc, self.id, other)
    }

    fn normalize(&mut self) {
        normalize_tree(self.doc, self.id);
    }

    fn lookup_prefix(&mut self, namespace: Option<String>) -> Option<String> {
        lookup_prefix(self.doc, self.id, namespace.as_deref())
    }

    fn lookup_namespace_u_r_i(&mut self, prefix: Option<String>) -> Option<String> {
        lookup_namespace_uri(self.doc, self.id, prefix.as_deref())
    }
}

const DOCUMENT_POSITION_DISCONNECTED: u16 = 1;
const DOCUMENT_POSITION_PRECEDING: u16 = 2;
const DOCUMENT_POSITION_FOLLOWING: u16 = 4;
const DOCUMENT_POSITION_CONTAINS: u16 = 8;
const DOCUMENT_POSITION_CONTAINED_BY: u16 = 16;
const DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: u16 = 32;

fn tree_root(doc: &Document, mut id: NodeId) -> NodeId {
    while let Some(parent) = doc.parent(id) {
        id = parent;
    }
    id
}

fn compare_document_position(doc: &Document, this: NodeId, other: NodeId) -> u16 {
    if this == other {
        return 0;
    }
    if doc.is_ancestor_of(this, other) {
        return DOCUMENT_POSITION_CONTAINED_BY | DOCUMENT_POSITION_FOLLOWING;
    }
    if doc.is_ancestor_of(other, this) {
        return DOCUMENT_POSITION_CONTAINS | DOCUMENT_POSITION_PRECEDING;
    }
    let this_root = tree_root(doc, this);
    let other_root = tree_root(doc, other);
    if this_root != other_root {
        let order = if this.index() < other.index() {
            DOCUMENT_POSITION_PRECEDING
        } else {
            DOCUMENT_POSITION_FOLLOWING
        };
        return DOCUMENT_POSITION_DISCONNECTED | DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC | order;
    }
    let position = |want: NodeId| {
        std::iter::once(this_root)
            .chain(doc.descendants(this_root))
            .position(|n| n == want)
    };
    match (position(this), position(other)) {
        (Some(a), Some(b)) if b < a => DOCUMENT_POSITION_PRECEDING,
        _ => DOCUMENT_POSITION_FOLLOWING,
    }
}

fn lookup_namespace_uri(doc: &Document, id: NodeId, prefix: Option<&str>) -> Option<String> {
    match prefix {
        Some("xml") => return Some("http://www.w3.org/XML/1998/namespace".into()),
        Some("xmlns") => return Some("http://www.w3.org/2000/xmlns/".into()),
        _ => {}
    }
    let default = prefix.is_none() || prefix.is_some_and(str::is_empty);
    let mut cur = Some(id);
    while let Some(n) = cur {
        if let Some(el) = doc.element(n) {
            if default {
                let uri = el.namespace.uri();
                if !uri.is_empty() {
                    return Some(uri.to_owned());
                }
            } else if let Some(p) = prefix {
                let xmlns = format!("xmlns:{p}");
                if let Some(v) = el.attr(&xmlns) {
                    return if v.is_empty() {
                        None
                    } else {
                        Some(v.to_owned())
                    };
                }
            }
        }
        cur = doc.parent(n);
    }
    None
}

fn lookup_prefix(doc: &Document, id: NodeId, namespace: Option<&str>) -> Option<String> {
    let ns = namespace.filter(|s| !s.is_empty())?;
    if ns == "http://www.w3.org/XML/1998/namespace" {
        return Some("xml".into());
    }
    if ns == "http://www.w3.org/2000/xmlns/" {
        return Some("xmlns".into());
    }
    let mut cur = Some(id);
    while let Some(n) = cur {
        if let Some(el) = doc.element(n) {
            if el.namespace.uri() == ns {
                return el.prefix.clone();
            }
            for a in &el.attributes {
                if let Some(rest) = a.name.strip_prefix("xmlns:")
                    && a.value == ns
                {
                    return Some(rest.to_owned());
                }
            }
        }
        cur = doc.parent(n);
    }
    None
}

fn normalize_tree(doc: &mut Document, id: NodeId) {
    let kids: Vec<NodeId> = doc.children(id).collect();
    for kid in kids {
        normalize_tree(doc, kid);
    }
    let kids: Vec<NodeId> = doc.children(id).collect();
    let mut prev_text: Option<NodeId> = None;
    for kid in kids {
        let Some(data) = doc
            .get(kid)
            .and_then(ve_dom::Node::as_text)
            .map(ToOwned::to_owned)
        else {
            prev_text = None;
            continue;
        };
        if data.is_empty() {
            let _ = doc.remove(kid);
            continue;
        }
        if let Some(prev) = prev_text {
            let combined = format!("{}{data}", doc.text_content(prev));
            let _ = doc.set_text(prev, combined);
            let _ = doc.remove(kid);
        } else {
            prev_text = Some(kid);
        }
    }
}

fn text_content_of(doc: &Document, id: NodeId) -> Option<String> {
    match doc.get(id).map(|n| &n.kind) {
        Some(NodeKind::Document | NodeKind::Doctype { .. }) => None,
        Some(NodeKind::ProcessingInstruction { data, .. }) => Some(data.clone()),
        _ => Some(doc.text_content(id)),
    }
}

fn pack_id(id: NodeId) -> JsValue {
    JsValue::String(format!("{}:{}", id.index(), id.generation()))
}

fn first_element_child(doc: &Document, id: NodeId) -> Option<NodeId> {
    doc.children(id)
        .find(|&c| doc.get(c).is_some_and(ve_dom::Node::is_element))
}

fn last_element_child(doc: &Document, id: NodeId) -> Option<NodeId> {
    doc.children(id)
        .filter(|&c| doc.get(c).is_some_and(ve_dom::Node::is_element))
        .last()
}

fn next_element_sibling(doc: &Document, id: NodeId) -> Option<NodeId> {
    let mut n = doc.next_sibling(id);
    while let Some(cur) = n {
        if doc.get(cur).is_some_and(ve_dom::Node::is_element) {
            return Some(cur);
        }
        n = doc.next_sibling(cur);
    }
    None
}

fn prev_element_sibling(doc: &Document, id: NodeId) -> Option<NodeId> {
    let mut n = doc.prev_sibling(id);
    while let Some(cur) = n {
        if doc.get(cur).is_some_and(ve_dom::Node::is_element) {
            return Some(cur);
        }
        n = doc.prev_sibling(cur);
    }
    None
}

/// Live page handle that implements generated Element/Document/Window traits.
pub(crate) struct LiveDom<'a> {
    page: &'a mut Page,
    id: NodeId,
}

impl<'a> LiveDom<'a> {
    pub(crate) fn new(page: &'a mut Page, id: NodeId) -> Self {
        Self { page, id }
    }

    pub(crate) fn document(page: &'a mut Page) -> Self {
        let id = page.doc.root();
        Self { page, id }
    }

    fn context_name(&self, id: NodeId) -> String {
        self.page
            .doc
            .element(id)
            .map_or_else(|| "div".into(), |e| e.name.clone())
    }

    fn html_attr_name(&self, name: String) -> String {
        if self
            .page
            .doc
            .element(self.id)
            .is_some_and(|e| e.namespace == Namespace::Html)
        {
            name.to_ascii_lowercase()
        } else {
            name
        }
    }

    fn parse_kids(&mut self, context: &str, html: &str) -> Vec<NodeId> {
        let scripting = self.page.scripting.is_some();
        let doc = std::mem::replace(&mut self.page.doc, Document::new());
        let (doc, kids) = ve_html::parse_fragment_into(doc, context, html, scripting);
        self.page.doc = doc;
        kids
    }
}

impl EventTargetInterface for LiveDom<'_> {
    fn add_event_listener(
        &mut self,
        _type_: String,
        _callback: JsValue,
        _options: Option<JsValue>,
    ) {
    }

    fn remove_event_listener(
        &mut self,
        _type_: String,
        _callback: JsValue,
        _options: Option<JsValue>,
    ) {
    }

    fn dispatch_event(&mut self, _event: JsValue) -> bool {
        true
    }
}

impl NodeInterface for LiveDom<'_> {
    fn node_type(&self) -> u16 {
        self.page
            .doc
            .get(self.id)
            .map_or(0, ve_dom::Node::node_type)
    }

    fn node_name(&self) -> String {
        LiveNode::node_name_of(&self.page.doc, self.id)
    }

    fn node_value(&self) -> Option<String> {
        self.page
            .doc
            .get(self.id)
            .and_then(ve_dom::Node::as_character_data)
            .map(ToOwned::to_owned)
    }

    fn set_node_value(&mut self, value: Option<String>) {
        let _ = self.page.doc.set_text(self.id, value.unwrap_or_default());
    }

    fn text_content(&self) -> Option<String> {
        text_content_of(&self.page.doc, self.id)
    }

    fn set_text_content(&mut self, value: Option<String>) {
        LiveNode::new(&mut self.page.doc, self.id).set_text_content(value);
    }

    fn parent_node(&self) -> Option<NodeId> {
        self.page.doc.parent(self.id)
    }

    fn parent_element(&self) -> Option<NodeId> {
        self.page
            .doc
            .parent(self.id)
            .filter(|&p| self.page.doc.get(p).is_some_and(ve_dom::Node::is_element))
    }

    fn first_child(&self) -> Option<NodeId> {
        self.page.doc.first_child(self.id)
    }

    fn last_child(&self) -> Option<NodeId> {
        self.page.doc.last_child(self.id)
    }

    fn previous_sibling(&self) -> Option<NodeId> {
        self.page.doc.prev_sibling(self.id)
    }

    fn next_sibling(&self) -> Option<NodeId> {
        self.page.doc.next_sibling(self.id)
    }

    fn is_connected(&self) -> bool {
        self.page.doc.is_connected(self.id)
    }

    fn base_u_r_i(&self) -> String {
        self.page.url.clone()
    }

    fn append_child(&mut self, node: NodeId) -> NodeId {
        let _ = self.page.doc.append_child(self.id, node);
        self.page.maybe_attach_blank_iframe(node);
        node
    }

    fn insert_before(&mut self, node: NodeId, child: Option<NodeId>) -> NodeId {
        let ret = LiveNode::new(&mut self.page.doc, self.id).insert_before(node, child);
        self.page.maybe_attach_blank_iframe(ret);
        ret
    }

    fn remove_child(&mut self, child: NodeId) -> NodeId {
        let _ = self.page.doc.remove(child);
        child
    }

    fn replace_child(&mut self, node: NodeId, child: NodeId) -> NodeId {
        let ret = LiveNode::new(&mut self.page.doc, self.id).replace_child(node, child);
        self.page.maybe_attach_blank_iframe(node);
        ret
    }

    fn clone_node(&mut self, deep: Option<bool>) -> NodeId {
        LiveNode::new(&mut self.page.doc, self.id).clone_node(deep)
    }

    fn contains(&mut self, other: Option<NodeId>) -> bool {
        LiveNode::new(&mut self.page.doc, self.id).contains(other)
    }

    fn is_equal_node(&mut self, other: Option<NodeId>) -> bool {
        LiveNode::new(&mut self.page.doc, self.id).is_equal_node(other)
    }

    fn has_child_nodes(&mut self) -> bool {
        self.page.doc.first_child(self.id).is_some()
    }

    fn compare_document_position(&mut self, other: NodeId) -> u16 {
        compare_document_position(&self.page.doc, self.id, other)
    }

    fn normalize(&mut self) {
        normalize_tree(&mut self.page.doc, self.id);
    }

    fn lookup_prefix(&mut self, namespace: Option<String>) -> Option<String> {
        lookup_prefix(&self.page.doc, self.id, namespace.as_deref())
    }

    fn lookup_namespace_u_r_i(&mut self, prefix: Option<String>) -> Option<String> {
        lookup_namespace_uri(&self.page.doc, self.id, prefix.as_deref())
    }
}

impl ElementInterface for LiveDom<'_> {
    fn tag_name(&self) -> String {
        self.page
            .doc
            .element(self.id)
            .map_or_else(String::new, |e| e.tag_name())
    }

    fn local_name(&self) -> String {
        self.page
            .doc
            .element(self.id)
            .map_or_else(String::new, |e| e.name.clone())
    }

    fn namespace_u_r_i(&self) -> String {
        self.page
            .doc
            .element(self.id)
            .map_or_else(String::new, |e| e.namespace.uri().to_owned())
    }

    fn id(&self) -> String {
        self.page
            .doc
            .element(self.id)
            .and_then(|e| e.id())
            .unwrap_or("")
            .to_owned()
    }

    fn set_id(&mut self, value: String) {
        let _ = self.page.doc.set_attribute(self.id, "id", value);
    }

    fn class_name(&self) -> String {
        self.page
            .doc
            .attribute(self.id, "class")
            .unwrap_or("")
            .to_owned()
    }

    fn set_class_name(&mut self, value: String) {
        let _ = self.page.doc.set_attribute(self.id, "class", value);
    }

    fn inner_h_t_m_l(&self) -> String {
        let mut out = String::new();
        for c in self.page.doc.children(self.id) {
            out.push_str(&outer_html(&self.page.doc, c));
        }
        out
    }

    fn set_inner_h_t_m_l(&mut self, value: String) {
        let name = self.context_name(self.id);
        let target = if name == "template" {
            self.page.doc.template_contents(self.id).unwrap_or_else(|| {
                let frag = self.page.doc.create_fragment();
                let _ = self.page.doc.set_template_contents(self.id, frag);
                frag
            })
        } else {
            self.id
        };
        let kids: Vec<_> = self.page.doc.children(target).collect();
        for kid in kids {
            let _ = self.page.doc.remove(kid);
        }
        if matches!(name.as_str(), "script" | "style" | "textarea" | "title") {
            if !value.is_empty() {
                let _ = self.page.doc.append_text(target, &value);
            }
            return;
        }
        let ctx = if name == "template" {
            "body".to_owned()
        } else {
            name
        };
        for kid in self.parse_kids(&ctx, &value) {
            let _ = self.page.doc.append_child(target, kid);
        }
    }

    fn outer_h_t_m_l(&self) -> String {
        outer_html(&self.page.doc, self.id)
    }

    fn set_outer_h_t_m_l(&mut self, value: String) {
        let Some(parent) = self.page.doc.parent(self.id) else {
            return;
        };
        let ctx = self.context_name(parent);
        let id = self.id;
        let kids = self.parse_kids(&ctx, &value);
        for kid in kids {
            let _ = self.page.doc.insert_before(id, kid);
        }
        let _ = self.page.doc.destroy(id);
    }

    fn get_attribute(&mut self, qualified_name: String) -> Option<String> {
        let name = self.html_attr_name(qualified_name);
        self.page
            .doc
            .attribute(self.id, &name)
            .map(ToOwned::to_owned)
    }

    fn set_attribute(&mut self, qualified_name: String, value: String) {
        let name = self.html_attr_name(qualified_name);
        let _ = self.page.doc.set_attribute(self.id, name, value);
    }

    fn remove_attribute(&mut self, qualified_name: String) {
        let name = self.html_attr_name(qualified_name);
        let _ = self.page.doc.remove_attribute(self.id, &name);
    }

    fn has_attribute(&mut self, qualified_name: String) -> bool {
        let name = self.html_attr_name(qualified_name);
        self.page
            .doc
            .element(self.id)
            .is_some_and(|e| e.has_attr(&name))
    }

    fn toggle_attribute(&mut self, qualified_name: String, force: Option<bool>) -> bool {
        let name = self.html_attr_name(qualified_name);
        let has = self
            .page
            .doc
            .element(self.id)
            .is_some_and(|e| e.has_attr(&name));
        match force {
            Some(true) => {
                if !has {
                    let _ = self.page.doc.set_attribute(self.id, name, "");
                }
                true
            }
            Some(false) => {
                if has {
                    let _ = self.page.doc.remove_attribute(self.id, &name);
                }
                false
            }
            None => {
                if has {
                    let _ = self.page.doc.remove_attribute(self.id, &name);
                    false
                } else {
                    let _ = self.page.doc.set_attribute(self.id, name, "");
                    true
                }
            }
        }
    }

    fn query_selector(&mut self, selectors: String) -> Option<NodeId> {
        if selectors.trim().is_empty() {
            return None;
        }
        self.page.doc.descendants(self.id).find(|&id| {
            self.page.doc.get(id).is_some_and(ve_dom::Node::is_element)
                && self
                    .page
                    .style_engine
                    .matches(&self.page.doc, id, &selectors)
                    .unwrap_or(false)
        })
    }

    fn query_selector_all(&mut self, selectors: String) -> Vec<NodeId> {
        if selectors.trim().is_empty() {
            return Vec::new();
        }
        self.page
            .doc
            .descendants(self.id)
            .filter(|&id| {
                self.page.doc.get(id).is_some_and(ve_dom::Node::is_element)
                    && self
                        .page
                        .style_engine
                        .matches(&self.page.doc, id, &selectors)
                        .unwrap_or(false)
            })
            .collect()
    }

    fn matches(&mut self, selectors: String) -> bool {
        self.page
            .style_engine
            .matches(&self.page.doc, self.id, &selectors)
            .unwrap_or(false)
    }

    fn closest(&mut self, selectors: String) -> Option<NodeId> {
        let mut cur = Some(self.id);
        while let Some(id) = cur {
            if self
                .page
                .style_engine
                .matches(&self.page.doc, id, &selectors)
                .unwrap_or(false)
            {
                return Some(id);
            }
            cur = self.page.doc.parent(id);
        }
        None
    }

    fn first_element_child(&self) -> Option<NodeId> {
        first_element_child(&self.page.doc, self.id)
    }

    fn last_element_child(&self) -> Option<NodeId> {
        last_element_child(&self.page.doc, self.id)
    }

    fn next_element_sibling(&self) -> Option<NodeId> {
        next_element_sibling(&self.page.doc, self.id)
    }

    fn previous_element_sibling(&self) -> Option<NodeId> {
        prev_element_sibling(&self.page.doc, self.id)
    }

    fn child_element_count(&self) -> u32 {
        u32::try_from(
            self.page
                .doc
                .children(self.id)
                .filter(|&c| self.page.doc.get(c).is_some_and(ve_dom::Node::is_element))
                .count(),
        )
        .unwrap_or(0)
    }

    fn attach_shadow(&mut self, init: JsValue) -> NodeId {
        let mode = match &init {
            JsValue::String(s) if s == "closed" => ShadowRootMode::Closed,
            JsValue::Object(m) if m.get("mode").is_some_and(|v| v.to_string() == "closed") => {
                ShadowRootMode::Closed
            }
            _ => ShadowRootMode::Open,
        };
        self.page
            .doc
            .attach_shadow(self.id, mode)
            .unwrap_or(self.id)
    }

    fn shadow_root(&self) -> Option<NodeId> {
        let root = self.page.doc.shadow_root(self.id)?;
        match self.page.doc.get(root).map(|n| &n.kind) {
            Some(NodeKind::ShadowRoot {
                mode: ShadowRootMode::Closed,
            }) => None,
            _ => Some(root),
        }
    }

    fn remove(&mut self) {
        let _ = self.page.doc.remove(self.id);
    }

    fn insert_adjacent_h_t_m_l(&mut self, position: String, html: String) {
        let pos = position.to_ascii_lowercase();
        let id = self.id;
        let (context, before) = match pos.as_str() {
            "beforebegin" => (self.page.doc.parent(id), Some(id)),
            "afterbegin" => (Some(id), self.page.doc.first_child(id)),
            "beforeend" => (Some(id), None),
            "afterend" => (self.page.doc.parent(id), self.page.doc.next_sibling(id)),
            _ => return,
        };
        let Some(parent) = context else {
            return;
        };
        let ctx = self.context_name(parent);
        let kids = self.parse_kids(&ctx, &html);
        for kid in kids {
            if let Some(b) = before {
                let _ = self.page.doc.insert_before(b, kid);
            } else {
                let _ = self.page.doc.append_child(parent, kid);
            }
        }
    }

    fn get_bounding_client_rect(&mut self) -> JsValue {
        let rect = self.page.layout_tree().rect_of(self.id);
        let (x, y, w, h) = rect.map_or((0.0, 0.0, 0.0, 0.0), |r| {
            (
                f64::from(r.x()),
                f64::from(r.y()),
                f64::from(r.width()),
                f64::from(r.height()),
            )
        });
        let mut m = std::collections::BTreeMap::new();
        m.insert("x".into(), JsValue::Number(x));
        m.insert("y".into(), JsValue::Number(y));
        m.insert("width".into(), JsValue::Number(w));
        m.insert("height".into(), JsValue::Number(h));
        m.insert("top".into(), JsValue::Number(y));
        m.insert("left".into(), JsValue::Number(x));
        m.insert("right".into(), JsValue::Number(x + w));
        m.insert("bottom".into(), JsValue::Number(y + h));
        JsValue::Object(m)
    }
}

impl HTMLElementInterface for LiveDom<'_> {
    fn inner_text(&self) -> String {
        self.page.doc.text_content(self.id)
    }

    fn set_inner_text(&mut self, value: String) {
        self.set_text_content(Some(value));
    }

    fn outer_text(&self) -> String {
        self.inner_text()
    }

    fn set_outer_text(&mut self, value: String) {
        let Some(parent) = self.page.doc.parent(self.id) else {
            return;
        };
        let next = self.page.doc.next_sibling(self.id);
        let id = self.id;
        let _ = self.page.doc.remove(id);
        let insert = |doc: &mut Document, node: NodeId| {
            let _ = match next {
                Some(n) => doc.insert_before(n, node),
                None => doc.append_child(parent, node),
            };
        };
        if value.is_empty() {
            let text = self.page.doc.create_text("");
            insert(&mut self.page.doc, text);
            return;
        }
        let parts: Vec<&str> = value.split('\n').collect();
        for (i, part) in parts.iter().enumerate() {
            if i > 0 {
                let br = self.page.doc.create_element("br", Namespace::Html);
                insert(&mut self.page.doc, br);
            }
            if !part.is_empty() {
                let text = self.page.doc.create_text(*part);
                insert(&mut self.page.doc, text);
            }
        }
    }

    fn hidden(&self) -> String {
        self.page
            .doc
            .attribute(self.id, "hidden")
            .unwrap_or("")
            .to_owned()
    }

    fn set_hidden(&mut self, value: String) {
        if value.is_empty() || value == "false" {
            let _ = self.page.doc.remove_attribute(self.id, "hidden");
        } else {
            let _ = self.page.doc.set_attribute(self.id, "hidden", value);
        }
    }

    fn click(&mut self) {}

    fn focus(&mut self) {
        self.page.focus(Some(self.id));
    }

    fn blur(&mut self) {
        self.page.focus(None);
    }

    fn offset_width(&self) -> i32 {
        self.page
            .layout_tree()
            .rect_of(self.id)
            .map_or(0, |r| r.width() as i32)
    }

    fn offset_height(&self) -> i32 {
        self.page
            .layout_tree()
            .rect_of(self.id)
            .map_or(0, |r| r.height() as i32)
    }

    fn offset_top(&self) -> i32 {
        self.page
            .layout_tree()
            .rect_of(self.id)
            .map_or(0, |r| r.y() as i32)
    }

    fn offset_left(&self) -> i32 {
        self.page
            .layout_tree()
            .rect_of(self.id)
            .map_or(0, |r| r.x() as i32)
    }

    fn client_width(&self) -> i32 {
        self.offset_width()
    }

    fn client_height(&self) -> i32 {
        self.offset_height()
    }

    fn scroll_top(&self) -> f64 {
        0.0
    }

    fn set_scroll_top(&mut self, _value: f64) {}

    fn scroll_left(&self) -> f64 {
        0.0
    }

    fn set_scroll_left(&mut self, _value: f64) {}

    fn scroll_width(&self) -> i32 {
        self.offset_width()
    }

    fn scroll_height(&self) -> i32 {
        self.offset_height()
    }

    fn style(&self) -> String {
        self.page
            .doc
            .attribute(self.id, "style")
            .unwrap_or("")
            .to_owned()
    }

    fn set_style(&mut self, value: String) {
        let _ = self.page.doc.set_attribute(self.id, "style", value);
    }
}

impl DocumentInterface for LiveDom<'_> {
    fn document_element(&self) -> Option<NodeId> {
        self.page.doc.document_element_of(self.id)
    }

    fn head(&self) -> Option<NodeId> {
        self.page.doc.head_of(self.id)
    }

    fn body(&self) -> Option<NodeId> {
        self.page.doc.body_of(self.id)
    }

    fn set_body(&mut self, _value: Option<NodeId>) {}

    fn title(&self) -> String {
        self.page.title()
    }

    fn set_title(&mut self, value: String) {
        if let Some(title) = self.page.doc.head_of(self.id).and_then(|head| {
            self.page
                .doc
                .descendants(head)
                .find(|&id| self.page.doc.element(id).is_some_and(|e| e.name == "title"))
        }) {
            let _ = self.page.doc.clear_children(title);
            let _ = self.page.doc.append_text(title, &value);
        }
    }

    fn u_r_l(&self) -> String {
        self.page.url().to_owned()
    }

    fn document_u_r_i(&self) -> String {
        self.page.url().to_owned()
    }

    fn character_set(&self) -> String {
        "UTF-8".into()
    }

    fn compat_mode(&self) -> String {
        if matches!(self.page.doc.quirks_mode(), ve_dom::QuirksMode::NoQuirks) {
            "CSS1Compat".into()
        } else {
            "BackCompat".into()
        }
    }

    fn cookie(&self) -> String {
        let mut parts: Vec<String> = self
            .page
            .cookies
            .iter()
            .map(|(k, v)| format!("{k}={v}"))
            .collect();
        parts.sort();
        parts.join("; ")
    }

    fn set_cookie(&mut self, value: String) {
        if value.contains('\0') {
            return;
        }
        let mut attrs = value.split(';');
        let Some(pair) = attrs.next() else {
            return;
        };
        let Some((name, val)) = pair.split_once('=') else {
            return;
        };
        let name = name.trim();
        if name.is_empty() {
            return;
        }
        let mut delete = false;
        for attr in attrs {
            let attr = attr.trim();
            let Some((k, v)) = attr.split_once('=') else {
                continue;
            };
            let k = k.trim();
            let v = v.trim();
            if k.eq_ignore_ascii_case("max-age") {
                delete = v.parse::<i64>().unwrap_or(1) <= 0;
            } else if k.eq_ignore_ascii_case("expires") && v.contains("1970") {
                delete = true;
            }
        }
        if delete {
            self.page.cookies.remove(name);
            return;
        }
        self.page
            .cookies
            .insert(name.to_owned(), val.trim().to_owned());
    }

    fn forms(&self) -> JsValue {
        LiveCollection::from_doc(&self.page.doc, self.id, |e| {
            e.namespace == Namespace::Html && e.name == "form"
        })
        .to_js()
    }

    fn images(&self) -> JsValue {
        LiveCollection::from_doc(&self.page.doc, self.id, |e| {
            e.namespace == Namespace::Html && e.name == "img"
        })
        .to_js()
    }

    fn links(&self) -> JsValue {
        LiveCollection::from_doc(&self.page.doc, self.id, |e| {
            e.namespace == Namespace::Html
                && (e.name == "a" || e.name == "area")
                && e.has_attr("href")
        })
        .to_js()
    }

    fn scripts(&self) -> JsValue {
        LiveCollection::from_doc(&self.page.doc, self.id, |e| {
            e.namespace == Namespace::Html && e.name == "script"
        })
        .to_js()
    }

    fn implementation(&self) -> JsValue {
        let mut m = std::collections::BTreeMap::new();
        m.insert("hasFeature".into(), JsValue::Bool(true));
        JsValue::Object(m)
    }

    fn create_element(&mut self, local_name: String) -> NodeId {
        self.page
            .doc
            .create_element(local_name.to_ascii_lowercase(), Namespace::Html)
    }

    fn create_element_n_s(&mut self, namespace: Option<String>, qualified_name: String) -> NodeId {
        let ns = namespace.unwrap_or_default();
        let namespace = if ns.is_empty() {
            Namespace::Html
        } else {
            Namespace::from_uri(&ns)
        };
        let name = if namespace == Namespace::Html {
            qualified_name.to_ascii_lowercase()
        } else {
            qualified_name
        };
        self.page.doc.create_element(name, namespace)
    }

    fn create_text_node(&mut self, data: String) -> NodeId {
        self.page.doc.create_text(data)
    }

    fn create_comment(&mut self, data: String) -> NodeId {
        self.page.doc.create_comment(data)
    }

    fn create_document_fragment(&mut self) -> NodeId {
        self.page.doc.create_fragment()
    }

    fn get_element_by_id(&mut self, element_id: String) -> Option<NodeId> {
        self.page
            .doc
            .element_by_id_in(self.id, &element_id)
            .filter(|&id| self.page.parser_visible(id))
    }

    fn query_selector(&mut self, selectors: String) -> Option<NodeId> {
        ElementInterface::query_selector(self, selectors)
    }

    fn query_selector_all(&mut self, selectors: String) -> Vec<NodeId> {
        ElementInterface::query_selector_all(self, selectors)
    }

    fn get_elements_by_tag_name(&mut self, qualified_name: String) -> JsValue {
        let name = qualified_name.to_ascii_lowercase();
        let star = name == "*";
        let root = self.id;
        JsValue::Array(
            self.page
                .doc
                .descendants(root)
                .filter(|&id| {
                    self.page
                        .doc
                        .element(id)
                        .is_some_and(|e| star || e.name == name)
                })
                .map(pack_id)
                .collect(),
        )
    }

    fn import_node(&mut self, node: NodeId, deep: Option<bool>) -> NodeId {
        LiveNode::new(&mut self.page.doc, node).clone_node(deep)
    }

    fn adopt_node(&mut self, node: NodeId) -> NodeId {
        let _ = self.page.doc.remove(node);
        node
    }

    fn element_from_point(&mut self, x: f64, y: f64) -> Option<NodeId> {
        self.elements_from_point(x, y).into_iter().next()
    }

    fn elements_from_point(&mut self, x: f64, y: f64) -> Vec<NodeId> {
        self.page.update();
        let point = ve_core::Point::new(
            x as f32 + self.page.scroll_offset().x,
            y as f32 + self.page.scroll_offset().y,
        );
        let Some(hit) = self.page.layout_tree().hit_test(point) else {
            return Vec::new();
        };
        let mut ids = Vec::new();
        let mut cur = Some(hit);
        while let Some(id) = cur {
            if self.page.doc.get(id).is_some_and(ve_dom::Node::is_element) {
                ids.push(id);
            }
            cur = self.page.doc.parent(id);
        }
        ids
    }

    fn get_elements_by_class_name(&mut self, class_names: String) -> JsValue {
        let class = class_names;
        let root = self.id;
        JsValue::Array(
            self.page
                .doc
                .descendants(root)
                .filter(|&id| {
                    self.page
                        .doc
                        .element(id)
                        .is_some_and(|e| e.has_class(&class))
                })
                .map(pack_id)
                .collect(),
        )
    }
}

impl WindowInterface for LiveDom<'_> {
    fn document(&self) -> NodeId {
        self.page.doc.root()
    }

    fn location(&self) -> JsValue {
        JsValue::from(self.page.url())
    }

    fn history(&self) -> JsValue {
        JsValue::Number(self.page.history().0 as f64)
    }

    fn local_storage(&self) -> JsValue {
        JsValue::Object(std::collections::BTreeMap::new())
    }

    fn session_storage(&self) -> JsValue {
        JsValue::Object(std::collections::BTreeMap::new())
    }

    fn custom_elements(&self) -> JsValue {
        JsValue::Object(std::collections::BTreeMap::new())
    }

    fn inner_width(&self) -> f64 {
        f64::from(self.page.viewport().width)
    }

    fn inner_height(&self) -> f64 {
        f64::from(self.page.viewport().height)
    }

    fn scroll_x(&self) -> f64 {
        f64::from(self.page.scroll_offset().x)
    }

    fn scroll_y(&self) -> f64 {
        f64::from(self.page.scroll_offset().y)
    }

    fn get_computed_style(&mut self, _elt: NodeId, _pseudo_elt: Option<String>) -> JsValue {
        JsValue::Object(std::collections::BTreeMap::new())
    }

    fn fetch(&mut self, input: JsValue, _init: Option<JsValue>) -> JsValue {
        let url = input.to_string();
        let mut m = std::collections::BTreeMap::new();
        m.insert("url".into(), JsValue::from(url.as_str()));
        m.insert("pending".into(), JsValue::Bool(true));
        JsValue::Object(m)
    }

    fn match_media(&mut self, query: String) -> JsValue {
        let mql = LiveMediaQuery {
            media: query.clone(),
            matches: !query.is_empty(),
        };
        let mut m = std::collections::BTreeMap::new();
        m.insert("media".into(), JsValue::from(mql.media().as_str()));
        m.insert("matches".into(), JsValue::Bool(mql.matches()));
        JsValue::Object(m)
    }
}

/// Live `HTMLCollection` over a snapshot of element ids.
pub(crate) struct LiveCollection {
    ids: Vec<NodeId>,
    keys: Vec<(String, String)>,
}

impl LiveCollection {
    fn from_doc(doc: &Document, root: NodeId, pred: impl Fn(&ve_dom::ElementData) -> bool) -> Self {
        let mut ids = Vec::new();
        let mut keys = Vec::new();
        for id in doc.descendants(root) {
            let Some(el) = doc.element(id) else {
                continue;
            };
            if !pred(el) {
                continue;
            }
            ids.push(id);
            keys.push((
                el.id().unwrap_or("").to_owned(),
                el.attributes
                    .iter()
                    .find(|a| a.name == "name")
                    .map(|a| a.value.clone())
                    .unwrap_or_default(),
            ));
        }
        Self { ids, keys }
    }

    fn to_js(&self) -> JsValue {
        JsValue::Array(self.ids.iter().copied().map(pack_id).collect())
    }
}

impl HTMLCollectionInterface for LiveCollection {
    fn length(&self) -> u32 {
        u32::try_from(self.ids.len()).unwrap_or(0)
    }

    fn item(&mut self, index: u32) -> Option<NodeId> {
        self.ids.get(index as usize).copied()
    }

    fn named_item(&mut self, name: String) -> Option<NodeId> {
        self.ids
            .iter()
            .zip(self.keys.iter())
            .find(|(_, (id, n))| id == &name || n == &name)
            .map(|(id, _)| *id)
    }
}

/// `document.implementation`.
pub(crate) struct LiveImpl<'a> {
    page: &'a mut Page,
}

impl<'a> LiveImpl<'a> {
    pub(crate) fn new(page: &'a mut Page) -> Self {
        Self { page }
    }
}

impl DOMImplementationInterface for LiveImpl<'_> {
    fn create_h_t_m_l_document(&mut self, title: Option<String>) -> NodeId {
        self.page.doc.create_html_document(title.as_deref())
    }

    fn has_feature(&mut self, _feature: Option<String>, _version: Option<String>) -> bool {
        true
    }
}

impl HTMLFormElementInterface for LiveDom<'_> {
    fn submit(&mut self) {
        let _ = self.page.submit_from(self.id);
    }

    fn reset(&mut self) {
        let _ = self.page.reset_form_of(self.id);
    }

    fn check_validity(&mut self) -> bool {
        form_controls_valid(&self.page.doc, self.id)
    }

    fn report_validity(&mut self) -> bool {
        form_controls_valid(&self.page.doc, self.id)
    }
}

impl HTMLInputElementInterface for LiveDom<'_> {
    fn value(&self) -> String {
        self.page.doc.form_value(self.id).unwrap_or_default()
    }

    fn set_value(&mut self, value: String) {
        let _ = self.page.doc.set_form_value(self.id, value);
    }

    fn type_(&self) -> String {
        self.page
            .doc
            .attribute(self.id, "type")
            .unwrap_or("text")
            .to_owned()
    }

    fn set_type_(&mut self, value: String) {
        let _ = self.page.doc.set_attribute(self.id, "type", value);
    }

    fn checked(&self) -> bool {
        self.page.doc.is_checked(self.id)
    }

    fn set_checked(&mut self, value: bool) {
        let _ = self.page.doc.set_checked(self.id, value);
    }

    fn disabled(&self) -> bool {
        self.page
            .doc
            .element(self.id)
            .is_some_and(|e| e.has_attr("disabled"))
    }

    fn set_disabled(&mut self, value: bool) {
        if value {
            let _ = self.page.doc.set_attribute(self.id, "disabled", "");
        } else {
            let _ = self.page.doc.remove_attribute(self.id, "disabled");
        }
    }

    fn check_validity(&mut self) -> bool {
        control_valid(&self.page.doc, self.id)
    }

    fn select(&mut self) {}
}

impl HTMLButtonElementInterface for LiveDom<'_> {
    fn disabled(&self) -> bool {
        self.page
            .doc
            .element(self.id)
            .is_some_and(|e| e.has_attr("disabled"))
    }

    fn set_disabled(&mut self, value: bool) {
        if value {
            let _ = self.page.doc.set_attribute(self.id, "disabled", "");
        } else {
            let _ = self.page.doc.remove_attribute(self.id, "disabled");
        }
    }

    fn type_(&self) -> String {
        self.page
            .doc
            .attribute(self.id, "type")
            .unwrap_or("submit")
            .to_owned()
    }

    fn set_type_(&mut self, value: String) {
        let _ = self.page.doc.set_attribute(self.id, "type", value);
    }

    fn click(&mut self) {
        let _ = self.page.activate(self.id);
    }
}

impl ShadowRootInterface for LiveDom<'_> {
    fn mode(&self) -> String {
        match self.page.doc.get(self.id).map(|n| &n.kind) {
            Some(NodeKind::ShadowRoot {
                mode: ShadowRootMode::Closed,
            }) => "closed".into(),
            Some(NodeKind::ShadowRoot { .. }) => "open".into(),
            _ => String::new(),
        }
    }

    fn host(&self) -> NodeId {
        self.page.doc.host(self.id).unwrap_or(self.id)
    }

    fn inner_h_t_m_l(&self) -> String {
        ElementInterface::inner_h_t_m_l(self)
    }

    fn set_inner_h_t_m_l(&mut self, value: String) {
        ElementInterface::set_inner_h_t_m_l(self, value);
    }

    fn get_element_by_id(&mut self, element_id: String) -> Option<NodeId> {
        DocumentInterface::get_element_by_id(self, element_id)
    }

    fn query_selector(&mut self, selectors: String) -> Option<NodeId> {
        ElementInterface::query_selector(self, selectors)
    }

    fn query_selector_all(&mut self, selectors: String) -> Vec<NodeId> {
        ElementInterface::query_selector_all(self, selectors)
    }
}

struct LiveMediaQuery {
    media: String,
    matches: bool,
}

impl EventTargetInterface for LiveMediaQuery {
    fn add_event_listener(
        &mut self,
        _type_: String,
        _callback: JsValue,
        _options: Option<JsValue>,
    ) {
    }

    fn remove_event_listener(
        &mut self,
        _type_: String,
        _callback: JsValue,
        _options: Option<JsValue>,
    ) {
    }

    fn dispatch_event(&mut self, _event: JsValue) -> bool {
        true
    }
}

impl MediaQueryListInterface for LiveMediaQuery {
    fn media(&self) -> String {
        self.media.clone()
    }

    fn matches(&self) -> bool {
        self.matches
    }

    fn add_listener(&mut self, _callback: JsValue) {}

    fn remove_listener(&mut self, _callback: JsValue) {}
}

fn control_valid(doc: &Document, id: NodeId) -> bool {
    let required = doc.element(id).is_some_and(|e| e.has_attr("required"));
    if !required {
        return true;
    }
    !doc.form_value(id).unwrap_or_default().is_empty()
}

fn form_controls_valid(doc: &Document, form: NodeId) -> bool {
    doc.descendants(form).all(|id| {
        let Some(el) = doc.element(id) else {
            return true;
        };
        if el.namespace != Namespace::Html {
            return true;
        }
        if !matches!(el.name.as_str(), "input" | "textarea" | "select") {
            return true;
        }
        control_valid(doc, id)
    })
}

#[cfg(test)]
mod tests {
    use ve_script::generated::INTERFACE_NAMES;

    use super::*;

    #[test]
    fn generated_node_interface_drives_the_live_document() {
        assert!(INTERFACE_NAMES.contains(&"Node"));
        assert!(INTERFACE_NAMES.contains(&"EventTarget"));
        let mut doc = Document::new();
        let root = doc.root();
        let el = doc.create_element("div", ve_dom::Namespace::Html);
        let _ = doc.append_child(root, el);
        let text = doc.append_text(el, "hi").unwrap();
        {
            let mut node = LiveNode::new(&mut doc, el);
            assert_eq!(node.node_name(), "DIV");
            assert_eq!(node.node_type(), 1);
            assert!(node.contains(Some(text)));
            assert!(node.has_child_nodes());
            assert_eq!(node.first_child(), Some(text));
            assert_eq!(
                node.compare_document_position(text),
                DOCUMENT_POSITION_CONTAINED_BY | DOCUMENT_POSITION_FOLLOWING
            );
        }
        {
            let mut text_node = LiveNode::new(&mut doc, text);
            assert_eq!(
                text_node.compare_document_position(el),
                DOCUMENT_POSITION_CONTAINS | DOCUMENT_POSITION_PRECEDING
            );
        }
        let extra = doc.create_text("there");
        let _ = doc.append_child(el, extra);
        let first = {
            let mut node = LiveNode::new(&mut doc, el);
            node.normalize();
            node.first_child()
        };
        assert_eq!(
            first.and_then(|id| text_content_of(&doc, id)).as_deref(),
            Some("hithere")
        );
        assert_eq!(doc.children(el).count(), 1);
        let cloned = {
            let mut node = LiveNode::new(&mut doc, el);
            node.clone_node(Some(true))
        };
        assert!(doc.contains(cloned));
        assert_eq!(LiveNode::node_name_of(&doc, cloned), "DIV");
        assert!(INTERFACE_NAMES.contains(&"Element"));
        assert!(INTERFACE_NAMES.contains(&"Document"));
        assert!(INTERFACE_NAMES.contains(&"Window"));
        assert!(INTERFACE_NAMES.contains(&"HTMLElement"));
        assert!(INTERFACE_NAMES.contains(&"ARIAMixin"));
        assert!(INTERFACE_NAMES.contains(&"Clients"));
        assert!(INTERFACE_NAMES.contains(&"Client"));
        assert!(INTERFACE_NAMES.contains(&"ServiceWorkerGlobalScope"));
    }

    #[test]
    fn live_dom_traits_drive_element_document_and_window() {
        use crate::page::{DEFAULT_VIEWPORT, Page};

        let mut page = Page::from_html(
            1,
            "<html><head><title>t</title></head><body><p id=\"x\" class=\"c\">hi</p></body></html>",
            Some("https://s.test/doc"),
            DEFAULT_VIEWPORT,
        );
        let p = {
            let mut live = LiveDom::document(&mut page);
            assert!(live.document_element().is_some());
            assert!(live.u_r_l().contains("s.test"));
            DocumentInterface::get_element_by_id(&mut live, "x".into()).expect("p#x")
        };
        {
            let mut el = LiveDom::new(&mut page, p);
            assert_eq!(el.tag_name(), "P");
            assert_eq!(el.id(), "x");
            assert!(el.matches("p.c".into()));
            assert_eq!(el.inner_width(), f64::from(DEFAULT_VIEWPORT.width));
            let child = el.create_element("span".into());
            let _ = el.append_child(child);
            assert!(el.child_element_count() >= 1);
            assert!(el.toggle_attribute("HIDDEN".into(), None));
            assert!(el.has_attribute("hidden".into()));
            assert!(!el.toggle_attribute("hidden".into(), None));
            assert_eq!(
                el.lookup_namespace_u_r_i(None).as_deref(),
                Some("http://www.w3.org/1999/xhtml")
            );
            assert_eq!(
                el.lookup_prefix(Some("http://www.w3.org/1999/xhtml".into())),
                None
            );
        }
        let mut forms = LiveCollection::from_doc(&page.doc, page.doc.root(), |e| e.name == "form");
        assert_eq!(forms.length(), 0);
        assert!(forms.item(0).is_none());
        let impl_ok = LiveImpl::new(&mut page).has_feature(None, None);
        assert!(impl_ok);
        assert!(INTERFACE_NAMES.contains(&"HTMLCollection"));
        assert!(INTERFACE_NAMES.contains(&"DOMImplementation"));
        assert!(INTERFACE_NAMES.contains(&"HTMLFormElement"));
        assert!(INTERFACE_NAMES.contains(&"ShadowRoot"));
        assert!(INTERFACE_NAMES.contains(&"MediaQueryList"));
        {
            let mut live = LiveDom::document(&mut page);
            live.set_cookie("a=1".into());
            live.set_cookie("b=2; Path=/".into());
            assert!(live.cookie().contains("a=1"));
            assert!(live.cookie().contains("b=2"));
        }
    }

    #[test]
    fn scroll_into_view_moves_the_viewport() {
        use crate::page::{DEFAULT_VIEWPORT, Page};

        let mut page = Page::from_html(
            1,
            "<html><body><div style=\"height:3000px\">pad</div><div id=\"t\">target</div></body></html>",
            Some("https://s.test/doc"),
            DEFAULT_VIEWPORT,
        );
        page.update();
        let t = {
            let mut live = LiveDom::document(&mut page);
            DocumentInterface::get_element_by_id(&mut live, "t".into()).expect("t")
        };
        let rect = page.layout_tree().rect_of(t).expect("laid out");
        assert!(
            rect.y() > DEFAULT_VIEWPORT.height,
            "target y {} should be below the viewport",
            rect.y()
        );
        page.scroll_into_view(rect);
        assert!(
            page.scroll_offset().y > 0.0,
            "viewport y {}",
            page.scroll_offset().y
        );
    }

    #[test]
    fn element_from_point_hits_a_positioned_box() {
        use crate::page::{DEFAULT_VIEWPORT, Page};

        let mut page = Page::from_html(
            1,
            "<html><body><div id=\"box\" style=\"position:absolute;left:10px;top:10px;width:80px;height:80px;background:#f00\">x</div></body></html>",
            Some("https://s.test/doc"),
            DEFAULT_VIEWPORT,
        );
        let hit = {
            let mut live = LiveDom::document(&mut page);
            live.element_from_point(40.0, 40.0).expect("hit")
        };
        assert_eq!(
            page.doc.element(hit).map(|e| e.id().unwrap_or("")),
            Some("box")
        );
    }
}
