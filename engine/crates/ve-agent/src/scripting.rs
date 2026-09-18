//! The page's script layer (plan A13): a [`JsVm`] per page, host functions
//! the page answers, a JS prelude for timers/console, and the virtual-time
//! timer scheduler that `settle()` pumps.
//!
//! Host calls are dispatched by index (see [`HOST_FUNCTIONS`]); the DOM
//! bindings of plan A14 extend the same table. Everything the script can
//! reach lives under `globalThis.__ve`; the prelude wraps it in the Web API
//! shapes scripts expect.

use std::time::Duration;

use ve_core::{Error, Result};
use ve_script::{HostApi, JsValue, JsVm, ScriptError};

use crate::page::Page;

/// Host functions in registration order — the index is the wire contract
/// between the prelude and [`HostApi::call`].
pub const HOST_FUNCTIONS: &[&str] = &[
    "log",        // 0: log(level, message)
    "setTimer",   // 1: setTimer(id, delayMs, repeat)
    "clearTimer", // 2: clearTimer(id)
    "now",        // 3: now() → virtual ms
    "dom",        // 4: dom(op, ...args) — plan A14
];

/// Longest a single script may run before the VM terminates it.
pub const SCRIPT_DEADLINE: Duration = Duration::from_secs(20);

fn script_deadline() -> Duration {
    std::env::var("VECTOR_SCRIPT_DEADLINE_SECS")
        .ok()
        .and_then(|s| s.parse().ok())
        .map(Duration::from_secs)
        .filter(|d| *d > Duration::ZERO)
        .unwrap_or(SCRIPT_DEADLINE)
}
/// `evaluate` can run a full Speedometer add/delete pass on a complex DOM.
pub const EVALUATE_DEADLINE: Duration = Duration::from_secs(60);

fn evaluate_deadline() -> Duration {
    std::env::var("VECTOR_EVALUATE_DEADLINE_SECS")
        .ok()
        .and_then(|s| s.parse().ok())
        .map(Duration::from_secs)
        .filter(|d| *d > Duration::ZERO)
        .unwrap_or(EVALUATE_DEADLINE)
}
/// Timers due within this window block `settle()` (architecture §6 cond. 2).
pub const TIMER_WINDOW_MS: u64 = 50;
/// Console lines kept per page.
const CONSOLE_CAP: usize = 200;

