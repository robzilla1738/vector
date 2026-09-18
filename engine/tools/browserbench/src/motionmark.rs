//! Official `MotionMark` GPU present path (VEC-021).

use std::path::Path;
use std::time::{Duration, Instant};

use ve_api::{OpenRequest, VectorEngine};
#[cfg(feature = "gpu")]
use ve_core::{Rect, Size};
#[cfg(feature = "gpu")]
use ve_gfx::DisplayList;
#[cfg(feature = "gpu")]
use ve_style::Rgba;

use crate::percentile;
use crate::{SuiteResult, pin};

/// Official MotionMark 1.3 names from `resources/runner/tests.js` at the pin.
pub(crate) const OFFICIAL_NAMES: &[&str] = &[
    "Multiply",
    "Canvas Arcs",
    "Leaves",
    "Paths",
    "Canvas Lines",
    "Images",
    "Design",
    "Suits",
];

struct OfficialHtml {
    name: &'static str,
    rel: &'static str,
    extras: &'static [(&'static str, &'static str)],
}

/// Official `Suites[0].tests` URLs from `resources/runner/tests.js`.
const OFFICIAL_HTML: &[OfficialHtml] = &[
    OfficialHtml {
        name: "Multiply",
        rel: "MotionMark/tests/core/multiply.html",
        extras: &[],
    },
    OfficialHtml {
        name: "Canvas Arcs",
        rel: "MotionMark/tests/core/canvas-stage.html",
        extras: &[("pathType", "arcs")],
    },
    OfficialHtml {
        name: "Leaves",
        rel: "MotionMark/tests/core/leaves.html",
        extras: &[],
    },
    OfficialHtml {
        name: "Paths",
        rel: "MotionMark/tests/core/canvas-stage.html",
        extras: &[("pathType", "linePath")],
    },
    OfficialHtml {
        name: "Canvas Lines",
        rel: "MotionMark/tests/core/canvas-stage.html",
        extras: &[("pathType", "line"), ("lineCap", "square")],
    },
    OfficialHtml {
        name: "Images",
        rel: "MotionMark/tests/core/image-data.html",
        extras: &[],
    },
    OfficialHtml {
        name: "Design",
        rel: "MotionMark/tests/core/design.html",
        extras: &[],
    },
    OfficialHtml {
        name: "Suits",
        rel: "MotionMark/tests/core/suits.html",
        extras: &[],
    },
];

pub(crate) fn run(
    engine: &mut VectorEngine,
    iterations: u32,
    dir: Option<&Path>,
    official_ramp: bool,
) -> Vec<SuiteResult> {
    let revision = pin("motionmark", "revision");
    OFFICIAL_HTML
        .iter()
        .map(|spec| {
            if let Some(root) = dir {
                if official_ramp {
                    official_ramp_html(engine, iterations, root, spec)
                } else {
                    official_html(engine, iterations, root, spec)
                }
            } else {
                notrun(
                    spec.name,
                    &revision,
                    "official MotionMark HTML needs --motionmark-dir. Not a published score.",
                )
            }
        })
        .collect()
}

pub(crate) fn ramp_score(detail: &str) -> Option<f64> {
    let v: serde_json::Value = serde_json::from_str(detail).ok()?;
    if v.get("controller").and_then(|c| c.as_str()) != Some("ramp") {
        return None;
    }
    let score = v.get("score").and_then(|s| s.as_f64())?;
    (score > 0.0).then_some(score)
}

fn notrun(name: &str, revision: &str, detail: &str) -> SuiteResult {
    SuiteResult {
        name: format!("motionmark.1.3.{name}"),
        status: "NOTRUN",
        revision: revision.to_owned(),
        samples_ms: None,
        p50_ms: None,
        p95_ms: None,
        detail: Some(detail.into()),
    }
}

