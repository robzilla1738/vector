//! The [`TreeSink`] implementation that builds a [`ve_dom::Document`].
//!
//! html5ever drives the sink through `&self`, so the document lives in a
//! [`RefCell`]. Element qualified names are additionally kept in a side table
//! because the tree builder asks for them as `markup5ever` types while the DOM
//! stores plain strings.

use std::borrow::Cow;
use std::cell::{Ref, RefCell};
use std::collections::HashMap;

use html5ever::tendril::StrTendril;
use html5ever::tree_builder::{ElementFlags, NodeOrText, QuirksMode, TreeSink};
use html5ever::{Attribute, QualName};
use ve_dom::{Document, Namespace, NodeId, ShadowRootMode};

use crate::ParseOutcome;

/// Bridges html5ever's tree builder to [`ve_dom::Document`].
pub struct DomSink {
    doc: RefCell<Document>,
    names: RefCell<HashMap<NodeId, QualName>>,
    errors: RefCell<Vec<String>>,
}

impl DomSink {
    /// Creates a sink that appends into `doc`.
    #[must_use]
    pub fn new(doc: Document) -> Self {
        Self {
            doc: RefCell::new(doc),
            names: RefCell::new(HashMap::new()),
            errors: RefCell::new(Vec::new()),
        }
    }

    fn convert_attrs(attrs: Vec<Attribute>) -> Vec<ve_dom::Attribute> {
        attrs
            .into_iter()
            .map(|a| ve_dom::Attribute {
                name: qualified_attr_name(&a.name),
                value: a.value.to_string(),
            })
            .collect()
    }

    fn append_node_or_text(&self, parent: NodeId, child: NodeOrText<NodeId>) {
        let mut doc = self.doc.borrow_mut();
        let result = match child {
            NodeOrText::AppendNode(node) => doc.append_child(parent, node),
            NodeOrText::AppendText(text) => doc.append_text(parent, &text).map(|_| ()),
        };
        if let Err(e) = result {
            self.errors.borrow_mut().push(format!("append failed: {e}"));
        }
    }
}

/// `prefix:local` for prefixed attributes, `local` otherwise.
fn qualified_attr_name(name: &QualName) -> String {
    match &name.prefix {
        Some(prefix) => format!("{}:{}", prefix, name.local),
        None => name.local.to_string(),
    }
}

impl TreeSink for DomSink {
    type Handle = NodeId;
    type Output = ParseOutcome;
    type ElemName<'a> = Ref<'a, QualName>;

    fn finish(self) -> ParseOutcome {
        ParseOutcome {
            document: self.doc.into_inner(),
            errors: self.errors.into_inner(),
        }
    }

    fn parse_error(&self, msg: Cow<'static, str>) {
        self.errors.borrow_mut().push(msg.into_owned());
    }

    fn get_document(&self) -> NodeId {
        self.doc.borrow().root()
    }

    fn elem_name<'a>(&'a self, target: &'a NodeId) -> Ref<'a, QualName> {
        Ref::map(self.names.borrow(), |names| {
            names
                .get(target)
                .expect("elem_name called on a non-element handle")
        })
    }

    fn create_element(&self, name: QualName, attrs: Vec<Attribute>, flags: ElementFlags) -> NodeId {
        let mut doc = self.doc.borrow_mut();
        let namespace = Namespace::from_uri(&name.ns);
        let id = doc.create_element_with_attrs(
            name.local.to_string(),
            namespace,
            Self::convert_attrs(attrs),
        );
        if flags.template {
            let fragment = doc.create_fragment();
            doc.set_template_contents(id, fragment)
                .expect("fresh template element");
        }
        self.names.borrow_mut().insert(id, name);
        id
    }

    fn create_comment(&self, text: StrTendril) -> NodeId {
        self.doc.borrow_mut().create_comment(text.to_string())
    }

    fn create_pi(&self, target: StrTendril, data: StrTendril) -> NodeId {
        self.doc
            .borrow_mut()
            .create_processing_instruction(target.to_string(), data.to_string())
    }

    fn append(&self, parent: &NodeId, child: NodeOrText<NodeId>) {
        self.append_node_or_text(*parent, child);
    }

