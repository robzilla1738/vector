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
    if (type === "navigation") {
      return [{
        name: (globalThis.location && globalThis.location.href) || "",
        entryType: "navigation",
        initiatorType: "navigation",
        startTime: 0,
        duration: __ve.now(),
        type: "navigate",
        transferSize: 0,
        encodedBodySize: 0,
        decodedBodySize: 0,
      }];
    }
    return [];
  };
  globalThis.performance.getEntriesByName = (name, type) => globalThis.performance.getEntriesByType(type || "measure").filter((e) => e.name === name);
  globalThis.performance.getEntries = () => globalThis.performance.getEntriesByType("mark").concat(measures).concat(globalThis.performance.getEntriesByType("navigation"));
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
    const toBytes = (data) => {
      if (data instanceof ArrayBuffer) return new Uint8Array(data);
      if (data && data.buffer) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
      return new Uint8Array(0);
    };
    const sha1 = (bytes) => {
      const bitLen = bytes.length * 8;
      const pad = ((bytes.length + 9 + 63) & ~63);
      const m = new Uint8Array(pad);
      m.set(bytes);
      m[bytes.length] = 0x80;
      const view = new DataView(m.buffer);
      view.setUint32(pad - 4, bitLen >>> 0);
      let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
      const w = new Uint32Array(80);
      for (let i = 0; i < pad; i += 64) {
        for (let t = 0; t < 16; t++) w[t] = view.getUint32(i + t * 4);
        for (let t = 16; t < 80; t++) w[t] = rotr(w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16], 31);
        let a = h0, b = h1, c = h2, d = h3, e = h4;
        for (let t = 0; t < 80; t++) {
          const f = t < 20 ? ((b & c) | ((~b) & d)) + 0x5a827999
            : t < 40 ? (b ^ c ^ d) + 0x6ed9eba1
            : t < 60 ? ((b & c) | (b & d) | (c & d)) + 0x8f1bbcdc
            : (b ^ c ^ d) + 0xca62c1d6;
          const temp = (rotr(a, 27) + f + e + w[t]) >>> 0;
          e = d; d = c; c = rotr(b, 2); b = a; a = temp;
        }
        h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0;
        h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
      }
      const out = new Uint8Array(20);
      const ov = new DataView(out.buffer);
      ov.setUint32(0, h0); ov.setUint32(4, h1); ov.setUint32(8, h2);
      ov.setUint32(12, h3); ov.setUint32(16, h4);
      return out;
    };
    const sha512WithIv = (bytes, iv) => {
      const MASK = 0xffffffffffffffffn;
      const rotr = (x, n) => ((x >> n) | (x << (64n - n))) & MASK;
      const add = (a, b) => (a + b) & MASK;
      const K = [
        0x428a2f98d728ae22n,0x7137449123ef65cdn,0xb5c0fbcfec4d3b2fn,0xe9b5dba58189dbbcn,
        0x3956c25bf348b538n,0x59f111f1b605d019n,0x923f82a4af194f9bn,0xab1c5ed5da6d8118n,
        0xd807aa98a3030242n,0x12835b0145706fben,0x243185be4ee4b28cn,0x550c7dc3d5ffb4e2n,
        0x72be5d74f27b896fn,0x80deb1fe3b1696b1n,0x9bdc06a725c71235n,0xc19bf174cf692694n,
        0xe49b69c19ef14ad2n,0xefbe4786384f25e3n,0x0fc19dc68b8cd5b5n,0x240ca1cc77ac9c65n,
        0x2de92c6f592b0275n,0x4a7484aa6ea6e483n,0x5cb0a9dcbd41fbd4n,0x76f988da831153b5n,
        0x983e5152ee66dfabn,0xa831c66d2db43210n,0xb00327c898fb213fn,0xbf597fc7beef0ee4n,
        0xc6e00bf33da88fc2n,0xd5a79147930aa725n,0x06ca6351e003826fn,0x142929670a0e6e70n,
        0x27b70a8546d22ffcn,0x2e1b21385c26c926n,0x4d2c6dfc5ac42aedn,0x53380d139d95b3dfn,
        0x650a73548baf63den,0x766a0abb3c77b2a8n,0x81c2c92e47edaee6n,0x92722c851482353bn,
        0xa2bfe8a14cf10364n,0xa81a664bbc423001n,0xc24b8b70d0f89791n,0xc76c51a30654be30n,
        0xd192e819d6ef5218n,0xd69906245565a910n,0xf40e35855771202an,0x106aa07032bbd1b8n,
        0x19a4c116b8d2d0c8n,0x1e376c085141ab53n,0x2748774cdf8eeb99n,0x34b0bcb5e19b48a8n,
        0x391c0cb3c5c95a63n,0x4ed8aa4ae3418acbn,0x5b9cca4f7763e373n,0x682e6ff3d6b2b8a3n,
        0x748f82ee5defb2fcn,0x78a5636f43172f60n,0x84c87814a1f0ab72n,0x8cc702081a6439ecn,
        0x90befffa23631e28n,0xa4506cebde82bde9n,0xbef9a3f7b2c67915n,0xc67178f2e372532bn,
        0xca273eceea26619cn,0xd186b8c721c0c207n,0xeada7dd6cde0eb1en,0xf57d4f7fee6ed178n,
        0x06f067aa72176fban,0x0a637dc5a2c898a6n,0x113f9804bef90daen,0x1b710b35131c471bn,
        0x28db77f523047d84n,0x32caab7b40c72493n,0x3c9ebe0a15c9bebcn,0x431d67c49c100d4cn,
        0x4cc5d4becb3e42b6n,0x597f299cfc657e2an,0x5fcb6fab3ad6faecn,0x6c44198c4a475817n
      ];
      const bitLen = BigInt(bytes.length) * 8n;
      const pad = ((bytes.length + 17 + 127) & ~127);
      const m = new Uint8Array(pad);
      m.set(bytes);
      m[bytes.length] = 0x80;
      const view = new DataView(m.buffer);
      view.setUint32(pad - 4, Number(bitLen & 0xffffffffn));
      view.setUint32(pad - 8, Number((bitLen >> 32n) & 0xffffffffn));
      let h0 = iv[0], h1 = iv[1], h2 = iv[2], h3 = iv[3];
      let h4 = iv[4], h5 = iv[5], h6 = iv[6], h7 = iv[7];
      const w = new Array(80);
      for (let i = 0; i < pad; i += 128) {
        for (let t = 0; t < 16; t++) {
          const hi = view.getUint32(i + t * 8);
          const lo = view.getUint32(i + t * 8 + 4);
          w[t] = (BigInt(hi) << 32n) | BigInt(lo);
        }
        for (let t = 16; t < 80; t++) {
          const s0 = rotr(w[t - 15], 1n) ^ rotr(w[t - 15], 8n) ^ (w[t - 15] >> 7n);
          const s1 = rotr(w[t - 2], 19n) ^ rotr(w[t - 2], 61n) ^ (w[t - 2] >> 6n);
          w[t] = add(add(add(w[t - 16], s0), w[t - 7]), s1);
        }
        let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
        for (let t = 0; t < 80; t++) {
          const S1 = rotr(e, 14n) ^ rotr(e, 18n) ^ rotr(e, 41n);
          const ch = (e & f) ^ ((~e) & g);
          const t1 = add(add(add(add(h, S1), ch), K[t]), w[t]);
          const S0 = rotr(a, 28n) ^ rotr(a, 34n) ^ rotr(a, 39n);
          const maj = (a & b) ^ (a & c) ^ (b & c);
          const t2 = add(S0, maj);
          h = g; g = f; f = e; e = add(d, t1);
          d = c; c = b; b = a; a = add(t1, t2);
        }
        h0 = add(h0, a); h1 = add(h1, b); h2 = add(h2, c); h3 = add(h3, d);
        h4 = add(h4, e); h5 = add(h5, f); h6 = add(h6, g); h7 = add(h7, h);
      }
      const out = new Uint8Array(64);
      const hs = [h0, h1, h2, h3, h4, h5, h6, h7];
      for (let i = 0; i < 8; i++) {
        const v = hs[i];
        out[i * 8]     = Number((v >> 56n) & 0xffn);
        out[i * 8 + 1] = Number((v >> 48n) & 0xffn);
        out[i * 8 + 2] = Number((v >> 40n) & 0xffn);
        out[i * 8 + 3] = Number((v >> 32n) & 0xffn);
        out[i * 8 + 4] = Number((v >> 24n) & 0xffn);
        out[i * 8 + 5] = Number((v >> 16n) & 0xffn);
        out[i * 8 + 6] = Number((v >> 8n) & 0xffn);
        out[i * 8 + 7] = Number(v & 0xffn);
      }
      return out;
    };
    const sha512 = (bytes) => sha512WithIv(bytes, [
      0x6a09e667f3bcc908n, 0xbb67ae8584caa73bn, 0x3c6ef372fe94f82bn, 0xa54ff53a5f1d36f1n,
      0x510e527fade682d1n, 0x9b05688c2b3e6c1fn, 0x1f83d9abfb41bd6bn, 0x5be0cd19137e2179n
    ]);
    const sha384 = (bytes) => sha512WithIv(bytes, [
      0xcbbb9d5dc1059ed8n, 0x629a292a367cd507n, 0x9159015a3070dd17n, 0x152fecd8f70e5939n,
      0x67332667ffc00b31n, 0x8eb44a8768581511n, 0xdb0c2e0d64f98fa7n, 0x47b5481dbefa4fa4n
    ]).subarray(0, 48);
    const hmacSha256 = (key, data) => {
      let k = key;
      if (k.length > 64) k = sha256(k);
      const o = new Uint8Array(64);
      const i = new Uint8Array(64);
      o.fill(0x5c); i.fill(0x36);
      for (let n = 0; n < k.length; n++) { o[n] ^= k[n]; i[n] ^= k[n]; }
      const inner = new Uint8Array(64 + data.length);
      inner.set(i); inner.set(data, 64);
      const ih = sha256(inner);
      const outer = new Uint8Array(96);
      outer.set(o); outer.set(ih, 64);
      return sha256(outer);
    };
    const AES_SBOX = [
      0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
      0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
      0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
      0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
      0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
      0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
      0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
      0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
      0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
      0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
      0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
      0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
      0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
      0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
      0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
      0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
    ];
    const xtime = (a) => ((a << 1) ^ ((a & 0x80) ? 0x1b : 0)) & 0xff;
    const aesExpand = (key) => {
      const w = new Uint8Array(176);
      w.set(key);
      let rcon = 1;
      for (let i = 16; i < 176; i += 4) {
        let a = w[i - 4], b = w[i - 3], c = w[i - 2], d = w[i - 1];
        if (i % 16 === 0) {
          const t = a;
          a = AES_SBOX[b] ^ rcon; b = AES_SBOX[c]; c = AES_SBOX[d]; d = AES_SBOX[t];
          rcon = xtime(rcon);
        }
        w[i] = w[i - 16] ^ a; w[i + 1] = w[i - 15] ^ b;
        w[i + 2] = w[i - 14] ^ c; w[i + 3] = w[i - 13] ^ d;
      }
      return w;
    };
    const aesEncryptBlock = (rk, input) => {
      const s = new Uint8Array(input);
      const add = (off) => { for (let i = 0; i < 16; i++) s[i] ^= rk[off + i]; };
      const sub = () => { for (let i = 0; i < 16; i++) s[i] = AES_SBOX[s[i]]; };
      const shift = () => {
        let t = s[1]; s[1] = s[5]; s[5] = s[9]; s[9] = s[13]; s[13] = t;
        t = s[2]; s[2] = s[10]; s[10] = t; t = s[6]; s[6] = s[14]; s[14] = t;
        t = s[15]; s[15] = s[11]; s[11] = s[7]; s[7] = s[3]; s[3] = t;
      };
      const mix = () => {
        for (let c = 0; c < 4; c++) {
          const i = c * 4;
          const a = s[i], b = s[i + 1], d = s[i + 2], e = s[i + 3];
          s[i]     = xtime(a) ^ xtime(b) ^ b ^ d ^ e;
          s[i + 1] = a ^ xtime(b) ^ xtime(d) ^ d ^ e;
          s[i + 2] = a ^ b ^ xtime(d) ^ xtime(e) ^ e;
          s[i + 3] = xtime(a) ^ a ^ b ^ d ^ xtime(e);
        }
      };
      add(0);
      for (let r = 1; r < 10; r++) { sub(); shift(); mix(); add(r * 16); }
      sub(); shift(); add(160);
      return s;
    };
    const gfMul = (x, y) => {
      const z = new Uint8Array(16);
      const v = new Uint8Array(y);
      for (let i = 0; i < 128; i++) {
        if (x[i >> 3] & (0x80 >> (i & 7))) {
          for (let j = 0; j < 16; j++) z[j] ^= v[j];
        }
        const lsb = v[15] & 1;
        for (let j = 15; j > 0; j--) v[j] = (v[j] >> 1) | ((v[j - 1] & 1) << 7);
        v[0] >>= 1;
        if (lsb) v[0] ^= 0xe1;
      }
      return z;
    };
    const ghash = (h, aad, ct) => {
      let x = new Uint8Array(16);
      const feed = (buf) => {
        for (let i = 0; i < buf.length; i += 16) {
          const block = new Uint8Array(16);
          block.set(buf.subarray(i, Math.min(i + 16, buf.length)));
          for (let j = 0; j < 16; j++) block[j] ^= x[j];
          x = gfMul(block, h);
        }
      };
      feed(aad);
      feed(ct);
      const len = new Uint8Array(16);
      const dv = new DataView(len.buffer);
      dv.setUint32(4, aad.length * 8);
      dv.setUint32(12, ct.length * 8);
      for (let j = 0; j < 16; j++) len[j] ^= x[j];
      return gfMul(len, h);
    };
    const inc32 = (block) => {
      const out = new Uint8Array(block);
      for (let i = 15; i >= 12; i--) {
        out[i] = (out[i] + 1) & 0xff;
        if (out[i]) break;
      }
      return out;
    };
    const aesGcmCrypt = (key, iv, aad, data, decrypt) => {
      if (iv.length !== 12) throw new DOMException("iv must be 12 bytes", "OperationError");
      const rk = aesExpand(key);
      const h = aesEncryptBlock(rk, new Uint8Array(16));
      const j0 = new Uint8Array(16);
      j0.set(iv); j0[15] = 1;
      let ctr = inc32(j0);
      const out = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i += 16) {
        const ks = aesEncryptBlock(rk, ctr);
        const n = Math.min(16, data.length - i);
        for (let j = 0; j < n; j++) out[i + j] = data[i + j] ^ ks[j];
        ctr = inc32(ctr);
      }
      const tagIn = decrypt ? data : out;
      const ctForHash = decrypt ? data.subarray(0, data.length) : out;
      return { out, h, j0, rk, ctForHash };
    };
    const aesGcmEncrypt = (key, iv, aad, data) => {
      const { out, h, j0, rk } = aesGcmCrypt(key, iv, aad, data, false);
      const s = ghash(h, aad, out);
      const t = aesEncryptBlock(rk, j0);
      const tag = new Uint8Array(16);
      for (let i = 0; i < 16; i++) tag[i] = s[i] ^ t[i];
      const packed = new Uint8Array(out.length + 16);
      packed.set(out); packed.set(tag, out.length);
      return packed;
    };
    const aesGcmDecrypt = (key, iv, aad, packed) => {
      if (packed.length < 16) throw new DOMException("The operation failed for an operation-specific reason", "OperationError");
      const data = packed.subarray(0, packed.length - 16);
      const tag = packed.subarray(packed.length - 16);
      const { out, h, j0, rk } = aesGcmCrypt(key, iv, aad, data, true);
      const s = ghash(h, aad, data);
      const t = aesEncryptBlock(rk, j0);
      let diff = 0;
      for (let i = 0; i < 16; i++) diff |= tag[i] ^ s[i] ^ t[i];
      if (diff) throw new DOMException("The operation failed for an operation-specific reason", "OperationError");
      return out;
    };
    const AES_INV_SBOX = new Uint8Array(256);
    for (let i = 0; i < 256; i++) AES_INV_SBOX[AES_SBOX[i]] = i;
    const aesDecryptBlock = (rk, input) => {
      const s = new Uint8Array(input);
      const add = (off) => { for (let i = 0; i < 16; i++) s[i] ^= rk[off + i]; };
      const invSub = () => { for (let i = 0; i < 16; i++) s[i] = AES_INV_SBOX[s[i]]; };
      const invShift = () => {
        let t = s[13]; s[13] = s[9]; s[9] = s[5]; s[5] = s[1]; s[1] = t;
        t = s[2]; s[2] = s[10]; s[10] = t; t = s[6]; s[6] = s[14]; s[14] = t;
        t = s[3]; s[3] = s[7]; s[7] = s[11]; s[11] = s[15]; s[15] = t;
      };
      const mul = (a, n) => {
        let r = 0, x = a;
        while (n) { if (n & 1) r ^= x; x = xtime(x); n >>= 1; }
        return r & 0xff;
      };
      const invMix = () => {
        for (let c = 0; c < 4; c++) {
          const i = c * 4;
          const a = s[i], b = s[i + 1], d = s[i + 2], e = s[i + 3];
          s[i]     = mul(a, 0x0e) ^ mul(b, 0x0b) ^ mul(d, 0x0d) ^ mul(e, 0x09);
          s[i + 1] = mul(a, 0x09) ^ mul(b, 0x0e) ^ mul(d, 0x0b) ^ mul(e, 0x0d);
          s[i + 2] = mul(a, 0x0d) ^ mul(b, 0x09) ^ mul(d, 0x0e) ^ mul(e, 0x0b);
          s[i + 3] = mul(a, 0x0b) ^ mul(b, 0x0d) ^ mul(d, 0x09) ^ mul(e, 0x0e);
        }
      };
      add(160);
      for (let r = 9; r >= 1; r--) { invShift(); invSub(); add(r * 16); invMix(); }
      invShift(); invSub(); add(0);
      return s;
    };
    const aesCbcEncrypt = (key, iv, data) => {
      if (iv.length !== 16) throw new DOMException("iv must be 16 bytes", "OperationError");
      if (data.length % 16) throw new DOMException("data must be a multiple of 16 bytes", "OperationError");
      const rk = aesExpand(key);
      const out = new Uint8Array(data.length);
      let prev = iv;
      for (let i = 0; i < data.length; i += 16) {
        const block = new Uint8Array(16);
        block.set(data.subarray(i, i + 16));
        for (let j = 0; j < 16; j++) block[j] ^= prev[j];
        const enc = aesEncryptBlock(rk, block);
        out.set(enc, i);
        prev = enc;
      }
      return out;
    };
    const aesCbcDecrypt = (key, iv, data) => {
      if (iv.length !== 16) throw new DOMException("iv must be 16 bytes", "OperationError");
      if (data.length % 16) throw new DOMException("data must be a multiple of 16 bytes", "OperationError");
      const rk = aesExpand(key);
      const out = new Uint8Array(data.length);
      let prev = iv;
      for (let i = 0; i < data.length; i += 16) {
        const block = data.subarray(i, i + 16);
        const dec = aesDecryptBlock(rk, block);
        for (let j = 0; j < 16; j++) out[i + j] = dec[j] ^ prev[j];
        prev = block;
      }
      return out;
    };
    const aesCtrCrypt = (key, iv, data) => {
      if (iv.length !== 16) throw new DOMException("iv must be 16 bytes", "OperationError");
      const rk = aesExpand(key);
      const out = new Uint8Array(data.length);
      const ctr = new Uint8Array(iv);
      for (let i = 0; i < data.length; i += 16) {
        const ks = aesEncryptBlock(rk, ctr);
        const n = Math.min(16, data.length - i);
        for (let j = 0; j < n; j++) out[i + j] = data[i + j] ^ ks[j];
        for (let k = 15; k >= 0; k--) {
          ctr[k] = (ctr[k] + 1) & 0xff;
          if (ctr[k]) break;
        }
      }
      return out;
    };
    const pbkdf2HmacSha256 = (password, salt, iterations, dkLen) => {
      const out = new Uint8Array(dkLen);
      const blocks = Math.ceil(dkLen / 32);
      for (let i = 1; i <= blocks; i++) {
        const block = new Uint8Array(salt.length + 4);
        block.set(salt);
        block[salt.length] = (i >>> 24) & 0xff;
        block[salt.length + 1] = (i >>> 16) & 0xff;
        block[salt.length + 2] = (i >>> 8) & 0xff;
        block[salt.length + 3] = i & 0xff;
        let u = hmacSha256(password, block);
        const acc = new Uint8Array(u);
        for (let c = 1; c < iterations; c++) {
          u = hmacSha256(password, u);
          for (let j = 0; j < 32; j++) acc[j] ^= u[j];
        }
        out.set(acc.subarray(0, Math.min(32, dkLen - (i - 1) * 32)), (i - 1) * 32);
      }
      return out;
    };
    cryptoObj.subtle = {
      digest(algo, data) {
        const name = String(algo && algo.name ? algo.name : algo).replace(/-/g, "").toUpperCase();
        const bytes = toBytes(data);
        let digest;
        if (name === "SHA256") digest = sha256(bytes);
        else if (name === "SHA1") digest = sha1(bytes);
        else if (name === "SHA512") digest = sha512(bytes);
        else if (name === "SHA384") digest = sha384(bytes);
        else return Promise.reject(new DOMException("algorithm not supported", "NotSupportedError"));
        return Promise.resolve(digest.buffer.slice(digest.byteOffset, digest.byteOffset + digest.byteLength));
      },
      importKey(format, keyData, algorithm, extractable, usages) {
        const name = String(algorithm && algorithm.name ? algorithm.name : algorithm).replace(/-/g, "").toUpperCase();
        if (format === "jwk") {
          const tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
          const k = keyData && keyData.k != null ? String(keyData.k).replace(/=+$/, "") : "";
          if (!keyData || String(keyData.kty) !== "oct" || !k) {
            return Promise.reject(new DOMException("algorithm not supported", "NotSupportedError"));
          }
          const out = [];
          let buf = 0;
          let bits = 0;
          for (let i = 0; i < k.length; i++) {
            const v = tab.indexOf(k[i]);
            if (v < 0) continue;
            buf = (buf << 6) | v;
            bits += 6;
            if (bits >= 8) {
              bits -= 8;
              out.push((buf >> bits) & 0xff);
            }
          }
          keyData = new Uint8Array(out);
          format = "raw";
        }
        if (format !== "raw") {
          return Promise.reject(new DOMException("algorithm not supported", "NotSupportedError"));
        }
        if (name === "HMAC") {
          const hash = String(algorithm.hash && algorithm.hash.name ? algorithm.hash.name : algorithm.hash || "SHA-256");
          return Promise.resolve({
            type: "secret",
            extractable: !!extractable,
            algorithm: { name: "HMAC", hash: { name: hash } },
            usages: usages || [],
            _raw: toBytes(keyData),
          });
        }
        if (name === "AESGCM" || name === "AESCBC" || name === "AESCTR") {
          const raw = toBytes(keyData);
          if (raw.length !== 16) {
            return Promise.reject(new DOMException("algorithm not supported", "NotSupportedError"));
          }
          return Promise.resolve({
            type: "secret",
            extractable: !!extractable,
            algorithm: { name: name === "AESCBC" ? "AES-CBC" : name === "AESCTR" ? "AES-CTR" : "AES-GCM", length: 128 },
            usages: usages || [],
            _raw: raw,
          });
        }
        if (name === "PBKDF2" || name === "HKDF") {
          return Promise.resolve({
            type: "secret",
            extractable: false,
            algorithm: { name: name === "HKDF" ? "HKDF" : "PBKDF2" },
            usages: usages || [],
            _raw: toBytes(keyData),
          });
        }
        return Promise.reject(new DOMException("algorithm not supported", "NotSupportedError"));
      },
      generateKey(algorithm, extractable, usages) {
        const name = String(algorithm && algorithm.name ? algorithm.name : algorithm).replace(/-/g, "").toUpperCase();
        const rand = (n) => {
          const a = new Uint8Array(n);
          cryptoObj.getRandomValues(a);
          return a;
        };
        if (name === "AESGCM" || name === "AESCBC" || name === "AESCTR") {
          return Promise.resolve({
            type: "secret",
            extractable: !!extractable,
            algorithm: { name: name === "AESCBC" ? "AES-CBC" : name === "AESCTR" ? "AES-CTR" : "AES-GCM", length: 128 },
            usages: usages || [],
            _raw: rand(16),
          });
        }
        if (name === "HMAC") {
          const hash = String(algorithm.hash && algorithm.hash.name ? algorithm.hash.name : algorithm.hash || "SHA-256");
          return Promise.resolve({
            type: "secret",
            extractable: !!extractable,
            algorithm: { name: "HMAC", hash: { name: hash } },
            usages: usages || [],
            _raw: rand(32),
          });
        }
        return Promise.reject(new DOMException("algorithm not supported", "NotSupportedError"));
      },
      exportKey(format, key) {
        if (!key || !key._raw) {
          return Promise.reject(new DOMException("algorithm not supported", "NotSupportedError"));
        }
        if (!key.extractable) {
          return Promise.reject(new DOMException("key is not extractable", "InvalidAccessError"));
        }
        const raw = key._raw;
        if (format === "raw") {
          return Promise.resolve(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength));
        }
        if (format === "jwk") {
          const tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
          let k = "";
          for (let i = 0; i < raw.length; i += 3) {
            const a = raw[i];
            const b = i + 1 < raw.length ? raw[i + 1] : 0;
            const c = i + 2 < raw.length ? raw[i + 2] : 0;
            k += tab[a >> 2];
            k += tab[((a & 3) << 4) | (b >> 4)];
            if (i + 1 < raw.length) k += tab[((b & 15) << 2) | (c >> 6)];
            if (i + 2 < raw.length) k += tab[c & 63];
          }
          return Promise.resolve({
            kty: "oct",
            k,
            alg: key.algorithm && key.algorithm.name === "HMAC" ? "HS256" : "A128CBC",
            ext: true,
            key_ops: key.usages || [],
          });
        }
        return Promise.reject(new DOMException("algorithm not supported", "NotSupportedError"));
      },
      deriveKey(algorithm, baseKey, derivedKeyType, extractable, usages) {
        const dname = String(derivedKeyType && derivedKeyType.name ? derivedKeyType.name : derivedKeyType).replace(/-/g, "").toUpperCase();
        const bits = dname.indexOf("AES") === 0 ? 128 : 256;
        return cryptoObj.subtle.deriveBits(algorithm, baseKey, bits).then((buf) => {
          return cryptoObj.subtle.importKey("raw", buf, derivedKeyType, extractable, usages);
        });
      },
      sign(algorithm, key, data) {
        const name = String(algorithm && algorithm.name ? algorithm.name : algorithm).replace(/-/g, "").toUpperCase();
        if (name !== "HMAC" || !key || !key._raw) {
          return Promise.reject(new DOMException("algorithm not supported", "NotSupportedError"));
        }
        const mac = hmacSha256(key._raw, toBytes(data));
        return Promise.resolve(mac.buffer.slice(mac.byteOffset, mac.byteOffset + mac.byteLength));
      },
      verify(algorithm, key, signature, data) {
        const name = String(algorithm && algorithm.name ? algorithm.name : algorithm).replace(/-/g, "").toUpperCase();
        if (name !== "HMAC" || !key || !key._raw) {
          return Promise.reject(new DOMException("algorithm not supported", "NotSupportedError"));
        }
        const mac = hmacSha256(key._raw, toBytes(data));
        const sig = toBytes(signature);
        if (mac.length !== sig.length) return Promise.resolve(false);
        let diff = 0;
        for (let i = 0; i < mac.length; i++) diff |= mac[i] ^ sig[i];
        return Promise.resolve(diff === 0);
      },
      encrypt(algorithm, key, data) {
        const name = String(algorithm && algorithm.name ? algorithm.name : algorithm).replace(/-/g, "").toUpperCase();
        if (!key || !key._raw) {
          return Promise.reject(new DOMException("algorithm not supported", "NotSupportedError"));
        }
        try {
          let out;
          if (name === "AESGCM") {
            out = aesGcmEncrypt(key._raw, toBytes(algorithm.iv), algorithm.additionalData ? toBytes(algorithm.additionalData) : new Uint8Array(0), toBytes(data));
          } else if (name === "AESCBC") {
            out = aesCbcEncrypt(key._raw, toBytes(algorithm.iv), toBytes(data));
          } else if (name === "AESCTR") {
            out = aesCtrCrypt(key._raw, toBytes(algorithm.counter || algorithm.iv), toBytes(data));
          } else {
            return Promise.reject(new DOMException("algorithm not supported", "NotSupportedError"));
          }
          return Promise.resolve(out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength));
        } catch (e) {
          return Promise.reject(e);
        }
      },
      decrypt(algorithm, key, data) {
        const name = String(algorithm && algorithm.name ? algorithm.name : algorithm).replace(/-/g, "").toUpperCase();
        if (!key || !key._raw) {
          return Promise.reject(new DOMException("algorithm not supported", "NotSupportedError"));
        }
        try {
          let out;
          if (name === "AESGCM") {
            out = aesGcmDecrypt(key._raw, toBytes(algorithm.iv), algorithm.additionalData ? toBytes(algorithm.additionalData) : new Uint8Array(0), toBytes(data));
          } else if (name === "AESCBC") {
            out = aesCbcDecrypt(key._raw, toBytes(algorithm.iv), toBytes(data));
          } else if (name === "AESCTR") {
            out = aesCtrCrypt(key._raw, toBytes(algorithm.counter || algorithm.iv), toBytes(data));
          } else {
            return Promise.reject(new DOMException("algorithm not supported", "NotSupportedError"));
          }
          return Promise.resolve(out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength));
        } catch (e) {
          return Promise.reject(e);
        }
      },
      deriveBits(algorithm, key, length) {
        const name = String(algorithm && algorithm.name ? algorithm.name : algorithm).replace(/-/g, "").toUpperCase();
        if (!key || !key._raw) {
          return Promise.reject(new DOMException("algorithm not supported", "NotSupportedError"));
        }
        const hash = String(algorithm.hash && algorithm.hash.name ? algorithm.hash.name : algorithm.hash || "SHA-256").replace(/-/g, "").toUpperCase();
        if (hash !== "SHA256") {
          return Promise.reject(new DOMException("algorithm not supported", "NotSupportedError"));
        }
        const dkLen = (Number(length) / 8) | 0;
        if (dkLen <= 0) {
          return Promise.reject(new DOMException("The operation failed for an operation-specific reason", "OperationError"));
        }
        try {
          let out;
          if (name === "PBKDF2") {
            const iter = Number(algorithm.iterations) | 0;
            if (iter <= 0) {
              return Promise.reject(new DOMException("The operation failed for an operation-specific reason", "OperationError"));
            }
            out = pbkdf2HmacSha256(key._raw, toBytes(algorithm.salt), iter, dkLen);
          } else if (name === "HKDF") {
            const salt = algorithm.salt ? toBytes(algorithm.salt) : new Uint8Array(32);
            const info = algorithm.info ? toBytes(algorithm.info) : new Uint8Array(0);
            const prk = hmacSha256(salt.length ? salt : new Uint8Array(32), key._raw);
            const okm = new Uint8Array(dkLen);
            let t = new Uint8Array(0);
            let pos = 0;
            for (let i = 1; pos < dkLen; i++) {
              const block = new Uint8Array(t.length + info.length + 1);
              block.set(t);
              block.set(info, t.length);
              block[block.length - 1] = i;
              t = hmacSha256(prk, block);
              okm.set(t.subarray(0, Math.min(32, dkLen - pos)), pos);
              pos += 32;
            }
            out = okm;
          } else {
            return Promise.reject(new DOMException("algorithm not supported", "NotSupportedError"));
          }
          return Promise.resolve(out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength));
        } catch (e) {
          return Promise.reject(e);
        }
      },
      wrapKey(format, key, wrappingKey, wrapAlgorithm) {
        return cryptoObj.subtle.exportKey(format, key).then((raw) => {
          return cryptoObj.subtle.encrypt(wrapAlgorithm, wrappingKey, raw);
        });
      },
      unwrapKey(format, wrappedKey, wrappingKey, unwrapAlgorithm, unwrappedKeyAlgorithm, extractable, usages) {
        return cryptoObj.subtle.decrypt(unwrapAlgorithm, wrappingKey, wrappedKey).then((raw) => {
          return cryptoObj.subtle.importKey(format, raw, unwrappedKeyAlgorithm, extractable, usages);
        });
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
                let fetched = self.loader.as_mut().and_then(|l| {
                    l.load(&crate::NavigationRequest::get(resolved.clone(), id))
                        .ok()
                });
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
