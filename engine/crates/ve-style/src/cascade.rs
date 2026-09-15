//! The [`StyleEngine`]: selector matching plus cascade over a whole document.

use std::collections::HashMap;
use std::rc::Rc;

use selectors::SelectorList;
use selectors::context::{
    MatchingContext, MatchingForInvalidation, MatchingMode, NeedsSelectorFlags, QuirksMode,
    SelectorCaches,
};
use selectors::matching::{matches_selector, matches_selector_list};
use selectors::parser::{Component, Selector};
use ve_core::{Error, NodeId, Result, Revision, Stage};
use ve_dom::{Document, ElementData, Node};

use crate::computed::{ComputeContext, ComputedStyle};
use crate::element::{DomElement, InteractionState};
use crate::media::MediaEnv;
use crate::selector_impl::{VeSelectorImpl, parse_selector_list};
use crate::stylesheet::{
    CssRule, Origin, PropertyDeclaration, StyleRule, Stylesheet, parse_declaration_block,
    parse_stylesheet,
};
use crate::ua::UA_STYLESHEET;

/// Computed styles for every node of a document at a given revision.
#[derive(Clone, Debug, Default)]
pub struct StyleTree {
    styles: HashMap<NodeId, Rc<ComputedStyle>>,
    revision: Revision,
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

/// `(rule index, selector index within the rule's list)`.
type SelectorRef = (u32, u32);

/// Selectors bucketed by the rightmost compound, so an element only tries
/// the selectors that can match it: those keyed by its id, one of its
/// classes, or its local name, plus the unkeyed rest. Matching every
/// selector of every rule against every element was the dominant cost of a
/// restyle (≈200 selectors × 400 elements on the static fixtures).
#[derive(Default)]
struct RuleIndex {
    universal: Vec<SelectorRef>,
    by_tag: HashMap<String, Vec<SelectorRef>>,
    by_id: HashMap<String, Vec<SelectorRef>>,
    by_class: HashMap<String, Vec<SelectorRef>>,
}

impl RuleIndex {
    fn build(rules: &[(Origin, &StyleRule)], quirks: QuirksMode) -> Self {
        let mut index = Self::default();
        // In quirks mode id and class matching is case-insensitive; keying
        // by the literal text would miss matches, so only tags are keyed.
        let key_idents = quirks != QuirksMode::Quirks;
        for (r, (_, rule)) in rules.iter().enumerate() {
            for (s, selector) in rule.selectors.slice().iter().enumerate() {
                let sref = (r as u32, s as u32);
                let (mut id, mut class, mut tag) = (None, None, None);
                // `iter()` yields the rightmost compound only (a combinator
                // ends it), which is the compound tested against the element.
                for component in selector.iter() {
                    match component {
                        Component::ID(v) if key_idents => id = Some(v.as_str()),
                        Component::Class(v) if key_idents => class = Some(v.as_str()),
                        Component::LocalName(n) => tag = Some(n),
                        _ => {}
                    }
                }
                if let Some(id) = id {
                    index.by_id.entry(id.to_owned()).or_default().push(sref);
                } else if let Some(class) = class {
                    index
                        .by_class
                        .entry(class.to_owned())
                        .or_default()
                        .push(sref);
                } else if let Some(tag) = tag {
                    // Matching uses `lower_name` for HTML elements and `name`
                    // otherwise; key under both so the lookup by the element's
                    // own name always finds the selector.
                    index
                        .by_tag
                        .entry(tag.lower_name.0.clone())
                        .or_default()
                        .push(sref);
                    if tag.name != tag.lower_name {
                        index
                            .by_tag
                            .entry(tag.name.0.clone())
                            .or_default()
                            .push(sref);
                    }
                } else {
                    index.universal.push(sref);
                }
            }
        }
        index
    }

    /// Selector references that may match `element`, unordered, possibly
    /// with duplicates (a tag keyed under two spellings).
    fn candidates<'a>(
        &'a self,
        element: &'a ElementData,
    ) -> impl Iterator<Item = SelectorRef> + 'a {
        let by_tag = self.by_tag.get(element.name.as_str());
        let by_id = element.id().and_then(|id| self.by_id.get(id));
        let by_class = element.classes().filter_map(|c| self.by_class.get(c));
        self.universal
            .iter()
            .chain(by_tag.into_iter().flatten())
            .chain(by_id.into_iter().flatten())
            .chain(by_class.flatten())
            .copied()
    }
}

