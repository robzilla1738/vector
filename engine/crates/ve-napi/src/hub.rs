//! The hub: routes calls to the right context host and allocates global
//! page ids. Plain Rust so it is testable without Node.

use std::collections::HashMap;
use std::sync::mpsc::{self, Receiver};

use serde_json::{Value, json};
use ve_api::{EngineConfig, NetworkPolicy};

use crate::errors::ApiError;
use crate::host::{ExecuteOptions, Host};

/// The default browsing context every engine starts with.
pub const DEFAULT_CONTEXT: u32 = 1;

/// Owns the context hosts and the page → context map.
pub struct Hub {
    config: EngineConfig,
    contexts: HashMap<u32, Host>,
    pages: HashMap<u64, u32>,
    /// Origin → process context (H3-4 per-site isolation).
    site_contexts: HashMap<String, u32>,
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
    immediate(e.to_reply())
}

fn parse_options(options_json: &str) -> Result<Value, ApiError> {
    if options_json.trim().is_empty() {
        return Ok(json!({}));
    }
    let value: Value = serde_json::from_str(options_json)?;
    match value {
        Value::Null => Ok(json!({})),
        Value::Object(_) => Ok(value),
        other => Err(ApiError::invalid(format!(
            "options must be a JSON object, got {other}"
        ))),
    }
}

/// Parses an `EngineConfig` from JSON. Unspecified policy stays strict
/// (loopback blocked, `file:` refused, no private-network). Fixtures must
/// pass an explicit allowlist. `securityProfile` / `VECTOR_ENGINE_PROFILE`
/// select production fail-closed isolation.
pub fn parse_config(config_json: &str) -> Result<EngineConfig, ApiError> {
    let mut config: EngineConfig = if config_json.trim().is_empty() {
        // Empty JSON is the product default: system shaper, strict policy.
        serde_json::from_value(json!({}))?
    } else {
        let value: Value = serde_json::from_str(config_json)?;
        serde_json::from_value(value)?
    };
    if matches!(
        std::env::var("VECTOR_ENGINE_PROFILE").as_deref(),
        Ok("production" | "prod")
    ) || matches!(
        std::env::var("VECTOR_ENGINE_STRICT").as_deref(),
        Ok("1" | "true")
    ) {
        config.security_profile = ve_api::SecurityProfile::Production;
    }
    if matches!(
        std::env::var("VECTOR_HERMETIC").as_deref(),
        Ok("1" | "true")
    ) {
        config.hermetic = true;
    }
    Ok(config)
}

impl Hub {
    /// Creates a hub with the default context started.
    #[must_use]
    pub fn new(config: EngineConfig) -> Self {
        Self::try_new(config).expect("engine hub")
    }

    /// Creates a hub; production isolation failures are `backend_unavailable`.
    pub fn try_new(config: EngineConfig) -> Result<Self, ApiError> {
        let mut hub = Self {
            config,
            contexts: HashMap::new(),
            pages: HashMap::new(),
            site_contexts: HashMap::new(),
            next_context: DEFAULT_CONTEXT,
            next_page: 0,
        };
        hub.spawn_context(None)?;
        Ok(hub)
    }

    /// Creates a hub from an `EngineConfig` JSON object (see [`parse_config`]).
    pub fn from_json(config_json: &str) -> Result<Self, ApiError> {
        Self::try_new(parse_config(config_json)?)
    }

    /// Backend/build/security identity for sessions and traces.
    #[must_use]
    pub fn identity(&self) -> Value {
        let isolation = self
            .contexts
            .get(&DEFAULT_CONTEXT)
            .map_or("none", Host::isolation);
        json!({
            "abiVersion": crate::ABI_VERSION,
            "protocolVersion": crate::isolate::HOST_PROTOCOL,
            "engine": crate::version(),
            "isolation": isolation,
            "sandbox": isolation == "process",
            "securityProfile": self.config.security_profile,
            "host": crate::isolate::host_binary().map(|p| p.to_string_lossy().into_owned()),
        })
    }

    fn spawn_context(&mut self, policy: Option<NetworkPolicy>) -> Result<u32, ApiError> {
        let id = self.next_context;
        self.next_context += 1;
        let mut config = self.config.clone();
        if let Some(policy) = policy {
            config.policy = policy;
        }
        let host = Host::try_spawn(config, id)?;
        self.contexts.insert(id, host);
        Ok(id)
    }

