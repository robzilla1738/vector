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

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Once};
use std::time::Duration;

use crate::vm::{HostApi, JsValue, JsVm, ScriptError};

static V8_INIT: Once = Once::new();

fn init_v8() {
    V8_INIT.call_once(|| {
        let platform = v8::new_default_platform(0, false).make_shared();
        v8::V8::initialize_platform(platform);
        v8::V8::initialize();
    });
}

/// Raw pointer to the host active during the current call. Stored in an
/// isolate slot; only dereferenced inside the trampoline while the owning
/// `eval_with_host`/`call_with_host` frame is alive.
struct CurrentHost(*mut dyn HostApi);

/// V8 virtual machine.
pub struct V8Vm {
    isolate: v8::OwnedIsolate,
    context: v8::Global<v8::Context>,
    /// Set after any evaluation until the next microtask checkpoint.
    maybe_pending: bool,
    deadline: Option<Duration>,
    host_names: Vec<String>,
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
    /// Creates an isolate with the default heap limits.
    pub fn new() -> Result<Self, ScriptError> {
        Self::with_heap_limit(None)
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
            v8::Global::new(scope, context)
        };
        Ok(Self {
            isolate,
            context,
            maybe_pending: false,
            deadline: None,
            host_names: Vec::new(),
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
        let watchdog = self.deadline.map(|deadline| {
            let done = Arc::new(AtomicBool::new(false));
            let handle = self.isolate.thread_safe_handle();
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
                handle.terminate_execution();
            });
            done
        });
        let context = self.context.clone();
        let result = {
            v8::scope!(let scope, &mut self.isolate);
            let context = v8::Local::new(scope, context);
            let scope = &mut v8::ContextScope::new(scope, context);
            v8::tc_scope!(let tc, scope);
            let value = f(tc);
            match value {
                Some(v) => Ok(v),
                None if tc.has_terminated() => Err(ScriptError::Internal(
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
        if self.isolate.is_execution_terminating() {
            self.isolate.cancel_terminate_execution();
        }
        self.maybe_pending = true;
        result
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
    match host.call(index, &converted) {
        Ok(value) => {
            let v = from_js_value(scope, &value);
            rv.set(v);
        }
        Err(e) => {
            let msg = v8::String::new(scope, &e.to_string()).unwrap();
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
        if !self.maybe_pending {
            return Ok(0);
        }
        self.isolate.perform_microtask_checkpoint();
        self.maybe_pending = false;
        Ok(1)
    }

    fn memory_used(&self) -> Option<usize> {
        // `get_heap_statistics` needs `&mut`; the trait method is `&self`,
        // so report the last known figure only when cheaply available
        None
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
    }
}
