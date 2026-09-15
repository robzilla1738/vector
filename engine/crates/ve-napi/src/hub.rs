//! The hub: routes calls to the right context host and allocates global
//! page ids. Plain Rust so it is testable without Node.

use std::collections::HashMap;
use std::sync::mpsc::{self, Receiver};

use serde_json::{Value, json};
use ve_api::EngineConfig;

use crate::errors::ApiError;
use crate::host::{ExecuteOptions, Host};
use crate::observe::ObserveRequest;

/// The default browsing context every engine starts with.
pub const DEFAULT_CONTEXT: u32 = 1;

/// Owns the context hosts and the page → context map.
pub struct Hub {
    config: EngineConfig,
    contexts: HashMap<u32, Host>,
    pages: HashMap<u64, u32>,
    next_context: u32,
    next_page: u64,
}

impl std::fmt::Debug for Hub {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Hub")
            .field("contexts", &self.contexts.len())
            .field("pages", &self.pages.len())
            .finish_non_exhaustive()
    }
}

fn immediate(value: Value) -> Receiver<Value> {
    let (tx, rx) = mpsc::channel();
    let _ = tx.send(value);
    rx
}

fn fail(e: &ApiError) -> Receiver<Value> {
    immediate(json!({ "ok": false, "error": e.to_json() }))
}

impl Hub {
    /// Creates a hub with the default context started.
    #[must_use]
    pub fn new(config: EngineConfig) -> Self {
        let mut hub = Self {
            config,
            contexts: HashMap::new(),
            pages: HashMap::new(),
            next_context: DEFAULT_CONTEXT,
            next_page: 0,
        };
        hub.spawn_context();
        hub
    }

    /// Creates a hub from an `EngineConfig` JSON object.
    pub fn from_json(config_json: &str) -> Result<Self, ApiError> {
        let config: EngineConfig = if config_json.trim().is_empty() {
            EngineConfig::default()
        } else {
            serde_json::from_str(config_json)?
        };
        Ok(Self::new(config))
    }

    fn spawn_context(&mut self) -> u32 {
        let id = self.next_context;
        self.next_context += 1;
        self.contexts
            .insert(id, Host::spawn(self.config.clone(), id));
        id
    }

    /// Creates an isolated context (own cookie jar, own thread).
    pub fn new_context(&mut self, _options_json: &str) -> Result<u32, ApiError> {
        if self.contexts.is_empty() {
            return Err(ApiError::new("backend_unavailable", "engine is shut down"));
        }
        Ok(self.spawn_context())
    }

    fn context(&self, id: u32) -> Result<&Host, ApiError> {
        self.contexts
            .get(&id)
            .ok_or_else(|| ApiError::new("not_found", format!("no such context {id}")))
    }

    fn host_of(&self, page: u64) -> Result<&Host, ApiError> {
        let ctx = self
            .pages
            .get(&page)
            .ok_or_else(|| ApiError::new("target_detached", format!("no such page {page}")))?;
        self.context(*ctx)
    }

    /// Opens a page in a context; the reply carries the new page id.
    pub fn open(&mut self, context_id: u32, url: &str, _options_json: &str) -> Receiver<Value> {
        if let Err(e) = self.context(context_id) {
            return fail(&e);
        }
        self.next_page += 1;
        let page = self.next_page;
        self.pages.insert(page, context_id);
        let url = url.to_owned();
        match self.context(context_id) {
            Ok(host) => host.call(move |s| s.open(page, &url)),
            Err(e) => fail(&e),
        }
    }

    /// Observes a page.
    pub fn observe(&self, page: u64, options_json: &str) -> Receiver<Value> {
        let req: ObserveRequest = match serde_json::from_str(options_json) {
            Ok(r) => r,
            Err(e) => return fail(&e.into()),
        };
        match self.host_of(page) {
            Ok(h) => h.call(move |s| s.observe(page, &req)),
            Err(e) => fail(&e),
        }
    }

    /// Executes contracts steps on a page.
    pub fn execute(&self, page: u64, steps_json: &str, options_json: &str) -> Receiver<Value> {
        let steps: Vec<Value> = match serde_json::from_str::<Value>(steps_json) {
            Ok(Value::Array(a)) => a,
            Ok(Value::Object(mut o)) => match o.remove("steps") {
                Some(Value::Array(a)) => a,
                _ => return fail(&ApiError::invalid("program has no steps array")),
            },
            Ok(_) => return fail(&ApiError::invalid("steps must be an array")),
            Err(e) => return fail(&e.into()),
        };
        let opts: ExecuteOptions = match serde_json::from_str(options_json) {
            Ok(o) => o,
            Err(e) => return fail(&e.into()),
        };
        match self.host_of(page) {
            Ok(h) => h.call(move |s| s.execute(page, &steps, &opts)),
            Err(e) => fail(&e),
        }
    }

