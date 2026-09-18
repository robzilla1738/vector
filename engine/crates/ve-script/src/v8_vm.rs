//! V8 backend via the `v8` crate (feature `v8`) — decision D1.
//!
//! One isolate and one context per VM. Host functions
//! ([`JsVm::register_host_functions`]) are `FunctionTemplate`s sharing a
//! single trampoline; the function's index travels as the template's data
//! and the *current* [`HostApi`] is parked in an isolate slot for the
//! duration of each `eval_with_host` / `call_with_host`, so a host function
//! can reach the page that owns the VM without the VM knowing the page.
//!
//! Values cross as [`JsValue`]: primitives natively, arrays/objects through
//! `JSON.stringify` / `JSON.parse` (functions become `undefined`).
//! Microtasks run only at explicit checkpoints
//! ([`JsVm::run_pending_jobs`]), which is what lets `settle()` reason about
//! the queue. A per-call deadline is enforced by a watchdog thread calling
//! `terminate_execution` on the isolate's thread-safe handle.

#![allow(unsafe_code)]

use std::cell::{Cell, RefCell};
use std::mem::ManuallyDrop;
use std::panic::{AssertUnwindSafe, catch_unwind};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Once};
use std::time::Duration;

use crate::vm::{HostApi, JsValue, JsVm, ScriptError};

static V8_INIT: Once = Once::new();

thread_local! {
    static NEXT_ORD: Cell<u64> = const { Cell::new(0) };
    static LIVE: RefCell<Vec<LiveSlot>> = const { RefCell::new(Vec::new()) };
    static RETIRED: RefCell<Vec<(u64, RetiredIsolate)>> = const { RefCell::new(Vec::new()) };
    static SCOPE_DEPTH: Cell<usize> = const { Cell::new(0) };
}

struct LiveSlot {
    ord: u64,
    raw: v8::UnsafeRawIsolatePtr,
}

/// Restores the isolate enter stack after an eval that had to exit newer VMs.
struct RunGuard {
    exited: Vec<v8::UnsafeRawIsolatePtr>,
}

impl Drop for RunGuard {
    fn drop(&mut self) {
        SCOPE_DEPTH.with(|d| d.set(d.get().saturating_sub(1)));
        enter_raws(&self.exited);
        flush_retired();
    }
}

fn exit_newer_than(ord: u64) -> Vec<v8::UnsafeRawIsolatePtr> {
    let mut exited = Vec::new();
    LIVE.with(|l| {
        for slot in l.borrow().iter().rev() {
            if slot.ord <= ord {
                break;
            }
            // SAFETY: these isolates were entered on creation and are still live.
            unsafe {
                v8::Isolate::from_raw_isolate_ptr(slot.raw).exit();
            }
            exited.push(slot.raw);
        }
    });
    exited
}

fn enter_raws(raws: &[v8::UnsafeRawIsolatePtr]) {
    for raw in raws.iter().rev() {
        // SAFETY: paired with `exit_newer_than`; the isolate is still allocated.
        unsafe {
            v8::Isolate::from_raw_isolate_ptr(*raw).enter();
        }
    }
}

/// Isolate parked because a newer isolate on this thread is still entered.
#[allow(dead_code)]
struct RetiredIsolate {
    context: v8::Global<v8::Context>,
    isolate: v8::OwnedIsolate,
}

fn alloc_ord() -> u64 {
    NEXT_ORD.with(|c| {
        let n = c.get();
        c.set(n + 1);
        n
    })
}

fn panic_message(payload: &(dyn std::any::Any + Send)) -> String {
    payload
        .downcast_ref::<String>()
        .cloned()
        .or_else(|| payload.downcast_ref::<&str>().map(|s| (*s).to_owned()))
        .unwrap_or_else(|| "unknown panic".to_owned())
}

fn flush_retired() {
    if SCOPE_DEPTH.with(|d| d.get() > 0) {
        return;
    }
    loop {
        let max_live = LIVE.with(|l| l.borrow().iter().map(|s| s.ord).max());
        let Some((_, retired)) = RETIRED.with(|r| {
            let mut r = r.borrow_mut();
            match r.last() {
                Some((ord, _)) if max_live.is_none_or(|m| *ord > m) => r.pop(),
                _ => None,
            }
        }) else {
            break;
        };
        drop(retired);
    }
}

fn init_v8() {
    V8_INIT.call_once(|| {
        let platform = v8::new_default_platform(0, false).make_shared();
        v8::V8::initialize_platform(platform);
        v8::V8::initialize();
        start_shared_watchdog();
    });
}

/// Initialize V8 (and the shared watchdog thread) before a production sandbox
/// is applied so later script evals do not need to `clone` a new thread.
pub fn preload() {
    init_v8();
}

