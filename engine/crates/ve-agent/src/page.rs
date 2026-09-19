//! [`Page`]: one document with its style/layout state, history, scroll and
//! focus, the in-engine action semantics of architecture §6, `settle()`, and
//! `observe()`.

use std::collections::{HashMap, HashSet, VecDeque};
use std::time::Instant;

use serde::{Deserialize, Serialize};
use ve_a11y::{
    DialogEntry, Format, LabelIndex, ObservationContent, ObservationDelta, ObservationRequest,
    ObserveInput, Role, Scope, Visibility5, changes_between, compute_name_with, observe, parse_ref,
    parse_ref_parts, ref_for,
};
use ve_core::{Error, ErrorCode, NodeId, Point, Rect, Result, Size, Stage};
use ve_dom::{DirtyFlags, Document, Namespace, Node, NodeKind};
use ve_gfx::{ImageCache, ImageHandle, SoftwareRenderer};
use ve_html::DocumentMeta;
use ve_layout::{LayoutEngine, LayoutTree, ParleyShaper};
use ve_style::{BackgroundImage, FontFaceSrc, StyleEngine, StyleTree};

use crate::forms::{self, Enctype, FormMethod};
use crate::keys::{Chord, Key};
use crate::routing::{CssCoverage, RoutingInfo, classify};
use crate::screenshot::{self, Screenshot};
use crate::steps::{MouseButton, ScrollDirection, Settled};
use crate::target::TargetSpec;

/// Gate E restyle counters for one attribution window.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct RestyleAttribution {
    /// `Page::update` restyle passes in this window.
    pub calls: u32,
    /// Those passes that used a full document compute.
    pub full_calls: u32,
    /// Elements recomputed on the last restyle.
    pub last_recomputed: usize,
    /// The last restyle used the full `compute()` path.
    pub last_full: bool,
    /// Mutation journal entries retained after the window.
    pub journal_len: usize,
    /// `Page::update` layout passes in this window.
    pub layout_calls: u32,
}

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
    /// HTTP `Last-Modified` header, if any.
    pub last_modified: Option<String>,
    /// HTTP `Content-Language` header, if any.
    pub content_language: Option<String>,
    /// `Cross-Origin-Opener-Policy` (H3-4).
    pub coop: CoopPolicy,
    /// `Cross-Origin-Embedder-Policy` (H3-4).
    pub coep: CoepPolicy,
}

impl LoadedDocument {
    /// Wraps already-decoded HTML.
    pub fn html(url: impl Into<String>, html: &str) -> Self {
        Self {
            url: url.into(),
            bytes: html.as_bytes().to_vec(),
            content_type: Some("text/html; charset=utf-8".into()),
            status: 200,
            last_modified: None,
            content_language: None,
            coop: CoopPolicy::UnsafeNone,
            coep: CoepPolicy::UnsafeNone,
        }
    }
}

/// `Cross-Origin-Opener-Policy`.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum CoopPolicy {
    /// Default: document can share a browsing context group.
    #[default]
    UnsafeNone,
    /// Isolate this document from cross-origin openers.
    SameOrigin,
    /// Isolate except same-origin popups with `unsafe-none`.
    SameOriginAllowPopups,
}

/// `Cross-Origin-Embedder-Policy`.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum CoepPolicy {
    /// Default: no embedder isolation.
    #[default]
    UnsafeNone,
    /// Require CORP / CORS on cross-origin subresources.
    RequireCorp,
    /// Cross-origin no-cors requests are sent without credentials.
    Credentialless,
}

impl CoopPolicy {
    /// Parse a response header value (`None` → default).
    #[must_use]
    pub fn parse_header(value: Option<&str>) -> Self {
        value.map(Self::parse).unwrap_or_default()
    }

    fn parse(value: &str) -> Self {
        let v = value.split(';').next().unwrap_or("").trim();
        if v.eq_ignore_ascii_case("same-origin") {
            Self::SameOrigin
        } else if v.eq_ignore_ascii_case("same-origin-allow-popups") {
            Self::SameOriginAllowPopups
        } else {
            Self::UnsafeNone
        }
    }
}

impl CoepPolicy {
    /// Parse a response header value (`None` → default).
    #[must_use]
    pub fn parse_header(value: Option<&str>) -> Self {
        value.map(Self::parse).unwrap_or_default()
    }