/// JavaScript prelude: Web API shapes over the host primitives.
pub const PRELUDE: &str = r#"(() => {
  const timers = new Map();
  let nextId = 1;
  const arm = (fn, ms, repeat, args) => {
    const id = nextId++;
    timers.set(id, { fn, args, repeat });
    __ve.setTimer(id, Math.max(0, Number(ms) || 0), repeat);
    return id;
  };
  const disarm = (id) => { if (timers.delete(id)) __ve.clearTimer(id); };
  globalThis.setTimeout = (fn, ms, ...args) => arm(fn, ms, false, args);
  globalThis.setInterval = (fn, ms, ...args) => arm(fn, ms, true, args);
  globalThis.clearTimeout = disarm;
  globalThis.clearInterval = disarm;
  globalThis.queueMicrotask = (fn) => { Promise.resolve().then(fn); };
  globalThis.requestAnimationFrame = (fn) => arm(() => fn(__ve.now()), 16, false, []);
  globalThis.cancelAnimationFrame = disarm;
  globalThis.requestIdleCallback = (fn) => arm(() => fn({ didTimeout: false, timeRemaining: () => 50 }), 1, false, []);
  globalThis.cancelIdleCallback = disarm;
  globalThis.__veFireTimer = (id) => {
    const t = timers.get(id);
    if (!t) return false;
    if (!t.repeat) timers.delete(id);
    try {
      if (typeof t.fn === "function") t.fn(...t.args);
      else (0, eval)(String(t.fn));
    } catch (e) {
      __ve.log("error", "Uncaught (in timer) " + (e && e.stack || e));
    }
    return t.repeat;
  };
  const show = (v) => {
    if (typeof v === "string") return v;
    if (v instanceof Error) return v.stack || String(v);
    try { return JSON.stringify(v); } catch { return String(v); }
  };
  const mk = (level) => (...a) => __ve.log(level, a.map(show).join(" "));
  const noop = () => {};
  globalThis.console = {
    log: mk("log"), info: mk("info"), warn: mk("warn"), error: mk("error"), debug: mk("debug"),
    trace: mk("log"), dir: mk("log"), dirxml: mk("log"), table: mk("log"),
    group: noop, groupCollapsed: noop, groupEnd: noop, time: noop, timeEnd: noop, timeLog: noop, count: noop, countReset: noop, clear: noop,
    assert: (c, ...a) => { if (!c) mk("error")("Assertion failed:", ...a); },
  };
  globalThis.performance = globalThis.performance || {};
  globalThis.performance.now = () => __ve.now();
  globalThis.performance.timeOrigin = 0;
  globalThis.performance.mark = noop;
  globalThis.performance.measure = noop;
  globalThis.performance.clearMarks = noop;
  globalThis.performance.clearMeasures = noop;
  globalThis.performance.getEntriesByType = () => [];
  globalThis.performance.getEntriesByName = () => [];
  globalThis.performance.getEntries = () => [];
  globalThis.structuredClone = globalThis.structuredClone || ((v) => JSON.parse(JSON.stringify(v)));
  const cryptoObj = globalThis.crypto || {};
  if (typeof cryptoObj.getRandomValues !== "function") {
    cryptoObj.getRandomValues = (arr) => {
      if (!arr || arr.length == null) throw new TypeError("expected typed array");
      for (let i = 0; i < arr.length; i++) arr[i] = (Math.random() * 256) | 0;
      return arr;
    };
  }
  if (typeof cryptoObj.randomUUID !== "function") {
    cryptoObj.randomUUID = () => {
      const b = new Uint8Array(16);
      cryptoObj.getRandomValues(b);
      b[6] = (b[6] & 0x0f) | 0x40;
      b[8] = (b[8] & 0x3f) | 0x80;
      const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
      return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
    };
  }
  globalThis.crypto = cryptoObj;
})();"#;

/// DOM/Web API prelude (plan A14).
pub const DOM_PRELUDE: &str = include_str!("dom_prelude.js");

/// A console line captured from the page.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ConsoleLine {
    /// `log`, `info`, `warn`, `error`, `debug`.
    pub level: String,
    /// Message text.
    pub message: String,
    /// Virtual time when logged.
    pub at_ms: u64,
}

/// Per-page script state.
pub struct Scripting {
    /// The VM (taken out of the page for the duration of a call so the page
    /// can act as the host).
    pub(crate) vm: Option<Box<dyn JsVm>>,
    /// `evaluate` steps allowed (context-level capability).
    pub(crate) allow_evaluate: bool,
    pub(crate) console: Vec<ConsoleLine>,
    /// Scripts run so far for the current document (diagnostics).
    pub(crate) scripts_run: usize,
    pub(crate) script_errors: usize,
    /// HTML task sources and page JS timers for this page (VEC-007).
    pub(crate) event_loop: ve_script::EventLoop,
}

impl std::fmt::Debug for Scripting {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Scripting")
            .field("vm", &self.vm.as_ref().map(|v| v.name()))
            .field("timers", &self.event_loop.js_timer_count())
            .field("console", &self.console.len())
            .finish_non_exhaustive()
    }
}

impl Scripting {
    pub(crate) fn new(mut vm: Box<dyn JsVm>, allow_evaluate: bool) -> Result<Self> {
        vm.set_call_deadline(Some(script_deadline()));
        vm.register_host_functions("__ve", HOST_FUNCTIONS)?;
        Ok(Self {
            vm: Some(vm),
            allow_evaluate,
            console: Vec::new(),
            scripts_run: 0,
            script_errors: 0,
            event_loop: ve_script::EventLoop::new(),
        })
    }

    /// Timers still armed.
    #[must_use]
    pub fn pending_timers(&self) -> usize {
        self.event_loop.js_timer_count()
    }

    /// Virtual due time of the earliest live timer.
    #[must_use]
    pub fn next_timer_due_ms(&self) -> Option<u64> {
        self.event_loop.next_js_timer_due_ms()
    }

