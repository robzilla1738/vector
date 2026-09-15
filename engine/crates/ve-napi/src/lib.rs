//! Node.js bindings for the Vector Engine (napi-rs).
//!
//! With the `napi` feature this crate builds a Node addon exposing an
//! [`Engine`](bindings::Engine) class with `open`, `observe`, `execute`,
//! `screenshot`, `close`, context and cookie methods that speak JSON,
//! mirroring the C ABI in `ve-api::ffi`.
//! Without the feature the crate is an inert placeholder so that the default
//! workspace build needs no Node headers or C toolchain.
//!
//! The JavaScript wrapper (`@vector/engine`) is expected to parse the JSON
//! strings and expose typed methods; keeping the boundary string-based means
//! one binding surface serves every N-API version.

#![deny(unsafe_op_in_unsafe_fn)]

/// Version of the JSON binding surface (bump on incompatible changes).
pub const ABI_VERSION: u32 = 1;

/// Whether the real N-API module is compiled in.
#[must_use]
pub const fn is_enabled() -> bool {
    cfg!(feature = "napi")
}

/// Engine version reported to JavaScript.
#[must_use]
pub fn version() -> &'static str {
    ve_api::VERSION
}

/// Describes the binding as JSON (`{"abiVersion":1,"engine":"0.0.1","enabled":false}`).
#[must_use]
pub fn describe() -> String {
    serde_json::json!({ "abiVersion": ABI_VERSION, "engine": version(), "enabled": is_enabled() })
        .to_string()
}

#[cfg(feature = "napi")]
pub mod bindings {
    //! The N-API surface.

    use napi_derive::napi;
    use ve_api::VectorEngine;

    /// A Vector Engine instance.
    #[napi]
    pub struct Engine {
        inner: VectorEngine,
    }

    #[napi]
    impl Engine {
        /// Creates an engine with default configuration.
        #[napi(constructor)]
        #[must_use]
        pub fn new() -> Self {
            Self {
                inner: VectorEngine::default(),
            }
        }

        /// Creates an engine from a JSON `EngineConfig`.
        #[napi(factory)]
        pub fn with_config(config_json: String) -> napi::Result<Self> {
            let config = serde_json::from_str(&config_json)
                .map_err(|e| napi::Error::from_reason(e.to_string()))?;
            Ok(Self {
                inner: VectorEngine::new(config),
            })
        }

        /// Opens a page from a JSON `OpenRequest`; returns the `OpenResult`
        /// JSON (`{"ok":true,"page":N,"routing":{…},…}`).
        #[napi]
        pub fn open(&mut self, request_json: String) -> String {
            self.inner.open_json(&request_json)
        }

        /// Observes a page with a JSON `ObservationRequest`; returns an
        /// `Observation` JSON (`{"ok":true,"content":{…},…}`).
        #[napi]
        pub fn observe(&mut self, page: u32, request_json: Option<String>) -> String {
            self.inner
                .observe_json(u64::from(page), request_json.as_deref().unwrap_or("{}"))
        }

        /// Executes a JSON program (`{program, returnObservation?}`); returns
        /// `{"ok":true,"result":{…},"observation"?:{…}}`.
        #[napi]
        pub fn execute(&mut self, page: u32, request_json: String) -> String {
            self.inner.execute_json(u64::from(page), &request_json)
        }

        /// Screenshots a page; returns `{"ok":true,"pngBase64":…,…}`.
        #[napi]
        pub fn screenshot(&mut self, page: u32, options_json: Option<String>) -> String {
            self.inner
                .screenshot_json(u64::from(page), options_json.as_deref().unwrap_or("{}"))
        }

        /// Closes a page.
        #[napi]
        pub fn close(&mut self, page: u32) -> bool {
            self.inner.close(ve_api::PageId(u64::from(page)))
        }

        /// Creates a context from a JSON `NetworkPolicy`; returns `{"ok":true,"context":N}`.
        #[napi]
        pub fn new_context(&mut self, policy_json: Option<String>) -> String {
            self.inner
                .new_context_json(policy_json.as_deref().unwrap_or(""))
        }

        /// Frees a context and closes its pages.
        #[napi]
        pub fn free_context(&mut self, context: u32) -> bool {
            self.inner
                .free_context(ve_api::ContextId(u64::from(context)))
        }

        /// Cookies of a context as `{"ok":true,"cookies":[…]}`.
        #[napi]
        pub fn get_cookies(&self, context: u32) -> String {
            self.inner.cookies_json(u64::from(context))
        }

        /// Imports `BrowserCookie`s; returns `{"ok":true,"imported":N}`.
        #[napi]
        pub fn set_cookies(&mut self, context: u32, cookies_json: String) -> String {
            self.inner
                .set_cookies_json(u64::from(context), &cookies_json)
        }
    }

    impl Default for Engine {
        fn default() -> Self {
            Self::new()
        }
    }

    /// Engine and binding version information.
    #[napi]
    #[must_use]
    pub fn describe() -> String {
        super::describe()
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
        assert_eq!(is_enabled(), cfg!(feature = "napi"));
    }
}
