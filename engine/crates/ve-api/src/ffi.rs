//! C ABI.
//!
//! All functions are `extern "C"` and exchange JSON strings, so any language
//! with a C FFI can drive the engine without generated bindings:
//!
//! ```c
//! VeEngine *e = ve_engine_new();
//! char *r = ve_engine_open(e, "{\"url\":\"file:///tmp/page.html\"}");
//! //   {"ok":true,"page":1,"context":1,"url":…,"title":…,"documentEpoch":0,"revision":…,"routing":{…}}
//! char *s = ve_page_observe(e, 1, "{}");                     // {"ok":true,"page":1,"content":{…},…}
//! char *x = ve_page_execute(e, 1, "[{\"id\":\"a\",\"op\":\"scroll\",\"direction\":\"down\"}]");
//! char *p = ve_page_screenshot(e, 1, "{\"fullPage\":false}"); // {"ok":true,"pngBase64":…}
//! ve_page_close(e, 1);
//! ve_string_free(r); ve_string_free(s); ve_string_free(x); ve_string_free(p);
//! ve_engine_free(e);
//! ```
//!
//! Strings returned by the engine must be released with [`ve_string_free`].
//! Passing a null engine or string never crashes: an error object is
//! returned instead. Panics inside the engine are caught at this boundary
//! and reported as `{"ok":false,"error":{"code":"internal",…}}` (architecture
//! §13: a page crash must not take the runtime down).

use std::ffi::{CStr, CString, c_char};
use std::panic::{AssertUnwindSafe, catch_unwind};

use ve_core::{Error, ErrorCode};

use crate::{ContextId, PageId, VectorEngine};

/// Opaque engine handle for C callers.
pub struct VeEngine {
    inner: VectorEngine,
}

fn into_c_string(s: String) -> *mut c_char {
    // JSON produced by serde never contains NUL; fall back defensively.
    CString::new(s)
        .unwrap_or_else(|_| {
            CString::new(VectorEngine::json_error(&Error::internal(
                "internal NUL in output",
            )))
            .expect("static")
        })
        .into_raw()
}

fn error_string(code: ErrorCode, message: &str) -> *mut c_char {
    into_c_string(VectorEngine::json_error(&Error::coded(code, message)))
}

fn panic_message(payload: &(dyn std::any::Any + Send)) -> String {
    payload
        .downcast_ref::<String>()
        .cloned()
        .or_else(|| payload.downcast_ref::<&str>().map(|s| (*s).to_owned()))
        .unwrap_or_else(|| "unknown panic".to_owned())
}

/// Runs `f`, converting a panic into an `internal` error object.
fn guarded(f: impl FnOnce() -> String) -> String {
    match catch_unwind(AssertUnwindSafe(f)) {
        Ok(json) => json,
        Err(payload) => {
            let message = panic_message(payload.as_ref());
            tracing::error!(message, "engine panic caught at the C ABI boundary");
            VectorEngine::json_error(&Error::internal(format!("engine panic: {message}")))
        }
    }
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

/// Reads an optional JSON argument: null → `""` (defaults).
///
/// # Safety
/// `s` must be null or a valid NUL-terminated string.
unsafe fn read_json<'a>(s: *const c_char) -> Result<&'a str, &'static str> {
    if s.is_null() {
        Ok("")
    } else {
        // SAFETY: forwarded caller guarantee.
        unsafe { read_str(s) }
    }
}