fn selector_of<'a>(
    rules: &[(Origin, &'a StyleRule)],
    sref: SelectorRef,
) -> &'a Selector<VeSelectorImpl> {
    &rules[sref.0 as usize].1.selectors.slice()[sref.1 as usize]
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
        }
    }

    /// Adds an author stylesheet from source text.
    pub fn add_stylesheet(&mut self, css: &str) {
        self.author.push(parse_stylesheet(css, Origin::Author));
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
                    self.add_stylesheet(&doc.text_content(id));
                }
            }
        }
    }

    /// Removes all author stylesheets.
    pub fn clear_author_styles(&mut self) {
        self.author.clear();
    }

    /// Number of author stylesheets.
    #[must_use]
    pub fn author_stylesheet_count(&self) -> usize {
        self.author.len()
    }

    /// Flattens all stylesheets into the style rules that apply under the
    /// current media environment, in cascade source order.
    fn applicable_rules(&self) -> Vec<(Origin, &StyleRule)> {
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
                    CssRule::Media(_) => {}
                }
            }
        }
        let mut out = Vec::new();
        walk(&self.ua.rules, Origin::UserAgent, &self.media, &mut out);
        for sheet in &self.author {
            walk(&sheet.rules, sheet.origin, &self.media, &mut out);
        }
        out
    }

    fn quirks(doc: &Document) -> QuirksMode {
        match doc.quirks_mode() {
            ve_dom::QuirksMode::NoQuirks => QuirksMode::NoQuirks,
            ve_dom::QuirksMode::LimitedQuirks => QuirksMode::LimitedQuirks,
            ve_dom::QuirksMode::Quirks => QuirksMode::Quirks,
        }
    }

    /// Computes styles for the whole light tree of `doc`.
    #[must_use]
    pub fn compute(&self, doc: &Document) -> StyleTree {
        let span = Stage::Style.span();
        let _guard = span.enter();

        let rules = self.applicable_rules();
        let index = RuleIndex::build(&rules, Self::quirks(doc));
        let mut caches = SelectorCaches::default();
        let mut matching = MatchingContext::new(
            MatchingMode::Normal,
            None,
            &mut caches,
            Self::quirks(doc),
            NeedsSelectorFlags::No,
            MatchingForInvalidation::No,
        );
        // Reused per element: (rule index, specificity) of matching selectors.
        let mut matched: Vec<(u32, u32)> = Vec::new();

        let mut tree = StyleTree {
            styles: HashMap::with_capacity(doc.node_count()),
            revision: doc.revision(),
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

            let element = DomElement::new(doc, &self.interaction, id);
            let mut candidates: Vec<(CascadeKey, &PropertyDeclaration)> = Vec::new();
            matched.clear();
            if let Some(data) = doc.element(id) {
                for sref in index.candidates(data) {
                    let selector = selector_of(&rules, sref);
                    if matches_selector(selector, 0, None, &element, &mut matching) {
                        matched.push((sref.0, selector.specificity()));
                    }
                }
            }
            // A rule applies with the highest specificity among its matching
            // selectors; `order` is its position in cascade source order.
            // Sort rule-ascending, specificity-descending so dedup keeps the
            // maximum (and drops a tag selector found under two spellings).
            matched.sort_unstable_by(|a, b| a.0.cmp(&b.0).then(b.1.cmp(&a.1)));
            matched.dedup_by_key(|m| m.0);
            for &(order, specificity) in &matched {
                let (origin, rule) = rules[order as usize];
                for decl in &rule.block.declarations {
                    let key = CascadeKey {
                        level: level(origin, decl.important),
                        specificity,
                        order,
                    };
                    candidates.push((key, decl));
                }
            }
            // Inline `style=""`: author origin, beats any selector.
            let inline = doc.attribute(id, "style").map(parse_declaration_block);
            if let Some(block) = &inline {
                for decl in &block.declarations {
                    let key = CascadeKey {
                        level: level(Origin::Author, decl.important),
                        specificity: u32::MAX,
                        order: u32::MAX,
                    };
                    candidates.push((key, decl));
                }
            }
            candidates.sort_by_key(|(key, _)| *key);
            let ordered: Vec<&PropertyDeclaration> = candidates.iter().map(|(_, d)| *d).collect();

            let is_root = id == root_element;
            let ctx = ComputeContext {
                parent: &parent_style,
                root_font_size,
                viewport: self.media.viewport,
                is_root,
            };
            let style = Rc::new(ComputedStyle::cascade(&ordered, &ctx));
            if is_root {
                root_font_size = style.font_size;
            }

            // Push children in reverse so they pop in tree order.
            let children: Vec<NodeId> = doc.children(id).collect();
            for child in children.into_iter().rev() {
                stack.push((child, style.clone()));
            }
            tree.styles.insert(id, style);
        }
        tree
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
}
