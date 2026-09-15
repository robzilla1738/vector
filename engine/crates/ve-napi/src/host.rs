//! The engine host: one [`VectorEngine`] per browsing context, owned by a
//! dedicated thread. Every Node call becomes a job sent over a channel and
//! answered through a one-shot reply channel, so page work never runs on
//! the Node event loop.
//!
//! The host is a JSON ferry: it calls the engine's `*_json` facade
//! (`open_json`, `observe_json`, `execute_json`, `screenshot_json`,
//! `cookies_json`, `set_cookies_json`) and reshapes the replies into the
//! envelope `packages/browser-driver/src/vector-engine.ts` consumes
//! (`generation` for the document epoch, a boolean `settled` plus
//! `blockers`, flattened `ProgramResult`, `routing.{requiresScript,reason,
//! kind}`, `responses`). Step semantics, target resolution, observation
//! shaping and routing classification all live in the engine.

use std::collections::HashMap;
use std::sync::mpsc::{self, Receiver, Sender};
use std::thread;
use std::time::SystemTime;

use serde_json::{Map, Value, json};
use ve_api::{BrowserCookie, DEFAULT_CONTEXT, EngineConfig, PageId, VectorEngine};

use crate::errors::ApiError;

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
            let _ = reply.send(ApiError::thread_stopped().to_reply());
            return rx;
        }
        rx
    }

    /// Runs a job and waits for it (tests and synchronous callers).
    pub fn call_blocking<F>(&self, f: F) -> Value
    where
        F: FnOnce(&mut HostState) -> Value + Send + 'static,
    {
        self.call(f)
            .recv()
            .unwrap_or_else(|_| ApiError::thread_stopped().to_reply())
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
        Err(e) => e.to_reply(),
    }
}

/// Parses an engine `*_json` reply; `{"ok":false}` becomes an [`ApiError`].
fn engine_reply(json: &str) -> Result<Map<String, Value>, ApiError> {
    let value: Value = serde_json::from_str(json)
        .map_err(|e| ApiError::new("internal", format!("engine returned malformed JSON: {e}")))?;
    if value.get("ok").and_then(Value::as_bool) != Some(true) {
        return Err(ApiError::from_engine(&value));
    }
    match value {
        Value::Object(mut obj) => {
            obj.remove("ok");
            Ok(obj)
        }
        other => Err(ApiError::new(
            "internal",
            format!("engine reply is not an object: {other}"),
        )),
    }
}

/// Serialises request options for the engine, dropping `null` members so
/// JavaScript callers may pass `{ scope: undefined }`-style objects that
/// were stringified with explicit nulls.
fn options_json(options: &Value) -> String {
    match options {
        Value::Object(obj) => Value::Object(
            obj.iter()
                .filter(|(_, v)| !v.is_null())
                .map(|(k, v)| (k.clone(), v.clone()))
                .collect(),
        )
        .to_string(),
        Value::Null => "{}".to_owned(),
        other => other.to_string(),
    }
}

/// Reshapes the engine's `RoutingInfo` into the driver's `PageRouting`
/// (`requiresScript`, `reason?`, `kind?`), keeping the engine's own fields
/// (`routeReason`, `bodyTextChars`, `externalScripts`, `cssCoverage?`).
#[must_use]
pub fn routing_json(info: &Value) -> Value {
    let requires_script = info
        .get("requiresScript")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    let route_reason = info
        .get("routeReason")
        .and_then(Value::as_str)
        .unwrap_or("static");
    let mut out = json!({
        "requiresScript": requires_script,
        "routeReason": route_reason,
        "bodyTextChars": info.get("bodyTextChars").cloned().unwrap_or(Value::Null),
        "externalScripts": info.get("externalScripts").cloned().unwrap_or(Value::Null),
    });
    if let Some(coverage) = info.get("cssCoverage") {
        out["cssCoverage"] = coverage.clone();
    }
    if requires_script {
        out["reason"] = json!(route_reason);
        out["kind"] = json!(if route_reason.starts_with("unsupported-content") {
            "unsupportedContent"
        } else {
            "requiresScript"
        });
    }
    out
}