    /// Screenshots are not available until `ve-gfx` is wired (M2+).
    pub fn screenshot(&self, page: u64, _options_json: &str) -> Receiver<Value> {
        match self.host_of(page) {
            Ok(_) => fail(&ApiError::unsupported(
                "screenshot (ve-gfx not wired into ve-api yet)",
            )),
            Err(e) => fail(&e),
        }
    }

    /// Closes a page.
    pub fn close(&mut self, page: u64) -> Receiver<Value> {
        let Some(ctx) = self.pages.remove(&page) else {
            return immediate(json!({ "ok": true, "closed": false }));
        };
        match self.context(ctx) {
            Ok(h) => h.call(move |s| s.close(page)),
            Err(e) => fail(&e),
        }
    }

    /// Cookies of a context.
    pub fn get_cookies(&self, context_id: u32, url: Option<&str>) -> Receiver<Value> {
        let url = url.map(str::to_owned);
        match self.context(context_id) {
            Ok(h) => h.call(move |s| s.get_cookies(url.as_deref())),
            Err(e) => fail(&e),
        }
    }

    /// Stores cookies into a context.
    pub fn set_cookies(&self, context_id: u32, cookies_json: &str) -> Receiver<Value> {
        let cookies: Vec<Value> = match serde_json::from_str(cookies_json) {
            Ok(c) => c,
            Err(e) => return fail(&e.into()),
        };
        match self.context(context_id) {
            Ok(h) => h.call(move |s| s.set_cookies(&cookies)),
            Err(e) => fail(&e),
        }
    }

    /// Tracked page ids.
    #[must_use]
    pub fn pages(&self) -> Vec<u64> {
        let mut v: Vec<u64> = self.pages.keys().copied().collect();
        v.sort_unstable();
        v
    }

    /// Drops every host (their threads exit once queued jobs finish).
    pub fn shutdown(&mut self) {
        self.contexts.clear();
        self.pages.clear();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hub_routes_pages_to_contexts_and_isolates_cookies() {
        let mut hub =
            Hub::from_json(r#"{"offline": true, "viewport": {"width": 800, "height": 600}}"#)
                .unwrap();
        let ctx2 = hub.new_context("{}").unwrap();
        assert_eq!(ctx2, 2);

        let a = hub
            .open(
                DEFAULT_CONTEXT,
                "data:text/html,<title>A</title><button>Go</button>",
                "{}",
            )
            .recv()
            .unwrap();
        let b = hub
            .open(ctx2, "data:text/html,<title>B</title>", "{}")
            .recv()
            .unwrap();
        assert_eq!(a["ok"], true, "{a}");
        assert_eq!(b["ok"], true, "{b}");
        let pa = a["page"].as_u64().unwrap();
        let pb = b["page"].as_u64().unwrap();
        assert_ne!(pa, pb);
        assert_eq!(hub.pages(), vec![pa, pb]);

        let obs = hub.observe(pa, "{}").recv().unwrap();
        assert_eq!(obs["content"]["title"], "A");
        assert_eq!(obs["content"]["viewport"]["width"], 800.0);
        let obs = hub.observe(pb, r#"{"scope":"links"}"#).recv().unwrap();
        assert_eq!(obs["content"]["title"], "B");

        let bad = hub.observe(999, "{}").recv().unwrap();
        assert_eq!(bad["error"]["code"], "target_detached");
        let bad = hub.observe(pa, "not json").recv().unwrap();
        assert_eq!(bad["error"]["code"], "invalid_params");
        let bad = hub.open(42, "about:blank", "{}").recv().unwrap();
        assert_eq!(bad["error"]["code"], "not_found");

        let ran = hub
            .execute(
                pa,
                r#"{"steps":[{"id":"c","op":"click","target":"role=button[name=Go]"}]}"#,
                "{}",
            )
            .recv()
            .unwrap();
        assert_eq!(ran["status"], "completed", "{ran}");
        assert_eq!(
            hub.execute(pa, "{}", "{}").recv().unwrap()["error"]["code"],
            "invalid_params"
        );

        let shot = hub.screenshot(pa, "{}").recv().unwrap();
        assert_eq!(shot["error"]["code"], "capability_unsupported");

        hub.set_cookies(DEFAULT_CONTEXT, r#"[{"name":"a","value":"1","domain":"x.test","path":"/","secure":false,"httpOnly":false}]"#)
            .recv()
            .unwrap();
        assert_eq!(
            hub.get_cookies(DEFAULT_CONTEXT, None).recv().unwrap()["cookies"]
                .as_array()
                .unwrap()
                .len(),
            1
        );
        assert_eq!(
            hub.get_cookies(ctx2, None).recv().unwrap()["cookies"]
                .as_array()
                .unwrap()
                .len(),
            0
        );

        assert_eq!(hub.close(pa).recv().unwrap()["closed"], true);
        assert_eq!(hub.close(pa).recv().unwrap()["closed"], false);
        assert_eq!(hub.pages(), vec![pb]);
        hub.shutdown();
        assert!(hub.new_context("{}").is_err());
    }
}
