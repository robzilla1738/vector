//! [`Page`]: one document with its style/layout state, history, scroll and
//! focus, the in-engine action semantics of architecture §6, `settle()`, and
//! `observe()`.

use std::collections::{HashMap, VecDeque};
use std::time::Instant;

use serde::{Deserialize, Serialize};
use ve_a11y::{
    DialogEntry, Format, LabelIndex, ObservationContent, ObservationDelta, ObservationRequest,
    ObserveInput, Role, Scope, Visibility5, changes_between, compute_name_with, observe, parse_ref,
    ref_for,
};
use ve_core::{Error, ErrorCode, NodeId, Point, Rect, Result, Size, Stage};
use ve_dom::{DirtyFlags, Document, NodeKind};
use ve_gfx::SoftwareRenderer;
use ve_html::DocumentMeta;
use ve_layout::{LayoutEngine, LayoutTree};
use ve_style::{StyleEngine, StyleTree};

use crate::forms::{self, Enctype, FormMethod};
use crate::keys::{Chord, Key};
use crate::routing::{RoutingInfo, classify};
use crate::screenshot::{self, Screenshot};
use crate::steps::{MouseButton, ScrollDirection, Settled};
use crate::target::TargetSpec;

/// Navigation method.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum NavMethod {
    /// GET.
    Get,
    /// POST.
    Post,
}

/// What the page asks its [`Loader`] to fetch.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct NavigationRequest {
    /// Absolute URL.
    pub url: String,
    /// Method.
    pub method: NavMethod,
    /// Body (POST).
    pub body: Option<Vec<u8>>,
    /// `Content-Type` of the body.
    pub content_type: Option<String>,
    /// Referrer (the current document URL).
    pub referrer: Option<String>,
    /// Page id for attribution.
    pub page: u64,
}

impl NavigationRequest {
    /// A GET navigation.
    #[must_use]
    pub fn get(url: impl Into<String>, page: u64) -> Self {
        Self {
            url: url.into(),
            method: NavMethod::Get,
            body: None,
            content_type: None,
            referrer: None,
            page,
        }
    }
}

/// A fetched document (bytes; decoding happens in the page).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct LoadedDocument {
    /// Final URL after redirects.
    pub url: String,
    /// Raw bytes.
    pub bytes: Vec<u8>,
    /// `Content-Type` header.
    pub content_type: Option<String>,
    /// HTTP status (200 for non-HTTP sources).
    pub status: u16,
}

impl LoadedDocument {
    /// Wraps already-decoded HTML.
    pub fn html(url: impl Into<String>, html: &str) -> Self {
        Self {
            url: url.into(),
            bytes: html.as_bytes().to_vec(),
            content_type: Some("text/html; charset=utf-8".into()),
            status: 200,
        }
    }
}

/// A request still in flight, as seen by `settle()`.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct InFlightSummary {
    /// URL.
    pub url: String,
    /// Age in milliseconds.
    pub age_ms: u64,
    /// Background requests never block.
    pub background: bool,
}

/// Fetches documents for navigations and answers network questions for the
/// page. Supplied by the embedder (`ve-api` backs it with `ve-net`).
pub trait Loader {
    /// Performs a navigation fetch.
    fn load(&mut self, request: &NavigationRequest) -> Result<LoadedDocument>;
    /// Requests currently in flight for `page`.
    fn in_flight(&self, _page: u64) -> Vec<InFlightSummary> {
        Vec::new()
    }
    /// Completed responses for `page`, oldest first.
    fn completed(&self, _page: u64) -> Vec<ve_net::CompletedResponse> {
        Vec::new()
    }
}

/// A [`Loader`] from a closure (tests, recorded fixtures).
pub struct FnLoader<F>(pub F);

impl<F: FnMut(&NavigationRequest) -> Result<LoadedDocument>> Loader for FnLoader<F> {
    fn load(&mut self, request: &NavigationRequest) -> Result<LoadedDocument> {
        (self.0)(request)
    }
}

#[derive(Clone, Debug)]
struct HistoryEntry {
    document: LoadedDocument,
    scroll: Point,
}

#[derive(Clone, Debug)]
struct CachedObservation {
    revision: u64,
    generation: u32,
    scope: Scope,
    format: Format,
    subtree_ref: Option<String>,
    content: ObservationContent,
}

/// An observation together with the engine-side envelope fields the runtime
/// stamps onto `Observation`.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EngineObservation {
    /// `ObservationContent`.
    pub content: ObservationContent,
    /// Document revision.
    pub revision: u64,
    /// Document epoch (`generation`).
    pub document_epoch: u64,
    /// `changesSince` lines (when `sinceRevision` matched a cached observation).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub changes_since: Option<Vec<String>>,
    /// Full-format structured delta.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub delta: Option<ObservationDelta>,
    /// The settle that preceded the observation.
    pub settled: Settled,
}

/// Default viewport.
pub const DEFAULT_VIEWPORT: Size = Size {
    width: 1280.0,
    height: 720.0,
};

/// Budget for `settle()` after an ordinary step.
pub const SETTLE_STEP_MS: u64 = 500;
/// Budget for `settle()` after a navigation.
pub const SETTLE_NAVIGATION_MS: u64 = 2000;
/// In-flight requests younger than this block `settle()`.
pub const FETCH_BLOCKING_AGE_MS: u64 = 2000;
/// Default actionability timeout.
pub const DEFAULT_TIMEOUT_MS: u64 = 5000;

/// A live page.
pub struct Page {
    id: u64,
    generation: u32,
    doc: Document,
    url: String,
    base_url: Option<url::Url>,
    meta: DocumentMeta,
    routing: RoutingInfo,
    content_type: Option<String>,
    status: u16,
    history: Vec<HistoryEntry>,
    history_index: usize,
    style_engine: StyleEngine,
    style_tree: StyleTree,
    layout_engine: LayoutEngine,
    layout: LayoutTree,
    viewport: Size,
    scale: f32,
    scroll: Point,
    element_scroll: HashMap<NodeId, Point>,
    files: HashMap<NodeId, Vec<String>>,
    focused: Option<NodeId>,
    loader: Option<Box<dyn Loader>>,
    pending_navigation: Option<NavigationRequest>,
    refreshes_followed: u8,
    observations: VecDeque<CachedObservation>,
    renderer: Option<SoftwareRenderer>,
    last_screenshot: Option<Screenshot>,
    last_navigation_error: Option<String>,
    virtual_time_ms: u64,
    cancelled: bool,
}

impl std::fmt::Debug for Page {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Page")
            .field("id", &self.id)
            .field("url", &self.url)
            .field("generation", &self.generation)
            .field("nodes", &self.doc.node_count())
            .field("revision", &self.doc.revision())
            .finish_non_exhaustive()
    }
}

fn normalize(text: &str) -> String {
    text.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn unix_millis() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::SystemTime::UNIX_EPOCH)
        .map_or(0, |d| u64::try_from(d.as_millis()).unwrap_or(u64::MAX))
}

impl Page {
    // ---------------------------------------------------------------------
    // Construction and loading
    // ---------------------------------------------------------------------

    /// A page from inline HTML.
    #[must_use]
    pub fn from_html(id: u64, html: &str, url: Option<&str>, viewport: Size) -> Self {
        let mut page = Self::empty(id, viewport);
        page.load(
            LoadedDocument::html(url.unwrap_or("about:blank"), html),
            HistoryMode::Push,
        );
        page
    }

    /// A page from a fetched document.
    #[must_use]
    pub fn from_loaded(id: u64, loaded: LoadedDocument, viewport: Size) -> Self {
        let mut page = Self::empty(id, viewport);
        page.load(loaded, HistoryMode::Push);
        page
    }

    /// Opens `url` through `loader` (the real pipeline: fetch → decode →
    /// streaming parse → cascade → layout).
    pub fn open(id: u64, mut loader: Box<dyn Loader>, url: &str, viewport: Size) -> Result<Self> {
        let parsed =
            url::Url::parse(url).map_err(|e| Error::invalid_params(format!("url {url:?}: {e}")))?;
        let loaded = loader.load(&NavigationRequest::get(parsed.to_string(), id))?;
        let mut page = Self::empty(id, viewport);
        page.loader = Some(loader);
        page.load(loaded, HistoryMode::Push);
        Ok(page)
    }

    fn empty(id: u64, viewport: Size) -> Self {
        let mut style_engine = StyleEngine::new();
        style_engine.media = ve_style::MediaEnv::screen(viewport.width, viewport.height);
        let doc = Document::new();
        let style_tree = StyleTree::default();
        let layout = LayoutEngine::new().layout(&doc, &style_tree, viewport);
        Self {
            id,
            generation: 0,
            doc,
            url: "about:blank".into(),
            base_url: None,
            meta: DocumentMeta::default(),
            routing: RoutingInfo::static_page(0, 0),
            content_type: None,
            status: 200,
            history: Vec::new(),
            history_index: 0,
            style_engine,
            style_tree,
            layout_engine: LayoutEngine::new(),
            layout,
            viewport,
            scale: 1.0,
            scroll: Point::ZERO,
            element_scroll: HashMap::new(),
            files: HashMap::new(),
            focused: None,
            loader: None,
            pending_navigation: None,
            refreshes_followed: 0,
            observations: VecDeque::new(),
            renderer: None,
            last_screenshot: None,
            last_navigation_error: None,
            virtual_time_ms: 0,
            cancelled: false,
        }
    }

    /// Installs the loader used for navigations.
    #[must_use]
    pub fn with_loader(mut self, loader: Box<dyn Loader>) -> Self {
        self.loader = Some(loader);
        self
    }

    /// Replaces the loader.
    pub fn set_loader(&mut self, loader: Box<dyn Loader>) {
        self.loader = Some(loader);
    }

    /// Sets the device pixel ratio used for screenshots and `viewport.scale`.
    pub fn set_scale(&mut self, scale: f32) {
        self.scale = scale;
    }