    /// Reset for a new document.
    pub(crate) fn reset(&mut self) {
        self.console.clear();
        self.scripts_run = 0;
        self.script_errors = 0;
        self.event_loop = ve_script::EventLoop::new();
    }
}

/// The page as seen by host functions.
struct PageHost<'a> {
    page: &'a mut Page,
}

impl HostApi for PageHost<'_> {
    fn call(
        &mut self,
        index: usize,
        args: &[JsValue],
    ) -> std::result::Result<JsValue, ScriptError> {
        let arg_str = |i: usize| args.get(i).map(ToString::to_string).unwrap_or_default();
        let arg_num = |i: usize| args.get(i).and_then(JsValue::as_f64).unwrap_or(0.0);
        match HOST_FUNCTIONS.get(index).copied() {
            Some("log") => {
                let scripting = self.page.scripting_mut();
                if scripting.console.len() >= CONSOLE_CAP {
                    scripting.console.remove(0);
                }
                let at_ms = self.page.virtual_time_ms();
                self.page.scripting_mut().console.push(ConsoleLine {
                    level: arg_str(0),
                    message: arg_str(1),
                    at_ms,
                });
                Ok(JsValue::Undefined)
            }
            Some("setTimer") => {
                let id = arg_num(0) as u64;
                let delay = arg_num(1).max(0.0) as u64;
                let repeat = args.get(2).is_some_and(JsValue::is_truthy);
                let now = self.page.virtual_time_ms();
                self.page
                    .scripting_mut()
                    .event_loop
                    .arm_js_timer(id, now, delay, repeat);
                Ok(JsValue::Undefined)
            }
            Some("clearTimer") => {
                let id = arg_num(0) as u64;
                self.page.scripting_mut().event_loop.clear_js_timer(id);
                Ok(JsValue::Undefined)
            }
            Some("now") => Ok(JsValue::Number(self.page.virtual_time_ms() as f64)),
            Some("dom") => {
                crate::dom::host_call(self.page, &arg_str(0), args.get(1..).unwrap_or(&[]))
            }
            _ => Err(ScriptError::Unsupported(format!("host function #{index}"))),
        }
    }
}

impl Page {
    /// Turns scripting on for this page with `vm`; `allow_evaluate` gates the
    /// `evaluate` step (architecture §10 capability gating). Installs the
    /// host functions and the prelude.
    pub fn enable_scripting(&mut self, vm: Box<dyn JsVm>, allow_evaluate: bool) -> Result<()> {
        let scripting = Scripting::new(vm, allow_evaluate)?;
        self.scripting = Some(scripting);
        // DOM prelude is large; do not apply the per-script cutoff until it
        // has installed. Document scripts keep `SCRIPT_DEADLINE`.
        if let Some(vm) = self.scripting.as_mut().and_then(|s| s.vm.as_mut()) {
            vm.set_call_deadline(Some(Duration::from_secs(120)));
        }
        self.run_script(PRELUDE, "vector:prelude")?;
        self.run_script(DOM_PRELUDE, "vector:dom")?;
        if let Some(vm) = self.scripting.as_mut().and_then(|s| s.vm.as_mut()) {
            vm.set_call_deadline(Some(script_deadline()));
        }
        Ok(())
    }

    /// Whether a VM is attached.
    #[must_use]
    pub fn scripting_enabled(&self) -> bool {
        self.scripting.is_some()
    }

    /// Whether `evaluate` steps may run.
    #[must_use]
    pub fn allow_evaluate(&self) -> bool {
        self.scripting.as_ref().is_some_and(|s| s.allow_evaluate)
    }

    /// Console output captured from page scripts.
    #[must_use]
    pub fn console(&self) -> &[ConsoleLine] {
        self.scripting
            .as_ref()
            .map_or(&[], |s| s.console.as_slice())
    }

    /// `(scripts run, scripts that threw)` for the current document.
    #[must_use]
    pub fn script_stats(&self) -> (usize, usize) {
        self.scripting
            .as_ref()
            .map_or((0, 0), |s| (s.scripts_run, s.script_errors))
    }

    pub(crate) fn scripting_mut(&mut self) -> &mut Scripting {
        self.scripting.as_mut().expect("scripting enabled")
    }

