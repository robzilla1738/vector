//! The [`Document`] arena and tree operations.

use std::cell::RefCell;
use std::collections::{HashMap, HashSet};

use serde::{Deserialize, Serialize};
use ve_core::{Error, NodeId, Result, Revision};

use crate::journal::{DirtyFlags, Mutation, MutationJournal};
use crate::node::{Attribute, ElementData, FormState, Namespace, Node, NodeKind, ShadowRootMode};

/// Document quirks mode, as determined by the doctype.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Default, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum QuirksMode {
    /// Full standards mode.
    #[default]
    NoQuirks,
    /// Almost standards mode.
    LimitedQuirks,
    /// Full quirks mode.
    Quirks,
}

#[derive(Clone, Debug)]
struct Slot {
    generation: u32,
    node: Option<Node>,
}

/// An arena-allocated DOM tree. See the [crate documentation](crate) for the
/// contract.
#[derive(Clone, Debug)]
pub struct Document {
    slots: Vec<Slot>,
    free: Vec<u32>,
    live: usize,
    root: NodeId,
    quirks_mode: QuirksMode,
    journal: MutationJournal,
    /// HTTP `Content-Language` for `:lang()` fallback.
    content_language: Option<String>,
    /// Shadow roots created with `slotAssignment: "manual"`.
    manual_shadows: HashSet<NodeId>,
    /// Manual `slot.assign()` results keyed by slot.
    manual_assigned: HashMap<NodeId, Vec<NodeId>>,
    /// First-in-tree-order `id` → element, rebuilt on demand. `None` means
    /// dirty. jQuery `$('#…')` / `getElementById` must not walk a 6k-node
    /// Spectrum tree on every lookup.
    id_index: RefCell<Option<HashMap<String, NodeId>>>,
}

/// Strip and collapse ASCII whitespace per HTML `document.title`.
#[must_use]
pub fn collapse_ascii_whitespace(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut pending_space = false;
    let mut started = false;
    for c in s.chars() {
        if matches!(c, '\t' | '\n' | '\u{000C}' | '\r' | ' ') {
            pending_space = true;
            continue;
        }
        if started && pending_space {
            out.push(' ');
        }
        out.push(c);
        started = true;
        pending_space = false;
    }
    out
}

enum TitleKind {
    Html,
    Svg,
    Xml,
}

fn title_kind(doc: &Document, root: NodeId) -> TitleKind {
    match doc.document_element_of(root).and_then(|e| doc.element(e)) {
        Some(el) if el.is_html("html") => TitleKind::Html,
        Some(el) if el.namespace == Namespace::Svg && el.name == "svg" => TitleKind::Svg,
        _ => TitleKind::Xml,
    }
}

fn is_svg_title(doc: &Document, id: NodeId) -> bool {
    doc.element(id)
        .is_some_and(|el| el.namespace == Namespace::Svg && el.name == "title")
}

fn replace_title_text(doc: &mut Document, title: NodeId, text: &str) -> Result<()> {
    doc.clear_children(title)?;
    if !text.is_empty() {
        doc.append_text(title, text)?;
    }
    Ok(())
}

impl Default for Document {
    fn default() -> Self {
        Self::new()
    }
}

impl Document {
    /// Creates an empty document containing only the document node.
    #[must_use]
    pub fn new() -> Self {
        let mut doc = Self {
            slots: Vec::new(),
            free: Vec::new(),
            live: 0,
            root: NodeId::new(0, 0),
            quirks_mode: QuirksMode::NoQuirks,
            journal: MutationJournal::default(),
            content_language: None,
            manual_shadows: HashSet::new(),
            manual_assigned: HashMap::new(),
            id_index: RefCell::new(None),
        };
        doc.root = doc.alloc(NodeKind::Document);
        doc
    }

    // ----------------------------------------------------------------------
    // Allocation and lookup
    // ----------------------------------------------------------------------

    fn alloc(&mut self, kind: NodeKind) -> NodeId {
        self.live += 1;
        // Recycle a freed slot (plan A17). Destroy already bumped
        // `generation`, so a stale `r<index>` that still carries the old
        // generation fails `slot()` instead of resolving to the new node.
        if let Some(index) = self.free.pop() {
            let slot = &mut self.slots[index as usize];
            let generation = slot.generation;
            slot.node = Some(Node::new(kind));
            let id = NodeId::new(index, generation);
            self.journal.record(Mutation::NodeCreated { node: id });
            return id;
        }
        let index = u32::try_from(self.slots.len()).expect("arena exceeds u32::MAX nodes");
        self.slots.push(Slot {
            generation: 0,
            node: Some(Node::new(kind)),
        });
        let id = NodeId::new(index, 0);
        self.journal.record(Mutation::NodeCreated { node: id });
        id
    }

    fn slot(&self, id: NodeId) -> Option<&Node> {
        let slot = self.slots.get(id.index() as usize)?;
        (slot.generation == id.generation())
            .then_some(slot.node.as_ref())
            .flatten()
    }

    fn slot_mut(&mut self, id: NodeId) -> Option<&mut Node> {
        let slot = self.slots.get_mut(id.index() as usize)?;
        (slot.generation == id.generation())
            .then_some(slot.node.as_mut())
            .flatten()
    }

    /// Returns the node, or `None` if the id is unknown or stale.
    #[must_use]
    pub fn get(&self, id: NodeId) -> Option<&Node> {
        self.slot(id)
    }

    /// Returns the node, or [`Error::InvalidNodeId`].
    pub fn try_get(&self, id: NodeId) -> Result<&Node> {
        self.slot(id).ok_or(Error::InvalidNodeId(id))
    }

    fn try_get_mut(&mut self, id: NodeId) -> Result<&mut Node> {
        self.slot_mut(id).ok_or(Error::InvalidNodeId(id))
    }

    /// Returns `true` if `id` refers to a live node.
    #[must_use]
    pub fn contains(&self, id: NodeId) -> bool {
        self.slot(id).is_some()
    }

    /// Resolves an arena slot index (the `r<index>` agent ref) to the live
    /// node occupying it.
    ///
    /// * `Ok(Some(id))` — the slot holds a live node.
    /// * `Ok(None)` — the slot existed but its node was destroyed (tombstone).
    /// * `Err(())` — no node ever occupied this index.
    #[allow(clippy::result_unit_err)]
    pub fn node_at_index(&self, index: u32) -> Result<Option<NodeId>, ()> {
        let slot = self.slots.get(index as usize).ok_or(())?;
        Ok(slot
            .node
            .as_ref()
            .map(|_| NodeId::new(index, slot.generation)))
    }

    /// Number of arena slots ever allocated (live + tombstones).
    #[must_use]
    pub fn slot_count(&self) -> usize {
        self.slots.len()
    }

    /// Records a scroll of `container` (`None` = the viewport) in the journal
    /// so observers can report it. Does not mark anything dirty.
    pub fn record_scrolled(&mut self, container: Option<NodeId>) {
        self.journal.record(Mutation::Scrolled { node: container });
    }

    /// Number of live nodes, including the document node.
    #[must_use]
    pub fn node_count(&self) -> usize {
        self.live
    }

    /// Arena length (next index if no free slots). Used to tell parser
    /// nodes from script-created nodes.
    #[must_use]
    pub fn arena_len(&self) -> u32 {
        u32::try_from(self.slots.len()).unwrap_or(u32::MAX)
    }

    /// The document node.
    #[must_use]
    pub fn root(&self) -> NodeId {
        self.root
    }

    /// Current quirks mode.
    #[must_use]
    pub fn quirks_mode(&self) -> QuirksMode {
        self.quirks_mode
    }

    /// HTTP `Content-Language` used when no `lang` attribute is in scope.
    #[must_use]
    pub fn content_language(&self) -> Option<&str> {
        self.content_language.as_deref()
    }

    /// Sets the HTTP `Content-Language` fallback (first header value).
    pub fn set_content_language(&mut self, value: Option<String>) {
        self.content_language = value.filter(|s| !s.is_empty());
    }

    /// Sets the quirks mode (called by the parser).
    pub fn set_quirks_mode(&mut self, mode: QuirksMode) {
        if self.quirks_mode != mode {
            self.quirks_mode = mode;
            self.journal.record(Mutation::QuirksModeChanged);
        }
    }

    /// Current revision (advances on every mutation).
    #[must_use]
    pub fn revision(&self) -> Revision {
        self.journal.revision()
    }

    /// The mutation journal.
    #[must_use]
    pub fn journal(&self) -> &MutationJournal {
        &self.journal
    }

    // ----------------------------------------------------------------------
    // Node creation
    // ----------------------------------------------------------------------

    /// Creates a detached element.
    pub fn create_element(&mut self, name: impl Into<String>, namespace: Namespace) -> NodeId {
        self.create_element_qname(name, namespace, None)
    }

