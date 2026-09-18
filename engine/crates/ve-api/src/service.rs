//! Shared browser authority (Finding 1 / Gate B / Gate F).
//!
//! [`NativeBrowser`] owns page identity, controller epoch, and sandboxed
//! execution. Native UI and Node/MCP clients attach over newline JSON-RPC.
//! Scene updates are display lists — not a second document and not PNG as
//! the regular present transport.

use std::io::{BufRead, BufReader, Write};
use std::net::{SocketAddr, TcpListener, TcpStream};
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{self, Receiver, Sender};
use std::thread::{self, JoinHandle};
use std::time::Duration;

use serde_json::{Value, json};
use ve_core::{Error, ErrorCode, Result};

use crate::shell::{NativeBrowser, NativeController, NativeEvent};
use crate::{EngineConfig, ExecuteRequest, ObservationRequest, Program};

type Job = Box<dyn FnOnce(&mut BrowserService) + Send>;

/// Owns one [`NativeBrowser`] and applies serialized client requests.
pub struct BrowserService {
    browser: NativeBrowser,
}

impl BrowserService {
    /// Offline native authority for tests and local attach.
    #[must_use]
    pub fn new() -> Self {
        Self {
            browser: NativeBrowser::new(),
        }
    }

    /// Authority with a caller-supplied engine config (production/fixture).
    #[must_use]
    pub fn with_config(config: EngineConfig) -> Self {
        Self {
            browser: NativeBrowser::with_config(config),
        }
    }

    /// Wrap an existing native browser so GUI and the socket share it.
    #[must_use]
    pub fn from_browser(browser: NativeBrowser) -> Self {
        Self { browser }
    }

    /// Live native browser (GUI event loop / tests).
    #[must_use]
    pub fn browser(&self) -> &NativeBrowser {
        &self.browser
    }

    /// Mutable live native browser (GUI input and present).
    pub fn browser_mut(&mut self) -> &mut NativeBrowser {
        &mut self.browser
    }

    /// Dispatch one JSON-RPC method. Unknown methods are `invalid_params`.
    pub fn handle(&mut self, method: &str, params: &Value) -> Result<Value> {
        match method {
            "identity" => Ok(self.identity()),
            "pages.open" => self.open(params),
            "pages.observe" => self.observe(params),
            "pages.execute" => self.execute(params),
            "pages.takeover" => {
                self.browser.takeover();
                Ok(self.identity())
            }
            "pages.resume" => {
                self.browser.resume();
                Ok(self.identity())
            }
            "input.event" => self.event(params),
            "scene.update" => self.browser.scene_active(),
            "pages.list" => self.list_pages(),
            "pages.close" => self.close_page(),
            "pages.screenshot" => self.screenshot(),
            "cookies.get" | "cookies.set" | "storage.state.get" | "storage.state.set" => {
                Err(Error::capability_unsupported(format!(
                    "{method} requires ve-profile (H2-A4)"
                )))
            }
            "shutdown" => Ok(json!({ "ok": true })),
            other => Err(Error::invalid_params(format!("unknown method {other}"))),
        }
    }

    fn identity(&self) -> Value {
        let mut id = self.browser.identity();
        if let Some(obj) = id.as_object_mut() {
            obj.insert("service".into(), json!("browser-service"));
            obj.insert(
                "controller".into(),
                json!(match self.browser.controller() {
                    NativeController::None => "none",
                    NativeController::Agent => "agent",
                    NativeController::Human => "human",
                }),
            );
            obj.insert(
                "controllerEpoch".into(),
                json!(self.browser.controller_epoch()),
            );
            if let Some(tab) = self.browser.active_tab() {
                obj.insert("page".into(), json!(tab.page.0));
                obj.insert("url".into(), json!(tab.url));
            }
        }
        id
    }

    fn open(&mut self, params: &Value) -> Result<Value> {
        let html = params.get("html").and_then(Value::as_str);
        let url = params
            .get("url")
            .and_then(Value::as_str)
            .unwrap_or("about:blank");
        if let Some(html) = html {
            self.browser.new_tab(html, url)?;
        } else {
            self.browser.open_url(url)?;
        }
        let tab = self
            .browser
            .active_tab()
            .ok_or_else(|| Error::not_found("open produced no tab"))?;
        let meta = self.browser.active_page_meta();
        Ok(json!({
            "ok": true,
            "page": tab.page.0,
            "url": tab.url,
            "title": tab.page_title,
            "generation": meta.as_ref().map_or(0, |m| m.2),
            "documentEpoch": meta.as_ref().map_or(0, |m| m.2),
            "revision": meta.as_ref().map_or(0, |m| m.3),
            "chromium": false,
            "backend": "vector-engine",
        }))
    }

