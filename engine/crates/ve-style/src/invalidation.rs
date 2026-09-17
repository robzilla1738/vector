//! Invalidation maps: which selector features (classes, ids, attributes,
//! pseudo-class states) the current rule set depends on, and how a change to
//! one of them on an element translates into dirty bits.
//!
//! Architecture §4: an attribute change consults the map; if no rule depends
//! on that feature, **no style bit is set at all**. A feature that appears in
//! the subject compound marks the element `STYLE_SELF`; one that appears to
//! the left of a descendant combinator marks `STYLE_DESCENDANTS`; one to the
//! left of a sibling combinator marks the parent's descendants (the cheapest
//! superset of "later siblings and their subtrees"). `:has()` invalidates the
//! whole document, as the architecture permits for M1.

use std::collections::{HashMap, HashSet};

use selectors::parser::{Combinator, Component, Selector};
use ve_core::NodeId;
use ve_dom::{DirtyFlags, Document, Mutation};

use crate::selector_impl::{PseudoClass, VeSelectorImpl};

/// How a change to one selector feature on an element propagates.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct Dependency {
    /// The feature appears in a subject compound: the element itself.
    pub self_: bool,
    /// The feature appears left of `>` or a descendant combinator.
    pub descendants: bool,
    /// The feature appears left of `+` or `~`.
    pub siblings: bool,
}

impl Dependency {
    /// No rule depends on the feature.
    pub const NONE: Self = Self {
        self_: false,
        descendants: false,
        siblings: false,
    };

    fn merge(&mut self, other: Dependency) {
        self.self_ |= other.self_;
        self.descendants |= other.descendants;
        self.siblings |= other.siblings;
    }

    /// Returns `true` if any rule depends on the feature.
    #[must_use]
    pub fn is_any(self) -> bool {
        self.self_ || self.descendants || self.siblings
    }

