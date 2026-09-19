//! Public facade for the Vector Engine.
//!
//! [`VectorEngine`] is the one handle embedders hold. It owns network
//! contexts ([`ContextId`] → `ve_net::NetworkContext`: cookies, cache,
//! [`NetworkPolicy`]) and pages ([`PageId`] → [`Page`]), and exposes the
//! operations that map one-to-one onto the C ABI in [`ffi`] and the Node
//! bindings in `ve-napi`:
//!
//! * [`VectorEngine::open`] — fetch → decode → streaming parse → cascade →
//!   layout → static-page classification; returns the page id plus the
//!   [`RoutingInfo`] the runtime's router consumes (architecture §11).
//! * [`VectorEngine::observe`] — `settle()` then the `ObservationContent`
//!   shape (architecture §5) with `changesSince` when `sinceRevision` is given.
//! * [`VectorEngine::execute`] — run an agent [`Program`] (architecture §6),
//!   optionally observing in the same round trip.
//! * [`VectorEngine::screenshot`] — PNG through the software renderer.
//! * Cookies per context (`BrowserCookie` shape, 1:1 with the driver type).
//!
//! Every operation also has a `*_json` twin that takes and returns JSON
//! strings — `{"ok":true,…}` on success, `{"ok":false,"error":{"code",
//! "message","detail"?}}` on failure where `code` is an exact
//! `VectorErrorCode` — so foreign-language bindings never need Rust types.
//!
//! # Features
//!
//! * `http` — real networking (hyper + rustls) for `http(s)` URLs. Without it
//!   only `file:` (policy-gated), `data:`, `about:` and inline HTML open.
//! * `quickjs` — the QuickJS-NG JavaScript backend (not used in M1).
//! * `gpu` — vello + wgpu rendering in `ve-gfx`.

#![deny(unsafe_op_in_unsafe_fn)]

pub mod ffi;
pub mod service;
pub mod shell;
pub mod updates;
pub mod window;

use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;
use std::time::Instant;

use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use ve_core::{Error, ErrorCode, Result, Size};
use ve_net::{Initiator, NetworkContext, Request};

pub use service::{BrowserClient, BrowserService, BrowserServiceListener, BrowserServicePump};
pub use shell::{
    ChromeAxNode, EventOutcome, KeyState, NativeBrowser, NativeController, NativeEvent, Tab,
    scene_json,
};
pub use window::{Browser, NativeWindow};
pub use updates::{UpdateKeyPair, verify_update_manifest};
pub use ve_agent::{
    EngineObservation, ExecuteRequest, ExecuteResult, Format, InFlightSummary, LoadedDocument,
    Loader, NavMethod, NavigationRequest, ObservationContent, ObservationRequest, Page, Program,
    ProgramResult, RoutingInfo, SETTLE_NAVIGATION_MS, SETTLE_STEP_MS, Scope, Screenshot, Settled,
    ShaperKind, StepOutcome,
};
pub use ve_core::{Clock, VERSION};
pub use ve_net::{BrowserCookie, ContextId, NetworkPolicy};

/// Start V8 before a production sandbox denies new threads.
pub fn preload_scripting() {
    #[cfg(feature = "v8")]
    ve_script::V8Vm::preload();
}

/// Create a VM and evaluate `1+1`. Used to prove production containment and
/// V8 initialization work together.
#[must_use]
pub fn scripting_selftest() -> bool {
    let mut vm = ve_script::default_vm();
    if vm.name() == "null" {
        return !cfg!(feature = "v8");
    }
    matches!(vm.eval("1 + 1", "vector:selftest"), Ok(v) if v.as_f64() == Some(2.0))
}

/// Production vs trusted-fixture developer execution (VEC-002).
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum SecurityProfile {
    /// Sandbox may be skipped; in-process execution is allowed.
    #[default]
    Developer,
    /// Missing host or sandbox is fatal. Untrusted content never runs in-process.
    Production,
}

/// How a browsing context is placed (VEC-001 / VEC-002).
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum IsolationMode {
    /// Use `ve-host` when present, otherwise an in-process thread.
    #[default]
    Auto,
    /// `ve-host` is required. Failure is `backend_unavailable`.
    RequireProcess,
    /// Always in-process (unit tests, trusted fixtures).
    InProcess,
}

/// Identifies an open page.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(transparent)]
pub struct PageId(pub u64);

/// The context every engine starts with (and `open()` uses when no context
/// is named).
pub const DEFAULT_CONTEXT: ContextId = ContextId(1);

/// Engine configuration.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct EngineConfig {
    /// Viewport used for new pages.
    pub viewport: Size,
    /// Device pixel ratio for screenshots and `viewport.scale`.
    pub scale: f32,
    /// `User-Agent` for network requests.
    pub user_agent: String,
    /// Refuse network schemes even when the `http` feature is compiled in.
    pub offline: bool,
    /// Maximum simultaneously open pages.
    pub max_pages: usize,
    /// Policy for the default context and for contexts created without one
    /// (`block_loopback` on, no allowlist, `file:` off).
    pub policy: NetworkPolicy,
    /// Attach a JavaScript VM to every page and run document scripts (plan
    /// A13). Needs the `v8` (or `quickjs`) feature to do anything; with
    /// neither the pages get the `NullVm` and scripts do not run.
    pub scripting: bool,
    /// When true, the engine uses [`ve_net::ReplayTransport`] and live sockets
    /// are never opened (VEC-024).
    pub hermetic: bool,
    /// Production fail-closed vs developer/fixture execution.
    pub security_profile: SecurityProfile,
    /// Process vs in-process placement. Production forces [`IsolationMode::RequireProcess`].
    pub isolation: IsolationMode,
    /// Extra DER certificates trusted by the production hyper+rustls transport
    /// (WPT/fixture HTTPS CAs). Empty in ordinary browsing.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub extra_tls_roots: Vec<Vec<u8>>,
    /// Layout text shaper. GUI / corpus / Speedometer use [`ShaperKind::System`].
    pub shaper: ShaperKind,
    /// Page clock. Goldens stay [`Clock::Virtual`]; `ve-shell --gui` uses Wall.
    pub clock: Clock,
}

