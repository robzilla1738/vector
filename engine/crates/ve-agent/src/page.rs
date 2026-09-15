//! The [`Page`] trait and its in-engine implementation [`DomPage`].

use std::collections::HashMap;
use std::time::Duration;

use ve_a11y::{
    AccessibilityTree, BuildOptions, Role, SemanticSnapshot, SnapshotFormat, compute_name,
};
use ve_core::{Error, NodeId, Point, Rect, Result, Size, Stage};
use ve_dom::{DirtyFlags, Document, NodeKind};
use ve_layout::{LayoutEngine, LayoutTree};
use ve_script::{EventLoop, JsVm, TaskSource, default_vm};
use ve_style::{StyleEngine, StyleTree};

use crate::readiness::Readiness;
use crate::steps::Target;

/// The result of a navigation performed by a [`Loader`].
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct LoadedDocument {
    /// Final URL (after redirects).
    pub url: String,
    /// Decoded HTML source.
    pub html: String,
}

/// Fetches documents for navigations. Supplied by the embedder (usually
/// backed by `ve-net`) so this crate stays independent of the network stack.
pub type Loader = Box<dyn FnMut(&str) -> Result<LoadedDocument>>;

/// Scroll position after a scroll step.
#[derive(Clone, Copy, Debug, Default, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct ScrollState {
    /// Horizontal offset.
    pub x: f32,
    /// Vertical offset.
    pub y: f32,
    /// Maximum horizontal offset.
    pub max_x: f32,
    /// Maximum vertical offset.
    pub max_y: f32,
}

impl ScrollState {
    /// Whether the container is scrolled to its bottom.
    #[must_use]
    pub fn at_bottom(&self) -> bool {
        self.y >= self.max_y - 0.5
    }
}

/// A live page as seen by the [`crate::Executor`].
pub trait Page {
    /// The DOM.
    fn document(&self) -> &Document;
    /// Current computed styles.
    fn style_tree(&self) -> &StyleTree;
    /// Current layout.
    fn layout_tree(&self) -> &LayoutTree;
    /// Document URL, if any.
    fn url(&self) -> Option<&str>;
    /// Current readiness without doing any work.
    fn readiness(&self) -> Readiness;
    /// Runs the event loop, pending navigations and restyle/relayout until
    /// the page is ready or `max_tasks` tasks have run.
    fn settle(&mut self, max_tasks: usize) -> Readiness;
    /// Advances virtual time (fires due timers on the next settle).
    fn advance_time(&mut self, by: Duration);
    /// Requests a navigation; completed by [`Self::settle`].
    fn navigate(&mut self, url: &str) -> Result<()>;
    /// Resolves a target to elements in document order.
    fn resolve(&self, target: &Target) -> Result<Vec<NodeId>>;
    /// Activates an element.
    fn click(&mut self, id: NodeId) -> Result<()>;
    /// Sets a text control's value.
    fn fill(&mut self, id: NodeId, value: &str) -> Result<()>;
    /// Selects an option by value or text.
    fn select(&mut self, id: NodeId, value: &str) -> Result<()>;
    /// Presses a key, optionally focusing `target` first.
    fn press(&mut self, target: Option<NodeId>, key: &str) -> Result<()>;
    /// Scrolls the page (or `target`) by a delta.
    fn scroll(&mut self, target: Option<NodeId>, dx: f32, dy: f32) -> Result<ScrollState>;
    /// Captures a semantic snapshot of the whole page.
    fn snapshot(&self, format: SnapshotFormat) -> SemanticSnapshot;
    /// Captures a snapshot of one element's subtree.
    fn snapshot_of(&self, id: NodeId, format: SnapshotFormat) -> Option<SemanticSnapshot>;
    /// The focused element.
    fn focused(&self) -> Option<NodeId>;
    /// Takes the last asynchronous failure (e.g. a navigation that could not
    /// load), if one happened since the previous call.
    fn take_last_error(&mut self) -> Option<String>;
}

/// In-engine page: DOM + styles + layout + event loop + VM.
pub struct DomPage {
    doc: Document,
    url: Option<String>,
    style_engine: StyleEngine,
    style_tree: StyleTree,
    layout_engine: LayoutEngine,
    layout: LayoutTree,
    event_loop: EventLoop,
    vm: Box<dyn JsVm>,
    viewport: Size,
    scroll: Point,
    element_scroll: HashMap<NodeId, Point>,
    pending_navigation: Option<String>,
    loader: Option<Loader>,
    last_error: Option<String>,
}

