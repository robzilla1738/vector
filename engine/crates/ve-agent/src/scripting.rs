//! The page's script layer (plan A13): a [`JsVm`] per page, host functions
//! the page answers, a JS prelude for timers/console, and the virtual-time
//! timer scheduler that `settle()` pumps.
//!
//! Host calls are dispatched by index (see [`HOST_FUNCTIONS`]); the DOM
//! bindings of plan A14 extend the same table. Everything the script can
//! reach lives under `globalThis.__ve`; the prelude wraps it in the Web API
//! shapes scripts expect.

use std::cmp::Ordering;
use std::collections::{BinaryHeap, HashMap};
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
pub const SCRIPT_DEADLINE: Duration = Duration::from_secs(5);
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
  globalThis.performance.mark = noop; globalThis.performance.measure = noop;
  globalThis.performance.getEntriesByType = () => []; globalThis.performance.getEntriesByName = () => [];
  globalThis.structuredClone = globalThis.structuredClone || ((v) => JSON.parse(JSON.stringify(v)));
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

#[derive(Debug, Eq, PartialEq)]
struct ArmedTimer {
    due_ms: u64,
    seq: u64,
    id: u64,
    repeat_ms: Option<u64>,
}

impl Ord for ArmedTimer {
    fn cmp(&self, other: &Self) -> Ordering {
        // min-heap on (due, seq)
        other
            .due_ms
            .cmp(&self.due_ms)
            .then_with(|| other.seq.cmp(&self.seq))
    }
}

impl PartialOrd for ArmedTimer {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

/// Per-page script state.
pub struct Scripting {
    /// The VM (taken out of the page for the duration of a call so the page
    /// can act as the host).
    pub(crate) vm: Option<Box<dyn JsVm>>,
    /// `evaluate` steps allowed (context-level capability).
    pub(crate) allow_evaluate: bool,
    timers: BinaryHeap<ArmedTimer>,
    /// live timer ids → armed sequence (a cleared timer leaves a stale heap entry)
    live: HashMap<u64, u64>,
    seq: u64,
    pub(crate) console: Vec<ConsoleLine>,
    /// Scripts run so far for the current document (diagnostics).
    pub(crate) scripts_run: usize,
    pub(crate) script_errors: usize,
    /// HTML task sources for this page (VEC-007).
    pub(crate) event_loop: ve_script::EventLoop,
}

impl std::fmt::Debug for Scripting {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Scripting")
            .field("vm", &self.vm.as_ref().map(|v| v.name()))
            .field("timers", &self.live.len())
            .field("console", &self.console.len())
            .finish_non_exhaustive()
    }
}

impl Scripting {
    pub(crate) fn new(mut vm: Box<dyn JsVm>, allow_evaluate: bool) -> Result<Self> {
        vm.set_call_deadline(Some(SCRIPT_DEADLINE));
        vm.register_host_functions("__ve", HOST_FUNCTIONS)?;
        Ok(Self {
            vm: Some(vm),
            allow_evaluate,
            timers: BinaryHeap::new(),
            live: HashMap::new(),
            seq: 0,
            console: Vec::new(),
            scripts_run: 0,
            script_errors: 0,
            event_loop: ve_script::EventLoop::new(),
        })
    }

    /// Timers still armed.
    #[must_use]
    pub fn pending_timers(&self) -> usize {
        self.live.len()
    }

    /// Virtual due time of the earliest live timer.
    #[must_use]
    pub fn next_timer_due_ms(&self) -> Option<u64> {
        self.timers
            .iter()
            .filter(|t| self.live.get(&t.id) == Some(&t.seq))
            .map(|t| t.due_ms)
            .min()
    }

    fn arm(&mut self, id: u64, now_ms: u64, delay_ms: u64, repeat: bool) {
        self.seq += 1;
        self.live.insert(id, self.seq);
        self.timers.push(ArmedTimer {
            due_ms: now_ms.saturating_add(delay_ms),
            seq: self.seq,
            id,
            repeat_ms: repeat.then_some(delay_ms.max(1)),
        });
    }

