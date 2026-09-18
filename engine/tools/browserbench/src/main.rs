//! Official-suite identity laboratory (VEC-021).
//!
//! Runs the official JetStream Next `SunSpider` group (12 named tests) on V8,
//! every official `Speedometer` 3.0 suite name (vendored workloads execute;
//! others `NOTRUN`), a TodoMVC-class DOM mutation, a canvas `fillRect` loop,
//! official MotionMark 1.3 names (Multiply-class GPU present plus the other
//! seven recorded `NOTRUN`), and `present_list` with no CPU readback. Scores
//! are never fabricated. Identity is always written.

mod esm;
mod jetstream;
mod motionmark;
mod speedometer;

use std::path::PathBuf;
use std::time::Instant;

use anyhow::{Context, Result};
use clap::Parser;
use serde::Serialize;
use serde_json::json;
use ve_api::{EngineConfig, OpenRequest, VectorEngine};
use ve_core::Size;

const PINS: &str = include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/pins.json"));

/// Official suite identity lab.
#[derive(Parser, Debug)]
#[command(
    name = "browserbench",
    about = "`Speedometer` / `JetStream` / `MotionMark` identity lab"
)]
struct Args {
    /// Write JSON here (stdout if omitted).
    #[arg(long)]
    out: Option<PathBuf>,
    /// Timed iterations per runnable suite.
    #[arg(long, default_value_t = 3)]
    iterations: u32,
    /// Run only the merge-gated suites (`JetStream` n-body/sha1, TodoMVC-JavaScript-ES5,
    /// `MotionMark` GPU). Other official Speedometer names are recorded `NOTRUN`.
    #[arg(long)]
    gate: bool,
    /// Run one family: `all`, `jetstream`, `speedometer`, or `motionmark`.
    #[arg(long, default_value = "all")]
    only: String,
    /// Official JetStream Next checkout (pin in `pins.json`) for Default JS workloads.
    #[arg(long)]
    jetstream_dir: Option<PathBuf>,
    /// Official MotionMark checkout (pin in `pins.json`) for official HTML workloads.
    #[arg(long)]
    motionmark_dir: Option<PathBuf>,
}

#[derive(Serialize)]
struct SuiteResult {
    name: String,
    status: &'static str,
    revision: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    samples_ms: Option<Vec<u64>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    p50_ms: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    p95_ms: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    detail: Option<String>,
}

pub(crate) fn percentile(samples: &[u64], p: f64) -> u64 {
    if samples.is_empty() {
        return 0;
    }
    let mut v = samples.to_vec();
    v.sort_unstable();
    let idx = ((p * v.len() as f64).ceil() as usize).clamp(1, v.len()) - 1;
    v[idx]
}

pub(crate) fn pin(suite: &str, field: &str) -> String {
    let v: serde_json::Value = serde_json::from_str(PINS).unwrap_or(json!({}));
    v.get(suite)
        .and_then(|s| s.get(field))
        .and_then(serde_json::Value::as_str)
        .unwrap_or("unknown")
        .to_owned()
}

pub(crate) fn jetstream(
    engine: &mut VectorEngine,
    iterations: u32,
    name: &str,
    source: &str,
    path: &str,
) -> SuiteResult {
    jetstream_chunks(engine, iterations, name, &[source.to_owned()], path)
}