impl Default for EngineConfig {
    fn default() -> Self {
        Self {
            viewport: ve_agent::DEFAULT_VIEWPORT,
            scale: 1.0,
            user_agent: ve_net::DEFAULT_USER_AGENT.to_owned(),
            offline: false,
            max_pages: 256,
            policy: NetworkPolicy::default(),
            scripting: false,
            hermetic: false,
            security_profile: SecurityProfile::Developer,
            isolation: IsolationMode::Auto,
            extra_tls_roots: Vec::new(),
            shaper: ShaperKind::Metric,
            clock: Clock::Virtual,
        }
    }
}

impl EngineConfig {
    /// Isolation actually used: production never falls back to in-process.
    #[must_use]
    pub fn effective_isolation(&self) -> IsolationMode {
        if self.security_profile == SecurityProfile::Production {
            IsolationMode::RequireProcess
        } else {
            self.isolation
        }
    }
}

/// What [`VectorEngine::open`] loads.
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct OpenRequest {
    /// URL to fetch (`http(s):` with the `http` feature; `file:` when the
    /// context's policy allows it; `data:`; `about:`). With `html` set this
    /// is the document's base URL instead.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    /// Inline markup (tests, recorded fixtures).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub html: Option<String>,
    /// Context to open in (default [`DEFAULT_CONTEXT`]).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context: Option<u64>,
    /// Viewport override.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub viewport: Option<Size>,
    /// Allow `evaluate` steps on this page (capability gating, §10). Only
    /// meaningful when the engine runs with `scripting`.
    #[serde(skip_serializing_if = "std::ops::Not::not")]
    pub allow_evaluate: bool,
    /// HTTP `Last-Modified` for inline HTML (WPT `.headers` sidecars).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_modified: Option<String>,
    /// HTTP `Content-Language` for inline HTML (WPT `.headers` sidecars).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content_language: Option<String>,
}

impl OpenRequest {
    /// Open a URL.
    pub fn url(url: impl Into<String>) -> Self {
        Self {
            url: Some(url.into()),
            ..Self::default()
        }
    }

    /// Open inline HTML with a base URL.
    pub fn html(html: impl Into<String>, url: Option<&str>) -> Self {
        Self {
            url: url.map(str::to_owned),
            html: Some(html.into()),
            ..Self::default()
        }
    }
}

/// Result of [`VectorEngine::open`]: the page plus the router's inputs.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OpenResult {
    /// The page.
    pub page: PageId,
    /// The context it lives in.
    pub context: ContextId,
    /// Final URL after redirects / `<meta refresh>`.
    pub url: String,
    /// Document title.
    pub title: String,
    /// HTTP status of the document response (200 for non-HTTP sources).
    pub status: u16,
    /// Document epoch (`generation`); refs belong to it.
    pub document_epoch: u64,
    /// DOM revision after load.
    pub revision: u64,
    /// Static-page classification (architecture §11).
    pub routing: RoutingInfo,
    /// The settle that completed the load.
    pub settled: Settled,
    /// Wall-clock milliseconds from request to settled.
    pub open_ms: u64,
}

/// Result of [`VectorEngine::observe`]: the engine observation stamped with
/// the page id. The runtime adds `observationId`, `pageId` (its own),
/// `observedAt` and `scope`.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Observation {
    /// The page.
    pub page: PageId,
    /// The observation.
    #[serde(flatten)]
    pub observation: EngineObservation,
}

/// Screenshot options.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct ScreenshotOptions {
    /// Capture the whole document instead of the viewport.
    pub full_page: bool,
}

/// [`Loader`] over a shared `ve-net` context.
struct NetLoader {
    net: Rc<RefCell<NetworkContext>>,
}

impl Loader for NetLoader {
    fn load(&mut self, request: &NavigationRequest) -> Result<LoadedDocument> {
        let mut req = match request.method {
            NavMethod::Get => Request::get(&request.url)?,
            NavMethod::Post => Request::post(
                &request.url,
                request.body.clone().unwrap_or_default(),
                request
                    .content_type
                    .as_deref()
                    .unwrap_or("application/x-www-form-urlencoded"),
            )?,
        };
        req = req
            .for_page(request.page)
            .with_initiator(Initiator::Navigation);
        if let Some(referrer) = &request.referrer
            && referrer.starts_with("http")
        {
            req = req.header("referer", referrer);
        }
        let response = self.net.borrow_mut().fetch(req)?;
        Ok(LoadedDocument {
            url: response.url.to_string(),
            bytes: response.body.to_vec(),
            content_type: response.content_type().map(str::to_owned),
            status: response.status.as_u16(),
            last_modified: response.last_modified().map(str::to_owned),
            content_language: response.content_language().map(str::to_owned),
            coop: ve_agent::CoopPolicy::parse_header(
                response
                    .headers
                    .get("cross-origin-opener-policy")
                    .and_then(|v| v.to_str().ok()),
            ),
            coep: ve_agent::CoepPolicy::parse_header(
                response
                    .headers
                    .get("cross-origin-embedder-policy")
                    .and_then(|v| v.to_str().ok()),
            ),
        })
    }