    /// Creates a detached element with an optional namespace prefix.
    pub fn create_element_qname(
        &mut self,
        name: impl Into<String>,
        namespace: Namespace,
        prefix: Option<String>,
    ) -> NodeId {
        let name = name.into();
        let is_template = namespace == Namespace::Html && name.eq_ignore_ascii_case("template");
        let mut data = ElementData::new(name, namespace);
        data.prefix = prefix.filter(|p| !p.is_empty());
        let id = self.alloc(NodeKind::Element(data));
        if is_template {
            self.ensure_template_contents(id);
        }
        id
    }

    /// Sets the namespace prefix on an element (parser / `createElementNS`).
    pub fn set_element_prefix(&mut self, id: NodeId, prefix: Option<String>) {
        if let Ok(node) = self.try_get_mut(id)
            && let NodeKind::Element(e) = &mut node.kind
        {
            e.prefix = prefix.filter(|p| !p.is_empty());
        }
    }

    /// Creates a detached element with attributes.
    pub fn create_element_with_attrs(
        &mut self,
        name: impl Into<String>,
        namespace: Namespace,
        attributes: Vec<Attribute>,
    ) -> NodeId {
        let name = name.into();
        let is_template = namespace == Namespace::Html && name.eq_ignore_ascii_case("template");
        let mut data = ElementData::new(name, namespace);
        data.attributes = attributes;
        let id = self.alloc(NodeKind::Element(data));
        if is_template {
            self.ensure_template_contents(id);
        }
        id
    }

    fn ensure_template_contents(&mut self, id: NodeId) {
        if self.template_contents(id).is_some() {
            return;
        }
        let frag = self.create_fragment();
        let _ = self.set_template_contents(id, frag);
    }

    /// Creates a detached text node.
    pub fn create_text(&mut self, text: impl Into<String>) -> NodeId {
        self.alloc(NodeKind::Text(text.into()))
    }

    /// Creates a detached comment.
    pub fn create_comment(&mut self, text: impl Into<String>) -> NodeId {
        self.alloc(NodeKind::Comment(text.into()))
    }

    /// Creates a detached processing instruction.
    pub fn create_processing_instruction(
        &mut self,
        target: impl Into<String>,
        data: impl Into<String>,
    ) -> NodeId {
        self.alloc(NodeKind::ProcessingInstruction {
            target: target.into(),
            data: data.into(),
        })
    }

    /// Creates a detached document fragment.
    pub fn create_fragment(&mut self) -> NodeId {
        self.alloc(NodeKind::DocumentFragment)
    }

    /// Creates a detached document node (HTML `createHTMLDocument`).
    pub fn create_document(&mut self) -> NodeId {
        self.alloc(NodeKind::Document)
    }

    /// HTML `DOMImplementation.createHTMLDocument`.
    ///
    /// `title: Some` always creates a `<title>` (including `Some("")`).
    /// `title: None` omits the title element.
    pub fn create_html_document(&mut self, title: Option<&str>) -> NodeId {
        let doc = self.create_document();
        let doctype = self.create_doctype("html", "", "");
        let html = self.create_element("html", Namespace::Html);
        let head = self.create_element("head", Namespace::Html);
        let body = self.create_element("body", Namespace::Html);
        let _ = self.append_child(doc, doctype);
        let _ = self.append_child(doc, html);
        let _ = self.append_child(html, head);
        if let Some(text) = title {
            let title_el = self.create_element("title", Namespace::Html);
            let _ = self.append_child(head, title_el);
            let _ = self.append_text(title_el, text);
        }
        let _ = self.append_child(html, body);
        doc
    }

    /// Creates a detached doctype node.
    pub fn create_doctype(
        &mut self,
        name: impl Into<String>,
        public_id: impl Into<String>,
        system_id: impl Into<String>,
    ) -> NodeId {
        self.alloc(NodeKind::Doctype {
            name: name.into(),
            public_id: public_id.into(),
            system_id: system_id.into(),
        })
    }

    // ----------------------------------------------------------------------
    // Tree structure
    // ----------------------------------------------------------------------

    /// Parent of `id`.
    #[must_use]
    pub fn parent(&self, id: NodeId) -> Option<NodeId> {
        self.get(id).and_then(Node::parent)
    }

    /// First child of `id`.
    #[must_use]
    pub fn first_child(&self, id: NodeId) -> Option<NodeId> {
        self.get(id).and_then(Node::first_child)
    }

    /// Last child of `id`.
    #[must_use]
    pub fn last_child(&self, id: NodeId) -> Option<NodeId> {
        self.get(id).and_then(Node::last_child)
    }

    /// Next sibling of `id`.
    #[must_use]
    pub fn next_sibling(&self, id: NodeId) -> Option<NodeId> {
        self.get(id).and_then(Node::next_sibling)
    }

    /// Previous sibling of `id`.
    #[must_use]
    pub fn prev_sibling(&self, id: NodeId) -> Option<NodeId> {
        self.get(id).and_then(Node::prev_sibling)
    }