    fn observe(&mut self, params: &Value) -> Result<Value> {
        let request = if params.is_null() || params.as_object().is_some_and(serde_json::Map::is_empty)
        {
            ObservationRequest::default()
        } else {
            serde_json::from_value(params.clone())
                .map_err(|e| Error::invalid_params(format!("observe: {e}")))?
        };
        let obs = self.browser.observe_active_with(&request)?;
        let mut value = serde_json::to_value(&obs)
            .map_err(|e| Error::internal(format!("observe encode: {e}")))?;
        if let Some(obj) = value.as_object_mut() {
            obj.insert("ok".into(), json!(true));
            obj.insert("chromium".into(), json!(false));
            obj.remove("generation");
        }
        Ok(value)
    }

    fn execute(&mut self, params: &Value) -> Result<Value> {
        let program = params
            .get("program")
            .cloned()
            .or_else(|| params.get("steps").cloned())
            .ok_or_else(|| Error::invalid_params("execute needs program or steps"))?;
        let return_observation = match params.get("returnObservation") {
            None | Some(Value::Null) => None,
            Some(Value::Bool(true)) => Some(ObservationRequest::default()),
            Some(Value::Bool(false)) => None,
            Some(other) => Some(
                serde_json::from_value(other.clone())
                    .map_err(|e| Error::invalid_params(format!("returnObservation: {e}")))?,
            ),
        };
        let before = self.browser.active_page_meta();
        let executed = self.browser.execute_request(ExecuteRequest {
            program: Program::from_value(program)?,
            return_observation,
        })?;
        self.flatten_execute(executed, before)
    }

    /// NAPI `Engine.execute` envelope: top-level `status` / `steps`, not `{ result }`.
    fn flatten_execute(
        &self,
        executed: crate::ExecuteResult,
        before: Option<(String, String, u32, u64)>,
    ) -> Result<Value> {
        let mut value = serde_json::to_value(&executed.result)
            .map_err(|e| Error::internal(format!("execute encode: {e}")))?;
        let Some(obj) = value.as_object_mut() else {
            return Ok(json!({ "ok": true, "result": value }));
        };
        obj.insert("ok".into(), json!(true));
        if let Some((url, title, generation, revision)) = self.browser.active_page_meta() {
            let navigated = before.as_ref().is_some_and(|(_, _, g, _)| *g != generation);
            let title_changed = before.as_ref().is_some_and(|(_, t, _, _)| *t != title);
            obj.insert("url".into(), json!(url));
            obj.insert("title".into(), json!(title));
            obj.insert("generation".into(), json!(generation));
            obj.insert("revision".into(), json!(revision));
            obj.insert("navigated".into(), json!(navigated));
            obj.insert("titleChanged".into(), json!(title_changed));
        }
        if let Some(obs) = executed.observation {
            obj.insert("observation".into(), observation_envelope(obs)?);
        }
        Ok(value)
    }

    fn list_pages(&self) -> Result<Value> {
        let tabs: Vec<Value> = self
            .browser
            .tabs()
            .iter()
            .enumerate()
            .map(|(i, t)| {
                json!({
                    "page": t.page.0,
                    "url": t.url,
                    "title": t.page_title,
                    "active": i == self.browser.active_index(),
                })
            })
            .collect();
        Ok(json!({ "ok": true, "pages": tabs, "protocolVersion": 1 }))
    }

    fn close_page(&mut self) -> Result<Value> {
        self.browser.handle_event(NativeEvent::CloseTab)?;
        Ok(json!({ "ok": true, "closed": true }))
    }

    fn screenshot(&mut self) -> Result<Value> {
        let tab = self
            .browser
            .active_tab()
            .ok_or_else(|| Error::not_found("no active page"))?;
        let page = tab.page;
        let shot = self
            .browser
            .engine_mut()
            .screenshot(page, &crate::ScreenshotOptions::default())?;
        Ok(json!({
            "ok": true,
            "width": shot.width,
            "height": shot.height,
            "scale": shot.scale,
            "pngBase64": shot.to_json().get("pngBase64").cloned().unwrap_or(json!("")),
        }))
    }

    fn event(&mut self, params: &Value) -> Result<Value> {
        let event: NativeEvent = serde_json::from_value(params.clone())
            .map_err(|e| Error::invalid_params(format!("event: {e}")))?;
        let outcome = self.browser.handle_event(event)?;
        Ok(json!({
            "ok": true,
            "quit": outcome.quit,
            "chromeTitle": outcome.chrome_title,
            "chromium": false,
        }))
    }
}