/// Turns the engine's `EngineObservation` object into the binding's
/// `ObserveResult`: `generation` (document epoch), boolean `settled` plus
/// `blockers`, and `changed` (the `changesSince` lines, or `null`).
fn observation_json(mut obs: Map<String, Value>) -> Value {
    obs.remove("page");
    if let Some(epoch) = obs.get("documentEpoch").cloned() {
        obs.insert("generation".into(), epoch);
    }
    let settled = obs.remove("settled").unwrap_or(Value::Null);
    obs.insert(
        "settled".into(),
        json!(
            settled
                .get("settled")
                .and_then(Value::as_bool)
                .unwrap_or(true)
        ),
    );
    obs.insert(
        "blockers".into(),
        settled.get("reasons").cloned().unwrap_or_else(|| json!([])),
    );
    let changed = obs.get("changesSince").cloned().unwrap_or(Value::Null);
    obs.insert("changed".into(), changed);
    Value::Object(obs)
}

fn resource_type(content_type: Option<&str>) -> &'static str {
    let ct = content_type.unwrap_or("").to_ascii_lowercase();
    if ct.starts_with("text/html") || ct.starts_with("application/xhtml") || ct.is_empty() {
        "document"
    } else if ct.starts_with("text/css") {
        "stylesheet"
    } else if ct.contains("javascript") || ct.contains("ecmascript") {
        "script"
    } else if ct.starts_with("image/") {
        "image"
    } else if ct.starts_with("font/") || ct.contains("font") {
        "font"
    } else {
        "other"
    }
}

fn response_json(r: &ve_net::CompletedResponse) -> Value {
    json!({
        "requestId": r.request_id,
        "url": r.url,
        "method": r.method,
        "status": r.status,
        "contentType": r.content_type,
        "resourceType": resource_type(r.content_type.as_deref()),
        "bodyBytes": r.body_bytes,
        "startedAt": r.started_at,
        "endedAt": r.ended_at,
        "fromCache": r.from_cache,
    })
}

/// Per-page bookkeeping the engine does not track for us.
#[derive(Debug, Default)]
pub struct PageMeta {
    /// Last title reported to Node (for `titleChanged`).
    pub title: String,
    /// Highest request id already reported in `responses`.
    pub last_response: u64,
}

/// State owned by the engine thread.
pub struct HostState {
    engine: VectorEngine,
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
    /// Observe the page after the last step, in the same call (an
    /// `ObservationRequest` object, or `true` for the defaults).
    pub return_observation: Option<Value>,
    /// Accepted for compatibility; the engine always stops at the first
    /// non-optional failure (contracts `ProgramResult` semantics).
    pub stop_on_error: Option<bool>,
}

impl HostState {
    fn new(config: EngineConfig, context_id: u32) -> Self {
        Self {
            engine: VectorEngine::new(config),
            pages: HashMap::new(),
            context_id,
        }
    }

    /// The context id.
    #[must_use]
    pub fn context_id(&self) -> u32 {
        self.context_id
    }

    fn engine_page(&self, global: u64) -> Result<PageId, ApiError> {
        self.pages
            .get(&global)
            .map(|(id, _)| *id)
            .ok_or_else(|| ApiError::no_such_page(global))
    }

    /// Responses completed for `global` since the last report.
    fn drain_responses(&mut self, global: u64) -> Result<Vec<Value>, ApiError> {
        let id = self.engine_page(global)?;
        let completed = self.engine.page(id)?.completed_responses();
        let (_, meta) = self
            .pages
            .get_mut(&global)
            .ok_or_else(|| ApiError::no_such_page(global))?;
        let mut out = Vec::new();
        for r in &completed {
            if r.request_id > meta.last_response {
                meta.last_response = r.request_id;
                out.push(response_json(r));
            }
        }
        Ok(out)
    }

    /// Opens `url` as global page `global`. `options` may carry `viewport`
    /// (`{width,height}`) and `html` (inline markup with `url` as its base).
    pub fn open(&mut self, global: u64, url: &str, options: &Value) -> Value {
        wrap(self.open_inner(global, url, options))
    }