    fn at(position: Position) -> Self {
        match position {
            Position::Subject => Self {
                self_: true,
                ..Self::NONE
            },
            Position::Ancestor => Self {
                descendants: true,
                ..Self::NONE
            },
            Position::Sibling => Self {
                siblings: true,
                ..Self::NONE
            },
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Position {
    Subject,
    Ancestor,
    Sibling,
}

/// Feature → dependency maps for one rule set.
#[derive(Clone, Debug, Default)]
pub struct InvalidationMap {
    classes: HashMap<String, Dependency>,
    ids: HashMap<String, Dependency>,
    attrs: HashMap<String, Dependency>,
    states: HashMap<&'static str, Dependency>,
    /// A selector uses `:has()`: any change may affect any element.
    pub has_selector: bool,
    /// Some selector depends on tree structure (`:nth-*`, `:first-child`,
    /// `:empty`, `:only-child`, `:root`): inserting or removing a node
    /// affects its siblings.
    pub structural: bool,
    /// Some selector uses `:not()` / `:is()` with a universal-ish inner
    /// selector we could not bucket; treated as depending on everything.
    pub universal_attrs: bool,
}

impl InvalidationMap {
    /// Builds the map from every selector of the rule set.
    #[must_use]
    pub fn build<'a>(selectors: impl Iterator<Item = &'a Selector<VeSelectorImpl>>) -> Self {
        let mut map = Self::default();
        for selector in selectors {
            map.add_selector(selector, Position::Subject);
        }
        map
    }

    fn add_selector(&mut self, selector: &Selector<VeSelectorImpl>, start: Position) {
        let mut iter = selector.iter();
        let mut position = start;
        loop {
            for component in &mut iter {
                self.add_component(component, position);
            }
            match iter.next_sequence() {
                None => break,
                Some(Combinator::Child | Combinator::Descendant) => {
                    if position == Position::Subject {
                        position = Position::Ancestor;
                    }
                }
                Some(Combinator::NextSibling | Combinator::LaterSibling) => {
                    position = Position::Sibling;
                }
                Some(Combinator::PseudoElement | Combinator::SlotAssignment | Combinator::Part) => {
                }
            }
        }
    }

    fn add_component(&mut self, component: &Component<VeSelectorImpl>, position: Position) {
        let dep = Dependency::at(position);
        match component {
            Component::Class(c) => self.classes.entry(c.0.clone()).or_default().merge(dep),
            Component::ID(id) => self.ids.entry(id.0.clone()).or_default().merge(dep),
            Component::AttributeInNoNamespaceExists {
                local_name_lower, ..
            } => self
                .attrs
                .entry(local_name_lower.0.clone())
                .or_default()
                .merge(dep),
            Component::AttributeInNoNamespace { local_name, .. } => self
                .attrs
                .entry(local_name.0.to_ascii_lowercase())
                .or_default()
                .merge(dep),
            Component::AttributeOther(attr) => self
                .attrs
                .entry(attr.local_name_lower.0.clone())
                .or_default()
                .merge(dep),
            Component::NonTSPseudoClass(pc) => {
                self.states.entry(pc.name()).or_default().merge(dep);
            }
            Component::Nth(_) | Component::NthOf(_) | Component::Empty | Component::Root => {
                self.structural = true;
                if let Component::NthOf(data) = component {
                    for inner in data.selectors() {
                        self.add_selector(inner, position);
                    }
                }
            }
            Component::Negation(list) | Component::Is(list) | Component::Where(list) => {
                for inner in list.slice() {
                    self.add_selector(inner, position);
                }
            }
            Component::Has(_) => self.has_selector = true,
            Component::Slotted(inner) | Component::Host(Some(inner)) => {
                self.add_selector(inner, position);
            }
            _ => {}
        }
    }

    /// Dependency on a class name.
    #[must_use]
    pub fn class(&self, name: &str) -> Dependency {
        self.classes.get(name).copied().unwrap_or(Dependency::NONE)
    }

    /// Dependency on an id.
    #[must_use]
    pub fn id(&self, name: &str) -> Dependency {
        self.ids.get(name).copied().unwrap_or(Dependency::NONE)
    }

    /// Dependency on an attribute name (lower-case).
    #[must_use]
    pub fn attr(&self, name: &str) -> Dependency {
        self.attrs.get(name).copied().unwrap_or(Dependency::NONE)
    }

    /// Dependency on a pseudo-class state (`hover`, `checked`, …).
    #[must_use]
    pub fn state(&self, pseudo: &PseudoClass) -> Dependency {
        self.states
            .get(pseudo.name())
            .copied()
            .unwrap_or(Dependency::NONE)
    }

    /// Number of distinct class, id, attribute and state features tracked.
    #[must_use]
    pub fn feature_count(&self) -> usize {
        self.classes.len() + self.ids.len() + self.attrs.len() + self.states.len()
    }

    /// The pseudo-class states whose value can change when `attr` changes.
    fn states_for_attribute(attr: &str) -> &'static [PseudoClass] {
        match attr {
            "disabled" => &[PseudoClass::Disabled, PseudoClass::Enabled],
            "checked" | "selected" => &[PseudoClass::Checked],
            "required" => &[PseudoClass::Required, PseudoClass::Optional],
            "readonly" => &[PseudoClass::ReadOnly, PseudoClass::ReadWrite],
            "href" => &[PseudoClass::Link, PseudoClass::AnyLink],
            "placeholder" | "value" => &[PseudoClass::PlaceholderShown],
            "type" => &[
                PseudoClass::Checked,
                PseudoClass::ReadOnly,
                PseudoClass::ReadWrite,
                PseudoClass::PlaceholderShown,
            ],
            _ => &[],
        }
    }

    /// The dependency of an attribute change, considering attribute
    /// selectors, class/id maps and the pseudo-classes the attribute drives.
    /// `old` and `new` are the attribute values before and after.
    #[must_use]
    pub fn attribute_change(&self, name: &str, old: Option<&str>, new: Option<&str>) -> Dependency {
        let mut dep = Dependency::NONE;
        match name {
            "class" => {
                let before: HashSet<&str> = old.unwrap_or("").split_ascii_whitespace().collect();
                let after: HashSet<&str> = new.unwrap_or("").split_ascii_whitespace().collect();
                for class in before.symmetric_difference(&after) {
                    dep.merge(self.class(class));
                }
            }
            "id" => {
                if let Some(o) = old {
                    dep.merge(self.id(o));
                }
                if let Some(n) = new {
                    dep.merge(self.id(n));
                }
            }
            "style" => {
                dep.self_ = true;
            }
            _ => {}
        }
        dep.merge(self.attr(name));
        for state in Self::states_for_attribute(name) {
            dep.merge(self.state(state));
        }
        dep
    }
}

/// Outcome of applying journal entries to the dirty bits.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct InvalidationStats {
    /// Journal entries processed.
    pub entries: usize,
    /// Nodes that received `STYLE_SELF`.
    pub marked_self: usize,
    /// Nodes that received `STYLE_DESCENDANTS`.
    pub marked_descendants: usize,
    /// Attribute changes no rule depended on (their provisional `STYLE` bit
    /// was cleared).
    pub ignored_attribute_changes: usize,
    /// The whole document must be restyled (`:has()`, quirks change, or the
    /// journal no longer reaches `since`).
    pub full: bool,
}

/// Per-node accumulated effect while scanning the journal.
#[derive(Clone, Copy, Default)]
struct Effect {
    self_: bool,
    descendants: bool,
    /// The node had at least one attribute change with no dependency.
    ignorable: bool,
    /// The node had a change that unconditionally dirties it (insertion,
    /// `style=""`, form state).
    forced: bool,
}