/// Dispatches a JSON call on the engine with null checks and panic catching.
///
/// # Safety
/// `engine` must be null or a live engine; `json` null or a valid C string.
unsafe fn call(
    engine: *mut VeEngine,
    json: *const c_char,
    f: impl FnOnce(&mut VectorEngine, &str) -> String,
) -> *mut c_char {
    if engine.is_null() {
        return error_string(ErrorCode::InvalidParams, "null engine");
    }
    // SAFETY: forwarded caller guarantee.
    let json = match unsafe { read_json(json) } {
        Ok(s) => s,
        Err(e) => return error_string(ErrorCode::InvalidParams, e),
    };
    // SAFETY: `engine` is live and not aliased during this call.
    let engine = unsafe { &mut *engine };
    into_c_string(guarded(|| f(&mut engine.inner, json)))
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
    let Ok(json) = (unsafe { read_json(config_json) }) else {
        return std::ptr::null_mut();
    };
    let config = if json.trim().is_empty() {
        Ok(crate::EngineConfig::default())
    } else {
        serde_json::from_str(json)
    };
    match config {
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

/// Opens a page from a JSON [`crate::OpenRequest`]
/// (`{"url":…}` or `{"html":…,"url":…}`, optional `"context"`, `"viewport"`).
/// Returns `{"ok":true,"page":N,"context":C,"url","title","status",
/// "documentEpoch","revision","routing":{"requiresScript","routeReason",…},
/// "settled":{…},"openMs"}`.
///
/// # Safety
/// `engine` must be null or a live engine; `request_json` null or a valid C string.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ve_engine_open(
    engine: *mut VeEngine,
    request_json: *const c_char,
) -> *mut c_char {
    // SAFETY: forwarded caller guarantees.
    unsafe { call(engine, request_json, |e, json| e.open_json(json)) }
}

/// Observes a page with a JSON `ObservationRequest` (null / `{}` for defaults:
/// Compact, scope `full`, 120 elements, 6000 chars). Returns
/// `{"ok":true,"page":N,"content":ObservationContent,"revision","documentEpoch",
/// "changesSince"?:[…],"delta"?:{…},"settled":{…}}`.
///
/// # Safety
/// `engine` must be null or a live engine; `request_json` null or a valid C string.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ve_page_observe(
    engine: *mut VeEngine,
    page: u64,
    request_json: *const c_char,
) -> *mut c_char {
    // SAFETY: forwarded caller guarantees.
    unsafe { call(engine, request_json, |e, json| e.observe_json(page, json)) }
}

/// Executes a JSON program (`{program, returnObservation?}`, a `ProgramSchema`
/// object, or a bare step array). Returns
/// `{"ok":true,"result":ProgramResult,"observation"?:{…}}`.
///
/// # Safety
/// `engine` must be null or a live engine; `request_json` a valid C string.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ve_page_execute(
    engine: *mut VeEngine,
    page: u64,
    request_json: *const c_char,
) -> *mut c_char {
    if request_json.is_null() {
        return error_string(ErrorCode::InvalidParams, "null program");
    }
    // SAFETY: forwarded caller guarantees.
    unsafe { call(engine, request_json, |e, json| e.execute_json(page, json)) }
}

/// Screenshots a page as PNG. `options_json` may be null or
/// `{"fullPage":bool}`. Returns `{"ok":true,"width","height","scale",
/// "fullPage","format":"png","bytes","pngBase64"}`.
///
/// # Safety
/// `engine` must be null or a live engine; `options_json` null or a valid C string.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ve_page_screenshot(
    engine: *mut VeEngine,
    page: u64,
    options_json: *const c_char,
) -> *mut c_char {
    // SAFETY: forwarded caller guarantees.
    unsafe { call(engine, options_json, |e, json| e.screenshot_json(page, json)) }
}

/// Closes a page. Returns `true` if it was open.
///
/// # Safety
/// `engine` must be null or a live engine.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ve_page_close(engine: *mut VeEngine, page: u64) -> bool {
    if engine.is_null() {
        return false;
    }
    // SAFETY: `engine` is live and not aliased during this call.
    let engine = unsafe { &mut *engine };
    catch_unwind(AssertUnwindSafe(|| engine.inner.close(PageId(page)))).unwrap_or(false)
}

/// Creates a context from a JSON `NetworkPolicy` (null for the engine
/// default). Returns the context id, or 0 on failure.
///
/// # Safety
/// `engine` must be null or a live engine; `policy_json` null or a valid C string.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ve_context_new(
    engine: *mut VeEngine,
    policy_json: *const c_char,
) -> u64 {
    if engine.is_null() {
        return 0;
    }
    // SAFETY: forwarded caller guarantee.
    let Ok(json) = (unsafe { read_json(policy_json) }) else {
        return 0;
    };
    // SAFETY: `engine` is live and not aliased during this call.
    let engine = unsafe { &mut *engine };
    let result = guarded(|| engine.inner.new_context_json(json));
    serde_json::from_str::<serde_json::Value>(&result)
        .ok()
        .and_then(|v| v["context"].as_u64())
        .unwrap_or(0)
}