fn start_shared_watchdog() {
    // Placeholder: per-eval watchdog still uses a reused thread pool via spawn.
    // Preload forces the platform + this function to run before seccomp.
    let _ = std::thread::Builder::new()
        .name("ve-v8-watchdog".into())
        .spawn(|| {
            loop {
                std::thread::park();
            }
        });
}

/// Raw pointer to the host active during the current call. Stored in an
/// isolate slot; only dereferenced inside the trampoline while the owning
/// `eval_with_host`/`call_with_host` frame is alive.
struct CurrentHost(*mut dyn HostApi);

/// V8 virtual machine.
pub struct V8Vm {
    /// Dropped before [`Self::isolate`] (`rusty_v8` globals must not outlive it).
    context: ManuallyDrop<v8::Global<v8::Context>>,
    isolate: ManuallyDrop<v8::OwnedIsolate>,
    /// Creation order on this thread; drop is LIFO across VMs.
    ord: u64,
    /// Set after any evaluation until the next microtask checkpoint.
    maybe_pending: bool,
    deadline: Option<Duration>,
    host_names: Vec<String>,
    /// `true` after [`JsVm::park`] until [`JsVm::unpark`].
    parked: bool,
}

impl std::fmt::Debug for V8Vm {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("V8Vm")
            .field("host_functions", &self.host_names.len())
            .field("deadline", &self.deadline)
            .finish_non_exhaustive()
    }
}

impl V8Vm {
    /// Initialize the platform and shared watchdog before applying seccomp.
    pub fn preload() {
        init_v8();
    }

    /// Creates an isolate with the default heap limits.
    /// `VECTOR_V8_HEAP_MB` raises the isolate max when set (browserbench).
    pub fn new() -> Result<Self, ScriptError> {
        let max = std::env::var("VECTOR_V8_HEAP_MB")
            .ok()
            .and_then(|s| s.parse::<usize>().ok())
            .map(|mb| mb.saturating_mul(1024 * 1024));
        Self::with_heap_limit(max)
    }

    /// Creates an isolate whose heap may not exceed `max_bytes`.
    pub fn with_heap_limit(max_bytes: Option<usize>) -> Result<Self, ScriptError> {
        init_v8();
        let mut params = v8::CreateParams::default();
        if let Some(max) = max_bytes {
            params = params.heap_limits(0, max);
        }
        let mut isolate = v8::Isolate::new(params);
        isolate.set_microtasks_policy(v8::MicrotasksPolicy::Explicit);
        let context = {
            v8::scope!(let scope, &mut isolate);
            let context = v8::Context::new(scope, v8::ContextOptions::default());
            {
                let scope = &mut v8::ContextScope::new(scope, context);
                install_html_dda_host(scope);
            }
            v8::Global::new(scope, context)
        };
        let ord = alloc_ord();
        let raw = unsafe { isolate.as_raw_isolate_ptr() };
        LIVE.with(|l| l.borrow_mut().push(LiveSlot { ord, raw }));
        Ok(Self {
            context: ManuallyDrop::new(context),
            isolate: ManuallyDrop::new(isolate),
            ord,
            maybe_pending: false,
            deadline: None,
            host_names: Vec::new(),
            parked: false,
        })
    }

