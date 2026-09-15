//! Node.js bindings for the Vector Engine (napi-rs).
//!
//! With the `napi` feature this crate builds the `@vector/engine-native`
//! addon: an [`bindings::Engine`] class whose methods (`open`, `observe`,
//! `execute`, `screenshot`, `close`, `newContext`, `getCookies`,
//! `setCookies`) return Promises resolved off the Node event loop — every
//! browsing context runs on its own engine thread ([`host::Host`]) and the
//! N-API layer only ferries JSON strings.
//!
//! Without the feature the crate is an inert library: the engine host, the
//! step translation and the observation shaping still compile and are unit
//! tested, so the default workspace build needs no Node headers.
//!
//! Wire shapes are the runtime's contracts (`Step`, `ProgramResult`,
//! `ObservationContent`), see `docs/engine/architecture.md` §11.

#![deny(unsafe_op_in_unsafe_fn)]

pub mod classify;
pub mod errors;
pub mod host;
pub mod hub;
pub mod observe;

/// Version of the JSON binding surface (bump on incompatible changes).
pub const ABI_VERSION: u32 = 2;

/// Whether the real N-API module is compiled in.
#[must_use]
pub const fn is_enabled() -> bool {
    cfg!(feature = "napi")
}

/// Whether `http(s):` URLs can be opened.
#[must_use]
pub const fn has_http() -> bool {
    cfg!(feature = "http")
}

/// Engine version reported to JavaScript.
#[must_use]
pub fn version() -> &'static str {
    ve_api::VERSION
}

/// Describes the binding as JSON
/// (`{"abiVersion":2,"engine":"0.0.1","enabled":false,"http":false,"capabilities":{…}}`).
#[must_use]
pub fn describe() -> String {
    serde_json::json!({
        "abiVersion": ABI_VERSION,
        "engine": version(),
        "enabled": is_enabled(),
        "http": has_http(),
        "capabilities": {
            "screenshot": false,
            "evaluate": false,
            "history": false,
            "isolatedContexts": true,
            "cookies": true,
            "fileUrls": true,
        },
    })
    .to_string()
}

#[cfg(feature = "napi")]
pub mod bindings {
    //! The N-API surface. Every method returns a JSON string:
    //! `{"ok":true,…}` or `{"ok":false,"error":{code,message,detail?}}`.

    use std::sync::mpsc::Receiver;
    use std::sync::{Arc, Mutex};

    use napi::bindgen_prelude::*;
    use napi::{Env, Task};
    use napi_derive::napi;
    use serde_json::Value;

    use crate::hub::Hub;

    /// A pending engine reply, resolved on the libuv thread pool so the
    /// engine thread's work never blocks the event loop.
    pub struct Pending {
        rx: Option<Receiver<Value>>,
    }

    impl Pending {
        fn new(rx: Receiver<Value>) -> AsyncTask<Self> {
            AsyncTask::new(Self { rx: Some(rx) })
        }
    }

    impl Task for Pending {
        type Output = String;
        type JsValue = String;

        fn compute(&mut self) -> Result<String> {
            let rx = self
                .rx
                .take()
                .ok_or_else(|| Error::from_reason("engine call already consumed"))?;
            rx.recv()
                .map(|v| v.to_string())
                .map_err(|_| Error::from_reason("engine thread stopped before replying"))
        }

        fn resolve(&mut self, _env: Env, output: String) -> Result<String> {
            Ok(output)
        }
    }

    /// A Vector Engine instance: a set of browsing contexts, each on its
    /// own thread.
    #[napi]
    pub struct Engine {
        hub: Arc<Mutex<Hub>>,
    }