/// Load official sources after `open` so large `.z` payloads are not HTML text nodes.
pub(crate) fn jetstream_chunks(
    engine: &mut VectorEngine,
    iterations: u32,
    name: &str,
    chunks: &[String],
    path: &str,
) -> SuiteResult {
    let revision = pin("jetstream", "revision");
    if !cfg!(feature = "v8") {
        return SuiteResult {
            name: name.to_owned(),
            status: "NOTRUN",
            revision,
            samples_ms: None,
            p50_ms: None,
            p95_ms: None,
            detail: Some("built without v8".into()),
        };
    }
    let html = format!("<!doctype html><title>{name}</title>");
    let mut samples = Vec::new();
    let mut last_err = None;
    for _ in 0..iterations.max(1) {
        let opened = match engine.open(OpenRequest {
            url: Some(format!("https://browserbench.org/JetStream/{path}")),
            html: Some(html.clone()),
            allow_evaluate: true,
            ..OpenRequest::default()
        }) {
            Ok(o) => o,
            Err(e) => {
                last_err = Some(e.to_string());
                break;
            }
        };
        if let Ok(page) = engine.page_mut(opened.page) {
            page.settle(500);
        }
        let load = engine.page_mut(opened.page).and_then(|p| {
            for chunk in chunks {
                p.evaluate(chunk)?;
            }
            Ok(())
        });
        if let Err(e) = load {
            last_err = Some(e.to_string());
            engine.close(opened.page);
            continue;
        }
        let started = Instant::now();
        match engine.page_mut(opened.page).and_then(|p| {
            p.evaluate("(function(){ new Benchmark().runIteration(); return true; })()")
        }) {
            Ok(_) => samples.push(u64::try_from(started.elapsed().as_millis()).unwrap_or(u64::MAX)),
            Err(e) => last_err = Some(e.to_string()),
        }
        engine.close(opened.page);
    }
    finish_jetstream(name, revision, samples, last_err)
}

/// Official `AsyncBenchmark`: await init / prepareForNextIteration / runIteration.
pub(crate) fn jetstream_async_chunks(
    engine: &mut VectorEngine,
    iterations: u32,
    name: &str,
    chunks: &[String],
    path: &str,
) -> SuiteResult {
    let revision = pin("jetstream", "revision");
    if !cfg!(feature = "v8") {
        return SuiteResult {
            name: name.to_owned(),
            status: "NOTRUN",
            revision,
            samples_ms: None,
            p50_ms: None,
            p95_ms: None,
            detail: Some("built without v8".into()),
        };
    }
    let html = format!("<!doctype html><title>{name}</title>");
    let mut samples = Vec::new();
    let mut last_err = None;
    for _ in 0..iterations.max(1) {
        let opened = match engine.open(OpenRequest {
            url: Some(format!("https://browserbench.org/JetStream/{path}")),
            html: Some(html.clone()),
            allow_evaluate: true,
            ..OpenRequest::default()
        }) {
            Ok(o) => o,
            Err(e) => {
                last_err = Some(e.to_string());
                break;
            }
        };
        if let Ok(page) = engine.page_mut(opened.page) {
            page.settle(500);
        }
        let load = engine.page_mut(opened.page).and_then(|p| {
            for chunk in chunks {
                p.evaluate(chunk)?;
            }
            Ok(())
        });
        if let Err(e) = load {
            last_err = Some(e.to_string());
            engine.close(opened.page);
            continue;
        }
        let started = Instant::now();
        if let Err(e) = engine
            .page_mut(opened.page)
            .and_then(|p| p.evaluate(ASYNC_START))
        {
            last_err = Some(e.to_string());
            engine.close(opened.page);
            continue;
        }
        match wait_async(engine, opened.page) {
            Ok(()) => {
                samples.push(u64::try_from(started.elapsed().as_millis()).unwrap_or(u64::MAX))
            }
            Err(e) => last_err = Some(e),
        }
        engine.close(opened.page);
    }
    finish_jetstream(name, revision, samples, last_err)
}

const ASYNC_START: &str = r#"(function () {
  if (typeof RegExp.escape !== "function") {
    RegExp.escape = function (s) {
      return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };
  }
  window.__veJs = { done: null, err: null };
  var b = new Benchmark({ iterationCount: 1 });
  Promise.resolve()
    .then(function () { return b.init && b.init(); })
    .then(function () { return b.prepareForNextIteration && b.prepareForNextIteration(); })
    .then(function () { return b.runIteration(0); })
    .then(function () { window.__veJs.done = true; })
    .catch(function (e) { window.__veJs.err = String(e && e.message ? e.message : e); });
  return true;
})()"#;

const ASYNC_STATUS: &str = r#"(function () {
  var s = window.__veJs || {};
  if (s.err) return "err:" + s.err;
  if (s.done) return "ok";
  return "pending";
})()"#;

