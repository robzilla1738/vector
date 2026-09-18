//! Official `MotionMark` GPU present path (VEC-021).

use std::path::Path;
use std::time::Instant;

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
) -> Vec<SuiteResult> {
    let revision = pin("motionmark", "revision");
    OFFICIAL_HTML
        .iter()
        .map(|spec| {
            if let Some(root) = dir {
                official_html(engine, iterations, root, spec)
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
    use super::{OFFICIAL_HTML, OFFICIAL_NAMES, run_gpu};

    #[test]
    fn official_html_matches_runner_names() {
        let names: Vec<&str> = OFFICIAL_HTML.iter().map(|s| s.name).collect();
        assert_eq!(names, OFFICIAL_NAMES);
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