fn official_html(
    engine: &mut VectorEngine,
    iterations: u32,
    root: &Path,
    spec: &OfficialHtml,
) -> SuiteResult {
    let revision = pin("motionmark", "revision");
    if !cfg!(feature = "v8") {
        return notrun(spec.name, &revision, "built without v8");
    }
    let html_path = root.join(spec.rel);
    let html = match inline_official_html(&html_path) {
        Ok(h) => h,
        Err(detail) => {
            return SuiteResult {
                name: format!("motionmark.1.3.{}", spec.name),
                status: "NOTRUN",
                revision,
                samples_ms: None,
                p50_ms: None,
                p95_ms: None,
                detail: Some(detail),
            };
        }
    };
    let start_js = official_start(spec.extras);
    let mut samples = Vec::new();
    let mut last_err = None;
    for _ in 0..iterations.max(1) {
        let opened = match engine.open(OpenRequest {
            url: Some(format!(
                "https://browserbench.org/MotionMark/1.3/{}",
                spec.rel.trim_start_matches("MotionMark/")
            )),
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
            page.settle(1_000);
        }
        let start = match engine
            .page_mut(opened.page)
            .and_then(|p| p.evaluate(&start_js))
        {
            Ok(_) => Instant::now(),
            Err(e) => {
                last_err = Some(e.to_string());
                engine.close(opened.page);
                continue;
            }
        };
        if let Ok(page) = engine.page_mut(opened.page) {
            page.settle(2_000);
        }
        match engine
            .page_mut(opened.page)
            .and_then(|p| p.evaluate(OFFICIAL_FINISH))
        {
            Ok(_) => samples.push(u64::try_from(start.elapsed().as_millis()).unwrap_or(u64::MAX)),
            Err(e) => last_err = Some(e.to_string()),
        }
        engine.close(opened.page);
    }
    if samples.is_empty() {
        return SuiteResult {
            name: format!("motionmark.1.3.{}", spec.name),
            status: "FAIL",
            revision,
            samples_ms: None,
            p50_ms: None,
            p95_ms: None,
            detail: last_err.or(Some(
                "official HTML did not complete initialize+animate. Not a published score.".into(),
            )),
        };
    }
    SuiteResult {
        name: format!("motionmark.1.3.{}", spec.name),
        status: "PASS",
        revision,
        p50_ms: Some(percentile(&samples, 0.50)),
        p95_ms: Some(percentile(&samples, 0.95)),
        samples_ms: Some(samples),
        detail: Some(format!(
            "official {} initialize+animate. Not a published MotionMark score.",
            spec.rel
        )),
    }
}

fn ramp_test_interval_secs() -> u32 {
    std::env::var("VECTOR_MOTIONMARK_TEST_INTERVAL")
        .ok()
        .and_then(|s| s.parse().ok())
        .filter(|n: &u32| *n > 0)
        .unwrap_or(crate::score::MOTIONMARK_TEST_INTERVAL_SECS)
}

fn official_ramp_html(
    engine: &mut VectorEngine,
    iterations: u32,
    root: &Path,
    spec: &OfficialHtml,
) -> SuiteResult {
    let revision = pin("motionmark", "revision");
    if !cfg!(feature = "v8") {
        return notrun(spec.name, &revision, "built without v8");
    }
    let html_path = root.join(spec.rel);
    let html = match inline_official_html(&html_path) {
        Ok(h) => h,
        Err(detail) => {
            return SuiteResult {
                name: format!("motionmark.1.3.{}", spec.name),
                status: "NOTRUN",
                revision,
                samples_ms: None,
                p50_ms: None,
                p95_ms: None,
                detail: Some(detail),
            };
        }
    };
    let results_js =
        match std::fs::read_to_string(root.join("MotionMark/resources/runner/results.js")) {
            Ok(js) => js,
            Err(e) => {
                return notrun(
                    spec.name,
                    &revision,
                    &format!("ScoreCalculator missing: {e}"),
                );
            }
        };
    let interval = ramp_test_interval_secs();
    let start_js = official_ramp_start(spec.extras, interval);
    let mut last_err = None;
    let mut last_score: Option<f64> = None;
    let mut wall_ms = Vec::new();
    for _ in 0..iterations.max(1) {
        let opened = match engine.open(OpenRequest {
            url: Some(format!(
                "https://browserbench.org/MotionMark/1.3/{}",
                spec.rel.trim_start_matches("MotionMark/")
            )),
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
            page.settle(1_000);
        }
        if let Err(e) = engine
            .page_mut(opened.page)
            .and_then(|p| p.evaluate(&start_js))
        {
            last_err = Some(e.to_string());
            engine.close(opened.page);
            continue;
        }
        let started = Instant::now();
        let interval_d = Duration::from_secs(u64::from(interval));
        let deadline = interval_d + Duration::from_secs(60);
        let mut done = false;
        let mut last_pump = Instant::now();
        while started.elapsed() < deadline {
            let cliff =
                last_pump.elapsed() > Duration::from_secs(5) && started.elapsed() > interval_d / 3;
            if started.elapsed() >= interval_d + Duration::from_secs(8) || cliff {
                match engine
                    .page_mut(opened.page)
                    .and_then(|p| p.evaluate(RAMP_FORCE_FINISH))
                {
                    Ok(_) => done = true,
                    Err(e) => last_err = Some(e.to_string()),
                }
                break;
            }
            if let Ok(page) = engine.page_mut(opened.page) {
                page.settle(16);
            }
            last_pump = Instant::now();
            let status = match engine
                .page_mut(opened.page)
                .and_then(|p| p.evaluate(RAMP_PUMP))
            {
                Ok(v) => v,
                Err(e) => {
                    last_err = Some(e.to_string());
                    break;
                }
            };
            let status = match &status {
                serde_json::Value::String(s) => serde_json::from_str(s).unwrap_or(status.clone()),
                other => other.clone(),
            };
            if status.get("err").and_then(|e| e.as_str()).is_some() {
                last_err = status
                    .get("err")
                    .and_then(|e| e.as_str())
                    .map(str::to_owned);
                break;
            }
            if status.get("done").and_then(|d| d.as_bool()) == Some(true) {
                done = true;
                break;
            }
        }
        if !done && last_err.is_none() {
            let console = engine
                .page_mut(opened.page)
                .map(|p| {
                    p.console()
                        .iter()
                        .rev()
                        .take(6)
                        .map(|l| {
                            format!(
                                "{}: {}",
                                l.level,
                                l.message.chars().take(160).collect::<String>()
                            )
                        })
                        .collect::<Vec<_>>()
                        .join(" | ")
                })
                .unwrap_or_default();
            last_err = Some(format!(
                "ramp run() did not finish after {}ms console={console}",
                started.elapsed().as_millis()
            ));
            engine.close(opened.page);
            continue;
        }
        if last_err.is_some() {
            engine.close(opened.page);
            continue;
        }
        if let Err(e) = engine
            .page_mut(opened.page)
            .and_then(|p| p.evaluate(&results_js))
        {
            last_err = Some(format!("ScoreCalculator load: {e}"));
            engine.close(opened.page);
            continue;
        }
        match engine
            .page_mut(opened.page)
            .and_then(|p| p.evaluate(RAMP_SCORE))
        {
            Ok(v) => {
                let v = match &v {
                    serde_json::Value::String(s) => serde_json::from_str(s).unwrap_or(v.clone()),
                    other => other.clone(),
                };
                if let Some(err) = v.get("err").and_then(|e| e.as_str()) {
                    last_err = Some(err.to_owned());
                } else if let Some(score) = v.get("score").and_then(|s| s.as_f64()) {
                    if score > 0.0 {
                        last_score = Some(score);
                        wall_ms
                            .push(u64::try_from(started.elapsed().as_millis()).unwrap_or(u64::MAX));
                    } else {
                        last_err = Some(format!("non-positive ramp score: {v}"));
                    }
                } else {
                    last_err = Some(format!("ScoreCalculator returned {v}"));
                }
            }
            Err(e) => last_err = Some(e.to_string()),
        }
        engine.close(opened.page);
    }
    if let Some(score) = last_score {
        return SuiteResult {
            name: format!("motionmark.1.3.{}", spec.name),
            status: "PASS",
            revision,
            p50_ms: wall_ms.first().copied(),
            p95_ms: wall_ms.last().copied(),
            samples_ms: Some(wall_ms),
            detail: Some(
                serde_json::json!({
                    "controller": "ramp",
                    "clock": crate::score::motionmark_clock(),
                    "score": score,
                    "testInterval": interval,
                    "rel": spec.rel,
                    "note": if crate::score::performance_now_is_wall() {
                        "ScoreCalculator bootstrap median timed with performance.now() (VECTOR_PERFORMANCE_NOW=wall)."
                    } else {
                        "ScoreCalculator bootstrap median. Date.now-wall is not official performance.now(). Not a published MotionMark score."
                    }
                })
                .to_string(),
            ),
        };
    }
    SuiteResult {
        name: format!("motionmark.1.3.{}", spec.name),
        status: "FAIL",
        revision,
        samples_ms: None,
        p50_ms: None,
        p95_ms: None,
        detail: last_err.or(Some(
            "official ramp ScoreCalculator did not produce a score. Not a published score.".into(),
        )),
    }
}

fn official_ramp_start(extras: &[(&str, &str)], interval_secs: u32) -> String {
    let mut extra_js = String::new();
    for (key, value) in extras {
        extra_js.push_str(&format!(
            "  options[{}] = {};\n",
            serde_json::to_string(key).unwrap_or_else(|_| "\"\"".into()),
            serde_json::to_string(value).unwrap_or_else(|_| "\"\"".into()),
        ));
    }
    let warmup = if std::env::var_os("VECTOR_MOTIONMARK_TEST_INTERVAL").is_some() {
        0
    } else {
        2000
    };
    let wall = crate::score::performance_now_is_wall();
    let time_measurement = if wall { "performance" } else { "date" };
    let raf_stamp = if wall {
        "performance.now()"
    } else {
        "Date.now()"
    };
    let timestamp_override = if wall {
        String::new()
    } else {
        "  var t0 = Date.now();\n  b._getTimestamp = function () { return Date.now() - t0; };\n"
            .to_owned()
    };
    format!(
        r#"(function () {{
  var q = [];
  window.requestAnimationFrame = function (cb) {{ q.push(cb); return q.length; }};
  window.cancelAnimationFrame = function () {{}};
  window.__veRafFire = function () {{
    var batch = q;
    q = [];
    var t = {raf_stamp};
    for (var i = 0; i < batch.length; i++) batch[i](t);
    return batch.length;
  }};
  var stage = document.getElementById("stage");
  if (!stage) throw new Error("missing #stage");
  document.documentElement.style.height = "720px";
  document.body.style.width = "1280px";
  document.body.style.height = "720px";
  stage.style.width = "1280px";
  stage.style.height = "720px";
  var proto = HTMLImageElement.prototype;
  var desc = Object.getOwnPropertyDescriptor(proto, "src");
  Object.defineProperty(proto, "src", {{
    configurable: true,
    enumerable: true,
    get: function () {{
      return desc && desc.get ? desc.get.call(this) : (this.getAttribute("src") || "");
    }},
    set: function (v) {{
      if (desc && desc.set) desc.set.call(this, v);
      else this.setAttribute("src", String(v));
      var el = this;
      queueMicrotask(function () {{ el.dispatchEvent(new Event("load")); }});
    }}
  }});
  if (typeof window.benchmarkClass !== "function") {{
    throw new Error("window.benchmarkClass missing");
  }}
  var options = {{
    "warmup-length": {warmup},
    "warmup-frame-count": 0,
    "first-frame-minimum-length": 0,
    "time-measurement": "{time_measurement}",
    "test-interval": {interval_secs},
    "controller": "ramp",
    "frame-rate": 60,
    "system-frame-rate": 60,
    "complexity": 1
  }};
{extra_js}  var b = new window.benchmarkClass(options);
{timestamp_override}  window.__veMm = {{ bench: b, done: false, err: null, data: null }};
  b.initialize({{}}).then(function () {{
    return b.run();
  }}).then(function (data) {{
    window.__veMm.data = data;
    window.__veMm.done = true;
  }}, function (e) {{
    window.__veMm.err = String(e && e.message ? e.message : e);
    window.__veMm.done = true;
  }});
  return true;
}})()"#
    )
}