fn observation_envelope(obs: crate::EngineObservation) -> Result<Value> {
    let mut value = serde_json::to_value(&obs)
        .map_err(|e| Error::internal(format!("observation encode: {e}")))?;
    if let Some(obj) = value.as_object_mut() {
        obj.insert("ok".into(), json!(true));
        obj.remove("generation");
        if let Some(settled) = obj.get("settled").cloned()
            && settled.is_object()
        {
            obj.insert(
                "settled".into(),
                json!(
                    settled
                        .get("settled")
                        .and_then(Value::as_bool)
                        .unwrap_or(true)
                ),
            );
        }
    }
    Ok(value)
}

impl Default for BrowserService {
    fn default() -> Self {
        Self::new()
    }
}

/// Listening JSON-RPC authority. Dropping it stops accept.
pub struct BrowserServiceListener {
    addr: SocketAddr,
    stop: Arc<AtomicBool>,
    jobs: Option<Sender<Job>>,
    accept: Option<JoinHandle<()>>,
    owner: Option<JoinHandle<()>>,
}

impl BrowserServiceListener {
    /// Bind `host:port` (`127.0.0.1:0` for an ephemeral test port).
    pub fn bind(addr: &str) -> Result<Self> {
        Self::bind_config(
            addr,
            EngineConfig {
                offline: true,
                policy: crate::NetworkPolicy::permissive(),
                ..EngineConfig::default()
            },
        )
    }

    /// Bind and construct the authority on the owner thread (engine is `!Send`).
    pub fn bind_config(addr: &str, config: EngineConfig) -> Result<Self> {
        let listener = TcpListener::bind(addr)
            .map_err(|e| Error::coded(ErrorCode::BackendUnavailable, format!("bind: {e}")))?;
        listener
            .set_nonblocking(true)
            .map_err(|e| Error::internal(format!("nonblocking: {e}")))?;
        let bound = listener
            .local_addr()
            .map_err(|e| Error::internal(format!("local_addr: {e}")))?;
        let (jobs, job_rx) = mpsc::channel::<Job>();
        let owner = thread::Builder::new()
            .name("ve-browser-owner".into())
            .spawn(move || {
                let mut service = BrowserService::with_config(config);
                while let Ok(job) = job_rx.recv() {
                    job(&mut service);
                }
            })
            .map_err(|e| Error::internal(format!("spawn owner: {e}")))?;
        let stop = Arc::new(AtomicBool::new(false));
        let stop_thread = Arc::clone(&stop);
        let jobs_accept = jobs.clone();
        let accept = thread::Builder::new()
            .name("ve-browser-service".into())
            .spawn(move || accept_loop(listener, jobs_accept, stop_thread))
            .map_err(|e| Error::internal(format!("spawn accept: {e}")))?;
        Ok(Self {
            addr: bound,
            stop,
            jobs: Some(jobs),
            accept: Some(accept),
            owner: Some(owner),
        })
    }

    /// Bound address clients should dial.
    #[must_use]
    pub fn addr(&self) -> SocketAddr {
        self.addr
    }

    /// Block until [`Self::shutdown`] or drop.
    pub fn wait(mut self) {
        if let Some(join) = self.accept.take() {
            let _ = join.join();
        }
    }

    /// Stop accepting. In-flight clients finish their current line.
    pub fn shutdown(&self) {
        self.stop.store(true, Ordering::Relaxed);
        let _ = TcpStream::connect_timeout(&self.addr, Duration::from_millis(50));
    }
}

impl Drop for BrowserServiceListener {
    fn drop(&mut self) {
        self.shutdown();
        if let Some(join) = self.accept.take() {
            let _ = join.join();
        }
        drop(self.jobs.take());
        if let Some(join) = self.owner.take() {
            let _ = join.join();
        }
    }
}

/// Accepts MCP/Node clients; the GUI thread owns [`BrowserService`] and
/// [`Self::poll`]s it. One `NativeBrowser`, no document copy, no PNG transport.
pub struct BrowserServicePump {
    addr: SocketAddr,
    stop: Arc<AtomicBool>,
    rx: Receiver<Job>,
    _keep_tx: Sender<Job>,
    accept: Option<JoinHandle<()>>,
}