    /// One concurrent batch through `NetworkContext::fetch_many`
    /// (`Initiator::Parser`, kind-specific `Accept`), so a page's stylesheets,
    /// images and scripts share the transport's pooled connections.
    fn fetch_subresources(
        &mut self,
        requests: &[ve_agent::SubresourceRequest],
    ) -> Vec<Result<ve_agent::LoadedResource>> {
        let mut wire = Vec::with_capacity(requests.len());
        let mut failed: Vec<(usize, Error)> = Vec::new();
        for (i, r) in requests.iter().enumerate() {
            match Request::get(&r.url) {
                Ok(req) => {
                    let accept = match r.kind {
                        ve_agent::SubresourceKind::Stylesheet => "text/css,*/*;q=0.1",
                        ve_agent::SubresourceKind::Image => {
                            "image/avif,image/webp,image/apng,image/*,*/*;q=0.8"
                        }
                        ve_agent::SubresourceKind::Script => "*/*",
                        ve_agent::SubresourceKind::Font => "font/woff2,font/woff,*/*;q=0.1",
                        ve_agent::SubresourceKind::Document => "text/html,*/*;q=0.1",
                        ve_agent::SubresourceKind::Prefetch
                        | ve_agent::SubresourceKind::Preconnect => "*/*",
                    };
                    let mut req = req
                        .for_page(r.page)
                        .with_initiator(Initiator::Parser)
                        .header("accept", accept);
                    if let Some(referrer) = r.referrer.as_deref().filter(|u| u.starts_with("http"))
                    {
                        req = req.header("referer", referrer);
                    }
                    wire.push((i, req));
                }
                Err(e) => failed.push((i, e.into())),
            }
        }
        let responses = self
            .net
            .borrow_mut()
            .fetch_many(wire.iter().map(|(_, r)| r.clone()).collect());
        let mut out: Vec<Option<Result<ve_agent::LoadedResource>>> =
            (0..requests.len()).map(|_| None).collect();
        for ((i, _), response) in wire.into_iter().zip(responses) {
            out[i] = Some(
                response
                    .map_err(Error::from)
                    .map(|response| ve_agent::LoadedResource {
                        url: response.url.to_string(),
                        bytes: response.body.to_vec(),
                        content_type: response.content_type().map(str::to_owned),
                        status: response.status.as_u16(),
                        corp: response
                            .headers
                            .get("cross-origin-resource-policy")
                            .and_then(|v| v.to_str().ok())
                            .map(str::to_owned),
                    }),
            );
        }
        for (i, e) in failed {
            out[i] = Some(Err(e));
        }
        out.into_iter()
            .map(|r| r.unwrap_or_else(|| Err(Error::internal("subresource result missing"))))
            .collect()
    }

    fn preconnect(&mut self, urls: &[String]) {
        for url in urls {
            let _ = self.net.borrow().preconnect(url);
        }
    }

    fn in_flight(&self, page: u64) -> Vec<InFlightSummary> {
        self.net
            .borrow()
            .in_flight(Some(page))
            .into_iter()
            .map(|r| InFlightSummary {
                url: r.url.to_string(),
                age_ms: u64::try_from(r.issued_at.elapsed().as_millis()).unwrap_or(u64::MAX),
                background: r.background,
            })
            .collect()
    }

    fn completed(&self, page: u64) -> Vec<ve_net::CompletedResponse> {
        self.net
            .borrow()
            .completed(Some(page))
            .into_iter()
            .cloned()
            .collect()
    }

    fn script_fetch(
        &mut self,
        url: &str,
        method: &str,
        body: &[u8],
        page: u64,
        origin: Option<&str>,
    ) -> Result<ve_agent::LoadedResource> {
        let method = method.to_ascii_uppercase();
        let mut req = if method == "GET" || method == "HEAD" {
            Request::get(url)?
        } else {
            Request::post(url, body.to_vec(), "text/plain;charset=UTF-8")?
        };
        req = req.for_page(page).with_initiator(Initiator::Script);
        if let Some(origin) = origin
            && let Ok(parsed) = Request::get(origin)
        {
            req = req.with_origin(parsed.url);
        }
        let response = self.net.borrow_mut().fetch(req)?;
        Ok(ve_agent::LoadedResource {
            url: response.url.to_string(),
            bytes: response.body.to_vec(),
            content_type: response.content_type().map(str::to_owned),
            status: response.status.as_u16(),
            corp: response
                .headers
                .get("cross-origin-resource-policy")
                .and_then(|v| v.to_str().ok())
                .map(str::to_owned),
        })
    }
}

struct PageEntry {
    context: ContextId,
    page: Page,
}

/// The engine handle.
pub struct VectorEngine {
    config: EngineConfig,
    contexts: HashMap<ContextId, Rc<RefCell<NetworkContext>>>,
    pages: HashMap<PageId, PageEntry>,
    /// Live pages in creation order; Drop and close walk this newest-first.
    page_order: Vec<PageId>,
    /// Next page index for [`Self::pump_round_robin`].
    pump_cursor: usize,
    next_context: u64,
    next_page: u64,
    /// Shared wire owner (plan A21): contexts never hold a socket.
    broker: ve_net::NetworkBroker,
}

impl std::fmt::Debug for VectorEngine {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("VectorEngine")
            .field("contexts", &self.contexts.len())
            .field("pages", &self.pages.len())
            .field("config", &self.config)
            .finish_non_exhaustive()
    }
}

impl Default for VectorEngine {
    fn default() -> Self {
        Self::new(EngineConfig::default())
    }
}

impl Drop for VectorEngine {
    fn drop(&mut self) {
        while let Some(id) = self.page_order.pop() {
            drop(self.pages.remove(&id));
        }
        self.pages.clear();
    }
}

fn make_transport(config: &EngineConfig) -> Box<dyn ve_net::Transport> {
    if config.hermetic {
        return Box::new(ve_net::ReplayTransport::new());
    }
    if config.offline {
        return Box::new(ve_net::NullTransport);
    }
    #[cfg(feature = "http")]
    {
        match ve_net::HyperTransport::with_extra_roots(config.extra_tls_roots.clone()) {
            Ok(t) => return Box::new(t),
            Err(e) => tracing::warn!(error = %e, "hyper transport unavailable; running offline"),
        }
    }
    Box::new(ve_net::NullTransport)
}

