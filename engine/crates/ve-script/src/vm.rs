//! The VM-agnostic JavaScript interface.

use std::collections::BTreeMap;
use std::fmt;

/// A JSON-shaped value exchanged with the VM. Functions, symbols and other
/// non-serialisable values arrive as [`JsValue::Undefined`].
#[derive(Clone, Debug, PartialEq, Default)]
pub enum JsValue {
    /// `undefined`
    #[default]
    Undefined,
    /// `null`
    Null,
    /// Boolean.
    Bool(bool),
    /// Number (always `f64`, like JavaScript).
    Number(f64),
    /// String.
    String(String),
    /// Array.
    Array(Vec<JsValue>),
    /// Plain object with string keys, in insertion-independent order.
    Object(BTreeMap<String, JsValue>),
}

impl JsValue {
    /// JavaScript truthiness.
    #[must_use]
    pub fn is_truthy(&self) -> bool {
        match self {
            Self::Undefined | Self::Null => false,
            Self::Bool(b) => *b,
            Self::Number(n) => *n != 0.0 && !n.is_nan(),
            Self::String(s) => !s.is_empty(),
            Self::Array(_) | Self::Object(_) => true,
        }
    }

    /// The string payload, if this is a string.
    #[must_use]
    pub fn as_str(&self) -> Option<&str> {
        match self {
            Self::String(s) => Some(s),
            _ => None,
        }
    }

    /// The numeric payload, if this is a number.
    #[must_use]
    pub fn as_f64(&self) -> Option<f64> {
        match self {
            Self::Number(n) => Some(*n),
            _ => None,
        }
    }

    /// JSON serialisation (`undefined` becomes `null`).
    #[must_use]
    pub fn to_json_string(&self) -> String {
        serde_json::Value::from(self.clone()).to_string()
    }
}

impl fmt::Display for JsValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Undefined => f.write_str("undefined"),
            Self::String(s) => f.write_str(s),
            other => f.write_str(&other.to_json_string()),
        }
    }
}

impl From<serde_json::Value> for JsValue {
    fn from(v: serde_json::Value) -> Self {
        match v {
            serde_json::Value::Null => Self::Null,
            serde_json::Value::Bool(b) => Self::Bool(b),
            serde_json::Value::Number(n) => Self::Number(n.as_f64().unwrap_or(f64::NAN)),
            serde_json::Value::String(s) => Self::String(s),
            serde_json::Value::Array(a) => Self::Array(a.into_iter().map(Self::from).collect()),
            serde_json::Value::Object(o) => {
                Self::Object(o.into_iter().map(|(k, v)| (k, Self::from(v))).collect())
            }
        }
    }
}

impl From<JsValue> for serde_json::Value {
    fn from(v: JsValue) -> Self {
        match v {
            JsValue::Undefined | JsValue::Null => Self::Null,
            JsValue::Bool(b) => Self::Bool(b),
            // integral values serialise as integers (`5`, not `5.0`) so
            // extracted data reads naturally; NaN/∞ have no JSON form → null
            JsValue::Number(n) if n.fract() == 0.0 && n.abs() < 9.007_199_254_740_992e15 => {
                Self::Number(serde_json::Number::from(n as i64))
            }
            JsValue::Number(n) => serde_json::Number::from_f64(n).map_or(Self::Null, Self::Number),
            JsValue::String(s) => Self::String(s),
            JsValue::Array(a) => Self::Array(a.into_iter().map(Self::from).collect()),
            JsValue::Object(o) => {
                Self::Object(o.into_iter().map(|(k, v)| (k, Self::from(v))).collect())
            }
        }
    }
}

impl From<&str> for JsValue {
    fn from(s: &str) -> Self {
        Self::String(s.to_owned())
    }
}

impl From<f64> for JsValue {
    fn from(n: f64) -> Self {
        Self::Number(n)
    }
}

impl From<bool> for JsValue {
    fn from(b: bool) -> Self {
        Self::Bool(b)
    }
}