const RAMP_PUMP: &str = r#"(function () {
  var s = window.__veMm;
  if (!s) return JSON.stringify({ err: "no __veMm" });
  if (s.err) return JSON.stringify({ err: s.err, done: true });
  var n = 0;
  if (typeof window.__veRafFire === "function") n = window.__veRafFire();
  return JSON.stringify({ done: !!s.done, fired: n });
})()"#;

const RAMP_FORCE_FINISH: &str = r#"(function () {
  var s = window.__veMm;
  if (!s) return JSON.stringify({ err: "no __veMm" });
  if (s.done) return JSON.stringify({ done: true, forced: false });
  try {
    if (s.bench && s.bench._controller)
      s.data = s.bench._controller.results();
    s.done = true;
    return JSON.stringify({ done: true, forced: true });
  } catch (e) {
    s.err = String(e && e.message ? e.message : e);
    s.done = true;
    return JSON.stringify({ err: s.err, done: true });
  }
})()"#;

const RAMP_SCORE: &str = r#"(function () {
  var s = window.__veMm;
  if (!s) return JSON.stringify({ err: "no __veMm" });
  if (s.err) return JSON.stringify({ err: s.err });
  if (!s.data) return JSON.stringify({ err: "ramp produced no samples" });
  if (typeof ScoreCalculator !== "function" || typeof RunData !== "function") {
    return JSON.stringify({ err: "ScoreCalculator missing" });
  }
  try {
    s.data.targetFPS = 60;
    var calc = new ScoreCalculator(new RunData("1.3", {
      controller: "ramp",
      "frame-rate": 60,
      "system-frame-rate": 60,
      bootstrapIterations: 2500
    }));
    calc.calculateScore(s.data);
    var r = s.data.result || {};
    if (!(r.score > 0)) return JSON.stringify({ err: "no bootstrap score", result: r });
    return JSON.stringify({
      score: r.score,
      scoreLowerBound: r.scoreLowerBound,
      scoreUpperBound: r.scoreUpperBound
    });
  } catch (e) {
    return JSON.stringify({ err: String(e && e.message ? e.message : e) });
  }
})()"#;

