//! Testharness + pixel reftest runner (VEC-006).
//!
//! Geometry reftests stay in `wpt-runner`. This tool runs scripted
//! testharness fixtures (V8) and software-pixel comparisons for paint.
//! `--http` serves fixtures / a WPT checkout over HTTP; `--wpt-dir --tree`
//! walks testharness files in that tree.

mod http_serve;

use std::collections::HashSet;
use std::panic::{AssertUnwindSafe, catch_unwind};
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

use anyhow::{Context, Result};
use clap::Parser;
use serde::Serialize;
use ve_api::{EngineConfig, OpenRequest, ScreenshotOptions, VectorEngine};
use ve_core::Size;

/// Command line options.
#[derive(Parser, Debug)]
#[command(
    name = "wpt-harness",
    about = "Testharness and pixel tests for Vector Engine"
)]
struct Args {
    /// Manifest of tests that must pass (relative paths).
    #[arg(long, default_value = concat!(env!("CARGO_MANIFEST_DIR"), "/../../conformance/testharness.txt"))]
    manifest: PathBuf,
    /// Fixture root (HTML files listed in the manifest).
    #[arg(long, default_value = concat!(env!("CARGO_MANIFEST_DIR"), "/../../fixtures/harness"))]
    fixtures: PathBuf,
    /// Geometry manifest counted in `overall_manifest` (not executed here).
    #[arg(long, default_value = concat!(env!("CARGO_MANIFEST_DIR"), "/../../conformance/m1.txt"))]
    geometry_manifest: PathBuf,
    /// Tests that may fail without blocking the supported suite.
    #[arg(long, default_value = concat!(env!("CARGO_MANIFEST_DIR"), "/../../conformance/expected-failures.txt"))]
    expected_failures: PathBuf,
    /// Write JSON report here.
    #[arg(long)]
    out: Option<PathBuf>,
    /// Per-test timeout seconds.
    #[arg(long, default_value_t = 20)]
    timeout_secs: u64,
    /// Serve fixtures (and optional WPT checkout) over HTTP/1.1.
    #[arg(long)]
    http: bool,
    /// Also serve fixtures over HTTPS with a generated fixture CA (Finding 6).
    #[arg(long)]
    https: bool,
    /// Whole-tree WPT checkout. Combined with `--http` this is the production
    /// testharness path (`/resources/testharness.js`, `/fonts/Ahem.ttf`).
    #[arg(long)]
    wpt_dir: Option<PathBuf>,
    /// Walk testharness HTML under `--wpt-dir` in addition to the supported subset.
    #[arg(long)]
    tree: bool,
    /// Cap on `--tree` tests (0 = unlimited).
    #[arg(long, default_value_t = 0)]
    tree_limit: usize,
    /// Walk only this subdirectory of `--wpt-dir` (e.g. `html/dom`).
    #[arg(long)]
    tree_family: Option<String>,
    /// Reftest fonts directory (`Ahem.ttf`).
    #[arg(long, default_value = concat!(env!("CARGO_MANIFEST_DIR"), "/../../conformance/fonts"))]
    fonts_dir: PathBuf,
    /// Tree failures do not fail the process (supported subset still does).
    #[arg(long, default_value_t = true)]
    allow_tree_fail: bool,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "UPPERCASE")]
enum Status {
    Pass,
    Fail,
    Timeout,
    Crash,
    NotRun,
    Skip,
}

#[derive(Serialize)]
struct TestResult {
    path: String,
    status: Status,
    #[serde(skip_serializing_if = "Option::is_none")]
    detail: Option<String>,
    duration_ms: u64,
    #[serde(skip_serializing_if = "std::ops::Not::not")]
    tree: bool,
}

#[derive(Serialize, Default)]
struct Counts {
    total: usize,
    pass: usize,
    fail: usize,
    timeout: usize,
    crash: usize,
    notrun: usize,
    skip: usize,
}

impl Counts {
    fn add(&mut self, status: Status) {
        self.total += 1;
        match status {
            Status::Pass => self.pass += 1,
            Status::Fail => self.fail += 1,
            Status::Timeout => self.timeout += 1,
            Status::Crash => self.crash += 1,
            Status::NotRun => self.notrun += 1,
            Status::Skip => self.skip += 1,
        }
    }
}

#[derive(Serialize)]
struct Report {
    fixtures: String,
    tested_subset: usize,
    overall_manifest: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    http_origin: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    https_origin: Option<String>,
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    https: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    tree_family: Option<String>,
    tree_complete: bool,
    fonts_dir: String,
    idlharness: bool,
    totals: Counts,
    results: Vec<TestResult>,
}

fn load_manifest(path: &Path) -> Result<Vec<String>> {
    let text = std::fs::read_to_string(path).with_context(|| path.display().to_string())?;
    Ok(text
        .lines()
        .map(str::trim)
        .filter(|l| !l.is_empty() && !l.starts_with('#'))
        .map(str::to_owned)
        .collect())
}

const TREE_SKIP: &[&str] = &[
    "resources",
    "support",
    "tools",
    "common",
    "fonts",
    "images",
    "interfaces",
    "reference",
    ".git",
    "conformance-checkers",
];