impl std::fmt::Debug for DomPage {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("DomPage")
            .field("url", &self.url)
            .field("nodes", &self.doc.node_count())
            .field("revision", &self.doc.revision())
            .field("viewport", &self.viewport)
            .finish_non_exhaustive()
    }
}

/// Default viewport for pages created without one.
pub const DEFAULT_VIEWPORT: Size = Size {
    width: 1280.0,
    height: 720.0,
};

impl DomPage {
    /// Parses `html` into a fully styled and laid-out page.
    #[must_use]
    pub fn from_html(html: &str, url: Option<&str>) -> Self {
        Self::from_html_with_viewport(html, url, DEFAULT_VIEWPORT)
    }

    /// Like [`Self::from_html`] with an explicit viewport.
    #[must_use]
    pub fn from_html_with_viewport(html: &str, url: Option<&str>, viewport: Size) -> Self {
        let doc = ve_html::parse_document(html).document;
        let mut style_engine = StyleEngine::new();
        style_engine.media = ve_style::MediaEnv::screen(viewport.width, viewport.height);
        let mut page = Self {
            doc,
            url: url.map(str::to_owned),
            style_engine,
            style_tree: StyleTree::default(),
            layout_engine: LayoutEngine::new(),
            layout: LayoutEngine::new().layout(&Document::new(), &StyleTree::default(), viewport),
            event_loop: EventLoop::new(),
            vm: default_vm(),
            viewport,
            scroll: Point::ZERO,
            element_scroll: HashMap::new(),
            pending_navigation: None,
            loader: None,
            last_error: None,
        };
        page.rebuild_styles();
        page.update();
        page
    }

    /// Installs the loader used for navigations.
    #[must_use]
    pub fn with_loader(mut self, loader: Loader) -> Self {
        self.loader = Some(loader);
        self
    }

    /// Replaces the JavaScript VM.
    pub fn set_vm(&mut self, vm: Box<dyn JsVm>) {
        self.vm = vm;
    }

    /// Mutable DOM access; the next [`Page::settle`] restyles as needed.
    pub fn document_mut(&mut self) -> &mut Document {
        &mut self.doc
    }

    /// The event loop (to queue tasks or timers).
    pub fn event_loop_mut(&mut self) -> &mut EventLoop {
        &mut self.event_loop
    }

    /// The style engine (to add stylesheets or tweak the media environment).
    pub fn style_engine_mut(&mut self) -> &mut StyleEngine {
        &mut self.style_engine
    }

    /// Viewport size.
    #[must_use]
    pub fn viewport(&self) -> Size {
        self.viewport
    }

    /// Changes the viewport and relayouts on the next settle.
    pub fn set_viewport(&mut self, viewport: Size) {
        self.viewport = viewport;
        self.style_engine.media.viewport = viewport;
        self.style_tree = StyleTree::default();
    }

    /// Current page scroll offset.
    #[must_use]
    pub fn scroll_offset(&self) -> Point {
        self.scroll
    }

    fn rebuild_styles(&mut self) {
        self.style_engine.clear_author_styles();
        self.style_engine.add_document_styles(&self.doc);
    }

    fn style_clean(&self) -> bool {
        self.style_tree.revision() == self.doc.revision() && !self.doc.any_dirty(DirtyFlags::STYLE)
    }

    fn layout_clean(&self) -> bool {
        self.layout.revision() == self.doc.revision()
            && !self.doc.any_dirty(DirtyFlags::LAYOUT | DirtyFlags::TEXT)
    }

    /// Recomputes styles and layout if anything is dirty.
    fn update(&mut self) {
        if self.style_clean() && self.layout_clean() {
            return;
        }
        self.style_tree = self.style_engine.compute(&self.doc);
        self.layout = self
            .layout_engine
            .layout(&self.doc, &self.style_tree, self.viewport);
        self.doc.clear_dirty_all(
            DirtyFlags::STYLE | DirtyFlags::LAYOUT | DirtyFlags::TEXT | DirtyFlags::PAINT,
        );
    }

    fn perform_navigation(&mut self) -> Result<()> {
        let Some(url) = self.pending_navigation.take() else {
            return Ok(());
        };
        let Some(loader) = self.loader.as_mut() else {
            return Err(Error::unsupported(format!(
                "navigation to {url} requires a loader"
            )));
        };
        let loaded = loader(&url)?;
        tracing::info!(url = %loaded.url, "navigated");
        self.doc = ve_html::parse_document(&loaded.html).document;
        self.url = Some(loaded.url);
        self.scroll = Point::ZERO;
        self.element_scroll.clear();
        self.event_loop = EventLoop::new();
        self.style_engine.interaction = ve_style::InteractionState::new();
        self.style_tree = StyleTree::default();
        self.rebuild_styles();
        Ok(())
    }

