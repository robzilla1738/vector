//! Node.js bindings for the Vector Engine (napi-rs).
//!
//! With the `napi` feature this crate builds a Node addon exposing an
//! [`Engine`](bindings::Engine) class with `open`, `observe`, `execute` and
//! `close` methods that speak JSON, mirroring the C ABI in `ve-api::ffi`.
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

        /// Opens a page; returns `{"ok":true,"page":N}` JSON.
        #[napi]
        pub fn open(&mut self, source_json: String) -> String {
            self.inner.open_json(&source_json)
        }

        /// Observes a page; returns an `Observation` JSON.
        #[napi]
        pub fn observe(&mut self, page: u32, options_json: Option<String>) -> String {
            self.inner
                .observe_json(u64::from(page), options_json.as_deref().unwrap_or("{}"))
        }

        /// Executes a JSON program; returns an `ExecutionReport` JSON.
        #[napi]
        pub fn execute(&mut self, page: u32, program_json: String) -> String {
            self.inner.execute_json(u64::from(page), &program_json)
        }

        /// Closes a page.
        #[napi]
        pub fn close(&mut self, page: u32) -> bool {
            self.inner.close(ve_api::PageId(u64::from(page)))
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
