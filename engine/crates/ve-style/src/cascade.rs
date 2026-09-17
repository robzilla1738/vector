//! The [`StyleEngine`]: selector matching plus cascade over a whole document,
//! and journal-driven incremental restyle.
//!
//! Rules are compiled once per (stylesheet set, media environment) into a
//! [`RuleSet`]: every selector is bucketed by its rightmost compound (id,
//! class, local name, universal) so that an element only tests the selectors
//! that could possibly match it, and an [`InvalidationMap`] records which
//! features the rules depend on.

use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

use selectors::SelectorList;
use selectors::context::{
    MatchingContext, MatchingForInvalidation, MatchingMode, NeedsSelectorFlags, QuirksMode,
    SelectorCaches,
};
use selectors::matching::{matches_selector, matches_selector_list};
use selectors::parser::{Combinator, Component, Selector};
use ve_core::{Error, NodeId, Result, Revision, Stage};
use ve_dom::{DirtyFlags, Document, ElementData, Node};

use crate::computed::{ComputeContext, ComputedStyle};
use crate::coverage::CssCoverage;
use crate::element::{DomElement, InteractionState};
use crate::invalidation::{InvalidationMap, InvalidationStats};
use crate::media::MediaEnv;
use crate::properties::SpecifiedValue;
use crate::selector_impl::{PseudoElement, VeSelectorImpl, parse_selector_list};
use crate::stylesheet::{
    CssRule, Origin, PropertyDeclaration, StyleRule, Stylesheet, parse_declaration_block_counted,
    parse_stylesheet, strip_cdata,
};
use crate::ua::UA_STYLESHEET;
use crate::values::Content;

/// Computed styles for every node of a document at a given revision.
#[derive(Clone, Debug, Default)]
pub struct StyleTree {
    styles: HashMap<NodeId, Rc<ComputedStyle>>,
    pseudos: HashMap<(NodeId, PseudoElement), Rc<ComputedStyle>>,
    revision: Revision,
    root_font_size: f32,
}

impl StyleTree {
    /// The computed style of `id`, if it was styled.
    #[must_use]
    pub fn get(&self, id: NodeId) -> Option<&Rc<ComputedStyle>> {
        self.styles.get(&id)
    }

    /// The computed style of `id`, or the initial style for unknown nodes.
    #[must_use]
    pub fn style(&self, id: NodeId) -> Rc<ComputedStyle> {
        self.styles
            .get(&id)
            .cloned()
            .unwrap_or_else(|| Rc::new(ComputedStyle::initial()))
    }

    /// The computed style of a generated `::before` / `::after` box of `id`,
    /// present only when the pseudo-element generates a box (its `content`
    /// is neither `normal` nor `none` and its `display` is not `none`). The
    /// style's `content` is already resolved to [`Content::Text`].
    #[must_use]
    pub fn pseudo(&self, id: NodeId, pseudo: PseudoElement) -> Option<&Rc<ComputedStyle>> {
        self.pseudos.get(&(id, pseudo))
    }

    /// The generated text of a `::before` / `::after` of `id`, if any.
    #[must_use]
    pub fn pseudo_text(&self, id: NodeId, pseudo: PseudoElement) -> Option<&str> {
        match &self.pseudo(id, pseudo)?.content {
            Content::Text(t) => Some(t.as_str()),
            _ => None,
        }
    }

    /// Returns `true` if `id` was styled and generates a box.
    #[must_use]
    pub fn is_displayed(&self, id: NodeId) -> bool {
        self.styles.get(&id).is_some_and(|s| s.is_displayed())
    }

    /// The document revision this tree was computed for.
    #[must_use]
    pub fn revision(&self) -> Revision {
        self.revision
    }

    /// The root element's computed font size (`rem` basis).
    #[must_use]
    pub fn root_font_size(&self) -> f32 {
        if self.root_font_size > 0.0 {
            self.root_font_size
        } else {
            16.0
        }
    }

    /// Number of styled nodes.
    #[must_use]
    pub fn len(&self) -> usize {
        self.styles.len()
    }

    /// Returns `true` if nothing was styled.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.styles.is_empty()
    }

    fn set_pseudos(&mut self, id: NodeId, pseudos: Vec<(PseudoElement, Rc<ComputedStyle>)>) {
        self.pseudos.remove(&(id, PseudoElement::Before));
        self.pseudos.remove(&(id, PseudoElement::After));
        for (pe, style) in pseudos {
            self.pseudos.insert((id, pe), style);
        }
    }

    fn remove_subtree(&mut self, doc: &Document, id: NodeId) {
        self.styles.remove(&id);
        self.pseudos.remove(&(id, PseudoElement::Before));
        self.pseudos.remove(&(id, PseudoElement::After));
        for d in doc.descendants(id) {
            self.styles.remove(&d);
            self.pseudos.remove(&(d, PseudoElement::Before));
            self.pseudos.remove(&(d, PseudoElement::After));
        }
    }
}

/// Cascade level: the primary sort key. Higher wins.
fn level(origin: Origin, important: bool) -> u8 {
    match (origin, important) {
        (Origin::UserAgent, false) => 0,
        (Origin::Author, false) => 1,
        (Origin::Author, true) => 2,
        (Origin::UserAgent, true) => 3,
    }
}

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
struct CascadeKey {
    level: u8,
    specificity: u32,
    order: u32,
}

/// One selector of one style rule, with everything matching needs.
#[derive(Clone, Debug)]
struct CompiledRule {
    selector: Selector<VeSelectorImpl>,
    specificity: u32,
    origin: Origin,
    /// Source order across all sheets (UA first).
    order: u32,
    declarations: Rc<Vec<PropertyDeclaration>>,
}