    /// Evaluates `source` with the page as host. The VM is taken out of the
    /// page for the call so host functions can borrow the page mutably.
    pub(crate) fn run_script(&mut self, source: &str, origin: &str) -> Result<JsValue> {
        let Some(mut vm) = self.scripting.as_mut().and_then(|s| s.vm.take()) else {
            return Err(Error::capability_unsupported(
                "scripting is not enabled on this page",
            ));
        };
        // `evaluate()` sets EVALUATE_DEADLINE first. Do not clobber it with
        // the shorter document-script cutoff.
        if origin != "vector:prelude" && origin != "vector:dom" && origin != "vector:evaluate" {
            vm.set_call_deadline(Some(script_deadline()));
        }
        let result = vm.eval_with_host(&mut PageHost { page: self }, source, origin);
        let _ = vm.run_pending_jobs_with_host(&mut PageHost { page: self });
        if let Some(s) = self.scripting.as_mut() {
            s.vm = Some(vm);
        }
        self.flush_observers();
        if !self.pending_write_scripts.is_empty() {
            self.flush_document_write_scripts();
        }
        result.map_err(Error::from)
    }

    fn flush_document_write_scripts(&mut self) {
        loop {
            let batch = std::mem::take(&mut self.pending_write_scripts);
            if batch.is_empty() {
                break;
            }
            for (id, source) in batch {
                if self.scripts_executed.contains(&id) {
                    continue;
                }
                self.scripts_executed.insert(id);
                let _ = self.call_script("__veSetCurrentScript", &[crate::dom::pack(id)]);
                let origin = format!("{}#document.write", self.url());
                match self.run_script(&source, &origin) {
                    Ok(_) => {
                        let _ = self.call_script("__veSetCurrentScript", &[JsValue::Null]);
                        self.dispatch_js_event(id, "load", false, false, None);
                    }
                    Err(_) => {
                        let _ = self.call_script("__veSetCurrentScript", &[JsValue::Null]);
                        self.dispatch_js_event(id, "error", false, false, None);
                    }
                }
            }
        }
    }

    /// Drains pending V8 jobs (microtasks, promises) without evaluating new source.
    pub(crate) fn drain_js_jobs(&mut self) {
        let Some(mut vm) = self.scripting.as_mut().and_then(|s| s.vm.take()) else {
            return;
        };
        let _ = vm.run_pending_jobs_with_host(&mut PageHost { page: self });
        if let Some(s) = self.scripting.as_mut() {
            s.vm = Some(vm);
        }
    }

    /// Calls a global (dotted) function with the page as host.
    pub(crate) fn call_script(&mut self, function: &str, args: &[JsValue]) -> Result<JsValue> {
        let Some(mut vm) = self.scripting.as_mut().and_then(|s| s.vm.take()) else {
            return Err(Error::capability_unsupported(
                "scripting is not enabled on this page",
            ));
        };
        let result = vm.call_with_host(&mut PageHost { page: self }, function, args);
        let _ = vm.run_pending_jobs_with_host(&mut PageHost { page: self });
        if let Some(s) = self.scripting.as_mut() {
            s.vm = Some(vm);
        }
        result.map_err(Error::from)
    }

    /// The `evaluate` step: a JSON-shaped result of `expression`.
    pub fn evaluate(&mut self, expression: &str) -> Result<serde_json::Value> {
        if !self.allow_evaluate() {
            return Err(Error::capability_unsupported(
                "evaluate needs a context created with allowEvaluate",
            ));
        }
        self.ensure_document_scripts();
        if let Some(vm) = self.scripting.as_mut().and_then(|s| s.vm.as_mut()) {
            vm.set_call_deadline(Some(evaluate_deadline()));
        }
        let result = self.run_script(expression, "vector:evaluate");
        self.drain_js_jobs();
        if let Some(vm) = self.scripting.as_mut().and_then(|s| s.vm.as_mut()) {
            vm.set_call_deadline(Some(script_deadline()));
        }
        result.map(serde_json::Value::from)
    }