    fn element_named(&self, id: NodeId, name: &str) -> bool {
        self.doc.element(id).is_some_and(|e| e.is_html(name))
    }

    fn input_type(&self, id: NodeId) -> Option<String> {
        let e = self.doc.element(id)?;
        e.is_html("input").then(|| {
            e.attr("type")
                .map_or_else(|| "text".to_owned(), str::to_ascii_lowercase)
        })
    }

    fn is_focusable(&self, id: NodeId) -> bool {
        let Some(e) = self.doc.element(id) else {
            return false;
        };
        if e.has_attr("disabled") {
            return false;
        }
        e.has_attr("tabindex")
            || matches!(
                e.name.as_str(),
                "input" | "button" | "select" | "textarea" | "summary"
            )
            || (e.is_html("a") && e.has_attr("href"))
            || e.attr("contenteditable")
                .is_some_and(|v| !v.eq_ignore_ascii_case("false"))
    }

    fn focus(&mut self, id: Option<NodeId>) {
        self.style_engine.interaction.set_focus(id, true);
        if let Some(id) = id {
            self.doc.mark_dirty(id, DirtyFlags::STYLE);
        }
    }

    fn focusable_elements(&self) -> Vec<NodeId> {
        self.doc
            .elements()
            .filter(|&id| self.is_focusable(id) && self.style_tree.is_displayed(id))
            .collect()
    }

    fn is_text_control(&self, id: NodeId) -> bool {
        match self.input_type(id) {
            Some(t) => !matches!(
                t.as_str(),
                "checkbox" | "radio" | "button" | "submit" | "reset" | "hidden" | "image" | "file"
            ),
            None => {
                self.element_named(id, "textarea")
                    || self
                        .doc
                        .attribute(id, "contenteditable")
                        .is_some_and(|v| !v.eq_ignore_ascii_case("false"))
            }
        }
    }

    fn queue_interaction(&mut self, id: NodeId, event: &'static str) {
        tracing::debug!(%id, event, "dispatch");
        // Listener dispatch arrives with DOM bindings; the task keeps the
        // event-loop accounting honest so readiness reflects the interaction.
        self.event_loop
            .queue_task(TaskSource::UserInteraction, |_| {});
    }

    fn activate(&mut self, id: NodeId) -> Result<()> {
        let element = self.doc.try_element(id)?.clone();
        match element.name.as_str() {
            "input" => match self.input_type(id).as_deref() {
                Some("checkbox") => {
                    let now = !self.doc.is_checked(id);
                    self.doc.set_checked(id, now)?;
                }
                Some("radio") => {
                    let group = element.attr("name").map(str::to_owned);
                    let form = self
                        .doc
                        .ancestors(id)
                        .find(|&a| self.element_named(a, "form"));
                    let peers: Vec<NodeId> = self
                        .doc
                        .elements()
                        .filter(|&o| {
                            o != id
                                && self.input_type(o).as_deref() == Some("radio")
                                && group.is_some()
                                && self.doc.attribute(o, "name").map(str::to_owned) == group
                                && self
                                    .doc
                                    .ancestors(o)
                                    .find(|&a| self.element_named(a, "form"))
                                    == form
                        })
                        .collect();
                    for peer in peers {
                        self.doc.set_checked(peer, false)?;
                    }
                    self.doc.set_checked(id, true)?;
                }
                _ => {}
            },
            "a" | "area" => {
                if let Some(href) = element.attr("href")
                    && !href.starts_with('#')
                    && !href.starts_with("javascript:")
                {
                    self.navigate(href)?;
                }
            }
            "summary" => {
                if let Some(details) = self
                    .doc
                    .parent(id)
                    .filter(|&p| self.element_named(p, "details"))
                {
                    if self.doc.attribute(details, "open").is_some() {
                        self.doc.remove_attribute(details, "open")?;
                    } else {
                        self.doc.set_attribute(details, "open", "")?;
                    }
                }
            }
            "option" => {
                if let Some(select) = self
                    .doc
                    .ancestors(id)
                    .find(|&a| self.element_named(a, "select"))
                {
                    self.select_option(select, id)?;
                }
            }
            "label" => {
                let control = element
                    .attr("for")
                    .and_then(|f| self.doc.element_by_id(f))
                    .or_else(|| {
                        self.doc
                            .descendants(id)
                            .find(|&d| self.is_focusable(d) && !self.element_named(d, "label"))
                    });
                if let Some(control) = control {
                    return self.click(control);
                }
            }
            _ => {}
        }
        Ok(())
    }

