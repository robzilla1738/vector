//! The page's script layer (plan A13): a [`JsVm`] per page, host functions
//! the page answers, a JS prelude for timers/console, and the virtual-time
//! timer scheduler that `settle()` pumps.
//!
//! Host calls are dispatched by index (see [`HOST_FUNCTIONS`]); the DOM
//! bindings of plan A14 extend the same table. Everything the script can
//! reach lives under `globalThis.__ve`; the prelude wraps it in the Web API
//! shapes scripts expect.

use std::collections::HashSet;
use std::time::Duration;

fn fill_random(buf: &mut [u8]) {
    if buf.is_empty() {
        return;
    }
    #[cfg(unix)]
    {
        if let Ok(mut f) = std::fs::File::open("/dev/urandom") {
            use std::io::Read;
            if f.read_exact(buf).is_ok() {
                return;
            }
        }
    }
    let mut x = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_nanos() as u64)
        .unwrap_or(0x9e37_79b9_7f4a_7c15);
    for b in buf.iter_mut() {
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        *b = (x & 0xff) as u8;
    }
}

use ve_core::{Error, Result};
use ve_script::{HostApi, JsValue, JsVm, ScriptError};

use crate::page::Page;

/// Host functions in registration order — the index is the wire contract
/// between the prelude and [`HostApi::call`].
pub const HOST_FUNCTIONS: &[&str] = &[
    "log",        // 0: log(level, message)
    "setTimer",   // 1: setTimer(delayMs, repeat, fn, args) → id
    "clearTimer", // 2: clearTimer(id)
    "now",        // 3: now() → virtual ms
    "dom",          // 4: dom(op, ...args) — plan A14
    "randomBytes",  // 5: randomBytes(n) → number[] CSPRNG
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
  const arm = (fn, ms, repeat, args) =>
    __ve.setTimer(Math.max(0, Number(ms) || 0), repeat, fn, args);
  const disarm = (id) => { if (id !== undefined && id !== null) __ve.clearTimer(id); };
  globalThis.setTimeout = function setTimeout(fn) {
    const ms = arguments.length > 1 ? arguments[1] : 0;
    const args = Array.prototype.slice.call(arguments, 2);
    return arm(fn, ms, false, args);
  };
  globalThis.setInterval = function setInterval(fn) {
    const ms = arguments.length > 1 ? arguments[1] : 0;
    const args = Array.prototype.slice.call(arguments, 2);
    return arm(fn, ms, true, args);
  };
  globalThis.clearTimeout = function clearTimeout() {
    if (arguments.length) disarm(arguments[0]);
  };
  globalThis.clearInterval = function clearInterval() {
    if (arguments.length) disarm(arguments[0]);
  };
  globalThis.queueMicrotask = function queueMicrotask(fn) { Promise.resolve().then(fn); };
  globalThis.requestAnimationFrame = function requestAnimationFrame(fn) {
    return arm(function () { fn(__ve.now()); }, 0, false, []);
  };
  globalThis.cancelAnimationFrame = function cancelAnimationFrame(id) { disarm(id); };
  globalThis.requestIdleCallback = (fn) => arm(function () {
    fn({ didTimeout: false, timeRemaining: () => 50 });
  }, 1, false, []);
  globalThis.cancelIdleCallback = disarm;
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
  const marks = new Map();
  const measures = [];
  globalThis.performance = globalThis.performance || {};
  globalThis.performance.now = () => __ve.now();
  globalThis.performance.timeOrigin = 0;
  globalThis.performance.mark = (name) => { marks.set(String(name), __ve.now()); return { name: String(name), entryType: "mark", startTime: marks.get(String(name)), duration: 0 }; };
  globalThis.performance.measure = (name, start, end) => {
    const s = typeof start === "string" ? (marks.get(start) ?? 0) : (typeof start === "number" ? start : 0);
    const e = typeof end === "string" ? (marks.get(end) ?? __ve.now()) : (typeof end === "number" ? end : __ve.now());
    const entry = { name: String(name), entryType: "measure", startTime: s, duration: e - s };
    measures.push(entry);
    return entry;
  };
  globalThis.performance.clearMarks = (name) => { if (name == null) marks.clear(); else marks.delete(String(name)); };
  globalThis.performance.clearMeasures = (name) => {
    if (name == null) measures.length = 0;
    else { for (let i = measures.length - 1; i >= 0; i--) if (measures[i].name === String(name)) measures.splice(i, 1); }
  };
  globalThis.performance.getEntriesByType = (type) => {
    if (type === "mark") return [...marks.entries()].map(([name, startTime]) => ({ name, entryType: "mark", startTime, duration: 0 }));
    if (type === "measure") return measures.slice();
    return [];
  };
  globalThis.performance.getEntriesByName = (name, type) => globalThis.performance.getEntriesByType(type || "measure").filter((e) => e.name === name);
  globalThis.performance.getEntries = () => globalThis.performance.getEntriesByType("mark").concat(measures);
  const cloneSeen = () => new WeakMap();
  const cloneValue = (v, seen) => {
    if (typeof v === "function") throw new TypeError("structuredClone: functions are not cloneable");
    if (v == null || typeof v !== "object") return v;
    if (seen.has(v)) return seen.get(v);
    if (v instanceof Date) return new Date(v.getTime());
    if (Array.isArray(v)) {
      const out = [];
      seen.set(v, out);
      for (let i = 0; i < v.length; i++) out[i] = cloneValue(v[i], seen);
      return out;
    }
    const out = {};
    seen.set(v, out);
    for (const k of Object.keys(v)) out[k] = cloneValue(v[k], seen);
    return out;
  };
  globalThis.structuredClone = globalThis.structuredClone || ((v) => cloneValue(v, cloneSeen()));
  const cryptoObj = globalThis.crypto || {};
  if (typeof cryptoObj.getRandomValues !== "function") {
    cryptoObj.getRandomValues = (arr) => {
      if (!arr || arr.length == null) throw new TypeError("expected typed array");
      const n = arr.length;
      const bytes = (typeof __ve.randomBytes === "function") ? __ve.randomBytes(n) : null;
      if (bytes && bytes.length === n) {
        for (let i = 0; i < n; i++) arr[i] = bytes[i] & 0xff;
        return arr;
      }
      throw new TypeError("crypto.getRandomValues: CSPRNG unavailable");
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
  if (!cryptoObj.subtle || typeof cryptoObj.subtle.digest !== "function") {
    const rotr = (x, n) => (x >>> n) | (x << (32 - n));
    const sha256 = (bytes) => {
      const K = [
        0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
        0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
        0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
        0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
        0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
        0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
        0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
        0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
      ];
      const bitLen = bytes.length * 8;
      const pad = ((bytes.length + 9 + 63) & ~63);
      const m = new Uint8Array(pad);
      m.set(bytes);
      m[bytes.length] = 0x80;
      const view = new DataView(m.buffer);
      view.setUint32(pad - 4, bitLen >>> 0);
      let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
      let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
      const w = new Uint32Array(64);
      for (let i = 0; i < pad; i += 64) {
        for (let t = 0; t < 16; t++) w[t] = view.getUint32(i + t * 4);
        for (let t = 16; t < 64; t++) {
          const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
          const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
          w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
        }
        let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
        for (let t = 0; t < 64; t++) {
          const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
          const ch = (e & f) ^ ((~e) & g);
          const t1 = (h + S1 + ch + K[t] + w[t]) >>> 0;
          const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
          const maj = (a & b) ^ (a & c) ^ (b & c);
          const t2 = (S0 + maj) >>> 0;
          h = g; g = f; f = e; e = (d + t1) >>> 0;
          d = c; c = b; b = a; a = (t1 + t2) >>> 0;
        }
        h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
        h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
      }
      const out = new Uint8Array(32);
      const ov = new DataView(out.buffer);
      ov.setUint32(0, h0); ov.setUint32(4, h1); ov.setUint32(8, h2); ov.setUint32(12, h3);
      ov.setUint32(16, h4); ov.setUint32(20, h5); ov.setUint32(24, h6); ov.setUint32(28, h7);
      return out;
    };
    cryptoObj.subtle = {
      digest(algo, data) {
        const name = String(algo && algo.name ? algo.name : algo).replace(/-/g, "").toUpperCase();
        if (name !== "SHA256") {
          return Promise.reject(new DOMException("algorithm not supported", "NotSupportedError"));
        }
        let bytes;
        if (data instanceof ArrayBuffer) bytes = new Uint8Array(data);
        else if (data && data.buffer) bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        else bytes = new Uint8Array(0);
        const digest = sha256(bytes);
        return Promise.resolve(digest.buffer.slice(digest.byteOffset, digest.byteOffset + digest.byteLength));
      },
    };
  }
  globalThis.crypto = cryptoObj;
})();"#;

/// DOM/Web API prelude (plan A14).
pub const DOM_PRELUDE: &str = include_str!("dom_prelude.js");

/// Official `BrowserBench` clocks with `performance.now()`. Default `__ve.now()`
/// is virtual (WPT/settle). `VECTOR_PERFORMANCE_NOW=wall` rebases onto
/// `Date.now()` so official-score can time with the official API without
/// changing WPT virtual time. Do not add a host function: `Date.now()` is
/// already wall and `HOST_FUNCTIONS` indices are a wire contract.
const WALL_PERFORMANCE_NOW: &str = r#"(() => {
  const origin = Date.now();
  globalThis.performance.now = () => Date.now() - origin;
  globalThis.performance.timeOrigin = origin;
})();"#;