    /// Iterates over the children of `id` in order.
    #[must_use]
    pub fn children(&self, id: NodeId) -> Children<'_> {
        Children {
            doc: self,
            next: self.first_child(id),
        }
    }

    /// Iterates over all descendants of `id` in tree (pre-)order, excluding
    /// `id` itself and never entering shadow trees.
    #[must_use]
    pub fn descendants(&self, id: NodeId) -> Descendants<'_> {
        Descendants {
            doc: self,
            root: id,
            next: self.first_child(id),
        }
    }

    /// Iterates over the ancestors of `id`, nearest first, excluding `id`.
    #[must_use]
    pub fn ancestors(&self, id: NodeId) -> Ancestors<'_> {
        Ancestors {
            doc: self,
            next: self.parent(id),
        }
    }

    /// Iterates over every element in the light tree in tree order.
    pub fn elements(&self) -> impl Iterator<Item = NodeId> + '_ {
        self.descendants(self.root)
            .filter(|&id| self.get(id).is_some_and(Node::is_element))
    }

    /// Returns `true` if `ancestor` is a proper ancestor of `id`.
    #[must_use]
    pub fn is_ancestor_of(&self, ancestor: NodeId, id: NodeId) -> bool {
        self.ancestors(id).any(|a| a == ancestor)
    }

    /// Appends `child` as the last child of `parent`, detaching it first if
    /// needed.
    pub fn append_child(&mut self, parent: NodeId, child: NodeId) -> Result<()> {
        self.check_insertable(parent, child)?;
        self.detach(child);
        let prev = self.try_get(parent)?.last_child;
        {
            let node = self.try_get_mut(child)?;
            node.parent = Some(parent);
            node.prev_sibling = prev;
            node.next_sibling = None;
        }
        match prev {
            Some(p) => self.try_get_mut(p)?.next_sibling = Some(child),
            None => self.try_get_mut(parent)?.first_child = Some(child),
        }
        self.try_get_mut(parent)?.last_child = Some(child);
        self.after_insert(parent, child);
        Ok(())
    }

    /// Inserts `child` immediately before `sibling` (which must have a parent).
    pub fn insert_before(&mut self, sibling: NodeId, child: NodeId) -> Result<()> {
        let parent = self
            .parent(sibling)
            .ok_or_else(|| Error::InvalidState(format!("{sibling} has no parent")))?;
        self.check_insertable(parent, child)?;
        if sibling == child {
            return Ok(());
        }
        self.detach(child);
        let prev = self.try_get(sibling)?.prev_sibling;
        {
            let node = self.try_get_mut(child)?;
            node.parent = Some(parent);
            node.prev_sibling = prev;
            node.next_sibling = Some(sibling);
        }
        self.try_get_mut(sibling)?.prev_sibling = Some(child);
        match prev {
            Some(p) => self.try_get_mut(p)?.next_sibling = Some(child),
            None => self.try_get_mut(parent)?.first_child = Some(child),
        }
        self.after_insert(parent, child);
        Ok(())
    }

    fn check_insertable(&self, parent: NodeId, child: NodeId) -> Result<()> {
        self.try_get(parent)?;
        let node = self.try_get(child)?;
        if matches!(node.kind, NodeKind::Document) {
            return Err(Error::InvalidState(
                "cannot insert the document node".into(),
            ));
        }
        if parent == child || self.is_ancestor_of(child, parent) {
            return Err(Error::InvalidState(format!(
                "{child} cannot contain itself"
            )));
        }
        Ok(())
    }

    fn after_insert(&mut self, parent: NodeId, child: NodeId) {
        let (previous_sibling, next_sibling) = self
            .get(child)
            .map_or((None, None), |n| (n.prev_sibling(), n.next_sibling()));
        self.journal.record(Mutation::NodeInserted {
            node: child,
            parent,
            previous_sibling,
            next_sibling,
        });
        self.mark_dirty(child, DirtyFlags::ALL);
        self.mark_dirty(
            parent,
            DirtyFlags::LAYOUT | DirtyFlags::A11Y | DirtyFlags::PAINT,
        );
        self.dirty_auto_dir_ancestors(parent);
        self.invalidate_id_index();
    }

    /// Unlinks `child` from its parent without journaling.
    fn detach(&mut self, child: NodeId) -> Option<NodeId> {
        let (parent, prev, next) = {
            let node = self.slot(child)?;
            (node.parent?, node.prev_sibling, node.next_sibling)
        };
        match prev {
            Some(p) => {
                if let Some(n) = self.slot_mut(p) {
                    n.next_sibling = next;
                }
            }
            None => {
                if let Some(n) = self.slot_mut(parent) {
                    n.first_child = next;
                }
            }
        }
        match next {
            Some(nx) => {
                if let Some(n) = self.slot_mut(nx) {
                    n.prev_sibling = prev;
                }
            }
            None => {
                if let Some(n) = self.slot_mut(parent) {
                    n.last_child = prev;
                }
            }
        }
        if let Some(n) = self.slot_mut(child) {
            n.parent = None;
            n.prev_sibling = None;
            n.next_sibling = None;
        }
        Some(parent)
    }

    /// Detaches `child` from its parent. The node stays alive and can be
    /// re-inserted. Returns the former parent.
    pub fn remove(&mut self, child: NodeId) -> Result<Option<NodeId>> {
        self.try_get(child)?;
        let (previous_sibling, next_sibling) = self
            .get(child)
            .map_or((None, None), |n| (n.prev_sibling(), n.next_sibling()));
        let parent = self.detach(child);
        if let Some(parent) = parent {
            self.journal.record(Mutation::NodeRemoved {
                node: child,
                parent,
                previous_sibling,
                next_sibling,
            });
            // STYLE: the remaining siblings' structural pseudo-classes
            // (`:nth-child`, `:empty`, sibling combinators) may change.
            self.mark_dirty(
                parent,
                DirtyFlags::STYLE | DirtyFlags::LAYOUT | DirtyFlags::A11Y | DirtyFlags::PAINT,
            );
            self.invalidate_id_index();
        }
        Ok(parent)
    }

    /// Replaces `parent`'s children with `incoming` in one splice.
    ///
    /// Same tree and journal effects as remove-all then append-each, but
    /// dirties `parent` once instead of once per child. Used by the DOM
    /// `replaceChildren` binding (`TodoMVC` `showEntries`).
    pub fn replace_children(&mut self, parent: NodeId, incoming: &[NodeId]) -> Result<()> {
        self.try_get(parent)?;
        for &kid in incoming {
            self.check_insertable(parent, kid)?;
        }
        let existing: Vec<NodeId> = self.children(parent).collect();
        for &kid in &existing {
            let (previous_sibling, next_sibling) = self
                .get(kid)
                .map_or((None, None), |n| (n.prev_sibling(), n.next_sibling()));
            if let Some(old_parent) = self.detach(kid) {
                self.journal.record(Mutation::NodeRemoved {
                    node: kid,
                    parent: old_parent,
                    previous_sibling,
                    next_sibling,
                });
            }
        }
        for &kid in incoming {
            self.detach(kid);
            let prev = self.try_get(parent)?.last_child;
            {
                let node = self.try_get_mut(kid)?;
                node.parent = Some(parent);
                node.prev_sibling = prev;
                node.next_sibling = None;
            }
            match prev {
                Some(p) => self.try_get_mut(p)?.next_sibling = Some(kid),
                None => self.try_get_mut(parent)?.first_child = Some(kid),
            }
            self.try_get_mut(parent)?.last_child = Some(kid);
            let (previous_sibling, next_sibling) = self
                .get(kid)
                .map_or((None, None), |n| (n.prev_sibling(), n.next_sibling()));
            self.journal.record(Mutation::NodeInserted {
                node: kid,
                parent,
                previous_sibling,
                next_sibling,
            });
            self.mark_dirty(kid, DirtyFlags::ALL);
        }
        self.mark_dirty(
            parent,
            DirtyFlags::STYLE | DirtyFlags::LAYOUT | DirtyFlags::A11Y | DirtyFlags::PAINT,
        );
        self.dirty_auto_dir_ancestors(parent);
        self.invalidate_id_index();
        Ok(())
    }

    /// Detaches `id` and frees it together with its whole subtree (including)
    /// shadow trees and template contents). All ids in the subtree become
    /// stale.
    pub fn destroy(&mut self, id: NodeId) -> Result<()> {
        if id == self.root {
            return Err(Error::InvalidState(
                "cannot destroy the document node".into(),
            ));
        }
        self.remove(id)?;
        let mut stack = vec![id];
        while let Some(cur) = stack.pop() {
            let Some(node) = self.slot(cur) else { continue };
            stack.extend(self.children(cur));
            if let NodeKind::Element(e) = &node.kind {
                stack.extend(e.shadow_root);
                stack.extend(e.template_contents);
                stack.extend(e.content_document);
            }
            let slot = &mut self.slots[cur.index() as usize];
            slot.node = None;
            slot.generation = slot.generation.wrapping_add(1);
            self.free.push(cur.index());
            self.live -= 1;
            self.journal.record(Mutation::NodeDestroyed { node: cur });
        }
        Ok(())
    }

    /// Destroys every child of `parent`.
    pub fn clear_children(&mut self, parent: NodeId) -> Result<()> {
        let kids: Vec<NodeId> = self.children(parent).collect();
        for kid in kids {
            self.destroy(kid)?;
        }
        Ok(())
    }

    /// Clones `id`. When `deep`, clones the light-tree descendants too.
    /// Shadow roots are not cloned.
    pub fn clone_node(&mut self, id: NodeId, deep: bool) -> Result<NodeId> {
        let kind = match &self.try_get(id)?.kind {
            NodeKind::Element(e) => {
                let mut data = e.clone();
                data.shadow_root = None;
                data.template_contents = None;
                data.content_document = None;
                NodeKind::Element(data)
            }
            NodeKind::Text(t) => NodeKind::Text(t.clone()),
            NodeKind::Comment(t) => NodeKind::Comment(t.clone()),
            NodeKind::DocumentFragment => NodeKind::DocumentFragment,
            NodeKind::ProcessingInstruction { target, data } => NodeKind::ProcessingInstruction {
                target: target.clone(),
                data: data.clone(),
            },
            NodeKind::Doctype {
                name,
                public_id,
                system_id,
            } => NodeKind::Doctype {
                name: name.clone(),
                public_id: public_id.clone(),
                system_id: system_id.clone(),
            },
            NodeKind::Document | NodeKind::ShadowRoot { .. } => {
                return Err(Error::InvalidState("cannot clone this node".into()));
            }
        };
        let clone = self.alloc(kind);
        if let Some(src) = self.template_contents(id) {
            let frag = self.create_fragment();
            self.set_template_contents(clone, frag)?;
            if deep {
                let kids: Vec<NodeId> = self.children(src).collect();
                for kid in kids {
                    let child = self.clone_node(kid, true)?;
                    self.append_child(frag, child)?;
                }
            }
        }
        if deep {
            let kids: Vec<NodeId> = self.children(id).collect();
            for kid in kids {
                let child = self.clone_node(kid, true)?;
                self.append_child(clone, child)?;
            }
        }
        Ok(clone)
    }

    /// Moves every child of `from` to the end of `to`, preserving order.
    pub fn reparent_children(&mut self, from: NodeId, to: NodeId) -> Result<()> {
        let kids: Vec<NodeId> = self.children(from).collect();
        for kid in kids {
            self.append_child(to, kid)?;
        }
        Ok(())
    }

    // ----------------------------------------------------------------------
    // Text
    // ----------------------------------------------------------------------

    /// Appends text to `parent`, merging into a trailing text node if present.
    /// Returns the text node that received the data.
    pub fn append_text(&mut self, parent: NodeId, text: &str) -> Result<NodeId> {
        if let Some(last) = self.last_child(parent)
            && matches!(self.get(last).map(|n| &n.kind), Some(NodeKind::Text(_)))
        {
            let old = self
                .get(last)
                .and_then(Node::as_text)
                .map(ToOwned::to_owned);
            if let Some(NodeKind::Text(existing)) = self.slot_mut(last).map(|n| &mut n.kind) {
                existing.push_str(text);
                self.journal.record(Mutation::TextChanged {
                    node: last,
                    old_value: old,
                });
                self.mark_dirty(
                    last,
                    DirtyFlags::TEXT | DirtyFlags::LAYOUT | DirtyFlags::A11Y,
                );
                self.dirty_auto_dir_ancestors(parent);
                return Ok(last);
            }
        }
        let node = self.create_text(text);
        self.append_child(parent, node)?;
        Ok(node)
    }

    /// Inserts text before `sibling`, merging into the preceding text node if
    /// there is one. Returns the text node that received the data.
    pub fn insert_text_before(&mut self, sibling: NodeId, text: &str) -> Result<NodeId> {
        if let Some(prev) = self.prev_sibling(sibling)
            && matches!(self.get(prev).map(|n| &n.kind), Some(NodeKind::Text(_)))
        {
            let old = self
                .get(prev)
                .and_then(Node::as_text)
                .map(ToOwned::to_owned);
            if let Some(NodeKind::Text(existing)) = self.slot_mut(prev).map(|n| &mut n.kind) {
                existing.push_str(text);
                self.journal.record(Mutation::TextChanged {
                    node: prev,
                    old_value: old,
                });
                self.mark_dirty(
                    prev,
                    DirtyFlags::TEXT | DirtyFlags::LAYOUT | DirtyFlags::A11Y,
                );
                return Ok(prev);
            }
        }
        let node = self.create_text(text);
        self.insert_before(sibling, node)?;
        Ok(node)
    }

    /// Replaces the data of a text, comment, or processing-instruction node.
    pub fn set_text(&mut self, id: NodeId, text: impl Into<String>) -> Result<()> {
        let old = self
            .get(id)
            .and_then(Node::as_character_data)
            .map(ToOwned::to_owned);
        let node = self.try_get_mut(id)?;
        match &mut node.kind {
            NodeKind::Text(t) | NodeKind::Comment(t) => *t = text.into(),
            NodeKind::ProcessingInstruction { data, .. } => *data = text.into(),
            _ => return Err(Error::InvalidState(format!("{id} is not character data"))),
        }
        self.journal.record(Mutation::TextChanged {
            node: id,
            old_value: old,
        });
        self.mark_dirty(id, DirtyFlags::TEXT | DirtyFlags::LAYOUT | DirtyFlags::A11Y);
        Ok(())
    }

    /// Concatenated text of descendant text nodes, or this node's data for
    /// `Text`/`Comment`/`ProcessingInstruction`. `Document` and `DocumentType`
    /// return the empty string (DOM `textContent` is `null` at the binding).
    #[must_use]
    pub fn text_content(&self, id: NodeId) -> String {
        match self.get(id).map(|n| &n.kind) {
            Some(NodeKind::Text(t) | NodeKind::Comment(t)) => t.clone(),
            Some(NodeKind::ProcessingInstruction { data, .. }) => data.clone(),
            Some(NodeKind::Document | NodeKind::Doctype { .. }) => String::new(),
            _ => {
                let mut out = String::new();
                for d in self.descendants(id) {
                    if let Some(t) = self.get(d).and_then(Node::as_text) {
                        out.push_str(t);
                    }
                }
                out
            }
        }
    }

    // ----------------------------------------------------------------------
    // Elements and attributes
    // ----------------------------------------------------------------------

    /// Element data for `id`, or `None` if it is not a live element.
    #[must_use]
    pub fn element(&self, id: NodeId) -> Option<&ElementData> {
        self.get(id).and_then(Node::as_element)
    }

    /// Element data for `id`, or an error.
    pub fn try_element(&self, id: NodeId) -> Result<&ElementData> {
        match &self.try_get(id)?.kind {
            NodeKind::Element(e) => Ok(e),
            _ => Err(Error::NotAnElement(id)),
        }
    }

    fn try_element_mut(&mut self, id: NodeId) -> Result<&mut ElementData> {
        match &mut self.try_get_mut(id)?.kind {
            NodeKind::Element(e) => Ok(e),
            _ => Err(Error::NotAnElement(id)),
        }
    }

    /// Value of attribute `name` on element `id`.
    #[must_use]
    pub fn attribute(&self, id: NodeId, name: &str) -> Option<&str> {
        self.element(id).and_then(|e| e.attr(name))
    }

    /// Sets (or adds) an attribute. Returns the previous value.
    pub fn set_attribute(
        &mut self,
        id: NodeId,
        name: impl Into<String>,
        value: impl Into<String>,
    ) -> Result<Option<String>> {
        let name = name.into();
        let value = value.into();
        let element = self.try_element_mut(id)?;
        let old = if let Some(attr) = element
            .attributes
            .iter_mut()
            .find(|a| a.namespace.is_none() && a.name == name)
        {
            Some(std::mem::replace(&mut attr.value, value))
        } else {
            element.attributes.push(Attribute {
                name: name.clone(),
                value,
                namespace: None,
            });
            None
        };
        let is_id = name == "id";
        self.journal.record(Mutation::AttributeChanged {
            node: id,
            name,
            old_value: old.clone(),
        });
        self.mark_dirty(id, DirtyFlags::ALL);
        if is_id {
            self.invalidate_id_index();
        }
        Ok(old)
    }

    /// Sets an attribute in `namespace` (empty/`None` is the null namespace).
    pub fn set_attribute_ns(
        &mut self,
        id: NodeId,
        namespace: Option<&str>,
        qname: impl Into<String>,
        value: impl Into<String>,
    ) -> Result<Option<String>> {
        let qname = qname.into();
        let value = value.into();
        let ns = namespace
            .map(str::trim)
            .filter(|s| !s.is_empty())
            .map(str::to_owned);
        let local = qname.rsplit_once(':').map_or(qname.as_str(), |(_, l)| l);
        let element = self.try_element_mut(id)?;
        let old = if let Some(attr) = element.attributes.iter_mut().find(|a| {
            a.namespace == ns
                && a.name.rsplit_once(':').map_or(a.name.as_str(), |(_, l)| l) == local
        }) {
            Some(std::mem::replace(&mut attr.value, value))
        } else {
            element.attributes.push(Attribute {
                name: qname.clone(),
                value,
                namespace: ns,
            });
            None
        };
        let is_id = local == "id";
        self.journal.record(Mutation::AttributeChanged {
            node: id,
            name: qname,
            old_value: old.clone(),
        });
        self.mark_dirty(id, DirtyFlags::ALL);
        if is_id {
            self.invalidate_id_index();
        }
        Ok(old)
    }

    /// Value of a namespaced attribute (`None`/`""` is the null namespace).
    #[must_use]
    pub fn attribute_ns(&self, id: NodeId, namespace: Option<&str>, local: &str) -> Option<&str> {
        let ns = namespace.map(str::trim).filter(|s| !s.is_empty());
        self.element(id).and_then(|e| {
            e.attributes.iter().find_map(|a| {
                let same_ns = a.namespace.as_deref() == ns;
                let al = a.name.rsplit_once(':').map_or(a.name.as_str(), |(_, l)| l);
                (same_ns && al == local).then_some(a.value.as_str())
            })
        })
    }

    /// Records the fetched intrinsic size of a replaced element (an image's
    /// natural dimensions). Marks layout dirty; no journal record, because
    /// this is not a DOM mutation a script could observe as one.
    pub fn set_natural_size(&mut self, id: NodeId, width: u32, height: u32) -> Result<()> {
        let element = self.try_element_mut(id)?;
        element.natural_size = Some((width, height));
        self.mark_dirty(id, DirtyFlags::ALL);
        Ok(())
    }

    /// Adds attributes that are not already present (parser semantics for a
    /// duplicate `<html>`/`<body>` start tag).
    pub fn add_attributes_if_missing(&mut self, id: NodeId, attrs: Vec<Attribute>) -> Result<()> {
        let element = self.try_element_mut(id)?;
        let mut added = Vec::new();
        for attr in attrs {
            if !element.has_attr(&attr.name) {
                added.push(attr.name.clone());
                element.attributes.push(attr);
            }
        }
        if !added.is_empty() {
            let touched_id = added.iter().any(|n| n == "id");
            for name in added {
                self.journal.record(Mutation::AttributeChanged {
                    node: id,
                    name,
                    old_value: None,
                });
            }
            self.mark_dirty(id, DirtyFlags::ALL);
            if touched_id {
                self.invalidate_id_index();
            }
        }
        Ok(())
    }

    /// Removes an attribute. Returns the removed value, if any.
    pub fn remove_attribute(&mut self, id: NodeId, name: &str) -> Result<Option<String>> {
        let element = self.try_element_mut(id)?;
        let pos = element.attributes.iter().position(|a| a.name == name);
        let old = pos.map(|p| element.attributes.remove(p).value);
        if old.is_some() {
            self.journal.record(Mutation::AttributeChanged {
                node: id,
                name: name.to_owned(),
                old_value: old.clone(),
            });
            self.mark_dirty(id, DirtyFlags::ALL);
            if name == "id" {
                self.invalidate_id_index();
            }
        }
        Ok(old)
    }

    /// Associates a document fragment with a `<template>` element.
    pub fn set_template_contents(&mut self, template: NodeId, fragment: NodeId) -> Result<()> {
        self.try_get(fragment)?;
        self.try_element_mut(template)?.template_contents = Some(fragment);
        Ok(())
    }

    /// The template contents fragment of a `<template>` element.
    #[must_use]
    pub fn template_contents(&self, template: NodeId) -> Option<NodeId> {
        self.element(template).and_then(|e| e.template_contents)
    }

    /// Associates a nested document fragment with an `<iframe>` / `<frame>`.
    pub fn set_content_document(&mut self, frame: NodeId, fragment: NodeId) -> Result<()> {
        self.try_get(fragment)?;
        self.try_element_mut(frame)?.content_document = Some(fragment);
        Ok(())
    }

    /// The nested document fragment of an `<iframe>` / `<frame>`.
    #[must_use]
    pub fn content_document(&self, frame: NodeId) -> Option<NodeId> {
        self.element(frame).and_then(|e| e.content_document)
    }

    /// `true` when `id`'s shadow-including parent chain reaches a document.
    ///
    /// HTML treats a node as connected when its shadow-including root is a
    /// `Document`. Shadow children have no light `parent`; the walk must
    /// continue through the shadow root's host. Template contents stay
    /// disconnected: their fragment has neither a parent nor a host.
    #[must_use]
    pub fn is_connected(&self, id: NodeId) -> bool {
        let mut cur = id;
        loop {
            if self.get(cur).is_some_and(Node::is_document) {
                return true;
            }
            match self.parent(cur).or_else(|| self.host(cur)) {
                Some(p) => cur = p,
                None => return false,
            }
        }
    }

    /// The root element of `doc` (`<html>` for HTML documents).
    #[must_use]
    pub fn document_element_of(&self, doc: NodeId) -> Option<NodeId> {
        self.children(doc)
            .find(|&c| self.get(c).is_some_and(Node::is_element))
    }

    /// The document type node of `doc`, if any.
    #[must_use]
    pub fn doctype_of(&self, doc: NodeId) -> Option<NodeId> {
        self.children(doc)
            .find(|&c| matches!(self.get(c).map(|n| &n.kind), Some(NodeKind::Doctype { .. })))
    }

    /// The root element of this arena's browsing document.
    #[must_use]
    pub fn document_element(&self) -> Option<NodeId> {
        self.document_element_of(self.root)
    }

    /// The first HTML element with the given local name that is a child of
    /// `doc`'s document element (`head`).
    fn html_child_of(&self, doc: NodeId, name: &str) -> Option<NodeId> {
        let html = self.document_element_of(doc)?;
        self.children(html)
            .find(|&c| self.element(c).is_some_and(|e| e.is_html(name)))
    }

    /// The `<head>` element of `doc`.
    #[must_use]
    pub fn head_of(&self, doc: NodeId) -> Option<NodeId> {
        self.html_child_of(doc, "head")
    }

    /// The `<head>` element of the browsing document.
    #[must_use]
    pub fn head(&self) -> Option<NodeId> {
        self.head_of(self.root)
    }

    /// First HTML `body` or `frameset` child of an HTML `html` document element.
    #[must_use]
    pub fn body_of(&self, doc: NodeId) -> Option<NodeId> {
        let html = self.document_element_of(doc)?;
        if !self.element(html).is_some_and(|e| e.is_html("html")) {
            return None;
        }
        self.children(html).find(|&c| {
            self.element(c).is_some_and(|e| {
                e.namespace == Namespace::Html && (e.name == "body" || e.name == "frameset")
            })
        })
    }

    /// The `<body>` / `<frameset>` of the browsing document.
    #[must_use]
    pub fn body(&self) -> Option<NodeId> {
        self.body_of(self.root)
    }

    /// Title of `doc` (HTML / SVG / XML `document.title` getter).
    ///
    /// HTML collapsing uses ASCII whitespace only (U+0009, U+000A, U+000C,
    /// U+000D, U+0020). Other Unicode `White_Space` characters are kept.
    #[must_use]
    pub fn title_of(&self, doc: NodeId) -> Option<String> {
        let title =
            match title_kind(self, doc) {
                TitleKind::Svg => {
                    let root = self.document_element_of(doc)?;
                    self.children(root).find(|&e| is_svg_title(self, e))?
                }
                TitleKind::Html | TitleKind::Xml => std::iter::once(doc)
                    .chain(self.descendants(doc))
                    .find(|&e| self.element(e).is_some_and(|el| el.is_html("title")))?,
            };
        Some(collapse_ascii_whitespace(&self.text_content(title)))
    }

    /// Sets `document.title` for `doc`. XML documents that are not HTML or
    /// `svg` are a no-op. An empty value removes text children rather than
    /// inserting an empty text node.
    pub fn set_title_of(&mut self, doc: NodeId, text: &str) -> Result<()> {
        match title_kind(self, doc) {
            TitleKind::Xml => Ok(()),
            TitleKind::Svg => {
                let Some(root) = self.document_element_of(doc) else {
                    return Ok(());
                };
                let title = if let Some(t) = self.children(root).find(|&e| is_svg_title(self, e)) {
                    t
                } else {
                    let t = self.create_element("title", Namespace::Svg);
                    if let Some(first) = self.first_child(root) {
                        self.insert_before(first, t)?;
                    } else {
                        self.append_child(root, t)?;
                    }
                    t
                };
                replace_title_text(self, title, text)
            }
            TitleKind::Html => {
                let title = if let Some(t) = std::iter::once(doc)
                    .chain(self.descendants(doc))
                    .find(|&e| self.element(e).is_some_and(|el| el.is_html("title")))
                {
                    t
                } else {
                    let Some(head) = self.head_of(doc) else {
                        return Ok(());
                    };
                    let t = self.create_element("title", Namespace::Html);
                    self.append_child(head, t)?;
                    t
                };
                replace_title_text(self, title, text)
            }
        }
    }

    /// Title of the browsing document.
    #[must_use]
    pub fn title(&self) -> Option<String> {
        self.title_of(self.root)
    }

    fn invalidate_id_index(&mut self) {
        *self.id_index.borrow_mut() = None;
    }

    fn rebuild_id_index(&self) -> HashMap<String, NodeId> {
        let mut map = HashMap::new();
        for el in self.elements() {
            if let Some(id) = self.element(el).and_then(|e| e.id()) {
                map.entry(id.to_owned()).or_insert(el);
            }
        }
        map
    }

    fn indexed_id(&self, id: &str) -> Option<NodeId> {
        if self.id_index.borrow().is_none() {
            *self.id_index.borrow_mut() = Some(self.rebuild_id_index());
        }
        self.id_index
            .borrow()
            .as_ref()
            .and_then(|m| m.get(id).copied())
    }

    /// First element with `id` under `root` (inclusive).
    #[must_use]
    pub fn element_by_id_in(&self, root: NodeId, id: &str) -> Option<NodeId> {
        if id.is_empty() {
            return None;
        }
        if let Some(hit) = self.indexed_id(id) {
            if root == self.root || hit == root || self.is_ancestor_of(root, hit) {
                return Some(hit);
            }
        }
        std::iter::once(root)
            .chain(self.descendants(root))
            .find(|&e| self.attribute(e, "id") == Some(id))
    }

    /// The first element whose `id` attribute equals `id`.
    #[must_use]
    pub fn element_by_id(&self, id: &str) -> Option<NodeId> {
        if id.is_empty() {
            return None;
        }
        self.indexed_id(id)
    }

    // ----------------------------------------------------------------------
    // Shadow DOM
    // ----------------------------------------------------------------------

    /// Attaches a shadow root to `host`. Fails if one is already attached.
    pub fn attach_shadow(&mut self, host: NodeId, mode: ShadowRootMode) -> Result<NodeId> {
        if self.try_element(host)?.shadow_root.is_some() {
            return Err(Error::InvalidState(format!(
                "{host} already hosts a shadow root"
            )));
        }
        let root = self.alloc(NodeKind::ShadowRoot { mode });
        if let Some(n) = self.slot_mut(root) {
            n.host = Some(host);
        }
        self.try_element_mut(host)?.shadow_root = Some(root);
        self.journal.record(Mutation::ShadowAttached { host, root });
        self.mark_dirty(host, DirtyFlags::ALL);
        Ok(root)
    }

    /// Marks a shadow root as using manual slot assignment.
    pub fn set_shadow_manual_slots(&mut self, root: NodeId) {
        self.manual_shadows.insert(root);
    }

    /// Sets the nodes assigned to a manual slot (`HTMLSlotElement.assign`).
    pub fn assign_slot(&mut self, slot: NodeId, nodes: Vec<NodeId>) {
        self.manual_assigned.insert(slot, nodes);
        self.mark_dirty(slot, DirtyFlags::STYLE | DirtyFlags::STYLE_DESCENDANTS);
        if let Some(host) = self
            .containing_shadow_root(slot)
            .and_then(|shadow| self.host(shadow))
        {
            self.mark_dirty(host, DirtyFlags::STYLE | DirtyFlags::STYLE_DESCENDANTS);
        }
    }

    /// The shadow root hosted by `host`, if any.
    #[must_use]
    pub fn shadow_root(&self, host: NodeId) -> Option<NodeId> {
        self.element(host).and_then(|e| e.shadow_root)
    }

    /// Moves `<template shadowrootmode>` contents into the host's shadow root.
    /// html5ever may attach the shadow before template children are parsed.
    pub fn promote_declarative_shadows(&mut self) {
        let mut templates = Vec::new();
        let root = self.root;
        for id in std::iter::once(root).chain(self.descendants(root)) {
            if self.element(id).is_some_and(|e| e.is_html("template"))
                && self.attribute(id, "shadowrootmode").is_some()
            {
                templates.push(id);
            }
        }
        for template in templates {
            let Some(host) = self.parent(template) else {
                continue;
            };
            let mode = match self
                .attribute(template, "shadowrootmode")
                .unwrap_or("")
                .to_ascii_lowercase()
                .as_str()
            {
                "closed" => ShadowRootMode::Closed,
                _ => ShadowRootMode::Open,
            };
            let shadow = match self.shadow_root(host) {
                Some(s) => s,
                None => match self.attach_shadow(host, mode) {
                    Ok(s) => s,
                    Err(_) => continue,
                },
            };
            if let Some(contents) = self.template_contents(template) {
                let _ = self.reparent_children(contents, shadow);
            }
            let _ = self.reparent_children(template, shadow);
            let _ = self.remove(template);
        }
    }

    /// The host element of shadow root `root`.
    #[must_use]
    pub fn host(&self, root: NodeId) -> Option<NodeId> {
        self.get(root).and_then(Node::host)
    }

    /// Nearest ancestor shadow root of `id`, if the node is in a shadow tree.
    #[must_use]
    pub fn containing_shadow_root(&self, id: NodeId) -> Option<NodeId> {
        let mut cur = id;
        loop {
            let parent = self.parent(cur)?;
            if matches!(
                self.get(parent).map(|n| &n.kind),
                Some(NodeKind::ShadowRoot { .. })
            ) {
                return Some(parent);
            }
            cur = parent;
        }
    }

    /// Nodes assigned to `slot` from its host's light children.
    ///
    /// Named slots match `slot="<name>"`. The default slot (no `name`, or
    /// `name=""`) receives nodes with no `slot` attribute or `slot=""`.
    /// Fallback children of the slot are not included.
    #[must_use]
    pub fn assigned_nodes(&self, slot: NodeId) -> Vec<NodeId> {
        let Some(slot_el) = self.element(slot) else {
            return Vec::new();
        };
        if !slot_el.is_html("slot") {
            return Vec::new();
        }
        let Some(shadow) = self.containing_shadow_root(slot) else {
            return Vec::new();
        };
        if self.manual_shadows.contains(&shadow) {
            return self.manual_assigned.get(&slot).cloned().unwrap_or_default();
        }
        let Some(host) = self.host(shadow) else {
            return Vec::new();
        };
        let slot_name = slot_el.attr("name").filter(|n| !n.is_empty());
        self.children(host)
            .filter(|&child| match self.element(child) {
                Some(e) => {
                    let named = e.attr("slot").filter(|n| !n.is_empty());
                    match (slot_name, named) {
                        (None, None) => true,
                        (Some(want), Some(got)) => want == got,
                        _ => false,
                    }
                }
                None => slot_name.is_none(),
            })
            .collect()
    }

    /// The slot this node is assigned to, if any.
    #[must_use]
    pub fn assigned_slot(&self, id: NodeId) -> Option<NodeId> {
        let parent = self.parent(id)?;
        let shadow = self.shadow_root(parent)?;
        self.descendants(shadow).find(|&slot| {
            self.element(slot)
                .is_some_and(|e| e.is_html("slot") && self.assigned_nodes(slot).contains(&id))
        })
    }

    // ----------------------------------------------------------------------
    // Form state
    // ----------------------------------------------------------------------

    /// Raw form state, if the control has been touched.
    #[must_use]
    pub fn form_state(&self, id: NodeId) -> Option<&FormState> {
        self.element(id).and_then(|e| e.form.as_ref())
    }

    /// Effective value of a form control: the dirty value if set, else the
    /// `value` attribute, else (for `<textarea>`) the text content.
    #[must_use]
    pub fn form_value(&self, id: NodeId) -> Option<String> {
        let element = self.element(id)?;
        if let Some(v) = element.form.as_ref().and_then(|f| f.value.clone()) {
            return Some(v);
        }
        if element.is_html("select") {
            // The selected option's value; a single select with nothing
            // selected reports its first enabled option (the browser default).
            let options: Vec<NodeId> = self
                .descendants(id)
                .filter(|&d| self.element(d).is_some_and(|o| o.is_html("option")))
                .collect();
            let selected = options
                .iter()
                .copied()
                .find(|&o| self.is_selected(o))
                .or_else(|| {
                    (!element.has_attr("multiple"))
                        .then(|| {
                            options
                                .iter()
                                .copied()
                                .find(|&o| self.element(o).is_some_and(|e| !e.has_attr("disabled")))
                        })
                        .flatten()
                });
            return selected.map(|o| {
                self.attribute(o, "value")
                    .map_or_else(|| self.text_content(o).trim().to_owned(), str::to_owned)
            });
        }
        if let Some(v) = element.attr("value") {
            return Some(v.to_owned());
        }
        element.is_html("textarea").then(|| self.text_content(id))
    }

    /// Sets the dirty value of a form control.
    pub fn set_form_value(&mut self, id: NodeId, value: impl Into<String>) -> Result<()> {
        let value = value.into();
        let end = u32::try_from(value.encode_utf16().count()).unwrap_or(u32::MAX);
        let form = self
            .try_element_mut(id)?
            .form
            .get_or_insert_with(FormState::default);
        form.value = Some(value);
        form.selection_start = Some(end);
        form.selection_end = Some(end);
        self.journal.record(Mutation::FormStateChanged { node: id });
        self.mark_dirty(id, DirtyFlags::A11Y | DirtyFlags::PAINT);
        Ok(())
    }

    /// UTF-16 selection range for a form control. Unset start is 0; unset end
    /// is the current value length.
    #[must_use]
    pub fn form_selection(&self, id: NodeId) -> (u32, u32) {
        let len = u32::try_from(
            self.form_value(id)
                .unwrap_or_default()
                .encode_utf16()
                .count(),
        )
        .unwrap_or(u32::MAX);
        let form = self.element(id).and_then(|e| e.form.as_ref());
        let start = form.and_then(|f| f.selection_start).unwrap_or(0).min(len);
        let end = form
            .and_then(|f| f.selection_end)
            .unwrap_or(len)
            .clamp(start, len);
        (start, end)
    }

    /// Sets the UTF-16 selection range for a form control.
    pub fn set_form_selection(&mut self, id: NodeId, start: u32, end: u32) -> Result<()> {
        let len = u32::try_from(
            self.form_value(id)
                .unwrap_or_default()
                .encode_utf16()
                .count(),
        )
        .unwrap_or(u32::MAX);
        let start = start.min(len);
        let end = end.clamp(start, len);
        let form = self
            .try_element_mut(id)?
            .form
            .get_or_insert_with(FormState::default);
        form.selection_start = Some(start);
        form.selection_end = Some(end);
        self.journal.record(Mutation::FormStateChanged { node: id });
        Ok(())
    }

    /// Effective checkedness: dirty flag if set, else the `checked` attribute.
    #[must_use]
    pub fn is_checked(&self, id: NodeId) -> bool {
        self.element(id).is_some_and(|e| {
            e.form
                .as_ref()
                .and_then(|f| f.checked)
                .unwrap_or_else(|| e.has_attr("checked"))
        })
    }

    /// Sets the dirty checkedness of a checkbox/radio.
    pub fn set_checked(&mut self, id: NodeId, checked: bool) -> Result<()> {
        self.try_element_mut(id)?
            .form
            .get_or_insert_with(FormState::default)
            .checked = Some(checked);
        self.journal.record(Mutation::FormStateChanged { node: id });
        self.mark_dirty(id, DirtyFlags::STYLE | DirtyFlags::A11Y | DirtyFlags::PAINT);
        Ok(())
    }

    /// Effective selectedness of an `<option>`.
    #[must_use]
    pub fn is_selected(&self, id: NodeId) -> bool {
        self.element(id).is_some_and(|e| {
            e.form
                .as_ref()
                .and_then(|f| f.selected)
                .unwrap_or_else(|| e.has_attr("selected"))
        })
    }

    /// Sets the selectedness of an `<option>`.
    pub fn set_selected(&mut self, id: NodeId, selected: bool) -> Result<()> {
        self.try_element_mut(id)?
            .form
            .get_or_insert_with(FormState::default)
            .selected = Some(selected);
        self.journal.record(Mutation::FormStateChanged { node: id });
        self.mark_dirty(id, DirtyFlags::STYLE | DirtyFlags::A11Y | DirtyFlags::PAINT);
        Ok(())
    }

    // ----------------------------------------------------------------------
    // Geometry
    // ----------------------------------------------------------------------

    /// Records that layout changed the node's document-space rectangle. Sets
    /// the `A11Y` and `PAINT` bits (snapshots and paint consume geometry) and
    /// appends a [`Mutation::GeometryChanged`] record.
    pub fn record_geometry_change(&mut self, node: NodeId) {
        if !self.contains(node) {
            return;
        }
        self.journal.record(Mutation::GeometryChanged { node });
        self.mark_dirty(node, DirtyFlags::A11Y | DirtyFlags::PAINT);
    }

    /// Records a childList insertion for a node that is already in the tree.
    /// Used when the HTML parser insertion point advances so `MutationObserver`s
    /// can see newly-visible parser-inserted nodes.
    pub fn record_synthetic_insert(&mut self, parent: NodeId, child: NodeId) {
        if !self.contains(parent) || !self.contains(child) {
            return;
        }
        let (previous_sibling, next_sibling) = self
            .get(child)
            .map_or((None, None), |n| (n.prev_sibling(), n.next_sibling()));
        self.journal.record(Mutation::NodeInserted {
            node: child,
            parent,
            previous_sibling,
            next_sibling,
        });
    }

    // ----------------------------------------------------------------------
    // Dirty tracking
    // ----------------------------------------------------------------------

    fn dirty_auto_dir_ancestors(&mut self, id: NodeId) {
        let mut cur = Some(id);
        while let Some(n) = cur {
            let auto = self.element(n).is_some_and(|el| {
                el.attr("dir")
                    .is_some_and(|d| d.eq_ignore_ascii_case("auto"))
                    || el.is_html("bdi")
            });
            if auto {
                self.mark_dirty(n, DirtyFlags::STYLE);
            }
            cur = self.parent(n);
        }
    }

    /// Sets `flags` on `id` and [`DirtyFlags::DESCENDANTS`] on all ancestors
    /// (stopping early when an ancestor already carries it).
    pub fn mark_dirty(&mut self, id: NodeId, flags: DirtyFlags) {
        let Some(node) = self.slot_mut(id) else {
            return;
        };
        node.dirty |= flags;
        let mut cur = node.parent.or(node.host);
        while let Some(a) = cur {
            let Some(n) = self.slot_mut(a) else { break };
            if n.dirty.contains(DirtyFlags::DESCENDANTS) {
                break;
            }
            n.dirty |= DirtyFlags::DESCENDANTS;
            cur = n.parent.or(n.host);
        }
    }

    /// Clears `flags` on `id` only.
    pub fn clear_dirty(&mut self, id: NodeId, flags: DirtyFlags) {
        if let Some(n) = self.slot_mut(id) {
            n.dirty = n.dirty & !flags;
        }
    }

    /// Clears `flags` (and `DESCENDANTS`) on every live node. Used by stages
    /// that performed a full pass.
    pub fn clear_dirty_all(&mut self, flags: DirtyFlags) {
        for slot in &mut self.slots {
            if let Some(n) = slot.node.as_mut() {
                n.dirty = n.dirty & !(flags | DirtyFlags::DESCENDANTS);
            }
        }
    }

    /// Dirty flags of `id` (`NONE` for unknown ids).
    #[must_use]
    pub fn dirty(&self, id: NodeId) -> DirtyFlags {
        self.get(id).map(Node::dirty).unwrap_or_default()
    }

    /// Returns `true` if any live node carries any of `flags`.
    #[must_use]
    pub fn any_dirty(&self, flags: DirtyFlags) -> bool {
        self.slots
            .iter()
            .filter_map(|s| s.node.as_ref())
            .any(|n| n.dirty.intersects(flags))
    }
}