fn no_such_page(page: PageId) -> Error {
    Error::not_found(format!("no such page {}", page.0))
}

fn no_such_context(context: ContextId) -> Error {
    Error::not_found(format!("no such context {}", context.0))
}

impl VectorEngine {
    /// Creates an engine with one default context.
    #[must_use]
    pub fn new(config: EngineConfig) -> Self {
        let transport = make_transport(&config);
        Self::with_transport(config, transport)
    }

    /// Creates an engine whose contexts share `transport` (plan A21: the
    /// parent broker, or an IPC callback in a context process).
    #[must_use]
    pub fn with_transport(config: EngineConfig, transport: Box<dyn ve_net::Transport>) -> Self {
        let broker = ve_net::NetworkBroker::with_policy(transport, config.policy.clone(), 0);
        let mut engine = Self {
            config,
            contexts: HashMap::new(),
            pages: HashMap::new(),
            page_order: Vec::new(),
            pump_cursor: 0,
            next_context: 0,
            next_page: 0,
            broker,
        };
        engine.new_context(None);
        engine
    }

    /// Hermetic engine: live sockets never open (VEC-024).
    #[must_use]
    pub fn with_replay(config: EngineConfig, replay: ve_net::ReplayTransport) -> Self {
        let mut config = config;
        config.hermetic = true;
        Self::with_transport(config, Box::new(replay))
    }