/// Rules bucketed by the rightmost compound of their selector.
#[derive(Clone, Debug, Default)]
struct Buckets {
    ids: HashMap<String, Vec<u32>>,
    classes: HashMap<String, Vec<u32>>,
    local_names: HashMap<String, Vec<u32>>,
    universal: Vec<u32>,
}

impl Buckets {
    fn is_empty(&self) -> bool {
        self.ids.is_empty()
            && self.classes.is_empty()
            && self.local_names.is_empty()
            && self.universal.is_empty()
    }

    fn insert(&mut self, selector: &Selector<VeSelectorImpl>, index: u32) {
        let mut iter = selector.iter();
        // Skip a leading pseudo-element compound: bucket by the originating element.
        if selector.has_pseudo_element() {
            for _ in &mut iter {}
            if iter.next_sequence() != Some(Combinator::PseudoElement) {
                self.universal.push(index);
                return;
            }
        }
        let mut id = None;
        let mut class = None;
        let mut local = None;
        for component in &mut iter {
            match component {
                Component::ID(v) if id.is_none() => id = Some(v.0.clone()),
                Component::Class(v) if class.is_none() => class = Some(v.0.clone()),
                Component::LocalName(n) if local.is_none() => local = Some(n.lower_name.0.clone()),
                _ => {}
            }
        }
        if let Some(id) = id {
            self.ids.entry(id).or_default().push(index);
        } else if let Some(class) = class {
            self.classes.entry(class).or_default().push(index);
        } else if let Some(local) = local {
            self.local_names.entry(local).or_default().push(index);
        } else {
            self.universal.push(index);
        }
    }

    /// Indices of every rule that could match `element`.
    fn candidates(&self, element: &ElementData, out: &mut Vec<u32>) {
        out.extend_from_slice(&self.universal);
        if let Some(v) = self.local_names.get(element.name.as_str()) {
            out.extend_from_slice(v);
        }
        for class in element.classes() {
            if let Some(v) = self.classes.get(class) {
                out.extend_from_slice(v);
            }
        }
        if let Some(v) = element.id().and_then(|id| self.ids.get(id)) {
            out.extend_from_slice(v);
        }
    }
}

/// The compiled, media-filtered rule set of a [`StyleEngine`].
#[derive(Clone, Debug, Default)]
pub struct RuleSet {
    rules: Vec<CompiledRule>,
    element_buckets: Buckets,
    pseudo_buckets: HashMap<PseudoElement, Buckets>,
    /// Invalidation map over every selector.
    pub invalidation: InvalidationMap,
    media: MediaEnv,
    generation: u64,
}

impl RuleSet {
    fn build(ua: &Stylesheet, author: &[Stylesheet], media: MediaEnv, generation: u64) -> Self {
        fn walk<'a>(
            rules: &'a [CssRule],
            origin: Origin,
            env: &MediaEnv,
            out: &mut Vec<(Origin, &'a StyleRule)>,
        ) {
            for rule in rules {
                match rule {
                    CssRule::Style(s) => out.push((origin, s)),
                    CssRule::Media(m) if m.query.evaluate(env) => walk(&m.rules, origin, env, out),
                    CssRule::Media(_) | CssRule::Keyframes(_) => {}
                }
            }
        }
        let mut flat = Vec::new();
        walk(&ua.rules, Origin::UserAgent, &media, &mut flat);
        for sheet in author {
            walk(&sheet.rules, sheet.origin, &media, &mut flat);
        }

        let mut set = RuleSet {
            media,
            generation,
            ..RuleSet::default()
        };
        for (order, (origin, rule)) in flat.iter().enumerate() {
            let declarations = Rc::new(rule.block.declarations.clone());
            for selector in rule.selectors.slice() {
                let index = set.rules.len() as u32;
                set.rules.push(CompiledRule {
                    selector: selector.clone(),
                    specificity: selector.specificity(),
                    origin: *origin,
                    order: order as u32,
                    declarations: declarations.clone(),
                });
                match selector.pseudo_element() {
                    Some(pe @ (PseudoElement::Before | PseudoElement::After)) => {
                        set.pseudo_buckets
                            .entry(*pe)
                            .or_default()
                            .insert(selector, index);
                    }
                    // Other pseudo-elements never generate boxes: their rules are inert.
                    Some(_) => {}
                    None => set.element_buckets.insert(selector, index),
                }
            }
        }
        set.invalidation = InvalidationMap::build(set.rules.iter().map(|r| &r.selector));
        set
    }

    /// Number of compiled (rule, selector) pairs.
    #[must_use]
    pub fn len(&self) -> usize {
        self.rules.len()
    }

    /// Returns `true` if there are no rules.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.rules.is_empty()
    }

    /// Whether any rule targets `::before` / `::after`.
    #[must_use]
    pub fn has_generated_content_rules(&self) -> bool {
        self.pseudo_buckets.values().any(|b| !b.is_empty())
    }
}

/// Selector-matching scratch state shared by one style pass.
struct Matchers<'a, 'b> {
    element: MatchingContext<'a, VeSelectorImpl>,
    pseudo: MatchingContext<'b, VeSelectorImpl>,
    candidates: Vec<u32>,
}

/// Statistics returned by [`StyleEngine::restyle_incremental`].
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct RestyleStats {
    /// Elements whose style was recomputed (text nodes excluded).
    pub recomputed: usize,
    /// Elements whose subtree was skipped because it was clean.
    pub skipped_subtrees: usize,
    /// Elements whose recomputed style changed layout-affecting properties
    /// (they were marked `LAYOUT`).
    pub layout_dirtied: usize,
    /// The pass fell back to a full recompute.
    pub full: bool,
    /// The invalidation step's statistics.
    pub invalidation: InvalidationStats,
}