fn wait_async(engine: &mut VectorEngine, page: ve_api::PageId) -> Result<(), String> {
    for _ in 0..120 {
        if let Ok(p) = engine.page_mut(page) {
            p.settle(500);
        }
        let status = engine
            .page_mut(page)
            .and_then(|p| p.evaluate(ASYNC_STATUS))
            .map_err(|e| e.to_string())?;
        let text = match status {
            serde_json::Value::String(s) => s,
            other => other.to_string(),
        };
        if text == "ok" || text == "\"ok\"" {
            return Ok(());
        }
        if let Some(err) = text.strip_prefix("err:") {
            return Err(err.to_owned());
        }
        if let Some(err) = text.strip_prefix("\"err:") {
            return Err(err.trim_end_matches('"').to_owned());
        }
        std::thread::sleep(std::time::Duration::from_millis(25));
    }
    Err("async runIteration did not finish".into())
}

fn finish_jetstream(
    name: &str,
    revision: String,
    samples: Vec<u64>,
    last_err: Option<String>,
) -> SuiteResult {
    if samples.is_empty() {
        return SuiteResult {
            name: name.to_owned(),
            status: "FAIL",
            revision,
            samples_ms: None,
            p50_ms: None,
            p95_ms: None,
            detail: last_err,
        };
    }
    SuiteResult {
        name: name.to_owned(),
        status: "PASS",
        revision,
        p50_ms: Some(percentile(&samples, 0.50)),
        p95_ms: Some(percentile(&samples, 0.95)),
        samples_ms: Some(samples),
        detail: last_err,
    }
}

fn speedometer_class(engine: &mut VectorEngine, iterations: u32) -> SuiteResult {
    let revision = pin("speedometer", "revision");
    if !cfg!(feature = "v8") {
        return SuiteResult {
            name: "speedometer.todomvc-class".into(),
            status: "NOTRUN",
            revision,
            samples_ms: None,
            p50_ms: None,
            p95_ms: None,
            detail: Some("built without v8".into()),
        };
    }
    let html = "<!doctype html><title>todo</title><ul id=list></ul>";
    let expr = r#"(function () {
      var list = document.getElementById("list");
      for (var i = 0; i < 100; i++) {
        var li = document.createElement("li");
        li.textContent = "item " + i;
        li.className = "todo";
        list.appendChild(li);
      }
      var items = list.getElementsByTagName("li");
      for (var i = 0; i < items.length; i++) items[i].className = "completed";
      while (list.firstChild) list.removeChild(list.firstChild);
      return list.childNodes.length;
    })()"#;
    let mut samples = Vec::new();
    let mut last_err = None;
    for _ in 0..iterations.max(1) {
        let opened = match engine.open(OpenRequest {
            url: Some("https://browserbench.org/Speedometer/todo".into()),
            html: Some(html.into()),
            allow_evaluate: true,
            ..OpenRequest::default()
        }) {
            Ok(o) => o,
            Err(e) => {
                last_err = Some(e.to_string());
                break;
            }
        };
        if let Ok(page) = engine.page_mut(opened.page) {
            page.settle(500);
        }
        let started = Instant::now();
        match engine.page_mut(opened.page).and_then(|p| p.evaluate(expr)) {
            Ok(_) => samples.push(u64::try_from(started.elapsed().as_millis()).unwrap_or(u64::MAX)),
            Err(e) => last_err = Some(e.to_string()),
        }
        engine.close(opened.page);
    }
    if samples.is_empty() {
        return SuiteResult {
            name: "speedometer.todomvc-class".into(),
            status: "FAIL",
            revision,
            samples_ms: None,
            p50_ms: None,
            p95_ms: None,
            detail: last_err.or(Some(pin("speedometer", "note"))),
        };
    }
    SuiteResult {
        name: "speedometer.todomvc-class".into(),
        status: "PARTIAL",
        revision,
        p50_ms: Some(percentile(&samples, 0.50)),
        p95_ms: Some(percentile(&samples, 0.95)),
        samples_ms: Some(samples),
        detail: Some(pin("speedometer", "note")),
    }
}