    fn load(&mut self, loaded: LoadedDocument, mode: HistoryMode) {
        let span = Stage::Parse.span();
        let _guard = span.enter();
        let charset = loaded.content_type.as_deref().and_then(|ct| {
            ct.split(';').skip(1).find_map(|p| {
                let (k, v) = p.trim().split_once('=')?;
                k.trim()
                    .eq_ignore_ascii_case("charset")
                    .then(|| v.trim().trim_matches('"').to_owned())
            })
        });
        let (outcome, _decoded) =
            ve_html::parse_document_bytes(&loaded.bytes, charset.as_deref(), 16 * 1024);
        if self.doc.node_count() > 1 || !self.history.is_empty() {
            self.generation = self.generation.wrapping_add(1);
        }
        self.doc = outcome.document;
        self.url.clone_from(&loaded.url);
        self.meta = ve_html::document_meta(&self.doc);
        let document_url = url::Url::parse(&self.url).ok();
        self.base_url = match (&self.meta.base_href, &document_url) {
            (Some(href), Some(doc_url)) => doc_url.join(href).ok().or(document_url.clone()),
            (Some(href), None) => url::Url::parse(href).ok(),
            (None, _) => document_url,
        };
        self.content_type = loaded.content_type.as_deref().map(|ct| {
            ct.split(';')
                .next()
                .unwrap_or("")
                .trim()
                .to_ascii_lowercase()
        });
        self.status = loaded.status;
        self.routing = classify(&self.doc, self.content_type.as_deref());
        self.scroll = Point::ZERO;
        self.element_scroll.clear();
        self.files.clear();
        self.focused = None;
        self.refreshes_followed = if matches!(mode, HistoryMode::Refresh) {
            self.refreshes_followed + 1
        } else {
            0
        };
        self.style_engine.interaction = ve_style::InteractionState::new();
        self.style_tree = StyleTree::default();
        self.style_engine.clear_author_styles();
        self.style_engine.add_document_styles(&self.doc);
        self.update();
        let entry = HistoryEntry {
            document: loaded,
            scroll: Point::ZERO,
        };
        match mode {
            HistoryMode::Push => {
                if !self.history.is_empty() {
                    self.history.truncate(self.history_index + 1);
                }
                self.history.push(entry);
                self.history_index = self.history.len() - 1;
            }
            // Client redirects (`<meta refresh>`) replace the current entry.
            HistoryMode::Replace | HistoryMode::Refresh => {
                if self.history.is_empty() {
                    self.history.push(entry);
                    self.history_index = 0;
                } else {
                    self.history[self.history_index] = entry;
                }
            }
            HistoryMode::Traverse(index) => {
                self.history_index = index;
            }
        }
        tracing::info!(page = self.id, url = %self.url, generation = self.generation, routing = %self.routing.route_reason, "loaded");
    }

    // ---------------------------------------------------------------------
    // Accessors
    // ---------------------------------------------------------------------

    /// Page id.
    #[must_use]
    pub fn id(&self) -> u64 {
        self.id
    }

    /// Document epoch.
    #[must_use]
    pub fn generation(&self) -> u32 {
        self.generation
    }

    /// The DOM.
    #[must_use]
    pub fn document(&self) -> &Document {
        &self.doc
    }

    /// Mutable DOM access (tests, embedders); the next settle restyles.
    pub fn document_mut(&mut self) -> &mut Document {
        &mut self.doc
    }

    /// Computed styles.
    #[must_use]
    pub fn style_tree(&self) -> &StyleTree {
        &self.style_tree
    }

    /// Layout.
    #[must_use]
    pub fn layout_tree(&self) -> &LayoutTree {
        &self.layout
    }

    /// Document URL.
    #[must_use]
    pub fn url(&self) -> &str {
        &self.url
    }

    /// Document title.
    #[must_use]
    pub fn title(&self) -> String {
        self.doc.title().unwrap_or_default()
    }

    /// Router classification of the current document.
    #[must_use]
    pub fn routing(&self) -> &RoutingInfo {
        &self.routing
    }

    /// Document metadata (`<base>`, `<meta refresh>`, charset).
    #[must_use]
    pub fn meta(&self) -> &DocumentMeta {
        &self.meta
    }

    /// HTTP status of the current document.
    #[must_use]
    pub fn status(&self) -> u16 {
        self.status
    }

    /// Viewport.
    #[must_use]
    pub fn viewport(&self) -> Size {
        self.viewport
    }

    /// Changes the viewport; relayout happens on the next settle.
    pub fn set_viewport(&mut self, viewport: Size) {
        self.viewport = viewport;
        self.style_engine.media.viewport = viewport;
        self.style_tree = StyleTree::default();
    }

    /// Viewport scroll offset.
    #[must_use]
    pub fn scroll_offset(&self) -> Point {
        self.scroll
    }

    /// Focused element.
    #[must_use]
    pub fn focused(&self) -> Option<NodeId> {
        self.focused
    }

    /// History length and current index.
    #[must_use]
    pub fn history(&self) -> (usize, usize) {
        (self.history.len(), self.history_index)
    }

    /// The last screenshot taken by a `screenshot` step.
    #[must_use]
    pub fn last_screenshot(&self) -> Option<&Screenshot> {
        self.last_screenshot.as_ref()
    }

    /// Files set by `upload` on a file input.
    #[must_use]
    pub fn files(&self, id: NodeId) -> Vec<String> {
        self.files.get(&id).cloned().unwrap_or_default()
    }

    /// Cancels the running program (next step fails with `cancelled`).
    pub fn cancel(&mut self) {
        self.cancelled = true;
    }

    pub(crate) fn take_cancelled(&mut self) -> bool {
        std::mem::take(&mut self.cancelled)
    }

    /// Virtual clock (advanced by waits).
    #[must_use]
    pub fn virtual_time_ms(&self) -> u64 {
        self.virtual_time_ms
    }

    pub(crate) fn advance_virtual_time(&mut self, ms: u64) {
        self.virtual_time_ms += ms;
    }

    /// Resolves `href` against the base URL.
    #[must_use]
    pub fn resolve_url(&self, href: &str) -> Option<String> {
        let href = href.trim();
        match &self.base_url {
            Some(base) => base.join(href).ok().map(|u| u.to_string()),
            None => url::Url::parse(href).ok().map(|u| u.to_string()),
        }
    }

    /// The ref string for a node.
    #[must_use]
    pub fn ref_of(&self, id: NodeId) -> String {
        ref_for(id)
    }

    // ---------------------------------------------------------------------
    // Style / layout / settle
    // ---------------------------------------------------------------------

    fn style_clean(&self) -> bool {
        self.style_tree.revision() == self.doc.revision() && !self.doc.any_dirty(DirtyFlags::STYLE)
    }

    fn layout_clean(&self) -> bool {
        self.layout.revision() == self.doc.revision()
            && !self.doc.any_dirty(DirtyFlags::LAYOUT | DirtyFlags::TEXT)
    }

    /// Recomputes styles and layout if anything is dirty.
    pub fn update(&mut self) {
        if self.style_clean() && self.layout_clean() {
            return;
        }
        self.style_engine.interaction.set_focus(self.focused, true);
        self.style_tree = self.style_engine.compute(&self.doc);
        self.layout = self
            .layout_engine
            .layout(&self.doc, &self.style_tree, self.viewport);
        self.doc.clear_dirty_all(
            DirtyFlags::STYLE | DirtyFlags::LAYOUT | DirtyFlags::TEXT | DirtyFlags::PAINT,
        );
    }

    /// Whether a navigation is pending.
    #[must_use]
    pub fn navigation_pending(&self) -> bool {
        self.pending_navigation.is_some()
    }

    /// Takes the last navigation failure message.
    pub fn take_navigation_error(&mut self) -> Option<String> {
        self.last_navigation_error.take()
    }

    fn perform_navigation(&mut self) -> Result<()> {
        let Some(request) = self.pending_navigation.take() else {
            return Ok(());
        };
        let Some(loader) = self.loader.as_mut() else {
            return Err(Error::Network(format!(
                "navigation to {} requires a loader",
                request.url
            )));
        };
        let span = Stage::Fetch.span();
        let _guard = span.enter();
        let loaded = loader.load(&request)?;
        self.load(loaded, HistoryMode::Push);
        Ok(())
    }

    /// `settle()` (architecture §6). In M1 the script conditions are
    /// trivially true; this performs pending navigations, follows immediate
    /// `<meta refresh>`, runs restyle + relayout, and reports in-flight
    /// fetches attributed to the page.
    pub fn settle(&mut self, budget_ms: u64) -> Settled {
        let span = Stage::Agent.span();
        let _guard = span.enter();
        let start = Instant::now();
        let mut reasons = Vec::new();
        for _ in 0..8 {
            if self.pending_navigation.is_some() {
                if let Err(e) = self.perform_navigation() {
                    tracing::warn!(error = %e, "navigation failed");
                    self.last_navigation_error = Some(e.to_string());
                }
            }
            self.update();
            // Immediate meta refresh (delay 0) is part of loading; longer
            // delays are timers beyond the 50 ms window and do not block.
            if let Some(refresh) = self.meta.refresh.clone()
                && refresh.seconds == 0
                && self.refreshes_followed < 3
                && let Some(target) = refresh.url.as_deref().and_then(|u| self.resolve_url(u))
                && !target.starts_with("javascript:")
                && target != self.url
            {
                let mut request = NavigationRequest::get(target, self.id);
                request.referrer = Some(self.url.clone());
                self.pending_navigation = Some(request);
                self.refreshes_followed += 1;
                // Refresh navigations replace rather than push.
                if let Err(e) = self.perform_refresh() {
                    self.last_navigation_error = Some(e.to_string());
                }
                continue;
            }
            break;
        }
        let mut settled = self.pending_navigation.is_none();
        if let Some(loader) = &self.loader {
            let in_flight = loader.in_flight(self.id);
            let blocking = in_flight
                .iter()
                .filter(|r| !r.background && r.age_ms < FETCH_BLOCKING_AGE_MS)
                .count();
            let old = in_flight.len() - blocking;
            if blocking > 0 {
                settled = false;
                reasons.push(format!("fetch({blocking})"));
            }
            if old > 0 {
                reasons.push(format!("fetch-old({old})"));
            }
        }
        if self.pending_navigation.is_some() {
            reasons.push("navigation".into());
        }
        if !self.style_clean() || !self.layout_clean() {
            settled = false;
            reasons.push("layout".into());
        }
        let waited = u64::try_from(start.elapsed().as_millis()).unwrap_or(u64::MAX);
        if waited > budget_ms {
            reasons.push(format!("budget({budget_ms}ms)"));
        }
        Settled {
            settled,
            waited_ms: waited,
            reasons,
        }
    }

