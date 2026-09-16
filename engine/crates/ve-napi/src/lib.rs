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
//! The host is a JSON ferry over `ve_api::VectorEngine`'s `*_json` facade
//! (`open_json`, `observe_json`, `execute_json`, `screenshot_json`,
//! `cookies_json`, `set_cookies_json`); step semantics, observation shaping
//! and routing classification live in the engine. Wire shapes are the
//! runtime's contracts (`Step`, `ProgramResult`, `ObservationContent`), see
//! `docs/engine/architecture.md` §11.

#![deny(unsafe_op_in_unsafe_fn)]

pub mod errors;
pub mod host;
pub mod hub;
pub mod isolate;

/// Version of the JSON/Buffer binding surface (bump on incompatible changes).
pub const ABI_VERSION: u32 = 4;

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
/// (`{"abiVersion":4,"engine":"0.0.1","enabled":false,"http":false,"capabilities":{…}}`).
#[must_use]
pub fn describe() -> String {
    serde_json::json!({
        "abiVersion": ABI_VERSION,
        "engine": version(),
        "enabled": is_enabled(),
        "http": has_http(),
        "capabilities": {
            "screenshot": true,
            "evaluate": cfg!(feature = "v8"),
            "history": true,
            "isolatedContexts": true,
            "cookies": true,
            "fileUrls": true,
            "postForms": true,
            "xpath": false,
            "dialogs": true,
            "downloads": true,
            "typedFerry": true,
            "http3": true,
            "websocket": true,
            "serviceWorkers": true,
            "isolatedProcesses": true,
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

    /// JSON envelope as a UTF-8 Buffer (plan A17 typed ferry).
    pub struct PendingBuf {
        rx: Option<Receiver<Value>>,
    }

    impl PendingBuf {
        fn new(rx: Receiver<Value>) -> AsyncTask<Self> {
            AsyncTask::new(Self { rx: Some(rx) })
        }
    }

    impl Task for PendingBuf {
        type Output = Vec<u8>;
        type JsValue = Buffer;

        fn compute(&mut self) -> Result<Vec<u8>> {
            let rx = self
                .rx
                .take()
                .ok_or_else(|| Error::from_reason("engine call already consumed"))?;
            rx.recv()
                .map(|v| v.to_string().into_bytes())
                .map_err(|_| Error::from_reason("engine thread stopped before replying"))
        }

        fn resolve(&mut self, _env: Env, output: Vec<u8>) -> Result<Buffer> {
            Ok(output.into())
        }
    }

    /// Software-renderer PNG as a typed object with a Buffer body.
    #[napi(object)]
    pub struct ScreenshotPng {
        /// CSS pixels of the painted viewport.
        pub width: u32,
        /// CSS pixels of the painted viewport.
        pub height: u32,
        /// Device pixel ratio used for the paint.
        pub scale: f64,
        /// `true` when the paint covered the full document, not just the viewport.
        pub full_page: bool,
        /// PNG bytes.
        pub png: Buffer,
    }

    /// Screenshot reply, resolved on the libuv thread pool.
    pub struct PendingPng {
        rx: Option<Receiver<Value>>,
    }

    impl PendingPng {
        fn new(rx: Receiver<Value>) -> AsyncTask<Self> {
            AsyncTask::new(Self { rx: Some(rx) })
        }
    }

    impl Task for PendingPng {
        type Output = (u32, u32, f64, bool, Vec<u8>);
        type JsValue = ScreenshotPng;

        fn compute(&mut self) -> Result<(u32, u32, f64, bool, Vec<u8>)> {
            let rx = self
                .rx
                .take()
                .ok_or_else(|| Error::from_reason("engine call already consumed"))?;
            let v = rx
                .recv()
                .map_err(|_| Error::from_reason("engine thread stopped before replying"))?;
            if v.get("ok").and_then(Value::as_bool) == Some(false) {
                let msg = v
                    .get("error")
                    .and_then(|e| e.get("message"))
                    .and_then(Value::as_str)
                    .unwrap_or("screenshot failed");
                return Err(Error::from_reason(msg));
            }
            let b64 = v
                .get("pngBase64")
                .and_then(Value::as_str)
                .ok_or_else(|| Error::from_reason("screenshot returned no image"))?;
            let png = ve_net::base64_decode(b64.as_bytes())
                .ok_or_else(|| Error::from_reason("screenshot pngBase64 was not valid base64"))?;
            Ok((
                v.get("width").and_then(Value::as_u64).unwrap_or(0) as u32,
                v.get("height").and_then(Value::as_u64).unwrap_or(0) as u32,
                v.get("scale").and_then(Value::as_f64).unwrap_or(1.0),
                v.get("fullPage").and_then(Value::as_bool).unwrap_or(false),
                png,
            ))
        }

        fn resolve(
            &mut self,
            _env: Env,
            output: (u32, u32, f64, bool, Vec<u8>),
        ) -> Result<ScreenshotPng> {
            Ok(ScreenshotPng {
                width: output.0,
                height: output.1,
                scale: output.2,
                full_page: output.3,
                png: output.4.into(),
            })
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
        /// (`viewport`, `scale`, `userAgent`, `offline`, `maxPages`,
        /// `policy`); unknown keys (e.g. `dataDir`) are ignored. Without a
        /// `policy` the engine runs permissively (loopback and `file:` allowed).
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
        /// `options_json` may carry a `policy` (`NetworkPolicy`).
        #[napi]
        pub fn new_context(&self, options_json: Option<String>) -> Result<u32> {
            lock(&self.hub)
                .new_context(options_json.as_deref().unwrap_or("{}"))
                .map_err(|e| Error::from_reason(e.to_string()))
        }

        /// Opens `url` in `context_id`. Resolves to `{ok, page, context, url,
        /// title, status, generation, revision, settled, blockers, routing,
        /// responses}`. `options_json` may carry `viewport` and `html`.
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
        /// `sinceRevision`, `format`). Resolves to
        /// `{ok, content, revision, generation, settled, blockers, changed}`.
        #[napi]
        pub fn observe(&self, page: u32, options_json: Option<String>) -> AsyncTask<Pending> {
            Pending::new(
                lock(&self.hub).observe(u64::from(page), options_json.as_deref().unwrap_or("{}")),
            )
        }

        /// Runs contracts steps (`steps_json` is a `Step[]` or a `Program`).
        /// `options_json` may carry `returnObservation` (act-and-observe in
        /// one call). Resolves to a flattened `ProgramResult` plus `url`,
        /// `title`, `titleChanged`, `generation`, `navigated`, `revision`,
        /// `responses` and `observation?`.
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

        /// Rasterises a page through the software renderer. Resolves to
        /// `{ok, width, height, scale, fullPage, format:"png", bytes, pngBase64}`;
        /// `options_json` may carry `fullPage`.
        #[napi]
        pub fn screenshot(&self, page: u32, options_json: Option<String>) -> AsyncTask<Pending> {
            Pending::new(
                lock(&self.hub)
                    .screenshot(u64::from(page), options_json.as_deref().unwrap_or("{}")),
            )
        }

        /// Observes a page; request and reply are UTF-8 JSON Buffers (plan A17).
        #[napi]
        pub fn observe_buf(&self, page: u32, options: Option<Buffer>) -> AsyncTask<PendingBuf> {
            let options_json = options
                .as_ref()
                .map_or_else(|| "{}".into(), |b| String::from_utf8_lossy(b).into_owned());
            PendingBuf::new(lock(&self.hub).observe(u64::from(page), &options_json))
        }

        /// Runs contracts steps from a UTF-8 JSON Buffer; reply is a Buffer.
        #[napi]
        pub fn execute_buf(
            &self,
            page: u32,
            steps: Buffer,
            options: Option<Buffer>,
        ) -> AsyncTask<PendingBuf> {
            let steps_json = String::from_utf8_lossy(&steps).into_owned();
            let options_json = options
                .as_ref()
                .map_or_else(|| "{}".into(), |b| String::from_utf8_lossy(b).into_owned());
            PendingBuf::new(lock(&self.hub).execute(u64::from(page), &steps_json, &options_json))
        }

        /// Rasterises a page; PNG bytes travel as a Buffer (no base64).
        #[napi]
        pub fn screenshot_png(&self, page: u32, full_page: Option<bool>) -> AsyncTask<PendingPng> {
            let options = if full_page.unwrap_or(false) {
                "{\"fullPage\":true}"
            } else {
                "{}"
            };
            PendingPng::new(lock(&self.hub).screenshot(u64::from(page), options))
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

        /// Stores `BrowserCookie[]` into a context. Resolves to `{ok, count, imported}`.
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
