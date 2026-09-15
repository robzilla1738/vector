//! QuickJS-NG backend via `rquickjs` (feature `quickjs`).
//!
//! One [`rquickjs::Runtime`] and one realm ([`rquickjs::Context`]) per VM.
//! Values cross the boundary through `JSON.stringify` / JSON parsing, which
//! keeps this backend tiny; DOM bindings will be registered through the
//! WebIDL pipeline as native classes rather than serialised.

use rquickjs::{Context, Ctx, Error, Runtime, Value};

use crate::vm::{JsValue, JsVm, ScriptError};

/// A QuickJS-NG virtual machine.
pub struct QuickJsVm {
    runtime: Runtime,
    context: Context,
}

impl std::fmt::Debug for QuickJsVm {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("QuickJsVm").finish_non_exhaustive()
    }
}

impl QuickJsVm {
    /// Creates a runtime with a fresh global object and the default memory
    /// limit (none) and stack size.
    pub fn new() -> Result<Self, ScriptError> {
        let runtime = Runtime::new().map_err(|e| ScriptError::Internal(e.to_string()))?;
        let context = Context::full(&runtime).map_err(|e| ScriptError::Internal(e.to_string()))?;
        Ok(Self { runtime, context })
    }

    /// Caps heap usage; scripts exceeding it fail with an exception.
    pub fn set_memory_limit(&self, bytes: usize) {
        self.runtime.set_memory_limit(bytes);
    }

    fn convert_error(ctx: &Ctx<'_>, error: Error) -> ScriptError {
        match error {
            Error::Exception => {
                let thrown = ctx.catch();
                if let Some(exception) = thrown.as_exception() {
                    ScriptError::Exception {
                        message: exception
                            .message()
                            .unwrap_or_else(|| "uncaught exception".to_owned()),
                        stack: exception.stack(),
                    }
                } else {
                    ScriptError::Exception {
                        message: format!("{thrown:?}"),
                        stack: None,
                    }
                }
            }
            other => ScriptError::Internal(other.to_string()),
        }
    }

    fn to_js_value<'js>(ctx: &Ctx<'js>, value: Value<'js>) -> Result<JsValue, ScriptError> {
        if value.is_undefined() {
            return Ok(JsValue::Undefined);
        }
        let json = ctx
            .json_stringify(value)
            .map_err(|e| Self::convert_error(ctx, e))?;
        match json {
            None => Ok(JsValue::Undefined),
            Some(s) => {
                let text = s.to_string().map_err(|e| Self::convert_error(ctx, e))?;
                serde_json::from_str::<serde_json::Value>(&text)
                    .map(JsValue::from)
                    .map_err(|e| ScriptError::Internal(format!("json bridge: {e}")))
            }
        }
    }
}

impl JsVm for QuickJsVm {
    fn name(&self) -> &'static str {
        "quickjs-ng"
    }

    fn eval(&mut self, source: &str, origin: &str) -> Result<JsValue, ScriptError> {
        let _ = origin;
        self.context.with(|ctx| {
            let value: Value<'_> = ctx.eval(source).map_err(|e| Self::convert_error(&ctx, e))?;
            Self::to_js_value(&ctx, value)
        })
    }

    fn call(&mut self, function: &str, args: &[JsValue]) -> Result<JsValue, ScriptError> {
        let json_args: Vec<String> = args.iter().map(JsValue::to_json_string).collect();
        let source = format!(
            "globalThis[{}].apply(null, [{}])",
            serde_json::to_string(function).unwrap_or_default(),
            json_args.join(",")
        );
        self.eval(&source, "<call>")
    }

    fn has_pending_jobs(&self) -> bool {
        self.runtime.is_job_pending()
    }

    fn run_pending_jobs(&mut self) -> Result<usize, ScriptError> {
        let mut count = 0;
        while self.runtime.is_job_pending() {
            match self.runtime.execute_pending_job() {
                Ok(true) => count += 1,
                Ok(false) => break,
                Err(e) => {
                    return Err(ScriptError::Exception {
                        message: format!("{e:?}"),
                        stack: None,
                    });
                }
            }
        }
        Ok(count)
    }

    fn memory_used(&self) -> Option<usize> {
        usize::try_from(self.runtime.memory_usage().malloc_size).ok()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn evaluates_scripts_and_runs_promise_jobs() {
        let mut vm = QuickJsVm::new().unwrap();
        assert_eq!(vm.eval("1 + 2", "<t>").unwrap(), JsValue::Number(3.0));
        assert_eq!(
            vm.eval("({a: [1, 'x'], b: null})", "<t>").unwrap(),
            JsValue::from(serde_json::json!({"a": [1, "x"], "b": null}))
        );
        vm.eval("globalThis.add = (a, b) => a + b; var out = 0; Promise.resolve(5).then(v => { out = v; });", "<t>").unwrap();
        assert_eq!(
            vm.call("add", &[JsValue::Number(2.0), JsValue::Number(3.0)])
                .unwrap(),
            JsValue::Number(5.0)
        );
        assert!(vm.has_pending_jobs());
        assert_eq!(vm.run_pending_jobs().unwrap(), 1);
        assert_eq!(vm.eval("out", "<t>").unwrap(), JsValue::Number(5.0));
        assert!(
            matches!(vm.eval("throw new Error('boom')", "<t>"), Err(ScriptError::Exception { message, .. }) if message.contains("boom"))
        );
        assert!(matches!(
            vm.eval("let = ;", "<t>"),
            Err(ScriptError::Exception { .. } | ScriptError::Syntax(_))
        ));
    }
}