    fn perform_refresh(&mut self) -> Result<()> {
        let Some(request) = self.pending_navigation.take() else {
            return Ok(());
        };
        let Some(loader) = self.loader.as_mut() else {
            return Err(Error::Network(format!(
                "meta refresh to {} requires a loader",
                request.url
            )));
        };
        let loaded = loader.load(&request)?;
        self.load(loaded, HistoryMode::Refresh);
        Ok(())
    }

    // ---------------------------------------------------------------------
    // Navigation
    // ---------------------------------------------------------------------

    /// Requests a navigation (completed by [`Self::settle`]).
    pub fn navigate(&mut self, url: &str) -> Result<()> {
        let resolved = self
            .resolve_url(url)
            .ok_or_else(|| Error::invalid_params(format!("invalid url {url:?}")))?;
        let parsed = url::Url::parse(&resolved)
            .map_err(|e| Error::invalid_params(format!("invalid url {url:?}: {e}")))?;
        if parsed.scheme() == "javascript" {
            return Err(Error::capability_unsupported(
                "javascript: URLs need the script layer",
            ));
        }
        let mut request = NavigationRequest::get(parsed.to_string(), self.id);
        request.referrer = Some(self.url.clone());
        self.pending_navigation = Some(request);
        Ok(())
    }

    /// Requests a submission navigation.
    fn navigate_with(&mut self, request: NavigationRequest) {
        self.pending_navigation = Some(request);
    }

    /// History back (from the in-memory history cache; no network).
    pub fn back(&mut self) -> Result<()> {
        if self.history_index == 0 {
            return Err(Error::step_failed("no previous history entry"));
        }
        let index = self.history_index - 1;
        self.traverse(index);
        Ok(())
    }

    /// History forward.
    pub fn forward(&mut self) -> Result<()> {
        if self.history_index + 1 >= self.history.len() {
            return Err(Error::step_failed("no next history entry"));
        }
        let index = self.history_index + 1;
        self.traverse(index);
        Ok(())
    }

    fn traverse(&mut self, index: usize) {
        if let Some(current) = self.history.get_mut(self.history_index) {
            current.scroll = self.scroll;
        }
        let entry = self.history[index].clone();
        self.load(entry.document, HistoryMode::Traverse(index));
        self.scroll = entry.scroll;
    }

    /// Reload: refetches through the loader when there is one, else
    /// re-parses the cached bytes.
    pub fn reload(&mut self) -> Result<()> {
        let entry = self
            .history
            .get(self.history_index)
            .cloned()
            .ok_or_else(|| Error::step_failed("nothing to reload"))?;
        let can_refetch = self.loader.is_some()
            && url::Url::parse(&entry.document.url)
                .is_ok_and(|u| matches!(u.scheme(), "http" | "https" | "file" | "data"));
        let loaded = if can_refetch {
            let request = NavigationRequest::get(entry.document.url.clone(), self.id);
            self.loader
                .as_mut()
                .expect("loader present")
                .load(&request)?
        } else {
            entry.document
        };
        self.load(loaded, HistoryMode::Replace);
        Ok(())
    }

    /// Cancels a pending navigation.
    pub fn stop(&mut self) -> bool {
        self.pending_navigation.take().is_some()
    }

    // ---------------------------------------------------------------------
    // Observation
    // ---------------------------------------------------------------------