    fn with_host<R>(
        &mut self,
        host: Option<&mut dyn HostApi>,
        f: impl FnOnce(&mut Self) -> R,
    ) -> R {
        if let Some(host) = host {
            // SAFETY: only the lifetime bound is erased; the pointer is used
            // solely inside `f` and removed from the slot before returning.
            let raw: *mut dyn HostApi = std::ptr::from_mut::<dyn HostApi>(host);
            #[allow(clippy::transmute_ptr_to_ptr)]
            let ptr: *mut (dyn HostApi + 'static) = unsafe {
                std::mem::transmute::<*mut dyn HostApi, *mut (dyn HostApi + 'static)>(raw)
            };
            self.isolate.set_slot(CurrentHost(ptr));
        } else {
            self.isolate.remove_slot::<CurrentHost>();
        }
        let out = f(self);
        self.isolate.remove_slot::<CurrentHost>();
        out
    }

    /// Runs `f` inside a context scope with a `TryCatch`, converting a thrown
    /// exception into [`ScriptError::Exception`] and enforcing the deadline.
    fn run<R>(
        &mut self,
        f: impl for<'s> FnOnce(&mut v8::PinScope<'s, '_>) -> Option<R>,
    ) -> Result<R, ScriptError> {
        let handle = self.isolate.thread_safe_handle();
        let watchdog = self.deadline.map(|deadline| {
            let done = Arc::new(AtomicBool::new(false));
            let watchdog_handle = handle.clone();
            let flag = Arc::clone(&done);
            std::thread::spawn(move || {
                let step = Duration::from_millis(5);
                let mut waited = Duration::ZERO;
                while waited < deadline {
                    std::thread::sleep(step);
                    waited += step;
                    if flag.load(Ordering::Acquire) {
                        return;
                    }
                }
                // Tight `for(;;)` loops sometimes ignore a single terminate.
                let mut extra = Duration::ZERO;
                while !flag.load(Ordering::Acquire) && extra < Duration::from_secs(2) {
                    watchdog_handle.terminate_execution();
                    std::thread::sleep(step);
                    extra += step;
                }
            });
            done
        });
        let context = (*self.context).clone();
        SCOPE_DEPTH.with(|d| d.set(d.get() + 1));
        let _run_guard = RunGuard {
            exited: exit_newer_than(self.ord),
        };
        let result = {
            v8::scope!(let scope, &mut *self.isolate);
            let context = v8::Local::new(scope, context);
            let scope = &mut v8::ContextScope::new(scope, context);
            v8::tc_scope!(let tc, scope);
            let value = f(tc);
            if let Some(done) = &watchdog {
                done.store(true, Ordering::Release);
            }
            let terminated = tc.has_terminated() || handle.is_execution_terminating();
            if terminated {
                handle.cancel_terminate_execution();
            }
            match value {
                Some(v) => Ok(v),
                None if terminated => Err(ScriptError::Internal(
                    "script terminated: deadline exceeded".into(),
                )),
                None => match tc.exception() {
                    None => Err(ScriptError::Internal(
                        "script failed without an exception".into(),
                    )),
                    Some(exception) => {
                        let message = tc.message().map_or_else(
                            || exception.to_rust_string_lossy(tc),
                            |m| m.get(tc).to_rust_string_lossy(tc),
                        );
                        let stack = tc.stack_trace().map(|s| s.to_rust_string_lossy(tc));
                        if message.contains("SyntaxError") {
                            Err(ScriptError::Syntax(message))
                        } else {
                            Err(ScriptError::Exception { message, stack })
                        }
                    }
                },
            }
        };
        if let Some(done) = watchdog {
            done.store(true, Ordering::Release);
        }
        if handle.is_execution_terminating() {
            handle.cancel_terminate_execution();
        }
        self.maybe_pending = true;
        result
    }
}

impl Drop for V8Vm {
    fn drop(&mut self) {
        if self.parked {
            // rusty_v8 requires isolates be entered at drop (LIFO with creation).
            unsafe {
                self.isolate.enter();
            }
            self.parked = false;
        }
        LIVE.with(|l| l.borrow_mut().retain(|s| s.ord != self.ord));
        // SAFETY: Drop runs once; the isolate and context are not used after.
        let retired = RetiredIsolate {
            context: unsafe { ManuallyDrop::take(&mut self.context) },
            isolate: unsafe { ManuallyDrop::take(&mut self.isolate) },
        };
        RETIRED.with(|r| {
            let mut r = r.borrow_mut();
            let pos = r.partition_point(|(o, _)| *o < self.ord);
            r.insert(pos, (self.ord, retired));
        });
        flush_retired();
    }
}

/// V8 value → JSON-shaped [`JsValue`].
fn to_js_value(scope: &mut v8::PinScope<'_, '_>, value: v8::Local<'_, v8::Value>) -> JsValue {
    if value.is_undefined() || value.is_function() || value.is_symbol() {
        return JsValue::Undefined;
    }
    if value.is_null() {
        return JsValue::Null;
    }
    if value.is_boolean() {
        return JsValue::Bool(value.is_true());
    }
    if value.is_number() {
        return JsValue::Number(value.number_value(scope).unwrap_or(f64::NAN));
    }
    if value.is_string() {
        return JsValue::String(value.to_rust_string_lossy(scope));
    }
    match v8::json::stringify(scope, value) {
        Some(json) => {
            let text = json.to_rust_string_lossy(scope);
            serde_json::from_str::<serde_json::Value>(&text)
                .map_or(JsValue::Undefined, JsValue::from)
        }
        None => JsValue::Undefined,
    }
}

/// [`JsValue`] → V8 value.
fn from_js_value<'s>(
    scope: &mut v8::PinScope<'s, '_>,
    value: &JsValue,
) -> v8::Local<'s, v8::Value> {
    match value {
        JsValue::Undefined => v8::undefined(scope).into(),
        JsValue::Null => v8::null(scope).into(),
        JsValue::Bool(b) => v8::Boolean::new(scope, *b).into(),
        JsValue::Number(n) => v8::Number::new(scope, *n).into(),
        JsValue::String(s) => {
            v8::String::new(scope, s).map_or_else(|| v8::undefined(scope).into(), Into::into)
        }
        JsValue::Array(_) | JsValue::Object(_) => {
            let text = value.to_json_string();
            let Some(json) = v8::String::new(scope, &text) else {
                return v8::undefined(scope).into();
            };
            v8::json::parse(scope, json).unwrap_or_else(|| v8::undefined(scope).into())
        }
    }
}