    fn parse(value: &str) -> Self {
        let v = value.split(';').next().unwrap_or("").trim();
        if v.eq_ignore_ascii_case("require-corp") {
            Self::RequireCorp
        } else if v.eq_ignore_ascii_case("credentialless") {
            Self::Credentialless
        } else {
            Self::UnsafeNone
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

/// What kind of subresource the parser found (drives `Accept` and priority).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SubresourceKind {
    /// `<link rel=stylesheet>` or `@import`.
    Stylesheet,
    /// `<img src>`.
    Image,
    /// `<script src>`.
    Script,
    /// `@font-face src`.
    Font,
    /// `<iframe>` / `<frame>` document (same-origin, plan A16).
    Document,
}

/// A subresource fetch the page asks its [`Loader`] for.
#[derive(Clone, Debug)]
pub struct SubresourceRequest {
    /// Absolute URL.
    pub url: String,
    /// Kind.
    pub kind: SubresourceKind,
    /// Page id for attribution (feeds `settle()`'s in-flight table).
    pub page: u64,
    /// The document URL.
    pub referrer: Option<String>,
}

/// A fetched subresource.
#[derive(Clone, Debug)]
pub struct LoadedResource {
    /// Final URL.
    pub url: String,
    /// Raw bytes (already content-decoded).
    pub bytes: Vec<u8>,
    /// `Content-Type`.
    pub content_type: Option<String>,
    /// HTTP status.
    pub status: u16,
}

/// A script the parser found, external (fetched) or inline. Kept on the page
/// in document order for the script layer.
#[derive(Clone, Debug)]
pub struct FetchedScript {
    /// The `<script>` element.
    pub node: NodeId,
    /// `src` after resolution (None for inline).
    pub url: Option<String>,
    /// Source text (empty when the fetch failed).
    pub source: String,
    /// `type=module`.
    pub module: bool,
    /// `defer` attribute.
    pub defer: bool,
    /// `async` attribute.
    pub async_: bool,
    /// The fetch failed (status or transport); `source` is empty.
    pub failed: bool,
}

/// Counters for one document load (subresource pipeline, plan A11).
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct LoadStats {
    /// Stylesheets fetched (`<link>` and `@import`).
    pub stylesheets: usize,
    /// Images whose natural size was decoded.
    pub images: usize,
    /// External scripts fetched.
    pub scripts: usize,
    /// `@font-face` files installed into the page font system.
    pub fonts: usize,
    /// Iframes whose document was parsed (same-origin attached, cross-origin isolated).
    pub frames: usize,
    /// Subresource fetches that failed.
    pub failed: usize,
    /// Wall time of the subresource batches in milliseconds.
    pub fetch_ms: u64,
}

/// Fetches documents for navigations and answers network questions for the
/// page. Supplied by the embedder (`ve-api` backs it with `ve-net`).
pub trait Loader {
    /// Performs a navigation fetch.
    fn load(&mut self, request: &NavigationRequest) -> Result<LoadedDocument>;
    /// Fetches the parser's subresources, concurrently when the transport
    /// can. Results are in request order. Default: no subresource support.
    fn fetch_subresources(
        &mut self,
        requests: &[SubresourceRequest],
    ) -> Vec<Result<LoadedResource>> {
        requests
            .iter()
            .map(|r| self.script_fetch(&r.url, "GET", &[], r.page, None))
            .collect()
    }
    /// Requests currently in flight for `page`.
    fn in_flight(&self, _page: u64) -> Vec<InFlightSummary> {
        Vec::new()
    }
    /// Completed responses for `page`, oldest first.
    fn completed(&self, _page: u64) -> Vec<ve_net::CompletedResponse> {
        Vec::new()
    }
    /// A script-initiated `fetch` / XHR. Default: GET through [`Self::load`].
    /// `origin` is the document origin for CORS (attached by page script fetch).
    fn script_fetch(
        &mut self,
        url: &str,
        method: &str,
        body: &[u8],
        page: u64,
        _origin: Option<&str>,
    ) -> Result<LoadedResource> {
        let method = method.to_ascii_uppercase();
        if method != "GET" && method != "HEAD" {
            let mut req = NavigationRequest::get(url, page);
            req.method = NavMethod::Post;
            req.body = Some(body.to_vec());
            req.content_type = Some("text/plain;charset=UTF-8".into());
            let loaded = self.load(&req)?;
            return Ok(LoadedResource {
                url: loaded.url,
                bytes: loaded.bytes,
                content_type: loaded.content_type,
                status: loaded.status,
            });
        }
        let loaded = self.load(&NavigationRequest::get(url, page))?;
        Ok(LoadedResource {
            url: loaded.url,
            bytes: loaded.bytes,
            content_type: loaded.content_type,
            status: loaded.status,
        })
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
pub(crate) struct HistoryEntry {
    pub(crate) document: LoadedDocument,
    pub(crate) scroll: Point,
    pub(crate) state: String,
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
    /// Semantic query projection version (VEC-015).
    #[serde(default = "query_version_one", skip_serializing_if = "is_query_v1")]
    pub query_version: u32,
    /// `changesSince` lines (when `sinceRevision` matched a cached observation).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub changes_since: Option<Vec<String>>,
    /// Full-format structured delta.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub delta: Option<ObservationDelta>,
    /// The settle that preceded the observation.
    pub settled: Settled,
}

const QUERY_VERSION: u32 = 1;
fn query_version_one() -> u32 {
    QUERY_VERSION
}
fn is_query_v1(v: &u32) -> bool {
    *v == QUERY_VERSION
}

/// Which text shaper a page uses for layout.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ShaperKind {
    /// Synthetic per-character widths (CI, WPT, goldens, perf).
    #[default]
    Metric,
    /// System fonts through [`ParleyShaper`].
    System,
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
    pub(crate) doc: Document,
    pub(crate) url: String,
    base_url: Option<url::Url>,
    meta: DocumentMeta,
    routing: RoutingInfo,
    content_type: Option<String>,
    status: u16,
    pub(crate) history: Vec<HistoryEntry>,
    pub(crate) history_index: usize,
    pub(crate) style_engine: StyleEngine,
    pub(crate) style_tree: StyleTree,
    layout_engine: LayoutEngine,
    layout: LayoutTree,
    pub(crate) viewport: Size,
    scale: f32,
    pub(crate) scroll: Point,
    pub(crate) element_scroll: HashMap<NodeId, Point>,
    files: HashMap<NodeId, Vec<String>>,
    focused: Option<NodeId>,
    pub(crate) loader: Option<Box<dyn Loader>>,
    pending_navigation: Option<NavigationRequest>,
    refreshes_followed: u8,
    observations: VecDeque<CachedObservation>,
    renderer: Option<SoftwareRenderer>,
    images: ImageCache,
    node_images: HashMap<NodeId, ImageHandle>,
    shaper: ShaperKind,
    last_screenshot: Option<Screenshot>,
    last_navigation_error: Option<String>,
    virtual_time_ms: u64,
    clock: ve_core::Clock,
    wall_origin_ms: u64,
    cancelled: bool,
    /// Scripts in document order (external ones fetched at load).
    scripts: Vec<FetchedScript>,
    /// Subresource counters for the current document.
    load_stats: LoadStats,
    /// Cross-origin iframes as separate browsing contexts (plan A16).
    /// Declared before `scripting` so nested pages drop before the parent VM.
    isolated_frames: HashMap<NodeId, Box<Page>>,
    /// Document `<script>`s not yet evaluated (open/classify skips them).
    document_scripts_pending: bool,
    /// Parser-inserted script currently running; later nodes are not visible
    /// via `getElementById` until this is cleared (HTML parser script point).
    pub(crate) parser_limit: Option<NodeId>,
    /// Reused `DOMParser` document when its body has been emptied (`TodoMVC`
    /// `showEntries` parses a growing list 100 times).
    pub(crate) parser_scratch: Option<NodeId>,
    /// Arena length when document scripts started; later ids are script-created.
    pub(crate) parse_hi: u32,
    /// `rel=expect` links whose target has already been seen (stay unblocked).
    expect_satisfied: HashSet<NodeId>,
    /// Head `rel=expect` links present at parse; body JS cannot add new ones.
    expect_from_head: HashSet<NodeId>,
    /// Head links that were fully blocking before the body; body JS cannot arm new ones.
    expect_armed: HashSet<NodeId>,
    /// True after the first parser-inserted body script runs.
    pub(crate) expect_body_started: bool,
    /// Script nodes already evaluated (parser or script-inserted).
    pub(crate) scripts_executed: HashSet<NodeId>,
    /// Scripts inserted by `document.write` while a script is on the stack.
    /// Evaluated after the writer returns so we can `run_script` (the VM is
    /// borrowed during the host call).
    pub(crate) pending_write_scripts: Vec<(NodeId, String)>,
    /// Dynamically inserted `type=module` sources, flushed via `v8::Module`
    /// after the current host call returns the VM.
    pub(crate) pending_module_scripts: Vec<String>,
    /// Resolved `src` of attached iframes, used for `contentWindow.origin`.
    pub(crate) iframe_urls: HashMap<NodeId, String>,

    /// HTTP `Last-Modified` value for `document.lastModified`.
    pub(crate) last_modified: Option<String>,
    /// Document COOP (H3-4).
    pub(crate) coop: CoopPolicy,
    /// Document COEP (H3-4).
    pub(crate) coep: CoepPolicy,
    /// Browsing-document `document.readyState`.
    pub(crate) ready_state: &'static str,
    /// The script layer, when a VM is attached (plan A13).
    pub(crate) scripting: Option<crate::scripting::Scripting>,
    /// Origin-keyed `localStorage`.
    pub(crate) local_storage: HashMap<String, HashMap<String, String>>,
    /// Per-page `sessionStorage`.
    pub(crate) session_storage: HashMap<String, String>,
    /// Document `cookie` jar for this page.
    pub(crate) cookies: HashMap<String, String>,
    /// Pending `alert`/`confirm`/`prompt` from script (plan A15).
    pub(crate) pending_dialogs: Vec<DialogEntry>,
    /// Return value for the next `confirm`/`prompt` (`dialog` step).
    pub(crate) dialog_reply: Option<String>,
    /// Generations of refs handed out in the last observation (plan A17).
    issued_refs: HashMap<u32, u32>,
    /// Completed downloads for this page (plan A16).
    downloads: Vec<CompletedDownload>,
    /// Directory downloads are written into (`None` → temp dir).
    download_dir: Option<std::path::PathBuf>,
    /// Iframe node ids that are cross-origin (contentDocument is null).
    pub(crate) cross_origin_frames: std::collections::HashSet<NodeId>,
    /// Registered service workers (plan A23).
    pub(crate) service_workers: Vec<ServiceWorkerRegistration>,
    /// Persistent SW isolates keyed by scope (the active worker).
    pub(crate) sw_realms: std::collections::HashMap<String, crate::sw_realm::SwRealm>,
    /// Waiting SW isolates keyed by scope (installed, not yet active).
    pub(crate) sw_waiting_realms: std::collections::HashMap<String, crate::sw_realm::SwRealm>,
    /// In-flight script `fetch()` jobs (VEC-009). Completed during `settle`.
    pub(crate) script_fetches: Vec<ScriptFetchJob>,
    next_script_fetch: u64,
    last_script_fetch_rr: u64,
    /// Live [`ve_net::WebSocketClient`]s keyed by id (VEC-009).
    pub(crate) websockets: HashMap<u64, ve_net::WebSocketClient>,
    next_websocket: u64,
    /// Policy for WebSocket connects (page has no `NetworkContext`).
    pub(crate) network_policy: ve_net::NetworkPolicy,
    /// Origin-partitioned `IndexedDB`: `(origin, db, store) → object store`.
    pub(crate) indexed_db: HashMap<(String, String, String), IdbObjectStore>,
    /// `IndexedDB` database versions `(origin, name) → version`.
    pub(crate) indexed_db_versions: HashMap<(String, String), u32>,
    /// Open `IDBTransaction` snapshots for abort.
    pub(crate) indexed_db_txns: HashMap<u64, IdbTxn>,
    pub(crate) next_idb_txn: u64,
    /// Dedicated workers (script source + last message).
    pub(crate) workers: HashMap<u64, WorkerRecord>,
    pub(crate) next_worker: u64,
    /// `Client.postMessage` payloads from the last SW fetch (VEC-010).
    pub(crate) sw_client_posts: Vec<String>,
    /// Per-canvas 2D pixel buffers (VEC-008).
    pub(crate) canvases: HashMap<NodeId, CanvasSurface>,
    /// Gate E: restyle passes during the current attribution window.
    restyle_calls: u32,
    /// Gate E: restyle passes that fell back to a full document compute.
    restyle_full_calls: u32,
    /// Elements recomputed on the last restyle.
    last_recomputed: usize,
    /// The last restyle used the full `compute()` path.
    last_restyle_full: bool,
    /// Gate E: layout passes during the current attribution window.
    layout_calls: u32,
}

/// One `IndexedDB` index (VEC-010).
#[derive(Clone, Debug)]
pub(crate) struct IdbIndex {
    /// Key path (dotted, or JSON array of paths for compound keys).
    pub key_path: String,
    /// Unique constraint.
    pub unique: bool,
}

/// One `IndexedDB` object store (VEC-010).
#[derive(Clone, Debug, Default)]
pub(crate) struct IdbObjectStore {
    /// Primary key → JSON value.
    pub records: HashMap<String, String>,
    /// Index name → definition.
    pub indexes: HashMap<String, IdbIndex>,
}

/// One `IDBTransaction` snapshot (abort restores `records`).
#[derive(Clone, Debug)]
pub(crate) struct IdbTxn {
    /// Origin key.
    pub origin: String,
    /// Database name.
    pub db: String,
    /// Object store name.
    pub store: String,
    /// Records at `transaction()` time.
    pub snapshot: HashMap<String, String>,
    /// `abort()` was called.
    pub aborted: bool,
}

/// A dedicated worker started from page script (VEC-010).
#[derive(Clone, Debug)]
pub(crate) struct WorkerRecord {
    /// Worker script URL or inline source.
    pub source: String,
    /// Last `postMessage` payload (JSON text).
    pub last_message: Option<String>,
}

/// Fill style for canvas 2D (`fillStyle` colour or linear gradient).
#[derive(Clone, Debug)]
enum CanvasStyle {
    Solid([u8; 4]),
    Linear {
        x0: f32,
        y0: f32,
        x1: f32,
        y1: f32,
        stops: Vec<(f32, [u8; 4])>,
    },
}

impl CanvasStyle {
    fn sample(&self, x: f32, y: f32) -> [u8; 4] {
        match self {
            Self::Solid(c) => *c,
            Self::Linear {
                x0,
                y0,
                x1,
                y1,
                stops,
            } => sample_linear_gradient(*x0, *y0, *x1, *y1, stops, x, y),
        }
    }
}

fn sample_linear_gradient(
    x0: f32,
    y0: f32,
    x1: f32,
    y1: f32,
    stops: &[(f32, [u8; 4])],
    x: f32,
    y: f32,
) -> [u8; 4] {
    if stops.is_empty() {
        return [0, 0, 0, 255];
    }
    let dx = x1 - x0;
    let dy = y1 - y0;
    let len2 = dx * dx + dy * dy;
    let t = if len2 < 1e-8 {
        0.0
    } else {
        ((x - x0) * dx + (y - y0) * dy) / len2
    }
    .clamp(0.0, 1.0);
    if stops.len() == 1 {
        return stops[0].1;
    }
    let mut ordered = stops.to_vec();
    ordered.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap_or(std::cmp::Ordering::Equal));
    if t <= ordered[0].0 {
        return ordered[0].1;
    }
    let last = ordered.len() - 1;
    if t >= ordered[last].0 {
        return ordered[last].1;
    }
    for w in ordered.windows(2) {
        if t >= w[0].0 && t <= w[1].0 {
            let span = w[1].0 - w[0].0;
            let u = if span < 1e-8 { 0.0 } else { (t - w[0].0) / span };
            return lerp_rgba(w[0].1, w[1].1, u);
        }
    }
    ordered[last].1
}

fn lerp_rgba(a: [u8; 4], b: [u8; 4], t: f32) -> [u8; 4] {
    [
        (f32::from(a[0]) + (f32::from(b[0]) - f32::from(a[0])) * t).round() as u8,
        (f32::from(a[1]) + (f32::from(b[1]) - f32::from(a[1])) * t).round() as u8,
        (f32::from(a[2]) + (f32::from(b[2]) - f32::from(a[2])) * t).round() as u8,
        (f32::from(a[3]) + (f32::from(b[3]) - f32::from(a[3])) * t).round() as u8,
    ]
}

fn parse_canvas_style(s: &str) -> CanvasStyle {
    let t = s.trim();
    if let Some(rest) = t.strip_prefix("ve-grad:") {
        let mut parts = rest.splitn(3, ':');
        let kind = parts.next().unwrap_or("");
        let coords = parts.next().unwrap_or("");
        let stops_s = parts.next().unwrap_or("");
        if kind == "linear" {
            let nums: Vec<f32> = coords.split(',').filter_map(|n| n.parse().ok()).collect();
            if nums.len() == 4 {
                let mut stops = Vec::new();
                for stop in stops_s.split(';') {
                    if stop.is_empty() {
                        continue;
                    }
                    if let Some((off, color)) = stop.split_once('=') {
                        if let Ok(o) = off.parse::<f32>() {
                            stops.push((o.clamp(0.0, 1.0), parse_css_color(color)));
                        }
                    }
                }
                return CanvasStyle::Linear {
                    x0: nums[0],
                    y0: nums[1],
                    x1: nums[2],
                    y1: nums[3],
                    stops,
                };
            }
        }
    }
    CanvasStyle::Solid(parse_css_color(t))
}

/// Software 2D canvas backing store.
#[derive(Clone, Debug)]
pub(crate) struct CanvasSurface {
    width: u32,
    height: u32,
    pixels: Vec<u8>,
    ops: u64,
}

impl CanvasSurface {
    fn new(width: u32, height: u32) -> Self {
        let width = width.clamp(1, 4096);
        let height = height.clamp(1, 4096);
        Self {
            pixels: vec![0; width as usize * height as usize * 4],
            width,
            height,
            ops: 0,
        }
    }

    fn resize(&mut self, width: u32, height: u32) {
        *self = Self::new(width, height);
    }

    fn stroke_rect(&mut self, x: i32, y: i32, w: i32, h: i32, color: [u8; 4]) {
        if w <= 0 || h <= 0 {
            self.ops += 1;
            return;
        }
        self.fill_rect(x, y, w, 1, color);
        self.fill_rect(x, y + h - 1, w, 1, color);
        self.fill_rect(x, y, 1, h, color);
        self.fill_rect(x + w - 1, y, 1, h, color);
    }

    fn fill_rect_styled(&mut self, x: i32, y: i32, w: i32, h: i32, style: &CanvasStyle) {
        if w <= 0 || h <= 0 {
            self.ops += 1;
            return;
        }
        let x0 = x.max(0) as u32;
        let y0 = y.max(0) as u32;
        let x1 = (x.saturating_add(w)).max(0) as u32;
        let y1 = (y.saturating_add(h)).max(0) as u32;
        let x1 = x1.min(self.width);
        let y1 = y1.min(self.height);
        let x0 = x0.min(x1);
        let y0 = y0.min(y1);
        for row in y0..y1 {
            for col in x0..x1 {
                let color = style.sample(col as f32 + 0.5, row as f32 + 0.5);
                let i = (row * self.width + col) as usize * 4;
                self.pixels[i] = color[0];
                self.pixels[i + 1] = color[1];
                self.pixels[i + 2] = color[2];
                self.pixels[i + 3] = color[3];
            }
        }
        self.ops += 1;
    }

    fn fill_rect(&mut self, x: i32, y: i32, w: i32, h: i32, color: [u8; 4]) {
        self.fill_rect_styled(x, y, w, h, &CanvasStyle::Solid(color));
    }

    fn clear_rect(&mut self, x: i32, y: i32, w: i32, h: i32) {
        self.fill_rect(x, y, w, h, [0, 0, 0, 0]);
    }

    fn get_image_data(&self, x: i32, y: i32, w: i32, h: i32) -> (u32, u32, Vec<u8>) {
        let dw = w.max(0) as u32;
        let dh = h.max(0) as u32;
        let mut out = vec![0u8; dw as usize * dh as usize * 4];
        if dw == 0 || dh == 0 {
            return (dw, dh, out);
        }
        for row in 0..dh {
            let sy = y + row as i32;
            if sy < 0 || sy >= self.height as i32 {
                continue;
            }
            for col in 0..dw {
                let sx = x + col as i32;
                if sx < 0 || sx >= self.width as i32 {
                    continue;
                }
                let si = (sy as u32 * self.width + sx as u32) as usize * 4;
                let di = (row * dw + col) as usize * 4;
                out[di..di + 4].copy_from_slice(&self.pixels[si..si + 4]);
            }
        }
        (dw, dh, out)
    }

    fn put_image_data(&mut self, x: i32, y: i32, w: u32, h: u32, data: &[u8]) {
        if w == 0 || h == 0 {
            self.ops += 1;
            return;
        }
        for row in 0..h {
            let dy = y + row as i32;
            if dy < 0 || dy >= self.height as i32 {
                continue;
            }
            for col in 0..w {
                let dx = x + col as i32;
                if dx < 0 || dx >= self.width as i32 {
                    continue;
                }
                let si = (row * w + col) as usize * 4;
                if si + 3 >= data.len() {
                    continue;
                }
                let di = (dy as u32 * self.width + dx as u32) as usize * 4;
                self.pixels[di..di + 4].copy_from_slice(&data[si..si + 4]);
            }
        }
        self.ops += 1;
    }

    fn fill_polygon(&mut self, pts: &[[f32; 2]], color: [u8; 4]) {
        if pts.len() < 3 {
            return;
        }
        let mut min_y = f32::MAX;
        let mut max_y = f32::MIN;
        for p in pts {
            min_y = min_y.min(p[1]);
            max_y = max_y.max(p[1]);
        }
        let y0 = min_y.floor().max(0.0) as i32;
        let y1 = max_y.ceil().min(self.height as f32) as i32;
        for y in y0..y1 {
            let scan = y as f32 + 0.5;
            let mut xs = Vec::new();
            for i in 0..pts.len() {
                let a = pts[i];
                let b = pts[(i + 1) % pts.len()];
                if (a[1] <= scan && b[1] > scan) || (b[1] <= scan && a[1] > scan) {
                    let t = (scan - a[1]) / (b[1] - a[1]);
                    xs.push(a[0] + t * (b[0] - a[0]));
                }
            }
            xs.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
            for pair in xs.chunks(2) {
                if pair.len() < 2 {
                    break;
                }
                let x0 = pair[0].floor() as i32;
                let x1 = pair[1].ceil() as i32;
                self.fill_rect(x0, y, (x1 - x0).max(0), 1, color);
            }
        }
    }

    fn fill_path(&mut self, rects: &[[f32; 4]], polys: &[Vec<[f32; 2]>], color: [u8; 4]) {
        for r in rects {
            self.fill_rect(r[0] as i32, r[1] as i32, r[2] as i32, r[3] as i32, color);
        }
        for poly in polys {
            self.fill_polygon(poly, color);
        }
        self.ops += 1;
    }

    fn stroke_polyline(&mut self, pts: &[[f32; 2]], color: [u8; 4]) {
        if pts.len() < 2 {
            return;
        }
        for pair in pts.windows(2) {
            let (a, b) = (pair[0], pair[1]);
            let dx = b[0] - a[0];
            let dy = b[1] - a[1];
            let steps = dx.abs().max(dy.abs()).ceil().max(1.0) as i32;
            for i in 0..=steps {
                let t = i as f32 / steps as f32;
                let x = (a[0] + dx * t).round() as i32;
                let y = (a[1] + dy * t).round() as i32;
                self.fill_rect(x, y, 1, 1, color);
            }
        }
    }

    fn stroke_path(&mut self, rects: &[[f32; 4]], polys: &[Vec<[f32; 2]>], color: [u8; 4]) {
        for r in rects {
            self.stroke_rect(r[0] as i32, r[1] as i32, r[2] as i32, r[3] as i32, color);
        }
        for poly in polys {
            self.stroke_polyline(poly, color);
        }
        self.ops += 1;
    }

    fn fill_text(&mut self, text: &str, x: i32, y: i32, color: [u8; 4]) {
        // 5×7 bitmap: one filled cell per glyph so fillText is not a no-op.
        let mut cx = x;
        for _ in text.chars() {
            self.fill_rect(cx, y - 7, 5, 7, color);
            cx += 6;
        }
        self.ops += 1;
    }

    fn blit(&mut self, src: &[u8], sw: u32, sh: u32, dx: i32, dy: i32) {
        self.put_image_data(dx, dy, sw, sh, src);
    }
}

/// A finished download (plan A16).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct CompletedDownload {
    /// Source URL.
    pub url: String,
    /// Absolute path written.
    pub path: std::path::PathBuf,
    /// Suggested file name.
    pub filename: String,
    /// Byte length.
    pub bytes: usize,
}

/// Script-initiated fetch that settles asynchronously (VEC-009).
#[derive(Debug)]
pub(crate) struct ScriptFetchJob {
    pub id: u64,
    pub url: String,
    pub method: String,
    pub headers: String,
    pub body: String,
    pub result: Option<ve_script::JsValue>,
    pub error: Option<String>,
    pub aborted: bool,
}

/// `navigator.serviceWorker.register` record (plan A23).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ServiceWorkerRegistration {
    /// Scope URL prefix.
    pub scope: String,
    /// Script URL.
    pub script_url: String,
    /// Script source (inline or fetched).
    pub script: String,
    /// `clients.claim()` ran during activate.
    pub claimed: bool,
    /// Installed-but-not-active script (changed `register()` without `skipWaiting`).
    pub waiting_script: Option<String>,
    /// Script URL of the waiting worker.
    pub waiting_script_url: Option<String>,
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

fn hex_nibble(b: u8) -> Option<u8> {
    Some(match b {
        b'0'..=b'9' => b - b'0',
        b'a'..=b'f' => b - b'a' + 10,
        b'A'..=b'F' => b - b'A' + 10,
        _ => return None,
    })
}

fn media_query_matches_width(media: &str, width: f32) -> bool {
    let q = media.trim();
    if q.is_empty() {
        return true;
    }
    let inner = q
        .trim_start_matches('(')
        .trim_end_matches(')')
        .trim()
        .to_ascii_lowercase();
    if let Some(rest) = inner.strip_prefix("min-width:") {
        let px = rest
            .trim()
            .trim_end_matches("px")
            .trim()
            .parse::<f32>()
            .unwrap_or(0.0);
        return width >= px;
    }
    if let Some(rest) = inner.strip_prefix("max-width:") {
        let px = rest
            .trim()
            .trim_end_matches("px")
            .trim()
            .parse::<f32>()
            .unwrap_or(0.0);
        return width <= px;
    }
    true
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
    pub fn open(id: u64, loader: Box<dyn Loader>, url: &str, viewport: Size) -> Result<Self> {
        Self::open_with(id, loader, url, viewport, None)
    }

    /// [`Self::open`] with an optional script VM attached *before* the
    /// document loads, so its scripts run (plan A13). `allow_evaluate` gates
    /// the `evaluate` step.
    pub fn open_with(
        id: u64,
        mut loader: Box<dyn Loader>,
        url: &str,
        viewport: Size,
        scripting: Option<(Box<dyn ve_script::JsVm>, bool)>,
    ) -> Result<Self> {
        let parsed =
            url::Url::parse(url).map_err(|e| Error::invalid_params(format!("url {url:?}: {e}")))?;
        let loaded = loader.load(&NavigationRequest::get(parsed.to_string(), id))?;
        let mut page = Self::empty(id, viewport);
        page.loader = Some(loader);
        if let Some((vm, allow_evaluate)) = scripting {
            page.enable_scripting(vm, allow_evaluate)?;
        }
        page.load(loaded, HistoryMode::Push);
        Ok(page)
    }

    /// [`Self::from_html`] with a script VM attached before the load.
    pub fn from_html_with(
        id: u64,
        html: &str,
        url: Option<&str>,
        viewport: Size,
        scripting: Option<(Box<dyn ve_script::JsVm>, bool)>,
    ) -> Result<Self> {
        Self::from_html_with_loader(id, html, url, viewport, scripting, None)
    }

    /// [`Self::from_html_with`] with a loader so parser stylesheets and
    /// scripts are fetched during `load`.
    pub fn from_html_with_loader(
        id: u64,
        html: &str,
        url: Option<&str>,
        viewport: Size,
        scripting: Option<(Box<dyn ve_script::JsVm>, bool)>,
        loader: Option<Box<dyn Loader>>,
    ) -> Result<Self> {
        let mut page = Self::empty(id, viewport);
        page.loader = loader;
        if let Some((vm, allow_evaluate)) = scripting {
            page.enable_scripting(vm, allow_evaluate)?;
        }
        page.load(
            LoadedDocument::html(url.unwrap_or("about:blank"), html),
            HistoryMode::Push,
        );
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
            images: ImageCache::new(),
            node_images: HashMap::new(),
            shaper: ShaperKind::Metric,
            last_screenshot: None,
            last_navigation_error: None,
            virtual_time_ms: 0,
            clock: ve_core::Clock::Virtual,
            wall_origin_ms: ve_core::Clock::wall_unix_ms(),
            cancelled: false,
            scripts: Vec::new(),
            load_stats: LoadStats::default(),
            isolated_frames: HashMap::new(),
            document_scripts_pending: false,
            parser_limit: None,
            parser_scratch: None,
            parse_hi: 0,
            expect_satisfied: HashSet::new(),
            expect_from_head: HashSet::new(),
            expect_armed: HashSet::new(),
            expect_body_started: false,
            scripts_executed: HashSet::new(),
            pending_write_scripts: Vec::new(),
            pending_module_scripts: Vec::new(),
            iframe_urls: HashMap::new(),
            last_modified: None,
            coop: CoopPolicy::UnsafeNone,
            coep: CoepPolicy::UnsafeNone,
            ready_state: "loading",
            scripting: None,
            local_storage: HashMap::new(),
            session_storage: HashMap::new(),
            cookies: HashMap::new(),
            pending_dialogs: Vec::new(),
            dialog_reply: None,
            issued_refs: HashMap::new(),
            downloads: Vec::new(),
            download_dir: None,
            cross_origin_frames: std::collections::HashSet::new(),
            service_workers: Vec::new(),
            sw_realms: std::collections::HashMap::new(),
            sw_waiting_realms: std::collections::HashMap::new(),
            script_fetches: Vec::new(),
            next_script_fetch: 0,
            last_script_fetch_rr: 0,
            websockets: HashMap::new(),
            next_websocket: 0,
            network_policy: ve_net::NetworkPolicy::default(),
            indexed_db: HashMap::new(),
            indexed_db_versions: HashMap::new(),
            indexed_db_txns: HashMap::new(),
            next_idb_txn: 0,
            workers: HashMap::new(),
            next_worker: 0,
            sw_client_posts: Vec::new(),
            canvases: HashMap::new(),
            restyle_calls: 0,
            restyle_full_calls: 0,
            last_recomputed: 0,
            last_restyle_full: false,
            layout_calls: 0,
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

    /// Policy used for WebSocket connects.
    pub fn set_network_policy(&mut self, policy: ve_net::NetworkPolicy) {
        self.network_policy = policy;
    }

    pub(crate) fn start_script_fetch(
        &mut self,
        url: &str,
        method: &str,
        headers: &str,
        body: &str,
    ) -> u64 {
        self.next_script_fetch += 1;
        let id = self.next_script_fetch;
        self.script_fetches.push(ScriptFetchJob {
            id,
            url: url.to_owned(),
            method: method.to_owned(),
            headers: headers.to_owned(),
            body: body.to_owned(),
            result: None,
            error: None,
            aborted: false,
        });
        id
    }

    pub(crate) fn abort_script_fetch(&mut self, id: u64) {
        if let Some(job) = self.script_fetches.iter_mut().find(|j| j.id == id) {
            job.aborted = true;
        }
    }

    pub(crate) fn poll_script_fetch(&self, id: u64) -> Option<&ScriptFetchJob> {
        self.script_fetches.iter().find(|j| j.id == id)
    }

    pub(crate) fn complete_script_fetches(&mut self) {
        loop {
            let pending: Vec<(u64, String, String, String, String)> = self
                .script_fetches
                .iter()
                .filter(|j| j.result.is_none() && j.error.is_none() && !j.aborted)
                .map(|j| {
                    (
                        j.id,
                        j.url.clone(),
                        j.method.clone(),
                        j.headers.clone(),
                        j.body.clone(),
                    )
                })
                .collect();
            if pending.is_empty() {
                break;
            }
            let start = pending
                .iter()
                .position(|(id, ..)| *id > self.last_script_fetch_rr)
                .unwrap_or(0);
            let (id, url, method, headers, body) = pending[start].clone();
            match crate::dom::script_fetch_now(self, &url, &method, &headers, &body) {
                Ok(value) => {
                    if let Some(job) = self.script_fetches.iter_mut().find(|j| j.id == id)
                        && !job.aborted
                    {
                        job.result = Some(value);
                    }
                }
                Err(err) => {
                    if let Some(job) = self.script_fetches.iter_mut().find(|j| j.id == id)
                        && !job.aborted
                    {
                        job.error = Some(err.to_string());
                    }
                }
            }
            self.last_script_fetch_rr = id;
        }
        for ws in self.websockets.values_mut() {
            ws.poll();
        }
    }

    pub(crate) fn pending_script_fetch_count(&self) -> usize {
        self.script_fetches
            .iter()
            .filter(|j| j.result.is_none() && j.error.is_none() && !j.aborted)
            .count()
    }

    pub(crate) fn iframe_origin(&self, iframe: NodeId) -> String {
        if self.iframe_is_opaque(iframe) {
            return "null".into();
        }
        if let Some(url) = self.iframe_urls.get(&iframe) {
            if url.starts_with("blob:")
                || url == "about:blank"
                || url == "about:srcdoc"
                || url.starts_with("javascript:")
                || url.starts_with("about:")
            {
                return crate::dom::origin_of(&self.url);
            }
            let origin = crate::dom::origin_of(url);
            if origin != "null" && !origin.starts_with("about:") {
                return origin;
            }
        }
        if let Some(src) = self.doc.attribute(iframe, "src")
            && !src.is_empty()
            && src != "about:blank"
            && let Some(resolved) = self.resolve_url(src)
        {
            if resolved.starts_with("blob:") {
                return crate::dom::origin_of(&self.url);
            }
            return crate::dom::origin_of(&resolved);
        }
        crate::dom::origin_of(&self.url)
    }

    pub(crate) fn iframe_location_origin(&self, iframe: NodeId) -> String {
        if self.iframe_is_opaque(iframe) {
            return "null".into();
        }
        if let Some(url) = self.iframe_urls.get(&iframe) {
            if url.starts_with("blob:") {
                return crate::dom::origin_of(&self.url);
            }
        }
        if self.doc.attribute(iframe, "srcdoc").is_some() {
            return "null".into();
        }
        let src = self.doc.attribute(iframe, "src").unwrap_or("");
        if src.is_empty()
            || src == "about:blank"
            || src.to_ascii_lowercase().starts_with("javascript:")
        {
            return "null".into();
        }
        if src.starts_with("blob:") {
            return crate::dom::origin_of(&self.url);
        }
        self.iframe_origin(iframe)
    }

    pub(crate) fn iframe_is_opaque(&self, iframe: NodeId) -> bool {
        let Some(sandbox) = self.doc.attribute(iframe, "sandbox") else {
            return false;
        };
        !sandbox
            .split_ascii_whitespace()
            .any(|t| t.eq_ignore_ascii_case("allow-same-origin"))
    }

    pub(crate) fn iframe_src_url(&self, iframe: NodeId) -> String {
        if let Some(url) = self.iframe_urls.get(&iframe) {
            return url.clone();
        }
        if self.doc.attribute(iframe, "srcdoc").is_some() {
            return "about:srcdoc".into();
        }
        let src = self.doc.attribute(iframe, "src").unwrap_or("");
        if src.is_empty() {
            return "about:blank".into();
        }
        self.resolve_url(src).unwrap_or_else(|| src.to_owned())
    }

    pub(crate) fn frame_is_isolated(&self, iframe: NodeId) -> bool {
        self.cross_origin_frames.contains(&iframe)
    }

    pub(crate) fn open_websocket(&mut self, url: &str) -> Result<u64, String> {
        let ws = ve_net::WebSocketClient::connect_with_policy(url, &self.network_policy)
            .map_err(|e| e.to_string())?;
        self.next_websocket += 1;
        let id = self.next_websocket;
        self.websockets.insert(id, ws);
        Ok(id)
    }

    pub(crate) fn create_worker(&mut self, source: String) -> u64 {
        let source = self.load_worker_source(source);
        self.next_worker += 1;
        let id = self.next_worker;
        self.workers.insert(
            id,
            WorkerRecord {
                source,
                last_message: None,
            },
        );
        id
    }

    pub(crate) fn terminate_worker(&mut self, id: u64) {
        self.workers.remove(&id);
    }

    pub(crate) fn maybe_attach_blank_iframe(&mut self, id: NodeId) {
        let Some(el) = self.doc.element(id) else {
            return;
        };
        if !el.is_html("iframe") && !el.is_html("frame") {
            return;
        }
        if self.doc.content_document(id).is_some() {
            return;
        }
        if self.cross_origin_frames.contains(&id) {
            return;
        }
        let src = self.doc.attribute(id, "src").unwrap_or_default();
        let src_l = src.trim().to_ascii_lowercase();
        if !src.is_empty()
            && src != "about:blank"
            && !src_l.starts_with("javascript:")
            && !src_l.starts_with("blob:")
        {
            return;
        }
        if !self.doc.is_connected(id) {
            return;
        }
        if src_l.starts_with("blob:") || src_l.starts_with("javascript:") {
            if let Some(url) = self.resolve_url(src) {
                self.iframe_urls.insert(id, url);
            } else {
                self.iframe_urls.insert(id, src.to_owned());
            }
        } else {
            self.iframe_urls
                .entry(id)
                .or_insert_with(|| "about:blank".into());
        }
        let nested = self.doc.create_html_document(None);
        let _ = self.doc.set_content_document(id, nested);
    }

    pub(crate) fn canvas_size(&mut self, id: NodeId) -> (u32, u32) {
        let c = self
            .canvases
            .entry(id)
            .or_insert_with(|| CanvasSurface::new(300, 150));
        (c.width, c.height)
    }

    pub(crate) fn canvas_resize(&mut self, id: NodeId, width: u32, height: u32) {
        self.canvases
            .entry(id)
            .or_insert_with(|| CanvasSurface::new(width, height))
            .resize(width, height);
    }

    pub(crate) fn canvas_fill_rect(
        &mut self,
        id: NodeId,
        x: i32,
        y: i32,
        w: i32,
        h: i32,
        color: &str,
    ) -> u64 {
        let c = self
            .canvases
            .entry(id)
            .or_insert_with(|| CanvasSurface::new(300, 150));
        c.fill_rect_styled(x, y, w, h, &parse_canvas_style(color));
        c.ops
    }

    pub(crate) fn canvas_clear_rect(&mut self, id: NodeId, x: i32, y: i32, w: i32, h: i32) -> u64 {
        let c = self
            .canvases
            .entry(id)
            .or_insert_with(|| CanvasSurface::new(300, 150));
        c.clear_rect(x, y, w, h);
        c.ops
    }

    pub(crate) fn canvas_ops(&self, id: NodeId) -> u64 {
        self.canvases.get(&id).map_or(0, |c| c.ops)
    }

    pub(crate) fn canvas_to_data_url(&mut self, id: NodeId) -> String {
        let canvas = self
            .canvases
            .entry(id)
            .or_insert_with(|| CanvasSurface::new(300, 150));
        match crate::screenshot::encode_png(canvas.width, canvas.height, &canvas.pixels) {
            Ok(png) => format!("data:image/png;base64,{}", ve_net::base64_encode(&png)),
            Err(_) => "data:,".into(),
        }
    }

    pub(crate) fn canvas_get_image_data(
        &mut self,
        id: NodeId,
        x: i32,
        y: i32,
        w: i32,
        h: i32,
    ) -> (u32, u32, Vec<u8>) {
        self.canvases
            .entry(id)
            .or_insert_with(|| CanvasSurface::new(300, 150))
            .get_image_data(x, y, w, h)
    }

    pub(crate) fn canvas_put_image_data(
        &mut self,
        id: NodeId,
        x: i32,
        y: i32,
        w: u32,
        h: u32,
        data: &[u8],
    ) {
        self.canvases
            .entry(id)
            .or_insert_with(|| CanvasSurface::new(300, 150))
            .put_image_data(x, y, w, h, data);
    }

    pub(crate) fn canvas_fill_path(
        &mut self,
        id: NodeId,
        rects: &[[f32; 4]],
        polys: &[Vec<[f32; 2]>],
        color: &str,
    ) -> u64 {
        let c = self
            .canvases
            .entry(id)
            .or_insert_with(|| CanvasSurface::new(300, 150));
        c.fill_path(rects, polys, parse_css_color(color));
        c.ops
    }

    pub(crate) fn canvas_stroke_path(
        &mut self,
        id: NodeId,
        rects: &[[f32; 4]],
        polys: &[Vec<[f32; 2]>],
        color: &str,
    ) -> u64 {
        let c = self
            .canvases
            .entry(id)
            .or_insert_with(|| CanvasSurface::new(300, 150));
        c.stroke_path(rects, polys, parse_css_color(color));
        c.ops
    }

    pub(crate) fn canvas_stroke_rect(
        &mut self,
        id: NodeId,
        x: i32,
        y: i32,
        w: i32,
        h: i32,
        color: &str,
    ) -> u64 {
        let c = self
            .canvases
            .entry(id)
            .or_insert_with(|| CanvasSurface::new(300, 150));
        c.stroke_rect(x, y, w, h, parse_css_color(color));
        c.ops
    }

    pub(crate) fn canvas_fill_text(
        &mut self,
        id: NodeId,
        text: &str,
        x: i32,
        y: i32,
        color: &str,
    ) -> u64 {
        let c = self
            .canvases
            .entry(id)
            .or_insert_with(|| CanvasSurface::new(300, 150));
        c.fill_text(text, x, y, parse_css_color(color));
        c.ops
    }

    pub(crate) fn canvas_draw_image(
        &mut self,
        id: NodeId,
        src: NodeId,
        dx: i32,
        dy: i32,
    ) -> u64 {
        let src_pixels = self.canvases.get(&src).map(|s| (s.width, s.height, s.pixels.clone()));
        let c = self
            .canvases
            .entry(id)
            .or_insert_with(|| CanvasSurface::new(300, 150));
        if let Some((w, h, px)) = src_pixels {
            c.blit(&px, w, h, dx, dy);
        }
        c.ops
    }

    fn load_worker_source(&mut self, source: String) -> String {
        let (base, body) = if is_worker_url(&source) {
            let url = self.resolve_url(&source).unwrap_or_else(|| source.clone());
            let id = self.id();
            let origin = self.url.clone();
            let body = if let Some(loader) = self.loader.as_mut()
                && let Ok(res) = loader.script_fetch(&url, "GET", &[], id, Some(origin.as_str()))
                && res.status < 400
            {
                String::from_utf8_lossy(&res.bytes).into_owned()
            } else {
                source
            };
            (url, body)
        } else {
            (self.url.clone(), source)
        };
        self.expand_import_scripts(&base, &body, 0).0
    }

    pub(crate) fn expand_import_scripts(
        &mut self,
        base: &str,
        source: &str,
        depth: u8,
    ) -> (String, HashMap<String, String>) {
        let mut imports = HashMap::new();
        let out = self.expand_import_scripts_into(base, source, depth, &mut imports);
        (out, imports)
    }

    fn expand_import_scripts_into(
        &mut self,
        base: &str,
        source: &str,
        depth: u8,
        imports: &mut HashMap<String, String>,
    ) -> String {
        if depth > 8 {
            return source.to_owned();
        }
        let mut out = String::new();
        let mut rest = source;
        while let Some(i) = rest.find("importScripts(") {
            out.push_str(&rest[..i]);
            rest = &rest[i + "importScripts(".len()..];
            let Some(end) = matching_paren(rest) else {
                out.push_str("importScripts(");
                out.push_str(rest);
                return out;
            };
            let args = &rest[..end];
            rest = &rest[end + 1..];
            for href in split_js_string_args(args) {
                let url = url::Url::parse(base)
                    .ok()
                    .and_then(|u| u.join(&href).ok())
                    .map(|u| u.to_string())
                    .or_else(|| self.resolve_url(&href))
                    .unwrap_or(href.clone());
                let id = self.id();
                let origin = self.url.clone();
                if let Some(loader) = self.loader.as_mut()
                    && let Ok(res) =
                        loader.script_fetch(&url, "GET", &[], id, Some(origin.as_str()))
                    && res.status < 400
                {
                    let nested = String::from_utf8_lossy(&res.bytes).into_owned();
                    imports.insert(href, nested.clone());
                    imports.insert(url.clone(), nested.clone());
                    out.push_str(&self.expand_import_scripts_into(
                        &url,
                        &nested,
                        depth + 1,
                        imports,
                    ));
                    out.push('\n');
                }
            }
            out.push_str("/* importScripts */");
        }
        out.push_str(rest);
        out
    }

    fn install_image(&mut self, id: NodeId, bytes: &[u8]) {
        let Some(decoded) = decode_raster(bytes) else {
            return;
        };
        let handle = self.images.insert(decoded.clone());
        self.node_images.insert(id, handle);
        let renderer = self
            .renderer
            .get_or_insert_with(SoftwareRenderer::with_system_fonts);
        let handle = renderer.images.insert(decoded);
        renderer.node_images.insert(id, handle);
    }

    /// Layout shaper for this page (`metric` or `system`).
    #[must_use]
    pub fn shaper(&self) -> ShaperKind {
        self.shaper
    }

    /// Replaces the layout shaper and forces a later relayout.
    pub fn set_shaper(&mut self, kind: ShaperKind) {
        if self.shaper == kind {
            return;
        }
        self.shaper = kind;
        self.layout_engine = match kind {
            ShaperKind::Metric => LayoutEngine::new(),
            ShaperKind::System => {
                LayoutEngine::with_shaper(Box::new(ParleyShaper::with_system_fonts()))
            }
        };
        self.style_tree = StyleTree::default();
    }

    /// Decoded `<img>` handles keyed by layout node.
    #[must_use]
    pub fn node_images(&self) -> &HashMap<NodeId, ImageHandle> {
        &self.node_images
    }

    /// Page-owned decoded image cache (GPU and software share this).
    #[must_use]
    pub fn image_cache(&self) -> &ImageCache {
        &self.images
    }

    /// Scrolls the viewport by CSS pixels without running an agent Program.
    pub fn scroll_by(&mut self, dx: f32, dy: f32) -> ScrollState {
        if dx.abs() > f32::EPSILON {
            let max_x = (self.layout.root.rect.right() - self.viewport.width).max(0.0);
            self.scroll.x = (self.scroll.x + dx).clamp(0.0, max_x);
            self.doc.record_scrolled(None);
        }
        self.scroll_viewport(dy)
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
        let (outcome, _decoded) = ve_html::parse_document_bytes_with(
            &loaded.bytes,
            charset.as_deref(),
            ve_html::ParseOptions {
                scripting_enabled: self.scripting.is_some(),
                chunk_size: 16 * 1024,
            },
        );
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
        self.last_modified.clone_from(&loaded.last_modified);
        self.coop = loaded.coop;
        self.coep = loaded.coep;
        self.doc
            .set_content_language(loaded.content_language.clone());
        self.parser_limit = None;
        self.parse_hi = 0;
        self.expect_satisfied.clear();
        self.scripts_executed.clear();
        self.iframe_urls.clear();
        self.routing = classify(&self.doc, self.content_type.as_deref());
        self.scroll = Point::ZERO;
        self.element_scroll.clear();
        self.files.clear();
        self.focused = None;
        self.pending_dialogs.clear();
        self.dialog_reply = None;
        self.issued_refs.clear();
        self.downloads.clear();
        self.cross_origin_frames.clear();
        self.isolated_frames.clear();
        self.service_workers.clear();
        self.sw_realms.clear();
        self.sw_waiting_realms.clear();
        self.refreshes_followed = if matches!(mode, HistoryMode::Refresh) {
            self.refreshes_followed + 1
        } else {
            0
        };
        self.style_engine.interaction = ve_style::InteractionState::new();
        self.style_tree = StyleTree::default();
        self.style_engine.clear_author_styles();
        let sheets = self.fetch_subresources();
        self.add_styles(&sheets);
        self.fetch_font_faces();
        self.update();
        if let Some(s) = self.scripting.as_mut() {
            s.reset();
        }
        if self.scripting.is_some() {
            let _ = self.call_script("__veResetDocument", &[]);
        }
        self.document_scripts_pending = self.scripting.is_some();
        self.apply_css_coverage();
        self.apply_visual_routing();
        let entry = HistoryEntry {
            document: loaded,
            scroll: Point::ZERO,
            state: "null".into(),
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
    // Subresources (plan A11)
    // ---------------------------------------------------------------------

    /// Discovers the parser's subresources and fetches them in one
    /// concurrent batch (plus one more for `@import`s): external
    /// stylesheets, images (for their natural size) and external scripts.
    /// Returns the stylesheet texts keyed by `<link>` node so
    /// [`Self::add_styles`] can keep cascade order. Without a loader (inline
    /// HTML, tests) nothing is fetched.
    fn fetch_subresources(&mut self) -> HashMap<NodeId, String> {
        self.scripts.clear();
        self.load_stats = LoadStats::default();
        let mut sheets = HashMap::new();
        let Some(base) = self.base_url.clone() else {
            self.collect_scripts(&HashMap::new());
            return sheets;
        };
        let has_loader = self.loader.is_some();
        let page = self.id;
        let referrer = Some(self.url.clone());
        let resolve = |href: &str| base.join(href.trim()).ok().map(|u| u.to_string());

        let mut requests: Vec<(NodeId, SubresourceRequest)> = Vec::new();
        let mut data_images: Vec<(NodeId, u32, u32, String)> = Vec::new();
        let ids: Vec<NodeId> = self.doc.elements().collect();
        for id in ids {
            let Some(e) = self.doc.element(id) else {
                continue;
            };
            if e.is_html("link") {
                let rel = self.doc.attribute(id, "rel").unwrap_or("");
                let is_sheet = rel
                    .split_ascii_whitespace()
                    .any(|r| r.eq_ignore_ascii_case("stylesheet"));
                let alternate = rel
                    .split_ascii_whitespace()
                    .any(|r| r.eq_ignore_ascii_case("alternate"));
                if !is_sheet || alternate || self.doc.attribute(id, "disabled").is_some() {
                    continue;
                }
                if let Some(m) = self.doc.attribute(id, "media")
                    && !ve_style::MediaQueryList::parse_str(m).evaluate(&self.style_engine.media)
                {
                    continue;
                }
                if let Some(url) = self.doc.attribute(id, "href").and_then(resolve) {
                    requests.push((
                        id,
                        SubresourceRequest {
                            url,
                            kind: SubresourceKind::Stylesheet,
                            page,
                            referrer: referrer.clone(),
                        },
                    ));
                }
            } else if e.is_html("style") {
                let css = self.doc.text_content(id);
                for href in collect_imports(&css) {
                    if let Some(url) = resolve(&href) {
                        requests.push((
                            id,
                            SubresourceRequest {
                                url,
                                kind: SubresourceKind::Stylesheet,
                                page,
                                referrer: referrer.clone(),
                            },
                        ));
                    }
                }
            } else if e.is_html("img") {
                // srcset: take the first candidate when src is missing
                let src = self
                    .doc
                    .attribute(id, "src")
                    .map(str::to_owned)
                    .or_else(|| {
                        self.doc
                            .attribute(id, "srcset")
                            .and_then(|ss| ss.split(',').next())
                            .and_then(|c| c.split_ascii_whitespace().next())
                            .map(str::to_owned)
                    });
                if let Some(url) = src.as_deref().and_then(resolve)
                    && !url.starts_with("data:")
                    && (self.doc.attribute(id, "width").is_none()
                        || self.doc.attribute(id, "height").is_none())
                {
                    requests.push((
                        id,
                        SubresourceRequest {
                            url,
                            kind: SubresourceKind::Image,
                            page,
                            referrer: referrer.clone(),
                        },
                    ));
                } else if let Some(data) = src.as_deref().filter(|s| s.starts_with("data:"))
                    && let Some((w, h)) = decode_data_url_image_size(data)
                {
                    data_images.push((id, w, h, data.to_owned()));
                }
            } else if e.is_html("script") && script_is_classic_or_module(&self.doc, id) {
                if let Some(url) = self.doc.attribute(id, "src").and_then(resolve) {
                    let url = rewrite_loopback_fetch(&url);
                    if !url.starts_with("data:") {
                        requests.push((
                            id,
                            SubresourceRequest {
                                url,
                                kind: SubresourceKind::Script,
                                page,
                                referrer: referrer.clone(),
                            },
                        ));
                    }
                }
            } else if e.is_html("iframe") || e.is_html("frame") {
                if self.doc.attribute(id, "sandbox").is_some() {
                    let sb = self.doc.attribute(id, "sandbox").unwrap_or("");
                    if !sb
                        .split_ascii_whitespace()
                        .any(|t| t.eq_ignore_ascii_case("allow-same-origin"))
                    {
                        self.cross_origin_frames.insert(id);
                    }
                }
                if let Some(srcdoc) = self.doc.attribute(id, "srcdoc").map(str::to_owned) {
                    self.iframe_urls.insert(id, "about:srcdoc".into());
                    self.attach_iframe_html(id, &srcdoc);
                } else if let Some(url) = self.doc.attribute(id, "src").and_then(resolve) {
                    if url.starts_with("javascript:") || url.starts_with("blob:") {
                        self.iframe_urls.insert(id, url);
                        self.maybe_attach_blank_iframe(id);
                    } else {
                        if !same_origin_url(&self.url, &url) {
                            self.cross_origin_frames.insert(id);
                        }
                        self.iframe_urls.insert(id, url.clone());
                        requests.push((
                            id,
                            SubresourceRequest {
                                url: rewrite_loopback_fetch(&url),
                                kind: SubresourceKind::Document,
                                page,
                                referrer: referrer.clone(),
                            },
                        ));
                    }
                } else {
                    self.maybe_attach_blank_iframe(id);
                }
            }
        }
        for (id, w, h, data) in data_images {
            let _ = self.doc.set_natural_size(id, w, h);
            self.load_stats.images += 1;
            if let Some(bytes) = decode_data_url_bytes(&data) {
                self.install_image(id, &bytes);
            }
        }
        if !has_loader || requests.is_empty() {
            self.collect_scripts(&HashMap::new());
            return sheets;
        }
        let started = Instant::now();
        let batch: Vec<SubresourceRequest> = requests.iter().map(|(_, r)| r.clone()).collect();
        let results = self
            .loader
            .as_mut()
            .expect("loader")
            .fetch_subresources(&batch);
        let mut script_sources: HashMap<NodeId, Option<String>> = HashMap::new();
        let mut imports: Vec<(NodeId, usize, SubresourceRequest)> = Vec::new();
        for ((id, req), result) in requests.into_iter().zip(results) {
            match (req.kind, result) {
                (SubresourceKind::Stylesheet, Ok(res)) if res.status < 400 => {
                    let css = decode_text(&res.bytes, res.content_type.as_deref());
                    // nested @imports (one level) resolve against the sheet's URL
                    if let Ok(sheet_url) = url::Url::parse(&res.url) {
                        for (i, href) in collect_imports(&css).into_iter().enumerate() {
                            if let Ok(u) = sheet_url.join(&href) {
                                imports.push((
                                    id,
                                    i,
                                    SubresourceRequest {
                                        url: u.to_string(),
                                        kind: SubresourceKind::Stylesheet,
                                        page,
                                        referrer: referrer.clone(),
                                    },
                                ));
                            }
                        }
                    }
                    sheets
                        .entry(id)
                        .and_modify(|e| {
                            e.push('\n');
                            e.push_str(&css);
                        })
                        .or_insert(css);
                    self.load_stats.stylesheets += 1;
                }
                (SubresourceKind::Image, Ok(res)) if res.status < 400 => {
                    if let Ok(size) = imagesize::blob_size(&res.bytes) {
                        let w = u32::try_from(size.width).unwrap_or(u32::MAX);
                        let h = u32::try_from(size.height).unwrap_or(u32::MAX);
                        let _ = self.doc.set_natural_size(id, w, h);
                        self.load_stats.images += 1;
                        self.install_image(id, &res.bytes);
                    } else {
                        self.load_stats.failed += 1;
                    }
                }
                (SubresourceKind::Script, Ok(res)) if res.status < 400 => {
                    script_sources.insert(
                        id,
                        Some(decode_text(&res.bytes, res.content_type.as_deref())),
                    );
                    self.load_stats.scripts += 1;
                }
                (SubresourceKind::Document, Ok(res)) if res.status < 400 => {
                    let html = decode_text(&res.bytes, res.content_type.as_deref());
                    self.iframe_urls
                        .entry(id)
                        .or_insert_with(|| res.url.clone());
                    if self.cross_origin_frames.contains(&id) {
                        self.attach_isolated_iframe(id, &res.url, &html);
                    } else {
                        self.attach_iframe_html(id, &html);
                    }
                }
                (SubresourceKind::Document, Ok(_) | Err(_)) => {
                    self.load_stats.failed += 1;
                }
                (_, Ok(res)) => {
                    tracing::debug!(url = %res.url, status = res.status, "subresource failed");
                    self.load_stats.failed += 1;
                    if req.kind == SubresourceKind::Script {
                        script_sources.insert(id, None);
                    }
                }
                (_, Err(e)) => {
                    tracing::debug!(url = %req.url, error = %e, "subresource failed");
                    self.load_stats.failed += 1;
                    if req.kind == SubresourceKind::Script {
                        script_sources.insert(id, None);
                    }
                }
            }
        }
        if !imports.is_empty() {
            let batch: Vec<SubresourceRequest> =
                imports.iter().map(|(_, _, r)| r.clone()).collect();
            let results = self
                .loader
                .as_mut()
                .expect("loader")
                .fetch_subresources(&batch);
            // imported sheets precede the importing sheet in cascade order
            let mut prefix: HashMap<NodeId, Vec<(usize, String)>> = HashMap::new();
            for ((id, i, _), result) in imports.into_iter().zip(results) {
                match result {
                    Ok(res) if res.status < 400 => {
                        prefix
                            .entry(id)
                            .or_default()
                            .push((i, decode_text(&res.bytes, res.content_type.as_deref())));
                        self.load_stats.stylesheets += 1;
                    }
                    _ => self.load_stats.failed += 1,
                }
            }
            for (id, mut parts) in prefix {
                parts.sort_by_key(|(i, _)| *i);
                let mut text: String = parts.into_iter().map(|(_, t)| t + "\n").collect();
                if let Some(own) = sheets.get(&id) {
                    text.push_str(own);
                }
                sheets.insert(id, text);
            }
        }
        self.load_stats.fetch_ms = u64::try_from(started.elapsed().as_millis()).unwrap_or(u64::MAX);
        self.collect_scripts(&script_sources);
        tracing::info!(
            page = self.id,
            stylesheets = self.load_stats.stylesheets,
            images = self.load_stats.images,
            scripts = self.load_stats.scripts,
            failed = self.load_stats.failed,
            fetch_ms = self.load_stats.fetch_ms,
            "subresources"
        );
        sheets
    }

    fn attach_iframe_html(&mut self, iframe: NodeId, html: &str) {
        let scripting = self.scripting.is_some();
        let nested = self.doc.create_html_document(None);
        let taken = std::mem::replace(&mut self.doc, Document::new());
        let (mut doc, kids) = ve_html::parse_fragment_into(taken, "body", html, scripting);
        if let Some(body) = doc.body_of(nested) {
            for kid in kids {
                let _ = doc.append_child(body, kid);
            }
        }
        let _ = doc.set_content_document(iframe, nested);
        self.doc = doc;
        self.load_stats.frames += 1;
    }

    /// Cross-origin iframe: own document, not parent `contentDocument` (plan A16).
    /// Scripts do not share the parent realm; a second V8 isolate cannot be
    /// entered while the parent's isolate is entered, so the nested page is
    /// a separate document context without its own VM.
    fn attach_isolated_iframe(&mut self, iframe: NodeId, url: &str, html: &str) {
        let mut nested = Page::from_html(self.id, html, Some(url), self.viewport);
        nested.network_policy = self.network_policy.clone();
        self.isolated_frames.insert(iframe, Box::new(nested));
        self.cross_origin_frames.insert(iframe);
        self.load_stats.frames += 1;
    }

    /// Author styles in cascade order: `<style>` text inline, `<link
    /// rel=stylesheet>` from the fetched map, both in tree order.
    fn add_styles(&mut self, sheets: &HashMap<NodeId, String>) {
        let mut ordered: Vec<(NodeId, String)> = Vec::new();
        for id in self.doc.elements() {
            let Some(e) = self.doc.element(id) else {
                continue;
            };
            if e.is_html("style") {
                let media_ok = self.doc.attribute(id, "media").is_none_or(|m| {
                    ve_style::MediaQueryList::parse_str(m).evaluate(&self.style_engine.media)
                });
                if media_ok {
                    let own = strip_css_imports(&ve_style::strip_cdata(&self.doc.text_content(id)));
                    let css = if let Some(imported) = sheets.get(&id) {
                        format!("{imported}\n{own}")
                    } else {
                        own
                    };
                    ordered.push((id, css));
                }
            } else if let Some(css) = sheets.get(&id) {
                ordered.push((id, css.clone()));
            }
        }
        for (_, css) in ordered {
            self.style_engine.add_stylesheet(&css);
        }
    }

    /// Fetches `@font-face src` URLs after author sheets are parsed (H1-B3).
    fn fetch_font_faces(&mut self) {
        let faces: Vec<ve_style::FontFaceRule> = self
            .style_engine
            .font_faces()
            .into_iter()
            .cloned()
            .collect();
        if faces.is_empty() {
            return;
        }
        let page = self.id;
        let referrer = Some(self.url.clone());
        let base = self.base_url.clone();
        let mut requests = Vec::new();
        let mut data_fonts = Vec::new();
        for face in &faces {
            for src in &face.sources {
                let FontFaceSrc::Url(href) = src else {
                    continue;
                };
                if href.starts_with("data:") {
                    if let Some(bytes) = decode_data_url_bytes(href) {
                        data_fonts.push(bytes);
                    }
                    continue;
                }
                let url = base
                    .as_ref()
                    .and_then(|b| b.join(href.trim()).ok())
                    .map(|u| u.to_string())
                    .or_else(|| {
                        href.starts_with("http")
                            .then(|| href.clone())
                    });
                if let Some(url) = url {
                    requests.push(SubresourceRequest {
                        url,
                        kind: SubresourceKind::Font,
                        page,
                        referrer: referrer.clone(),
                    });
                }
            }
        }
        for bytes in data_fonts {
            self.install_font(bytes);
        }
        if requests.is_empty() || self.loader.is_none() {
            return;
        }
        let results = self
            .loader
            .as_mut()
            .expect("loader")
            .fetch_subresources(&requests);
        for result in results {
            match result {
                Ok(res) if res.status < 400 && !res.bytes.is_empty() => {
                    self.install_font(res.bytes);
                }
                Ok(_) | Err(_) => self.load_stats.failed += 1,
            }
        }
    }

    fn install_font(&mut self, bytes: Vec<u8>) {
        if bytes.is_empty() {
            return;
        }
        self.layout_engine.register_font(bytes.clone());
        self.renderer
            .get_or_insert_with(SoftwareRenderer::with_system_fonts)
            .fonts
            .load_font_data(bytes);
        self.load_stats.fonts += 1;
    }

    fn apply_animations(&mut self) {
        let animated: Vec<(NodeId, String, f32, f32, f32, ve_style::AnimationFillMode, ve_style::AnimationPlayState, ve_style::AnimationDirection, String)> = self
            .doc
            .elements()
            .filter_map(|id| {
                let style = self.style_tree.style(id);
                if style.animation_name.is_empty() || style.animation_duration_ms <= 0.0 {
                    None
                } else {
                    Some((
                        id,
                        style.animation_name.clone(),
                        style.animation_duration_ms,
                        style.animation_delay_ms,
                        style.animation_iteration_count,
                        style.animation_fill_mode,
                        style.animation_play_state,
                        style.animation_direction,
                        style.animation_timing_function.clone(),
                    ))
                }
            })
            .collect();
        if animated.is_empty() {
            return;
        }
        let keyframes = self.style_engine.keyframes();
        let now = self.now_ms() as f32;
        for (id, name, duration, delay, iterations, fill, play, direction, timing) in animated {
            let Some(rule) = keyframes
                .iter()
                .find(|k| k.name.eq_ignore_ascii_case(&name))
            else {
                continue;
            };
            let Some(t) = animation_progress(
                now, delay, duration, iterations, fill, play, direction, &timing,
            ) else {
                continue;
            };
            if let Some(opacity) = interpolate_keyframe_opacity(rule, t) {
                self.style_tree.override_opacity(id, opacity);
            }
        }
    }

    /// Light-tree elements plus descendants of live `<template for>` contents,
    /// in parse/document order, so mid-stream template scripts run.
    fn script_scan_ids(&self) -> Vec<NodeId> {
        let mut ids = Vec::new();
        fn walk(doc: &Document, id: NodeId, ids: &mut Vec<NodeId>, in_for: bool) {
            if doc.get(id).is_some_and(Node::is_element) {
                ids.push(id);
                if let Some(frag) = doc.template_contents(id) {
                    let is_for = in_for || doc.attribute(id, "for").is_some();
                    if is_for {
                        for c in doc.children(frag) {
                            walk(doc, c, ids, true);
                        }
                    }
                }
            }
            for c in doc.children(id) {
                walk(doc, c, ids, in_for);
            }
        }
        walk(&self.doc, self.doc.root(), &mut ids, false);
        ids
    }

    /// Records every `<script>` in document order with its source.
    fn collect_scripts(&mut self, external: &HashMap<NodeId, Option<String>>) {
        let mut scripts = Vec::new();
        for id in self.script_scan_ids() {
            if !script_is_classic_or_module(&self.doc, id)
                || self.doc.attribute(id, "nomodule").is_some()
            {
                continue;
            }
            let module = self
                .doc
                .attribute(id, "type")
                .is_some_and(|t| t.trim().eq_ignore_ascii_case("module"));
            let url = self
                .doc
                .attribute(id, "src")
                .and_then(|s| self.base_url.as_ref()?.join(s.trim()).ok())
                .map(|u| u.to_string());
            let body = self.doc.text_content(id);
            let (source, failed) = match (&url, external.get(&id)) {
                (Some(_), Some(Some(src))) => (src.clone(), false),
                (Some(u), _) if u.starts_with("data:") => match decode_data_url_bytes(u) {
                    Some(bytes) => (String::from_utf8_lossy(&bytes).into_owned(), false),
                    None => (String::new(), true),
                },
                (Some(_), _) => (String::new(), true),
                (None, _) => (body, false),
            };
            scripts.push(FetchedScript {
                node: id,
                url,
                source,
                module,
                defer: self.doc.attribute(id, "defer").is_some(),
                async_: self.doc.attribute(id, "async").is_some()
                    || self.doc.element(id).is_some_and(|e| e.has_attr("async")),
                failed,
            });
        }
        self.scripts = scripts;
    }

    /// Scripts of the current document in order (external ones fetched at load).
    #[must_use]
    pub fn scripts(&self) -> &[FetchedScript] {
        &self.scripts
    }

    /// Subresource counters for the current document.
    #[must_use]
    pub fn load_stats(&self) -> &LoadStats {
        &self.load_stats
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

    /// `Cross-Origin-Opener-Policy` of the current document.
    #[must_use]
    pub fn coop(&self) -> CoopPolicy {
        self.coop
    }

    /// `Cross-Origin-Embedder-Policy` of the current document.
    #[must_use]
    pub fn coep(&self) -> CoepPolicy {
        self.coep
    }

    /// True when COOP + COEP isolate this document (H3-4).
    #[must_use]
    pub fn is_cross_origin_isolated(&self) -> bool {
        !matches!(self.coop, CoopPolicy::UnsafeNone)
            && !matches!(self.coep, CoepPolicy::UnsafeNone)
    }

    /// Whether `window.open(url)` may share this browsing context (COOP).
    #[must_use]
    pub fn coop_allows_open(&self, url: &str) -> bool {
        if matches!(self.coop, CoopPolicy::UnsafeNone) {
            return true;
        }
        if matches!(self.coop, CoopPolicy::SameOriginAllowPopups) {
            return true;
        }
        same_origin_url(&self.url, url)
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

    /// Origin-keyed `localStorage` (Playwright `storage.state` origins).
    #[must_use]
    pub fn local_storage_map(&self) -> &HashMap<String, HashMap<String, String>> {
        &self.local_storage
    }

    /// Mutable origin-keyed `localStorage`.
    pub fn local_storage_map_mut(&mut self) -> &mut HashMap<String, HashMap<String, String>> {
        &mut self.local_storage
    }

    /// First `input` / `textarea` / `contenteditable` when nothing is focused.
    #[must_use]
    pub fn first_editable(&self) -> Option<NodeId> {
        self.doc.descendants(self.doc.document_element()?).find(|id| {
            self.doc.element(*id).is_some_and(|e| e.is_html("input") || e.is_html("textarea"))
                || self.doc.attribute(*id, "contenteditable").is_some()
        })
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

    /// Sets the HTTP `Last-Modified` value used by `document.lastModified`.
    pub fn set_last_modified(&mut self, raw: impl Into<String>) {
        self.last_modified = Some(raw.into());
    }

    /// Advances virtual time by `ms` and fires JS timers due in that window.
    /// Completes pending `fetch()` jobs and drains microtasks so a
    /// `step_timeout` → `fetch()` → `step_timeout` chain can finish *inside*
    /// the requested horizon (official template `src` referrerpolicy).
    /// Does not jump past `ms`: a 300ms src-streaming chunk must not apply
    /// during `pump_virtual_time(50)`.
    pub fn pump_virtual_time(&mut self, ms: u64) -> usize {
        self.ensure_document_scripts();
        let horizon = self.virtual_time_ms().saturating_add(ms);
        let mut fired = self.pump_timers(ms);
        for _ in 0..64 {
            self.complete_script_fetches();
            self.drain_js_jobs();
            let pending_fetch = self
                .script_fetches
                .iter()
                .any(|j| j.result.is_none() && j.error.is_none() && !j.aborted);
            let micro = self.script_readiness().2;
            let now = self.virtual_time_ms();
            let next_due = self
                .scripting
                .as_ref()
                .and_then(|s| s.event_loop.next_js_timer_due_ms());
            if now < horizon && next_due.is_some_and(|due| due <= horizon) {
                let step = next_due
                    .unwrap_or(horizon)
                    .saturating_sub(now)
                    .max(1)
                    .min(horizon.saturating_sub(now));
                fired += self.pump_timers(step);
                continue;
            }
            if !pending_fetch && !micro {
                break;
            }
        }
        let now = self.virtual_time_ms();
        if now < horizon {
            self.advance_virtual_time(horizon - now);
        }
        fired
    }

    /// Sets the HTTP `Content-Language` used by `:lang()` fallback.
    pub fn set_content_language(&mut self, raw: impl Into<String>) {
        self.doc.set_content_language(Some(raw.into()));
        if let Some(root) = self.doc.document_element() {
            self.doc
                .mark_dirty(root, DirtyFlags::STYLE | DirtyFlags::STYLE_DESCENDANTS);
        }
    }

    pub(crate) fn take_cancelled(&mut self) -> bool {
        std::mem::take(&mut self.cancelled)
    }

    /// Virtual clock (advanced by waits).
    #[must_use]
    pub fn virtual_time_ms(&self) -> u64 {
        self.virtual_time_ms
    }

    /// Current page time: virtual settle clock, or wall time in the GUI.
    #[must_use]
    pub fn now_ms(&self) -> u64 {
        match self.clock {
            ve_core::Clock::Virtual => self.virtual_time_ms,
            ve_core::Clock::Wall => ve_core::Clock::wall_unix_ms().saturating_sub(self.wall_origin_ms),
        }
    }

    /// Switch the page clock. Goldens stay on [`ve_core::Clock::Virtual`].
    pub fn set_clock(&mut self, clock: ve_core::Clock) {
        self.clock = clock;
        if clock == ve_core::Clock::Wall {
            self.wall_origin_ms = ve_core::Clock::wall_unix_ms().saturating_sub(self.virtual_time_ms);
        }
    }

    pub(crate) fn advance_virtual_time(&mut self, ms: u64) {
        self.virtual_time_ms += ms;
        if let Some(s) = self.scripting.as_mut() {
            s.event_loop.advance(std::time::Duration::from_millis(ms));
        }
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

    // Dirtiness is tracked by the per-node `DirtyFlags` that every DOM
    // mutation sets (structure and attributes mark everything; focus, hover,
    // checkedness mark STYLE). Journal records that change neither style nor
    // geometry — `Scrolled`, a text control's dirty value — still bump the
    // document revision, so the revision must not be part of the test: a
    // `fill` or `scroll` step would otherwise restyle and relayout the page.
    // An empty style tree marks "never computed" (`load`, `set_viewport`).
    fn style_clean(&self) -> bool {
        !self.style_tree.is_empty() && !self.doc.any_dirty(DirtyFlags::STYLE)
    }

    fn layout_clean(&self) -> bool {
        // Geometry journal records bump `doc.revision()` (and therefore
        // `LayoutTree::revision`) after restyle has already stamped
        // `StyleTree::revision`, so the two must not be compared. Restyle
        // marks `LAYOUT` when geometry-affecting properties change.
        !self.doc.any_dirty(DirtyFlags::LAYOUT | DirtyFlags::TEXT)
    }

    /// Recomputes styles if dirty. Does not flush layout. `getComputedStyle`
    /// for `display` / colors must not relayout official Complex-DOM Spectrum
    /// after jQuery `show()` appends a temp node to `body`.
    pub fn restyle_if_needed(&mut self) {
        if self.style_clean() {
            return;
        }
        self.style_engine.interaction.set_focus(self.focused, true);
        let since = self.style_tree.revision();
        let stats =
            self.style_engine
                .restyle_incremental(&mut self.doc, &mut self.style_tree, since);
        self.restyle_calls += 1;
        self.last_recomputed = stats.recomputed;
        self.last_restyle_full = stats.full;
        if stats.full {
            self.restyle_full_calls += 1;
        }
        self.doc.clear_dirty_all(DirtyFlags::STYLE);
        self.install_background_images();
        self.apply_animations();
    }

    fn install_background_images(&mut self) {
        let urls: Vec<(NodeId, String)> = self
            .doc
            .elements()
            .filter_map(|id| match &self.style_tree.style(id).background_image {
                BackgroundImage::Url(u) if u.starts_with("data:") => Some((id, u.clone())),
                _ => None,
            })
            .collect();
        for (id, data) in urls {
            if let Some(bytes) = decode_data_url_bytes(&data) {
                self.install_image(id, &bytes);
            }
        }
    }

    /// Recomputes styles and layout if anything is dirty. Uses the
    /// incremental restyle/relayout paths (plan A15); they fall back to a
    /// full pass when the journal cannot cover `since`.
    pub fn update(&mut self) {
        if self.style_clean() && self.layout_clean() {
            self.apply_animations();
            return;
        }
        self.restyle_if_needed();
        if !self.layout_clean() {
            let previous = std::mem::replace(&mut self.layout, LayoutTree::blank(self.viewport));
            let (tree, _stats) = self.layout_engine.relayout_incremental(
                &mut self.doc,
                &self.style_tree,
                self.viewport,
                previous,
            );
            self.layout = tree;
            self.layout.apply_sticky(self.scroll);
            self.layout_calls += 1;
        }
        self.doc.clear_dirty_all(
            DirtyFlags::STYLE | DirtyFlags::LAYOUT | DirtyFlags::TEXT | DirtyFlags::PAINT,
        );
    }

    /// Gate E restyle counters for the current attribution window.
    #[must_use]
    pub fn restyle_attribution(&self) -> RestyleAttribution {
        RestyleAttribution {
            calls: self.restyle_calls,
            full_calls: self.restyle_full_calls,
            last_recomputed: self.last_recomputed,
            last_full: self.last_restyle_full,
            journal_len: self.doc.journal().len(),
            layout_calls: self.layout_calls,
        }
    }

    /// Clears Gate E restyle counters (call immediately before the timed work).
    pub fn reset_restyle_attribution(&mut self) {
        self.restyle_calls = 0;
        self.restyle_full_calls = 0;
        self.last_recomputed = 0;
        self.last_restyle_full = false;
        self.layout_calls = 0;
    }

    fn apply_css_coverage(&mut self) {
        let c = self.style_engine.coverage();
        self.routing.css_coverage = Some(CssCoverage {
            declarations_total: c.declarations_total,
            unknown: c.declarations_unknown,
            deferred: c.declarations_deferred,
        });
        if !self.routing.requires_script && c.exceeds(0.50) {
            self.routing.requires_script = true;
            self.routing.route_reason = format!(
                "css-coverage: {:.0}% unknown/deferred declarations affect geometry",
                f64::from(c.miss_ratio()) * 100.0
            );
        }
    }

    /// HTML can be full of text that CSS never lays out (display:none until JS,
    /// zero-height shells). The first screen then paints blank; Chromium must
    /// take over in auto mode.
    fn apply_visual_routing(&mut self) {
        if self.routing.requires_script {
            return;
        }
        let body = self.routing.body_text_chars;
        if body < 500 {
            return;
        }
        let view = Rect::new(0.0, 0.0, self.viewport.width, self.viewport.height);
        let painted: usize = self
            .layout
            .paint_order()
            .iter()
            .filter(|item| {
                item.rect.intersects(&view) && item.rect.width() > 2.0 && item.rect.height() > 2.0
            })
            .filter_map(|item| item.text.as_deref())
            .map(|t| t.trim().chars().count())
            .sum();
        if painted < 40 {
            self.routing.requires_script = true;
            self.routing.route_reason = format!(
                "empty-viewport: {painted} painted chars in view vs {body} in the document"
            );
        }
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

    /// Runs pending document scripts once. Open/classify skips this so
    /// the router can fall back without executing page JS.
    pub(crate) fn ensure_document_scripts(&mut self) {
        if !self.document_scripts_pending {
            return;
        }
        self.document_scripts_pending = false;
        self.run_document_scripts();
        self.update();
        self.apply_css_coverage();
    }

    /// Nodes after the running parser-inserted script are not in the document
    /// yet, matching HTML's "run the script" insertion point. Nodes outside
    /// the light tree (fragments, disconnected) stay visible. Script-created
    /// nodes (allocated after parse) stay visible.
    #[must_use]
    pub(crate) fn parser_visible(&self, id: NodeId) -> bool {
        let Some(limit) = self.parser_limit else {
            return true;
        };
        if id.index() >= self.parse_hi {
            return true;
        }
        // Parse order, not live tree order: a node parsed before the running
        // script stays visible even if script moved it after the insertion
        // point (ARIA reconnect, document.write, etc.).
        id.index() <= limit.index()
    }

    pub(crate) fn in_browsing_tree(&self, id: NodeId) -> bool {
        id == self.doc.root() || self.doc.is_ancestor_of(self.doc.root(), id)
    }

    pub(crate) fn resource_is_render_blocking(&self, id: NodeId) -> bool {
        self.doc
            .attribute(id, "blocking")
            .unwrap_or("")
            .split_ascii_whitespace()
            .any(|t| t.eq_ignore_ascii_case("render"))
    }

    pub(crate) fn visible_children(&self, id: NodeId) -> Vec<NodeId> {
        self.doc
            .children(id)
            .filter(|&c| self.parser_visible(c))
            .collect()
    }

    /// Children visible to script: parser-gated in the light tree while a
    /// parser-inserted script is running; otherwise the real child list
    /// (shadow roots, fragments, disconnected subtrees).
    pub(crate) fn tree_children(&self, id: NodeId) -> Vec<NodeId> {
        if self.parser_limit.is_some() && self.in_browsing_tree(id) {
            self.visible_children(id)
        } else {
            self.doc.children(id).collect()
        }
    }

    pub(crate) fn visible_first_child(&self, id: NodeId) -> Option<NodeId> {
        self.doc.children(id).find(|&c| self.parser_visible(c))
    }

    pub(crate) fn visible_last_child(&self, id: NodeId) -> Option<NodeId> {
        self.doc
            .children(id)
            .filter(|&c| self.parser_visible(c))
            .last()
    }

    pub(crate) fn visible_next_sibling(&self, id: NodeId) -> Option<NodeId> {
        let mut n = self.doc.next_sibling(id);
        while let Some(cur) = n {
            if self.parser_visible(cur) {
                return Some(cur);
            }
            n = self.doc.next_sibling(cur);
        }
        None
    }

    pub(crate) fn visible_prev_sibling(&self, id: NodeId) -> Option<NodeId> {
        let mut n = self.doc.prev_sibling(id);
        while let Some(cur) = n {
            if self.parser_visible(cur) {
                return Some(cur);
            }
            n = self.doc.prev_sibling(cur);
        }
        None
    }

    pub(crate) fn reveal_parser_progress(&mut self, old_limit: Option<NodeId>) {
        let ids: Vec<NodeId> = std::iter::once(self.doc.root())
            .chain(self.doc.descendants(self.doc.root()))
            .collect();
        let mut newly = Vec::new();
        for id in ids {
            if id.index() >= self.parse_hi || !self.parser_visible(id) {
                continue;
            }
            let was = {
                let saved = self.parser_limit;
                self.parser_limit = old_limit;
                let v = self.parser_visible(id);
                self.parser_limit = saved;
                v
            };
            if !was {
                newly.push(id);
            }
        }
        for id in newly {
            if let Some(parent) = self.doc.parent(id) {
                self.doc.record_synthetic_insert(parent, id);
            }
        }
        let _ = self.call_script("__veFlushObservers", &[]);
        self.drain_js_jobs();
    }

    fn expect_same_document_fragment(&self, href: &str) -> Option<String> {
        let href = href.trim();
        if href.is_empty() {
            return None;
        }
        let resolved = self.resolve_url(href).unwrap_or_else(|| href.to_owned());
        let doc = self.url.split('#').next().unwrap_or(self.url.as_str());
        let (base, frag) = resolved.split_once('#')?;
        if frag.is_empty() {
            return None;
        }
        let a = base.strip_suffix('/').unwrap_or(base);
        let b = doc.strip_suffix('/').unwrap_or(doc);
        if a != b {
            return None;
        }
        Some(frag.to_owned())
    }

    fn decode_expect_fragment(frag: &str) -> String {
        let mut out = Vec::with_capacity(frag.len());
        let b = frag.as_bytes();
        let mut i = 0;
        while i < b.len() {
            if b[i] == b'%' && i + 2 < b.len() {
                if let (Some(h), Some(l)) = (hex_nibble(b[i + 1]), hex_nibble(b[i + 2])) {
                    out.push((h << 4) | l);
                    i += 3;
                    continue;
                }
            }
            out.push(b[i]);
            i += 1;
        }
        String::from_utf8_lossy(&out).into_owned()
    }

    fn expect_target_present(&self, frag: &str) -> bool {
        let decoded = Self::decode_expect_fragment(frag);
        if self.parser_element_by_id(&decoded).is_some()
            || self.parser_element_by_id(frag).is_some()
        {
            return true;
        }
        self.parser_name_complete(&decoded) || self.parser_name_complete(frag)
    }

    fn parser_name_complete(&self, name: &str) -> bool {
        self.doc.elements().any(|id| {
            self.doc.attribute(id, "name") == Some(name)
                && self.parser_visible(id)
                && self
                    .parser_limit
                    .is_none_or(|lim| !self.doc.is_ancestor_of(id, lim))
        })
    }

    fn parser_element_by_id(&self, want: &str) -> Option<NodeId> {
        self.doc
            .element_by_id(want)
            .filter(|&id| self.parser_visible(id))
    }

    pub(crate) fn expect_link_in_head(&self, id: NodeId) -> bool {
        self.doc
            .ancestors(id)
            .any(|a| self.doc.element(a).is_some_and(|e| e.is_html("head")))
    }

    /// `rel=expect blocking=render` whose target id is not yet parsed.
    pub(crate) fn expect_blocking_active(&mut self) -> bool {
        let width = self.viewport.width;
        let ids: Vec<NodeId> = std::iter::once(self.doc.root())
            .chain(self.doc.descendants(self.doc.root()))
            .collect();
        for id in ids {
            if self.expect_satisfied.contains(&id) {
                continue;
            }
            if !self.expect_from_head.contains(&id) {
                continue;
            }
            if self.expect_body_started && !self.expect_armed.contains(&id) {
                continue;
            }
            let Some(el) = self.doc.element(id) else {
                continue;
            };
            if !el.is_html("link") {
                continue;
            }
            if !self.expect_link_in_head(id) {
                continue;
            }
            let rel = self.doc.attribute(id, "rel").unwrap_or("");
            if !rel
                .split_ascii_whitespace()
                .any(|t| t.eq_ignore_ascii_case("expect"))
            {
                continue;
            }
            let blocking = self.doc.attribute(id, "blocking").unwrap_or("");
            if !blocking
                .split_ascii_whitespace()
                .any(|t| t.eq_ignore_ascii_case("render"))
            {
                continue;
            }
            if !media_query_matches_width(self.doc.attribute(id, "media").unwrap_or(""), width) {
                continue;
            }
            let href = self.doc.attribute(id, "href").unwrap_or("").to_owned();
            let Some(frag) = self.expect_same_document_fragment(&href) else {
                continue;
            };
            if self.expect_target_present(&frag) {
                self.expect_satisfied.insert(id);
                continue;
            }
            return true;
        }
        false
    }

    pub(crate) fn snapshot_head_expect_links(&mut self) {
        let width = self.viewport.width;
        self.expect_from_head = self
            .doc
            .elements()
            .filter(|&id| {
                self.doc.element(id).is_some_and(|e| e.is_html("link"))
                    && self.expect_link_in_head(id)
                    && self
                        .doc
                        .attribute(id, "rel")
                        .unwrap_or("")
                        .split_ascii_whitespace()
                        .any(|t| t.eq_ignore_ascii_case("expect"))
            })
            .collect();
        self.expect_armed = self
            .expect_from_head
            .iter()
            .copied()
            .filter(|&id| {
                let blocking = self.doc.attribute(id, "blocking").unwrap_or("");
                if !blocking
                    .split_ascii_whitespace()
                    .any(|t| t.eq_ignore_ascii_case("render"))
                {
                    return false;
                }
                if !media_query_matches_width(self.doc.attribute(id, "media").unwrap_or(""), width)
                {
                    return false;
                }
                let href = self.doc.attribute(id, "href").unwrap_or("");
                self.expect_same_document_fragment(href).is_some()
            })
            .collect();
    }

    /// `settle()` without running pending document scripts (the open path).
    pub fn settle_passive(&mut self, budget_ms: u64) -> Settled {
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
                && target != self.url
            {
                if target.starts_with("javascript:") {
                    if self.scripting.is_some() {
                        let _ = self.run_javascript_url(&target);
                    }
                    break;
                }
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
        // Script readiness (architecture §6 conditions 1, 2, 7): fire timers
        // due within the window, drain microtasks, then report what remains.
        if self.scripting.is_some() {
            for _ in 0..8 {
                self.complete_script_fetches();
                self.drain_js_jobs();
            }
            if let Some(scripting) = self.scripting.as_mut() {
                scripting
                    .event_loop
                    .advance(std::time::Duration::from_millis(budget_ms.min(50)));
                let _ = scripting.event_loop.run_until_quiescent(64);
            }
            self.pump_timers(crate::scripting::TIMER_WINDOW_MS);
            self.update();
            let (soon, later, microtasks) = self.script_readiness();
            if soon > 0 {
                reasons.push(format!("timers({soon})"));
            }
            if later > 0 {
                reasons.push(format!("timers-later({later})"));
            }
            if microtasks {
                reasons.push("microtasks".into());
            }
        }
        let mut settled = self.pending_navigation.is_none();
        if self.scripting.is_some() {
            let (soon, _, microtasks) = self.script_readiness();
            if soon > 0 || microtasks {
                settled = false;
            }
            let pending_sf = self.pending_script_fetch_count();
            if pending_sf > 0 {
                settled = false;
                reasons.push(format!("script-fetch({pending_sf})"));
            }
        }
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

    /// `settle()` (architecture §6). Runs pending document scripts, then
    /// pending navigations, `<meta refresh>`, restyle + relayout, and
    /// in-flight fetches attributed to the page.
    pub fn settle(&mut self, budget_ms: u64) -> Settled {
        self.ensure_document_scripts();
        self.settle_passive(budget_ms)
    }

    /// Bounded event-loop slice for host round-robin (VEC-007).
    pub fn pump_event_loop(&mut self, max_tasks: usize) -> ve_script::RunReport {
        match self.scripting.as_mut() {
            Some(scripting) => scripting.event_loop.run_until_quiescent(max_tasks),
            None => ve_script::RunReport {
                quiescent: true,
                ..ve_script::RunReport::default()
            },
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
            self.run_javascript_url(&resolved)?;
            return Ok(());
        }
        let mut request = NavigationRequest::get(parsed.to_string(), self.id);
        request.referrer = Some(self.url.clone());
        self.pending_navigation = Some(request);
        Ok(())
    }

    /// Runs a `javascript:` URL against the page VM (plan A15).
    pub(crate) fn run_javascript_url(&mut self, url: &str) -> Result<String> {
        if self.scripting.is_none() {
            return Err(Error::capability_unsupported(
                "javascript: URLs need the script layer",
            ));
        }
        let raw = url.split_once("javascript:").map_or(url, |(_, rest)| rest);
        let source = percent_decode(raw);
        if source.trim().is_empty() {
            return Ok("javascript: (empty)".into());
        }
        match self.run_script(&source, "javascript:") {
            Ok(_) => Ok(format!(
                "ran javascript: {}",
                source.chars().take(80).collect::<String>()
            )),
            Err(e) => {
                tracing::debug!(error = %e, "javascript: URL failed");
                Ok(format!("javascript: error: {e}"))
            }
        }
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
            pending_dialogs: &self.pending_dialogs,
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
        self.ensure_document_scripts();
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
        self.issued_refs.clear();
        for e in &content.elements {
            if let Some((idx, generation)) = parse_ref_parts(&e.reference) {
                let g = generation.or_else(|| {
                    self.doc
                        .node_at_index(idx)
                        .ok()
                        .flatten()
                        .map(NodeId::generation)
                });
                if let Some(g) = g {
                    self.issued_refs.insert(idx, g);
                }
            }
        }
        EngineObservation {
            content,
            revision,
            document_epoch: u64::from(self.generation),
            query_version: QUERY_VERSION,
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
        let (index, generation) = parse_ref_parts(reference)
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
        let expected_gen = generation.or_else(|| self.issued_refs.get(&index).copied());
        match self.doc.node_at_index(index) {
            Ok(Some(id)) => {
                if let Some(g) = expected_gen
                    && id.generation() != g
                {
                    return Err(Error::coded_with(
                        ErrorCode::TargetDetached,
                        format!(
                            "ref {reference} generation {g} does not match live generation {}",
                            id.generation()
                        ),
                        serde_json::json!({
                            "ref": reference,
                            "generation": g,
                            "liveGeneration": id.generation(),
                            "epoch": self.generation
                        }),
                    ));
                }
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
    pub(crate) fn scroll_into_view(&mut self, rect: Rect) {
        self.scroll_into_view_inset(rect, 0.0, 0.0);
    }

    fn scroll_into_view_inset(&mut self, rect: Rect, margin: f32, padding: f32) {
        let vh = (self.viewport.height - padding * 2.0).max(1.0);
        let vw = (self.viewport.width - padding * 2.0).max(1.0);
        let max_y = (self.layout.content_height() - self.viewport.height).max(0.0);
        let max_x = (self.layout.root.rect.right() - self.viewport.width).max(0.0);
        let mut changed = false;
        let top = rect.y() - margin;
        let bottom = rect.bottom() + margin;
        let left = rect.x() - margin;
        let right = rect.right() + margin;
        let view_y = self.scroll.y + padding;
        let view_x = self.scroll.x + padding;
        if top < view_y {
            let next = (top - padding).clamp(0.0, max_y);
            if (next - self.scroll.y).abs() > 0.5 {
                self.scroll.y = next;
                changed = true;
            }
        } else if bottom > view_y + vh {
            let next = (bottom - padding - vh).clamp(0.0, max_y);
            if (next - self.scroll.y).abs() > 0.5 {
                self.scroll.y = next;
                changed = true;
            }
        }
        if left < view_x {
            let next = (left - padding).clamp(0.0, max_x);
            if (next - self.scroll.x).abs() > 0.5 {
                self.scroll.x = next;
                changed = true;
            }
        } else if right > view_x + vw {
            let next = (right - padding - vw).clamp(0.0, max_x);
            if (next - self.scroll.x).abs() > 0.5 {
                self.scroll.x = next;
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
        let style = self.style_tree.style(id);
        self.scroll_into_view_inset(rect, style.scroll_margin, style.scroll_padding);
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
        if self.dispatch_js_event(id, "click", true, true, Some(point)) {
            return Ok(format!("{} click default prevented", ref_for(id)));
        }
        self.activate(id)
    }

    /// Runs the activation behaviour for a click on `id`.
    pub(crate) fn activate(&mut self, id: NodeId) -> Result<String> {
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
            return self.download_from_link(link, &href);
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
                return self.run_javascript_url(&resolved);
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

    pub(crate) fn reset_form_of(&mut self, control: NodeId) -> Result<String> {
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
            return self.run_javascript_url(action.as_str());
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
        let via_value = self.input_type(id).is_some()
            || self.doc.element(id).is_some_and(|e| e.is_html("textarea"));
        if via_value && self.scripting.is_some() {
            let sanitized = self.sanitize_value(id, value);
            let applied = self
                .call_script(
                    "__veSetValue",
                    &[
                        crate::dom::pack(id),
                        ve_script::JsValue::from(sanitized.as_str()),
                    ],
                )
                .map(|v| v.is_truthy())
                .unwrap_or(false);
            if !applied {
                self.set_text_value(id, value)?;
            }
            let data = ve_script::JsValue::from(sanitized.as_str());
            let input_type = ve_script::JsValue::from("insertReplacementText");
            self.dispatch_js_event_init(
                id,
                "beforeinput",
                true,
                true,
                None,
                &[("data", data.clone()), ("inputType", input_type.clone())],
            );
            self.dispatch_js_event_init(
                id,
                "input",
                true,
                false,
                None,
                &[("data", data), ("inputType", input_type)],
            );
        } else {
            self.set_text_value(id, value)?;
            self.dispatch_js_event(id, "input", true, false, None);
        }
        self.dispatch_js_event(id, "change", true, false, None);
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
        self.dispatch_js_event(id, "input", true, false, None);
        self.dispatch_js_event(id, "change", true, false, None);
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
        self.snap_scroll(max_y);
        self.doc.record_scrolled(None);
        ScrollState {
            x: self.scroll.x,
            y: self.scroll.y,
            max_x,
            max_y,
            container: None,
        }
    }

    fn snap_scroll(&mut self, max_y: f32) {
        let snapping = self.doc.elements().any(|id| {
            self.style_tree.style(id).scroll_snap_type != ve_style::ScrollSnapType::None
        });
        if !snapping {
            return;
        }
        let mut best: Option<f32> = None;
        let mut best_d = f32::INFINITY;
        for id in self.doc.elements() {
            let style = self.style_tree.style(id);
            if style.scroll_snap_align == ve_style::ScrollSnapAlign::None {
                continue;
            }
            let Some(rect) = self.layout.rect_of(id) else {
                continue;
            };
            let y = match style.scroll_snap_align {
                ve_style::ScrollSnapAlign::Start => rect.y(),
                ve_style::ScrollSnapAlign::Center => {
                    rect.y() + rect.height() / 2.0 - self.viewport.height / 2.0
                }
                ve_style::ScrollSnapAlign::End => rect.bottom() - self.viewport.height,
                ve_style::ScrollSnapAlign::None => continue,
            };
            let d = (y - self.scroll.y).abs();
            if d < best_d {
                best_d = d;
                best = Some(y);
            }
        }
        if let Some(y) = best {
            self.scroll.y = y.clamp(0.0, max_y);
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

    /// Direct present into an RGBA frame (no PNG). Used by the native shell.
    pub fn present_frame(&mut self, full_page: bool) -> Result<ve_gfx::Frame> {
        self.update();
        let renderer = self
            .renderer
            .get_or_insert_with(SoftwareRenderer::with_system_fonts);
        screenshot::capture_frame(
            renderer,
            &self.layout,
            &self.style_tree,
            self.viewport,
            self.scroll,
            self.scale,
            full_page,
        )
    }

    /// `screenshot` through the software renderer.
    pub fn screenshot(&mut self, full_page: bool) -> Result<Screenshot> {
        self.update();
        let renderer = self
            .renderer
            .get_or_insert_with(SoftwareRenderer::with_system_fonts);
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

    /// Directory downloads are written into.
    pub fn set_download_dir(&mut self, dir: impl Into<std::path::PathBuf>) {
        self.download_dir = Some(dir.into());
    }

    /// Completed downloads (plan A16).
    #[must_use]
    pub fn downloads(&self) -> &[CompletedDownload] {
        &self.downloads
    }

    /// Nested document fragment of an iframe, if same-origin and loaded.
    #[must_use]
    pub fn frame_document(&self, iframe: NodeId) -> Option<NodeId> {
        if self.cross_origin_frames.contains(&iframe) {
            return None;
        }
        self.doc.content_document(iframe)
    }

    /// Number of cross-origin iframe browsing contexts (plan A16).
    #[must_use]
    pub fn isolated_frame_count(&self) -> usize {
        self.isolated_frames.len()
    }

    pub(crate) fn download_dir(&self) -> std::path::PathBuf {
        self.download_dir
            .clone()
            .unwrap_or_else(|| std::env::temp_dir().join("vector-downloads"))
    }

    fn download_from_link(&mut self, link: NodeId, href: &str) -> Result<String> {
        let resolved = self.resolve_url(href).ok_or_else(|| {
            Error::invalid_params(format!("download href {href:?} is not a valid URL"))
        })?;
        let suggested = self
            .doc
            .attribute(link, "download")
            .filter(|s| !s.is_empty())
            .map_or_else(|| filename_from_url(&resolved), str::to_owned);
        self.save_download(&resolved, &suggested)
    }

    fn save_download(&mut self, url: &str, filename: &str) -> Result<String> {
        let page = self.id;
        let origin = self.url.clone();
        let loaded = if let Some(loader) = self.loader.as_mut() {
            loader
                .script_fetch(url, "GET", &[], page, Some(origin.as_str()))
                .map_err(|e| Error::step_failed(format!("download of {url} failed: {e}")))?
        } else {
            return Err(Error::capability_unsupported(
                "downloads need a loader to fetch the resource",
            ));
        };
        if loaded.status >= 400 {
            return Err(Error::step_failed(format!(
                "download of {url} returned HTTP {}",
                loaded.status
            )));
        }
        let dir = self.download_dir();
        std::fs::create_dir_all(&dir)
            .map_err(|e| Error::step_failed(format!("download dir: {e}")))?;
        let safe = sanitize_filename(filename);
        let path = dir.join(&safe);
        std::fs::write(&path, &loaded.bytes)
            .map_err(|e| Error::step_failed(format!("writing download: {e}")))?;
        let record = CompletedDownload {
            url: loaded.url,
            path: path.clone(),
            filename: safe,
            bytes: loaded.bytes.len(),
        };
        let detail = format!(
            "downloaded {} → {} ({} bytes)",
            record.url,
            record.path.display(),
            record.bytes
        );
        self.downloads.push(record);
        Ok(detail)
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
        let mut dialogs = self.pending_dialogs.clone();
        for id in self.doc.elements() {
            if self
                .doc
                .element(id)
                .is_some_and(|e| e.is_html("dialog") && e.has_attr("open"))
            {
                dialogs.push(DialogEntry {
                    type_: "dialog".into(),
                    message: self.doc.text_content(id),
                });
            }
        }
        dialogs
    }

    /// Accepts or dismisses a pending script dialog or an open `<dialog>`.
    pub(crate) fn resolve_dialog(
        &mut self,
        action: crate::steps::DialogAction,
        prompt_text: Option<&str>,
    ) -> Result<String> {
        if !self.pending_dialogs.is_empty() {
            let pending = self.pending_dialogs.remove(0);
            self.dialog_reply = match action {
                crate::steps::DialogAction::Accept => {
                    Some(prompt_text.unwrap_or("true").to_owned())
                }
                crate::steps::DialogAction::Dismiss => Some(String::new()),
            };
            return Ok(format!("{:?} script {} dialog", action, pending.type_));
        }
        let open = self.doc.elements().find(|&id| {
            self.doc
                .element(id)
                .is_some_and(|e| e.is_html("dialog") && e.has_attr("open"))
        });
        if let Some(id) = open {
            let _ = self.doc.remove_attribute(id, "open");
            return Ok(format!("{:?} <dialog> {}", action, ref_for(id)));
        }
        Err(Error::step_failed("no dialog is pending"))
    }
}

/// Decodes a text subresource (CSS, JS) using the transport charset, the
/// same way the document decoder does (UTF-8 with BOM/meta sniffing).
fn decode_text(bytes: &[u8], content_type: Option<&str>) -> String {
    let charset = content_type.and_then(|ct| {
        ct.split(';').skip(1).find_map(|p| {
            let (k, v) = p.trim().split_once('=')?;
            k.trim()
                .eq_ignore_ascii_case("charset")
                .then(|| v.trim().trim_matches('"').to_owned())
        })
    });
    ve_html::decode_html_bytes(bytes, charset.as_deref()).text
}

/// `true` for a `<script>` the engine should treat as JavaScript: no type,
/// a JavaScript MIME type, or `module`. Data blocks (JSON, importmap,
/// templates) are skipped.
fn script_is_classic_or_module(doc: &Document, id: NodeId) -> bool {
    let Some(e) = doc.element(id) else {
        return false;
    };
    if e.name != "script" || (e.namespace != Namespace::Html && e.namespace != Namespace::Svg) {
        return false;
    }
    match doc.attribute(id, "type").map(str::trim) {
        None | Some("") => true,
        Some(t) => {
            let t = t.to_ascii_lowercase();
            t == "module"
                || t == "text/javascript"
                || t == "application/javascript"
                || t == "text/ecmascript"
                || t == "application/ecmascript"
                || t == "text/jscript"
                || t == "text/x-javascript"
        }
    }
}

pub(crate) fn rewrite_loopback_fetch(url: &str) -> String {
    let Ok(mut u) = url::Url::parse(url) else {
        return url.to_owned();
    };
    let host = u.host_str().unwrap_or("");
    let wpt = host == "web-platform.test"
        || host.ends_with(".web-platform.test")
        || host.contains("xn--");
    if !wpt || (u.scheme() != "http" && u.scheme() != "https") {
        return url.to_owned();
    }
    let port = u.port();
    let _ = u.set_host(Some("127.0.0.1"));
    if let Some(p) = port {
        let _ = u.set_port(Some(p));
    }
    u.to_string()
}

fn strip_css_imports(css: &str) -> String {
    let mut out = String::with_capacity(css.len());
    let mut rest = css;
    while let Some(i) = rest.find("@import") {
        out.push_str(&rest[..i]);
        let after = &rest[i + 7..];
        if let Some(end) = after.find(';') {
            rest = &after[end + 1..];
        } else {
            rest = "";
            break;
        }
    }
    out.push_str(rest);
    out
}

/// The `@import` targets at the head of a stylesheet (after any `@charset`
/// and `@layer` statements), in order. Media-conditioned imports are taken
/// regardless of the condition; the cascade evaluates `@media` inside.
fn same_origin_url(page: &str, other: &str) -> bool {
    match (url::Url::parse(page), url::Url::parse(other)) {
        (Ok(a), Ok(b)) => a.origin() == b.origin(),
        _ => false,
    }
}

pub(crate) fn filename_from_url(url: &str) -> String {
    url::Url::parse(url)
        .ok()
        .and_then(|u| {
            u.path_segments()
                .and_then(std::iter::Iterator::last)
                .map(str::to_owned)
        })
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "download".into())
}

pub(crate) fn sanitize_filename(name: &str) -> String {
    let trimmed = name.rsplit(['/', '\\']).next().unwrap_or(name);
    let safe: String = trimmed
        .chars()
        .map(|c| {
            if matches!(c, '/' | '\\' | '\0') {
                '_'
            } else {
                c
            }
        })
        .collect();
    if safe.is_empty() || safe == "." || safe == ".." {
        "download".into()
    } else {
        safe
    }
}

fn collect_imports(css: &str) -> Vec<String> {
    let mut out = Vec::new();
    let mut rest = css.trim_start();
    loop {
        // skip comments
        while let Some(after) = rest.strip_prefix("/*") {
            match after.find("*/") {
                Some(end) => rest = after[end + 2..].trim_start(),
                None => return out,
            }
        }
        if let Some(after) = rest.strip_prefix("@charset") {
            match after.find(';') {
                Some(end) => rest = after[end + 1..].trim_start(),
                None => return out,
            }
            continue;
        }
        if let Some(after) = rest.strip_prefix("@layer")
            && let Some(end) = after.find(';')
            && !after[..end].contains('{')
        {
            rest = after[end + 1..].trim_start();
            continue;
        }
        let Some(after) = rest.strip_prefix("@import") else {
            return out;
        };
        let Some(end) = after.find(';') else {
            return out;
        };
        let stmt = after[..end].trim();
        let target = stmt
            .strip_prefix("url(")
            .and_then(|u| u.find(')').map(|e| u[..e].trim().trim_matches(['"', '\''])))
            .or_else(|| {
                let q = stmt.chars().next()?;
                (q == '"' || q == '\'').then(|| stmt[1..].split(q).next().unwrap_or(""))
            });
        if let Some(t) = target.filter(|t| !t.is_empty()) {
            out.push(t.to_owned());
        }
        rest = after[end + 1..].trim_start();
    }
}

fn ease_unit(t: f32, timing: &str) -> f32 {
    let t = t.clamp(0.0, 1.0);
    match timing {
        "linear" => t,
        "ease-in" => t * t,
        "ease-out" => 1.0 - (1.0 - t) * (1.0 - t),
        _ => t * t * (3.0 - 2.0 * t),
    }
}

fn animation_progress(
    now: f32,
    delay: f32,
    duration: f32,
    iterations: f32,
    fill: ve_style::AnimationFillMode,
    play: ve_style::AnimationPlayState,
    direction: ve_style::AnimationDirection,
    timing: &str,
) -> Option<f32> {
    if duration <= 0.0 {
        return None;
    }
    let paused = play == ve_style::AnimationPlayState::Paused;
    if now < delay || paused && now <= delay {
        return if fill.backwards() {
            Some(ease_unit(
                match direction {
                    ve_style::AnimationDirection::Reverse
                    | ve_style::AnimationDirection::AlternateReverse => 1.0,
                    _ => 0.0,
                },
                timing,
            ))
        } else if paused {
            Some(ease_unit(0.0, timing))
        } else {
            None
        };
    }
    let elapsed = if paused { 0.0 } else { now - delay };
    let total = duration * iterations;
    if elapsed >= total && total.is_finite() {
        return if fill.forwards() {
            let end = match direction {
                ve_style::AnimationDirection::Reverse => 0.0,
                ve_style::AnimationDirection::Alternate if iterations as i32 % 2 == 0 => 0.0,
                ve_style::AnimationDirection::AlternateReverse if iterations as i32 % 2 == 1 => 0.0,
                _ => 1.0,
            };
            Some(ease_unit(end, timing))
        } else {
            None
        };
    }
    let cycle = if duration > 0.0 { elapsed / duration } else { 0.0 };
    let iter = cycle.floor();
    let mut t = cycle - iter;
    let reverse = match direction {
        ve_style::AnimationDirection::Reverse => true,
        ve_style::AnimationDirection::Alternate => iter as i32 % 2 == 1,
        ve_style::AnimationDirection::AlternateReverse => iter as i32 % 2 == 0,
        ve_style::AnimationDirection::Normal => false,
    };
    if reverse {
        t = 1.0 - t;
    }
    Some(ease_unit(t, timing))
}

/// Natural size of a `data:` image without fetching anything.
fn interpolate_keyframe_opacity(rule: &ve_style::KeyframesRule, t: f32) -> Option<f32> {
    let mut stops: Vec<(f32, f32)> = Vec::new();
    for frame in &rule.frames {
        let Some(opacity) = frame.block.declarations.iter().find_map(|d| {
            if d.property != ve_style::PropertyId::Opacity {
                return None;
            }
            match &d.value {
                ve_style::SpecifiedValue::Number(n) => Some(*n),
                ve_style::SpecifiedValue::Integer(i) => Some(*i as f32),
                ve_style::SpecifiedValue::Percentage(p) => Some(p / 100.0),
                _ => None,
            }
        }) else {
            continue;
        };
        for offset in &frame.offsets {
            stops.push((*offset, opacity));
        }
    }
    if stops.is_empty() {
        return None;
    }
    stops.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap_or(std::cmp::Ordering::Equal));
    if t <= stops[0].0 {
        return Some(stops[0].1);
    }
    if let Some(last) = stops.last()
        && t >= last.0
    {
        return Some(last.1);
    }
    for w in stops.windows(2) {
        if t >= w[0].0 && t <= w[1].0 {
            let span = (w[1].0 - w[0].0).max(f32::EPSILON);
            let u = (t - w[0].0) / span;
            return Some(w[0].1 + (w[1].1 - w[0].1) * u);
        }
    }
    Some(stops.last().map(|s| s.1).unwrap_or(1.0))
}

fn decode_data_url_image_size(data_url: &str) -> Option<(u32, u32)> {
    let bytes = decode_data_url_bytes(data_url)?;
    let size = imagesize::blob_size(&bytes).ok()?;
    Some((
        u32::try_from(size.width).ok()?,
        u32::try_from(size.height).ok()?,
    ))
}

fn decode_data_url_bytes(data_url: &str) -> Option<Vec<u8>> {
    let (meta, payload) = data_url.strip_prefix("data:")?.split_once(',')?;
    if meta.split(';').any(|p| p.eq_ignore_ascii_case("base64")) {
        base64_decode(payload)
    } else {
        Some(percent_decode(payload).into_bytes())
    }
}

fn decode_raster(bytes: &[u8]) -> Option<ve_gfx::DecodedImage> {
    decode_png_rgba(bytes).or_else(|| {
        let size = imagesize::blob_size(bytes).ok()?;
        Some(ve_gfx::DecodedImage::solid(
            u32::try_from(size.width).ok()?,
            u32::try_from(size.height).ok()?,
            [180, 180, 180, 255],
        ))
    })
}

fn decode_png_rgba(bytes: &[u8]) -> Option<ve_gfx::DecodedImage> {
    let decoder = png::Decoder::new(std::io::Cursor::new(bytes));
    let mut reader = decoder.read_info().ok()?;
    let mut buf = vec![0; reader.output_buffer_size()?];
    let info = reader.next_frame(&mut buf).ok()?;
    let used = info.buffer_size();
    let rgba = match info.color_type {
        png::ColorType::Rgba => buf[..used].to_vec(),
        png::ColorType::Rgb => {
            let mut out = Vec::with_capacity((info.width as usize) * (info.height as usize) * 4);
            for chunk in buf[..used].chunks_exact(3) {
                out.extend_from_slice(&[chunk[0], chunk[1], chunk[2], 255]);
            }
            out
        }
        _ => return None,
    };
    ve_gfx::DecodedImage::from_rgba(info.width, info.height, rgba)
}

fn base64_decode(input: &str) -> Option<Vec<u8>> {
    const TABLE: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = Vec::with_capacity(input.len() * 3 / 4);
    let mut buf = 0u32;
    let mut bits = 0u8;
    for c in input.bytes() {
        let v = match c {
            b'=' => break,
            b'-' => 62,
            b'_' => 63,
            b if b.is_ascii_whitespace() => continue,
            b => u32::try_from(TABLE.iter().position(|&t| t == b)?).ok()?,
        };
        buf = (buf << 6) | v;
        bits += 6;
        if bits >= 8 {
            bits -= 8;
            out.push(u8::try_from((buf >> bits) & 0xff).ok()?);
        }
    }
    Some(out)
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

impl Page {
    pub(crate) fn set_element_scroll_axis(&mut self, id: NodeId, axis: &str, value: f32) {
        let cur = self.element_scroll.entry(id).or_default();
        if axis == "x" {
            cur.x = value.max(0.0);
        } else {
            cur.y = value.max(0.0);
        }
        self.doc.record_scrolled(Some(id));
    }
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
                let kids = if e.is_html("template") {
                    doc.template_contents(id)
                        .map_or_else(|| doc.children(id), |frag| doc.children(frag))
                } else {
                    doc.children(id)
                };
                for c in kids {
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
                out.push_str("?>");
            }
        }
    }
    let mut out = String::new();
    write(doc, id, &mut out);
    out
}

/// Page `Worker` scripts evaluate in a dedicated V8 isolate on a worker
/// thread when the `v8` feature is on. A second isolate cannot be created on
/// the page thread inside a `HandleScope` (SIGSEGV in `rusty_v8`).
pub(crate) fn eval_worker(source: &str, msg: &str) -> Option<String> {
    #[cfg(feature = "v8")]
    if let Some(reply) = eval_worker_isolate(source, msg) {
        return Some(reply);
    }
    dispatch_worker(source, msg)
}

#[cfg(feature = "v8")]
fn eval_worker_isolate(source: &str, msg: &str) -> Option<String> {
    use std::sync::mpsc;
    use std::time::Duration;
    use ve_script::{JsValue, JsVm, V8Vm};

    let (tx, rx) = mpsc::channel();
    let source = source.to_string();
    let msg = msg.to_string();
    std::thread::Builder::new()
        .name("ve-worker".into())
        .spawn(move || {
            let out = (|| {
                let mut vm = V8Vm::new().ok()?;
                let src_lit = serde_json::to_string(&source).ok()?;
                let msg_lit = serde_json::to_string(&msg).ok()?;
                let script = format!(
                    "(function(){{\
                       var document = undefined;\
                       var window = undefined;\
                       var __out;\
                       function postMessage(m) {{ __out = m; }}\
                       function importScripts() {{}}\
                       var self = this;\
                       self.postMessage = postMessage;\
                       self.importScripts = importScripts;\
                       var onmessage = null;\
                       self.addEventListener = function (type, fn) {{\
                         if (type === 'message') onmessage = fn;\
                       }};\
                       eval({src_lit});\
                       if (typeof onmessage === 'function') {{\
                         onmessage({{ data: JSON.parse({msg_lit}) }});\
                       }}\
                       return JSON.stringify(__out);\
                     }}).call({{name:'worker'}})"
                );
                match vm.eval(&script, "vector:worker") {
                    Ok(JsValue::String(s)) => Some(s),
                    Ok(other) => Some(other.to_string()),
                    Err(_) => None,
                }
            })();
            let _ = tx.send(out);
        })
        .ok()?;
    rx.recv_timeout(Duration::from_millis(2000)).ok().flatten()
}

/// Page `Worker` scripts evaluate in a page-isolate function realm (`var document
/// = undefined`). This helper remains for host `workerPost` fallbacks. A second
/// V8 isolate cannot be created on the page thread inside a `HandleScope`
/// (SIGSEGV in `rusty_v8`).
pub(crate) fn dispatch_worker(source: &str, msg: &str) -> Option<String> {
    if !looks_like_worker_script(source) {
        return None;
    }
    let data: serde_json::Value =
        serde_json::from_str(msg).unwrap_or_else(|_| serde_json::Value::String(msg.to_owned()));
    // Inline `postMessage` arguments used to go through ve-vm. That crate is
    // deleted (H0-D4); the payload is the posted `data` JSON.
    let _ = extract_post_message_arg(source);
    Some(data.to_string())
}

fn extract_post_message_arg(source: &str) -> Option<&str> {
    let i = source.find("postMessage(")?;
    let rest = &source[i + "postMessage(".len()..];
    let mut depth = 1i32;
    let mut quote = 0u8;
    for (j, c) in rest.char_indices() {
        if quote != 0 {
            if c == quote as char {
                quote = 0;
            }
            continue;
        }
        match c {
            '"' | '\'' => quote = c as u8,
            '(' => depth += 1,
            ')' => {
                depth -= 1;
                if depth == 0 {
                    return Some(rest[..j].trim());
                }
            }
            _ => {}
        }
    }
    None
}

fn looks_like_worker_script(source: &str) -> bool {
    let t = source.trim();
    t.contains("onmessage") || t.contains("postMessage") || t.starts_with("function")
}

fn is_worker_url(source: &str) -> bool {
    let t = source.trim();
    t.starts_with("http://")
        || t.starts_with("https://")
        || t.starts_with('/')
        || t.starts_with("./")
        || std::path::Path::new(t)
            .extension()
            .is_some_and(|ext| ext.eq_ignore_ascii_case("js"))
}

/// `(body, status)` for a service-worker fetch intercept.
///
/// Supports the explicit `respond:` subset, `event.respondWith(new Response("…"))`,
/// `new Response(body, {status})`, and `Response.redirect(url)`.
/// Listeners that do not call `respondWith` leave the network response in place.
#[cfg_attr(not(feature = "v8"), allow(unused_variables))]
pub(crate) fn service_worker_intercept(
    script: &str,
    request_url: &str,
    method: &str,
) -> Option<(String, u16)> {
    let script = script.trim();
    if let Some(rest) = script.strip_prefix("respond:") {
        return Some((rest.trim().to_owned(), 200));
    }
    if !script.contains("respondWith") {
        return None;
    }
    if let Some(i) = script.find("Response.redirect(") {
        let rest = script[i + "Response.redirect(".len()..].trim_start();
        return parse_sw_redirect(rest);
    }
    if let Some(i) = script.find("new Response(")
        && let Some(parsed) =
            parse_sw_new_response(script[i + "new Response(".len()..].trim_start())
    {
        return Some(parsed);
    }
    #[cfg(feature = "v8")]
    if let Some(r) = eval_sw_fetch(script, request_url, method) {
        return Some(r);
    }
    None
}

#[cfg(feature = "v8")]
fn eval_sw_fetch(script: &str, request_url: &str, method: &str) -> Option<(String, u16)> {
    use std::sync::mpsc;
    use std::time::Duration;
    use ve_script::{JsValue, JsVm, V8Vm};

    let (tx, rx) = mpsc::channel();
    let script = script.to_string();
    let request_url = request_url.to_string();
    let method = method.to_string();
    std::thread::Builder::new()
        .name("ve-sw".into())
        .spawn(move || {
            let out = (|| {
                let mut vm = V8Vm::new().ok()?;
                let src_lit = serde_json::to_string(&script).ok()?;
                let url_lit = serde_json::to_string(&request_url).ok()?;
                let method_lit = serde_json::to_string(&method).ok()?;
                let js = format!(
                    "(function(){{\
                       var __body, __status = 200;\
                       function Response(body, init) {{\
                         this.body = body;\
                         this.status = (init && init.status) || 200;\
                       }}\
                       Response.redirect = function (url, status) {{\
                         return {{ body: String(url), status: status || 302 }};\
                       }};\
                       function FetchEvent() {{\
                         this.request = {{ url: {url_lit}, method: {method_lit} }};\
                         this.respondWith = function (r) {{\
                           __body = r && r.body != null ? String(r.body) : String(r);\
                           __status = (r && r.status) || 200;\
                         }};\
                       }}\
                       var onfetch = null;\
                       var self = {{\
                         addEventListener: function (t, fn) {{\
                           if (t === 'fetch') onfetch = fn;\
                         }}\
                       }};\
                       eval({src_lit});\
                       if (typeof onfetch === 'function') onfetch(new FetchEvent());\
                       return JSON.stringify({{ body: __body, status: __status }});\
                     }})()"
                );
                match vm.eval(&js, "vector:sw") {
                    Ok(JsValue::String(s)) => {
                        let v: serde_json::Value = serde_json::from_str(&s).ok()?;
                        let body = v.get("body")?.as_str()?.to_owned();
                        let status = u16::try_from(v.get("status")?.as_u64()?).ok()?;
                        Some((body, status))
                    }
                    _ => None,
                }
            })();
            let _ = tx.send(out);
        })
        .ok()?;
    rx.recv_timeout(Duration::from_millis(2000)).ok().flatten()
}

/// Service-worker install/activate outcome.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub(crate) struct SwLifecycle {
    pub install: bool,
    pub activate: bool,
    pub skip_waiting: bool,
    pub claim: bool,
}

pub(crate) fn eval_sw_lifecycle(script: &str) -> SwLifecycle {
    #[cfg(feature = "v8")]
    if let Some(got) = eval_sw_lifecycle_isolate(script) {
        return got;
    }
    SwLifecycle {
        install: has_sw_listener(script, "install"),
        activate: has_sw_listener(script, "activate"),
        skip_waiting: script.contains("skipWaiting"),
        claim: script.contains("clients.claim") || script.contains("clients.claim("),
    }
}

fn has_sw_listener(script: &str, name: &str) -> bool {
    let quoted = [
        format!("'{name}'"),
        format!("\"{name}\""),
        format!("`{name}`"),
    ];
    quoted.iter().any(|q| script.contains(q)) || script.contains(&format!("on{name}"))
}

#[cfg(feature = "v8")]
fn eval_sw_lifecycle_isolate(script: &str) -> Option<SwLifecycle> {
    use std::sync::mpsc;
    use std::time::Duration;
    use ve_script::{JsValue, JsVm, V8Vm};

    let (tx, rx) = mpsc::channel();
    let script = script.to_string();
    std::thread::Builder::new()
        .name("ve-sw-life".into())
        .spawn(move || {
            let out = (|| {
                let mut vm = V8Vm::new().ok()?;
                let src_lit = serde_json::to_string(&script).ok()?;
                let js = format!(
                    "(function(){{\
                       var __install = false, __activate = false, __skip = false, __claim = false;\
                       function ExtendableEvent() {{ this.waitUntil = function () {{}}; }}\
                       var installFn = null, activateFn = null;\
                       var self = {{\
                         skipWaiting: function () {{ __skip = true; }},\
                         addEventListener: function (t, fn) {{\
                           if (t === 'install') installFn = fn;\
                           if (t === 'activate') activateFn = fn;\
                         }},\
                         clients: {{ claim: function () {{ __claim = true; }} }}\
                       }};\
                       eval({src_lit});\
                       if (typeof oninstall === 'function') installFn = oninstall;\
                       if (typeof onactivate === 'function') activateFn = onactivate;\
                       if (typeof installFn === 'function') {{ __install = true; installFn(new ExtendableEvent()); }}\
                       if (typeof activateFn === 'function') {{ __activate = true; activateFn(new ExtendableEvent()); }}\
                       return JSON.stringify({{ install: __install, activate: __activate, skipWaiting: __skip, claim: __claim }});\
                     }})()"
                );
                match vm.eval(&js, "vector:sw-life") {
                    Ok(JsValue::String(s)) => {
                        let v: serde_json::Value = serde_json::from_str(&s).ok()?;
                        Some(SwLifecycle {
                            install: v.get("install")?.as_bool()?,
                            activate: v.get("activate")?.as_bool()?,
                            skip_waiting: v.get("skipWaiting")?.as_bool()?,
                            claim: v.get("claim").and_then(|c| c.as_bool()).unwrap_or(false),
                        })
                    }
                    _ => None,
                }
            })();
            let _ = tx.send(out);
        })
        .ok()?;
    rx.recv_timeout(Duration::from_millis(2000)).ok().flatten()
}

fn matching_paren(s: &str) -> Option<usize> {
    let mut depth = 1i32;
    let mut quote = 0u8;
    for (j, c) in s.char_indices() {
        if quote != 0 {
            if c as u8 == quote {
                quote = 0;
            }
            continue;
        }
        match c {
            '"' | '\'' => quote = c as u8,
            '(' => depth += 1,
            ')' => {
                depth -= 1;
                if depth == 0 {
                    return Some(j);
                }
            }
            _ => {}
        }
    }
    None
}

fn split_js_string_args(args: &str) -> Vec<String> {
    let mut out = Vec::new();
    let mut rest = args.trim();
    while !rest.is_empty() {
        rest = rest.trim_start_matches([',', ' ', '\n', '\t', '\r']);
        if rest.is_empty() {
            break;
        }
        if let Some((s, after)) = parse_sw_quoted(rest) {
            out.push(s.to_owned());
            rest = after;
        } else {
            break;
        }
    }
    out
}

fn parse_sw_quoted(s: &str) -> Option<(&str, &str)> {
    let s = s.trim_start();
    let q = s.chars().next()?;
    if q != '"' && q != '\'' && q != '`' {
        return None;
    }
    let rest = &s[q.len_utf8()..];
    let end = rest.find(q)?;
    Some((&rest[..end], &rest[end + q.len_utf8()..]))
}

fn parse_sw_redirect(rest: &str) -> Option<(String, u16)> {
    let (url, after) = parse_sw_quoted(rest)?;
    let after = after.trim_start();
    let status = if let Some(rest) = after.strip_prefix(',') {
        parse_leading_u16(rest.trim_start()).unwrap_or(302)
    } else {
        302
    };
    Some((url.to_owned(), status))
}

fn parse_sw_new_response(rest: &str) -> Option<(String, u16)> {
    let (body, after) = parse_sw_quoted(rest)?;
    let after = after.trim_start();
    let status = if let Some(rest) = after.strip_prefix(',') {
        parse_status_option(rest.trim_start()).unwrap_or(200)
    } else {
        200
    };
    Some((body.to_owned(), status))
}

fn parse_leading_u16(s: &str) -> Option<u16> {
    let digits: String = s.chars().take_while(|c| c.is_ascii_digit()).collect();
    digits.parse().ok()
}

fn parse_status_option(s: &str) -> Option<u16> {
    let lower = s.to_ascii_lowercase();
    let i = lower.find("status")?;
    let rest = s[i + 6..].trim_start().trim_start_matches(':').trim_start();
    parse_leading_u16(rest)
}

fn parse_css_color(s: &str) -> [u8; 4] {
    let t = s.trim();
    if let Some(hex) = t.strip_prefix('#') {
        let expand = |c: u8| -> u8 { (c << 4) | c };
        let digit = |c: u8| -> Option<u8> {
            Some(match c {
                b'0'..=b'9' => c - b'0',
                b'a'..=b'f' => c - b'a' + 10,
                b'A'..=b'F' => c - b'A' + 10,
                _ => return None,
            })
        };
        let b = hex.as_bytes();
        if b.len() == 3 {
            if let (Some(r), Some(g), Some(bl)) = (digit(b[0]), digit(b[1]), digit(b[2])) {
                return [expand(r), expand(g), expand(bl), 255];
            }
        }
        if b.len() == 6 {
            if let (Some(r1), Some(r0), Some(g1), Some(g0), Some(b1), Some(b0)) = (
                digit(b[0]),
                digit(b[1]),
                digit(b[2]),
                digit(b[3]),
                digit(b[4]),
                digit(b[5]),
            ) {
                return [(r1 << 4) | r0, (g1 << 4) | g0, (b1 << 4) | b0, 255];
            }
        }
    }
    match t.to_ascii_lowercase().as_str() {
        "white" => [255, 255, 255, 255],
        "red" => [255, 0, 0, 255],
        "blue" => [0, 0, 255, 255],
        "green" => [0, 128, 0, 255],
        "transparent" => [0, 0, 0, 0],
        _ => [0, 0, 0, 255],
    }
}

/// Current wall-clock time in Unix milliseconds (for `startedAt`).
#[must_use]
pub fn now_millis() -> u64 {
    unix_millis()
}
