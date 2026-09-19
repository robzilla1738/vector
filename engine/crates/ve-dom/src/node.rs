//! Node payloads: [`Node`], [`NodeKind`], [`ElementData`] and friends.

use serde::{Deserialize, Serialize};
use ve_core::NodeId;

use crate::journal::DirtyFlags;

/// The XHTML namespace URI.
pub const HTML_NAMESPACE: &str = "http://www.w3.org/1999/xhtml";
/// The SVG namespace URI.
pub const SVG_NAMESPACE: &str = "http://www.w3.org/2000/svg";
/// The MathML namespace URI.
pub const MATHML_NAMESPACE: &str = "http://www.w3.org/1998/Math/MathML";

/// Element namespace. The common namespaces are enumerated so that matching
/// does not need string comparison on hot paths.
#[derive(Clone, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Namespace {
    /// `http://www.w3.org/1999/xhtml`.
    Html,
    /// `http://www.w3.org/2000/svg`.
    Svg,
    /// `http://www.w3.org/1998/Math/MathML`.
    MathMl,
    /// Any other namespace URI (including the empty namespace).
    Other(String),
}

impl Namespace {
    /// Maps a namespace URI to the enum, falling back to [`Namespace::Other`].
    #[must_use]
    pub fn from_uri(uri: &str) -> Self {
        match uri {
            HTML_NAMESPACE => Namespace::Html,
            SVG_NAMESPACE => Namespace::Svg,
            MATHML_NAMESPACE => Namespace::MathMl,
            other => Namespace::Other(other.to_owned()),
        }
    }

    /// The namespace URI.
    #[must_use]
    pub fn uri(&self) -> &str {
        match self {
            Namespace::Html => HTML_NAMESPACE,
            Namespace::Svg => SVG_NAMESPACE,
            Namespace::MathMl => MATHML_NAMESPACE,
            Namespace::Other(s) => s,
        }
    }
}

/// A content attribute. `name` is the qualified name as written (with prefix,
/// e.g. `xlink:href`), lower-cased for HTML elements by the parser.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Attribute {
    /// Qualified attribute name.
    pub name: String,
    /// Attribute value.
    pub value: String,
    /// Attribute namespace URI; `None` is the null namespace.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub namespace: Option<String>,
}

/// Shadow root encapsulation mode.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ShadowRootMode {
    /// `open`: reachable through `element.shadowRoot`.
    Open,
    /// `closed`: hidden from script; still visible to the engine.
    Closed,
}

/// Mutable state of a form control that is distinct from its content
/// attributes ("dirty value" and "dirty checkedness" in the HTML spec).
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct FormState {
    /// Current value. `None` means "not dirty": fall back to the `value`
    /// attribute (or the text content for `<textarea>`).
    pub value: Option<String>,
    /// Current checkedness. `None` means "not dirty": fall back to the
    /// presence of the `checked` attribute.
    pub checked: Option<bool>,
    /// Current selectedness for `<option>`. `None` falls back to the
    /// `selected` attribute.
    pub selected: Option<bool>,
    /// UTF-16 caret / selection start. `None` means unset (treat as 0).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub selection_start: Option<u32>,
    /// UTF-16 caret / selection end. `None` means unset (treat as value length).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub selection_end: Option<u32>,
}

/// Element specific data.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ElementData {
    /// Local name. Lower-case for HTML elements.
    pub name: String,
    /// Namespace prefix from the qualified name, if any (`x` in `x:b`).
    pub prefix: Option<String>,
    /// Element namespace.
    pub namespace: Namespace,
    /// Content attributes in source order.
    pub attributes: Vec<Attribute>,
    /// Form control state, if this is a form control that has been touched.
    pub form: Option<FormState>,
    /// For `<template>`: the id of the associated document fragment.
    pub template_contents: Option<NodeId>,
    /// For `<iframe>` / `<frame>`: the nested document's fragment (same
    /// arena, plan A16). Cross-origin frames leave this `None`.
    pub content_document: Option<NodeId>,
    /// The element's shadow root, if one has been attached.
    pub shadow_root: Option<NodeId>,
    /// Intrinsic size of a replaced element's content in CSS pixels
    /// (`naturalWidth`/`naturalHeight` for `<img>`), set once the resource
    /// has been fetched and its header decoded. Layout uses it when the
    /// element has no `width`/`height` from CSS or attributes.
    pub natural_size: Option<(u32, u32)>,
}