/// Shared native callback for every host function.
fn host_trampoline(
    scope: &mut v8::PinScope<'_, '_>,
    args: v8::FunctionCallbackArguments<'_>,
    mut rv: v8::ReturnValue<'_, v8::Value>,
) {
    let index = args.data().int32_value(scope).unwrap_or(-1);
    let mut converted = Vec::with_capacity(args.length() as usize);
    for i in 0..args.length() {
        let v = args.get(i);
        converted.push(to_js_value(scope, v));
    }
    let Some(CurrentHost(ptr)) = scope.get_slot::<CurrentHost>().map(|h| CurrentHost(h.0)) else {
        let msg = v8::String::new(scope, "host function called outside a host call").unwrap();
        let exc = v8::Exception::error(scope, msg);
        scope.throw_exception(exc);
        return;
    };
    // SAFETY: the pointer was installed by `with_host` for the duration of
    // the enclosing eval/call and is removed before that frame returns; V8
    // only invokes callbacks while a script is running inside that frame.
    let host: &mut dyn HostApi = unsafe { &mut *ptr };
    let index = usize::try_from(index).unwrap_or(usize::MAX);
    let result = catch_unwind(AssertUnwindSafe(|| host.call(index, &converted)));
    match result {
        Ok(Ok(value)) => {
            let v = from_js_value(scope, &value);
            rv.set(v);
        }
        Ok(Err(e)) => {
            let msg = v8::String::new(scope, &e.to_string()).unwrap();
            let exc = v8::Exception::error(scope, msg);
            scope.throw_exception(exc);
        }
        Err(payload) => {
            let message = format!("host panic: {}", panic_message(payload.as_ref()));
            let msg = v8::String::new(scope, &message).unwrap();
            let exc = v8::Exception::error(scope, msg);
            scope.throw_exception(exc);
        }
    }
}

impl JsVm for V8Vm {
    fn name(&self) -> &'static str {
        "v8"
    }

    fn eval(&mut self, source: &str, origin: &str) -> Result<JsValue, ScriptError> {
        self.with_host(None, |vm| vm.eval_inner(source, origin))
    }

    fn call(&mut self, function: &str, args: &[JsValue]) -> Result<JsValue, ScriptError> {
        self.with_host(None, |vm| vm.call_inner(function, args))
    }

    fn register_host_functions(
        &mut self,
        namespace: &str,
        names: &[&str],
    ) -> Result<(), ScriptError> {
        let base = self.host_names.len();
        let owned: Vec<String> = names.iter().map(|n| (*n).to_owned()).collect();
        let ns = namespace.to_owned();
        let result = self.run(|scope| {
            let global = scope.get_current_context().global(scope);
            let ns_key = v8::String::new(scope, &ns)?;
            let existing = global.get(scope, ns_key.into());
            let target: v8::Local<v8::Object> = match existing {
                Some(v) if v.is_object() => v.try_into().ok()?,
                _ => {
                    let obj = v8::Object::new(scope);
                    global.set(scope, ns_key.into(), obj.into())?;
                    obj
                }
            };
            for (i, name) in owned.iter().enumerate() {
                let data = v8::Integer::new(scope, i32::try_from(base + i).ok()?);
                let templ = v8::FunctionTemplate::builder(host_trampoline)
                    .data(data.into())
                    .build(scope);
                let func = templ.get_function(scope)?;
                let key = v8::String::new(scope, name)?;
                target.set(scope, key.into(), func.into())?;
            }
            Some(())
        });
        self.host_names.extend(owned);
        result
    }

    fn eval_with_host(
        &mut self,
        host: &mut dyn HostApi,
        source: &str,
        origin: &str,
    ) -> Result<JsValue, ScriptError> {
        self.with_host(Some(host), |vm| vm.eval_inner(source, origin))
    }

    fn call_with_host(
        &mut self,
        host: &mut dyn HostApi,
        function: &str,
        args: &[JsValue],
    ) -> Result<JsValue, ScriptError> {
        self.with_host(Some(host), |vm| vm.call_inner(function, args))
    }

    fn run_pending_jobs_with_host(&mut self, host: &mut dyn HostApi) -> Result<usize, ScriptError> {
        self.with_host(Some(host), JsVm::run_pending_jobs)
    }

    fn set_call_deadline(&mut self, deadline: Option<Duration>) {
        self.deadline = deadline;
    }

    fn has_pending_jobs(&self) -> bool {
        self.maybe_pending
    }

    fn run_pending_jobs(&mut self) -> Result<usize, ScriptError> {
        // WebAssembly.instantiate (and other V8 async work) completes on the
        // default platform queue. Drain it even when no script just ran, or
        // later settle() calls miss the compile-done task.
        let platform = v8::V8::get_current_platform();
        let mut ran = 0usize;
        for _ in 0..32 {
            let pumped = v8::Platform::pump_message_loop(&platform, &self.isolate, false);
            self.isolate.perform_microtask_checkpoint();
            if pumped {
                ran += 1;
            } else if !self.maybe_pending {
                break;
            } else {
                self.maybe_pending = false;
            }
        }
        self.maybe_pending = false;
        Ok(ran)
    }

    fn memory_used(&self) -> Option<usize> {
        // `get_heap_statistics` needs `&mut`; the trait method is `&self`,
        // so report the last known figure only when cheaply available
        None
    }

    fn park(&mut self) {
        if self.parked {
            return;
        }
        // SAFETY: this isolate was entered on this thread at creation or unpark.
        unsafe {
            self.isolate.exit();
        }
        self.parked = true;
    }

    fn unpark(&mut self) {
        if !self.parked {
            return;
        }
        // SAFETY: paired with [`Self::park`]; isolate is still allocated.
        unsafe {
            self.isolate.enter();
        }
        self.parked = false;
    }
}