/// Iterator over a node's children.
pub struct Children<'a> {
    doc: &'a Document,
    next: Option<NodeId>,
}

impl Iterator for Children<'_> {
    type Item = NodeId;
    fn next(&mut self) -> Option<NodeId> {
        let cur = self.next?;
        self.next = self.doc.next_sibling(cur);
        Some(cur)
    }
}

/// Pre-order iterator over a subtree (excluding its root).
pub struct Descendants<'a> {
    doc: &'a Document,
    root: NodeId,
    next: Option<NodeId>,
}

impl Iterator for Descendants<'_> {
    type Item = NodeId;
    fn next(&mut self) -> Option<NodeId> {
        let cur = self.next?;
        // Advance: first child, else next sibling of the nearest ancestor (bounded by root).
        self.next = self.doc.first_child(cur).or_else(|| {
            let mut n = cur;
            loop {
                if n == self.root {
                    return None;
                }
                if let Some(s) = self.doc.next_sibling(n) {
                    return Some(s);
                }
                n = self.doc.parent(n)?;
            }
        });
        Some(cur)
    }
}

/// Iterator over a node's ancestors, nearest first.
pub struct Ancestors<'a> {
    doc: &'a Document,
    next: Option<NodeId>,
}

impl Iterator for Ancestors<'_> {
    type Item = NodeId;
    fn next(&mut self) -> Option<NodeId> {
        let cur = self.next?;
        self.next = self.doc.parent(cur);
        Some(cur)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn html(doc: &mut Document, name: &str) -> NodeId {
        doc.create_element(name, Namespace::Html)
    }

    #[test]
    fn tree_links_and_traversal() {
        let mut doc = Document::new();
        let root = doc.root();
        let html_el = html(&mut doc, "html");
        let body = html(&mut doc, "body");
        let p = html(&mut doc, "p");
        let b = html(&mut doc, "b");
        doc.append_child(root, html_el).unwrap();
        doc.append_child(html_el, body).unwrap();
        doc.append_child(body, p).unwrap();
        doc.append_child(body, b).unwrap();
        doc.append_text(p, "Hello").unwrap();
        doc.append_text(p, ", world").unwrap();

        assert_eq!(doc.children(body).collect::<Vec<_>>(), vec![p, b]);
        assert_eq!(doc.children(p).count(), 1, "adjacent text merged");
        assert_eq!(doc.text_content(body), "Hello, world");
        assert_eq!(doc.descendants(root).count(), 5);
        assert_eq!(
            doc.ancestors(b).collect::<Vec<_>>(),
            vec![body, html_el, root]
        );
        assert_eq!(doc.document_element(), Some(html_el));
        assert_eq!(doc.body(), Some(body));

        let i = html(&mut doc, "i");
        doc.insert_before(b, i).unwrap();
        assert_eq!(doc.children(body).collect::<Vec<_>>(), vec![p, i, b]);
        assert!(doc.append_child(p, body).is_err(), "cycle rejected");
    }

    #[test]
    fn destroy_invalidates_ids_and_recycles_slots() {
        let mut doc = Document::new();
        let root = doc.root();
        let div = html(&mut doc, "div");
        let span = html(&mut doc, "span");
        doc.append_child(root, div).unwrap();
        doc.append_child(div, span).unwrap();
        let before = doc.node_count();
        let span_index = span.index();
        let span_gen = span.generation();
        doc.destroy(div).unwrap();
        assert_eq!(doc.node_count(), before - 2);
        assert!(!doc.contains(div));
        assert!(!doc.contains(span));
        assert!(matches!(doc.try_get(span), Err(Error::InvalidNodeId(_))));

        let fresh = html(&mut doc, "em");
        assert_eq!(fresh.index(), span_index, "free list reused the slot");
        assert_ne!(fresh.generation(), span_gen, "generation bumped");
        assert!(doc.contains(fresh));
        assert!(doc.get(span).is_none());
        assert_eq!(doc.node_at_index(fresh.index()), Ok(Some(fresh)));
        assert_eq!(doc.node_at_index(9_999), Err(()), "never allocated");
    }

    #[test]
    fn journal_and_dirty_flags_follow_mutations() {
        let mut doc = Document::new();
        let root = doc.root();
        let div = html(&mut doc, "div");
        doc.append_child(root, div).unwrap();
        doc.clear_dirty_all(DirtyFlags::ALL);
        let rev = doc.revision();

        assert_eq!(doc.set_attribute(div, "class", "a b").unwrap(), None);
        assert_eq!(
            doc.set_attribute(div, "class", "c").unwrap(),
            Some("a b".into())
        );
        assert!(doc.element(div).unwrap().has_class("c"));
        let entries: Vec<_> = doc.journal().entries_since(rev).unwrap().collect();
        assert_eq!(entries.len(), 2);
        assert!(matches!(
            &entries[1].mutation,
            Mutation::AttributeChanged { name, old_value: Some(v), .. } if name == "class" && v == "a b"
        ));
        assert!(doc.dirty(div).contains(DirtyFlags::STYLE));
        assert!(doc.dirty(root).contains(DirtyFlags::DESCENDANTS));
        assert_eq!(doc.journal().touched_since(rev).unwrap(), vec![div]);
    }

    #[test]
    fn shadow_and_form_state() {
        let mut doc = Document::new();
        let root = doc.root();
        let host = html(&mut doc, "div");
        doc.append_child(root, host).unwrap();
        let shadow = doc.attach_shadow(host, ShadowRootMode::Open).unwrap();
        assert_eq!(doc.shadow_root(host), Some(shadow));
        assert_eq!(doc.host(shadow), Some(host));
        assert!(doc.attach_shadow(host, ShadowRootMode::Closed).is_err());
        assert_eq!(
            doc.children(host).count(),
            0,
            "shadow tree not in light children"
        );

        let input = doc.create_element_with_attrs(
            "input",
            Namespace::Html,
            vec![Attribute {
                name: "value".into(),
                value: "default".into(),
                namespace: None,
            }],
        );
        doc.append_child(root, input).unwrap();
        assert_eq!(doc.form_value(input).as_deref(), Some("default"));
        doc.set_form_value(input, "typed").unwrap();
        assert_eq!(doc.form_value(input).as_deref(), Some("typed"));
        assert_eq!(doc.form_selection(input), (5, 5), "caret follows typed value");
        doc.set_form_selection(input, 2, 4).unwrap();
        assert_eq!(doc.form_selection(input), (2, 4));
        assert_eq!(
            doc.attribute(input, "value"),
            Some("default"),
            "content attribute untouched"
        );
        assert!(!doc.is_checked(input));
        doc.set_checked(input, true).unwrap();
        assert!(doc.is_checked(input));
    }

    #[test]
    fn destroyed_slots_are_recycled_with_a_new_generation() {
        let mut doc = Document::new();
        let a = html(&mut doc, "div");
        let index = a.index();
        let gen0 = a.generation();
        doc.append_child(doc.root(), a).unwrap();
        doc.destroy(a).unwrap();
        assert!(doc.get(a).is_none());
        let b = html(&mut doc, "span");
        assert_eq!(b.index(), index, "free list reused the slot");
        assert_ne!(b.generation(), gen0, "generation bumped so stale ids miss");
        assert!(doc.get(a).is_none());
        assert!(doc.get(b).is_some());
    }

    #[test]
    fn title_collapses_ascii_whitespace_only() {
        assert_eq!(collapse_ascii_whitespace("  a\t\nb  "), "a b");
        assert_eq!(
            collapse_ascii_whitespace("\u{00A0}a\u{00A0}\u{00A0}b\u{00A0}"),
            "\u{00A0}a\u{00A0}\u{00A0}b\u{00A0}"
        );
        let mut doc = Document::new();
        let html_el = html(&mut doc, "html");
        let head = html(&mut doc, "head");
        let title = html(&mut doc, "title");
        doc.append_child(doc.root(), html_el).unwrap();
        doc.append_child(html_el, head).unwrap();
        doc.append_child(head, title).unwrap();
        doc.append_text(title, "  one\ttwo  ").unwrap();
        assert_eq!(doc.title().as_deref(), Some("one two"));
    }

    #[test]
    fn create_html_document_body_and_frameset() {
        let mut doc = Document::new();
        let created = doc.create_html_document(Some("Hello"));
        assert!(doc.get(created).is_some_and(Node::is_document));
        let html_el = doc.document_element_of(created).unwrap();
        assert!(doc.element(html_el).is_some_and(|e| e.is_html("html")));
        assert!(doc.head_of(created).is_some());
        let body = doc.body_of(created).unwrap();
        assert!(doc.element(body).is_some_and(|e| e.is_html("body")));
        assert_eq!(doc.title_of(created).as_deref(), Some("Hello"));
        assert_eq!(
            doc.title().as_deref(),
            None,
            "created document title must not leak into the browsing document"
        );

        doc.remove(html_el).unwrap();
        assert_eq!(doc.body_of(created), None);

        let html_el = html(&mut doc, "html");
        doc.append_child(created, html_el).unwrap();
        let frameset = html(&mut doc, "frameset");
        let later_body = html(&mut doc, "body");
        doc.append_child(html_el, frameset).unwrap();
        doc.append_child(html_el, later_body).unwrap();
        assert_eq!(doc.body_of(created), Some(frameset));
    }

    #[test]
    fn is_connected_walks_to_any_document() {
        let mut doc = Document::new();
        let detached = html(&mut doc, "div");
        assert!(!doc.is_connected(detached));
        doc.append_child(doc.root(), detached).unwrap();
        assert!(doc.is_connected(detached));
        let nested = doc.create_html_document(None);
        let body = doc.body_of(nested).unwrap();
        assert!(doc.is_connected(nested));
        assert!(doc.is_connected(body));
        assert!(!doc.is_ancestor_of(doc.root(), body));
    }

    #[test]
    fn is_connected_walks_shadow_host_but_not_template_contents() {
        let mut doc = Document::new();
        let host = html(&mut doc, "div");
        doc.append_child(doc.root(), host).unwrap();
        let shadow = doc.attach_shadow(host, ShadowRootMode::Open).unwrap();
        let child = html(&mut doc, "span");
        doc.append_child(shadow, child).unwrap();
        assert!(
            doc.is_connected(shadow),
            "connected host makes the shadow root connected"
        );
        assert!(
            doc.is_connected(child),
            "shadow children are shadow-including connected"
        );

        let template = html(&mut doc, "template");
        doc.append_child(doc.root(), template).unwrap();
        let contents = doc.template_contents(template).expect("template contents");
        let inert = html(&mut doc, "x-el");
        doc.append_child(contents, inert).unwrap();
        assert!(doc.is_connected(template));
        assert!(
            !doc.is_connected(contents),
            "template contents fragment is not connected"
        );
        assert!(
            !doc.is_connected(inert),
            "nodes in template contents stay inert"
        );
    }

    #[test]
    fn create_element_template_has_contents_fragment() {
        let mut doc = Document::new();
        let t = doc.create_element("template", Namespace::Html);
        let frag = doc.template_contents(t).expect("template contents");
        assert!(matches!(
            doc.get(frag).map(|n| &n.kind),
            Some(NodeKind::DocumentFragment)
        ));
        let clone = doc.clone_node(t, true).unwrap();
        assert!(doc.template_contents(clone).is_some());
    }

    #[test]
    fn assigned_nodes_match_named_and_default_slots() {
        let mut doc = Document::new();
        let host = html(&mut doc, "div");
        doc.append_child(doc.root(), host).unwrap();
        let named = html(&mut doc, "span");
        doc.set_attribute(named, "slot", "title").unwrap();
        doc.append_text(named, "Hello").unwrap();
        let def = html(&mut doc, "span");
        doc.append_text(def, "Body").unwrap();
        doc.append_child(host, named).unwrap();
        doc.append_child(host, def).unwrap();
        let shadow = doc.attach_shadow(host, ShadowRootMode::Open).unwrap();
        let slot_title = html(&mut doc, "slot");
        doc.set_attribute(slot_title, "name", "title").unwrap();
        let slot_default = html(&mut doc, "slot");
        doc.append_child(shadow, slot_title).unwrap();
        doc.append_child(shadow, slot_default).unwrap();
        assert_eq!(doc.assigned_nodes(slot_title), vec![named]);
        assert_eq!(doc.assigned_nodes(slot_default), vec![def]);
        assert_eq!(doc.containing_shadow_root(slot_title), Some(shadow));
        assert!(doc.assigned_nodes(host).is_empty());
    }

    #[test]
    fn replace_children_swaps_the_child_list_and_detaches_the_old() {
        let mut doc = Document::new();
        let ul = html(&mut doc, "ul");
        doc.append_child(doc.root(), ul).unwrap();
        let old = html(&mut doc, "li");
        doc.append_child(ul, old).unwrap();
        let a = html(&mut doc, "li");
        let b = html(&mut doc, "li");
        doc.replace_children(ul, &[a, b]).unwrap();
        let kids: Vec<_> = doc.children(ul).collect();
        assert_eq!(kids, vec![a, b]);
        assert_eq!(doc.parent(old), None);
        assert_eq!(doc.parent(a), Some(ul));
        assert_eq!(doc.parent(b), Some(ul));
    }

    #[test]
    fn get_element_by_id_uses_an_index_and_updates_on_mutation() {
        let mut doc = Document::new();
        let root = doc.root();
        let body = doc.create_element("body", Namespace::Html);
        doc.append_child(root, body).unwrap();
        for i in 0..2_000 {
            let el = doc.create_element("div", Namespace::Html);
            doc.set_attribute(el, "id", format!("n{i}")).unwrap();
            doc.append_child(body, el).unwrap();
        }
        assert_eq!(
            doc.element_by_id("n1999")
                .and_then(|id| doc.element(id).and_then(|e| e.id().map(str::to_owned))),
            Some("n1999".into())
        );
        let started = std::time::Instant::now();
        for _ in 0..5_000 {
            assert!(doc.element_by_id("n0").is_some());
            assert!(doc.element_by_id("n1999").is_some());
            assert!(doc.element_by_id("missing").is_none());
        }
        let ms = started.elapsed().as_millis();
        assert!(
            ms < 200,
            "10k id lookups on a 2000-element document took {ms}ms"
        );
        let hit = doc.element_by_id("n0").unwrap();
        doc.set_attribute(hit, "id", "renamed").unwrap();
        assert!(doc.element_by_id("n0").is_none());
        assert!(doc.element_by_id("renamed").is_some());
        doc.remove(hit).unwrap();
        assert!(doc.element_by_id("renamed").is_none());
    }
}