    fn lock(hub: &Arc<Mutex<Hub>>) -> std::sync::MutexGuard<'_, Hub> {
        hub.lock()
            .unwrap_or_else(std::sync::PoisonError::into_inner)
    }

    #[napi]
    impl Engine {
        /// Creates an engine. `config_json` is an `EngineConfig`
        /// (`viewport`, `userAgent`, `offline`, `maxPages`); unknown keys
        /// (e.g. `dataDir`) are ignored.
        #[napi(constructor)]
        pub fn new(config_json: Option<String>) -> Result<Self> {
            let hub = Hub::from_json(config_json.as_deref().unwrap_or("{}"))
                .map_err(|e| Error::from_reason(e.to_string()))?;
            Ok(Self {
                hub: Arc::new(Mutex::new(hub)),
            })
        }

        /// Creates an isolated browsing context (own cookie jar, own engine
        /// thread) and returns its id. Context `1` always exists.
        #[napi]
        pub fn new_context(&self, options_json: Option<String>) -> Result<u32> {
            lock(&self.hub)
                .new_context(options_json.as_deref().unwrap_or("{}"))
                .map_err(|e| Error::from_reason(e.to_string()))
        }

        /// Opens `url` in `context_id`. Resolves to
        /// `{ok, page, url, title, generation, revision, settled, routing}`.
        #[napi]
        pub fn open(
            &self,
            context_id: u32,
            url: String,
            options_json: Option<String>,
        ) -> AsyncTask<Pending> {
            Pending::new(lock(&self.hub).open(
                context_id,
                &url,
                options_json.as_deref().unwrap_or("{}"),
            ))
        }

        /// Observes a page. `options_json` mirrors `ObservationRequest`
        /// (`scope`, `subtreeRef`, `maxElements`, `maxTextChars`,
        /// `sinceRevision`). Resolves to `{ok, content, revision, generation, settled, changed?}`.
        #[napi]
        pub fn observe(&self, page: u32, options_json: Option<String>) -> AsyncTask<Pending> {
            Pending::new(
                lock(&self.hub).observe(u64::from(page), options_json.as_deref().unwrap_or("{}")),
            )
        }

        /// Runs contracts steps (`steps_json` is a `Step[]`). `options_json`
        /// may carry `returnObservation` (act-and-observe in one call) and
        /// `stopOnError`. Resolves to a `ProgramResult` plus
        /// `url`, `title`, `generation`, `navigated`, `revision`, `observation?`.
        #[napi]
        pub fn execute(
            &self,
            page: u32,
            steps_json: String,
            options_json: Option<String>,
        ) -> AsyncTask<Pending> {
            Pending::new(lock(&self.hub).execute(
                u64::from(page),
                &steps_json,
                options_json.as_deref().unwrap_or("{}"),
            ))
        }

        /// Rasterises a page. Not available in M1 (`capability_unsupported`).
        #[napi]
        pub fn screenshot(&self, page: u32, options_json: Option<String>) -> AsyncTask<Pending> {
            Pending::new(
                lock(&self.hub)
                    .screenshot(u64::from(page), options_json.as_deref().unwrap_or("{}")),
            )
        }

        /// Closes a page. Resolves to `{ok, closed}`.
        #[napi]
        pub fn close(&self, page: u32) -> AsyncTask<Pending> {
            Pending::new(lock(&self.hub).close(u64::from(page)))
        }

        /// Cookies of a context (`BrowserCookie[]`), optionally those that
        /// would be sent to `url`. Resolves to `{ok, cookies}`.
        #[napi]
        pub fn get_cookies(&self, context_id: u32, url: Option<String>) -> AsyncTask<Pending> {
            Pending::new(lock(&self.hub).get_cookies(context_id, url.as_deref()))
        }

        /// Stores `BrowserCookie[]` into a context. Resolves to `{ok, count}`.
        #[napi]
        pub fn set_cookies(&self, context_id: u32, cookies_json: String) -> AsyncTask<Pending> {
            Pending::new(lock(&self.hub).set_cookies(context_id, &cookies_json))
        }

        /// Ids of pages this engine currently tracks.
        #[napi]
        pub fn pages(&self) -> Vec<u32> {
            lock(&self.hub)
                .pages()
                .into_iter()
                .map(|p| u32::try_from(p).unwrap_or(u32::MAX))
                .collect()
        }

        /// Stops every engine thread. Later calls fail with `backend_unavailable`.
        #[napi]
        pub fn shutdown(&self) {
            lock(&self.hub).shutdown();
        }
    }

    /// Engine and binding version information (JSON).
    #[napi]
    #[must_use]
    pub fn describe() -> String {
        super::describe()
    }

    /// Engine version string.
    #[napi]
    #[must_use]
    pub fn version() -> String {
        super::version().to_owned()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn placeholder_reports_binding_state() {
        let info: serde_json::Value = serde_json::from_str(&describe()).unwrap();
        assert_eq!(info["abiVersion"], ABI_VERSION);
        assert_eq!(info["engine"], ve_api::VERSION);
        assert_eq!(info["enabled"], cfg!(feature = "napi"));
        assert_eq!(info["http"], cfg!(feature = "http"));
        assert_eq!(is_enabled(), cfg!(feature = "napi"));
    }
}