impl InvalidationMap {
    /// Reads the journal entries after `since` and translates them into
    /// `STYLE_SELF` / `STYLE_DESCENDANTS` bits. Attribute changes with no
    /// dependency clear the provisional `STYLE` bit `ve-dom` set.
    pub fn apply_journal(&self, doc: &mut Document, since: ve_core::Revision) -> InvalidationStats {
        let mut stats = InvalidationStats::default();
        let Some(entries) = doc.journal().entries_since(since) else {
            stats.full = true;
            return stats;
        };
        let mut effects: HashMap<NodeId, Effect> = HashMap::new();
        let mut parent_descendants: Vec<NodeId> = Vec::new();
        let mut mark = |effects: &mut HashMap<NodeId, Effect>, node: NodeId, dep: Dependency| {
            let e = effects.entry(node).or_default();
            e.self_ |= dep.self_;
            e.descendants |= dep.descendants;
            if dep.siblings {
                parent_descendants.push(node);
            }
        };
        for entry in entries {
            stats.entries += 1;
            match &entry.mutation {
                Mutation::NodeInserted { node, parent, .. } => {
                    let e = effects.entry(*node).or_default();
                    e.self_ = true;
                    e.descendants = true;
                    e.forced = true;
                    if self.structural {
                        let p = effects.entry(*parent).or_default();
                        p.descendants = true;
                        p.self_ = true;
                        p.forced = true;
                    }
                }
                Mutation::NodeRemoved { parent, .. } => {
                    if self.structural {
                        let p = effects.entry(*parent).or_default();
                        p.descendants = true;
                        p.self_ = true;
                        p.forced = true;
                    }
                }
                Mutation::AttributeChanged {
                    node,
                    name,
                    old_value,
                } => {
                    let new_value = doc.attribute(*node, name).map(str::to_owned);
                    let dep =
                        self.attribute_change(name, old_value.as_deref(), new_value.as_deref());
                    if dep.is_any() {
                        mark(&mut effects, *node, dep);
                        if name == "style" {
                            effects.entry(*node).or_default().forced = true;
                        }
                    } else {
                        effects.entry(*node).or_default().ignorable = true;
                    }
                }
                Mutation::TextChanged { node, .. } => {
                    if self.structural
                        && let Some(parent) = doc.parent(*node)
                    {
                        let p = effects.entry(parent).or_default();
                        p.self_ = true;
                        p.forced = true;
                    }
                }
                Mutation::FormStateChanged { node } => {
                    let mut dep = Dependency::NONE;
                    for state in [PseudoClass::Checked, PseudoClass::PlaceholderShown] {
                        dep.merge(self.state(&state));
                    }
                    if dep.is_any() {
                        mark(&mut effects, *node, dep);
                    } else {
                        effects.entry(*node).or_default().ignorable = true;
                    }
                }
                Mutation::ShadowAttached { host, .. } => {
                    let e = effects.entry(*host).or_default();
                    e.self_ = true;
                    e.descendants = true;
                    e.forced = true;
                }
                Mutation::QuirksModeChanged => stats.full = true,
                Mutation::NodeCreated { .. }
                | Mutation::NodeDestroyed { .. }
                | Mutation::GeometryChanged { .. }
                | Mutation::Scrolled { .. } => {}
            }
        }
        if self.has_selector && !effects.is_empty() {
            stats.full = true;
        }
        for node in parent_descendants {
            if let Some(parent) = doc.parent(node) {
                let p = effects.entry(parent).or_default();
                p.descendants = true;
            }
        }
        for (node, effect) in effects {
            if !doc.contains(node) {
                continue;
            }
            let mut flags = DirtyFlags::NONE;
            if effect.self_ {
                flags |= DirtyFlags::STYLE_SELF;
                stats.marked_self += 1;
            }
            if effect.descendants {
                flags |= DirtyFlags::STYLE_DESCENDANTS;
                stats.marked_descendants += 1;
            }
            if flags.is_empty() {
                if effect.ignorable && !effect.forced {
                    doc.clear_dirty(node, DirtyFlags::STYLE_SELF);
                    stats.ignored_attribute_changes += 1;
                }
            } else {
                doc.mark_dirty(node, flags);
            }
        }
        stats
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::selector_impl::parse_selector_list;

    fn map(selectors: &[&str]) -> InvalidationMap {
        let lists: Vec<_> = selectors
            .iter()
            .map(|s| parse_selector_list(s).unwrap())
            .collect();
        InvalidationMap::build(lists.iter().flat_map(|l| l.slice().iter()))
    }

    #[test]
    fn features_map_to_positions() {
        let m = map(&[
            ".a .b",
            "#x > p",
            ".c + span",
            "[data-k]",
            "input:checked ~ label",
            "li:nth-child(2n)",
            ".self",
        ]);
        assert_eq!(
            m.class("a"),
            Dependency {
                descendants: true,
                ..Dependency::NONE
            }
        );
        assert_eq!(
            m.class("b"),
            Dependency {
                self_: true,
                ..Dependency::NONE
            }
        );
        assert!(m.id("x").descendants);
        assert!(m.class("c").siblings);
        assert!(m.attr("data-k").self_);
        assert!(m.state(&PseudoClass::Checked).siblings);
        assert!(m.structural);
        assert!(!m.has_selector);
        assert_eq!(m.class("nope"), Dependency::NONE);
        assert_eq!(
            m.attribute_change("title", None, Some("x")),
            Dependency::NONE
        );
        assert!(m.attribute_change("class", Some("a"), Some("a b")).self_);
        assert!(
            !m.attribute_change("class", Some("a b"), Some("b a"))
                .is_any()
        );
        assert!(m.attribute_change("style", None, Some("color:red")).self_);
        assert!(map(&["div:has(p)"]).has_selector);
    }
}
