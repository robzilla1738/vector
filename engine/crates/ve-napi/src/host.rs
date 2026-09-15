//! The engine host: one `VectorEngine` per browsing context, owned by a
//! dedicated thread. Every Node call becomes a job sent over a channel and
//! answered through a one-shot reply channel, so page work never runs on
//! the Node event loop.
//!
//! The host speaks the runtime's wire shapes (contracts `Step`,
//! `ProgramResult`, `ObservationContent`) and translates them to the engine
//! facade (`ve-api` / `ve-agent`). When core lands richer `ve-api` calls
//! (`ve_page_observe`, `ve_page_execute`, …) the translation in
//! [`HostState`] shrinks and the channel plumbing stays as is.

use std::collections::HashMap;
use std::sync::mpsc::{self, Receiver, Sender};
use std::thread;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use serde_json::{Map, Value, json};
use ve_a11y::SnapshotFormat;
use ve_agent::{Executor, Page, Presence, Program, Step as EngineStep, Target, WaitCondition};
use ve_api::{EngineConfig, OpenSource, PageId, VectorEngine};
use ve_core::NodeId;

use crate::classify::{Routing, classify};
use crate::errors::{ApiError, code_from_message};
use crate::observe::{ObserveRequest, RefMap, build_content, parse_ref, ref_of};

/// Settle budget (tasks) used around every step, matching the executor.
const SETTLE_BUDGET: usize = 10_000;

type Job = Box<dyn FnOnce(&mut HostState) -> Value + Send>;

/// Handle to an engine thread.
pub struct Host {
    tx: Sender<Job>,
    context_id: u32,
}

impl std::fmt::Debug for Host {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Host")
            .field("context", &self.context_id)
            .finish()
    }
}

impl Host {
    /// Spawns the engine thread for one browsing context.
    #[must_use]
    pub fn spawn(config: EngineConfig, context_id: u32) -> Self {
        let (tx, rx) = mpsc::channel::<Job>();
        thread::Builder::new()
            .name(format!("ve-context-{context_id}"))
            .spawn(move || {
                let mut state = HostState::new(config, context_id);
                while let Ok(job) = rx.recv() {
                    let _ = job(&mut state);
                }
            })
            .expect("spawn engine thread");
        Self { tx, context_id }
    }

    /// The context this host serves.
    #[must_use]
    pub fn context_id(&self) -> u32 {
        self.context_id
    }

    /// Queues a job; the receiver yields its JSON result.
    pub fn call<F>(&self, f: F) -> Receiver<Value>
    where
        F: FnOnce(&mut HostState) -> Value + Send + 'static,
    {
        let (reply, rx) = mpsc::channel();
        let job: Job = Box::new(move |state| {
            let v = f(state);
            let _ = reply.send(v.clone());
            v
        });
        if self.tx.send(job).is_err() {
            let (reply, rx) = mpsc::channel();
            let _ = reply.send(err_value(&ApiError::new(
                "backend_unavailable",
                "engine thread has stopped",
            )));
            return rx;
        }
        rx
    }

    /// Runs a job and waits for it (tests and synchronous callers).
    pub fn call_blocking<F>(&self, f: F) -> Value
    where
        F: FnOnce(&mut HostState) -> Value + Send + 'static,
    {
        self.call(f).recv().unwrap_or_else(|_| {
            err_value(&ApiError::new(
                "backend_unavailable",
                "engine thread has stopped",
            ))
        })
    }
}

/// Wraps a result as `{ok:true, …}` / `{ok:false, error}`.
#[must_use]
pub fn wrap(result: Result<Value, ApiError>) -> Value {
    match result {
        Ok(mut v) => {
            if let Some(obj) = v.as_object_mut() {
                obj.insert("ok".into(), Value::Bool(true));
                v
            } else {
                json!({ "ok": true, "result": v })
            }
        }
        Err(e) => err_value(&e),
    }
}

fn err_value(e: &ApiError) -> Value {
    json!({ "ok": false, "error": e.to_json() })
}

/// Per-page bookkeeping the engine facade does not track itself.
#[derive(Debug, Default)]
pub struct PageMeta {
    /// Refs handed out at the last observation.
    pub refs: RefMap,
    /// Document epoch: incremented on every completed navigation.
    pub generation: u64,
    /// Classification of the current document.
    pub routing: Routing,
    /// Last title reported to Node (for change events).
    pub title: Option<String>,
}

/// State owned by the engine thread.
pub struct HostState {
    engine: VectorEngine,
    executor: Executor,
    /// Global page id → (engine page id, bookkeeping).
    pages: HashMap<u64, (PageId, PageMeta)>,
    context_id: u32,
}

impl std::fmt::Debug for HostState {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("HostState")
            .field("context", &self.context_id)
            .field("pages", &self.pages.len())
            .finish_non_exhaustive()
    }
}

/// Options for [`HostState::execute`].
#[derive(Clone, Debug, Default, serde::Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct ExecuteOptions {
    /// Observe the page after the last step, in the same call.
    pub return_observation: Option<ObserveRequest>,
    /// Continue after a non-optional failure (default false).
    pub stop_on_error: Option<bool>,
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |d| u64::try_from(d.as_millis()).unwrap_or(u64::MAX))
}

fn str_of<'a>(step: &'a Value, key: &str) -> Option<&'a str> {
    step.get(key).and_then(Value::as_str)
}

fn read_file_url(url: &str) -> Result<(String, String), ApiError> {
    let parsed =
        url::Url::parse(url).map_err(|e| ApiError::invalid(format!("bad URL {url}: {e}")))?;
    let path = parsed
        .to_file_path()
        .map_err(|()| ApiError::invalid(format!("not a local file URL: {url}")))?;
    let html = std::fs::read_to_string(&path).map_err(|e| {
        ApiError::new(
            "step_failed",
            format!("cannot read {}: {e}", path.display()),
        )
    })?;
    Ok((html, parsed.to_string()))
}

impl HostState {
    fn new(config: EngineConfig, context_id: u32) -> Self {
        Self {
            engine: VectorEngine::new(config),
            executor: Executor::new(),
            pages: HashMap::new(),
            context_id,
        }
    }