    fn append_based_on_parent_node(
        &self,
        element: &NodeId,
        prev_element: &NodeId,
        child: NodeOrText<NodeId>,
    ) {
        let has_parent = self.doc.borrow().parent(*element).is_some();
        if has_parent {
            self.append_before_sibling(element, child);
        } else {
            self.append(prev_element, child);
        }
    }

    fn append_doctype_to_document(
        &self,
        name: StrTendril,
        public_id: StrTendril,
        system_id: StrTendril,
    ) {
        let mut doc = self.doc.borrow_mut();
        let root = doc.root();
        let doctype = doc.create_doctype(
            name.to_string(),
            public_id.to_string(),
            system_id.to_string(),
        );
        doc.append_child(root, doctype)
            .expect("doctype under document");
    }

    fn get_template_contents(&self, target: &NodeId) -> NodeId {
        self.doc
            .borrow()
            .template_contents(*target)
            .expect("template element has contents")
    }

    fn same_node(&self, x: &NodeId, y: &NodeId) -> bool {
        x == y
    }

    fn set_quirks_mode(&self, mode: QuirksMode) {
        self.doc.borrow_mut().set_quirks_mode(match mode {
            QuirksMode::Quirks => ve_dom::QuirksMode::Quirks,
            QuirksMode::LimitedQuirks => ve_dom::QuirksMode::LimitedQuirks,
            QuirksMode::NoQuirks => ve_dom::QuirksMode::NoQuirks,
        });
    }

    fn append_before_sibling(&self, sibling: &NodeId, new_node: NodeOrText<NodeId>) {
        let mut doc = self.doc.borrow_mut();
        let result = match new_node {
            NodeOrText::AppendNode(node) => doc.insert_before(*sibling, node),
            NodeOrText::AppendText(text) => doc.insert_text_before(*sibling, &text).map(|_| ()),
        };
        if let Err(e) = result {
            self.errors.borrow_mut().push(format!("insert failed: {e}"));
        }
    }

    fn add_attrs_if_missing(&self, target: &NodeId, attrs: Vec<Attribute>) {
        if let Err(e) = self
            .doc
            .borrow_mut()
            .add_attributes_if_missing(*target, Self::convert_attrs(attrs))
        {
            self.errors
                .borrow_mut()
                .push(format!("add attributes failed: {e}"));
        }
    }

    fn remove_from_parent(&self, target: &NodeId) {
        if let Err(e) = self.doc.borrow_mut().remove(*target) {
            self.errors.borrow_mut().push(format!("remove failed: {e}"));
        }
    }

    fn reparent_children(&self, node: &NodeId, new_parent: &NodeId) {
        if let Err(e) = self.doc.borrow_mut().reparent_children(*node, *new_parent) {
            self.errors
                .borrow_mut()
                .push(format!("reparent failed: {e}"));
        }
    }

    fn is_mathml_annotation_xml_integration_point(&self, handle: &NodeId) -> bool {
        let doc = self.doc.borrow();
        doc.element(*handle).is_some_and(|e| {
            e.namespace == Namespace::MathMl
                && e.name == "annotation-xml"
                && e.attr("encoding").is_some_and(|enc| {
                    enc.eq_ignore_ascii_case("text/html")
                        || enc.eq_ignore_ascii_case("application/xhtml+xml")
                })
        })
    }

    fn attach_declarative_shadow(
        &self,
        location: &NodeId,
        template: &NodeId,
        attrs: &[Attribute],
    ) -> bool {
        let mode = attrs
            .iter()
            .find(|a| &*a.name.local == "shadowrootmode")
            .and_then(|a| match a.value.to_ascii_lowercase().as_str() {
                "open" => Some(ShadowRootMode::Open),
                "closed" => Some(ShadowRootMode::Closed),
                _ => None,
            });
        let Some(mode) = mode else { return false };
        let mut doc = self.doc.borrow_mut();
        let Ok(root) = doc.attach_shadow(*location, mode) else {
            return false;
        };
        if let Some(contents) = doc.template_contents(*template) {
            let _ = doc.reparent_children(contents, root);
        }
        true
    }
}