/// Owns stylesheets and computes styles for documents.
#[derive(Clone, Debug)]
pub struct StyleEngine {
    ua: Stylesheet,
    author: Vec<Stylesheet>,
    /// Environment for media queries and viewport units.
    pub media: MediaEnv,
    /// User interaction state (`:hover`, `:focus`, …).
    pub interaction: InteractionState,
    /// Bumped whenever the stylesheet set changes.
    generation: u64,
    rules: RefCell<Option<Rc<RuleSet>>>,
    inline_coverage: RefCell<CssCoverage>,
}

impl Default for StyleEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl StyleEngine {
    /// Creates an engine with the built-in user-agent stylesheet.
    #[must_use]
    pub fn new() -> Self {
        Self {
            ua: parse_stylesheet(UA_STYLESHEET, Origin::UserAgent),
            author: Vec::new(),
            media: MediaEnv::default(),
            interaction: InteractionState::new(),
            generation: 0,
            rules: RefCell::new(None),
            inline_coverage: RefCell::new(CssCoverage::default()),
        }
    }

    /// Adds an author stylesheet from source text.
    pub fn add_stylesheet(&mut self, css: &str) {
        self.author.push(parse_stylesheet(css, Origin::Author));
        self.generation += 1;
        self.rules.replace(None);
    }

    /// Adds every `<style>` element of `doc` (in tree order) as an author
    /// stylesheet. External `<link rel=stylesheet>` resources are fetched by
    /// the embedder and added with [`Self::add_stylesheet`].
    pub fn add_document_styles(&mut self, doc: &Document) {
        for id in doc.elements() {
            if doc.element(id).is_some_and(|e| e.is_html("style")) {
                let media_ok = doc.attribute(id, "media").is_none_or(|m| {
                    crate::media::MediaQueryList::parse_str(m).evaluate(&self.media)
                });
                if media_ok {
                    self.add_stylesheet(&strip_cdata(&doc.text_content(id)));
                }
            }
        }
    }

    /// Removes all author stylesheets and resets the coverage counters.
    pub fn clear_author_styles(&mut self) {
        self.author.clear();
        self.generation += 1;
        self.rules.replace(None);
        self.inline_coverage.replace(CssCoverage::default());
    }

    /// Number of author stylesheets.
    #[must_use]
    pub fn author_stylesheet_count(&self) -> usize {
        self.author.len()
    }

    /// CSS coverage over every author stylesheet plus every `style=""`
    /// attribute parsed by the last [`Self::compute`] /
    /// [`Self::restyle_incremental`] pass. This is the counter the router
    /// reads: `declarations_total`, `declarations_unknown`,
    /// `declarations_deferred`, `declarations_invalid` and
    /// `affects_geometry`.
    #[must_use]
    pub fn coverage(&self) -> CssCoverage {
        let mut total = CssCoverage::default();
        for sheet in &self.author {
            total.merge(&sheet.coverage);
        }
        total.merge(&self.inline_coverage.borrow());
        total
    }

    /// The compiled rule set for the current stylesheets and media
    /// environment (rebuilt lazily when either changes).
    pub fn rule_set(&self) -> Rc<RuleSet> {
        let cached = self.rules.borrow().clone();
        if let Some(set) = cached
            && set.generation == self.generation
            && set.media == self.media
        {
            return set;
        }
        let set = Rc::new(RuleSet::build(
            &self.ua,
            &self.author,
            self.media,
            self.generation,
        ));
        self.rules.replace(Some(set.clone()));
        set
    }

    fn quirks(doc: &Document) -> QuirksMode {
        match doc.quirks_mode() {
            ve_dom::QuirksMode::NoQuirks => QuirksMode::NoQuirks,
            ve_dom::QuirksMode::LimitedQuirks => QuirksMode::LimitedQuirks,
            ve_dom::QuirksMode::Quirks => QuirksMode::Quirks,
        }
    }