fn collect_testharness_tree(
    root: &Path,
    limit: usize,
    family: Option<&str>,
) -> Result<Vec<(String, PathBuf)>> {
    let mut out = Vec::new();
    let mut seen = HashSet::new();
    fn walk(
        dir: &Path,
        root: &Path,
        out: &mut Vec<(String, PathBuf)>,
        seen: &mut HashSet<String>,
        limit: usize,
    ) -> Result<()> {
        if limit > 0 && out.len() >= limit {
            return Ok(());
        }
        let mut entries: Vec<_> = std::fs::read_dir(dir)
            .with_context(|| dir.display().to_string())?
            .collect::<std::io::Result<_>>()?;
        entries.sort_by_key(std::fs::DirEntry::path);
        for entry in entries {
            if limit > 0 && out.len() >= limit {
                break;
            }
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().into_owned();
            if path.is_dir() {
                if TREE_SKIP.iter().any(|s| *s == name) {
                    continue;
                }
                walk(&path, root, out, seen, limit)?;
            } else {
                let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");
                if ext.eq_ignore_ascii_case("html") || ext.eq_ignore_ascii_case("htm") {
                    let Ok(html) = std::fs::read_to_string(&path) else {
                        continue;
                    };
                    if html.contains("testharness.js") {
                        let rel = path
                            .strip_prefix(root)
                            .unwrap_or(&path)
                            .to_string_lossy()
                            .replace('\\', "/");
                        if seen.insert(rel.clone()) {
                            out.push((rel, path));
                        }
                    }
                }
            }
        }
        Ok(())
    }
    if let Some(fam) = family {
        let dir = root.join(fam);
        if dir.is_dir() {
            walk(&dir, root, &mut out, &mut seen, limit)?;
        } else if dir.is_file() {
            let rel = fam.replace('\\', "/");
            if seen.insert(rel.clone()) {
                out.push((rel, dir));
            }
        }
        return Ok(out);
    }
    // Official `html/dom` first so an uncapped walk still prefers that family.
    let preferred = root.join("html").join("dom");
    if preferred.is_dir() {
        walk(&preferred, root, &mut out, &mut seen, limit)?;
    }
    walk(root, root, &mut out, &mut seen, limit)?;
    Ok(out)
}

fn testharness_path() -> PathBuf {
    resource_path("testharness.js")
}

fn resource_path(name: &str) -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../../conformance/resources")
        .join(name)
}

/// HTML `<script>` text must not contain a literal `</script` (helpers such
/// as render-blocking `utils.js` embed that sequence in `document.write`).
fn escape_inline_script(js: &str) -> String {
    let lower = js.to_ascii_lowercase();
    let mut out = String::with_capacity(js.len());
    let mut last = 0;
    let mut search = 0;
    while let Some(rel) = lower[search..].find("</script") {
        let at = search + rel;
        out.push_str(&js[last..at]);
        out.push_str("<\\/script");
        last = at + 8;
        search = last;
    }
    out.push_str(&js[last..]);
    out
}

fn replace_first(hay: &str, needles: &[&str], with: &str) -> (String, bool) {
    for needle in needles {
        if let Some(i) = hay.find(needle) {
            let mut out = String::with_capacity(hay.len() + with.len());
            out.push_str(&hay[..i]);
            out.push_str(with);
            out.push_str(&hay[i + needle.len()..]);
            return (out, true);
        }
    }
    (hay.to_string(), false)
}

fn inject_relative_scripts(html: &str, dir: &Path) -> String {
    let mut out = String::new();
    let mut rest = html;
    let open = "<script src=\"";
    while let Some(i) = rest.find(open) {
        out.push_str(&rest[..i]);
        rest = &rest[i + open.len()..];
        let Some(end) = rest.find('"') else {
            out.push_str(open);
            out.push_str(rest);
            return out;
        };
        let src = rest[..end].to_string();
        rest = &rest[end + 1..];
        let close_at = rest.find("</script>");
        let tag_rest = close_at.map_or(rest, |c| &rest[..c]);
        if src.starts_with("http://") || src.starts_with("https://") || is_harness_script(&src) {
            out.push_str(open);
            out.push_str(&src);
            out.push('"');
            out.push_str(tag_rest);
            out.push_str("</script>");
            if let Some(c) = close_at {
                rest = &rest[c + "</script>".len()..];
            } else {
                rest = "";
            }
            continue;
        }
        if let Some(c) = close_at {
            rest = &rest[c + "</script>".len()..];
        }
        let path = if src.starts_with('/') {
            let rel = src.trim_start_matches('/');
            let mut found = None;
            let mut cur = Some(dir);
            while let Some(d) = cur {
                let cand = d.join(rel);
                if cand.is_file() {
                    found = Some(cand);
                    break;
                }
                cur = d.parent();
            }
            match found {
                Some(p) => p,
                None => {
                    out.push_str(open);
                    out.push_str(&src);
                    out.push_str("\"></script>");
                    continue;
                }
            }
        } else {
            dir.join(&src)
        };
        match std::fs::read_to_string(&path) {
            Ok(js) => {
                out.push_str("<script>\n");
                out.push_str(&escape_inline_script(&js));
                out.push_str("\n</script>");
            }
            Err(_) => {
                out.push_str(open);
                out.push_str(&src);
                out.push_str("\"></script>");
            }
        }
    }
    out.push_str(rest);
    inject_unquoted_relative_scripts(&out, dir)
}

fn inject_unquoted_relative_scripts(html: &str, dir: &Path) -> String {
    let mut out = String::new();
    let mut rest = html;
    while let Some(i) = rest.find("<script src=") {
        out.push_str(&rest[..i]);
        rest = &rest[i + "<script src=".len()..];
        if rest.starts_with('"') || rest.starts_with('\'') {
            out.push_str("<script src=");
            if let Some(close) = rest.find("</script>") {
                out.push_str(&rest[..close + "</script>".len()]);
                rest = &rest[close + "</script>".len()..];
            } else {
                out.push_str(rest);
                rest = "";
            }
            continue;
        }
        let end = rest
            .find(|c: char| c == '>' || c.is_ascii_whitespace())
            .unwrap_or(rest.len());
        let src = rest[..end].trim_end_matches('/').to_string();
        rest = &rest[end..];
        if let Some(close) = rest.find("</script>") {
            rest = &rest[close + "</script>".len()..];
        }
        if src.starts_with("http://") || src.starts_with("https://") || is_harness_script(&src) {
            out.push_str("<script src=\"");
            out.push_str(&src);
            out.push_str("\"></script>");
            continue;
        }
        let path = dir.join(&src);
        match std::fs::read_to_string(&path) {
            Ok(js) => {
                out.push_str("<script>\n");
                out.push_str(&escape_inline_script(&js));
                out.push_str("\n</script>");
            }
            Err(_) => {
                out.push_str("<script src=\"");
                out.push_str(&src);
                out.push_str("\"></script>");
            }
        }
    }
    out.push_str(rest);
    out
}