impl V8Vm {
    fn eval_inner(&mut self, source: &str, origin: &str) -> Result<JsValue, ScriptError> {
        let source = source.to_owned();
        let origin = origin.to_owned();
        self.run(|scope| {
            let code = v8::String::new(scope, &source)?;
            let name = v8::String::new(scope, &origin)?;
            let script_origin = v8::ScriptOrigin::new(
                scope,
                name.into(),
                0,
                0,
                false,
                0,
                None,
                false,
                false,
                false,
                None,
            );
            let script = v8::Script::compile(scope, code, Some(&script_origin))?;
            let value = script.run(scope)?;
            Some(to_js_value(scope, value))
        })
    }

    fn call_inner(&mut self, function: &str, args: &[JsValue]) -> Result<JsValue, ScriptError> {
        let function = function.to_owned();
        let args = args.to_vec();
        self.run(|scope| {
            let global = scope.get_current_context().global(scope);
            let mut target: v8::Local<v8::Value> = global.into();
            // dotted paths reach nested namespaces (`__ve.fireTimer`)
            for part in function.split('.') {
                let key = v8::String::new(scope, part)?;
                let obj: v8::Local<v8::Object> = target.try_into().ok()?;
                target = obj.get(scope, key.into())?;
            }
            let func: v8::Local<v8::Function> = target.try_into().ok()?;
            let recv = v8::undefined(scope).into();
            let argv: Vec<v8::Local<v8::Value>> =
                args.iter().map(|a| from_js_value(scope, a)).collect();
            let value = func.call(scope, recv, &argv)?;
            Some(to_js_value(scope, value))
        })
    }
}

unsafe extern "C" {
    fn ve_object_template_mark_as_undetectable(this: *const v8::ObjectTemplate);
}

fn mark_object_template_undetectable(templ: &v8::ObjectTemplate) {
    // SAFETY: `templ` is a live Local<ObjectTemplate> in the current handle
    // scope. The C++ shim matches rusty_v8's ObjectTemplate FFI convention.
    unsafe {
        ve_object_template_mark_as_undetectable(templ);
    }
}

const HTML_DDA_WRAP: &str = "__veHtmlDdaWrap";

fn install_html_dda_host(scope: &mut v8::PinScope<'_, '_>) {
    let global = scope.get_current_context().global(scope);
    let Some(key) = v8::String::new(scope, HTML_DDA_WRAP) else {
        return;
    };
    let templ = v8::FunctionTemplate::builder(html_dda_wrap).build(scope);
    let Some(func) = templ.get_function(scope) else {
        return;
    };
    let _ = global.set(scope, key.into(), func.into());
}

fn html_dda_wrap(
    scope: &mut v8::PinScope<'_, '_>,
    args: v8::FunctionCallbackArguments<'_>,
    mut rv: v8::ReturnValue<'_, v8::Value>,
) {
    if args.length() < 1 {
        return;
    }
    let Ok(src) = v8::Local::<v8::Object>::try_from(args.get(0)) else {
        return;
    };
    let Some(instance) = new_html_dda_object(scope, src) else {
        return;
    };
    rv.set(instance.into());
}

fn new_html_dda_object<'s, 'i>(
    scope: &mut v8::PinScope<'s, 'i>,
    src: v8::Local<'_, v8::Object>,
) -> Option<v8::Local<'s, v8::Object>> {
    let fetch_key = v8::String::new(scope, "_fetch")?;
    let fetch = src.get(scope, fetch_key.into())?;
    let proto = src.get_prototype(scope)?;
    let templ = v8::ObjectTemplate::new(scope);
    mark_object_template_undetectable(&templ);
    templ.set_call_as_function_handler(html_all_call, None);
    templ.set_named_property_handler(
        v8::NamedPropertyHandlerConfiguration::new().getter(html_all_named_get),
    );
    templ.set_indexed_property_handler(
        v8::IndexedPropertyHandlerConfiguration::new().getter(html_all_indexed_get),
    );
    let instance = templ.new_instance(scope)?;
    instance.set_prototype(scope, proto)?;
    instance.set(scope, fetch_key.into(), fetch)?;
    Some(instance)
}

