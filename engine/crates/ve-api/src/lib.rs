//! Public facade for the Vector Engine.
//!
//! [`VectorEngine`] is the one handle embedders hold. It owns pages
//! ([`PageId`] → [`DomPage`]) and a [`NetworkContext`], and exposes three
//! operations that map one-to-one onto the C ABI in [`ffi`] and the Node
//! bindings in `ve-napi`:
//!
//! * [`VectorEngine::open`] — load a page from HTML or a URL.
//! * [`VectorEngine::observe`] — semantic snapshot + readiness.
//! * [`VectorEngine::execute`] — run an agent [`Program`].
//!
//! Every operation also has a `*_json` twin that takes and returns JSON
//! strings (`{"ok":true,…}` / `{"ok":false,"error":…}`), so foreign-language
//! bindings never need to understand Rust types.
//!
//! # Features
//!
//! * `http` — real networking (hyper + rustls) for `http(s)` URLs. Without it
//!   only `data:` and `about:` URLs and inline HTML can be opened.
//! * `quickjs` — the QuickJS-NG JavaScript backend.
//! * `gpu` — vello + wgpu rendering in `ve-gfx`.

#![deny(unsafe_op_in_unsafe_fn)]

pub mod ffi;

use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

use serde::{Deserialize, Serialize};
use ve_core::{Error, Result, Revision, Size};
use ve_net::{ContextId, NetworkContext, Request};

pub use ve_a11y::{SemanticSnapshot, SnapshotFormat};
pub use ve_agent::{DomPage, ExecutionReport, Executor, LoadedDocument, Page, Program, Readiness};
pub use ve_core::VERSION;

/// Identifies an open page.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(transparent)]
pub struct PageId(pub u64);

/// Engine configuration.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct EngineConfig {
    /// Viewport used for new pages.
    pub viewport: Size,
    /// `User-Agent` for network requests.
    pub user_agent: String,
    /// Refuse network schemes even when the `http` feature is compiled in.
    pub offline: bool,
    /// Maximum simultaneously open pages.
    pub max_pages: usize,
}

impl Default for EngineConfig {
    fn default() -> Self {
        Self {
            viewport: Size::new(1280.0, 720.0),
            user_agent: ve_net::DEFAULT_USER_AGENT.to_owned(),
            offline: false,
            max_pages: 64,
        }
    }
}

/// What to open.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", untagged)]
pub enum OpenSource {
    /// Inline HTML with an optional base URL.
    Html {
        /// The markup.
        html: String,
        /// Base URL for relative links.
        #[serde(default, skip_serializing_if = "Option::is_none")]
        url: Option<String>,
    },
    /// Fetch a URL (`data:`, `about:`, and with `http` also `http(s):`).
    Url {
        /// The URL.
        url: String,
    },
}

/// Options for [`VectorEngine::observe`].
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct ObserveOptions {
    /// Snapshot format.
    pub format: SnapshotFormat,
    /// Only report nodes touched since this revision (falls back to a full
    /// snapshot when the journal no longer covers it).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub since: Option<Revision>,
}

/// Result of [`VectorEngine::observe`].
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Observation {
    /// The page.
    pub page: PageId,
    /// Document URL.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    /// Document title.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    /// DOM revision.
    pub revision: Revision,
    /// Readiness.
    pub readiness: Readiness,
    /// Snapshot of the accessibility tree.
    pub snapshot: SemanticSnapshot,
    /// References changed since `options.since` (when requested and available).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub changed: Option<Vec<ve_core::NodeId>>,
}

/// The engine handle.
pub struct VectorEngine {
    config: EngineConfig,
    pages: HashMap<PageId, DomPage>,
    net: Rc<RefCell<NetworkContext>>,
    next_page: u64,
    executor: Executor,
}