    /// Creates an isolated context (own cookie jar, own thread).
    /// `options_json` may carry a `policy` (`NetworkPolicy`) override.
    pub fn new_context(&mut self, options_json: &str) -> Result<u32, ApiError> {
        if self.contexts.is_empty() {
            return Err(ApiError::new("backend_unavailable", "engine is shut down"));
        }
        let options = parse_options(options_json)?;
        let policy = match options.get("policy") {
            None | Some(Value::Null) => None,
            Some(p) => Some(
                serde_json::from_value::<NetworkPolicy>(p.clone())
                    .map_err(|e| ApiError::invalid(format!("network policy: {e}")))?,
            ),
        };
        self.spawn_context(policy)
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
            .ok_or_else(|| ApiError::no_such_page(page))?;
        self.context(*ctx)
    }

    fn site_origin(url: &str) -> String {
        url::Url::parse(url)
            .ok()
            .map(|u| u.origin().ascii_serialization())
            .unwrap_or_else(|| url.to_owned())
    }

    /// Process context for `url`'s origin. Production isolation gets one
    /// host process per site (H3-4). Callers still pass a context id; a
    /// different origin is remapped onto the site process.
    fn map_site_context(&mut self, fallback: u32, url: &str) -> Result<u32, ApiError> {
        let origin = Self::site_origin(url);
        if let Some(&id) = self.site_contexts.get(&origin) {
            return Ok(id);
        }
        let id = if self.site_contexts.is_empty() && self.contexts.contains_key(&fallback) {
            fallback
        } else {
            self.spawn_context(None)?
        };
        self.site_contexts.insert(origin, id);
        Ok(id)
    }

    fn context_for_site(&mut self, fallback: u32, url: &str) -> Result<u32, ApiError> {
        if !matches!(
            self.config.security_profile,
            ve_api::SecurityProfile::Production
        ) {
            return Ok(fallback);
        }
        self.map_site_context(fallback, url)
    }

    /// Opens a page in a context; the reply carries the new page id.
    pub fn open(&mut self, context_id: u32, url: &str, options_json: &str) -> Receiver<Value> {
        let options = match parse_options(options_json) {
            Ok(o) => o,
            Err(e) => return fail(&e),
        };
        if let Err(e) = self.context(context_id) {
            return fail(&e);
        }
        let context_id = match self.context_for_site(context_id, url) {
            Ok(id) => id,
            Err(e) => return fail(&e),
        };
        self.next_page += 1;
        let page = self.next_page;
        self.pages.insert(page, context_id);
        let url = url.to_owned();
        match self.context(context_id) {
            Ok(host) => host.open(page, &url, &options),
            Err(e) => fail(&e),
        }
    }

    /// Observes a page.
    pub fn observe(&self, page: u64, options_json: &str) -> Receiver<Value> {
        let options = match parse_options(options_json) {
            Ok(o) => o,
            Err(e) => return fail(&e),
        };
        match self.host_of(page) {
            Ok(h) => h.observe(page, &options),
            Err(e) => fail(&e),
        }
    }

    /// Executes contracts steps on a page (`steps_json` is a `Step[]` or a
    /// `Program` object with a `steps` array).
    pub fn execute(&self, page: u64, steps_json: &str, options_json: &str) -> Receiver<Value> {
        let steps: Value = match serde_json::from_str::<Value>(steps_json) {
            Ok(v @ Value::Array(_)) => v,
            Ok(v @ Value::Object(_)) if v.get("steps").is_some_and(Value::is_array) => v,
            Ok(Value::Object(_)) => return fail(&ApiError::invalid("program has no steps array")),
            Ok(_) => return fail(&ApiError::invalid("steps must be an array")),
            Err(e) => return fail(&e.into()),
        };
        let opts: ExecuteOptions = match serde_json::from_str(options_json) {
            Ok(o) => o,
            Err(e) => return fail(&e.into()),
        };
        match self.host_of(page) {
            Ok(h) => h.execute(page, &steps, &opts),
            Err(e) => fail(&e),
        }
    }

    /// Screenshots a page as PNG (`options_json` may carry `fullPage`).
    pub fn screenshot(&self, page: u64, options_json: &str) -> Receiver<Value> {
        let options = match parse_options(options_json) {
            Ok(o) => o,
            Err(e) => return fail(&e),
        };
        match self.host_of(page) {
            Ok(h) => h.screenshot(page, &options),
            Err(e) => fail(&e),
        }
    }

    /// Closes a page.
    pub fn close(&mut self, page: u64) -> Receiver<Value> {
        let Some(ctx) = self.pages.remove(&page) else {
            return immediate(json!({ "ok": true, "closed": false }));
        };
        match self.context(ctx) {
            Ok(h) => h.close(page),
            Err(e) => fail(&e),
        }
    }