    fn observe_input(&self) -> ObserveInput<'_> {
        ObserveInput {
            doc: &self.doc,
            styles: &self.style_tree,
            layout: &self.layout,
            viewport: self.viewport,
            scale: self.scale,
            scroll: self.scroll,
            focused: self.focused,
            url: &self.url,
            base_url: self.base_url.as_ref().map(url::Url::as_str),
            pending_dialogs: &[],
        }
    }

    /// Builds an observation without settling or caching (perf probes).
    #[must_use]
    pub fn observe_now(&self, request: &ObservationRequest) -> ObservationContent {
        let mut content = observe(&self.observe_input(), request);
        for e in &mut content.elements {
            if e.type_.as_deref() == Some("file")
                && let Some(files) = parse_ref(&e.reference)
                    .and_then(|i| self.doc.node_at_index(i).ok().flatten())
                    .and_then(|id| self.files.get(&id))
            {
                e.value = Some(files.join(", "));
            }
        }
        content
    }

    /// Settles, observes, and computes `changesSince` against the cached
    /// observation taken at `sinceRevision` (same scope and format).
    pub fn observe(&mut self, request: &ObservationRequest) -> Result<EngineObservation> {
        let settled = self.settle(SETTLE_STEP_MS);
        Ok(self.observe_after_settle(request, settled))
    }

    pub(crate) fn observe_after_settle(
        &mut self,
        request: &ObservationRequest,
        settled: Settled,
    ) -> EngineObservation {
        let span = Stage::Snapshot.span();
        let _guard = span.enter();
        let revision = self.doc.revision().0;
        let cached_same = request.since_revision.and_then(|since| {
            self.observations.iter().find(|c| {
                c.revision == since
                    && c.generation == self.generation
                    && c.scope == request.scope
                    && c.format == request.format
                    && c.subtree_ref == request.subtree_ref
            })
        });
        // Fast path: nothing changed since the cached observation.
        let content = match cached_same {
            Some(c) if c.revision == revision => c.content.clone(),
            _ => self.observe_now(request),
        };
        let (changes_since, delta) = match request.since_revision {
            None => (None, None),
            Some(since) => {
                let previous = self.observations.iter().find(|c| {
                    c.revision == since
                        && c.scope == request.scope
                        && c.format == request.format
                        && c.subtree_ref == request.subtree_ref
                });
                match previous {
                    Some(prev) if prev.generation == self.generation => {
                        let (lines, delta) = changes_between(&prev.content, &content);
                        (
                            Some(lines),
                            (request.format == Format::Full).then_some(delta),
                        )
                    }
                    Some(prev) => {
                        // A new document: refs do not carry across epochs.
                        let mut lines = Vec::new();
                        if prev.content.url != content.url {
                            lines.push(format!("~ url {} → {}", prev.content.url, content.url));
                        }
                        lines.push(format!(
                            "~ document epoch {} → {} (all refs replaced)",
                            prev.generation, self.generation
                        ));
                        let delta = ObservationDelta {
                            added: content.elements.clone(),
                            removed: prev
                                .content
                                .elements
                                .iter()
                                .map(|e| e.reference.clone())
                                .collect(),
                            changed: Vec::new(),
                            text_ops: Vec::new(),
                        };
                        (
                            Some(lines),
                            (request.format == Format::Full).then_some(delta),
                        )
                    }
                    // Journal floor / unknown revision: full snapshot, no delta.
                    None => (None, None),
                }
            }
        };
        self.observations.retain(|c| {
            !(c.revision == revision
                && c.scope == request.scope
                && c.format == request.format
                && c.subtree_ref == request.subtree_ref)
        });
        self.observations.push_back(CachedObservation {
            revision,
            generation: self.generation,
            scope: request.scope,
            format: request.format,
            subtree_ref: request.subtree_ref.clone(),
            content: content.clone(),
        });
        while self.observations.len() > 8 {
            self.observations.pop_front();
        }
        EngineObservation {
            content,
            revision,
            document_epoch: u64::from(self.generation),
            changes_since,
            delta,
            settled,
        }
    }

    // ---------------------------------------------------------------------
    // Target resolution
    // ---------------------------------------------------------------------

    /// Resolves an `r<index>` ref: `target_detached` for tombstones (and
    /// epoch mismatches), `not_found` for never-allocated indices.
    pub fn resolve_ref(&self, reference: &str, epoch: Option<u64>) -> Result<NodeId> {
        let index = parse_ref(reference)
            .ok_or_else(|| Error::invalid_params(format!("malformed ref {reference:?}")))?;
        if let Some(epoch) = epoch
            && epoch != u64::from(self.generation)
        {
            return Err(Error::coded_with(
                ErrorCode::TargetDetached,
                format!(
                    "ref {reference} belongs to document epoch {epoch}; the page is at epoch {}",
                    self.generation
                ),
                serde_json::json!({ "ref": reference, "epoch": epoch, "currentEpoch": self.generation }),
            ));
        }
        match self.doc.node_at_index(index) {
            Ok(Some(id)) => {
                if self.doc.element(id).is_some() {
                    Ok(id)
                } else {
                    self.doc.parent(id).ok_or_else(|| {
                        Error::not_found(format!("ref {reference} is not an element"))
                    })
                }
            }
            Ok(None) => Err(Error::coded_with(
                ErrorCode::TargetDetached,
                format!(
                    "ref {reference} was removed from the document (epoch {})",
                    self.generation
                ),
                serde_json::json!({ "ref": reference, "epoch": self.generation }),
            )),
            Err(()) => Err(Error::not_found(format!(
                "ref {reference} never existed in document epoch {}",
                self.generation
            ))),
        }
    }

    /// Text of `id` and its rendered descendants, whitespace normalised.
    #[must_use]
    pub fn visible_text(&self, id: NodeId) -> String {
        fn walk(page: &Page, id: NodeId, out: &mut String) {
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
        normalize(&out)
    }

    /// Whole-page text in the shown-text sense (for `textVisible`).
    #[must_use]
    pub fn shown_text(&self) -> String {
        let request = ObservationRequest {
            max_text_chars: usize::MAX / 2,
            max_elements: 1,
            ..ObservationRequest::default()
        };
        self.observe_now(&request).text
    }

    /// All matches of a target, in document order (no shown filtering).
    pub fn resolve_all(&self, target: &str, epoch: Option<u64>) -> Result<Vec<NodeId>> {
        let spec = TargetSpec::parse(target)?;
        self.resolve_spec_all(&spec, epoch)
    }

    fn resolve_spec_all(&self, spec: &TargetSpec, epoch: Option<u64>) -> Result<Vec<NodeId>> {
        let doc = &self.doc;
        Ok(match spec {
            TargetSpec::Ref(index) => vec![self.resolve_ref(&format!("r{index}"), epoch)?],
            TargetSpec::Css(selector) => {
                // `>>` pierces open shadow roots: match each segment inside the
                // shadow tree of the previous matches.
                let segments: Vec<&str> = selector.split(">>").map(str::trim).collect();
                let mut current: Vec<NodeId> = self.style_engine.select(doc, segments[0])?;
                for segment in &segments[1..] {
                    let mut next = Vec::new();
                    for host in &current {
                        if let Some(root) = doc.shadow_root(*host) {
                            for candidate in doc.descendants(root) {
                                if doc.element(candidate).is_some()
                                    && self.style_engine.matches(doc, candidate, segment)?
                                {
                                    next.push(candidate);
                                }
                            }
                        }
                    }
                    current = next;
                }
                current
            }
            TargetSpec::Text(text) => {
                let wanted = normalize(text);
                let candidates: Vec<NodeId> = doc
                    .elements()
                    .filter(|&id| {
                        self.style_tree.is_displayed(id)
                            && !doc.element(id).is_some_and(|e| {
                                matches!(
                                    e.name.as_str(),
                                    "script" | "style" | "html" | "head" | "body"
                                )
                            })
                    })
                    .collect();
                let exact: Vec<NodeId> = candidates
                    .iter()
                    .copied()
                    .filter(|&id| self.visible_text(id) == wanted)
                    .collect();
                let innermost = |set: &[NodeId]| -> Vec<NodeId> {
                    set.iter()
                        .copied()
                        .filter(|&id| !set.iter().any(|&o| o != id && doc.is_ancestor_of(id, o)))
                        .collect()
                };
                let exact = innermost(&exact);
                if !exact.is_empty() {
                    exact
                } else {
                    let partial: Vec<NodeId> = candidates
                        .into_iter()
                        .filter(|&id| self.visible_text(id).contains(wanted.as_str()))
                        .collect();
                    innermost(&partial)
                }
            }
            TargetSpec::Role { role, name } => {
                let wanted = Role::from_aria(role)
                    .ok_or_else(|| Error::invalid_params(format!("unknown role {role:?}")))?;
                let labels = LabelIndex::build(doc);
                doc.elements()
                    .filter(|&id| Role::for_element(doc, id) == Some(wanted))
                    .filter(|&id| {
                        name.as_ref().is_none_or(|w| {
                            compute_name_with(doc, id, Some(&labels)).eq_ignore_ascii_case(w)
                        })
                    })
                    .collect()
            }
            TargetSpec::Label(label) => {
                let wanted = normalize(label);
                let labels = LabelIndex::build(doc);
                doc.elements()
                    .filter(|&id| {
                        doc.element(id).is_some_and(|e| {
                            matches!(e.name.as_str(), "input" | "select" | "textarea" | "button")
                        })
                    })
                    .filter(|&id| {
                        compute_name_with(doc, id, Some(&labels)).eq_ignore_ascii_case(&wanted)
                    })
                    .collect()
            }
        })
    }

    /// Resolves a target to exactly one element (architecture §6).
    ///
    /// Refs resolve directly. Selector targets that match more than one
    /// *shown* element fail with `target_ambiguous` listing the first five
    /// candidate refs; when only one match is shown it wins; when none is
    /// shown the first match is returned (actionability then explains why).
    pub fn resolve(&mut self, target: &str, epoch: Option<u64>) -> Result<NodeId> {
        let span = tracing::info_span!("agent.resolve", target);
        let _guard = span.enter();
        let spec = TargetSpec::parse(target)?;
        let matches = self.resolve_spec_all(&spec, epoch)?;
        if matches.is_empty() {
            return Err(Error::not_found(format!("no element matches {target:?}")));
        }
        if matches.len() == 1 || matches!(spec, TargetSpec::Ref(_)) {
            return Ok(matches[0]);
        }
        self.update();
        let shown: Vec<NodeId> = matches
            .iter()
            .copied()
            .filter(|&id| self.classify(id).shown)
            .collect();
        match shown.len() {
            0 => Ok(matches[0]),
            1 => Ok(shown[0]),
            n => {
                let candidates: Vec<serde_json::Value> = shown
                    .iter()
                    .take(5)
                    .map(|&id| {
                        let e = self.doc.element(id).expect("live");
                        let name = compute_name_with(&self.doc, id, None);
                        serde_json::json!({
                            "ref": ref_for(id),
                            "tag": e.name,
                            "role": Role::for_element(&self.doc, id).map(Role::name),
                            "name": name,
                        })
                    })
                    .collect();
                Err(Error::coded_with(
                    ErrorCode::TargetAmbiguous,
                    format!(
                        "{target:?} matches {n} shown elements; pick one of the candidate refs"
                    ),
                    serde_json::json!({ "target": target, "matches": n, "candidates": candidates }),
                ))
            }
        }
    }

    /// §5 visibility of one element.
    #[must_use]
    pub fn classify(&self, id: NodeId) -> Visibility5 {
        ve_a11y::classify(&self.observe_input(), id)
    }

    // ---------------------------------------------------------------------
    // Actionability
    // ---------------------------------------------------------------------

    fn is_disabled(&self, id: NodeId) -> bool {
        let doc = &self.doc;
        doc.attribute(id, "disabled").is_some()
            || doc
                .attribute(id, "aria-disabled")
                .is_some_and(|v| v.eq_ignore_ascii_case("true"))
            || doc.ancestors(id).any(|a| {
                doc.element(a).is_some_and(|e| {
                    (e.is_html("fieldset") && e.has_attr("disabled")) || e.has_attr("inert")
                })
            })
            || doc.attribute(id, "inert").is_some()
    }

    fn actionability_error(
        &self,
        predicate: &str,
        id: NodeId,
        timeout_ms: u64,
        extra: serde_json::Value,
    ) -> Error {
        let mut detail = serde_json::json!({
            "predicate": predicate,
            "ref": ref_for(id),
            "timeoutMs": timeout_ms,
            "settled": true,
        });
        if let (Some(d), Some(x)) = (detail.as_object_mut(), extra.as_object()) {
            for (k, v) in x {
                d.insert(k.clone(), v.clone());
            }
        }
        Error::coded_with(
            ErrorCode::StepFailed,
            format!(
                "{} is not actionable: `{predicate}` failed (page settled; waited 0 of {timeout_ms} ms)",
                ref_for(id)
            ),
            detail,
        )
    }

    /// Whether `id` is still part of the document tree (not merely alive in
    /// the arena after a removal).
    fn is_connected(&self, id: NodeId) -> bool {
        let root = self.doc.root();
        id == root || self.doc.ancestors(id).any(|a| a == root)
    }

    /// Actionability, checked in order: attached → shown → enabled →
    /// stable → unoccluded. Returns the document-coordinate rect.
    pub fn actionable(&mut self, id: NodeId, timeout_ms: u64) -> Result<Rect> {
        self.update();
        if self.doc.element(id).is_none() || !self.is_connected(id) {
            return Err(Error::coded_with(
                ErrorCode::TargetDetached,
                format!("{} is detached", ref_for(id)),
                serde_json::json!({ "predicate": "attached", "ref": ref_for(id) }),
            ));
        }
        let vis = self.classify(id);
        if !vis.shown {
            let why = if !self.style_tree.is_displayed(id) {
                "display: none"
            } else if self.layout.rect_of(id).is_none_or(|r| r.is_empty()) {
                "no box / zero size"
            } else {
                "visibility, opacity or overflow clipping"
            };
            return Err(self.actionability_error(
                "shown",
                id,
                timeout_ms,
                serde_json::json!({ "reason": why }),
            ));
        }
        if self.is_disabled(id) {
            return Err(self.actionability_error(
                "enabled",
                id,
                timeout_ms,
                serde_json::Value::Null,
            ));
        }
        let before = self.layout.rect_of(id).unwrap_or(Rect::ZERO);
        // Stable: two consecutive layout passes agree. Without scripts or
        // animations a clean layout is stable by construction; a dirty one is
        // recomputed and compared.
        self.update();
        let after = self.layout.rect_of(id).unwrap_or(Rect::ZERO);
        if before != after {
            return Err(self.actionability_error(
                "stable",
                id,
                timeout_ms,
                serde_json::json!({ "before": format!("{before:?}"), "after": format!("{after:?}") }),
            ));
        }
        Ok(after)
    }

    /// Scrolls the viewport so `rect` (document coordinates) is visible.
    fn scroll_into_view(&mut self, rect: Rect) {
        let vw = self.viewport.width;
        let vh = self.viewport.height;
        let mut changed = false;
        if rect.y() < self.scroll.y || rect.bottom() > self.scroll.y + vh {
            let max_y = (self.layout.content_height() - vh).max(0.0);
            let target = (rect.y() + rect.height() / 2.0 - vh / 2.0).clamp(0.0, max_y);
            if (target - self.scroll.y).abs() > 0.5 {
                self.scroll.y = target;
                changed = true;
            }
        }
        if rect.x() < self.scroll.x || rect.right() > self.scroll.x + vw {
            let max_x = (self.layout.root.rect.right() - vw).max(0.0);
            let target = (rect.x() + rect.width() / 2.0 - vw / 2.0).clamp(0.0, max_x);
            if (target - self.scroll.x).abs() > 0.5 {
                self.scroll.x = target;
                changed = true;
            }
        }
        if changed {
            self.doc.record_scrolled(None);
        }
    }

    /// Full actionability including the unoccluded check at the dispatch
    /// point (after scrolling into view). Returns the dispatch point.
    pub fn prepare_pointer(&mut self, id: NodeId, timeout_ms: u64) -> Result<Point> {
        let rect = self.actionable(id, timeout_ms)?;
        self.scroll_into_view(rect);
        let viewport = Rect::new(
            self.scroll.x,
            self.scroll.y,
            self.viewport.width,
            self.viewport.height,
        );
        let visible = rect.intersection(&viewport).unwrap_or(rect);
        let point = visible.center();
        if let Some(hit) = self.layout.hit_test(point)
            && hit != id
            && !self.doc.is_ancestor_of(id, hit)
            && !self.doc.is_ancestor_of(hit, id)
        {
            return Err(self.actionability_error(
                "unoccluded",
                id,
                timeout_ms,
                serde_json::json!({ "occludedBy": ref_for(hit), "point": { "x": point.x - self.scroll.x, "y": point.y - self.scroll.y } }),
            ));
        }
        Ok(point)
    }

    // ---------------------------------------------------------------------
    // Focus
    // ---------------------------------------------------------------------

    fn is_focusable(&self, id: NodeId) -> bool {
        let Some(e) = self.doc.element(id) else {
            return false;
        };
        if self.is_disabled(id) {
            return false;
        }
        if e.attr("tabindex")
            .and_then(|t| t.trim().parse::<i32>().ok())
            .is_some_and(|t| t < 0)
        {
            return true; // programmatically focusable, skipped by Tab
        }
        e.has_attr("tabindex")
            || matches!(
                e.name.as_str(),
                "input" | "button" | "select" | "textarea" | "summary" | "iframe"
            )
            || ((e.is_html("a") || e.is_html("area")) && e.has_attr("href"))
            || e.attr("contenteditable")
                .is_some_and(|v| !v.eq_ignore_ascii_case("false"))
    }

    /// Moves focus.
    pub fn focus(&mut self, id: Option<NodeId>) {
        if self.focused == id {
            return;
        }
        if let Some(old) = self.focused {
            self.doc.mark_dirty(old, DirtyFlags::STYLE);
        }
        self.focused = id.filter(|&n| self.doc.element(n).is_some());
        self.style_engine.interaction.set_focus(self.focused, true);
        if let Some(n) = self.focused {
            self.doc.mark_dirty(n, DirtyFlags::STYLE);
        }
    }

    /// Sequential focus navigation order: positive `tabindex` ascending,
    /// then the rest in tree order; negative `tabindex`, disabled and
    /// unshown elements are skipped.
    #[must_use]
    pub fn tab_order(&self) -> Vec<NodeId> {
        let mut positive: Vec<(i32, usize, NodeId)> = Vec::new();
        let mut rest: Vec<NodeId> = Vec::new();
        for (order, id) in self.doc.elements().enumerate() {
            if !self.is_focusable(id) {
                continue;
            }
            let tabindex = self
                .doc
                .attribute(id, "tabindex")
                .and_then(|t| t.trim().parse::<i32>().ok());
            if tabindex.is_some_and(|t| t < 0) {
                continue;
            }
            if !self.style_tree.is_displayed(id) || !self.classify(id).shown {
                continue;
            }
            match tabindex {
                Some(t) if t > 0 => positive.push((t, order, id)),
                _ => rest.push(id),
            }
        }
        positive.sort_by_key(|&(t, order, _)| (t, order));
        positive
            .into_iter()
            .map(|(_, _, id)| id)
            .chain(rest)
            .collect()
    }

    // ---------------------------------------------------------------------
    // Actions
    // ---------------------------------------------------------------------

    fn input_type(&self, id: NodeId) -> Option<String> {
        let e = self.doc.element(id)?;
        e.is_html("input").then(|| {
            e.attr("type")
                .map_or_else(|| "text".to_owned(), str::to_ascii_lowercase)
        })
    }

    fn is_text_control(&self, id: NodeId) -> bool {
        match self.input_type(id) {
            Some(t) => !matches!(
                t.as_str(),
                "checkbox"
                    | "radio"
                    | "button"
                    | "submit"
                    | "reset"
                    | "hidden"
                    | "image"
                    | "file"
                    | "range"
                    | "color"
            ),
            None => {
                self.doc.element(id).is_some_and(|e| e.is_html("textarea"))
                    || self
                        .doc
                        .attribute(id, "contenteditable")
                        .is_some_and(|v| !v.eq_ignore_ascii_case("false"))
            }
        }
    }

    /// Clicks an element: actionability, scroll into view, focus, then the
    /// activation behaviour of the nearest activatable ancestor-or-self.
    /// Returns a human-readable detail.
    pub fn click(&mut self, id: NodeId, button: MouseButton, timeout_ms: u64) -> Result<String> {
        let point = self.prepare_pointer(id, timeout_ms)?;
        self.click_at_element(id, point, button)
    }

    fn click_at_element(
        &mut self,
        id: NodeId,
        point: Point,
        button: MouseButton,
    ) -> Result<String> {
        // Focus moves to the nearest focusable ancestor-or-self.
        let focus_target = std::iter::once(id)
            .chain(self.doc.ancestors(id))
            .find(|&n| self.is_focusable(n) && self.doc.element(n).is_some());
        if let Some(target) = focus_target {
            let is_text = self.is_text_control(target);
            self.focus(Some(target));
            let _ = is_text;
        } else {
            self.focus(None);
        }
        tracing::debug!(%id, ?point, ?button, "click");
        if button != MouseButton::Left {
            return Ok(format!(
                "{} {:?} click (no activation)",
                ref_for(id),
                button
            ));
        }
        self.activate(id)
    }

    /// Runs the activation behaviour for a click on `id`.
    fn activate(&mut self, id: NodeId) -> Result<String> {
        let chain: Vec<NodeId> = std::iter::once(id).chain(self.doc.ancestors(id)).collect();
        for node in chain {
            let Some(e) = self.doc.element(node).cloned() else {
                continue;
            };
            match e.name.as_str() {
                "a" | "area" if e.has_attr("href") => {
                    return self.activate_link(node);
                }
                "button" => {
                    let ty = e
                        .attr("type")
                        .map_or_else(|| "submit".into(), str::to_ascii_lowercase);
                    return match ty.as_str() {
                        "submit" => self.submit_from(node),
                        "reset" => self.reset_form_of(node),
                        _ => Ok(format!("clicked button {}", ref_for(node))),
                    };
                }
                "input" => {
                    let ty = self.input_type(node).unwrap_or_default();
                    return match ty.as_str() {
                        "checkbox" => {
                            let now = !self.doc.is_checked(node);
                            self.doc.set_checked(node, now)?;
                            Ok(format!("{} checked={now}", ref_for(node)))
                        }
                        "radio" => {
                            self.check_radio(node)?;
                            Ok(format!("{} checked=true", ref_for(node)))
                        }
                        "submit" | "image" => self.submit_from(node),
                        "reset" => self.reset_form_of(node),
                        "file" => Ok(format!(
                            "{} file chooser suppressed (use upload)",
                            ref_for(node)
                        )),
                        _ => Ok(format!("focused {}", ref_for(node))),
                    };
                }
                "label" => {
                    let control = e
                        .attr("for")
                        .and_then(|f| self.doc.element_by_id(f))
                        .or_else(|| {
                            self.doc.descendants(node).find(|&d| {
                                self.doc.element(d).is_some_and(|c| {
                                    matches!(
                                        c.name.as_str(),
                                        "input" | "select" | "textarea" | "button"
                                    )
                                })
                            })
                        });
                    if let Some(control) = control
                        && control != id
                        && !self.is_disabled(control)
                    {
                        if self.is_focusable(control) {
                            self.focus(Some(control));
                        }
                        return self.activate(control);
                    }
                    return Ok(format!("clicked label {}", ref_for(node)));
                }
                "summary" => {
                    if let Some(details) = self
                        .doc
                        .parent(node)
                        .filter(|&p| self.doc.element(p).is_some_and(|d| d.is_html("details")))
                    {
                        let open = self.doc.attribute(details, "open").is_some();
                        if open {
                            self.doc.remove_attribute(details, "open")?;
                        } else {
                            self.doc.set_attribute(details, "open", "")?;
                        }
                        return Ok(format!("{} open={}", ref_for(details), !open));
                    }
                    return Ok(format!("clicked summary {}", ref_for(node)));
                }
                "option" => {
                    if let Some(select) = self
                        .doc
                        .ancestors(node)
                        .find(|&a| self.doc.element(a).is_some_and(|s| s.is_html("select")))
                    {
                        self.select_options(select, &[node])?;
                        return Ok(format!("{} selected", ref_for(node)));
                    }
                    return Ok(format!("clicked option {}", ref_for(node)));
                }
                "select" | "textarea" => {
                    return Ok(format!("focused {}", ref_for(node)));
                }
                "dialog" | "form" | "body" | "html" => {
                    return Ok(format!("clicked {}", ref_for(id)));
                }
                _ => {}
            }
        }
        Ok(format!("clicked {}", ref_for(id)))
    }

    fn activate_link(&mut self, link: NodeId) -> Result<String> {
        let href = self
            .doc
            .attribute(link, "href")
            .unwrap_or("")
            .trim()
            .to_owned();
        if self.doc.attribute(link, "download").is_some() {
            return Err(Error::capability_unsupported(
                "downloads are not supported in this milestone",
            ));
        }
        if let Some(fragment) = href.strip_prefix('#') {
            return self.jump_to_fragment(fragment);
        }
        let Some(resolved) = self.resolve_url(&href) else {
            return Err(Error::invalid_params(format!(
                "link href {href:?} is not a valid URL"
            )));
        };
        let parsed = url::Url::parse(&resolved)
            .map_err(|e| Error::invalid_params(format!("link href {href:?}: {e}")))?;
        match parsed.scheme() {
            "javascript" => {
                return Err(Error::capability_unsupported(
                    "javascript: links need the script layer",
                ));
            }
            "http" | "https" | "file" | "data" | "about" => {}
            other => {
                return Ok(format!(
                    "link {} to {other}: scheme handed off (not navigated)",
                    ref_for(link)
                ));
            }
        }
        // Same-document fragment navigation.
        if let Some(fragment) = parsed.fragment()
            && let Ok(current) = url::Url::parse(&self.url)
        {
            let mut a = parsed.clone();
            a.set_fragment(None);
            let mut b = current;
            b.set_fragment(None);
            if a == b {
                return self.jump_to_fragment(fragment);
            }
        }
        let target = self.doc.attribute(link, "target").map(str::to_owned);
        let mut request = NavigationRequest::get(parsed.to_string(), self.id);
        request.referrer = Some(self.url.clone());
        self.navigate_with(request);
        Ok(match target.as_deref() {
            Some(t) if !t.is_empty() && t != "_self" => {
                format!("navigating to {resolved} (target={t} followed in-place)")
            }
            _ => format!("navigating to {resolved}"),
        })
    }

    fn jump_to_fragment(&mut self, fragment: &str) -> Result<String> {
        let decoded = percent_decode(fragment);
        let target = if decoded.is_empty() || decoded == "top" {
            None
        } else {
            self.doc.element_by_id(&decoded).or_else(|| {
                self.doc.elements().find(|&e| {
                    self.doc.element(e).is_some_and(|el| el.is_html("a"))
                        && self.doc.attribute(e, "name") == Some(decoded.as_str())
                })
            })
        };
        self.update();
        match target {
            Some(id) => {
                if let Some(rect) = self.layout.rect_of(id) {
                    let max_y = (self.layout.content_height() - self.viewport.height).max(0.0);
                    self.scroll.y = rect.y().clamp(0.0, max_y);
                    self.doc.record_scrolled(None);
                }
                self.style_engine.interaction.set_target(Some(id));
                self.doc.mark_dirty(id, DirtyFlags::STYLE);
                if let Ok(mut u) = url::Url::parse(&self.url) {
                    u.set_fragment(Some(fragment));
                    self.url = u.to_string();
                }
                Ok(format!("scrolled to #{decoded} ({})", ref_for(id)))
            }
            None => {
                self.scroll.y = 0.0;
                self.doc.record_scrolled(None);
                Ok("scrolled to top".into())
            }
        }
    }

    fn check_radio(&mut self, radio: NodeId) -> Result<()> {
        let group = self.doc.attribute(radio, "name").map(str::to_owned);
        let form = forms::form_owner(&self.doc, radio);
        if let Some(group) = group {
            let peers: Vec<NodeId> = self
                .doc
                .elements()
                .filter(|&o| {
                    o != radio
                        && self.input_type(o).as_deref() == Some("radio")
                        && self.doc.attribute(o, "name") == Some(group.as_str())
                        && forms::form_owner(&self.doc, o) == form
                })
                .collect();
            for peer in peers {
                if self.doc.is_checked(peer) {
                    self.doc.set_checked(peer, false)?;
                }
            }
        }
        self.doc.set_checked(radio, true)
    }

    fn reset_form_of(&mut self, control: NodeId) -> Result<String> {
        let Some(form) = forms::form_owner(&self.doc, control) else {
            return Ok(format!("reset button {} has no form", ref_for(control)));
        };
        let controls: Vec<NodeId> = self
            .doc
            .elements()
            .filter(|&id| forms::form_owner(&self.doc, id) == Some(form))
            .filter(|&id| {
                self.doc.element(id).is_some_and(|e| {
                    matches!(e.name.as_str(), "input" | "select" | "textarea" | "option")
                })
            })
            .collect();
        for id in controls {
            let e = self.doc.element(id).expect("live").clone();
            match e.name.as_str() {
                "input" => {
                    let checked_attr = e.has_attr("checked");
                    if matches!(self.input_type(id).as_deref(), Some("checkbox" | "radio")) {
                        self.doc.set_checked(id, checked_attr)?;
                    } else {
                        let default = e.attr("value").unwrap_or("").to_owned();
                        self.doc.set_form_value(id, default)?;
                    }
                }
                "textarea" => {
                    let default = self.doc.text_content(id);
                    self.doc.set_form_value(id, default)?;
                }
                "option" => {
                    let selected = e.has_attr("selected");
                    self.doc.set_selected(id, selected)?;
                }
                _ => {}
            }
        }
        self.files.clear();
        Ok(format!("reset form {}", ref_for(form)))
    }

    /// Submits the form owning `submitter` (a submit button) or the form
    /// itself when `submitter` is a form / a field (implicit submission).
    pub fn submit_from(&mut self, control: NodeId) -> Result<String> {
        let form = if self.doc.element(control).is_some_and(|e| e.is_html("form")) {
            control
        } else {
            match forms::form_owner(&self.doc, control) {
                Some(f) => f,
                None => {
                    return Ok(format!(
                        "clicked {} (no form owner; nothing submitted)",
                        ref_for(control)
                    ));
                }
            }
        };
        let submitter = self
            .doc
            .element(control)
            .filter(|e| forms::is_submit_button(e))
            .map(|_| control);
        self.submit_form(form, submitter)
    }

    /// Submits `form` with an optional submitter button.
    pub fn submit_form(&mut self, form: NodeId, submitter: Option<NodeId>) -> Result<String> {
        let files = self.files.clone();
        let plan = forms::plan_submission(&self.doc, form, submitter, &|id| {
            files.get(&id).cloned().unwrap_or_default()
        });
        if plan.method == FormMethod::Dialog {
            if let Some(dialog) = self
                .doc
                .ancestors(form)
                .find(|&a| self.doc.element(a).is_some_and(|e| e.is_html("dialog")))
            {
                self.doc.remove_attribute(dialog, "open")?;
                return Ok(format!("closed dialog {}", ref_for(dialog)));
            }
            return Ok("method=dialog outside a dialog: nothing to close".into());
        }
        let action = if plan.action.trim().is_empty() {
            let mut u = url::Url::parse(&self.url)
                .map_err(|e| Error::invalid_params(format!("document url: {e}")))?;
            u.set_fragment(None);
            u
        } else {
            let resolved = self.resolve_url(&plan.action).ok_or_else(|| {
                Error::invalid_params(format!("form action {:?} is not a valid URL", plan.action))
            })?;
            url::Url::parse(&resolved).map_err(|e| Error::invalid_params(e.to_string()))?
        };
        if action.scheme() == "javascript" {
            return Err(Error::capability_unsupported(
                "javascript: form actions need the script layer",
            ));
        }
        let mut request = NavigationRequest::get(String::new(), self.id);
        request.referrer = Some(self.url.clone());
        match plan.method {
            FormMethod::Get => {
                let mut url = action;
                let query = forms::urlencode(&plan.entries);
                url.set_query(if query.is_empty() { None } else { Some(&query) });
                url.set_fragment(None);
                request.url = url.to_string();
            }
            FormMethod::Post => {
                request.method = NavMethod::Post;
                request.url = action.to_string();
                match plan.enctype {
                    Enctype::UrlEncoded => {
                        request.body = Some(forms::urlencode(&plan.entries).into_bytes());
                        request.content_type = Some("application/x-www-form-urlencoded".into());
                    }
                    Enctype::Multipart => {
                        let boundary =
                            format!("----VectorEngineBoundary{:x}", self.doc.revision().0);
                        let (body, ct) = forms::multipart(&plan.entries, &boundary);
                        request.body = Some(body);
                        request.content_type = Some(ct);
                    }
                    Enctype::TextPlain => {
                        request.body = Some(forms::text_plain(&plan.entries).into_bytes());
                        request.content_type = Some("text/plain".into());
                    }
                }
            }
            FormMethod::Dialog => unreachable!("handled above"),
        }
        let detail = format!(
            "submitting form {} ({} {}, {} field(s))",
            ref_for(form),
            match request.method {
                NavMethod::Get => "GET",
                NavMethod::Post => "POST",
            },
            request.url,
            plan.entries.len()
        );
        self.navigate_with(request);
        Ok(detail)
    }

    /// Double click: two activations (a checkbox ends where it started).
    pub fn dblclick(&mut self, id: NodeId, timeout_ms: u64) -> Result<String> {
        let point = self.prepare_pointer(id, timeout_ms)?;
        let first = self.click_at_element(id, point, MouseButton::Left)?;
        if self.pending_navigation.is_some() {
            return Ok(first);
        }
        let second = self.click_at_element(id, point, MouseButton::Left)?;
        Ok(format!("{first}; {second}"))
    }

    /// Hover: actionability then the `:hover` chain.
    pub fn hover(&mut self, id: NodeId, timeout_ms: u64) -> Result<String> {
        self.prepare_pointer(id, timeout_ms)?;
        let chain: Vec<NodeId> = std::iter::once(id).chain(self.doc.ancestors(id)).collect();
        self.style_engine.interaction.set_hover_chain(&chain);
        for n in &chain {
            self.doc.mark_dirty(*n, DirtyFlags::STYLE);
        }
        Ok(format!("hovering {}", ref_for(id)))
    }

    fn sanitize_value(&self, id: NodeId, value: &str) -> String {
        let mut v = value.to_owned();
        match self.input_type(id).as_deref() {
            Some("number") => {
                if v.trim().parse::<f64>().is_err() {
                    v.clear();
                }
            }
            Some("email" | "text" | "search" | "tel" | "url" | "password") => {
                v = v.replace(['\n', '\r'], "");
            }
            _ => {}
        }
        if let Some(max) = self
            .doc
            .attribute(id, "maxlength")
            .and_then(|m| m.trim().parse::<usize>().ok())
            && v.chars().count() > max
        {
            v = v.chars().take(max).collect();
        }
        v
    }

    fn set_text_value(&mut self, id: NodeId, value: &str) -> Result<()> {
        if self.doc.attribute(id, "contenteditable").is_some()
            && self.input_type(id).is_none()
            && !self.doc.element(id).is_some_and(|e| e.is_html("textarea"))
        {
            let kids: Vec<NodeId> = self.doc.children(id).collect();
            for kid in kids {
                self.doc.destroy(kid)?;
            }
            self.doc.append_text(id, value)?;
            return Ok(());
        }
        let sanitized = self.sanitize_value(id, value);
        self.doc.set_form_value(id, sanitized)
    }

    /// `fill`: focus → select all → set value (sanitised) → input.
    pub fn fill(&mut self, id: NodeId, value: &str, timeout_ms: u64) -> Result<String> {
        self.actionable(id, timeout_ms)?;
        if self.doc.element(id).is_some_and(|e| e.is_html("select")) {
            return self.select_values(id, &[value], timeout_ms);
        }
        if !self.is_text_control(id) {
            return Err(Error::invalid_params(format!(
                "{} is not a text control (use click/check/select)",
                ref_for(id)
            )));
        }
        if self.doc.attribute(id, "readonly").is_some() {
            return Err(Error::step_failed(format!("{} is read-only", ref_for(id))));
        }
        self.focus(Some(id));
        self.set_text_value(id, value)?;
        let stored = self.doc.form_value(id).unwrap_or_default();
        Ok(format!("{} value={stored:?}", ref_for(id)))
    }

    /// `type`: appends per character to the focused text control.
    pub fn type_text(&mut self, id: NodeId, value: &str, timeout_ms: u64) -> Result<String> {
        self.actionable(id, timeout_ms)?;
        if !self.is_text_control(id) {
            return Err(Error::invalid_params(format!(
                "{} is not a text control",
                ref_for(id)
            )));
        }
        if self.doc.attribute(id, "readonly").is_some() {
            return Err(Error::step_failed(format!("{} is read-only", ref_for(id))));
        }
        self.focus(Some(id));
        let mut current = if self.doc.attribute(id, "contenteditable").is_some()
            && self.input_type(id).is_none()
            && !self.doc.element(id).is_some_and(|e| e.is_html("textarea"))
        {
            self.doc.text_content(id)
        } else {
            self.doc.form_value(id).unwrap_or_default()
        };
        let mut typed = 0usize;
        for c in value.chars() {
            if c == '\n' && !self.doc.element(id).is_some_and(|e| e.is_html("textarea")) {
                // Enter in a single-line field: implicit submission after typing.
                self.set_text_value(id, &current)?;
                let submit = self.press_key(Some(id), &Chord::parse("Enter")?)?;
                return Ok(format!("typed {typed} chars; {submit}"));
            }
            current.push(c);
            typed += 1;
        }
        self.set_text_value(id, &current)?;
        Ok(format!("typed {typed} chars into {}", ref_for(id)))
    }

    /// `press`: a key chord with default actions.
    pub fn press(&mut self, target: Option<NodeId>, key: &str, timeout_ms: u64) -> Result<String> {
        let chord = Chord::parse(key)?;
        if let Some(id) = target {
            self.actionable(id, timeout_ms)?;
            self.focus(Some(id));
        }
        self.press_key(target, &chord)
    }

    fn press_key(&mut self, _target: Option<NodeId>, chord: &Chord) -> Result<String> {
        let focused = self.focused;
        match &chord.key {
            Key::Tab => {
                self.update();
                let order = self.tab_order();
                let next = match (
                    focused.and_then(|f| order.iter().position(|&o| o == f)),
                    chord.modifiers.shift,
                ) {
                    (Some(i), false) => order.get(i + 1).copied(),
                    (Some(i), true) => i.checked_sub(1).and_then(|j| order.get(j).copied()),
                    (None, false) => order.first().copied(),
                    (None, true) => order.last().copied(),
                };
                self.focus(next);
                Ok(match next {
                    Some(n) => format!("focus moved to {}", ref_for(n)),
                    None => "focus left the document".into(),
                })
            }
            Key::Escape => {
                // Close the innermost open dialog containing the focus, else blur.
                if let Some(f) = focused
                    && let Some(dialog) =
                        std::iter::once(f).chain(self.doc.ancestors(f)).find(|&a| {
                            self.doc
                                .element(a)
                                .is_some_and(|e| e.is_html("dialog") && e.has_attr("open"))
                        })
                {
                    self.doc.remove_attribute(dialog, "open")?;
                    return Ok(format!("closed dialog {}", ref_for(dialog)));
                }
                self.focus(None);
                Ok("blurred".into())
            }
            Key::Enter => {
                let Some(id) = focused else {
                    return Ok("Enter with no focus".into());
                };
                let e = self.doc.element(id).cloned();
                if let Some(e) = e {
                    if e.is_html("textarea") {
                        let mut v = self.doc.form_value(id).unwrap_or_default();
                        v.push('\n');
                        self.doc.set_form_value(id, v)?;
                        return Ok(format!("newline in {}", ref_for(id)));
                    }
                    if self.is_text_control(id) || e.is_html("select") {
                        // Implicit submission: the form's default button, else the
                        // form itself when it has no other blocking fields.
                        if let Some(form) = forms::form_owner(&self.doc, id) {
                            if let Some(button) = forms::default_button(&self.doc, form) {
                                return self.submit_form(form, Some(button));
                            }
                            return self.submit_form(form, None);
                        }
                        return Ok(format!("Enter in {} (no form)", ref_for(id)));
                    }
                }
                self.activate(id)
            }
            Key::Space => {
                let Some(id) = focused else {
                    return Ok("Space with no focus".into());
                };
                let ty = self.input_type(id);
                if matches!(ty.as_deref(), Some("checkbox" | "radio"))
                    || self
                        .doc
                        .element(id)
                        .is_some_and(|e| e.is_html("button") || e.is_html("summary"))
                    || Role::for_element(&self.doc, id).is_some_and(|r| {
                        matches!(
                            r,
                            Role::Button | Role::Checkbox | Role::Switch | Role::Radio
                        )
                    })
                {
                    return self.activate(id);
                }
                if self.is_text_control(id) {
                    let mut v = self.doc.form_value(id).unwrap_or_default();
                    v.push(' ');
                    self.set_text_value(id, &v)?;
                    return Ok(format!("space in {}", ref_for(id)));
                }
                Ok("Space ignored".into())
            }
            Key::Backspace | Key::Delete => {
                if let Some(id) = focused
                    && self.is_text_control(id)
                {
                    let mut v = self.doc.form_value(id).unwrap_or_default();
                    if chord.modifiers.control || chord.modifiers.alt {
                        while v.pop().is_some_and(|c| c != ' ') {}
                    } else {
                        v.pop();
                    }
                    self.set_text_value(id, &v)?;
                    return Ok(format!("{} value={v:?}", ref_for(id)));
                }
                Ok("Backspace ignored".into())
            }
            Key::ArrowUp | Key::ArrowDown | Key::ArrowLeft | Key::ArrowRight => {
                let forward = matches!(chord.key, Key::ArrowDown | Key::ArrowRight);
                if let Some(id) = focused {
                    if self.doc.element(id).is_some_and(|e| e.is_html("select")) {
                        return self.step_select(id, forward);
                    }
                    if self.input_type(id).as_deref() == Some("radio") {
                        return self.step_radio(id, forward);
                    }
                }
                // Viewport scroll by 40px (up/down) like a browser.
                if matches!(chord.key, Key::ArrowUp | Key::ArrowDown) {
                    let state = self.scroll_viewport(if forward { 40.0 } else { -40.0 });
                    return Ok(format!("scrolled to y={}", state.y));
                }
                Ok("arrow ignored".into())
            }
            Key::Home | Key::End | Key::PageUp | Key::PageDown => {
                let max_y = (self.layout.content_height() - self.viewport.height).max(0.0);
                let y = match chord.key {
                    Key::Home => 0.0,
                    Key::End => max_y,
                    Key::PageUp => (self.scroll.y - self.viewport.height).max(0.0),
                    _ => (self.scroll.y + self.viewport.height).min(max_y),
                };
                self.scroll.y = y;
                self.doc.record_scrolled(None);
                Ok(format!("scrolled to y={y}"))
            }
            Key::Char(c) => {
                if chord.modifiers.control || chord.modifiers.meta {
                    let lower = c.to_ascii_lowercase();
                    if lower == 'a' {
                        return Ok("select all".into());
                    }
                    return Ok(format!("chord {chord:?} has no default action"));
                }
                if let Some(id) = focused
                    && self.is_text_control(id)
                    && let Some(ch) = chord.typed_char()
                {
                    let mut v = self.doc.form_value(id).unwrap_or_default();
                    v.push(ch);
                    self.set_text_value(id, &v)?;
                    return Ok(format!("{} value={v:?}", ref_for(id)));
                }
                Ok(format!("key {c:?} ignored"))
            }
        }
    }

    fn step_select(&mut self, select: NodeId, forward: bool) -> Result<String> {
        let options: Vec<NodeId> = self
            .doc
            .descendants(select)
            .filter(|&d| {
                self.doc
                    .element(d)
                    .is_some_and(|e| e.is_html("option") && !e.has_attr("disabled"))
            })
            .collect();
        if options.is_empty() {
            return Ok("select has no options".into());
        }
        let current = options
            .iter()
            .position(|&o| self.doc.is_selected(o))
            .unwrap_or(0);
        let next = if forward {
            (current + 1).min(options.len() - 1)
        } else {
            current.saturating_sub(1)
        };
        self.select_options(select, &[options[next]])?;
        Ok(format!(
            "{} selected option {}",
            ref_for(select),
            ref_for(options[next])
        ))
    }

    fn step_radio(&mut self, radio: NodeId, forward: bool) -> Result<String> {
        let group = self.doc.attribute(radio, "name").map(str::to_owned);
        let form = forms::form_owner(&self.doc, radio);
        let peers: Vec<NodeId> = self
            .doc
            .elements()
            .filter(|&o| {
                self.input_type(o).as_deref() == Some("radio")
                    && self.doc.attribute(o, "name").map(str::to_owned) == group
                    && forms::form_owner(&self.doc, o) == form
                    && !self.is_disabled(o)
            })
            .collect();
        let Some(pos) = peers.iter().position(|&p| p == radio) else {
            return Ok("radio group not found".into());
        };
        let next = if forward {
            (pos + 1) % peers.len()
        } else {
            (pos + peers.len() - 1) % peers.len()
        };
        self.check_radio(peers[next])?;
        self.focus(Some(peers[next]));
        Ok(format!("{} checked=true", ref_for(peers[next])))
    }

    /// `check` / `uncheck`.
    pub fn set_checked(&mut self, id: NodeId, checked: bool, timeout_ms: u64) -> Result<String> {
        self.actionable(id, timeout_ms)?;
        let ty = self.input_type(id);
        let role = Role::for_element(&self.doc, id);
        match ty.as_deref() {
            Some("checkbox") => {
                if self.doc.is_checked(id) == checked {
                    return Ok(format!("{} already checked={checked}", ref_for(id)));
                }
                self.click(id, MouseButton::Left, timeout_ms)
            }
            Some("radio") => {
                if !checked {
                    return Err(Error::step_failed(format!(
                        "{} is a radio button; radios cannot be unchecked directly",
                        ref_for(id)
                    )));
                }
                if self.doc.is_checked(id) {
                    return Ok(format!("{} already checked", ref_for(id)));
                }
                self.click(id, MouseButton::Left, timeout_ms)
            }
            _ if role
                .is_some_and(|r| matches!(r, Role::Checkbox | Role::Switch | Role::MenuItem)) =>
            {
                let current = self
                    .doc
                    .attribute(id, "aria-checked")
                    .is_some_and(|v| v.eq_ignore_ascii_case("true"));
                if current == checked {
                    return Ok(format!("{} already checked={checked}", ref_for(id)));
                }
                self.doc.set_attribute(
                    id,
                    "aria-checked",
                    if checked { "true" } else { "false" },
                )?;
                self.focus(Some(id));
                Ok(format!("{} aria-checked={checked}", ref_for(id)))
            }
            _ => Err(Error::invalid_params(format!(
                "{} is not a checkbox or radio",
                ref_for(id)
            ))),
        }
    }

    fn select_options(&mut self, select: NodeId, chosen: &[NodeId]) -> Result<()> {
        let multiple = self.doc.attribute(select, "multiple").is_some();
        let options: Vec<NodeId> = self
            .doc
            .descendants(select)
            .filter(|&d| self.doc.element(d).is_some_and(|e| e.is_html("option")))
            .collect();
        for o in options {
            let want = chosen.contains(&o);
            if want {
                self.doc.set_selected(o, true)?;
            } else if !multiple || !chosen.is_empty() {
                if multiple {
                    if self.doc.is_selected(o) {
                        self.doc.set_selected(o, false)?;
                    }
                } else {
                    self.doc.set_selected(o, false)?;
                }
            }
        }
        Ok(())
    }

    /// `select`: options by value, then label / text.
    pub fn select_values(
        &mut self,
        id: NodeId,
        values: &[&str],
        timeout_ms: u64,
    ) -> Result<String> {
        self.actionable(id, timeout_ms)?;
        let select = if self.doc.element(id).is_some_and(|e| e.is_html("option")) {
            self.doc
                .ancestors(id)
                .find(|&a| self.doc.element(a).is_some_and(|e| e.is_html("select")))
                .ok_or_else(|| {
                    Error::invalid_params(format!("{} is not inside a select", ref_for(id)))
                })?
        } else if self.doc.element(id).is_some_and(|e| e.is_html("select")) {
            id
        } else {
            return Err(Error::invalid_params(format!(
                "{} is not a <select>",
                ref_for(id)
            )));
        };
        let multiple = self.doc.attribute(select, "multiple").is_some();
        if values.len() > 1 && !multiple {
            return Err(Error::invalid_params(format!(
                "{} is a single select; {} values given",
                ref_for(select),
                values.len()
            )));
        }
        let options: Vec<NodeId> = self
            .doc
            .descendants(select)
            .filter(|&d| self.doc.element(d).is_some_and(|e| e.is_html("option")))
            .collect();
        let mut chosen = Vec::new();
        for wanted in values {
            let wanted = wanted.trim();
            let found = options
                .iter()
                .copied()
                .find(|&o| self.doc.attribute(o, "value") == Some(wanted))
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
                .ok_or_else(|| {
                    let available: Vec<String> = options
                        .iter()
                        .map(|&o| {
                            self.doc
                                .attribute(o, "value")
                                .map_or_else(|| self.visible_text(o), str::to_owned)
                        })
                        .collect();
                    Error::coded_with(
                        ErrorCode::NotFound,
                        format!("option {wanted:?} not found in {}", ref_for(select)),
                        serde_json::json!({ "options": available }),
                    )
                })?;
            if self.doc.attribute(found, "disabled").is_some() {
                return Err(Error::step_failed(format!("option {wanted:?} is disabled")));
            }
            chosen.push(found);
        }
        self.focus(Some(select));
        self.select_options(select, &chosen)?;
        Ok(format!(
            "{} selected {}",
            ref_for(select),
            chosen
                .iter()
                .map(|&o| ref_for(o))
                .collect::<Vec<_>>()
                .join(",")
        ))
    }

    /// Nearest scroll container of `id` (self or ancestor with scrollable
    /// overflow), if any.
    #[must_use]
    pub fn scroll_container_of(&self, id: NodeId) -> Option<NodeId> {
        std::iter::once(id)
            .chain(self.doc.ancestors(id))
            .find(|&a| {
                self.style_tree
                    .get(a)
                    .is_some_and(|s| s.overflow.is_scrollable())
                    && self
                        .doc
                        .element(a)
                        .is_some_and(|e| !e.is_html("body") && !e.is_html("html"))
            })
    }

    fn scroll_viewport(&mut self, dy: f32) -> ScrollState {
        let max_y = (self.layout.content_height() - self.viewport.height).max(0.0);
        let max_x = (self.layout.root.rect.right() - self.viewport.width).max(0.0);
        self.scroll = Point::new(
            self.scroll.x.clamp(0.0, max_x),
            (self.scroll.y + dy).clamp(0.0, max_y),
        );
        self.doc.record_scrolled(None);
        ScrollState {
            x: self.scroll.x,
            y: self.scroll.y,
            max_x,
            max_y,
            container: None,
        }
    }

    /// `scroll`: the nearest scroll container of `target` (or the viewport).
    pub fn scroll(
        &mut self,
        target: Option<NodeId>,
        direction: ScrollDirection,
        amount: Option<f32>,
    ) -> Result<ScrollState> {
        self.update();
        let container = target.and_then(|t| self.scroll_container_of(t));
        match container {
            Some(container) => {
                let outer = self.layout.rect_of(container).unwrap_or(Rect::ZERO);
                let (content_bottom, content_right) = self
                    .doc
                    .descendants(container)
                    .filter_map(|d| self.layout.rect_of(d))
                    .fold((outer.bottom(), outer.right()), |(b, r), rect| {
                        (b.max(rect.bottom()), r.max(rect.right()))
                    });
                let max = Point::new(
                    (content_right - outer.right()).max(0.0),
                    (content_bottom - outer.bottom()).max(0.0),
                );
                let step = amount.unwrap_or(outer.height().max(1.0));
                let cur = self.element_scroll.entry(container).or_default();
                let y = match direction {
                    ScrollDirection::Down => cur.y + step,
                    ScrollDirection::Up => cur.y - step,
                    ScrollDirection::Top => 0.0,
                    ScrollDirection::Bottom => max.y,
                };
                *cur = Point::new(cur.x.clamp(0.0, max.x), y.clamp(0.0, max.y));
                let state = ScrollState {
                    x: cur.x,
                    y: cur.y,
                    max_x: max.x,
                    max_y: max.y,
                    container: Some(ref_for(container)),
                };
                self.doc.record_scrolled(Some(container));
                Ok(state)
            }
            None => {
                let step = amount.unwrap_or(self.viewport.height);
                let max_y = (self.layout.content_height() - self.viewport.height).max(0.0);
                let dy = match direction {
                    ScrollDirection::Down => step,
                    ScrollDirection::Up => -step,
                    ScrollDirection::Top => -self.scroll.y,
                    ScrollDirection::Bottom => max_y - self.scroll.y,
                };
                Ok(self.scroll_viewport(dy))
            }
        }
    }

    /// Element scroll offset (containers).
    #[must_use]
    pub fn element_scroll(&self, id: NodeId) -> Point {
        self.element_scroll.get(&id).copied().unwrap_or_default()
    }

    /// `clickPoint`: hit test at viewport CSS pixels, then click.
    pub fn click_point(&mut self, x: f32, y: f32, button: MouseButton) -> Result<String> {
        self.update();
        let point = Point::new(x + self.scroll.x, y + self.scroll.y);
        let hit = self
            .layout
            .hit_test(point)
            .ok_or_else(|| Error::not_found(format!("nothing at ({x}, {y}) to click")))?;
        let target = if self.doc.element(hit).is_some() {
            hit
        } else {
            self.doc
                .parent(hit)
                .ok_or_else(|| Error::not_found(format!("nothing at ({x}, {y})")))?
        };
        if self.is_disabled(target) {
            return Err(Error::step_failed(format!(
                "{} at ({x}, {y}) is disabled",
                ref_for(target)
            )));
        }
        let detail = self.click_at_element(target, point, button)?;
        Ok(format!("hit {} at ({x}, {y}): {detail}", ref_for(target)))
    }

    /// `upload`: sets the file list of a file input.
    pub fn upload(&mut self, id: NodeId, files: &[String], timeout_ms: u64) -> Result<String> {
        self.actionable(id, timeout_ms)?;
        if self.input_type(id).as_deref() != Some("file") {
            return Err(Error::invalid_params(format!(
                "{} is not an <input type=file>",
                ref_for(id)
            )));
        }
        if files.len() > 1 && self.doc.attribute(id, "multiple").is_none() {
            return Err(Error::invalid_params(format!(
                "{} does not accept multiple files",
                ref_for(id)
            )));
        }
        let names: Vec<String> = files
            .iter()
            .map(|f| f.rsplit(['/', '\\']).next().unwrap_or(f).to_owned())
            .collect();
        self.files.insert(id, files.to_vec());
        let shown = names
            .first()
            .map(|n| format!("C:\\fakepath\\{n}"))
            .unwrap_or_default();
        self.doc.set_form_value(id, shown)?;
        self.focus(Some(id));
        Ok(format!("{} files={}", ref_for(id), names.join(", ")))
    }

    /// `screenshot` through the software renderer.
    pub fn screenshot(&mut self, full_page: bool) -> Result<Screenshot> {
        self.update();
        let renderer = self.renderer.get_or_insert_with(SoftwareRenderer::new);
        let shot = screenshot::capture(
            renderer,
            &self.layout,
            &self.style_tree,
            self.viewport,
            self.scroll,
            self.scale,
            full_page,
        )?;
        self.last_screenshot = Some(shot.clone());
        Ok(shot)
    }

    /// Completed responses for this page (through the loader).
    #[must_use]
    pub fn completed_responses(&self) -> Vec<ve_net::CompletedResponse> {
        self.loader
            .as_ref()
            .map(|l| l.completed(self.id))
            .unwrap_or_default()
    }

    /// Open dialogs (for the `dialog` op and observations).
    #[must_use]
    pub fn open_dialogs(&self) -> Vec<DialogEntry> {
        self.observe_now(&ObservationRequest {
            max_elements: 1,
            max_text_chars: 16,
            ..ObservationRequest::default()
        })
        .dialogs
    }
}

fn percent_decode(input: &str) -> String {
    let bytes = input.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%'
            && i + 2 < bytes.len()
            && let Ok(v) = u8::from_str_radix(&input[i + 1..i + 3], 16)
        {
            out.push(v);
            i += 3;
            continue;
        }
        out.push(bytes[i]);
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

#[derive(Clone, Copy, Debug)]
enum HistoryMode {
    Push,
    Replace,
    Refresh,
    Traverse(usize),
}

/// Scroll position after a scroll step.
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScrollState {
    /// Horizontal offset.
    pub x: f32,
    /// Vertical offset.
    pub y: f32,
    /// Maximum horizontal offset.
    pub max_x: f32,
    /// Maximum vertical offset.
    pub max_y: f32,
    /// The scrolled container's ref (`None` = viewport).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub container: Option<String>,
}

impl ScrollState {
    /// Whether the container is scrolled to its bottom.
    #[must_use]
    pub fn at_bottom(&self) -> bool {
        self.y >= self.max_y - 0.5
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

/// Current wall-clock time in Unix milliseconds (for `startedAt`).
#[must_use]
pub fn now_millis() -> u64 {
    unix_millis()
}