fn html_all_call(
    scope: &mut v8::PinScope<'_, '_>,
    args: v8::FunctionCallbackArguments<'_>,
    mut rv: v8::ReturnValue<'_, v8::Value>,
) {
    let this = args.this();
    let name = if args.length() > 0 {
        args.get(0)
    } else {
        v8::undefined(scope).into()
    };
    if let Some(result) = call_collection_item(scope, this, name) {
        rv.set(result);
    }
}

fn html_all_skip_name(name: &str) -> bool {
    matches!(
        name,
        "item"
            | "namedItem"
            | "length"
            | "_fetch"
            | "constructor"
            | "toString"
            | "valueOf"
            | "toLocaleString"
    ) || name.starts_with('_')
}

fn html_all_named_get(
    scope: &mut v8::PinScope<'_, '_>,
    key: v8::Local<v8::Name>,
    args: v8::PropertyCallbackArguments<'_>,
    mut rv: v8::ReturnValue<'_, v8::Value>,
) -> v8::Intercepted {
    if !key.is_string() {
        return v8::Intercepted::kNo;
    }
    let name = key.to_rust_string_lossy(scope);
    if html_all_skip_name(&name) {
        return v8::Intercepted::kNo;
    }
    let this = args.holder();
    let Some(result) = call_collection_item(scope, this, key.into()) else {
        return v8::Intercepted::kNo;
    };
    if result.is_null() || result.is_undefined() {
        return v8::Intercepted::kNo;
    }
    rv.set(result);
    v8::Intercepted::kYes
}

fn html_all_indexed_get(
    scope: &mut v8::PinScope<'_, '_>,
    index: u32,
    args: v8::PropertyCallbackArguments<'_>,
    mut rv: v8::ReturnValue<'_, v8::Value>,
) -> v8::Intercepted {
    let this = args.holder();
    let Some(name) = v8::String::new(scope, &index.to_string()) else {
        return v8::Intercepted::kNo;
    };
    let Some(result) = call_collection_item(scope, this, name.into()) else {
        return v8::Intercepted::kNo;
    };
    if result.is_null() || result.is_undefined() {
        return v8::Intercepted::kNo;
    }
    rv.set(result);
    v8::Intercepted::kYes
}