    /// The context id.
    #[must_use]
    pub fn context_id(&self) -> u32 {
        self.context_id
    }

    fn page(&mut self, global: u64) -> Result<(&mut ve_agent::DomPage, &mut PageMeta), ApiError> {
        let (id, meta) = self
            .pages
            .get_mut(&global)
            .ok_or_else(|| ApiError::new("target_detached", format!("no such page {global}")))?;
        let page = self.engine.page_mut(*id)?;
        Ok((page, meta))
    }

    /// Opens `url` as global page `global`. `file:` URLs are read locally so
    /// static fixtures can be opened without a server.
    pub fn open(&mut self, global: u64, url: &str) -> Value {
        wrap(self.open_inner(global, url))
    }

    fn open_inner(&mut self, global: u64, url: &str) -> Result<Value, ApiError> {
        if self.pages.contains_key(&global) {
            return Err(ApiError::new(
                "conflict",
                format!("page {global} already open"),
            ));
        }
        let source = if url.starts_with("file:") {
            let (html, url) = read_file_url(url)?;
            OpenSource::Html {
                html,
                url: Some(url),
            }
        } else {
            OpenSource::Url {
                url: url.to_owned(),
            }
        };
        let id = self.engine.open(source)?;
        let page = self.engine.page(id)?;
        let routing = classify(page.document());
        let readiness = page.readiness();
        let title = page.document().title();
        let out = json!({
            "page": global,
            "context": self.context_id,
            "url": page.url(),
            "title": title,
            "generation": 0,
            "revision": page.document().revision().0,
            "settled": readiness.is_ready(),
            "routing": routing,
            // populated once ve-api surfaces response metadata (core track)
            "responses": [],
        });
        self.pages.insert(
            global,
            (
                id,
                PageMeta {
                    routing,
                    title,
                    ..PageMeta::default()
                },
            ),
        );
        Ok(out)
    }

    /// Closes a page; `true` if it was open.
    pub fn close(&mut self, global: u64) -> Value {
        let closed = match self.pages.remove(&global) {
            Some((id, _)) => self.engine.close(id),
            None => false,
        };
        json!({ "ok": true, "closed": closed })
    }

    /// Open global page ids.
    #[must_use]
    pub fn page_ids(&self) -> Vec<u64> {
        let mut v: Vec<u64> = self.pages.keys().copied().collect();
        v.sort_unstable();
        v
    }

    /// Observes a page: `{ ok, content, revision, generation, settled, changed? }`.
    pub fn observe(&mut self, global: u64, req: &ObserveRequest) -> Value {
        wrap(self.observe_inner(global, req))
    }

    fn observe_inner(&mut self, global: u64, req: &ObserveRequest) -> Result<Value, ApiError> {
        let (page, meta) = self.page(global)?;
        let readiness = page.settle(SETTLE_BUDGET);
        let snapshot = match (req.scope.as_deref(), req.subtree_ref.as_deref()) {
            (Some("subtree"), Some(r)) => {
                let id = resolve_ref(page, meta, r)?;
                page.snapshot_of(id, SnapshotFormat::Full).ok_or_else(|| {
                    ApiError::new("not_found", format!("{r} has no accessible subtree"))
                })?
            }
            _ => page.snapshot(SnapshotFormat::Full),
        };
        meta.refs.absorb(&snapshot);
        let content = build_content(page, &snapshot, req);
        let changed = req
            .since_revision
            .and_then(|s| ve_a11y::changed_refs_since(page.document(), ve_core::Revision(s)))
            .map(|ids| ids.into_iter().map(ref_of).collect::<Vec<_>>());
        meta.title = page.document().title();
        Ok(json!({
            "content": content,
            "revision": page.document().revision().0,
            "generation": meta.generation,
            "settled": readiness.is_ready(),
            "blockers": readiness.blockers(),
            "changed": changed,
        }))
    }

    /// Runs contracts steps against a page and returns a `ProgramResult`
    /// (`status`, `steps`, `extracted`, `error`) plus `url`, `generation`,
    /// `title`, `revision` and, when requested, `observation`.
    pub fn execute(&mut self, global: u64, steps: &[Value], opts: &ExecuteOptions) -> Value {
        wrap(self.execute_inner(global, steps, opts))
    }

    fn execute_inner(
        &mut self,
        global: u64,
        steps: &[Value],
        opts: &ExecuteOptions,
    ) -> Result<Value, ApiError> {
        let executor = self.executor;
        let stop_on_error = opts.stop_on_error.unwrap_or(true);
        let mut outcomes = Vec::with_capacity(steps.len());
        let mut extracted = Map::new();
        let mut failed: Option<String> = None;
        let generation_before = self.page(global)?.1.generation;
        for step in steps {
            let id = str_of(step, "id").unwrap_or("").to_owned();
            let op = str_of(step, "op").unwrap_or("").to_owned();
            if failed.is_some() && stop_on_error {
                outcomes.push(json!({
                    "stepId": id, "op": op, "status": "skipped", "startedAt": now_ms(), "durationMs": 0
                }));
                continue;
            }
            let started_at = now_ms();
            let start = Instant::now();
            let (page, meta) = self.page(global)?;
            let result = run_step(page, meta, &executor, step);
            let duration = u64::try_from(start.elapsed().as_millis()).unwrap_or(u64::MAX);
            let mut outcome = json!({
                "stepId": id, "op": op, "startedAt": started_at, "durationMs": duration
            });
            match result {
                Ok(out) => {
                    outcome["status"] = json!("ok");
                    if let Some(detail) = out.detail {
                        outcome["detail"] = json!(detail);
                    }
                    if let Some(ex) = out.extracted {
                        let key = str_of(step, "as").unwrap_or("fields").to_owned();
                        outcome["extracted"] = ex.clone();
                        extracted.insert(key, ex);
                    }
                }
                Err(e) => {
                    outcome["status"] = json!("failed");
                    outcome["error"] = e.to_json();
                    let optional = step
                        .get("optional")
                        .and_then(Value::as_bool)
                        .unwrap_or(false);
                    if !optional && failed.is_none() {
                        failed = Some(e.message.clone());
                    }
                }
            }
            outcomes.push(outcome);
        }
        let (page, meta) = self.page(global)?;
        let title = page.document().title();
        let title_changed = title != meta.title;
        meta.title.clone_from(&title);
        let mut out = json!({
            "status": if failed.is_some() { "failed" } else { "completed" },
            "steps": outcomes,
            "extracted": if extracted.is_empty() { Value::Null } else { Value::Object(extracted) },
            "error": failed,
            "url": page.url(),
            "title": title,
            "titleChanged": title_changed,
            "generation": meta.generation,
            "navigated": meta.generation != generation_before,
            "revision": page.document().revision().0,
            "responses": [],
        });
        if let Some(req) = &opts.return_observation {
            out["observation"] = self.observe_inner(global, req)?;
        }
        Ok(out)
    }