fn motionmark_class(engine: &mut VectorEngine, iterations: u32) -> SuiteResult {
    let revision = pin("motionmark", "revision");
    if !cfg!(feature = "v8") {
        return SuiteResult {
            name: "motionmark.canvas-class".into(),
            status: "NOTRUN",
            revision,
            samples_ms: None,
            p50_ms: None,
            p95_ms: None,
            detail: Some("built without v8".into()),
        };
    }
    let html = "<!doctype html><title>mm</title><canvas id=c width=400 height=300></canvas>";
    let expr = r##"(function () {
      var c = document.getElementById("c");
      var ctx = c.getContext("2d");
      for (var i = 0; i < 2000; i++) {
        ctx.fillStyle = i % 2 ? "#f00" : "#00f";
        ctx.fillRect(i % 400, (i * 7) % 300, 12, 12);
      }
      return c.width;
    })()"##;
    let mut samples = Vec::new();
    let mut last_err = None;
    for _ in 0..iterations.max(1) {
        let opened = match engine.open(OpenRequest {
            url: Some("https://browserbench.org/MotionMark/canvas-class".into()),
            html: Some(html.into()),
            allow_evaluate: true,
            ..OpenRequest::default()
        }) {
            Ok(o) => o,
            Err(e) => {
                last_err = Some(e.to_string());
                break;
            }
        };
        if let Ok(page) = engine.page_mut(opened.page) {
            page.settle(500);
        }
        let started = Instant::now();
        match engine.page_mut(opened.page).and_then(|p| p.evaluate(expr)) {
            Ok(_) => samples.push(u64::try_from(started.elapsed().as_millis()).unwrap_or(u64::MAX)),
            Err(e) => last_err = Some(e.to_string()),
        }
        engine.close(opened.page);
    }
    if samples.is_empty() {
        return SuiteResult {
            name: "motionmark.canvas-class".into(),
            status: "FAIL",
            revision,
            samples_ms: None,
            p50_ms: None,
            p95_ms: None,
            detail: last_err.or(Some(pin("motionmark", "note"))),
        };
    }
    SuiteResult {
        name: "motionmark.canvas-class".into(),
        status: "PARTIAL",
        revision,
        p50_ms: Some(percentile(&samples, 0.50)),
        p95_ms: Some(percentile(&samples, 0.95)),
        samples_ms: Some(samples),
        detail: Some(pin("motionmark", "note")),
    }
}