    /// Cookies of a context.
    pub fn get_cookies(&self, context_id: u32, url: Option<&str>) -> Receiver<Value> {
        let url = url.map(str::to_owned);
        match self.context(context_id) {
            Ok(h) => h.get_cookies(url.as_deref()),
            Err(e) => fail(&e),
        }
    }

    /// Stores cookies into a context.
    pub fn set_cookies(&self, context_id: u32, cookies_json: &str) -> Receiver<Value> {
        let cookies = cookies_json.to_owned();
        match self.context(context_id) {
            Ok(h) => h.set_cookies(&cookies),
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
    fn config_defaults_to_a_strict_policy_unless_given() {
        let c = parse_config("").unwrap();
        assert!(c.policy.block_loopback && !c.policy.allow_file);
        assert_eq!(c.shaper, ve_api::ShaperKind::System);
        let c = parse_config(r#"{"offline": true, "dataDir": "/tmp/x"}"#).unwrap();
        assert!(c.offline && c.policy.block_loopback);
        let c = parse_config(r#"{"policy": {"blockLoopback": true}}"#).unwrap();
        assert!(c.policy.block_loopback && !c.policy.allow_file);
        let c = parse_config(
            r#"{"policy":{"blockLoopback":true,"allowlist":["127.0.0.1:4810","localhost:4810"]}}"#,
        )
        .unwrap();
        assert_eq!(
            c.policy.allowlist,
            vec!["127.0.0.1:4810".to_owned(), "localhost:4810".to_owned()]
        );
        assert_eq!(parse_config("nope").unwrap_err().code, "invalid_params");
    }

    #[test]
    fn hub_routes_pages_to_contexts_and_isolates_cookies() {
        let mut hub =
            Hub::from_json(r#"{"offline": true, "viewport": {"width": 800, "height": 600}}"#)
                .unwrap();
        let ctx2 = hub.new_context("{}").unwrap();
        assert_eq!(ctx2, 2);
        assert_eq!(
            hub.new_context(r#"{"policy": {"blockLoopback": "yes"}}"#)
                .unwrap_err()
                .code,
            "invalid_params"
        );

        let a = hub
            .open(
                DEFAULT_CONTEXT,
                "data:text/html,<title>A</title><button>Go</button>",
                "{}",
            )
            .recv()
            .unwrap();
        let b = hub
            .open(ctx2, "data:text/html,<title>B</title>", "")
            .recv()
            .unwrap();
        assert_eq!(a["ok"], true, "{a}");
        assert_eq!(b["ok"], true, "{b}");
        assert_eq!(a["context"], 1);
        assert_eq!(b["context"], 2);
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
        let bad = hub.observe(pa, "[1]").recv().unwrap();
        assert_eq!(bad["error"]["code"], "invalid_params");
        let bad = hub.open(42, "about:blank", "{}").recv().unwrap();
        assert_eq!(bad["error"]["code"], "not_found");

        let ran = hub
            .execute(
                pa,
                r#"{"steps":[{"id":"c","op":"click","target":"role=button[name=Go]"}]}"#,
                r#"{"returnObservation": true}"#,
            )
            .recv()
            .unwrap();
        assert_eq!(ran["status"], "completed", "{ran}");
        assert_eq!(ran["observation"]["content"]["title"], "A");
        assert_eq!(
            hub.execute(pa, "{}", "{}").recv().unwrap()["error"]["code"],
            "invalid_params"
        );
        assert_eq!(
            hub.execute(pa, "[]", "nope").recv().unwrap()["error"]["code"],
            "invalid_params"
        );

        let shot = hub.screenshot(pa, "{}").recv().unwrap();
        assert_eq!(shot["ok"], true, "{shot}");
        assert_eq!(shot["width"], 800);
        assert!(shot["pngBase64"].as_str().unwrap().starts_with("iVBOR"));

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

    #[test]
    fn map_site_context_reuses_origin_and_isolates_sites() {
        let mut hub =
            Hub::from_json(r#"{"offline": true, "viewport": {"width": 800, "height": 600}}"#)
                .unwrap();
        let a = hub
            .map_site_context(DEFAULT_CONTEXT, "https://a.test/x")
            .unwrap();
        let a2 = hub
            .map_site_context(DEFAULT_CONTEXT, "https://a.test/y")
            .unwrap();
        let b = hub
            .map_site_context(DEFAULT_CONTEXT, "https://b.test/")
            .unwrap();
        assert_eq!(a, a2);
        assert_ne!(a, b);
        assert_eq!(Hub::site_origin("https://a.test/x"), "https://a.test");
        assert_ne!(
            Hub::site_origin("https://a.test/"),
            Hub::site_origin("https://b.test/")
        );
    }
}