/// True when this process asked for wall-backed `performance.now()`.
#[must_use]
pub fn performance_now_is_wall() -> bool {
    matches!(
        std::env::var("VECTOR_PERFORMANCE_NOW").as_deref(),
        Ok("wall")
    )
}

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
        if let Some(vm) = self.vm.as_mut() {
            vm.clear_timer_callbacks();
        }
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
                let delay = arg_num(0).max(0.0) as u64;
                let repeat = args.get(1).is_some_and(JsValue::is_truthy);
                let now = self.page.virtual_time_ms();
                let id = self
                    .page
                    .scripting_mut()
                    .event_loop
                    .arm_js_timer(now, delay, repeat);
                Ok(JsValue::Number(id as f64))
            }
            Some("clearTimer") => {
                let id = arg_num(0) as u64;
                self.page.scripting_mut().event_loop.clear_js_timer(id);
                Ok(JsValue::Undefined)
            }
            Some("now") => Ok(JsValue::Number(self.page.now_ms() as f64)),
            Some("dom") => {
                crate::dom::host_call(self.page, &arg_str(0), args.get(1..).unwrap_or(&[]))
            }
            Some("randomBytes") => {
                let n = arg_num(0).max(0.0) as usize;
                let n = n.min(65_536);
                let mut buf = vec![0u8; n];
                fill_random(&mut buf);
                Ok(JsValue::Array(
                    buf.into_iter()
                        .map(|b| JsValue::Number(f64::from(b)))
                        .collect(),
                ))
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
        let bindings = std::env::var("VECTOR_DOM_BINDINGS").unwrap_or_else(|_| "prelude".into());
        if bindings == "native" {
            self.install_native_dom_bindings()?;
        }
        if performance_now_is_wall() {
            self.run_script(WALL_PERFORMANCE_NOW, "vector:prelude")?;
        }
        if let Some(vm) = self.scripting.as_mut().and_then(|s| s.vm.as_mut()) {
            vm.set_call_deadline(Some(script_deadline()));
        }
        Ok(())
    }

    /// Overlay native V8 accessors on the prelude DOM (H1-B1). Default-on waits for H3-2.
    pub fn install_native_dom_bindings(&mut self) -> Result<()> {
        let Some(mut vm) = self.scripting.as_mut().and_then(|s| s.vm.take()) else {
            return Err(Error::capability_unsupported(
                "scripting is not enabled on this page",
            ));
        };
        let result = vm.install_native_dom_bindings();
        if let Some(s) = self.scripting.as_mut() {
            s.vm = Some(vm);
        }
        result.map_err(Error::from)
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
        if !self.pending_module_scripts.is_empty() {
            self.flush_pending_modules();
        }
        result.map_err(Error::from)
    }

    fn flush_pending_modules(&mut self) {
        let batch = std::mem::take(&mut self.pending_module_scripts);
        for source in batch {
            let origin = format!("module:{}#inserted", self.url());
            let _ = self.run_script(&source, &origin);
        }
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

    /// Fires a timer callback stored on the VM (H1-A3: no prelude Map).
    fn fire_timer_callback(&mut self, id: u64) -> Result<JsValue> {
        let Some(mut vm) = self.scripting.as_mut().and_then(|s| s.vm.take()) else {
            return Err(Error::capability_unsupported(
                "scripting is not enabled on this page",
            ));
        };
        let result = vm.fire_timer_callback(&mut PageHost { page: self }, id);
        let _ = vm.run_pending_jobs_with_host(&mut PageHost { page: self });
        if let Some(s) = self.scripting.as_mut() {
            s.vm = Some(vm);
        }
        result.map_err(Error::from)
    }

    fn drop_timer_callback(&mut self, id: u64) {
        if let Some(vm) = self.scripting.as_mut().and_then(|s| s.vm.as_mut()) {
            vm.drop_timer_callback(id);
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
        if !self.pending_module_scripts.is_empty() {
            self.flush_pending_modules();
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
        let mut origin = script
            .url
            .clone()
            .unwrap_or_else(|| format!("{}#inline", self.url()));
        let source = script.source.clone();
        if script.module {
            self.prefetch_module_graph(&source, &origin);
            origin = format!("module:{origin}");
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

    fn prefetch_module_graph(&mut self, source: &str, base: &str) {
        let mut pending = vec![(base.to_owned(), source.to_owned())];
        let mut seen = HashSet::new();
        while let Some((url, src)) = pending.pop() {
            let key = ve_script::normalize_module_url(&url);
            if !seen.insert(key.clone()) {
                continue;
            }
            if let Some(vm) = self.scripting.as_mut().and_then(|s| s.vm.as_mut()) {
                vm.register_module(&key, &src);
            }
            for spec in ve_script::module_import_specifiers(&src) {
                let Some(resolved) = ve_script::resolve_module_specifier(&url, &spec) else {
                    continue;
                };
                if seen.contains(&ve_script::normalize_module_url(&resolved)) {
                    continue;
                }
                if let Some(body) = ve_script::decode_data_module(&resolved) {
                    pending.push((resolved, body));
                    continue;
                }
                let id = self.id();
                let fetched = self
                    .loader
                    .as_mut()
                    .and_then(|l| l.load(&crate::NavigationRequest::get(resolved.clone(), id)).ok());
                if let Some(doc) = fetched {
                    pending.push((resolved, String::from_utf8_lossy(&doc.bytes).into_owned()));
                }
            }
        }
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
        let mut raf_fired = 0;
        let mut fired = 0;
        while fired < max_fires {
            let next = self.scripting_mut().event_loop.pop_due_js_timer(horizon);
            let Some(timer) = next else { break };
            let now = self.virtual_time_ms();
            if timer.repeat_ms.is_none() && timer.due_ms <= now.saturating_add(1) {
                raf_fired += 1;
                if raf_fired > ve_script::EventLoop::MAX_RAF_DRAIN {
                    self.scripting_mut().event_loop.drop_js_timer(timer.id);
                    self.drop_timer_callback(timer.id);
                    continue;
                }
            }
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
            if let Err(e) = self.fire_timer_callback(timer.id) {
                tracing::debug!(error = %e, "timer callback failed");
                let scripting = self.scripting_mut();
                if scripting.console.len() >= CONSOLE_CAP {
                    scripting.console.remove(0);
                }
                let at_ms = self.virtual_time_ms();
                self.scripting_mut().console.push(ConsoleLine {
                    level: "error".into(),
                    message: format!("Uncaught (in timer) {e}"),
                    at_ms,
                });
            }
            if timer.repeat_ms.is_none() {
                self.drop_timer_callback(timer.id);
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

#[cfg(test)]
mod h1_a3_tests {
    use super::PRELUDE;

    #[test]
    fn prelude_does_not_keep_a_timers_map() {
        assert!(
            !PRELUDE.contains("const timers = new Map"),
            "H1-A3 retires the prelude timers Map"
        );
        assert!(
            !PRELUDE.contains("__veFireTimer"),
            "timer fire is host-owned, not a prelude callback table"
        );
        assert!(
            PRELUDE.contains("__ve.setTimer"),
            "setTimeout must still arm EventLoop via the host"
        );
    }
}
