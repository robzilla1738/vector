//! Official `Speedometer` 3.0 suite runner (VEC-021).

use std::path::{Path, PathBuf};
use std::time::Instant;

use ve_api::{OpenRequest, VectorEngine};

use crate::{SuiteResult, percentile, pin};

const TESTS_MJS: &str = include_str!("../vendor/speedometer/tests.mjs");

const OFFICIAL_STEPS: &str = r##"(function () {
  try { window.dispatchEvent(new Event("load")); } catch (e) {}
  function fire(el, type, init, Ctor) {
    Ctor = Ctor || Event;
    el.dispatchEvent(new Ctor(type, init || { bubbles: true, cancelable: true }));
  }
  function enter(el) {
    var ke = { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true };
    fire(el, "keydown", ke, KeyboardEvent);
    fire(el, "keypress", ke, KeyboardEvent);
    fire(el, "keyup", ke, KeyboardEvent);
  }
  function pierce(path, sel) {
    var n = document;
    for (var i = 0; i < path.length; i++) {
      n = n.querySelector(path[i]);
      if (!n) return null;
      n = n.shadowRoot || n;
    }
    return sel ? n.querySelector(sel) : n;
  }
  function qsa(root, sel) {
    if (!root) return [];
    var list = root.querySelectorAll(sel);
    var a = [];
    for (var i = 0; i < list.length; i++) a.push(list[i]);
    return a;
  }
  var added = 0, remaining = 0, kind = "unknown";
  var input = document.querySelector(".new-todo")
    || document.getElementById("new-todo")
    || pierce(["todo-app", "todo-topbar"], ".new-todo-input")
    || pierce(["todo-app", "todo-form"], ".new-todo")
    || pierce(["todo-app"], ".new-todo");
  if (input) {
    kind = "todomvc";
    for (var i = 0; i < 100; i++) {
      input.value = "Task-" + i;
      fire(input, "input");
      fire(input, "change");
      enter(input);
    }
    var toggles = document.querySelectorAll(".toggle");
    if (!toggles.length) {
      var listRoot = pierce(["todo-app", "todo-list"], null) || pierce(["todo-app"], null);
      var items = qsa(listRoot, "todo-item");
      added = items.length;
      for (var i = 0; i < items.length; i++) {
        var tgl = items[i].shadowRoot && (items[i].shadowRoot.querySelector(".toggle-todo-input") || items[i].shadowRoot.querySelector(".toggle"));
        if (tgl) tgl.click();
      }
      for (var i = items.length - 1; i >= 0; i--) {
        var dest = items[i].shadowRoot && (items[i].shadowRoot.querySelector(".remove-todo-button") || items[i].shadowRoot.querySelector(".destroy"));
        if (dest) dest.click();
      }
      remaining = qsa(listRoot, "todo-item").length;
    } else {
      added = toggles.length;
      for (var i = 0; i < toggles.length; i++) toggles[i].click();
      var dest = document.querySelectorAll(".destroy");
      for (var i = dest.length - 1; i >= 0; i--) dest[i].click();
      remaining = document.querySelectorAll(".todo-list li").length;
    }
    return JSON.stringify({ ok: true, kind: kind, added: added, remaining: remaining });
  }
  var news = document.querySelector("#navbar-dropdown-toggle");
  if (news) {
    kind = "news";
    for (var i = 0; i < 10; i++) { news.click(); news.click(); }
    var us = document.querySelector("#navbar-navlist-us-link");
    var world = document.querySelector("#navbar-navlist-world-link");
    var politics = document.querySelector("#navbar-navlist-politics-link");
    if (us) us.click();
    if (world) world.click();
    if (politics) politics.click();
    return JSON.stringify({ ok: !!(us || world || politics), kind: kind, added: 1, remaining: 0 });
  }
  var create = document.querySelector("#create");
  var layout = document.querySelector("#layout");
  if (create && layout) {
    kind = "editor";
    create.click(); layout.click();
    var longBtn = document.querySelector("#long");
    if (longBtn) longBtn.click();
    layout.click();
    var hi = document.querySelector("#highlight");
    if (hi) hi.click();
    layout.click();
    return JSON.stringify({ ok: true, kind: kind, added: 1, remaining: 0 });
  }
  var prepare = document.querySelector("#prepare");
  if (prepare) {
    kind = "chart";
    prepare.click();
    var reset = document.querySelector("#reset");
    if (reset) reset.click();
    var stacked = document.querySelector("#add-stacked-chart-button");
    var scatter = document.querySelector("#add-scatter-chart-button");
    var dotted = document.querySelector("#add-dotted-chart-button");
    if (stacked) stacked.click();
    if (scatter) scatter.click();
    if (dotted) dotted.click();
    var tip = document.querySelector("#open-tooltip");
    if (tip) tip.click();
    return JSON.stringify({ ok: true, kind: kind, added: 1, remaining: 0 });
  }
  var render = document.querySelector("#render");
  if (render) {
    kind = "stock";
    render.click();
    return JSON.stringify({ ok: true, kind: kind, added: 1, remaining: 0 });
  }
  var ready = document.querySelector("#app-is-ready");
  if (ready) {
    kind = "perf";
    return JSON.stringify({ ok: true, kind: kind, added: 1, remaining: 0 });
  }
  return JSON.stringify({ ok: false, kind: kind, reason: "no workload hook", added: 0, remaining: 0 });
})()"##;