/// Errors from script evaluation.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum ScriptError {
    /// The backend cannot perform the operation (e.g. no VM compiled in).
    #[error("unsupported: {0}")]
    Unsupported(String),
    /// A syntax error in the source.
    #[error("syntax error: {0}")]
    Syntax(String),
    /// The script threw.
    #[error("uncaught exception: {message}")]
    Exception {
        /// `String(error)` or the thrown value.
        message: String,
        /// Stack trace when the VM provides one.
        stack: Option<String>,
    },
    /// The VM itself failed.
    #[error("vm: {0}")]
    Internal(String),
}

impl From<ScriptError> for ve_core::Error {
    fn from(e: ScriptError) -> Self {
        ve_core::Error::Script(e.to_string())
    }
}

/// The embedder's side of a host call. While a script runs, the VM hands
/// every `globalThis.<namespace>.<name>(...)` invocation to
/// [`HostApi::call`] with the function's index in the registration order.
/// The page implements this over its DOM; the VM never sees the DOM.
pub trait HostApi {
    /// Perform host function `index` with JSON-shaped `args`. An `Err`
    /// becomes a thrown `Error` in the script.
    fn call(&mut self, index: usize, args: &[JsValue]) -> Result<JsValue, ScriptError>;
}

/// A host that answers nothing (scripts see the host functions but every
/// call throws).
pub struct NoHost;

impl HostApi for NoHost {
    fn call(&mut self, index: usize, _args: &[JsValue]) -> Result<JsValue, ScriptError> {
        Err(ScriptError::Unsupported(format!(
            "host function #{index} has no host"
        )))
    }
}

/// A JavaScript virtual machine.
///
/// Implementations own a realm with a global object. Values cross the
/// boundary as [`JsValue`] (JSON-shaped). DOM bindings are built on
/// [`JsVm::register_host_functions`] + [`HostApi`]: a JS prelude defines the
/// Web API classes and forwards to native primitives keyed by node id.
pub trait JsVm {
    /// Backend name (`"v8"`, `"quickjs-ng"`, `"null"`).
    fn name(&self) -> &'static str;

    /// Evaluates `source` as a classic script. `origin` is used for error
    /// messages and stack traces (a URL or `"<inline>"`).
    fn eval(&mut self, source: &str, origin: &str) -> Result<JsValue, ScriptError>;

    /// Calls a global function by name.
    fn call(&mut self, function: &str, args: &[JsValue]) -> Result<JsValue, ScriptError>;

    /// Installs `globalThis.<namespace>` with one native function per name;
    /// each forwards to [`HostApi::call`] with its index. Backends without
    /// host support return `Unsupported`.
    fn register_host_functions(
        &mut self,
        namespace: &str,
        names: &[&str],
    ) -> Result<(), ScriptError> {
        let _ = (namespace, names);
        Err(ScriptError::Unsupported("host functions".into()))
    }

    /// [`JsVm::eval`] with `host` answering host-function calls made by the
    /// script. Backends without host support ignore `host`.
    fn eval_with_host(
        &mut self,
        host: &mut dyn HostApi,
        source: &str,
        origin: &str,
    ) -> Result<JsValue, ScriptError> {
        let _ = host;
        self.eval(source, origin)
    }

    /// [`JsVm::call`] with a host.
    fn call_with_host(
        &mut self,
        host: &mut dyn HostApi,
        function: &str,
        args: &[JsValue],
    ) -> Result<JsValue, ScriptError> {
        let _ = host;
        self.call(function, args)
    }

    /// [`JsVm::run_pending_jobs`] with a host (promise reactions may call host functions).
    fn run_pending_jobs_with_host(&mut self, host: &mut dyn HostApi) -> Result<usize, ScriptError> {
        let _ = host;
        self.run_pending_jobs()
    }

    /// Terminates a script that runs longer than `deadline` (per call).
    /// `None` removes the limit. Backends without the ability ignore it.
    fn set_call_deadline(&mut self, deadline: Option<std::time::Duration>) {
        let _ = deadline;
    }

    /// Whether promise jobs are waiting.
    fn has_pending_jobs(&self) -> bool;

    /// Runs all pending promise jobs; returns how many ran.
    fn run_pending_jobs(&mut self) -> Result<usize, ScriptError>;