impl std::fmt::Debug for VectorEngine {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("VectorEngine")
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

fn make_transport(config: &EngineConfig) -> Box<dyn ve_net::Transport> {
    if config.offline {
        return Box::new(ve_net::NullTransport);
    }
    #[cfg(feature = "http")]
    {
        match ve_net::HyperTransport::new() {
            Ok(t) => return Box::new(t),
            Err(e) => tracing::warn!(error = %e, "hyper transport unavailable; running offline"),
        }
    }
    Box::new(ve_net::NullTransport)
}

impl VectorEngine {
    /// Creates an engine.
    #[must_use]
    pub fn new(config: EngineConfig) -> Self {
        let mut net = NetworkContext::new(ContextId(1), make_transport(&config));
        config.user_agent.clone_into(&mut net.user_agent);
        Self {
            config,
            pages: HashMap::new(),
            net: Rc::new(RefCell::new(net)),
            next_page: 0,
            executor: Executor::new(),
        }
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

    /// The shared network context (cookies, cache).
    #[must_use]
    pub fn network(&self) -> Rc<RefCell<NetworkContext>> {
        self.net.clone()
    }

    fn loader(&self) -> ve_agent::Loader {
        let net = self.net.clone();
        Box::new(move |url: &str| {
            let response = net.borrow_mut().fetch(Request::get(url)?)?;
            if !response.is_success() {
                return Err(Error::Network(format!(
                    "{} returned {}",
                    response.url, response.status
                )));
            }
            Ok(LoadedDocument {
                url: response.url.to_string(),
                html: response.text(),
            })
        })
    }

    /// Opens a page.
    pub fn open(&mut self, source: OpenSource) -> Result<PageId> {
        if self.pages.len() >= self.config.max_pages {
            return Err(Error::InvalidState(format!(
                "page limit of {} reached",
                self.config.max_pages
            )));
        }
        let (html, url) = match source {
            OpenSource::Html { html, url } => (html, url),
            OpenSource::Url { url } => {
                let loaded = (self.loader())(&url)?;
                (loaded.html, Some(loaded.url))
            }
        };
        let mut page =
            DomPage::from_html_with_viewport(&html, url.as_deref(), self.config.viewport)
                .with_loader(self.loader());
        page.settle(10_000);
        self.next_page += 1;
        let id = PageId(self.next_page);
        self.pages.insert(id, page);
        tracing::info!(page = id.0, url = ?url, "opened");
        Ok(id)
    }

    /// Closes a page. Returns `true` if it was open.
    pub fn close(&mut self, page: PageId) -> bool {
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
    pub fn page(&self, page: PageId) -> Result<&DomPage> {
        self.pages
            .get(&page)
            .ok_or_else(|| Error::InvalidState(format!("no such page {}", page.0)))
    }

    /// Mutably borrows a page.
    pub fn page_mut(&mut self, page: PageId) -> Result<&mut DomPage> {
        self.pages
            .get_mut(&page)
            .ok_or_else(|| Error::InvalidState(format!("no such page {}", page.0)))
    }

    /// Observes a page: settles it, then snapshots the accessibility tree.
    pub fn observe(&mut self, page: PageId, options: &ObserveOptions) -> Result<Observation> {
        let p = self.page_mut(page)?;
        let readiness = p.settle(10_000);
        let snapshot = p.snapshot(options.format);
        let changed = options
            .since
            .and_then(|since| ve_a11y::changed_refs_since(p.document(), since));
        Ok(Observation {
            page,
            url: p.url().map(str::to_owned),
            title: p.document().title(),
            revision: p.document().revision(),
            readiness,
            snapshot,
            changed,
        })
    }

    /// Executes a program against a page.
    pub fn execute(&mut self, page: PageId, program: &Program) -> Result<ExecutionReport> {
        let executor = self.executor;
        let p = self.page_mut(page)?;
        Ok(executor.run(p, program))
    }

    // ---- JSON string API (used by the C ABI and Node bindings) -------------

    fn json_result(result: Result<serde_json::Value>) -> String {
        match result {
            Ok(mut value) => {
                if let Some(obj) = value.as_object_mut() {
                    obj.insert("ok".into(), serde_json::Value::Bool(true));
                    value.to_string()
                } else {
                    serde_json::json!({ "ok": true, "result": value }).to_string()
                }
            }
            Err(e) => serde_json::json!({ "ok": false, "error": e.to_string() }).to_string(),
        }
    }

    /// [`Self::open`] with a JSON source (`{"html": "…", "url": "…"}` or `{"url": "…"}`).
    /// Returns `{"ok":true,"page":N}` or an error object.
    pub fn open_json(&mut self, source_json: &str) -> String {
        Self::json_result((|| {
            let source: OpenSource = serde_json::from_str(source_json)?;
            let id = self.open(source)?;
            Ok(serde_json::json!({ "page": id }))
        })())
    }

    /// [`Self::observe`] with JSON options (`{}` allowed).
    pub fn observe_json(&mut self, page: u64, options_json: &str) -> String {
        Self::json_result((|| {
            let options: ObserveOptions = if options_json.trim().is_empty() {
                ObserveOptions::default()
            } else {
                serde_json::from_str(options_json)?
            };
            let observation = self.observe(PageId(page), &options)?;
            Ok(serde_json::to_value(observation)?)
        })())
    }

    /// [`Self::execute`] with a JSON program.
    pub fn execute_json(&mut self, page: u64, program_json: &str) -> String {
        Self::json_result((|| {
            let program = Program::from_json(program_json)?;
            let report = self.execute(PageId(page), &program)?;
            Ok(report.to_json())
        })())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn open_observe_execute_round_trip() {
        let mut engine = VectorEngine::default();
        let page = engine
            .open(OpenSource::Html {
                html: "<title>Hi</title><label for=n>Name</label><input id=n><button>Send</button>"
                    .into(),
                url: Some("https://example.test/".into()),
            })
            .unwrap();
        let obs = engine.observe(page, &ObserveOptions::default()).unwrap();
        assert_eq!(obs.title.as_deref(), Some("Hi"));
        assert!(obs.readiness.is_ready());
        assert!(obs.snapshot.to_text().contains("textbox \"Name\""));

        let program = Program::from_json(
            r##"[{"action":"fill","target":{"by":"label","label":"Name"},"value":"Ada"},
                {"action":"extract","name":"v","what":{"type":"value"},"target":{"by":"selector","selector":"#n"}}]"##,
        )
        .unwrap();
        let report = engine.execute(page, &program).unwrap();
        assert!(report.ok);
        assert_eq!(report.extracted["v"], "Ada");

        let since = obs.revision;
        let obs2 = engine
            .observe(
                page,
                &ObserveOptions {
                    since: Some(since),
                    ..ObserveOptions::default()
                },
            )
            .unwrap();
        assert!(obs2.revision.is_after(since));
        assert!(obs2.changed.as_ref().is_some_and(|c| !c.is_empty()));

        let data = engine
            .open(OpenSource::Url {
                url: "data:text/html,<h1>Data</h1>".into(),
            })
            .unwrap();
        assert_eq!(engine.pages(), vec![page, data]);
        assert!(
            engine
                .observe(data, &ObserveOptions::default())
                .unwrap()
                .snapshot
                .to_text()
                .contains("heading h1 \"Data\"")
        );
        assert!(engine.close(data) && !engine.close(data));
        assert!(matches!(
            engine.observe(data, &ObserveOptions::default()),
            Err(Error::InvalidState(_))
        ));
    }

    #[test]
    fn json_api_wraps_results_and_errors() {
        let mut engine = VectorEngine::new(EngineConfig {
            offline: true,
            ..EngineConfig::default()
        });
        let opened: serde_json::Value =
            serde_json::from_str(&engine.open_json(r#"{"html": "<p>x</p>"}"#)).unwrap();
        assert_eq!(opened["ok"], true);
        let page = opened["page"].as_u64().unwrap();
        let observed: serde_json::Value =
            serde_json::from_str(&engine.observe_json(page, "{\"format\": \"full\"}")).unwrap();
        assert_eq!(observed["snapshot"]["format"], "full");
        let executed: serde_json::Value =
            serde_json::from_str(&engine.execute_json(page, r#"[{"action":"scroll","dy":10}]"#))
                .unwrap();
        assert_eq!(executed["ok"], true);
        assert_eq!(executed["results"][0]["status"], "ok");
        let bad: serde_json::Value = serde_json::from_str(&engine.execute_json(999, "[]")).unwrap();
        assert_eq!(bad["ok"], false);
        assert!(bad["error"].as_str().unwrap().contains("no such page"));
        let offline: serde_json::Value =
            serde_json::from_str(&engine.open_json(r#"{"url": "https://example.test/"}"#)).unwrap();
        assert_eq!(offline["ok"], false);
        assert!(serde_json::from_str::<serde_json::Value>(&engine.open_json("not json")).unwrap()["error"].is_string());
    }
}