    /// Cookies of this context, optionally filtered to those sent to `url`.
    pub fn get_cookies(&self, url: Option<&str>) -> Value {
        wrap((|| {
            let net = self.engine.network();
            let net = net.borrow();
            let now = SystemTime::now();
            let cookies: Vec<&ve_net::Cookie> = match url {
                Some(u) => {
                    let parsed = url::Url::parse(u)
                        .map_err(|e| ApiError::invalid(format!("bad URL {u}: {e}")))?;
                    net.cookies.cookies_for(&parsed, now)
                }
                None => net.cookies.iter().collect(),
            };
            let list: Vec<Value> = cookies.iter().map(|c| cookie_json(c)).collect();
            Ok(json!({ "cookies": list }))
        })())
    }

    /// Stores cookies (`BrowserCookie[]` shape). Returns the count stored.
    pub fn set_cookies(&self, cookies: &[Value]) -> Value {
        wrap((|| {
            let net = self.engine.network();
            let mut net = net.borrow_mut();
            let mut count = 0usize;
            for c in cookies {
                let cookie = cookie_from_json(c)?;
                net.cookies.store(cookie);
                count += 1;
            }
            Ok(json!({ "count": count }))
        })())
    }
}

fn cookie_json(c: &ve_net::Cookie) -> Value {
    json!({
        "name": c.name,
        "value": c.value,
        "domain": if c.host_only { c.domain.clone() } else { format!(".{}", c.domain) },
        "path": c.path,
        "secure": c.secure,
        "httpOnly": c.http_only,
        "sameSite": match c.same_site {
            ve_net::SameSite::Strict => "Strict",
            ve_net::SameSite::Lax => "Lax",
            ve_net::SameSite::None => "None",
        },
        "expires": c.expires.and_then(|t| t.duration_since(UNIX_EPOCH).ok()).map(|d| d.as_secs()),
    })
}

fn cookie_from_json(v: &Value) -> Result<ve_net::Cookie, ApiError> {
    let name = str_of(v, "name").ok_or_else(|| ApiError::invalid("cookie.name required"))?;
    let domain_raw =
        str_of(v, "domain").ok_or_else(|| ApiError::invalid("cookie.domain required"))?;
    let host_only = !domain_raw.starts_with('.');
    let domain = domain_raw.trim_start_matches('.').to_ascii_lowercase();
    let same_site = match str_of(v, "sameSite") {
        Some("Strict") => ve_net::SameSite::Strict,
        Some("None") => ve_net::SameSite::None,
        _ => ve_net::SameSite::Lax,
    };
    let expires = v
        .get("expires")
        .and_then(Value::as_f64)
        .filter(|s| *s > 0.0)
        .map(|s| UNIX_EPOCH + Duration::from_secs_f64(s));
    Ok(ve_net::Cookie {
        name: name.to_owned(),
        value: str_of(v, "value").unwrap_or("").to_owned(),
        domain,
        host_only,
        path: str_of(v, "path")
            .filter(|p| !p.is_empty())
            .unwrap_or("/")
            .to_owned(),
        expires,
        secure: v.get("secure").and_then(Value::as_bool).unwrap_or(false),
        http_only: v.get("httpOnly").and_then(Value::as_bool).unwrap_or(false),
        same_site,
    })
}

/// Whether `id` is a control that submits its form (`<button>` not of type
/// button/reset, `<input type=submit|image>`).
fn is_submit_control(doc: &ve_dom::Document, id: NodeId) -> bool {
    let Some(e) = doc.element(id) else {
        return false;
    };
    if e.is_html("button") {
        return !e
            .attr("type")
            .is_some_and(|t| t.eq_ignore_ascii_case("button") || t.eq_ignore_ascii_case("reset"));
    }
    e.is_html("input")
        && e.attr("type")
            .is_some_and(|t| t.eq_ignore_ascii_case("submit") || t.eq_ignore_ascii_case("image"))
}

fn form_of(doc: &ve_dom::Document, id: NodeId) -> Option<NodeId> {
    doc.ancestors(id)
        .find(|&a| doc.element(a).is_some_and(|e| e.is_html("form")))
}