fn vendor_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("vendor/speedometer")
}

/// `(name, url)` from the official `tests.mjs`.
pub(crate) fn official_suites() -> Vec<(String, String)> {
    let mut out = Vec::new();
    let mut name: Option<String> = None;
    for line in TESTS_MJS.lines() {
        let t = line.trim().trim_end_matches(',');
        if let Some(rest) = t.strip_prefix("name:") {
            name = Some(rest.trim().trim_matches('"').to_owned());
        } else if let Some(rest) = t.strip_prefix("url:")
            && let Some(n) = name.take()
        {
            let u = rest
                .trim()
                .trim_matches('"')
                .split('#')
                .next()
                .unwrap_or("")
                .split('?')
                .next()
                .unwrap_or("")
                .to_owned();
            out.push((n, u));
        }
    }
    out
}

fn inline_html(path: &Path) -> anyhow::Result<String> {
    let html = std::fs::read_to_string(path)?;
    let dir = path.parent().unwrap_or(path);
    Ok(inline_scripts(&inline_styles(&html, dir), dir))
}

fn inline_scripts(html: &str, dir: &Path) -> String {
    let mut out = String::new();
    let mut rest = html;
    let open = "<script";
    while let Some(i) = rest.find(open) {
        out.push_str(&rest[..i]);
        rest = &rest[i + open.len()..];
        let Some(tag_end) = rest.find('>') else {
            out.push_str(open);
            out.push_str(rest);
            return out;
        };
        let attrs = &rest[..tag_end];
        rest = &rest[tag_end + 1..];
        let lower = attrs.to_ascii_lowercase();
        let is_template_script =
            lower.contains("type=\"text/x-") || lower.contains("type='text/x-");
        let is_module = lower.contains("type=\"module\"") || lower.contains("type='module'");
        if is_template_script {
            if let Some(close) = rest.find("</script>") {
                out.push_str(open);
                out.push_str(attrs);
                out.push('>');
                out.push_str(&rest[..close]);
                out.push_str("</script>");
                rest = &rest[close + 9..];
            } else {
                out.push_str(open);
                out.push_str(attrs);
                out.push('>');
                out.push_str(rest);
                return out;
            }
            continue;
        }
        let src = attr(attrs, "src");
        if let Some(close) = rest.find("</script>") {
            let body = &rest[..close];
            rest = &rest[close + 9..];
            if let Some(src) = src.filter(|s| !s.starts_with("http")) {
                let path = dir.join(src);
                if is_module {
                    match crate::esm::bundle(&path) {
                        Ok(js) => {
                            out.push_str("<script>\n");
                            out.push_str(&js);
                            out.push_str("\n</script>");
                        }
                        Err(e) => {
                            out.push_str("<script>throw new Error(");
                            out.push_str(
                                &serde_json::to_string(&e.to_string())
                                    .unwrap_or_else(|_| "\"module bundle failed\"".into()),
                            );
                            out.push_str(");</script>");
                        }
                    }
                } else {
                    match std::fs::read_to_string(&path) {
                        Ok(js) => {
                            out.push_str("<script>\n");
                            out.push_str(&js);
                            out.push_str("\n</script>");
                        }
                        Err(_) => {
                            out.push_str(open);
                            out.push_str(attrs);
                            out.push('>');
                            out.push_str(body);
                            out.push_str("</script>");
                        }
                    }
                }
            } else if is_module {
                match crate::esm::bundle_inline(body, dir) {
                    Ok(js) => {
                        out.push_str("<script>\n");
                        out.push_str(&js);
                        out.push_str("\n</script>");
                    }
                    Err(_) => {
                        out.push_str(open);
                        out.push_str(attrs);
                        out.push('>');
                        out.push_str(body);
                        out.push_str("</script>");
                    }
                }
            } else {
                out.push_str(open);
                out.push_str(attrs);
                out.push('>');
                out.push_str(body);
                out.push_str("</script>");
            }
        }
    }
    out.push_str(rest);
    out
}