fn call_collection_item<'s, 'i>(
    scope: &mut v8::PinScope<'s, 'i>,
    this: v8::Local<'_, v8::Object>,
    name: v8::Local<'_, v8::Value>,
) -> Option<v8::Local<'s, v8::Value>> {
    let key = v8::String::new(scope, "item")?;
    let item = this.get(scope, key.into())?;
    let func = v8::Local::<v8::Function>::try_from(item).ok()?;
    func.call(scope, this.into(), &[name])
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::BTreeMap;

    struct Recorder {
        calls: Vec<(usize, Vec<JsValue>)>,
    }

    impl HostApi for Recorder {
        fn call(&mut self, index: usize, args: &[JsValue]) -> Result<JsValue, ScriptError> {
            self.calls.push((index, args.to_vec()));
            match index {
                // add(a, b)
                0 => Ok(JsValue::Number(
                    args.iter().filter_map(JsValue::as_f64).sum(),
                )),
                // echo(obj) → { got: obj, n: calls }
                1 => {
                    let mut o = BTreeMap::new();
                    o.insert("got".into(), args.first().cloned().unwrap_or_default());
                    o.insert("n".into(), JsValue::Number(self.calls.len() as f64));
                    Ok(JsValue::Object(o))
                }
                // fail()
                _ => Err(ScriptError::Unsupported("nope".into())),
            }
        }
    }

    #[test]
    fn html_dda_mark_is_not_a_windows_stub() {
        let src = include_str!("html_dda.cc");
        assert!(
            src.contains("MarkAsUndetectable()"),
            "document.all requires V8 MarkAsUndetectable on every advertised platform"
        );
        assert!(
            !src.contains("#if defined(_WIN32)"),
            "Gate C: Windows production must not stub HTMLDDA"
        );
    }

    #[test]
    fn html_dda_wrap_is_undetectable_and_callable() {
        let mut vm = V8Vm::new().unwrap();
        let got = vm
            .eval(
                r#"(function () {
                  class HTMLAllCollection {
                    constructor(fetch) { this._fetch = fetch; }
                    item(name) {
                      const els = this._fetch();
                      const s = String(name);
                      if (/^\d+$/.test(s)) return els[Number(s)] || null;
                      return els.find((el) => el.id === s) || null;
                    }
                  }
                  const src = new HTMLAllCollection(() => [{id:'p'}, {id:'q'}]);
                  Object.setPrototypeOf(src, HTMLAllCollection.prototype);
                  const all = __veHtmlDdaWrap(src);
                  return {
                    t: typeof all,
                    loose: all == null,
                    strict: all === undefined,
                    inst: all instanceof HTMLAllCollection,
                    call: !!(all('p') && all('p').id === 'p'),
                    item: !!(all.item('q') && all.item('q').id === 'q'),
                    idx: !!(all[0] && all[0].id === 'p'),
                    named: !!(all.p && all.p.id === 'p')
                  };
                })()"#,
                "<t>",
            )
            .unwrap();
        assert_eq!(
            got,
            JsValue::from(serde_json::json!({
                "t": "undefined",
                "loose": true,
                "strict": false,
                "inst": true,
                "call": true,
                "item": true,
                "idx": true,
                "named": true
            }))
        );
    }

    #[test]
    fn evaluates_and_converts_values() {
        let mut vm = V8Vm::new().unwrap();
        assert_eq!(vm.name(), "v8");
        assert_eq!(vm.eval("1 + 2", "<t>").unwrap(), JsValue::Number(3.0));
        assert_eq!(
            vm.eval("'a' + 'b'", "<t>").unwrap(),
            JsValue::String("ab".into())
        );
        assert_eq!(
            vm.eval("[1, 'x', null]", "<t>").unwrap(),
            JsValue::from(serde_json::json!([1, "x", null]))
        );
        assert_eq!(
            vm.eval("({a: {b: [true]}, f() {}})", "<t>").unwrap(),
            JsValue::from(serde_json::json!({"a": {"b": [true]}}))
        );
        assert_eq!(vm.eval("undefined", "<t>").unwrap(), JsValue::Undefined);
        assert_eq!(
            vm.eval("globalThis.x = 41; x + 1", "<t>").unwrap(),
            JsValue::Number(42.0)
        );
        // state persists across evals in the same realm
        assert_eq!(vm.eval("x", "<t>").unwrap(), JsValue::Number(41.0));
    }

    #[test]
    fn exceptions_and_syntax_errors_are_typed() {
        let mut vm = V8Vm::new().unwrap();
        match vm.eval("throw new TypeError('bad thing')", "page.js") {
            Err(ScriptError::Exception { message, stack }) => {
                assert!(message.contains("bad thing"), "{message}");
                assert!(stack.is_some());
            }
            other => panic!("{other:?}"),
        }
        assert!(matches!(
            vm.eval("let = ;", "<t>"),
            Err(ScriptError::Syntax(_))
        ));
        // the realm survives an exception
        assert_eq!(vm.eval("2", "<t>").unwrap(), JsValue::Number(2.0));
    }

    #[test]
    fn host_functions_round_trip_through_the_trampoline() {
        let mut vm = V8Vm::new().unwrap();
        vm.register_host_functions("__ve", &["add", "echo", "fail"])
            .unwrap();
        let mut host = Recorder { calls: Vec::new() };
        let sum = vm
            .eval_with_host(&mut host, "__ve.add(1, 2, 3.5)", "<t>")
            .unwrap();
        assert_eq!(sum, JsValue::Number(6.5));
        let echoed = vm
            .eval_with_host(
                &mut host,
                "__ve.echo({k: [1, 'two'], s: 'x'}).got.k[1]",
                "<t>",
            )
            .unwrap();
        assert_eq!(echoed, JsValue::String("two".into()));
        // a host error is a catchable JS Error carrying the message
        let caught = vm
            .eval_with_host(
                &mut host,
                "try { __ve.fail() } catch (e) { e instanceof Error && e.message }",
                "<t>",
            )
            .unwrap();
        assert_eq!(caught, JsValue::String("unsupported: nope".into()));
        assert_eq!(host.calls.len(), 3);
        assert_eq!(host.calls[0].0, 0);
        assert_eq!(
            host.calls[1].1[0],
            JsValue::from(serde_json::json!({"k": [1, "two"], "s": "x"}))
        );
        // without a host the call throws instead of dereferencing anything
        let bare = vm
            .eval(
                "try { __ve.add(1) } catch (e) { 'thrown: ' + e.message }",
                "<t>",
            )
            .unwrap();
        assert_eq!(
            bare,
            JsValue::String("thrown: host function called outside a host call".into())
        );
        // call_with_host reaches dotted paths and passes arguments
        vm.eval("globalThis.ns = { twice: (n) => __ve.add(n, n) }", "<t>")
            .unwrap();
        assert_eq!(
            vm.call_with_host(&mut host, "ns.twice", &[JsValue::Number(4.0)])
                .unwrap(),
            JsValue::Number(8.0)
        );
    }

    #[test]
    fn microtasks_run_only_at_checkpoints() {
        let mut vm = V8Vm::new().unwrap();
        vm.eval(
            "globalThis.log = []; Promise.resolve().then(() => log.push('then')); log.push('sync')",
            "<t>",
        )
        .unwrap();
        assert_eq!(
            vm.eval("log.join(',')", "<t>").unwrap(),
            JsValue::String("sync".into())
        );
        assert!(vm.has_pending_jobs());
        vm.run_pending_jobs().unwrap();
        assert_eq!(
            vm.eval("log.join(',')", "<t>").unwrap(),
            JsValue::String("sync,then".into())
        );
    }

    #[test]
    fn a_runaway_script_is_terminated_at_the_deadline() {
        let mut vm = V8Vm::new().unwrap();
        vm.set_call_deadline(Some(Duration::from_millis(60)));
        let started = std::time::Instant::now();
        let err = vm.eval("for(;;) {}", "<t>").unwrap_err();
        assert!(
            started.elapsed() < Duration::from_secs(3),
            "terminated promptly"
        );
        assert!(
            matches!(&err, ScriptError::Internal(m) if m.contains("deadline")),
            "{err:?}"
        );
        // the isolate is usable afterwards
        vm.set_call_deadline(None);
        assert_eq!(vm.eval("7", "<t>").unwrap(), JsValue::Number(7.0));
        drop(vm);
    }

    #[test]
    fn two_isolates_can_drop_older_first() {
        let older = V8Vm::new().unwrap();
        let newer = V8Vm::new().unwrap();
        drop(older);
        drop(newer);
    }

    #[test]
    fn drop_older_while_newer_is_evaling() {
        let older = V8Vm::new().unwrap();
        let mut newer = V8Vm::new().unwrap();
        drop(older);
        assert_eq!(newer.eval("1+1", "<t>").unwrap(), JsValue::Number(2.0));
        drop(newer);
    }

    #[test]
    fn eval_older_while_newer_exists() {
        let mut older = V8Vm::new().unwrap();
        let newer = V8Vm::new().unwrap();
        assert_eq!(older.eval("1+1", "<t>").unwrap(), JsValue::Number(2.0));
        drop(newer);
        drop(older);
    }

    #[test]
    fn terminated_isolate_drops_cleanly() {
        let mut vm = V8Vm::new().unwrap();
        vm.set_call_deadline(Some(Duration::from_millis(40)));
        let _ = vm.eval("for(;;) {}", "<t>");
        drop(vm);
    }

    #[test]
    fn webassembly_instantiate_resolves_after_platform_pump() {
        let mut vm = V8Vm::new().unwrap();
        let kind = vm.eval("typeof WebAssembly", "<t>").unwrap();
        assert_eq!(kind, JsValue::String("object".into()));
        vm.eval(
            r#"
            globalThis.__veWa = { done: null, err: null };
            WebAssembly.instantiate(new Uint8Array([0,97,115,109,1,0,0,0])).then(
              function (r) { globalThis.__veWa.done = !!(r && r.instance); },
              function (e) { globalThis.__veWa.err = String(e && e.message ? e.message : e); }
            );
            "#,
            "<t>",
        )
        .unwrap();
        for _ in 0..40 {
            let _ = vm.run_pending_jobs();
            std::thread::sleep(Duration::from_millis(5));
            let status = vm.eval("JSON.stringify(globalThis.__veWa)", "<t>").unwrap();
            if let JsValue::String(s) = status {
                if s.contains("\"done\":true") {
                    return;
                }
                if s.contains("\"err\":") && !s.contains("\"err\":null") {
                    panic!("WebAssembly.instantiate rejected: {s}");
                }
            }
        }
        panic!("WebAssembly.instantiate did not resolve after platform pump");
    }

    #[test]
    fn webassembly_shared_memory_is_available() {
        let mut vm = V8Vm::new().unwrap();
        let probe = vm
            .eval(
                r#"(function () {
                  var out = {
                    sab: typeof SharedArrayBuffer,
                    atomics: typeof Atomics,
                    mem: null,
                    err: null
                  };
                  try {
                    var m = new WebAssembly.Memory({ initial: 1, maximum: 2, shared: true });
                    out.mem = m.buffer && m.buffer.constructor && m.buffer.constructor.name;
                  } catch (e) {
                    out.err = String(e && e.message ? e.message : e);
                  }
                  return JSON.stringify(out);
                })()"#,
                "<t>",
            )
            .unwrap();
        let JsValue::String(s) = probe else {
            panic!("expected string, got {probe:?}");
        };
        assert!(
            s.contains("\"sab\":\"function\"") && s.contains("\"mem\":\"SharedArrayBuffer\""),
            "{s}"
        );
    }
}