/// Form submission shim for M1 (architecture §6 lists it under click
/// activation; `ve-agent` does not implement it yet). GET forms build the
/// query string from the successful controls and navigate; anything else
/// is `capability_unsupported` so the router replays on Chromium.
fn submit_form(
    page: &mut ve_agent::DomPage,
    form: NodeId,
    submitter: Option<NodeId>,
) -> Result<String, ApiError> {
    let doc = page.document();
    let method = doc
        .attribute(form, "method")
        .map_or_else(|| "get".to_owned(), str::to_ascii_lowercase);
    if method != "get" {
        return Err(ApiError::unsupported(format!("form {method} submission")));
    }
    let base = page
        .url()
        .and_then(|u| url::Url::parse(u).ok())
        .ok_or_else(|| ApiError::new("step_failed", "form submission needs a document URL"))?;
    let action = doc.attribute(form, "action").unwrap_or("");
    let mut target = base
        .join(action)
        .map_err(|e| ApiError::invalid(format!("form action {action:?}: {e}")))?;
    let mut pairs: Vec<(String, String)> = Vec::new();
    for id in doc.descendants(form) {
        let Some(e) = doc.element(id) else { continue };
        let Some(name) = e.attr("name").filter(|n| !n.is_empty()) else {
            continue;
        };
        if e.has_attr("disabled") {
            continue;
        }
        let value = match e.name.as_str() {
            "input" => {
                let ty = e
                    .attr("type")
                    .map_or_else(|| "text".to_owned(), str::to_ascii_lowercase);
                match ty.as_str() {
                    "checkbox" | "radio" => {
                        if !doc.is_checked(id) {
                            continue;
                        }
                        doc.form_value(id)
                            .or_else(|| e.attr("value").map(str::to_owned))
                            .unwrap_or_else(|| "on".to_owned())
                    }
                    "submit" | "image" | "button" | "reset" | "file" => {
                        if submitter != Some(id) {
                            continue;
                        }
                        e.attr("value").unwrap_or("").to_owned()
                    }
                    _ => doc
                        .form_value(id)
                        .or_else(|| e.attr("value").map(str::to_owned))
                        .unwrap_or_default(),
                }
            }
            "textarea" => doc.form_value(id).unwrap_or_else(|| doc.text_content(id)),
            "select" => {
                let Some(opt) = doc
                    .descendants(id)
                    .filter(|&d| doc.element(d).is_some_and(|o| o.is_html("option")))
                    .find(|&d| doc.is_selected(d))
                else {
                    continue;
                };
                doc.attribute(opt, "value")
                    .map_or_else(|| doc.text_content(opt).trim().to_owned(), str::to_owned)
            }
            "button" => {
                if submitter != Some(id) {
                    continue;
                }
                e.attr("value").unwrap_or("").to_owned()
            }
            _ => continue,
        };
        pairs.push((name.to_owned(), value));
    }
    target.query_pairs_mut().clear().extend_pairs(pairs);
    let url = target.to_string();
    page.navigate(&url)?;
    Ok(url)
}

/// After a click: submit the enclosing form when the target was a submit
/// control. Returns the submission URL when one was started.
fn submit_after_click(
    page: &mut ve_agent::DomPage,
    id: NodeId,
) -> Result<Option<String>, ApiError> {
    let doc = page.document();
    if !is_submit_control(doc, id) || doc.attribute(id, "disabled").is_some() {
        return Ok(None);
    }
    let Some(form) = form_of(doc, id) else {
        return Ok(None);
    };
    if page.readiness().navigation_pending {
        return Ok(Some("(pending)".into()));
    }
    submit_form(page, form, Some(id)).map(Some)
}

/// Implicit submission: Enter in a single-line text control submits its form
/// through the default button. Returns the submission URL when one was started.
fn submit_after_enter(
    page: &mut ve_agent::DomPage,
    focused: Option<NodeId>,
) -> Result<Option<String>, ApiError> {
    let Some(id) = focused else {
        return Ok(None);
    };
    let doc = page.document();
    let Some(e) = doc.element(id) else {
        return Ok(None);
    };
    if !e.is_html("input")
        || e.attr("type").is_some_and(|t| {
            matches!(
                t.to_ascii_lowercase().as_str(),
                "checkbox" | "radio" | "button" | "submit" | "reset" | "hidden" | "image" | "file"
            )
        })
    {
        return Ok(None);
    }
    let Some(form) = form_of(doc, id) else {
        return Ok(None);
    };
    if page.readiness().navigation_pending {
        return Ok(Some("(pending)".into()));
    }
    let submitter = doc.descendants(form).find(|&d| is_submit_control(doc, d));
    submit_form(page, form, submitter).map(Some)
}

/// Output of one step.
#[derive(Debug, Default)]
struct StepOut {
    detail: Option<String>,
    extracted: Option<Value>,
}

impl StepOut {
    fn none() -> Self {
        Self::default()
    }
    fn detail(d: impl Into<String>) -> Self {
        Self {
            detail: Some(d.into()),
            extracted: None,
        }
    }
}

/// Resolves a contracts target string (`r12`, `css:…`, `text:…`,
/// `role=button[name=Save]`, bare CSS) to an engine target.
fn parse_target(
    meta: &PageMeta,
    page: &ve_agent::DomPage,
    target: &str,
) -> Result<Target, ApiError> {
    if let Some(index) = parse_ref(target) {
        let id = lookup_ref(page, meta, index).ok_or_else(|| {
            ApiError::new(
                "not_found",
                format!("ref {target} is unknown — observe the page first"),
            )
        })?;
        return Ok(Target::Ref {
            reference: id.to_string(),
        });
    }
    if let Some(css) = target.strip_prefix("css:") {
        return Ok(Target::selector(css));
    }
    if let Some(text) = target.strip_prefix("text:") {
        return Ok(Target::Text {
            text: text.to_owned(),
        });
    }
    if target.starts_with("xpath:") {
        return Err(ApiError::unsupported("xpath targets"));
    }
    if let Some(rest) = target.strip_prefix("role=") {
        let (role, name) = match rest.find("[name=") {
            Some(i) => (
                &rest[..i],
                Some(rest[i + 6..].trim_end_matches(']').trim_matches('"')),
            ),
            None => (rest, None),
        };
        return Ok(Target::role(role, name));
    }
    Ok(Target::selector(target))
}

fn lookup_ref(page: &ve_agent::DomPage, meta: &PageMeta, index: u32) -> Option<NodeId> {
    meta.refs
        .get(index)
        .or_else(|| page.document().elements().find(|id| id.index() == index))
}

fn resolve_ref(page: &ve_agent::DomPage, meta: &PageMeta, r: &str) -> Result<NodeId, ApiError> {
    let index = parse_ref(r).ok_or_else(|| ApiError::invalid(format!("{r} is not a ref")))?;
    let id = lookup_ref(page, meta, index).ok_or_else(|| {
        ApiError::new(
            "not_found",
            format!("ref {r} is unknown — observe the page first"),
        )
    })?;
    if !page.document().contains(id) {
        return Err(ApiError::new(
            "target_detached",
            format!("ref {r} no longer exists"),
        ));
    }
    Ok(id)
}