    fn select_option(&mut self, select: NodeId, option: NodeId) -> Result<()> {
        let multiple = self.doc.attribute(select, "multiple").is_some();
        let options: Vec<NodeId> = self
            .doc
            .descendants(select)
            .filter(|&d| self.element_named(d, "option"))
            .collect();
        for o in options {
            if o == option {
                self.doc.set_selected(o, true)?;
            } else if !multiple {
                self.doc.set_selected(o, false)?;
            }
        }
        self.queue_interaction(select, "change");
        Ok(())
    }

    fn scroll_container_of(&self, id: NodeId) -> Option<NodeId> {
        std::iter::once(id)
            .chain(self.doc.ancestors(id))
            .find(|&a| {
                self.style_tree
                    .get(a)
                    .is_some_and(|s| s.overflow.is_scrollable())
            })
    }

    fn a11y_tree(&self) -> AccessibilityTree {
        let layout = &self.layout;
        let bounds = move |id: NodeId| layout.rect_of(id);
        AccessibilityTree::build(
            &self.doc,
            &BuildOptions {
                styles: Some(&self.style_tree),
                bounds: Some(&bounds),
                focused: self.style_engine.interaction.focused(),
            },
        )
    }

    /// Text of `id` and its *rendered* descendants (display:none subtrees,
    /// scripts and styles excluded), whitespace normalised.
    fn visible_text(&self, id: NodeId) -> String {
        fn walk(page: &DomPage, id: NodeId, out: &mut String) {
            for child in page.doc.children(id) {
                match page.doc.get(child).map(|n| &n.kind) {
                    Some(NodeKind::Text(t)) => {
                        out.push(' ');
                        out.push_str(t);
                    }
                    Some(NodeKind::Element(e)) => {
                        if matches!(
                            e.name.as_str(),
                            "script" | "style" | "template" | "noscript"
                        ) || !page.style_tree.is_displayed(child)
                        {
                            continue;
                        }
                        walk(page, child, out);
                    }
                    _ => {}
                }
            }
        }
        let mut out = String::new();
        if let Some(t) = self.doc.get(id).and_then(ve_dom::Node::as_text) {
            out.push_str(t);
        }
        walk(self, id, &mut out);
        out.split_whitespace().collect::<Vec<_>>().join(" ")
    }
}

impl Page for DomPage {
    fn document(&self) -> &Document {
        &self.doc
    }

    fn style_tree(&self) -> &StyleTree {
        &self.style_tree
    }

    fn layout_tree(&self) -> &LayoutTree {
        &self.layout
    }

    fn url(&self) -> Option<&str> {
        self.url.as_deref()
    }

    fn readiness(&self) -> Readiness {
        Readiness {
            revision: self.doc.revision(),
            event_loop_quiescent: self.event_loop.is_quiescent() && !self.vm.has_pending_jobs(),
            pending_tasks: self.event_loop.pending_tasks() + self.event_loop.pending_microtasks(),
            pending_async: self.event_loop.pending_async(),
            style_clean: self.style_clean(),
            layout_clean: self.layout_clean(),
            navigation_pending: self.pending_navigation.is_some(),
        }
    }

    fn settle(&mut self, max_tasks: usize) -> Readiness {
        let span = Stage::Agent.span();
        let _guard = span.enter();
        let mut budget = max_tasks;
        for _ in 0..8 {
            if self.pending_navigation.is_some()
                && let Err(e) = self.perform_navigation()
            {
                tracing::warn!(error = %e, "navigation failed");
                self.last_error = Some(e.to_string());
            }
            let report = self.event_loop.run_until_quiescent(budget);
            budget = budget.saturating_sub(report.tasks_run);
            if let Err(e) = self.vm.run_pending_jobs() {
                tracing::warn!(error = %e, "promise job failed");
            }
            self.update();
            let readiness = self.readiness();
            if readiness.is_ready() || budget == 0 {
                return readiness;
            }
        }
        self.readiness()
    }

    fn advance_time(&mut self, by: Duration) {
        self.event_loop.advance(by);
    }

    fn navigate(&mut self, url: &str) -> Result<()> {
        let resolved = match self
            .url
            .as_deref()
            .and_then(|base| url::Url::parse(base).ok())
        {
            Some(base) => base
                .join(url)
                .map(|u| u.to_string())
                .map_err(|e| Error::parse("url", e.to_string()))?,
            None => url::Url::parse(url)
                .map(|u| u.to_string())
                .map_err(|e| Error::parse("url", e.to_string()))?,
        };
        self.pending_navigation = Some(resolved);
        Ok(())
    }

