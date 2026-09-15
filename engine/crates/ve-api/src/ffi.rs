//! C ABI.
//!
//! All functions are `extern "C"` and exchange JSON strings, so any language
//! with a C FFI can drive the engine without generated bindings:
//!
//! ```c
//! VeEngine *e = ve_engine_new();
//! char *r = ve_engine_open(e, "{\"html\":\"<p>hi</p>\"}");   // {"ok":true,"page":1}
//! char *s = ve_engine_observe(e, 1, "{}");                    // {"ok":true,"snapshot":…}
//! char *x = ve_engine_execute(e, 1, "[{\"action\":\"scroll\",\"dy\":100}]");
//! ve_string_free(r); ve_string_free(s); ve_string_free(x);
//! ve_engine_free(e);
//! ```
//!
//! Strings returned by the engine must be released with [`ve_string_free`].
//! Passing a null engine or string never crashes: an error object is
//! returned instead.

use std::ffi::{CStr, CString, c_char};

use crate::VectorEngine;

/// Opaque engine handle for C callers.
pub struct VeEngine {
    inner: VectorEngine,
}

fn into_c_string(s: String) -> *mut c_char {
    // JSON produced by serde never contains NUL; fall back defensively.
    CString::new(s)
        .unwrap_or_else(|_| {
            CString::new("{\"ok\":false,\"error\":\"internal NUL in output\"}").expect("static")
        })
        .into_raw()
}

fn error_string(message: &str) -> *mut c_char {
    into_c_string(serde_json::json!({ "ok": false, "error": message }).to_string())
}

/// # Safety
/// `s` must be null or a valid NUL-terminated string.
unsafe fn read_str<'a>(s: *const c_char) -> Result<&'a str, &'static str> {
    if s.is_null() {
        return Err("null string argument");
    }
    // SAFETY: caller guarantees `s` is a valid NUL-terminated string.
    unsafe { CStr::from_ptr(s) }
        .to_str()
        .map_err(|_| "argument is not valid UTF-8")
}

/// Creates an engine with default configuration. Never null.
#[unsafe(no_mangle)]
pub extern "C" fn ve_engine_new() -> *mut VeEngine {
    Box::into_raw(Box::new(VeEngine {
        inner: VectorEngine::default(),
    }))
}

/// Creates an engine from a JSON [`crate::EngineConfig`]. Returns null if the
/// configuration is invalid.
///
/// # Safety
/// `config_json` must be null or a valid NUL-terminated string.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ve_engine_new_with_config(config_json: *const c_char) -> *mut VeEngine {
    // SAFETY: forwarded caller guarantee.
    let Ok(json) = (unsafe { read_str(config_json) }) else {
        return std::ptr::null_mut();
    };
    match serde_json::from_str(json) {
        Ok(config) => Box::into_raw(Box::new(VeEngine {
            inner: VectorEngine::new(config),
        })),
        Err(_) => std::ptr::null_mut(),
    }
}

/// Destroys an engine created by [`ve_engine_new`]. Null is ignored.
///
/// # Safety
/// `engine` must be null or a pointer returned by `ve_engine_new*` that has
/// not been freed.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ve_engine_free(engine: *mut VeEngine) {
    if !engine.is_null() {
        // SAFETY: caller guarantees the pointer came from Box::into_raw and is unused afterwards.
        drop(unsafe { Box::from_raw(engine) });
    }
}

/// Opens a page from a JSON source (`{"html":…,"url":…}` or `{"url":…}`).
/// Returns `{"ok":true,"page":N}`.
///
/// # Safety
/// `engine` must be a live engine; `source_json` null or a valid C string.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ve_engine_open(
    engine: *mut VeEngine,
    source_json: *const c_char,
) -> *mut c_char {
    if engine.is_null() {
        return error_string("null engine");
    }
    // SAFETY: forwarded caller guarantees.
    let source = match unsafe { read_str(source_json) } {
        Ok(s) => s,
        Err(e) => return error_string(e),
    };
    // SAFETY: `engine` is live and not aliased during this call.
    let engine = unsafe { &mut *engine };
    into_c_string(engine.inner.open_json(source))
}