impl ElementData {
    /// Creates element data with no attributes.
    #[must_use]
    pub fn new(name: impl Into<String>, namespace: Namespace) -> Self {
        Self {
            name: name.into(),
            prefix: None,
            namespace,
            attributes: Vec::new(),
            form: None,
            template_contents: None,
            content_document: None,
            shadow_root: None,
            natural_size: None,
        }
    }

    /// Qualified name (`prefix:local` or `local`).
    #[must_use]
    pub fn qualified_name(&self) -> String {
        match &self.prefix {
            Some(prefix) if !prefix.is_empty() => format!("{}:{}", prefix, self.name),
            _ => self.name.clone(),
        }
    }

    /// DOM `tagName` / element `nodeName`.
    #[must_use]
    pub fn tag_name(&self) -> String {
        let qname = self.qualified_name();
        if self.namespace == Namespace::Html {
            qname.to_ascii_uppercase()
        } else {
            qname
        }
    }

    /// Returns `true` for an HTML element with the given local name.
    #[must_use]
    pub fn is_html(&self, name: &str) -> bool {
        self.namespace == Namespace::Html && self.name == name
    }

    /// Looks up an attribute value by qualified name.
    #[must_use]
    pub fn attr(&self, name: &str) -> Option<&str> {
        self.attributes
            .iter()
            .find(|a| a.name == name)
            .map(|a| a.value.as_str())
    }

    /// Returns `true` if the attribute is present (even if empty).
    ///
    /// HTML elements match ASCII-case-insensitively and ignore the attribute
    /// namespace, matching `Element.hasAttribute`.
    #[must_use]
    pub fn has_attr(&self, name: &str) -> bool {
        self.attributes.iter().any(|a| {
            let local = a.name.rsplit_once(':').map_or(a.name.as_str(), |(_, l)| l);
            if self.namespace == Namespace::Html {
                a.name.eq_ignore_ascii_case(name) || local.eq_ignore_ascii_case(name)
            } else {
                a.name == name || local == name
            }
        })
    }

    /// The `id` attribute.
    #[must_use]
    pub fn id(&self) -> Option<&str> {
        self.attr("id")
    }

    /// Iterates over the whitespace separated tokens of the `class` attribute.
    pub fn classes(&self) -> impl Iterator<Item = &str> {
        self.attr("class").unwrap_or("").split_ascii_whitespace()
    }

    /// Returns `true` if `class` is one of the element's classes.
    #[must_use]
    pub fn has_class(&self, class: &str) -> bool {
        self.classes().any(|c| c == class)
    }
}

/// What a node is.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum NodeKind {
    /// A document node. The arena's [`crate::Document::root`] is one;
    /// `createHTMLDocument` allocates additional detached document nodes in
    /// the same arena.
    Document,
    /// `<!DOCTYPE …>`.
    Doctype {
        /// Root element name, e.g. `html`.
        name: String,
        /// Public identifier (empty if absent).
        public_id: String,
        /// System identifier (empty if absent).
        system_id: String,
    },
    /// An element.
    Element(ElementData),
    /// A text node. Adjacent text nodes are merged on insertion by the parser.
    Text(String),
    /// A comment.
    Comment(String),
    /// A processing instruction.
    ProcessingInstruction {
        /// PI target.
        target: String,
        /// PI data.
        data: String,
    },
    /// A document fragment (template contents, parse-fragment results).
    DocumentFragment,
    /// A shadow root attached to a host element.
    ShadowRoot {
        /// Encapsulation mode.
        mode: ShadowRootMode,
    },
}