    fn resolve(&self, target: &Target) -> Result<Vec<NodeId>> {
        let found = match target {
            Target::Selector { selector } => self.style_engine.select(&self.doc, selector)?,
            Target::Ref { reference } => {
                let id = Target::parse_reference(reference)
                    .ok_or_else(|| Error::parse("ref", reference.clone()))?;
                match self.doc.get(id) {
                    Some(node) if node.is_element() => vec![id],
                    Some(_) => self.doc.parent(id).into_iter().collect(),
                    None => return Err(Error::InvalidNodeId(id)),
                }
            }
            Target::Text { text } => {
                let wanted = text.split_whitespace().collect::<Vec<_>>().join(" ");
                let candidates: Vec<NodeId> = self
                    .doc
                    .elements()
                    .filter(|&id| {
                        self.style_tree.is_displayed(id)
                            && !self.element_named(id, "script")
                            && !self.element_named(id, "style")
                    })
                    .collect();
                let exact: Vec<NodeId> = candidates
                    .iter()
                    .copied()
                    .filter(|&id| self.visible_text(id) == wanted)
                    .collect();
                // Prefer the innermost exact matches (drop ancestors of other matches).
                let innermost: Vec<NodeId> = exact
                    .iter()
                    .copied()
                    .filter(|&id| {
                        !exact
                            .iter()
                            .any(|&o| o != id && self.doc.is_ancestor_of(id, o))
                    })
                    .collect();
                if !innermost.is_empty() {
                    innermost
                } else {
                    let partial: Vec<NodeId> = candidates
                        .into_iter()
                        .filter(|&id| self.visible_text(id).contains(&wanted))
                        .collect();
                    partial
                        .iter()
                        .copied()
                        .filter(|&id| {
                            !partial
                                .iter()
                                .any(|&o| o != id && self.doc.is_ancestor_of(id, o))
                        })
                        .collect()
                }
            }
            Target::Role { role, name } => {
                let wanted =
                    Role::from_aria(role).ok_or_else(|| Error::parse("role", role.clone()))?;
                self.a11y_tree()
                    .iter()
                    .filter(|n| {
                        n.role == wanted
                            && name.as_ref().is_none_or(|w| n.name.eq_ignore_ascii_case(w))
                    })
                    .map(|n| n.id)
                    .collect()
            }
            Target::Label { label } => {
                let wanted = label.split_whitespace().collect::<Vec<_>>().join(" ");
                self.doc
                    .elements()
                    .filter(|&id| {
                        matches!(
                            self.doc.element(id).map(|e| e.name.as_str()),
                            Some("input" | "select" | "textarea" | "button")
                        )
                    })
                    .filter(|&id| compute_name(&self.doc, id).eq_ignore_ascii_case(&wanted))
                    .collect()
            }
        };
        if found.is_empty() {
            return Err(Error::NoMatch(target.to_string()));
        }
        Ok(found)
    }

    fn click(&mut self, id: NodeId) -> Result<()> {
        self.doc.try_element(id)?;
        if self.doc.attribute(id, "disabled").is_some() {
            return Err(Error::InvalidState(format!("{id} is disabled")));
        }
        if self.is_focusable(id) {
            self.focus(Some(id));
        }
        self.queue_interaction(id, "click");
        self.activate(id)
    }

    fn fill(&mut self, id: NodeId, value: &str) -> Result<()> {
        self.doc.try_element(id)?;
        if self.element_named(id, "select") {
            return self.select(id, value);
        }
        if !self.is_text_control(id) {
            return Err(Error::InvalidState(format!("{id} is not a text control")));
        }
        if self.doc.attribute(id, "disabled").is_some()
            || self.doc.attribute(id, "readonly").is_some()
        {
            return Err(Error::InvalidState(format!(
                "{id} is disabled or read-only"
            )));
        }
        self.focus(Some(id));
        if self.doc.attribute(id, "contenteditable").is_some()
            && !self.element_named(id, "textarea")
            && self.input_type(id).is_none()
        {
            let kids: Vec<NodeId> = self.doc.children(id).collect();
            for kid in kids {
                self.doc.destroy(kid)?;
            }
            self.doc.append_text(id, value)?;
        } else {
            self.doc.set_form_value(id, value)?;
        }
        self.queue_interaction(id, "input");
        Ok(())
    }

