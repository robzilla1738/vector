//! Official-suite identity laboratory (VEC-021).
//!
//! Runs the official `JetStream` Next `SunSpider` group (12 named tests) on V8,
//! every official `Speedometer` 3.0 suite name (vendored workloads execute;
//! others `NOTRUN`), a `TodoMVC`-class DOM mutation, a canvas `fillRect` loop,
//! official `MotionMark` 1.3 names (Multiply-class GPU present plus the other
//! seven recorded `NOTRUN`), and `present_list` with no CPU readback. Scores
//! are never fabricated. Identity is always written.

mod esm;
mod jetstream;
mod motionmark;
mod score;
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
    /// Official `JetStream` Next checkout (pin in `pins.json`) for Default JS workloads.
    #[arg(long)]
    jetstream_dir: Option<PathBuf>,
    /// Official `MotionMark` checkout (pin in `pins.json`) for official HTML workloads.
    #[arg(long)]
    motionmark_dir: Option<PathBuf>,
    /// Apply official `BrowserBench` formulas (`JetStream` 120-iter first/average/worst,
    /// `Speedometer` `1000/geomean` of 32 suite totals over 10 iterations,
    /// `MotionMark` ramp-complexity bootstrap). Does not claim a published
    /// score from a lab subset. `JetStream` uses per-test official counts.
    /// Speedometer uses 10 iterations unless `--iterations` is set.
    #[arg(long)]
    official_score: bool,
}

/// Official BrowserBench scoring is parked (H0-D4 / D2). The flag is accepted
/// so existing scripts do not break; it does not enable wall-clock hacks.
fn official_score_parked(requested: bool) -> bool {
    if requested {
        eprintln!(
            "warning: --official-score is parked (docs/ROADMAP.md D2). Running as a profiling input only."
        );
    }
    false
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
    let opened = match engine.open(OpenRequest {
        url: Some(format!("https://browserbench.org/JetStream/{path}")),
        html: Some(html),
        allow_evaluate: true,
        ..OpenRequest::default()
    }) {
        Ok(o) => o,
        Err(e) => return finish_jetstream(name, revision, Vec::new(), Some(e.to_string())),
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
        engine.close(opened.page);
        return finish_jetstream(name, revision, Vec::new(), Some(e.to_string()));
    }
    // Official DefaultBenchmark: one load, then runIteration(i) N times.
    // Official JetStreamDriver times with performance.now(). That API is
    // virtual unless VECTOR_PERFORMANCE_NOW=wall (set by --official-score).
    let n = iterations.max(1);
    let runner = official_default_runner(n);
    let (samples, last_err) = match engine
        .page_mut(opened.page)
        .and_then(|p| p.evaluate(&runner))
    {
        Ok(v) => match parse_iteration_samples(&v) {
            Ok(samples) => (samples, None),
            Err(e) => (Vec::new(), Some(e)),
        },
        Err(e) => (Vec::new(), Some(e.to_string())),
    };
    engine.close(opened.page);
    finish_jetstream(name, revision, samples, last_err)
}

/// Official `JetStreamDriver.js` `DefaultBenchmark` runner body.
/// Uses `performance.now()` when `VECTOR_PERFORMANCE_NOW=wall`.
fn official_default_runner(iterations: u32) -> String {
    let now = score::jetstream_iteration_now_js();
    format!(
        r#"(function () {{
  var n = {iterations};
  var benchmark = new Benchmark({{ iterationCount: n }});
  var results = [];
  for (var i = 0; i < n; i++) {{
    if (benchmark.prepareForNextIteration) benchmark.prepareForNextIteration();
    if (Math.random && Math.random.__resetSeed) Math.random.__resetSeed();
    var start = {now};
    benchmark.runIteration(i);
    var end = {now};
    results.push(Math.max(1, end - start));
  }}
  if (benchmark.validate) benchmark.validate(n);
  return results;
}})()"#
    )
}

fn parse_iteration_samples(value: &serde_json::Value) -> Result<Vec<u64>, String> {
    let Some(items) = value.as_array() else {
        return Err(format!("official runner did not return an array: {value}"));
    };
    let mut samples = Vec::with_capacity(items.len());
    for item in items {
        let ms = item
            .as_u64()
            .or_else(|| item.as_f64().map(|f| f.max(1.0) as u64));
        match ms {
            Some(n) => samples.push(n.max(1)),
            None => return Err(format!("official runner sample is not a number: {item}")),
        }
    }
    if samples.is_empty() {
        return Err("official runner returned no iteration samples".into());
    }
    Ok(samples)
}