impl BrowserServicePump {
    /// Bind `host:port`. The caller must [`Self::poll`] on the GUI/owner thread.
    pub fn bind(addr: &str) -> Result<Self> {
        let listener = TcpListener::bind(addr)
            .map_err(|e| Error::coded(ErrorCode::BackendUnavailable, format!("bind: {e}")))?;
        listener
            .set_nonblocking(true)
            .map_err(|e| Error::internal(format!("nonblocking: {e}")))?;
        let bound = listener
            .local_addr()
            .map_err(|e| Error::internal(format!("local_addr: {e}")))?;
        let (tx, rx) = mpsc::channel::<Job>();
        let stop = Arc::new(AtomicBool::new(false));
        let stop_thread = Arc::clone(&stop);
        let jobs_accept = tx.clone();
        let accept = thread::Builder::new()
            .name("ve-browser-pump".into())
            .spawn(move || accept_loop(listener, jobs_accept, stop_thread))
            .map_err(|e| Error::internal(format!("spawn accept: {e}")))?;
        Ok(Self {
            addr: bound,
            stop,
            rx,
            _keep_tx: tx,
            accept: Some(accept),
        })
    }

    /// Bound address MCP/Node clients dial.
    #[must_use]
    pub fn addr(&self) -> SocketAddr {
        self.addr
    }

    /// Run queued client jobs on this thread's [`BrowserService`].
    pub fn poll(&self, service: &mut BrowserService) -> usize {
        let mut n = 0;
        while let Ok(job) = self.rx.try_recv() {
            job(service);
            n += 1;
        }
        n
    }

    /// Stop accepting.
    pub fn shutdown(&self) {
        self.stop.store(true, Ordering::Relaxed);
        let _ = TcpStream::connect_timeout(&self.addr, Duration::from_millis(50));
    }
}

impl Drop for BrowserServicePump {
    fn drop(&mut self) {
        self.shutdown();
        if let Some(join) = self.accept.take() {
            let _ = join.join();
        }
    }
}

fn accept_loop(listener: TcpListener, jobs: Sender<Job>, stop: Arc<AtomicBool>) {
    while !stop.load(Ordering::Relaxed) {
        match listener.accept() {
            Ok((stream, _)) => {
                // macOS inherits O_NONBLOCK from the listener. A nonblocking
                // client stream makes read_line return WouldBlock and close
                // the socket before the first RPC (Broken pipe / empty reply).
                let _ = stream.set_nonblocking(false);
                let jobs = jobs.clone();
                let _ = thread::Builder::new()
                    .name("ve-browser-client".into())
                    .spawn(move || serve_client(stream, jobs));
            }
            Err(e)
                if matches!(
                    e.kind(),
                    std::io::ErrorKind::WouldBlock
                        | std::io::ErrorKind::Interrupted
                        | std::io::ErrorKind::TimedOut
                ) =>
            {
                thread::sleep(Duration::from_millis(5));
            }
            Err(_) if stop.load(Ordering::Relaxed) => break,
            Err(_) => {
                // Transient accept errors must not tear down the authority.
                thread::sleep(Duration::from_millis(10));
            }
        }
    }
}

fn serve_client(stream: TcpStream, jobs: Sender<Job>) {
    let _ = stream.set_nonblocking(false);
    let _ = stream.set_nodelay(true);
    let _ = stream.set_read_timeout(Some(Duration::from_secs(30)));
    let mut reader = match stream.try_clone() {
        Ok(clone) => BufReader::new(clone),
        Err(_) => return,
    };
    let mut writer = stream;
    let mut line = String::new();
    loop {
        line.clear();
        match reader.read_line(&mut line) {
            Ok(0) => break,
            Ok(_) => {}
            Err(e)
                if matches!(
                    e.kind(),
                    std::io::ErrorKind::WouldBlock
                        | std::io::ErrorKind::Interrupted
                        | std::io::ErrorKind::TimedOut
                ) =>
            {
                if e.kind() == std::io::ErrorKind::WouldBlock {
                    thread::sleep(Duration::from_millis(5));
                }
                continue;
            }
            Err(_) => break,
        }
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        let reply = dispatch_line(trimmed, &jobs);
        if writeln!(writer, "{reply}").is_err() {
            break;
        }
        if trimmed.contains("\"shutdown\"") {
            break;
        }
    }
}

fn dispatch_line(line: &str, jobs: &Sender<Job>) -> Value {
    let req: Value = match serde_json::from_str(line) {
        Ok(v) => v,
        Err(e) => {
            return json!({
                "jsonrpc": "2.0",
                "id": Value::Null,
                "error": { "code": "invalid_params", "message": e.to_string() }
            });
        }
    };
    let id = req.get("id").cloned().unwrap_or(Value::Null);
    let method = req
        .get("method")
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_owned();
    let params = req.get("params").cloned().unwrap_or_else(|| json!({}));
    let (reply_tx, reply_rx) = mpsc::channel();
    let sent = jobs.send(Box::new(move |svc: &mut BrowserService| {
        let result = svc.handle(&method, &params);
        let _ = reply_tx.send(result);
    }));
    if sent.is_err() {
        return json!({
            "jsonrpc": "2.0",
            "id": id,
            "error": { "code": "backend_unavailable", "message": "browser service stopped" }
        });
    }
    match reply_rx.recv() {
        Ok(Ok(result)) => json!({"jsonrpc": "2.0", "id": id, "result": result}),
        Ok(Err(err)) => json!({
            "jsonrpc": "2.0",
            "id": id,
            "error": {
                "code": err.code().as_str(),
                "message": err.to_string()
            }
        }),
        Err(_) => json!({
            "jsonrpc": "2.0",
            "id": id,
            "error": { "code": "internal", "message": "owner thread stopped" }
        }),
    }
}