    fn select(&mut self, id: NodeId, value: &str) -> Result<()> {
        let select = if self.element_named(id, "option") {
            self.doc
                .ancestors(id)
                .find(|&a| self.element_named(a, "select"))
                .ok_or_else(|| Error::InvalidState(format!("{id} is not inside a select")))?
        } else if self.element_named(id, "select") {
            id
        } else {
            return Err(Error::InvalidState(format!("{id} is not a select")));
        };
        let options: Vec<NodeId> = self
            .doc
            .descendants(select)
            .filter(|&d| self.element_named(d, "option"))
            .collect();
        let wanted = value.trim();
        let chosen = options
            .iter()
            .copied()
            .find(|&o| self.doc.attribute(o, "value").is_some_and(|v| v == wanted))
            .or_else(|| {
                options
                    .iter()
                    .copied()
                    .find(|&o| self.visible_text(o).eq_ignore_ascii_case(wanted))
            })
            .or_else(|| {
                options.iter().copied().find(|&o| {
                    self.doc
                        .attribute(o, "label")
                        .is_some_and(|l| l.eq_ignore_ascii_case(wanted))
                })
            })
            .ok_or_else(|| Error::NoMatch(format!("option {wanted:?} in {select}")))?;
        self.focus(Some(select));
        self.select_option(select, chosen)
    }

    fn press(&mut self, target: Option<NodeId>, key: &str) -> Result<()> {
        if let Some(id) = target {
            self.doc.try_element(id)?;
            self.focus(Some(id));
        }
        let focused = self.style_engine.interaction.focused();
        match key {
            "Tab" | "Shift+Tab" => {
                let order = self.focusable_elements();
                let next = match (
                    focused.and_then(|f| order.iter().position(|&o| o == f)),
                    key,
                ) {
                    (Some(i), "Tab") => order.get(i + 1).copied(),
                    (Some(i), _) => i.checked_sub(1).and_then(|j| order.get(j).copied()),
                    (None, "Tab") => order.first().copied(),
                    (None, _) => order.last().copied(),
                };
                self.focus(next);
            }
            "Escape" => self.focus(None),
            "Enter" => {
                if let Some(id) = focused {
                    if self.is_text_control(id) && !self.element_named(id, "textarea") {
                        // Implicit form submission: fire on the form's default button if any.
                        let submit = self
                            .doc
                            .ancestors(id)
                            .find(|&a| self.element_named(a, "form"))
                            .and_then(|form| {
                                self.doc.descendants(form).find(|&d| {
                                    self.element_named(d, "button")
                                        && !self
                                            .doc
                                            .attribute(d, "type")
                                            .is_some_and(|t| t.eq_ignore_ascii_case("button"))
                                        || self.input_type(d).as_deref() == Some("submit")
                                })
                            });
                        self.queue_interaction(id, "keydown:Enter");
                        if let Some(button) = submit {
                            return self.click(button);
                        }
                    } else {
                        return self.click(id);
                    }
                }
            }
            " " | "Space" => {
                if let Some(id) = focused
                    && (matches!(self.input_type(id).as_deref(), Some("checkbox" | "radio"))
                        || self.element_named(id, "button"))
                {
                    return self.click(id);
                }
                if let Some(id) = focused
                    && self.is_text_control(id)
                {
                    let current = self.doc.form_value(id).unwrap_or_default();
                    self.doc.set_form_value(id, format!("{current} "))?;
                }
            }
            "Backspace" => {
                if let Some(id) = focused
                    && self.is_text_control(id)
                {
                    let mut current = self.doc.form_value(id).unwrap_or_default();
                    current.pop();
                    self.doc.set_form_value(id, current)?;
                }
            }
            other if other.chars().count() == 1 => {
                if let Some(id) = focused
                    && self.is_text_control(id)
                {
                    let current = self.doc.form_value(id).unwrap_or_default();
                    self.doc.set_form_value(id, format!("{current}{other}"))?;
                }
            }
            other => return Err(Error::unsupported(format!("key {other:?}"))),
        }
        if let Some(id) = focused {
            self.queue_interaction(id, "keydown");
        }
        Ok(())
    }