    /// Engine version.
    #[must_use]
    pub fn version() -> &'static str {
        VERSION
    }

    /// Configuration.
    #[must_use]
    pub fn config(&self) -> &EngineConfig {
        &self.config
    }

    // ---- contexts -----------------------------------------------------------

    fn build_context(&self, id: ContextId, policy: Option<NetworkPolicy>) -> NetworkContext {
        let mut net = NetworkContext::new(id, Box::new(self.broker.clone()))
            .with_policy(policy.unwrap_or_else(|| self.config.policy.clone()));
        self.config.user_agent.clone_into(&mut net.user_agent);
        net
    }

    /// Creates a context (cookies, cache, policy). Costs one struct and an
    /// empty jar (architecture §8).
    pub fn new_context(&mut self, policy: Option<NetworkPolicy>) -> ContextId {
        self.next_context += 1;
        let id = ContextId(self.next_context);
        let net = self.build_context(id, policy);
        self.contexts.insert(id, Rc::new(RefCell::new(net)));
        id
    }

    /// Frees a context and closes its pages. Returns `true` if it existed.
    pub fn free_context(&mut self, context: ContextId) -> bool {
        if self.contexts.remove(&context).is_none() {
            return false;
        }
        let ids: Vec<PageId> = self
            .page_order
            .iter()
            .copied()
            .filter(|id| self.pages.get(id).is_some_and(|e| e.context == context))
            .collect();
        for id in ids.into_iter().rev() {
            self.page_order.retain(|p| *p != id);
            drop(self.pages.remove(&id));
        }
        true
    }

    /// Context ids in creation order.
    #[must_use]
    pub fn contexts(&self) -> Vec<ContextId> {
        let mut ids: Vec<ContextId> = self.contexts.keys().copied().collect();
        ids.sort_by_key(|c| c.0);
        ids
    }

    fn context(
        &mut self,
        context: Option<u64>,
    ) -> Result<(ContextId, Rc<RefCell<NetworkContext>>)> {
        let id = context.map_or(DEFAULT_CONTEXT, ContextId);
        if let Some(net) = self.contexts.get(&id) {
            return Ok((id, net.clone()));
        }
        if id == DEFAULT_CONTEXT {
            // The default context was freed: recreate it lazily.
            let net = Rc::new(RefCell::new(self.build_context(id, None)));
            self.contexts.insert(id, net.clone());
            return Ok((id, net));
        }
        Err(no_such_context(id))
    }

    /// The shared network context (cookies, cache, policy).
    pub fn network(&self, context: ContextId) -> Result<Rc<RefCell<NetworkContext>>> {
        self.contexts
            .get(&context)
            .cloned()
            .ok_or_else(|| no_such_context(context))
    }

    /// All cookies of a context in the driver's `BrowserCookie` shape.
    pub fn cookies(&self, context: ContextId) -> Result<Vec<BrowserCookie>> {
        Ok(self.network(context)?.borrow().cookies.export())
    }

    /// Imports cookies into a context; returns how many were stored.
    pub fn set_cookies(
        &mut self,
        context: ContextId,
        cookies: Vec<BrowserCookie>,
    ) -> Result<usize> {
        Ok(self.network(context)?.borrow_mut().cookies.import(cookies))
    }

    /// Clears a context's cookies.
    pub fn clear_cookies(&mut self, context: ContextId) -> Result<()> {
        self.network(context)?.borrow_mut().cookies.clear();
        Ok(())
    }

    // ---- pages --------------------------------------------------------------

    /// Opens a page: fetch → decode → parse → cascade → layout → classify,
    /// then `settle()` (which also follows immediate `<meta refresh>`).
    pub fn open(&mut self, request: OpenRequest) -> Result<OpenResult> {
        let start = Instant::now();
        if self.pages.len() >= self.config.max_pages {
            return Err(Error::coded(
                ErrorCode::Conflict,
                format!("page limit of {} reached", self.config.max_pages),
            ));
        }
        let (context, net) = self.context(request.context)?;
        let viewport = request.viewport.unwrap_or(self.config.viewport);
        let id = self.next_page + 1;
        let policy = net.borrow().policy.clone();
        let loader: Box<dyn Loader> = Box::new(NetLoader { net: net.clone() });
        let scripting = self
            .config
            .scripting
            .then(|| (ve_script::default_vm(), request.allow_evaluate))
            .filter(|(vm, _)| vm.name() != "null");
        let mut page = match (&request.html, &request.url) {
            (Some(html), url) => {
                let mut page = Page::from_html_with_loader(
                    id,
                    html,
                    url.as_deref(),
                    viewport,
                    scripting,
                    Some(loader),
                )?;
                if let Some(lm) = request.last_modified.clone() {
                    page.set_last_modified(lm);
                }
                if let Some(cl) = request.content_language.clone() {
                    page.set_content_language(cl);
                }
                page
            }
            (None, Some(url)) => Page::open_with(id, loader, url, viewport, scripting)?,
            (None, None) => {
                return Err(Error::invalid_params("open needs `url` or `html`"));
            }
        };
        page.set_scale(self.config.scale);
        page.set_shaper(self.config.shaper);
        page.set_clock(self.config.clock);
        page.set_network_policy(policy);
        let settled = page.settle_passive(SETTLE_NAVIGATION_MS);
        if let Some(error) = page.take_navigation_error() {
            tracing::warn!(page = id, error, "post-load navigation failed");
        }
        self.next_page = id;
        let page_id = PageId(id);
        let result = OpenResult {
            page: page_id,
            context,
            url: page.url().to_owned(),
            title: page.title(),
            status: page.status(),
            document_epoch: u64::from(page.generation()),
            revision: page.document().revision().0,
            routing: page.routing().clone(),
            settled,
            open_ms: u64::try_from(start.elapsed().as_millis()).unwrap_or(u64::MAX),
        };
        tracing::info!(page = id, url = %result.url, route = %result.routing.route_reason, "opened");
        self.page_order.push(page_id);
        self.pages.insert(page_id, PageEntry { context, page });
        Ok(result)
    }

    /// Closes a page. Returns `true` if it was open.
    pub fn close(&mut self, page: PageId) -> bool {
        self.page_order.retain(|id| *id != page);
        self.pages.remove(&page).is_some()
    }

    /// Open page ids.
    #[must_use]
    pub fn pages(&self) -> Vec<PageId> {
        let mut ids: Vec<PageId> = self.pages.keys().copied().collect();
        ids.sort();
        ids
    }

    /// Borrows a page.
    pub fn page(&self, page: PageId) -> Result<&Page> {
        self.pages
            .get(&page)
            .map(|e| &e.page)
            .ok_or_else(|| no_such_page(page))
    }

    /// Mutably borrows a page.
    pub fn page_mut(&mut self, page: PageId) -> Result<&mut Page> {
        self.pages
            .get_mut(&page)
            .map(|e| &mut e.page)
            .ok_or_else(|| no_such_page(page))
    }

    /// One host tick of event-loop work: a bounded slice per page, starting
    /// at `pump_cursor` and wrapping `page_order`, so a busy page cannot
    /// starve a sibling forever.
    pub fn pump_round_robin(&mut self, tasks_per_page: usize) {
        let n = self.page_order.len();
        if n == 0 || tasks_per_page == 0 {
            return;
        }
        let start = self.pump_cursor % n;
        for i in 0..n {
            let id = self.page_order[(start + i) % n];
            if let Some(entry) = self.pages.get_mut(&id) {
                let _ = entry.page.pump_event_loop(tasks_per_page);
            }
        }
        self.pump_cursor = start.wrapping_add(1);
    }

    /// The context a page belongs to.
    pub fn context_of(&self, page: PageId) -> Result<ContextId> {
        self.pages
            .get(&page)
            .map(|e| e.context)
            .ok_or_else(|| no_such_page(page))
    }

    /// Observes a page: `settle()`, then the `ObservationContent` shape.
    pub fn observe(&mut self, page: PageId, request: &ObservationRequest) -> Result<Observation> {
        let observation = self.page_mut(page)?.observe(request)?;
        Ok(Observation { page, observation })
    }

    /// Executes a program against a page (optionally observing after).
    pub fn execute(&mut self, page: PageId, request: &ExecuteRequest) -> Result<ExecuteResult> {
        let p = self.page_mut(page)?;
        Ok(p.execute_with_observation(&request.program, request.return_observation.as_ref()))
    }

    /// Screenshots a page as PNG.
    pub fn screenshot(&mut self, page: PageId, options: &ScreenshotOptions) -> Result<Screenshot> {
        self.page_mut(page)?.screenshot(options.full_page)
    }

    // ---- JSON string API (used by the C ABI and Node bindings) -------------

    fn json_result(result: Result<Value>) -> String {
        match result {
            Ok(mut value) => {
                if let Some(obj) = value.as_object_mut() {
                    obj.insert("ok".into(), Value::Bool(true));
                    value.to_string()
                } else {
                    json!({ "ok": true, "result": value }).to_string()
                }
            }
            Err(e) => Self::json_error(&e),
        }
    }

    /// `{"ok":false,"error":{"code","message","detail"?}}`.
    #[must_use]
    pub fn json_error(error: &Error) -> String {
        json!({ "ok": false, "error": error.payload() }).to_string()
    }

    fn parse_json<T: for<'de> Deserialize<'de> + Default>(json: &str, what: &str) -> Result<T> {
        if json.trim().is_empty() {
            return Ok(T::default());
        }
        serde_json::from_str(json).map_err(|e| Error::invalid_params(format!("{what}: {e}")))
    }

    /// [`Self::open`] with a JSON [`OpenRequest`]. Returns
    /// `{"ok":true,"page":N,"context":C,"url","title","status","documentEpoch","revision","routing":{…},"settled":{…},"openMs"}`.
    pub fn open_json(&mut self, request_json: &str) -> String {
        Self::json_result((|| {
            let request: OpenRequest = Self::parse_json(request_json, "open request")?;
            Ok(serde_json::to_value(self.open(request)?)?)
        })())
    }

    /// [`Self::observe`] with a JSON `ObservationRequest` (`{}` or empty allowed).
    /// Returns `{"ok":true,"page":N,"content":{…},"revision","documentEpoch","changesSince"?,"delta"?,"settled":{…}}`.
    pub fn observe_json(&mut self, page: u64, request_json: &str) -> String {
        Self::json_result((|| {
            let request: ObservationRequest =
                Self::parse_json(request_json, "observation request")?;
            Ok(serde_json::to_value(self.observe(PageId(page), &request)?)?)
        })())
    }

    /// [`Self::execute`] with a JSON program (`{program, returnObservation?}`,
    /// a `ProgramSchema` object, or a bare step array). Returns
    /// `{"ok":true,"result":{status,steps,extracted?,error?},"observation"?:{…}}`.
    pub fn execute_json(&mut self, page: u64, request_json: &str) -> String {
        Self::json_result((|| {
            let request = ExecuteRequest::from_json(request_json)?;
            Ok(serde_json::to_value(self.execute(PageId(page), &request)?)?)
        })())
    }

    /// [`Self::screenshot`] with JSON options (`{"fullPage":bool}`). Returns
    /// `{"ok":true,"width","height","scale","fullPage","format":"png","bytes","pngBase64"}`.
    pub fn screenshot_json(&mut self, page: u64, options_json: &str) -> String {
        Self::json_result((|| {
            let options: ScreenshotOptions = Self::parse_json(options_json, "screenshot options")?;
            Ok(self.screenshot(PageId(page), &options)?.to_json())
        })())
    }

    /// [`Self::new_context`] with a JSON `NetworkPolicy` (empty → engine
    /// default). Returns `{"ok":true,"context":N}`.
    pub fn new_context_json(&mut self, policy_json: &str) -> String {
        Self::json_result((|| {
            let policy = if policy_json.trim().is_empty() || policy_json.trim() == "null" {
                None
            } else {
                Some(
                    serde_json::from_str::<NetworkPolicy>(policy_json)
                        .map_err(|e| Error::invalid_params(format!("network policy: {e}")))?,
                )
            };
            Ok(json!({ "context": self.new_context(policy) }))
        })())
    }

    /// [`Self::cookies`] as `{"ok":true,"cookies":[BrowserCookie…]}`.
    pub fn cookies_json(&self, context: u64) -> String {
        Self::json_result(
            self.cookies(ContextId(context))
                .map(|cookies| json!({ "cookies": cookies })),
        )
    }

    /// [`Self::set_cookies`] from a JSON array (or `{"cookies":[…]}`).
    /// Returns `{"ok":true,"imported":N}`.
    pub fn set_cookies_json(&mut self, context: u64, cookies_json: &str) -> String {
        Self::json_result((|| {
            let value: Value = serde_json::from_str(cookies_json)
                .map_err(|e| Error::invalid_params(format!("cookies: {e}")))?;
            let list = match value {
                Value::Array(_) => value,
                Value::Object(mut obj) => obj.remove("cookies").ok_or_else(|| {
                    Error::invalid_params("cookies: expected an array or {\"cookies\": […]}")
                })?,
                _ => return Err(Error::invalid_params("cookies: expected an array")),
            };
            let cookies: Vec<BrowserCookie> = serde_json::from_value(list)
                .map_err(|e| Error::invalid_params(format!("cookies: {e}")))?;
            Ok(json!({ "imported": self.set_cookies(ContextId(context), cookies)? }))
        })())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn offline() -> VectorEngine {
        VectorEngine::new(EngineConfig {
            offline: true,
            ..EngineConfig::default()
        })
    }

    #[test]
    fn open_observe_execute_round_trip() {
        let mut engine = offline();
        let opened = engine
            .open(OpenRequest::html(
                "<title>Hi</title><label for=n>Name</label><input id=n><button>Send</button>",
                Some("https://example.test/"),
            ))
            .unwrap();
        assert_eq!(opened.title, "Hi");
        assert_eq!(opened.context, DEFAULT_CONTEXT);
        assert!(
            !opened.routing.requires_script,
            "{}",
            opened.routing.route_reason
        );
        assert!(opened.settled.settled);
        let page = opened.page;

        let obs = engine
            .observe(page, &ObservationRequest::default())
            .unwrap();
        assert_eq!(obs.page, page);
        assert_eq!(obs.observation.document_epoch, opened.document_epoch);
        let field = obs
            .observation
            .content
            .form_fields
            .iter()
            .find(|f| f.label.as_deref() == Some("Name"))
            .expect("labelled field");
        let program = Program::from_json(&format!(
            r##"[{{"id":"s1","op":"fill","target":"{}","value":"Ada"}},
                 {{"id":"s2","op":"extract","fields":[{{"name":"v","selector":"#n","attribute":"value"}}]}}]"##,
            field.reference
        ))
        .unwrap();
        let executed = engine
            .execute(
                page,
                &ExecuteRequest {
                    program,
                    return_observation: Some(ObservationRequest {
                        since_revision: Some(obs.observation.revision),
                        ..ObservationRequest::default()
                    }),
                },
            )
            .unwrap();
        assert!(executed.result.ok(), "{:?}", executed.result.error);
        assert_eq!(executed.result.extracted.as_ref().unwrap()["v"], "Ada");
        let after = executed.observation.expect("returnObservation");
        assert!(after.revision > obs.observation.revision);
        let changes = after.changes_since.expect("changesSince");
        assert!(
            changes.iter().any(|c| c.contains("Ada")),
            "changesSince should mention the new value: {changes:?}"
        );

        let data = engine
            .open(OpenRequest::url("data:text/html,<h1>Data</h1>"))
            .unwrap();
        assert_eq!(engine.pages(), vec![page, data.page]);
        assert!(
            engine
                .observe(data.page, &ObservationRequest::default())
                .unwrap()
                .observation
                .content
                .headings
                .contains(&"Data".to_owned())
        );
        assert!(engine.close(data.page) && !engine.close(data.page));
        assert_eq!(
            engine
                .observe(data.page, &ObservationRequest::default())
                .unwrap_err()
                .code(),
            ErrorCode::NotFound
        );
    }

    #[test]
    fn contexts_isolate_cookies_and_close_their_pages() {
        let mut engine = offline();
        let ctx = engine.new_context(Some(NetworkPolicy::permissive()));
        assert_ne!(ctx, DEFAULT_CONTEXT);
        let cookie = BrowserCookie {
            name: "sid".into(),
            value: "42".into(),
            domain: "example.test".into(),
            path: "/".into(),
            secure: true,
            http_only: true,
            same_site: Some("Lax".into()),
            expires: None,
        };
        assert_eq!(engine.set_cookies(ctx, vec![cookie.clone()]).unwrap(), 1);
        assert_eq!(engine.cookies(ctx).unwrap(), vec![cookie]);
        assert!(engine.cookies(DEFAULT_CONTEXT).unwrap().is_empty());

        let page = engine
            .open(OpenRequest {
                html: Some("<p>x</p>".into()),
                context: Some(ctx.0),
                ..OpenRequest::default()
            })
            .unwrap()
            .page;
        assert_eq!(engine.context_of(page).unwrap(), ctx);
        assert!(engine.free_context(ctx));
        assert!(!engine.free_context(ctx));
        assert_eq!(engine.page(page).unwrap_err().code(), ErrorCode::NotFound);
        assert_eq!(engine.cookies(ctx).unwrap_err().code(), ErrorCode::NotFound);
        // The default context is recreated lazily if freed.
        assert!(engine.free_context(DEFAULT_CONTEXT));
        assert!(engine.open(OpenRequest::html("<p>y</p>", None)).is_ok());
    }

    #[test]
    fn file_urls_follow_the_context_policy() {
        let dir = std::env::temp_dir().join(format!("ve-api-file-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let path = dir.join("page.html");
        std::fs::write(
            &path,
            "<!doctype html><meta charset=utf-8><title>Fixture</title><h1>Héllo</h1><a href=next.html>Next</a>",
        )
        .unwrap();
        let url = url::Url::from_file_path(&path).unwrap().to_string();

        let mut engine = offline();
        let blocked = engine.open(OpenRequest::url(&url)).unwrap_err();
        assert_eq!(blocked.code(), ErrorCode::InvalidParams, "{blocked}");

        let mut engine = VectorEngine::new(EngineConfig {
            offline: true,
            policy: NetworkPolicy::permissive(),
            ..EngineConfig::default()
        });
        let opened = engine.open(OpenRequest::url(&url)).unwrap();
        assert_eq!(opened.title, "Fixture");
        assert_eq!(opened.status, 200);
        assert_eq!(opened.url, url);
        let obs = engine
            .observe(opened.page, &ObservationRequest::default())
            .unwrap();
        assert_eq!(obs.observation.content.headings, vec!["Héllo".to_owned()]);
        let link = &obs.observation.content.links[0];
        assert!(link.href.ends_with("/next.html"), "{}", link.href);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn allowlisted_loopback_reaches_the_broker() {
        let mock = ve_net::MockTransport::new();
        mock.respond(
            "http://127.0.0.1:4810/records",
            200,
            &[("content-type", "text/html;charset=utf-8")],
            "<title>Records</title><h1>ok</h1>",
        );
        let mut engine = VectorEngine::with_transport(
            EngineConfig {
                policy: NetworkPolicy {
                    allowlist: vec!["127.0.0.1:4810".into()],
                    ..NetworkPolicy::default()
                },
                ..EngineConfig::default()
            },
            Box::new(mock),
        );
        let opened = engine
            .open(OpenRequest::url("http://127.0.0.1:4810/records"))
            .unwrap();
        assert_eq!(opened.title, "Records");
        assert_eq!(opened.status, 200);
    }

    #[test]
    fn default_broker_policy_blocks_loopback() {
        let mock = ve_net::MockTransport::new();
        mock.respond(
            "http://127.0.0.1:4810/records",
            200,
            &[("content-type", "text/html;charset=utf-8")],
            "<title>Records</title>",
        );
        let mut engine = VectorEngine::with_transport(EngineConfig::default(), Box::new(mock));
        let err = engine
            .open(OpenRequest::url("http://127.0.0.1:4810/records"))
            .unwrap_err();
        let msg = err.to_string();
        assert!(msg.contains("loopback"), "{msg}");
    }

    #[test]
    fn json_api_wraps_results_and_coded_errors() {
        let mut engine = offline();
        let opened: Value =
            serde_json::from_str(&engine.open_json(r#"{"html": "<p>x</p><button>Go</button>"}"#))
                .unwrap();
        assert_eq!(opened["ok"], true);
        assert_eq!(opened["routing"]["routeReason"], "static");
        let page = opened["page"].as_u64().unwrap();

        let observed: Value = serde_json::from_str(
            &engine.observe_json(page, r#"{"format": "full", "scope": "full"}"#),
        )
        .unwrap();
        assert_eq!(observed["ok"], true);
        assert_eq!(observed["page"], page);
        assert!(observed["content"]["stats"]["approxTokens"].is_number());
        assert!(observed["settled"]["settled"].as_bool().unwrap());

        let executed: Value = serde_json::from_str(&engine.execute_json(
            page,
            r#"{"program":[{"id":"a","op":"scroll","direction":"down"}],"returnObservation":true}"#,
        ))
        .unwrap();
        assert_eq!(executed["ok"], true);
        assert_eq!(executed["result"]["status"], "completed");
        assert_eq!(executed["result"]["steps"][0]["status"], "ok");
        assert!(executed["observation"]["content"].is_object());

        let shot: Value = serde_json::from_str(&engine.screenshot_json(page, "")).unwrap();
        assert_eq!(shot["ok"], true);
        assert_eq!(shot["format"], "png");
        assert!(
            shot["pngBase64"]
                .as_str()
                .unwrap()
                .starts_with("iVBORw0KGgo")
        );

        let missing: Value = serde_json::from_str(&engine.execute_json(999, "[]")).unwrap();
        assert_eq!(missing["ok"], false);
        assert_eq!(missing["error"]["code"], "not_found");
        let bad: Value = serde_json::from_str(&engine.open_json("not json")).unwrap();
        assert_eq!(bad["error"]["code"], "invalid_params");
        let neither: Value = serde_json::from_str(&engine.open_json("{}")).unwrap();
        assert_eq!(neither["error"]["code"], "invalid_params");
        let offline: Value =
            serde_json::from_str(&engine.open_json(r#"{"url": "https://example.test/"}"#)).unwrap();
        assert_eq!(offline["error"]["code"], "backend_unavailable");
        let unsupported: Value = serde_json::from_str(
            &engine.execute_json(page, r#"[{"id":"e","op":"evaluate","expression":"1+1"}]"#),
        )
        .unwrap();
        assert_eq!(unsupported["result"]["status"], "failed");
        assert_eq!(
            unsupported["result"]["steps"][0]["error"]["code"],
            "capability_unsupported"
        );

        let ctx: Value =
            serde_json::from_str(&engine.new_context_json(r#"{"blockLoopback": false}"#)).unwrap();
        let ctx = ctx["context"].as_u64().unwrap();
        let set: Value = serde_json::from_str(&engine.set_cookies_json(
            ctx,
            r#"[{"name":"a","value":"1","domain":"x.test","path":"/","secure":false,"httpOnly":false}]"#,
        ))
        .unwrap();
        assert_eq!(set["imported"], 1);
        let got: Value = serde_json::from_str(&engine.cookies_json(ctx)).unwrap();
        assert_eq!(got["cookies"][0]["name"], "a");
        let bad_ctx: Value = serde_json::from_str(&engine.cookies_json(777)).unwrap();
        assert_eq!(bad_ctx["error"]["code"], "not_found");
    }

    #[cfg(feature = "v8")]
    #[test]
    fn closing_an_older_scripted_page_does_not_panic() {
        let mut engine = VectorEngine::new(EngineConfig {
            offline: true,
            scripting: true,
            ..EngineConfig::default()
        });
        let a = engine
            .open(OpenRequest::html("<p>one</p>", Some("https://a.test/")))
            .unwrap();
        let b = engine
            .open(OpenRequest::html("<p>two</p>", Some("https://b.test/")))
            .unwrap();
        assert!(engine.close(a.page));
        assert!(
            engine
                .observe(b.page, &ObservationRequest::default())
                .is_ok()
        );
        assert!(engine.close(b.page));
    }

    #[test]
    fn concurrent_pages_do_not_share_scroll_or_block_each_other() {
        let mut engine = offline();
        let a = engine
            .open(OpenRequest::html(
                "<div style='height:4000px'>a</div>",
                Some("https://a.test/"),
            ))
            .unwrap();
        let b = engine
            .open(OpenRequest::html(
                "<title>idle</title><p>idle</p>",
                Some("https://b.test/"),
            ))
            .unwrap();
        engine
            .execute(
                a.page,
                &ExecuteRequest {
                    program: Program::from_value(serde_json::json!([
                        {"id":"s","op":"scroll","direction":"down"}
                    ]))
                    .unwrap(),
                    return_observation: None,
                },
            )
            .unwrap();
        let obs_b = engine
            .observe(b.page, &ObservationRequest::default())
            .unwrap();
        assert_eq!(obs_b.observation.content.title, "idle");
        let obs_a = engine
            .observe(a.page, &ObservationRequest::default())
            .unwrap();
        assert!(
            obs_a.observation.content.scroll.y > obs_b.observation.content.scroll.y
                || obs_a.page != obs_b.page
        );
        // A tight loop of work on A still lets B observe. Script timers are
        // bounded by settle; without a JS VM this loop is the analogue.
        engine.pump_round_robin(8);
        for i in 0..4 {
            engine
                .execute(
                    a.page,
                    &ExecuteRequest {
                        program: Program::from_value(serde_json::json!([
                            {"id": format!("s{i}"), "op": "scroll", "direction": "down"}
                        ]))
                        .unwrap(),
                        return_observation: None,
                    },
                )
                .unwrap();
            let idle = engine
                .observe(b.page, &ObservationRequest::default())
                .unwrap();
            assert_eq!(idle.observation.content.title, "idle");
        }
        assert!(engine.close(a.page));
        assert!(engine.close(b.page));
    }

    #[test]
    fn hermetic_mode_blocks_unarchived_http() {
        let mut engine = VectorEngine::new(EngineConfig {
            hermetic: true,
            ..EngineConfig::default()
        });
        let err = engine
            .open(OpenRequest::url("https://example.test/secret"))
            .unwrap_err();
        assert_eq!(err.code(), ErrorCode::InvalidParams, "{err}");
        assert!(
            err.to_string().contains("replay") || err.to_string().contains("nondeterminism"),
            "{err}"
        );
    }

    #[test]
    fn hermetic_replay_serves_archived_get() {
        let mut replay = ve_net::ReplayTransport::new();
        replay.insert(
            "GET",
            "https://archive.test/",
            ve_net::Response::new(
                url::Url::parse("https://archive.test/").unwrap(),
                http::StatusCode::OK,
                http::header::HeaderMap::new(),
                "<title>Archived</title><h1>ok</h1>",
            ),
        );
        let mut engine = VectorEngine::with_replay(
            EngineConfig {
                policy: NetworkPolicy::permissive(),
                ..EngineConfig::default()
            },
            replay,
        );
        let opened = engine
            .open(OpenRequest::url("https://archive.test/"))
            .unwrap();
        assert_eq!(opened.title, "Archived");
        assert_eq!(opened.status, 200);
    }
}