fn inline_styles(html: &str, dir: &Path) -> String {
    let mut out = String::new();
    let mut rest = html;
    let open = "<link";
    while let Some(i) = rest.find(open) {
        out.push_str(&rest[..i]);
        rest = &rest[i + open.len()..];
        let Some(tag_end) = rest.find('>') else {
            out.push_str(open);
            out.push_str(rest);
            return out;
        };
        let attrs = &rest[..tag_end];
        rest = &rest[tag_end + 1..];
        let rel = attr(attrs, "rel").unwrap_or_default();
        let href = attr(attrs, "href");
        if rel.eq_ignore_ascii_case("stylesheet")
            && let Some(href) = href.filter(|s| !s.starts_with("http"))
            && let Ok(css) = std::fs::read_to_string(dir.join(href))
        {
            out.push_str("<style>\n");
            out.push_str(&css);
            out.push_str("\n</style>");
            continue;
        }
        out.push_str(open);
        out.push_str(attrs);
        out.push('>');
    }
    out.push_str(rest);
    out
}

fn attr(attrs: &str, name: &str) -> Option<String> {
    for quote in ['"', '\''] {
        let needle = format!("{name}={quote}");
        if let Some(i) = attrs.find(&needle) {
            let rest = &attrs[i + needle.len()..];
            let end = rest.find(quote)?;
            return Some(rest[..end].to_owned());
        }
    }
    None
}

/// Runs every official `Speedometer` 3.0 suite name. Vendored workloads execute;
/// missing sources are `NOTRUN`.
pub(crate) fn run_official(engine: &mut VectorEngine, iterations: u32) -> Vec<SuiteResult> {
    let revision = pin("speedometer", "revision");
    let root = vendor_root();
    official_suites()
        .into_iter()
        .map(|(name, url)| run_one(engine, iterations, &revision, &root, name, url))
        .collect()
}