    fn open_inner(&mut self, global: u64, url: &str, options: &Value) -> Result<Value, ApiError> {
        if self.pages.contains_key(&global) {
            return Err(ApiError::new(
                "conflict",
                format!("page {global} already open"),
            ));
        }
        let mut request = json!({ "url": url });
        for key in ["viewport", "html"] {
            if let Some(v) = options.get(key).filter(|v| !v.is_null()) {
                request[key] = v.clone();
            }
        }
        let opened = engine_reply(&self.engine.open_json(&request.to_string()))?;
        let id = PageId(
            opened
                .get("page")
                .and_then(Value::as_u64)
                .ok_or_else(|| ApiError::new("internal", "open reply without page id"))?,
        );
        let title = opened
            .get("title")
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_owned();
        let settled = opened.get("settled").cloned().unwrap_or(Value::Null);
        self.pages.insert(
            global,
            (
                id,
                PageMeta {
                    title: title.clone(),
                    last_response: 0,
                },
            ),
        );
        let responses = self.drain_responses(global)?;
        Ok(json!({
            "page": global,
            "context": self.context_id,
            "url": opened.get("url").cloned().unwrap_or(Value::Null),
            "title": title,
            "status": opened.get("status").cloned().unwrap_or(Value::Null),
            "generation": opened.get("documentEpoch").cloned().unwrap_or(json!(0)),
            "revision": opened.get("revision").cloned().unwrap_or(json!(0)),
            "settled": settled.get("settled").and_then(Value::as_bool).unwrap_or(true),
            "blockers": settled.get("reasons").cloned().unwrap_or_else(|| json!([])),
            "openMs": opened.get("openMs").cloned().unwrap_or(Value::Null),
            "routing": routing_json(opened.get("routing").unwrap_or(&Value::Null)),
            "responses": responses,
        }))
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

    /// Observes a page: `{ ok, content, revision, generation, settled,
    /// blockers, changed, changesSince?, delta? }`. `options` is an
    /// `ObservationRequest` (`scope`, `subtreeRef`, `maxElements`,
    /// `maxTextChars`, `sinceRevision`, `format`).
    pub fn observe(&mut self, global: u64, options: &Value) -> Value {
        wrap(self.observe_inner(global, options))
    }

    fn observe_inner(&mut self, global: u64, options: &Value) -> Result<Value, ApiError> {
        let id = self.engine_page(global)?;
        let obs = engine_reply(&self.engine.observe_json(id.0, &options_json(options)))?;
        if let Some((_, meta)) = self.pages.get_mut(&global)
            && let Some(title) = obs
                .get("content")
                .and_then(|c| c.get("title"))
                .and_then(Value::as_str)
        {
            title.clone_into(&mut meta.title);
        }
        Ok(observation_json(obs))
    }

    /// Runs a contracts program (`steps` is a `Step[]` or a `Program`
    /// object) and returns the flattened `ProgramResult` (`status`, `steps`,
    /// `extracted`, `error`) plus `url`, `title`, `titleChanged`,
    /// `generation`, `navigated`, `revision`, `responses` and, when
    /// requested, `observation`.
    pub fn execute(&mut self, global: u64, steps: &Value, opts: &ExecuteOptions) -> Value {
        wrap(self.execute_inner(global, steps, opts))
    }

    fn execute_inner(
        &mut self,
        global: u64,
        steps: &Value,
        opts: &ExecuteOptions,
    ) -> Result<Value, ApiError> {
        let id = self.engine_page(global)?;
        let generation_before = self.engine.page(id)?.generation();
        let mut request = json!({ "program": steps });
        match &opts.return_observation {
            None | Some(Value::Null | Value::Bool(false)) => {}
            Some(Value::Bool(true)) => request["returnObservation"] = json!({}),
            Some(options) => {
                request["returnObservation"] =
                    serde_json::from_str(&options_json(options)).unwrap_or(Value::Null);
            }
        }
        let mut executed = engine_reply(&self.engine.execute_json(id.0, &request.to_string()))?;
        let result = executed.remove("result").unwrap_or(Value::Null);

        let page = self.engine.page(id)?;
        let title = page.title();
        let url = page.url().to_owned();
        let generation = page.generation();
        let revision = page.document().revision().0;
        let (_, meta) = self
            .pages
            .get_mut(&global)
            .ok_or_else(|| ApiError::no_such_page(global))?;
        let title_changed = title != meta.title;
        meta.title.clone_from(&title);
        let responses = self.drain_responses(global)?;

        let mut out = json!({
            "status": result.get("status").cloned().unwrap_or(json!("failed")),
            "steps": result.get("steps").cloned().unwrap_or_else(|| json!([])),
            "extracted": result.get("extracted").cloned().unwrap_or(Value::Null),
            "error": result.get("error").cloned().unwrap_or(Value::Null),
            "url": url,
            "title": title,
            "titleChanged": title_changed,
            "generation": generation,
            "navigated": generation != generation_before,
            "revision": revision,
            "responses": responses,
        });
        if let Some(Value::Object(obs)) = executed.remove("observation") {
            out["observation"] = wrap(Ok(observation_json(obs)));
        }
        Ok(out)
    }

    /// Rasterises a page: `{ ok, width, height, scale, fullPage, format,
    /// bytes, pngBase64 }`. `options` may carry `fullPage`.
    pub fn screenshot(&mut self, global: u64, options: &Value) -> Value {
        wrap((|| {
            let id = self.engine_page(global)?;
            engine_reply(&self.engine.screenshot_json(id.0, &options_json(options)))
                .map(Value::Object)
        })())
    }

    /// Cookies of this context, optionally filtered to those sent to `url`.
    pub fn get_cookies(&self, url: Option<&str>) -> Value {
        wrap((|| {
            let Some(url) = url else {
                return engine_reply(&self.engine.cookies_json(DEFAULT_CONTEXT.0))
                    .map(Value::Object);
            };
            let parsed = url::Url::parse(url)
                .map_err(|e| ApiError::invalid(format!("bad URL {url}: {e}")))?;
            let net = self.engine.network(DEFAULT_CONTEXT)?;
            let net = net.borrow();
            let cookies: Vec<BrowserCookie> = net
                .cookies
                .cookies_for(&parsed, SystemTime::now())
                .into_iter()
                .map(BrowserCookie::from)
                .collect();
            Ok(json!({ "cookies": cookies }))
        })())
    }

    /// Stores cookies (`BrowserCookie[]` JSON). Returns `{ ok, count, imported }`.
    pub fn set_cookies(&mut self, cookies_json: &str) -> Value {
        wrap((|| {
            let mut reply = engine_reply(
                &self
                    .engine
                    .set_cookies_json(DEFAULT_CONTEXT.0, cookies_json),
            )?;
            let count = reply.get("imported").cloned().unwrap_or(json!(0));
            reply.insert("count".into(), count);
            Ok(Value::Object(reply))
        })())
    }
}

#[cfg(test)]
impl HostState {
    fn page_ids_json(&self) -> Value {
        json!(self.page_ids())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ve_api::NetworkPolicy;

    fn offline_host() -> Host {
        Host::spawn(
            EngineConfig {
                offline: true,
                policy: NetworkPolicy::permissive(),
                ..EngineConfig::default()
            },
            1,
        )
    }

    fn opts(return_observation: Option<Value>) -> ExecuteOptions {
        ExecuteOptions {
            return_observation,
            stop_on_error: None,
        }
    }

    const PAGE: &str = "data:text/html,<title>Hi</title><h1>Data</h1><form action=/go><label for=n>Name</label><input id=n name=n><input type=checkbox id=c><button id=b>Send</button></form><a id=l href=/next>Next</a>";

    #[test]
    fn open_observe_execute_over_the_channel() {
        let host = offline_host();
        let opened = host.call_blocking(|s| s.open(7, PAGE, &json!({})));
        assert_eq!(opened["ok"], true, "{opened}");
        assert_eq!(opened["page"], 7);
        assert_eq!(opened["context"], 1);
        assert_eq!(opened["title"], "Hi");
        assert_eq!(opened["routing"]["requiresScript"], false);
        assert_eq!(opened["routing"]["routeReason"], "static");
        assert!(opened["routing"].get("reason").is_none());
        assert_eq!(opened["generation"], 0);
        assert_eq!(opened["settled"], true);
        assert!(opened["responses"].is_array());

        let obs = host.call_blocking(|s| s.observe(7, &json!({ "scope": null })));
        assert_eq!(obs["ok"], true, "{obs}");
        let content = &obs["content"];
        assert_eq!(content["title"], "Hi");
        assert_eq!(content["headings"][0], "Data");
        assert_eq!(obs["generation"], 0);
        assert_eq!(obs["settled"], true);
        assert!(obs["changed"].is_null());
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
        let revision = obs["revision"].as_u64().unwrap();

        let steps = json!([
            { "id": "f", "op": "fill", "target": name_ref, "value": "Ada" },
            { "id": "c", "op": "check", "target": "css:#c" },
            { "id": "c2", "op": "check", "target": "css:#c" },
            { "id": "x", "op": "extract", "fields": [{ "name": "v", "selector": "#n", "attribute": "value" }, { "name": "h", "selector": "h1" }], "as": "out" },
            { "id": "h", "op": "hover", "target": button_ref },
            { "id": "e", "op": "evaluate", "expression": "1", "optional": true },
            { "id": "w", "op": "waitFor", "condition": { "kind": "textVisible", "text": "Data" } },
            { "id": "u", "op": "waitFor", "condition": { "kind": "urlMatches", "pattern": "text/html" } },
        ]);
        let o = opts(Some(json!({ "sinceRevision": revision, "scope": null })));
        let res = host.call_blocking(move |s| s.execute(7, &steps, &o));
        assert_eq!(res["ok"], true, "{res}");
        assert_eq!(res["status"], "completed", "{res}");
        let statuses: Vec<&str> = res["steps"]
            .as_array()
            .unwrap()
            .iter()
            .map(|s| s["status"].as_str().unwrap())
            .collect();
        assert_eq!(
            statuses,
            ["ok", "ok", "ok", "ok", "ok", "failed", "ok", "ok"],
            "{res}"
        );
        assert_eq!(res["steps"][5]["error"]["code"], "capability_unsupported");
        assert_eq!(res["extracted"]["out"]["h"], "Data");
        assert_eq!(
            res["extracted"]["out"]["v"], "Ada",
            "value reads the live control value"
        );
        assert_eq!(res["navigated"], false);
        assert_eq!(res["generation"], 0);
        assert_eq!(res["observation"]["ok"], true);
        assert_eq!(
            res["observation"]["content"]["formFields"][0]["value"],
            "Ada"
        );
        assert!(
            res["observation"]["changed"].is_array(),
            "sinceRevision yields changesSince: {}",
            res["observation"]
        );
        let cb = res["observation"]["content"]["elements"]
            .as_array()
            .unwrap()
            .iter()
            .find(|e| e["type"] == "checkbox")
            .unwrap();
        assert_eq!(cb["checked"], true, "check is idempotent");

        // a failing non-optional step fails the program and skips the rest
        let steps = json!([
            { "id": "a", "op": "click", "target": "css:#missing" },
            { "id": "b", "op": "click", "target": "css:#b" },
        ]);
        let res = host.call_blocking(move |s| s.execute(7, &steps, &opts(None)));
        assert_eq!(res["status"], "failed");
        assert_eq!(res["steps"][0]["error"]["code"], "not_found");
        assert_eq!(res["steps"][1]["status"], "skipped");
        assert!(res.get("observation").is_none());

        // unknown ref → not_found; xpath / evaluate → capability_unsupported
        let steps = json!([{ "id": "a", "op": "click", "target": "r99999" }]);
        let res = host.call_blocking(move |s| s.execute(7, &steps, &opts(None)));
        assert_eq!(res["steps"][0]["error"]["code"], "not_found", "{res}");
        let steps = json!([{ "id": "a", "op": "click", "target": "xpath://a" }]);
        let res = host.call_blocking(move |s| s.execute(7, &steps, &opts(None)));
        assert_eq!(
            res["steps"][0]["error"]["code"], "capability_unsupported",
            "{res}"
        );

        // screenshots are real PNGs now
        let shot = host.call_blocking(|s| s.screenshot(7, &json!({ "fullPage": false })));
        assert_eq!(shot["ok"], true, "{shot}");
        assert_eq!(shot["format"], "png");
        assert!(
            shot["pngBase64"]
                .as_str()
                .unwrap()
                .starts_with("iVBORw0KGgo")
        );

        assert_eq!(host.call_blocking(|s| s.close(7))["closed"], true);
        assert_eq!(host.call_blocking(|s| s.close(7))["closed"], false);
        let res = host.call_blocking(|s| s.observe(7, &json!({})));
        assert_eq!(res["ok"], false);
        assert_eq!(res["error"]["code"], "target_detached");
        let shot = host.call_blocking(|s| s.screenshot(7, &json!({})));
        assert_eq!(shot["error"]["code"], "target_detached");
    }

    #[test]
    fn navigation_bumps_generation_and_offline_navigation_fails_cleanly() {
        let host = offline_host();
        let opened = host.call_blocking(|s| s.open(1, PAGE, &json!({})));
        assert_eq!(opened["ok"], true);
        let steps = json!([
            { "id": "n", "op": "navigate", "url": "data:text/html,<title>Two</title><p>two</p>" },
        ]);
        let res = host.call_blocking(move |s| s.execute(1, &steps, &opts(None)));
        assert_eq!(res["status"], "completed", "{res}");
        assert_eq!(res["generation"], 1);
        assert_eq!(res["navigated"], true);
        assert_eq!(res["title"], "Two");
        assert_eq!(res["titleChanged"], true);

        // history is real now
        let steps = json!([{ "id": "b", "op": "back" }]);
        let res = host.call_blocking(move |s| s.execute(1, &steps, &opts(None)));
        assert_eq!(res["status"], "completed", "{res}");
        assert_eq!(res["title"], "Hi");
        assert_eq!(res["navigated"], true);
        assert_eq!(res["generation"], 2);

        let steps = json!([{ "id": "n", "op": "navigate", "url": "https://offline.test/" }]);
        let res = host.call_blocking(move |s| s.execute(1, &steps, &opts(None)));
        assert_eq!(res["status"], "failed", "{res}");
        let code = res["steps"][0]["error"]["code"].as_str().unwrap();
        assert!(
            code == "backend_unavailable" || code == "step_failed",
            "offline navigation is a network failure, not a capability gap: {res}"
        );
        assert_eq!(res["generation"], 2, "failed navigation keeps the document");
        assert_eq!(res["title"], "Hi");
    }

    #[test]
    fn classification_and_file_urls() {
        let host = offline_host();
        let spa = "data:text/html,<div id=root></div><script src=/app.js></script>";
        let opened = host.call_blocking(move |s| s.open(1, spa, &json!({})));
        assert_eq!(opened["ok"], true, "{opened}");
        assert_eq!(opened["routing"]["requiresScript"], true);
        assert_eq!(opened["routing"]["kind"], "requiresScript");
        let reason = opened["routing"]["reason"].as_str().unwrap();
        assert!(reason.starts_with("empty-shell"), "{reason}");
        assert_eq!(
            opened["routing"]["reason"],
            opened["routing"]["routeReason"]
        );

        let dir = std::env::temp_dir().join(format!("ve-napi-test-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let file = dir.join("page.html");
        std::fs::write(&file, "<title>File</title><p>from disk</p>").unwrap();
        let url = url::Url::from_file_path(&file).unwrap().to_string();
        let opened = host.call_blocking(move |s| s.open(2, &url, &json!({})));
        assert_eq!(opened["ok"], true, "{opened}");
        assert_eq!(opened["title"], "File");
        assert_eq!(opened["status"], 200);
        let _ = std::fs::remove_dir_all(dir);

        let missing =
            host.call_blocking(|s| s.open(3, "file:///definitely/missing.html", &json!({})));
        assert_eq!(missing["ok"], false);
        assert!(missing["error"]["code"].is_string(), "{missing}");

        // a page id is only taken by a successful open
        let again =
            host.call_blocking(|s| s.open(3, "data:text/html,<title>T</title>", &json!({})));
        assert_eq!(again["ok"], true, "{again}");
        let dup = host.call_blocking(|s| s.open(3, "about:blank", &json!({})));
        assert_eq!(dup["error"]["code"], "conflict");
        assert_eq!(host.call_blocking(|s| s.page_ids_json()), json!([1, 2, 3]));
    }

    #[test]
    fn forms_submit_by_click_and_enter_including_post() {
        let host = offline_host();
        let page = "data:text/html,<form action=http://records.test/records method=get><select name=status><option value=''>All<option value=approved selected>approved</select><input name=q value=boots><input type=checkbox name=c checked><input type=checkbox name=d><button id=apply name=go value=1>Apply</button></form><form id=p method=post action=http://records.test/save><input name=t><button id=save>Save</button></form>";
        assert_eq!(
            host.call_blocking(move |s| s.open(1, page, &json!({})))["ok"],
            true
        );
        // the offline loader fails the navigation itself, but the click is
        // accepted and the submission URL is what the engine tried to load
        let steps = json!([{ "id": "c", "op": "click", "target": "css:#apply" }]);
        let res = host.call_blocking(move |s| s.execute(1, &steps, &opts(None)));
        let outcome = res["steps"][0].to_string();
        assert_ne!(
            res["steps"][0]["error"]["code"], "capability_unsupported",
            "{res}"
        );
        assert!(
            outcome.contains("records.test/records?status=approved&q=boots&c=on&go=1"),
            "submission url encodes the successful controls: {res}"
        );
        assert!(
            !outcome.contains("d="),
            "unchecked boxes are skipped: {res}"
        );

        let steps = json!([
            { "id": "e", "op": "press", "key": "Enter", "target": "css:input[name=q]" },
        ]);
        let res = host.call_blocking(move |s| s.execute(1, &steps, &opts(None)));
        assert!(
            res["steps"][0]
                .to_string()
                .contains("records.test/records?status="),
            "Enter submits through the default button: {res}"
        );

        // POST forms are no longer refused by the binding
        let steps = json!([{ "id": "p", "op": "click", "target": "css:#save" }]);
        let res = host.call_blocking(move |s| s.execute(1, &steps, &opts(None)));
        assert_ne!(
            res["steps"][0]["error"]["code"], "capability_unsupported",
            "{res}"
        );
        assert!(
            res["steps"][0].to_string().contains("records.test/save"),
            "{res}"
        );
    }

    #[test]
    fn cookies_round_trip() {
        let host = offline_host();
        let set = host.call_blocking(|s| {
            s.set_cookies(r#"[{ "name": "sid", "value": "1", "domain": "example.test", "path": "/", "secure": false, "httpOnly": true, "expires": 4102444800 }]"#)
        });
        assert_eq!(set["count"], 1, "{set}");
        assert_eq!(set["imported"], 1);
        let all = host.call_blocking(|s| s.get_cookies(None));
        assert_eq!(all["cookies"][0]["name"], "sid");
        assert_eq!(all["cookies"][0]["httpOnly"], true);
        let scoped = host.call_blocking(|s| s.get_cookies(Some("http://example.test/x")));
        assert_eq!(scoped["cookies"].as_array().unwrap().len(), 1, "{scoped}");
        let other = host.call_blocking(|s| s.get_cookies(Some("http://other.test/")));
        assert_eq!(other["cookies"].as_array().unwrap().len(), 0);
        let bad = host.call_blocking(|s| s.set_cookies(r#"[{ "value": "x" }]"#));
        assert_eq!(bad["error"]["code"], "invalid_params");
        let bad = host.call_blocking(|s| s.get_cookies(Some("not a url")));
        assert_eq!(bad["error"]["code"], "invalid_params");
    }

    #[test]
    fn shapes_routing_and_observations() {
        let r = routing_json(&json!({
            "requiresScript": true,
            "routeReason": "unsupported-content: application/pdf",
            "bodyTextChars": 0, "externalScripts": 0
        }));
        assert_eq!(r["kind"], "unsupportedContent");
        assert_eq!(r["reason"], "unsupported-content: application/pdf");
        let r = routing_json(&json!({ "requiresScript": false, "routeReason": "static" }));
        assert_eq!(r["requiresScript"], false);
        assert!(r.get("kind").is_none() && r.get("reason").is_none());

        let obs = observation_json(
            json!({
                "page": 4, "content": {}, "revision": 9, "documentEpoch": 2,
                "changesSince": ["+ r1"], "settled": { "settled": false, "waitedMs": 5, "reasons": ["fetch(1)"] }
            })
            .as_object()
            .unwrap()
            .clone(),
        );
        assert!(obs.get("page").is_none());
        assert_eq!(obs["generation"], 2);
        assert_eq!(obs["documentEpoch"], 2);
        assert_eq!(obs["settled"], false);
        assert_eq!(obs["blockers"][0], "fetch(1)");
        assert_eq!(obs["changed"][0], "+ r1");

        assert_eq!(options_json(&json!({ "a": null, "b": 1 })), r#"{"b":1}"#);
        assert_eq!(options_json(&Value::Null), "{}");
        assert_eq!(resource_type(Some("text/css; charset=utf-8")), "stylesheet");
        assert_eq!(resource_type(None), "document");
    }
}