fn first(page: &ve_agent::DomPage, meta: &mut PageMeta, target: &str) -> Result<NodeId, ApiError> {
    let t = parse_target(meta, page, target)?;
    let ids = page.resolve(&t)?;
    let id = ids[0];
    meta.refs.insert(id);
    Ok(id)
}

fn required_str<'a>(step: &'a Value, key: &str) -> Result<&'a str, ApiError> {
    str_of(step, key).ok_or_else(|| {
        ApiError::invalid(format!(
            "step {} ({}) requires `{key}`",
            str_of(step, "id").unwrap_or("?"),
            str_of(step, "op").unwrap_or("?")
        ))
    })
}

fn engine_step(
    page: &mut ve_agent::DomPage,
    executor: &Executor,
    step: EngineStep,
) -> Result<Option<Value>, ApiError> {
    let report = executor.run(page, &Program::new(vec![step]));
    let result = report
        .results
        .into_iter()
        .next()
        .ok_or_else(|| ApiError::new("internal", "executor produced no result"))?;
    match result.status {
        ve_agent::StepStatus::Ok => Ok(result.output),
        ve_agent::StepStatus::Failed { error } => {
            Err(ApiError::new(code_from_message(&error), error))
        }
        ve_agent::StepStatus::Skipped => Err(ApiError::new("cancelled", "step skipped")),
    }
}

/// Settles after an op and tracks navigations (generation bump + ref wipe).
fn settle_after(page: &mut ve_agent::DomPage, meta: &mut PageMeta) -> Result<bool, ApiError> {
    let navigating = page.readiness().navigation_pending;
    page.settle(SETTLE_BUDGET);
    if navigating {
        if let Some(e) = page.take_last_error() {
            return Err(
                ApiError::new("step_failed", format!("navigation failed: {e}"))
                    .with_detail(json!({ "kind": "network" })),
            );
        }
        meta.generation += 1;
        meta.refs.clear();
        meta.routing = classify(page.document());
        return Ok(true);
    }
    Ok(false)
}

fn wait_condition(
    page: &mut ve_agent::DomPage,
    meta: &mut PageMeta,
    executor: &Executor,
    cond: &Value,
) -> Result<StepOut, ApiError> {
    let kind = str_of(cond, "kind").unwrap_or("");
    let timeout_ms = cond.get("timeoutMs").and_then(Value::as_u64);
    let engine_wait = |page: &mut ve_agent::DomPage, condition: WaitCondition| {
        engine_step(
            page,
            executor,
            EngineStep::WaitFor {
                condition,
                timeout_ms,
            },
        )
        .map(|o| StepOut::detail(o.map(|v| v.to_string()).unwrap_or_default()))
    };
    match kind {
        "textVisible" => {
            let text = required_str(cond, "text")?.to_owned();
            engine_wait(page, WaitCondition::Text { contains: text })
        }
        "selector" => {
            let selector = required_str(cond, "selector")?.to_owned();
            let state = match str_of(cond, "state").unwrap_or("visible") {
                "attached" => Presence::Present,
                "visible" => Presence::Visible,
                "detached" => Presence::Absent,
                other => {
                    return Err(ApiError::unsupported(format!(
                        "waitFor selector state {other:?}"
                    )));
                }
            };
            engine_wait(page, WaitCondition::Selector { selector, state })
        }
        "refReady" => {
            let r = required_str(cond, "ref")?;
            let id = resolve_ref(page, meta, r)?;
            let shown = page.style_tree().is_displayed(id)
                && page
                    .layout_tree()
                    .rect_of(id)
                    .is_some_and(|r| !r.is_empty());
            let disabled = page.document().attribute(id, "disabled").is_some();
            if shown && !disabled {
                Ok(StepOut::detail(format!("{r} actionable")))
            } else {
                Err(ApiError::new(
                    "condition_timeout",
                    format!(
                        "{r} is not actionable ({})",
                        if disabled { "disabled" } else { "not shown" }
                    ),
                ))
            }
        }
        "urlMatches" => {
            let pattern = required_str(cond, "pattern")?;
            let needle = pattern
                .strip_prefix('/')
                .and_then(|p| p.strip_suffix('/'))
                .unwrap_or(pattern);
            page.settle(SETTLE_BUDGET);
            let url = page.url().unwrap_or("");
            if url.contains(needle) {
                Ok(StepOut::detail(format!("url {url}")))
            } else {
                Err(ApiError::new(
                    "condition_timeout",
                    format!("url {url:?} does not match {pattern:?}"),
                ))
            }
        }
        "navigationSettled" | "settled" => {
            let readiness = page.settle(SETTLE_BUDGET);
            let navigated = settle_after(page, meta)?;
            Ok(StepOut::detail(format!(
                "settled={} navigated={navigated}{}",
                readiness.is_ready(),
                if readiness.is_ready() {
                    String::new()
                } else {
                    format!(": {}", readiness.blockers().join(", "))
                }
            )))
        }
        "downloadCompleted" | "response" | "expression" => {
            Err(ApiError::unsupported(format!("waitFor {kind}")))
        }
        other => Err(ApiError::invalid(format!(
            "unknown condition kind {other:?}"
        ))),
    }
}

fn extract_fields(
    page: &ve_agent::DomPage,
    meta: &PageMeta,
    fields: &[Value],
) -> Result<Value, ApiError> {
    let doc = page.document();
    let mut out = Map::new();
    for f in fields {
        let name = required_str(f, "name")?;
        let all = f.get("all").and_then(Value::as_bool).unwrap_or(false);
        let ids: Vec<NodeId> = match str_of(f, "selector") {
            Some(sel) => match page.resolve(&parse_target(meta, page, sel)?) {
                Ok(ids) => ids,
                Err(ve_core::Error::NoMatch(_)) => Vec::new(),
                Err(e) => return Err(e.into()),
            },
            None => doc.document_element().into_iter().collect(),
        };
        let one = |id: NodeId| -> Value {
            match str_of(f, "attribute") {
                // `value` means the control's current value, not the markup default
                Some("value") => doc
                    .form_value(id)
                    .or_else(|| doc.attribute(id, "value").map(str::to_owned))
                    .map_or(Value::Null, |v| json!(v)),
                Some(attr) => doc.attribute(id, attr).map_or(Value::Null, |v| json!(v)),
                None => json!(crate::classify::body_text(doc, id)),
            }
        };
        let value = if all {
            Value::Array(ids.into_iter().map(one).collect())
        } else {
            ids.first().map_or(Value::Null, |&id| one(id))
        };
        out.insert(name.to_owned(), value);
    }
    Ok(Value::Object(out))
}