/// Official `AsyncBenchmark`: one load, then init + N×(prepare/runIteration).
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
    let opened = match engine.open(OpenRequest {
        url: Some(format!("https://browserbench.org/JetStream/{path}")),
        html: Some(html),
        allow_evaluate: true,
        ..OpenRequest::default()
    }) {
        Ok(o) => o,
        Err(e) => return finish_jetstream(name, revision, Vec::new(), Some(e.to_string())),
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
        engine.close(opened.page);
        return finish_jetstream(name, revision, Vec::new(), Some(e.to_string()));
    }
    let n = iterations.max(1);
    let (samples, last_err) = match engine
        .page_mut(opened.page)
        .and_then(|p| p.evaluate(&official_async_runner(n)))
    {
        Ok(_) => match wait_async_results(engine, opened.page) {
            Ok(samples) => (samples, None),
            Err(e) => (Vec::new(), Some(e)),
        },
        Err(e) => (Vec::new(), Some(e.to_string())),
    };
    engine.close(opened.page);
    finish_jetstream(name, revision, samples, last_err)
}

fn official_async_runner(iterations: u32) -> String {
    let now = score::jetstream_iteration_now_js();
    format!(
        r#"(function () {{
  if (typeof RegExp.escape !== "function") {{
    RegExp.escape = function (s) {{
      return String(s).replace(/[.*+?^${{}}()|[\]\\]/g, "\\$&");
    }};
  }}
  window.__veJs = {{ done: null, err: null, results: null }};
  var n = {iterations};
  Promise.resolve()
    .then(async function () {{
      var benchmark = new Benchmark({{ iterationCount: n }});
      if (benchmark.init) await benchmark.init();
      var results = [];
      for (var i = 0; i < n; i++) {{
        if (benchmark.prepareForNextIteration) await benchmark.prepareForNextIteration();
        if (Math.random && Math.random.__resetSeed) Math.random.__resetSeed();
        var start = {now};
        await benchmark.runIteration(i);
        var end = {now};
        results.push(Math.max(1, end - start));
      }}
      if (benchmark.validate) benchmark.validate(n);
      window.__veJs.results = results;
      window.__veJs.done = true;
    }})
    .catch(function (e) {{
      var msg = e && e.message ? String(e.message) : String(e);
      var stack = e && e.stack ? String(e.stack) : "";
      window.__veJs.err = msg + (stack && stack.indexOf(msg) < 0 ? "\\n" + stack : stack ? "\\n" + stack : "");
    }});
  return true;
}})()"#
    )
}

const ASYNC_STATUS: &str = r#"(function () {
  var s = window.__veJs || {};
  if (s.err) return "err:" + s.err;
  if (s.done) return "ok";
  return "pending";
})()"#;

const ASYNC_RESULTS: &str = r#"(function () {
  var s = window.__veJs || {};
  return s.results || [];
})()"#;

fn async_poll_limit() -> usize {
    let secs = std::env::var("VECTOR_EVALUATE_DEADLINE_SECS")
        .ok()
        .and_then(|s| s.parse::<u64>().ok())
        .unwrap_or(240);
    ((secs * 1000) / 25).max(120) as usize
}

fn wait_async(engine: &mut VectorEngine, page: ve_api::PageId) -> Result<(), String> {
    for _ in 0..async_poll_limit() {
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
            return Err(with_console(engine, page, err.to_owned()));
        }
        if let Some(err) = text.strip_prefix("\"err:") {
            return Err(with_console(
                engine,
                page,
                err.trim_end_matches('"').to_owned(),
            ));
        }
        std::thread::sleep(std::time::Duration::from_millis(25));
    }
    Err(with_console(
        engine,
        page,
        "async runIteration did not finish".into(),
    ))
}

fn wait_async_results(engine: &mut VectorEngine, page: ve_api::PageId) -> Result<Vec<u64>, String> {
    wait_async(engine, page)?;
    let value = engine
        .page_mut(page)
        .and_then(|p| p.evaluate(ASYNC_RESULTS))
        .map_err(|e| e.to_string())?;
    parse_iteration_samples(&value)
}