/// Observes a page. `options_json` may be null or `{}`.
///
/// # Safety
/// `engine` must be a live engine; `options_json` null or a valid C string.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ve_engine_observe(
    engine: *mut VeEngine,
    page: u64,
    options_json: *const c_char,
) -> *mut c_char {
    if engine.is_null() {
        return error_string("null engine");
    }
    // SAFETY: forwarded caller guarantees; null means default options.
    let options = if options_json.is_null() {
        "{}"
    } else {
        match unsafe { read_str(options_json) } {
            Ok(s) => s,
            Err(e) => return error_string(e),
        }
    };
    // SAFETY: `engine` is live and not aliased during this call.
    let engine = unsafe { &mut *engine };
    into_c_string(engine.inner.observe_json(page, options))
}

/// Executes a JSON program against a page.
///
/// # Safety
/// `engine` must be a live engine; `program_json` a valid C string.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ve_engine_execute(
    engine: *mut VeEngine,
    page: u64,
    program_json: *const c_char,
) -> *mut c_char {
    if engine.is_null() {
        return error_string("null engine");
    }
    // SAFETY: forwarded caller guarantees.
    let program = match unsafe { read_str(program_json) } {
        Ok(s) => s,
        Err(e) => return error_string(e),
    };
    // SAFETY: `engine` is live and not aliased during this call.
    let engine = unsafe { &mut *engine };
    into_c_string(engine.inner.execute_json(page, program))
}

/// Closes a page. Returns `true` if it was open.
///
/// # Safety
/// `engine` must be null or a live engine.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ve_engine_close(engine: *mut VeEngine, page: u64) -> bool {
    if engine.is_null() {
        return false;
    }
    // SAFETY: `engine` is live and not aliased during this call.
    unsafe { &mut *engine }.inner.close(crate::PageId(page))
}

/// Frees a string returned by this API. Null is ignored.
///
/// # Safety
/// `s` must be null or a string returned by this API that has not been freed.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ve_string_free(s: *mut c_char) {
    if !s.is_null() {
        // SAFETY: caller guarantees `s` came from CString::into_raw.
        drop(unsafe { CString::from_raw(s) });
    }
}

/// Engine version as a static NUL-terminated string (do not free).
#[unsafe(no_mangle)]
pub extern "C" fn ve_version() -> *const c_char {
    static VERSION_C: &str = concat!(env!("CARGO_PKG_VERSION"), "\0");
    VERSION_C.as_ptr().cast()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn take(ptr: *mut c_char) -> serde_json::Value {
        assert!(!ptr.is_null());
        // SAFETY: `ptr` was returned by this API in the test.
        let text = unsafe { CStr::from_ptr(ptr) }.to_str().unwrap().to_owned();
        unsafe { ve_string_free(ptr) };
        serde_json::from_str(&text).unwrap()
    }

    #[test]
    fn c_abi_round_trip() {
        let engine = ve_engine_new();
        let source = CString::new(r#"{"html": "<title>C</title><button>Go</button>"}"#).unwrap();
        let opened = take(unsafe { ve_engine_open(engine, source.as_ptr()) });
        assert_eq!(opened["ok"], true);
        let page = opened["page"].as_u64().unwrap();

        let observed = take(unsafe { ve_engine_observe(engine, page, std::ptr::null()) });
        assert_eq!(observed["title"], "C");
        assert!(
            observed["snapshot"]["nodes"]
                .as_array()
                .unwrap()
                .iter()
                .any(|n| n["role"] == "button")
        );

        let program = CString::new(
            r#"[{"action":"click","target":{"by":"role","role":"button","name":"Go"}}]"#,
        )
        .unwrap();
        let executed = take(unsafe { ve_engine_execute(engine, page, program.as_ptr()) });
        assert_eq!(executed["ok"], true);

        let bad = take(unsafe { ve_engine_execute(engine, page, std::ptr::null()) });
        assert_eq!(bad["ok"], false);
        assert_eq!(
            take(unsafe { ve_engine_open(std::ptr::null_mut(), source.as_ptr()) })["error"],
            "null engine"
        );
        assert!(unsafe { ve_engine_close(engine, page) });
        assert!(!unsafe { ve_engine_close(engine, page) });

        // SAFETY: static string.
        let version = unsafe { CStr::from_ptr(ve_version()) }.to_str().unwrap();
        assert_eq!(version, env!("CARGO_PKG_VERSION"));
        unsafe { ve_engine_free(engine) };
        unsafe { ve_engine_free(std::ptr::null_mut()) };
        unsafe { ve_string_free(std::ptr::null_mut()) };
    }
}