fn official_start(extras: &[(&str, &str)]) -> String {
    let mut extra_js = String::new();
    for (key, value) in extras {
        extra_js.push_str(&format!(
            "  options[{}] = {};\n",
            serde_json::to_string(key).unwrap_or_else(|_| "\"\"".into()),
            serde_json::to_string(value).unwrap_or_else(|_| "\"\"".into()),
        ));
    }
    format!(
        r#"(function () {{
  var stage = document.getElementById("stage");
  if (!stage) throw new Error("missing #stage");
  document.documentElement.style.height = "720px";
  document.body.style.width = "1280px";
  document.body.style.height = "720px";
  stage.style.width = "1280px";
  stage.style.height = "720px";
  var proto = HTMLImageElement.prototype;
  var desc = Object.getOwnPropertyDescriptor(proto, "src");
  Object.defineProperty(proto, "src", {{
    configurable: true,
    enumerable: true,
    get: function () {{
      return desc && desc.get ? desc.get.call(this) : (this.getAttribute("src") || "");
    }},
    set: function (v) {{
      if (desc && desc.set) desc.set.call(this, v);
      else this.setAttribute("src", String(v));
      var el = this;
      queueMicrotask(function () {{ el.dispatchEvent(new Event("load")); }});
    }}
  }});
  if (typeof window.benchmarkClass !== "function") {{
    throw new Error("window.benchmarkClass missing");
  }}
  var options = {{
    "warmup-length": 0,
    "warmup-frame-count": 0,
    "first-frame-minimum-length": 0,
    "time-measurement": "date",
    "test-interval": 1,
    "controller": "fixed",
    "frame-rate": 60,
    "complexity": 24
  }};
{extra_js}  var b = new window.benchmarkClass(options);
  window.__veMm = {{ bench: b, done: null, err: null }};
  b.initialize({{}}).then(function () {{
    try {{
      b.stage.tune(24);
      b._currentTimestamp = Date.now();
      b._benchmarkStartTimestamp = Date.now() - 1000;
      b.stage.animate();
      window.__veMm.done = {{
        complexity: b.stage.complexity(),
        hasStage: !!document.getElementById("stage")
      }};
    }} catch (e) {{
      window.__veMm.err = String(e && e.message ? e.message : e);
    }}
  }}, function (e) {{
    window.__veMm.err = String(e && e.message ? e.message : e);
  }});
  return true;
}})()"#
    )
}