/// Frees a context and closes its pages. Returns `true` if it existed.
///
/// # Safety
/// `engine` must be null or a live engine.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ve_context_free(engine: *mut VeEngine, context: u64) -> bool {
    if engine.is_null() {
        return false;
    }
    // SAFETY: `engine` is live and not aliased during this call.
    let engine = unsafe { &mut *engine };
    catch_unwind(AssertUnwindSafe(|| {
        engine.inner.free_context(ContextId(context))
    }))
    .unwrap_or(false)
}

/// All cookies of a context: `{"ok":true,"cookies":[BrowserCookie…]}`.
///
/// # Safety
/// `engine` must be null or a live engine.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ve_engine_get_cookies(engine: *mut VeEngine, context: u64) -> *mut c_char {
    // SAFETY: forwarded caller guarantees; no JSON argument.
    unsafe { call(engine, std::ptr::null(), |e, _| e.cookies_json(context)) }
}

/// Imports cookies (a JSON array of `BrowserCookie`, or `{"cookies":[…]}`).
/// Returns `{"ok":true,"imported":N}`.
///
/// # Safety
/// `engine` must be null or a live engine; `cookies_json` a valid C string.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ve_engine_set_cookies(
    engine: *mut VeEngine,
    context: u64,
    cookies_json: *const c_char,
) -> *mut c_char {
    if cookies_json.is_null() {
        return error_string(ErrorCode::InvalidParams, "null cookies");
    }
    // SAFETY: forwarded caller guarantees.
    unsafe { call(engine, cookies_json, |e, json| e.set_cookies_json(context, json)) }
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

    fn cstr(s: &str) -> CString {
        CString::new(s).unwrap()
    }

    #[test]
    fn c_abi_round_trip() {
        let config = cstr(r#"{"offline": true, "viewport": {"width": 800, "height": 600}}"#);
        let engine = unsafe { ve_engine_new_with_config(config.as_ptr()) };
        assert!(!engine.is_null());

        let source = cstr(
            r#"{"html": "<title>C</title><label>Q <input name=q></label><button>Go</button>", "url": "https://c.test/"}"#,
        );
        let opened = take(unsafe { ve_engine_open(engine, source.as_ptr()) });
        assert_eq!(opened["ok"], true, "{opened}");
        assert_eq!(opened["title"], "C");
        assert_eq!(opened["context"], 1);
        assert_eq!(opened["routing"]["requiresScript"], false);
        let page = opened["page"].as_u64().unwrap();

        let observed = take(unsafe { ve_page_observe(engine, page, std::ptr::null()) });
        assert_eq!(observed["ok"], true);
        assert_eq!(observed["content"]["title"], "C");
        assert_eq!(observed["content"]["viewport"]["width"].as_f64(), Some(800.0));
        let button = observed["content"]["elements"]
            .as_array()
            .unwrap()
            .iter()
            .find(|e| e["role"] == "button")
            .expect("button ref");
        let reference = button["ref"].as_str().unwrap();
        assert!(reference.starts_with('r'));

        let program = cstr(&format!(
            r#"{{"program":[{{"id":"f","op":"fill","target":"label=Q","value":"hi"}},{{"id":"c","op":"click","target":"{reference}"}}],"returnObservation":{{"sinceRevision":{}}}}}"#,
            observed["revision"].as_u64().unwrap()
        ));
        let executed = take(unsafe { ve_page_execute(engine, page, program.as_ptr()) });
        assert_eq!(executed["ok"], true, "{executed}");
        assert_eq!(executed["result"]["status"], "completed");
        assert_eq!(executed["result"]["steps"][1]["op"], "click");
        assert!(executed["observation"]["changesSince"].is_array());

        let shot = take(unsafe { ve_page_screenshot(engine, page, std::ptr::null()) });
        assert_eq!(shot["ok"], true);
        assert_eq!(shot["width"], 800);
        assert!(shot["bytes"].as_u64().unwrap() > 0);

        let ctx = unsafe { ve_context_new(engine, std::ptr::null()) };
        assert_eq!(ctx, 2);
        let bad_policy = cstr("{\"blockLoopback\": \"yes\"}");
        assert_eq!(unsafe { ve_context_new(engine, bad_policy.as_ptr()) }, 0);
        let cookies = cstr(r#"[{"name":"t","value":"1","domain":"c.test","path":"/","secure":false,"httpOnly":false}]"#);
        let set = take(unsafe { ve_engine_set_cookies(engine, ctx, cookies.as_ptr()) });
        assert_eq!(set["imported"], 1);
        let got = take(unsafe { ve_engine_get_cookies(engine, ctx) });
        assert_eq!(got["cookies"][0]["value"], "1");
        assert!(take(unsafe { ve_engine_get_cookies(engine, 1) })["cookies"]
            .as_array()
            .unwrap()
            .is_empty());
        assert!(unsafe { ve_context_free(engine, ctx) });
        assert!(!unsafe { ve_context_free(engine, ctx) });

        assert!(unsafe { ve_page_close(engine, page) });
        assert!(!unsafe { ve_page_close(engine, page) });
        let gone = take(unsafe { ve_page_observe(engine, page, std::ptr::null()) });
        assert_eq!(gone["ok"], false);
        assert_eq!(gone["error"]["code"], "not_found");

        // SAFETY: static string.
        let version = unsafe { CStr::from_ptr(ve_version()) }.to_str().unwrap();
        assert_eq!(version, env!("CARGO_PKG_VERSION"));
        unsafe { ve_engine_free(engine) };
    }

    #[test]
    fn null_arguments_never_crash() {
        let null_engine: *mut VeEngine = std::ptr::null_mut();
        let source = cstr(r#"{"html": "<p>x</p>"}"#);
        let err = take(unsafe { ve_engine_open(null_engine, source.as_ptr()) });
        assert_eq!(err["ok"], false);
        assert_eq!(err["error"]["code"], "invalid_params");
        assert_eq!(err["error"]["message"], "null engine");
        assert_eq!(take(unsafe { ve_page_observe(null_engine, 1, std::ptr::null()) })["ok"], false);
        assert_eq!(take(unsafe { ve_page_execute(null_engine, 1, std::ptr::null()) })["ok"], false);
        assert_eq!(take(unsafe { ve_page_screenshot(null_engine, 1, std::ptr::null()) })["ok"], false);
        assert_eq!(take(unsafe { ve_engine_get_cookies(null_engine, 1) })["ok"], false);
        assert_eq!(take(unsafe { ve_engine_set_cookies(null_engine, 1, std::ptr::null()) })["ok"], false);
        assert!(!unsafe { ve_page_close(null_engine, 1) });
        assert_eq!(unsafe { ve_context_new(null_engine, std::ptr::null()) }, 0);
        assert!(!unsafe { ve_context_free(null_engine, 1) });
        unsafe { ve_engine_free(null_engine) };
        unsafe { ve_string_free(std::ptr::null_mut()) };

        let engine = ve_engine_new();
        let null_str = take(unsafe { ve_engine_open(engine, std::ptr::null()) });
        assert_eq!(null_str["error"]["code"], "invalid_params", "{null_str}");
        let null_program = take(unsafe { ve_page_execute(engine, 1, std::ptr::null()) });
        assert_eq!(null_program["error"]["message"], "null program");
        let bad_utf8 = CString::new([0xffu8, 0xfe]).unwrap();
        let utf8 = take(unsafe { ve_engine_open(engine, bad_utf8.as_ptr()) });
        assert_eq!(utf8["error"]["message"], "argument is not valid UTF-8");
        assert!(unsafe { ve_engine_new_with_config(bad_utf8.as_ptr()) }.is_null());
        let not_json = cstr("nope");
        assert!(unsafe { ve_engine_new_with_config(not_json.as_ptr()) }.is_null());
        let defaults = unsafe { ve_engine_new_with_config(std::ptr::null()) };
        assert!(!defaults.is_null());
        unsafe { ve_engine_free(defaults) };
        unsafe { ve_engine_free(engine) };
    }

    #[test]
    fn panics_become_internal_errors() {
        let json = guarded(|| panic!("boom {}", 42));
        let value: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert_eq!(value["ok"], false);
        assert_eq!(value["error"]["code"], "internal");
        assert!(value["error"]["message"].as_str().unwrap().contains("boom 42"));
        let json = guarded(|| std::panic::panic_any(7u8));
        let value: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert!(value["error"]["message"].as_str().unwrap().contains("unknown panic"));
    }
}