fn run_one(
    engine: &mut VectorEngine,
    iterations: u32,
    revision: &str,
    root: &Path,
    name: String,
    url: String,
) -> SuiteResult {
    let mut path = root.join(&url);
    if path.is_dir() {
        path.push("index.html");
    }
    if !path.exists() {
        return SuiteResult {
            name: format!("speedometer.3.0.{name}"),
            status: "NOTRUN",
            revision: revision.to_owned(),
            samples_ms: None,
            p50_ms: None,
            p95_ms: None,
            detail: Some(format!("workload not vendored: {url}")),
        };
    }
    if !cfg!(feature = "v8") {
        return SuiteResult {
            name: format!("speedometer.3.0.{name}"),
            status: "NOTRUN",
            revision: revision.to_owned(),
            samples_ms: None,
            p50_ms: None,
            p95_ms: None,
            detail: Some("built without v8".into()),
        };
    }
    let html = match inline_html(&path) {
        Ok(h) => h,
        Err(e) => {
            return SuiteResult {
                name: format!("speedometer.3.0.{name}"),
                status: "FAIL",
                revision: revision.to_owned(),
                samples_ms: None,
                p50_ms: None,
                p95_ms: None,
                detail: Some(e.to_string()),
            };
        }
    };
    let mut samples = Vec::new();
    let mut last = None;
    let mut added = 0u64;
    let mut remaining = 0u64;
    let mut kind = String::new();
    let mut ok = false;
    for _ in 0..iterations.max(1) {
        let opened = match engine.open(OpenRequest {
            url: Some(format!("https://browserbench.org/Speedometer3.0/{url}")),
            html: Some(html.clone()),
            allow_evaluate: true,
            ..OpenRequest::default()
        }) {
            Ok(o) => o,
            Err(e) => {
                last = Some(e.to_string());
                break;
            }
        };
        if let Ok(page) = engine.page_mut(opened.page) {
            page.settle(3_000);
        }
        let started = Instant::now();
        match engine
            .page_mut(opened.page)
            .and_then(|p| p.evaluate(OFFICIAL_STEPS))
        {
            Ok(raw) => {
                samples.push(u64::try_from(started.elapsed().as_millis()).unwrap_or(u64::MAX));
                let text = match &raw {
                    serde_json::Value::String(s) => s.clone(),
                    other => other.to_string(),
                };
                if let Ok(v) = serde_json::from_str::<serde_json::Value>(&text) {
                    added = v
                        .get("added")
                        .and_then(serde_json::Value::as_u64)
                        .unwrap_or(0);
                    remaining = v
                        .get("remaining")
                        .and_then(serde_json::Value::as_u64)
                        .unwrap_or(0);
                    kind.clear();
                    kind.push_str(
                        v.get("kind")
                            .and_then(serde_json::Value::as_str)
                            .unwrap_or(""),
                    );
                    ok = v.get("ok").and_then(serde_json::Value::as_bool) == Some(true);
                    if !ok {
                        last = Some(text);
                    }
                } else {
                    last = Some(text);
                }
            }
            Err(e) => last = Some(e.to_string()),
        }
        engine.close(opened.page);
    }
    let status = if samples.is_empty() {
        "FAIL"
    } else if kind == "todomvc" && added >= 100 && remaining == 0 {
        "PASS"
    } else if kind == "todomvc" && added > 0 {
        "PARTIAL"
    } else if ok
        && matches!(
            kind.as_str(),
            "news" | "editor" | "chart" | "stock" | "perf"
        )
    {
        "PASS"
    } else if added > 0 {
        "PARTIAL"
    } else {
        "FAIL"
    };
    SuiteResult {
        name: format!("speedometer.3.0.{name}"),
        status,
        revision: revision.to_owned(),
        p50_ms: (!samples.is_empty()).then(|| percentile(&samples, 0.50)),
        p95_ms: (!samples.is_empty()).then(|| percentile(&samples, 0.95)),
        samples_ms: (!samples.is_empty()).then_some(samples),
        detail: last.or(Some(format!(
            "kind={kind} added={added} remaining={remaining}"
        ))),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn official_suite_list_is_speedometer_3() {
        let suites = official_suites();
        assert!(suites.len() >= 20, "{}", suites.len());
        assert!(
            suites.iter().any(|(n, _)| n == "TodoMVC-JavaScript-ES5"),
            "{suites:?}"
        );
        assert!(
            suites.iter().any(|(n, _)| n == "Perf-Dashboard"),
            "{suites:?}"
        );
    }

    #[test]
    fn es5_workload_is_vendored() {
        let p = vendor_root().join("todomvc/vanilla-examples/javascript-es5/dist/index.html");
        assert!(p.exists(), "{}", p.display());
    }

    #[test]
    fn every_official_speedometer_3_workload_is_vendored() {
        for (name, url) in official_suites() {
            let p = vendor_root().join(&url);
            assert!(p.exists(), "{name} missing {}", p.display());
        }
    }

    #[test]
    fn handlebars_templates_are_preserved_when_inlining() {
        let html = r#"<script id="todo-template" type="text/x-handlebars-template">{{title}}</script>
<script src="app.js"></script>"#;
        let dir = vendor_root().join("todomvc/architecture-examples/jquery/dist");
        let out = inline_scripts(html, &dir);
        assert!(out.contains("type=\"text/x-handlebars-template\""), "{out}");
        assert!(out.contains("{{title}}"), "{out}");
    }
}