    /// Heap usage in bytes, if the backend can report it.
    fn memory_used(&self) -> Option<usize> {
        None
    }
}

/// The backend used when no real VM is compiled in.
///
/// It evaluates JSON literals (so configuration-style scripts and tests work)
/// and rejects everything else with [`ScriptError::Unsupported`], which lets
/// callers degrade gracefully instead of pretending a script ran.
#[derive(Debug, Default, Clone, Copy)]
pub struct NullVm;

impl JsVm for NullVm {
    fn name(&self) -> &'static str {
        "null"
    }

    fn eval(&mut self, source: &str, origin: &str) -> Result<JsValue, ScriptError> {
        let trimmed = source.trim().trim_end_matches(';');
        if trimmed.is_empty() {
            return Ok(JsValue::Undefined);
        }
        match trimmed {
            "undefined" => return Ok(JsValue::Undefined),
            "true" => return Ok(JsValue::Bool(true)),
            "false" => return Ok(JsValue::Bool(false)),
            "null" => return Ok(JsValue::Null),
            _ => {}
        }
        serde_json::from_str::<serde_json::Value>(trimmed).map(JsValue::from).map_err(|_| {
            ScriptError::Unsupported(format!(
                "no JavaScript backend is compiled in (enable the `quickjs` feature); cannot evaluate {origin}"
            ))
        })
    }

    fn call(&mut self, function: &str, _args: &[JsValue]) -> Result<JsValue, ScriptError> {
        Err(ScriptError::Unsupported(format!(
            "cannot call `{function}` without a JavaScript backend"
        )))
    }

    fn has_pending_jobs(&self) -> bool {
        false
    }

    fn run_pending_jobs(&mut self) -> Result<usize, ScriptError> {
        Ok(0)
    }
}

/// The best available backend: QuickJS-NG when the `quickjs` feature is
/// enabled, otherwise [`NullVm`].
#[must_use]
pub fn default_vm() -> Box<dyn JsVm> {
    #[cfg(feature = "v8")]
    {
        if let Ok(vm) = crate::v8_vm::V8Vm::new() {
            return Box::new(vm);
        }
    }
    #[cfg(feature = "quickjs")]
    {
        if let Ok(vm) = crate::quickjs::QuickJsVm::new() {
            return Box::new(vm);
        }
    }
    Box::new(NullVm)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn js_value_round_trips_json_and_truthiness() {
        let v = JsValue::from(serde_json::json!({"a": [1, "x", null, true], "b": {"c": 2.5}}));
        let json: serde_json::Value = v.clone().into();
        assert_eq!(JsValue::from(json.clone()), v);
        assert_eq!(v.to_json_string(), json.to_string());
        assert!(JsValue::Number(0.0).is_truthy().not());
        assert!(JsValue::String("x".into()).is_truthy());
        assert!(!JsValue::Undefined.is_truthy());
        assert_eq!(JsValue::Undefined.to_string(), "undefined");
    }

    trait Not {
        fn not(self) -> bool;
    }
    impl Not for bool {
        fn not(self) -> bool {
            !self
        }
    }

    #[test]
    fn null_vm_handles_json_and_rejects_scripts() {
        let mut vm = NullVm;
        assert_eq!(
            vm.eval("{\"k\": [1,2]}", "<inline>").unwrap(),
            JsValue::from(serde_json::json!({"k": [1, 2]}))
        );
        assert_eq!(vm.eval("  42;", "<inline>").unwrap(), JsValue::Number(42.0));
        assert_eq!(vm.eval("", "<inline>").unwrap(), JsValue::Undefined);
        assert!(
            matches!(vm.eval("document.title", "page.js"), Err(ScriptError::Unsupported(m)) if m.contains("page.js"))
        );
        assert!(matches!(
            vm.call("f", &[]),
            Err(ScriptError::Unsupported(_))
        ));
        assert_eq!(vm.run_pending_jobs().unwrap(), 0);
        assert_eq!(
            default_vm().name(),
            if cfg!(feature = "v8") {
                "v8"
            } else if cfg!(feature = "quickjs") {
                "quickjs-ng"
            } else {
                "null"
            }
        );
    }
}