fn first_wpt_variant(html: &str) -> Option<&str> {
    let lower = html.to_ascii_lowercase();
    let mut search = 0;
    while let Some(rel) = lower[search..].find("name=\"variant\"") {
        let at = search + rel;
        if let Some(c) = lower[at..].find("content=\"") {
            let start = at + c + 9;
            if let Some(len) = html.get(start..).and_then(|s| s.find('"')) {
                let val = html.get(start..start + len)?;
                if val.starts_with('?') {
                    return Some(val);
                }
            }
        }
        search = at + 1;
    }
    None
}

fn is_harness_script(src: &str) -> bool {
    matches!(
        src.rsplit('/').next().unwrap_or(src),
        "testharness.js"
            | "testharnessreport.js"
            | "idlharness.js"
            | "WebIDLParser.js"
            | "webidl2.js"
            | "testdriver.js"
            | "testdriver-vendor.js"
    )
}

const TESTHARNESS_SRC: &[&str] = &[
    r#"<script src="/resources/testharness.js"></script>"#,
    r#"<script src=/resources/testharness.js></script>"#,
];
const TESTHARNESSREPORT_SRC: &[&str] = &[
    r#"<script src="/resources/testharnessreport.js"></script>"#,
    r#"<script src=/resources/testharnessreport.js></script>"#,
];
const WEBIDL_PARSER_SRC: &[&str] = &[
    r#"<script src="/resources/WebIDLParser.js"></script>"#,
    r#"<script src=/resources/WebIDLParser.js></script>"#,
    r#"<script src="/resources/webidl2.js"></script>"#,
    r#"<script src=/resources/webidl2.js></script>"#,
];
const IDLHARNESS_SRC: &[&str] = &[
    r#"<script src="/resources/idlharness.js"></script>"#,
    r#"<script src=/resources/idlharness.js></script>"#,
];
const TESTDRIVER_SRC: &[&str] = &[
    r#"<script src="/resources/testdriver.js"></script>"#,
    r#"<script src=/resources/testdriver.js></script>"#,
];
const TESTDRIVER_VENDOR_SRC: &[&str] = &[
    r#"<script src="/resources/testdriver-vendor.js"></script>"#,
    r#"<script src=/resources/testdriver-vendor.js></script>"#,
];

fn inject_csp_from_sidecar(html: &str, fixture: &Path) -> String {
    let Some(csp) = http_serve::content_security_policy_for(fixture) else {
        return html.to_string();
    };
    if html
        .to_ascii_lowercase()
        .contains("content-security-policy")
    {
        return html.to_string();
    }
    let meta = format!(
        r#"<meta http-equiv="Content-Security-Policy" content="{}">"#,
        csp.replace('"', "&quot;")
    );
    if let Some(idx) = html.to_ascii_lowercase().find("<head") {
        if let Some(end) = html[idx..].find('>') {
            let at = idx + end + 1;
            return format!("{}{}{}", &html[..at], meta, &html[at..]);
        }
    }
    format!("{meta}{html}")
}

fn inject_upstream_testharness(html: &str) -> String {
    if !html.contains("testharness.js") {
        return html.to_string();
    }
    let Ok(th) = std::fs::read_to_string(testharness_path()) else {
        return html.to_string();
    };
    let th_tag = format!(
        "<script>\ntry {{\n{}\n}} catch (e) {{ window.__th_load_error = String((e && e.stack) || e); }}\n</script>",
        escape_inline_script(&th)
    );
    let report = r#"
<script>
(function () {
  if (typeof tests !== "undefined") {
    window.__veHarnessTests = tests;
  }
  if (typeof setup === "function") {
    try { setup({ output: false, explicit_timeout: true }); } catch (e) {}
  }
  if (typeof add_completion_callback === "function") {
    add_completion_callback(function (ts) {
      window.__tests = (ts || []).map(function (t) {
        return [String(t.name), t.status === 0];
      });
    });
  }
})();
</script>
"#;
    let testdriver = r#"
<script>
(function () {
  window.test_driver_internal = window.test_driver_internal || {};
  window.test_driver_internal.get_computed_label = function (el) {
    try { return Promise.resolve((window.__veComputedLabel && window.__veComputedLabel(el)) || ""); }
    catch (e) { return Promise.resolve(""); }
  };
  window.test_driver_internal.get_computed_role = function (el) {
    try { return Promise.resolve((el && el.getAttribute && el.getAttribute("role")) || ""); }
    catch (e) { return Promise.resolve(""); }
  };
  window.test_driver_internal.send_keys = function (el, keys) {
    return Promise.resolve().then(function () {
      if (!el) return;
      try { el.focus(); } catch (e) {}
      var s = String(keys);
      try { el.value = (el.value || "") + s; } catch (e) {}
      try { el.dispatchEvent(new InputEvent("input", { bubbles: true, data: s })); } catch (e) {}
    });
  };
  window.test_driver = window.test_driver || {};
  window.test_driver.get_computed_label = window.test_driver_internal.get_computed_label;
  window.test_driver.get_computed_role = window.test_driver_internal.get_computed_role;
  window.test_driver.send_keys = window.test_driver_internal.send_keys;
})();
</script>
"#;
    let mut body = html.to_string();
    let (next, replaced_th) = replace_first(&body, TESTHARNESS_SRC, &th_tag);
    body = next;
    if !replaced_th {
        let (doctype, rest) = split_leading_doctype(&body);
        body = format!("{doctype}{th_tag}\n{report}\n{rest}");
    } else {
        let (next, replaced_report) = replace_first(&body, TESTHARNESSREPORT_SRC, report);
        body = next;
        if !replaced_report {
            if let Some(i) = body.find(&th_tag) {
                let at = i + th_tag.len();
                body.insert_str(at, report);
            }
        }
    }
    if html.contains("testdriver.js") {
        let (next, replaced) = replace_first(&body, TESTDRIVER_SRC, testdriver);
        body = next;
        if !replaced {
            if let Some(i) = body.find(&th_tag) {
                let at = i + th_tag.len();
                body.insert_str(at, testdriver);
            }
        }
    }
    if html.contains("idlharness.js") || html.contains("WebIDLParser.js") {
        let parser = std::fs::read_to_string(resource_path("WebIDLParser.js")).unwrap_or_default();
        let harness = std::fs::read_to_string(resource_path("idlharness.js")).unwrap_or_default();
        let parser_tag = format!("<script>\n{}\n</script>", escape_inline_script(&parser));
        let harness_tag = format!("<script>\n{}\n</script>", escape_inline_script(&harness));
        let (next, _) = replace_first(&body, WEBIDL_PARSER_SRC, &parser_tag);
        body = next;
        let (next, _) = replace_first(&body, IDLHARNESS_SRC, &harness_tag);
        body = next;
    }
    for needle in TESTHARNESS_SRC
        .iter()
        .chain(TESTHARNESSREPORT_SRC)
        .chain(WEBIDL_PARSER_SRC)
        .chain(IDLHARNESS_SRC)
        .chain(TESTDRIVER_SRC)
        .chain(TESTDRIVER_VENDOR_SRC)
    {
        body = body.replace(needle, "");
    }
    body
}