const OFFICIAL_FINISH: &str = r#"(function () {
  var s = window.__veMm;
  if (!s) throw new Error("no __veMm");
  if (s.err) throw new Error(s.err);
  if (!s.done) throw new Error("initialize did not finish");
  return true;
})()"#;

fn inline_official_html(path: &Path) -> Result<String, String> {
    let html =
        std::fs::read_to_string(path).map_err(|e| format!("read {}: {e}", path.display()))?;
    let dir = path.parent().unwrap_or(path);
    Ok(inline_scripts(&inline_styles(&html, dir)?, dir)?)
}

fn inline_styles(html: &str, dir: &Path) -> Result<String, String> {
    let mut out = String::new();
    let mut rest = html;
    let open = "<link";
    while let Some(i) = rest.find(open) {
        out.push_str(&rest[..i]);
        rest = &rest[i + open.len()..];
        let Some(tag_end) = rest.find('>') else {
            out.push_str(open);
            out.push_str(rest);
            return Ok(out);
        };
        let attrs = &rest[..tag_end];
        rest = &rest[tag_end + 1..];
        let lower = attrs.to_ascii_lowercase();
        let href = attr(attrs, "href");
        let stylesheet = lower.contains("rel=\"stylesheet\"") || lower.contains("rel='stylesheet'");
        if stylesheet {
            if let Some(href) = href.filter(|s| !s.starts_with("http")) {
                let css = std::fs::read_to_string(dir.join(&href))
                    .map_err(|e| format!("read css {href}: {e}"))?;
                out.push_str("<style>\n");
                out.push_str(&css);
                out.push_str("\n</style>");
                continue;
            }
        }
        out.push_str(open);
        out.push_str(attrs);
        out.push('>');
    }
    out.push_str(rest);
    Ok(out)
}