/// A node in the arena: tree links plus payload.
#[derive(Clone, Debug)]
pub struct Node {
    pub(crate) parent: Option<NodeId>,
    pub(crate) first_child: Option<NodeId>,
    pub(crate) last_child: Option<NodeId>,
    pub(crate) prev_sibling: Option<NodeId>,
    pub(crate) next_sibling: Option<NodeId>,
    /// For shadow roots: the host element. `None` otherwise.
    pub(crate) host: Option<NodeId>,
    /// Which downstream stages must revisit this node.
    pub(crate) dirty: DirtyFlags,
    /// The payload.
    pub kind: NodeKind,
}

impl Node {
    pub(crate) fn new(kind: NodeKind) -> Self {
        Self {
            parent: None,
            first_child: None,
            last_child: None,
            prev_sibling: None,
            next_sibling: None,
            host: None,
            dirty: DirtyFlags::ALL,
            kind,
        }
    }

    /// Parent node (never crosses a shadow boundary).
    #[must_use]
    pub fn parent(&self) -> Option<NodeId> {
        self.parent
    }

    /// First child.
    #[must_use]
    pub fn first_child(&self) -> Option<NodeId> {
        self.first_child
    }

    /// Last child.
    #[must_use]
    pub fn last_child(&self) -> Option<NodeId> {
        self.last_child
    }

    /// Previous sibling.
    #[must_use]
    pub fn prev_sibling(&self) -> Option<NodeId> {
        self.prev_sibling
    }

    /// Next sibling.
    #[must_use]
    pub fn next_sibling(&self) -> Option<NodeId> {
        self.next_sibling
    }

    /// For a shadow root, its host element.
    #[must_use]
    pub fn host(&self) -> Option<NodeId> {
        self.host
    }

    /// Dirty flags currently set on this node.
    #[must_use]
    pub fn dirty(&self) -> DirtyFlags {
        self.dirty
    }

    /// Element data if this node is an element.
    #[must_use]
    pub fn as_element(&self) -> Option<&ElementData> {
        match &self.kind {
            NodeKind::Element(e) => Some(e),
            _ => None,
        }
    }

    /// Text, comment, or processing-instruction data.
    #[must_use]
    pub fn as_character_data(&self) -> Option<&str> {
        match &self.kind {
            NodeKind::Text(t) | NodeKind::Comment(t) => Some(t),
            NodeKind::ProcessingInstruction { data, .. } => Some(data),
            _ => None,
        }
    }

    /// Text if this node is a text node.
    #[must_use]
    pub fn as_text(&self) -> Option<&str> {
        match &self.kind {
            NodeKind::Text(t) => Some(t),
            _ => None,
        }
    }

    /// `true` when this is a document node.
    #[must_use]
    pub fn is_document(&self) -> bool {
        matches!(self.kind, NodeKind::Document)
    }

    /// Returns `true` for element nodes.
    #[must_use]
    pub fn is_element(&self) -> bool {
        matches!(self.kind, NodeKind::Element(_))
    }

    /// Returns `true` for text nodes.
    #[must_use]
    pub fn is_text(&self) -> bool {
        matches!(self.kind, NodeKind::Text(_))
    }

    /// DOM `nodeType` constant.
    #[must_use]
    pub fn node_type(&self) -> u16 {
        match self.kind {
            NodeKind::Element(_) => 1,
            NodeKind::Text(_) => 3,
            NodeKind::ProcessingInstruction { .. } => 7,
            NodeKind::Comment(_) => 8,
            NodeKind::Document => 9,
            NodeKind::Doctype { .. } => 10,
            NodeKind::DocumentFragment | NodeKind::ShadowRoot { .. } => 11,
        }
    }
}