fn with_console(engine: &mut VectorEngine, page: ve_api::PageId, err: String) -> String {
    let lines = engine
        .page_mut(page)
        .map(|p| {
            p.console()
                .iter()
                .rev()
                .take(12)
                .map(|l| format!("{}: {}", l.level, l.message))
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();
    if lines.is_empty() {
        err
    } else {
        format!("{err}\nconsole:\n{}", lines.join("\n"))
    }
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

fn iterations_explicit() -> bool {
    std::env::args().any(|a| a == "--iterations" || a.starts_with("--iterations="))
}

fn jetstream_official_attribution(
    suites: &[SuiteResult],
    official_score: bool,
    iterations: u32,
) -> serde_json::Value {
    let jet = suites
        .iter()
        .filter(|s| s.name.starts_with("jetstream.") && s.status != "NOTRUN")
        .collect::<Vec<_>>();
    let passed = jet.iter().filter(|s| s.status == "PASS").count();
    let scores: Vec<f64> = jet
        .iter()
        .filter_map(|s| {
            let samples = s.samples_ms.as_deref()?;
            Some(score::official_default_score(samples, jetstream::official_plan(&s.name).1)?.score)
        })
        .collect();
    let per_test: serde_json::Map<String, serde_json::Value> = jet
        .iter()
        .filter_map(|s| {
            let samples = s.samples_ms.as_deref()?;
            let scored =
                score::official_default_score(samples, jetstream::official_plan(&s.name).1)?;
            Some((
                s.name.clone(),
                json!({
                    "firstMs": scored.first_ms,
                    "averageMs": scored.average_ms,
                    "worstMs": scored.worst_ms,
                    "firstScore": scored.first_score,
                    "averageScore": scored.average_score,
                    "worstScore": scored.worst_score,
                    "score": scored.score,
                }),
            ))
        })
        .collect();
    let geomean = if official_score && scores.len() == jet.len() && !scores.is_empty() {
        score::geomean(&scores)
    } else {
        None
    };
    let clock = score::jetstream_iteration_clock();
    let published = official_score
        && score::published_jetstream_ready_with_clock(iterations, jet.len(), clock)
        && scores.len() == jet.len()
        && jet.iter().all(|s| s.status == "PASS")
        && geomean.is_some();
    json!({
        "formula": "JetStreamDriver.js toScore=5000/max(ms,1); DefaultBenchmark first/average/worst4; overall geomean of per-test scores",
        "runner": "same-page new Benchmark({iterationCount:N}); for i in 0..N runIteration(i)",
        "clock": clock,
        "defaultIterationCount": score::DEFAULT_ITERATION_COUNT,
        "defaultWorstCaseCount": score::DEFAULT_WORST_CASE_COUNT,
        "applied": official_score,
        "iterationsUsed": iterations,
        "officialPerTestCounts": official_score,
        "scoredTests": scores.len(),
        "executedTests": jet.len(),
        "passedTests": passed,
        "perTest": per_test,
        "geomean": geomean,
        "officialJetStreamGeometricMean": published,
        "note": "A 1-iteration lab p50 is not a published score. --official-score sets VECTOR_PERFORMANCE_NOW=wall so performance.now() is Date.now()-timeOrigin. officialJetStreamGeometricMean stays false until every official Default name used official per-test counts timed with that clock."
    })
}

fn speedometer_official_attribution(
    suites: &[SuiteResult],
    official_score: bool,
    iterations: u32,
    iteration_scores: &[f64],
) -> serde_json::Value {
    let sp: Vec<&SuiteResult> = suites
        .iter()
        .filter(|s| s.name.starts_with("speedometer.3.0.") && s.status != "NOTRUN")
        .collect();
    let passed = sp.iter().filter(|s| s.status == "PASS").count();
    let has_official_loop = !iteration_scores.is_empty();
    let displayed = if official_score {
        score::official_speedometer_displayed_score(iteration_scores)
    } else {
        None
    };
    let steps = if official_score {
        score::OFFICIAL_SPEEDOMETER_STEPS
    } else {
        score::LAB_SPEEDOMETER_STEPS
    };
    let published = official_score
        && score::published_speedometer_ready_with_steps(
            iteration_scores.len() as u32,
            passed,
            has_official_loop,
            steps,
        )
        && displayed.is_some()
        && sp.iter().all(|s| s.status == "PASS");
    json!({
        "formula": "Speedometer 3.0 benchmark-runner.mjs geomeanToScore=1000/geomean(suite totals ms); displayed Score is the arithmetic mean of 10 iteration scores",
        "defaultIterationCount": score::SPEEDOMETER_ITERATION_COUNT,
        "defaultSuites": score::SPEEDOMETER_DEFAULT_SUITES,
        "applied": official_score,
        "iterationsUsed": iterations,
        "steps": steps,
        "executedSuites": sp.len(),
        "passedSuites": passed,
        "iterationScores": iteration_scores,
        "displayedScore": displayed,
        "officialSpeedometerScore": published,
        "note": "officialSpeedometerScore is true only for 10 iteration scores from benchmark-runner.mjs Page + tests.mjs steps on all 32 official names. Lab add/finish cannot publish."
    })
}

fn motionmark_official_attribution(
    suites: &[SuiteResult],
    official_score: bool,
    iterations: u32,
) -> serde_json::Value {
    let mut per_test = serde_json::Map::new();
    for s in suites
        .iter()
        .filter(|s| s.name.starts_with("motionmark.1.3."))
    {
        if let Some(detail) = &s.detail
            && let Some(score) = motionmark::ramp_score(detail)
        {
            let name = s.name.trim_start_matches("motionmark.1.3.");
            per_test.insert(name.to_owned(), json!(score));
        }
    }
    let scores: Vec<f64> = per_test.values().filter_map(|v| v.as_f64()).collect();
    let geomean = score::geomean(&scores);
    let ramp_complexity_scores = scores.len();
    let clock = score::motionmark_clock();
    json!({
        "formula": "MotionMark 1.3 results.js ScoreCalculator: controller=ramp, per-test score is bootstrap median of complexity regression, overall is geomean of those scores then sample mean across iterations",
        "defaultTests": score::MOTIONMARK_DEFAULT_TESTS,
        "defaultIterationCount": score::MOTIONMARK_ITERATION_COUNT,
        "applied": official_score,
        "clock": clock,
        "iterationsUsed": iterations,
        "perTest": per_test,
        "geomean": geomean,
        "rampComplexityScores": ramp_complexity_scores,
        "officialMotionMarkGeometricMean": official_score
            && score::published_motionmark_ready_with_clock(ramp_complexity_scores, clock),
        "note": "Ramp ScoreCalculator publishes only when timed with performance.now(). --official-score sets VECTOR_PERFORMANCE_NOW=wall. officialMotionMarkGeometricMean stays false until all 8 official names have ramp-complexity bootstrap scores on that clock."
    })
}

fn main() -> Result<()> {
    let mut args = Args::parse();
    args.official_score = official_score_parked(args.official_score);
    let iterations = if args.official_score && !iterations_explicit() {
        score::DEFAULT_ITERATION_COUNT
    } else {
        args.iterations
    };
    // Official 120-iter async loops (kotlin/typescript) exceed the 90s script cap.
    if args.official_score && std::env::var_os("VECTOR_SCRIPT_DEADLINE_SECS").is_none() {
        unsafe { std::env::set_var("VECTOR_SCRIPT_DEADLINE_SECS", "300") };
    }
    // Official TodoMVC-JavaScript-ES5 is the review's 54–68s profiling target.
    // The default 20s script deadline aborts boot before attribution exists.
    if std::env::var_os("VECTOR_SCRIPT_DEADLINE_SECS").is_none() {
        // Safety: process start, no other threads yet.
        unsafe { std::env::set_var("VECTOR_SCRIPT_DEADLINE_SECS", "90") };
    }
    // Official Complex-DOM add/delete exceeds the 60s evaluate default.
    // Do not raise the engine-wide default (runaway evaluate tests stay 60s).
    if std::env::var_os("VECTOR_EVALUATE_DEADLINE_SECS").is_none() {
        unsafe {
            std::env::set_var(
                "VECTOR_EVALUATE_DEADLINE_SECS",
                if args.official_score { "300" } else { "240" },
            )
        };
    }
    if !args.gate && std::env::var_os("VECTOR_BROWSERBENCH_SUITE_DEADLINE_SECS").is_none() {
        unsafe { std::env::set_var("VECTOR_BROWSERBENCH_SUITE_DEADLINE_SECS", "300") };
    }
    // Official transformersjs-bert ONNX + leftover suite heap exceeds V8's default ~1.4GB.
    if std::env::var_os("VECTOR_V8_HEAP_MB").is_none() {
        unsafe { std::env::set_var("VECTOR_V8_HEAP_MB", "4096") };
    }
    // Official JetStreamDriver / MotionMark time-measurement:performance.
    // Default performance.now() is virtual; wall rebase is official-score only.
    if args.official_score && std::env::var_os("VECTOR_PERFORMANCE_NOW").is_none() {
        unsafe { std::env::set_var("VECTOR_PERFORMANCE_NOW", "wall") };
    }
    let mut engine = VectorEngine::new(EngineConfig {
        viewport: Size::new(1280.0, 720.0),
        offline: true,
        scripting: cfg!(feature = "v8"),
        policy: ve_api::NetworkPolicy::permissive(),
        shaper: ve_api::ShaperKind::System,
        ..EngineConfig::default()
    });
    let speedometer_iterations = if args.official_score && !iterations_explicit() {
        score::SPEEDOMETER_ITERATION_COUNT
    } else {
        args.iterations
    };
    let motionmark_iterations = if args.official_score && !iterations_explicit() {
        score::MOTIONMARK_ITERATION_COUNT
    } else {
        args.iterations
    };
    let only = args.only.as_str();
    let mut suites = Vec::new();
    let mut speedometer_iteration_scores = Vec::new();
    if only == "all" || only == "jetstream" {
        let jetstream_dir = args
            .jetstream_dir
            .clone()
            .or_else(|| std::env::var_os("VECTOR_JETSTREAM_DIR").map(PathBuf::from));
        suites.extend(jetstream::run(
            &mut engine,
            iterations,
            jetstream_dir.as_deref(),
            args.official_score && !iterations_explicit(),
        ));
    }
    if only == "all" || only == "speedometer" {
        if args.official_score && !args.gate {
            let (sp, scores) =
                speedometer::run_official_score_loop(&mut engine, speedometer_iterations);
            suites.extend(sp);
            speedometer_iteration_scores = scores;
        } else {
            suites.extend(speedometer::run_official(
                &mut engine,
                speedometer_iterations,
                args.gate,
            ));
        }
        suites.push(speedometer_class(
            &mut engine,
            speedometer_iterations.min(3),
        ));
    }
    if only == "all" || only == "motionmark" {
        let motionmark_dir = args
            .motionmark_dir
            .clone()
            .or_else(|| std::env::var_os("VECTOR_MOTIONMARK_DIR").map(PathBuf::from));
        suites.extend(motionmark::run(
            &mut engine,
            motionmark_iterations,
            motionmark_dir.as_deref(),
            args.official_score,
        ));
        suites.push(motionmark_class(&mut engine, motionmark_iterations));
        suites.push(motionmark::run_gpu(motionmark_iterations));
    }
    let official_jetstream =
        jetstream_official_attribution(&suites, args.official_score, iterations);
    let official_speedometer = speedometer_official_attribution(
        &suites,
        args.official_score,
        speedometer_iterations,
        &speedometer_iteration_scores,
    );
    let official_motionmark =
        motionmark_official_attribution(&suites, args.official_score, motionmark_iterations);
    let official_full_suite = official_jetstream
        .get("officialJetStreamGeometricMean")
        .and_then(|v| v.as_bool())
        == Some(true)
        && official_speedometer
            .get("officialSpeedometerScore")
            .and_then(|v| v.as_bool())
            == Some(true)
        && official_motionmark
            .get("officialMotionMarkGeometricMean")
            .and_then(|v| v.as_bool())
            == Some(true);
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
            "officialFullSuite": official_full_suite,
            "officialJetStream": official_jetstream,
            "officialSpeedometer": official_speedometer,
            "officialMotionMark": official_motionmark,
            "gate": args.gate,
            "source": "official JetStream Next SunSpider group (12) plus speedometer.3.0.* and official MotionMark 1.3 names",
            "jetstreamSunspider": {
                "executed": suites.iter().filter(|s| s.name.starts_with("jetstream.") && s.status != "NOTRUN").count(),
                "passed": suites.iter().filter(|s| s.name.starts_with("jetstream.") && s.status == "PASS").count(),
                "failed": suites.iter().filter(|s| s.name.starts_with("jetstream.") && s.status == "FAIL").count(),
                "officialGroup": 12,
                "note": "Official SunSpider group plus Default JS from --jetstream-dir, including zlib .z, AsyncBenchmark, startup/SSR/TypeScript-lib, late-eval mandreel/pdfjs, and WasmEMCC/Default wasm through Dart-flute-todomvc, Kotlin-compose, dotnet-interp/aot, and transformersjs-bert. Not a JetStream Next geometric-mean published score."
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