fn main() -> Result<()> {
    let args = Args::parse();
    // Official TodoMVC-JavaScript-ES5 is the review's 54–68s profiling target.
    // The default 20s script deadline aborts boot before attribution exists.
    if std::env::var_os("VECTOR_SCRIPT_DEADLINE_SECS").is_none() {
        // Safety: process start, no other threads yet.
        unsafe { std::env::set_var("VECTOR_SCRIPT_DEADLINE_SECS", "90") };
    }
    // Official Complex-DOM add/delete exceeds the 60s evaluate default.
    // Do not raise the engine-wide default (runaway evaluate tests stay 60s).
    if std::env::var_os("VECTOR_EVALUATE_DEADLINE_SECS").is_none() {
        unsafe { std::env::set_var("VECTOR_EVALUATE_DEADLINE_SECS", "240") };
    }
    if !args.gate && std::env::var_os("VECTOR_BROWSERBENCH_SUITE_DEADLINE_SECS").is_none() {
        unsafe { std::env::set_var("VECTOR_BROWSERBENCH_SUITE_DEADLINE_SECS", "300") };
    }
    let mut engine = VectorEngine::new(EngineConfig {
        viewport: Size::new(1280.0, 720.0),
        offline: true,
        scripting: cfg!(feature = "v8"),
        policy: ve_api::NetworkPolicy::permissive(),
        ..EngineConfig::default()
    });
    let only = args.only.as_str();
    let mut suites = Vec::new();
    if only == "all" || only == "jetstream" {
        let jetstream_dir = args
            .jetstream_dir
            .clone()
            .or_else(|| std::env::var_os("VECTOR_JETSTREAM_DIR").map(PathBuf::from));
        suites.extend(jetstream::run(
            &mut engine,
            args.iterations,
            jetstream_dir.as_deref(),
        ));
    }
    if only == "all" || only == "speedometer" {
        suites.extend(speedometer::run_official(
            &mut engine,
            args.iterations,
            args.gate,
        ));
        suites.push(speedometer_class(&mut engine, args.iterations));
    }
    if only == "all" || only == "motionmark" {
        let motionmark_dir = args
            .motionmark_dir
            .clone()
            .or_else(|| std::env::var_os("VECTOR_MOTIONMARK_DIR").map(PathBuf::from));
        suites.extend(motionmark::run(
            &mut engine,
            args.iterations,
            motionmark_dir.as_deref(),
        ));
        suites.push(motionmark_class(&mut engine, args.iterations));
        suites.push(motionmark::run_gpu(args.iterations));
    }
    let report = json!({
        "backend": "vector-engine",
        "chromium": false,
        "security_mode": "developer-offline",
        "os": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "rss_bytes": ve_core::process_rss_bytes(),
        "process_tree_rss_bytes": ve_core::process_tree_rss_bytes(),
        "host_package_energy_uj": ve_core::host_package_energy_uj(),
        "engine_version": ve_api::VERSION,
        "pins": serde_json::from_str::<serde_json::Value>(PINS).unwrap_or(json!({})),
        "suites": suites,
        "attribution": {
            "kind": "adapted-workload-phases",
            "officialFullSuite": !args.gate
                && suites.iter().any(|s| s.name.starts_with("speedometer.3.0."))
                && suites
                    .iter()
                    .filter(|s| s.name.starts_with("speedometer.3.0."))
                    .all(|s| s.status != "NOTRUN"),
            "gate": args.gate,
            "source": "official JetStream Next SunSpider group (12) plus speedometer.3.0.* and official MotionMark 1.3 names",
            "jetstreamSunspider": {
                "executed": suites.iter().filter(|s| s.name.starts_with("jetstream.") && s.status != "NOTRUN").count(),
                "passed": suites.iter().filter(|s| s.name.starts_with("jetstream.") && s.status == "PASS").count(),
                "failed": suites.iter().filter(|s| s.name.starts_with("jetstream.") && s.status == "FAIL").count(),
                "officialGroup": 12,
                "note": "Official SunSpider group plus Default JS from --jetstream-dir, including zlib .z, AsyncBenchmark, startup/SSR/TypeScript-lib, late-eval mandreel/pdfjs, and WasmEMCC Default (richards/zlib/tsf/argon2). Remaining Default wasm stays unexecuted. Not a JetStream Next geometric-mean published score."
            },
            "motionmark13": {
                "officialNames": 8,
                "note": "Official MotionMark 1.3 names from resources/runner/tests.js. Official HTML workloads execute when --motionmark-dir is set. canvas-class and gpu.multiply remain adapted class probes. Not a published MotionMark score."
            },
            "phases": ["parse/style/layout(openMs)", "js(jsMs)", "harnessSettle(settleMs)", "unaccounted"],
            "speedometer30": {
                "executed": suites.iter().filter(|s| s.name.starts_with("speedometer.3.0.") && s.status != "NOTRUN").count(),
                "notrun": suites.iter().filter(|s| s.name.starts_with("speedometer.3.0.") && s.status == "NOTRUN").count(),
                "failed": suites.iter().filter(|s| s.name.starts_with("speedometer.3.0.") && s.status == "FAIL").count(),
                "note": "Official Speedometer 3.0 suite names. Vendored workloads execute; missing sources stay NOTRUN. Not a browserbench.org published score."
            }
        },
    });
    let json = serde_json::to_string_pretty(&report)?;
    if let Some(path) = &args.out {
        std::fs::write(path, &json).with_context(|| path.display().to_string())?;
    } else {
        println!("{json}");
    }
    for s in &suites {
        eprintln!(
            "browserbench: {} {} rev {} {:?}",
            s.name, s.status, s.revision, s.p95_ms
        );
    }
    if suites.iter().any(|s| {
        s.status == "FAIL"
            && (jetstream::GATED.contains(&s.name.as_str())
                || s.name == "speedometer.3.0.TodoMVC-JavaScript-ES5"
                || s.name == "motionmark.gpu.multiply")
    }) {
        anyhow::bail!("browserbench recorded a FAIL on a gated suite");
    }
    Ok(())
}