    fn scroll(&mut self, target: Option<NodeId>, dx: f32, dy: f32) -> Result<ScrollState> {
        match target.and_then(|t| self.scroll_container_of(t)) {
            Some(container) => {
                let outer = self.layout.rect_of(container).unwrap_or(Rect::ZERO);
                let content_bottom = self
                    .doc
                    .descendants(container)
                    .filter_map(|d| self.layout.rect_of(d))
                    .map(|r| r.bottom())
                    .fold(outer.bottom(), f32::max);
                let content_right = self
                    .doc
                    .descendants(container)
                    .filter_map(|d| self.layout.rect_of(d))
                    .map(|r| r.right())
                    .fold(outer.right(), f32::max);
                let max = Point::new(
                    (content_right - outer.right()).max(0.0),
                    (content_bottom - outer.bottom()).max(0.0),
                );
                let cur = self.element_scroll.entry(container).or_default();
                *cur = Point::new(
                    (cur.x + dx).clamp(0.0, max.x),
                    (cur.y + dy).clamp(0.0, max.y),
                );
                let state = ScrollState {
                    x: cur.x,
                    y: cur.y,
                    max_x: max.x,
                    max_y: max.y,
                };
                self.queue_interaction(container, "scroll");
                Ok(state)
            }
            None => {
                let max_y = (self.layout.content_height() - self.viewport.height).max(0.0);
                let max_x = (self.layout.root.rect.right() - self.viewport.width).max(0.0);
                self.scroll = Point::new(
                    (self.scroll.x + dx).clamp(0.0, max_x),
                    (self.scroll.y + dy).clamp(0.0, max_y),
                );
                if let Some(root) = self.doc.document_element() {
                    self.queue_interaction(root, "scroll");
                }
                Ok(ScrollState {
                    x: self.scroll.x,
                    y: self.scroll.y,
                    max_x,
                    max_y,
                })
            }
        }
    }

    fn snapshot(&self, format: SnapshotFormat) -> SemanticSnapshot {
        let snapshot = SemanticSnapshot::capture(&self.a11y_tree(), format);
        match &self.url {
            Some(url) => snapshot.with_url(url.clone()),
            None => snapshot,
        }
    }

    fn snapshot_of(&self, id: NodeId, format: SnapshotFormat) -> Option<SemanticSnapshot> {
        let tree = self.a11y_tree();
        let node = tree.find(id)?.clone();
        Some(SemanticSnapshot::capture(
            &AccessibilityTree {
                root: node,
                revision: tree.revision,
            },
            format,
        ))
    }

    fn focused(&self) -> Option<NodeId> {
        self.style_engine.interaction.focused()
    }

    fn take_last_error(&mut self) -> Option<String> {
        self.last_error.take()
    }
}