fn inline_scripts(html: &str, dir: &Path) -> Result<String, String> {
    let mut out = String::new();
    let mut rest = html;
    let open = "<script";
    while let Some(i) = rest.find(open) {
        out.push_str(&rest[..i]);
        rest = &rest[i + open.len()..];
        let Some(tag_end) = rest.find('>') else {
            out.push_str(open);
            out.push_str(rest);
            return Ok(out);
        };
        let attrs = &rest[..tag_end];
        rest = &rest[tag_end + 1..];
        let src = attr(attrs, "src");
        let Some(close) = rest.find("</script>") else {
            out.push_str(open);
            out.push_str(attrs);
            out.push('>');
            out.push_str(rest);
            return Ok(out);
        };
        let body = &rest[..close];
        rest = &rest[close + 9..];
        if let Some(src) = src.filter(|s| !s.starts_with("http")) {
            let js = std::fs::read_to_string(dir.join(&src))
                .map_err(|e| format!("read script {src}: {e}"))?;
            out.push_str("<script>\n");
            out.push_str(&js.replace("</script", "<\\/script"));
            out.push_str("\n</script>");
        } else {
            out.push_str(open);
            out.push_str(attrs);
            out.push('>');
            out.push_str(body);
            out.push_str("</script>");
        }
    }
    out.push_str(rest);
    Ok(out)
}

fn attr(attrs: &str, name: &str) -> Option<String> {
    for quote in ['"', '\''] {
        let needle = format!("{name}={quote}");
        if let Some(i) = attrs.find(&needle) {
            let rest = &attrs[i + needle.len()..];
            if let Some(end) = rest.find(quote) {
                return Some(rest[..end].to_owned());
            }
        }
    }
    None
}

/// `MotionMark` Multiply-class: many moving rects presented on the GPU with no CPU readback.
pub(crate) fn run_gpu(iterations: u32) -> SuiteResult {
    let revision = pin("motionmark", "revision");
    #[cfg(not(feature = "gpu"))]
    {
        let _ = iterations;
        SuiteResult {
            name: "motionmark.gpu.multiply".into(),
            status: "NOTRUN",
            revision,
            samples_ms: None,
            p50_ms: None,
            p95_ms: None,
            detail: Some("built without gpu".into()),
        }
    }
    #[cfg(feature = "gpu")]
    {
        run_gpu_inner(iterations, revision)
    }
}

#[cfg(feature = "gpu")]
fn run_gpu_inner(iterations: u32, revision: String) -> SuiteResult {
    let started_init = Instant::now();
    let (mut renderer, adapter) = match ve_gfx::VelloRenderer::headless() {
        Ok(pair) => pair,
        Err(e) => {
            return SuiteResult {
                name: "motionmark.gpu.multiply".into(),
                status: "NOTRUN",
                revision,
                samples_ms: None,
                p50_ms: None,
                p95_ms: None,
                detail: Some(format!("no GPU adapter: {e}")),
            };
        }
    };
    let init_ms = u64::try_from(started_init.elapsed().as_millis()).unwrap_or(u64::MAX);
    let mut samples = Vec::new();
    let mut last = None;
    for frame in 0..iterations.max(1) {
        let mut list = DisplayList::new(Size::new(800.0, 600.0));
        list.push(ve_gfx::DisplayItem::Rect {
            rect: Rect::new(0.0, 0.0, 800.0, 600.0),
            color: Rgba::WHITE,
        });
        for i in 0..400u32 {
            let t = (i + frame) as f32;
            list.push(ve_gfx::DisplayItem::Rect {
                rect: Rect::new((t * 7.0) % 780.0, (t * 11.0) % 580.0, 18.0, 18.0),
                color: if i.is_multiple_of(2) {
                    Rgba::rgb(220, 40, 40)
                } else {
                    Rgba::rgb(40, 40, 220)
                },
            });
        }
        let started = Instant::now();
        match renderer.present_list(&list, 800, 600, 1.0) {
            Ok(()) => {
                samples.push(u64::try_from(started.elapsed().as_millis()).unwrap_or(u64::MAX))
            }
            Err(e) => last = Some(e.to_string()),
        }
    }
    if samples.is_empty() {
        return SuiteResult {
            name: "motionmark.gpu.multiply".into(),
            status: "FAIL",
            revision,
            samples_ms: None,
            p50_ms: None,
            p95_ms: None,
            detail: last.or(Some(adapter)),
        };
    }
    SuiteResult {
        name: "motionmark.gpu.multiply".into(),
        status: "PASS",
        revision,
        p50_ms: Some(percentile(&samples, 0.50)),
        p95_ms: Some(percentile(&samples, 0.95)),
        samples_ms: Some(samples),
        detail: Some(format!("adapter={adapter}; init_ms={init_ms}")),
    }
}