    /// Computes the style of one element (and its generated-content
    /// pseudo-elements) given its parent's style.
    fn cascade_element(
        &self,
        rules: &RuleSet,
        doc: &Document,
        id: NodeId,
        parent_style: &Rc<ComputedStyle>,
        root_font_size: f32,
        is_root: bool,
        m: &mut Matchers<'_, '_>,
    ) -> (Rc<ComputedStyle>, Vec<(PseudoElement, Rc<ComputedStyle>)>) {
        let Matchers {
            element: matching,
            pseudo: pseudo_matching,
            candidates,
        } = m;
        let Some(element_data) = doc.element(id) else {
            return (parent_style.clone(), Vec::new());
        };
        let element = DomElement::new(doc, &self.interaction, id);

        candidates.clear();
        rules.element_buckets.candidates(element_data, candidates);
        let mut matched: Vec<(CascadeKey, &PropertyDeclaration)> = Vec::new();
        for &index in candidates.iter() {
            let rule = &rules.rules[index as usize];
            if matches_selector(&rule.selector, 0, None, &element, matching) {
                for decl in rule.declarations.iter() {
                    matched.push((
                        CascadeKey {
                            level: level(rule.origin, decl.important),
                            specificity: rule.specificity,
                            order: rule.order,
                        },
                        decl,
                    ));
                }
            }
        }
        // Inline `style=""`: author origin, beats any selector.
        let inline = doc
            .attribute(id, "style")
            .map(parse_declaration_block_counted);
        if let Some((block, coverage)) = &inline {
            self.inline_coverage.borrow_mut().merge(coverage);
            for decl in &block.declarations {
                matched.push((
                    CascadeKey {
                        level: level(Origin::Author, decl.important),
                        specificity: u32::MAX,
                        order: u32::MAX,
                    },
                    decl,
                ));
            }
        }
        let ordered = Self::resolve_revert(&mut matched);

        let ctx = ComputeContext {
            parent: parent_style,
            root_font_size,
            viewport: self.media.viewport,
            is_root,
        };
        let refs: Vec<&PropertyDeclaration> = ordered.iter().collect();
        let style = Rc::new(ComputedStyle::cascade(&refs, &ctx));

        // Generated content.
        let mut pseudos = Vec::new();
        if style.is_displayed() {
            for pe in [PseudoElement::Before, PseudoElement::After] {
                let Some(buckets) = rules.pseudo_buckets.get(&pe) else {
                    continue;
                };
                candidates.clear();
                buckets.candidates(element_data, candidates);
                if candidates.is_empty() {
                    continue;
                }
                let pseudo_element = DomElement::for_pseudo(doc, &self.interaction, id, pe);
                let mut matched: Vec<(CascadeKey, &PropertyDeclaration)> = Vec::new();
                for &index in candidates.iter() {
                    let rule = &rules.rules[index as usize];
                    if matches_selector(&rule.selector, 0, None, &pseudo_element, pseudo_matching) {
                        for decl in rule.declarations.iter() {
                            matched.push((
                                CascadeKey {
                                    level: level(rule.origin, decl.important),
                                    specificity: rule.specificity,
                                    order: rule.order,
                                },
                                decl,
                            ));
                        }
                    }
                }
                if matched.is_empty() {
                    continue;
                }
                let ordered = Self::resolve_revert(&mut matched);
                let pctx = ComputeContext {
                    parent: &style,
                    root_font_size,
                    viewport: self.media.viewport,
                    is_root: false,
                };
                let refs: Vec<&PropertyDeclaration> = ordered.iter().collect();
                let mut pstyle = ComputedStyle::cascade(&refs, &pctx);
                if !pstyle.is_displayed() || !pstyle.content.generates_box() {
                    continue;
                }
                let text = pstyle
                    .content
                    .resolve(|attr| doc.attribute(id, attr).map(str::to_owned))
                    .unwrap_or_default();
                pstyle.content = Content::Text(text);
                // Pseudo-elements never float out of or position against
                // anything the box tree cannot express; keep them in flow.
                pseudos.push((pe, Rc::new(pstyle)));
            }
        }
        (style, pseudos)
    }

    /// Sorts the candidates and applies `revert`: an author-level `revert`
    /// takes the user-agent cascaded value for the property, or `unset`.
    fn resolve_revert(
        matched: &mut Vec<(CascadeKey, &PropertyDeclaration)>,
    ) -> Vec<PropertyDeclaration> {
        matched.sort_by_key(|(key, _)| *key);
        let mut ordered: Vec<PropertyDeclaration> = Vec::with_capacity(matched.len());
        for (i, (key, decl)) in matched.iter().enumerate() {
            if decl.value == SpecifiedValue::Revert && (key.level == 1 || key.level == 2) {
                let ua_value = matched[..i]
                    .iter()
                    .rev()
                    .find(|(k, d)| (k.level == 0 || k.level == 3) && d.property == decl.property)
                    .map_or(SpecifiedValue::Unset, |(_, d)| d.value.clone());
                ordered.push(PropertyDeclaration {
                    property: decl.property.clone(),
                    value: ua_value,
                    important: decl.important,
                });
            } else {
                ordered.push((*decl).clone());
            }
        }
        ordered
    }

    /// Computes styles for the whole light tree of `doc`.
    #[must_use]
    pub fn compute(&self, doc: &Document) -> StyleTree {
        let span = Stage::Style.span();
        let _guard = span.enter();
        self.inline_coverage.replace(CssCoverage::default());

        let rules = self.rule_set();
        let mut caches = SelectorCaches::default();
        let matching = MatchingContext::new(
            MatchingMode::Normal,
            None,
            &mut caches,
            Self::quirks(doc),
            NeedsSelectorFlags::No,
            MatchingForInvalidation::No,
        );
        let mut pseudo_caches = SelectorCaches::default();
        let pseudo_matching = MatchingContext::new(
            MatchingMode::ForStatelessPseudoElement,
            None,
            &mut pseudo_caches,
            Self::quirks(doc),
            NeedsSelectorFlags::No,
            MatchingForInvalidation::No,
        );
        let mut matchers = Matchers {
            element: matching,
            pseudo: pseudo_matching,
            candidates: Vec::new(),
        };

        let mut tree = StyleTree {
            styles: HashMap::with_capacity(doc.node_count()),
            pseudos: HashMap::new(),
            revision: doc.revision(),
            root_font_size: 16.0,
        };
        let initial = Rc::new(ComputedStyle::initial());
        tree.styles.insert(doc.root(), initial.clone());

        let Some(root_element) = doc.document_element() else {
            return tree;
        };
        let mut root_font_size = 16.0;

        // Explicit stack: (node, parent style).
        let mut stack: Vec<(NodeId, Rc<ComputedStyle>)> = vec![(root_element, initial)];
        while let Some((id, parent_style)) = stack.pop() {
            let Some(node) = doc.get(id) else { continue };
            if !node.is_element() {
                // Text, comments, etc. share the parent's style.
                tree.styles.insert(id, parent_style);
                continue;
            }
            let is_root = id == root_element;
            let (style, pseudos) = self.cascade_element(
                &rules,
                doc,
                id,
                &parent_style,
                root_font_size,
                is_root,
                &mut matchers,
            );
            if is_root {
                root_font_size = style.font_size;
                tree.root_font_size = root_font_size;
            }
            // Push children in reverse so they pop in tree order.
            let children: Vec<NodeId> = doc.children(id).collect();
            for child in children.into_iter().rev() {
                stack.push((child, style.clone()));
            }
            tree.set_pseudos(id, pseudos);
            tree.styles.insert(id, style);
        }
        tree
    }