fn split_leading_doctype(html: &str) -> (&str, &str) {
    let start = html
        .char_indices()
        .find(|(_, c)| !c.is_ascii_whitespace())
        .map_or(html.len(), |(i, _)| i);
    let rest = html.get(start..).unwrap_or("");
    if rest.len() >= 9 && rest[..9].eq_ignore_ascii_case("<!doctype") {
        if let Some(gt) = rest.find('>') {
            let end = start + gt + 1;
            return (&html[..end], &html[end..]);
        }
    }
    ("", html)
}

fn wpt_origin_rel(url: &str) -> Option<(String, String)> {
    let rest = url
        .strip_prefix("http://")
        .or_else(|| url.strip_prefix("https://"))?;
    let (host, path) = rest.split_once('/')?;
    let scheme = if url.starts_with("https://") {
        "https"
    } else {
        "http"
    };
    Some((format!("{scheme}://{host}"), path.to_owned()))
}

fn run_script_test(
    engine: &mut VectorEngine,
    html: &str,
    url: &str,
    fixture: &Path,
) -> Result<(Status, Option<String>)> {
    if !cfg!(feature = "v8") {
        return Ok((Status::NotRun, Some("built without v8".into())));
    }
    let dir = fixture.parent().unwrap_or(fixture);
    let expect_testharness = html.contains("testharness.js");
    let variant = first_wpt_variant(html).map(str::to_owned);
    let html = inject_relative_scripts(html, dir);
    let html = inject_csp_from_sidecar(&html, fixture);
    let html = inject_upstream_testharness(&html);
    let html = if let Some((origin, rel)) = wpt_origin_rel(url) {
        http_serve::substitute_wpt_text(&html, &origin, &rel)
    } else {
        html
    };
    let url = match variant {
        Some(q) if !url.contains('?') => format!("{url}{q}"),
        _ => url.to_string(),
    };
    let opened = engine.open(OpenRequest {
        url: Some(url),
        html: Some(html),
        allow_evaluate: true,
        last_modified: http_serve::last_modified_for(fixture),
        content_language: http_serve::content_language_for(fixture),
        ..OpenRequest::default()
    })?;
    let page = opened.page;
    engine.page_mut(page)?.settle(2_000);
    // Fire `load` before the long virtual-time pump so iframe postMessage
    // listeners registered on load can run (cdata-dir_auto).
    let _ = engine.page_mut(page)?.evaluate(
        r#"(function () { try { window.dispatchEvent(new Event("load")); } catch (e) {} })()"#,
    );
    for _ in 0..16 {
        engine.page_mut(page)?.settle(50);
        engine.page_mut(page)?.pump_virtual_time(50);
    }
    // Testharness async_test/step_timeout (e.g. lastModified-01's 4s wait)
    // use virtual time; settle() only pumps the 50ms timer window.
    engine.page_mut(page)?.pump_virtual_time(10_000);
    let eval = r#"(function () {
        try { window.dispatchEvent(new Event("load")); } catch (e) {}
        try { if (typeof done === "function") done(); } catch (e) {}
        if (window.__th_load_error) {
          return JSON.stringify([["testharness.js", false, String(window.__th_load_error)]]);
        }
        var T = (typeof tests !== "undefined" && tests && tests.tests && tests.tests.length)
          ? tests
          : window.__veHarnessTests;
        if (T && T.tests && T.tests.length) {
          return JSON.stringify(T.tests.map(function (t) {
            return [String(t.name), t.status === 0, String(t.status) + ":" + String(t.message || "")];
          }));
        }
        if (Array.isArray(window.__tests) && window.__tests.length) {
          return JSON.stringify(window.__tests);
        }
        return JSON.stringify([]);
      })()"#;
    let result = match engine.page_mut(page)?.evaluate(eval) {
        Ok(raw) => {
            let text = match &raw {
                serde_json::Value::String(s) => s.clone(),
                other => other.to_string(),
            };
            let mut tests: Vec<(String, bool, String)> =
                serde_json::from_str(&text).unwrap_or_default();
            if tests.is_empty() {
                // Two-field results from the shim.
                let pairs: Vec<(String, bool)> = serde_json::from_str(&text).unwrap_or_default();
                tests = pairs
                    .into_iter()
                    .map(|(n, ok)| (n, ok, String::new()))
                    .collect();
            }
            if tests.is_empty() {
                let msg = if expect_testharness {
                    "no testharness results".into()
                } else {
                    format!("no assertions: {raw}")
                };
                return Ok((Status::Fail, Some(msg)));
            }
            let failed: Vec<_> = tests
                .iter()
                .filter(|(_, ok, _)| !ok)
                .map(|(n, _, msg)| {
                    if msg.is_empty() {
                        n.clone()
                    } else {
                        format!("{n}: {msg}")
                    }
                })
                .collect();
            if failed.is_empty() {
                Ok((Status::Pass, None))
            } else {
                Ok((Status::Fail, Some(failed.join(","))))
            }
        }
        Err(e) => Ok((Status::Fail, Some(e.to_string()))),
    };
    engine.close(page);
    result
}