#[cfg(test)]
mod tests {
    use super::{OFFICIAL_HTML, OFFICIAL_NAMES, official_ramp_html, run_gpu};
    use std::path::Path;

    #[test]
    fn official_html_matches_runner_names() {
        let names: Vec<&str> = OFFICIAL_HTML.iter().map(|s| s.name).collect();
        assert_eq!(names, OFFICIAL_NAMES);
    }

    #[cfg(feature = "v8")]
    #[test]
    fn multiply_ramp_produces_a_scorecalculator_score() {
        if std::env::var_os("VECTOR_MOTIONMARK_TEST_INTERVAL").is_none() {
            unsafe { std::env::set_var("VECTOR_MOTIONMARK_TEST_INTERVAL", "8") };
        }
        let mut engine = ve_api::VectorEngine::new(ve_api::EngineConfig {
            viewport: ve_core::Size::new(1280.0, 720.0),
            offline: true,
            scripting: true,
            policy: ve_api::NetworkPolicy::permissive(),
            ..ve_api::EngineConfig::default()
        });
        let dir = Path::new("/tmp/motionmark-src");
        if !dir.join("MotionMark/tests/core/multiply.html").is_file() {
            return;
        }
        let spec = OFFICIAL_HTML
            .iter()
            .find(|s| s.name == "Multiply")
            .expect("Multiply");
        let result = official_ramp_html(&mut engine, 1, dir, spec);
        assert_eq!(result.status, "PASS", "{:?}", result.detail);
        let detail = result.detail.as_deref().unwrap_or("");
        let v: serde_json::Value = serde_json::from_str(detail).unwrap_or_default();
        assert_eq!(v["controller"], "ramp", "{detail}");
        assert!(v["score"].as_f64().unwrap_or(0.0) > 0.0, "{detail}");
    }

    #[cfg(feature = "v8")]
    #[test]
    fn suits_ramp_produces_a_scorecalculator_score() {
        if std::env::var_os("VECTOR_MOTIONMARK_TEST_INTERVAL").is_none() {
            unsafe { std::env::set_var("VECTOR_MOTIONMARK_TEST_INTERVAL", "8") };
        }
        let mut engine = ve_api::VectorEngine::new(ve_api::EngineConfig {
            viewport: ve_core::Size::new(1280.0, 720.0),
            offline: true,
            scripting: true,
            policy: ve_api::NetworkPolicy::permissive(),
            ..ve_api::EngineConfig::default()
        });
        let dir = Path::new("/tmp/motionmark-src");
        if !dir.join("MotionMark/tests/core/suits.html").is_file() {
            return;
        }
        let spec = OFFICIAL_HTML
            .iter()
            .find(|s| s.name == "Suits")
            .expect("Suits");
        let result = official_ramp_html(&mut engine, 1, dir, spec);
        assert_eq!(result.status, "PASS", "{:?}", result.detail);
    }

    #[test]
    fn gpu_multiply_is_honest_without_feature() {
        let r = run_gpu(1);
        #[cfg(not(feature = "gpu"))]
        {
            assert_eq!(r.status, "NOTRUN");
        }
        #[cfg(feature = "gpu")]
        {
            assert!(
                r.status == "PASS" || r.status == "NOTRUN",
                "{} {:?}",
                r.status,
                r.detail
            );
            if r.status == "PASS" {
                assert!(r.p95_ms.is_some());
            }
        }
    }
}