    /// Runs the document's scripts in order: classic scripts as parsed
    /// (`async` immediately, since there is no streaming parser to race),
    /// `defer` and module scripts after. Errors are counted and logged to
    /// the console, never propagated: one broken third-party script must
    /// not fail the load.
    pub(crate) fn run_document_scripts(&mut self) {
        if self.scripting.is_none() {
            return;
        }
        self.parse_hi = self.doc.arena_len();
        self.expect_body_started = false;
        self.snapshot_head_expect_links();
        let scripts = self.scripts().to_vec();
        let mut delayed = Vec::new();
        let mut prev_limit: Option<ve_core::NodeId> = None;
        for script in &scripts {
            if script.defer || script.module || script.async_ {
                delayed.push(script.clone());
                continue;
            }
            self.parser_limit = Some(script.node);
            self.reveal_parser_progress(prev_limit);
            prev_limit = Some(script.node);
            let _ = self.call_script("__veApplyPartialUpdates", &[]);
            let in_head = self.expect_link_in_head(script.node);
            let _ = self.expect_blocking_active();
            if self.in_browsing_tree(script.node) {
                self.eval_document_script(script);
            }
            let _ = self.call_script("__veApplyPartialUpdates", &[]);
            if in_head {
                self.snapshot_head_expect_links();
            } else {
                self.expect_body_started = true;
            }
            if !in_head {
                self.drain_js_jobs();
                let pending_blocking = delayed.iter().any(|s| {
                    self.resource_is_render_blocking(s.node) && self.in_browsing_tree(s.node)
                }) || self
                    .call_script("__veHasPendingBlocking", &[])
                    .ok()
                    .is_some_and(|v| v.is_truthy());
                if !self.expect_blocking_active() && !pending_blocking {
                    self.pump_timers(TIMER_WINDOW_MS);
                }
            }
        }
        self.parser_limit = None;
        self.reveal_parser_progress(prev_limit);
        let _ = self.call_script("__veApplyPartialUpdates", &[]);
        for script in &scripts {
            if !script.defer
                && !script.module
                && !script.async_
                && self.in_browsing_tree(script.node)
            {
                self.eval_document_script(script);
            }
        }
        let mut later = Vec::new();
        for script in delayed {
            if !self.in_browsing_tree(script.node) {
                self.scripts_executed.insert(script.node);
                continue;
            }
            if self.resource_is_render_blocking(script.node) {
                self.eval_document_script(&script);
            } else {
                later.push(script);
            }
        }
        let _ = self.call_script("__veFlushPendingResources", &[JsValue::Bool(true)]);
        let _ = self.call_script("__veRunFrameScripts", &[]);
        self.drain_js_jobs();
        let _ = self.call_script("__veUpgradeTree", &[]);
        for script in later {
            if self.in_browsing_tree(script.node) {
                self.eval_document_script(&script);
            } else {
                self.scripts_executed.insert(script.node);
            }
        }
        let _ = self.call_script("__veFlushPendingResources", &[JsValue::Bool(false)]);
        self.drain_js_jobs();
        // After deferred/module scripts, matching HTML's delayed load event.
        let _ = self.call_script("__veDocumentEvents", &[]);
        let _ = self.call_script("__veExposeIds", &[]);
        self.drain_js_jobs();
        // Load handlers may restyle a large tree (official Complex-DOM).
        // Do not leave that work on SCRIPT_DEADLINE; it aborts setView.
        if let Some(vm) = self.scripting.as_mut().and_then(|s| s.vm.as_mut()) {
            vm.set_call_deadline(Some(evaluate_deadline()));
        }
        let _ = self.call_script("__veFireWindowLoad", &[]);
        if let Some(vm) = self.scripting.as_mut().and_then(|s| s.vm.as_mut()) {
            vm.set_call_deadline(Some(script_deadline()));
        }
        self.drain_js_jobs();
        self.pump_timers(TIMER_WINDOW_MS);
    }