/// Runs one contracts step, then `expect` conditions.
fn run_step(
    page: &mut ve_agent::DomPage,
    meta: &mut PageMeta,
    executor: &Executor,
    step: &Value,
) -> Result<StepOut, ApiError> {
    let op = str_of(step, "op").ok_or_else(|| ApiError::invalid("step without op"))?;
    page.settle(SETTLE_BUDGET);
    let out = run_op(page, meta, executor, op, step)?;
    if op != "waitFor" {
        // a failed navigation names the step that requested it (e.g. the
        // form submission URL) so the failure is diagnosable from the outcome
        settle_after(page, meta)
            .map_err(|e| e.with_detail(json!({ "kind": "network", "step": out.detail })))?;
    }
    if let Some(expects) = step.get("expect").and_then(Value::as_array) {
        for cond in expects {
            wait_condition(page, meta, executor, cond).map_err(|e| {
                ApiError::new(
                    "condition_timeout",
                    format!(
                        "expect {} failed: {}",
                        str_of(cond, "kind").unwrap_or("?"),
                        e.message
                    ),
                )
            })?;
        }
    }
    Ok(out)
}

fn run_op(
    page: &mut ve_agent::DomPage,
    meta: &mut PageMeta,
    executor: &Executor,
    op: &str,
    step: &Value,
) -> Result<StepOut, ApiError> {
    match op {
        "navigate" => {
            let url = required_str(step, "url")?;
            page.navigate(url)?;
            Ok(StepOut::none())
        }
        "reload" => {
            let url = page
                .url()
                .map(str::to_owned)
                .ok_or_else(|| ApiError::new("step_failed", "page has no URL to reload"))?;
            page.navigate(&url)?;
            Ok(StepOut::none())
        }
        "stop" => Ok(StepOut::detail("no load in flight")),
        "back" | "forward" => Err(ApiError::unsupported(format!(
            "{op} (no session history in M1)"
        ))),
        "click" => {
            if let Some(b) = str_of(step, "button")
                && b != "left"
            {
                return Err(ApiError::unsupported(format!("{b} click")));
            }
            let id = first(page, meta, required_str(step, "target")?)?;
            page.click(id)?;
            Ok(StepOut::detail(match submit_after_click(page, id)? {
                Some(url) => format!("{} submit {url}", ref_of(id)),
                None => ref_of(id),
            }))
        }
        "dblclick" | "hover" | "dragTo" | "clickPoint" | "upload" | "dialog" | "expectDownload"
        | "screenshot" | "evaluate" => Err(ApiError::unsupported(op.to_owned())),
        "fill" => {
            let id = first(page, meta, required_str(step, "target")?)?;
            page.fill(id, required_str(step, "value")?)?;
            Ok(StepOut::detail(ref_of(id)))
        }
        "type" => {
            let id = first(page, meta, required_str(step, "target")?)?;
            let value = required_str(step, "value")?;
            let mut target = Some(id);
            for ch in value.chars() {
                let key = match ch {
                    '\n' => "Enter".to_owned(),
                    '\t' => "Tab".to_owned(),
                    c => c.to_string(),
                };
                page.press(target.take(), &key)?;
            }
            Ok(StepOut::detail(ref_of(id)))
        }
        "press" => {
            let key = required_str(step, "key")?;
            let target = match str_of(step, "target") {
                Some(t) => Some(first(page, meta, t)?),
                None => None,
            };
            let focused = target.or_else(|| page.focused());
            page.press(target, key)?;
            if key == "Enter"
                && let Some(url) = submit_after_enter(page, focused)?
            {
                return Ok(StepOut::detail(format!("Enter submit {url}")));
            }
            Ok(StepOut::none())
        }
        "check" | "uncheck" => {
            let id = first(page, meta, required_str(step, "target")?)?;
            let want = op == "check";
            if page.document().is_checked(id) != want {
                page.click(id)?;
            }
            Ok(StepOut::detail(format!("{} checked={want}", ref_of(id))))
        }
        "select" => {
            let id = first(page, meta, required_str(step, "target")?)?;
            let value = match step.get("value") {
                Some(Value::String(s)) => s.clone(),
                Some(Value::Array(a)) if a.len() == 1 => a[0].as_str().unwrap_or("").to_owned(),
                Some(Value::Array(_)) => return Err(ApiError::unsupported("multi-select values")),
                _ => return Err(ApiError::invalid("select requires `value`")),
            };
            page.select(id, &value)?;
            Ok(StepOut::detail(ref_of(id)))
        }
        "scroll" => {
            let target = match str_of(step, "target") {
                Some(t) => Some(first(page, meta, t)?),
                None => None,
            };
            let amount = step
                .get("amount")
                .and_then(Value::as_f64)
                .map_or(page.viewport().height, |a| a as f32);
            let dy = match str_of(step, "direction").unwrap_or("down") {
                "up" => -amount,
                "down" => amount,
                "top" => -1.0e9,
                "bottom" => 1.0e9,
                other => return Err(ApiError::invalid(format!("scroll direction {other:?}"))),
            };
            let state = page.scroll(target, 0.0, dy)?;
            Ok(StepOut::detail(format!(
                "y={} maxY={}",
                state.y, state.max_y
            )))
        }
        "waitFor" => {
            let cond = step
                .get("condition")
                .ok_or_else(|| ApiError::invalid("waitFor requires `condition`"))?;
            wait_condition(page, meta, executor, cond)
        }
        "extract" => {
            let fields = step
                .get("fields")
                .and_then(Value::as_array)
                .ok_or_else(|| ApiError::invalid("extract requires `fields`"))?;
            let value = extract_fields(page, meta, fields)?;
            Ok(StepOut {
                detail: None,
                extracted: Some(value),
            })
        }
        "collectScroll" => {
            let item = required_str(step, "item")?.to_owned();
            let container = match str_of(step, "container") {
                Some(c) => Some(parse_target(meta, page, c)?),
                None => None,
            };
            let max_scrolls = step
                .get("maxScrolls")
                .and_then(Value::as_u64)
                .map_or(10, |m| u32::try_from(m).unwrap_or(u32::MAX));
            let limit = step
                .get("limit")
                .and_then(Value::as_u64)
                .map(|l| l as usize);
            let out = engine_step(
                page,
                executor,
                EngineStep::CollectScroll {
                    name: "items".into(),
                    item_selector: item,
                    container,
                    max_scrolls,
                    step_px: 600.0,
                },
            )?
            .unwrap_or(Value::Null);
            let mut items = out
                .get("items")
                .and_then(Value::as_array)
                .cloned()
                .unwrap_or_default();
            if let Some(l) = limit {
                items.truncate(l);
            }
            let count = items.len();
            Ok(StepOut {
                detail: Some(format!("collected {count}")),
                extracted: Some(json!({ "items": items, "count": count })),
            })
        }
        other => Err(ApiError::invalid(format!("unknown op {other:?}"))),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn offline_host() -> Host {
        Host::spawn(
            EngineConfig {
                offline: true,
                ..EngineConfig::default()
            },
            1,
        )
    }

    const PAGE: &str = "data:text/html,<title>Hi</title><h1>Data</h1><form action=/go><label for=n>Name</label><input id=n name=n><input type=checkbox id=c><button id=b>Send</button></form><a id=l href=/next>Next</a>";

    #[test]
    fn open_observe_execute_over_the_channel() {
        let host = offline_host();
        let opened = host.call_blocking(|s| s.open(7, PAGE));
        assert_eq!(opened["ok"], true, "{opened}");
        assert_eq!(opened["page"], 7);
        assert_eq!(opened["title"], "Hi");
        assert_eq!(opened["routing"]["requiresScript"], false);
        assert_eq!(opened["generation"], 0);

        let obs = host.call_blocking(|s| s.observe(7, &ObserveRequest::default()));
        assert_eq!(obs["ok"], true, "{obs}");
        let content = &obs["content"];
        assert_eq!(content["title"], "Hi");
        assert_eq!(content["headings"][0], "h1 Data");
        let elements = content["elements"].as_array().unwrap();
        let button = elements.iter().find(|e| e["name"] == "Send").unwrap();
        let name_ref = elements
            .iter()
            .find(|e| e["tag"] == "input" && e["name"] == "Name")
            .unwrap()["ref"]
            .as_str()
            .unwrap()
            .to_owned();
        let button_ref = button["ref"].as_str().unwrap().to_owned();
        assert!(button_ref.starts_with('r'));

        let steps = vec![
            json!({ "id": "f", "op": "fill", "target": name_ref, "value": "Ada" }),
            json!({ "id": "c", "op": "check", "target": "css:#c" }),
            json!({ "id": "c2", "op": "check", "target": "css:#c" }),
            json!({ "id": "x", "op": "extract", "fields": [{ "name": "v", "selector": "#n", "attribute": "value" }, { "name": "h", "selector": "h1" }], "as": "out" }),
            json!({ "id": "h", "op": "hover", "target": button_ref, "optional": true }),
            json!({ "id": "w", "op": "waitFor", "condition": { "kind": "textVisible", "text": "Data" } }),
            json!({ "id": "u", "op": "waitFor", "condition": { "kind": "urlMatches", "pattern": "text/html" } }),
        ];
        let opts = ExecuteOptions {
            return_observation: Some(ObserveRequest::default()),
            stop_on_error: None,
        };
        let res = host.call_blocking(move |s| s.execute(7, &steps, &opts));
        assert_eq!(res["ok"], true, "{res}");
        assert_eq!(res["status"], "completed", "{res}");
        let statuses: Vec<&str> = res["steps"]
            .as_array()
            .unwrap()
            .iter()
            .map(|s| s["status"].as_str().unwrap())
            .collect();
        assert_eq!(statuses, ["ok", "ok", "ok", "ok", "failed", "ok", "ok"]);
        assert_eq!(res["steps"][4]["error"]["code"], "capability_unsupported");
        assert_eq!(res["extracted"]["out"]["h"], "Data");
        assert_eq!(
            res["extracted"]["out"]["v"], "Ada",
            "value reads the live control value"
        );
        assert_eq!(
            res["observation"]["content"]["formFields"][0]["value"],
            "Ada"
        );
        let cb = res["observation"]["content"]["elements"]
            .as_array()
            .unwrap()
            .iter()
            .find(|e| e["type"] == "checkbox")
            .unwrap();
        assert_eq!(cb["checked"], true, "check is idempotent");

        // a failing non-optional step fails the program and skips the rest
        let steps = vec![
            json!({ "id": "a", "op": "click", "target": "css:#missing" }),
            json!({ "id": "b", "op": "click", "target": "css:#b" }),
        ];
        let res = host.call_blocking(move |s| s.execute(7, &steps, &ExecuteOptions::default()));
        assert_eq!(res["status"], "failed");
        assert_eq!(res["steps"][0]["error"]["code"], "not_found");
        assert_eq!(res["steps"][1]["status"], "skipped");

        // unknown ref → not_found; unsupported ops → capability_unsupported
        let steps = vec![json!({ "id": "a", "op": "click", "target": "r99999" })];
        let res = host.call_blocking(move |s| s.execute(7, &steps, &ExecuteOptions::default()));
        assert_eq!(res["steps"][0]["error"]["code"], "not_found");
        let steps = vec![json!({ "id": "a", "op": "evaluate", "expression": "1" })];
        let res = host.call_blocking(move |s| s.execute(7, &steps, &ExecuteOptions::default()));
        assert_eq!(res["steps"][0]["error"]["code"], "capability_unsupported");

        assert_eq!(host.call_blocking(|s| s.close(7))["closed"], true);
        assert_eq!(host.call_blocking(|s| s.close(7))["closed"], false);
        let res = host.call_blocking(|s| s.observe(7, &ObserveRequest::default()));
        assert_eq!(res["ok"], false);
        assert_eq!(res["error"]["code"], "target_detached");
    }

    #[test]
    fn navigation_bumps_generation_and_offline_navigation_fails_cleanly() {
        let host = offline_host();
        let opened = host.call_blocking(|s| s.open(1, PAGE));
        assert_eq!(opened["ok"], true);
        let steps = vec![
            json!({ "id": "n", "op": "navigate", "url": "data:text/html,<title>Two</title><p>two</p>" }),
        ];
        let res = host.call_blocking(move |s| s.execute(1, &steps, &ExecuteOptions::default()));
        assert_eq!(res["status"], "completed", "{res}");
        assert_eq!(res["generation"], 1);
        assert_eq!(res["navigated"], true);
        assert_eq!(res["title"], "Two");
        assert_eq!(res["titleChanged"], true);

        let steps = vec![json!({ "id": "n", "op": "navigate", "url": "https://offline.test/" })];
        let res = host.call_blocking(move |s| s.execute(1, &steps, &ExecuteOptions::default()));
        assert_eq!(res["status"], "failed");
        assert_eq!(res["steps"][0]["error"]["code"], "step_failed");
        assert_eq!(res["generation"], 1, "failed navigation keeps the document");
    }

    #[test]
    fn classification_and_file_urls() {
        let host = offline_host();
        let spa = "data:text/html,<div id=root></div><script src=/app.js></script>";
        let opened = host.call_blocking(move |s| s.open(1, spa));
        assert_eq!(opened["ok"], true, "{opened}");
        assert_eq!(opened["routing"]["requiresScript"], true);
        assert_eq!(
            opened["routing"]["reason"],
            "thin-body-with-external-script"
        );

        let dir = std::env::temp_dir().join(format!("ve-napi-test-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let file = dir.join("page.html");
        std::fs::write(&file, "<title>File</title><p>from disk</p>").unwrap();
        let url = url::Url::from_file_path(&file).unwrap().to_string();
        let opened = host.call_blocking(move |s| s.open(2, &url));
        assert_eq!(opened["ok"], true, "{opened}");
        assert_eq!(opened["title"], "File");
        let _ = std::fs::remove_dir_all(dir);

        let missing = host.call_blocking(|s| s.open(3, "file:///definitely/missing.html"));
        assert_eq!(missing["ok"], false);
        assert_eq!(missing["error"]["code"], "step_failed");
    }

    #[test]
    fn get_forms_submit_by_click_and_enter_post_forms_are_unsupported() {
        let host = Host::spawn(
            EngineConfig {
                offline: true,
                ..EngineConfig::default()
            },
            1,
        );
        // an offline loader makes the navigation itself fail, but the failure
        // detail names the URL the submission built
        let page = "data:text/html,<form action=http://records.test/records method=get><select name=status><option value=''>All<option value=approved selected>approved</select><input name=q value=boots><input type=checkbox name=c checked><input type=checkbox name=d><button id=apply name=go value=1>Apply</button></form><form id=p method=post action=/save><input name=t><button id=save>Save</button></form>";
        assert_eq!(host.call_blocking(move |s| s.open(1, page))["ok"], true);
        let steps = vec![json!({ "id": "c", "op": "click", "target": "css:#apply" })];
        let res = host.call_blocking(move |s| s.execute(1, &steps, &ExecuteOptions::default()));
        let detail = res["steps"][0]["error"]["detail"]["step"]
            .as_str()
            .unwrap_or("");
        assert!(
            detail.contains("http://records.test/records?status=approved&q=boots&c=on&go=1"),
            "submission url encodes the successful controls: {res}"
        );
        assert!(
            !detail.contains("d="),
            "unchecked boxes are skipped: {detail}"
        );

        let steps = vec![
            json!({ "id": "e", "op": "press", "key": "Enter", "target": "css:input[name=q]" }),
        ];
        let res = host.call_blocking(move |s| s.execute(1, &steps, &ExecuteOptions::default()));
        assert!(
            res["steps"][0]["error"]["detail"]["step"]
                .as_str()
                .unwrap_or("")
                .contains("Enter submit http://records.test/records?status="),
            "Enter submits through the default button: {res}"
        );

        let steps = vec![json!({ "id": "p", "op": "click", "target": "css:#save" })];
        let res = host.call_blocking(move |s| s.execute(1, &steps, &ExecuteOptions::default()));
        assert_eq!(
            res["steps"][0]["error"]["code"], "capability_unsupported",
            "{res}"
        );
    }

    #[test]
    fn cookies_round_trip() {
        let host = offline_host();
        let set = host.call_blocking(|s| {
            s.set_cookies(&[json!({ "name": "sid", "value": "1", "domain": "example.test", "path": "/", "secure": false, "httpOnly": true, "expires": 4_102_444_800_u64 })])
        });
        assert_eq!(set["count"], 1, "{set}");
        let all = host.call_blocking(|s| s.get_cookies(None));
        assert_eq!(all["cookies"][0]["name"], "sid");
        assert_eq!(all["cookies"][0]["httpOnly"], true);
        let scoped = host.call_blocking(|s| s.get_cookies(Some("http://example.test/x")));
        assert_eq!(scoped["cookies"].as_array().unwrap().len(), 1);
        let other = host.call_blocking(|s| s.get_cookies(Some("http://other.test/")));
        assert_eq!(other["cookies"].as_array().unwrap().len(), 0);
        let bad = host.call_blocking(|s| s.set_cookies(&[json!({ "value": "x" })]));
        assert_eq!(bad["error"]["code"], "invalid_params");
    }
}