    /// Reset for a new document.
    pub(crate) fn reset(&mut self) {
        self.timers.clear();
        self.live.clear();
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
                self.page.scripting_mut().arm(id, now, delay, repeat);
                Ok(JsValue::Undefined)
            }
            Some("clearTimer") => {
                let id = arg_num(0) as u64;
                self.page.scripting_mut().live.remove(&id);
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
        self.run_script(PRELUDE, "vector:prelude")?;
        self.run_script(DOM_PRELUDE, "vector:dom")?;
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
        let result = vm.eval_with_host(&mut PageHost { page: self }, source, origin);
        let _ = vm.run_pending_jobs_with_host(&mut PageHost { page: self });
        if let Some(s) = self.scripting.as_mut() {
            s.vm = Some(vm);
        }
        self.flush_observers();
        result.map_err(Error::from)
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
        self.run_script(expression, "vector:evaluate")
            .map(serde_json::Value::from)
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
        let scripts = self.scripts().to_vec();
        let (deferred, immediate): (Vec<_>, Vec<_>) =
            scripts.into_iter().partition(|s| s.defer || s.module);
        for script in immediate.into_iter().chain(deferred) {
            if script.failed || script.source.trim().is_empty() {
                continue;
            }
            let origin = script
                .url
                .clone()
                .unwrap_or_else(|| format!("{}#inline", self.url()));
            match self.run_script(&script.source, &origin) {
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
                }
            }
        }
        self.pump_timers(TIMER_WINDOW_MS);
    }

    /// Fires every live timer due within `window_ms` of virtual time,
    /// advancing the clock to each; runs microtasks after each. Returns how
    /// many timers fired. Timers that re-arm themselves inside the window
    /// keep firing until the window is exhausted (bounded by `max_fires`).
    pub(crate) fn pump_timers(&mut self, window_ms: u64) -> usize {
        let Some(scripting) = self.scripting.as_ref() else {
            return 0;
        };
        if scripting.live.is_empty() {
            self.drain_js_jobs();
            return 0;
        }
        let horizon = self.virtual_time_ms().saturating_add(window_ms);
        let max_fires = 1000;
        let mut fired = 0;
        while fired < max_fires {
            let next = {
                let s = self.scripting_mut();
                loop {
                    match s.timers.peek() {
                        None => break None,
                        Some(t) if s.live.get(&t.id) != Some(&t.seq) => {
                            s.timers.pop();
                        }
                        Some(t) if t.due_ms > horizon => break None,
                        Some(_) => break s.timers.pop(),
                    }
                }
            };
            let Some(timer) = next else { break };
            let now = self.virtual_time_ms();
            if timer.due_ms > now {
                self.advance_virtual_time(timer.due_ms - now);
            }
            match timer.repeat_ms {
                Some(period) => {
                    let due = timer.due_ms;
                    let s = self.scripting_mut();
                    s.seq += 1;
                    let seq = s.seq;
                    s.live.insert(timer.id, seq);
                    s.timers.push(ArmedTimer {
                        due_ms: due.saturating_add(period),
                        seq,
                        id: timer.id,
                        repeat_ms: Some(period),
                    });
                }
                None => {
                    self.scripting_mut().live.remove(&timer.id);
                }
            }
            fired += 1;
            if let Err(e) = self.call_script("__veFireTimer", &[JsValue::Number(timer.id as f64)]) {
                tracing::debug!(error = %e, "timer callback failed");
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
        let mut soon = 0;
        let mut later = 0;
        for t in s
            .timers
            .iter()
            .filter(|t| s.live.get(&t.id) == Some(&t.seq))
        {
            if t.due_ms <= horizon {
                soon += 1;
            } else {
                later += 1;
            }
        }
        (
            soon,
            later,
            s.vm.as_ref().is_some_and(|vm| vm.has_pending_jobs()),
        )
    }
}