    /// Computes styles for the whole tree and clears every `STYLE_SELF` /
    /// `STYLE_DESCENDANTS` bit. Nodes whose layout-affecting style changed
    /// relative to `previous` are marked `LAYOUT`.
    pub fn compute_and_clear(
        &self,
        doc: &mut Document,
        previous: Option<&StyleTree>,
    ) -> (StyleTree, usize) {
        let tree = self.compute(doc);
        let mut layout_dirtied = 0;
        let ids: Vec<NodeId> = tree.styles.keys().copied().collect();
        for id in ids {
            doc.clear_dirty(id, DirtyFlags::STYLE_SELF | DirtyFlags::STYLE_DESCENDANTS);
            if let Some(prev) = previous
                && doc.get(id).is_some_and(Node::is_element)
            {
                let new = &tree.styles[&id];
                let changed = prev.get(id).is_none_or(|old| !old.layout_eq(new));
                if changed {
                    doc.mark_dirty(id, DirtyFlags::LAYOUT);
                    layout_dirtied += 1;
                } else if prev.get(id).is_some_and(|old| **old != **new) {
                    doc.mark_dirty(id, DirtyFlags::PAINT);
                }
            }
        }
        (tree, layout_dirtied)
    }

    /// Restyles only what changed since `since`, updating `tree` in place.
    ///
    /// 1. Journal entries after `since` are translated into `STYLE_SELF` /
    ///    `STYLE_DESCENDANTS` bits through the invalidation map (attribute
    ///    changes no rule depends on set no style bit).
    /// 2. The tree is walked from the root; a subtree with no style bits and
    ///    no dirty descendants is skipped without touching it. An element is
    ///    recomputed if it carries `STYLE_SELF`, if an ancestor carries
    ///    `STYLE_DESCENDANTS`, or if its parent's recomputed style changed in
    ///    an inherited property.
    /// 3. Recomputed elements whose layout-affecting properties changed are
    ///    marked `LAYOUT` (paint-only changes mark `PAINT`); style bits are
    ///    cleared.
    ///
    /// The cost is proportional to the dirty subtrees, not the document.
    /// Falls back to a full recompute when the journal no longer reaches
    /// `since`, when `:has()` is in use, or when the tree is empty.
    pub fn restyle_incremental(
        &self,
        doc: &mut Document,
        tree: &mut StyleTree,
        since: Revision,
    ) -> RestyleStats {
        let span = Stage::Style.span();
        let _guard = span.enter();
        let rules = self.rule_set();
        let mut stats = RestyleStats::default();

        let previous_revision = tree.revision;
        let invalidation = rules.invalidation.apply_journal(doc, since);
        stats.invalidation = invalidation;
        let needs_full = invalidation.full
            || tree.is_empty()
            || previous_revision > doc.revision()
            || doc.document_element().is_none();
        if needs_full {
            let (new_tree, layout_dirtied) = self.compute_and_clear(doc, Some(tree));
            *tree = new_tree;
            stats.full = true;
            stats.recomputed = tree.styles.len();
            stats.layout_dirtied = layout_dirtied;
            return stats;
        }

        // Drop styles of nodes removed since the last pass.
        if let Some(entries) = doc.journal().entries_since(since) {
            let removed: Vec<NodeId> = entries
                .filter_map(|e| match &e.mutation {
                    ve_dom::Mutation::NodeRemoved { node, .. } => Some(*node),
                    _ => None,
                })
                .collect();
            for node in removed {
                if doc.parent(node).is_none() {
                    tree.remove_subtree(doc, node);
                }
            }
        }

        let mut caches = SelectorCaches::default();
        let matching = MatchingContext::new(
            MatchingMode::Normal,
            None,
            &mut caches,
            Self::quirks(doc),
            NeedsSelectorFlags::No,
            MatchingForInvalidation::No,
        );
        let mut pseudo_caches = SelectorCaches::default();
        let pseudo_matching = MatchingContext::new(
            MatchingMode::ForStatelessPseudoElement,
            None,
            &mut pseudo_caches,
            Self::quirks(doc),
            NeedsSelectorFlags::No,
            MatchingForInvalidation::No,
        );
        let mut matchers = Matchers {
            element: matching,
            pseudo: pseudo_matching,
            candidates: Vec::new(),
        };

        let root_element = doc.document_element().expect("checked above");
        let initial = tree.style(doc.root());
        let mut root_font_size = tree.root_font_size();
        let mut to_clear: Vec<NodeId> = Vec::new();
        let mut layout_dirty: Vec<(NodeId, bool)> = Vec::new();

        // Stack: (node, parent style, force recompute).
        let mut stack: Vec<(NodeId, Rc<ComputedStyle>, bool)> =
            vec![(root_element, initial, false)];
        while let Some((id, parent_style, force)) = stack.pop() {
            let Some(node) = doc.get(id) else { continue };
            let dirty = node.dirty();
            if !node.is_element() {
                if force || !tree.styles.contains_key(&id) {
                    tree.styles.insert(id, parent_style);
                }
                continue;
            }
            let is_root = id == root_element;
            let self_dirty =
                dirty.intersects(DirtyFlags::STYLE_SELF | DirtyFlags::STYLE_DESCENDANTS);
            let recompute = force || self_dirty || !tree.styles.contains_key(&id);
            let mut child_force = force || dirty.contains(DirtyFlags::STYLE_DESCENDANTS);

            let style = if recompute {
                let (style, pseudos) = self.cascade_element(
                    &rules,
                    doc,
                    id,
                    &parent_style,
                    root_font_size,
                    is_root,
                    &mut matchers,
                );
                stats.recomputed += 1;
                if let Some(old) = tree.styles.get(&id) {
                    if **old != *style {
                        if !old.inherited_eq(&style) {
                            child_force = true;
                        }
                        layout_dirty.push((id, !old.layout_eq(&style)));
                    }
                } else {
                    layout_dirty.push((id, true));
                }
                if is_root {
                    root_font_size = style.font_size;
                    tree.root_font_size = root_font_size;
                }
                tree.set_pseudos(id, pseudos);
                tree.styles.insert(id, style.clone());
                to_clear.push(id);
                style
            } else {
                tree.styles[&id].clone()
            };

            if child_force || dirty.contains(DirtyFlags::DESCENDANTS) {
                let children: Vec<NodeId> = doc.children(id).collect();
                for child in children.into_iter().rev() {
                    stack.push((child, style.clone(), child_force));
                }
            } else {
                stats.skipped_subtrees += 1;
            }
        }
        for id in to_clear {
            doc.clear_dirty(id, DirtyFlags::STYLE_SELF | DirtyFlags::STYLE_DESCENDANTS);
        }
        for (id, layout) in layout_dirty {
            if layout {
                doc.mark_dirty(id, DirtyFlags::LAYOUT);
                stats.layout_dirtied += 1;
            } else {
                doc.mark_dirty(id, DirtyFlags::PAINT);
            }
        }
        tree.revision = doc.revision();
        stats
    }