/// Node/MCP-shaped client of [`BrowserServiceListener`].
pub struct BrowserClient {
    stream: TcpStream,
    next_id: u64,
}

impl BrowserClient {
    /// Dial a running authority.
    pub fn connect(addr: SocketAddr) -> Result<Self> {
        let stream = TcpStream::connect_timeout(&addr, Duration::from_secs(2))
            .map_err(|e| Error::coded(ErrorCode::BackendUnavailable, format!("connect: {e}")))?;
        let _ = stream.set_nonblocking(false);
        stream
            .set_nodelay(true)
            .map_err(|e| Error::internal(format!("nodelay: {e}")))?;
        stream
            .set_read_timeout(Some(Duration::from_secs(15)))
            .map_err(|e| Error::internal(format!("timeout: {e}")))?;
        Ok(Self { stream, next_id: 1 })
    }

    /// One JSON-RPC call. Errors are engine taxonomy codes.
    pub fn call(&mut self, method: &str, params: Value) -> Result<Value> {
        let id = self.next_id;
        self.next_id += 1;
        let req = json!({"jsonrpc":"2.0","id":id,"method":method,"params":params});
        writeln!(self.stream, "{req}")
            .map_err(|e| Error::coded(ErrorCode::BackendUnavailable, format!("write: {e}")))?;
        let mut reader = BufReader::new(
            self.stream
                .try_clone()
                .map_err(|e| Error::internal(format!("clone: {e}")))?,
        );
        let mut line = String::new();
        reader
            .read_line(&mut line)
            .map_err(|e| Error::coded(ErrorCode::BackendUnavailable, format!("read: {e}")))?;
        let reply: Value = serde_json::from_str(line.trim())
            .map_err(|e| Error::internal(format!("reply: {e}")))?;
        if let Some(err) = reply.get("error") {
            let code = err
                .get("code")
                .and_then(Value::as_str)
                .unwrap_or("internal");
            let message = err
                .get("message")
                .and_then(Value::as_str)
                .unwrap_or("browser service error");
            return Err(Error::coded(parse_code(code), message));
        }
        Ok(reply.get("result").cloned().unwrap_or(Value::Null))
    }
}

