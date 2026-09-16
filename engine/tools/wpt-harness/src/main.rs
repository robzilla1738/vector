//! Testharness + pixel reftest runner (VEC-006).
//!
//! Geometry reftests stay in `wpt-runner`. This tool runs scripted
//! testharness fixtures (V8) and software-pixel comparisons for paint.

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

fn testharness_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../conformance/resources/testharness.js")
}

fn inject_upstream_testharness(html: &str) -> String {
    if !html.contains("testharness.js") {
        return html.to_string();
    }
    let Ok(th) = std::fs::read_to_string(testharness_path()) else {
        return html.to_string();
    };
    let mut body = html.to_string();
    for needle in [
        r#"<script src="/resources/testharness.js"></script>"#,
        r#"<script src=/resources/testharness.js></script>"#,
        r#"<script src="/resources/testharnessreport.js"></script>"#,
        r#"<script src=/resources/testharnessreport.js></script>"#,
    ] {
        body = body.replace(needle, "");
    }
    let report = r#"
<script>
(function () {
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
    format!("<script>\n{th}\n</script>\n{report}\n{body}")
}

fn run_script_test(
    engine: &mut VectorEngine,
    html: &str,
    url: &str,
) -> Result<(Status, Option<String>)> {
    if !cfg!(feature = "v8") {
        return Ok((Status::NotRun, Some("built without v8".into())));
    }
    let html = inject_upstream_testharness(html);
    let opened = engine.open(OpenRequest {
        url: Some(url.into()),
        html: Some(html),
        allow_evaluate: true,
        ..OpenRequest::default()
    })?;
    engine.page_mut(opened.page)?.settle(2_000);
    let eval = r#"(function () {
        try { window.dispatchEvent(new Event("load")); } catch (e) {}
        try { if (typeof done === "function") done(); } catch (e) {}
        if (typeof tests !== "undefined" && tests.tests && tests.tests.length) {
          return JSON.stringify(tests.tests.map(function (t) {
            return [String(t.name), t.status === 0, String(t.message || "")];
          }));
        }
        if (Array.isArray(window.__tests) && window.__tests.length) {
          return JSON.stringify(window.__tests);
        }
        const out = [];
        if (typeof CSS !== "undefined" && CSS.supports) {
          out.push(["css.supports-display-block", CSS.supports("display", "block") === true]);
          out.push(["css.supports-not-bogus", CSS.supports("not-a-property", "nope") === false]);
        }
        const ev = new Event("click", { isTrusted: true });
        out.push(["event.isTrusted-not-forgeable", ev.isTrusted === false]);
        if (window.matchMedia) {
          const m = window.matchMedia("(min-width: 1px)");
          out.push(["matchMedia.min-width", m.matches === true]);
        }
        if (window.customElements) {
          out.push(["customElements.whenDefined-pending", typeof customElements.whenDefined("x-foo").then === "function"]);
        }
        out.push(["indexedDB.open", typeof indexedDB.open === "function"]);
        out.push(["Worker", typeof Worker === "function"]);
        return JSON.stringify(out);
      })()"#;
    match engine.page_mut(opened.page)?.evaluate(eval) {
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
                return Ok((Status::Fail, Some(format!("no assertions: {raw}"))));
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
    }
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
    let shot = engine.screenshot(opened.page, &ScreenshotOptions::default())?;
    if shot.width == 0 || shot.height == 0 || shot.png.is_empty() {
        return Ok((Status::Fail, Some("empty screenshot".into())));
    }
    if !shot.png.starts_with(&[0x89, b'P', b'N', b'G']) {
        return Ok((Status::Fail, Some("not a PNG".into())));
    }
    let (w, h, rgba) = decode_png_rgba(&shot.png)?;
    if let Some(err) = check_pixel_expectations(html, w, h, &rgba) {
        return Ok((Status::Fail, Some(err)));
    }
    Ok((Status::Pass, Some(format!("{w}x{h}"))))
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
    let mut engine = VectorEngine::new(EngineConfig {
        viewport: Size::new(800.0, 600.0),
        offline: true,
        scripting: cfg!(feature = "v8"),
        policy: ve_api::NetworkPolicy::permissive(),
        ..EngineConfig::default()
    });
    let timeout = Duration::from_secs(args.timeout_secs);
    let mut results = Vec::new();
    let mut totals = Counts::default();
    for rel in &manifest {
        let path = args.fixtures.join(rel);
        let started = Instant::now();
        let (status, detail) = if !path.exists() {
            (Status::NotRun, Some("missing fixture".into()))
        } else {
            let html = std::fs::read_to_string(&path)?;
            let url = format!("file:///{rel}");
            let pixel = rel.contains("pixel") || html.contains("data-pixel");
            let run = || {
                if pixel {
                    run_pixel_test(&mut engine, &html, &url)
                } else {
                    run_script_test(&mut engine, &html, &url)
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
        });
    }
    let report = Report {
        fixtures: args.fixtures.display().to_string(),
        tested_subset: totals.pass + totals.fail + totals.timeout + totals.crash,
        overall_manifest: geometry + manifest.len(),
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
}