/// Serialises an element (or the document) back to HTML.
#[must_use]
pub fn outer_html(doc: &Document, id: NodeId) -> String {
    const VOID: &[&str] = &[
        "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source",
        "track", "wbr",
    ];
    fn escape(text: &str, attr: bool) -> String {
        let mut out = String::with_capacity(text.len());
        for c in text.chars() {
            match c {
                '&' => out.push_str("&amp;"),
                '<' if !attr => out.push_str("&lt;"),
                '>' if !attr => out.push_str("&gt;"),
                '"' if attr => out.push_str("&quot;"),
                '\u{a0}' => out.push_str("&nbsp;"),
                c => out.push(c),
            }
        }
        out
    }
    fn write(doc: &Document, id: NodeId, out: &mut String) {
        let Some(node) = doc.get(id) else { return };
        match &node.kind {
            NodeKind::Document | NodeKind::DocumentFragment | NodeKind::ShadowRoot { .. } => {
                for c in doc.children(id) {
                    write(doc, c, out);
                }
            }
            NodeKind::Doctype { name, .. } => {
                out.push_str("<!DOCTYPE ");
                out.push_str(name);
                out.push('>');
            }
            NodeKind::Element(e) => {
                out.push('<');
                out.push_str(&e.name);
                for a in &e.attributes {
                    out.push(' ');
                    out.push_str(&a.name);
                    out.push_str("=\"");
                    out.push_str(&escape(&a.value, true));
                    out.push('"');
                }
                out.push('>');
                if e.namespace == ve_dom::Namespace::Html && VOID.contains(&e.name.as_str()) {
                    return;
                }
                let raw = e.namespace == ve_dom::Namespace::Html
                    && matches!(e.name.as_str(), "script" | "style");
                for c in doc.children(id) {
                    if raw && let Some(t) = doc.get(c).and_then(ve_dom::Node::as_text) {
                        out.push_str(t);
                    } else {
                        write(doc, c, out);
                    }
                }
                out.push_str("</");
                out.push_str(&e.name);
                out.push('>');
            }
            NodeKind::Text(t) => out.push_str(&escape(t, false)),
            NodeKind::Comment(c) => {
                out.push_str("<!--");
                out.push_str(c);
                out.push_str("-->");
            }
            NodeKind::ProcessingInstruction { target, data } => {
                out.push_str("<?");
                out.push_str(target);
                out.push(' ');
                out.push_str(data);
                out.push('>');
            }
        }
    }
    let mut out = String::new();
    write(doc, id, &mut out);
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    const HTML: &str = r#"<title>Form</title><body>
        <label for=e>Email</label><input id=e>
        <input type=checkbox id=c><label for=c>Agree</label>
        <select id=s><option value=a>Alpha<option value=b>Beta</select>
        <details id=d><summary>More</summary><p>Hidden body</p></details>
        <a id=l href="/next">Next page</a><button id=b disabled>Nope</button>
        <p id=p>Some <b>bold</b> text</p></body>"#;

    #[test]
    fn interactions_update_the_dom_and_readiness() {
        let mut page = DomPage::from_html(HTML, Some("https://example.test/start"));
        assert!(
            page.readiness().is_ready(),
            "{:?}",
            page.readiness().blockers()
        );

        let email = page
            .resolve(&Target::Label {
                label: "Email".into(),
            })
            .unwrap()[0];
        page.fill(email, "a@b.c").unwrap();
        assert!(!page.readiness().is_ready(), "interaction queued a task");
        assert!(page.settle(100).is_ready());
        assert_eq!(page.document().form_value(email).as_deref(), Some("a@b.c"));
        assert_eq!(page.focused(), Some(email));

        let agree = page
            .resolve(&Target::Text {
                text: "Agree".into(),
            })
            .unwrap()[0];
        page.click(agree).unwrap(); // label -> checkbox
        let checkbox = page.document().element_by_id("c").unwrap();
        assert!(page.document().is_checked(checkbox));
        page.press(None, " ").unwrap();
        assert!(
            !page.document().is_checked(checkbox),
            "space toggles the focused checkbox"
        );

        let select = page.resolve(&Target::selector("#s")).unwrap()[0];
        page.select(select, "Beta").unwrap();
        let beta = page.resolve(&Target::selector("option[value=b]")).unwrap()[0];
        assert!(page.document().is_selected(beta));
        page.settle(100);
        assert!(
            page.snapshot(SnapshotFormat::Compact)
                .to_text()
                .contains("value=\"Beta\"")
        );

        let summary = page.resolve(&Target::role("button", Some("More"))).unwrap()[0];
        assert!(
            page.resolve(&Target::Text {
                text: "Hidden body".into()
            })
            .is_err(),
            "closed details content is not rendered"
        );
        page.click(summary).unwrap();
        page.settle(100);
        assert!(
            page.resolve(&Target::Text {
                text: "Hidden body".into()
            })
            .is_ok()
        );

        let button = page.resolve(&Target::selector("#b")).unwrap()[0];
        assert!(matches!(page.click(button), Err(Error::InvalidState(_))));
        let bold = page
            .resolve(&Target::Text {
                text: "bold".into(),
            })
            .unwrap();
        assert!(
            page.document().element(bold[0]).unwrap().is_html("b"),
            "innermost text match"
        );
        assert_eq!(outer_html(page.document(), bold[0]), "<b>bold</b>");
        assert!(
            page.resolve(&Target::Ref {
                reference: "n9999.0".into()
            })
            .is_err()
        );
    }

    #[test]
    fn navigation_uses_the_loader_and_resets_state() {
        let mut page = DomPage::from_html(HTML, Some("https://example.test/start")).with_loader(
            Box::new(|url: &str| {
                Ok(LoadedDocument {
                    url: url.to_owned(),
                    html: format!("<title>Loaded</title><h1>{url}</h1>"),
                })
            }),
        );
        let link = page.resolve(&Target::selector("#l")).unwrap()[0];
        page.click(link).unwrap();
        assert!(page.readiness().navigation_pending);
        let readiness = page.settle(100);
        assert!(readiness.is_ready());
        assert_eq!(page.url(), Some("https://example.test/next"));
        assert_eq!(page.document().title().as_deref(), Some("Loaded"));
        assert!(page.focused().is_none());
        assert!(page.resolve(&Target::role("heading", None)).is_ok());

        let mut offline = DomPage::from_html("<p>x</p>", None);
        offline.navigate("https://nowhere.test/").unwrap();
        assert!(offline.readiness().navigation_pending);
        assert!(
            offline.settle(10).is_ready(),
            "a failed navigation leaves the old document in place"
        );
        assert!(
            offline
                .take_last_error()
                .is_some_and(|e| e.contains("loader"))
        );
        assert!(
            offline.take_last_error().is_none(),
            "errors are reported once"
        );
        assert!(offline.navigate("not a url").is_err());
    }
}