fn parse_code(code: &str) -> ErrorCode {
    match code {
        "not_found" => ErrorCode::NotFound,
        "invalid_params" => ErrorCode::InvalidParams,
        "target_detached" => ErrorCode::TargetDetached,
        "target_ambiguous" => ErrorCode::TargetAmbiguous,
        "backend_unavailable" => ErrorCode::BackendUnavailable,
        "capability_unsupported" => ErrorCode::CapabilityUnsupported,
        "step_failed" => ErrorCode::StepFailed,
        "condition_timeout" => ErrorCode::ConditionTimeout,
        "cancelled" => ErrorCode::Cancelled,
        "conflict" => ErrorCode::Conflict,
        _ => ErrorCode::Internal,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::VectorEngine;
    use std::thread;
    use std::time::Instant;
    use ve_core::process_memory_snapshot;

    #[test]
    fn human_and_mcp_clients_share_one_page_authority() {
        let svc = BrowserServiceListener::bind("127.0.0.1:0").expect("bind");
        let mut human = BrowserClient::connect(svc.addr()).expect("human");
        let mut mcp = BrowserClient::connect(svc.addr()).expect("mcp");

        let opened = human
            .call(
                "pages.open",
                json!({"html":"<input id=t>","url":"https://share.test/"}),
            )
            .expect("open");
        assert_eq!(opened["chromium"], false);
        assert_eq!(opened["backend"], "vector-engine");
        let page = opened["page"].as_u64().expect("page id");

        human
            .call("input.event", json!({"type":"ime","text":"typed-by-human"}))
            .expect("ime");

        let obs = mcp.call("pages.observe", json!({})).expect("observe");
        assert_eq!(obs["page"], page);
        assert_eq!(field_value(&obs), "typed-by-human");
        assert_eq!(obs["chromium"], false);

        mcp.call(
            "pages.execute",
            json!({"program":[{"id":"a","op":"type","target":"css:input","value":"-agent"}]}),
        )
        .expect("agent type");
        let after = mcp.call("pages.observe", json!({})).expect("observe2");
        assert_eq!(field_value(&after), "typed-by-human-agent");

        let taken = human.call("pages.takeover", json!({})).expect("takeover");
        assert_eq!(taken["controller"], "human");
        let blocked = mcp.call(
            "pages.execute",
            json!({"program":[{"id":"x","op":"type","target":"css:input","value":"blocked"}]}),
        );
        assert!(blocked.is_err(), "takeover must stop agent dispatch");
        let err = blocked.expect_err("conflict");
        assert_eq!(err.code(), ErrorCode::Conflict);
        human
            .call("input.event", json!({"type":"ime","text":"-still"}))
            .expect("human still types after takeover");
        assert_eq!(
            field_value(&mcp.call("pages.observe", json!({})).expect("obs-human")),
            "typed-by-human-agent-still"
        );

        let resumed = human.call("pages.resume", json!({})).expect("resume");
        assert_eq!(resumed["controller"], "none");
        mcp.call(
            "pages.execute",
            json!({"program":[{"id":"y","op":"type","target":"css:input","value":"-ok"}]}),
        )
        .expect("resume execute");
        assert_eq!(
            field_value(&mcp.call("pages.observe", json!({})).expect("obs3")),
            "typed-by-human-agent-still-ok"
        );

        human
            .call(
                "input.event",
                json!({"type":"resize","width":800.0,"height":600.0}),
            )
            .expect("resize");
        human
            .call("input.event", json!({"type":"wheel","dx":0.0,"dy":40.0}))
            .expect("wheel");
        human
            .call(
                "input.event",
                json!({"type":"accessKitAction","name":"urlbar"}),
            )
            .expect("a11y");
        human
            .call("input.event", json!({"type":"imePreedit","text":"ni"}))
            .expect("preedit");

        let scene = mcp.call("scene.update", json!({})).expect("scene");
        assert_eq!(scene["png"], false);
        assert_eq!(scene["kind"], "displayList");
        assert_eq!(scene["transport"], "scene");
        assert!(scene["itemCount"].as_u64().unwrap_or(0) > 0);
        let items = scene["items"].as_array().expect("scene items");
        assert!(!items.is_empty(), "{scene}");
        assert_eq!(scene["page"], page);
        human
            .call("input.event", json!({"type":"select","start":0,"end":4}))
            .expect("select");

        let id = mcp.call("identity", json!({})).expect("identity");
        assert_eq!(id["chromium"], false);
        assert_eq!(id["electron"], false);
        assert_eq!(id["service"], "browser-service");
        assert_eq!(id["page"], page);
    }

    #[test]
    fn in_process_handle_matches_socket_protocol() {
        let mut svc = BrowserService::new();
        let opened = svc
            .handle(
                "pages.open",
                &json!({"html":"<p>hi</p>","url":"https://t.test/"}),
            )
            .unwrap();
        assert_eq!(opened["chromium"], false);
        let scene = svc.handle("scene.update", &json!({})).unwrap();
        assert_eq!(scene["png"], false);
    }

    #[test]
    fn execute_returns_top_level_steps_and_observation() {
        let mut svc = BrowserService::new();
        svc.handle(
            "pages.open",
            &json!({"html":"<input id=t>","url":"https://t.test/"}),
        )
        .unwrap();
        let executed = svc
            .handle(
                "pages.execute",
                &json!({
                    "program": [{"id":"a","op":"type","target":"css:input","value":"x"}],
                    "returnObservation": true
                }),
            )
            .unwrap();
        assert_eq!(executed["ok"], true);
        assert_eq!(executed["status"], "completed");
        let steps = executed["steps"].as_array().expect("top-level steps");
        assert_eq!(steps[0]["stepId"], "a");
        assert_eq!(steps[0]["status"], "ok");
        assert!(executed.get("result").is_none(), "{executed}");
        assert_eq!(executed["observation"]["ok"], true);
        assert!(executed["observation"]["content"].is_object());
        assert!(executed["generation"].as_u64().is_some());
        assert_eq!(executed["navigated"], false);

        let opened = svc
            .handle(
                "pages.open",
                &json!({"html":"<p>one</p>","url":"https://t.test/one"}),
            )
            .unwrap();
        let before = opened["generation"].as_u64().unwrap_or(0);
        let moved = svc
            .handle(
                "pages.execute",
                &json!({
                    "program": [{"id":"n","op":"navigate","url":"data:text/html,<title>two</title><p>two</p>"}],
                    "returnObservation": true
                }),
            )
            .unwrap();
        assert_eq!(moved["status"], "completed", "{moved}");
        assert_eq!(moved["navigated"], true, "{moved}");
        assert!(
            moved["generation"].as_u64().unwrap_or(0) > before,
            "{moved}"
        );
    }

    #[test]
    fn concurrency_tail_and_process_tree_memory() {
        // Gate E: tail + process-tree RSS on a records-sized tree, not a
        // one-input warm fixture.
        let mut html = String::from(
            "<form><label>Name <input id=n name=n></label><button>Save</button></form><ul id=list>",
        );
        for i in 0..400 {
            html.push_str(&format!(
                "<li id=\"r{i}\">row {i} <button type=button>act {i}</button></li>"
            ));
        }
        html.push_str("</ul>");
        let svc = BrowserServiceListener::bind("127.0.0.1:0").expect("bind");
        let mut opener = BrowserClient::connect(svc.addr()).expect("open client");
        opener
            .call(
                "pages.open",
                json!({"html": html, "url": "https://tail.test/records"}),
            )
            .expect("open");
        opener
            .call("pages.observe", json!({}))
            .expect("warm observe");
        let n = 16;
        let (tx, rx) = std::sync::mpsc::channel();
        for _ in 0..n {
            let addr = svc.addr();
            let tx = tx.clone();
            thread::spawn(move || {
                let mut client = BrowserClient::connect(addr).expect("client");
                let started = Instant::now();
                let observed = client.call("pages.observe", json!({}));
                tx.send((started.elapsed().as_millis() as u64, observed.is_ok()))
                    .expect("send");
            });
        }
        drop(tx);
        let mut samples = Vec::new();
        let mut ok = 0usize;
        while let Ok((ms, success)) = rx.recv() {
            samples.push(ms);
            if success {
                ok += 1;
            }
        }
        assert_eq!(samples.len(), n);
        assert_eq!(ok, n);
        samples.sort_unstable();
        let p50 = samples[samples.len() / 2];
        let p95 =
            samples[((samples.len() as f64 * 0.95).ceil() as usize).clamp(1, samples.len()) - 1];
        assert!(p95 > 0);
        let (rss, tree) = match process_memory_snapshot() {
            Some((rss, tree)) => {
                assert!(tree >= rss, "tree={tree} rss={rss}");
                (Some(rss), Some(tree))
            }
            None => (None, None),
        };
        if let Ok(out) = std::env::var("VECTOR_EVIDENCE_OUT") {
            let report = json!({
                "review": "Vector_Current_Review_60b2d41",
                "gate": "E",
                "test": "concurrency_tail_and_process_tree_memory",
                "chromium": false,
                "document": { "rows": 400, "url": "https://tail.test/records" },
                "concurrency": n,
                "success": ok,
                "samplesMs": samples,
                "p50Ms": p50,
                "p95Ms": p95,
                "rss_bytes": rss,
                "process_tree_rss_bytes": tree,
                "warmFixture": false,
            });
            let _ = std::fs::write(
                out,
                format!("{}\n", serde_json::to_string_pretty(&report).unwrap()),
            );
        }
    }

    #[test]
    fn unseen_layout_variant_is_scored_by_outcome_only() {
        let variants = [
            (
                r#"<form><label>Name <input name=n id=n></label><button>Save</button></form>"#,
                "https://held.test/a",
            ),
            (
                r#"<div class="card"><header>Checkout</header><section><span>Full name</span><input aria-label="Name" name="full"><button class="primary">Save</button></section></div>"#,
                "https://held.test/b",
            ),
        ];
        for (html, url) in variants {
            let mut engine = VectorEngine::new(EngineConfig {
                offline: true,
                ..EngineConfig::default()
            });
            let opened = engine
                .open(crate::OpenRequest::html(html, Some(url)))
                .expect("open");
            engine
                .execute(
                    opened.page,
                    &crate::ExecuteRequest {
                        program: Program::from_value(json!([
                            {"id":"f","op":"fill","target":"css:input","value":"Ada Lovelace"}
                        ]))
                        .unwrap(),
                        ..crate::ExecuteRequest::default()
                    },
                )
                .expect("fill");
            let obs = engine
                .observe(opened.page, &crate::ObservationRequest::default())
                .expect("observe");
            let scored = score_unseen_name(&obs);
            assert_eq!(
                scored.as_deref(),
                Some("Ada Lovelace"),
                "evaluator must accept unseen layout {url}"
            );
        }
    }

    #[test]
    fn gui_thread_pump_and_mcp_client_share_one_native_browser() {
        let mut service = BrowserService::new();
        service
            .handle(
                "pages.open",
                &json!({"html":"<input id=t>","url":"https://gui.test/"}),
            )
            .expect("open");
        service
            .handle(
                "input.event",
                &json!({"type":"ime","text":"typed-by-human"}),
            )
            .expect("ime");
        let page = service.browser().active_tab().expect("tab").page.0;
        let pump = BrowserServicePump::bind("127.0.0.1:0").expect("pump");
        let addr = pump.addr();
        let (tx, rx) = std::sync::mpsc::channel();
        thread::spawn(move || {
            let mut mcp = BrowserClient::connect(addr).expect("mcp");
            let obs = mcp.call("pages.observe", json!({}));
            let scene = mcp.call("scene.update", json!({}));
            tx.send((obs, scene)).expect("send");
        });
        let started = Instant::now();
        let mut got = None;
        while started.elapsed() < Duration::from_secs(3) {
            pump.poll(&mut service);
            if let Ok(pair) = rx.try_recv() {
                got = Some(pair);
                break;
            }
            thread::sleep(Duration::from_millis(5));
        }
        let (obs, scene) = got.expect("mcp observe");
        let obs = obs.expect("observe ok");
        let scene = scene.expect("scene ok");
        assert_eq!(obs["page"], page);
        assert_eq!(field_value(&obs), "typed-by-human");
        assert_eq!(scene["png"], false);
        assert_eq!(scene["kind"], "displayList");
        assert_eq!(scene["page"], page);
        assert!(!service.browser().identity()["chromium"].as_bool().unwrap());
    }

    #[cfg(feature = "gpu")]
    #[test]
    fn gpu_present_and_mcp_share_one_page() {
        let mut service = BrowserService::new();
        service
            .handle(
                "pages.open",
                &json!({"html":"<input id=t>","url":"https://gpu.test/"}),
            )
            .expect("open");
        let gpu = service
            .browser_mut()
            .present_direct()
            .expect("present_direct");
        service
            .handle("input.event", &json!({"type":"ime","text":"typed-on-gpu"}))
            .expect("ime");
        if gpu {
            assert!(
                service.browser().gpu_present(),
                "Finding 1: GPU present must mark the live page"
            );
        }
        let page = service.browser().active_tab().expect("tab").page.0;
        let pump = BrowserServicePump::bind("127.0.0.1:0").expect("pump");
        let addr = pump.addr();
        let (tx, rx) = std::sync::mpsc::channel();
        thread::spawn(move || {
            let mut mcp = BrowserClient::connect(addr).expect("mcp");
            let obs = mcp.call("pages.observe", json!({}));
            let scene = mcp.call("scene.update", json!({}));
            let id = mcp.call("identity", json!({}));
            tx.send((obs, scene, id)).expect("send");
        });
        let started = Instant::now();
        let mut got = None;
        while started.elapsed() < Duration::from_secs(3) {
            pump.poll(&mut service);
            if let Ok(triple) = rx.try_recv() {
                got = Some(triple);
                break;
            }
            thread::sleep(Duration::from_millis(5));
        }
        let (obs, scene, id) = got.expect("mcp observe");
        let obs = obs.expect("observe ok");
        let scene = scene.expect("scene ok");
        let id = id.expect("identity ok");
        assert_eq!(obs["page"], page);
        assert_eq!(field_value(&obs), "typed-on-gpu");
        assert_eq!(scene["png"], false);
        assert_eq!(scene["kind"], "displayList");
        assert_eq!(scene["page"], page);
        assert_eq!(id["chromium"], false);
        assert_eq!(id["service"], "browser-service");
        assert_eq!(id["page"], page);
        if gpu {
            assert_eq!(id["gpuPresent"], true);
            assert_eq!(scene["gpuPresent"], true);
        }
    }

    fn field_value(obs: &Value) -> String {
        obs.pointer("/observation/content/formFields")
            .or_else(|| obs.pointer("/content/formFields"))
            .and_then(Value::as_array)
            .into_iter()
            .flatten()
            .find_map(|f| f.get("value").and_then(Value::as_str))
            .or_else(|| {
                obs.pointer("/observation/content/elements")
                    .or_else(|| obs.pointer("/content/elements"))
                    .and_then(Value::as_array)
                    .into_iter()
                    .flatten()
                    .find(|e| e.get("tag").and_then(Value::as_str) == Some("input"))
                    .and_then(|e| e.get("value").and_then(Value::as_str))
            })
            .unwrap_or("")
            .to_owned()
    }

    fn score_unseen_name(obs: &crate::Observation) -> Option<String> {
        obs.observation
            .content
            .form_fields
            .iter()
            .find_map(|f| f.value.clone())
            .or_else(|| {
                obs.observation
                    .content
                    .elements
                    .iter()
                    .find(|e| e.tag == "input")
                    .and_then(|e| e.value.clone())
            })
    }
}