    fn eval_document_script(&mut self, script: &crate::page::FetchedScript) {
        if self.scripts_executed.contains(&script.node) {
            return;
        }
        if self
            .call_script("__veScriptRan", &[crate::dom::pack(script.node)])
            .ok()
            .is_some_and(|v| v.is_truthy())
        {
            self.scripts_executed.insert(script.node);
            return;
        }
        self.scripts_executed.insert(script.node);
        if script.failed {
            self.dispatch_js_event(script.node, "error", false, false, None);
            if let Some(onerror) = self
                .doc
                .attribute(script.node, "onerror")
                .filter(|s| !s.is_empty())
                .map(str::to_owned)
            {
                let _ = self.call_script("__veSetCurrentScript", &[JsValue::Null]);
                let _ = self.run_script(&onerror, "vector:onerror");
            }
            self.drain_js_jobs();
            return;
        }
        let origin = script
            .url
            .clone()
            .unwrap_or_else(|| format!("{}#inline", self.url()));
        let mut source = script.source.clone();
        if script.module {
            let rewritten =
                self.call_script("__veRewriteModule", &[JsValue::from(source.as_str())]);
            if let Ok(JsValue::String(s)) = rewritten {
                source = s;
            }
        }
        if !script.module {
            let _ = self.call_script("__veSetCurrentScript", &[crate::dom::pack(script.node)]);
        }
        let _ = self.call_script("__veExposeIds", &[]);
        match self.run_script(&source, &origin) {
            Ok(_) => self.scripting_mut().scripts_run += 1,
            Err(e) => {
                let s = self.scripting_mut();
                s.scripts_run += 1;
                s.script_errors += 1;
                if s.console.len() >= CONSOLE_CAP {
                    s.console.remove(0);
                }
                let at_ms = self.virtual_time_ms();
                self.scripting_mut().console.push(ConsoleLine {
                    level: "error".into(),
                    message: format!("{origin}: {e}"),
                    at_ms,
                });
                let _ = self.call_script("__veSetCurrentScript", &[JsValue::Null]);
                self.dispatch_js_event(script.node, "error", false, false, None);
                self.drain_js_jobs();
                return;
            }
        }
        let _ = self.call_script("__veSetCurrentScript", &[JsValue::Null]);
        self.dispatch_js_event(script.node, "load", false, false, None);
        self.drain_js_jobs();
    }

    /// Fires every live timer due within `window_ms` of virtual time,
    /// advancing the clock to each; runs microtasks after each. Returns how
    /// many timers fired. Timers that re-arm themselves inside the window
    /// keep firing until the window is exhausted (bounded by `max_fires`).
    pub(crate) fn pump_timers(&mut self, window_ms: u64) -> usize {
        let Some(scripting) = self.scripting.as_ref() else {
            return 0;
        };
        if scripting.event_loop.js_timer_count() == 0 {
            self.drain_js_jobs();
            return 0;
        }
        let horizon = self.virtual_time_ms().saturating_add(window_ms);
        let max_fires = 1000;
        let mut fired = 0;
        while fired < max_fires {
            let next = self.scripting_mut().event_loop.pop_due_js_timer(horizon);
            let Some(timer) = next else { break };
            let now = self.virtual_time_ms();
            if timer.due_ms > now {
                self.advance_virtual_time(timer.due_ms - now);
            }
            match timer.repeat_ms {
                Some(period) => {
                    self.scripting_mut().event_loop.rearm_js_interval(
                        timer.id,
                        timer.due_ms,
                        period,
                    );
                }
                None => {
                    self.scripting_mut().event_loop.drop_js_timer(timer.id);
                }
            }
            fired += 1;
            if let Err(e) = self.call_script("__veFireTimer", &[JsValue::Number(timer.id as f64)]) {
                tracing::debug!(error = %e, "timer callback failed");
            }
            if self.script_readiness().2 {
                self.drain_js_jobs();
            }
        }
        fired
    }

    /// Script-related readiness inputs for `settle()`: `(timers due within
    /// the window, timers armed beyond it, microtasks pending)`.
    pub(crate) fn script_readiness(&self) -> (usize, usize, bool) {
        let Some(s) = self.scripting.as_ref() else {
            return (0, 0, false);
        };
        let horizon = self.virtual_time_ms().saturating_add(TIMER_WINDOW_MS);
        let (soon, later) = s.event_loop.js_timer_readiness(horizon);
        (
            soon,
            later,
            s.vm.as_ref().is_some_and(|vm| vm.has_pending_jobs()),
        )
    }
}