fn run_pixel_test(
    engine: &mut VectorEngine,
    html: &str,
    url: &str,
) -> Result<(Status, Option<String>)> {
    let opened = engine.open(OpenRequest {
        url: Some(url.into()),
        html: Some(html.into()),
        ..OpenRequest::default()
    })?;
    let page = opened.page;
    let shot = engine.screenshot(page, &ScreenshotOptions::default())?;
    let result = if shot.width == 0 || shot.height == 0 || shot.png.is_empty() {
        Ok((Status::Fail, Some("empty screenshot".into())))
    } else if !shot.png.starts_with(&[0x89, b'P', b'N', b'G']) {
        Ok((Status::Fail, Some("not a PNG".into())))
    } else {
        let (w, h, rgba) = decode_png_rgba(&shot.png)?;
        if let Some(err) = check_pixel_expectations(html, w, h, &rgba) {
            Ok((Status::Fail, Some(err)))
        } else {
            Ok((Status::Pass, Some(format!("{w}x{h}"))))
        }
    };
    engine.close(page);
    result
}

fn decode_png_rgba(png: &[u8]) -> Result<(u32, u32, Vec<u8>)> {
    let decoder = png::Decoder::new(std::io::Cursor::new(png));
    let mut reader = decoder.read_info().context("png info")?;
    let mut buf = vec![
        0;
        reader
            .output_buffer_size()
            .ok_or_else(|| anyhow::anyhow!("png buffer"))?
    ];
    let info = reader.next_frame(&mut buf).context("png frame")?;
    Ok((info.width, info.height, buf[..info.buffer_size()].to_vec()))
}

fn attr_u32(html: &str, name: &str) -> Option<u32> {
    let needle = format!("{name}=\"");
    let i = html.find(&needle)?;
    let rest = &html[i + needle.len()..];
    let end = rest.find('"')?;
    rest[..end].parse().ok()
}

fn attr_rgb(html: &str, name: &str) -> Option<(u8, u8, u8)> {
    let needle = format!("{name}=\"");
    let i = html.find(&needle)?;
    let rest = &html[i + needle.len()..];
    let end = rest.find('"')?;
    let mut parts = rest[..end].split(',');
    Some((
        parts.next()?.trim().parse().ok()?,
        parts.next()?.trim().parse().ok()?,
        parts.next()?.trim().parse().ok()?,
    ))
}

fn sample_ok(rgba: &[u8], w: u32, x: u32, y: u32, rgb: (u8, u8, u8), tol: u8) -> bool {
    let i = ((y * w + x) * 4) as usize;
    if i + 2 >= rgba.len() {
        return false;
    }
    let dr = rgba[i].abs_diff(rgb.0);
    let dg = rgba[i + 1].abs_diff(rgb.1);
    let db = rgba[i + 2].abs_diff(rgb.2);
    dr <= tol && dg <= tol && db <= tol
}

fn check_pixel_expectations(html: &str, w: u32, h: u32, rgba: &[u8]) -> Option<String> {
    let tol = attr_u32(html, "data-sample-tol").unwrap_or(32) as u8;
    if html.contains("data-any-dark") {
        let dark = rgba
            .chunks_exact(4)
            .any(|p| u16::from(p[0]) + u16::from(p[1]) + u16::from(p[2]) < 500);
        if !dark {
            return Some("expected a dark text pixel".into());
        }
    }
    if let (Some(x), Some(y), Some(rgb)) = (
        attr_u32(html, "data-sample-x"),
        attr_u32(html, "data-sample-y"),
        attr_rgb(html, "data-sample-rgb"),
    ) {
        if x >= w || y >= h || !sample_ok(rgba, w, x, y, rgb, tol) {
            return Some(format!("sample ({x},{y}) mismatch"));
        }
    }
    if let (Some(x), Some(y), Some(rgb)) = (
        attr_u32(html, "data-sample2-x"),
        attr_u32(html, "data-sample2-y"),
        attr_rgb(html, "data-sample2-rgb"),
    ) {
        if x >= w || y >= h || !sample_ok(rgba, w, x, y, rgb, tol) {
            return Some(format!("sample2 ({x},{y}) mismatch"));
        }
    }
    None
}

fn discover_interfaces(wpt: &Path) -> Option<PathBuf> {
    let mut cands = Vec::new();
    if let Some(env) = std::env::var_os("VECTOR_WPT_INTERFACES") {
        cands.push(PathBuf::from(env));
    }
    cands.push(wpt.join("interfaces"));
    if let Some(parent) = wpt.parent() {
        cands.push(parent.join("wpt-src/wpt/interfaces"));
    }
    cands.push(PathBuf::from("/tmp/wpt-src/wpt/interfaces"));
    cands.into_iter().find(|p| p.is_dir())
}