    /// Returns every element of the light tree matching `selector`, in tree order.
    pub fn select(&self, doc: &Document, selector: &str) -> Result<Vec<NodeId>> {
        let list = parse_selector_list(selector)?;
        Ok(self.select_list(doc, &list))
    }

    /// Like [`Self::select`] with a pre-parsed list.
    #[must_use]
    pub fn select_list(&self, doc: &Document, list: &SelectorList<VeSelectorImpl>) -> Vec<NodeId> {
        let mut caches = SelectorCaches::default();
        let mut ctx = MatchingContext::new(
            MatchingMode::Normal,
            None,
            &mut caches,
            Self::quirks(doc),
            NeedsSelectorFlags::No,
            MatchingForInvalidation::No,
        );
        doc.elements()
            .filter(|&id| {
                matches_selector_list(list, &DomElement::new(doc, &self.interaction, id), &mut ctx)
            })
            .collect()
    }

    /// The first element matching `selector`, or [`Error::NoMatch`].
    pub fn select_one(&self, doc: &Document, selector: &str) -> Result<NodeId> {
        self.select(doc, selector)?
            .into_iter()
            .next()
            .ok_or_else(|| Error::NoMatch(selector.to_owned()))
    }

    /// Returns `true` if element `id` matches `selector`.
    pub fn matches(&self, doc: &Document, id: NodeId, selector: &str) -> Result<bool> {
        if !doc.get(id).is_some_and(Node::is_element) {
            return Ok(false);
        }
        let list = parse_selector_list(selector)?;
        let mut caches = SelectorCaches::default();
        let mut ctx = MatchingContext::new(
            MatchingMode::Normal,
            None,
            &mut caches,
            Self::quirks(doc),
            NeedsSelectorFlags::No,
            MatchingForInvalidation::No,
        );
        Ok(matches_selector_list(
            &list,
            &DomElement::new(doc, &self.interaction, id),
            &mut ctx,
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::values::{Display, FontWeight, LengthPercentageAuto, Rgba};
    use ve_dom::{Attribute, Namespace};

    /// Builds `<html><head><style>{css}</style></head><body>{body builder}</body></html>`.
    fn document(css: &str, build: impl FnOnce(&mut Document, NodeId)) -> (Document, NodeId) {
        let mut doc = Document::new();
        let root = doc.root();
        let html = doc.create_element("html", Namespace::Html);
        let head = doc.create_element("head", Namespace::Html);
        let style = doc.create_element("style", Namespace::Html);
        let body = doc.create_element("body", Namespace::Html);
        doc.append_child(root, html).unwrap();
        doc.append_child(html, head).unwrap();
        doc.append_child(head, style).unwrap();
        doc.append_text(style, css).unwrap();
        doc.append_child(html, body).unwrap();
        build(&mut doc, body);
        (doc, body)
    }

    fn el(doc: &mut Document, parent: NodeId, name: &str, attrs: &[(&str, &str)]) -> NodeId {
        let attrs = attrs
            .iter()
            .map(|(n, v)| Attribute {
                name: (*n).into(),
                value: (*v).into(),
            })
            .collect();
        let id = doc.create_element_with_attrs(name, Namespace::Html, attrs);
        doc.append_child(parent, id).unwrap();
        id
    }

    #[test]
    fn cascade_respects_origin_specificity_importance_and_order() {
        let css = r"
            p { color: red; font-weight: bold }
            .note { color: green }
            p.note { color: blue }
            #x { color: purple !important }
            p { color: yellow }
            div p { font-weight: normal !important }
            @media (max-width: 500px) { p { display: none } }
        ";
        let (doc, body) = document(css, |doc, body| {
            let div = el(doc, body, "div", &[]);
            el(
                doc,
                div,
                "p",
                &[("class", "note"), ("id", "x"), ("style", "color: orange")],
            );
            el(doc, div, "p", &[("class", "note")]);
            el(doc, div, "p", &[("style", "font-weight: 900")]);
        });
        let mut engine = StyleEngine::new();
        engine.media = MediaEnv::screen(1000.0, 800.0);
        engine.add_document_styles(&doc);
        let styles = engine.compute(&doc);

        let ps = engine.select(&doc, "p").unwrap();
        assert_eq!(ps.len(), 3);
        // !important id rule beats the inline style attribute.
        assert_eq!(styles.style(ps[0]).color, Rgba::rgb(128, 0, 128));
        // p.note (0,1,1) beats later plain `p` (0,0,1) and .note (0,1,0).
        assert_eq!(styles.style(ps[1]).color, Rgba::rgb(0, 0, 255));
        // UA/author normal loses to author !important even against inline style.
        assert_eq!(styles.style(ps[2]).font_weight, FontWeight::NORMAL);
        // UA stylesheet: p is block, head is display:none, body inherits nothing odd.
        assert_eq!(styles.style(ps[0]).display, Display::Block);
        assert!(!styles.is_displayed(doc.head().unwrap()));
        assert!(styles.is_displayed(body));

        // Narrow viewport activates the media rule.
        engine.media = MediaEnv::screen(400.0, 800.0);
        let narrow = engine.compute(&doc);
        assert_eq!(narrow.style(ps[1]).display, Display::None);
        assert_eq!(
            engine.coverage().declarations_total,
            10,
            "8 sheet + 2 inline"
        );
    }

    #[test]
    fn inheritance_relative_units_and_interaction_state() {
        let css = r"
            body { font-size: 20px; color: navy; --pad: 2em }
            .box { padding-top: var(--pad); width: 50%; font-size: 150% }
            a:hover { color: red }
            input:checked + label { font-weight: bold }
        ";
        let (mut doc, body) = document(css, |doc, body| {
            let bx = el(doc, body, "div", &[("class", "box")]);
            doc.append_text(bx, "text").unwrap();
            el(doc, body, "a", &[("href", "#")]);
            el(doc, body, "input", &[("type", "checkbox")]);
            el(doc, body, "label", &[]);
        });
        let mut engine = StyleEngine::new();
        engine.add_document_styles(&doc);
        let styles = engine.compute(&doc);

        let bx = engine.select_one(&doc, ".box").unwrap();
        let s = styles.style(bx);
        assert_eq!(s.font_size, 30.0);
        assert_eq!(
            s.padding_top,
            crate::values::LengthPercentage::Px(60.0),
            "var() then em against own font-size"
        );
        assert_eq!(s.width, LengthPercentageAuto::Percent(50.0));
        assert_eq!(s.color, Rgba::rgb(0, 0, 128), "inherited from body");
        let text = doc.first_child(bx).unwrap();
        assert!(
            Rc::ptr_eq(styles.get(text).unwrap(), styles.get(bx).unwrap()),
            "text shares parent style"
        );

        let a = engine.select_one(&doc, "a").unwrap();
        assert_eq!(
            styles.style(a).color,
            Rgba::rgb(0, 0, 238),
            "UA link colour"
        );
        engine.interaction.set_hover_chain(&[a, body]);
        assert_eq!(engine.compute(&doc).style(a).color, Rgba::rgb(255, 0, 0));

        let label = engine.select_one(&doc, "label").unwrap();
        let input = engine.select_one(&doc, "input").unwrap();
        assert_eq!(styles.style(label).font_weight, FontWeight::NORMAL);
        doc.set_checked(input, true).unwrap();
        assert_eq!(
            engine.compute(&doc).style(label).font_weight,
            FontWeight::BOLD
        );
        assert!(engine.matches(&doc, input, ":checked").unwrap());
        assert!(matches!(
            engine.select_one(&doc, "table"),
            Err(Error::NoMatch(_))
        ));
    }

    #[test]
    fn revert_and_generated_content() {
        let css = r#"
            p { display: revert; margin-top: revert; color: revert }
            .q::before { content: "[" attr(data-n) "] "; display: inline }
            .q::after { content: none }
            .hidden::before { content: "x"; display: none }
            .plain::before { content: normal }
        "#;
        let (doc, _body) = document(css, |doc, body| {
            el(doc, body, "p", &[]);
            el(doc, body, "span", &[("class", "q"), ("data-n", "7")]);
            el(doc, body, "span", &[("class", "hidden")]);
            el(doc, body, "span", &[("class", "plain")]);
        });
        let mut engine = StyleEngine::new();
        engine.add_document_styles(&doc);
        let styles = engine.compute(&doc);
        let p = engine.select_one(&doc, "p").unwrap();
        assert_eq!(
            styles.style(p).display,
            Display::Block,
            "revert -> UA block"
        );
        assert_eq!(
            styles.style(p).margin_top,
            LengthPercentageAuto::Px(16.0),
            "revert -> UA 1em margin"
        );
        assert_eq!(
            styles.style(p).color,
            Rgba::BLACK,
            "no UA colour -> unset -> inherit"
        );

        let q = engine.select_one(&doc, ".q").unwrap();
        assert_eq!(styles.pseudo_text(q, PseudoElement::Before), Some("[7] "));
        assert!(
            styles.pseudo(q, PseudoElement::After).is_none(),
            "content: none"
        );
        let hidden = engine.select_one(&doc, ".hidden").unwrap();
        assert!(
            styles.pseudo(hidden, PseudoElement::Before).is_none(),
            "display: none"
        );
        let plain = engine.select_one(&doc, ".plain").unwrap();
        assert!(
            styles.pseudo(plain, PseudoElement::Before).is_none(),
            "content: normal"
        );
        assert!(engine.rule_set().has_generated_content_rules());
    }

    /// Builds a wide document: `body > div.section*sections > p*per_section`.
    fn wide_document(sections: usize, per_section: usize) -> (Document, Vec<NodeId>) {
        let mut ids = Vec::new();
        let (doc, _) = document(
            ".hot p { color: red } .hot { padding-left: 4px } [data-x] { background-color: blue } .cold + div { color: green }",
            |doc, body| {
                for _ in 0..sections {
                    let div = el(doc, body, "div", &[("class", "section")]);
                    ids.push(div);
                    for _ in 0..per_section {
                        let p = el(doc, div, "p", &[]);
                        doc.append_text(p, "hello").unwrap();
                    }
                }
            },
        );
        (doc, ids)
    }

    #[test]
    fn incremental_restyle_touches_only_the_dirty_subtree() {
        let (mut doc, sections) = wide_document(50, 20);
        let engine = StyleEngine::new();
        let mut engine = engine;
        engine.add_document_styles(&doc);
        let (mut tree, _) = engine.compute_and_clear(&mut doc, None);
        let total_elements = doc.elements().count();
        assert!(total_elements > 1000);

        // Toggle a class on one section: the section and its 20 paragraphs
        // (plus their text nodes) are the whole dirty subtree.
        let since = doc.revision();
        let target = sections[17];
        doc.set_attribute(target, "class", "section hot").unwrap();
        let stats = engine.restyle_incremental(&mut doc, &mut tree, since);
        assert!(!stats.full);
        assert_eq!(stats.recomputed, 21, "the section + 20 descendants");
        assert!(stats.recomputed < total_elements / 10);
        let p = doc.children(target).next().unwrap();
        assert_eq!(tree.style(p).color, Rgba::rgb(255, 0, 0));
        assert_eq!(
            tree.style(target).padding_left,
            crate::values::LengthPercentage::Px(4.0)
        );
        assert!(
            doc.dirty(target).contains(DirtyFlags::LAYOUT),
            "padding change dirties layout"
        );
        assert!(
            !doc.dirty(target).contains(DirtyFlags::STYLE),
            "style bit cleared"
        );

        // Toggling it back recomputes the same subtree and restores the colour.
        let since = doc.revision();
        doc.set_attribute(target, "class", "section").unwrap();
        let stats = engine.restyle_incremental(&mut doc, &mut tree, since);
        assert_eq!(stats.recomputed, 21);
        assert_eq!(tree.style(p).color, Rgba::BLACK);

        // Paint-only change: recomputed, but LAYOUT not set.
        let since = doc.revision();
        let other = sections[3];
        doc.clear_dirty(other, DirtyFlags::ALL);
        doc.set_attribute(other, "data-x", "1").unwrap();
        let stats = engine.restyle_incremental(&mut doc, &mut tree, since);
        assert_eq!(
            stats.recomputed, 1,
            "[data-x] is a subject-only dependency on a non-inherited property"
        );
        assert_eq!(stats.layout_dirtied, 0);
        assert!(doc.dirty(other).contains(DirtyFlags::PAINT));
        assert_eq!(
            tree.style(other).background_color,
            crate::values::Color::Rgba(Rgba::rgb(0, 0, 255))
        );
    }

    #[test]
    fn attribute_without_dependency_sets_no_style_bit() {
        let (mut doc, sections) = wide_document(3, 2);
        let mut engine = StyleEngine::new();
        engine.add_document_styles(&doc);
        let (mut tree, _) = engine.compute_and_clear(&mut doc, None);

        let since = doc.revision();
        let target = sections[1];
        doc.set_attribute(target, "aria-label", "Section").unwrap();
        assert!(
            doc.dirty(target).contains(DirtyFlags::STYLE),
            "ve-dom sets a provisional bit"
        );
        let stats = engine
            .rule_set()
            .invalidation
            .apply_journal(&mut doc, since);
        assert_eq!(stats.ignored_attribute_changes, 1);
        assert_eq!(stats.marked_self, 0);
        assert!(
            !doc.dirty(target).contains(DirtyFlags::STYLE),
            "no rule depends on aria-label"
        );

        let restyle = engine.restyle_incremental(&mut doc, &mut tree, since);
        assert_eq!(restyle.recomputed, 0, "nothing to recompute");

        // A sibling-dependent class marks the parent's descendants.
        let since = doc.revision();
        doc.set_attribute(target, "class", "section cold").unwrap();
        let restyle = engine.restyle_incremental(&mut doc, &mut tree, since);
        let next = doc.next_sibling(target).unwrap();
        assert_eq!(
            tree.style(next).color,
            Rgba::rgb(0, 128, 0),
            ".cold + div matched"
        );
        assert!(restyle.recomputed >= 2);
        assert!(!restyle.full);
    }

    #[test]
    fn incremental_restyle_handles_insertions_and_inherited_changes() {
        let (mut doc, sections) = wide_document(4, 3);
        let mut engine = StyleEngine::new();
        engine.add_stylesheet("body.big { font-size: 20px } .n { display: none }");
        engine.add_document_styles(&doc);
        let (mut tree, _) = engine.compute_and_clear(&mut doc, None);
        let body = doc.body().unwrap();

        // Inserting a node styles it and its subtree.
        let since = doc.revision();
        let fresh = doc.create_element_with_attrs(
            "p",
            Namespace::Html,
            vec![Attribute {
                name: "class".into(),
                value: "n".into(),
            }],
        );
        doc.append_child(sections[0], fresh).unwrap();
        let stats = engine.restyle_incremental(&mut doc, &mut tree, since);
        assert!(!stats.full);
        assert_eq!(tree.style(fresh).display, Display::None);
        assert!(stats.recomputed <= 2);

        // An inherited change on body forces the whole subtree (it must,
        // since every descendant's `em` values depend on it).
        let since = doc.revision();
        doc.set_attribute(body, "class", "big").unwrap();
        let stats = engine.restyle_incremental(&mut doc, &mut tree, since);
        assert!(stats.recomputed > 12);
        assert_eq!(tree.style(sections[2]).font_size, 20.0);
        let full = engine.compute(&doc);
        for id in doc.elements() {
            assert_eq!(
                *tree.style(id),
                *full.style(id),
                "incremental == full for {id}"
            );
        }
    }
}