fn main() -> Result<()> {
    let args = Args::parse();
    let manifest = load_manifest(&args.manifest)?;
    let expected: std::collections::HashSet<String> = if args.expected_failures.exists() {
        load_manifest(&args.expected_failures)?
            .into_iter()
            .collect()
    } else {
        std::collections::HashSet::new()
    };
    let geometry = if args.geometry_manifest.exists() {
        load_manifest(&args.geometry_manifest)?.len()
    } else {
        0
    };
    let mut roots = vec![
        (
            "resources".into(),
            PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../conformance/resources"),
        ),
        ("fonts".into(), args.fonts_dir.clone()),
        (String::new(), args.fixtures.clone()),
    ];
    if let Some(wpt) = &args.wpt_dir {
        roots.push((String::new(), wpt.clone()));
        if !wpt.join("interfaces").is_dir() {
            if let Some(interfaces) = discover_interfaces(wpt) {
                roots.push(("interfaces".into(), interfaces));
            }
        }
    }
    let http = if args.http || args.wpt_dir.is_some() {
        Some(http_serve::DirServer::start(roots.clone())?)
    } else {
        None
    };
    let (https, extra_tls_roots) = if args.https {
        let (server, der) = http_serve::DirServer::start_https(roots)?;
        (Some(server), vec![der])
    } else {
        (None, Vec::new())
    };
    let mut engine = VectorEngine::new(EngineConfig {
        viewport: Size::new(800.0, 600.0),
        offline: http.is_none() && https.is_none(),
        scripting: cfg!(feature = "v8"),
        policy: ve_api::NetworkPolicy::permissive(),
        extra_tls_roots,
        ..EngineConfig::default()
    });
    let origin = http.as_ref().map(|s| s.origin.clone());
    let https_origin = https.as_ref().map(|s| s.origin.clone());
    let timeout = Duration::from_secs(args.timeout_secs);
    let mut results = Vec::new();
    let mut totals = Counts::default();
    let mut work: Vec<(String, PathBuf, bool)> = manifest
        .iter()
        .map(|rel| (rel.clone(), args.fixtures.join(rel), false))
        .collect();
    if args.tree {
        if let Some(wpt) = &args.wpt_dir {
            let extra =
                collect_testharness_tree(wpt, args.tree_limit, args.tree_family.as_deref())?;
            for (rel, path) in extra {
                if work.iter().any(|(r, _, _)| r == &rel) {
                    continue;
                }
                work.push((rel, path, true));
            }
        }
    }
    for (rel, path, tree) in &work {
        let started = Instant::now();
        let (status, detail) = if !path.exists() {
            (Status::NotRun, Some("missing fixture".into()))
        } else {
            let mut html = std::fs::read_to_string(path)?;
            let chosen = if rel.contains(".https.") {
                https_origin.as_ref().or(origin.as_ref())
            } else {
                origin.as_ref().or(https_origin.as_ref())
            };
            let url = chosen.map_or_else(|| format!("file:///{rel}"), |o| format!("{o}/{rel}"));
            if let Some(o) = chosen {
                html = http_serve::substitute_wpt_text(&html, o, rel);
            }
            let pixel = rel.contains("pixel") || html.contains("data-pixel");
            let run = || {
                if pixel {
                    run_pixel_test(&mut engine, &html, &url)
                } else {
                    run_script_test(&mut engine, &html, &url, path)
                }
            };
            match catch_unwind(AssertUnwindSafe(run)) {
                Ok(Ok(pair)) => {
                    if started.elapsed() > timeout {
                        (Status::Timeout, pair.1)
                    } else {
                        pair
                    }
                }
                Ok(Err(e)) => (Status::Fail, Some(e.to_string())),
                Err(_) => (Status::Crash, Some("panic".into())),
            }
        };
        let (status, detail) = if status != Status::Pass && expected.contains(rel) {
            (Status::Skip, detail)
        } else {
            (status, detail)
        };
        totals.add(status);
        results.push(TestResult {
            path: rel.clone(),
            status,
            detail,
            duration_ms: started.elapsed().as_millis() as u64,
            tree: *tree,
        });
    }
    if let Some(s) = http {
        s.stop();
    }
    if let Some(s) = https {
        s.stop();
    }
    let report = Report {
        fixtures: args.fixtures.display().to_string(),
        tested_subset: totals.pass + totals.fail + totals.timeout + totals.crash,
        overall_manifest: geometry + manifest.len(),
        http_origin: origin,
        https_origin,
        https: args.https,
        tree_family: args.tree_family.clone(),
        tree_complete: args.tree && args.tree_limit == 0,
        fonts_dir: args.fonts_dir.display().to_string(),
        idlharness: resource_path("idlharness.js").exists(),
        totals,
        results,
    };
    let json = serde_json::to_string_pretty(&report)?;
    if let Some(out) = &args.out {
        std::fs::write(out, &json)?;
    } else {
        println!("{json}");
    }
    let regressions: Vec<_> = report
        .results
        .iter()
        .filter(|r| r.status != Status::Pass && r.status != Status::Skip)
        .filter(|r| !r.tree || !args.allow_tree_fail)
        .map(|r| r.path.as_str())
        .collect();
    eprintln!(
        "wpt-harness: {} pass, {} fail, {} timeout, {} crash, {} notrun, {} skip (subset {} / manifest {})",
        report.totals.pass,
        report.totals.fail,
        report.totals.timeout,
        report.totals.crash,
        report.totals.notrun,
        report.totals.skip,
        report.tested_subset,
        report.overall_manifest
    );
    if !regressions.is_empty() {
        anyhow::bail!("supported-suite regressions: {}", regressions.join(", "));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use std::io::{Read, Write};
    use std::net::TcpListener;
    use std::thread;

    /// Serves `body` once over HTTP/1.1. Used for testharness fetch fixtures (VEC-006).
    fn spawn_fixture_server(
        body: &'static [u8],
    ) -> anyhow::Result<(thread::JoinHandle<()>, String)> {
        let listener = TcpListener::bind("127.0.0.1:0")?;
        let addr = listener.local_addr()?;
        let url = format!("http://{addr}/");
        let handle = thread::spawn(move || {
            if let Ok((mut stream, _)) = listener.accept() {
                let mut buf = [0u8; 1024];
                let _ = stream.read(&mut buf);
                let header = format!(
                    "HTTP/1.1 200 OK\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
                    body.len()
                );
                let _ = stream.write_all(header.as_bytes());
                let _ = stream.write_all(body);
            }
        });
        Ok((handle, url))
    }

    #[test]
    fn fixture_http_server_serves_one_body() {
        let (handle, url) = spawn_fixture_server(b"hello-wpt").unwrap();
        let addr = url
            .trim_start_matches("http://")
            .trim_end_matches('/')
            .to_owned();
        let mut stream = std::net::TcpStream::connect(&addr).unwrap();
        stream
            .write_all(b"GET / HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n")
            .unwrap();
        let mut body = String::new();
        stream.read_to_string(&mut body).unwrap();
        assert!(body.contains("hello-wpt"), "{body}");
        handle.join().unwrap();
    }

    /// Serves files from `root` until the listener is dropped (VEC-006 WPT HTTP).
    fn spawn_dir_server(
        root: &'static str,
    ) -> anyhow::Result<(thread::JoinHandle<()>, String, std::sync::mpsc::Sender<()>)> {
        let listener = TcpListener::bind("127.0.0.1:0")?;
        listener.set_nonblocking(true)?;
        let addr = listener.local_addr()?;
        let url = format!("http://{addr}");
        let (tx, rx) = std::sync::mpsc::channel();
        let handle = thread::spawn(move || {
            let deadline = std::time::Instant::now() + std::time::Duration::from_secs(5);
            while rx.try_recv().is_err() && std::time::Instant::now() < deadline {
                match listener.accept() {
                    Ok((mut stream, _)) => {
                        let mut buf = [0u8; 2048];
                        let n = stream.read(&mut buf).unwrap_or(0);
                        let req = String::from_utf8_lossy(&buf[..n]);
                        let path = req
                            .lines()
                            .next()
                            .and_then(|l| l.split_whitespace().nth(1))
                            .unwrap_or("/");
                        let rel = path.trim_start_matches('/');
                        let file = std::path::Path::new(root).join(rel);
                        if let Ok(bytes) = std::fs::read(&file) {
                            let header = format!(
                                "HTTP/1.1 200 OK\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
                                bytes.len()
                            );
                            let _ = stream.write_all(header.as_bytes());
                            let _ = stream.write_all(&bytes);
                        } else {
                            let _ = stream.write_all(b"HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n");
                        }
                        let _ = stream.shutdown(std::net::Shutdown::Write);
                    }
                    Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                        thread::sleep(std::time::Duration::from_millis(10));
                    }
                    Err(_) => break,
                }
            }
        });
        Ok((handle, url, tx))
    }

    #[test]
    fn fixture_http_server_serves_testharness_from_dir() {
        let root = concat!(env!("CARGO_MANIFEST_DIR"), "/../../conformance/resources");
        let (handle, url, stop) = spawn_dir_server(root).unwrap();
        let addr = url.trim_start_matches("http://").to_owned();
        let mut stream = std::net::TcpStream::connect(&addr).unwrap();
        stream
            .set_read_timeout(Some(std::time::Duration::from_secs(5)))
            .unwrap();
        stream
            .write_all(
                b"GET /testharness.js HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n",
            )
            .unwrap();
        // macOS may RST after Connection: close; keep any bytes already read.
        let mut raw = Vec::new();
        match stream.read_to_end(&mut raw) {
            Ok(_) => {}
            Err(e)
                if matches!(
                    e.kind(),
                    std::io::ErrorKind::ConnectionReset
                        | std::io::ErrorKind::UnexpectedEof
                        | std::io::ErrorKind::WouldBlock
                        | std::io::ErrorKind::TimedOut
                ) => {}
            Err(e) => panic!("{e}"),
        }
        let body = String::from_utf8_lossy(&raw);
        let _ = stop.send(());
        handle.join().unwrap();
        assert!(
            body.contains("add_completion_callback") || body.contains("testharness"),
            "{body:.200}"
        );
    }

    #[test]
    fn injects_relative_script_from_fixture_dir() {
        let dir = std::env::temp_dir().join("vector-wpt-rel-scripts");
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::write(dir.join("ChildNode-remove.js"), "function testRemove(){}").unwrap();
        let html = r#"<script src="ChildNode-remove.js"></script><body>"#;
        let out = super::inject_relative_scripts(html, &dir);
        assert!(out.contains("function testRemove"), "{out}");
        assert!(!out.contains(r#"src="ChildNode-remove.js""#), "{out}");
    }

    #[test]
    fn pinned_testharness_exposes_tests() {
        let th = std::fs::read_to_string(super::testharness_path()).unwrap();
        assert!(
            th.contains("expose(tests, 'tests')"),
            "evaluate reads tests.tests for incomplete async files"
        );
    }

    #[test]
    fn inject_does_not_inline_testharness_from_parent_walk() {
        let root = std::env::temp_dir().join("vector-wpt-th-skip");
        let nested = root.join("html").join("dom");
        std::fs::create_dir_all(nested.join("resources")).unwrap();
        std::fs::create_dir_all(root.join("resources")).unwrap();
        std::fs::write(
            root.join("resources").join("testharness.js"),
            "window.__wrong_testharness = 1;",
        )
        .unwrap();
        std::fs::create_dir_all(root.join("dom").join("nodes")).unwrap();
        std::fs::write(
            root.join("dom").join("nodes").join("attributes.js"),
            "function attributes_are(){}",
        )
        .unwrap();
        let html = concat!(
            r#"<script src="/resources/testharness.js"></script>"#,
            r#"<script src="/dom/nodes/attributes.js"></script>"#,
        );
        let out = super::inject_relative_scripts(html, &nested);
        assert!(
            out.contains(r#"src="/resources/testharness.js""#),
            "harness src must stay so inject_upstream_testharness is the only copy: {out}"
        );
        assert!(
            !out.contains("__wrong_testharness"),
            "must not inline checkout testharness.js: {out}"
        );
        assert!(
            out.contains("function attributes_are"),
            "helper scripts still inline: {out}"
        );
    }

    #[test]
    fn inject_escapes_script_close_in_inlined_helpers() {
        let dir = std::env::temp_dir().join("vector-wpt-script-close");
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::write(
            dir.join("utils.js"),
            "function generateParserDelay(){ document.write(`<script src=\"x\"></script>`); }",
        )
        .unwrap();
        let html = r##"<script src="utils.js"></script><link rel=expect href="#last"><div id="last">x</div>"##;
        let out = super::inject_relative_scripts(html, &dir);
        assert!(
            out.contains("<\\/script>"),
            "inlined helper must escape script close: {out}"
        );
        let after_inline = out.split_once("</script>").map_or("", |(_, rest)| rest);
        assert!(
            after_inline.contains("rel=expect") && after_inline.contains("id=\"last\""),
            "HTML after the helper script must stay intact: {out}"
        );
    }

    #[test]
    fn inject_keeps_title_before_inlined_testharness() {
        let html = concat!(
            "<!doctype html>",
            "<title>document.title and the empty string</title>",
            r#"<script src="/resources/testharness.js"></script>"#,
        );
        let out = super::inject_upstream_testharness(html);
        let title_at = out.find("<title>").expect("title");
        let th_at = out.find("add_completion_callback").expect("testharness");
        assert!(
            title_at < th_at,
            "title must stay first in head so title-06 can remove it: {title_at} vs {th_at}"
        );
        assert!(out.trim_start().starts_with("<!doctype html>"), "{out:.80}");
    }

    #[test]
    fn tree_family_accepts_a_single_official_file() {
        let root = std::env::temp_dir().join(format!("ve-wpt-family-{}", std::process::id()));
        let rel = "html/dom/one.html";
        let path = root.join(rel);
        std::fs::create_dir_all(path.parent().unwrap()).unwrap();
        std::fs::write(&path, "<script src=/resources/testharness.js></script>").unwrap();
        let got = super::collect_testharness_tree(&root, 0, Some(rel)).unwrap();
        let _ = std::fs::remove_dir_all(&root);
        assert_eq!(got.len(), 1, "{got:?}");
        assert_eq!(got[0].0, rel);
        assert_eq!(got[0].1, path);
    }

    #[test]
    fn inject_preserves_leading_doctype() {
        let html = concat!(
            "<!DOCTYPE html>\n",
            r#"<script src="/resources/testharness.js"></script>"#,
            "<body>"
        );
        let out = super::inject_upstream_testharness(html);
        assert!(out.trim_start().starts_with("<!DOCTYPE html>"), "{out}");
    }

    #[test]
    fn inject_inlines_idlharness_and_webidl2() {
        let html = concat!(
            "<!DOCTYPE html>",
            r#"<script src="/resources/testharness.js"></script>"#,
            r#"<script src="/resources/WebIDLParser.js"></script>"#,
            r#"<script src="/resources/idlharness.js"></script>"#,
            "<body>"
        );
        let out = super::inject_upstream_testharness(html);
        assert!(
            out.contains("IdlArray") || out.contains("function IdlArray"),
            "{out:.200}"
        );
        assert!(
            out.contains("WebIDL2") || out.contains("root[\"WebIDL2\"]"),
            "{out:.200}"
        );
    }

    #[test]
    fn http_server_serves_ahem_and_idlharness() {
        let fonts = concat!(env!("CARGO_MANIFEST_DIR"), "/../../conformance/fonts");
        let res = concat!(env!("CARGO_MANIFEST_DIR"), "/../../conformance/resources");
        let server = super::http_serve::DirServer::start(vec![
            ("fonts".into(), fonts.into()),
            ("resources".into(), res.into()),
        ])
        .unwrap();
        let origin = server.origin.clone();
        let get = |path: &str| {
            let addr = origin.trim_start_matches("http://").to_owned();
            let mut stream = std::net::TcpStream::connect(&addr).unwrap();
            stream
                .set_read_timeout(Some(std::time::Duration::from_secs(5)))
                .unwrap();
            stream
                .write_all(
                    format!("GET {path} HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n")
                        .as_bytes(),
                )
                .unwrap();
            let mut body = Vec::new();
            match stream.read_to_end(&mut body) {
                Ok(_) => {}
                Err(e)
                    if matches!(
                        e.kind(),
                        std::io::ErrorKind::ConnectionReset
                            | std::io::ErrorKind::UnexpectedEof
                            | std::io::ErrorKind::WouldBlock
                            | std::io::ErrorKind::TimedOut
                    ) => {}
                Err(e) => panic!("{e}"),
            }
            body
        };
        let ahem = get("/fonts/Ahem.ttf");
        assert!(
            ahem.windows(4)
                .any(|w| w == b"\x00\x01\x00\x00" || w == b"true"),
            "ttf {:?}",
            &ahem[..ahem.len().min(32)]
        );
        assert!(ahem.len() > 1000, "{}", ahem.len());
        let idl_bytes = get("/resources/idlharness.js");
        let idl = String::from_utf8_lossy(&idl_bytes);
        assert!(idl.contains("IdlArray"), "{idl:.200}");
        server.stop();
    }

    #[test]
    fn https_server_serves_idlharness_over_tls() {
        use rustls::pki_types::{CertificateDer, ServerName};
        let res = concat!(env!("CARGO_MANIFEST_DIR"), "/../../conformance/resources");
        let (server, cert) =
            super::http_serve::DirServer::start_https(vec![("resources".into(), res.into())])
                .unwrap();
        let origin = server.origin.clone();
        assert!(origin.starts_with("https://"), "{origin}");
        let addr = origin.trim_start_matches("https://").to_owned();
        let mut roots = rustls::RootCertStore::empty();
        roots.add(CertificateDer::from(cert)).unwrap();
        let cfg = rustls::ClientConfig::builder()
            .with_root_certificates(roots)
            .with_no_client_auth();
        let name = ServerName::try_from("127.0.0.1").unwrap();
        let conn = rustls::ClientConnection::new(std::sync::Arc::new(cfg), name).unwrap();
        let tcp = std::net::TcpStream::connect(&addr).unwrap();
        tcp.set_read_timeout(Some(std::time::Duration::from_secs(5)))
            .unwrap();
        let mut tls = rustls::StreamOwned::new(conn, tcp);
        tls.write_all(
            b"GET /resources/idlharness.js HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n",
        )
        .unwrap();
        let mut body = Vec::new();
        match tls.read_to_end(&mut body) {
            Ok(_) => {}
            Err(e)
                if matches!(
                    e.kind(),
                    std::io::ErrorKind::ConnectionReset
                        | std::io::ErrorKind::UnexpectedEof
                        | std::io::ErrorKind::WouldBlock
                        | std::io::ErrorKind::TimedOut
                ) => {}
            Err(e) => panic!("{e}"),
        }
        let idl = String::from_utf8_lossy(&body);
        assert!(idl.contains("IdlArray"), "{idl:.200}");
        server.stop();
    }

    #[test]
    fn http_server_serves_wpt_interfaces_idl() {
        let tmp = std::env::temp_dir().join(format!(
            "ve-wpt-idl-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        std::fs::create_dir_all(tmp.join("interfaces")).unwrap();
        std::fs::write(
            tmp.join("interfaces/mathml-core.idl"),
            "[Exposed=Window]\ninterface MathMLElement : Element { };\n",
        )
        .unwrap();
        let server =
            super::http_serve::DirServer::start(vec![(String::new(), tmp.clone())]).unwrap();
        let origin = server.origin.clone();
        let addr = origin.trim_start_matches("http://").to_owned();
        let mut stream = std::net::TcpStream::connect(&addr).unwrap();
        stream
            .write_all(
                b"GET /interfaces/mathml-core.idl HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n",
            )
            .unwrap();
        let mut body = Vec::new();
        stream.read_to_end(&mut body).unwrap();
        server.stop();
        let text = String::from_utf8_lossy(&body);
        assert!(
            text.contains("HTTP/1.1 200") && text.contains("MathMLElement"),
            "{text:.400}"
        );
        let _ = std::fs::remove_dir_all(&tmp);
    }
}
